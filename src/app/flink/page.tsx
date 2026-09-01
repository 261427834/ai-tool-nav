import type { Metadata } from "next";
import { StaticPageView, staticMetadata } from "@/components/StaticPageView";

export const metadata: Metadata = staticMetadata("flink", "flink");

export default function Page() {
  return <StaticPageView slug="flink" />;
}
