# HANDOFF — running & maintaining the hunt site

Written for whoever runs this next. No coding experience needed for most of it.

**Live site:** https://adelatorre2.github.io/uwposse-hunt/
**Repo:** https://github.com/adelatorre2/uwposse-hunt

Everything you'd want to change lives in **one file: `js/config.js`**. It's heavily
commented. The general workflow for ANY change:

1. Edit `js/config.js` (in GitHub's web editor: open the file, click the pencil).
2. Commit the change (green button).
3. Wait ~2–5 minutes for GitHub Pages to redeploy. Hard-refresh the site.

---

## 1. Edit a clue / hint / answer / bonus

In `js/config.js`, find the stop inside `stops: [...]` (they're in loop order and
labeled with comments). Edit the text between the quotes:

- `clue` — the riddle
- `aliases` — every accepted answer. Matching already ignores case, punctuation,
  extra spaces, and a leading "the", so you only need genuinely different words.
- `hint` — appears after 2 wrong tries
- `bonus.question` / `bonus.answers` — the bonus and its accepted answers
- `reveal` — the resource card shown on solve

## 2. Change the staff code (DO THIS BEFORE TUESDAY)

Find `staffCode: "CHANGE-ME"` near the top and replace `CHANGE-ME` with your code.
To use staff mode on any phone: tap the footer 5 times (or add `?staff=1` to the
URL), enter the code. From there you can jump a team to any stop (dead-phone
recovery — on a fresh phone you can also enter how many minutes they've been
hunting so the clock stays fair), force-solve a stuck stop, retroactively mark a
photo checkpoint confirmed, or reset a team. Jumping or force-solving marks the
affected stops' photo checkpoints as "staff skipped" (never silently confirmed).
Every staff action is flagged on that team's finish screen.

## 3. Bonus minutes

`bonusMinutes: 2` — minutes subtracted per correct bonus. Set `0` for pure
fastest-time scoring.

## 3b. Photo checkpoint

After each solve, teams must tap **"Sent to our group chat"** before the next
clue unlocks. It's self-reported — photos never touch the app — and the finish
screen shows "Photos confirmed: N/8" with a per-stop row so staff can verify
against the group chat. Settings in `js/config.js`:

```js
photoCheckpoint: {
  enabled: true,   // false = old passive reminder, no gating
  instruction: "Take a selfie with your ENTIRE posse in front of {stop}, then send it to {chat}."
}
```

The instruction supports `{stop}` (stop name), `{city}` (team city), and
`{chat}` (the per-city chat label, e.g. New York's WhatsApp). **Never put
group-chat invite links in config** — this repo is public and a link would let
strangers join scholars' chats. Text only.

## 4. Hunt mode vs guide mode

Automatic: hunt through `huntDate` (2026-07-14), guide from `guideStartDate`
(2026-07-15) — both near the top of config. For testing, force a mode with
`?mode=hunt` or `?mode=guide` on the URL.

## 5. Swap a stop (e.g., Historical Society construction)

The Historical Society stop has a `swapCandidate` note (Memorial Library). To swap:
edit that stop's `name`, `address`, `mapsQuery`, `clue`, `aliases`, `hint`, `bonus`,
and `reveal`. Keep it in the same position in the list so the loop order holds.

## 6. Paper fallback

Open https://adelatorre2.github.io/uwposse-hunt/print.html and print. One page per
team, clues already in each team's order, rules + heat warning included.

## 7. P2 logging + mission control (optional, ~5 minutes)

Off by default. When on, phones anonymously log `{city, stop, event, elapsed}` to a
Google Form so staff can watch progress at `mission-control.html`.

1. Create a **Google Form** with exactly four **short answer** questions, in this
   order: `city`, `stop`, `event`, `elapsedSeconds`.
   **Do NOT enable** "collect email addresses", sign-in requirement, or file upload.
2. Click the three-dot menu → **Get pre-filled link**. Type anything in all four
   boxes, click "Get link", copy it. It contains `entry.123456789=...` for each
   field — those numbers are the field IDs.
3. In the form's **Responses** tab, click the Sheets icon to create the linked
   responses spreadsheet. In that sheet: Share → "Anyone with the link: Viewer".
   Copy the long ID from the sheet's URL (between `/d/` and `/edit`).
4. In `js/config.js`, fill in:
   ```js
   logging: {
     enabled: true,
     formActionUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse",
     fields: {
       city: "entry.111111",
       stop: "entry.222222",
       event: "entry.333333",
       elapsedSeconds: "entry.444444"
     }
   },
   missionControl: { sheetId: "YOUR_SHEET_ID", pollSeconds: 30 }
   ```
   (The form ID is in the form's URL when you click "Send" → link.)
5. Commit, wait for redeploy, then open
   https://adelatorre2.github.io/uwposse-hunt/mission-control.html
   Solves will appear within ~30 seconds. If it can't reach the sheet, re-check
   step 3's sharing setting. Logging never blocks gameplay — if it fails, teams
   don't notice.

## 8. Redeploying from a computer (instead of the web editor)

```bash
git clone https://github.com/adelatorre2/uwposse-hunt.git
# edit files
git add -A && git commit -m "describe the change" && git push
```

On a Mac you can also run the logic test suite (no install needed):

```bash
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc \
  tests/preamble.js js/config.js js/app.js tests/hunt_tests.js
```

## 9. Rules that must never break

- This repo is **public**: never add scholar names, rosters, personal phone
  numbers, or anything from internal files. Only the public Posse phone
  (608-512-7989) may appear.
- No photo upload, geolocation, analytics, or accounts. Keep it that way.
- The heat-safety banner stays on every screen for outdoor summer events.
