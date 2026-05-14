# Derby Names

Application web pour **référencer et gérer des derby names** du roller derby : liste publique, association aux clubs, validation par e-mail et suivi des changements de nom.

---

## Aperçu

- **Liste des derby names** avec filtres par club, département et recherche texte.
- **Inscription / mise à jour** via le formulaire « Ajouter mon derby name » : choix d’un club existant ou proposition d’un **nouveau club** absent de la liste.
- **Modification du derby name ou du club** : nouvelle demande avec le **même e-mail** déjà confirmé ; un lien de validation finalise le remplacement (l’ancienne entrée confirmée est alors remplacée, l’historique des noms est conservé). Case **« Je modifie uniquement mon club »** : pas besoin de ressaisir derby name ni numéro de roster — seuls l’e-mail et le nouveau club sont requis, puis confirmation par mail.
- **Historique des changements de nom** (lien magique par e-mail ou consultation publique depuis la liste).

---

## Stack technique

| Domaine        | Choix                          |
|----------------|--------------------------------|
| Framework UI   | [SolidJS](https://www.solidjs.com/) + [SolidStart](https://start.solidjs.com/) |
| Build / serveur| [Vinxi](https://vinxi.vercel.app/) (preset Node) |
| Styles         | [Tailwind CSS](https://tailwindcss.com/) v4 |
| Base de données| [MySQL](https://www.mysql.com/) via [Drizzle ORM](https://orm.drizzle.team/) |
| Langage        | TypeScript                     |

---

## Prérequis

- **Node.js** ≥ 22  
- **pnpm** (recommandé) ou npm/yarn  
- Instance **MySQL** accessible (URL de connexion type `mysql://…`)

---

## Installation

```bash
pnpm install
```

### Variables d’environnement

À partir du modèle `.env.exemple` (ou `pnpm run env:from-example` si configuré) :

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | Connexion MySQL pour Drizzle |
| `FRONTEND_URL` | URL publique du site (liens dans les e-mails) |
| `EMAIL_API_URL` / `EMAIL_API_KEY` / `EMAIL_FROM` | Envoi des e-mails de confirmation (optionnel en dev) |
| `FEATURE_PREMIUM_*` | Flags fonctionnalités premium (`0` / `1`) |

Ne commitez **jamais** de secrets ; utilisez uniquement la configuration déployée ou un fichier `.env` local ignoré par Git.

---

## Scripts

| Commande | Description |
|----------|-------------|
| `pnpm run dev` | Serveur de développement |
| `pnpm run build` | Build production (Vinxi / Nitro) |
| `pnpm run start` | Lance le build Node (après `build`) |
| `pnpm run db:push` | Applique le schéma Drizzle (`drizzle-kit push`) |
| `pnpm run db:studio` | Interface Drizzle Studio |
| `pnpm run clubs:import` | Import / traitement des clubs (script projet) |
| `pnpm run db:seed-clubs` | Seed des clubs depuis JSON |

---

## Base de données

- Schéma : `src/db/schema.ts`  
- Migrations / état : suivre les conventions du dépôt (`db:migrate`, `db:push` selon le flux retenu).

---

## Annonces utilisateur (« Nouveautés »)

Le fichier **`src/content/announcements.md`** alimente une fenêtre modale au premier chargement.  
Tout le texte **hors** blocs `<!-- … -->` est affiché en Markdown. Si, après suppression des commentaires, le fichier est vide, **aucune** fenêtre ne s’affiche.  
La fermeture « Compris » mémorise un **hash** du contenu dans `localStorage` : toute modification du fichier réaffiche l’annonce.

---

## Développement & qualité

Avant une PR ou un commit, exécuter la commande CI du dépôt : ici **`pnpm run build`**.

---

## Déploiement

Le build produit une application Node (`node .output/server/index.mjs` après build Vinxi / Nitro selon la configuration). Adapter variables d’environnement et proxy HTTPS sur l’environnement cible.

---

## Licence / mentions

Voir les pages légales du site et les conventions du dépôt pour la livraison (Linear, branches, commits conventionnels).
