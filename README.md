# Maps Safe

Aplicación web desarrollada en **Angular** que permite visualizar mapas interactivos y calcular la **ruta más segura** entre dos puntos.  
El sistema se basa en datos de incidentes delictivos, mostrando zonas de riesgo y ofreciendo alternativas más seguras al usuario.

---

## Características principales

- Integración con **Google Maps API**.
- Búsqueda de rutas seguras entre un origen y destino.
- Visualización de zonas de riesgo en el mapa.
- Módulo de **gráficos y estadísticas** sobre incidentes.
- Historial de rutas consultadas.
- Interfaz moderna y responsive con Angular + SCSS.

---

## Vista previa del proyecto

Capturas del sistema en funcionamiento:

- **Página principal con mapa y búsqueda**  
  ![Home](https://raw.githubusercontent.com/Kevin-Laz/Maps_Safe/main/docs/images/home.png)

- **Visualización de zonas de riesgo**  
  ![Zonas de riesgo](https://raw.githubusercontent.com/Kevin-Laz/Maps_Safe/main/docs/images/riesgo.png)

- **Gráficos y estadísticas**  
  ![Gráficos](https://raw.githubusercontent.com/Kevin-Laz/Maps_Safe/main/docs/images/charts.png)

- **Historial de rutas consultadas**  
  ![Historial](https://raw.githubusercontent.com/Kevin-Laz/Maps_Safe/main/docs/images/history.png)

---

## Tecnologías utilizadas

- [Angular](https://angular.io/) 18
- TypeScript
- SCSS
- Google Maps API
- Servicios personalizados para consumo de datos (Crimes, Routes, Nodes)

---

### Instalación y ejecución

1.  **Clonar el repositorio:**

    ```bash
    git clone [https://github.com/Kevin-Laz/Maps_Safe.git](https://github.com/Kevin-Laz/Maps_Safe.git)
    cd Maps_Safe
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea el archivo `src/environments/environment.ts` si no existe y añade tu clave de la API de Google Maps.

    ```typescript
    export const environment = {
      production: false,
      googleMapsApiKey: 'TU_API_KEY'
    };
    ```

4.  **Ejecutar el servidor de desarrollo:**

    ```bash
    ng serve
    ```

