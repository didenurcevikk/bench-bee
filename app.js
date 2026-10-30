/* Bench Bee: drawing the blots, ranking causes, rendering the page. */
const MEM = "#E9E7E1", MEM2 = "#D9D7D0", BAND = "#16161A", LAD1 = "#3D5BD9", LAD2 = "#E0661A", SAT = "#FF2BD6";

/* ---------- blot drawing ---------- */
let uid = 0;
function rng(seed) { let s = seed % 2147483647 || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function blot(kind, label) {
  const id = "b" + (uid++), W = 200, H = 130, Y = 56;
  const lanes = [0, 1, 2, 3, 4, 5].map(i => 44 + i * 26);
  const ops = [0.9, 0.84, 0.93, 0.8, 0.88, 0.85];
  let seed = 7; for (const ch of kind) seed = seed * 31 + ch.charCodeAt(0);
  const r = rng(seed);
  const band = (x, y, op = 0.9, w = 18, h = 5, extra = "") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${BAND}" opacity="${op}" filter="url(#${id})" ${extra}/>`;
  let s = `<svg class="blot" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">
  <defs>
    <filter id="${id}" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="1.1"/></filter>
    <filter id="${id}s" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3"/></filter>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BAND}" stop-opacity=".7"/><stop offset="1" stop-color="${BAND}" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${MEM}"/><stop offset="1" stop-color="${MEM2}"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${id}m)"/>`;
  const ladder = () => [14, 26, 40, 58, 80, 104].forEach((y, i) => {
    s += `<rect x="12" y="${y}" width="18" height="2.6" rx="1" fill="${i === 3 ? LAD2 : LAD1}" opacity=".8"/>`;
  });
  if (kind !== "lc") ladder();
  switch (kind) {
    case "none": break;
    case "background":
      s += `<rect x="-10" y="-10" width="${W + 20}" height="${H + 20}" fill="${BAND}" opacity=".36" filter="url(#${id}s)"/>`;
      for (let i = 0; i < 6; i++) s += `<ellipse cx="${40 + r() * 150}" cy="${r() * H}" rx="${20 + r() * 25}" ry="${12 + r() * 18}" fill="${BAND}" opacity="${0.08 + r() * 0.12}" filter="url(#${id}s)"/>`;
      lanes.forEach(x => s += band(x, Y, 0.95));
      break;
    case "extra":
      lanes.forEach((x, i) => {
        s += band(x, Y, ops[i]);
        s += band(x, Y + 24, 0.4 + 0.15 * r(), 18, 4);
        s += band(x, Y + 42, 0.2 + 0.2 * r(), 18, 4);
        if (i % 2 === 0) s += band(x, Y - 20, 0.3 + 0.1 * r(), 18, 4);
      });
      break;
    case "weak":
      lanes.forEach(x => s += band(x, Y, 0.12 + 0.06 * r()));
      break;
    case "saturated":
      lanes.forEach((x, i) => {
        s += band(x - 1, Y - 3, 0.97, 20, 11);
        const n = 2 + Math.floor(r() * 3);
        for (let k = 0; k < n; k++) {
          const w = 4 + r() * 10, h = 2 + r() * 5;
          s += `<rect x="${(x + r() * (18 - w)).toFixed(1)}" y="${(Y - 2 + r() * (9 - h)).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${SAT}"/>`;
        }
        if (i > 2) s += `<rect x="${x + 5}" y="${Y + 1}" width="8" height="3" rx="1" fill="${MEM}" opacity=".85"/>`;
      });
      break;
    case "wrongsize":
      s += `<line x1="40" y1="${Y + 2.5}" x2="196" y2="${Y + 2.5}" stroke="#8A8A90" stroke-width="0.8" stroke-dasharray="3 3"/>`;
      s += `<text x="194" y="${Y + 11}" text-anchor="end" font-size="7" font-family="IBM Plex Mono, monospace" fill="#5C5C62">predicted</text>`;
      lanes.forEach((x, i) => s += band(x, Y - 24, ops[i]));
      break;
    case "smear":
      lanes.forEach((x, i) => {
        if (i % 3 === 2) { s += `<rect x="${x}" y="${Y - 6}" width="18" height="16" rx="5" fill="${BAND}" opacity=".55" filter="url(#${id}s)"/>`; return; }
        s += `<rect x="${x}" y="${Y}" width="18" height="${44 + r() * 20}" rx="3" fill="url(#${id}g)" filter="url(#${id})"/>`;
        s += band(x, Y - 2, ops[i] * 0.9, 18, 7);
      });
      break;
    case "smile":
      lanes.forEach((x, i) => {
        const d = i - 2.5, y = Y - 0.9 * d * d + 3;
        const ang = Math.atan(-2 * 0.9 * d / 26) * 180 / Math.PI;
        const w = i === 4 ? 22 : 18, xx = i === 4 ? x - 2 : x;
        s += band(xx, y, [0.95, 0.5, 0.9, 0.3, 0.85, 0.65][i], w, 5, `transform="rotate(${ang.toFixed(1)} ${x + 9} ${y + 2.5})"`);
      });
      break;
    case "ghost":
      lanes.forEach((x, i) => {
        s += band(x - 1, Y - 2, 0.95, 20, 10);
        s += `<rect x="${x + 3}" y="${Y + 0.5}" width="12" height="5" rx="2" fill="${MEM}" opacity="${i % 2 ? 0.95 : 0.8}" filter="url(#${id})"/>`;
      });
      break;
    case "speckle":
      lanes.forEach((x, i) => s += band(x, Y, ops[i]));
      for (let i = 0; i < 46; i++) s += `<circle cx="${(r() * W).toFixed(1)}" cy="${(r() * H).toFixed(1)}" r="${(0.5 + r() * 1.4).toFixed(2)}" fill="${BAND}" opacity="${(0.35 + r() * 0.55).toFixed(2)}"/>`;
      break;
    case "patches":
      s += `<rect x="-10" y="-10" width="${W + 20}" height="${H + 20}" fill="${BAND}" opacity=".12" filter="url(#${id}s)"/>`;
      lanes.forEach((x, i) => s += band(x, Y, ops[i]));
      s += `<circle cx="77" cy="${Y + 2}" r="9" fill="${MEM}" opacity=".95" filter="url(#${id})"/>`;
      s += `<circle cx="150" cy="${Y + 30}" r="6" fill="${MEM}" opacity=".9" filter="url(#${id})"/>`;
      s += `<path d="M112 20 C 150 30, 120 70, 165 ${Y + 4} S 190 110, 150 118" fill="none" stroke="${MEM}" stroke-width="7" stroke-linecap="round" opacity=".9" filter="url(#${id})"/>`;
      break;
    case "lc": {
      s += `<rect x="12" y="34" width="18" height="2.6" rx="1" fill="${LAD1}" opacity=".8"/><rect x="12" y="98" width="18" height="2.6" rx="1" fill="${LAD2}" opacity=".8"/>`;
      lanes.forEach(x => s += band(x, 34, 0.85));
      s += `<line x1="8" y1="70" x2="196" y2="70" stroke="#BDBBB4" stroke-width="1"/>`;
      [0.95, 0.4, 0.8, 0.25, 0.9, 0.6].forEach((o, i) => s += band(lanes[i], 96, o, 18, 6));
      s += `<text x="194" y="122" text-anchor="end" font-size="7" font-family="IBM Plex Mono, monospace" fill="#5C5C62">loading control</text>`;
      break;
    }
    default: lanes.forEach((x, i) => s += band(x, Y, ops[i]));
  }
  return s + "</svg>";
}

/* ---------- state ---------- */
const state = { sel: [], answers: {}, order: [], skipped: new Set(), forceNext: null, keepGoing: false, showAll: false, slide: 0 };
const $ = s => document.querySelector(s);
const STRONG = 6; // weight of a confirming answer

/* ---------- blot picker (grid on desktop, carousel on phones) ---------- */
function renderGrid() {
  $("#grid").innerHTML = SYMPTOMS.map((sy, i) => `
    <button class="sym${i === state.slide ? " is-current" : ""}" type="button" id="sym-${sy.id}" data-id="${sy.id}" aria-pressed="false">
      <span class="tick" aria-hidden="true">✓</span>
      ${blot(sy.id, "Example blot: " + sy.name)}
      <span class="txt"><strong>${sy.name}</strong><span>${sy.hint}</span></span>
      <span class="pickhint" aria-hidden="true"></span>
    </button>`).join("");
  $("#grid").insertAdjacentHTML("afterend", `
    <div class="carnav" id="carnav">
      <button class="cbtn" type="button" id="prev" aria-label="Previous picture">←</button>
      <span class="ccount" id="ccount" aria-live="polite"></span>
      <button class="cbtn" type="button" id="next" aria-label="Next picture">→</button>
    </div>
    <div class="carsel" id="carsel"></div>`);
  let dragged = false;
  document.querySelectorAll(".sym").forEach(b => b.addEventListener("click", () => { if (!dragged) toggle(b.dataset.id); }));
  $("#prev").addEventListener("click", () => slide(-1));
  $("#next").addEventListener("click", () => slide(1));

  // Swipe like a photo gallery: the current card and its neighbours move with your finger.
  const g = $("#grid");
  const GAP = 16;
  let x0 = null, y0 = 0, lastX = 0, t0 = 0, horizontal = false, trio = null, busy = false;
  const carousel = () => getComputedStyle(g).display === "block";
  const cards = () => [...g.querySelectorAll(".sym")];
  const neighbours = () => {
    const all = cards(), n = all.length;
    return { cur: all[state.slide], prev: all[(state.slide - 1 + n) % n], next: all[(state.slide + 1) % n] };
  };
  const place = (t, dx, ease) => {
    const tr = ease ? "transform .3s cubic-bezier(.2,.8,.2,1)" : "none";
    t.cur.style.transition = t.prev.style.transition = t.next.style.transition = tr;
    t.cur.style.transform = `translateX(${dx}px)`;
    t.prev.style.transform = `translateX(calc(-100% - ${GAP}px + ${dx}px))`;
    t.next.style.transform = `translateX(calc(100% + ${GAP}px + ${dx}px))`;
  };
  const cleanup = t => [t.cur, t.prev, t.next].forEach(el => { el.style.cssText = ""; el.classList.remove("peek"); });
  function animateTo(dir, t = neighbours(), fromDx = 0) {
    if (busy) return; busy = true;
    if (t.prev === t.next) t.prev = t.cur; // guard for very short lists
    t.prev.classList.add("peek"); t.next.classList.add("peek");
    place(t, fromDx, false);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const w = t.cur.offsetWidth + GAP;
      place(t, dir === 1 ? -w : dir === -1 ? w : 0, true);
      setTimeout(() => {
        cleanup(t); busy = false;
        if (dir) setSlide((state.slide + dir + SYMPTOMS.length) % SYMPTOMS.length);
      }, 300);
    }));
  }
  slide = dir => carousel() ? animateTo(dir) : setSlide((state.slide + dir + SYMPTOMS.length) % SYMPTOMS.length);

  g.addEventListener("pointerdown", e => {
    if (!carousel() || busy) return;
    x0 = lastX = e.clientX; y0 = e.clientY; t0 = performance.now(); horizontal = false; trio = null;
  });
  g.addEventListener("pointermove", e => {
    if (x0 === null) return;
    lastX = e.clientX;
    const dx = lastX - x0, dy = e.clientY - y0;
    if (!horizontal) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { x0 = null; return; } // vertical scroll, leave it alone
      if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      horizontal = true; dragged = true; trio = neighbours();
      trio.prev.classList.add("peek"); trio.next.classList.add("peek");
      g.setPointerCapture?.(e.pointerId);
    }
    place(trio, dx * 0.9, false);
  });
  const release = cancelled => () => {
    if (x0 === null) return;
    const dx = (lastX - x0) * 0.9, speed = Math.abs(lastX - x0) / Math.max(1, performance.now() - t0);
    x0 = null;
    if (!horizontal || !trio) return;
    const w = trio.cur.offsetWidth;
    const go = !cancelled && (Math.abs(dx) > w * 0.3 || (speed > 0.6 && Math.abs(dx) > 40));
    const t = trio; trio = null;
    animateTo(go ? (dx < 0 ? 1 : -1) : 0, t, dx);
    setTimeout(() => { dragged = false; }, 350);
  };
  // Once a sideways swipe has started, stop the page from also scrolling up or down.
  g.addEventListener("touchmove", e => { if (horizontal && x0 !== null) e.preventDefault(); }, { passive: false });
  g.addEventListener("pointerup", release(false));
  g.addEventListener("pointercancel", release(true));
  paintCarousel();
}

let slide = dir => setSlide((state.slide + dir + SYMPTOMS.length) % SYMPTOMS.length);
function setSlide(i) {
  state.slide = i; // endless loop: the index wraps in both directions
  document.querySelectorAll(".sym").forEach((b, k) => b.classList.toggle("is-current", k === i));
  paintCarousel();
}

function paintCarousel() {
  $("#ccount").textContent = `${state.slide + 1} / ${SYMPTOMS.length}`;
  const n = state.sel.length;
  $("#carsel").innerHTML = n ? `<span>${n} selected: ${selected().map(s => s.name).join(", ")}</span>
    <button class="btn" type="button" id="tobench">Next: questions ↓</button>` : `<span>Tap the picture to select it. Pick more than one if your blot has several problems.</span>`;
  const tb = $("#tobench");
  if (tb) tb.addEventListener("click", () => $("#benchSec").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
}

function toggle(id) {
  state.sel = state.sel.includes(id) ? state.sel.filter(x => x !== id) : [...state.sel, id];
  state.showAll = false; state.keepGoing = false;
  document.querySelectorAll(".sym").forEach(b => b.setAttribute("aria-pressed", state.sel.includes(b.dataset.id)));
  paintCarousel();
  renderBench();
}

const selected = () => state.sel.map(id => SYMPTOMS.find(s => s.id === id));

/* ---------- question engine ---------- */
// All questions that apply to the selected pictures, context questions first.
function universe() {
  const ids = [...CONTEXT];
  selected().forEach(sy => sy.qs.forEach(q => { if (!ids.includes(q)) ids.push(q); }));
  return ids;
}
// A question is only asked once its "when" condition is met (e.g. ask what changed only if it used to work).
function unlocked(qid) {
  const w = Q[qid].when;
  return !w || Object.entries(w).every(([q, o]) => state.answers[q] === o);
}
function validAnswers() {
  const u = universe();
  return state.order.filter(q => u.includes(q) && unlocked(q) && state.answers[q] !== undefined);
}

function evaluate() {
  const sc = {}, fits = {}, out = {}, yes = {}, trace = {};
  selected().forEach(sy => Object.entries(sy.causes).forEach(([cid, b]) => {
    sc[cid] = (sc[cid] || 0) + b;
    (fits[cid] = fits[cid] || []).push(sy.name);
  }));
  validAnswers().forEach(qid => {
    if (state.answers[qid] < 0) return; // "None of these fit" changes nothing
    const o = Q[qid].opts[state.answers[qid]];
    Object.entries(o.e).forEach(([cid, v]) => {
      if (!(cid in sc)) return;
      (trace[cid] = trace[cid] || []).push({ qid, a: o.l, v });
      if (v === "out") out[cid] = `${o.l} (${Q[qid].q.replace(/\?$/, "").toLowerCase()})`;
      else if (v === "yes") { sc[cid] += STRONG; yes[cid] = true; }
      else sc[cid] += v;
    });
  });
  const live = Object.keys(sc).filter(c => !out[c]).map(cid => ({ id: cid, ...C[cid], score: Math.max(0.2, sc[cid]), fits: fits[cid], trace: trace[cid] || [], confirmed: !!yes[cid] }))
    .sort((a, b) => b.score - a.score);
  const ruled = Object.keys(out).map(cid => ({ id: cid, ...C[cid], reason: out[cid] }));
  const max = live.length ? live[0].score : 1;
  const margin = live.length > 1 ? live[0].score - live[1].score : 99;
  live.forEach((c, i) => {
    c.ratio = c.score / max;
    c.tag = c.confirmed ? ["Confirmed", "top"] : i === 0 ? (margin >= 3 ? ["Strong lead", "top"] : ["Most likely", "top"])
      : c.ratio >= 0.6 ? ["Likely", "mid"] : c.ratio >= 0.35 ? ["Possible", ""] : ["Less likely", ""];
  });
  return { live, ruled };
}

// Pick the question whose answers would move the current leaders the most.
function nextQuestion() {
  const u = universe();
  const open = u.filter(q => state.answers[q] === undefined && !state.skipped.has(q) && unlocked(q));
  if (state.forceNext && open.includes(state.forceNext)) return state.forceNext;
  if (!open.length) return null;
  const { live } = evaluate();
  if (!state.keepGoing && live[0] && live[0].confirmed) return null; // a confirming answer settles it
  const top = live.slice(0, 4).map(c => c.id);
  const mag = v => (v === "out" || v === "yes") ? STRONG : Math.abs(v);
  let best = null, bestV = 0;
  open.forEach(qid => {
    const opts = Q[qid].opts;
    let v = opts.reduce((s, o) => s + top.reduce((t, c) => t + (c in o.e ? mag(o.e[c]) : 0), 0), 0) / opts.length;
    if (CONTEXT.includes(qid) && v > 0) v += 1;
    if (v > bestV) { bestV = v; best = qid; }
  });
  return best;
}

// Clear every selection and answer, and go back to the first picture.
function resetAll() {
  Object.assign(state, { sel: [], answers: {}, order: [], skipped: new Set(), forceNext: null, keepGoing: false, showAll: false, savedId: null, photo: null });
  userOpen.clear();
  if (typeof clearPhoto === "function") clearPhoto();
  document.querySelectorAll(".sym").forEach(b => b.setAttribute("aria-pressed", "false"));
  setSlide(0);
  renderBench();
}

/* ---------- bench: one question at a time + ranked causes ---------- */
function renderBench() {
  if (!state.sel.length) {
    $("#bench").innerHTML = `<div class="empty">Pick the blot pictures that look like yours above. Questions will appear here one at a time, with the likely causes ranked beside them.</div>`;
    return;
  }
  $("#bench").innerHTML = `
    <div class="bench">
      <div class="panel">
        <div><span class="label">Your blot</span><div class="chosen" style="margin-top:6px">${selected().map(s => `<span class="chip">${s.name}</span>`).join("")}</div></div>
        <div id="qcard"></div>
        <div id="history"></div>
      </div>
      <div class="results">
        <ol class="causes" id="causes"></ol>
        <div id="more"></div>
        <div id="ruled"></div>
        <div class="actions">
          <button class="btn save" type="button" id="save">${state.savedId ? "Update saved" : "Save"}</button>
          <button class="btn ghost" type="button" id="copy">Copy for lab notebook</button>
          <button class="btn ghost" type="button" id="reset">Start over</button>
          <span class="toast" id="toast" role="status"></span>
        </div>
        <div id="saveform"></div>
        <div id="copyfall"></div>
      </div>
    </div>`;
  $("#reset").addEventListener("click", () => { resetAll(); $("#s1").scrollIntoView({ behavior: "smooth" }); });
  $("#copy").addEventListener("click", copySummary);
  $("#save").addEventListener("click", openSaveForm);
  renderQuestion(); renderHistory(); renderCauses();
}

const ansLabel = qid => state.answers[qid] < 0 ? "None of these fit" : Q[qid].opts[state.answers[qid]].l;

function answer(qid, oi) {
  state.answers[qid] = oi;
  state.order = state.order.filter(q => q !== qid).concat(qid);
  state.skipped.delete(qid);
  state.forceNext = null;
  update();
}
function update() { renderQuestion(); renderHistory(); renderCauses(); }

function renderQuestion() {
  const qid = nextQuestion();
  const n = validAnswers().length + 1;
  if (!qid) {
    const lead = evaluate().live[0];
    const settled = lead && lead.confirmed && !state.keepGoing;
    $("#qcard").innerHTML = `<div class="qdone"><strong>${settled ? `Your answers point clearly to: ${lead.t.toLowerCase()}.` : "That's everything I need."}</strong>
      <p>${settled ? "Open the top cause for what to check and how to fix it." : "Your ranking is ready."} Change any answer below to see how it shifts.</p>
      ${settled ? `<button class="linkbtn" type="button" id="keepgo">Ask me more to double-check</button>` : ""}
      ${state.skipped.size ? `<button class="linkbtn" type="button" id="unskip">Go back to the ${state.skipped.size} skipped question${state.skipped.size > 1 ? "s" : ""}</button>` : ""}</div>`;
    const us = $("#unskip"); if (us) us.addEventListener("click", () => { state.skipped.clear(); update(); });
    const kg = $("#keepgo"); if (kg) kg.addEventListener("click", () => { state.keepGoing = true; update(); });
    return;
  }
  const q = Q[qid];
  $("#qcard").innerHTML = `
    <div class="qcard">
      <span class="label">Question ${n}</span>
      <p class="qtext">${q.q}</p>
      ${q.tip ? `<p class="qtip">${q.tip}</p>` : ""}
      <div class="answers">${q.opts.map((o, oi) => `<button class="ans" type="button" data-o="${oi}">${o.l}</button>`).join("")}
        <button class="ans nofit" type="button" data-o="-1">None of these fit</button></div>
      <div class="qnav">
        <button class="linkbtn" type="button" id="back" ${state.order.length ? "" : "disabled"}>← Back</button>
        <button class="linkbtn" type="button" id="skip">Skip, I don't know</button>
      </div>
    </div>`;
  document.querySelectorAll(".ans").forEach(b => b.addEventListener("click", () => answer(qid, +b.dataset.o)));
  $("#skip").addEventListener("click", () => { state.skipped.add(qid); state.forceNext = null; update(); });
  $("#back").addEventListener("click", () => {
    const last = state.order.pop(); if (!last) return;
    delete state.answers[last]; state.forceNext = last; update();
  });
}

function renderHistory() {
  const done = validAnswers();
  $("#history").innerHTML = done.length ? `<span class="label">Your answers</span>
    <ol class="hist">${done.map(qid => `<li><span class="hq">${Q[qid].q}</span><span class="ha">${ansLabel(qid)}</span>
      <button class="linkbtn" type="button" data-q="${qid}">Change</button></li>`).join("")}</ol>` : "";
  document.querySelectorAll(".hist .linkbtn").forEach(b => b.addEventListener("click", () => {
    const qid = b.dataset.q;
    delete state.answers[qid]; state.order = state.order.filter(q => q !== qid); state.forceNext = qid; update();
    $("#qcard").scrollIntoView({ block: "nearest" });
  }));
}

function traceLine(t) {
  const cls = t.v === "out" ? "down" : t.v === "yes" ? "up" : t.v > 0 ? "up" : "down";
  const mark = cls === "up" ? "▲" : "▼";
  return `<li class="${cls}"><span aria-hidden="true">${mark}</span> <b>${t.a}</b> <span class="tq">${Q[t.qid].q}</span></li>`;
}

const TAG_MEANING = {
  "Confirmed": "One of your answers is direct evidence for this.",
  "Strong lead": "It's well ahead of every other cause.",
  "Most likely": "It's at the top, but other causes are still close.",
  "Likely": "It scores close to the top cause.",
  "Possible": "It's some way behind the top cause.",
  "Less likely": "It's far behind the top cause."
};
function verdict(c) {
  const ups = c.trace.filter(t => t.v === "yes" || t.v > 0).length;
  const downs = c.trace.filter(t => t.v !== "yes" && t.v <= 0).length;
  const plural = n => n === 1 ? "One of your answers" : `${n} of your answers`;
  let ans = "None of your answers have affected it yet.";
  if (ups && downs) ans = `${plural(ups)} point${ups > 1 ? "" : "s"} towards it and ${downs} away from it.`;
  else if (ups) ans = `${plural(ups)} point${ups > 1 ? "" : "s"} towards it.`;
  else if (downs) ans = `${plural(downs)} point${downs > 1 ? "" : "s"} away from it.`;
  return `<b>${c.tag[0]}:</b> ${TAG_MEANING[c.tag[0]]} It's a known cause of ${c.fits.join(" and ").toLowerCase()}. ${ans}`;
}

const userOpen = new Set(); // causes the user opened themselves
function renderCauses() {
  const { live, ruled } = evaluate();
  const LIMIT = 6;
  const shown = state.showAll ? live : live.slice(0, LIMIT);
  const multi = state.sel.length > 1;
  $("#causes").innerHTML = shown.map((c, i) => `
    <li><details class="cause" data-id="${c.id}" ${i === 0 || userOpen.has(c.id) ? "open" : ""}>
      <summary>
        <span class="rank">${String(i + 1).padStart(2, "0")}</span>
        <h3>${c.t}</h3>
        <span class="pill ${c.tag[1]}">${c.tag[0]}</span>
        <span></span><span class="meter" aria-hidden="true"><i style="width:${Math.round(c.ratio * 100)}%"></i></span>
        ${multi && c.fits.length > 1 ? `<span></span><span class="fits">Explains ${c.fits.join(" + ")}</span>` : ""}
      </summary>
      <div class="body">
        <p class="why">${c.why}</p>
        <div class="check"><span class="label">Check first</span>${c.check}</div>
        <div class="howfix"><span class="label">How to fix</span><ul class="fix">${c.fix.map(f => `<li>${f}</li>`).join("")}</ul></div>
        <details class="whybox"><summary>Why is this ${i === 0 ? "at the top" : "here"}?</summary>
          <p class="verdict">${verdict(c)}</p>
          ${c.trace.length ? `<ul class="trace">${c.trace.map(traceLine).join("")}</ul>` : ""}
        </details>
      </div>
    </details></li>`).join("");
  // The top cause is always open; the others open only when tapped.
  document.querySelectorAll("#causes .cause").forEach((d, i) => d.addEventListener("toggle", () => {
    if (i === 0) return;
    d.open ? userOpen.add(d.dataset.id) : userOpen.delete(d.dataset.id);
  }));
  const rest = live.length - LIMIT;
  $("#more").innerHTML = rest > 0 ? `<button class="linkbtn" type="button" id="morebtn">${state.showAll ? "Show fewer causes" : `Show ${rest} less likely cause${rest > 1 ? "s" : ""}`}</button>` : "";
  const mb = $("#morebtn");
  if (mb) mb.addEventListener("click", () => { state.showAll = !state.showAll; renderCauses(); });
  $("#ruled").innerHTML = ruled.length ? `<details class="ruled"><summary>Ruled out by your answers (${ruled.length})</summary>
    <ul>${ruled.map(c => `<li><s>${c.t}</s><span>${c.reason}</span></li>`).join("")}</ul></details>` : "";
}

function copySummary() {
  const { live, ruled } = evaluate();
  const ans = validAnswers().map(q => `- ${Q[q].q} ${ansLabel(q)}`);
  const txt = [
    `Western blot troubleshooting: ${selected().map(s => s.name).join(", ")}`,
    `Date: ${new Date().toLocaleDateString()}`,
    ans.length ? "Answers:\n" + ans.join("\n") : "Answers: none given",
    "Likely causes:",
    ...live.slice(0, 3).map((c, i) => `${i + 1}. ${c.t} (${c.tag[0].toLowerCase()})\n   Check: ${c.check}`),
    ...(ruled.length ? ["Ruled out: " + ruled.map(c => c.t).join("; ")] : [])
  ].join("\n");
  const done = () => { $("#toast").textContent = "Copied. Paste it into your notebook."; };
  const fallback = () => {
    $("#copyfall").innerHTML = `<textarea class="copybox" id="copybox" readonly></textarea>`;
    const t = $("#copybox"); t.value = txt; t.focus(); t.select();
    $("#toast").textContent = "Select all and copy the text below.";
  };
  try { navigator.clipboard.writeText(txt).then(done, fallback); } catch (e) { fallback(); }
}

renderGrid();
renderBench();

/* ---------- saved troubleshoots (kept in this browser only) ---------- */
const SAVED_KEY = "benchbee-saved";
function loadSaved() { try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch (e) { return []; } }
function storeSaved(list) { try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const fmtDate = iso => new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function openSaveForm() {
  const existing = loadSaved().find(s => s.id === state.savedId);
  const name = existing ? existing.name : `${selected().map(s => s.name).join(" + ")} · ${new Date().toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
  $("#saveform").innerHTML = `
    <form class="saveform" id="saveFormEl">
      <span class="sf-label">Photo <span>(optional, so you remember what the blot looked like)</span></span>
      <div class="sf-photo" id="sfPhoto"></div>
      <label for="saveName">Name</label>
      <input id="saveName" type="text" maxlength="80" value="${esc(name)}">
      <label for="saveNote">Note <span>(optional)</span></label>
      <textarea id="saveNote" rows="3" maxlength="600" placeholder="What did you try, what happened next?">${existing ? esc(existing.note || "") : ""}</textarea>
      <label for="saveFix">What actually fixed it? <span>(fill in later if you don't know yet)</span></label>
      <input id="saveFix" type="text" maxlength="200" placeholder="e.g. Fresh ECL, or diluted the secondary 1:10,000" value="${existing ? esc(existing.fix || "") : ""}">
      <div class="actions"><button class="btn save" type="submit">${existing ? "Update" : "Save"}</button><button class="btn ghost" type="button" id="saveCancel">Cancel</button></div>
    </form>`;
  let formPhoto = state.photo || (existing && existing.photo) || null;
  const paintPhoto = () => {
    $("#sfPhoto").innerHTML = formPhoto
      ? `<img src="${formPhoto}" alt="Photo for this troubleshoot"><div class="sf-actions"><label class="linkbtn" for="sfFile">Replace</label><button class="linkbtn" type="button" id="sfRemove">Remove</button></div>`
      : `<div class="sf-actions"><label class="btn ghost" for="sfCam">Take photo</label><label class="btn ghost" for="sfFile">Choose photo</label></div>`;
    $("#sfPhoto").insertAdjacentHTML("beforeend", `<input type="file" id="sfCam" accept="image/*" capture="environment" hidden><input type="file" id="sfFile" accept="image/*" hidden>`);
    ["#sfCam", "#sfFile"].forEach(id => $(id).addEventListener("change", async e => {
      const f = e.target.files[0]; if (!f) return;
      try { formPhoto = await shrinkPhoto(f); } catch (err) { $("#toast").textContent = "That file couldn't be opened as an image. Try a JPEG or PNG."; }
      paintPhoto();
    }));
    const rm = $("#sfRemove"); if (rm) rm.addEventListener("click", () => { formPhoto = null; paintPhoto(); });
  };
  paintPhoto();
  $("#saveCancel").addEventListener("click", () => { $("#saveform").innerHTML = ""; });
  $("#saveFormEl").addEventListener("submit", e => {
    e.preventDefault();
    const { live } = evaluate();
    const entry = {
      id: state.savedId || String(Date.now()),
      date: new Date().toISOString(),
      name: $("#saveName").value.trim() || name,
      note: $("#saveNote").value.trim(),
      fix: $("#saveFix").value.trim(),
      tech: "western-blot",
      sel: [...state.sel],
      answers: { ...state.answers },
      order: [...state.order],
      top: live[0] ? live[0].t : "",
      photo: formPhoto
    };
    const list = loadSaved().filter(s => s.id !== entry.id);
    list.unshift(entry);
    if (!storeSaved(list)) { $("#toast").textContent = "This browser won't let the app save. Try copying for your notebook instead."; return; }
    state.savedId = entry.id;
    state.photo = formPhoto;
    $("#saveform").innerHTML = "";
    $("#save").textContent = "Update saved";
    $("#toast").textContent = "Saved. Find it under Saved troubleshoots.";
    paintSavedCount();
  });
}

// Shrink a photo to a small JPEG so many saved troubleshoots fit in the browser's storage.
function shrinkPhoto(file, max = 640) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.75));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

function paintSavedCount() {
  const n = loadSaved().length;
  $("#savedCount").textContent = n ? String(n) : "";
}

function renderSaved() {
  const list = loadSaved();
  if (!list.length) {
    $("#savedList").innerHTML = `<div class="empty">Nothing saved yet. When you've worked through a blot, tap Save at the bottom of the results to keep it here.</div>`;
    return;
  }
  $("#savedList").innerHTML = list.map(s => {
    const names = s.sel.map(id => (SYMPTOMS.find(x => x.id === id) || {}).name).filter(Boolean);
    return `<article class="saved-item" data-id="${s.id}">
      ${s.photo ? `<img class="si-photo" src="${s.photo}" alt="Blot photo saved with this troubleshoot">` : ""}
      <div class="si-top"><h3>${esc(s.name)}</h3><span class="si-date">${fmtDate(s.date)}</span></div>
      <div class="chosen">${names.map(n => `<span class="chip">${n}</span>`).join("")}</div>
      <p class="si-lead">${s.top ? `Top cause: <b>${esc(s.top)}</b> · ` : ""}${s.order.length} answer${s.order.length === 1 ? "" : "s"}</p>
      ${s.note ? `<p class="si-note">${esc(s.note)}</p>` : ""}
      ${s.fix ? `<p class="si-fix"><span class="label">Fixed by</span>${esc(s.fix)}</p>` : `<p class="si-open">Not solved yet. Open it and update when you find the fix.</p>`}
      <div class="si-actions"><button class="btn save" type="button" data-act="open">Open</button><button class="linkbtn" type="button" data-act="del">Delete</button></div>
    </article>`;
  }).join("");
  document.querySelectorAll(".saved-item").forEach(el => {
    const id = el.dataset.id;
    el.querySelector('[data-act="open"]').addEventListener("click", () => openSaved(id));
    el.querySelector('[data-act="del"]').addEventListener("click", e => {
      const acts = e.target.parentElement;
      acts.innerHTML = `<span class="si-confirm">Delete this one?</span><button class="btn ghost" type="button" data-act="yes">Delete</button><button class="linkbtn" type="button" data-act="no">Keep</button>`;
      acts.querySelector('[data-act="yes"]').addEventListener("click", () => { storeSaved(loadSaved().filter(s => s.id !== id)); paintSavedCount(); renderSaved(); });
      acts.querySelector('[data-act="no"]').addEventListener("click", renderSaved);
    });
  });
}

let pendingRestore = null;
function openSaved(id) {
  const s = loadSaved().find(x => x.id === id);
  if (!s) return;
  pendingRestore = s; // restored by route() once the app view is showing
  location.hash = "western-blot";
}
function restoreSaved(s) {
  {
    const known = s.sel.filter(sid => SYMPTOMS.some(x => x.id === sid));
    const order = s.order.filter(q => Q[q] && s.answers[q] !== undefined);
    Object.assign(state, { sel: known, answers: Object.fromEntries(order.map(q => [q, s.answers[q]])), order, skipped: new Set(), forceNext: null, keepGoing: false, showAll: false, savedId: s.id, photo: s.photo || null });
    if (typeof showSavedPhoto === "function") showSavedPhoto(s.photo);
    document.querySelectorAll(".sym").forEach(b => b.setAttribute("aria-pressed", state.sel.includes(b.dataset.id)));
    const first = SYMPTOMS.findIndex(x => x.id === known[0]);
    setSlide(first < 0 ? 0 : first);
    renderBench();
    $("#benchSec").scrollIntoView();
  }
}
$("#go-saved").addEventListener("click", () => { location.hash = "saved"; });

/* ---------- picture view on phones: one at a time, or all at once ---------- */
const VIEW_KEY = "benchbee-view";
const ICON_ALL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>';
const ICON_ONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="2"/></svg>';
let view = "one";
try { view = localStorage.getItem(VIEW_KEY) || "one"; } catch (e) {}
function applyView() {
  document.body.classList.toggle("grid-view", view === "all");
  const b = $("#viewbtn");
  b.innerHTML = view === "all" ? `${ICON_ONE}<span>One by one</span>` : `${ICON_ALL}<span>Show all</span>`;
  b.setAttribute("aria-label", view === "all" ? "Show pictures one at a time" : "Show all pictures at once");
}
$("#viewbtn").addEventListener("click", () => {
  view = view === "all" ? "one" : "all";
  try { localStorage.setItem(VIEW_KEY, view); } catch (e) {}
  applyView();
});
applyView();

/* ---------- light / dark switch (follows the phone until you choose) ---------- */
const THEME_KEY = "benchbee-theme";
const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
function currentTheme() { return document.documentElement.dataset.theme || (darkQuery.matches ? "dark" : "light"); }
function paintThemeButtons() {
  const dark = currentTheme() === "dark";
  document.querySelectorAll(".theme-btn").forEach(b => {
    b.innerHTML = dark ? SUN : MOON;
    b.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  });
}
try { const saved = localStorage.getItem(THEME_KEY); if (saved) document.documentElement.dataset.theme = saved; } catch (e) {}
document.querySelectorAll(".theme-btn").forEach(b => b.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  paintThemeButtons();
}));
darkQuery.addEventListener?.("change", paintThemeButtons);
paintThemeButtons();

/* ---------- welcome screen and app view ---------- */
function route() {
  const inApp = location.hash === "#western-blot", inSaved = location.hash === "#saved";
  if (!inApp) resetAll(); // leaving the app view begins a fresh session
  $("#welcome").hidden = inApp || inSaved;
  $(".wrap").hidden = !inApp;
  $("#savedView").hidden = !inSaved;
  if (inSaved) renderSaved();
  paintSavedCount();
  if (inApp && pendingRestore) { const s = pendingRestore; pendingRestore = null; restoreSaved(s); return; }
  window.scrollTo(0, 0);
}
$("#go-wb").addEventListener("click", () => { location.hash = "western-blot"; });
window.addEventListener("hashchange", route);
route();

/* Offline support: register the service worker when the app is served over http(s) */
if (!window.BB_EMBED && "serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).catch(() => {}));
  // When a new version takes over, reload once so you see it right away.
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController && !reloaded) { reloaded = true; location.reload(); }
  });
}
