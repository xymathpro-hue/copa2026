/**
 * charts.js — Copa 2026 Dashboard
 * Dispersão com bandeiras reais + linha de evolução refinada
 */

// ─── Paleta ───────────────────────────────────────────────────────────
const PALETA = [
  '#E8B931','#6FAE8C','#C1432A','#7CA8C9','#D98E4A',
  '#A06CC2','#5FB8B0','#D4566B','#8BAE3E','#C77DD1',
  '#E8D031','#5FAEAE'
];

// ─── Mapa nome PT → código ISO 2 letras (para flagcdn.com) ────────────
const FLAG_ISO = {
  'México':'mx','Coreia do Sul':'kr','República Tcheca':'cz','África do Sul':'za',
  'Bósnia e Herzegovina':'ba','Canadá':'ca','Catar':'qa','Suíça':'ch',
  'Escócia':'gb-sct','Brasil':'br','Marrocos':'ma','Haiti':'ht',
  'Estados Unidos':'us','Austrália':'au','Turquia':'tr','Paraguai':'py',
  'Alemanha':'de','Costa do Marfim':'ci','Equador':'ec','Curaçao':'cw',
  'Suécia':'se','Holanda':'nl','Japão':'jp','Tunísia':'tn',
  'Irã':'ir','Nova Zelândia':'nz','Bélgica':'be','Egito':'eg',
  'Arábia Saudita':'sa','Uruguai':'uy','Cabo Verde':'cv','Espanha':'es',
  'França':'fr','Iraque':'iq','Noruega':'no','Senegal':'sn',
  'Argélia':'dz','Argentina':'ar','Áustria':'at','Jordânia':'jo',
  'Colômbia':'co','Portugal':'pt','República Democrática do Congo':'cd','Uzbequistão':'uz',
  'Croácia':'hr','Gana':'gh','Inglaterra':'gb-eng','Panamá':'pa'
};

function flagUrl(nomeTime) {
  const iso = FLAG_ISO[nomeTime];
  if (!iso) return null;
  return `https://flagcdn.com/32x24/${iso}.png`;
}

// ─── Estado global ─────────────────────────────────────────────────────
let dadosGlobais = null;
let chartEvolucao, chartDispersao, chartRadar;
const imagensCache = {};

// ─── Pré-carregar bandeiras ────────────────────────────────────────────
function preCarregarBandeiras(times) {
  return Promise.all(times.map(t => new Promise(resolve => {
    const url = flagUrl(t.time);
    if (!url) { resolve(); return; }
    if (imagensCache[t.time]) { resolve(); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => { imagensCache[t.time] = img; resolve(); };
    img.onerror = () => resolve();
    img.src = url;
  })));
}

// ─── 01 Evolução do rating ─────────────────────────────────────────────
function serieRatingPorTime(motor, nomeTime) {
  const pontos = [{ x: 0, y: 1500 }];
  let n = 0;
  motor.forEach(j => {
    if (j.timeA === nomeTime) { n++; pontos.push({ x: n, y: j.eloA_depois }); }
    else if (j.timeB === nomeTime) { n++; pontos.push({ x: n, y: j.eloB_depois }); }
  });
  return pontos;
}

function montarGraficoEvolucao(dados, selecionados) {
  const ctx = document.getElementById('chart-evolucao');
  const datasets = selecionados.map((nome, i) => ({
    label: nome,
    data: serieRatingPorTime(dados.motor, nome),
    borderColor: PALETA[i % PALETA.length],
    backgroundColor: PALETA[i % PALETA.length],
    borderWidth: 1.5,
    pointRadius: 4,
    pointHoverRadius: 6,
    tension: 0.2,
    fill: false
  }));

  if (chartEvolucao) chartEvolucao.destroy();
  chartEvolucao = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Jogos disputados', color: 'rgba(240,244,237,0.5)', font: { size: 11 } },
          ticks: { color: 'rgba(240,244,237,0.5)', stepSize: 1, font: { size: 10 } },
          grid: { color: 'rgba(240,244,237,0.06)' }
        },
        y: {
          title: { display: true, text: 'Rating Elo', color: 'rgba(240,244,237,0.5)', font: { size: 11 } },
          ticks: { color: 'rgba(240,244,237,0.5)', font: { size: 10 } },
          grid: { color: 'rgba(240,244,237,0.06)' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#F0F4ED', font: { size: 11 }, boxWidth: 12, padding: 16 }
        },
        tooltip: {
          backgroundColor: 'rgba(11,61,46,0.95)',
          titleColor: '#E8B931',
          bodyColor: '#F0F4ED',
          borderColor: 'rgba(240,244,237,0.15)',
          borderWidth: 1,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${Math.round(ctx.parsed.y)}`
          }
        }
      }
    }
  });
}

// ─── 02 Ataque × Defesa (com bandeiras via pointStyle nativo) ─────────
async function montarGraficoDispersao(dados) {
  await preCarregarBandeiras(dados.times);

  const ctx = document.getElementById('chart-dispersao');

  // Um dataset por time — assim cada ponto tem seu próprio pointStyle (bandeira)
  const datasets = dados.times.map(t => {
    const iso = FLAG_ISO[t.time];
    const img = imagensCache[t.time];
    return {
      label: t.time,
      data: [{
        x: parseFloat(t.ataque) || 1.35,
        y: parseFloat(t.defesa) > 0 ? (3 - parseFloat(t.defesa)) : 1.65,
        label: t.time,
        grupo: t.grupo
      }],
      pointStyle: img || 'circle',
      pointRadius: img ? 14 : 6,
      pointHoverRadius: img ? 16 : 8,
      backgroundColor: img ? 'rgba(0,0,0,0)' : '#E8B931',
      borderColor: 'rgba(0,0,0,0)',
      pointBorderColor: 'rgba(0,0,0,0)',
      pointHoverBorderColor: '#E8B931',
      pointHoverBorderWidth: 2,
      pointHoverBackgroundColor: img ? 'rgba(232,185,49,0.1)' : '#E8B931',
    };
  });

  if (chartDispersao) chartDispersao.destroy();
  chartDispersao = new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 20, right: 24, bottom: 8, left: 8 } },
      interaction: {
        mode: 'nearest',
        intersect: true,
        axis: 'xy'
      },
      scales: {
        x: {
          title: { display: true, text: 'Poder ofensivo →', color: 'rgba(240,244,237,0.5)', font: { size: 11 } },
          ticks: { color: 'rgba(240,244,237,0.7)', font: { size: 10 } },
          grid: { color: 'rgba(240,244,237,0.06)' }
        },
        y: {
          title: { display: true, text: 'Solidez defensiva →', color: 'rgba(240,244,237,0.5)', font: { size: 11 } },
          ticks: { color: 'rgba(240,244,237,0.7)', font: { size: 10 } },
          grid: { color: 'rgba(240,244,237,0.06)' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11,61,46,0.97)',
          titleColor: '#E8B931',
          bodyColor: '#F0F4ED',
          borderColor: 'rgba(232,185,49,0.4)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            title: items => items[0].dataset.label,
            label: item => [
              `Grupo ${item.raw.grupo}`,
              `Ataque: ${item.raw.x.toFixed(2)}`,
              `Defesa: ${(3 - item.raw.y).toFixed(2)}`
            ]
          }
        }
      }
    }
    // sem plugin customizado — Chart.js nativo desenha as bandeiras via pointStyle
  });
}

// ─── 03 Radar de confronto ─────────────────────────────────────────────
function montarGraficoRadar(dados, nomeA, nomeB) {
  const ctx = document.getElementById('chart-radar');
  const tA = dados.times.find(t => t.time === nomeA);
  const tB = dados.times.find(t => t.time === nomeB);
  if (!tA || !tB) return;

  const norm = t => [
    (t.rating - 1470) / 1,         // Rating (base 1470)
    parseFloat(t.ataque) * 50,
    (3 - parseFloat(t.defesa)) * 50
  ];

  if (chartRadar) chartRadar.destroy();
  chartRadar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Rating', 'Ataque', 'Defesa'],
      datasets: [
        {
          label: tA.time,
          data: norm(tA),
          borderColor: '#E8B931',
          backgroundColor: 'rgba(232,185,49,0.15)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#E8B931'
        },
        {
          label: tB.time,
          data: norm(tB),
          borderColor: '#7CA8C9',
          backgroundColor: 'rgba(124,168,201,0.15)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#7CA8C9'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          ticks: { display: false },
          grid: { color: 'rgba(240,244,237,0.1)' },
          angleLines: { color: 'rgba(240,244,237,0.1)' },
          pointLabels: { color: '#F0F4ED', font: { size: 12 } }
        }
      },
      plugins: {
        legend: { labels: { color: '#F0F4ED', font: { size: 11 }, boxWidth: 12 } }
      }
    }
  });
}

// ─── 04 Tabela de ranking ─────────────────────────────────────────────
function montarTabela(dados) {
  const tbody = document.querySelector('#tabela-ranking tbody');
  const ord = [...dados.times].sort((a, b) => b.rating - a.rating);
  tbody.innerHTML = ord.map((t, i) => {
    const iso = FLAG_ISO[t.time];
    const flag = iso ? `<img src="https://flagcdn.com/20x15/${iso}.png" style="vertical-align:middle;margin-right:8px;border-radius:1px;">` : '';
    return `<tr>
      <td style="color:rgba(240,244,237,0.4);font-size:0.8rem">${i + 1}</td>
      <td>${flag}${t.time}</td>
      <td style="color:rgba(240,244,237,0.5)">${t.grupo}</td>
      <td class="num mono">${Math.round(t.rating)}</td>
      <td class="num mono">${parseFloat(t.ataque).toFixed(2)}</td>
      <td class="num mono">${parseFloat(t.defesa).toFixed(2)}</td>
    </tr>`;
  }).join('');
}

// ─── Filtros ──────────────────────────────────────────────────────────
let timesSelecionados = [];

function preencherFiltros(dados) {
  const nomes = dados.times.map(t => t.time);

  // --- Seletor de grupo ---
  const selGrupo = document.getElementById('filtro-grupo');
  [...new Set(dados.times.map(t => t.grupo))].sort().forEach(g => {
    const o = document.createElement('option');
    o.value = g; o.textContent = `Grupo ${g}`;
    selGrupo.appendChild(o);
  });

  // --- Substituir o select múltiplo por botões de toggle ---
  const selTimes = document.getElementById('filtro-times');
  selTimes.style.display = 'none'; // esconder o select original

  // Criar container de botões
  const btnContainer = document.createElement('div');
  btnContainer.id = 'btn-times';
  btnContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;max-height:120px;overflow-y:auto;';
  selTimes.parentNode.insertBefore(btnContainer, selTimes.nextSibling);

  // Selecionar grupo A por padrão
  timesSelecionados = dados.times.filter(t => t.grupo === 'A').map(t => t.time);

  function renderBotoes(grupoFiltro) {
    btnContainer.innerHTML = '';
    const timesFiltrados = grupoFiltro === 'todos'
      ? dados.times
      : dados.times.filter(t => t.grupo === grupoFiltro);

    timesFiltrados.forEach(t => {
      const iso = FLAG_ISO[t.time];
      const flagHtml = iso ? `<img src="https://flagcdn.com/16x12/${iso}.png" style="margin-right:4px;vertical-align:middle;">` : '';
      const btn = document.createElement('button');
      btn.innerHTML = flagHtml + t.time;
      btn.dataset.time = t.time;
      btn.style.cssText = `
        padding:4px 10px;border-radius:3px;font-size:0.78rem;cursor:pointer;
        transition:all 0.15s;border:1px solid rgba(240,244,237,0.2);
        background:${timesSelecionados.includes(t.time) ? 'rgba(232,185,49,0.2)' : 'rgba(11,61,46,0.6)'};
        color:${timesSelecionados.includes(t.time) ? '#E8B931' : 'rgba(240,244,237,0.7)'};
        border-color:${timesSelecionados.includes(t.time) ? '#E8B931' : 'rgba(240,244,237,0.2)'};
      `;
      btn.addEventListener('click', () => {
        const nome = btn.dataset.time;
        if (timesSelecionados.includes(nome)) {
          if (timesSelecionados.length > 1) { // mínimo 1 selecionado
            timesSelecionados = timesSelecionados.filter(n => n !== nome);
          }
        } else {
          timesSelecionados.push(nome);
        }
        renderBotoes(selGrupo.value);
        montarGraficoEvolucao(dadosGlobais, timesSelecionados);
      });
      btnContainer.appendChild(btn);
    });
  }

  renderBotoes('A'); // começa no grupo A
  selGrupo.value = 'A';

  selGrupo.addEventListener('change', () => {
    const g = selGrupo.value;
    // Ao mudar grupo, selecionar automaticamente todos os times do grupo
    timesSelecionados = g === 'todos'
      ? dados.times.slice(0, 4).map(t => t.time)
      : dados.times.filter(t => t.grupo === g).map(t => t.time);
    renderBotoes(g);
    montarGraficoEvolucao(dadosGlobais, timesSelecionados);
  });

  // --- Seletores do radar ---
  const tA = document.getElementById('time-a');
  const tB = document.getElementById('time-b');
  nomes.forEach((nome, i) => {
    const oA = document.createElement('option'); oA.value = nome; oA.textContent = nome;
    if (i === 0) oA.selected = true;
    tA.appendChild(oA);
    const oB = document.createElement('option'); oB.value = nome; oB.textContent = nome;
    if (i === 1) oB.selected = true;
    tB.appendChild(oB);
  });

  tA.addEventListener('change', () => montarGraficoRadar(dadosGlobais, tA.value, tB.value));
  tB.addEventListener('change', () => montarGraficoRadar(dadosGlobais, tA.value, tB.value));
}

// ─── Status bar ───────────────────────────────────────────────────────
function preencherStatusBar(dados) {
  const disputados = new Set(dados.motor.map(m => m.jogoNum)).size;
  document.getElementById('stat-jogos').textContent = disputados;
  document.getElementById('stat-restantes').textContent = 104 - disputados;
  const d = new Date(dados.atualizadoEm);
  document.getElementById('stat-atualizado').textContent =
    d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
}

// ─── Iniciar ──────────────────────────────────────────────────────────
async function iniciar() {
  dadosGlobais = await carregarDados();
  preencherStatusBar(dadosGlobais);
  preencherFiltros(dadosGlobais);

  // timesSelecionados já foi definido dentro de preencherFiltros (grupo A)
  montarGraficoEvolucao(dadosGlobais, timesSelecionados);
  await montarGraficoDispersao(dadosGlobais);

  const tA = document.getElementById('time-a').value;
  const tB = document.getElementById('time-b').value;
  montarGraficoRadar(dadosGlobais, tA, tB);
  montarTabela(dadosGlobais);
}

// Iniciado pelo index.html após Chart.js carregar
iniciar();
