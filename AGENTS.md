# AGENTS.md - Liryna Frontend (PWA React + TypeScript + Vite)

Documentation complète pour les agents IA travaillant sur le frontend Liryna.

---

## Table des matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Commandes de développement](#commandes-de-développement)
3. [Architecture technique](#architecture-technique)
4. [Structure des dossiers](#structure-des-dossiers)
5. [Routing et navigation](#routing-et-navigation)
6. [Gestion d'état (Context API)](#gestion-détat-context-api)
7. [Services API](#services-api)
8. [Sécurité frontend](#sécurité-frontend)
9. [PWA (Progressive Web App)](#pwa-progressive-web-app)
10. [Standards de code](#standards-de-code)
11. [Styles SCSS](#styles-scss)
12. [Types TypeScript](#types-typescript)
13. [Variables d'environnement](#variables-denvironnement)
14. [Déploiement](#déploiement)
15. [Connexion API Backend (Olympe)](#connexion-api-backend-olympe)

---

## Vue d'ensemble du projet

**Liryna** est une Progressive Web App (PWA) de gestion personnelle offrant:
- **Gestion de courriers**: Upload, organisation, recherche et envoi de documents
- **Budget**: Suivi des revenus/dépenses, simulation de prêt immobilier
- **Musique**: Programmes d'apprentissage guitare, répertoire personnel

### Stack technique
| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.6.2 | Typage statique |
| Vite | 6.0.1 | Build tool / Dev server |
| React Router | 7.0.2 | Routing |
| Axios | 1.7.9 | Requêtes HTTP |
| Sass | 1.82.0 | Styles |
| Recharts | 3.7.0 | Graphiques |
| jsPDF | 4.0.0 | Génération PDF |
| AOS | 2.3.4 | Animations scroll |

### URLs
- **Production**: https://liryna.app (Vercel)
- **API**: https://api.liryna.app (Raspberry Pi)
- **Développement**: http://localhost:5173

---

## Commandes de développement

```bash
# Installation des dépendances
npm install

# Serveur de développement (port 5173)
npm run dev

# Build production
npm run build

# Preview du build
npm run preview

# Linting
npm run lint
```

### Avant de committer
```bash
# Toujours exécuter ces commandes
npm run lint
npm run build
```

---

## Architecture technique

### Pattern architectural
```
┌─────────────────────────────────────────────────────────────┐
│                        VIEWS (Pages)                         │
│  Home / Courriers / Budget / Musique / Settings / Auth      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTEXT PROVIDERS                         │
│  UserProvider / CourrierProvider / BudgetProvider / etc.    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API SERVICES                              │
│  user.service / courrier.service / budget.service / etc.    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APICalls.ts (Axios)                       │
│  Interceptors: CSRF + JWT + Error Handling                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND API (Olympe)                         │
│  https://api.liryna.app/api/*                               │
└─────────────────────────────────────────────────────────────┘
```

### Flux de données
1. **Composant** appelle une fonction du **Context**
2. **Context** appelle le **Service API** correspondant
3. **Service** utilise **APICalls.ts** avec interceptors automatiques
4. **Interceptors** ajoutent JWT (cookie) + CSRF header
5. **Réponse** remonte et met à jour l'état du Context

---

## Structure des dossiers

```
liryna/
├── public/                    # Assets statiques (PWA)
│   ├── sw.js                  # Service Worker (versionné au build)
│   ├── manifest.json          # Manifest PWA
│   ├── offline.html           # Page hors-ligne
│   └── *.png                  # Icônes PWA
│
├── src/
│   ├── main.tsx               # Point d'entrée React + Providers
│   ├── App.tsx                # Routes principales
│   │
│   ├── API/                   # Couche API
│   │   ├── APICalls.ts        # Configuration Axios + interceptors
│   │   ├── models/            # Interfaces TypeScript des réponses
│   │   │   ├── user.model.ts
│   │   │   ├── courrier.model.ts
│   │   │   ├── budget.model.ts
│   │   │   └── ...
│   │   └── services/          # Fonctions d'appel API
│   │       ├── auth.service.ts
│   │       ├── user.service.ts
│   │       ├── courrier.service.ts
│   │       ├── budget.service.ts
│   │       └── ...
│   │
│   ├── components/            # Composants réutilisables
│   │   ├── header/Header.tsx
│   │   ├── footer/Footer.tsx
│   │   ├── modal/Modal.tsx
│   │   ├── loader/Loader.tsx
│   │   ├── alert/Alert.tsx
│   │   ├── button/Button.tsx
│   │   ├── pdfViewer/         # Visualisation PDF
│   │   ├── pwaInstallButton/  # Bouton installation PWA
│   │   └── ...
│   │
│   ├── context/               # Context API Providers
│   │   ├── user/              # Authentification + profil
│   │   ├── courrier/          # Gestion courriers
│   │   ├── budget/            # Gestion budget
│   │   ├── pretImmobilier/    # Simulation prêt
│   │   ├── programmeGuitare/  # Progression musique
│   │   ├── repertoire/        # Répertoire musical
│   │   ├── loader/            # État de chargement global
│   │   └── alert/             # Notifications globales
│   │
│   ├── views/                 # Pages de l'application
│   │   ├── home/              # Accueil
│   │   ├── authPage/          # Login/Register
│   │   ├── resetPassword/     # Réinitialisation MDP
│   │   ├── settings/          # Préférences utilisateur
│   │   ├── courriers/         # Section courriers
│   │   │   ├── Courriers.tsx
│   │   │   ├── nouveauCourrier/
│   │   │   ├── listeCourriers/
│   │   │   ├── updateCourrier/
│   │   │   └── convertisseurImage/
│   │   ├── budget/            # Section budget
│   │   │   ├── Budget.tsx
│   │   │   ├── budgetDashboard/
│   │   │   ├── budgetEdit/
│   │   │   └── pretImmobilier/
│   │   └── musique/           # Section musique
│   │       ├── Musique.tsx
│   │       ├── programmeGuitare/
│   │       ├── accordagesGuitare/
│   │       └── repertoire/
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useUser.ts
│   │   ├── useCourrier.ts
│   │   ├── useBudget.ts
│   │   ├── usePretImmobilier.ts
│   │   ├── useProgrammeGuitare.ts
│   │   ├── useRepertoire.ts
│   │   ├── usePWA.ts
│   │   └── useCourrierFieldOptions.ts
│   │
│   ├── utils/
│   │   ├── styles/            # SCSS global
│   │   │   ├── variables.scss # Variables couleurs, breakpoints
│   │   │   ├── mixins.scss    # Mixins réutilisables
│   │   │   └── global.scss    # Styles globaux
│   │   │
│   │   ├── services/          # Services utilitaires
│   │   │   ├── csrfService.ts # Gestion tokens CSRF
│   │   │   ├── alertService.ts
│   │   │   ├── downloadService.ts
│   │   │   ├── budgetPdfService.ts
│   │   │   └── pretImmobilierCalculator.service.ts
│   │   │
│   │   ├── scripts/           # Fonctions utilitaires
│   │   │   ├── utils.ts
│   │   │   ├── authErrorHandling.ts
│   │   │   ├── courrierValidation.ts
│   │   │   ├── passwordValidation.ts
│   │   │   ├── browserDetection.ts
│   │   │   └── serviceWorker.ts
│   │   │
│   │   ├── helpers/           # Aides au formatage
│   │   │   ├── formatters.ts
│   │   │   └── budgetChartHelpers.ts
│   │   │
│   │   ├── constants/         # Données statiques
│   │   │   ├── courrierOptions.ts
│   │   │   ├── guitarTunings.ts
│   │   │   └── slapTips.ts
│   │   │
│   │   ├── types/             # Interfaces TypeScript
│   │   │   ├── user.types.ts
│   │   │   ├── courrier.types.ts
│   │   │   ├── budget.types.ts
│   │   │   ├── pretImmobilier.types.ts
│   │   │   └── musique.types.ts
│   │   │
│   │   └── middleware/
│   │       └── WithAuth.tsx   # HOC protection routes
│   │
│   └── assets/                # Images, fonts
│       └── background/
│
├── vite.config.ts             # Configuration Vite + plugins
├── tsconfig.json              # Configuration TypeScript
├── vercel.json                # Configuration déploiement Vercel
├── manifest.json              # Manifest PWA
└── package.json
```

---

## Routing et navigation

### Routes principales (App.tsx)

| Route | Composant | Description | Protection |
|-------|-----------|-------------|------------|
| `/` | → `/auth` | Redirection | - |
| `/auth` | AuthPage | Login/Register | Public |
| `/reset-password` | ResetPassword | Réinitialisation MDP | Public |
| `/home` | Home | Accueil | Auth requise |
| `/mail` | Courriers | Section courriers | Auth requise |
| `/mail/list` | ListeCourriers | Liste des courriers | Auth requise |
| `/mail/new` | NouveauCourrier | Upload courrier | Auth requise |
| `/mail/update/:id` | UpdateCourrier | Modification courrier | Auth requise |
| `/mail/convert` | ConvertisseurImage | Conversion image→PDF | Auth requise |
| `/budget` | Budget | Section budget | Auth requise |
| `/budget/dashboard` | BudgetDashboard | Tableau de bord | Auth requise |
| `/budget/edit` | BudgetEdit | Édition budget | Auth requise |
| `/budget/pret-immobilier` | PretImmobilier | Simulation prêt | Auth requise |
| `/musique` | Musique | Section musique | Auth requise |
| `/musique/programme-guitare` | ProgrammeGuitare | Programmes | Auth requise |
| `/musique/programme-guitare/metal-progression` | MetalGuitarProgression | Progression metal | Auth requise |
| `/musique/programme-guitare/rhythm-progression` | RhythmGuitarProgression | Progression rythme | Auth requise |
| `/musique/programme-guitare/slap-progression` | SlapGuitarProgression | Progression slap | Auth requise |
| `/musique/accordages-guitare` | AccordagesGuitare | Accordages | Auth requise |
| `/musique/repertoire` | Repertoire | Répertoire personnel | Auth requise |
| `/settings` | Settings | Paramètres compte | Auth requise |
| `*` | → `/` | Fallback | - |

### Protection des routes (WithAuth.tsx)

```typescript
// HOC pour protéger les composants
import { WithAuth } from "./utils/middleware/WithAuth";
const ProtectedComponent = WithAuth(MyComponent);
```

### Gestion des classes body par route

Le composant `BodyClassManager` ajoute automatiquement des classes au body selon la route:
- `section-home` - Page d'accueil
- `section-webdev` - Sections budget
- `section-musique` - Sections musique
- `section-utils` - Sections utils
- `has-subnav` - Si sous-navigation présente

---

## Gestion d'état (Context API)

### Providers hiérarchie (main.tsx)

```tsx
<UserProvider>           {/* Authentification - racine */}
  <CourrierProvider>     {/* Courriers */}
    <BudgetProvider>     {/* Budget */}
      <PretImmobilierProvider>  {/* Prêt immobilier */}
        <LoaderProvider> {/* État chargement global */}
          <AlertProvider> {/* Notifications */}
            <App />
          </AlertProvider>
        </LoaderProvider>
      </PretImmobilierProvider>
    </BudgetProvider>
  </CourrierProvider>
</UserProvider>
```

### UserContext (Authentification)

**Fichier**: `src/context/user/UserProvider.tsx`

```typescript
interface UserContextValue {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: IUserCredentials) => Promise<void>;
  register: (userData: IUserRegistration) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updatePreferences: (visibleSections: IVisibleSections) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}
```

### CourrierContext

**Fichier**: `src/context/courrier/CourrierProvider.tsx`

```typescript
interface CourrierContextValue {
  courriers: ICourrier[];
  currentCourrier: ICourrier | null;
  isLoading: boolean;
  pagination: IPagination | null;
  stats: ICourrierStats | null;
  uploadCourrier: (file: File, metadata: ICourrierUploadData) => Promise<ICourrier>;
  getAllCourriers: (params: ICourrierListParams) => Promise<void>;
  getCourrierById: (id: number) => Promise<void>;
  updateCourrier: (id: number, metadata: Partial<ICourrierUploadData>) => Promise<ICourrier>;
  deleteCourrier: (id: number) => Promise<void>;
  searchCourriers: (params: ICourrierSearchParams) => Promise<void>;
  downloadCourrier: (id: number) => Promise<Blob>;
  sendCourrierEmail: (id: number, emailData: {to, subject, message}) => Promise<void>;
  getCourrierStats: () => Promise<void>;
}
```

### BudgetContext

**Fichier**: `src/context/budget/BudgetProvider.tsx`

```typescript
interface BudgetContextValue {
  budget: IBudget | null;
  isLoading: boolean;
  getBudget: () => Promise<void>;
  createBudget: (data: IBudgetCreate) => Promise<void>;
  updateBudget: (id: number, data: IBudgetUpdate) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;
  getDashboard: () => Promise<IBudgetDashboard>;
}
```

### Custom hooks d'accès

```typescript
// hooks/useUser.ts
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};

// Usage dans un composant
const { user, isAuthenticated, login, logout } = useUser();
```

---

## Services API

### APICalls.ts (Configuration Axios)

**Fichier**: `src/API/APICalls.ts`

```typescript
// Configuration de base
axios.defaults.timeout = 10000;
axios.defaults.baseURL = getApiBaseUrl(); // http://localhost:8800/api ou https://api.liryna.app/api
axios.defaults.withCredentials = true; // Cookies httpOnly

// Interceptor request: Ajout automatique CSRF
axios.interceptors.request.use(async (config) => {
  const protectedMethods = ['post', 'patch', 'delete'];
  if (protectedMethods.includes(config.method?.toLowerCase() || '')) {
    const csrfHeaders = await csrfService.getCSRFHeaders();
    Object.assign(config.headers, csrfHeaders);
  }
  return config;
});

// Interceptor response: Gestion erreurs 401/403
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token JWT expiré - laisser UserProvider gérer
    } else if (error.response?.status === 403) {
      csrfService.clearToken(); // Token CSRF invalide
    }
    return Promise.reject(error);
  }
);
```

### Méthodes HTTP disponibles

```typescript
// GET - Récupération
export const getRequest = async (url: string, config?: Record<string, unknown>): Promise<AxiosResponse>

// POST - Création (JSON)
export const postRequest = async <T, R>(url: string, data: T): Promise<AxiosResponse<R>>

// POST - Upload fichiers (FormData)
export const postFormDataRequest = async <R>(url: string, formData: FormData): Promise<AxiosResponse<R>>

// PATCH - Mise à jour partielle
export const patchRequest = async <T, R>(url: string, data: T): Promise<AxiosResponse<R>>

// DELETE - Suppression
export const deleteRequest = async <R>(url: string): Promise<AxiosResponse<R>>
```

### Service CSRF

**Fichier**: `src/utils/services/csrfService.ts`

```typescript
class CSRFService {
  private token: string | null = null;
  
  async getToken(): Promise<string>;
  async fetchToken(): Promise<string>;
  getHeaderName(): string; // 'x-csrf-token'
  clearToken(): void;
  hasToken(): boolean;
  async getCSRFHeaders(): Promise<Record<string, string>>;
}

export const csrfService = new CSRFService();
```

### Structure des services API

**Exemple**: `src/API/services/courrier.service.ts`

```typescript
// Upload d'un courrier
export const uploadCourrierService = async (
  file: File,
  metadata: ICourrierUploadData
): Promise<ICourrier> => {
  const formData = new FormData();
  formData.append('courrier', file); // Champ 'courrier' OBLIGATOIRE
  formData.append('direction', metadata.direction);
  formData.append('customFileName', metadata.customFileName);
  // ... autres champs optionnels
  
  const response = await postFormDataRequest<ICourrierResponse>(
    '/courriers/upload',
    formData
  );
  return response.data.data;
};

// Récupération avec pagination
export const getAllCourriersService = async (
  params: ICourrierListParams
): Promise<{ courriers: ICourrier[], pagination: IPagination }> => {
  const response = await getRequest('/courriers', { params });
  return response.data;
};
```

---

## Sécurité frontend

### Authentification

**Mécanisme**: JWT stocké dans cookie httpOnly

```typescript
// Les cookies sont automatiquement envoyés avec withCredentials: true
// Production: cookie domain=.liryna.app (partagé entre sous-domaines)
// Développement: cookie localhost

// Vérification auth au chargement (UserProvider)
useEffect(() => {
  const initAuth = async () => {
    try {
      await getCurrentUser();
    } catch (error) {
      await logout(); // Nettoie cookie + CSRF
    }
    setIsLoading(false);
  };
  initAuth();
}, []);
```

### Protection CSRF

```typescript
// 1. Récupérer le token CSRF avant une opération protégée
const csrfHeaders = await csrfService.getCSRFHeaders();
// { 'x-csrf-token': 'xxx' }

// 2. Le token est automatiquement ajouté par l'interceptor Axios
// pour toutes les requêtes POST/PATCH/DELETE
```

### Gestion des erreurs

**Fichier**: `src/utils/scripts/authErrorHandling.ts`

```typescript
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      csrfService.clearToken();
      window.location.href = '/auth';
      return 'Session expirée';
    }
    if (error.response?.status === 403) {
      csrfService.clearToken();
      return 'Accès non autorisé';
    }
    return error.response?.data?.message || 'Erreur serveur';
  }
  return 'Erreur inconnue';
};
```

### Validation côté client

**Fichier**: `src/utils/scripts/courrierValidation.ts`

```typescript
// Types de fichiers autorisés (sync avec backend)
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export const validateCourrierForm = (data: CourrierFormData): string | null => {
  if (!['entrant', 'sortant', 'interne'].includes(data.direction)) {
    return 'Direction obligatoire';
  }
  if (!data.customFileName?.trim()) {
    return 'Nom de fichier obligatoire';
  }
  const fileNameRegex = /^[a-zA-Z0-9À-ÿ\s\-_().]+$/;
  if (!fileNameRegex.test(data.customFileName)) {
    return 'Nom de fichier contient des caractères non autorisés';
  }
  return null;
};
```

---

## PWA (Progressive Web App)

### Configuration

**Manifest**: `public/manifest.json`
```json
{
  "name": "Liryna",
  "short_name": "Liryna",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#EAEFEC",
  "background_color": "#EAEFEC"
}
```

### Service Worker

**Fichier**: `public/sw.js`

- **Version**: Générée automatiquement au build (`__BUILD_VERSION__`)
- **Mode dev**: Auto-désactivation sur localhost:5173
- **Stratégies de cache**:
  - Documents HTML: Network First
  - Assets statiques (CSS, JS, images): Cache First
  - Appels API: Network First avec fallback offline

### Initialisation PWA

**Fichier**: `src/utils/scripts/serviceWorker.ts`

```typescript
export const initializePWA = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    await navigator.serviceWorker.register('/sw.js');
  }
};
```

**Fichier**: `src/main.tsx`

```typescript
const environment = getEnvironment();
const canUsePWA = shouldEnablePWA();

if (environment === 'production' && canUsePWA) {
  initializePWA().catch(console.warn);
}
```

### Fonctionnalités offline

- Page offline: `public/offline.html`
- Cache dynamique pour les appels API
- Indicateur de mode hors ligne dans l'UI

---

## Standards de code

### Règles TypeScript

1. **AUCUN `any`** - Toujours typer explicitement
2. **Interfaces strictes** pour toutes les données
3. **Type guards** pour la gestion d'erreurs

```typescript
// ✅ Correct
interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

// ❌ Incorrect
const user: any = fetchData();
```

### Règles TSX

1. **ID unique obligatoire** sur l'élément racine de chaque composant
2. **ReactElement** comme type de retour

```tsx
// Courriers.tsx
const Courriers = (): ReactElement => {
  return (
    <main id="courriers">  {/* ID = nom du fichier en kebab-case */}
      {/* contenu */}
    </main>
  );
};
```

### Imports ordonnés

```typescript
// 1. Styles
import "./courriers.scss";
import 'aos/dist/aos.css';

// 2. Types
import { ReactElement, useEffect } from "react";
import { ICourrier } from "../../utils/types/courrier.types";

// 3. Librairies
import { useNavigate } from "react-router-dom";

// 4. Context
import { useCourrier } from "../../hooks/useCourrier";
import { useUser } from "../../hooks/useUser";

// 5. Composants
import Header from "../../components/header/Header";
import Modal from "../../components/modal/Modal";

// 6. Utils
import { formatDate } from "../../utils/helpers/formatters";
```

---

## Styles SCSS

### Variables principales

**Fichier**: `src/utils/styles/variables.scss`

```scss
// Breakpoints (Mobile First)
$mobileWidth: 768px;
$tabletWidth: 1024px;
$laptopWidth: 1280px;
$desktopWidth: 1440px;

// Couleurs par section
$budgetPrimary: #ff6b47;
$courrierPrimary: #26d0ce;
$musiquePrimary: #7c3aed;

// Typographie
$fontColorPrimary: #2c3e50;
$fontColorSecondary: #5a6c7d;

// Ombres
$shadowLight: 0 2px 8px rgba(0, 0, 0, 0.1);
$shadowMedium: 0 4px 16px rgba(0, 0, 0, 0.15);

// Transitions
$transitionFast: 0.2s ease;
$transitionMedium: 0.3s ease;
```

### Règles SCSS obligatoires

1. **Encapsulation par ID** du composant
2. **Maximum 3 niveaux** de nesting
3. **Mobile First** avec media queries
4. **`@use`** uniquement (pas `@import`)
5. **Flexbox uniquement** (pas de Grid)
6. **`gap`** au lieu de margins directionnelles
7. **`em`** pour les layouts, **`px`** pour bordures/radius
8. **`dvh/dvw`** au lieu de `vh/vw`

### Pattern SCSS obligatoire

```scss
@use "../../utils/styles/variables" as vars;
@use "../../utils/styles/mixins" as mixins;

#nomComposant {  // ID = nom du fichier en kebab-case
  // 1. Règles par défaut encapsulées
  & {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 1em;
  }

  // 2. Media queries (Mobile First)
  @media (min-width: vars.$tabletWidth) {
    flex-direction: row;
    gap: 2em;
  }

  @media (min-width: vars.$desktopWidth) {
    gap: 3em;
  }

  // 3. Pseudo-sélecteurs
  &:hover {
    background-color: vars.$greyBackground;
  }

  // 4. Sélecteurs enfants
  .childElement {
    & {
      display: flex;
      gap: 0.5em;
    }
    
    .nestedChild {
      color: vars.$fontColorPrimary;
    }
  }
}
```

### Mixins disponibles

**Fichier**: `src/utils/styles/mixins.scss`

```scss
// Viewport complet (Header + Main = 100dvh)
@mixin fullViewport {
  min-height: 100dvh;
}

// Flex centré
@mixin flexCenter {
  display: flex;
  justify-content: center;
  align-items: center;
}

// Bouton stylisé
@mixin buttonBase {
  padding: 0.75em 1.5em;
  border-radius: 4px;
  cursor: pointer;
  transition: all vars.$transitionFast;
}
```

---

## Types TypeScript

### Types utilisateur

**Fichier**: `src/utils/types/user.types.ts`

```typescript
export interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  visibleSections: IVisibleSections;
  created_at: string;
  updated_at: string;
}

export interface IVisibleSections {
  mail: boolean;
  budget: boolean;
  musique: boolean;
}

export interface IUserCredentials {
  email: string;
  password: string;
}

export interface IUserRegistration extends IUserCredentials {
  firstName: string;
  lastName: string;
}
```

### Types courrier

**Fichier**: `src/utils/types/courrier.types.ts`

```typescript
export interface ICourrier {
  id: number;
  fileName: string;
  path: string;
  fileExtention: string;
  direction: 'entrant' | 'sortant' | 'interne';
  department: string | null;
  kind: string | null;
  recipient: string | null;
  emitter: string | null;
  priority: string;
  receptionDate: string | null;
  courrierDate: string | null;
  description: string | null;
  active: boolean;
  addByUser: number;
  updateByUser: number | null;
  created_at: string;
  updated_at: string;
}

export interface ICourrierUploadData {
  direction: 'entrant' | 'sortant' | 'interne';
  customFileName: string;
  department?: string;
  kind?: string;
  emitter?: string;
  recipient?: string;
  priority?: string;
  receptionDate?: string;
  courrierDate?: string;
  description?: string;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Types budget

**Fichier**: `src/utils/types/budget.types.ts`

```typescript
export type BudgetSection = 'revenus' | 'charges_fixes' | 'charges_variables';

export interface IBudgetEntry {
  id: number;
  budgetId: number;
  section: BudgetSection;
  category: string | null;
  label: string;
  amount: number;
  sortOrder: number;
}

export interface IBudgetDebt {
  id: number;
  budgetId: number;
  type: string;
  organisme: string;
  mensualite: number;
  sortOrder: number;
}

export interface IBudget {
  id: number;
  userId: number;
  nombrePersonnes: number;
  nombreEnfants: number;
  decouvert: number;
  notes: string | null;
  entries: IBudgetEntry[];
  debts: IBudgetDebt[];
}
```

---

## Variables d'environnement

### Fichier `.env`

```env
# API URL (développement)
VITE_API_URL_DEV=http://localhost:8800/api

# API URL (production)
VITE_API_URL_PROD=https://api.liryna.app/api
```

### Utilisation dans le code

```typescript
// src/utils/scripts/utils.ts
export const getApiBaseUrl = (): string => {
  return import.meta.env.DEV
    ? import.meta.env.VITE_API_URL_DEV
    : import.meta.env.VITE_API_URL_PROD;
};
```

### Variables Vite disponibles

```typescript
import.meta.env.DEV        // true en développement
import.meta.env.PROD       // true en production
import.meta.env.MODE       // 'development' | 'production'
import.meta.env.BASE_URL   // '/' par défaut
```

---

## Déploiement

### Plateforme: Vercel

**Configuration**: `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "..." },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### Processus de build

```bash
# 1. Build production
npm run build

# Le build effectue:
# - tsc -b (vérification TypeScript)
# - vite build (compilation)
# - Injection version dans sw.js
# - Génération CSP selon environnement
```

### URLs de production

- **Frontend**: https://liryna.app
- **API**: https://api.liryna.app

---

## Connexion API Backend (Olympe)

### Endpoints principaux

| Service | Endpoint | Méthode |
|---------|----------|---------|
| **Authentification** | | |
| Login | `/api/users/login` | POST |
| Register | `/api/users/register` | POST |
| Logout | `/api/users/logout` | POST |
| Profil | `/api/users/profile` | GET |
| CSRF Token | `/api/csrf-token` | GET |
| **Courriers** | | |
| Upload | `/api/courriers/upload` | POST |
| Liste | `/api/courriers` | GET |
| Détail | `/api/courriers/:id` | GET |
| Update | `/api/courriers/:id` | PATCH |
| Delete | `/api/courriers/:id` | DELETE |
| Download | `/api/courriers/:id/download` | GET |
| Stats | `/api/courriers/stats` | GET |
| **Budget** | | |
| Mon budget | `/api/budgets` | GET |
| Créer | `/api/budgets` | POST |
| Update | `/api/budgets/:id` | PATCH |
| Dashboard | `/api/budgets/dashboard` | GET |
| **Musique** | | |
| Module | `/api/musique/modules/:slug` | GET |
| Progression | `/api/musique/progression/:slug` | GET/PATCH |
| Répertoire | `/api/repertoire` | GET/POST/PATCH/DELETE |

### Format des réponses API

```typescript
// Succès
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... }
}

// Erreur
{
  "success": false,
  "message": "Description de l'erreur"
}

// Liste avec pagination
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Headers requis

```http
# Authentification (cookie automatique)
Cookie: authToken=<jwt>

# CSRF (POST/PATCH/DELETE)
X-CSRF-TOKEN: <token>

# Content-Type (JSON)
Content-Type: application/json

# Content-Type (Upload)
Content-Type: multipart/form-data
```

---

## Checklist pour les agents

Avant de soumettre du code, vérifier:

- [ ] `npm run lint` passe sans erreurs
- [ ] `npm run build` compile sans erreurs
- [ ] Aucun `any` dans le code TypeScript
- [ ] Chaque composant TSX a un ID unique
- [ ] Chaque fichier TSX a son fichier SCSS associé
- [ ] SCSS utilise l'encapsulation par ID
- [ ] SCSS respecte le pattern Mobile First
- [ ] Les appels API utilisent les services appropriés
- [ ] Les erreurs sont gérées avec `handleApiError`
- [ ] Les uploads utilisent `postFormDataRequest`
- [ ] Les tokens CSRF sont gérés via `csrfService`
