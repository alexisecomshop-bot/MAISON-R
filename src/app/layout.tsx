import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getSettings, settingsToCssVars } from "@/lib/theme";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: {
      default: s.site_name,
      template: `%s — ${s.site_name}`,
    },
    description: s.hero_subtitle,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const style = settingsToCssVars(settings) as CSSProperties;

  return (
    <html lang="fr">
      <body style={style}>
        <Header settings={settings} />
        <main className="min-h-[calc(100vh-200px)]">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
