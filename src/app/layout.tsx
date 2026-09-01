import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import { siteConfig } from "@site";
import { themeInitScript } from "@/lib/theme";
import { UiPrefsProvider } from "@/components/ui-prefs";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { FloatingTools } from "@/components/FloatingTools";
import { DrawerBackdrop } from "@/components/DrawerBackdrop";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.fullName} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.fullName} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: siteConfig.name }],
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.fullName,
    description: siteConfig.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#14161a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <head>
        {/* 首帧主题：先于渲染写入 data-theme，避免闪白 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body>
        <UiPrefsProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--brand)] focus:px-4 focus:py-2 focus:text-white"
          >
            跳到主内容
          </a>
          <div className="app-shell">
            <Sidebar />
            <DrawerBackdrop />
            <div className="main-content flex min-w-0 flex-col">
              <TopBar />
              <main id="main" className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </div>
          <FloatingTools />
        </UiPrefsProvider>
      </body>
    </html>
  );
}

