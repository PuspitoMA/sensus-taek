/* ================================================================
   js/daftar.js — dipakai oleh index.html (Halaman Hasil / Daftar)
   Ganti API_URL sesuai lokasi folder "api" di server Anda.
   ================================================================ */
   const API_URL = "http://localhost/SENSUS/api";

   const loadingEl = document.getElementById("loading");
   const emptyEl   = document.getElementById("tabelKosong");
   const tableEl   = document.getElementById("tabelDaftar");
   const tbodyEl   = document.getElementById("tabelDaftarBody");
   const tabsEl    = document.getElementById("petugasTabs");
   
   let semuaData   = [];
   let filterAktif = "all";
   
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
   
   /* ---------- render tabel sesuai filter petugas yang aktif ---------- */
   function renderTabel(){
     const data = filterAktif === "all"
       ? semuaData
       : semuaData.filter(item => item.petugas === filterAktif);
   
     if(!data || data.length === 0){
       emptyEl.style.display = "block";
       tableEl.style.display = "none";
       return;
     }
     emptyEl.style.display = "none";
     tableEl.style.display = "table";
     tbodyEl.innerHTML = "";
   
     data.forEach(item=>{
       const tr = document.createElement("tr");
       const selisih = Number(item.selisih);
       const selisihClass = selisih > 0 ? "sel-plus" : (selisih < 0 ? "sel-minus" : "");
       tr.innerHTML = `
         <td>${escapeHtml(item.nama)}</td>
         <td>${escapeHtml(item.petugas || "-")}</td>
         <td>${formatTanggal(item.tanggal)}</td>
         <td class="${selisihClass}">${formatRupiah(selisih)}</td>
         <td style="text-align:right;white-space:nowrap;">
           <a class="btn-lihat" href="detail.html?id=${encodeURIComponent(item.id)}">Lihat</a>
           <button type="button" class="btn-hapus-row" data-id="${item.id}">Hapus</button>
         </td>`;
       tbodyEl.appendChild(tr);
     });
   }
   
   /* ---------- ambil data dari server ---------- */
   async function muatDaftar(){
     loadingEl.style.display = "block";
     emptyEl.style.display = "none";
     tableEl.style.display = "none";
     try{
       const res = await fetch(`${API_URL}/daftar.php`);
       semuaData = await res.json();
     }catch(e){
       console.error("Gagal mengambil daftar:", e);
       semuaData = [];
     }
     loadingEl.style.display = "none";
     renderTabel();
   }
   
   /* ---------- klik tab petugas ---------- */
   tabsEl.addEventListener("click", (e)=>{
     const tab = e.target.closest(".tab-petugas");
     if(!tab) return;
     e.preventDefault();
     tabsEl.querySelectorAll(".tab-petugas").forEach(t => t.classList.remove("active"));
     tab.classList.add("active");
     filterAktif = tab.dataset.val;
     renderTabel();
   });
   
   /* ---------- klik tombol Hapus di baris tabel ---------- */
   tbodyEl.addEventListener("click", async (e)=>{
     if(!e.target.classList.contains("btn-hapus-row")) return;
     const id = e.target.dataset.id;
     if(!confirm("Hapus data ini dari daftar?")) return;
     try{
       await fetch(`${API_URL}/hapus.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
     }catch(err){ console.error(err); }
     await muatDaftar();
   });
   
   muatDaftar();
