import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PatternMind | Cognitive Pattern Challenges",
  description:
    "An elegant psychology-inspired cognitive challenge platform for pattern recognition, memory, logic, perception, and social prediction.",
  keywords: [
    "pattern recognition",
    "cognitive challenge",
    "brain score",
    "logic puzzles",
    "psychology",
    "visual perception",
  ],
  openGraph: {
    title: "PatternMind",
    description: "Can your brain see what others miss?",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06080d",
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
