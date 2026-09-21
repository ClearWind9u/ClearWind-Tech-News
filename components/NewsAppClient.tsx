'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  NewsDatabase,
  NewsItem,
  isArticleInTimeRange,
  isArticleOlderThanDays,
  ArchiveManifest,
  ReadTimeFilterOption,
  HotFilterOption,
} from '@/types/news';
import { Navbar } from './Navbar';
import { HeroBento } from './HeroBento';
import { CategoryFilter } from './CategoryFilter';
import { NewsCard } from './NewsCard';
import { NewsRowCompact } from './NewsRowCompact';
import { Footer } from './Footer';
import { CardSkeleton, RowSkeleton, HeroSkeleton } from './NewsSkeleton';
import { useBilingual, SortOption } from './BilingualContext';
import dynamic from 'next/dynamic';

const NewsDetailModal = dynamic(
  () => import('./NewsDetailModal').then((m) => m.NewsDetailModal),
  { ssr: false }
);
const BookmarkDrawer = dynamic(
  () => import('./BookmarkDrawer').then((m) => m.BookmarkDrawer),
  { ssr: false }
);
const ShortcutsModal = dynamic(
  () => import('./ShortcutsModal').then((m) => m.ShortcutsModal),
  { ssr: false }
);
const SpotlightSearchModal = dynamic(
  () => import('./SpotlightSearchModal').then((m) => m.SpotlightSearchModal),
  { ssr: false }
);
const DailyBriefingPlayer = dynamic(
  () => import('./DailyBriefingPlayer').then((m) => m.DailyBriefingPlayer),
  { ssr: false }
);
import { useDailyBriefingPlaylist } from '@/lib/speech_synthesizer';
import { TechRadarWidget } from './TechRadarWidget';
import { computeTechRadar } from '@/lib/tech_radar_engine';
import { matchSearchQuery, matchTechnologyTag } from '@/lib/search_utils';
import { computeMultiSourceConvergence, getEffectiveHotScore } from '@/lib/trend_clustering';

function areParamsEqual(searchString: string, newParams: URLSearchParams): boolean {
  const currentParams = new URLSearchParams(searchString);
  const currentKeys = Array.from(currentParams.keys()).sort();
  const newKeys = Array.from(newParams.keys()).sort();

  if (currentKeys.length !== newKeys.length) return false;
  for (let i = 0; i < currentKeys.length; i++) {
    if (currentKeys[i] !== newKeys[i]) return false;
    if (currentParams.get(currentKeys[i]) !== newParams.get(newKeys[i])) return false;
  }
  return true;
}
import {
  SearchX,
  LayoutGrid,
  List,
  CheckCheck,
  Flame,
  Clock,
  Compass,
  EyeOff,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Keyboard,
  Headphones,
  ListMusic,
  ListPlus,
  Play,
  Trash2,
  Layers,
} from 'lucide-react';
import { getPersonalizedRecommendations } from '@/lib/user_interest_tracker';

interface NewsAppClientProps {
  initialData: NewsDatabase;
  archiveManifest?: ArchiveManifest;
}

export const NewsAppClient: React.FC<NewsAppClientProps> = ({
  initialData,
  archiveManifest,
}) => {
  const {
    lang,
    setLang,
    t,
    viewMode,
    setViewMode,
    toggleTheme,
    selectedTag,
    setSelectedTag,
    readArticles,
    isRead,
    markAllAsRead,
    bookmarks,
    toggleBookmark,
    cleanupStaleBookmarks,
    sortOption,
    setSortOption,
    timeFilter,
    setTimeFilter,
  } = useBilingual();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOrigin, setSelectedOrigin] = useState<'all' | 'vietnam' | 'global'>('all');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [isBookmarkDrawerOpen, setIsBookmarkDrawerOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>(-1);

  // Top 5 stories for 3-minute morning briefing / 24/7 tech radio podcast
  const topBriefingArticles = useMemo(() => {
    return [...(initialData?.articles ?? [])]
      .filter((a) => !isArticleOlderThanDays(a.publishedAt, 30))
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, 5);
  }, [initialData?.articles]);

  const briefingPlayer = useDailyBriefingPlaylist(topBriefingArticles, lang);

  const handleOpenArticle = useCallback(
    (art: NewsItem, autoPlay = false) => {
      if (autoPlay && briefingPlayer.isPlaying) {
        briefingPlayer.stop();
      }
      setActiveArticle(art);
      setAutoPlayAudio(autoPlay);
    },
    [briefingPlayer]
  );

  // Advanced Filters State
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [readTimeFilter, setReadTimeFilter] = useState<ReadTimeFilterOption>('all');
  const [hotFilter, setHotFilter] = useState<HotFilterOption>('all');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [monthArticlesCache, setMonthArticlesCache] = useState<Record<string, NewsItem[]>>({});
  const [isMonthLoading, setIsMonthLoading] = useState(false);

  // Load monthly partition when a specific month is selected
  useEffect(() => {
    if (selectedMonth === 'all') return;
    if (monthArticlesCache[selectedMonth]) return;

    setIsMonthLoading(true);
    fetch(`/api/news?month=${selectedMonth}&limit=250`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.articles)) {
          setMonthArticlesCache((prev) => ({
            ...prev,
            [selectedMonth]: data.articles,
          }));
        }
      })
      .catch((err) => {
        console.warn('[NewsAppClient] Failed to load archive month:', err);
      })
      .finally(() => {
        setIsMonthLoading(false);
      });
  }, [selectedMonth, monthArticlesCache]);

  // Active articles pool (from month partition if chosen, else from initialData)
  const activeArticlesPool = useMemo(() => {
    if (selectedMonth !== 'all' && monthArticlesCache[selectedMonth]) {
      return monthArticlesCache[selectedMonth];
    }
    return initialData?.articles ?? [];
  }, [selectedMonth, monthArticlesCache, initialData?.articles]);

  // Real-time Tech Radar data computed from current active articles pool
  const radarData = useMemo(() => {
    return computeTechRadar(activeArticlesPool);
  }, [activeArticlesPool]);

  // Multi-source convergence map (boosts stories appearing across multiple outlets)
  const multiSourceMap = useMemo(() => {
    return computeMultiSourceConvergence(activeArticlesPool);
  }, [activeArticlesPool]);

  // Audio Queue State (Custom user selection, persisted in localStorage)
  const [audioQueueIds, setAudioQueueIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('clearwind_audio_queue');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setAudioQueueIds(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleAudioQueue = useCallback((article: NewsItem) => {
    setAudioQueueIds((prev) => {
      let next: string[];
      if (prev.includes(article.id)) {
        next = prev.filter((id) => id !== article.id);
      } else {
        next = [...prev, article.id];
      }
      try {
        localStorage.setItem('clearwind_audio_queue', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clearAudioQueue = useCallback(() => {
    setAudioQueueIds([]);
    try {
      localStorage.removeItem('clearwind_audio_queue');
    } catch {
      // ignore
    }
  }, []);

  const selectedQueueArticles = useMemo(() => {
    return audioQueueIds
      .map((id) => activeArticlesPool.find((a) => a.id === id))
      .filter((a): a is NewsItem => Boolean(a));
  }, [audioQueueIds, activeArticlesPool]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const isUrlInitialized = useRef(false);
  const lastSyncedQueryRef = useRef<string>('');

  // 1. Initial URL Hydration (Deep Linking on first load)
  useEffect(() => {
    if (typeof window === 'undefined' || isUrlInitialized.current) return;
    isUrlInitialized.current = true;
    lastSyncedQueryRef.current = window.location.search.replace(/^\?/, '');

    const params = new URLSearchParams(window.location.search);

    const artId = params.get('article');
    if (artId && initialData?.articles) {
      const found = initialData.articles.find((a) => a.id === artId);
      if (found) setActiveArticle(found);
    }

    const cat = params.get('category');
    if (cat) setSelectedCategory(cat);

    const origin = params.get('origin');
    if (origin === 'vietnam' || origin === 'global') setSelectedOrigin(origin);

    const time = params.get('time');
    if (time === '24h' || time === '3d' || time === '7d' || time === 'all') setTimeFilter(time);

    const sort = params.get('sort');
    if (sort === 'trending' || sort === 'forYou' || sort === 'unread' || sort === 'saved') {
      setSortOption(sort);
    }

    const tag = params.get('tag');
    if (tag) setSelectedTag(tag);

    const month = params.get('month');
    if (month) setSelectedMonth(month);

    const rt = params.get('readTime');
    if (rt === 'quick' || rt === 'medium' || rt === 'deep') setReadTimeFilter(rt);

    const hf = params.get('hot');
    if (hf === 'trending' || hf === 'superhot') setHotFilter(hf);

    const q = params.get('q');
    if (q) setSearchQuery(q);

    const p = params.get('page');
    if (p) {
      const pageNum = parseInt(p, 10);
      if (!isNaN(pageNum) && pageNum > 1) setCurrentPage(pageNum);
    }
  }, []); // Run strictly once on mount to prevent infinite render loops

  // 2. Bidirectional URL Synchronization (State -> URL Query Params)
  useEffect(() => {
    if (!isUrlInitialized.current || typeof window === 'undefined') return;

    const params = new URLSearchParams();

    if (activeArticle) params.set('article', activeArticle.id);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedOrigin !== 'all') params.set('origin', selectedOrigin);
    if (timeFilter !== '24h' && timeFilter !== 'all') params.set('time', timeFilter);
    else if (timeFilter === 'all') params.set('time', 'all');
    if (sortOption !== 'latest') params.set('sort', sortOption);
    if (selectedTag) params.set('tag', selectedTag);
    if (selectedMonth !== 'all') params.set('month', selectedMonth);
    if (readTimeFilter !== 'all') params.set('readTime', readTimeFilter);
    if (hotFilter !== 'all') params.set('hot', hotFilter);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (currentPage > 1) params.set('page', String(currentPage));

    const queryString = params.toString();

    // Guard: Prevent infinite loop by checking if query already matches what we synced or current URL
    if (queryString === lastSyncedQueryRef.current) return;
    if (areParamsEqual(window.location.search, params)) {
      lastSyncedQueryRef.current = queryString;
      return;
    }

    lastSyncedQueryRef.current = queryString;
    const newRelativePathQuery = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(null, '', newRelativePathQuery);
  }, [
    activeArticle,
    selectedCategory,
    selectedOrigin,
    timeFilter,
    sortOption,
    selectedTag,
    selectedMonth,
    readTimeFilter,
    hotFilter,
    searchQuery,
    currentPage,
  ]);

  // 3. Browser Back / Forward History Navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      lastSyncedQueryRef.current = window.location.search.replace(/^\?/, '');
      const params = new URLSearchParams(window.location.search);
      const artId = params.get('article');
      if (artId) {
        const found = activeArticlesPool.find((a) => a.id === artId);
        if (found) setActiveArticle(found);
      } else {
        setActiveArticle(null);
      }
      setSelectedCategory(params.get('category') ?? 'all');
      const origin = params.get('origin');
      setSelectedOrigin(origin === 'vietnam' || origin === 'global' ? origin : 'all');
      const time = params.get('time');
      setTimeFilter(time === '24h' || time === '3d' || time === '7d' ? time : 'all');
      const sort = params.get('sort');
      setSortOption(
        sort === 'trending' || sort === 'forYou' || sort === 'unread' || sort === 'saved'
          ? sort
          : 'latest'
      );
      setSelectedTag(params.get('tag') ?? null);
      setSelectedMonth(params.get('month') ?? 'all');
      const rt = params.get('readTime');
      setReadTimeFilter(rt === 'quick' || rt === 'medium' || rt === 'deep' ? rt : 'all');
      const hf = params.get('hot');
      setHotFilter(hf === 'trending' || hf === 'superhot' ? hf : 'all');
      setSearchQuery(params.get('q') ?? '');
      const p = params.get('page');
      setCurrentPage(p ? Math.max(1, parseInt(p, 10) || 1) : 1);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeArticlesPool, setTimeFilter, setSortOption, setSelectedTag]);

  // Brief shimmer loading feedback when filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [
    selectedCategory,
    selectedOrigin,
    sortOption,
    timeFilter,
    selectedTag,
    selectedMonth,
    readTimeFilter,
    hotFilter,
  ]);

  // Auto clean up stale bookmarks when articles load
  useEffect(() => {
    if (initialData?.articles && initialData.articles.length > 0) {
      cleanupStaleBookmarks(initialData.articles.map((a: NewsItem) => a.id));
    }
  }, [initialData?.articles, cleanupStaleBookmarks]);

  // Reset pagination to Page 1 when any filter changes
  useEffect(() => {
    if (!isUrlInitialized.current) return;
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedOrigin,
    searchQuery,
    selectedTag,
    sortOption,
    timeFilter,
    selectedMonth,
    readTimeFilter,
    hotFilter,
    itemsPerPage,
  ]);

  const ALL_CANONICAL_CATEGORIES = [
    'AI & Machine Learning',
    'Software Engineering',
    'DevOps & Cloud',
    'Cybersecurity',
    'Mobile & Web',
    'Tech Trends & Startups',
  ];

  const categories = useMemo(() => {
    const existingSet = new Set<string>();
    activeArticlesPool.forEach((a) => {
      if (a.category) existingSet.add(a.category);
    });
    return ALL_CANONICAL_CATEGORIES.filter((c) => existingSet.has(c)).concat(
      Array.from(existingSet).filter((c) => !ALL_CANONICAL_CATEGORIES.includes(c))
    );
  }, [activeArticlesPool]);

  // Available popular tech tags
  const availableTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    activeArticlesPool.forEach((a) => {
      (a.tags ?? []).forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([t]) => t);
  }, [activeArticlesPool]);

  // Unread count
  const unreadCount = useMemo(() => {
    return activeArticlesPool.filter((a) => !readArticles.includes(a.id)).length;
  }, [activeArticlesPool, readArticles]);

  // Valid Saved count
  const savedArticlesCount = useMemo(() => {
    return activeArticlesPool.filter((a) => bookmarks.includes(a.id)).length;
  }, [activeArticlesPool, bookmarks]);

  // Check if any filter is actively applied
  const isFiltered = useMemo(() => {
    return (
      selectedCategory !== 'all' ||
      selectedOrigin !== 'all' ||
      selectedTag !== null ||
      timeFilter !== 'all' ||
      selectedMonth !== 'all' ||
      readTimeFilter !== 'all' ||
      hotFilter !== 'all' ||
      searchQuery.trim() !== ''
    );
  }, [
    selectedCategory,
    selectedOrigin,
    selectedTag,
    timeFilter,
    selectedMonth,
    readTimeFilter,
    hotFilter,
    searchQuery,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedOrigin !== 'all') count++;
    if (timeFilter !== 'all') count++;
    if (selectedMonth !== 'all') count++;
    if (readTimeFilter !== 'all') count++;
    if (hotFilter !== 'all') count++;
    if (selectedTag !== null) count++;
    return count;
  }, [selectedOrigin, timeFilter, selectedMonth, readTimeFilter, hotFilter, selectedTag]);

  const handleResetAllFilters = useCallback(() => {
    setSelectedCategory('all');
    setSelectedOrigin('all');
    setSelectedTag(null);
    setTimeFilter('all');
    setSelectedMonth('all');
    setReadTimeFilter('all');
    setHotFilter('all');
    setSearchQuery('');
    setSortOption('latest');
  }, [setSelectedTag, setTimeFilter, setSortOption]);

  // Filter & Sort Pipeline
  const filteredArticles = useMemo(() => {
    let result = activeArticlesPool.filter((article) => {
      // 1. Tag & Technology Entity Filter (Tech Radar and Tags)
      if (selectedTag && !matchTechnologyTag(selectedTag, article)) {
        return false;
      }

      if (selectedOrigin !== 'all' && article.sourceOrigin !== selectedOrigin) {
        return false;
      }

      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }

      if (sortOption === 'unread' && isRead(article.id)) {
        return false;
      }

      if (sortOption === 'saved' && !bookmarks.includes(article.id)) {
        return false;
      }

      // Read time filter
      if (readTimeFilter !== 'all') {
        const minutes = article.readTimeMinutes ?? 3;
        if (readTimeFilter === 'quick' && minutes > 3) return false;
        if (readTimeFilter === 'medium' && (minutes <= 3 || minutes > 6)) return false;
        if (readTimeFilter === 'deep' && minutes <= 6) return false;
      }

      // Hotness threshold filter
      if (hotFilter !== 'all') {
        if (hotFilter === 'trending' && article.hotScore < 85) return false;
        if (hotFilter === 'superhot' && article.hotScore < 90) return false;
      }

      // Timeframe Filter (Default to <= 30 days; preserve bookmarks, search results and archive partitions)
      if (sortOption !== 'saved' && !searchQuery.trim() && selectedMonth === 'all') {
        if (!isArticleInTimeRange(article.publishedAt, timeFilter)) {
          return false;
        }
      }

      // 2. Search query filter (with Vietnamese diacritic-insensitive matching)
      if (searchQuery.trim()) {
        const isMatch = matchSearchQuery(
          searchQuery,
          article.title_vi,
          article.title_en,
          article.originalTitle,
          article.summary_vi,
          article.summary_en,
          article.tags,
          article.sourceName,
          article.authorName,
          article.category
        );
        if (!isMatch) return false;
      }

      return true;
    });

    // Apply Sorting Priority with Multi-Source Convergence Boost
    if (sortOption === 'trending') {
      result = [...result].sort((a, b) => {
        const scoreA = getEffectiveHotScore(a, multiSourceMap.get(a.id));
        const scoreB = getEffectiveHotScore(b, multiSourceMap.get(b.id));
        return scoreB - scoreA;
      });
    } else if (sortOption === 'forYou') {
      const recs = getPersonalizedRecommendations(result, result.length);
      result = [...recs]
        .sort((a, b) => {
          const infoA = multiSourceMap.get(a.article.id);
          const infoB = multiSourceMap.get(b.article.id);
          const boostA = infoA && infoA.sourcesCount >= 2 ? 0.25 * (infoA.sourcesCount - 1) : 0;
          const boostB = infoB && infoB.sourcesCount >= 2 ? 0.25 * (infoB.sourcesCount - 1) : 0;
          return (b.score + boostB) - (a.score + boostA);
        })
        .map((r) => r.article);
    } else {
      // 'latest', 'unread', 'saved' sort by newest first
      result = [...result].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    return result;
  }, [
    activeArticlesPool,
    multiSourceMap,
    selectedOrigin,
    selectedCategory,
    searchQuery,
    selectedTag,
    sortOption,
    timeFilter,
    selectedMonth,
    readTimeFilter,
    hotFilter,
    bookmarks,
    isRead,
  ]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = useMemo(() => {
    return filteredArticles.slice(startIndex, endIndex);
  }, [filteredArticles, startIndex, endIndex]);

  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const feedElement = document.getElementById('news-feed-container');
    if (feedElement) {
      feedElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [totalPages]);

  const filteredPlaylistCount = Math.min(filteredArticles.length, 30);

  const handlePlayFilteredList = useCallback(() => {
    if (filteredArticles.length === 0) return;
    const count = Math.min(filteredArticles.length, 30);
    const playList = filteredArticles.slice(0, count);
    const title = isFiltered
      ? t.filteredPlaylist
      : (lang === 'vi' ? 'Bản tin danh sách hiện tại' : 'Current News Playlist');
    briefingPlayer.playCustomList(playList, title);
    setIsBriefingOpen(true);
  }, [filteredArticles, isFiltered, briefingPlayer, t.filteredPlaylist, lang]);

  const handlePlaySelectedQueue = useCallback(() => {
    if (selectedQueueArticles.length === 0) return;
    briefingPlayer.playCustomList(selectedQueueArticles, t.customPlaylist);
    setIsBriefingOpen(true);
  }, [selectedQueueArticles, briefingPlayer, t.customPlaylist]);

  // Reset card focus when changing page, filter or search
  useEffect(() => {
    setFocusedCardIndex(-1);
  }, [currentPage, selectedCategory, sortOption, searchQuery, selectedOrigin, selectedMonth]);

  // Smooth scroll focused card into view
  useEffect(() => {
    if (focusedCardIndex >= 0 && paginatedArticles[focusedCardIndex]) {
      const el = document.getElementById(`article-card-${paginatedArticles[focusedCardIndex].id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedCardIndex, paginatedArticles]);

  // Keyboard navigation shortcuts (Vim / Linear pro navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // If Escape is pressed, dismiss dialogs or clear focus
      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
        } else if (isBookmarkDrawerOpen) {
          setIsBookmarkDrawerOpen(false);
        } else if (activeArticle) {
          setActiveArticle(null);
        } else if (isBriefingOpen) {
          setIsBriefingOpen(false);
        } else if (focusedCardIndex !== -1) {
          setFocusedCardIndex(-1);
        }
        return;
      }

      // If activeArticle or shortcuts modal is open, don't trigger feed shortcuts
      if (activeArticle || isShortcutsOpen || isBookmarkDrawerOpen) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setFocusedCardIndex((prev) => (prev <= 0 ? 0 : prev - 1));
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setFocusedCardIndex((prev) => (prev === -1 ? 0 : prev < paginatedArticles.length - 1 ? prev + 1 : prev));
      } else if (e.key === ' ') {
        e.preventDefault();
        if (focusedCardIndex >= 0 && paginatedArticles[focusedCardIndex]) {
          handleOpenArticle(paginatedArticles[focusedCardIndex], true);
        } else {
          // Toggle Daily Briefing
          if (briefingPlayer.isPlaying) {
            if (briefingPlayer.isPaused) {
              briefingPlayer.resume();
            } else {
              briefingPlayer.pause();
            }
          } else {
            setIsBriefingOpen(true);
            briefingPlayer.startBriefing();
          }
        }
      } else if (e.key === 'Enter') {
        if (focusedCardIndex >= 0 && paginatedArticles[focusedCardIndex]) {
          e.preventDefault();
          handleOpenArticle(paginatedArticles[focusedCardIndex], false);
        }
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (focusedCardIndex >= 0 && paginatedArticles[focusedCardIndex]) {
          toggleBookmark(paginatedArticles[focusedCardIndex].id);
        } else {
          setIsBookmarkDrawerOpen((prev) => !prev);
        }
      } else if (e.key.toLowerCase() === 'o') {
        if (focusedCardIndex >= 0 && paginatedArticles[focusedCardIndex]) {
          e.preventDefault();
          window.open(paginatedArticles[focusedCardIndex].url, '_blank');
        }
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (isBriefingOpen && briefingPlayer.isPlaying) {
          briefingPlayer.stop();
          setIsBriefingOpen(false);
        } else {
          setIsBriefingOpen(true);
          briefingPlayer.startBriefing();
        }
      } else if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setViewMode(viewMode === 'grid' ? 'compact' : 'grid');
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setLang(lang === 'vi' ? 'en' : 'vi');
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === '[') {
        e.preventDefault();
        handlePageChange(currentPage - 1);
      } else if (e.key === ']') {
        e.preventDefault();
        handlePageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    viewMode,
    lang,
    setViewMode,
    setLang,
    toggleTheme,
    currentPage,
    handlePageChange,
    focusedCardIndex,
    paginatedArticles,
    activeArticle,
    isShortcutsOpen,
    isBookmarkDrawerOpen,
    isBriefingOpen,
    briefingPlayer,
    handleOpenArticle,
    toggleBookmark,
  ]);

  const featuredArticles = useMemo(() => {
    return [...activeArticlesPool]
      .filter((a) => !isArticleOlderThanDays(a.publishedAt, 30))
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, 3);
  }, [activeArticlesPool]);

  const handleMarkAllRead = () => {
    markAllAsRead(activeArticlesPool.map((a) => a.id));
  };

  // Generate windowed pagination numbers
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 transition-colors">
      <div>
        <Navbar
          onOpenSearch={() => setIsSpotlightOpen(true)}
          onOpenBookmarks={() => setIsBookmarkDrawerOpen(true)}
          savedCount={savedArticlesCount}
          onOpenBriefing={() => {
            setIsBriefingOpen(true);
            if (!briefingPlayer.isPlaying) {
              briefingPlayer.startBriefing();
            }
          }}
          isBriefingPlaying={briefingPlayer.isPlaying && !briefingPlayer.isPaused}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Hero Bento (Only display on first page when default latest tab is selected) */}
          {currentPage === 1 &&
            sortOption === 'latest' &&
            selectedCategory === 'all' &&
            selectedOrigin === 'all' &&
            selectedMonth === 'all' &&
            !searchQuery &&
            !selectedTag &&
            timeFilter === 'all' && (
              <div className="mb-10">
                {isLoading ? (
                  <HeroSkeleton />
                ) : (
                  <HeroBento
                    articles={featuredArticles}
                    onSelectArticle={(art) => handleOpenArticle(art, false)}
                    onListen={(art) => handleOpenArticle(art, true)}
                  />
                )}
              </div>
            )}

          {/* Upgraded Category & Advanced Filters Navigation */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedOrigin={selectedOrigin}
            onSelectOrigin={setSelectedOrigin}
            totalArticlesCount={filteredArticles.length}
            archiveManifest={archiveManifest}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            readTimeFilter={readTimeFilter}
            onSelectReadTime={setReadTimeFilter}
            hotFilter={hotFilter}
            onSelectHotFilter={setHotFilter}
            availableTags={availableTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            onResetAllFilters={handleResetAllFilters}
            isFiltered={isFiltered}
            activeFiltersCount={activeFiltersCount}
          />

          {/* Real-time Tech Radar & Developer Pulse Widget */}
          <TechRadarWidget
            radarData={radarData}
            selectedTag={selectedTag}
            onSelectTag={(tag) => {
              if (tag && selectedCategory !== 'all') {
                setSelectedCategory('all');
              }
              setSelectedTag(tag);
            }}
          />

          {/* Section Header: Priority Tabs (Latest, Trending, Unread, Saved) & Layout Controls */}
          <div
            id="news-feed-container"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200/80 dark:border-white/10 scroll-mt-20"
          >
            {/* Priority & Status Tabs — Swipable on mobile */}
            <div className="w-full sm:w-auto overflow-x-auto scrollbar-none touch-pan-x pb-1 sm:pb-0">
              <div className="inline-flex items-center gap-1 p-1 bg-white dark:bg-[#11141E] rounded-xl border border-slate-200 dark:border-white/10 text-xs shadow-xs shrink-0">
                <button
                  onClick={() => setSortOption('latest')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    sortOption === 'latest'
                      ? 'bg-slate-900 text-white dark:bg-white/15 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.tabLatest}</span>
                </button>

                <button
                  onClick={() => setSortOption('trending')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    sortOption === 'trending'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{t.tabTrending}</span>
                </button>

                <button
                  onClick={() => setSortOption('forYou')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    sortOption === 'forYou'
                      ? 'bg-slate-900 text-white dark:bg-white/15 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>{t.tabForYou}</span>
                </button>

                <button
                  onClick={() => setSortOption('unread')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    sortOption === 'unread'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{t.tabUnread}</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setSortOption('saved')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    sortOption === 'saved'
                      ? 'bg-indigo-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{t.tabSaved}</span>
                  {savedArticlesCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-mono font-bold">
                      {savedArticlesCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Layout Mode Controls & Quick Mark All Read */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-2.5 py-1.5 text-xs rounded-xl font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5"
                  title={t.markAllRead}
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">{t.markAllRead}</span>
                </button>
              )}

              <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#11141E] rounded-xl border border-slate-200 dark:border-white/10 shadow-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-slate-900 text-white dark:bg-white/15 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={t.gridView}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'compact'
                      ? 'bg-slate-900 text-white dark:bg-white/15 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={t.compactView}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Audio Playlist & Quick Listen Action Bar */}
          <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-indigo-950/30 border border-emerald-500/20 dark:border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                  <span>{lang === 'vi' ? 'Trải nghiệm nghe bản tin thông minh' : 'Smart Audio Digest Experience'}</span>
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    AI Voice 0đ
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[280px] sm:max-w-md">
                  {lang === 'vi'
                    ? 'Nghe liên tục theo bộ lọc hoặc chọn từng bài vào hàng đợi cá nhân'
                    : 'Stream filtered articles continuously or curate your personal queue'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
              {/* Play Filtered News List Button */}
              {filteredArticles.length > 0 && (
                <button
                  type="button"
                  onClick={handlePlayFilteredList}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
                  title={t.playFilteredList}
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span className="truncate">{t.playFilteredList} ({filteredPlaylistCount})</span>
                </button>
              )}

              {/* Play Selected Queue Button (if queue not empty) */}
              {selectedQueueArticles.length > 0 && (
                <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={handlePlaySelectedQueue}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs shadow-sm shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse min-h-[38px]"
                    title={t.playSelectedQueue}
                  >
                    <ListMusic className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t.playSelectedQueue} ({selectedQueueArticles.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearAudioQueue}
                    className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title={t.clearAudioQueue}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Feed Content */}
          {isLoading || isMonthLoading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </div>
            )
          ) : paginatedArticles.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedArticles.map((article, idx) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    isFocused={focusedCardIndex === idx}
                    onSelectArticle={(art) => handleOpenArticle(art, false)}
                    onListen={(art) => handleOpenArticle(art, true)}
                    multiSourceInfo={multiSourceMap.get(article.id)}
                    isInAudioQueue={audioQueueIds.includes(article.id)}
                    onToggleAudioQueue={toggleAudioQueue}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedArticles.map((article, idx) => (
                  <NewsRowCompact
                    key={article.id}
                    article={article}
                    isFocused={focusedCardIndex === idx}
                    onSelectArticle={(art) => handleOpenArticle(art, false)}
                    onListen={(art) => handleOpenArticle(art, true)}
                    multiSourceInfo={multiSourceMap.get(article.id)}
                    isInAudioQueue={audioQueueIds.includes(article.id)}
                    onToggleAudioQueue={toggleAudioQueue}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                <SearchX className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                {t.noResults}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                {lang === 'vi'
                  ? 'Thử thay đổi từ khóa, mở rộng khoảng thời gian hoặc chọn danh mục khác.'
                  : 'Try searching with different keywords, widening your timeframe, or selecting another category.'}
              </p>
              {isFiltered && (
                <button
                  onClick={handleResetAllFilters}
                  className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {t.resetFilters}
                </button>
              )}
            </div>
          )}

          {/* Upgraded Pagination Bar with Linear / Daily.dev Aesthetic */}
          {filteredArticles.length > 0 && totalPages > 1 && (
            <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <div>
                  {lang === 'vi' ? 'Hiển thị' : 'Showing'}{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {startIndex + 1}
                  </span>{' '}
                  -{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {Math.min(endIndex, filteredArticles.length)}
                  </span>{' '}
                  {lang === 'vi' ? 'trên' : 'of'}{' '}
                  <span className="text-slate-900 dark:text-white font-bold">
                    {filteredArticles.length}
                  </span>{' '}
                  {lang === 'vi' ? 'bản tin' : 'articles'}
                </div>

                {/* Items Per Page Switcher */}
                <div className="hidden sm:flex items-center gap-1 pl-3 border-l border-slate-200 dark:border-white/10">
                  <span className="text-[11px] text-slate-400">{t.itemsPerPage}:</span>
                  {[12, 24].map((size) => (
                    <button
                      key={size}
                      onClick={() => setItemsPerPage(size)}
                      className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition-colors ${
                        itemsPerPage === size
                          ? 'bg-slate-900 text-white dark:bg-white/20 dark:text-white font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Full Page Buttons */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                    currentPage === 1
                      ? 'border-slate-200 dark:border-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-100 dark:bg-white/[0.02]'
                      : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500/50 bg-white dark:bg-white/[0.05]'
                  }`}
                  title={`${lang === 'vi' ? 'Trang trước' : 'Previous page'} (Phím [)`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {pageNumbers.map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1.5 text-xs text-slate-400 font-mono"
                        >
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(p);
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[34px] h-8 px-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-extrabold'
                            : 'bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                    currentPage === totalPages
                      ? 'border-slate-200 dark:border-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-100 dark:bg-white/[0.02]'
                      : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500/50 bg-white dark:bg-white/[0.05]'
                  }`}
                  title={lang === 'vi' ? 'Trang sau' : 'Next page'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Compact Pagination (< sm:): Prev | Page X / Y | Next */}
              <div className="flex sm:hidden items-center justify-between w-full pt-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 min-h-[40px] ${
                    currentPage === 1
                      ? 'border-slate-200 dark:border-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-100 dark:bg-white/[0.02]'
                      : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/[0.05]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{lang === 'vi' ? 'Trước' : 'Prev'}</span>
                </button>

                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 min-h-[40px] ${
                    currentPage === totalPages
                      ? 'border-slate-200 dark:border-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-100 dark:bg-white/[0.02]'
                      : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/[0.05]'
                  }`}
                >
                  <span>{lang === 'vi' ? 'Sau' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer lastUpdated={initialData.lastUpdated} />

      <NewsDetailModal
        article={activeArticle}
        onClose={() => {
          setActiveArticle(null);
          setAutoPlayAudio(false);
        }}
        allArticles={activeArticlesPool}
        onSelectArticle={(art) => handleOpenArticle(art, false)}
        autoPlayAudio={autoPlayAudio}
      />

      <BookmarkDrawer
        isOpen={isBookmarkDrawerOpen}
        onClose={() => setIsBookmarkDrawerOpen(false)}
        allArticles={activeArticlesPool}
        onSelectArticle={(art) => setActiveArticle(art)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <SpotlightSearchModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        articles={activeArticlesPool}
        onSelectArticle={(art) => setActiveArticle(art)}
      />

      <DailyBriefingPlayer
        articles={briefingPlayer.playlistArticles && briefingPlayer.playlistArticles.length > 0 ? briefingPlayer.playlistArticles : topBriefingArticles}
        player={briefingPlayer}
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        onOpenArticleDetail={(art) => handleOpenArticle(art, false)}
      />

      {/* Floating Shortcuts Hint Pill (Bottom-Left) */}
      <button
        onClick={() => setIsShortcutsOpen(true)}
        className="fixed bottom-5 left-4 sm:left-6 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#111522]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 shadow-lg shadow-slate-900/5 dark:shadow-black/20 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title={`${t.shortcuts} (?)`}
      >
        <Keyboard className="w-3.5 h-3.5 text-emerald-500" />
        <span className="hidden sm:inline">{t.shortcuts}</span>
        <kbd className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 rounded border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400">
          ?
        </kbd>
      </button>
    </div>
  );
};
