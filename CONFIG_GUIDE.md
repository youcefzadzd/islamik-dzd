# 💍 Guide de configuration — دليل الإعدادات

Tout le contenu du site se modifie dans **un seul fichier** :

```
wedding-config.json
```

Ouvrez-le avec n'importe quel éditeur de texte (Bloc-notes, VS Code…),
modifiez les valeurs entre guillemets, enregistrez — le site se met à
jour automatiquement au prochain démarrage/déploiement.

> ⚠️ Règles d'or du JSON :
> - Ne supprimez jamais les guillemets `"` ni les virgules `,`
> - N'ajoutez pas de virgule après le **dernier** élément d'une liste
> - Enregistrez le fichier en UTF-8 (par défaut partout)

---

## 1. Les noms — الأسماء

```json
"couple": {
  "groomName": "Youcef",      ← prénom du marié (affichage français)
  "brideName": "Katia",       ← prénom de la mariée (affichage français)
  "groomNameAr": "يوسف",      ← prénom du marié en arabe
  "brideNameAr": "كاتيا"      ← prénom de la mariée en arabe
}
```

## 2. Date, heure et compte à rebours — التاريخ والوقت

```json
"wedding": {
  "date": "2026-08-14",                    ← date du mariage (ANNÉE-MOIS-JOUR)
  "time": "16:00",                         ← heure (format 24h)
  "countdownDate": "2026-08-14T16:00:00",  ← cible du compte à rebours
  "rsvpDeadline": "2026-08-01"             ← date limite de réponse
}
```

✨ Les dates affichées ("Vendredi 14 Août 2026", "قبل 1 أغسطس 2026"…)
sont générées **automatiquement** en français et en arabe à partir de
ces champs. Changez une date ici et tous les textes suivent.

## 3. Le lieu — المكان

```json
"locationName": "AB Parke",          ← nom de la salle (français)
"locationNameAr": "AB Parke",        ← nom de la salle (arabe)
"address": "Bouira, Algérie",        ← adresse (français)
"addressAr": "البويرة، الجزائر",     ← adresse (arabe)
"googleMapsUrl": "https://maps.app.goo.gl/...",   ← lien du bouton Google Maps
"googleMapsEmbedUrl": "https://www.google.com/maps/embed?..."  ← carte intégrée
```

Pour la carte intégrée : remplacez le texte après `!1s` dans l'URL par
le nom de votre salle (les espaces s'écrivent `%20`). Laissez vide `""`
pour masquer la carte.

## 4. Le programme — البرنامج

Chaque étape a une heure et un titre dans les deux langues :

```json
"program": [
  { "time": "16:00", "title_fr": "Accueil des invités", "title_ar": "استقبال الضيوف" },
  { "time": "17:00", "title_fr": "Cérémonie & Fatiha",  "title_ar": "العقد والفاتحة" }
]
```

Ajoutez ou supprimez des lignes librement (attention à la virgule après
chaque ligne sauf la dernière).

## 5. Les photos — الصور

```json
"media": {
  "heroImage": "/assets/hero-background.webp",      ← grande image d'accueil
  "thankYouImage": "/assets/thankyou-background.webp", ← image de la page finale
  "gallery": [
    "/assets/gallery/gallery-1.jpg",                ← les 4 photos de la galerie
    "/assets/gallery/gallery-2.jpg",
    "/assets/gallery/gallery-3.jpg",
    "/assets/gallery/gallery-4.jpg"
  ]
}
```

Pour changer une photo : placez votre image dans le dossier
`public/assets/gallery/` puis écrivez son chemin ici
(exemple : `/assets/gallery/ma-photo.jpg`).

## 6. La musique — الموسيقى

```json
"music": "/music/wedding.mp3",          ← musique de fond (boucle, volume 30%)
"openingSound": "/music/opening.mp3"    ← petit son d'ouverture de l'enveloppe
```

Deux fichiers libres de droits (licence Pixabay, usage commercial
autorisé) sont déjà inclus dans `public/music/` — voir `CREDITS.txt`.

À l'ouverture de l'enveloppe : le son d'ouverture joue une fois, puis
la musique démarre en fondu et tourne en boucle. Un petit bouton 🎵 en
bas à droite permet de couper/relancer la musique.

Pour changer de musique : placez votre mp3 dans `public/music/` et
écrivez son chemin ici. Laissez `""` pour désactiver.

## 7. Les couleurs — الألوان

```json
"theme": {
  "primaryColor": "#7B1E2B",     ← bordeaux (boutons, sceau, accents)
  "goldColor": "#C6A15B",        ← or (titres, bordures, ornements)
  "backgroundColor": "#F8F3EA",  ← ivoire (fond du site)
  "textColor": "#5A4636"         ← brun (texte)
}
```

Les nuances claires/foncées sont calculées automatiquement.
Choisissez vos codes couleur sur https://htmlcolorcodes.com

## 8. Contact — التواصل

```json
"contact": {
  "phone": "+213XXXXXXXXX",     ← s'affiche en bas du site (appel direct)
  "whatsapp": "+213XXXXXXXXX"   ← bouton WhatsApp
}
```

Laissez `""` pour ne rien afficher.

## 9. RSVP (confirmation de présence)

```json
"rsvp": {
  "enabled": true,               ← false pour masquer toute la section
  "maxGuests": 6,                ← nombre maximum de personnes par réponse
  "sendToEmail": ""              ← votre email pour recevoir les réponses
}
```

📧 **Recevoir les réponses par email** : écrivez votre adresse dans
`sendToEmail` (service gratuit formsubmit.co — à la première réponse,
vous recevrez un email de confirmation à valider une seule fois).
Si le champ reste vide, les réponses sont gardées dans le navigateur
de chaque invité (localStorage).

## 10. Tous les textes — النصوص

Chaque phrase du site existe en deux versions dans `"texts"` :

- `"fr": { ... }` → version française
- `"ar": { ... }` → version arabe (النسخة العربية)

Modifiez les deux pour garder le site cohérent. Exemple :

```json
"rsvpTitle": "Confirmez votre présence"     (fr)
"rsvpTitle": "أكد حضورك"                    (ar)
```

Champ spécial : dans `rsvpSubtitle`, gardez `{deadline}` tel quel —
il est remplacé automatiquement par la date limite formatée.

| Champ | Où il apparaît |
| --- | --- |
| `heroTop` | ligne au-dessus du titre (bismillah) |
| `heroTitle` | grand titre de l'accueil |
| `scrollHint` | indication de défilement |
| `introCalligraphy` | les 3 lignes calligraphiées |
| `introMessage` | le message d'invitation |
| `ayah` / `ayahReference` | le verset et sa référence |
| `countdown...` | section compte à rebours |
| `programTitle` | titre du programme |
| `locationTitle` / `mapButton` | section lieu |
| `gallery...` | section galerie |
| `rsvp...` / `success...` / `errorMessage` | formulaire de présence |
| `thankYou...` / `dua` / `signature` | page finale |
| `contactLabel` | petit titre au-dessus du téléphone |

---

## Vérifier après modification

```
npm run dev
```

puis ouvrez http://localhost:3000 — si la page ne s'affiche pas,
vérifiez les virgules et guillemets dans `wedding-config.json`
(collez le fichier sur https://jsonlint.com pour trouver l'erreur).
