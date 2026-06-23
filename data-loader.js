/**
 * ===================================================================
 * data-loader.js — busca os dados do Google Apps Script
 * ===================================================================
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQG0mocmJwoi874RP5AtEdXrnzP99YbTvBNqKbBl5k1WUos5W4AIHDJYagn_iCNPtr/exec';

// Dados de exemplo usados como fallback se a busca falhar
const DADOS_EXEMPLO = {
  atualizadoEm: new Date().toISOString(),
  times: [
    { grupo: 'A', time: 'México', rating: 1515, ataque: 1.4475, defesa: 1.1475 },
    { grupo: 'A', time: 'Coreia do Sul', rating: 1515, ataque: 1.4475, defesa: 1.275 },
    { grupo: 'A', time: 'República Tcheca', rating: 1485, ataque: 1.2, defesa: 1.5 },
    { grupo: 'A', time: 'África do Sul', rating: 1485, ataque: 1.2, defesa: 1.5 },
    { grupo: 'C', time: 'Brasil', rating: 1500, ataque: 1.35, defesa: 1.35 },
    { grupo: 'C', time: 'Marrocos', rating: 1500, ataque: 1.35, defesa: 1.35 },
    { grupo: 'C', time: 'Escócia', rating: 1515, ataque: 1.4475, defesa: 1.1475 },
    { grupo: 'C', time: 'Haiti', rating: 1485, ataque: 1.2, defesa: 1.5 }
  ],
  motor: [
    { jogoNum: 1, data: '11/06/2026', timeA: 'México', timeB: 'África do Sul', golsA: 2, golsB: 0, eloA_antes: 1500, eloB_antes: 1500, eloA_depois: 1515, eloB_depois: 1485 },
    { jogoNum: 2, data: '11/06/2026', timeA: 'Coreia do Sul', timeB: 'República Tcheca', golsA: 2, golsB: 1, eloA_antes: 1500, eloB_antes: 1500, eloA_depois: 1515, eloB_depois: 1485 }
  ]
};

async function carregarDados() {
  try {
    const resp = await fetch(APPS_SCRIPT_URL);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const json = await resp.json();
    console.log('Dados carregados do Apps Script:', json.atualizadoEm);
    return json;
  } catch (e) {
    console.warn('Falha ao buscar dados do Apps Script, usando exemplo:', e);
    return DADOS_EXEMPLO;
  }
}
