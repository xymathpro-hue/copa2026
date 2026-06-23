/**
 * charts.js — Copa 2026 Dashboard v5
 * Bandeiras no scatter + bracket visual estilo torneio
 */

// ─── Paleta ───────────────────────────────────────────────────────────
const PALETA = [
  '#E8B931','#6FAE8C','#C1432A','#7CA8C9','#D98E4A',
  '#A06CC2','#5FB8B0','#D4566B','#8BAE3E','#C77DD1',
  '#E8D031','#5FAEAE'
];

// ─── Mapa ISO de bandeiras ────────────────────────────────────────────
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

// ─── Siglas ───────────────────────────────────────────────────────────
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

const COR_GRUPO = {
  'A':'#E8B931','B':'#6FAE8C','C':'#C1432A','D':'#7CA8C9',
  'E':'#D98E4A','F':'#A06CC2','G':'#5FB8B0','H':'#D4566B',
  'I':'#8BAE3E','J':'#C77DD1','K':'#E8D031','L':'#5FAEAE'
};

function flagUrl(nome) {
  const iso = FLAG_ISO[nome];
  return iso ? `https://flagcdn.com/32x24/${iso}.png` : null;
}

// ─── Estado global ────────────────────────────────────────────────────
let dadosGlobais = null;
let chartEvolucao, chartDispersao, chartRadar;
const imagensCache = {};
let timesSelecionados = [];

// ─── Pré-carregar bandeiras ───────────────────────────────────────────
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

// ─── 01 Evolução do rating ────────────────────────────────────────────
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
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      scales: {
        x: { type:'linear', title:{display:true,text:'Jogos disputados',color:'rgba(240,244,237,0.5)',font:{size:11}}, ticks:{color:'rgba(240,244,237,0.5)',stepSize:1,font:{size:10}}, grid:{color:'rgba(240,244,237,0.06)'} },
        y: { title:{display:true,text:'Rating Elo',color:'rgba(240,244,237,0.5)',font:{size:11}}, ticks:{color:'rgba(240,244,237,0.5)',font:{size:10}}, grid:{color:'rgba(240,244,237,0.06)'} }
      },
      plugins: {
        legend: { labels:{color:'#F0F4ED',font:{size:11},boxWidth:12,padding:16} },
        tooltip: { backgroundColor:'rgba(11,61,46,0.95)',titleColor:'#E8B931',bodyColor:'#F0F4ED',borderColor:'rgba(240,244,237,0.15)',borderWidth:1,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${Math.round(ctx.parsed.y)}` } }
      }
    }
  });
}

// ─── 02 Ataque × Defesa (bandeiras canvas + tooltip HTML) ─────────────
async function montarGraficoDispersao(dados) {
  await preCarregarBandeiras(dados.times);
  const canvas = document.getElementById('chart-dispersao');
  const wrap = canvas.parentElement;
  wrap.style.position = 'relative';

  let tooltipEl = document.getElementById('tt-disp');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'tt-disp';
    tooltipEl.style.cssText = 'position:absolute;pointer-events:none;display:none;z-index:99;background:rgba(11,61,46,0.97);border:1px solid rgba(232,185,49,0.5);border-radius:4px;padding:8px 12px;font-size:0.82rem;color:#F0F4ED;white-space:nowrap;';
    wrap.appendChild(tooltipEl);
  }

  const pontos = dados.times.map(t => ({
    x: parseFloat(t.ataque) || 1.35,
    y: parseFloat(t.defesa) > 0 ? (3 - parseFloat(t.defesa)) : 1.65,
    label: t.time,
    grupo: t.grupo,
    rating: Math.round(parseFloat(t.rating)) || 1500
  }));

  const pluginFlags = {
    id: 'flags',
    afterDatasetsDraw(chart) {
      const { ctx: c, scales, chartArea } = chart;
      c.save();
      c.beginPath();
      c.rect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
      c.clip();
      pontos.forEach(p => {
        const px = scales.x.getPixelForValue(p.x);
        const py = scales.y.getPixelForValue(p.y);
        const img = imagensCache[p.label];
        if (img) {
          c.drawImage(img, px-14, py-11, 28, 21);
        } else {
          c.fillStyle = COR_GRUPO[p.grupo] || '#E8B931';
          c.beginPath(); c.arc(px, py, 8, 0, Math.PI*2); c.fill();
          c.fillStyle = '#0B3D2E'; c.font = 'bold 6px sans-serif';
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(SIGLAS[p.label] || p.label.slice(0,3), px, py);
        }
      });
      c.restore();
    }
  };

  if (chartDispersao) chartDispersao.destroy();
  chartDispersao = new Chart(canvas, {
    type: 'scatter',
    data: { datasets: [{ data: pontos, pointRadius: 0, pointHoverRadius: 0, backgroundColor: 'transparent' }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      layout: { padding: { top:20, right:24, bottom:8, left:8 } },
      plugins: { legend:{display:false}, tooltip:{enabled:false} },
      scales: {
        x: { title:{display:true,text:'Poder ofensivo →',color:'rgba(240,244,237,0.5)',font:{size:11}}, ticks:{color:'rgba(240,244,237,0.7)',font:{size:10}}, grid:{color:'rgba(240,244,237,0.06)'} },
        y: { title:{display:true,text:'Solidez defensiva →',color:'rgba(240,244,237,0.5)',font:{size:11}}, ticks:{color:'rgba(240,244,237,0.7)',font:{size:10}}, grid:{color:'rgba(240,244,237,0.06)'} }
      },
      onHover: (event, el, chart) => {
        const rect = canvas.getBoundingClientRect();
        const mx = event.native.clientX - rect.left;
        const my = event.native.clientY - rect.top;
        let found = null;
        pontos.forEach(p => {
          const px = chart.scales.x.getPixelForValue(p.x);
          const py = chart.scales.y.getPixelForValue(p.y);
          if (Math.abs(mx-px) < 16 && Math.abs(my-py) < 13) found = {p,px,py};
        });
        if (found) {
          const {p,px,py} = found;
          const iso = FLAG_ISO[p.label];
          const fg = iso ? `<img src="https://flagcdn.com/20x15/${iso}.png" style="vertical-align:middle;margin-right:6px;">` : '';
          tooltipEl.innerHTML = `<div style="color:#E8B931;font-weight:600;margin-bottom:4px">${fg}${p.label}</div><div>Grupo ${p.grupo} · Rating ${p.rating}</div><div>Ataque: ${p.x.toFixed(2)} · Defesa: ${(3-p.y).toFixed(2)}</div>`;
          let left = px + 20, top = py - 20;
          if (left + 220 > wrap.offsetWidth) left = px - 230;
          if (top < 0) top = py + 10;
          tooltipEl.style.left = left+'px'; tooltipEl.style.top = top+'px'; tooltipEl.style.display = 'block';
          canvas.style.cursor = 'pointer';
        } else {
          tooltipEl.style.display = 'none'; canvas.style.cursor = 'default';
        }
      }
    },
    plugins: [pluginFlags]
  });
  canvas.addEventListener('mouseleave', () => { tooltipEl.style.display = 'none'; });
}

// ─── 03 Radar ─────────────────────────────────────────────────────────
function montarGraficoRadar(dados, nomeA, nomeB) {
  const ctx = document.getElementById('chart-radar');
  const tA = dados.times.find(t => t.time === nomeA);
  const tB = dados.times.find(t => t.time === nomeB);
  if (!tA || !tB) return;
  const norm = t => [(t.rating-1470)/1, parseFloat(t.ataque)*50, (3-parseFloat(t.defesa))*50];
  if (chartRadar) chartRadar.destroy();
  chartRadar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Rating','Ataque','Defesa'],
      datasets: [
        { label:tA.time, data:norm(tA), borderColor:'#E8B931', backgroundColor:'rgba(232,185,49,0.15)', borderWidth:2, pointRadius:3, pointBackgroundColor:'#E8B931' },
        { label:tB.time, data:norm(tB), borderColor:'#7CA8C9', backgroundColor:'rgba(124,168,201,0.15)', borderWidth:2, pointRadius:3, pointBackgroundColor:'#7CA8C9' }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      scales: { r: { ticks:{display:false}, grid:{color:'rgba(240,244,237,0.1)'}, angleLines:{color:'rgba(240,244,237,0.1)'}, pointLabels:{color:'#F0F4ED',font:{size:12}} } },
      plugins: { legend:{ labels:{color:'#F0F4ED',font:{size:11},boxWidth:12} } }
    }
  });
}

// ─── 04 Tabela ranking ────────────────────────────────────────────────
function montarTabela(dados) {
  const tbody = document.querySelector('#tabela-ranking tbody');
  const ord = [...dados.times].sort((a,b) => b.rating - a.rating);
  tbody.innerHTML = ord.map((t,i) => {
    const iso = FLAG_ISO[t.time];
    const flag = iso ? `<img src="https://flagcdn.com/20x15/${iso}.png" style="vertical-align:middle;margin-right:8px;border-radius:1px;">` : '';
    return `<tr><td style="color:rgba(240,244,237,0.4);font-size:0.8rem">${i+1}</td><td>${flag}${t.time}</td><td style="color:rgba(240,244,237,0.5)">${t.grupo}</td><td class="num mono">${Math.round(t.rating)}</td><td class="num mono">${parseFloat(t.ataque).toFixed(2)}</td><td class="num mono">${parseFloat(t.defesa).toFixed(2)}</td></tr>`;
  }).join('');
}

// ─── 05 Mata-mata ─────────────────────────────────────────────────────

const CHAVEAMENTO = [
  { id:'J1',  a:'1º Grupo A', b:'2º Grupo B', data:'28/06' },
  { id:'J2',  a:'1º Grupo C', b:'2º Grupo F', data:'29/06' },
  { id:'J3',  a:'1º Grupo E', b:'3º A/B/C/D/F', data:'29/06' },
  { id:'J4',  a:'1º Grupo F', b:'2º Grupo C', data:'29/06' },
  { id:'J5',  a:'2º Grupo E', b:'2º Grupo I', data:'30/06' },
  { id:'J6',  a:'1º Grupo I', b:'3º C/D/F/G/H', data:'30/06' },
  { id:'J7',  a:'1º Grupo A', b:'3º C/E/F/H/I', data:'01/07' },
  { id:'J8',  a:'1º Grupo L', b:'3º E/H/I/J/K', data:'01/07' },
  { id:'J9',  a:'1º Grupo G', b:'3º A/E/H/I/J', data:'01/07' },
  { id:'J10', a:'1º Grupo D', b:'3º B/E/F/I/J', data:'02/07' },
  { id:'J11', a:'1º Grupo H', b:'2º Grupo J', data:'02/07' },
  { id:'J12', a:'2º Grupo K', b:'2º Grupo L', data:'03/07' },
  { id:'J13', a:'1º Grupo B', b:'3º E/F/G/I/J', data:'03/07' },
  { id:'J14', a:'2º Grupo D', b:'2º Grupo G', data:'03/07' },
  { id:'J15', a:'1º Grupo J', b:'2º Grupo H', data:'03/07' },
  { id:'J16', a:'1º Grupo K', b:'3º D/E/I/J/L', data:'03/07' },
];

function calcProb(dados, nA, nB) {
  const tA = dados.times.find(t => t.time === nA);
  const tB = dados.times.find(t => t.time === nB);
  if (!tA || !tB) return null;
  const gA = (parseFloat(tA.ataque) + parseFloat(tB.defesa)) / 2;
  const gB = (parseFloat(tB.ataque) + parseFloat(tA.defesa)) / 2;
  const pA = 1 / (1 + Math.exp(-1.3 * (gA - gB)));
  return { pA, pB: 1-pA, gA, gB };
}

function criarCartao(jogo, dados) {
  const tA = dados.times.find(t => t.time === jogo.a);
  const tB = dados.times.find(t => t.time === jogo.b);
  const prob = tA && tB ? calcProb(dados, jogo.a, jogo.b) : null;

  const isoA = tA ? FLAG_ISO[tA.time] : null;
  const isoB = tB ? FLAG_ISO[tB.time] : null;
  const fA = isoA ? `<img src="https://flagcdn.com/20x15/${isoA}.png" style="vertical-align:middle;margin-right:5px;">` : '';
  const fB = isoB ? `<img src="https://flagcdn.com/20x15/${isoB}.png" style="vertical-align:middle;margin-right:5px;">` : '';
  const nA = tA ? `<span>${fA}${tA.time}</span>` : `<span style="color:rgba(240,244,237,0.3);font-style:italic;font-size:0.75rem">${jogo.a}</span>`;
  const nB = tB ? `<span>${fB}${tB.time}</span>` : `<span style="color:rgba(240,244,237,0.3);font-style:italic;font-size:0.75rem">${jogo.b}</span>`;

  let probBar = '';
  if (prob) {
    const pA = Math.round(prob.pA * 100);
    const pB = 100 - pA;
    const corA = tA ? (COR_GRUPO[tA.grupo] || '#E8B931') : '#E8B931';
    const corB = tB ? (COR_GRUPO[tB.grupo] || '#7CA8C9') : '#7CA8C9';
    probBar = `
      <div style="margin-top:6px;border-radius:3px;overflow:hidden;height:5px;display:flex;">
        <div style="width:${pA}%;background:${corA};"></div>
        <div style="width:${pB}%;background:${corB};"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.68rem;color:rgba(240,244,237,0.5);margin-top:3px;">
        <span>${pA}%</span><span>${jogo.data}</span><span>${pB}%</span>
      </div>`;
  } else {
    probBar = `<div style="text-align:center;font-size:0.68rem;color:rgba(240,244,237,0.3);margin-top:6px;">${jogo.data}</div>`;
  }

  const div = document.createElement('div');
  div.style.cssText = 'background:rgba(240,244,237,0.04);border:1px solid rgba(240,244,237,0.1);border-radius:5px;padding:8px 10px;margin:3px 0;font-size:0.8rem;transition:border-color 0.15s;cursor:default;';
  div.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;">${nA}<span style="color:rgba(240,244,237,0.25);font-size:0.7rem">${jogo.id}</span></div>
    <div style="display:flex;align-items:center;padding:2px 0;">${nB}</div>
    ${probBar}
  `;
  div.addEventListener('mouseenter', () => div.style.borderColor = '#E8B931');
  div.addEventListener('mouseleave', () => div.style.borderColor = 'rgba(240,244,237,0.1)');
  return div;
}

function montarBracket(dados) {
  try {
    const container = document.getElementById('bracket-container');
    if (!container) return;
    container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:0;overflow-x:auto;';

    const fases = [
      { titulo: '16-avos · 28/06–03/07', jogos: CHAVEAMENTO },
      { titulo: 'Oitavas · 04–07/07', n: 8 },
      { titulo: 'Quartas · 09–11/07', n: 4 },
      { titulo: 'Semifinal · 14–15/07', n: 2 },
      { titulo: 'Final · 19/07', n: 1 },
    ];

    fases.forEach((fase, fi) => {
      const col = document.createElement('div');
      col.style.cssText = `display:flex;flex-direction:column;padding:0 ${fi===0?'0':'8px'};min-width:180px;`;

      const titulo = document.createElement('div');
      titulo.style.cssText = 'font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:#E8B931;text-align:center;padding:10px 0 12px;font-weight:600;border-bottom:1px solid rgba(240,244,237,0.08);margin-bottom:8px;';
      titulo.textContent = fase.titulo;
      col.appendChild(titulo);

      const slotWrap = document.createElement('div');
      slotWrap.style.cssText = 'display:flex;flex-direction:column;justify-content:space-around;flex:1;';

      if (fase.jogos) {
        fase.jogos.forEach(j => slotWrap.appendChild(criarCartao(j, dados)));
      } else {
        for (let i = 0; i < fase.n; i++) {
          const card = document.createElement('div');
          card.style.cssText = 'background:rgba(240,244,237,0.02);border:1px dashed rgba(240,244,237,0.08);border-radius:5px;padding:8px 10px;margin:3px 0;';
          card.innerHTML = `
            <div style="color:rgba(240,244,237,0.2);font-size:0.75rem;font-style:italic;padding:2px 0">A definir</div>
            <div style="color:rgba(240,244,237,0.2);font-size:0.75rem;font-style:italic;padding:2px 0">A definir</div>
            <div style="margin-top:6px;height:5px;background:rgba(240,244,237,0.06);border-radius:3px;"></div>
          `;
          slotWrap.appendChild(card);
        }
      }

      col.appendChild(slotWrap);
      wrap.appendChild(col);
    });

    container.appendChild(wrap);
  } catch(e) {
    console.error('Erro no montarBracket:', e);
  }
}

// ─── Filtros com botões toggle ────────────────────────────────────────
function preencherFiltros(dados) {
  const nomes = dados.times.map(t => t.time);
  const selGrupo = document.getElementById('filtro-grupo');
  [...new Set(dados.times.map(t => t.grupo))].sort().forEach(g => {
    const o = document.createElement('option'); o.value = g; o.textContent = `Grupo ${g}`; selGrupo.appendChild(o);
  });

  const selTimes = document.getElementById('filtro-times');
  selTimes.style.display = 'none';
  const btnContainer = document.createElement('div');
  btnContainer.id = 'btn-times';
  btnContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;max-height:120px;overflow-y:auto;';
  selTimes.parentNode.insertBefore(btnContainer, selTimes.nextSibling);

  timesSelecionados = dados.times.filter(t => t.grupo === 'A').map(t => t.time);

  function renderBotoes(grupoFiltro) {
    btnContainer.innerHTML = '';
    const filtrados = grupoFiltro === 'todos' ? dados.times : dados.times.filter(t => t.grupo === grupoFiltro);
    filtrados.forEach(t => {
      const iso = FLAG_ISO[t.time];
      const fg = iso ? `<img src="https://flagcdn.com/16x12/${iso}.png" style="margin-right:4px;vertical-align:middle;">` : '';
      const btn = document.createElement('button');
      btn.innerHTML = fg + t.time;
      btn.dataset.time = t.time;
      const sel = timesSelecionados.includes(t.time);
      btn.style.cssText = `padding:4px 10px;border-radius:3px;font-size:0.78rem;cursor:pointer;transition:all 0.15s;border:1px solid ${sel?'#E8B931':'rgba(240,244,237,0.2)'};background:${sel?'rgba(232,185,49,0.2)':'rgba(11,61,46,0.6)'};color:${sel?'#E8B931':'rgba(240,244,237,0.7)'};`;
      btn.addEventListener('click', () => {
        const nome = btn.dataset.time;
        if (timesSelecionados.includes(nome)) { if (timesSelecionados.length > 1) timesSelecionados = timesSelecionados.filter(n => n !== nome); }
        else timesSelecionados.push(nome);
        renderBotoes(selGrupo.value);
        montarGraficoEvolucao(dadosGlobais, timesSelecionados);
      });
      btnContainer.appendChild(btn);
    });
  }

  renderBotoes('A');
  selGrupo.value = 'A';

  selGrupo.addEventListener('change', () => {
    const g = selGrupo.value;
    timesSelecionados = g === 'todos' ? dados.times.slice(0,4).map(t=>t.time) : dados.times.filter(t=>t.grupo===g).map(t=>t.time);
    renderBotoes(g);
    montarGraficoEvolucao(dadosGlobais, timesSelecionados);
  });

  const tA = document.getElementById('time-a');
  const tB = document.getElementById('time-b');
  nomes.forEach((nome,i) => {
    const oA = document.createElement('option'); oA.value=nome; oA.textContent=nome; if(i===0)oA.selected=true; tA.appendChild(oA);
    const oB = document.createElement('option'); oB.value=nome; oB.textContent=nome; if(i===1)oB.selected=true; tB.appendChild(oB);
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
  document.getElementById('stat-atualizado').textContent = d.toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
}

// ─── Iniciar ──────────────────────────────────────────────────────────
async function iniciar() {
  dadosGlobais = await carregarDados();
  preencherStatusBar(dadosGlobais);
  preencherFiltros(dadosGlobais);
  montarGraficoEvolucao(dadosGlobais, timesSelecionados);
  await montarGraficoDispersao(dadosGlobais);
  const tA = document.getElementById('time-a').value;
  const tB = document.getElementById('time-b').value;
  montarGraficoRadar(dadosGlobais, tA, tB);
  montarTabela(dadosGlobais);
  setTimeout(() => montarBracket(dadosGlobais), 100);
}

// Iniciado pelo index.html após Chart.js carregar
iniciar();
