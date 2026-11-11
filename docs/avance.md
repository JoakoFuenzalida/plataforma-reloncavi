# Avance del prototipo VORA

Actualizado: 10 de noviembre de 2026. Rama: `main`.
Fecha simulada: 18 de enero de 2029. Datos ficticios en memoria; se reinician al recargar.

## Implementado

- Portal público: nueve hoteles, español/inglés, cuatro monedas, búsqueda y disponibilidad simulada.
- Reservas: validaciones, pago ficticio aprobado/rechazado, reintento y confirmación sin duplicados.
- Participantes: perfiles reutilizables; reservante, pagador y huéspedes distintos; registro previo individual de acompañantes.
- Registro previo: documento, archivo/cámara simulada, preferencias, idioma, firma, consentimiento y evidencia de exención para revisión de recepción.
- Recepción: llegadas, verificación documental, asignación de habitación, llave y check-in; alternativa o prioridad de limpieza si la habitación no está lista.
- Housekeeping: limpieza, inspección, liberación supervisada y aviso simulado a recepción.
- Estadía: cargos, extensión, saldo, cobro simulado y check-out con habitación pendiente de limpieza.
- Mantenimiento: incidencia con foto, bloqueo, orden de trabajo y aprobación o devolución por supervisión.
- Operación sin enlace simulada por hotel: límite de 96 h en lodge/24 h en urbano, preautorización, cola y reconexión sin duplicados.
- Directorio: creación/edición, preferencias e historial de reservas de toda la cadena; detección de correo coincidente sin fusión automática.
- Fusión supervisada: comparación y elección de ficha conservada, solicitud por recepción, aprobación/rechazo por supervisión e historial de decisiones. Conserva los roles y registros previos, combina preferencias y bloquea documentos incompatibles, huéspedes conjuntos o datos modificados después de solicitar. Los perfiles son de demostración, sin autorización real de servidor.
- Tablero inicial: ocupación, ADR y RevPAR; tres tipos de gráfico, filtros por hotel/categoría y detalle. Distingue muestra operativa e histórico ficticio.
- Cambios publicados en el repositorio GitHub en `main`. Esto no acredita una URL pública desplegada y verificada.

## Pendiente de implementación

- Autenticación simulada, recuperación, segundo factor y onboarding de temporada.
- Directorio de agencias/turoperadores y empresas: contratos, cupos, comisiones y convenios; evaluaciones/NPS e incidencias en ficha.
- Administración: usuarios, permisos por hotel, alta masiva, reglas con aprobación dual y auditoría/exportación.
- Tablero completo: seis tipos de gráfico, filtros temporales, exportación y métricas adicionales.
- Sostenibilidad y Folio Verde provisional/definitivo, metodología y expediente.
- Eventos/salones: disponibilidad, prevención de doble compromiso, cotización y contrato simulado.
- Revisión central de cobros rechazados o conflictivos en la simulación sin enlace.
- Personalización del tablero y cierre de los recorridos de navegación previstos.

## Verificación y entrega

- Compilación de producción: `npm run build`.
- Iniciar servidor: `npm start -- --host 127.0.0.1 --port 4202`.
- Pruebas de navegador: `node --test tests/*.cjs` (Edge instalado y playwright-core incluido).
- Pruebas disponibles: reserva, operación, estadía, mantenimiento, directorio, fusión y presentación.
- La prueba de fusión cubre aprobación, rechazo, separación de funciones, migración de referencias/documentos, cambios posteriores, conflictos y cinco tamaños de pantalla.
- Falta auditoría completa de accesibilidad, recorrido manual por teclado, contraste y capturas finales. Las pruebas de tamaño no certifican WCAG.
- Falta verificar despliegue público, URL definitiva y acceso desde otro dispositivo; cerrar documentación técnica de navegación y diseño del prototipo.

## Probar la fusión

1. Recepción → Directorio de huéspedes → Nueva ficha: crear una persona ficticia duplicada.
2. Abrir su ficha → Solicitar fusión de esta ficha; elegir la ficha que se conservará y describir la verificación.
3. En Fusión supervisada, cambiar el perfil de demostración a Supervisión.
4. Revisar ambas fichas, confirmar identidad y escribir el fundamento; aprobar o rechazar.
5. Comprobar la ficha conservada, su historial y el registro de la decisión.

La fusión combina preferencias y mantiene el contacto, nacionalidad e idioma de la ficha elegida. No presupone que dos personas con el mismo correo sean la misma persona.
