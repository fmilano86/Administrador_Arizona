# Contrato de API que espera el frontend

Este documento describe lo que `apps/web` necesita del backend. Hoy lo cumple el mock (`mock/server.cjs`); cuando FastAPI lo implemente,alcanza con cambiar `VITE_API_URL`. Si algo del backend va a ser distinto, conviene acordarlo acá primero.

## Convenciones

- JSON con nombres de campo en `snake_case`, igual que el modelo de datos del README (sección 8).
- Autenticación: `Authorization: Bearer <JWT>` en todas las rutas menos `/auth/login` y `/auth/register`. El JWT debería incluir `exp` (el frontend cierra la sesión si venció).
- Fechas y horas: `inicio`/`fin` en ISO 8601 con zona horaria. Los filtros `desde`/`hasta` son fechas `yyyy-MM-dd` **en la zona horaria del estudio** (America/Argentina/Buenos_Aires), inclusivas.
- Errores: el frontend muestra `detail` cuando es un string (formato de `HTTPException` de FastAPI), o el primer `msg` cuando es la lista de errores de validación (422).

| Código | Cuándo                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------- |
| 401    | Token ausente, inválido o vencido (el frontend cierra la sesión). En `/auth/login`: credenciales incorrectas. |
| 403    | El rol no tiene permiso, o la cuenta está dada de baja.                                                       |
| 404    | El recurso no existe.                                                                                         |
| 409    | Regla de negocio: cupo lleno, superposición horaria, reserva duplicada, correo/DNI/nombre repetido.           |
| 422    | Datos inválidos.                                                                                              |

## Autenticación

| Método y ruta         | Cuerpo                                                                | Respuesta                                         |
| --------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| `POST /auth/login`    | `{ email, password }`                                                 | `{ access_token, token_type: "bearer", usuario }` |
| `POST /auth/register` | `{ nombre, apellido, email, password, telefono?, fecha_nacimiento? }` | igual que login. Crea siempre un **ALUMNO**.      |
| `GET /auth/me`        | —                                                                     | `usuario`                                         |

`usuario` no debe incluir nunca la contraseña ni su hash.

## Clases (con datos ya unidos)

`GET /clases?desde&hasta&actividad_id&profesor_id&estado` → `ClaseDetalle[]` ordenadas por `inicio`.

```jsonc
{
  "id": 3,
  "bloque_clase_id": 1,
  "actividad_id": 1,
  "profesor_id": 2,
  "inicio": "2026-11-02T09:00:00-03:00",
  "fin": "2026-11-02T10:00:00-03:00",
  "cupo_maximo": 7,
  "estado": "PROGRAMADA",
  "actividad": { "id": 1, "nombre": "Pilates Reformer" },
  "profesor": { "id": 2, "nombre": "Ana", "apellido": "Torres" },
  "turnos_confirmados": 4, // turnos con estado CONFIRMADO
  "cupos_disponibles": 3, // cupo_maximo - turnos_confirmados
  "mi_turno": {
    /* Turno */
  }, // solo para ALUMNO: su turno CONFIRMADO en esta clase, o null
}
```

- Un **PROFESOR** solo recibe sus propias clases (el backend lo fuerza, aunque no mande `profesor_id`).
- `GET /clases/:id` → `ClaseDetalle`.
- `PATCH /clases/:id/cancelar` (ADMIN) → cancela la clase y todos sus turnos confirmados.

## Turnos

`GET /turnos?desde&hasta&actividad_id&profesor_id&alumno_id&clase_id&estado` → `TurnoDetalle[]`
ordenados por `clase.inicio`. `desde`/`hasta` filtran por el inicio de la clase.

```jsonc
{
  "id": 10,
  "alumno_id": 5,
  "clase_id": 3,
  "tipo": "REGULAR",
  "estado": "CONFIRMADO",
  "fecha_reserva": "...",
  "fecha_cancelacion": null,
  "actualizado_en": "...",
  "clase": {
    /* ClaseDetalle */
  },
  "alumno": {
    "id": 5,
    "nombre": "...",
    "apellido": "...",
    "email": "...",
    "telefono": "...",
    "fecha_nacimiento": "1990-05-20",
  },
}
```

- **ALUMNO**: solo ve sus turnos. **PROFESOR**: solo los de sus clases. **ADMIN**: todos.
- `POST /turnos` con `{ clase_id }` (rol ALUMNO; el alumno sale del token) → `TurnoDetalle` (201).
  Responde **409** con un `detail` legible si: la clase está completa, ya comenzó o está cancelada,
  el alumno ya tiene turno en esa clase, o tiene otro turno que se superpone en horario.
  Si el alumno había cancelado esa clase, se reactiva el mismo turno (no puede haber dos por clase).
- `POST /turnos/:id/cancelar` (ALUMNO dueño o ADMIN) → `TurnoDetalle` con `estado: "CANCELADO"`.
  409 si la clase ya comenzó.

## Actividades, bloques y usuarios (ADMIN para escribir)

| Ruta                                 | Notas                                                                                                                                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /actividades`                   | Lista todas (activas y dadas de baja: `eliminado_en != null`). Cualquier rol.                                                                                                                                                      |
| `POST /actividades`                  | `{ nombre, descripcion? }`. 409 si el nombre ya existe.                                                                                                                                                                            |
| `PATCH /actividades/:id`             | `{ nombre?, descripcion?, eliminado_en? }`. Baja lógica: `eliminado_en` = fecha; reactivar = `null`.                                                                                                                               |
| `GET /bloques`                       | Lista de `BloqueClase`.                                                                                                                                                                                                            |
| `POST /bloques`                      | `{ actividad_id, profesor_id, fecha_desde, fecha_hasta, hora_inicio, hora_fin, cupo_maximo }` → `{ bloque, clases_generadas }`. Genera **una clase por semana**, el mismo día de la semana que `fecha_desde`, hasta `fecha_hasta`. |
| `PATCH /bloques/:id/cancelar`        | Cancela el bloque, sus clases futuras y los turnos de esas clases.                                                                                                                                                                 |
| `GET /usuarios?rol=ALUMNO\|PROFESOR` | Incluye dados de baja (`eliminado_en != null`).                                                                                                                                                                                    |
| `POST /usuarios`                     | `{ rol, nombre, apellido, email, password, telefono?, dni?, fecha_nacimiento? }`. 409 si el correo o DNI ya existen.                                                                                                               |
| `PATCH /usuarios/:id`                | Campos editables + `eliminado_en` (baja de alumno / quitar acceso a profesor).                                                                                                                                                     |

## Valores de enums a confirmar con el backend

El frontend asume estos valores (están en `src/types/models.ts`). Si en la base son otros,
se cambian en un solo lugar:

- `rol`: `ALUMNO` · `PROFESOR` · `ADMINISTRADOR`
- `estado_clase`: `PROGRAMADA` · `CANCELADA` · `FINALIZADA`
- `estado_turno`: `CONFIRMADO` · `CANCELADO`
- `tipo_turno`: `REGULAR` · `PRUEBA`
- `estado_bloque`: `ACTIVO` · `CANCELADO`
- `frecuencia_bloque`: `SEMANAL`
