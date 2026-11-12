# Avance del prototipo VORA

Actualizado: 12 de noviembre de 2026. Rama: `feat/navegacion-accesos`.
Fecha simulada: 18 de enero de 2029. Datos ficticios en memoria; se reinician al recargar.

## Implementado

- Navegación común del personal: menú lateral filtrado por perfil (cajón en teléfono), rastro de navegación con pestañas del directorio, notificaciones, acceso visible a «Cambiar perfil» y pie VORA. Las pantallas del personal ya no repiten su propia cabecera.
- Inicio del turno personalizado por perfil (`/personal/inicio`): tareas, llegadas, habitaciones, órdenes, enlace de hoteles, padrón y accesos rápidos; tarjetas que se reordenan, ocultan y restablecen, guardadas por perfil en el navegador.
- Accesos simulados (`/acceso`): personal con correo corporativo y segundo factor (código 482 913, tres intentos); terreno con credencial y PIN en teclado grande (PIN 2468) y activación de primer día con creación de PIN; huésped con correo y código de un solo uso (731 905).
- Recuperación de acceso (`/acceso/recuperar`) en tres pasos con requisitos de contraseña en tiempo real (código 205 117).
- Registro de huésped en cinco pasos (`/cuenta/registro`, ES/EN): datos, documento con arrastrar y soltar, idioma y preferencias, consentimiento y verificación (código 560 284). La ficha queda en el padrón único.
- Portal del huésped (`/cuenta`): reservas con sus roles, acceso al registro previo y datos personales.
- Recorrido guiado de primer ingreso (diálogo modal con foco atrapado), también disponible desde el menú del perfil.

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
- Tablero: estado operativo en vivo y un histórico ficticio independiente. Seis tipos de gráfico (barras, anillo, línea, área, dispersión y mapa de calor), filtros de hotel/categoría y fechas para el histórico, detalle por hotel/día y exportación CSV de los registros filtrados. Ocupación, ADR, RevPAR, tiempos de check-in y preparación de habitaciones y NPS con cálculos ponderados y denominadores visibles.
- Cambios publicados en el repositorio GitHub en `main`. Esto no acredita una URL pública desplegada y verificada.

- Directorio comercial: agencias, turoperadores y empresas con acuerdos por hotel/categoría y vigencia; creación/edición, cupos por noche, vinculación de reservas existentes, comparación de comisión o tarifa y actividad. Los acuerdos vinculados conservan sus condiciones; se crea otro para cambiarlas. La vinculación no recalcula pagos ni modifica el inventario.

## Pendiente de implementación

- Evaluaciones/NPS e incidencias en ficha de huéspedes; ampliar la evaluación comercial más allá de diferencias de tarifa o comisión.
- Administración: usuarios, permisos por hotel, alta masiva, reglas con aprobación dual y auditoría/exportación.
- Analítica comercial: ventas por canal y vinculación de métricas con los eventos operativos cuando se implementen sus mediciones. El histórico actual es una serie ficticia explícita.
- Sostenibilidad y Folio Verde provisional/definitivo, metodología y expediente.
- Eventos/salones: disponibilidad, prevención de doble compromiso, cotización y contrato simulado.
- Revisión central de cobros rechazados o conflictivos en la simulación sin enlace.
- Personalización del tablero y cierre de los recorridos de navegación previstos.

## Verificación y entrega

- Compilación de producción: `npm run build`.
- Iniciar servidor: `npm start -- --host 127.0.0.1 --port 4202`.
- Pruebas de navegador: `node --test tests/*.cjs` (Edge instalado y playwright-core incluido).
- Pruebas disponibles: reserva, operación, estadía, mantenimiento, directorio, fusión, terceros comerciales, analítica y presentación.
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

## Probar acuerdos comerciales

Recepción → Directorio de huéspedes → Agencias y turoperadores / Empresas con convenio. Seleccionar un acuerdo, consultar una noche y vincular una reserva elegible con su fundamento. En agencias, variar la comisión aplicada para mostrar una diferencia. En empresas se compara la tarifa de la reserva con la negociada. También es posible crear acuerdos y editar los que no tienen reservas vinculadas.

## Probar el histórico del tablero

Recepción → Tablero → Histórico de demostración. Elegir fechas del 1 al 18 de enero de 2029, combinadas con hotel/categoría. Seleccionar un hotel o una celda del mapa de calor para consultar sus registros. Exportar histórico CSV descarga los registros del período y los hoteles filtrados, con importes en CLP. Los filtros temporales no alteran las tarjetas del estado operativo actual.
