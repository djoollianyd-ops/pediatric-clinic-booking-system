// URL de l'API backend. En local avec `npm start` dans /backend, elle tourne sur le port 3000.
const API_BASE = window.API_BASE || 'http://localhost:3000/api';

// ===== Menu mobile =====
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
menuToggle?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
mobileNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Formulaire de réservation =====
const apptDateInput = document.getElementById('apptDate');
const apptTimeSelect = document.getElementById('apptTime');
const bookingForm = document.getElementById('bookingForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

// Empêche de choisir une date passée ou un week-end
if (apptDateInput) {
  const today = new Date();
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // demain au plus tôt
  apptDateInput.min = minDate.toISOString().split('T')[0];
}

function setStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status show ${type}`;
}

function clearStatus() {
  formStatus.className = 'form-status';
  formStatus.textContent = '';
}

async function loadSlots(dateStr) {
  apptTimeSelect.disabled = true;
  apptTimeSelect.innerHTML = '<option value="">Chargement des disponibilités…</option>';

  const day = new Date(dateStr + 'T00:00:00').getDay(); // 0 = dimanche, 6 = samedi
  if (day === 0 || day === 6) {
    apptTimeSelect.innerHTML = '<option value="">Fermé les fins de semaine</option>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/slots?date=${encodeURIComponent(dateStr)}`);
    if (!res.ok) throw new Error('Réponse serveur invalide');
    const data = await res.json();
    const available = data.slots || [];

    if (available.length === 0) {
      apptTimeSelect.innerHTML = '<option value="">Aucune plage disponible ce jour</option>';
      return;
    }
    apptTimeSelect.innerHTML = '<option value="">Choisir une heure…</option>' +
      available.map(t => `<option value="${t}">${t}</option>`).join('');
    apptTimeSelect.disabled = false;
  } catch (err) {
    // Le backend n'est peut-être pas démarré : on retombe sur des créneaux par défaut
    // pour que le formulaire reste utilisable en démonstration.
    const fallback = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
    apptTimeSelect.innerHTML = '<option value="">Choisir une heure…</option>' +
      fallback.map(t => `<option value="${t}">${t}</option>`).join('');
    apptTimeSelect.disabled = false;
  }
}

apptDateInput?.addEventListener('change', () => {
  if (apptDateInput.value) {
    loadSlots(apptDateInput.value);
  } else {
    apptTimeSelect.innerHTML = '<option value="">Choisir une date d\'abord</option>';
    apptTimeSelect.disabled = true;
  }
});

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

bookingForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearStatus();

  const formData = new FormData(bookingForm);
  const payload = Object.fromEntries(formData.entries());

  if (!isValidEmail(payload.email)) {
    setStatus('Veuillez entrer un courriel valide.', 'error');
    document.getElementById('email').focus();
    return;
  }
  if (!payload.apptTime) {
    setStatus('Veuillez choisir une heure de rendez-vous.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Envoi en cours…';

  try {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Une erreur est survenue.');
    }

    setStatus(`Demande envoyée. Un courriel de confirmation sera transmis à ${payload.email} une fois le rendez-vous validé par le cabinet.`, 'success');
    bookingForm.reset();
    apptTimeSelect.innerHTML = '<option value="">Choisir une date d\'abord</option>';
    apptTimeSelect.disabled = true;
  } catch (err) {
    setStatus(err.message || 'Impossible d\'envoyer la demande pour le moment. Réessayez ou appelez le cabinet.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Envoyer la demande de rendez-vous';
  }
});
