(function () {
    'use strict';

    // Dimensiones de data/img/wot-map.jpg
    var MAP_W = 3000;
    var MAP_H = 2250;

    // Zoom objetivo al centrar un lugar, según su tipo
    var ZOOM_BY_TYPE = {
        ciudad: 0.5,
        pueblo: 1,
        ruinas: 0.5,
        lugar: 0.25,
        'montaña': 0,
        bosque: -0.5,
        isla: 0,
        mar: -1,
        region: -1
    };

    // Píxel de imagen (x, y desde arriba-izquierda) → coordenada del mapa
    function toLatLng(px) {
        return L.latLng(MAP_H - px[1], px[0]);
    }

    // ── Mapa ─────────────────────────────────────────────────────────
    var bounds = L.latLngBounds([[0, 0], [MAP_H, MAP_W]]);

    var map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 2,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120,
        maxBounds: bounds.pad(0.15),
        maxBoundsViscosity: 0.8,
        bounceAtZoomLimits: false,
        zoomControl: false,
        attributionControl: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.attributionControl.setPrefix(false);

    L.imageOverlay('data/img/wot-map.jpg', bounds, {
        attribution: 'Mapa: comunidad WoTMUD / fbstj WoT-Maps · La Rueda del Tiempo © Robert Jordan'
    }).addTo(map);

    map.fitBounds(bounds);

    // Iconos por defecto de Leaflet servidos en local
    L.Icon.Default.prototype.options.imagePath = 'js/vendor/leaflet/images/';

    // ── Búsqueda ─────────────────────────────────────────────────────
    var input = document.getElementById('search-input');
    var btnSearch = document.getElementById('btn-search');
    var btnClear = document.getElementById('btn-clear');
    var suggestionsEl = document.getElementById('suggestions');
    var toastEl = document.getElementById('toast');

    var marker = null;
    var toastTimer = null;

    function normalize(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/['’´`]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Índice de búsqueda precalculado
    var index = WOT_PLACES.map(function (place) {
        var keys = [normalize(place.name)];
        (place.alt || []).forEach(function (a) { keys.push(normalize(a)); });
        return { place: place, keys: keys };
    });

    function levenshtein(a, b) {
        var prev = [], cur = [], i, j, tmp;
        for (j = 0; j <= b.length; j++) { prev[j] = j; }
        for (i = 1; i <= a.length; i++) {
            cur[0] = i;
            for (j = 1; j <= b.length; j++) {
                cur[j] = Math.min(
                    prev[j] + 1,
                    cur[j - 1] + 1,
                    prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1)
                );
            }
            tmp = prev; prev = cur; cur = tmp;
        }
        return prev[b.length];
    }

    // Distancia mínima entre la consulta y la clave completa o cualquiera de sus palabras
    function fuzzyDistance(q, key) {
        var best = levenshtein(q, key);
        key.split(' ').forEach(function (word) {
            var d = levenshtein(q, word);
            if (d < best) { best = d; }
        });
        return best;
    }

    function findMatches(query) {
        var q = normalize(query);
        if (!q) { return []; }
        var exact = [], starts = [], contains = [];
        index.forEach(function (entry) {
            var best = null;
            entry.keys.forEach(function (key) {
                if (key === q) { best = 'exact'; }
                else if (best !== 'exact' && key.indexOf(q) === 0) { best = best || 'starts'; }
                else if (!best && key.indexOf(q) !== -1) { best = 'contains'; }
            });
            if (best === 'exact') { exact.push(entry.place); }
            else if (best === 'starts') { starts.push(entry.place); }
            else if (best === 'contains') { contains.push(entry.place); }
        });
        var results = exact.concat(starts, contains);
        if (results.length > 0) { return results; }

        // Sin coincidencias: tolera erratas de 1-2 letras («Rhannor» → «Rhannon»)
        var maxDist = q.length >= 6 ? 2 : (q.length >= 4 ? 1 : 0);
        if (maxDist === 0) { return []; }
        var fuzzy = [];
        index.forEach(function (entry) {
            var best = Infinity;
            entry.keys.forEach(function (key) {
                var d = fuzzyDistance(q, key);
                if (d < best) { best = d; }
            });
            if (best <= maxDist) { fuzzy.push({ place: entry.place, d: best }); }
        });
        fuzzy.sort(function (a, b) { return a.d - b.d; });
        return fuzzy.map(function (f) { return f.place; });
    }

    function showToast(message) {
        toastEl.textContent = message;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toastEl.classList.remove('show');
        }, 2200);
    }

    function goTo(place) {
        closeSuggestions();
        input.value = place.name;
        input.blur();

        var latlng = toLatLng(place.px);
        var zoom = ZOOM_BY_TYPE.hasOwnProperty(place.type) ? ZOOM_BY_TYPE[place.type] : 0;

        if (marker) {
            marker.setLatLng(latlng);
        } else {
            marker = L.marker(latlng).addTo(map);
        }
        marker.bindPopup(
            '<div class="popup-title">' + place.name + '</div>' +
            '<div class="popup-type">' + place.type + '</div>'
        );

        map.flyTo(latlng, zoom, { duration: 1.1 });
        map.once('moveend', function () {
            if (marker) { marker.openPopup(); }
        });

        btnClear.disabled = false;
    }

    function search() {
        var matches = findMatches(input.value);
        if (matches.length === 0) {
            showToast('No se ha encontrado «' + input.value.trim() + '»');
            return;
        }
        goTo(matches[0]);
    }

    function clearMarker() {
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
        btnClear.disabled = true;
    }

    // ── Sugerencias ──────────────────────────────────────────────────
    function closeSuggestions() {
        suggestionsEl.classList.remove('open');
        suggestionsEl.innerHTML = '';
    }

    function renderSuggestions() {
        var matches = findMatches(input.value).slice(0, 8);
        if (matches.length === 0 || normalize(input.value).length < 2) {
            closeSuggestions();
            return;
        }
        suggestionsEl.innerHTML = '';
        matches.forEach(function (place) {
            var item = document.createElement('button');
            item.type = 'button';
            var name = document.createElement('span');
            name.textContent = place.name;
            var type = document.createElement('span');
            type.className = 'place-type';
            type.textContent = place.type;
            item.appendChild(name);
            item.appendChild(type);
            // pointerdown para que dispare antes que el blur del input
            item.addEventListener('pointerdown', function (event) {
                event.preventDefault();
                goTo(place);
            });
            suggestionsEl.appendChild(item);
        });
        suggestionsEl.classList.add('open');
    }

    input.addEventListener('input', renderSuggestions);
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            search();
        }
    });
    input.addEventListener('blur', function () {
        // Deja pasar el pointerdown de una sugerencia antes de cerrar
        setTimeout(closeSuggestions, 150);
    });

    btnSearch.addEventListener('click', search);
    btnClear.addEventListener('click', clearMarker);

    // Expuesto para depuración y pruebas
    window.wotMap = map;
})();
