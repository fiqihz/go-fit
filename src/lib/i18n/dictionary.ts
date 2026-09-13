export const LANGUAGES = ["en", "id"] as const;
export type Language = (typeof LANGUAGES)[number];

/**
 * Translation dictionary. Keys are shared between languages so a missing key
 * fails loudly at compile time. Copy follows the copywriting skill: plain,
 * active, sentence case, action-first CTAs.
 */
export const dictionary = {
  en: {
    appName: "go-fit",
    tagline: "Track what you eat. Hit your targets.",

    // Nav
    navDiary: "Diary",
    navWeight: "Weight",
    navSummary: "Summary",
    navSettings: "Settings",

    // Meals
    breakfast: "Breakfast",
    lunch: "Lunch",
    snack: "Snack",
    dinner: "Dinner",

    // Nutrients
    calories: "Calories",
    carbs: "Carbs",
    fat: "Fat",
    protein: "Protein",
    kcal: "kcal",
    grams: "g",

    // Diary
    today: "Today",
    remaining: "remaining",
    over: "over",
    goal: "Goal",
    food: "Food",
    eaten: "Eaten",
    addFood: "Add food",
    noEntriesMeal: "Nothing logged yet.",
    caloriesLeft: "left",

    // Add food sheet
    addTo: "Add to",
    searchLibrary: "Search your foods",
    quickAdd: "Quick add",
    fromLibrary: "From library",
    foodName: "Food name",
    servingLabel: "Serving (optional)",
    servingPlaceholder: "e.g. 100 g, 1 cup",
    time: "Time",
    saveToLibrary: "Save to my foods for next time",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    editEntry: "Edit entry",
    emptyLibrary: "No saved foods yet. Add one with Quick add.",
    noMatches: "No matches. Try Quick add.",
    add: "Add",

    // Weight
    bodyWeight: "Body weight",
    weightToday: "Today's weight",
    weightPlaceholder: "e.g. 68.5",
    kg: "kg",
    saveWeight: "Save weight",
    weightSaved: "Weight saved.",
    weightReminderTitle: "No weight logged today",
    weightReminderCta: "Add it",
    noWeightRange: "No weight logged in this range.",
    latest: "Latest",
    change: "Change",

    // Summary
    summaryTitle: "Summary",
    startDate: "Start date",
    endDate: "End date",
    rangeThisWeek: "This week",
    rangeThisMonth: "This month",
    range7: "7 days",
    range30: "30 days",
    rangeCustom: "Custom",
    weightTrend: "Weight trend",
    weightStart: "Start",
    weightEnd: "End",
    noWeightTrend: "Log your weight to see the trend here.",
    nutrition: "Nutrition",
    totals: "Totals",
    dailyAverage: "Daily average",
    daysLogged: "days logged",
    perDay: "/ day",
    noDataRange: "No entries in this range. Pick another range or log a meal.",
    viewSummary: "View summary",

    // Settings / Goals
    dailyTargets: "Daily targets",
    targetsHelp: "Set the goals you want to hit each day.",
    targetCalories: "Target calories",
    targetCarbs: "Target carbs",
    targetFat: "Target fat",
    targetProtein: "Target protein",
    saveTargets: "Save targets",
    targetsSaved: "Targets saved.",
    language: "Language",
    account: "Account",
    signOut: "Sign out",

    // Onboarding
    onboardTitle: "Set your daily targets",
    onboardSubtitle:
      "These are the goals you'll track against each day. You can change them anytime in Settings.",
    getStarted: "Start tracking",
    skipForNow: "Skip for now",

    // Auth
    signIn: "Sign in",
    signUp: "Create account",
    email: "Email",
    password: "Password",
    signInCta: "Sign in",
    signUpCta: "Create account",
    noAccount: "New here?",
    haveAccount: "Already have an account?",
    authError: "Something went wrong. Check your details and try again.",
    checkEmail: "Check your email to confirm your account, then sign in.",
    supabaseMissing:
      "Supabase is not configured. Add your keys to .env to sign in.",

    // Generic
    loading: "Loading…",
    saving: "Saving…",
    retry: "Retry",
    loadError: "Couldn't load your data.",
  },
  id: {
    appName: "go-fit",
    tagline: "Catat makananmu. Capai targetmu.",

    navDiary: "Catatan",
    navWeight: "Berat",
    navSummary: "Ringkasan",
    navSettings: "Pengaturan",

    breakfast: "Sarapan",
    lunch: "Makan Siang",
    snack: "Camilan",
    dinner: "Makan Malam",

    calories: "Kalori",
    carbs: "Karbo",
    fat: "Lemak",
    protein: "Protein",
    kcal: "kkal",
    grams: "g",

    today: "Hari ini",
    remaining: "sisa",
    over: "lebih",
    goal: "Target",
    food: "Makanan",
    eaten: "Dimakan",
    addFood: "Tambah makanan",
    noEntriesMeal: "Belum ada catatan.",
    caloriesLeft: "sisa",

    addTo: "Tambah ke",
    searchLibrary: "Cari makananmu",
    quickAdd: "Tambah cepat",
    fromLibrary: "Dari koleksi",
    foodName: "Nama makanan",
    servingLabel: "Porsi (opsional)",
    servingPlaceholder: "mis. 100 g, 1 mangkuk",
    time: "Waktu",
    saveToLibrary: "Simpan ke koleksi untuk nanti",
    save: "Simpan",
    cancel: "Batal",
    delete: "Hapus",
    edit: "Ubah",
    editEntry: "Ubah catatan",
    emptyLibrary: "Belum ada makanan tersimpan. Tambah lewat Tambah cepat.",
    noMatches: "Tidak ada yang cocok. Coba Tambah cepat.",
    add: "Tambah",

    bodyWeight: "Berat badan",
    weightToday: "Berat hari ini",
    weightPlaceholder: "mis. 68.5",
    kg: "kg",
    saveWeight: "Simpan berat",
    weightSaved: "Berat tersimpan.",
    weightReminderTitle: "Berat hari ini belum dicatat",
    weightReminderCta: "Catat",
    noWeightRange: "Belum ada berat di rentang ini.",
    latest: "Terbaru",
    change: "Perubahan",

    summaryTitle: "Ringkasan",
    startDate: "Tanggal mulai",
    endDate: "Tanggal akhir",
    rangeThisWeek: "Minggu ini",
    rangeThisMonth: "Bulan ini",
    range7: "7 hari",
    range30: "30 hari",
    rangeCustom: "Kustom",
    weightTrend: "Tren berat",
    weightStart: "Awal",
    weightEnd: "Akhir",
    noWeightTrend: "Catat beratmu untuk melihat trennya di sini.",
    nutrition: "Nutrisi",
    totals: "Total",
    dailyAverage: "Rata-rata harian",
    daysLogged: "hari tercatat",
    perDay: "/ hari",
    noDataRange:
      "Tidak ada catatan di rentang ini. Pilih rentang lain atau catat makanan.",
    viewSummary: "Lihat ringkasan",

    dailyTargets: "Target harian",
    targetsHelp: "Atur target yang ingin kamu capai tiap hari.",
    targetCalories: "Target kalori",
    targetCarbs: "Target karbo",
    targetFat: "Target lemak",
    targetProtein: "Target protein",
    saveTargets: "Simpan target",
    targetsSaved: "Target tersimpan.",
    language: "Bahasa",
    account: "Akun",
    signOut: "Keluar",

    onboardTitle: "Atur target harianmu",
    onboardSubtitle:
      "Ini target yang akan kamu kejar tiap hari. Bisa diubah kapan saja di Pengaturan.",
    getStarted: "Mulai catat",
    skipForNow: "Lewati dulu",

    signIn: "Masuk",
    signUp: "Buat akun",
    email: "Email",
    password: "Kata sandi",
    signInCta: "Masuk",
    signUpCta: "Buat akun",
    noAccount: "Baru di sini?",
    haveAccount: "Sudah punya akun?",
    authError: "Terjadi kesalahan. Periksa datamu lalu coba lagi.",
    checkEmail: "Cek emailmu untuk konfirmasi akun, lalu masuk.",
    supabaseMissing:
      "Supabase belum dikonfigurasi. Tambahkan kunci ke .env untuk masuk.",

    loading: "Memuat…",
    saving: "Menyimpan…",
    retry: "Coba lagi",
    loadError: "Gagal memuat data.",
  },
} as const;

export type TranslationKey = keyof (typeof dictionary)["en"];
