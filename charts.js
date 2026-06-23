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

// ─── Plugin customizado para desenhar bandeiras no scatter ─────────────
const pluginBandeiras = {
  id: 'bandeiras',
  afterDatasetsDraw(chart) {
    const { ctx, data, scales } = chart;
    if (!data.datasets[0]) return;
    data.datasets[0].data.forEach((ponto, i) => {
      const x = scales.x.getPixelForValue(ponto.x);
      const y = scales.y.getPixelForValue(ponto.y);
      const img = imagensCache[ponto.label];
      if (img) {
        const w = 32, h = 24;
        ctx.save();
        // sombra sutil
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.drawImage(img, x - w/2, y - h/2, w, h);
        ctx.restore();
      } else {
        // fallback: círculo amarelo com inicial
        ctx.save();
        ctx.fillStyle = '#E8B931';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0B3D2E';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((ponto.label || '?')[0], x, y);
        ctx.restore();
      }
    });
  }
};

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

// ─── 02 Ataque × Defesa (com bandeiras) ───────────────────────────────
async function montarGraficoDispersao(dados) {
  await preCarregarBandeiras(dados.times);

  const ctx = document.getElementById('chart-dispersao');
  const pontos = dados.times.map(t => ({
    x: parseFloat(t.ataque) || 1.35,
    y: parseFloat(t.defesa) > 0 ? (3 - parseFloat(t.defesa)) : 1.65,
    label: t.time,
    grupo: t.grupo
  }));

  if (chartDispersao) chartDispersao.destroy();
  chartDispersao = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Seleções',
        data: pontos,
        pointRadius: 0,      // ocultamos o ponto padrão — o plugin desenha a bandeira
        pointHoverRadius: 0,
        backgroundColor: 'transparent'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Poder ofensivo →', color: 'rgba(240,244,237,0.5)', font: { size: 11 } },
          ticks: { color: 'rgba(240,244,237,0.5)', font: { size: 10 } },
          grid: { color: 'rgba(240,244,237,0.06)' }
        },
        y: {
          title: { display: true, text: 'Solidez defensiva →', color: 'rgba(240,244,237,0.5)', font: { size: 11 } },
          ticks: { color: 'rgba(240,244,237,0.5)', font: { size: 10 } },
          grid: { color: 'rgba(240,244,237,0.06)' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11,61,46,0.95)',
          titleColor: '#E8B931',
          bodyColor: '#F0F4ED',
          borderColor: 'rgba(240,244,237,0.15)',
          borderWidth: 1,
          callbacks: {
            label: item => ` ${item.raw.label} (Grupo ${item.raw.grupo})`
          }
        }
      }
    },
    plugins: [pluginBandeiras]
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
function preencherFiltros(dados) {
  const nomes = dados.times.map(t => t.time);

  const selGrupo = document.getElementById('filtro-grupo');
  [...new Set(dados.times.map(t => t.grupo))].sort().forEach(g => {
    const o = document.createElement('option');
    o.value = g; o.textContent = `Grupo ${g}`;
    selGrupo.appendChild(o);
  });

  const selTimes = document.getElementById('filtro-times');
  nomes.forEach((nome, i) => {
    const o = document.createElement('option');
    o.value = nome; o.textContent = nome;
    if (i < 4) o.selected = true;
    selTimes.appendChild(o);
  });

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

  selGrupo.addEventListener('change', () => {
    const g = selGrupo.value;
    Array.from(selTimes.options).forEach(o => {
      const info = dados.times.find(t => t.time === o.value);
      o.hidden = g !== 'todos' && info && info.grupo !== g;
    });
  });

  selTimes.addEventListener('change', () => {
    const sel = Array.from(selTimes.selectedOptions).map(o => o.value);
    montarGraficoEvolucao(dadosGlobais, sel);
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

  const timesIniciais = dadosGlobais.times.slice(0, 4).map(t => t.time);
  montarGraficoEvolucao(dadosGlobais, timesIniciais);
  await montarGraficoDispersao(dadosGlobais);

  const tA = document.getElementById('time-a').value;
  const tB = document.getElementById('time-b').value;
  montarGraficoRadar(dadosGlobais, tA, tB);
  montarTabela(dadosGlobais);
}

// Iniciado pelo index.html após Chart.js carregar
iniciar();
