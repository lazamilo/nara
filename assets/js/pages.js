(() => {
const U = window.NaraUtil;
const { P, C, IMG, tops, kidsOf, inCat, catBySlug, catById, esc, ARR, Q } = U;
const page = document.body.dataset.page;
const qs = new URLSearchParams(location.search);
document.querySelectorAll('.bgflake-wrap').forEach(e => e.outerHTML = flakeSVG('bgflake'));

// ---------- catalog ----------
if (document.getElementById('side')) {
  const side = document.getElementById('side'), grid = document.getElementById('grid'), count = document.getElementById('count');
  const search = document.getElementById('q'), chips = document.getElementById('chips'), title = document.getElementById('catTitle'), sel = document.getElementById('catSel');
  let k = qs.get('k') || '', term = qs.get('q') || '';
  search.value = term;
  side.innerHTML = `<a href="?" data-k="" class="${k ? '' : 'on'}"><b>Vsi izdelki</b><span>${P.length}</span></a>` + tops.map(c => {
    const kids = kidsOf(c.id);
    return `<a href="?k=${c.s}" data-k="${c.s}">${esc(c.n)}<span>${c.k}</span></a>${kids.length ? `<div class="subs" data-parent="${c.s}" hidden>${kids.map(s => `<a href="?k=${s.s}" data-k="${s.s}">${esc(s.n)}<span>${s.k}</span></a>`).join('')}</div>` : ''}`;
  }).join('');
  sel.innerHTML = `<option value="">Vsi izdelki (${P.length})</option>` + tops.map(c => `<option value="${c.s}">${esc(c.n)} (${c.k})</option>${kidsOf(c.id).map(s => `<option value="${s.s}">  · ${esc(s.n)}</option>`).join('')}`).join('');
  sel.addEventListener('change', () => go(sel.value));
  side.addEventListener('click', e => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); go(a.dataset.k); });
  chips.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) go(b.dataset.k); });
  search.addEventListener('input', () => { term = search.value.trim(); render(); history.replaceState(null, '', url()); });
  const url = () => '?' + new URLSearchParams(Object.fromEntries([['k', k], ['q', term]].filter(x => x[1]))).toString();
  function go(nk) { k = nk || ''; history.pushState(null, '', url()); render(); window.lenis ? lenis.scrollTo(0) : scrollTo(0, 0); }
  addEventListener('popstate', () => { const q = new URLSearchParams(location.search); k = q.get('k') || ''; render(); });
  function render() {
    const c = catBySlug[k];
    const topC = c ? (c.p ? catById[c.p] : c) : null;
    side.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.k === k));
    side.querySelectorAll('.subs').forEach(s => s.hidden = !topC || s.dataset.parent !== topC.s);
    sel.value = k;
    title.textContent = c ? c.n : 'Prodajni program';
    document.getElementById('crumbCat').textContent = c ? c.n : 'Vsi izdelki';
    const kids = topC ? kidsOf(topC.id) : [];
    chips.innerHTML = kids.length ? [`<button class="chip ${c === topC ? 'on' : ''}" data-k="${topC.s}">Vse</button>`, ...kids.map(s => `<button class="chip ${c === s ? 'on' : ''}" data-k="${s.s}">${esc(s.n)}</button>`)].join('') : '';
    const t = term.toLowerCase();
    const list = P.filter(p => (!c || inCat(p, c.id)) && (!t || (p.n + ' ' + p.sd).toLowerCase().includes(t)));
    count.textContent = `${list.length} ${list.length === 1 ? 'izdelek' : list.length === 2 ? 'izdelka' : list.length < 5 && list.length ? 'izdelki' : 'izdelkov'}`;
    grid.innerHTML = list.length ? list.map(pcard).join('') : `<div class="empty">Ni zadetkov. Pokličite nas na +386 59 012 765, pomagali vam bomo najti pravo opremo.</div>`;
    document.title = (c ? c.n + ' · ' : '') + 'Prodajni program · Nara';
    if (window.gsap && !U.reduced) gsap.from(grid.children, { opacity: 0, y: 24, duration: .6, stagger: { each: .02, from: 'start' }, ease: 'expo.out', clearProps: 'all' });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  render();
}

// ---------- product ----------
if (document.getElementById('prod')) {
  const p = U.prodBySlug(qs.get('s')) || P[0];
  const sub = catById[p.c[0]], top = sub && sub.p ? catById[sub.p] : sub;
  document.title = p.n + ' · Nara hladilna tehnika';
  const on = Q.has(p.s);
  document.getElementById('prod').innerHTML = `
    <div class="gallery"><div class="g-main"><img id="gmain" src="${IMG + (p.i[0] || '')}" alt="${esc(p.n)}"></div>
      ${p.i.length > 1 ? `<div class="g-thumbs">${p.i.map((f, i) => `<button class="${i ? '' : 'on'}" data-src="${IMG + f}"><img src="${IMG + f}" alt=""></button>`).join('')}</div>` : ''}</div>
    <div class="prod-info">
      <div class="crumbs"><a href="index.html">Domov</a>/<a href="produkti.html">Prodajni program</a>${top ? `/<a href="produkti.html?k=${top.s}">${esc(top.n)}</a>` : ''}</div>
      ${sub ? `<a class="cat" href="produkti.html?k=${sub.s}">${esc(sub.n)}</a>` : ''}
      <h1 class="h1">${esc(p.n)}</h1>
      <div class="prod-actions">
        <button class="btn blue-b ${on ? 'in' : ''}" data-q="${p.s}" data-label="1"><span class="lbl">${on ? 'Dodano v povpraševanje' : 'Dodaj v povpraševanje'}</span></button>
        <a class="btn ghost" href="tel:+38659012765">+386 59 012 765</a>
      </div>
      <div class="rich">${p.sd || ''}${p.d || ''}${!p.sd && !p.d ? '<p>Za tehnične podatke in ponudbo nas pokličite ali pošljite povpraševanje.</p>' : ''}</div>
    </div>`;
  document.querySelectorAll('.g-thumbs button').forEach(b => b.addEventListener('click', () => {
    document.getElementById('gmain').src = b.dataset.src;
    document.querySelectorAll('.g-thumbs button').forEach(x => x.classList.toggle('on', x === b));
  }));
  const rel = P.filter(x => x !== p && x.c.some(c => p.c.includes(c))).slice(0, 4);
  const more = rel.length < 4 && top ? P.filter(x => x !== p && !rel.includes(x) && inCat(x, top.id)).slice(0, 4 - rel.length) : [];
  document.getElementById('relGrid').innerHTML = [...rel, ...more].map(pcard).join('');
}

// ---------- forms ----------
document.querySelectorAll('.seg').forEach(seg => seg.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  const legal = b.dataset.v === 'pravna';
  seg.closest('form').querySelectorAll('[data-legal]').forEach(f => f.hidden = !legal);
}));
document.querySelectorAll('form.form').forEach(f => f.addEventListener('submit', e => {
  e.preventDefault();
  if (!f.reportValidity()) return;
  f.classList.add('done');
  if (f.id === 'inqForm') Q.set([]);
}));

const ql = document.getElementById('qlist');
if (ql) {
  const draw = () => {
    const items = Q.get().map(U.prodBySlug).filter(Boolean);
    ql.innerHTML = items.length
      ? items.map(p => `<div class="qitem"><img src="${IMG + p.i[0]}" alt=""><div><b>${esc(p.n)}</b><div class="muted" style="font-size:15px">${esc((catById[p.c[0]] || {}).n || '')}</div></div><button data-rm="${p.s}" aria-label="Odstrani">×</button></div>`).join('')
      : `<div class="qitem" style="grid-template-columns:1fr;padding:22px"><div class="muted">Seznam je prazen. V <a class="blue" href="produkti.html">prodajnem programu</a> izdelke dodate z gumbom +.</div></div>`;
    const ta = document.getElementById('msg');
    if (ta && items.length && !ta.dataset.touched) ta.value = 'Zanima me ponudba za:\n' + items.map(p => '· ' + p.n).join('\n');
  };
  ql.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { Q.toggle(b.dataset.rm); draw(); } });
  document.getElementById('msg')?.addEventListener('input', e => e.target.dataset.touched = 1);
  draw();
}

if (window.NaraMotion) NaraMotion();
})();
