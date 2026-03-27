# Étape 1 : image de base légère
FROM node:20-alpine

# Bonne pratique sécurité : ne pas tourner en root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers de dépendances en premier (optimisation cache Docker)
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --omit=dev

# Copier le reste du code
COPY src/ ./src/

# Changer le propriétaire des fichiers
RUN chown -R appuser:appgroup /app

# Basculer sur l'utilisateur non-root
USER appuser

# Exposer le port de l'application
EXPOSE 3000

# Commande de démarrage
CMD ["node", "src/server.js"]
