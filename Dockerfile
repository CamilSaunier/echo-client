# 1. IMAGE DE BASE
# Même environnement Node.js 22 Alpine pour garder la cohérence du projet.
FROM node:22-alpine3.20

# 2. ACTIVATION DE PNPM
# Configuration du chemin d'accès et activation de pnpm.
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 3. DOSSIER DE TRAVAIL
# Définition du dossier /app comme racine du projet dans le conteneur.
WORKDIR /app

# 4. OPTIMISATION DU CACHE DOCKER
# Copie prioritaire des fichiers de dépendances.
COPY package.json pnpm-lock.yaml ./

# 5. INSTALLATION DES DÉPENDANCES
# Installation de React, Vite, Tailwind, etc.
RUN pnpm install

# 6. COPIE DU CODE SOURCE
# Copie de l'application React (dossiers src, public, fichiers de config).
COPY . .

# 7. PORT DU SERVEUR DE DEV VITE
# Vite utilise le port 5173 par défaut pour le développement.
EXPOSE 5173

# 8. COMMANDE DE DÉMARRAGE (DEV)
# L'argument '--host' est indispensable : il indique à Vite d'accepter les connexions
# provenant de l'extérieur du conteneur (ton navigateur sur ta machine hôte).
CMD ["pnpm", "dev", "--host"]