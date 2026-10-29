/* =====================================================================
   CHAMES CREW · painel da equipe (consultoria, ficha do aluno, modelos)
   Roda isolado num Shadow DOM, usando o banco do app (sb, ME, TEAM).
   Usa as utilidades do aluno.js (window.CC2).
   ===================================================================== */
(function(){
'use strict';
const K = () => window.CC2;
let host = null, root = null, mounted = false, CSS3 = '';
const P = { tab:'alunos', q:'', tplKind:'treino', tplTag:'' };
const T = { profiles:[], daily:[], meals:[], logs:[], closes:[], diets:[], workouts:[], templates:[], awards:[], loaded:false };
let FX = null;            // ficha aberta
const $r = s => root.querySelector(s);
const esc = t => K().esc2(t);
const nf = n => K().nf(n);
const first = n => (n || '').trim().split(' ')[0];
const PLAN_N = { coach:'Treino + dieta', treino:'Só treino', nutri:'Só dieta' };
const hasTr = p => p.plan !== 'nutri', hasDi = p => p.plan !== 'treino';
const LETTERS = 'ABCDEFGH';
const clone = o => JSON.parse(JSON.stringify(o));
const kgf = v => String(v ?? 0).replace('.', ',');

/* ---------- dados ---------- */
async function loadAll(){
  const cache = K().lsGet('cc3-team', null);
  if (cache && !T.loaded) Object.assign(T, cache, { loaded:true });
  const t = TODAY();
  try {
    const R = await Promise.all([
      sb.from('profiles').select('*').eq('role', 'aluno'),
      sb.from('daily_checkins').select('*').gte('day', addDays(t, -14)),
      sb.from('meal_logs').select('user_id,day,meal_idx').gte('day', addDays(t, -14)),
      sb.from('workout_logs').select('*').gte('day', addDays(t, -56)),
      sb.from('week_closes').select('*').gte('week_start', addDays(t, -42)),
      sb.from('diets').select('*'),
      sb.from('workouts').select('*').order('position'),
      sb.from('templates').select('*').order('updated_at', { ascending:false }),
      sb.from('awards').select('*').order('created_at', { ascending:false })
    ]);
    if (R[0].error) throw R[0].error;
    ['profiles','daily','meals','logs','closes','diets','workouts','templates','awards'].forEach((k, i) => { if (!R[i].error) T[k] = R[i].data || []; });
    T.loaded = true;
    try { localStorage.setItem('cc3-team', JSON.stringify({ profiles:T.profiles, daily:T.daily, meals:T.meals, logs:T.logs, closes:T.closes, diets:T.diets, workouts:T.workouts, templates:T.templates, awards:T.awards })); } catch(e){}
  } catch(e){ T.loaded = true; }
}
const students = () => T.profiles.filter(p => p.plan).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
const prof = id => T.profiles.find(p => p.id === id);
const lvOf = p => { const s = p.stats || {}; return (p.prestige && p.prestige.lv > 0) ? 5 : Math.min(4, s.lv || 0); };
const dietOf = id => T.diets.find(d => d.user_id === id) || null;
const wksOf = id => T.workouts.filter(w => w.user_id === id).sort((a, b) => a.position - b.position);

/* ---------- consultoria: como cada aluno está hoje ---------- */
function today(p){
  const t = TODAY(), id = p.id;
  const lg = T.logs.filter(x => x.user_id === id && x.day === t && x.finished_at).slice(-1)[0];
  const dc = T.daily.find(x => x.user_id === id && x.day === t);
  const meals = ((dietOf(id) || {}).meals || []).length, mk = T.meals.filter(x => x.user_id === id && x.day === t).length;
  let tr = 'no', trl = 'não treinou';
  if (lg){ const pc = K().logPct(lg); tr = pc >= 75 ? 'ok' : 'mid'; trl = pc >= 100 ? 'treino ✓' : `treino parcial (${pc}%)`; }
  else if (dc && dc.answers && dc.answers[0] === 2){ tr = 'rest'; trl = 'descanso'; }
  // o que pede atenção
  const att = [];
  const pain = T.logs.filter(x => x.user_id === id && x.day >= addDays(t, -3)).flatMap(x => (x.skipped || []).filter(k => k.reason === 'dor').map(k => ({ ...k, day:x.day })));
  pain.slice(-2).forEach(k => att.push(`Dor${k.area ? ' (' + k.area.toLowerCase() + ')' : ''}: pulou ${k.name}${k.day === t ? ' hoje' : ''}`));
  const lastCi = T.daily.filter(x => x.user_id === id).map(x => x.day).sort().slice(-1)[0];
  const gap = lastCi ? Math.max(0, diffDaysIdx(lastCi, t) - (dc ? 0 : 1)) : null;
  if (!dc && gap !== null && gap >= 2) att.push(`Sem check-in há ${gap + 1} dias`);
  if (!lastCi && diffDaysIdx((p.created_at || t).slice(0, 10), t) >= 2) att.push('Ainda não fez nenhum check-in');
  const wc = T.closes.filter(x => x.user_id === id).sort((a, b) => a.week_start < b.week_start ? 1 : -1)[0];
  if (wc && wc.week_start >= addDays(weekStart(t), -7)){
    if (wc.pain >= 2) att.push(`Fechou a semana com dor ${wc.pain === 3 ? 'forte' : 'moderada'}`);
    if (wc.message) att.push(`Recado: "${wc.message.slice(0, 80)}${wc.message.length > 80 ? '…' : ''}"`);
    if (wc.auto) att.push('Não fechou a semana (fechou sozinha, sem peso)');
  }
  if (hasTr(p) && !wksOf(id).length) att.push('Falta montar o treino');
  if (hasDi(p) && !meals) att.push('Falta montar a dieta');
  return { tr, trl, meals, mk, ci:!!dc, att };
}
function vAlunos(){
  const L = students().filter(p => !P.q || K().NRM(p.name).includes(K().NRM(P.q))).map(p => ({ p, d:today(p) }))
    .sort((a, b) => (b.d.att.length > 0) - (a.d.att.length > 0) || (a.d.ci - b.d.ci) || (a.p.name || '').localeCompare(b.p.name || ''));
  const att = L.filter(x => x.d.att.length).length, ci = L.filter(x => x.d.ci).length;
  const mob = !isStandalone() && (isIOS() || isAndroid());
  return `<div class="hero"><span class="motto">Painel da equipe</span><h2 class="d">Sua matilha hoje</h2><p class="sub">${longDateT()}</p></div>
    ${mob ? `<div class="block frost"><span class="lbl">Você está no navegador</span><p style="margin:6px 0 0;font-weight:700">Instale o app na tela do celular para abrir com um toque.</p><button class="btn solid wide" style="margin-top:12px" data-p-install>Ver como instalar (${isIOS() ? 'iPhone' : 'Android'})</button></div>` : ''}
    <div class="pgrid" style="margin:0"><div><small>Alunos</small><b>${L.length}</b></div><div><small>Check-in hoje</small><b>${ci}</b></div></div>
    ${prizes()}
    <div class="pn-sec"><span class="pn-n">1</span><span class="d">Consultoria</span><span class="pill">${att ? att + (att > 1 ? ' alertas' : ' alerta') : 'tudo certo'}</span></div>
    <input class="inp" data-p-q placeholder="Buscar aluno" value="${esc(P.q)}" aria-label="Buscar aluno" autocomplete="off">
    <div class="block frost" id="students">${L.length ? L.map(({ p, d }) => `<button class="cs-row" data-fx="${p.id}">${RA.emblem(lvOf(p), false, 44)}<div style="min-width:0"><b>${esc(p.name || 'Sem nome')}</b>
      <div class="cs-dots">${hasTr(p) ? `<span class="${d.tr === 'ok' || d.tr === 'rest' ? 'ok' : d.tr === 'no' ? 'no' : ''}">${d.trl}</span>` : ''}${hasDi(p) && d.meals ? `<span class="${d.mk >= d.meals ? 'ok' : d.mk <= 1 ? 'no' : ''}">dieta ${d.mk}/${d.meals}</span>` : ''}<span class="${d.ci ? 'ok' : 'no'}">check-in ${d.ci ? '✓' : 'pendente'}</span></div></div>
      <span class="cs-go">›</span>${d.att.length ? `<span class="cs-att">⚠︎ ${esc(d.att.join(' • '))}</span>` : ''}</button>`).join('') : `<p class="meta" style="margin:0">${T.loaded ? 'Nenhum aluno ainda. Crie o primeiro convite na aba Convites.' : 'Carregando…'}</p>`}</div>
    <button class="btn small" data-p-logout style="align-self:center;margin-top:8px">Sair da conta</button>`;
}
// prêmio físico de level (brinde, kit): aparece até marcar como entregue
function prizes(){
  const R = (window.TEAM && TEAM.rewards) || [], items = [];
  students().filter(hasTr).forEach(p => { const lv = Math.min(4, (p.stats || {}).lv || 0), round = (p.prestige && p.prestige.lv) || 0;
    for (let i = 2; i <= lv; i++) if (PHYSICAL[i] && !R.some(r => r.user_id === p.id && r.reward === `level-${i}-p${round}`)) items.push({ p, i, key:`level-${i}-p${round}` }); });
  if (!items.length) return '';
  return `<div class="block ink"><span class="lbl">Prêmios para entregar</span>${items.map(({ p, i, key }) => `<div class="prow" style="align-items:center"><span style="min-width:0"><b>${esc(first(p.name))} virou ${K().LVN[i]}</b><br><small>Separar: ${PHYSICAL[i]}</small></span><button class="btn small" data-p-deliver="${p.id}|${key}">Entregue</button></div>`).join('')}</div>`;
}
function longDateT(){ return K().longDate(TODAY()); }

/* ---------- modelos ---------- */
const TAGS0 = { treino:['Iniciante','Intermediário','Avançado','Glúteo','Hipertrofia','Emagrecimento','Força','Em casa'], dieta:['Emagrecimento','Ganho de massa','Manutenção','Vegetariana','Low carb'] };
function tplSummary(t){
  if (t.kind === 'treino'){ const pl = (t.content && t.content.plans) || []; return `${pl.length} ${pl.length === 1 ? 'treino' : 'treinos'} • ${pl.reduce((a, x) => a + (x.exercises || []).length, 0)} exercícios`; }
  const m = (t.content && t.content.meals) || []; return `${m.length} refeições • ${Math.round(m.reduce((a, x) => a + (x.items || []).reduce((b, it) => b + K().mac(it.f, it.g).k, 0), 0))} kcal`;
}
function vModelos(){
  const L = T.templates.filter(t => t.kind === P.tplKind && (!P.tplTag || (t.tags || []).includes(P.tplTag)));
  const tags = [...new Set(T.templates.filter(t => t.kind === P.tplKind).flatMap(t => t.tags || []))];
  return `<div class="hero"><span class="motto">Painel da equipe</span><h2 class="d">Modelos</h2><p class="sub">Treinos e dietas prontos para usar em qualquer aluno. Para criar, monte na ficha de um aluno e toque em "Salvar como modelo".</p></div>
    <div class="seg" role="tablist"><button role="tab" aria-selected="${P.tplKind === 'treino'}" data-p-kind="treino">Treinos</button><button role="tab" aria-selected="${P.tplKind === 'dieta'}" data-p-kind="dieta">Dietas</button></div>
    ${tags.length ? `<div class="chips"><button class="chip" aria-pressed="${!P.tplTag}" data-p-tag="">Todos</button>${tags.map(g => `<button class="chip" aria-pressed="${P.tplTag === g}" data-p-tag="${esc(g)}">${esc(g)}</button>`).join('')}</div>` : ''}
    <div class="block frost">${L.length ? L.map(t => `<div class="prow" style="align-items:center"><span style="min-width:0"><b>${esc(t.name)}</b><br><small>${tplSummary(t)}${t.uses ? ` • usado ${t.uses}x` : ''}</small>${(t.tags || []).length ? `<br><small style="font-weight:800">${t.tags.map(esc).join(' • ')}</small>` : ''}</span>
      <span style="display:flex;gap:6px"><button class="btn small" data-p-tview="${t.id}">Ver</button><button class="btn small" data-p-tedit="${t.id}">Editar</button></span></div>`).join('') : `<p class="meta" style="margin:0">Nenhum modelo de ${P.tplKind} ainda.</p>`}</div>`;
}
function tplView(id){
  const t = T.templates.find(x => x.id === id); if (!t) return;
  const body = t.kind === 'treino' ? ((t.content.plans || []).map(pl => `<div class="block line" style="margin:10px 0 0"><span class="lbl">${esc(pl.title || 'Treino ' + pl.letter)}${pl.focus ? ' • ' + esc(pl.focus) : ''}</span>${(pl.exercises || []).map((e, i) => { const G = K().linkGroups(pl.exercises)[i];
      return `<div class="prow"><span><b>${G ? G.lab + ' • ' : ''}${esc(e.name)}</b><br><small>${tgOf(e).length} × ${e.reps} reps • ${e.rest ? 'descanso ' + e.rest + 's' : 'sem descanso'}${(e.mets || []).length ? ' • ' + e.mets.map(k => (K().MET[k] || {}).n).join(' + ') : ''}</small></span></div>`; }).join('')}</div>`).join(''))
    : (t.content.meals || []).map(m => `<div class="block line" style="margin:10px 0 0"><span class="lbl">${esc(m.name)} • ${K().hh(m.win[0])} às ${K().hh(m.win[1])}</span>${(m.items || []).map(it => `<div class="prow"><span><b>${esc(K().fname(it.f))}</b><br><small>${nf(it.g)} g${K().hmTxt(it.f, it.g)}</small></span></div>`).join('')}</div>`).join('');
  sheet3(`<span class="lbl">Modelo de ${t.kind}</span><p class="d" style="font-size:36px;margin:6px 0 4px">${esc(t.name)}</p><p class="meta" style="margin:0">${tplSummary(t)}</p>${body}`);
}
function tplEdit(id){
  const t = T.templates.find(x => x.id === id); if (!t) return;
  let tags = [...(t.tags || [])];
  sheet3(`<span class="lbl">Editar modelo</span><p class="d" style="font-size:34px;margin:6px 0 10px">${esc(t.name)}</p>
    <div class="field"><label for="te-n" style="font-weight:800;font-size:14px">Nome</label><input class="inp" id="te-n" value="${esc(t.name)}"></div>
    <p class="lbl" style="margin:14px 0 6px">Etiquetas</p><div class="chips" id="te-tags"></div>
    <div class="ed-add"><input class="inp" id="te-new" placeholder="Nova etiqueta"><button class="btn small" id="te-add">+</button></div>
    <button class="btn solid wide" style="margin-top:14px" id="te-ok">Salvar</button><button class="btn wide" style="margin-top:8px;color:var(--miss);border-color:var(--miss)" id="te-del">Excluir modelo</button>`, sh => {
    const drawT = () => { sh.querySelector('#te-tags').innerHTML = [...new Set([...TAGS0[t.kind], ...tags])].map(g => `<button class="chip" aria-pressed="${tags.includes(g)}" data-tg2="${esc(g)}">${esc(g)}</button>`).join(''); };
    drawT();
    sh.querySelector('#te-tags').onclick = e => { const b = e.target.closest('[data-tg2]'); if (!b) return; const g = b.dataset.tg2; tags = tags.includes(g) ? tags.filter(x => x !== g) : [...tags, g]; drawT(); };
    sh.querySelector('#te-add').onclick = () => { const v = sh.querySelector('#te-new').value.trim(); if (v && !tags.includes(v)) tags.push(v); sh.querySelector('#te-new').value = ''; drawT(); };
    sh.querySelector('#te-ok').onclick = async () => { const name = sh.querySelector('#te-n').value.trim() || t.name;
      const { error } = await sb.from('templates').update({ name, tags, updated_at:new Date().toISOString() }).eq('id', t.id);
      if (error){ toast3('Não salvou. Confira a internet.'); return; } Object.assign(t, { name, tags }); sh.remove(); draw(); toast3('Modelo salvo'); };
    let armed = false;
    sh.querySelector('#te-del').onclick = async ev => { if (!armed){ armed = true; ev.target.textContent = 'Toque de novo para excluir'; return; }
      const { error } = await sb.from('templates').delete().eq('id', t.id); if (error){ toast3('Não excluiu. Confira a internet.'); return; }
      T.templates = T.templates.filter(x => x.id !== t.id); sh.remove(); draw(); toast3('Modelo excluído'); };
  });
}

/* ---------- ficha do aluno ---------- */
const uidN = () => 'x' + Math.random().toString(36).slice(2, 9);
function eqGuess(n){ const s = K().NRM(n); return /halter|goblet|serrote|arnold|concentrada|alternada/.test(s) ? 'halter' : /polia|cross|corda|pulldown|face pull/.test(s) ? 'polia' : /barra|supino reto$|terra|livre|good morning|frontal/.test(s) ? 'barra' : 'maquina'; }
const newEx = n => ({ uid:uidN(), name:n, sets:3, reps:12, rest:60, obs:'', eq:eqGuess(n) });
function prevFor(id, letter, e){
  const L = T.logs.filter(x => x.user_id === id && x.letter === letter && x.finished_at).sort((a, b) => a.day < b.day ? 1 : -1);
  for (const lg of L){ const s = (lg.sets || []).find(x => x.uid === e.uid) || (lg.sets || []).find(x => x.name === e.name); if (s && (s.sets || []).some(x => x[2])) return s.sets.filter(x => x[2]).map(x => [x[0], x[1]]); }
  return null;
}
function tgOf(e, prev){ if (e.tg) return e.tg; const n = e.sets || 3; return Array.from({ length:n }, (_, s) => { const p = prev && (prev[s] || prev[prev.length - 1]); return [p ? +p[0] || 0 : (e.kg || 0), e.reps || 10]; }); }
const metsOf = x => x.mets || [];
const metLabel = x => { const m = metsOf(x); return m.length ? m.map(k => (K().MET[k] || { n:k }).n).join(' + ') : 'Escolher método'; };
function linkNorm(arr){ const seen = {}; let i = 0; while (i < arr.length){ const L = arr[i].link; if (!L){ i++; continue; } let j = i; while (j + 1 < arr.length && arr[j + 1].link === L) j++;
  if (seen[L]){ const nid = 'g' + Math.random().toString(36).slice(2, 7); for (let k = i; k <= j; k++) arr[k].link = nid; } seen[arr[i].link] = 1;
  if (j === i) arr[i].link = null; else { for (let k = i; k < j; k++) arr[k].rest = 0; if (!arr[j].rest) arr[j].rest = 60; } i = j + 1; }
  arr.forEach(x => { if (!x.link && x.rest === 0) x.rest = 60; if (!x.link) delete x.link; }); }

function openFx(id){
  const p = prof(id); if (!p) return;
  const wk = wksOf(id).map(w => ({ letter:w.letter, title:w.title || 'Treino ' + w.letter, focus:w.focus || '', exercises:clone(w.exercises || []) }));
  wk.forEach(w => w.exercises.forEach(e => { if (!e.uid) e.uid = uidN(); }));
  const dt = dietOf(id), diet = { meals:clone((dt && dt.meals) || []), notes:(dt && dt.notes) || '' };
  FX = { id, tab:'resumo', li:0, wk, wk0:clone(wk), diet, diet0:clone(diet), aw:{ medal:'destaque', tier:0, note:'' } };
  draw(); scrollTo(0, 0);
}
const fxP = () => prof(FX.id);
const curPl = () => FX.wk[FX.li];
function fxDiff(){
  const L = [];
  const A = FX.wk0, B = FX.wk;
  B.forEach(pl => { const o = A.find(x => x.letter === pl.letter && x.title === pl.title) || A.find(x => x.letter === pl.letter);
    const tt = pl.title.replace(/^Treino /, '');
    if (!o){ L.push(`Treino novo: ${pl.title} (${pl.exercises.length} exercícios)`); return; }
    if (o.title !== pl.title || o.focus !== pl.focus) L.push(`${tt}: nome ou foco mudou`);
    pl.exercises.forEach(x => { const y = o.exercises.find(z => z.uid === x.uid); if (!y){ L.push(`${tt} • novo exercício: ${x.name}`); return; }
      if (y.name !== x.name) L.push(`${tt} • trocou ${y.name} por ${x.name}`);
      if (metsOf(y).join() !== metsOf(x).join()) L.push(`${tt} • ${x.name}: método ${metLabel(x).replace('Escolher método', 'normal')}`);
      if (!!y.link !== !!x.link) L.push(`${tt} • ${x.name}: ${x.link ? 'conjugado' : 'separado do conjugado'}`);
      const a = tgOf(y), b = tgOf(x); if (a.length !== b.length) L.push(`${tt} • ${x.name}: ${a.length} → ${b.length} séries`);
      if (x.tg && JSON.stringify(x.tg) !== JSON.stringify(y.tg || null)){ const dk = b.slice(0, a.length).map((t, i) => t[0] - a[i][0]);
        if (dk.some(d => d) && dk.every(d => d === dk[0])) L.push(`${tt} • ${x.name}: ${dk[0] > 0 ? '+' : ''}${kgf(dk[0])} kg em todas as séries`);
        else b.forEach((t, i) => { if (a[i] && t[0] !== a[i][0]) L.push(`${tt} • ${x.name}: série ${i + 1} ${kgf(a[i][0])} → ${kgf(t[0])} kg`); });
        b.forEach((t, i) => { if (a[i] && t[1] !== a[i][1]) L.push(`${tt} • ${x.name}: série ${i + 1} ${a[i][1]} → ${t[1]} reps`); }); }
      if (y.rest !== x.rest) L.push(`${tt} • ${x.name}: descanso ${y.rest}s → ${x.rest}s`);
      if ((y.obs || '') !== (x.obs || '')) L.push(`${tt} • ${x.name}: observação nova`); });
    o.exercises.forEach(y => { if (!pl.exercises.find(x => x.uid === y.uid)) L.push(`${tt} • removido: ${y.name}`); });
    if (pl.exercises.map(x => x.uid).join() !== o.exercises.filter(y => pl.exercises.find(x => x.uid === y.uid)).map(y => y.uid).join()) L.push(`${tt} • ordem dos exercícios`);
  });
  A.forEach(o => { if (!B.find(x => x.letter === o.letter)) L.push(`Removido: ${o.title}`); });
  return [...new Set(L)];
}
const dietChanged = () => JSON.stringify(FX.diet) !== JSON.stringify(FX.diet0);
function fxResumo(p){
  const d = today(p), t = TODAY(), s = p.stats || {};
  const wc = T.closes.filter(x => x.user_id === p.id && x.weight_kg).sort((a, b) => a.week_start < b.week_start ? -1 : 1);
  const ws = weekStart(t), dl = T.daily.filter(x => x.user_id === p.id && x.day >= ws), A = i => dl.filter(x => (x.answers || [])[i] !== undefined);
  const trw = new Set(T.logs.filter(x => x.user_id === p.id && x.day >= ws && x.finished_at && K().logPct(x) >= 75).map(x => x.day)).size;
  const rows = [hasTr(p) ? ['Treinos', `${trw} de ${p.freq || 3}`] : null, ['Check-in do dia', `${dl.length} de 6`],
    hasTr(p) && (p.cardio ?? 2) ? ['Cardio', `${dl.filter(x => x.answers[3] > 0).length} de ${p.cardio ?? 2}`] : null,
    hasDi(p) ? ['Água', `${dl.filter(x => x.answers[6] === 2).length} de 6`] : null, ['Sono 7h+', `${dl.filter(x => x.answers[7] === 2).length} de 6`],
    hasDi(p) ? ['Sem fast food', `${dl.filter(x => x.answers[4] === 0).length} de 6`] : null, hasDi(p) ? ['Sem doce', `${dl.filter(x => x.answers[5] === 0).length} de 5`] : null].filter(Boolean);
  const recent = T.logs.filter(x => x.user_id === p.id && x.finished_at).sort((a, b) => a.day < b.day ? 1 : -1).slice(0, 4);
  const msg = `Oi, ${first(p.name)}! Aqui é o Sérgio, da Chames Crew.`;
  return `<div class="block frost" style="margin:0"><span class="lbl">Hoje</span><div class="cs-dots" style="margin-top:8px">${hasTr(p) ? `<span class="${d.tr === 'ok' || d.tr === 'rest' ? 'ok' : d.tr === 'no' ? 'no' : ''}">${d.trl}</span>` : ''}${hasDi(p) && d.meals ? `<span class="${d.mk >= d.meals ? 'ok' : d.mk <= 1 ? 'no' : ''}">dieta ${d.mk}/${d.meals}</span>` : ''}<span class="${d.ci ? 'ok' : 'no'}">check-in ${d.ci ? '✓' : 'pendente'}</span></div>
      ${d.att.map(a => `<p style="margin:10px 0 0;font-weight:800;color:var(--miss)">⚠︎ ${esc(a)}</p>`).join('')}</div>
    <div class="block line" style="margin:12px 0 0"><div class="row"><span class="lbl">Esta semana</span><span class="pill">${s.week_pct || 0}% das metas</span></div>
      ${rows.map(r => `<div class="prow"><span><b>${r[0]}</b></span><span style="font-weight:800">${r[1]}</span></div>`).join('')}</div>
    <div class="pgrid" style="margin-top:12px"><div><small>Ciclos cumpridos</small><b>${s.cycles || 0}</b></div><div><small>Este ciclo</small><b>${s.cycle_pct || 0}%</b></div></div>
    <div class="block frost" style="margin:12px 0 0"><div class="row"><span class="lbl">Peso (fechamento da semana)</span>${p.hide_weight ? '<span class="pill">oculto para o aluno</span>' : ''}</div>
      ${wc.length ? `<p class="d" style="font-size:34px;margin:6px 0 2px">${nf(wc[wc.length - 1].weight_kg)} kg</p><p class="meta" style="margin:0">${wc.length > 1 ? `${(wc[wc.length - 1].weight_kg - wc[0].weight_kg > 0 ? '+' : '') + nf(wc[wc.length - 1].weight_kg - wc[0].weight_kg)} kg desde ${K().shortDate(wc[0].week_start)}` : 'primeiro registro'}${p.weight_kg ? ` • anamnese: ${nf(p.weight_kg)} kg` : ''}</p>
        <div class="wlist">${wc.slice(-6).map(c => `<span>Semana de ${K().shortDate(c.week_start)}</span><span>${nf(c.weight_kg)} kg</span><span></span>`).join('')}</div>` : `<p class="meta" style="margin:6px 0 0">Ainda sem peso registrado.${p.weight_kg ? ` Anamnese: ${nf(p.weight_kg)} kg.` : ''}</p>`}</div>
    ${hasTr(p) ? `<div class="block line" style="margin:12px 0 0"><span class="lbl">Últimos treinos</span>${recent.length ? recent.map(x => `<div class="prow"><span><b>Treino ${esc(x.letter)}</b><br><small>${K().shortDate(x.day)} • ${K().logPct(x)}% • ${Math.round(x.volume_kg || 0).toLocaleString('pt-BR')} kg${x.duration_min ? ' • ' + x.duration_min + ' min' : ''}</small></span>${(x.skipped || []).length ? `<span class="flag f-mid">${x.skipped.length} pulado${x.skipped.length > 1 ? 's' : ''}</span>` : ''}</div>`).join('') : '<p class="meta" style="margin:6px 0 0">Nenhum treino registrado ainda.</p>'}</div>` : ''}
    <div class="grid2" style="margin-top:12px">${p.phone ? `<a class="btn small" style="text-decoration:none;display:flex;align-items:center;justify-content:center" target="_blank" rel="noopener" href="https://wa.me/55${String(p.phone).replace(/\D/g, '').replace(/^55/, '')}?text=${encodeURIComponent(msg)}">WhatsApp</a>` : '<span></span>'}${hasTr(p) ? '<button class="btn small" data-fx-tab="treino">Editar treino</button>' : '<button class="btn small" data-fx-tab="dieta">Editar dieta</button>'}</div>`;
}
function fxTreino(p){
  if (!FX.wk.length) return `<div class="ed-note"><b>${esc(first(p.name))} ainda não tem treino</b><span>Comece do zero, use um modelo ou copie de outro aluno (sem as cargas).</span></div>
    <div class="grid2" style="margin-top:4px"><button class="btn solid" data-fx-newpl>+ Treino A</button><button class="btn" data-fx-tpl="treino">Usar modelo</button></div>
    <button class="btn wide" style="margin-top:8px" data-fx-copy="treino">Copiar de outro aluno</button>`;
  if (FX.li >= FX.wk.length) FX.li = 0;
  const pl = curPl(), o = FX.wk0.find(x => x.letter === pl.letter) || { exercises:[] }, G = K().linkGroups(pl.exercises), nch = fxDiff().length;
  const cards = pl.exercises.map((x, i) => {
    const g = G[i], prev = prevFor(p.id, pl.letter, x), tg = tgOf(x, prev), y = o.exercises.find(z => z.uid === x.uid), otg = y ? tgOf(y, prev) : [];
    const chg = !y || JSON.stringify([x.name, metsOf(x).join(), !!x.link, x.rest, x.obs || '', tg]) !== JSON.stringify([y.name, metsOf(y).join(), !!y.link, y.rest, y.obs || '', otg]);
    const rows = tg.map((t, si) => { const pv = prev && (prev[si] || prev[prev.length - 1]), ot = otg[si];
      return `<span class="mx-s">${si + 1}</span><span class="mx-p">${pv ? kgf(pv[0]) + ' × ' + pv[1] : '—'}</span>
        <label class="mx-in${!ot || ot[0] !== t[0] ? ' chg' : ''}"><input data-tg="${i}:${si}:0" inputmode="decimal" value="${kgf(t[0])}" aria-label="Carga série ${si + 1}"><i>kg</i></label>
        <label class="mx-in${!ot || ot[1] !== t[1] ? ' chg' : ''}"><input data-tg="${i}:${si}:1" inputmode="numeric" value="${t[1]}" aria-label="Repetições série ${si + 1}"><i>reps</i></label>
        <button class="mx-rm" data-fx-rms="${i}:${si}" aria-label="Remover série ${si + 1}" ${tg.length < 2 ? 'disabled' : ''}>×</button>`; }).join('');
    return `${g && g.pos > 0 ? `<div class="lk-bar"><button data-unlink="${i - 1}">🔗 conjugados • toque para separar</button></div>` : ''}<article class="mx${chg ? ' chg' : ''}${g ? ' lk' : ''}" data-idx="${i}">${g && g.pos === 0 ? `<span class="lk-lab">🔗 ${g.n} ${g.lab[0]}</span>` : ''}
      <div class="mx-h"><button class="drag-h" aria-label="Segure para arrastar">⠿</button><span class="mx-num">${g ? g.lab : i + 1}</span><div class="mx-t"><b>${esc(x.name)}</b><small>${tg.length} séries • ${x.rest ? 'descanso ' + x.rest + 's' : 'sem descanso'}${chg ? ' • <em>alterado</em>' : ''}</small></div>
        <span class="ed-tools"><button class="ed-x" data-fx-mv="${i}:-1" aria-label="Subir">↑</button><button class="ed-x" data-fx-mv="${i}:1" aria-label="Descer">↓</button><button class="ed-x" data-fx-del="${i}" aria-label="Remover ${esc(x.name)}">×</button></span></div>
      <div class="ed-row"><button class="met-chip${metsOf(x).length ? ' on' : ''}" data-fx-met="${i}">${metLabel(x)} ▾</button><button class="undo" data-fx-swap="${i}">trocar exercício</button></div>
      <div class="mx-sets"><span class="h">Série</span><span class="h">Última vez</span><span class="h">Carga</span><span class="h">Reps</span><span></span>${rows}</div>
      <div class="mx-act"><button data-fx-kg="${i}:-2.5">−2,5 kg</button><button data-fx-kg="${i}:2.5">+2,5 kg</button><button data-fx-kg="${i}:5">+5 kg</button><button class="add" data-fx-adds="${i}">+ série</button></div>
      <div class="mx-foot"><span>Descanso</span><div class="stp"><button data-fx-rest="${i}:-15" aria-label="Menos descanso">−</button><span>${x.rest}s</span><button data-fx-rest="${i}:15" aria-label="Mais descanso">+</button></div></div>
      <input class="ed-obs" data-fx-obs="${i}" value="${esc(x.obs || '')}" placeholder="Observação (técnica, cadência…)"></article>`; }).join('');
  return `<div class="chips" style="margin-bottom:10px">${FX.wk.map((w, k) => `<button class="chip" aria-pressed="${k === FX.li}" data-fx-pl="${k}">${esc(w.title)}</button>`).join('')}${FX.wk.length < 8 ? '<button class="chip" data-fx-newpl>+ Treino</button>' : ''}</div>
    <div class="ed-note"><b>Modo edição • treino atual de ${esc(first(p.name))}</b><span>Toque na carga ou nas reps para mudar. Segure ⠿ para arrastar; solte um exercício em cima do outro para conjugar.</span>
      <div class="grid2" style="margin-top:10px"><input class="inp" data-fx-title value="${esc(pl.title)}" aria-label="Nome do treino" style="padding:10px 12px"><input class="inp" data-fx-focus value="${esc(pl.focus)}" placeholder="Foco (ex.: Inferiores)" aria-label="Foco do treino" style="padding:10px 12px"></div>
      <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap"><button class="btn small" data-fx-prev>Ver como ${esc(first(p.name))} vê</button><span class="pill">${nch ? nch + ' mudança' + (nch > 1 ? 's' : '') : 'nada mudou'}</span></div></div>
    <div class="fx-split"><aside class="fx-lib"><span class="lbl">Galeria</span>${libTree()}</aside><div><div data-sortbox="fx">${cards || '<p class="meta">Nenhum exercício neste treino ainda.</p>'}</div>
      <button class="btn solid wide fx-galbtn" data-fx-gal style="margin-top:4px">+ Adicionar da galeria</button>
      <div class="ed-add"><input class="inp" id="fx-newex" placeholder="Ou escreva um personalizado"><button class="btn small" data-fx-addex>Adicionar</button></div></div></div>
    <div class="block line" style="margin-top:14px"><span class="lbl">Mais opções</span>
      <div class="grid2" style="margin-top:10px"><button class="btn small" data-fx-tpl="treino">Usar modelo</button><button class="btn small" data-fx-copy="treino">Copiar de aluno</button></div>
      <div class="grid2" style="margin-top:8px"><button class="btn small" data-fx-savetpl="treino">Salvar como modelo</button><button class="btn small" data-fx-delpl style="color:var(--miss);border-color:var(--miss)">Excluir ${esc(pl.title.replace(/^Treino /, ''))}</button></div></div>`;
}
function libTree(){ const D = K().EXDB; return Object.keys(D).map(r => `<details class="gx-acc"><summary>${K().mtile(r.toLowerCase(), 34)}<span><b>${r}</b></span><i class="gx-chev"></i></summary><div class="gx-in">${Object.keys(D[r]).map(m => `<details class="gx-sub"><summary><b>${m}</b><span class="pill">${D[r][m].length}</span><i class="gx-chev"></i></summary><div>${D[r][m].map(nm => `<button class="gx-it" data-fx-lib="${esc(nm)}"><span><b>${esc(nm)}</b></span><span class="gx-p">+</span></button>`).join('')}</div></details>`).join('')}</div></details>`).join(''); }
const HH = h => K().hh(h);
function fxDieta(p){
  const m = FX.diet.meals;
  if (!m.length) return `<div class="ed-note"><b>${esc(first(p.name))} ainda não tem dieta</b><span>Comece do zero, use um modelo ou copie de outro aluno.</span></div>
    <div class="grid2" style="margin-top:4px"><button class="btn solid" data-fx-addmeal>+ Refeição</button><button class="btn" data-fx-tpl="dieta">Usar modelo</button></div>
    <button class="btn wide" style="margin-top:8px" data-fx-copy="dieta">Copiar de outro aluno</button>`;
  const K2 = K(), tot = { k:0, p:0, c:0, g:0 };
  const html = m.map((ml, mi) => `<div class="ed-meal"><div class="row" style="gap:8px"><input class="inp" data-fx-mname="${mi}" value="${esc(ml.name)}" aria-label="Nome da refeição" style="padding:9px 12px;font-weight:800;flex:1;min-width:0"><button class="ed-x" data-fx-delmeal="${mi}" aria-label="Remover refeição">×</button></div>
      <div class="row" style="margin:8px 0 4px;gap:6px;flex-wrap:wrap"><span class="meta" style="margin:0;font-size:13px">Janela</span><div class="stp"><button data-fx-win="${mi}:0:-0.5" aria-label="Começa mais cedo">−</button><span>${HH(ml.win[0])}</span><button data-fx-win="${mi}:0:0.5" aria-label="Começa mais tarde">+</button></div><span class="meta" style="margin:0">às</span><div class="stp"><button data-fx-win="${mi}:1:-0.5" aria-label="Termina mais cedo">−</button><span>${HH(ml.win[1])}</span><button data-fx-win="${mi}:1:0.5" aria-label="Termina mais tarde">+</button></div></div>
      ${(ml.items || []).map((it, ii) => { const x = K2.mac(it.f, it.g); for (const k in tot) tot[k] += x[k]; const u = K2.HM[it.f], sub = K2.subsOf(it.f);
        return `<div class="ed-food"><span style="min-width:0"><b style="font-weight:800;font-size:14px">${esc(K2.fname(it.f))}</b> ${sub.length ? `<button class="undo" data-fx-fsw="${mi}:${ii}" style="font-size:11.5px">trocar</button>` : ''}<br><small style="color:var(--muted);font-size:12px">${K2.grOf(it.f) ? K2.FGN[K2.grOf(it.f)] + ' • ' + sub.length + (sub.length === 1 ? ' substituto' : ' substitutos') : 'sem grupo'} • ${Math.round(x.k)} kcal</small></span>
        <div class="stp-w"><div class="stp">${it.mu && u ? `<button data-fx-u="${mi}:${ii}:-1" aria-label="Menos 1 ${u[0]}">−</button><span>${nf(it.n || (K2.hmN(it.f, it.g) || { n:0 }).n)}<small>${(it.n || 0) > 1 ? u[1] : u[0]}</small></span><button data-fx-u="${mi}:${ii}:1" aria-label="Mais 1 ${u[0]}">+</button>`
          : `<button data-fx-g="${mi}:${ii}:-10" aria-label="Menos 10 g">−</button><span>${nf(it.g)} g<small>${(K2.hmN(it.f, it.g) || { t:'' }).t}</small></span><button data-fx-g="${mi}:${ii}:10" aria-label="Mais 10 g">+</button>`}</div>
          ${u ? `<button class="undo" data-fx-mu="${mi}:${ii}">${it.mu ? `em gramas (${nf(it.g)} g)` : 'usar medida caseira'}</button>` : ''}</div><button class="ed-x" data-fx-delf="${mi}:${ii}" aria-label="Remover">×</button></div>`; }).join('')}
      <div class="ed-add"><select class="inp" data-fx-addsel="${mi}" aria-label="Alimento">${Object.keys(K2.FG).map(g => `<optgroup label="${K2.FGN[g]}">${K2.FG[g].map(k => `<option value="${k}">${K2.TACO[k].n}</option>`).join('')}</optgroup>`).join('')}</select><button class="btn small solid" data-fx-addfood="${mi}" aria-label="Adicionar alimento">+</button></div></div>`).join('');
  return `<div class="ed-note"><b>Modo edição • dieta atual de ${esc(first(p.name))}</b><span>${dietChanged() ? 'Há mudanças ainda não salvas.' : 'Nada mudou ainda.'} Valores aproximados da Tabela TACO.</span></div>
    <div class="block ink"><div class="row"><span class="lbl">Total do dia</span><span class="pill">${m.length} refeições</span></div><div class="macros" style="margin-top:12px">${[['kcal', tot.k], ['prot', tot.p, 'g'], ['carb', tot.c, 'g'], ['gord', tot.g, 'g']].map(([l, v, u]) => `<div><b class="d" style="font-size:28px">${Math.round(v)}${u || ''}</b><small style="display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;opacity:.7">${l}</small></div>`).join('')}</div></div>
    ${html}<button class="btn wide" data-fx-addmeal style="margin-top:4px">+ Refeição</button>
    <div class="field" style="margin-top:12px"><label for="fx-dnote" style="font-weight:800;font-size:14px">Recado na dieta (o aluno vê)</label><textarea class="inp" id="fx-dnote" data-fx-dnote rows="2" style="min-height:64px;padding-top:10px">${esc(FX.diet.notes)}</textarea></div>
    <div class="block line" style="margin-top:14px"><span class="lbl">Mais opções</span>
      <div class="grid2" style="margin-top:10px"><button class="btn small" data-fx-tpl="dieta">Usar modelo</button><button class="btn small" data-fx-copy="dieta">Copiar de aluno</button></div>
      <button class="btn small wide" style="margin-top:8px" data-fx-savetpl="dieta">Salvar como modelo</button></div>`;
}
function chipsP(k, opts, p){ return `<div class="chips">${opts.map(([v, l]) => `<button class="chip" data-fx-set="${k}:${v}" aria-pressed="${String(p[k] ?? '') === String(v)}">${l}</button>`).join('')}</div>`; }
function fxPlano(p){
  const fr = p.freq || 3, t = fr * 4, kg = +p.weight_kg || 0, ag = kg ? Math.min(4, Math.max(2, Math.round(kg * 35 / 250) * .25)) : 2;
  return `<div class="block frost" style="margin:0"><div class="row"><span class="lbl">Plano de ${esc(first(p.name))}</span><span class="pill">${PLAN_N[p.plan] || p.plan} • ${p.presencial ? 'presencial' : 'online'}</span></div>
    <div class="stu-g"><span class="lbl">Plano</span>${chipsP('plan', [['coach','Treino + dieta'], ['treino','Só treino'], ['nutri','Só dieta']], p)}</div>
    <div class="stu-g"><span class="lbl">Modalidade</span>${chipsP('presencial', [['true','Presencial'], ['false','Online']], { presencial:String(!!p.presencial) })}<p class="meta" style="font-size:12.5px;margin:6px 0 0">A agenda aparece só para quem é presencial.</p>
      ${p.presencial ? `<p class="lbl" style="margin:12px 0 6px">Aulas por mês</p>${chipsP('class_quota', [[4,'4'], [8,'8'], [12,'12'], [16,'16']], p)}` : ''}</div>
    ${hasTr(p) ? `<div class="stu-g"><span class="lbl">Treinos na semana</span>${chipsP('freq', [1,2,3,4,5,6].map(n => [n, n + 'x']), { freq:fr })}<p class="meta" style="font-size:12.5px;margin:6px 0 0">Ciclo de 4 semanas: ${t} treinos, mínimo ${Math.ceil(t * .75)} para contar. Os outros ${7 - fr} dias são de descanso e não contam contra.</p></div>
    <div class="stu-g"><span class="lbl">Cardio na semana</span>${chipsP('cardio', [0,1,2,3,4,5].map(n => [n, n ? n + 'x' : 'Sem']), { cardio:p.cardio ?? 2 })}</div>` : ''}
    <div class="stu-g"><span class="lbl">Peso da anamnese</span><div class="ed-add" style="margin:6px 0 0"><input class="inp" id="fx-kg" inputmode="decimal" value="${kg ? nf(kg) : ''}" placeholder="kg" style="max-width:140px"><button class="btn small" data-fx-kgsave>Salvar</button></div>
      <p class="meta" style="font-size:12.5px;margin:6px 0 0">Meta de água: ${nf(ag)} L por dia (35 ml por kg). Sono: 7h para todo mundo.</p></div>
    <label class="agree"><input type="checkbox" data-fx-hidew ${p.hide_weight ? 'checked' : ''}> Esconder o peso para ${esc(first(p.name))} (continua registrando, só você vê)</label></div>`;
}
function fxMedalhas(p){
  const s = p.stats || {}, snap = p.case_snap || {}, f = FX.aw, M = K().MED2, cur = lvOf(p), real = s.cyc_real ?? Math.max(0, (s.cycles || 0) - (p.level_bonus || 0));
  const given = T.awards.filter(a => a.user_id === p.id);
  return `<div class="block frost" style="margin:0"><span class="lbl">Level</span><p class="d" style="font-size:38px;margin:4px 0 2px">${K().LVN[cur]}</p>
      <p class="meta" style="margin:0">${s.cycles || 0} ciclos${p.level_bonus ? ` (${real} cumpridos ${p.level_bonus > 0 ? '+' : '−'} ${Math.abs(p.level_bonus)} de ajuste)` : ''}. O número atualiza quando ${esc(first(p.name))} abrir o app.</p>
      <p class="lbl" style="margin:12px 0 6px">Ajustar level</p><div class="chips">${K().LVN.slice(0, 5).map((n, i) => `<button class="chip" data-fx-lv="${i}" aria-pressed="${cur === i}">${n}</button>`).join('')}</div>
      <div class="chips" style="margin-top:8px"><button class="chip" data-fx-bonus="-1">−1 ciclo</button><button class="chip" data-fx-bonus="1">+1 ciclo</button>${p.level_bonus ? '<button class="chip" data-fx-bonus="reset">Zerar ajuste</button>' : ''}</div></div>
    <div class="block line" style="margin:12px 0 0"><span class="lbl">Estojo agora</span><div class="pc-medg" style="margin-top:10px">${Object.entries(snap.m || {}).map(([id, t]) => { const m = M.find(x => x.id === id); return m ? `<span class="pc-m" title="${m.name} • ${K().TIERS2[t]}">${RA.disc(m, t).replace('class="rdisc', 'style="--s:40px" class="rdisc')}</span>` : ''; }).join('') || '<p class="meta" style="margin:0">Nenhuma medalha ainda.</p>'}</div></div>
    <div class="block frost" style="margin:12px 0 0"><span class="lbl">Dar medalha</span><p class="meta" style="font-size:13px;margin:6px 0 10px">Para incentivar ou corrigir um erro. A medalha nunca fica abaixo do que o aluno conquistou sozinho.</p>
      <div class="chips">${M.filter(m => !m.secret).map(m => `<button class="chip" data-fx-awm="${m.id}" aria-pressed="${f.medal === m.id}">${m.name}</button>`).join('')}</div>
      <p class="lbl" style="margin:12px 0 6px">Material</p><div class="chips">${K().TIERS2.map((t, i) => `<button class="chip" data-fx-awt="${i}" aria-pressed="${f.tier === i}">${t}</button>`).join('')}</div>
      <input class="inp" data-fx-awnote style="margin-top:12px" value="${esc(f.note)}" placeholder="Motivo (o aluno vê)">
      <button class="btn solid wide" style="margin-top:10px" data-fx-give>Dar ${esc((M.find(m => m.id === f.medal) || {}).name || '')} em ${K().TIERS2[f.tier]}</button>
      ${given.length ? `<p class="lbl" style="margin:14px 0 4px">Já liberadas</p>${given.map(g => { const m = M.find(x => x.id === g.medal_id) || { name:g.medal_id }; return `<div class="prow"><span><b>${esc(m.name)}: ${K().TIERS2[g.tier] || ''}</b><br><small>${g.note ? esc(g.note) + ' • ' : ''}${new Date(g.created_at).toLocaleDateString('pt-BR')}</small></span><button class="undo" data-fx-delaw="${g.id}">remover</button></div>`; }).join('')}` : ''}</div>`;
}
function vFicha(){
  const p = fxP(); if (!p){ FX = null; return vAlunos(); }
  const tabs = [['resumo','Resumo'], ...(hasTr(p) ? [['treino','Treino']] : []), ...(hasDi(p) ? [['dieta','Dieta']] : []), ['plano','Plano'], ['medalhas','Medalhas']];
  if (!tabs.find(t => t[0] === FX.tab)) FX.tab = 'resumo';
  const body = FX.tab === 'treino' ? fxTreino(p) : FX.tab === 'dieta' ? fxDieta(p) : FX.tab === 'plano' ? fxPlano(p) : FX.tab === 'medalhas' ? fxMedalhas(p) : fxResumo(p);
  const dirty = (FX.tab === 'treino' && fxDiff().length) || (FX.tab === 'dieta' && dietChanged());
  return `<div class="fx-top"><button class="fx-back" data-fx-close>‹ Painel</button><span style="flex:1"></span>${FX.tab === 'treino' || FX.tab === 'dieta' ? `<button class="btn small ${dirty ? 'solid' : ''}" data-fx-save>Salvar e avisar</button>` : ''}</div>
    <div class="fx-hero">${RA.emblem(lvOf(p), false, 72)}<div style="min-width:0"><span class="lbl">${PLAN_N[p.plan] || ''} • ${p.presencial ? 'presencial' : 'online'}</span><p class="d" style="margin:4px 0 0">${esc(p.name || 'Sem nome')}</p></div></div>
    <div class="fx-tabs" style="grid-template-columns:repeat(${tabs.length},1fr)">${tabs.map(([k, l]) => `<button aria-selected="${k === FX.tab}" data-fx-tab="${k}">${l}</button>`).join('')}</div>${body}`;
}
function fxPreview(){
  const p = fxP(), pl = curPl(); if (!pl) return; const G = K().linkGroups(pl.exercises), MET = K().MET;
  sheet3(`<span class="lbl">Prévia • como ${esc(first(p.name))} vê</span><p class="d" style="font-size:36px;margin:6px 0 10px">${esc(pl.title)}</p>
    ${pl.exercises.map((x, i) => { const prev = prevFor(p.id, pl.letter, x), tg = tgOf(x, prev), g = G[i];
      return `<div class="pv-ex"><h3 class="d">${g ? g.lab + ' • ' : ''}${esc(x.name)}</h3><p class="meta" style="margin:2px 0 6px">${tg.length} séries × ${tg[0] ? tg[0][1] : x.reps} reps • ${x.rest ? 'descanso ' + x.rest + 's' : 'sem descanso, vai direto pro próximo'}</p>
        ${x.tg ? `<span class="tag up">🎯 Meta do Sérgio: ${[...new Set(x.tg.map(t => kgf(t[0])))].join(' / ')} kg</span>` : ''}
        ${metsOf(x).filter(k => MET[k]).map(k => `<span class="tag met"><b>${MET[k].n}</b> • ${MET[k].how}</span>`).join('')}
        ${g ? `<span class="tag lk">🔗 <b>${g.n} ${g.lab}</b> • ${g.pos < g.len - 1 ? 'faça e vá direto pro próximo, sem descanso' : 'último do bloco: agora descanse'}</span>` : ''}${x.obs ? `<span class="tag">📌 ${esc(x.obs)}</span>` : ''}
        <div class="pv-sets"><span class="h">Série</span><span class="h">Anterior</span><span class="h">Kg</span><span class="h">Reps</span>${tg.map((t, s) => { const pv = prev && (prev[s] || prev[prev.length - 1]); return `<span>${s + 1}</span><span class="mt">${pv ? kgf(pv[0]) + ' kg × ' + pv[1] : '—'}</span><span class="box">${kgf(t[0])}</span><span class="box">${t[1]}</span>`; }).join('')}</div></div>`; }).join('')}`);
}
function metPicker(x){
  let sel = [...metsOf(x)]; const MET = K().MET;
  sheet3(`<span class="lbl">${esc(x.name)}</span><p class="d" style="font-size:34px;margin:6px 0 6px">Método de treino</p>
    <div class="ed-note" style="margin:0 0 12px"><b>🔗 Para conjugar (bi-set, tri-set)</b><span>Segure ⠿ e solte um exercício em cima do outro. Aqui você escolhe a técnica, e dá para combinar mais de uma.</span></div>
    <div class="met-list">${Object.entries(MET).map(([k, m]) => `<button class="met-it${sel.includes(k) ? ' on' : ''}" data-mp="${k}" aria-pressed="${sel.includes(k)}"><b>${m.n}</b><small>${m.how}</small></button>`).join('')}</div>
    <div class="grid2" style="margin-top:12px"><button class="btn" data-mp-clr>Sem método</button><button class="btn solid" data-mp-ok>Aplicar</button></div>`, sh => {
    sh.addEventListener('click', ev => { const b = ev.target.closest('[data-mp]');
      if (b){ const k = b.dataset.mp; sel = sel.includes(k) ? sel.filter(z => z !== k) : [...sel, k]; b.classList.toggle('on'); b.setAttribute('aria-pressed', sel.includes(k)); return; }
      if (ev.target.closest('[data-mp-clr]')){ x.mets = []; sh.remove(); keep(); return; }
      if (ev.target.closest('[data-mp-ok]')){ x.mets = sel;
        if (sel.includes('fst7')){ x.sets = 7; x.reps = 10; x.rest = 40; delete x.tg; } if (sel.includes('gvt')){ x.sets = 10; x.reps = 10; x.rest = 75; delete x.tg; } if (sel.includes('s21')){ x.reps = 21; delete x.tg; }
        sh.remove(); keep(); if (sel.length) toast3(`${sel.map(k => MET[k].n).join(' + ')} aplicado`); } });
  });
}
function exGallery(onPick, single){
  let q = '', n = 0; const D = K().EXDB, FL = K().EXFLAT, N = K().NRM;
  const sh = sheet3(`<span class="lbl">Galeria de exercícios</span><p class="d" style="font-size:34px;margin:6px 0 10px">${single ? 'Trocar exercício' : 'Adicionar exercício'}</p>
    <input class="inp" id="gx-q" placeholder="Buscar: rosca, agachamento, supino…" autocomplete="off" aria-label="Buscar exercício"><div id="gx-b" style="margin-top:12px"></div>`, null, single ? 'Fechar' : 'Pronto');
  const B = sh.querySelector('#gx-b'), item = x => `<button class="gx-it" data-gx="${esc(x.n)}"><span><b>${esc(x.n)}</b>${q ? `<small>${x.r} • ${x.m}</small>` : ''}</span><span class="gx-p">+</span></button>`;
  const tree = () => Object.keys(D).map(r => { const ms = Object.keys(D[r]), tot = ms.reduce((a, m) => a + D[r][m].length, 0);
    return `<details class="gx-acc"><summary>${K().mtile(r.toLowerCase(), 40)}<span><b>${r}</b><small>${ms.length > 1 ? ms.join(' • ') : tot + ' exercícios'}</small></span><i class="gx-chev"></i></summary>
      <div class="gx-in">${ms.length > 1 ? ms.map(m => `<details class="gx-sub"><summary><b>${m}</b><span class="pill">${D[r][m].length}</span><i class="gx-chev"></i></summary><div>${D[r][m].map(nm => item(FL.find(x => x.n === nm))).join('')}</div></details>`).join('') : D[r][ms[0]].map(nm => item(FL.find(x => x.n === nm))).join('')}</div></details>`; }).join('');
  const drawG = () => { if (!q){ B.innerHTML = tree(); return; } const L = FL.filter(x => N(x.n).includes(N(q)) || N(x.m).includes(N(q))), by = {}; L.forEach(x => (by[x.m] = by[x.m] || []).push(x));
    B.innerHTML = L.length ? Object.entries(by).map(([m, xs]) => `<p class="lbl" style="margin:12px 0 4px">${m}</p>${xs.map(item).join('')}`).join('') : `<p class="meta">Nada com "${esc(q)}". Escreva um exercício personalizado na ficha.</p>`; };
  drawG();
  sh.querySelector('#gx-q').addEventListener('input', e => { q = e.target.value.trim(); drawG(); });
  B.addEventListener('click', e => { const it = e.target.closest('[data-gx]'); if (!it) return; onPick(it.dataset.gx); if (single){ sh.remove(); return; } n++;
    const pp = it.querySelector('.gx-p'); pp.textContent = '✓'; pp.classList.add('on'); setTimeout(() => { pp.textContent = '+'; pp.classList.remove('on'); }, 1200);
    const d = sh.querySelector('[data-close]'); if (d) d.textContent = `Pronto • ${n} adicionado${n > 1 ? 's' : ''}`; });
}
// cópia sem cargas nem histórico
function stripPlans(plans){ return plans.map(w => { const map = {}; return { letter:w.letter, title:w.title || 'Treino ' + w.letter, focus:w.focus || '', exercises:(w.exercises || []).map(e => {
  const o = { uid:uidN(), name:e.name, sets:e.tg ? e.tg.length : (e.sets || 3), reps:e.tg ? e.tg[0][1] : (e.reps || 10), rest:e.rest ?? 60, obs:e.obs || '', eq:e.eq || eqGuess(e.name) };
  if ((e.mets || []).length) o.mets = [...e.mets]; if (e.link){ o.link = map[e.link] || (map[e.link] = 'g' + Math.random().toString(36).slice(2, 7)); } return o; }) }; }); }
function applyPlans(plans, from){
  FX.wk = stripPlans(plans).map((w, i) => ({ ...w, letter:LETTERS[i] })); FX.li = 0; FX.tab = 'treino'; draw();
  toast3(`${from} aplicado. Revise e toque em "Salvar e avisar".`);
}
function applyDiet(d, from){ FX.diet = { meals:clone(d.meals || []), notes:d.notes || '' }; FX.tab = 'dieta'; draw(); toast3(`${from} aplicada. Revise e toque em "Salvar e avisar".`); }
function tplPick(kind){
  let tag = '';
  const sh = sheet3(`<span class="lbl">Modelos de ${kind}</span><p class="d" style="font-size:34px;margin:6px 0 10px">Usar modelo</p><div id="tp-b"></div>`);
  const drawT = () => { const all = T.templates.filter(t => t.kind === kind), tags = [...new Set(all.flatMap(t => t.tags || []))], L = all.filter(t => !tag || (t.tags || []).includes(tag));
    sh.querySelector('#tp-b').innerHTML = (all.length ? '' : `<p class="meta">Nenhum modelo de ${kind} ainda. Monte uma ficha e toque em "Salvar como modelo".</p>`)
      + (tags.length ? `<div class="chips" style="margin-bottom:10px"><button class="chip" aria-pressed="${!tag}" data-tp-tag="">Todos</button>${tags.map(g => `<button class="chip" aria-pressed="${tag === g}" data-tp-tag="${esc(g)}">${esc(g)}</button>`).join('')}</div>` : '')
      + L.map(t => `<button class="swap" data-tp="${t.id}"><span style="min-width:0"><b>${esc(t.name)}</b><small>${tplSummary(t)}${(t.tags || []).length ? ' • ' + t.tags.map(esc).join(', ') : ''}</small></span><span class="delta">usar</span></button>`).join(''); };
  drawT();
  sh.addEventListener('click', async e => { const g = e.target.closest('[data-tp-tag]'); if (g){ tag = g.dataset.tpTag; drawT(); return; }
    const b = e.target.closest('[data-tp]'); if (!b) return; const t = T.templates.find(x => x.id === b.dataset.tp); sh.remove();
    if (kind === 'treino') applyPlans(t.content.plans || [], `Modelo "${t.name}"`); else applyDiet(t.content, `Modelo "${t.name}"`);
    t.uses = (t.uses || 0) + 1; sb.from('templates').update({ uses:t.uses }).eq('id', t.id).then(() => {}, () => {}); });
}
function copyPick(kind){
  const others = students().filter(p => p.id !== FX.id && (kind === 'treino' ? wksOf(p.id).length : ((dietOf(p.id) || {}).meals || []).length));
  const sh = sheet3(`<span class="lbl">Copiar ${kind}</span><p class="d" style="font-size:34px;margin:6px 0 6px">De qual aluno?</p><p class="meta" style="margin:0 0 10px">${kind === 'treino' ? 'Vêm os exercícios, séries, reps, métodos e conjugados. As cargas e o histórico ficam com o outro aluno.' : 'Vêm as refeições, horários e quantidades.'}</p>
    ${others.length ? others.map(p => `<button class="swap" data-cp="${p.id}"><span style="min-width:0"><b>${esc(p.name)}</b><small>${kind === 'treino' ? wksOf(p.id).map(w => w.title || w.letter).join(' • ') : tplSummary({ kind:'dieta', content:dietOf(p.id) })}</small></span><span class="delta">copiar</span></button>`).join('') : `<p class="meta">Nenhum outro aluno com ${kind} montado.</p>`}`);
  sh.addEventListener('click', e => { const b = e.target.closest('[data-cp]'); if (!b) return; const p = prof(b.dataset.cp); sh.remove();
    if (kind === 'treino') applyPlans(wksOf(p.id), `Treino de ${first(p.name)}`); else applyDiet(dietOf(p.id), `Dieta de ${first(p.name)}`); });
}
function saveTpl(kind){
  if (kind === 'treino' && !FX.wk.some(w => w.exercises.length)){ toast3('Monte pelo menos um exercício antes'); return; }
  if (kind === 'dieta' && !FX.diet.meals.length){ toast3('Monte pelo menos uma refeição antes'); return; }
  let tags = [];
  sheet3(`<span class="lbl">Salvar como modelo</span><p class="d" style="font-size:34px;margin:6px 0 6px">Modelo de ${kind}</p><p class="meta" style="margin:0 0 12px">${kind === 'treino' ? `Salva ${FX.wk.length === 1 ? 'o treino' : `os ${FX.wk.length} treinos`} sem as cargas, para usar em outros alunos.` : 'Salva as refeições e quantidades.'}</p>
    <div class="field"><label for="st-n" style="font-weight:800;font-size:14px">Nome</label><input class="inp" id="st-n" placeholder="${kind === 'treino' ? 'ex.: Glúteo iniciante' : 'ex.: Emagrecimento 1800 kcal'}"></div>
    <p class="lbl" style="margin:14px 0 6px">Etiquetas</p><div class="chips" id="st-tags">${TAGS0[kind].map(g => `<button class="chip" aria-pressed="false" data-st="${esc(g)}">${esc(g)}</button>`).join('')}</div>
    <button class="btn solid wide" style="margin-top:14px" id="st-ok">Salvar modelo</button>`, sh => {
    sh.querySelector('#st-tags').onclick = e => { const b = e.target.closest('[data-st]'); if (!b) return; const g = b.dataset.st; tags = tags.includes(g) ? tags.filter(x => x !== g) : [...tags, g]; b.setAttribute('aria-pressed', tags.includes(g)); };
    sh.querySelector('#st-ok').onclick = async () => { const name = sh.querySelector('#st-n').value.trim(); if (!name){ toast3('Dê um nome ao modelo'); return; }
      const content = kind === 'treino' ? { plans:stripPlans(FX.wk) } : clone(FX.diet);
      const row = { id:K().uuid(), kind, name, tags, content, uses:0, created_by:ME.id };
      const { error } = await sb.from('templates').insert(row); if (error){ toast3('Não salvou. Confira a internet.'); return; }
      T.templates.unshift({ ...row, updated_at:new Date().toISOString() }); sh.remove(); toast3(`Modelo "${name}" salvo`); };
  });
}
async function saveFx(confirmed){
  const p = fxP();
  if (FX.tab === 'treino'){
    const L = fxDiff();
    if (!L.length){ toast3('Nada mudou no treino.'); return; }
    if (!confirmed){ sheet3(`<span class="lbl">Antes de salvar</span><p class="d" style="font-size:36px;margin:6px 0 10px">${L.length} mudança${L.length > 1 ? 's' : ''}</p><ul class="chg-list">${L.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <button class="btn solid wide" data-fx-save-ok>Salvar e avisar ${esc(first(p.name))}</button><button class="btn wide" style="margin-top:8px" data-fx-prev>Ver como ${esc(first(p.name))} vê</button>`); return; }
    const now = new Date().toISOString();
    const rows = FX.wk.map((w, i) => { w.exercises.forEach(e => { if (e.tg){ e.sets = e.tg.length; e.reps = e.tg[0][1]; } }); linkNorm(w.exercises);
      return { user_id:p.id, letter:LETTERS[i], title:w.title || 'Treino ' + LETTERS[i], focus:w.focus || '', position:i, exercises:w.exercises, updated_by:ME.id, updated_at:now }; });
    const { error } = await sb.from('workouts').upsert(rows, { onConflict:'user_id,letter' });
    if (error){ toast3('Não salvou. Confira a internet e tente de novo.'); return; }
    const gone = wksOf(p.id).map(w => w.letter).filter(l => !rows.some(r => r.letter === l));
    for (const l of gone) await sb.from('workouts').delete().eq('user_id', p.id).eq('letter', l);
    T.workouts = T.workouts.filter(w => w.user_id !== p.id).concat(rows);
    FX.wk.forEach((w, i) => { w.letter = LETTERS[i]; }); FX.wk0 = clone(FX.wk);
  } else {
    if (!dietChanged()){ toast3('Nada mudou na dieta.'); return; }
    const row = { user_id:p.id, meals:FX.diet.meals, notes:FX.diet.notes || null, updated_by:ME.id, updated_at:new Date().toISOString() };
    const { error } = await sb.from('diets').upsert(row, { onConflict:'user_id' });
    if (error){ toast3('Não salvou. Confira a internet e tente de novo.'); return; }
    T.diets = T.diets.filter(d => d.user_id !== p.id).concat([row]); FX.diet0 = clone(FX.diet);
  }
  root.querySelectorAll('.scrim').forEach(x => x.remove());
  draw(); toast3(`${FX.tab === 'treino' ? 'Treino salvo' : 'Dieta salva'}. ${first(p.name)} vê o aviso quando abrir o app.`);
}
async function setProf(upd, msg){
  const p = fxP(); const { error } = await sb.from('profiles').update(upd).eq('id', p.id);
  if (error){ toast3('Não salvou. Confira a internet.'); return false; } Object.assign(p, upd);
  const st = (window.TEAM && TEAM.students || []).find(s => s.id === p.id); if (st && upd.plan) st.plan = upd.plan;
  draw(); if (msg) toast3(msg); return true;
}

/* ---------- arrastar para ordenar e conjugar ---------- */
let DRG = null, DRGT = null;
function dragLayout(){
  const sd = scrollY - DRG.s0, dy = DRG.y - DRG.y0 + sd, cy = DRG.mid0 - sd + dy; let link = null, up = 0, down = 0;
  DRG.items.forEach(o => { if (o.i === DRG.from) return; const mid = o.top0 - sd + o.h / 2, band = Math.max(16, o.h * .24); let sh = 0;
    if (o.i > DRG.from && cy > mid + band) sh = -DRG.step; else if (o.i < DRG.from && cy < mid - band) sh = DRG.step;
    o.sh = sh; if (sh < 0) up += o.h + o.gap; if (sh > 0) down += o.h + o.gap; if (!link && Math.abs(cy - (mid + sh)) < band && !sh) link = o; });
  DRG.items.forEach(o => { if (o.i === DRG.from) return; o.el.style.transform = o.sh ? `translateY(${o.sh}px)` : ''; o.el.classList.toggle('lk-hint', link === o); });
  DRG.card.style.transform = `translateY(${dy}px) scale(1.03)`;
  if ((link ? 'link' : 'move') !== DRG.mode || link !== DRG.link){ try { navigator.vibrate && navigator.vibrate(8); } catch(_){} }
  DRG.mode = link ? 'link' : 'move'; DRG.link = link; DRG.card.classList.toggle('will-link', !!link);
}
function dragStart(e){
  const h = e.target.closest('.drag-h'); if (!h) return; const box = h.closest('[data-sortbox]'), card = h.closest('[data-idx]'); if (!box || !card) return; e.preventDefault();
  const t0 = card.getBoundingClientRect().top; box.style.minHeight = box.offsetHeight + 'px'; box.classList.add('sorting'); const t1 = card.getBoundingClientRect().top; scrollTo({ top:scrollY + t1 - t0, behavior:'instant' });
  const els = [...box.querySelectorAll('[data-idx]')];
  const items = els.map((el, k) => { const r = el.getBoundingClientRect(), nx = els[k + 1]; return { el, i:+el.dataset.idx, top0:r.top, h:r.height, gap:nx ? nx.getBoundingClientRect().top - r.bottom : 10 }; });
  const me = items.find(o => o.el === card);
  DRG = { box, card, items, from:+card.dataset.idx, y0:e.clientY, y:e.clientY, s0:scrollY, mid0:me.top0 + me.h / 2, step:me.h + me.gap, mode:'move', link:null };
  card.classList.add('dragging'); try { h.setPointerCapture(e.pointerId); } catch(_){}
  dragLayout();
  DRGT = setInterval(() => { if (!DRG) return; const H = innerHeight; let v = 0; if (DRG.y < 120) v = -(120 - DRG.y) / 6; else if (DRG.y > H - 160) v = (DRG.y - (H - 160)) / 6; if (v){ scrollTo({ top:scrollY + v, behavior:'instant' }); dragLayout(); } }, 16);
}
function dragEnd(){
  if (!DRG) return; clearInterval(DRGT); const D0 = DRG; DRG = null;
  const arr = curPl().exercises, x = arr[D0.from], me = D0.items.find(o => o.i === D0.from);
  const target = D0.mode === 'link' && D0.link ? (D0.link.top0 + D0.link.h * .35) - me.top0 : (D0.items.some(o => o.sh > 0) ? -D0.items.filter(o => o.sh > 0).reduce((a, o) => a + o.h + o.gap, 0) : D0.items.filter(o => o.sh < 0).reduce((a, o) => a + o.h + o.gap, 0));
  D0.card.classList.add('settle'); D0.card.style.transform = `translateY(${target}px) scale(1)`;
  setTimeout(() => {
    D0.box.classList.remove('sorting'); D0.box.style.minHeight = ''; D0.items.forEach(o => { o.el.style.transform = ''; o.el.classList.remove('lk-hint'); }); D0.card.classList.remove('dragging', 'settle', 'will-link'); D0.card.style.transform = '';
    if (D0.mode === 'link' && D0.link){ const t = arr[D0.link.i]; if (!t || t === x){ keep(); return; } arr.splice(D0.from, 1); const ti = arr.indexOf(t); const id = t.link || ('g' + Math.random().toString(36).slice(2, 7)); t.link = id; x.link = id; arr.splice(ti + 1, 0, x); linkNorm(arr); keep();
      const g = K().linkGroups(arr)[arr.indexOf(x)]; toast3(`🔗 Conjugados: ${g ? g.n : 'bi-set'}. Sem descanso entre eles.`); return; }
    const nUp = D0.items.filter(o => o.sh < 0).length, nDown = D0.items.filter(o => o.sh > 0).length, ni = D0.from + nUp - nDown;
    if (ni === D0.from){ keep(); return; } const was = !!x.link; arr.splice(D0.from, 1); arr.splice(ni, 0, x); delete x.link; linkNorm(arr); keep(); if (was) toast3('Separado do bloco conjugado');
  }, 200);
}

/* ---------- casca, desenho e eventos ---------- */
function sheet3(html, onMount, closeLbl){
  const s = document.createElement('div'); s.className = 'scrim';
  s.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}<button class="btn wide" style="margin-top:14px" data-close>${closeLbl || 'Fechar'}</button></div>`;
  s.addEventListener('click', e => { if (e.target === s || e.target.closest('[data-close]')) s.remove(); });
  root.appendChild(s); onMount && onMount(s); return s;
}
function toast3(msg){ root.querySelectorAll('.toast').forEach(x => x.remove()); const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; root.appendChild(t); setTimeout(() => t.remove(), 2800); }
const NAV_IC = {
  alunos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-4-5.6"/></svg>',
  modelos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  convites:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
  indicacoes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M19 7v6M16 10h6"/></svg>',
  renovacoes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg>'
};
function shell(body){
  const tabs = [['alunos','Alunos'], ['modelos','Modelos'], ['convites','Convites'], ['indicacoes','Indicações'], ['renovacoes','Renovar']];
  return `<div class="app">${FX ? '' : `<header class="top"><div class="logo"><span class="emb" style="width:34px;height:34px">${RA.emblem(5, false, 34)}</span><span class="d">Chames Crew</span></div></header>`}
    <section class="view${FX ? ' fx-page' : ''}">${body}</section></div>
    ${FX ? '' : `<div class="tabs"><nav aria-label="Seções do painel" style="grid-template-columns:repeat(${tabs.length},1fr)">${tabs.map(([k, l]) => `<button data-p-go="${k}" ${P.tab === k ? 'aria-current="page"' : ''}>${NAV_IC[k]}${l}</button>`).join('')}</nav></div>`}`;
}
function draw(){
  if (!root) return;
  const body = FX ? vFicha() : P.tab === 'modelos' ? vModelos() : vAlunos();
  const keep = [...root.querySelectorAll('.scrim,.toast')];
  root.innerHTML = `<style>${CSS3}.fx-page .fx-top{position:sticky;top:0;z-index:5;background:var(--bg);padding:12px 0}</style>` + shell(body);
  keep.forEach(k => root.appendChild(k));
}
// redesenha mantendo a rolagem e as gavetas abertas
function keep(){ const y = scrollY, open = [...root.querySelectorAll('details[open] > summary')].map(x => x.textContent); draw(); root.querySelectorAll('details > summary').forEach(s => { if (open.includes(s.textContent)) s.parentElement.open = true; }); scrollTo(0, y); }
function bind(){
  root.addEventListener('pointerdown', dragStart);
  root.addEventListener('pointermove', e => { if (!DRG) return; e.preventDefault(); DRG.y = e.clientY; dragLayout(); }, { passive:false });
  root.addEventListener('pointerup', dragEnd); root.addEventListener('pointercancel', dragEnd);
  root.addEventListener('input', e => {
    const t = e.target;
    if (t.matches('[data-p-q]')){ P.q = t.value; const pos = t.selectionStart; draw(); const n = $r('[data-p-q]'); if (n){ n.focus(); try { n.setSelectionRange(pos, pos); } catch(_){} } return; }
    if (!FX) return;
    const tg = t.closest('[data-tg]'); if (tg){ const [i, si, k] = tg.dataset.tg.split(':').map(Number), pl = curPl(), x = pl.exercises[i]; x.tg = tgOf(x, prevFor(FX.id, pl.letter, x)).map(r => [...r]); const v = parseFloat(t.value.replace(',', '.')); if (!isNaN(v)) x.tg[si][k] = k ? Math.round(v) : v; x.sets = x.tg.length; x.reps = x.tg[0][1]; return; }
    const ob = t.closest('[data-fx-obs]'); if (ob){ curPl().exercises[+ob.dataset.fxObs].obs = t.value; return; }
    if (t.matches('[data-fx-title]')){ curPl().title = t.value; return; }
    if (t.matches('[data-fx-focus]')){ curPl().focus = t.value; return; }
    const mn = t.closest('[data-fx-mname]'); if (mn){ FX.diet.meals[+mn.dataset.fxMname].name = t.value; return; }
    if (t.matches('[data-fx-dnote]')){ FX.diet.notes = t.value; return; }
    if (t.matches('[data-fx-awnote]')){ FX.aw.note = t.value; return; }
  });
  root.addEventListener('change', e => { const t = e.target;
    if (FX && (t.closest('[data-tg]') || t.matches('[data-fx-title],[data-fx-focus],[data-fx-mname]'))){ keep(); return; }
    if (FX && t.matches('[data-fx-hidew]')){ setProf({ hide_weight:t.checked }, t.checked ? 'Peso oculto para o aluno' : 'O aluno volta a ver o peso'); }
  });
  root.addEventListener('click', async e => {
    const t = e.target, q = s => t.closest(s);
    let b;
    if ((b = q('[data-p-go]'))){ const k = b.dataset.pGo; if (k === 'alunos' || k === 'modelos'){ P.tab = k; view.ttab = k; draw(); scrollTo(0, 0); return; } unmount(); view = { screen:'hub', ttab:k }; scrollTo(0, 0); render(); return; }
    if (q('[data-p-install]')){ unmount(); view = { screen:'install' }; scrollTo(0, 0); render(); return; }
    if (q('[data-p-logout]')){ sb.auth.signOut().finally(() => { try { localStorage.removeItem('cc-me'); localStorage.removeItem('cc3-team'); } catch(_){} location.reload(); }); return; }
    if ((b = q('[data-p-deliver]'))){ const [uid, reward] = b.dataset.pDeliver.split('|'); const { error } = await sb.from('rewards').insert({ user_id:uid, reward });
      if (error){ toast3('Não salvou. Confira a internet.'); return; } if (window.TEAM) (TEAM.rewards = TEAM.rewards || []).push({ user_id:uid, reward }); draw(); toast3('Entrega registrada'); return; }
    if ((b = q('[data-p-kind]'))){ P.tplKind = b.dataset.pKind; P.tplTag = ''; draw(); return; }
    if ((b = q('[data-p-tag]'))){ P.tplTag = b.dataset.pTag; draw(); return; }
    if ((b = q('[data-p-tview]'))){ tplView(b.dataset.pTview); return; }
    if ((b = q('[data-p-tedit]'))){ tplEdit(b.dataset.pTedit); return; }
    if ((b = q('[data-fx]'))){ openFx(b.dataset.fx); return; }
    if (!FX) return;
    const pl = curPl(), E = pl ? pl.exercises : [];
    if (q('[data-fx-close]')){ const dirty = fxDiff().length || dietChanged();
      if (dirty && !t.closest('[data-fx-close]').dataset.armed){ t.closest('[data-fx-close]').dataset.armed = 1; t.closest('[data-fx-close]').textContent = '‹ Sair sem salvar?'; toast3('Há mudanças não salvas. Toque de novo para sair sem salvar.'); return; }
      FX = null; draw(); scrollTo(0, 0); return; }
    if ((b = q('[data-fx-tab]'))){ FX.tab = b.dataset.fxTab; draw(); scrollTo(0, 0); return; }
    if (q('[data-fx-save-ok]')){ saveFx(true); return; }
    if (q('[data-fx-save]')){ saveFx(false); return; }
    if (q('[data-fx-prev]')){ fxPreview(); return; }
    if ((b = q('[data-fx-tpl]'))){ tplPick(b.dataset.fxTpl); return; }
    if ((b = q('[data-fx-copy]'))){ copyPick(b.dataset.fxCopy); return; }
    if ((b = q('[data-fx-savetpl]'))){ saveTpl(b.dataset.fxSavetpl); return; }
    // treino
    if ((b = q('[data-fx-pl]'))){ FX.li = +b.dataset.fxPl; draw(); return; }
    if (q('[data-fx-newpl]')){ const L = LETTERS[FX.wk.length]; FX.wk.push({ letter:L, title:'Treino ' + L, focus:'', exercises:[] }); FX.li = FX.wk.length - 1; draw(); return; }
    if ((b = q('[data-fx-delpl]'))){ if (!b.dataset.armed){ b.dataset.armed = 1; b.textContent = 'Toque de novo para excluir'; return; } FX.wk.splice(FX.li, 1); FX.wk.forEach((w, i) => { if (/^Treino [A-H]$/.test(w.title)) w.title = 'Treino ' + LETTERS[i]; w.letter = LETTERS[i]; }); FX.li = 0; draw(); toast3('Treino removido. Salve para confirmar.'); return; }
    if (q('[data-fx-gal]')){ exGallery(n => { E.push(newEx(n)); keep(); }); return; }
    if ((b = q('[data-fx-lib]'))){ E.push(newEx(b.dataset.fxLib)); keep(); toast3(b.dataset.fxLib + ' adicionado'); return; }
    if (q('[data-fx-addex]')){ const v = ($r('#fx-newex').value || '').trim(); if (!v){ toast3('Escreva o nome do exercício'); return; } E.push(newEx(v)); keep(); return; }
    if ((b = q('[data-fx-swap]'))){ const i = +b.dataset.fxSwap; exGallery(n => { E[i].name = n; E[i].eq = eqGuess(n); keep(); toast3('Trocado por ' + n); }, true); return; }
    if ((b = q('[data-fx-met]'))){ metPicker(E[+b.dataset.fxMet]); return; }
    if ((b = q('[data-fx-kg]'))){ const [i, v] = b.dataset.fxKg.split(':'), x = E[+i]; x.tg = tgOf(x, prevFor(FX.id, pl.letter, x)).map(r => [Math.max(0, Math.round((r[0] + +v) * 10) / 10), r[1]]); keep(); return; }
    if ((b = q('[data-fx-adds]'))){ const x = E[+b.dataset.fxAdds], tg = tgOf(x, prevFor(FX.id, pl.letter, x)).map(r => [...r]); tg.push([...tg[tg.length - 1]]); x.tg = tg; x.sets = tg.length; keep(); return; }
    if ((b = q('[data-fx-rms]'))){ const [i, si] = b.dataset.fxRms.split(':').map(Number), x = E[i], tg = tgOf(x, prevFor(FX.id, pl.letter, x)).map(r => [...r]); if (tg.length < 2) return; tg.splice(si, 1); x.tg = tg; x.sets = tg.length; keep(); return; }
    if ((b = q('[data-fx-rest]'))){ const [i, v] = b.dataset.fxRest.split(':').map(Number); E[i].rest = Math.max(0, (E[i].rest || 0) + v); keep(); return; }
    if ((b = q('[data-fx-mv]'))){ const [i, v] = b.dataset.fxMv.split(':').map(Number), j = i + v; if (j < 0 || j >= E.length) return; [E[i], E[j]] = [E[j], E[i]]; linkNorm(E); keep(); return; }
    if ((b = q('[data-fx-del]'))){ E.splice(+b.dataset.fxDel, 1); linkNorm(E); keep(); return; }
    if ((b = q('[data-unlink]'))){ const i = +b.dataset.unlink, a = E[i], L = a && a.link; if (!L) return; const nid = 'g' + Math.random().toString(36).slice(2, 7); for (let j = i + 1; j < E.length && E[j].link === L; j++) E[j].link = nid; linkNorm(E); keep(); toast3('Separados'); return; }
    // dieta
    const M = FX.diet.meals;
    if (q('[data-fx-addmeal]')){ const last = M[M.length - 1]; const s0 = last ? Math.min(22, last.win[1]) : 7; M.push({ name:'Refeição ' + (M.length + 1), win:[s0, Math.min(23.5, s0 + 3)], items:[] }); keep(); return; }
    if ((b = q('[data-fx-delmeal]'))){ if (!b.dataset.armed){ b.dataset.armed = 1; b.textContent = '?'; toast3('Toque de novo no × para remover a refeição'); return; } M.splice(+b.dataset.fxDelmeal, 1); keep(); return; }
    if ((b = q('[data-fx-win]'))){ const [mi, k, v] = b.dataset.fxWin.split(':').map(Number), w = M[mi].win; w[k] = Math.max(0, Math.min(24, w[k] + v)); if (w[0] >= w[1]) w[k ? 0 : 1] = k ? w[1] - .5 : w[0] + .5; keep(); return; }
    if ((b = q('[data-fx-g]'))){ const [mi, ii, v] = b.dataset.fxG.split(':').map(Number), it = M[mi].items[ii]; it.g = Math.max(5, it.g + v); keep(); return; }
    if ((b = q('[data-fx-mu]'))){ const [mi, ii] = b.dataset.fxMu.split(':').map(Number), it = M[mi].items[ii]; it.mu = !it.mu; if (it.mu){ const u = K().HM[it.f][2]; it.n = Math.max(.5, Math.round(it.g / u * 2) / 2); it.g = Math.round(it.n * u * 10) / 10; } else { delete it.n; delete it.mu; } keep(); return; }
    if ((b = q('[data-fx-u]'))){ const [mi, ii, v] = b.dataset.fxU.split(':').map(Number), it = M[mi].items[ii], u = K().HM[it.f][2]; let n = it.n || Math.round(it.g / u * 2) / 2; n = v < 0 ? (n <= 1 ? .5 : n - 1) : (n < 1 ? 1 : n + 1); it.n = n; it.g = Math.round(n * u * 10) / 10; keep(); return; }
    if ((b = q('[data-fx-delf]'))){ const [mi, ii] = b.dataset.fxDelf.split(':').map(Number); M[mi].items.splice(ii, 1); keep(); return; }
    if ((b = q('[data-fx-addfood]'))){ const mi = +b.dataset.fxAddfood, f = $r(`[data-fx-addsel="${mi}"]`).value, u = K().HM[f]; M[mi].items.push(u && u[2] >= 40 ? { f, g:u[2], n:1, mu:true } : { f, g:100 }); keep(); return; }
    if ((b = q('[data-fx-fsw]'))){ const [mi, ii] = b.dataset.fxFsw.split(':').map(Number), it = M[mi].items[ii], C = K();
      const sh = sheet3(`<span class="lbl">${esc(C.fname(it.f))} • ${nf(it.g)} g</span><p class="d" style="font-size:34px;margin:6px 0 10px">Trocar alimento</p><p class="meta" style="margin:0 0 8px">Mesmo grupo, porção pelo meio-termo de calorias e macro.</p>
        ${C.subsOf(it.f).map(f => { const g = C.eqMix(it.f, it.g, f), dk = Math.round(C.mac(f, g).k - C.mac(it.f, it.g).k); return `<button class="swap" data-fsw="${f}:${g}"><span style="min-width:0"><b>${esc(C.fname(f))}</b><small>${nf(g)} g${C.hmTxt(f, g)}</small></span><span class="delta">${dk >= 0 ? '+' : ''}${dk} kcal</span></button>`; }).join('')}`);
      sh.addEventListener('click', ev => { const x = ev.target.closest('[data-fsw]'); if (!x) return; const [f, g] = x.dataset.fsw.split(':'); it.f = f; it.g = +g; delete it.n; delete it.mu; sh.remove(); keep(); toast3('Alimento trocado'); }); return; }
    // plano
    if ((b = q('[data-fx-set]'))){ const [k, v] = b.dataset.fxSet.split(':'); const val = k === 'presencial' ? v === 'true' : k === 'plan' ? v : +v; setProf({ [k]:val }, 'Plano atualizado'); return; }
    if (q('[data-fx-kgsave]')){ const v = parseFloat(($r('#fx-kg').value || '').replace(',', '.')); if (!(v > 30 && v < 300)){ toast3('Peso inválido'); return; } setProf({ weight_kg:v }, 'Peso salvo. A meta de água já usa o novo peso.'); return; }
    // medalhas e level
    if ((b = q('[data-fx-awm]'))){ FX.aw.medal = b.dataset.fxAwm; keep(); return; }
    if ((b = q('[data-fx-awt]'))){ FX.aw.tier = +b.dataset.fxAwt; keep(); return; }
    if (q('[data-fx-give]')){ const p = fxP(), f = FX.aw; const row = { user_id:p.id, medal_id:f.medal, tier:f.tier, round:0, note:(f.note || '').trim() || null, created_by:ME.id };
      const { error } = await sb.from('awards').insert(row); if (error){ toast3('Não salvou. Confira a internet.'); return; }
      T.awards.unshift({ ...row, id:K().uuid(), created_at:new Date().toISOString() }); FX.aw.note = ''; keep(); toast3('Medalha liberada. Aparece quando o aluno abrir o app.'); return; }
    if ((b = q('[data-fx-delaw]'))){ if (!b.dataset.armed){ b.dataset.armed = 1; b.textContent = 'confirmar'; return; } const { error } = await sb.from('awards').delete().eq('id', b.dataset.fxDelaw); if (error){ toast3('Não removeu.'); return; } T.awards = T.awards.filter(a => a.id !== b.dataset.fxDelaw); keep(); toast3('Removida'); return; }
    if ((b = q('[data-fx-lv]'))){ const p = fxP(), s = p.stats || {}, real = s.cyc_real ?? Math.max(0, (s.cycles || 0) - (p.level_bonus || 0)), i = +b.dataset.fxLv; const bonus = Math.max(-real, K().CYC[i] - real);
      if (await setProf({ level_bonus:bonus, stats:{ ...s, cycles:real + bonus, lv:i } }, `Level ajustado para ${K().LVN[i]}`)) return; return; }
    if ((b = q('[data-fx-bonus]'))){ const p = fxP(), s = p.stats || {}, real = s.cyc_real ?? Math.max(0, (s.cycles || 0) - (p.level_bonus || 0)), v = b.dataset.fxBonus; const bonus = v === 'reset' ? 0 : Math.max(-real, (p.level_bonus || 0) + +v);
      let lv = 0; K().CYC.forEach((c, i) => { if (real + bonus >= c) lv = i; }); setProf({ level_bonus:bonus, stats:{ ...s, cycles:real + bonus, lv } }, 'Ajuste salvo'); return; }
  });
}

/* ---------- ligar e desligar ---------- */
async function mount(){
  if (!ME || ME.role !== 'equipe' || !window.CC2) return false;
  const app = document.getElementById('app');
  if (!host){ host = document.createElement('div'); host.id = 'v3'; app.parentNode.insertBefore(host, app); root = host.attachShadow({ mode:'open' }); bind(); }
  app.style.display = 'none'; host.style.display = '';
  try { const th = document.documentElement.getAttribute('data-theme'); if (th) host.setAttribute('data-theme', th); } catch(e){}
  P.tab = view.ttab === 'modelos' ? 'modelos' : 'alunos';
  if (!CSS3) CSS3 = await K().css();
  if (!mounted){ mounted = true; draw(); await loadAll(); }
  draw(); return true;
}
function unmount(){ if (host) host.style.display = 'none'; const app = document.getElementById('app'); if (app) app.style.display = ''; }
window.V3 = { mount, unmount, reload:async () => { await loadAll(); draw(); }, open:id => { openFx(id); } };
})();
