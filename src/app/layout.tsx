import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { PlatformGuard } from "@/components/platform-guard";
import { MobileLayout } from "@/components/mobile-layout";
import "./globals.css";
import { isMobileDevice } from "@/utils/client";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal VOD",
  description: "Solicite novos filmes e séries, atualize o conteúdo existente ou relate problemas",
  openGraph: {
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMobile = isMobileDevice();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={manrope.className}>
        <Providers>
          <PlatformGuard>
            {isMobile ? (
                <MobileLayout>{children}</MobileLayout>
            ) : (
                children
            )}
          </PlatformGuard>
        </Providers>
      </body>
    </html>
  );
}