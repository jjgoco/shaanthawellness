# HANDOFF — Proyecto Shaantha Wellness

> Documento de traspaso de contexto para continuar el trabajo en una nueva sesión.
> Generado el 2026-07-11 desde la sesión "Shaantha Wellness business analysis".
> Repo: `jjgoco/shaanthawellness` · Rama de trabajo: `claude/shaantha-wellness-analysis-1v6jwm`

---

## 1. El negocio

| Dato | Valor |
|---|---|
| Nombre completo | **Shaantha Ayurvedic Massage & Wellness** |
| Actividad | Masajes ayurvédicos y bienestar integral (wellness) |
| Ubicación | Sagres, Vila do Bispo, Algarve, Portugal |
| Coordenadas (Google Maps) | 37.0323871, -8.9459929 |
| Instagram | [@shaanthawellness](https://www.instagram.com/shaanthawellness/) |
| Google Maps Feature ID | `0x62bd4a4eabf801c9:0x292733ea34f0e41f` |
| Ficha de Google Business | Existe (enlace largo de Maps aportado por el usuario) |
| Web propia | **No localizada** |
| Perfil de negocio | Muy nuevo o muy pequeño; probablemente terapeuta autónomo/a. Target: turistas del Algarve + residentes locales |

## 2. Objetivo de la conversación original

1. El usuario pidió analizar a qué se dedica el negocio a partir de dos enlaces (Instagram + Google Maps).
2. Después pidió una **auditoría digital en profundidad** de la huella online de la marca.
3. Después quiso preparar el arranque de un proyecto para la marca (identificar skills útiles y recopilar contexto vía `/grill-me`).

## 3. Estado del trabajo — QUÉ SE HIZO

### 3.1 Acceso a los enlaces: BLOQUEADO por política de red del entorno
- `WebFetch` y `agent-browser` (navegador real) devuelven **403 en el proxy de salida** para: `instagram.com`, `google.com`, `facebook.com`, `googlechromelabs.github.io`, `skills.sh`.
- Verificado en `curl -sS http://127.0.0.1:41821/__agentproxy/status` → `connect_rejected: gateway answered 403 (policy denial)`.
- **Conclusión:** no es bloqueo de Instagram/Google; es la política de egress del entorno remoto. No debe intentarse sortear. Soluciones planteadas: (a) usuario pega contenido/capturas, (b) usar Claude in Chrome en local, (c) admin abre la política de red, (d) crear entorno nuevo con política abierta.

### 3.2 Herramientas instaladas en el entorno (se pierden al reciclar el contenedor)
- `agent-browser` (Vercel Labs) instalado global vía `npm install -g agent-browser`.
  - La descarga de su Chrome está bloqueada; **funciona usando el Chromium preinstalado**:
    ```bash
    agent-browser --executable-path /opt/pw-browsers/chromium --args "--no-sandbox" open <url>
    ```
- `npx skills` (CLI v1.5.15) instalado; `npx skills find <query>` **no devuelve resultados** (previsiblemente su API también está bloqueada por red).

### 3.3 Auditoría digital (≈15 búsquedas web cruzadas) — HALLAZGO PRINCIPAL
**La marca prácticamente no tiene huella digital indexada** fuera de los dos enlaces del usuario:

| Categoría auditada | Resultado |
|---|---|
| Nombre exacto ("Shaantha Wellness", "Shaantha Ayurvedic Massage & Wellness", "shaanthawellness") | Sin coincidencias; solo homónimos no relacionados (Shanti/Shanta/Shaanti en EEUU, India, UAE, Londres…) |
| Redes (site:instagram/facebook/linkedin) | Sin coincidencias indexadas |
| Reseñas turísticas (TripAdvisor, Yelp) | No listada |
| Plataformas de reserva (Fresha, Treatwell, Booksy) | No presente |
| Dominios web (.com / .pt) | No indexados / no localizados |
| Registro mercantil PT (Racius, registo comercial) | Sin coincidencias con "Shaantha" |
| Directorios locales (Fixando – Vila do Bispo) | Sin coincidencias |
| Prensa/blogs del Algarve | Sin menciones |

**Competencia local en Sagres con huella fuerte** (referencia para benchmark):
- Finisterra Spa (Martinhal Sagres) — TripAdvisor con buenas reseñas
- Health Massage Sagres / "Indah" (masajista fisioterapeuta móvil) — TripAdvisor + Yelp + Facebook
- Sunbody Massage (sunbodymassage.com)
- Mandala Sagres (mandalasagres.com) — centro de yoga/wellness

**Interpretación:** negocio que depende solo de boca a boca + Instagram + ficha de Google. Enorme margen de mejora en presencia digital: web propia, plataformas de reserva, TripAdvisor/Yelp, SEO local.

### 3.4 Skills disponibles en el repo/sesión relevantes para el proyecto
Recomendación priorizada que se dio al usuario:
1. **`brand`** — voz de marca, identidad, messaging (Fase 1: identidad)
2. **`design`** — logo (55 estilos), CIP, landing HTML, banners, iconos (Fase 1-2)
3. **`banner-design`** — contenido visual para Instagram/ads (Fase 2)
4. **`ui-ux-pro-max`** + `ui-styling` — UI de web/reservas (Fase 3)
5. `slides`, `design-system`, `dataviz` — soporte puntual

### 3.5 `/grill-me` — PENDIENTE (importante para la próxima sesión)
- Existe en el repo: `.claude/skills/grill-me/SKILL.md` con `disable-model-invocation: true`; su contenido es solo `Run a /grilling session.` (el skill `/grilling` **no existe** en el repo → probablemente hay que crearlo o el usuario lo tiene en local).
- El objetivo era una **entrevista exhaustiva al usuario** para recopilar: objetivos del negocio, target, features prioritarias, timeline, presupuesto, tech stack e integraciones (booking, pagos…), y con ese contexto afinar la búsqueda de skills y el plan.
- **En la nueva sesión:** cuando el usuario invoque `/grill-me`, dado que `/grilling` no existe, lo correcto es conducir directamente la entrevista tipo "grilling" (preguntas incisivas una a una con AskUserQuestion) en lugar de buscar un skill inexistente.

## 4. Información PENDIENTE de obtener del usuario
- [ ] Contenido real del perfil de Instagram (bio, seguidores, publicaciones, servicios) — el usuario iba a usar **Claude in Chrome** (tiene la extensión) o pegar capturas.
- [ ] Ficha completa de Google Business (horarios, teléfono, reseñas, fotos, categoría).
- [ ] Respuestas de la entrevista `/grill-me` (objetivos, target, features, timeline, presupuesto, stack, integraciones).
- [ ] Relación del usuario con el negocio (¿es suyo? ¿cliente?) — no confirmado explícitamente.

## 5. Próximos pasos propuestos (plan vigente)
1. **Completar contexto**: entrevista grilling + datos de IG/Google Business.
2. **Fase 1 — Identidad**: skill `brand` (voz, paleta —tonos ayurvédicos—, messaging) → skill `design` (logo + identidad).
3. **Fase 2 — Presencia**: landing page HTML (skill `design`), material Instagram (skill `banner-design`), alta en TripAdvisor/directorios, optimizar ficha Google Business.
4. **Fase 3 — Funcionalidad**: sistema de reservas (evaluar Fresha/Booksy vs. propio; skill `ui-ux-pro-max`).

## 6. Notas del entorno (para la sesión que retome esto)
- Entorno remoto (contenedor efímero) con proxy de egress restrictivo: Instagram/Google/Facebook/skills.sh **bloqueados por política** — no reintentar; pedir el contenido al usuario o que un admin abra la política.
- Chromium preinstalado en `/opt/pw-browsers/chromium` (Playwright también configurado).
- Rama designada: `claude/shaantha-wellness-analysis-1v6jwm` (desarrollar, commitear y pushear siempre ahí).
- El repo estaba vacío salvo `.claude/` (skills). Este HANDOFF.md es el primer archivo versionado.
- El usuario (Juanjo, jjgomezcorredor@gmail.com) trabaja desde la app de escritorio de Claude, en español; alterna modelos con `/model`.
