import { NewsItem, CanonicalCategory } from '../types/news';

export interface UserInterestProfile {
  categoryWeights: Record<string, number>;
  tagWeights: Record<string, number>;
  interactedArticleIds: string[];
  lastActive: string;
  totalInteractions: number;
}

const STORAGE_KEY = 'clearwind_user_interest_profile';

const ACTION_WEIGHTS = {
  read: 3,
  bookmark: 5,
  upvote: 4,
  share: 2,
} as const;

/**
 * Retrieves the local user interest profile safely from localStorage
 */
export function getUserProfile(): UserInterestProfile {
  if (typeof window === 'undefined') {
    return {
      categoryWeights: {},
      tagWeights: {},
      interactedArticleIds: [],
      lastActive: new Date().toISOString(),
      totalInteractions: 0,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        categoryWeights: {},
        tagWeights: {},
        interactedArticleIds: [],
        lastActive: new Date().toISOString(),
        totalInteractions: 0,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      categoryWeights: {},
      tagWeights: {},
      interactedArticleIds: [],
      lastActive: new Date().toISOString(),
      totalInteractions: 0,
    };
  }
}

/**
 * Saves the updated profile to localStorage
 */
function saveUserProfile(profile: UserInterestProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('[UserInterestTracker] Storage quota exceeded:', e);
  }
}

/**
 * Records a user action on an article to adapt their preference vector in real time
 */
export function recordUserAction(
  article: NewsItem,
  action: 'read' | 'bookmark' | 'upvote' | 'share'
): void {
  if (typeof window === 'undefined' || !article) return;

  const profile = getUserProfile();
  const weight = ACTION_WEIGHTS[action] ?? 1;

  // 1. Update Category Weight
  const cat = article.category || 'Tech Trends & Startups';
  profile.categoryWeights[cat] = (profile.categoryWeights[cat] || 0) + weight;

  // 2. Update Tag Weights
  if (Array.isArray(article.tags)) {
    for (const tag of article.tags) {
      const cleanTag = tag.trim().toLowerCase();
      if (cleanTag) {
        profile.tagWeights[cleanTag] = (profile.tagWeights[cleanTag] || 0) + weight;
      }
    }
  }

  // 3. Record Interacted Article ID
  if (!profile.interactedArticleIds.includes(article.id)) {
    profile.interactedArticleIds.push(article.id);
    if (profile.interactedArticleIds.length > 200) {
      profile.interactedArticleIds.shift();
    }
  }

  profile.totalInteractions += 1;
  profile.lastActive = new Date().toISOString();

  saveUserProfile(profile);
}

/**
 * Computes a personalized affinity score (0 - 100) for an article based on user preference vector
 */
export function calculateArticleRecommendationScore(
  article: NewsItem,
  profile: UserInterestProfile
): { score: number; matchReason: string } {
  // If user has no interactions yet (Cold Start), recommend based on freshness & engagement
  if (profile.totalInteractions === 0) {
    const hoursOld = Math.max(1, (Date.now() - new Date(article.publishedAt).getTime()) / 3600000);
    const freshnessScore = Math.max(10, 100 - hoursOld * 2);
    const engagementScore = ((article.upvotes || 0) + (article.commentsCount || 0) * 2);
    const coldScore = Math.round(freshnessScore * 0.7 + Math.min(30, engagementScore));
    return {
      score: coldScore,
      matchReason: 'Xu hướng nổi bật & Tin mới nhất',
    };
  }

  // 1. Category Affinity (Weight 45%)
  const cat = article.category || 'Tech Trends & Startups';
  const catWeight = profile.categoryWeights[cat] || 0;
  const maxCatWeight = Math.max(...Object.values(profile.categoryWeights), 1);
  const normalizedCatScore = (catWeight / maxCatWeight) * 45;

  // 2. Tag Affinity (Weight 35%)
  let tagMatchPoints = 0;
  let matchedTags: string[] = [];
  if (Array.isArray(article.tags)) {
    for (const tag of article.tags) {
      const cleanTag = tag.trim().toLowerCase();
      if (profile.tagWeights[cleanTag]) {
        tagMatchPoints += profile.tagWeights[cleanTag];
        matchedTags.push(tag);
      }
    }
  }
  const maxTagWeight = Math.max(...Object.values(profile.tagWeights), 1);
  const normalizedTagScore = Math.min(35, (tagMatchPoints / (maxTagWeight * 2)) * 35);

  // 3. Freshness & Momentum (Weight 20%)
  const hoursOld = Math.max(1, (Date.now() - new Date(article.publishedAt).getTime()) / 3600000);
  const freshnessScore = Math.max(5, 20 - hoursOld * 0.5);

  const totalScore = Math.min(99, Math.round(normalizedCatScore + normalizedTagScore + freshnessScore));

  let reason = '';
  if (matchedTags.length > 0) {
    reason = `Chủ đề #${matchedTags.slice(0, 2).join(', #')}`;
  } else if (catWeight > 0) {
    reason = `Chuyên mục ${cat}`;
  } else {
    reason = 'Tin công nghệ tiềm năng';
  }

  return {
    score: totalScore,
    matchReason: reason,
  };
}

/**
 * Returns top personalized recommendations for the user
 */
export function getPersonalizedRecommendations(
  articles: NewsItem[],
  limit: number = 20
): { article: NewsItem; score: number; matchReason: string }[] {
  const profile = getUserProfile();

  const scored = articles.map((article) => {
    const { score, matchReason } = calculateArticleRecommendationScore(article, profile);
    return {
      article,
      score,
      matchReason,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Finds related articles for "Có thể bạn quan tâm" section inside reader detail modal
 */
export function getRelatedArticles(
  currentArticle: NewsItem,
  allArticles: NewsItem[],
  limit: number = 3
): NewsItem[] {
  if (!currentArticle || !allArticles.length) return [];

  const currentTags = new Set((currentArticle.tags || []).map((t) => t.toLowerCase()));

  const candidates = allArticles.filter((a) => a.id !== currentArticle.id);

  const scored = candidates.map((a) => {
    let score = 0;

    // Same category match
    if (a.category === currentArticle.category) {
      score += 10;
    }

    // Tag overlaps
    if (Array.isArray(a.tags)) {
      for (const t of a.tags) {
        if (currentTags.has(t.toLowerCase())) {
          score += 5;
        }
      }
    }

    // Same source
    if (a.sourceName === currentArticle.sourceName) {
      score += 2;
    }

    return { article: a, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.article);
}
