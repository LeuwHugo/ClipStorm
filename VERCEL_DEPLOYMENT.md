# 🚀 Guide de Déploiement Vercel - ClipStorm

Ce guide vous accompagne pour déployer ClipStorm sur Vercel afin de tester l'API TikTok.

## 📋 Prérequis

- Compte GitHub avec le repository ClipStorm
- Compte Vercel (gratuit disponible sur [vercel.com](https://vercel.com))
- Compte Supabase configuré
- Compte Stripe (optionnel pour les tests de paiement)

## 🔧 Étape 1 : Préparation du Projet

### 1.1 Vérification de la Configuration

Le projet est déjà configuré avec :
- ✅ Next.js 13.5.1
- ✅ TypeScript
- ✅ Configuration pour Vercel
- ✅ Blocage de connexion/déconnexion en production

### 1.2 Variables d'Environnement Requises

Vous devrez configurer ces variables dans Vercel :

#### Variables Supabase (Obligatoires)
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key (pour les webhooks)
```

#### Variables Stripe (Optionnelles pour tests)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🚀 Étape 2 : Déploiement sur Vercel

### Option A : Déploiement via l'Interface Vercel (Recommandé)

1. **Connecter votre Repository**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Add New Project"
   - Importez votre repository GitHub ClipStorm
   - Vercel détectera automatiquement Next.js

2. **Configurer les Variables d'Environnement**
   - Dans la section "Environment Variables"
   - Ajoutez toutes les variables listées ci-dessus
   - ⚠️ **Important** : Assurez-vous que `NODE_ENV` est défini sur `production` (Vercel le fait automatiquement)

3. **Configurer le Build**
   - Framework Preset : Next.js (détecté automatiquement)
   - Build Command : `npm run build` (par défaut)
   - Output Directory : `.next` (par défaut)
   - Install Command : `npm install` (par défaut)

4. **Déployer**
   - Cliquez sur "Deploy"
   - Attendez la fin du build (2-5 minutes)
   - Votre site sera disponible à l'URL : `https://votre-projet.vercel.app`

### Option B : Déploiement via CLI Vercel

1. **Installer Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Se connecter à Vercel**
   ```bash
   vercel login
   ```

3. **Déployer en production**
   ```bash
   vercel --prod
   ```

4. **Configurer les variables d'environnement**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
   # ... ajoutez toutes les autres variables
   ```

## 🔒 Étape 3 : Configuration de la Sécurité

### 3.1 Blocage de Connexion/Déconnexion

✅ **Déjà configuré** : Les fonctions de connexion et déconnexion sont automatiquement bloquées en production.

Les pages `/login` et `/signup` afficheront un message d'accès restreint.

### 3.2 Configuration Supabase pour Production

1. **Ajouter l'URL Vercel dans Supabase**
   - Allez dans Supabase Dashboard → Authentication → URL Configuration
   - Ajoutez votre URL Vercel dans "Site URL" : `https://votre-projet.vercel.app`
   - Ajoutez dans "Redirect URLs" : `https://votre-projet.vercel.app/auth/callback`

2. **Vérifier les RLS Policies**
   - Assurez-vous que les Row Level Security policies sont correctement configurées
   - Testez l'accès aux données depuis l'application déployée

## 🧪 Étape 4 : Tester l'API TikTok

### 4.1 Accès aux Pages Publiques

Une fois déployé, vous pouvez tester l'API TikTok en accédant à :
- `https://votre-projet.vercel.app/api/scrape-tiktok?url=https://www.tiktok.com/@username/video/1234567890`

### 4.2 Test de l'Endpoint TikTok

```bash
# Exemple de test
curl "https://votre-projet.vercel.app/api/scrape-tiktok?url=https://www.tiktok.com/@username/video/1234567890"
```

### 4.3 Pages Accessibles en Production

✅ **Accessibles** :
- Page d'accueil (`/`)
- Terms of Service (`/terms`)
- Privacy Policy (`/privacy`)
- API endpoints (`/api/scrape-tiktok`, etc.)

❌ **Bloquées** :
- Login (`/login`) - Affiche "Accès restreint"
- Signup (`/signup`) - Affiche "Accès restreint"
- Déconnexion - Désactivée dans la navbar

## 🔍 Étape 5 : Vérification Post-Déploiement

### Checklist de Vérification

- [ ] Le site se charge correctement
- [ ] Les pages publiques (Terms, Privacy) sont accessibles
- [ ] Les pages login/signup affichent le message de blocage
- [ ] L'API TikTok répond correctement
- [ ] Les variables d'environnement sont correctement configurées
- [ ] Les images se chargent correctement (vérifier les domaines dans `next.config.js`)

### Vérification des Logs

1. **Dans Vercel Dashboard**
   - Allez dans votre projet → "Deployments"
   - Cliquez sur le dernier déploiement
   - Consultez les logs de build et runtime

2. **Vérifier les Erreurs**
   - Si des erreurs apparaissent, vérifiez :
     - Les variables d'environnement
     - La configuration Supabase
     - Les domaines d'images dans `next.config.js`

## 🛠️ Étape 6 : Configuration Avancée (Optionnel)

### 6.1 Domaines Personnalisés

1. Dans Vercel Dashboard → Settings → Domains
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions DNS

### 6.2 Webhooks Stripe

Si vous testez les paiements :

1. **Configurer le Webhook dans Stripe**
   - Allez dans Stripe Dashboard → Developers → Webhooks
   - Ajoutez l'endpoint : `https://votre-projet.vercel.app/api/payments/webhook`
   - Sélectionnez les événements à écouter
   - Copiez le "Signing secret"

2. **Ajouter dans Vercel**
   - Ajoutez `STRIPE_WEBHOOK_SECRET` dans les variables d'environnement

### 6.3 Analytics Vercel

- Activez Vercel Analytics dans le dashboard pour suivre les performances

## 📝 Notes Importantes

### ⚠️ Mode Production

- En production (`NODE_ENV=production`), les fonctions d'authentification sont automatiquement désactivées
- Cela permet de tester l'API TikTok sans risque de connexions non autorisées

### 🔄 Redéploiement

Après chaque modification :
- Push sur GitHub déclenche un redéploiement automatique
- Ou utilisez `vercel --prod` pour redéployer manuellement

### 🐛 Debugging

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Vercel Dashboard
2. Vérifiez les variables d'environnement
3. Testez localement avec `npm run build && npm start`

## 🎯 Résumé des Commandes

```bash
# Déploiement initial
vercel --prod

# Voir les logs
vercel logs

# Lister les variables d'environnement
vercel env ls

# Ajouter une variable
vercel env add VARIABLE_NAME

# Redéployer
vercel --prod
```

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs Vercel
2. Vérifiez la documentation Vercel : https://vercel.com/docs
3. Vérifiez la configuration Next.js : https://nextjs.org/docs

---

**Bon déploiement ! 🚀**

