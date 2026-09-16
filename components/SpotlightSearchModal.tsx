'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NewsItem, getCategoryLabel } from '@/types/news';
import { useBilingual } from './BilingualContext';
import { Search, X, TrendingUp, CornerDownLeft, Hash } from 'lucide-react';

// Category accent colors — used ONLY inside category chips, never on chrome
const CATEGORY_ACCENTS: Record<string, { dot: string; label: string }> = {
  'AI & Machine Learning':    { dot: '#57c1ff', label: 'AI' },
  'Software Engineering':     { dot: '#59d499', label: 'Eng' },
  'DevOps & Cloud':           { dot: '#ffc533', label: 'Cloud' },
  'Cybersecurity':            { dot: '#ff6161', label: 'Sec' },
  'Mobile & Web':             { dot: '#a78bfa', label: 'Web' },
  'Tech Trends & Startups':   { dot: '#f472b6', label: 'Trend' },
};

function getCategoryAccent(cat: string) {
  return CATEGORY_ACCENTS[cat] ?? { dot: '#9c9c9d', label: cat.slice(0, 4) };
}

interface SpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
}

export const SpotlightSearchModal: React.FC<SpotlightSearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle,
}) => {
  const { lang, t, setSelectedTag } = useBilingual();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Popular tech tags for empty-state discovery
  const trendingTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    articles.forEach((a) => {
      a.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [articles]);

  // Filter articles based on query and category
  const filteredArticles = useMemo(() => {
    let result = articles;

    if (selectedCategory !== 'all') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter((a) => {
        const titleMatch =
          a.title_vi?.toLowerCase().includes(q) ||
          a.title_en?.toLowerCase().includes(q) ||
          a.originalTitle?.toLowerCase().includes(q);
        const sourceMatch = a.sourceName?.toLowerCase().includes(q);
        const tagMatch = a.tags?.some((t) => t.toLowerCase().includes(q));
        const summaryMatch =
          a.summary_vi?.some((s) => s.toLowerCase().includes(q)) ||
          a.summary_en?.some((s) => s.toLowerCase().includes(q));
        return titleMatch || sourceMatch || tagMatch || summaryMatch;
      });
    } else {
      result = [...result].sort((a, b) => b.hotScore - a.hotScore).slice(0, 7);
    }

    return result.slice(0, 8); // Top 8 results for ultra-fast browsing
  }, [articles, query, selectedCategory]);

  // Reset selection index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Auto focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedCategory('all');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredArticles.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredArticles.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredArticles[selectedIndex]) {
          onSelectArticle(filteredArticles[selectedIndex]);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredArticles, selectedIndex, onSelectArticle, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const activeItem = listEl.children[selectedIndex] as HTMLElement;
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const scopeCategories = [
    'AI & Machine Learning',
    'Software Engineering',
    'DevOps & Cloud',
    'Cybersecurity',
    'Mobile & Web',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[12vh] px-4">
      {/* Raycast-style backdrop: near-black + subtle blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Command Palette Window — Raycast surface ladder */}
      <div
        className="relative w-full max-w-[640px] z-10 flex flex-col overflow-hidden"
        style={{
          background: '#131417',
          border: '1px solid #242728',
          borderRadius: '12px',
          maxHeight: '72vh',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Search Input Row ── */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: '1px solid #242728' }}
        >
          <Search className="w-[15px] h-[15px] shrink-0" style={{ color: '#6a6b6c' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'vi'
                ? 'Tìm kiếm bản tin công nghệ...'
                : 'Search tech news...'
            }
            className="flex-1 bg-transparent text-[15px] focus:outline-none"
            style={{
              color: '#f4f4f6',
              caretColor: '#f4f4f6',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontFeatureSettings: '"calt","kern","liga","ss03"',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="shrink-0 p-1 rounded transition-colors"
              style={{ color: '#6a6b6c' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {/* ESC Keycap — Raycast signature */}
          <kbd
            className="shrink-0 px-1.5 py-0.5 rounded text-[11px] font-medium"
            style={{
              background: 'linear-gradient(180deg, #1e1e20 0%, #161618 100%)',
              border: '1px solid #2e2e30',
              color: '#6a6b6c',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* ── Scope Filter Pills (Raycast pill-tab style) ── */}
        <div
          className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-none"
          style={{ borderBottom: '1px solid #1c1c1e' }}
        >
          <button
            onClick={() => setSelectedCategory('all')}
            className="shrink-0 px-2.5 py-1 rounded-full text-[13px] transition-all"
            style={{
              background: selectedCategory === 'all' ? '#1e1f22' : 'transparent',
              color: selectedCategory === 'all' ? '#f4f4f6' : '#6a6b6c',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: selectedCategory === 'all' ? 500 : 400,
            }}
          >
            {t.allCategories ?? 'All'}
          </button>
          {scopeCategories.map((cat) => {
            const accent = getCategoryAccent(cat);
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isActive ? 'all' : cat)}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] transition-all"
                style={{
                  background: isActive ? '#1e1f22' : 'transparent',
                  color: isActive ? '#f4f4f6' : '#6a6b6c',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: accent.dot, opacity: isActive ? 1 : 0.55 }}
                />
                {getCategoryLabel(cat, lang)}
              </button>
            );
          })}
        </div>

        {/* ── Results Body ── */}
        <div
          className="flex-1 overflow-y-auto p-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#2e2e30 transparent' }}
        >
          {/* Empty state: Trending tags */}
          {!query && (
            <div className="px-2 pt-1 pb-2 mb-1" style={{ borderBottom: '1px solid #1c1c1e' }}>
              <div
                className="flex items-center gap-1.5 mb-2 px-1"
                style={{
                  color: '#434345',
                  fontSize: '11px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <TrendingUp className="w-3 h-3" />
                <span>{lang === 'vi' ? 'Chủ đề nổi bật' : 'Trending'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      setSelectedTag(tag);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[12px] transition-colors"
                    style={{
                      background: '#1a1b1e',
                      border: '1px solid #2a2b2e',
                      color: '#9c9c9d',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    <Hash className="w-3 h-3" style={{ color: '#6a6b6c' }} />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section label */}
          <div
            className="px-3 py-1 mb-0.5"
            style={{
              color: '#434345',
              fontSize: '11px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {query
              ? `${filteredArticles.length} ${lang === 'vi' ? 'kết quả' : 'results'}`
              : lang === 'vi'
              ? 'Nổi bật hôm nay'
              : 'Featured Today'}
          </div>

          {/* Result rows */}
          {filteredArticles.length === 0 ? (
            <div className="py-10 text-center">
              <Search className="w-7 h-7 mx-auto mb-2 opacity-20" style={{ color: '#6a6b6c' }} />
              <p
                className="text-sm"
                style={{ color: '#6a6b6c', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                {lang === 'vi' ? 'Không tìm thấy bản tin nào.' : 'No articles found.'}
              </p>
            </div>
          ) : (
            <div ref={listRef}>
              {filteredArticles.map((article, idx) => {
                const title =
                  (lang === 'vi' ? article.title_vi : article.title_en) ??
                  article.title_vi ??
                  article.originalTitle;
                const isSelected = idx === selectedIndex;
                const accent = getCategoryAccent(article.category ?? '');

                return (
                  <div
                    key={article.id}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      onSelectArticle(article);
                      onClose();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all"
                    style={{
                      background: isSelected ? '#1e1f22' : 'transparent',
                      borderRadius: '6px',
                    }}
                  >
                    {/* Category accent tile */}
                    <div
                      className="w-7 h-7 rounded shrink-0 flex items-center justify-center"
                      style={{
                        background: '#1a1b1e',
                        border: '1px solid #2a2b2e',
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: accent.dot }}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="mb-0.5 flex items-center gap-1.5"
                        style={{
                          color: '#9c9c9d',
                          fontSize: '11px',
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                      >
                        <span style={{ color: '#cdcdcd', fontWeight: 500 }}>
                          {article.sourceName}
                        </span>
                        <span style={{ color: '#434345' }}>·</span>
                        <span style={{ color: accent.dot, opacity: 0.9 }}>
                          {accent.label}
                        </span>
                      </div>
                      <div
                        className="truncate"
                        style={{
                          color: isSelected ? '#f4f4f6' : '#cdcdcd',
                          fontSize: '14px',
                          fontWeight: 500,
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontFeatureSettings: '"calt","kern","liga","ss03"',
                          lineHeight: 1.4,
                        }}
                      >
                        {title}
                      </div>
                    </div>

                    {/* Enter hint when selected */}
                    {isSelected && (
                      <kbd
                        className="shrink-0 flex items-center px-1.5 py-0.5 rounded text-[11px] gap-0.5"
                        style={{
                          background: 'linear-gradient(180deg, #1e1f22 0%, #191a1d 100%)',
                          border: '1px solid #2e2e30',
                          color: '#6a6b6c',
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                      >
                        <CornerDownLeft className="w-3 h-3" />
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer Keyboard Hints — Raycast keycap style ── */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{
            borderTop: '1px solid #1c1c1e',
            background: '#0f1012',
          }}
        >
          <div className="flex items-center gap-3">
            {[
              { key: '↑↓', label: lang === 'vi' ? 'Điều hướng' : 'Navigate' },
              { key: '↵',  label: lang === 'vi' ? 'Mở bài' : 'Open' },
            ].map(({ key, label }) => (
              <span
                key={key}
                className="flex items-center gap-1.5"
                style={{ color: '#434345', fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                <kbd
                  className="px-1.5 py-0.5 rounded text-[11px]"
                  style={{
                    background: 'linear-gradient(180deg, #1e1e20 0%, #161618 100%)',
                    border: '1px solid #2e2e30',
                    color: '#6a6b6c',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  {key}
                </kbd>
                <span>{label}</span>
              </span>
            ))}
          </div>
          <span
            className="flex items-center gap-1.5"
            style={{ color: '#434345', fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            <kbd
              className="px-1.5 py-0.5 rounded text-[11px]"
              style={{
                background: 'linear-gradient(180deg, #1e1e20 0%, #161618 100%)',
                border: '1px solid #2e2e30',
                color: '#6a6b6c',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              ESC
            </kbd>
            <span>{lang === 'vi' ? 'Đóng' : 'Close'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
