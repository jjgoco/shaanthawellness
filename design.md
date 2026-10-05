---
name: Shaantha Wellness
description: Contrato visual para la migración de la web publicada a Astro
source_commit: ea296005b9c9add8991d1f6e4b421185628e98f1
colors:
  bg: "#FBF6EF"
  surface: "#EDDFD3"
  text: "#6B4A42"
  accent: "#6B4A42"
  accent-700: "color-mix(in oklch, black 20%, #6B4A42)"
  accent-800: "color-mix(in oklch, black 32%, #6B4A42)"
  divider: "color-mix(in srgb, #6B4A42 16%, transparent)"
typography:
  display:
    fontFamily: '"Cormorant Garamond", Baskerville, Georgia, serif'
    fontSize: "clamp(44px, 6.4vw, 88px)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.015em"
  home-body:
    fontFamily: '"Cormorant Garamond", Baskerville, Georgia, serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  article-body:
    fontFamily: '"Cormorant Garamond", Baskerville, Georgia, serif'
    fontSize: "17px"
    lineHeight: 1.65
rounded:
  sm: "8px"
  md: "16px"
  lg: "28px"
  pill: "999px"
spacing:
  "1": "4.4px"
  "2": "8.8px"
  "3": "13.2px"
  "4": "17.6px"
  "6": "26.4px"
  "8": "35.2px"
---

# Contrato visual de Shaantha Wellness

## Overview

[comprobado] Referencia examinada: `git show HEAD` de `web`, commit `ea296005b9c9add8991d1f6e4b421185628e98f1`. Se consultaron los estilos de portada, `assets/blog.css`, las cinco páginas del alcance y el banner de consentimiento. La fuente local modificada de portada no es la referencia de este contrato.

[comprobado] La guía de marca en `marca/Paleta/paleta-shaantha.md` define marfil, rosa arena, marrón tostado y Cormorant Garamond. Describe una estética calma, natural y mediterránea-ayurvédica, con botones píldora y el Recovery Pass sobre rosa arena.

Conservar ese mundo visual. El rasgo reconocible es la fotografía circular de masaje junto al titular serif, el logotipo centrado y las superficies suaves. La portada busca la reserva por WhatsApp; las páginas interiores facilitan la lectura. La migración cambia cómo se construye y entrega el sitio.

Aplicación de las skills: `frontend-design` para identificar y preservar identidad; `apple-design` y `emil-design-eng` para respuesta inmediata, foco y preferencias de accesibilidad; `impeccable` para extraer la autoridad visual existente. No se propone un rediseño ni un cambio de tipografía. La revisión visual final corresponde a las capturas de referencia y candidato, a 390, 768 y 1440 px.

## Colors

[comprobado] En `index.html` hay dos declaraciones `:root`. La segunda, líneas 392–434 del commit de referencia, sobrescribe la primera. Los valores normativos del frontmatter son los efectivos tras esa sobrescritura, no los colores terracota/oliva anteriores.

Mantener las mezclas CSS en su espacio de color original: `oklch` para las rampas, `srgb` para transparencia, divisores y sombras. No reemplazarlas por hex aproximados.

| Rol | Regla que se conserva |
| --- | --- |
| Fondo | `--color-bg: #FBF6EF` |
| Superficie / pass | `--color-surface: #EDDFD3` |
| Texto y CTA | `--color-text` y `--color-accent: #6B4A42` |
| Links | `accent-700`; hover `accent-800` |
| Texto atenuado | `color-mix(in srgb, var(--color-text) 90%, transparent)` |
| Accent 100/200/300 | Marrón al 9%/20%/36% mezclado con marfil en OKLCH |
| Accent 400 | Blanco al 18% mezclado con marrón |
| Accent 600/700/800/900 | Negro al 10%/20%/32%/46% mezclado con marrón |
| Arena 100/200 | Arena al 45% con marfil / arena puro |
| Arena 300–800 | Marrón al 12%/26%/40%/55%/70%/85% mezclado con arena |
| Neutral 100–800 | Marrón al 5%/12%/18%/38%/55%/68%/80%/90% mezclado con marfil |

Los textos claros de CTA tienen actualmente pequeñas diferencias por bloque (`#fff` o `#FBF6EF`). Conservar la variante concreta de cada bloque para evitar una modificación visual inadvertida.

## Typography

[comprobado] Cormorant Garamond se usa tanto en titulares como en cuerpo, con fallback Baskerville/Georgia/serif. Los `@font-face` existentes declaran 400/500/600 normales contra los mismos archivos WOFF2 y 400 cursiva. Caprasimo y Figtree se declaran en el CSS inicial, pero los tokens efectivos de heading y body seleccionan Cormorant.

Conservar los binarios y la selección actual de fuente antes de cualquier optimización adicional. No tratar los pesos declarados como prueba de que el archivo contenga ejes variables: eso requeriría inspección del archivo. Una conversión de las declaraciones a rangos debe preservar el resultado renderizado.

[comprobado] Escala y excepciones observadas en el código:

| Elemento | Tamaño / peso / interlineado |
| --- | --- |
| Base portada | 15 px / 400 / 1,55 |
| H1 hero | `clamp(44px, 6.4vw, 88px)` / 400 / 1,06 |
| H2 secciones | `clamp(30px, 3.4vw, 44px)` / 400 / 1,12 |
| H2 práctica | `clamp(30px, 3.6vw, 46px)` / 400 / 1,12 |
| H3 pass | `clamp(24px, 2.8vw, 34px)` / 400 / 1,15 |
| Precio pass | `clamp(44px, 4.6vw, 60px)` / 400 / 1 |
| Cuerpo hero | 17 px / 400 / 1,65; ancho 52ch |
| Cuerpo surf/práctica | 16 px / 400 / 1,7; ancho 54ch |
| Pregunta FAQ | 19 px / 400 / 1,4 |
| Respuesta FAQ | 15,5 px / 400 / 1,65; ancho 58ch |
| Eyebrow principal | 13 px / 600 / tracking 0,06em; versales |
| Tarjeta | título 17 px; cuerpo 13 px; kicker 10 px; meta 11 px |
| Cuerpo interior | 17 px / 400 / 1,65 |
| H1 interior | `clamp(36px, 5.5vw, 56px)` / 400 / 1,15 |
| H2 interior | `clamp(24px, 3.4vw, 32px)` / 400 / 1,15 |

[comprobado] Los títulos heredan `letter-spacing: -0.015em`. Muchos H1/H2 de portada ajustan `margin-left: -0.028em`. Los párrafos interiores tienen ancho máximo de 68ch, las listas 66ch. Se usa `text-wrap: pretty`.

Mantener `font-display: swap` y las fuentes locales. Precargar solo la fuente normal crítica. No cambiar texto, tamaño o tracking para forzar resultados de Lighthouse; la distribución de líneas debe coincidir con la referencia en una misma pantalla.

## Layout

[comprobado] El código combina límites de contenedor, `clamp`, flex wrap y grids auto-fit. No existe un único breakpoint que gobierne todas las secciones.

| Zona | Contrato de geometría |
| --- | --- |
| Secciones de portada | Máximo 1200 px; padding horizontal `clamp(20px, 5vw, 72px)` |
| Hero | Padding vertical `clamp(48px, 8vh, 96px)` arriba y `clamp(40px, 6vh, 72px)` abajo; gap `clamp(32px, 5vw, 48px)` |
| Hero texto / foto | Bases flex 420 / 280 px; foto máximo 400 px; conservar el ajuste por flex wrap |
| Treatments | Grid `repeat(auto-fit, minmax(250px, 1fr))`; gap 20 px; margen superior 36 px |
| Surf | `flex-wrap: wrap-reverse`; texto base 360 px; foto base 280 px; foto máximo 400 px |
| Práctica | Foto base 260 px y máximo 360 px; texto base 360 px; gap `clamp(32px, 5vw, 80px)` |
| Galería | Grid auto-fit con mínimo 220 px; gap 20 px; margen superior 32 px |
| Reviews | Grid auto-fit con mínimo 260 px; gap 20 px |
| Visit | Grid auto-fit con mínimo 280 px; gap 32 px; pareja foto/mapa con gap 12 px |
| FAQ | Columna máximo 720 px; margen superior 24 px |
| Interior | `.wrap` máximo 760 px; padding lateral `clamp(20px, 5vw, 48px)` |

[comprobado] Breakpoints explícitos: a 720 px se oculta el Book del header y se reduce el padding de navegación; a 520 px el banner de consentimiento pasa a columna con botones de igual ancho. Las demás transiciones de columnas dependen del contenido y del ancho disponible.

Conservar las diferencias de cabecera y pie entre portada e interiores mediante variantes de componentes. No aplicar la cabecera flotante de portada a los artículos.

## Elevation & Depth

[comprobado] Sombras efectivas: small `0 1px 2px` con marrón al 14%, medium `0 3px 10px` al 16%, large `0 12px 32px` al 22%, mezcladas con transparencia en sRGB.

[comprobado] La navegación principal es sticky, con margen superior 10 px (8 px móvil), fondo marfil al 85%, `backdrop-filter: blur(14px) saturate(1.3)`, borde de texto al 8% y sombra large. Su grid `1fr auto 1fr` centra el logotipo con independencia de los extremos.

Conservar `overflow-x: clip` en `html`, evitando trasladarlo a `body` y alterar el comportamiento sticky. Las preferencias de reducción de transparencia pueden hacer sólido el fondo conservando su color, sin modificar el estado estándar.

## Shapes

[comprobado] Recortes CSS y dimensiones declaradas de las fotografías:

| Recurso | Dimensiones declaradas | Recorte / forma visible |
| --- | --- | --- |
| hero | 667 × 1000 | Círculo 1:1; máximo 400 px; `object-fit: cover`; centro |
| home en surf | 922 × 576 | 4:5; máximo 400 px; radio 24 px; cover centro |
| tabea | 829 × 1000 | 4:5; máximo 360 px; radio `180px 180px 32px 32px`; cover centro |
| gal-1 | 667 × 1000 | 4:5; radio 24 px; cover centro |
| gal-2 | 900 × 900 | 4:5; radio 24 px; cover centro |
| gal-3 | 720 × 480 | 4:5; radio 24 px; cover centro |
| gal-4 | 1300 × 867 | 4:5; radio 24 px; cover centro |
| mandala | 1000 × 625 | Mitad del bloque foto/mapa 16:10; radio 24 px; cover centro |
| home en Visit | 922 × 576 | 16:10; radio 24 px; cover centro |

Conservar el recorte CSS del contenedor al introducir `picture` y srcset. `picture` no debe crear márgenes, otro ratio ni un nuevo nodo que impida a la imagen ocupar el 100% del ancho y alto. Mantener `object-position: center` mientras no se apruebe otro punto de recorte.

[comprobado] El hero añade un círculo arena desplazado mediante `inset: -28px 28px 28px -28px`. Las tarjetas efectivas tienen radio `calc(28px * 1.15)` (32,2 px), por una sobrescritura posterior. Los CTA y tags son píldoras; la caja final de reserva tiene radio 40 px; la caja CTA interior, 28 px.

## Components

[comprobado] Contratos de componentes y comportamiento existentes:

| Componente | Forma y comportamiento que se conservan |
| --- | --- |
| Header portada | Logo declarado 157 × 84, altura 84 px; Book de escritorio; botón menú circular 56 × 56; SVG menú de 28 px |
| Header interior | Logo a 44 px de alto, enlace de vuelta; flex con extremos separados |
| Menú | Overlay fijo `inset: 0`, marfil, z-index 200; padding 20 px; enlaces 32 px; logo de 42 px; botón cerrar 56 px; Book al pie |
| Botón portada | Base 13 px / 1,2; padding `calc(8.8px * .85) 13.2px`; variantes e inline actuales conservados |
| Botón interior | 15 px / 1; padding 13 × 24 px; píldora |
| Tarjeta tratamiento | Padding 13,2 px; arena salvo la combinación en marrón; bloque enlazado a WhatsApp |
| FAQ | `details` y `summary` nativos; líneas punteadas; hover de fondo al 7% |
| WhatsApp flotante | 58 × 58 px; offsets derecho/inferior 22 px; z-index 50; fondo arena-600; sombra large |
| Banner | Fijo inferior; marfil; Cormorant; z-index 999; texto 15 px / 1,5; botones 14 px; padding 18 px y lateral `clamp(16px,4vw,32px)` |

[comprobado] Hover de navegación/FAQ y fondo de botones: 150 ms ease. Las tarjetas de elevación, CTA destacados y WhatsApp flotante suben 2 px en hover. El código de referencia abre/cierra el menú por clic; no declara Escape ni gestión del foco.

Correcciones de comportamiento autorizadas que no requieren rediseño:

| Before | After | Why |
| --- | --- | --- |
| [comprobado] Botón de menú sin `aria-expanded` ni `aria-controls` | Exponer estado y relación con el panel | El lector de pantalla identifica el control y su estado |
| [comprobado] Menú sin cierre por Escape ni restauración de foco | Abrir con foco dentro, contener Tab, cerrar con Escape/enlace/botón y devolver foco | El panel se usa completo con teclado |
| [comprobado] Hover con desplazamiento sin preferencia de movimiento reducido | Suprimir desplazamiento con `prefers-reduced-motion: reduce` | Mantener respuesta de color sin movimiento |
| [comprobado] Logo interior sin dimensiones explícitas en HTML | Añadir dimensiones intrínsecas preservando altura CSS 44 px | Reservar espacio antes de descargarlo |
| [comprobado] Mapa iframe que carga al acercarse el viewport | Placeholder local dentro del mismo contenedor, botón de carga y enlace externo | El cambio de mapa por clic ya fue aprobado; mantener marco y proporción |
| [comprobado] Analytics descargado en el head antes de la elección | Descargar después de aceptar y detener al revocar | Comportamiento aprobado, sin cambios al diseño del banner |

Los SVG de logo, Instagram, WhatsApp, menú y cierre deben conservarse como SVG estáticos. No introducir una librería de iconos ni un runtime de animación. Las mejoras de foco pueden ser visibles durante el uso por teclado; no deben alterar el estado de reposo.

## Do's and Don'ts

- Usar como maqueta la copia publicada de HTML+CSS. Extraer componentes después de contrastar portada e interior con esa referencia.
- Consolidar tokens y CSS sin cambiar precedencia efectiva, herencia, radios calculados, wrapping, orden de secciones ni textos.
- Mantener fotos, colores, logotipo y recortes. Comprimir imágenes a calidad contrastada visualmente.
- Excluir Caprasimo/Figtree y componentes CSS no usados solo después de comprobar que ningún selector conservado los necesita.
- No añadir animaciones de entrada, parallax, scroll reveals, carruseles, sombras nuevas o cambio de iconos.
- No convertir todos los márgenes y tamaños a una escala nueva: los `clamp`, unidades `vh`, inline concretos y variantes forman parte de la referencia.
- Revisar hover, teclado, menú abierto, FAQ abierto y banner, además de la captura inicial.

**Terminado**: extracción del contrato de diseño. La comparación visual y la aprobación de cualquier diferencia perceptible pertenecen a la validación del candidato.
