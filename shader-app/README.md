# Shader Interactif - Motif Shippou Japonais

**Projet Option 2 - Shader Interactif**  
*Événements et Temps Réel - M2 FullStack*

##  Description du Projet

Application interactive présentant un motif traditionnel japonais **Shippou** avec des yeux géométriques qui réagissent aux interactions utilisateur en temps réel.


##  Technologies Utilisées

| Technologie | Usage | Justification |
|-------------|-------|---------------|
| **GLSL** | Calculs GPU | Performance temps réel |
| **Three.js** | Intégration WebGL | Simplicité d'implémentation |
| **TypeScript** | Logique application | Type safety et documentation |
| **Vite** | Build tool | Développement rapide |
| **HTML/CSS** | Interface utilisateur | Accessibilité et UX |

## Interactions Implémentées

### 1. Suivi de la Souris
- **Fonction** : Les pupilles suivent le curseur en temps réel
- **Implémentation** : Normalisation coordonnées [0,1] → uniforms GPU
- **Rendu** : Mouvement fluide et naturel des yeux

### 2. Flash au Clic  
- **Fonction** : Effet lumineux visible pendant 180ms
- **Implémentation** : Variable `uClick` temporaire → shader
- **Rendu** : Couleur adaptée selon le mode actif

### 3. ⌨Modes Visuels (Touches 1/2/3)
- **Mode 1** : Élégance Crème (palette traditionnelle)
- **Mode 2** : Sérénité Indigo (palette bleu)  
- **Mode 3** :  Chaleur Cuivrée (palette orange)


### Structure des Fichiers
```
shader-app/
├── index.html          # Interface utilisateur
├── src/main.ts         # Logique TypeScript + Shaders
├── package.json        # Dépendances (Three.js)
└── README.md          # Documentation
```

### Palette de Couleurs
Chaque mode propose une esthétique distincte :

- **Crème** : `rgb(245, 240, 224)` + `rgb(166, 89, 102)`
- **Indigo** : `rgb(217, 235, 250)` + `rgb(77, 51, 179)`  
- **Cuivre** : `rgb(250, 237, 217)` + `rgb(204, 115, 51)`

### Lancement du Projet
```bash
cd shader-app
npm install
npm run dev
```

### Interactions
- **Souris** : Déplacez pour diriger le regard des yeux
- **Clic** : Flash lumineux adaptatif
- **1/2/3** : Basculement entre modes visuels
- **Espace** : Pause/Resume
- **Interface** : Boutons et sélecteur de mode

## 🚀 Déploiement GitHub Pages

### Configuration vite.config.ts
```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/shader-shippou/',  // Nom de votre repository
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

### Étapes de déploiement
1. **Créer le repository GitHub** : `shader-shippou`
2. **Build du projet** :
   ```bash
   npm run build
   ```
3. **Déployer** :
   ```bash
   # Option 1: Manuelle
   git add dist -f
   git commit -m "Deploy"
   git subtree push --prefix dist origin gh-pages
   
   # Option 2: Avec gh-pages
   npm install -D gh-pages
   npm run build
   npx gh-pages -d dist
   ```

4. **Activer GitHub Pages** :
   - Repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` / `main`

### URL de démonstration
🌐 **Lien de démo** : `https://[votre-username].github.io/shader-shippou/`

### Test en local avant déploiement
```bash
npm run build    # Build le projet
npm run preview  # Teste la version de production
```

### Déploiement rapide (une commande)
```bash
npm install -D gh-pages  # Installation (une seule fois)
npm run deploy          # Build + Deploy automatique
```

### Hébergement requis par le projet
✅ **Consigne respectée** : "Votre shader devra être hébergé en ligne, par exemple via GitHub Pages"

---

## 📋 Checklist de Rendu
- ✅ **3 interactions temps réel** : Souris, Clic, Clavier
- ✅ **Performance plein écran** : 60 FPS stable
- ✅ **Interface non-shader** : Boutons pause et mode
- ✅ **Hébergement en ligne** : Configuration GitHub Pages
- ✅ **Documentation complète** : Code commenté + README