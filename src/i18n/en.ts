// English copy for every page. id.ts must have the same shape (TypeScript
// checks it). Wrap words in *asterisks* to set them in the italic accent
// style; see rich() in src/components/Rich.tsx.
//
// Blog posts, case studies and the client logos are not here: they live in
// /content and are edited in Keystatic (/keystatic).

export const en = {
  meta: {
    siteName: "Bliss Digital",
    home: {
      title: "Bliss Digital | Digital Marketing Agency, Google Partner Indonesia",
      description:
        "You focus on running your business. We make sure it reaches the right people, at the right time, with the right message. Google Ads and websites, run for you.",
    },
    about: {
      title: "About Us",
      description:
        "Bliss Digital is a Google Partner marketing agency in South Jakarta. We run Google Ads and websites for businesses that would rather focus on their work.",
    },
    services: {
      title: "Services",
      description:
        "Google Ads, website creation and social media management, planned and run for you by Bliss Digital in Jakarta.",
    },
    cases: {
      title: "Case Studies",
      description: "How Bliss Digital helps businesses reach the right people, at the right time, with the right message.",
    },
    blog: {
      title: "Blog",
      description: "Plain-word guides to Google Ads, tracking and websites from the Bliss Digital team.",
    },
    contact: {
      title: "Contact Us",
      description: "Tell us about your business and we’ll be in touch within 24–48 hours.",
    },
    privacy: {
      title: "Privacy Policy",
      description: "How Bliss Digital collects, uses and protects the information you share with us.",
    },
    roas: {
      title: "Free ROAS Calculator for Google and Meta Ads",
      description:
        "Work out what your Google and Meta ads bring back in rupiah: your ROAS, your break-even ROAS and your profit. Free, no sign-up.",
    },
  },

  nav: {
    home: "Bliss Digital, home",
    about: "About Us",
    services: "Services",
    cases: "Case Studies",
    blog: "Blog",
    // Free tools, in the navbar's Tools menu. Each is one English page under /tools.
    tools: "Tools",
    toolList: [
      { href: "/en/tools/ai-readiness", name: "AI Readiness Check", note: "Can AI read your website? Free check." },
      { href: "/en/tools/roas-calculator", name: "ROAS Calculator", note: "Are your ads paying for themselves? Free calculator." },
    ],
    contact: "Contact Us",
    cta: "Let’s Chat",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    main: "Main",
    language: "Language",
    chooseLanguage: "Choose language",
    backToTop: "Back to top",
  },

  footer: {
    copyright: "© 2026 Bliss Digital Agency. All rights reserved.",
    // Followed by the month the site was last built (src/lib/updated.ts)
    updated: "Last updated",
    links: "Footer",
    homeLink: "Home",
    privacy: "Privacy Policy",
    cookieSettings: "Cookie Settings",
    newTab: "opens in a new tab",
  },

  // Cookie banner (src/components/consent.tsx). Shown until the visitor chooses.
  consent: {
    label: "Cookie Choice",
    text: "With your permission, we use Google Analytics and the Meta Pixel to see how visitors use this site and to measure our ads. Nothing loads until you choose.",
    policy: "Privacy Policy",
    accept: "Accept",
    decline: "Decline",
  },

  common: {
    letsChat: "Let’s Chat",
    startProject: "Start Your Project",
    ourServices: "Our Services",
    viewMore: "View More",
    partnerAlt: "Google Partner (opens in a new tab)",
    whatsappUs: "WhatsApp Us",
    // Floating WhatsApp button: its label for screen readers, and the message it starts
    whatsappFloat: "Chat with us on WhatsApp",
    whatsappGreeting: "Hi Bliss, I’d like to know more about your services.",
    sampleCases: "Sample content · replace before launch",
    sampleCase: "Sample case study · replace before launch",
    draftPosts: "Draft articles · review before launch",
    draftPost: "Draft article · review before launch",
    nextCase: "Next Case Study",
    allCases: "All Case Studies",
    nextPost: "Next Article",
    allPosts: "All Articles",
    minRead: "min read",
  },

  // Burgundy opening screen with the logo (homepage)
  intro: {
    name: "Bliss",
    nameEm: "Digital",
  },

  hero: {
    pill: "Digital Marketing Agency",
    title: "Bliss",
    titleEm: "Digital",
    lede: "You focus on running your business. We make sure it reaches the right people, at the right time, with the right message.",
    // Decorative mock-ups of the kind of work we run (examples, not results)
    mock: {
      query: "dentist near me",
      sponsored: "Sponsored",
      clinic: "Sehat Dental Clinic",
      adTitle: "Gentle Dental Care in South Jakarta · Book Today",
      adDesc: "Same-day appointments, open 7 days. Check-ups, fillings and whitening by friendly dentists.",
      adLinks: "Book online · Prices · Location",
      rank: "#1 on Google",
      order: "Order now",
      caption: "Your morning cup, ready before you are ☕",
      statsLabel: "Bookings · this month",
      speed: "Website speed",
      found: "Found on Google & AI answers",
    },
  },

  tagline: ["Right people.", "Right time.", "*Right message.*"],

  // Faint examples that float around the tagline as each line settles
  // (decorative, hidden from screen readers)
  taglineFloat: {
    audience: "Audience",
    audienceText: "Looking for what you sell",
    buyersCap: "Example · likely buyers among everyone online",
    location: "Location",
    locationText: "South Jakarta",
    season: "Season",
    seasonText: "Ramadan peak",
    hoursCap: "Example · searches by hour of the day",
    sponsored: "Sponsored",
    adTitle: "Rooms 5 minutes from the beach",
    adDesc: "Rated 4.8 by guests. Book on WhatsApp.",
    adKept: "Kept after testing",
    adCap: "Example ad",
  },

  clients: {
    eyebrow: "Our Clients",
    title: "Brands that",
    titleEm: "grew with us",
    lede: "These are brands we’ve managed and helped grow, in many different industries. For each one, the same small team stays close from the first call to every regular review.",
  },

  // Homepage version of the About block
  aboutHome: {
    titleA: "A Google Partner agency",
    titleB: "*based in Indonesia*",
    text: "We run Google Ads and websites for businesses in hospitality, education, events, FMCG, and more. Most of our clients have one location. We *check the tracking before we spend*, and we explain every result in plain words.",
  },

  about: {
    eyebrow: "About Us",
    titleA: "Built on",
    titleB: "a simple *belief*",
    text: "At Bliss, we believe good digital marketing starts with doing the *right things*, the *right way.*",
    imageAlt: "A smiling woman working on her laptop at home",
    stats: [
      { value: "3+", label: "Years of|experience" },
      { value: "50M+", label: "Accounts reached|across all platforms" },
      { value: "100+", label: "Successful|projects" },
    ],
  },

  services: {
    eyebrow: "Our Services",
    titleA: "Digital marketing,",
    titleB: "done *for you*",
    lede: "You focus on your business. We handle the marketing, from the first plan to the daily work.",
    railLabel: "Services",
    google: {
      title: "Google Ads",
      sub: "Let us run it for you, or choose a consultation or training.",
      tabsLabel: "Ways to work with us on Google Ads",
      tabs: [
        {
          id: "managed",
          tab: "Fully Managed",
          plan: "Fully Managed by Bliss",
          desc: "We plan, build, and run your campaigns every day. Monthly subscription.",
          button: "Ask About Full Management",
          service: "google-ads",
          items: [
            "Right people: audience and keyword research",
            "Right time: schedules, seasons, and budget pacing",
            "Right message: ad copy and creative testing",
            "Tracking check before any spend",
            "A regular 360 review of your results",
          ],
        },
        {
          id: "consult",
          tab: "Consultation",
          plan: "In-Depth Consultation",
          desc: "For businesses that run Google Ads themselves and want an expert analysis. You get a written action plan.",
          button: "Ask About Consultation",
          service: "consultation",
          items: [
            "Conversion tracking check and setup",
            "GA4 setup and reports",
            "Campaign performance analysis",
            "Account structure and budget review",
          ],
        },
        {
          id: "training",
          tab: "Training",
          plan: "Google Ads Training",
          desc: "For company teams and individuals who want to run Google Ads themselves.",
          button: "Ask About Training",
          service: "training",
          items: [
            "Training for company teams",
            "Training for individuals",
            "Content matched to your level",
            "Practice on your own account where possible",
          ],
        },
      ],
    },
    web: {
      title: "Website Creation",
      sub: "A website that people and AI search tools can find, and that turns visitors into customers.",
      plan: "Fully Built by Bliss",
      desc: "We handle every step, from the first plan to launch day. We set your website up so Google and AI tools, such as ChatGPT, Gemini, and Google AI Overviews, can read it clearly.",
      button: "Ask About a New Website",
      items: [
        "Plan, write, design, and build every page",
        "Found on Google (SEO): fast pages, clear structure, and the right search words",
        "Found in AI answers (GEO): clear answers and business details that AI tools can read",
        "A clear path to WhatsApp, booking, or a form",
        "GA4 and conversion tracking set up at launch",
        "Every page tested before we put the website live",
      ],
    },
    social: {
      title: "Social Media Management",
      sub: "Instagram and TikTok, planned and posted for you by Bliss.",
      plan: "Planned and Posted by Bliss",
      desc: "We run your Instagram and TikTok from plan to post. Monthly subscription.",
      button: "Ask About Social Media",
      items: [
        "A monthly content plan built around your goals and seasons",
        "Copywriting and captions in your brand’s voice",
        "Post, carousel and short video design",
        "Scheduling and posting",
        "Replies to comments and messages",
        "A monthly report on reach, engagement and what to post next",
      ],
    },
  },

  why: {
    eyebrow: "Why Us",
    titleA: "You run the business.",
    titleB: "We run the marketing.",
    lede: "One team handles your ads, website, and social media. We take care of the daily work, and we explain every result in plain words.",
    example: "Example",
    people: {
      label: "Right People",
      title: "We find the people most likely to buy",
      body: "We study your customers: what they search for, what they like, and where they spend time. Then we show your ads to them, not to everyone.",
      rows: ["Everyone online", "Looking for what you sell", "Ready to buy"],
      sig: "The right *people.*",
    },
    time: {
      label: "Right Time",
      title: "We reach them when they are ready",
      body: "We plan around the hours, days, and seasons when your customers decide. More of your budget goes to those moments.",
      days: ["M", "T", "W", "T", "F", "S", "S"],
      hours: ["AM", "Noon", "PM", "Night"],
      note: "Example · dark = when customers decide",
      sig: "The right *time.*",
    },
    message: {
      label: "Right Message",
      title: "We say what makes them choose you",
      body: "We write ads that answer your customer’s real questions. We test them, keep the messages that work, and replace the ones that do not.",
      a: "Ad message A",
      aText: "Price and offer first",
      b: "Ad message B",
      bText: "Location and reviews first",
      replace: "Replace",
      keep: "Keep",
      sig: "The right *message.*",
    },
    numbers: {
      label: "Clear Numbers",
      title: "We count what matters to your business",
      body: "Before any spend, we agree on one goal, such as sales, leads, or bookings. Then we check that it is tracked correctly. If we cannot install tracking ourselves, we tell you what we can and cannot see.",
      chips: [
        ["Goal", "Leads"],
        ["1", "Check the tracking"],
        ["2", "Test one real action"],
        ["Go", "Turn on the ads"],
      ],
      sig: "Tracking *first.*",
    },
    reports: {
      label: "Honest Reports",
      title: "We tell you when it is not working",
      body: "Our regular 360 review looks at your ads, tracking, website, content, and budget together. When something does not work, we tell you early and show you what we will change.",
      now: "Now",
      nowText: "Result is below target",
      next: "Next",
      nextText: "New ad message, ready to test",
      needsChange: "Needs change",
      ready: "Ready",
      sig: "Honest results, *clear next steps.*",
    },
    ownership: {
      label: "Your Ownership",
      title: "Your accounts stay yours",
      body: "Your Google Ads and Analytics accounts are in your name. You pay ad spend directly to the platform, and you can log in at any time.",
      owner: "Owner on every account: your business",
      key: "Your data, *your access*",
    },
  },

  cases: {
    eyebrow: "Case Studies",
    title: "Case",
    titleEm: "studies",
    lede: "Partner with a team that treats your growth with the care it deserves. We combine smart strategy, creative execution, and honest communication to help your business move forward with clarity.",
    pageTitle: "Results we helped *build*",
    pageLede: "Real problems, clear plans, and the numbers that changed. See how we work with businesses like yours.",
  },

  faq: {
    eyebrow: "FAQ",
    title: "Questions clients *ask us*",
    lede: "Cannot find your answer?",
    ledeLink: "Message us on WhatsApp.",
    items: [
      {
        q: "What does “fully managed” include?",
        a: [
          "For Google Ads, we plan, build, and run your campaigns every day. We find the right people, choose the right time, and write and test the right message. Before any spend, we check your tracking. We review your results regularly and make changes early when something does not work.",
        ],
      },
      {
        q: "How much of my time will this take?",
        a: [
          "Very little. After the first call and the setup, we handle the daily work. We need you for the regular review and to approve new offers or ad messages.",
        ],
      },
      {
        q: "How do we start?",
        a: [
          "Message us on WhatsApp or through the contact form. We will have a short call to learn about your business, your customers, and your goals. After that, we send a proposal with the plan, the timeline, and the fee.",
        ],
      },
      {
        q: "How much does it cost?",
        a: [
          "Our fee depends on the service you choose and the size of the work. Your ad budget is separate, and you pay it directly to Google.",
          "We share the full price in the proposal before you commit.",
        ],
      },
      {
        q: "How do you report results?",
        a: [
          "We agree on one goal with you first, such as sales, leads, or bookings. We then run a full 360 review of your results on a regular basis. It covers your ads, tracking, website, content, and budget. We present it to you and explain it in plain words.",
        ],
      },
      {
        q: "What happens if the results are not good?",
        a: ["We tell you clearly and early. We explain what we think went wrong, and we show you what we will change."],
      },
    ],
  },

  cta: {
    title: "Focus on your business.",
    titleEm: "Let us handle the marketing.",
    servicesTitle: "Not sure which service you need?",
    servicesTitleEm: "Tell us your goal. We’ll suggest a plan.",
  },

  contact: {
    eyebrow: "Contact Us",
    title: "Let’s talk about",
    titleEm: "your business",
    lede: "Fill out the form below and tell us what you need help with.",
    name: "Name*",
    namePlaceholder: "John Doe",
    nameError: "Please add your name.",
    whatsapp: "WhatsApp number (optional)",
    whatsappPlaceholder: "+62 812-3456-7890",
    email: "Email*",
    emailPlaceholder: "name@email.com",
    emailError: "Please add a valid email.",
    website: "Company website",
    websitePlaceholder: "companysite.com",
    service: "I need help with*",
    servicePlaceholder: "Select service",
    serviceError: "Please choose a service.",
    // value = what the team sees in the Google Form; key = #service= links
    services: [
      { key: "google-ads", label: "Google Ads" },
      { key: "website", label: "Website" },
      { key: "social-media", label: "Social media" },
      { key: "consultation", label: "Google Ads consultation or training" },
      { key: "not-sure", label: "Not sure yet" },
    ],
    message: "How can we help?",
    messagePlaceholder: "Describe your project...",
    submit: "Submit",
    sending: "Sending...",
    sent: "Thank you, {name}. We’ll be in touch within 24–48 hours.",
    failed: "We couldn’t send your message. Please try again, or email us at admin@blissdigital.id.",
    eta: "We’ll be in touch within 24–48 hours.",
    privacyA: "Your information will be used solely to follow up on your inquiry.",
    privacyB: "For more details, please refer to our",
    privacyLink: "Privacy Policy",
  },

  aboutPage: {
    eyebrow: "About Us",
    title: "A small team that *stays close*",
    lede: "We started small and grew alongside the brands we work with. Today we run Google Ads, websites and social media for businesses across Indonesia.",
    storyEyebrow: "Our Story",
    storyText:
      "Most business owners don’t have time to learn ad platforms, read dashboards and rewrite their website. Bliss Digital does that work for them, every day, and explains the results in plain words. The agency is a Google Partner based in South Jakarta and works with businesses across Indonesia: hotels, clinics, food brands, retailers and manufacturers. Most clients have one location, and the same small team stays close to each account, from the first call to every regular review.",
    mvEyebrow: "Mission and Vision",
    mvTitle: "Why we *do this*",
    mission: "Our Mission",
    missionText:
      "Bliss Digital’s mission is to help businesses grow by doing a few things the right way, every time. Every engagement starts with one goal agreed before any spend: sales, leads or bookings. Tracking is tested with one real action before the ads go live, results are reported without jargon, and your Google Ads and Analytics accounts stay in your business’s name.",
    vision: "Our Vision",
    visionText:
      "Bliss Digital’s vision is to be a trusted marketing partner for businesses across Indonesia, known for creative work held to a professional standard. The goal for every campaign, website and post is growth you can measure in sales, leads and bookings, reported in plain words so you always know what your budget is doing.",
    beliefsEyebrow: "How We Work",
    beliefsTitle: "Four things we *always do*",
    beliefsLink: "See Why Clients Choose Us",
    beliefs: [
      ["One clear goal first", "Sales, leads or bookings. We agree on it before any spend, so every decision has a reason."],
      ["Tracking before ads", "We check that every result is counted correctly, and test it with one real action."],
      ["Plain-word reports", "A regular 360 review of your ads, tracking, website, content and budget, explained without jargon."],
      ["Your accounts, your name", "Google Ads and Analytics stay in your business’s name. You pay ad spend to the platform directly."],
    ],
    clientsLede: "A few of the brands we work with, from hotels and clinics to food brands, retailers and manufacturers.",
    visitEyebrow: "Visit Us",
    visitTitle: "Based in *South Jakarta*",
    visitLede: "We work with businesses across Indonesia. Most meetings happen on a call, and you’re welcome at the office too. Message us first so we’re there.",
    maps: "Open in Google Maps",
    copyAddress: "Copy Address",
    copied: "Copied",
    phoneLabel: "WhatsApp and Phone",
    emailLabel: "Email",
    instagramLabel: "Instagram",
  },

  servicesPage: {
    eyebrow: "Our Services",
    title: "Digital marketing, done *for you*",
    lede: "You focus on your business. We handle the marketing, from the first plan to the daily work. Pick one service or combine them.",
    jump: { google: "Google Ads", web: "Website Creation", social: "Social Media" },
    google: {
      title: "Google Ads",
      lede: "Show up when people search for what you sell. Bliss Digital builds Google Ads campaigns around the words your customers actually type, then turns those searches into calls, WhatsApp chats and bookings. Before any money is spent, the team checks that every result is tracked correctly in Google Ads and GA4. After launch, the team adjusts bids, keywords and ads every day. In a regular 360 review, you hear in plain words what worked, what didn’t and what comes next. Your Google Ads account stays in your business’s name, and you pay ad spend to Google directly.",
      button: "Ask About Google Ads",
      imageAlt: "Google search open on a laptop",
      waysTitle: "Three Ways to Work with Us",
      ways: [
        ["Fully Managed", "We plan, build and run your campaigns every day. Monthly subscription.", "Ask About Full Management", "google-ads"],
        ["Consultation", "You run Google Ads yourself and want an expert review. You get a written action plan.", "Ask About Consultation", "consultation"],
        ["Training", "For company teams and individuals who want to run Google Ads themselves.", "Ask About Training", "training"],
      ],
      includedTitle: "What Full Management Includes",
      included: [
        "Right people: audience and keyword research",
        "Right time: schedules, seasons and budget pacing",
        "Right message: ad copy and creative testing",
        "Conversion tracking and GA4 checked before any spend",
        "Daily checks and changes to bids, keywords and ads",
        "A regular 360 review of your results",
      ],
      tagsTitle: "Campaign Types We Run",
      tags: ["Search", "Performance Max", "Display", "Demand Gen", "YouTube", "Local and Maps"],
    },
    web: {
      title: "Website Creation",
      lede: "A fast website that people, Google and AI search tools can find, with a clear path from interest to WhatsApp, booking or a form. Bliss Digital plans, writes, designs and builds every page. Each page is built to be found on Google (SEO) and to give clear answers that ChatGPT, Gemini and Google AI Overviews can read (GEO). GA4 and conversion tracking are set up at launch, and every page is tested on phones and computers before it goes live.",
      button: "Ask About a New Website",
      imageAlt: "An app design open in Figma on a desktop monitor",
      includedTitle: "What a New Website Includes",
      included: [
        "Plan, write, design and build every page",
        "Found on Google (SEO): fast pages, clear structure and the right search words",
        "Found in AI answers (GEO): clear answers and business details that ChatGPT, Gemini and Google AI Overviews can read",
        "A clear path to WhatsApp, booking or a form",
        "GA4 and conversion tracking set up at launch",
        "Every page tested on phones and computers before launch",
      ],
      tagsTitle: "Design Work",
      tags: ["Web design", "Mobile UI", "Wireframes", "Prototypes", "Design systems"],
    },
    social: {
      title: "Social Media Management",
      lede: "Bliss Digital runs your Instagram and TikTok from plan to post. Each month starts with a content plan built around your goals and seasons. The team writes captions in your brand’s voice, designs posts, carousels and short videos, schedules everything and replies to comments and messages. A monthly report shows your reach and engagement, and what to post next.",
      button: "Ask About Social Media",
      includedTitle: "What Social Media Management Includes",
      included: [
        "A monthly content plan built around your goals and seasons",
        "Copywriting and captions in your brand’s voice",
        "Post, carousel and short video design",
        "Scheduling and posting",
        "Replies to comments and messages",
        "A monthly report on reach, engagement and what to post next",
      ],
      tagsTitle: "Platforms",
      tags: ["Instagram", "TikTok"],
    },
    stepsEyebrow: "How We Start",
    stepsTitle: "From first chat to *first results*",
    stepsLede: "After the setup, we handle the daily work. We need you for the regular review and to approve new offers or ad messages.",
    steps: [
      ["First call", "We learn about your business, your customers and your goals.", "Call or WhatsApp"],
      ["Proposal", "You get the plan, the timeline and the fee, in writing, before you commit.", "In writing"],
      ["Tracking check", "We agree on one goal and make sure it is counted correctly.", "Before any spend"],
      ["Launch", "Campaigns, website or content go live, and we watch them daily.", "Checked daily"],
      ["360 review", "We go through your ads, tracking, website, content and budget, and agree on the next steps.", "In plain words"],
    ],
  },

  blogPage: {
    eyebrow: "Blog",
    title: "Marketing, in *plain words*",
    lede: "Short guides from our team on ads, tracking and websites. What works, what to check, and what to ask your agency.",
  },

  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    lede: "How we collect, use and protect the information you share with us.",
    updated: "Last updated:",
    updatedValue: "11 November 2026",
    // Each section: heading, then paragraphs; a paragraph that is an array is a bullet list
    sections: [
      {
        h: "Who We Are",
        p: [
          "This website is run by PT Blissindo Kreasi Digital (“Bliss Digital”, “we”), Epiwalk Office Suite Lt. 5 Unit A501, Kawasan Rasuna Epicentrum, Jl. HR Rasuna Said, Jakarta Selatan, DKI Jakarta 12940, Indonesia. We handle personal data in line with Indonesia’s Personal Data Protection Law (Law No. 27 of 2022).",
        ],
      },
      {
        h: "What We Collect",
        p: [
          "When you send us the contact form, we collect:",
          ["your name and email address", "your WhatsApp number and company website, if you give them", "the service you’re interested in and your message"],
          "When you message us on WhatsApp, by email or by phone, we keep the details you share in that conversation.",
        ],
      },
      {
        h: "How We Use It",
        p: [
          "We use your information only to reply to your enquiry, prepare a proposal, and, if you become a client, run the work we agreed. We don’t sell your data, and we don’t add you to a mailing list without asking.",
        ],
      },
      {
        h: "Who Else Sees It",
        p: [
          "Form submissions are stored with Google, which provides the form and spreadsheet we use. If we work together, people on our team who run your account can see your details. When you visit this site, Google and Meta also receive information about your visit, as described under “Cookies and Analytics”. Otherwise, we share data with others only when the law requires it.",
        ],
      },
      {
        h: "How Long We Keep It",
        p: [
          "We keep enquiries for 180 days, and client records for as long as the law requires for business and tax purposes.",
        ],
      },
      {
        h: "Cookies and Analytics",
        p: [
          "This site uses the following tools, which set cookies in your browser when you visit:",
          [
            "Google Analytics 4, loaded through the Google tag, to count visits, see which pages people use, and measure our Google Ads",
            "the Meta Pixel, to measure our ads on Facebook and Instagram",
          ],
          "You can stop or limit this tracking at any time: block or clear cookies in your browser’s settings, use Google’s Analytics opt-out browser add-on (tools.google.com/dlpage/gaoptout), turn off ad personalisation in Google’s My Ad Center (myadcenter.google.com), or change your ad preferences in Meta’s Accounts Center.",
        ],
      },
      {
        h: "Your Rights",
        p: [
          "You can ask us to show you the data we hold about you, correct it, or delete it. You can also withdraw your consent at any time. Email admin@blissdigital.id and we will reply within the time the law requires.",
        ],
      },
      {
        h: "Changes to This Policy",
        p: ["If we change this policy, we will update the date at the top of this page."],
      },
    ] as { h: string; p: (string | string[])[] }[],
  },

  // Free ROAS Calculator (/tools/roas-calculator): the standard formula only.
  // {n}, {m}, {o}, {v} and {t} are filled in with numbers.
  roas: {
    eyebrow: "ROAS Calculator",
    // Followed by the month the site was last built
    updated: "Updated",
    title: "Are your ads *paying for themselves?*",
    lede: "A free calculator for Google and Meta ads. Enter your ad spend and the sales it brought in to see your ROAS.",
    private: "Your browser does the math. We don’t see or save your numbers.",
    example: "Example numbers. Replace them with yours.",
    form: {
      title: "Your numbers",
      spend: "Ad spend",
      spendHint: "What you paid Google or Meta for the period.",
      sales: "Sales from ads",
      salesHint: "Revenue from customers who came through your ads.",
      calcOpen: "Work out the total from your orders",
      calcClose: "Enter the total instead",
      orders: "Orders from ads",
      aov: "Average order value",
      calcLine: "{o} orders × {v} = {t} in sales",
      margin: "Profit margin",
      marginHint: "Optional. What you keep from each sale after product and staff costs. Add it to see your profit.",
      defaults: { spend: "10000000", sales: "40000000", orders: "80", aov: "500000" },
    },
    results: {
      title: "Your Results",
      empty: "Enter your ad spend and sales to see your ROAS.",
      roas: "ROAS",
      roasSub: "Rp{n} in sales for every Rp1 spent on ads",
      breakEven: "Break-even ROAS",
      breakEvenSub: "At a {m}% margin",
      profit: "Profit from ads",
      profitSub: "After the ad spend",
      good: "Your ads are paying for themselves.",
      bad: "At this margin, your ads are losing money.",
      addMargin: "Add your profit margin to see if the ads make a profit.",
    },
    explain: {
      title: "How the numbers work",
      lede: "ROAS (return on ad spend) shows how much your ads sell for each rupiah you put in.",
      items: [
        { name: "ROAS", formula: "Sales from ads ÷ ad spend", example: "Rp40,000,000 in sales from Rp10,000,000 of ads is a 4x ROAS." },
        { name: "Break-even ROAS", formula: "1 ÷ profit margin", example: "With a 25% margin, each Rp1 of ads has to bring in Rp4 of sales before you make any money." },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "ROAS questions",
      items: [
        {
          q: "What is a good ROAS?",
          a: [
            "It depends on your profit margin. A good ROAS is one above your break-even ROAS, which is 1 ÷ your margin.",
            "With a 25% margin you need more than 4x. With a 50% margin, more than 2x is enough.",
          ],
        },
        {
          q: "What’s the difference between ROAS and ROI?",
          a: [
            "ROAS compares sales with ad spend. ROI first takes product and staff costs out of your sales, then compares the profit left with what you spent.",
            "At a 25% margin, a 3x ROAS loses money, because every Rp1 of ads brings in Rp3 of sales and only Rp0.75 of profit.",
          ],
        },
        {
          q: "Where do I find my numbers?",
          a: [
            "Ad spend is the Cost column in Google Ads and Amount spent in Meta Ads Manager. Take sales from your shop, booking system or CRM, for the same dates.",
          ],
        },
      ],
    },
    cta: { title: "We’ll check your tracking,", titleEm: "so you can trust these numbers.", button: "Let’s Chat" },
  },

  // Placeholder for sections that aren't ready (see src/lib/launch.ts)
  comingSoon: {
    badge: "Coming Soon",
    home: "Back to Home",
    contact: "Let’s Chat",
    cases: {
      title: "Case studies are *coming soon*",
      text: "We’re writing up real results from the brands we work with. In the meantime, we’re happy to walk you through them on a call.",
    },
    blog: {
      title: "Our blog is *coming soon*",
      text: "Plain-word guides on ads, tracking and websites are on the way. Have a question now? Ask us directly.",
    },
  },

  notFound: {
    title: "Page Not Found",
    text: "This page may have moved, or the link has a typo.",
    home: "Back to Home",
    contact: "Contact Us",
  },
};

export type Dictionary = typeof en;
