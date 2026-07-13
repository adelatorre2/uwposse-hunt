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


/* --- practice namespace isolation --- */
ok(L.storageKey("uwposse-hunt-v1:", "chicago", false) === "uwposse-hunt-v1:chicago",
   "real storage key unchanged from v1 format");
ok(L.storageKey("uwposse-hunt-v1:", "chicago", true) === "uwposse-hunt-v1:practice:chicago",
   "practice key lives in its own namespace");
ok(L.storageKey("uwposse-hunt-v1:", "chicago", true) !== L.storageKey("uwposse-hunt-v1:", "chicago", false),
   "practice writes can never touch real keys");
ok(L.storageKey("uwposse-hunt-v1:", "active-city", true) !== L.storageKey("uwposse-hunt-v1:", "active-city", false),
   "practice active-city pointer is separate too");

/* --- synchronized start --- */
var localEpoch = new Date(2026, 6, 14, 18, 5, 0).getTime(); // device-local 6:05 PM
ok(L.syncStartEpoch({ startAt: "2026-07-14T18:05:00" }) === localEpoch,
   "startAt parses as device-local time");
ok(L.syncStartEpoch(null) === null, "sync absent = legacy behavior");
ok(L.syncStartEpoch({}) === null, "sync without startAt = legacy behavior");
ok(L.syncStartEpoch({ startAt: null }) === null, "startAt null = legacy behavior");
ok(L.syncStartEpoch({ startAt: "not a date" }) === null, "malformed startAt = legacy behavior");
ok(L.syncStartEpoch(C.sync) === localEpoch, "config sync.startAt parses to Jul 14 6:05 PM local");

ok(L.syncRemainingMs(localEpoch - 90000, localEpoch) === 90000, "lobby gating: 90s before start");
ok(L.syncRemainingMs(localEpoch, localEpoch) === 0, "lobby gating: T-0 opens the hunt");
ok(L.syncRemainingMs(localEpoch + 1, localEpoch) === 0, "post-startAt join skips the lobby");
ok(L.syncRemainingMs(1000, null) === 0, "no schedule = no lobby");
/* wall-anchored elapsed: startedAt = startAt, so a phone joining 7 min late
   already owes 7 minutes */
ok(L.formatElapsed((localEpoch + 7 * 60000) - localEpoch) === "7:00",
   "wall-anchored elapsed counts from startAt, not the tap");

/* --- hydration mark-crossing --- */
var MIN = 60000, STALE = 5 * MIN;
ok(L.hydrationCheck(29 * MIN, 0, 30, STALE) === null, "no break before the first mark");
var h1 = L.hydrationCheck(30 * MIN + 10000, 0, 30, STALE);
ok(h1 && h1.mark === 1 && h1.show === true, "fresh mark 1 shows");
var h2 = L.hydrationCheck(36 * MIN, 0, 30, STALE);
ok(h2 && h2.mark === 1 && h2.show === false, "stale mark (>5 min old) is skipped, not shown");
ok(L.hydrationCheck(31 * MIN, 1, 30, STALE) === null, "acknowledged mark never re-fires");
var h3 = L.hydrationCheck(65 * MIN, 0, 30, STALE);
ok(h3 && h3.mark === 2, "backgrounded past two marks: only the latest fires (never stacks)");
ok(L.hydrationCheck(61 * MIN, 1, 30, STALE).show === true, "second mark shows fresh after first was dismissed");
ok(L.hydrationCheck(45 * MIN, 0, 0, STALE) === null, "intervalMinutes 0 disables");
ok(L.hydrationCheck(45 * MIN, 0, null, STALE) === null, "missing interval disables");

/* --- staff force start --- */
var fs = L.applyForceStart({ startedAt: null, syncedStart: true, forceStarted: false }, 1234567);
ok(fs.startedAt === 1234567 && fs.forceStarted === true && fs.syncedStart === false,
   "force start anchors clock to press moment and flags the override");

/* --- legacy save migration (pre-v2 resume) --- */
var legacy = { cityId: "la", startedAt: 111, finishedAt: null, currentLeg: 3,
               legs: [{ solvedAt: 1, misses: 0, revealed: false, bonus: null }],
               staffActions: [] };
var mig = L.migrateState(legacy);
ok(mig.version === 2, "state version bumped to 2 on load");
ok(mig.hydrationMark === 0 && mig.syncedStart === false && mig.joinedLate === false &&
   mig.forceStarted === false, "legacy save resumes with safe defaults");
ok(mig.startedAt === 111 && mig.currentLeg === 3, "legacy progress untouched by migration");
ok(L.migrateState(null) === null, "migrate null-safe");

/* --- new config integrity --- */
ok(C.hydration && C.hydration.enabled === true && C.hydration.intervalMinutes === 30 &&
   C.hydration.minDismissSeconds === 20 && C.hydration.message.length > 0,
   "hydration config complete");

print("");
print(failures === 0 ? "ALL TESTS PASSED" : failures + " FAILURES");
if (failures > 0) throw new Error(failures + " test failures");
