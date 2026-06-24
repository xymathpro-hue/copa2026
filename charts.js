const PALETA=['#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6','#06b6d4','#f97316','#ec4899','#84cc16','#a855f7','#eab308','#14b8a6'];

const FLAG_ISO={'México':'mx','Coreia do Sul':'kr','República Tcheca':'cz','África do Sul':'za','Bósnia e Herzegovina':'ba','Canadá':'ca','Catar':'qa','Suíça':'ch','Escócia':'gb-sct','Brasil':'br','Marrocos':'ma','Haiti':'ht','Estados Unidos':'us','Austrália':'au','Turquia':'tr','Paraguai':'py','Alemanha':'de','Costa do Marfim':'ci','Equador':'ec','Curaçao':'cw','Suécia':'se','Holanda':'nl','Japão':'jp','Tunísia':'tn','Irã':'ir','Nova Zelândia':'nz','Bélgica':'be','Egito':'eg','Arábia Saudita':'sa','Uruguai':'uy','Cabo Verde':'cv','Espanha':'es','França':'fr','Iraque':'iq','Noruega':'no','Senegal':'sn','Argélia':'dz','Argentina':'ar','Áustria':'at','Jordânia':'jo','Colômbia':'co','Portugal':'pt','República Democrática do Congo':'cd','Uzbequistão':'uz','Croácia':'hr','Gana':'gh','Inglaterra':'gb-eng','Panamá':'pa'};

const SIGLAS={'México':'MEX','Coreia do Sul':'KOR','República Tcheca':'CZE','África do Sul':'RSA','Bósnia e Herzegovina':'BIH','Canadá':'CAN','Catar':'QAT','Suíça':'SUI','Escócia':'SCO','Brasil':'BRA','Marrocos':'MAR','Haiti':'HAI','Estados Unidos':'USA','Austrália':'AUS','Turquia':'TUR','Paraguai':'PAR','Alemanha':'GER','Costa do Marfim':'CIV','Equador':'ECU','Curaçao':'CUW','Suécia':'SWE','Holanda':'NED','Japão':'JPN','Tunísia':'TUN','Irã':'IRN','Nova Zelândia':'NZL','Bélgica':'BEL','Egito':'EGY','Arábia Saudita':'KSA','Uruguai':'URU','Cabo Verde':'CPV','Espanha':'ESP','França':'FRA','Iraque':'IRQ','Noruega':'NOR','Senegal':'SEN','Argélia':'ALG','Argentina':'ARG','Áustria':'AUT','Jordânia':'JOR','Colômbia':'COL','Portugal':'POR','República Democrática do Congo':'COD','Uzbequistão':'UZB','Croácia':'CRO','Gana':'GHA','Inglaterra':'ENG','Panamá':'PAN'};

const COR_GRUPO={'A':'#f59e0b','B':'#10b981','C':'#ef4444','D':'#3b82f6','E':'#f97316','F':'#8b5cf6','G':'#06b6d4','H':'#ec4899','I':'#84cc16','J':'#a855f7','K':'#eab308','L':'#14b8a6'};

// Mapeamento time → confederação
const CONT={'México':'CONCACAF','Coreia do Sul':'AFC','República Tcheca':'UEFA','África do Sul':'CAF','Bósnia e Herzegovina':'UEFA','Canadá':'CONCACAF','Catar':'AFC','Suíça':'UEFA','Escócia':'UEFA','Brasil':'CONMEBOL','Marrocos':'CAF','Haiti':'CONCACAF','Estados Unidos':'CONCACAF','Austrália':'AFC','Turquia':'UEFA','Paraguai':'CONMEBOL','Alemanha':'UEFA','Costa do Marfim':'CAF','Equador':'CONMEBOL','Curaçao':'CONCACAF','Suécia':'UEFA','Holanda':'UEFA','Japão':'AFC','Tunísia':'CAF','Irã':'AFC','Nova Zelândia':'OFC','Bélgica':'UEFA','Egito':'CAF','Arábia Saudita':'AFC','Uruguai':'CONMEBOL','Cabo Verde':'CAF','Espanha':'UEFA','França':'UEFA','Iraque':'AFC','Noruega':'UEFA','Senegal':'CAF','Argélia':'CAF','Argentina':'CONMEBOL','Áustria':'UEFA','Jordânia':'AFC','Colômbia':'CONMEBOL','Portugal':'UEFA','República Democrática do Congo':'CAF','Uzbequistão':'AFC','Croácia':'UEFA','Gana':'CAF','Inglaterra':'UEFA','Panamá':'CONCACAF'};

const COR_CONT={'UEFA':'#3b82f6','CONMEBOL':'#10b981','CONCACAF':'#f59e0b','AFC':'#ef4444','CAF':'#8b5cf6','OFC':'#06b6d4'};

let dados=null,chartEv,chartDisp,timesSel=[];
const imgCache={};

const CHART_OPTS={responsive:true,maintainAspectRatio:false};
const TT=()=>({backgroundColor:'#0d1117',titleColor:'#fbbf24',bodyColor:'#f3f4f6',borderColor:'rgba(255,255,255,0.1)',borderWidth:1,padding:10,cornerRadius:6});

function flagUrl(n){const i=FLAG_ISO[n];return i?`https://flagcdn.com/20x15/${i}.png`:null;}
function preloadFlags(times){return Promise.all(times.map(t=>new Promise(r=>{const u=flagUrl(t.time);if(!u||imgCache[t.time])return r();const i=new Image();i.onload=()=>{imgCache[t.time]=i;r();};i.onerror=r;i.src=u;})));}

// ── 01 Evolução ──
function serieRating(motor,nome){
  const p=[{x:0,y:1500}];let n=0;
  motor.forEach(j=>{if(j.timeA===nome){n++;p.push({x:n,y:j.eloA_depois});}else if(j.timeB===nome){n++;p.push({x:n,y:j.eloB_depois});}});
  return p;
}

function montarEvolucao(d,sel){
  const ctx=document.getElementById('chart-evolucao');
  const maxJ=Math.max(...sel.map(n=>{let c=0;d.motor.forEach(j=>{if(j.timeA===n||j.timeB===n)c++;});return c;}),3);
  const ds=sel.map((n,i)=>({label:n,data:serieRating(d.motor,n),borderColor:PALETA[i%PALETA.length],backgroundColor:PALETA[i%PALETA.length],borderWidth:2,pointRadius:4,pointHoverRadius:6,tension:0.2,fill:false}));
  if(chartEv)chartEv.destroy();
  chartEv=new Chart(ctx,{type:'line',data:{datasets:ds},options:{...CHART_OPTS,interaction:{mode:'nearest',intersect:false},scales:{
    x:{type:'linear',min:0,max:maxJ,title:{display:true,text:'Jogos disputados',color:'#9ca3af',font:{size:11}},ticks:{color:'#9ca3af',font:{size:10},stepSize:1,callback:v=>Number.isInteger(v)?v:''},grid:{color:'rgba(0,0,0,0.04)'}},
    y:{title:{display:true,text:'Rating Elo',color:'#9ca3af',font:{size:11}},ticks:{color:'#9ca3af',font:{size:10}},grid:{color:'rgba(0,0,0,0.04)'}}
  },plugins:{legend:{labels:{color:'#374151',font:{size:11},boxWidth:10,padding:14}},tooltip:{...TT(),callbacks:{label:c=>` ${c.dataset.label}: ${Math.round(c.parsed.y)}`}}}}});
}

// ── 02 Dispersão ──
async function montarDispersao(d){
  await preloadFlags(d.times);
  const canvas=document.getElementById('chart-dispersao');
  const wrap=canvas.parentElement;
  wrap.style.position='relative';
  let tt=document.getElementById('tt-d');
  if(!tt){tt=document.createElement('div');tt.id='tt-d';tt.style.cssText='position:absolute;pointer-events:none;display:none;z-index:99;background:#0d1117;border:1px solid rgba(251,191,36,.4);border-radius:6px;padding:8px 12px;font-size:12px;color:#f3f4f6;white-space:nowrap;';wrap.appendChild(tt);}
  const pts=d.times.map(t=>{
    const atq=parseFloat(t.ataque)||1.35,def=parseFloat(t.defesa)||1.35;
    const sem=(Math.abs(atq-1.35)<0.001&&Math.abs(def-1.35)<0.001);
    const jx=sem?(Math.random()-.5)*.04:0,jy=sem?(Math.random()-.5)*.04:0;
    return{x:atq+jx,y:def>0?(3-def)+jy:1.65,label:t.time,grupo:t.grupo,rating:Math.round(parseFloat(t.rating))||1500,sem};
  });
  const plugin={id:'flags',afterDatasetsDraw(chart){
    const{ctx:c,scales,chartArea}=chart;
    c.save();c.beginPath();c.rect(chartArea.left,chartArea.top,chartArea.width,chartArea.height);c.clip();
    pts.forEach(p=>{
      const px=scales.x.getPixelForValue(p.x),py=scales.y.getPixelForValue(p.y),img=imgCache[p.label];
      if(p.sem){c.globalAlpha=.3;c.fillStyle='#9ca3af';c.beginPath();c.arc(px,py,6,0,Math.PI*2);c.fill();c.globalAlpha=1;}
      else if(img){c.drawImage(img,px-11,py-8,22,17);}
      else{c.fillStyle=COR_GRUPO[p.grupo]||'#6b7280';c.beginPath();c.arc(px,py,9,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='bold 7px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(SIGLAS[p.label]||'?',px,py);}
    });
    c.restore();
  }};
  if(chartDisp)chartDisp.destroy();
  chartDisp=new Chart(canvas,{type:'scatter',data:{datasets:[{data:pts,pointRadius:0,pointHoverRadius:0,backgroundColor:'transparent'}]},options:{...CHART_OPTS,plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:{title:{display:true,text:'Poder ofensivo →',color:'#9ca3af',font:{size:11}},ticks:{color:'#9ca3af',font:{size:10}},grid:{color:'rgba(0,0,0,0.04)'}},y:{title:{display:true,text:'Solidez defensiva →',color:'#9ca3af',font:{size:11}},ticks:{color:'#9ca3af',font:{size:10}},grid:{color:'rgba(0,0,0,0.04)'}}},onHover:(ev,el,chart)=>{
    const r=canvas.getBoundingClientRect(),mx=ev.native.clientX-r.left,my=ev.native.clientY-r.top;
    let f=null;pts.forEach(p=>{const px=chart.scales.x.getPixelForValue(p.x),py=chart.scales.y.getPixelForValue(p.y);if(Math.abs(mx-px)<14&&Math.abs(my-py)<11)f={p,px,py};});
    if(f){const{p,px,py}=f;const iso=FLAG_ISO[p.label];const fg=iso?`<img src="https://flagcdn.com/16x12/${iso}.png" style="vertical-align:middle;margin-right:5px;">`:'';
      tt.innerHTML=`<div style="color:#fbbf24;font-weight:600;margin-bottom:4px">${fg}${p.label}</div><div style="color:#9ca3af">${CONT[p.label]||''} · Grupo ${p.grupo} · Rating ${p.rating}</div><div>Ataque <b>${p.x.toFixed(2)}</b> · Defesa <b>${(3-p.y).toFixed(2)}</b></div>`;
      let l=px+18,t=py-24;if(l+210>wrap.offsetWidth)l=px-220;if(t<0)t=py+10;
      tt.style.left=l+'px';tt.style.top=t+'px';tt.style.display='block';canvas.style.cursor='pointer';
    }else{tt.style.display='none';canvas.style.cursor='default';}
  }},plugins:[plugin]});
  canvas.addEventListener('mouseleave',()=>{tt.style.display='none';});
}

// ── 03 Confronto em barras ──
function calcProb(d,nA,nB){
  const tA=d.times.find(t=>t.time===nA),tB=d.times.find(t=>t.time===nB);
  if(!tA||!tB)return null;
  const gA=(parseFloat(tA.ataque)+parseFloat(tB.defesa))/2,gB=(parseFloat(tB.ataque)+parseFloat(tA.defesa))/2;
  const pA=1/(1+Math.exp(-1.3*(gA-gB)));return{pA,pB:1-pA,gA,gB};
}

function montarConfrontoBarras(d,nA,nB){
  const tA=d.times.find(t=>t.time===nA),tB=d.times.find(t=>t.time===nB);
  if(!tA||!tB)return;
  const isoA=FLAG_ISO[nA],isoB=FLAG_ISO[nB];
  document.getElementById('flag-a').src=isoA?`https://flagcdn.com/24x18/${isoA}.png`:'';
  document.getElementById('flag-b').src=isoB?`https://flagcdn.com/24x18/${isoB}.png`:'';
  document.getElementById('radar-name-a').textContent=nA;
  document.getElementById('radar-name-b').textContent=nB;
  const prob=calcProb(d,nA,nB);
  document.getElementById('radar-sub-a').textContent=prob?`${Math.round(prob.pA*100)}% vitória`:'';
  document.getElementById('radar-sub-b').textContent=prob?`${Math.round(prob.pB*100)}% vitória`:'';
  const wrap=document.getElementById('confronto-body');if(!wrap)return;
  const corA='#f59e0b',corB='#3b82f6';
  const metricas=[
    {label:'Rating Elo',vA:Math.round(tA.rating),vB:Math.round(tB.rating),max:1600,min:1400},
    {label:'Ataque',vA:parseFloat(tA.ataque).toFixed(2),vB:parseFloat(tB.ataque).toFixed(2),max:2.5,min:0.8},
    {label:'Defesa (menor=melhor)',vA:parseFloat(tA.defesa).toFixed(2),vB:parseFloat(tB.defesa).toFixed(2),max:2.0,min:0.8,inv:true},
  ];
  wrap.innerHTML=`<div style="padding:16px 20px;">
    ${metricas.map(m=>{
      const fa=parseFloat(m.vA),fb=parseFloat(m.vB);
      const range=m.max-m.min;
      const pA=Math.max(2,Math.min(98,((fa-m.min)/range)*100));
      const pB=Math.max(2,Math.min(98,((fb-m.min)/range)*100));
      const melhorA=m.inv?(fa<=fb):(fa>=fb);
      return`<div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
          <span style="font-size:13px;font-weight:${melhorA?700:400};color:${melhorA?corA:'#374151'}">${m.vA}</span>
          <span style="font-size:10.5px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em">${m.label}</span>
          <span style="font-size:13px;font-weight:${!melhorA?700:400};color:${!melhorA?corB:'#374151'}">${m.vB}</span>
        </div>
        <div style="display:flex;height:6px;border-radius:3px;overflow:hidden;background:#f3f4f6;">
          <div style="width:${pA}%;background:${corA};"></div><div style="flex:1"></div>
          <div style="width:${pB}%;background:${corB};"></div>
        </div>
      </div>`;
    }).join('')}
    ${prob?`<div style="margin-top:16px;padding:14px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;">
      <div style="font-size:10px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;text-align:center;margin-bottom:8px">Probabilidade de vitória (mata-mata)</div>
      <div style="display:flex;height:26px;border-radius:4px;overflow:hidden;">
        <div style="width:${Math.round(prob.pA*100)}%;background:${corA};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;">${Math.round(prob.pA*100)}%</div>
        <div style="flex:1;background:${corB};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;">${Math.round(prob.pB*100)}%</div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:11px;color:#9ca3af;"><span>${nA}</span><span>${nB}</span></div>
    </div>`:''}
  </div>`;
}

// ── 04 Rankings expandidos ──
function flag16(n){const i=FLAG_ISO[n];return i?`<img src="https://flagcdn.com/16x12/${i}.png" style="border-radius:1px;">`:'<span style="width:16px;display:inline-block;"></span>';}

function filtrarTimes(d){
  const g=document.getElementById('rank-grupo').value;
  const c=document.getElementById('rank-cont').value;
  return d.times.filter(t=>{
    if(g!=='todos'&&t.grupo!==g)return false;
    if(c!=='todos'&&CONT[t.time]!==c)return false;
    return true;
  });
}

function montarTabGeral(d){
  const times=filtrarTimes(d);
  const mn=Math.min(...d.times.map(t=>t.rating)),mx=Math.max(...d.times.map(t=>t.rating));
  const ord=[...times].sort((a,b)=>b.rating-a.rating);
  document.querySelector('#tbl-geral tbody').innerHTML=ord.map((t,i)=>{
    const pct=mx>mn?Math.round((t.rating-mn)/(mx-mn)*100):50;
    const cont=CONT[t.time]||'—';
    return`<tr onclick="abrirPerfil('${t.time.replace(/'/g,"\\'")}')">
      <td class="rk">${i+1}</td>
      <td><div class="tc">${flag16(t.time)} ${t.time}</div></td>
      <td><span class="gbadge">${t.grupo}</span></td>
      <td style="font-size:11px;color:#6b7280">${cont}</td>
      <td class="r">${Math.round(t.rating)}<span class="rbar"><span class="rbar-fill" style="width:${pct}%"></span></span></td>
      <td class="r">${parseFloat(t.ataque).toFixed(2)}</td>
      <td class="r">${parseFloat(t.defesa).toFixed(2)}</td>
    </tr>`;
  }).join('');
}

function montarTabOfensivo(d){
  const times=filtrarTimes(d);
  const est=d.estatisticas||{};
  const ord=[...times].sort((a,b)=>parseFloat(b.ataque)-parseFloat(a.ataque));
  document.querySelector('#tbl-ofensivo tbody').innerHTML=ord.map((t,i)=>{
    const e=est[t.time]||{};
    return`<tr onclick="abrirPerfil('${t.time.replace(/'/g,"\\'")}')">
      <td class="rk">${i+1}</td>
      <td><div class="tc">${flag16(t.time)} ${t.time}</div></td>
      <td><span class="gbadge">${t.grupo}</span></td>
      <td class="r" style="color:#f59e0b;font-weight:700">${parseFloat(t.ataque).toFixed(2)}</td>
      <td class="r">${e.golsPro!=null?e.golsPro.toFixed(1):'—'}</td>
      <td class="r">${e.chutes!=null?e.chutes.toFixed(1):'—'}</td>
      <td class="r">${e.escanteios!=null?e.escanteios.toFixed(1):'—'}</td>
    </tr>`;
  }).join('');
}

function montarTabDefensivo(d){
  const times=filtrarTimes(d);
  const est=d.estatisticas||{};
  const ord=[...times].sort((a,b)=>parseFloat(a.defesa)-parseFloat(b.defesa));
  document.querySelector('#tbl-defensivo tbody').innerHTML=ord.map((t,i)=>{
    const e=est[t.time]||{};
    return`<tr onclick="abrirPerfil('${t.time.replace(/'/g,"\\'")}')">
      <td class="rk">${i+1}</td>
      <td><div class="tc">${flag16(t.time)} ${t.time}</div></td>
      <td><span class="gbadge">${t.grupo}</span></td>
      <td class="r" style="color:#10b981;font-weight:700">${parseFloat(t.defesa).toFixed(2)}</td>
      <td class="r">${e.golsCon!=null?e.golsCon.toFixed(1):'—'}</td>
      <td class="r">${e.chutesContra!=null?e.chutesContra.toFixed(1):'—'}</td>
      <td class="r">${e.cleanSheets!=null?e.cleanSheets:'—'}</td>
    </tr>`;
  }).join('');
}

function montarTabDominio(d){
  const times=filtrarTimes(d);
  const est=d.estatisticas||{};
  const comPosse=times.filter(t=>(est[t.time]||{}).posse!=null);
  const semPosse=times.filter(t=>(est[t.time]||{}).posse==null);
  const ord=[...comPosse].sort((a,b)=>(est[b.time].posse||0)-(est[a.time].posse||0)).concat(semPosse);
  document.querySelector('#tbl-dominio tbody').innerHTML=ord.map((t,i)=>{
    const e=est[t.time]||{};
    return`<tr onclick="abrirPerfil('${t.time.replace(/'/g,"\\'")}')">
      <td class="rk">${i+1}</td>
      <td><div class="tc">${flag16(t.time)} ${t.time}</div></td>
      <td><span class="gbadge">${t.grupo}</span></td>
      <td class="r" style="color:#3b82f6;font-weight:700">${e.posse!=null?e.posse.toFixed(0)+'%':'—'}</td>
      <td class="r">${e.passes!=null?e.passes.toFixed(0):'—'}</td>
      <td class="r">${e.precisaoPasse!=null?e.precisaoPasse.toFixed(0)+'%':'—'}</td>
    </tr>`;
  }).join('');
}

function montarTabEficiencia(d){
  const times=filtrarTimes(d);
  const est=d.estatisticas||{};
  const calc=t=>{const e=est[t.time]||{};if(!e.golsPro||!e.chutes)return null;return(e.golsPro/e.chutes*100);};
  const ord=[...times].sort((a,b)=>(calc(b)||0)-(calc(a)||0));
  document.querySelector('#tbl-eficiencia tbody').innerHTML=ord.map((t,i)=>{
    const e=est[t.time]||{};const ef=calc(t);
    return`<tr onclick="abrirPerfil('${t.time.replace(/'/g,"\\'")}')">
      <td class="rk">${i+1}</td>
      <td><div class="tc">${flag16(t.time)} ${t.time}</div></td>
      <td><span class="gbadge">${t.grupo}</span></td>
      <td class="r" style="color:#8b5cf6;font-weight:700">${ef!=null?ef.toFixed(1)+'%':'—'}</td>
      <td class="r">${e.golsPro!=null?e.golsPro.toFixed(1):'—'}</td>
      <td class="r">${e.chutes!=null?e.chutes.toFixed(1):'—'}</td>
      <td class="r">${ef!=null?ef.toFixed(1)+'%':'—'}</td>
    </tr>`;
  }).join('');
}

function montarTabDisciplina(d){
  const times=filtrarTimes(d);
  const est=d.estatisticas||{};
  const ord=[...times].sort((a,b)=>((est[b.time]||{}).faltas||0)-((est[a.time]||{}).faltas||0));
  document.querySelector('#tbl-disciplina tbody').innerHTML=ord.map((t,i)=>{
    const e=est[t.time]||{};
    return`<tr onclick="abrirPerfil('${t.time.replace(/'/g,"\\'")}')">
      <td class="rk">${i+1}</td>
      <td><div class="tc">${flag16(t.time)} ${t.time}</div></td>
      <td><span class="gbadge">${t.grupo}</span></td>
      <td class="r" style="color:#ef4444;font-weight:700">${e.faltas!=null?e.faltas.toFixed(1):'—'}</td>
      <td class="r">${e.cartoesAm!=null?e.cartoesAm:'—'}</td>
      <td class="r">${e.cartoesVm!=null?e.cartoesVm:'—'}</td>
    </tr>`;
  }).join('');
}

function montarContinentes(d){
  const conts={};
  d.times.forEach(t=>{
    const c=CONT[t.time]||'Outro';
    if(!conts[c])conts[c]={total:0,peso:0,times:[]};
    const jogos=d.motor.filter(j=>j.timeA===t.time||j.timeB===t.time).length;
    const r=parseFloat(t.rating)||1500;
    conts[c].total+=r*Math.max(jogos,1);
    conts[c].peso+=Math.max(jogos,1);
    conts[c].times.push(t.time);
  });
  const lista=Object.keys(conts).map(c=>({cont:c,rating:Math.round(conts[c].total/conts[c].peso),times:conts[c].times})).sort((a,b)=>b.rating-a.rating);
  const mn=Math.min(...lista.map(x=>x.rating)),mx=Math.max(...lista.map(x=>x.rating));
  document.getElementById('cont-grid').innerHTML=lista.map(x=>{
    const pct=mx>mn?Math.round((x.rating-mn)/(mx-mn)*100):50;
    const cor=COR_CONT[x.cont]||'#6b7280';
    return`<div class="cont-card">
      <div class="cont-name">${x.cont}</div>
      <div class="cont-rating" style="color:${cor}">${x.rating}</div>
      <div class="cont-sub">${x.times.length} seleções</div>
      <div class="cont-bar" style="background:${cor};width:${pct}%;min-width:10%"></div>
    </div>`;
  }).join('');
}

function montarTodosRankings(d){
  montarTabGeral(d);
  montarTabOfensivo(d);
  montarTabDefensivo(d);
  montarTabDominio(d);
  montarTabEficiencia(d);
  montarTabDisciplina(d);
  montarContinentes(d);
}

// ── Modal perfil de time ──
function abrirPerfil(nome){
  const t=dados.times.find(x=>x.time===nome);if(!t)return;
  const iso=FLAG_ISO[nome];
  const fg=iso?`<img src="https://flagcdn.com/24x18/${iso}.png" style="border-radius:1px;">`:'';
  const jogosT=dados.motor.filter(j=>j.timeA===nome||j.timeB===nome);
  const est=(dados.estatisticas||{})[nome]||{};
  const vit=jogosT.filter(j=>(j.timeA===nome&&j.golsA>j.golsB)||(j.timeB===nome&&j.golsB>j.golsA)).length;
  const emp=jogosT.filter(j=>j.golsA===j.golsB).length;
  const der=jogosT.length-vit-emp;
  const prob=dados.times.length>1?null:null;
  document.getElementById('modal-title').innerHTML=`${fg} ${nome} <span style="font-size:12px;color:#6b7280;font-family:Inter,sans-serif;font-weight:400">· ${CONT[nome]||''} · Grupo ${t.grupo}</span>`;
  document.getElementById('modal-body').innerHTML=`
    <div class="stat-grid">
      <div class="stat-box"><div class="stat-box-v" style="color:#f59e0b">${Math.round(t.rating)}</div><div class="stat-box-l">Rating Elo</div></div>
      <div class="stat-box"><div class="stat-box-v">${parseFloat(t.ataque).toFixed(2)}</div><div class="stat-box-l">Ataque</div></div>
      <div class="stat-box"><div class="stat-box-v">${parseFloat(t.defesa).toFixed(2)}</div><div class="stat-box-l">Defesa</div></div>
      <div class="stat-box"><div class="stat-box-v">${jogosT.length}</div><div class="stat-box-l">Jogos</div></div>
      <div class="stat-box"><div class="stat-box-v" style="color:#10b981">${vit}</div><div class="stat-box-l">Vitórias</div></div>
      <div class="stat-box"><div class="stat-box-v" style="color:#ef4444">${der}</div><div class="stat-box-l">Derrotas</div></div>
      ${est.posse!=null?`<div class="stat-box"><div class="stat-box-v">${est.posse.toFixed(0)}%</div><div class="stat-box-l">Posse média</div></div>`:''}
      ${est.chutes!=null?`<div class="stat-box"><div class="stat-box-v">${est.chutes.toFixed(1)}</div><div class="stat-box-l">Chutes/jogo</div></div>`:''}
      ${est.faltas!=null?`<div class="stat-box"><div class="stat-box-v">${est.faltas.toFixed(1)}</div><div class="stat-box-l">Faltas/jogo</div></div>`:''}
    </div>
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:10px;">Histórico de jogos</div>
    ${jogosT.length===0?'<p style="color:#9ca3af;font-size:13px">Nenhum jogo disputado ainda.</p>':jogosT.map(j=>{
      const ehA=j.timeA===nome;const adv=ehA?j.timeB:j.timeA;
      const gM=ehA?j.golsA:j.golsB,gS=ehA?j.golsB:j.golsA;
      const res=gM>gS?'V':gM<gS?'D':'E';
      const cls=res==='V'?'res-v':res==='D'?'res-d':'res-e';
      const iso2=FLAG_ISO[adv];const fg2=iso2?`<img src="https://flagcdn.com/16x12/${iso2}.png" style="vertical-align:middle;margin-right:4px;">`:'';
      return`<div class="jogo-hist">
        <span class="res-badge ${cls}">${res}</span>
        <span style="flex:1">${fg2}${adv}</span>
        <span style="font-weight:700;font-variant-numeric:tabular-nums">${gM} – ${gS}</span>
        <span style="color:#9ca3af;font-size:11px;margin-left:8px">${j.data||''}</span>
      </div>`;
    }).join('')}
  `;
  document.getElementById('modal-overlay').classList.add('open');
}
window.abrirPerfil=abrirPerfil;

// ── Filtros da evolução ──
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

  // Confronto
  const sA=document.getElementById('time-a-sel'),sB=document.getElementById('time-b-sel');
  d.times.map(t=>t.time).forEach((n,i)=>{
    const oA=document.createElement('option');oA.value=n;oA.textContent=n;if(i===0)oA.selected=true;sA.appendChild(oA);
    const oB=document.createElement('option');oB.value=n;oB.textContent=n;if(i===1)oB.selected=true;sB.appendChild(oB);
  });
  sA.onchange=()=>montarConfrontoBarras(dados,sA.value,sB.value);
  sB.onchange=()=>montarConfrontoBarras(dados,sA.value,sB.value);

  // Filtros ranking
  const rg=document.getElementById('rank-grupo'),rc=document.getElementById('rank-cont');
  [...new Set(d.times.map(t=>t.grupo))].sort().forEach(g=>{const o=document.createElement('option');o.value=g;o.textContent=`Grupo ${g}`;rg.appendChild(o);});
  rg.onchange=()=>montarTodosRankings(dados);
  rc.onchange=()=>montarTodosRankings(dados);

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('on'));
      document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('on'));
      btn.classList.add('on');
      document.getElementById('tab-'+btn.dataset.tab).classList.add('on');
    };
  });
}

// ── Status ──
function preencherStatus(d){
  const n=new Set(d.motor.map(m=>m.jogoNum)).size;
  document.getElementById('stat-jogos').textContent=n;
  document.getElementById('stat-restantes').textContent=104-n;
  const dt=new Date(d.atualizadoEm);
  document.getElementById('stat-atualizado').textContent=dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
}

// ── Agregar estatísticas por time ──
function agregarEstatisticas(d){
  const est={};
  if(!d.simulacoes)return est;
  // Usar aba Estatísticas Extras se disponível no JSON
  // Por ora calcula a partir do motor (gols pró/contra)
  d.times.forEach(t=>{
    const jogos=d.motor.filter(j=>j.timeA===t.time||j.timeB===t.time);
    if(jogos.length===0){est[t.time]={};return;}
    let gP=0,gC=0;
    jogos.forEach(j=>{if(j.timeA===t.time){gP+=j.golsA||0;gC+=j.golsB||0;}else{gP+=j.golsB||0;gC+=j.golsA||0;}});
    est[t.time]={golsPro:gP/jogos.length,golsCon:gC/jogos.length,cleanSheets:jogos.filter(j=>(j.timeA===t.time&&(j.golsB||0)===0)||(j.timeB===t.time&&(j.golsA||0)===0)).length};
  });
  return est;
}

// ── Init ──
async function iniciar(){
  dados=await carregarDados();
  dados.estatisticas=agregarEstatisticas(dados);
  preencherStatus(dados);
  preencherFiltros(dados);
  montarEvolucao(dados,timesSel);
  await montarDispersao(dados);
  const sA=document.getElementById('time-a-sel'),sB=document.getElementById('time-b-sel');
  montarConfrontoBarras(dados,sA.value,sB.value);
  montarTodosRankings(dados);
}
iniciar();
