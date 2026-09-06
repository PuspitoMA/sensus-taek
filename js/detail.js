const DATA_URL = "data/data.json";

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

function val(value) {
  return value === null || value === undefined || value === "" ? "-" : escapeHtml(value);
}

function rupiah(value) {
  if (value === null || value === undefined || value === "") return "Rp 0";
  return formatRupiah(value);
}

function detailRow(label, value) {
  return `
    <div class="detail-row">
      <span class="detail-label">${escapeHtml(label)}</span>
      <span class="detail-value">${value}</span>
    </div>
  `;
}

function buildDetailHtml(r) {
  const kkTertaut = Array.isArray(r.kkTertaut) ? r.kkTertaut : [];
  const anggotaLain = Array.isArray(r.anggotaLain)
    ? r.anggotaLain
    : (Array.isArray(r.anggotaLainList) ? r.anggotaLainList : []);
  const usahaList = Array.isArray(r.usahaList) ? r.usahaList : [];

  const chips = kkTertaut.length
    ? kkTertaut.map(x => `<span class="chip">${escapeHtml(x)}</span>`).join("")
    : '<span class="muted">Tidak ada KK tertaut.</span>';

  const usahaHtml = usahaList.length
    ? usahaList.map((u, i) => {
        const jenis = Array.isArray(u.jenisUsaha) ? u.jenisUsaha : [];
        return `
          <div class="usaha-card">
            <h3>Usaha ${i + 1}: ${val(u.nama_usaha)}</h3>
            <div class="usaha-grid">
              ${detailRow("Nama pengusaha", val(u.nama_pengusaha))}
              ${detailRow("Kegiatan", val(u.kegiatan))}
              ${detailRow("Alamat", val(u.alamat))}
              ${detailRow("Lokasi", val(u.lokasi))}
              ${detailRow("NIB", val(u.nib))}
              ${detailRow("Tahun mulai", val(u.tahun_mulai))}
              ${detailRow("Karyawan laki-laki", val(u.karyawan_l))}
              ${detailRow("Karyawan perempuan", val(u.karyawan_p))}
              ${detailRow("Karyawan dibayar", val(u.karyawan_dibayar))}
              ${detailRow("Karyawan tidak dibayar", val(u.karyawan_tidak_dibayar))}
              ${detailRow("Gaji", rupiah(u.gaji))}
              ${detailRow("Biaya produksi", rupiah(u.biaya_produksi))}
              ${detailRow("Biaya pembelian", rupiah(u.biaya_pembelian))}
              ${detailRow("Biaya operasional", rupiah(u.biaya_operasional))}
              ${detailRow("Biaya non-operasional", rupiah(u.biaya_non_operasional))}
              ${detailRow("Pendapatan utama", rupiah(u.pendapatan_utama))}
              ${detailRow("Pendapatan lainnya", rupiah(u.pendapatan_lainnya))}
              ${detailRow("Aset tanah", rupiah(u.aset_tanah))}
              ${detailRow("Aset non-bangunan", rupiah(u.aset_non_bangunan))}
              ${detailRow("Luas bangunan", val(u.luas_bangunan))}
            </div>
            <div style="margin-top:10px;">
              <span class="detail-label">Jenis usaha:</span>
              <div>
                ${jenis.length
                  ? jenis.map(j => `<span class="chip">${escapeHtml(j)}</span>`).join("")
                  : '<span class="muted">-</span>'}
              </div>
            </div>
          </div>
        `;
      }).join("")
    : '<div class="empty-note">Tidak ada data usaha.</div>';

  const anggotaHtml = anggotaLain.length
    ? anggotaLain.map((a, i) => `
        <div class="member-card">
          <h3>Anggota lain ${i + 1}</h3>
          ${detailRow("Nama", val(a.nama))}
          ${detailRow("Pekerjaan", val(a.pekerjaan))}
          ${detailRow("Bekerja", val(a.kerja))}
          ${detailRow("Usaha sendiri", val(a.usaha_sendiri))}
          ${detailRow("Transfer", rupiah(a.transfer))}
        </div>
      `).join("")
    : '<div class="empty-note">Tidak ada anggota lain.</div>';

  const selisih = Number(r.selisih || 0);

  return `
    <div class="detail-content">
      <h1 class="detail-title">${val(r.kk_nama)}</h1>

      <div class="detail-meta">
        <span>Petugas: <strong>${val(r.petugas)}</strong></span>
        <span>Tanggal simpan: <strong>${formatTanggal(r.created_at)}</strong></span>
      </div>

      <section class="detail-block">
        <h2>Data Umum</h2>
        <div class="detail-grid">
          ${detailRow("Nama Kartu Keluarga", val(r.kk_nama))}
          ${detailRow("Petugas", val(r.petugas))}
          ${detailRow("No. urut bangunan", val(r.no_urut_bangunan))}
          ${detailRow("Jenis bangunan", val(r.jenis_bangunan))}
          ${detailRow("Anggota menetap", val(r.anggota_menetap))}
          ${detailRow("ID listrik", val(r.id_listrik))}
        </div>

        <div class="review-rt">
          <strong>KK tertaut</strong>
          <div style="margin-top:5px;">${chips}</div>
        </div>
      </section>

      <section class="detail-block">
        <h2>Usaha Keluarga</h2>
        ${usahaHtml}
      </section>

      <section class="detail-block">
        <h2>Pendapatan Rumah Tangga</h2>
        <div class="detail-grid">
          ${detailRow("Suami — bekerja", val(r.suami_kerja))}
          ${detailRow("Suami — pekerjaan", val(r.suami_pekerjaan))}
          ${detailRow("Suami — usaha sendiri", val(r.suami_usaha))}
          ${detailRow("Suami — transfer", rupiah(r.suami_transfer))}
          ${detailRow("Istri — bekerja", val(r.istri_kerja))}
          ${detailRow("Istri — pekerjaan", val(r.istri_pekerjaan))}
          ${detailRow("Istri — usaha sendiri", val(r.istri_usaha))}
          ${detailRow("Istri — transfer", rupiah(r.istri_transfer))}
          ${detailRow("Total pendapatan rumah tangga", rupiah(r.pendapatan_rumah_tangga))}
        </div>
      </section>

      <section class="detail-block">
        <h2>Anggota Lain</h2>
        ${anggotaHtml}
      </section>

      <section class="detail-block">
        <h2>Pengeluaran Rumah Tangga</h2>
        <div class="detail-grid">
          ${detailRow("Listrik", rupiah(r.listrik))}
          ${detailRow("WiFi", rupiah(r.wifi))}
          ${detailRow("Non-makan bulanan", rupiah(r.nonmakan_bulanan))}
          ${detailRow("Makan mingguan", rupiah(r.makan_minggu))}
          ${detailRow("Non-makan tahunan", rupiah(r.nonmakan_tahunan))}
          ${detailRow("Total pengeluaran rumah tangga", rupiah(r.pengeluaran_rumah_tangga))}
        </div>
      </section>

      <section class="detail-block">
        <h2>Ringkasan</h2>
        <div class="detail-summary">
          <div class="summary-card">
            <div class="label">Pendapatan</div>
            <div class="value">${rupiah(r.total_pendapatan)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Pengeluaran</div>
            <div class="value">${rupiah(r.total_pengeluaran)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Selisih</div>
            <div class="value ${selisih >= 0 ? "selisih-plus" : "selisih-minus"}">
              ${rupiah(selisih)}
            </div>
          </div>
        </div>

        <div class="review-rt">
          <strong>Ringkasan usaha</strong><br>
          Pendapatan usaha: ${rupiah(r.pendapatan_usaha)}<br>
          Pengeluaran usaha: ${rupiah(r.pengeluaran_usaha)}
        </div>
      </section>
    </div>
  `;
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

    if (!keluarga) {
      throw new Error("Data tidak ditemukan");
    }

    document.title = `Sensus Taek — ${keluarga.kk_nama || "Detail"}`;
    loading.style.display = "none";
    content.innerHTML = buildDetailHtml(keluarga);
  } catch (error) {
    console.error(error);
    loading.textContent =
      "Gagal memuat detail. Pastikan dibuka menggunakan Live Server.";
  }
}

init();
