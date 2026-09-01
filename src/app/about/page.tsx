import type { Metadata } from "next";
import { StaticPageView, staticMetadata } from "@/components/StaticPageView";

export const metadata: Metadata = staticMetadata("about", "about");

export default function Page() {
  return <StaticPageView slug="about" />;
}
