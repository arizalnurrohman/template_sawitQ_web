# Deploy Web (sawitq.my.id) ke Backend (be.sawitq.my.id)

## Gejala

Login menampilkan:

```
Layanan tidak tersedia (HTTP 404).
```

Penyebabnya: web dibangun dengan base API default `/api`, lalu di hosting
statis Apache `https://sawitq.my.id/api/login` tidak diteruskan ke backend.
Permintaan jatuh ke file statis dan menghasilkan **404**, bukan respons
Laravel.

Cek cepat:

```bash
curl -i https://sawitq.my.id/api/health
# 404  -> proxy belum ada
curl -i https://be.sawitq.my.id/api/health
# 200  -> backend sehat
```

Indikator **BE online / BE offline** di halaman login dan topbar membaca
`/health` dari base API yang sama. Jika proxy belum benar, indikator akan
menunjukkan **BE offline** walaupun backend sebenarnya hidup.

---

## Perbaikan cepat untuk kondisi saat ini

Repo ini sudah berisi `.env.production` dengan mode langsung:

```bash
VITE_API_BASE_URL=https://be.sawitq.my.id/api
VITE_API_KEY=your-api-key-1
```

Jalankan ulang build lalu unggah isi `dist/` ke document root
`sawitq.my.id`:

```bash
npm ci
npm run build
```

`.env.production` bersifat lokal (di-ignore Git). Jika deploy memakai
pipeline Git, set variabel yang sama di environment build pipeline.

---

## Opsi A — Reverse proxy (disarankan)

Web dan API tetap satu origin (`/api`), API key tidak pernah dikirim ke
browser.

### Apache (cPanel / VPS)

Aktifkan `mod_proxy` dan `mod_proxy_http`, lalu tambahkan ke `.htaccess`
di document root web:

```apache
RewriteEngine On
RequestHeader set X-API-KEY "your-api-key-1"
RewriteRule ^api/(.*)$ https://be.sawitq.my.id/api/$1 [P,L]
```

atau di konfigurasi VirtualHost:

```apache
ProxyPass        /api/ https://be.sawitq.my.id/api/
ProxyPassReverse /api/ https://be.sawitq.my.id/api/
RequestHeader    set X-API-KEY "your-api-key-1"
```

> `RequestHeader` memerlukan `mod_headers`. Banyak shared hosting mematikan
> `[P]`/`ProxyPass`. Jika tidak tersedia, gunakan Opsi B.

### Nginx

```nginx
location /api/ {
    proxy_pass https://be.sawitq.my.id/api/;
    proxy_set_header Host be.sawitq.my.id;
    proxy_set_header X-API-KEY your-api-key-1;
}
```

### Platform statis lain (Netlify, Vercel, Cloudflare Pages)

Rewrites biasa hanya meneruskan path, bukan menambahkan header `X-API-KEY`.
Gunakan Edge Function/Middleware untuk menyisipkan header, atau pilih Opsi B.

Setelah proxy aktif, build ulang tanpa `VITE_API_BASE_URL`:

```bash
npm run build
```

---

## Opsi B — Panggil backend langsung

Cocok untuk hosting statis tanpa proxy. Buat `.env.production`:

```bash
VITE_API_BASE_URL=https://be.sawitq.my.id/api
VITE_API_KEY=your-api-key-1
```

lalu:

```bash
npm run build
```

Syarat:

- Backend mengizinkan CORS dari `https://sawitq.my.id` (konfigurasi saat
  ini `Access-Control-Allow-Origin: *`, jadi sudah lolos).
- `X-API-KEY` dikirim dari browser. Nilai ini **bukan rahasia** karena
  sudah tertanam di source backend, tetapi siapa pun dapat melihatnya di
  bundle. Untuk key yang benar-benar rahasia, pakai Opsi A.

---

## Verifikasi

1. `https://sawitq.my.id/api/health` mengembalikan JSON `{"status":"ok",...}`.
2. Badge di halaman login berubah menjadi **BE online** (klik badge untuk
   cek ulang).
3. Login berhasil dan topbar menampilkan **BE online** beserta latensi.

## Perilaku indikator

- Polling `/health` setiap 30 detik, saat tab kembali aktif, dan saat
  koneksi browser berubah online.
- `online` = HTTP 2xx + `status: "ok"`.
- `offline` = 404/5xx/timeout/tidak dapat dihubungi.
- Klik badge untuk memeriksa ulang segera.
