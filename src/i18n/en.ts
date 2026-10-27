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
      title: "Bliss Digital | Digital marketing agency in Jakarta",
      description:
        "You focus on running your business. We make sure it reaches the right people, at the right time, with the right message. Google Ads, Meta Ads and websites, run for you.",
    },
    about: {
      title: "About us",
      description:
        "Bliss Digital is a Google Partner marketing agency in South Jakarta. We run Google Ads, Meta Ads and websites for businesses that would rather focus on their work.",
    },
    services: {
      title: "Services",
      description:
        "Google Ads, Meta Ads, website creation and social media management, planned and run for you by Bliss Digital in Jakarta.",
    },
    cases: {
      title: "Case studies",
      description: "How Bliss Digital helps businesses reach the right people, at the right time, with the right message.",
    },
    blog: {
      title: "Blog",
      description: "Plain-word guides to Google Ads, Meta Ads, tracking and websites from the Bliss Digital team.",
    },
    contact: {
      title: "Contact us",
      description: "Tell us about your business and we’ll be in touch within 24–48 hours.",
    },
    privacy: {
      title: "Privacy policy",
      description: "How Bliss Digital collects, uses and protects the information you share with us.",
    },
  },

  nav: {
    home: "Bliss Digital, home",
    about: "About us",
    services: "Services",
    cases: "Case studies",
    blog: "Blog",
    contact: "Contact us",
    cta: "Let’s chat",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    main: "Main",
    language: "Language",
    chooseLanguage: "Choose language",
    backToTop: "Back to top",
  },

  footer: {
    copyright: "© 2026 Bliss Digital Agency. All rights reserved.",
    links: "Footer",
    homeLink: "Home",
    privacy: "Privacy policy",
    newTab: "opens in a new tab",
  },

  common: {
    letsChat: "Let’s chat",
    startProject: "Start your project",
    ourServices: "Our services",
    viewMore: "View more",
    partnerAlt: "Google Partner (opens in a new tab)",
    whatsappUs: "WhatsApp us",
    sampleCases: "Sample content · replace before launch",
    sampleCase: "Sample case study · replace before launch",
    draftPosts: "Draft articles · review before launch",
    draftPost: "Draft article · review before launch",
    nextCase: "Next case study",
    allCases: "All case studies",
    nextPost: "Next article",
    allPosts: "All articles",
    minRead: "min read",
  },

  // Burgundy opening screen with the logo (homepage)
  intro: {
    name: "Bliss",
    nameEm: "Digital",
    cue: "Scroll",
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

  clients: {
    eyebrow: "Our clients",
    title: "Brands that",
    titleEm: "Grew With Us",
    lede: "These are brands we’ve managed and helped grow. Different industries, same level of hands-on involvement from our side. We stay close to every project, start to finish.",
  },

  about: {
    eyebrow: "About us",
    titleA: "Built on",
    titleB: "a simple *Belief*",
    text: "At Bliss, we believe good digital marketing starts with doing the *right things*, the *right way.*",
    imageAlt: "A smiling woman working on her laptop at home",
    stats: [
      { value: "3+", label: "Years of|experience" },
      { value: "50M+", label: "Accounts reached|across all platforms" },
      { value: "100+", label: "Successful|projects" },
    ],
  },

  services: {
    eyebrow: "Our services",
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
          tab: "Fully managed",
          plan: "Fully managed by Bliss",
          desc: "We plan, build, and run your campaigns every day. We reach the right people, at the right time, with the right message. Monthly subscription.",
          button: "Ask about full management",
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
          plan: "In-depth consultation",
          desc: "For businesses that run Google Ads themselves and want an expert analysis. You get a written action plan.",
          button: "Ask about consultation",
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
          plan: "Google Ads training",
          desc: "For company teams and individuals who want to run Google Ads themselves.",
          button: "Ask about training",
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
    meta: {
      title: "Meta Ads",
      sub: "Facebook and Instagram ads, planned and run for you by Bliss.",
      plan: "Fully managed by Bliss",
      desc: "We plan, build, and run your Facebook and Instagram ads. We reach the right people, at the right time, with the right message. Monthly subscription.",
      button: "Ask about full management",
      items: [
        "Right people: audiences built on location, interests, and people similar to your customers",
        "Right time: budget pacing and limits on how often one person sees an ad",
        "Right message: images, videos, and captions that we test",
        "Meta Pixel and Conversions API check before any spend",
        "A regular 360 review of your results",
        "Lead ads, WhatsApp chat ads, and retargeting",
      ],
    },
    web: {
      title: "Website creation",
      sub: "A website that people and AI search tools can find, and that turns visitors into customers.",
      plan: "Fully built by Bliss",
      desc: "We handle every step, from the first plan to launch day. We set your website up so Google and AI tools, such as ChatGPT, Gemini, and Google AI Overviews, can read it clearly.",
      button: "Ask about a new website",
      items: [
        "Plan, write, design, and build every page",
        "Found on Google (SEO): fast pages, clear structure, and the right search words",
        "Found in AI answers (GEO): clear answers and business details that AI tools can read",
        "A clear path to WhatsApp, booking, or a form",
        "GA4 and conversion tracking set up at launch",
        "Every page tested before we put the website live",
      ],
    },
  },

  why: {
    eyebrow: "Why us",
    titleA: "You run the business.",
    titleB: "We run the marketing.",
    lede: "One team handles your ads, website, and social media. We take care of the daily work, and we explain every result in plain words.",
    example: "Example",
    people: {
      label: "Right people",
      title: "We find the people most likely to buy",
      body: "We study your customers: what they search for, what they like, and where they spend time. Then we show your ads to them, not to everyone.",
      rows: ["Everyone online", "Looking for what you sell", "Ready to buy"],
      sig: "The right *people.*",
    },
    time: {
      label: "Right time",
      title: "We reach them when they are ready",
      body: "We plan around the hours, days, and seasons when your customers decide. More of your budget goes to those moments.",
      days: ["M", "T", "W", "T", "F", "S", "S"],
      hours: ["AM", "Noon", "PM", "Night"],
      note: "Example · dark = when customers decide",
      sig: "The right *time.*",
    },
    message: {
      label: "Right message",
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
      label: "Clear numbers",
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
      label: "Honest reports",
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
      label: "Your ownership",
      title: "Your accounts stay yours",
      body: "Your Google Ads, Meta, and Analytics accounts are in your name. You pay ad spend directly to the platform, and you can log in at any time.",
      owner: "Owner on every account: your business",
      key: "Your data, *your access*",
    },
  },

  cases: {
    eyebrow: "Case studies",
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
    // A placeholder the team still has to fill in: [[Fill in: ...]]
    items: [
      {
        q: "What does “fully managed” include?",
        a: [
          "For Google Ads and Meta Ads, we plan, build, and run your campaigns every day. We find the right people, choose the right time, and write and test the right message. Before any spend, we check your tracking. We review your results regularly and make changes early when something does not work.",
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
          "Our fee depends on the service you choose and the size of the work. Your ad budget is separate, and you pay it directly to Google or Meta.",
          "[[Fill in: a starting fee, or keep this line]] We share the full price in the proposal before you commit.",
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
        a: ["We tell you clearly and early. We explain what we think went wrong, and we show you what we will change. You always know the next step."],
      },
    ],
  },

  cta: {
    title: "Ready to focus on your business?",
    titleEm: "Let us handle the marketing.",
    servicesTitle: "Not sure which service you need?",
    servicesTitleEm: "Tell us your goal. We’ll suggest a plan.",
  },

  contact: {
    eyebrow: "Contact us",
    title: "Let’s build",
    titleEm: "together",
    lede: "Fill out the form below and we’ll be in touch shortly.",
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
    // value = what the team sees in the Google Form; key = ?service= links
    services: [
      { key: "google-ads", label: "Google Ads" },
      { key: "meta-ads", label: "Meta Ads" },
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
    eyebrow: "About us",
    title: "A small team that *stays close*",
    lede: "We started small, stayed intentional, and grew alongside the brands we work with. Every project we take on is a partnership, not a one-off job.",
    storyEyebrow: "Our story",
    storyText:
      "Most business owners don’t have time to learn ad platforms, read dashboards and rewrite their website. So we do that work for them, every day, and explain the results in plain words.",
    mvEyebrow: "Mission and vision",
    mvTitle: "Why we *do this*",
    mission: "Our mission",
    missionText:
      "We help brands grow through clear strategy, thoughtful creative work and reliable execution. We bring professionalism, trust and purpose to every engagement, and build partnerships that make a real and lasting difference.",
    vision: "Our vision",
    visionText:
      "To be a trusted partner for modern brands, bringing creative energy, clear direction and a professional standard of work. We want our marketing to drive growth and build brand value that lasts.",
    beliefsEyebrow: "How we work",
    beliefsTitle: "Four things we *always do*",
    beliefsLink: "See why clients choose us",
    beliefs: [
      ["One clear goal first", "Sales, leads or bookings. We agree on it before any spend, so every decision has a reason."],
      ["Tracking before ads", "We check that every result is counted correctly, and test it with one real action."],
      ["Plain-word reports", "A regular 360 review of your ads, tracking, website, content and budget, explained without jargon."],
      ["Your accounts, your name", "Google Ads, Meta and Analytics stay in your business’s name. You pay ad spend to the platform directly."],
    ],
    clientsLede: "Hotels, clinics, food brands, retailers and manufacturers. Different industries, same level of hands-on involvement from our side.",
    visitEyebrow: "Visit us",
    visitTitle: "Based in *South Jakarta*",
    visitLede: "We work with businesses across Indonesia. Most meetings happen on a call, and you’re welcome at the office too. Message us first so we’re there.",
    maps: "Open in Google Maps",
    phoneLabel: "WhatsApp and phone",
    emailLabel: "Email",
    instagramLabel: "Instagram",
  },

  servicesPage: {
    eyebrow: "Our services",
    title: "Digital marketing, done *for you*",
    lede: "You focus on your business. We handle the marketing, from the first plan to the daily work. Pick one service or combine them.",
    jump: { google: "Google Ads", meta: "Meta Ads", web: "Website creation", social: "Social media" },
    google: {
      title: "Google Ads",
      lede: "Show up when people search for what you sell. We build campaigns around how your customers actually search, and turn those searches into calls, chats and bookings.",
      button: "Ask about Google Ads",
      imageAlt: "Google search open on a laptop",
      waysTitle: "Three ways to work with us",
      ways: [
        ["Fully managed", "We plan, build and run your campaigns every day. Monthly subscription.", "Ask about full management", "google-ads"],
        ["Consultation", "You run Google Ads yourself and want an expert review. You get a written action plan.", "Ask about consultation", "consultation"],
        ["Training", "For company teams and individuals who want to run Google Ads themselves.", "Ask about training", "training"],
      ],
      includedTitle: "What full management includes",
      included: [
        "Right people: audience and keyword research",
        "Right time: schedules, seasons and budget pacing",
        "Right message: ad copy and creative testing",
        "Conversion tracking and GA4 checked before any spend",
        "Daily checks and changes to bids, keywords and ads",
        "A regular 360 review of your results",
      ],
      tagsTitle: "Campaign types we run",
      tags: ["Search", "Performance Max", "Display", "Demand Gen", "YouTube", "Local and Maps"],
    },
    meta: {
      title: "Meta Ads",
      lede: "Facebook and Instagram ads that make people stop, care and act. We plan and run them for you, and keep the messages that bring customers.",
      button: "Ask about Meta Ads",
      imageAlt: "Someone working in an ads manager on a laptop",
      includedTitle: "What’s included",
      included: [
        "Right people: audiences built on location, interests, and people similar to your customers",
        "Right time: budget pacing and limits on how often one person sees an ad",
        "Right message: images, videos and captions that we test",
        "Meta Pixel and Conversions API checked before any spend",
        "A regular 360 review of your results",
      ],
      tagsTitle: "Ad formats we use most",
      tags: ["Lead ads", "WhatsApp chat ads", "Retargeting", "Reels and Stories", "Catalogue ads"],
    },
    web: {
      title: "Website creation",
      lede: "A fast website that people, Google and AI search tools can find, with a clear path from interest to WhatsApp, booking or a form.",
      button: "Ask about a new website",
      imageAlt: "An app design open in Figma on a desktop monitor",
      includedTitle: "What’s included",
      included: [
        "Plan, write, design and build every page",
        "Found on Google (SEO): fast pages, clear structure and the right search words",
        "Found in AI answers (GEO): clear answers and business details that ChatGPT, Gemini and Google AI Overviews can read",
        "A clear path to WhatsApp, booking or a form",
        "GA4 and conversion tracking set up at launch",
        "Every page tested on phones and computers before launch",
      ],
      tagsTitle: "Design work",
      tags: ["Web design", "Mobile UI", "Wireframes", "Prototypes", "Design systems"],
    },
    social: {
      title: "Social media management",
      lede: "We run your Instagram and TikTok from plan to post, so your brand stays consistent and visible with content your audience wants to see.",
      button: "Ask about social media",
      includedTitle: "What’s included",
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
      pair: "Pair it with Meta Ads, and your best posts can become ads that reach new customers.",
    },
    stepsEyebrow: "How we start",
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
    title: "Privacy policy",
    lede: "How we collect, use and protect the information you share with us.",
    updated: "Last updated:",
    updatedValue: "[[Fill in: date]]",
    draft: "Draft · have this checked by a legal adviser before launch",
    // Each section: heading, then paragraphs; a paragraph that is an array is a bullet list
    sections: [
      {
        h: "Who we are",
        p: [
          "This website is run by PT Blissindo Kreasi Digital (“Bliss Digital”, “we”), Epiwalk Office Suite Lt. 5 Unit A501, Kawasan Rasuna Epicentrum, Jl. HR Rasuna Said, Jakarta Selatan, DKI Jakarta 12940, Indonesia. We handle personal data in line with Indonesia’s Personal Data Protection Law (Law No. 27 of 2022).",
        ],
      },
      {
        h: "What we collect",
        p: [
          "When you send us the contact form, we collect:",
          ["your name and email address", "your WhatsApp number and company website, if you give them", "the service you’re interested in and your message"],
          "When you message us on WhatsApp, by email or by phone, we keep the details you share in that conversation.",
        ],
      },
      {
        h: "How we use it",
        p: [
          "We use your information only to reply to your enquiry, prepare a proposal, and, if you become a client, run the work we agreed. We don’t sell your data, and we don’t add you to a mailing list without asking.",
        ],
      },
      {
        h: "Who else sees it",
        p: [
          "Form submissions are stored with Google, which provides the form and spreadsheet we use. If we work together, people on our team who run your account can see your details. We share data with others only when the law requires it.",
        ],
      },
      {
        h: "How long we keep it",
        p: [
          "We keep enquiries for as long as we need them to follow up, and client records for as long as the law requires for business and tax purposes. [[Fill in: retention period]]",
        ],
      },
      {
        h: "Cookies and analytics",
        p: [
          "[[Fill in: which analytics or ad tags the live site uses, for example Google Analytics 4, the Google tag or the Meta Pixel, and how visitors can opt out.]]",
        ],
      },
      {
        h: "Your rights",
        p: [
          "You can ask us to show you the data we hold about you, correct it, or delete it. You can also withdraw your consent at any time. Email admin@blissdigital.id and we will reply within the time the law requires.",
        ],
      },
      {
        h: "Changes to this policy",
        p: ["If we change this policy, we will update the date at the top of this page."],
      },
    ] as { h: string; p: (string | string[])[] }[],
  },

  notFound: {
    title: "Page not found",
    text: "This page may have moved, or the link has a typo. Let’s get you back on track.",
    home: "Back to home",
    contact: "Contact us",
  },
};

export type Dictionary = typeof en;
