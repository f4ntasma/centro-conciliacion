# Documento de Requisitos

## Introducción

Esta feature extiende el módulo de Calendario de la aplicación de gestión de conciliaciones con dos mejoras principales:

1. **Hora en eventos**: permitir al usuario especificar la hora exacta de un evento al crearlo o editarlo, mostrándola tanto en la vista de lista de eventos del día como en las celdas del calendario mensual.
2. **Integración con Google Calendar**: ofrecer al usuario la opción de exportar o sincronizar los eventos creados en la aplicación con su cuenta de Google Calendar, de modo que los eventos aparezcan también en su calendario personal de Google.

El sistema se apoya en un frontend Next.js que persiste los eventos en Supabase mediante las funciones `crearEvento`, `getEventos` y `eliminarEvento`.

---

## Glosario

- **Calendario_App**: El módulo de calendario de la aplicación (frontend/app/calendar/page.tsx).
- **Evento**: Una entrada del calendario que contiene al menos título, fecha, tipo y, a partir de esta feature, hora opcional.
- **Google_Calendar_API**: La API REST de Google Calendar v3 utilizada para crear eventos en la cuenta de Google del usuario.
- **OAuth2_Flow**: El flujo de autenticación OAuth 2.0 de Google para obtener autorización del usuario y acceder a su Google Calendar.
- **Supabase**: El backend de base de datos usado para persistir los eventos de la aplicación.
- **Hora_Evento**: Campo de tiempo (HH:MM, formato 24h) que indica cuándo ocurre un evento dentro del día seleccionado.

---

## Requisitos

### Requisito 1: Campo de hora en la creación de eventos

**User Story:** Como usuario de la aplicación, quiero poder indicar la hora en que ocurrirá un evento al crearlo, para saber exactamente a qué hora tengo programada cada audiencia o notificación.

#### Criterios de Aceptación

1. WHEN el usuario abre el formulario de nuevo evento, THE Calendario_App SHALL mostrar un campo de hora (tipo time) junto al campo de título.
2. WHEN el usuario envía el formulario con una hora especificada, THE Calendario_App SHALL persistir el campo `time` (formato HH:MM) junto con el evento en Supabase.
3. WHEN el usuario envía el formulario sin especificar hora, THE Calendario_App SHALL persistir el evento con el campo `time` como nulo y sin mostrar error.
4. WHEN el usuario ingresa un valor de hora fuera del rango 00:00–23:59, THE Calendario_App SHALL impedir el envío del formulario y mostrar un mensaje de error indicando que la hora no es válida.

---

### Requisito 2: Visualización de la hora en los eventos

**User Story:** Como usuario, quiero ver la hora de mis eventos en el calendario, para identificar rápidamente los eventos del día y su orden cronológico.

#### Criterios de Aceptación

1. WHEN se listan los eventos de un día seleccionado, THE Calendario_App SHALL mostrar la hora del evento junto al título si el campo `time` no es nulo.
2. WHEN se muestran los eventos en las celdas del calendario mensual, THE Calendario_App SHALL incluir la hora antes del título del evento si el campo `time` no es nulo.
3. WHEN se listan los eventos de un día, THE Calendario_App SHALL ordenarlos de forma ascendente por hora, colocando al final los eventos sin hora definida.

---

### Requisito 3: Persistencia del campo hora en el modelo de datos

**User Story:** Como desarrollador, quiero que el modelo de datos del evento incluya el campo de hora, para que la información sea consistente entre el frontend y la base de datos.

#### Criterios de Aceptación

1. THE Calendario_App SHALL extender la interfaz `CalendarEvent` con un campo `time` de tipo `string | null` (formato HH:MM).
2. WHEN se llama a `crearEvento`, THE Calendario_App SHALL incluir el campo `time` en el payload enviado a Supabase.
3. WHEN se llama a `getEventos`, THE Calendario_App SHALL leer y exponer el campo `time` de cada evento devuelto por Supabase.

---

### Requisito 4: Autenticación con Google para sincronización

**User Story:** Como usuario, quiero conectar mi cuenta de Google para poder exportar eventos a Google Calendar, sin que la aplicación almacene mis credenciales de Google.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en el botón "Conectar Google Calendar", THE Calendario_App SHALL iniciar el OAuth2_Flow de Google solicitando únicamente el scope `https://www.googleapis.com/auth/calendar.events`.
2. WHEN el OAuth2_Flow finaliza con éxito, THE Calendario_App SHALL almacenar el token de acceso únicamente en memoria de sesión (sessionStorage) y no en localStorage ni en Supabase.
3. WHEN el token de Google caduca o es inválido, THE Calendario_App SHALL solicitar al usuario que vuelva a autenticarse mostrando un mensaje descriptivo.
4. WHEN el usuario no ha autenticado su cuenta de Google, THE Calendario_App SHALL mostrar el botón "Conectar Google Calendar" y ocultar la opción de exportar eventos a Google Calendar.

---

### Requisito 5: Exportación de un evento a Google Calendar

**User Story:** Como usuario, quiero agregar un evento de la aplicación directamente a mi Google Calendar con un solo clic, para tener todos mis compromisos en un único lugar.

#### Criterios de Aceptación

1. WHEN el usuario está autenticado con Google y hace clic en "Agregar a Google Calendar" para un evento específico, THE Calendario_App SHALL crear el evento en Google Calendar del usuario mediante la Google_Calendar_API.
2. WHEN el evento tiene hora definida, THE Calendario_App SHALL crear el evento en Google Calendar como un evento con hora de inicio y fin (duración de 1 hora por defecto).
3. WHEN el evento no tiene hora definida, THE Calendario_App SHALL crear el evento en Google Calendar como un evento de día completo (all-day).
4. WHEN la creación en Google Calendar es exitosa, THE Calendario_App SHALL mostrar una notificación de confirmación con un enlace al evento creado en Google Calendar.
5. IF la llamada a la Google_Calendar_API devuelve un error, THEN THE Calendario_App SHALL mostrar un mensaje de error descriptivo al usuario sin eliminar el evento local.

---

### Requisito 6: Indicador visual de sincronización con Google Calendar

**User Story:** Como usuario, quiero saber qué eventos ya han sido exportados a Google Calendar, para no duplicarlos accidentalmente.

#### Criterios de Aceptación

1. WHEN un evento ha sido exportado a Google Calendar en la sesión actual, THE Calendario_App SHALL mostrar un ícono o etiqueta visual que indique que el evento ya fue enviado a Google Calendar.
2. WHEN el usuario exporta un evento que ya fue exportado en la sesión actual, THE Calendario_App SHALL mostrar un diálogo de confirmación preguntando si desea crearlo de nuevo en Google Calendar.
