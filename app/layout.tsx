import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Lingayat Matrimonial",
  description: "Matrimonial platform for Lingayat Mali community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="page-wrapper">
        <div className="page-content">
          {children}
        </div>
      </body>
    </html>
  );
}
