/* =========================================================
   MELYZA TACOS — Scripts
   ========================================================= */
(function () {
  'use strict';

  /* ---- Année dans le footer ---- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Navbar : fond au scroll ---- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Menu burger (mobile) ---- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('is-open');
      navLinks.classList.toggle('is-open');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('is-open');
        navLinks.classList.remove('is-open');
      });
    });
  }

  /* ---- Apparition des blocs au scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Filtres de catégories (page menu) ---- */
  var tabs = document.querySelectorAll('.menu-tab');
  var cats = document.querySelectorAll('.menu-cat');
  if (tabs.length && cats.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.dataset.cat;

        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');

        cats.forEach(function (cat) {
          var show = target === 'all' || cat.dataset.cat === target;
          cat.classList.toggle('is-hidden', !show);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* ---- Visionneuse plein écran des affiches du menu ---- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var affiches = document.querySelectorAll('.menu-affiche img');

  if (lightbox && lightboxImg && affiches.length) {
    var closeLightbox = function () {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    };

    affiches.forEach(function (img) {
      img.addEventListener('click', function () {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }
})();
