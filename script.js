const CONFIG = {
  spreadsheetUrl:
    "https://docs.google.com/spreadsheets/d/1i-kfXjLd5-IVWnz82wj-WHW58nbnqStSbkdz9TdMNs8/edit?usp=sharing",
  projectSheet: "Project",
  certSheet: "certificates",

  sheetUrl:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT5WA6hujjnnz5EZPgeSZUXtT_3g312lwx5sLAPgpVFtYZD067ea1-T4mrvFl7tR7qmnZpI8kVXjOJ5/pub?gid=701782256&single=true&output=csv",
  csvFile: "projects.csv",
  certSheetUrl: "",
  certCsvFile: "certificates.csv",
};

(() => {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const hasObserver = "IntersectionObserver" in window;
  const animateCounters = hasObserver && !reduceMotion;

  /* ================= MENU HP ================= */
  const header = document.querySelector(".header");
  const navbar = document.querySelector(".navbar");
  const menuBtn = document.querySelector(".menu-btn");

  if (menuBtn && navbar) {
    menuBtn.setAttribute("role", "button");
    menuBtn.setAttribute("tabindex", "0");
    menuBtn.setAttribute("aria-label", "Buka menu");
    menuBtn.setAttribute("aria-expanded", "false");

    const setMenu = (open) => {
      navbar.classList.toggle("active", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      const icon = menuBtn.querySelector("i");
      if (icon) icon.className = open ? "bx bx-x" : "bx bx-menu";
    };

    menuBtn.addEventListener("click", () =>
      setMenu(!navbar.classList.contains("active"))
    );

    menuBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        menuBtn.click();
      }
    });

    navbar.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ============ HEADER SAAT SCROLL + TOMBOL KE ATAS ============ */
  const scrollTopBtn = document.createElement("a");
  scrollTopBtn.href = "#home";
  scrollTopBtn.className = "scroll-top";
  scrollTopBtn.setAttribute("aria-label", "Kembali ke atas");
  scrollTopBtn.innerHTML = "<i class='bx bx-up-arrow-alt'></i>";
  document.body.appendChild(scrollTopBtn);

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 50);
    scrollTopBtn.classList.toggle("show", y > 500);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ================= MENU AKTIF SESUAI SECTION ================= */
  const navLinks = [...document.querySelectorAll(".navbar a[href^='#']")];
  const navSections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (hasObserver && navSections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => {
            a.classList.toggle(
              "active",
              a.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    navSections.forEach((section) => spy.observe(section));
  }

  /* ================= COUNTER STATISTIK ================= */
  const counters = document.querySelectorAll(".counter");

  const runCounter = (el) => {
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const target = Number(el.dataset.target) || 0;
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * progress);
      if (progress < 1) requestAnimationFrame(tick);
      else el.dataset.done = "1";
    };
    requestAnimationFrame(tick);
  };

  if (animateCounters) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => {
      el.textContent = "0";
      counterObserver.observe(el);
    });
  } else {
    counters.forEach((el) => {
      el.textContent = Number(el.dataset.target) || el.textContent;
    });
  }

  const setCount = (id, n) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.dataset.target = String(n);
    if (!animateCounters || el.dataset.done) el.textContent = n;
  };
  const setProjectCount = (n) => setCount("projectCount", n);

  let revealObserver = null;

  if (animateCounters) {
    revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("active");
          obs.unobserve(el);
          /* Lepas class setelah animasi selesai supaya efek hover normal */
          setTimeout(() => el.classList.remove("reveal", "active"), 900);
        });
      },
      { threshold: 0.12 }
    );
  }

  const addReveal = (els) => {
    if (!revealObserver) return;
    els.forEach((el) => {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  };

  addReveal(
    document.querySelectorAll(
      ".section-header, .about-container, .skill-grid, .tech-card, " +
        ".project-card, .timeline-item, .certificate-card, " +
        ".education-card, .contact-box"
    )
  );

  const grid = document.querySelector(".project-grid");

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  const categoryOf = (card) => {
    const c = card.querySelector(".project-category");
    return c ? c.textContent.trim() : "";
  };

  const fillViewer = (viewer, f, label) => {
    viewer.replaceChildren();
    viewer.classList.remove("has-frame");
    const showEmpty = () => {
      viewer.classList.remove("has-frame");
      viewer.replaceChildren(
        el("p", "cert-empty",
          "Pratinjau tidak tersedia untuk file ini. Gunakan tombol di bawah untuk membukanya.")
      );
    };
    if (!f) {
      viewer.hidden = true;
      return;
    }
    viewer.hidden = false;
    if (f.kind === "image") {
      const img = document.createElement("img");
      img.className = "cert-view-img";
      img.referrerPolicy = "no-referrer";
      img.alt = label;
      img.addEventListener("error", showEmpty);
      img.src = f.url;
      viewer.append(img);
    } else if (f.embed) {
      const frame = document.createElement("iframe");
      frame.className = "cert-frame";
      frame.title = label;
      frame.src = f.embed;
      viewer.classList.add("has-frame");
      viewer.append(frame);
    } else {
      showEmpty();
    }
  };

  const mediaOf = (card) => {
    if (card._media) return card._media;
    const img = card.querySelector("img");
    if (!img) return null;
    const u = img.currentSrc || img.src;
    return { kind: "image", url: u, open: u, embed: "", thumbs: [] };
  };

  let openDetail = null;

  const ensureDialog = () => {
    if (openDetail) return;

    const dialog = document.createElement("dialog");
    dialog.className = "project-modal";
    dialog.setAttribute("aria-labelledby", "projectModalTitle");
    dialog.innerHTML =
      "<button type='button' class='modal-close' aria-label='Tutup detail'>" +
      "<i class='bx bx-x'></i></button>" +
      "<div class='modal-inner'>" +
      "<div class='cert-viewer modal-media'></div>" +
      "<div class='modal-body'>" +
      "<span class='project-category'></span>" +
      "<h3 id='projectModalTitle'></h3>" +
      "<div class='modal-detail'></div>" +
      "<div class='modal-actions'></div>" +
      "</div></div>";
    document.body.appendChild(dialog);

    const mMedia = dialog.querySelector(".modal-media");
    const mCat = dialog.querySelector(".project-category");
    const mTitle = dialog.querySelector("#projectModalTitle");
    const mDetail = dialog.querySelector(".modal-detail");
    const mActions = dialog.querySelector(".modal-actions");
    let lastTrigger = null;

    openDetail = (card, trigger) => {
      const media = mediaOf(card);
      mTitle.textContent = card.querySelector("h3").textContent.trim();
      fillViewer(mMedia, media, "Tampilan project " + mTitle.textContent);
      mCat.textContent = categoryOf(card);

      const tpl = card.querySelector("template.project-detail");
      mDetail.replaceChildren(...(tpl ? [tpl.content.cloneNode(true)] : []));
      mDetail.hidden = !tpl;

      mActions.replaceChildren();
      if (media && media.open) {
        const o = document.createElement("a");
        o.className = "btn-secondary";
        o.href = media.open;
        o.target = "_blank";
        o.rel = "noopener noreferrer";
        o.textContent = media.kind === "pdf" || media.kind === "drive" ? "Buka dokumen di tab baru" : "Buka gambar di tab baru";
        mActions.appendChild(o);
      }
      const repo = card.querySelector(".project-button a");
      if (repo) {
        const link = document.createElement("a");
        link.className = "btn-primary";
        link.href = repo.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Lihat di GitHub";
        mActions.appendChild(link);
      }

      lastTrigger = trigger || card;
      document.documentElement.classList.add("modal-open");
      dialog.showModal();
      dialog.querySelector(".modal-inner").scrollTop = 0;
    };

    dialog
      .querySelector(".modal-close")
      .addEventListener("click", () => dialog.close());

    /* Klik di area gelap (backdrop) menutup modal */
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", () => {
      mMedia.replaceChildren(); /* hentikan pemuatan PDF/gambar */
      document.documentElement.classList.remove("modal-open");
      if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus();
    });
  };

  /* ---------- Pasang filter + tombol detail pada kartu yang ada ---------- */
  const setupProjects = () => {
    if (!grid) return;

    const oldBar = document.querySelector(".project-filter");
    if (oldBar) oldBar.remove();

    const cards = [...grid.querySelectorAll(".project-card")];
    if (!cards.length) return;

    /* Filter: satu tombol per kategori */
    const categories = [...new Set(cards.map(categoryOf).filter(Boolean))];

    if (categories.length > 1) {
      const bar = el("div", "project-filter");
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", "Filter project");

      ["Semua", ...categories].forEach((name, i) => {
        const btn = el("button", "filter-btn" + (i === 0 ? " active" : ""), name);
        btn.type = "button";
        btn.dataset.filter = i === 0 ? "all" : name;
        bar.appendChild(btn);
      });

      grid.before(bar);

      bar.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;

        bar.querySelectorAll(".filter-btn").forEach((b) => {
          b.classList.toggle("active", b === btn);
        });

        const filter = btn.dataset.filter;
        cards.forEach((card) => {
          card.hidden = filter !== "all" && filter !== categoryOf(card);
        });
      });
    }

    /* Detail: hanya untuk kartu yang punya <template class="project-detail"> */
    const detailCards = cards.filter(
      (c) => c.querySelector("template.project-detail") || c._media
    );

    if (detailCards.length && typeof HTMLDialogElement === "function") {
      ensureDialog();

      detailCards.forEach((card) => {
        if (card.dataset.detailReady) return;
        card.dataset.detailReady = "1";

        let wrap = card.querySelector(".project-button");
        if (!wrap) {
          wrap = el("div", "project-button");
          card.querySelector(".project-content").appendChild(wrap);
        }

        const btn = el("button", "detail-btn");
        btn.type = "button";
        btn.setAttribute("aria-haspopup", "dialog");
        const hasTpl = !!card.querySelector("template.project-detail");
        const m = card._media;
        btn.innerHTML =
          (hasTpl ? "Lihat detail" : m && (m.kind === "pdf" || m.kind === "drive") ? "Lihat dokumen" : "Lihat gambar") +
          " <i class='bx bx-right-arrow-alt'></i>";
        wrap.prepend(btn);

        card.classList.add("is-clickable");
        card.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;
          openDetail(card, btn);
        });
      });
    }
  };

  const parseCSV = (text) => {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    text = text.replace(/^﻿/, "");

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
      } else {
        field += c;
      }
    }
    if (field !== "" || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  };

  const normKey = (h) =>
    h
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const splitList = (s) =>
    (s || "")
      .split(/\s*(?:\||\n)\s*/)
      .map((x) => x.trim())
      .filter(Boolean);


  const DOMAIN_LIKE =
    /^(?:www\.|(?:[a-z0-9-]+\.)+(?:com|org|net|io|co|id|edu|dev|app|ai|me|link|page)(?:[/:?#]|$))/i;

  const safeUrl = (u) => {
    u = (u || "").trim();
    if (!u) return "";
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) {
      return /^https?:/i.test(u) ? u : "";
    }
    if (DOMAIN_LIKE.test(u)) return "https://" + u;
    return u;
  };

  const driveId = (u) => {
    const m = u.match(
      /^https?:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|(?:open|uc|thumbnail)\?(?:[^#]*&)?id=)([\w-]{10,})/i
    );
    return m ? m[1] : "";
  };

  const imageCandidates = (u) => {
    const safe = safeUrl(u);
    if (!safe) return [];
    const id = driveId(safe);
    if (!id) return [safe];
    return [
      "https://drive.google.com/thumbnail?id=" + id + "&sz=w1200",
      "https://lh3.googleusercontent.com/d/" + id + "=w1200",
    ];
  };

  const parseProjects = (rows) => {
    if (rows.length < 2) return [];
    const keys = rows[0].map(normKey);

    const items = rows.slice(1).map((r, index) => {
      const o = { index };
      keys.forEach((k, i) => {
        if (k) o[k] = (r[i] || "").trim();
      });
      return o;
    });

    const off = ["tidak", "no", "false", "0", "n", "nonaktif"];

    return items
      .filter((o) => o.judul)
      .filter((o) => !off.includes((o.aktif || "ya").toLowerCase()))
      .sort((a, b) => {

        const rank = (o) => {
          const n = parseFloat(o.urutan);
          return Number.isFinite(n) ? n : -Infinity;
        };
        const ra = rank(a);
        const rb = rank(b);
        if (ra === rb) return ra === -Infinity ? b.index - a.index : a.index - b.index;
        return ra < rb ? -1 : 1;
      });
  };

  /* Detail (isi modal) dibuat dari kolom ringkasan_detail, tools_detail, alur, insight */
  const buildDetailTemplate = (o) => {
    const lead = o.ringkasan_detail;
    const toolItems = splitList(o.tools_detail).map((t) => {
      const [name, ...rest] = t.split("::");
      return { name: name.trim(), use: rest.join("::").trim() };
    });
    const tools = toolItems.length
      ? toolItems
      : splitList(o.tools).map((name) => ({ name, use: "" }));
    const steps = splitList(o.alur);
    const insights = splitList(o.insight);

    /* Tanpa isi detail, kartu tidak punya tombol detail */
    if (!lead && !toolItems.length && !steps.length && !insights.length) {
      return null;
    }

    const tpl = document.createElement("template");
    tpl.className = "project-detail";
    const frag = document.createDocumentFragment();

    if (lead) frag.append(el("p", "detail-lead", lead));

    if (tools.length) {
      frag.append(el("h4", "", "Tools yang digunakan"));
      const ul = el("ul", "tool-list");
      tools.forEach((t) => {
        const li = el("li");
        li.append(el("strong", "", t.name));
        if (t.use) li.append(el("span", "", t.use));
        ul.append(li);
      });
      frag.append(ul);
    }

    if (steps.length) {
      frag.append(el("h4", "", "Alur pengerjaan"));
      const ol = el("ol", "detail-steps");
      steps.forEach((s) => ol.append(el("li", "", s)));
      frag.append(ol);
    }

    if (insights.length) {
      frag.append(el("h4", "", "Insight & hasil"));
      const ul = el("ul", "insight-list");
      insights.forEach((s) => ul.append(el("li", "", s)));
      frag.append(ul);
    }

    tpl.content.append(frag);
    return tpl;
  };

  const buildCard = (o) => {
    const card = el("div", "project-card");

    const media = fileInfo(o.gambar, o.tipe_file || o.tipe);
    if (media && media.kind === "link") media.kind = "image"; /* tanpa ekstensi: coba sebagai gambar */
    card._media = media || null;

    const sources = o.pratinjau ? imageCandidates(o.pratinjau) : media ? media.thumbs : [];
    const isPdf = media && (media.kind === "pdf" || media.kind === "drive");
    const fallbackIcon = () =>
      el("div", "project-thumb-fallback").appendChild(el("i", isPdf ? "bx bxs-file-pdf" : "bx bx-image")).parentNode;

    if (media) {
      if (sources.length) {
        const img = document.createElement("img");
        let tried = 0;
        img.referrerPolicy = "no-referrer";
        img.src = sources[0];
        img.alt = o.alt_gambar || "Tampilan project " + o.judul;
        img.width = 640;
        img.height = 360;
        img.loading = "lazy";
        img.decoding = "async";
        img.addEventListener("error", () => {
          tried++;
          if (tried < sources.length) img.src = sources[tried];
          else {
            console.warn("Gambar kartu gagal dimuat untuk project:", o.judul, sources);
            img.replaceWith(fallbackIcon());
          }
        });
        card.append(img);
      } else {
        card.append(fallbackIcon());
      }
    } else if (o.gambar) {
      console.warn(
        "Isi kolom gambar tidak dikenali untuk project:",
        o.judul,
        JSON.stringify(o.gambar)
      );
    }

    const content = el("div", "project-content");
    content.append(
      el("span", "project-category", o.kategori || "Lainnya"),
      el("h3", "", o.judul),
      el("p", "", o.deskripsi || "")
    );

    const tags = splitList(o.tools);
    if (tags.length) {
      const wrap = el("div", "project-tags");
      tags.forEach((t) => wrap.append(el("span", "", t)));
      content.append(wrap);
    }

    const repo = safeUrl(o.github);
    if (repo) {
      const wrap = el("div", "project-button");
      const a = document.createElement("a");
      a.href = repo;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.append(
        el("i", "bx bxl-github"),
        " Lihat di GitHub ",
        el("i", "bx bx-right-arrow-alt")
      );
      wrap.append(a);
      content.append(wrap);
    }

    const tpl = buildDetailTemplate(o);
    if (tpl) content.append(tpl);

    card.append(content);
    return card;
  };

  const renderProjects = (items) => {
    grid.replaceChildren(...items.map(buildCard));
    setupProjects();
    addReveal(grid.querySelectorAll(".project-card"));
    setProjectCount(items.length);
  };

  const fetchText = async (url) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  };

  const certGrid = document.querySelector(".certificate-grid");
  const canModal = typeof HTMLDialogElement === "function";
  /* Nama kolom yang dikenali (selain "file" dan "link_verifikasi") */
  const FILE_KEYS = ["file", "link", "link_sertifikat", "url", "berkas", "tautan"];
  const VERIF_KEYS = ["link_verifikasi", "verifikasi", "link_kredensial", "kredensial"];
  const pick = (o, keys) => {
    for (const k of keys) if (o[k]) return o[k];
    return "";
  };

  const IMG_EXT = /\.(?:png|jpe?g|webp|gif|avif|svg)(?:[?#].*)?$/i;
  const PDF_EXT = /\.pdf(?:[?#].*)?$/i;

  /* Tentukan jenis file dari link: Google Drive, PDF, gambar, atau lainnya */
  const fileInfo = (raw, tipe) => {
    const safe = safeUrl(raw);
    if (!safe) return null;

    const id = driveId(safe);
    if (id) {
      /* Drive: halaman /preview bisa menampilkan gambar maupun PDF */
      return {
        kind: "drive",
        open: "https://drive.google.com/file/d/" + id + "/view",
        embed: "https://drive.google.com/file/d/" + id + "/preview",
        thumbs: imageCandidates(safe),
      };
    }

    const t = (tipe || "").toLowerCase();
    if (t === "pdf" || PDF_EXT.test(safe)) {
      return { kind: "pdf", open: safe, embed: safe, thumbs: [] };
    }
    if (["gambar", "image", "jpg", "jpeg", "png"].includes(t) || IMG_EXT.test(safe)) {
      return { kind: "image", open: safe, embed: "", url: safe, thumbs: [safe] };
    }
    return { kind: "link", open: safe, embed: "", thumbs: [] };
  };

  /* ---------- Modal pratinjau sertifikat (dibuat sekali) ---------- */
  let openCert = null;

  const ensureCertDialog = () => {
    if (openCert) return;

    const dialog = document.createElement("dialog");
    dialog.className = "project-modal cert-modal";
    dialog.setAttribute("aria-labelledby", "certModalTitle");
    dialog.innerHTML =
      "<button type='button' class='modal-close' aria-label='Tutup pratinjau'>" +
      "<i class='bx bx-x'></i></button>" +
      "<div class='modal-inner'><div class='modal-body'>" +
      "<h3 id='certModalTitle'></h3>" +
      "<p class='cert-meta'></p>" +
      "<p class='cert-desc'></p>" +
      "<div class='cert-viewer'></div>" +
      "<div class='modal-actions'></div>" +
      "</div></div>";
    document.body.appendChild(dialog);

    const mTitle = dialog.querySelector("#certModalTitle");
    const mMeta = dialog.querySelector(".cert-meta");
    const mDesc = dialog.querySelector(".cert-desc");
    const viewer = dialog.querySelector(".cert-viewer");
    const mActions = dialog.querySelector(".modal-actions");
    let lastTrigger = null;

    openCert = (c, trigger) => {
      mTitle.textContent = c.judul;
      const meta = [c.penerbit, c.tanggal].filter(Boolean).join(" · ");
      mMeta.textContent = meta;
      mMeta.hidden = !meta;
      mDesc.textContent = c.deskripsi;
      mDesc.hidden = !c.deskripsi;

      const f = c.file;
      fillViewer(viewer, f, "Sertifikat " + c.judul);

      mActions.replaceChildren();
      const open = document.createElement("a");
      open.className = "btn-primary";
      open.href = f.open;
      open.target = "_blank";
      open.rel = "noopener noreferrer";
      open.textContent = "Buka di tab baru";
      mActions.append(open);

      if (c.verif) {
        const v = document.createElement("a");
        v.className = "btn-secondary";
        v.href = c.verif;
        v.target = "_blank";
        v.rel = "noopener noreferrer";
        v.textContent = "Verifikasi kredensial";
        mActions.append(v);
      }

      lastTrigger = trigger || null;
      document.documentElement.classList.add("modal-open");
      dialog.showModal();
      dialog.querySelector(".modal-inner").scrollTop = 0;
    };

    dialog
      .querySelector(".modal-close")
      .addEventListener("click", () => dialog.close());

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", () => {
      viewer.replaceChildren(); /* hentikan pemuatan PDF/gambar */
      document.documentElement.classList.remove("modal-open");
      if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus();
    });
  };

  /* ---------- Kartu sertifikat ---------- */
  const buildCertCard = (o) => {
    const c = {
      judul: o.judul,
      penerbit: o.penerbit || "",
      tanggal: o.tanggal || "",
      deskripsi: o.deskripsi || "",
      file: fileInfo(pick(o, FILE_KEYS), o.tipe_file || o.tipe),
      verif: "",
    };

    const rawFile = pick(o, FILE_KEYS);
    const rawVerif = pick(o, VERIF_KEYS);
    const v = safeUrl(rawVerif);
    c.verif = /^https?:\/\//i.test(v) ? v : "";

    if (rawFile && !c.file) {
      console.warn("Link file tidak valid untuk sertifikat:", o.judul, JSON.stringify(rawFile));
    } else if (rawFile && !/[/]/.test(rawFile) && !/^[a-z][a-z0-9+.-]*:/i.test(rawFile)) {
      console.warn(
        "Kolom file untuk '" + o.judul + "' berisi '" + rawFile + "', bukan link. " +
          "Jika itu chip Drive, hapus lalu tempel ulang sebagai teks biasa (Ctrl+Shift+V)."
      );
    }
    if (rawVerif && !c.verif) {
      console.warn("Link verifikasi tidak valid untuk sertifikat:", o.judul, JSON.stringify(rawVerif));
    }

    const card = el("div", "certificate-card");

    /* Gambar kecil di kartu: kolom pratinjau, atau otomatis dari file */
    const preview = o.pratinjau
      ? imageCandidates(o.pratinjau)
      : c.file
      ? c.file.thumbs
      : [];
    const iconCls = c.file && c.file.kind === "pdf" ? "bx bxs-file-pdf" : "bx bx-award";

    if (preview.length) {
      const thumb = el("div", "cert-thumb");
      const img = document.createElement("img");
      let tried = 0;
      img.referrerPolicy = "no-referrer";
      img.alt = "Pratinjau sertifikat " + c.judul;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => {
        tried++;
        if (tried < preview.length) img.src = preview[tried];
        else thumb.replaceWith(el("i", iconCls)); /* gagal: tampilkan ikon */
      });
      img.src = preview[0];
      thumb.append(img);
      card.append(thumb);
    } else {
      card.append(el("i", iconCls));
    }

    const title = el("h3", "", c.judul);
    title.title = c.judul;
    card.append(title);
    if (c.penerbit) card.append(el("p", "", c.penerbit));
    if (c.tanggal) card.append(el("p", "cert-date", c.tanggal));

    if (c.file || c.verif) {
      const actions = el("div", "cert-actions");

      if (c.file) {
        const btn = el("button", "cert-btn");
        btn.type = "button";
        if (canModal) btn.setAttribute("aria-haspopup", "dialog");
        btn.append("Lihat sertifikat ", el("i", "bx bx-show"));
        actions.append(btn);

        card.classList.add("is-clickable");
        card.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;
          if (!canModal) {
            window.open(c.file.open, "_blank", "noopener");
            return;
          }
          ensureCertDialog();
          openCert(c, btn);
        });
      }

      if (c.verif) {
        const a = document.createElement("a");
        a.className = "cert-link";
        a.href = c.verif;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.append("Verifikasi ", el("i", "bx bx-link-external"));
        actions.append(a);
      }

      card.append(actions);
    }

    return card;
  };

  const renderCertificates = (items) => {
    if (!items.some((o) => pick(o, FILE_KEYS) || pick(o, VERIF_KEYS))) {
      console.warn(
        "Tidak ada sertifikat yang punya link. Isi kolom 'file' (link sertifikat) atau " +
          "'link_verifikasi'. Kolom yang terbaca:",
        Object.keys(items[0]).filter((k) => k !== "index")
      );
    }
    certGrid.replaceChildren(...items.map(buildCertCard));
    addReveal(certGrid.querySelectorAll(".certificate-card"));
    setCount("certCount", items.length);
  };

  setupProjects();

  const sheetId = (() => {
    const m = (CONFIG.spreadsheetUrl || "").match(
      /spreadsheets\/d\/(?!e\/)([\w-]{20,})/
    );
    return m ? m[1] : "";
  })();

  if (CONFIG.spreadsheetUrl && !sheetId) {
    console.warn(
      "spreadsheetUrl tidak dikenali. Pakai link dari tombol Bagikan " +
        "(https://docs.google.com/spreadsheets/d/ID/edit...), bukan link Publish to web."
    );
  }

  const gvizUrl = (name, tqx) =>
    "https://docs.google.com/spreadsheets/d/" + sheetId +
    "/gviz/tq?headers=1&sheet=" + encodeURIComponent(name) +
    "&tqx=" + encodeURIComponent(tqx);

  const checkRows = (rows, name, anyOf) => {
    const keys = (rows[0] || []).map(normKey);
    if (!keys.includes("judul") || !anyOf.some((k) => keys.includes(k))) {
      throw new Error('Tab "' + name + '" tidak ditemukan atau kolomnya tidak sesuai');
    }
    return rows;
  };

  /* (a) CSV lewat fetch */
  const gvizCsv = (name, anyOf) => async () => {
    const text = await fetchText(gvizUrl(name, "out:csv"));
    if (/^\s*<(?:!doctype|html)/i.test(text)) {
      throw new Error("Spreadsheet belum dibagikan sebagai 'Siapa saja yang memiliki link'");
    }
    return checkRows(parseCSV(text), name, anyOf);
  };

  /* (b) Cadangan: JSONP lewat tag <script> (tidak terkena aturan CORS) */
  let jsonpCount = 0;
  const gvizJsonp = (name, anyOf) => () =>
    new Promise((resolve, reject) => {
      const cb = "__gviz" + Date.now().toString(36) + jsonpCount++;
      const script = document.createElement("script");
      let timer = null;
      const finish = () => {
        clearTimeout(timer);
        delete window[cb];
        script.remove();
      };
      timer = setTimeout(() => {
        finish();
        reject(new Error("Waktu habis saat membaca spreadsheet"));
      }, 8000);

      window[cb] = (resp) => {
        finish();
        try {
          if (!resp || resp.status !== "ok" || !resp.table) {
            throw new Error("Spreadsheet tidak bisa dibaca (cek pengaturan berbagi)");
          }
          const cell = (c) => (c == null ? "" : String(c.f != null ? c.f : c.v == null ? "" : c.v));
          const head = resp.table.cols.map((c) => c.label || "");
          const rows = [head].concat(
            resp.table.rows.map((r) => head.map((_, i) => cell((r.c || [])[i])))
          );
          resolve(checkRows(rows, name, anyOf));
        } catch (err) {
          reject(err);
        }
      };
      script.onerror = () => {
        finish();
        reject(new Error("Gagal memuat spreadsheet"));
      };
      script.src = gvizUrl(name, "out:json;responseHandler:" + cb);
      document.head.appendChild(script);
    });

  const csvSource = (url) => async () => parseCSV(await fetchText(url));

  const sourcesFor = (sheetName, anyOf, csvUrl, repoFile) => {
    const list = [];
    if (sheetId) {
      list.push({ name: "Google Sheets, tab " + sheetName, get: gvizCsv(sheetName, anyOf) });
      list.push({ name: "Google Sheets (JSONP), tab " + sheetName, get: gvizJsonp(sheetName, anyOf) });
    }
    if (csvUrl) list.push({ name: csvUrl, get: csvSource(csvUrl) });
    if (repoFile) list.push({ name: repoFile, get: csvSource(repoFile) });
    return list;
  };

  const loadInto = async (sources, render, label, keep) => {
    for (const src of sources) {
      try {
        const items = parseProjects(await src.get()).filter(keep);
        if (items.length) {
          console.info(label + " dimuat dari", src.name, "-", items.length, "baris aktif:", items.map((x) => x.judul));
          render(items);
          return;
        }
        console.warn("Tidak ada " + label + " aktif di:", src.name);
      } catch (err) {
        console.warn("Gagal memuat " + label + " dari:", src.name, "-", err.message || err);
      }
    }
  };

  /* Baris sertifikat yang terlanjur ada di tab project tidak ditampilkan sebagai project */
  const notCert = (o) => !/^(?:sert|cert)/i.test(o.jenis || "");

  if (grid) {
    loadInto(
      sourcesFor(CONFIG.projectSheet, ["kategori", "deskripsi"], CONFIG.sheetUrl, CONFIG.csvFile),
      renderProjects,
      "Project",
      notCert
    );
  }
  if (certGrid) {
    loadInto(
      sourcesFor(CONFIG.certSheet, ["penerbit", "file"], CONFIG.certSheetUrl, CONFIG.certCsvFile),
      renderCertificates,
      "Sertifikat",
      () => true
    );
  }
})();
