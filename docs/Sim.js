// ============================================================
// Sim.js — FULL REPLACEMENT (SCZN3 DEMO ENGINE)
// - Clean tap flow: Aim → Shots → Results
// - Demo mode support (?mode=demo)
// - Stable state machine
// - Mobile-safe interaction
// ============================================================

(() => {
  const qs = new URLSearchParams(window.location.search);
  const DEMO_MODE = qs.get("mode") === "demo";

  // Elements
  const elTarget = document.getElementById("targetCanvas");
  const elInstructionTop = document.getElementById("instructionTop");
  const elInstructionBottom = document.getElementById("instructionBottom");
  const elShowBtn = document.getElementById("showResultsBtn");

  if (!elTarget) {
    console.error("Target canvas not found.");
    return;
  }

  const ctx = elTarget.getContext("2d");

  // State
  let state = "aim"; // "aim" → "shots" → "done"
  let aimPoint = null;
  let shots = [];

  // Config
  const MAX_SHOTS = 5;

  // Resize canvas for crisp rendering
  function resizeCanvas() {
    const rect = elTarget.getBoundingClientRect();
    elTarget.width = rect.width * devicePixelRatio;
    elTarget.height = rect.height * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    draw();
  }

  window.addEventListener("resize", resizeCanvas);

  // Helpers
  function getPos(evt) {
    const rect = elTarget.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    return { x, y };
  }

  function draw() {
    ctx.clearRect(0, 0, elTarget.width, elTarget.height);

    // Draw aim point
    if (aimPoint) {
      ctx.beginPath();
      ctx.arc(aimPoint.x, aimPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#00ffcc";
      ctx.fill();
    }

    // Draw shots
    shots.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ff3b3b";
      ctx.fill();
    });
  }

  function updateInstructions() {
    if (!elInstructionTop || !elInstructionBottom) return;

    if (state === "aim") {
      elInstructionTop.textContent = "TAP AIM POINT";
      elInstructionBottom.textContent = "Tap Bullet Holes";
    }

    if (state === "shots") {
      elInstructionTop.textContent = "TAP BULLET HOLES";
      elInstructionBottom.textContent = "Tap Aim Point";
    }
  }

  function showResultsReady() {
    if (!elShowBtn) return;
    elShowBtn.style.display = "block";
  }

  function handleTap(evt) {
    const pos = getPos(evt);

    if (state === "aim") {
      aimPoint = pos;
      state = "shots";
      updateInstructions();
      draw();
      return;
    }

    if (state === "shots") {
      if (shots.length >= MAX_SHOTS) return;

      shots.push(pos);
      draw();

      if (shots.length >= 1) {
        showResultsReady();
      }
    }
  }

  function computePOIB() {
    if (!shots.length) return null;

    let sumX = 0;
    let sumY = 0;

    shots.forEach((s) => {
      sumX += s.x;
      sumY += s.y;
    });

    return {
      x: sumX / shots.length,
      y: sumY / shots.length,
    };
  }

  function showResults() {
    const poib = computePOIB();
    if (!poib || !aimPoint) return;

    // Visual POIB marker
    ctx.beginPath();
    ctx.arc(poib.x, poib.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#00aaff";
    ctx.fill();

    state = "done";

    // Simple directional logic (placeholder for full engine)
    const dx = aimPoint.x - poib.x;
    const dy = aimPoint.y - poib.y;

    const windage = dx > 0 ? "RIGHT" : "LEFT";
    const elevation = dy > 0 ? "UP" : "DOWN";

    console.log("RESULTS:");
    console.log("Windage:", windage);
    console.log("Elevation:", elevation);

    // You can later route this into SEC
  }

  function resetAll() {
    state = "aim";
    aimPoint = null;
    shots = [];
    updateInstructions();
    draw();

    if (elShowBtn) elShowBtn.style.display = "none";
  }

  function undoLast() {
    if (state === "shots" && shots.length > 0) {
      shots.pop();
      draw();
    }
  }

  // Events
  elTarget.addEventListener("click", handleTap);

  if (elShowBtn) {
    elShowBtn.addEventListener("click", showResults);
    elShowBtn.style.display = "none";
  }

  const elReset = document.getElementById("resetBtn");
  const elUndo = document.getElementById("undoBtn");

  if (elReset) elReset.addEventListener("click", resetAll);
  if (elUndo) elUndo.addEventListener("click", undoLast);

  // Init
  resizeCanvas();
  updateInstructions();
})();