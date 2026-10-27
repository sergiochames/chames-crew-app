const CFG = window.CC_CONFIG;
const SCALE = ['Zerada','Baixa','Ok','Boa','No talo'];
const Q = {
  treino: [
    {id:'freq', short:'Treinos', q:'Quantas vezes você treinou essa semana?', opts:['0','1','2','3','4','5','6','7'], num:true, dir:1},
    {id:'falta', short:'Motivo das faltas', q:'Se faltou algum treino, qual foi o motivo principal?', opts:['Não faltei','Tempo','Cansaço','Motivação','Dor'], dir:0},
    {id:'plano', short:'Treino seguido', q:'Conseguiu seguir o treino?', opts:['Pouco','Metade','Quase tudo','Tudo'], dir:1, win:'Disciplina tá pagando.'},
    {id:'carga', short:'Carga', q:'Aumentou a carga em algum exercício?', opts:['Diminuí','Mantive','Aumentei'], dir:1, win:'Força subindo.'},
    {id:'cardio', short:'Cardio', q:'Quantos cardios você fez?', opts:['Nenhum','1x','2x','3x ou mais'], dir:1, win:'Fôlego subindo.'},
    {id:'disp_treino', short:'Gás pra treinar', q:'Como tava seu gás pra treinar?', opts:SCALE, dir:1, win:'Isso é energia boa.'},
    {id:'esforco', short:'Intensidade', q:'Como foi a intensidade dos treinos?', opts:['Leve','Moderada','Pesada','No limite'], dir:0},
    {id:'dor', short:'Dor', q:'Sentiu alguma dor ou desconforto?', opts:['Nenhuma','Leve','Moderada','Forte'], dir:-1, win:'Corpo respondendo bem.'}
  ],
  nutri: [
    {id:'plano_alim', short:'Plano alimentar', q:'Seguiu o plano alimentar?', opts:['Pouco','Metade','Quase tudo','Tudo'], dir:1, win:'Constância é tudo.'},
    {id:'fastfood', short:'Fast food e delivery', q:'Quantas vezes comeu fast food ou pediu delivery?', opts:['Nenhuma','1x','2x','3x ou mais'], dir:-1, win:'Escolhas mais fortes.'},
    {id:'puladas', short:'Refeições puladas', q:'Quantas refeições você pulou na semana?', opts:['Nenhuma','1 a 2','3 a 4','5 ou mais'], dir:-1, win:'Rotina no eixo.'},
    {id:'frutas', short:'Frutas e verduras', q:'Quantas porções de frutas e verduras por dia?', opts:['Quase nada','1','2 a 3','4 ou mais'], dir:1, win:'Prato mais colorido.'},
    {id:'agua', short:'Água', q:'Quanta água você bebeu por dia?', opts:['Menos de 1 L','1 a 2 L','2 a 3 L','Mais de 3 L'], dir:1, win:'Hidratação em dia.'},
    {id:'alcool', short:'Álcool', q:'Em quantos dias bebeu álcool?', opts:['Nenhum','1 dia','2 dias','3 ou mais'], dir:-1, win:'Recuperação agradece.'},
    {id:'sono_h', short:'Horas de sono', q:'Quantas horas dormiu por noite?', opts:['Menos de 5h','5 a 6h','7 a 8h','Mais de 8h'], dir:1, win:'Seu corpo agradece.'},
    {id:'sono_q', short:'Qualidade do sono', q:'Como foi a qualidade do sono?', opts:SCALE, dir:1, win:'Dormir bem muda tudo.'},
    {id:'disposicao', short:'Disposição', q:'E a disposição no dia a dia?', opts:SCALE, dir:1, win:'Mais vida no dia.'},
    {id:'fome', short:'Controle da fome', q:'Como foi o controle da fome e da ansiedade?', opts:['Difícil','Ok','Tranquilo'], dir:1, win:'Cabeça no lugar.'},
    {id:'intestino', short:'Intestino', q:'Como tá o intestino?', opts:['Preso','Irregular','Regular'], dir:1, win:'Funcionando redondo.'}
  ],
  geral: [
    {id:'estresse', short:'Estresse', q:'Como foi o estresse da semana?', opts:['Baixo','Moderado','Alto','No limite'], dir:-1, win:'Mente mais leve.'}
  ]
};
const GROUP_NAME = { treino:'Treino', nutri:'Nutrição', geral:'Cabeça' };
const SECTIONS = {
  nutri:{ title:'Meu nutri', full:'Meu nutricionista', groups:['nutri','geral'], desc:'Alimentação, água e sono' },
  personal:{ title:'Meu personal', full:'Meu personal', groups:['treino','geral'], desc:'Frequência, carga e cardio' },
  coach:{ title:'Meu coach', full:'Meu coach', groups:['treino','nutri','geral'], desc:'Treino e nutrição juntos' }
};
const PLANS = { nutri:'nutri', treino:'personal', coach:'coach' };
const PLAN_LABEL = { nutri:'Só nutri', treino:'Só treino', coach:'Os dois' };
const LEVELS = [
  {name:'Recruta', treinos:0, semanas:0, when:'Início', perks:['Entrada na matilha', 'Seu primeiro lobo e a figurinha de boas-vindas']},
  {name:'Consistente', treinos:36, semanas:13, when:'Uns 3 meses', perks:['10% de desconto na renovação']},
  {name:'Atleta', treinos:72, semanas:26, when:'Uns 6 meses', perks:['10% de desconto na renovação', 'Brinde surpresa']},
  {name:'Casca Grossa', treinos:150, semanas:52, when:'Cerca de 1 ano', perks:['Kit Chames Crew: garrafa, creatina, barra de proteína e sachês de whey']},
  {name:'Elite', treinos:300, semanas:104, when:'Cerca de 2 anos', perks:['Um mês grátis', 'Kit Chames Crew completo']}
];
const PRESTIGE = { name:'Prestígio', when:'Depois da Elite', perks:['Seu nome no Hall da matilha', 'O lobo de cristal, que só quem fecha a matilha tem'] };
const PHYSICAL = { 2:'brinde surpresa', 3:'kit Chames Crew', 4:'kit Chames Crew' };
const LEVEL_DISCOUNT = { 1:10, 2:10, 4:100 };
const TIERS = ['Ferro','Aço','Ouro','Rubi','Diamante Negro'];
const W = [4,8,16,26,52];
const MEDALS = [
  {id:'tempo', cat:'Tempo', name:'Tempo de matilha', icons:['1M','3M','6M','1A','2A'], th:[4,13,26,52,104], unit:'semanas na matilha', val:st => weeksDone(st)},
  {id:'carga', cat:'Performance', g:'treino', name:'Evolução de carga', icon:'KG', th:W, unit:'semanas aumentando carga', test:a => a.carga === 2},
  {id:'resist', cat:'Performance', g:'treino', name:'Mais resistência', icon:'RES', th:W, unit:'semanas com 2+ cardios', test:a => a.cardio >= 2},
  {id:'limite', cat:'Performance', g:'treino', name:'Quebrou o limite', icon:'MAX', th:[2,6,12,24,48], unit:'semanas com 4+ treinos', test:a => a.freq >= 4},
  {id:'agua', cat:'Estilo de vida', g:'nutri', name:'Água em dia', icon:'H2O', th:W, unit:'semanas com 2 L ou mais', test:a => a.agua >= 2},
  {id:'alim', cat:'Estilo de vida', g:'nutri', name:'Alimentação regular', icon:'ALIM', th:W, unit:'semanas seguindo o plano', test:a => a.plano_alim >= 2},
  {id:'sono', cat:'Estilo de vida', g:'nutri', name:'Sono regulado', icon:'ZZZ', th:W, unit:'semanas dormindo 7h+', test:a => a.sono_h >= 2},
  {id:'zero', cat:'Estilo de vida', g:'nutri', name:'Zero fast food', icon:'ZERO', th:[2,6,12,24,48], unit:'semanas sem fast food', test:a => a.fastfood === 0},
  {id:'perfeita', cat:'Secretas', secret:true, name:'Semana perfeita', icon:'★', th:[1,3,6,12,24], unit:'semanas perfeitas', val:st => perfectWeeks(st)}
];
const RECRUIT = {id:'recrutador', cat:'Indicações', name:'Recrutador', icon:'+1', th:[1,3,5,10,20], unit:'amigos que viraram alunos', val:st => st.recruits || 0};
const SEASON = { id:'season', ...CFG.season, ends:new Date(CFG.season.end + 'T23:59:00-03:00') };

/* =====================================================================
   CHAMES CREW · app
   ===================================================================== */
const CONFIGURED = !!(CFG.supabaseUrl && /^https:\/\//.test(CFG.supabaseUrl) && CFG.supabaseKey && !CFG.supabaseKey.startsWith('COLE'));
const sb = CONFIGURED ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, storageKey:'cc-auth', storage:window.localStorage } }) : null;
const $ = s => document.querySelector(s);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const first = n => (n || '').trim().split(' ')[0];
const params = new URLSearchParams(location.search);
try { if (params.get('convite')) localStorage.setItem('cc-convite', params.get('convite')); } catch(e){}
const savedInvite = () => { try { return params.get('convite') || localStorage.getItem('cc-convite') || ''; } catch(e){ return params.get('convite') || ''; } };
const isStandalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = () => /android/i.test(navigator.userAgent);
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (view.screen === 'install') render(); });
const wa = (num, text) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
const meName = () => first((ST && ST.name) || (ME && ME.name) || '');

let ME = null;        // perfil logado
let ST = null;        // aluno montado (para o aluno logado)
let TEAM = null;      // dados do painel da equipe
let view = { screen:'loading' };
let overlay = null, queue = [];

/* ---------- datas no fuso de Brasília ---------- */
function brToday(){ return new Intl.DateTimeFormat('en-CA', { timeZone:'America/Sao_Paulo' }).format(new Date()); }
function addDays(d, n){ const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0,10); }
function weekStart(d){ const x = new Date(d + 'T12:00:00Z'); const wd = (x.getUTCDay() + 6) % 7; return addDays(d, -wd); }
function diffWeeks(a, b){ return Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / (7*864e5)); }
const TODAY = () => brToday();
const THIS_WEEK = () => weekStart(brToday());

/* ---------- montar o aluno a partir do banco ---------- */
function buildStudent(p, checkins, trainings, discounts){
  const weeks = [...new Set(checkins.map(c => c.week_start))].sort();
  const tByWeek = {};
  trainings.forEach(t => { const w = weekStart(t.day); tByWeek[w] = (tByWeek[w] || 0) + 1; });
  const hist = { treino:[], nutri:[], geral:[] };
  weeks.forEach(w => ['treino','nutri','geral'].forEach(g => {
    const c = checkins.find(x => x.week_start === w && x.grp === g);
    if (c){ const a = { ...c.answers }; if (g === 'treino') a.freq = tByWeek[w] || 0; hist[g].push(a); }
  }));
  const tw = THIS_WEEK();
  const days = [0,1,2,3,4,5,6].map(i => trainings.some(t => t.day === addDays(tw, i)));
  const todayIdx = diffDaysIdx(tw, TODAY());
  const lastWeek = weeks[weeks.length - 1];
  const sentThisWeek = {}; checkins.filter(c => c.week_start === tw).forEach(c => sentThisWeek[c.grp] = true);
  // inatividade e recuperação (sem guardar estado: tudo sai das semanas)
  const gap = lastWeek ? Math.max(0, diffWeeks(lastWeek, tw) - 1) : 0;
  let streak = 0, bigGap = false;
  for (let i = weeks.length - 1; i >= 0; i--){
    streak++;
    if (i === 0) break;
    const g = diffWeeks(weeks[i-1], weeks[i]);
    if (g > 1){ bigGap = g - 1 >= 4; break; }
  }
  const recruits = discounts.filter(d => d.source === 'indicacao').length;
  const bank = discounts.filter(d => !d.used_at).reduce((t, d) => t + d.pct, 0);
  return {
    id:p.id, name:p.name, plan:p.plan, refCode:p.ref_code, rankOpt:p.rank_opt, photoConsent:p.photo_consent,
    prestige:p.prestige || {}, pbase:p.pbase || {}, gallery:p.gallery || [], pauseUntil:p.pause_until, pauseLeft:p.pause_left,
    hist, weeks, trainingsTotal:trainings.length, trainingsList:trainings, days, todayIdx, sentThisWeek,
    missing: weeks.length && !sentThisWeek.geral ? 1 : 0, gap, recoverLeft: bigGap && streak < 2 ? 2 - streak : 0,
    recruits, bank, discounts
  };
}
function diffDaysIdx(a, b){ return Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 864e5); }

async function loadStudent(){
  const [c, t, d] = await Promise.all([
    sb.from('checkins').select('*').eq('user_id', ME.id),
    sb.from('trainings').select('*').eq('user_id', ME.id),
    sb.from('discounts').select('*').eq('user_id', ME.id)
  ]);
  ST = buildStudent(ME, c.data || [], t.data || [], d.data || []);
}

async function loadTeam(){
  const [p, c, t, d, r, l, inv] = await Promise.all([
    sb.from('profiles').select('*').eq('role', 'aluno'),
    sb.from('checkins').select('*'),
    sb.from('trainings').select('*'),
    sb.from('discounts').select('*'),
    sb.from('rewards').select('*'),
    sb.from('leads').select('*').order('created_at', { ascending:false }),
    sb.from('invites').select('*').order('created_at', { ascending:false })
  ]);
  const profiles = (p.data || []).filter(x => x.plan);
  const students = profiles.map(x => buildStudent(x, (c.data||[]).filter(k => k.user_id === x.id), (t.data||[]).filter(k => k.user_id === x.id), (d.data||[]).filter(k => k.user_id === x.id)));
  TEAM = { students, pending:(p.data || []).filter(x => !x.plan), rewards:r.data || [], leads:l.data || [], invites:inv.data || [], discounts:d.data || [] };
  await autoLevelDiscounts();
}

// Desconto de Level entra sozinho quando a equipe abre o painel (uma vez por Level).
async function autoLevelDiscounts(){
  const rows = [];
  TEAM.students.filter(trainsSt).forEach(s => {
    const L = levelInfo(s), round = s.prestige.lv || 0;
    for (let i = 1; i <= L.idx; i++) if (LEVEL_DISCOUNT[i]){
      const note = `level-${i}-p${round}`;
      if (!s.discounts.some(x => x.note === note)) rows.push({ user_id:s.id, source:'level', pct:LEVEL_DISCOUNT[i], note });
    }
  });
  if (rows.length){
    await sb.from('discounts').upsert(rows, { onConflict:'user_id,note', ignoreDuplicates:true });
    const d = await sb.from('discounts').select('*'); TEAM.discounts = d.data || [];
    TEAM.students.forEach(s => { s.discounts = TEAM.discounts.filter(x => x.user_id === s.id); s.bank = s.discounts.filter(x => !x.used_at).reduce((t,x)=>t+x.pct,0); });
  }
}

/* ---------- cálculos (iguais ao protótipo) ---------- */
const groupsOf = st => SECTIONS[PLANS[st.plan]].groups;
const trainsSt = st => groupsOf(st).includes('treino');
function weeksDone(st){ return st.weeks.length; }
function totalTreinos(st){ return st.trainingsTotal - (st.pbase.lv || 0); }
function pace(st){ const recent = st.trainingsList.filter(t => t.day >= addDays(TODAY(), -28)).length; return recent / 4; }
function perfectWeeks(st){
  const gs = groupsOf(st).filter(g => g !== 'geral');
  const len = Math.min(...gs.map(g => st.hist[g].length));
  let c = 0;
  for (let k=1; k<=len; k++){
    const ok = gs.every(g => { const a = st.hist[g][st.hist[g].length-k];
      return g === 'treino' ? (a.plano === 3 && a.freq >= 4) : (a.plano_alim >= 2 && a.agua >= 2 && a.sono_h >= 2 && a.fastfood === 0); });
    if (ok) c++;
  }
  return c;
}
function medalVal(st, m){ return m.val ? m.val(st) : (st.hist[m.g] || []).filter(m.test).length; }
function medalAvailable(st, m){ return !m.g || groupsOf(st).includes(m.g); }
function levelInfo(st){
  const byTreino = trainsSt(st);
  const val = byTreino ? totalTreinos(st) : weeksDone(st);
  const key = byTreino ? 'treinos' : 'semanas';
  let idx = 0; LEVELS.forEach((l,i) => { if (val >= l[key]) idx = i; });
  const next = LEVELS[idx+1];
  const pct = next ? Math.round((val - LEVELS[idx][key]) / (next[key] - LEVELS[idx][key]) * 100) : 100;
  return { byTreino, val, key, idx, cur:LEVELS[idx], next, pct, left: next ? next[key]-val : 0 };
}
function eta(st, left, byTreino){
  const w = byTreino ? Math.ceil(left / Math.max(pace(st), 0.5)) : left;
  if (w <= 6) return `${w} semana${w>1?'s':''}`;
  const m = Math.round(w/4.33); return m >= 12 ? `${(m/12).toFixed(m%12?1:0).replace('.',',')} ano${m>=24?'s':''}` : `${m} meses`;
}
function insights(st){
  const ups = [], downs = [];
  for (const g of groupsOf(st)){
    const h = st.hist[g]; if (h.length < 2) continue;
    const p = h[h.length-2], c = h[h.length-1];
    for (const q of Q[g]){
      if (!q.dir || p[q.id] === undefined || c[q.id] === undefined || p[q.id] === c[q.id]) continue;
      const better = (c[q.id]-p[q.id])*q.dir > 0;
      const from = String(q.opts[p[q.id]]).toLowerCase(), to = String(q.opts[c[q.id]]).toLowerCase();
      const t = q.id === 'freq'
        ? (better ? `Você treinou ${c.freq}x. Antes eram ${p.freq}. Tá voando!` : `Foram ${c.freq} treinos, antes eram ${p.freq}. Semana que vem a gente recupera.`)
        : `${q.short}: de ${from} para ${to}. ${better ? q.win : 'Bora ajustar juntos?'}`;
      (better ? ups : downs).push({ t, q, p:p[q.id], c:c[q.id] });
    }
  }
  return { ups, downs };
}
function alerts(st){
  const { ups, downs } = insights(st), out = [];
  if (st.missing || !st.weeks.length) out.push({ t: st.gap > 0 ? `Sem check-in há ${st.gap + 1} semanas` : 'Check-in pendente', strong:true });
  downs.slice(0,2).forEach(d => out.push({ t: `${d.q.short} piorou` }));
  if (!out.length && ups.length) out.push({ t: `${ups.length} ${ups.length === 1 ? 'melhora' : 'melhoras'} na semana` });
  return out;
}

/* perda gradual, prestígio e pausa */
function paused(st){ return st.pauseUntil && st.pauseUntil >= TODAY(); }
function stage(st){ return paused(st) ? 0 : Math.min(4, st.gap); }
function dropped(st){ return stage(st) >= 4 || st.recoverLeft > 0; }
function rawEff(st, m){ const v = medalVal(st, m) - (st.pbase[m.id] || 0); let t = -1; m.th.forEach((x,i) => { if (v >= x) t = i; }); return t; }
function effVal(st, m){ return medalVal(st, m) - (st.pbase[m.id] || 0); }
function effTier(st, m){ const t = rawEff(st, m); return dropped(st) && t > 0 && m !== RECRUIT ? t - 1 : t; }
function starsOf(st, m){ return st.prestige[m.id] || 0; }
function fadeCls(st, m){ if (m === RECRUIT) return ''; const s = stage(st); return s === 3 ? 'fade risk' : s === 2 ? 'fade' : ''; }
function tierLabel(st, m, t){ const n = starsOf(st, m); return t < 0 ? '' : TIERS[t] + (n ? ' ' + '★'.repeat(n) : ''); }
function seasonCount(st){ return st.weeks.filter(w => w >= CFG.season.start && w <= CFG.season.end).length; }
function seasonGot(st){ return seasonCount(st) >= SEASON.goal; }
function daysLeft(){ return Math.max(0, Math.ceil((SEASON.ends - new Date()) / 864e5)); }
const medalById = id => id === 'season' ? SEASON : id === 'recrutador' ? RECRUIT : MEDALS.find(m => m.id === id);
function tiersSnapshot(st){ const o = {}; [...MEDALS, RECRUIT].forEach(m => { if (medalAvailable(st, m)) o[m.id] = effTier(st, m); }); o.season = seasonGot(st) ? 0 : -1; o.level = levelInfo(st).idx; return o; }
function diffUnlocks(before, after){ const out = []; for (const k in after) if (k !== 'level' && after[k] > (before[k] ?? -1)) out.push({ id:k, tier:after[k] }); return out; }

/* ---------- visuais ---------- */
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
  return `<span class="embw lv${lv}${dim ? ' dim' : ''}"${size ? ` style="--s:${size}px"` : ''}><span class="emb"><span class="in">${wolfSVG(lv)}</span></span>${lv >= 4 ? '<span class="spark"></span>' : ''}</span>`;
}
function iconOf(m, tier){ return m.icons ? m.icons[Math.max(0,tier)] : m.icon; }
function disc(m, tier, extra='', stars=0){
  const st = stars ? `<i class="stars">${'★'.repeat(stars)}</i>` : '';
  if (m === SEASON) return `<div class="disc ${tier >= 0 ? 'tS' : 'lock'} ${extra}"><span>${m.icon}</span></div>`;
  if (tier < 0) return `<div class="disc lock ${extra}"><span>${m.secret ? '?' : iconOf(m, 0)}</span>${st}</div>`;
  return `<div class="disc t${tier} ${extra}"><span>${iconOf(m, tier)}</span>${st}</div>`;
}
function rarityText(m, tier){ return m === SEASON ? 'Edição limitada' : `Tier ${TIERS[tier]}`; }
const BODY = `<svg viewBox="0 0 40 80" aria-hidden="true"><circle cx="20" cy="10" r="8" fill="currentColor"/><path fill="currentColor" d="M8 22h24l4 30h-6l-2 26h-6l-2-22-2 22h-6l-2-26H4z"/></svg>`;

/* ---------- telas: entrada ---------- */
function topBar(back){
  return `<div class="top">${back ? `<button class="back" data-home>‹ ${back}</button><span class="d brand">CHAMES CREW</span>`
    : `<span class="d brand">CHAMES CREW</span>${ME ? '<button class="ghost" data-logout>Sair</button>' : ''}`}</div>`;
}
function loginView(){
  const f = view.form || (view.form = { email:'', pass:'', name:'', code: savedInvite() });
  const signup = view.mode === 'signup';
  return `${topBar()}<h1 class="d hero" style="margin-top:36px">${signup ? 'Bem-vindo<br>à matilha.' : 'Bem-vindo<br>ao time.'}</h1>
    <p class="sub">${signup ? 'Crie sua senha pra entrar no app da Chames Crew.' : 'Entre com o e-mail e a senha que você criou.'}</p>
    ${signup ? `<label class="field"><span>Seu nome completo</span><input data-f="name" value="${esc(f.name)}" autocomplete="name"></label>` : ''}
    <label class="field"><span>E-mail</span><input data-f="email" type="email" value="${esc(f.email)}" autocomplete="email"></label>
    <label class="field"><span>Senha${signup ? ' (mínimo 6 caracteres)' : ''}</span><input data-f="pass" type="password" value="${esc(f.pass)}" autocomplete="${signup ? 'new-password' : 'current-password'}"></label>
    ${signup ? `<label class="field"><span>Código do convite</span><input data-f="code" value="${esc(f.code)}" autocapitalize="characters"></label>` : ''}
    ${view.err ? `<p class="err">${esc(view.err)}</p>` : ''}
    <button class="btn" data-${signup ? 'signup' : 'login'}>${signup ? 'Criar minha conta' : 'Entrar'}</button>
    <button class="btn line" data-mode="${signup ? 'login' : 'signup'}">${signup ? 'Já tenho conta' : 'Tenho um convite'}</button>
    ${signup ? '' : '<button class="ghost" data-forgot style="display:block;margin:16px auto 0">Esqueci minha senha</button>'}
    <p class="motto">Resultados constroem liberdade.</p>`;
}
const SHARE_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style="vertical-align:-4px"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
function needsInstall(){ let skipped = false; try { skipped = sessionStorage.getItem('cc-skip-install') === '1'; } catch(e){} return !isStandalone() && !skipped && (isIOS() || isAndroid()); }
const RING = '<circle class="ring" cx="CX" cy="CY" r="R" fill="none" stroke="#e0234e" stroke-width="3"/>';
const ring = (cx, cy, r) => RING.replace('CX', cx).replace('CY', cy).replace('R', r);
const WOLF_MINI = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s/100})"><rect width="100" height="100" rx="22" fill="#000"/><g transform="translate(14 12) scale(.72)"><path fill="#fff" d="M14 8L36 32H64L86 8L83 44L94 58L76 66L66 92H34L24 66L6 58L17 44Z"/><path fill="#000" d="M30 47L46 55L33 59Z M70 47L54 55L67 59Z M43 73H57L50 81Z"/></g></g>`;
const ILL = {
  ios1: `<svg viewBox="0 0 240 120" role="img" aria-label="Barra do Safari com o botão de menu destacado, ao lado do endereço">
    <rect x="10" y="8" width="220" height="104" rx="16" fill="var(--soft)"/>
    <rect x="22" y="22" width="196" height="40" rx="10" fill="var(--bg)"/><text x="120" y="46" text-anchor="middle" font-size="11" fill="var(--muted)">Chames Crew</text>
    <circle cx="40" cy="88" r="15" fill="var(--bg)"/><path d="M43 82l-6 6 6 6" fill="none" stroke="var(--fg)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="62" y="73" width="122" height="30" rx="15" fill="var(--bg)"/>
    <g stroke="var(--fg)" stroke-width="2.4" stroke-linecap="round"><path d="M74 82h12M74 88h12M74 94h8"/></g>
    <text x="134" y="92" text-anchor="middle" font-size="10" fill="var(--muted)">chamescrew…</text>
    <circle cx="204" cy="88" r="15" fill="var(--bg)"/><rect x="198" y="83" width="10" height="10" rx="2" fill="none" stroke="var(--fg)" stroke-width="2"/>
    ${ring(80, 88, 14)}</svg>`,
  ios2: `<svg viewBox="0 0 240 120" role="img" aria-label="Menu do Safari com Compartilhar destacado">
    <rect x="10" y="8" width="220" height="104" rx="16" fill="var(--soft)"/>
    <rect x="40" y="14" width="160" height="92" rx="12" fill="var(--bg)"/>
    <text x="74" y="34" font-size="11" fill="var(--muted)">Traduzir Site…</text>
    <rect x="46" y="44" width="148" height="24" rx="7" fill="none" stroke="#e0234e" stroke-width="2.5"/>
    <g fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M60 50v10M56 53l4-4 4 4M54 57v5h12v-5"/></g>
    <text x="74" y="60" font-size="11.5" font-weight="700" fill="var(--fg)">Compartilhar</text>
    <text x="74" y="84" font-size="11" fill="var(--muted)">Adicionar a Favoritos</text><text x="74" y="100" font-size="11" fill="var(--muted)">Downloads</text></svg>`,
  ios3: `<svg viewBox="0 0 240 120" role="img" aria-label="Tela de compartilhar com o botão Ver Mais destacado">
    <rect x="10" y="8" width="220" height="104" rx="16" fill="var(--soft)"/>
    ${[0,1,2,3].map(k => `<circle cx="${48 + k*48}" cy="36" r="15" fill="var(--line)"/>`).join('')}
    ${[0,1,2].map(k => `<circle cx="${48 + k*48}" cy="80" r="15" fill="var(--bg)"/>`).join('')}
    <text x="48" y="104" text-anchor="middle" font-size="8.5" fill="var(--muted)">Copiar</text><text x="96" y="104" text-anchor="middle" font-size="8.5" fill="var(--muted)">Favoritos</text><text x="144" y="104" text-anchor="middle" font-size="8.5" fill="var(--muted)">Leitura</text>
    <circle cx="192" cy="80" r="15" fill="var(--bg)"/><path d="M185 77l7 7 7-7" fill="none" stroke="var(--fg)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="192" y="104" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--fg)">Ver Mais</text>${ring(192, 80, 19)}</svg>`,
  ios4: `<svg viewBox="0 0 240 120" role="img" aria-label="Lista do compartilhar com Adicionar à Tela de Início destacado">
    <rect x="10" y="8" width="220" height="104" rx="16" fill="var(--soft)"/>
    <rect x="22" y="16" width="196" height="88" rx="12" fill="var(--bg)"/>
    <text x="50" y="36" font-size="11" fill="var(--muted)">Preferidos</text><text x="50" y="56" font-size="11" fill="var(--muted)">Buscar na Página</text>
    <rect x="28" y="66" width="184" height="26" rx="8" fill="none" stroke="#e0234e" stroke-width="2.5"/>
    <g fill="none" stroke="var(--fg)" stroke-width="2"><rect x="34" y="72" width="13" height="13" rx="3"/><path d="M40.5 75v7M37 78.5h7"/></g>
    <text x="54" y="83" font-size="11.5" font-weight="700" fill="var(--fg)">Adicionar à Tela de Início</text></svg>`,
  ios5: `<svg viewBox="0 0 240 120" role="img" aria-label="Tela de confirmação com Abrir como app web ligado e o botão Adicionar destacado">
    <rect x="10" y="8" width="220" height="104" rx="16" fill="var(--soft)"/>
    <text x="26" y="32" font-size="11" font-weight="700" fill="var(--fg)">Adicionar à Tela…</text>
    <rect x="160" y="18" width="62" height="22" rx="11" fill="#0a84ff"/><text x="191" y="33" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">Adicionar</text>
    <rect x="156" y="14" width="70" height="30" rx="15" fill="none" stroke="#e0234e" stroke-width="2.5"/>
    ${WOLF_MINI(26, 50, 26)}<text x="62" y="67" font-size="11.5" font-weight="700" fill="var(--fg)">Chames Crew</text>
    <text x="26" y="98" font-size="10.5" fill="var(--fg)">Abrir como app web</text>
    <rect x="182" y="86" width="34" height="18" rx="9" fill="#30d158"/><circle cx="207" cy="95" r="7" fill="#fff"/></svg>`,
  home: `<svg viewBox="0 0 240 120" role="img" aria-label="Tela inicial do celular com o ícone do lobo">
    <rect x="10" y="8" width="220" height="104" rx="16" fill="var(--soft)"/>
    ${[0,1,2,3].map(k => `<rect x="${34 + k*48}" y="22" width="32" height="32" rx="9" fill="var(--line)"/>`).join('')}
    ${[0,1,2].map(k => `<rect x="${34 + k*48}" y="68" width="32" height="32" rx="9" fill="var(--line)"/>`).join('')}
    ${WOLF_MINI(178, 68, 32)}${ring(194, 84, 22)}</svg>`,
  and1: `<svg viewBox="0 0 240 120" role="img" aria-label="Barra do Chrome com o menu de três pontinhos destacado">
    <rect x="10" y="8" width="220" height="104" rx="16" fill="var(--soft)"/>
    <rect x="22" y="22" width="160" height="26" rx="13" fill="var(--bg)"/><text x="102" y="39" text-anchor="middle" font-size="11" fill="var(--muted)">chamescrew.netlify.app</text>
    <g fill="var(--fg)"><circle cx="204" cy="28" r="2.6"/><circle cx="204" cy="35" r="2.6"/><circle cx="204" cy="42" r="2.6"/></g>${ring(204, 35, 15)}
    <rect x="22" y="62" width="196" height="40" rx="10" fill="var(--bg)"/><text x="34" y="86" font-size="11" fill="var(--muted)">Chames Crew</text></svg>`,
  and2: `<svg viewBox="0 0 240 120" role="img" aria-label="Menu do Chrome com Instalar app destacado">
    <rect x="10" y="8" width="220" height="104" rx="16" fill="var(--soft)"/>
    <rect x="70" y="14" width="150" height="92" rx="10" fill="var(--bg)"/>
    <text x="84" y="34" font-size="11" fill="var(--muted)">Nova guia</text><text x="84" y="54" font-size="11" fill="var(--muted)">Favoritos</text>
    <rect x="76" y="62" width="138" height="24" rx="7" fill="none" stroke="#e0234e" stroke-width="2.5"/><text x="84" y="78" font-size="11.5" font-weight="700" fill="var(--fg)">Instalar app</text>
    <text x="84" y="99" font-size="11" fill="var(--muted)">Configurações</text></svg>`,
  and3: `<svg viewBox="0 0 240 120" role="img" aria-label="Janela de instalação com o botão Instalar destacado">
    <rect x="10" y="8" width="220" height="104" rx="16" fill="var(--soft)"/>
    <rect x="30" y="18" width="180" height="84" rx="12" fill="var(--bg)"/>
    ${WOLF_MINI(44, 28, 30)}<text x="84" y="47" font-size="12" font-weight="700" fill="var(--fg)">Instalar app?</text>
    <text x="104" y="88" font-size="11" fill="var(--muted)">Cancelar</text><text x="186" y="88" text-anchor="end" font-size="12" font-weight="800" fill="var(--fg)">Instalar</text>
    <rect x="146" y="74" width="50" height="22" rx="11" fill="none" stroke="#e0234e" stroke-width="2.5"/></svg>`
};
function installView(){
  const tab = view.itab || (isAndroid() ? 'android' : 'ios');
  const step = (n, text, ill) => `<div class="istep"><div class="itxt"><span class="d inum">${n}</span><p>${text}</p></div>${ill}</div>`;
  let steps;
  if (tab === 'ios') steps = `
    <p class="note" style="margin:0 0 10px">Use o <b>Safari</b>. Se abriu pelo WhatsApp ou Instagram, toque nos três pontinhos e escolha abrir no Safari.</p>
    ${step(1, 'Toque no botão <b>☰</b>, à esquerda do endereço, na barra de baixo. Em iPhones mais antigos, toque direto no ícone de <b>Compartilhar</b> e pule para o passo 3.', ILL.ios1)}
    ${step(2, 'Toque em <b>Compartilhar</b>.', ILL.ios2)}
    ${step(3, 'Se não aparecer a opção do próximo passo, toque em <b>Ver Mais</b>.', ILL.ios3)}
    ${step(4, 'Toque em <b>Adicionar à Tela de Início</b>.', ILL.ios4)}
    ${step(5, 'Deixe <b>Abrir como app web</b> ligado e toque em <b>Adicionar</b>.', ILL.ios5)}
    ${step(6, 'Pronto! Feche o Safari e abra a Chames Crew <b>pelo ícone do lobo</b>.', ILL.home)}`;
  else steps = `
    ${installEvt ? `<button class="btn" data-doinstall style="margin-bottom:14px">Instalar com um toque</button><p class="note" style="margin:0 0 10px">Se o botão não funcionar, siga os passos abaixo.</p>` : ''}
    <p class="note" style="margin:0 0 10px">Use o <b>Chrome</b>. Se abriu pelo WhatsApp ou Instagram, toque nos três pontinhos e escolha abrir no Chrome.</p>
    ${step(1, 'Toque nos <b>três pontinhos ⋮</b>, no canto de cima.', ILL.and1)}
    ${step(2, 'Toque em <b>Instalar app</b> (ou <b>Adicionar à tela inicial</b>).', ILL.and2)}
    ${step(3, 'Toque em <b>Instalar</b> para confirmar.', ILL.and3)}
    ${step(4, 'Pronto! Abra a Chames Crew <b>pelo ícone do lobo</b>.', ILL.home)}`;
  return `<div class="install">
    <div class="ihero">${emblem(5, false, 130)}<div class="d iname">CHAMES CREW</div><p class="itag">Resultados constroem liberdade.</p></div>
    <h1 class="d ititle">Agora, instala<br>o app</h1>
    <p class="sub">Leva 20 segundos e é de graça. Com o app na tela, você entra com um toque e não perde nenhum check-in.</p>
    <div class="seg itabs" role="tablist" aria-label="Tipo de celular"><button role="tab" data-itab="ios" aria-pressed="${tab==='ios'}">iPhone</button><button role="tab" data-itab="android" aria-pressed="${tab==='android'}">Android</button></div>
    ${steps}
    <p class="note" style="margin-top:18px">Você entra uma vez no app instalado e ele lembra de você.</p>
    <button class="ghost" data-skipinstall style="display:block;margin:16px auto 0">Continuar no navegador</button>
  </div>`;
}
function waitingView(){
  return `${topBar()}<h1 class="d hero" style="margin-top:36px">Quase lá, ${esc(first(ME.name))}.</h1>
    <p class="sub">Sua conta foi criada, mas ainda não tem um plano ligado. Se você recebeu um convite, fale com a equipe pra liberar seu acesso.</p>
    ${CFG.whatsapp.length > 4 ? `<a class="btn" href="${wa(CFG.whatsapp, `Oi! Sou ${meName()}, da Chames Crew. Criei minha conta no app e preciso liberar meu acesso.`)}" target="_blank" rel="noopener">Falar com a equipe</a>` : ''}`;
}
function friendView(){
  const f = view.form || (view.form = { name:'', phone:'', goal:null, plan:null, ok:false });
  const who = view.refName || 'Um amigo';
  if (view.sentLead) return `${topBar()}<h1 class="d hero" style="margin-top:40px">Recebido, ${esc(first(f.name) || 'parceiro')}!</h1>
    <p class="sub">A equipe da Chames Crew vai te chamar no WhatsApp pra combinar tudo. Bem-vindo à matilha.</p>
    ${CFG.whatsapp.length > 4 ? `<a class="btn" href="${wa(CFG.whatsapp, `Oi! Sou ${first(f.name)}, vim pelo convite${view.refName ? ' de ' + view.refName : ''} da Chames Crew e quero conhecer.`)}" target="_blank" rel="noopener">Falar agora no WhatsApp</a>` : ''}`;
  const ready = f.name.trim() && f.phone.trim() && f.goal && f.plan && f.ok;
  return `${topBar()}<p class="hello">Convite</p><h1 class="d hero">${esc(who)} te chamou pra matilha.</h1>
    <p class="sub">Personal e nutrição, com acompanhamento semana a semana e evolução que você vê de verdade.</p>
    <label class="field"><span>Seu nome</span><input data-f="name" value="${esc(f.name)}" autocomplete="name"></label>
    <label class="field"><span>WhatsApp</span><input data-f="phone" type="tel" inputmode="tel" value="${esc(f.phone)}" autocomplete="tel"></label>
    <div class="q" style="border:0;padding-top:4px"><h3>Seu objetivo</h3><div class="chips">${['Emagrecer','Ganhar massa','Saúde','Performance'].map(g => `<button class="chip" data-fgoal="${g}" aria-pressed="${f.goal===g}">${g}</button>`).join('')}</div></div>
    <div class="q" style="border:0;padding-top:4px"><h3>Interesse em</h3><div class="chips">${Object.keys(PLANS).map(p => `<button class="chip" data-fplan="${p}" aria-pressed="${f.plan===p}">${PLAN_LABEL[p]}</button>`).join('')}</div></div>
    <label class="consent"><input type="checkbox" data-f="ok" ${f.ok?'checked':''}>Autorizo a Chames Crew a entrar em contato comigo pelo WhatsApp.</label>
    ${view.err ? `<p class="err">${esc(view.err)}</p>` : ''}
    <button class="btn" data-sendlead ${ready ? '' : 'disabled'}>Quero conhecer</button>`;
}

/* ---------- telas: aluno ---------- */
const DAYS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
function dailyCard(){
  if (!trainsSt(ST)) return '';
  const done = ST.days[ST.todayIdx], L = levelInfo(ST);
  return `<div class="daily">
    <div class="dots">${DAYS.map((n,i) => `<span class="dot ${ST.days[i] ? 'on' : i < ST.todayIdx ? 'miss' : i === ST.todayIdx ? 'today' : ''}"><i>${ST.days[i] ? '✓' : i < ST.todayIdx ? '–' : ''}</i>${n}</span>`).join('')}</div>
    ${done ? `<p class="dmsg"><strong>Treino de hoje validado ✓</strong> Treino ${L.val}${L.next ? `, rumo ao ${L.next.name}` : ''}.</p>
      <button class="btn" data-dsticker>Gerar figurinha do treino</button>`
    : CFG.aiEnabled ? `<label class="btn cam">Treinei hoje<input type="file" accept="image/*" capture="environment" data-dailyphoto></label>
      <p class="note">Tira uma foto do treino. A IA confere e a foto é apagada na hora. Só vale até meia-noite.</p>`
    : `<button class="btn" data-train>Treinei hoje</button><p class="note">Só vale no próprio dia, até meia-noite.</p>`}
  </div>`;
}
function comeback(){
  const s = stage(ST);
  const ex = MEDALS.find(m => medalAvailable(ST, m) && rawEff(ST, m) >= 1) || MEDALS[0];
  const exT = TIERS[Math.max(0, rawEff(ST, ex))];
  let msg = '', acts = '';
  if (paused(ST)) msg = `<strong>Pausa ativa até ${ST.pauseUntil.split('-').reverse().slice(0,2).join('/')}.</strong> Suas medalhas estão protegidas. Volta quando der, a matilha te espera.`;
  else if (ST.recoverLeft) msg = `<strong>Que bom te ver de volta!</strong> Mais ${ST.recoverLeft} semana de check-in e suas medalhas voltam pro tier de antes. ${ex.name} volta pro ${exT}.`;
  else if (s === 1) msg = `<strong>Sentimos sua falta semana passada.</strong> Um check-in rápido e tá tudo certo.`;
  else if (s === 2) msg = `<strong>Suas medalhas estão perdendo o brilho.</strong> Volta essa semana que elas acendem de novo. Ninguém evolui em linha reta.`;
  else if (s === 3) msg = `<strong>Medalhas em risco: faltam 7 dias.</strong> Você tá a um check-in de distância de manter tudo. Bora?`;
  else if (s >= 4) msg = `<strong>Algumas medalhas caíram um tier.</strong> Calma, nada se perde de vez: 2 semanas de check-in e tudo volta. ${ex.name} volta pro ${exT}.`;
  if (paused(ST)) acts = `<button class="link" data-pause="off">Encerrar pausa</button>`;
  else if (s >= 1 && !ST.recoverLeft && ST.pauseLeft > 0) acts = `<button class="link" data-pause="on">Pausar 1 semana por férias ou lesão (${ST.pauseLeft} no ano)</button>`;
  return msg ? `<div class="done comeback"><p>${msg}</p>${acts}</div>` : '';
}
function installBanner(){
  if (isStandalone() || !(isIOS() || isAndroid())) return '';
  return `<div class="done ibanner"><strong>Você está no navegador</strong><p>Instala o app na tela do celular: você entra com um toque e não perde nenhum check-in.</p><button class="btn" data-showinstall>Instalar o app</button></div>`;
}
function hubAluno(){
  const k = PLANS[ST.plan], s = SECTIONS[k];
  const pending = s.groups.some(g => !ST.sentThisWeek[g]);
  const L = levelInfo(ST);
  return `${topBar()}<p class="hello">E aí, ${esc(first(ST.name))}.</p>
  <h1 class="d hero">Bora ver como foi a semana?</h1>${installBanner()}${comeback()}${dailyCard()}
  <button class="door" data-open="${k}"><span class="d">${s.title}</span><small><span>${s.desc}</span><b>${pending ? 'Check-in pendente' : 'Check-in feito ✓'}</b></small></button>
  <button class="door" data-open="${k}" data-tabgo="medalhas"><span class="d">Minha matilha</span>
    <small><span>Level ${L.cur.name}${L.next ? `, faltam ${L.left} ${L.byTreino?'treinos':'semanas'} pra ${L.next.name}` : ''}</span><b>Ver medalhas</b></small></button>
  ${CFG.whatsappDuvidas ? `<a class="btn line" style="margin-top:22px" href="${wa(CFG.whatsappDuvidas, `Oi! Sou ${meName()}, da Chames Crew, e tenho uma dúvida:`)}" target="_blank" rel="noopener">Dúvidas de dieta, treino ou feedback</a>` : ''}
  <p class="motto">Resultados constroem liberdade.</p>`;
}
function checkin(){
  const s = SECTIONS[view.sec];
  if (s.groups.every(g => ST.sentThisWeek[g]) && !view.edit){
    return `<div class="done"><strong>Check-in da semana enviado ✓</strong><p>Já tá com o seu treinador. Confere o que melhorou em Evolução e suas conquistas em Medalhas.</p>
      <button class="link" data-edit>Refazer check-in</button>${CFG.whatsappDuvidas ? `<a class="link" href="${wa(CFG.whatsappDuvidas, `Oi! Sou ${meName()}, da Chames Crew. Sobre a minha semana:`)}" target="_blank" rel="noopener">Quer comentar algo da semana? Chama no WhatsApp</a>` : ''}</div>`;
  }
  const draft = view.draft || (view.draft = {});
  const qs = s.groups.flatMap(g => Q[g]).filter(q => q.id !== 'freq');
  const answered = qs.filter(q => draft[q.id] !== undefined).length;
  const tw = ST.days.filter(Boolean).length;
  const body = s.groups.map(g => `<h2 class="d group">${GROUP_NAME[g]}</h2>
    ${g === 'treino' ? `<p class="note" style="margin:10px 0 0">Treinos da semana: ${tw}, contados pelo botão Treinei hoje.</p>` : ''}
    ${Q[g].filter(q => q.id !== 'freq').map(q => `<div class="q"><h3>${esc(q.q)}</h3><div class="chips" role="group" aria-label="${esc(q.q)}">
      ${q.opts.map((o,i) => `<button class="chip${q.num?' num':''}" data-q="${q.id}" data-v="${i}" aria-pressed="${draft[q.id]===i}">${esc(o)}</button>`).join('')}
    </div></div>`).join('')}`).join('');
  return `<p class="sub">Só toca nas respostas. Leva uns 2 minutos.</p>${body}
    <button class="send" data-send ${answered < qs.length ? 'disabled' : ''}>Enviar check-in</button>
    <p class="count">${answered} de ${qs.length} respondidas</p>`;
}
function levelCard(st, you){
  const L = levelInfo(st), unit = L.byTreino ? 'treinos' : 'semanas';
  return `<button class="level" data-lvcard="${L.idx}">${emblem(L.idx)}<div><div class="d">${L.cur.name}</div>
    <p>${L.val} ${unit} ${you ? 'com a gente' : 'no total'}${L.next ? `. Faltam ${L.left} pra ${L.next.name}.` : '. Topo da matilha.'}</p>
    <div class="bar"><i style="width:${L.pct}%"></i></div></div></button>`;
}
function evolution(st, you){
  const n = weeksDone(st), { ups, downs } = insights(st);
  const metrics = groupsOf(st).flatMap(g => Q[g].filter(q => q.dir !== 0).map(q => {
    const h = st.hist[g].slice(-6); if (!h.length) return '';
    const max = q.opts.length - 1;
    const bars = h.map(a => { let v = a[q.id] ?? 0; if (q.dir < 0) v = max - v; return `<div style="height:${Math.max(8,(v/max)*100)}%"></div>`; }).join('');
    const labels = h.map((_,i) => `<span>${i === h.length-1 ? 'Agora' : 'S' + (n - h.length + i + 1)}</span>`).join('');
    const last = h[h.length-1][q.id];
    return `<div class="metric"><header><span>${q.short}</span><em>${esc(last !== undefined ? q.opts[last] : '')}</em></header><div class="spark">${bars}</div><div class="weeks">${labels}</div></div>`;
  })).join('');
  const ph = view.photos || {}, angles = ['Frente','Lado','Costas'];
  const slot = (a, when) => ph[when + a] ? `<div class="slot"><img src="${ph[when + a]}" alt="Foto ${a.toLowerCase()}"></div>` : null;
  const photoGrid = `<div class="photos"><span></span><span class="head">${esc(ph.firstLabel || 'Mês 1')}</span><span class="head">Agora</span>
    ${angles.map(a => `<span class="lab">${a}</span>${slot(a, 'first') || `<div class="slot">${BODY}</div>`}
      ${slot(a, 'now') || (you ? (st.photoConsent ? `<label class="slot add">+ Foto<input type="file" accept="image/*" data-photo="${a}"></label>` : `<button class="slot add" data-photoconsent>+ Foto</button>`) : `<div class="slot add">Sem foto</div>`)}`).join('')}
  </div><p class="note">${you ? 'Fotos uma vez por mês. Só você e a equipe veem.' : 'Fotos mensais enviadas pelo aluno.'}</p>`;
  if (!view.photosFor || view.photosFor !== st.id) loadPhotos(st);
  return `${levelCard(st, you)}
  <h2 class="d h2">${you ? 'O que melhorou' : 'Melhorou'}</h2>
  ${ups.length ? ups.map(i => `<div class="ins up"><span class="ic">↑</span><span>${esc(i.t)}</span></div>`).join('') : `<p class="empty">${n < 2 ? 'Depois do segundo check-in, a comparação aparece aqui.' : 'Nenhuma mudança positiva essa semana.'}</p>`}
  ${downs.length ? `<h2 class="d h2">Pra ficar de olho</h2>${downs.map(i => `<div class="ins down"><span class="ic">↓</span><span>${esc(i.t)}</span></div>`).join('')}` : ''}
  <h2 class="d h2">Fotos de evolução</h2>${photoGrid}
  <h2 class="d h2">Semana a semana</h2>${metrics || '<p class="empty">Os gráficos aparecem depois do primeiro check-in.</p>'}`;
}
async function loadPhotos(st){
  view.photosFor = st.id; view.photos = {};
  const { data } = await sb.storage.from('fotos').list(st.id, { limit:200, sortBy:{ column:'name', order:'asc' } });
  if (!data || !data.length) return;
  const months = [...new Set(data.map(f => f.name.slice(0,7)))].sort();
  const firstM = months[0], lastM = months[months.length-1];
  const out = { firstLabel: firstM.split('-').reverse().join('/') };
  for (const f of data){
    const m = f.name.slice(0,7), angle = f.name.slice(8).replace(/\.\w+$/, '');
    const key = (m === lastM ? 'now' : m === firstM ? 'first' : null);
    if (!key || (m === firstM && m === lastM && key !== 'now')) continue;
    const { data:u } = await sb.storage.from('fotos').createSignedUrl(`${st.id}/${f.name}`, 3600);
    if (u) out[key + angle] = u.signedUrl;
  }
  if (view.photosFor === st.id){ view.photos = out; render(); }
}
function medalTile(st, m){
  const t = effTier(st, m), raw = rawEff(st, m), v = effVal(st, m), next = m.th[t+1];
  const lost = raw > t;
  const label = t < 0 ? (m.secret ? 'Medalha secreta' : `${v} de ${m.th[0]} pro Ferro`) : lost ? `Volta pro ${TIERS[raw]}` : tierLabel(st, m, t);
  const bar = next !== undefined && !lost && !(m.secret && t < 0) ? `<div class="bar"><i style="width:${Math.min(100, Math.round(v/next*100))}%"></i></div>` : '';
  return `<button class="medal" data-medal="${m.id}">${disc(m, t, fadeCls(st, m), starsOf(st, m))}<b>${m.secret && t < 0 ? '???' : m.name}</b><span>${label}</span>${bar}</button>`;
}
function medals(st, you){
  const L = levelInfo(st), unit = L.byTreino ? 'treinos' : 'semanas';
  const ladder = LEVELS.map((l,i) => {
    const cls = i < L.idx ? 'got' : i === L.idx ? 'now' : 'lock';
    let p;
    if (i < L.idx) p = 'Conquistado';
    else if (i === L.idx) p = L.next ? `${you ? 'Você está aqui' : 'Nível atual'}. ${L.val} de ${L.next[L.key]} ${unit} pro próximo.` : 'Topo da matilha.';
    else { const left = l[L.key] - L.val; p = `${l[L.key]} ${unit}. Faltam ${left}, uns ${eta(st, left, L.byTreino)}.`; }
    return `<button class="rung ${cls}" data-lvcard="${i}">${emblem(i, cls === 'lock')}<div><div class="d">${l.name}</div><p>${p}</p>${i === L.idx && L.next ? `<div class="bar"><i style="width:${L.pct}%"></i></div>` : ''}</div></button>`;
  }).join('') + `<button class="rung lock prest" data-lvcard="5">${emblem(5, !(st.prestige.lv > 0))}<div><div class="d">Prestígio${st.prestige.lv ? ' ' + '★'.repeat(st.prestige.lv) : ''}</div><p>Chegou na Elite? Prestigie e ganhe o lobo de cristal e seu nome no Hall da matilha.</p></div></button>`;
  const sc = seasonCount(st), sg = seasonGot(st), dl = daysLeft();
  const season = `<button class="season" data-medal="season">${disc(SEASON, sg ? 0 : -1)}<div><div class="d">Temporada ${esc(SEASON.name)}</div>
    <p>${sg ? 'Conquistada. Essa medalha nunca mais volta.' : `${sc} de ${SEASON.goal} check-ins. ${dl ? `Termina em ${dl} dias.` : 'Encerrada.'}`} Edição limitada.</p>
    <div class="bar"><i style="width:${Math.min(100, Math.round(sc/SEASON.goal*100))}%"></i></div></div></button>`;
  const cats = ['Tempo','Performance','Estilo de vida','Secretas'].map(c => {
    const list = MEDALS.filter(m => m.cat === c && medalAvailable(st, m));
    return list.length ? `<h2 class="d cat">${c}</h2><div class="medals">${list.map(m => medalTile(st, m)).join('')}</div>` : '';
  }).join('');
  const trail = `<h2 class="d cat">Trilha de indicações</h2>
    <p class="sub" style="margin-bottom:0">Separada do treino: não conta pro Level.</p>
    <div class="trail"><div class="top2"><button data-medal="recrutador" aria-label="Ver medalha Recrutador">${disc(RECRUIT, effTier(st, RECRUIT))}</button>
      <div><span class="d pct">${Math.min(100, st.bank)}%</span><p>de desconto na próxima renovação. ${st.recruits} ${st.recruits === 1 ? 'amigo virou aluno' : 'amigos viraram alunos'}.${st.bank > 100 ? ` Sobram ${st.bank-100}% pra renovação seguinte.` : ''}</p></div></div>
      ${you ? `<button class="btn" data-invite>Convidar um amigo</button><p class="note">Cada amigo que virar aluno vale 10% de desconto, até 100% por renovação.</p>` : ''}
    </div>`;
  return `<p class="sub">${you ? 'Cada semana de check-in te leva mais longe na matilha.' : 'Quadro de conquistas do aluno.'}</p>${you ? comeback() : ''}
    <p class="note" style="margin:0 0 10px">Toque em um Level pra ver a carta.</p><div class="ladder">${ladder}</div>${season}${cats}${trail}`;
}
function rankingView(){
  const you = trainsSt(ST), mode = view.rmode || 'geral';
  if (!view.rank){ loadRanking(); return '<p class="empty">Carregando a matilha…</p>'; }
  const rows = view.rank.map(r => ({ ...r, lvIdx: (() => { let i = 0; LEVELS.forEach((l,k) => { if (r.total >= l.treinos) i = k; }); return i; })() }));
  rows.sort((a,b) => mode === 'geral' ? b.total - a.total : b.week - a.week || b.total - a.total);
  const hall = rows.filter(r => r.prestige_lv > 0);
  let prompt = '';
  if (!you) prompt = `<div class="done"><strong>O ranking é de quem treina com a gente.</strong><p>Você pode acompanhar a matilha. Quer entrar no ranking e ganhar os benefícios dos Levels?</p>${CFG.whatsapp.length > 4 ? `<a class="link" href="${wa(CFG.whatsapp, `Oi! Sou ${meName()}, da Chames Crew (plano de nutrição), e quero treinar com a equipe também.`)}" target="_blank" rel="noopener">Quero treinar com a equipe</a>` : ''}</div>`;
  else if (ST.rankOpt === null || ST.rankOpt === undefined) prompt = `<div class="done"><strong>Você quer aparecer no ranking?</strong><p>Aparece só seu primeiro nome, a inicial e seu Level. Dá pra mudar quando quiser.</p>
    <div class="chips" style="margin-top:12px"><button class="chip" data-rank="1">Sim</button><button class="chip" data-rank="0">Não</button></div></div>`;
  else prompt = `<p class="note" style="margin:0 0 6px">${ST.rankOpt ? 'Você aparece no ranking.' : 'Você não aparece no ranking.'} <button class="link" style="margin:0" data-rank="${ST.rankOpt ? 0 : 1}">${ST.rankOpt ? 'Sair do ranking' : 'Aparecer no ranking'}</button></p>`;
  return `<p class="sub">Quem treina com a gente e escolheu aparecer.</p>${prompt}
    <h2 class="d h2">Hall da matilha</h2>
    ${hall.length ? `<div class="hall">${hall.map(c => `<div class="hallrow">${emblem(5, false, 52)}<div><strong>${esc(c.name)}</strong><small>Prestígio ${'★'.repeat(c.prestige_lv)}</small></div></div>`).join('')}</div>` : '<p class="empty">Ninguém chegou aqui ainda. Pode ser você.</p>'}
    <h2 class="d h2">Ranking</h2>
    <div class="seg" role="group" aria-label="Tipo de ranking" style="margin-bottom:8px"><button data-rmode="geral" aria-pressed="${mode==='geral'}">Geral</button><button data-rmode="semana" aria-pressed="${mode==='semana'}">Essa semana</button></div>
    ${rows.length ? rows.map((r, k) => `<div class="rk${r.is_me ? ' me' : ''}"><span class="d pos">${k + 1}</span>${emblem(r.prestige_lv ? 5 : r.lvIdx, false, 40)}
      <span><strong>${esc(r.name)}${r.is_me ? ' (você)' : ''}</strong><small>${r.prestige_lv ? 'Prestígio' : LEVELS[r.lvIdx].name}. ${mode === 'geral' ? r.total + ' treinos' : r.week + ' treinos na semana'}.</small></span><span></span></div>`).join('') : '<p class="empty">Ninguém no ranking ainda.</p>'}`;
}
async function loadRanking(){ const { data } = await sb.rpc('ranking'); view.rank = data || []; render(); }
function section(){
  const s = SECTIONS[view.sec], tab = view.tab || 'checkin';
  const body = tab === 'checkin' ? checkin() : tab === 'evolucao' ? evolution(ST, true) : tab === 'ranking' ? rankingView() : medals(ST, true);
  return `${topBar('Início')}<h1 class="d sectitle">${tab === 'medalhas' ? 'Minha matilha' : tab === 'ranking' ? 'A matilha' : s.full}</h1>${body}
  ${tabsNav([['checkin','Check-in'],['evolucao','Evolução'],['medalhas','Medalhas'],['ranking','Ranking']], tab)}`;
}
function tabsNav(list, tab){ return `<nav class="tabs"><div class="seg" role="tablist">${list.map(([k,l]) => `<button role="tab" data-tab="${k}" aria-pressed="${tab===k}">${l}</button>`).join('')}</div></nav>`; }

/* ---------- telas: equipe ---------- */
function teamHub(){
  const tab = view.ttab || 'alunos';
  const nav = tabsNav([['alunos','Alunos'],['convites','Convites'],['indicacoes','Indicações'],['renovacoes','Renovações']], tab);
  let body = '';
  if (tab === 'alunos'){
    const all = TEAM.students;
    const done = all.filter(s => !s.missing && s.weeks.length).length;
    const attention = all.filter(s => alerts(s).some(a => a.strong || /piorou/.test(a.t))).length;
    const sorted = [...all].sort((a,b) => (b.missing - a.missing) || a.name.localeCompare(b.name));
    body = `<h1 class="d hero">Sua matilha essa semana</h1>
      <div class="stats"><div class="stat"><span class="d">${all.length}</span><small>alunos</small></div>
        <div class="stat"><span class="d">${done}</span><small>check-ins feitos</small></div>
        <div class="stat"><span class="d">${attention}</span><small>pedem atenção</small></div></div>
      ${deliveries()}
      ${TEAM.pending.length ? `<div class="priv">${TEAM.pending.length} conta(s) criada(s) sem convite: ${TEAM.pending.map(p => esc(p.name || 'sem nome')).join(', ')}. Pra liberar, crie um convite ou peça pra entrar de novo com o código.</div>` : ''}
      ${sorted.length ? sorted.map(st => {
        const al = alerts(st), L = levelInfo(st), initials = st.name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();
        return `<button class="row" data-student="${st.id}"><span class="avatar ${st.missing?'off':''}">${esc(initials)}</span>
          <span><strong>${esc(st.name)}</strong><small>${PLAN_LABEL[st.plan]}. Level ${L.cur.name}.</small><small>${al.map(a => a.t).join('. ') || 'Tudo estável.'}</small></span>
          <span class="tag ${st.missing || !st.weeks.length ? '' : 'fill'}">${st.missing || !st.weeks.length ? 'Pendente' : 'Enviado'}</span></button>`;
      }).join('') : '<p class="empty">Nenhum aluno ainda. Crie o primeiro convite na aba Convites.</p>'}`;
  } else if (tab === 'convites'){
    const f = view.inv || (view.inv = { name:'', phone:'', plan:'coach' });
    const last = view.lastInvite;
    body = `<h1 class="d hero">Convites</h1>
      <p class="sub">Depois do pagamento, crie o convite e mande pelo WhatsApp. O aluno cria a senha dele com o código.</p>
      <label class="field"><span>Nome do aluno</span><input data-i="name" value="${esc(f.name)}"></label>
      <label class="field"><span>WhatsApp (com DDD)</span><input data-i="phone" type="tel" value="${esc(f.phone)}"></label>
      <div class="chips">${Object.keys(PLANS).map(p => `<button class="chip" data-iplan="${p}" aria-pressed="${f.plan===p}">${PLAN_LABEL[p]}</button>`).join('')}</div>
      <button class="btn" data-mkinvite>Criar convite</button>
      ${last ? inviteBox(last) : ''}
      <h2 class="d h2">Últimos convites</h2>
      ${TEAM.invites.slice(0,20).map(i => `<div class="lead"><header><div><strong>${esc(i.name)}</strong><small>Código ${i.code}. ${PLAN_LABEL[i.plan]}.${i.ref_id ? ' Veio por indicação.' : ''}</small></div><span class="tag ${i.used_by ? 'fill' : ''}">${i.used_by ? 'Entrou' : 'Aguardando'}</span></header>
        ${i.used_by ? '' : `<a class="btn line" href="${waLink(i)}" target="_blank" rel="noopener">Reenviar pelo WhatsApp</a>`}</div>`).join('') || '<p class="empty">Nenhum convite ainda.</p>'}`;
  } else if (tab === 'indicacoes'){
    const L = TEAM.leads;
    body = `<h1 class="d hero">Indicações</h1>
      <div class="stats"><div class="stat"><span class="d">${L.length}</span><small>indicações</small></div>
        <div class="stat"><span class="d">${L.filter(l=>l.status!=='ativo').length}</span><small>em andamento</small></div>
        <div class="stat"><span class="d">${L.filter(l=>l.status==='ativo').length}</span><small>viraram alunos</small></div></div>
      <p class="sub">Feche como vocês já fazem. Quando pagar, crie o convite pelo card, e a indicação vai junto.</p>
      ${L.length ? L.map(l => { const ref = refOwner(l.ref_code);
        return `<div class="lead"><header><div><strong>${esc(l.name)}</strong><small>${esc(l.phone)}. Objetivo: ${esc(l.goal || '-')}. Interesse: ${PLAN_LABEL[l.plan] || '-'}.</small>
          <small>${ref ? `Indicado por ${esc(ref.name)}` : 'Sem indicação identificada'}.</small></div><span class="tag ${l.status==='ativo'?'fill':''}">${{novo:'Novo', convidado:'Convite enviado', ativo:'Virou aluno'}[l.status]}</span></header>
          ${l.status === 'novo' ? `<a class="btn line" href="https://wa.me/55${String(l.phone).replace(/\D/g,'')}" target="_blank" rel="noopener">Chamar no WhatsApp</a><button class="btn" data-leadinvite="${l.id}">Pagamento confirmado, criar convite</button>` : ''}</div>`; }).join('') : '<p class="empty">Nenhuma indicação ainda. Elas aparecem quando um amigo escaneia o QR de um aluno.</p>'}`;
  } else {
    const rows = TEAM.students.filter(s => s.bank > 0);
    body = `<h1 class="d hero">Renovações</h1>
      <p class="sub">Descontos de Level e de indicação calculados sozinhos, com teto de 100% por renovação. Gere o link de pagamento já com o valor descontado.</p>
      ${rows.length ? rows.map(s => { const lv = s.discounts.filter(d => !d.used_at && d.source === 'level').reduce((t,d)=>t+d.pct,0), ind = s.bank - lv;
        return `<div class="lead"><header><div><strong>${esc(s.name)}</strong>${lv ? `<small>Level: ${lv}%.</small>` : ''}${ind ? `<small>Indicações: ${ind}%.</small>` : ''}${s.bank > 100 ? `<small>Sobram ${s.bank - 100}% pra renovação seguinte.</small>` : ''}</div>
          <span class="d" style="font-size:40px">${Math.min(100, s.bank)}%</span></header><button class="btn line" data-renew="${s.id}">Link enviado com desconto</button></div>`; }).join('') : '<p class="empty">Nenhum desconto pendente.</p>'}`;
  }
  return `${topBar()}<p class="hello">Painel da equipe</p>${installBanner()}${body}${nav}`;
}
function refOwner(code){ return code ? TEAM.students.find(s => s.refCode === String(code).toUpperCase()) : null; }
function waLink(i){
  const link = `${location.origin}/?convite=${i.code}`;
  const msg = `Oi, ${first(i.name)}! Bem-vindo à Chames Crew 🐺 Crie sua conta no app por aqui: ${link} (código ${i.code}). Depois é só adicionar à tela de início do celular.`;
  return `https://wa.me/55${String(i.phone || '').replace(/\D/g,'').replace(/^55/, '')}?text=${encodeURIComponent(msg)}`;
}
function inviteBox(i){ return `<div class="done" style="margin-top:16px"><strong>Convite criado: ${i.code}</strong><p>Link: ${esc(location.origin)}/?convite=${i.code}</p><a class="btn" href="${waLink(i)}" target="_blank" rel="noopener">Enviar pelo WhatsApp</a></div>`; }
function deliveries(){
  const items = [];
  TEAM.students.filter(trainsSt).forEach(s => { const L = levelInfo(s), round = s.prestige.lv || 0;
    for (let i = 2; i <= L.idx; i++) if (PHYSICAL[i] && !TEAM.rewards.some(r => r.user_id === s.id && r.reward === `level-${i}-p${round}`)) items.push({ s, i, key:`level-${i}-p${round}` }); });
  if (!items.length) return '';
  return `<h2 class="d h2" style="margin-top:4px">Prêmios pra entregar</h2>${items.map(({s, i, key}) => `<div class="lead"><header><div><strong>${esc(s.name)} virou ${LEVELS[i].name}</strong><small>Separar: ${PHYSICAL[i]}.</small></div>${emblem(i, false, 44)}</header>
    <button class="btn line" data-deliver="${s.id}|${key}">Marcar como entregue</button></div>`).join('')}<div style="height:18px"></div>`;
}
function studentView(){
  const st = TEAM.students.find(s => s.id === view.id), tab = view.tab || 'evolucao';
  return `${topBar('Alunos')}<h1 class="d sectitle">${esc(st.name)}</h1>
  <p class="sub">${PLAN_LABEL[st.plan]}. ${weeksDone(st)} semanas de acompanhamento.${st.missing ? ' Check-in pendente.' : ''}</p>
  ${tab === 'evolucao' ? evolution(st, false) : medals(st, false)}${tabsNav([['evolucao','Evolução'],['medalhas','Medalhas']], tab)}`;
}
const curSt = () => view.screen === 'student' ? TEAM.students.find(s => s.id === view.id) : ST;

/* ---------- sobreposições ---------- */
function medalSheet(){
  const st = curSt(), m = medalById(overlay.id), you = st === ST;
  if (m === SEASON){
    const got = seasonGot(st), sc = seasonCount(st);
    return `<div class="sheet-bg" data-close><div class="sheet" role="dialog" aria-label="Temporada">${disc(m, got?0:-1)}
      <h2>Temporada ${esc(m.name)}</h2><p class="tier">Edição limitada</p>
      <p class="prog">${got ? 'Conquistada. Quando a temporada acabar, ninguém mais consegue essa.' : `${sc} de ${m.goal} check-ins na temporada. ${daysLeft() ? `Faltam ${daysLeft()} dias.` : ''}`}</p>
      <div class="bar"><i style="width:${Math.min(100,Math.round(sc/m.goal*100))}%"></i></div>
      ${got && you ? '<button class="btn" data-share="season">Compartilhar conquista</button>' : ''}<button class="btn line" data-close>Fechar</button></div></div>`;
  }
  const t = effTier(st, m), raw = rawEff(st, m), v = effVal(st, m), next = m.th[t+1], n = starsOf(st, m);
  const hidden = m.secret && t < 0, lost = raw > t;
  const strip = TIERS.map((nm,i) => `<div>${disc(m, i, i > t ? 'ghost' : '', n)}<small><b>${nm}</b>${m.th[i]}</small></div>`).join('');
  const canPrestige = you && t === 4 && !lost && n < 5 && m !== RECRUIT && m.id !== 'tempo';
  let prog;
  if (hidden) prog = '<p class="prog">Continua firme nos check-ins. Ela aparece quando você menos esperar.</p>';
  else if (lost) prog = `<p class="prog">Caiu do ${TIERS[raw]} pro ${TIERS[t]} enquanto você esteve fora. Volta com 2 semanas de check-in.</p>`;
  else if (next !== undefined) prog = `<p class="prog">${v} de ${next} ${m.unit} pro ${TIERS[t+1]}${n ? ' ' + '★'.repeat(n) : ''}.</p><div class="bar"><i style="width:${Math.min(100,Math.round(v/next*100))}%"></i></div>`;
  else prog = `<p class="prog">${n >= 5 ? 'Cinco estrelas no Diamante Negro. Lenda da matilha.' : 'Tier máximo. Você pode prestigiar: a medalha volta pro Ferro com mais uma estrela, e o Diamante Negro fica na galeria.'}</p>`;
  const gal = (st.gallery || []).filter(g => g.id === m.id);
  return `<div class="sheet-bg" data-close><div class="sheet" role="dialog" aria-label="${hidden ? 'Medalha secreta' : esc(m.name)}">
    ${disc(m, t, fadeCls(st, m), n)}<h2>${hidden ? 'Medalha secreta' : esc(m.name)}</h2>
    <p class="tier">${t < 0 ? (hidden ? 'Ninguém conta como se ganha' : 'Ainda não desbloqueada') : tierLabel(st, m, t)}</p>
    ${prog}${hidden ? '' : `<div class="strip">${strip}</div>`}
    ${gal.length ? `<p class="rar" style="margin-top:14px">Na galeria: ${gal.map(g => `Diamante Negro${g.stars ? ' ' + '★'.repeat(g.stars) : ''} em ${g.date}`).join(', ')}.</p>` : ''}
    ${canPrestige ? `<button class="btn" data-prestige="${m.id}">Prestigiar ${'★'.repeat(n+1)}</button>` : ''}
    ${t >= 0 && you && !lost ? `<button class="btn${canPrestige ? ' line' : ''}" data-share="${m.id}">Compartilhar conquista</button>` : ''}
    <button class="btn line" data-close>Fechar</button></div></div>`;
}
const LV_FRAME = ['#9a9a9a','linear-gradient(160deg,#f6f9fb,#6f7d8a)','linear-gradient(160deg,#fff3b0,#b8880e 55%,#7a5806)','linear-gradient(160deg,#ff8aa0,#a3122f 50%,#3d0410)','linear-gradient(160deg,#ffffff,#2b2b2b 45%,#000 70%,#9a9a9a)','conic-gradient(from var(--a,0deg),#fff,#9aa6ff,#fff,#ff9ccf,#fff,#8ff0dc,#fff)'];
function levelCardSheet(){
  const st = curSt(), i = +overlay.lv, L = levelInfo(st), you = st === ST;
  const lv = i === 5 ? PRESTIGE : LEVELS[i];
  const unit = L.byTreino ? 'treinos' : 'semanas de check-in';
  const got = i === 5 ? (st.prestige.lv > 0) : i <= L.idx;
  const need = i === 5 ? null : lv[L.key];
  const req = i === 5 ? 'Chegar na Elite e prestigiar' : i === 0 ? 'Entrar na matilha' : `${need} ${unit}`;
  const prog = got ? 'Conquistado' : i === 5 ? (L.idx === 4 ? 'Você já pode prestigiar' : 'Primeiro, chegar na Elite') : `${L.val} de ${need}. Faltam ${need - L.val}, uns ${eta(st, need - L.val, L.byTreino)}.`;
  const pct = got ? 100 : i === 5 ? 0 : Math.round(L.val / need * 100);
  const locked = !trainsSt(st);
  const perks = `<div class="perks${locked ? ' locked' : ''}"><b>Benefícios</b>${locked ? '<p>Exclusivo para quem treina com a gente.</p>' : ''}${lv.perks.map(x => `<span>${esc(x)}</span>`).join('')}</div>`;
  let action = '';
  if (you){
    if (i === 5 && L.idx === 4 && trainsSt(st)) action = `<button class="btn" data-lvprestige>Prestigiar</button>`;
    else if (got) action = `<button class="btn" data-sticker="${i}">Gerar figurinha</button>`;
    else action = `<button class="btn" disabled>Conquiste pra compartilhar</button>`;
    if (locked && CFG.whatsapp.length > 4) action += `<a class="btn line" href="${wa(CFG.whatsapp, `Oi! Sou ${meName()}, da Chames Crew (plano de nutrição), e quero treinar com a equipe também.`)}" target="_blank" rel="noopener">Quero treinar com a equipe</a>`;
  }
  return `<div class="sheet-bg" data-close><div class="sheet lsheet" role="dialog" aria-label="Carta ${lv.name}">
    <div class="lcard${i === 5 ? ' holo' : ''}" style="background:${LV_FRAME[i]}"><div class="face">
      <header><span class="d">${lv.name}</span><small>${i === 5 ? 'Final' : `${i + 1} de 5`}</small></header>
      <div class="art lvart${i}">${emblem(i, false, 150)}${got ? '' : '<span class="stamp">Bloqueado</span>'}</div>
      <div class="row2"><span>Requisito</span><b>${req}</b></div>
      <div class="row2"><span>Quando</span><b>${lv.when}</b></div>
      <div class="row2 col"><span>${got ? 'Status' : 'Progresso'}</span><b>${prog}</b><div class="bar"><i style="width:${pct}%"></i></div></div>
      ${perks}<footer class="d">CHAMES CREW</footer>
    </div></div>${action}<button class="btn line" data-close>Fechar</button></div></div>`;
}
function unlockScreen(){
  const u = overlay, m = medalById(u.id);
  const sub = m === SEASON ? 'Edição limitada' : tierLabel(ST, m, u.tier);
  return `<div class="unlock" role="dialog" aria-label="Medalha desbloqueada">${disc(m, m === SEASON ? 0 : u.tier, '', m === SEASON ? 0 : starsOf(ST, m))}
    <small>${u.prestige ? 'Prestígio' : u.tier > 0 && m !== SEASON ? 'Medalha subiu de tier' : 'Medalha desbloqueada'}</small>
    <h2>${m === SEASON ? 'Temporada ' + esc(m.name) : esc(m.name)}</h2><div class="tier">${sub}</div>
    <p>${u.prestige ? 'O Diamante Negro foi pra sua galeria. Agora é subir de novo, com mais uma estrela.' : m === RECRUIT ? 'Seu amigo virou aluno. +10% de desconto na renovação.' : 'Mandou bem. Continua assim.'}</p>
    <div class="acts"><button data-share="${u.id}" data-tier="${u.tier}">Compartilhar no Stories</button><button class="alt" data-next>Continuar</button></div></div>`;
}
function storyScreen(){
  const m = medalById(overlay.id), t = overlay.tier ?? (m === SEASON ? 0 : effTier(ST, m)), L = levelInfo(ST);
  const sub = m === SEASON ? 'Edição limitada' : tierLabel(ST, m, t);
  return `<div class="story-bg" role="dialog" aria-label="Card para o Stories">
    <div class="story"><span class="d brand">CHAMES CREW</span>
      <div>${disc(m, t, '', m === SEASON ? 0 : starsOf(ST, m))}<h3>${m === SEASON ? 'Temporada ' + esc(m.name) : esc(m.name)}</h3><div class="t">${sub}</div><div class="who">${esc(first(ST.name))}, level ${L.cur.name}</div></div>
      <div class="inv"><div class="qr" id="qr">QR</div><span>Bora treinar comigo?<br>Escaneia e vem pra matilha.<br><b>Código ${esc(ST.refCode)}</b></span></div>
    </div>
    <p class="hint">Tire um print desta tela e poste no Stories.</p>
    <div class="story-acts"><button class="alt" data-close>Fechar</button></div></div>`;
}
function party(){
  const { ups } = insights(ST);
  const f = ups.find(i => i.q.id === 'freq');
  let big, title, text;
  if (f){ big = `${f.p}<small>→</small>${f.c}`; title = 'Treinos na semana'; text = `Mandou bem. ${ups.length > 1 ? `E mais ${ups.length-1} coisas melhoraram.` : ''}`; }
  else if (ups.length){ big = `${ups.length}`; title = ups.length === 1 ? 'Coisa melhorou' : 'Coisas melhoraram'; text = ups[0].t; }
  else { big = '✓'; title = 'Check-in enviado'; text = 'Semana registrada. Constância é o que transforma.'; }
  return `<div class="party" role="dialog" aria-label="Check-in enviado"><div class="d big">${big}</div><h2>${title}</h2><p>${esc(text)}</p><button data-next>${queue.length ? 'Continuar' : 'Ver minha evolução'}</button></div>`;
}
function consentSheet(){
  return `<div class="sheet-bg" data-close><div class="sheet" role="dialog" aria-label="Termo das fotos" style="text-align:left">
    <h2 style="margin-top:0">Fotos de evolução</h2>
    <p class="prog">Suas fotos servem só pra acompanhar sua evolução. Ficam guardadas com segurança e só a equipe Chames Crew tem acesso.</p>
    <p class="prog">Elas nunca são publicadas nem compartilhadas. Se um dia a gente quiser usar alguma, vai te perguntar antes, numa conversa, e só usa com o seu sim.</p>
    <p class="prog">Você pode apagar suas fotos quando quiser.</p>
    <label class="consent"><input type="checkbox" data-consentbox>Li e aceito enviar minhas fotos de evolução nessas condições.</label>
    <button class="btn" data-acceptphotos disabled>Aceitar e enviar fotos</button><button class="btn line" data-close>Agora não</button></div></div>`;
}
function verifyScreen(){
  const v = overlay; let body;
  if (v.state === 'checking') body = `<div class="vphoto">${v.img ? `<img src="${v.img}" alt="Foto do treino">` : '<span>Foto</span>'}<div class="scan"></div></div><h2>Conferindo seu treino…</h2><p>Academia, corrida, casa ou ar livre: tudo vale.</p>`;
  else if (v.state === 'ok'){ const L = levelInfo(ST); body = `<div class="vok">✓</div><h2>Treino validado</h2>${v.why ? `<p>${esc(v.why)}</p>` : ''}<p>Treino ${L.val}${L.next ? `, rumo ao ${L.next.name}` : ''}.</p>
    <div class="acts"><button data-dsticker>Gerar figurinha do treino</button><button class="alt" data-close>Fechar</button></div>`; }
  else body = `<div class="vok no">!</div><h2>Não deu pra confirmar</h2>${v.why ? `<p>${esc(v.why)}</p>` : ''}<p>Tenta outra foto mostrando o lugar do treino ou você com roupa de treino.</p>
    <div class="acts"><label class="cam2">Tirar outra foto<input type="file" accept="image/*" capture="environment" data-dailyphoto></label><button class="alt" data-close>Agora não</button></div>`;
  return `<div class="unlock verify" role="dialog" aria-label="Verificação do treino">${body}</div>`;
}
function stickerScreen(){
  return `<div class="story-bg" role="dialog" aria-label="Figurinha"><div class="checker">${overlay.png ? `<img src="${overlay.png}" alt="Figurinha com fundo transparente">` : '<p>Gerando figurinha…</p>'}</div>
    <p class="hint">Toque e segure na imagem pra salvar. No Stories, cole como figurinha por cima da foto do seu treino.</p>
    <div class="story-acts">${overlay.png ? '<button data-sharepng>Compartilhar figurinha</button>' : ''}<button class="alt" data-close>Fechar</button></div></div>`;
}

/* ---------- figurinhas (PNG transparente) ---------- */
const STK = [
  { rim:['#bdbdbd','#8a8a8a'], fill:['#d0d0d0','#b0b0b0'], body:'#8d8d8d', eye:'#cfcfcf' },
  { rim:['#f6f9fb','#6f7d8a'], fill:['#f1f5f8','#b4c0ca'], body:'#1a2632', eye:'#dfe6ec' },
  { rim:['#fff3b0','#7a5806'], fill:['#fff4b8','#b8880e'], body:'#2a1d00', eye:'#f7dc7a' },
  { rim:['#ff8aa0','#3d0410'], fill:['#ff5577','#7a0c24'], body:'#ffffff', eye:'#a3122f', glow:'#e0234e' },
  { rim:['#ffffff','#3a3a3a'], fill:['#3c3c3c','#000000'], body:'#161616', eye:'#ffffff', glow:'#ffffff', stroke:'#8a8a8a' },
  { rim:['#ffffff','#b9c2ff'], fill:['#ffffff','#e2e7ff'], body:'#111111', eye:'#ffffff', glow:'#ffffff' }
];
function stickerSVG(i){
  const c = STK[i];
  const w = wolfSVG(i).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/currentColor/g, c.body).replace(/var\(--eye\)/g, c.eye)
    .replace(/class="eyeglow" fill="#fff"/g, 'fill="#fff" filter="url(#eg)"').replace(/class="body"/g, c.stroke ? `stroke="${c.stroke}" stroke-width="1.2"` : '');
  const hex = s => { const r = s/2; return [[0,-r],[r*.86,-r/2],[r*.86,r/2],[0,r],[-r*.86,r/2],[-r*.86,-r/2]].map(([x,y]) => `${300+x},${300+y}`).join(' '); };
  const holo = i === 5 ? '<stop offset=".33" stop-color="#ff9ccf"/><stop offset=".66" stop-color="#8ff0dc"/>' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs>
    <linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.rim[0]}"/>${holo}<stop offset="1" stop-color="${c.rim[1]}"/></linearGradient>
    <linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.fill[0]}"/><stop offset="1" stop-color="${c.fill[1]}"/></linearGradient>
    <filter id="eg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="gl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter></defs>
    ${c.glow ? `<polygon points="${hex(520)}" fill="${c.glow}" opacity=".55" filter="url(#gl)"/>` : ''}
    <polygon points="${hex(520)}" fill="url(#r)"/><polygon points="${hex(462)}" fill="url(#f)"/><g transform="translate(130 130) scale(3.4)">${w}</g></svg>`;
}
async function svgImg(i){ const img = new Image(); await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(stickerSVG(i)); }); return img; }
function canvasText(ctx, t, x, y, font, lw){ ctx.font = font; ctx.lineWidth = lw; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineJoin = 'round'; ctx.strokeText(t, x, y); ctx.fillStyle = '#fff'; ctx.fillText(t, x, y); }
async function makeLevelSticker(i){
  const cv = document.createElement('canvas'); cv.width = 720; cv.height = 900; const ctx = cv.getContext('2d');
  ctx.drawImage(await svgImg(i), 60, 10, 600, 600);
  try { await document.fonts.load('900 120px "Big Shoulders Display"'); } catch(e){}
  ctx.textAlign = 'center';
  canvasText(ctx, (i === 5 ? PRESTIGE.name : LEVELS[i].name).toUpperCase(), 360, 720, '900 118px "Big Shoulders Display", Impact, sans-serif', 14);
  const nm = ST.name.split(' '); canvasText(ctx, (nm[0] + (nm[1] ? ' ' + nm[1][0] + '.' : '')).toUpperCase(), 360, 790, '800 46px "Big Shoulders Display", Impact, sans-serif', 9);
  canvasText(ctx, 'CHAMES CREW', 360, 862, '900 44px "Big Shoulders Display", Impact, sans-serif', 9);
  return cv.toDataURL('image/png');
}
async function makeDailySticker(){
  const L = levelInfo(ST);
  const cv = document.createElement('canvas'); cv.width = 720; cv.height = 600; const ctx = cv.getContext('2d');
  if (!ctx.roundRect) ctx.roundRect = function(x, y, w, h){ this.rect(x, y, w, h); };
  ctx.drawImage(await svgImg(L.idx), 245, 10, 230, 230);
  try { await document.fonts.load('900 100px "Big Shoulders Display"'); await document.fonts.load('700 30px Manrope'); } catch(e){}
  ctx.textAlign = 'center';
  canvasText(ctx, 'TREINO FEITO', 360, 350, '900 112px "Big Shoulders Display", Impact, sans-serif', 12);
  const key = L.key, pct = L.next ? (L.val - L.cur[key]) / (L.next[key] - L.cur[key]) : 1;
  const x = 150, y = 395, w = 420, h = 14;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.roundRect(x-4, y-4, w+8, h+8, 11); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x, y, Math.max(h, w * pct), h, 7); ctx.fill();
  canvasText(ctx, `Treino ${L.val}${L.next ? `, rumo ao ${L.next.name}` : ''}`, 360, 460, '700 32px Manrope, sans-serif', 7);
  canvasText(ctx, 'CHAMES CREW', 360, 535, '900 44px "Big Shoulders Display", Impact, sans-serif', 8);
  return cv.toDataURL('image/png');
}

/* ---------- desbloqueios (compara com o que o aluno já viu) ---------- */
function checkUnlocks(){
  if (!ST) return;
  const key = 'cc-seen-' + ST.id, now = tiersSnapshot(ST);
  let seen = null; try { seen = JSON.parse(localStorage.getItem(key)); } catch(e){}
  try { localStorage.setItem(key, JSON.stringify(now)); } catch(e){}
  if (!seen) return [];
  return diffUnlocks(seen, now).map(u => ({ type:'unlock', ...u }));
}
function showNext(){
  overlay = queue.shift() || null;
  if (overlay && overlay.type === 'unlock') try { navigator.vibrate && navigator.vibrate([30,40,90]); } catch(e){}
  if (!overlay && view.afterQueue){ view.tab = view.afterQueue; view.afterQueue = null; scrollTo(0,0); }
}

/* ---------- render ---------- */
function render(){
  let html;
  if (view.screen === 'loading') html = `${topBar()}<p class="empty" style="margin-top:40px">Carregando…</p>`;
  else if (view.screen === 'friend') html = friendView();
  else if (view.screen === 'login') html = loginView();
  else if (view.screen === 'install') html = installView();
  else if (view.screen === 'waiting') html = waitingView();
  else if (view.screen === 'student') html = studentView();
  else if (view.screen === 'section') html = section();
  else html = ME.role === 'equipe' ? teamHub() : hubAluno();
  if (overlay) html += ({ party, unlock:unlockScreen, medal:medalSheet, story:storyScreen, consent:consentSheet, lvcard:levelCardSheet, sticker:stickerScreen, verify:verifyScreen })[overlay.type]();
  if (view.toast) html += `<div class="toast" role="status">${esc(view.toast)}</div>`;
  $('#app').innerHTML = html;
  if (overlay && overlay.type === 'story'){
    const el = document.getElementById('qr');
    try { if (window.QRCode && el){ el.textContent = ''; new QRCode(el, { text:`${location.origin}/?ref=${ST.refCode}`, width:180, height:180, colorDark:'#000000', colorLight:'#ffffff' }); } } catch(e){}
  }
}
function toast(t){ view.toast = t; render(); clearTimeout(toast.h); toast.h = setTimeout(() => { view.toast = null; render(); }, 2800); }

/* ---------- inicialização ---------- */
async function boot(){
  if (params.get('ref')){
    view = { screen:'friend', ref:params.get('ref') }; render();
    const { data } = await sb.rpc('ref_name', { code:params.get('ref') }); view.refName = data || null; render(); return;
  }
  const { data:{ session } } = await sb.auth.getSession();
  if (!session){ view = { screen:'login', mode: savedInvite() ? 'signup' : 'login' }; render(); return; }
  await enter();
}
async function enter(){
  view = { screen:'loading' }; render();
  const { data:{ user } } = await sb.auth.getUser();
  const { data:p } = await sb.from('profiles').select('*').eq('id', user.id).single();
  ME = p;
  if (!p){ view = { screen:'waiting' }; ME = { name:'' }; render(); return; }
  if (p.role === 'equipe'){ await loadTeam(); view = { screen: needsInstall() ? 'install' : 'hub' }; render(); return; }
  if (!p.plan){ view = { screen:'waiting' }; render(); return; }
  await loadStudent();
  view = { screen: needsInstall() ? 'install' : 'hub' };
  queue = checkUnlocks() || []; showNext();
  render();
}
async function refreshStudent(){ const before = tiersSnapshot(ST); await loadStudent(); const u = diffUnlocks(before, tiersSnapshot(ST)); try { localStorage.setItem('cc-seen-' + ST.id, JSON.stringify(tiersSnapshot(ST))); } catch(e){} return u; }

/* ---------- ações ---------- */
async function shrink(file){
  const url = typeof file === 'string' ? file : await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
  const im = new Image(); await new Promise((ok, bad) => { im.onload = ok; im.onerror = bad; im.src = url; });
  const k = Math.min(1, 1280 / Math.max(im.width, im.height));
  const cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
  cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
  return { url, blob: await new Promise(r => cv.toBlob(r, 'image/jpeg', .8)), b64: cv.toDataURL('image/jpeg', .8).split(',')[1] };
}
async function markTraining(verified){
  const { error } = await sb.from('trainings').insert({ user_id:ST.id, day:TODAY(), verified });
  if (error && !/duplicate/i.test(error.message)) throw error;
  if (ST.sentThisWeek.treino){ /* frequência da semana é recalculada ao carregar */ }
  return await refreshStudent();
}
async function dailyWithPhoto(file){
  const s = await shrink(file);
  overlay = { type:'verify', state:'checking', img:s.url }; render();
  try {
    const { data, error } = await sb.functions.invoke('verificar-foto', { body:{ image:s.b64 } });
    if (error) throw error;
    if (!data.ok){ overlay = { type:'verify', state:'no', why:data.why }; render(); return; }
    const unlocks = await markTraining(true);
    overlay = { type:'verify', state:'ok', why:data.why }; queue = unlocks.map(u => ({ type:'unlock', ...u }));
    try { navigator.vibrate && navigator.vibrate(40); } catch(e){}
    render();
  } catch(e){ overlay = null; toast('Não deu pra conferir a foto agora. Tenta de novo em instantes.'); }
}

document.addEventListener('input', e => {
  const d = e.target.dataset || {};
  if (d.consentbox !== undefined){ const b = document.querySelector('[data-acceptphotos]'); if (b) b.disabled = !e.target.checked; return; }
  if (d.i !== undefined){ view.inv[d.i] = e.target.value; return; }
  if (d.f !== undefined && view.form){
    view.form[d.f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const b = document.querySelector('[data-sendlead]'); const f = view.form;
    if (b) b.disabled = !(f.name.trim() && f.phone.trim() && f.goal && f.plan && f.ok);
  }
});
document.addEventListener('change', async e => {
  const d = e.target.dataset || {};
  if (d.f === 'ok' || d.consentbox !== undefined) return;
  if (d.dailyphoto !== undefined && e.target.files[0]){ dailyWithPhoto(e.target.files[0]); return; }
  if (d.photo !== undefined && e.target.files[0]){
    toast('Enviando foto…');
    const s = await shrink(e.target.files[0]);
    const path = `${ST.id}/${TODAY().slice(0,7)}-${d.photo}.jpg`;
    const { error } = await sb.storage.from('fotos').upload(path, s.blob, { upsert:true, contentType:'image/jpeg' });
    if (error){ toast('Não deu pra enviar a foto.'); return; }
    view.photosFor = null; toast('Foto salva.');
  }
});
document.addEventListener('click', async e => {
  const t = e.target.closest('button, .sheet-bg'); if (!t) return;
  if (t.classList.contains('sheet-bg') && e.target !== t) return;
  const d = t.dataset;
  try {
    if (d.close !== undefined){ overlay = null; if (queue.length) showNext(); }
    else if (d.mode){ view.mode = d.mode; view.err = null; }
    else if (d.itab){ view.itab = d.itab; }
    else if (d.showinstall !== undefined){ view = { screen:'install' }; scrollTo(0,0); }
    else if (d.skipinstall !== undefined){ try { sessionStorage.setItem('cc-skip-install', '1'); } catch(e){} view = { screen:'hub' }; scrollTo(0,0); }
    else if (d.doinstall !== undefined){ if (installEvt){ installEvt.prompt(); const r = await installEvt.userChoice; installEvt = null; if (r.outcome === 'accepted') toast('Instalado! Abra pelo ícone do lobo.'); } }
    else if (d.login !== undefined){
      const { error } = await sb.auth.signInWithPassword({ email:view.form.email.trim(), password:view.form.pass });
      if (error){ view.err = 'E-mail ou senha incorretos.'; } else { await enter(); return; }
    }
    else if (d.signup !== undefined){
      const f = view.form;
      if (!f.name.trim() || !f.email.trim() || f.pass.length < 6 || !f.code.trim()){ view.err = 'Preencha nome, e-mail, senha com 6 caracteres ou mais e o código do convite.'; }
      else {
        const { data, error } = await sb.auth.signUp({ email:f.email.trim(), password:f.pass, options:{ data:{ name:f.name.trim(), invite:f.code.trim().toUpperCase() } } });
        if (error) view.err = /registered/i.test(error.message) ? 'Esse e-mail já tem conta. Toque em Já tenho conta.' : 'Não deu pra criar a conta: ' + error.message;
        else if (!data.session){ view.mode = 'login'; view.err = null; toast('Conta criada! Confirme pelo link que chegou no seu e-mail e depois entre.'); return; }
        else { try { localStorage.removeItem('cc-convite'); } catch(e){} history.replaceState(null, '', '/'); await enter(); return; }
      }
    }
    else if (d.forgot !== undefined){
      if (!view.form.email.trim()){ view.err = 'Digite seu e-mail no campo acima.'; }
      else { await sb.auth.resetPasswordForEmail(view.form.email.trim(), { redirectTo: location.origin }); toast('Enviamos um link pro seu e-mail.'); return; }
    }
    else if (d.logout !== undefined){ await sb.auth.signOut(); ME = ST = TEAM = null; view = { screen:'login', mode:'login' }; }
    else if (d.open){ view = { screen:'section', sec:d.open, tab:d.tabgo || 'checkin' }; scrollTo(0,0); }
    else if (d.student){ view = { screen:'student', id:d.student, tab:'evolucao' }; scrollTo(0,0); }
    else if (d.home !== undefined){ view = { screen:'hub', ttab:view.ttab }; scrollTo(0,0); }
    else if (d.tab){ if (view.screen === 'hub') view.ttab = d.tab; else { view.tab = d.tab; view.edit = false; if (d.tab === 'ranking') view.rank = null; } scrollTo(0,0); }
    else if (d.edit !== undefined){ view.edit = true; }
    else if (d.q){ view.draft[d.q] = +d.v; }
    else if (d.send !== undefined){
      const s = SECTIONS[view.sec], tw = THIS_WEEK();
      const rows = s.groups.map(g => { const a = {}; Q[g].filter(q => q.id !== 'freq').forEach(q => a[q.id] = view.draft[q.id]); return { user_id:ST.id, week_start:tw, grp:g, answers:a }; });
      const { error } = await sb.from('checkins').upsert(rows, { onConflict:'user_id,week_start,grp' });
      if (error){ toast('Não deu pra enviar. Confere a internet e tenta de novo.'); return; }
      view.draft = {}; view.edit = false;
      const unlocks = await refreshStudent();
      queue = [{ type:'party' }, ...unlocks.map(u => ({ type:'unlock', ...u }))]; view.afterQueue = 'evolucao'; showNext();
    }
    else if (d.next !== undefined){ showNext(); }
    else if (d.train !== undefined){ const unlocks = await markTraining(false); queue = unlocks.map(u => ({ type:'unlock', ...u })); toast('Treino de hoje registrado ✓'); if (queue.length) showNext(); }
    else if (d.medal){ overlay = { type:'medal', id:d.medal }; }
    else if (d.lvcard !== undefined){ overlay = { type:'lvcard', lv:d.lvcard }; }
    else if (d.share){ overlay = { type:'story', id:d.share, tier: d.tier !== undefined ? +d.tier : undefined }; }
    else if (d.invite !== undefined){ overlay = { type:'story', id:'recrutador', tier: Math.max(0, effTier(ST, RECRUIT)) }; }
    else if (d.sticker !== undefined || d.dsticker !== undefined){
      overlay = { type:'sticker' }; render();
      const png = d.sticker !== undefined ? await makeLevelSticker(+d.sticker) : await makeDailySticker();
      if (overlay && overlay.type === 'sticker') overlay.png = png;
    }
    else if (d.sharepng !== undefined){
      try { const blob = await (await fetch(overlay.png)).blob(); const file = new File([blob], 'chames-crew.png', { type:'image/png' });
        if (navigator.canShare && navigator.canShare({ files:[file] })) await navigator.share({ files:[file] }); else toast('Toque e segure na imagem pra salvar.'); } catch(err){ toast('Toque e segure na imagem pra salvar.'); }
      return;
    }
    else if (d.prestige){
      const m = medalById(d.prestige), n = (ST.prestige[m.id] || 0) + 1;
      const prestige = { ...ST.prestige, [m.id]:n }, pbase = { ...ST.pbase, [m.id]: medalVal(ST, m) - m.th[0] };
      const gallery = [...ST.gallery, { id:m.id, stars:n-1, date:new Date().toLocaleDateString('pt-BR', { month:'short', year:'numeric' }) }];
      await sb.from('profiles').update({ prestige, pbase, gallery }).eq('id', ST.id);
      Object.assign(ME, { prestige, pbase, gallery }); await refreshStudent();
      overlay = null; queue = [{ type:'unlock', id:m.id, tier:0, prestige:true }]; showNext();
    }
    else if (d.lvprestige !== undefined){
      const prestige = { ...ST.prestige, lv:(ST.prestige.lv || 0) + 1 }, pbase = { ...ST.pbase, lv: ST.trainingsTotal };
      await sb.from('profiles').update({ prestige, pbase }).eq('id', ST.id); Object.assign(ME, { prestige, pbase }); await refreshStudent();
      overlay = null; toast('Prestígio conquistado! Seu nome entrou no Hall da matilha.');
      return;
    }
    else if (d.pause){
      const upd = d.pause === 'on' ? { pause_until:addDays(TODAY(), 7), pause_left:ST.pauseLeft - 1 } : { pause_until:null };
      await sb.from('profiles').update(upd).eq('id', ST.id); Object.assign(ME, upd); await refreshStudent();
    }
    else if (d.rank !== undefined){ const v = d.rank === '1'; await sb.from('profiles').update({ rank_opt:v }).eq('id', ST.id); ME.rank_opt = v; ST.rankOpt = v; view.rank = null; }
    else if (d.rmode){ view.rmode = d.rmode; }
    else if (d.photoconsent !== undefined){ overlay = { type:'consent' }; }
    else if (d.acceptphotos !== undefined){ await sb.from('profiles').update({ photo_consent:true, photo_consent_at:new Date().toISOString() }).eq('id', ST.id); ME.photo_consent = true; ST.photoConsent = true; overlay = null; toast('Pronto! Agora é só tocar em + Foto.'); return; }
    else if (d.fgoal){ view.form.goal = d.fgoal; }
    else if (d.fplan){ view.form.plan = d.fplan; }
    else if (d.sendlead !== undefined){
      const f = view.form;
      const { error } = await sb.from('leads').insert({ name:f.name.trim(), phone:f.phone.trim(), goal:f.goal, plan:f.plan, ref_code:String(view.ref || '').toUpperCase(), consent:true });
      if (error) view.err = 'Não deu pra enviar. Tenta de novo.'; else view.sentLead = true;
    }
    /* equipe */
    else if (d.iplan){ view.inv.plan = d.iplan; }
    else if (d.mkinvite !== undefined){
      const f = view.inv; if (!f.name.trim()){ toast('Coloque o nome do aluno.'); return; }
      const { data, error } = await sb.from('invites').insert({ name:f.name.trim(), phone:f.phone.trim(), plan:f.plan, created_by:ME.id, lead_id:f.lead_id || null, ref_id:f.ref_id || null }).select().single();
      if (error){ toast('Não deu pra criar o convite.'); return; }
      if (f.lead_id) await sb.from('leads').update({ status:'convidado' }).eq('id', f.lead_id);
      view.lastInvite = data; view.inv = { name:'', phone:'', plan:'coach' }; await loadTeam();
    }
    else if (d.leadinvite){
      const l = TEAM.leads.find(x => x.id === d.leadinvite), ref = refOwner(l.ref_code);
      view.inv = { name:l.name, phone:l.phone, plan:l.plan || 'coach', lead_id:l.id, ref_id:ref ? ref.id : null }; view.lastInvite = null; view.ttab = 'convites'; scrollTo(0,0);
    }
    else if (d.renew){
      const s = TEAM.students.find(x => x.id === d.renew); let left = 100;
      const open = s.discounts.filter(x => !x.used_at).sort((a,b) => (a.source === 'level' ? -1 : 1) - (b.source === 'level' ? -1 : 1));
      for (const x of open){
        if (left <= 0) break;
        if (x.pct <= left){ await sb.from('discounts').update({ used_at:new Date().toISOString() }).eq('id', x.id); left -= x.pct; }
        else { await sb.from('discounts').update({ pct:x.pct - left }).eq('id', x.id); left = 0; }
      }
      await loadTeam(); toast('Desconto aplicado. O que sobrou fica pra próxima.'); return;
    }
    else if (d.deliver){ const [uid, reward] = d.deliver.split('|'); await sb.from('rewards').insert({ user_id:uid, reward }); await loadTeam(); toast('Entrega registrada.'); return; }
    else return;
  } catch(err){ console.error(err); toast('Algo deu errado. Tenta de novo.'); return; }
  render();
});

if (sb) sb.auth.onAuthStateChange((ev) => { if (ev === 'PASSWORD_RECOVERY'){ const p = prompt('Digite sua nova senha (mínimo 6 caracteres):'); if (p && p.length >= 6) sb.auth.updateUser({ password:p }).then(() => toast('Senha atualizada.')); } });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
if (!CONFIGURED) { $('#app').innerHTML = '<div class="top"><span class="d brand">CHAMES CREW</span></div><h1 class="d hero" style="margin-top:36px">Falta configurar</h1><p class="sub">Abra o arquivo config.js e cole o endereço e a chave do Supabase.</p>'; }
else boot();
