
  /* ============================================================
     Календарь занятости и приём заявок.
     Данные (дома + заявки) приходят из JSON-островков в разметке, поэтому
     календарь и калькулятор всегда видят один и тот же список заявок.
  ============================================================ */
  (function(){
    var housesIsland = document.getElementById("houses-data");
    var bookingsIsland = document.getElementById("bookings-data");
    var monthsEl = document.getElementById("calendarMonths");
    var hintEl = document.getElementById("calendarHint");
    var houseSel = document.getElementById("calc-house");
    var inEl = document.getElementById("calc-checkin");
    var outEl = document.getElementById("calc-checkout");
    var form = document.getElementById("contactForm");
    var formStatus = document.getElementById("formStatus");

    if(!housesIsland || !monthsEl || !houseSel) return;

    var HOUSES = JSON.parse(housesIsland.textContent || "[]");

    function svgUse(id){ return '<svg class="icon"><use href="#' + id + '"/></svg>'; }
    var BOOKINGS = bookingsIsland ? JSON.parse(bookingsIsland.textContent || "[]") : [];

    /* --- те же правила, что и на сервере (functions/_lib/booking-core.js) --- */
    function parseISO(iso){
      var m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
      if(!m) return null;
      var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return isNaN(d) ? null : d;
    }
    function addDays(d, days){
      var copy = new Date(d);
      copy.setDate(copy.getDate() + days);
      return copy;
    }
    function toISO(d){
      function p(n){ return String(n).padStart(2, "0"); }
      return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
    }
    function eachNight(from, to){
      var start = parseISO(from), end = parseISO(to), out = [];
      if(!start || !end) return out;
      for(var d = new Date(start); d < end; d.setDate(d.getDate() + 1)) out.push(toISO(d));
      return out;
    }
    function activeFor(slug){
      return BOOKINGS.filter(function(b){
        return b.house === slug && (b.status === "new" || b.status === "confirmed");
      });
    }
    function availabilityFor(slug){
      var map = {};
      activeFor(slug).forEach(function(b){
        var state = b.status === "confirmed" ? "booked" : "pending";
        eachNight(b.checkin, b.checkout).forEach(function(night){
          if(map[night] !== "booked") map[night] = state;
        });
      });
      return map;
    }
    function overlaps(from, to, b){
      var a1 = parseISO(from), a2 = parseISO(to), b1 = parseISO(b.checkin), b2 = parseISO(b.checkout);
      return !!(a1 && a2 && b1 && b2 && a1 < b2 && b1 < a2);
    }
    function hasConflict(slug, from, to){
      return activeFor(slug).some(function(b){ return overlaps(from, to, b); });
    }
    function currentHouse(){
      return HOUSES.filter(function(h){ return String(h.id) === String(houseSel.value); })[0] || HOUSES[0];
    }

    /* --- состояние выбора --- */
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var todayISO = toISO(today);
    var cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    var selection = { from: "", to: "" };

    function monthTitle(date){
      var months = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
      return months[date.getMonth()] + " " + date.getFullYear();
    }

    function buildMonth(date, availability){
      var year = date.getFullYear(), month = date.getMonth();
      var first = new Date(year, month, 1);
      var startDow = (first.getDay() + 6) % 7; // понедельник — первый
      var daysInMonth = new Date(year, month + 1, 0).getDate();

      var wrap = document.createElement("div");
      wrap.className = "cal-month";

      var title = document.createElement("h4");
      title.textContent = monthTitle(date);
      wrap.appendChild(title);

      var grid = document.createElement("div");
      grid.className = "cal-grid";
      ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].forEach(function(dow){
        var cell = document.createElement("div");
        cell.className = "cal-dow";
        cell.textContent = dow;
        grid.appendChild(cell);
      });

      for(var i = 0; i < startDow; i++){
        var empty = document.createElement("div");
        empty.className = "cal-day is-empty";
        grid.appendChild(empty);
      }

      for(var day = 1; day <= daysInMonth; day++){
        var iso = toISO(new Date(year, month, day));
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cal-day";
        btn.textContent = String(day);
        btn.dataset.date = iso;

        var state = availability[iso];
        if(iso < todayISO){ btn.classList.add("is-past"); btn.disabled = true; }
        if(state === "booked"){ btn.classList.add("is-booked"); btn.disabled = true; }
        if(state === "pending"){ btn.classList.add("is-pending"); btn.disabled = true; }

        if(selection.from === iso) btn.classList.add("is-checkin");
        if(selection.to === iso) btn.classList.add("is-checkout");
        if(selection.from && selection.to && iso > selection.from && iso < selection.to){
          btn.classList.add("is-range");
        }
        if(state === "booked") btn.title = "Занято подтверждённой бронью";
        if(state === "pending") btn.title = "Есть заявка, ждёт подтверждения";

        grid.appendChild(btn);
      }

      wrap.appendChild(grid);
      return wrap;
    }

    function render(){
      var house = currentHouse();
      if(!house) return;
      var availability = availabilityFor(house.slug);
      monthsEl.innerHTML = "";
      monthsEl.appendChild(buildMonth(cursor, availability));
      var next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      monthsEl.appendChild(buildMonth(next, availability));
    }

    function setHint(text, isError){
      if(!hintEl) return;
      hintEl.textContent = text;
      hintEl.classList.toggle("is-error", !!isError);
    }

    function syncInputs(){
      if(inEl) inEl.value = selection.from || "";
      if(outEl) outEl.value = selection.to || "";
      // калькулятор слушает change — даём ему пересчитать
      if(outEl) outEl.dispatchEvent(new Event("change"));
      if(inEl) inEl.dispatchEvent(new Event("change"));
    }

    function choose(iso){
      var house = currentHouse();
      if(!house) return;

      var restarted = !selection.from || (selection.from && selection.to);
      if(restarted){
        selection = { from: iso, to: "" };
        setHint("Заезд: " + iso + ". Теперь выберите день выезда.");
      } else if(iso > selection.from){
        if(hasConflict(house.slug, selection.from, iso)){
          setHint("В выбранном промежутке есть занятые дни — начните заново.", true);
          selection = { from: iso, to: "" };
        } else {
          selection.to = iso;
          var nights = eachNight(selection.from, selection.to).length;
          setHint("Выбрано " + nights + " " + (nights === 1 ? "ночь" : nights < 5 ? "ночи" : "ночей") + ": " + selection.from + " → " + selection.to + ".");
        }
      } else {
        selection = { from: iso, to: "" };
        setHint("Заезд: " + iso + ". Теперь выберите день выезда.");
      }

      syncInputs();
      render();
    }

    monthsEl.addEventListener("click", function(e){
      var btn = e.target.closest(".cal-day");
      if(!btn || btn.disabled || !btn.dataset.date) return;
      choose(btn.dataset.date);
    });

    houseSel.addEventListener("change", function(){
      selection = { from: "", to: "" };
      render();
      ensureFreeRange();
    });

    // Поля дат могут менять вручную — держим календарь в согласии с ними.
    function readInputs(){
      var from = inEl ? inEl.value : "";
      var to = outEl ? outEl.value : "";
      selection = { from: parseISO(from) ? from : "", to: parseISO(to) ? to : "" };
      render();
    }
    if(inEl) inEl.addEventListener("change", readInputs);
    if(outEl) outEl.addEventListener("change", readInputs);

    /* Если стартовые даты калькулятора попадают на занятые — сдвигаем их на
       ближайшее свободное окно той же длины. Иначе человек видит «доступную»
       цену на даты, которые на самом деле заняты. */
    function ensureFreeRange(){
      var house = currentHouse();
      if(!house || !inEl || !outEl) return;
      var from = inEl.value, to = outEl.value;
      if(!parseISO(from) || !parseISO(to)) return;
      if(!hasConflict(house.slug, from, to)) return;

      var nights = Math.max(2, eachNight(from, to).length);
      var startDate = parseISO(from);

      function tryRange(start){
        var candidateFrom = toISO(start);
        var candidateTo = toISO(addDays(start, nights));
        if(hasConflict(house.slug, candidateFrom, candidateTo)) return false;
        selection = { from: candidateFrom, to: candidateTo };
        syncInputs();
        render();
        return true;
      }

      // Сначала тот же день недели (пятница остаётся пятницей), потом ежедневно.
      for(var week = 1; week <= 12; week++){
        if(tryRange(addDays(startDate, week * 7))) return;
      }
      for(var day = 1; day < 365; day++){
        if(tryRange(addDays(parseISO(todayISO), day))) return;
      }
    }

    function syncFromInputsAndFix(){
      readInputs();
      ensureFreeRange();
    }
    // Модули грузятся в разном порядке: калькулятор выставляет даты по
    // умолчанию в своём скрипте, поэтому повторяем синхронизацию после load.
    window.addEventListener("load", syncFromInputsAndFix);
    syncFromInputsAndFix();

    /* --- отправка заявки --- */
    if(!form) return;

    function fieldValue(id){ var el = document.getElementById(id); return el ? el.value : ""; }

    function setFormState(state, message){
      if(!formStatus) return;
      formStatus.className = "form-note " + (state === "error" ? "is-error" : state === "success" ? "form-success" : "");
      formStatus.innerHTML = message;
    }

    form.addEventListener("submit", function(e){
      e.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }

      var house = currentHouse();
      var payload = {
        house: house ? house.slug : "",
        checkin: inEl ? inEl.value : "",
        checkout: outEl ? outEl.value : "",
        name: fieldValue("f-name"),
        phone: fieldValue("f-phone"),
        comment: fieldValue("f-comment"),
        pet: !!(document.getElementById("f-pet") && document.getElementById("f-pet").checked)
      };

      if(!payload.checkin || !payload.checkout){
        setFormState("error", "Выберите даты заезда и выезда — в календаре или в полях.");
        return;
      }
      if(house && hasConflict(house.slug, payload.checkin, payload.checkout)){
        setFormState("error", "Эти даты уже заняты. Выберите другие.");
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var fields = Array.prototype.slice.call(form.querySelectorAll("input,textarea,button"));
      fields.forEach(function(f){ f.disabled = true; });
      setFormState("", "Отправляем заявку…");

      fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function(r){ return r.json().then(function(data){ return { status: r.status, data: data }; }); })
        .then(function(result){
          if(!result.data || !result.data.ok){
            var errors = (result.data && result.data.errors) || ["Не удалось отправить заявку."];
            setFormState("error", svgUse("icon-x") + " <span>" + errors.join(" ") + "</span>");
            fields.forEach(function(f){ f.disabled = false; });
            return;
          }
          var b = result.data.booking || {};
          setFormState("success", svgUse("icon-check") + " <span>Заявка " + (b.id || "") + " принята. Менеджер подтвердит даты и свяжется с вами.</span>");
          form.reset();
          fields.forEach(function(f){ f.disabled = false; });

          // Показываем свои даты сразу, не дожидаясь пересборки страницы.
          BOOKINGS.push({
            id: b.id, house: payload.house, checkin: b.checkin || payload.checkin,
            checkout: b.checkout || payload.checkout, status: "new"
          });
          selection = { from: "", to: "" };
          render();
        })
        .catch(function(){
          setFormState("error", "Сеть недоступна — попробуйте ещё раз или позвоните нам.");
          fields.forEach(function(f){ f.disabled = false; });
        });
    });
  })();
