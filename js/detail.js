/* ================================================================
   js/detail.js — dipakai oleh detail.html
   Ganti API_URL sesuai lokasi folder "api" di server Anda.
   ================================================================ */
const API_URL = "http://localhost/SENSUS/api";

const loadingEl = document.getElementById("loading");
const contentEl = document.getElementById("detailContent");

function formatRupiah(num){
  const rounded = Math.round(num || 0);
  const sign = rounded < 0 ? "-" : "";
  const abs = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return "Rp " + sign + abs;
}

function formatTanggal(iso){
  try{
    return new Date(iso).toLocaleString("id-ID", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
  }catch(e){ return iso; }
}

function escapeHtml(str){
  const d = document.createElement("div");
  d.textContent = str == null ? "" : String(str);
  return d.innerHTML;
}

/* ---------- helper untuk membangun satu baris "info-item" ---------- */
function infoItem(label, value, wide){
  if(value === "" || value == null) return "";
  return `<div class="info-item${wide ? " wide" : ""}">
    <span class="info-label">${label}</span>
    <span class="info-value">${value}</span>
  </div>`;
}
function infoMoney(label, num){
  if(!num) return "";
  return infoItem(label, formatRupiah(num));
}
function infoText(label, val){
  const clean = (val || "").toString().trim();
  if(!clean) return "";
  return infoItem(label, escapeHtml(clean));
}
function infoNum(label, num, satuan){
  if(!num) return "";
  return infoItem(label, num + (satuan ? " " + satuan : ""));
}
function chips(list){
  return `<div class="tags">${list.map(v => `<span class="chip">${escapeHtml(v)}</span>`).join("")}</div>`;
}

/* ---------- susun seluruh halaman detail ---------- */
function buildDetailHtml(r){
  const u = r.umum, p = r.pendapatanRT, g = r.pengeluaranRT, s = r.ringkasan;
  let html = `<div class="detail-content">`;

  // ---- hero: nama KK + info singkat ----
  html += `<div class="detail-hero">
    <div class="eyebrow">Kartu Keluarga</div>
    <h1>${escapeHtml(u.kkNama) || "(Tanpa Nama)"}</h1>
    <div class="detail-meta">
      ${u.noUrutBangunan ? `<span>No. Urut ${escapeHtml(u.noUrutBangunan)}</span>` : ""}
      ${u.jenisBangunan ? `<span>${escapeHtml(u.jenisBangunan)}</span>` : ""}
      ${u.anggotaMenetap ? `<span>${u.anggotaMenetap} orang menetap</span>` : ""}
      ${r.petugas ? `<span>Petugas: ${escapeHtml(r.petugas)}</span>` : ""}
      <span>Disimpan ${formatTanggal(r.tanggal)}</span>
    </div>
  </div>`;

  // ---- 1. Data Umum ----
  html += `<div class="detail-section">
    <div class="section-heading"><div class="section-icon">1</div><h2>Data Umum</h2></div>
    <div class="info-grid">
      ${infoText("No. ID Pelanggan Listrik", u.idListrik)}
      ${infoNum("Anggota Menetap", u.anggotaMenetap, "orang")}
      ${(u.kkTertaut && u.kkTertaut.length) ? `<div class="info-item wide"><span class="info-label">KK Tertaut</span>${chips(u.kkTertaut)}</div>` : ""}
    </div>
  </div>`;

  // ---- 2. Usaha Keluarga (kalau ada) ----
  if(r.usahaList && r.usahaList.length){
    html += `<div class="detail-section">
      <div class="section-heading"><div class="section-icon">2</div><h2>Usaha Keluarga</h2></div>
      <div class="usaha-list">`;
    r.usahaList.forEach((us, idx)=>{
      const totalPengeluaranUsaha = us.gaji + us.biayaProduksi + us.biayaPembelian + us.biayaOperasional + us.biayaNonOperasional;
      const totalPendapatanUsaha = us.pendapatanUtama + us.pendapatanLainnya;
      html += `<div class="usaha-card">
        <div class="card-title"><span>Usaha ${idx+1}</span><strong>${escapeHtml(us.namaUsaha) || "(Tanpa Nama)"}</strong></div>
        ${(us.jenisUsaha && us.jenisUsaha.length) ? `<div class="usaha-tags"><span>Jenis</span>${chips(us.jenisUsaha)}</div>` : ""}
        <div class="info-grid single">
          ${infoText("Pengusaha", us.namaPengusaha)}
          ${infoText("Alamat", us.alamat)}
          ${infoText("NIB", us.nib)}
          ${infoText("Lokasi", us.lokasi)}
          ${infoText("Kegiatan", us.kegiatan)}
          ${infoText("Tahun Mulai", us.tahunMulai)}
          ${infoNum("Karyawan Laki-laki", us.karyawanL, "orang")}
          ${infoNum("Karyawan Perempuan", us.karyawanP, "orang")}
          ${infoNum("Karyawan Dibayar", us.karyawanDibayar, "orang")}
          ${infoNum("Karyawan Tidak Dibayar", us.karyawanTidakDibayar, "orang")}
          ${infoMoney("Gaji Karyawan", us.gaji)}
          ${infoMoney("Biaya Produksi", us.biayaProduksi)}
          ${infoMoney("Biaya Pembelian", us.biayaPembelian)}
          ${infoMoney("Biaya Operasional", us.biayaOperasional)}
          ${infoMoney("Biaya Non-Operasional", us.biayaNonOperasional)}
          ${infoItem("Total Pengeluaran Usaha", formatRupiah(totalPengeluaranUsaha), true)}
          ${infoMoney("Pendapatan Utama", us.pendapatanUtama)}
          ${infoMoney("Pendapatan Lainnya", us.pendapatanLainnya)}
          ${infoItem("Total Pendapatan Usaha", formatRupiah(totalPendapatanUsaha), true)}
          ${infoMoney("Nilai Aset Tanah", us.asetTanah)}
          ${infoMoney("Nilai Aset Non Bangunan", us.asetNonBangunan)}
          ${infoNum("Luas Bangunan", parseFloat(us.luasBangunan) || 0, "m²")}
        </div>
      </div>`;
    });
    html += `</div></div>`;
  }

  // ---- 3. Pendapatan & Pengeluaran Rumah Tangga (bersebelahan) ----
  html += `<div class="detail-section">
    <div class="section-heading"><div class="section-icon">3</div><h2>Pendapatan &amp; Pengeluaran Rumah Tangga</h2></div>
    <div class="member-grid">
      <div class="member-card">
        <div class="card-title"><strong>Gaji Suami &amp; Istri</strong></div>
        <div class="info-grid single">
          ${infoMoney("Suami — kerja", p.suamiKerja)}
          ${infoMoney("Suami — usaha sendiri", p.suamiUsaha)}
          ${infoMoney("Suami — transfer/pensiun", p.suamiTransfer)}
          ${infoMoney("Istri — kerja", p.istriKerja)}
          ${infoMoney("Istri — usaha sendiri", p.istriUsaha)}
          ${infoMoney("Istri — transfer/pensiun", p.istriTransfer)}
        </div>
      </div>
      <div class="member-card">
        <div class="card-title"><strong>Tagihan &amp; Kebutuhan</strong></div>
        <div class="info-grid single">
          ${infoMoney("Listrik/bulan", g.listrik)}
          ${infoMoney("WiFi/bulan", g.wifi)}
          ${infoMoney("Non-makan bulanan", g.nonMakanBulanan)}
          ${infoMoney("Makan/minggu (×4)", g.makanMinggu * 4)}
          ${infoMoney("Non-makan tahunan (÷12)", g.nonMakanTahunan / 12)}
        </div>
      </div>
    </div>
  </div>`;

  // ---- 4. Ringkasan ----
  const selisihClass = s.selisih > 0 ? "plus" : (s.selisih < 0 ? "minus" : "");
  html += `<div class="detail-section">
    <div class="section-heading"><div class="section-icon">4</div><h2>Ringkasan</h2></div>
    <div class="summary-grid">
      <div class="summary-card"><span>Pendapatan RT</span><strong>${formatRupiah(s.pendapatanRumahTangga)}</strong></div>
      <div class="summary-card"><span>Pendapatan Usaha</span><strong>${formatRupiah(s.pendapatanUsaha)}</strong></div>
      <div class="summary-card"><span>Pengeluaran RT</span><strong>${formatRupiah(s.pengeluaranRumahTangga)}</strong></div>
      <div class="summary-card"><span>Pengeluaran Usaha</span><strong>${formatRupiah(s.pengeluaranUsaha)}</strong></div>
    </div>
    <div class="final-balance">
      <span>Selisih Bulanan (Total Pendapatan − Total Pengeluaran)</span>
      <strong class="${selisihClass}">${formatRupiah(s.selisih)}</strong>
    </div>
  </div>`;

  html += `</div>`; // /detail-content
  return html;
}

/* ---------- ambil id dari alamat halaman (?id=...) lalu tampilkan ---------- */
async function muatDetail(){
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  if(!id){
    loadingEl.style.display = "none";
    contentEl.innerHTML = `<p class="empty-note">ID data tidak ditemukan di alamat halaman.</p>`;
    return;
  }

  try{
    const res = await fetch(`${API_URL}/detail.php?id=${encodeURIComponent(id)}`);
    if(!res.ok) throw new Error("Data tidak ditemukan");
    const row = await res.json();

    const record = {
      tanggal: row.created_at,
      petugas: row.petugas,
      umum: {
        kkNama: row.kk_nama,
        noUrutBangunan: row.no_urut_bangunan,
        jenisBangunan: row.jenis_bangunan,
        anggotaMenetap: row.anggota_menetap,
        idListrik: row.id_listrik,
        kkTertaut: row.kkTertaut || []
      },
      pendapatanRT: {
        suamiKerja: +row.suami_kerja, suamiUsaha: +row.suami_usaha, suamiTransfer: +row.suami_transfer,
        istriKerja: +row.istri_kerja, istriUsaha: +row.istri_usaha, istriTransfer: +row.istri_transfer
      },
      pengeluaranRT: {
        listrik: +row.listrik, wifi: +row.wifi, nonMakanBulanan: +row.nonmakan_bulanan,
        makanMinggu: +row.makan_minggu, nonMakanTahunan: +row.nonmakan_tahunan
      },
      usahaList: (row.usahaList || []).map(u => ({
        namaPengusaha: u.nama_pengusaha, namaUsaha: u.nama_usaha, alamat: u.alamat,
        nib: u.nib, kegiatan: u.kegiatan, lokasi: u.lokasi,
        karyawanL: +u.karyawan_l, karyawanP: +u.karyawan_p,
        karyawanDibayar: +u.karyawan_dibayar, karyawanTidakDibayar: +u.karyawan_tidak_dibayar,
        tahunMulai: u.tahun_mulai,
        gaji: +u.gaji, biayaProduksi: +u.biaya_produksi, biayaPembelian: +u.biaya_pembelian,
        biayaOperasional: +u.biaya_operasional, biayaNonOperasional: +u.biaya_non_operasional,
        pendapatanUtama: +u.pendapatan_utama, pendapatanLainnya: +u.pendapatan_lainnya,
        asetTanah: +u.aset_tanah, asetNonBangunan: +u.aset_non_bangunan, luasBangunan: u.luas_bangunan,
        jenisUsaha: u.jenisUsaha || []
      })),
      ringkasan: {
        pendapatanRumahTangga: +row.pendapatan_rumah_tangga,
        pendapatanUsaha: +row.pendapatan_usaha,
        totalPendapatan: +row.total_pendapatan,
        pengeluaranRumahTangga: +row.pengeluaran_rumah_tangga,
        pengeluaranUsaha: +row.pengeluaran_usaha,
        totalPengeluaran: +row.total_pengeluaran,
        selisih: +row.selisih
      }
    };

    contentEl.innerHTML = buildDetailHtml(record);
  }catch(e){
    contentEl.innerHTML = `<p class="empty-note">Data tidak ditemukan, mungkin sudah dihapus.</p>`;
    console.error(e);
  }finally{
    loadingEl.style.display = "none";
  }
}

muatDetail();
