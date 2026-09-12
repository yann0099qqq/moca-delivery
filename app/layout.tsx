import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Moca Sushi | Cardápio Digital",
  description:
    "Cardápio digital do Moca Sushi com registro seguro de pedidos para entrega e retirada.",
  openGraph: {
    title: "Moca Sushi | Cardápio Digital",
    description: "Escolha seus itens e registre o pedido para entrega ou retirada.",
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Moca Sushi",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Moca Sushi — cardápio digital" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Moca Sushi | Cardápio Digital",
    description: "Escolha seus itens e registre o pedido para entrega ou retirada.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
