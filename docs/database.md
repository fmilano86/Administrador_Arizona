### Modelo de datos

El sistema utiliza un modelo de datos relacional compuesto por las entidades
Usuario, Actividad, Bloque de clase, Clase y Turno.

La entidad Bloque de clase permite generar y administrar conjuntamente varias
clases relacionadas. Cada clase representa un encuentro concreto y puede
pertenecer a un bloque o haber sido creada individualmente.

#### Diagrama Entidad-Relación

```mermaid
erDiagram
    ACTIVIDAD ||--o{ BLOQUE_CLASE : "se planifica en"
    USUARIO ||--o{ BLOQUE_CLASE : "dicta habitualmente"
    USUARIO ||--o{ BLOQUE_CLASE : "crea"
    BLOQUE_CLASE o|--|{ CLASE : "agrupa"
    ACTIVIDAD ||--o{ CLASE : "se programa en"
    USUARIO ||--o{ CLASE : "dicta"
    USUARIO ||--o{ TURNO : "reserva"
    CLASE ||--o{ TURNO : "recibe"

    USUARIO {
        BIGINT id PK "IDENTITY; NOT NULL"
        rol_usuario rol "NOT NULL"
        VARCHAR nombre "NOT NULL"
        VARCHAR apellido "NOT NULL"
        VARCHAR email UK "NOT NULL"
        VARCHAR password_hash "NOT NULL"
        VARCHAR telefono "NULL"
        VARCHAR dni UK "NULL"
        DATE fecha_nacimiento "NULL"
        TIMESTAMPTZ fecha_alta "NOT NULL; DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ actualizado_en "NOT NULL; DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ eliminado_en "NULL"
    }

    ACTIVIDAD {
        BIGINT id PK "IDENTITY; NOT NULL"
        VARCHAR nombre UK "NOT NULL"
        TEXT descripcion "NULL"
        TIMESTAMPTZ fecha_alta "NOT NULL; DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ actualizado_en "NOT NULL; DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ eliminado_en "NULL"
    }

    BLOQUE_CLASE {
        BIGINT id PK "IDENTITY; NOT NULL"
        BIGINT actividad_id FK "NOT NULL"
        BIGINT profesor_id FK "NOT NULL"
        BIGINT creado_por_id FK "NOT NULL"
        DATE fecha_desde "NOT NULL"
        DATE fecha_hasta "NOT NULL"
        TIME hora_inicio "NOT NULL"
        TIME hora_fin "NOT NULL"
        frecuencia_bloque frecuencia "NOT NULL; DEFAULT SEMANAL"
        SMALLINT cupo_maximo "NOT NULL; DEFAULT 7"
        estado_bloque estado "NOT NULL; DEFAULT ACTIVO"
        TIMESTAMPTZ fecha_alta "NOT NULL; DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ actualizado_en "NOT NULL; DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ eliminado_en "NULL"
    }

    CLASE {
        BIGINT id PK "IDENTITY; NOT NULL"
        BIGINT bloque_clase_id FK "NULL; INDEX"
        BIGINT actividad_id FK "NOT NULL"
        BIGINT profesor_id FK "NOT NULL"
        TIMESTAMPTZ inicio "NOT NULL"
        TIMESTAMPTZ fin "NOT NULL"
        SMALLINT cupo_maximo "NOT NULL; DEFAULT 7"
        estado_clase estado "NOT NULL; DEFAULT PROGRAMADA"
        TIMESTAMPTZ fecha_alta "NOT NULL; DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ actualizado_en "NOT NULL; DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ eliminado_en "NULL"
    }

    TURNO {
        BIGINT id PK "IDENTITY; NOT NULL"
        BIGINT alumno_id FK "NOT NULL"
        BIGINT clase_id FK "NOT NULL"
        tipo_turno tipo "NOT NULL"
        estado_turno estado "NOT NULL; DEFAULT CONFIRMADO"
        TIMESTAMPTZ fecha_reserva "NOT NULL; DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMPTZ fecha_cancelacion "NULL"
        TIMESTAMPTZ actualizado_en "NOT NULL; DEFAULT CURRENT_TIMESTAMP"
    }

```

#### Descripción de las entidades

| Entidad       | Descripción                                                        |
| ------------- | ------------------------------------------------------------------ |
| `Usuario`     | Almacena los datos de alumnos, profesores y administradores.       |
| `Actividad`   | Representa las disciplinas ofrecidas por el establecimiento.       |
| `BloqueClase` | Contiene la configuración común de un conjunto de clases.          |
| `Clase`       | Representa una clase concreta en una fecha y horario determinados. |
| `Turno`       | Registra la reserva de un alumno para una clase.                   |

#### Relaciones principales

- Una actividad puede utilizarse en numerosos bloques y clases.
- Un profesor puede estar asignado a múltiples bloques y clases.
- Un bloque agrupa una o más clases.
- Una clase puede pertenecer a un bloque o crearse individualmente.
- Un alumno puede reservar múltiples turnos.
- Cada turno corresponde a una única clase y a un único alumno.

#### Reglas de integridad

- El correo electrónico de cada usuario debe ser único.
- El DNI de cada usuario, cuando se encuentre informado, debe ser único.
- El nombre de cada actividad debe ser único.
- Una clase debe tener asociada una actividad y un profesor existentes.
- El usuario asignado como profesor debe tener el rol `PROFESOR`.
- La fecha y hora de finalización de una clase deben ser posteriores a su inicio.
- El cupo máximo de una clase debe ser mayor que cero.
- Una clase puede pertenecer como máximo a un bloque.
- Las clases creadas individualmente deben tener `bloque_clase_id = NULL`.
- La fecha de finalización de un bloque debe ser igual o posterior a su fecha de inicio.
- La hora de finalización de un bloque debe ser posterior a su hora de inicio.
- Un turno debe estar asociado a un alumno y a una clase existentes.
- El usuario asociado a un turno debe tener el rol `ALUMNO`.
- Un alumno no puede reservar dos veces la misma clase.
- La cantidad de turnos con estado `CONFIRMADO` no puede superar el cupo máximo de la clase.
- No pueden registrarse turnos para clases canceladas o eliminadas.
- Cuando un turno se encuentre cancelado, debe registrarse su fecha de cancelación.

#### Índices

Con el objetivo de optimizar las consultas más frecuentes del sistema, se
definieron los siguientes índices:

| Índice | Tabla | Campos | Tipo | Finalidad |
|---|---|---|---|---|
| `idx_clase_inicio` | `clase` | `inicio` | Simple | Consultar clases por fecha o período. |
| `idx_clase_actividad_inicio` | `clase` | `actividad_id`, `inicio` | Compuesto | Filtrar clases por actividad y fecha. |
| `idx_clase_profesor_inicio` | `clase` | `profesor_id`, `inicio` | Compuesto | Consultar la agenda del profesor y detectar superposiciones. |
| `idx_clase_bloque` | `clase` | `bloque_clase_id` | Simple | Modificar o cancelar las clases pertenecientes a un bloque. |
| `idx_turno_clase_estado` | `turno` | `clase_id`, `estado` | Compuesto | Obtener los turnos confirmados y controlar el cupo. |
| `idx_turno_alumno_estado` | `turno` | `alumno_id`, `estado` | Compuesto | Consultar los turnos de un alumno según su estado. |
| `idx_turno_fecha_reserva` | `turno` | `fecha_reserva` | Simple | Consultar y contabilizar reservas por período. |

---
