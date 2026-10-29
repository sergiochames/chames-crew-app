/* Chames Crew · telas novas do aluno. Medalhas e lobos: mesmo motor do app. */
const RA=(function(){const SEASON={id:"season",name:"Primavera 26"};
const LEVELS = [
  {name:'Recruta', treinos:0, semanas:0, when:'Início', perks:['Entrada na matilha', 'Seu primeiro lobo e a figurinha de boas-vindas']},
  {name:'Consistente', treinos:36, semanas:13, when:'Uns 3 meses', perks:['10% de desconto na renovação']},
  {name:'Atleta', treinos:72, semanas:26, when:'Uns 6 meses', perks:['10% de desconto na renovação', 'Brinde surpresa']},
  {name:'Casca Grossa', treinos:150, semanas:52, when:'Cerca de 1 ano', perks:['Kit Chames Crew: garrafa, creatina, barra de proteína e sachês de whey']},
  {name:'Elite', treinos:300, semanas:104, when:'Cerca de 2 anos', perks:['Um mês grátis', 'Kit Chames Crew completo']}
];
const PRESTIGE = { name:'Prestígio', when:'Depois da Elite', perks:['Seu nome no Hall da matilha', 'O lobo de cristal, que só quem fecha a matilha tem', 'Uma estrela nova a cada 6 meses de treino'] };
const TIERS = ['Ferro','Aço','Ouro','Rubi','Diamante'];
const W = [4,8,16,26,52];
const MEDALS = [
  {id:'tempo', how:'Faça check-in toda semana', cat:'Tempo', name:'Tempo de matilha', icons:['1M','3M','6M','1A','2A'], th:[4,13,26,52,104], unit:'semanas na matilha', val:st => weeksDone(st)},
  {id:'carga', cat:'Performance', g:'treino', name:'Evolução de carga', icon:'KG', th:W, unit:'semanas aumentando carga', test:a => a.carga === 2},
  {id:'resist', how:'Faça 2 ou mais cardios na semana', cat:'Performance', g:'treino', name:'Mais resistência', icon:'RES', th:W, unit:'semanas com 2+ cardios', test:a => a.cardio >= 2},
  {id:'limite', how:'Treine 4x ou mais na semana', cat:'Performance', g:'treino', name:'Quebrou o limite', icon:'MAX', th:[2,6,12,24,48], unit:'semanas com 4+ treinos', test:a => a.freq >= 4},
  {id:'agua', cat:'Estilo de vida', g:'nutri', name:'Água em dia', icon:'H2O', th:W, unit:'semanas com 2 L ou mais', test:a => a.agua >= 2},
  {id:'alim', how:'Siga o plano alimentar', cat:'Estilo de vida', g:'nutri', name:'Alimentação regular', icon:'ALIM', th:W, unit:'semanas seguindo o plano', test:a => a.plano_alim >= 2},
  {id:'sono', how:'Durma 7h ou mais por noite', cat:'Estilo de vida', g:'nutri', name:'Sono regulado', icon:'ZZZ', th:W, unit:'semanas dormindo 7h+', test:a => a.sono_h >= 2},
  {id:'zero', how:'Fique a semana sem fast food', cat:'Estilo de vida', g:'nutri', name:'Zero fast food', icon:'ZERO', th:[2,6,12,24,48], unit:'semanas sem fast food', test:a => a.fastfood === 0},
  {id:'destaque', how:'Liberada pela equipe por dedicação', cat:'Especiais', name:'Destaque da equipe', icon:'TOP', th:[1,2,3,5,8], unit:'destaques', val:() => 0},
  {id:'perfeita', how:'Segredo. Continua firme…', cat:'Secretas', secret:true, name:'Semana perfeita', icon:'★', th:[1,3,6,12,24], unit:'semanas perfeitas', val:st => perfectWeeks(st)}
];
const RECRUIT = {id:'recrutador', how:'Indique um amigo que vire aluno', cat:'Indicações', name:'Recrutador', icon:'+1', th:[1,3,5,10,20], unit:'amigos que viraram alunos', val:st => st.recruits || 0};
function wolfSVG(lv){
  const eye = lv >= 4 ? 'class="eyeglow" fill="#fff"' : 'fill="var(--eye)"';
  const eyes = lv === 0 ? 'M34 50L45 54L34 57Z M66 50L55 54L66 57Z' : 'M30 47L46 55L33 59Z M70 47L54 55L67 59Z';
  let p = '';
  if (lv >= 2) p += '<path class="body" fill="currentColor" d="M8 58L0 49L14 51Z M92 58L100 49L86 51Z M25 66L13 76L29 72Z M75 66L87 76L71 72Z"/>';
  if (lv >= 4) p += '<path class="body" fill="currentColor" d="M36 90L30 100L43 93Z M64 90L70 100L57 93Z M46 92L50 100L54 92Z"/>';
  p += '<path class="body" fill="currentColor" d="M14 8L36 32H64L86 8L83 44L94 58L76 66L66 92H34L24 66L6 58L17 44Z"/>';
  if (lv >= 1) p += '<path fill="var(--eye)" opacity=".55" d="M21 17L33 31L26 34Z M79 17L67 31L74 34Z"/>';
  if (lv === 2 || lv === 3) p += '<path fill="var(--eye)" d="M47 34H53L50 46Z"/>';
  if (lv >= 4) p += '<path class="eyeglow" fill="#fff" d="M50 33L55 40L50 47L45 40Z"/>';
  if (lv >= 3) p += '<path fill="var(--eye)" d="M27 43L46 50L46 46.5L29 40Z M73 43L54 50L54 46.5L71 40Z"/><path stroke="var(--eye)" stroke-width="2.6" stroke-linecap="round" d="M61 39L70 63"/>';
  p += `<path ${eye} d="${eyes}"/><path fill="var(--eye)" d="M43 73H57L50 81Z"/>`;
  if (lv >= 3) p += '<path fill="var(--eye)" d="M43 83L45.5 90L48 83Z M52 83L54.5 90L57 83Z"/>';
  if (lv >= 5) p += '<path fill="currentColor" stroke="var(--eye)" stroke-width="1.5" d="M37 29L40 15L45 23L50 9L55 23L60 15L63 29Z"/>';
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${p}</svg>`;
}
function emblem(lv, dim, size){
  return `<span class="rembw rlv${lv}${dim ? ' dim' : ''}"${size ? ` style="--s:${size}px"` : ''}><span class="remb"><span class="in">${wolfSVG(lv)}</span></span>${lv >= 1 ? '<span class="rspark"></span>' : ''}</span>`;
}
const MI = {
  agua: `<path d="M24 4C24 4 10 20 10 30a14 14 0 0 0 28 0C38 20 24 4 24 4Z" fill="currentColor"/><path d="M24 4C24 4 10 20 10 30a14 14 0 0 0 14 14Z" fill="#000" opacity=".14"/><ellipse cx="18.5" cy="29" rx="3" ry="6.5" transform="rotate(-18 18.5 29)" fill="#fff" opacity=".55"/><circle cx="29" cy="36" r="1.8" fill="#fff" opacity=".45"/>`,
  sono: `<path d="M35 5a8 8 0 1 0 8 11 7 7 0 0 1-8-11Z" fill="currentColor" opacity=".9"/><path d="M12 40h24a8 8 0 0 0 1-15.9A10.5 10.5 0 0 0 16.6 22 8.5 8.5 0 0 0 12 40Z" fill="currentColor"/><path d="M12 40h24a8 8 0 0 0 7.7-5.8C38 36 30 37 12 37a8 8 0 0 1-3.6-.9A8.4 8.4 0 0 0 12 40Z" fill="#000" opacity=".18"/><path d="M17 27a7 7 0 0 1 6-4" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".55"/>`,
  carga: `<rect x="20" y="21" width="8" height="6" rx="1" fill="currentColor" opacity=".7"/><rect x="2.5" y="18" width="5" height="12" rx="1.8" fill="currentColor"/><rect x="8" y="11" width="7" height="26" rx="2.2" fill="currentColor"/><rect x="15" y="16" width="5" height="16" rx="1.6" fill="currentColor"/><rect x="40.5" y="18" width="5" height="12" rx="1.8" fill="currentColor"/><rect x="33" y="11" width="7" height="26" rx="2.2" fill="currentColor"/><rect x="28" y="16" width="5" height="16" rx="1.6" fill="currentColor"/><path d="M9.5 13v22M34.5 13v22" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".6"/><path d="M8 33.5h7M33 33.5h7" stroke="#000" stroke-width="2" opacity=".2"/>`,
  resist: `<path d="M24 41S7 31 7 18.5A9 9 0 0 1 24 13a9 9 0 0 1 17 5.5C41 31 24 41 24 41Z" fill="currentColor"/><path d="M5 24h10l3-6 5 12 4-9 3 3h13" stroke="#000" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 15a5 5 0 0 1 5-2.5" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".6"/>`,
  limite: `<path d="M27 3 9 27h12l-3 18 21-26H27l3-16Z" fill="currentColor"/><path d="M27 3 9 27h6L27 3Z" fill="#fff" opacity=".4"/><path d="M39 19 18 45l3-18Z" fill="#000" opacity=".15"/>`,
  alim: `<path d="M24 15c-4-3.5-14-3-14 9 0 10 7 20 11 20 2 0 2-1 3-1s1 1 3 1c4 0 11-10 11-20 0-12-10-12.5-14-9Z" fill="currentColor"/><path d="M24 15c1-5 4-8 8-9-1 4-4 8-8 9Z" fill="currentColor" opacity=".75"/><path d="M24 15v-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="16" cy="24" rx="2.5" ry="5" transform="rotate(-15 16 24)" fill="#fff" opacity=".5"/>`,
  zero: `<path d="M9 21a15 11 0 0 1 30 0Z" fill="currentColor"/><rect x="7" y="23.5" width="34" height="5.5" rx="2.7" fill="currentColor" opacity=".7"/><path d="M9 31h30v2a6 6 0 0 1-6 6H15a6 6 0 0 1-6-6Z" fill="currentColor"/><circle cx="18" cy="15" r="1.1" fill="#000" opacity=".3"/><circle cx="25" cy="13" r="1.1" fill="#000" opacity=".3"/><circle cx="31" cy="16" r="1.1" fill="#000" opacity=".3"/><path d="M8 42 41 7" stroke="#e0234e" stroke-width="4.5" stroke-linecap="round"/>`,
  destaque: `<path d="M15 6h18v9a9 9 0 0 1-18 0Z" fill="currentColor"/><path d="M15 9H8a7 7 0 0 0 7 9M33 9h7a7 7 0 0 1-7 9" stroke="currentColor" stroke-width="3" fill="none"/><rect x="21.5" y="23" width="5" height="8" fill="currentColor"/><rect x="14" y="31" width="20" height="5" rx="1.5" fill="currentColor"/><rect x="11" y="37" width="26" height="6" rx="2" fill="currentColor" opacity=".8"/><path d="M19 9v6a5 5 0 0 0 3 4.5" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"/>`,
  perfeita: `<path d="m24 4 5.9 12.6 13.6 1.7-10 9.4 2.6 13.5L24 34.6 11.9 41.2l2.6-13.5-10-9.4 13.6-1.7Z" fill="currentColor"/><path d="m24 4 5.9 12.6L24 24Z" fill="#fff" opacity=".45"/><path d="M24 34.6 11.9 41.2l2.6-13.5L24 24Z" fill="#000" opacity=".15"/>`,
  recrutador: `<circle cx="17" cy="14" r="7" fill="currentColor"/><path d="M4 38a13 13 0 0 1 26 0Z" fill="currentColor"/><circle cx="32" cy="17" r="5.5" fill="currentColor" opacity=".7"/><path d="M26 38a10 10 0 0 1 16-8" fill="currentColor" opacity=".7"/><path d="M40 4v12M34 10h12" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>`,
  season: `${[0,72,144,216,288].map(r => `<ellipse cx="24" cy="13" rx="6" ry="10" transform="rotate(${r} 24 24)" fill="currentColor" opacity=".9"/>`).join('')}<circle cx="24" cy="24" r="6" fill="#e0234e"/><circle cx="22" cy="22" r="2" fill="#fff" opacity=".6"/>`
};
function medalIcon(m, tier){
  if (m.id === 'tempo') return `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13 4h22M13 44h22" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M15 6h18c0 9-6 12-7.5 18C27 30 33 33 33 42H15c0-9 6-12 7.5-18C21 18 15 15 15 6Z" fill="currentColor" opacity=".35"/><path d="M19 38h10c-1-4-4-6-5-9-1 3-4 5-5 9Z" fill="currentColor"/><path d="M19 11h10c-1 3-3 5-5 7-2-2-4-4-5-7Z" fill="currentColor"/></svg><b class="tlab">${m.icons[Math.max(0, tier)]}</b>`;
  const p = MI[m.id];
  return p ? `<svg viewBox="0 0 48 48" aria-hidden="true">${p}</svg>` : (m.icon || '');
}
function disc(m, tier, extra='', stars=0){
  const st = stars ? `<i class="stars">${'★'.repeat(stars)}</i>` : '';
  if (m === SEASON) return `<div class="rdisc ${tier >= 0 ? 'rtS' : 'lock'} ${extra}"><span class="ic">${medalIcon({ id:'season' }, 0)}</span></div>`;
  if (tier < 0) return `<div class="rdisc lock ${extra}"><span class="ic">${m.secret ? '?' : medalIcon(m, 0)}</span>${st}</div>`;
  return `<div class="rdisc rt${tier} ${extra}"><span class="ic">${medalIcon(m, tier)}</span>${st}</div>`;
}

return {emblem,disc,MEDALS,LEVELS,TIERS,wolfSVG,PRESTIGE,RECRUIT};})();
/* =====================================================================
   CHAMES CREW · telas novas do aluno (Hoje, Treino, Dieta, Check-in)
   Roda isolado num Shadow DOM, usando o banco do app (sb, ME, ST).
   ===================================================================== */
(function(){
'use strict';
const TIERS2 = ['Ferro','Aço','Ouro','Rubi','Diamante'];
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const esc2 = t => String(t ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf = n => String(Math.round(n * 10) / 10).replace('.', ',');
const firstName = n => (n || '').trim().split(' ')[0];
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random()*16|0; return (c === 'x' ? r : (r&3|8)).toString(16); }));
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
function brNow(){
  const p = new Intl.DateTimeFormat('en-GB', { timeZone:'America/Sao_Paulo', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(new Date());
  const h = +p.find(x => x.type === 'hour').value, m = +p.find(x => x.type === 'minute').value;
  return h + m / 60;
}
const WDAY = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
const MONTH = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const dayIdx = d => diffDaysIdx(weekStart(d), d);
const longDate = d => `${WDAY[dayIdx(d)]}, ${+d.slice(8)} de ${MONTH[+d.slice(5,7) - 1]}`;
const shortDate = d => `${d.slice(8)}/${d.slice(5,7)}`;
const hh = h => String(Math.floor(h)).padStart(2,'0') + ':' + (h % 1 ? String(Math.round(h % 1 * 60)).padStart(2,'0') : '00');

/* ---------- alimentos (TACO aproximada), grupos e medidas caseiras ---------- */
const TACO = Object.assign({arroz:{n:'Arroz branco cozido',k:128,p:2.5,c:28.1,g:.2},batata:{n:'Batata inglesa cozida',k:52,p:1.2,c:11.9,g:0},doce:{n:'Batata-doce cozida',k:77,p:.6,c:18.4,g:.1},
  macarrao:{n:'Macarrão cozido',k:102,p:3.4,c:19.9,g:1.2},frango:{n:'Peito de frango grelhado',k:159,p:32,c:0,g:2.5},patinho:{n:'Patinho grelhado',k:219,p:35.9,c:0,g:7.3},
  tilapia:{n:'Tilápia grelhada',k:128,p:26,c:0,g:2.7},pao:{n:'Pão integral',k:253,p:9.4,c:49.9,g:3.7},cuscuz:{n:'Cuscuz de milho cozido',k:113,p:2.2,c:25.3,g:.7},
  tapioca:{n:'Tapioca (goma pronta)',k:240,p:0,c:60,g:0},ovo:{n:'Ovo inteiro cozido',k:146,p:13.3,c:.6,g:9.5},requeijao:{n:'Requeijão cremoso',k:257,p:9.6,c:2.4,g:23.4},
  banana:{n:'Banana prata',k:98,p:1.3,c:26,g:.1},mamao:{n:'Mamão papaia',k:40,p:.5,c:10.4,g:.1},aveia:{n:'Aveia em flocos',k:394,p:13.9,c:66.6,g:8.5},iogurte:{n:'Iogurte natural',k:51,p:4.1,c:1.9,g:3}},{
 arroz_int:{n:'Arroz integral cozido',k:124,p:2.6,c:25.8,g:1},mandioca:{n:'Mandioca cozida',k:125,p:.6,c:30.1,g:.3},inhame:{n:'Inhame cozido',k:97,p:2.1,c:23.2,g:.1},
 mandioquinha:{n:'Mandioquinha cozida',k:80,p:.9,c:18.9,g:.2},paofr:{n:'Pão francês',k:300,p:8,c:58.6,g:3.1},milho:{n:'Milho verde cozido',k:98,p:3.2,c:17.1,g:2.4},
 quinoa:{n:'Quinoa cozida',k:120,p:4.4,c:21.3,g:1.9},granola:{n:'Granola',k:420,p:9.5,c:67,g:12.5},torrada:{n:'Torrada integral',k:380,p:12,c:70,g:5},
 biscarroz:{n:'Biscoito de arroz',k:381,p:8,c:81,g:3},wrap:{n:'Wrap integral (rap)',k:300,p:9,c:50,g:7},
 nanica:{n:'Banana nanica',k:92,p:1.4,c:23.8,g:.1},maca:{n:'Maçã',k:56,p:.3,c:15.2,g:0},kiwi:{n:'Kiwi',k:51,p:1.3,c:11.5,g:.6},morango:{n:'Morango',k:30,p:.9,c:6.8,g:.3},
 uva:{n:'Uva',k:53,p:.7,c:13.6,g:.2},pera:{n:'Pera',k:53,p:.6,c:14,g:.1},manga:{n:'Manga',k:72,p:.4,c:19.4,g:.2},formosa:{n:'Mamão formosa',k:45,p:.8,c:11.6,g:.1},
 abacaxi:{n:'Abacaxi',k:48,p:.9,c:12.3,g:.1},melancia:{n:'Melancia',k:33,p:.9,c:8.1,g:0},melao:{n:'Melão',k:29,p:.7,c:7.5,g:0},laranja:{n:'Laranja',k:37,p:1,c:8.9,g:.1},
 tangerina:{n:'Tangerina',k:38,p:.8,c:9.6,g:.1},goiaba:{n:'Goiaba',k:54,p:1.1,c:13,g:.4},maracuja:{n:'Maracujá',k:68,p:2,c:12.3,g:2.1},ameixa:{n:'Ameixa',k:53,p:.8,c:13.9,g:0},
 caqui:{n:'Caqui',k:71,p:.4,c:19.3,g:.1},acai:{n:'Açaí (polpa sem açúcar)',k:58,p:.8,c:6.2,g:3.9},
 fcarioca:{n:'Feijão carioca cozido',k:76,p:4.8,c:13.6,g:.5},fpreto:{n:'Feijão preto cozido',k:77,p:4.5,c:14,g:.5},grao:{n:'Grão-de-bico cozido',k:164,p:8.9,c:27.4,g:2.6},
 lentilha:{n:'Lentilha cozida',k:93,p:6.3,c:16.3,g:.5},ervilha:{n:'Ervilha cozida',k:74,p:4.6,c:13.4,g:.4},
 coxa:{n:'Coxa de frango sem pele',k:167,p:26.9,c:0,g:5.8},acem:{n:'Carne moída (acém)',k:212,p:26.7,c:0,g:10.9},alcatra:{n:'Alcatra grelhada',k:241,p:31.9,c:0,g:11.6},
 mignon:{n:'Filé mignon grelhado',k:220,p:32.8,c:0,g:8.8},maminha:{n:'Maminha grelhada',k:153,p:30.7,c:0,g:2.4},lombo:{n:'Lombo suíno assado',k:210,p:35.7,c:0,g:6.4},
 salmao:{n:'Salmão grelhado',k:229,p:23.9,c:0,g:14},merluza:{n:'Merluza assada',k:122,p:26.6,c:0,g:.9},atum:{n:'Atum em água (lata)',k:116,p:25.5,c:0,g:.8},
 sardinha:{n:'Sardinha assada',k:164,p:32.2,c:0,g:3},camarao:{n:'Camarão cozido',k:90,p:19,c:0,g:1},
 clara:{n:'Clara de ovo cozida',k:59,p:13.4,c:0,g:.1},
 mussarela:{n:'Queijo mussarela',k:330,p:22.6,c:3,g:25.2},minas:{n:'Queijo minas frescal',k:264,p:17.4,c:3.2,g:20.2},cottage:{n:'Queijo cottage',k:98,p:11.1,c:3.4,g:4.3},
 ricota:{n:'Ricota',k:140,p:12.6,c:3.8,g:8.1},prato:{n:'Queijo prato',k:360,p:22.7,c:1.9,g:29.1},parmesao:{n:'Queijo parmesão',k:453,p:35.6,c:1.7,g:33.5},
 iogdesn:{n:'Iogurte desnatado',k:41,p:3.8,c:5.8,g:.3},leited:{n:'Leite desnatado',k:35,p:3.4,c:4.9,g:0},leitei:{n:'Leite integral',k:61,p:2.9,c:4.3,g:3.2},
 azeite:{n:'Azeite de oliva',k:884,p:0,c:0,g:100},pamendoim:{n:'Pasta de amendoim',k:588,p:25.1,c:20,g:50},castpara:{n:'Castanha-do-pará',k:643,p:14.5,c:15.1,g:63.5},
 caju:{n:'Castanha de caju',k:570,p:18.5,c:29.1,g:46.3},amendoa:{n:'Amêndoa',k:581,p:18.6,c:29.5,g:47.3},nozes:{n:'Nozes',k:620,p:14,c:18.4,g:59.4},abacate:{n:'Abacate',k:96,p:1.2,c:6,g:8.4}});
const HM = {arroz:['colher de sopa','colheres de sopa',25],arroz_int:['colher de sopa','colheres de sopa',25],macarrao:['colher de sopa','colheres de sopa',25],
 batata:['unidade média','unidades médias',140],doce:['unidade média','unidades médias',150],mandioca:['pedaço médio','pedaços médios',100],inhame:['pedaço médio','pedaços médios',80],
 mandioquinha:['unidade média','unidades médias',70],cuscuz:['fatia média','fatias médias',70],tapioca:['colher de sopa','colheres de sopa',15],pao:['fatia','fatias',25],paofr:['unidade','unidades',50],
 aveia:['colher de sopa','colheres de sopa',15],granola:['colher de sopa','colheres de sopa',10],torrada:['unidade','unidades',10],biscarroz:['unidade','unidades',9],wrap:['unidade','unidades',40],milho:['colher de sopa','colheres de sopa',24],quinoa:['colher de sopa','colheres de sopa',20],
 banana:['unidade média','unidades médias',90],nanica:['unidade média','unidades médias',110],maca:['unidade média','unidades médias',130],kiwi:['unidade','unidades',75],morango:['unidade','unidades',12],
 uva:['uva','uvas',8],pera:['unidade média','unidades médias',130],manga:['fatia','fatias',80],mamao:['meia unidade','meias unidades',155],formosa:['fatia','fatias',170],abacaxi:['fatia','fatias',75],
 melancia:['fatia','fatias',200],melao:['fatia','fatias',115],laranja:['unidade','unidades',140],tangerina:['unidade','unidades',135],goiaba:['unidade','unidades',170],maracuja:['unidade','unidades',90],
 ameixa:['unidade','unidades',70],caqui:['unidade','unidades',110],acai:['pacote de polpa','pacotes de polpa',100],
 fcarioca:['concha média','conchas médias',90],fpreto:['concha média','conchas médias',90],grao:['colher de sopa','colheres de sopa',22],lentilha:['concha média','conchas médias',90],ervilha:['colher de sopa','colheres de sopa',20],
 frango:['filé médio','filés médios',100],coxa:['unidade','unidades',90],patinho:['bife médio','bifes médios',100],acem:['colher de sopa','colheres de sopa',25],alcatra:['bife médio','bifes médios',100],
 mignon:['medalhão','medalhões',80],maminha:['fatia','fatias',100],lombo:['fatia','fatias',100],tilapia:['filé','filés',120],salmao:['posta','postas',120],merluza:['filé','filés',100],
 atum:['lata','latas',120],sardinha:['unidade','unidades',40],camarao:['unidade grande','unidades grandes',15],ovo:['unidade','unidades',50],clara:['clara','claras',33],
 mussarela:['fatia','fatias',15],minas:['fatia','fatias',30],cottage:['colher de sopa','colheres de sopa',30],ricota:['fatia','fatias',30],prato:['fatia','fatias',15],parmesao:['colher de sopa','colheres de sopa',10],
 requeijao:['colher de sopa','colheres de sopa',15],iogurte:['pote','potes',170],iogdesn:['pote','potes',170],leited:['copo','copos',200],leitei:['copo','copos',200],
 azeite:['colher de sopa','colheres de sopa',13],pamendoim:['colher de sopa','colheres de sopa',15],castpara:['unidade','unidades',4],caju:['unidade','unidades',3],amendoa:['unidade','unidades',1.2],nozes:['unidade','unidades',5],abacate:['colher de sopa','colheres de sopa',40]};
const FG = {carb:['arroz','arroz_int','macarrao','batata','doce','mandioca','inhame','mandioquinha','milho','quinoa'],
 cafe:['pao','paofr','torrada','wrap','tapioca','cuscuz','aveia','granola','biscarroz'],
 fruta:['banana','nanica','maca','kiwi','morango','uva','pera','manga','mamao','formosa','abacaxi','melancia','melao','laranja','tangerina','goiaba','maracuja','ameixa','caqui','acai'],
 leg:['fcarioca','fpreto','grao','lentilha','ervilha'],
 prot:['frango','coxa','patinho','acem','alcatra','mignon','maminha','lombo','tilapia','salmao','merluza','atum','sardinha','camarao'],
 ovo:['ovo','clara'],queijo:['mussarela','minas','cottage','ricota','prato','parmesao','requeijao'],lat:['iogurte','iogdesn','leited','leitei'],
 gord:['azeite','pamendoim','castpara','caju','amendoa','nozes','abacate']};
const FGN = {carb:'Carboidratos do almoço e jantar',cafe:'Carboidratos do café e lanche',fruta:'Frutas',leg:'Leguminosas',prot:'Carnes e peixes',ovo:'Ovos',queijo:'Queijos',lat:'Leite e iogurte',gord:'Gorduras boas'};
const FGM = {carb:'c',cafe:'c',fruta:'c',leg:'c',prot:'p',ovo:'p',queijo:'p',lat:'p',gord:'g'};
const grOf = f => Object.keys(FG).find(k => FG[k].includes(f));
function eqMix(base, g, alt){ const a = TACO[base], b = TACO[alt], m = FGM[grOf(base)]; const rk = a.k/b.k, rm = m && b[m] > 0 ? a[m]/b[m] : rk; return Math.max(5, Math.round(g*(rk+rm)/2/5)*5); }
const subsOf = f => { const gr = grOf(f); return gr ? FG[gr].filter(x => x !== f) : []; };
function hmN(f, g){ const u = HM[f]; if (!u || !g) return null; const n = Math.round(g/u[2]*2)/2; return n < .5 ? null : { n, t: nf(n) + ' ' + (n > 1 ? u[1] : u[0]) }; }
const hmTxt = (f, g) => { const h = hmN(f, g); return h ? ' ≈ ' + h.t : ''; };
const mac = (f, g) => { const t = TACO[f] || {k:0,p:0,c:0,g:0}; return { k:t.k*g/100, p:t.p*g/100, c:t.c*g/100, g:t.g*g/100 }; };
const fname = f => (TACO[f] || { n:f }).n;

const EXDB={Inferiores:{'Quadríceps':['Agachamento livre','Agachamento no smith','Agachamento frontal','Agachamento goblet','Agachamento búlgaro','Hack machine','Leg press 45°','Leg press horizontal','Cadeira extensora','Afundo','Passada','Sissy squat'],
  'Glúteo':['Elevação pélvica','Elevação pélvica na máquina','Ponte de glúteo','Glúteo na polia (coice)','Glúteo 4 apoios','Cadeira abdutora','Abdução na polia','Agachamento sumô','Subida no banco (step-up)'],
  'Posterior':['Mesa flexora','Cadeira flexora','Flexora em pé','Stiff com barra','Stiff com halteres','Levantamento terra','Terra romeno','Good morning'],
  'Panturrilha':['Panturrilha em pé','Panturrilha sentado','Panturrilha no leg press'],'Adutores':['Cadeira adutora','Adução na polia']},
 Superiores:{'Peito':['Supino reto','Supino reto com halteres','Supino inclinado com barra','Supino inclinado com halteres','Supino declinado','Supino na máquina','Crucifixo com halteres','Crucifixo inclinado','Crossover','Voador (peck deck)','Flexão de braço'],
  'Costas':['Puxada na frente','Puxada supinada','Puxada triângulo','Barra fixa','Remada curvada','Remada curvada supinada','Remada unilateral (serrote)','Remada baixa','Remada cavalinho','Remada na máquina','Pulldown','Pullover'],
  'Ombro':['Desenvolvimento','Desenvolvimento com barra','Desenvolvimento na máquina','Desenvolvimento Arnold','Elevação lateral','Elevação lateral na polia','Elevação frontal','Crucifixo inverso','Face pull','Encolhimento (trapézio)'],
  'Bíceps':['Rosca direta','Rosca direta barra W','Rosca alternada','Rosca martelo','Rosca martelo na corda','Rosca concentrada','Rosca Scott','Rosca na polia','Rosca inclinada','Rosca 21'],
  'Tríceps':['Tríceps na polia','Tríceps corda','Tríceps francês','Tríceps testa','Tríceps coice','Tríceps no banco','Supino fechado','Tríceps unilateral na polia'],
  'Antebraço':['Rosca punho','Rosca inversa']},
 Core:{'Abdômen':['Prancha','Prancha lateral','Abdominal supra','Abdominal infra','Abdominal na polia','Abdominal bicicleta','Elevação de pernas','Roda abdominal','Dead bug'],'Lombar':['Extensão lombar (banco romano)','Superman','Bird dog']},
 Cardio:{'Cardio':['Esteira','Bicicleta','Elíptico','Escada','Remo ergômetro','Pular corda','Burpee','HIIT']}};
const EXFLAT=[];for(const r in EXDB)for(const m in EXDB[r])EXDB[r][m].forEach(n=>{if(!EXFLAT.find(x=>x.n===n))EXFLAT.push({n,r,m})});
const NRM=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
window.__ccSubs=n=>{const e=EXFLAT.find(x=>NRM(x.n)===NRM(n));return e?EXFLAT.filter(x=>x.m===e.m&&x.n!==e.n).slice(0,4).map(x=>x.n):['Variação com halteres','Variação na máquina']};
/* ---------- métodos de treino ---------- */
const MET = {
 drop:{n:'Drop-set',how:'Na última série, ao falhar, tire 20–30% da carga e continue sem descanso. 2 quedas.'},
 rest:{n:'Rest-pause',how:'Ao falhar, descanse 15 s e faça mais repetições. Repita 2 vezes.'},
 cluster:{n:'Cluster',how:'Divida a série em blocos de 3 reps com 20 s de pausa entre eles.'},
 pirc:{n:'Pirâmide crescente',how:'Aumente a carga e diminua as reps a cada série.'},
 pird:{n:'Pirâmide decrescente',how:'Comece pesado e tire carga a cada série, aumentando as reps.'},
 fst7:{n:'FST-7',how:'7 séries de 8–12 reps com 30–45 s de descanso, para fechar o músculo.'},
 gvt:{n:'GVT 10×10',how:'10 séries de 10 reps com 60–90 s de descanso, carga em torno de 60%.'},
 neg:{n:'Negativa',how:'Desça em 3 a 5 segundos, controlando a fase excêntrica.'},
 iso:{n:'Isometria',how:'Segure 3 segundos no ponto de maior contração em cada repetição.'},
 myo:{n:'Myo-reps',how:'Uma série até perto da falha, depois mini-séries de 3–5 reps com 5 respirações de pausa.'},
 s21:{n:'Série 21',how:'7 reps na metade de baixo, 7 na de cima e 7 completas.'}
};
function linkGroups(ex){ const G = []; let i = 0, L = 0; while (i < ex.length){ const k = ex[i].link; if (k){ let j = i; while (j+1 < ex.length && ex[j+1].link === k) j++; const len = j-i+1;
  if (len > 1){ const n = len === 2 ? 'Bi-set' : len === 3 ? 'Tri-set' : 'Série gigante'; for (let p = 0; p < len; p++) G[i+p] = { lab:String.fromCharCode(65+L)+(p+1), pos:p, len, n }; L++; i = j+1; continue; } } i++; } return G; }

/* ---------- check-in do dia ---------- */
const QD = [['Treinou hoje?',['Sim','Não','Dia de descanso']],['Como foi o treino?',['Leve','Moderado','Pesado','No limite']],['Como está sua energia?',['Baixa','Ok','Alta']],
  ['Fez cardio hoje?',['Não','Até 20 min','Mais de 20 min']],['Comeu fast food ou fez refeição livre?',['Não','Refeição livre','Fast food']],['Comeu doce fora do plano?',['Não','Um pouco','Sim']],
  ['Bateu sua meta de água hoje?',['Não','Quase','Bati a meta']],['Quantas horas dormiu?',['Menos de 6h','6 a 7h','7h ou mais']]];
const waterL = () => { const kg = +ME.weight_kg || 0; return kg ? Math.min(4, Math.max(2, Math.round(kg*35/250)*.25)) : 2; };

/* ---------- estado ---------- */
let host = null, root = null, mounted = false;
const S = { tab:'hoje', letter:null, ci:'dia', ans:[], openSw:null, swaps:{} };
const D = { workouts:[], logs:[], diet:null, meals:[], daily:[], closes:[], loaded:false };
const uidKey = k => `cc2-${k}-${ME && ME.id}`;
const hasTreino = () => ST && ST.plan !== 'nutri';
const hasDieta = () => ST && ST.plan !== 'treino';

/* ---------- fila sem internet ---------- */
let Q2 = [];
function qLoad(){ Q2 = lsGet(uidKey('fila'), []); }
function qSave(){ lsSet(uidKey('fila'), Q2); }
function qAdd(op){ if (op.merge) Q2 = Q2.filter(x => !(x.merge && x.t === op.t && x.id === op.id)); Q2.push(op); qSave(); flush(); }
let flushing = false;
async function flush(){
  if (flushing || !Q2.length || !sb) return; flushing = true;
  try {
    while (Q2.length){
      const op = Q2[0];
      const r = op.kind === 'update' ? await sb.from(op.t).update(op.row).eq('id', op.id) : op.kind === 'upsert' ? await sb.from(op.t).upsert(op.row, { onConflict:op.oc, ignoreDuplicates:!!op.ign }) : await sb.from(op.t).insert(op.row);
      if (r.error){
        const msg = (r.error.message || '') + ' ' + (r.error.code || '');
        if (/fetch|network|load failed|timeout|offline/i.test(msg)) break;   // sem internet: tenta depois
        if (!/duplicate|23505/i.test(msg)) console.warn('Não salvou', op.t, r.error);
      }
      Q2.shift(); qSave();
    }
  } catch(e){ /* sem internet */ }
  flushing = false; renderPending();
}
window.addEventListener('online', () => flush());
setInterval(() => flush(), 20000);

/* ---------- dados ---------- */
async function load(){
  const cache = lsGet(uidKey('dados'), null);
  if (cache && !D.loaded) Object.assign(D, cache, { loaded:true });
  try {
    const uid = ME.id, since = addDays(TODAY(), -84);
    const [w, l, dt, ml, dc, wc] = await Promise.all([
      sb.from('workouts').select('*').eq('user_id', uid).order('position'),
      sb.from('workout_logs').select('*').eq('user_id', uid).gte('day', since).order('day'),
      sb.from('diets').select('*').eq('user_id', uid).maybeSingle(),
      sb.from('meal_logs').select('*').eq('user_id', uid).gte('day', addDays(TODAY(), -84)),
      sb.from('daily_checkins').select('*').eq('user_id', uid).gte('day', since),
      sb.from('week_closes').select('*').eq('user_id', uid).order('week_start')
    ]);
    if (w.error && l.error && dc.error) throw w.error;
    D.workouts = w.data || []; D.logs = l.data || []; D.diet = dt.data || null; D.meals = ml.data || []; D.daily = dc.data || []; D.closes = wc.data || [];
    D.loaded = true;
    lsSet(uidKey('dados'), { workouts:D.workouts, logs:D.logs, diet:D.diet, meals:D.meals, daily:D.daily, closes:D.closes });
  } catch(e){ D.loaded = true; }
  // junta o que ainda está na fila (feito sem internet)
  Q2.forEach(op => {
    if (op.t === 'workout_logs' && !D.logs.some(x => x.id === op.row.id)) D.logs.push(op.row);
    if (op.t === 'daily_checkins' && !D.daily.some(x => x.day === op.row.day)) D.daily.push(op.row);
    if (op.t === 'meal_logs' && !D.meals.some(x => x.day === op.row.day && x.meal_idx === op.row.meal_idx)) D.meals.push(op.row);
    if (op.t === 'week_closes' && !D.closes.some(x => x.week_start === op.row.week_start)) D.closes.push(op.row);
  });
}
function saveCache(){ lsSet(uidKey('dados'), { workouts:D.workouts, logs:D.logs, diet:D.diet, meals:D.meals, daily:D.daily, closes:D.closes }); }

/* ---------- regras da semana (para o resumo ao vivo) ---------- */
function logPct(lg){ const sets = lg.sets || []; let tot = 0, ok = 0; sets.forEach(e => { const n = (e.sets || []).length, d = (e.sets || []).filter(x => x[2]).length; tot += n; ok += d; const sk = (lg.skipped || []).find(k => k.uid === e.uid); if (sk && sk.reason === 'dor') ok += n - d; }); return tot ? Math.round(ok / tot * 100) : 0; }
const trainDays = (from, to) => { const s = new Set(); D.logs.forEach(x => { if (x.day >= from && x.day <= to && x.finished_at && logPct(x) >= 75) s.add(x.day); }); (ST.trainingsList || []).forEach(t => { if (t.day >= from && t.day <= to) s.add(t.day); }); return s.size; };
const dailyIn = (from, to) => D.daily.filter(x => x.day >= from && x.day <= to);
const mealsOk = d => { const n = ((D.diet && D.diet.meals) || []).length; return n > 0 && D.meals.filter(x => x.day === d).length >= n; };
function weekStats(ws){
  const we = addDays(ws, 6), dl = dailyIn(ws, we), A = i => dl.filter(x => (x.answers || [])[i]);
  const cnt = f => dl.filter(f).length;
  let alim = 0; for (let i = 0; i < 7; i++) if (mealsOk(addDays(ws, i))) alim++;
  return {
    limite:{ d:trainDays(ws, we), t:ME.freq || 3 }, resist:{ d:cnt(x => (x.answers||[])[3] > 0), t:ME.cardio ?? 2 }, ci:{ d:dl.length, t:6 },
    alim:{ d:alim, t:6 }, agua:{ d:cnt(x => (x.answers||[])[6] === 2), t:6 }, sono:{ d:cnt(x => (x.answers||[])[7] === 2), t:6 },
    zero:{ d:cnt(x => (x.answers||[])[4] === 0), t:6 }, doce:{ d:cnt(x => (x.answers||[])[5] === 0), t:5 }, A
  };
}
const sentToday = () => D.daily.some(x => x.day === TODAY());

/* ---------- treino: ficha do dia, anterior, sugestão ---------- */
const lettersOf = () => D.workouts.map(w => w.letter);
function nextLetter(){
  const L = lettersOf(); if (!L.length) return null;
  const today = D.logs.filter(x => x.day === TODAY() && x.finished_at).slice(-1)[0];
  if (today) return today.letter;
  const last = [...D.logs].filter(x => x.finished_at).sort((a,b) => (a.finished_at > b.finished_at ? 1 : -1)).slice(-1)[0];
  if (!last) return L[0];
  const i = L.indexOf(last.letter); return L[(i + 1) % L.length] || L[0];
}
const wOf = letter => D.workouts.find(w => w.letter === letter);
function prevOf(letter, ex){
  const logs = D.logs.filter(x => x.letter === letter && x.finished_at && x.day < TODAY()).sort((a,b) => a.day < b.day ? 1 : -1);
  for (const lg of logs){ const e = (lg.sets || []).find(s => s.uid === ex.uid) || (lg.sets || []).find(s => s.name === ex.name); if (e && e.sets && e.sets.some(s => s[2])) return e.sets.filter(s => s[2]).map(s => [s[0], s[1]]); }
  return null;
}
const INC = { barra:2, halter:1, maquina:5, polia:2.5 };
function targetsOf(ex){ const n = ex.sets || (ex.tg ? ex.tg.length : 3); return Array.from({ length:n }, (_, s) => ex.tg && ex.tg[s] ? ex.tg[s] : [ex.kg || 0, ex.reps || 10]); }
function suggestion(ex, prev){
  if (!prev || !prev.length || ex.tg) return null;
  const minExcess = Math.min(...prev.map(p => p[1] - (ex.reps || 10)));
  if (minExcess < 1 || !prev[0][0]) return null;
  const pct = minExcess >= 3 ? .10 : .05, inc = INC[ex.eq] || 2, base = prev[0][0];
  let kg = Math.round(base * (1 + pct) / inc) * inc; if (kg <= base) kg = base + inc;
  return { kg, pct:Math.round(pct*100), excess:minExcess };
}
// treino em andamento fica salvo no aparelho (não perde se fechar o app ou ficar sem internet)
const trKey = () => uidKey('treino-' + TODAY());
const getRun = () => lsGet(trKey(), null);
const setRun = r => lsSet(trKey(), r);

/* ---------- utilidades de tela ---------- */
const $r = s => root.querySelector(s);
const $$r = s => [...root.querySelectorAll(s)];
function sheet2(html, onMount){
  const s = document.createElement('div'); s.className = 'scrim';
  s.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}<button class="btn wide" style="margin-top:14px" data-close>Fechar</button></div>`;
  s.addEventListener('click', e => { if (e.target === s || e.target.closest('[data-close]')) s.remove(); });
  root.appendChild(s); onMount && onMount(s); return s;
}
function toast2(msg){ const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; root.appendChild(t); setTimeout(() => t.remove(), 2600); }
const WA_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 9.5c.3 1.6 1.9 3.6 3.9 4.6l1.3-1.1 2 .9-.4 1.6c-3 .3-7.4-3.6-7.6-6.6l1.5-.6.9 2z" fill="currentColor" stroke="none"/></svg>';
const LI = {
 treino:'<path d="M6.5 8v8M17.5 8v8M4 10v4M20 10v4M6.5 12h11"/>', cardio:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/><path d="M7.5 12h2.5l1.2-2.2 1.8 4.4 1.2-2.2h2.3"/>',
 checkin:'<rect x="4.5" y="4.5" width="15" height="15" rx="4"/><path d="m8.5 12.2 2.4 2.4 4.6-5"/>', dieta:'<path d="M7 4v6a2 2 0 0 0 4 0V4M9 10v10M16.5 20V4c-2 1-3 3.2-3 6v3h3"/>',
 agua:'<path d="M12 3.8s-6 6.6-6 10.7a6 6 0 0 0 12 0c0-4.1-6-10.7-6-10.7Z"/><path d="M9.3 15a2.8 2.8 0 0 0 2.4 2.4"/>', sono:'<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z"/>',
 fastfood:'<path d="M5 11a7 7 0 0 1 14 0ZM4.5 14.5h15M5.5 17.5a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5"/><path d="M4 4l16 16"/>',
 inferiores:'<path d="M10 3h5l.5 6-1.5 4 1 6h4.5c1 0 1.5.6 1.5 1.4V21H10l-1.5-7 1.5-4.5Z"/>', superiores:'<path d="M4 20c0-3.5 1.6-6 4-7l3.5-7.5a2.6 2.6 0 0 1 3.5-1.3l1.5.7-1 2.7-2.6.2-1.6 3.6c2.2-1.7 5.5-2 7.8-.3 2.7 2 2.6 5.9.3 8.4Z"/>', core:'<rect x="7" y="3.5" width="10" height="17" rx="4.5"/><path d="M12 5.5v13M7.5 9h9M7.5 13h9M7.5 17h9"/>',
 doce:'<path d="M8.5 9.5a4.9 4.9 0 0 1 7 7 4.9 4.9 0 0 1-7-7Z"/><path d="m8.5 9.5-3-3.5-.8 4.3M15.5 16.5l3 3.5.8-4.3"/><path d="M4 4l16 16"/>'
};
const mtile = (k, s) => `<span class="mtile" style="--s:${s||38}px"><svg viewBox="0 0 24 24" aria-hidden="true">${LI[k] || ''}</svg></span>`;

/* ---------- casca: topo, abas ---------- */
const TAB_IC = {
  hoje:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  treino:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/></svg>',
  dieta:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8M7 7h4M17 3c-2 2-2 6 0 8v10"/></svg>',
  checkin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>',
  matilha:'<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="M14 8L36 32H64L86 8L83 44L94 58L76 66L66 92H34L24 66L6 58L17 44Z"/></svg>'
};
function shell(body){
  const tabs = [['hoje','Hoje'], ...(hasTreino() ? [['treino','Treino']] : []), ...(hasDieta() ? [['dieta','Dieta']] : []), ['checkin','Check-in'], ['matilha','Matilha']];
  const pend = !sentToday();
  return `<div class="app">
  <header class="top"><div class="logo"><span class="emb" style="width:34px;height:34px">${RA.emblem(5, false, 34)}</span><span class="d">Chames Crew</span></div>
    ${CFG.whatsappDuvidas ? `<a class="wa-btn" href="${wa(CFG.whatsappDuvidas, `Oi! Sou ${firstName(ME.name)}, da Chames Crew, e tenho uma dúvida:`)}" target="_blank" rel="noopener">${WA_ICON}Falar com a equipe</a>` : ''}</header>
  <div id="pend"></div>
  <section class="view">${body}</section></div>
  <div class="rest" id="rest" hidden><div><b id="rest-t">1:30</b><div class="bar"><i id="rest-b" style="width:100%"></i></div><button class="btn small" id="rest-skip">Pular</button></div></div>
  <div class="tabs"><nav aria-label="Seções do app" style="grid-template-columns:repeat(${tabs.length},1fr)">${tabs.map(([k,l]) => `<button data-v2go="${k}" ${S.tab === k ? 'aria-current="page"' : ''} class="${k === 'checkin' ? 'ci-tab' : ''}">${k === 'checkin' && pend ? `<span class="ci-alert${brNow() >= 20 ? ' late' : ''}" aria-label="Check-in do dia pendente">!</span>` : ''}${TAB_IC[k]}${l}</button>`).join('')}</nav></div>`;
}
function renderPending(){ const el = root && $r('#pend'); if (!el) return; el.innerHTML = Q2.length ? `<p class="meta" style="font-size:12.5px;margin:4px 0 0;text-align:center">Sem internet: ${Q2.length} ${Q2.length === 1 ? 'registro guardado' : 'registros guardados'} no aparelho. Envio sozinho quando a conexão voltar.</p>` : ''; }

/* ---------- aviso: o Sérgio mudou o treino ou a dieta ---------- */
const lastUpd = () => ({ tr:D.workouts.map(w => w.updated_at || '').sort().slice(-1)[0] || '', di:(D.diet && D.diet.updated_at) || '' });
function updBanner(){
  const u = lastUpd(), seen = lsGet(uidKey('visto'), {}), tr = hasTreino() && u.tr && u.tr > (seen.tr || ''), di = hasDieta() && u.di && u.di > (seen.di || '');
  if (!tr && !di) return '';
  const what = tr && di ? 'seu treino e sua dieta' : tr ? 'seu treino' : 'sua dieta';
  return `<div class="block ink"><span class="lbl">Novidade</span><p class="d" style="font-size:30px;margin:4px 0 6px">O Sérgio atualizou ${what}</p>
    <div class="grid2">${tr ? '<button class="btn small solid" data-upd="treino">Ver treino</button>' : ''}${di ? '<button class="btn small solid" data-upd="dieta">Ver dieta</button>' : ''}${tr && di ? '' : '<button class="btn small" data-upd="ok">Ok</button>'}</div></div>`;
}
/* ---------- HOJE ---------- */
function vHoje(){
  const t = TODAY(), ws = weekStart(t), wi = dayIdx(t);
  const created = (ME.created_at || t).slice(0,10), weeksIn = Math.max(1, diffWeeks(weekStart(created), ws) + 1);
  const dots = WDAY.map((n, i) => { const d = addDays(ws, i), ci = D.daily.some(x => x.day === d), tr = trainDays(d, d) > 0, mk = D.meals.some(x => x.day === d);
    const st = ci ? 'on' : (tr || mk) ? 'half' : ''; return `<div class="day">${n[0]}<div class="dot ${st} ${i === wi ? 'today' : ''}">${ci ? '✓' : ''}</div></div>`; }).join('');
  // ciclo de 4 semanas
  const cyc0 = addDays(weekStart(created), Math.floor(diffDaysIdx(weekStart(created), ws) / 28) * 28);
  const cycEnd = addDays(cyc0, 27), cw = Math.floor(diffDaysIdx(cyc0, ws) / 7) + 1;
  const target = (ME.freq || 3) * 4, minC = Math.ceil(target * .75), done = trainDays(cyc0, cycEnd), left = diffDaysIdx(t, cycEnd) + 1;
  // seu dia
  const L = hasTreino() ? nextLetter() : null, W = L && wOf(L), run = getRun();
  const trDone = D.logs.some(x => x.day === t && x.finished_at);
  const nSets = W ? (W.exercises || []).reduce((a, e) => a + targetsOf(e).length, 0) : 0;
  const nDone = run && run.letter === L ? Object.values(run.sets || {}).reduce((a, v) => a + v.filter(s => s && s[2]).length, 0) : 0;
  const meals = (D.diet && D.diet.meals) || [], marked = D.meals.filter(x => x.day === t).length;
  const now = brNow(), openM = meals.findIndex((m, i) => now >= m.win[0] && now < m.win[1] && !D.meals.some(x => x.day === t && x.meal_idx === i));
  const ci = sentToday();
  const rows = [hasTreino() && W ? ['tr', trDone, `<b>${esc2(W.title || 'Treino ' + L)}</b><small>${esc2(W.focus || '')}${W.focus ? ' • ' : ''}${trDone ? 'finalizado ✓' : `${nDone} de ${nSets} séries`}</small>`, `<button class="btn small" data-v2go="treino">${trDone ? 'Ver' : nDone ? 'Continuar' : 'Começar'}</button>`] : hasTreino() ? ['tr', false, '<b>Treino</b><small>O Sérgio ainda vai montar sua ficha</small>', ''] : null,
    hasDieta() ? ['di', meals.length && marked >= meals.length, `<b>Dieta <span style="font-weight:700;opacity:.7">${meals.length ? `${marked} de ${meals.length} no horário` : ''}</span></b><small>${!meals.length ? 'O Sérgio ainda vai montar sua dieta' : openM >= 0 ? `${esc2(meals[openM].name)} liberado até ${hh(meals[openM].win[1])}` : marked >= meals.length ? 'Dieta do dia completa ✓' : 'Nenhuma refeição aberta agora'}</small>`, meals.length ? '<button class="btn small" data-v2go="dieta">Marcar</button>' : ''] : null,
    ['ci', ci, `<b>Check-in do dia</b><small>${ci ? 'Enviado ✓' : '8 toques, 1 minuto'}</small>`, ci ? '' : '<button class="btn small" data-v2go="checkin">Fazer</button>']].filter(Boolean);
  const nOk = rows.filter(r => r[1]).length;
  // level (regra atual do app)
  const C = CALC || calc(), cur = myLv(), names = LVN, nxC = CYC[cur + 1], pr = cur === 5;
  const fill = cur >= 4 ? (pr ? 100 : 80) : Math.min(100, ((cur + Math.min(1, (C.cycles - CYC[cur]) / (nxC - CYC[cur]))) / 5) * 100);
  const pd = planDays(ST);
  return `<div class="hero"><span class="motto">Resultados constroem liberdade</span><h2 class="d">Bora, ${esc2(firstName(ME.name))}</h2><p class="sub">${longDate(t)} • semana ${weeksIn} na matilha</p></div>
    ${!isStandalone() && (isIOS() || isAndroid()) ? `<div class="block frost"><span class="lbl">Você está no navegador</span><p style="margin:6px 0 0;font-weight:700">Instale o app na tela do celular: você entra com um toque, recebe os lembretes e não perde nenhum check-in.</p><button class="btn solid wide" style="margin-top:12px" data-v2install>Ver como instalar (${isIOS() ? 'iPhone' : 'Android'})</button></div>` : ''}
    ${updBanner()}
    <div class="week" aria-label="Dias da semana">${dots}</div>
    ${hasTreino() ? `<div class="cycle"><span class="lbl">Ciclo • semana ${cw} de 4</span><b>${done} de ${target} treinos</b><div class="bar"><i style="width:${Math.min(100, Math.round(done/target*100))}%"></i></div>
      <span class="meta" style="font-size:12.5px;margin:0">${done >= minC ? `Ciclo garantido. Faltam ${Math.max(0, target - done)} para a meta cheia em ${left} dias.` : `Faltam ${minC - done} treinos para o ciclo contar • ${left} dias restantes.`}</span></div>` : ''}
    ${pd !== null && pd <= 15 ? `<a class="rn-ban" href="${wa(CFG.whatsapp, `Oi! Sou ${firstName(ME.name)}, da Chames Crew. Quero renovar meu plano.`)}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><span><small>Seu plano</small><b>${planTag(ST)}</b></span><span class="rn-cta">Renovar${ST.bank ? ' • ' + Math.min(100, ST.bank) + '% off' : ''}</span></a>` : ''}
    <div class="block ink sday"><div class="row"><span class="lbl">Seu dia</span><span class="pill">${nOk === rows.length ? 'Dia completo ✓' : `${nOk} de ${rows.length} para fechar`}</span></div>
      ${rows.map(r => `<div class="srow"><i class="sdk ${r[1] ? 'on' : ''}">${r[1] ? '✓' : ''}</i><div class="sdt">${r[2]}</div>${r[3]}</div>`).join('')}</div>
    <div class="block frost crew"><div class="row"><span class="lbl">Minha crew</span><button class="btn small" data-v2go="matilha">Ver tudo</button></div>
      <p class="d" style="font-size:34px;margin:4px 0 0">${pr ? 'Prestígio' : 'Level ' + LVN[cur]}</p>${motLine()}
      <div class="tline"><div class="track"><i style="width:${fill}%"></i></div>${names.map((n, i) => { const st = i < cur ? 'got' : i === cur ? 'now' : 'lock'; return `<span class="tnode ${st}">${RA.emblem(i, st === 'lock', st === 'now' ? 54 : 40)}<span>${n}</span></span>`; }).join('')}</div>
      ${cur < 4 ? `<div class="nextlv"><div class="row"><b class="d" style="font-size:26px">Faltam ${nxC - C.cycles} ${nxC - C.cycles === 1 ? 'ciclo' : 'ciclos'}</b><span class="meta" style="margin:0;font-size:13px">pra ${LVN[cur + 1]}</span></div><div class="bar"><i style="width:${Math.round(Math.min(1, C.cycles / nxC) * 100)}%"></i></div><p style="font-size:13px;font-weight:800;margin:0">Ao chegar: ${esc2(RA.LEVELS[cur + 1].perks[0])}</p></div>` : ''}</div>
    <div class="block frost disc-card"><div class="row"><span class="lbl">Seu desconto na renovação</span><span class="pill">${esc2(planTag(ST))}</span></div>
      <p class="d" style="font-size:64px;margin:6px 0 2px">${Math.min(100, ST.bank || 0)}%</p>
      <p class="meta" style="font-size:12.5px;margin:6px 0 0">Vem do seu level e dos amigos que viraram alunos. Vale na próxima renovação, até 100%.</p>
      <a class="btn solid wide" style="margin-top:12px;text-decoration:none" href="${wa(CFG.whatsapp, `Oi! Sou ${firstName(ME.name)}, da Chames Crew. Quero renovar meu plano.`)}" target="_blank" rel="noopener">Renovar meu plano</a>
      <button class="btn wide" style="margin-top:8px" data-v2invite>Convidar um amigo • +10%</button></div>`;
}

/* ---------- TREINO ---------- */
function vTreino(){
  if (!D.workouts.length) return `<div class="hero"><span class="motto">Treino da matilha</span><h2 class="d">Treino</h2></div><div class="block frost"><p style="margin:0;font-weight:800">Sua ficha ainda não está pronta.</p><p class="meta">Assim que o Sérgio montar, ela aparece aqui.</p></div>`;
  const L = S.letter && wOf(S.letter) ? S.letter : nextLetter(); S.letter = L;
  const W = wOf(L), ex = W.exercises || [], G = linkGroups(ex), today = nextLetter();
  const run = getRun(), mine = run && run.letter === L ? run : null;
  const done = D.logs.find(x => x.day === TODAY() && x.letter === L && x.finished_at);
  const cards = ex.map((e, i) => {
    const prev = prevOf(L, e), tg = targetsOf(e), sg = suggestion(e, prev), g = G[i], st = mine && mine.sets[e.uid] || [], sk = mine && mine.skip && mine.skip[e.uid];
    const rows = tg.map((t, s) => { const p = prev && (prev[s] || prev[prev.length - 1]), cur = st[s] || [];
      const phKg = sg ? sg.kg : (e.tg ? t[0] : p ? p[0] : (t[0] || '')), phR = e.tg ? t[1] : (e.reps || t[1]);
      return `<span class="prev" style="font-weight:800;color:var(--fg)">${s + 1}</span><span class="prev">${p ? `${nf(p[0])} kg × ${p[1]}` : '—'}</span>
        <input data-kg="${i}:${s}" class="${sg ? 'sug' : ''}" inputmode="decimal" aria-label="Carga série ${s + 1}" placeholder="${phKg === '' ? 'kg' : nf(phKg)}" value="${cur[0] !== undefined && cur[0] !== null ? nf(cur[0]) : ''}">
        <input data-rp="${i}:${s}" inputmode="numeric" aria-label="Repetições série ${s + 1}" placeholder="${phR}" value="${cur[1] ?? ''}">
        <button class="ck ${cur[2] ? 'on' : ''}" data-ck="${i}:${s}" aria-label="Concluir série ${s + 1}" aria-pressed="${!!cur[2]}">${CHECK}</button>`; }).join('');
    const allOk = tg.every((_, s) => st[s] && st[s][2]);
    const closed = (allOk || sk) && !(mine && mine.open === e.uid);
    const sum = sk ? (sk.reason === 'dor' ? `Pulado por dor${sk.area ? ' (' + sk.area + ')' : ''} • o Sérgio foi avisado` : sk.reason === 'ocupado' ? `Trocado por ${sk.sub}` : 'Pulado • sem tempo ou cansaço')
      : allOk ? `${tg.length} séries • ${nf(Math.max(...st.map(x => +x[0] || 0)))} kg • ${st.map(x => x[1]).join('/')} reps` : '';
    return `<article class="ex ${closed ? 'closed' : ''} ${sk && sk.reason !== 'ocupado' ? 'skipped' : ''} ${sk && sk.reason === 'dor' ? 'pain' : ''}" data-ex="${i}">
      <button class="exsum" data-open="${i}"><span class="okc">${sk && sk.reason === 'dor' ? '!' : sk && sk.reason === 'tempo' ? '–' : CHECK}</span><span style="min-width:0;flex:1"><b>${esc2(sk && sk.sub ? sk.sub : e.name)}</b><small>${esc2(sum)}</small></span><small>${sk && sk.reason !== 'ocupado' ? 'Desfazer' : 'Reabrir'}</small></button>
      <div class="exbody"><h3>${g ? g.lab + ' • ' : ''}${esc2(sk && sk.sub ? sk.sub : e.name)}</h3>${sk && sk.sub ? `<span class="subtag">Substituto de ${esc2(e.name)} • aparelho ocupado</span>` : ''}
        <p class="meta">${tg.length} séries × ${tg[0] ? tg[0][1] : e.reps} reps • ${e.rest ? 'descanso ' + e.rest + 's' : 'sem descanso, vai direto pro próximo'}</p>
        ${e.tg ? `<span class="tag up">🎯 Meta do Sérgio: ${[...new Set(e.tg.map(t => nf(t[0])))].join(' / ')} kg</span>` : ''}
        ${(e.mets || []).filter(k => MET[k]).map(k => `<span class="tag met"><b>${MET[k].n}</b> • ${MET[k].how}</span>`).join('')}
        ${g ? `<span class="tag lk">🔗 <b>${g.n} ${g.lab}</b> • ${g.pos < g.len - 1 ? 'faça e vá direto pro próximo, sem descanso' : 'último do bloco: agora descanse'}</span>` : ''}
        ${e.obs ? `<span class="tag">📌 ${esc2(e.obs)}</span>` : ''}${sg ? `<span class="tag up">↑ Passou da meta (+${sg.excess} reps): ${nf(sg.kg)} kg (+${sg.pct}%)</span>` : ''}
        <div class="sets"><span class="h">Série</span><span class="h">Anterior</span><span class="h">Kg</span><span class="h">Reps</span><span></span>${rows}</div>
        <div class="tools">${prev ? `<button class="btn small" data-rep="${i}">↻ Repetir anterior</button>` : ''}<button class="btn small" data-skip="${i}">⤼ Pular</button></div></div></article>`;
  }).join('');
  return `<div class="hero"><span class="motto">Treino da matilha</span><h2 class="d">${esc2(W.title || 'Treino ' + L)}</h2><p class="sub">${esc2(W.focus || '')}${L === today ? ' • treino de hoje' : ''}</p></div>
    ${D.workouts.length > 1 ? `<div class="plans" role="tablist" style="grid-template-columns:repeat(${Math.min(6, D.workouts.length)},minmax(0,1fr))">${D.workouts.map(w => `<button class="plan" role="tab" aria-selected="${w.letter === L}" data-letter="${esc2(w.letter)}"><b>${esc2(w.letter)}</b><small>${w.letter === today ? 'Hoje' : esc2((w.focus || '').split(' ')[0])}</small></button>`).join('')}</div>` : ''}
    <div id="exs">${cards}</div>
    ${done ? `<button class="btn wide" data-v2sum style="border-color:var(--ok);color:var(--ok);background:var(--ok-bg)">✓ Treino finalizado hoje • ver resumo</button>` : `<button class="btn solid wide" data-finish>Finalizar treino</button>`}`;
}
function runFor(L){ let r = getRun(); if (!r || r.letter !== L){ r = { letter:L, startedAt:null, sets:{}, skip:{} }; } return r; }
function readSet(i, s){ const kg = $r(`[data-kg="${i}:${s}"]`), rp = $r(`[data-rp="${i}:${s}"]`); const pk = v => v === '' ? null : +String(v).replace(',', '.'); return [pk(kg.value), rp.value === '' ? null : +rp.value]; }
let restTimer = null;
function startRest(sec){ clearInterval(restTimer); if (!sec) return; let left = sec; const r = $r('#rest'); r.hidden = false;
  const upd = () => { $r('#rest-t').textContent = `${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`; $r('#rest-b').style.width = (left/sec*100) + '%'; };
  upd(); restTimer = setInterval(() => { left--; if (left <= 0){ clearInterval(restTimer); r.hidden = true; try { navigator.vibrate && navigator.vibrate([60,40,60]); } catch(e){} toast2('Descanso terminou. Próxima série!'); return; } upd(); }, 1000); }
function onCheck(i, s, btn){
  const L = S.letter, W = wOf(L), e = W.exercises[i], tg = targetsOf(e), r = runFor(L);
  const on = btn.getAttribute('aria-pressed') !== 'true';
  const kgEl = $r(`[data-kg="${i}:${s}"]`), rpEl = $r(`[data-rp="${i}:${s}"]`);
  if (on){ if (kgEl.value === '' && kgEl.placeholder !== 'kg') kgEl.value = kgEl.placeholder; if (rpEl.value === '') rpEl.value = rpEl.placeholder; }
  const v = readSet(i, s); if (!r.startedAt && on) r.startedAt = Date.now();
  (r.sets[e.uid] = r.sets[e.uid] || [])[s] = [v[0], v[1], on]; delete r.open; setRun(r);
  btn.setAttribute('aria-pressed', on); btn.classList.toggle('on', on);
  const all = tg.every((_, k) => r.sets[e.uid][k] && r.sets[e.uid][k][2]);
  const G = linkGroups(W.exercises), g = G[i];
  if (on && !all) startRest(e.rest);
  if (on && all){ clearInterval(restTimer); $r('#rest').hidden = true; if (!g || g.pos === g.len - 1) startRest(e.rest);
    setTimeout(() => { draw(); const nx = $r(`[data-ex="${i + 1}"]`); if (nx) nx.scrollIntoView({ behavior:'smooth', block:'start' }); else { const f = $r('[data-finish]'); f && f.scrollIntoView({ behavior:'smooth', block:'center' }); } }, 380); }
}
function openSkip(i){
  const L = S.letter, e = wOf(L).exercises[i];
  const subs = (window.__ccSubs && window.__ccSubs(e.name)) || [];
  const sh = sheet2(`<span class="lbl">Pular exercício</span><p class="d" style="font-size:38px;margin:6px 0 4px">${esc2(e.name)}</p><p class="meta" style="margin:0 0 14px">Por que você vai pular?</p>
    <div style="display:flex;flex-direction:column;gap:10px" id="rs">
      <button class="reason" data-r="ocupado"><span class="ic">⏳</span><span><b>Aparelho ocupado</b><small>Escolha um substituto ou escreva o que fez</small></span></button>
      <button class="reason" data-r="dor"><span class="ic">🩹</span><span><b>Dor ou desconforto</b><small>Não perde medalha e o Sérgio é avisado</small></span></button>
      <button class="reason" data-r="tempo"><span class="ic">⏱️</span><span><b>Sem tempo ou cansaço</b><small>O treino fica como parcial</small></span></button></div>`, s => {
    const box = s.querySelector('#rs');
    s.addEventListener('click', ev => { const b = ev.target.closest('[data-r]'), su = ev.target.closest('[data-sub]'), ar = ev.target.closest('[data-area]'), cs = ev.target.closest('[data-subok]');
      const r = runFor(L); r.skip = r.skip || {};
      if (b){ const k = b.dataset.r;
        if (k === 'ocupado'){ box.innerHTML = `<p class="lbl">Escolha o substituto</p>${subs.map(n => `<button class="reason" data-sub="${esc2(n)}"><span class="ic">⇄</span><span><b>${esc2(n)}</b><small>Mesmas séries e repetições</small></span></button>`).join('')}<input class="inp" id="sub-txt" placeholder="Ou escreva o exercício que fez"><button class="btn solid wide" data-subok>Usar este</button>`; return; }
        if (k === 'dor'){ box.innerHTML = `<p class="lbl">Onde está a dor?</p><div class="chips">${['Joelho','Lombar','Ombro','Quadril','Punho','Outro lugar'].map(a => `<button class="chip" data-area="${a}">${a}</button>`).join('')}</div>`; return; }
        r.skip[e.uid] = { reason:'tempo' }; setRun(r); s.remove(); draw(); toast2('Exercício pulado.'); return; }
      if (su || cs){ const n = su ? su.dataset.sub : (s.querySelector('#sub-txt').value || '').trim(); if (!n){ toast2('Escreva o exercício'); return; } r.skip[e.uid] = { reason:'ocupado', sub:n }; r.open = e.uid; setRun(r); s.remove(); draw(); toast2('Trocado por ' + n + '. Conta normalmente.'); return; }
      if (ar){ r.skip[e.uid] = { reason:'dor', area:ar.dataset.area }; setRun(r); s.remove(); draw(); toast2('Anotado. Não force: o Sérgio vai ver isso hoje.'); }
    });
  });
}
function finishTreino(){
  const L = S.letter, W = wOf(L), ex = W.exercises || [], r = runFor(L);
  let total = 0, counted = 0, n = 0, vol = 0, recs = 0; const sets = [], skipped = [], cmp = [];
  ex.forEach((e, i) => {
    const tg = targetsOf(e), st = (r.sets[e.uid] || []), sk = r.skip && r.skip[e.uid], prev = prevOf(L, e);
    total += tg.length;
    const rows = tg.map((_, s) => { const x = st[s]; return x && x[2] ? [x[0] ?? 0, x[1] ?? 0, true] : [null, null, false]; });
    const dn = rows.filter(x => x[2]).length; n += dn; counted += dn;
    if (sk && sk.reason === 'dor') counted += tg.length - dn;
    const ev = rows.reduce((a, x) => a + (x[2] ? (x[0] || 0) * (x[1] || 0) : 0), 0); vol += ev;
    const kNow = Math.max(0, ...rows.filter(x => x[2]).map(x => x[0] || 0)), kPrev = prev ? Math.max(...prev.map(p => p[0])) : 0;
    if (dn && kPrev && kNow > kPrev) recs++;
    sets.push({ uid:e.uid, name:sk && sk.sub ? sk.sub : e.name, orig:e.name, sets:rows });
    if (sk) skipped.push({ uid:e.uid, name:e.name, ...sk });
    cmp.push({ n:sk && sk.sub ? sk.sub : e.name, a:kPrev, b:kNow, done:dn, of:tg.length, ev, sk });
  });
  if (!n && !skipped.length){ toast2('Marque pelo menos uma série para finalizar'); return; }
  const pct = total ? Math.round(counted / total * 100) : 0;
  const mins = r.startedAt ? Math.max(1, Math.round((Date.now() - r.startedAt) / 60000)) : null;
  const row = { id:uuid(), user_id:ME.id, workout_id:W.id || null, letter:L, day:TODAY(), sets, skipped, volume_kg:Math.round(vol), duration_min:mins, finished_at:new Date().toISOString() };
  qAdd({ kind:'upsert', t:'workout_logs', row, oc:'id' });
  D.logs.push({ ...row, pct }); saveCache();
  if (pct >= 75){ qAdd({ kind:'upsert', t:'trainings', row:{ user_id:ME.id, day:TODAY(), verified:false }, oc:'user_id,day', ign:true });
    if (ST && !(ST.trainingsList || []).some(t => t.day === TODAY())){ ST.trainingsList = [...(ST.trainingsList || []), { day:TODAY() }]; ST.trainingsTotal = (ST.trainingsTotal || 0) + 1; } }
  try { localStorage.removeItem(trKey()); } catch(e){}
  clearInterval(restTimer);
  persistStats();
  showSummary(row, { pct, n, total, vol, recs, mins, cmp, W });
  draw();
}
function showSummary(row, k){
  const status = k.pct >= 100 ? ['f-ok','✓ Treino completo'] : k.pct >= 75 ? ['f-mid',`Treino parcial (${k.pct}%) • conta como treino`] : ['f-bad',`Treino iniciado (${k.pct}%) • não conta para o ciclo`];
  sheet2(`<div class="unlock"><div style="display:grid;place-items:center">${RA.emblem(myLv(), false, 64)}</div>
    <span class="motto" style="display:block;margin-top:10px">Treino concluído</span><p class="d" style="font-size:52px;margin:6px 0 2px">${esc2(k.W.title || 'Treino ' + row.letter)}</p>
    <p class="meta" style="margin:0">${esc2(k.W.focus || '')}${k.W.focus ? ' • ' : ''}${longDate(row.day).toLowerCase()}</p>
    <span class="status flag ${status[0]}">${status[1]}</span>
    <div class="stats"><div class="stat"><span>Volume</span><b>${Math.round(k.vol).toLocaleString('pt-BR')} kg</b><em>séries × carga × reps</em></div>
      <div class="stat"><span>Duração</span><b>${k.mins ? k.mins + ' min' : '—'}</b><em>da 1ª série até agora</em></div>
      <div class="stat"><span>Séries</span><b>${k.n} de ${k.total}</b><em>${k.pct >= 100 ? 'treino completo' : 'parcial'}</em></div>
      <div class="stat"><span>Recordes</span><b>${k.recs}</b><em class="${k.recs ? 'up' : ''}">${k.recs ? 'carga acima da última vez' : 'mesma carga da última vez'}</em></div></div>
    <p class="lbl" style="text-align:left;margin:18px 0 4px">Comparação com a última vez</p>
    <div>${k.cmp.map(c => `<div class="cmp"><span style="min-width:0"><b>${esc2(c.n)}</b><br><small>${c.sk && c.sk.reason !== 'ocupado' ? (c.sk.reason === 'dor' ? 'Pulado por dor' : 'Pulado • sem tempo') : `${c.done} de ${c.of} séries • ${Math.round(c.ev).toLocaleString('pt-BR')} kg`}</small></span><span class="v ${c.b > c.a && c.a ? 'up' : ''}">${c.done ? (c.a ? `${nf(c.a)} → ${nf(c.b)} kg` : `${nf(c.b)} kg`) : '—'}</span></div>`).join('')}</div>
    ${Q2.length ? '<p class="meta" style="font-size:12.5px">Sem internet agora: o treino ficou salvo no aparelho e envia sozinho depois.</p>' : ''}</div>`);
}

/* ---------- DIETA ---------- */
function mealState(i, m){ const t = TODAY(); if (D.meals.some(x => x.day === t && x.meal_idx === i)) return 'done'; const h = brNow(); if (h < m.win[0]) return 'future'; if (h < m.win[1]) return 'open'; return 'miss'; }
const SWK = () => uidKey('trocas-' + TODAY());
function swapsFor(i){ const log = D.meals.find(x => x.day === TODAY() && x.meal_idx === i); if (log) return log.swaps || {}; return (lsGet(SWK(), {})[i]) || {}; }
function vDieta(){
  const meals = (D.diet && D.diet.meals) || [];
  if (!meals.length) return `<div class="hero"><span class="motto">Dieta da matilha</span><h2 class="d">Dieta</h2></div><div class="block frost"><p style="margin:0;font-weight:800">Sua dieta ainda não está pronta.</p><p class="meta">Assim que o Sérgio montar, ela aparece aqui.</p></div>`;
  const T = { k:0, p:0, c:0, g:0 };
  const ST_ = { done:['st-done','✓ Feita no horário'], open:['st-open','Aberta agora'], future:['st-future','Libera às '], miss:['st-miss','Não registrada'] };
  const html = meals.map((m, mi) => {
    const st = mealState(mi, m), sw = swapsFor(mi);
    const items = (m.items || []).map((it, ii) => { const s = sw[ii], f = s ? s.f : it.f, g = s ? s.g : it.g; const x = mac(f, g); for (const k in T) T[k] += x[k];
      const open = S.openSw === `${mi}-${ii}`;
      const alts = open ? [it.f, ...subsOf(it.f)].map(a => { const gg = a === it.f ? it.g : eqMix(it.f, it.g, a); const dk = Math.round(mac(a, gg).k - mac(it.f, it.g).k); return { a, gg, dk }; }).sort((p, q) => (p.a !== it.f) - (q.a !== it.f) || Math.abs(p.dk) - Math.abs(q.dk)) : [];
      return `<div class="food"><div style="min-width:0"><b>${esc2(fname(f))}</b><small>${nf(g)} g${hmTxt(f, g)}${s ? ' • trocado' : ''}</small></div>${subsOf(it.f).length && st !== 'done' ? `<button class="btn small" data-sw="${mi}-${ii}">⇄ Trocar</button>` : ''}</div>
        ${open ? `<div class="swaps"><p class="meta" style="font-size:12.5px;margin:6px 0">${esc2(FGN[grOf(it.f)] || '')}: porção pelo meio-termo entre calorias e macro.</p>${alts.map(o => `<button class="swap ${(s ? s.f : it.f) === o.a ? 'on' : ''}" data-pick="${mi}:${ii}:${o.a}:${o.gg}"><span style="min-width:0"><b>${esc2(fname(o.a))}</b><small>${nf(o.gg)} g${hmTxt(o.a, o.gg)}</small></span><span class="delta">${o.a === it.f ? 'original' : (o.dk >= 0 ? '+' : '') + o.dk + ' kcal'}</span></button>`).join('')}</div>` : ''}`; }).join('');
    return `<article class="meal ${st === 'done' ? 'ok' : mi % 2 ? 'frost' : 'line'}"><div class="row"><div><h3>${esc2(m.name)}</h3><p class="meta" style="font-size:13px;margin-top:4px">Janela: ${hh(m.win[0])} às ${hh(m.win[1])}</p></div>
      <span class="state ${ST_[st][0]}">${ST_[st][1]}${st === 'future' ? hh(m.win[0]) : ''}</span></div>${items}
      ${st === 'open' ? `<button class="btn solid wide" style="margin-top:10px" data-mark="${mi}">Marcar como feita</button>` : ''}
      ${st === 'miss' ? '<p class="meta" style="font-size:13px;margin-top:8px">O horário passou. Ela não conta para a semana.</p>' : ''}</article>`; }).join('');
  const marked = D.meals.filter(x => x.day === TODAY()).length;
  return `<div class="hero"><span class="motto">Dieta da matilha</span><h2 class="d">Dieta</h2><p class="sub">Marque cada refeição no horário dela. Passou do horário, não conta.</p></div>
    <div class="block ink"><div class="row"><span class="lbl">Total do dia</span><span class="pill">${marked} de ${meals.length} no horário</span></div>
      <div class="macros" style="margin-top:12px">${[['kcal', T.k], ['prot', T.p, 'g'], ['carb', T.c, 'g'], ['gord', T.g, 'g']].map(([l, v, u]) => `<div><b class="d" style="font-size:28px">${Math.round(v)}${u || ''}</b><small style="display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;opacity:.7">${l}</small></div>`).join('')}</div></div>
    <div class="view" style="gap:14px">${html}</div>
    ${D.diet.notes ? `<div class="block frost"><span class="lbl">Recado do Sérgio</span><p style="margin:6px 0 0">${esc2(D.diet.notes)}</p></div>` : ''}
    <p class="meta" style="font-size:12.5px">Trocas com valores aproximados da Tabela TACO.</p>`;
}

/* ---------- CHECK-IN ---------- */
function weekLive(ws){
  const W = weekStats(ws), wi = Math.min(6, Math.max(0, diffDaysIdx(ws, TODAY())));
  const R = [['limite','Treinos','treino',0], ['resist','Cardio','cardio',0], ['ci','Check-in do dia','checkin',0], ['alim','Dieta no horário','dieta',1], ['agua',`Meta de água (${nf(waterL())} L)`,'agua',1], ['sono','Sono de 7h ou mais','sono',1], ['zero','Sem fast food','fastfood',1], ['doce','Sem doce','doce',1]]
    .filter(r => !(!hasDieta() && r[3]) && !(!hasTreino() && ['limite','resist'].includes(r[0])) && W[r[0]].t > 0);
  return `<div class="row"><span class="lbl">Semana ${shortDate(ws)} a ${shortDate(addDays(ws, 6))}</span><span class="pill">dia ${wi + 1} de 7</span></div>
    <div class="wl">${R.map(([k, n, ic]) => { const w = W[k], ok = w.d >= w.t; return `<div class="wl-r${ok ? ' ok' : ''}"><span class="wl-ic">${mtile(ic, 38)}</span><span class="wl-n">${n}</span><span class="wl-v">${w.d} de ${w.t}${ok ? ' ✓' : ''}</span><div class="wl-b"><i style="width:${Math.min(100, w.d / w.t * 100)}%"></i></div></div>`; }).join('')}</div>
    <p class="meta" style="font-size:12.5px;margin:10px 0 0">Tudo isso soma sozinho com o seu check-in do dia. Você não precisa lembrar de nada no fim da semana.</p>`;
}
function closableWeek(){
  const t = TODAY(), wi = dayIdx(t), ws = weekStart(t);
  if (wi === 6 && brNow() >= 18) return ws;                    // domingo depois das 18h
  if (wi <= 1){ const pw = addDays(ws, -7); return pw; }        // segunda e terça: semana passada (prazo prorrogado)
  return null;
}
function vCheckin(){
  const mode = S.ci, dia = mode === 'dia';
  let body;
  if (dia){
    if (sentToday()) body = `<div class="block frost meal ok"><span class="lbl">Check-in do dia</span><p class="d" style="font-size:34px;margin:6px 0 2px">Enviado ✓</p><p class="meta" style="margin:0">Volte amanhã para o próximo.</p></div><div class="block frost">${weekLive(weekStart(TODAY()))}</div>`;
    else {
      const A = S.ans, qs = QD.map((q, i) => `<div class="q"><h4>${i === 6 ? `Bateu sua meta de água hoje (${nf(waterL())} L)?` : q[0]}</h4><div class="chips">${q[1].map((o, j) => `<button class="chip" aria-pressed="${A[i] === j}" data-qa="${i}:${j}">${o}</button>`).join('')}</div></div>`).join('');
      const meals = (D.diet && D.diet.meals) || [], mk = D.meals.filter(x => x.day === TODAY()).length;
      const n = A.filter(x => x !== undefined && x !== null).length;
      body = `<div class="block frost">${qs}${hasDieta() && meals.length ? `<div class="q"><h4>Dieta de hoje</h4><div class="auto">${mk} de ${meals.length} refeições no horário • preenchido automaticamente</div></div>` : ''}</div>
        <button class="btn solid wide" data-cisend>Enviar check-in do dia</button><p class="meta" style="text-align:center;margin:0">${n} de ${QD.length} respondidas</p>`;
    }
  } else {
    const cw = closableWeek(), closed = cw && D.closes.some(x => x.week_start === cw);
    const form = cw && !closed ? `<div class="wk-close"><span class="lbl">Fechar a semana ${shortDate(cw)} a ${shortDate(addDays(cw, 6))}</span><p class="d" style="font-size:30px;margin:4px 0 6px">30 segundos</p>
      ${dayIdx(TODAY()) <= 1 ? '<div class="wk-dl"><b>Prazo prorrogado até terça 23h59</b><span>Depois disso a semana fecha sozinha sem o peso e o Sérgio é avisado.</span></div>' : ''}
      <div class="q"><h4>Seu peso hoje <small style="font-weight:700;color:var(--muted)">(opcional)</small></h4><input class="inp" id="w-peso" inputmode="decimal" placeholder="ex.: 69,4" aria-label="Peso em kg" style="max-width:160px">
        <p class="meta" style="font-size:12.5px;margin:8px 0 0"><b>OBS:</b> é opcional, mas é importante. Pese em jejum, de manhã, depois de ir ao banheiro, sempre na mesma balança.</p></div>
      <div class="q"><h4>Alguma dor ou desconforto que o Sérgio precisa saber?</h4><div class="chips">${['Nenhuma','Leve','Moderada','Forte'].map((o, j) => `<button class="chip" aria-pressed="${S.pain === j}" data-pain="${j}">${o}</button>`).join('')}</div></div>
      <div class="q"><h4>Quer contar algo para o Sérgio? <small style="font-weight:700;color:var(--muted)">(opcional)</small></h4><textarea class="inp" id="w-msg" rows="2" style="min-height:64px;padding-top:10px" placeholder="Como foi a semana, dúvidas, viagem…"></textarea></div>
      <button class="btn solid wide" data-close-week="${cw}">Fechar a semana</button></div>`
      : closed ? `<div class="wk-close"><span class="lbl">Semana ${shortDate(cw)} a ${shortDate(addDays(cw, 6))}</span><p class="d" style="font-size:30px;margin:4px 0 0">Semana fechada ✓</p><p class="meta">A próxima libera domingo às 18h.</p></div>`
      : `<div class="wk-close"><span class="lbl">Fechar a semana</span><div class="wk-dl"><b>Libera domingo às 18h • prazo até terça 23h59</b><span>Lembretes no domingo às 20h e na segunda às 9h. Se passar do prazo, a semana fecha sozinha sem o peso e o Sérgio é avisado.</span></div></div>`;
    body = `<div class="block frost">${weekLive(weekStart(TODAY()))}${form}</div><button class="btn wide" data-evo>Ver minha evolução</button>`;
  }
  return `<div class="hero"><span class="motto">Uivo da matilha</span><h2 class="d">Check-in</h2><p class="sub">${dia ? 'Rápido: 8 toques.' : 'Sua semana se monta sozinha com o check-in do dia. No fim, feche com o peso e 1 pergunta.'}</p></div>
    <div class="seg" role="tablist"><button role="tab" aria-selected="${dia}" data-cimode="dia">Do dia</button><button role="tab" aria-selected="${!dia}" data-cimode="semana">Da semana</button></div>${body}`;
}
function evoSheet(){
  const weeks = []; for (let k = 7; k >= 0; k--) weeks.push(addDays(weekStart(TODAY()), -7 * k));
  const used = weeks.filter(ws => dailyIn(ws, addDays(ws, 6)).length || D.closes.some(c => c.week_start === ws));
  const stats = used.map(ws => weekStats(ws));
  const rows = used.length >= 2 ? [['sono','Sono de 7h ou mais','noites',1], ['doce','Sem doce','dias',1], ['zero','Sem fast food','dias',1], ['agua','Meta de água','dias',1], ['limite','Treinos','na semana',1], ['resist','Cardio','na semana',1]]
    .filter(r => !(!hasDieta() && ['doce','zero','agua','sono'].includes(r[0])) && !(!hasTreino() && ['limite','resist'].includes(r[0])))
    .map(([k, n, u]) => { const v = stats.map(s => s[k].d), a = v[0], b = v[v.length - 1], d = b - a, mx = Math.max(1, ...v);
      return `<div class="evo-row"><div><b>${n}</b><small>início ${a} ${u} • agora ${b} ${u}</small></div><span class="val">${a} → ${b}</span><div class="spark" aria-hidden="true">${v.map(x => `<i style="height:${Math.max(3, x / mx * 26)}px"></i>`).join('')}</div><span class="tag ${d > 0 ? '' : d < 0 ? 'bad' : 'eq'}" style="grid-column:1/-1;justify-self:start">${d > 0 ? 'melhorou' : d < 0 ? 'piorou' : 'igual'}</span></div>`; }).join('') : '<p class="meta">A comparação aparece depois da segunda semana de check-in.</p>';
  const P = D.closes.filter(c => c.weight_kg).map(c => [c.week_start, +c.weight_kg]);
  let peso = '<p class="meta" style="margin:6px 0 0">Seu peso aparece aqui quando você fechar a semana com ele.</p>';
  if (ME.hide_weight) peso = '<p class="meta" style="margin:6px 0 0">Seu peso fica registrado só para o Sérgio acompanhar.</p>';
  else if (P.length){ const f = P[0][1], l = P[P.length - 1][1], dl = Math.round((l - f) * 10) / 10;
    let chart = ''; if (P.length >= 2){ const vs = P.map(p => p[1]), mn = Math.min(...vs) - .4, mx = Math.max(...vs) + .4, X = i => 14 + i * (292 / (P.length - 1)), Y = v => 12 + (mx - v) / (mx - mn) * 86;
      chart = `<svg viewBox="0 0 320 124" style="width:100%;height:auto;display:block;margin-top:6px" role="img" aria-label="Peso por semana"><path d="${P.map((p, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(' ')}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>${P.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p[1])}" r="${i === P.length - 1 ? 5 : 3.2}" fill="${i === P.length - 1 ? 'currentColor' : 'var(--bg)'}" stroke="currentColor" stroke-width="2"/>`).join('')}</svg>`; }
    peso = `<div class="row" style="margin-top:2px"><b class="d" style="font-size:30px">${nf(l)} kg</b><span class="pill">${(dl > 0 ? '+' : '') + nf(dl)} kg desde o início</span></div>${chart}<div class="wlist">${P.map((p, i) => `<span>Semana de ${shortDate(p[0])}</span><span>${nf(p[1])} kg</span><span>${i ? ((p[1] - P[i-1][1] > 0 ? '+' : '') + nf(p[1] - P[i-1][1])) : 'início'}</span>`).join('')}</div>`; }
  sheet2(`<span class="lbl">Sua evolução</span><p class="d" style="font-size:40px;margin:6px 0 10px">Como você está indo</p>
    <div class="block frost" style="margin:0"><span class="lbl">Peso por semana</span>${peso}</div>
    <div class="block line" style="margin:12px 0 0"><div class="row"><span class="lbl">Início vs agora</span><span class="pill">${used.length} semanas</span></div>${rows}</div>`);
}

/* ---------- MEDALHAS SEMANAIS, CICLOS E LEVEL ---------- */
const CYC = [0, 3, 6, 12, 24];
const LVN = [...RA.LEVELS.map(l => l.name), 'Prestígio'];
const W5 = [4, 8, 16, 26, 52], E5 = [1, 3, 6, 12, 24];
const cardioT = () => (ME.cardio ?? 2);
const DOCE_IC = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 18l-9-6 2 12-2 12 9-6Z M32 18l9-6-2 12 2 12-9-6Z" fill="currentColor" opacity=".75"/><ellipse cx="24" cy="24" rx="10" ry="9" fill="currentColor"/><path d="M19 19c3 2 7 2 10 0" stroke="#fff" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/><path d="M8 42 41 7" stroke="#e0234e" stroke-width="4.5" stroke-linecap="round"/></svg>';
const MED2 = [
  { id:'tempo', c:'t', name:'Tempo de matilha', icons:['1M','3M','6M','1A','2A'], th:[4,13,26,52,104], unit:'semanas com check-in', src:'Conta pelo check-in diário', how:() => 'Faça check-in em 6 dos 7 dias. A folga pode ser qualquer dia.' },
  { id:'limite', c:'l', g:'treino', name:'Treino em dia', th:[2,6,12,24,48], unit:'semanas com os treinos em dia', src:'Conta pelos treinos finalizados (75% ou mais)', how:() => `Cumpra os seus treinos da semana (a sua meta: ${ME.freq || 3}x). Dia de descanso não conta contra.` },
  { id:'carga', c:'k', g:'treino', name:'Evolução de carga', th:W5, unit:'semanas aumentando carga', src:'Conta pelo treino: carga maior que a da última vez', how:() => 'Aumente a carga em algum exercício na semana.' },
  { id:'resist', c:'r', g:'treino', name:'Mais resistência', th:W5, unit:'semanas com a meta de cardio', src:'Conta pelo check-in diário: cardio', how:() => `Bata a sua meta de cardio da semana (a sua: ${cardioT()}x).` },
  { id:'alim', c:'a', g:'nutri', name:'Alimentação regular', th:W5, unit:'semanas seguindo o plano', src:'Conta pelas refeições marcadas no horário', how:() => 'Todas as refeições no horário em 6 dos 7 dias.' },
  { id:'agua', c:'w', g:'nutri', name:'Água em dia', th:W5, unit:'semanas com a meta de água', src:'Conta pelo check-in diário: água', how:() => `Bata a sua meta de água (${nf(waterL())} L) em 6 dos 7 dias.` },
  { id:'sono', c:'s', g:'nutri', name:'Sono regulado', th:W5, unit:'semanas dormindo 7h+', src:'Conta pelo check-in diário: horas de sono', how:() => 'Durma 7h ou mais em 6 das 7 noites.' },
  { id:'zero', c:'z', g:'nutri', name:'Zero fast food', th:E5, unit:'semanas sem fast food', src:'Conta pelo check-in diário: fast food e refeição livre', how:() => 'Fique 6 dos 7 dias sem fast food. A refeição livre usa a folga da semana.' },
  { id:'doce', c:'d', g:'nutri', name:'Zero doce', icon:DOCE_IC, th:E5, unit:'semanas sem doce', src:'Conta pelo check-in diário: doce', how:() => 'Fique 5 dos 7 dias sem doce fora do plano.' },
  { id:'perfeita', c:'p', secret:true, name:'Semana perfeita', th:E5, unit:'semanas perfeitas', src:'Segredo', how:() => 'Feche todas as suas medalhas da semana.' },
  { id:'destaque', name:'Destaque da equipe', th:[1,2,3,5,8], unit:'destaques', src:'Liberada pelo Sérgio', how:() => 'Liberada pela equipe por dedicação.' },
  { id:'recrutador', name:'Recrutador', th:[1,3,5,10,20], unit:'amigos que viraram alunos', src:'Conta pelos amigos que viraram alunos', how:() => 'Indique um amigo que vire aluno.' }
];
const medById = id => MED2.find(m => m.id === id);
// medalha fora do plano: aparece bloqueada com convite
const lockedM = m => (m.g === 'treino' && !hasTreino()) || (m.g === 'nutri' && !hasDieta());
const noGoal = m => m.id === 'resist' && !(cardioT() > 0);
const tierOf = (m, v) => { let t = -1; m.th.forEach((x, i) => { if (v >= x) t = i; }); return t; };
const SEASON2 = { name:'Primavera 26', from:'2026-09-21', to:'2026-12-20', goal:8 };

// carga: algum exercício com carga maior que a última vez que ele apareceu
function cargaUp(ws, we){
  const L = D.logs.filter(x => x.finished_at).sort((a, b) => a.day < b.day ? -1 : a.day > b.day ? 1 : 0);
  const best = {};
  for (const lg of L){
    let up = false;
    (lg.sets || []).forEach(e => { const k = e.uid || e.name, mx = Math.max(0, ...(e.sets || []).filter(s => s[2]).map(s => +s[0] || 0)); if (!mx) return;
      if (best[k] && mx > best[k] && lg.day >= ws && lg.day <= we) up = true; best[k] = mx; });
    if (up) return true;
  }
  return false;
}
function weekRes(ws){
  const s = weekStats(ws), we = addDays(ws, 6), f = {};
  f.tempo = s.ci.d >= 6; f.limite = s.limite.d >= s.limite.t; f.resist = s.resist.t > 0 && s.resist.d >= s.resist.t;
  f.carga = cargaUp(ws, we); f.alim = s.alim.d >= 6; f.agua = s.agua.d >= 6; f.sono = s.sono.d >= 6; f.zero = s.zero.d >= 6; f.doce = s.doce.d >= 5;
  const av = MED2.filter(m => m.c && m.id !== 'perfeita' && !lockedM(m) && !noGoal(m));
  f.perfeita = av.length > 0 && av.every(m => f[m.id]);
  const v = D.logs.filter(x => x.day >= ws && x.day <= we && x.finished_at).reduce((a, x) => a + (+x.volume_kg || 0), 0);
  return { f:MED2.filter(m => m.c && f[m.id]).map(m => m.c).join(''), ci:s.ci.d, v:Math.round(v) };
}
// congelamento: semana dentro da pausa (até 35 dias antes do fim) não tira progresso
const pausedWeek = ws => !!(ST.pauseUntil && ws <= ST.pauseUntil && ws >= addDays(ST.pauseUntil, -35));

// tudo é recalculado aqui: medalhas, ciclos, level. O resultado vai para profiles.stats (o ranking lê de lá).
let CALC = null;
function calc(extraDaily){
  const st0 = ME.stats || {}, wk = Object.assign({}, st0.wk || {}), cy = Object.assign({}, st0.cy || {});
  const t = TODAY(), cws = weekStart(t), since = addDays(t, -84), full = addDays(weekStart(since), 7);
  const saveD = D.daily; if (extraDaily) D.daily = [...D.daily, extraDaily];
  for (let ws = full; ws <= cws; ws = addDays(ws, 7)){ const r = weekRes(ws); if (r.ci || r.f || r.v) wk[ws] = r; else delete wk[ws]; }
  const firstD = D.daily.map(x => x.day).sort()[0];
  const first = [st0.first, firstD].filter(Boolean).sort()[0] || null;
  // medalhas: +1 semana quando bate a meta; semana inteira sem check-in tira 1 semana; congelamento pausa
  const V = {}; MED2.forEach(m => V[m.id] = 0);
  if (first) for (let ws = weekStart(first); ws <= cws; ws = addDays(ws, 7)){
    const r = wk[ws];
    if (!r || !r.ci){ if (ws !== cws && !pausedWeek(ws)) MED2.forEach(m => { if (m.c) V[m.id] = Math.max(0, V[m.id] - 1); }); continue; }
    MED2.forEach(m => { if (m.c && r.f.includes(m.c)) V[m.id]++; });
  }
  V.recrutador = ST.recruits || 0;
  const aw = id => Math.max(-1, ...(ST.awards || []).filter(x => x.medal_id === id).map(x => +x.tier));
  const T = {}; MED2.forEach(m => { T[m.id] = Math.max(tierOf(m, V[m.id]), aw(m.id)); if (lockedM(m) || noGoal(m)) T[m.id] = -1; });
  // ciclos de 4 semanas desde a entrada; cumprido com 75% da meta
  const created = (ME.created_at || t).slice(0, 10), c0 = weekStart(created);
  const tr = hasTreino(), target = tr ? (ME.freq || 3) * 4 : 24, minC = Math.ceil(target * .75);
  let cycles = 0, curPct = 0, curDone = 0, curStart = c0;
  for (let cs = c0; cs <= t; cs = addDays(cs, 28)){
    const ce = addDays(cs, 27), inWin = ce >= since;
    let done = inWin || cy[cs] === undefined ? (tr ? trainDays(cs, ce) : dailyIn(cs, ce).length) : cy[cs];
    if (inWin) cy[cs] = done;
    if (ce < t){ if (done >= minC) cycles++; }
    else { curPct = Math.min(100, Math.round(done / target * 100)); curDone = done; curStart = cs; }
  }
  const cycReal = cycles; cycles = Math.max(0, cycles + (ME.level_bonus || 0));
  let lv = 0; CYC.forEach((x, i) => { if (cycles >= x) lv = i; });
  const pr = (ST.prestige && ST.prestige.lv) || 0;
  // % da semana: média das metas da semana (cada uma até 100%)
  const ws0 = weekStats(cws), keys = ['ci', ...(tr ? ['limite'] : []), ...(tr && cardioT() > 0 ? ['resist'] : []), ...(hasDieta() ? ['alim','agua','sono','zero','doce'] : [])];
  const weekPct = Math.round(keys.reduce((a, k) => a + Math.min(1, ws0[k].d / ws0[k].t), 0) / keys.length * 100);
  const kg = Object.values(wk).reduce((a, r) => a + (r.v || 0), 0) + (st0.kg0 || 0);
  if (extraDaily) D.daily = saveD;
  return { V, T, wk, cy, first, cycles, cycReal, lv, pr, curPct, curDone, curStart, target, minC, weekPct, kg };
}
function myLv(){ const c = CALC || calc(); return c.pr > 0 ? 5 : c.lv; }
function persistStats(){
  CALC = calc();
  const c = CALC, st0 = ME.stats || {};
  const stats = { lv:c.lv, cycles:c.cycles, cyc_real:c.cycReal, cycle_pct:c.curPct, week_pct:c.weekPct, kg:c.kg, kg0:st0.kg0 || 0, first:c.first, wk:c.wk, cy:c.cy };
  const m = {}; MED2.forEach(x => { if (c.T[x.id] >= 0) m[x.id] = c.T[x.id]; });
  const snap = { lv:c.lv, pr:c.pr, m };
  if (JSON.stringify(stats) === JSON.stringify(st0) && JSON.stringify(snap) === JSON.stringify(ME.case_snap || {})) return;
  ME.stats = stats; ME.case_snap = snap; try { localStorage.setItem('cc-me', JSON.stringify(ME)); } catch(e){}
  qAdd({ kind:'update', t:'profiles', row:{ stats, case_snap:snap }, id:ME.id, merge:true });
}

/* ---------- MATILHA ---------- */
const RK = { mode:'semana', rows:lsGet('cc2-rank', null), mot:[], at:0 };
async function loadRank(){
  try {
    const [r, mm] = await Promise.all([sb.rpc('ranking2'), sb.rpc('my_motivators')]);
    if (!r.error){ RK.rows = r.data || []; lsSet('cc2-rank', RK.rows); }
    if (!mm.error) RK.mot = (mm.data || []).map(x => x.name);
    RK.at = Date.now();
  } catch(e){}
  if (S.tab === 'matilha' || S.tab === 'hoje') draw();
}
const avatar = (lv, size) => RA.emblem(lv, false, size);
const rowLv = r => r.prestige_lv > 0 ? 5 : Math.min(4, r.lv || 0);
const lvTxt = r => r.prestige_lv > 0 ? 'Prestígio ' + '★'.repeat(r.prestige_lv) : LVN[Math.min(4, r.lv || 0)];
const sinceTxt = d => d ? `${['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][+d.slice(5, 7) - 1]}/${d.slice(0, 4)}` : '';
function motLine(){ return ME.mot_on !== false && RK.mot.length ? `<span class="mot-line"><i>${'★'.repeat(Math.min(5, RK.mot.length))}</i> ${esc2(RK.mot.slice(0, 3).join(' e '))}${RK.mot.length > 3 ? ` e mais ${RK.mot.length - 3}` : ''} te ${RK.mot.length > 1 ? 'motivaram' : 'motivou'} hoje</span>` : ''; }
function rankList(){
  const rows = RK.rows;
  if (!rows) return '<p class="meta">Carregando o ranking…</p>';
  const me = rows.find(r => r.is_me), myL = me ? rowLv(me) : myLv();
  let list = rows.filter(r => RK.mode !== 'div' || rowLv(r) === myL);
  const key = RK.mode === 'geral' ? 'cycles' : RK.mode === 'div' ? 'cycle_pct' : 'week_pct';
  list = [...list].sort((a, b) => (b[key] - a[key]) || (rowLv(a) - rowLv(b)) || ((b.since || '') > (a.since || '') ? 1 : -1));
  const note = RK.mode === 'semana' ? '% das metas desta semana. Empate: quem está num level mais baixo e chegou mais recente fica na frente.' : RK.mode === 'div' ? `Divisão ${LVN[myL]}: só quem está no mesmo level que você. % da meta do ciclo.` : 'Ciclos cumpridos desde que entrou.';
  return `<p class="meta" style="font-size:12.5px;margin:4px 0 2px">${note}</p>` + (list.length ? list.map((r, k) => `<div class="r${r.is_me ? ' me' : ''}" data-who="${r.id}" role="button" tabindex="0"><span class="pos">${k + 1}</span>${avatar(rowLv(r), 48)}<span style="min-width:0"><b>${esc2(r.name)}${r.is_me ? ' (você)' : ''}${r.instagram ? ` <small style="display:inline;font-weight:700">@${esc2(r.instagram)}</small>` : ''}${r.mot_today ? `<i class="rk-star">★${r.mot_today}</i>` : ''}</b><small>${lvTxt(r)}. ${RK.mode === 'geral' ? r.cycles + ' ciclos cumpridos.' : RK.mode === 'div' ? r.cycle_pct + '% da meta do ciclo.' : r.week_pct + '% da meta da semana.'}</small></span></div>`).join('') : '<p class="meta">Ninguém por aqui ainda.</p>')
    + (ME.rank_opt === false ? '<p class="meta" style="font-size:13px;margin:8px 0 0">Você está oculto no ranking. Só você vê sua posição.</p>' : '');
}
function caseHead(){
  const c = CALC || calc(), ms = MED2.filter(m => !noGoal(m)), got = ms.filter(m => c.T[m.id] >= 0).length, rare = ms.filter(m => c.T[m.id] >= 3).length;
  return `<span><b class="d">${myLv() + 1}/6</b><small>insígnias</small></span><span><b class="d">${got}/${ms.length}</b><small>medalhas</small></span><span><b class="d">${rare}</b><small>raras</small></span>`;
}
function medTile(m){
  const c = CALC || calc(), t = c.T[m.id], v = c.V[m.id] || 0, nx = m.th[t + 1], lk = lockedM(m);
  const sub = lk ? `🔒 Plano de ${m.g === 'nutri' ? 'dieta' : 'treino'}` : noGoal(m) ? 'Sem meta no seu plano' : t < 0 ? (m.secret ? 'Medalha secreta' : `${v} de ${m.th[0]} pro Ferro`) : TIERS2[t];
  return `<button class="cm${lk || noGoal(m) ? ' lock' : ''}" data-rmed="${m.id}">${RA.disc(m, lk ? -1 : t).replace('class="rdisc', 'style="--s:78px" class="rdisc')}<b>${m.secret && t < 0 ? '???' : m.name}</b><small>${sub}</small><div class="bar"><i style="width:${lk ? 0 : Math.round((nx ? Math.min(1, v / nx) : 1) * 100)}%"></i></div></button>`;
}
function vMatilha(){
  const c = CALC || calc(), cur = myLv(), nx = CYC[cur + 1];
  const perk = (cur < 5 ? RA.LEVELS[cur] : RA.PRESTIGE).perks[0];
  const inS = TODAY() >= SEASON2.from && TODAY() <= SEASON2.to, sc = D.closes.filter(x => x.week_start >= SEASON2.from && x.week_start <= SEASON2.to && !x.auto).length;
  const hall = (RK.rows || []).filter(r => r.prestige_lv > 0);
  return `<div class="hero"><span class="motto">Resultados constroem liberdade</span><h2 class="d">Minha matilha</h2><p class="sub">Seu level, o ranking e o seu estojo.</p>${motLine()}</div>
    <div class="jump"><button data-jump="sec-lvh">Level</button><button data-jump="sec-rk">Ranking</button><button data-jump="sec-case">Estojo</button></div>
    <div class="block ink lv-hero" id="sec-lvh"><button data-lvcard="${cur}" style="display:grid;place-items:center" aria-label="Ver level ${LVN[cur]}">${RA.emblem(cur, false, 92)}</button>
      <div style="min-width:0"><span class="lbl">Meu level</span><p class="d" style="font-size:48px;margin:4px 0 10px">${LVN[cur]}${c.pr > 0 ? ' ' + '★'.repeat(c.pr) : ''}</p>
        ${nx !== undefined && cur < 5 ? `<div class="bar"><i style="width:${Math.round(Math.min(1, c.cycles / nx) * 100)}%"></i></div><p class="meta" style="font-size:13px">${c.cycles} de ${nx} ciclos para ${LVN[cur + 1]}</p>` : cur === 4 ? '<p class="meta" style="font-size:13px">Topo da matilha. Próximo passo: Prestígio.</p>' : ''}
        <p style="font-size:13px;font-weight:800;margin:6px 0 0">Benefício: ${esc2(perk)}</p></div></div>
    ${hasTreino() ? `<div class="block frost"><div class="row"><span class="lbl">Ciclo atual</span><span class="pill">${c.curPct}%</span></div><div class="bar" style="margin-top:12px"><i style="width:${c.curPct}%"></i></div>
      <p class="meta" style="font-size:13px">${c.curDone} de ${c.target} treinos. O ciclo conta com ${c.minC} (75% da sua meta de ${ME.freq || 3}x por semana).</p></div>` : ''}
    ${hall.length ? `<div class="sec-h"><span class="d">Hall da matilha</span></div><div id="hall">${hall.map(r => `<div class="hrow" data-who="${r.id}" role="button" tabindex="0">${avatar(5, 60)}<div><b>${esc2(r.name)}</b><small>Prestígio ${'★'.repeat(r.prestige_lv)} • ${r.cycles} ciclos</small></div></div>`).join('')}</div>` : ''}
    <div class="sec-h" id="sec-rk"><span class="d">Ranking</span></div>
    ${hasTreino() ? `<div class="seg three" id="rk-mode" role="tablist">${[['semana','Semana'],['div','Divisão'],['geral','Geral']].map(([k, l]) => `<button role="tab" aria-selected="${RK.mode === k}" data-rk="${k}">${l}</button>`).join('')}</div>
    <div id="rk-list">${rankList()}</div>
    <label class="rk-opt"><input type="checkbox" data-rkme ${ME.rank_opt !== false ? 'checked' : ''}> <span>Aparecer no ranking</span></label>` : '<p class="meta">O ranking é dos alunos com plano de treino.</p>'}
    <button class="btn wide" data-prof-edit>Editar meu perfil no ranking</button>
    <div class="block ink"><div class="row"><span class="lbl">Temporada ${SEASON2.name}</span><span class="pill">${Math.min(sc, SEASON2.goal)} de ${SEASON2.goal}</span></div>
      <div class="bar" style="margin-top:12px"><i style="width:${Math.min(100, sc / SEASON2.goal * 100)}%"></i></div>
      <p class="meta" style="font-size:13px">${sc >= SEASON2.goal ? 'Medalha da temporada conquistada ✓ Edição limitada.' : `${SEASON2.goal} semanas fechadas até o fim da temporada • medalha de edição limitada • ${inS ? `faltam ${diffDaysIdx(TODAY(), SEASON2.to)} dias` : 'encerrada'}`}</p></div>
    <div class="sec-h" id="sec-case"><span class="d">Estojo</span></div>
    <div class="case"><div class="casehead">${caseHead()}</div>
      <p class="casecap">Insígnias</p><div class="insig">${LVN.map((n, i) => `<button class="slot2${i <= cur ? ' on' : ''}" data-lvcard="${i}">${RA.emblem(i, i > cur, 56)}<span>${n}</span></button>`).join('')}</div>
      <p class="casecap">Medalhas</p><div class="cmed">${MED2.map(medTile).join('')}</div></div>
    <button class="btn wide" data-old="evolucao">Fotos de evolução</button>
    <button class="btn small" data-v2logout style="align-self:center;margin-top:8px">Sair da conta</button>`;
}
function lvCard(i){
  const c = CALC || calc(), cur = myLv(), L = i < 5 ? RA.LEVELS[i] : RA.PRESTIGE, lock = i > cur, got = i < cur, now = i === cur, need = CYC[i];
  let st, prog = '';
  if (got) st = '<span class="tag" style="background:var(--ok-bg);color:var(--ok)">Conquistado ✓</span>';
  else if (now) st = '<span class="tag" style="background:var(--fg);color:var(--bg)">Seu level atual</span>';
  else st = '<span class="tag" style="background:var(--frost);color:var(--muted)">🔒 Bloqueado</span>';
  if (lock && i < 5){ const f = need - c.cycles; prog = `<p style="font-weight:800;margin:0">Faltam ${f} ciclos cumpridos • uns ${f} meses</p><div class="bar" style="width:100%"><i style="width:${Math.round(c.cycles / need * 100)}%"></i></div><p class="meta" style="margin:0;font-size:13px">${c.cycles} de ${need} ciclos. Ciclo cumprido = 75% da sua meta de treinos em 4 semanas.</p>`; }
  if (i === 5 && lock) prog = '<p style="font-weight:800;margin:0">Depois da Elite (24 ciclos), você pode prestigiar</p><p class="meta" style="margin:0;font-size:13px">Depois, uma estrela nova a cada 6 ciclos cumpridos.</p>';
  if (now && i < 4){ const nx = CYC[i + 1]; prog = `<p style="font-weight:800;margin:0">${c.cycles} ciclos cumpridos • próximo: ${LVN[i + 1]} em ${nx}</p><div class="bar" style="width:100%"><i style="width:${Math.round(c.cycles / nx * 100)}%"></i></div>`; }
  if (got) prog = `<p class="meta" style="margin:0;font-size:13px">Você chegou aqui com ${need} ciclos cumpridos.</p>`;
  const req = i === 0 ? 'Entrada na matilha' : i < 5 ? `${need} ciclos cumpridos • ${need >= 12 ? (need === 12 ? 'cerca de 1 ano' : 'cerca de 2 anos') : 'uns ' + need + ' meses'}` : 'Depois da Elite';
  sheet2(`<div class="lvcard prof"><div style="display:grid;place-items:center;padding:8px 0">${RA.emblem(i, lock, 150)}</div>${st}<p class="d" style="font-size:52px;margin:0">${LVN[i]}</p><span class="lbl">${req}</span>${prog}
    <div class="block frost" style="width:100%;text-align:left;margin-top:6px"><span class="lbl">O que você ganha</span><ul>${L.perks.map(p => `<li><i>${lock ? '🔒' : '✓'}</i><span>${esc2(p.replace('a cada 6 meses de treino', 'a cada 6 ciclos cumpridos'))}</span></li>`).join('')}</ul></div></div>`);
}
function medHTML(id, show){
  const c = CALC || calc(), m = medById(id), t = c.T[id], v = c.V[id] || 0, nx = m.th[t + 1], lk = lockedM(m);
  const pv = show !== undefined ? show : Math.max(0, t), preview = pv > t, pl = m.g === 'nutri' ? 'dieta' : 'treino';
  const status = lk ? 'Não disponível no seu plano' : noGoal(m) ? 'Sem meta de cardio no seu plano' : t < 0 ? 'Ainda não desbloqueada' : `Tier ${TIERS2[t]}`;
  const up = lk ? `<div class="upsell"><b>🔒 Medalha do plano de ${pl}</b><p>Quer ganhar essa medalha? Assine o plano de ${pl} e ela entra no seu estojo.</p><a class="btn solid small" target="_blank" rel="noopener" href="${wa(CFG.whatsapp, `Oi! Sou ${firstName(ME.name)}, da Chames Crew. Quero conhecer o plano de ${pl}.`)}">Quero o plano de ${pl}</a></div>` : '';
  const auto = m.c || m.id === 'recrutador';
  const prog = !auto ? '' : nx !== undefined ? `<p style="margin:14px 0 6px">${v} de ${nx} ${m.unit} pro ${TIERS2[t + 1]}.</p><div class="bar" style="width:100%;max-width:280px;margin:0 auto"><i style="width:${Math.round(Math.min(1, v / nx) * 100)}%"></i></div>` : '<p style="margin:14px 0 0;font-weight:800">Diamante. O máximo dessa medalha.</p>';
  return `<div class="unlock" style="text-align:center"><div style="display:grid;place-items:center;padding:6px 0">${RA.disc(m, lk ? -1 : pv).replace('class="rdisc', 'style="--s:150px" class="rdisc')}</div>
    ${preview ? `<span class="ms-prev">Prévia: ${TIERS2[pv]}</span>` : ''}
    <p class="d" style="font-size:44px;margin:10px 0 4px">${m.secret && t < 0 ? 'Medalha secreta' : m.name}</p><p style="font-weight:800;margin:0">${status}</p>
    <p style="font-weight:700;margin:12px 0 0">Como ganhar: ${m.secret && t < 0 ? 'ninguém conta. Continua firme…' : m.how()}</p>
    ${up}${lk || noGoal(m) ? '' : prog}<span class="ms-src">${m.src}</span>
    ${m.c ? '<p class="meta" style="font-size:12.5px;margin:10px auto 0;max-width:36ch">As semanas não precisam ser seguidas: vale a constância. Uma semana inteira sem check-in tira 1 semana do progresso. Se cair abaixo do material atual, a medalha volta um material. Congelamento e viagem pausam tudo.</p>' : ''}
    ${lk ? '' : `<div class="ms-strip">${TIERS2.map((x, j) => `<button data-rmed-t="${id}:${j}" aria-pressed="${j === pv}">${RA.disc(m, j).replace('class="rdisc', 'style="--s:46px' + (j > t ? ';opacity:.55' : '') + '" class="rdisc')}<b>${x}</b><small>${m.th[j]}</small></button>`).join('')}</div>
    <p class="meta" style="font-size:12.5px;margin:8px 0 0">Toque num material para ver como ele fica.</p>`}</div>`;
}
function medSheet(id, show){ const open = root.querySelector('.scrim .ms-host'); if (open){ open.innerHTML = medHTML(id, show); return; } sheet2(`<div class="ms-host">${medHTML(id, show)}</div>`); }
const EQUIV = [[500,'piano de cauda','pianos de cauda'],[1200,'carro popular','carros populares'],[1500,'hipopótamo','hipopótamos'],[2700,'caminhonete','caminhonetes'],[6000,'elefante africano','elefantes africanos'],[8000,'tiranossauro rex','tiranossauros rex'],[13000,'ônibus','ônibus'],[30000,'carreta carregada','carretas carregadas'],[45000,'trio elétrico','trios elétricos'],[60000,'tanque de guerra','tanques de guerra'],[100000,'foguete Falcon 9 abastecido','foguetes Falcon 9 abastecidos'],[150000,'baleia-azul','baleias-azuis'],[180000,'Boeing 747','Boeings 747'],[204000,'Estátua da Liberdade','Estátuas da Liberdade'],[635000,'Cristo Redentor','Cristos Redentores'],[7300000,'Torre Eiffel','Torres Eiffel']];
function equivOf(kg, k){ const L = EQUIV.filter(([w]) => kg / w >= 1 && kg / w <= 60).map(([w, a, b]) => { const q = kg / w, n = q >= 10 ? Math.round(q) : Math.round(q * 10) / 10; return `${nf(n)} ${n >= 2 ? b : a}`; }); return L.length ? L[(k || 0) % L.length] : 'quase um piano de cauda'; }
function miniCase(r){
  const snap = r.case_snap || {}, me = r.is_me;
  if (!r.show_case && !me) return '';
  const lv = snap.pr > 0 ? 5 : Math.min(4, snap.lv || 0);
  const ins = LVN.map((n, i) => `<div class="pc-ins${i <= lv ? '' : ' off'}${i === lv ? ' cur' : ''}">${RA.emblem(i, i > lv, i === lv ? 50 : 40)}<small>${i === lv ? n : '&nbsp;'}</small></div>`).join('');
  const meds = Object.entries(snap.m || {}).map(([id, t]) => [medById(id), +t]).filter(([m, t]) => m && t >= 0).sort((x, y) => y[1] - x[1]);
  const cnt = [4, 3, 2, 1, 0].map(t => [t, meds.filter(x => x[1] === t).length]).filter(x => x[1]);
  return `<div class="pcase"><div class="pc-h"><span class="lbl">Insígnias</span><span class="pc-n">${lv + 1} de 6</span></div><div class="pc-track"><i style="width:${lv / 5 * 100}%"></i></div><div class="pc-insg">${ins}</div>
    <div class="pc-h" style="margin-top:16px"><span class="lbl">Medalhas</span><span class="pc-n">${meds.length}</span></div>
    <div class="pc-tiers">${cnt.map(([t, n]) => `<span class="pc-t t${t}"><i></i>${n} ${TIERS2[t]}</span>`).join('')}</div>
    <div class="pc-medg">${meds.map(([m, t]) => `<span class="pc-m" title="${m.name} • ${TIERS2[t]}">${RA.disc(m, t).replace('class="rdisc', 'style="--s:40px" class="rdisc')}</span>`).join('')}</div>
    ${me && !r.show_case ? '<p class="meta" style="font-size:12.5px;margin:10px 0 0">Oculto para a matilha. Só você vê.</p>' : ''}</div>`;
}
function profSheet(id){
  let r = (RK.rows || []).find(x => x.id === id);
  if (!r && id === ME.id){ const c = CALC || calc(); r = { id, is_me:true, name:firstName(ME.name), lv:c.lv, prestige_lv:c.pr, cycles:c.cycles, cycle_pct:c.curPct, since:(ME.created_at || '').slice(0, 10), instagram:ME.show_ig ? ME.instagram : null, kg:ME.show_kg ? c.kg : null, case_snap:ME.case_snap, show_case:ME.show_case, mot_today:0 }; }
  if (!r) return;
  const me = r.is_me, nm = esc2(r.name);
  sheet2(`<div class="prof"><div style="padding:14px 0 6px">${avatar(rowLv(r), 136)}</div>
    <p class="d" style="font-size:40px;margin:4px 0 0">${nm}${me ? ' (você)' : ''}</p><span class="lbl">${lvTxt(r)}${r.since ? ' • no time desde ' + sinceTxt(r.since) : ''}</span>
    ${r.instagram ? `<a class="ig" href="https://instagram.com/${encodeURIComponent(r.instagram)}" target="_blank" rel="noopener">@${esc2(r.instagram)}</a>` : ''}
    <div class="pgrid"><div><small>Ciclos cumpridos</small><b>${r.cycles}</b></div><div><small>Este ciclo</small><b>${r.cycle_pct}%</b></div></div>
    ${miniCase(r)}
    ${r.kg ? `<div class="equiv" role="button" tabindex="0" data-eq="${+r.kg}"><small style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.7">Já levantou</small><b>${(r.kg / 1000).toLocaleString('pt-BR', { maximumFractionDigits:1 })} toneladas</b><span style="font-weight:700" class="eqt">o mesmo que ${equivOf(r.kg, 0)}</span><small style="display:block;font-size:11.5px;opacity:.6;margin-top:4px">toque para outra comparação</small></div>` : ''}
    ${me ? motLine() + '<button class="btn solid wide" data-prof-edit>Editar meu perfil</button>' : `<button class="mot-btn" data-mot="${r.id}" ${r.mot_from_me ? 'disabled' : ''}>${r.mot_from_me ? `★ Você motivou ${nm} hoje` : `★ Dar a motivação do dia para ${nm}`}</button><p class="meta" style="font-size:12.5px;margin:0">${r.mot_today || 0} ${(r.mot_today === 1 ? 'pessoa motivou' : 'pessoas motivaram')} ${nm} hoje. Uma estrelinha por pessoa, por dia.</p>`}</div>`);
}
function profEdit(){
  sheet2(`<span class="lbl">Meu perfil no ranking</span><p class="d" style="font-size:38px;margin:6px 0 10px">Como a matilha te vê</p>
    <div style="display:grid;place-items:center;padding:6px 0 4px">${RA.emblem(myLv(), false, 110)}</div>
    <div class="field" style="margin-top:10px"><label for="pe-ig" style="font-weight:800;font-size:14px">Instagram (opcional)</label><input class="inp" id="pe-ig" placeholder="seu.perfil" value="${esc2(ME.instagram || '')}" autocapitalize="off" autocomplete="off"></div>
    <label class="agree"><input type="checkbox" id="pe-sig" ${ME.show_ig ? 'checked' : ''}> Mostrar meu Instagram</label>
    <label class="agree" style="margin-top:8px"><input type="checkbox" id="pe-mot" ${ME.mot_on !== false ? 'checked' : ''}> Ver a motivação dos amigos</label>
    <label class="agree" style="margin-top:8px"><input type="checkbox" id="pe-skg" ${ME.show_kg ? 'checked' : ''}> Mostrar quantos quilos já levantei</label>
    <label class="agree" style="margin-top:8px"><input type="checkbox" id="pe-scase" ${ME.show_case ? 'checked' : ''}> Mostrar meu estojo (insígnias e medalhas)</label>
    <label class="agree" style="margin-top:8px"><input type="checkbox" id="pe-rk" ${ME.rank_opt !== false ? 'checked' : ''}> Aparecer no ranking</label>
    <p class="meta" style="font-size:12.5px;margin:8px 0 0">Aluno novo começa com tudo oculto. Você escolhe o que a matilha vê.</p>
    <button class="btn solid wide" style="margin-top:14px" id="pe-ok">Salvar</button>`, sh => {
    sh.querySelector('#pe-ok').onclick = async () => {
      const ig = sh.querySelector('#pe-ig').value.trim().replace(/^@/, '').replace(/[^\w.]/g, '').slice(0, 30);
      const upd = { instagram:ig || null, show_ig:sh.querySelector('#pe-sig').checked && !!ig, mot_on:sh.querySelector('#pe-mot').checked, show_kg:sh.querySelector('#pe-skg').checked, show_case:sh.querySelector('#pe-scase').checked, rank_opt:sh.querySelector('#pe-rk').checked };
      Object.assign(ME, upd); if (ST) ST.rankOpt = upd.rank_opt; try { localStorage.setItem('cc-me', JSON.stringify(ME)); } catch(e){}
      qAdd({ kind:'update', t:'profiles', row:upd, id:ME.id }); sh.remove(); toast2('Perfil salvo'); draw(); setTimeout(loadRank, 800);
    };
  });
}
async function giveMot(id, btn){
  btn.disabled = true;
  const r = (RK.rows || []).find(x => x.id === id);
  try { const { error } = await sb.from('motivations').insert({ from_user:ME.id, to_user:id, day:TODAY() });
    if (error && !/duplicate|23505/i.test((error.message || '') + error.code)) throw error;
    if (r){ r.mot_from_me = true; r.mot_today = (r.mot_today || 0) + 1; lsSet('cc2-rank', RK.rows); }
    btn.closest('.scrim').remove(); draw(); profSheet(id); toast2(`★ ${r ? r.name : 'Seu amigo'} vai receber sua motivação`);
  } catch(e){ btn.disabled = false; toast2('Sem internet agora. Tente de novo daqui a pouco.'); }
}

/* animação depois do check-in do dia: o que andou em cada medalha */
function medalRun(before, after, ans){
  const ws = weekStart(TODAY()), W = weekStats(ws), el = Math.min(7, diffDaysIdx(ws, TODAY()) + 1);
  const R = [['tempo','ci', () => true, ok => ok ? `Check-in feito: ${W.ci.d} de 6 na semana.` : ''],
    ['limite','limite', () => ans[0] === 0, ok => ans[0] === 2 ? 'Dia de descanso planejado. Não conta contra você.' : ok ? `Treino de hoje: ${Math.min(W.limite.d, W.limite.t)} de ${W.limite.t} na semana.` : `Sem treino hoje. Faltam ${Math.max(0, W.limite.t - W.limite.d)} na semana.`],
    ['resist','resist', () => ans[3] > 0, ok => ok ? `Cardio de hoje: ${Math.min(W.resist.d, W.resist.t)} de ${W.resist.t}${W.resist.d > W.resist.t ? ` (já são ${W.resist.d})` : ''}.` : `Sem cardio hoje. Faltam ${Math.max(0, W.resist.t - W.resist.d)} na semana.`],
    ['zero','zero', () => ans[4] === 0, ok => ok ? `Sem fast food: ${W.zero.d} de 6.` : `${ans[4] === 1 ? 'Refeição livre' : 'Fast food'} usou a folga da semana.`],
    ['doce','doce', () => ans[5] === 0, ok => ok ? `Sem doce: ${W.doce.d} de 5.` : 'Doce hoje: usou uma das 2 folgas da semana.'],
    ['agua','agua', () => ans[6] === 2, ok => ok ? `Meta de água: ${W.agua.d} de 6.` : 'Abaixo da meta de água: usou a folga da semana.'],
    ['sono','sono', () => ans[7] === 2, ok => ok ? `7h ou mais: ${W.sono.d} de 6 noites.` : 'Menos de 7h: usou a folga da semana.']];
  const items = R.map(([id, k, okf, why]) => { const m = medById(id); if (lockedM(m) || noGoal(m)) return null; const ok = okf(), w = W[k], dead = (el - w.d) > (7 - w.t);
    let txt = why(ok); if (!ok && dead && id !== 'limite') txt = txt.replace(/usou.*$/, 'e as folgas já tinham acabado. Essa semana não conta.');
    if (ok && w.d >= w.t) txt = txt.replace(/\.$/, '. Semana fechada ✓');
    return { m, txt, ok, w, t0:before.T[id], t1:after.T[id], v0:before.V[id] || 0, v1:after.V[id] || 0 }; }).filter(Boolean);
  const ups = items.filter(x => x.t1 > x.t0);
  const dots = (w, nox) => { const a = []; for (let i = 0; i < 7; i++) a.push(i < w.d ? 'on' : !nox && i < w.d + Math.max(0, el - w.d) ? 'x' : ''); return `<div class="wkd" aria-label="${w.d} de ${w.t} na semana">${a.map((c, i) => `<i class="${c}${i === w.t - 1 ? ' t' : ''}"></i>`).join('')}</div>`; };
  const row = (x, i) => { const target = x.m.th[x.t0 + 1] || x.m.th[4], up = x.t1 > x.t0, gain = x.v1 > x.v0, from = Math.min(100, x.v0 / target * 100), to = Math.min(100, x.v1 / target * 100);
    return `<div class="mi${up ? ' up' : ''}" style="animation-delay:${.25 + i * .45}s">${RA.disc(x.m, Math.max(0, x.t1)).replace('class="rdisc', 'style="--s:60px' + (x.t1 < 0 ? ';filter:grayscale(.7) brightness(.75)' : '') + '" class="rdisc')}
      <div style="min-width:0"><b>${x.m.name}</b><span class="why${x.ok ? '' : ' no'}">${x.txt}</span>${dots(x.w, ['limite','resist'].includes(x.m.id))}
      <div class="tr"><i data-to="${to}" class="${gain ? 'gain' : ''}" style="width:${from}%"></i></div>
      <div class="ct"><span>${up ? TIERS2[x.t1] + ' desbloqueado ✓' : x.t0 >= 0 ? TIERS2[x.t0] : 'Bloqueada'}</span><span>${gain ? '<em>+1 semana</em> • ' : ''}${x.v1} de ${target}${x.m.th[x.t0 + 1] ? ' pro ' + TIERS2[x.t0 + 1] : ''}</span></div></div></div>`; };
  const ov = document.createElement('div'); ov.className = 'mrun'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Suas medalhas hoje');
  ov.innerHTML = `<div class="in"><span class="kick">Check-in do dia</span><p class="ttl">Suas medalhas hoje</p>${items.map(row).join('')}<button class="go" style="animation-delay:${.4 + items.length * .45}s" data-mr-go>${ups.length ? 'Continuar' : 'Fechar'}</button></div>`;
  root.appendChild(ov);
  ov.querySelectorAll('.mi').forEach((e, i) => { const bar = e.querySelector('.tr i'); setTimeout(() => { bar.style.width = bar.dataset.to + '%'; }, (.55 + i * .45) * 1000); });
  ov.querySelector('[data-mr-go]').onclick = () => { ov.remove(); if (ups.length) lvUp(ups, 0); };
}
function lvUp(ups, k){
  const x = ups[k], el = document.createElement('div'); el.className = 'lvup'; el.setAttribute('role', 'dialog');
  const conf = Array.from({ length:26 }, (_, i) => `<i class="conf" style="left:${(i * 37) % 100}%;background:${['#f3d38a','#fff','#9fb6c9','#d98b98'][i % 4]};animation-delay:${(i % 9) * .12}s"></i>`).join('');
  el.innerHTML = `${conf}<div class="dw">${RA.disc(x.m, x.t1).replace('class="rdisc', 'style="--s:200px" class="rdisc')}</div><small>Medalha desbloqueada</small><h2>${x.m.name}</h2><div class="tier">Tier ${TIERS2[x.t1]}</div>
    <p>${x.v1} semanas no total. Próximo: ${TIERS2[x.t1 + 1] || 'máximo'}${x.m.th[x.t1 + 1] ? ' em ' + x.m.th[x.t1 + 1] : ''}.</p><button>${k < ups.length - 1 ? 'Próxima' : 'Continuar'}</button>`;
  root.appendChild(el); el.querySelector('button').onclick = () => { el.remove(); if (k < ups.length - 1) lvUp(ups, k + 1); };
}

/* ---------- desenhar ---------- */
function draw(){
  if (!root) return;
  if (S.tab === 'treino' && !hasTreino()) S.tab = 'hoje';
  if (S.tab === 'dieta' && !hasDieta()) S.tab = 'hoje';
  const body = S.tab === 'treino' ? vTreino() : S.tab === 'dieta' ? vDieta() : S.tab === 'checkin' ? vCheckin() : S.tab === 'matilha' ? vMatilha() : vHoje();
  const keep = [...root.querySelectorAll('.scrim,.toast')];
  root.innerHTML = `<style>${CSS2}</style>` + shell(body);
  keep.forEach(k => root.appendChild(k));
  renderPending();
}
let CSS2 = '';

/* ---------- eventos ---------- */
function bind(){
  root.addEventListener('click', ev => {
    const t = ev.target;
    const go = t.closest('[data-v2go]'); if (go){ S.tab = go.dataset.v2go; S.openSw = null; draw(); scrollTo(0, 0); if (S.tab === 'matilha' && Date.now() - RK.at > 60000) loadRank(); return; }
    const old = t.closest('[data-old]'); if (old){ openOld(old.dataset.old); return; }
    // matilha
    const rk = t.closest('[data-rk]'); if (rk){ RK.mode = rk.dataset.rk; draw(); const l = $r('#rk-mode'); l && l.scrollIntoView({ block:'start' }); return; }
    const jm = t.closest('[data-jump]'); if (jm){ const el = $r('#' + jm.dataset.jump); el && el.scrollIntoView({ behavior:'smooth', block:'start' }); return; }
    if (t.closest('[data-prof-edit]')){ const sc = t.closest('.scrim'); sc && sc.remove(); profEdit(); return; }
    const mo = t.closest('[data-mot]'); if (mo){ giveMot(mo.dataset.mot, mo); return; }
    const eq = t.closest('[data-eq]'); if (eq){ eq._k = (eq._k || 0) + 1; eq.querySelector('.eqt').textContent = 'o mesmo que ' + equivOf(+eq.dataset.eq, eq._k); return; }
    const rmt = t.closest('[data-rmed-t]'); if (rmt){ const [id, j] = rmt.dataset.rmedT.split(':'); medSheet(id, +j); return; }
    const rm = t.closest('[data-rmed]'); if (rm){ medSheet(rm.dataset.rmed); return; }
    const lc = t.closest('[data-lvcard]'); if (lc){ lvCard(+lc.dataset.lvcard); return; }
    const who = t.closest('[data-who]'); if (who){ profSheet(who.dataset.who); return; }
    const up = t.closest('[data-upd]'); if (up){ const u = lastUpd(), seen = lsGet(uidKey('visto'), {}), k = up.dataset.upd;
      if (k === 'treino' || k === 'ok') seen.tr = u.tr; if (k === 'dieta' || k === 'ok') seen.di = u.di; lsSet(uidKey('visto'), seen);
      if (k !== 'ok'){ S.tab = k; scrollTo(0, 0); } draw(); return; }
    if (t.closest('[data-v2invite]')){ invite(); return; }
    if (t.closest('[data-v2install]')){ unmount(); view = { screen:'install' }; window.scrollTo(0, 0); render(); return; }
    if (t.closest('[data-v2logout]')){ sb.auth.signOut().finally(() => { try { localStorage.removeItem('cc-me'); } catch(e){} location.reload(); }); return; }
    // treino
    const lt = t.closest('[data-letter]'); if (lt){ S.letter = lt.dataset.letter; draw(); return; }
    const ck = t.closest('[data-ck]'); if (ck){ const [i, s] = ck.dataset.ck.split(':').map(Number); onCheck(i, s, ck); return; }
    const op = t.closest('[data-open]'); if (op){ const i = +op.dataset.open, e = wOf(S.letter).exercises[i], r = runFor(S.letter);
      if (r.skip && r.skip[e.uid] && r.skip[e.uid].reason !== 'ocupado'){ delete r.skip[e.uid]; } r.open = e.uid; setRun(r); draw(); const a = $r(`[data-ex="${i}"]`); a && a.scrollIntoView({ block:'start' }); return; }
    const rp = t.closest('[data-rep]'); if (rp){ const i = +rp.dataset.rep, e = wOf(S.letter).exercises[i], prev = prevOf(S.letter, e), r = runFor(S.letter); if (!prev) return;
      if (!r.startedAt) r.startedAt = Date.now(); r.sets[e.uid] = targetsOf(e).map((_, s) => { const p = prev[s] || prev[prev.length - 1]; return [p[0], p[1], true]; }); delete r.open; setRun(r); draw(); toast2('Séries repetidas da última vez'); return; }
    const sk = t.closest('[data-skip]'); if (sk){ openSkip(+sk.dataset.skip); return; }
    if (t.closest('[data-finish]')){ finishTreino(); return; }
    if (t.closest('[data-v2sum]')){ const lg = D.logs.filter(x => x.day === TODAY() && x.finished_at).slice(-1)[0]; if (lg){ const W = wOf(lg.letter) || { title:'Treino ' + lg.letter };
      const n = lg.sets.reduce((a, e) => a + e.sets.filter(x => x[2]).length, 0), total = lg.sets.reduce((a, e) => a + e.sets.length, 0);
      showSummary(lg, { pct:total ? Math.round(n / total * 100) : 0, n, total, vol:lg.volume_kg || 0, recs:0, mins:lg.duration_min, W, cmp:lg.sets.map(e => ({ n:e.name, a:0, b:Math.max(0, ...e.sets.filter(x => x[2]).map(x => x[0] || 0)), done:e.sets.filter(x => x[2]).length, of:e.sets.length, ev:e.sets.reduce((a, x) => a + (x[2] ? (x[0]||0)*(x[1]||0) : 0), 0) })) }); } return; }
    if (t.closest('#rest-skip')){ clearInterval(restTimer); $r('#rest').hidden = true; return; }
    // dieta
    const sw = t.closest('[data-sw]'); if (sw){ S.openSw = S.openSw === sw.dataset.sw ? null : sw.dataset.sw; draw(); const el = $r(`[data-sw="${sw.dataset.sw}"]`); el && el.scrollIntoView({ block:'center' }); return; }
    const pk = t.closest('[data-pick]'); if (pk){ const [mi, ii, f, g] = pk.dataset.pick.split(':'); const all = lsGet(SWK(), {}); const meal = (D.diet.meals[+mi].items || [])[+ii];
      all[mi] = all[mi] || {}; if (f === meal.f) delete all[mi][ii]; else all[mi][ii] = { f, g:+g }; lsSet(SWK(), all); S.openSw = null; draw(); toast2('Troca aplicada'); return; }
    const mk = t.closest('[data-mark]'); if (mk){ const mi = +mk.dataset.mark, m = D.diet.meals[mi]; if (mealState(mi, m) !== 'open'){ toast2('Fora do horário desta refeição'); draw(); return; }
      const row = { user_id:ME.id, day:TODAY(), meal_idx:mi, swaps:(lsGet(SWK(), {})[mi]) || {}, done_at:new Date().toISOString() };
      qAdd({ kind:'upsert', t:'meal_logs', row, oc:'user_id,day,meal_idx', ign:true }); D.meals.push(row); saveCache(); persistStats(); draw(); toast2(`${m.name} marcado no horário ✓`); return; }
    // check-in
    const cm = t.closest('[data-cimode]'); if (cm){ S.ci = cm.dataset.cimode; draw(); return; }
    const qa = t.closest('[data-qa]'); if (qa){ const [i, j] = qa.dataset.qa.split(':').map(Number); S.ans[i] = j; qa.parentElement.querySelectorAll('.chip').forEach((c, k) => c.setAttribute('aria-pressed', k === j));
      const n = S.ans.filter(x => x !== undefined && x !== null).length; const c = root.querySelector('[data-cisend] + .meta'); if (c) c.textContent = `${n} de ${QD.length} respondidas`; return; }
    if (t.closest('[data-cisend]')){ if (QD.some((_, i) => S.ans[i] === undefined || S.ans[i] === null)){ toast2('Responda todas as perguntas para enviar'); return; }
      const row = { user_id:ME.id, day:TODAY(), answers:S.ans.slice(0, QD.length) };
      const before = calc(); qAdd({ kind:'upsert', t:'daily_checkins', row, oc:'user_id,day', ign:true }); D.daily.push(row); saveCache(); persistStats(); const ans = S.ans.slice(); S.ans = []; draw();
      try { medalRun(before, CALC, ans); } catch(e){ console.warn(e); toast2('Check-in do dia enviado ✓'); } return; }
    const pn = t.closest('[data-pain]'); if (pn){ S.pain = +pn.dataset.pain; pn.parentElement.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === pn)); return; }
    const cw = t.closest('[data-close-week]'); if (cw){ if (S.pain === undefined){ toast2('Responda se sentiu alguma dor'); return; }
      const v = parseFloat(($r('#w-peso').value || '').replace(',', '.')); const row = { user_id:ME.id, week_start:cw.dataset.closeWeek, weight_kg:v > 30 && v < 300 ? v : null, pain:S.pain, message:($r('#w-msg').value || '').trim() || null };
      qAdd({ kind:'upsert', t:'week_closes', row, oc:'user_id,week_start', ign:true }); D.closes.push(row); D.closes.sort((a, b) => a.week_start < b.week_start ? -1 : 1); saveCache(); persistStats(); S.pain = undefined; draw(); evoSheet(); return; }
    if (t.closest('[data-evo]')){ evoSheet(); return; }
  });
  root.addEventListener('change', ev => { const c = ev.target.closest('[data-rkme]'); if (!c) return; ME.rank_opt = c.checked; if (ST) ST.rankOpt = c.checked; try { localStorage.setItem('cc-me', JSON.stringify(ME)); } catch(e){}
    qAdd({ kind:'update', t:'profiles', row:{ rank_opt:c.checked }, id:ME.id }); toast2(c.checked ? 'Você aparece no ranking' : 'Você saiu do ranking'); setTimeout(loadRank, 800); });
  root.addEventListener('input', ev => { const k = ev.target.closest('[data-kg],[data-rp]'); if (!k) return; const [i, s] = (k.dataset.kg || k.dataset.rp).split(':').map(Number);
    const e = wOf(S.letter).exercises[i], r = runFor(S.letter), cur = (r.sets[e.uid] = r.sets[e.uid] || [])[s] || [null, null, false], v = readSet(i, s); r.sets[e.uid][s] = [v[0], v[1], cur[2]]; setRun(r); });
}
function invite(){
  const link = `${location.origin}/?ref=${ST.refCode}`;
  const txt = `Bora treinar comigo na Chames Crew? Entra pelo meu link: ${link}`;
  if (navigator.share){ navigator.share({ title:'Chames Crew', text:txt }).catch(() => {}); return; }
  window.open(wa('', txt).replace('wa.me/?', 'wa.me/?'), '_blank');
}

/* ---------- ligar e desligar ---------- */
function openOld(tab){ unmount(); view = { screen:'section', sec:PLANS[ST.plan], tab }; window.scrollTo(0, 0); render(); }
async function mount(){
  if (!ME || ME.role === 'equipe') return false;
  const app = document.getElementById('app');
  if (!host){ host = document.createElement('div'); host.id = 'v2'; app.parentNode.insertBefore(host, app); root = host.attachShadow({ mode:'open' }); bind(); }
  app.style.display = 'none'; host.style.display = '';
  try { const th = document.documentElement.getAttribute('data-theme'); if (th) host.setAttribute('data-theme', th); } catch(e){}
  if (!CSS2){ try { CSS2 = await (await fetch('/aluno.css', { cache:'no-cache' })).text(); } catch(e){ CSS2 = lsGet('cc2-css', ''); } if (CSS2) try { localStorage.setItem('cc2-css', JSON.stringify(CSS2)); } catch(e){} }
  if (!mounted){ mounted = true; qLoad(); draw(); await load(); persistStats(); flush(); loadRank(); }
  draw(); return true;
}
function unmount(){ if (host) host.style.display = 'none'; const app = document.getElementById('app'); if (app) app.style.display = ''; }
window.CC2 = { TACO, HM, FG, FGN, FGM, grOf, eqMix, subsOf, hmN, hmTxt, mac, fname, EXDB, EXFLAT, NRM, MET, linkGroups, esc2, nf, hh, shortDate, longDate, mtile, CHECK, TIERS2, MED2, CYC, LVN, lsGet, lsSet, uuid, QD, logPct, WDAY,
  css:async () => { if (!CSS2){ try { CSS2 = await (await fetch('/aluno.css', { cache:'no-cache' })).text(); } catch(e){ CSS2 = lsGet('cc2-css', ''); } if (CSS2) try { localStorage.setItem('cc2-css', JSON.stringify(CSS2)); } catch(e){} } return CSS2; } };
window.V2 = { mount, unmount, isOn:() => host && host.style.display !== 'none', reload:async () => { await load(); persistStats(); draw(); } };
})();
