
/* ============================================
   SIDEBAR — MOBILE TOGGLE
   ============================================ */
const sidebar   = document.getElementById('sidebar');
const mobToggle = document.getElementById('mobToggle');
const mobLogo   = document.getElementById('mobLogo');

if (mobToggle && sidebar) {
  mobToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    mobToggle.classList.toggle('is-open');
    const isOpen = mobToggle.classList.contains('is-open');
    mobToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    if (mobLogo) mobLogo.style.visibility = isOpen ? 'hidden' : '';
  });
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !mobToggle.contains(e.target)) {
      sidebar.classList.remove('open');
      mobToggle.classList.remove('is-open');
      mobToggle.setAttribute('aria-label', 'Open menu');
      if (mobLogo) mobLogo.style.visibility = '';
    }
  });
}

/* ============================================
   SIDEBAR — ACTIVE NAV ON SCROLL
   ============================================ */
const sections = document.querySelectorAll('section[id], div[id].cta-band');
const navLinks = document.querySelectorAll('.sidebar-nav a');

function onScroll() {
  let current = '';
  // trigger nav active state a bit sooner — use viewport-based offset with clamps
  const offset = Math.min(360, Math.max(160, window.innerHeight * 0.35));
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= offset) current = sec.id;
  });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ============================================
   SCROLL REVEAL
   ============================================ */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => obs.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

/* ============================================
   EMAIL COPY
   ============================================ */
const emailRow     = document.getElementById('emailRow');
const copyFeedback = document.getElementById('copyFeedback');
if (emailRow) {
  emailRow.addEventListener('click', () => {
    const email = 'ota.skvor@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      if (copyFeedback) { copyFeedback.textContent = '✓ Copied'; setTimeout(() => copyFeedback.textContent = '', 2000); }
    }).catch(() => {
      if (copyFeedback) { copyFeedback.textContent = email; setTimeout(() => copyFeedback.textContent = '', 3000); }
    });
  });
}

/* ============================================
   CASE STUDY TOC — active on scroll
   ============================================ */
const tocLinks = document.querySelectorAll('.case-toc a');
if (tocLinks.length) {
  const tocObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-15% 0px -75% 0px' });
  tocLinks.forEach(a => { const el = document.getElementById(a.getAttribute('href').replace('#','')); if (el) tocObs.observe(el); });
}

/* ============================================
   SUMMARIZE DRAWER
   ============================================ */
const summarizeBtn   = document.getElementById('summarizeBtn');
const summarizePopup = document.getElementById('summarizePopup');
const summarizeClose = document.getElementById('summarizeClose');
if (summarizeBtn && summarizePopup) summarizeBtn.addEventListener('click', () => summarizePopup.classList.toggle('open'));
if (summarizeClose && summarizePopup) summarizeClose.addEventListener('click', () => summarizePopup.classList.remove('open'));

/* ============================================
   GLOBAL CURSOR GRID REVEAL — DESKTOP ONLY
   ============================================ */
if (window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)').matches) {
  const gridOverlay = document.createElement('div');
  gridOverlay.id = 'cursor-grid-overlay';
  gridOverlay.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:var(--nav-w);pointer-events:none;z-index:1;overflow:hidden;';
  document.body.appendChild(gridOverlay);

  const gridMask = document.createElement('div');
  gridMask.id = 'cursor-grid-mask';
  gridMask.style.cssText = [
    'position:absolute;inset:0',
    'background-image:linear-gradient(rgba(15,15,15,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(15,15,15,0.07) 1px,transparent 1px)',
    'background-size:42px 42px',
    'opacity:0',
    'transition:opacity 0.45s ease',
    '-webkit-mask-image:radial-gradient(circle 150px at -999px -999px,black 0%,transparent 100%)',
    'mask-image:radial-gradient(circle 150px at -999px -999px,black 0%,transparent 100%)',
  ].join(';');
  gridOverlay.appendChild(gridMask);

  let lastX = -999, lastY = -999, raf = null;
  const navW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-w')) || 210;

  document.addEventListener('mousemove', e => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (!raf) {
      raf = requestAnimationFrame(() => {
        // Adjust x relative to where the overlay starts
        const adjustedX = lastX - navW;
        const v = `radial-gradient(circle 150px at ${adjustedX}px ${lastY}px,black 0%,transparent 100%)`;
        gridMask.style.webkitMaskImage = v;
        gridMask.style.maskImage = v;
        gridMask.style.opacity = '1';
        raf = null;
      });
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => { gridMask.style.opacity = '0'; });
}

/* ============================================
   STAGGERED SKILL TAG HOVER
   ============================================ */
document.querySelectorAll('.skill-item, .hero-skills-compact').forEach(panel => {
  panel.querySelectorAll('.skill-chip, .hero-skill-tag').forEach((tag, i) => {
    tag.style.transitionDelay = (i * 10) + 'ms';
  });
});

/* Skills blocks are no longer expandable — replaced with list layout */

/* Expandable notes are created later using language-aware data keys. */

/* ============================================
   LIGHTBOX
   ============================================ */
function initLightbox() {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.innerHTML = '<button class="lightbox-close" id="lightboxClose">×</button><img class="lightbox-img" id="lightboxImg" src="" alt="" />';
    document.body.appendChild(lb);
    lb.addEventListener('click', e => { if (e.target === lb || e.target.id === 'lightboxClose') lb.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
  }
  document.querySelectorAll('.img-gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      document.getElementById('lightboxImg').src = img.src;
      lb.classList.add('open');
    });
  });
}
initLightbox();

function initExpandablePreviewCards() {
  document.querySelectorAll('[data-expand-preview]').forEach(wrapper => {
    const btn = wrapper.querySelector('.expand-preview-btn');
    const label = wrapper.querySelector('.expand-preview-label');
    if (!btn || !label) return;

    const getLanguage = () => localStorage.getItem('portfolio_lang') || document.documentElement.lang || 'en';
    const getLabelText = (expanded, lang) => {
      lang = lang || getLanguage();
      if (expanded) return label.dataset[`preview${lang === 'cs' ? 'Cs' : 'En'}Expanded`] || (lang === 'cs' ? 'Skrýt náhled' : 'Collapse preview');
      return label.dataset[`preview${lang === 'cs' ? 'Cs' : 'En'}`] || (lang === 'cs' ? 'Zobrazit celé' : 'Expand preview');
    };

    const setState = (expanded, lang) => {
      const currentLang = lang || getLanguage();
      wrapper.classList.toggle('expanded', expanded);
      btn.setAttribute('aria-expanded', expanded.toString());
      label.textContent = getLabelText(expanded, currentLang);
      label.dataset.previewState = expanded ? 'expanded' : 'collapsed';
    };

    const refreshLabels = (lang) => {
      const expanded = wrapper.classList.contains('expanded');
      setState(expanded, lang);
    };

    const toggle = () => setState(!wrapper.classList.contains('expanded'));

    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggle();
    });

    wrapper.addEventListener('click', (event) => {
      if (event.target !== btn && !btn.contains(event.target)) {
        toggle();
      }
    });

    document.addEventListener('click', (event) => {
      const option = event.target.closest('.lang-option');
      if (option && option.dataset.lang) {
        refreshLabels(option.dataset.lang);
      }
    });

    window.addEventListener('storage', (event) => {
      if (event.key === 'portfolio_lang') {
        refreshLabels(event.newValue || 'en');
      }
    });

    setState(false);
  });
}
initExpandablePreviewCards();

/* ============================================
   BUTTON HOVER — border-trace wipe effect
   ============================================ */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.btn-primary, .btn-outline, .tl-btn.primary').forEach(btn => {
    btn.classList.add('btn-wipe');
  });
}

/* ============================================
   SECTION LABEL COUNTER ANIMATION
   ============================================ */
document.querySelectorAll('.stat-num').forEach(el => {
  const text = el.textContent.trim();
  const num = parseInt(text.replace(/[^0-9]/g, ''));
  if (!num || num > 500) return;
  const prefix = text.match(/^[^0-9]*/)[0];
  const suffix = text.match(/[^0-9]*$/)[0];
  const obs2 = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      obs2.unobserve(e.target);
      const duration = 900;
      const startTime = performance.now();
      const step = ts => {
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(eased * num) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  obs2.observe(el);
});

/* ============================================
   TIMELINE ITEMS — stagger on reveal
   ============================================ */
document.querySelectorAll('.t-item').forEach((item, i) => {
  item.style.transitionDelay = (i * 0.06) + 's';
  item.classList.add('reveal');
  const obs3 = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs3.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  obs3.observe(item);
});

/* ============================================
   PAGE TRANSITION (subtle fade)
   ============================================ */

function showPage() {
  document.body.style.transition = 'opacity 0.35s ease';
  document.body.style.opacity = '1';
  document.body.style.overflow = '';
}

document.querySelectorAll('a[href]').forEach(a => {
  const href = a.getAttribute('href');

  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('http') ||
    href.startsWith('mailto') ||
    href.startsWith('tel:')
  ) {
    return;
  }

  a.addEventListener('click', e => {
    if (
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }

    e.preventDefault();

    document.body.style.transition = 'opacity 0.22s ease';
    document.body.style.opacity = '0';

    setTimeout(() => {
      window.location.href = href;
    }, 210);
  });
});

requestAnimationFrame(() => {
  requestAnimationFrame(showPage);
});

window.addEventListener('pageshow', showPage);

/* ============================================
   LANGUAGE SWITCHER / LANGUAGE DROPDOWN
   (dropdown elements are looked up fresh wherever
   needed below — several pages re-render the markup
   that contains them via [data-i18n-html], which would
   orphan any reference captured once at load time)
   ============================================ */

const translations = {
  en: {
    nav_me: 'Me', nav_work: 'Work', nav_experience: 'Experience',
    nav_education: 'Education', nav_approach: 'Approach', nav_skills: 'Skills', nav_about: 'About', nav_contact: 'Contact',
    section_work: 'Work',
    section_experience: 'Experience',
    section_education: 'Education',
    section_approach: 'Approach',
    section_skills: 'Skills',
    section_about: 'About',
    ask_ai_label: 'Ask AI about me',
    hero_badge: 'Available for work \u00b7 Brno/Prague',
    hero_h1: 'Designing <span class="hero-underline">complex</span> <span class="hero-underline">interfaces</span> for desktop and web-based enterprise software.',
    hero_sub: '4 years of experience across UI/UX, design systems, and web & mobile design. Currently building a design system at Seyfor.',
    skills_title: 'Core skills', skills_all: 'All skills',
    currently_at: 'Currently at',
    work_label: 'Work',
    seyfor_epoch: '2024 \u2014 Present \u00b7 Enterprise (ERP) software',
    seyfor_role: 'UI/UX Designer',
    seyfor_desc: 'Building and maintaining a comprehensive design system for one of the largest Czech enterprise software companies.',
    seyfor_card_tag: 'Case study',
    seyfor_card_title: 'Design System & Product Work at Seyfor',
    seyfor_card_desc: 'Component architecture, documentation, design tokens, developer collaboration and more.',
    seyfor_cta: 'View work',
    fl_epoch: '2022 \u2014 2024 \u00b7 Freelance + Master\'s',
    fl_role: 'Freelance UI/UX Designer \u00b7 Master\'s in Information Services Design',
    fl_desc: 'Two years of freelance work alongside a master\'s degree in UX Design. Delivered ~10 projects spanning mobile apps, web platforms, and brand identities for clients across Czech Republic and Europe.',
    fl_cta: 'All projects',
    proconom_epoch: '2021 \u2014 2022 \u00b7 Websites & Internal Systems',
    proconom_role: 'Junior Designer',
    proconom_desc: 'Worked at a mid-sized digital agency delivering UI/UX across client projects \u2014 from B2B portals to consumer apps. Established internal design practices and introduced component-based workflows to the team.',
    proconom_cta: 'All projects',
    exp_seyfor_role: 'UI/UX Designer',
    exp_seyfor_company: 'Seyfor \u00b7 2024 \u2014 Present \u00b7 Brno',
    exp_seyfor_desc: 'Developing the design system of Vema, a large-scale ERP system focused on HR and employee-related processes. Responsible for UI components, design tokens, UX design, component documentation, and translating designs into implementation using an internal HTML-like language, while closely collaborating with developers.',
    exp_fl_role: 'Freelance UI/UX Designer',
    exp_fl_company: '2023 \u00b7 Remote',
    exp_fl_desc: 'Worked independently with multiple clients on UI/UX projects across mobile apps, landing pages, and custom websites. Delivered end-to-end design from competitor analysis and wireframes to high-fidelity prototypes, usability testing, and implementation across desktop and mobile web platforms.',
    exp_proc_role: 'Junior Designer',
    exp_proc_company: 'Proconom \u00b7 2021 \u2014 2022 \u00b7 Liberec',
    exp_proc_desc: 'Contributed to UI/UX of the Proconom desktop app, built a new interface for an internal subscription platform, and designed and developed several company websites.',
    edu_master_degree: 'Master\'s degree \u2014 Information studies / Information Services Design',
    edu_master_school: 'Masaryk University, Brno \u00b7 2022 \u2014 2024',
    edu_master_desc: 'A program focused on designing information systems, digital services, and information architecture. It combined design thinking, UI/UX design, research methods, and user-centered design principles, providing skills applicable to both small digital products and large-scale enterprise environments.',
    edu_bachelor_degree: 'Bachelor\'s degree \u2014 Managerial informatics',
    edu_bachelor_school: 'Technical University of Liberec \u00b7 2019 \u2014 2022',
    edu_bachelor_desc: 'A study program at the intersection of IT and business, focused on information systems, software, data, and management. It gave me a technical foundation that still helps me today as a UI/UX designer — especially when bridging the gap between design decisions and software development.',
    edu_cert_degree: 'Certifications & continuous learning',
    edu_cert_school: 'Various \u00b7 ongoing',
    edu_cert_desc: 'Google UX Design Certificate \u00b7 Nielsen Norman Group \u2014 UX Research \u00b7 Interaction Design Foundation \u2014 Design Systems \u00b7 Design Tokens Community Group contributor.',
    cta_h2: 'Working on something interesting?<br>Let\'s talk.',
    cta_p: 'Open for freelance projects, consulting and full-time roles.',
    cta_book: 'Book a Call', cta_email: 'Send Email',
    approach_1_title: 'Systems thinking',
    approach_1_desc: 'Good design scales. I build with patterns, not pixels \u2014 creating components and decisions that work across contexts, not just in isolation.',
    approach_2_title: 'Design\u2013dev bridge',
    approach_2_desc: 'I speak dev. Not as a coder \u2014 as someone who understands constraints, respects implementation complexity, and designs for what\'s actually buildable.',
    approach_3_title: 'Clarity over novelty',
    approach_3_desc: 'Especially in enterprise software: the best interaction is the one users don\'t notice. I design for efficiency, not applause.',
    approach_4_title: 'Research-grounded',
    approach_4_desc: 'I test assumptions early. Wireframes before high-fidelity, usability sessions before polish. Good UX is proven, not assumed.',
    skills_dr: 'Product design', skills_tools: 'Tools & Software',
    skills_eng: 'Engineering & Handoff', skills_domain: 'Domain knowledge',
    about_title: 'About me',
    about_p1: 'I started in website development \u2014 analyzing, designing, and building websites from scratch. Somewhere along the way, I became fascinated by the UI/UX field: not only by what you can create visually, but also by how closely design connects with code, and the way real products are built.',
    about_p2: 'That shift pulled me into product design. Today, I sit somewhere at the intersection of interface design, UX thinking, and implementation. Most of my work is focused on enterprise software, where I try to combine scalability, maintainability, and clean visual direction with modern product standards.',
    about_p3: 'At Seyfor, I work on our design system: building and improving its architecture, refining components, and spending a lot of time talking with developers about why that 4px spacing difference actually matters.',
    about_p4: 'Outside of work, I’m into sports — especially climbing and running. Doing this almost every day helps me clear my head, stay motivated, and look at problems from a slightly different perspective.',
    contact_title: 'Let\'s connect.',
    contact_sub: 'Open for projects, consulting and conversations.',
    cv_modal_badge: 'Download CV',
    cv_download: 'Download CV',
    cv_modal_title: 'Select a version',
    cv_modal_copy: 'Download my resume in the language you prefer.',
    cv_btn_en: 'English CV',
    cv_btn_cs: 'Czech CV',
    cv_contact_value: 'Choose language',
    show_more: 'Show more', show_less: 'Show less',
    expand_seyfor: 'My main focus was UI design and design system development. I worked on reusable components, semantic and specific design tokens, component guidelines, implementation notes, and design-system documentation. I closely collaborated with frontend developers to make sure the final implementation matched the design intent and could be reused across the product. I also regularly designed application screens for modules I was responsible for, mainly in areas such as employee communication, payroll and rewards, invoicing, employee benefits, and internal planning processes. After creating the designs, I translated them into practice using our internal HTML-like language, preparing application structures and screen definitions for developers. This gave me a deeper understanding of how design decisions behave in a complex product environment and how to balance consistency, usability, technical constraints, and business requirements across a large enterprise system.', 
    expand_freelance: 'Working on my own gave me the opportunity to collaborate with clients across different industries and project types while independently leading the entire design process from concept to launch. I designed an AI-powered mobile app focused on snake recognition from initial research through user testing, created modern websites and visual identities for clients in the medical and gaming industries, and designed and developed promotional websites for music artists using WordPress, Elementor, and custom HTML/CSS/JS solutions. Managing projects directly with clients taught me how to balance business goals, user needs, and technical limitations while taking full ownership of both design decisions and final delivery.',
    expand_proconom: 'A year at a construction-tech startup gave me hands-on experience across the full design spectrum. I improved key flows in the Proconom desktop app, created a subscription management interface from scratch, and owned the design and development of multiple product websites end to end. Working directly with developers and product managers taught me how to navigate fast-moving product decisions and get my first real taste of what design work actually looks like in practice.',
    expand_master: 'The studies focused on understanding how people interact with information, services, and technology in real environments. Rather than concentrating only on interface design, the program explored how information systems are structured, how digital services are designed and managed, and how user needs influence decision-making across organizations. A significant part of the curriculum was built around projects and collaboration with industry professionals, allowing me to apply theoretical knowledge to practical design challenges.\n\n<p><strong>Most impactful courses:</strong></p>\n<div class="edu-subjects">\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_user_research" tabindex="0">Interface, and Interaction Design</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_interaction_design" tabindex="0">Service design workshop</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_design_systems" tabindex="0">The Web Analytics</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_accessibility" tabindex="0">User Research</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_design_thinking" tabindex="0">Leadership</button>\n \n</div>\n\n<p>The program gave me a strong theoretical foundation in UX and digital product design. More importantly, it taught me how to understand user needs, structure complex information, and approach design challenges systematically rather than relying solely on intuition or visual design skills.</p>',
    expand_bachelor: 'The studies were built around the connection between technology and business. On the technical side, the program introduced topics such as programming, databases, information systems, computer networks, and data analysis. On the economic side, it covered business processes, management, marketing, and decision-making in organizations. This combination helped me understand not only how software is designed from a user perspective, but also how it is implemented, maintained, and used within companies.\n\n<p><strong>Most impactful courses:</strong></p>\n<div class="edu-subjects">\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_typography" tabindex="0">Multimedia</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_color_theory" tabindex="0">Programming</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_grid_systems" tabindex="0">Statistics</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_visual_identity" tabindex="0">Information Systems</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_information_design" tabindex="0">Operating Systems</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_digital_design" tabindex="0">Micro/Macroeconomics</button>\n</div>\n\n<p>The biggest value of this program was the technical overlap it gave me as a designer. I learned enough about software, systems, and data to better understand how developers think, what technical constraints can affect a design, and how to create solutions that are not only usable, but also realistic to build and maintain. I still benefit from this foundation today, especially when discussing implementation details, edge cases, and feasibility with developers.</p>',
    expand_certs: 'Google UX Design Certificate (hands-on portfolio projects), Nielsen Norman Group UX Research (usability testing methodology), Interaction Design Foundation Design Systems track. I also contribute to the Design Tokens Community Group — an open standards effort to normalise token naming and format across tools.',
  },
  cs: {
    nav_me: 'Já', nav_work: 'Práce', nav_experience: 'Zkušenosti',
    nav_education: 'Vzdělání', nav_approach: 'Přístup', nav_skills: 'Dovednosti', nav_about: 'O mně', nav_contact: 'Kontakt',
    section_work: 'Práce',
    section_experience: 'Zkušenosti',
    section_education: 'Vzdělání',
    section_approach: 'Přístup',
    section_skills: 'Dovednosti',
    section_about: 'O mně',
    ask_ai_label: 'Zeptejte se na mě AI',
    hero_badge: 'Otevřený spolupráci \u00b7 Brno/Praha ',
    hero_h1: 'Navrhuji <span class="hero-underline">komplexní</span> <span class="hero-underline">rozhraní</span> pro desktopový a webový enterprise software.',
    hero_sub: '4 roky zkušeností v oblasti UI/UX, design systémů a návrhu webových i mobilních aplikací. Momentálně buduji design systém ve společnosti Seyfor.',
    skills_title: 'Klíčové dovednosti', skills_all: 'Všechny dovednosti',
    currently_at: 'Aktuálně v',
    work_label: 'Práce',
    seyfor_epoch: '2024 \u2014 dosud \u00b7 Enterprise (ERP) software',
    seyfor_role: 'UI/UX Designer',
    seyfor_desc: 'Budování a správa komplexního design systému pro jednu z největších českých enterprise softwarových společností.',
    seyfor_card_tag: 'Případová studie',
    seyfor_card_title: 'Design systém a produktová práce v Seyforu',
    seyfor_card_desc: 'Architektura komponent, dokumentace, design tokeny, spolupráce s vývojáři a více.',
    seyfor_cta: 'Zobrazit práci',
    fl_epoch: '2022 \u2014 2024 \u00b7 Freelance + magistr',
    fl_role: 'Freelance UI/UX Designer \u00b7 Magistr Design informačních služeb',
    fl_desc: 'Dva roky freelance práce souběžně s magisterským studiem UX designu. Doručeno ~10 projektů \u2014 mobilní aplikace, webové platformy a vizuální identity pro klienty z ČR i Evropy.',
    fl_cta: 'Všechny projekty',
    proconom_epoch: '2021 \u2014 2022 \u00b7 Weby & Interní Systémy',
    proconom_role: 'Junior Designer',
    proconom_desc: 'Práce ve středně velké digitální agentuře \u2014 B2B portály i spotřebitelské aplikace. Zavedení komponentového přístupu a první interní design systém agentury.',
    proconom_cta: 'Všechny projekty',
    exp_seyfor_role: 'UI/UX Designer',
    exp_seyfor_company: 'Seyfor \u00b7 2024 \u2014 dosud \u00b7 Brno',
    exp_seyfor_desc: 'Pracuji na vývoji design systému Vema, rozsáhlého ERP systému zaměřeného na HR a procesy související se zaměstnanci. Mám na starosti vývoj UI komponent, design tokeny, UX nových aplikačních obrazovek, dokumentace a první fázi implementace pomocí interního jazyka podobného HTML, a to vše v úzké spolupráci s vývojáři.',
    exp_fl_role: 'Freelance UI/UX Designer',
    exp_fl_company: '2023 \u00b7 Remote',
    exp_fl_desc: 'Spolupracoval jsem s několika klienty na UI/UX projektech zaměřených na mobilní aplikace, landing pages a webové stránky na míru. Zajišťoval jsem kompletní designový proces — od konkurenční analýzy a wireframů až po high-fidelity prototypy, usability testing a vývoj napříč webovým desktopem i mobilem.',
    exp_proc_role: 'Junior Designer',
    exp_proc_company: 'Proconom \u00b7 2021 \u2014 2022 \u00b7 Liberec',
    exp_proc_desc: 'Podílel jsem se na UI/UX vývoji desktopové aplikace Proconom, vytvořil nové rozhraní pro interní aplikaci na správu předplatného a navrhl jsem i naprogramoval několik firemních webů.',
    edu_master_degree: 'Magisterský titul \u2014 Informační studia / Design informačních služeb',
    edu_master_school: 'Masarykova univerzita, Brno \u00b7 2022 \u2014 2024',
    edu_master_desc: 'Studium bylo zaměřené na návrh informačních systémů, digitálních produktů a služeb se silným důrazem na uživatelskou zkušenost (UX), výzkum a informační architekturu. Program propojoval principy design thinkingu, UX/UI designu, uživatelského výzkumu a návrhu služeb, díky čemuž poskytl pevné základy pro práci jak na menších digitálních produktech, tak na rozsáhlých enterprise řešeních.',
    edu_bachelor_degree: 'Bakalářský titul \u2014 Manažerská informatika',
    edu_bachelor_school: 'Technická univerzita v Liberci \u00b7 2019 \u2014 2022',
    edu_bachelor_desc: 'Studijní program na pomezí informačních technologií a ekonomie zaměřený na informační systémy, software, práci s daty a řízení organizací. Díky němu jsem získal technický základ, který dodnes využívám při návrhu digitálních produktů — zejména při spolupráci s vývojáři a při hledání rovnováhy mezi potřebami uživatelů, technickými možnostmi a byznysovými cíli.',
    edu_cert_degree: 'Certifikace & průběžné vzdělávání',
    edu_cert_school: 'Různé \u00b7 průběžně',
    edu_cert_desc: 'Google UX Design Certificate \u00b7 Nielsen Norman Group \u2014 UX Research \u00b7 Interaction Design Foundation \u2014 Design Systems \u00b7 přispěvatel Design Tokens Community Group.',
    cta_h2: 'Pracujete na něčem zajímavém?<br>Pojďme si popovídat.',
    cta_p: 'Dostupný pro freelance projekty, konzultace i plný úvazek.',
    cta_book: 'Domluvit hovor', cta_email: 'Napsat e-mail',
    approach_1_title: 'Systémové myšlení',
    approach_1_desc: 'Dobrý design škáluje. Stavím vzory, ne pixely \u2014 komponenty a rozhodnutí, která fungují v různých kontextech, nejen izolovaně.',
    approach_2_title: 'Most mezi designem a vývojem',
    approach_2_desc: 'Mluvím vývojářsky. Ne jako kodér \u2014 ale jako někdo, kdo rozumí omezením, respektuje komplexitu implementace a navrhuje to, co je skutečně realizovatelné.',
    approach_3_title: 'Přehlednost nad novostí',
    approach_3_desc: 'Zejména v enterprise software platí: nejlepší interakce je ta, které si uživatel nevšimne. Navrhuji pro efektivitu, ne pro wow efekt.',
    approach_4_title: 'Výzkumem podložený přístup',
    approach_4_desc: 'Předpoklady testuji brzy. Wireframy před high-fidelity, testy použitelnosti před leskem. Dobré UX je ověřené, ne předpokládané.',
    skills_dr: 'Produktový design', skills_tools: 'Nástroje & Software',
    skills_eng: 'Engineering & Handoff', skills_domain: 'Doménové znalosti',
    about_title: 'O mně',
    about_p1: 'Začal jsem u tvorby webovek \u2014 od analýzy přes návrh až po samotnou realizaci. Postupně mě ale stále více začalo zajímat UI/UX: nejen vizuál samostný, ale i to, jak úzce je design propojený s kódem a jakým způsobem vznikají skutečné produkty.',
    about_p2: 'Tahle změna mě přirozeně přivedla k produktovému designu. Dnes se pohybuji na pomezí interface designu, UX a samotné implementace. Většina mé práce se soustředí na enterprise software, kde se snažím propojovat škálovatelnost, použitelnost a čistý vizuál s moderními trendy a standardy.',
    about_p3: 'V Seyforu pracuji na našem design systému: podílím se na jeho architektuře, vylepšuji komponenty a často řeším s vývojáři, proč i rozdíl 4 pixelů může mít význam.',
    about_p4: 'Mimo práci mám blízko ke sportu — hlavně k lezení a běhání. Pravidelný pohyb mi pomáhá vyčistit hlavu, udržet si motivaci a dívat se na problémy z trochu jiné perspektivy.',
    contact_title: 'Pojďme se spojit.',
    contact_sub: 'Otevřený novým projektům, návrhům i spolupráci.',
    cv_modal_badge: 'Stáhnout CV',
    cv_download: 'Stáhnout CV',
    cv_modal_title: 'Vyberte verzi',
    cv_modal_copy: 'Stáhněte si můj životopis v jazyce, který vám vyhovuje.',
    cv_btn_en: 'Anglické CV',
    cv_btn_cs: 'České CV',
    cv_contact_value: 'Vybrat jazyk',
    show_more: 'Zobrazit více', show_less: 'Zobrazit méně',
    expand_seyfor: 'Mým hlavním zaměřením je UI design a vývoj design systému. Pracuji na vývoji UI komponent, design tokenech, guidelines a dokumentaci design systému. Úzce při tom spolupracuji s frontend vývojáři, aby výsledná implementace odpovídala návrhu a bylo možné ji opakovaně využívat napříč produktem. Pravidelně také navrhuji aplikační obrazovky pro moduly, které mám na starosti, zejména v oblastech komunikace se zaměstnanci, mezd, fakturace, zaměstnaneckých benefitů, firemního plánování a dalších. Po dokončení návrhů je převádím do praxe pomocí našeho interního jazyka podobného HTML, kde se zaměřuji na layout, responzivitu a bližší specifikaci obrazovek pro vývojáře. Práce v Seyforu mi přinesla hlubší porozumění tomu, jak designová rozhodnutí ovlivňují komplexní produktové prostředí a jak v rozsáhlém enterprise systému vyvažovat konzistenci, použitelnost, technická omezení a byznysové požadavky.',
    expand_freelance: 'Freelance práce mi dala možnost pracovat na různorodých projektech i v odlišných odvětvích. Navrhoval jsem AI mobilní aplikaci pro rozpoznávání hadů od úvodního výzkumu až po uživatelské testování, vytvářel moderní weby a vizuální identitu pro klienty z medicínského a gaming průmyslu a navrhoval i realizoval promo weby pro hudební skupiny pomocí WordPressu, Elementoru i vlastního HTML/CSS/JS řešení. Přímá komunikace s klienty mě naučila vyvažovat business cíle, potřeby uživatelů i technická omezení a samostatně řídit celý designový proces od konceptu po spuštění projektu.',
    expand_proconom: 'Rok ve startupu zaměřeném na technologie pro stavebnictví mi dal praktické zkušenosti napříč celým designovým procesem. Vylepšoval jsem klíčové části desktopové aplikace Proconom, od nuly navrhl rozhraní platformy pro správu předplatného a kompletně zastřešil návrh i vývoj několika produktových webů. Díky úzké spolupráci s vývojáři a produktovými manažery jsem se naučil fungovat v rychle se měnícím prostředí produktového vývoje a získal první skutečnou zkušenost s tím, jak designová práce v praxi opravdu vypadá.',
    expand_master: 'Výuka se nesoustředila pouze na návrh rozhraní, ale především na pochopení toho, jak lidé pracují s informacemi, technologiemi a digitálními službami v reálném prostředí. Důležitou součástí studia byly projektově orientované předměty a spolupráce s odborníky z praxe, kde jsem získané znalosti aplikoval na skutečné designové výzvy.\n\n<p><strong>Klíčové předměty:</strong></p>\n<div class="edu-subjects">\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_user_research" tabindex="0">Design rozhraní a interakcí</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_interaction_design" tabindex="0">Service design workshop</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_design_systems" tabindex="0">Webová analytika</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_accessibility" tabindex="0">Uživatelský výzkum</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_design_thinking" tabindex="0">Leadership</button>\n  \n</div>\n\n<p>Největším přínosem studia pro mě bylo získání pevného teoretického základu v oblasti UX designu, práce s informacemi a navrhování digitálních produktů. Naučilo mě přemýšlet o designu v širších souvislostech, lépe porozumět potřebám uživatelů a systematicky pracovat s komplexními problémy, které jsou běžnou součástí rozsáhlých digitálních a enterprise systémů.</p>',
    expand_bachelor: 'Studium propojovalo technologickou a ekonomickou perspektivu. Technická část zahrnovala témata jako programování, databáze, informační systémy, počítačové sítě nebo analýza dat. Současně se věnovalo fungování firem, managementu a rozhodovacím procesům v organizacích. Díky této kombinaci jsem získal širší pohled na digitální produkty — nejen z pohledu uživatele, ale také z hlediska jejich technické realizace, provozu a role v rámci firemních procesů.\n\n<p><strong>Klíčové předměty:</strong></p>\n<div class="edu-subjects">\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_typography" tabindex="0">Základy multimédií</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_color_theory" tabindex="0">Programování</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_grid_systems" tabindex="0">Statistika</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_visual_identity" tabindex="0">Informační systémy</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_information_design" tabindex="0">Operační systémy</button>\n  <button type="button" class="edu-subject-link" data-tooltip-key="edu_digital_design" tabindex="0">Mikro/Makroekonomie</button>\n</div>\n\n<p>Největší přínos studia pro mě představoval technický přesah, který dnes považuji za jednu z nejcennějších dovedností v oboru UI/UX designu. Díky základnímu porozumění softwarovému vývoji, datům a fungování informačních systémů dokážu efektivněji komunikovat s vývojáři, lépe chápat technická omezení a navrhovat řešení, která jsou nejen uživatelsky přívětivá, ale také realistická z pohledu implementace a dlouhodobého rozvoje produktu.</p>',
    expand_certs: 'Google UX Design Certificate (praktické portfolio projekty), Nielsen Norman Group UX Research (metodiky testování použitelnosti), Interaction Design Foundation Design Systems. Také přispívám do Design Tokens Community Group — iniciativa pro standardizaci pojmenování a formátů tokenů.',
    fl_page_title: 'Freelance & Studies — Ota Škvor',
    pro_page_title: 'Proconom — Ota Škvor',
    sey_page_title: 'Seyfor — Ota Škvor',
    fl_nav: `<div class="case-nav-inner">
      <a href="../index.html" class="back-link">Back</a>
      <ul class="case-toc">
        <li><a href="#overview">Overview</a></li>
        <li><a href="#projects">Projects</a></li>
      </ul>
    </div>`,
    fl_hero: `<div class="case-tags">
      <span class="case-tag">Freelance</span>
      <span class="case-tag">Master's degree</span>
      <span class="case-tag">10 projects</span>
      <span class="case-tag">2020 — 2022</span>
    </div>
    <h1>Freelance &amp; Studies</h1>
    <p class="case-hero-sub">Two years of freelance work alongside a master's degree. My master's studies at Masaryk University provided a strong methodological foundation — user research, usability testing, and cognitive psychology. Freelance projects put that knowledge to the test in real product work.</p>

    <div class="case-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-label">projects</div></div>
      <div class="stat"><div class="stat-num">2</div><div class="stat-label">years of study</div></div>
      <div class="stat"><div class="stat-num">6</div><div class="stat-label">industries</div></div>
      <div class="stat"><div class="stat-num">CZ/EU</div><div class="stat-label">markets</div></div>
    </div>`,
    fl_projects: `<div class="proj-grid">
      <a href="case/fl-01-fintech.html" class="proj-card reveal">
        <div class="proj-card-img-placeholder"><span>Fintech · iOS · Onboarding</span></div>
        <div class="proj-card-body">
          <div class="proj-num">01</div>
          <div class="proj-name">Fintech mobile app</div>
          <div class="proj-type">UI/UX · iOS · Fintech</div>
          <div class="proj-desc">Redesigning onboarding and key transactions for a Czech fintech app. Reduced onboarding drop-off by 28%.</div>
          <div class="proj-tags"><span class="proj-tag">Figma</span><span class="proj-tag">iOS HIG</span><span class="proj-tag">User research</span></div>
        </div>
      </a>

            <a href="case/medical-website.html" class="proj-card reveal reveal-delay-1">
        <div class="proj-card-img-placeholder"><span>Clinic homepage & booking flow</span></div>
        <div class="proj-card-body">
          <div class="proj-num">02</div>
          <div class="proj-name">Healthcare clinic website redesign</div>
          <div class="proj-type">Healthcare · Web</div>
          <div class="proj-desc">Case study: healthcare clinic website redesign. Online booking replaced phone-only appointments and cut call volume by 45%.</div>
          <div class="proj-tags"><span class="proj-tag">Healthcare</span><span class="proj-tag">Web</span><span class="proj-tag">UX Research</span></div>
        </div>
      </a>

      <a href="case/music-website.html" class="proj-card reveal reveal-delay-2">
        <div class="proj-card-img-placeholder"><span>Plant care dashboard & reminders</span></div>
        <div class="proj-card-body">
          <div class="proj-num">03</div>
          <div class="proj-name">Rooted — plant care mobile app</div>
          <div class="proj-type">Mobile app · iOS/Android</div>
          <div class="proj-desc">Case study: Rooted, a plant care app helping new plant owners keep houseplants alive through simple, personalised reminders.</div>
          <div class="proj-tags"><span class="proj-tag">Mobile app</span><span class="proj-tag">iOS/Android</span><span class="proj-tag">Sustainability</span></div>
        </div>
      </a>

      <a href="case/subscription-app.html" class="proj-card reveal reveal-delay-3">
        <div class="proj-card-img-placeholder"><span>Subscription timeline & renewal alerts</span></div>
        <div class="proj-card-body">
          <div class="proj-num">04</div>
          <div class="proj-name">Subly — subscription manager app</div>
          <div class="proj-type">Fintech · Mobile</div>
          <div class="proj-desc">Case study: Subly, an app that helps people track and cancel unused subscriptions before renewal.</div>
          <div class="proj-tags"><span class="proj-tag">Fintech</span><span class="proj-tag">Mobile</span><span class="proj-tag">Personal finance</span></div>
        </div>
      </a>

      <a href="case/gaming-website.html" class="proj-card reveal">
        <div class="proj-card-img-placeholder"><span>Team roster & match schedule hub</span></div>
        <div class="proj-card-body">
          <div class="proj-num">05</div>
          <div class="proj-name">Esports team & community website</div>
          <div class="proj-type">Gaming · Web</div>
          <div class="proj-desc">Case study: website redesign for a regional esports organisation, built to serve fans, sponsors, and players from one hub.</div>
          <div class="proj-tags"><span class="proj-tag">Gaming</span><span class="proj-tag">Web</span><span class="proj-tag">Community</span></div>
        </div>
      </a>

      <a href="case/proconom-website.html" class="proj-card reveal reveal-delay-1">
        <div class="proj-card-img-placeholder"><span>New homepage & product catalogue templates</span></div>
        <div class="proj-card-body">
          <div class="proj-num">06</div>
          <div class="proj-name">Corporate website redesign</div>
          <div class="proj-type">Corporate web · Agency</div>
          <div class="proj-desc">Case study: corporate website redesign delivered during my time at Proconom, rebuilding an outdated client site into a maintainable CMS-driven platform.</div>
          <div class="proj-tags"><span class="proj-tag">Corporate web</span><span class="proj-tag">Agency</span><span class="proj-tag">CMS</span></div>
        </div>
      </a>

      <a href="case/proconom-app.html" class="proj-card reveal reveal-delay-2">
        <div class="proj-card-img-placeholder"><span>Quote builder & pricing rules interface</span></div>
        <div class="proj-card-body">
          <div class="proj-num">07</div>
          <div class="proj-name">Internal quotation tool</div>
          <div class="proj-type">Internal tool · B2B</div>
          <div class="proj-desc">Case study: an internal quotation tool built during my time at Proconom, replacing a spreadsheet-based process prone to pricing errors.</div>
          <div class="proj-tags"><span class="proj-tag">Internal tool</span><span class="proj-tag">B2B</span><span class="proj-tag">Workflow</span></div>
        </div>
      </a>

      <a href="case/roomly.html" class="proj-card reveal reveal-delay-3">
        <div class="proj-card-img-placeholder"><span>Room booking calendar & member dashboard</span></div>
        <div class="proj-card-body">
          <div class="proj-num">08</div>
          <div class="proj-name">Roomly — coworking booking platform</div>
          <div class="proj-type">Booking · Web app</div>
          <div class="proj-desc">Case study: Roomly, a room and desk booking platform designed for small coworking spaces with limited admin overhead.</div>
          <div class="proj-tags"><span class="proj-tag">Booking</span><span class="proj-tag">Web app</span><span class="proj-tag">Coworking</span></div>
        </div>
      </a>

      <a href="case/snake-name.html" class="proj-card reveal">
        <div class="proj-card-img-placeholder"><span>Gameplay screen & initials leaderboard</span></div>
        <div class="proj-card-body">
          <div class="proj-num">09</div>
          <div class="proj-name">SnakeName — retro browser game</div>
          <div class="proj-type">Side project · Game</div>
          <div class="proj-desc">Case study: SnakeName, a personal side project reviving the classic Snake game with a playful initials-based leaderboard, built to sharpen front-end and interaction design skills outside of client work.</div>
          <div class="proj-tags"><span class="proj-tag">Side project</span><span class="proj-tag">Game</span><span class="proj-tag">Canvas / JS</span></div>
        </div>
      </a>
    </div>`,
    fl_footer: `<div class="footer-inner">
      <span class="footer-copy">© <strong>Ota Škvor</strong>. All rights reserved.</span>
      <div style="display:flex;align-items:center;gap:1rem;">
        <a href="../index.html" class="back-to-portfolio">Back to portfolio</a>
        <div class="lang-dropdown" id="langDropdown">
          <button class="lang-dropdown-trigger" id="langTrigger" aria-haspopup="true" aria-expanded="false">
            <span class="lang-flag" id="langFlag">EN</span>
            <span class="lang-chevron" aria-hidden="true"></span>
          </button>
          <div class="lang-dropdown-menu" id="langMenu" role="menu" style="left:0;right:unset;">
            <button class="lang-option active" data-lang="en" role="menuitem">
              <span>EN</span><span class="lang-option-label">English</span>
            </button>
            <button class="lang-option" data-lang="cs" role="menuitem">
              <span>CZ</span><span class="lang-option-label">Česky</span>
            </button>
        </div>
      </div>
      </div>
    </div>`,
    pro_nav: `<div class="case-nav-inner">
      <a href="../index.html" class="back-link">Back</a>
      <ul class="case-toc">
        <li><a href="#overview">Overview</a></li>
        <li><a href="#role">Role</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#proj-1">B2B portal</a></li>
        <li><a href="#proj-2">Municipal site</a></li>
        <li><a href="#proj-3">HR tool</a></li>
        <li><a href="#proj-4">Component library</a></li>
        <li><a href="#proj-5">E-learning</a></li>
      </ul>
    </div>`,
    pro_hero: `<div class="case-tags">
      <span class="case-tag">Agency</span>
      <span class="case-tag">UI/UX Design</span>
      <span class="case-tag">5 projects</span>
      <span class="case-tag">2017 — 2020</span>
    </div>
    <h1>Proconom <span style="font-style:italic;color:var(--fg-muted);">2017 — 2020</span></h1>
    <p class="case-hero-sub">Three years at a Brno digital agency focused on enterprise clients — municipal, manufacturing and B2B. I worked as a UX/UI designer on client projects and gradually took on a design lead role for larger engagements.</p>

    <div class="case-stats">
      <div class="stat"><div class="stat-num">5+</div><div class="stat-label">delivered projects</div></div>
      <div class="stat"><div class="stat-num">3</div><div class="stat-label">years in the agency</div></div>
      <div class="stat"><div class="stat-num">✦</div><div class="stat-label">first agency design system</div></div>
      <div class="stat"><div class="stat-num">B2B</div><div class="stat-label">enterprise focus</div></div>
    </div>`,
    pro_role: `<h2>What I did at Proconom</h2>
    <p>I started as a junior designer — wireframes, visual assets, client coordination. Over time I took on bigger responsibilities: leading the design phase on larger projects, introducing research practices, and building internal design workflows the agency did not have before.</p>

    <div class="role-grid">
      <div class="role-block">
        <div class="role-block-title">UX Design &amp; Research</div>
        <p>User journeys, wireframes, user interviews, basic usability testing. I introduced the first UX review process — every launch was reviewed structurally.</p>
      </div>
      <div class="role-block">
        <div class="role-block-title">UI Design</div>
        <p>High-fidelity prototypes and final visual assets for developers. A consistent visual style across projects for the same client. I led the agency transition from Photoshop → Sketch → Figma.</p>
      </div>
      <div class="role-block">
        <div class="role-block-title">Component Library</div>
        <p>I built the agency's first shared component library. The result was a 30% shorter UI phase for new projects thanks to reusable patterns.</p>
      </div>
      <div class="role-block">
        <div class="role-block-title">Client collaboration</div>
        <p>Direct client contact — requirements workshops, design presentations, iteration on feedback. I learned to quickly distinguish what clients said from what they really needed.</p>
      </div>
    </div>`,
    pro_projects: `<h2>Projects</h2>
    <p>Five representative projects from three years in the agency — from B2B portals to municipal websites and internal tools.</p>`,
    pro_cases: `<div class="proj-grid">
      <a href="#proj-1" class="proj-card reveal">
        <div class="proj-card-img-placeholder"><span>B2B Portal · Enterprise UX · Role-based</span></div>
        <div class="proj-card-body">
          <div class="proj-num">01</div>
          <div class="proj-name">B2B client portal</div>
          <div class="proj-type">Enterprise UX · Web</div>
          <div class="proj-desc">Customer portal for a mid-sized manufacturing company. Clients could not track order status, received no automatic updates, and documents were scattered across formats.</div>
          <div class="proj-tags"><span class="proj-tag">Enterprise UX</span><span class="proj-tag">Data tables</span><span class="proj-tag">Role-based</span></div>
        </div>
      </a>

      <a href="#proj-2" class="proj-card reveal reveal-delay-1">
        <div class="proj-card-img-placeholder"><span>Municipal Web · WCAG AA · Public sector</span></div>
        <div class="proj-card-body">
          <div class="proj-num">02</div>
          <div class="proj-name">Municipal website platform</div>
          <div class="proj-type">Accessibility · Web · Public sector</div>
          <div class="proj-desc">Redesign for a regional public administration website. The biggest challenge was simplifying a structure that had grown organically over years.</div>
          <div class="proj-tags"><span class="proj-tag">WCAG AA</span><span class="proj-tag">Government</span><span class="proj-tag">Multi-lang</span></div>
        </div>
      </a>

      <a href="#proj-3" class="proj-card reveal reveal-delay-2">
        <div class="proj-card-img-placeholder"><span>HR Tool · Internal · Workflow</span></div>
        <div class="proj-card-body">
          <div class="proj-num">03</div>
          <div class="proj-name">Internal HR tool</div>
          <div class="proj-type">Product design · Web app</div>
          <div class="proj-desc">HR platform for a company with 200 employees — replacing Excel and email templates for vacation requests with a single system.</div>
          <div class="proj-tags"><span class="proj-tag">HR Tech</span><span class="proj-tag">Forms</span><span class="proj-tag">Workflow</span></div>
        </div>
      </a>

      <a href="#proj-4" class="proj-card reveal reveal-delay-3">
        <div class="proj-card-img-placeholder"><span>Component Library · Design System · Figma</span></div>
        <div class="proj-card-body">
          <div class="proj-num">04</div>
          <div class="proj-name">Agency component library</div>
          <div class="proj-type">Design system · Internal</div>
          <div class="proj-desc">The first shared UI library at Proconom. It covered around 80% of common UI needs and shortened the UI phase by 30% per project.</div>
          <div class="proj-tags"><span class="proj-tag">Design system</span><span class="proj-tag">Figma</span><span class="proj-tag">Documentation</span></div>
        </div>
      </a>

      <a href="#proj-5" class="proj-card reveal">
        <div class="proj-card-img-placeholder"><span>E-learning · EdTech · Responsive</span></div>
        <div class="proj-card-body">
          <div class="proj-num">05</div>
          <div class="proj-name">E-learning platform</div>
          <div class="proj-type">UX Research · EdTech · Web</div>
          <div class="proj-desc">An education platform for an industrial company — internal courses for employees, usable on tablets in production halls and desktop in the office.</div>
          <div class="proj-tags"><span class="proj-tag">EdTech</span><span class="proj-tag">Responsive</span><span class="proj-tag">LMS</span></div>
        </div>
      </a>
    </div>

    <div class="proj-case" id="proj-1">
      <div class="case-tags"><span class="case-tag">01</span><span class="case-tag">Enterprise · B2B portal</span></div>
      <h2>B2B client portal</h2>
      <p>A manufacturing company with 50+ B2B partners managed orders by email and phone. Clients could not track order status, did not receive automatic updates, and documents were scattered across different places.</p>
      <h3>Challenge</h3>
      <p>The portal had to serve three user roles — procurement buyers, sales reps, and logistics staff. Each needed a different first view while sharing the same order database.</p>
      <h3>Solution</h3>
      <ul>
        <li>Role-based dashboard — each role sees a tailored default view with access to shared data</li>
        <li>Order status tracker — visual timeline from order to delivery</li>
        <li>Central document library with search and filters</li>
        <li>Email notifications with deep links to the exact order</li>
      </ul>
      <div class="impact-note"><strong>Result:</strong> Phone inquiries to sales dropped 60% in the first quarter.</div>
    </div>

    <div class="proj-case" id="proj-2">
      <div class="case-tags"><span class="case-tag">02</span><span class="case-tag">Public sector · WCAG</span></div>
      <h2>Municipal website platform</h2>
      <p>Redesign for a regional authority. The main challenge was persuading the client to simplify a structure that had grown organically without logic.</p>
      <h3>Accessibility as a baseline</h3>
      <p>WCAG AA was not a nice bonus — it was a legal requirement. I audited the site with a screen reader and keyboard-only navigation, finding 34 critical issues that were fixed before launch.</p>
      <h3>Information architecture</h3>
      <ul>
        <li>Card sorting with 20 citizens revealed how people actually search for information</li>
        <li>Navigation reorganised around user needs instead of internal department structure</li>
        <li>Search became the primary entry point — most people search, they do not browse menus</li>
      </ul>
    </div>

    <div class="proj-case" id="proj-3">
      <div class="case-tags"><span class="case-tag">03</span><span class="case-tag">HR Tech · Internal tool</span></div>
      <h2>Internal HR tool</h2>
      <p>200 employees, 3 sites, and a two-person HR team managing everything in Excel. The system replaced four different spreadsheet templates and email requests for vacation.</p>
      <h3>Key design decision</h3>
      <p>Shop-floor employees needed access from shared terminals. No complex login, no long forms. The primary action — vacation request — had to be completed in three clicks.</p>
      <h3>What I designed</h3>
      <ul>
        <li>PIN login for shared terminals, full login for office users</li>
        <li>Quick actions on the home page — most common tasks without navigation</li>
        <li>Approval workflow with a clear state model and email notifications</li>
        <li>Employee evaluations with structured rating and text fields</li>
      </ul>
    </div>

    <div class="proj-case" id="proj-4">
      <div class="case-tags"><span class="case-tag">04</span><span class="case-tag">Design system · Internal</span></div>
      <h2>Agency component library</h2>
      <p>Before the library, every project started from scratch. Buttons looked different in each product. Forms behaved inconsistently. Consistency was accidental, not systematic.</p>
      <h3>How I approached it</h3>
      <ul>
        <li>Audit of 8 existing projects — extracting repeated UI patterns</li>
        <li>Definition of 15 core components covering 80% of common needs</li>
        <li>Figma Auto Layout for every component so they scale without manual tweaks</li>
        <li>Documentation directly in Figma with usage notes and DO / DON'T examples</li>
      </ul>
      <div class="impact-note"><strong>Result:</strong> A new project receives a full UI kit on day one. The UI phase shortened by 30% on average.</div>
    </div>

    <div class="proj-case" id="proj-5">
      <div class="case-tags"><span class="case-tag">05</span><span class="case-tag">EdTech · Responsive</span></div>
      <h2>E-learning platform</h2>
      <p>An industrial company needed to train employees on new machines and safety procedures. Some people worked from desktops, others from shared tablets in the production hall with dirty hands.</p>
      <h3>Design solutions for extreme conditions</h3>
      <ul>
        <li>Touch targets minimum 48×48 px — usable even with work gloves</li>
        <li>High contrast as default — readable in direct light on the shop floor</li>
        <li>Offline mode — courses downloadable for areas without Wi-Fi</li>
        <li>Progress saving — interrupting the course does not mean starting over</li>
      </ul>
      <p>I worked directly with the safety engineer so the course content was both well-designed and pedagogically correct. Good educational design is not just UI — it is structure and timing too.</p>
    </div>
  </div>`,
    pro_footer: `<div class="footer-inner">
      <span class="footer-copy">© <strong>Ota Škvor</strong>. All rights reserved.</span>
      <div style="display:flex;align-items:center;gap:1rem;">
        <a href="../index.html" class="back-to-portfolio">Back to portfolio</a>
        <div class="lang-dropdown" id="langDropdown">
          <button class="lang-dropdown-trigger" id="langTrigger" aria-haspopup="true" aria-expanded="false">
            <span class="lang-flag" id="langFlag">EN</span>
            <svg class="lang-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="lang-dropdown-menu" id="langMenu" role="menu">
            <button class="lang-option active" data-lang="en" role="menuitem">
              <span>EN</span><span class="lang-option-label">English</span>
            </button>
            <button class="lang-option" data-lang="cs" role="menuitem">
              <span>CZ</span><span class="lang-option-label">Česky</span>
            </button>
          </div>
        </div>
      </div>
    </div>`,
    sey_nav: `<div class="case-nav-inner">
      <a href="../index.html" class="back-link">Back</a>
      <ul class="case-toc">
        <li><a href="#overview">Overview</a></li>
        <li><a href="#before-after">Before / After</a></li>
        <li><a href="#design-system">Design system</a></li>
        <li><a href="#components">Components</a></li>
        <li><a href="#tokens">Tokens</a></li>
        <li><a href="#code">Code &amp; Handoff</a></li>
        <li><a href="#documentation">Documentation</a></li>
        <li><a href="#collaboration">Collaboration</a></li>
        <li><a href="#impact">Impact</a></li>
      </ul>
    </div>`,
    sey_hero: `<div class="case-tags">
      <span class="case-tag">Design System</span>
      <span class="case-tag">Component Library</span>
      <span class="case-tag">Design Tokens</span>
      <span class="case-tag">Documentation</span>
      <span class="case-tag">Dev Collaboration</span>
    </div>
    <h1>Seyfor <span style="font-style:italic;color:var(--fg-muted);">2022 — Present</span></h1>
    <p class="case-hero-sub">Seyfor is one of the largest Czech software companies — ERP, CRM, HR systems, cloud solutions. I joined as a Senior UI/UX Designer focused on a design system that connects 11+ product teams and hundreds of developers.</p>

    <div class="case-stats">
      <div class="stat"><div class="stat-num">10+</div><div class="stat-label">product teams</div></div>
      <div class="stat"><div class="stat-num">200+</div><div class="stat-label">components in library</div></div>
      <div class="stat"><div class="stat-num">↓40%</div><div class="stat-label">fewer design inconsistencies</div></div>
      <div class="stat"><div class="stat-num">↑</div><div class="stat-label">faster onboarding</div></div>
    </div>

    <div class="seyfor-wide-ph" style="aspect-ratio:16/6;margin-top:2rem;">
      [ Screenshot — design system overview / Figma component library ]
    </div>`,
    sey_before_after: `<h2>Before / After</h2>
    <p>The Seyfor visual language was fragmented before the system work — each team adapted components independently. Below is a comparison of selected UI elements before and after unification.</p>

    <div class="comparison-slider" id="compSlider1" style="aspect-ratio:16/7;">
      <div class="cs-before" style="width:100%;height:100%;background:var(--bg-card);">
        <div style="height:100%;display:flex;flex-direction:column;overflow:hidden;">
          <div class="ds-evo-label" style="padding:0.55rem 0.85rem;border-bottom:1px solid var(--border-light);background:var(--bg-alt);font-size:0.67rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--fg-light);">❶ Before — fragmented state</div>
          <div class="ds-evo-body" style="padding:1.4rem;flex:1;display:flex;flex-direction:column;gap:0.45rem;">
            <div class="fake-heading old">Order management</div>
            <div class="fake-sub old" style="margin-bottom:0.7rem;">Arial 13px · different in every product</div>
            <div class="fake-input-row">
              <div class="fake-input old">Search…</div>
              <span class="fake-btn old">Search</span>
            </div>
            <div style="margin-top:0.7rem;">
              <span class="fake-tag old">Active</span>
              <span class="fake-tag old">Completed</span>
              <span class="fake-tag old">Cancelled</span>
            </div>
            <div style="margin-top:0.8rem;">
              <span class="fake-btn old">Confirm</span>
              <span class="fake-btn old-2">Cancel</span>
            </div>
          </div>
          <div class="ds-evo-note" style="font-size:0.73rem;color:var(--fg-light);padding:0.35rem 0.85rem 0.55rem;background:var(--bg-alt);border-top:1px solid var(--border-light);">Hardcoded values · 3 different spacing systems · 8 button variants</div>
        </div>
      </div>
      <div class="cs-after" style="height:100%;background:var(--bg-card);">
        <div style="height:100%;display:flex;flex-direction:column;overflow:hidden;width:200%;">
          <div class="ds-evo-label" style="padding:0.55rem 0.85rem;border-bottom:1px solid var(--border-light);background:var(--bg-alt);font-size:0.67rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--fg-light);">❷ After — unified design system</div>
          <div class="ds-evo-body" style="padding:1.4rem;flex:1;display:flex;flex-direction:column;gap:0.45rem;">
            <div class="fake-heading new">Order management</div>
            <div class="fake-sub" style="margin-bottom:0.7rem;">DM Sans 13px · typography.heading.md</div>
            <div class="fake-input-row">
              <div class="fake-input new">Search…</div>
              <span class="fake-btn new">Search</span>
            </div>
            <div style="margin-top:0.7rem;">
              <span class="fake-tag new">Active</span>
              <span class="fake-tag new">Completed</span>
              <span class="fake-tag new">Cancelled</span>
            </div>
            <div style="margin-top:0.8rem;">
              <span class="fake-btn new">Confirm</span>
              <span class="fake-btn new-2">Cancel</span>
            </div>
          </div>
          <div class="ds-evo-note" style="font-size:0.73rem;color:var(--fg-light);padding:0.35rem 0.85rem 0.55rem;background:var(--bg-alt);border-top:1px solid var(--border-light);">Tokens · spacing.md · button.primary / button.secondary</div>
        </div>
      </div>
      <div class="cs-divider"></div>
      <div class="cs-handle">⇔</div>
      <div class="cs-label-before">Before</div>
      <div class="cs-label-after">After</div>
    </div>

    <p style="font-size:0.82rem;color:var(--fg-light);margin-top:0.6rem;">↑ Comparison of the same screen before and after adopting the design system. Visually softer, but functionally the key shift — same data, better consistency and maintainability.</p>

    <div class="seyfor-3col" style="margin-top:2rem;">
      <div class="seyfor-ph">[ Screenshot — old Button component in Figma ]</div>
      <div class="seyfor-ph">[ Screenshot — new Button version with all variants + states ]</div>
      <div class="seyfor-ph">[ Screenshot — Figma variables / token setup ]</div>
    </div>`,
    sey_design_system: `<h2>Design system</h2>
    <p>The goal was to create one source of truth for the company's visual language. Previously each team had its own components, colours, and conventions. The result was products that looked like they came from different companies.</p>
    <p>I started with an audit — reviewing dozens of screens from different products and mapping visual and UX patterns. I identified where differences were justified and where they were historical accidents.</p>

    <div class="cs-grid">
      <div class="cs-block">
        <h4>Challenge</h4>
        <p>10+ teams, each with its own Figma library. Duplicate work, inconsistent UI, hard maintenance. No shared language between design and development.</p>
      </div>
      <div class="cs-block">
        <h4>Approach</h4>
        <p>Current state audit → principle definition → foundation layer (colours, typography, spacing) → components → documentation → adoption process.</p>
      </div>
    </div>

    <div class="seyfor-wide-ph" style="aspect-ratio:16/5;">
      [ Screenshot — audit map: overview of UI patterns across products before unification ]
    </div>`,
    sey_components: `<h2>Component library</h2>
    <p>The library is built on atomic principles — from basic primitives to complex layout patterns. Each component has defined variants, states, sizes, and responsive behaviour.</p>

    <h3>Library structure</h3>
    <ul>
      <li><strong>Foundation</strong> — colours, typography, spacing, iconography, motion</li>
      <li><strong>Primitives</strong> — Button, Input, Checkbox, Radio, Badge, Tag, Avatar</li>
      <li><strong>Compositions</strong> — Form groups, Card, Modal, Dropdown, Toast, Tooltip</li>
      <li><strong>Patterns</strong> — Data table, Filters, Pagination, Navigation, Sidebar</li>
      <li><strong>Templates</strong> — Layouts for the most common screen types</li>
    </ul>

    <div class="seyfor-3col">
      <div class="seyfor-ph">[ Screenshot — Button component with all variants & states in Figma ]</div>
      <div class="seyfor-ph">[ Screenshot — Form group with Input, Label, Error state ]</div>
      <div class="seyfor-ph">[ Screenshot — Data table pattern with filters and pagination ]</div>
    </div>

    <h3>Variants and states</h3>
    <p>Each component covers all interaction states: default, hover, focus, active, disabled, loading, error. I used Figma variables so states toggle with one click — not just in prototypes, but in handoff to developers too.</p>

    <div class="seyfor-wide-ph">
      [ Video / GIF — switching component states via Figma variables in real time ]
    </div>

    <div class="impact-note">
      <strong>Result:</strong> A new designer can build a full product screen from existing components in a fraction of the previous time. No reinvention required.
    </div>

    <h3>Motion and animations</h3>
    <p>I defined shared easing curves and duration values. All transitions in the library are consistent — nothing "pops", everything flows. Motion tokens are documented and linked to CSS custom properties.</p>`,
    sey_tokens: `<h2>Design tokens</h2>
    <p>Tokens are the backbone of the whole system. Instead of hardcoded hex values or px numbers, everyone works with named values — <code style="font-size:0.82rem;background:var(--bg-alt);padding:0.1rem 0.35rem;border-radius:4px;">color.surface.primary</code>, <code style="font-size:0.82rem;background:var(--bg-alt);padding:0.1rem 0.35rem;border-radius:4px;">spacing.md</code>, <code style="font-size:0.82rem;background:var(--bg-alt);padding:0.1rem 0.35rem;border-radius:4px;">radius.card</code>.</p>

    <div class="token-diagram">
      <div class="token-tier">
        <span class="token-tier-label">Global</span>
        <span class="token-arrow">→</span>
        <div class="token-chips">
          <span class="token-chip global">#0f0f0f</span>
          <span class="token-chip global">#f5f4f0</span>
          <span class="token-chip global">16px</span>
          <span class="token-chip global">24px</span>
          <span class="token-chip global">8px</span>
          <span class="token-chip global">300ms</span>
        </div>
      </div>
      <div class="token-tier">
        <span class="token-tier-label">Semantic</span>
        <span class="token-arrow">→</span>
        <div class="token-chips">
          <span class="token-chip semantic">color.text.default</span>
          <span class="token-chip semantic">color.surface.primary</span>
          <span class="token-chip semantic">spacing.md</span>
          <span class="token-chip semantic">radius.card</span>
          <span class="token-chip semantic">motion.duration.medium</span>
        </div>
      </div>
      <div class="token-tier">
        <span class="token-tier-label">Component</span>
        <span class="token-arrow">→</span>
        <div class="token-chips">
          <span class="token-chip component">button.bg.primary</span>
          <span class="token-chip component">button.radius</span>
          <span class="token-chip component">input.border.default</span>
          <span class="token-chip component">card.padding</span>
        </div>
      </div>
    </div>

    <div class="cs-grid">
      <div class="cs-block">
        <h4>Token architecture</h4>
        <ul>
          <li>Global tokens — raw values (hex, px, ms)</li>
          <li>Semantic tokens — purpose-based names (color.text.muted)</li>
          <li>Component tokens — component-specific values</li>
        </ul>
      </div>
      <div class="cs-block">
        <h4>Output formats</h4>
        <ul>
          <li>CSS custom properties for web products</li>
          <li>JSON for automated pipelines</li>
          <li>Figma Variables for designers</li>
          <li>Dark/light theme support via token aliases</li>
        </ul>
      </div>
    </div>

    <div class="seyfor-3col">
      <div class="seyfor-ph">[ Screenshot — Figma Variables panel, colour tokens ]</div>
      <div class="seyfor-ph">[ Screenshot — JSON token file (tokens.json) ]</div>
      <div class="seyfor-ph">[ Screenshot — CSS custom properties in DevTools ]</div>
    </div>

    <div class="impact-note">
      <strong>Key shift:</strong> Switching to dark mode or a rebrand stopped being a month-long project. Change the semantic tokens in one place.
    </div>`,
    sey_code: `<h2>Code &amp; Handoff</h2>
    <p>One of my goals was to minimise information loss when handing off from Figma to code. Tokens are named identically in both environments — designer and developer speak the same language.</p>

    <h3>Token output — CSS</h3>
    <div class="code-block">
      <span class="code-lang">CSS</span>
      <pre><span class="token-comment">/* Generated from design tokens — do not edit manually */</span>
<span class="token-punct">:root {</span>
  <span class="token-comment">/* Color — surface */</span>
  <span class="token-prop">--color-surface-primary</span><span class="token-punct">:</span> <span class="token-value">#f5f4f0</span><span class="token-punct">;</span>
  <span class="token-prop">--color-surface-card</span><span class="token-punct">:</span>    <span class="token-value">#ffffff</span><span class="token-punct">;</span>
  <span class="token-prop">--color-surface-alt</span><span class="token-punct">:</span>    <span class="token-value">#eeecea</span><span class="token-punct">;</span>

  <span class="token-comment">/* Color — text */</span>
  <span class="token-prop">--color-text-default</span><span class="token-punct">:</span>   <span class="token-value">#0f0f0f</span><span class="token-punct">;</span>
  <span class="token-prop">--color-text-muted</span><span class="token-punct">:</span>     <span class="token-value">#6b6b6b</span><span class="token-punct">;</span>
  <span class="token-prop">--color-text-subtle</span><span class="token-punct">:</span>    <span class="token-value">#a0a0a0</span><span class="token-punct">;</span>

  <span class="token-comment">/* Spacing */</span>
  <span class="token-prop">--spacing-xs</span><span class="token-punct">:</span>           <span class="token-value">4px</span><span class="token-punct">;</span>
  <span class="token-prop">--spacing-sm</span><span class="token-punct">:</span>           <span class="token-value">8px</span><span class="token-punct">;</span>
  <span class="token-prop">--spacing-md</span><span class="token-punct">:</span>           <span class="token-value">16px</span><span class="token-punct">;</span>
  <span class="token-prop">--spacing-lg</span><span class="token-punct">:</span>           <span class="token-value">24px</span><span class="token-punct">;</span>
  <span class="token-prop">--spacing-xl</span><span class="token-punct">:</span>           <span class="token-value">40px</span><span class="token-punct">;</span>

  <span class="token-comment">/* Radius */</span>
  <span class="token-prop">--radius-sm</span><span class="token-punct">:</span>            <span class="token-value">6px</span><span class="token-punct">;</span>
  <span class="token-prop">--radius-md</span><span class="token-punct">:</span>            <span class="token-value">10px</span><span class="token-punct">;</span>
  <span class="token-prop">--radius-card</span><span class="token-punct">:</span>          <span class="token-value">12px</span><span class="token-punct">;</span>

  <span class="token-comment">/* Motion */</span>
  <span class="token-prop">--motion-duration-fast</span><span class="token-punct">:</span>  <span class="token-value">150ms</span><span class="token-punct">;</span>
  <span class="token-prop">--motion-duration-med</span><span class="token-punct">:</span>   <span class="token-value">280ms</span><span class="token-punct">;</span>
  <span class="token-prop">--motion-ease-spring</span><span class="token-punct">:</span>   <span class="token-value">cubic-bezier(0.34, 1.56, 0.64, 1)</span><span class="token-punct">;</span>
<span class="token-punct">}</span></pre>
    </div>

    <h3>Token output — JSON (Style Dictionary)</h3>
    <div class="code-block">
      <span class="code-lang">JSON</span>
      <pre><span class="token-punct">{</span>
  <span class="token-prop">"color"</span><span class="token-punct">: {</span>
    <span class="token-prop">"surface"</span><span class="token-punct">: {</span>
      <span class="token-prop">"primary"</span><span class="token-punct">: {</span> <span class="token-prop">"value"</span><span class="token-punct">:</span> <span class="token-value">"#f5f4f0"</span><span class="token-punct">,</span> <span class="token-prop">"type"</span><span class="token-punct">:</span> <span class="token-value">"color"</span> <span class="token-punct">},</span>
      <span class="token-prop">"card"</span><span class="token-punct">:    {</span> <span class="token-prop">"value"</span><span class="token-punct">:</span> <span class="token-value">"#ffffff"</span><span class="token-punct">,</span>  <span class="token-prop">"type"</span><span class="token-punct">:</span> <span class="token-value">"color"</span> <span class="token-punct">}</span>
    <span class="token-punct">}</span>
  <span class="token-punct">},</span>
  <span class="token-prop">"spacing"</span><span class="token-punct">: {</span>
    <span class="token-prop">"md"</span><span class="token-punct">: {</span> <span class="token-prop">"value"</span><span class="token-punct">:</span> <span class="token-value">"16"</span><span class="token-punct">,</span> <span class="token-prop">"type"</span><span class="token-punct">:</span> <span class="token-value">"spacing"</span> <span class="token-punct">}</span>
  <span class="token-punct">}</span>
<span class="token-punct">}</span></pre>
    </div>

    <h3>Component in Storybook</h3>
    <p>Each Figma component has its counterpart in Storybook. Designers and developers review the implementation in the same place — no more "it does not look like Figma".</p>
    <div class="seyfor-wide-ph" style="aspect-ratio:16/5;">
      [ Screenshot — Storybook: Button component with controls panel, live variants ]
    </div>

    <div class="impact-note">
      <strong>Pipeline:</strong> Figma Variables → export JSON → Style Dictionary → CSS custom properties + Android/iOS tokens. One source of truth, three platforms.
    </div>`,
    sey_documentation: `<h2>Documentation</h2>
    <p>Good components are not enough without documentation. I wrote documentation in Zeroheight that covers not only what a component does, but when to use it, when not to use it, and how it behaves in different contexts.</p>

    <div class="seyfor-3col">
      <div class="seyfor-ph">[ Screenshot — Zeroheight page for Button component ]</div>
      <div class="seyfor-ph">[ Screenshot — Usage guidelines: DO / DON'T examples ]</div>
      <div class="seyfor-ph">[ Screenshot — Accessibility tab: ARIA, keyboard nav ]</div>
    </div>

    <h3>What the documentation includes</h3>
    <ul>
      <li>Visual overview of all variants and states</li>
      <li>Usage guidelines — when to use this component and when to choose another</li>
      <li>Accessibility — ARIA attributes, keyboard navigation, contrast ratio</li>
      <li>Code snippets — copy and use without searching</li>
      <li>Changelog — what changed and why</li>
      <li>Design decisions — rationale for future reference</li>
    </ul>

    <h3>Documentation sustainability</h3>
    <p>The documentation is a living document — updated alongside components. I introduced a review process so no component ships without updated documentation.</p>`,
    sey_collaboration: `<h2>Developer collaboration</h2>
    <p>A design system only works when developers want to use it. I spend a lot of time in code — not writing production code, but understanding implementation constraints and adapting design to reality.</p>

    <div class="seyfor-3col">
      <div class="seyfor-ph">[ Screenshot — GitHub issue: proposal for new component, discussion ]</div>
      <div class="seyfor-ph">[ Screenshot — Figma redline / dev mode handoff ]</div>
      <div class="seyfor-ph">[ Screenshot — Storybook review: design vs implementation ]</div>
    </div>

    <h3>How it works in practice</h3>
    <ul>
      <li>Regular design system syncs with frontend leads across products</li>
      <li>GitHub issues track component status and progress</li>
      <li>Storybook as a shared review environment — designers and developers see the same thing</li>
      <li>Semantic versioning for components — no breaking changes without notice</li>
      <li>Office hours — developers can ask questions directly</li>
    </ul>

    <div class="cs-grid">
      <div class="cs-block">
        <h4>Design → Dev handoff</h4>
        <p>Figma files are structured so developers can read them without a mediator. Spacing, typography, colors — everything maps to tokens with matching CSS names.</p>
      </div>
      <div class="cs-block">
        <h4>Feedback loop</h4>
        <p>Each quarter I run an anonymous satisfaction survey across teams. Results directly influence the roadmap — what to fix, expand, or add.</p>
      </div>
    </div>`,
    sey_impact: `<h2>Impact</h2>
    <p>A design system is not a project with an end — it is infrastructure. The results appear gradually, but they are measurable.</p>

    <div class="outcome-grid">
      <div class="outcome-card">
        <div class="outcome-num">200+</div>
        <div class="outcome-label">Components in the library</div>
        <div class="outcome-desc">Covering 90%+ of product teams' UI needs.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">↓40%</div>
        <div class="outcome-label">Fewer inconsistencies</div>
        <div class="outcome-desc">Measured by an internal cross-product UI audit.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">10+</div>
        <div class="outcome-label">Teams adopted the system</div>
        <div class="outcome-desc">Including the oldest legacy products.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">↑</div>
        <div class="outcome-label">Faster onboarding</div>
        <div class="outcome-desc">New designers become productive twice as fast.</div>
      </div>
    </div>

    <div class="seyfor-wide-ph" style="margin-top:2rem;">
      [ Screenshot — roadmap or adoption dashboard: overview of system adoption across products ]
    </div>`,
    sey_footer: `<div class="footer-inner">
      <span class="footer-copy">© <strong>Ota Škvor</strong>. All rights reserved.</span>
      <a href="../index.html" class="back-to-portfolio">Back to portfolio</a>
    </div>`,
    fintech_page_title: 'Fintech Mobile App — Ota Škvor',
    fintech_nav: `<div class="case-nav-inner">
      <a href="../freelance.html" class="back-link">Freelance &amp; Studies</a>
      <ul class="case-toc">
        <li><a href="#overview">Overview</a></li>
        <li><a href="#problem">Problem</a></li>
        <li><a href="#research">Research</a></li>
        <li><a href="#solution">Solution</a></li>
        <li><a href="#outcome">Outcome</a></li>
      </ul>
    </div>`,
    fintech_hero: `<div class="case-tags">
      <span class="case-tag">01 / Freelance</span>
      <span class="case-tag">Fintech</span>
      <span class="case-tag">iOS</span>
      <span class="case-tag">UI/UX</span>
    </div>
    <h1>Fintech mobile app — onboarding redesign</h1>
    <p class="case-hero-sub">A Czech fintech app was losing 60% of users during registration. I joined as the designer with a clear brief: find out why and propose a better onboarding experience.</p>

    <div class="case-stats">
      <div class="stat"><div class="stat-num">↓28%</div><div class="stat-label">drop-off in onboarding</div></div>
      <div class="stat"><div class="stat-num">14→8</div><div class="stat-label">steps after redesign</div></div>
      <div class="stat"><div class="stat-num">6</div><div class="stat-label">user interviews</div></div>
      <div class="stat"><div class="stat-num">iOS</div><div class="stat-label">platform</div></div>
    </div>`,
    fintech_problem: `<h2>Problem</h2>
    <p>Onboarding had 14 steps, with KYC placed in the middle — users hit a complex documents flow before they understood the app's value. Classic mistake: <em>ask first, deliver later</em>.</p>
    <p>Hotjar session recordings showed a clear pattern: 60% of churn happened on screens 3–5, exactly where KYC began. Users did not leave because it was hard. They left because they did not know why they were doing it.</p>

    <div class="section-img">
      <div class="section-img-ph" style="aspect-ratio:16/5;">
        <span class="section-img-ph-label">Chart — funnel analysis: drop-off by step</span>
      </div>
      <div class="section-img-caption">Drop-off funnel analysis from Hotjar · 60% left on steps 3–5</div>
    </div>`,
    fintech_research: `<h2>Research</h2>
    <p>6 user interviews + session recordings analysis (Hotjar). A combination of qualitative understanding of <em>why</em> and quantitative insight into <em>where</em>.</p>

    <div class="cs-grid">
      <div class="cs-block">
        <h4>Key insight 1</h4>
        <p>Users did not know what to expect. No progress indication, no step overview — just an endless form.</p>
      </div>
      <div class="cs-block">
        <h4>Key insight 2</h4>
        <p>KYC felt like a barrier rather than part of onboarding value. There was no context for why a document was needed.</p>
      </div>
      <div class="cs-block">
        <h4>Key insight 3</h4>
        <p>Users could not picture what the app would deliver. There was no value preview before registration.</p>
      </div>
      <div class="cs-block">
        <h4>Key insight 4</h4>
        <p>Forms lacked smart defaults and autofill. Every field required full manual entry — unnecessary cognitive load.</p>
      </div>
    </div>

    <div class="section-img">
      <div class="section-img-ph" style="aspect-ratio:16/5;">
        <span class="section-img-ph-label">Affinity diagram from user interviews</span>
      </div>
      <div class="section-img-caption">Synthesised 6 interviews into themes · Hotjar replay + interview insights</div>
    </div>`,
    fintech_solution: `<h2>Solution</h2>
    <p>I redesigned the onboarding flow around value-first principles — users see what the app can do before they are asked to fill anything out.</p>

    <ul>
      <li>Value-first dashboard preview before registration</li>
      <li>Progressive-disclosure KYC — split into 3 clear steps with explicit context</li>
      <li>Smart defaults and autofill reduced required interactions by one third</li>
      <li>Micro-animations confirmed each completed step — instant feedback</li>
      <li>Progress bar “Step 2 of 4” kept the finish line visible</li>
    </ul>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;margin:1.4rem 0;">
      <div style="aspect-ratio:9/16;background:var(--bg-alt);border:1px solid var(--border-light);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:0.68rem;color:var(--fg-light);text-align:center;padding:0.5rem;">Screen 1<br>Welcome + value prop</div>
      <div style="aspect-ratio:9/16;background:var(--bg-alt);border:1px solid var(--border-light);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:0.68rem;color:var(--fg-light);text-align:center;padding:0.5rem;">Screen 2<br>Dashboard preview</div>
      <div style="aspect-ratio:9/16;background:var(--bg-alt);border:1px solid var(--border-light);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:0.68rem;color:var(--fg-light);text-align:center;padding:0.5rem;">Screen 3<br>KYC with context</div>
    </div>

    <div class="impact-note">
      <strong>Design decision:</strong> move KYC after the first “wow moment” — users first see a dashboard with simulated data, then they are asked for documents. Motivation becomes clear.
    </div>`,
    fintech_outcome: `<h2>Outcome</h2>
    <p>The redesign launched after three months of iteration. Results were tracked in the first month after launch.</p>

    <div class="outcome-grid">
      <div class="outcome-card">
        <div class="outcome-num">↓28%</div>
        <div class="outcome-label">Drop-off</div>
        <div class="outcome-desc">Compared to the original flow after one month.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">14→8</div>
        <div class="outcome-label">Onboarding steps</div>
        <div class="outcome-desc">Without losing KYC compliance.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">↓33%</div>
        <div class="outcome-label">Required interactions</div>
        <div class="outcome-desc">Smart defaults and autofill removed redundant inputs.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">+NPS</div>
        <div class="outcome-label">User feedback</div>
        <div class="outcome-desc">Positive shift in onboarding ratings.</div>
      </div>
    </div>

    <div class="impact-note" style="margin-top:1.4rem;">
      <strong>Reflection:</strong> users don’t leave because a process is hard. They leave because they do not see a reason to stay. Value must come before requests.
    </div>`,
    fintech_pager: `<a href="../freelance.html" class="tl-btn">← Back to Freelance</a>
    <a href="medical-website.html" class="tl-btn">Healthcare clinic website redesign →</a>`,
    fintech_footer: `<div class="footer-inner">
      <span class="footer-copy">© <strong>Ota Škvor</strong>. All rights reserved.</span>
      <div style="display:flex;align-items:center;gap:1rem;">
        <a href="../../index.html" class="back-to-portfolio">Back to portfolio</a>
        <div class="lang-dropdown" id="langDropdown">
          <button class="lang-dropdown-trigger" id="langTrigger" aria-haspopup="true" aria-expanded="false">
            <span class="lang-flag" id="langFlag">EN</span>
            <svg class="lang-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="lang-dropdown-menu" id="langMenu" role="menu">
            <button class="lang-option active" data-lang="en" role="menuitem">
              <span>EN</span><span class="lang-option-label">English</span>
            </button>
            <button class="lang-option" data-lang="cs" role="menuitem">
              <span>CZ</span><span class="lang-option-label">Česky</span>
            </button>
          </div>
        </div>
      </div>
    </div>`,
  }
};

const tooltipTexts = {
  en: {
    tooltip_vema: 'Product I’m working on',
    hero_design_systems: 'Design system architecture, libraries and component thinking.',
    hero_uiux_design: 'User interface and experience design for digital products.',
    hero_figma: 'Figma expert for prototypes, systems and handoff.',
    hero_interaction_design: 'Deliberate motion and interface behavior design.',
    hero_design_tokens: 'Design token systems that connect design and code.',
    hero_enterprise_saas: 'Enterprise SaaS product design for complex workflows.',
    hero_dev_handoff: 'Smooth collaboration between design and engineering.',
    skill_design_systems: 'I build consistent, reusable UI design systems.',
    skill_ui_design: 'I design polished, modern user interfaces with attention to detail.',
    skill_ux_research: 'Research-driven products with user testing and validation.',
    skill_interaction_design: 'Designing intuitive interaction patterns and transitions.',
    skill_prototyping: 'I turn static designs into interactive prototypes that simulate how the final component or application will behave.',
    skill_user_flows: 'I use user flows to map complex interfaces and ensure a logical journey throughout the experience.',
    skill_information_architecture: 'I structure content so users can navigate and find what they need with ease.',
    skill_usability_testing: 'When needed, I test designs with real users to identify opportunities for improvement.',
    skill_ab_testing: 'Running experiments to learn what works best.',
    skill_figma: 'In Figma, I create everything from early concepts to complex components and prototypes.',
    skill_storybook: 'Documenting components with Storybook for developer teams.',
    skill_zeroheight: 'Design system documentation and guidelines in Zeroheight.',
    skill_principle: 'Motion and interaction prototypes built in Principle.',
    skill_framer: 'Interactive interface prototypes built in Framer.',
    skill_adobe_cc: 'Visual assets, motion and polish using Adobe Creative Cloud.',
    skill_miro: 'I use Miro to map processes and create low-fidelity prototypes.',
    skill_notion: 'Documentation and team workflows organised in Notion.',
    skill_design_tokens: 'I use design tokens to keep themes consistent and make them faster to maintain and evolve.',
    skill_component_libraries: 'I create libraries of reusable components for both design and development.',
    skill_component_apis: 'Designing component APIs with clear props and states.',
    skill_html_css: 'With a solid understanding of HTML, CSS, and frontend development, I design with real-world implementation in mind.',
    skill_accessibility: 'I consider contrast, readability, and other accessibility principles throughout the design process.',
    skill_wcag_accessibility: 'Accessible layouts and interactions following WCAG.',
    skill_responsive_design: 'I consider how interfaces adapt and behave across different devices.',
    skill_dev_collaboration: 'I work closely with developers from initial design through final implementation.',
    skill_git_basics: 'I use Git for basic version control and collaboration with developers.',
    skill_enterprise_saas: 'Strategy and UX for enterprise-grade software.',
    skill_b2b_software: 'Design for B2B workflows and business-critical tools.',
    skill_data_visualisation: 'Communicating data clearly through dashboards.',
    skill_erp_crm_systems: 'UX for ERP, CRM and enterprise operations systems.',
    skill_fintech: 'Financial product experiences built for trust and clarity.',
    skill_ecommerce: 'Commerce flows optimised for browsing and conversion.',
    skill_mobile_ios_android: 'Mobile-first UX for iOS and Android platforms.',
    skill_ux_design: 'I design functional and intuitive interfaces around user needs.',
    skill_wireframing: 'I use wireframes to quickly explore structure and layout.',
    skill_visual_design: 'I work with typography, composition, and visual hierarchy to create clear, balanced interfaces.',
    skill_color_theory: 'I work with color, contrast, and clear guidelines to ensure consistency across the product.',
    skill_documentation: 'I create clear documentation that defines component usage and other design system practices.',
    skill_js_python: 'I have a working knowledge of JavaScript and Python for simple scripting and automation.',
    skill_seo: 'I understand SEO fundamentals and account for them when designing web interfaces.',
    skill_cloude: 'AI assistant (Claude) for ideation and research workflows.',
    skill_wordpress: 'Building and managing sites using WordPress.',
    skill_trello: 'Organising projects, tasks and sprint planning in Trello.',
    skill_midjourney: 'Creative AI-assisted visual ideation and asset generation in Midjourney.',
    skill_figjam: 'I use FigJam for brainstorming and rapid team collaboration.',
    skill_photoshop: 'Raster editing, compositing and image preparation in Photoshop.',
    edu_typography: '',
    edu_color_theory: '',
    edu_grid_systems: '',
    edu_visual_identity: '',
    edu_information_design: '',
    edu_digital_design: '',
    edu_user_research: '',
    edu_interaction_design: '',
    edu_design_systems: '',
    edu_accessibility: '',
    edu_design_thinking: '',
    edu_leadership: 'Skills for leading design teams, facilitating collaboration, and driving decisions.',
    skill_cloude: 'AI assistant (Claude) for ideation and research workflows.',
    skill_wordpress: 'Building and managing sites using WordPress.',
    skill_trello: 'Organising projects, tasks and sprint planning in Trello.',
    skill_midjourney: 'Creative AI-assisted visual ideation and asset generation in Midjourney.',
    skill_figjam: 'I use FigJam for brainstorming and rapid team collaboration.',
    skill_photoshop: 'Raster editing, compositing and image preparation in Photoshop.',
    fl_page_title: 'Freelance & Studie — Ota Škvor',
    pro_page_title: 'Proconom — Ota Škvor',
    sey_page_title: 'Seyfor — Ota Škvor',
    fl_nav: `<div class="case-nav-inner">
      <a href="../index.html" class="back-link">Zpět</a>
      <ul class="case-toc">
        <li><a href="#overview">Přehled</a></li>
        <li><a href="#projects">Projekty</a></li>
      </ul>
    </div>`,
    fl_hero: `<div class="case-tags">
      <span class="case-tag">Freelance</span>
      <span class="case-tag">Magistr</span>
      <span class="case-tag">10 projektů</span>
      <span class="case-tag">2020 — 2022</span>
    </div>
    <h1>Freelance &amp; Studies</h1>
    <p class="case-hero-sub">Dvouletá epizoda paralelního studia a samostatné praxe. Magistrát na Masarykově univerzitě mi dal metodologický rámec — uživatelský výzkum, testování použitelnosti, kognitivní psychologie. Freelance projekty ho okamžitě prověřovaly v reálném světě.</p>

    <div class="case-stats">
      <div class="stat"><div class="stat-num">10</div><div class="stat-label">projektů</div></div>
      <div class="stat"><div class="stat-num">2</div><div class="stat-label">roky studia Mgr.</div></div>
      <div class="stat"><div class="stat-num">6</div><div class="stat-label">různých odvětví</div></div>
      <div class="stat"><div class="stat-num">CZ/EU</div><div class="stat-label">trhy</div></div>
    </div>`,
    fl_projects: `<div class="proj-grid">
      <a href="case/fl-01-fintech.html" class="proj-card reveal">
        <div class="proj-card-img-placeholder"><span>Fintech · iOS · Onboarding</span></div>
        <div class="proj-card-body">
          <div class="proj-num">01</div>
          <div class="proj-name">Fintech mobile app</div>
          <div class="proj-type">UI/UX · iOS · Fintech</div>
          <div class="proj-desc">Redesign onboardingu a klíčových transakcí pro českou fintech aplikaci. Snížení drop-off v onboarding flow o 28 %.</div>
          <div class="proj-tags"><span class="proj-tag">Figma</span><span class="proj-tag">iOS HIG</span><span class="proj-tag">User research</span></div>
        </div>
      </a>

            <a href="case/medical-website.html" class="proj-card reveal reveal-delay-1">
        <div class="proj-card-img-placeholder"><span>Úvodní stránka kliniky a rezervační flow</span></div>
        <div class="proj-card-body">
          <div class="proj-num">02</div>
          <div class="proj-name">Redesign webu zdravotnické kliniky</div>
          <div class="proj-type">Healthcare · Web</div>
          <div class="proj-desc">Případová studie: redesign webu zdravotnické kliniky. Online rezervace nahradila telefonické objednávání a snížila počet hovorů o 45 %.</div>
          <div class="proj-tags"><span class="proj-tag">Healthcare</span><span class="proj-tag">Web</span><span class="proj-tag">UX Research</span></div>
        </div>
      </a>

      <a href="case/music-website.html" class="proj-card reveal reveal-delay-2">
        <div class="proj-card-img-placeholder"><span>Přehled péče o rostliny a připomínky</span></div>
        <div class="proj-card-body">
          <div class="proj-num">03</div>
          <div class="proj-name">Rooted — mobilní aplikace pro péči o rostliny</div>
          <div class="proj-type">Mobile app · iOS/Android</div>
          <div class="proj-desc">Případová studie: Rooted, aplikace pro péči o rostliny, která pomáhá nováčkům udržet pokojovky naživu díky jednoduchým, personalizovaným připomínkám.</div>
          <div class="proj-tags"><span class="proj-tag">Mobile app</span><span class="proj-tag">iOS/Android</span><span class="proj-tag">Sustainability</span></div>
        </div>
      </a>

      <a href="case/subscription-app.html" class="proj-card reveal reveal-delay-3">
        <div class="proj-card-img-placeholder"><span>Timeline předplatných a upozornění na obnovení</span></div>
        <div class="proj-card-body">
          <div class="proj-num">04</div>
          <div class="proj-name">Subly — aplikace pro správu předplatných</div>
          <div class="proj-type">Fintech · Mobile</div>
          <div class="proj-desc">Případová studie: Subly, aplikace pomáhající lidem sledovat a rušit nevyužitá předplatná před obnovením.</div>
          <div class="proj-tags"><span class="proj-tag">Fintech</span><span class="proj-tag">Mobile</span><span class="proj-tag">Personal finance</span></div>
        </div>
      </a>

      <a href="case/gaming-website.html" class="proj-card reveal">
        <div class="proj-card-img-placeholder"><span>Přehled soupisky týmu a rozpisu zápasů</span></div>
        <div class="proj-card-body">
          <div class="proj-num">05</div>
          <div class="proj-name">Web esportového týmu a komunity</div>
          <div class="proj-type">Gaming · Web</div>
          <div class="proj-desc">Případová studie: redesign webu regionální esportové organizace, postavený tak, aby sloužil fanouškům, sponzorům i hráčům z jednoho místa.</div>
          <div class="proj-tags"><span class="proj-tag">Gaming</span><span class="proj-tag">Web</span><span class="proj-tag">Community</span></div>
        </div>
      </a>

      <a href="case/proconom-website.html" class="proj-card reveal reveal-delay-1">
        <div class="proj-card-img-placeholder"><span>Nová domovská stránka a šablony produktového katalogu</span></div>
        <div class="proj-card-body">
          <div class="proj-num">06</div>
          <div class="proj-name">Redesign firemního webu</div>
          <div class="proj-type">Corporate web · Agency</div>
          <div class="proj-desc">Případová studie: redesign firemního webu realizovaný během mého působení v Proconomu, přestavba zastaralého klientského webu na udržovatelnou platformu řízenou CMS.</div>
          <div class="proj-tags"><span class="proj-tag">Corporate web</span><span class="proj-tag">Agency</span><span class="proj-tag">CMS</span></div>
        </div>
      </a>

      <a href="case/proconom-app.html" class="proj-card reveal reveal-delay-2">
        <div class="proj-card-img-placeholder"><span>Rozhraní tvorby nabídky a cenových pravidel</span></div>
        <div class="proj-card-body">
          <div class="proj-num">07</div>
          <div class="proj-name">Interní nástroj pro tvorbu nabídek</div>
          <div class="proj-type">Internal tool · B2B</div>
          <div class="proj-desc">Případová studie: interní nástroj pro tvorbu nabídek vytvořený během mého působení v Proconomu, nahrazující proces založený na tabulkách náchylný k cenovým chybám.</div>
          <div class="proj-tags"><span class="proj-tag">Internal tool</span><span class="proj-tag">B2B</span><span class="proj-tag">Workflow</span></div>
        </div>
      </a>

      <a href="case/roomly.html" class="proj-card reveal reveal-delay-3">
        <div class="proj-card-img-placeholder"><span>Kalendář rezervací místností a přehled pro členy</span></div>
        <div class="proj-card-body">
          <div class="proj-num">08</div>
          <div class="proj-name">Roomly — platforma pro rezervaci coworkingu</div>
          <div class="proj-type">Booking · Web app</div>
          <div class="proj-desc">Případová studie: Roomly, platforma pro rezervaci místností a stolů navržená pro malé coworkingové prostory s omezenou administrativní kapacitou.</div>
          <div class="proj-tags"><span class="proj-tag">Booking</span><span class="proj-tag">Web app</span><span class="proj-tag">Coworking</span></div>
        </div>
      </a>

      <a href="case/snake-name.html" class="proj-card reveal">
        <div class="proj-card-img-placeholder"><span>Herní obrazovka a žebříček podle iniciál</span></div>
        <div class="proj-card-body">
          <div class="proj-num">09</div>
          <div class="proj-name">SnakeName — retro prohlížečová hra</div>
          <div class="proj-type">Side project · Game</div>
          <div class="proj-desc">Případová studie: SnakeName, osobní vedlejší projekt oživující klasickou hru Snake s hravým žebříčkem podle iniciál, vytvořený pro zdokonalení front-end a interakčního designu mimo klientskou práci.</div>
          <div class="proj-tags"><span class="proj-tag">Side project</span><span class="proj-tag">Game</span><span class="proj-tag">Canvas / JS</span></div>
        </div>
      </a>
    </div>`,
    fl_footer: `<div class="footer-inner">
      <span class="footer-copy">© <strong>Ota Škvor</strong>. All rights reserved.</span>
      <div style="display:flex;align-items:center;gap:1rem;">
        <a href="../index.html" class="back-to-portfolio">Zpět do portfolia</a>
        <div class="lang-dropdown" id="langDropdown">
          <button class="lang-dropdown-trigger" id="langTrigger" aria-haspopup="true" aria-expanded="false">
            <span class="lang-flag" id="langFlag">CZ</span>
            <svg class="lang-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="lang-dropdown-menu" id="langMenu" role="menu">
            <button class="lang-option" data-lang="en" role="menuitem">
              <span>EN</span><span class="lang-option-label">English</span>
            </button>
            <button class="lang-option active" data-lang="cs" role="menuitem">
              <span>CZ</span><span class="lang-option-label">Česky</span>
            </button>
          </div>
        </div>
      </div>
    </div>`,
    pro_nav: `<div class="case-nav-inner">
      <a href="../index.html" class="back-link">Zpět</a>
      <ul class="case-toc">
        <li><a href="#overview">Přehled</a></li>
        <li><a href="#role">Role</a></li>
        <li><a href="#projects">Projekty</a></li>
        <li><a href="#proj-1">B2B portál</a></li>
        <li><a href="#proj-2">Municipální web</a></li>
        <li><a href="#proj-3">HR nástroj</a></li>
        <li><a href="#proj-4">Komponentní knihovna</a></li>
        <li><a href="#proj-5">E-learning</a></li>
      </ul>
    </div>`,
    pro_hero: `<div class="case-tags">
      <span class="case-tag">Agentura</span>
      <span class="case-tag">UI/UX design</span>
      <span class="case-tag">5 projektů</span>
      <span class="case-tag">2017 — 2020</span>
    </div>
    <h1>Proconom <span style="font-style:italic;color:var(--fg-muted);">2017 — 2020</span></h1>
    <p class="case-hero-sub">Tři roky v brněnské digitální agentuře zaměřené na enterprise klienty — samosprávy, výrobní firmy, B2B. Pracoval jsem jako UX/UI designér na klientských projektech a postupně jsem přebíral roli designového leadu pro větší zakázky.</p>

    <div class="case-stats">
      <div class="stat"><div class="stat-num">5+</div><div class="stat-label">doručených projektů</div></div>
      <div class="stat"><div class="stat-num">3</div><div class="stat-label">roky v agentuře</div></div>
      <div class="stat"><div class="stat-num">✦</div><div class="stat-label">první design systém agentury</div></div>
      <div class="stat"><div class="stat-num">B2B</div><div class="stat-label">enterprise fokus</div></div>
    </div>`,
    pro_role: `<h2>Co jsem v Proconu dělal</h2>
    <p>Začínal jsem jako junior designér — wireframy, grafické podklady, koordinace s klienty. Postupně jsem přebíral větší odpovědnost: vedl jsem design fáze větších projektů, zavedl výzkumné metody a budoval interní designové procesy, které agentura předtím neměla.</p>

    <div class="role-grid">
      <div class="role-block">
        <div class="role-block-title">UX Design &amp; Research</div>
        <p>User journeys, wireframy, uživatelské rozhovory, základní usability testování. Zavedl jsem první UX review proces — před každým launchem proběhlo strukturované hodnocení.</p>
      </div>
      <div class="role-block">
        <div class="role-block-title">UI Design</div>
        <p>Hi-fi prototypy a finální grafické podklady pro vývojáře. Jednotný vizuální styl napříč projekty stejného klienta. Přechod z Photoshop → Sketch → Figma jsem v agentuře inicioval já.</p>
      </div>
      <div class="role-block">
        <div class="role-block-title">Komponentní knihovna</div>
        <p>Postavil jsem první sdílenou komponentní knihovnu agentury. Výsledkem bylo 30 % kratší doby UI fáze u nových projektů díky znovupoužitelným vzorům.</p>
      </div>
      <div class="role-block">
        <div class="role-block-title">Klientská spolupráce</div>
        <p>Přímá komunikace s klienty — requirements workshops, prezentace návrhů, iterace na základě zpětné vazby. Naučil jsem se rychle rozlišovat mezi tím, co klient říká, a co skutečně potřebuje.</p>
      </div>
    </div>`,
    pro_projects: `<h2>Projekty</h2>
    <p>Pět reprezentativních projektů z tříletého působení v agentuře — od B2B portálů po municipální weby a interní nástroje.</p>`,
    pro_cases: `<div class="proj-grid">
      <a href="#proj-1" class="proj-card reveal">
        <div class="proj-card-img-placeholder"><span>B2B Portal · Enterprise UX · Role-based</span></div>
        <div class="proj-card-body">
          <div class="proj-num">01</div>
          <div class="proj-name">B2B klientský portál</div>
          <div class="proj-type">Enterprise UX · Web</div>
          <div class="proj-desc">Zákaznický portál pro středně velkou výrobní firmu. Klienti nemohli sledovat stav zakázek, nedostávali automatická upozornění a dokumentace byla roztříštěná.</div>
          <div class="proj-tags"><span class="proj-tag">Enterprise UX</span><span class="proj-tag">Datové tabulky</span><span class="proj-tag">Role-based</span></div>
        </div>
      </a>

      <a href="#proj-2" class="proj-card reveal reveal-delay-1">
        <div class="proj-card-img-placeholder"><span>Municipal Web · WCAG AA · Public sector</span></div>
        <div class="proj-card-body">
          <div class="proj-num">02</div>
          <div class="proj-name">Municipální webová platforma</div>
          <div class="proj-type">Accessibility · Web · Public sector</div>
          <div class="proj-desc">Redesign webu pro regionální samosprávu. Největší výzva byla přesvědčit klienta, aby zjednodušil strukturu, která rostla bez logiky.</div>
          <div class="proj-tags"><span class="proj-tag">WCAG AA</span><span class="proj-tag">Government</span><span class="proj-tag">Multi-lang</span></div>
        </div>
      </a>

      <a href="#proj-3" class="proj-card reveal reveal-delay-2">
        <div class="proj-card-img-placeholder"><span>HR Tool · Internal · Workflow</span></div>
        <div class="proj-card-body">
          <div class="proj-num">03</div>
          <div class="proj-name">Interní HR nástroj</div>
          <div class="proj-type">Product design · Web app</div>
          <div class="proj-desc">HR platforma pro firmu s 200 zaměstnanci — nahradila Excel a emailové šablony pro žádosti o dovolenou.</div>
          <div class="proj-tags"><span class="proj-tag">HR Tech</span><span class="proj-tag">Forms</span><span class="proj-tag">Workflow</span></div>
        </div>
      </a>

      <a href="#proj-4" class="proj-card reveal reveal-delay-3">
        <div class="proj-card-img-placeholder"><span>Component Library · Design System · Figma</span></div>
        <div class="proj-card-body">
          <div class="proj-num">04</div>
          <div class="proj-name">Komponentní knihovna agentury</div>
          <div class="proj-type">Design System · Internal</div>
          <div class="proj-desc">První sdílená UI knihovna Proconu. Pokrývá ~80 % běžných UI potřeb a zkracuje UI fázi o 30 %.</div>
          <div class="proj-tags"><span class="proj-tag">Design system</span><span class="proj-tag">Figma</span><span class="proj-tag">Documentation</span></div>
        </div>
      </a>

      <a href="#proj-5" class="proj-card reveal">
        <div class="proj-card-img-placeholder"><span>E-learning · EdTech · Responsive</span></div>
        <div class="proj-card-body">
          <div class="proj-num">05</div>
          <div class="proj-name">E-learningová platforma</div>
          <div class="proj-type">UX Research · EdTech · Web</div>
          <div class="proj-desc">Vzdělávací platforma pro průmyslovou firmu — interní kurzy pro zaměstnance, fungující na tabletech v hale i na desktopu v kanceláři.</div>
          <div class="proj-tags"><span class="proj-tag">EdTech</span><span class="proj-tag">Responsive</span><span class="proj-tag">LMS</span></div>
        </div>
      </a>
    </div>

    <div class="proj-case" id="proj-1">
      <div class="case-tags"><span class="case-tag">01</span><span class="case-tag">Enterprise · B2B portál</span></div>
      <h2>B2B klientský portál</h2>
      <p>Výrobní firma s 50+ B2B partnery spravovala objednávky emailem a telefonem. Klienti nemohli sami sledovat stav zakázek, nedostávali automatická upozornění a dokumentace byla v různých formátech na různých místech.</p>
      <h3>Výzva</h3>
      <p>Portál musel sloužit třem typům uživatelů — nákupčím, obchodním zástupcům a logistice. Každý potřeboval jiná data na první pohled, ale sdíleli stejnou databázi zakázek.</p>
      <h3>Řešení</h3>
      <ul>
        <li>Role-based dashboard — každá role vidí jiný default view, ale má přístup ke všemu</li>
        <li>Stavový tracker zakázky — vizuální timeline od objednávky po doručení</li>
        <li>Centrální knihovna dokumentů s vyhledáváním a filtrací</li>
        <li>Email notifikace s deep links přímo na konkrétní zakázku</li>
      </ul>
      <div class="impact-note"><strong>Výsledek:</strong> Počet telefonátů na obchodní oddělení klesl o 60 % v prvním kvartálu.</div>
    </div>

    <div class="proj-case" id="proj-2">
      <div class="case-tags"><span class="case-tag">02</span><span class="case-tag">Public sector · WCAG</span></div>
      <h2>Municipální webová platforma</h2>
      <p>Redesign webu pro regionální samosprávu. Největší výzva nebyla technická — bylo přesvědčit klienta, aby zjednodušil strukturu, která roky rostla organicky bez logiky.</p>
      <h3>Přístupnost jako výchozí bod</h3>
      <p>WCAG AA nebylo příjemné bonus — bylo zákonným požadavkem. Prošel jsem celý web s čtečkou obrazovky a keyboard-only navigací. Našel jsem 34 kritických problémů. Všechny jsme opravili před launchem.</p>
      <h3>Information architecture</h3>
      <ul>
        <li>Card sorting se 20 občany odhalil, jak lidé skutečně hledají informace</li>
        <li>Navigace přeorganizována podle user needs, ne podle interní struktury úřadu</li>
        <li>Search jako primární vstupní bod — většina lidí hledá, ne prochází menu</li>
      </ul>
    </div>

    <div class="proj-case" id="proj-3">
      <div class="case-tags"><span class="case-tag">03</span><span class="case-tag">HR Tech · Internal tool</span></div>
      <h2>Interní HR nástroj</h2>
      <p>200 zaměstnanců, 3 střediska, HR oddělení o 2 lidech spravující vše v Excelu. Systém nahradil 4 různé spreadsheetové šablony a emailové šablony pro žádosti o dovolenou.</p>
      <h3>Klíčové designové rozhodnutí</h3>
      <p>Zaměstnanci v provozu měli přistupovat ze sdílených terminálů. Žádné složité přihlašování, žádné dlouhé formuláře. Klíčová akce — žádost o dovolenou — musela jít do 3 kliknutí.</p>
      <h3>Co jsem navrhl</h3>
      <ul>
        <li>PIN přihlášení pro sdílené terminály, plné přihlášení pro kancelář</li>
        <li>Quick actions na hlavní stránce — nejčastější akce bez navigace</li>
        <li>Schvalovací workflow s jasným stavovým modelem a email notifikacemi</li>
        <li>Hodnocení zaměstnanců: strukturované formuláře se škálami a textovými poli</li>
      </ul>
    </div>

    <div class="proj-case" id="proj-4">
      <div class="case-tags"><span class="case-tag">04</span><span class="case-tag">Design system · Internal</span></div>
      <h2>Komponentní knihovna agentury</h2>
      <p>Před tím, než jsem knihovnu postavil, každý projekt začínal od nuly. Tlačítka vypadala jinak v každém projektu. Formuláře měly jiné chování. Konzistence byla náhoda, ne systém.</p>
      <h3>Jak jsem postupoval</h3>
      <ul>
        <li>Audit 8 existujících projektů — extrakce opakujících se UI vzorů</li>
        <li>Definice 15 core komponent pokrývajících 80 % potřeb</li>
        <li>Figma Auto Layout ve všech komponentách — škálují správně bez manuálních úprav</li>
        <li>Dokumentace přímo ve Figma s usage notes a DO / DON'T příklady</li>
      </ul>
      <div class="impact-note"><strong>Výsledek:</strong> Nový projekt dostane kompletní UI kit v den 1. UI fáze se zkrátila průměrně o 30 %.</div>
    </div>

    <div class="proj-case" id="proj-5">
      <div class="case-tags"><span class="case-tag">05</span><span class="case-tag">EdTech · Responsive</span></div>
      <h2>E-learningová platforma</h2>
      <p>Průmyslová firma potřebovala vzdělávat zaměstnance o nových strojích a bezpečnostních protokolech. Část lidí pracovala u desktopu, část u sdílených tabletů v hale se zašpiněnýma rukama.</p>
      <h3>Designová řešení pro extrémní prostředí</h3>
      <ul>
        <li>Touch targets min. 48×48 px — ovládatelné i v pracovních rukavicích</li>
        <li>Vysoký kontrast jako výchozí nastavení — čitelné i na přímém světle</li>
        <li>Offline mode — kurzy stáhnutelné pro prostory bez WiFi</li>
        <li>Progress saving — přerušení kurzu neznamená začít od začátku</li>
      </ul>
      <p>Spolupracoval jsem přímo s technologem bezpečnosti práce, aby obsah kurzů byl nejen hezky navržen, ale i pedagogicky správný. Dobrý design vzdělávacího obsahu není jen UI — je to i struktura a načasování informací.</p>
    </div>
  </div>`,
    pro_footer: `<div class="footer-inner">
      <span class="footer-copy">© <strong>Ota Škvor</strong>. All rights reserved.</span>
      <div style="display:flex;align-items:center;gap:1rem;">
        <a href="../index.html" class="back-to-portfolio">Zpět do portfolia</a>
        <div class="lang-dropdown" id="langDropdown">
          <button class="lang-dropdown-trigger" id="langTrigger" aria-haspopup="true" aria-expanded="false">
            <span class="lang-flag" id="langFlag">CZ</span>
            <svg class="lang-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="lang-dropdown-menu" id="langMenu" role="menu">
            <button class="lang-option" data-lang="en" role="menuitem">
              <span>EN</span><span class="lang-option-label">English</span>
            </button>
            <button class="lang-option active" data-lang="cs" role="menuitem">
              <span>CZ</span><span class="lang-option-label">Česky</span>
            </button>
          </div>
        </div>
      </div>
    </div>`,
    sey_nav: `<div class="case-nav-inner">
      <a href="../index.html" class="back-link">Zpět</a>
      <ul class="case-toc">
        <li><a href="#overview">Přehled</a></li>
        <li><a href="#before-after">Před a po</a></li>
        <li><a href="#design-system">Design system</a></li>
        <li><a href="#components">Komponenty</a></li>
        <li><a href="#tokens">Tokeny</a></li>
        <li><a href="#code">Code &amp; Handoff</a></li>
        <li><a href="#documentation">Dokumentace</a></li>
        <li><a href="#collaboration">Spolupráce</a></li>
        <li><a href="#impact">Dopad</a></li>
      </ul>
    </div>`,
    sey_hero: `<div class="case-tags">
      <span class="case-tag">Design System</span>
      <span class="case-tag">Komponentní knihovna</span>
      <span class="case-tag">Design tokeny</span>
      <span class="case-tag">Dokumentace</span>
      <span class="case-tag">Spolupráce s vývojem</span>
    </div>
    <h1>Seyfor <span style="font-style:italic;color:var(--fg-muted);">2022 — dosud</span></h1>
    <p class="case-hero-sub">Seyfor je jedna z největších českých softwarových společností — ERP, CRM, HR systémy, cloudová řešení. Nastoupil jsem jako Senior UI/UX Designer se zaměřením na design system, který spojuje 10+ produktových týmů a stovky vývojářů.</p>

    <div class="case-stats">
      <div class="stat"><div class="stat-num">10+</div><div class="stat-label">produktových týmů</div></div>
      <div class="stat"><div class="stat-num">200+</div><div class="stat-label">komponent v knihovně</div></div>
      <div class="stat"><div class="stat-num">↓40%</div><div class="stat-label">méně nekonzistencí</div></div>
      <div class="stat"><div class="stat-num">↑</div><div class="stat-label">rychlejší onboarding</div></div>
    </div>

    <div class="seyfor-wide-ph" style="aspect-ratio:16/6;margin-top:2rem;">
      [ Screenshot — přehled design systému / Figma komponentní knihovny ]
    </div>`,
    sey_before_after: `<h2>Před a po</h2>
    <p>Vizuální jazyk Seyforu před pracemi na systému byl fragmentovaný — každý tým si upravoval komponenty po svém. Níže je porovnání vybraných UI prvků před a po sjednocení.</p>

    <div class="comparison-slider" id="compSlider1" style="aspect-ratio:16/7;">
      <div class="cs-before" style="width:100%;height:100%;background:var(--bg-card);">
        <div style="height:100%;display:flex;flex-direction:column;overflow:hidden;">
          <div class="ds-evo-label" style="padding:0.55rem 0.85rem;border-bottom:1px solid var(--border-light);background:var(--bg-alt);font-size:0.67rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--fg-light);">❶ Před — fragmentovaný stav</div>
          <div class="ds-evo-body" style="padding:1.4rem;flex:1;display:flex;flex-direction:column;gap:0.45rem;">
            <div class="fake-heading old">Správa objednávek</div>
            <div class="fake-sub old" style="margin-bottom:0.7rem;">Arial 13px · různé v každém produktu</div>
            <div class="fake-input-row">
              <div class="fake-input old">Vyhledat…</div>
              <span class="fake-btn old">Hledat</span>
            </div>
            <div style="margin-top:0.7rem;">
              <span class="fake-tag old">Aktivní</span>
              <span class="fake-tag old">Vyřízeno</span>
              <span class="fake-tag old">Storno</span>
            </div>
            <div style="margin-top:0.8rem;">
              <span class="fake-btn old">Potvrdit</span>
              <span class="fake-btn old-2">Zrušit</span>
            </div>
          </div>
          <div class="ds-evo-note" style="font-size:0.73rem;color:var(--fg-light);padding:0.35rem 0.85rem 0.55rem;background:var(--bg-alt);border-top:1px solid var(--border-light);">Hardcoded hodnoty · 3 různé spacing systémy · 8 variant tlačítek</div>
        </div>
      </div>
      <div class="cs-after" style="height:100%;background:var(--bg-card);">
        <div style="height:100%;display:flex;flex-direction:column;overflow:hidden;width:200%;">
          <div class="ds-evo-label" style="padding:0.55rem 0.85rem;border-bottom:1px solid var(--border-light);background:var(--bg-alt);font-size:0.67rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--fg-light);">❷ Po — sjednocený design system</div>
          <div class="ds-evo-body" style="padding:1.4rem;flex:1;display:flex;flex-direction:column;gap:0.45rem;">
            <div class="fake-heading new">Správa objednávek</div>
            <div class="fake-sub" style="margin-bottom:0.7rem;">DM Sans 13px · typography.heading.md</div>
            <div class="fake-input-row">
              <div class="fake-input new">Vyhledat…</div>
              <span class="fake-btn new">Hledat</span>
            </div>
            <div style="margin-top:0.7rem;">
              <span class="fake-tag new">Aktivní</span>
              <span class="fake-tag new">Vyřízeno</span>
              <span class="fake-tag new">Storno</span>
            </div>
            <div style="margin-top:0.8rem;">
              <span class="fake-btn new">Potvrdit</span>
              <span class="fake-btn new-2">Zrušit</span>
            </div>
          </div>
          <div class="ds-evo-note" style="font-size:0.73rem;color:var(--fg-light);padding:0.35rem 0.85rem 0.55rem;background:var(--bg-alt);border-top:1px solid var(--border-light);">Tokeny · spacing.md · button.primary / button.secondary</div>
        </div>
      </div>
      <div class="cs-divider"></div>
      <div class="cs-handle">⇔</div>
      <div class="cs-label-before">Před</div>
      <div class="cs-label-after">Po</div>
    </div>

    <p style="font-size:0.82rem;color:var(--fg-light);margin-top:0.6rem;">↑ Porovnání stejné obrazovky před a po adopci design systému. Vizuálně jemnější, ale funkčně klíčový posun — stejná data, jiná konzistence a udržitelnost.</p>

    <div class="seyfor-3col" style="margin-top:2rem;">
      <div class="seyfor-ph">[ Screenshot — stará verze komponenty Button ve Figmě ]</div>
      <div class="seyfor-ph">[ Screenshot — nová verze Button, všechny varianty & stavy ]</div>
      <div class="seyfor-ph">[ Screenshot — Figma variables / token nastavení ]</div>
    </div>`,
    sey_design_system: `<h2>Design System</h2>
    <p>Cílem bylo vytvořit jeden zdroj pravdy pro vizuální jazyk celé společnosti. Předtím každý tým pracoval s vlastními komponentami, vlastními barvami a vlastními konvencemi. Výsledkem byly produkty, které vypadaly, jako by pocházely od různých firem.</p>
    <p>Začal jsem auditem — prošel jsem desítky obrazovek z různých produktů a zmapoval všechny vizuální a UX vzory. Zjistil jsem, kde jsou rozdíly opodstatněné a kde jsou jen historickým náhodou.</p>

    <div class="cs-grid">
      <div class="cs-block">
        <h4>Výzva</h4>
        <p>10+ týmů, každý s vlastní Figma knihovnou. Duplicitní práce, nekonzistentní UI, obtížná údržba. Žádný sdílený jazyk mezi designem a vývojem.</p>
      </div>
      <div class="cs-block">
        <h4>Přístup</h4>
        <p>Audit stávajícího stavu → definice principů → stavba foundation vrstvy (barvy, typografie, spacing) → komponenty → dokumentace → procesy adopce.</p>
      </div>
    </div>

    <div class="seyfor-wide-ph" style="aspect-ratio:16/5;">
      [ Screenshot — audit mapa: přehled UI vzorů ze všech produktů před sjednocením ]
    </div>`,
    sey_components: `<h2>Komponentní knihovna</h2>
    <p>Knihovna je postavena na atomickém principu — od základních primitiv po komplexní layoutové vzory. Každá komponenta má definované varianty, stavy, velikosti a chování při responsivním zobrazení.</p>

    <h3>Struktura knihovny</h3>
    <ul>
      <li><strong>Foundation</strong> — barvy, typografie, spacing, ikonografie, animace</li>
      <li><strong>Primitives</strong> — Button, Input, Checkbox, Radio, Badge, Tag, Avatar</li>
      <li><strong>Compositions</strong> — Form groups, Card, Modal, Dropdown, Toast, Tooltip</li>
      <li><strong>Patterns</strong> — Data table, Filters, Pagination, Navigation, Sidebar</li>
      <li><strong>Templates</strong> — Layouty pro nejčastější typy obrazovek</li>
    </ul>

    <div class="seyfor-3col">
      <div class="seyfor-ph">[ Screenshot — Button komponenta, všechny varianty & stavy ve Figmě ]</div>
      <div class="seyfor-ph">[ Screenshot — Form group s Input, Label, Error state ]</div>
      <div class="seyfor-ph">[ Screenshot — Data table pattern s filtry a paginací ]</div>
    </div>

    <h3>Varianty a stavy</h3>
    <p>Každá komponenta pokrývá všechny stavy interakce: default, hover, focus, active, disabled, loading, error. Pracoval jsem s Figma variables, aby šly varianty přepínat jedním kliknutím — nejen v prototypech, ale i při předávání vývojářům.</p>

    <div class="seyfor-wide-ph">
      [ Video / GIF — přepínání stavů komponenty přes Figma variables v reálném čase ]
    </div>

    <div class="impact-note">
      <strong>Výsledek:</strong> Nový designér dokáže sestavit plnou obrazovku produktu z existujících komponent za zlomek času oproti dřívějšku. Žádné vynalézání kola.
    </div>

    <h3>Animace a motion</h3>
    <p>Definoval jsem společné easing křivky a duration hodnoty. Všechny přechody v knihovně jsou konzistentní — nic "vyskakuje", vše plyne. Tokeny pro motion jsou dokumentované a přímo napojené na CSS custom properties.</p>`,
    sey_tokens: `<h2>Design Tokeny</h2>
    <p>Tokeny jsou páteří celého systému. Místo hardcoded hex hodnot nebo px čísel pracují všichni s pojmenovanými hodnotami — <code style="font-size:0.82rem;background:var(--bg-alt);padding:0.1rem 0.35rem;border-radius:4px;">color.surface.primary</code>, <code style="font-size:0.82rem;background:var(--bg-alt);padding:0.1rem 0.35rem;border-radius:4px;">spacing.md</code>, <code style="font-size:0.82rem;background:var(--bg-alt);padding:0.1rem 0.35rem;border-radius:4px;">radius.card</code>.</p>

    <div class="token-diagram">
      <div class="token-tier">
        <span class="token-tier-label">Global</span>
        <span class="token-arrow">→</span>
        <div class="token-chips">
          <span class="token-chip global">#0f0f0f</span>
          <span class="token-chip global">#f5f4f0</span>
          <span class="token-chip global">16px</span>
          <span class="token-chip global">24px</span>
          <span class="token-chip global">8px</span>
          <span class="token-chip global">300ms</span>
        </div>
      </div>
      <div class="token-tier">
        <span class="token-tier-label">Semantic</span>
        <span class="token-arrow">→</span>
        <div class="token-chips">
          <span class="token-chip semantic">color.text.default</span>
          <span class="token-chip semantic">color.surface.primary</span>
          <span class="token-chip semantic">spacing.md</span>
          <span class="token-chip semantic">radius.card</span>
          <span class="token-chip semantic">motion.duration.medium</span>
        </div>
      </div>
      <div class="token-tier">
        <span class="token-tier-label">Component</span>
        <span class="token-arrow">→</span>
        <div class="token-chips">
          <span class="token-chip component">button.bg.primary</span>
          <span class="token-chip component">button.radius</span>
          <span class="token-chip component">input.border.default</span>
          <span class="token-chip component">card.padding</span>
        </div>
      </div>
    </div>

    <div class="cs-grid">
      <div class="cs-block">
        <h4>Architektura tokenů</h4>
        <ul>
          <li>Global tokens — raw hodnoty (hex, px, ms)</li>
          <li>Semantic tokens — účelové názvy (color.text.muted)</li>
          <li>Component tokens — specifické hodnoty na úrovni komponenty</li>
        </ul>
      </div>
      <div class="cs-block">
        <h4>Výstupní formáty</h4>
        <ul>
          <li>CSS custom properties pro webové produkty</li>
          <li>JSON pro automatizované pipeline</li>
          <li>Figma Variables pro designéry</li>
          <li>Podpora dark/light theme přes token aliasy</li>
        </ul>
      </div>
    </div>

    <div class="seyfor-3col">
      <div class="seyfor-ph">[ Screenshot — Figma Variables panel, barevné tokeny ]</div>
      <div class="seyfor-ph">[ Screenshot — JSON token soubor (tokens.json) ]</div>
      <div class="seyfor-ph">[ Screenshot — CSS custom properties v DevTools ]</div>
    </div>

    <div class="impact-note">
      <strong>Klíčový posun:</strong> Přechod na dark mode nebo rebrand přestaly být projekty na měsíce. Stačí upravit sémantické tokeny na jednom místě.
    </div>`,
    sey_code: `<h2>Code &amp; Handoff</h2>
    <p>Jedním z mých cílů bylo minimalizovat ztrátu informace při předávání z Figmy do kódu. Tokeny jsou v obou prostředích pojmenovány identicky — designér i vývojář mluví stejným jazykem.</p>

    <h3>Token výstup — CSS</h3>
    <div class="code-block">
      <span class="code-lang">CSS</span>
      <pre><span class="token-comment">/* Generated from design tokens — do not edit manually */</span>
<span class="token-punct">:root {</span>
  <span class="token-comment">/* Color — surface */</span>
  <span class="token-prop">--color-surface-primary</span><span class="token-punct">:</span> <span class="token-value">#f5f4f0</span><span class="token-punct">;</span>
  <span class="token-prop">--color-surface-card</span><span class="token-punct">:</span>    <span class="token-value">#ffffff</span><span class="token-punct">;</span>
  <span class="token-prop">--color-surface-alt</span><span class="token-punct">:</span>    <span class="token-value">#eeecea</span><span class="token-punct">;</span>

  <span class="token-comment">/* Color — text */</span>
  <span class="token-prop">--color-text-default</span><span class="token-punct">:</span>   <span class="token-value">#0f0f0f</span><span class="token-punct">;</span>
  <span class="token-prop">--color-text-muted</span><span class="token-punct">:</span>     <span class="token-value">#6b6b6b</span><span class="token-punct">;</span>
  <span class="token-prop">--color-text-subtle</span><span class="token-punct">:</span>    <span class="token-value">#a0a0a0</span><span class="token-punct">;</span>

  <span class="token-comment">/* Spacing */</span>
  <span class="token-prop">--spacing-xs</span><span class="token-punct">:</span>           <span class="token-value">4px</span><span class="token-punct">;</span>
  <span class="token-prop">--spacing-sm</span><span class="token-punct">:</span>           <span class="token-value">8px</span><span class="token-punct">;</span>
  <span class="token-prop">--spacing-md</span><span class="token-punct">:</span>           <span class="token-value">16px</span><span class="token-punct">;</span>
  <span class="token-prop">--spacing-lg</span><span class="token-punct">:</span>           <span class="token-value">24px</span><span class="token-punct">;</span>
  <span class="token-prop">--spacing-xl</span><span class="token-punct">:</span>           <span class="token-value">40px</span><span class="token-punct">;</span>

  <span class="token-comment">/* Radius */</span>
  <span class="token-prop">--radius-sm</span><span class="token-punct">:</span>            <span class="token-value">6px</span><span class="token-punct">;</span>
  <span class="token-prop">--radius-md</span><span class="token-punct">:</span>            <span class="token-value">10px</span><span class="token-punct">;</span>
  <span class="token-prop">--radius-card</span><span class="token-punct">:</span>          <span class="token-value">12px</span><span class="token-punct">;</span>

  <span class="token-comment">/* Motion */</span>
  <span class="token-prop">--motion-duration-fast</span><span class="token-punct">:</span>  <span class="token-value">150ms</span><span class="token-punct">;</span>
  <span class="token-prop">--motion-duration-med</span><span class="token-punct">:</span>   <span class="token-value">280ms</span><span class="token-punct">;</span>
  <span class="token-prop">--motion-ease-spring</span><span class="token-punct">:</span>   <span class="token-value">cubic-bezier(0.34, 1.56, 0.64, 1)</span><span class="token-punct">;</span>
<span class="token-punct">}</span></pre>
    </div>

    <h3>Token výstup — JSON (Style Dictionary)</h3>
    <div class="code-block">
      <span class="code-lang">JSON</span>
      <pre><span class="token-punct">{</span>
  <span class="token-prop">"color"</span><span class="token-punct">: {</span>
    <span class="token-prop">"surface"</span><span class="token-punct">: {</span>
      <span class="token-prop">"primary"</span><span class="token-punct">: {</span> <span class="token-prop">"value"</span><span class="token-punct">:</span> <span class="token-value">"#f5f4f0"</span><span class="token-punct">,</span> <span class="token-prop">"type"</span><span class="token-punct">:</span> <span class="token-value">"color"</span> <span class="token-punct">},</span>
      <span class="token-prop">"card"</span><span class="token-punct">:    {</span> <span class="token-prop">"value"</span><span class="token-punct">:</span> <span class="token-value">"#ffffff"</span><span class="token-punct">,</span>  <span class="token-prop">"type"</span><span class="token-punct">:</span> <span class="token-value">"color"</span> <span class="token-punct">}</span>
    <span class="token-punct">}</span>
  <span class="token-punct">},</span>
  <span class="token-prop">"spacing"</span><span class="token-punct">: {</span>
    <span class="token-prop">"md"</span><span class="token-punct">: {</span> <span class="token-prop">"value"</span><span class="token-punct">:</span> <span class="token-value">"16"</span><span class="token-punct">,</span> <span class="token-prop">"type"</span><span class="token-punct">:</span> <span class="token-value">"spacing"</span> <span class="token-punct">}</span>
  <span class="token-punct">}</span>
<span class="token-punct">}</span></pre>
    </div>

    <h3>Komponenta ve Storybooku</h3>
    <p>Každá Figma komponenta má svůj ekvivalent v Storybooku. Designéři i vývojáři reviewují implementaci na stejném místě — žádné “to nevypadá jako v Figmě”.</p>
    <div class="seyfor-wide-ph" style="aspect-ratio:16/5;">
      [ Screenshot — Storybook: Button komponenta s controls panelem, živé varianty ]
    </div>

    <div class="impact-note">
      <strong>Pipeline:</strong> Figma Variables → export JSON → Style Dictionary → CSS custom properties + Android/iOS tokeny. Jeden zdroj pravdy, tři platformy.
    </div>`,
    sey_documentation: `<h2>Dokumentace</h2>
    <p>Dobré komponenty bez dokumentace nestačí. Napsal jsem dokumentaci v Zeroheight, která pokrývá nejen to, <em>co</em> komponenta dělá, ale <em>kdy</em> ji použít, <em>kdy ne</em>, a jak se chová v různých kontextech.</p>

    <div class="seyfor-3col">
      <div class="seyfor-ph">[ Screenshot — Zeroheight stránka pro Button komponentu ]</div>
      <div class="seyfor-ph">[ Screenshot — Usage guidelines: DO / DON'T příklady ]</div>
      <div class="seyfor-ph">[ Screenshot — Accessibility tab: ARIA, keyboard nav ]</div>
    </div>

    <h3>Co dokumentace obsahuje</h3>
    <ul>
      <li>Vizuální přehled všech variant a stavů</li>
      <li>Usage guidelines — kdy použít, kdy sáhnout po jiné komponentě</li>
      <li>Accessibility — ARIA atributy, klávesnicová navigace, contrast ratio</li>
      <li>Code snippets — kopíruj a použij, bez dohledávání</li>
      <li>Changelog — co se změnilo a proč</li>
      <li>Design decisions — zdůvodnění klíčových rozhodnutí pro budoucí reference</li>
    </ul>

    <h3>Udržitelnost dokumentace</h3>
    <p>Dokumentace je "living document" — aktualizuje se spolu s komponentami. Zavedl jsem review proces, aby žádná komponenta nešla do produkce bez aktualizované dokumentace.</p>`,
    sey_collaboration: `<h2>Spolupráce s vývojáři</h2>
    <p>Design system funguje jen tehdy, když ho vývojáři chtějí používat. Trávím hodně času v kódu — ne psaním produkčního kódu, ale pochopením implementačních omezení a přizpůsobením designu realitě.</p>

    <div class="seyfor-3col">
      <div class="seyfor-ph">[ Screenshot — GitHub issue: návrh nové komponenty, diskuze ]</div>
      <div class="seyfor-ph">[ Screenshot — Figma redline / dev mode předávání ]</div>
      <div class="seyfor-ph">[ Screenshot — Storybook review: design vs. implementace ]</div>
    </div>

    <h3>Jak to funguje v praxi</h3>
    <ul>
      <li>Pravidelné design system syncs s frontend leady z jednotlivých produktů</li>
      <li>GitHub issues pro sledování komponent a jejich stavu</li>
      <li>Storybook jako sdílené prostředí pro review — designéři i vývojáři vidí totéž</li>
      <li>Semantic versioning komponent — žádné breaking changes bez avíza</li>
      <li>Office hours — vývojáři se mohou přijít zeptat přímo</li>
    </ul>

    <div class="cs-grid">
      <div class="cs-block">
        <h4>Design → Dev handoff</h4>
        <p>Figma soubory jsou strukturované tak, aby z nich vývojáři dokázali číst bez zprostředkovatele. Spacing, typography, barvy — všechno se odkazuje na tokeny s odpovídajícími CSS názvy.</p>
      </div>
      <div class="cs-block">
        <h4>Feedback loop</h4>
        <p>Každé čtvrtletí dělám anonymní průzkum spokojenosti s design systémem napříč týmy. Výsledky přímo ovlivňují roadmapu — co opravit, co rozšířit, co přidat.</p>
      </div>
    </div>`,
    sey_impact: `<h2>Dopad</h2>
    <p>Design system není projekt s koncem — je to infrastruktura. Výsledky se projevují postupně, ale jsou měřitelné.</p>

    <div class="outcome-grid">
      <div class="outcome-card">
        <div class="outcome-num">200+</div>
        <div class="outcome-label">Komponent v knihovně</div>
        <div class="outcome-desc">Pokrývají 90 %+ UI potřeb produktových týmů.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">↓40%</div>
        <div class="outcome-label">Méně nekonzistencí</div>
        <div class="outcome-desc">Měřeno interním auditem UI napříč produkty.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">10+</div>
        <div class="outcome-label">Týmů adoptovalo systém</div>
        <div class="outcome-desc">Včetně nejstarších legacy produktů.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">↑</div>
        <div class="outcome-label">Rychlejší onboarding</div>
        <div class="outcome-desc">Noví designéři jsou produktivní 2× rychleji.</div>
      </div>
    </div>

    <div class="seyfor-wide-ph" style="margin-top:2rem;">
      [ Screenshot — roadmap nebo adoption dashboard: přehled adopce systému napříč produkty ]
    </div>`,
    sey_footer: `<div class="footer-inner">
      <span class="footer-copy">© <strong>Ota Škvor</strong>. All rights reserved.</span>
      <a href="../index.html" class="back-to-portfolio">Zpět do portfolia</a>
    </div>`,
    fintech_page_title: 'Fintech Mobile App — Ota Škvor',
    fintech_nav: `<div class="case-nav-inner">
      <a href="../freelance.html" class="back-link">Freelance &amp; Studies</a>
      <ul class="case-toc">
        <li><a href="#overview">Přehled</a></li>
        <li><a href="#problem">Problém</a></li>
        <li><a href="#research">Research</a></li>
        <li><a href="#solution">Řešení</a></li>
        <li><a href="#outcome">Výsledek</a></li>
      </ul>
    </div>`,
    fintech_hero: `<div class="case-tags">
      <span class="case-tag">01 / Freelance</span>
      <span class="case-tag">Fintech</span>
      <span class="case-tag">iOS</span>
      <span class="case-tag">UI/UX</span>
    </div>
    <h1>Fintech mobile app — onboarding redesign</h1>
    <p class="case-hero-sub">Česká fintech aplikace ztrácela 60 % uživatelů během registrace. Přišel jsem jako designér s jednoduchým zadáním: zjistit proč a navrhnout řešení.</p>

    <div class="case-stats">
      <div class="stat"><div class="stat-num">↓28%</div><div class="stat-label">drop-off v onboarding</div></div>
      <div class="stat"><div class="stat-num">14→8</div><div class="stat-label">kroků po redesignu</div></div>
      <div class="stat"><div class="stat-num">6</div><div class="stat-label">uživatelských rozhovorů</div></div>
      <div class="stat"><div class="stat-num">iOS</div><div class="stat-label">platforma</div></div>
    </div>`,
    fintech_problem: `<h2>Problém</h2>
    <p>Onboarding měl 14 kroků, přičemž KYC proces byl zasazen do samého středu — uživatelé narazili na složité vyplňování dokladů v momentě, kdy ještě neviděli žádnou hodnotu aplikace. Klasická chyba: <em>ask first, deliver later</em>.</p>
    <p>Data ze session recordings ukázala jasný pattern: 60 % odchodů se dělo na 3.–5. obrazovce — přesně tam, kde začal KYC. Uživatelé neodcházeli, protože to bylo složité. Odcházeli, protože nevěděli, proč by to dělali.</p>

    <div class="section-img">
      <div class="section-img-ph" style="aspect-ratio:16/5;">
        <span class="section-img-ph-label">Chart — funnel analysis: drop-off po krocích</span>
      </div>
      <div class="section-img-caption">Analýza drop-off funnel z Hotjar · 60 % uživatelů odešlo na krocích 3–5</div>
    </div>`,
    fintech_research: `<h2>Research</h2>
    <p>6 uživatelských rozhovorů + analýza session recordings (Hotjar). Kombinace kvalitativního pochopení <em>proč</em> a kvantitativního <em>kde</em>.</p>

    <div class="cs-grid">
      <div class="cs-block">
        <h4>Klíčové zjištění 1</h4>
        <p>Uživatelé nevěděli, co je čeká. Žádná progress indikace, žádný přehled kroků — jen nekonečný formulář.</p>
      </div>
      <div class="cs-block">
        <h4>Klíčové zjištění 2</h4>
        <p>KYC působil jako bariéra, ne jako součást onboarding hodnoty. Chyběl kontext "proč potřebujeme váš doklad".</p>
      </div>
      <div class="cs-block">
        <h4>Klíčové zjištění 3</h4>
        <p>Uživatelé si nedokázali představit, co jim aplikace nabídne. Neexistoval žádný preview hodnoty před registrací.</p>
      </div>
      <div class="cs-block">
        <h4>Klíčové zjištění 4</h4>
        <p>Formuláře neměly smart defaults ani autofill. Každé pole vyžadovalo plné ruční zadání — zbytečná kognitivní zátěž.</p>
      </div>
    </div>

    <div class="section-img">
      <div class="section-img-ph" style="aspect-ratio:16/5;">
        <span class="section-img-ph-label">Affinity diagram z uživatelských rozhovorů</span>
      </div>
      <div class="section-img-caption">Syntéza 6 rozhovorů do témat · Hotjar session replay + interview insights</div>
    </div>`,
    fintech_solution: `<h2>Řešení</h2>
    <p>Přepracoval jsem celý onboarding flow na principu hodnota napřed — uživatel vidí, co aplikace umí, ještě než musí cokoli vyplňovat.</p>

    <ul>
      <li>Hodnota napřed — dashboard se simulovanými daty před registrací</li>
      <li>Progressive disclosure KYC — rozložení na 3 samostatné kroky s jasným kontextem proč</li>
      <li>Smart defaults a autofill redukovaly počet nutných interakcí o třetinu</li>
      <li>Micro-animations potvrzující každý dokončený krok — okamžitá zpětná vazba</li>
      <li>Progress bar "Krok 2 ze 4" — konec byl vždy na dohled</li>
    </ul>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;margin:1.4rem 0;">
      <div style="aspect-ratio:9/16;background:var(--bg-alt);border:1px solid var(--border-light);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:0.68rem;color:var(--fg-light);text-align:center;padding:0.5rem;">Screen 1<br>Welcome + value prop</div>
      <div style="aspect-ratio:9/16;background:var(--bg-alt);border:1px solid var(--border-light);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:0.68rem;color:var(--fg-light);text-align:center;padding:0.5rem;">Screen 2<br>Dashboard preview</div>
      <div style="aspect-ratio:9/16;background:var(--bg-alt);border:1px solid var(--border-light);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:0.68rem;color:var(--fg-light);text-align:center;padding:0.5rem;">Screen 3<br>KYC s kontextem</div>
    </div>

    <div class="impact-note">
      <strong>Designové rozhodnutí:</strong> Přesunout KYC za první "wow moment" — uživatel nejdřív vidí dashboard se svými (simulovanými) daty, teprve pak žádáme o doklady. Motivace je jasná.
    </div>`,
    fintech_outcome: `<h2>Výsledek</h2>
    <p>Redesign byl spuštěn po 3 měsících iterací. Měření proběhlo po prvním měsíci od launche.</p>

    <div class="outcome-grid">
      <div class="outcome-card">
        <div class="outcome-num">↓28%</div>
        <div class="outcome-label">Drop-off</div>
        <div class="outcome-desc">Po prvním měsíci od launche ve srovnání s původním flow.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">14→8</div>
        <div class="outcome-label">Kroků onboarding</div>
        <div class="outcome-desc">Bez ztráty compliance požadavků KYC.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">↓33%</div>
        <div class="outcome-label">Nutných interakcí</div>
        <div class="outcome-desc">Smart defaults + autofill odstranily redundantní vstupy.</div>
      </div>
      <div class="outcome-card">
        <div class="outcome-num">+NPS</div>
        <div class="outcome-label">User feedback</div>
        <div class="outcome-desc">Pozitivní posun v uživatelských hodnoceních registračního procesu.</div>
      </div>
    </div>

    <div class="impact-note" style="margin-top:1.4rem;">
      <strong>Reflexe:</strong> Největší ponaučení — uživatelé neodcházejí proto, že je proces složitý. Odcházejí, protože nevidí důvod zůstat. Hodnota musí předcházet požadavkům.
    </div>`,
    fintech_pager: `<a href="../freelance.html" class="tl-btn">← Zpět na Freelance</a>
        <a href="medical-website.html" class="tl-btn">Redesign webu zdravotnické kliniky →</a>`,
    fintech_footer: `<div class="footer-inner">
      <span class="footer-copy">© <strong>Ota Škvor</strong>. All rights reserved.</span>
      <div style="display:flex;align-items:center;gap:1rem;">
        <a href="../../index.html" class="back-to-portfolio">Zpět do portfolia</a>
        <div class="lang-dropdown" id="langDropdown">
          <button class="lang-dropdown-trigger" id="langTrigger" aria-haspopup="true" aria-expanded="false">
            <span class="lang-flag" id="langFlag">CZ</span>
            <svg class="lang-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="lang-dropdown-menu" id="langMenu" role="menu">
            <button class="lang-option" data-lang="en" role="menuitem">
              <span>EN</span><span class="lang-option-label">English</span>
            </button>
            <button class="lang-option active" data-lang="cs" role="menuitem">
              <span>CZ</span><span class="lang-option-label">Česky</span>
            </button>
          </div>
        </div>
      </div>
    </div>`,
    skill_cloude: 'I use Claude and other LLMs daily throughout my design process and decision-making.',
    skill_wordpress: 'I’ve built several websites in WordPress and can handle more advanced theme and functionality customizations.',
    skill_trello: 'I’ve used Trello extensively for task management, planning, and bug tracking.',
    skill_midjourney: 'I mainly use Midjourney and other generative AI tools for visual brainstorming and idea generation.',
    skill_figjam: 'I use FigJam for brainstorming and rapid team collaboration.',
    skill_photoshop: 'I use Photoshop when I need more advanced photo and visual editing.',
  },
  cs: {
    tooltip_vema: 'Produkt, na kterém pracuji',
    hero_design_systems: 'Architektura design systému, knihovny a komponentní myšlení.',
    hero_uiux_design: 'Návrh uživatelského rozhraní a zkušenosti pro digitální produkty.',
    hero_figma: 'Figma expert pro prototypy, systémy a předání.',
    hero_interaction_design: 'Návrh pohybu a chování rozhraní.',
    hero_design_tokens: 'Systémy design tokenů spojující design a kód.',
    hero_enterprise_saas: 'Design enterprise SaaS produktů pro složité workflow.',
    hero_dev_handoff: 'Plynulé předání mezi designem a vývojem.',
    skill_design_systems: 'Buduji konzistentní a znovupoužitelné UI design systémy.',
    skill_ui_design: 'Navrhuji detailně propracované a moderní uživatelské rozhraní.',
    skill_ux_research: 'Výzkum uživatelů pro ověřené designové rozhodnutí.',
    skill_interaction_design: 'Návrh intuitivních interakčních vzorů.',
    skill_prototyping: 'Prototypuji statické návrhy do interaktivních modelů, které simulují chování budoucí komponenty či aplikace.',
    skill_user_flows: 'User flows používám jak pro zmapování komplexních rozhraní, tak pro zajištění logického průchodu celým rozhraním.',
    skill_information_architecture: 'Strukturuji obsah tak, aby se v něm uživatel snadno orientoval.',
    skill_usability_testing: 'Návrhy v případě potřeby testuji s reálnými uživateli a hledám místa ke zlepšení.',
    skill_ab_testing: 'Experimenty, které ukazují, co funguje nejlépe.',
    skill_figma: 'Ve Figmě tvořím vše od prvních návrhů po komplexní komponenty a prototypy.',
    skill_storybook: 'Dokumentace komponent pro vývojáře ve Storybooku.',
    skill_zeroheight: 'Dokumentace design systému a návody v Zeroheight.',
    skill_principle: 'Pohybové prototypy a animace v Principle.',
    skill_framer: 'Interaktivní prototypy vytvořené ve Frameru.',
    skill_adobe_cc: 'Grafika, pohyb a retuše v sadě Adobe Creative Cloud.',
    skill_miro: 'Miro využívám pro mapování procesů a tvorbu low-fidelity prototypů.',
    skill_notion: 'Dokumentace a pracovní toky organizované v Notion.',
    skill_design_tokens: 'Pomocí design tokenů udržuji témata konzistentní a jejich vývoj je mnohonásobně rychlejší.',
    skill_component_libraries: 'Tvořím knihovny znovupoužitelných komponent pro design i vývoj.',
    skill_component_apis: 'Návrh API komponent s jasnými vlastnostmi.',
    skill_html_css: 'Díky znalosti HTML, CSS a technickému přesahu navrhuji vždy s ohledem na reálnou implementaci.',
    skill_accessibility: 'Při návrhu zohledňuji kontrast, čitelnost a další principy přístupnosti.',
    skill_wcag_accessibility: 'Přístupné rozhraní podle WCAG principů.',
    skill_responsive_design: 'Při návrhu myslím na to, jak se rozhraní chová napříč různými zařízeními.',
    skill_dev_collaboration: 'Úzce spolupracuji s vývojáři od návrhu až po finální implementaci.',
    skill_git_basics: 'Ovládám základy Gitu pro verzování a spolupráci s vývojáři.',
    skill_enterprise_saas: 'UX a strategie pro enterprise software.',
    skill_b2b_software: 'Design pro B2B workflow a firemní nástroje.',
    skill_data_visualisation: 'Jasná komunikace dat pomocí dashboardů.',
    skill_erp_crm_systems: 'UX pro ERP, CRM a provozní systémy.',
    skill_fintech: 'Fintech zážitek navržený pro důvěru a přehlednost.',
    skill_ecommerce: 'E-commerce cesty optimalizované pro nákup.',
    skill_mobile_ios_android: 'Mobilní UX pro iOS a Android aplikace.',
    skill_ux_design: 'Navrhuji funkční a intuitivní rozhraní podle potřeb uživatelů.',
    skill_wireframing: 'Wireframy používám k rychlému nastřelení struktury a layoutu.',
    skill_visual_design: 'Pracuji s typografií, kompozicí a vizuální hierarchií rozhraní.',
    skill_color_theory: 'Pracuji s barvami, kontrastem a jasnými pravidly pro konzistentní použití napříč produktem.',
    skill_documentation: 'Tvořím dokumentaci, která jasně definuje pravidla pro používání komponent a dalších postupů v design systému.',
    skill_js_python: 'Ovládám základy JavaScriptu a Pythonu pro jednodušší skriptování a automatizaci.',
    skill_seo: 'Rozumím základům SEO a umím je zohlednit při návrhu webových rozhraní.',
    skill_cloude: 'Claude i další LLM používám denně jako součást většiny designových procesů a rozhodování.',
    skill_wordpress: 'Ve WordPressu jsem realizoval řadu webů a zvládám i pokročilejší úpravy šablon a funkcionality.',
    skill_trello: 'Trello jsem dlouhodobě využíval pro správu úkolů, plánování a řešení bugů.',
    skill_midjourney: 'Midjourney a další grafický AI nástroje využívám nejčastěji pro vizuální brainstorming a generování nápadů.',
    skill_figjam: 'FigJam využívám pro brainstorming a rychlou týmovou spolupráci.',
    skill_photoshop: 'Photoshop využívám, když potřebuji jít hlouběji do úprav fotografií a vizuálů.',
    edu_typography: '',
    edu_color_theory: '',
    edu_grid_systems: '',
    edu_visual_identity: '',
    edu_information_design: '',
    edu_digital_design: '',
    edu_user_research: '',
    edu_interaction_design: '',
    edu_design_systems: '',
    edu_accessibility: '',
    edu_design_thinking: '',
    edu_leadership: 'Dovednosti pro vedení designových týmů, usnadnění spolupráce a řízení rozhodnutí.',
  }
};

const urlParams = new URLSearchParams(window.location.search);
const urlLang = urlParams.get('lang');

let currentLang =
  (urlLang === 'cs' || urlLang === 'en')
    ? urlLang
    : (localStorage.getItem('portfolio_lang') || 'en');

function updateTooltips(t) {
  const texts = tooltipTexts[currentLang] || {};
  document.querySelectorAll('.skill-chip[data-tooltip-key], .hero-skill-tag[data-tooltip-key], .edu-subject-link[data-tooltip-key], .tl-btn[data-tooltip-key]').forEach(el => {
    const key = el.dataset.tooltipKey;
    const text = texts[key] || '';
    if (text) {
      el.dataset.tooltip = text;
    } else {
      el.removeAttribute('data-tooltip');
      el.removeAttribute('title');
    }
  });
}

function translatePageElements(lang) {
  const pageTranslations = translations[lang] || {};
  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.dataset.i18nKey;
    if (!key) return;
    const value = pageTranslations[key];
    if (value === undefined) return;
    if (el.dataset.i18nHtml === 'true') {
      el.innerHTML = value;
      // Elements swapped via innerHTML are brand-new nodes that the
      // scroll-reveal IntersectionObserver (set up once on page load)
      // never got a chance to observe, so they'd otherwise stay stuck
      // at opacity:0 forever. Mark them visible immediately instead.
      if (el.classList.contains('reveal')) el.classList.add('visible');
      el.querySelectorAll('.reveal').forEach(r => r.classList.add('visible'));
    } else {
      el.textContent = value;
    }
  });
}

// Tooltip edge detection: flip tooltip alignment when near viewport edges
function initTooltipEdgeDetection() {
  const items = document.querySelectorAll('.skill-chip[data-tooltip], .hero-skill-tag[data-tooltip], .edu-subject-link[data-tooltip], .tl-btn[data-tooltip]');
  const maxW = 260; const pad = 12;
  items.forEach(el => {
    const enter = () => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const half = maxW / 2;
      // if centered tooltip would overflow right
      if (cx + half > window.innerWidth - pad) {
        el.classList.add('tooltip-align-right');
        el.classList.remove('tooltip-align-left');
      } else if (cx - half < pad) {
        el.classList.add('tooltip-align-left');
        el.classList.remove('tooltip-align-right');
      } else {
        el.classList.remove('tooltip-align-left', 'tooltip-align-right');
      }
    };
    el.addEventListener('mouseenter', enter);
    el.addEventListener('focus', enter);
    // touch devices: evaluate on touchstart
    el.addEventListener('touchstart', enter, { passive: true });
    el.addEventListener('mouseleave', () => { el.classList.remove('tooltip-align-left', 'tooltip-align-right'); });
    el.addEventListener('blur', () => { el.classList.remove('tooltip-align-left', 'tooltip-align-right'); });
  });
}

// initialize after DOM is ready and when tooltips update
document.addEventListener('DOMContentLoaded', initTooltipEdgeDetection);
if (typeof updateTooltips === 'function') {
  // re-run after initial tooltip text population
  setTimeout(initTooltipEdgeDetection, 80);
}

function applyLang(lang) {
  const t = translations[lang];
  if (!t) return;

  currentLang = lang;
  localStorage.setItem('portfolio_lang', lang);

  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url);

  document.documentElement.lang = lang;

  // Translate [data-i18n-key] subtrees first. On some pages this markup
  // contains the language dropdown itself (case-study footers), so doing
  // this before touching the dropdown UI below means we always operate
  // on the live, currently-rendered elements rather than ones about to
  // be replaced.
  translatePageElements(lang);

  // Update dropdown trigger label (re-queried fresh — translatePageElements
  // may have just recreated this element)
  const langFlagEl = document.getElementById('langFlag');
  if (langFlagEl) langFlagEl.textContent = lang.toUpperCase();
  if (t.page_title) document.title = t.page_title;

  // Update active option
  document.querySelectorAll('.lang-option').forEach(o => {
    o.classList.toggle('active', o.dataset.lang === lang);
  });

  // Nav items — map by href
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    const href = a.getAttribute('href');
    const map = {
      '#intro': t.nav_me, '#work': t.nav_work, '#experience': t.nav_experience,
      '#education': t.nav_education, '#approach': t.nav_approach,
      '#skills': t.nav_skills, '#about': t.nav_about, '#contact': t.nav_contact
    };
    if (map[href]) a.textContent = map[href];
  });

  // Hero badge
  const badge = document.querySelector('.hero-badge');
  if (badge) badge.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = ' ' + t.hero_badge; });

  const h1 = document.querySelector('.hero h1');
  if (h1) h1.innerHTML = t.hero_h1;

  const sub = document.querySelector('.hero-sub');
  if (sub) sub.textContent = t.hero_sub;

  const skTitle = document.querySelector('.hero-skills-title');
  if (skTitle) skTitle.textContent = t.skills_title;

  const skMore = document.querySelector('.hero-skills-more');
  if (skMore) skMore.innerHTML = t.skills_all + ' <span>↓</span>';

  const curLabel = document.querySelector('.hero-employer-label');
  if (curLabel) curLabel.textContent = t.currently_at;

  // Work section label
  const workLabel = document.querySelector('#work .section-label');
  if (workLabel && t.section_work) {
    workLabel.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = t.section_work; });
  }

  // Experience section label
  const expLabel = document.querySelector('#experience .section-label');
  if (expLabel && t.section_experience) {
    expLabel.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = t.section_experience; });
  }

  // Education section label
  const eduLabel = document.querySelector('#education .section-label');
  if (eduLabel && t.section_education) {
    eduLabel.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = t.section_education; });
  }

  // Approach section label
  const apLabel = document.querySelector('#approach .section-label');
  if (apLabel && t.section_approach) {
    apLabel.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = t.section_approach; });
  }

  // Skills section label
  const skLabel = document.querySelector('#skills .section-label');
  if (skLabel && t.section_skills) {
    skLabel.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = t.section_skills; });
  }

  // About section label
  const abLabel = document.querySelector('#about .section-label');
  if (abLabel && t.section_about) {
    abLabel.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = t.section_about; });
  }

  // Seyfor timeline item
  const seyforItem = document.querySelector('.t-item.current');
  if (seyforItem) {
    const ep = seyforItem.querySelector('.t-epoch'); if (ep) ep.textContent = t.seyfor_epoch;
    const role = seyforItem.querySelector('.t-role'); if (role) role.textContent = t.seyfor_role;
    const desc = seyforItem.querySelector('.t-desc'); if (desc) desc.textContent = t.seyfor_desc;
    const cardTag = seyforItem.querySelector('.t-card-tag'); if (cardTag) cardTag.textContent = t.seyfor_card_tag;
    const cardTitle = seyforItem.querySelector('.t-card-title'); if (cardTitle) cardTitle.textContent = t.seyfor_card_title;
    const cardDesc = seyforItem.querySelector('.t-card-desc'); if (cardDesc) cardDesc.textContent = t.seyfor_card_desc;
    seyforItem.querySelectorAll('.tl-btn.primary').forEach(b => { if (b.href && b.href.includes('seyfor')) b.textContent = t.seyfor_cta; });
  }

  // Freelance & Studies timeline item
  const tItems = document.querySelectorAll('.t-item:not(.current)');
  if (tItems[0]) {
    const ep = tItems[0].querySelector('.t-epoch'); if (ep) ep.textContent = t.fl_epoch;
    const role = tItems[0].querySelector('.t-role'); if (role) role.textContent = t.fl_role;
    const desc = tItems[0].querySelector('.t-desc'); if (desc) desc.textContent = t.fl_desc;
    tItems[0].querySelectorAll('.tl-btn.primary').forEach(b => b.textContent = t.fl_cta);
  }
  if (tItems[1]) {
    const ep = tItems[1].querySelector('.t-epoch'); if (ep) ep.textContent = t.proconom_epoch;
    const role = tItems[1].querySelector('.t-role'); if (role) role.textContent = t.proconom_role;
    const desc = tItems[1].querySelector('.t-desc'); if (desc) desc.textContent = t.proconom_desc;
    tItems[1].querySelectorAll('.tl-btn.primary').forEach(b => b.textContent = t.proconom_cta);
  }

  // Experience section
  const expItems = document.querySelectorAll('.exp-item');
  const expData = [
    [t.exp_seyfor_role, t.exp_seyfor_company, t.exp_seyfor_desc],
    [t.exp_fl_role, t.exp_fl_company, t.exp_fl_desc],
    [t.exp_proc_role, t.exp_proc_company, t.exp_proc_desc],
  ];
  expItems.forEach((item, i) => {
    if (!expData[i]) return;
    const role = item.querySelector('.exp-role'); if (role) role.textContent = expData[i][0];
    const company = item.querySelector('.exp-company-row'); if (company) company.textContent = expData[i][1];
    const desc = item.querySelector('.exp-desc'); if (desc) desc.textContent = expData[i][2];
  });

  // Education section
  const eduItems = document.querySelectorAll('.edu-item');
  const eduData = [
    [t.edu_master_degree, t.edu_master_school, t.edu_master_desc],
    [t.edu_bachelor_degree, t.edu_bachelor_school, t.edu_bachelor_desc],
    [t.edu_cert_degree, t.edu_cert_school, t.edu_cert_desc],
  ];
  eduItems.forEach((item, i) => {
    if (!eduData[i]) return;
    const deg = item.querySelector('.edu-degree'); if (deg) deg.textContent = eduData[i][0];
    const school = item.querySelector('.edu-school'); if (school) school.textContent = eduData[i][1];
    const desc = item.querySelector('.edu-desc'); if (desc) desc.textContent = eduData[i][2];
  });

  // Approach section
  const approachCards = document.querySelectorAll('.approach-card');
  const approachData = [
    [t.approach_1_title, t.approach_1_desc],
    [t.approach_2_title, t.approach_2_desc],
    [t.approach_3_title, t.approach_3_desc],
    [t.approach_4_title, t.approach_4_desc],
  ];
  approachCards.forEach((card, i) => {
    if (!approachData[i]) return;
    const title = card.querySelector('.approach-title'); if (title) title.textContent = approachData[i][0];
    const desc = card.querySelector('.approach-desc'); if (desc) desc.textContent = approachData[i][1];
  });

  // Skills section (new list layout)
  const skillAreas = document.querySelectorAll('.skill-area');
  const skillTitles = [t.skills_dr, t.skills_eng, t.skills_tools];
  skillAreas.forEach((el, i) => { if (skillTitles[i]) el.textContent = skillTitles[i]; });

  // About section
  const aboutTitle = document.querySelector('.about-text h2');
  if (aboutTitle) aboutTitle.textContent = t.about_title;
  const aboutPs = document.querySelectorAll('.about-text p');
  const aboutParas = [t.about_p1, t.about_p2, t.about_p3, t.about_p4];
  aboutPs.forEach((p, i) => { if (aboutParas[i]) p.textContent = aboutParas[i]; });

  // CTA band
  const ctaH2 = document.querySelector('.cta-band-left h2');
  if (ctaH2 && t.cta_h2) ctaH2.innerHTML = t.cta_h2;
  const ctaP = document.querySelector('.cta-band-left p');
  if (ctaP && t.cta_p) ctaP.textContent = t.cta_p;
  const ctaBtns = document.querySelectorAll('.cta-band-right a');
  if (ctaBtns[0] && t.cta_book) ctaBtns[0].textContent = t.cta_book;
  if (ctaBtns[1] && t.cta_email) ctaBtns[1].textContent = t.cta_email;

  updateTooltips(t);

  // Contact title & sub
  const contactTitle = document.querySelector('.contact-title');
  if (contactTitle) contactTitle.innerHTML = t.contact_title;
  const contactSub = document.querySelector('.contact-sub');
  if (contactSub) contactSub.textContent = t.contact_sub;
  const cvModalBadge = document.getElementById('cvModalBadge');
  if (cvModalBadge) cvModalBadge.textContent = t.cv_modal_badge;
  const cvTriggerSidebar = document.getElementById('cvTriggerSidebar');
  if (cvTriggerSidebar) {
    const label = cvTriggerSidebar.querySelector('.cv-trigger-label');
    if (label) label.textContent = t.cv_download;
  }
  const cvModalTitle = document.getElementById('cvModalTitle');
  if (cvModalTitle) cvModalTitle.textContent = t.cv_modal_title;
  const cvModalCopy = document.getElementById('cvModalCopy');
  if (cvModalCopy) cvModalCopy.textContent = t.cv_modal_copy;
  const cvBtnEnLabel = document.getElementById('cvBtnEnLabel');
  if (cvBtnEnLabel) cvBtnEnLabel.textContent = t.cv_btn_en;
  const cvBtnCsLabel = document.getElementById('cvBtnCsLabel');
  if (cvBtnCsLabel) cvBtnCsLabel.textContent = t.cv_btn_cs;
  const cvContactValue = document.getElementById('cvContactValue');
  if (cvContactValue) cvContactValue.textContent = t.cv_contact_value;

  document.querySelectorAll('.exp-expand-label').forEach(el => {
    const item = el.closest('.exp-item, .edu-item');
    if (item) el.textContent = item.classList.contains('notes-open') ? t.show_less : t.show_more;
  });
  // update expandable contents for current language
  document.querySelectorAll('.exp-item[data-expand-key], .edu-item[data-expand-key]').forEach(item => {
    const key = item.dataset.expandKey;
    if (!key) return;
    const content = t[key];
    const textEl = item.querySelector('.exp-expand-text-content');
    if (textEl && content) textEl.innerHTML = content;
  });

  // Update tooltips for education subject links
  setTimeout(() => {
    updateTooltips(t);
    initTooltipEdgeDetection();
  }, 0);
}

// Create language-aware expand/collapse blocks for experience & education
function createExpandables() {
  document.querySelectorAll('.exp-item[data-expand-key], .edu-item[data-expand-key]').forEach(item => {
    // avoid recreating
    if (item.querySelector('.exp-expand-btn')) return;
    const key = item.dataset.expandKey;
    if (!key) return;
    const extendedText = (translations[currentLang] && translations[currentLang][key]) || '';
    if (!extendedText) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'exp-expand-btn';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = '<span class="exp-expand-label">' + ((translations[currentLang] && translations[currentLang].show_more) || 'Show more') + '</span><i class="exp-expand-icon">↓</i>';

    const notesArea = document.createElement('div');
    notesArea.className = 'exp-notes-area';
    notesArea.setAttribute('role', 'region');
    const textDiv = document.createElement('div');
    textDiv.className = 'exp-expand-text-content';
    textDiv.innerHTML = extendedText;
    notesArea.appendChild(textDiv);

    toggleBtn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('notes-open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      const label = (translations[currentLang] && (isOpen ? translations[currentLang].show_less : translations[currentLang].show_more)) || (isOpen ? 'Show less' : 'Show more');
      toggleBtn.querySelector('.exp-expand-label').textContent = label;
    });

    const infoEl = item.querySelector('.exp-info') || item.querySelector('div:last-child');
    if (infoEl) {
      infoEl.appendChild(toggleBtn);
      infoEl.appendChild(notesArea);
    }
  });
}

/* Delegated handling for the language dropdown(s) — works even after
   translatePageElements() replaces the dropdown markup (case-study
   footers translated via [data-i18n-html]), since delegation doesn't
   rely on element references captured once at load time. */
document.addEventListener('click', e => {
  const trigger = e.target.closest('.lang-dropdown-trigger');
  if (trigger) {
    e.stopPropagation();
    const dropdown = trigger.closest('.lang-dropdown');
    if (dropdown) {
      const open = dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', open);
    }
    return;
  }

  const option = e.target.closest('.lang-option');
  if (option) {
    e.stopPropagation();
    applyLang(option.dataset.lang);
    const dropdown = option.closest('.lang-dropdown');
    if (dropdown) {
      dropdown.classList.remove('open');
      const trig = dropdown.querySelector('.lang-dropdown-trigger');
      if (trig) trig.setAttribute('aria-expanded', 'false');
    }
    return;
  }

  // Clicking anywhere else closes any open dropdown
  document.querySelectorAll('.lang-dropdown.open').forEach(d => {
    d.classList.remove('open');
    const trig = d.querySelector('.lang-dropdown-trigger');
    if (trig) trig.setAttribute('aria-expanded', 'false');
  });
});

const cvModal = document.getElementById('cvModal');
const cvModalClose = document.getElementById('cvModalClose');
const cvTriggers = [
  document.getElementById('cvTriggerSidebar'),
  document.getElementById('cvTriggerContact'),
].filter(Boolean);

function toggleCvModal(open) {
  if (!cvModal) return;
  cvModal.classList.toggle('open', open);
  if (open) {
    cvModal.focus();
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

cvTriggers.forEach(btn => {
  btn.addEventListener('click', event => {
    event.preventDefault();
    toggleCvModal(true);
  });
});

if (cvModalClose) {
  cvModalClose.addEventListener('click', () => toggleCvModal(false));
}

if (cvModal) {
  cvModal.addEventListener('click', event => {
    if (event.target === cvModal) toggleCvModal(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && cvModal.classList.contains('open')) {
      toggleCvModal(false);
    }
  });
}

if (typeof updateTooltips === 'function') {
  applyLang(currentLang);
  // build expandables after language application
  createExpandables();
  // update tooltips for education subject links
  setTimeout(() => {
    updateTooltips(tooltipTexts[currentLang]);
    initTooltipEdgeDetection();
  }, 0);
} else {
  // Sub-pages (e.g. freelance.html) don't define updateTooltips but still
  // need to honour the persisted language on page load and respond to the
  // in-page language dropdown.
  applyLang(currentLang);
}
