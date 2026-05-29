# Backend du projet Blog Multi-Role

Ce repository contient le backend Node.js/Express du projet de blog multi-role decrit dans le rapport.

## Installation

1. Copier `.env.example` en `.env` et adapter les valeurs :

```bash
cp .env.example .env
```

2. Installer les dependances :

```bash
npm install
```

## Lancer le serveur

Ce projet utilise les modules ES de Node.js (`type: "module"` dans `package.json`). Assurez-vous d'executer Node.js 18+.

```bash
node server.js
```

Le serveur ecoute par defaut sur le port `3000`.

## Routes principales

- `POST /api/auth/register` : inscription d'un nouvel utilisateur
- `POST /api/auth/login` : connexion et generation d'access token + refresh token
- `POST /api/auth/token` : rafraîchissement de l'access token
- `POST /api/auth/logout` : deconnexion (revocation du refresh token)
- `GET /api/blogs` : recuperation de tous les blogs
- `GET /api/blogs/:id` : recuperation d'un blog par ID
- `POST /api/blogs` : creation d'un blog (role `auteur` ou `admin` requis)
- `PUT /api/blogs/:id` : modification d'un blog (auteur ou admin)
- `DELETE /api/blogs/:id` : suppression d'un blog (auteur ou admin)

## Structure des fichiers

- `server.js` : point d'entree de l'application
- `db.js` : configuration de la connexion PostgreSQL
- `auth.js` : generation des JWT d'accès et de rafraîchissement
- `middleware/auth.js` : middleware de validation des access tokens
- `middleware/roles.js` : middleware de verification des rôles
- `routes/auth.js` : routes d'authentification
- `routes/blogs.js` : routes de gestion des blogs

## Git et mise en ligne

Avant de mettre le backend en ligne, ajoutez un `.gitignore` pour exclure les fichiers sensibles et volumineux :
- `node_modules/`
- `.env`
- `*.log`
- `.vscode/`
- `rapport/`

Commandes Git utilisees pour initialiser le projet :

```bash
echo "# blog" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/joachimbang/blog.git
git push -u origin main
```

Ensuite, pour stocker le backend dans une branche separee :

```bash
git checkout -b backend
git add .
git commit -m "backend setup"
```

## Remarque

Pour la demonstration, les refresh tokens sont stockes en memoire dans `routes/auth.js`. En production, il faut les stocker dans une base de donnees ou un store securise afin de pouvoir les revoquer correctement.
