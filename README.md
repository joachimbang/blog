# Blog Multi-Role — Backend et Frontend léger

Ceci est le dépôt du projet "Blog Multi-Role" : une application web pédagogique composée d'un backend Node.js/Express avec PostgreSQL et d'un frontend statique (dossier `public/`). Le projet illustre :

- Authentification avec JWT (access + refresh tokens)
- Gestion de rôles (utilisateur / auteur / admin)
- Opérations CRUD pour articles et commentaires
- Connexion à PostgreSQL via le driver `pg` (sans ORM)

## Fonctionnalités principales

- Inscription / connexion / rafraîchissement de token / déconnexion
- Création, lecture, mise à jour et suppression d'articles
- Ajout et suppression de commentaires
- Contrôles d'accès basés sur les rôles
- Frontend statique servi depuis `public/`

## Prérequis

- Node.js 18+ (support des modules ES)
- PostgreSQL (local ou distant)
- Git

## Installation (rapide)

1. Cloner le dépôt :

```bash
git clone https://github.com/joachimbang/blog.git
cd blog
```

2. Créer le fichier d'environnement `.env` (voir section suivante), puis installer les dépendances :

```bash
cp .env.example .env   # ou créez .env manuellement
npm install
```

3. Configurer la base de données PostgreSQL et initialiser le schema :

```bash
createdb blog_db
psql -d blog_db -f sql/schema.sql   # si le script existe
```

4. Lancer en mode développement :

```bash
npm run dev   # nodemon ou script de dev
```

En production :

```bash
npm ci
npm start
```

Le serveur écoute par défaut sur le port défini dans `PORT` (ex. 3000).

## Variables d'environnement

Exemple minimal à placer dans ` .env ` :

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/blog_db
JWT_SECRET=une_cle_secrete
NODE_ENV=development
```

Remplacez `user`, `password` et `blog_db` par vos valeurs réelles.

## Base de données

Le dossier `sql/` contient les scripts SQL (si fournis). Importez `sql/schema.sql` pour créer les tables.

## Frontend

Les fichiers statiques sont dans le dossier `public/`. Une fois le serveur démarré, ouvrez :

```
http://localhost:3000
```

## Commandes utiles

```bash
npm install        # installer dépendances
npm run dev        # lancer en dev (nodemon)
npm start          # lancer en production
```

## Tests

Il n'y a pas de suite de tests automatisés incluse pour l'instant. Pour tester manuellement :

- Utilisez Postman ou curl pour appeler les routes API listées dans `routes/`

## Contribution

1. Forkez le dépôt
2. Créez une branche feature : `git checkout -b feat/ma-fonction`
3. Committez vos changements et poussez
4. Ouvrez une Pull Request

## License

Projet pédagogique — pas de licence explicite fournie.

---
