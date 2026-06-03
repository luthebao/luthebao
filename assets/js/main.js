/* luthebao theme — progressive enhancement. The page is fully usable without
   this file; everything here only adds niceties. */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---- Theme toggle ----------------------------------------------------- */
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function effectiveTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    return systemPrefersDark() ? "dark" : "light";
  }
  // Update affordances only (toggle ARIA + browser theme-color). No persistence,
  // so we don't pin an unchosen theme or disable OS-preference reactivity.
  function syncUI(theme) {
    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0e1116" : "#f6f7f9");
  }
  // Pin an explicit choice — only ever called from the toggle click.
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) {}
    syncUI(theme);
  }
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    syncUI(effectiveTheme()); // correct the button's state at load WITHOUT persisting
    toggle.addEventListener("click", function () {
      applyTheme(effectiveTheme() === "dark" ? "light" : "dark");
    });
  }
  // While no explicit choice is stored, follow OS changes live. CSS flips the
  // colors via prefers-color-scheme; we only keep the toggle + theme-color in sync.
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onMQ = function (e) {
      var stored;
      try { stored = localStorage.getItem("theme"); } catch (err) {}
      if (!stored) syncUI(e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", onMQ);
    else if (mq.addListener) mq.addListener(onMQ);
  }

  /* ---- Sticky header shadow on scroll ----------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var ticking = false;
    var setScrolled = function () {
      header.setAttribute("data-scrolled", String(window.scrollY > 4));
      ticking = false;
    };
    setScrolled();
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(setScrolled); }
    }, { passive: true });
  }

  /* ---- Copy text to clipboard (with fallback) --------------------------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); }
      catch (e) { reject(e); }
      finally { document.body.removeChild(ta); }
    });
  }

  var ICON_COPY = '<svg class="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var ICON_CHECK = '<svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  /* ---- Enhance fenced code blocks --------------------------------------- */
  function langOf(block) {
    var m = (block.className || "").match(/language-([\w+#-]+)/);
    var lang = m ? m[1] : "";
    if (!lang || lang === "plaintext" || lang === "text") return "code";
    return lang;
  }
  Array.prototype.forEach.call(document.querySelectorAll(".prose .highlighter-rouge"), function (block) {
    if (block.closest(".code-block")) return;
    var pre = block.querySelector("pre");
    if (!pre) return;

    var wrap = document.createElement("div");
    wrap.className = "code-block";
    block.parentNode.insertBefore(wrap, block);

    var bar = document.createElement("div");
    bar.className = "code-block__bar";

    var lang = document.createElement("span");
    lang.className = "code-block__lang";
    lang.textContent = langOf(block);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-block__copy";
    btn.setAttribute("aria-label", "Copy code to clipboard");
    btn.innerHTML = ICON_COPY + ICON_CHECK + '<span class="copy-label">Copy</span>';

    var resetTimer;
    btn.addEventListener("click", function () {
      var code = block.querySelector("code");
      var text = (code ? code.textContent : pre.textContent).replace(/\n$/, "");
      copyText(text).then(function () {
        btn.setAttribute("data-copied", "true");
        btn.querySelector(".copy-label").textContent = "Copied";
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          btn.removeAttribute("data-copied");
          btn.querySelector(".copy-label").textContent = "Copy";
        }, 1800);
      }).catch(function () {
        btn.querySelector(".copy-label").textContent = "Failed";
      });
    });

    bar.appendChild(lang);
    bar.appendChild(btn);
    wrap.appendChild(bar);
    wrap.appendChild(block);
  });

  /* ---- Make wide tables scrollable on small screens --------------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".prose table"), function (table) {
    if (table.closest(".table-scroll")) return;
    var scroller = document.createElement("div");
    scroller.className = "table-scroll";
    table.parentNode.insertBefore(scroller, table);
    scroller.appendChild(table);
  });

  /* ---- Heading anchors -------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".prose h2[id], .prose h3[id], .prose h4[id]"), function (h) {
    var a = document.createElement("a");
    a.className = "heading-anchor";
    a.href = "#" + h.id;
    a.setAttribute("aria-label", "Link to this section");
    a.textContent = "#";
    h.insertBefore(a, h.firstChild);
  });
})();
