import { ImageResponse } from 'next/og';
import { getNewsDatabase } from '@/lib/db';

export const revalidate = 3600;
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

const CAT_ACCENTS: Record<string, { color: string; label: string }> = {
  'AI & Machine Learning':  { color: '#A855F7', label: 'AI / ML' },
  'Software Engineering':   { color: '#10B981', label: 'SOFTWARE ENG' },
  'DevOps & Cloud':         { color: '#0EA5E9', label: 'DEVOPS & CLOUD' },
  'Cybersecurity':          { color: '#F43F5E', label: 'CYBERSECURITY' },
  'Mobile & Web':           { color: '#06B6D4', label: 'MOBILE & WEB' },
  'Tech Trends & Startups': { color: '#F59E0B', label: 'TECH TRENDS' },
};

export default async function Image({ params }: { params: { id: string } }) {
  try {
    const db = await getNewsDatabase();
    const article = db.articles.find((a) => a.id === params.id);

    if (!article) {
      // Fallback to site-level OG image
      return new ImageResponse(
        <div style={{ width: '100%', height: '100%', background: '#0B0E14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#34D399', fontSize: 48, fontWeight: 900 }}>ClearWind Tech News</span>
        </div>,
        { ...size }
      );
    }

    const accent = CAT_ACCENTS[article.category] ?? CAT_ACCENTS['Tech Trends & Startups'];
    const title = article.title_vi || article.title_en;
    const summary = article.summary_vi?.[0] || article.summary_en?.[0] || '';
    // Truncate for display
    const displayTitle = title.length > 80 ? title.slice(0, 78) + '…' : title;
    const displaySummary = summary.length > 120 ? summary.slice(0, 118) + '…' : summary;

    return new ImageResponse(
      (
        <div
          style={{
            background: '#0B0E14',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '56px 72px',
            fontFamily: 'sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Category glow orb */}
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '480px',
              height: '480px',
              borderRadius: '9999px',
              background: `radial-gradient(circle, ${accent.color}30 0%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
          />
          {/* Bottom left glow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-60px',
              left: '-40px',
              width: '300px',
              height: '300px',
              borderRadius: '9999px',
              background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Header: Brand + Category badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" />
                  <polyline points="2.32 6.16 12 11 21.68 6.16" />
                  <line x1="12" y1="22.76" x2="12" y2="11" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  ClearWind <span style={{ color: '#34D399' }}>Tech</span>
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '2.5px' }}>
                  AUTONOMOUS IT DIGEST
                </span>
              </div>
            </div>

            {/* Category badge */}
            <div style={{
              padding: '8px 18px', borderRadius: '9999px',
              background: `${accent.color}20`,
              border: `1px solid ${accent.color}50`,
              color: accent.color,
              fontSize: '13px', fontWeight: 800,
              letterSpacing: '1.5px',
            }}>
              {accent.label}
            </div>
          </div>

          {/* Main headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10, flex: 1, justifyContent: 'center', padding: '32px 0' }}>
            <div style={{
              fontSize: displayTitle.length > 60 ? '36px' : '44px',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.2,
              letterSpacing: '-0.5px',
            }}>
              {displayTitle}
            </div>
            {displaySummary && (
              <div style={{
                fontSize: '18px',
                color: '#94A3B8',
                lineHeight: 1.5,
              }}>
                {displaySummary}
              </div>
            )}
          </div>

          {/* Footer: Source + read time + URL */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                padding: '8px 16px', borderRadius: '10px',
                background: '#1E2533',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#E2E8F0', fontSize: '14px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                  <path d="M18 14h-8" />
                  <path d="M15 18h-5" />
                  <path d="M10 6h8v4h-8V6Z" />
                </svg>
                <span>{article.sourceName}</span>
              </div>
              <div style={{
                padding: '8px 16px', borderRadius: '10px',
                background: '#1E2533',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#E2E8F0', fontSize: '14px', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{article.readTimeMinutes} phút đọc</span>
              </div>
            </div>
            <span style={{ color: '#475569', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
              windtech-sandy.vercel.app
            </span>
          </div>
        </div>
      ),
      { ...size }
    );
  } catch {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', background: '#0B0E14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#34D399', fontSize: 40 }}>ClearWind Tech News</span>
      </div>,
      { ...size }
    );
  }
}
