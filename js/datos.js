async function cargarDatos() {
    const response = await fetch('json/datos_familias.json');
    const data = await response.json();
    nivelesEstudios = data.nivelesEstudios;
    datosFamilias = data.familias;
    const selectFamilia = document.getElementById('familia');
    Object.keys(datosFamilias)
        .map(c => ({ c, n: datosFamilias[c].nombre }))
        .sort((a, b) => a.n.localeCompare(b.n, 'es'))
        .forEach(({ c, n }) => {
            const o = document.createElement('option');
            o.value = c; o.textContent = n;
            selectFamilia.appendChild(o);
        });
}

async function cargarCentrosLocal() {
    if (centrosLocalLoaded) return;
    try {
        const resp = await fetch('json/centros_educacion.json');
        centrosLocalData = await resp.json();
        centrosLocalLoaded = true;
    } catch (e) {
        console.warn('No se pudo cargar centros_educacion.json, se usará la API en vivo');
    }
}

async function cargarMunicipiosLocal() {
    try {
        const resp = await fetch('json/municipios_esp.json');
        municipiosData = await resp.json();
    } catch (e) {
        console.warn('No se pudo cargar municipios_esp.json, se usará CIUDADES_ESPANA');
    }
}

function parsearCentrosHTML(html) {
    const centros = [];
    const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
    if (!tbodyMatch) return centros;

    const rows = tbodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    for (const row of rows) {
        const cells = [];
        const tdMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
        for (const td of tdMatches) {
            const content = td.replace(/<[^>]+>/g, '').trim();
            cells.push(content);
        }
        if (cells.length >= 6) {
            centros.push({
                provincia: cells[0],
                localidad: cells[1],
                denominacionGenerica: cells[2],
                denominacionEspecifica: cells[3],
                codigo: cells[4],
                naturaleza: cells[5]
            });
        }
    }
    return centros;
}

document.addEventListener('DOMContentLoaded', cargarDatos);
cargarCentrosLocal();
cargarMunicipiosLocal();
