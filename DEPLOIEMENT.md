# Déploiement en 4 étapes

## Étape 1 — Créer ta base de données (Supabase)

1. Va sur [supabase.com](https://supabase.com) → **Start your project** → crée un compte gratuit
2. Clique **New Project** → donne un nom (ex: "mentor-ai") → choisis un mot de passe fort → **Create new project**
3. Une fois le projet créé, va dans **SQL Editor** (menu gauche)
4. Clique **New query** → colle tout le contenu du fichier `supabase-schema.sql` → clique **Run**
5. Va dans **Settings > API** → copie :
   - **Project URL** (ex: `https://abcdef.supabase.co`)
   - **anon public** key (la longue clé qui commence par `eyJ...`)

---

## Étape 2 — Préparer les variables d'environnement

1. Copie le fichier `.env.local.example` → renomme-le `.env.local`
2. Remplis les valeurs avec ce que tu as copié depuis Supabase
3. Choisis ton `ADMIN_PASSWORD` (c'est le mot de passe pour accéder à `/admin`)

---

## Étape 3 — Déployer sur Vercel (gratuit)

1. Va sur [github.com](https://github.com) → crée un compte si tu n'en as pas
2. Crée un nouveau repository (bouton **+** en haut à droite → **New repository**)
   - Nom : `mentor-ai` → **Create repository**
3. Ouvre un terminal dans le dossier `mentor-ai` et tape :
   ```
   git init
   git add .
   git commit -m "premier commit"
   git remote add origin https://github.com/TON-PSEUDO/mentor-ai.git
   git push -u origin main
   ```
4. Va sur [vercel.com](https://vercel.com) → **Start Deploying** → connecte ton compte GitHub
5. Clique **Import** sur le repo `mentor-ai`
6. Dans **Environment Variables**, ajoute les 3 variables de ton `.env.local`
7. Clique **Deploy** → attends 2 minutes → c'est en ligne !

---

## Étape 4 — Utiliser l'app

- Ton app est accessible à l'URL Vercel (ex: `https://mentor-ai-xxx.vercel.app`)
- Va sur `/admin` → entre ton `ADMIN_PASSWORD`
- Commence à ajouter tes Q&As, articles, posts !

---

## Structure des types de contenu

| Type | Quand l'utiliser |
|------|-----------------|
| **Q&A** | Une question précise + ta réponse détaillée. Le plus utile pour l'IA. |
| **Article** | Un texte long que tu as écrit (blog, newsletter...) |
| **Post** | Un post court (LinkedIn, Twitter, notes perso) |
| **Texte libre** | Tout le reste |

## Tips pour enrichir ta base

- Commence par les Q&As : ce sont les plus faciles à ingérer pour l'IA
- Vise 50+ entrées avant de lancer le chat IA
- Utilise des topics cohérents (ex: toujours `comment-apprendre` et pas parfois `apprentissage`)
- Plus tu es précis et personnel dans tes réponses, mieux l'IA te représentera
