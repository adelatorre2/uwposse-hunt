/* jsc unit tests for uwposse-hunt pure logic + config integrity.
   Run: jsc preamble.js config.js app.js hunt_tests.js */
var L = window.HUNT_LOGIC;
var C = window.HUNT_CONFIG;
var failures = 0;

function ok(cond, label) {
  if (cond) { print("PASS  " + label); }
  else { failures++; print("FAIL  " + label); }
}

/* --- normalization + alias matching --- */
ok(L.normalizeAnswer("The Book Store") === "book store", "normalize strips 'the', punctuation");
ok(L.normalizeAnswer("  bookstore  ") === "bookstore", "normalize trims");
ok(L.normalizeAnswer("Café") === "cafe", "normalize strips accents");
ok(L.normalizeAnswer("") === "" && L.normalizeAnswer(null) === "", "normalize handles empty/null");

function stopById(id) { for (var i=0;i<C.stops.length;i++) if (C.stops[i].id===id) return C.stops[i]; return null; }

var bookstore = stopById("book-store");
ok(L.answerMatches("The Book Store", bookstore.aliases), "alias: 'The Book Store'");
ok(L.answerMatches("bookstore  ", bookstore.aliases), "alias: 'bookstore  ' (trailing spaces)");
ok(L.answerMatches("U.W. Book-Store!", bookstore.aliases), "alias: punctuation-heavy");
ok(!L.answerMatches("chazen museum", bookstore.aliases), "alias: wrong answer rejected");

var hcw = stopById("college-library");
ok(L.answerMatches("HCW", hcw.aliases), "alias: HCW");
ok(L.answerMatches("helen c. white", hcw.aliases), "alias: helen c. white");

var vv = stopById("van-vleck");
ok(L.answerMatches("vanvleck", vv.aliases), "alias: vanvleck (tight compare)");
ok(L.answerMatches("Van Vleck Hall", vv.aliases), "alias: full name");

var redgym = stopById("red-gym");
ok(L.answerMatches("the armory", redgym.aliases), "alias: 'the armory'");
ok(L.answerMatches("Suite 239", redgym.bonus.answers), "bonus: 'Suite 239' accepted");
ok(L.answerMatches("239", redgym.bonus.answers), "bonus: bare '239' accepted");

var whs = stopById("historical-society");
ok(L.answerMatches("2nd floor", whs.bonus.answers), "bonus: '2nd floor'");
ok(L.answerMatches("second", whs.bonus.answers), "bonus: 'second'");

/* --- rotation --- */
function offsets(id){ for (var i=0;i<C.cities.length;i++) if (C.cities[i].id===id) return C.cities[i].startOffset; }
ok(offsets("chicago")===0 && offsets("newyork")===2 && offsets("la")===4 && offsets("dc")===6, "config offsets 0/2/4/6");
ok(L.stopIndexForLeg(0,0,8)===0, "rotation: chicago leg1 = stop 1");
ok(L.stopIndexForLeg(2,0,8)===2, "rotation: NY leg1 = stop 3");
ok(L.stopIndexForLeg(4,0,8)===4, "rotation: LA leg1 = stop 5");
ok(L.stopIndexForLeg(6,0,8)===6, "rotation: DC leg1 = stop 7");
ok(L.stopIndexForLeg(6,3,8)===1, "rotation: DC leg4 wraps to stop 2");
ok(L.stopIndexForLeg(4,7,8)===3, "rotation: LA leg8 wraps to stop 4");
/* every team visits all 8 exactly once */
var covered = true;
for (var c=0;c<C.cities.length;c++){
  var seen = {};
  for (var leg=0;leg<8;leg++) seen[L.stopIndexForLeg(C.cities[c].startOffset, leg, 8)] = true;
  var n = 0; for (var k in seen) n++;
  if (n !== 8) covered = false;
}
ok(covered, "rotation: every team covers all 8 stops exactly once");

/* --- time math --- */
ok(L.formatElapsed(0)==="0:00", "format 0:00");
ok(L.formatElapsed(65000)==="1:05", "format 1:05");
ok(L.formatElapsed(3661000)==="1:01:01", "format 1:01:01");
ok(L.formatElapsed(-5000)==="0:00", "format clamps negative");
ok(L.adjustedMs(30*60000, 3, 2)===24*60000, "adjusted: 30min - 3x2min = 24min");
ok(L.adjustedMs(3*60000, 5, 2)===0, "adjusted never negative");
ok(L.adjustedMs(30*60000, 3, 0)===30*60000, "adjusted: bonusMinutes 0 = pure time");

/* --- mode resolution --- */
ok(L.resolveMode("guide","2026-07-13",C.event.guideStartDate)==="guide", "?mode=guide overrides");
ok(L.resolveMode("hunt","2026-08-01",C.event.guideStartDate)==="hunt", "?mode=hunt overrides");
ok(L.resolveMode(null,"2026-07-13",C.event.guideStartDate)==="hunt", "July 13 = hunt");
ok(L.resolveMode(null,"2026-07-14",C.event.guideStartDate)==="hunt", "July 14 (event day) = hunt");
ok(L.resolveMode(null,"2026-07-15",C.event.guideStartDate)==="guide", "July 15 = guide");
ok(L.resolveMode(null,"2026-12-01",C.event.guideStartDate)==="guide", "December = guide");

/* --- config integrity --- */
ok(C.stops.length===8, "8 stops");
var stopFieldsOk = true, aliasSelfMatch = true, bonusSelfMatch = true;
for (var s=0;s<C.stops.length;s++){
  var st = C.stops[s];
  if (!(st.id && st.name && st.clue && st.hint && st.mapsQuery &&
        st.aliases && st.aliases.length &&
        st.reveal && st.reveal.title && st.reveal.bullets && st.reveal.bullets.length &&
        st.reveal.link && st.reveal.link.url && st.guideCategory)) stopFieldsOk = false;
  for (var a2=0;a2<st.aliases.length;a2++)
    if (!L.answerMatches(st.aliases[a2], st.aliases)) aliasSelfMatch = false;
  if (st.bonus) {
    if (!(st.bonus.question && st.bonus.answers && st.bonus.answers.length)) stopFieldsOk = false;
    for (var b2=0;b2<st.bonus.answers.length;b2++)
      if (!L.answerMatches(st.bonus.answers[b2], st.bonus.answers)) bonusSelfMatch = false;
  }
}
ok(stopFieldsOk, "every stop has all required fields");
ok(aliasSelfMatch, "every alias matches itself after normalization");
ok(bonusSelfMatch, "every bonus answer matches itself");

var catIds = {};
for (var g=0;g<C.guideCategories.length;g++) catIds[C.guideCategories[g].id] = true;
var catsOk = true;
for (var s2=0;s2<C.stops.length;s2++) if (!catIds[C.stops[s2].guideCategory]) catsOk = false;
for (var e2=0;e2<C.guideExtras.length;e2++){
  var ex = C.guideExtras[e2];
  if (!catIds[ex.category]) catsOk = false;
  if (!(ex.name && ex.where && ex.bullets && ex.bullets.length && ex.link && ex.link.url)) catsOk = false;
}
ok(catsOk, "guide categories consistent; extras complete (" + C.guideExtras.length + " extras)");

var officialOk = true;
var allEntries = [];
for (var s3=0;s3<C.stops.length;s3++) allEntries.push(C.stops[s3].reveal.link.url);
for (var e3=0;e3<C.guideExtras.length;e3++) allEntries.push(C.guideExtras[e3].link.url);
for (var u=0;u<allEntries.length;u++) if (allEntries[u].indexOf("https://")!==0) officialOk = false;
ok(officialOk, "all links are https");

ok(C.logging && C.logging.enabled === false, "logging ships OFF");
ok(C.staffCode === "CHANGE-ME", "staff code is placeholder");
ok(C.bonusMinutes === 2, "bonusMinutes = 2");


/* --- photo checkpoint --- */
ok(L.photoInstruction("Selfie at {stop}, send to {chat} ({city})", "Red Gym", "LA", "your LA group chat")
   === "Selfie at Red Gym, send to your LA group chat (LA)", "photoInstruction fills all tokens");
ok(L.photoInstruction("no tokens here", "x", "y", "z") === "no tokens here", "photoInstruction preserves literal text");
ok(L.photoInstruction(C.photoCheckpoint.instruction, "Red Gym", "DC", "your DC group chat").indexOf("{") === -1,
   "config instruction fully interpolates");

var oldShapeLeg = { solvedAt: 123, misses: 0, revealed: false, bonus: null }; // pre-patch save
ok(L.photoStatus(oldShapeLeg) === "unconfirmed", "old-save leg (no photo fields) = unconfirmed");
ok(L.photoStatus(null) === "unconfirmed", "photoStatus null-safe");
ok(L.photoStatus({ photoConfirmedAt: 900 }) === "confirmed", "confirmed leg detected");
ok(L.photoStatus({ photoConfirmedAt: null, photoSkippedByStaff: true }) === "skipped-staff", "staff skip detected");
ok(L.photoStatus({ photoConfirmedAt: 900, photoSkippedByStaff: true }) === "confirmed", "confirmed wins over staff skip");

ok(L.canAdvanceLeg(oldShapeLeg, true) === false, "gating: unconfirmed cannot advance (old-shape leg)");
ok(L.canAdvanceLeg({ photoConfirmedAt: 42 }, true) === true, "gating: confirmed advances");
ok(L.canAdvanceLeg({ photoSkippedByStaff: true }, true) === true, "gating: staff skip advances");
ok(L.canAdvanceLeg(oldShapeLeg, false) === true, "gating: checkpoint disabled always advances");

ok(C.photoCheckpoint && C.photoCheckpoint.enabled === true, "photoCheckpoint enabled in config");
ok(C.photoCheckpoint.instruction.indexOf("{stop}") !== -1, "instruction references {stop}");
ok(!/https?:\/\/(chat\.whatsapp|wa\.me|t\.me|m\.me|groupme)/i.test(JSON.stringify(C)),
   "no group-chat invite links anywhere in config");
var emojiRe;
try { emojiRe = new RegExp("[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\u{FE0F}]", "u"); }
catch (e) { emojiRe = null; }
ok(emojiRe ? !emojiRe.test(JSON.stringify(C)) : true, "no emoji codepoints anywhere in config");

print("");
print(failures === 0 ? "ALL TESTS PASSED" : failures + " FAILURES");
if (failures > 0) throw new Error(failures + " test failures");
