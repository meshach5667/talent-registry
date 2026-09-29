export default function manifest() {
  return {
    name: "Talent Registry | Pan-African Technical Talent Network",
    short_name: "TalentRegistry",
    description:
      "The professional discovery network for African engineers, architects, and technical leaders.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#059669",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Discover Talent",
        short_name: "Talent",
        description: "Search top engineers across Africa",
        url: "/talent",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Explore Organizations",
        short_name: "Organizations",
        description: "Browse companies and tech hubs across Africa",
        url: "/organizations",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "My Dashboard",
        short_name: "Dashboard",
        description: "View and manage your Professional Passport",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
