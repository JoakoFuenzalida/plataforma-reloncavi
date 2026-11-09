# Prototipo VORA: requisitos y plan de trabajo (versión 2)

Revisión 2 del 7 de noviembre de 2026. Corrige y completa la versión 1 del mismo día. Base documental: carpeta «CONTEXTO FEP CASO» (subdocumentos .tex vigentes y formularios), Bases Administrativas, Bases Técnicas Transversales (BTT), Bases Técnicas del Caso 05 y aclaraciones del Informe 3 del 1 de noviembre. El prototipo aún no se ha construido; este documento fija qué se construye, con qué criterio y en qué orden.

## 0. Cambios respecto de la versión 1

1. Se agregan cuatro decisiones previas a construir (sección 4): herramienta, alojamiento por seis meses, identidad visual y oferta del deseable RT-25.10. La v1 las dejaba abiertas y condicionan todo lo demás.
2. Cada bloque del numeral 25.2 queda trazado a los RF del catálogo (RF-01 a RF-66) y a la etapa en que se implementan (sección 5).
3. La excepción del proceso principal queda fundamentada con datos del caso (habitación asignada que aún no está lista). La v1 la dejaba pendiente.
4. «Gestión de terceros» incorpora el padrón único de huéspedes como contraparte principal. La v1 solo consideraba agencias, turoperadores y empresas, y dejaba el padrón sin pantalla, aunque es un criterio de aceptación del caso (CA 6).
5. Se incorporan las cinco innovaciones del Subdocumento 13 en pantallas concretas.
6. Se fija una fecha simulada coherente con el cronograma contractual para todos los datos del prototipo.
7. Se agregan el plan día a día hasta el Informe 3 y una lista de control con los errores observados en el Informe 1.
8. Se precisa el tratamiento de precios: las tarifas de habitación ficticias son necesarias (el motor de reserva las exige) y no infringen el Art. 50.2. Lo prohibido es mostrar cifras del contrato de VORA.
9. Se corrige la referencia del T-12: la columna «Sección y evidencia» de RT-25.01 a RT-25.09 debe apuntar a un anexo que exista.

## 1. Fuentes que gobiernan la entrega

| Fuente | Qué fija |
|---|---|
| BTT, Cap. 25 | Especificación del prototipo: alcance mínimo (25.2), principios (RT-25.01 a 25.05), componentes (25.4), entrega (RT-25.06 a 25.10) y penalizaciones (25.6). |
| BTT, Anexo C, ítem 27 | «Prototipo interactivo y arquitectura de información», con el Informe 3. |
| BTT, Anexo C, ítem 17 | «Sistema de diseño e informe de conformidad de accesibilidad», Sobre N° 2. |
| Aclaraciones Informe 3 (1-nov), puntos 1.b y 2 | Con el Informe 3 basta un avance en enlace navegable, con una navegación rápida dentro de los 15 minutos. La versión completa (25.2 y RT-25.06 a 25.09) va con la propuesta final. |
| Bases Administrativas, Art. 26 | WCAG 2.2 AA con informe de conformidad; diseño centrado en usuarios reales; indicadores de usabilidad comprometidos. |
| Formulario T-20 | Informe 3: 13-nov-2026. Presentación 3: 13 al 20-nov. Propuesta final: 25-nov-2026, hasta las 14:00. |
| Formulario T-12 (parte3_rt.tex) | Declara «Cumple» en RT-25.01 a 25.09 y «No cumple» en RT-25.10. Compromete en RT-13.04: check-in en 90 s, máximo tres interacciones y operación autónoma en 4 h. Declara Angular 22 (PWA) para las interfaces web y la app operativa, y Kotlin y Swift para la app del huésped. |
| Subdocumento 3, 02_alcance_etapas.tex | Reparto de RF por servicio (S1 a S6) y por etapa; 96 h sin enlace en lodges y 24 h en urbanos; fidelización fuera de la línea base (Consulta N° 5). |
| Caso 05, Caps. 2, 7, 9, 10, 16 y 18 | Portafolio de nueve hoteles, indicadores del problema, restricciones, decisiones pendientes y criterios de aceptación. |
| Subdocumento 13 | Cinco innovaciones vigentes. |

## 2. Qué representa el prototipo

Es una interfaz de alta fidelidad de la plataforma que VORA propone para Hoteles Reloncaví. Tiene navegación completa y comportamiento simulado. No requiere backend, base de datos, integraciones, autenticación real ni persistencia (25.6), pero sí debe simular de forma realista los flujos «desde la perspectiva de los distintos perfiles» (25.1).

Criterios de presentación:

- **Selector de perfil de demostración.** Lo primero que ve el evaluador es una portada que permite entrar como huésped, recepcionista, camarera de housekeeping, técnico de mantenimiento, gerente de hotel, gerencia comercial o administración de TI, sin credenciales reales. También se puede usar el inicio de sesión simulado.
- **Rótulo discreto y permanente** «Prototipo con datos ficticios». No es una nota de trabajo: aclara la naturaleza del entregable.
- **Fecha simulada fija: jueves 18 de enero de 2029.** Con el contrato iniciado en enero de 2027 (mes 1), la Etapa 1 entra en producción en abril de 2028 (mes 16) y la Etapa 2 en septiembre de 2028 (mes 21). Esa fecha muestra la solución completa en operación, en temporada alta, con el Lodge Torres del Paine abierto (opera de octubre a abril) y con personal de temporada activo.
- **Portada pública con la marca de Hoteles Reloncaví,** no la de VORA. La web corporativa de VORA (Cap. 23) y el video (Cap. 24) son entregables distintos. Las vistas internas pueden llevar «Plataforma operada por VORA» en el pie.

## 3. Plazos

| Fecha | Hito | Contenido del prototipo |
|---|---|---|
| Vie 13-nov | Entrega del Informe 3 | Avance publicado en su URL definitiva (sección 8). |
| 13 al 20-nov | Presentación 3 | Navegación guiada de unos 3 minutos dentro de los 15 de exposición. |
| Mié 25-nov, 14:00 | Propuesta final | Alcance completo de 25.2, RT-25.01 a 25.09, arquitectura de información, sistema de diseño e informe de accesibilidad. |

## 4. Decisiones previas a construir

Se registran en el ADR con el correlativo siguiente al último vigente (el T-12 cita D1 a D59), para no contradecir el Subdocumento 4.

**DP-1. Herramienta: aplicación web de frontend en Angular, con datos simulados en memoria.**
- *Alternativa descartada:* prototipo en una herramienta de diseño (Figma u otra). Esas herramientas no ofrecen navegación completa por teclado ni validación real en tiempo real (RT-25.03, RT-25.08). Además, obligan a dibujar cada pantalla en cinco tamaños (RT-25.04) y no permiten carga de archivos ni filtrado reales.
- *Criterio:* el T-12 declara Angular 22 (PWA) como tecnología de las interfaces web y de la app operativa. Un prototipo construido con la misma tecnología funciona como semilla del frontend productivo: el sistema de diseño y los componentes son reutilizables, que es lo que protege el numeral 25.7.
- *Consecuencia:* las vistas de la app del huésped se simulan en web a 375×812. En el documento de arquitectura de información se declara que en producción esa app es nativa (Kotlin y Swift), para no cambiar inadvertidamente la arquitectura declarada.

**DP-2. Alojamiento por un mínimo de seis meses (RT-25.07).**
- Sitio estático publicado en un servicio de alojamiento sin vencimiento, bajo una cuenta institucional de VORA, no personal. Opción preferente: Amazon S3 con CloudFront, coherente con la arquitectura declarada. Alternativa: GitHub Pages en una organización de VORA.
- Se fija un responsable, la URL definitiva desde el avance del Informe 3 (no se cambia después) y una verificación desde una sesión anónima y otro dispositivo.

**DP-3. Identidad visual (RT-25.05).**
- Hasta cinco colores principales y hasta dos familias tipográficas con licencia libre (por ejemplo, de Google Fonts, para no infringir derechos de autor).
- Contraste AA verificado para cada combinación de texto y fondo antes de usarla.
- Se declara como propuesta de identidad, sujeta al manual de marca que entregue el CLIENTE.

**DP-4. Oferta del deseable RT-25.10 (exportación para revisión sin conexión).**
- Se puede cumplir con poco esfuerzo, de dos maneras: (a) un documento PDF navegable, generado automáticamente desde el prototipo, con una captura por pantalla y enlaces entre ellas; (b) la instalación del prototipo como PWA, que queda disponible sin conexión.
- Si se entrega, se cambia el T-12 de «No cumple» a «Cumple» y se indica la evidencia. Se decide una vez construida la base, no antes.

## 5. Alcance mínimo final (numeral 25.2) aplicado al caso

Etapa: E1 = producción en el mes 16; E2 = producción en el mes 21 (Subdocumento 3). El prototipo muestra la solución completa; la etapa se declara solo en el documento de arquitectura de información.

| Bloque 25.2 | Pantallas propuestas | RF y fuentes | Etapa |
|---|---|---|---|
| **Portal principal** | Inicio público de Reloncaví con búsqueda de disponibilidad de los nueve hoteles, en español e inglés y con varias monedas; inicio con sesión según perfil; tablero con tarjetas que el usuario reordena y oculta; menú principal; rastro de navegación; menú contextual por módulo. | RF-06; RT-16.30; Restricción 13 | E1 |
| **Autenticación e incorporación** | Inicio unificado con tres modos según perfil: huésped (correo y código), personal administrativo (correo corporativo con segundo factor) y terreno (credencial física y PIN corto en dispositivo compartido). Registro del huésped en cinco pasos: datos, documento, idioma y preferencias, consentimiento de datos y verificación. Recuperación de acceso. Segundo factor. Primer ingreso guiado para el personal de temporada. | RF-33, RF-38, RF-44; D28; RT-22.04 | E1 |
| **Proceso principal** | Reserva → registro previo → check-in → estadía → check-out, en seis pasos (detalle en 5.1). | Ver 5.1 | E1 |
| **Proceso secundario** | Bloqueo de habitación por mantenimiento: listado de órdenes, detalle, creación desde el reporte de housekeeping con causa obligatoria, y aprobación de liberación tras la lista de chequeo. La habitación vuelve a quedar vendible. | RF-41, RF-35, RF-21; decisión pendiente 10 (Cap. 16.1); CA 12 y 13 | E1 |
| **Perfil de terreno** | App operativa de housekeeping: ingreso con credencial y PIN, lista de habitaciones priorizada, cambio de estado, reporte de incidencia con foto y lista de chequeo. Recepción móvil para llegadas de grupos. Modo sin enlace (detalle en 5.2). | RF-22, RF-23, RF-40, RF-41, RF-31, RF-32, RF-28, RF-29; CA 11 y 21 | E1 |
| **Gestión de terceros** | Directorio con tres pestañas. **Huéspedes (padrón único):** ficha, historial en toda la cadena, preferencias, roles de quién reserva, quién paga y quién se aloja, posibles duplicados con fusión supervisada, evaluación por NPS e incidencias. **Agencias y turoperadores:** contrato, cupos, comisión pactada contra comisión aplicada, evaluación de cumplimiento e historial. **Empresas con convenio:** tarifa negociada y condiciones. | RF-09, RF-10, RF-36, D23, D24, CA 6 (huéspedes); RF-04, RF-25, RF-56 (agencias); RF-57 (empresas) | E1 (huéspedes); E2 (portales) |
| **Tablero analítico** | Ocupación, tarifa media (ADR) y RevPAR con definición única visible en una ayuda contextual; ventas por canal; tiempo de check-in; tiempo entre salida y habitación vendible; NPS de llegada. Seis tipos de gráfico: barras, líneas, anillo, área, dispersión y mapa de calor (ocupación por día y por hotel). Filtros por período, hotel y categoría. Detalle desde el indicador hasta el hotel y hasta el registro. Exportación. | RF-34, RF-65; CA 5 | E1 / E2 |
| **Administración** | Usuarios, roles y permisos por hotel. Alta masiva de personal de temporada mediante un archivo que se arrastra a la pantalla. Reglas con aprobación dual: política de sobreventa urbana, tarifa protegida en lodges y ventanas de congelamiento. Consulta y exportación de la auditoría inalterable. | RF-38, RF-61, RF-46, RF-39, RF-50, RF-62; Restricción 12 | E1 |
| **Módulo adicional 1: Sostenibilidad y Folio Verde** | Consumo por zona; prorrateo con metodología declarada; marca de «medido» o «estimado»; Folio Verde provisional al salir y definitivo tras el cierre mensual; expediente auditable. | RF-30, RF-47, RF-48, RF-51; Innovación 5; CA 15 | E1 (captura); E2 (reporte auditable) |
| **Módulo adicional 2: Eventos y salones** | Calendario de salones con bloqueo que impide el doble compromiso; cotización el mismo día; contrato con firma electrónica. | RF-26, RF-59; CA 18 | E2 |

Fuera del prototipo, por coherencia con el alcance: el programa de fidelización (RF-37, fuera de la línea base según la Consulta N° 5) y el costeo de alimentos y bebidas (no es exigido por 25.2).

### 5.1 Proceso principal: seis pasos y excepción

| Paso | Perfil | Pantalla | RF y compromisos |
|---|---|---|---|
| 1. Búsqueda y reserva directa | Huésped | Buscador, resultados por hotel, selección y pago simulado. En un lodge sin cupo, se muestra «sin disponibilidad»: no se sobrevende. | RF-06, RF-02, RF-46; Restricción 3 |
| 2. Confirmación | Huésped | Confirmación y notificación en el idioma declarado. | RF-49 |
| 3. Registro previo desde el teléfono | Huésped (375×812) | Ficha de registro digital, captura de documento (arrastrar o cámara simulada), firma electrónica y verificación de la exención de IVA con su evidencia. | RF-11, RF-12, RF-58, RF-13, RF-14; CA 8 y 9 |
| 4. Check-in en recepción | Recepción | Llegadas del día; se verifica el documento, se asigna la habitación y se entrega la llave: llave electrónica en los cuatro hoteles con cerradura electrónica, tarjeta o llave mecánica en los otros cinco. Recomendación proactiva para el huésped. Objetivo visible: 90 s. | RF-15, RF-16; Restricción 7; RT-13.04; Innovación 1; CA 7 |
| 5. Estadía y cargos | Recepción / punto de venta | Cargos al folio, solicitud de servicios y extensión de estadía. | RF-17, RF-19 |
| 6. Check-out y cierre | Recepción y huésped | Liquidación, cobro tokenizado simulado, Folio Verde provisional y encuesta NPS de llegada. | RF-52; Innovaciones 4 y 5 |

**Excepción más frecuente: la habitación asignada todavía no está lista.** Fundamento en el caso:
- El tiempo entre la salida y la habitación disponible es de 3 h 48 min, y llega a 6 h 30 min en alta ocupación (Cap. 7.2).
- La espera en el check-in y el estado de la habitación son las principales causas de reseñas negativas (Cap. 7.2).
- Housekeeping no conoce la prioridad de limpieza (CA 11 y 21).

En comparación, las sobreventas fueron 41 en el año sobre unas 87.000 reservas (Caps. 2.2 y 7.1). Son de mayor impacto, pero mucho menos frecuentes; se tratan como un estado bloqueado en el paso 1, no como la excepción del flujo.

Cómo se resuelve en pantalla: la recepción ve el estado en tiempo real y tiene tres alternativas:
1. Otra habitación lista del mismo tipo, o una de categoría superior.
2. Una solicitud de prioridad, que sube esa habitación al primer lugar de la lista de housekeeping (se ve también en la app de terreno).
3. La espera con aviso al huésped cuando la habitación quede lista.

RF-20, RF-22 y RF-40.

### 5.2 Escenario sin enlace (lodge)

Un control de demostración permite simular la pérdida de enlace en un lodge:
- Aparece un indicador permanente con las horas transcurridas sobre un máximo de 96.
- Siguen operando el check-in, la llave mecánica, los cargos y el cobro contra la preautorización.
- Se distinguen los datos locales de la información central pendiente de actualizar.
- Una cola muestra las operaciones pendientes y el riesgo de rechazo de cada cobro (Innovación 3).
- Al reconectar, se ve la sincronización sin pérdida de cargos.

RF-28 y RF-29; Restricción 2; CA 14; D13 a D15. El prototipo representa el comportamiento; no prueba la resiliencia real.

## 6. Requisitos transversales y evidencia

| Código | Condición de aceptación | Evidencia |
|---|---|---|
| RT-25.01 | Toda función principal se alcanza en un máximo de tres interacciones desde el inicio del perfil (coincide con RT-13.05 del T-12). | Tabla de recorridos en la arquitectura de información, con el número de interacciones de cada función. |
| RT-25.02 | Respuesta visual, carga, transiciones y errores que dicen qué ocurrió y qué hacer. | Estados de éxito, error, carga y vacío reproducibles en cada módulo. |
| RT-25.03 | WCAG 2.2 AA: contraste, objetivos de al menos 44×44 px, teclado, foco visible y etiquetas. | Revisión automatizada y manual, documentada en el informe de conformidad (Anexo C, ítem 17). |
| RT-25.04 | 1920×1080, 1366×768, 768×1024 vertical y horizontal, y 375×812. | Capturas de cada tamaño en el anexo; prueba sin superposiciones ni controles inaccesibles. |
| RT-25.05 | Sistema de diseño documentado: hasta 5 colores y 2 familias tipográficas, iconografía, retícula y componentes. | Documento del sistema de diseño (Anexo C, ítem 17). |
| RT-25.06 | Enlace navegable sin instalación. | URL definitiva verificada desde una sesión anónima. |
| RT-25.07 | Acceso por un mínimo de seis meses. | Alojamiento institucional y responsable (DP-2). |
| RT-25.08 | Navegación completa, datos simulados, animaciones, estados de posado y activo, carga de archivos, desplegables y validaciones. | Batería de recorridos con datos ficticios. |
| RT-25.09 | Mapa del sitio, diagrama de navegación, taxonomía, menús y jerarquía. | Documento de arquitectura de información que coincide con lo construido. |
| RT-25.10 | Exportación para revisión sin conexión (deseable). | Según DP-4. |

Los seis pasos del proceso principal y las tres interacciones como máximo no se contradicen: una cosa es llegar a la función y otra completar su procedimiento.

### Componentes obligatorios del numeral 25.4

Para cada componente, la matriz de pantallas indica en qué pantalla se demuestra. Ninguno se deja «para la versión final» sin una pantalla asignada.

- **Navegación:** menú principal y contextual, rastro, paginación, pestañas, acordeones, pasos y acciones rápidas.
- **Formularios:** validación en tiempo real, desplegables, casillas, opciones, selector de fecha y hora, arrastrar y soltar archivos (documento del huésped, foto de incidencia, planilla de alta masiva), autocompletado (búsqueda de huésped) y formularios de varios pasos.
- **Datos:** tablas ordenables y filtrables, gráficos de barras, líneas y circular, tarjetas, líneas de tiempo (historial del huésped, auditoría), progreso, etiquetas y ayuda contextual.
- **Respuesta:** éxito, error, advertencia, información, modales, notificaciones, esqueletos de carga, progreso y estados vacíos ilustrados.
- **Acción:** tres jerarquías de botón, botón flotante (nueva incidencia en la app de terreno), acciones en línea, menús contextuales, acciones masivas (asignar habitaciones a una camarera) y confirmación de acciones críticas (liberar una habitación, fusionar huéspedes).

## 7. Coherencia con la propuesta escrita

Los datos simulados usan las cifras reales del caso: nueve hoteles con sus habitaciones (Santiago Centro 168, Aeropuerto Santiago 120, Concepción 96, Puerto Montt 140, Puerto Varas 88, Lodge Cochamó 24, Lodge Aysén 32, Lodge Torres del Paine 42 y Punta Arenas 110: 820 en total), sus tipos de llave y sus enlaces. La interfaz habla en términos de las tareas de cada usuario; no muestra los códigos S1 a S6.

Reglas que condicionan las pantallas:

1. Cupos particionados: no se simulan confirmaciones ilimitadas. Los lodges no admiten sobreventa; en los hoteles urbanos se aplica la política declarada, con su autorización.
2. Padrón único: el mismo huésped conserva su identidad en todos los hoteles; se separa quién reserva, quién paga y quién se aloja (D24).
3. Operación local: 96 h sin enlace en lodges y 24 h en urbanos como escenario de diseño.
4. Pagos y documentos: datos ficticios; el sistema administrativo existente sigue siendo el único emisor tributario (Restricción 5).
5. Habitaciones: el ciclo check-in → ocupada → salida → limpieza → inspección → disponible es coherente entre recepción, housekeeping y mantenimiento. Una habitación no se libera con un simple cambio de estado.
6. Terreno: dispositivo compartido, controles grandes y cambio rápido de operador; no se exige correo personal al personal de housekeeping.
7. Huéspedes: español e inglés en todas las vistas del huésped.
8. Sostenibilidad: medición por zona y prorrateo declarado; el resultado no se presenta como una medición directa de la habitación.
9. Fidelización: no aparece como funcionalidad (fuera de la línea base).
10. **Precios:** las tarifas de habitación son ficticias y verosímiles, y son necesarias para el motor de reserva (RT-16.30). No se muestra ninguna cifra del contrato de VORA (costos, licencias, mensualidades de operación), conforme al Art. 50.2.

## 8. Avance para el Informe 3 (viernes 13 de noviembre)

| Prioridad | Contenido |
|---|---|
| 1 | Base: sistema de diseño (colores, tipografía, componentes), estructura de página, menú, rastro, portada con el selector de perfil y cambio de idioma en las vistas del huésped. |
| 2 | Portal público, búsqueda y reserva (pasos 1 y 2). |
| 3 | Registro previo en el teléfono (paso 3) y check-in en recepción (paso 4) con la excepción de habitación no lista. |
| 4 | App de housekeeping con la lista priorizada, conectada al estado de las habitaciones. |
| 5 | Simulación sin enlace en un lodge, con la cola y la sincronización. |
| 6 | Tablero gerencial inicial con al menos tres tipos de gráfico y la definición única del RevPAR. |
| 7 | Publicación en la URL definitiva y guion de navegación de unos 3 minutos. |

El menú del avance muestra solo lo construido: no se publican enlaces rotos (25.6 los penaliza).

| Día | Trabajo |
|---|---|
| Sáb 7 y dom 8 | Mapa de pantallas con trazabilidad; decisiones DP-1 a DP-4; sistema de diseño base; datos simulados. |
| Lun 9 a mié 11 | Construcción de las prioridades 1 a 6. |
| Jue 12 | Publicación; prueba de teclado, contraste y cinco tamaños; guion. |
| Vie 13 | Entrega del enlace con el Informe 3. |

## 9. Versión final (14 al 25 de noviembre)

Se completan los bloques restantes:
- Registro de cinco pasos, recuperación de acceso y segundo factor.
- Proceso secundario con aprobación.
- Directorio de terceros completo.
- Administración.
- Seis tipos de gráfico, con detalle desde el indicador y exportación.
- Los dos módulos adicionales.
- Pasos 5 y 6 del proceso principal.

Después se producen el documento de arquitectura de información, el sistema de diseño, el informe de conformidad de accesibilidad y, si se oferta, la exportación del RT-25.10.

En la Oferta Técnica se agrega un anexo «Prototipo interactivo» con la URL, la arquitectura de información y el sistema de diseño. Las filas RT-25.01 a 25.09 del T-12 deben citar ese anexo en la columna «Sección y evidencia»; hoy citan «Prototipo UX/UI (Cap. 25 BTT)», que no es una sección del documento.

## 10. Lista de control antes de cada entrega

**Simulación y contenido**
- [ ] Nada menciona al profesor, al curso, a las clases ni a «Informe 3» dentro del prototipo.
- [ ] Sin «lorem ipsum», «pendiente», «en construcción», «TODO» ni textos a medias.
- [ ] «Hoteles Reloncaví» y «VORA» escritos siempre igual; nombres de hoteles idénticos a los del caso.
- [ ] Fechas coherentes con la fecha simulada y con el cronograma.
- [ ] Sin cifras del contrato de VORA.

**Funcionamiento**
- [ ] Sin enlaces rotos; cada elemento del menú lleva a una pantalla construida.
- [ ] Los datos son coherentes entre pantallas (la misma reserva, el mismo huésped, la misma habitación).
- [ ] Validaciones, estados vacíos, de error y de carga en cada módulo.

**Accesibilidad y tamaños**
- [ ] Recorrido completo por teclado con el foco visible.
- [ ] Contraste AA y objetivos de al menos 44×44 px.
- [ ] Revisado en los cinco tamaños de RT-25.04.

**Documentación**
- [ ] Mapa del sitio y menús idénticos a lo publicado.
- [ ] URL probada desde otro dispositivo y en una sesión anónima.

## 11. Siguiente entregable: mapa de pantallas

Es una tabla con una fila por pantalla y estas columnas:

| Columna | Contenido |
|---|---|
| ID | Identificador de la pantalla. |
| Ruta | Dirección de la pantalla dentro del prototipo. |
| Perfil | Perfil de usuario que la usa. |
| Bloque 25.2 | Bloque del alcance mínimo al que pertenece. |
| Componentes 25.4 | Componentes que demuestra. |
| RF | Requerimientos funcionales que cubre. |
| RT | Requisitos transversales que evidencia. |
| Innovación | Innovación del Subdocumento 13 que muestra, si corresponde. |
| Interacciones desde el inicio | Número de interacciones para llegar a la pantalla desde el inicio del perfil (RT-25.01). |
| Entrega | Avance o versión final. |

De esa tabla salen directamente el menú, el mapa del sitio (RT-25.09) y la verificación de que cada componente del 25.4 y cada bloque del 25.2 tienen una pantalla asignada.
