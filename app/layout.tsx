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
  title: "Aktivity — a night to remember",
  description:
    "Describe, draw, act it out. A party game for 2–6 teams on one phone.",
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
    <html lang="en">
      <body className="bg-paper text-ink font-sans antialiased [&_button]:cursor-pointer [&_button]:[-webkit-tap-highlight-color:transparent] [&_button]:touch-manipulation [&_button:disabled]:opacity-[.38] [&_button:disabled]:cursor-not-allowed [&_button]:outline-offset-[5px] [&_input]:outline-offset-[5px] [&_a]:outline-offset-[5px] [&_:focus-visible]:outline-[3px_solid_#aa83d8] [&_h1:focus]:outline-none [&_button]:transition-[background,transform,box-shadow] [&_button]:duration-[180ms] [&_button:active:not(:disabled)]:translate-y-[2px] [&_button_svg]:shrink-0 motion-reduce:[&_*]:animate-none! motion-reduce:[&_*]:transition-none!">
        {children}
      </body>
    </html>
  );
}
