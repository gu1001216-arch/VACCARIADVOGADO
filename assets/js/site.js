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

  /* ── Formulário → envio real de e-mail via FormSubmit ── */
  var FORM_EMAIL = "gustavoparisvaccari" + "@" + "gmail.com";

  function validarContato(f) {
    var tel = f.querySelector('[name="Telefone"]'),
      mail = f.querySelector('[name="E-mail"]'),
      campoTel = tel ? tel.closest(".campo") : null,
      campoMail = mail ? mail.closest(".campo") : null,
      aviso = f.querySelector(".form-aviso-contato");
    if (campoTel) campoTel.classList.remove("campo-invalido");
    if (campoMail) campoMail.classList.remove("campo-invalido");
    if (aviso) aviso.remove();
    var vTel = tel ? tel.value.trim() : "", vMail = mail ? mail.value.trim() : "";
    if (!vTel && !vMail) {
      if (campoTel) campoTel.classList.add("campo-invalido");
      if (campoMail) campoMail.classList.add("campo-invalido");
      var novo = document.createElement("p");
      novo.className = "form-aviso-contato";
      novo.textContent = "Informe pelo menos um contato: telefone/WhatsApp ou e-mail.";
      var ref = campoMail || campoTel || f.firstElementChild;
      if (ref && ref.parentNode) ref.parentNode.insertBefore(novo, ref.nextSibling);
      return false;
    }
    return true;
  }

  function formulario(f) {
    var status = f.querySelector(".form-status"),
      btn = f.querySelector('button[type="submit"]');

    function setStatus(texto, ok) {
      if (!status) return;
      status.className = "form-status" + (ok ? " ok" : ok === false ? " erro" : "");
      status.textContent = texto || "";
    }

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validarContato(f)) return;
      btn.disabled = true;
      var textoOriginal = btn.textContent;
      btn.textContent = "Enviando…";
      setStatus("Enviando suas informações…", null);

      var dados = Object.fromEntries(new FormData(f).entries());
      fetch("https://formsubmit.co/ajax/" + FORM_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.assign({}, dados, {
          _subject: "Novo contato pelo site — " + (dados["Nome"] || "Sem nome"),
          _template: "table",
          _captcha: "false",
          Página: location.pathname,
        })),
      })
        .then(function (r) { if (!r.ok) throw new Error("Falha no envio"); return r.json(); })
        .then(function () {
          f.reset();
          setStatus("Formulário enviado com sucesso. Você receberá um retorno em breve.", true);
          ev("formulario_envio", { area_form: dados["Situação"] || "" });
        })
        .catch(function () {
          setStatus("Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.", false);
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = textoOriginal;
        });
    });
  }

  function iniciar() {
    menu();
    rastrear();
    document.querySelectorAll("form.form").forEach(formulario);
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", iniciar)
    : iniciar();
})();
