-- ============================================================
-- DATABASE: buku_kas_rumah_tangga
-- Skema untuk menyimpan data pendataan ekonomi & keuangan keluarga
-- (dipakai untuk mengganti window.storage di form "Buku Kas Rumah Tangga")
-- ============================================================

CREATE DATABASE IF NOT EXISTS buku_kas_rumah_tangga
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE buku_kas_rumah_tangga;

-- ------------------------------------------------------------
-- 1. TABEL keluarga
-- Induk data: identitas + pendapatan/pengeluaran rumah tangga
-- + hasil ringkasan (disimpan langsung supaya halaman daftar
--   tidak perlu hitung ulang dari nol setiap kali dibuka)
-- ------------------------------------------------------------
CREATE TABLE keluarga (
  id                        CHAR(36)      NOT NULL PRIMARY KEY, -- UUID dibuat di PHP
  no_urut_bangunan          VARCHAR(50)   DEFAULT NULL,
  kk_nama                   VARCHAR(150)  DEFAULT NULL,
  jenis_bangunan            ENUM('Permanen','Semi Permanen','Non Permanen') DEFAULT NULL,
  anggota_menetap           INT UNSIGNED  DEFAULT 0,
  id_listrik                VARCHAR(50)   DEFAULT NULL,

  -- Pendapatan rumah tangga
  suami_kerja               BIGINT UNSIGNED DEFAULT 0,
  suami_usaha               BIGINT UNSIGNED DEFAULT 0,
  suami_transfer            BIGINT UNSIGNED DEFAULT 0,
  istri_kerja               BIGINT UNSIGNED DEFAULT 0,
  istri_usaha               BIGINT UNSIGNED DEFAULT 0,
  istri_transfer            BIGINT UNSIGNED DEFAULT 0,

  -- Pengeluaran rumah tangga
  listrik                   BIGINT UNSIGNED DEFAULT 0,
  wifi                      BIGINT UNSIGNED DEFAULT 0,
  nonmakan_bulanan          BIGINT UNSIGNED DEFAULT 0,
  makan_minggu              BIGINT UNSIGNED DEFAULT 0,
  nonmakan_tahunan          BIGINT UNSIGNED DEFAULT 0,

  -- Ringkasan hasil hitung (redundant tapi memudahkan tampilan daftar)
  pendapatan_rumah_tangga   BIGINT DEFAULT 0,
  pendapatan_usaha          BIGINT DEFAULT 0,
  total_pendapatan          BIGINT DEFAULT 0,
  pengeluaran_rumah_tangga  BIGINT DEFAULT 0,
  pengeluaran_usaha         BIGINT DEFAULT 0,
  total_pengeluaran         BIGINT DEFAULT 0,
  selisih                   BIGINT DEFAULT 0,

  created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. TABEL kk_tertaut
-- Satu keluarga bisa punya beberapa KK tertaut -> one-to-many
-- ------------------------------------------------------------
CREATE TABLE kk_tertaut (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  keluarga_id  CHAR(36) NOT NULL,
  nomor_kk     VARCHAR(150) NOT NULL,
  FOREIGN KEY (keluarga_id) REFERENCES keluarga(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. TABEL usaha
-- Satu keluarga bisa punya beberapa usaha -> one-to-many
-- ------------------------------------------------------------
CREATE TABLE usaha (
  id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  keluarga_id             CHAR(36) NOT NULL,
  nama_pengusaha          VARCHAR(150)  DEFAULT NULL,
  nama_usaha              VARCHAR(150)  DEFAULT NULL,
  alamat                  VARCHAR(255)  DEFAULT NULL,
  nib                     VARCHAR(50)   DEFAULT NULL,
  kegiatan                TEXT          DEFAULT NULL,
  lokasi                  VARCHAR(255)  DEFAULT NULL,
  karyawan_l              INT UNSIGNED  DEFAULT 0,
  karyawan_p              INT UNSIGNED  DEFAULT 0,
  karyawan_dibayar        INT UNSIGNED  DEFAULT 0,
  karyawan_tidak_dibayar  INT UNSIGNED  DEFAULT 0,
  tahun_mulai             VARCHAR(10)   DEFAULT NULL,

  gaji                    BIGINT UNSIGNED DEFAULT 0,
  biaya_produksi          BIGINT UNSIGNED DEFAULT 0,
  biaya_pembelian         BIGINT UNSIGNED DEFAULT 0,
  biaya_operasional       BIGINT UNSIGNED DEFAULT 0,
  biaya_non_operasional   BIGINT UNSIGNED DEFAULT 0,

  pendapatan_utama        BIGINT UNSIGNED DEFAULT 0,
  pendapatan_lainnya      BIGINT UNSIGNED DEFAULT 0,

  aset_tanah              BIGINT UNSIGNED DEFAULT 0,
  aset_non_bangunan       BIGINT UNSIGNED DEFAULT 0,
  luas_bangunan           DECIMAL(10,2) DEFAULT 0,

  FOREIGN KEY (keluarga_id) REFERENCES keluarga(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. TABEL usaha_jenis
-- Satu usaha bisa dicentang beberapa "Jenis Usaha" sekaligus
-- (checkbox multi-pilih di form) -> one-to-many ke usaha
-- ------------------------------------------------------------
CREATE TABLE usaha_jenis (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usaha_id  INT UNSIGNED NOT NULL,
  jenis     VARCHAR(100) NOT NULL,
  FOREIGN KEY (usaha_id) REFERENCES usaha(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Index bantu pencarian & tampilan daftar
-- ------------------------------------------------------------
CREATE INDEX idx_keluarga_nama      ON keluarga(kk_nama);
CREATE INDEX idx_keluarga_created   ON keluarga(created_at);
CREATE INDEX idx_usaha_keluarga     ON usaha(keluarga_id);
CREATE INDEX idx_kk_tertaut_keluarga ON kk_tertaut(keluarga_id);
CREATE INDEX idx_usaha_jenis_usaha  ON usaha_jenis(usaha_id);