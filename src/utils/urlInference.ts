/**
 * Utility function to infer full URLs from partial website names in natural language commands
 * @param query - The user's natural language input (e.g., "open instagram", "visit github")
 * @returns The inferred full URL or null if unable to infer
 */
export function inferWebsiteUrl(query: string): string | null {
  // Extract website name from common navigation commands
  const siteNameMatch = query.match(/(?:open|visit|go to|navigate to|show me)\s+([^\s]+)/i);

  if (!siteNameMatch) {
    return null;
  }

  const siteName = siteNameMatch[1].toLowerCase().trim();

  // Common website mappings for popular sites
  const commonSites: { [key: string]: string } = {
    // Social Media
    'instagram': 'https://www.instagram.com',
    'facebook': 'https://www.facebook.com',
    'twitter': 'https://www.twitter.com',
    'linkedin': 'https://www.linkedin.com',
    'reddit': 'https://www.reddit.com',
    'tiktok': 'https://www.tiktok.com',
    'snapchat': 'https://www.snapchat.com',
    'pinterest': 'https://www.pinterest.com',

    // Search Engines
    'google': 'https://www.google.com',
    'bing': 'https://www.bing.com',
    'duckduckgo': 'https://www.duckduckgo.com',
    'yahoo': 'https://www.yahoo.com',

    // Video & Streaming
    'youtube': 'https://www.youtube.com',
    'twitch': 'https://www.twitch.tv',
    'netflix': 'https://www.netflix.com',
    'hulu': 'https://www.hulu.com',
    'spotify': 'https://www.spotify.com',
    'soundcloud': 'https://www.soundcloud.com',

    // Productivity & Development
    'github': 'https://www.github.com',
    'stackoverflow': 'https://www.stackoverflow.com',
    'gmail': 'https://www.gmail.com',
    'drive': 'https://www.drive.google.com',
    'docs': 'https://www.docs.google.com',
    'slack': 'https://www.slack.com',
    'discord': 'https://www.discord.com',
    'notion': 'https://www.notion.so',
    'trello': 'https://www.trello.com',
    'zoom': 'https://www.zoom.us',

    // News & Information
    'cnn': 'https://www.cnn.com',
    'bbc': 'https://www.bbc.com',
    'nytimes': 'https://www.nytimes.com',
    'wikipedia': 'https://www.wikipedia.org',
    'weather': 'https://www.weather.com',

    // Shopping & Commerce
    'amazon': 'https://www.amazon.com',
    'ebay': 'https://www.ebay.com',
    'etsy': 'https://www.etsy.com',
    'aliexpress': 'https://www.aliexpress.com',

    // Tech Companies
    'apple': 'https://www.apple.com',
    'microsoft': 'https://www.microsoft.com',
    'tesla': 'https://www.tesla.com',

    // AI & Chat
    'chatgpt': 'https://www.chat.openai.com',
    'claude': 'https://www.claude.ai',
    'bard': 'https://www.bard.google.com',

    // Maps & Travel
    'maps': 'https://www.google.com/maps',
    'uber': 'https://www.uber.com',
    'airbnb': 'https://www.airbnb.com',

    // Education
    'coursera': 'https://www.coursera.org',
    'udemy': 'https://www.udemy.com',
    'khan': 'https://www.khanacademy.org',

    // Other Popular Sites
    'paypal': 'https://www.paypal.com',
    'dropbox': 'https://www.dropbox.com',
    'medium': 'https://www.medium.com',
    'quora': 'https://www.quora.com'
  };

  // Check if it's a known common site
  if (commonSites[siteName]) {
    return commonSites[siteName];
  }

  // Handle cases where user provides full domain
  if (siteName.includes('.')) {
    return siteName.startsWith('http') ? siteName : `https://${siteName}`;
  }

  // For unknown sites, default to .com
  return `https://www.${siteName}.com`;
}

/**
 * Example usage:
 *
 * const url = inferWebsiteUrl("open instagram");
 * // Returns: "https://www.instagram.com"
 *
 * const url2 = inferWebsiteUrl("visit github");
 * // Returns: "https://www.github.com"
 *
 * const url3 = inferWebsiteUrl("go to google.com");
 * // Returns: "https://google.com"
 */
