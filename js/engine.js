/* zalgo-text.org — text transform engine */
(function () {
  "use strict";

  /* ---------------- Zalgo ---------------- */
  var UP = ["̍","̎","̄","̅","̿","̑","̆","̐","͒","͗",
    "͑","̇","̈","̊","͂","̓","̈́","͊","͋","͌",
    "̃","̂","̌","͐","̀","́","̋","̏","̒","̓",
    "̔","̽","̉","ͣ","ͤ","ͥ","ͦ","ͧ","ͨ","ͩ",
    "ͪ","ͫ","ͬ","ͭ","ͮ","ͯ","̾","͛","͆","̚"];
  var DOWN = ["̖","̗","̘","̙","̜","̝","̞","̟","̠","̤",
    "̥","̦","̩","̪","̫","̬","̭","̮","̯","̰",
    "̱","̲","̳","̹","̺","̻","̼","ͅ","͇","͈",
    "͉","͍","͎","͓","͔","͕","͖","͙","͚","̣"];
  var MID = ["̕","̛","̀","́","͘","̡","̢","̧","̨","̴",
    "̵","̶","͏","͜","͝","͞","͟","͠","͢","̸",
    "̷","͡","҉"];

  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }

  /* level: 1..100 ; parts: {up,mid,down} booleans */
  function zalgo(text, level, parts) {
    if (!text) return "";
    level = Math.max(1, Math.min(100, level || 30));
    parts = parts || { up: true, mid: true, down: true };
    var maxMarks = Math.max(1, Math.round(level / 100 * 20));
    var out = "";
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      out += c;
      if (isCombining(c) || c === "\n" || c === " ") continue;
      if (parts.up) { var nu = 1 + rnd(maxMarks); for (var a = 0; a < nu; a++) out += pick(UP); }
      if (parts.mid) { var nm = rnd(Math.max(1, Math.round(maxMarks / 3))); for (var b = 0; b < nm; b++) out += pick(MID); }
      if (parts.down) { var nd = 1 + rnd(maxMarks); for (var d = 0; d < nd; d++) out += pick(DOWN); }
    }
    return out;
  }

  var COMB_RE = /[̀-ͯ҃-҉֑-ֽؐ-ًؚ-ٰٟۖ-ۜัิ-ฺ็-๎᪰-᫿᷀-᷿⃐-⃰︠-︯]/g;
  function isCombining(c) { COMB_RE.lastIndex = 0; return COMB_RE.test(c); }

  /* remove all combining marks — the "unzalgo" direction */
  function clean(text) {
    if (!text) return "";
    /* strip combining marks from the raw string; do NOT normalise first,
       otherwise base+mark pairs recompose into precomposed letters and survive. */
    return text.replace(COMB_RE, "");
  }

  /* ---------------- Unicode styles ---------------- */
  var MAPS = window.STYLE_MAPS || {};
  var MARKS = window.COMBINING_MARKS || {};

  function styleText(name, text) {
    var m = MAPS[name];
    if (!m || !text) return text || "";
    var out = "";
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) out += (m[chars[i]] !== undefined ? m[chars[i]] : chars[i]);
    return out;
  }

  function markText(name, text) {
    var mk = MARKS[name];
    if (!mk || !text) return text || "";
    var out = "";
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) out += chars[i] + (chars[i] === "\n" ? "" : mk);
    return out;
  }

  function flip(text) {
    return Array.from(styleText("upsideDown", text)).reverse().join("");
  }
  function mirror(text) {
    return Array.from(styleText("mirror", text)).reverse().join("");
  }
  function spaced(text, gap) {
    gap = gap === undefined ? " " : gap;
    return Array.from(text).join(gap);
  }

  window.TX = {
    zalgo: zalgo, clean: clean, style: styleText, mark: markText,
    flip: flip, mirror: mirror, spaced: spaced,
    maps: MAPS, marks: MARKS
  };
})();
