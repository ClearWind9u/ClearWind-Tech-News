'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { NewsItem } from '../types/news';

/**
 * Clean IT abbreviation expansion dictionary for natural Vietnamese speech
 * Avoids ridiculous transliterations (e.g. NEVER replace Docker with "Đốc-cơ" or TypeScript with "Táp-sờ-cờ-ríp").
 * Only expands acronyms that TTS engines mispronounce as native Vietnamese words (e.g. AI -> "ai").
 */
const IT_ABBREVIATIONS_VI: Record<string, string> = {
  '\\bAI\\b': 'A I',
  '\\bA\\.I\\b': 'A I',
  '\\bAPI\\b': 'A P I',
  '\\bAPIs\\b': 'A P I',
  '\\bAWS\\b': 'A W S',
  '\\bUI/UX\\b': 'U I, U X',
  '\\bUI\\b': 'U I',
  '\\bUX\\b': 'U X',
  '\\bCI/CD\\b': 'C I, C D',
  '\\bSQL\\b': 'S Q L',
  '\\bNoSQL\\b': 'No S Q L',
  '\\bLLM\\b': 'L L M',
  '\\bLLMs\\b': 'L L M',
  '\\bK8s\\b': 'Kubernetes',
  '\\bGPU\\b': 'G P U',
  '\\bGPUs\\b': 'G P U',
  '\\bCPU\\b': 'C P U',
  '\\bCPUs\\b': 'C P U',
  '\\bNode\\.js\\b': 'Node JS',
  '\\bNext\\.js\\b': 'Next JS',
  '\\bVue\\.js\\b': 'Vue JS',
  '\\b24/7\\b': 'hai mươi bốn trên bảy',
  '\\$([0-9]+(?:\\.[0-9]+)?)\\s*B\\b': '$1 tỷ đô la',
  '\\$([0-9]+(?:\\.[0-9]+)?)\\s*M\\b': '$1 triệu đô la',
  '\\$([0-9]+(?:\\.[0-9]+)?)\\s*K\\b': '$1 nghìn đô la',
  '\\$([0-9]+)': '$1 đô la',
  '([0-9]+)%': '$1 phần trăm',
  '\\bv([0-9]+)\\.([0-9]+)\\b': 'phiên bản $1 chấm $2',
};

const IT_ABBREVIATIONS_EN: Record<string, string> = {
  '\\bK8s\\b': 'Kubernetes',
  '\\bUI/UX\\b': 'U I and U X',
  '\\bCI/CD\\b': 'C I, C D',
  '\\bNode\\.js\\b': 'Node J S',
  '\\bNext\\.js\\b': 'Next J S',
  '\\bVue\\.js\\b': 'Vue J S',
  '\\b24/7\\b': 'twenty-four seven',
  '\\$([0-9]+(?:\\.[0-9]+)?)\\s*B\\b': '$1 billion dollars',
  '\\$([0-9]+(?:\\.[0-9]+)?)\\s*M\\b': '$1 million dollars',
  '\\$([0-9]+(?:\\.[0-9]+)?)\\s*K\\b': '$1 thousand dollars',
  '\\$([0-9]+)': '$1 dollars',
  '([0-9]+)%': '$1 percent',
  '\\bv([0-9]+)\\.([0-9]+)\\b': 'version $1 point $2',
};

/**
 * Normalizes technical text for natural speech synthesis
 */
export function normalizeTextForSpeech(text: string, lang: 'vi' | 'en'): string {
  if (!text) return '';
  let normalized = text;

  const dict = lang === 'vi' ? IT_ABBREVIATIONS_VI : IT_ABBREVIATIONS_EN;

  for (const [pattern, replacement] of Object.entries(dict)) {
    const regex = new RegExp(pattern, 'gi');
    normalized = normalized.replace(regex, replacement);
  }

  // Replace remaining technical symbols with natural speech pauses
  normalized = normalized
    .replace(/&/g, lang === 'vi' ? ' và ' : ' and ')
    .replace(/\+/g, lang === 'vi' ? ' cộng ' : ' plus ')
    .replace(/\//g, lang === 'vi' ? ' hoặc ' : ' or ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

/**
 * Safely splits long text into chunks under 180 characters for Google TTS streaming
 */
export function splitIntoAudioChunks(text: string, maxLength = 180): string[] {
  if (text.length <= maxLength) return [text];
  
  // Split on punctuation first
  const sentences = text.split(/(?<=[.,!?;])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLength) {
      current = current ? current + ' ' + s : s;
    } else {
      if (current) chunks.push(current.trim());
      // If single sentence is still too long, split on words
      if (s.length > maxLength) {
        const words = s.split(' ');
        let subCurrent = '';
        for (const w of words) {
          if ((subCurrent + ' ' + w).trim().length <= maxLength) {
            subCurrent = subCurrent ? subCurrent + ' ' + w : w;
          } else {
            if (subCurrent) chunks.push(subCurrent.trim());
            subCurrent = w;
          }
        }
        if (subCurrent) current = subCurrent;
      } else {
        current = s;
      }
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text.slice(0, maxLength)];
}

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  playbackRate: number;
  currentTakeawayIndex: number | null; // -1 for intro, 0..N for takeaways, null when idle
  speak: (title: string, takeaways: string[], sourceName?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  cyclePlaybackRate: () => void;
}

/**
 * Custom React hook providing authentic "Chị Google" audio digest
 * Uses streaming Google Translate TTS API as primary engine with Web Speech API fallback.
 */
export function useTextToSpeech(lang: 'vi' | 'en'): UseSpeechSynthesisReturn {
  const [isSupported, setIsSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [currentTakeawayIndex, setCurrentTakeawayIndex] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<{ text: string; index: number }[]>([]);
  const currentIndexRef = useRef<number>(0);
  const isCanceledRef = useRef<boolean>(false);
  const currentRateRef = useRef<number>(1);

  // Sync playback rate ref
  useEffect(() => {
    currentRateRef.current = playbackRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Stop playback completely
  const stop = useCallback(() => {
    isCanceledRef.current = true;
    queueRef.current = [];
    currentIndexRef.current = 0;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTakeawayIndex(null);
  }, []);

  // Stop when unmounting or switching language
  useEffect(() => {
    return () => {
      stop();
    };
  }, [lang, stop]);

  // Pause playback
  const pause = useCallback(() => {
    if (audioRef.current && isPlaying && !isPaused) {
      audioRef.current.pause();
      setIsPaused(true);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  // Resume playback
  const resume = useCallback(() => {
    if (audioRef.current && isPlaying && isPaused) {
      audioRef.current.play().catch(() => {});
      setIsPaused(false);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPlaying, isPaused]);

  // Cycle speed: 1x -> 1.25x -> 1.5x
  const cyclePlaybackRate = useCallback(() => {
    const rates = [1, 1.25, 1.5];
    setPlaybackRate((prev) => {
      const nextIndex = (rates.indexOf(prev) + 1) % rates.length;
      return rates[nextIndex];
    });
  }, []);

  // Plays a single audio segment via Chị Google /api/tts
  const playNextSegment = useCallback(() => {
    if (isCanceledRef.current) return;

    if (currentIndexRef.current >= queueRef.current.length) {
      stop();
      return;
    }

    const segment = queueRef.current[currentIndexRef.current];
    setCurrentTakeawayIndex(segment.index >= 0 ? segment.index : segment.index === -1 ? -1 : null);

    const audioUrl = `/api/tts?text=${encodeURIComponent(segment.text)}&lang=${lang}`;
    const audio = new Audio(audioUrl);
    audio.playbackRate = currentRateRef.current;
    audioRef.current = audio;

    audio.onended = () => {
      if (isCanceledRef.current) return;
      currentIndexRef.current += 1;
      playNextSegment();
    };

    audio.onerror = () => {
      // Fallback: If /api/tts fails or network error, skip to next or fallback
      console.warn('[Audio Digest] Segment failed, moving to next segment');
      if (isCanceledRef.current) return;
      currentIndexRef.current += 1;
      playNextSegment();
    };

    audio.play().catch((err) => {
      console.warn('[Audio Digest play error]', err);
      // Auto advance on autoplay prevention
      if (!isCanceledRef.current) {
        currentIndexRef.current += 1;
        playNextSegment();
      }
    });
  }, [lang, stop]);

  // Main speak trigger
  const speak = useCallback(
    (title: string, takeaways: string[], sourceName?: string) => {
      stop();
      isCanceledRef.current = false;

      // Construct sequential script
      const flatSegments: { text: string; index: number }[] = [];

      // 1. Intro
      const introRaw =
        lang === 'vi'
          ? `${sourceName ? `Bản tin từ ${sourceName}. ` : ''}${title}. Tóm tắt cốt lõi gồm có:`
          : `${sourceName ? `Report from ${sourceName}. ` : ''}${title}. Here are the key technical takeaways:`;
      const introNormalized = normalizeTextForSpeech(introRaw, lang);
      splitIntoAudioChunks(introNormalized, 180).forEach((chunk) => {
        flatSegments.push({ text: chunk, index: -1 });
      });

      // 2. Takeaways
      takeaways.forEach((point, i) => {
        const prefix =
          lang === 'vi'
            ? `Điểm thứ ${i === 0 ? 'nhất' : i === 1 ? 'hai' : i === 2 ? 'ba' : i + 1}: `
            : `Key point ${i + 1}: `;
        const takeawayNormalized = normalizeTextForSpeech(prefix + point, lang);
        splitIntoAudioChunks(takeawayNormalized, 180).forEach((chunk) => {
          flatSegments.push({ text: chunk, index: i });
        });
      });

      // 3. Outro
      const outroRaw = lang === 'vi' ? 'Hết phần tóm tắt.' : 'End of technical summary.';
      flatSegments.push({ text: outroRaw, index: -2 });

      queueRef.current = flatSegments;
      currentIndexRef.current = 0;
      setIsPlaying(true);
      setIsPaused(false);

      playNextSegment();
    },
    [lang, stop, playNextSegment]
  );

  return {
    isSupported,
    isPlaying,
    isPaused,
    playbackRate,
    currentTakeawayIndex,
    speak,
    pause,
    resume,
    stop,
    cyclePlaybackRate,
  };
}

export interface UseDailyBriefingReturn {
  isPlaying: boolean;
  isPaused: boolean;
  playbackRate: number;
  currentStoryIndex: number;
  currentTakeawayIndex: number | null;
  startBriefing: (startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextStory: () => void;
  prevStory: () => void;
  jumpToStory: (index: number) => void;
  cyclePlaybackRate: () => void;
}

interface BriefingSegment {
  text: string;
  storyIndex: number;
  takeawayIndex: number; // -3 for main intro, -1 for story intro, 0..N for takeaways, -2 for outro
}

/**
 * Continuous playlist audio synthesizer for 3-minute morning briefing / 24/7 tech radio.
 * Chains top articles into a unified, seamless podcast stream.
 */
export function useDailyBriefingPlaylist(
  articles: NewsItem[],
  lang: 'vi' | 'en'
): UseDailyBriefingReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const [currentTakeawayIndex, setCurrentTakeawayIndex] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<BriefingSegment[]>([]);
  const currentIndexRef = useRef<number>(0);
  const isCanceledRef = useRef<boolean>(false);
  const currentRateRef = useRef<number>(1);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync playback rate
  useEffect(() => {
    currentRateRef.current = playbackRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Stop playback cleanly
  const stop = useCallback(() => {
    isCanceledRef.current = true;
    queueRef.current = [];
    currentIndexRef.current = 0;

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.src = '';
      audioRef.current = null;
    }

    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTakeawayIndex(null);
  }, []);

  // Cleanup on unmount or language change
  useEffect(() => {
    return () => {
      stop();
    };
  }, [lang, stop]);

  // Pause playback
  const pause = useCallback(() => {
    if (audioRef.current && isPlaying && !isPaused) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  // Resume playback
  const resume = useCallback(() => {
    if (audioRef.current && isPlaying && isPaused) {
      audioRef.current.play().catch(() => {});
      setIsPaused(false);
    }
  }, [isPlaying, isPaused]);

  // Cycle speed: 1x -> 1.25x -> 1.5x
  const cyclePlaybackRate = useCallback(() => {
    const rates = [1, 1.25, 1.5];
    setPlaybackRate((prev) => {
      const nextIndex = (rates.indexOf(prev) + 1) % rates.length;
      return rates[nextIndex];
    });
  }, []);

  // Builds audio queue segments from a specific start story index
  const buildQueue = useCallback(
    (startIndex: number) => {
      const segments: BriefingSegment[] = [];
      const validArticles = articles.slice(startIndex);
      if (validArticles.length === 0) return segments;

      // 1. Overall podcast intro if starting from beginning
      if (startIndex === 0) {
        const podcastIntro =
          lang === 'vi'
            ? `Chào buổi sáng! Đây là bản tin công nghệ 3 phút của ClearWind Tech News. Sau đây là ${articles.length} bài viết đáng chú ý nhất hôm nay.`
            : `Good morning! Welcome to ClearWind 3-minute tech audio briefing. Here are today's top ${articles.length} stories.`;
        const normalizedIntro = normalizeTextForSpeech(podcastIntro, lang);
        splitIntoAudioChunks(normalizedIntro, 180).forEach((chunk) => {
          segments.push({ text: chunk, storyIndex: 0, takeawayIndex: -3 });
        });
      }

      // 2. Loop through articles
      validArticles.forEach((article, offset) => {
        const sIndex = startIndex + offset;
        const title =
          (lang === 'vi' ? article.title_vi : article.title_en) ||
          article.title_vi ||
          article.originalTitle ||
          '';
        const takeaways =
          (lang === 'vi' ? article.summary_vi : article.summary_en) ||
          article.summary_vi ||
          [];

        // Article header
        const storyHeader =
          lang === 'vi'
            ? `Tin số ${sIndex + 1}. Nguồn từ ${article.sourceName}. ${title}. Tóm tắt gồm có:`
            : `Story number ${sIndex + 1}. From ${article.sourceName}. ${title}. Key takeaways:`;
        const normalizedHeader = normalizeTextForSpeech(storyHeader, lang);
        splitIntoAudioChunks(normalizedHeader, 180).forEach((chunk) => {
          segments.push({ text: chunk, storyIndex: sIndex, takeawayIndex: -1 });
        });

        // Takeaways
        takeaways.forEach((pt, pIdx) => {
          const prefix =
            lang === 'vi'
              ? `Điểm thứ ${pIdx === 0 ? 'nhất' : pIdx === 1 ? 'hai' : pIdx === 2 ? 'ba' : pIdx + 1}: `
              : `Point ${pIdx + 1}: `;
          const normalizedPt = normalizeTextForSpeech(prefix + pt, lang);
          splitIntoAudioChunks(normalizedPt, 180).forEach((chunk) => {
            segments.push({ text: chunk, storyIndex: sIndex, takeawayIndex: pIdx });
          });
        });
      });

      // 3. Outro
      const outro =
        lang === 'vi'
          ? 'Bản tin sáng 3 phút kết thúc. Chúc bạn một ngày làm việc và lập trình hiệu quả!'
          : 'That concludes today 3-minute tech briefing. Have an awesome and productive day!';
      splitIntoAudioChunks(outro, 180).forEach((chunk) => {
        segments.push({
          text: chunk,
          storyIndex: articles.length - 1,
          takeawayIndex: -2,
        });
      });

      return segments;
    },
    [articles, lang]
  );

  // Play next segment
  const playNextSegment = useCallback(() => {
    if (isCanceledRef.current) return;

    if (currentIndexRef.current >= queueRef.current.length) {
      stop();
      return;
    }

    const segment = queueRef.current[currentIndexRef.current];
    setCurrentStoryIndex(segment.storyIndex);
    setCurrentTakeawayIndex(
      segment.takeawayIndex >= 0 ? segment.takeawayIndex : segment.takeawayIndex === -1 ? -1 : null
    );

    const audioUrl = `/api/tts?text=${encodeURIComponent(segment.text)}&lang=${lang}`;
    const audio = new Audio(audioUrl);
    audio.playbackRate = currentRateRef.current;
    audioRef.current = audio;

    const advance = () => {
      if (isCanceledRef.current) return;
      currentIndexRef.current += 1;

      // Check if transitioning to a new story
      const nextSeg = queueRef.current[currentIndexRef.current];
      const isNewStory = nextSeg && nextSeg.storyIndex !== segment.storyIndex;

      if (isNewStory) {
        // Natural 400ms pause between stories
        transitionTimerRef.current = setTimeout(() => {
          playNextSegment();
        }, 400);
      } else {
        playNextSegment();
      }
    };

    audio.onended = () => {
      advance();
    };

    audio.onerror = () => {
      advance();
    };

    audio.play().catch((err) => {
      console.warn('[Daily Briefing Audio play error]', err);
      if (!isCanceledRef.current) {
        advance();
      }
    });
  }, [lang, stop]);

  // Start briefing
  const startBriefing = useCallback(
    (startIndex = 0) => {
      stop();
      if (!articles || articles.length === 0) return;

      const safeStartIndex = Math.max(0, Math.min(startIndex, articles.length - 1));
      const segments = buildQueue(safeStartIndex);
      if (segments.length === 0) return;

      isCanceledRef.current = false;
      queueRef.current = segments;
      currentIndexRef.current = 0;
      setCurrentStoryIndex(safeStartIndex);
      setIsPlaying(true);
      setIsPaused(false);

      playNextSegment();
    },
    [articles, buildQueue, stop, playNextSegment]
  );

  // Jump to specific story
  const jumpToStory = useCallback(
    (targetIndex: number) => {
      startBriefing(targetIndex);
    },
    [startBriefing]
  );

  // Next story
  const nextStory = useCallback(() => {
    if (currentStoryIndex < articles.length - 1) {
      jumpToStory(currentStoryIndex + 1);
    } else {
      stop();
    }
  }, [currentStoryIndex, articles.length, jumpToStory, stop]);

  // Prev story
  const prevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      jumpToStory(currentStoryIndex - 1);
    } else {
      jumpToStory(0);
    }
  }, [currentStoryIndex, jumpToStory]);

  return {
    isPlaying,
    isPaused,
    playbackRate,
    currentStoryIndex,
    currentTakeawayIndex,
    startBriefing,
    pause,
    resume,
    stop,
    nextStory,
    prevStory,
    jumpToStory,
    cyclePlaybackRate,
  };
}
