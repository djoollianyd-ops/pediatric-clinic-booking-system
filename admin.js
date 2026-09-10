const API_BASE = window.API_BASE || (window.location.origin + '/api');

const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const adminKeyInput = document.getElementById('adminKeyInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const clearFilters = document.getElementById('clearFilters');
const apptList = document.getElementById('apptList');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');

let adminKey = sessionStorage.getItem('adminKey') || '';
let allAppointments = [];

const REASON_LABELS = {
  routine: 'Visite de routine',
  vaccination: 'Vaccination',
  maladie: 'Maladie / symptômes',
  autre: 'Autre',
};
const STATUS_LABELS = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  annule: 'Annulé',
};

function showDashboard() {
  loginScreen.hidden = true;
  dashboard.hidden = false;
  logoutBtn.hidden = false;
  loadAppointments();
}

function showLogin(errorMessage) {
  dashboard.hidden = true;
  loginScreen.hidden = false;
  logoutBtn.hidden = true;
  if (errorMessage) {
    loginError.classList.add('show');
  }
}

async function loadAppointments() {
  loadingState.hidden = false;
  emptyState.hidden = true;
  apptList.innerHTML = '';

  try {
    const res = await fetch(`${API_BASE}/reservations?key=${encodeURIComponent(adminKey)}`);
    if (res.status === 401) {
      sessionStorage.removeItem('adminKey');
      showLogin(true);
      return;
    }
    if (!res.ok) throw new Error('Erreur serveur');
    const data = await res.json();
    allAppointments = data.appointments || [];
    renderList();
  } catch (err) {
    loadingState.textContent = 'Impossible de charger les rendez-vous. Vérifiez que le serveur est démarré.';
  }
}

function renderList() {
  loadingState.hidden = true;
  let items = [...allAppointments];

  if (statusFilter.value) {
    items = items.filter(a => a.status === statusFilter.value);
  }
  if (dateFilter.value) {
    items = items.filter(a => a.appt_date === dateFilter.value);
  }

  items.sort((a, b) => (a.appt_date + a.appt_time).localeCompare(b.appt_date + b.appt_time));

  apptList.innerHTML = '';
  if (items.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  for (const appt of items) {
    apptList.appendChild(renderCard(appt));
  }
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function renderCard(appt) {
  const card = document.createElement('div');
  card.className = 'appt-card';

  const actionsHtml = appt.status === 'annule'
    ? ''
    : `
      ${appt.status !== 'confirme' ? `<button class="btn btn-small btn-primary" data-action="confirme" data-id="${appt.id}">Confirmer</button>` : ''}
      <button class="btn btn-small btn-outline" data-action="annule" data-id="${appt.id}">Annuler</button>
    `;

  card.innerHTML = `
    <div class="appt-when">
      <div class="date">${formatDate(appt.appt_date)}</div>
      <div class="time">${appt.appt_time}</div>
    </div>
    <div class="appt-child">
      ${escapeHtml(appt.child_name)}
      <div class="dob">né(e) le ${formatDate(appt.child_dob)}</div>
    </div>
    <div class="appt-parent">
      <div class="name">${escapeHtml(appt.parent_name)}</div>
      <div>${escapeHtml(appt.phone)}</div>
      <div>${escapeHtml(appt.email)}</div>
    </div>
    <div class="appt-reason">
      ${REASON_LABELS[appt.reason] || escapeHtml(appt.reason)}
      <br><span class="status-badge status-${appt.status}">${STATUS_LABELS[appt.status] || appt.status}</span>
    </div>
    <div class="appt-actions">${actionsHtml}</div>
  `;

  card.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => updateStatus(btn.dataset.id, btn.dataset.action));
  });

  return card;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

async function updateStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/reservations/${id}?key=${encodeURIComponent(adminKey)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Échec de la mise à jour');
    await loadAppointments();
  } catch (err) {
    alert('Impossible de mettre à jour ce rendez-vous. Réessayez.');
  }
}

loginBtn.addEventListener('click', () => {
  const key = adminKeyInput.value.trim();
  if (!key) return;
  adminKey = key;
  sessionStorage.setItem('adminKey', key);
  loginError.classList.remove('show');
  showDashboard();
});

adminKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('adminKey');
  adminKey = '';
  showLogin();
});

refreshBtn.addEventListener('click', loadAppointments);
statusFilter.addEventListener('change', renderList);
dateFilter.addEventListener('change', renderList);
clearFilters.addEventListener('click', () => {
  statusFilter.value = '';
  dateFilter.value = '';
  renderList();
});

// Démarrage : si une clé est déjà enregistrée pour cette session, on tente de l'utiliser directement.
if (adminKey) {
  showDashboard();
} else {
  showLogin();
}
