/* Penhale Garage – site script (vanilla, no dependencies). */
(function () {
  "use strict";

  var doc = document;

  /* 1. Local preview: when opened from disk (file://), folder links like
        "mot/" don't open index.html automatically, so add it. */
  if (location.protocol === "file:") {
    var links = doc.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute("href");
      if (/^(https?:|mailto:|tel:|#|\/)/.test(h)) continue;
      var parts = h.split("#");
      if (parts[0] === "" ) continue;
      if (/\/$/.test(parts[0]) || parts[0] === "." || parts[0] === "..") {
        parts[0] = parts[0].replace(/\/?$/, "/") + "index.html";
        links[i].setAttribute("href", parts.join("#"));
      }
    }
    // Same for GET forms that point at a folder (the number plate box)
    var getForms = doc.querySelectorAll('form[method="get"]');
    for (var g = 0; g < getForms.length; g++) {
      var act = getForms[g].getAttribute("action").split("#");
      if (/\/$/.test(act[0])) {
        act[0] += "index.html";
        getForms[g].setAttribute("action", act.join("#"));
      }
    }
  }

  /* 1b. Header firms up once the page scrolls */
  var siteHeader = doc.querySelector(".site-header");
  if (siteHeader) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* 1c. Number plate inputs: capitals, letters, numbers and spaces only */
  function tidyReg(v) {
    return String(v || "").toUpperCase().replace(/[^A-Z0-9 ]/g, "").replace(/\s+/g, " ").slice(0, 8);
  }
  var plates = doc.querySelectorAll("#plate, #f-reg");
  for (var pl = 0; pl < plates.length; pl++) {
    plates[pl].addEventListener("input", function () {
      var t = tidyReg(this.value);
      if (t !== this.value) this.value = t;
    });
  }

  /* 2. Navigation: mobile menu + dropdown disclosures */
  var toggle = doc.querySelector(".menu-toggle");
  var nav = doc.getElementById("site-nav");
  var subs = doc.querySelectorAll(".sub-toggle");

  function closeSubs(except) {
    for (var j = 0; j < subs.length; j++) {
      if (subs[j] === except) continue;
      subs[j].setAttribute("aria-expanded", "false");
      doc.getElementById(subs[j].getAttribute("aria-controls")).classList.remove("is-open");
    }
  }
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("is-open", open);
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
  }
  for (var k = 0; k < subs.length; k++) {
    subs[k].addEventListener("click", function () {
      var open = this.getAttribute("aria-expanded") !== "true";
      closeSubs(this);
      this.setAttribute("aria-expanded", open ? "true" : "false");
      doc.getElementById(this.getAttribute("aria-controls")).classList.toggle("is-open", open);
    });
  }
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openSub = doc.querySelector('.sub-toggle[aria-expanded="true"]');
    if (openSub) { closeSubs(); openSub.focus(); return; }
    if (toggle && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); }
  });
  doc.addEventListener("click", function (e) {
    if (!e.target.closest(".has-sub")) closeSubs();
  });

  /* 3. Opening hours: highlight today and show live open/closed status.
        Times are UK time. Saturday is unconfirmed, so we don't guess. */
  var HOURS = { 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [8, 18], 6: "check", 0: null };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function ukNow() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London", weekday: "long", hour: "numeric", minute: "numeric", hour12: false
      }).formatToParts(new Date());
      var o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      return { day: DAYS.indexOf(o.weekday), mins: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (err) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function nextOpening(day) {
    for (var n = 1; n <= 7; n++) {
      var d = (day + n) % 7;
      if (Array.isArray(HOURS[d])) return (n === 1 ? "tomorrow" : DAYS[d]) + " at " + pad(HOURS[d][0]) + ":00";
    }
    return "";
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var now = ukNow();
  var rows = doc.querySelectorAll(".hours tr[data-day]");
  for (var r = 0; r < rows.length; r++) {
    if (parseInt(rows[r].getAttribute("data-day"), 10) === now.day) rows[r].classList.add("is-today");
  }
  var statuses = doc.querySelectorAll("[data-status]");
  if (statuses.length) {
    var h = HOURS[now.day], state = "closed", text;
    if (h === "check") {
      state = "unknown";
      text = "Saturday hours: please call to check";
    } else if (Array.isArray(h) && now.mins >= h[0] * 60 && now.mins < h[1] * 60) {
      state = "open";
      text = "Open now, until " + pad(h[1]) + ":00";
    } else if (Array.isArray(h) && now.mins < h[0] * 60) {
      text = "Closed now, opens today at " + pad(h[0]) + ":00";
    } else {
      text = "Closed now, opens " + nextOpening(now.day);
    }
    for (var s = 0; s < statuses.length; s++) {
      statuses[s].setAttribute("data-state", state);
      statuses[s].querySelector(".status-text").textContent = text;
    }
  }

  /* 4. Google Map: only load when asked (privacy + speed) */
  var mapBtn = doc.querySelector("[data-load-map]");
  if (mapBtn) {
    mapBtn.addEventListener("click", function () {
      var box = mapBtn.closest(".map");
      var f = doc.createElement("iframe");
      f.src = mapBtn.getAttribute("data-load-map");
      f.title = "Map showing Penhale Garage, New Rd, Fraddon";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      box.innerHTML = "";
      box.appendChild(f);
    });
  }

  /* 5. Cookie consent: Google Tag Manager and Google Analytics (existing
        site tags) load only after the visitor accepts. */
  var KEY = "pg-consent";
  var banner = doc.getElementById("consent");
  function store(v) { try { localStorage.setItem(KEY, v); } catch (err) { /* storage blocked */ } }
  function read() { try { return localStorage.getItem(KEY); } catch (err) { return null; } }
  var loaded = false;
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    // Existing Universal Analytics property (kept as found on the old site)
    var ua = doc.createElement("script");
    ua.async = true;
    ua.src = "https://www.googletagmanager.com/gtag/js?id=UA-110876202-49";
    doc.head.appendChild(ua);
    window.gtag("js", new Date());
    window.gtag("config", "UA-110876202-49");
    // Existing Google Tag Manager container
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var gtm = doc.createElement("script");
    gtm.async = true;
    gtm.src = "https://www.googletagmanager.com/gtm.js?id=GTM-KFRXPGQN";
    doc.head.appendChild(gtm);
  }
  function showBanner() { if (banner) banner.hidden = false; }
  if (read() === "granted") loadAnalytics();
  else if (read() !== "denied") showBanner();
  if (banner) {
    banner.querySelector("[data-consent=accept]").addEventListener("click", function () {
      store("granted"); banner.hidden = true; loadAnalytics();
    });
    banner.querySelector("[data-consent=reject]").addEventListener("click", function () {
      store("denied"); banner.hidden = true;
    });
  }
  var manage = doc.querySelectorAll("[data-consent=manage]");
  for (var m = 0; m < manage.length; m++) {
    manage[m].addEventListener("click", function () {
      // Choosing "Reject" here stops analytics from the next page load.
      showBanner();
      banner.querySelector("button").focus();
    });
  }


  /* 7. Scroll reveals: dashboard "ignition check", route drawing, ticks */
  var reveals = doc.querySelectorAll("[data-reveal]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || reduce) {
    for (var rv = 0; rv < reveals.length; rv++) reveals[rv].classList.add("is-visible");
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    for (var ro = 0; ro < reveals.length; ro++) io.observe(reveals[ro]);
  }

  /* 8. Warning-light dashboard: one light selected at a time */
  var dashes = doc.querySelectorAll(".dash");
  for (var dsh = 0; dsh < dashes.length; dsh++) {
    (function (dash) {
      var buttons = dash.querySelectorAll(".dash-light");
      var details = dash.querySelectorAll(".dash-detail");
      function select(btn) {
        for (var b = 0; b < buttons.length; b++) buttons[b].setAttribute("aria-pressed", buttons[b] === btn ? "true" : "false");
        for (var d = 0; d < details.length; d++) details[d].hidden = details[d].id !== btn.getAttribute("data-light");
      }
      for (var b = 0; b < buttons.length; b++) {
        buttons[b].addEventListener("click", function () { select(this); });
      }
      if (buttons.length) select(buttons[0]);
    })(dashes[dsh]);
  }

  /* 9. MOT reminder: builds a calendar event on the device, nothing is sent */
  var motForm = doc.getElementById("mot-form");
  if (motForm) {
    var motStatus = doc.getElementById("mot-status");
    var motDate = doc.getElementById("mot-date");
    var which = "ics";
    var calBtns = motForm.querySelectorAll("[data-cal]");
    for (var cb = 0; cb < calBtns.length; cb++) {
      calBtns[cb].addEventListener("click", function () { which = this.getAttribute("data-cal"); });
    }
    var ymd = function (d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); };
    var nice = function (d) { return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); };
    motForm.addEventListener("submit", function (e) {
      e.preventDefault();
      motStatus.removeAttribute("data-kind");
      var parts = (motDate.value || "").split("-");
      if (parts.length !== 3) {
        motStatus.dataset.kind = "error";
        motStatus.textContent = "Enter your MOT expiry date first.";
        motDate.focus();
        return;
      }
      var y = +parts[0], m = +parts[1] - 1, day = +parts[2];
      var expiry = new Date(y, m, day);
      var today = new Date(); today.setHours(0, 0, 0, 0);
      if (expiry < today) {
        motStatus.dataset.kind = "error";
        motStatus.textContent = "That date has passed, so your MOT may have run out. Call us on 01726 861 338 to book.";
        return;
      }
      // Earliest MOT that keeps the renewal date: one month (minus a day) before expiry
      var lastDay = new Date(y, m, 0).getDate();
      var remind = new Date(y, m - 1, Math.min(day, lastDay));
      remind.setDate(remind.getDate() + 1);
      if (remind < today) remind = today;
      var next = new Date(remind); next.setDate(next.getDate() + 1);
      var title = "Book MOT at Penhale Garage";
      var details = "Your MOT runs out on " + nice(expiry) + ". Call Penhale Garage on 01726 861 338 to book. New Rd, Fraddon, St. Columb TR9 6NA.";
      if (which === "google") {
        var g = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
          "&text=" + encodeURIComponent(title) +
          "&dates=" + ymd(remind) + "/" + ymd(next) +
          "&details=" + encodeURIComponent(details) +
          "&location=" + encodeURIComponent("Penhale Garage, New Rd, Fraddon, TR9 6NA");
        window.open(g, "_blank", "noopener");
      } else {
        var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
        var ics = [
          "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Penhale Garage//MOT reminder//EN", "CALSCALE:GREGORIAN",
          "BEGIN:VEVENT",
          "UID:mot-" + ymd(expiry) + "-" + Date.now() + "@penhalegarage.co.uk",
          "DTSTAMP:" + stamp,
          "DTSTART;VALUE=DATE:" + ymd(remind),
          "DTEND;VALUE=DATE:" + ymd(next),
          "SUMMARY:" + title,
          "DESCRIPTION:" + details.replace(/,/g, "\\,"),
          "LOCATION:Penhale Garage\\, New Rd\\, Fraddon\\, TR9 6NA",
          "BEGIN:VALARM", "TRIGGER:PT9H", "ACTION:DISPLAY", "DESCRIPTION:" + title, "END:VALARM",
          "END:VEVENT", "END:VCALENDAR"
        ].join("\r\n");
        var a = doc.createElement("a");
        a.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
        a.download = "penhale-garage-mot-reminder.ics";
        doc.body.appendChild(a); a.click(); a.remove();
      }
      motStatus.textContent = "Reminder set for " + nice(remind) + ". Your MOT runs out on " + nice(expiry) + ".";
    });
  }

  /* 6. Contact form: send with fetch when possible, show a clear result. */
  var form = doc.getElementById("contact-form");
  if (form) {
    var status = doc.getElementById("form-status");
    var phoneMsg = " Please call 01726 861 338 or email penhalegarage@outlook.com instead.";
    var params = new URLSearchParams(location.search);
    if (params.get("sent") === "1") {
      status.dataset.kind = "ok";
      status.textContent = "Message sent. Thank you – we'll get back to you as soon as we can.";
    }
    if (location.protocol === "file:") {
      status.dataset.kind = "info";
      status.textContent = "Preview mode: this form only sends once the site is uploaded to a web server with PHP." + phoneMsg;
    }
    // Registration carried over from the number plate box on the home page
    var regField = doc.getElementById("f-reg");
    var regParam = tidyReg(params.get("reg")).trim();
    if (regField && regParam) {
      regField.value = regParam;
      if (location.protocol !== "file:") {
        status.dataset.kind = "info";
        status.textContent = "Thanks – we've added " + regParam + " to the form. Add your details and we'll get back to you to book it in.";
      }
    }
    var started = doc.getElementById("form-started");
    if (started) started.value = String(Math.floor(Date.now() / 1000));

    form.addEventListener("submit", function (e) {
      // Client-side checks with clear messages
      var bad = null;
      var fields = form.querySelectorAll("[required]");
      for (var q = 0; q < fields.length; q++) {
        var f = fields[q], err = doc.getElementById(f.id + "-error"), ok = f.checkValidity();
        f.setAttribute("aria-invalid", ok ? "false" : "true");
        if (err) err.hidden = ok;
        if (!ok && !bad) bad = f;
      }
      if (bad) { e.preventDefault(); bad.focus(); return; }
      if (location.protocol === "file:") { e.preventDefault(); return; }
      if (!window.fetch || !window.FormData) return; // plain POST fallback

      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      status.dataset.kind = "info";
      status.textContent = "Sending your message…";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.ok) {
            form.reset();
            status.dataset.kind = "ok";
            status.textContent = "Message sent. Thank you – we'll get back to you as soon as we can.";
          } else {
            status.dataset.kind = "error";
            status.textContent = ((data && data.error) || "Your message couldn't be sent.") + phoneMsg;
          }
        })
        .catch(function () {
          status.dataset.kind = "error";
          status.textContent = "Your message couldn't be sent." + phoneMsg;
        })
        .then(function () { btn.disabled = false; status.focus(); });
    });
  }
})();
