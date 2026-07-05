/* =========================================================
   Lunas+ — data.js
   Seluruh data simulasi (hardcode). Tidak ada koneksi API nyata.
   ========================================================= */

const billData = {
  pln: {
    "112233445566": {
      name: "Siti Rahmawati",
      address: "Jl. Kenanga No. 12, Bandung",
      period: "Juni 2026",
      amount: 245000,
      fine: 0,
      dueDate: "2026-07-20",
    },
    "223344556677": {
      name: "Bagus Prasetyo",
      address: "Jl. Merdeka No. 88, Surabaya",
      period: "Juni 2026",
      amount: 178500,
      fine: 15000,
      dueDate: "2026-07-10",
    },
    "334455667788": {
      name: "Ani Kusuma",
      address: "Jl. Diponegoro No. 5, Semarang",
      period: "Juni 2026",
      amount: 412300,
      fine: 0,
      dueDate: "2026-07-25",
    },
    "445566778899": {
      name: "Rudi Hartono",
      address: "Jl. Sudirman No. 21, Jakarta",
      period: "Juni 2026",
      amount: 302000,
      fine: 25000,
      dueDate: "2026-07-05",
    },
    "556677889900": {
      name: "Dewi Lestari",
      address: "Jl. Ahmad Yani No. 3, Malang",
      period: "Juni 2026",
      amount: 156750,
      fine: 0,
      dueDate: "2026-07-18",
    },
  },

  pdam: {
    "PDAM001122": {
      name: "Hendra Wijaya",
      address: "Jl. Cendrawasih No. 9, Bogor",
      period: "Juni 2026",
      amount: 87500,
      fine: 0,
      dueDate: "2026-07-15",
    },
    "PDAM002233": {
      name: "Yuni Anggraini",
      address: "Jl. Pahlawan No. 44, Yogyakarta",
      period: "Juni 2026",
      amount: 63200,
      fine: 5000,
      dueDate: "2026-07-08",
    },
    "PDAM003344": {
      name: "Fajar Nugroho",
      address: "Jl. Veteran No. 17, Solo",
      period: "Juni 2026",
      amount: 102000,
      fine: 0,
      dueDate: "2026-07-22",
    },
  },

  internet: {
    "INET5566001": {
      name: "Lina Marlina",
      address: "Jl. Gatot Subroto No. 30, Jakarta",
      period: "Juli 2026",
      amount: 385000,
      fine: 0,
      dueDate: "2026-07-12",
    },
    "INET5566002": {
      name: "Arief Budiman",
      address: "Jl. Sisingamangaraja No. 6, Medan",
      period: "Juli 2026",
      amount: 320000,
      fine: 20000,
      dueDate: "2026-07-03",
    },
    "INET5566003": {
      name: "Maya Puspita",
      address: "Jl. Diponegoro No. 19, Denpasar",
      period: "Juli 2026",
      amount: 450000,
      fine: 0,
      dueDate: "2026-07-28",
    },
  },

  seminar: {
    "SEM2026A01": {
      name: "Workshop UI/UX Design Intensif",
      address: "Panitia: HMIF Universitas Nusantara",
      period: "Sesi 1 - 12 Juli 2026",
      amount: 150000,
      fine: 0,
      dueDate: "2026-07-11",
    },
    "SEM2026B02": {
      name: "Seminar Nasional Teknologi AI",
      address: "Panitia: Fakultas Ilmu Komputer",
      period: "Sesi Utama - 15 Juli 2026",
      amount: 75000,
      fine: 0,
      dueDate: "2026-07-14",
    },
    "SEM2026C03": {
      name: "Pelatihan Public Speaking",
      address: "Panitia: BEM Universitas Nusantara",
      period: "Batch 3 - 20 Juli 2026",
      amount: 100000,
      fine: 10000,
      dueDate: "2026-07-09",
    },
  },
};

/* Biaya kuliah / SPP per NIM (12 digit) */
const sppData = {
  "202310001234": {
    nama: "Muhammad Iqbal",
    prodi: "Teknik Informatika",
    semester: "Ganjil 2025/2026",
    tagihan: [
      { id: "9862489624861", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-1", amount: 2500000, status: "unpaid" },
      { id: "9862489624862", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-2", amount: 2500000, status: "unpaid" },
      { id: "9862489624863", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-3", amount: 2500000, status: "paid" },
      { id: "9862489624864", desc: "Uang Praktikum Semester Ganjil", amount: 750000, status: "unpaid" },
      { id: "9862489624865", desc: "Tagihan UTS - Semester 20252", amount: 300000, status: "unpaid" },
      { id: "9862489624866", desc: "Tagihan UAS - Semester 20252", amount: 300000, status: "unpaid" },
      { id: "9862489624867", desc: "Dana Kemahasiswaan Semester Ganjil", amount: 200000, status: "paid" },
    ],
  },
  "202310005678": {
    nama: "Ayu Anggreini",
    prodi: "Sistem Informasi",
    semester: "Ganjil 2025/2026",
    tagihan: [
      { id: "9862489624871", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-1", amount: 2200000, status: "paid" },
      { id: "9862489624872", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-2", amount: 2200000, status: "unpaid" },
      { id: "9862489624873", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-3", amount: 2200000, status: "unpaid" },
      { id: "9862489624874", desc: "Uang Praktikum Semester Ganjil", amount: 600000, status: "unpaid" },
      { id: "9862489624875", desc: "Tagihan UTS - Semester 20252", amount: 300000, status: "paid" },
      { id: "9862489624876", desc: "Tagihan UAS - Semester 20252", amount: 300000, status: "unpaid" },
    ],
  },
  "202410009988": {
    nama: "Bimo Saputra",
    prodi: "Desain Komunikasi Visual",
    semester: "Ganjil 2025/2026",
    tagihan: [
      { id: "9862489624881", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-1", amount: 1900000, status: "unpaid" },
      { id: "9862489624882", desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-2", amount: 1900000, status: "unpaid" },
      { id: "9862489624883", desc: "Uang Praktikum Studio", amount: 850000, status: "unpaid" },
      { id: "9862489624884", desc: "Tagihan UTS - Semester 20252", amount: 250000, status: "unpaid" },
      { id: "9862489624885", desc: "Tagihan UAS - Semester 20252", amount: 250000, status: "unpaid" },
      { id: "9862489624886", desc: "Dana Kemahasiswaan Semester Ganjil", amount: 200000, status: "unpaid" },
      { id: "9862489624887", desc: "Sumbangan Pengembangan Alat Studio", amount: 500000, status: "paid" },
      { id: "9862489624888", desc: "Denda Keterlambatan Cicilan ke-3 Semester Lalu", amount: 75000, status: "unpaid" },
    ],
  },
};

/* Prefix nomor HP -> provider (untuk deteksi & validasi otomatis) */
const providerPrefixes = {
  Telkomsel: ["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"],
  "Indosat Ooredoo": ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
  "XL Axiata": ["0817", "0818", "0819", "0859", "0877", "0878"],
  Axis: ["0831", "0832", "0833", "0838"],
  "Tri (3)": ["0895", "0896", "0897", "0898", "0899"],
  Smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
};

const providers = [
  { key: "telkomsel", name: "Telkomsel", color: "#E2001A", colorDark: "#8F0011", initial: "TS" },
  { key: "xl", name: "XL Axiata", color: "#1A5FB4", colorDark: "#0D3568", initial: "XL" },
  { key: "indosat", name: "Indosat Ooredoo", color: "#FFD200", colorDark: "#B89400", dark: true, initial: "IO" },
  { key: "tri", name: "Tri (3)", color: "#6F2C91", colorDark: "#401A54", initial: "3" },
  { key: "smartfren", name: "Smartfren", color: "#E4002B", colorDark: "#8C001A", initial: "SF" },
  { key: "axis", name: "Axis", color: "#7A1FA2", colorDark: "#481260", initial: "AX" },
];

const pulsaNominal = [10000, 25000, 50000, 100000, 200000];

const paketData = [
  { id: "pd1", name: "Combo Sakti 3GB / 30 Hari", price: 35000 },
  { id: "pd2", name: "Combo Sakti 8GB / 30 Hari", price: 55000 },
  { id: "pd3", name: "Combo Sakti 17GB / 30 Hari", price: 85000 },
  { id: "pd4", name: "Unlimited Malam 2GB / 7 Hari", price: 20000 },
];

const bankList = [
  { code: "BCA", name: "Bank Central Asia" },
  { code: "BNI", name: "Bank Negara Indonesia" },
  { code: "MANDIRI", name: "Bank Mandiri" },
  { code: "BRI", name: "Bank Rakyat Indonesia" },
];

const tellerLocations = [
  { name: "Alfamart - Jl. Kenanga No. 10", hours: "06.00 - 23.00" },
  { name: "Indomaret - Jl. Merdeka No. 55", hours: "24 Jam" },
  { name: "Kantor Pos - Jl. Sudirman No. 1", hours: "08.00 - 16.00" },
  { name: "Loket PPOB - Jl. Diponegoro No. 8", hours: "08.00 - 20.00" },
];

const categoryMeta = {
  pln: { label: "Listrik (PLN)", icon: "bolt", idLabel: "ID Pelanggan PLN", idHint: "12 digit angka", pattern: /^\d{12}$/ },
  pdam: { label: "PDAM", idLabel: "Nomor Pelanggan PDAM", idHint: "Contoh: PDAM001122", pattern: /^[A-Za-z0-9]{8,12}$/ },
  internet: { label: "Internet", idLabel: "Nomor Pelanggan Internet", idHint: "Contoh: INET5566001", pattern: /^[A-Za-z0-9]{8,12}$/ },
  seminar: { label: "Seminar / Event", idLabel: "Kode Referensi Seminar", idHint: "Contoh: SEM2026A01", pattern: /^[A-Za-z0-9]{8,12}$/ },
};
