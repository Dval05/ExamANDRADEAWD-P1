# ExamANDRADEAWD-P1

## Deploy en Render (Docker)

Este proyecto incluye un `Dockerfile` y un `entrypoint.sh` que sirven la app estática y generan `config.js` en runtime usando variables de entorno. Está listo para desplegarse en Render como Web Service con Docker.

### Requisitos
- Cuenta en Render
- Base de datos (opcional) y credenciales de Supabase si usarás la búsqueda

### Variables de entorno
Configura estas variables en Render (Environment > Environment Variables):
- `SUPABASE_URL`: URL del proyecto Supabase (ej. `https://xxx.supabase.co`)
- `SUPABASE_ANON_KEY`: clave anónima de Supabase

El `entrypoint.sh` generará `config.js` con esos valores al arrancar.

### Pasos de despliegue
1. Crea un nuevo servicio en Render: New > Web Service > Connect repository.
2. Render detectará el `Dockerfile` automáticamente (Runtime: Docker).
3. No necesitas especificar comandos de build/start (usa el `ENTRYPOINT`).
4. Ajusta la región y plan a tu preferencia.
5. Añade las variables de entorno indicadas y despliega.

El contenedor escuchará en el puerto `$PORT` que Render inyecta.

### Desarrollo local (opcional)
Puedes ejecutar un build local de la imagen y correr el contenedor:

```powershell
docker build -t exam-andrade .
docker run -e SUPABASE_URL="https://xxx.supabase.co" -e SUPABASE_ANON_KEY="your_anon_key" -p 8080:8080 exam-andrade
```

Nota: el contenedor usará el puerto `8080` porque mapeamos `-p 8080:8080` y el `entrypoint` respeta `PORT` si lo defines: `-e PORT=8080`.

### Notas
- El front-end actual consulta la tabla `products` en Supabase. Si migras a la tabla `cellphones`, recuerda actualizar `index.js` e implementar la consulta a `cellphones`.
- Evita dejar claves sensibles en el código; usa variables de entorno en Render.