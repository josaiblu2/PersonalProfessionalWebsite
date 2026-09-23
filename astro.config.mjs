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
  integrations: [
    sitemap({
      serialize(item) {
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