# 🚀 UDO Social API - Backend Core

Bienvenido al repositorio central de **UDO Social**, una plataforma diseñada para conectar a la comunidad universitaria. Este backend actúa como el motor principal del ecosistema, gestionando la lógica de negocio, la seguridad de los datos y la persistencia de archivos multimedia.

---

## 🛠 Stack Tecnológico
* **Runtime:** Node.js con TypeScript
* **Framework:** Express.js
* **ORM:** Sequelize (PostgreSQL)
* **Storage:** Supabase S3 (Gestión de media)
* **Auth:** JWT & Cookies HttpOnly

---

## 📖 Descripción de la API
La arquitectura sigue un flujo de **Intermediación Segura (Proxy)**:
1. **Cliente (Next.js):** Envía peticiones autenticadas mediante cookies.
2. **Servidor (Express):** Valida la sesión, procesa los archivos en memoria (Multer) y aplica reglas de negocio.
3. **Servicios (Supabase):** Almacena de forma definitiva los datos en Postgres y los archivos en buckets S3.

Esta estructura garantiza que las llaves administrativas (`Service Role Key`) nunca se expongan al frontend, manteniendo la integridad total del sistema.

---

## 🛣 Arquitectura de Rutas
Para mantener la consistencia y la escalabilidad, todas las rutas deben cumplir con los siguientes estándares:

### Reglas de Construcción:
* **Tipado Estricto:** Es obligatorio el uso de interfaces de TypeScript para definir el cuerpo de las peticiones (`req.body`) y las respuestas.
* **Nomenclatura:** Los archivos dentro de `/routes` deben nombrarse en **singular e inglés** (Ej: `post.ts`, `user.ts`, `comment.ts`).
* **Registro Central:** Toda nueva ruta debe ser importada y vinculada en el archivo `index.ts` principal (el corazón de la aplicación).
* **Interfaces:** Deben definirse dentro del archivo de la ruta para facilitar la lectura, o en un directorio global de interfaces si son modelos compartidos.

---

## 🤝 Guía de Colaboración (Git & GitHub)

Para mantener un historial de cambios limpio y evitar conflictos de código, aplicamos el flujo de trabajo **Feature Branching**.

### 1. Sincronización Inicial
Antes de comenzar cualquier tarea, asegúrate de estar en la rama principal y tener la última versión:
```bash
git checkout main
git pull origin main
2. Creación de Ramas
Nunca trabajes directamente sobre main. Crea una rama con un nombre descriptivo según la naturaleza del cambio:

**feature/**nombre-de-la-mejora (Nuevas funcionalidades)

**fix/**nombre-del-error (Corrección de fallos)

**docs/**cambio-leeme (Cambios en documentación)

Bash
git checkout -b feature/sistema-comentarios
3. Commits Atómicos
Realiza commits pequeños, frecuentes y con mensajes descriptivos:

Bash
git add .
git commit -m "feat: implement logic for creating comments in the backend"
4. Sincronización antes del Push
Para evitar conflictos en la nube, es obligatorio traer los últimos cambios de main a tu rama local antes de subir tu trabajo:

Bash
# Traer cambios de la rama principal
git pull origin main

# Resolver conflictos manualmente si aparecen, luego:
git push origin feature/sistema-comentarios
5. Pull Requests (PR)
Una vez subida la rama, sigue este proceso en GitHub:

Ve al repositorio en GitHub y abre un Pull Request.

Descripción: Detalla brevemente qué cambios introduce tu código y si afecta al esquema de la base de datos (Sequelize).

Review: Solicita la revisión de al menos un colaborador.

Merge: No realices el Merge hasta que el código haya sido aprobado.

📋 Estándares de Código
Para mantener la legibilidad y coherencia en todo el proyecto, aplicamos las siguientes reglas:

Variables y Funciones: Usar camelCase (ej: getUserData).

Modelos y Clases: Usar PascalCase (ej: UserModel).

Manejo de Errores: Evitar el uso de .then(). Es obligatorio utilizar bloques try/catch con async/await para una mayor claridad en el flujo asíncrono.

Variables de Entorno: Nunca subas el archivo .env al repositorio. Si agregas una variable nueva, actualiza el archivo .env.example.

[!NOTE]

Este proyecto utiliza Multer configurado en memoria (memoryStorage). Las imágenes se procesan como buffers y se suben al Storage de Supabase utilizando la Service Role Key. Este enfoque centraliza la seguridad en el servidor Express y evita configuraciones complejas de RLS en el desarrollo inicial.