# Reglas Cursor — PBX Admin

Reglas del agente en `rules/*.mdc`. Cada archivo es un tema (overview, páginas, servicios, formularios).

- **`alwaysApply: true`**: solo `project-overview.mdc`.
- **Resto**: se activan al trabajar archivos que coinciden con `globs`.

Para añadir lógica nueva, crea otro `.mdc` con frontmatter YAML (`description`, `globs` o `alwaysApply`) y contenido breve (&lt; 50 líneas ideal).

Contexto exclusivo de este repositorio React.
