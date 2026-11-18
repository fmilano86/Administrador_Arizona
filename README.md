# Tecnicatura Universitaria en Programación a Distancia

## Trabajo Final Integrador

### 1. Datos generales

- **Proyecto:** Sistema de gestión de turnos para estudio de Pilates, Yoga y Sculpt
- **Integrantes:** Milano, Facundo Martín; Reinaudo, María Celeste; Ribero Mazzoni, Juan Pablo
- **Tutora:** María Candela Grosso
- **Grupo:** 125
- **Modalidad de origen:** Cliente real
- **Repositorio:** https://github.com/fmilano86/Administrador_Arizona

### 2. Problema y contexto

Los estudios de actividades como Pilates, Yoga y Sculpt suelen gestionar sus turnos de forma manual, por WhatsApp, planillas o cuadernos. Esto genera errores frecuentes: superposición de turnos para un mismo alumno, sobreventa de cupos (las clases tienen un límite físico de 7 personas por sala), y falta de visibilidad para el administrador sobre la ocupación real de cada clase y sobre datos básicos de sus alumnos, como por ejemplo cuándo cumplen años, para poder generar un vínculo más
cercano.

El proyecto propone una aplicación de gestión de turnos que digitalice este proceso, permitiendo a los alumnos reservar sus clases desde una app web o mobile, y al administrador visualizar y administrar la ocupación de cada actividad en tiempo real.

#### Metodología de relevamiento y validación del problema

El relevamiento se realizó mediante entrevistas directas con la administradora del estudio (stakeholder principal), quien opera actualmente la gestión de turnos por
WhatsApp y planillas físicas. Se relevaron los siguientes actores y flujos:

- **Alumno:** reserva su turno por WhatsApp o de forma presencial, sin visibilidad de cupos disponibles en tiempo real.
- **Profesor:** recibe la lista de asistentes el mismo día de la clase, sin poder anticipar ausencias o cumpleaños.
- **Administrador:** concilia manualmente turnos, pagos y cupos, lo que genera errores de sobreventa y pérdida de información histórica de los alumnos.

La relevancia del problema fue validada directamente con la clienta, quien confirmó que la sobreventa de cupos y la pérdida de seguimiento de alumnos son los
inconvenientes que más tiempo administrativo le consumen semanalmente, lo que respalda la viabilidad y prioridad del proyecto propuesto.

Más allá de digitalizar el proceso existente, la propuesta busca agregar valor real mediante funcionalidades que hoy no existen en el flujo manual: validación automática de superposición de horarios, lista de espera con notificación automática al liberarse un cupo, y aviso de cumpleaños de alumnos para fortalecer el vínculo con el estudio — funcionalidades que un simple pasaje de WhatsApp a una planilla digital no resolvería.

### 3. Plan de trabajo y stack tecnológico

- **Frontend Web:** React + TypeScript (Vite)
- **Frontend Mobile:** React Native con Expo + TypeScript
- **Backend:** Python + FastAPI (API REST), autenticación JWT
- **Base de datos:** PostgreSQL, vía SQLAlchemy (ORM)
- **Código compartido:** paquete TypeScript compartido (tipos y validaciones) entre web y mobile, en un monorepo pnpm

> **Nota sobre el alcance final:** por los tiempos de la cursada, el proyecto se desarrolló como aplicación **web únicamente**. La app mobile y el paquete de código compartido (`packages/shared`) quedaron fuera del alcance final — en `docs/modulos.md` ya estaban anotadas como mejoras posteriores, no como parte del MVP. El resto del stack se mantuvo según lo planificado.

#### 3.1 Notificaciones

- Email mediante SMTP.
- Push mediante Expo Notifications.

Estas funcionalidades de notificación se consideran parte de las mejoras posteriores y no son indispensables para el funcionamiento inicial del MVP. **No se implementaron en esta entrega.**

#### 3.2 Despliegue

- **Frontend Web:** Vercel/Netlify
- **Backend:** Render/Railway
- **Base de datos:** Supabase o similar

Ver el estado real del despliegue en la [sección 9](#9-despliegue).

#### 3.3 Control de versiones

Repositorio único en GitHub. Estructura final (ver [sección 6](#6-estructura-del-repositorio)).

### 4. Justificación tecnológica

La selección del stack se basó en los siguientes criterios:

#### 4.1 Escala y madurez del problema

Al tratarse de un sistema de uso acotado (un solo estudio, decenas de alumnos concurrentes) no se justifica una arquitectura distribuida ni bases de datos NoSQL. Se optó por PostgreSQL por sobre alternativas no relacionales debido a la naturaleza fuertemente relacional del dominio (alumnos, turnos, horarios y pagos con relaciones e
integridad referencial claras), y porque las consultas de disponibilidad de cupos y validación de superposición requieren transacciones consistentes, algo que un modelo no relacional dificultaría.

#### 4.2 Costo de aprendizaje vs. tiempo de desarrollo

El equipo ya cuenta con experiencia previa en React, Python y bases de datos relacionales, lo que reduce la curva de aprendizaje y permite dedicar más tiempo al desarrollo funcional que a la adopción de tecnologías nuevas.

#### 4.3 Entorno de despliegue

Se priorizaron plataformas PaaS (Vercel/Netlify) por sobre la administración de servidores propios o contenedores, dado que el equipo no cuenta con experiencia en DevOps avanzado y estas plataformas permiten desplegar y escalar con configuración mínima, acorde a los plazos del cuatrimestre.

#### 4.4 Riesgo de cambio de tecnología

Al ser un stack estándar y ampliamente documentado (React, FastAPI, PostgreSQL), se minimiza el riesgo de tener que migrar tecnologías en etapas avanzadas del proyecto, evitando así reescrituras que comprometan el cronograma.

### 5. Estado de avance

El sistema está funcional de punta a punta: backend, base de datos y frontend web para los tres roles (alumno, profesor, administrador).

**Implementado y en funcionamiento:**

- Registro e inicio de sesión con JWT, por rol (alumno, profesor, administrador).
- Alta y gestión de actividades (Pilates, Yoga, Sculpt).
- Alta y gestión de alumnos y profesores, con baja lógica.
- Horarios recurrentes (bloques semanales) que generan clases automáticamente.
- Grilla semanal de clases con cupos en tiempo real.
- Reserva y cancelación de turnos, con validación automática de superposición horaria y de cupo.
- **Lista de espera automática:** cuando una clase está completa, el alumno puede anotarse; al liberarse un lugar, se asigna automáticamente al primero de la lista (orden de llegada), con re-validación de cupo y superposición horaria en el momento de la promoción.
- **Aviso de cumpleaños:** el administrador ve, en el tablero principal, los alumnos y profesores que cumplen años en los próximos días.
- Distinción automática entre turno puntual, recurrente y "clase de prueba" (primera reserva de cada alumno).
- Historial de clases dictadas para el profesor (separado de la agenda del día a día).
- Restricción de búsqueda a fechas futuras para alumno y profesor.
- Migraciones de base de datos con Alembic, sobre una base PostgreSQL alojada en Supabase.
- Suite de tests automatizados (pytest) sobre las reglas de negocio críticas del backend: autenticación, cupos, superposición horaria, y lista de espera con promoción automática. Ver [`/backend/README.md`](./backend/README.md#tests).

**Pendiente para la entrega final:**

- Despliegue en línea del sistema (ver [sección 9](#9-despliegue)).
- Informe Final en PDF y video de presentación (ver [sección 10](#10-informe-final-y-video)).

### 6. Estructura del repositorio

```text
Administrador_Arizona/
├── apps/
│   └── web/          # Frontend: React + TypeScript + Vite.
├── backend/          # Backend: FastAPI, SQLAlchemy, Alembic, tests (pytest).
├── database/         # schema.sql: script DDL de PostgreSQL.
├── docs/             # arquitectura.md, contrato-api.md, modelo-datos.md, modulos.md.
├── Imagenes/         # Material de diseño (figma, paleta de colores, logos).
└── README.md
```

- **Esquema de base de datos:** [`/database/schema.sql`](./database/schema.sql), documentado en [`/docs/modelo-datos.md`](./docs/modelo-datos.md).
- **Módulos, arquitectura y contratos:** [`/docs`](./docs).
- **Frontend:** [`/apps/web`](./apps/web).
- **Backend:** [`/backend`](./backend).

### 7. Cómo ejecutar el sistema

1. **Backend:** seguir [`/backend/README.md`](./backend/README.md) (configurar `.env`, instalar dependencias, `uvicorn app.main:app --reload`). Queda en `http://127.0.0.1:8000` (documentación interactiva en `/docs`).
2. **Frontend:** seguir [`/apps/web/README.md`](./apps/web/README.md) (`npm install`, `npm run dev`). Queda en `http://localhost:5173`.
3. **Base de datos:** PostgreSQL. El esquema completo está en [`/database/schema.sql`](./database/schema.sql); el backend usa Alembic para migraciones futuras a partir de una base ya existente con ese esquema.

Credenciales de prueba contra el backend real: pedir al equipo (no se publican en este repositorio).

### 8. Limitaciones y trabajo futuro

- No incluye notificaciones por email ni push (quedaron para una etapa posterior, según lo definido en `docs/modulos.md`).
- No incluye gestión de pagos ni facturación.
- No se implementó la aplicación mobile ni el paquete de código compartido planificados originalmente.
- La suite de tests automatizados cubre las reglas de negocio críticas (autenticación, cupos, superposición horaria, lista de espera), pero no la totalidad de la API.

### 9. Despliegue

`[PENDIENTE: completar con el/los enlace(s) al sistema desplegado — frontend en Vercel/Netlify y/o backend en Render/Railway — antes de la entrega final.]`

### 10. Informe Final y video

- Informe Final (PDF): `[PENDIENTE: enlace o ruta dentro del repositorio]`
- Video de presentación: `[PENDIENTE: enlace]`