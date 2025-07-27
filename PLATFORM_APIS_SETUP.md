# Configuration des APIs des Plateformes Sociales

Ce guide explique comment configurer les APIs pour récupérer automatiquement les métadonnées des clips depuis les différentes plateformes.

## 🔑 Variables d'Environnement Requises

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# YouTube API (Recommandé - Fonctionne parfaitement)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# TikTok API (Optionnel - API officielle limitée)
NEXT_PUBLIC_TIKTOK_API_KEY=your_tiktok_api_key_here

# Instagram API (Optionnel - API Basic Display)
NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here

# Twitter/X API (Optionnel - API v2)
NEXT_PUBLIC_TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
```

## 📺 YouTube API (Recommandé)

### 1. Obtenir une clé API YouTube
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API YouTube Data v3
4. Créez des identifiants (clé API)
5. Copiez la clé API dans votre `.env.local`

### 2. Configuration
```env
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyB... # Votre clé API YouTube
```

**Avantages :**
- ✅ Récupération complète des métadonnées (vues, likes, commentaires)
- ✅ Thumbnails haute qualité
- ✅ Titre et description exacts
- ✅ Hashtags extraits automatiquement
- ✅ API gratuite (quotas généreux)

## 🎵 TikTok API (Optionnel)

### Méthode 1: API Officielle TikTok

#### Étape 1: Créer un compte développeur TikTok
1. Allez sur [TikTok for Developers](https://developers.tiktok.com/)
2. Cliquez sur "Log in" et connectez-vous avec votre compte TikTok
3. Acceptez les termes et conditions

#### Étape 2: Créer une application
1. Dans le dashboard développeur, cliquez sur "Create App"
2. Remplissez les informations :
   - **App Name** : Nom de votre application (ex: "ClipWave")
   - **App Description** : Description de votre app
   - **Platform** : Sélectionnez "Web"
   - **Category** : Sélectionnez "Entertainment" ou "Social"
3. Cliquez sur "Create"

#### Étape 3: Configurer les permissions
1. Dans votre app, allez dans "Permissions"
2. Activez les permissions suivantes :
   - ✅ **Video Data** : Pour accéder aux métadonnées des vidéos
   - ✅ **User Data** : Pour les informations de base
3. Sauvegardez les modifications

#### Étape 4: Obtenir la clé API
1. Dans "App Details", copiez votre **Client Key**
2. Ajoutez-la dans votre `.env.local` :
```env
NEXT_PUBLIC_TIKTOK_API_KEY=your_tiktok_client_key_here
```

#### Étape 5: Configurer les URLs de redirection
1. Dans "Platform Settings" > "Web"
2. Ajoutez vos URLs de redirection :
   - `http://localhost:3000/auth/tiktok/callback` (développement)
   - `https://votre-domaine.com/auth/tiktok/callback` (production)

### Méthode 2: Scraping (Fallback)
Si vous n'avez pas de clé API TikTok, le système utilise automatiquement le scraping de base qui :
- ✅ Extrait les hashtags depuis la page
- ✅ Récupère le titre
- ❌ Les statistiques (vues, likes) ne sont pas disponibles sans API

## 📷 Instagram API (Optionnel)

### Méthode 1: Instagram Basic Display API

#### Étape 1: Créer une application Facebook
1. Allez sur [Facebook Developers](https://developers.facebook.com/)
2. Cliquez sur "My Apps" > "Create App"
3. Sélectionnez "Consumer" comme type d'app
4. Remplissez les informations :
   - **App Name** : Nom de votre application
   - **Contact Email** : Votre email
5. Cliquez sur "Create App"

#### Étape 2: Ajouter Instagram Basic Display
1. Dans votre app, cliquez sur "Add Product"
2. Recherchez et ajoutez "Instagram Basic Display"
3. Cliquez sur "Set Up"

#### Étape 3: Configurer Instagram Basic Display
1. Dans "Instagram Basic Display" > "Basic Display"
2. Cliquez sur "Create New App"
3. Remplissez les informations :
   - **App Name** : Même nom que votre app
   - **Valid OAuth Redirect URIs** : 
     - `http://localhost:3000/auth/instagram/callback`
     - `https://votre-domaine.com/auth/instagram/callback`
4. Cliquez sur "Save Changes"

#### Étape 4: Obtenir l'Access Token
1. Dans "Instagram Basic Display" > "Basic Display"
2. Cliquez sur "Generate Token"
3. Connectez-vous avec votre compte Instagram
4. Autorisez l'accès à votre compte
5. Copiez l'access token généré

#### Étape 5: Configuration
```env
NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
```

**Note :** L'access token Instagram expire après 60 jours. Vous devrez le régénérer périodiquement.

### Méthode 2: Scraping (Fallback)
Le scraping Instagram :
- ✅ Extrait les hashtags
- ✅ Récupère le titre
- ✅ Extrait l'image de prévisualisation (si disponible)
- ❌ Les statistiques ne sont pas disponibles sans API

## 🐦 Twitter/X API (Optionnel)

### Méthode 1: Twitter API v2

#### Étape 1: Créer un compte développeur Twitter
1. Allez sur [Twitter Developer Portal](https://developer.twitter.com/)
2. Cliquez sur "Sign up" et connectez-vous avec votre compte Twitter
3. Remplissez le formulaire de demande d'accès :
   - **Primary reason for using Twitter data** : Sélectionnez "Academic research" ou "Making a bot"
   - **Will you analyze Twitter data** : Répondez selon votre usage
   - **Will you share Twitter data with third parties** : "No"
4. Soumettez votre demande et attendez l'approbation (peut prendre quelques jours)

#### Étape 2: Créer une application
1. Une fois approuvé, allez dans "Developer Portal"
2. Cliquez sur "Create App"
3. Remplissez les informations :
   - **App name** : Nom de votre application
   - **Use case** : Description de votre usage
4. Cliquez sur "Create"

#### Étape 3: Configurer les permissions
1. Dans votre app, allez dans "Settings" > "User authentication settings"
2. Activez "OAuth 2.0"
3. Dans "App permissions", sélectionnez "Read"
4. Ajoutez vos URLs de callback :
   - `http://localhost:3000/auth/twitter/callback`
   - `https://votre-domaine.com/auth/twitter/callback`
5. Cliquez sur "Save"

#### Étape 4: Obtenir le Bearer Token
1. Dans "Keys and tokens"
2. Sous "Authentication Tokens", cliquez sur "Generate" pour "Bearer Token"
3. Copiez le Bearer Token généré

#### Étape 5: Configuration
```env
NEXT_PUBLIC_TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
```

**Note :** Le Bearer Token ne expire pas, mais gardez-le secret.

### Méthode 2: Scraping (Fallback)
Le scraping Twitter :
- ✅ Extrait les hashtags
- ✅ Récupère le texte du tweet
- ✅ Extrait l'auteur
- ❌ Les statistiques ne sont pas disponibles sans API

## 🚀 Fonctionnement du Système

### Priorité des Méthodes
1. **API Officielle** (si configurée) - Données complètes et précises
2. **Scraping Avancé** - Tentative de récupération via les APIs publiques
3. **Scraping de Base** - Extraction des métadonnées depuis le HTML
4. **Fallback** - Données minimales avec placeholder

### Exemple de Configuration Minimale
```env
# Configuration minimale recommandée
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```

Avec seulement YouTube configuré, vous aurez :
- ✅ YouTube : Données complètes
- ⚠️ TikTok/Instagram/Twitter : Données de base (titre, hashtags, pas de statistiques)

## 🔧 Test de Configuration

Pour tester si vos APIs fonctionnent :

1. **YouTube** : Collez une URL YouTube dans le formulaire de soumission
2. **TikTok** : Testez avec une URL TikTok (statistiques si API configurée)
3. **Instagram** : Testez avec une URL Instagram (statistiques si API configurée)
4. **Twitter** : Testez avec une URL Twitter (statistiques si API configurée)

## 📊 Métadonnées Récupérées

| Plateforme | API Configurée | Sans API |
|------------|----------------|----------|
| **YouTube** | ✅ Vues, Likes, Commentaires, Thumbnail, Titre, Auteur, Hashtags | ✅ Titre, Hashtags |
| **TikTok** | ✅ Vues, Likes, Commentaires, Thumbnail, Titre, Auteur, Hashtags | ✅ Titre, Hashtags |
| **Instagram** | ✅ Vues, Likes, Commentaires, Thumbnail, Titre, Auteur, Hashtags | ✅ Titre, Hashtags, Image |
| **Twitter** | ✅ Vues, Likes, Commentaires, Titre, Auteur, Hashtags | ✅ Titre, Auteur, Hashtags |

## 🛠️ Dépannage

### Erreur "API key not configured"
- Vérifiez que la variable d'environnement est correctement définie
- Redémarrez votre serveur de développement

### Erreur "Failed to fetch data"
- Vérifiez votre connexion internet
- Les APIs peuvent être temporairement indisponibles
- Le système utilisera automatiquement le fallback

### Erreur "Access denied" ou "Unauthorized"
- Vérifiez que votre clé API est correcte
- Assurez-vous que votre app a les bonnes permissions
- Pour Instagram, vérifiez que l'access token n'a pas expiré

### Données manquantes
- Certaines plateformes limitent l'accès aux données
- Le scraping de base récupère ce qui est disponible publiquement

### TikTok API ne fonctionne pas
- L'API TikTok officielle est très restrictive
- Utilisez le scraping de fallback qui fonctionne mieux
- Les statistiques peuvent ne pas être disponibles

### Instagram Access Token expiré
- Régénérez l'access token tous les 60 jours
- Suivez les étapes 4-5 de la section Instagram

### Twitter API limitée
- L'API Twitter v2 a des limites de taux strictes
- Surveillez votre utilisation dans le Developer Portal
- Utilisez le scraping de fallback si nécessaire

## 💡 Recommandations

1. **Commencez avec YouTube** - API gratuite et fiable
2. **Ajoutez les autres APIs progressivement** selon vos besoins
3. **Testez avec différentes URLs** pour vérifier le fonctionnement
4. **Surveillez les quotas** des APIs (surtout YouTube et Twitter)
5. **Gardez vos clés API secrètes** et ne les partagez jamais
6. **Utilisez des variables d'environnement** pour la sécurité

## 🔒 Sécurité

- **Ne committez jamais** vos clés API dans Git
- **Utilisez toujours** des variables d'environnement
- **Limitez les permissions** de vos apps au minimum nécessaire
- **Surveillez l'utilisation** de vos APIs régulièrement
- **Régénérez les tokens** expirés (Instagram)

Le système fonctionne même sans configuration d'API, mais avec des données limitées pour certaines plateformes. 