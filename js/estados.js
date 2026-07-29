let nivelesEstudios = [];
let datosFamilias = {};
let miUbicacion = null;
let geocodificando = false;
let municipiosData = null;

let centrosLocalData = null;
let centrosLocalLoaded = false;

let scrollbarListenersInit = false;
let scrollbarDragging = false;
let scrollbarStartX = 0;
let scrollbarScrollStart = 0;

let QUIZ_PREGUNTAS = [];
let quizTipoActual = 'original';
let quizPasoActual = 0;
let quizRespuestas = {};
let quizExcluidas = new Set();
let quizExcluidasEnsenanzas = new Set();
let quizExcluidasGrupos = new Set();
let quizInteresEnsenanzas = new Set();
