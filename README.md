# Cabinet pédiatrique — site web

## Structure
```
pediatre-site/
├── frontend/        (HTML, CSS, JS — le site public)
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── backend/          (API de réservation)
    ├── server.js
    ├── db.js
    └── package.json
```

## Lancer le site en local

1. Installer les dépendances du backend :
   ```
   cd backend
   npm install
   ```

2. Démarrer le serveur :
   ```
   npm start
   ```
   Le serveur tourne sur http://localhost:3000 et sert **à la fois** l'API et le site.
   Ouvrez simplement http://localhost:3000 dans votre navigateur.

3. Une base de données `cabinet.db` (SQLite) est créée automatiquement au premier lancement dans le dossier `backend/`. Elle contient toutes les demandes de rendez-vous.

## Consulter les rendez-vous (côté cabinet)

Par défaut, la clé admin est `changez-moi`. Changez-la avant de mettre le site en ligne :
```
ADMIN_KEY=votre-cle-secrete npm start
```

Puis, pour voir tous les rendez-vous :
```
GET http://localhost:3000/api/reservations?key=votre-cle-secrete
```

Pour confirmer ou annuler un rendez-vous :
```
PATCH http://localhost:3000/api/reservations/1?key=votre-cle-secrete
Content-Type: application/json

{ "status": "confirme" }
```
(statuts possibles : `en_attente`, `confirme`, `annule`)

## Personnaliser

- **Nom du cabinet, médecin, adresse, téléphone** : à modifier directement dans `frontend/index.html` (le contenu actuel — Dr Alix Rousseau, Laval — est un exemple à remplacer).
- **Horaires d'ouverture / durée des créneaux** : variables `OPENING` et `SLOT_MINUTES` en haut de `backend/server.js`.
- **Couleurs et typographie** : variables au tout début de `frontend/styles.css` (section `:root`).
- **Envoi d'un vrai courriel de confirmation** : le formulaire est prêt à recevoir les données, mais l'envoi de courriel n'est pas branché. On peut ajouter un service comme Resend, SendGrid ou Nodemailer dans `backend/server.js` (dans la route `POST /api/reservations`) si tu veux que les parents et le cabinet reçoivent un vrai courriel.

## Mise en ligne

Le frontend est 100% statique (peut être hébergé n'importe où : Netlify, Vercel, GitHub Pages…).
Le backend Node.js peut être hébergé sur Render, Railway, Fly.io, ou un serveur classique — tant qu'il tourne en continu, la base SQLite persiste les rendez-vous entre les redémarrages.

Si tu héberges le frontend et le backend sur des domaines différents, mets à jour `API_BASE` en haut de `frontend/script.js`.
