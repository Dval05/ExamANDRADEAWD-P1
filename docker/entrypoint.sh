#!/bin/sh
set -e

# entrypoint.sh — genera config.js desde variables de entorno y sirve /app
# Variables esperadas: SUPABASE_URL, SUPABASE_ANON_KEY

SUPABASE_URL=${SUPABASE_URL:-}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-}

# Crea config.js en la carpeta pública
cat > /app/config.js <<EOF
// config.js — generado en runtime
window.SUPABASE_CONFIG = { url: "${SUPABASE_URL}", anonKey: "${SUPABASE_ANON_KEY}" };
EOF

# Si quieres ver el contenido (útil para debugging), descomenta la línea siguiente:
# echo "Generated config.js:" && cat /app/config.js

# Arranca el servidor estático en el puerto 80
exec http-server /app -p 80 -a 0.0.0.0 --silent
