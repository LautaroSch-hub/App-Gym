# App Gym API

API REST para la gestión de un gimnasio. Permite administrar usuarios y membresías, mantener un catálogo de ejercicios, organizar rutinas predefinidas y personalizadas, y registrar asistencia, progreso y medidas corporales. La API está desarrollada con Node.js, Express y Sequelize, y utiliza PostgreSQL.

## Funcionalidades

- Inicio de sesión mediante JWT, con sesiones de tres días y contraseñas protegidas con bcrypt.
- Roles de administrador y superadministrador para las operaciones de gestión.
- Membresías con fecha de vencimiento y registro de renovaciones.
- Catálogo de ejercicios y grupos musculares.
- Rutinas predefinidas, asociadas a ejercicios y grupos musculares.
- Rutinas personalizadas asociadas a usuarios y ejercicios, con orden de ejercicios.
- Registro de asistencia, progreso por ejercicio y medidas corporales.
- Protección de datos: los usuarios consultan su propia información; las vistas administrativas permiten consultar información de usuarios.
- Preparación del esquema y migraciones compatibles al iniciar el servidor.

## Enlaces del proyecto

- **Panel de administración:** [app-gym-frontend.onrender.com/admin/usuarios](https://app-gym-frontend.onrender.com/admin/usuarios)
- **Repositorio del frontend:** [App-Gym-Frontend en GitHub](https://github.com/LautaroSch-hub/App-Gym-Frontend)

Este repositorio contiene el backend/API; no incluye una interfaz web o móvil.

## Requisitos

- Node.js 12.18.3 o posterior y npm 6.14.6 o posterior.
- Una base de datos PostgreSQL accesible mediante una URL de conexión.
- Un secreto JWT de al menos 16 caracteres.

## Configuración local

1. Cloná el repositorio y entrá a la carpeta del proyecto.
2. Instalá las dependencias:

   ```bash
   npm install
   ```

3. Copiá `.env.example` a `.env` y configurá las variables:

   ```dotenv
   DATABASE_URL=postgresql://USUARIO:CONTRASENA@HOST:5432/BASE_DE_DATOS
   JWT_SECRET=un_secreto_aleatorio_de_al_menos_16_caracteres
   GYM_TIMEZONE=America/Argentina/Buenos_Aires
   ```

   Para generar un secreto aleatorio podés usar:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. Iniciá el servidor:

   ```bash
   npm run dev
   ```

   Para iniciar en modo normal:

   ```bash
   npm start
   ```

La API escucha en el puerto `3001` por defecto. Podés cambiarlo con la variable `PORT`. Al arrancar, el proceso espera la conexión y preparación de la base de datos antes de aceptar solicitudes. En una base vacía no se crea automáticamente un usuario administrador; hay que provisionar el usuario inicial por separado.

## Rutas principales

Todas las rutas están montadas en la raíz (`/`). Salvo el inicio de sesión, requieren el encabezado:

```http
Authorization: Bearer <token>
```

| Recurso | Rutas | Acceso general |
| --- | --- | --- |
| Sesión | `POST /login`, `GET /me`, `PUT /me/password` | Login público; las demás requieren sesión |
| Usuarios | `/Usuario` | Administración |
| Ejercicios | `/Ejercicio` | Lectura para usuarios con membresía vigente; cambios para administradores |
| Rutinas predefinidas | `/RutinaPredefinida` | Lectura para usuarios con membresía vigente; cambios para administradores |
| Rutinas personalizadas | `/RutinaPersonalizada` | Consultas propias o administrativas; gestión para administradores |
| Grupos musculares | `GET /Musculos` | Sesión y membresía vigente |
| Asistencia | `/Asistencia` | Datos propios; consulta de otros usuarios para administradores |
| Progreso | `/Progreso` | Datos propios; consulta de otros usuarios para administradores |
| Medidas | `/Medidas` | Datos propios; consulta de otros usuarios para administradores |

### Sesión y autenticación

- `POST /login`: recibe `email` y `password`; devuelve un token, información del usuario y el estado de la membresía.
- `GET /me`: devuelve la información actual de la cuenta y la membresía.
- `PUT /me/password`: cambia la contraseña autenticada. Recibe `actual` y `nueva` (mínimo seis caracteres).

Los usuarios con membresía vencida pueden iniciar sesión y consultar `/me`; el acceso al resto de las funciones protegidas por membresía se rechaza hasta renovarla. El login aplica un límite temporal de intentos fallidos.

### Usuarios y membresías (administración)

`/Usuario` permite listar, crear, consultar, actualizar y eliminar usuarios. También ofrece:

- `PUT /Usuario/:id/password`: restablece la contraseña.
- `POST /Usuario/:id/renovar`: renueva la membresía.
- `POST /Usuario/:id/desactivar`: desactiva la membresía.
- `GET /Usuario/:id/renovaciones`: consulta el historial de renovaciones.

### Rutinas

Las rutas predefinidas pueden crearse, editarse y asociarse a ejercicios y músculos. También es posible administrar la dificultad y el orden de los ejercicios. Las rutinas personalizadas están asociadas a un usuario; los usuarios consultan las propias y los administradores pueden gestionarlas.

### Seguimiento

En `/Asistencia`, `/Progreso` y `/Medidas`, `GET` consulta los registros propios, `POST` agrega un registro y las rutas `DELETE` disponibles permiten quitar registros. Los administradores pueden consultar los registros de un usuario mediante `GET /<recurso>/usuario/:usuarioId`.

Los cuerpos JSON aceptados dependen de cada operación y se validan en los controladores. Consultá los archivos de `src/routes/` y `src/pedidos/` para ver los campos específicos de cada solicitud.

## Base de datos

Los modelos Sequelize están en `src/models/` y sus asociaciones y preparación se configuran en `src/db.js`. Al iniciar, la aplicación sincroniza los modelos y aplica ajustes de esquema necesarios, como agregar el vencimiento de membresía y el orden de ejercicios. También convierte contraseñas existentes en texto plano a hashes y completa los grupos musculares definidos por la aplicación.

`src/config/db.sql` es una referencia del esquema inicial; la aplicación en ejecución utiliza PostgreSQL a través de Sequelize.

## Despliegue

El archivo `render.yaml` configura un servicio web para Render con `npm install` como comando de compilación y `npm start` para iniciar. En el entorno de despliegue hay que configurar `DATABASE_URL` y `JWT_SECRET`; `GYM_TIMEZONE` es opcional y por defecto corresponde a `America/Argentina/Buenos_Aires`.

## Estructura del proyecto

```text
.
├── index.js                 # Inicio del servidor y espera de la base de datos
├── render.yaml              # Configuración de despliegue en Render
├── src/
│   ├── app.js               # Configuración de Express y middleware
│   ├── db.js                # Sequelize, asociaciones y preparación del esquema
│   ├── models/              # Modelos de datos
│   ├── routes/              # Rutas HTTP por recurso
│   ├── pedidos/             # Controladores y operaciones de la API
│   ├── middlewares/         # Autenticación y autorización
│   ├── config/              # Configuración y SQL de referencia
│   └── utils/               # Validaciones y reglas de membresía
└── .env.example             # Variables de entorno de ejemplo
```

## Pruebas

El `package.json` define `npm test` con Mocha en modo observación (`-w`) sobre `tests/**/*.spec.js`. En el repositorio actual no hay una carpeta `tests/` incluida.
## Capturas de pantalla

### Administración

**Panel principal**

![Panel de administración](docs/screenshots/app-gym-frontend.onrender.com_admin.png)

**Usuarios y membresías**

![Administración de usuarios](docs/screenshots/app-gym-frontend.onrender.com_admin_usuarios.png)

**Catálogo de ejercicios**

![Administración de ejercicios](docs/screenshots/app-gym-frontend.onrender.com_admin_ejercicios.png)

### Funciones para socios

**Rutinas generales**

![Rutinas generales](docs/screenshots/app-gym-frontend.onrender.com_rutinas.png)

**Mi semana**

![Plan semanal](docs/screenshots/app-gym-frontend.onrender.com_mi-semana.png)

**Asistencia**

![Registro de asistencia](docs/screenshots/app-gym-frontend.onrender.com_asistencia.png)

**Progreso**

![Seguimiento del progreso](docs/screenshots/app-gym-frontend.onrender.com_progreso.png)

**Medidas corporales**

![Registro de medidas](docs/screenshots/app-gym-frontend.onrender.com_medidas.png)

**Mi cuenta**

![Cuenta y cambio de contraseña](docs/screenshots/app-gym-frontend.onrender.com_cuenta.png)

