# Arizona Health & Studio - Frontend

Aplicación web de gestión de turnos para alumnos, profesores y administración.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router,TanStack Query, Zustand, Axios, React Hook Form + Zod.

## Cómo ejecutarlo

```bash
cd apps/web
npm install
npm run dev:all      # app en http://localhost:5173 + API simulada en http://localhost:3001
```

También se pueden levantar por separado: `npm run dev` (app) y `npm run mock` (API simulada).

### Cuentas de prueba

Contraseña para todas: `Arizona123!`

| Rol            | Correo                         |
| -------------- | ------------------------------ |
| Alumna         | `valentina.lopez@arizona.test` |
| Profesora      | `laura.gomez@arizona.test`     |
| Administradora | `marina.ferrer@arizona.test`   |

La pantalla de login tiene un desplegable "Cuentas de prueba" (solo en desarrollo) que las completa por vos.

### Datos de ejemplo

`mock/db.json` se genera la primera vez con clases **relativas a la fecha de hoy**, así siempre hay clases por reservar. No se sube a Git. Para regenerarlo: `npm run mock:reset`. La API simulada replica las reglas del MVP (cupo de 7, sin superposición horaria, sin reservas duplicadas) y agrega una latencia de 250 ms para ver los estados de carga (`MOCK_DELAY=0` la desactiva).

## Conectar con el backend real

1. Revisar `docs/contrato-api.md`: es lo que el frontend espera de la API.
2. Cambiar `VITE_API_URL` en `.env`.
3. Listo, toda la comunicación pasa por `src/services/` y `src/lib/axios.ts`.

## Scripts

| Comando              | Qué hace                                       |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo de Vite                 |
| `npm run mock`       | API simulada (JSON Server + reglas de negocio) |
| `npm run mock:reset` | Regenera `mock/db.json`                        |
| `npm run dev:all`    | Los dos anteriores a la vez                    |
| `npm run build`      | Chequeo de tipos + build de producción         |
| `npm run lint`       | Lint con oxlint                                |

## Estructura

```text
src/
├── components/
│   ├── common/    Sistema de diseño: Button, Input, Modal, Badge, Avatar, Logo…
│   ├── layout/    AuthLayout, SidebarLayout (admin/profesor), AlumnoLayout
│   └── ui/        Piezas del dominio: ClassCard, CupoIndicator, DataTable, gráficos…
├── features/      Una carpeta por rol/módulo, con sus páginas, componentes y hooks
│   ├── auth/      Login, registro y perfil
│   ├── alumno/    Inicio, grilla semanal de clases, mis reservas
│   ├── profesor/  Agenda, turnos filtrables, alumnos
│   └── admin/     Tablero, turnos, horarios, actividades, alumnos, profesores
├── hooks/         Hooks de TanStack Query compartidos (useClases, useTurnos…)
├── services/      Llamadas HTTP a la API (una función por endpoint)
├── routes/        Router y guards (ProtectedRoute, RoleGuard, PublicOnlyRoute)
├── store/         Zustand: sesión (persistida) y avisos
├── schemas/       Validaciones de formularios con Zod
├── types/         Tipos del dominio (snake_case, igual que la API)
├── lib/           Cliente Axios, QueryClient
└── utils/         Fechas, errores, JWT, constantes
mock/              API simulada y generador de datos
```
