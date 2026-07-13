# UW Posse SOAR 2026 Scavenger Hunt

A phone-first web app for the UW–Madison Posse Program's SOAR-week campus scavenger
hunt — and, after the event, a lasting **Campus Resource Guide** for scholars.

**Live site:** https://adelatorre2.github.io/uwposse-hunt/

## What it does

**Hunt mode** (through July 14, 2026): four city teams (Chicago, New York, LA, DC)
each open the site on one phone, pick their team, and work through 8 campus stops
**in order**. Each team starts at a different point on the same walking loop, so
everyone covers the same distance. Solving a clue (typed answer, forgiving matching)
unlocks a campus-resource reveal card, a maps link, and an optional bonus question
that shaves minutes off the team's time. The app timestamps everything and ends on a
screenshot-friendly summary screen that staff verifies back at Lowell Center.

Photos are deliberately **not** part of the app — teams text a selfie with their
entire posse at each stop to their existing city group chat.

**Guide mode** (from July 15, 2026, automatic): the same site becomes the
**UW Posse Campus Resource Guide** — every reveal card plus two dozen more
verified campus resources, grouped by category with filter tabs.

## Structure

```
index.html            the app (hunt + guide modes)
css/styles.css        styles — sunlight-readable, big tap targets
js/config.js          ALL content: stops, clues, answers, guide entries, settings
js/app.js             logic — nothing here needs editing for content changes
print.html            paper fallback: printable per-team clue sheets
mission-control.html  optional staff progress board (needs P2 wiring, see HANDOFF)
assets/               QR code
```

No frameworks, no build step, no backend, no analytics. After first load the hunt
works with zero network. The only network calls are Google Fonts (with system-font
fallback) and — only if explicitly enabled — anonymous event logging.

## Editing content

Everything editable lives in `js/config.js` (clues, answers, hints, bonuses, reveal
cards, guide entries, staff code, bonus minutes). See **HANDOFF.md** for the
step-by-step, non-technical guide to every common change and how to redeploy.

## Privacy rules (do not break these)

- **Zero scholar data** in this repo, the site, or the logs — no names, no numbers.
- The only phone number allowed anywhere is the public Posse phone: 608-512-7989.
- No photo upload, no geolocation, no camera permissions, no accounts, no trackers.

---

Built for UW Posse SOAR 2026 · not an official UW–Madison publication.
Questions: adelatorre2@wisc.edu
