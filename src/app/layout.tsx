import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { FavorisProvider } from "@/contexts/FavorisContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import AppInitializer from "@/components/AppInitializer";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "Tissés de Waraniéné - Textiles Traditionnels Sénoufo",
  description: "Découvrez les magnifiques textiles traditionnels sénoufo de Waraniéné, Côte d'Ivoire. Boutique en ligne des artisans tisserands locaux.",
  keywords: "textile, sénoufo, waraniéné, côte d'ivoire, artisanat, tissage, tradition",
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
        </AppInitializer>
      </body>
    </html>
  );
}