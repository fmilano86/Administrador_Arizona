# Arquitectura propuesta y estado actual

## 1. Arquitectura objetivo

La arquitectura prevista es una **arquitectura en capas sobre un modelo
cliente-servidor con API REST**.

El flujo previsto para una operación es el siguiente:

1. El alumno usa la aplicación web para realizar una acción, como reservar una clase. En el futuro, también podrá hacerlo desde la aplicación mobile.

2. La aplicación envía la solicitud al backend mediante la API REST,usando datos en formato JSON.

3. La API valida la solicitud y, cuando corresponda, verifica la identidad del usuario mediante JWT. Luego deriva la operación a la capa de servicios.

4. La capa de servicios aplica las reglas del sistema, por ejemplo, comprobar  que haya cupo y que el alumno no tenga otra actividad en ese horario.

5. Para consultar o guardar información, los servicios utilizan la capa de acceso a datos, que se comunicará con PostgreSQL mediante SQLAlchemy.

6. El resultado vuelve desde la base de datos por esas mismas capas hasta la aplicación web, que se lo muestra al usuario.

La aplicación mobile, cuando se desarrolle, utilizará la misma API. Este flujo describe la arquitectura objetivo; no significa que sus componentes ya estén implementados.

Se propone un monolito modular dividido en capas, no una arquitectura de microservicios ni MVC con vistas renderizadas en el servidor. El frontend será independiente y se comunicará con el backend por API REST. La justificación de esta decisión está en la sección 5.

## 2. Estado actual del repositorio

- **Frontend web:** existe `apps/web`, creado con React, TypeScript y Vite;
    todavía conserva la pantalla inicial de la plantilla.
- **Backend:** existe el directorio `backend/` con carpetas preparadas para
    organizar la aplicación, pero todavía no contiene archivos de
    implementación.
- **Base de datos:** el directorio `database/` está vacío; no hay aún
    configuración ni esquema implementado.
- **Mobile y código compartido:** todavía no existen `apps/mobile/` ni
    `packages/shared/`.
- **Monorepo pnpm:** no hay configuración de workspace en la raíz. La app web
    tiene su propio `package.json` y archivo de lock.

## 3. Capas previstas para el backend

| Capa | Responsabilidad | Tecnología |

| API / routers | Recibir requests HTTP, validar entrada (esquemas Pydantic), autenticar (JWT) y delegar a la capa de servicios. | FastAPI |
| Servicios | Reglas de negocio del dominio: validación de cupo máximo, validación de superposición horaria, alta de bloques y generación de clases. | Python |
| Acceso a datos | Modelos y consultas sobre la base de datos. | SQLAlchemy (ORM) |
| Persistencia | Almacenamiento relacional de usuarios, actividades, bloques, clases y turnos. | PostgreSQL |

Esta separación permitirá testear las reglas de negocio (por ejemplo, no
permitir reservar una clase con cupo lleno) de forma independiente de la
capa HTTP y de la base de datos.

## 4. Tecnologías propuestas

| Componente | Tecnología prevista | Estado |

| Frontend web | React + TypeScript (Vite), `apps/web/` | Iniciado; conserva la plantilla de Vite |
| Backend | Python + FastAPI (API REST) y autenticación JWT, `backend/` | Estructura de carpetas creada; sin implementación |
| ORM | SQLAlchemy | Previsto |
| Base de datos | PostgreSQL | Prevista; sin configuración en el repositorio |
| Frontend mobile | React Native con Expo + TypeScript, `apps/mobile/` | Mejora futura; carpeta aún no creada |
| Código compartido | Paquete TypeScript de tipos y validaciones, `packages/shared/` | Previsto si se incorpora mobile; carpeta y workspace aún no creados |
| Notificaciones | Email vía SMTP y push vía Expo Notifications | Mejora futura |
| Despliegue frontend | Vercel o Netlify | Alternativas a evaluar |
| Despliegue backend | Render o Railway | Alternativas a evaluar |
| Despliegue de base de datos | Supabase u otro proveedor PostgreSQL | Alternativas a evaluar |

## 5. Justificación técnica

**Escala y madurez del problema.** El sistema es de uso acotado (un solo estudio, decenas de alumnos concurrentes), por lo que no se justifica una arquitectura distribuida ni microservicios. Se eligió PostgreSQL por sobre alternativas no relacionales por la naturaleza fuertemente relacional del dominio (alumnos, turnos, horarios con integridad referencial clara) y porque las validaciones de cupo y de superposición horaria requieren transacciones consistentes.

**Costo de aprendizaje vs. tiempo de desarrollo.** El equipo ya tiene experiencia previa en React, Python y bases de datos relacionales, lo que reduce la curva de aprendizaje y deja más tiempo para el desarrollo funcional.

**Entorno de despliegue.** Se priorizaron plataformas PaaS (Vercel/Netlify, Render/Railway, Supabase) por sobre servidores o contenedores propios, dado que el equipo no cuenta con experiencia avanzada en DevOps y estas plataformas permiten desplegar con configuración mínima, acorde a los plazos del cuatrimestre.

**Riesgo de cambio de tecnología.** Al ser un stack estándar y muy documentado (React, FastAPI, PostgreSQL), se minimiza el riesgo de tener que migrar tecnologías en etapas avanzadas del proyecto.

**Separación en capas por sobre monolito sin estructura.** Separar routers, servicios y acceso a datos permite que las reglas de negocio más sensibles del proyecto (cupo máximo de 7 personas, no superposición de turnos) queden aisladas y sean fáciles de testear, sin acoplar esa lógica a FastAPI ni a SQLAlchemy directamente.