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

// ─── Siglas de 3 letras por seleção ───────────────────────────────────
const SIGLAS = {
  'México':'MEX','Coreia do Sul':'KOR','República Tcheca':'CZE','África do Sul':'RSA',
  'Bósnia e Herzegovina':'BIH','Canadá':'CAN','Catar':'QAT','Suíça':'SUI',
  'Escócia':'SCO','Brasil':'BRA','Marrocos':'MAR','Haiti':'HAI',
  'Estados Unidos':'USA','Austrália':'AUS','Turquia':'TUR','Paraguai':'PAR',
  'Alemanha':'GER','Costa do Marfim':'CIV','Equador':'ECU','Curaçao':'CUW',
  'Suécia':'SWE','Holanda':'NED','Japão':'JPN','Tunísia':'TUN',
  'Irã':'IRN','Nova Zelândia':'NZL','Bélgica':'BEL','Egito':'EGY',
  'Arábia Saudita':'KSA','Uruguai':'URU','Cabo Verde':'CPV','Espanha':'ESP',
  'França':'FRA','Iraque':'IRQ','Noruega':'NOR','Senegal':'SEN',
  'Argélia':'ALG','Argentina':'ARG','Áustria':'AUT','Jordânia':'JOR',
  'Colômbia':'COL','Portugal':'POR','República Democrática do Congo':'COD','Uzbequistão':'UZB',
  'Croácia':'CRO','Gana':'GHA','Inglaterra':'ENG','Panamá':'PAN'
};

// Cor por grupo (12 grupos, 12 cores)
const COR_GRUPO = {
  'A':'#E8B931','B':'#6FAE8C','C':'#C1432A','D':'#7CA8C9',
  'E':'#D98E4A','F':'#A06CC2','G':'#5FB8B0','H':'#D4566B',
  'I':'#8BAE3E','J':'#C77DD1','K':'#E8D031','L':'#5FAEAE'
};

// ─── 02 Ataque × Defesa (círculos coloridos por grupo + sigla) ─────────
async function montarGraficoDispersao(dados) {
  const ctx = document.getElementById('chart-dispersao');

  // Agrupar por grupo para legenda
  const grupos = [...new Set(dados.times.map(t => t.grupo))].sort();
  const datasets = grupos.map(g => ({
    label: `Grupo ${g}`,
    data: dados.times
      .filter(t => t.grupo === g)
      .map(t => ({
        x: parseFloat(t.ataque) || 1.35,
        y: parseFloat(t.defesa) > 0 ? (3 - parseFloat(t.defesa)) : 1.65,
        label: t.time,
        sigla: SIGLAS[t.time] || t.time.slice(0,3).toUpperCase(),
        grupo: t.grupo,
        rating: Math.round(parseFloat(t.rating)) || 1500
      })),
    backgroundColor: COR_GRUPO[g] || '#E8B931',
    borderColor: 'rgba(11,61,46,0.8)',
    borderWidth: 1,
    pointRadius: 14,
    pointHoverRadius: 16,
    pointStyle: 'circle',
  }));

  if (chartDispersao) chartDispersao.destroy();
  chartDispersao = new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 20, right: 24, bottom: 8, left: 8 } },
      interaction: { mode: 'nearest', intersect: true },
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
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: '#F0F4ED', font: { size: 10 }, boxWidth: 10, padding: 10 }
        },
        tooltip: {
          backgroundColor: 'rgba(11,61,46,0.97)',
          titleColor: '#E8B931',
          bodyColor: '#F0F4ED',
          borderColor: 'rgba(232,185,49,0.4)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            title: items => items[0].raw.label,
            label: item => [
              `Grupo ${item.raw.grupo}  ·  Rating ${item.raw.rating}`,
              `Ataque: ${item.raw.x.toFixed(2)}  ·  Defesa: ${(3 - item.raw.y).toFixed(2)}`
            ]
          }
        }
      }
    },
    plugins: [{
      // Plugin para desenhar a sigla dentro do círculo
      id: 'siglas',
      afterDatasetsDraw(chart) {
        const { ctx: c } = chart;
        chart.data.datasets.forEach((ds, di) => {
          const meta = chart.getDatasetMeta(di);
          meta.data.forEach((el, ei) => {
            const ponto = ds.data[ei];
            c.save();
            c.fillStyle = '#0B3D2E';
            c.font = 'bold 7px sans-serif';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(ponto.sigla, el.x, el.y);
            c.restore();
          });
        });
      }
    }]
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

// ─── 05 Mata-mata — bracket com chaveamento oficial ───────────────────

// Chaveamento fixo dos 16-avos (1º × 2º de grupos fixos)
// Fonte: regulamento oficial FIFA Copa 2026
const CHAVEAMENTO_16AVOS = [
  { id:'M1',  timeA:'1º Grupo A', timeB:'2º Grupo B', data:'28/06' },
  { id:'M2',  timeA:'1º Grupo C', timeB:'2º Grupo F', data:'29/06' },
  { id:'M3',  timeA:'1º Grupo E', timeB:'3º (A/B/C/D/F)', data:'29/06' },
  { id:'M4',  timeA:'1º Grupo F', timeB:'2º Grupo C', data:'29/06' },
  { id:'M5',  timeA:'2º Grupo E', timeB:'2º Grupo I', data:'30/06' },
  { id:'M6',  timeA:'1º Grupo I', timeB:'3º (C/D/F/G/H)', data:'30/06' },
  { id:'M7',  timeA:'1º Grupo A', timeB:'3º (C/E/F/H/I)', data:'01/07' },
  { id:'M8',  timeA:'1º Grupo L', timeB:'3º (E/H/I/J/K)', data:'01/07' },
  { id:'M9',  timeA:'1º Grupo G', timeB:'3º (A/E/H/I/J)', data:'01/07' },
  { id:'M10', timeA:'1º Grupo D', timeB:'3º (B/E/F/I/J)', data:'02/07' },
  { id:'M11', timeA:'1º Grupo H', timeB:'2º Grupo J', data:'02/07' },
  { id:'M12', timeA:'2º Grupo K', timeB:'2º Grupo L', data:'03/07' },
  { id:'M13', timeA:'1º Grupo B', timeB:'3º (E/F/G/I/J)', data:'03/07' },
  { id:'M14', timeA:'2º Grupo D', timeB:'2º Grupo G', data:'03/07' },
  { id:'M15', timeA:'1º Grupo J', timeB:'2º Grupo H', data:'03/07' },
  { id:'M16', timeA:'1º Grupo K', timeB:'3º (D/E/I/J/L)', data:'03/07' },
];

// Calcula probabilidade de vitória do timeA vs timeB usando modelo Poisson simplificado
function calcProb(dados, nomeA, nomeB) {
  const tA = dados.times.find(t => t.time === nomeA);
  const tB = dados.times.find(t => t.time === nomeB);
  if (!tA || !tB) return null;
  const golesEspA = (parseFloat(tA.ataque) + parseFloat(tB.defesa)) / 2;
  const golesEspB = (parseFloat(tB.ataque) + parseFloat(tA.defesa)) / 2;
  // Probabilidade via diferença de gols esperados (função logística)
  const diff = golesEspA - golesEspB;
  const probA = 1 / (1 + Math.exp(-1.3 * diff));
  return { probA: probA, probB: 1 - probA, golesEspA, golesEspB };
}

// Busca time classificado em determinada posição/grupo
function buscarClassificado(dados, slot) {
  // slot ex: "1º Grupo C" ou "2º Grupo F"
  if (!slot || slot.includes('3º') || slot.includes('Venc.') || slot.includes('Perd.')) return null;
  const match = slot.match(/^([12])º Grupo ([A-L])$/);
  if (!match) return null;
  const pos = parseInt(match[1]);
  const grupo = match[2];
  // Buscar na classificação (aba Times tem grupo mas não posição — usamos o ranking implícito)
  // Por ora retornamos o slot como texto
  return null; // será preenchido quando a API retornar classificados
}

function montarBracket(dados) {
  try {
    console.log('montarBracket iniciado, times:', dados?.times?.length);
    const container = document.getElementById('bracket-container');
    if (!container) { console.error('bracket-container não encontrado'); return; }
  container.innerHTML = '';

  const bracket = document.createElement('div');
  bracket.className = 'bracket';

  // Fase 16-avos
  const fase16 = document.createElement('div');
  fase16.className = 'bracket-fase';
  fase16.innerHTML = '<div class="bracket-fase-titulo">16-avos · 28/06–03/07</div>';
  const slots16 = document.createElement('div');
  slots16.className = 'bracket-slots';

  CHAVEAMENTO_16AVOS.forEach(jogo => {
    const div = document.createElement('div');
    div.className = 'confronto';

    // Tentar encontrar times reais (da API)
    const tA = dados.times.find(t => t.time === jogo.timeA);
    const tB = dados.times.find(t => t.time === jogo.timeB);
    const prob = tA && tB ? calcProb(dados, jogo.timeA, jogo.timeB) : null;

    const isoA = tA ? (FLAG_ISO[tA.time] || '') : '';
    const isoB = tB ? (FLAG_ISO[tB.time] || '') : '';
    const flagA = isoA ? `<img src="https://flagcdn.com/16x12/${isoA}.png" style="vertical-align:middle;">` : '🏳️';
    const flagB = isoB ? `<img src="https://flagcdn.com/16x12/${isoB}.png" style="vertical-align:middle;">` : '🏳️';

    const nomeA = tA ? tA.time : `<span class="slot-vazio">${jogo.timeA}</span>`;
    const nomeB = tB ? tB.time : `<span class="slot-vazio">${jogo.timeB}</span>`;

    const probTexto = prob
      ? `${Math.round(prob.probA * 100)}% · ${Math.round(prob.probB * 100)}%`
      : '—';

    div.innerHTML = `
      <div class="confronto-time">${flagA} ${nomeA}</div>
      <div class="confronto-time">${flagB} ${nomeB}</div>
      <div class="confronto-prob">${probTexto} · ${jogo.data}</div>
      ${prob ? `
      <div class="confronto-tooltip">
        <div style="color:#E8B931;font-weight:600;margin-bottom:6px">${jogo.id} · ${jogo.data}</div>
        <div>${jogo.timeA}: <b>${Math.round(prob.probA * 100)}%</b> (${prob.golesEspA.toFixed(2)} gols esp.)</div>
        <div>${jogo.timeB}: <b>${Math.round(prob.probB * 100)}%</b> (${prob.golesEspB.toFixed(2)} gols esp.)</div>
      </div>` : ''}
    `;
    slots16.appendChild(div);
  });

  fase16.appendChild(slots16);
  bracket.appendChild(fase16);

  // Fases posteriores (slots vazios por enquanto)
  const fases = ['Oitavas · 04–07/07','Quartas · 09–11/07','Semifinal · 14–15/07','Final · 19/07'];
  const jogos = [8, 4, 2, 1];
  fases.forEach((nome, fi) => {
    const fase = document.createElement('div');
    fase.className = 'bracket-fase';
    fase.innerHTML = `<div class="bracket-fase-titulo">${nome}</div>`;
    const slots = document.createElement('div');
    slots.className = 'bracket-slots';
    for (let i = 0; i < jogos[fi]; i++) {
      const div = document.createElement('div');
      div.className = 'confronto';
      div.innerHTML = `
        <div class="confronto-time"><span class="slot-vazio">A definir</span></div>
        <div class="confronto-time"><span class="slot-vazio">A definir</span></div>
        <div class="confronto-prob">—</div>
      `;
      slots.appendChild(div);
    }
    fase.appendChild(slots);
    bracket.appendChild(fase);
  });

  container.appendChild(bracket);
  document.getElementById('bracket-loading')?.remove();
  console.log('montarBracket concluído');
  } catch(e) {
    console.error('Erro no montarBracket:', e);
    const container = document.getElementById('bracket-container');
    if (container) container.innerHTML = '<div style="color:#C1432A;padding:20px">Erro ao carregar chaveamento: ' + e.message + '</div>';
  }
}
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

  // Bracket — rodar depois de tudo para garantir DOM pronto
  setTimeout(() => montarBracket(dadosGlobais), 100);
}

// Iniciado pelo index.html após Chart.js carregar
iniciar();
