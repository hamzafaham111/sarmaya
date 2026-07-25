import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "./globals.css";

// Three type roles (DESIGN.md): display serif for names/titles,
// Inter body, JetBrains Mono for every number.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sarmaya",
  description:
    "A personal investment research terminal — study businesses, value them with your own assumptions, record your thinking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: next-themes mutates <html> class pre-paint.
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} flex min-h-full flex-col font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
