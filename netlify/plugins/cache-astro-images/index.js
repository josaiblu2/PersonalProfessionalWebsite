// BL-003: cachea el directorio de imagenes optimizadas por Astro
// (node_modules/.astro) entre builds de Netlify, para no reprocesar con
// Sharp las imagenes que no cambiaron desde el build anterior.
//
// Usa unicamente la API oficial de cache que Netlify inyecta en todo build
// plugin (utils.cache, de @netlify/cache-utils) -- sin ninguna dependencia
// externa de npm. Ver experiments/EXP-006-netlify-build-cache.md.
const ASTRO_IMAGE_CACHE_DIR = 'node_modules/.astro';

export const onPreBuild = async ({ utils }) => {
  const restored = await utils.cache.restore(ASTRO_IMAGE_CACHE_DIR);
  console.log(
    restored
      ? `[cache-astro-images] cache restaurado desde un build anterior: ${ASTRO_IMAGE_CACHE_DIR}`
      : `[cache-astro-images] sin cache previo (primer build o cache vacio): ${ASTRO_IMAGE_CACHE_DIR}`
  );
};

export const onPostBuild = async ({ utils }) => {
  const saved = await utils.cache.save(ASTRO_IMAGE_CACHE_DIR);
  console.log(
    saved
      ? `[cache-astro-images] cache guardado para el proximo build: ${ASTRO_IMAGE_CACHE_DIR}`
      : `[cache-astro-images] nada que guardar (el directorio no existe tras este build): ${ASTRO_IMAGE_CACHE_DIR}`
  );
};
