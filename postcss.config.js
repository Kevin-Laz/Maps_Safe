const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [
    './src/**/*.html', // Archivos HTML para buscar clases usadas
    './src/**/*.ts',   // Archivos TypeScript para buscar clases usadas
  ],
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
});

module.exports = {
  plugins: [
    require('autoprefixer'),
    ...(process.env.NODE_ENV === 'production' ? [purgecss] : []), // Aplica PurgeCSS solo en producción
  ],
};
