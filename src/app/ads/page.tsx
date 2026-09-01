import type { Metadata } from "next";
import { StaticPageView, staticMetadata } from "@/components/StaticPageView";

export const metadata: Metadata = staticMetadata("ads", "ads");

export default function Page() {
  return <StaticPageView slug="ads" />;
}
