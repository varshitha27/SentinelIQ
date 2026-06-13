import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SentinelIQ — AI Project Failure Prediction",
  description: "Predict delivery risks before they become project failures.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f1117] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
