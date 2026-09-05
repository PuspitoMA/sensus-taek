const DATA_URL = "data/data.json";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function formatRupiah(value) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function formatTanggal(value) {
  if (!value) return "-";
  const d = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return escapeHtml(value);
  return d.toLocaleDateString("id-ID", {
    day:"2-digit", month:"long", year:"numeric"
  });
}

function text(value) {
  return hasValue(value) ? escapeHtml(value) : "";
}

function money(value) {
  return hasValue(value) && Number(value) !== 0 ? formatRupiah(value) : "";
}

function detailRow(label, value) {
  if (!hasValue(value)) return "";
  return `<div class="detail-row">
    <span class="detail-label">${escapeHtml(label)}</span>
    <span class="detail-value">${value}</span>
  </div>`;
}

function section(title, content) {
  if (!content || !String(content).trim()) return "";
  return `<section class="detail-block">
    <h2>${escapeHtml(title)}</h2>${content}
  </section>`;
}

function buildDetailHtml(r) {
  const kkTertaut = Array.isArray(r.kkTertaut) ? r.kkTertaut.filter(hasValue) : [];
  const anggotaLain = Array.isArray(r.anggotaLain)
    ? r.anggotaLain
    : (Array.isArray(r.anggotaLainList) ? r.anggotaLainList : []);
  const usahaList = Array.isArray(r.usahaList) ? r.usahaList : [];

  let umum = "";
  umum += detailRow("Petugas", text(r.petugas));
  umum += detailRow("No. urut bangunan", text(r.no_urut_bangunan));
  umum += detailRow("Jenis bangunan", text(r.jenis_bangunan));
  umum += detailRow("Anggota menetap", text(r.anggota_menetap));
  umum += detailRow("ID listrik", text(r.id_listrik));

  if (kkTertaut.length) {
    umum += `<div class="detail-row detail-row-wide">
      <span class="detail-label">KK tertaut</span>
      <span class="detail-value chip-list">
        ${kkTertaut.map(x => `<span class="chip">${escapeHtml(x)}</span>`).join("")}
      </span>
    </div>`;
  }

  let pendapatan = "";
  pendapatan += detailRow("Suami — bekerja", text(r.suami_kerja));
  pendapatan += detailRow("Suami — pekerjaan", text(r.suami_pekerjaan));
  pendapatan += detailRow("Suami — usaha sendiri", text(r.suami_usaha));
  pendapatan += detailRow("Suami — transfer", money(r.suami_transfer));
  pendapatan += detailRow("Istri — bekerja", text(r.istri_kerja));
  pendapatan += detailRow("Istri — pekerjaan", text(r.istri_pekerjaan));
  pendapatan += detailRow("Istri — usaha sendiri", text(r.istri_usaha));
  pendapatan += detailRow("Istri — transfer", money(r.istri_transfer));

  let pengeluaran = "";
  pengeluaran += detailRow("Listrik", money(r.listrik));
  pengeluaran += detailRow("WiFi", money(r.wifi));
  pengeluaran += detailRow("Non-makan bulanan", money(r.nonmakan_bulanan));
  pengeluaran += detailRow("Makan mingguan", money(r.makan_minggu));
  pengeluaran += detailRow("Non-makan tahunan", money(r.nonmakan_tahunan));

  let usahaHtml = "";
  if (usahaList.length) {
    usahaHtml = usahaList.map((u, i) => {
      let rows = "";
      rows += detailRow("Nama pengusaha", text(u.nama_pengusaha));
      rows += detailRow("Nama usaha", text(u.nama_usaha));
      rows += detailRow("Kegiatan", text(u.kegiatan));
      rows += detailRow("Alamat", text(u.alamat));
      rows += detailRow("Lokasi", text(u.lokasi));
      rows += detailRow("NIB", text(u.nib));
      rows += detailRow("Tahun mulai", text(u.tahun_mulai));
      rows += detailRow("Karyawan laki-laki", text(u.karyawan_l));
      rows += detailRow("Karyawan perempuan", text(u.karyawan_p));
      rows += detailRow("Karyawan dibayar", text(u.karyawan_dibayar));
      rows += detailRow("Karyawan tidak dibayar", text(u.karyawan_tidak_dibayar));
      rows += detailRow("Gaji", money(u.gaji));
      rows += detailRow("Biaya produksi", money(u.biaya_produksi));
      rows += detailRow("Biaya pembelian", money(u.biaya_pembelian));
      rows += detailRow("Biaya operasional", money(u.biaya_operasional));
      rows += detailRow("Biaya non-operasional", money(u.biaya_non_operasional));
      rows += detailRow("Pendapatan utama", money(u.pendapatan_utama));
      rows += detailRow("Pendapatan lainnya", money(u.pendapatan_lainnya));
      rows += detailRow("Aset tanah", money(u.aset_tanah));
      rows += detailRow("Aset non-bangunan", money(u.aset_non_bangunan));
      rows += detailRow("Luas bangunan", text(u.luas_bangunan));

      const jenis = Array.isArray(u.jenisUsaha) ? u.jenisUsaha.filter(hasValue) : [];
      const jenisHtml = jenis.length ? `<div class="usaha-jenis">
        <span class="detail-label">Jenis usaha</span>
        <div class="chip-list">${jenis.map(j => `<span class="chip">${escapeHtml(j)}</span>`).join("")}</div>
      </div>` : "";

      return `<div class="usaha-card">
        <h3>Usaha ${i + 1}${hasValue(u.nama_usaha) ? ` — ${escapeHtml(u.nama_usaha)}` : ""}</h3>
        <div class="detail-grid">${rows}</div>${jenisHtml}
      </div>`;
    }).join("");
  }

  let anggotaHtml = "";
  const anggotaValid = anggotaLain.filter(a => a && Object.values(a).some(hasValue));
  if (anggotaValid.length) {
    anggotaHtml = anggotaValid.map((a, i) => {
      let rows = "";
      rows += detailRow("Nama", text(a.nama));
      rows += detailRow("Pekerjaan", text(a.pekerjaan));
      rows += detailRow("Bekerja", text(a.kerja));
      rows += detailRow("Usaha sendiri", text(a.usaha_sendiri));
      rows += detailRow("Transfer", money(a.transfer));
      return `<div class="member-card">
        <h3>Anggota lain ${i + 1}</h3>
        <div class="detail-grid">${rows}</div>
      </div>`;
    }).join("");
  }

  const selisih = Number(r.selisih || 0);

  const summary = `
    <div class="detail-summary">
      ${hasValue(r.pendapatan_rumah_tangga) ? `<div class="summary-card">
        <div class="label">Pendapatan rumah tangga</div>
        <div class="value">${formatRupiah(r.pendapatan_rumah_tangga)}</div>
      </div>` : ""}
      ${hasValue(r.pengeluaran_rumah_tangga) ? `<div class="summary-card">
        <div class="label">Pengeluaran rumah tangga</div>
        <div class="value">${formatRupiah(r.pengeluaran_rumah_tangga)}</div>
      </div>` : ""}
      ${Number(r.pendapatan_usaha || 0) !== 0 ? `<div class="summary-card">
        <div class="label">Pendapatan usaha</div>
        <div class="value">${formatRupiah(r.pendapatan_usaha)}</div>
      </div>` : ""}
      ${Number(r.pengeluaran_usaha || 0) !== 0 ? `<div class="summary-card">
        <div class="label">Pengeluaran usaha</div>
        <div class="value">${formatRupiah(r.pengeluaran_usaha)}</div>
      </div>` : ""}
    </div>
    <div class="summary-final">
      <span>Selisih akhir</span>
      <strong class="${selisih >= 0 ? "selisih-plus" : "selisih-minus"}">${formatRupiah(selisih)}</strong>
    </div>`;

  return `<div class="detail-content">
    <h1 class="detail-title">${text(r.kk_nama) || "Tanpa Nama"}</h1>
    <div class="detail-meta">
      ${hasValue(r.petugas) ? `<span>Petugas: <strong>${text(r.petugas)}</strong></span>` : ""}
      ${hasValue(r.created_at) ? `<span>${formatTanggal(r.created_at)}</span>` : ""}
    </div>

    ${section("Data Umum", `<div class="detail-grid">${umum}</div>`)}
    ${section("Usaha Keluarga", usahaHtml)}
    ${section("Pendapatan Rumah Tangga", `<div class="detail-grid">${pendapatan}</div>`)}
    ${section("Anggota Lain", anggotaHtml)}
    ${section("Pengeluaran Rumah Tangga", `<div class="detail-grid">${pengeluaran}</div>`)}
    ${section("Ringkasan", summary)}
  </div>`;
}

async function init() {
  const loading = document.getElementById("loading");
  const content = document.getElementById("detailContent");
  const id = new URLSearchParams(location.search).get("id");

  if (!id) {
    loading.style.display = "none";
    content.innerHTML = '<div class="empty-note">ID data tidak ditemukan.</div>';
    return;
  }

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("Data gagal dimuat");

    const data = await response.json();
    const keluarga = (data.keluarga || []).find(
      item => String(item.id) === String(id)
    );

    if (!keluarga) throw new Error("Data tidak ditemukan");

    document.title = `Sensus Taek — ${keluarga.kk_nama || "Detail"}`;
    loading.style.display = "none";
    content.innerHTML = buildDetailHtml(keluarga);
  } catch (error) {
    console.error(error);
    loading.textContent = "Gagal memuat detail. Pastikan dibuka menggunakan Live Server.";
  }
}

init();
