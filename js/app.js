/* =========================================================
   Lunas+ — app.js
   Routing, state, dan seluruh alur interaksi (vanilla JS)
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     STATE
     ========================================================= */
  let currentCategory = "pln";       // kategori tagihan aktif
  let currentBill = null;            // hasil cek tagihan aktif (tagihan biasa)
  let currentSpp = null;             // { nim, data, selectedIds: Set }
  let currentProvider = null;        // provider dipilih (pulsa)
  let pulsaMode = "pulsa";           // "pulsa" | "paket"
  let selectedNominal = null;
  let selectedPaket = null;

  /* Konteks pembayaran generik dipakai oleh modal metode & struk */
  let paymentContext = null;
  /* paymentContext = {
       categoryKey, categoryLabel, refId, name, amount, meta: [{label,value}]
     } */

  let qrisTimer = null;
  let riwayatChartInstance = null; // instance Chart.js aktif di halaman Riwayat

  /* =========================================================
     INIT
     ========================================================= */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNav();
    initModalClosers();
    initDashboard();
    initTagihan();
    initSpp();
    initPulsa();
    initRiwayat();
    initMisc();
    renderProviderGrid();
    renderNominalGrid();
    navigate("dashboard");
  });

  /* =========================================================
     THEME
     ========================================================= */
  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme) || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    updateThemeIcon(saved);
    const toggle = () => {
      const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", cur);
      localStorage.setItem(STORAGE_KEYS.theme, cur);
      updateThemeIcon(cur);
    };
    document.getElementById("themeToggle").addEventListener("click", toggle);
    document.getElementById("themeToggleMobile").addEventListener("click", toggle);
  }
  function updateThemeIcon(theme) {
    const iconClass = theme === "dark" ? "fa-sun" : "fa-moon";
    const html = `<i class="fa-solid ${iconClass}" aria-hidden="true"></i>`;
    document.getElementById("themeToggle").innerHTML = html;
    document.getElementById("themeToggleMobile").innerHTML = html;
  }

  /* =========================================================
     NAVIGATION (SPA-style)
     ========================================================= */
  function initNav() {
    document.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => navigate(btn.dataset.view));
    });
    document.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => {
        navigate(btn.dataset.goto);
        if (btn.dataset.category) {
          setTimeout(() => selectTagihanTab(btn.dataset.category), 50);
        }
      });
    });
  }

  function navigate(view) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("view--active"));
    const target = document.getElementById(`view-${view}`);
    if (target) target.classList.add("view--active");

    document.querySelectorAll(".navlink[data-view]").forEach((l) => {
      l.toggleAttribute("aria-current", l.dataset.view === view);
      if (l.dataset.view === view) l.setAttribute("aria-current", "page");
      else l.removeAttribute("aria-current");
    });
    document.querySelectorAll(".tabbar__item[data-view]").forEach((l) => {
      l.classList.toggle("tabbar__item--active", l.dataset.view === view);
    });

    if (view === "dashboard") renderDashboard();
    if (view === "riwayat") renderRiwayat();

    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  /* =========================================================
     DASHBOARD
     ========================================================= */
  function initDashboard() {
    renderDashboard();
  }

  function renderDashboard() {
    document.getElementById("dashSaldo").textContent = formatRupiah(getSaldo());
    renderDashStats();

    const history = getHistory().slice(0, 4);
    const container = document.getElementById("dashRecent");

    if (history.length === 0) {
      container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>Belum ada transaksi. Yuk mulai bayar tagihan pertamamu!</p></div>`;
      return;
    }
    container.innerHTML = history.map(txRowHtml).join("");
  }

  /* Ringkasan angka cepat: total transaksi, total pengeluaran bulan
     berjalan, dan kategori yang paling sering dibayar. */
  function renderDashStats() {
    const el = document.getElementById("dashStatsRow");
    if (!el) return;
    const all = getHistory();
    const now = new Date();
    const thisMonth = all.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalBulanIni = thisMonth.reduce((s, tx) => s + tx.amount, 0);
    const byCategory = computeSpendingByCategory(all);
    const topEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const topLabel = topEntry ? (categoryMeta[topEntry[0]]?.label || categoryLongLabel(topEntry[0])) : "—";

    el.innerHTML = `
      <div class="stat-card">
        <p class="stats-label">Total Transaksi</p>
        <p class="stats-value">${all.length}</p>
      </div>
      <div class="stat-card">
        <p class="stats-label">Pengeluaran Bulan Ini</p>
        <p class="stats-value">${formatRupiah(totalBulanIni)}</p>
      </div>
      <div class="stat-card">
        <p class="stats-label">Kategori Terbanyak</p>
        <p class="stats-value" style="font-size:.92rem">${topLabel}</p>
      </div>
    `;
  }

  function categoryLongLabel(key) {
    const map = { spp: "Biaya Kuliah / SPP", pulsa: "Pulsa & Paket Data" };
    return map[key] || key;
  }

  function computeSpendingByCategory(list) {
    const result = {};
    list.forEach((tx) => {
      result[tx.category] = (result[tx.category] || 0) + tx.amount;
    });
    return result;
  }

  function categoryIcon(key) {
    const map = {
      pln: "fa-bolt", pdam: "fa-faucet", internet: "fa-wifi", seminar: "fa-chalkboard-user",
      spp: "fa-graduation-cap", pulsa: "fa-signal",
    };
    return map[key] || "fa-file-invoice";
  }

  function txRowHtml(tx) {
    return `
      <div class="recent-item">
        <span class="recent-item__icon"><i class="fa-solid ${categoryIcon(tx.category)}"></i></span>
        <div class="recent-item__body">
          <p class="recent-item__title">${tx.title}</p>
          <p class="recent-item__sub">${formatDateTime(tx.date)}</p>
        </div>
        <div style="text-align:right">
          <p class="recent-item__amount">${formatRupiah(tx.amount)}</p>
          <span class="status-pill status-pill--${tx.status === "success" ? "success" : "pending"}">
            ${tx.status === "success" ? "Berhasil" : "Menunggu"}
          </span>
        </div>
      </div>`;
  }

  /* =========================================================
     BAYAR TAGIHAN (PLN / PDAM / Internet / Seminar)
     ========================================================= */
  function initTagihan() {
    document.querySelectorAll("#tagihanTabs .tab").forEach((tab) => {
      tab.addEventListener("click", () => selectTagihanTab(tab.dataset.category));
    });

    const form = document.getElementById("tagihanForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleCekTagihan();
    });

    document.getElementById("tagihanId").addEventListener("input", () => {
      clearFieldError("tagihanIdError", "tagihanId");
    });
  }

  function selectTagihanTab(category) {
    currentCategory = category;
    document.querySelectorAll("#tagihanTabs .tab").forEach((t) => {
      const active = t.dataset.category === category;
      t.classList.toggle("tab--active", active);
      t.setAttribute("aria-selected", String(active));
    });
    const meta = categoryMeta[category];
    document.getElementById("tagihanIdLabel").textContent = meta.idLabel;
    document.getElementById("tagihanIdHint").textContent = meta.idHint;
    document.getElementById("tagihanId").value = "";
    document.getElementById("tagihanResult").innerHTML = "";
    clearFieldError("tagihanIdError", "tagihanId");
  }

  function handleCekTagihan() {
    const meta = categoryMeta[currentCategory];
    const input = document.getElementById("tagihanId");
    const value = input.value.trim();

    if (!value) return setFieldError("tagihanIdError", "tagihanId", "ID pelanggan wajib diisi.");
    if (!meta.pattern.test(value)) {
      return setFieldError("tagihanIdError", "tagihanId", `Format tidak valid. ${meta.idHint}.`);
    }
    clearFieldError("tagihanIdError", "tagihanId");

    const btn = document.getElementById("cekTagihanBtn");
    setBtnLoading(btn, true);
    document.getElementById("tagihanResult").innerHTML = "";

    setTimeout(() => {
      setBtnLoading(btn, false);
      const bill = billData[currentCategory][value];
      if (!bill) {
        showToast("Nomor pelanggan tidak ditemukan. Coba salah satu data contoh di README.", "error");
        return;
      }
      currentBill = { ...bill, refId: value, category: currentCategory };
      renderBillResult(currentBill);
      showToast(
        isBillPaid(currentCategory, value) ? "Tagihan ditemukan — sudah lunas." : "Tagihan ditemukan.",
        "success"
      );
    }, 900 + Math.random() * 400);
  }

  function renderBillResult(bill) {
    const total = bill.amount + (bill.fine || 0);
    const isSeminar = bill.category === "seminar";
    const alreadyPaid = isBillPaid(bill.category, bill.refId);
    document.getElementById("tagihanResult").innerHTML = `
      <div class="bill-card">
        <div class="bill-card__row">
          <span class="bill-card__label">${isSeminar ? "Nama Kegiatan" : "Nama Pelanggan"}</span>
          <span class="bill-card__value">${bill.name}</span>
        </div>
        <div class="bill-card__row">
          <span class="bill-card__label">${isSeminar ? "Penyelenggara" : "Alamat"}</span>
          <span class="bill-card__value">${bill.address}</span>
        </div>
        <div class="bill-card__row">
          <span class="bill-card__label">Periode</span>
          <span class="bill-card__value">${bill.period}</span>
        </div>
        <div class="bill-card__row">
          <span class="bill-card__label">Tagihan Pokok</span>
          <span class="bill-card__value bill-card__value--mono">${formatRupiah(bill.amount)}</span>
        </div>
        ${bill.fine ? `
        <div class="bill-card__row">
          <span class="bill-card__label">Denda Keterlambatan</span>
          <span class="bill-card__value bill-card__value--mono bill-card__fine">${formatRupiah(bill.fine)}</span>
        </div>` : ""}
        <div class="bill-card__row">
          <span class="bill-card__label">Jatuh Tempo</span>
          <span class="bill-card__value">${formatDate(bill.dueDate)}</span>
        </div>
        <div class="bill-card__total">
          <span class="bill-card__total-label">Total Bayar</span>
          <span class="bill-card__total-value">${formatRupiah(total)}</span>
        </div>
      </div>
      ${alreadyPaid ? `
      <div class="status-banner status-banner--success">
        <i class="fa-solid fa-circle-check"></i>
        <span>Tagihan ini sudah lunas dibayar. Cek Riwayat Transaksi untuk melihat buktinya.</span>
      </div>` : `
      <button class="btn btn--primary btn--block" id="bayarTagihanBtn">
        <span class="btn__label">Bayar Sekarang</span>
        <span class="btn__spinner" aria-hidden="true"></span>
      </button>`}
    `;

    if (alreadyPaid) return;

    document.getElementById("bayarTagihanBtn").addEventListener("click", () => {
      paymentContext = {
        categoryKey: bill.category,
        categoryLabel: categoryMeta[bill.category].label,
        refId: bill.refId,
        name: bill.name,
        amount: total,
        meta: [
          { label: isSeminar ? "Nama Kegiatan" : "Nama Pelanggan", value: bill.name },
          { label: "Nomor Referensi", value: bill.refId },
          { label: "Periode", value: bill.period },
        ],
      };
      openPaymentModal();
    });
  }

  /* =========================================================
     SPP / BIAYA KULIAH
     ========================================================= */
  function initSpp() {
    const form = document.getElementById("sppForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleCekSpp();
    });
    document.getElementById("sppNim").addEventListener("input", () => clearFieldError("sppNimError", "sppNim"));

    document.getElementById("cariKodeBtn").addEventListener("click", handleCariKodeTagihan);
  }

  function handleCekSpp() {
    const input = document.getElementById("sppNim");
    const nim = input.value.trim();

    if (!nim) return setFieldError("sppNimError", "sppNim", "NIM wajib diisi.");
    if (!/^\d{12}$/.test(nim)) return setFieldError("sppNimError", "sppNim", "NIM harus 12 digit angka.");
    clearFieldError("sppNimError", "sppNim");

    const btn = document.getElementById("cekSppBtn");
    setBtnLoading(btn, true);
    document.getElementById("sppResult").innerHTML = "";

    setTimeout(() => {
      setBtnLoading(btn, false);
      const data = sppData[nim];
      if (!data) {
        showToast("NIM tidak terdaftar. Coba salah satu NIM contoh di README.", "error");
        return;
      }
      currentSpp = { nim, data, selectedIds: new Set() };
      renderSppResult();
      showToast(`Tagihan semester ${data.semester} ditemukan.`, "success");
    }, 900 + Math.random() * 400);
  }

  function renderSppResult() {
    const { nim, data } = currentSpp;
    const rows = data.tagihan.map((item) => {
      const paid = item.status === "paid";
      return `
        <tr>
          <td>
            <input type="checkbox" class="spp-table__checkbox" data-id="${item.id}" ${paid ? "disabled" : ""}
                   aria-label="Pilih ${item.desc}">
          </td>
          <td>${item.desc}<br><span style="color:var(--color-muted);font-family:var(--font-mono);font-size:.72rem">${item.id}</span></td>
          <td class="spp-table__amount">${formatRupiah(item.amount)}</td>
          <td><span class="status-pill status-pill--${paid ? "success" : "pending"}">${paid ? "Lunas" : "Belum Lunas"}</span></td>
        </tr>`;
    }).join("");

    document.getElementById("sppResult").innerHTML = `
      <div class="card">
        <div class="spp-identity">
          <span class="spp-identity__avatar">${data.nama.split(" ").map(w => w[0]).slice(0,2).join("")}</span>
          <div>
            <p style="font-weight:700">${data.nama}</p>
            <p style="color:var(--color-muted);font-size:.82rem">${data.prodi} · NIM ${nim}</p>
          </div>
        </div>
        <div class="spp-table-wrap">
          <table class="spp-table">
            <thead>
              <tr><th></th><th>Deskripsi</th><th>Jumlah</th><th>Status</th></tr>
            </thead>
            <tbody id="sppTableBody">${rows}</tbody>
          </table>
        </div>
        <div class="spp-summary">
          <span class="spp-summary__label" id="sppSelectedCount">0 item dipilih</span>
          <span class="spp-summary__value" id="sppTotalValue">Rp0</span>
        </div>
        <button class="btn btn--primary btn--block" id="bayarSppBtn" disabled>
          <span class="btn__label">Bayar Cicilan Terpilih</span>
          <span class="btn__spinner" aria-hidden="true"></span>
        </button>
      </div>
    `;

    document.querySelectorAll("#sppTableBody input[type=checkbox]").forEach((cb) => {
      cb.addEventListener("change", () => {
        if (cb.checked) currentSpp.selectedIds.add(cb.dataset.id);
        else currentSpp.selectedIds.delete(cb.dataset.id);
        updateSppSummary();
      });
    });

    document.getElementById("bayarSppBtn").addEventListener("click", () => {
      const selectedItems = data.tagihan.filter((t) => currentSpp.selectedIds.has(t.id));
      const total = selectedItems.reduce((s, i) => s + i.amount, 0);
      paymentContext = {
        categoryKey: "spp",
        categoryLabel: "Biaya Kuliah / SPP",
        refId: nim,
        name: data.nama,
        amount: total,
        meta: [
          { label: "Nama Mahasiswa", value: data.nama },
          { label: "NIM", value: nim },
          { label: "Jumlah Item", value: `${selectedItems.length} cicilan` },
        ],
      };
      openPaymentModal();
    });
  }

  function updateSppSummary() {
    const { data, selectedIds } = currentSpp;
    const items = data.tagihan.filter((t) => selectedIds.has(t.id));
    const total = items.reduce((s, i) => s + i.amount, 0);
    document.getElementById("sppSelectedCount").textContent = `${items.length} item dipilih`;
    document.getElementById("sppTotalValue").textContent = formatRupiah(total);
    document.getElementById("bayarSppBtn").disabled = items.length === 0;
  }

  function handleCariKodeTagihan() {
    const kode = document.getElementById("sppKode").value.trim();
    const resultEl = document.getElementById("sppKodeResult");
    if (!kode) {
      resultEl.innerHTML = `<p class="field-error" role="alert" style="display:flex">Masukkan kode tagihan terlebih dahulu.</p>`;
      return;
    }
    let found = null;
    let ownerNim = null;
    for (const [nim, d] of Object.entries(sppData)) {
      const item = d.tagihan.find((t) => t.id === kode);
      if (item) { found = item; ownerNim = nim; break; }
    }
    if (!found) {
      resultEl.innerHTML = `<p class="field-error" role="alert" style="display:flex">Kode tagihan "${kode}" tidak ditemukan.</p>`;
      return;
    }
    resultEl.innerHTML = `
      <div class="bill-card" style="margin-top:14px">
        <div class="bill-card__row"><span class="bill-card__label">Kode Tagihan</span><span class="bill-card__value bill-card__value--mono">${found.id}</span></div>
        <div class="bill-card__row"><span class="bill-card__label">Deskripsi</span><span class="bill-card__value">${found.desc}</span></div>
        <div class="bill-card__row"><span class="bill-card__label">NIM Pemilik</span><span class="bill-card__value">${ownerNim}</span></div>
        <div class="bill-card__row"><span class="bill-card__label">Semester</span><span class="bill-card__value">${sppData[ownerNim].semester.replace("Ganjil", "202")}</span></div>
        <div class="bill-card__row"><span class="bill-card__label">Status</span><span class="bill-card__value">
          <span class="status-pill status-pill--${found.status === "paid" ? "success" : "pending"}">${found.status === "paid" ? "Lunas" : "Belum Lunas"}</span>
        </span></div>
        <div class="bill-card__total">
          <span class="bill-card__total-label">Jumlah</span>
          <span class="bill-card__total-value">${formatRupiah(found.amount)}</span>
        </div>
      </div>`;
  }

  /* =========================================================
     PULSA & PAKET DATA
     ========================================================= */
  function initPulsa() {
    const phoneInput = document.getElementById("pulsaPhone");
    phoneInput.addEventListener("input", debounce(handlePhoneInput, 250));

    document.querySelectorAll(".segmented__item").forEach((btn) => {
      btn.addEventListener("click", () => {
        pulsaMode = btn.dataset.mode;
        document.querySelectorAll(".segmented__item").forEach((b) => {
          b.classList.toggle("segmented__item--active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        document.getElementById("nominalPulsa").hidden = pulsaMode !== "pulsa";
        document.getElementById("nominalPaket").hidden = pulsaMode !== "paket";
        selectedNominal = null;
        selectedPaket = null;
      });
    });

    document.getElementById("pulsaForm").addEventListener("submit", (e) => {
      e.preventDefault();
      handlePreviewPulsa();
    });
  }

  function renderProviderGrid() {
    const grid = document.getElementById("providerGrid");
    grid.innerHTML = providers.map((p) => `
      <button type="button" class="provider-card" data-key="${p.key}"
              style="--provider-color:${p.color}; --provider-color-dark:${p.colorDark}; --provider-tint:${hexToRgba(p.color, 0.16)};">
        <span class="provider-card__logo${p.dark ? " provider-card__logo--dark" : ""}">
          <i class="fa-solid fa-signal provider-card__logo-icon" aria-hidden="true"></i>
          <span class="provider-card__logo-text">${p.initial}</span>
        </span>
        <span class="provider-card__name">${p.name}</span>
      </button>
    `).join("");
    grid.querySelectorAll(".provider-card").forEach((card) => {
      card.addEventListener("click", () => {
        currentProvider = providers.find((p) => p.key === card.dataset.key);
        grid.querySelectorAll(".provider-card").forEach((c) => c.classList.toggle("provider-card--active", c === card));
      });
    });
  }

  function renderNominalGrid() {
    const pulsaGrid = document.getElementById("nominalPulsa");
    pulsaGrid.innerHTML = pulsaNominal.map((n) => `
      <button type="button" class="nominal-card" data-nominal="${n}">${formatRupiah(n)}</button>
    `).join("");
    pulsaGrid.querySelectorAll(".nominal-card").forEach((card) => {
      card.addEventListener("click", () => {
        selectedNominal = Number(card.dataset.nominal);
        document.getElementById("nominalCustom").value = "";
        pulsaGrid.querySelectorAll(".nominal-card").forEach((c) => c.classList.toggle("nominal-card--active", c === card));
      });
    });

    const paketGrid = document.getElementById("nominalPaket");
    paketGrid.innerHTML = paketData.map((p) => `
      <button type="button" class="nominal-card" data-paket="${p.id}">${p.name}<span class="nominal-card__sub">${formatRupiah(p.price)}</span></button>
    `).join("");
    paketGrid.querySelectorAll(".nominal-card").forEach((card) => {
      card.addEventListener("click", () => {
        selectedPaket = paketData.find((p) => p.id === card.dataset.paket);
        paketGrid.querySelectorAll(".nominal-card").forEach((c) => c.classList.toggle("nominal-card--active", c === card));
      });
    });
  }

  function handlePhoneInput() {
    const phone = document.getElementById("pulsaPhone").value.trim();
    const detectedEl = document.getElementById("providerDetected");
    if (!phone) { detectedEl.textContent = ""; detectedEl.classList.remove("mismatch"); return; }

    const provider = detectProvider(phone);
    if (!provider) {
      detectedEl.textContent = "";
      return;
    }
    if (currentProvider && currentProvider.name !== provider) {
      detectedEl.textContent = `Nomor ini terdeteksi ${provider}, bukan ${currentProvider.name}.`;
      detectedEl.classList.add("mismatch");
    } else {
      detectedEl.textContent = `Provider terdeteksi: ${provider}`;
      detectedEl.classList.remove("mismatch");
      if (!currentProvider) {
        const match = providers.find((p) => p.name === provider);
        if (match) {
          currentProvider = match;
          document.querySelectorAll(".provider-card").forEach((c) => c.classList.toggle("provider-card--active", c.dataset.key === match.key));
        }
      }
    }
  }

  function handlePreviewPulsa() {
    const phone = document.getElementById("pulsaPhone").value.trim();
    const customVal = Number(document.getElementById("nominalCustom").value);

    if (!isValidPhone(phone)) {
      return setFieldError("pulsaPhoneError", "pulsaPhone", "Nomor HP harus 10–13 digit dan diawali 08.");
    }
    clearFieldError("pulsaPhoneError", "pulsaPhone");

    if (!currentProvider) {
      showToast("Pilih provider terlebih dahulu.", "warning");
      return;
    }

    let itemLabel, amount;
    if (pulsaMode === "pulsa") {
      amount = customVal >= 5000 ? customVal : selectedNominal;
      itemLabel = "Pulsa";
      if (!amount) { showToast("Pilih nominal pulsa atau isi nominal custom.", "warning"); return; }
    } else {
      if (!selectedPaket) { showToast("Pilih salah satu paket data.", "warning"); return; }
      amount = selectedPaket.price;
      itemLabel = selectedPaket.name;
    }

    const btn = document.getElementById("previewPulsaBtn");
    setBtnLoading(btn, true);
    setTimeout(() => {
      setBtnLoading(btn, false);
      paymentContext = {
        categoryKey: "pulsa",
        categoryLabel: "Pulsa & Paket Data",
        refId: phone,
        name: `${itemLabel} — ${currentProvider.name}`,
        amount,
        meta: [
          { label: "Nomor Tujuan", value: phone },
          { label: "Provider", value: currentProvider.name },
          { label: "Item", value: itemLabel },
        ],
      };
      openPaymentModal();
    }, 700);
  }

  /* =========================================================
     MODAL: PILIH METODE PEMBAYARAN
     ========================================================= */
  function openPaymentModal() {
    const body = document.getElementById("modalPaymentBody");
    body.innerHTML = `
      <div class="bill-card" style="margin-bottom:18px">
        ${paymentContext.meta.map((m) => `
          <div class="bill-card__row"><span class="bill-card__label">${m.label}</span><span class="bill-card__value">${m.value}</span></div>
        `).join("")}
        <div class="bill-card__total">
          <span class="bill-card__total-label">Total Bayar</span>
          <span class="bill-card__total-value">${formatRupiah(paymentContext.amount)}</span>
        </div>
      </div>
      <div class="paymethod-list">
        <button class="paymethod-option" data-method="va">
          <span class="paymethod-option__icon"><i class="fa-solid fa-building-columns"></i></span>
          <span>
            <span class="paymethod-option__title" style="display:block">Virtual Account</span>
            <span class="paymethod-option__sub">Transfer via ATM/m-banking</span>
          </span>
          <i class="fa-solid fa-chevron-right paymethod-option__chev"></i>
        </button>
        <button class="paymethod-option" data-method="qris">
          <span class="paymethod-option__icon"><i class="fa-solid fa-qrcode"></i></span>
          <span>
            <span class="paymethod-option__title" style="display:block">QRIS</span>
            <span class="paymethod-option__sub">Scan pakai e-wallet / m-banking</span>
          </span>
          <i class="fa-solid fa-chevron-right paymethod-option__chev"></i>
        </button>
        <button class="paymethod-option" data-method="teller">
          <span class="paymethod-option__icon"><i class="fa-solid fa-shop"></i></span>
          <span>
            <span class="paymethod-option__title" style="display:block">Bayar di Teller / Kasir</span>
            <span class="paymethod-option__sub">Alfamart, Indomaret, Kantor Pos</span>
          </span>
          <i class="fa-solid fa-chevron-right paymethod-option__chev"></i>
        </button>
      </div>
    `;
    body.querySelectorAll("[data-method]").forEach((btn) => {
      btn.addEventListener("click", () => renderMethodDetail(btn.dataset.method));
    });
    openModal("modalPayment");
  }

  function renderMethodDetail(method) {
    const body = document.getElementById("modalPaymentBody");
    if (method === "va") {
      body.innerHTML = `
        <button class="btn btn--ghost btn--sm" id="backToMethods" style="margin-bottom:14px"><i class="fa-solid fa-arrow-left"></i> Kembali</button>
        <p class="field-label">Pilih Bank</p>
        <div class="bank-list" id="bankList">
          ${bankList.map((b) => `<button type="button" class="bank-option" data-bank="${b.code}"><span>${b.name}</span><span style="color:var(--color-muted)">${b.code}</span></button>`).join("")}
        </div>
        <div id="vaOutput"></div>
      `;
      body.querySelector("#backToMethods").addEventListener("click", openPaymentModal);
      body.querySelectorAll(".bank-option").forEach((btn) => {
        btn.addEventListener("click", () => {
          const va = generateVA(btn.dataset.bank);
          document.getElementById("vaOutput").innerHTML = `
            <div class="va-box">
              <p style="font-size:.78rem;color:var(--color-muted)">Nomor Virtual Account (${btn.dataset.bank})</p>
              <p class="va-number">${va}</p>
              <button type="button" class="copy-btn" id="copyVaBtn"><i class="fa-regular fa-copy"></i> Salin Nomor</button>
              <p style="font-size:.76rem;color:var(--color-muted);margin-top:10px">Transfer tepat sesuai nominal sebelum ${formatDateTime(new Date(Date.now() + 60 * 60000))}</p>
            </div>
            <button class="btn btn--primary btn--block" id="confirmPayBtn">
              <span class="btn__label">Saya Sudah Transfer</span>
              <span class="btn__spinner" aria-hidden="true"></span>
            </button>
          `;
          document.getElementById("copyVaBtn").addEventListener("click", () => {
            navigator.clipboard?.writeText(va).then(() => showToast("Nomor VA disalin.", "info"));
          });
          document.getElementById("confirmPayBtn").addEventListener("click", () => processPayment("Virtual Account " + btn.dataset.bank, va));
        });
      });
    }

    if (method === "qris") {
      body.innerHTML = `
        <button class="btn btn--ghost btn--sm" id="backToMethods" style="margin-bottom:14px"><i class="fa-solid fa-arrow-left"></i> Kembali</button>
        <div class="qris-box">
          <div class="qris-code" id="qrisCode"></div>
          <p style="font-size:.82rem;color:var(--color-muted);margin-bottom:6px">Scan kode di atas menggunakan aplikasi e-wallet/m-banking</p>
          <p class="qris-countdown" id="qrisCountdown">05:00</p>
        </div>
        <button class="btn btn--primary btn--block" id="confirmPayBtn">
          <span class="btn__label">Saya Sudah Bayar</span>
          <span class="btn__spinner" aria-hidden="true"></span>
        </button>
      `;
      body.querySelector("#backToMethods").addEventListener("click", () => { clearInterval(qrisTimer); openPaymentModal(); });
      renderQrisCode();
      startQrisCountdown();
      document.getElementById("confirmPayBtn").addEventListener("click", () => {
        clearInterval(qrisTimer);
        processPayment("QRIS", generateTxId());
      });
    }

    if (method === "teller") {
      const code = generateTellerCode();
      body.innerHTML = `
        <button class="btn btn--ghost btn--sm" id="backToMethods" style="margin-bottom:14px"><i class="fa-solid fa-arrow-left"></i> Kembali</button>
        <div class="va-box">
          <p style="font-size:.78rem;color:var(--color-muted)">Kode Pembayaran</p>
          <p class="va-number">${code}</p>
          <p style="font-size:.76rem;color:var(--color-muted)">Tunjukkan kode ini ke kasir</p>
        </div>
        <p class="field-label">Lokasi Terdekat</p>
        <div class="teller-list">
          ${tellerLocations.map((t) => `<div class="teller-item"><span>${t.name}</span><span class="teller-item__hours">${t.hours}</span></div>`).join("")}
        </div>
        <button class="btn btn--primary btn--block" id="confirmPayBtn">
          <span class="btn__label">Saya Sudah Bayar di Kasir</span>
          <span class="btn__spinner" aria-hidden="true"></span>
        </button>
      `;
      body.querySelector("#backToMethods").addEventListener("click", openPaymentModal);
      document.getElementById("confirmPayBtn").addEventListener("click", () => processPayment("Teller / Kasir", code));
    }
  }

  function renderQrisCode() {
    const container = document.getElementById("qrisCode");
    if (!container || typeof QRCode === "undefined") return;
    // Payload simulasi (bukan format QRIS resmi) — cukup untuk didemokan
    // sebagai QR yang bisa dipindai kamera, berisi ringkasan transaksi.
    const payload = [
      "BAYARKITA-QRIS",
      paymentContext.categoryLabel,
      paymentContext.refId,
      paymentContext.amount,
      generateTxId(),
    ].join("|");
    new QRCode(container, {
      text: payload,
      width: 192,
      height: 192,
      colorDark: "#0C2622",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
  }

  function startQrisCountdown() {
    let seconds = 5 * 60;
    const el = document.getElementById("qrisCountdown");
    clearInterval(qrisTimer);
    qrisTimer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(qrisTimer);
        el.textContent = "00:00";
        showToast("Waktu pembayaran QRIS habis. Silakan ulangi.", "error");
        closeModal("modalPayment");
        return;
      }
      const m = String(Math.floor(seconds / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      el.textContent = `${m}:${s}`;
    }, 1000);
  }

  /* =========================================================
     PROSES PEMBAYARAN + STRUK
     ========================================================= */
  function processPayment(methodLabel, refCode) {
    const btn = document.getElementById("confirmPayBtn");
    setBtnLoading(btn, true);
    showLoadingOverlay("Memproses pembayaran...");

    setTimeout(() => {
      hideLoadingOverlay();
      closeModal("modalPayment");

      const tx = {
        id: generateTxId(),
        category: paymentContext.categoryKey,
        title: paymentContext.categoryLabel + " — " + paymentContext.name,
        refId: paymentContext.refId,
        amount: paymentContext.amount,
        method: methodLabel,
        methodRef: refCode,
        status: "success",
        date: new Date().toISOString(),
      };
      addTransaction(tx);
      // Saldo simulasi bersifat informatif saja: VA/QRIS/Teller adalah
      // pembayaran dari luar dompet, jadi saldo tidak dipotong otomatis.
      markBillAsPaidIfApplicable();
      renderReceipt(tx);
      openModal("modalReceipt");
      showToast("Pembayaran berhasil!", "success");
    }, 1400 + Math.random() * 500);
  }

  function markBillAsPaidIfApplicable() {
    if (paymentContext.categoryKey === "spp" && currentSpp) {
      currentSpp.data.tagihan.forEach((item) => {
        if (currentSpp.selectedIds.has(item.id)) item.status = "paid";
      });
      currentSpp.selectedIds.clear();
      renderSppResult();
      return;
    }
    // Tagihan satuan (PLN/PDAM/Internet/Seminar): kunci ID pelanggan ini
    // di localStorage supaya tidak bisa dibayar dua kali.
    const oneOffCategories = ["pln", "pdam", "internet", "seminar"];
    if (oneOffCategories.includes(paymentContext.categoryKey)) {
      markBillPaid(paymentContext.categoryKey, paymentContext.refId);
      if (currentBill && currentBill.refId === paymentContext.refId) {
        renderBillResult(currentBill);
      }
    }
  }

  function renderReceipt(tx) {
    document.getElementById("modalReceiptBody").innerHTML = `
      <div class="receipt" id="receiptContent">
        <div class="receipt__brand">
          <svg viewBox="0 0 26 26" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 14 L10 20 L16 10"/>
            <line x1="20" y1="4" x2="20" y2="12"/>
            <line x1="16" y1="8" x2="24" y2="8"/>
          </svg>
          <span>Lunas+</span>
        </div>
        <div class="receipt__check"><i class="fa-solid fa-check"></i></div>
        <p class="receipt__status">Pembayaran Berhasil</p>
        <p class="receipt__amount">${formatRupiah(tx.amount)}</p>
        <div class="receipt__divider"></div>
        <div class="receipt__row"><span>ID Transaksi</span><span>${tx.id}</span></div>
        <div class="receipt__row"><span>Layanan</span><span>${tx.title}</span></div>
        <div class="receipt__row"><span>Referensi</span><span>${tx.refId}</span></div>
        <div class="receipt__row"><span>Metode</span><span>${tx.method}</span></div>
        <div class="receipt__row"><span>Kode Ref. Metode</span><span>${tx.methodRef}</span></div>
        <div class="receipt__row"><span>Waktu</span><span>${formatDateTime(tx.date)}</span></div>
        <div class="receipt__divider"></div>
        <p style="text-align:center;font-size:.72rem;color:var(--color-muted)">Simulasi struk Lunas+ — bukan transaksi nyata</p>
      </div>
      <div class="receipt__actions">
        <button class="btn btn--ghost" id="printReceiptBtn"><i class="fa-solid fa-print"></i> Cetak</button>
        <button class="btn btn--ghost" id="pdfReceiptBtn"><i class="fa-solid fa-file-pdf"></i> PDF</button>
        <button class="btn btn--primary" id="doneReceiptBtn">Selesai</button>
      </div>
    `;
    document.getElementById("printReceiptBtn").addEventListener("click", () => window.print());
    document.getElementById("pdfReceiptBtn").addEventListener("click", () => downloadReceiptPdf(tx));
    document.getElementById("doneReceiptBtn").addEventListener("click", () => {
      closeModal("modalReceipt");
      navigate("dashboard");
    });
  }

  function downloadReceiptPdf(tx) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "pt", format: [320, 500] });
      doc.setFont("courier", "normal");
      doc.setFontSize(14);
      doc.text("Lunas+ - Bukti Pembayaran", 20, 30);
      doc.setFontSize(10);
      let y = 60;
      const lines = [
        ["ID Transaksi", tx.id],
        ["Layanan", tx.title],
        ["Referensi", tx.refId],
        ["Jumlah", formatRupiah(tx.amount)],
        ["Metode", tx.method],
        ["Kode Ref. Metode", tx.methodRef],
        ["Waktu", formatDateTime(tx.date)],
        ["Status", "Berhasil"],
      ];
      lines.forEach(([label, val]) => {
        doc.text(`${label}: ${val}`, 20, y);
        y += 20;
      });
      doc.text("Simulasi struk, bukan transaksi nyata.", 20, y + 10);
      doc.save(`${tx.id}.pdf`);
      showToast("Struk PDF berhasil diunduh.", "success");
    } catch (err) {
      showToast("Gagal membuat PDF. Coba cetak struk sebagai alternatif.", "error");
    }
  }

  /* =========================================================
     RIWAYAT TRANSAKSI
     ========================================================= */
  function initRiwayat() {
    document.getElementById("filterKategori").addEventListener("change", renderRiwayat);
    document.getElementById("filterStatus").addEventListener("change", renderRiwayat);
    document.getElementById("exportCsvBtn").addEventListener("click", exportRiwayatCsv);
    document.getElementById("clearHistoryBtn").addEventListener("click", () => {
      if (getHistory().length === 0) { showToast("Riwayat sudah kosong.", "info"); return; }
      if (confirm("Hapus seluruh riwayat transaksi? Tindakan ini tidak dapat dibatalkan.")) {
        saveHistory([]);
        renderRiwayat();
        showToast("Riwayat transaksi dihapus.", "info");
      }
    });
  }

  /* Ekspor riwayat (sesuai filter yang sedang aktif) ke file CSV
     yang bisa dibuka di Excel/Google Sheets. */
  function exportRiwayatCsv() {
    const kategori = document.getElementById("filterKategori").value;
    const status = document.getElementById("filterStatus").value;
    let list = getHistory();
    if (kategori !== "all") list = list.filter((t) => t.category === kategori);
    if (status !== "all") list = list.filter((t) => t.status === status);

    if (list.length === 0) {
      showToast("Tidak ada data untuk diekspor.", "warning");
      return;
    }

    const header = ["ID Transaksi", "Kategori", "Layanan", "Referensi", "Jumlah (Rp)", "Metode", "Kode Ref. Metode", "Status", "Waktu"];
    const escapeCsv = (val) => `"${String(val).replace(/"/g, '""')}"`;
    const rows = list.map((tx) => [
      tx.id,
      categoryMeta[tx.category]?.label || categoryLongLabel(tx.category),
      tx.title,
      tx.refId,
      tx.amount,
      tx.method,
      tx.methodRef,
      tx.status === "success" ? "Berhasil" : "Menunggu",
      formatDateTime(tx.date),
    ].map(escapeCsv).join(","));

    const csvContent = "\uFEFF" + [header.map(escapeCsv).join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `lunasplus-riwayat-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`${list.length} transaksi berhasil diekspor ke CSV.`, "success");
  }

  function renderRiwayat() {
    const kategori = document.getElementById("filterKategori").value;
    const status = document.getElementById("filterStatus").value;
    let list = getHistory();
    if (kategori !== "all") list = list.filter((t) => t.category === kategori);
    if (status !== "all") list = list.filter((t) => t.status === status);

    const container = document.getElementById("riwayatList");
    const empty = document.getElementById("riwayatEmpty");
    if (list.length === 0) {
      container.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    container.innerHTML = list.map(txRowHtml).join("");

    renderRiwayatStats();
  }

  /* Kartu ringkasan + grafik doughnut proporsi pengeluaran per kategori,
     dihitung dari SELURUH riwayat (bukan hasil filter) agar konsisten
     sebagai gambaran umum kebiasaan bayar pengguna. */
  function renderRiwayatStats() {
    const all = getHistory();
    document.getElementById("statTotalTx").textContent = all.length;
    document.getElementById("statTotalAmount").textContent = formatRupiah(all.reduce((s, tx) => s + tx.amount, 0));

    const byCategory = computeSpendingByCategory(all);
    const topEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    document.getElementById("statTopCategory").textContent = topEntry
      ? (categoryMeta[topEntry[0]]?.label || categoryLongLabel(topEntry[0]))
      : "—";

    const canvas = document.getElementById("riwayatChart");
    const emptyMsg = document.getElementById("chartEmpty");
    if (!canvas || typeof Chart === "undefined") return;

    if (riwayatChartInstance) {
      riwayatChartInstance.destroy();
      riwayatChartInstance = null;
    }

    const entries = Object.entries(byCategory);
    if (entries.length === 0) {
      canvas.hidden = true;
      emptyMsg.hidden = false;
      return;
    }
    canvas.hidden = false;
    emptyMsg.hidden = true;

    const palette = ["#0F6657", "#1FAE7A", "#C9852B", "#5E7A74", "#2FBE8F", "#C74444"];
    riwayatChartInstance = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: entries.map(([key]) => categoryMeta[key]?.label || categoryLongLabel(key)),
        datasets: [{
          data: entries.map(([, val]) => val),
          backgroundColor: entries.map((_, i) => palette[i % palette.length]),
          borderWidth: 0,
        }],
      },
      options: {
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, font: { family: "Inter", size: 11 } } },
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.label}: ${formatRupiah(ctx.raw)}` },
          },
        },
        cutout: "62%",
      },
    });
  }

  /* =========================================================
     MISC (modal closers, field helpers, profil)
     ========================================================= */
  function initModalClosers() {
    document.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", () => closeModal(el.dataset.closeModal));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal--open").forEach((m) => closeModal(m.id));
      }
    });
  }

  function initMisc() {
    document.getElementById("resetSaldoBtn").addEventListener("click", () => {
      setSaldo(1500000);
      renderDashboard();
      showToast("Saldo simulasi direset ke Rp1.500.000.", "success");
    });
  }

  function setFieldError(errorId, inputId, message) {
    document.getElementById(errorId).innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
    document.getElementById(errorId).style.display = "flex";
    document.getElementById(inputId).classList.add("input--error");
    document.getElementById(inputId).classList.remove("input--valid");
  }
  function clearFieldError(errorId, inputId) {
    document.getElementById(errorId).textContent = "";
    document.getElementById(errorId).style.display = "none";
    document.getElementById(inputId).classList.remove("input--error");
  }

  function setBtnLoading(btn, loading) {
    btn.classList.toggle("btn--loading", loading);
    btn.disabled = loading;
  }

  function showLoadingOverlay(text) {
    document.getElementById("loadingText").textContent = text;
    document.getElementById("loadingOverlay").classList.add("loading-overlay--show");
  }
  function hideLoadingOverlay() {
    document.getElementById("loadingOverlay").classList.remove("loading-overlay--show");
  }

})();
