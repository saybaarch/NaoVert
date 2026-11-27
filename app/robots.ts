import type { MetadataRoute } from "next";
import { situs } from "@/lib/data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/gobiz", "/admin", "/api/"],
      },
    ],
    sitemap: `${situs.url}/sitemap.xml`,
    host: situs.url,
  };
}
