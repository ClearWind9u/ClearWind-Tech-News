import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ClearWind Tech News - Bản Tin Công Nghệ Tự Động 24/7';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
          border: '12px solid #121722',
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '30%',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 80%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
            >
              🍃
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                ClearWind <span style={{ color: '#34D399' }}>Tech</span>
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#94A3B8', letterSpacing: '2px' }}>
                AUTONOMOUS IT DIGEST
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '10px 20px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ✦ Curated Tech Digest
          </div>
        </div>

        {/* Main Center Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10 }}>
          <div
            style={{
              fontSize: '54px',
              fontWeight: '900',
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-1px',
            }}
          >
            Làn Gió Tin Tức Công Nghệ Tinh Gọn 24/7
          </div>
          <div
            style={{
              fontSize: '22px',
              color: '#94A3B8',
              lineHeight: 1.4,
              maxWidth: '900px',
            }}
          >
            Tổng hợp tin tức IT đa nguồn, trích xuất 3 điểm cốt lõi chuyên sâu. Song ngữ hoàn chỉnh Việt - Anh.
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10 }}>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: '#121722',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#E2E8F0',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            🇻🇳 70% Nguồn Tin Việt Nam
          </div>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: '#121722',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#E2E8F0',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            ⚡ Đọc Nhanh 10 Giây
          </div>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: '#121722',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#E2E8F0',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            🔒 Zero Login Friction
          </div>
          <div
            style={{
              marginLeft: 'auto',
              color: '#64748B',
              fontSize: '16px',
              fontWeight: '700',
              fontFamily: 'monospace',
            }}
          >
            windtech-sandy.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
