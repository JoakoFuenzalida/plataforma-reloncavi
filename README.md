# Prototipo interactivo · Plataforma Hoteles Reloncaví (VORA)

Prototipo de alta fidelidad exigido por el Cap. 25 de las Bases Técnicas Transversales (TFEP-01/2026).
Angular 22, sin backend: todos los datos son ficticios y se simulan en memoria.

## Ejecutar en local
```bash
npm install
npm start          # http://localhost:4200
```

## Publicar en Vercel (RT-25.06 y RT-25.07)
1. Subir esta carpeta a un repositorio de GitHub de VORA (cuenta institucional, no personal).
2. En vercel.com: **Add New → Project → Import** el repositorio. Vercel lee `vercel.json`:
   - Build: `npm run build`
   - Salida: `dist/reloncavi/browser`
   - Reescritura a `index.html` para que funcionen las rutas al recargar.
3. Cada `git push` a `main` publica una nueva versión en la misma URL.
4. La URL que se entrega con el Informe 3 no se cambia después.

## Estructura
- `src/styles/` sistema de diseño (tokens, base, componentes). Paleta de 5 colores y 2 familias tipográficas (RT-25.05).
- `src/app/core/` datos del caso (9 hoteles, 820 habitaciones), estado de demostración, textos ES/EN.
- `src/app/shared/` íconos (Lucide, ISC), logotipo de Reloncaví, ilustraciones de destinos, notificaciones.
- `src/app/layouts/` disposiciones (sitio público; se agregan personal y terreno).
- `src/app/pages/` pantallas.

## Reglas de contenido
- Sin menciones al curso, al profesor ni notas de trabajo en pantalla.
- Sin enlaces rotos: el menú solo muestra lo construido.
- Tarifas de habitación ficticias; ninguna cifra del contrato de VORA.
- Fecha simulada: jueves 18 de enero de 2029.
