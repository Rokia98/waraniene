import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tisses de Waraniene",
    short_name: "Waraniene",
    description:
      "Boutique en ligne des tisserands de Waraniene pour decouvrir et commander des textiles traditionnels senoufo.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f5ef",
    theme_color: "#9a3412",
    lang: "fr",
    categories: ["shopping", "lifestyle", "artisanat"],
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
      {
        src: "/icons/maskable-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Catalogue de textiles",
        short_name: "Produits",
        description: "Parcourir le catalogue de textiles senoufo",
        url: "/produits",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
      {
        name: "Artisans tisserands",
        short_name: "Artisans",
        description: "Decouvrir les artisans de Waraniene",
        url: "/artisans",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
      {
        name: "Mon panier",
        short_name: "Panier",
        description: "Voir mon panier d'achat",
        url: "/panier",
        icons: [{ src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
    ],
  };
}