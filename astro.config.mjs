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
  // EXP-014 (corrige BL-008/EXP-010): forma canonica de URL CON diagonal
  // final. EXP-010 habia fijado 'never', pero Astro genera cada pagina en
  // formato directorio (insights/<slug>/index.html) y Netlify sirve los
  // directorios redirigiendo con 301 /insights/<slug> -> /insights/<slug>/.
  // Resultado: canonical, sitemap y enlaces internos apuntaban a una URL que
  // redirige, y Google elegia la version con '/' ignorando el canonical
  // (alerta "Pagina con redireccion" de Search Console, 2026-10-07).
  // 'always' alinea las senales declaradas con lo que el servidor realmente
  // sirve y con lo que Google ya tenia indexado. Ver experiments/EXP-014.
  trailingSlash: 'always',
  integrations: [
    sitemap({
      serialize(item) {
        // EXP-014: normaliza toda URL del sitemap a la forma canonica CON
        // diagonal final, para que ninguna URL anunciada a Google sea una
        // redireccion (antes: forma sin '/', que Netlify redirige con 301).
        const url = new URL(item.url);
        if (!url.pathname.endsWith('/')) {
          url.pathname = url.pathname + '/';
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