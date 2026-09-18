/**
 * Normalizes Vietnamese text by stripping diacritics and converting to lowercase
 * E.g. "Trí tuệ nhân tạo" -> "tri tue nhan tao"
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

/**
 * Checks if any target field matches the search query (supporting both raw and diacritic-stripped matching)
 */
export function matchSearchQuery(
  query: string,
  ...targets: (string | string[] | undefined | null)[]
): boolean {
  if (!query || !query.trim()) return true;
  const cleanQuery = query.toLowerCase().trim();
  const normalizedQuery = normalizeVietnamese(cleanQuery);

  for (const target of targets) {
    if (!target) continue;

    if (Array.isArray(target)) {
      for (const item of target) {
        if (!item) continue;
        const lower = item.toLowerCase();
        if (lower.includes(cleanQuery) || normalizeVietnamese(lower).includes(normalizedQuery)) {
          return true;
        }
      }
    } else {
      const lower = target.toLowerCase();
      if (lower.includes(cleanQuery) || normalizeVietnamese(lower).includes(normalizedQuery)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Matches an article against a selected technology tag/keyword
 * Checks tags array, titles, summary takeaways, and category
 */
export function matchTechnologyTag(
  tag: string | null | undefined,
  article: {
    tags?: string[];
    title_vi?: string;
    title_en?: string;
    originalTitle?: string;
    summary_vi?: string[];
    summary_en?: string[];
    category?: string;
  }
): boolean {
  if (!tag) return true;
  const cleanTag = tag.toLowerCase().trim();
  const normalizedTag = normalizeVietnamese(cleanTag);

  // 1. Check explicit tags
  if (Array.isArray(article.tags)) {
    const tagFound = article.tags.some((t) => {
      const tLower = t.toLowerCase().trim();
      return tLower === cleanTag || normalizeVietnamese(tLower) === normalizedTag;
    });
    if (tagFound) return true;
  }

  // 2. Check titles
  const titles = [article.title_vi, article.title_en, article.originalTitle].filter(Boolean);
  for (const title of titles) {
    const lower = title!.toLowerCase();
    if (lower.includes(cleanTag) || normalizeVietnamese(lower).includes(normalizedTag)) {
      return true;
    }
  }

  // 3. Check takeaways
  const summaries = [...(article.summary_vi ?? []), ...(article.summary_en ?? [])];
  for (const point of summaries) {
    const lower = point.toLowerCase();
    if (lower.includes(cleanTag) || normalizeVietnamese(lower).includes(normalizedTag)) {
      return true;
    }
  }

  // 4. Check category
  if (article.category) {
    const catLower = article.category.toLowerCase();
    if (catLower.includes(cleanTag) || normalizeVietnamese(catLower).includes(normalizedTag)) {
      return true;
    }
  }

  return false;
}
