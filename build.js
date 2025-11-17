// build.js — genera config.js a partir de variables de entorno
// Uso: configurar SUPABASE_URL y SUPABASE_ANON_KEY en el entorno y ejecutar `node build.js`.
const fs = require('fs');

const url = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

const content = `// config.js — generado por build.js\nwindow.SUPABASE_CONFIG = { url: ${JSON.stringify(url)}, anonKey: ${JSON.stringify(anonKey)} };\n`;

fs.writeFileSync('config.js', content, { encoding: 'utf8' });
console.log('Wrote config.js (length:', content.length, ')');
