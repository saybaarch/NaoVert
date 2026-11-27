"use client";

import { useEffect, useRef, useState } from "react";
import { Tanda } from "@/components/ikon";

/**
 * Tanda NaoVert sebagai benda tiga dimensi.
 *
 * Bentuknya meniru logo ASLI aplikasi (public/img/logo-asli.png), bukan tanda
 * yang dirancang ulang. Titik-titiknya diukur dari piksel berkas aslinya: dua
 * batang tebal yang bertemu di bawah, batang kiri krem, batang kanan tembaga,
 * masing masing miring sekitar 14 derajat dari tegak dengan ujung atas membulat.
 *
 * Kenapa tiga dimensi, bukan gambar biasa: logo asli punya dua warna pada dua
 * batang. Dimensi ketiga membuat pertemuan keduanya terbaca sebagai hasil
 * kedalaman, bukan tempelan warna. Itu satu-satunya alasan aset 3D ada di sini.
 *
 * Tidak memakai pustaka 3D. Adegannya dua benda dengan satu lampu; menarik
 * tiga.js sebesar ratusan kilobita untuk itu akan membebani halaman. Seluruh
 * mesin gambar ditulis langsung dengan WebGL, beratnya beberapa kilobita.
 *
 * Perilakunya dijaga:
 *   - responsive: kanvas mengikuti lebar wadahnya, bukan angka piksel tetap
 *   - bisa digerakkan: diseret (mouse, sentuh, pen) atau tombol panah, dengan
 *     kelambatan halus setelah dilepas
 *   - berhenti menggambar saat tidak terlihat di layar
 *   - berhenti ayun otomatis bila pengguna memilih mengurangi gerakan, tetap
 *     bisa diputar manual
 *   - ukuran piksel dibatasi 2x supaya tidak membebani layar beresolusi tinggi
 *   - bila WebGL tidak tersedia, tanda dua dimensi ditampilkan, bukan kotak kosong
 */

type Mat4 = Float32Array;

const VERTEX = `
attribute vec3 a_pos;
attribute vec3 a_normal;
uniform mat4 u_mvp;
uniform mat4 u_model;
varying vec3 v_normal;
varying vec3 v_world;
void main() {
  vec4 dunia = u_model * vec4(a_pos, 1.0);
  v_world = dunia.xyz;
  v_normal = mat3(u_model) * a_normal;
  gl_Position = u_mvp * vec4(a_pos, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
varying vec3 v_normal;
varying vec3 v_world;
uniform vec3 u_tinta;
uniform vec3 u_tembaga;
uniform float u_aksen;

void main() {
  vec3 n = normalize(v_normal);
  vec3 lihat = normalize(vec3(0.0, 0.0, 3.2) - v_world);

  // Satu lampu utama dari kiri atas, satu pengisi dingin dari kanan bawah.
  vec3 lampu = normalize(vec3(-0.55, 0.75, 0.85));
  float utama = max(dot(n, lampu), 0.0);
  vec3 isi = normalize(vec3(0.7, -0.5, 0.3));
  float pengisi = max(dot(n, isi), 0.0) * 0.28;

  // Kilau sempit hanya di sisi yang menghadap kamera.
  float kilau = pow(max(dot(reflect(-lampu, n), lihat), 0.0), 42.0) * 0.32;

  vec3 dasar = mix(u_tinta, u_tembaga, u_aksen);
  vec3 warna = dasar * (0.30 + utama * 0.82 + pengisi) + kilau;

  gl_FragColor = vec4(warna, 1.0);
}`;

/* ── aljabar matriks ───────────────────────────────────────────────────── */

function identitas(): Mat4 {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function kalikan(a: Mat4, b: Mat4): Mat4 {
  const o = new Float32Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      o[i * 4 + j] =
        a[0 * 4 + j] * b[i * 4 + 0] +
        a[1 * 4 + j] * b[i * 4 + 1] +
        a[2 * 4 + j] * b[i * 4 + 2] +
        a[3 * 4 + j] * b[i * 4 + 3];
    }
  }
  return o;
}

function geser(x: number, y: number, z: number): Mat4 {
  const m = identitas();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}

function putarZ(t: number): Mat4 {
  const c = Math.cos(t), s = Math.sin(t);
  const m = identitas();
  m[0] = c; m[1] = s;
  m[4] = -s; m[5] = c;
  return m;
}

function putarY(t: number): Mat4 {
  const c = Math.cos(t), s = Math.sin(t);
  const m = identitas();
  m[0] = c; m[2] = -s;
  m[8] = s; m[10] = c;
  return m;
}

function putarX(t: number): Mat4 {
  const c = Math.cos(t), s = Math.sin(t);
  const m = identitas();
  m[5] = c; m[6] = s;
  m[9] = -s; m[10] = c;
  return m;
}

function perspektif(fov: number, rasio: number, dekat: number, jauh: number): Mat4 {
  const f = 1 / Math.tan(fov / 2);
  const m = new Float32Array(16);
  m[0] = f / rasio;
  m[5] = f;
  m[10] = (jauh + dekat) / (dekat - jauh);
  m[11] = -1;
  m[14] = (2 * jauh * dekat) / (dekat - jauh);
  return m;
}

/* ── bentuk ────────────────────────────────────────────────────────────── */

/** Balok dengan ukuran penuh, berpusat di titik nol. */
function balok(w: number, h: number, d: number) {
  const x = w / 2, y = h / 2, z = d / 2;
  const p = [
    [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z],
    [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
  ];
  const f = [
    [0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7],
    [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0],
  ];
  const norm = [
    [0, 0, 1], [0, 0, -1], [-1, 0, 0],
    [1, 0, 0], [0, 1, 0], [0, -1, 0],
  ];

  const pos: number[] = [], nor: number[] = [], idx: number[] = [];
  for (let s = 0; s < f.length; s++) {
    const dasar = pos.length / 3;
    for (const vi of f[s]) {
      pos.push(p[vi][0], p[vi][1], p[vi][2]);
      nor.push(norm[s][0], norm[s][1], norm[s][2]);
    }
    idx.push(dasar, dasar + 1, dasar + 2, dasar, dasar + 2, dasar + 3);
  }
  return { pos, nor, idx };
}

/** Bola bersegmen rendah, cukup untuk tutup bulat di ujung batang. */
function bola(r: number, segmen = 18, cincin = 12) {
  const pos: number[] = [], nor: number[] = [], idx: number[] = [];
  for (let i = 0; i <= cincin; i++) {
    const v = (i / cincin) * Math.PI;
    for (let j = 0; j <= segmen; j++) {
      const u = (j / segmen) * Math.PI * 2;
      const nx = Math.sin(v) * Math.cos(u);
      const ny = Math.cos(v);
      const nz = Math.sin(v) * Math.sin(u);
      pos.push(nx * r, ny * r, nz * r);
      nor.push(nx, ny, nz);
    }
  }
  for (let i = 0; i < cincin; i++) {
    for (let j = 0; j < segmen; j++) {
      const a = i * (segmen + 1) + j;
      const b = a + segmen + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return { pos, nor, idx };
}

/*
 * Geometri diambil dari berkas logo asli, bukan dari dugaan. Titik-titiknya
 * diukur dari piksel public/img/logo-asli.png: kanvas 256px, kedua batang
 * membentang dari y=40 ke y=218, pusat kanvas (128,129). Sumbu Y dibalik
 * karena WebGL menganggap atas sebagai +1, lalu dibagi 90 supaya tanda muat
 * nyaman dalam ruang kamera.
 */
const PUSAT = { x: 128, y: 129 };
const SKALA = 1 / 90;

function keDunia(x: number, y: number) {
  return [(x - PUSAT.x) * SKALA, -(y - PUSAT.y) * SKALA] as const;
}

type Batang = {
  /** Ujung atas dan bawah dalam koordinat kanvas 256px logo asli. */
  atas: readonly [number, number];
  bawah: readonly [number, number];
  /** Lebar batang hasil ukur piksel (51px pada kanvas 256). */
  lebar: number;
  /** 0 = batang kiri krem, 1 = batang kanan tembaga. */
  aksen: number;
};

const BATANG: Batang[] = [
  { atas: [73.5, 40], bawah: [118, 218], lebar: 51, aksen: 0 },
  { atas: [181.5, 40], bawah: [137, 218], lebar: 51, aksen: 1 },
];
const TEBAL = 0.42;   // ketebalan ke arah kamera; logo asli pipih, ini cukup

/* ── komponen ──────────────────────────────────────────────────────────── */

export default function Tanda3D({
  kelas,
}: {
  /** Kelas pembungkus; wadahnya menentukan ukuran kanvas, jadi ikut responsif. */
  kelas?: string;
}) {
  const kanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [siap, setSiap] = useState(false);
  const [gagal, setGagal] = useState(false);

  // Sudut tambahan hasil seretan disimpan di ref supaya tidak memicu render
  // ulang React; animasi membacanya langsung tiap bingkai.
  const gerak = useRef({ yaw: 0, pitch: 0, lajuYaw: 0, lajuPitch: 0 });
  const seret = useRef<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const kanvas = kanvasRef.current;
    if (!kanvas) return;

    const gl = kanvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });

    if (!gl) {
      setGagal(true);
      return;
    }

    /* program */
    const buatShader = (tipe: number, sumber: string) => {
      const s = gl.createShader(tipe)!;
      gl.shaderSource(s, sumber);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, buatShader(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(prog, buatShader(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setGagal(true);
      return;
    }
    gl.useProgram(prog);

    const lokasi = {
      pos: gl.getAttribLocation(prog, "a_pos"),
      nor: gl.getAttribLocation(prog, "a_normal"),
      mvp: gl.getUniformLocation(prog, "u_mvp"),
      model: gl.getUniformLocation(prog, "u_model"),
      tinta: gl.getUniformLocation(prog, "u_tinta"),
      tembaga: gl.getUniformLocation(prog, "u_tembaga"),
      aksen: gl.getUniformLocation(prog, "u_aksen"),
    };

    /* benda benda dalam adegan */
    type Benda = {
      buf: WebGLBuffer; nor: WebGLBuffer; indeks: WebGLBuffer; jumlah: number;
      model: Mat4; aksen: number;
    };
    const benda: Benda[] = [];

    const tambah = (
      bentuk: { pos: number[]; nor: number[]; idx: number[] },
      model: Mat4,
      aksen: number,
    ) => {
      const vb = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, vb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bentuk.pos), gl.STATIC_DRAW);

      const nb = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, nb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bentuk.nor), gl.STATIC_DRAW);

      const ib = gl.createBuffer()!;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bentuk.idx), gl.STATIC_DRAW);

      benda.push({ buf: vb, nor: nb, indeks: ib, jumlah: bentuk.idx.length, model, aksen });
    };

    // Satu batang: balok memanjang antara dua ujung, plus bola kecil di
    // ujung atas sebagai tutup bulat, meniru lengkung ujung pada berkas asli.
    const tambahBatang = (b: Batang) => {
      const atas = keDunia(b.atas[0], b.atas[1]);
      const bawah = keDunia(b.bawah[0], b.bawah[1]);
      const dx = atas[0] - bawah[0];
      const dy = atas[1] - bawah[1];
      const panjang = Math.hypot(dx, dy);
      const ux = dx / panjang, uy = dy / panjang;

      const sudut = Math.atan2(-ux, uy);
      const tengahX = (atas[0] + bawah[0]) / 2;
      const tengahY = (atas[1] + bawah[1]) / 2;

      const model = kalikan(geser(tengahX, tengahY, 0), putarZ(sudut));
      tambah(balok(b.lebar * SKALA, panjang - b.lebar * SKALA * 0.5, TEBAL), model, b.aksen);

      // Tutup bulat di ujung atas; setengahnya tenggelam ke dalam balok.
      tambah(bola((b.lebar / 2) * SKALA * 0.98), geser(atas[0], atas[1], 0), b.aksen);
    };

    for (const b of BATANG) tambahBatang(b);

    /* warna dari tema, dibaca ulang saat tema berganti */
    const bacaWarna = () => {
      const g = getComputedStyle(document.documentElement);
      const keRgb = (v: string, cadangan: [number, number, number]) => {
        const t = v.trim();
        const m = t.match(/^#?([0-9a-f]{6})$/i);
        if (m) {
          const n = parseInt(m[1], 16);
          return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
        }
        const r = t.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
        if (r) return [+r[1] / 255, +r[2] / 255, +r[3] / 255];
        return cadangan;
      };
      gl.uniform3fv(lokasi.tinta, keRgb(g.getPropertyValue("--tinta"), [0.93, 0.92, 0.89]));
      gl.uniform3fv(lokasi.tembaga, keRgb(g.getPropertyValue("--tembaga"), [0.75, 0.49, 0.31]));
    };
    bacaWarna();

    /* ukuran kanvas: mengikuti lebar wadah, jadi ikut responsif */
    const aturUkuran = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const sisi = kanvas.clientWidth;
      if (sisi === 0) return;
      const p = Math.round(sisi * dpr);
      if (kanvas.width !== p || kanvas.height !== p) {
        kanvas.width = p;
        kanvas.height = p;
      }
      gl.viewport(0, 0, kanvas.width, kanvas.height);
    };
    aturUkuran();

    const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let hidup = true;
    let terlihat = true;

    const gambar = (waktu: number) => {
      if (!hidup || !terlihat) return;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);

      const g = gerak.current;

      // Seretan dilepas: sisa laju dipakai pelan-pelan (kelambatan).
      if (!seret.current) {
        g.yaw += g.lajuYaw;
        g.pitch += g.lajuPitch;
        g.lajuYaw *= 0.94;
        g.lajuPitch *= 0.94;
        // Setelah laju habis, posisi pelan pelan kembali ke ayunan dasar.
        if (Math.abs(g.lajuYaw) < 0.0005 && Math.abs(g.lajuPitch) < 0.0005) {
          g.yaw *= 0.985;
          g.pitch *= 0.985;
        }
      }
      g.pitch = Math.max(-0.85, Math.min(0.85, g.pitch));

      const t = kurangiGerak ? 0.62 : waktu / 1000;

      // Ayunan dasar terbatas, bukan putaran penuh. Putaran penuh pernah
      // dicoba: saat tanda tegak lurus layar bentuknya nyaris lenyap. Yang
      // boleh berputar bebas hanyalah hasil seretan pengguna.
      const ayun = Math.sin(t * 0.30) * 0.30 + 0.22;
      const putaran = putarY(ayun + g.yaw);
      const miring = putarX(-0.13 + Math.sin(t * 0.44) * 0.055 + g.pitch);

      const proyeksi = perspektif(0.62, 1, 0.1, 40);
      const kamera = geser(0, 0, -3.5);

      for (const b of benda) {
        const model = kalikan(kalikan(putaran, miring), b.model);
        const mvp = kalikan(proyeksi, kalikan(kamera, model));

        gl.uniformMatrix4fv(lokasi.mvp, false, mvp);
        gl.uniformMatrix4fv(lokasi.model, false, model);
        gl.uniform1f(lokasi.aksen, b.aksen);

        gl.bindBuffer(gl.ARRAY_BUFFER, b.buf);
        gl.enableVertexAttribArray(lokasi.pos);
        gl.vertexAttribPointer(lokasi.pos, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, b.nor);
        gl.enableVertexAttribArray(lokasi.nor);
        gl.vertexAttribPointer(lokasi.nor, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.indeks);
        gl.drawElements(gl.TRIANGLES, b.jumlah, gl.UNSIGNED_SHORT, 0);
      }

      if (!kurangiGerak) requestAnimationFrame(gambar);
    };

    // Bila mengurangi gerakan tidak ada loop otomatis; layar digambar ulang
    // hanya saat ada input atau ukuran berubah.
    const gambarSekali = () => {
      if (kurangiGerak) requestAnimationFrame(gambar);
    };

    setSiap(true);
    requestAnimationFrame(gambar);

    /* ── seret: mouse, sentuh, dan pen lewat satu jalur Pointer Events ── */
    const onDown = (e: PointerEvent) => {
      seret.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      gerak.current.lajuYaw = 0;
      gerak.current.lajuPitch = 0;
      kanvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = seret.current;
      if (!s || s.id !== e.pointerId) return;
      const g = gerak.current;
      // 0,0075 radian per piksel: satu sapuan 200 piksel memutar sekitar 30
      // derajat, cukup untuk melihat sisi tanpa bikin pusing.
      const dY = (e.clientX - s.x) * 0.0075;
      const dX = (e.clientY - s.y) * 0.0075;
      g.yaw += dY;
      g.pitch = Math.max(-0.85, Math.min(0.85, g.pitch + dX));
      g.lajuYaw = dY * 0.9;
      g.lajuPitch = dX * 0.9;
      s.x = e.clientX;
      s.y = e.clientY;
      gambarSekali();
    };
    const onUp = (e: PointerEvent) => {
      if (seret.current?.id === e.pointerId) seret.current = null;
      gambarSekali();
    };

    kanvas.addEventListener("pointerdown", onDown);
    kanvas.addEventListener("pointermove", onMove);
    kanvas.addEventListener("pointerup", onUp);
    kanvas.addEventListener("pointercancel", onUp);

    /* keyboard: fokus dengan Tab, putar dengan panah, Home atau Esc untuk diam */
    const onKey = (e: KeyboardEvent) => {
      const g = gerak.current;
      const langkah = 0.16;
      if (e.key === "ArrowLeft") g.yaw -= langkah;
      else if (e.key === "ArrowRight") g.yaw += langkah;
      else if (e.key === "ArrowUp") g.pitch = Math.max(-0.85, g.pitch - langkah);
      else if (e.key === "ArrowDown") g.pitch = Math.min(0.85, g.pitch + langkah);
      else if (e.key === "Home" || e.key === "Escape") {
        g.yaw = 0; g.pitch = 0; g.lajuYaw = 0; g.lajuPitch = 0;
      } else return;
      e.preventDefault();
      gambarSekali();
    };
    kanvas.addEventListener("keydown", onKey);

    /* berhenti saat tidak terlihat, supaya baterai tidak terkuras */
    const io = new IntersectionObserver(
      (entri) => {
        terlihat = entri[0]?.isIntersecting ?? true;
        if (terlihat) gambarSekali();
      },
      { threshold: 0.05 },
    );
    io.observe(kanvas);

    const ro = new ResizeObserver(() => {
      aturUkuran();
      gambarSekali();
    });
    ro.observe(kanvas);

    return () => {
      hidup = false;
      io.disconnect();
      ro.disconnect();
      kanvas.removeEventListener("pointerdown", onDown);
      kanvas.removeEventListener("pointermove", onMove);
      kanvas.removeEventListener("pointerup", onUp);
      kanvas.removeEventListener("pointercancel", onUp);
      kanvas.removeEventListener("keydown", onKey);
      benda.forEach((b) => {
        gl.deleteBuffer(b.buf);
        gl.deleteBuffer(b.nor);
        gl.deleteBuffer(b.indeks);
      });
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  if (gagal) {
    // Tanpa WebGL tetap ada tanda (berkas asli), bukan ruang kosong.
    return (
      <div className={`grid aspect-square place-items-center text-tinta ${kelas ?? ""}`}>
        <Tanda ukuran={180} />
      </div>
    );
  }

  return (
    <div className={kelas ?? "w-full"}>
      <canvas
        ref={kanvasRef}
        role="img"
        aria-label="Tanda NaoVert tiga dimensi. Seret atau gunakan tombol panah untuk memutar."
        tabIndex={0}
        className="tanda-3d size-full max-h-full transition-opacity duration-700"
        style={{ opacity: siap ? 1 : 0 }}
      />
    </div>
  );
}
