
const fetch = require('node-fetch');

const KEYWORDS = ['@zama_fhe', '@zama', '#zamacreatorprogram', '#zamacreator'];

module.exports = async (req, res) => {
  try{
    const handle = (req.query.handle || '').trim().replace(/^@/, '');
    if(!handle) return res.status(400).send('handle required');

    const bearer = process.env.X_BEARER_TOKEN;
    if(!bearer) return res.status(500).send('X API token not configured');

    const userResp = await fetch(`https://api.twitter.com/2/users/by/username/${encodeURIComponent(handle)}`, {
      headers: { 'Authorization': `Bearer ${bearer}` }
    });
    if(!userResp.ok) return res.status(400).send('Twitter user not found or API error');
    const userJson = await userResp.json();
    const userId = userJson.data.id;

    let paginationToken = null;
    const maxPages = 5;
    let totalChecked = 0, keyword_posts = 0, retweets = 0, quotes = 0, replies = 0;

    for(let page=0; page<maxPages; page++){
      const q = new URLSearchParams();
      q.set('max_results', '100');
      q.set('tweet.fields', 'text,referenced_tweets,created_at');
      if(paginationToken) q.set('pagination_token', paginationToken);

      const timelineUrl = `https://api.twitter.com/2/users/${userId}/tweets?` + q.toString();
      const tResp = await fetch(timelineUrl, { headers: { 'Authorization': `Bearer ${bearer}` } });
      if(!tResp.ok) break;
      const tJson = await tResp.json();

      const tweets = tJson.data || [];
      totalChecked += tweets.length;

      for(const t of tweets){
        const text = (t.text || '').toLowerCase();
        if(KEYWORDS.some(k => text.includes(k.toLowerCase()))) keyword_posts++;

        if(t.referenced_tweets && t.referenced_tweets.length){
          for(const r of t.referenced_tweets){
            if(r.type === 'retweeted') retweets++;
            if(r.type === 'quoted') quotes++;
            if(r.type === 'replied_to') replies++;
          }
        }
      }

      paginationToken = tJson.meta && tJson.meta.next_token;
      if(!paginationToken) break;
    }

    return res.json({
      handle,
      keywords: KEYWORDS,
      total_checked,
      keyword_posts,
      retweets,
      quotes,
      replies
    });

  }catch(err){
    console.error(err);
    res.status(500).send('internal error');
  }
};
