import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutGrid, UploadCloud, Settings, HelpCircle, User, Info, LogOut, Menu, X as CloseIcon } from 'lucide-react';
import { useUser }       from '../context/UserContext';
import { useTheme }      from '../pages/Themecontext';
import { useLanguage }   from '../context/LanguageContext';
import { useResponsive } from '../hooks/useresponsive';

// Note: If you prefer to import the image, you can do so here:
// import Logo from '../assets/cropped-cropped-IIHMR-Logo-03.png';

export default function DashboardLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, setUser } = useUser();
  const { theme: T }      = useTheme();
  const { t }             = useLanguage();
  const { isMobile, isTablet } = useResponsive();

  const [showLogout,  setShowLogout]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMobileOrTablet = isMobile || isTablet;

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = (sidebarOpen && isMobileOrTablet) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, isMobileOrTablet]);

  if (!user) return <Navigate to="/" replace />;

  const firstName  = user.firstName || (user.name?.split(' ')[0] ?? '');
  const lastName   = user.lastName  || (user.name?.split(' ').slice(1).join(' ') ?? '');
  const initials   = ((firstName[0] ?? '') + (lastName[0] ?? '')) || user.name?.[0] || 'U';
  const profilePic = user.profilePic || localStorage.getItem(`ecg-profile-pic-${user.email}`) || null;

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const active = location.pathname === to;
    return (
      <Link to={to} style={{
        display:'flex', alignItems:'center', gap:12,
        padding:'10px 16px', borderRadius:10,
        fontSize:13, fontWeight: active ? 600 : 500,
        color: active ? T.navActiveTxt : T.navTxt,
        background: active ? T.navActive : 'transparent',
        textDecoration:'none', transition:'all 0.15s',
        minHeight: 44,
      }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.navHover; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        <Icon size={17} color={active ? T.navActiveTxt : T.textMuted}/> {label}
      </Link>
    );
  };

  const isProfileActive = location.pathname === '/profile';

  const SidebarInner = () => (
    <>
      <div>
        {/* App logo / profile link */}
        <Link to="/profile" style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'10px 12px', borderRadius:12, marginBottom:16,
          textDecoration:'none',
          background: isProfileActive ? T.navActive : 'transparent',
          border: isProfileActive ? `1px solid ${T.cardBorder}` : '1px solid transparent',
          transition:'all 0.15s',
        }}>
          {profilePic
            ? <img src={profilePic} alt="Profile"
                style={{ width:36, height:36, borderRadius:10, objectFit:'cover', border:`2px solid ${T.accent}`, flexShrink:0 }}/>
            : <div style={{ width:36, height:36, borderRadius:10, background:T.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:T.accentText, fontWeight:700, fontSize:14 }}>{initials.toUpperCase()}</span>
              </div>
          }
          <div style={{ overflow:'hidden', flex:1 }}>
            <div style={{ fontWeight:700, fontSize:13, color:T.textPrimary, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {t('nav_ecg_digitizer')}
            </div>
            <div style={{ fontSize:11, color:T.textMuted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {firstName} {lastName}
            </div>
          </div>
          <User size={13} color={isProfileActive ? T.navActiveTxt : T.textMuted}/>
        </Link>

        {/* New Scan button */}
        <Link to="/upload" style={{ display:'block', marginBottom:20 }}>
          <button style={{
            width:'100%', padding:'10px 0', borderRadius:10, border:'none',
            background:T.accent, color:T.accentText,
            fontWeight:700, fontSize:13, cursor:'pointer',
            boxShadow:`0 2px 12px ${T.accent}44`,
          }}>
            {t('nav_new_scan')}
          </button>
        </Link>

        {/* Navigation */}
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, letterSpacing:1.2, textTransform:'uppercase', padding:'0 16px', marginBottom:6 }}>
            Navigation
          </div>
          <NavItem to="/dashboard" icon={LayoutGrid}  label={t('nav_dashboard')}/>
          <NavItem to="/upload"    icon={UploadCloud} label={t('nav_upload')}/>
        </div>
      </div>

      {/* Bottom nav */}
      <div>
        <NavItem to="/settings" icon={Settings}  label={t('nav_settings')}/>
        <NavItem to="/about"    icon={Info}       label={t('nav_about')}/>
        <NavItem to="/support"  icon={HelpCircle} label={t('nav_support')}/>
        <div style={{ height:1, background:T.divider, margin:'8px 0' }}/>
        <button onClick={() => setShowLogout(true)} style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'10px 16px', borderRadius:10, border:'none',
          width:'100%', textAlign:'left', cursor:'pointer',
          fontSize:13, fontWeight:500, color:'#ef4444',
          background:'transparent', transition:'all 0.15s', minHeight:44,
        }}
          onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}
        >
          <LogOut size={17} color="#ef4444"/> {t('nav_logout')}
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display:'flex', height:'100vh', background:T.pageBg, overflow:'hidden', position:'relative' }}>

      {/* ── MOBILE: Overlay ── */}
      {isMobileOrTablet && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
            zIndex:40, cursor:'pointer',
          }}
        />
      )}

      {/* ── MOBILE: Top Solid Header Bar (Fixes scrolling overlap) ── */}
      {isMobileOrTablet && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 60,
          background: T.pageBg, borderBottom: `1px solid ${T.divider}`,
          zIndex: 45, display: 'flex', alignItems: 'center', padding: '0 16px',
        }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: T.cardBg, border: `1px solid ${T.cardBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
          >
            {sidebarOpen ? <CloseIcon size={18} color={T.textPrimary}/> : <Menu size={18} color={T.textPrimary}/>}
          </button>
          
          {/* Replaced text with the logo image */}
          <img 
            src="/cropped-cropped-IIHMR-Logo-03.png" 
            alt="IIHMR Logo" 
            style={{ marginLeft: 16, height: 32, width: 'auto', objectFit: 'contain' }} 
          />
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240,
        flexShrink: 0,
        background: T.sidebarBg,
        borderRight: `1px solid ${T.sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        justifyContent: 'space-between',
        overflowY: 'auto',
        ...(isMobileOrTablet ? {
          position: 'fixed',
          top: 0, left: 0,
          height: '100%',
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
        } : {
          position: 'relative',
          height: '100vh',
        }),
      }}>
        <SidebarInner/>
      </aside>

      {/* ── MAIN ── */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        background: T.pageBg,
        minWidth: 0,
        // Push content down on mobile so it doesn't hide under the new top bar
        paddingTop: isMobileOrTablet ? 60 : 0, 
      }}>
        <Outlet/>
      </main>

      {/* ── LOGOUT MODAL ── */}
      {showLogout && (
        <div style={{
          position:'fixed', inset:0, background:T.modalBack,
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:100, padding:16,
        }}>
          <div style={{
            background:T.cardBg, border:`1px solid ${T.cardBorder}`,
            borderRadius:20, padding:28, width:'100%', maxWidth:320,
            boxShadow:'0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
              <LogOut size={20} color="#ef4444"/>
            </div>
            <h3 style={{ fontSize:15, fontWeight:700, color:T.textPrimary, marginBottom:6 }}>{t('logout_title')}</h3>
            <p style={{ fontSize:13, color:T.textMuted, marginBottom:22 }}>{t('logout_msg')}</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowLogout(false)} style={{ flex:1, padding:'10px 0', borderRadius:12, border:`1px solid ${T.cardBorder}`, background:T.cardBg, color:T.textSecondary, fontWeight:600, fontSize:13, cursor:'pointer' }}>
                {t('logout_cancel')}
              </button>
              <button onClick={handleLogout} style={{ flex:1, padding:'10px 0', borderRadius:12, border:'none', background:'#ef4444', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                {t('logout_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}