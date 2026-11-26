import type { MetadataRoute } from "next";
import { situs } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const sekarang = new Date();
  const halaman = ["", "/format", "/unduh", "/panduan", "/tentang"];

  return halaman.map((h) => ({
    url: `${situs.url}${h}`,
    lastModified: sekarang,
    changeFrequency: h === "" ? "monthly" : "yearly",
    priority: h === "" ? 1 : 0.7,
  }));
}
