/* Vaccari Advocacia — comportamento compartilhado */
(function () {
  "use strict";

  /* ── Gaveta mobile ── */
  function menu() {
    var btn = document.getElementById("btnMenu"),
      gav = document.getElementById("gaveta"),
      veu = document.getElementById("veu");
    if (!btn || !gav || !veu) return;
    function abrir() {
      gav.classList.add("on"); veu.hidden = false;
      requestAnimationFrame(function () { veu.classList.add("on"); });
      btn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function fechar() {
      gav.classList.remove("on"); veu.classList.remove("on");
      btn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      setTimeout(function () { veu.hidden = true; }, 260);
    }
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      gav.classList.contains("on") ? fechar() : abrir();
    });
    veu.addEventListener("click", fechar);
    var x = gav.querySelector("[data-fechar]");
    if (x) x.addEventListener("click", fechar);
    gav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", fechar); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && gav.classList.contains("on")) fechar();
    });
  }

  /* ── Eventos de conversão (GA4) ── */
  function ev(nome, extra) {
    var d = { area: document.body.dataset.area || "geral",
              pagina: location.pathname };
    if (extra) for (var k in extra) d[k] = extra[k];
    if (typeof gtag === "function") gtag("event", nome, d);
    (window.dataLayer = window.dataLayer || []).push(
      Object.assign({ event: nome }, d)
    );
  }

  function rastrear() {
    document.querySelectorAll("[data-cta]").forEach(function (el) {
      el.addEventListener("click", function () {
        ev("cta_clique", { cta: el.dataset.cta,
                           destino: el.getAttribute("href") || "" });
      });
    });
    document.querySelectorAll('a[href^="https://wa.me"],a[href^="https://api.whatsapp"]')
      .forEach(function (a) {
        a.addEventListener("click", function () {
          ev("contato_whatsapp", { origem: a.dataset.cta || "link" });
        });
      });
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener("click", function () { ev("contato_telefone"); });
    });
  }

  /* ── Formulário → WhatsApp ── */
  function formulario() {
    var f = document.getElementById("formContato");
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var d = new FormData(f), L = [];
      d.forEach(function (v, k) {
        v = String(v).trim();
        if (v) L.push(k.replace(/^./, function (c) { return c.toUpperCase(); }) + ": " + v);
      });
      ev("formulario_envio", { area_form: d.get("assunto") || "" });
      var txt = "Olá, Dr. Gustavo. Enviando informações sobre meu imóvel:\n\n" + L.join("\n");
      window.open("https://wa.me/5548998398989?text=" + encodeURIComponent(txt), "_blank", "noopener");
    });
  }

  function iniciar() { menu(); rastrear(); formulario(); }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", iniciar)
    : iniciar();
})();
