# little-bardo  
Engine for an interactive-book game which loads the story from a JSON file.

## Mapa interactivo de La Rueda del Tiempo

`mapa.html` es un mapa interactivo del mundo de La Rueda del Tiempo construido con
[Leaflet](https://leafletjs.com/) (servido en local desde `js/vendor/leaflet/`, sin CDNs),
pensado para móvil:

- Navegación arrastrando con un dedo y zoom con gesto de pellizco (dos dedos).
- Buscador con sugerencias (ignora acentos y admite alias en español, p. ej. «Campo de Emond»).
- Al buscar, el mapa vuela hasta el lugar, hace zoom automático según el tipo de lugar
  y coloca un marcador que solo desaparece al pulsar el botón «Quitar 📍».

Los lugares y sus coordenadas (en píxeles de `data/img/wot-map.jpg`) están en
`js/map-places.js`. Crédito del mapa base: comunidad WoTMUD / recopilación
[fbstj/WoT-Maps](https://github.com/fbstj/WoT-Maps).
