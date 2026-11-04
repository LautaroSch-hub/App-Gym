# Actualización del back

Esta versión agrega: contraseñas hasheadas, sesión de 3 días, membresía con vencimiento, y seguimiento (asistencia, progreso y medidas). También reemplaza el control de acceso que faltaba: ahora el back valida el token y el rol en cada pedido.

## Cómo actualizarlo (3 pasos)

1. **Copiá** `index.js` y la carpeta `src/` de este zip encima de las de tu repo. No cambia `package.json`: las librerías que se usan ya estaban.
2. **Definí `JWT_SECRET` en Render** (Environment). Es obligatorio: sin esa variable el servidor no arranca y lo dice en el log. Usá un texto largo y al azar, por ejemplo el resultado de:
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
3. **Desplegá.** Al arrancar, el servidor hace solo la migración (una única vez):
   - Crea las tablas nuevas (`renovaciones`, `asistencias`, `registros_progreso`, `medidas`).
   - Agrega la columna `membresia_vence` a `Usuarios` y deja a los usuarios actuales con **30 días** de membresía, para que nadie quede afuera de golpe. (Los administradores no usan membresía.)
   - Convierte a hash las contraseñas que estaban en texto plano. Las contraseñas no cambian: cada usuario sigue entrando con la suya.

Después de desplegar, todos tendrán que volver a iniciar sesión una vez, porque cambió la clave con la que se firman los tokens.

## Variables de entorno

| Variable | Obligatoria | Para qué |
|---|---|---|
| `JWT_SECRET` | Sí | Firma las sesiones (3 días de duración) |
| `DATABASE_URL` | Sí | Cadena de conexión a la base de datos |
| `GYM_TIMEZONE` | No | Zona horaria para calcular los vencimientos. Por defecto `America/Argentina/Buenos_Aires` |

Configurá `DATABASE_URL` y `JWT_SECRET` como variables secretas en Render. Si la contraseña de la base estuvo publicada, cambiala en Supabase y actualizá el valor de `DATABASE_URL`.

## Qué cambió

**Seguridad**
- Contraseñas con bcrypt. Ya no se devuelve `contraseña_hash` en ninguna respuesta.
- Sesión de 3 días: pasado ese plazo el token deja de servir.
- Todas las rutas (menos `/login`) exigen token. Las de gestión exigen rol de administrador.
- Los usuarios solo ven sus propias rutinas.
- Solo el super admin queda protegido contra eliminación y cambios de rol; no se puede crear otro super admin desde la API.
- Límite de intentos de login: 8 fallidos y se bloquea 10 minutos.

**Membresía**
- `membresia_vence` es el último día en que el usuario puede usar la app (inclusive).
- Renovar suma días: si todavía está vigente, se suman al vencimiento actual; si ya venció, cuentan desde hoy.
- Con la membresía vencida el usuario puede iniciar sesión, pero el back rechaza todo lo demás (error `MEMBERSHIP_EXPIRED`) hasta que un administrador la renueve.

**Endpoints nuevos**
- `GET /me`, `PUT /me/password`
- `PUT /Usuario/:id` (rol de administrador y datos), `PUT /Usuario/:id/password`, `POST /Usuario/:id/renovar`, `POST /Usuario/:id/desactivar`, `GET /Usuario/:id/renovaciones`
- `DELETE /RutinaPredefinida/:rutinaId/ejercicios/:ejercicioId` (ya existía el controlador, faltaba la ruta)
- `PUT /RutinaPredefinida/:rutinaId/musculo` ahora también guarda `nivel_dificultad` (antes la dificultad no se podía cambiar)
- `/Asistencia`, `/Progreso`, `/Medidas` (propios y `/usuario/:id` para administradores)

## Cosas que quedaron igual

- `Membresia.js` (el modelo viejo) sigue en el proyecto pero ya no se usa. Podés borrarlo cuando quieras.
- Al borrar un usuario se borran también sus rutinas personalizadas, su asistencia, su progreso, sus medidas y su historial de renovaciones. Antes las rutinas quedaban sin dueño.
- Si en el futuro la base queda vacía, el usuario inicial es `admin@email.com` con contraseña `admin`: cambiala apenas entres.
