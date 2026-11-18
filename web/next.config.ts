import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  redirects: async () => [{ source: "/anuncios", destination: "/noticias", permanent: true }], // el nombre antiguo de la sección
};
export default config;
