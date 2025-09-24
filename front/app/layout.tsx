import type { Metadata } from "next";
import Navigation from './components/Navigation';
import "./globals.css";

export const metadata: Metadata = {
  title: "ASV Dfender",
  description: "ASV Defender System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="bg-white">
        <div className="relative min-h-screen">
          <Navigation />
          <main className="ml-[288px]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
