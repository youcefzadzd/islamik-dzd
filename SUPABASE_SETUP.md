# 🔐 Supabase — Guide de mise en service (RSVP sécurisé)

Votre table `rsvp_responses` existe déjà et RLS est activé.
Il reste 4 étapes, dans l'ordre :

---

## Étape 1 — Coller les règles de sécurité (SQL)

1. Ouvrez votre projet sur https://supabase.com/dashboard
2. Menu de gauche → **SQL Editor** → **New query**
3. Ouvrez le fichier `supabase/rsvp-policies.sql` de ce projet,
   copiez **tout** son contenu, collez-le, puis cliquez **Run**.

Ce script (idempotent, ré-exécutable sans risque) crée :

| Règle | Effet |
| --- | --- |
| `guests can insert rsvp` | les invités (clé anon) peuvent **uniquement insérer** une réponse, avec des limites (nom ≤ 120 car., message ≤ 1000, 0–20 personnes, statut `yes/no`, langue `fr/ar`) |
| *(aucune règle SELECT/UPDATE/DELETE pour anon)* | les invités **ne peuvent ni lire, ni modifier, ni supprimer** — RLS refuse tout par défaut |
| table `wedding_admins` | associe un compte admin ↔ un `wedding_id` (multi-clients) |
| `admins read/update/delete own wedding` | un admin connecté ne voit et ne gère **que les réponses de son propre mariage** |

## Étape 2 — Créer le compte admin du client

1. Dashboard → **Authentication** → **Users** → **Add user**
   (email + mot de passe, cochez "Auto confirm").
2. Retour au **SQL Editor**, liez ce compte à son mariage :

```sql
insert into public.wedding_admins (user_id, wedding_id)
values (
  (select id from auth.users where email = 'client@example.com'),
  'amine-fatima-2026'
);
```

⚠️ Le `wedding_id` doit être **identique** au champ `"wedding" → "id"`
de `wedding-config.json`. Chaque client a son propre `wedding_id` et son
propre compte : il ne verra jamais les réponses des autres mariages
(garanti par la base, pas seulement par l'interface).

## Étape 3 — Connecter le site

1. Dashboard → **Project Settings** → **API** : copiez l'URL du projet
   et la clé **anon public**.
2. Dans ce projet, copiez `.env.local.example` → `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

3. Redémarrez le site (`npm run dev` ou redéploiement).

Dès que ces clés sont présentes, le formulaire RSVP envoie chaque
réponse dans `rsvp_responses` (avec `wedding_id`, nom, présence, nombre
de personnes, message et langue). Sans les clés, le site continue de
fonctionner comme avant (email formsubmit ou stockage local).

> La clé **anon** est publique par conception — la sécurité réelle est
> assurée par les règles RLS de l'étape 1. Ne mettez **jamais** la clé
> `service_role` dans le site.

## Étape 4 — Le tableau de bord

Ouvrez **`/admin`** sur votre site (exemple :
`https://votre-site.com/admin`).

- Connexion avec l'email/mot de passe créés à l'étape 2.
- Statistiques : réponses, présents, total d'invités.
- Liste des réponses (nom, présence, personnes, message, langue, date)
  avec suppression possible.
- Chaque client connecté ne voit que **son** mariage.

---

## Vérifier la sécurité (optionnel, 2 minutes)

Dans le SQL Editor, exécutez :

```sql
-- doit être vide ou lister uniquement vos policies :
select policyname, cmd, roles from pg_policies
where tablename = 'rsvp_responses';
```

Puis testez en anonyme (Dashboard → API Docs → utilisez la clé anon) :
un `select` sur `rsvp_responses` doit renvoyer **0 ligne**, un `insert`
valide doit réussir.
