module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: { keys: env.array('APP_KEYS') },
  // Detrás de Traefik: confiar en X-Forwarded-* para cookies seguras del admin.
  proxy: { koa: true },
  url: env('PUBLIC_URL', ''),
});
