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
