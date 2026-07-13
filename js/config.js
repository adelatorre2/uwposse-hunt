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

  /* Photo reminder shown after each solve (chat label is per-city, above). */
  photoReminder: "No cameras in this app — on purpose. Take a selfie with your ENTIRE posse in front of it and send it to",

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
          "The building is packed with student services worth knowing — come wander it in the fall.",
          "If you only remember one building from tonight, make it this one."
        ],
        link: { label: "Posse at UW–Madison", url: "https://posseprogram.wisc.edu/" },
        verified: false // VERIFY: current Suite 239 + other tenants (e.g., MSC?)
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
          "Wheelhouse Studios inside is an art space anyone can use."
        ],
        link: { label: "Wisconsin Union", url: "https://union.wisc.edu/" },
        verified: false // VERIFY: Wheelhouse still in Memorial Union
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
          "Free to use — no history major required, just walk in with your books.",
          "Bonus: Memorial Library is directly across the mall when you need the silent stacks."
        ],
        link: { label: "Wisconsin Historical Society", url: "https://www.wisconsinhistory.org/" },
        verified: false // VERIFY: reading room floor + public access
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
        title: "College Library — the 24-hour one",
        bullets: [
          "The only 24-hour library during fall and spring semesters.",
          "Equipment checkout at the desk: chargers, cameras, and more.",
          "The Design Lab helps with media and visual projects; the Writing Center lives upstairs in Helen C. White.",
          "You'll be back here Thursday morning to enroll in classes."
        ],
        link: { label: "College Library", url: "https://www.library.wisc.edu/college/" },
        verified: false // VERIFY: equipment list, Design Lab, Writing Center floor
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
          "Free drop-in tutoring for intro math courses — no appointment needed.",
          "Upper-level students swear by the help tables for 300+ level courses.",
          "Going early in the semester beats cramming before the midterm."
        ],
        link: { label: "Math Learning Center", url: "https://math.wisc.edu/undergraduate/mlc/" },
        verified: false // VERIFY: MLC URL + 300-level table name
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
          "Free support for general chemistry courses — small groups, real help.",
          "You'll likely have class in this complex freshman year.",
          "Last stop: now RACE back to Lowell Center!"
        ],
        link: { label: "Chemistry Learning Center", url: "https://clc.chem.wisc.edu/" },
        verified: false // VERIFY: CLC scope + URL
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
      where: "Student Activity Center, 333 East Campus Mall",
      bullets: [
        "Free peer tutoring across tons of intro courses.",
        "Also runs study-skills and conversational-language programs.",
        "Sign up online; drop-in options vary by semester."
      ],
      link: { label: "GUTS", url: "https://guts.wisc.edu/" },
      verified: false
    },
    {
      category: "tutoring", name: "Physics Learning Center",
      where: "Chamberlin Hall",
      bullets: [
        "Small-group help for intro physics courses.",
        "Especially good if physics is new to you — they teach, not just answer."
      ],
      link: { label: "Physics Learning Center", url: "https://www.physics.wisc.edu/undergrads/plc/" },
      verified: false
    },
    {
      category: "tutoring", name: "The Writing Center",
      where: "Helen C. White Hall + satellite locations (incl. residence halls)",
      bullets: [
        "Free one-on-one help on any paper, at any stage — even just an outline.",
        "Satellite locations around campus, including some residence halls.",
        "Book early during midterms; slots go fast."
      ],
      link: { label: "Writing Center", url: "https://writing.wisc.edu/" },
      verified: false
    },
    {
      category: "tutoring", name: "Undergraduate Learning Center (College of Engineering)",
      where: "Wendt Commons area (verify building)",
      bullets: [
        "The go-to help center for engineering coursework.",
        "Current scholars call it the best resource for engineering students."
      ],
      link: { label: "CoE Undergraduate Learning Center", url: "https://engineering.wisc.edu/" },
      verified: false // VERIFY: exact building/URL — notes say "Wendt Commons," transcription garbled
    },
    {
      category: "tutoring", name: "Engineering Student Center",
      where: "College of Engineering (verify building)",
      bullets: [
        "Community hub for engineering students — advising, orgs, and caring staff.",
        "A good first door to knock on if you're lost in the college."
      ],
      link: { label: "College of Engineering students", url: "https://engineering.wisc.edu/" },
      verified: false
    },
    {
      category: "tutoring", name: "Cross-College Advising Service (CCAS)",
      where: "Multiple locations, incl. some residence halls",
      bullets: [
        "Advisors for students who haven't declared a major — which is most freshmen.",
        "They help you explore without pressure; from the welcome packet."
      ],
      link: { label: "CCAS", url: "https://ccas.wisc.edu/" },
      verified: false
    },
    {
      category: "tutoring", name: "Career Exploration Center",
      where: "Ingraham Hall (verify)",
      bullets: [
        "Helps you figure out majors and careers when you genuinely don't know yet.",
        "Low-stakes: assessments, conversations, no commitment."
      ],
      link: { label: "Career Exploration Center", url: "https://cec.wisc.edu/" },
      verified: false
    },
    {
      category: "tutoring", name: "McBurney Disability Resource Center",
      where: "702 W Johnson St (verify)",
      bullets: [
        "Accommodations for disabilities, chronic conditions, ADHD, anxiety, and more.",
        "Start the paperwork early — accommodations aren't retroactive."
      ],
      link: { label: "McBurney Center", url: "https://mcburney.wisc.edu/" },
      verified: false
    },
    {
      category: "tutoring", name: "Learning Support hub (all tutoring, one page)",
      where: "Online",
      bullets: [
        "The university's official directory of every tutoring and learning center.",
        "Bookmark this — it's the master list when you need help in any course."
      ],
      link: { label: "UW Learning Support", url: "https://learningsupport.wisc.edu/" },
      verified: false
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
      verified: false
    },
    {
      category: "study", name: "Wendt Commons + CoE makerspace",
      where: "215 N Randall Ave (verify)",
      bullets: [
        "Engineering-side study commons.",
        "The College of Engineering makerspace lives nearby — 3D printers, tools, training."
      ],
      link: { label: "UW Makerspace", url: "https://making.engr.wisc.edu/" },
      verified: false
    },
    {
      category: "study", name: "Grainger Hall (business library + interview rooms)",
      where: "975 University Ave",
      bullets: [
        "Business school building with a great library.",
        "Current scholars' tip: the dedicated interview rooms are bookable by ALL majors — use them for phone/Zoom interviews.",
        "Quiet, professional, and underused."
      ],
      link: { label: "Business Library", url: "https://www.library.wisc.edu/business/" },
      verified: false // VERIFY: all-majors booking policy
    },
    {
      category: "study", name: "Discovery Building (WID) commons",
      where: "330 N Orchard St",
      bullets: [
        "Bright, modern ground-floor commons open to students.",
        "Coffee downstairs, whiteboards, and it's never as crowded as the libraries."
      ],
      link: { label: "Discovery Building", url: "https://wid.wisc.edu/" },
      verified: false
    },

    /* --- Health & wellbeing --- */
    {
      category: "health", name: "University Health Services (UHS)",
      where: "333 East Campus Mall",
      bullets: [
        "Medical care AND mental health care, already covered by your fees — most visits cost nothing extra.",
        "Free flu shots every fall.",
        "Check-in isn't intuitive: book online or by phone first, then check in at your appointment floor."
      ],
      link: { label: "UHS", url: "https://www.uhs.wisc.edu/" },
      verified: false
    },
    {
      category: "health", name: "Sex Out Loud",
      where: "Student Activity Center, 333 East Campus Mall",
      bullets: [
        "Student org offering free safer-sex supplies and judgment-free education.",
        "Workshops and one-on-one questions welcome."
      ],
      link: { label: "Sex Out Loud", url: "https://sexoutloud.rso.wisc.edu/" },
      verified: false
    },
    {
      category: "health", name: "The Nick & the Bakke (rec centers)",
      where: "Nicholas Recreation Center (797 W Dayton St) & Bakke Recreation + Wellbeing Center (827 W Dayton St area — verify)",
      bullets: [
        "Two huge rec centers — gym access is included with your student fees.",
        "Group fitness classes are included for students too (current scholars' favorite).",
        "Climbing wall, pools, courts, esports — go explore both."
      ],
      link: { label: "Rec Well", url: "https://recwell.wisc.edu/" },
      verified: false // VERIFY: group fitness included; Bakke address
    },

    /* --- Food & fun --- */
    {
      category: "food", name: "The Open Seat food pantry",
      where: "Student Activity Center, 333 East Campus Mall (verify floor)",
      bullets: [
        "Free food pantry run by student government (ASM) for any student, no questions asked.",
        "Groceries, produce, and essentials."
      ],
      link: { label: "The Open Seat", url: "https://www.asm.wisc.edu/resources/openseat/" },
      verified: false
    },
    {
      category: "food", name: "Babcock Hall Dairy Store",
      where: "1605 Linden Dr",
      bullets: [
        "Legendary ice cream made on campus by the dairy program.",
        "A scoop after a long week is a UW tradition."
      ],
      link: { label: "Babcock Dairy Store", url: "https://babcockhalldairystore.wisc.edu/" },
      verified: false
    },

    /* --- Programs to know (from the welcome packet) --- */
    {
      category: "programs", name: "FIGs — First-Year Interest Groups",
      where: "Enrollment option for first-years",
      bullets: [
        "Take 2–3 linked classes with the same ~20 students — instant study group.",
        "Great for meeting people outside Posse in a low-pressure way."
      ],
      link: { label: "FIGs", url: "https://figs.wisc.edu/" },
      verified: false
    },
    {
      category: "programs", name: "Undergraduate Research Scholars (URS)",
      where: "Program for first- and second-years",
      bullets: [
        "Get paid course credit to work on real research as a freshman.",
        "No experience required — that's the point."
      ],
      link: { label: "URS", url: "https://urs.wisc.edu/" },
      verified: false
    },
    {
      category: "programs", name: "Learning & Theme Communities",
      where: "Residence halls",
      bullets: [
        "Live with students who share an interest or identity focus.",
        "From the welcome packet — worth a look before housing deadlines."
      ],
      link: { label: "Living Learning Communities", url: "https://www.housing.wisc.edu/residence-halls/learning-communities/" },
      verified: false
    },
    {
      category: "programs", name: "CoE research mentorship program",
      where: "College of Engineering",
      bullets: [
        "Newer research mentorship program in the College of Engineering.",
        "Current scholars say it beats URS for engineering students — word-of-mouth tip; ask the Engineering Student Center."
      ],
      link: { label: "College of Engineering", url: "https://engineering.wisc.edu/" },
      verified: false // word-of-mouth from current scholars; name not confirmed
    },

    /* --- Posse --- */
    {
      category: "posse", name: "UW Posse Program office",
      where: "Red Gym, Suite 239, 716 Langdon St",
      bullets: [
        "Your home base: study space, computers, staff, and your people.",
        "Posse phone (call/text): 608-512-7989.",
        "Bookmark the program site for events and staff contacts."
      ],
      link: { label: "posseprogram.wisc.edu", url: "https://posseprogram.wisc.edu/" },
      verified: false
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
