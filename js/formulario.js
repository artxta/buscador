function cargarNiveles() {
    const selectNivel = document.getElementById('nivel');
    const selectEnsenanza = document.getElementById('ensenanza');
    document.getElementById('mensajeAutomatico').style.display = 'none';
    document.getElementById('results').innerHTML = '';
    selectNivel.innerHTML = '<option value="">-- Selecciona un nivel --</option>';
    selectEnsenanza.innerHTML = '<option value="">-- Selecciona una enseñanza --</option>';
    selectEnsenanza.disabled = true;
    actualizarPasos(1);
    const fam = document.getElementById('familia').value;
    if (fam && datosFamilias[fam]) {
        nivelesEstudios.forEach(n => {
            const ens = datosFamilias[fam].niveles[n.codigo] || [];
            const o = document.createElement('option');
            o.value = n.codigo;
            o.textContent = ens.length > 0 ? n.nombre + ' (' + ens.length + ')' : n.nombre + ' (sin enseñanzas)';
            selectNivel.appendChild(o);
        });
        selectNivel.disabled = false;
    } else {
        selectNivel.disabled = true;
    }
}

function cargarEnsenanzas() {
    const fam = document.getElementById('familia').value;
    const niv = document.getElementById('nivel').value;
    const selectEnsenanza = document.getElementById('ensenanza');
    const resultsDiv = document.getElementById('results');
    selectEnsenanza.innerHTML = '<option value="">-- Selecciona una enseñanza --</option>';
    resultsDiv.innerHTML = '';
    if (niv) actualizarPasos(2);
    if (fam && niv && datosFamilias[fam]) {
        const ens = datosFamilias[fam].niveles[niv] || [];
        if (ens.length === 0) {
            selectEnsenanza.innerHTML = '<option value="">-- Sin enseñanzas --</option>';
            selectEnsenanza.disabled = true;
            document.getElementById('mensajeAutomatico').style.display = 'none';
        } else {
            ens.forEach(e => {
                const o = document.createElement('option');
                o.value = e.codigo; o.textContent = e.nombre;
                selectEnsenanza.appendChild(o);
            });
            selectEnsenanza.disabled = false;
            document.getElementById('mensajeAutomatico').style.display = 'block';
        }
    } else {
        selectEnsenanza.disabled = true;
        document.getElementById('mensajeAutomatico').style.display = 'none';
    }
    selectEnsenanza.addEventListener('change', function () {
        if (this.value) { actualizarPasos(4); buscarCentros(); }
        else resultsDiv.innerHTML = '';
    });
}

function actualizarPasos(p) {
    for (let i = 1; i <= 4; i++) {
        const s = document.getElementById('step' + i);
        s.classList.remove('active', 'completed');
        if (i < p) s.classList.add('completed');
        else if (i === p) s.classList.add('active');
    }
}

function reiniciarBusqueda() {
    document.getElementById('familia').value = '';
    document.getElementById('nivel').innerHTML = '<option value="">-- Primero selecciona una familia --</option>';
    document.getElementById('nivel').disabled = true;
    document.getElementById('ensenanza').innerHTML = '<option value="">-- Primero selecciona nivel --</option>';
    document.getElementById('ensenanza').disabled = true;
    document.getElementById('modalidad').value = '';
    document.getElementById('results').innerHTML = '';
    document.getElementById('mensajeAutomatico').style.display = 'none';

    miUbicacion = null;
    window.todosLosCentros = null;
    document.getElementById('inputUbicacion').value = '';
    document.getElementById('estadoUbicacion').textContent = '';
    document.getElementById('infoUbicacion').style.display = 'none';

    actualizarPasos(1);
}
