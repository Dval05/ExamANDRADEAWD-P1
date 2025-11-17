# Dockerfile para desplegar en Render (sirve archivos estáticos y genera config.js en runtime)
# Usa Node para poder generar `config.js` desde variables de entorno al iniciar.

FROM node:18-alpine

WORKDIR /app

# Copia solo lo necesario (docker build respetará .dockerignore)
COPY package.json package-lock.json* ./
COPY . ./

# Instala un servidor estático ligero globalmente
RUN npm install -g http-server@0.13.0 --no-fund --no-audit --silent

# Expone puerto 80 (Render usará este puerto)
EXPOSE 80

# Copia y da permisos al entrypoint que generará config.js y arrancará el servidor
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
