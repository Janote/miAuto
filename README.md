# miAuto

Una aplicación web móvil futurista para guardar y gestionar ubicaciones.

## Características

- Muestra tu ubicación actual en un mapa con dirección aproximada.
- Permite guardar ubicaciones con un botón, obteniendo dirección automática.
- Historial de ubicaciones guardadas en una tabla con estética futurista.
- Cada entrada muestra fecha y dirección aproximada (número de calle y calle).
- Botón de eliminar para borrar la ubicación del mapa y la tabla.

## Cómo usar

1. Abre `index.html` en un navegador web compatible con geolocalización (como Chrome en móvil).
2. Permite el acceso a la ubicación cuando se solicite.
3. Haz clic en "Guardar Ubicación" para agregar tu ubicación actual al historial con dirección.
4. La tabla mostrará las ubicaciones guardadas con fecha, dirección y botón de eliminar.
5. Haz clic en el botón de basura para eliminar una ubicación.

## Tecnologías

- HTML5
- CSS3 (estilo futurista)
- JavaScript (ES6+)
- Leaflet para mapas
- Geolocalización API
- Reverse Geocoding con Nominatim (OpenStreetMap)
- LocalStorage para persistencia

## Notas

- Requiere permisos de geolocalización y conexión a internet para geocoding.
- Los datos se guardan localmente en el navegador.
- Diseño inspirado en temas sci-fi con colores neón.