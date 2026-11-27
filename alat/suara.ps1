<#
Merekam suara Indonesia bawaan Windows menjadi WAV.

Windows menyimpan mesin suara id-ID (M1057Andika) di Speech_OneCore, dan mesin
itu tidak terdaftar untuk System.Speech biasa. Jembatan WinRT di bawah bisa
memakainya tanpa memasang apa pun.

    powershell -NoProfile -File alat/suara.ps1 -Teks "..." -Keluar keluar.wav
#>
param(
  [Parameter(Mandatory = $true)][string]$Teks,
  [Parameter(Mandatory = $true)][string]$Keluar,
  [string]$Suara = "Microsoft Andika",
  [int]$Laju = 0
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Runtime.WindowsRuntime

$asTaskGenerik = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq "IAsyncOperation``1"
  })[0]

function Tunggu($operasi, [Type]$tipe) {
  $tugas = $asTaskGenerik.MakeGenericMethod($tipe).Invoke($null, @($operasi))
  $tugas.Wait()
  return $tugas.Result
}

$null = [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime]
$null = [Windows.Media.SpeechSynthesis.SpeechSynthesisStream, Windows.Media, ContentType = WindowsRuntime]

$sintesis = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer

$id = $Suara
$pilihan = $null
foreach ($v in [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices) {
  if ($v.DisplayName -like "*Andika*") { $pilihan = $v; break }
}
if ($null -eq $pilihan) {
  throw "Suara Indonesia tidak ditemukan. Yang ada: " + (([Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | ForEach-Object { $_.DisplayName }) -join ", ")
}
$sintesis.Voice = $pilihan

if ($Laju -ne 0) {
  $sintesis.Options.SpeakingRate = 1.0 + ($Laju / 100.0)
}

$aliran = Tunggu ($sintesis.SynthesizeTextToStreamAsync($Teks)) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])

$pembaca = New-Object Windows.Storage.Streams.DataReader($aliran)
$null = Tunggu ($pembaca.LoadAsync([uint32]$aliran.Size)) ([uint32])

$buffer = New-Object byte[] $aliran.Size
$pembaca.ReadBytes($buffer)

[System.IO.File]::WriteAllBytes($Keluar, $buffer)

$pembaca.Dispose()
$aliran.Dispose()
$sintesis.Dispose()

Write-Output ("OK " + $Keluar + " " + $buffer.Length + " B")