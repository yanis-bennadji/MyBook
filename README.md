# 📚 MyBook

MyBook est une application web moderne permettant aux passionnés de lecture de gérer leur bibliothèque personnelle, de découvrir de nouveaux livres et de partager leurs avis avec une communauté de lecteurs.

## 🌟 Fonctionnalités

- **Recherche de Livres** : Accédez à une vaste bibliothèque grâce à l'API Google Books
- **Collection Personnelle** : Gérez votre bibliothèque virtuelle
- **Système de Notes et Avis** : Partagez vos opinions et découvrez celles des autres lecteurs
- **Interface Moderne** : Une expérience utilisateur fluide et agréable
- **Responsive Design** : Accessible sur tous vos appareils

## 🛠 Technologies Utilisées

### Frontend
- **React.js** : Framework JavaScript pour l'interface utilisateur
- **Tailwind CSS** : Framework CSS pour le style
- **Axios** : Client HTTP pour les requêtes API
- **React Router** : Gestion du routage
- **Context API** : Gestion de l'état global

### Backend
- **Node.js** : Environnement d'exécution JavaScript
- **Express** : Framework web pour Node.js
- **MySQL** : Base de données relationnelle
- **JWT** : Authentification sécurisée
- **Google Books API** : Source de données pour les livres

## 🚀 Installation

1. Clonez le repository :
```bash
git clone https://github.com/votre-username/MyBook.git
cd MyBook
```

2. Installez les dépendances :
```bash
# Installation des dépendances frontend
cd frontend
npm install

# Installation des dépendances backend
cd ../backend
npm install
```

3. Configurez les variables d'environnement :
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
# - VITE_GOOGLE_BOOKS_API_KEY : Votre clé API Google Books
```

4. Lancez l'application :
```bash
# Dans le dossier backend
npm run dev

# Dans le dossier frontend
npm run dev
```

## 🔐 Sécurité

Pour des raisons de sécurité :
- Ne jamais commiter les fichiers `.env`
- Toujours utiliser les variables d'environnement pour les clés API et secrets
- Restreindre l'accès à l'API Google Books dans la console Google Cloud

## 📱 Captures d'écran

[À venir]

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push sur la branche
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- Yanis Bennadji - Développeur Principal

## 📬 Contact

Pour toute question ou suggestion, n'hésitez pas à :
- Ouvrir une issue
- Me contacter par email : yanis.bennadji@laplateforme.io

---

Fait avec ❤️ par Yanis Bennadji 