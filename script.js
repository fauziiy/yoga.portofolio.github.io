/* ==========================================================
   script.js - Portofolio Yoga Dwi Rizki Fauzi
   JavaScript biasa, tanpa library. Cocok dengan index.html:
   menu HP, header saat scroll, menu aktif, tombol ke atas,
   counter statistik, animasi muncul, dan filter project.
========================================================== */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const hasObserver = "IntersectionObserver" in window;

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
    const target = Number(el.dataset.target) || 0;
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * progress);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (hasObserver && !reduceMotion) {
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

  /* ================= ANIMASI MUNCUL SAAT SCROLL ================= */
  /* Class "reveal" ditambahkan lewat JS, jadi kalau JS mati
     semua konten tetap terlihat. */
  if (hasObserver && !reduceMotion) {
    const targets = document.querySelectorAll(
      ".section-header, .about-container, .skill-grid, .tech-card, " +
        ".project-card, .timeline-item, .certificate-card, " +
        ".education-card, .contact-box",
    );

    const revealObserver = new IntersectionObserver(
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

    targets.forEach((el) => {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  }

  /* ================= FILTER PROJECT ================= */
  /* Tombol dibuat otomatis dari teks .project-category tiap kartu. */
  const grid = document.querySelector(".project-grid");
  const cards = grid ? [...grid.querySelectorAll(".project-card")] : [];

  const categoryOf = (card) => {
    const el = card.querySelector(".project-category");
    return el ? el.textContent.trim() : "";
  };

  if (grid && cards.length) {
    const categories = [...new Set(cards.map(categoryOf).filter(Boolean))];

    if (categories.length > 1) {
      const bar = document.createElement("div");
      bar.className = "project-filter";
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", "Filter project");

      ["Semua", ...categories].forEach((name, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "filter-btn" + (i === 0 ? " active" : "");
        btn.dataset.filter = i === 0 ? "all" : name;
        btn.textContent = name;
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
  }

  /* ================= DETAIL PROJECT (MODAL) ================= */
  /* Isi detail diambil dari <template class="project-detail"> di tiap kartu.
     Tombol "Lihat detail" dibuat otomatis; klik di mana saja pada kartu
     (selain link) juga membuka detail. */
  const detailCards = cards.filter((c) =>
    c.querySelector("template.project-detail"),
  );

  if (detailCards.length && typeof HTMLDialogElement === "function") {
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

    const openDetail = (card, trigger) => {
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

    detailCards.forEach((card) => {
      let wrap = card.querySelector(".project-button");
      if (!wrap) {
        wrap = document.createElement("div");
        wrap.className = "project-button";
        card.querySelector(".project-content").appendChild(wrap);
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "detail-btn";
      btn.setAttribute("aria-haspopup", "dialog");
      btn.innerHTML = "Lihat detail <i class='bx bx-right-arrow-alt'></i>";
      wrap.prepend(btn);

      card.classList.add("is-clickable");
      card.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        openDetail(card, btn);
      });
    });

    dialog
      .querySelector(".modal-close")
      .addEventListener("click", () => dialog.close());

    /* Klik di area gelap (backdrop) menutup modal */
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("modal-open");
      if (lastTrigger) lastTrigger.focus();
    });
  }
})();
