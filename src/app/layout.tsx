import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TrainItNow - Premium English Learning",
  description: "Download theory, exercises, and take dynamic tests online.",
  icons: {
    icon: "/logo.png",
  }
};

import { LanguageProvider } from "@/components/LanguageContext";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap"
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.className}>
      <body>
        <Providers>
          <LanguageProvider>
            <Navbar />
            <main style={{ flex: 1, padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
              {children}
            </main>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
