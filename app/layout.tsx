import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secret Project 3D",
  description: "A 3D FPP/TPP Game",
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
