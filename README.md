#  Système de prise de rendez-vous – Cabinet pédiatrique

Application web full-stack développée pour simuler le fonctionnement d’un cabinet pédiatrique.  
Elle permet aux patients de consulter les informations du cabinet et d’effectuer une demande de rendez-vous en ligne. Une interface d’administration permet également de gérer les rendez-vous reçus.

##  Présentation du projet

Ce projet a été réalisé afin de mettre en pratique le développement d’une application web complète intégrant une interface utilisateur, un serveur backend et une base de données.

L’application comprend un site public destiné aux patients ainsi qu’un tableau de bord administratif pour la gestion des rendez-vous.

##  Fonctionnalités

###  Côté patient

- Consultation des informations du cabinet
- Présentation des services offerts
- Consultation des informations pratiques
- Sélection d’une date de rendez-vous
- Sélection d’un créneau horaire disponible
- Envoi d’une demande de rendez-vous
- Validation des informations saisies

###  Côté administration

- Tableau de bord administrateur
- Consultation des demandes de rendez-vous
- Filtrage des rendez-vous
- Confirmation des rendez-vous
- Annulation des rendez-vous
- Gestion du statut des demandes

##  Technologies utilisées

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js

**Base de données**
- SQLite

##  Structure du projet

```text
pediatric-clinic-booking-system/
├── index.html
├── admin.html
├── styles.css
├── script.js
├── admin.js
├── server.js
├── db.js
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
└── fichiers images (.jpg)
```

##  Installation et exécution

### 1. Cloner le dépôt

```bash
git clone https://github.com/djoollianyd-ops/pediatric-clinic-booking-system.git
```

### 2. Accéder au dossier du projet

```bash
cd pediatric-clinic-booking-system
```

### 3. Installer les dépendances

```bash
npm install
```

### 4. Démarrer le serveur

```bash
npm start
```

L’application peut ensuite être ouverte dans le navigateur à l’adresse indiquée par le serveur.

##  Base de données

L’application utilise SQLite pour enregistrer et gérer les rendez-vous.

Le fichier de base de données généré localement n’est pas inclus dans le dépôt GitHub afin d’éviter de publier des données créées pendant l’utilisation ou les tests de l’application.

## Compétences mises en pratique

Ce projet m’a permis de travailler notamment sur :

- le développement frontend avec HTML, CSS et JavaScript ;
- la création d’un serveur avec Node.js et Express ;
- la communication entre le frontend et le backend ;
- la manipulation et la persistance de données avec SQLite ;
- la gestion d’un système de réservation ;
- la création d’une interface d’administration ;
- l’organisation d’un projet web full-stack.

##  Auteure

**Djoolliany Dor**

Étudiante en Techniques de l’informatique.
