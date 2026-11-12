const CONFIG = {
  sheetUrl:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAx6ebwC4bv1iMK5ZaKLTVITkaagB9oL-QLFJxQ2Z4uXUobejhkTnf6t969wzZQwOhEWPutPcfE2-P/pub?gid=1786882617&single=true&output=csv",

  csvFile: "projects.csv",
};

(() => {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
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
      setMenu(!navbar.classList.contains("active")),
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
              a.getAttribute("href") === "#" + entry.target.id,
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
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
      { threshold: 0.6 },
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

  /* Jumlah project di statistik mengikuti jumlah kartu yang tampil */
  const setProjectCount = (n) => {
    const el = document.getElementById("projectCount");
    if (!el) return;
    el.dataset.target = String(n);
    if (!animateCounters || el.dataset.done) el.textContent = n;
  };

  /* ================= ANIMASI MUNCUL SAAT SCROLL ================= */
  /* Class "reveal" ditambahkan lewat JS, jadi kalau JS mati
     semua konten tetap terlihat. */
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
      { threshold: 0.12 },
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
        ".education-card, .contact-box",
    ),
  );

  /* ==========================================================
     PROJECT: filter, detail (modal), dan data dari spreadsheet
  ========================================================== */
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

  /* ---------- Modal detail (dibuat sekali) ---------- */
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
      "<img class='modal-img' alt=''>" +
      "<div class='modal-body'>" +
      "<span class='project-category'></span>" +
      "<h3 id='projectModalTitle'></h3>" +
      "<div class='modal-detail'></div>" +
      "<div class='modal-actions'></div>" +
      "</div></div>";
    document.body.appendChild(dialog);

    const mImg = dialog.querySelector(".modal-img");
    const mCat = dialog.querySelector(".project-category");
    const mTitle = dialog.querySelector("#projectModalTitle");
    const mDetail = dialog.querySelector(".modal-detail");
    const mActions = dialog.querySelector(".modal-actions");
    let lastTrigger = null;

    openDetail = (card, trigger) => {
      const img = card.querySelector("img");
      mImg.src = img ? img.currentSrc || img.src : "";
      mImg.alt = img ? img.alt : "";
      mImg.hidden = !img;
      mCat.textContent = categoryOf(card);
      mTitle.textContent = card.querySelector("h3").textContent.trim();

      mDetail.replaceChildren(
        card.querySelector("template.project-detail").content.cloneNode(true),
      );

      mActions.replaceChildren();
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
        const btn = el(
          "button",
          "filter-btn" + (i === 0 ? " active" : ""),
          name,
        );
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
    const detailCards = cards.filter((c) =>
      c.querySelector("template.project-detail"),
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
        btn.innerHTML = "Lihat detail <i class='bx bx-right-arrow-alt'></i>";
        wrap.prepend(btn);

        card.classList.add("is-clickable");
        card.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;
          openDetail(card, btn);
        });
      });
    }
  };

  /* ---------- Spreadsheet (CSV) -> kartu project ---------- */

  /* Pembaca CSV (mendukung tanda kutip, koma, dan baris baru di dalam sel) */
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

  /* Daftar dipisah dengan | atau baris baru (Alt+Enter di Sheets) */
  const splitList = (s) =>
    (s || "")
      .split(/\s*(?:\||\n)\s*/)
      .map((x) => x.trim())
      .filter(Boolean);

  /* Hanya izinkan http(s), atau alamat relatif (mis. assets/foto.png) */
  const safeUrl = (u) => {
    u = (u || "").trim();
    if (!u) return "";
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) {
      return /^https?:/i.test(u) ? u : "";
    }
    return u;
  };

  /* Link "Bagikan" Google Drive tidak bisa dipakai langsung sebagai gambar.
     Ambil ID file-nya, lalu pakai alamat gambar langsung. Ada dua alamat
     cadangan; yang pertama gagal, dicoba yang kedua. File harus dibagikan
     dengan akses "Siapa saja yang memiliki link". */
  const driveId = (u) => {
    const m = u.match(
      /^https?:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|(?:open|uc|thumbnail)\?(?:[^#]*&)?id=)([\w-]{10,})/i,
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
        /* Kolom urutan terisi: urut naik (1 paling atas).
           Kolom urutan kosong = project baru: tampil PALING ATAS,
           dan baris yang lebih bawah di sheet (lebih baru) tampil lebih dulu. */
        const rank = (o) => {
          const n = parseFloat(o.urutan);
          return Number.isFinite(n) ? n : -Infinity;
        };
        const ra = rank(a);
        const rb = rank(b);
        if (ra === rb)
          return ra === -Infinity ? b.index - a.index : a.index - b.index;
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

    const sources = imageCandidates(o.gambar);
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
          console.warn("Gambar gagal dimuat untuk project:", o.judul, sources);
          img.remove();
        }
      });
      card.append(img);
    } else if (o.gambar) {
      console.warn(
        "Isi kolom gambar tidak dikenali untuk project:",
        o.judul,
        JSON.stringify(o.gambar),
      );
    }

    const content = el("div", "project-content");
    content.append(
      el("span", "project-category", o.kategori || "Lainnya"),
      el("h3", "", o.judul),
      el("p", "", o.deskripsi || ""),
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
        el("i", "bx bx-right-arrow-alt"),
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

  /* Urutan sumber: Google Sheets -> projects.csv -> kartu di index.html */
  const loadProjects = async () => {
    if (!grid) return;
    const sources = [CONFIG.sheetUrl, CONFIG.csvFile].filter(Boolean);

    for (const url of sources) {
      try {
        const items = parseProjects(parseCSV(await fetchText(url)));
        if (items.length) {
          console.info(
            "Project dimuat dari",
            url,
            "-",
            items.length,
            "baris aktif:",
            items.map((x) => x.judul),
          );
          renderProjects(items);
          return;
        }
        console.warn("Tidak ada project aktif di:", url);
      } catch (err) {
        console.warn("Gagal memuat data project dari:", url, err);
      }
    }
  };

  /* Kartu dari index.html langsung dipasang fiturnya, lalu diganti
     jika data spreadsheet berhasil dimuat. */
  setupProjects();
  loadProjects();
})();
