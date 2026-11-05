(() => {
const U = window.NaraUtil;
const { P, IMG, tops, catImg, inCat, esc, reduced } = U;
const hasG = !!window.gsap && !reduced;
if (hasG) gsap.registerPlugin(ScrollTrigger);

// flakes
document.querySelector('.hero-flake-wrap').outerHTML = flakeSVG('hero-flake');
document.querySelector('.bigflake-wrap').outerHTML = flakeSVG('bigflake');
document.querySelector('.loader .lf').outerHTML = flakeSVG('flake');

// ---------- hero stage ----------
const SHOW = ['n-delight-7-prime-0.jpg', 'nevo-120-0.jpg', 'nsv-133-0.jpg', 'n-ling-37-0.jpg', 'nvts-258-0.jpg'];
const stage = document.getElementById('stage');
const dots = document.getElementById('stageDots');
const items = SHOW.map(f => ({ f, p: U.prodByImg(f) })).filter(x => x.p);
items.forEach((x, i) => {
  const fig = document.createElement('figure');
  fig.innerHTML = `<img src="${IMG + x.f}" alt="${esc(x.p.n)}" ${i ? 'loading="lazy"' : ''}>`;
  stage.insertBefore(fig, stage.querySelector('.stage-cap'));
  dots.insertAdjacentHTML('beforeend', '<i></i>');
});
const figs = [...stage.querySelectorAll('figure')], dotEls = [...dots.children];
const nameEl = document.getElementById('stageName'), catEl = document.getElementById('stageCat');
let cur = -1, timer;
function show(i) {
  const prev = figs[cur];
  cur = i;
  const x = items[i], top = U.topOf(x.p);
  nameEl.textContent = x.p.n; catEl.textContent = top ? top.n : '';
  dotEls.forEach((d, k) => { d.classList.remove('on'); d.classList.toggle('done', k < i); });
  void dots.offsetWidth; dotEls[i].classList.add('on');
  figs.forEach(f => f.classList.remove('on'));
  figs[i].classList.add('on');
  if (hasG) {
    if (prev) gsap.to(prev, { autoAlpha: 0, y: -30, scale: .96, duration: .7, ease: 'power3.in', onComplete: () => gsap.set(prev, { clearProps: 'all' }) });
    gsap.fromTo(figs[i], { autoAlpha: 0, y: 50, scale: 1.04 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: 'expo.out', delay: prev ? .35 : 0 });
    gsap.fromTo([nameEl, catEl], { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'expo.out', delay: .4 });
  }
  clearTimeout(timer);
  timer = setTimeout(() => show((cur + 1) % items.length), 4200);
}
dotEls.forEach((d, k) => d.addEventListener('click', () => show(k)));

// ---------- frost particles ----------
const cv = document.getElementById('frost');
if (cv && !reduced) {
  const ctx = cv.getContext('2d');
  let w, h, dpr, parts = [];
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = cv.offsetWidth; h = cv.offsetHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts = Array.from({ length: Math.round(w * h / 14000) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + .4, s: Math.random() * .35 + .08, d: Math.random() * 6.28, a: Math.random() * .5 + .2 }));
  };
  size(); addEventListener('resize', size);
  let mx = w / 2, my = h / 2, vis = true;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
  new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(cv);
  const tick = () => {
    if (vis) {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y += p.s; p.d += .01; p.x += Math.sin(p.d) * .25;
        const dx = p.x - mx, dy = p.y - my, dist = Math.hypot(dx, dy);
        if (dist < 140) { p.x += dx / dist * 1.2; p.y += dy / dist * 1.2; }
        if (p.y > h + 4) { p.y = -4; p.x = Math.random() * w; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(31,99,181,${p.a * .55})`; ctx.fill();
      }
    }
    requestAnimationFrame(tick);
  };
  tick();
}

// ---------- category rail ----------
const rail = document.getElementById('rail');
const ordered = [63, 58, 25, 29, 34, 85, 69, 76, 96, 121, 114, 132, 108, 105, 54, 90, 104, 103, 102].map(id => U.catById[id]).filter(Boolean);
tops.forEach(t => { if (!ordered.includes(t)) ordered.push(t); });
rail.innerHTML = ordered.map(c => `<a class="cat-card" href="produkti.html?k=${c.s}">
  <div class="t">${esc(c.n)}</div><div class="im"><img src="${IMG + catImg(c)}" alt="" loading="lazy"></div>
  <div class="k"><span>${c.k} ${c.k === 1 ? 'izdelek' : c.k === 2 ? 'izdelka' : c.k < 5 ? 'izdelki' : 'izdelkov'}</span><span class="go">${U.ARR_UR}</span></div></a>`).join('');

// ---------- sectors ----------
const SECT = [
  { t: 'Gostinstvo in catering', h: 'Kuhinja, ki zdrži polno hišo.', p: 'Hladilne omare, saladete, pulti za pizzo, hitri ohlajevalniki, konvektomati in pomivalni stroji za profesionalne kuhinje.', cats: [34, 114, 105, 132] },
  { t: 'Slaščičarne in sladoledarne', h: 'Vitrine, ki prodajajo same.', p: 'Panoramske vitrine za slaščice, sladoledne vitrine in namizne hlajene vitrine, ki izdelke pokažejo v najboljši luči.', cats: [63, 58, 96] },
  { t: 'Trgovine', h: 'Sveže od police do blagajne.', p: 'Stenske vitrine za mleko, meso, sadje in zelenjavo, otočne vitrine in hladilniki pijač za vsako trgovino.', cats: [76, 121, 25] },
  { t: 'Bari in vinoteke', h: 'Pravo vino pri pravi temperaturi.', p: 'Hladilniki za vino, podpultni hladilniki pijač, minibari in ledomati za bare, hotele in vinoteke.', cats: [29, 25, 105] },
  { t: 'Medicina', h: 'Natančno, kadar je to nujno.', p: 'Medicinski hladilniki, zamrzovalniki in zamrzovalne skrinje za laboratorije, ambulante in lekarne.', cats: [85] }
];
const tabs = document.getElementById('tabs'), panel = document.getElementById('sector');
tabs.innerHTML = SECT.map((s, i) => `<button class="tab ${i ? '' : 'on'}" role="tab" data-i="${i}">${s.t}</button>`).join('');
function sector(i) {
  const s = SECT[i];
  const pick = [];
  s.cats.forEach(c => P.filter(p => inCat(p, c) && p.i[0]).slice(0, 6).forEach(p => pick.push(p)));
  const seen = new Set(), list = [];
  for (let k = 0; list.length < 6 && k < 40; k++) { const p = pick[(k * 5) % pick.length]; if (p && !seen.has(p.s)) { seen.add(p.s); list.push(p); } }
  const first = U.catById[s.cats[0]];
  panel.innerHTML = `<div class="sector-intro">${flakeSVG()}<div><h3 class="h3">${s.h}</h3><p style="margin-top:18px">${s.p}</p></div><a class="btn light" href="produkti.html?k=${first.s}">Odpri program ${U.ARR}</a></div>
    <div class="p-grid">${list.map(pcard).join('')}</div>`;
  if (hasG) gsap.from(panel.querySelectorAll('.pcard,.sector-intro'), { opacity: 0, y: 30, duration: .8, stagger: .05, ease: 'expo.out' });
}
tabs.addEventListener('click', e => { const b = e.target.closest('.tab'); if (!b) return; tabs.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t === b)); sector(+b.dataset.i); });
sector(0);

// ---------- services hover image ----------
const fl = document.getElementById('svcFloat');
const svcs = [...document.querySelectorAll('.svc')];
svcs.forEach(s => fl.insertAdjacentHTML('beforeend', `<img src="${s.dataset.img}" alt="">`));
const flImgs = [...fl.children];
if (hasG && matchMedia('(hover:hover)').matches) {
  const xTo = gsap.quickTo(fl, 'x', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(fl, 'y', { duration: .6, ease: 'power3' });
  document.getElementById('svcList').addEventListener('pointermove', e => { xTo(e.clientX - 150); yTo(e.clientY - 150); });
  svcs.forEach((s, i) => {
    s.addEventListener('pointerenter', () => { flImgs.forEach((im, k) => im.classList.toggle('on', k === i)); gsap.to(fl, { opacity: 1, scale: 1, duration: .5, ease: 'expo.out' }); });
  });
  document.getElementById('svcList').addEventListener('pointerleave', () => gsap.to(fl, { opacity: 0, scale: .6, duration: .4 }));
}

// ---------- counters ----------
function counters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const n = +el.dataset.count;
    if (!hasG) { el.textContent = n; return; }
    const o = { v: 0 };
    gsap.to(o, { v: n, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' }, onUpdate: () => el.textContent = Math.round(o.v) });
  });
}

// ---------- intro + scroll motion ----------
const title = document.getElementById('heroTitle');
title.innerHTML = title.textContent.split(' ').map(w => `<span class="w"><span>${w}</span></span>`).join(' ');

const st = document.getElementById('statement');
st.innerHTML = st.textContent.split(' ').map(w => `<span class="word${/hladilne|opreme|profesionalce|strokovnjakov/.test(w) ? ' b' : ''}">${w}</span>`).join(' ');

function start() {
  show(0);
  counters();
  if (!hasG) { document.querySelectorAll('.statement .word').forEach(w => w.classList.add('lit')); document.querySelectorAll('.step').forEach(s => s.classList.add('on')); document.getElementById('planImg').style.clipPath = 'none'; return; }
  NaraMotion();
  gsap.from('.hero h1 .w>span', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: .07 });
  gsap.from('.hero .lead,.hero-actions,.hero-foot', { opacity: 0, y: 30, duration: 1.2, ease: 'expo.out', delay: .35, stagger: .08 });
  gsap.from('.hero-flake', { rotate: -40, scale: .85, opacity: 0, duration: 2.4, ease: 'expo.out' });
  gsap.to('.hero-flake', { rotate: 50, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.to('.stage', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // statement words light up
  const words = [...st.querySelectorAll('.word')];
  ScrollTrigger.create({ trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: true, onUpdate: s => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => w.classList.toggle('lit', i < n)); } });

  // horizontal rail
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const dist = () => rail.scrollWidth - rail.parentElement.clientWidth;
    gsap.to(rail, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#rail-sec', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: s => gsap.set('#railBar', { scaleX: s.progress }) } });
  });
  mm.add('(max-width: 900px)', () => {
    rail.parentElement.style.overflowX = 'auto';
    rail.parentElement.addEventListener('scroll', e => { const t = e.target; gsap.set('#railBar', { scaleX: t.scrollLeft / (t.scrollWidth - t.clientWidth) }); });
  });

  gsap.from('.svc', { opacity: 0, y: 40, duration: 1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '#svcList', start: 'top 80%' } });
  gsap.to('.bigflake', { rotate: 70, ease: 'none', scrollTrigger: { trigger: '.services', start: 'top bottom', end: 'bottom top', scrub: 1 } });

  // plan drawing: scan reveal + steps
  const tl = gsap.timeline({ scrollTrigger: { trigger: '#plan', start: 'top 70%', end: 'center 45%', scrub: 1 } });
  tl.to('#planImg', { clipPath: 'inset(0 0 0% 0)', ease: 'none' }, 0).fromTo('#planScan', { top: '8%' }, { top: '92%', ease: 'none' }, 0).to('#planScan', { opacity: 0, duration: .05 });
  document.querySelectorAll('.step').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 72%', onEnter: () => s.classList.add('on'), onLeaveBack: () => s.classList.remove('on') }));

  gsap.from('.big36', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.big36', start: 'top 90%' } });
  gsap.from('.rent-card.a .im', { y: 80, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.rent-card.a', start: 'top 85%' } });
}

// ---------- loader ----------
const loader = document.querySelector('.loader');
if (!hasG) { loader.remove(); start(); return; }
const paths = loader.querySelectorAll('path');
paths.forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
const seen = sessionStorage.getItem('nara-seen');
const lt = gsap.timeline({ onComplete: () => { loader.remove(); } });
if (seen) { lt.to(loader, { opacity: 0, duration: .4 }); start(); }
else {
  sessionStorage.setItem('nara-seen', 1);
  lt.to(paths, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: .08 })
    .to(loader.querySelector('svg'), { rotate: 45, scale: .6, opacity: 0, duration: .7, ease: 'power3.in' }, '+=.05')
    .to(loader.querySelector('img'), { opacity: 1, duration: .5 }, '-=.25')
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut' }, '+=.35')
    .add(start, '-=.6');
}
})();
