const DATA_URL = "data/data.json";

let semuaData = [];
let petugasAktif = "all";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatRupiah(value) {
  const n = Number(value || 0);
  return "Rp " + new Intl.NumberFormat("id-ID").format(n);
}

function formatTanggal(value) {
  if (!value) return "-";
  const d = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return escapeHtml(value);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function renderDaftar() {
  const body = document.getElementById("tabelDaftarBody");
  const table = document.getElementById("tabelDaftar");
  const empty = document.getElementById("tabelKosong");

  const rows = petugasAktif === "all"
    ? semuaData
    : semuaData.filter(r => String(r.petugas || "") === petugasAktif);

  body.innerHTML = "";

  if (!rows.length) {
    table.style.display = "none";
    empty.style.display = "block";
    empty.textContent = petugasAktif === "all"
      ? "Belum ada data yang disimpan."
      : `Belum ada data untuk petugas ${petugasAktif}.`;
    return;
  }

  empty.style.display = "none";
  table.style.display = "table";

  rows.forEach(r => {
    const selisih = Number(r.selisih || 0);
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <div class="nama-kk">${escapeHtml(r.kk_nama || "-")}</div>
      </td>
      <td class="subtle">${escapeHtml(r.petugas || "-")}</td>
      <td class="subtle">${formatTanggal(r.created_at)}</td>
      <td class="${selisih >= 0 ? "selisih-plus" : "selisih-minus"}">
        ${formatRupiah(selisih)}
      </td>
      <td>
        <a class="btn-lihat" href="detail.html?id=${encodeURIComponent(r.id)}">
          Lihat
        </a>
      </td>
    `;

    body.appendChild(tr);
  });
}

async function init() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("Data gagal dimuat");

    const data = await response.json();
    semuaData = Array.isArray(data.keluarga) ? data.keluarga : [];

    document.getElementById("loading").style.display = "none";
    renderDaftar();
  } catch (error) {
    console.error(error);
    const loading = document.getElementById("loading");
    loading.textContent = "Gagal memuat data. Jalankan folder ini dengan Live Server.";
  }
}

document.querySelectorAll(".tab-petugas").forEach(tab => {
  tab.addEventListener("click", event => {
    event.preventDefault();

    document.querySelectorAll(".tab-petugas")
      .forEach(t => t.classList.remove("active"));

    tab.classList.add("active");
    petugasAktif = tab.dataset.val;
    renderDaftar();
  });
});

init();
