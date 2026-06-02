import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { FavorisProvider } from "@/contexts/FavorisContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import AppInitializer from "@/components/AppInitializer";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  applicationName: "Tisses de Waraniene",
  title: {
    default: "Tisses de Waraniene - Textiles Traditionnels Senoufo",
    template: "%s | Tisses de Waraniene",
  },
  description: "Decouvrez les magnifiques textiles traditionnels senoufo de Waraniene, Cote d'Ivoire. Boutique en ligne des artisans tisserands locaux.",
  keywords: "textile, sénoufo, waraniéné, côte d'ivoire, artisanat, tissage, tradition",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tisses de Waraniene",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icons/icon-192.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#9a3412",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-gray-50">
        <AppInitializer>
          <AuthProvider>
            <FavorisProvider>
            <CartProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '8px',
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                  },
                },
                loading: {
                  style: {
                    background: '#3B82F6',
                  },
                },
              }}
            />
          </CartProvider>
          </FavorisProvider>
          </AuthProvider>
          <PWAInstallPrompt />
        </AppInitializer>
      </body>
    </html>
  );
}