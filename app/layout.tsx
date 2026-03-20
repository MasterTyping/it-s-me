import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "it-s-me – Robot Explorer",
  description: "Interactive 3-D robot arm built with Three.js and react-three-fiber",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
