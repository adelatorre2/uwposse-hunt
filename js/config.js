/* ============================================================================
   UW POSSE SOAR 2026 SCAVENGER HUNT — CONFIG
   ============================================================================
   EVERYTHING editable lives in this one file. The logic in app.js never needs
   to change for wording edits. After editing, commit + push (see HANDOFF.md);
   GitHub Pages redeploys in a few minutes.

   !! PRIVACY RULE: never put scholar names, personal phone numbers, or roster
   info anywhere in this repo. The ONLY phone number allowed is the public
   Posse phone below.
   ========================================================================= */

window.HUNT_CONFIG = {

  /* ---------------- Event basics ---------------- */
  event: {
    title: "UW Posse Scavenger Hunt",
    subtitle: "SOAR 2026",
    huntDate: "2026-07-14",          // hunt mode runs through this date (local time)
    guideStartDate: "2026-07-15",    // guide mode takes over from this date
    endTimeLabel: "8:00 PM",         // hard be-back time shown in rules
    possePhone: "608-512-7989",      // PUBLIC Posse phone — the only number allowed
    possePhoneTel: "6085127989",     // digits only, for tel: links
    homeBase: "Lowell Center",
    homeBaseAddress: "610 Langdon St"
  },

  /* Staff mode code. CHANGE-ME is a placeholder — set a real code before
     Tuesday (see HANDOFF.md, one-line change). Staff mode: tap the footer
     5 times, or add ?staff=1 to the URL, then enter this code. */
  staffCode: "CHANGE-ME",

  /* Minutes subtracted from elapsed time per correct bonus answer.
     Set to 0 for pure fastest-time scoring. */
  bonusMinutes: 2,

  /* Misses before help appears */
  hintAfterMisses: 2,     // show the hint after this many wrong answers
  revealAfterMisses: 4,   // show a "Reveal answer" button after this many

  /* ---------------- Teams ----------------
     startOffset staggers the teams around the same forward loop:
     a team's first stop is stops[startOffset], then it wraps around.
     Everyone walks the same 8 stops and the same total distance. */
  cities: [
    { id: "chicago", name: "Chicago",  accent: "#1F3A93", startOffset: 0, chatLabel: "your Chicago group chat" },
    { id: "newyork", name: "New York", accent: "#A0285A", startOffset: 2, chatLabel: "your New York WhatsApp chat" },
    { id: "la",      name: "LA",       accent: "#A8480B", startOffset: 4, chatLabel: "your LA group chat" },
    { id: "dc",      name: "DC",       accent: "#0F6E62", startOffset: 6, chatLabel: "your DC group chat" }
  ],

  /* ---------------- Rules screen ---------------- */
  rules: [
    "No e-bikes. The 80 bus is the only transportation allowed.",
    "At every stop, take a photo with your ENTIRE posse and send it to your city group chat.",
    "Stops must be completed in order — the app won't let you skip ahead.",
    "Fastest posse back at Lowell Center with a correct, complete hunt wins. Correct bonus answers shave minutes off your time.",
    "Be back at Lowell Center by 8:00 PM no matter where you are in the hunt."
  ],

  /* Heat-safety banner — shows on EVERY screen. Non-negotiable. */
  heatBanner: {
    text: "It's HOT out. Drink water and take shade breaks — pausing never costs you the win. Feeling off? Stop and call the Posse phone:",
    phoneLabel: "608-512-7989"
  },

  /* Photo reminder shown after each solve (chat label is per-city, above).
     Only used when photoCheckpoint.enabled is false. */
  photoReminder: "No cameras in this app — on purpose. Take a selfie with your ENTIRE posse in front of it and send it to",

  /* ---------------- Photo checkpoint ----------------
     When enabled, teams must tap "Sent to our group chat" after each solve
     before the next clue unlocks. The tap is self-reported (photos never touch
     the app) and is timestamped on the finish screen for staff to verify
     against the group chat.

     `instruction` supports three tokens:
       {stop} — the stop's name          {city} — the team's city name
       {chat} — the team's chat label from cities[] (e.g. New York's WhatsApp)

     !! Never put group-chat INVITE LINKS anywhere in this file — this repo is
     public, and a link would let strangers join scholars' chats. Text only. */
  photoCheckpoint: {
    enabled: true,
    instruction: "Take a selfie with your ENTIRE posse in front of {stop}, then send it to {chat}."
  },

  /* ---------------- Synchronized start ----------------
     Guarantees every team's clock starts at the same instant. Teams pick
     their city, land in a lobby with a live countdown, and clue 1 unlocks
     automatically at startAt. Elapsed time for scoring is now - startAt for
     ALL teams (wall-anchored) -- a phone that opens late skips the lobby and
     still races the same clock.

     startAt is a LOCAL time string (no timezone suffix) -- phones at the
     event are in America/Chicago, so 18:05 means 6:05 PM Madison time.
     Set startAt to null (or delete the block) for the old behavior: each
     team's clock starts when they tap Start.

     !! Config edits take ~2-5 minutes to reach phones via GitHub Pages.
     Change this by ~5:30 PM on event day, or use the staff panel's
     "Force start now (this phone)" instead. */
  sync: {
    startAt: "2026-07-14T18:05:00"
  },

  /* ---------------- Hydration breaks ----------------
     Full-screen "water break" interlude each time a team's elapsed clock
     crosses a multiple of intervalMinutes. Because the clock is wall-anchored
     (see sync above), every team pauses at the same moment -- nobody loses
     time relative to anyone else. The dismiss button stays disabled for
     minDismissSeconds so the break actually happens. */
  hydration: {
    enabled: true,
    intervalMinutes: 30,
    minDismissSeconds: 20,
    message: "Water break. Every team is pausing right now -- the clock treats everyone the same. Drink up."
  },

  /* ---------------- THE 8 STOPS (loop order) ----------------
     Loop: Lowell (610 Langdon) -> east on Langdon -> Library Mall ->
     up Bascom -> back via University Ave.

     ALL CLUE WORDING IS **DRAFT** — pending sign-off from DG and Stacy.
     Fields:
       aliases  — accepted answers; matching is forgiving (case, punctuation,
                  spaces, and a leading "the" are ignored)
       hint     — appears after `hintAfterMisses` wrong tries
       bonus    — optional; one attempt, skippable, +bonusMinutes if right
       reveal   — the resource card shown on solve (also powers guide mode)
       guideCategory — where the card lands in the post-event resource guide
  */
  stops: [
    {
      // DRAFT — NEW STOP (Ale's addition): flag for DG's sign-off
      id: "red-gym",
      name: "Red Gym",
      address: "716 Langdon St",
      mapsQuery: "Red Gym, 716 Langdon St, Madison, WI",
      clue: "It looks like a castle, but it guards no throne — find the red fortress on Langdon your Posse calls home.",
      aliases: ["red gym", "armory", "armory and gymnasium"],
      hint: "Two doors down Langdon from where you're sleeping this week.",
      bonus: { question: "What suite is the Posse office?", answers: ["239", "suite 239"] },
      guideCategory: "posse",
      reveal: {
        title: "Red Gym — your Posse home base",
        bullets: [
          "The UW Posse office is in Suite 239: study space, computers, and staff who have your back.",
          "Also home to the Multicultural Student Center, International Student Services, and the Morgridge Center for Public Service.",
          "If you only remember one building from tonight, make it this one."
        ],
        link: { label: "Posse at UW–Madison", url: "https://posseprogram.wisc.edu/" },
        verified: true // Suite 239 confirmed in the 2026 welcome packet; tenants via msc.wisc.edu + UW listings
      }
    },
    {
      // DRAFT — kept from 2025 flyer wording
      id: "terrace-chair",
      name: "Terrace chair, Alumni Park",
      address: "Alumni Park, 722 Langdon St",
      mapsQuery: "Alumni Park, Madison, WI",
      clue: "An iconic symbol of the Terrace during the spring and summer, climb to sit and take a pic on this large structure, don't be a bummer!",
      aliases: ["terrace chair", "sunburst chair", "big chair", "giant chair", "alumni park", "sunburst"],
      hint: "It's in Alumni Park, on the lake path between the Red Gym and Memorial Union.",
      bonus: { question: "What's this chair design called?", answers: ["sunburst", "sunburst chair", "the sunburst"] },
      guideCategory: "campus",
      reveal: {
        title: "Memorial Union & the Terrace",
        bullets: [
          "Free live music and lakefront nights all year — the Terrace is the best free show in Madison.",
          "Wisconsin Union runs events, student orgs, and student jobs here.",
          "Wheelhouse Studios, the art studio on the lower level, is free for current students — ceramics, painting, printmaking, and more.",
          "Those Sunburst chair colors are John Deere green and Allis-Chalmers orange — a nod to Wisconsin farming."
        ],
        link: { label: "Wisconsin Union", url: "https://union.wisc.edu/" },
        verified: true // Wheelhouse location + free student access via union.wisc.edu; chair history via Union's Terrace-chair page
      }
    },
    {
      // DRAFT — kept from 2025 flyer wording.
      // CONSTRUCTION CHECK PENDING: if the Historical Society is blocked, the
      // swap candidate is Memorial Library (728 State St, directly across the
      // mall) — largest campus library, silent stacks and carrels.
      id: "historical-society",
      name: "Wisconsin Historical Society",
      address: "816 State St",
      mapsQuery: "Wisconsin Historical Society, 816 State St, Madison, WI",
      clue: "Here at the headquarters of Wisconsin's Archives and Historical Collections, one may study on the grand second floor for more retention.",
      aliases: ["historical society", "wisconsin historical society"],
      hint: "It faces Library Mall, at the top of State Street.",
      bonus: { question: "Which floor is the grand reading room on?", answers: ["2", "second", "2nd", "second floor", "2nd floor"] },
      guideCategory: "study",
      swapCandidate: {
        name: "Memorial Library",
        address: "728 State St",
        note: "Directly across Library Mall — largest campus library, silent stacks and carrels."
      },
      reveal: {
        title: "Wisconsin Historical Society reading room",
        bullets: [
          "The grand 2nd-floor reading room is one of the most beautiful quiet study spots on campus.",
          "Free and open to the public — no history major required, just walk in with your books.",
          "Hours are reduced through 2027 while the Wisconsin History Center is built, so check before you go.",
          "Bonus: Memorial Library is directly across the mall when you need the silent stacks."
        ],
        link: { label: "Wisconsin Historical Society", url: "https://www.wisconsinhistory.org/" },
        verified: true // 2nd floor + public access + temporary hours via wisconsinhistory.org
      }
    },
    {
      // DRAFT — rewritten for 2026: store closes at 6 PM, photo is exterior
      id: "book-store",
      name: "University Book Store",
      address: "711 State St",
      mapsQuery: "University Book Store, 711 State St, Madison, WI",
      clue: "The university's hub for books, clothes, and supplies — a familiar furry guy lives inside, but he's off the clock tonight, so take your pic outside!",
      aliases: ["book store", "bookstore", "university book store", "uw bookstore", "university bookstore", "uw book store"],
      hint: "Also on Library Mall — look for the big storefront windows.",
      bonus: { question: "Who's the furry guy inside?", answers: ["bucky", "bucky badger"] },
      guideCategory: "campus",
      reveal: {
        title: "University Book Store",
        bullets: [
          "Textbooks, course supplies, and every kind of Badger gear.",
          "Say hi to the indoor Bucky statue when it's open.",
          "Price-match and rental options can save you real money on course materials."
        ],
        link: { label: "University Book Store", url: "https://www.uwbookstore.com/" },
        verified: false // VERIFY: Bucky statue still inside (staff campus-walk check)
      }
    },
    {
      // DRAFT
      id: "college-library",
      name: "College Library (Helen C. White Hall)",
      address: "600 N Park St",
      mapsQuery: "College Library, Helen C White Hall, 600 N Park St, Madison, WI",
      clue: "Down by the lake sits the library that never sleeps once the semester starts — open 24 hours, lending cameras and consoles, with a Writing Center at its heart.",
      aliases: ["college library", "helen c white", "helen white", "hcw", "helen c white hall", "college"],
      hint: "North end of Library Mall — the big building closest to the lake.",
      bonus: { question: "During fall and spring, how many hours a day is it open?", answers: ["24", "24 hours", "twenty four"] },
      guideCategory: "study",
      reveal: {
        title: "College Library — the one that pulls all-nighters with you",
        bullets: [
          "Open 24 hours a day, five nights a week (Sun–Thu) during fall and spring — no other campus library does that.",
          "Equipment checkout at the desk: laptops, iPads, cameras, chargers, even gaming consoles.",
          "DesignLab helps with media and visual projects; the Writing Center lives on the 6th floor of Helen C. White.",
          "You'll be back here Thursday morning to enroll in classes."
        ],
        link: { label: "College Library", url: "https://www.library.wisc.edu/college/" },
        verified: true // 24/5 schedule, equipment list, DesignLab, Writing Center 6171 HCW all via library.wisc.edu + writing.wisc.edu
      }
    },
    {
      // DRAFT — kept from 2025 flyer wording
      id: "lincoln",
      name: "Lincoln statue, Bascom Hill",
      address: "Bascom Hill",
      mapsQuery: "Abraham Lincoln Statue, Bascom Hill, Madison, WI",
      clue: "Go to the statue of a former president where he chills, near the top of the biggest hill of all hills.",
      aliases: ["lincoln", "abe", "abe lincoln", "abraham lincoln", "lincoln statue", "bascom", "bascom hill"],
      hint: "Climb Bascom Hill and look for the guy in the chair.",
      bonus: { question: "What's the name of the hill he watches over?", answers: ["bascom", "bascom hill"] },
      guideCategory: "campus",
      reveal: {
        title: "Bascom Hill — the heart of campus",
        bullets: [
          "Most of your classes will orbit this hill for four years.",
          "Tradition: at graduation, Badgers climb onto Abe's lap for a photo.",
          "The view down the hill to the Capitol is the classic UW postcard shot."
        ],
        link: { label: "UW–Madison campus", url: "https://www.wisc.edu/" },
        verified: true
      }
    },
    {
      // DRAFT
      id: "van-vleck",
      name: "Van Vleck Hall",
      address: "480 Lincoln Dr",
      mapsQuery: "Van Vleck Hall, 480 Lincoln Dr, Madison, WI",
      clue: "In the tall tower where the numbers reign, drop-in help awaits when problem sets bring pain.",
      aliases: ["van vleck", "vanvleck", "van vleck hall"],
      hint: "From Abe's statue, look south — the tallest tower on the hilltop.",
      bonus: { question: "What's the drop-in tutoring center inside called?", answers: ["math learning center", "mlc", "the math learning center"] },
      guideCategory: "tutoring",
      reveal: {
        title: "Van Vleck — Math Learning Center",
        bullets: [
          "Free drop-in tutoring in room B224 for a long list of math courses — no appointment needed.",
          "The Proof Table (B227) is dedicated help for proof-based 300+ level courses; upper-level students swear by it.",
          "Going early in the semester beats cramming before the midterm."
        ],
        link: { label: "Math Learning Center", url: "https://www.math.wisc.edu/undergraduate/mlc/" },
        verified: true // B224 drop-in, Proof Table name + room via math.wisc.edu
      }
    },
    {
      // DRAFT
      id: "chemistry",
      name: "Chemistry Building",
      address: "1101 University Ave",
      mapsQuery: "Chemistry Building, 1101 University Ave, Madison, WI",
      clue: "Where beakers bubble and elements combine, this building's Learning Center will save you at exam time.",
      aliases: ["chemistry", "chemistry building", "chem", "chem building"],
      hint: "Head down the hill to University Avenue.",
      bonus: { question: "What's the tutoring center inside called?", answers: ["chemistry learning center", "chem learning center", "clc", "the chemistry learning center"] },
      guideCategory: "tutoring",
      reveal: {
        title: "Chemistry Learning Center",
        bullets: [
          "Small-group support for general and organic chemistry (Chem 103/104 and 343/345) — apply on their site, it's worth it.",
          "The CLC itself sits in the Medical Sciences Center next door, but this complex is where you'll likely have chem class freshman year.",
          "Last stop: now RACE back to Lowell Center!"
        ],
        link: { label: "Chemistry Learning Center", url: "https://clc.chem.wisc.edu/" },
        verified: true // scope (103/104, 343/345) + Medical Sciences Center location via clc.chem.wisc.edu
      }
    }
  ],

  /* ---------------- GUIDE MODE ----------------
     After the hunt (from guideStartDate), the site becomes the
     "UW Posse Campus Resource Guide": the 8 stop reveal cards above plus
     these extras, grouped by category.

     verified: false  ==> shows an "UNVERIFIED" tag in the guide and is listed
     for Ale to confirm. Verify against official uw.edu/wisc.edu pages and
     link to those pages instead of hardcoding hours (hours change; links don't).
  */
  guideCategories: [
    { id: "posse",    label: "Posse" },
    { id: "tutoring", label: "Tutoring & Academic Support" },
    { id: "study",    label: "Study Spots & Making" },
    { id: "health",   label: "Health & Wellbeing" },
    { id: "food",     label: "Food & Fun" },
    { id: "campus",   label: "Campus Life" },
    { id: "programs", label: "Programs to Know" }
  ],

  guideExtras: [
    /* --- Tutoring & academic support --- */
    {
      category: "tutoring", name: "GUTS — Greater University Tutoring Service",
      where: "Student Activity Center, Office 3111, 333 East Campus Mall",
      bullets: [
        "Free, student-run tutoring: drop-in and small-group help (biology, chemistry, psychology, sociology, and more by semester).",
        "One-on-one study-skills consultations: time management, note-taking, exam prep.",
        "Also runs conversational English practice."
      ],
      link: { label: "GUTS", url: "https://guts.wisc.edu/" },
      verified: true // location, services, free via guts.wisc.edu
    },
    {
      category: "tutoring", name: "Physics Learning Center",
      where: "Rooms 2337/2338 Chamberlin Hall, 1150 University Ave",
      bullets: [
        "Free small-group learning teams and exam reviews for intro physics (103, 104, 207, 208).",
        "Led by trained peer tutors — they teach, not just answer.",
        "Especially good if physics is brand new to you."
      ],
      link: { label: "Physics Learning Center", url: "https://plc.physics.wisc.edu/" },
      verified: true // rooms, courses, free via physics.wisc.edu / plc.physics.wisc.edu
    },
    {
      category: "tutoring", name: "The Writing Center",
      where: "6171 Helen C. White Hall (6th floor), plus satellite locations",
      bullets: [
        "Free one-on-one help on any paper, at any stage — even just an outline.",
        "Satellite locations around campus in addition to the main center.",
        "Book early during midterms; slots go fast."
      ],
      link: { label: "Writing Center", url: "https://writing.wisc.edu/" },
      verified: true // 6171 HCW + satellites via writing.wisc.edu
    },
    {
      category: "tutoring", name: "Undergraduate Learning Center (College of Engineering)",
      where: "Wendt Commons, 215 N Randall Ave (drop-in on the 3rd floor)",
      bullets: [
        "Free drop-in tutoring for 50+ engineering, math, and science courses — evenings Sun–Thu.",
        "Current scholars call it the best resource for engineering students.",
        "Also offers one-on-one Tutoring by Request for students who need more."
      ],
      link: { label: "CoE Undergraduate Learning Center", url: "https://engineering.wisc.edu/student-services/undergraduate-learning-center/" },
      verified: true // location, courses, hours via engr.wisc.edu ULC pages
    },
    {
      category: "tutoring", name: "Engineering Student Center",
      where: "College of Engineering campus",
      bullets: [
        "Community hub for engineering students — advising, orgs, and caring staff.",
        "Current scholars' tip: a good first door to knock on if you feel lost in the college."
      ],
      link: { label: "College of Engineering students", url: "https://engineering.wisc.edu/" },
      verified: false // UNVERIFIED: exact location/page — word-of-mouth from current scholars
    },
    {
      category: "tutoring", name: "Cross-College Advising Service (CCAS)",
      where: "Multiple locations, incl. some residence halls",
      bullets: [
        "The leading campus resource for exploring majors and careers when you haven't declared — which is most freshmen.",
        "Professional advisors who know every major and program on campus.",
        "Recommended in your Posse welcome packet."
      ],
      link: { label: "CCAS", url: "https://ccas.wisc.edu/" },
      verified: true // description per the 2026 welcome packet; site live
    },
    {
      category: "tutoring", name: "Career Exploration Center",
      where: "114 Ingraham Hall, 1155 Observatory Dr",
      bullets: [
        "Career advising for undergrads still exploring majors and careers — no commitment required.",
        "One-on-one advisor support plus self-guided major-exploration tools.",
        "Recommended in your Posse welcome packet."
      ],
      link: { label: "Career Exploration Center", url: "https://cec.wisc.edu/" },
      verified: true // location + mission via cec.wisc.edu
    },
    {
      category: "tutoring", name: "McBurney Disability Resource Center",
      where: "702 W Johnson St, Suite 2104",
      bullets: [
        "Accommodations so every student gets equitable access, whatever the disability or condition.",
        "Start the application early — accommodations aren't retroactive.",
        "Call, text, or email to ask if you might qualify; asking costs nothing."
      ],
      link: { label: "McBurney Center", url: "https://mcburney.wisc.edu/" },
      verified: true // address + process via mcburney.wisc.edu; also linked in the welcome packet
    },
    {
      category: "tutoring", name: "Learning Support hub (all tutoring, one page)",
      where: "Online",
      bullets: [
        "The university's official directory of every tutoring and learning center.",
        "Your Posse welcome packet points here too — bookmark it for any course."
      ],
      link: { label: "UW Learning Support", url: "https://learningsupport.wisc.edu/" },
      verified: true // referenced by the welcome packet FAQ; site live
    },

    /* --- Study spots & making --- */
    {
      category: "study", name: "Memorial Library",
      where: "728 State St",
      bullets: [
        "The biggest library on campus — silent stacks and solo carrels.",
        "Where you go when you need zero distractions."
      ],
      link: { label: "Memorial Library", url: "https://www.library.wisc.edu/memorial/" },
      verified: true
    },
    {
      category: "study", name: "Wendt Commons + UW Makerspace",
      where: "215 N Randall Ave",
      bullets: [
        "Engineering-side study commons with the ULC drop-in tutoring upstairs.",
        "The UW Makerspace: 3D printers, laser cutters, and tools — with training so you can actually use them."
      ],
      link: { label: "UW Makerspace", url: "https://making.engr.wisc.edu/" },
      verified: true // Wendt address via ULC pages; makerspace site live
    },
    {
      category: "study", name: "Grainger Hall (business library + bookable rooms)",
      where: "975 University Ave",
      bullets: [
        "Business school building with a great library — open to every major.",
        "Study rooms are reservable by any UW student with a Wiscard (up to 2 hours, book a week ahead).",
        "Current scholars' tip: quiet, professional rooms — great for phone and Zoom interviews."
      ],
      link: { label: "Business Library", url: "https://www.library.wisc.edu/business/" },
      verified: true // room-reservation policy via library.wisc.edu/business; interview use is a scholar tip
    },
    {
      category: "study", name: "Discovery Building (WID) commons",
      where: "330 N Orchard St",
      bullets: [
        "Bright, modern ground-floor commons open to students.",
        "Coffee downstairs, whiteboards, and it's never as crowded as the libraries."
      ],
      link: { label: "Discovery Building", url: "https://wid.wisc.edu/" },
      verified: false // UNVERIFIED: commons access details — popular word-of-mouth study spot
    },

    /* --- Health & wellbeing --- */
    {
      category: "health", name: "University Health Services (UHS)",
      where: "333 East Campus Mall (main clinic); Lakeshore clinic in Dejope Hall 1104",
      bullets: [
        "Medical care AND mental health care — most services cost nothing extra because your fees cover them.",
        "Free flu shots at campus vaccine clinics every fall.",
        "Check-in isn't intuitive: book first online through the MyUHS portal (or the phone line on their site), then check in at your appointment floor."
      ],
      link: { label: "UHS", url: "https://www.uhs.wisc.edu/" },
      verified: true // locations, services, no-cost via uhs.wisc.edu
    },
    {
      category: "health", name: "Sex Out Loud",
      where: "Student Activity Center, 333 East Campus Mall",
      bullets: [
        "Student org offering free safer-sex supplies (order form online) and judgment-free education.",
        "Workshops, events, and one-on-one questions welcome."
      ],
      link: { label: "Sex Out Loud (UW student org)", url: "https://win.wisc.edu/organization/sexoutloud" },
      verified: true // services via sexoutloud.org; official UW listing on WIN
    },
    {
      category: "health", name: "The Nick & the Bakke (rec centers)",
      where: "Nicholas Recreation Center, 797 W Dayton St; Bakke Recreation & Wellbeing Center on the lakeshore side",
      bullets: [
        "Gym access to both is already included in your student fees.",
        "Group fitness classes cost extra — but every class is free to try during the first week of each semester.",
        "Climbing wall, pools, ice rink, intramurals, esports — go explore both."
      ],
      link: { label: "Rec Well", url: "https://recwell.wisc.edu/" },
      verified: true // fitness-class pricing + free first week via recwell.wisc.edu
    },

    /* --- Food & fun --- */
    {
      category: "food", name: "The Open Seat food pantry",
      where: "Student Activity Center, 3rd floor, 333 East Campus Mall",
      bullets: [
        "Free food pantry run by student government (ASM) — every UW student is eligible, no questions asked, no income verification.",
        "Produce, staples, and hygiene products."
      ],
      link: { label: "The Open Seat", url: "https://asm.wisc.edu/the-open-seat/support/" },
      verified: true // floor + eligibility via asm.wisc.edu
    },
    {
      category: "food", name: "Babcock Dairy Store",
      where: "1605 Linden Dr",
      bullets: [
        "Legendary ice cream made on campus since 1951 — the recipe hasn't changed.",
        "Around 20 flavors at a time, made by student employees.",
        "A scoop after a long week is a UW tradition."
      ],
      link: { label: "Babcock Dairy Store", url: "https://babcockdairystore.wisc.edu/" },
      verified: true // address + history via babcockdairystore.wisc.edu
    },

    /* --- Programs to know (from the welcome packet) --- */
    {
      category: "programs", name: "FIGs — First-Year Interest Groups",
      where: "Enrollment option for first-years",
      bullets: [
        "Clusters of (usually) three linked courses you take with the same small cohort — instant study group.",
        "FIGs have been shown to boost GPAs, and every FIG class counts toward a gen-ed requirement.",
        "Posse tip from your welcome packet: tell staff if you see one you like — they may be able to reserve a spot."
      ],
      link: { label: "FIGs", url: "https://figs.wisc.edu/" },
      verified: true // per the 2026 welcome packet + figs.wisc.edu
    },
    {
      category: "programs", name: "Undergraduate Research Scholars (URS)",
      where: "Program for first- and second-years",
      bullets: [
        "Earn course credit (2–3 credits) doing real research with UW faculty as a freshman.",
        "Not just for STEM — projects exist in every discipline, and no experience is necessary.",
        "One of the high-impact practices your Posse welcome packet encourages."
      ],
      link: { label: "URS", url: "https://urs.ls.wisc.edu/" },
      verified: true // per the 2026 welcome packet (urs.ls.wisc.edu)
    },
    {
      category: "programs", name: "Learning & Theme Communities",
      where: "Residence halls",
      bullets: [
        "Live with students who share an interest — from BioHouse to Multicultural Learning Community to StartUp.",
        "Posse Scholars have priority for these communities — tell Posse staff if you want one.",
        "One of the high-impact practices from your welcome packet."
      ],
      link: { label: "Living Learning Communities", url: "https://www.housing.wisc.edu/undergraduate/communities/" },
      verified: true // priority + options per the 2026 welcome packet; URL is housing's current communities page
    },
    {
      category: "programs", name: "Scholarships beyond Posse",
      where: "Online",
      bullets: [
        "Your Posse Scholarship covers tuition — housing, books, and other expenses are on you, and more aid exists.",
        "The welcome packet's advice: apply for other UW scholarships you may be eligible for.",
        "Start at the official scholarships page (and remember FAFSA is required every year)."
      ],
      link: { label: "UW scholarships", url: "https://financialaid.wisc.edu/types-of-aid/scholarships/" },
      verified: true // per the 2026 welcome packet FAQ
    },
    {
      category: "programs", name: "CoE research mentorship program",
      where: "College of Engineering",
      bullets: [
        "Newer research mentorship program in the College of Engineering.",
        "Current scholars say it beats URS for engineering students — word-of-mouth tip; ask at the Engineering Student Center."
      ],
      link: { label: "College of Engineering", url: "https://engineering.wisc.edu/" },
      verified: false // UNVERIFIED: program name — word-of-mouth from current scholars
    },

    /* --- Posse --- */
    {
      category: "posse", name: "UW Posse Program office",
      where: "Red Gym, Suite 239, 716 Langdon St",
      bullets: [
        "Your home base: computer space, study space, and Posse staff.",
        "UW–Madison hosts the largest Posse program in the country — 160–180 scholars on campus.",
        "Posse phone (call/text): 608-512-7989. Bookmark the program site for events and staff contacts."
      ],
      link: { label: "posseprogram.wisc.edu", url: "https://posseprogram.wisc.edu/" },
      verified: true // suite, scale, site all per the 2026 welcome packet
    }
  ],

  /* ---------------- P2: OPTIONAL LOGGING (ships OFF) ----------------
     When enabled, each solve/bonus/finish fires a fire-and-forget POST to a
     Google Form. Silent on failure; never blocks gameplay; logs ONLY
     {city, stop, event, elapsedSeconds} — nothing personal.
     Wiring recipe: HANDOFF.md ("P2 logging in 5 minutes").               */
  logging: {
    enabled: false,
    formActionUrl: "",   // https://docs.google.com/forms/d/e/FORM_ID/formResponse
    fields: {            // entry.xxxxx IDs from a prefilled link
      city: "",
      stop: "",
      event: "",
      elapsedSeconds: ""
    }
  },

  /* Mission control (P2): the published responses sheet, shared as
     anyone-with-link viewer. Used only by mission-control.html. */
  missionControl: {
    sheetId: "",         // from the sheet URL
    pollSeconds: 30
  }
};
