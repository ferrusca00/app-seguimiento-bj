---
name: custom-agents
description: >-
  Guía, especificaciones y plantillas para crear, configurar y orquestar Custom Agents
  (Agentes Personalizados) en Google Antigravity 2.0 y Antigravity CLI (.agents/agents/*.md).
  Activa esta habilidad cuando el usuario solicite crear, modificar o entender agentes personalizados,
  subagentes especializados, configuración de herramientas scoped, permisos o simetría mainAgent/subagent.
---

# Antigravity Custom Agents Guide

Los **Custom Agents** son configuraciones basadas en archivos Markdown con encabezado YAML frontmatter que definen roles especializados con sus propias instrucciones de sistema, herramientas limitadas (*scoped tools*), habilidades específicas (*curated skills*) y políticas de ejecución.

Permiten dividir tareas complejas entre agentes especializados sin saturar la ventana de contexto del agente principal (*context window bloat*).

---

## 1. Ubicación y Descubrimiento en el Proyecto

Antigravity descubre agentes personalizados automáticamente en las siguientes rutas:

1. **A nivel de proyecto (Workspace):**
   - Directorio: `.agents/agents/<agent-name>.md`
   - Se incluye en el control de versiones (Git) para que todo el equipo disponga de los mismos agentes estandarizados sin configuración manual.

2. **A nivel global (Máquina local):**
   - Directorio: `~/.gemini/config/agents/<agent-name>.md`
   - Disponible para todos los proyectos del usuario.

---

## 2. Estructura de un Custom Agent

Cada agente se define en un único archivo `.md`:

```markdown
---
name: nombre-del-agente
description: Descripción concisa de qué hace y cuándo debe utilizarse.
model: inherit # inherit | flash | pro | flash_lite
tools:
  - view_file
  - replace_file_content
  - run_command
skills:
  - skills/nombre-habilidad
mainAgent: true
subagent: true
permissionMode: acceptEdits
commandExecutionPolicy: auto
---

# Instrucciones del Sistema (System Prompt)

Aquí se definen las directrices, reglas y comportamiento específico del agente...
```

---

## 3. Campos del YAML Frontmatter

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `name` | string | Identificador único del agente (letras minúsculas y guiones). |
| `description` | string | Define el rol y los criterios para que Antigravity sepa cuándo delegar en él. |
| `model` | string | Modelo a utilizar (`inherit`, `flash`, `pro`, `flash_lite`). Por defecto `inherit`. |
| `tools` | array | Lista explícita de herramientas permitidas. Previene saturación y errores de contexto. |
| `skills` | array | Subconjunto de habilidades (`skills/*`) cargadas específicamente para este agente. |
| `mainAgent` | boolean | `true`: permite seleccionarlo directamente en la interfaz de Antigravity 2.0 o ejecutarlo con `agy --agent <name>`. |
| `subagent` | boolean | `true`: permite ser invocado dinámicamente como subagente por otros coordinadores. |
| `permissionMode` | string | Modo de permisos (`acceptEdits`, `bypassPermissions`, etc.). |
| `commandExecutionPolicy` | string | `auto` permite ejecutar pruebas y compilación de forma autónoma sin alertas continuas. |

---

## 4. Características Clave de Antigravity

### A. Simetría de Ejecución (Main Agent vs. Subagent)
A diferencia de otros entornos donde los agentes personalizados solo son subagentes secundarios:
- **Como Main Agent:** Puedes iniciar una conversación directamente con él seleccionándolo en el menú desplegable de Antigravity 2.0 o mediante el CLI:
  ```bash
  agy --agent nombre-del-agente
  ```
- **Como Subagent:** Puede ser convocado en segundo plano por el agente orquestador para resolver sub-tareas aisladas en paralelo.

### B. Políticas de Seguridad Scoped (`commandExecutionPolicy: auto`)
Evita interrupciones continuas al ejecutar suites de prueba o compilaciones (`npm run build`, `npm run test`), manteniendo protegidas las operaciones críticas (como eliminación de archivos).

### C. Herramientas y Habilidades Restringidas (*Scoped Context*)
En lugar de cargar docenas de herramientas globales y MCP servers, el agente solo recibe aquellas que necesita para su especialidad, ahorrando tokens y maximizando la precisión.

---

## 5. Plantilla de Ejemplo para este Proyecto

Ver el agente especializado del proyecto en [.agents/agents/mantenimiento-supervisor.md](../../agents/mantenimiento-supervisor.md).
