import React from 'react';

const SkeletonCard = ({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) => (
  <div style={{
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.5s infinite',
    ...style
  }}>
    <style>{`
      @keyframes skeleton-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
);

export const SkeletonStatCard = () => (
  <div className="card stat-card" style={{ gap: '16px' }}>
    <SkeletonCard width="54px" height="54px" borderRadius="12px" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <SkeletonCard width="60%" height="14px" />
      <SkeletonCard width="35%" height="28px" borderRadius="6px" />
    </div>
  </div>
);

export const SkeletonTableRow = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '14px 16px' }}>
        <SkeletonCard height="16px" borderRadius="6px" width={i === 0 ? '80px' : '100%'} />
      </td>
    ))}
  </tr>
);

export default SkeletonCard;
