# Menú Familiar Inteligente

PWA familiar para planificación de menús, recetas, despensa, lista de compras y asistencia culinaria local, preparada para integrar IA mediante un backend seguro.

## Estado actual — V7

La aplicación incluye:

- Plan base de 30 días con 90 comidas programadas.
- Biblioteca de 300 recetas estáticas: 90 desayunos, 120 almuerzos y 90 cenas.
- Biblioteca adicional separada del plan mensual para no inflar las compras.
- Búsqueda por ingrediente, tipo de comida, favoritos y procedencia.
- Despensa mediante texto libre y análisis de lenguaje natural básico.
- Inventario cuantificado con cantidad, unidad, fecha de vencimiento y prioridad de consumo.
- Recomendador local ponderado por ingredientes principales.
- Constructor manual de almuerzo: proteína + componente vegetal + carbohidrato.
- Componentes vegetales crudos, salteados, al vapor, horneados y guisados.
- Constructor automático con propuestas por compatibilidad, rapidez y menor número de compras.
- Catálogos de proteínas, ensaladas, verduras cocidas, carbohidratos, sopas/cremas y salsas/aderezos.
- Planificador inteligente de 7 días con reemplazo de platos.
- Priorización de ingredientes próximos a vencer.
- Perfil familiar configurable: integrantes, edades, presupuesto, tiempos, restricciones y alimentos que no gustan.
- Escalado aproximado de cantidades según el perfil familiar.
- Recalculo de compras del plan semanal descontando cantidades registradas en despensa cuando las unidades son compatibles.
- Lista de compras del plan mensual calculada exclusivamente con las 90 recetas programadas.
- Lista adicional para faltantes provenientes de despensa, constructor y plan semanal.
- Exportación e importación de todos los datos locales para trasladarlos entre dispositivos.
- Identificación de procedencia: plan mensual propio, biblioteca propia o receta generada por IA.
- PWA instalable, funcionamiento offline y tema claro/oscuro.
- Validaciones automáticas de datos y sintaxis antes de cada despliegue en GitHub Pages.

## IA: arquitectura preparada, no dependiente

La aplicación funciona sin IA. Para generar recetas nuevas con un modelo externo debe configurarse un endpoint HTTPS seguro desde **Ajustes**.

Nunca se debe guardar una clave de API en este repositorio, en JavaScript, en GitHub Pages ni en `localStorage`.

Arquitectura prevista:

```text
Teléfono / PWA en GitHub Pages
        |
        +-- motores locales
        |    +-- despensa
        |    +-- biblioteca
        |    +-- constructor
        |    +-- planificador semanal
        |    +-- compras
        |
        +-- POST endpoint seguro (opcional)
                    |
                    +-- función serverless / backend
                              |
                              +-- proveedor de IA
```

### Contrato esperado del endpoint

Solicitud `POST` JSON aproximada:

```json
{
  "task": "generate_recipe",
  "prompt": "Tengo pollo, arroz y tomate. Crea una cena en 30 minutos.",
  "context": {
    "country": "Colombia",
    "familyProfile": {},
    "pantry": [],
    "rules": {
      "healthyPlate": true,
      "maxMajorCarbs": 2,
      "childFriendly": true
    }
  }
}
```

La respuesta debe contener una receta estructurada con `name`, `type`, `ingredients` y `steps`. Las recetas aceptadas se guardan localmente con procedencia `IA generativa`.

## Datos y privacidad

Todos los datos de uso permanecen en el dispositivo mediante `localStorage`: perfil familiar, favoritos, despensa, cantidades, vencimientos, compras, recetas IA y plan semanal.

Mientras no exista sincronización en la nube, **Ajustes → Exportar datos** permite crear una copia JSON e importarla en otro dispositivo.

## GitHub Pages

El workflow `.github/workflows/pages.yml` valida y despliega automáticamente la rama `main`.

Aplicación:

`https://lych3c.github.io/menu-familiar/`

## Límite deliberado del producto

El proyecto busca resolver bien estas preguntas:

- ¿Qué vamos a comer?
- ¿Qué puedo cocinar con lo que tengo?
- ¿Qué se está por vencer?
- ¿Qué necesito comprar?
- ¿Cómo puedo variar una comida sin romper el plan?

No pretende sustituir una valoración médica o nutricional individual, ni convertirse en una plataforma de comercio, pagos o domicilios.

## Pendientes que requieren infraestructura externa

- Backend seguro para IA real.
- Sincronización automática entre varios teléfonos.
- Base de datos y autenticación multiusuario, si llegaran a ser necesarias.
