# go-fit

PWA mobile-first untuk tracking gizi harian dan berat badan. User mencatat
makanan per sesi makan (Breakfast, Lunch, Snack, Dinner), memasukkan nilai gizi
(kalori + makro), lalu aplikasi mengkalkulasi apakah asupan harian sudah sesuai
target. Multi-user dengan login, aman di-share ke orang lain karena tiap user
hanya melihat datanya sendiri (Row Level Security).

Referensi UI: MyFitnessPal (food diary + ring kalori). Dwibahasa: EN / ID.

> Dokumen ini adalah acuan lengkap proyek. Baca ini dulu sebelum melanjutkan
> pengembangan di sesi berikutnya.

---

## Daftar isi

- [Fitur](#fitur)
- [Tech stack](#tech-stack)
- [Arsitektur & struktur file](#arsitektur--struktur-file)
- [Model data (Supabase)](#model-data-supabase)
- [Autentikasi & onboarding](#autentikasi--onboarding)
- [Desain & konvensi UI](#desain--konvensi-ui)
- [i18n](#i18n)
- [PWA](#pwa)
- [Setup lokal](#setup-lokal)
- [Scripts](#scripts)
- [Deployment (Vercel)](#deployment-vercel)
- [Catatan penting & known gaps](#catatan-penting--known-gaps)

---

## Fitur

Semua turunan dari `context.md` (tujuan awal) plus iterasi lanjutan:

0. **Auth** — email/password + **Sign in / Sign up with Google** (Supabase
   OAuth, via `/auth/callback`).
1. **Diary harian** (`/`)
   - Ring kalori (SVG) sebagai hero: angka tengah = `Goal − Eaten` (label
     "left/sisa" bila positif, "over/lebih" + ring merah bila negatif).
   - Tiga macro bar (Carbs, Fat, Protein), tiap makro punya warna sendiri.
   - Empat meal section: Breakfast, Lunch, Snack, Dinner. Header tiap meal
     menampilkan total kalori (kalkulasi real dari sum item, tanpa unit
     redundan).
   - Tambah/edit/hapus entry lewat bottom sheet.
2. **Logging makanan** — tiap entry: nama, porsi (opsional), kalori, karbo,
   lemak, protein, waktu (opsional). Bisa diedit & dihapus.
3. **Food library** — simpan makanan sekali, pakai ulang lewat search di bottom
   sheet (angka gizi auto-terisi). Mode hybrid: **From library** atau
   **Quick add** (ketik manual), dengan opsi "save to my foods" saat quick add.
4. **Target harian custom** (`/settings`) — kalori + 3 makro, bisa diubah
   kapan saja. Dipakai untuk kalkulasi remaining di diary.
5. **Body weight** (`/weight`) — input berat harian (backdate didukung),
   riwayat 30 hari, delta perubahan vs entry sebelumnya.
6. **Summary by range** (`/summary`) — preset chip (Minggu ini / Bulan ini /
   7 hari / 30 hari) + Custom range. Menampilkan:
   - Kartu **tren berat** (hero): berat awal vs akhir, delta naik/turun,
     sparkline SVG buatan sendiri.
   - Total gizi + rata-rata harian untuk range terpilih.
7. **Day & date navigation** — date picker discoverable (ikon kalender) +
   tombol prev/next hari; bisa isi tanggal backdate berapa pun (maks hari ini).
8. **In-app reminder berat badan** — banner di diary + badge dot di tab Weight
   bila berat hari ini belum diisi. (Push notification sengaja tidak dipakai.)
9. **Onboarding + intro tour** (`/onboarding`) — setelah register, user
   diarahkan mengisi target harian dulu (ada 1 kalimat konteks kegunaannya).
   Setelah submit, muncul **intro carousel** (bottom sheet, swipe/next/skip)
   yang menjelaskan tiap halaman: Diary, Weight, Summary, Settings. Flag
   `gofit.tourSeen` disimpan di localStorage (sekali tampil). Tiap halaman juga
   punya **empty-state hint** saat datanya kosong.
10. **Dwibahasa EN/ID** — toggle di login & settings, tersimpan di localStorage.
11. **PWA** — installable, offline app-shell, favicon/ikon daun (lime).

---

## Tech stack

| Layer | Pilihan |
|---|---|
| Framework | Next.js 15.5.25 (App Router) |
| UI runtime | React 19 + TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`, tanpa `tailwind.config`) |
| State | Zustand 5 |
| Backend / DB / Auth | Supabase (`@supabase/supabase-js`) — Postgres + Auth + RLS |
| Bottom sheet | vaul |
| Animasi | framer-motion |
| Ikon | lucide-react |
| Class utils | clsx + tailwind-merge (`cn()`) |
| Hosting | Vercel (auto-deploy dari branch `main`) |

Pola proyek di-mirror dari `tangkas-project` (Supabase client, struktur `lib/`,
PWA manifest + service worker). Skill acuan saat build: `mobile-pwa-ui`,
`frontend-design`, `copywriting` (ada di `.claude/skills/`).

Tailwind di sini **v4** (beda dengan tangkas yang v3). PostCSS pakai
`@tailwindcss/postcss`. Token warna & radius didefinisikan via `@theme` di
`src/app/globals.css`.

---

## Arsitektur & struktur file

```
src/
├─ app/                      # Next App Router (semua route "use client")
│  ├─ layout.tsx             # root layout, metadata, viewport, Providers, RegisterSW
│  ├─ globals.css            # Tailwind v4 @theme + design tokens + dark mode
│  ├─ icon.png               # favicon (auto-detect Next → route /icon.png)
│  ├─ page.tsx               # Diary (home)
│  ├─ login/page.tsx         # sign in / sign up (email + Google)
│  ├─ auth/callback/page.tsx # target redirect Google OAuth
│  ├─ onboarding/page.tsx    # set target harian (first-time)
│  ├─ weight/page.tsx        # input berat + riwayat 30 hari
│  ├─ summary/page.tsx       # preset range + tren berat + totals/average
│  └─ settings/page.tsx      # goals + language + sign out
│
├─ components/
│  ├─ AppShell.tsx           # gate auth + onboarding, layout app-shell + bottom nav
│  ├─ BottomNav.tsx          # 4 tab + badge reminder di Weight
│  ├─ Providers.tsx          # I18nProvider > AuthProvider
│  ├─ RegisterSW.tsx         # daftar service worker (production only)
│  ├─ DateNavigator.tsx      # prev/next hari + date picker (ikon kalender)
│  ├─ DailySummaryCard.tsx   # ring kalori + macro bars + remaining
│  ├─ CalorieRing.tsx        # ring SVG kalori
│  ├─ MacroBar.tsx           # bar progress 1 makro
│  ├─ MealSection.tsx        # 1 sesi makan + daftar entry + tombol add
│  ├─ AddFoodSheet.tsx       # bottom sheet: library search / quick add / edit
│  ├─ WeightReminder.tsx     # banner "berat hari ini belum dicatat"
│  ├─ WeightTrend.tsx        # sparkline SVG tren berat (no chart lib)
│  ├─ IntroTour.tsx          # carousel pengenalan halaman (first-run)
│  ├─ LanguageToggle.tsx     # segmented EN/ID
│  └─ ui/
│     ├─ Button.tsx          # variant primary/secondary/ghost/danger, ≥44px
│     ├─ Field.tsx           # input berlabel + suffix unit
│     └─ BottomSheet.tsx     # wrapper vaul bertoken go-fit
│
└─ lib/
   ├─ domain/types.ts        # Nutrients, Food, MealEntry, BodyWeight, DailyGoals,
   │                         # MEAL_TYPES, sumNutrients(), zeroNutrients()
   ├─ tour.ts                # hasSeenTour()/markTourSeen() — flag localStorage
   ├─ utils.ts               # cn, date helpers (toISODate, addDays, todayISO,
   │                         # startOfWeekISO, startOfMonthISO), round1, clamp01
   ├─ i18n/
   │  ├─ dictionary.ts       # kamus EN + ID (satu sumber semua string UI)
   │  └─ provider.tsx        # useI18n(): { lang, setLang, t }, persist localStorage
   ├─ auth/provider.tsx      # useAuth(): user/session/loading/configured,
   │                         # signIn/signUp/signOut
   ├─ store/
   │  ├─ diary-store.ts      # useDiaryStore: date, goals, entries, foods + aksi;
   │  │                      # helper groupByMeal(), totalForEntries()
   │  └─ reminder-store.ts   # useReminderStore: weightLoggedToday + refresh/markLogged
   └─ supabase/
      ├─ client.ts           # getSupabase() singleton, isSupabaseConfigured()
      ├─ mappers.ts          # row snake_case → domain camelCase
      └─ repo.ts             # semua akses data (goals, foods, entries, weight)
```

**Alur data:** komponen → store (Zustand) / repo → `repo.ts` → Supabase client.
`repo.ts` adalah satu-satunya tempat query Supabase; mapping row dilakukan di
`mappers.ts`. Provider dibungkus urutan: `I18nProvider` → `AuthProvider`
(lihat `Providers.tsx`).

---

## Model data (Supabase)

Skema lengkap di [`supabase/schema.sql`](./supabase/schema.sql). Empat tabel,
semua di-scope per user via RLS (`auth.uid() = user_id`).

- **`daily_goals`** (1 baris per user) — `target_calories`, `target_carbs_g`,
  `target_fat_g`, `target_protein_g`, `onboarded` (boolean), `updated_at`.
- **`foods`** (library) — `id`, `user_id`, `name`, `serving`, `calories`,
  `carbs_g`, `fat_g`, `protein_g`, timestamps.
- **`meal_entries`** — `id`, `user_id`, `food_id` (nullable, link ke library),
  `entry_date`, `meal_type` (`breakfast|lunch|snack|dinner`), `name`, `serving`,
  makro, `logged_time`, timestamps.
- **`body_weights`** — `id`, `user_id`, `entry_date`, `weight_kg`,
  unique `(user_id, entry_date)`.

**RLS:** tiap tabel `enable row level security` + policy `for all using
(auth.uid() = user_id)`. **Trigger:** `on_auth_user_created` menyisipkan baris
`daily_goals` default saat user baru signup.

Skema idempoten (`if not exists` / `drop ... if exists` / `add column if not
exists`), jadi aman di-run ulang di SQL Editor.

---

## Autentikasi & onboarding

- Auth = Supabase email/password **+ Google OAuth**. `AuthProvider` menyimpan
  session dan meng-subscribe `onAuthStateChange`. Google via
  `signInWithGoogle()` → `supabase.auth.signInWithOAuth({ provider: "google" })`
  dengan `redirectTo = <origin>/auth/callback`.
- **`/auth/callback`** — target redirect OAuth. Supabase client pakai
  `detectSessionInUrl`, jadi code di URL otomatis ditukar jadi session; halaman
  ini menunggu session lalu route ke `/onboarding` (baru) atau `/` (lama).
- **Setup Google OAuth (wajib, di dashboard — bukan kode):**
  1. Google Cloud Console → buat OAuth Client ID (Web application). Authorized
     redirect URI = `https://<project-ref>.supabase.co/auth/v1/callback`.
  2. Supabase → Authentication → Providers → Google → enable, tempel Client ID
     + Secret.
  3. Supabase → URL Configuration → Redirect URLs harus memuat
     `https://<domain>/auth/callback` dan `http://localhost:3000/auth/callback`.
- **Guard** ada di `AppShell`:
  - belum sign in → redirect `/login`.
  - sudah sign in tapi `onboarded = false` → redirect `/onboarding`.
- Setelah register (session langsung aktif) → `/onboarding`. Jika email
  confirmation aktif, user diminta konfirmasi email dulu lalu sign in.
- `/onboarding` menyimpan target + set `onboarded = true`, menampilkan intro
  tour sekali (`IntroTour` + flag `gofit.tourSeen` di `src/lib/tour.ts`), lalu
  ke `/`.

---

## Desain & konvensi UI

- **Palette "greenhouse"** (token di `globals.css`): `paper` (off-white / dark),
  `ink`, aksen `lime` (`#4f9d3a`). Tiap makro punya hue: `cal` (lime),
  `carb` (amber), `fat` (clay), `protein` (blue). Ada dark mode via
  `prefers-color-scheme`.
- **Mobile-first / touch-first**: target sentuh ≥44px, `active:` feedback (bukan
  `hover:`), `select-none`, safe-area insets, `h-dvh` app-shell + bottom nav.
- **Hero per layar**: satu elemen jadi fokus (ring kalori di diary; sparkline
  tren berat di summary), sisanya tenang. Sesuai skill `frontend-design`.
- **Copy**: plain, active voice, sentence case, CTA action-first (skill
  `copywriting`). Semua string lewat `t()` — jangan hardcode teks UI.

---

## i18n

- Sumber tunggal: `src/lib/i18n/dictionary.ts` (objek `en` dan `id` dengan key
  identik; `TranslationKey` = union key-nya).
- Pakai `const { t } = useI18n()` lalu `t("key")`. Tambah string baru = tambah
  key di **kedua** bahasa.
- Bahasa tersimpan di `localStorage` (`gofit.lang`), auto-detect dari
  `navigator.language` saat pertama.

---

## PWA

- `public/manifest.webmanifest` — name, theme `#4f9d3a`, ikon 192/512.
- `public/sw.js` — cache app-shell, **skip Supabase/API** (selalu network),
  fallback ke cache saat offline.
- `RegisterSW.tsx` mendaftarkan SW **hanya di production** (`NODE_ENV`), jadi
  fitur installable/offline terasa di domain Vercel, bukan di `localhost` dev.
- Ikon: `src/app/icon.png` (favicon, motif daun di kotak lime) +
  `public/icons/` (192, 512, apple-touch).

---

## Setup lokal

1. Install dependencies:
   ```bash
   npm install
   ```
2. Setup Supabase — buat project, jalankan [`supabase/schema.sql`](./supabase/schema.sql)
   di SQL Editor, lalu salin kunci ke `.env` (lihat [`.env.example`](./.env.example)):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
   Gunakan **anon/public key**, bukan `service_role`. Detail di
   [`supabase/README.md`](./supabase/README.md).
3. Jalankan dev server:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` (redirect ke `/login` bila belum sign in).

`.env` dan `.env*.local` masuk `.gitignore` — kredensial tidak ikut ke repo.

---

## Scripts

- `npm run dev` — dev server
- `npm run dev:lan` — dev server di `0.0.0.0` (akses dari HP di LAN)
- `npm run build` — production build
- `npm run start` — jalankan hasil build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

Sebelum commit besar: jalankan `typecheck`, `lint`, dan `build` (semua harus
lolos — pola verifikasi yang dipakai selama ini).

---

## Deployment (Vercel)

- Repo GitHub: `https://github.com/fiqihz/go-fit`. Push ke `main` → Vercel
  auto-deploy.
- Env var di Vercel (Settings → Environment Variables), tipe **Config** (bukan
  Secret, karena `NEXT_PUBLIC_*` memang dibaca browser):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Setelah punya URL production final, set di **Supabase → Authentication → URL
  Configuration**:
  - **Site URL** = URL production Vercel.
  - **Redirect URLs** = URL production + `http://localhost:3000` (untuk dev).
- Ganti domain cukup di Vercel → Settings → Domains; lalu update URL di Supabase.
  Kode tidak hardcode URL, jadi tidak perlu diubah.

---

## Catatan penting & known gaps

- **Wajib run schema** sebelum app fungsional. Kolom `onboarded` ditambahkan
  belakangan — kalau app pernah dibuat sebelum itu, **re-run `schema.sql`**
  (idempoten) agar kolom ada, kalau tidak `fetchOnboarded()` error.
- **Push notification tidak diimplementasikan** (keputusan sadar): reliability
  web push di iOS terbatas + butuh server/cron. Reminder pakai in-app highlight.
- **Food library bukan database publik** — hanya daftar pribadi per user yang
  diisi sendiri (tidak ada 14 juta makanan / barcode seperti MyFitnessPal).
- **Service worker cache versi `gofit-v1`** — jika mengubah strategi cache,
  naikkan versinya agar cache lama dibersihkan.
- **Ikon** di-generate sederhana (daun di kotak lime). Bisa diganti aset yang
  lebih proper nanti.
- Jika `MODULE_NOT_FOUND` saat `npm run dev` setelah `npm run build`: hapus
  folder `.next` lalu jalankan dev lagi (cache stale).
- `npm audit` menyisakan beberapa vuln non-kritis dari transitive deps; CVE
  kritis Next sudah beres (pin ke 15.5.25). Belum menjalankan `audit fix --force`
  agar tidak memasukkan breaking change tanpa konfirmasi.
