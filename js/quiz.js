async function cargarQuizPreguntas(tipo = 'original') {
    quizTipoActual = tipo;
    const archivo = tipo === 'vocacional' ? 'json/test_vocacional.json' : 'json/quiz_preguntas.json';
    const resp = await fetch(archivo);
    QUIZ_PREGUNTAS = await resp.json();
}

cargarQuizPreguntas();

const QUIZ_NOMBRES_FAMILIAS = {
    ele: 'Electricidad y Electrónica',
    ifc: 'Informática y Comunicaciones',
    adg: 'Administración y Gestión',
    san: 'Sanidad',
    hot: 'Hostelería y Turismo',
    com: 'Comercio y Marketing',
    fme: 'Fabricación Mecánica',
    ima: 'Instalación y Mantenimiento',
    ena: 'Energía y Agua',
    qui: 'Química',
    eoc: 'Edificación y Obra Civil',
    agr: 'Agraria',
    ina: 'Industrias Alimentarias',
    sea: 'Seguridad y Medio Ambiente',
    ssc: 'Servicios Socioculturales y a la Comunidad',
    tcp: 'Textil, Confección y Piel',
    mam: 'Madera, Mueble y Corcho',
    vic: 'Vidrio y Cerámica',
    agr2: 'Artes Gráficas',
    ims: 'Imagen y Sonido',
    ara: 'Artes y Artesanías',
    iex: 'Industrias Extractivas',
    imp: 'Imagen Personal',
    tmv: 'Transporte y Mantenimiento de Vehículos',
    iad: 'Inteligencia Artificial y Data',
    afd: 'Actividades Físicas y Deportivas'
};

function abrirQuiz(tipo = 'original') {
    quizPasoActual = 0;
    quizRespuestas = {};
    quizExcluidas = new Set();
    quizExcluidasEnsenanzas = new Set();
    quizExcluidasGrupos = new Set();
    quizInteresEnsenanzas = new Set();
    if (typeof umami !== 'undefined') umami.track('abrir_quiz', { tipo: tipo });

    const titulo = document.getElementById('quizTitulo');
    const subtitulo = document.getElementById('quizSubtitulo');

    if (tipo === 'vocacional') {
        titulo.innerHTML = '&#127919; Test Vocacional';
        subtitulo.textContent = 'Responde estas 36 preguntas para descubrir qué estudiar';
    } else {
        titulo.innerHTML = '&#128218; ¿Qué estudiar?';
        subtitulo.textContent = 'Responde estas preguntas y te recomendaremos familias profesionales';
    }

    cargarQuizPreguntas(tipo).then(() => {
        document.getElementById('quizOverlay').classList.add('activo');
        document.body.style.overflow = 'hidden';
        mostrarPreguntaQuiz();
    });
}

function cerrarQuiz() {
    if (typeof umami !== 'undefined') umami.track('cerrar_quiz', { paso: quizPasoActual, respuestas: Object.keys(quizRespuestas).length });
    document.getElementById('quizOverlay').classList.remove('activo');
    document.body.style.overflow = '';
}

function mostrarPreguntaQuiz() {
    const p = QUIZ_PREGUNTAS[quizPasoActual];
    const total = QUIZ_PREGUNTAS.length;
    const preguntaDiv = document.getElementById('quizPregunta');
    const opcionesDiv = document.getElementById('quizOpciones');
    const barra = document.getElementById('quizBarra');
    const textoProgreso = document.getElementById('quizProgresoTexto');
    const btnBack = document.getElementById('quizBtnBack');

    const totalVisible = quizCalcularTotalVisible();
    const pct = Math.min(100, ((quizPasoActual + 1) / totalVisible) * 100);
    barra.style.width = pct + '%';
    textoProgreso.textContent = `${quizPasoActual + 1} / ${totalVisible}`;
    btnBack.style.display = quizPasoActual > 0 ? 'inline-block' : 'none';

    const iconoHtml = p.icono ? `<span class="quiz-icono">${p.icono}</span>` : '';
    preguntaDiv.innerHTML = `${iconoHtml}<p>${p.texto}</p>`;

    if (p.tipo === 'select') {
        opcionesDiv.innerHTML = p.opciones.map(o =>
            `<button type="button" class="quiz-opcion ${quizRespuestas[p.id] === o.valor ? 'seleccionada' : ''}"
                data-fn="select" data-id="${p.id}" data-valor="${o.valor}">${o.label}</button>`
        ).join('');
    } else {
        opcionesDiv.innerHTML = `
            <button type="button" class="quiz-opcion ${quizRespuestas[p.id] === 'si' ? 'seleccionada' : ''}"
                data-fn="siNo" data-id="${p.id}" data-valor="si">&#9989; Sí</button>
            <button type="button" class="quiz-opcion ${quizRespuestas[p.id] === 'no' ? 'seleccionada' : ''}"
                data-fn="siNo" data-id="${p.id}" data-valor="no">&#10060; No</button>`;
    }
}

function quizSeleccionarSelect(id, valor) {
    quizRespuestas[id] = valor;
    if (typeof umami !== 'undefined') umami.track('quiz_respuesta', { id: id, valor: valor, tipo: 'select' });
    quizAvanzar();
}

function quizSeleccionarSiNo(id, valor) {
    quizRespuestas[id] = valor;
    if (typeof umami !== 'undefined') umami.track('quiz_respuesta', { id: id, valor: valor, tipo: 'si_no' });
    const p = QUIZ_PREGUNTAS.find(q => q.id === id);
    if (!p) { quizAvanzar(); return; }

    if (p.puntuacion && valor === 'no' && quizTipoActual !== 'vocacional') {
        Object.keys(p.puntuacion).forEach(fam => quizExcluidas.add(fam));
    }
    if (p.excluye && valor === 'si') {
        p.excluye.forEach(fam => quizExcluidas.add(fam));
    }

    if (p.ensenanza) {
        const clave = p.familia + '_' + p.ensenanza;
        if (valor === 'no' && p.puntuacion) {
            quizExcluidasEnsenanzas.add(clave);
            if (p.grupo) quizExcluidasGrupos.add(p.grupo);
        }
        if (p.excluye_ensenanza && valor === 'si') {
            p.excluye_ensenanza.forEach(k => quizExcluidasEnsenanzas.add(k));
            if (p.grupo) quizExcluidasGrupos.add(p.grupo);
        }
        if (p.excluye_grupo && valor === 'si') {
            p.excluye_grupo.forEach(g => quizExcluidasGrupos.add(g));
        }
        if (valor === 'si' && p.puntuacion) {
            quizInteresEnsenanzas.add(clave);
        }
    }

    quizAvanzar();
}

function debeSaltarPregunta(p) {
    if (p.familia && quizExcluidas.has(p.familia)) return true;
    if (p.excluye && p.excluye.some(fam => quizExcluidas.has(fam))) return true;
    if (p.ensenanza) {
        const clave = p.familia + '_' + p.ensenanza;
        if (quizExcluidasEnsenanzas.has(clave)) return true;
        if (p.grupo && quizExcluidasGrupos.has(p.grupo)) return true;
        if (p.excluye_ensenanza && p.excluye_ensenanza.some(k => quizExcluidasEnsenanzas.has(k))) return true;
    }
    return false;
}

function quizCalcularTotalVisible() {
    let total = 0;
    for (let i = quizPasoActual; i < QUIZ_PREGUNTAS.length; i++) {
        if (!debeSaltarPregunta(QUIZ_PREGUNTAS[i])) total++;
    }
    return Math.max(total, 1);
}

function quizAvanzar() {
    if (quizPasoActual < QUIZ_PREGUNTAS.length - 1) {
        quizPasoActual++;
        while (quizPasoActual < QUIZ_PREGUNTAS.length && debeSaltarPregunta(QUIZ_PREGUNTAS[quizPasoActual])) {
            quizPasoActual++;
        }
        if (quizPasoActual < QUIZ_PREGUNTAS.length) {
            mostrarPreguntaQuiz();
        } else {
            mostrarResultadosQuiz();
        }
    } else {
        mostrarResultadosQuiz();
    }
}

function quizOmitir() {
    quizAvanzar();
}

function quizAtras() {
    if (quizPasoActual > 0) {
        quizPasoActual--;
        mostrarPreguntaQuiz();
    }
}

function mostrarResultadosQuiz() {
    cerrarQuiz();

    const puntuaciones = {};
    const excluidas = new Set();
    const nivelSeleccionado = quizRespuestas.nivel || 'superior';

    QUIZ_PREGUNTAS.forEach(p => {
        const respuesta = quizRespuestas[p.id];
        if (!respuesta) return;

        if (p.excluye && respuesta === 'si') {
            p.excluye.forEach(fam => excluidas.add(fam));
        }

        if (p.tipo === 'select' && respuesta && p.puntuacion && p.puntuacion[respuesta]) {
            const puntuacionesOpcion = p.puntuacion[respuesta];
            Object.entries(puntuacionesOpcion).forEach(([fam, pts]) => {
                puntuaciones[fam] = (puntuaciones[fam] || 0) + pts;
            });
        } else if (respuesta === 'si' && p.puntuacion) {
            Object.entries(p.puntuacion).forEach(([fam, pts]) => {
                puntuaciones[fam] = (puntuaciones[fam] || 0) + pts;
            });
        }

        if (respuesta === 'no' && p.puntuacion && quizTipoActual !== 'vocacional') {
            Object.keys(p.puntuacion).forEach(fam => {
                excluidas.add(fam);
            });
        }
    });

    const ordenadas = Object.entries(puntuaciones)
        .filter(([fam]) => !excluidas.has(fam))
        .sort((a, b) => b[1] - a[1])
        .filter(([, pts]) => pts >= 2);

    const listaDiv = document.getElementById('quizResultadoLista');
    const subtitulo = document.getElementById('quizResultadoSubtitulo');

    const todasSi = quizTipoActual === 'vocacional' && QUIZ_PREGUNTAS.every(p => {
        if (p.tipo !== 'si_no') return true;
        return quizRespuestas[p.id] === 'si';
    });

    if (todasSi) {
        subtitulo.textContent = '';
        listaDiv.innerHTML = '<div class="quiz-resultado-item"><div class="quiz-resultado-header"><span class="quiz-resultado-nombre">🚀 Te gusta hacer de todo tio, eres como Macgyver, la NASA te está buscando.</span></div></div>';
    } else if (ordenadas.length === 0) {
        if (quizTipoActual === 'vocacional') {
            subtitulo.textContent = '';
            listaDiv.innerHTML = '<div class="quiz-resultado-item"><div class="quiz-resultado-header"><span class="quiz-resultado-nombre">🍺 No te gusta nada macho, lo mejor que te vayas al bar a beber cerveza.</span></div></div>';
        } else {
            subtitulo.textContent = 'No hemos podido identificar una familia concreta. Prueba con la búsqueda manual.';
            listaDiv.innerHTML = '';
        }
    } else {
        subtitulo.textContent = `Estas son las familias profesionales que más se ajustan a tus respuestas (nivel: ${obtenerNombreNivel(nivelSeleccionado)}):`;
        listaDiv.innerHTML = ordenadas.map(([fam, pts], idx) => {
            const nombre = QUIZ_NOMBRES_FAMILIAS[fam] || fam;
            const enseñanzas = obtenerEnsenanzasFamilia(fam, nivelSeleccionado);
            const enseñanzasHtml = enseñanzas.length > 0
                ? enseñanzas.map(e => `<li>${e.nombre}</li>`).join('')
                : '<li class="sin-ensenanzas">No hay enseñanzas para este nivel</li>';
            const barraPct = Math.min(100, (pts / (ordenadas[0][1] || 1)) * 100);
            return `
                <div class="quiz-resultado-item ${idx < 3 ? 'top' : ''}">
                    <div class="quiz-resultado-header">
                        <span class="quiz-resultado-rank">${idx + 1}º</span>
                        <span class="quiz-resultado-nombre">${nombre}</span>
                        <div class="quiz-resultado-barra-wrap">
                            <div class="quiz-resultado-barra" style="width:${barraPct}%"></div>
                        </div>
                    </div>
                    <ul class="quiz-resultado-ensenanzas">${enseñanzasHtml}</ul>
                    <button type="button" class="quiz-btn-buscar"
                        data-fam="${fam}" data-nivel="${nivelSeleccionado}">
                        Buscar centros
                    </button>
                </div>`;
        }).join('');
    }

    document.getElementById('quizResultadoOverlay').classList.add('activo');
    document.body.style.overflow = 'hidden';
    if (typeof umami !== 'undefined') umami.track('quiz_resultado', { familias_recomendadas: ordenadas.length, tipo: quizTipoActual });
}

function obtenerNombreNivel(codigo) {
    const niveles = {
        basico: 'Básico',
        medio: 'Grado Medio',
        superior: 'Grado Superior',
        especializacionMedio: 'Especialización (Grado Medio)',
        especializacionSuperior: 'Especialización (Grado Superior)'
    };
    return niveles[codigo] || codigo;
}

function obtenerEnsenanzasFamilia(fam, nivel) {
    if (!datosFamilias[fam] || !datosFamilias[fam].niveles[nivel]) return [];
    return datosFamilias[fam].niveles[nivel] || [];
}

function quizBuscarFamilia(fam, nivel) {
    cerrarResultado();
    if (typeof umami !== 'undefined') umami.track('quiz_buscar_familia', { familia: fam, nivel: nivel, nombre: QUIZ_NOMBRES_FAMILIAS[fam] || fam });

    const selectFamilia = document.getElementById('familia');
    selectFamilia.value = fam;
    cargarNiveles();

    const selectNivel = document.getElementById('nivel');
    selectNivel.value = nivel;
    cargarEnsenanzas();

    document.getElementById('modalidad').value = '3';

    const selectEnsenanza = document.getElementById('ensenanza');
    if (selectEnsenanza.options.length > 1) {
        selectEnsenanza.selectedIndex = 1;
        buscarCentros();
    }
}

function cerrarResultado() {
    document.getElementById('quizResultadoOverlay').classList.remove('activo');
    document.body.style.overflow = '';
}

function reiniciarQuiz() {
    cerrarResultado();
    abrirQuiz(quizTipoActual);
}
