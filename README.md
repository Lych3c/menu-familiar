# Menú Familiar Inteligente

PWA familiar para planificación de menús, recetas, despensa, lista de compras y generación inteligente de recetas.

## Estado actual — V2.1

La aplicación incluye:

- Plan original de 30 días y 90 preparaciones únicas.
- Menú diario y calendario de 30 días.
- Biblioteca de recetas con búsqueda, filtros y favoritos.
- Escalado de cantidades de recetas.
- Despensa local con ingredientes disponibles.
- Marcado **★ consumir primero** para reducir desperdicio.
- Recomendador local que calcula compatibilidad entre la despensa y las 90 recetas.
- Filtro por máximo de ingredientes faltantes.
- Lista de compras semanal y mensual con persistencia local.
- Enlaces de referencia para videos, recetas, técnica avanzada y versiones gourmet.
- PWA instalable, modo offline y tema claro/oscuro.
- Arquitectura preparada para conectar IA mediante un backend seguro.

## Seguridad de la IA

No se debe guardar una clave de API en este repositorio, en JavaScript, en GitHub Pages ni en el navegador. GitHub Pages aloja únicamente el frontend.

La arquitectura prevista es:

```text
Teléfono / PWA en GitHub Pages
        |
        +-- motor local de recetas y despensa
        |
        +-- POST /api/generar-receta
                    |
                    +-- backend serverless con secreto
                              |
                              +-- proveedor de IA
```

La app permite configurar la URL del endpoint desde **Ajustes**, pero nunca una clave secreta.

### Contrato esperado del endpoint de IA

Solicitud `POST` JSON:

```json
{
  "family": "2 adultos + niño de 4 años",
  "country": "Colombia",
  "budget": "Medio",
  "meal": "Cena",
  "maxTime": 30,
  "style": "Familiar",
  "pantry": [
    {"name":"Pollo","qty":"","unit":"g","priority":true}
  ],
  "requirements": {"completeMeal":true,"childAge":4}
}
```

Respuesta JSON recomendada:

```json
{
  "name": "Pollo criollo con papa y verduras",
  "summary": "Cena completa para tres personas",
  "ingredients": [
    {"name":"Pechuga de pollo","qty":400,"unit":"g"}
  ],
  "steps": ["Preparar...", "Cocinar..."],
  "childNote": "Servir en trozos pequeños y con condimentos suaves."
}
```

## GitHub Pages

El workflow `.github/workflows/pages.yml` despliega la raíz del repositorio a GitHub Pages cada vez que se actualiza `main`.

URL esperada:

`https://lych3c.github.io/menu-familiar/`

Si GitHub solicita configuración manual la primera vez: **Settings → Pages → Source: GitHub Actions**.

## Datos

Los datos base están divididos entre `data/base.js` y `data/recipes-01.js` a `data/recipes-06.js`. Los datos personales de uso —favoritos, despensa, compras, fecha de inicio y configuración— permanecen en `localStorage` del dispositivo.

## Próximas fases

1. Backend serverless para IA con validación de esquema, CORS restringido y rate limiting.
2. Guardar recetas generadas en el recetario local.
3. Reemplazar comidas del calendario y recalcular compras.
4. Cantidades reales de despensa y consumo automático por receta.
5. Fuentes culinarias curadas por receta, además de búsquedas externas.
6. Exportación/importación del estado familiar.
