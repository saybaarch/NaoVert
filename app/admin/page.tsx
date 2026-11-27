import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Panel admin",
  robots: { index: false, follow: false },
};

export default function HalamanAdmin() {
  redirect("/gobiz");
}
