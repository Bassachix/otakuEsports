# Øtaku ə§pørţš - Landing Page & Discord Event API

Selamat datang di repository **Øtaku ə§pørţš**! Ini adalah *Landing Page* resmi untuk komunitas gaming dan anime, dilengkapi dengan fitur integrasi Discord API untuk menampilkan status anggota yang sedang online dan jadwal event (acara) secara *real-time*.

## 🚀 Fitur Utama

- **Desain Modern & Responsif:** Tampilan UI/UX menarik dengan animasi *scroll* yang halus (AOS).
- **Discord Widget Real-Time:** Menampilkan jumlah anggota yang online dan aktivitas bermain game (Rich Presence).
- **Integrasi Jadwal Event Discord:** Secara dinamis menarik jadwal "Scheduled Events" dari server Discord dan menampilkannya dalam format Pop-up Modal yang rapi.
- **Keamanan Tinggi:** Dilengkapi dengan perlindungan XSS di frontend dan Rate-Limiting + Helmet di backend.
- **Serverless Ready:** Sudah dikonfigurasi sepenuhnya untuk di-hosting secara gratis dan permanen di **Vercel** (`vercel.json` included).

## 🛠️ Teknologi yang Digunakan

- **Frontend:** HTML5, CSS3, Vanilla JavaScript.
- **Backend:** Node.js, Express.js.
- **Integrasi:** Discord REST API v10, Discord Widget API.
- **Keamanan:** `helmet`, `express-rate-limit`, `cors`, Custom XSS Sanitizer.

## 💻 Cara Menjalankan di Komputer Lokal

1. **Clone Repository**
   ```bash
   git clone https://github.com/Bassachix/otakuEsports.git
   cd otakuEsports
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Buat file bernama `.env` di root folder proyek, lalu isi dengan rahasia Discord Anda:
   ```env
   DISCORD_BOT_TOKEN=token_bot_anda_di_sini
   DISCORD_GUILD_ID=id_server_discord_anda_di_sini
   ```

4. **Jalankan Server**
   ```bash
   npm run dev
   ```
   Web akan berjalan di `http://localhost:3000`.

## 🌐 Cara Hosting (Deploy) ke Vercel

Proyek ini sudah dikonfigurasi untuk [Vercel](https://vercel.com).
1. Login ke Vercel dan buat *Project* baru.
2. *Import* repository GitHub ini.
3. Di pengaturan *Environment Variables* Vercel, tambahkan `DISCORD_BOT_TOKEN` dan `DISCORD_GUILD_ID`.
4. Klik **Deploy**.

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk informasi lebih lanjut.

---
*Dibuat dengan ❤️ oleh Bassachix*
