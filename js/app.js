/* zalgo-text.org — UI wiring */
(function () {
  "use strict";
  var TX = window.TX;
  function $(id) { return document.getElementById(id); }

  /* ---------- toast + copy ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.id = "toast"; document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove("show"); }, 1600);
  }
  function copy(text, btn) {
    if (!text) { toast("Nothing to copy yet"); return; }
    var done = function () {
      toast("Copied!");
      if (btn) { btn.classList.add("copied"); var old = btn.textContent; btn.textContent = "Copied";
        setTimeout(function () { btn.classList.remove("copied"); btn.textContent = old; }, 1300); }
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { legacy(text, done); });
    } else { legacy(text, done); }
  }
  function legacy(text, done) {
    var t = document.createElement("textarea");
    t.value = text; t.setAttribute("readonly", "");
    t.style.position = "fixed"; t.style.top = "-1000px";
    document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); done(); } catch (e) { toast("Press Ctrl+C to copy"); }
    document.body.removeChild(t);
  }
  window.copyText = copy;

  /* ---------- menu ---------- */
  var mb = $("menuBtn"), nl = $("navLinks");
  if (mb) mb.addEventListener("click", function () {
    var o = nl.classList.toggle("open"); mb.setAttribute("aria-expanded", o);
  });

  /* ---------- ZALGO tool ---------- */
  (function () {
    var inp = $("zIn"); if (!inp) return;
    var out = $("zOut"), lvl = $("zLevel"), lvlV = $("zLevelVal");
    var up = $("zUp"), mid = $("zMid"), dn = $("zDown");
    function run() {
      var parts = { up: !up || up.checked, mid: !mid || mid.checked, down: !dn || dn.checked };
      out.value = TX.zalgo(inp.value, lvl ? +lvl.value : 30, parts);
    }
    inp.addEventListener("input", run);
    [up, mid, dn].forEach(function (e) { if (e) e.addEventListener("change", run); });
    if (lvl) lvl.addEventListener("input", function () { if (lvlV) lvlV.textContent = lvl.value; run(); });
    if ($("zCopy")) $("zCopy").addEventListener("click", function () { copy(out.value, this); });
    if ($("zAgain")) $("zAgain").addEventListener("click", run);
    if ($("zClear")) $("zClear").addEventListener("click", function () { inp.value = ""; out.value = ""; inp.focus(); });
    if (lvlV && lvl) lvlV.textContent = lvl.value;
    run();
  })();

  /* ---------- UNZALGO tool ---------- */
  (function () {
    var inp = $("uIn"); if (!inp) return;
    var out = $("uOut");
    function run() { out.value = TX.clean(inp.value); }
    inp.addEventListener("input", run);
    if ($("uCopy")) $("uCopy").addEventListener("click", function () { copy(out.value, this); });
    if ($("uClear")) $("uClear").addEventListener("click", function () { inp.value = ""; out.value = ""; inp.focus(); });
    run();
  })();

  /* ---------- MULTI-STYLE tool ----------
     Page sets window.STYLE_LIST = [[key, "Label"], ...]
     key: "map:bold" | "mark:strikethrough" | "fn:flip" | "fn:mirror" | "fn:spaced" | "zalgo:40"   */
  (function () {
    var inp = $("sIn"); if (!inp) return;
    var list = $("sList");
    var defs = window.STYLE_LIST || [];
    var rows = [];
    defs.forEach(function (d) {
      var row = document.createElement("div"); row.className = "srow";
      var wrap = document.createElement("div"); wrap.className = "txt";
      var nm = document.createElement("span"); nm.className = "nm"; nm.textContent = d[1];
      var val = document.createElement("span"); val.className = "val";
      wrap.appendChild(nm); wrap.appendChild(val);
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "btn sec sm"; btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy " + d[1] + " text");
      btn.addEventListener("click", function () { copy(val.textContent, btn); });
      row.appendChild(wrap); row.appendChild(btn);
      list.appendChild(row);
      rows.push({ key: d[0], el: val });
    });
    function transform(key, text) {
      var p = key.split(":");
      if (p[0] === "map") return TX.style(p[1], text);
      if (p[0] === "mark") return TX.mark(p[1], text);
      if (p[0] === "zalgo") return TX.zalgo(text, +p[1]);
      if (p[0] === "fn") {
        if (p[1] === "flip") return TX.flip(text);
        if (p[1] === "mirror") return TX.mirror(text);
        if (p[1] === "spaced") return TX.spaced(text, " ");
        if (p[1] === "upper") return text.toUpperCase();
        if (p[1] === "lower") return text.toLowerCase();
      }
      return text;
    }
    function run() {
      var t = inp.value || inp.placeholder || "Type something";
      rows.forEach(function (r) { r.el.textContent = transform(r.key, t); });
    }
    inp.addEventListener("input", run);
    if ($("sClear")) $("sClear").addEventListener("click", function () { inp.value = ""; run(); inp.focus(); });
    run();
  })();

  /* ---------- SINGLE-STYLE tool ----------
     Page sets window.SINGLE_KEY = "map:fraktur" (same syntax as above) */
  (function () {
    var inp = $("gIn"); if (!inp) return;
    var out = $("gOut"), key = window.SINGLE_KEY || "map:bold";
    function transform(text) {
      var p = key.split(":");
      if (p[0] === "map") return TX.style(p[1], text);
      if (p[0] === "mark") return TX.mark(p[1], text);
      if (p[0] === "zalgo") return TX.zalgo(text, +p[1]);
      if (p[0] === "fn") {
        if (p[1] === "flip") return TX.flip(text);
        if (p[1] === "mirror") return TX.mirror(text);
        if (p[1] === "spaced") return TX.spaced(text, " ");
      }
      return text;
    }
    function run() { out.value = transform(inp.value); }
    inp.addEventListener("input", run);
    if ($("gCopy")) $("gCopy").addEventListener("click", function () { copy(out.value, this); });
    if ($("gClear")) $("gClear").addEventListener("click", function () { inp.value = ""; out.value = ""; inp.focus(); });
    run();
  })();

  /* ---------- tools page search ---------- */
  (function () {
    var box = $("toolSearch"); if (!box) return;
    var links = [].slice.call(document.querySelectorAll(".tool-link"));
    var cats = [].slice.call(document.querySelectorAll(".cat"));
    var empty = $("noResult");
    box.addEventListener("input", function () {
      var q = box.value.trim().toLowerCase();
      links.forEach(function (l) { l.style.display = !q || l.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none"; });
      var any = false;
      cats.forEach(function (c) {
        var vis = [].slice.call(c.querySelectorAll(".tool-link")).filter(function (l) { return l.style.display !== "none"; }).length;
        c.style.display = vis ? "" : "none"; if (vis) any = true;
      });
      if (empty) empty.classList.toggle("show", !any);
    });
  })();
})();
