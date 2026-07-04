# 🔐 RSVP multi-clients — Guide de mise en service

Architecture :

```
Invité   →  https://votre-domaine.com/w/WED-7XK92P        (invitation publique)
Client   →  https://votre-domaine.com/dashboard/WED-7XK92P (tableau de bord privé)
```

- Chaque mariage a un **wedding_id unique** (ex. `WED-7XK92P`).
- Les invités **insèrent** leur réponse dans Supabase — et ne peuvent
  rien lire, modifier ou supprimer (Row Level Security).
- Le tableau de bord est protégé par **mot de passe** ; la lecture et la
  suppression passent par une API serveur qui utilise la clé
  `service_role` (jamais envoyée au navigateur) et qui filtre toujours
  sur le `wedding_id` de l'URL.

---

## Étape 1 — Coller les règles de sécurité (SQL)

1. https://supabase.com/dashboard → votre projet
2. Menu gauche → **SQL Editor** → **New query**
3. Copiez tout le contenu de `supabase/rsvp-policies.sql` → **Run**

Résultat :

| Qui | Peut | Ne peut pas |
| --- | --- | --- |
| Invités (clé anon) | INSERT (avec limites : nom ≤ 120, message ≤ 1000, 0–20 pers., statut yes/no, langue fr/ar) | SELECT / UPDATE / DELETE |
| API serveur (service_role) | tout, mais le code filtre chaque requête sur le wedding_id de l'URL | — |

*(Le script crée aussi des policies pour des admins Supabase Auth —
inutile pour le tableau de bord par mot de passe, mais sans danger et
utile si vous voulez un jour des comptes admin.)*

## Étape 2 — Les clés du site

Dashboard → **Project Settings** → **API**, puis copiez
`.env.local.example` → `.env.local` et remplissez :

```
NEXT_PUBLIC_SUPABASE_URL=...        (URL du projet)
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   (clé "anon public" — pour le formulaire)
SUPABASE_SERVICE_ROLE_KEY=...       (clé "service_role" — pour le dashboard, serveur uniquement)
DASHBOARD_PASSWORD=...              (mot de passe du tableau de bord)
```

En production (Vercel…), mettez ces 4 valeurs dans les variables
d'environnement du projet. ⚠️ La clé `service_role` et le mot de passe
ne doivent jamais apparaître dans le code ou le navigateur.

## Étape 3 — Configurer le mariage

Dans `wedding-config.json` :

```json
"weddingId": "WED-7XK92P",
"admin": { "password": "change-this-password" }
```

- `weddingId` : identifiant unique du mariage (lettres/chiffres/tirets).
- `admin.password` : mot de passe **de secours pour le développement
  local**. En production, `DASHBOARD_PASSWORD` (variable
  d'environnement) le remplace — utilisez-la, car tout ce qui est dans
  wedding-config.json est visible dans le code du site.

## Étape 4 — Utilisation

- **Lien invités** : `https://votre-domaine.com/w/WED-7XK92P`
  (la page d'accueil `/` fonctionne aussi et utilise le weddingId du
  fichier de config)
- **Lien client** : `https://votre-domaine.com/dashboard/WED-7XK92P`
  → mot de passe → statistiques (réponses, présents, absents, total
  d'invités), recherche par nom, filtre présents/absents, export CSV,
  suppression de réponses.

Chaque tableau de bord ne montre **que** les réponses de son
`wedding_id` : l'API filtre côté serveur, un client ne peut pas voir ni
toucher les réponses d'un autre mariage.

## Pour chaque nouveau client

1. Dupliquez le site (nouveau déploiement) avec son propre
   `wedding-config.json` : nouveau `weddingId` (ex. `WED-9QL41Z`),
   noms, textes, photos.
2. Même projet Supabase, même table — les réponses sont séparées par
   `wedding_id`.
3. Donnez au client ses deux liens + son mot de passe.

---

## Vérifier la sécurité (2 minutes)

Dans le SQL Editor :

```sql
select policyname, cmd, roles from pg_policies
where tablename = 'rsvp_responses';
```

Test invité (clé anon, via l'API Docs du dashboard) :
- `select` sur `rsvp_responses` → **0 ligne** attendu
- `insert` valide → doit réussir

Test dashboard : mauvais mot de passe → « Mot de passe incorrect » ;
bon mot de passe → les réponses du mariage uniquement.
