import type { Metadata, Viewport } from "next";
import "@fontsource/nunito/latin-ext-400.css";
import "@fontsource/nunito/latin-ext-600.css";
import "@fontsource/nunito/latin-ext-700.css";
import "@fontsource/nunito/latin-ext-800.css";
import "@fontsource/nunito/latin-ext-900.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-600.css";
import "@fontsource/nunito/latin-700.css";
import "@fontsource/nunito/latin-800.css";
import "@fontsource/nunito/latin-900.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "Aktivity — večer, na ktorý nezabudnete",
  description:
    "Opisuj, kresli, predvádzaj. Slovenská párty hra pre 2 až 6 tímov na jednom mobile.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f9f6ef",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  );
}
