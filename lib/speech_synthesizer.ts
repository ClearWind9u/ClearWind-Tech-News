'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { NewsItem } from '../types/news';

/**
 * Clean IT abbreviation expansion dictionary for natural Vietnamese speech
 * Avoids ridiculous transliterations (e.g. NEVER replace Docker with "Đốc-cơ" or TypeScript with "Táp-sờ-cờ-ríp").
 * Only expands acronyms that TTS engines mispronounce as native Vietnamese words (e.g. AI -> "ai").
 */
/**
 * Clean IT abbreviation expansion dictionary for natural Vietnamese speech
 * Expands technical acronyms to natural Vietnamese developer pronunciation (e.g. API -> "ây pi ai", AI -> "ây ai").
 */
const IT_ABBREVIATIONS_VI: Record<string, string> = {
  // Common Developer Acronyms - Pronounced naturally in Vietnamese tech jargon
  '\\bAPIs\\b': 'các ây pi ai',
  '\\bAPI\\b': 'ây pi ai',
  '\\bA\\.I\\b': 'ây ai',
  '\\bAI\\b': 'ây ai',
  '\\bUI/UX\\b': 'du ai, du ích',
  '\\bUI\\b': 'du ai',
  '\\bUX\\b': 'du ích',
  '\\bCI/CD\\b': 'xi ai, xi đi',
  '\\bAWS\\b': 'ây đắp bờ liu ét',
  '\\bGCP\\b': 'gi xi pi',
  '\\bSQL\\b': 'ét quy eo',
  '\\bNoSQL\\b': 'nô ét quy eo',
  '\\bLLMs\\b': 'các mô hình eo eo em',
  '\\bLLM\\b': 'eo eo em',
  '\\bGPUs\\b': 'các chip gi pi u',
  '\\bGPU\\b': 'gi pi u',
  '\\bCPUs\\b': 'các chip xi pi u',
  '\\bCPU\\b': 'xi pi u',
  '\\bNPUs\\b': 'các chip en pi u',
  '\\bNPU\\b': 'en pi u',
  '\\bSDKs\\b': 'các bộ ét đê ca',
  '\\bSDK\\b': 'ét đê ca',
  '\\bIDE\\b': 'ai đi i',
  '\\bCLI\\b': 'xi eo ai',
  '\\bGUI\\b': 'gui',
  '\\bSaaS\\b': 'sa-át',
  '\\bPaaS\\b': 'pa-át',
  '\\bIaaS\\b': 'ai-át',
  '\\bIoT\\b': 'ai ô ti',
  '\\bVR\\b': 'thực tế ảo vi a',
  '\\bAR\\b': 'thực tế tăng cường ây a',
  '\\bPRs\\b': 'các pu rí quét',
  '\\bPR\\b': 'pu rí quét',
  '\\bIPv6\\b': 'ai pi v6',
  '\\bIPv4\\b': 'ai pi v4',
  '\\bIP\\b': 'ai pi',
  '\\bURLs\\b': 'các đường dẫn u rờ lờ',
  '\\bURL\\b': 'đường dẫn u rờ lờ',
  '\\bHTTPS\\b': 'hát tê tê pê ét',
  '\\bHTTP\\b': 'hát tê tê pê',
  '\\bDNS\\b': 'đê en ét',
  '\\bmacOS\\b': 'mác ô ét',
  '\\biOS\\b': 'ai ô ét',
  '\\bOS\\b': 'ô ét',
  '\\bK8s\\b': 'Kubernetes',
  '\\bDevOps\\b': 'Đép-ọp',
  '\\bOpenAI\\b': 'Open ây ai',
  '\\bDeepSeek\\b': 'Đíp-xích',
  '\\bChatGPT\\b': 'Chát di pi ti',
  '\\bGPT-4o\\b': 'di pi ti bốn ô',
  '\\bGPT-4\\b': 'di pi ti bốn',
  '\\bGPT-3\\.5\\b': 'di pi ti ba chấm năm',
  '\\bGPT\\b': 'di pi ti',
  '\\bNode\\.js\\b': 'Node JS',
  '\\bNext\\.js\\b': 'Next JS',
  '\\bVue\\.js\\b': 'Vue JS',
  '\\bReact\\.js\\b': 'React JS',
  '\\bGitHub\\b': 'Gít-hắp',
  '\\bGitLab\\b': 'Gít-láp',
  '\\bSSD\\b': 'ét ét đê',
  '\\bHDD\\b': 'hát đê đê',
  '\\bRAM\\b': 'ram',
  '\\bROM\\b': 'rom',
  '\\b24/7\\b': 'hai mươi bốn trên bảy',

  // Currency & Quantities
  '\\$([0-9]+(?:[\\.,][0-9]+)?)\\s*B\\b': '$1 tỷ đô la',
  '\\$([0-9]+(?:[\\.,][0-9]+)?)\\s*M\\b': '$1 triệu đô la',
  '\\$([0-9]+(?:[\\.,][0-9]+)?)\\s*K\\b': '$1 nghìn đô la',
  '\\$([0-9]+)': '$1 đô la',
  '([0-9]+)%': '$1 phần trăm',
  '\\bv([0-9]+)\\.([0-9]+)\\b': 'phiên bản $1 chấm $2',
};

const IT_ABBREVIATIONS_EN: Record<string, string> = {
  '\\bAPIs\\b': 'A-P-Is',
  '\\bAPI\\b': 'A-P-I',
  '\\bAWS\\b': 'A-W-S',
  '\\bGCP\\b': 'G-C-P',
  '\\bUI/UX\\b': 'U-I and U-X',
  '\\bUI\\b': 'U-I',
  '\\bUX\\b': 'U-X',
  '\\bCI/CD\\b': 'C-I, C-D',
  '\\bLLMs\\b': 'L-L-Ms',
  '\\bLLM\\b': 'L-L-M',
  '\\bGPUs\\b': 'G-P-Us',
  '\\bGPU\\b': 'G-P-U',
  '\\bCPUs\\b': 'C-P-Us',
  '\\bCPU\\b': 'C-P-U',
  '\\bSQL\\b': 'S-Q-L',
  '\\bNoSQL\\b': 'No-S-Q-L',
  '\\bSDKs\\b': 'S-D-Ks',
  '\\bSDK\\b': 'S-D-K',
  '\\bIDE\\b': 'I-D-E',
  '\\bCLI\\b': 'C-L-I',
  '\\bGUI\\b': 'G-U-I',
  '\\bK8s\\b': 'Kubernetes',
  '\\bNode\\.js\\b': 'Node J-S',
  '\\bNext\\.js\\b': 'Next J-S',
  '\\bVue\\.js\\b': 'Vue J-S',
  '\\bReact\\.js\\b': 'React J-S',
  '\\b24/7\\b': 'twenty-four seven',
  '\\$([0-9]+(?:[\\.,][0-9]+)?)\\s*B\\b': '$1 billion dollars',
  '\\$([0-9]+(?:[\\.,][0-9]+)?)\\s*M\\b': '$1 million dollars',
  '\\$([0-9]+(?:[\\.,][0-9]+)?)\\s*K\\b': '$1 thousand dollars',
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

  // Clean markdown and HTML remnants
  normalized = normalized
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[ATTACH\]/gi, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const dict = lang === 'vi' ? IT_ABBREVIATIONS_VI : IT_ABBREVIATIONS_EN;

  for (const [pattern, replacement] of Object.entries(dict)) {
    const regex = new RegExp(pattern, 'g');
    normalized = normalized.replace(regex, replacement);
  }

  // Replace remaining technical symbols with natural speech pauses
  normalized = normalized
    .replace(/&/g, lang === 'vi' ? ' và ' : ' and ')
    .replace(/\+/g, lang === 'vi' ? ' cộng ' : ' plus ')
    .replace(/\//g, lang === 'vi' ? ' hoặc ' : ' or ')
    .replace(/\s+/g, ' ')
    .trim();

  // Natural pause improvements: Add commas after introductory clauses for rhythm
  if (lang === 'vi') {
    normalized = normalized
      .replace(/^(Tin số \d+)\.\s*/i, '$1, ')
      .replace(/^(Điểm thứ (?:nhất|hai|ba|\d+)):\s*/i, '$1, ');
  } else {
    normalized = normalized
      .replace(/^(Story number \d+)\.\s*/i, '$1, ')
      .replace(/^(Point \d+):\s*/i, '$1, ');
  }

  return normalized;
}

/**
 * Hierarchical clause-aware chunker under 175 characters for natural speech cadence
 */
export function splitIntoAudioChunks(text: string, maxLength = 175): string[] {
  if (!text) return [];
  if (text.length <= maxLength) return [text];

  // 1. Split on major sentence terminators (. ! ?)
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLength) {
      current = current ? (current + ' ' + s).trim() : s.trim();
    } else {
      if (current) chunks.push(current);

      if (s.length <= maxLength) {
        current = s.trim();
      } else {
        // 2. Sentence is longer than maxLength -> split on clause boundaries (commas, semicolons, dashes)
        const clauses = s.split(/(?<=[,;–—])\s+/).filter((c) => c.trim().length > 0);
        let subCurrent = '';

        for (const c of clauses) {
          if ((subCurrent + ' ' + c).trim().length <= maxLength) {
            subCurrent = subCurrent ? (subCurrent + ' ' + c).trim() : c.trim();
          } else {
            if (subCurrent) chunks.push(subCurrent);

            if (c.length <= maxLength) {
              subCurrent = c.trim();
            } else {
              // 3. Clause still too long -> split on words
              const words = c.split(' ');
              let wordCurrent = '';
              for (const w of words) {
                if ((wordCurrent + ' ' + w).trim().length <= maxLength) {
                  wordCurrent = wordCurrent ? (wordCurrent + ' ' + w).trim() : w;
                } else {
                  if (wordCurrent) chunks.push(wordCurrent);
                  wordCurrent = w;
                }
              }
              subCurrent = wordCurrent;
            }
          }
        }
        current = subCurrent;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text.slice(0, maxLength)];
}

/**
 * Global Audio Coordinator (Singleton)
 * Guarantees STRICT EXCLUSIVITY across all audio sources in the application:
 * - Only ONE voice can ever speak at any given millisecond.
 * - Prevents race conditions, overlapping voices, and exponential advance loops.
 */
class GlobalAudioManager {
  private static activeStopCallback: (() => void) | null = null;
  private static activeAudio: HTMLAudioElement | null = null;
  private static activeToken = 0;

  public static nextToken(): number {
    this.activeToken += 1;
    return this.activeToken;
  }

  public static isTokenActive(token: number): boolean {
    return token === this.activeToken;
  }

  public static registerPlayback(stopCallback: () => void, audio?: HTMLAudioElement): number {
    // If another player is active, immediately silence and stop it
    if (this.activeStopCallback && this.activeStopCallback !== stopCallback) {
      try {
        this.activeStopCallback();
      } catch (err) {
        console.warn('[GlobalAudioManager] Error stopping previous playback:', err);
      }
    }

    if (this.activeAudio && this.activeAudio !== audio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.onended = null;
        this.activeAudio.onerror = null;
        this.activeAudio.src = '';
      } catch {}
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.activeStopCallback = stopCallback;
    this.activeAudio = audio ?? null;
    return this.nextToken();
  }

  public static updateActiveAudio(audio: HTMLAudioElement | null) {
    if (this.activeAudio && this.activeAudio !== audio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.onended = null;
        this.activeAudio.onerror = null;
        this.activeAudio.src = '';
      } catch {}
    }
    this.activeAudio = audio;
  }

  public static stopAll() {
    this.activeToken += 1;
    if (this.activeStopCallback) {
      const cb = this.activeStopCallback;
      this.activeStopCallback = null;
      try {
        cb();
      } catch {}
    }
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.onended = null;
        this.activeAudio.onerror = null;
        this.activeAudio.src = '';
      } catch {}
      this.activeAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
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
  const playTokenRef = useRef<number>(0);

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
    playTokenRef.current = GlobalAudioManager.nextToken();
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
    const currentToken = playTokenRef.current;
    if (isCanceledRef.current || !GlobalAudioManager.isTokenActive(currentToken)) return;

    if (currentIndexRef.current >= queueRef.current.length) {
      stop();
      return;
    }

    const segment = queueRef.current[currentIndexRef.current];
    setCurrentTakeawayIndex(segment.index >= 0 ? segment.index : segment.index === -1 ? -1 : null);

    // Clean up previous audio instance before allocating new one
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.src = '';
      audioRef.current = null;
    }

    const audioUrl = `/api/tts?text=${encodeURIComponent(segment.text)}&lang=${lang}`;
    const audio = new Audio(audioUrl);
    audio.playbackRate = currentRateRef.current;
    audioRef.current = audio;
    GlobalAudioManager.updateActiveAudio(audio);

    let didAdvance = false;
    const safeAdvance = () => {
      if (didAdvance) return;
      didAdvance = true;
      audio.onended = null;
      audio.onerror = null;
      if (isCanceledRef.current || !GlobalAudioManager.isTokenActive(currentToken)) return;
      currentIndexRef.current += 1;
      playNextSegment();
    };

    audio.onended = () => {
      safeAdvance();
    };

    audio.onerror = () => {
      // Fallback: If /api/tts fails or network error, skip to next or fallback
      console.warn('[Audio Digest] Segment failed, moving to next segment');
      safeAdvance();
    };

    audio.play().catch((err) => {
      // If playback was aborted by another play() or cancel, do not advance!
      if (err?.name === 'AbortError') {
        return;
      }
      console.warn('[Audio Digest play error]', err);
      safeAdvance();
    });
  }, [lang, stop]);

  // Main speak trigger
  const speak = useCallback(
    (title: string, takeaways: string[], sourceName?: string) => {
      stop();
      isCanceledRef.current = false;
      const newToken = GlobalAudioManager.registerPlayback(stop);
      playTokenRef.current = newToken;

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
  playlistTitle: string;
  playlistArticles: NewsItem[];
  startBriefing: (startIndex?: number) => void;
  playCustomList: (customArticles: NewsItem[], customTitle?: string, startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextStory: () => void;
  prevStory: () => void;
  jumpToStory: (index: number) => void;
  cyclePlaybackRate: () => void;
  removeFromPlaylist: (articleId: string) => void;
}

interface BriefingSegment {
  text: string;
  storyIndex: number;
  takeawayIndex: number; // -3 for main intro, -1 for story intro, 0..N for takeaways, -2 for outro
}

/**
 * Continuous playlist audio synthesizer for 3-minute morning briefing, filtered news, or custom queues.
 * Chains top articles into a unified, seamless podcast stream with rich narration.
 */
export function useDailyBriefingPlaylist(
  articles: NewsItem[],
  lang: 'vi' | 'en'
): UseDailyBriefingReturn {
  const [playlistArticles, setPlaylistArticles] = useState<NewsItem[]>(articles);
  const [playlistTitle, setPlaylistTitle] = useState<string>('');
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
  const playTokenRef = useRef<number>(0);

  // Initialize default articles only if no playlist has been set
  useEffect(() => {
    setPlaylistArticles((prev) => (prev.length === 0 && articles.length > 0 ? articles : prev));
  }, [articles]);

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
    playTokenRef.current = GlobalAudioManager.nextToken();
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

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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

  // Builds audio queue segments with rich narrative framing for non-readers
  const buildQueue = useCallback(
    (targetList: NewsItem[], startIndex: number, customTitle?: string) => {
      const segments: BriefingSegment[] = [];
      const validArticles = targetList.slice(startIndex);
      if (validArticles.length === 0) return segments;

      // 1. Overall podcast intro
      if (startIndex === 0) {
        const podcastIntro = customTitle
          ? lang === 'vi'
            ? `Chào bạn! Đây là bản tin ${customTitle} từ ClearWind Tech News. Sau đây là ${validArticles.length} bài viết đáng chú ý.`
            : `Hello! This is ${customTitle} from ClearWind Tech News. Here are ${validArticles.length} curated stories.`
          : lang === 'vi'
          ? `Chào buổi sáng! Đây là bản tin công nghệ 3 phút của ClearWind Tech News. Sau đây là ${validArticles.length} bài viết đáng chú ý nhất hôm nay.`
          : `Good morning! Welcome to ClearWind 3-minute tech audio briefing. Here are today's top ${validArticles.length} stories.`;

        const normalizedIntro = normalizeTextForSpeech(podcastIntro, lang);
        splitIntoAudioChunks(normalizedIntro, 175).forEach((chunk) => {
          segments.push({ text: chunk, storyIndex: 0, takeawayIndex: -3 });
        });
      }

      // 2. Loop through articles with rich framing
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

        // Article header: Mention Category, Source, and Title
        const storyHeader =
          lang === 'vi'
            ? `Tin số ${sIndex + 1}. Chuyên mục ${article.category || 'Công nghệ'}. Nguồn từ ${article.sourceName}. ${title}. Tóm tắt cốt lõi gồm có:`
            : `Story number ${sIndex + 1}. Category: ${article.category || 'Technology'}. From ${article.sourceName}. ${title}. Key takeaways:`;

        const normalizedHeader = normalizeTextForSpeech(storyHeader, lang);
        splitIntoAudioChunks(normalizedHeader, 175).forEach((chunk) => {
          segments.push({ text: chunk, storyIndex: sIndex, takeawayIndex: -1 });
        });

        // Takeaways: Provide contextual lead-ins
        takeaways.forEach((pt, pIdx) => {
          let prefix = '';
          if (lang === 'vi') {
            if (pIdx === 0) prefix = 'Điểm thứ nhất, ';
            else if (pIdx === 1) prefix = 'Điểm thứ hai, chi tiết kỹ thuật: ';
            else if (pIdx === 2) prefix = 'Điểm thứ ba, tác động thực tế: ';
            else prefix = `Điểm thứ ${pIdx + 1}, `;
          } else {
            if (pIdx === 0) prefix = 'First point, ';
            else if (pIdx === 1) prefix = 'Second point, technical details: ';
            else if (pIdx === 2) prefix = 'Third point, practical impact: ';
            else prefix = `Point ${pIdx + 1}, `;
          }

          const normalizedPt = normalizeTextForSpeech(prefix + pt, lang);
          splitIntoAudioChunks(normalizedPt, 175).forEach((chunk) => {
            segments.push({ text: chunk, storyIndex: sIndex, takeawayIndex: pIdx });
          });
        });
      });

      // 3. Outro
      const outro =
        lang === 'vi'
          ? 'Bản tin kết thúc. Chúc bạn một ngày làm việc và lập trình hiệu quả!'
          : 'That concludes our tech briefing. Have an awesome and productive day!';

      splitIntoAudioChunks(outro, 175).forEach((chunk) => {
        segments.push({
          text: chunk,
          storyIndex: targetList.length - 1,
          takeawayIndex: -2,
        });
      });

      return segments;
    },
    [lang]
  );

  // Play next segment
  const playNextSegment = useCallback(() => {
    const currentToken = playTokenRef.current;
    if (isCanceledRef.current || !GlobalAudioManager.isTokenActive(currentToken)) return;

    if (currentIndexRef.current >= queueRef.current.length) {
      stop();
      return;
    }

    const segment = queueRef.current[currentIndexRef.current];
    setCurrentStoryIndex(segment.storyIndex);
    setCurrentTakeawayIndex(
      segment.takeawayIndex >= 0 ? segment.takeawayIndex : segment.takeawayIndex === -1 ? -1 : null
    );

    // Clean up previous audio instance before creating new one
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.src = '';
      audioRef.current = null;
    }

    const audioUrl = `/api/tts?text=${encodeURIComponent(segment.text)}&lang=${lang}`;
    const audio = new Audio(audioUrl);
    audio.playbackRate = currentRateRef.current;
    audioRef.current = audio;
    GlobalAudioManager.updateActiveAudio(audio);

    let didAdvance = false;
    const safeAdvance = () => {
      if (didAdvance) return;
      didAdvance = true;
      audio.onended = null;
      audio.onerror = null;
      if (isCanceledRef.current || !GlobalAudioManager.isTokenActive(currentToken)) return;
      currentIndexRef.current += 1;

      // Check if transitioning to a new story
      const nextSeg = queueRef.current[currentIndexRef.current];
      const isNewStory = nextSeg && nextSeg.storyIndex !== segment.storyIndex;

      if (isNewStory) {
        if (transitionTimerRef.current) {
          clearTimeout(transitionTimerRef.current);
        }
        // Natural 350ms pause between stories
        transitionTimerRef.current = setTimeout(() => {
          if (!isCanceledRef.current && GlobalAudioManager.isTokenActive(currentToken)) {
            playNextSegment();
          }
        }, 350);
      } else {
        playNextSegment();
      }
    };

    audio.onended = () => {
      safeAdvance();
    };

    audio.onerror = () => {
      console.warn('[Daily Briefing Audio error] advancing segment cleanly');
      safeAdvance();
    };

    audio.play().catch((err) => {
      // If playback was aborted by another play() or cancel, do not advance!
      if (err?.name === 'AbortError') {
        return;
      }
      console.warn('[Daily Briefing Audio play error]', err);
      safeAdvance();
    });
  }, [lang, stop]);

  // Start standard briefing
  const startBriefing = useCallback(
    (startIndex = 0) => {
      stop();
      const targetArticles = playlistArticles.length > 0 ? playlistArticles : articles;
      if (!targetArticles || targetArticles.length === 0) return;

      const safeStartIndex = Math.max(0, Math.min(startIndex, targetArticles.length - 1));
      const segments = buildQueue(targetArticles, safeStartIndex, playlistTitle);
      if (segments.length === 0) return;

      const newToken = GlobalAudioManager.registerPlayback(stop);
      playTokenRef.current = newToken;
      isCanceledRef.current = false;
      queueRef.current = segments;
      currentIndexRef.current = 0;
      setCurrentStoryIndex(safeStartIndex);
      setIsPlaying(true);
      setIsPaused(false);

      playNextSegment();
    },
    [playlistArticles, articles, playlistTitle, buildQueue, stop, playNextSegment]
  );

  // Start custom list briefing (Filtered list or user-selected queue)
  const playCustomList = useCallback(
    (customArticles: NewsItem[], customTitle?: string, startIndex = 0) => {
      stop();
      if (!customArticles || customArticles.length === 0) return;

      const title = customTitle || (lang === 'vi' ? 'Bản tin tùy chọn' : 'Custom Playlist');
      setPlaylistArticles(customArticles);
      setPlaylistTitle(title);

      const safeStartIndex = Math.max(0, Math.min(startIndex, customArticles.length - 1));
      const segments = buildQueue(customArticles, safeStartIndex, title);
      if (segments.length === 0) return;

      const newToken = GlobalAudioManager.registerPlayback(stop);
      playTokenRef.current = newToken;
      isCanceledRef.current = false;
      queueRef.current = segments;
      currentIndexRef.current = 0;
      setCurrentStoryIndex(safeStartIndex);
      setIsPlaying(true);
      setIsPaused(false);

      playNextSegment();
    },
    [stop, buildQueue, playNextSegment, lang]
  );

  // Jump to specific story in playlist
  const jumpToStory = useCallback(
    (targetIndex: number) => {
      const targetArticles = playlistArticles.length > 0 ? playlistArticles : articles;
      if (!targetArticles || targetArticles.length === 0) return;

      stop();
      const safeStartIndex = Math.max(0, Math.min(targetIndex, targetArticles.length - 1));
      const segments = buildQueue(targetArticles, safeStartIndex, playlistTitle);
      if (segments.length === 0) return;

      const newToken = GlobalAudioManager.registerPlayback(stop);
      playTokenRef.current = newToken;
      isCanceledRef.current = false;
      queueRef.current = segments;
      currentIndexRef.current = 0;
      setCurrentStoryIndex(safeStartIndex);
      setIsPlaying(true);
      setIsPaused(false);

      playNextSegment();
    },
    [playlistArticles, articles, playlistTitle, buildQueue, stop, playNextSegment]
  );

  // Remove article from active playlist
  const removeFromPlaylist = useCallback(
    (articleId: string) => {
      setPlaylistArticles((prev) => {
        const next = prev.filter((a) => a.id !== articleId);
        if (next.length === 0) {
          stop();
        }
        return next;
      });
    },
    [stop]
  );

  // Next story
  const nextStory = useCallback(() => {
    const targetArticles = playlistArticles.length > 0 ? playlistArticles : articles;
    if (currentStoryIndex < targetArticles.length - 1) {
      jumpToStory(currentStoryIndex + 1);
    } else {
      stop();
    }
  }, [currentStoryIndex, playlistArticles, articles, jumpToStory, stop]);

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
    playlistTitle,
    playlistArticles,
    startBriefing,
    playCustomList,
    pause,
    resume,
    stop,
    nextStory,
    prevStory,
    jumpToStory,
    cyclePlaybackRate,
    removeFromPlaylist,
  };
}
