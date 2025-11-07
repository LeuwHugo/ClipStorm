// Utilitaires pour la validation TikTok (MVP basique)

export interface TikTokValidationResult {
  isValid: boolean;
  videoId: string | null;
  hasTrackingCode: boolean;
  trackingCode: string | null;
}

/**
 * Extrait l'ID TikTok d'une URL
 */
export function extractTikTokId(url: string): string | null {
  const patterns = [
    /tiktok\.com\/@[^\/]+\/video\/(\d+)/,
    /tiktok\.com\/video\/(\d+)/,
    /vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
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
 * Valide une URL TikTok basique
 */
export function isValidTikTokUrl(url: string): boolean {
  return extractTikTokId(url) !== null;
}

/**
 * Vérifie si une description contient un code de tracking
 */
export function hasTrackingCode(description: string, trackingCode: string): boolean {
  if (!description || !trackingCode) return false;
  
  // Recherche insensible à la casse
  const normalizedDescription = description.toLowerCase();
  const normalizedCode = trackingCode.toLowerCase();
  
  return normalizedDescription.includes(normalizedCode);
}

/**
 * Valide une soumission TikTok (MVP basique)
 */
export function validateTikTokSubmission(
  url: string, 
  description: string, 
  expectedTrackingCode: string
): TikTokValidationResult {
  const videoId = extractTikTokId(url);
  const isValid = videoId !== null;
  const hasCode = hasTrackingCode(description, expectedTrackingCode);
  
  return {
    isValid,
    videoId,
    hasTrackingCode: hasCode,
    trackingCode: hasCode ? expectedTrackingCode : null,
  };
}

/**
 * Simule la récupération des métadonnées TikTok (pour MVP)
 * En production, utilisez l'API TikTok Research
 */
export async function getTikTokMetadata(url: string): Promise<{
  title: string;
  description: string;
  viewCount: number;
  isValid: boolean;
}> {
  try {
    // Pour le MVP, on simule une récupération
    // En production, utilisez l'API TikTok Research
    const videoId = extractTikTokId(url);
    
    if (!videoId) {
      throw new Error('URL TikTok invalide');
    }

    // Simulation de données
    return {
      title: `TikTok Video ${videoId}`,
      description: `Description du clip TikTok ${videoId}`,
      viewCount: Math.floor(Math.random() * 10000) + 100, // Simulation
      isValid: true,
    };
  } catch (error) {
    return {
      title: '',
      description: '',
      viewCount: 0,
      isValid: false,
    };
  }
}

/**
 * Calcule le paiement basé sur les vues et le CPMV
 */
export function calculatePayment(viewCount: number, cpmvRate: number): number {
  // CPMV = Coût par Mille Vues
  // Paiement = (Vues / 1000) * CPMV
  return (viewCount / 1000) * cpmvRate;
}

/**
 * Formate un nombre de vues pour l'affichage
 */
export function formatViewCount(viewCount: number): string {
  if (viewCount >= 1000000) {
    return `${(viewCount / 1000000).toFixed(1)}M`;
  } else if (viewCount >= 1000) {
    return `${(viewCount / 1000).toFixed(1)}K`;
  }
  return viewCount.toString();
} 