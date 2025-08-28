# WhatATool

Une application React moderne avec authentification et gestion d'utilitaires organisée en sections thématiques.

## 🎯 Description

**WhatATool** est une application web qui centralise vos outils dans une interface moderne et responsive. L'application est organisée en deux sections principales :

- **🧡 Web Développement** : Section pour les outils de développement web
- **💙 Utilitaires** : Section pour les applications utilitaires (incluant la gestion des courriers)

## ✨ Fonctionnalités

### Authentification
- **Connexion et inscription** avec formulaires dédiés
- **Gestion de session** avec contexte React
- **Protection des routes** avec middleware d'authentification
- **Interface utilisateur personnalisée** selon l'état de connexion

### Navigation Moderne
- **Header fixe** avec navigation responsive
- **SubNav** contextuelle selon les sections
- **Menu mobile** adaptatif
- **Footer** qui apparaît uniquement au scroll
- **Design Mobile-First** avec breakpoints responsive

### Gestion des Courriers
- **Interface de création** de nouveaux courriers avec React-Select
- **Upload de fichiers** avec drag & drop et validation
- **Intégration API** complète avec l'API Olympe
- **Workflow complet** : modèle, service, contexte React
- **Types TypeScript** stricts pour toutes les données

### Architecture Moderne
- **System de viewport** adaptatif (header + main = 100dvh minimum)  
- **Couleurs thématiques** par section (orange pour Web Dev, teal pour Utils)
- **Animations fluides** avec AOS (Animate On Scroll)

## 🚀 Technologies

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le bundling et développement
- **React Router Dom 7** pour la navigation
- **Sass/SCSS** pour les styles modulaires

### Bibliothèques
- **React Icons** pour l'iconographie
- **React Select** pour les sélecteurs avancés
- **AOS** pour les animations au scroll
- **Axios** pour les appels API

### Architecture CSS
- **Variables SCSS** centralisées par thème
- **Mixins** pour la cohérence des layouts
- **Mobile-First** avec unités modernes (dvh, em)
- **ID-based encapsulation** pour éviter les conflits CSS

## 📁 Structure du Projet

```
src/
├── components/
│   ├── authForm/         # Formulaire d'authentification
│   ├── signInForm/       # Formulaire de connexion
│   ├── signUpForm/       # Formulaire d'inscription
│   ├── button/           # Composant bouton réutilisable
│   ├── header/           # Navigation principale
│   ├── subNav/           # Navigation secondaire
│   └── footer/           # Pied de page
├── views/
│   ├── home/             # Page d'accueil
│   ├── authPage/         # Page d'authentification
│   ├── webDevelopment/   # Section Web Dev
│   ├── utils/            # Section Utilitaires
│   └── courriers/        # Gestion des courriers
│       └── nouveauCourrier/  # Création de courrier
├── context/
│   ├── user/             # Contexte utilisateur (UserContext, UserProvider)
│   └── courrier/         # Contexte courrier (CourrierContext, CourrierProvider)
├── API/
│   ├── services/         # Services d'API (auth, user, courrier)
│   └── models/           # Modèles TypeScript (user, courrier)
└── utils/
    ├── styles/           # Variables, mixins SCSS
    ├── middleware/       # Protection des routes
    ├── scripts/          # Utilitaires JavaScript
    └── types/            # Types TypeScript
```

## 🎨 Design System

### Couleurs par Section
**Web Development (Orange/Corail)**
```scss
$webdevPrimary: #ff6b47;
$webdevSecondary: #ff8a65;
$webdevGradient: linear-gradient(135deg, #ff6b47, #ff8a65);
```

**Utilitaires (Vert d'eau/Teal)**
```scss
$utilsPrimary: #26d0ce;
$utilsSecondary: #4dd0e1;  
$utilsGradient: linear-gradient(135deg, #26d0ce, #4dd0e1);
```

### Responsive Design
- **Mobile** : Base de développement (< 768px)
- **Tablet** : 1024px+ avec `@media (min-width: $tabletWidth)`
- **Desktop** : 1440px+ avec `@media (min-width: $desktopWidth)`

### Unités Modernes
- **Layouts** : `em` pour les dimensions des blocs
- **Viewport** : `dvh`/`dvw` au lieu de `vh`/`vw`
- **Bordures** : `px` pour borders et border-radius
- **Header fixe** : 6dvh, **SubNav** : 4dvh

## 🛠️ Installation et Développement

### Prérequis
- Node.js (version 18+)
- npm

### Installation
```bash
# Cloner le projet
git clone [repository-url]

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build
```

### Scripts Disponibles
- `npm run dev` : Serveur de développement avec HMR
- `npm run build` : Build TypeScript + Vite optimisé
- `npm run lint` : Linting ESLint
- `npm run preview` : Prévisualisation du build

## 🔧 Architecture Technique

### Règles de Développement
- **TypeScript strict** : Pas de `any`, typage explicite
- **SCSS modulaire** : Chaque composant a son fichier SCSS avec ID unique
- **Flexbox only** : Pas de CSS Grid, uniquement Flexbox
- **Mobile-First** : Développement smartphone d'abord
- **Gap-based spacing** : Éviter margin-top/bottom, privilégier gap

### Gestion d'État
- **UserContext** pour l'authentification globale
- **CourrierContext** pour la gestion des courriers
- **Providers React** pour l'injection des données
- **WithAuth** middleware pour protéger les routes

### Structure des Fichiers
Chaque composant suit la convention :
- `ComponentName.tsx` avec `id="componentName"`
- `componentName.scss` avec `#componentName { ... }`

---

**WhatATool** - Une application React moderne avec authentification et gestion d'utilitaires ! 🛠️