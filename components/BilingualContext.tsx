'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TimeFilterOption } from '../types/news';

export type Language = 'vi' | 'en';
export type ViewMode = 'grid' | 'compact';
export type SortOption = 'latest' | 'trending' | 'forYou' | 'unread' | 'saved';

interface Translations {
  appName: string;
  tagline: string;
  subTagline: string;
  poweredBy: string;
  searchPlaceholder: string;
  allCategories: string;
  allOrigins: string;
  vnOrigins: string;
  globalOrigins: string;
  featuredTitle: string;
  latestTitle: string;
  keyTakeaways: string;
  quickRead: string;
  originalArticle: string;
  bookmarks: string;
  noBookmarks: string;
  noResults: string;
  hotScore: string;
  readTime: string;
  lastUpdated: string;
  copyLink: string;
  copied: string;
  freeHostingBadge: string;
  themeToggle: string;
  clearAll: string;
  gridView: string;
  compactView: string;
  shortcuts: string;
  trendingNow: string;
  share: string;
  fontSize: string;
  tabLatest: string;
  tabTrending: string;
  tabForYou: string;
  tabUnread: string;
  tabSaved: string;
  relatedArticles: string;
  forYouBadge: string;
  markAllRead: string;
  unreadCount: string;
  readLater: string;
  unreadBadge: string;
  timeFilterLabel: string;
  timeHorizon: string;
  timeAll: string;
  time24h: string;
  time3d: string;
  time7d: string;
  timeArchived: string;
  archive: string;
  readTimeFilter: string;
  readQuick: string;
  readMedium: string;
  readDeep: string;
  hotTrending: string;
  hotSuper: string;
  itemsPerPage: string;
  pageIndicator: string;
  resetFilters: string;
  filterByMonth: string;
  allMonths: string;
  filters: string;
  activeFilters: string;
  searchInlinePlaceholder: string;
  sourceOrigin: string;
  hotnessLevel: string;
  techTags: string;
  articlesCount: string;
}

const translationsDict: Record<Language, Translations> = {
  vi: {
    appName: 'ClearWind Tech',
    tagline: 'Làn Gió Tin Tức Công Nghệ Tinh Gọn 24/7',
    subTagline: 'Chắt lọc tri thức, thanh lọc thông tin công nghệ đa nguồn mỗi ngày.',
    poweredBy: 'Biên tập bởi ClearWind Tech',
    searchPlaceholder: 'Tìm kiếm tin tức, công nghệ (Ctrl+K)...',
    allCategories: 'Tất cả danh mục',
    allOrigins: 'Tất cả nguồn',
    vnOrigins: 'Việt Nam',
    globalOrigins: 'Quốc tế',
    featuredTitle: 'Tiêu điểm công nghệ',
    latestTitle: 'Dòng tin tức',
    keyTakeaways: 'Tóm tắt cốt lõi:',
    quickRead: 'Đọc nhanh',
    originalArticle: 'Bài viết gốc',
    bookmarks: 'Đã lưu',
    noBookmarks: 'Chưa có bài viết nào được lưu. Hãy bấm biểu tượng Bookmark trên các bài viết để đọc lại sau!',
    noResults: 'Không tìm thấy bài viết phù hợp.',
    hotScore: 'Điểm',
    readTime: 'phút đọc',
    lastUpdated: 'Cập nhật:',
    copyLink: 'Sao chép link',
    copied: 'Đã sao chép',
    freeHostingBadge: 'Cập nhật liên tục 24/7',
    themeToggle: 'Chế độ hiển thị',
    clearAll: 'Xóa tất cả',
    gridView: 'Lưới',
    compactView: 'Danh sách',
    shortcuts: 'Phím tắt',
    trendingNow: 'Tiêu điểm',
    share: 'Chia sẻ',
    fontSize: 'Cỡ chữ',
    tabLatest: 'Mới nhất',
    tabTrending: 'Nổi bật',
    tabForYou: 'Dành cho bạn',
    tabUnread: 'Chưa đọc',
    tabSaved: 'Xem lại sau',
    relatedArticles: 'Có thể bạn quan tâm',
    forYouBadge: 'Gợi ý AI',
    markAllRead: 'Đánh dấu đã đọc',
    unreadCount: 'bài chưa đọc',
    readLater: 'Lưu xem sau',
    unreadBadge: 'Mới',
    timeFilterLabel: 'Thời gian:',
    timeHorizon: 'Thời gian đăng',
    timeAll: 'Tất cả',
    time24h: '24 giờ qua',
    time3d: '3 ngày qua',
    time7d: '7 ngày gần đây',
    timeArchived: 'Lưu trữ cũ (> 7 ngày)',
    archive: 'Kho lưu trữ',
    readTimeFilter: 'Thời lượng đọc',
    readQuick: '< 3p (Đọc nhanh)',
    readMedium: '3 - 6p (Tiêu chuẩn)',
    readDeep: '> 6p (Chuyên sâu)',
    hotTrending: 'Thịnh hành (>=85)',
    hotSuper: 'Chấn động (>=90)',
    itemsPerPage: 'Số lượng/trang',
    pageIndicator: 'Trang',
    resetFilters: 'Đặt lại bộ lọc',
    filterByMonth: 'Lọc theo tháng',
    allMonths: 'Tất cả các tháng',
    filters: 'Bộ lọc',
    activeFilters: 'Đang áp dụng',
    searchInlinePlaceholder: 'Tìm kiếm tin tức hoặc nhấn / để gõ...',
    sourceOrigin: 'Nguồn tin & Khu vực',
    hotnessLevel: 'Mức độ quan tâm',
    techTags: 'Tags công nghệ',
    articlesCount: 'bản tin',
  },
  en: {
    appName: 'ClearWind Tech',
    tagline: 'Pure, Autonomous 24/7 Tech & IT Digest',
    subTagline: 'Breeze through tech noise with curated daily software & IT insights.',
    poweredBy: 'Curated by ClearWind Tech',
    searchPlaceholder: 'Search tech news (Ctrl+K)...',
    allCategories: 'All Categories',
    allOrigins: 'All Sources',
    vnOrigins: 'Vietnam',
    globalOrigins: 'Global',
    featuredTitle: 'Featured Highlights',
    latestTitle: 'News Feed',
    keyTakeaways: 'Key Takeaways:',
    quickRead: 'Quick Read',
    originalArticle: 'Original Source',
    bookmarks: 'Saved Articles',
    noBookmarks: 'No saved articles yet. Click the bookmark icon on any article to save for later reading!',
    noResults: 'No articles found.',
    hotScore: 'Score',
    readTime: 'min read',
    lastUpdated: 'Updated:',
    copyLink: 'Copy link',
    copied: 'Copied',
    freeHostingBadge: 'Autonomous 24/7',
    themeToggle: 'Theme',
    clearAll: 'Clear all',
    gridView: 'Grid',
    compactView: 'Compact',
    shortcuts: 'Shortcuts',
    trendingNow: 'Trending',
    share: 'Share',
    fontSize: 'Font Size',
    tabLatest: 'Latest',
    tabTrending: 'Trending',
    tabForYou: 'For You',
    tabUnread: 'Unread',
    tabSaved: 'Read Later',
    relatedArticles: 'You Might Also Like',
    forYouBadge: 'AI Pick',
    markAllRead: 'Mark all as read',
    unreadCount: 'unread',
    readLater: 'Read later',
    unreadBadge: 'New',
    timeFilterLabel: 'Timeframe:',
    timeHorizon: 'Published Time',
    timeAll: 'All Time',
    time24h: 'Last 24h',
    time3d: 'Last 3 Days',
    time7d: 'Last 7 Days',
    timeArchived: 'Archived (> 7 Days)',
    archive: 'Archive',
    readTimeFilter: 'Reading Time',
    readQuick: '< 3m (Quick)',
    readMedium: '3 - 6m (Standard)',
    readDeep: '> 6m (In-depth)',
    hotTrending: 'Trending (>=85)',
    hotSuper: 'Breaking (>=90)',
    itemsPerPage: 'Items/page',
    pageIndicator: 'Page',
    resetFilters: 'Reset filters',
    filterByMonth: 'Filter by month',
    allMonths: 'All months',
    filters: 'Filters',
    activeFilters: 'Active Filters',
    searchInlinePlaceholder: 'Search news or press / to filter...',
    sourceOrigin: 'Source Origin',
    hotnessLevel: 'Hotness Level',
    techTags: 'Tech Tags',
    articlesCount: 'articles',
  },
};

interface BilingualContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  clearBookmarks: () => void;
  cleanupStaleBookmarks: (validIds: string[]) => void;
  readArticles: string[];
  markAsRead: (id: string) => void;
  markAllAsRead: (allIds: string[]) => void;
  isRead: (id: string) => boolean;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  timeFilter: TimeFilterOption;
  setTimeFilter: (time: TimeFilterOption) => void;
  upvotes: Record<string, boolean>;
  toggleUpvote: (id: string) => void;
  isUpvoted: (id: string) => boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isDark: boolean;
  toggleTheme: () => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}

const BilingualContext = createContext<BilingualContextType | undefined>(undefined);

export function BilingualProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('vi');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [timeFilter, setTimeFilterState] = useState<TimeFilterOption>('24h');
  const [upvotes, setUpvotes] = useState<Record<string, boolean>>({});
  const [viewMode, setViewModeState] = useState<ViewMode>('grid');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('tech_news_lang') as Language;
    if (savedLang === 'vi' || savedLang === 'en') setLangState(savedLang);

    const savedBookmarks = localStorage.getItem('tech_news_bookmarks');
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        if (Array.isArray(parsed)) setBookmarks(parsed);
      } catch (e) {}
    }

    const savedReads = localStorage.getItem('tech_news_read_articles');
    if (savedReads) {
      try {
        const parsed = JSON.parse(savedReads);
        if (Array.isArray(parsed)) setReadArticles(parsed);
      } catch (e) {}
    }

    const savedUpvotes = localStorage.getItem('tech_news_upvotes');
    if (savedUpvotes) {
      try {
        const parsed = JSON.parse(savedUpvotes);
        if (parsed && typeof parsed === 'object') setUpvotes(parsed);
      } catch (e) {}
    }

    const savedView = localStorage.getItem('tech_news_view') as ViewMode;
    if (savedView === 'grid' || savedView === 'compact') setViewModeState(savedView);

    const savedTheme = localStorage.getItem('tech_news_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('tech_news_lang', newLang);
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('tech_news_view', mode);
  }, []);

  const setTimeFilter = useCallback((newTime: TimeFilterOption) => {
    setTimeFilterState(newTime);
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('tech_news_bookmarks', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    localStorage.removeItem('tech_news_bookmarks');
  }, []);

  const cleanupStaleBookmarks = useCallback((validIds: string[]) => {
    if (!validIds || validIds.length === 0) return;
    setBookmarks((prev) => {
      const validSet = new Set(validIds);
      const filtered = prev.filter((id) => validSet.has(id));
      if (filtered.length !== prev.length) {
        localStorage.setItem('tech_news_bookmarks', JSON.stringify(filtered));
        return filtered;
      }
      return prev;
    });
  }, []);

  const isBookmarked = useCallback((id: string) => bookmarks.includes(id), [bookmarks]);

  const markAsRead = useCallback((id: string) => {
    setReadArticles((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('tech_news_read_articles', JSON.stringify(next));
      return next;
    });
  }, []);

  const markAllAsRead = useCallback((allIds: string[]) => {
    setReadArticles(allIds);
    localStorage.setItem('tech_news_read_articles', JSON.stringify(allIds));
  }, []);

  const isRead = useCallback((id: string) => readArticles.includes(id), [readArticles]);

  const toggleUpvote = useCallback((id: string) => {
    setUpvotes((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('tech_news_upvotes', JSON.stringify(next));
      return next;
    });
  }, []);

  const isUpvoted = useCallback((id: string) => !!upvotes[id], [upvotes]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('tech_news_theme', 'dark');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        localStorage.setItem('tech_news_theme', 'light');
      }
      return next;
    });
  }, []);

  return (
    <BilingualContext.Provider
      value={{
        lang,
        setLang,
        t: translationsDict[lang],
        bookmarks,
        toggleBookmark,
        isBookmarked,
        clearBookmarks,
        cleanupStaleBookmarks,
        readArticles,
        markAsRead,
        markAllAsRead,
        isRead,
        sortOption,
        setSortOption,
        timeFilter,
        setTimeFilter,
        upvotes,
        toggleUpvote,
        isUpvoted,
        viewMode,
        setViewMode,
        isDark,
        toggleTheme,
        selectedTag,
        setSelectedTag,
      }}
    >
      {children}
    </BilingualContext.Provider>
  );
}

export function useBilingual() {
  const context = useContext(BilingualContext);
  if (!context) {
    throw new Error('useBilingual must be used within a BilingualProvider');
  }
  return context;
}
