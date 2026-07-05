/* =========================================================
   Lunas+ — utils.js
   Fungsi bantu: format, toast, storage, generator kode
   ========================================================= */

const STORAGE_KEYS = {
  history: "lunasplus_history",
  saldo: "lunasplus_saldo",
  theme: "lunasplus_theme",
  paidBills: "lunasplus_paid_bills",
};

/* ---------- Format ---------- */
function formatRupiah(num) {
  return "Rp" + Number(num).toLocaleString("id-ID");
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* ---------- Storage ---------- */
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.history)) || [];
  } catch (e) {
    return [];
  }
}

function saveHistory(list) {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(list));
}

function addTransaction(tx) {
  const list = getHistory();
  list.unshift(tx);
  saveHistory(list);
}

function getSaldo() {
  const val = localStorage.getItem(STORAGE_KEYS.saldo);
  if (val === null) {
    localStorage.setItem(STORAGE_KEYS.saldo, "10000000");
    return 10000000;
  }
  return Number(val);
}

function setSaldo(val) {
  localStorage.setItem(STORAGE_KEYS.saldo, String(Math.max(0, val)));
}

/* ---------- Status tagihan sudah dibayar ----------
   Mencegah PLN/PDAM/Internet/Seminar dibayar berulang kali
   dengan ID pelanggan yang sama. Disimpan per kategori. */
function getPaidBills() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.paidBills)) || {};
  } catch (e) {
    return {};
  }
}

function markBillPaid(category, refId) {
  const paid = getPaidBills();
  if (!paid[category]) paid[category] = [];
  if (!paid[category].includes(refId)) paid[category].push(refId);
  localStorage.setItem(STORAGE_KEYS.paidBills, JSON.stringify(paid));
}

function isBillPaid(category, refId) {
  const paid = getPaidBills();
  return (paid[category] || []).includes(refId);
}

/* ---------- ID / Kode generator (simulasi) ---------- */
function randomDigits(n) {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function generateVA(bankCode) {
  const bankPrefix = { BCA: "3901", BNI: "8808", MANDIRI: "8900", BRI: "2603" };
  return (bankPrefix[bankCode] || "0000") + randomDigits(12);
}

function generateTellerCode() {
  return "TC-" + randomDigits(3) + "-" + randomDigits(4);
}

function generateTxId() {
  const now = new Date();
  const stamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");
  return "LP" + stamp + randomDigits(3);
}

/* ---------- Toast Notification ---------- */
let toastTimer = null;
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-exclamation",
    info: "fa-circle-info",
    warning: "fa-triangle-exclamation",
  };

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}" aria-hidden="true"></i>
    <span>${message}</span>
    <button class="toast__close" aria-label="Tutup notifikasi"><i class="fa-solid fa-xmark"></i></button>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--show"));

  const remove = () => {
    toast.classList.remove("toast--show");
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector(".toast__close").addEventListener("click", remove);
  setTimeout(remove, 4200);
}

/* ---------- Modal helpers ---------- */
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("modal--open");
  document.body.classList.add("no-scroll");
  const focusable = modal.querySelector("[data-autofocus]") || modal.querySelector("button, input");
  if (focusable) focusable.focus();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("modal--open");
  document.body.classList.remove("no-scroll");
}

/* ---------- Validation helpers ---------- */
function isValidPhone(phone) {
  return /^08\d{8,11}$/.test(phone);
}

function detectProvider(phone) {
  const prefix = phone.slice(0, 4);
  for (const [name, prefixes] of Object.entries(providerPrefixes)) {
    if (prefixes.includes(prefix)) return name;
  }
  return null;
}

function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function hexToRgba(hex, alpha = 1) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
