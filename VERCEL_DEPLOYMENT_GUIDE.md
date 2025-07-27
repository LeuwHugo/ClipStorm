# Guide de Déploiement sur Vercel

Ce guide vous accompagne étape par étape pour déployer votre application ClipWave sur Vercel en mode développement.

## 🚀 Prérequis

- ✅ Compte GitHub avec votre code source
- ✅ Compte Vercel (gratuit)
- ✅ Application Next.js prête pour le déploiement
- ✅ Variables d'environnement configurées

## 📋 Étape 1: Préparation du Code

### 1.1 Vérifier la structure du projet
Assurez-vous que votre projet contient :
```
ClipWave/
├── app/
├── components/
├── lib/
├── supabase/
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### 1.2 Vérifier le package.json
Votre `package.json` doit contenir les scripts suivants :
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 1.3 Commiter et pousser sur GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## 🔧 Étape 2: Configuration Vercel

### 2.1 Créer un compte Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "Sign Up"
3. Connectez-vous avec votre compte GitHub

### 2.2 Importer votre projet
1. Dans le dashboard Vercel, cliquez sur "New Project"
2. Sélectionnez votre repository GitHub
3. Cliquez sur "Import"

### 2.3 Configuration du projet
Vercel détectera automatiquement que c'est un projet Next.js. Vérifiez :
- **Framework Preset** : Next.js
- **Root Directory** : `./` (laissez vide si le projet est à la racine)
- **Build Command** : `npm run build` (par défaut)
- **Output Directory** : `.next` (par défaut)
- **Install Command** : `npm install` (par défaut)

## 🔑 Étape 3: Configuration des Variables d'Environnement

### 3.1 Variables Supabase
Dans Vercel, allez dans "Settings" > "Environment Variables" et ajoutez :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration (si utilisé)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# APIs des Plateformes Sociales (optionnel)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_TIKTOK_API_KEY=your_tiktok_api_key
NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
NEXT_PUBLIC_TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Autres variables
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

### 3.2 Configuration des environnements
Pour chaque variable, configurez :
- ✅ **Production** : Pour le déploiement en production
- ✅ **Preview** : Pour les déploiements de preview
- ✅ **Development** : Pour le développement local

## 🏗️ Étape 4: Configuration Avancée

### 4.1 Fichier vercel.json (optionnel)
Créez un fichier `vercel.json` à la racine si vous avez des besoins spécifiques :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 4.2 Configuration des redirections (si nécessaire)
Si vous avez des redirections personnalisées, ajoutez dans `vercel.json` :

```json
{
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

## 🚀 Étape 5: Déploiement

### 5.1 Premier déploiement
1. Cliquez sur "Deploy" dans Vercel
2. Attendez que le build se termine (2-5 minutes)
3. Vérifiez que le déploiement est réussi

### 5.2 Vérification du déploiement
1. Cliquez sur l'URL générée (ex: `https://clipwave-abc123.vercel.app`)
2. Testez les fonctionnalités principales :
   - ✅ Page d'accueil
   - ✅ Authentification
   - ✅ Création de campagnes
   - ✅ Soumission de clips
   - ✅ APIs

## 🔄 Étape 6: Déploiements Automatiques

### 6.1 Configuration Git
Vercel se connecte automatiquement à votre GitHub. Chaque push sur `main` déclenchera un nouveau déploiement.

### 6.2 Branches de développement
- **main** : Déploiement en production
- **develop** : Déploiement de preview (optionnel)
- **feature/*** : Déploiement de preview automatique

### 6.3 Configuration des branches
Dans Vercel > Settings > Git :
- Activez "Include source files outside of the Root Directory"
- Configurez les branches de preview si nécessaire

## 🛠️ Étape 7: Configuration Supabase

### 7.1 Mise à jour des URLs de redirection
Dans votre dashboard Supabase > Authentication > URL Configuration :

```
Site URL: https://your-domain.vercel.app
Redirect URLs: 
- https://your-domain.vercel.app/auth/callback
- https://your-domain.vercel.app/dashboard
- http://localhost:3000/auth/callback (pour le développement local)
```

### 7.2 Configuration des politiques RLS
Vérifiez que vos politiques Row Level Security fonctionnent en production.

## 📊 Étape 8: Monitoring et Analytics

### 8.1 Vercel Analytics (optionnel)
1. Dans Vercel > Settings > Analytics
2. Activez "Vercel Analytics"
3. Ajoutez le script dans votre `layout.tsx`

### 8.2 Monitoring des erreurs
1. Configurez un service comme Sentry ou LogRocket
2. Ajoutez les variables d'environnement correspondantes

## 🔍 Étape 9: Tests Post-Déploiement

### 9.1 Tests fonctionnels
- [ ] Authentification Supabase
- [ ] Création de campagnes
- [ ] Upload d'images
- [ ] Soumission de clips
- [ ] Récupération des métadonnées
- [ ] Paiements Stripe (si configuré)

### 9.2 Tests de performance
- [ ] Temps de chargement des pages
- [ ] Performance des images
- [ ] Responsive design
- [ ] SEO (meta tags)

## 🚨 Étape 10: Dépannage

### 10.1 Erreurs courantes

#### Build failed
```bash
# Vérifiez les logs dans Vercel
# Problèmes courants :
- Variables d'environnement manquantes
- Erreurs TypeScript
- Dépendances manquantes
```

#### Erreurs de runtime
```bash
# Vérifiez les logs de fonction
# Problèmes courants :
- APIs non configurées
- Erreurs Supabase
- Problèmes de CORS
```

### 10.2 Commandes utiles
```bash
# Déploiement local pour test
vercel

# Déploiement en production
vercel --prod

# Voir les logs
vercel logs

# Rollback vers une version précédente
# Dans Vercel Dashboard > Deployments > Select version > Promote
```

## 🔒 Étape 11: Sécurité

### 11.1 Variables d'environnement
- ✅ Ne jamais commiter les clés secrètes
- ✅ Utiliser des variables d'environnement Vercel
- ✅ Limiter l'accès aux clés API

### 11.2 Domaines personnalisés (optionnel)
1. Dans Vercel > Settings > Domains
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions

## 📈 Étape 12: Optimisation

### 12.1 Performance
- [ ] Optimisation des images (next/image)
- [ ] Lazy loading des composants
- [ ] Code splitting automatique
- [ ] Cache des API routes

### 12.2 SEO
- [ ] Meta tags dynamiques
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Open Graph tags

## 🎉 Félicitations !

Votre application ClipWave est maintenant déployée sur Vercel ! 

### Prochaines étapes :
1. **Testez toutes les fonctionnalités** en production
2. **Configurez un domaine personnalisé** si nécessaire
3. **Mettez en place le monitoring** des erreurs
4. **Optimisez les performances** selon les métriques Vercel

### Liens utiles :
- [Documentation Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

---

**Note :** Ce guide couvre le déploiement en développement. Pour la production, considérez également la mise en place de tests automatisés, de CI/CD, et de monitoring avancé. 