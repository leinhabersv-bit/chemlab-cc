import type { Metadata, Viewport } from "next";
import { Fraunces, Bricolage_Grotesque, Instrument_Serif, Syne, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { palette } from "../tokens";
import "./globals.css";

/**
 * Fonts: a characterful variable serif for display, a refined humanist sans for
 * body, and a mono used only for data/HUD readouts. Swap freely, but keep the
 * CSS variable names: tailwind.config.ts reads --font-display / --font-sans / --font-mono.
 */
const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--fd-0",
  display: "swap",
});

/* Randomiser typefaces: variant.ts points --font-display at one of --fd-0..3 */
const fd1 = Bricolage_Grotesque({ subsets: ["latin"], variable: "--fd-1", display: "swap" });
const fd2 = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--fd-2", display: "swap" });
const fd3 = Syne({ subsets: ["latin"], variable: "--fd-3", display: "swap" });

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Assay: the lab notebook that runs your experiments",
  description:
    "Describe a protocol in plain language, review the plan, and watch every step run on your instruments, logged and reproducible.",
  openGraph: {
    title: "Assay: experiments that run themselves",
    description: "The lab notebook that talks to your instruments.",
    type: "website",
    // Add a still of the 3D hero here for social sharing:
    // images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets safe-area insets work on notched phones
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: palette.bench[950] },
    { media: "(prefers-color-scheme: light)", color: palette.enamel[100] },
  ],
};

/**
 * Runs before first paint: restores a saved theme choice so there is no flash.
 * With no saved choice, the OS preference applies (handled in CSS).
 */
const themeBoot = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // is-loading: scroll-locked until the intro finishes (page.tsx removes it).
      // suppressHydrationWarning: client code edits <html> classes and data attributes.
      className={`${display.variable} ${fd1.variable} ${fd2.variable} ${fd3.variable} ${sans.variable} ${mono.variable} is-loading`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        {/* No JS: never trap the visitor behind the loader */}
        <noscript>
          <style>{`.hm-loader{display:none!important}html.is-loading,html.is-loading body{overflow:auto!important}`}</style>
        </noscript>
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
