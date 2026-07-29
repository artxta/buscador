function obtenerCoordenadasCiudad(localidad, provincia) {
    const data = municipiosData || CIUDADES_ESPANA;
    if (data[localidad]) return data[localidad];
    if (data[provincia]) return data[provincia];
    const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const locN = norm(localidad);
    for (const [nombre, coords] of Object.entries(data)) {
        if (norm(nombre) === locN) return coords;
    }
    const provN = norm(provincia);
    for (const [nombre, coords] of Object.entries(data)) {
        if (norm(nombre) === provN) return coords;
    }
    return null;
}

function buscarCiudadLocal(texto) {
    const data = municipiosData || CIUDADES_ESPANA;
    const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const textoNorm = norm(texto);
    const sinArt = s => s.replace(/^(la|el|los|las|a|o)\s+/i, '').trim();

    for (const [nombre, coords] of Object.entries(data)) {
        if (norm(nombre) === textoNorm) return { lat: coords[0], lng: coords[1], nombre };
    }

    for (const [nombre, coords] of Object.entries(data)) {
        if (sinArt(norm(nombre)) === sinArt(textoNorm)) return { lat: coords[0], lng: coords[1], nombre };
    }

    if (textoNorm.length >= 4) {
        let subMatch = null;
        for (const [nombre, coords] of Object.entries(data)) {
            const nombreNorm = norm(nombre);
            if (nombreNorm.includes(textoNorm)) {
                if (!subMatch || nombre.length < subMatch.nombre.length) subMatch = { lat: coords[0], lng: coords[1], nombre };
            }
        }
        if (subMatch) return subMatch;
    }

    const palabras = textoNorm.split(/\s+/).filter(w => w.length > 2);
    if (palabras.length >= 2) {
        let mejorMatch = null;
        let mejorScore = 0;
        for (const [nombre, coords] of Object.entries(data)) {
            const nombreNorm = sinArt(norm(nombre));
            let score = 0;
            for (const p of palabras) {
                if (nombreNorm.includes(p)) score++;
            }
            if (score > mejorScore) {
                mejorScore = score;
                mejorMatch = { lat: coords[0], lng: coords[1], nombre };
            }
        }
        if (mejorMatch && mejorScore >= 2) return mejorMatch;
    }

    return null;
}

function buscarUbicacionManual() {
    const input = document.getElementById('inputUbicacion');
    const texto = input.value.trim();
    if (!texto) return;

    const estado = document.getElementById('estadoUbicacion');
    const info = document.getElementById('infoUbicacion');
    const btnBuscar = input.nextElementSibling;

    estado.textContent = 'Buscando...';
    btnBuscar.disabled = true;

    const resultadoLocal = buscarCiudadLocal(texto);
    if (resultadoLocal) {
        const { lat, lng, nombre } = resultadoLocal;
        miUbicacion = { lat, lng };
        if (typeof umami !== 'undefined') umami.track('buscar_ubicacion', { texto: texto, resultado: 'encontrado_local', ciudad: nombre });
        estado.textContent = nombre;
        input.value = nombre;
        info.style.display = 'block';
        info.innerHTML = `<a href="https://maps.google.com/?q=${lat},${lng}" target="_blank">Ver posición en el mapa</a>`;
        btnBuscar.disabled = false;
        if (window.todosLosCentros && window.todosLosCentros.length > 0) {
            reconstruirTabla();
        }
        return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(texto + ', España')}&format=json&limit=1`, { headers: { 'User-Agent': 'BuscadorCentrosFP/1.0' } })
        .then(r => {
            if (r.status === 429) throw new Error('RATE_LIMIT');
            return r.json();
        })
        .then(data => {
            btnBuscar.disabled = false;
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                miUbicacion = { lat, lng };
                if (typeof umami !== 'undefined') umami.track('buscar_ubicacion', { texto: texto, resultado: 'encontrado_api', ciudad: data[0].display_name.split(',')[0] });

                const nombre = data[0].display_name.split(',').slice(0, 2).join(', ');
                estado.textContent = nombre || texto;
                input.value = nombre || texto;

                info.style.display = 'block';
                info.innerHTML = `<a href="https://maps.google.com/?q=${lat},${lng}" target="_blank">Ver posición en el mapa</a>`;

                if (window.todosLosCentros && window.todosLosCentros.length > 0) {
                    reconstruirTabla();
                }
            } else {
                if (typeof umami !== 'undefined') umami.track('buscar_ubicacion', { texto: texto, resultado: 'no_encontrado' });
                estado.textContent = 'Lugar no encontrado. Prueba con otro nombre.';
            }
        })
        .catch(err => {
            btnBuscar.disabled = false;
            if (err.message === 'RATE_LIMIT') {
                estado.textContent = 'Demasiadas peticiones. Espera un momento y vuelve a intentar.';
            } else {
                estado.textContent = 'Error al buscar el lugar';
            }
        });
}

function reconstruirTabla() {
    const thead = document.querySelector('.table-centros thead tr');
    if (!thead) return;
    const tieneDistancia = thead.querySelector('.th-distancia');

    if (miUbicacion && !tieneDistancia) {
        const thAcciones = thead.querySelector('th:last-child');
        const thDist = document.createElement('th');
        thDist.className = 'th-distancia';
        thDist.textContent = 'Distancia';
        thead.insertBefore(thDist, thAcciones);
    } else if (!miUbicacion && tieneDistancia) {
        tieneDistancia.remove();
    }

    const infoMsg = document.querySelector('.info-box[style*="margin-top"]');
    if (miUbicacion && infoMsg && infoMsg.textContent.includes('Obtuén tu ubicación')) {
        infoMsg.outerHTML = `<div class="distancia-controls">
            <button type="button" class="btn-calcular" id="btnCalcular">Calcular distancias</button>
            <span id="progresoDistancia" class="progreso-distancia"></span>
            <label class="toggle-inline" id="contenedorToggle" style="display:none;">
                <input type="checkbox" id="ordenarDistancia">
                <span class="toggle-switch"></span>
                Ordenar por distancia
            </label>
        </div>`;
    }

    calcularDistanciasAutomatico();
}

function calcularDistanciasAutomatico() {
    if (!miUbicacion || !window.todosLosCentros) return;

    geocodificando = true;
    const centros = window.todosLosCentros;
    const localidadesUnicas = [...new Set(centros.map(c => `${c.localidad}|${c.provincia}`))];
    const coordsCache = {};

    const btn = document.getElementById('btnCalcular');
    const progreso = document.getElementById('progresoDistancia');
    const toggle = document.getElementById('ordenarDistancia');
    const contenedorToggle = document.getElementById('contenedorToggle');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Ordenando por distancia...';
    }
    if (progreso) progreso.textContent = `0 / ${localidadesUnicas.length} localizaciones`;

    let i = 0;
    let localizacionesResueltasConAPI = 0;

    for (const loc of localidadesUnicas) {
        const [localidad, provincia] = loc.split('|');
        const fallback = obtenerCoordenadasCiudad(localidad, provincia);
        if (fallback) {
            coordsCache[loc] = fallback;
            i++;
        }
    }

    if (progreso) progreso.textContent = `${i} / ${localidadesUnicas.length} localizaciones (resueltas localmente: ${localidadesUnicas.length - i > 0 ? localidadesUnicas.length - i : 0} pendientes)`;
    aplicarDistancias(coordsCache);

    const pendientes = localidadesUnicas.filter(loc => !coordsCache[loc]);

    if (pendientes.length === 0) {
        geocodificando = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '&#10003; Distancias calculadas';
            btn.classList.add('btn-calcular-ok');
        }
        if (progreso) progreso.textContent = `${localidadesUnicas.length} localizaciones calculadas (todas locales)`;
        if (toggle) toggle.checked = true;
        if (contenedorToggle) contenedorToggle.style.display = 'inline-flex';
        filtrarCentros();
        return;
    }

    let idxPendiente = 0;

    function procesarPendiente() {
        if (idxPendiente >= pendientes.length) {
            geocodificando = false;
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '&#10003; Distancias calculadas';
                btn.classList.add('btn-calcular-ok');
            }
            if (progreso) progreso.textContent = `${localidadesUnicas.length} localizaciones calculadas`;
            if (toggle) toggle.checked = true;
            if (contenedorToggle) contenedorToggle.style.display = 'inline-flex';
            filtrarCentros();
            return;
        }

        const loc = pendientes[idxPendiente];
        const [localidad, provincia] = loc.split('|');

        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(localidad + ', ' + provincia + ', España')}&format=json&limit=1`, { headers: { 'User-Agent': 'BuscadorCentrosFP/1.0' } })
            .then(r => {
                if (r.status === 429) throw new Error('RATE_LIMIT');
                return r.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    coordsCache[loc] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                }
                i++;
                idxPendiente++;
                localizacionesResueltasConAPI++;
                if (progreso) progreso.textContent = `${i} / ${localidadesUnicas.length} localizaciones`;
                aplicarDistancias(coordsCache);
                filtrarCentros();
                setTimeout(procesarPendiente, 1100);
            })
            .catch(err => {
                if (err.message === 'RATE_LIMIT') {
                    if (progreso) progreso.textContent = `${i} / ${localidadesUnicas.length} - Rate limit alcanzado, reintentando...`;
                    setTimeout(procesarPendiente, 5000);
                    return;
                }
                i++;
                idxPendiente++;
                if (progreso) progreso.textContent = `${i} / ${localidadesUnicas.length} localizaciones`;
                aplicarDistancias(coordsCache);
                filtrarCentros();
                setTimeout(procesarPendiente, 1100);
            });
    }

    procesarPendiente();
}

function aplicarDistancias(coordsCache) {
    if (!miUbicacion) return;
    window.todosLosCentros.forEach(c => {
        const clave = `${c.localidad}|${c.provincia}`;
        const coords = coordsCache[clave];
        if (coords) {
            c.distancia = haversine(miUbicacion.lat, miUbicacion.lng, coords[0], coords[1]);
            c.coords = { lat: coords[0], lng: coords[1] };
        } else {
            c.distancia = Infinity;
            c.coords = null;
        }
    });
}

function calcularDistanciasProgresivo() {
    calcularDistanciasAutomatico();
}
