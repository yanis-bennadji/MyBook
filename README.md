# 📚 MyBook

<div align="center">
  <a href="#-mybook-english">🇬🇧 English</a> | <a href="#-mybook-français">🇫🇷 Français</a>
</div>

---

<div id="-mybook-english"></div>

# 📚 MyBook (English)

MyBook is a modern web application that allows book enthusiasts to manage their personal library, discover new books, and share their reviews with a community of readers.

<div align="center">
  <img src="frontend/src/assets/logo.png" alt="MyBook Logo" width="150"/>
  <p><em>Your personal library, wherever you are</em></p>
</div>

## 📋 Table of Contents

- [Features](#-features)
- [Project Architecture](#-project-architecture)
- [Technologies Used](#-technologies-used)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [Tests](#-tests)
- [Code Structure](#-code-structure)
- [API](#-api)
- [Security](#-security)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Team](#-team)
- [Contact](#-contact)

## 🌟 Features

- **Book Search**: Access a vast library through the Google Books API
- **Personal Collection**: Manage your virtual library
- **Favorite Books**: Mark your favorite books and organize them
- **Rating and Review System**: Share your opinions and discover those of other readers
- **User Profiles**: Customize your profile and view other users' libraries
- **Reading Statistics**: Track your reading activity and habits
- **Modern Interface**: A smooth and pleasant user experience
- **Responsive Design**: Accessible on all your devices

## 🏗 Project Architecture

MyBook uses a modern client-server architecture:

- **Frontend**: React.js application (SPA) served by Vite
- **Backend**: RESTful API built with Node.js/Express
- **Data Persistence**: MySQL with Prisma ORM
- **Authentication**: JWT with email verification system

```
MyBook/
├── frontend/           # React Application
│   ├── src/
│   │   ├── assets/     # Images, icons, etc.
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts (Auth, etc.)
│   │   ├── pages/      # Application pages
│   │   ├── services/   # API services
│   │   └── utils/      # Utility functions
├── backend/            # Node.js/Express API
│   ├── config/         # Configuration
│   ├── controllers/    # REST controllers
│   ├── middleware/     # Express middleware
│   ├── prisma/         # Prisma schema and migrations
│   ├── routes/         # API route definitions
│   ├── services/       # Business services
│   └── tests/          # Unit and integration tests
```

## 🛠 Technologies Used

### Frontend
- **React.js**: JavaScript framework for user interface (v18+)
  - **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: HTTP client for API requests
- **React Router**: Client-side routing
- **Context API**: Global state management
- **Vite**: Fast, modern build tool

### Backend
- **Node.js**: JavaScript runtime environment (v16+)
- **Express**: Minimalist web framework for Node.js
- **Prisma**: Modern ORM for MySQL
- **MySQL**: Relational database
- **JWT**: Secure authentication
- **Multer**: File upload handling
- **Jest**: JavaScript testing framework
- **Nodemailer**: Email sending service
- **Google Books API**: Book data source

## 💻 System Requirements

- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **MySQL**: v8.0 or higher
- **Disk space**: 500 MB minimum
- **Supported browsers**: Chrome (v90+), Firefox (v90+), Safari (v14+), Edge (v90+)

## 🚀 Installation

1. **Clone the repository**:
```bash
git clone https://github.com/your-username/MyBook.git
cd MyBook
```

2. **Install dependencies**:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Configure the database**:
```bash
# In the backend folder
npx prisma migrate dev
```

4. **Set up environment variables**:
```bash
# In the backend folder
cp .env.example .env
# Fill in the following variables in .env:
# - DATABASE_URL: MySQL connection URL
# - JWT_SECRET: Secret key for JWT
# - EMAIL_USER: Email for sending emails
# - EMAIL_PASSWORD: Email password
# - FRONTEND_URL: Frontend URL

# In the frontend folder
cp .env.example .env
# Fill in the following variables in .env:
# - VITE_API_URL: Backend API URL
# - VITE_AUTH_API_URL: Authentication API URL
# - VITE_GOOGLE_BOOKS_API_KEY: Your Google Books API key
```

5. **Launch the application**:
```bash
# In the backend folder
npm run dev

# In the frontend folder
npm run dev
```

## 🧪 Tests

MyBook has a Jest-based unit test suite for the backend.

### Running Tests

```bash
# In the backend folder
npm test

# Run a specific test file
npm test -- tests/auth.test.js

# Run tests with code coverage
npm test -- --coverage
```

### Test Structure

Tests are organized by functional domain:
- `auth.test.js`: Authentication functionality tests
- `user.test.js`: User functionality tests

## 📂 Code Structure

The project follows an MVC (Model-View-Controller) architecture on the backend:

- **Models**: Defined via Prisma in `prisma/schema.prisma`
- **Controllers**: Implemented in `controllers/` (handle business logic)
- **Routes**: Defined in `routes/` (expose API endpoints)

The frontend uses a component-based architecture with a clear separation between:
- **Components**: Reusable UI components
- **Pages**: Component assemblies for specific routes
- **Contexts**: Global state and shared logic
- **Services**: Interfaces to external APIs

## 📡 API

The RESTful API exposes the following endpoints:

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: User login
- `GET /api/auth/verify-email/:token`: Email verification

### Users
- `GET /api/users/profile`: Get your profile
- `PUT /api/users/profile`: Update your profile
- `GET /api/users/:id`: View a profile
- `GET /api/users/search`: Search for users
- `GET /api/users/suggested`: Get user suggestions

### Books and Collections
- `GET /api/collections/read`: List of read books
- `POST /api/collections`: Add a book to your collection
- `DELETE /api/collections/:bookId`: Remove a book from your collection

### Favorites
- `GET /api/favorite-books`: List of favorite books
- `POST /api/favorite-books`: Add a book to favorites
- `PUT /api/favorite-books/:bookId/position`: Change a favorite's position
- `DELETE /api/favorite-books/:bookId`: Remove a book from favorites

### Reviews
- `POST /api/reviews`: Create a review
- `GET /api/reviews/book/:bookId`: Read reviews on a book
- `GET /api/reviews/user`: Read a user's reviews
- `PUT /api/reviews/:id`: Edit a review
- `DELETE /api/reviews/:id`: Delete a review

### Statistics
- `GET /api/stats/stats`: Reading statistics
- `GET /api/stats/reviews`: Review activity
- `GET /api/stats/collections`: Collection activity

## 🔐 Security

For security reasons:
- Never commit `.env` files
- Always use environment variables for API keys and secrets
- Restrict Google Books API access in the Google Cloud console
- Passwords are hashed with bcrypt
- Protection against CSRF and XSS attacks
- Strict validation of user inputs
- Mandatory email verification

## 📱 Screenshots

<details>
<summary>Click to view screenshots</summary>

[Coming soon]
</details>

## 🗺 Roadmap

- **Q2 2024**: 
  - Addition of reading groups
  - AI-based book recommendations
  - Offline mode

- **Q3 2024**:
  - Mobile application (React Native)
  - Integration with other book APIs
  - Barcode scanning to add books

- **Q4 2024**:
  - Advanced social features
  - Dark mode
  - Multi-language support

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Note**: Make sure your contributions respect the project's code conventions and that all tests pass.

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## 👥 Team

- **Yanis Bennadji** - Lead Developer - [GitHub](https://github.com/your-username)

## 📬 Contact

For any questions or suggestions, feel free to:
- Open an issue on GitHub
- Contact me by email: yanis.bennadji@laplateforme.io

---

<div id="-mybook-français"></div>

# 📚 MyBook (Français)

MyBook est une application web moderne permettant aux passionnés de lecture de gérer leur bibliothèque personnelle, de découvrir de nouveaux livres et de partager leurs avis avec une communauté de lecteurs.

<div align="center">
  <img src="frontend/src/assets/logo.png" alt="MyBook Logo" width="150"/>
  <p><em>Votre bibliothèque personnelle, où que vous soyez</em></p>
</div>

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture du projet](#-architecture-du-projet)
- [Technologies utilisées](#-technologies-utilisées)
- [Prérequis système](#-prérequis-système)
- [Installation](#-installation)
- [Tests](#-tests)
- [Structure du code](#-structure-du-code)
- [API](#-api)
- [Sécurité](#-sécurité)
- [Captures d'écran](#-captures-décran)
- [Feuille de route](#-feuille-de-route)
- [Contribution](#-contribution)
- [License](#-license)
- [Équipe](#-équipe)
- [Contact](#-contact)

## 🌟 Fonctionnalités

- **Recherche de Livres** : Accédez à une vaste bibliothèque grâce à l'API Google Books
- **Collection Personnelle** : Gérez votre bibliothèque virtuelle
- **Livres Favoris** : Marquez vos livres préférés et organisez-les
- **Système de Notes et Avis** : Partagez vos opinions et découvrez celles des autres lecteurs
- **Profils Utilisateurs** : Personnalisez votre profil et consultez les bibliothèques d'autres utilisateurs
- **Statistiques de Lecture** : Suivez votre activité de lecture et vos habitudes
- **Interface Moderne** : Une expérience utilisateur fluide et agréable
- **Responsive Design** : Accessible sur tous vos appareils

## 🏗 Architecture du projet

MyBook utilise une architecture client-serveur moderne:

- **Frontend**: Application React.js (SPA) servie par Vite
- **Backend**: API RESTful Node.js/Express
- **Persistance des données**: MySQL avec Prisma ORM
- **Authentification**: JWT avec système de vérification par email

```
MyBook/
├── frontend/           # Application React
│   ├── src/
│   │   ├── assets/     # Images, icônes, etc.
│   │   ├── components/ # Composants réutilisables
│   │   ├── contexts/   # Contextes React (Auth, etc.)
│   │   ├── pages/      # Pages de l'application
│   │   ├── services/   # Services d'API
│   │   └── utils/      # Fonctions utilitaires
├── backend/            # API Node.js/Express
│   ├── config/         # Configuration
│   ├── controllers/    # Contrôleurs REST
│   ├── middleware/     # Middleware Express
│   ├── prisma/         # Schéma et migrations Prisma
│   ├── routes/         # Définitions des routes API
│   ├── services/       # Services métier
│   └── tests/          # Tests unitaires et d'intégration
```

## 🛠 Technologies Utilisées

### Frontend
- **React.js** : Framework JavaScript pour l'interface utilisateur (v18+)
- **Tailwind CSS** : Framework CSS utilitaire pour le style
- **Axios** : Client HTTP pour les requêtes API
- **React Router** : Gestion du routage côté client
- **Context API** : Gestion de l'état global
- **Vite** : Outil de build moderne et rapide

### Backend
- **Node.js** : Environnement d'exécution JavaScript (v16+)
- **Express** : Framework web minimaliste pour Node.js
- **Prisma** : ORM moderne pour MySQL
- **MySQL** : Base de données relationnelle
- **JWT** : Authentification sécurisée
- **Multer** : Gestion des téléchargements de fichiers
- **Jest** : Framework de test JavaScript
- **Nodemailer** : Service d'envoi d'emails
- **Google Books API** : Source de données pour les livres

## 💻 Prérequis système

- **Node.js** : v16.0.0 ou supérieur
- **npm** : v8.0.0 ou supérieur
- **MySQL** : v8.0 ou supérieur
- **Espace disque** : 500 MB minimum
- **Navigateurs supportés** : Chrome (v90+), Firefox (v90+), Safari (v14+), Edge (v90+)

## 🚀 Installation

1. **Clonez le repository** :
```bash
git clone https://github.com/votre-username/MyBook.git
cd MyBook
```

2. **Installez les dépendances** :
```bash
# Installation des dépendances frontend
cd frontend
npm install

# Installation des dépendances backend
cd ../backend
npm install
```

3. **Configurez la base de données** :
```bash
# Dans le dossier backend
npx prisma migrate dev
```

4. **Configurez les variables d'environnement** :
```bash
# Dans le dossier backend
cp .env.example .env
# Remplissez les variables suivantes dans .env :
# - DATABASE_URL : URL de connexion MySQL
# - JWT_SECRET : Clé secrète pour JWT
# - EMAIL_USER : Email pour l'envoi de mails
# - EMAIL_PASSWORD : Mot de passe de l'email
# - FRONTEND_URL : URL du frontend

# Dans le dossier frontend
cp .env.example .env
# Remplissez les variables suivantes dans .env :
# - VITE_API_URL : URL de l'API backend
# - VITE_AUTH_API_URL : URL de l'API d'authentification
# - VITE_GOOGLE_BOOKS_API_KEY : Votre clé API Google Books
```

5. **Lancez l'application** :
```bash
# Dans le dossier backend
npm run dev

# Dans le dossier frontend
npm run dev
```

## 🧪 Tests

MyBook possède une suite de tests unitaires pour le backend basée sur Jest.

### Exécution des tests

```bash
# Dans le dossier backend
npm test

# Exécuter un fichier de test spécifique
npm test -- tests/auth.test.js

# Exécuter les tests avec couverture de code
npm test -- --coverage
```

### Structure des tests

Les tests sont organisés par domaine fonctionnel :
- `auth.test.js` : Tests des fonctionnalités d'authentification
- `user.test.js` : Tests des fonctionnalités utilisateur

## 📂 Structure du code

Le projet suit une architecture MVC (Modèle-Vue-Contrôleur) côté backend :

- **Modèles** : Définis via Prisma dans `prisma/schema.prisma`
- **Contrôleurs** : Implémentés dans `controllers/` (gèrent la logique métier)
- **Routes** : Définies dans `routes/` (exposent les endpoints API)

Le frontend utilise une architecture basée sur les composants avec séparation claire entre :
- **Components** : Composants UI réutilisables
- **Pages** : Assemblages de composants pour des routes spécifiques
- **Contexts** : État global et logique partagée
- **Services** : Interfaces vers les API externes

## 📡 API

L'API RESTful expose les endpoints suivants :

### Authentification
- `POST /api/auth/register` : Inscription d'un nouvel utilisateur
- `POST /api/auth/login` : Connexion utilisateur
- `GET /api/auth/verify-email/:token` : Vérification de l'email

### Utilisateurs
- `GET /api/users/profile` : Récupérer son profil
- `PUT /api/users/profile` : Mettre à jour son profil
- `GET /api/users/:id` : Consulter un profil
- `GET /api/users/search` : Rechercher des utilisateurs
- `GET /api/users/suggested` : Obtenir des suggestions d'utilisateurs

### Livres et Collections
- `GET /api/collections/read` : Liste des livres lus
- `POST /api/collections` : Ajouter un livre à sa collection
- `DELETE /api/collections/:bookId` : Retirer un livre de sa collection

### Favoris
- `GET /api/favorite-books` : Liste des livres favoris
- `POST /api/favorite-books` : Ajouter un livre aux favoris
- `PUT /api/favorite-books/:bookId/position` : Modifier la position d'un favori
- `DELETE /api/favorite-books/:bookId` : Retirer un livre des favoris

### Avis
- `POST /api/reviews` : Créer un avis
- `GET /api/reviews/book/:bookId` : Lire les avis sur un livre
- `GET /api/reviews/user` : Lire les avis d'un utilisateur
- `PUT /api/reviews/:id` : Modifier un avis
- `DELETE /api/reviews/:id` : Supprimer un avis

### Statistiques
- `GET /api/stats/stats` : Statistiques de lecture
- `GET /api/stats/reviews` : Activité de critiques
- `GET /api/stats/collections` : Activité de collection

## 🔐 Sécurité

Pour des raisons de sécurité :
- Ne jamais commiter les fichiers `.env`
- Toujours utiliser les variables d'environnement pour les clés API et secrets
- Restreindre l'accès à l'API Google Books dans la console Google Cloud
- Les mots de passe sont hachés avec bcrypt
- Protection contre les attaques CSRF et XSS
- Validation stricte des entrées utilisateur
- Vérification obligatoire des emails

## 📱 Captures d'écran

<details>
<summary>Cliquez pour voir les captures d'écran</summary>

[À venir]
</details>

## 🗺 Feuille de route

- **Q2 2024** : 
  - Ajout de groupes de lecture
  - Recommandations de livres basées sur l'IA
  - Mode hors-ligne

- **Q3 2024** :
  - Application mobile (React Native)
  - Intégration avec d'autres API de livres
  - Scan de codes-barres pour ajouter des livres

- **Q4 2024** :
  - Fonctionnalités sociales avancées
  - Mode sombre
  - Support multi-langue

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add some amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

**Remarque** : Assurez-vous que vos contributions respectent les conventions de code du projet et que tous les tests passent.

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Yanis Bennadji** - Développeur Principal - [GitHub](https://github.com/votre-username)

## 📬 Contact

Pour toute question ou suggestion, n'hésitez pas à :
- Ouvrir une issue sur GitHub
- Me contacter par email : yanis.bennadji@laplateforme.io

---

<div align="center">
  <p>Fait avec ❤️ par Yanis Bennadji</p>
  <p>© 2024 MyBook</p>
</div> 