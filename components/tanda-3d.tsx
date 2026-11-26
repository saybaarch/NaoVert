"use client";

import { useEffect, useRef, useState } from "react";
import { Tanda } from "@/components/ikon";

/**
 * Tanda NaoVert sebagai benda tiga dimensi.
 *
 * Kenapa tiga dimensi, bukan gambar biasa: tanda ini dua batang yang bertemu
 * di satu simpul. Dimensi ketiga membuat kedalaman tembaga di titik temu
 * terlihat sebagai hasil pertemuan, bukan sebagai tempelan. Itu satu-satunya
 * alasan aset 3D ada di sini.
 *
 * Tidak memakai pustaka 3D. Adegannya satu benda dengan satu lampu, dan
 * menarik tiga.js sebesar ratusan kilobita untuk itu akan membebani halaman
 * tanpa manfaat. Seluruh mesin gambar di bawah ini ditulis langsung dengan
 * WebGL, jadi beratnya hanya beberapa kilobita.
 *
 * Perilakunya dijaga:
 *   - berhenti menggambar saat tidak terlihat di layar
 *   - berhenti total bila pengguna memilih mengurangi gerakan
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

/** Bola bersegmen rendah, cukup untuk simpul tembaga. */
function bola(r: number, segmen = 20, cincin = 14) {
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
 * Geometri tanda, memakai koordinat yang sama dengan components/ikon.tsx
 * (kanvas 32x32), lalu dipusatkan dan dibalik sumbu Y karena WebGL
 * menganggap atas sebagai +1.
 */
const PUSAT = { x: 16.35, y: 16.9 };
const SKALA = 1 / 14.4;

function keDunia(x: number, y: number) {
  return [(x - PUSAT.x) * SKALA, -(y - PUSAT.y) * SKALA] as const;
}

const SIMPUL = { x: 16, y: 25.6 };
const BATANG = [
  { atas: { x: 5.9, y: 6.2 }, lebar: 3.8 },
  { atas: { x: 26.1, y: 5.2 }, lebar: 5.1 },
];
const JARI_SIMPUL = 3.0;
const TEBAL = 0.62;

/* ── komponen ──────────────────────────────────────────────────────────── */

export default function Tanda3D({ ukuran = 420 }: { ukuran?: number }) {
  const kanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [siap, setSiap] = useState(false);
  const [gagal, setGagal] = useState(false);

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

    const tambah = (bentuk: { pos: number[]; nor: number[]; idx: number[] }, model: Mat4, aksen: number) => {
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

    // Dua batang.
    const simpul = keDunia(SIMPUL.x, SIMPUL.y);
    for (const b of BATANG) {
      const atas = keDunia(b.atas.x, b.atas.y);
      const dx = atas[0] - simpul[0];
      const dy = atas[1] - simpul[1];
      const panjang = Math.hypot(dx, dy);
      const ux = dx / panjang, uy = dy / panjang;

      // Balok memanjang di sumbu Y, lalu diputar agar menunjuk ke titik atas.
      const sudut = Math.atan2(-ux, uy);
      const tengahX = (atas[0] + simpul[0]) / 2;
      const tengahY = (atas[1] + simpul[1]) / 2;

      const model = kalikan(geser(tengahX, tengahY, 0), putarZ(sudut));
      tambah(
        balok(b.lebar * SKALA, panjang, TEBAL),
        model,
        0,
      );
    }

    // Simpul tembaga. Sedikit lebih tebal dari batang supaya menonjol.
    tambah(
      bola(JARI_SIMPUL * SKALA, 24, 16),
      geser(simpul[0], simpul[1], 0),
      1,
    );

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

    const pengamat = new MutationObserver(bacaWarna);
    pengamat.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });

    /* ukuran kanvas */
    const aturUkuran = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const sisi = kanvas.clientWidth || ukuran;
      kanvas.width = Math.round(sisi * dpr);
      kanvas.height = Math.round(sisi * dpr);
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

      const t = kurangiGerak ? 0.62 : waktu / 1000;

      // Ayunan terbatas, bukan putaran penuh.
      //
      // Putaran penuh pernah dicoba: saat tanda tegak lurus terhadap layar,
      // lebarnya menyusut sampai hampir hilang, dan logo yang seharusnya
      // jadi pengenal justru lenyap sekejap. Karena itu putarannya dibatasi
      // pada busur 34 derajat yang selalu menyisakan bentuk terbaca, ditambah
      // miring halus supaya kedalamannya tetap terasa.
      const ayun = Math.sin(t * 0.30) * 0.30 + 0.22;
      const putaran = putarY(ayun);
      const miring = putarX(-0.13 + Math.sin(t * 0.44) * 0.055);

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

    setSiap(true);
    requestAnimationFrame(gambar);

    /* berhenti saat tidak terlihat, supaya baterai tidak terkuras */
    const io = new IntersectionObserver(
      (entri) => {
        terlihat = entri[0]?.isIntersecting ?? true;
        if (terlihat && !kurangiGerak) requestAnimationFrame(gambar);
      },
      { threshold: 0.05 },
    );
    io.observe(kanvas);

    const ro = new ResizeObserver(() => {
      aturUkuran();
      if (kurangiGerak) requestAnimationFrame(gambar);
    });
    ro.observe(kanvas);

    return () => {
      hidup = false;
      pengamat.disconnect();
      io.disconnect();
      ro.disconnect();
      benda.forEach((b) => {
        gl.deleteBuffer(b.buf);
        gl.deleteBuffer(b.nor);
        gl.deleteBuffer(b.indeks);
      });
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [ukuran]);

  if (gagal) {
    // Tanpa WebGL tetap ada tanda, bukan ruang kosong.
    return (
      <div className="grid place-items-center text-tinta" style={{ width: ukuran, height: ukuran }}>
        <Tanda ukuran={ukuran * 0.7} />
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: ukuran, height: ukuran }}>
      <canvas
        ref={kanvasRef}
        width={ukuran}
        height={ukuran}
        aria-hidden="true"
        className="size-full transition-opacity duration-700"
        style={{ opacity: siap ? 1 : 0 }}
      />
    </div>
  );
}
