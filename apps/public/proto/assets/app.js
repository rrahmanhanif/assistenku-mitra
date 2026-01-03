(function () {
  const apiBase = '/api';
  const bannerId = 'api-banner';

  const MITRA_PROTO = {
    apiBase,
    token: null,
    loadToken() {
      this.token = localStorage.getItem('mitra_token');
      return this.token;
    },
    setAuthToken(token) {
      this.token = token;
      localStorage.setItem('mitra_token', token);
    },
    clearSession() {
      this.token = null;
      localStorage.removeItem('mitra_token');
      localStorage.removeItem('mitra_profile');
    },
  };

  window.MITRA_PROTO = MITRA_PROTO;

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/proto/sw.js')
        .catch((err) => console.warn('SW failed', err));
    }
  }

  const prefetched = {};

  async function fetchAPI(path) {
    try {
      const res = await fetch(`${MITRA_PROTO.apiBase}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(MITRA_PROTO.token ? { Authorization: `Bearer ${MITRA_PROTO.token}` } : {}),
        },
      });
      const data = await res.json().catch(() => null);
      const apiUnavailable = res.status === 501;
      return { ok: res.ok, status: res.status, data, apiUnavailable };
    } catch (err) {
      return { ok: false, status: 0, data: null, apiUnavailable: true };
    }
  }

  function showBanner(message) {
    let existing = document.getElementById(bannerId);
    if (!existing) {
      existing = document.createElement('div');
      existing.id = bannerId;
      existing.className = 'banner';
      const contentArea = document.querySelector('.content');
      if (contentArea) {
        contentArea.prepend(existing);
      } else {
        document.body.prepend(existing);
      }
    }
    existing.textContent = message;
  }

  async function preflightAPIs() {
    const [me, jobs, payouts] = await Promise.all([
      fetchAPI('/mitra/me'),
      fetchAPI('/mitra/jobs'),
      fetchAPI('/mitra/payouts'),
    ]);
    prefetched.me = me;
    prefetched.jobs = jobs;
    prefetched.payouts = payouts;
    if ([me, jobs, payouts].some((res) => res.apiUnavailable)) {
      showBanner('API belum siap');
    }
    return prefetched;
  }

  function initLogin() {
    const form = document.querySelector('form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      MITRA_PROTO.setAuthToken('dev-session');
      window.location.href = './dashboard.html';
    });
  }

  function initRegister() {
    const form = document.querySelector('form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      MITRA_PROTO.setAuthToken('dev-session');
      window.location.href = './verify-email.html';
    });
  }

  function initVerify() {
    const goLogin = document.getElementById('go-login');
    goLogin?.addEventListener('click', () => {
      window.location.href = './login.html';
    });
  }

  function renderJobs(listEl, jobs, apiUnavailable) {
    if (!listEl) return;
    listEl.innerHTML = '';
    if (apiUnavailable) {
      listEl.innerHTML = '<div class="empty">Menunggu API siap.</div>';
      return;
    }
    if (!jobs || jobs.length === 0) {
      listEl.innerHTML = '<div class="empty">Belum ada pekerjaan</div>';
      return;
    }
    jobs.forEach((job) => {
      const item = document.createElement('div');
      item.className = 'card job-item';
      item.innerHTML = `
        <div class="muted">${job?.category || 'Pekerjaan'}</div>
        <div><strong>${job?.title || 'Tanpa judul'}</strong></div>
        <div class="muted">${job?.status || 'Status tidak tersedia'}</div>
        <a class="btn secondary" href="./job-detail.html?id=${encodeURIComponent(job?.id || '')}">Lihat detail</a>
      `;
      listEl.appendChild(item);
    });
  }

  async function initDashboard() {
    const summaryJobs = document.getElementById('summary-jobs');
    const saldoEl = document.getElementById('saldo');
    const cta = document.getElementById('cta-jobs');
    cta?.addEventListener('click', () => (window.location.href = './jobs.html'));

    const jobsRes = prefetched.jobs || (await fetchAPI('/mitra/jobs'));
    if (jobsRes.apiUnavailable) {
      showBanner('API belum siap');
    }
    renderJobs(summaryJobs, jobsRes.data?.data || jobsRes.data?.jobs || [], jobsRes.apiUnavailable);

    const payoutRes = prefetched.payouts || (await fetchAPI('/mitra/payouts'));
    if (payoutRes.apiUnavailable) {
      showBanner('API belum siap');
    }
    if (saldoEl) {
      if (payoutRes.apiUnavailable) {
        saldoEl.textContent = '—';
      } else {
        saldoEl.textContent = payoutRes.data?.balance ?? '—';
      }
    }
  }

  async function initJobs() {
    const listEl = document.getElementById('jobs-list');
    const res = prefetched.jobs || (await fetchAPI('/mitra/jobs'));
    if (res.apiUnavailable) {
      showBanner('API belum siap');
    }
    renderJobs(listEl, res.data?.data || res.data?.jobs || [], res.apiUnavailable);
  }

  async function initJobDetail() {
    const statusGrid = document.getElementById('status-grid');
    const detailContainer = document.getElementById('job-detail');
    const note = document.getElementById('evidence-note');
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('id');

    const res = prefetched.jobs || (await fetchAPI('/mitra/jobs'));
    if (res.apiUnavailable) {
      showBanner('API belum siap');
    }

    const jobs = res.data?.data || res.data?.jobs || [];
    const job = jobs.find((j) => `${j?.id}` === jobId);

    if (detailContainer) {
      if (jobId && job) {
        detailContainer.innerHTML = `
          <h2>${job.title || 'Pekerjaan'}</h2>
          <p class="muted">${job.description || 'Detail belum tersedia'}</p>
          <p class="muted">Status: ${job.status || 'Tidak diketahui'}</p>
        `;
      } else if (jobId && !job) {
        detailContainer.innerHTML = '<div class="empty">Data pekerjaan belum tersedia atau API belum siap.</div>';
      } else {
        detailContainer.innerHTML = '<div class="muted">Pilih pekerjaan dari daftar untuk melihat detail.</div>';
      }
    }

    if (statusGrid) {
      const statuses = ['ON_ROUTE', 'IN_PROGRESS', 'SUBMIT_EVIDENCE', 'COMPLETE'];
      statusGrid.innerHTML = '';
      statuses.forEach((st) => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.textContent = st;
        statusGrid.appendChild(chip);
      });
    }

    if (note) {
      note.textContent = 'Butuh API evidence untuk kirim bukti. Saat ini tampilan UI saja.';
    }
  }

  async function initChat() {
    const list = document.getElementById('chat-list');
    const res = prefetched.jobs || (await fetchAPI('/mitra/jobs'));
    if (res.apiUnavailable) {
      showBanner('API belum siap');
    }
    const jobs = res.data?.data || res.data?.jobs || [];
    if (list) {
      list.innerHTML = '';
      if (res.apiUnavailable) {
        list.innerHTML = '<div class="empty">Menunggu API siap.</div>';
        return;
      }
      if (jobs.length === 0) {
        list.innerHTML = '<div class="empty">Belum ada percakapan</div>';
        return;
      }
      jobs.forEach((job) => {
        const row = document.createElement('div');
        row.className = 'card job-item';
        row.innerHTML = `
          <div class="muted">Order</div>
          <div><strong>${job.title || 'Pesan'}</strong></div>
          <div class="muted">Percakapan per order menunggu API</div>
        `;
        list.appendChild(row);
      });
    }
  }

  async function initPayout() {
    const saldo = document.getElementById('payout-saldo');
    const history = document.getElementById('payout-history');
    const res = prefetched.payouts || (await fetchAPI('/mitra/payouts'));
    if (res.apiUnavailable) {
      showBanner('API belum siap');
    }
    if (saldo) {
      saldo.textContent = res.apiUnavailable ? '—' : res.data?.balance ?? '—';
    }
    if (history) {
      history.innerHTML = '';
      if (res.apiUnavailable) {
        history.innerHTML = '<div class="empty">Menunggu API siap.</div>';
        return;
      }
      const items = res.data?.items || [];
      if (items.length === 0) {
        history.innerHTML = '<div class="empty">Belum ada riwayat payout</div>';
      } else {
        items.forEach((item) => {
          const row = document.createElement('div');
          row.className = 'card job-item';
          row.innerHTML = `
            <div><strong>${item?.description || 'Payout'}</strong></div>
            <div class="muted">${item?.amount ?? '—'} | ${item?.status ?? 'menunggu'}</div>
          `;
          history.appendChild(row);
        });
      }
    }
  }

  function initProfile() {
    const form = document.getElementById('profile-form');
    const storage = JSON.parse(localStorage.getItem('mitra_profile') || '{}');
    if (form) {
      ['nama', 'hp', 'ktp', 'area', 'skills'].forEach((field) => {
        if (storage[field]) {
          form.elements[field].value = storage[field];
        }
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const payload = {
          nama: form.elements['nama'].value,
          hp: form.elements['hp'].value,
          ktp: form.elements['ktp'].value,
          area: form.elements['area'].value,
          skills: form.elements['skills'].value,
        };
        localStorage.setItem('mitra_profile', JSON.stringify(payload));
        const saved = document.getElementById('profile-saved');
        if (saved) {
          saved.textContent = 'Profil tersimpan di perangkat ini.';
        }
      });
    }
  }

  function initSettings() {
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', () => {
      MITRA_PROTO.clearSession();
      window.location.href = './login.html';
    });
  }

  function initCatalog() {
    if (!window.MITRA_CATALOG) return;
    const container = document.getElementById('catalog');
    if (!container) return;
    container.innerHTML = '';
    window.MITRA_CATALOG.forEach((category) => {
      const card = document.createElement('div');
      card.className = 'card catalog-card';
      const items = category.items
        .map((item) => `<div class="muted">• ${item}</div>`)
        .join('');
      card.innerHTML = `<h3>${category.name}</h3>${items}`;
      container.appendChild(card);
    });
  }

  async function initPage() {
    registerServiceWorker();
    MITRA_PROTO.loadToken();
    const page = document.body.dataset.page;

    await preflightAPIs();

    switch (page) {
      case 'login':
        initLogin();
        break;
      case 'register':
        initRegister();
        break;
      case 'verify':
        initVerify();
        break;
      case 'dashboard':
        await initDashboard();
        initCatalog();
        break;
      case 'jobs':
        await initJobs();
        break;
      case 'job-detail':
        await initJobDetail();
        break;
      case 'chat':
        await initChat();
        break;
      case 'payout':
        await initPayout();
        break;
      case 'profile':
        initProfile();
        initCatalog();
        break;
      case 'settings':
        initSettings();
        break;
      default:
        break;
    }
  }

  document.addEventListener('DOMContentLoaded', initPage);
})();
