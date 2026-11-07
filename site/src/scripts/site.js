(function(){
  "use strict";

  /* ---------- дома: данные приходят из src/data/houses.json через <script id="houses-data"> ---------- */
  var HOUSES = JSON.parse(document.getElementById("houses-data").textContent);
  var WEEKDAY_DISCOUNT = 0.3; // −30% пн–пт, по брифу
  function priceWeekday(h){ return Math.round(h.priceWeekend * (1 - WEEKDAY_DISCOUNT) / 50) * 50; }
  function fmtRub(n){ return new Intl.NumberFormat("ru-RU").format(n) + " ₽"; }
  var AMENITY_ICON = {
    "Кухня и духовка":"icon-chef-hat","Стиральная машина":"icon-washing-machine",
    "Умная колонка":"icon-speaker-high","Проектор":"icon-projector-screen",
    "Телевизор":"icon-television","Инфракрасная сауна":"icon-fire"
  };

  function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e; }
  function svgUse(id){ return '<svg class="icon"><use href="#'+id+'"/></svg>'; }

  /* ---------- попап (единый шаблон, <dialog>) ---------- */
  var dialog = document.getElementById("houseDialog");
  var dClose = document.getElementById("dialogClose");
  document.addEventListener("click", function(e){
    var trigger = e.target.closest("[data-open-house]");
    if(trigger){
      var h = HOUSES.find(function(x){ return String(x.id)===trigger.getAttribute("data-open-house"); });
      if(!h) return;
      dialog.dataset.houseId = h.id;
      var dp = document.getElementById("dialogPhoto");
      dp.src = h.photo; dp.alt = h.name+" снаружи, вид с террасой";
      document.getElementById("dialogName").textContent = h.name;
      document.getElementById("dialogFacts").innerHTML =
        '<span class="chip">'+svgUse("icon-house")+h.area+'</span>' +
        '<span class="chip">'+svgUse("icon-users")+h.capacity+'</span>' +
        '<span class="chip">'+svgUse("icon-bed")+h.beds+'</span>';
      document.getElementById("dialogAmenities").innerHTML = h.amenities.map(function(a){
        return '<li>'+svgUse(AMENITY_ICON[a]||"icon-check")+a+'</li>';
      }).join("");
      document.getElementById("dialogPet").innerHTML = svgUse("icon-paw-print")+" "+h.pet;
      document.getElementById("dialogPrice").textContent = "от "+fmtRub(priceWeekday(h))+" / сутки";
      document.getElementById("dialogPriceNote").textContent = h.priceNote;
      dialog.showModal();
    }
  });
  dClose.addEventListener("click", function(){ dialog.close(); });
  dialog.addEventListener("click", function(e){ if(e.target===dialog) dialog.close(); });
  document.getElementById("dialogCta").addEventListener("click", function(){
    var id = dialog.dataset.houseId;
    dialog.close();
    window.dispatchEvent(new CustomEvent("ly:select-house", { detail:{ id:id } }));
    // переход по #booking выполнится как обычная ссылка следом
  });

  /* ---------- калькулятор предварительной стоимости (демо-цены) ---------- */
  (function(){
    var houseSel = document.getElementById("calc-house");
    var inEl = document.getElementById("calc-checkin");
    var outEl = document.getElementById("calc-checkout");
    var result = document.getElementById("calcResult");
    if(!houseSel) return;

    HOUSES.forEach(function(h){
      var opt = document.createElement("option");
      opt.value = h.id; opt.textContent = h.name + " — от " + fmtRub(priceWeekday(h)) + " / сутки";
      houseSel.appendChild(opt);
    });

    function toDate(str){
      if(!str) return null;
      var p = str.split("-");
      if(p.length!==3) return null;
      return new Date(Number(p[0]), Number(p[1])-1, Number(p[2]));
    }
    function fmtDate(d){
      return d.toLocaleDateString("ru-RU", { day:"numeric", month:"short" });
    }

    // по умолчанию — ближайшая пятница на 2 ночи (чтобы было что показать сразу)
    (function setDefaults(){
      var today = new Date();
      var d = new Date(today);
      while(d.getDay()!==5){ d.setDate(d.getDate()+1); } // 5 = пятница
      var out = new Date(d); out.setDate(out.getDate()+2);
      function iso(x){ return x.toISOString().slice(0,10); }
      inEl.value = iso(d); outEl.value = iso(out);
      inEl.min = iso(today); outEl.min = iso(new Date(d.getTime()+86400000));
    })();

    function recalc(){
      var h = HOUSES.find(function(x){ return String(x.id)===houseSel.value; });
      var ci = toDate(inEl.value), co = toDate(outEl.value);
      if(!h || !ci || !co){
        result.innerHTML = '<p class="form-note" style="margin:0">Выберите дом и&nbsp;даты, чтобы увидеть предварительную стоимость.</p>';
        return;
      }
      var nights = Math.round((co - ci) / 86400000);
      if(nights < 1){
        result.innerHTML = '<p class="calc-error" style="margin:0">Дата выезда должна быть позже даты заезда — минимум одна ночь.</p>';
        return;
      }
      outEl.min = (function(){ var m=new Date(ci); m.setDate(m.getDate()+1); return m.toISOString().slice(0,10); })();

      var weekdayNights = 0, weekendNights = 0;
      for(var i=0;i<nights;i++){
        var d = new Date(ci); d.setDate(d.getDate()+i);
        var dow = d.getDay(); // 0 вс .. 6 сб
        if(dow>=1 && dow<=5) weekdayNights++; else weekendNights++;
      }
      var weekdayPrice = priceWeekday(h);
      var total = weekdayNights*weekdayPrice + weekendNights*h.priceWeekend;

      var lines = "";
      if(weekdayNights>0){
        lines += '<div class="calc-line"><span>Будни ('+weekdayNights+' '+nightsWord(weekdayNights)+') × '+fmtRub(weekdayPrice)+'</span><span>'+fmtRub(weekdayNights*weekdayPrice)+'</span></div>';
      }
      if(weekendNights>0){
        lines += '<div class="calc-line"><span>Выходные ('+weekendNights+' '+nightsWord(weekendNights)+') × '+fmtRub(h.priceWeekend)+'</span><span>'+fmtRub(weekendNights*h.priceWeekend)+'</span></div>';
      }
      result.innerHTML =
        '<div class="calc-line"><span>'+h.name+', '+fmtDate(ci)+' — '+fmtDate(co)+'</span><span>'+nights+' '+nightsWord(nights)+'</span></div>' +
        lines +
        '<div class="calc-total"><span>Итого</span><span>'+fmtRub(total)+'</span></div>';
    }

    function nightsWord(n){
      var n10 = n%10, n100 = n%100;
      if(n100>=11 && n100<=14) return "ночей";
      if(n10===1) return "ночь";
      if(n10>=2 && n10<=4) return "ночи";
      return "ночей";
    }

    houseSel.addEventListener("change", recalc);
    inEl.addEventListener("change", recalc);
    outEl.addEventListener("change", recalc);
    window.addEventListener("ly:select-house", function(e){
      if(!e.detail || !e.detail.id) return;
      houseSel.value = e.detail.id;
      recalc();
    });
    recalc();
  })();

  /* ---------- юридические документы (общий попап-шаблон, текст — черновик) ---------- */
  var LEGAL_DOCS = {
    privacy: {
      title: "Политика обработки персональных данных",
      html:
        '<p style="color:var(--ink-soft);font-style:italic">Черновой текст для демонстрации сайта — перед запуском его нужно проверить с юристом и дополнить реквизитами. После переноса на&nbsp;админку этот документ редактируется там же, без участия разработчика.</p>' +
        '<h4>1. Общие положения</h4>' +
        '<p>Настоящая Политика определяет порядок обработки персональных данных посетителей сайта Little&nbsp;Yard (далее&nbsp;— «Сайт») и&nbsp;гостей, бронирующих дома. Используя Сайт и&nbsp;оставляя заявку на&nbsp;бронирование, вы&nbsp;соглашаетесь с&nbsp;условиями, изложенными ниже.</p>' +
        '<h4>2. Какие данные собираются</h4>' +
        '<p>Имя, номер телефона, выбранные даты и&nbsp;дом, комментарий к&nbsp;заявке (например, о&nbsp;животном) — то, что вы&nbsp;указываете в&nbsp;форме бронирования или форме обратной связи.</p>' +
        '<h4>3. Цели обработки</h4>' +
        '<p>Связь с&nbsp;вами для подтверждения бронирования, ответов на&nbsp;вопросы и&nbsp;согласования условий заезда — исключительно в&nbsp;этих целях.</p>' +
        '<h4>4. Передача третьим лицам</h4>' +
        '<p>Данные не&nbsp;передаются третьим лицам, за&nbsp;исключением случаев, предусмотренных законодательством РФ, или сервисов, напрямую обеспечивающих бронирование (например, сервис онлайн-оплаты, когда он&nbsp;будет подключён).</p>' +
        '<h4>5. Хранение и&nbsp;защита</h4>' +
        '<p>Данные хранятся в&nbsp;течение срока, необходимого для обработки заявки и&nbsp;последующей отчётности, и&nbsp;защищаются от&nbsp;несанкционированного доступа.</p>' +
        '<h4>6. Права пользователя</h4>' +
        '<p>Вы&nbsp;вправе запросить удаление или уточнение своих данных, написав на&nbsp;контакты, указанные в&nbsp;футере сайта.</p>' +
        '<h4>7. Контакты оператора</h4>' +
        '<p>Реквизиты оператора персональных данных будут указаны здесь после регистрации юридического лица/ИП.</p>'
    },
    offer: {
      title: "Договор публичной оферты",
      html:
        '<p style="color:var(--ink-soft);font-style:italic">Черновой текст для демонстрации сайта — перед запуском его нужно проверить с юристом и дополнить реквизитами. После переноса на&nbsp;админку этот документ редактируется там же, без участия разработчика.</p>' +
        '<h4>1. Общие положения</h4>' +
        '<p>Настоящий документ является публичной офертой Little&nbsp;Yard (далее&nbsp;— «Исполнитель») и&nbsp;содержит условия аренды домов, расположенных на&nbsp;территории комплекса. Оплата бронирования означает согласие гостя (далее&nbsp;— «Заказчик») со&nbsp;всеми условиями оферты.</p>' +
        '<h4>2. Предмет договора</h4>' +
        '<p>Исполнитель предоставляет Заказчику во&nbsp;временное пользование отдельный дом на&nbsp;выбранные даты, Заказчик обязуется оплатить проживание и&nbsp;соблюдать правила, указанные в&nbsp;разделе «Условия» на&nbsp;Сайте.</p>' +
        '<h4>3. Порядок бронирования и&nbsp;оплаты</h4>' +
        '<p>Бронирование считается подтверждённым после согласования дат и&nbsp;получения оплаты (или предоплаты) способом, указанным при&nbsp;оформлении заявки.</p>' +
        '<h4>4. Права и&nbsp;обязанности сторон</h4>' +
        '<p>Исполнитель обязуется предоставить дом в&nbsp;исправном состоянии к&nbsp;заезду. Заказчик обязуется соблюдать правила проживания и&nbsp;возместить ущерб имуществу, если он&nbsp;возник по&nbsp;его вине.</p>' +
        '<h4>5. Отмена и&nbsp;возврат средств</h4>' +
        '<p>Условия отмены бронирования и&nbsp;возврата оплаты будут уточнены здесь при&nbsp;подключении платёжного сервиса.</p>' +
        '<h4>6. Ответственность сторон</h4>' +
        '<p>Стороны несут ответственность в&nbsp;соответствии с&nbsp;действующим законодательством РФ.</p>' +
        '<h4>7. Реквизиты</h4>' +
        '<p>Реквизиты Исполнителя будут указаны здесь после регистрации юридического лица/ИП.</p>'
    }
  };
  (function(){
    var legalDialog = document.getElementById("legalDialog");
    var legalTitle = document.getElementById("legalTitle");
    var legalBody = document.getElementById("legalBody");
    var legalClose = document.getElementById("legalClose");
    if(!legalDialog) return;
    document.addEventListener("click", function(e){
      var t = e.target.closest("[data-legal]");
      if(t){
        e.preventDefault();
        var doc = LEGAL_DOCS[t.getAttribute("data-legal")];
        if(!doc) return;
        legalTitle.textContent = doc.title;
        legalBody.innerHTML = doc.html;
        legalDialog.showModal();
      }
      var s = e.target.closest("[data-social]");
      if(s && s.getAttribute("href")==="#"){ e.preventDefault(); }
    });
    legalClose.addEventListener("click", function(){ legalDialog.close(); });
    legalDialog.addEventListener("click", function(e){ if(e.target===legalDialog) legalDialog.close(); });
  })();

  /* ---------- мобильное меню ---------- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("primary-nav");
  var headerEl = document.querySelector("[data-header]");
  var headerRowEl = document.querySelector(".header-row");
  var syncMobileHeaderH = function(){
    // реальная высота "таблетки" шапки варьируется (отступы/скролл), поэтому полноэкранное
    // меню должно начинаться строго под ней, а не по захардкоженному значению
    if(headerRowEl){ document.documentElement.style.setProperty("--mobile-header-h", headerRowEl.offsetHeight + "px"); }
  };
  var closeNav = function(){
    nav.removeAttribute("data-open");
    navToggle.setAttribute("aria-expanded","false");
    if(headerEl){ headerEl.classList.remove("nav-open"); }
  };
  var openNav = function(){
    syncMobileHeaderH();
    nav.setAttribute("data-open","");
    navToggle.setAttribute("aria-expanded","true");
    // класс на шапке снимает backdrop-filter с таблетки, пока меню открыто (см. комментарий в CSS) —
    // ставим его через JS, а не :has(), чтобы не зависеть от поддержки :has() в мобильном браузере
    if(headerEl){ headerEl.classList.add("nav-open"); }
  };
  navToggle.addEventListener("click", function(){
    if(nav.hasAttribute("data-open")){ closeNav(); } else { openNav(); }
  });
  nav.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", closeNav);
  });

  /* ---------- шапка при скролле (плавающая поверх фото героя, сплошная после него) ---------- */
  var header = document.querySelector("[data-header]");
  var heroPhoto = document.querySelector(".hero .hero-photo");
  var getHeroThreshold = function(){ return heroPhoto ? Math.max(heroPhoto.offsetHeight - 80, 40) : 8; };
  var onScroll = function(){ header.classList.toggle("scrolled", window.scrollY > getHeroThreshold()); };
  document.addEventListener("scroll", onScroll, { passive:true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- форма ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    if(!form.checkValidity()){ form.reportValidity(); return; }
    form.querySelectorAll("input,textarea,button").forEach(function(f){ f.disabled = true; });
    status.innerHTML = svgUse("icon-check")+' <span class="form-success">Заявка отправлена — менеджер свяжется с вами.</span>';
    status.classList.add("form-success");
  });

  /* ============================================================
     Карта: домики и точки появляются по мере прокрутки блока —
     единственное место, где нужна именно scrub-анимация, привязанная
     к прокрутке самого блока (просьба клиента), поэтому она и дальше
     сделана на GSAP + ScrollTrigger (без платного ScrollSmoother и без
     полноэкранного скролл-джекинга — см. исходное обоснование ниже).
  ============================================================ */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!reduced && window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("gsap-on");

    var markers = gsap.utils.toArray(".map-marker");
    var mapTl = gsap.timeline({
      scrollTrigger: { trigger: "#mapWrap", start: "top 75%", end: "bottom 55%", scrub: .6 }
    });
    markers.forEach(function(m, i){
      mapTl.to(m, { opacity:1, y:0, scale:1, duration:.6, ease:"power2.out" }, i*0.35);
    });
  }

  /* ============================================================
     Мягкое появление контента при скролле + посимвольная анимация
     заголовков h1/h2. Сделано на чистом IntersectionObserver +
     CSS-transition (без GSAP) — так проще выдержать точные тайминги/
     easing по ТЗ, не тянуть платный SplitText и не зависеть от того,
     загрузился ли GSAP с CDN.

     Контент (.reveal): opacity 0→1 + blur(5px→0), 1000 мс,
     cubic-bezier(.165,.84,.44,1); фотографии дополнительно scale(1.03→1).

     Заголовки (.split-heading): текст разбит на слова (каждое — маска
     overflow:hidden, переносы строк и неразрывные пробелы между словами
     сохранены как обычные текстовые узлы) и символы внутри слова;
     символ: translateY(100%)+opacity:0+blur(5px) → исходное состояние,
     1600 мс, cubic-bezier(.19,1,.22,1), шаг 50 мс — отсчёт свой в каждом
     слове, слова стартуют одновременно. Полный текст заголовка остаётся
     доступен скринридеру через aria-label, декоративные span'ы скрыты
     aria-hidden. Заголовки нигде не вложены в блюрящийся .reveal-родитель
     (см. правки разметки в hero/интро/будни) — блюр контента и заголовка
     не смешиваются.

     Запуск — как только видно 25% элемента, либо (доп. условие для
     блоков выше экрана) когда верх элемента достиг 80% высоты viewport —
     смотря что раньше; оба случая реализованы двумя IntersectionObserver
     (стандартный threshold и rootMargin, сокращающий область снизу на
     20%), каждый наблюдает элемент постоянно (без unobserve), так что
     анимация повторяется при каждом новом входе в зону — как при скролле
     вниз, так и при скролле обратно вверх к уже виденному блоку.
     IntersectionObserver сам сообщает исходное состояние при вызове
     observe() — поэтому то, что уже в зоне запуска при загрузке,
     анимируется сразу, без отдельного кода. Ждём document.fonts.ready
     перед разбивкой/измерением,
     чтобы метрики текста были финальными. Без JS или при
     prefers-reduced-motion класс js-anim не добавляется — весь текст
     и фото остаются видны как обычно. */
  if(!reduced && "IntersectionObserver" in window){
    var startContentAnim = function(){
      document.documentElement.classList.add("js-anim");

      /* ---- заголовки: слова-маски + посимвольный сдвиг снизу ---- */
      var headings = Array.prototype.slice.call(document.querySelectorAll("h1, h2"));
      headings.forEach(function(h){
        var text = h.textContent;
        h.setAttribute("aria-label", text.replace(/ /g, " "));
        h.classList.add("split-heading");
        h.textContent = "";
        var tokens = text.match(/\s+|\S+/g) || [];
        tokens.forEach(function(tok){
          if(/^\s/.test(tok)){
            h.appendChild(document.createTextNode(tok));
            return;
          }
          var word = document.createElement("span");
          word.className = "word";
          word.setAttribute("aria-hidden", "true");
          Array.from(tok).forEach(function(ch, i){
            var charSpan = document.createElement("span");
            charSpan.className = "char";
            charSpan.style.transitionDelay = (i * 50) + "ms";
            charSpan.textContent = ch;
            word.appendChild(charSpan);
          });
          h.appendChild(word);
        });
      });

      /* ---- контентные блоки ---- */
      var contentEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal], .house-card"));
      contentEls.forEach(function(e){ e.classList.add("reveal"); });

      var targets = headings.concat(contentEls);
      /* состояние каждого элемента по каждому из двух триггеров — элемент
         считается в зоне показа, пока активен хотя бы один из них;
         анимация повторяется при каждом новом входе в зону (а не один раз
         за всё время), поэтому класс снимается при выходе из обеих зон */
      var zoneState = new WeakMap();

      function updateReveal(elm){
        var s = zoneState.get(elm) || { z25:false, z80:false };
        elm.classList.toggle("is-revealed", s.z25 || s.z80);
      }

      /* триггер №1: видно 25% элемента */
      var io25 = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          var s = zoneState.get(entry.target) || { z25:false, z80:false };
          s.z25 = entry.isIntersecting;
          zoneState.set(entry.target, s);
          updateReveal(entry.target);
        });
      }, { threshold: 0.25 });

      /* триггер №2 (доп., для элементов выше экрана): верх достиг 80%
         высоты viewport — зона наблюдения снизу сокращена на 20% */
      var io80 = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          var s = zoneState.get(entry.target) || { z25:false, z80:false };
          s.z80 = entry.isIntersecting;
          zoneState.set(entry.target, s);
          updateReveal(entry.target);
        });
      }, { threshold: 0, rootMargin: "0px 0px -20% 0px" });

      targets.forEach(function(t){ io25.observe(t); io80.observe(t); });
    };

    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(startContentAnim).catch(startContentAnim);
    } else {
      startContentAnim();
    }
  }
})();