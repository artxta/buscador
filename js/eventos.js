document.addEventListener('DOMContentLoaded', () => {

    // === Formulario principal ===
    document.getElementById('familia').addEventListener('change', cargarNiveles);
    document.getElementById('nivel').addEventListener('change', cargarEnsenanzas);
    document.getElementById('modalidad').addEventListener('change', () => {
        if (document.getElementById('ensenanza').value) buscarCentros();
    });
    document.getElementById('btnReiniciar').addEventListener('click', reiniciarBusqueda);

    // === Ubicación ===
    document.getElementById('inputUbicacion').addEventListener('keydown', e => {
        if (e.key === 'Enter') buscarUbicacionManual();
    });
    document.getElementById('btnBuscarUbicacion').addEventListener('click', buscarUbicacionManual);

    // === Quiz botón principal ===
    document.getElementById('btnQuizVocacional').addEventListener('click', () => abrirQuiz('vocacional'));

    // === Quiz overlay: cerrar al hacer clic fuera ===
    document.getElementById('quizOverlay').addEventListener('click', e => {
        if (e.target === e.currentTarget) cerrarQuiz();
    });

    // === Quiz modal: evitar propagación ===
    document.getElementById('quizModal').addEventListener('click', e => e.stopPropagation());

    // === Quiz controles ===
    document.getElementById('quizCerrar').addEventListener('click', cerrarQuiz);
    document.getElementById('quizBtnBack').addEventListener('click', quizAtras);
    document.getElementById('quizBtnSkip').addEventListener('click', quizOmitir);

    // === Quiz resultado overlay: cerrar al hacer clic fuera ===
    document.getElementById('quizResultadoOverlay').addEventListener('click', e => {
        if (e.target === e.currentTarget) cerrarResultado();
    });

    // === Quiz resultado modal: evitar propagación ===
    document.getElementById('quizResultadoModal').addEventListener('click', e => e.stopPropagation());

    // === Quiz resultado controles ===
    document.getElementById('quizResultadoCerrar').addEventListener('click', cerrarResultado);
    document.getElementById('quizBtnReiniciar').addEventListener('click', reiniciarQuiz);

    // === Quiz opciones: delegación de eventos ===
    document.getElementById('quizOpciones').addEventListener('click', e => {
        const btn = e.target.closest('.quiz-opcion');
        if (!btn) return;
        const fn = btn.dataset.fn;
        const id = btn.dataset.id;
        const valor = btn.dataset.valor;
        if (fn === 'select') quizSeleccionarSelect(id, valor);
        else if (fn === 'siNo') quizSeleccionarSiNo(id, valor);
    });

    // === Quiz resultados: delegación de eventos ===
    document.getElementById('quizResultadoLista').addEventListener('click', e => {
        const btn = e.target.closest('.quiz-btn-buscar');
        if (!btn) return;
        quizBuscarFamilia(btn.dataset.fam, btn.dataset.nivel);
    });

    // === Tabla resultados: delegación de eventos ===
    document.getElementById('results').addEventListener('click', e => {
        const btn = e.target.closest('.btn-calcular');
        if (btn) { calcularDistanciasProgresivo(); return; }

        const mapa = e.target.closest('.btn-maps');
        if (mapa) {
            e.preventDefault();
            const lat = mapa.dataset.lat;
            const lng = mapa.dataset.lng;
            const dest = mapa.dataset.dest;
            if (lat && lng) abrirGoogleMaps(lat, lng, dest);
            else abrirGoogleMapsSinOrigen(dest);
            return;
        }

        const detalle = e.target.closest('.btn-detalle');
        if (detalle) {
            e.preventDefault();
            abrirDetalleCentro(detalle.dataset.codigo, detalle.dataset.ensenanza);
            return;
        }
    });

    document.getElementById('results').addEventListener('change', e => {
        if (e.target.id === 'filtroProvincia' || e.target.id === 'filtroNaturaleza' || e.target.id === 'ordenarDistancia') {
            filtrarCentros();
        }
    });

});
