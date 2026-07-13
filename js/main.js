/* =========================================================
   MELYZA TACOS — Scripts
   ========================================================= */
(function () {
  'use strict';

  /* ---- Année dans le footer ---- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Heure réelle dans la barre d'état de l'iPhone ---- */
  var heure = document.getElementById('heureIphone');
  if (heure) {
    var majHeure = function () {
      var d = new Date();
      var hh = String(d.getHours()).padStart(2, '0');
      var mm = String(d.getMinutes()).padStart(2, '0');
      heure.textContent = hh + ':' + mm;
    };
    majHeure();
    setInterval(majHeure, 30000);
  }

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

  /* ---- Les roues du livreur : elles roulent 10 s quand la photo apparaît,
         et suivent ensuite le défilement de la page ---- */
  var roues = document.querySelectorAll('.roue');
  var moto = document.querySelector('.gallery__item--moto');

  if (roues.length && moto) {
    var angle = 0;
    var dernierY = window.scrollY;
    var finRoulage = 0;           // instant où la rotation automatique s'arrête
    var derniereImage = 0;
    var enCours = false;

    var appliquer = function () {
      roues.forEach(function (r) {
        r.style.setProperty('--tour', angle.toFixed(1) + 'deg');
      });
    };

    // boucle d'animation : tourne tant que les 10 secondes ne sont pas écoulées
    var boucle = function (t) {
      if (!derniereImage) derniereImage = t;
      var dt = (t - derniereImage) / 1000;
      derniereImage = t;

      if (t < finRoulage) {
        angle += 220 * dt;        // ~0,6 tour par seconde
        appliquer();
        window.requestAnimationFrame(boucle);
      } else {
        enCours = false;
        derniereImage = 0;
      }
    };

    var lancerRoulage = function () {
      finRoulage = performance.now() + 10000;   // 10 secondes
      if (!enCours) {
        enCours = true;
        derniereImage = 0;
        window.requestAnimationFrame(boucle);
      }
    };

    // départ dès que la photo entre à l'écran
    if ('IntersectionObserver' in window) {
      var obsMoto = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { lancerRoulage(); obsMoto.unobserve(e.target); }
        });
      }, { threshold: 0.3 });
      obsMoto.observe(moto);
    } else {
      lancerRoulage();
    }

    // le défilement fait aussi avancer les roues
    var attente = false;
    window.addEventListener('scroll', function () {
      if (attente) return;
      attente = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        angle += (y - dernierY) * 0.9;
        dernierY = y;
        if (!enCours) appliquer();
        attente = false;
      });
    }, { passive: true });
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
