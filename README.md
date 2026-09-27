# Tecnicatura Universitaria en Programación a Distancia

## Trabajo Final Integrador

### 1. Datos generales

- **Proyecto:** Sistema de gestión de turnos para estudio de Pilates, Yoga y Sculpt
- **Integrantes:** Milano, Facundo Martín; Reinaudo, María Celeste; Ribero Mazzoni, Juan Pablo
- **Tutora:** María Candela Grosso
- **Grupo:** 125
- **Modalidad de origen:** Cliente real
- **Repositorio:** https://github.com/fmilano86/Administrador_Arizona

---

### 2. Problema y contexto

Los estudios de actividades como Pilates, Yoga y Sculpt suelen gestionar sus turnos de forma manual, por WhatsApp, planillas o cuadernos. Esto genera errores frecuentes: superposición de turnos para un mismo alumno, sobreventa de cupos (las clases tienen un límite físico de 7 personas por sala), y falta de visibilidad para el administrador sobre la ocupación real de cada clase y sobre datos básicos de sus alumnos, como por ejemplo cuándo cumplen años, para poder generar un vínculo más
cercano.

El proyecto propone una aplicación de gestión de turnos que digitalice este proceso, permitiendo a los alumnos reservar sus clases desde una app web o mobile, y al administrador visualizar y administrar la ocupación de cada actividad en tiempo real.

#### 2.1. Metodología de relevamiento y validación del problema

El relevamiento se realizó mediante entrevistas directas con la administradora del estudio (stakeholder principal), quien opera actualmente la gestión de turnos por
WhatsApp y planillas físicas. Se relevaron los siguientes actores y flujos:

- **Alumno:** reserva su turno por WhatsApp o de forma presencial, sin visibilidad de cupos disponibles en tiempo real.
- **Profesor:** recibe la lista de asistentes el mismo día de la clase, sin poder anticipar ausencias o cumpleaños.
- **Administrador:** concilia manualmente turnos, pagos y cupos, lo que genera errores de sobreventa y pérdida de información histórica de los alumnos.

La relevancia del problema fue validada directamente con la clienta, quien confirmó que la sobreventa de cupos y la pérdida de seguimiento de alumnos son los
inconvenientes que más tiempo administrativo le consumen semanalmente, lo que respalda la viabilidad y prioridad del proyecto propuesto.

Más allá de digitalizar el proceso existente, la propuesta busca agregar valor real mediante funcionalidades que hoy no existen en el flujo manual: validación automática de superposición de horarios, lista de espera con notificación automática al liberarse un cupo, y aviso de cumpleaños de alumnos para fortalecer el vínculo con el estudio — funcionalidades que un simple pasaje de WhatsApp a una planilla digital no resolvería.

---

### 5. Plan de trabajo y stack tecnológico

- **Frontend Web:** React + TypeScript (Vite)
- **Frontend Mobile:** React Native con Expo + TypeScript
- **Backend:** Python + FastAPI (API REST), autenticación JWT
- **Base de datos:** PostgreSQL, vía SQLAlchemy (ORM)
- **Código compartido:** paquete TypeScript compartido (tipos y validaciones) entre web y mobile, en un monorepo pnpm

#### 5.1 Notificaciones

- Email mediante SMTP.
- Push mediante Expo Notifications.

Estas funcionalidades de notificación se consideran parte de las mejoras posteriores y no son indispensables para el funcionamiento inicial del MVP.

#### 5.2 Despliegue

- **Frontend Web:** Vercel/Netlify
- **Backend:** Render/Railway
- **Base de datos:** Supabase o similar

#### 5.3 Control de versiones

Repositorio único en GitHub, con una estructura prevista similar a:

```text
├── backend/
├── apps/
│   ├── web/
│   └── mobile/
├── packages/
│   └── shared/
├── database/
├── docs/
└── README.md
```

---

### 6. Justificación tecnológica

La selección del stack se basó en los siguientes criterios:

#### 6.1 Escala y madurez del problema

Al tratarse de un sistema de uso acotado (un solo estudio, decenas de alumnos concurrentes) no se justifica una arquitectura distribuida ni bases de datos NoSQL. Se optó por PostgreSQL por sobre alternativas no relacionales debido a la naturaleza fuertemente relacional del dominio (alumnos, turnos, horarios y pagos con relaciones e
integridad referencial claras), y porque las consultas de disponibilidad de cupos y validación de superposición requieren transacciones consistentes, algo que un modelo no relacional dificultaría.

#### 6.2 Costo de aprendizaje vs. tiempo de desarrollo

El equipo ya cuenta con experiencia previa en React, Python y bases de datos relacionales, lo que reduce la curva de aprendizaje y permite dedicar más tiempo al desarrollo funcional que a la adopción de tecnologías nuevas.

#### 6.3 Entorno de despliegue

Se priorizaron plataformas PaaS (Vercel/Netlify) por sobre la administración de servidores propios o contenedores, dado que el equipo no cuenta con experiencia en DevOps avanzado y estas plataformas permiten desplegar y escalar con configuración mínima, acorde a los plazos del cuatrimestre.

#### 6.4 Riesgo de cambio de tecnología

Al ser un stack estándar y ampliamente documentado (React, FastAPI, PostgreSQL), se minimiza el riesgo de tener que migrar tecnologías en etapas avanzadas del proyecto, evitando así reescrituras que comprometan el cronograma.

---

### 7. Estado de avance

Al momento de la primera entrega se cuenta con:

- Idea del proyecto definida.
- Problemática identificada y validada.
- Stakeholder principal identificado.
- Entrevistas realizadas con la administradora del estudio.
- Actores y flujos principales relevados.
- Stack tecnológico definido.
- Equipo de desarrolladores formado.
- Alcance del MVP definido y priorizado.

---

### 8. Estructura del repositorio

```text
Administrador_Arizona/
├── apps/
│   └── web/          # Frontend: React + TypeScript + Vite
├── backend/           # Backend: FastAPI (estructura de carpetas, en desarrollo)
├── database/           # schema.sql: script DDL de PostgreSQL
├── docs/                # database.md, modulos.md, arquitectura.md
├── Imagenes/              # Material de diseño (Figma, paleta de colores, logos)
└── README.md
```

- **Esquema de base de datos:** [`/database/schema.sql`](./database/schema.sql), documentado en [`/docs/modelo-datos.md`](./docs/modelo-datos.md).
- **Módulos y arquitectura:** [`/docs`](./docs).
- **Frontend:** [`/apps/web`](./apps/web).
- **Backend:** [`/backend`](./backend).
