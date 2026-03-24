import React, { useEffect, useState } from 'react';
import { Activity, BarChart2, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser }       from '../context/UserContext';
import { useTheme }      from '../pages/Themecontext';
import { useLanguage }   from '../context/LanguageContext';
import { useResponsive } from '../hooks/useresponsive';

export default function DashboardHome() {
  const { user }     = useUser();
  const { theme: T } = useTheme();
  const { t }        = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const firstName    = user?.firstName || user?.name?.split(' ')[0] || 'Doctor';

  const [scanData, setScanData] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const fetchHistory = async () => {
    if (!user?.email) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`https://ecg-backend-production-af9b.up.railway.app/api/scan-history?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to load');
      setScanData(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, [user?.email]);

  const card = { background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:18, boxShadow:T.cardShadow };

  // Responsive padding relies on DashboardLayout handling the top margin now!
  const pagePadding = isMobile ? '20px 16px' : isTablet ? '24px 20px' : '32px 40px';
  const statsColumns = isMobile ? '1fr 1fr' : isTablet ? '1fr 1fr' : 'repeat(4,1fr)';

  const stats = [
    { label:t('dash_total_scans'), value: scanData?.total_scans ?? '—', sub:'All time',          icon:Activity,   color:'#2563eb', bg:'#eff6ff' },
    { label:'Leads',               value: scanData?.avg_leads   ?? '—', sub:'Per scan',          icon:BarChart2,  color:'#0d9488', bg:'#f0fdf4' },
    { label:t('dash_avg_time'),    value: scanData?.avg_duration?? '—', sub:'Per ECG scan',      icon:Clock,      color:'#7c3aed', bg:'#f5f3ff' },
    { label:t('dash_avg_dice'),    value: scanData?.scans?.[0]?.leads_count ?? '—', sub:'Last scan leads', icon:TrendingUp, color:'#ea580c', bg:'#fff7ed' },
  ];

  return (
    <div style={{ padding: pagePadding, background:T.pageBg, minHeight:'100%' }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: isMobile ? 16 : 28, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:T.textPrimary, marginBottom:4 }}>
            {t('dash_welcome')}, {firstName} 👋
          </h1>
          <p style={{ fontSize: isMobile ? 12 : 13, color:T.textMuted }}>{t('dash_summary')}</p>
        </div>
        <button onClick={fetchHistory} style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'8px 14px', borderRadius:10, border:`1px solid ${T.cardBorder}`,
          background:T.cardBg, color:T.textMuted, fontSize:12, fontWeight:600, cursor:'pointer',
          flexShrink:0,
        }}>
          <RefreshCw size={13} color={T.textMuted}/> {t('dash_refresh')}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ marginBottom:16, padding:'10px 16px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, fontSize:13, color:'#dc2626' }}>
          ⚠ {error} — <button onClick={fetchHistory} style={{ color:'#dc2626', fontWeight:700, background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Retry</button>
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display:'grid', gridTemplateColumns: statsColumns, gap: isMobile ? 10 : 16, marginBottom: isMobile ? 16 : 24 }}>
        {stats.map(({ label, value, sub, icon:Icon, color, bg }) => (
          <div key={label} style={{ ...card, padding: isMobile ? '14px 16px' : '20px 22px' }}>
            <div style={{ width:34, height:34, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
              <Icon size={17} color={color}/>
            </div>
            {loading
              ? <div style={{ height:24, width:50, background:T.cardBorder, borderRadius:6, animation:'shimmer 1.5s infinite', marginBottom:4 }}/>
              : <div style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:T.accent }}>{value}</div>
            }
            <div style={{ fontSize: isMobile ? 11 : 12, fontWeight:600, color:T.textPrimary, marginTop:2 }}>{label}</div>
            <div style={{ fontSize:10, color:T.textMuted, marginTop:2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Recent Scans ── */}
      <div style={{ ...card, overflow:'hidden', marginBottom: isMobile ? 16 : 24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: isMobile ? '14px 16px' : '18px 24px', borderBottom:`1px solid ${T.divider}` }}>
          <h2 style={{ fontSize: isMobile ? 13 : 14, fontWeight:700, color:T.textPrimary }}>{t('dash_recent')}</h2>
          <Link to="/upload" style={{ fontSize:12, color:T.accent, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}>{t('dash_new_scan')}</Link>
        </div>

        {loading ? (
          <div style={{ padding: isMobile ? '12px 16px' : '16px 24px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ display:'flex', gap:12, marginBottom:12 }}>
                {[60,100,40,50].map((w,j) => (
                  <div key={j} style={{ height:12, width:w, background:T.cardBorder, borderRadius:6 }}/>
                ))}
              </div>
            ))}
          </div>
        ) : !scanData?.scans?.length ? (
          <div style={{ padding:'32px 16px', textAlign:'center', color:T.textMuted, fontSize:13 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>📋</div>
            {t('dash_no_scans')}{' '}
            <Link to="/upload" style={{ color:T.accent, fontWeight:700, textDecoration:'none' }}>{t('dash_upload_first')}</Link>
          </div>
        ) : isMobile ? (
          /* ── MOBILE: Card list instead of table ── */
          <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
            {(scanData?.scans || []).slice(0, 10).map(scan => (
              <div key={scan.id} style={{ background:T.inputBg, borderRadius:12, padding:'12px 14px', border:`1px solid ${T.cardBorder}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:T.textPrimary }}>{scan.record_id}</div>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:T.badgeBg, color:T.badgeTxt, border:`1px solid ${T.badgeBorder}`, fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:20 }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:T.badgeTxt, display:'inline-block' }}/>
                    {t('dash_success')}
                  </span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  <div>
                    <div style={{ fontSize:9, color:T.textMuted, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>{t('dash_date')}</div>
                    <div style={{ fontSize:11, color:T.textSecondary, marginTop:2 }}>{scan.created_at}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:T.textMuted, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>{t('dash_leads')}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:T.textPrimary, marginTop:2 }}>{scan.leads_count}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:T.textMuted, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>{t('dash_duration')}</div>
                    <div style={{ fontSize:11, color:T.textSecondary, marginTop:2 }}>{scan.duration}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── DESKTOP/TABLET: Table ── */
          <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth: isTablet ? 500 : 600 }}>
              <thead>
                <tr style={{ background:T.tableHdr }}>
                  {[t('dash_record_id'), t('dash_date'), t('dash_leads'), t('dash_duration'), t('dash_status')].map(h => (
                    <th key={h} style={{ padding: isTablet ? '10px 14px' : '10px 24px', textAlign:'left', fontSize:10, fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:0.8, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(scanData?.scans || []).slice(0, 10).map(scan => (
                  <tr key={scan.id}
                    style={{ borderTop:`1px solid ${T.tableDiv}`, background:T.tableRow, transition:'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.tableRowHov}
                    onMouseLeave={e => e.currentTarget.style.background = T.tableRow}
                  >
                    <td style={{ padding: isTablet ? '11px 14px' : '13px 24px', fontFamily:'monospace', fontSize:11, fontWeight:700, color:T.textPrimary }}>{scan.record_id}</td>
                    <td style={{ padding: isTablet ? '11px 14px' : '13px 24px', fontSize:11, color:T.textMuted, whiteSpace:'nowrap' }}>{scan.created_at}</td>
                    <td style={{ padding: isTablet ? '11px 14px' : '13px 24px', fontSize:12, fontWeight:600, color:T.textPrimary }}>{scan.leads_count}</td>
                    <td style={{ padding: isTablet ? '11px 14px' : '13px 24px', fontSize:11, color:T.textMuted }}>{scan.duration}</td>
                    <td style={{ padding: isTablet ? '11px 14px' : '13px 24px' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:T.badgeBg, color:T.badgeTxt, border:`1px solid ${T.badgeBorder}`, fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:20, whiteSpace:'nowrap' }}>
                        <span style={{ width:5, height:5, borderRadius:'50%', background:T.badgeTxt, display:'inline-block' }}/>
                        {t('dash_success')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CTA Banner ── */}
      <div style={{
        background:`linear-gradient(135deg,${T.accent},${T.accentHover})`,
        borderRadius:18, padding: isMobile ? '18px 16px' : '24px 28px',
        display:'flex', alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent:'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 14 : 16,
      }}>
        <div>
          <h3 style={{ color:'#fff', fontWeight:700, fontSize: isMobile ? 14 : 15, marginBottom:4 }}>{t('dash_cta_title')}</h3>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize: isMobile ? 12 : 12 }}>{t('dash_cta_sub')}</p>
        </div>
        <Link to="/upload" style={{ flexShrink:0, ...(isMobile && { width:'100%' }) }}>
          <button style={{
            background:'#fff', color:T.accent, fontWeight:700, fontSize:13,
            padding:'10px 22px', borderRadius:12, border:'none', cursor:'pointer',
            width: isMobile ? '100%' : 'auto',
          }}>
            {t('dash_cta_btn')}
          </button>
        </Link>
      </div>

      <style>{`@keyframes shimmer{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
    </div>
  );
}