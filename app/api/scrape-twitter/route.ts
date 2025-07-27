import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Extraction de l'ID tweet Twitter/X
    const tweetIdMatch = url.match(/\/status\/(\d+)/);
    if (!tweetIdMatch) {
      return NextResponse.json({ error: 'Invalid Twitter/X URL' }, { status: 400 });
    }

    const tweetId = tweetIdMatch[1];

    // Tentative de récupération via l'API publique Twitter/X
    try {
      const response = await fetch(`https://cdn.syndication.twimg.com/widgets/timeline?tweet_id=${tweetId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://twitter.com/',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          const tweet = data[0];
          
          return NextResponse.json({
            viewCount: tweet.impression_count || 0,
            likeCount: tweet.like_count || 0,
            commentCount: tweet.reply_count || 0,
            hashtags: extractHashtags(tweet.text || ''),
            thumbnail: undefined, // Twitter n'a pas de thumbnails par défaut
            title: tweet.text || 'Twitter Post',
            author: tweet.user?.screen_name || 'Unknown',
            publishedAt: tweet.created_at || new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.log('Twitter API failed, trying alternative method');
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
        const title = titleMatch ? titleMatch[1].replace(' / X', '').replace(' on X', '') : 'Twitter Post';
        
        // Extraction des hashtags
        const hashtagMatches = html.match(/#[\w\u0590-\u05ff]+/g) || [];
        const hashtags = Array.from(new Set(hashtagMatches)).slice(0, 10);
        
        // Tentative d'extraction de l'auteur
        const authorMatch = html.match(/@([a-zA-Z0-9_]+)/);
        const author = authorMatch ? authorMatch[1] : 'Unknown';
        
        return NextResponse.json({
          viewCount: 0, // Impossible à extraire sans API
          likeCount: 0,
          commentCount: 0,
          hashtags,
          thumbnail: undefined, // Twitter n'a pas de thumbnails par défaut
          title,
          author,
          publishedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error scraping Twitter:', error);
    }

    // Fallback avec des données minimales
    return NextResponse.json({
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      hashtags: [],
      thumbnail: undefined,
      title: 'Twitter Post',
      author: 'Unknown',
      publishedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in Twitter scraping route:', error);
    return NextResponse.json({ error: 'Failed to fetch Twitter data' }, { status: 500 });
  }
}

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  return text.match(hashtagRegex) || [];
} 