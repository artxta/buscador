async function buscarCentros() {
    const selectEnsenanza = document.getElementById('ensenanza');
    const resultsDiv = document.getElementById('results');
    if (!selectEnsenanza.value) return;
    const nivelSel = document.getElementById('nivel').options[document.getElementById('nivel').selectedIndex].text;
    const ensSel = selectEnsenanza.options[selectEnsenanza.selectedIndex].text;
    const codigo = selectEnsenanza.value;
    const mod = document.getElementById('modalidad').value;
    resultsDiv.innerHTML = '<div class="loading">Cargando centros...</div>';

    let centros = [];

    if (centrosLocalLoaded && centrosLocalData && centrosLocalData.centros[codigo]) {
        centros = centrosLocalData.centros[codigo].centros || [];
        if (mod) {
            const modNombre = { '1': 'Diurno', '2': 'Nocturno', '3': 'Distancia', '6': 'Semipresencial' }[mod];
            if (modNombre) {
                centros = centros.filter(c => c.modalidad === modNombre);
            }
        }
    } else {
        resultsDiv.innerHTML = `
            <div class="info-box"><strong>Nivel:</strong> ${nivelSel}<br><strong>Enseñanza:</strong> ${ensSel}</div>
            <div class="result-link">
                <p>No se encontraron datos locales para esta enseñanza.</p>
                <a href="https://www.educacion.gob.es/centros/buscarCentros?ensenanzaFP=${codigo}" target="_blank" class="btn-link">Ver en educacion.gob.es</a>
            </div>`;
        return;
    }

    window.todosLosCentros = centros;
    const btnCalcularHtml = miUbicacion
        ? `<div class="distancia-controls">
            <button type="button" class="btn-calcular" id="btnCalcular">
                Calcular distancias
            </button>
            <span id="progresoDistancia" class="progreso-distancia"></span>
            <label class="toggle-inline" id="contenedorToggle" style="display:none;">
                <input type="checkbox" id="ordenarDistancia">
                <span class="toggle-switch"></span>
                Ordenar por distancia
            </label>
          </div>`
        : `<div class="info-box" style="margin-top:15px;">Obtuén tu ubicación para ver distancias y rutas a los centros.</div>`;
    const modNombre = mod ? { '1': 'Diurno', '2': 'Nocturno', '3': 'Distancia', '6': 'Semipresencial' }[mod] : null;
    const avisoHtml = `<div class="aviso-futuras"><em class="fas fa-info-circle"></em> Datos cargados localmente. Para datos actualizados, <a href="https://www.educacion.gob.es/centros/buscarCentros?ensenanzaFP=${codigo}" target="_blank">consulta la web oficial</a>.</div>`;
    const modalidadInfo = mod ? `<br><strong>Modalidad:</strong> ${modNombre}` : '';
    resultsDiv.innerHTML = `
        <div class="info-box">
            <strong>Nivel:</strong> ${nivelSel}<br>
            <strong>Enseñanza:</strong> ${ensSel}${modalidadInfo}<br>
            <strong>Total centros:</strong> ${centros.length}
        </div>
        ${avisoHtml}
        ${btnCalcularHtml}
        <div class="filtros-titulo">&#128269; Filtrar centros</div>
            <div class="filtros">
                <div class="filtro-group">
                    <select id="filtroProvincia">
                        <option value="">Todas las provincias</option>
                        <option value="A Coruña">A Coruña</option>
                        <option value="Álava">Álava</option>
                        <option value="Albacete">Albacete</option>
                        <option value="Alicante">Alicante</option>
                        <option value="Almería">Almería</option>
                        <option value="Asturias">Asturias</option>
                        <option value="Ávila">Ávila</option>
                        <option value="Badajoz">Badajoz</option>
                        <option value="Barcelona">Barcelona</option>
                        <option value="Bizkaia">Bizkaia</option>
                        <option value="Burgos">Burgos</option>
                        <option value="Cáceres">Cáceres</option>
                        <option value="Cádiz">Cádiz</option>
                        <option value="Cantabria">Cantabria</option>
                        <option value="Castellón">Castellón</option>
                        <option value="Ceuta">Ceuta</option>
                        <option value="Ciudad Real">Ciudad Real</option>
                        <option value="Córdoba">Córdoba</option>
                        <option value="Cuenca">Cuenca</option>
                        <option value="Gipuzkoa">Gipuzkoa</option>
                        <option value="Girona">Girona</option>
                        <option value="Granada">Granada</option>
                        <option value="Guadalajara">Guadalajara</option>
                        <option value="Huelva">Huelva</option>
                        <option value="Huesca">Huesca</option>
                        <option value="Illes Balears">Illes Balears</option>
                        <option value="Jaén">Jaén</option>
                        <option value="León">León</option>
                        <option value="Lleida">Lleida</option>
                        <option value="Lugo">Lugo</option>
                        <option value="Madrid">Madrid</option>
                        <option value="Málaga">Málaga</option>
                        <option value="Melilla">Melilla</option>
                        <option value="Murcia">Murcia</option>
                        <option value="Navarra">Navarra</option>
                        <option value="Ourense">Ourense</option>
                        <option value="Palencia">Palencia</option>
                        <option value="Pontevedra">Pontevedra</option>
                        <option value="La Rioja">La Rioja</option>
                        <option value="Salamanca">Salamanca</option>
                        <option value="Santa Cruz de Tenerife">Santa Cruz de Tenerife</option>
                        <option value="Segovia">Segovia</option>
                        <option value="Sevilla">Sevilla</option>
                        <option value="Soria">Soria</option>
                        <option value="Tarragona">Tarragona</option>
                        <option value="Teruel">Teruel</option>
                        <option value="Toledo">Toledo</option>
                        <option value="Valencia">Valencia</option>
                        <option value="Valladolid">Valladolid</option>
                        <option value="Zamora">Zamora</option>
                        <option value="Zaragoza">Zaragoza</option>
                    </select>
                </div>
                <div class="filtro-group">
                    <select id="filtroNaturaleza">
                        <option value="">Público o Privado</option>
                        <option value="Público">Público</option>
                        <option value="Privado">Privado</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>
            </div>
                <div class="scroll-indicator"><span class="scroll-hand">&#128071;</span> Desliza horizontalmente</div>
            <div class="table-scrollbar" id="tableScrollbar">
                <div class="table-scrollbar-thumb" id="tableScrollbarThumb"></div>
            </div>
            <div class="table-wrapper" id="tableWrapper">
                <table class="table-centros">
                    <thead><tr>
                        <th>Provincia</th><th>Localidad</th><th>Den. Genérica</th><th>Den. Específica</th>
                        <th>Código</th><th>Naturaleza</th>
                        ${miUbicacion ? '<th class="th-distancia">Distancia</th>' : ''}
                        <th>Acciones</th>
                    </tr></thead>
                    <tbody id="tablaCentros"></tbody>
                </table>
            </div>`;
    mostrarCentros(centros);
    if (miUbicacion) {
        calcularDistanciasAutomatico();
    }
    inicializarScrollbar();
}

function mostrarCentros(centros) {
    const tbody = document.getElementById('tablaCentros');
    const codigoEnsenanza = document.getElementById('ensenanza').value;
    const prefijo = codigoEnsenanza.substring(0, 3);
    const sufijo = codigoEnsenanza.substring(codigoEnsenanza.length - 4);
    const ordenar = document.getElementById('ordenarDistancia') && document.getElementById('ordenarDistancia').checked;

    if ((ordenar || geocodificando) && miUbicacion) {
        centros.sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
    }

    if (centros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="sin-resultados">No se encontraron centros con los filtros seleccionados</td></tr>';
        return;
    }

    tbody.innerHTML = centros.map(c => {
        const destino = `${c.localidad}, ${c.provincia}, España`;
        let distTd = miUbicacion
            ? (c.distancia != null && c.distancia !== Infinity
                ? `<td class="td-distancia">${c.distancia.toFixed(1)} km</td>`
                : '<td class="td-distancia">-</td>')
            : '';
        let mapsHtml = '';
        if (miUbicacion) {
            mapsHtml = c.coords
                ? `<a href="#" class="btn-maps" data-lat="${miUbicacion.lat}" data-lng="${miUbicacion.lng}" data-dest="${destino.replace(/"/g, '&quot;')}">Mapa</a>`
                : `<a href="#" class="btn-maps" data-dest="${destino.replace(/"/g, '&quot;')}">Maps</a>`;
        }
        return `<tr>
            <td>${c.provincia}</td><td>${c.localidad}</td><td>${c.denominacionGenerica}</td>
            <td>${c.denominacionEspecifica}</td><td>${c.codigo}</td><td>${c.naturaleza}</td>
            ${distTd}
            <td class="td-acciones">
                <a href="#" class="btn-detalle" data-codigo="${c.codigo}" data-ensenanza="${prefijo}_${sufijo}">Detalle</a>
                ${mapsHtml}
            </td>
        </tr>`;
    }).join('');
}

function abrirDetalleCentro(codigoCentro, ensenanzaFP) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.educacion.gob.es/centros/detalleCentro';
    form.target = '_blank';
    [['codCentro', codigoCentro], ['ensenanzaFP', ensenanzaFP]].forEach(([n, v]) => {
        const inp = document.createElement('input');
        inp.type = 'hidden'; inp.name = n; inp.value = v;
        form.appendChild(inp);
    });
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

function filtrarCentros() {
    const p = normalizar(document.getElementById('filtroProvincia')?.value || '');
    const n = normalizar(document.getElementById('filtroNaturaleza')?.value || '');
    let filtrados = (window.todosLosCentros || []).filter(ce =>
        (p === '' || normalizar(ce.provincia) === p) &&
        (n === '' || normalizar(ce.naturaleza).includes(n))
    );
    mostrarCentros(filtrados);
}
