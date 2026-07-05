/* =========================================================
   Lunas+ — auth.js
   Simulasi login FRONT-END SAJA. Tidak ada server/API asli,
   jadi ini BUKAN autentikasi produksi — cukup untuk kebutuhan
   demo/tugas kuliah (gerbang akses ke aplikasi simulasi).
   ========================================================= */

(function () {
  "use strict";

  const AUTH_KEY = "lunasplus_auth"; // disimpan di localStorage (remember me)
  const AUTH_SESSION_KEY = "lunasplus_auth_session"; // disimpan di sessionStorage

  /* Kredensial demo (hardcode — hanya untuk simulasi front-end) */
  const DEMO_USER = {
    email: "dylan@tech.my.id",
    password: "P4ssw0rd789!!",
    name: "Dylan Chaniago",
  };

  function isLoggedIn() {
    return localStorage.getItem(AUTH_KEY) === "1" || sessionStorage.getItem(AUTH_SESSION_KEY) === "1";
  }

  function login(email, password, remember) {
    const ok = email.trim().toLowerCase() === DEMO_USER.email && password === DEMO_USER.password;
    if (!ok) return false;
    if (remember) localStorage.setItem(AUTH_KEY, "1");
    else sessionStorage.setItem(AUTH_SESSION_KEY, "1");
    return true;
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  }

  function showApp() {
    document.getElementById("loginScreen").classList.add("login-screen--hidden");
    document.getElementById("appShell").hidden = false;
  }

  function showLogin() {
    document.getElementById("appShell").hidden = true;
    document.getElementById("loginScreen").classList.remove("login-screen--hidden");
    document.getElementById("loginForm").reset();
    document.getElementById("rememberMe").checked = true;
    clearLoginError();
  }

  function setLoginError(message) {
    const el = document.getElementById("loginError");
    el.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
    el.style.display = "flex";
    document.getElementById("loginEmail").classList.add("input--error");
    document.getElementById("loginPassword").classList.add("input--error");
  }

  function clearLoginError() {
    const el = document.getElementById("loginError");
    el.textContent = "";
    el.style.display = "none";
    document.getElementById("loginEmail").classList.remove("input--error");
    document.getElementById("loginPassword").classList.remove("input--error");
  }

  function initAuthUI() {
    if (isLoggedIn()) showApp();
    else showLogin();

    const form = document.getElementById("loginForm");
    const submitBtn = document.getElementById("loginSubmitBtn");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearLoginError();

      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      const remember = document.getElementById("rememberMe").checked;

      if (!email || !password) {
        setLoginError("Email dan kata sandi wajib diisi.");
        return;
      }

      submitBtn.classList.add("btn--loading");
      submitBtn.disabled = true;

      // Simulasi jeda verifikasi server (sebenarnya dicek langsung di browser)
      setTimeout(() => {
        submitBtn.classList.remove("btn--loading");
        submitBtn.disabled = false;

        if (login(email, password, remember)) {
          showToast(`Selamat datang, ${DEMO_USER.name.split(" ")[0]}!`, "success");
          showApp();
          window.dispatchEvent(new CustomEvent("lunasplus:login"));
        } else {
          setLoginError("Email atau kata sandi salah. Coba lagi.");
        }
      }, 700);
    });

    document.getElementById("togglePassword").addEventListener("click", () => {
      const input = document.getElementById("loginPassword");
      const btn = document.getElementById("togglePassword");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.innerHTML = show
        ? '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
      btn.setAttribute("aria-pressed", String(show));
      btn.setAttribute("aria-label", show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
    });

    document.getElementById("forgotPasswordBtn").addEventListener("click", () => {
      showToast("Ini akun demo — hubungi admin/dosen untuk kredensial.", "info");
    });

    const logoutHandler = () => {
      logout();
      showLogin();
      showToast("Anda telah keluar.", "info");
    };
    document.getElementById("logoutBtn").addEventListener("click", logoutHandler);
    document.getElementById("logoutBtnProfil").addEventListener("click", logoutHandler);
  }

  document.addEventListener("DOMContentLoaded", initAuthUI);
})();
