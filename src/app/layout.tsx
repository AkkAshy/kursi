import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Providers } from "./providers";

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Kursi - Платформа онлайн курсов",
  description: "Создавайте и продавайте онлайн курсы легко",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={nunito.variable}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
