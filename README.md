# Backend du projet Blog Multi-Role

Ce repository contient le backend Node.js/Express du projet de blog multi-role décrit dans le rapport.

## Installation

1. Copier `.env.example` en `.env` et adapter les valeurs :

```bash
cp .env.example .env
```

2. Installer les dépendances :

```bash
npm install
```

## Lancer le serveur

Ce projet utilise les modules ES de Node.js (`type: "module"` dans `package.json`). Assurez-vous d'exécuter Node.js 18+.

```bash
node server.js
```

Le serveur écoute par défaut sur le port `3000`.

## Routes principales

- `POST /api/auth/register` : inscription d'un nouvel utilisateur
- `POST /api/auth/login` : connexion et génération d'access token + refresh token
- `POST /api/auth/token` : rafraîchissement de l'access token
- `POST /api/auth/logout` : déconnexion (révocation du refresh token)
- `GET /api/blogs` : récupération de tous les blogs
- `GET /api/blogs/:id` : récupération d'un blog par ID
- `POST /api/blogs` : création d'un blog (role `auteur` ou `admin` requis)
- `PUT /api/blogs/:id` : modification d'un blog (auteur ou admin)
- `DELETE /api/blogs/:id` : suppression d'un blog (auteur ou admin)

## Structure des fichiers

- `server.js` : point d'entrée de l'application
- `db.js` : configuration de la connexion PostgreSQL
- `auth.js` : génération des JWT d'accès et de rafraîchissement
- `middleware/auth.js` : middleware de validation des access tokens
- `middleware/roles.js` : middleware de vérification des rôles
- `routes/auth.js` : routes d'authentification
- `routes/blogs.js` : routes de gestion des blogs

## Git et mise en ligne

Avant de mettre le backend en ligne, ajoutez un `.gitignore` pour exclure les fichiers sensibles et volumineux :
- `node_modules/`
- `.env`
- `*.log`
- `.vscode/`
- `rapport/`

Commandes Git utilisées pour initialiser le projet :

```bash
echo "# blog" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/joachimbang/blog.git
git push -u origin main
```

Ensuite, pour stocker le backend dans une branche séparée :

```bash
git checkout -b backend
git add .
git commit -m "backend setup"
```

## Remarque

Pour la démonstration, les refresh tokens sont stockés en mémoire dans `routes/auth.js`. En production, il faut les stocker dans une base de données ou un store sécurisé afin de pouvoir les révoquer correctement.
