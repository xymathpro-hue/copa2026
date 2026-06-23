/**
 * ===================================================================
 * charts.js — monta os 3 gráficos e a tabela a partir dos dados
 * ===================================================================
 */

const PALETA = [
  '#E8B931', '#6FAE8C', '#C1432A', '#7CA8C9', '#D98E4A',
  '#A06CC2', '#5FB8B0', '#D4566B', '#8BAE3E', '#C77DD1'
];

let dadosGlobais = null;
let chartEvolucao, chartDispersao, chartRadar;

function corPara(indice) {
  return PALETA[indice % PALETA.length];
}

/**
 * Reconstrói a série de rating ao longo dos jogos para um time específico,
 * a partir da lista de jogos do "Motor" (em ordem cronológica).
 * Sempre começa em 1500 no "jogo 0".
 */
function serieRatingPorTime(motor, nomeTime) {
  const pontos = [{ x: 0, y: 1500 }];
  let contador = 0;
  motor.forEach(jogo => {
    if (jogo.timeA === nomeTime) {
      contador++;
      pontos.push({ x: contador, y: jogo.eloA_depois });
    } else if (jogo.timeB === nomeTime) {
      contador++;
      pontos.push({ x: contador, y: jogo.eloB_depois });
    }
  });
  return pontos;
}

function montarGraficoEvolucao(dados, timesSelecionados) {
  const ctx = document.getElementById('chart-evolucao');
  const datasets = timesSelecionados.map((nome, i) => ({
    label: nome,
    data: serieRatingPorTime(dados.motor, nome),
    borderColor: corPara(i),
    backgroundColor: corPara(i),
    borderWidth: 2,
    pointRadius: 3,
    tension: 0.15
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
          title: { display: true, text: 'Jogos disputados pelo time', color: '#F0F4ED' },
          ticks: { color: 'rgba(240,244,237,0.68)', stepSize: 1 },
          grid: { color: 'rgba(240,244,237,0.08)' }
        },
        y: {
          title: { display: true, text: 'Rating', color: '#F0F4ED' },
          ticks: { color: 'rgba(240,244,237,0.68)' },
          grid: { color: 'rgba(240,244,237,0.08)' }
        }
      },
      plugins: {
        legend: { labels: { color: '#F0F4ED' } }
      }
    }
  });
}

function montarGraficoDispersao(dados) {
  const ctx = document.getElementById('chart-dispersao');
  const pontos = dados.times.map(t => ({
    x: t.ataque,
    y: 3 - t.defesa, // invertido: menor "defesa" (gols sofridos esperados) = melhor, então plotamos 3 - defesa
    label: t.time
  }));

  if (chartDispersao) chartDispersao.destroy();
  chartDispersao = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Seleções',
        data: pontos,
        backgroundColor: '#E8B931',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Poder ofensivo (ataque) →', color: '#F0F4ED' },
          ticks: { color: 'rgba(240,244,237,0.68)' },
          grid: { color: 'rgba(240,244,237,0.08)' }
        },
        y: {
          title: { display: true, text: 'Solidez defensiva →', color: '#F0F4ED' },
          ticks: { color: 'rgba(240,244,237,0.68)' },
          grid: { color: 'rgba(240,244,237,0.08)' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => item.raw.label
          }
        }
      }
    }
  });
}

function montarGraficoRadar(dados, nomeA, nomeB) {
  const ctx = document.getElementById('chart-radar');
  const timeA = dados.times.find(t => t.time === nomeA);
  const timeB = dados.times.find(t => t.time === nomeB);
  if (!timeA || !timeB) return;

  const labels = ['Rating', 'Ataque', 'Defesa'];
  const normalizar = (t) => [
    t.rating / 16, // escala aproximada para caber junto com os outros eixos
    t.ataque * 60,
    (3 - t.defesa) * 60
  ];

  if (chartRadar) chartRadar.destroy();
  chartRadar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: timeA.time,
          data: normalizar(timeA),
          borderColor: '#E8B931',
          backgroundColor: 'rgba(232,185,49,0.2)',
          pointRadius: 4
        },
        {
          label: timeB.time,
          data: normalizar(timeB),
          borderColor: '#7CA8C9',
          backgroundColor: 'rgba(124,168,201,0.2)',
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          ticks: { display: false },
          grid: { color: 'rgba(240,244,237,0.12)' },
          angleLines: { color: 'rgba(240,244,237,0.12)' },
          pointLabels: { color: '#F0F4ED', font: { size: 13 } }
        }
      },
      plugins: {
        legend: { labels: { color: '#F0F4ED' } }
      }
    }
  });
}

function montarTabela(dados) {
  const tbody = document.querySelector('#tabela-ranking tbody');
  const ordenados = [...dados.times].sort((a, b) => b.rating - a.rating);
  tbody.innerHTML = ordenados.map((t, i) => `
    <tr>
      <td class="mono">${i + 1}</td>
      <td>${t.time}</td>
      <td>${t.grupo}</td>
      <td class="num mono">${Math.round(t.rating)}</td>
      <td class="num mono">${t.ataque.toFixed(2)}</td>
      <td class="num mono">${t.defesa.toFixed(2)}</td>
    </tr>
  `).join('');
}

function preencherFiltros(dados) {
  const nomesTimes = dados.times.map(t => t.time);

  const seletorGrupo = document.getElementById('filtro-grupo');
  const grupos = [...new Set(dados.times.map(t => t.grupo))].sort();
  grupos.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = `Grupo ${g}`;
    seletorGrupo.appendChild(opt);
  });

  const seletorTimes = document.getElementById('filtro-times');
  nomesTimes.forEach((nome, i) => {
    const opt = document.createElement('option');
    opt.value = nome;
    opt.textContent = nome;
    if (i < 4) opt.selected = true; // seleciona os 4 primeiros por padrão
    seletorTimes.appendChild(opt);
  });

  const timeA = document.getElementById('time-a');
  const timeB = document.getElementById('time-b');
  nomesTimes.forEach((nome, i) => {
    const optA = document.createElement('option');
    optA.value = nome; optA.textContent = nome;
    if (i === 0) optA.selected = true;
    timeA.appendChild(optA);

    const optB = document.createElement('option');
    optB.value = nome; optB.textContent = nome;
    if (i === 1) optB.selected = true;
    timeB.appendChild(optB);
  });

  seletorGrupo.addEventListener('change', () => {
    const grupoSel = seletorGrupo.value;
    Array.from(seletorTimes.options).forEach(opt => {
      const timeInfo = dados.times.find(t => t.time === opt.value);
      opt.hidden = grupoSel !== 'todos' && timeInfo.grupo !== grupoSel;
    });
  });

  seletorTimes.addEventListener('change', () => {
    const selecionados = Array.from(seletorTimes.selectedOptions).map(o => o.value);
    montarGraficoEvolucao(dadosGlobais, selecionados);
  });

  timeA.addEventListener('change', () => montarGraficoRadar(dadosGlobais, timeA.value, timeB.value));
  timeB.addEventListener('change', () => montarGraficoRadar(dadosGlobais, timeA.value, timeB.value));
}

function preencherStatusBar(dados) {
  const totalJogos = 104;
  const disputados = new Set(dados.motor.map(m => m.jogoNum)).size;
  document.getElementById('stat-jogos').textContent = disputados;
  document.getElementById('stat-restantes').textContent = totalJogos - disputados;
  const data = new Date(dados.atualizadoEm);
  document.getElementById('stat-atualizado').textContent = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

async function iniciar() {
  dadosGlobais = await carregarDados();
  preencherStatusBar(dadosGlobais);
  preencherFiltros(dadosGlobais);

  const timesIniciais = dadosGlobais.times.slice(0, 4).map(t => t.time);
  montarGraficoEvolucao(dadosGlobais, timesIniciais);
  montarGraficoDispersao(dadosGlobais);

  const timeA = document.getElementById('time-a').value;
  const timeB = document.getElementById('time-b').value;
  montarGraficoRadar(dadosGlobais, timeA, timeB);

  montarTabela(dadosGlobais);
}

// Iniciado pelo index.html após Chart.js carregar
iniciar();
