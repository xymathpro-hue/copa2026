const PALETA=['#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6','#06b6d4','#f97316','#ec4899','#84cc16','#a855f7','#eab308','#14b8a6'];
const FLAG_ISO={'México':'mx','Coreia do Sul':'kr','República Tcheca':'cz','África do Sul':'za','Bósnia e Herzegovina':'ba','Canadá':'ca','Catar':'qa','Suíça':'ch','Escócia':'gb-sct','Brasil':'br','Marrocos':'ma','Haiti':'ht','Estados Unidos':'us','Austrália':'au','Turquia':'tr','Paraguai':'py','Alemanha':'de','Costa do Marfim':'ci','Equador':'ec','Curaçao':'cw','Suécia':'se','Holanda':'nl','Japão':'jp','Tunísia':'tn','Irã':'ir','Nova Zelândia':'nz','Bélgica':'be','Egito':'eg','Arábia Saudita':'sa','Uruguai':'uy','Cabo Verde':'cv','Espanha':'es','França':'fr','Iraque':'iq','Noruega':'no','Senegal':'sn','Argélia':'dz','Argentina':'ar','Áustria':'at','Jordânia':'jo','Colômbia':'co','Portugal':'pt','República Democrática do Congo':'cd','Uzbequistão':'uz','Croácia':'hr','Gana':'gh','Inglaterra':'gb-eng','Panamá':'pa'};
const SIGLAS={'México':'MEX','Coreia do Sul':'KOR','República Tcheca':'CZE','África do Sul':'RSA','Bósnia e Herzegovina':'BIH','Canadá':'CAN','Catar':'QAT','Suíça':'SUI','Escócia':'SCO','Brasil':'BRA','Marrocos':'MAR','Haiti':'HAI','Estados Unidos':'USA','Austrália':'AUS','Turquia':'TUR','Paraguai':'PAR','Alemanha':'GER','Costa do Marfim':'CIV','Equador':'ECU','Curaçao':'CUW','Suécia':'SWE','Holanda':'NED','Japão':'JPN','Tunísia':'TUN','Irã':'IRN','Nova Zelândia':'NZL','Bélgica':'BEL','Egito':'EGY','Arábia Saudita':'KSA','Uruguai':'URU','Cabo Verde':'CPV','Espanha':'ESP','França':'FRA','Iraque':'IRQ','Noruega':'NOR','Senegal':'SEN','Argélia':'ALG','Argentina':'ARG','Áustria':'AUT','Jordânia':'JOR','Colômbia':'COL','Portugal':'POR','República Democrática do Congo':'COD','Uzbequistão':'UZB','Croácia':'CRO','Gana':'GHA','Inglaterra':'ENG','Panamá':'PAN'};
const COR_GRUPO={'A':'#f59e0b','B':'#10b981','C':'#ef4444','D':'#3b82f6','E':'#f97316','F':'#8b5cf6','G':'#06b6d4','H':'#ec4899','I':'#84cc16','J':'#a855f7','K':'#eab308','L':'#14b8a6'};

let dados=null,chartEv,chartDisp,chartRad,timesSel=[];
const imgCache={};

const CHART_OPTS={responsive:true,maintainAspectRatio:false};
const SCALE_X=(title)=>({type:'linear',title:{display:true,text:title,color:'#9ca3af',font:{size:11}},ticks:{color:'#9ca3af',font:{size:10}},grid:{color:'rgba(0,0,0,0.04)'}});
const SCALE_Y=(title)=>({title:{display:true,text:title,color:'#9ca3af',font:{size:11}},ticks:{color:'#9ca3af',font:{size:10}},grid:{color:'rgba(0,0,0,0.04)'}});
const TT=(extra={})=>Object.assign({backgroundColor:'#0d1117',titleColor:'#fbbf24',bodyColor:'#f3f4f6',borderColor:'rgba(255,255,255,0.1)',borderWidth:1,padding:10,cornerRadius:6},extra);

function flagUrl(n){const i=FLAG_ISO[n];return i?`https://flagcdn.com/20x15/${i}.png`:null;}
function preloadFlags(times){return Promise.all(times.map(t=>new Promise(r=>{const u=flagUrl(t.time);if(!u||imgCache[t.time])return r();const i=new Image();i.onload=()=>{imgCache[t.time]=i;r();};i.onerror=r;i.src=u;})));}

/* ── 01 Evolução ── */
function serieRating(motor,nome){
  const p=[{x:0,y:1500}];let n=0;
  motor.forEach(j=>{
    if(j.timeA===nome){n++;p.push({x:n,y:j.eloA_depois});}
    else if(j.timeB===nome){n++;p.push({x:n,y:j.eloB_depois});}
  });
  return p;
}

function montarEvolucao(d,sel){
  const ctx=document.getElementById('chart-evolucao');
  const ds=sel.map((n,i)=>({label:n,data:serieRating(d.motor,n),borderColor:PALETA[i%PALETA.length],backgroundColor:PALETA[i%PALETA.length],borderWidth:2,pointRadius:3,pointHoverRadius:5,tension:0.2,fill:false}));
  if(chartEv)chartEv.destroy();
  chartEv=new Chart(ctx,{type:'line',data:{datasets:ds},options:{...CHART_OPTS,interaction:{mode:'nearest',intersect:false},scales:{x:SCALE_X('Jogos disputados'),y:SCALE_Y('Rating Elo')},plugins:{legend:{labels:{color:'#374151',font:{size:11},boxWidth:10,padding:14}},tooltip:{...TT(),callbacks:{label:c=>` ${c.dataset.label}: ${Math.round(c.parsed.y)}`}}}}});
}

/* ── 02 Dispersão (bandeiras canvas) ── */
async function montarDispersao(d){
  await preloadFlags(d.times);
  const canvas=document.getElementById('chart-dispersao');
  const wrap=canvas.parentElement;
  wrap.style.position='relative';
  let tt=document.getElementById('tt-d');
  if(!tt){tt=document.createElement('div');tt.id='tt-d';tt.style.cssText='position:absolute;pointer-events:none;display:none;z-index:99;background:#0d1117;border:1px solid rgba(251,191,36,.4);border-radius:6px;padding:8px 12px;font-size:12px;color:#f3f4f6;white-space:nowrap;';wrap.appendChild(tt);}

  const pts=d.times.map(t=>({x:parseFloat(t.ataque)||1.35,y:parseFloat(t.defesa)>0?(3-parseFloat(t.defesa)):1.65,label:t.time,grupo:t.grupo,rating:Math.round(parseFloat(t.rating))||1500}));

  const plugin={id:'flags',afterDatasetsDraw(chart){
    const{ctx:c,scales,chartArea}=chart;
    c.save();c.beginPath();c.rect(chartArea.left,chartArea.top,chartArea.width,chartArea.height);c.clip();
    pts.forEach(p=>{
      const px=scales.x.getPixelForValue(p.x),py=scales.y.getPixelForValue(p.y);
      const img=imgCache[p.label];
      if(img){c.drawImage(img,px-11,py-8,22,17);}
      else{c.fillStyle=COR_GRUPO[p.grupo]||'#6b7280';c.beginPath();c.arc(px,py,8,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='bold 7px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(SIGLAS[p.label]||p.label.slice(0,3),px,py);}
    });
    c.restore();
  }};

  if(chartDisp)chartDisp.destroy();
  chartDisp=new Chart(canvas,{type:'scatter',data:{datasets:[{data:pts,pointRadius:0,pointHoverRadius:0,backgroundColor:'transparent'}]},options:{...CHART_OPTS,plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:SCALE_X('Poder ofensivo →'),y:SCALE_Y('Solidez defensiva →')},onHover:(ev,el,chart)=>{
    const r=canvas.getBoundingClientRect(),mx=ev.native.clientX-r.left,my=ev.native.clientY-r.top;
    let f=null;
    pts.forEach(p=>{const px=chart.scales.x.getPixelForValue(p.x),py=chart.scales.y.getPixelForValue(p.y);if(Math.abs(mx-px)<14&&Math.abs(my-py)<11)f={p,px,py};});
    if(f){
      const{p,px,py}=f;const iso=FLAG_ISO[p.label];const fg=iso?`<img src="https://flagcdn.com/16x12/${iso}.png" style="vertical-align:middle;margin-right:5px;">`:'';
      tt.innerHTML=`<div style="color:#fbbf24;font-weight:600;margin-bottom:4px">${fg}${p.label}</div><div style="color:#9ca3af">Grupo ${p.grupo} · Rating ${p.rating}</div><div>Ataque <b>${p.x.toFixed(2)}</b> · Defesa <b>${(3-p.y).toFixed(2)}</b></div>`;
      let l=px+18,t=py-24;if(l+200>wrap.offsetWidth)l=px-210;if(t<0)t=py+10;
      tt.style.left=l+'px';tt.style.top=t+'px';tt.style.display='block';canvas.style.cursor='pointer';
    }else{tt.style.display='none';canvas.style.cursor='default';}
  }},plugins:[plugin]});
  canvas.addEventListener('mouseleave',()=>{tt.style.display='none';});
}

/* ── 03 Radar ── */
function montarRadar(d,nA,nB){
  const ctx=document.getElementById('chart-radar');
  const tA=d.times.find(t=>t.time===nA),tB=d.times.find(t=>t.time===nB);
  if(!tA||!tB)return;
  const norm=t=>[(t.rating-1460)/1,parseFloat(t.ataque)*55,(3-parseFloat(t.defesa))*55];
  if(chartRad)chartRad.destroy();
  chartRad=new Chart(ctx,{type:'radar',data:{labels:['Rating','Ataque','Defesa'],datasets:[
    {label:tA.time,data:norm(tA),borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,.12)',borderWidth:2,pointRadius:3,pointBackgroundColor:'#f59e0b'},
    {label:tB.time,data:norm(tB),borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,.12)',borderWidth:2,pointRadius:3,pointBackgroundColor:'#3b82f6'}
  ]},options:{...CHART_OPTS,scales:{r:{ticks:{display:false},grid:{color:'rgba(0,0,0,0.08)'},angleLines:{color:'rgba(0,0,0,0.08)'},pointLabels:{color:'#374151',font:{size:12}}}},plugins:{legend:{labels:{color:'#374151',font:{size:11},boxWidth:10}}}}});
  // update match bar
  const isoA=FLAG_ISO[nA],isoB=FLAG_ISO[nB];
  document.getElementById('flag-a').src=isoA?`https://flagcdn.com/24x18/${isoA}.png`:'';
  document.getElementById('flag-b').src=isoB?`https://flagcdn.com/24x18/${isoB}.png`:'';
  document.getElementById('radar-name-a').textContent=nA;
  document.getElementById('radar-name-b').textContent=nB;
  const p=calcProb(d,nA,nB);
  document.getElementById('radar-sub-a').textContent=p?`${Math.round(p.pA*100)}% vitória`:'';
  document.getElementById('radar-sub-b').textContent=p?`${Math.round(p.pB*100)}% vitória`:'';
}

function calcProb(d,nA,nB){
  const tA=d.times.find(t=>t.time===nA),tB=d.times.find(t=>t.time===nB);
  if(!tA||!tB)return null;
  const gA=(parseFloat(tA.ataque)+parseFloat(tB.defesa))/2,gB=(parseFloat(tB.ataque)+parseFloat(tA.defesa))/2;
  const pA=1/(1+Math.exp(-1.3*(gA-gB)));
  return{pA,pB:1-pA};
}

/* ── 04 Tabela ── */
function montarTabela(d){
  const tb=document.querySelector('#tabela-ranking tbody');
  const mn=Math.min(...d.times.map(t=>t.rating)),mx=Math.max(...d.times.map(t=>t.rating));
  const ord=[...d.times].sort((a,b)=>b.rating-a.rating);
  tb.innerHTML=ord.map((t,i)=>{
    const iso=FLAG_ISO[t.time];const fg=iso?`<img src="https://flagcdn.com/20x15/${iso}.png" style="border-radius:1px;">`:'';
    const pct=mx>mn?Math.round((t.rating-mn)/(mx-mn)*100):50;
    return`<tr>
      <td class="rk">${i+1}</td>
      <td><div class="tc">${fg}${t.time}</div></td>
      <td><span class="gbadge">${t.grupo}</span></td>
      <td class="r">${Math.round(t.rating)}<span class="rbar"><span class="rbar-fill" style="width:${pct}%"></span></span></td>
      <td class="r">${parseFloat(t.ataque).toFixed(2)}</td>
      <td class="r">${parseFloat(t.defesa).toFixed(2)}</td>
    </tr>`;
  }).join('');
}

/* ── Filtros ── */
function preencherFiltros(d){
  const sg=document.getElementById('filtro-grupo');
  [...new Set(d.times.map(t=>t.grupo))].sort().forEach(g=>{const o=document.createElement('option');o.value=g;o.textContent=`Grupo ${g}`;sg.appendChild(o);});

  const bc=document.getElementById('btn-times');
  timesSel=d.times.filter(t=>t.grupo==='A').map(t=>t.time);

  function render(g){
    bc.innerHTML='';
    const ft=g==='todos'?d.times:d.times.filter(t=>t.grupo===g);
    ft.forEach(t=>{
      const iso=FLAG_ISO[t.time];const fg=iso?`<img src="https://flagcdn.com/16x12/${iso}.png">`:'';
      const btn=document.createElement('span');btn.className='chip'+(timesSel.includes(t.time)?' on':'');
      btn.innerHTML=fg+' '+t.time;btn.dataset.t=t.time;
      btn.onclick=()=>{const n=btn.dataset.t;if(timesSel.includes(n)){if(timesSel.length>1)timesSel=timesSel.filter(x=>x!==n);}else timesSel.push(n);render(sg.value);montarEvolucao(dados,timesSel);};
      bc.appendChild(btn);
    });
  }

  render('A');sg.value='A';
  sg.onchange=()=>{const g=sg.value;timesSel=g==='todos'?d.times.slice(0,4).map(t=>t.time):d.times.filter(t=>t.grupo===g).map(t=>t.time);render(g);montarEvolucao(dados,timesSel);};

  const sA=document.getElementById('time-a-sel'),sB=document.getElementById('time-b-sel');
  d.times.map(t=>t.time).forEach((n,i)=>{
    const oA=document.createElement('option');oA.value=n;oA.textContent=n;if(i===0)oA.selected=true;sA.appendChild(oA);
    const oB=document.createElement('option');oB.value=n;oB.textContent=n;if(i===1)oB.selected=true;sB.appendChild(oB);
  });
  sA.onchange=()=>montarRadar(dados,sA.value,sB.value);
  sB.onchange=()=>montarRadar(dados,sA.value,sB.value);
}

/* ── Status ── */
function preencherStatus(d){
  const n=new Set(d.motor.map(m=>m.jogoNum)).size;
  document.getElementById('stat-jogos').textContent=n;
  document.getElementById('stat-restantes').textContent=104-n;
  const dt=new Date(d.atualizadoEm);
  document.getElementById('stat-atualizado').textContent=dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
}

/* ── Init ── */
async function iniciar(){
  dados=await carregarDados();
  preencherStatus(dados);
  preencherFiltros(dados);
  montarEvolucao(dados,timesSel);
  await montarDispersao(dados);
  const sA=document.getElementById('time-a-sel'),sB=document.getElementById('time-b-sel');
  montarRadar(dados,sA.value,sB.value);
  montarTabela(dados);
}
iniciar();
