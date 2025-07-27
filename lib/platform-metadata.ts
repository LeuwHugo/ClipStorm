export interface PlatformMetadata {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter';
  viewCount: number;
  likeCount: number;
  commentCount: number;
  hashtags: string[];
  thumbnail?: string;
  title?: string;
  author?: string;
  publishedAt?: string;
}

export interface PlatformUrlInfo {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter';
  isValid: boolean;
  videoId?: string;
}

// Fonction pour détecter la plateforme à partir de l'URL
export function detectPlatform(url: string): PlatformUrlInfo {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('tiktok.com') || urlLower.includes('vm.tiktok.com')) {
    const videoId = extractTikTokVideoId(url);
    return {
      platform: 'tiktok',
      isValid: !!videoId,
      videoId: videoId || undefined
    };
  }
  
  if (urlLower.includes('instagram.com') || urlLower.includes('instagr.am')) {
    const videoId = extractInstagramVideoId(url);
    return {
      platform: 'instagram',
      isValid: !!videoId,
      videoId: videoId || undefined
    };
  }
  
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    const videoId = extractYouTubeVideoId(url);
    return {
      platform: 'youtube',
      isValid: !!videoId,
      videoId: videoId || undefined
    };
  }
  
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    const videoId = extractTwitterVideoId(url);
    return {
      platform: 'twitter',
      isValid: !!videoId,
      videoId: videoId || undefined
    };
  }
  
  return {
    platform: 'tiktok',
    isValid: false
  };
}

// Extraction des IDs vidéo pour chaque plateforme
function extractTikTokVideoId(url: string): string | null {
  const patterns = [
    /tiktok\.com\/@[^\/]+\/video\/(\d+)/,
    /vm\.tiktok\.com\/[^\/]+\/\?video_id=(\d+)/,
    /tiktok\.com\/v\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractInstagramVideoId(url: string): string | null {
  const patterns = [
    /instagram\.com\/p\/([^\/\?]+)/,
    /instagram\.com\/reel\/([^\/\?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractTwitterVideoId(url: string): string | null {
  const patterns = [
    /twitter\.com\/[^\/]+\/status\/(\d+)/,
    /x\.com\/[^\/]+\/status\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fonction pour récupérer les métadonnées depuis les APIs
export async function fetchPlatformMetadata(url: string): Promise<PlatformMetadata | null> {
  try {
    const urlInfo = detectPlatform(url);
    
    if (!urlInfo.isValid || !urlInfo.videoId) {
      throw new Error('Invalid platform URL');
    }

    switch (urlInfo.platform) {
      case 'youtube':
        return await fetchYouTubeMetadata(urlInfo.videoId);
      case 'tiktok':
        return await fetchTikTokMetadata(urlInfo.videoId, url);
      case 'instagram':
        return await fetchInstagramMetadata(urlInfo.videoId, url);
      case 'twitter':
        return await fetchTwitterMetadata(urlInfo.videoId, url);
      default:
        throw new Error('Unsupported platform');
    }
    
  } catch (error) {
    console.error('Error fetching platform metadata:', error);
    return null;
  }
}

// Récupération des métadonnées YouTube via l'API officielle
async function fetchYouTubeMetadata(videoId: string): Promise<PlatformMetadata> {
  // Note: Vous devrez ajouter votre clé API YouTube dans les variables d'environnement
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch YouTube data');
  }

  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }

  const video = data.items[0];
  const snippet = video.snippet;
  const stats = video.statistics;

  // Extraction des hashtags du titre et de la description
  const hashtags = extractHashtags(snippet.title + ' ' + snippet.description);

  return {
    platform: 'youtube',
    viewCount: parseInt(stats.viewCount) || 0,
    likeCount: parseInt(stats.likeCount) || 0,
    commentCount: parseInt(stats.commentCount) || 0,
    hashtags,
    thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url,
    title: snippet.title,
    author: snippet.channelTitle,
    publishedAt: snippet.publishedAt
  };
}

// Récupération des métadonnées TikTok via scraping (alternative à l'API officielle)
async function fetchTikTokMetadata(videoId: string, url: string): Promise<PlatformMetadata> {
  try {
    // Méthode 1: Tentative via l'API TikTok (si disponible)
    const apiKey = process.env.NEXT_PUBLIC_TIKTOK_API_KEY;
    
    if (apiKey) {
      const response = await fetch(`https://api.tiktok.com/video/info/?video_id=${videoId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          platform: 'tiktok',
          viewCount: data.stats?.play_count || 0,
          likeCount: data.stats?.digg_count || 0,
          commentCount: data.stats?.comment_count || 0,
          hashtags: data.challenges?.map((c: any) => `#${c.title}`) || [],
          thumbnail: data.video?.cover || data.video?.dynamic_cover,
          title: data.desc,
          author: data.author?.unique_id,
          publishedAt: data.create_time
        };
      }
    }

    // Méthode 2: Scraping de base (fallback)
    const response = await fetch(`/api/scrape-tiktok?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch TikTok data');
    }

    const data = await response.json();
    
    return {
      platform: 'tiktok',
      viewCount: data.viewCount || 0,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      hashtags: data.hashtags || [],
      thumbnail: data.thumbnail,
      title: data.title,
      author: data.author,
      publishedAt: data.publishedAt
    };

  } catch (error) {
    console.error('Error fetching TikTok metadata:', error);
    // Fallback avec des données de base
    return {
      platform: 'tiktok',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      hashtags: [],
      thumbnail: `https://via.placeholder.com/400x225/000000/ffffff?text=TikTok+Video`,
      title: 'TikTok Video',
      author: 'Unknown',
      publishedAt: new Date().toISOString()
    };
  }
}

// Récupération des métadonnées Instagram
async function fetchInstagramMetadata(postId: string, url: string): Promise<PlatformMetadata> {
  try {
    // Méthode 1: API Instagram Basic Display (si configurée)
    const accessToken = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
    
    if (accessToken) {
      const response = await fetch(`https://graph.instagram.com/${postId}?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count&access_token=${accessToken}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          platform: 'instagram',
          viewCount: data.video_views || 0,
          likeCount: data.like_count || 0,
          commentCount: data.comments_count || 0,
          hashtags: extractHashtags(data.caption || ''),
          thumbnail: data.media_url || data.thumbnail_url,
          title: data.caption,
          author: 'Instagram User',
          publishedAt: data.timestamp
        };
      }
    }

    // Méthode 2: Scraping (fallback)
    const response = await fetch(`/api/scrape-instagram?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Instagram data');
    }

    const data = await response.json();
    
    return {
      platform: 'instagram',
      viewCount: data.viewCount || 0,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      hashtags: data.hashtags || [],
      thumbnail: data.thumbnail,
      title: data.title,
      author: data.author,
      publishedAt: data.publishedAt
    };

  } catch (error) {
    console.error('Error fetching Instagram metadata:', error);
    return {
      platform: 'instagram',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      hashtags: [],
      thumbnail: `https://via.placeholder.com/400x225/E4405F/ffffff?text=Instagram+Post`,
      title: 'Instagram Post',
      author: 'Unknown',
      publishedAt: new Date().toISOString()
    };
  }
}

// Récupération des métadonnées Twitter/X
async function fetchTwitterMetadata(tweetId: string, url: string): Promise<PlatformMetadata> {
  try {
    // Méthode 1: API Twitter v2 (si configurée)
    const bearerToken = process.env.NEXT_PUBLIC_TWITTER_BEARER_TOKEN;
    
    if (bearerToken) {
      const response = await fetch(`https://api.twitter.com/2/tweets/${tweetId}?expansions=author_id&user.fields=username&tweet.fields=created_at,public_metrics`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const tweet = data.data;
        const user = data.includes?.users?.[0];
        
        return {
          platform: 'twitter',
          viewCount: tweet.public_metrics?.impression_count || 0,
          likeCount: tweet.public_metrics?.like_count || 0,
          commentCount: tweet.public_metrics?.reply_count || 0,
          hashtags: extractHashtags(tweet.text),
          thumbnail: undefined, // Twitter n'a pas de thumbnails par défaut
          title: tweet.text,
          author: user?.username,
          publishedAt: tweet.created_at
        };
      }
    }

    // Méthode 2: Scraping (fallback)
    const response = await fetch(`/api/scrape-twitter?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Twitter data');
    }

    const data = await response.json();
    
    return {
      platform: 'twitter',
      viewCount: data.viewCount || 0,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      hashtags: data.hashtags || [],
      thumbnail: data.thumbnail,
      title: data.title,
      author: data.author,
      publishedAt: data.publishedAt
    };

  } catch (error) {
    console.error('Error fetching Twitter metadata:', error);
    return {
      platform: 'twitter',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      hashtags: [],
      thumbnail: `https://via.placeholder.com/400x225/1DA1F2/ffffff?text=Twitter+Post`,
      title: 'Twitter Post',
      author: 'Unknown',
      publishedAt: new Date().toISOString()
    };
  }
}

// Fonction pour valider une URL de plateforme
export function validatePlatformUrl(url: string): boolean {
  const urlInfo = detectPlatform(url);
  return urlInfo.isValid;
}

// Fonction pour obtenir les hashtags d'un texte
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  return text.match(hashtagRegex) || [];
}

// Fonction pour formater les nombres (1K, 1M, etc.)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
} 