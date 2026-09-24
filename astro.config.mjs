import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// BL-004: lastmod por post en el sitemap, usando el pubDate de cada insight.
// Se lee el frontmatter directamente del disco (no via astro:content, que no
// esta disponible en este archivo de configuracion) para construir un mapa
// slug -> fecha ISO, una sola vez, antes de que arranque el build.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const insightsDir = path.join(__dirname, 'src/content/insights');
const insightPubDates = {};
if (fs.existsSync(insightsDir)) {
  for (const entry of fs.readdirSync(insightsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const indexPath = path.join(insightsDir, entry.name, 'index.md');
    if (!fs.existsSync(indexPath)) continue;
    const raw = fs.readFileSync(indexPath, 'utf-8');
    const match = raw.match(/^pubDate:\s*(\S+)\s*$/m);
    if (match) {
      // El slug real que genera Astro para colecciones legacy es el nombre
      // de carpeta en minusculas (verificado empiricamente en EXP-004b).
      insightPubDates[entry.name.toLowerCase()] = new Date(match[1]).toISOString();
    }
  }
}

// https://astro.build/config
export default defineConfig({
  site: 'https://salvadoribarra.tech',
  // BL-008: forma canonica de URL fijada explicitamente en 'never' (sin
  // diagonal final), para que coincida con la convencion ya usada por todos
  // los enlaces internos del sitio (ej. `/insights/${post.slug}`). Antes no
  // se definia y Astro usaba el default 'ignore', lo que permitia que
  // Google indexara la misma pagina en dos formas de URL distintas
  // (con y sin '/' final), dividiendo la senal de posicionamiento entre
  // ambas -- ver experiments/BACKLOG.md BL-008 y experiments/EXP-010.
  trailingSlash: 'never',
  integrations: [
    sitemap({
      serialize(item) {
        // BL-008: normaliza toda URL del sitemap a la forma canonica sin
        // diagonal final (excepto la raiz '/'), independientemente de la
        // forma que haya generado el integration por defecto, para que el
        // sitemap nunca vuelva a anunciarle a Google la variante con '/'
        // que ya no queremos que indexe.
        const url = new URL(item.url);
        if (url.pathname !== '/' && url.pathname.endsWith('/')) {
          url.pathname = url.pathname.slice(0, -1);
          item = { ...item, url: url.toString() };
        }
        const match = item.url.match(/\/insights\/([^/]+)\/?$/);
        if (match) {
          const lastmod = insightPubDates[match[1].toLowerCase()];
          if (lastmod) {
            return { ...item, lastmod };
          }
        }
        return item;
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});