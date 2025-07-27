import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Extraction de l'ID post Instagram
    const postIdMatch = url.match(/\/(p|reel)\/([^\/\?]+)/);
    if (!postIdMatch) {
      return NextResponse.json({ error: 'Invalid Instagram URL' }, { status: 400 });
    }

    const postId = postIdMatch[2];

    // Tentative de récupération via l'API publique Instagram
    try {
      const response = await fetch(`https://www.instagram.com/api/v1/media/${postId}/info/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.instagram.com/',
          'X-IG-App-ID': '936619743392459', // Instagram Web App ID
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.items && data.items[0]) {
          const item = data.items[0];
          const user = item.user;
          
          return NextResponse.json({
            viewCount: item.video_view_count || 0,
            likeCount: item.like_count || 0,
            commentCount: item.comment_count || 0,
            hashtags: extractHashtags(item.caption?.text || ''),
            thumbnail: item.image_versions2?.candidates?.[0]?.url || item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url,
            title: item.caption?.text || 'Instagram Post',
            author: user?.username || 'Unknown',
            publishedAt: new Date(item.taken_at * 1000).toISOString(),
          });
        }
      }
    } catch (error) {
      console.log('Instagram API failed, trying alternative method');
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
        const title = titleMatch ? titleMatch[1].replace(' on Instagram', '') : 'Instagram Post';
        
        // Extraction des hashtags
        const hashtagMatches = html.match(/#[\w\u0590-\u05ff]+/g) || [];
        const hashtags = Array.from(new Set(hashtagMatches)).slice(0, 10);
        
        // Tentative d'extraction de l'image
        const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
        const thumbnail = imageMatch ? imageMatch[1] : undefined;
        
        return NextResponse.json({
          viewCount: 0, // Impossible à extraire sans API
          likeCount: 0,
          commentCount: 0,
          hashtags,
          thumbnail: thumbnail || `https://via.placeholder.com/400x225/E4405F/ffffff?text=Instagram+Post`,
          title,
          author: 'Unknown',
          publishedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error scraping Instagram:', error);
    }

    // Fallback avec des données minimales
    return NextResponse.json({
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      hashtags: [],
      thumbnail: `https://via.placeholder.com/400x225/E4405F/ffffff?text=Instagram+Post`,
      title: 'Instagram Post',
      author: 'Unknown',
      publishedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in Instagram scraping route:', error);
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 });
  }
}

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  return text.match(hashtagRegex) || [];
} 