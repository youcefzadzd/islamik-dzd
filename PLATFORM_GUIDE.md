# 🏛 Plateforme d'invitations — Guide du propriétaire

Vous vendez un **service clé en main** : pour chaque client vous créez
un mariage depuis votre espace privé, et vous lui remettez deux liens
et un mot de passe.

```
/owner                          → votre espace (création / liste / édition)
/w/WED-XXXXXX                   → invitation publique du client
/dashboard/WED-XXXXXX           → tableau de bord RSVP du client
```

---

## 1. SQL à exécuter (une seule fois)

Supabase Dashboard → **SQL Editor** → **New query** → collez tout le
contenu de **`supabase/platform-schema.sql`** → **Run**.

Ce script crée la table `weddings` (verrouillée : accessible uniquement
par le serveur), le trigger `updated_at`, les index, et les règles RSVP
(les invités peuvent uniquement insérer ; personne ne peut lire les
réponses depuis le navigateur).

## 2. Variables d'environnement

Copiez `.env.local.example` → `.env.local` (et en production, dans les
variables d'environnement de votre hébergeur — Vercel : Settings →
Environment Variables) :

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet (publique) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé anon (publique — le formulaire RSVP) |
| `SUPABASE_SERVICE_ROLE_KEY` | clé service_role (**serveur uniquement**) |
| `OWNER_PASSWORD` | mot de passe de VOTRE espace `/owner` |
| `DASHBOARD_PASSWORD` | (optionnel) dashboard du mariage-démo local |

> Le projet est en **Next.js** : les variables côté navigateur doivent
> commencer par `NEXT_PUBLIC_` (les noms `VITE_*` sont propres à Vite
> et ne fonctionnent pas ici ; le serveur accepte `VITE_SUPABASE_URL`
> comme alias au besoin).

## 3. Créer votre premier mariage

1. Ouvrez `https://votre-domaine.com/owner`
2. Entrez votre `OWNER_PASSWORD`
3. Cliquez **+ Nouveau mariage** et remplissez le formulaire
   (noms FR/AR, date, heure, date limite RSVP, lieu, Maps, langues,
   programme, couleurs, textes personnalisés, contact, mot de passe
   client). Tout champ laissé vide utilise le texte du modèle.
4. Cliquez **Créer le mariage**. Vous obtenez :
   - un identifiant unique type `WED-7XK92P`
   - le lien invitation `/w/WED-7XK92P`
   - le lien dashboard `/dashboard/WED-7XK92P`
   - le mot de passe client (⚠️ notez-le tout de suite : il est stocké
     **haché** — scrypt — et ne pourra plus être affiché ; en cas
     d'oubli, définissez-en un nouveau via **modifier**)

## 4. Tester l'invitation publique

Ouvrez `/w/WED-7XK92P` (le lien copié) :
- l'invitation s'affiche avec les données du client (noms, dates,
  programme, couleurs…)
- envoyez un RSVP de test
- un identifiant inconnu (`/w/WED-ZZZZZZ`) affiche la page élégante
  « invitation introuvable »

## 5. Tester le dashboard client

Ouvrez `/dashboard/WED-7XK92P` :
- entrez le mot de passe client → statistiques + réponses de CE mariage
  uniquement (recherche, filtres, export CSV, suppression)
- un mauvais mot de passe est refusé
- le client ne peut jamais voir un autre mariage : chaque requête est
  filtrée côté serveur par le `wedding_id` de l'URL

## Gérer les mariages

Sur `/owner` : liste complète (noms, date, identifiant), boutons
**copier** pour chaque lien, **modifier**
(`/owner/weddings/WED-XXXXXX/edit` — tout est éditable, y compris un
nouveau mot de passe client), **supprimer** (supprime aussi ses
réponses RSVP).

## Sécurité — comment c'est protégé

- La table `weddings` n'a **aucune** policy client : seule l'API
  serveur (clé `service_role`, jamais envoyée au navigateur) y accède.
- Les mots de passe clients sont hachés (scrypt + sel) — jamais en
  clair en base.
- `/owner` et ses API exigent `OWNER_PASSWORD` (comparaison à temps
  constant), qui ne vit que dans l'environnement serveur.
- Les invités : INSERT uniquement sur `rsvp_responses` (RLS), avec
  limites de taille ; aucune lecture possible.
- `wedding-config.json` ne sert plus que de **modèle par défaut**
  (textes, images, musique) — les données réelles viennent de Supabase.
