/* =========================================================
   MELYZA TACOS — Scripts
   ========================================================= */
(function () {
  'use strict';

  /* ---- Intro / écran d'ouverture (une fois par session) ---- */
  var intro = document.getElementById('intro');
  if (intro) {
    var dejaVue = false;
    try { dejaVue = sessionStorage.getItem('introVue') === '1'; } catch (e) {}

    if (dejaVue) {
      // déjà montrée dans cette session : on l'enlève tout de suite
      intro.parentNode && intro.parentNode.removeChild(intro);
    } else {
      document.body.style.overflow = 'hidden';
      var masquer = function () {
        intro.classList.add('is-hidden');
        document.body.style.overflow = '';
        try { sessionStorage.setItem('introVue', '1'); } catch (e) {}
        setTimeout(function () {
          intro.parentNode && intro.parentNode.removeChild(intro);
        }, 800);
      };
      // durée de l'intro : 5 s dans l'app installée, 2,6 s sur le site web
      var estApp = window.matchMedia('(display-mode: standalone)').matches ||
                   window.navigator.standalone === true;
      var duree;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        duree = 600;
      } else {
        duree = estApp ? 5000 : 2600;
      }
      setTimeout(masquer, duree);
      // on peut aussi la passer en touchant l'écran
      intro.addEventListener('click', masquer);
    }
  }

  /* ---- Application installable (PWA) : enregistrement du service worker ---- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  /* ---- Bouton "Installer l'application" ---- */
  var btnInstall = document.getElementById('installApp');

  // l'app est-elle déjà installée (ouverte en plein écran) ?
  var estInstallee = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone === true;

  var estIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;

  // Android / Chrome / Edge : installation automatique
  var promptInstall = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    promptInstall = e;
    if (btnInstall) {
      btnInstall.hidden = false;
      btnInstall.onclick = function () {
        btnInstall.hidden = true;
        promptInstall.prompt();
        promptInstall = null;
      };
    }
  });
  window.addEventListener('appinstalled', function () {
    if (btnInstall) btnInstall.hidden = true;
  });

  // iPhone / iPad : pas d'installation auto -> on affiche un guide
  if (btnInstall && estIOS && !estInstallee) {
    btnInstall.hidden = false;
    btnInstall.onclick = function () {
      var g = document.getElementById('guideIOS');
      if (g) { g.hidden = false; document.body.style.overflow = 'hidden'; }
    };
  }

  var guideIOS = document.getElementById('guideIOS');
  if (guideIOS) {
    var fermerGuide = function () { guideIOS.hidden = true; document.body.style.overflow = ''; };
    guideIOS.addEventListener('click', function (e) {
      if (e.target === guideIOS || e.target.classList.contains('guide__close')) fermerGuide();
    });
  }

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

  /* ---- Commander un plat : clic sur un plat -> choix Solo/Menu -> WhatsApp ---- */
  var plats = document.querySelectorAll('.menu-item');
  if (plats.length) {
    var NUM_WA = '213560566117';

    // récupère uniquement le texte direct (sans les badges ni le "Menu : ...")
    var texteDirect = function (el) {
      if (!el) return '';
      var t = '';
      el.childNodes.forEach(function (n) {
        if (n.nodeType === 3) t += n.textContent;
      });
      return t.replace(/\s+/g, ' ').trim();
    };

    var envoyerWA = function (message) {
      var lien = 'https://wa.me/' + NUM_WA + '?text=' + encodeURIComponent(message);
      window.open(lien, '_blank', 'noopener');
    };

    // ----- petite fenêtre de choix Solo / Menu (créée une seule fois) -----
    var modal = document.createElement('div');
    modal.className = 'choix';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="choix__card" role="dialog" aria-modal="true">' +
        '<button class="choix__close" aria-label="Fermer">✕</button>' +
        '<p class="choix__label">Votre commande</p>' +
        '<h3 class="choix__nom"></h3>' +
        '<p class="choix__q">Quelle formule souhaitez-vous&nbsp;?</p>' +
        '<div class="choix__btns">' +
          '<button class="choix__opt" data-type="1"><span class="choix__lbl1"></span><strong class="choix__px1"></strong></button>' +
          '<button class="choix__opt choix__opt--menu" data-type="2"><span class="choix__lbl2"></span><strong class="choix__px2"></strong><em class="choix__note"></em></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    var elNom = modal.querySelector('.choix__nom');
    var elLbl1 = modal.querySelector('.choix__lbl1');
    var elLbl2 = modal.querySelector('.choix__lbl2');
    var elPx1 = modal.querySelector('.choix__px1');
    var elPx2 = modal.querySelector('.choix__px2');
    var elNote = modal.querySelector('.choix__note');
    var btn1 = modal.querySelector('[data-type="1"]');
    var btn2 = modal.querySelector('[data-type="2"]');
    var courant = {};

    var fermer = function () {
      modal.hidden = true;
      document.body.style.overflow = '';
    };
    modal.querySelector('.choix__close').addEventListener('click', fermer);
    modal.addEventListener('click', function (e) { if (e.target === modal) fermer(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) fermer();
    });

    btn1.addEventListener('click', function () {
      envoyerWA('Bonjour Melyza Tacos, je voudrais commander : ' + courant.nom +
                ' — ' + courant.lbl1 + ' (' + courant.px1 + ')');
      fermer();
    });
    btn2.addEventListener('click', function () {
      envoyerWA('Bonjour Melyza Tacos, je voudrais commander : ' + courant.nom +
                ' — ' + courant.lbl2 + ' (' + courant.px2 + ')');
      fermer();
    });

    // ouvre la fenêtre : deux formules avec leur libellé (Solo/Menu, Small/Méga...)
    var ouvrirChoix = function (nom, lbl1, px1, lbl2, px2, note) {
      courant = { nom: nom, lbl1: lbl1, px1: px1, lbl2: lbl2, px2: px2 };
      elNom.textContent = nom;
      elLbl1.textContent = lbl1;
      elPx1.textContent = px1;
      elLbl2.textContent = lbl2;
      elPx2.textContent = px2;
      elNote.textContent = note || '';
      elNote.style.display = note ? '' : 'none';
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    };

    var iconeWA =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">' +
      '<path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"/></svg>';

    plats.forEach(function (item) {
      var h3 = item.querySelector('h3');
      if (!h3) return;

      var nom = texteDirect(h3) || h3.textContent.trim();
      var prixEl = item.querySelector('.menu-item__price');
      var px1 = texteDirect(prixEl);
      var small = prixEl ? prixEl.querySelector('small') : null;
      // le 2e prix suit un préfixe "Menu :" ou "Méga :" -> on ne garde que le montant
      var px2 = small ? small.textContent.replace(/^[^:]*:\s*/, '').trim() : '';

      // libellés des deux formules (Solo/Menu par défaut, Small/Méga pour les pizzas)
      var lbl1 = prixEl && prixEl.dataset.opt1 ? prixEl.dataset.opt1 : 'Solo';
      var lbl2 = prixEl && prixEl.dataset.opt2 ? prixEl.dataset.opt2 : 'Menu';
      var note = (lbl2 === 'Menu') ? '+ frites & boisson' : '';

      item.classList.add('menu-item--commandable');
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('title', 'Commander « ' + nom +' » sur WhatsApp');

      var ic = document.createElement('span');
      ic.className = 'menu-item__wa';
      ic.innerHTML = iconeWA;
      item.appendChild(ic);

      var commander = function () {
        if (px2) {
          ouvrirChoix(nom, lbl1, px1, lbl2, px2, note);   // deux formules -> on demande
        } else {
          envoyerWA('Bonjour Melyza Tacos, je voudrais commander : ' + nom +
                    (px1 ? ' (' + px1 + ')' : ''));
        }
      };
      item.addEventListener('click', commander);
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commander(); }
      });
    });
  }
})();
