// Utilitaires pour la validation YouTube
export interface YouTubeVideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  viewCount: number;
  isValid: boolean;
}

/**
 * Extrait l'ID YouTube d'une URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Valide une URL YouTube
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

/**
 * Génère une URL de miniature YouTube
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' = 'medium'): string {
  const qualities = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualities[quality]}.jpg`;
}

/**
 * Valide une vidéo YouTube via l'API (simulation pour MVP)
 * En production, utilisez l'API YouTube Data v3
 */
export async function validateYouTubeVideo(videoId: string): Promise<YouTubeVideoInfo> {
  try {
    // Pour le MVP, on simule une validation
    // En production, utilisez l'API YouTube Data v3 avec une clé API
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    
    if (!response.ok) {
      throw new Error('Vidéo non trouvée');
    }

    const data = await response.json();
    
    return {
      id: videoId,
      title: data.title,
      thumbnail: getYouTubeThumbnail(videoId, 'high'),
      duration: '00:00:00', // L'API oembed ne fournit pas la durée
      viewCount: 0, // L'API oembed ne fournit pas le nombre de vues
      isValid: true,
    };
  } catch (error) {
    return {
      id: videoId,
      title: '',
      thumbnail: '',
      duration: '',
      viewCount: 0,
      isValid: false,
    };
  }
}

/**
 * Fonction simplifiée pour le MVP - validation basique
 */
export function validateYouTubeUrlBasic(url: string): { isValid: boolean; videoId: string | null } {
  const videoId = extractYouTubeId(url);
  
  if (!videoId) {
    return { isValid: false, videoId: null };
  }

  // Validation basique : vérifier que l'ID a la bonne longueur et format
  const isValidFormat = /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  
  return {
    isValid: isValidFormat,
    videoId: isValidFormat ? videoId : null,
  };
} 