
### Alcance y definición del MVP

El objetivo principal del MVP es resolver los problemas centrales identificados durante el relevamiento: **evitar la sobreventa de cupos, prevenir la superposición de reservas y centralizar la información de clases, alumnos y turnos**. Para esto, se priorizan las funcionalidades indispensables para que el sistema pueda ser utilizado por el estudio en su operación cotidiana.

#### 3.1. Funcionalidades que forman parte del MVP

##### Alumno

- Registro e inicio de sesión con dirección de correo electrónico y contraseña.
- Visualización de la grilla semanal de clases de Pilates, Yoga y Sculpt.
- Visualización de los cupos disponibles.
- Reserva de turnos.
- Validación automática para impedir que un alumno reserve dos actividades superpuestas.
- Visualización de sus propios turnos.
- Cancelación de sus propios turnos.

##### Profesor

- Inicio de sesión con dirección de correo electrónico y contraseña.
- Visualización de los turnos reservados para sus clases.
- Consulta de los datos de los alumnos inscriptos en sus clases.
- Filtrado de turnos por fecha y horario.

##### Administrador

- Inicio de sesión con dirección de correo electrónico y contraseña.
- Visualización de todos los turnos reservados.
- Filtrado de turnos por fecha y actividad.
- Alta y gestión de actividades.
- Gestión de los datos fundamentales de los alumnos: nombre, apellido, teléfono y fecha de nacimiento.
- Gestión de profesores:asignación y administración del acceso a funcionalidades.

##### Reglas de negocio fundamentales del MVP

- Cada clase tendrá un **cupo máximo de 7 personas**.
- El sistema impedirá realizar una reserva cuando la clase haya alcanzado su capacidad máxima.
- El sistema impedirá que un alumno tenga dos actividades superpuestas en el mismo horario.
- El sistema permitirá consultar la disponibilidad de cupos.
- El administrador podrá visualizar la ocupación de las actividades y gestionar la información necesaria para el funcionamiento del estudio.

---

#### 3.2. Funcionalidades que quedan como mejoras posteriores

Las siguientes funcionalidades forman parte de la visión futura del proyecto, pero no son indispensables para que el sistema cumpla su objetivo principal. Se incorporarán posteriormente, dependiendo del tiempo disponible y de la evolución del proyecto.

##### Lista de espera

Permitir que un alumno se registre en una lista de espera cuando una clase alcance su capacidad máxima y gestionar automáticamente la asignación de un cupo cuando se produzca una cancelación.

##### Notificaciones por email

Enviar avisos relacionados con la liberación de cupos, lista de espera u otros eventos relevantes.

##### Notificaciones push

Incorporar notificaciones push, especialmente orientadas a informar a los alumnos sobre disponibilidad de cupos y eventos relacionados con sus reservas.

##### Avisos de cumpleaños

Mostrar al profesor y/o administrador un aviso destacado cuando un alumno cumpla años, con el objetivo de fortalecer el vínculo entre el estudio y sus alumnos.

##### Pagos

Incorporar la posibilidad de que los alumnos abonen la cuota mediante un enlace a una billetera virtual u otro medio de pago.

##### Avisos de vencimiento

Notificar al alumno cuando se aproxime el vencimiento de su cuota.

##### Facturación

Incorporar funcionalidades para la visualización y gestión de facturación.

##### Aplicación mobile

La aplicación mobile forma parte de la visión del proyecto. Su incorporación se evaluará de acuerdo con el avance del MVP y el tiempo disponible. En caso de priorizarse, se buscará mantener el código y las validaciones compartidas con la aplicación web.

---

#### 3.3. Funcionalidades fuera del alcance

Para mantener un alcance realista y acorde con los objetivos del Trabajo Final Integrador, quedan fuera del alcance:

- Gestión de múltiples sucursales o estudios.
- Gestión contable avanzada.
- Integración con sistemas externos de facturación no contemplados en el proyecto.
- Procesamiento automático de pagos que requiera una integración compleja con terceros.
- Funcionalidades que no estén directamente relacionadas con la gestión de clases, alumnos, profesores y reservas.

Las funcionalidades futuras podrán ser reevaluadas una vez finalizado el MVP.

---

### 4. Roles y permisos dentro del MVP

El sistema contempla tres roles principales: **Alumno, Profesor y Administrador**.

| Funcionalidad               | Alumno | Profesor | Administrador |
| --------------------------- | :----: | :------: | :-----------: |
| Registrarse                 |   ✓    |    X     |       X       |
| Iniciar sesión              |   ✓    |    ✓     |       ✓       |
| Ver clases y cupos          |   ✓    |    X     |       X       |
| Reservar una clase          |   ✓    |    X     |       X       |
| Cancelar una reserva propia |   ✓    |    X     |       X       |
| Ver sus propias reservas    |   ✓    |    X     |       X       |
| Ver turnos de sus clases    |   X    |    ✓     |       ✓       |
| Filtrar turnos              |   X    |    ✓     |       ✓       |
| Ver alumnos inscriptos      |   X    |    ✓     |       ✓       |
| Gestionar actividades       |   X    |    X     |       ✓       |
| Gestionar horarios          |   X    |    X     |       ✓       |
| Gestionar alumnos           |   X    |    X     |       ✓       |
| Gestionar profesores        |   X    |    X     |       ✓       |
| Gestionar accesos/roles     |   X    |    X     |       ✓       |
| Controlar cupos y ocupación |   X    | Consulta |       ✓       |

---

# Listado de módulos funcionales

Módulos en los que se organiza el desarrollo del sistema, con su
descripción, las funcionalidades que contempla (según el alcance definido
en el README) y su prioridad de desarrollo.

## Módulos del MVP (prioridad alta)

| Módulo | Descripción | Funcionalidades que contempla |
| --- | --- | --- |
| **Autenticación y accesos** | Registro e inicio de sesión, y control de acceso según el rol del usuario. | Registro de alumnos, login con email/contraseña (JWT), protección de rutas por rol (Alumno / Profesor / Administrador), gestión de accesos desde el panel de administración. |
| **Gestión de alumnos** | ABM de los datos de los alumnos del estudio. | Alta, edición y baja de alumnos (nombre, apellido, teléfono, fecha de nacimiento), consulta de alumnos inscriptos en una clase. |
| **Gestión de profesores** | Alta y administración de los profesores y su acceso al sistema. | Alta y edición de profesores, asignación a bloques/clases, administración del acceso a funcionalidades. |
| **Gestión de actividades** | ABM de las disciplinas que ofrece el estudio. | Alta, edición y baja de actividades (Pilates, Yoga, Sculpt). |
| **Bloques y clases / grilla semanal** | Creación de bloques de clases recurrentes y generación de las clases concretas que se muestran en la grilla. | Alta de bloques (actividad, profesor, horario, frecuencia semanal, cupo), generación de clases individuales, visualización de la grilla semanal con cupos disponibles. |
| **Reservas (turnos)** | Reserva y cancelación de turnos por parte del alumno, con las validaciones centrales del proyecto. | Reservar un turno, validación automática de cupo máximo (7 personas), validación automática de superposición horaria, ver mis turnos, cancelar un turno propio. |
| **Panel de gestión y filtros** | Vista de turnos y ocupación para profesores y administradores. | Ver todos los turnos reservados, ver turnos de las propias clases (profesor), filtrar por fecha, horario y actividad, consultar ocupación de cada clase. |

## Módulos de mejoras posteriores (no forman parte del MVP)

| Módulo | Descripción | Prioridad |
| --- | --- | --- |
| **Lista de espera** | Registro en lista de espera cuando una clase está completa y asignación automática de cupo ante una cancelación. | Media |
| **Notificaciones por email** | Avisos por SMTP sobre liberación de cupos, lista de espera y otros eventos. | Media |
| **Notificaciones push** | Avisos push (Expo Notifications) sobre disponibilidad de cupos y reservas, principalmente para la app mobile. | Media |
| **Avisos de cumpleaños** | Aviso destacado a profesores/administrador cuando un alumno cumple años. | Baja |
| **Pagos** | Pago de cuota mediante enlace a billetera virtual u otro medio. | Baja |
| **Avisos de vencimiento** | Notificación al alumno cuando se aproxima el vencimiento de su cuota. | Baja |
| **Facturación** | Visualización y gestión de facturación. | Baja |
| **Aplicación mobile** | App en React Native (Expo) que reutiliza el código compartido con la web. | A evaluar según avance del MVP |

## Fuera de alcance

No se desarrollan en este TFI: gestión de múltiples sucursales, gestión
contable avanzada, integración con sistemas de facturación externos ni
procesamiento de pagos con integraciones complejas de terceros (ver README,
sección 3.3).