/**
 * PERPUSTAKAAN DIGITAL SAUNG KHATCHONK - Frontend Application Script
 * Architecture: SPA + PWA + Offline IndexedDB + Google Apps Script Integration
 */

// Konfigurasi API Backend Google Apps Script (Ganti URL setelah deploy Web App Apps Script)
const CONFIG = {
  API_URL: localStorage.getItem('SK_API_URL') || 'https://script.google.com/macros/s/AKfycbwNEbqR4DYs_D-AY1bx2JVNiCClWX_GruA2MXjfN9a0nKAuUNo7qZPFBQhojUqIksWArg/exec'
};

// State Aplikasi
const state = {
  currentUser: JSON.parse(localStorage.getItem('SK_USER')) || null,
  currentRoute: 'home',
  routeParam: null,
  books: JSON.parse(localStorage.getItem('SK_BOOKS')) || [
    {
      id: 'SK-2026-00001',
      title: 'Seni Menghargai Diri Sendiri',
      author: 'Komarudin',
      publisher: 'Saung Khatchonk',
      year: 2026,
      isbn: '978602XXXX',
      category: 'Biasa',
      format: 'PDF',
      status: 'Tersedia',
      description: 'Panduan praktis membangun kepercayaan diri dan kesehatan mental di era digital.',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      fileUrl: '#'
    },
    {
      id: 'SK-2026-00002',
      title: 'Arly (Aku Yang Salah)',
      author: 'Tuhan (Author)',
      publisher: 'Gold Media Publisher',
      year: 2026,
      isbn: '978602YYYY',
      category: 'VIP',
      format: 'PDF',
      status: 'Tersedia',
      description: 'Novel emosional penuh intrik dan refleksi kehidupan remaja.',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
      fileUrl: '#'
    }
  ],
  members: JSON.parse(localStorage.getItem('SK_MEMBERS')) || [],
  visits: JSON.parse(localStorage.getItem('SK_VISITS')) || [],
  transactions: JSON.parse(localStorage.getItem('SK_TRANSACTIONS')) || []
};

// Router Sederhana
const router = {
  navigate: (route, param = null) => {
    state.currentRoute = route;
    state.routeParam = param;
    window.scrollTo(0, 0);
    renderApp();
  }
};

// Inisialisasi & Render Navigasi
function initApp() {
  updateNav();
  renderApp();
  lucide.createIcons();
}

function updateNav() {
  const authNav = document.getElementById('authNavContainer');
  const mobileAuth = document.getElementById('mobileAuthContainer');
  
  if (state.currentUser) {
    const roleBadge = state.currentUser.role === 'MASTER' ? '<span class="bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-bold">OPERATOR</span>' : `<span class="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded font-bold">${state.currentUser.category}</span>`;
    
    authNav.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-right">
          <div class="text-xs font-semibold text-white">${state.currentUser.name}</div>
          <div>${roleBadge}</div>
        </div>
        <button onclick="${state.currentUser.role === 'MASTER' ? "router.navigate('operator')" : "router.navigate('memberDashboard')"}" class="bg-emerald-800 hover:bg-emerald-700 p-2 rounded-lg text-white transition" title="Dashboard">
          <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
        </button>
        <button onclick="logout()" class="bg-red-700 hover:bg-red-600 p-2 rounded-lg text-white transition" title="Keluar">
          <i data-lucide="log-out" class="w-5 h-5"></i>
        </button>
      </div>
    `;

    mobileAuth.innerHTML = `
      <div class="py-2 px-3 text-white">
        <div class="font-semibold">${state.currentUser.name}</div>
        <div class="text-xs text-emerald-300">ID: ${state.currentUser.id}</div>
      </div>
      <button onclick="router.navigate('${state.currentUser.role === 'MASTER' ? 'operator' : 'memberDashboard'}'); toggleMobileMenu();" class="block w-full text-left py-2 px-3 rounded hover:bg-emerald-800 text-white">Dashboard</button>
      <button onclick="logout(); toggleMobileMenu();" class="block w-full text-left py-2 px-3 rounded hover:bg-red-800 text-red-200">Keluar</button>
    `;
  } else {
    authNav.innerHTML = `
      <button onclick="router.navigate('login')" class="bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold transition">Masuk</button>
      <button onclick="router.navigate('register')" class="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold transition">Daftar</button>
    `;

    mobileAuth.innerHTML = `
      <button onclick="router.navigate('login'); toggleMobileMenu();" class="block w-full text-left py-2 px-3 rounded hover:bg-emerald-800 text-white">Masuk</button>
      <button onclick="router.navigate('register'); toggleMobileMenu();" class="block w-full text-left py-2 px-3 rounded hover:bg-emerald-800 text-amber-300 font-semibold">Daftar Anggota</button>
    `;
  }
  lucide.createIcons();
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
}

function logout() {
  state.currentUser = null;
  localStorage.removeItem('SK_USER');
  updateNav();
  router.navigate('home');
  showToast('Berhasil keluar dari akun.', 'success');
}

// Render Controller Utama
function renderApp() {
  const app = document.getElementById('app');
  updateNav();

  switch (state.currentRoute) {
    case 'home':
      app.innerHTML = renderHome();
      break;
    case 'catalog':
      app.innerHTML = renderCatalog();
      break;
    case 'search':
      app.innerHTML = renderSearch();
      break;
    case 'detail':
      app.innerHTML = renderDetail(state.routeParam);
      break;
    case 'login':
      app.innerHTML = renderLogin();
      break;
    case 'register':
      app.innerHTML = renderRegister();
      break;
    case 'memberDashboard':
      app.innerHTML = renderMemberDashboard();
      break;
    case 'memberCard':
      app.innerHTML = renderMemberCard();
      break;
    case 'upgradeVIP':
      app.innerHTML = renderUpgradeVIP();
      break;
    case 'operator':
      app.innerHTML = renderOperatorDashboard();
      break;
    default:
      app.innerHTML = renderHome();
  }
  lucide.createIcons();
}

// 1. HALAMAN BERANDA
function renderHome() {
  const totalBooks = state.books.length;
  const vipBooks = state.books.filter(b => b.category === 'VIP').length;
  const regularBooks = totalBooks - vipBooks;

  return `
    <div class="space-y-10">
      <!-- Hero Section -->
      <div class="relative bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-2xl p-8 md:p-12 shadow-xl overflow-hidden">
        <div class="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
          <i data-lucide="book-open" class="w-96 h-96"></i>
        </div>
        <div class="relative z-10 max-w-2xl space-y-4">
          <span class="bg-amber-500 text-slate-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">Perpustakaan Digital Resmi</span>
          <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight">SAUNG KHATCHONK</h1>
          <p class="text-emerald-100 text-base md:text-lg">Pusat literasi digital dan arsip terpadu. Akses koleksi buku berkualitas, arsip dokumen, dan materi pembelajaran dengan mudah secara online & offline.</p>
          <div class="pt-4 flex flex-wrap gap-4">
            <button onclick="router.navigate('catalog')" class="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl shadow-lg transition flex items-center space-x-2">
              <i data-lucide="book" class="w-5 h-5"></i>
              <span>Jelajahi Katalog</span>
            </button>
            <button onclick="router.navigate('search')" class="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow transition flex items-center space-x-2">
              <i data-lucide="search" class="w-5 h-5"></i>
              <span>Cari Buku</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Statistik Singkat -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <i data-lucide="book-open" class="w-6 h-6"></i>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900">${totalBooks}</div>
            <div class="text-xs text-slate-500">Total Koleksi Buku</div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <i data-lucide="award" class="w-6 h-6"></i>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900">${vipBooks}</div>
            <div class="text-xs text-slate-500">Koleksi Eksklusif VIP</div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <i data-lucide="users" class="w-6 h-6"></i>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900">Aktif</div>
            <div class="text-xs text-slate-500">Keanggotaan Terpadu</div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <i data-lucide="cloud" class="w-6 h-6"></i>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900">GDrive</div>
            <div class="text-xs text-slate-500">Cloud Storage Aman</div>
          </div>
        </div>
      </div>

      <!-- Buku Unggulan / Terbaru -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-slate-900">Koleksi Buku Pilihan</h2>
          <button onclick="router.navigate('catalog')" class="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center space-x-1">
            <span>Lihat Semua</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          ${state.books.slice(0, 4).map(book => `
            <div onclick="router.navigate('detail', '${book.id}')" class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden card-hover cursor-pointer flex flex-col">
              <div class="h-48 bg-slate-200 relative overflow-hidden">
                <img src="${book.cover}" alt="${book.title}" class="w-full h-full object-cover">
                <span class="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold ${book.category === 'VIP' ? 'bg-amber-500 text-slate-900' : 'bg-emerald-700 text-white'}">${book.category}</span>
              </div>
              <div class="p-4 flex flex-col flex-grow justify-between space-y-2">
                <div>
                  <h3 class="font-bold text-slate-900 line-clamp-1">${book.title}</h3>
                  <p class="text-xs text-slate-500">Oleh ${book.author}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>${book.year}</span>
                  <span class="font-semibold text-emerald-700">${book.format}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 2. HALAMAN KATALOG
function renderCatalog() {
  return `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Katalog Perpustakaan</h2>
          <p class="text-sm text-slate-500">Jelajahi seluruh koleksi buku digital dan arsip Saung Khatchonk.</p>
        </div>
        <div class="flex items-center space-x-3 w-full md:w-auto">
          <input type="text" id="catalogSearchInput" placeholder="Cari judul/penulis..." oninput="filterCatalog()" class="px-4 py-2 border border-slate-300 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-emerald-600 focus:outline-none">
          <select id="categoryFilter" onchange="filterCatalog()" class="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none">
            <option value="">Semua Kategori</option>
            <option value="Biasa">Biasa</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>

      <div id="catalogGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        ${renderBookCards(state.books)}
      </div>
    </div>
  `;
}

function renderBookCards(books) {
  if (books.length === 0) {
    return `<div class="col-span-full text-center py-12 text-slate-400">Tidak ada buku yang ditemukan.</div>`;
  }
  return books.map(book => `
    <div onclick="router.navigate('detail', '${book.id}')" class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden card-hover cursor-pointer flex flex-col">
      <div class="h-48 bg-slate-200 relative overflow-hidden">
        <img src="${book.cover}" alt="${book.title}" class="w-full h-full object-cover">
        <span class="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold ${book.category === 'VIP' ? 'bg-amber-500 text-slate-900' : 'bg-emerald-700 text-white'}">${book.category}</span>
      </div>
      <div class="p-4 flex flex-col flex-grow justify-between space-y-2">
        <div>
          <h3 class="font-bold text-slate-900 line-clamp-1">${book.title}</h3>
          <p class="text-xs text-slate-500">Oleh ${book.author}</p>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>${book.year}</span>
          <span class="font-semibold text-emerald-700">${book.format}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function filterCatalog() {
  const query = document.getElementById('catalogSearchInput').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  
  const filtered = state.books.filter(b => {
    const matchQuery = b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query);
    const matchCat = cat === '' || b.category === cat;
    return matchQuery && matchCat;
  });

  document.getElementById('catalogGrid').innerHTML = renderBookCards(filtered);
}

// 3. HALAMAN PENCARIAN LANJUTAN
function renderSearch() {
  return `
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <h2 class="text-2xl font-bold text-slate-900">Pencarian Lanjutan & Arsip</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" id="searchKeyword" placeholder="Kata kunci (Judul, Penulis, Penerbit)..." class="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none">
          <select id="searchCategory" class="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none">
            <option value="">Semua Kategori</option>
            <option value="Biasa">Biasa</option>
            <option value="VIP">VIP</option>
          </select>
          <select id="searchFormat" class="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none">
            <option value="">Semua Format</option>
            <option value="PDF">PDF</option>
            <option value="EPUB">EPUB</option>
            <option value="DOC">DOC / DOCX</option>
          </select>
        </div>
        <div class="flex justify-end">
          <button onclick="executeAdvancedSearch()" class="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition flex items-center space-x-2">
            <i data-lucide="search" class="w-4 h-4"></i>
            <span>Cari Koleksi</span>
          </button>
        </div>
      </div>

      <div id="searchResultsGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        ${renderBookCards(state.books)}
      </div>
    </div>
  `;
}

function executeAdvancedSearch() {
  const keyword = document.getElementById('searchKeyword').value.toLowerCase();
  const category = document.getElementById('searchCategory').value;
  const format = document.getElementById('searchFormat').value;

  const results = state.books.filter(b => {
    const matchKw = !keyword || b.title.toLowerCase().includes(keyword) || b.author.toLowerCase().includes(keyword) || b.publisher.toLowerCase().includes(keyword);
    const matchCat = !category || b.category === category;
    const matchFmt = !format || b.format === format;
    return matchKw && matchCat && matchFmt;
  });

  document.getElementById('searchResultsGrid').innerHTML = renderBookCards(results);
}

// 4. HALAMAN DETAIL BUKU
function renderDetail(bookId) {
  const book = state.books.find(b => b.id === bookId) || state.books[0];
  const canDownload = state.currentUser && (state.currentUser.role === 'MASTER' || state.currentUser.category === 'VIP' || book.category === 'Biasa');

  return `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <button onclick="window.history.back()" class="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center space-x-1">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Kembali</span>
      </button>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="space-y-4">
          <div class="h-80 bg-slate-200 rounded-xl overflow-hidden shadow-inner">
            <img src="${book.cover}" alt="${book.title}" class="w-full h-full object-cover">
          </div>
          ${canDownload ? `
            <a href="${book.fileUrl}" target="_blank" class="block w-full bg-emerald-700 hover:bg-emerald-600 text-white text-center font-bold py-3 rounded-xl shadow transition flex items-center justify-center space-x-2">
              <i data-lucide="download" class="w-5 h-5"></i>
              <span>Unduh File (${book.format})</span>
            </a>
          ` : `
            <div class="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs space-y-2 text-center">
              <p class="font-bold">Akses Terbatas</p>
              <p>Buku kategori VIP memerlukan akun VIP untuk mengunduh file.</p>
              <button onclick="router.navigate('upgradeVIP')" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2 rounded-lg transition">Upgrade ke VIP</button>
            </div>
          `}
        </div>

        <div class="md:col-span-2 space-y-4">
          <div class="flex items-center space-x-3">
            <span class="px-3 py-1 rounded-full text-xs font-bold ${book.category === 'VIP' ? 'bg-amber-500 text-slate-900' : 'bg-emerald-700 text-white'}">${book.category}</span>
            <span class="text-xs text-slate-500">Kode Arsip: <strong class="text-slate-700">${book.id}</strong></span>
          </div>

          <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900">${book.title}</h1>

          <div class="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span class="text-slate-400 block text-xs">Penulis</span>
              <span class="font-semibold text-slate-800">${book.author}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-xs">Penerbit</span>
              <span class="font-semibold text-slate-800">${book.publisher}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-xs">Tahun Terbit</span>
              <span class="font-semibold text-slate-800">${book.year}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-xs">ISBN / QRCBN</span>
              <span class="font-semibold text-slate-800">${book.isbn}</span>
            </div>
          </div>

          <div>
            <h3 class="font-bold text-slate-900 mb-2">Deskripsi Buku</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${book.description}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 5. HALAMAN LOGIN
function renderLogin() {
  return `
    <div class="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto">SK</div>
        <h2 class="text-2xl font-bold text-slate-900">Masuk Akun</h2>
        <p class="text-xs text-slate-500">Masukkan ID Pengguna dan kata sandi Anda.</p>
      </div>

      <form onsubmit="handleLogin(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Pengguna (Contoh: SK-2026-00001 atau MASTER)</label>
          <input type="text" id="loginId" required class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" placeholder="SK-2026-XXXXX">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Kata Sandi</label>
          <input type="password" id="loginPass" required class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" placeholder="••••••••">
        </div>
        <button type="submit" class="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow transition">Masuk</button>
      </form>

      <div class="text-center text-xs text-slate-500">
        Belum punya akun? <button onclick="router.navigate('register')" class="text-emerald-700 font-bold hover:underline">Daftar sekarang</button>
      </div>
    </div>
  `;
}

function handleLogin(e) {
  e.preventDefault();
  const idInput = document.getElementById('loginId').value.trim();
  const passInput = document.getElementById('loginPass').value;

  // Master Login Hardcoded untuk Operator
  if (idInput.toUpperCase() === 'MASTER' && passInput === 'admin123') {
    state.currentUser = {
      id: 'MASTER',
      name: 'OPERATOR MASTER',
      role: 'MASTER',
      category: 'MASTER'
    };
    localStorage.setItem('SK_USER', JSON.stringify(state.currentUser));
    showToast('Berhasil masuk sebagai Operator Master!', 'success');
    router.navigate('operator');
    return;
  }

  // Cek member terdaftar
  const found = state.members.find(m => m.id === idInput || m.whatsapp === idInput);
  if (found && found.password === passInput) {
    state.currentUser = found;
    localStorage.setItem('SK_USER', JSON.stringify(state.currentUser));
    showToast(`Selamat datang kembali, ${found.name}!`, 'success');
    router.navigate('memberDashboard');
  } else {
    showToast('ID Pengguna atau Kata Sandi salah!', 'error');
  }
}

// 6. HALAMAN REGISTRASI
function renderRegister() {
  return `
    <div class="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center font-bold text-xl mx-auto">SK</div>
        <h2 class="text-2xl font-bold text-slate-900">Pendaftaran Anggota Baru</h2>
        <p class="text-xs text-slate-500">Bergabung dengan Perpustakaan Digital Saung Khatchonk.</p>
      </div>

      <form onsubmit="handleRegister(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap (Otomatis Kapital)</label>
          <input type="text" id="regName" required oninput="this.value = this.value.toUpperCase()" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" placeholder="NAMA LENGKAP ANDA">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Nomor WhatsApp</label>
            <input type="text" id="regWa" required class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" placeholder="081234567890">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Email (Pemulihan)</label>
            <input type="email" id="regEmail" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" placeholder="email@domain.com">
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Kata Sandi</label>
          <input type="password" id="regPass" required class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" placeholder="••••••••">
        </div>
        <button type="submit" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl shadow transition">Daftar Sekarang</button>
      </form>
    </div>
  `;
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const whatsapp = document.getElementById('regWa').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPass').value;

  const newId = `SK-2026-${String(state.members.length + 1).padStart(5, '0')}`;
  const newMember = {
    id: newId,
    name,
    whatsapp,
    email,
    password,
    category: 'MEMBER BIASA',
    status: 'AKTIF',
    regDate: new Date().toISOString().split('T')[0],
    expiredDate: '2029-10-28',
    role: 'MEMBER'
  };

  state.members.push(newMember);
  localStorage.setItem('SK_MEMBERS', JSON.stringify(state.members));
  state.currentUser = newMember;
  localStorage.setItem('SK_USER', JSON.stringify(newMember));

  showToast(`Registrasi berhasil! ID Anda: ${newId}`, 'success');
  router.navigate('memberDashboard');
}

// 7. DASHBOARD ANGGOTA
function renderMemberDashboard() {
  const user = state.currentUser;
  if (!user) { router.navigate('login'); return ''; }

  return `
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-6 md:p-8 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center space-x-4">
          <div class="w-20 h-20 rounded-full bg-amber-500 text-slate-900 font-bold text-3xl flex items-center justify-center shadow">
            ${user.name.charAt(0)}
          </div>
          <div class="space-y-1">
            <span class="bg-amber-500 text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded">${user.category}</span>
            <h1 class="text-2xl font-extrabold">${user.name}</h1>
            <p class="text-xs text-emerald-200">ID Anggota: <strong class="text-white">${user.id}</strong></p>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <button onclick="router.navigate('memberCard')" class="bg-white text-emerald-900 font-bold px-4 py-2.5 rounded-xl text-sm shadow hover:bg-emerald-50 transition flex items-center space-x-2">
            <i data-lucide="credit-card" class="w-4 h-4"></i>
            <span>Kartu Anggota</span>
          </button>
          ${user.category !== 'MEMBER VIP' ? `
            <button onclick="router.navigate('upgradeVIP')" class="bg-amber-500 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm shadow hover:bg-amber-400 transition flex items-center space-x-2">
              <i data-lucide="award" class="w-4 h-4"></i>
              <span>Upgrade VIP</span>
            </button>
          ` : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-2">
          <div class="text-slate-400 text-xs font-semibold">Status Akun</div>
          <div class="text-lg font-bold text-emerald-700">${user.status}</div>
          <div class="text-xs text-slate-500">Masa Berlaku: ${user.expiredDate}</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-2">
          <div class="text-slate-400 text-xs font-semibold">Kunjungan Aplikasi</div>
          <div class="text-lg font-bold text-slate-900">12 Kali</div>
          <div class="text-xs text-slate-500">Aktif & Terhubung</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-2">
          <div class="text-slate-400 text-xs font-semibold">Buku Diunduh</div>
          <div class="text-lg font-bold text-slate-900">3 Buku</div>
          <div class="text-xs text-slate-500">Akses penuh sesuai kategori</div>
        </div>
      </div>
    </div>
  `;
}

// 8. KARTU ANGGOTA DIGITAL
function renderMemberCard() {
  const user = state.currentUser;
  if (!user) { router.navigate('login'); return ''; }

  return `
    <div class="max-w-md mx-auto space-y-6">
      <button onclick="router.navigate('memberDashboard')" class="text-emerald-700 font-semibold text-sm flex items-center space-x-1">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Kembali ke Dashboard</span>
      </button>

      <div id="digitalCard" class="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-6 rounded-3xl shadow-2xl border border-emerald-800 space-y-6 relative overflow-hidden">
        <div class="flex justify-between items-center border-b border-emerald-800 pb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-amber-500 text-slate-900 rounded-full font-bold flex items-center justify-center">SK</div>
            <div>
              <div class="font-extrabold text-sm tracking-wide">SAUNG KHATCHONK</div>
              <div class="text-[10px] text-emerald-300">Kartu Anggota Digital</div>
            </div>
          </div>
          <span class="bg-amber-500 text-slate-900 text-xs font-extrabold px-3 py-1 rounded-full">${user.category}</span>
        </div>

        <div class="flex items-center space-x-4">
          <div class="w-20 h-20 rounded-2xl bg-slate-700 overflow-hidden shadow border-2 border-amber-500 flex items-center justify-center font-bold text-2xl text-white">
            ${user.name.charAt(0)}
          </div>
          <div class="space-y-1">
            <h3 class="font-extrabold text-lg leading-tight">${user.name}</h3>
            <p class="text-xs text-emerald-300">ID: <strong class="text-white">${user.id}</strong></p>
            <p class="text-[10px] text-slate-400">Terdaftar: ${user.regDate}</p>
          </div>
        </div>

        <div class="pt-4 border-t border-emerald-800 flex justify-between items-center text-xs">
          <div>
            <span class="text-slate-400 block text-[10px]">Masa Berlaku</span>
            <span class="font-semibold">${user.expiredDate}</span>
          </div>
          <div class="bg-white p-2 rounded-xl">
            <div class="w-12 h-12 bg-slate-900 text-white font-mono text-[8px] flex items-center justify-center text-center">QR VERIFIED</div>
          </div>
        </div>
      </div>

      <button onclick="window.print()" class="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow transition">Cetak / Simpan PDF Kartu</button>
    </div>
  `;
}

// 9. HALAMAN UPGRADE VIP
function renderUpgradeVIP() {
  return `
    <div class="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
      <div class="text-center space-y-2">
        <span class="bg-amber-500 text-slate-900 font-bold text-xs px-3 py-1 rounded-full">Eksklusif</span>
        <h2 class="text-2xl font-extrabold text-slate-900">Upgrade ke MEMBER VIP</h2>
        <p class="text-xs text-slate-500">Dapatkan akses penuh ke seluruh koleksi VIP selama 5 tahun.</p>
      </div>

      <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-1">
        <div class="text-xs text-emerald-800 font-semibold">Tarif Keanggotaan VIP</div>
        <div class="text-3xl font-extrabold text-emerald-900">Rp20.000</div>
      </div>

      <div class="space-y-3">
        <h3 class="font-bold text-sm text-slate-800">Instruksi Pembayaran QRIS / DANA:</h3>
        <p class="text-xs text-slate-600">Scan QR Code di bawah menggunakan aplikasi M-Banking atau E-Wallet (QRIS/DANA), lalu unggah bukti transfer.</p>
        <div class="w-48 h-48 mx-auto bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center font-bold text-slate-400 shadow-inner">
          [QR CODE PEMBAYARAN]
        </div>
      </div>

      <form onsubmit="handleVipPayment(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Unggah Bukti Transfer / Catatan Pembayaran</label>
          <input type="file" required class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
        </div>
        <button type="submit" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl shadow transition">Kirim Bukti Pembayaran</button>
      </form>
    </div>
  `;
}

function handleVipPayment(e) {
  e.preventDefault();
  showToast('Bukti pembayaran berhasil dikirim! Menunggu verifikasi operator.', 'success');
  router.navigate('memberDashboard');
}

// 10. DASHBOARD OPERATOR MASTER
function renderOperatorDashboard() {
  const user = state.currentUser;
  if (!user || user.role !== 'MASTER') { router.navigate('login'); return ''; }

  return `
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 md:p-8 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <span class="bg-amber-500 text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded">MASTER OPERATOR</span>
          <h1 class="text-2xl md:text-3xl font-extrabold mt-1">Panel Administrasi Saung Khatchonk</h1>
          <p class="text-xs text-slate-300">Pengelolaan penuh perpustakaan digital, arsip GDrive, dan anggota.</p>
        </div>
        <button onclick="triggerExcelImport()" class="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow transition flex items-center space-x-2">
          <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
          <span>Import Excel Buku</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="text-slate-400 text-xs font-semibold">Total Buku</div>
          <div class="text-3xl font-bold text-slate-900 mt-1">${state.books.length}</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="text-slate-400 text-xs font-semibold">Total Anggota</div>
          <div class="text-3xl font-bold text-slate-900 mt-1">${state.members.length}</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="text-slate-400 text-xs font-semibold">Kategori VIP</div>
          <div class="text-3xl font-bold text-amber-600 mt-1">${state.books.filter(b => b.category === 'VIP').length}</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="text-slate-400 text-xs font-semibold">Penyimpanan GDrive</div>
          <div class="text-3xl font-bold text-emerald-700 mt-1">Aktif</div>
        </div>
      </div>

      <!-- Tabel Manajemen Buku -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-lg text-slate-900">Manajemen Koleksi Buku</h3>
          <button onclick="showAddBookModal()" class="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow">Tambah Buku</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-slate-700 uppercase text-xs">
              <tr>
                <th class="p-3">Kode Arsip</th>
                <th class="p-3">Judul Buku</th>
                <th class="p-3">Penulis</th>
                <th class="p-3">Kategori</th>
                <th class="p-3">Format</th>
                <th class="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${state.books.map(b => `
                <tr>
                  <td class="p-3 font-semibold text-slate-900">${b.id}</td>
                  <td class="p-3 font-bold text-slate-800">${b.title}</td>
                  <td class="p-3">${b.author}</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded text-xs font-bold ${b.category === 'VIP' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">${b.category}</span></td>
                  <td class="p-3">${b.format}</td>
                  <td class="p-3 space-x-2">
                    <button onclick="deleteBook('${b.id}')" class="text-red-600 hover:text-red-800 font-semibold text-xs">Hapus</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function deleteBook(id) {
  state.books = state.books.filter(b => b.id !== id);
  localStorage.setItem('SK_BOOKS', JSON.stringify(state.books));
  showToast('Buku berhasil dihapus.', 'success');
  renderApp();
}

function triggerExcelImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx, .xls, .csv';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet);
      
      rows.forEach((r, idx) => {
        const newBook = {
          id: `SK-2026-${String(state.books.length + 1 + idx).padStart(5, '0')}`,
          title: r.Judul || r.title || 'Tanpa Judul',
          author: r.Penulis || r.author || 'Anonim',
          publisher: r.Penerbit || r.publisher || 'Saung Khatchonk',
          year: r.Tahun || r.year || 2026,
          isbn: r.ISBN || '-',
          category: r.Kategori || 'Biasa',
          format: r.Format || 'PDF',
          status: 'Tersedia',
          description: r.Deskripsi || 'Diimpor otomatis dari file Excel.',
          cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
          fileUrl: '#'
        };
        state.books.push(newBook);
      });

      localStorage.setItem('SK_BOOKS', JSON.stringify(state.books));
      showToast(`Berhasil mengimpor ${rows.length} buku dari Excel!`, 'success');
      renderApp();
    };
    reader.readAsArrayBuffer(file);
  };
  input.click();
}

// Toast Notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-6 right-6 z-50 px-6 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all transform translate-y-0 ${type === 'success' ? 'bg-emerald-700' : 'bg-red-700'}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Jalankan Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', initApp);
