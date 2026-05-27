import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BiteDex",
  description: "A photo-based food card and pet feedback MVP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
