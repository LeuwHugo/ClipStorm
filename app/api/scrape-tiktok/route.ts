import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Extraction de l'ID vidéo TikTok
    const videoIdMatch = url.match(/\/video\/(\d+)/);
    if (!videoIdMatch) {
      return NextResponse.json({ error: 'Invalid TikTok URL' }, { status: 400 });
    }

    const videoId = videoIdMatch[1];

    // Tentative de récupération des métadonnées via l'API publique TikTok
    try {
      const response = await fetch(`https://www.tiktok.com/api/item/detail/?itemId=${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.tiktok.com/',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.itemInfo && data.itemInfo.itemStruct) {
          const item = data.itemInfo.itemStruct;
          const stats = item.stats;
          const author = item.author;
          
          return NextResponse.json({
            viewCount: stats.playCount || 0,
            likeCount: stats.diggCount || 0,
            commentCount: stats.commentCount || 0,
            hashtags: item.challenges?.map((challenge: any) => `#${challenge.title}`) || [],
            thumbnail: item.video.cover || item.video.dynamicCover,
            title: item.desc || 'TikTok Video',
            author: author?.uniqueId || 'Unknown',
            publishedAt: new Date(item.createTime * 1000).toISOString(),
          });
        }
      }
    } catch (error) {
      console.log('TikTok API failed, trying alternative method');
    }

    // Méthode alternative : scraping de base
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (response.ok) {
        const html = await response.text();
        
        // Extraction des métadonnées depuis le HTML
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(' | TikTok', '') : 'TikTok Video';
        
        // Extraction des hashtags
        const hashtagMatches = html.match(/#[\w\u0590-\u05ff]+/g) || [];
        const hashtags = Array.from(new Set(hashtagMatches)).slice(0, 10); // Limiter à 10 hashtags uniques
        
        // Données de base (sans vraies statistiques)
        return NextResponse.json({
          viewCount: 0, // Impossible à extraire sans API
          likeCount: 0,
          commentCount: 0,
          hashtags,
          thumbnail: `https://via.placeholder.com/400x225/000000/ffffff?text=TikTok+Video`,
          title,
          author: 'Unknown',
          publishedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error scraping TikTok:', error);
    }

    // Fallback avec des données minimales
    return NextResponse.json({
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      hashtags: [],
      thumbnail: `https://via.placeholder.com/400x225/000000/ffffff?text=TikTok+Video`,
      title: 'TikTok Video',
      author: 'Unknown',
      publishedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in TikTok scraping route:', error);
    return NextResponse.json({ error: 'Failed to fetch TikTok data' }, { status: 500 });
  }
} 