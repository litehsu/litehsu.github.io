import { useState, useEffect } from 'react';
import { useSheetData } from './hooks/useSheetData';
import type { SheetRow, TabName } from './hooks/useSheetData';

const TABS: TabName[] = ['mtg', 'pokemon', 'other'];
const TAB_DURATION = 10_000;

const TAB_CONFIG: Record<TabName, { label: string; color: string; headerBg: string }> = {
  mtg:     { label: 'Magic: The Gathering', color: '#1a237e', headerBg: '#e8eaf6' },
  pokemon: { label: 'Pokémon',              color: '#e65100', headerBg: '#fff3e0' },
  other:   { label: 'Other',                color: '#2e7d32', headerBg: '#e8f5e9' },
};

function CardRow({ row, index }: { row: SheetRow; index: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      gap: '0 12px',
      alignItems: 'center',
      padding: '0 16px',
      flex: 1,
      minHeight: 0,
      background: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
      borderBottom: '1px solid #eeeeee',
    }}>
      <span style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontWeight: 600,
        fontSize: 'clamp(0.65rem, 1.4vh, 1rem)',
        color: '#1a1a1a',
      }}>
        {row.name}
      </span>
      <span style={{
        whiteSpace: 'nowrap',
        color: '#777',
        fontSize: 'clamp(0.6rem, 1.2vh, 0.85rem)',
        textAlign: 'right',
      }}>
        {row.set}
      </span>
      <span style={{
        whiteSpace: 'nowrap',
        color: '#2e7d32',
        fontWeight: 700,
        textAlign: 'right',
        minWidth: 64,
        fontSize: 'clamp(0.65rem, 1.3vh, 0.95rem)',
      }}>
        {row.price}
      </span>
    </div>
  );
}

export default function BuyListDisplay() {
  const { data, loading, error } = useSheetData();
  const [tabIndex, setTabIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();

    const progressInterval = setInterval(() => {
      setProgress(Math.min(((Date.now() - start) / TAB_DURATION) * 100, 100));
    }, 50);

    const tabTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setTabIndex(i => (i + 1) % TABS.length);
        setProgress(0);
        setVisible(true);
      }, 300);
    }, TAB_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(tabTimer);
    };
  }, [tabIndex]);

  const currentTab = TABS[tabIndex];
  const config = TAB_CONFIG[currentTab];
  const rows = data[currentTab];
  const mid = Math.ceil(rows.length / 2);

  const colHeader = (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      gap: '0 12px',
      padding: '6px 16px',
      background: config.headerBg,
      borderBottom: `2px solid ${config.color}`,
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
      color: config.color,
      flexShrink: 0,
    }}>
      <span>Card</span>
      <span style={{ textAlign: 'right' }}>Set</span>
      <span style={{ textAlign: 'right', minWidth: 64 }}>Price</span>
    </div>
  );

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#ffffff',
      color: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', Arial, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '2px solid #eeeeee',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img src="/hibichan.png" alt="Hibiki" style={{ height: 64, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: 1 }}>WE ARE BUYING</div>
            <div style={{ fontSize: '0.85rem', color: '#888', letterSpacing: 2, textTransform: 'uppercase' }}>
              Today's Buy List
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map((tab, i) => (
            <div key={tab} style={{
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: 1,
              background: i === tabIndex ? TAB_CONFIG[tab].color : '#f0f0f0',
              color: i === tabIndex ? '#ffffff' : '#aaaaaa',
              transition: 'background 0.3s, color 0.3s',
            }}>
              {TAB_CONFIG[tab].label}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#eeeeee', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: config.color,
          transition: 'width 0.05s linear',
        }} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1,
        background: '#dddddd',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#888', fontSize: '1.2rem' }}>
            Loading…
          </div>
        ) : error ? (
          <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#c62828' }}>
            {error}
          </div>
        ) : (
          [rows.slice(0, mid), rows.slice(mid)].map((col, ci) => (
            <div key={ci} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, background: '#fff' }}>
              {colHeader}
              {col.map((row, i) => <CardRow key={i} row={row} index={i} />)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
