# Guide Complet CI/CD avec GitHub Actions
## Exercice pratique — niveau débutant

---

## Table des matières

1. [Comprendre le CI/CD — les concepts](#1-comprendre-le-cicd--les-concepts)
2. [Présentation de l'exercice](#2-présentation-de-lexercice)
3. [Étape 1 — Créer le dépôt GitHub](#étape-1--créer-le-dépôt-github)
4. [Étape 2 — Découvrir l'application](#étape-2--découvrir-lapplication)
5. [Étape 3 — Comprendre les pipelines](#étape-3--comprendre-les-pipelines)
6. [Étape 4 — Premier pipeline CI en action](#étape-4--premier-pipeline-ci-en-action)
7. [Étape 5 — Provoquer un échec volontaire](#étape-5--provoquer-un-échec-volontaire)
8. [Étape 6 — Sécurité : les secrets GitHub](#étape-6--sécurité--les-secrets-github)
9. [Étape 7 — Protection des branches](#étape-7--protection-des-branches)
10. [Étape 8 — Le pipeline CD et les environnements](#étape-8--le-pipeline-cd-et-les-environnements)
11. [Étape 9 — Analyse de sécurité avancée (CodeQL)](#étape-9--analyse-de-sécurité-avancée-codeql)
12. [Étape 10 — Scénario complet : la Pull Request](#étape-10--scénario-complet--la-pull-request)
13. [Enjeux de sécurité — récapitulatif](#enjeux-de-sécurité--récapitulatif)
14. [Exercices bonus](#exercices-bonus)

---

## 1. Comprendre le CI/CD — les concepts

### Qu'est-ce que l'Intégration Continue (CI) ?

L'**Intégration Continue** (Continuous Integration) est une pratique qui consiste à vérifier automatiquement chaque modification de code dès qu'elle est envoyée sur le dépôt.

**Sans CI :** chaque développeur travaille dans son coin pendant des semaines, puis tout le monde fusionne son code en même temps → conflits, bugs, nuits blanches.

**Avec CI :** à chaque `git push`, une série de vérifications automatiques est déclenchée :
- Est-ce que le code respecte les conventions ? (linting)
- Est-ce que les tests passent ?
- Est-ce qu'on n'a pas introduit de faille de sécurité ?

### Qu'est-ce que le Déploiement Continu (CD) ?

Le **Déploiement Continu** (Continuous Delivery / Continuous Deployment) va plus loin : une fois la CI passée, le code est automatiquement livré vers un environnement (staging, production).

```
Code modifié
     │
     ▼
  git push
     │
     ▼
┌────────────────────────────────────┐
│         Pipeline CI                │
│  lint → tests → audit sécu → build│
└────────────────────────────────────┘
     │ (si tout passe)
     ▼
┌────────────────────────────────────┐
│         Pipeline CD                │
│  publish image → staging → prod    │
└────────────────────────────────────┘
     │
     ▼
  Application déployée !
```

### Pourquoi la sécurité est-elle au cœur du CI/CD ?

Le pipeline CI/CD est une surface d'attaque critique. Voici les risques principaux :

| Risque | Exemple concret | Contre-mesure |
|--------|----------------|---------------|
| Secrets en clair dans le code | Clé AWS dans un fichier `.env` commité | GitHub Secrets |
| Dépendances vulnérables | Bibliothèque avec faille connue (CVE) | `npm audit`, Trivy |
| Code malveillant | Injection XSS, SQL injection | CodeQL (SAST) |
| Image Docker non sécurisée | Tourner en root dans le container | Dockerfile sécurisé |
| Déploiement sans validation | Push direct en production | Branch protection + approbation |
| Pipeline compromis | Action tierce malveillante | Épingler les versions des actions |

---

## 2. Présentation de l'exercice

### Ce que vous allez faire

Vous allez travailler sur une **API Node.js simple** (une calculatrice) et mettre en place un pipeline CI/CD complet avec GitHub Actions.

### Structure du projet

```
cicdexo/
├── app/
│   ├── src/
│   │   ├── app.js          ← L'API Express
│   │   └── server.js       ← Point d'entrée
│   ├── tests/
│   │   └── app.test.js     ← Tests unitaires
│   ├── Dockerfile          ← Image Docker sécurisée
│   ├── .eslintrc.json      ← Règles de linting
│   └── package.json        ← Dépendances
│
├── .github/
│   └── workflows/
│       ├── ci.yml          ← Pipeline CI (lint, tests, sécu, docker)
│       ├── cd.yml          ← Pipeline CD (publish, staging, prod)
│       └── security-scan.yml ← Analyse CodeQL hebdomadaire
│
└── docs/
    └── GUIDE_CICD_COMPLET.md ← Ce fichier !
```

### Technologies utilisées

- **Node.js / Express** : API web simple
- **Jest + Supertest** : framework de tests
- **ESLint** : analyseur de code statique
- **Docker** : conteneurisation
- **GitHub Actions** : moteur CI/CD
- **Trivy** : scanner de vulnérabilités Docker
- **CodeQL** : analyse de sécurité du code (SAST)

---

## Étape 1 — Créer le dépôt GitHub

### 1.1 Créer un nouveau dépôt

1. Rendez-vous sur [github.com](https://github.com) et connectez-vous
2. Cliquez sur le bouton **"New"** (ou le **+** en haut à droite → "New repository")
3. Remplissez le formulaire :
   - **Repository name** : `cicd-exercice`
   - **Description** : `Exercice CI/CD avec GitHub Actions`
   - **Visibility** : `Public` (pour accéder à toutes les fonctionnalités gratuitement)
   - **Ne cochez PAS** "Add a README file" (nous allons pousser notre propre code)
4. Cliquez **"Create repository"**

### 1.2 Pousser le code sur GitHub

Ouvrez un terminal dans le dossier `cicdexo` et exécutez :

```bash
# Initialiser git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "feat: ajout application et pipelines CI/CD"

# Lier votre dépôt local au dépôt GitHub
# REMPLACEZ youssef-esgi par votre nom d'utilisateur GitHub
git remote add origin https://github.com/youssef-esgi/cicd-exercice.git

# Renommer la branche en "main"
git branch -M main

# Pousser le code
git push -u origin main
```

### 1.3 Vérifier que GitHub Actions est activé

1. Sur votre dépôt GitHub, cliquez sur l'onglet **"Actions"**
2. Si GitHub vous demande d'activer les Actions, cliquez **"I understand my workflows, go ahead and enable them"**

---

## Étape 2 — Découvrir l'application

Avant de travailler sur le CI/CD, comprenons ce que fait l'application.

### 2.1 L'API Express (app/src/app.js)

L'application expose 4 routes :

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Message de bienvenue |
| GET | `/health` | État de l'application (utilisé par les pipelines) |
| POST | `/add` | Addition de deux nombres |
| POST | `/multiply` | Multiplication de deux nombres |

**Exemple d'appel :**
```bash
curl -X POST http://localhost:3000/add \
  -H "Content-Type: application/json" \
  -d '{"a": 5, "b": 3}'

# Réponse : {"result": 8}
```

### 2.2 Les tests (app/tests/app.test.js)

Les tests vérifient :
- Que chaque route répond avec le bon code HTTP
- Que les calculs sont corrects
- Que les erreurs sont bien gérées (paramètres invalides)

### 2.3 Le Dockerfile

Le Dockerfile suit plusieurs bonnes pratiques de sécurité :

```dockerfile
# Image Alpine = image minimaliste (moins de surface d'attaque)
FROM node:20-alpine

# Créer un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copier package.json AVANT le code source
# → optimise le cache Docker : si package.json ne change pas,
#   les dépendances ne sont pas réinstallées
COPY package*.json ./
RUN npm ci --only=production  # Production seulement (pas les devDependencies)

COPY src/ ./src/

# Basculer sur l'utilisateur non-root AVANT de lancer l'app
USER appuser
```

**Pourquoi ne pas tourner en root dans un container ?**
Si l'application est compromise, un attaquant qui tourne en root peut :
- Modifier le système de fichiers
- Installer des outils malveillants
- Tenter de s'échapper du container

---

## Étape 3 — Comprendre les pipelines

### 3.1 Anatomie d'un fichier GitHub Actions

Un fichier workflow (`.github/workflows/ci.yml`) est un fichier YAML structuré ainsi :

```yaml
name: Nom du pipeline       # Affiché dans l'onglet Actions

on:                         # Déclencheurs
  push:
    branches: ["**"]        # Sur tout push, toutes les branches

jobs:                       # Liste des jobs (tâches) à exécuter
  mon-job:                  # Nom du job
    runs-on: ubuntu-latest  # Système d'exploitation de la machine virtuelle
    steps:                  # Étapes du job
      - name: Ma première étape
        run: echo "Hello World"
```

### 3.2 Les jobs du pipeline CI

Le pipeline CI (`ci.yml`) contient 4 jobs qui s'exécutent dans cet ordre :

```
  lint
   │ └──────────────┐
   ▼                ▼
  test        security-audit
   │                │
   └────────┬───────┘
            ▼
       build-docker
```

- **lint** et **security-audit** s'exécutent en parallèle après le lint
- **build-docker** attend que les DEUX jobs précédents réussissent
- Si un job échoue, les jobs suivants ne s'exécutent pas

### 3.3 Les déclencheurs (triggers)

| Déclencheur | Quand ? |
|------------|---------|
| `push: branches: ["**"]` | Tout push sur n'importe quelle branche |
| `pull_request: branches: [main]` | Toute PR vers main |
| `schedule: cron: '0 8 * * 1'` | Tous les lundis à 8h |
| `workflow_dispatch` | Déclenchement manuel |

---

## Étape 4 — Premier pipeline CI en action

### 4.1 Observer le pipeline se lancer

Après votre push de l'étape 1, le pipeline CI s'est automatiquement lancé.

1. Allez dans l'onglet **"Actions"** de votre dépôt
2. Vous devriez voir un workflow "CI - Intégration Continue" en cours d'exécution (cercle orange) ou terminé
3. Cliquez dessus pour voir le détail

### 4.2 Explorer les résultats

En cliquant sur le workflow, vous voyez les 4 jobs. Cliquez sur chacun pour voir les logs :

**Job "lint"** : Vous verrez ESLint analyser chaque fichier JavaScript.

**Job "test"** : Vous verrez Jest exécuter les 8 tests et afficher la couverture de code.

**Job "security-audit"** : `npm audit` vérifie chaque dépendance contre la base de données CVE de npm.

**Job "build-docker"** : L'image est construite puis scannée par Trivy.

### 4.3 Comprendre le rapport de couverture de code

Après les tests, un **artifact** (fichier téléchargeable) "coverage-report" est généré.

La couverture de code mesure quel pourcentage de votre code est exécuté par les tests :
- **Lines** : lignes exécutées
- **Functions** : fonctions appelées
- **Branches** : branches `if/else` testées

Dans notre `package.json`, on a fixé des seuils minimum :
```json
"coverageThreshold": {
  "global": {
    "lines": 80,
    "functions": 80,
    "branches": 70
  }
}
```
Si la couverture tombe sous ces seuils, le pipeline **échoue**.

---

## Étape 5 — Provoquer un échec volontaire

> **Objectif** : Comprendre pourquoi le CI protège la codebase en bloquant les mauvais commits.

### 5.1 Créer une nouvelle branche

```bash
git checkout -b feature/test-echec
```

### 5.2 Introduire une erreur de lint

Ouvrez `app/src/app.js` et ajoutez cette ligne avec une erreur volontaire (double égal au lieu de triple) :

```javascript
// Ajouter après les imports, avant les routes
var maVariable = "test"  // Erreur : utiliser 'var' et manque le ';' selon les règles ESLint
```

### 5.3 Pousser et observer

```bash
git add app/src/app.js
git commit -m "test: introduction d'une erreur volontaire"
git push origin feature/test-echec
```

Allez dans **Actions** → vous verrez le job "lint" échouer (croix rouge).
Les jobs "test" et "build-docker" ne s'exécutent même pas !

### 5.4 Corriger et recommencer

Supprimez la ligne ajoutée, puis :

```bash
git add app/src/app.js
git commit -m "fix: suppression de l'erreur de lint"
git push origin feature/test-echec
```

Observez que le pipeline repart et réussit cette fois.

### 5.5 Essayez aussi : casser un test

Modifiez `app/src/app.js`, changez la route `/add` pour retourner `a - b` au lieu de `a + b`. Poussez et observez le job "test" échouer.

---

## Étape 6 — Sécurité : les secrets GitHub

> **Règle d'or** : Ne jamais stocker de mot de passe, clé API ou token dans le code source, même dans un fichier `.env`.

### 6.1 Pourquoi c'est dangereux ?

Un fichier `.env` commité dans Git reste dans **l'historique pour toujours**, même si vous le supprimez plus tard. Des outils comme `truffleHog` ou `git-secrets` scannent automatiquement les dépôts publics à la recherche de credentials.

Des incidents réels :
- Des clés AWS exposées sur GitHub → factures de 50 000$ en quelques heures
- Des tokens de base de données volés → fuite de données clients

### 6.2 Créer un secret GitHub

1. Sur votre dépôt → **Settings** → **Secrets and variables** → **Actions**
2. Cliquez **"New repository secret"**
3. Créez les secrets suivants :

| Nom | Valeur (exemple) |
|-----|-----------------|
| `DATABASE_URL` | `postgresql://user:password@localhost/db` |
| `API_KEY` | `sk-monapi-123456789` |

4. Cliquez **"Add secret"**

> **Important** : Une fois créé, la valeur d'un secret n'est plus visible, même pour vous. C'est voulu.

### 6.3 Utiliser un secret dans un pipeline

Dans un fichier workflow, on accède aux secrets via `${{ secrets.NOM_DU_SECRET }}` :

```yaml
- name: Se connecter à la base de données
  run: ./deploy.sh
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    API_KEY: ${{ secrets.API_KEY }}
```

GitHub masque automatiquement les valeurs des secrets dans les logs (`***`).

### 6.4 Le secret GITHUB_TOKEN

Vous avez peut-être remarqué dans `cd.yml` :
```yaml
password: ${{ secrets.GITHUB_TOKEN }}
```

Ce token est **injecté automatiquement** par GitHub dans chaque pipeline, sans que vous ayez rien à configurer. Il permet de s'authentifier aux services GitHub (comme le Container Registry) depuis un workflow.

### 6.5 Exercice pratique

1. Ajoutez un secret `MON_SECRET` avec la valeur `super-secret-123`
2. Créez un nouveau job dans `ci.yml` :

```yaml
test-secret:
  name: Test des secrets
  runs-on: ubuntu-latest
  steps:
    - name: Afficher le secret (masqué automatiquement)
      run: echo "La valeur est : ${{ secrets.MON_SECRET }}"
```

3. Poussez et observez que les logs affichent `La valeur est : ***`

---

## Étape 7 — Protection des branches

> **Objectif** : Empêcher tout push direct sur `main` sans passer par une Pull Request et le CI.

### 7.1 Configurer la protection de branche

1. Sur votre dépôt → **Settings** → **Branches**
2. Cliquez **"Add branch protection rule"**
3. Dans "Branch name pattern", écrivez `main`
4. Cochez les options suivantes :

| Option | Pourquoi ? |
|--------|-----------|
| ✅ Require a pull request before merging | Oblige à passer par une PR |
| ✅ Require status checks to pass before merging | Le CI doit réussir |
| ✅ Require branches to be up to date before merging | Évite les conflits |
| ✅ Do not allow bypassing the above settings | Même les admins respectent les règles |

5. Dans "Status checks", recherchez et ajoutez : `test`, `lint`, `security-audit`
6. Cliquez **"Save changes"**

### 7.2 Tester la protection

Essayez de pousser directement sur main :

```bash
git checkout main
# Modifiez n'importe quel fichier
git add .
git commit -m "test: push direct sur main"
git push origin main
```

GitHub rejette le push avec l'erreur :
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Required status check "test" is expected.
```

Vous devez passer par une Pull Request, dont le CI doit être vert.

---

## Étape 8 — Le pipeline CD et les environnements

### 8.1 Créer des environnements GitHub

Les **environnements** permettent de contrôler les déploiements avec des approbations manuelles.

1. Sur votre dépôt → **Settings** → **Environments**
2. Cliquez **"New environment"** → nommez-le `staging`
3. Cliquez **"New environment"** → nommez-le `production`

Pour l'environnement **production**, ajoutez une règle d'approbation :
- Cochez **"Required reviewers"**
- Ajoutez votre propre nom d'utilisateur

Désormais, le déploiement en production nécessitera votre approbation manuelle.

### 8.2 Activer le Container Registry

Le pipeline CD publie l'image Docker sur **GitHub Container Registry (GHCR)**.

1. Sur votre dépôt → **Settings** → **Actions** → **General**
2. Sous "Workflow permissions", sélectionnez **"Read and write permissions"**
3. Sauvegardez

### 8.3 Observer le pipeline CD

Mergez une Pull Request sur `main` (ou faites un push direct sur main pour ce test).

Dans l'onglet **Actions**, vous verrez le pipeline CD :
1. **publish** : construit et publie l'image sur `ghcr.io/votre-username/cicd-exercice`
2. **deploy-staging** : déploiement automatique en staging
3. **deploy-production** : EN ATTENTE d'approbation → vous recevez un email !

Pour approuver, cliquez sur **"Review deployments"** dans l'interface Actions.

### 8.4 Voir l'image publiée

Allez sur votre profil GitHub → **"Packages"** → vous verrez votre image Docker listée !

Elle est accessible publiquement (puisque le repo est public) :
```bash
docker pull ghcr.io/youssef-esgi/cicd-exercice:latest
```

---

## Étape 9 — Analyse de sécurité avancée (CodeQL)

### 9.1 Activer l'analyse CodeQL

1. Sur votre dépôt → **Settings** → **Code security and analysis**
2. Activez **"Code scanning"**
3. Le fichier `security-scan.yml` déclenchera CodeQL automatiquement

### 9.2 Comprendre le SAST (Static Application Security Testing)

CodeQL analyse le code source **sans l'exécuter** pour détecter des vulnérabilités.

**Exemple de vulnérabilité détectée : Path Traversal**

Code vulnérable (ne faites pas ça !) :
```javascript
app.get('/file', (req, res) => {
  // DANGEREUX : l'utilisateur contrôle le chemin du fichier
  const filePath = './files/' + req.query.name;
  res.sendFile(filePath);  // Permet d'accéder à /etc/passwd avec name=../../etc/passwd
});
```

CodeQL détecterait cette faille et créerait une alerte dans l'onglet **Security** → **Code scanning alerts**.

### 9.3 Voir les alertes de sécurité

1. Onglet **Security** de votre dépôt
2. **Code scanning** : alertes CodeQL
3. **Dependabot alerts** : vulnérabilités dans les dépendances (activez-le dans Settings)

---

## Étape 10 — Scénario complet : la Pull Request

> **Objectif** : Simuler un workflow d'équipe complet.

### 10.1 Ajouter une nouvelle fonctionnalité

```bash
# Créer une branche
git checkout -b feature/division

# Modifier app/src/app.js : ajouter la division
```

Ajoutez cette route dans `app.js` :

```javascript
app.post('/divide', (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== 'number' || typeof b !== 'number') {
    return res.status(400).json({ error: 'Les paramètres a et b doivent être des nombres' });
  }
  if (b === 0) {
    return res.status(400).json({ error: 'Division par zéro impossible' });
  }
  res.json({ result: a / b });
});
```

### 10.2 Ajouter les tests correspondants

Dans `app/tests/app.test.js`, ajoutez :

```javascript
describe('POST /divide', () => {
  test('divise deux nombres', async () => {
    const res = await request(app).post('/divide').send({ a: 10, b: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(5);
  });

  test('retourne une erreur pour une division par zéro', async () => {
    const res = await request(app).post('/divide').send({ a: 10, b: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Division par zéro impossible');
  });
});
```

### 10.3 Pousser et créer une Pull Request

```bash
git add .
git commit -m "feat: ajout de la route /divide avec gestion division par zéro"
git push origin feature/division
```

Sur GitHub, vous verrez une bannière vous proposant de créer une Pull Request. Cliquez dessus !

**Remplissez la PR :**
- **Title** : `feat: ajout de la division`
- **Description** :
  ```
  ## Ce que j'ai fait
  - Ajout de la route POST /divide
  - Gestion de la division par zéro (retourne 400)
  - Tests unitaires associés

  ## Comment tester
  curl -X POST http://localhost:3000/divide -H "Content-Type: application/json" -d '{"a":10,"b":2}'
  ```

### 10.4 Observer le CI sur la PR

Sur la page de la PR, vous verrez les vérifications CI tourner en temps réel. GitHub affiche :
- ✅ `lint` — passed
- ✅ `test` — passed
- ✅ `security-audit` — passed
- ✅ `build-docker` — passed

Le bouton **"Merge pull request"** n'est cliquable que si tous les checks sont verts !

### 10.5 Merger et observer le CD

Une fois la PR mergée sur `main`, le pipeline CD se déclenche automatiquement :
1. L'image Docker est reconstruite avec la nouvelle route `/divide`
2. Elle est publiée sur GHCR avec le tag `latest`
3. Le déploiement staging se fait automatiquement
4. Le déploiement production attend votre approbation

---

## Enjeux de sécurité — récapitulatif

### Les 7 règles d'or du CI/CD sécurisé

#### Règle 1 : Épingler les versions des actions tierces

```yaml
# Dangereux : peut être compromis si le dépôt tiers est piraté
- uses: actions/checkout@main

# Sécurisé : épingler sur un hash de commit immuable
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
```

#### Règle 2 : Principe du moindre privilège

```yaml
# Donner seulement les permissions nécessaires
permissions:
  contents: read      # Lecture seule sur le code
  packages: write     # Écriture uniquement pour publier l'image
  # Pas d'autres permissions !
```

#### Règle 3 : Ne jamais mettre de secrets dans le code

```bash
# ❌ JAMAIS
DB_PASSWORD=motdepasse123  # dans le code source

# ✅ TOUJOURS
${{ secrets.DB_PASSWORD }}  # via GitHub Secrets
```

#### Règle 4 : Exiger des revues de code

La protection de branche + les PR obligatoires garantissent que chaque modification est revue par au moins une autre personne avant d'atterrir en production.

#### Règle 5 : Scanner les dépendances régulièrement

Les bibliothèques tierces sont une surface d'attaque majeure (attaques supply chain).
- `npm audit` : vérifie les CVE connues
- Dependabot : crée automatiquement des PRs pour mettre à jour les dépendances vulnérables
- Trivy : scanner les images Docker

#### Règle 6 : Avoir des environnements séparés

```
développeur → feature branch → staging → production
                                  ↑           ↑
                             automatique   approbation
                                           manuelle
```

Staging = copie de la production pour tester sans risque.

#### Règle 7 : Auditer les logs du pipeline

Dans l'onglet **Actions**, chaque exécution est loggée et archivée. Si quelque chose d'anormal se produit (déploiement non autorisé, secret utilisé de façon inattendue), les logs permettent de faire une investigation (forensics).

### Tableau des attaques CI/CD connues

| Attaque | Description | Exemple réel |
|---------|-------------|--------------|
| **Supply chain** | Compromettre une dépendance open source | Incident `event-stream` npm (2018) |
| **Typosquatting** | Publier un package au nom similaire | `lodahs` au lieu de `lodash` |
| **Action poisoning** | Compromettre une GitHub Action tierce | Attaque `tj-actions/changed-files` (2023) |
| **Secret leakage** | Exposer des credentials dans les logs | Milliers de repos GitHub publics concernés |
| **IDOR dans les artifacts** | Accéder aux artifacts d'autres repos | Vulnérabilité GitHub Actions (2023) |

---

## Exercices bonus

### Bonus 1 — Ajouter Dependabot

Créez le fichier `.github/dependabot.yml` :

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/app"
    schedule:
      interval: "weekly"
    # Dependabot créera automatiquement des PRs pour mettre à jour les dépendances
```

Observez les PRs créées automatiquement dans l'onglet **Pull Requests**.

### Bonus 2 — Notifier sur Slack

1. Créez un webhook Slack dans votre espace de travail
2. Ajoutez-le comme secret : `SLACK_WEBHOOK_URL`
3. Ajoutez cette étape à la fin du job `deploy-production` dans `cd.yml` :

```yaml
- name: Notifier Slack
  if: success()
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"✅ Déploiement en production réussi ! Commit: ${{ github.sha }}"}' \
      ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Bonus 3 — Matrice de tests (tester sur plusieurs versions de Node)

```yaml
test:
  strategy:
    matrix:
      node-version: [18, 20, 22]
  runs-on: ubuntu-latest
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
```

GitHub lance 3 jobs en parallèle, un pour chaque version de Node !

### Bonus 4 — Introduire une vulnérabilité volontaire et la détecter

Ajoutez cette route vulnérable à `app.js` (Path Traversal) :

```javascript
const fs = require('fs');
const path = require('path');

app.get('/read-file', (req, res) => {
  // VULNÉRABILITÉ INTENTIONNELLE : ne faites jamais ça !
  const filePath = path.join(__dirname, req.query.filename);
  const content = fs.readFileSync(filePath, 'utf8');
  res.send(content);
});
```

Poussez ce code et observez :
1. CodeQL créer une alerte "Path traversal" dans l'onglet Security
2. Comprenez pourquoi c'est dangereux (accès à `/etc/passwd`)
3. Corrigez : validez que le fichier est bien dans le dossier autorisé

---

## Conclusion

Vous avez maintenant mis en place un pipeline CI/CD complet et sécurisé qui :

- **Bloque** les mauvais commits (lint, tests)
- **Détecte** les vulnérabilités dans les dépendances (npm audit) et le code (CodeQL)
- **Sécurise** les credentials (GitHub Secrets)
- **Protège** les branches critiques (branch protection)
- **Contrôle** les déploiements (environments + approbation manuelle)
- **Publie** des images Docker sécurisées (utilisateur non-root, image Alpine)

C'est exactement ce que font les équipes DevSecOps dans l'industrie. Le CI/CD n'est pas seulement une question d'automatisation : c'est une ligne de défense essentielle dans la chaîne de sécurité logicielle.
