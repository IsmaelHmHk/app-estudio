# OpoPlan - Planificador Algorítmico para Oposiciones

OpoPlan es una Aplicación Web Progresiva (PWA) desarrollada para optimizar el ciclo de estudio mediante la eliminación de la fatiga de decisión. El sistema automatiza la asignación diaria de temas a través de un algoritmo de priorización que evalúa la frecuencia y antigüedad de los repasos, garantizando una cobertura eficiente y homogénea del temario.

## Arquitectura y Funcionalidades Principales

- **Motor de Asignación Diaria:** Algoritmo de selección de temario que prioriza elementos con cero iteraciones de estudio y establece un bloqueo de estado (state lock) de 24 horas utilizando el almacenamiento local del cliente.
- **Módulo de Simulación de Exámenes:** Extracción estocástica de temas acoplada a un temporizador asíncrono para la evaluación bajo condiciones de tiempo límite reales, con persistencia del resultado.
- **Gestor de Supuestos Prácticos:** Sistema de cronometraje continuo con persistencia de métricas de rendimiento por sesión.
- **Operatividad Offline First:** Arquitectura tolerante a fallos de red apoyada en Service Workers y persistencia de datos local a través de IndexedDB, garantizando el aislamiento, rendimiento y privacidad absoluta de los datos del usuario.
- **Dashboard Analítico:** Monitorización en tiempo real de KPIs de estudio, incluyendo rachas de actividad, porcentaje de cobertura del temario, volumen horario acumulado y cálculo asíncrono del tiempo restante (time-to-deadline) para la fecha oficial.

## Stack Tecnológico

- **Frontend Core:** React 18, TypeScript, Vite
- **Persistencia de Datos:** Dexie.js (Wrapper de IndexedDB)
- **Infraestructura PWA:** vite-plugin-pwa (Generación de Service Workers y Manifest)
- **Integración y Despliegue Continuo (CI/CD):** Vercel (Vinculado a GitHub)

## Despliegue y Ejecución

La aplicación está compilada para su distribución nativa web (PWA), operando íntegramente en el lado del cliente (Client-Side Rendering) sin necesidad de backend o bases de datos externas.

1. Acceder al endpoint de producción desde un navegador compatible (Chrome/Safari).
2. Ejecutar la acción "Añadir a la pantalla de inicio" (Install PWA) para que el navegador procese el Web App Manifest.
3. El Service Worker cacheará los recursos estáticos y la aplicación instanciará su base de datos local (OpoPlanDB), operando de manera 100% independiente al estado de la conexión de red.
```
