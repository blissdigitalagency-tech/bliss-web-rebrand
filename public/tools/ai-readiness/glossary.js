/* Bliss AI Readiness Check: hover and tap explanations (glossary tooltips).
 *
 * One file, no setup. Add it to the English and Indonesian tool pages:
 *   <script src="/tools/ai-readiness/glossary.js" defer></script>
 *
 * It finds the terms on the page (the 6 number tiles, grades, channels,
 * crawlers, chips and every check name), gives them a dotted underline, and
 * shows an explanation on hover (mouse), on focus (keyboard) or on tap (phone).
 * It reads the language from <html lang="en|id">. It changes no other code:
 * when the report is drawn, it marks the new terms.
 */
(function(){
  if(window.__blissTips) return; window.__blissTips = true;

  var ID = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase() === 'id';
  var LBL = ID ? ['Apa itu', 'Cara kerjanya', 'Mengapa penting', 'Di halaman ini']
               : ['What it is', 'How it works', 'Why it matters', 'On this page'];

  /* ---------- the glossary: [title, what it is, how it works, why it matters] ---------- */

  var G = {};
  function K(key, en, id){ G[key] = ID ? id : en; }

  /* channels */
  K('ch.aio',
    ['Google AI Overviews',
     'The AI summary at the top of some Google search results. It quotes a few web pages and links to them.',
     'It uses pages that Googlebot collected for Google Search. Google runs JavaScript, so it sees the finished page.',
     'It sits above the normal results. If your page can be read and quoted, it can be one of the sources.'],
    ['Google AI Overviews',
     'Ringkasan AI di bagian atas sebagian hasil pencarian Google. Ringkasan ini mengutip beberapa halaman web dan menautkannya.',
     'AI Overviews memakai halaman yang dikumpulkan Googlebot untuk Google Search. Google menjalankan JavaScript, jadi Google melihat halaman yang sudah jadi.',
     'Posisinya di atas hasil pencarian biasa. Jika halaman Anda bisa dibaca dan dikutip, halaman Anda berpeluang menjadi salah satu sumbernya.']);
  K('ch.gemini',
    ['Gemini',
     'Google’s AI assistant app. It can answer with links to web pages.',
     'It uses pages that Googlebot collected. A separate robots.txt setting, Google-Extended, decides if Gemini may use them.',
     'Many people ask Gemini directly instead of searching. If Google-Extended is blocked, Gemini cannot use your page, even when Google Search can.'],
    ['Gemini',
     'Aplikasi asisten AI dari Google. Gemini bisa menjawab sambil menautkan halaman web.',
     'Gemini memakai halaman yang dikumpulkan Googlebot. Ada pengaturan terpisah di robots.txt, yaitu Google-Extended, yang menentukan apakah Gemini boleh memakai halaman tersebut.',
     'Banyak orang bertanya langsung ke Gemini tanpa membuka Google Search. Jika Google-Extended diblokir, Gemini tidak bisa memakai halaman Anda, walaupun Google Search bisa.']);
  K('ch.chatgpt',
    ['ChatGPT',
     'OpenAI’s AI assistant. Its search feature shows web pages as sources.',
     'OpenAI’s crawler, OAI-SearchBot, fetches pages for ChatGPT search. It reads the page before JavaScript runs.',
     'ChatGPT is one of the most used AI assistants. If your text only appears after JavaScript runs, ChatGPT may see an empty page.'],
    ['ChatGPT',
     'Asisten AI dari OpenAI. Fitur search-nya menampilkan halaman web sebagai sumber.',
     'Crawler OpenAI, yaitu OAI-SearchBot, mengambil halaman untuk ChatGPT search. Crawler ini membaca halaman sebelum JavaScript berjalan.',
     'ChatGPT termasuk asisten AI yang paling banyak dipakai. Jika teks Anda baru muncul setelah JavaScript berjalan, ChatGPT bisa melihat halaman kosong.']);
  K('ch.meta',
    ['Meta AI',
     'The AI assistant inside WhatsApp, Instagram, Facebook and Messenger.',
     'Meta’s crawler, meta-webindexer, fetches pages that Meta AI can cite in its answers. It reads the page before JavaScript runs.',
     'Many of your customers use these apps every day. Meta AI can answer their questions without them leaving the app.'],
    ['Meta AI',
     'Asisten AI di dalam WhatsApp, Instagram, Facebook dan Messenger.',
     'Crawler Meta, yaitu meta-webindexer, mengambil halaman yang bisa dikutip Meta AI di jawabannya. Crawler ini membaca halaman sebelum JavaScript berjalan.',
     'Banyak pelanggan Anda memakai aplikasi ini setiap hari. Meta AI bisa menjawab pertanyaan mereka tanpa perlu keluar dari aplikasi.']);

  /* grade and confidence */
  K('grade',
    ['Grade, from A to E',
     'How ready this page is for one AI channel. A means ready. E means blocked.',
     'The worst problem decides the grade. Only a rule published by the AI company can give an E. Bliss’s own checks stop at D. There is no overall score.',
     'Each channel reads your site in its own way. One page can get an A in Google and a D in ChatGPT, so each channel gets its own grade.'],
    ['Nilai, dari A sampai E',
     'Seberapa siap halaman ini untuk satu channel AI. A berarti siap. E berarti terblokir.',
     'Masalah terberat yang menentukan nilai. Hanya aturan yang diterbitkan perusahaan AI yang bisa memberi nilai E. Cek dari Bliss paling rendah memberi nilai D. Tidak ada nilai total.',
     'Setiap channel membaca website dengan caranya sendiri. Satu halaman bisa mendapat A di Google dan D di ChatGPT, jadi setiap channel punya nilainya sendiri.']);
  var GRADE_X = ID
    ? {A:'A: tidak ada yang perlu diperbaiki.', B:'B: ada 1 masalah halaman, 1 tips yang belum dijalankan, atau sedikit kekurangan pengaturan website.',
       C:'C: ada 2 masalah halaman, atau 3 kekurangan pengaturan website atau lebih.', D:'D: ada 3 masalah halaman atau lebih, atau ada batasan untuk mengutip.',
       E:'E: terblokir oleh aturan yang diterbitkan perusahaan AI.', '?':'Kami tidak bisa menilai channel ini.'}
    : {A:'A: nothing to fix.', B:'B: 1 page issue, a missed tip, or small site setup gaps.', C:'C: 2 page issues, or 3 or more site setup gaps.',
       D:'D: 3 or more page issues, or a limit on quoting.', E:'E: blocked by a rule the AI company published.', '?':'We could not grade this channel.'};
  K('conf.c',
    ['Confirmed',
     'We measured the same page that this channel’s crawler receives.',
     'We ask for your page using the crawler’s name, for example Googlebot, and grade what comes back.',
     'You can rely on this grade, because it comes from the page the crawler gets.'],
    ['Terkonfirmasi',
     'Kami mengukur halaman yang sama dengan yang diterima crawler channel ini.',
     'Kami meminta halaman Anda dengan memakai nama crawler tersebut, misalnya Googlebot, lalu menilai hasilnya.',
     'Nilai ini bisa Anda pegang, karena berasal dari halaman yang diterima crawler.']);
  K('conf.l',
    ['Best estimate',
     'We could not measure this grade directly, so it is our best estimate.',
     'This channel runs JavaScript, and our tool does not. So we cannot see the finished page that this channel sees. We grade from the evidence we have.',
     'Use it as a guide. The finished page may score higher or lower.'],
    ['Perkiraan terbaik',
     'Kami tidak bisa mengukur nilai ini secara langsung, jadi ini perkiraan terbaik kami.',
     'Channel ini menjalankan JavaScript, sedangkan tool kami tidak. Jadi kami tidak bisa melihat halaman jadi yang dilihat channel ini. Kami menilai dari bukti yang ada.',
     'Silakan pakai sebagai panduan. Halaman yang sudah jadi bisa mendapat nilai lebih tinggi atau lebih rendah.']);
  K('conf.n',
    ['Not confirmed',
     'We could not confirm this result.',
     'Your site may send this crawler a different page from the one we received. Or the site refused part of our check.',
     'Treat it as a question for your web developer, who can confirm what the crawler gets.'],
    ['Belum terkonfirmasi',
     'Kami belum bisa memastikan hasil ini.',
     'Website Anda mungkin mengirim halaman yang berbeda ke crawler ini. Atau website menolak sebagian pengecekan kami.',
     'Anggap ini pertanyaan untuk developer website Anda, yang bisa memastikan apa yang diterima crawler.']);

  /* summary tiles */
  K('fs.read',
    ['AI channels that can read your text',
     'How many of the 4 channels can get the text of this page.',
     'A channel counts when no rule from the AI company fails: the crawler is allowed, the page loads, there is no noindex, and the text reaches the crawler.',
     'A channel that cannot read your text cannot quote you. This is always the first thing to fix.'],
    ['Channel AI yang bisa membaca teks Anda',
     'Berapa dari 4 channel yang bisa mendapat teks halaman ini.',
     'Sebuah channel dihitung jika tidak ada aturan perusahaan AI yang gagal: crawler diizinkan, halaman bisa dibuka, tidak ada noindex, dan teksnya sampai ke crawler.',
     'Channel yang tidak bisa membaca teks Anda tidak bisa mengutip Anda. Bagian ini selalu yang pertama perlu diperbaiki.']);
  K('fs.fix',
    ['Things to fix, and tips',
     'Changes that would raise a grade. Tips are smaller changes that can lift a B to an A.',
     'Each check appears once, even when it affects several channels. The list is sorted by impact, biggest first.',
     'Start at the top of the list. The first item gives the biggest gain for your time.'],
    ['Hal untuk diperbaiki, dan tips',
     'Perubahan yang bisa menaikkan nilai. Tips adalah perubahan kecil yang bisa menaikkan B menjadi A.',
     'Setiap cek hanya muncul sekali, walaupun memengaruhi beberapa channel. Daftarnya diurutkan dari dampak terbesar.',
     'Mulailah dari urutan teratas. Item pertama memberi hasil terbesar untuk waktu Anda.']);
  K('fs.you',
    ['Fixes you can do yourself',
     'Changes you can make in your website editor, such as text, titles and dates.',
     'These are content changes. You do not need to touch any code.',
     'You can start today, without waiting for a developer.'],
    ['Perbaikan yang bisa Anda lakukan sendiri',
     'Perubahan yang bisa Anda lakukan di editor website, misalnya teks, judul dan tanggal.',
     'Semuanya perubahan konten. Anda tidak perlu menyentuh kode.',
     'Anda bisa mulai hari ini, tanpa perlu menunggu developer.']);
  K('fs.dev',
    ['Fixes for your web developer',
     'Changes that need access to the site’s code, server or settings.',
     'Examples: robots.txt rules, robots meta tags, canonical tags and server speed.',
     'Send these to your developer. The “What to do” text says exactly what to change.'],
    ['Perbaikan untuk developer website',
     'Perubahan yang membutuhkan akses ke kode, server atau pengaturan website.',
     'Contohnya aturan robots.txt, robots meta tag, tag canonical dan kecepatan server.',
     'Silakan kirim bagian ini ke developer Anda. Teks “Yang perlu dilakukan” sudah menjelaskan apa yang harus diubah.']);

  /* the 6 number tiles */
  K('kpi.words',
    ['Words AI can read',
     'The number of words in your page’s HTML before any JavaScript runs. This is what ChatGPT and Meta AI read.',
     'We download the page the way their crawlers do and count every word in it, including menus and buttons.',
     'Below 60 words, these crawlers see an almost empty page. They cannot quote text they never receive.'],
    ['Kata yang bisa dibaca AI',
     'Jumlah kata di HTML halaman Anda sebelum JavaScript berjalan. Inilah yang dibaca ChatGPT dan Meta AI.',
     'Kami mengunduh halaman seperti crawler mereka, lalu menghitung semua katanya, termasuk menu dan tombol.',
     'Di bawah 60 kata, crawler ini melihat halaman yang hampir kosong. Teks yang tidak pernah mereka terima tidak bisa mereka kutip.']);
  K('kpi.para',
    ['Quotable paragraphs',
     'Paragraphs long enough for AI to lift out and quote on their own.',
     'We count paragraphs of 40 words or more. The best length is 70 to 150 words, about 5 to 8 sentences.',
     'AI answers quote whole paragraphs. With 3 or more, your page has more chances to be quoted.'],
    ['Paragraf yang bisa dikutip',
     'Paragraf yang cukup panjang untuk diambil dan dikutip AI secara utuh.',
     'Kami menghitung paragraf yang panjangnya 40 kata atau lebih. Panjang terbaik 70 sampai 150 kata, sekitar 5 sampai 8 kalimat.',
     'Jawaban AI mengutip paragraf utuh. Dengan 3 paragraf atau lebih, peluang halaman Anda untuk dikutip makin besar.']);
  K('kpi.ruler',
    ['Longest paragraph',
     'The number of words in the longest paragraph on the page.',
     'We measure every paragraph in the main text and show the longest one.',
     'If even the longest paragraph is short, AI has no complete passage to quote. Aim for 40 words or more, and 70 to 150 at best.'],
    ['Paragraf terpanjang',
     'Jumlah kata di paragraf terpanjang pada halaman ini.',
     'Kami mengukur setiap paragraf di teks utama dan menampilkan yang paling panjang.',
     'Jika paragraf terpanjang pun masih pendek, AI tidak punya bagian utuh untuk dikutip. Targetkan 40 kata atau lebih, idealnya 70 sampai 150 kata.']);
  K('kpi.title',
    ['Titles (H1 and H2)',
     'The main title of the page (Heading 1, or H1) and its section titles (Heading 2, or H2).',
     'We count the headings in the page code. The ideal is 1 main title, with 2 or more section titles under it.',
     'AI uses titles to find the part of the page that answers a question. A clear title above each paragraph helps AI pick the right text.'],
    ['Judul (H1 dan H2)',
     'Judul utama halaman (Heading 1 atau H1) dan judul bagiannya (Heading 2 atau H2).',
     'Kami menghitung heading di kode halaman. Idealnya 1 judul utama, dengan 2 judul bagian atau lebih di bawahnya.',
     'AI memakai judul untuk menemukan bagian halaman yang menjawab sebuah pertanyaan. Judul yang jelas di atas setiap paragraf membantu AI memilih teks yang tepat.']);
  K('kpi.person',
    ['Sentences that name your business',
     'Sentences that do not start with “we”, “it”, “this” or “they”.',
     'We check the first word of every sentence. The target is 2 in 3 sentences or more.',
     'AI often quotes one sentence on its own. “We deliver in 2 hours” loses who “we” is. “Warung Sari delivers in 2 hours” keeps your name in the quote.'],
    ['Kalimat yang menyebut nama bisnis Anda',
     'Kalimat yang tidak diawali “kami”, “ini”, “itu” atau “mereka”.',
     'Kami mengecek kata pertama di setiap kalimat. Targetnya 2 dari 3 kalimat atau lebih.',
     'AI sering mengutip satu kalimat saja. Pada kalimat “Kami mengantar dalam 2 jam”, pembaca tidak tahu siapa “kami”. Kalimat “Warung Sari mengantar dalam 2 jam” tetap membawa nama Anda di kutipan.']);
  K('kpi.weight',
    ['Size of the HTML file',
     'The size of the page’s HTML code, without images, styles and scripts.',
     'We measure the file our tool receives. It is shown for information only and does not change the grade.',
     'A large file with few words often means the text is buried in code. Large files also take longer to download, and some crawlers only read the first part of a file.'],
    ['Ukuran file HTML',
     'Ukuran kode HTML halaman, tanpa gambar, style dan script.',
     'Kami mengukur file yang diterima tool kami. Angka ini hanya sebagai informasi dan tidak mengubah nilai.',
     'File besar dengan sedikit kata biasanya berarti teksnya tertimbun kode. File besar juga lebih lama diunduh, dan sebagian crawler hanya membaca bagian awal file.']);

  /* cards and sections */
  K('served',
    ['What each crawler gets',
     'The number of words each crawler receives when it asks for your page.',
     'We ask for the page several times, each time using a different crawler’s name, and count the words in each answer.',
     'Some sites send crawlers a different page, or an empty one. A gap here explains why one channel scores lower than another.'],
    ['Yang diterima setiap crawler',
     'Jumlah kata yang diterima setiap crawler saat meminta halaman Anda.',
     'Kami meminta halaman beberapa kali, setiap kali dengan nama crawler yang berbeda, lalu menghitung kata di setiap jawaban.',
     'Sebagian website mengirim halaman yang berbeda ke crawler, bahkan halaman kosong. Selisih di sini menjelaskan mengapa satu channel mendapat nilai lebih rendah dari yang lain.']);
  K('crawler.googlebot',
    ['Googlebot',
     'Google’s main web crawler.',
     'It collects pages for Google Search, AI Overviews and Gemini. It runs JavaScript before it reads the page.',
     'If Googlebot is blocked or gets an empty page, Google’s AI features cannot use your page.'],
    ['Googlebot',
     'Crawler web utama milik Google.',
     'Googlebot mengumpulkan halaman untuk Google Search, AI Overviews dan Gemini. Crawler ini menjalankan JavaScript sebelum membaca halaman.',
     'Jika Googlebot diblokir atau menerima halaman kosong, fitur AI Google tidak bisa memakai halaman Anda.']);
  K('crawler.oai',
    ['OAI-SearchBot',
     'OpenAI’s crawler for ChatGPT search.',
     'It reads the HTML before JavaScript runs. It is separate from GPTBot, the crawler OpenAI uses to collect training data.',
     'Blocking GPTBot does not remove you from ChatGPT search. Blocking OAI-SearchBot does.'],
    ['OAI-SearchBot',
     'Crawler OpenAI untuk ChatGPT search.',
     'Crawler ini membaca HTML sebelum JavaScript berjalan. OAI-SearchBot berbeda dari GPTBot, yaitu crawler yang dipakai OpenAI untuk mengumpulkan data training.',
     'Memblokir GPTBot tidak mengeluarkan Anda dari ChatGPT search. Memblokir OAI-SearchBot yang membuat Anda keluar.']);
  K('crawler.meta',
    ['meta-webindexer',
     'Meta’s crawler for Meta AI answers.',
     'It reads the HTML before JavaScript runs. It is separate from the crawler Meta uses to train its AI models.',
     'Without it, Meta AI cannot cite your page in WhatsApp, Instagram or Facebook.'],
    ['meta-webindexer',
     'Crawler Meta untuk jawaban Meta AI.',
     'Crawler ini membaca HTML sebelum JavaScript berjalan. meta-webindexer berbeda dari crawler yang dipakai Meta untuk melatih model AI-nya.',
     'Tanpa crawler ini, Meta AI tidak bisa mengutip halaman Anda di WhatsApp, Instagram atau Facebook.']);
  K('crawler.tool',
    ['Our tool',
     'Our own request for your page, like a browser with JavaScript switched off.',
     'It shows what the page contains before any JavaScript runs. People see more, because their browser runs JavaScript.',
     'If this row is low, your text is added by JavaScript. Crawlers that do not run JavaScript will miss it.'],
    ['Tool kami',
     'Permintaan halaman dari tool kami sendiri, seperti browser dengan JavaScript dimatikan.',
     'Baris ini menunjukkan isi halaman sebelum JavaScript berjalan. Pengunjung melihat lebih banyak, karena browser mereka menjalankan JavaScript.',
     'Jika angka di baris ini rendah, teks Anda ditambahkan oleh JavaScript. Crawler yang tidak menjalankan JavaScript tidak akan melihatnya.']);
  K('paralen',
    ['Paragraph length',
     'How many paragraphs on the page fall into each length group.',
     'We split the main text into paragraphs and count their words. Green groups (40 words or more) can be quoted. 70 to 150 words is ideal.',
     'Many short lines give AI nothing complete to quote. A few longer paragraphs under clear titles work best.'],
    ['Panjang paragraf',
     'Berapa banyak paragraf di halaman ini untuk setiap kelompok panjang.',
     'Kami membagi teks utama menjadi paragraf, lalu menghitung katanya. Kelompok hijau (40 kata atau lebih) bisa dikutip. 70 sampai 150 kata adalah yang ideal.',
     'Banyak baris pendek tidak memberi AI bagian utuh untuk dikutip. Beberapa paragraf yang lebih panjang di bawah judul yang jelas memberi hasil terbaik.']);
  K('titles',
    ['Titles: now and ideal',
     'The titles on your page in order, next to a simple ideal layout.',
     'H1 is the main title. H2 marks a section, and H3 a part of a section. We show the first 8 titles we find.',
     'A clear outline helps AI find the section that answers a question. One H1 with a few H2 titles is the simplest layout that works.'],
    ['Judul: sekarang dan ideal',
     'Urutan judul di halaman Anda, berdampingan dengan susunan ideal yang sederhana.',
     'H1 adalah judul utama. H2 menandai sebuah bagian, dan H3 menandai sub-bagian. Kami menampilkan 8 judul pertama yang kami temukan.',
     'Susunan judul yang jelas membantu AI menemukan bagian yang menjawab sebuah pertanyaan. Satu H1 dengan beberapa H2 adalah susunan paling sederhana yang berhasil.']);
  K('whygrade',
    ['Why each grade',
     'The main reason behind each channel’s grade.',
     'Channels with the same grade and the same reason share one row. The chip shows if the reason is an AI company rule or a Bliss check.',
     'It shows the one problem that holds each grade down, so you know where to start.'],
    ['Alasan setiap nilai',
     'Alasan utama di balik nilai setiap channel.',
     'Channel dengan nilai dan alasan yang sama digabung dalam satu baris. Label kecilnya menunjukkan apakah alasannya aturan perusahaan AI atau cek dari Bliss.',
     'Bagian ini menunjukkan satu masalah yang menahan setiap nilai, jadi Anda tahu harus mulai dari mana.']);
  K('cannot',
    ['What we cannot check',
     'Things that affect AI visibility but that this tool cannot see from outside your site.',
     'Some need data only you have, such as Google Search Console. Others depend on how AI chooses between sources.',
     'An A grade means nothing blocks you. These points cover what an A cannot promise.'],
    ['Yang tidak bisa kami cek',
     'Hal-hal yang memengaruhi visibilitas di AI, tetapi tidak bisa dilihat tool ini dari luar website Anda.',
     'Sebagian membutuhkan data yang hanya Anda miliki, misalnya Google Search Console. Sebagian lagi bergantung pada cara AI memilih sumber.',
     'Nilai A berarti tidak ada yang memblokir Anda. Poin-poin ini membahas hal yang belum dijamin oleh nilai A.']);
  K('robots',
    ['robots.txt',
     'A text file at the root of your site, such as yoursite.com/robots.txt. It tells crawlers which pages they may visit.',
     'Each crawler reads the lines for its own name, or the lines for User-agent: * when there are none. A matching Disallow line keeps it out.',
     'One wrong line can block an AI channel from your whole site. That gives a grade E.'],
    ['robots.txt',
     'File teks di folder utama website Anda, misalnya websiteanda.com/robots.txt. File ini memberi tahu crawler halaman mana yang boleh dikunjungi.',
     'Setiap crawler membaca baris dengan namanya sendiri, atau baris User-agent: * jika namanya tidak ada. Baris Disallow yang cocok membuat crawler tidak masuk.',
     'Satu baris yang salah bisa memblokir channel AI dari seluruh website Anda. Hasilnya nilai E.']);

  /* chips */
  K('src.p',
    ['AI company rule',
     'A rule that Google, OpenAI or Meta publish in their own documentation.',
     'Examples: the crawler must be allowed in robots.txt, and the page must not have noindex. Breaking one can give a grade E.',
     'If one fails, that channel cannot use your page, so fix these first.'],
    ['Aturan perusahaan AI',
     'Aturan yang diterbitkan Google, OpenAI atau Meta di dokumentasi resmi mereka.',
     'Contohnya: crawler harus diizinkan di robots.txt, dan halaman tidak boleh memakai noindex. Melanggar salah satunya bisa memberi nilai E.',
     'Jika salah satunya gagal, channel itu tidak bisa memakai halaman Anda, jadi perbaiki bagian ini lebih dulu.']);
  K('src.m',
    ['Our check',
     'A threshold that Bliss set, based on how AI answers quote web pages.',
     'Examples: paragraph length, titles and a visible date. No AI company publishes these numbers, so they never give a grade below D.',
     'They show where your page can raise its chances of being quoted.'],
    ['Cek kami',
     'Batas yang ditetapkan Bliss, berdasarkan cara jawaban AI mengutip halaman web.',
     'Contohnya panjang paragraf, judul dan tanggal yang terlihat. Tidak ada perusahaan AI yang menerbitkan angka ini, jadi cek ini tidak pernah memberi nilai di bawah D.',
     'Cek ini menunjukkan peluang halaman Anda untuk lebih sering dikutip.']);
  K('src.u',
    ['Not confirmed',
     'We could not confirm this check either way.',
     'It is shown in grey and does not count against your grade.',
     'Ask your web developer to check it, so you know for sure.'],
    ['Belum terkonfirmasi',
     'Kami belum bisa memastikan hasil cek ini.',
     'Cek ini ditampilkan abu-abu dan tidak mengurangi nilai Anda.',
     'Silakan minta developer website Anda mengeceknya, agar Anda tahu pasti.']);
  K('sev.stop',
    ['Stops a channel',
     'This problem stops at least one AI channel from using the page.',
     'It breaks a rule the AI company published, such as a blocked crawler or a noindex tag.',
     'Fix this first. Until it is fixed, that channel cannot use the page at all.'],
    ['Menghentikan channel',
     'Masalah ini membuat minimal satu channel AI tidak bisa memakai halaman.',
     'Masalahnya melanggar aturan yang diterbitkan perusahaan AI, misalnya crawler yang diblokir atau tag noindex.',
     'Perbaiki ini lebih dulu. Sebelum diperbaiki, channel itu sama sekali tidak bisa memakai halaman ini.']);
  K('sev.notext',
    ['AI gets no text',
     'At least one channel receives the page without its main text.',
     'The text is added by JavaScript, and that channel’s crawler does not run JavaScript.',
     'A crawler cannot quote text it never receives. Ask your developer to put the main text in the HTML, for example with server-side rendering.'],
    ['AI tidak mendapat teks',
     'Minimal satu channel menerima halaman tanpa teks utamanya.',
     'Teksnya ditambahkan oleh JavaScript, sedangkan crawler channel itu tidak menjalankan JavaScript.',
     'Crawler tidak bisa mengutip teks yang tidak pernah diterimanya. Silakan minta developer Anda memasukkan teks utama ke HTML, misalnya dengan server-side rendering.']);
  K('sev.limit',
    ['Limits AI use',
     'AI can use the page, but only in a limited way.',
     'For example, max-snippet or data-nosnippet limits how much of your text Google may quote.',
     'Shorter quotes make your page a weaker source. AI may prefer a page it can quote in full.'],
    ['Membatasi AI',
     'AI bisa memakai halaman ini, tetapi terbatas.',
     'Misalnya, max-snippet atau data-nosnippet membatasi seberapa banyak teks Anda yang boleh dikutip Google.',
     'Kutipan yang lebih pendek membuat halaman Anda menjadi sumber yang lebih lemah. AI bisa lebih memilih halaman yang bisa dikutip utuh.']);
  K('sev.quality',
    ['Page quality',
     'A content check, such as titles or paragraph length.',
     'It does not block AI. It lowers the chance that AI picks a passage from your page.',
     'These are often quick changes you can make in your website editor.'],
    ['Kualitas halaman',
     'Cek konten, misalnya judul atau panjang paragraf.',
     'Cek ini tidak memblokir AI. Cek ini memengaruhi peluang AI memilih bagian dari halaman Anda.',
     'Biasanya ini perubahan cepat yang bisa Anda lakukan di editor website.']);
  K('sev.setup',
    ['Site setup',
     'A technical setting, such as the sitemap, canonical tag, redirects or server speed.',
     'One small gap here does not block AI. Three or more together can lower the grade.',
     'Good setup helps crawlers find and fetch the right version of your page.'],
    ['Pengaturan website',
     'Pengaturan teknis, misalnya sitemap, tag canonical, redirect atau kecepatan server.',
     'Satu kekurangan kecil di sini tidak memblokir AI. Tiga kekurangan atau lebih bisa menurunkan nilai.',
     'Pengaturan yang baik membantu crawler menemukan dan mengambil versi halaman yang tepat.']);
  K('sev.tip',
    ['Tip',
     'A small change that can lift a B to an A.',
     'On a homepage, the checks for paragraphs, sentences and dates are tips. Tips never lower a grade below B.',
     'Tips are optional, but worth doing on pages you want AI to quote.'],
    ['Tips',
     'Perubahan kecil yang bisa menaikkan B menjadi A.',
     'Di halaman beranda, cek paragraf, kalimat dan tanggal berupa tips. Tips tidak pernah menurunkan nilai di bawah B.',
     'Tips tidak wajib, tetapi layak dijalankan di halaman yang ingin Anda kutip oleh AI.']);
  K('sev.question',
    ['Question',
     'Something we could not confirm from outside your site.',
     'It is marked with “?” and does not count against your grade.',
     'Your developer can check it quickly, so you know for sure.'],
    ['Pertanyaan',
     'Hal yang tidak bisa kami pastikan dari luar website Anda.',
     'Item ini ditandai “?” dan tidak mengurangi nilai Anda.',
     'Developer Anda bisa mengeceknya dengan cepat, agar Anda tahu pasti.']);
  K('by.e',
    ['You can do this',
     'You can make this change yourself.',
     'Use your website editor, such as WordPress, Webflow or Wix. You do not need to touch any code.',
     'You do not need to wait for a developer.'],
    ['Bisa Anda lakukan',
     'Perubahan ini bisa Anda lakukan sendiri.',
     'Gunakan editor website Anda, misalnya WordPress, Webflow atau Wix. Anda tidak perlu menyentuh kode.',
     'Anda tidak perlu menunggu developer.']);
  K('by.d',
    ['Ask your web developer',
     'This change needs access to code, server settings or robots.txt.',
     'Send the “What to do” text to your developer. It says exactly what to change.',
     'These changes are usually small, but they need the right access.'],
    ['Tanyakan ke developer website',
     'Perubahan ini membutuhkan akses ke kode, pengaturan server atau robots.txt.',
     'Silakan kirim teks “Yang perlu dilakukan” ke developer Anda. Teks itu sudah menjelaskan apa yang harus diubah.',
     'Perubahannya biasanya kecil, tetapi membutuhkan akses yang tepat.']);

  /* table columns and groups */
  K('col.need',
    ['What AI needs',
     'The requirement that this check tests.',
     'It comes from the AI company’s own documentation, or from a Bliss threshold.',
     'Compare it with “Your page” to see the gap.'],
    ['Yang dibutuhkan AI',
     'Syarat yang diuji oleh cek ini.',
     'Syaratnya berasal dari dokumentasi resmi perusahaan AI, atau dari batas yang ditetapkan Bliss.',
     'Bandingkan dengan kolom “Halaman Anda” untuk melihat selisihnya.']);
  K('col.found',
    ['Your page',
     'What we found on your page for this check.',
     'We read it directly from your page, your robots.txt file or your server’s answer.',
     'This is the evidence behind the grade.'],
    ['Halaman Anda',
     'Yang kami temukan di halaman Anda untuk cek ini.',
     'Kami membacanya langsung dari halaman Anda, file robots.txt atau jawaban server Anda.',
     'Inilah bukti di balik nilai Anda.']);
  K('grp.access',
    ['Access rules',
     'Rules that decide if each AI crawler may fetch and use your page.',
     'They cover robots.txt, noindex, snippet settings and whether the text reaches the crawler.',
     'These rules come from the AI companies. A failure here can block a channel completely.'],
    ['Aturan akses',
     'Aturan yang menentukan apakah setiap crawler AI boleh mengambil dan memakai halaman Anda.',
     'Aturannya mencakup robots.txt, noindex, pengaturan snippet, dan apakah teksnya sampai ke crawler.',
     'Aturan ini berasal dari perusahaan AI. Jika gagal di sini, sebuah channel bisa terblokir sepenuhnya.']);
  K('grp.quality',
    ['Page quality',
     'Checks on the content: titles, paragraphs, sentences, dates and leftover template text.',
     'Bliss sets these thresholds based on how AI answers quote web pages.',
     'They decide how easy it is for AI to quote your page.'],
    ['Kualitas halaman',
     'Cek konten: judul, paragraf, kalimat, tanggal dan sisa teks template.',
     'Bliss menetapkan batas ini berdasarkan cara jawaban AI mengutip halaman web.',
     'Cek ini menentukan seberapa mudah AI mengutip halaman Anda.']);
  K('grp.setup',
    ['Site setup',
     'Technical settings: canonical tag, sitemap, redirects, compression and speed.',
     'Each gap is small. Three or more together can lower a grade.',
     'They help crawlers find, fetch and trust the right page.'],
    ['Pengaturan website',
     'Pengaturan teknis: tag canonical, sitemap, redirect, kompresi dan kecepatan.',
     'Setiap kekurangan kecil. Tiga kekurangan atau lebih bisa menurunkan nilai.',
     'Pengaturan ini membantu crawler menemukan, mengambil dan memercayai halaman yang tepat.']);

  /* landing page */
  K('js.after',
    ['After JavaScript',
     'This channel sees the page after JavaScript runs, like a person in a browser.',
     'Google’s crawler runs the page’s code first, then reads the finished page.',
     'Text that JavaScript adds still reaches this channel.'],
    ['Setelah JavaScript',
     'Channel ini melihat halaman setelah JavaScript berjalan, seperti orang yang membuka browser.',
     'Crawler Google menjalankan kode halaman lebih dulu, lalu membaca halaman yang sudah jadi.',
     'Teks yang ditambahkan JavaScript tetap sampai ke channel ini.']);
  K('js.before',
    ['Before JavaScript',
     'This channel reads the page before any JavaScript runs.',
     'Its crawler downloads the HTML and reads it as it is. It does not run the page’s code.',
     'If your text is added by JavaScript, this channel sees an empty page. Switch JavaScript off in your browser to see what it sees.'],
    ['Sebelum JavaScript',
     'Channel ini membaca halaman sebelum JavaScript berjalan.',
     'Crawler-nya mengunduh HTML dan membacanya apa adanya, tanpa menjalankan kode halaman.',
     'Jika teks Anda ditambahkan oleh JavaScript, channel ini melihat halaman kosong. Silakan matikan JavaScript di browser Anda untuk melihat apa yang dilihatnya.']);

  /* technical words inside the fix texts */
  K('xrobots',
    ['X-Robots-Tag',
     'A setting your server sends with the page, outside the page code.',
     'It works like the robots meta tag. It can carry noindex or nosnippet, so it can hide a page even when the page code looks fine.',
     'It is easy to miss. Ask your developer to check the server settings and any security or cache plugin.'],
    ['X-Robots-Tag',
     'Pengaturan yang dikirim server bersama halaman, di luar kode halaman.',
     'Cara kerjanya seperti robots meta tag. Isinya bisa noindex atau nosnippet, jadi bisa menyembunyikan halaman walaupun kode halamannya terlihat normal.',
     'Pengaturan ini mudah terlewat. Silakan minta developer Anda mengecek pengaturan server serta plugin keamanan atau cache.']);
  K('ssr',
    ['Server-side rendering',
     'The server builds the full page, text included, before it sends it.',
     'The text is in the HTML from the start. JavaScript can still add features after the page loads. Pre-rendering does the same work in advance and saves the result.',
     'Crawlers that do not run JavaScript, such as those of ChatGPT and Meta AI, then receive your full text.'],
    ['Server-side rendering',
     'Server menyusun halaman lengkap, termasuk teksnya, sebelum mengirimnya.',
     'Teksnya sudah ada di HTML sejak awal. JavaScript tetap bisa menambahkan fitur setelah halaman terbuka. Pre-rendering melakukan hal yang sama lebih awal, lalu menyimpan hasilnya.',
     'Dengan begitu, crawler yang tidak menjalankan JavaScript, seperti crawler ChatGPT dan Meta AI, menerima teks Anda secara lengkap.']);

  /* every check, by its English name */
  var CHECK = {};
  function C(name, aliases, en, id){ var k = 'chk.' + name; K(k, en, id); CHECK[name] = k; aliases.concat([name]).forEach(function(a){ ALIAS.push([norm(a), k]); }); }
  var ALIAS = [];
  function norm(s){ return String(s || '').toLowerCase().replace(/[“”‘’"'()]/g, '').replace(/[.,:;!?]/g, '').replace(/\s+/g, ' ').trim(); }

  C('Googlebot may crawl', [],
    ['Googlebot may crawl',
     'Your robots.txt lets Googlebot visit this page.',
     'Googlebot reads its own lines in robots.txt, or the lines under User-agent: *. A Disallow rule that matches this page keeps it out.',
     'AI Overviews and Gemini both use pages that Googlebot collects. If Googlebot is blocked, both get a grade E.'],
    ['Googlebot boleh mengakses',
     'robots.txt Anda mengizinkan Googlebot mengunjungi halaman ini.',
     'Googlebot membaca barisnya sendiri di robots.txt, atau baris di bawah User-agent: *. Aturan Disallow yang cocok dengan halaman ini membuat Googlebot tidak masuk.',
     'AI Overviews dan Gemini sama-sama memakai halaman yang dikumpulkan Googlebot. Jika Googlebot diblokir, keduanya mendapat nilai E.']);
  C('Google-Extended may use the page', [],
    ['Google-Extended may use the page',
     'Your robots.txt lets Google use this page for Gemini.',
     'Google-Extended is a name in robots.txt, with no crawler of its own. It decides if Gemini may use the pages Googlebot collects.',
     'Blocking it removes you from Gemini. It does not remove you from Google Search or AI Overviews.'],
    ['Google-Extended boleh memakai halaman',
     'robots.txt Anda mengizinkan Google memakai halaman ini untuk Gemini.',
     'Google-Extended adalah nama di robots.txt, tanpa crawler sendiri. Nama ini menentukan apakah Gemini boleh memakai halaman yang dikumpulkan Googlebot.',
     'Memblokirnya membuat Anda keluar dari Gemini. Anda tetap ada di Google Search dan AI Overviews.']);
  C('OAI-SearchBot may crawl', [],
    ['OAI-SearchBot may crawl',
     'Your robots.txt lets OpenAI’s search crawler visit this page.',
     'OAI-SearchBot reads its own lines in robots.txt, or the lines under User-agent: *. OpenAI says a change takes about 24 hours to apply.',
     'Without it, ChatGPT search cannot show your page as a source.'],
    ['OAI-SearchBot boleh mengakses',
     'robots.txt Anda mengizinkan crawler search OpenAI mengunjungi halaman ini.',
     'OAI-SearchBot membaca barisnya sendiri di robots.txt, atau baris di bawah User-agent: *. Menurut OpenAI, perubahan butuh sekitar 24 jam untuk berlaku.',
     'Tanpa izin ini, ChatGPT search tidak bisa menampilkan halaman Anda sebagai sumber.']);
  C('meta-webindexer may crawl', [],
    ['meta-webindexer may crawl',
     'Your robots.txt lets Meta’s crawler for Meta AI visit this page.',
     'meta-webindexer reads its own lines in robots.txt, or the lines under User-agent: *.',
     'Without it, Meta AI cannot cite your page in its answers.'],
    ['meta-webindexer boleh mengakses',
     'robots.txt Anda mengizinkan crawler Meta untuk Meta AI mengunjungi halaman ini.',
     'meta-webindexer membaca barisnya sendiri di robots.txt, atau baris di bawah User-agent: *.',
     'Tanpa izin ini, Meta AI tidak bisa mengutip halaman Anda di jawabannya.']);
  C('Page loads', ['Halaman bisa dibuka'],
    ['Page loads',
     'The page opens normally (status 200) for this crawler.',
     'We ask for the page and follow up to 5 redirects. An error, a login page or a robot check counts as not loading.',
     'A page that does not load cannot be read at all.'],
    ['Halaman bisa dibuka',
     'Halaman terbuka normal (status 200) untuk crawler ini.',
     'Kami meminta halaman dan mengikuti hingga 5 redirect. Error, halaman login atau cek robot dihitung sebagai halaman yang tidak terbuka.',
     'Halaman yang tidak terbuka sama sekali tidak bisa dibaca.']);
  C('No noindex', ['Tidak ada noindex', 'Tanpa noindex', 'noindex'],
    ['noindex',
     'A tag that tells search engines to leave a page out. This check passes when the page does not have it.',
     'noindex can sit in the robots meta tag in the page, or in the X-Robots-Tag header from the server. We check both.',
     'Google leaves noindex pages out of Search and its AI features. ChatGPT search follows it too.'],
    ['noindex',
     'Tag yang meminta mesin pencari tidak menampilkan sebuah halaman. Cek ini lolos jika halaman tidak memakai tag tersebut.',
     'noindex bisa ada di robots meta tag di halaman, atau di header X-Robots-Tag dari server. Kami mengecek keduanya.',
     'Google tidak menampilkan halaman dengan noindex di Search maupun fitur AI-nya. ChatGPT search juga mengikutinya.']);
  C('Snippets allowed', ['Quoting allowed (no nosnippet)', 'Cuplikan diizinkan', 'Boleh dikutip (tanpa nosnippet)', 'nosnippet', 'max-snippet:0'],
    ['nosnippet',
     'A setting that stops Google from quoting any text from the page. This check passes when it is not used.',
     'nosnippet, or max-snippet:0, in the robots meta tag or the X-Robots-Tag header switches quoting off.',
     'Google applies this setting to AI Overviews too. With quoting off, your text cannot appear in the summary.'],
    ['nosnippet',
     'Pengaturan yang membuat Google tidak mengutip teks apa pun dari halaman. Cek ini lolos jika pengaturan ini tidak dipakai.',
     'nosnippet atau max-snippet:0 di robots meta tag atau header X-Robots-Tag mematikan kutipan.',
     'Google juga menerapkan pengaturan ini di AI Overviews. Jika kutipan dimatikan, teks Anda tidak bisa muncul di ringkasan.']);
  C('max-snippet not capped', ['No limit on quote length (max-snippet)', 'max-snippet tidak dibatasi', 'Panjang kutipan tidak dibatasi (max-snippet)', 'Tidak ada batas panjang kutipan (max-snippet)', 'max-snippet:-1'],
    ['max-snippet',
     'A setting that limits how many characters Google may quote from the page.',
     'max-snippet:50, for example, allows quotes of 50 characters at most. Not set, or -1, means no limit.',
     'A short limit cuts your text down. Google may then prefer a page it can quote in full.'],
    ['max-snippet',
     'Pengaturan yang membatasi berapa karakter yang boleh dikutip Google dari halaman.',
     'Misalnya, max-snippet:50 hanya mengizinkan kutipan paling banyak 50 karakter. Jika tidak diatur, atau diisi -1, tidak ada batas.',
     'Batas yang pendek memotong teks Anda. Google bisa lebih memilih halaman yang bisa dikutip utuh.']);
  C('No data-nosnippet on main text', ['Main text not hidden (data-nosnippet)', 'Tidak ada data-nosnippet di teks utama', 'Teks utama tidak disembunyikan (data-nosnippet)', 'data-nosnippet'],
    ['data-nosnippet',
     'An HTML attribute that hides one part of a page from quotes.',
     'Google never quotes text inside an element that has data-nosnippet. The rest of the page can still be quoted.',
     'If it wraps your main content, Google cannot quote that content in AI Overviews.'],
    ['data-nosnippet',
     'Atribut HTML yang menyembunyikan satu bagian halaman dari kutipan.',
     'Google tidak pernah mengutip teks di dalam elemen yang memakai data-nosnippet. Bagian lain halaman tetap bisa dikutip.',
     'Jika atribut ini membungkus konten utama Anda, Google tidak bisa mengutip konten itu di AI Overviews.']);
  C('Main text reaches this channel', ['Enough text reaches the crawler', 'Teks utama sampai ke channel ini', 'Cukup teks yang sampai ke crawler', 'Teks yang cukup sampai ke crawler'],
    ['Main text reaches the crawler',
     'Enough of the page’s text reaches this channel’s crawler.',
     'We count the words in the page the crawler receives. Where we can, we also check the finished page.',
     'AI can only quote text it receives. An empty or thin page cannot be quoted.'],
    ['Teks utama sampai ke crawler',
     'Cukup banyak teks halaman yang sampai ke crawler channel ini.',
     'Kami menghitung kata di halaman yang diterima crawler. Jika memungkinkan, kami juga mengecek halaman yang sudah jadi.',
     'AI hanya bisa mengutip teks yang diterimanya. Halaman kosong atau tipis tidak bisa dikutip.']);
  C('Main text is in the raw HTML', ['Text is in the page before JavaScript runs', 'Teks utama ada di HTML mentah', 'Teks sudah ada sebelum JavaScript berjalan', 'Teks sudah ada di halaman sebelum JavaScript berjalan'],
    ['Text is in the HTML before JavaScript',
     'The main text is in the page’s HTML before any JavaScript runs.',
     'We read the HTML as it arrives, without running any code, and count the words.',
     'ChatGPT and Meta AI read the page this way. If the text only appears after JavaScript runs, they see an empty page.'],
    ['Teks ada di HTML sebelum JavaScript',
     'Teks utama sudah ada di HTML halaman sebelum JavaScript berjalan.',
     'Kami membaca HTML apa adanya, tanpa menjalankan kode apa pun, lalu menghitung katanya.',
     'ChatGPT dan Meta AI membaca halaman dengan cara ini. Jika teks baru muncul setelah JavaScript berjalan, mereka melihat halaman kosong.']);
  C('One main title', ['Satu judul utama'],
    ['One main title (H1)',
     'The page has exactly one main title, also called Heading 1 or H1.',
     'We count the H1 headings in the page code.',
     'One H1 tells AI clearly what the page is about. Several H1 titles blur the topic.'],
    ['Satu judul utama (H1)',
     'Halaman punya tepat satu judul utama, disebut juga Heading 1 atau H1.',
     'Kami menghitung heading H1 di kode halaman.',
     'Satu H1 memberi tahu AI dengan jelas tentang isi halaman. Beberapa H1 membuat topiknya kabur.']);
  C('Section titles', ['Judul bagian'],
    ['Section titles (H2)',
     'The page has 2 or more section titles under the main title, usually Heading 2 or H2.',
     'We count the headings below the main title.',
     'Section titles split the page into answers. AI can then match one section to one question.'],
    ['Judul bagian (H2)',
     'Halaman punya 2 judul bagian atau lebih di bawah judul utama, biasanya Heading 2 atau H2.',
     'Kami menghitung heading di bawah judul utama.',
     'Judul bagian membagi halaman menjadi beberapa jawaban. AI lalu bisa mencocokkan satu bagian dengan satu pertanyaan.']);
  C('Paragraphs AI can quote', ['Paragraf yang bisa dikutip AI'],
    ['Paragraphs AI can quote',
     'The page has 3 or more paragraphs of 40 words or more.',
     'We count the paragraphs in the main text. 70 to 150 words is the best length.',
     'AI quotes whole passages. Short lines give it nothing complete to quote.'],
    ['Paragraf yang bisa dikutip AI',
     'Halaman punya 3 paragraf atau lebih yang panjangnya 40 kata atau lebih.',
     'Kami menghitung paragraf di teks utama. Panjang terbaik 70 sampai 150 kata.',
     'AI mengutip bagian yang utuh. Baris pendek tidak memberi AI bagian utuh untuk dikutip.']);
  C('Sentences name your business', ['Sentences name your business, not we, it, this or they', 'Kalimat menyebut nama bisnis Anda'],
    ['Sentences name your business',
     'Most sentences name your business, instead of starting with “we”, “it”, “this” or “they”.',
     'We check the first word of each sentence. The target is 2 in 3 sentences or more.',
     'A quoted sentence stands alone. With your name in it, the credit stays with you.'],
    ['Kalimat menyebut nama bisnis Anda',
     'Sebagian besar kalimat menyebut nama bisnis Anda, bukan diawali “kami”, “ini”, “itu” atau “mereka”.',
     'Kami mengecek kata pertama di setiap kalimat. Targetnya 2 dari 3 kalimat atau lebih.',
     'Kalimat yang dikutip berdiri sendiri. Dengan nama Anda di dalamnya, pembaca tahu kalimat itu milik bisnis Anda.']);
  C('No sample text from the template', ['Tidak ada teks contoh dari template'],
    ['No sample text from the template',
     'The page has no leftover sample text, such as “Lorem ipsum”.',
     'We look for common placeholder phrases from website templates.',
     'Sample text makes the page look unfinished. AI may skip the page, or quote the sample text by mistake.'],
    ['Tidak ada teks contoh dari template',
     'Halaman tidak punya sisa teks contoh, misalnya “Lorem ipsum”.',
     'Kami mencari kalimat contoh yang umum dipakai template website.',
     'Teks contoh membuat halaman terlihat belum selesai. AI bisa melewati halaman itu, atau malah mengutip teks contohnya.']);
  C('A visible date', ['Tanggal yang terlihat'],
    ['A visible date',
     'The page shows a date that people can see, such as “Updated 3 March 2026”.',
     'We look for a date in the visible text of the page.',
     'AI answers prefer recent information. A visible date shows that the page is up to date.'],
    ['Tanggal yang terlihat',
     'Halaman menampilkan tanggal yang bisa dilihat pengunjung, misalnya “Diperbarui 3 Maret 2026”.',
     'Kami mencari tanggal di teks halaman yang terlihat.',
     'Jawaban AI lebih memilih informasi terbaru. Tanggal yang terlihat menunjukkan bahwa halaman masih aktual.']);
  C('Canonical points here', ['Canonical tag points to this page', 'Canonical mengarah ke halaman ini', 'Tag canonical mengarah ke halaman ini'],
    ['Canonical tag',
     'A tag that names the main address of a page when the same content exists at several addresses.',
     'It is a link tag in the page head. If it points to another address, Google may use that other page instead of this one.',
     'A wrong canonical tag can send the credit for your text to a different page.'],
    ['Tag canonical',
     'Tag yang menentukan alamat utama sebuah halaman jika konten yang sama ada di beberapa alamat.',
     'Tag ini berupa link tag di bagian head halaman. Jika tag ini mengarah ke alamat lain, Google bisa memakai halaman lain itu, bukan halaman ini.',
     'Tag canonical yang salah bisa membuat teks Anda dihitung sebagai milik halaman lain.']);
  C('Listed in sitemap.xml', ['Page is in sitemap.xml', 'Tercantum di sitemap.xml', 'Halaman ada di sitemap.xml', 'sitemap.xml'],
    ['sitemap.xml',
     'A file that lists the pages you want search engines to find.',
     'We look for this page in the sitemaps named in robots.txt and in the usual places, such as yoursite.com/sitemap.xml.',
     'It helps crawlers find new and updated pages faster.'],
    ['sitemap.xml',
     'File yang berisi daftar halaman yang ingin Anda tampilkan ke mesin pencari.',
     'Kami mencari halaman ini di sitemap yang disebut di robots.txt dan di lokasi umum, misalnya websiteanda.com/sitemap.xml.',
     'Sitemap membantu crawler menemukan halaman baru dan halaman yang diperbarui lebih cepat.']);
  C('No redirect', ['Tanpa redirect'],
    ['Redirect',
     'A redirect sends visitors from one address to another. This check passes when the page loads at its own address.',
     'We follow each redirect and count them.',
     'Each redirect adds waiting time. Crawlers may also save the final address instead of this one.'],
    ['Redirect',
     'Redirect mengalihkan pengunjung dari satu alamat ke alamat lain. Cek ini lolos jika halaman terbuka di alamatnya sendiri.',
     'Kami mengikuti setiap redirect dan menghitung jumlahnya.',
     'Setiap redirect menambah waktu tunggu. Crawler juga bisa menyimpan alamat akhirnya, bukan alamat ini.']);
  C('Compression on', ['Compression switched on', 'Kompresi aktif', 'gzip', 'Brotli'],
    ['Compression',
     'Your server shrinks the page before sending it, with gzip, Brotli or zstd.',
     'We check the Content-Encoding header in your server’s answer.',
     'Smaller files arrive faster, for crawlers and for people.'],
    ['Kompresi',
     'Server Anda memperkecil ukuran halaman sebelum mengirimnya, dengan gzip, Brotli atau zstd.',
     'Kami mengecek header Content-Encoding di jawaban server Anda.',
     'File yang lebih kecil sampai lebih cepat, baik untuk crawler maupun pengunjung.']);
  C('Server answers fast', ['Server answers within 2 seconds', 'Server merespons cepat', 'Server merespons dalam 2 detik', 'Server menjawab dalam 2 detik'],
    ['Server speed',
     'Your server starts to answer within 2 seconds.',
     'We measure the time until the first part of the answer arrives at our server.',
     'Slow servers get visited less often by crawlers. Some crawlers give up on a page that is too slow.'],
    ['Kecepatan server',
     'Server Anda mulai menjawab dalam 2 detik.',
     'Kami mengukur waktu sampai bagian pertama jawaban tiba di server kami.',
     'Server yang lambat lebih jarang dikunjungi crawler. Sebagian crawler berhenti mencoba jika halaman terlalu lambat.']);
  K('chk.gets',
    ['Crawler gets the page',
     'Your site sends this crawler a normal page.',
     'We ask for the page using this crawler’s name and check the answer.',
     'Some security tools block crawlers by mistake. Then the AI channel gets an error instead of your page.'],
    ['Crawler mendapat halaman',
     'Website Anda mengirim halaman normal ke crawler ini.',
     'Kami meminta halaman dengan memakai nama crawler ini, lalu mengecek jawabannya.',
     'Sebagian tool keamanan memblokir crawler tanpa sengaja. Akibatnya, channel AI menerima error, bukan halaman Anda.']);

  var TERM = {'heading 1':'chk.One main title', 'heading 2':'chk.Section titles', 'robotstxt':'robots', 'x-robots-tag':'xrobots', 'server-side rendering':'ssr', 'pre-rendering':'ssr'};
  ALIAS.sort(function(a, b){ return b[0].length - a[0].length; });
  function checkKey(text){
    var n = norm(text);
    var m = n.match(/^(googlebot|oai-searchbot|meta-webindexer) (may crawl|diizinkan masuk|boleh mengakses)/);
    if(m) return CHECK[{googlebot:'Googlebot', 'oai-searchbot':'OAI-SearchBot', 'meta-webindexer':'meta-webindexer'}[m[1]] + ' may crawl'];
    if(/^google-extended/.test(n)) return CHECK['Google-Extended may use the page'];
    if(/(gets the page|mendapat halaman)$/.test(n)) return 'chk.gets';
    for(var i = 0; i < ALIAS.length; i++){ var a = ALIAS[i][0]; if(n === a || n.indexOf(a + ' ') === 0) return ALIAS[i][1]; }
    return null;
  }
  var SEV = {'stops a channel':'sev.stop', 'menghentikan channel':'sev.stop', 'menghentikan kanal':'sev.stop',
    'ai gets no text':'sev.notext', 'ai tidak mendapat teks':'sev.notext',
    'limits ai use':'sev.limit', 'membatasi ai':'sev.limit', 'membatasi pemakaian ai':'sev.limit',
    'page quality':'sev.quality', 'kualitas halaman':'sev.quality',
    'site setup':'sev.setup', 'pengaturan website':'sev.setup', 'pengaturan situs':'sev.setup',
    'tip':'sev.tip', 'tips':'sev.tip', 'question':'sev.question', 'pertanyaan':'sev.question', 'to check':'sev.question', 'perlu dicek':'sev.question'};
  var CH = ['aio', 'gemini', 'chatgpt', 'meta'];
  var CHNAME = {'ai overviews':'aio', 'google ai overviews':'aio', 'gemini':'gemini', 'gemini app':'gemini', 'chatgpt':'chatgpt', 'meta ai':'meta'};

  /* ---------- marking the terms ---------- */

  function mark(el, key, extra){
    if(!el || !G[key] || el.getAttribute('data-tip')) return;
    el.classList.add('bt-term');
    el.setAttribute('data-tip', key);
    if(extra) el.setAttribute('data-tip-x', extra);
    if(el.hasAttribute('title')){                       // our tooltip replaces the browser's
      if(!extra && el.title) el.setAttribute('data-tip-x', el.title);
      el.removeAttribute('title');
    }
    if(!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
  }
  // Wraps the first text in an element (a check name sits before its chips).
  function markText(el, key){
    if(!el || el.querySelector('.bt-term[data-tip="' + key + '"]')) return;
    for(var n = el.firstChild; n; n = n.nextSibling){
      if(n.nodeType === 3 && n.textContent.trim()){
        var s = document.createElement('span');
        n.parentNode.insertBefore(s, n); s.appendChild(n);
        mark(s, key); return;
      }
      if(n.nodeType === 1 && n.textContent.trim()) return;   // logos have no text, so they are skipped
    }
  }
  function firstText(el){
    var t = '';
    for(var n = el.firstChild; n; n = n.nextSibling){ if(n.nodeType === 3) t += n.textContent; else if(t.trim()) break; }
    return t.trim() || el.textContent.trim();
  }
  function $$(root, sel){ return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function nextEl(el){ var n = el.nextElementSibling; return n; }

  function decorate(root){
    root = root || document;
    // grade tiles
    $$(root, '.gh').forEach(function(gh, i){
      var ch = gh.querySelector('.ch'), k = CHNAME[norm(ch ? ch.textContent : '')] || CH[i % 4];
      mark(ch, 'ch.' + k);
      var g = gh.querySelector('.ring b'), letter = g ? g.textContent.trim() : '';
      mark(gh.querySelector('.stw'), 'grade', GRADE_X[letter] || '');
      var cf = gh.querySelector('.cf');
      if(cf) mark(cf, cf.classList.contains('l') ? 'conf.l' : cf.classList.contains('n') ? 'conf.n' : 'conf.c');
    });
    // older grade cards
    $$(root, '.gt').forEach(function(gt){
      var nm = gt.querySelector('.nm'); if(nm && CHNAME[norm(nm.textContent)]) mark(nm, 'ch.' + CHNAME[norm(nm.textContent)]);
      var cf = gt.querySelector('.conf');
      if(cf) mark(cf, /conf-l/.test(cf.className) ? 'conf.l' : /conf-n/.test(cf.className) ? 'conf.n' : 'conf.c');
    });
    // the 4 summary tiles
    $$(root, '.fsum').forEach(function(fs){
      $$(fs, '.fs').forEach(function(t, i){ mark(t.querySelector('small'), ['fs.read', 'fs.fix', 'fs.you', 'fs.dev'][i]); });
    });
    // the 6 number tiles, always in this order
    $$(root, '.grid.g6').forEach(function(g){
      $$(g, '.kpi').forEach(function(t, i){ mark(t.querySelector('.l'), ['kpi.words', 'kpi.para', 'kpi.ruler', 'kpi.title', 'kpi.person', 'kpi.weight'][i]); });
    });
    // cards, found by what they hold
    $$(root, '.card').forEach(function(c){
      var h = c.querySelector('h3'); if(!h) return;
      if(c.querySelector('.wg')) mark(h, 'served');
      else if(c.querySelector('.bar')) mark(h, 'paralen');
      else if(c.querySelector('.ol')) mark(h, 'titles');
    });
    $$(root, '.wg .wn').forEach(function(w){
      var n = norm(firstText(w));
      var k = /^(our tool|tool kami)/.test(n) ? 'crawler.tool' : /^googlebot/.test(n) ? 'crawler.googlebot' : /^oai-searchbot/.test(n) ? 'crawler.oai' : /^meta-webindexer/.test(n) ? 'crawler.meta' : null;
      if(k) markText(w, k);
    });
    $$(root, '.sechead').forEach(function(s){
      var h = s.querySelector('h3'), nx = nextEl(s); if(!h || !nx) return;
      if(nx.querySelector('.wr')) mark(h, 'whygrade');
      else if(/\bg3\b/.test(nx.className)) mark(h, 'cannot');
    });
    $$(root, '.wr .wnn').forEach(function(w){ var k = CHNAME[norm(w.textContent)]; if(k) markText(w, 'ch.' + k); });
    $$(root, '.accwrap').forEach(function(a){
      for(var p = a.previousElementSibling; p; p = p.previousElementSibling){ if(p.tagName === 'H3'){ mark(p, 'robots'); break; } }
    });
    // chips
    $$(root, '.src').forEach(function(s){
      mark(s, s.classList.contains('src-p') ? 'src.p' : s.classList.contains('src-m') ? 'src.m' : 'src.u');
    });
    $$(root, '.sev').forEach(function(s){ var k = SEV[norm(s.textContent)]; if(k) mark(s, k); });
    $$(root, '.by').forEach(function(s){ mark(s, s.classList.contains('by-e') ? 'by.e' : 'by.d'); });
    // check names: the fix list and the full table
    $$(root, '.fxr .ft, td.ck').forEach(function(el){
      var k = (el.getAttribute('data-key') && CHECK[el.getAttribute('data-key')]) || checkKey(firstText(el));
      if(k) markText(el, k);
    });
    // table headers and groups
    $$(root, 'table.at').forEach(function(t){
      var th = $$(t, 'thead th'); mark(th[2], 'col.need'); mark(th[3], 'col.found');
      $$(t, 'tr.grp td').forEach(function(td, i){ mark(td, ['grp.access', 'grp.quality', 'grp.setup'][i]); });
    });
    // technical words inside the fix texts
    $$(root, '.fdo .hc, .fdo .hk, .fdo .hg, td.fx .hc, td.fx .hk, td.fx .hg, #learn .mono').forEach(function(s){
      var n = norm(s.textContent), k = TERM[n] || checkKey(n);
      if(k) mark(s, k);
    });
    // landing page: what each channel reads
    $$(root, '.chcard').forEach(function(card){
      $$(card, '.chl').forEach(function(r, i){
        var nm = r.querySelector('strong'); if(nm) mark(nm, 'ch.' + (CHNAME[norm(nm.textContent)] || CH[i % 4]));
        var p = r.querySelector('.rd-pill'); if(p) mark(p, p.classList.contains('rd-r') ? 'js.after' : 'js.before');
      });
      hint(card, 'append');
    });
    // one hint above each report
    $$(root, '.dhead').forEach(function(h){ if(h.parentNode.querySelector('.bt-term')) hint(h, 'after'); });
  }

  function hint(el, where){
    var host = where === 'after' ? el.parentNode : el;
    if(host.querySelector(':scope > .bt-hint')) return;
    var touch = window.matchMedia && matchMedia('(hover: none)').matches;
    var p = document.createElement('p');
    p.className = 'bt-hint noprint';
    p.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg><span>' +
      (ID ? (touch ? 'Ketuk kata dengan <span class="bt-ex">garis bawah titik-titik</span> untuk melihat penjelasannya.'
                   : 'Kata dengan <span class="bt-ex">garis bawah titik-titik</span> punya penjelasan. Arahkan kursor ke kata itu untuk membacanya, atau ketuk di ponsel.')
          : (touch ? 'Tap any word with a <span class="bt-ex">dotted underline</span> to see what it means.'
                   : 'Words with a <span class="bt-ex">dotted underline</span> have an explanation. Hover over one to read it, or tap it on a phone.')) + '</span>';
    if(where === 'after') el.parentNode.insertBefore(p, el.nextSibling); else el.appendChild(p);
  }

  /* ---------- the explanation box ---------- */

  var pop = document.createElement('div');
  pop.className = 'bt-pop'; pop.id = 'bt-pop'; pop.setAttribute('role', 'tooltip');
  var cur = null, showT = 0, hideT = 0, lastPtr = 'mouse', px = 0, py = 0;

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]; }); }
  function fill(t){
    var e = G[t.getAttribute('data-tip')]; if(!e) return false;
    var x = t.getAttribute('data-tip-x');
    pop.innerHTML = '<p class="bt-t">' + esc(e[0]) + '</p>' +
      '<p class="bt-s"><b>' + LBL[0] + '</b>' + esc(e[1]) + '</p>' +
      '<p class="bt-s"><b>' + LBL[1] + '</b>' + esc(e[2]) + '</p>' +
      '<p class="bt-s"><b>' + LBL[2] + '</b>' + esc(e[3]) + '</p>' +
      (x ? '<p class="bt-x"><b>' + LBL[3] + '</b>' + esc(x) + '</p>' : '') +
      '<span class="bt-ar" aria-hidden="true"></span>';
    return true;
  }
  function place(){
    if(!cur || !document.body.contains(cur)){ hide(); return; }
    var rs = cur.getClientRects(), r = rs[0];
    if(!r){ hide(); return; }
    if(rs.length > 1 && lastPtr === 'mouse'){         // a term that wraps: use the line under the pointer
      for(var i = 0; i < rs.length; i++){ if(py >= rs[i].top - 2 && py <= rs[i].bottom + 2){ r = rs[i]; break; } }
    }
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    pop.style.maxWidth = Math.min(340, vw - 24) + 'px';
    var pw = pop.offsetWidth, ph = pop.offsetHeight, gap = 10;
    var up = r.bottom + gap + ph > vh - 8 && r.top - gap - ph > 8;
    var top = up ? r.top - gap - ph : r.bottom + gap;
    var mid = r.left + r.width / 2;
    var left = Math.max(12, Math.min(mid - pw / 2, vw - pw - 12));
    pop.style.left = Math.round(left) + 'px'; pop.style.top = Math.round(top) + 'px';
    pop.classList.toggle('up', up);
    var ar = pop.querySelector('.bt-ar');
    if(ar) ar.style.left = Math.round(Math.max(14, Math.min(mid - left, pw - 14)) - 6) + 'px';
  }
  function show(t){
    clearTimeout(showT); clearTimeout(hideT);
    if(cur && cur !== t){ cur.classList.remove('bt-on'); cur.removeAttribute('aria-describedby'); }
    if(!fill(t)) return;
    cur = t; t.classList.add('bt-on'); t.setAttribute('aria-describedby', 'bt-pop');
    if(!pop.parentNode) document.body.appendChild(pop);
    pop.classList.add('on'); place();
  }
  function hide(){
    clearTimeout(showT); clearTimeout(hideT);
    pop.classList.remove('on');
    if(cur){ cur.classList.remove('bt-on'); cur.removeAttribute('aria-describedby'); }
    cur = null;
  }
  function term(el){ return el && el.closest ? el.closest('.bt-term') : null; }

  document.addEventListener('pointerdown', function(e){ lastPtr = e.pointerType || 'mouse'; }, true);
  document.addEventListener('pointermove', function(e){ px = e.clientX; py = e.clientY; }, {passive:true});
  document.addEventListener('pointerover', function(e){
    if(e.pointerType && e.pointerType !== 'mouse') return;
    lastPtr = 'mouse';
    var t = term(e.target);
    if(t){ clearTimeout(hideT); if(t !== cur){ clearTimeout(showT); px = e.clientX; py = e.clientY; showT = setTimeout(function(){ show(t); }, 120); } }
    else if(pop.contains(e.target)) clearTimeout(hideT);
  });
  document.addEventListener('pointerout', function(e){
    if(e.pointerType && e.pointerType !== 'mouse') return;
    var t = term(e.target), to = e.relatedTarget;
    if(!t && !pop.contains(e.target)) return;
    if(to && ((t && t.contains(to)) || pop.contains(to) || (cur && cur.contains(to)))) return;
    clearTimeout(showT); hideT = setTimeout(hide, 180);
  });
  document.addEventListener('click', function(e){
    var t = term(e.target);
    if(t){
      if(lastPtr !== 'mouse'){ e.preventDefault(); if(cur === t && pop.classList.contains('on')) hide(); else show(t); }
      else show(t);
      return;
    }
    if(!pop.contains(e.target)) hide();
  });
  document.addEventListener('focusin', function(e){ var t = term(e.target); if(t && lastPtr === 'mouse') show(t); });
  document.addEventListener('focusout', function(e){ if(term(e.target) && e.target === cur && lastPtr === 'mouse') hideT = setTimeout(hide, 120); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && cur){ hide(); return; }
    var t = term(e.target);
    if(t && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); if(cur === t) hide(); else show(t); }
  });
  window.addEventListener('scroll', function(){ if(cur) place(); }, {passive:true});
  window.addEventListener('resize', function(){ if(cur) place(); });

  /* ---------- styles ---------- */

  var css = document.createElement('style');
  css.textContent =
    '.bt-term{text-decoration-line:underline;text-decoration-style:dotted;text-decoration-color:rgba(67,7,25,.42);text-decoration-thickness:1.5px;text-underline-offset:3px;cursor:help;-webkit-tap-highlight-color:transparent}' +
    '.bt-term:hover,.bt-term.bt-on{text-decoration-color:var(--brand,#70020F)}' +
    '.bt-term:focus{outline:none}.bt-term:focus-visible{outline:2px solid var(--brand,#70020F);outline-offset:2px;border-radius:3px}' +
    '.bt-pop{position:fixed;left:0;top:0;z-index:2147483000;box-sizing:border-box;max-width:340px;padding:14px 16px 12px;background:#fff;color:var(--body,#55595C);' +
      'border:1px solid var(--line,#E6E6E6);border-radius:12px;box-shadow:0 14px 34px rgba(67,7,25,.14),0 2px 6px rgba(67,7,25,.06);' +
      'font:400 13.5px/1.5 var(--sans,system-ui,-apple-system,"Segoe UI",Arial,sans-serif);text-align:left;letter-spacing:0;text-transform:none;white-space:normal;' +
      'opacity:0;visibility:hidden;transform:translateY(4px);transition:opacity .14s ease,transform .14s ease,visibility .14s}' +
    '.bt-pop.up{transform:translateY(-4px)}' +
    '.bt-pop.on{opacity:1;visibility:visible;transform:none}' +
    '.bt-pop .bt-t{margin:0 0 8px;font-size:14.5px;font-weight:600;line-height:1.35;color:var(--ink,#430719)}' +
    '.bt-pop .bt-s{margin:0 0 8px}.bt-pop .bt-s:last-of-type{margin-bottom:0}' +
    '.bt-pop b{display:block;margin:0 0 1px;font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--brand,#70020F)}' +
    '.bt-pop .bt-x{margin:10px 0 0;padding:9px 0 0;border-top:1px solid var(--line2,#EFEDE9);color:var(--ink,#430719)}' +
    '.bt-pop .bt-x b{color:var(--muted,#686C70)}' +
    '.bt-ar{position:absolute;top:-6px;width:10px;height:10px;background:#fff;border-left:1px solid var(--line,#E6E6E6);border-top:1px solid var(--line,#E6E6E6);transform:rotate(45deg)}' +
    '.bt-pop.up .bt-ar{top:auto;bottom:-6px;border:0;border-right:1px solid var(--line,#E6E6E6);border-bottom:1px solid var(--line,#E6E6E6)}' +
    '.bt-hint{display:flex;align-items:flex-start;gap:8px;margin:14px 0 0;font-size:13px;line-height:1.5;color:var(--muted,#686C70)}' +
    '.bt-hint svg{flex:none;margin-top:2px;color:var(--brand,#70020F)}' +
    '.bt-hint .bt-ex{text-decoration-line:underline;text-decoration-style:dotted;text-decoration-color:rgba(67,7,25,.42);text-decoration-thickness:1.5px;text-underline-offset:3px;color:var(--ink,#430719)}' +
    '.dhead + .bt-hint{margin:14px 0 0}' +
    '@media (prefers-reduced-motion: reduce){.bt-pop,.bt-pop.up{transition:none;transform:none}}' +
    '@media print{.bt-pop,.bt-hint{display:none !important}.bt-term{text-decoration:none !important}}';
  document.head.appendChild(css);

  /* ---------- run now, and again whenever the report is drawn ---------- */

  function start(){
    decorate(document);
    var out = document.getElementById('results');
    if(out && window.MutationObserver){
      var busy = 0;
      new MutationObserver(function(){
        if(busy) return;
        busy = requestAnimationFrame(function(){ busy = 0; if(cur && !document.body.contains(cur)) hide(); decorate(out); });
      }).observe(out, {childList:true, subtree:true});
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
