-- ============================================================
-- Esquema de base de datos (PostgreSQL)
-- Sistema de gestión de turnos - Pilates / Yoga / Sculpt
-- TFI - Grupo 125
-- ============================================================

CREATE TYPE rol_usuario AS ENUM ('ALUMNO', 'PROFESOR', 'ADMINISTRADOR');
CREATE TYPE frecuencia_bloque AS ENUM ('SEMANAL');
CREATE TYPE estado_bloque AS ENUM ('ACTIVO', 'FINALIZADO', 'CANCELADO');
CREATE TYPE estado_clase AS ENUM ('PROGRAMADA', 'CANCELADA', 'FINALIZADA');
CREATE TYPE tipo_turno AS ENUM ('PUNTUAL', 'RECURRENTE');
CREATE TYPE estado_turno AS ENUM ('CONFIRMADO', 'CANCELADO');

CREATE TABLE usuario (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rol               rol_usuario   NOT NULL,
    nombre            VARCHAR(100)  NOT NULL,
    apellido          VARCHAR(100)  NOT NULL,
    email             VARCHAR(255)  NOT NULL UNIQUE,
    password_hash     VARCHAR(255)  NOT NULL,
    telefono          VARCHAR(30),
    dni               VARCHAR(20)   UNIQUE,
    fecha_nacimiento  DATE,
    fecha_alta        TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en    TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    eliminado_en      TIMESTAMPTZ
);

CREATE TABLE actividad (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL UNIQUE,
    descripcion      TEXT,
    fecha_alta       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    eliminado_en     TIMESTAMPTZ
);

CREATE TABLE bloque_clase (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actividad_id     BIGINT NOT NULL REFERENCES actividad(id),
    profesor_id      BIGINT NOT NULL REFERENCES usuario(id),
    creado_por_id    BIGINT NOT NULL REFERENCES usuario(id),
    fecha_desde      DATE   NOT NULL,
    fecha_hasta      DATE   NOT NULL,
    hora_inicio      TIME   NOT NULL,
    hora_fin         TIME   NOT NULL,
    frecuencia       frecuencia_bloque NOT NULL DEFAULT 'SEMANAL',
    cupo_maximo      SMALLINT NOT NULL DEFAULT 7 CHECK (cupo_maximo > 0),
    estado           estado_bloque NOT NULL DEFAULT 'ACTIVO',
    fecha_alta       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    eliminado_en     TIMESTAMPTZ,
    CHECK (fecha_hasta >= fecha_desde),
    CHECK (hora_fin > hora_inicio)
);

CREATE INDEX idx_bloque_actividad ON bloque_clase(actividad_id);
CREATE INDEX idx_bloque_profesor  ON bloque_clase(profesor_id);

CREATE TABLE clase (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bloque_clase_id   BIGINT REFERENCES bloque_clase(id),
    actividad_id      BIGINT NOT NULL REFERENCES actividad(id),
    profesor_id       BIGINT NOT NULL REFERENCES usuario(id),
    inicio            TIMESTAMPTZ NOT NULL,
    fin               TIMESTAMPTZ NOT NULL,
    cupo_maximo       SMALLINT NOT NULL DEFAULT 7 CHECK (cupo_maximo > 0),
    estado            estado_clase NOT NULL DEFAULT 'PROGRAMADA',
    fecha_alta        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    eliminado_en      TIMESTAMPTZ,
    CHECK (fin > inicio)
);

CREATE INDEX idx_clase_bloque     ON clase(bloque_clase_id);
CREATE INDEX idx_clase_inicio     ON clase(inicio);
CREATE INDEX idx_clase_actividad  ON clase(actividad_id);
CREATE INDEX idx_clase_profesor   ON clase(profesor_id);

CREATE TABLE turno (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    alumno_id          BIGINT NOT NULL REFERENCES usuario(id),
    clase_id           BIGINT NOT NULL REFERENCES clase(id),
    tipo               tipo_turno NOT NULL,
    estado             estado_turno NOT NULL DEFAULT 'CONFIRMADO',
    fecha_reserva      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cancelacion  TIMESTAMPTZ,
    actualizado_en     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_turno_alumno_clase_confirmado
    ON turno (alumno_id, clase_id)
    WHERE estado = 'CONFIRMADO';

CREATE INDEX idx_turno_clase_confirmado
    ON turno (clase_id)
    WHERE estado = 'CONFIRMADO';

CREATE INDEX idx_turno_alumno ON turno (alumno_id);