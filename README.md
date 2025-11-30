# Frontend - Calculateur de Salaire Maroc 2025

Interface utilisateur pour le calcul du salaire net à partir du brut pour les salariés au Maroc, conforme à la **Loi de Finances 2025**.

## 🌐 Déploiement

Ce frontend est déployé sur **GitHub Pages** :
- **URL** : https://naboulsi92.github.io/Calculateur-Salaire-Maroc/

## 🏗️ Architecture

```
frontend/
├── index.html          # Page principale
├── css/
│   └── style.css       # Styles (thème Neo-Maghreb Dark)
├── js/
│   ├── script.js       # Logique UI et appels API
│   └── clearable-input.js  # Composant input effaçable
└── assets/
    ├── fonts/          # Polices Icomoon
    └── img/            # Images
```

## 🔧 Configuration

L'URL de l'API backend est configurée dans `js/script.js` (ligne 8) :

```javascript
const API_BASE_URL = "https://calculateur-salaire-backend.vercel.app";
```

### Modes :
| Environnement | URL |
|--------------|-----|
| **Production** | `https://calculateur-salaire-backend.vercel.app` |
| **Développement** | `http://localhost:3000` |

## 🚀 Déploiement sur GitHub Pages

### Prérequis
- Repo GitHub créé pour le frontend

### Étapes

1. **Initialiser Git** (si pas déjà fait) :
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Frontend"
   ```

2. **Pousser sur GitHub** :
   ```bash
   git remote add origin https://github.com/Naboulsi92/Calculateur-Salaire-Maroc.git
   git branch -M main
   git push -u origin main
   ```

3. **Activer GitHub Pages** :
   - Aller sur le repo → **Settings** → **Pages**
   - Source : **Deploy from a branch**
   - Branch : **main** / **(root)**
   - Cliquer **Save**

4. **Attendre 2-3 minutes** puis accéder à l'URL

## 🖥️ Développement local

Pour tester localement avec un serveur :

```bash
# Avec Python
python -m http.server 8000

# Avec Node.js (npx)
npx serve .

# Avec VS Code Live Server
# Clic droit sur index.html → "Open with Live Server"
```

Puis ouvrir : http://localhost:8000

## 📱 Fonctionnalités

- ✅ Calcul du salaire net depuis le brut
- ✅ Gestion de l'ancienneté (prime automatique)
- ✅ Indemnités de transport et panier
- ✅ Cotisations CNSS, AMO, CIMR
- ✅ Impôt sur le Revenu (barème 2025)
- ✅ Réduction pour charges de famille
- ✅ Interface responsive (mobile-first)
- ✅ Thème sombre moderne

## 🔗 Liens

- **Backend API** : https://github.com/Naboulsi92/calculateur-salaire-backend
- **API Health** : https://calculateur-salaire-backend.vercel.app/api/health
