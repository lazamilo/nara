(() => {
const doc = document.documentElement;
doc.classList.remove('no-js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) doc.classList.add('reduced');

const P = window.NARA_PRODUCTS || [], C = window.NARA_CATS || [];
const IMG = 'assets/img/';
const catById = Object.fromEntries(C.map(c => [c.id, c]));
const catBySlug = Object.fromEntries(C.map(c => [c.s, c]));
const tops = C.filter(c => c.p === 0).sort((a, b) => a.n.localeCompare(b.n, 'sl'));
const kidsOf = id => C.filter(c => c.p === id);
const branch = id => [id, ...kidsOf(id).map(k => k.id)];
const inCat = (p, id) => p.c.some(c => branch(id).includes(c));
const topOf = p => { const c = catById[p.c[0]]; return c ? (c.p ? catById[c.p] : c) : null; };
const prodBySlug = s => P.find(p => p.s === s);
const prodByImg = f => P.find(p => p.i[0] === f);
const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

// preferred showcase image per top category
const CAT_IMG = { 25: 'ncd-350-0.jpg', 29: 'nsv-133-0.jpg', 58: 'nevo-120-0.jpg', 63: 'n-delight-7-prime-0.jpg', 69: 'n-ling-37-0.jpg', 85: 'nvts-258-0.jpg' };
const catImg = c => CAT_IMG[c.id] || (P.find(p => inCat(p, c.id) && p.i[0]) || {}).i?.[0];

const ARR = '<svg class="arr" viewBox="0 0 20 20" fill="none"><path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARR_UR = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 15 15 5M7 5h8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PLUS = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const CHECK = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="m4 10.5 4 4 8-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Nara snowflake motif: four inward arrows, as in their brand mark
const ARM = 'M92 10h16v42l20-20 12 12-40 40-40-40 12-12 20 20z';
window.flakeSVG = (cls = '') => `<svg class="${cls}" viewBox="0 0 200 200" aria-hidden="true"><g transform="rotate(15 100 100)">${[0, 90, 180, 270].map(r => `<path d="${ARM}" transform="rotate(${r} 100 100)"/>`).join('')}</g></svg>`;

// ---------- inquiry list ----------
const Q = {
  get() { try { return JSON.parse(localStorage.getItem('nara-q') || '[]'); } catch { return []; } },
  set(v) { try { localStorage.setItem('nara-q', JSON.stringify(v)); } catch {} document.querySelectorAll('.qcount').forEach(e => e.textContent = v.length); },
  has(s) { return this.get().includes(s); },
  toggle(s) { const v = this.get(); const i = v.indexOf(s); i < 0 ? v.push(s) : v.splice(i, 1); this.set(v); return i < 0; }
};
window.NaraQ = Q;

let toastT;
function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.innerHTML = `<span>${msg}</span><a href="kontakt.html#povprasevanje">Povpraševanje</a>`;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200);
}

window.pcard = p => {
  const top = catById[p.c[0]];
  const on = Q.has(p.s);
  return `<article class="pcard"><a class="cover" href="izdelek.html?s=${p.s}" aria-label="${esc(p.n)}"></a>
  <div class="im">${p.i[0] ? `<img src="${IMG + p.i[0]}" alt="${esc(p.n)}" loading="lazy">` : ''}</div>
  <div class="meta"><div><div class="n">${esc(p.n)}</div><div class="c">${top ? esc(top.n) : ''}</div></div>
  <button class="addq ${on ? 'in' : ''}" data-q="${p.s}" aria-label="Dodaj v povpraševanje">${on ? CHECK : PLUS}</button></div></article>`;
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-q]');
  if (!b) return;
  e.preventDefault();
  const added = Q.toggle(b.dataset.q);
  document.querySelectorAll(`[data-q="${b.dataset.q}"]`).forEach(x => {
    x.classList.toggle('in', added);
    if (x.classList.contains('addq')) x.innerHTML = added ? CHECK : PLUS;
    if (x.dataset.label) x.querySelector('.lbl').textContent = added ? 'Dodano v povpraševanje' : 'Dodaj v povpraševanje';
  });
  const p = prodBySlug(b.dataset.q);
  if (added && p) toast(`${esc(p.n)} je na seznamu`);
});

// ---------- header, mega menu, footer ----------
const page = document.body.dataset.page || '';
const NAV = [['produkti', 'Prodajni program', 'produkti.html'], ['projektiranje', 'Projektiranje in dizajn', 'projektiranje.html'], ['servis', 'Servis', 'servis.html'], ['najem', 'Najem', 'najem.html'], ['kontakt', 'Kontakt', 'kontakt.html']];

const hdr = document.createElement('header');
hdr.className = 'hdr';
hdr.innerHTML = `<div class="hdr-in wrap">
  <a class="logo" href="index.html" aria-label="Nara hladilna tehnika"><img src="assets/brand/nara-logo.png" alt="Nara hladilna tehnika" width="300" height="90"></a>
  <nav class="nav">${NAV.map(([k, l, h]) => k === 'produkti'
    ? `<button class="${page === k ? 'on' : ''}" data-mega aria-expanded="false">${l}</button>`
    : `<a class="${page === k ? 'on' : ''}" href="${h}">${l}</a>`).join('')}</nav>
  <div class="hdr-cta"><a class="btn blue-b" href="kontakt.html#povprasevanje"><span class="lbl">Povpraševanje</span><span class="qcount">${Q.get().length}</span></a>
  <button class="burger" aria-label="Meni"><span></span></button></div></div>`;
document.body.prepend(hdr);

const cols = [[], [], []];
tops.forEach((c, i) => cols[Math.floor(i / Math.ceil(tops.length / 3))].push(c));
const mega = document.createElement('div');
mega.className = 'mega';
mega.innerHTML = `<div class="wrap mega-grid">${cols.map(col => `<div class="mega-col">${col.map(c => `<a href="produkti.html?k=${c.s}" data-img="${catImg(c) || ''}"><b>${esc(c.n)}</b><span>${c.k}</span></a>`).join('')}</div>`).join('')}
  <a class="mega-feat" href="produkti.html"><div class="t">Vseh ${P.length} izdelkov<br><span class="gray">v enem katalogu</span></div><img src="${IMG}n-delight-7-prime-0.jpg" alt=""><span class="btn light b">Odpri katalog ${ARR}</span></a></div>`;
const scrim = document.createElement('div'); scrim.className = 'mega-scrim';
document.body.append(mega, scrim);
const megaBtn = hdr.querySelector('[data-mega]');
const featImg = mega.querySelector('.mega-feat img');
const setMega = o => { mega.classList.toggle('open', o); scrim.classList.toggle('open', o); megaBtn.setAttribute('aria-expanded', o); };
megaBtn.addEventListener('click', () => setMega(!mega.classList.contains('open')));
scrim.addEventListener('click', () => setMega(false));
document.addEventListener('keydown', e => e.key === 'Escape' && setMega(false));
mega.querySelectorAll('[data-img]').forEach(a => a.addEventListener('mouseenter', () => { if (a.dataset.img) featImg.src = IMG + a.dataset.img; }));

const mnav = document.createElement('div');
mnav.className = 'mnav';
mnav.innerHTML = `<div class="top"><a class="logo-box" href="index.html"><img src="assets/brand/nara-logo.png" alt="Nara"></a><button class="x" aria-label="Zapri">×</button></div>
  <a class="big" href="produkti.html">Prodajni program</a><div class="sub">${tops.map(c => `<a href="produkti.html?k=${c.s}">${esc(c.n)}</a>`).join('')}</div>
  ${NAV.slice(1).map(([, l, h]) => `<a class="big" href="${h}">${l}</a>`).join('')}
  <div class="sub" style="margin-top:28px"><a href="tel:+38659012765">+386 59 012 765</a><a href="mailto:info@nara.si">info@nara.si</a></div>`;
document.body.append(mnav);
hdr.querySelector('.burger').addEventListener('click', () => mnav.classList.add('open'));
mnav.querySelector('.x').addEventListener('click', () => mnav.classList.remove('open'));

const ftr = document.createElement('footer');
ftr.className = 'ftr';
ftr.innerHTML = `<div class="wrap">
  <div class="ftr-cta rv"><h2 class="h1">Opremimo vaš naslednji lokal.</h2>
    <div class="hero-actions"><a class="btn blue-b" href="kontakt.html#povprasevanje">Pošljite povpraševanje ${ARR}</a><a class="btn ghost" href="tel:+38659012765">+386 59 012 765</a></div></div>
  <div class="ftr-grid">
    <div><a class="logo" href="index.html"><img src="assets/brand/nara-logo.png" alt="Nara hladilna tehnika"></a><p class="muted" style="margin-top:22px;max-width:30ch">Hladilna in gostinska oprema, projektiranje, servis in rezervni deli.</p></div>
    <div><h4>Podjetje</h4>NARA HLADILNA TEHNIKA d.o.o.<br>Kapucinski trg 8<br>4220 Škofja Loka<br>Slovenija</div>
    <div><h4>Kontakt</h4><a href="tel:+38659012765">+386 59 012 765</a><br>faks +386 59 012 764<br><a href="mailto:info@nara.si">info@nara.si</a></div>
    <div><h4>Odpiralni čas</h4>Pon–pet 8:00–16:00<br>Sobota, nedelja in prazniki zaprto<br><br><a href="zaposlitev.html">Zaposlitev</a></div>
  </div>
  <div class="ftr-bottom"><span>© Nara ${new Date().getFullYear()}. Vse pravice pridržane.</span><span><a href="kontakt.html">Splošni pogoji poslovanja</a> · <a href="kontakt.html">Varstvo osebnih podatkov</a> · <a href="https://www.facebook.com/" target="_blank" rel="noopener">Facebook</a> · <a href="https://www.instagram.com/" target="_blank" rel="noopener">Instagram</a></span></div>
</div>${flakeSVG('ftr-flake')}`;
document.body.append(ftr);

// header hide/show on scroll
let lastY = 0;
const onScroll = y => {
  hdr.classList.toggle('scrolled', y > 40);
  if (!mega.classList.contains('open')) hdr.classList.toggle('hide', y > 500 && y > lastY + 2);
  if (y < lastY - 2) hdr.classList.remove('hide');
  lastY = y;
};

// ---------- motion ----------
let lenis;
if (!reduced && window.Lenis) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  window.lenis = lenis;
  lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  if (window.gsap) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
} else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

window.NaraMotion = () => {
  if (reduced || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray('.rv').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  gsap.utils.toArray('.bgflake,.ftr-flake').forEach(el => gsap.to(el, { rotate: 60, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
};

window.NaraUtil = { P, C, IMG, tops, kidsOf, branch, inCat, topOf, catById, catBySlug, prodBySlug, prodByImg, catImg, esc, ARR, ARR_UR, PLUS, CHECK, Q, reduced };
})();
