const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'changez-moi';

app.use(cors());
app.use(express.json());

// Sert les fichiers du front-end (index.html, styles.css, script.js, photos).
// Comme tous les fichiers sont dans le même dossier que server.js, on sert
// directement ce dossier — pas besoin d'une structure frontend/backend séparée.
app.use(express.static(__dirname));

const OPENING = { start: '09:00', end: '16:30', lunchStart: '12:00', lunchEnd: '13:00' };
const SLOT_MINUTES = 30;

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minutesToTime(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(mins % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function generateAllSlots() {
  const slots = [];
  let cur = timeToMinutes(OPENING.start);
  const end = timeToMinutes(OPENING.end);
  const lunchStart = timeToMinutes(OPENING.lunchStart);
  const lunchEnd = timeToMinutes(OPENING.lunchEnd);
  while (cur < end) {
    if (cur < lunchStart || cur >= lunchEnd) {
      slots.push(minutesToTime(cur));
    }
    cur += SLOT_MINUTES;
  }
  return slots;
}

function isWeekend(dateStr) {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  return day === 0 || day === 6;
}

function isValidDateStr(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !Number.isNaN(new Date(dateStr).getTime());
}

// GET /api/slots?date=YYYY-MM-DD -> créneaux encore disponibles ce jour-là
app.get('/api/slots', (req, res) => {
  const { date } = req.query;
  if (!date || !isValidDateStr(date)) {
    return res.status(400).json({ error: 'Paramètre "date" invalide (format attendu: YYYY-MM-DD).' });
  }
  if (isWeekend(date)) {
    return res.json({ slots: [] });
  }

  const taken = db
    .prepare(`SELECT appt_time FROM appointments WHERE appt_date = ? AND status != 'annule'`)
    .all(date)
    .map(r => r.appt_time);

  const slots = generateAllSlots().filter(t => !taken.includes(t));
  res.json({ slots });
});

// POST /api/reservations -> crée une demande de rendez-vous
app.post('/api/reservations', (req, res) => {
  const {
    childName, childDob, parentName, phone, email,
    apptDate, apptTime, reason, message,
  } = req.body || {};

  const required = { childName, childDob, parentName, phone, email, apptDate, apptTime, reason };
  const missing = Object.entries(required).filter(([, v]) => !v || String(v).trim() === '');
  if (missing.length > 0) {
    return res.status(400).json({ error: `Champs manquants: ${missing.map(([k]) => k).join(', ')}` });
  }
  if (!isValidDateStr(apptDate)) {
    return res.status(400).json({ error: 'Date de rendez-vous invalide.' });
  }
  if (isWeekend(apptDate)) {
    return res.status(400).json({ error: 'Le cabinet est fermé les fins de semaine.' });
  }
  if (!/^\d{2}:\d{2}$/.test(apptTime) || !generateAllSlots().includes(apptTime)) {
    return res.status(400).json({ error: 'Heure de rendez-vous invalide.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Courriel invalide.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO appointments
        (child_name, child_dob, parent_name, phone, email, appt_date, appt_time, reason, message)
      VALUES (@childName, @childDob, @parentName, @phone, @email, @apptDate, @apptTime, @reason, @message)
    `);
    const info = stmt.run({
      childName, childDob, parentName, phone, email,
      apptDate, apptTime, reason, message: message || null,
    });
    res.status(201).json({ id: info.lastInsertRowid, status: 'en_attente' });
  } catch (err) {
    if (err.code === 'ERR_SQLITE_ERROR' && /UNIQUE constraint/.test(err.message)) {
      return res.status(409).json({ error: 'Cette plage horaire vient d\'être réservée. Merci d\'en choisir une autre.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur, veuillez réessayer.' });
  }
});

// GET /api/reservations?key=... -> liste des rendez-vous, réservé au cabinet
app.get('/api/reservations', (req, res) => {
  if (req.query.key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Non autorisé.' });
  }
  const rows = db.prepare(`SELECT * FROM appointments ORDER BY appt_date, appt_time`).all();
  res.json({ appointments: rows });
});

// PATCH /api/reservations/:id -> changer le statut (confirme / annule), réservé au cabinet
app.patch('/api/reservations/:id', (req, res) => {
  if (req.query.key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Non autorisé.' });
  }
  const { status } = req.body || {};
  if (!['en_attente', 'confirme', 'annule'].includes(status)) {
    return res.status(400).json({ error: 'Statut invalide.' });
  }
  const info = db.prepare(`UPDATE appointments SET status = ? WHERE id = ?`).run(status, req.params.id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  }
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Serveur du cabinet pédiatrique lancé sur http://localhost:${PORT}`);
  console.log(`Clé admin: ${ADMIN_KEY} (changez-la via la variable d'environnement ADMIN_KEY)`);
});
