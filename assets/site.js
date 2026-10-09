// Maré Alta · comportamento do site (cabeçalho, menu, fotos)
(function () {
  document.documentElement.classList.remove('no-js');

  // Cabeçalho fica sólido ao rolar
  var head = document.querySelector('.site-head');
  if (head && !head.classList.contains('always')) {
    var onScroll = function () { head.classList.toggle('solid', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Menu do celular
  var drawer = document.getElementById('drawer');
  document.querySelectorAll('[data-menu]').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('data-menu') === 'open';
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) drawer.querySelector('[data-menu="close"]').focus();
    });
  });
  if (drawer) drawer.querySelectorAll('nav a').forEach(function (a) {
    a.addEventListener('click', function () { drawer.classList.remove('open'); document.body.style.overflow = ''; });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      drawer.classList.remove('open'); document.body.style.overflow = '';
    }
  });

  // Surgir ao rolar
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // Setas das faixas de fotos
  document.querySelectorAll('[data-rail]').forEach(function (b) {
    b.addEventListener('click', function () {
      var rail = document.getElementById(b.getAttribute('data-rail'));
      rail.scrollBy({ left: rail.clientWidth * 0.8 * Number(b.getAttribute('data-dir')), behavior: 'smooth' });
    });
  });

  // Subabas: marca a seção visível
  var sub = document.querySelector('.tabs.sub');
  if (sub && 'IntersectionObserver' in window) {
    var links = {};
    sub.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        for (var k in links) links[k].classList.toggle('on', k === e.target.id);
        var a = links[e.target.id];
        a.parentNode.scrollTo({ left: a.offsetLeft - 20, behavior: 'smooth' });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(links).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  // Visualizador de fotos
  var groups = {};
  document.querySelectorAll('[data-lb]').forEach(function (a) {
    var g = a.getAttribute('data-lb');
    (groups[g] = groups[g] || []).push(a);
  });
  if (!Object.keys(groups).length) return;
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Fotos');
  lb.innerHTML = '<img alt=""><div class="cap"></div>' +
    '<button class="x" aria-label="Fechar">×</button>' +
    '<button class="prev" aria-label="Foto anterior">‹</button>' +
    '<button class="next" aria-label="Próxima foto">›</button>';
  document.body.appendChild(lb);
  var img = lb.querySelector('img'), cap = lb.querySelector('.cap'), cur = [], idx = 0, last = null;
  function show(i) {
    idx = (i + cur.length) % cur.length;
    var a = cur[idx], t = a.querySelector('img');
    img.src = a.getAttribute('href');
    img.alt = t ? t.alt : '';
    cap.textContent = (t ? t.alt : '') + '  ·  ' + (idx + 1) + ' de ' + cur.length;
  }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; if (last) last.focus(); }
  Object.keys(groups).forEach(function (g) {
    groups[g].forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault(); last = a; cur = groups[g]; show(i);
        lb.classList.add('open'); document.body.style.overflow = 'hidden';
        lb.querySelector('.x').focus();
      });
    });
  });
  lb.querySelector('.x').addEventListener('click', close);
  lb.querySelector('.prev').addEventListener('click', function () { show(idx - 1); });
  lb.querySelector('.next').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
