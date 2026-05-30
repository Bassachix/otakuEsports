// Mengimpor library yang dibutuhkan
const express = require('express');
const fetch = require('node-fetch'); // Library untuk membuat permintaan HTTP
const cors = require('cors'); // Untuk mengizinkan akses dari domain lain (frontend)
const rateLimit = require('express-rate-limit'); // Untuk membatasi jumlah permintaan
const helmet = require('helmet'); // Untuk keamanan dasar HTTP header
require('dotenv').config(); // Untuk memuat variabel dari file .env

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000; // Gunakan port dari .env atau default ke 3000

// --- Middleware Keamanan ---

// 1. Helmet untuk keamanan header dasar
app.use(helmet());

// 2. CORS (Cross-Origin Resource Sharing)
const corsOptions = {
    origin: 'http://127.0.0.1:5500', // Ganti dengan alamat frontend Anda
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 3. Rate Limiter untuk mencegah serangan brute-force atau DoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Jendela waktu: 15 menit
    max: 100, // Maksimal 100 permintaan per IP dalam 15 menit
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit'
});
app.use('/api', limiter); // Terapkan hanya pada endpoint API

// --- Variabel Konfigurasi ---
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!BOT_TOKEN || !GUILD_ID) {
    console.error("Error: Pastikan DISCORD_BOT_TOKEN dan DISCORD_GUILD_ID ada di file .env");
    process.exit(1); // Hentikan server jika token atau ID tidak ada
}

// --- Implementasi Caching ---
let cachedEvents = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 1000; // Cache data selama 1 menit (60000 ms)

// --- Endpoint API untuk Mengambil Event ---
app.get('/api/events', async (req, res) => {
    const now = Date.now();

    if (cachedEvents && (now - cacheTimestamp < CACHE_DURATION)) {
        console.log('Menyajikan data event dari cache.');
        return res.status(200).json(cachedEvents);
    }

    console.log('Mengambil data event baru dari Discord API.');

    // PERBAIKAN: Menambahkan parameter `with_user_count=true` ke URL
    const discordApiUrl = `https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events?with_user_count=true`;

    try {
        const apiResponse = await fetch(discordApiUrl, {
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`
            }
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error('Error dari Discord API:', errorData);
            throw new Error(`Discord API error: ${apiResponse.statusText}`);
        }

        const events = await apiResponse.json();

        cachedEvents = events;
        cacheTimestamp = now;
        console.log('Cache event telah diperbarui.');

        res.status(200).json(events);

    } catch (error) {
        console.error('Gagal mengambil jadwal event:', error);
        res.status(500).json({ message: 'Internal Server Error: Tidak dapat mengambil event.' });
    }
});

// --- Melayani File Frontend (Statik) ---
// Ini penting agar Render bisa menampilkan HTML/CSS Anda bersamaan dengan API
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Jalankan server (untuk lokal)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server backend berjalan di http://localhost:${PORT}`);
    });
}

// Export app untuk Vercel Serverless
module.exports = app;
