# Exercice CI/CD — GitHub Actions

Projet exemple pour apprendre le CI/CD et la sécurité DevOps.

## Pour commencer

Lisez le guide complet : [`docs/GUIDE_CICD_COMPLET.md`](docs/GUIDE_CICD_COMPLET.md)

## Structure

```
cicdexo/
├── app/                      # Application Node.js (API calculatrice)
├── .github/workflows/        # Pipelines CI/CD
│   ├── ci.yml                # Lint + Tests + Audit sécurité + Docker
│   ├── cd.yml                # Publication + Déploiement staging/prod
│   └── security-scan.yml     # Analyse CodeQL hebdomadaire
└── docs/
    └── GUIDE_CICD_COMPLET.md # Guide pas à pas
```

## Lancer l'application en local

```bash
cd app
npm install
npm start
# API disponible sur http://localhost:3000
```

## Lancer les tests

```bash
cd app
npm test
```
