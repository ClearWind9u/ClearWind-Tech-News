'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'vi' | 'en';
export type ViewMode = 'grid' | 'compact';
export type SortOption = 'latest' | 'trending' | 'unread' | 'saved';

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
  tabUnread: string;
  tabSaved: string;
  markAllRead: string;
  unreadCount: string;
  readLater: string;
  unreadBadge: string;
}

const translationsDict: Record<Language, Translations> = {
  vi: {
    appName: 'ClearWind Tech',
    tagline: 'Làn Gió Tin Tức Công Nghệ Tinh Gọn 24/7',
    subTagline: 'Chắt lọc tri thức, thanh lọc thông tin công nghệ đa nguồn bằng Gemini Pro.',
    poweredBy: 'Vận hành bởi Gemini Pro',
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
    freeHostingBadge: 'Tự động 24/7',
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
    tabUnread: 'Chưa đọc',
    tabSaved: 'Xem lại sau',
    markAllRead: 'Đánh dấu đã đọc',
    unreadCount: 'bài chưa đọc',
    readLater: 'Lưu xem sau',
    unreadBadge: 'Mới',
  },
  en: {
    appName: 'ClearWind Tech',
    tagline: 'Pure, Autonomous 24/7 Tech & IT Digest',
    subTagline: 'Breeze through tech noise with AI summaries powered by Gemini Pro.',
    poweredBy: 'Powered by Gemini Pro',
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
    tabUnread: 'Unread',
    tabSaved: 'Read Later',
    markAllRead: 'Mark all as read',
    unreadCount: 'unread',
    readLater: 'Read later',
    unreadBadge: 'New',
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
    } else {
      setIsDark(true);
      document.documentElement.classList.remove('light');
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('tech_news_lang', newLang);
  };

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('tech_news_view', mode);
  };

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

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.remove('light');
        localStorage.setItem('tech_news_theme', 'dark');
      } else {
        document.documentElement.classList.add('light');
        localStorage.setItem('tech_news_theme', 'light');
      }
      return next;
    });
  };

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
