import { Tilt_Neon } from "next/font/google";
import "./globals.css";

const tiltNeon = Tilt_Neon({ subsets: ["latin"] });

export const metadata = {
  title: "Família é para sempre",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={tiltNeon.className}>{children}</body>
    </html>
  );
}
