/* ============================================================================
   UW Posse SOAR 2026 Scavenger Hunt — app logic
   Vanilla JS, no dependencies. All content comes from js/config.js
   (window.HUNT_CONFIG). Nothing here needs editing for wording changes.

   Structure:
     1) PURE LOGIC (no DOM) — testable in jsc / any JS engine
     2) STATE (localStorage)
     3) UI (screens, rendering, events) — only runs in a browser
   ========================================================================= */

(function (global) {
  "use strict";

  var CONFIG = global.HUNT_CONFIG;

  /* ==========================================================================
     1) PURE LOGIC — exposed on global.HUNT_LOGIC for engine-level tests
     ======================================================================= */

  /* Forgiving answer normalization:
     lowercase -> strip accents -> non-alphanumerics to spaces -> collapse
     -> drop a leading "the ". */
  function normalizeAnswer(raw) {
    var s = String(raw == null ? "" : raw).toLowerCase();
    try { s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch (e) { /* old engines */ }
    s = s.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
    if (s.indexOf("the ") === 0) s = s.slice(4);
    return s;
  }

  /* True if the typed guess matches any alias (also compares space-stripped,
     so "vanvleck" == "van vleck" without needing every spelling listed). */
  function answerMatches(guess, aliases) {
    var g = normalizeAnswer(guess);
    if (!g) return false;
    var gTight = g.replace(/ /g, "");
    for (var i = 0; i < aliases.length; i++) {
      var a = normalizeAnswer(aliases[i]);
      if (g === a || gTight === a.replace(/ /g, "")) return true;
    }
    return false;
  }

  /* Team visit order: index into CONFIG.stops for a team's Nth leg (0-based). */
  function stopIndexForLeg(startOffset, leg, totalStops) {
    return (startOffset + leg) % totalStops;
  }

  /* mm:ss / h:mm:ss elapsed formatting from milliseconds. */
  function formatElapsed(ms) {
    if (ms < 0) ms = 0;
    var totalSec = Math.floor(ms / 1000);
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    var mm = (m < 10 && h > 0 ? "0" : "") + m;
    var ss = (s < 10 ? "0" : "") + s;
    return h > 0 ? h + ":" + mm + ":" + ss : m + ":" + ss;
  }

  /* Adjusted time: elapsed minus bonus credit (never below zero). */
  function adjustedMs(elapsedMs, bonusCount, bonusMinutes) {
    var adj = elapsedMs - bonusCount * bonusMinutes * 60000;
    return adj < 0 ? 0 : adj;
  }

  /* Local YYYY-MM-DD (mode switching uses the phone's local date). */
  function localDateStr(d) {
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return y + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }

  /* hunt vs guide, given today's local date + optional ?mode= override. */
  function resolveMode(queryMode, todayStr, guideStartDate) {
    if (queryMode === "guide" || queryMode === "hunt") return queryMode;
    return todayStr >= guideStartDate ? "guide" : "hunt";
  }

  global.HUNT_LOGIC = {
    normalizeAnswer: normalizeAnswer,
    answerMatches: answerMatches,
    stopIndexForLeg: stopIndexForLeg,
    formatElapsed: formatElapsed,
    adjustedMs: adjustedMs,
    localDateStr: localDateStr,
    resolveMode: resolveMode
  };

  /* Everything below needs a browser. */
  if (typeof document === "undefined") return;

  /* ==========================================================================
     2) STATE — localStorage, keyed per city; survives reloads
     ======================================================================= */

  var LS_PREFIX = "uwposse-hunt-v1:";
  var ACTIVE_KEY = LS_PREFIX + "active-city";

  function loadState(cityId) {
    try {
      var raw = localStorage.getItem(LS_PREFIX + cityId);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveState(state) {
    try {
      localStorage.setItem(LS_PREFIX + state.cityId, JSON.stringify(state));
      localStorage.setItem(ACTIVE_KEY, state.cityId);
    } catch (e) { /* storage full/blocked: app still works for this session */ }
  }

  function clearState(cityId) {
    try {
      localStorage.removeItem(LS_PREFIX + cityId);
      if (localStorage.getItem(ACTIVE_KEY) === cityId) localStorage.removeItem(ACTIVE_KEY);
    } catch (e) {}
  }

  function newState(cityId) {
    var legs = [];
    for (var i = 0; i < CONFIG.stops.length; i++) {
      legs.push({ solvedAt: null, misses: 0, revealed: false, bonus: null });
    }
    return {
      cityId: cityId,
      startedAt: null,     // set when "Start the hunt" is tapped
      finishedAt: null,
      currentLeg: 0,       // 0..7 in play; 8 = finished
      legs: legs,
      staffActions: []
    };
  }

  /* ==========================================================================
     3) UI
     ======================================================================= */

  var $ = function (id) { return document.getElementById(id); };

  var app = $("app");
  var state = null;                // active team state (hunt mode)
  var mode = "hunt";
  var pendingCityId = null;        // between pick + confirm
  var timerInterval = null;
  var footerTaps = 0;
  var footerTapTimer = null;

  function cityById(id) {
    for (var i = 0; i < CONFIG.cities.length; i++) {
      if (CONFIG.cities[i].id === id) return CONFIG.cities[i];
    }
    return null;
  }

  function stopForLeg(st, leg) {
    var city = cityById(st.cityId);
    return CONFIG.stops[stopIndexForLeg(city.startOffset, leg, CONFIG.stops.length)];
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function mapsUrl(query) {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
  }

  /* ---------------- Optional logging (P2; ships disabled) ---------------- */
  function logEvent(eventName, stopId) {
    var cfg = CONFIG.logging;
    if (!cfg || !cfg.enabled || !cfg.formActionUrl) return;
    try {
      var elapsed = state && state.startedAt ? Math.floor((Date.now() - state.startedAt) / 1000) : 0;
      var data = new FormData();
      data.append(cfg.fields.city, state ? state.cityId : "-");
      data.append(cfg.fields.stop, stopId || "-");
      data.append(cfg.fields.event, eventName);
      data.append(cfg.fields.elapsedSeconds, String(elapsed));
      fetch(cfg.formActionUrl, { method: "POST", mode: "no-cors", body: data })
        .catch(function () {});
    } catch (e) { /* never block gameplay */ }
  }

  /* ---------------- Header / chrome ---------------- */
  function setAccent(color) {
    document.body.style.setProperty("--accent", color || "");
  }

  function renderChrome() {
    var city = state ? cityById(state.cityId) : null;
    setAccent(city ? city.accent : null);
    $("team-chip").textContent = city ? "Team " + city.name : "";
    $("team-chip").style.display = city ? "" : "none";

    var strip = $("timer-strip");
    if (mode === "hunt" && state && state.startedAt && !state.finishedAt) {
      strip.style.display = "";
      $("timer-stop-label").textContent =
        state.currentLeg < CONFIG.stops.length
          ? "Stop " + (state.currentLeg + 1) + " of " + CONFIG.stops.length
          : "Finished";
    } else {
      strip.style.display = "none";
    }
    updateClock();
  }

  function updateClock() {
    var el = $("timer-clock");
    if (!el || !state || !state.startedAt) return;
    var end = state.finishedAt || Date.now();
    el.textContent = formatElapsed(end - state.startedAt);
  }

  function startTicker() {
    stopTicker();
    timerInterval = setInterval(updateClock, 1000);
  }
  function stopTicker() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  /* ---------------- Screens ---------------- */

  function show(html) {
    app.innerHTML = html;
    window.scrollTo(0, 0);
    renderChrome();
  }

  function trailHtml(st) {
    var total = CONFIG.stops.length;
    var html = '<div class="trail" aria-label="Progress">';
    for (var leg = 0; leg < total; leg++) {
      var cls = "wp";
      if (leg < st.currentLeg || (st.legs[leg] && st.legs[leg].solvedAt)) cls += " done";
      else if (leg === st.currentLeg) cls += " current";
      html += '<span class="' + cls + '">' + (leg + 1) + "</span>";
      if (leg < total - 1) {
        html += '<span class="seg' + (leg < st.currentLeg ? " done" : "") + '"></span>';
      }
    }
    html += "</div>";
    return html;
  }

  function renderLanding() {
    var rulesHtml = "";
    for (var i = 0; i < CONFIG.rules.length; i++) {
      rulesHtml += "<li>" + escapeHtml(CONFIG.rules[i]) + "</li>";
    }
    var cityBtns = "";
    for (var c = 0; c < CONFIG.cities.length; c++) {
      var city = CONFIG.cities[c];
      cityBtns += '<button class="city-btn" data-city="' + city.id + '" style="background:' + city.accent + '">' +
        escapeHtml(city.name) + "</button>";
    }
    show(
      '<div class="card">' +
        '<h2 class="screen-title">Welcome to the hunt</h2>' +
        '<p class="lede">8 stops, one loop, every team walks the same distance. Solve the clue, snap the photo, race back.</p>' +
        '<ol class="rules-list">' + rulesHtml + "</ol>" +
        '<div class="phone-card">Lost or need help? Call or text the Posse phone:<br>' +
          '<a href="tel:' + CONFIG.event.possePhoneTel + '">' + escapeHtml(CONFIG.event.possePhone) + "</a></div>" +
      "</div>" +
      '<div class="card">' +
        '<h2 class="screen-title">Pick your posse</h2>' +
        '<div class="city-grid">' + cityBtns + "</div>" +
      "</div>"
    );
    var btns = app.querySelectorAll(".city-btn");
    for (var b = 0; b < btns.length; b++) {
      btns[b].addEventListener("click", function () {
        pendingCityId = this.getAttribute("data-city");
        renderConfirm();
      });
    }
  }

  function renderConfirm() {
    var city = cityById(pendingCityId);
    if (!city) { renderLanding(); return; }
    setAccent(city.accent);
    var firstStop = CONFIG.stops[stopIndexForLeg(city.startOffset, 0, CONFIG.stops.length)];
    var existing = loadState(pendingCityId);
    var resumeNote = existing && existing.startedAt
      ? '<div class="status-msg">Heads up: this phone already has a hunt in progress for Team ' +
        escapeHtml(city.name) + ". Starting fresh will erase it; Resume picks up where it left off.</div>"
      : "";
    show(
      '<div class="card">' +
        '<h2 class="screen-title">You’re Team ' + escapeHtml(city.name) + "</h2>" +
        '<p class="lede">You’ll visit the same 8 stops as everyone — your loop starts at <strong>' +
          escapeHtml(firstStop.name) + "</strong> (stop " + (city.startOffset + 1) + " on the loop) and wraps around.</p>" +
        resumeNote +
        (existing && existing.startedAt
          ? '<button class="btn btn-accent" id="resume-btn">Resume the hunt</button>' +
            '<button class="btn btn-secondary" id="start-btn">Start over (erases progress)</button>'
          : '<button class="btn btn-accent" id="start-btn">Start the hunt</button>') +
        '<button class="btn btn-ghost" id="back-btn">Back</button>' +
      "</div>"
    );
    $("start-btn").addEventListener("click", function () {
      state = newState(pendingCityId);
      state.startedAt = Date.now();
      saveState(state);
      logEvent("start", stopForLeg(state, 0).id);
      startTicker();
      renderCurrent();
    });
    if ($("resume-btn")) {
      $("resume-btn").addEventListener("click", function () {
        state = existing;
        startTicker();
        renderCurrent();
      });
    }
    $("back-btn").addEventListener("click", function () {
      pendingCityId = null;
      setAccent(null);
      renderLanding();
    });
  }

  /* Route to the right screen for the current leg. */
  function renderCurrent() {
    if (!state) { renderLanding(); return; }
    if (state.currentLeg >= CONFIG.stops.length) { renderFinish(); return; }
    var leg = state.legs[state.currentLeg];
    if (leg.solvedAt) renderReveal();
    else renderClue();
  }

  function renderClue() {
    var legNo = state.currentLeg;
    var stop = stopForLeg(state, legNo);
    var leg = state.legs[legNo];

    var hintHtml = leg.misses >= CONFIG.hintAfterMisses
      ? '<div class="hint-box"><strong>Hint:</strong> ' + escapeHtml(stop.hint) + "</div>"
      : "";
    var revealBtn = leg.misses >= CONFIG.revealAfterMisses
      ? '<button class="btn btn-ghost" id="reveal-btn">Reveal the answer (no bonus for this stop)</button>'
      : "";

    show(
      trailHtml(state) +
      '<p class="trail-label">Stop ' + (legNo + 1) + " of " + CONFIG.stops.length + "</p>" +
      '<div class="card">' +
        '<p class="stop-kicker">Clue ' + (legNo + 1) + "</p>" +
        '<p class="clue-text">' + escapeHtml(stop.clue) + "</p>" +
        '<div class="answer-row">' +
          '<input class="answer-input" id="answer-input" type="text" autocomplete="off" autocapitalize="none" ' +
            'placeholder="Where are you headed? Type it here" aria-label="Your answer">' +
          '<button class="btn btn-accent" id="submit-btn">Check answer</button>' +
        "</div>" +
        '<p class="miss-msg" id="miss-msg"></p>' +
        hintHtml + revealBtn +
      "</div>"
    );

    function submit() {
      var guess = $("answer-input").value;
      if (!normalizeAnswer(guess)) return;
      if (answerMatches(guess, stop.aliases)) {
        leg.solvedAt = Date.now();
        saveState(state);
        logEvent("solve", stop.id);
        renderReveal();
      } else {
        leg.misses++;
        saveState(state);
        var msg = leg.misses === 1 ? "Not it — talk it out and try again."
          : leg.misses < CONFIG.hintAfterMisses ? "Still not it — you’ve got this."
          : "Not quite — check the hint below.";
        // re-render to surface hint/reveal thresholds, then restore message
        renderClue();
        $("miss-msg").textContent = msg;
        $("answer-input").focus();
      }
    }

    $("submit-btn").addEventListener("click", submit);
    $("answer-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); submit(); }
    });
    if ($("reveal-btn")) {
      $("reveal-btn").addEventListener("click", function () {
        leg.revealed = true;
        leg.solvedAt = Date.now();
        leg.bonus = "disqualified";
        saveState(state);
        logEvent("reveal", stop.id);
        renderReveal();
      });
    }
  }

  function renderReveal() {
    var legNo = state.currentLeg;
    var stop = stopForLeg(state, legNo);
    var leg = state.legs[legNo];
    var city = cityById(state.cityId);
    var r = stop.reveal;

    var bullets = "";
    for (var i = 0; i < r.bullets.length; i++) bullets += "<li>" + escapeHtml(r.bullets[i]) + "</li>";

    var solvedLine = leg.revealed
      ? '<p class="solved-kicker" style="color:var(--muted)">Answer revealed — ' + escapeHtml(stop.name) + "</p>"
      : '<p class="solved-kicker">Solved — ' + escapeHtml(stop.name) + "</p>";

    /* Bonus block */
    var bonusHtml = "";
    if (stop.bonus) {
      if (leg.bonus === null) {
        bonusHtml =
          '<div class="bonus-box" id="bonus-box">' +
            '<p class="bonus-kicker">Bonus — shave ' + CONFIG.bonusMinutes + " min off your time (one try, totally optional)</p>" +
            '<p class="bonus-q">' + escapeHtml(stop.bonus.question) + "</p>" +
            '<div class="answer-row">' +
              '<input class="answer-input" id="bonus-input" type="text" autocomplete="off" autocapitalize="none" placeholder="One shot — make it count" aria-label="Bonus answer">' +
              '<button class="btn btn-secondary" id="bonus-submit">Answer bonus</button>' +
              '<button class="btn btn-ghost" id="bonus-skip">Skip it</button>' +
            "</div>" +
          "</div>";
      } else {
        var resHtml = "";
        if (leg.bonus === "correct") resHtml = '<p class="bonus-result good">Bonus locked in — ' + CONFIG.bonusMinutes + " minutes off your time.</p>";
        else if (leg.bonus === "wrong") resHtml = '<p class="bonus-result bad">Bonus missed — no time off here. Keep moving!</p>';
        else if (leg.bonus === "disqualified") resHtml = '<p class="bonus-result bad">Bonus locked — the answer was revealed for this stop.</p>';
        else resHtml = '<p class="bonus-result">Bonus skipped.</p>';
        bonusHtml = '<div class="bonus-box">' +
          '<p class="bonus-kicker">Bonus</p>' +
          '<p class="bonus-q">' + escapeHtml(stop.bonus.question) + "</p>" + resHtml + "</div>";
      }
    }

    var isLast = legNo === CONFIG.stops.length - 1;

    show(
      trailHtml(state) +
      '<p class="trail-label">Stop ' + (legNo + 1) + " of " + CONFIG.stops.length + "</p>" +
      '<div class="card reveal-card">' +
        solvedLine +
        "<h3>" + escapeHtml(r.title) + "</h3>" +
        "<ul>" + bullets + "</ul>" +
        '<a class="official-link" href="' + escapeHtml(r.link.url) + '" target="_blank" rel="noopener">' +
          escapeHtml(r.link.label) + "</a><br>" +
        '<a class="maps-link" href="' + mapsUrl(stop.mapsQuery) + '" target="_blank" rel="noopener">Directions to ' +
          escapeHtml(stop.name) + "</a>" +
      "</div>" +
      '<div class="photo-box"><strong>Photo time.</strong> ' + escapeHtml(CONFIG.photoReminder) + " " +
        escapeHtml(city.chatLabel) + ".</div>" +
      bonusHtml +
      '<button class="btn btn-accent" id="next-btn">' +
        (isLast ? "Finish the hunt" : "Next stop") + "</button>"
    );

    if ($("bonus-submit")) {
      $("bonus-submit").addEventListener("click", function () {
        var guess = $("bonus-input").value;
        if (!normalizeAnswer(guess)) return;
        leg.bonus = answerMatches(guess, stop.bonus.answers) ? "correct" : "wrong";
        saveState(state);
        logEvent("bonus-" + leg.bonus, stop.id);
        renderReveal();
      });
      $("bonus-skip").addEventListener("click", function () {
        leg.bonus = "skipped";
        saveState(state);
        renderReveal();
      });
    }

    $("next-btn").addEventListener("click", function () {
      if (stop.bonus && leg.bonus === null) leg.bonus = "skipped"; // moving on = skipping
      state.currentLeg++;
      if (state.currentLeg >= CONFIG.stops.length) {
        state.finishedAt = leg.solvedAt || Date.now();
        logEvent("finish", stop.id);
      }
      saveState(state);
      renderCurrent();
    });
  }

  function renderFinish() {
    stopTicker();
    var city = cityById(state.cityId);
    var elapsed = (state.finishedAt || Date.now()) - state.startedAt;
    var bonusCount = 0, revealedStops = [], splits = "";
    for (var i = 0; i < CONFIG.stops.length; i++) {
      var stop = stopForLeg(state, i);
      var leg = state.legs[i];
      if (leg.bonus === "correct") bonusCount++;
      if (leg.revealed) revealedStops.push(stop.name);
      var t = leg.solvedAt
        ? new Date(leg.solvedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })
        : "—";
      splits += "<tr><td>" + (i + 1) + ". " + escapeHtml(stop.name) +
        (leg.revealed ? ' <span class="flag">revealed</span>' : "") +
        (leg.bonus === "correct" ? " (+bonus)" : "") +
        "</td><td>" + t + "</td></tr>";
    }
    var adj = adjustedMs(elapsed, bonusCount, CONFIG.bonusMinutes);

    var flags = "";
    if (revealedStops.length) {
      flags += '<span class="flag">Revealed answers: ' + escapeHtml(revealedStops.join(", ")) + "</span>";
    }
    for (var a = 0; a < state.staffActions.length; a++) {
      flags += '<span class="flag">Staff: ' + escapeHtml(state.staffActions[a]) + "</span>";
    }

    var fmtClock = function (ts) {
      return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
    };

    show(
      '<div class="finish-banner">' +
        "<h2>RACE BACK TO LOWELL CENTER</h2>" +
        "<p>" + escapeHtml(CONFIG.event.homeBase) + " · " + escapeHtml(CONFIG.event.homeBaseAddress) +
        " · show this screen to staff</p>" +
      "</div>" +
      '<div class="card">' +
        '<h2 class="screen-title">Team ' + escapeHtml(city.name) + " — hunt complete</h2>" +
        '<div class="summary-grid">' +
          '<div class="stat"><span class="num">' + fmtClock(state.startedAt) + '</span><span class="label">Started</span></div>' +
          '<div class="stat"><span class="num">' + fmtClock(state.finishedAt) + '</span><span class="label">Finished</span></div>' +
          '<div class="stat"><span class="num">' + formatElapsed(elapsed) + '</span><span class="label">Elapsed</span></div>' +
          '<div class="stat"><span class="num">' + bonusCount + " of " + CONFIG.stops.length + '</span><span class="label">Bonuses</span></div>' +
        "</div>" +
        '<div class="stat" style="margin-bottom:12px"><span class="num adjusted">' + formatElapsed(adj) +
          '</span><span class="label">Adjusted time (−' + CONFIG.bonusMinutes + " min × " + bonusCount + " bonuses)</span></div>" +
        (flags ? '<div class="flag-row">' + flags + "</div>" : "") +
        '<div class="splits"><table>' + splits + "</table></div>" +
      "</div>"
    );
  }

  /* ---------------- Rules modal ---------------- */
  function openRules() {
    var rulesHtml = "";
    for (var i = 0; i < CONFIG.rules.length; i++) rulesHtml += "<li>" + escapeHtml(CONFIG.rules[i]) + "</li>";
    openModal(
      "<h2>The rules</h2>" +
      '<ol class="rules-list">' + rulesHtml + "</ol>" +
      '<div class="phone-card">Lost or need help? Call or text the Posse phone:<br>' +
        '<a href="tel:' + CONFIG.event.possePhoneTel + '">' + escapeHtml(CONFIG.event.possePhone) + "</a></div>" +
      '<button class="btn btn-secondary" id="modal-close" style="margin-top:16px">Back to the hunt</button>'
    );
  }

  function openModal(innerHtml) {
    closeModal();
    var scrim = document.createElement("div");
    scrim.className = "modal-scrim";
    scrim.id = "modal-scrim";
    scrim.innerHTML = '<div class="modal">' + innerHtml + "</div>";
    document.body.appendChild(scrim);
    scrim.addEventListener("click", function (e) { if (e.target === scrim) closeModal(); });
    var closer = $("modal-close");
    if (closer) closer.addEventListener("click", closeModal);
  }
  function closeModal() {
    var el = $("modal-scrim");
    if (el) el.parentNode.removeChild(el);
  }

  /* ---------------- Staff mode ---------------- */
  function promptStaff() {
    var code = window.prompt("Staff code:");
    if (code === null) return;
    if (String(code).trim().toLowerCase() !== String(CONFIG.staffCode).trim().toLowerCase()) {
      window.alert("Wrong code.");
      return;
    }
    openStaffPanel();
  }

  function openStaffPanel() {
    var cityOpts = "";
    for (var i = 0; i < CONFIG.cities.length; i++) {
      var c = CONFIG.cities[i];
      var s = loadState(c.id);
      var status = s && s.startedAt
        ? (s.currentLeg >= CONFIG.stops.length ? "finished" : "on stop " + (s.currentLeg + 1))
        : "not started";
      cityOpts += '<option value="' + c.id + '">' + escapeHtml(c.name) + " (" + status + ")</option>";
    }
    var stopOpts = "";
    for (var n = 1; n <= CONFIG.stops.length; n++) stopOpts += '<option value="' + n + '">' + n + "</option>";

    openModal(
      "<h2>Staff panel</h2>" +
      '<p class="lede">Jump is for dead-phone recovery: it marks earlier stops solved and puts the team on stop N. All actions are flagged on the finish screen.</p>' +
      '<div class="staff-row"><label style="flex:0 0 auto">Team</label><select id="staff-city">' + cityOpts + "</select></div>" +
      '<div class="staff-row"><label style="flex:0 0 auto">Stop N</label><select id="staff-stop">' + stopOpts + "</select>" +
        '<input id="staff-mins" type="number" inputmode="numeric" placeholder="mins elapsed (fresh phone)"></div>' +
      '<button class="btn btn-primary" id="staff-jump">Jump team to stop N</button>' +
      '<button class="btn btn-secondary" id="staff-solve">Force-solve current stop</button>' +
      '<button class="btn btn-secondary" id="staff-reset">Reset team (erases progress)</button>' +
      '<button class="btn btn-ghost" id="modal-close">Close</button>'
    );

    function targetState() {
      var cityId = $("staff-city").value;
      var s = loadState(cityId) || newState(cityId);
      if (!s.startedAt) {
        var mins = parseInt($("staff-mins").value, 10);
        s.startedAt = Date.now() - (isNaN(mins) || mins < 0 ? 0 : mins) * 60000;
      }
      return s;
    }
    function nowLabel() {
      return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    function adopt(s, actionLabel) {
      s.staffActions.push(actionLabel + " at " + nowLabel());
      saveState(s);
      state = s;
      closeModal();
      startTicker();
      renderCurrent();
    }

    $("staff-jump").addEventListener("click", function () {
      var n = parseInt($("staff-stop").value, 10);
      var s = targetState();
      for (var i = 0; i < n - 1; i++) {
        if (!s.legs[i].solvedAt) {
          s.legs[i].solvedAt = Date.now();
          if (s.legs[i].bonus === null) s.legs[i].bonus = "skipped";
        }
      }
      s.currentLeg = n - 1;
      s.finishedAt = null;
      adopt(s, "jumped to stop " + n);
    });
    $("staff-solve").addEventListener("click", function () {
      var s = targetState();
      if (s.currentLeg < CONFIG.stops.length && !s.legs[s.currentLeg].solvedAt) {
        s.legs[s.currentLeg].solvedAt = Date.now();
      }
      adopt(s, "force-solved stop " + (s.currentLeg + 1));
    });
    $("staff-reset").addEventListener("click", function () {
      var cityId = $("staff-city").value;
      if (!window.confirm("Erase ALL progress for this team?")) return;
      clearState(cityId);
      if (state && state.cityId === cityId) {
        state = null;
        stopTicker();
        setAccent(null);
        closeModal();
        renderLanding();
      } else {
        closeModal();
      }
    });
  }

  /* ---------------- Guide mode ---------------- */
  function guideEntries() {
    var entries = [];
    for (var i = 0; i < CONFIG.stops.length; i++) {
      var s = CONFIG.stops[i];
      entries.push({
        category: s.guideCategory,
        name: s.reveal.title,
        where: s.address,
        bullets: s.reveal.bullets,
        link: s.reveal.link,
        verified: s.reveal.verified !== false
      });
    }
    for (var g = 0; g < CONFIG.guideExtras.length; g++) {
      var e = CONFIG.guideExtras[g];
      entries.push({
        category: e.category,
        name: e.name,
        where: e.where,
        bullets: e.bullets,
        link: e.link,
        verified: e.verified !== false
      });
    }
    return entries;
  }

  var guideFilter = "all";

  function renderGuide() {
    var tabs = '<button class="gtab' + (guideFilter === "all" ? " is-active" : "") + '" data-cat="all">All</button>';
    for (var i = 0; i < CONFIG.guideCategories.length; i++) {
      var cat = CONFIG.guideCategories[i];
      tabs += '<button class="gtab' + (guideFilter === cat.id ? " is-active" : "") + '" data-cat="' + cat.id + '">' +
        escapeHtml(cat.label) + "</button>";
    }

    var entries = guideEntries();
    var body = "";
    for (var c = 0; c < CONFIG.guideCategories.length; c++) {
      var gc = CONFIG.guideCategories[c];
      if (guideFilter !== "all" && guideFilter !== gc.id) continue;
      var inCat = entries.filter(function (e) { return e.category === gc.id; });
      if (!inCat.length) continue;
      body += '<h3 class="guide-cat-head">' + escapeHtml(gc.label) + "</h3>";
      for (var e = 0; e < inCat.length; e++) {
        var en = inCat[e];
        var bl = "";
        for (var b = 0; b < en.bullets.length; b++) bl += "<li>" + escapeHtml(en.bullets[b]) + "</li>";
        body +=
          '<div class="card guide-entry">' +
            "<h3>" + escapeHtml(en.name) +
              (en.verified ? "" : ' <span class="badge badge-unverified">Unverified</span>') + "</h3>" +
            '<p class="where">' + escapeHtml(en.where) + "</p>" +
            "<ul>" + bl + "</ul>" +
            '<a class="official-link" href="' + escapeHtml(en.link.url) + '" target="_blank" rel="noopener">' +
              escapeHtml(en.link.label) + "</a>" +
          "</div>";
      }
    }

    show(
      '<div class="card">' +
        '<h2 class="screen-title">UW Posse Campus Resource Guide</h2>' +
        '<p class="lede">You unlocked this on your SOAR scavenger hunt. Every place here is free or already covered by your fees — use them early and often.</p>' +
      "</div>" +
      '<div class="guide-tabs">' + tabs + "</div>" + body
    );

    var tabBtns = app.querySelectorAll(".gtab");
    for (var t = 0; t < tabBtns.length; t++) {
      tabBtns[t].addEventListener("click", function () {
        guideFilter = this.getAttribute("data-cat");
        renderGuide();
      });
    }
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    var params = new URLSearchParams(window.location.search);
    mode = resolveMode(params.get("mode"), localDateStr(new Date()), CONFIG.event.guideStartDate);

    $("rules-link").addEventListener("click", openRules);

    /* Staff entry: ?staff=1 or 5 quick taps on the footer */
    $("site-footer").addEventListener("click", function () {
      footerTaps++;
      if (footerTapTimer) clearTimeout(footerTapTimer);
      footerTapTimer = setTimeout(function () { footerTaps = 0; }, 2500);
      if (footerTaps >= 5) { footerTaps = 0; promptStaff(); }
    });

    if (mode === "guide") {
      $("rules-link").style.display = "none";
      $("header-subtitle").textContent = "Campus Resource Guide";
      renderGuide();
      return;
    }

    if (params.get("staff") === "1") promptStaff();

    /* Resume if this device has an active hunt */
    var activeCity = null;
    try { activeCity = localStorage.getItem(ACTIVE_KEY); } catch (e) {}
    if (activeCity) {
      var saved = loadState(activeCity);
      if (saved && saved.startedAt) {
        state = saved;
        startTicker();
        renderCurrent();
        return;
      }
    }
    renderLanding();
  }

  document.addEventListener("DOMContentLoaded", boot);

})(typeof window !== "undefined" ? window : globalThis);
