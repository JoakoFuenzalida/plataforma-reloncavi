# Avance del prototipo VORA

Actualizado: 9 de noviembre de 2026. Rama: `feat/reservas-recepcion`.
Requisitos: `Prototipo_VORA_requisitos_y_plan_v2.md`. Fecha simulada: 18 de enero de 2029.

## Terminado

- Base existente preservada: diseño, nueve hoteles, ES/EN, cuatro monedas, búsqueda y datos del reservante.
- Reserva: pago ficticio aprobado/rechazado, reintento, confirmación única, notificación simulada bilingüe y cupo finito por categoría/fechas.
- Registro previo del titular: documento, carga/arrastre de archivo y cámara simulada, idioma, preferencias, firma, consentimiento y evidencia de exención. Los archivos solo conservan su nombre en memoria. La exención requiere revisión de recepción; no se aplica automáticamente.
- Recepción: llegadas, búsqueda, registro previo compartido, verificación documental, habitación lista del mismo tipo o superior, llave según hotel y check-in. Reservante, pagador y huésped se mantienen separados en el modelo; la reserva directa usa una misma persona.
- Excepción: habitación no lista, alternativa, prioridad para housekeeping y espera con aviso simulado cuando queda lista.
- Housekeeping: prioridad compartida, limpieza → inspección → disponible; lista de chequeo y confirmación del supervisor; cambio de operador en dispositivo compartido.
- Sin enlace: estado por hotel, horas simuladas (96 lodge/24 urbano), bloqueo al alcanzar el límite, check-in, llave mecánica, cargos y cobro ficticio contra preautorización de extras de CLP 200.000. Cola con riesgo de rechazo diferido y reconexión idempotente. No es una implementación de resiliencia real.
- Tablero inicial: ocupación, ADR y RevPAR con definición; barras, anillo y línea; filtros hotel/categoría y detalle de registros. Los KPI usan la muestra operativa, claramente distinguida del inventario de 820 habitaciones. La línea histórica es una serie ficticia independiente.

## Verificaciones

- Compilación de producción inicial y de cada bloque implementado.
- `tests/reserva.cjs`: validaciones, rechazo/reintento aprobado, confirmación, registro a 375×812.
- `tests/operacion.cjs`: prioridad, espera, limpieza, inspección, aviso, check-in urbano/lodge, cargos, cobro, límite de 96 h y reconexión sin duplicados.
- `tests/presentacion.cjs`: rutas a 1920×1080, 1366×768, 768×1024, 1024×768 y 375×812; filtros y estado vacío; registro inglés y evidencia compartida.
- Ejecutar con `npm start -- --host 127.0.0.1 --port 4202`, luego `node tests/reserva.cjs`, `node tests/operacion.cjs` y `node tests/presentacion.cjs`. Requieren Edge instalado y `playwright-core` ya incluido en el proyecto. No se contactan servicios de pago ni se envían mensajes.

## Pendiente para entrega

- Auditoría completa WCAG 2.2 AA, contraste, navegación manual por teclado y capturas formales. Las pruebas de tamaño no equivalen a certificación de accesibilidad.
- URL institucional definitiva, responsable y garantía de seis meses; publicación y prueba desde otro dispositivo. No se ha hecho push ni publicado.
- Arquitectura de información, matriz RF/RT y sistema de diseño/informe de accesibilidad completos.
- Alcance final del 25 de noviembre: autenticación simulada, onboarding de temporada, mantenimiento con aprobación, directorio y fusión supervisada, administración y auditoría, eventos, sostenibilidad/Folio Verde, extensión de estadía y check-out, seis gráficos con exportación y filtros temporales.
- Registro individual de todos los acompañantes y roles distintos en la interfaz de reserva. En este avance el registro móvil es del titular; recepción verifica al grupo.
- La aprobación central de cobros rechazados/conflictivos y el detalle de sincronización productiva no están implementados; la cola actual representa el escenario exitoso e identifica el riesgo.
- Decidir RT-25.10 y actualizar las referencias del T-12 en la propuesta documental, fuera de este repositorio.

## Guion de demostración (aproximadamente tres minutos)

1. Portada → Huésped: reserva con pago simulado, confirmación y registro previo. No recargar el navegador: los datos son en memoria.
2. Cambiar perfil → Recepción: Emily Carter tiene la habitación 201 sin preparar; pedir prioridad y registrar espera.
3. Housekeeping: iniciar/finalizar limpieza de 201, cambiar a supervisor, inspeccionar y confirmar liberación.
4. Recepción: aviso de habitación lista, verificar documento ficticio y entregar llave.
5. Seleccionar Lodge Aysén, perder enlace y registrar check-in de James Wilson; agregar un cargo, cobrar contra preautorización y reconectar.
6. Tablero: mostrar ocupación/ADR/RevPAR y sus definiciones. Diferenciar la muestra operativa de la serie histórica ficticia.
