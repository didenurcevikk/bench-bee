/* Bench Bee: photo pre-check.
   Takes a photo of a blot, lets you draw a box around the lanes, then measures a few things
   in the browser (nothing is uploaded) and suggests which example pictures match. */

const photo = { img: null, rect: null, thumb: null, findings: [] };

function renderPhotoBox() {
  const box = $("#photoBox");
  if (!photo.img && !photo.thumb) {
    box.innerHTML = `
      <div class="pb-empty">
        <div class="pb-text">
          <strong>Got a photo of your blot?</strong>
          <span>I'll check it for saturation, background and weak signal, then suggest which pictures match. The photo stays on your device.</span>
        </div>
        <div class="pb-buttons">
          <label class="btn save" for="camInput">Take photo</label>
          <label class="btn ghost" for="fileInput">Choose photo</label>
        </div>
        <input type="file" id="camInput" accept="image/*" capture="environment" hidden>
        <input type="file" id="fileInput" accept="image/*" hidden>
      </div>`;
    ["#camInput", "#fileInput"].forEach(id => $(id).addEventListener("change", e => loadPhoto(e.target.files[0])));
    return;
  }
  if (!photo.img) { // a photo restored from a saved troubleshoot
    box.innerHTML = `<div class="pb-saved"><img src="${photo.thumb}" alt="Your blot photo"><div class="pb-text"><strong>Your photo</strong><span>Saved with this troubleshoot.</span>
      <button class="linkbtn" type="button" id="pbRemove">Remove photo</button></div></div>`;
    $("#pbRemove").addEventListener("click", clearPhoto);
    return;
  }
  box.innerHTML = `
    <div class="pb-work">
      <p class="pb-hint"><b>Drag a box around the lanes.</b> Leave the ladder out if you can, so its colours aren't mistaken for saturation.</p>
      <canvas id="pbCanvas" aria-label="Your blot photo. Drag to select the lanes."></canvas>
      <div class="actions">
        <button class="btn save" type="button" id="pbAnalyse">Check my blot</button>
        <button class="btn ghost" type="button" id="pbRemove">Remove photo</button>
      </div>
      <div id="pbResult"></div>
    </div>`;
  $("#pbRemove").addEventListener("click", clearPhoto);
  $("#pbAnalyse").addEventListener("click", runAnalysis);
  setupCrop();
  if (photo.findings.length) showFindings();
}

function loadPhoto(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      photo.img = img; photo.findings = []; photo.thumb = null;
      const mx = img.naturalWidth * 0.05, my = img.naturalHeight * 0.05;
      photo.rect = { x: mx, y: my, w: img.naturalWidth - 2 * mx, h: img.naturalHeight - 2 * my };
      renderPhotoBox();
    };
    img.onerror = () => { $("#photoBox").insertAdjacentHTML("beforeend", `<p class="pb-error">That file couldn't be opened as an image. Try a JPEG or PNG.</p>`); };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function clearPhoto() {
  Object.assign(photo, { img: null, rect: null, thumb: null, findings: [] });
  if (typeof state !== "undefined") state.photo = null;
  if ($("#photoBox")) renderPhotoBox();
}

function showSavedPhoto(dataUrl) {
  Object.assign(photo, { img: null, rect: null, thumb: dataUrl || null, findings: [] });
  renderPhotoBox();
}

/* ---------- crop box ---------- */
function setupCrop() {
  const cv = $("#pbCanvas"), img = photo.img;
  const W = Math.min(900, img.naturalWidth), k = W / img.naturalWidth;
  cv.width = W; cv.height = Math.round(img.naturalHeight * k);
  const ctx = cv.getContext("2d");
  const draw = () => {
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    const r = photo.rect;
    ctx.fillStyle = "rgba(20,20,24,.55)";
    ctx.fillRect(0, 0, cv.width, r.y * k);
    ctx.fillRect(0, (r.y + r.h) * k, cv.width, cv.height);
    ctx.fillRect(0, r.y * k, r.x * k, r.h * k);
    ctx.fillRect((r.x + r.w) * k, r.y * k, cv.width, r.h * k);
    ctx.strokeStyle = "#F2B400"; ctx.lineWidth = Math.max(2, W / 250);
    ctx.strokeRect(r.x * k, r.y * k, r.w * k, r.h * k);
  };
  draw();
  const toImg = e => {
    const b = cv.getBoundingClientRect();
    return { x: Math.max(0, Math.min(img.naturalWidth, (e.clientX - b.left) / b.width * img.naturalWidth)),
             y: Math.max(0, Math.min(img.naturalHeight, (e.clientY - b.top) / b.height * img.naturalHeight)) };
  };
  let start = null;
  cv.addEventListener("pointerdown", e => { start = toImg(e); cv.setPointerCapture?.(e.pointerId); e.preventDefault(); });
  cv.addEventListener("pointermove", e => {
    if (!start) return;
    const p = toImg(e);
    const w = Math.abs(p.x - start.x), h = Math.abs(p.y - start.y);
    if (w < 10 || h < 10) return;
    photo.rect = { x: Math.min(p.x, start.x), y: Math.min(p.y, start.y), w, h };
    draw();
  });
  const end = () => { start = null; };
  cv.addEventListener("pointerup", end);
  cv.addEventListener("pointercancel", end);
}

/* ---------- measurements ---------- */
function measure(img, rect) {
  const MAXW = 360, s = Math.min(1, MAXW / rect.w);
  const w = Math.max(20, Math.round(rect.w * s)), h = Math.max(20, Math.round(rect.h * s));
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data, n = w * h;
  const L = new Uint8Array(n), isCol = new Uint8Array(n);
  let coloured = 0;
  for (let i = 0; i < n; i++) {
    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
    L[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx - mn > 90 && r > 170 && g < 120) { coloured++; isCol[i] = 1; } // magenta or red, the usual imager saturation colours
  }
  const pct = (arr, p) => { const hist = new Uint32Array(256); arr.forEach(v => hist[v]++); let acc = 0; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= p * arr.length) return v; } return 255; };
  let median = pct(L, 0.5), inverted = false;
  if (median < 90) { for (let i = 0; i < n; i++) L[i] = 255 - L[i]; inverted = true; median = pct(L, 0.5); } // white bands on black: flip it
  // Leave saturation-coloured pixels out, and take the 90th percentile as the background,
  // since bands can cover a good part of a cropped strip.
  const grey = L.filter((_, i) => !isCol[i]);
  const bg = pct(grey.length ? grey : L, 0.9);
  const darkest = pct(grey.length ? grey : L, 0.01);
  let clipped = 0; for (let i = 0; i < n; i++) if (L[i] <= 4) clipped++;

  // background evenness: medians of a 4 x 4 grid of blocks
  const meds = [];
  for (let by = 0; by < 4; by++) for (let bx = 0; bx < 4; bx++) {
    const vals = [];
    for (let y = Math.floor(by * h / 4); y < Math.floor((by + 1) * h / 4); y++)
      for (let x = Math.floor(bx * w / 4); x < Math.floor((bx + 1) * w / 4); x++) vals.push(L[y * w + x]);
    meds.push(pct(vals, 0.9));
  }
  const spread = Math.max(...meds) - Math.min(...meds);

  // specks: small isolated dark spots
  const thr = bg - 55, seen = new Uint8Array(n), maxArea = Math.max(3, n * 0.0015);
  let specks = 0;
  for (let i = 0; i < n; i++) {
    if (seen[i] || L[i] > thr) continue;
    let area = 0; const stack = [i]; seen[i] = 1;
    while (stack.length) {
      const j = stack.pop(); area++;
      const x = j % w, y = (j / w) | 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
        const k = ny * w + nx;
        if (!seen[k] && L[k] <= thr) { seen[k] = 1; stack.push(k); }
      });
    }
    if (area >= 2 && area <= maxArea) specks++;
  }
  return { median: bg, contrast: bg - darkest, colouredPct: coloured / n * 100, clippedPct: clipped / n * 100, spread, specks, inverted };
}

function findingsFrom(m) {
  const f = [];
  const grey = Math.round((255 - m.median) / 255 * 100);
  if (m.colouredPct > 0.15) f.push({ id: "saturated", text: `${m.colouredPct.toFixed(1)}% of the area is pink or red, the colour imagers use for saturated pixels. If that isn't your ladder, the signal is saturated.` });
  else if (m.clippedPct > 0.4 && m.contrast > 120) f.push({ id: "saturated", text: `Some bands are completely black (${m.clippedPct.toFixed(1)}% of the area), which usually means the camera hit its limit.` });
  if (m.median < 165) f.push({ id: "background", text: `The background is about ${grey}% grey. A clean membrane is usually close to white.` });
  if (m.spread > 55) f.push({ id: "patches", maybe: true, text: `The background brightness varies across the membrane (${Math.round(m.spread / 255 * 100)}% between areas). That can mean patches or uneven incubation, but uneven lighting in the photo does the same, so check by eye.` });
  if (m.contrast < 30) f.push({ id: "none", text: "There's almost no signal darker than the background." });
  else if (m.contrast < 70) f.push({ id: "weak", text: "The strongest signal is only a little darker than the background." });
  if (m.specks > 30) f.push({ id: "speckle", maybe: true, text: `Found ${m.specks} small dark spots. They could be specks on the membrane, or texture from the plastic cover or the screen in the photo.` });
  return f;
}

function runAnalysis() {
  const m = measure(photo.img, photo.rect);
  photo.findings = findingsFrom(m);
  photo.metrics = m;
  // keep a small copy of the selected area for saving
  const tw = Math.min(480, photo.rect.w), tk = tw / photo.rect.w;
  const tc = document.createElement("canvas"); tc.width = Math.round(tw); tc.height = Math.round(photo.rect.h * tk);
  tc.getContext("2d").drawImage(photo.img, photo.rect.x, photo.rect.y, photo.rect.w, photo.rect.h, 0, 0, tc.width, tc.height);
  photo.thumb = tc.toDataURL("image/jpeg", 0.75);
  state.photo = photo.thumb;
  showFindings();
}

function showFindings() {
  const f = photo.findings, m = photo.metrics;
  const name = id => (SYMPTOMS.find(s => s.id === id) || {}).name;
  $("#pbResult").innerHTML = `
    <div class="pb-findings">
      <span class="label">What I measured</span>
      ${m && m.inverted ? `<p class="pb-note">Your image has light bands on a dark background, so I flipped it before measuring.</p>` : ""}
      ${f.length ? `<ul>${f.map((x, i) => `<li><label><input type="checkbox" id="pbf-${i}" data-id="${x.id}" ${x.maybe ? "" : "checked"}> <b>${name(x.id)}</b>${x.maybe ? ` <em class="maybe">maybe</em>` : ""}<span>${x.text}</span></label></li>`).join("")}</ul>
        <div class="actions"><button class="btn save" type="button" id="pbApply">Select these pictures</button></div>`
      : `<p>Nothing stood out: the background is light, there's clear signal and no saturation colour. Pick the pictures yourself if something still looks wrong, like extra bands or smears, which I can't judge from a photo.</p>`}
      <p class="pb-note">These are measurements, not a diagnosis. I can't judge band size, extra bands or smears from a photo, so check those yourself.</p>
    </div>`;
  const ap = $("#pbApply");
  if (ap) ap.addEventListener("click", () => {
    document.querySelectorAll(".pb-findings input:checked").forEach(c => { if (!state.sel.includes(c.dataset.id)) toggle(c.dataset.id); });
    const first = SYMPTOMS.findIndex(s => s.id === state.sel[0]);
    if (first >= 0) setSlide(first);
    $("#benchSec").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
}

renderPhotoBox();
