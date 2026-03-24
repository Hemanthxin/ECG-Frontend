import React, { useState } from 'react';
import { Sun, Moon, Zap, Check, Globe, Save, X, Bell, Shield, Monitor, Key, ChevronRight } from 'lucide-react';
import { useTheme, THEMES } from '../pages/Themecontext';
import { useLanguage }      from '../context/LanguageContext';
import { useResponsive }    from '../hooks/useresponsive';

function Modal({ title, icon, T, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:T.modalBack, display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16 }} onClick={onClose}>
      <div style={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:20, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.35)', maxHeight:'90vh', overflowY:'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:`1px solid ${T.divider}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:`${T.accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
            <span style={{ fontSize:15, fontWeight:700, color:T.textPrimary }}>{title}</span>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:8, border:`1px solid ${T.cardBorder}`, background:T.cardBg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={13} color={T.textMuted}/>
          </button>
        </div>
        <div style={{ padding:'22px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ T, onClose, onSave, saved }) {
  return (
    <div style={{ display:'flex', gap:10, marginTop:22 }}>
      <button onClick={onClose} style={{ flex:1, padding:'11px 0', borderRadius:12, border:`1px solid ${T.cardBorder}`, background:T.cardBg, color:T.textSecondary, fontWeight:600, fontSize:13, cursor:'pointer' }}>Cancel</button>
      <button onClick={onSave} style={{ flex:1, padding:'11px 0', borderRadius:12, border:'none', background:saved?'#22c55e':T.accent, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', transition:'background 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        {saved?<><Check size={14}/> Saved!</>:'Save Changes'}
      </button>
    </div>
  );
}

function ToggleRow({ label, sub, on, onToggle, T }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:`1px solid ${T.divider}` }}>
      <div style={{ flex:1, marginRight:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:T.textPrimary }}>{label}</div>
        <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{sub}</div>
      </div>
      <button onClick={onToggle} style={{ width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', background:on?T.accent:T.cardBorder, position:'relative', transition:'background 0.2s', flexShrink:0 }}>
        <span style={{ position:'absolute', top:3, left:on?22:3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', display:'block' }}/>
      </button>
    </div>
  );
}

function NotificationsModal({ T, t, onClose }) {
  const [s, setS] = useState({ emailAlerts:true, scanComplete:true, weeklyReport:false, systemUpdates:true });
  const [saved, setSaved] = useState(false);
  const items = [
    {key:'emailAlerts', label:'Email Alerts', sub:'Receive alerts via email for important events'},
    {key:'scanComplete', label:'Scan Complete', sub:'Notify when ECG analysis finishes'},
    {key:'weeklyReport', label:'Weekly Report', sub:'Receive a weekly summary of your scans'},
    {key:'systemUpdates', label:'System Updates', sub:'Get notified about new features and updates'},
  ];
  return (
    <Modal title="Notifications" icon={<Bell size={16} color={T.accent}/>} T={T} onClose={onClose}>
      {items.map(item => <ToggleRow key={item.key} label={item.label} sub={item.sub} on={s[item.key]} onToggle={()=>setS(p=>({...p,[item.key]:!p[item.key]}))} T={T}/>)}
      <ModalFooter T={T} onClose={onClose} onSave={()=>{setSaved(true);setTimeout(()=>{setSaved(false);onClose();},1200);}} saved={saved}/>
    </Modal>
  );
}

function PrivacyModal({ T, t, onClose }) {
  const [s, setS] = useState({ dataCollection:true, analytics:false, shareData:false });
  const [saved, setSaved] = useState(false);
  const items = [
    {key:'dataCollection', label:'Data Collection', sub:'Allow collection of anonymized usage data'},
    {key:'analytics', label:'Analytics', sub:'Help us understand how you use the ECG analyzer'},
    {key:'shareData', label:'Share with Researchers', sub:'Allow de-identified scan data for research'},
  ];
  return (
    <Modal title="Privacy & Data" icon={<Shield size={16} color={T.accent}/>} T={T} onClose={onClose}>
      <div style={{ padding:'12px 16px', background:`${T.accent}08`, border:`1px solid ${T.accent}22`, borderRadius:12, marginBottom:18, fontSize:12, color:T.textSecondary, lineHeight:1.6 }}>
        🔒 Your ECG images are processed in memory only and never stored after analysis.
      </div>
      {items.map(item => <ToggleRow key={item.key} label={item.label} sub={item.sub} on={s[item.key]} onToggle={()=>setS(p=>({...p,[item.key]:!p[item.key]}))} T={T}/>)}
      <ModalFooter T={T} onClose={onClose} onSave={()=>{setSaved(true);setTimeout(()=>{setSaved(false);onClose();},1200);}} saved={saved}/>
    </Modal>
  );
}

function DevicesModal({ T, t, onClose }) {
  const [devices] = useState([
    {id:1, name:'Chrome on Windows', location:'Hyderabad, IN', lastSeen:'Just now', current:true},
    {id:2, name:'Safari on iPhone',  location:'Bangalore, IN', lastSeen:'2 hours ago', current:false},
    {id:3, name:'Firefox on Mac',    location:'Mumbai, IN',    lastSeen:'3 days ago',  current:false},
  ]);
  const [removed, setRemoved] = useState([]);
  return (
    <Modal title="Connected Devices" icon={<Monitor size={16} color={T.accent}/>} T={T} onClose={onClose}>
      <p style={{ fontSize:12, color:T.textMuted, marginBottom:16 }}>Devices that recently accessed your account.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {devices.filter(d=>!removed.includes(d.id)).map(device=>(
          <div key={device.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, border:`1px solid ${device.current?T.accent+'44':T.cardBorder}`, background:device.current?`${T.accent}08`:T.cardBg, gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`${T.accent}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Monitor size={15} color={T.accent}/></div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:T.textPrimary, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                  {device.name}
                  {device.current&&<span style={{ fontSize:10, fontWeight:700, background:T.accent, color:T.accentText, padding:'1px 7px', borderRadius:10 }}>Current</span>}
                </div>
                <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{device.location} · {device.lastSeen}</div>
              </div>
            </div>
            {!device.current&&<button onClick={()=>setRemoved(r=>[...r,device.id])} style={{ fontSize:11, fontWeight:600, color:'#ef4444', background:'#fef2f2', border:'1px solid #fecaca', padding:'5px 12px', borderRadius:8, cursor:'pointer', flexShrink:0 }}>Remove</button>}
          </div>
        ))}
      </div>
      <div style={{ marginTop:16 }}>
        <button onClick={onClose} style={{ width:'100%', padding:'11px 0', borderRadius:12, border:'none', background:T.accent, color:T.accentText, fontWeight:700, fontSize:13, cursor:'pointer' }}>Done</button>
      </div>
    </Modal>
  );
}

function ApiModal({ T, t, onClose }) {
  const [token] = useState('sk-ecg-'+Math.random().toString(36).slice(2,18).toUpperCase());
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const copy = () => { navigator.clipboard.writeText(token).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}); };
  return (
    <Modal title="API Access" icon={<Key size={16} color={T.accent}/>} T={T} onClose={onClose}>
      <p style={{ fontSize:12, color:T.textMuted, marginBottom:18, lineHeight:1.6 }}>Use this key to access the ECG Digitizer API. Keep it secret.</p>
      <div style={{ marginBottom:16 }}>
        <label style={{ display:'block', fontSize:11, fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Your API Key</label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:120, padding:'10px 14px', borderRadius:12, border:`1px solid ${T.cardBorder}`, background:T.inputBg, fontSize:12, fontFamily:'monospace', color:T.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {showToken?token:'•'.repeat(token.length)}
          </div>
          <button onClick={()=>setShowToken(!showToken)} style={{ padding:'10px 14px', borderRadius:12, border:`1px solid ${T.cardBorder}`, background:T.cardBg, color:T.textMuted, fontSize:12, cursor:'pointer', flexShrink:0 }}>{showToken?'Hide':'Show'}</button>
          <button onClick={copy} style={{ padding:'10px 16px', borderRadius:12, border:'none', background:copied?'#22c55e':T.accent, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', flexShrink:0, transition:'background 0.2s' }}>{copied?'✓ Copied':'Copy'}</button>
        </div>
      </div>
      <div style={{ padding:'12px 16px', background:'#fef3c7', border:'1px solid #fde68a', borderRadius:12, fontSize:12, color:'#92400e', lineHeight:1.6, marginBottom:18 }}>⚠ Never share your API key publicly.</div>
      <div style={{ fontSize:12, color:T.textMuted, marginBottom:6, fontWeight:600 }}>API Endpoint</div>
      <div style={{ padding:'10px 14px', borderRadius:12, border:`1px solid ${T.cardBorder}`, background:T.inputBg, fontSize:12, fontFamily:'monospace', color:T.textPrimary, marginBottom:16, wordBreak:'break-all' }}>http://127.0.0.1:8001/api/upload-ecg</div>
      <button onClick={onClose} style={{ width:'100%', padding:'11px 0', borderRadius:12, border:'none', background:T.accent, color:T.accentText, fontWeight:700, fontSize:13, cursor:'pointer' }}>Close</button>
    </Modal>
  );
}

export default function Settings() {
  const { theme, applyTheme }       = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const { isMobile, isTablet }      = useResponsive();

  const [pendingLang, setPendingLang] = useState(language);
  const [saved,  setSaved]  = useState(false);
  const [modal,  setModal]  = useState(null);

  const T = theme;
  const LANGUAGES  = ['English','Hindi','Telugu','Tamil','Kannada'];
  const themeIcons = { light:Sun, dark:Moon, neon:Zap };

  const handleSave = () => { changeLanguage(pendingLang); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const pagePad = isMobile ? '70px 14px 20px' : isTablet ? '24px 18px' : '32px 40px';
  const card    = { background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:20, padding: isMobile ? 18 : 24, boxShadow:T.cardShadow, marginBottom: isMobile ? 16 : 20 };
  const sel     = { width:'100%', border:`1px solid ${T.inputBorder}`, background:T.inputBg, color:T.inputText, padding:'11px 14px', borderRadius:12, fontSize:13, outline:'none', cursor:'pointer', appearance:'none' };

  const accountItems = [
    {key:'notifications', label:'Notifications',    sub:'Email alerts, scan notifications',      icon:Bell,    modal:'notifications'},
    {key:'privacy',       label:'Privacy & Data',   sub:'Data collection and sharing settings',  icon:Shield,  modal:'privacy'},
    {key:'devices',       label:'Connected Devices', sub:'Manage sessions and logged-in devices', icon:Monitor, modal:'devices'},
    {key:'api',           label:'API Access',        sub:'View and manage your API key',           icon:Key,     modal:'api'},
  ];

  // On mobile: single column; on tablet: single column; on desktop: 2 col
  const useOneColumn = isMobile || isTablet;

  return (
    <div style={{ minHeight:'100%', background:T.pageBg, padding:pagePad }}>
      <div style={{ marginBottom: isMobile ? 18 : 28 }}>
        <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:T.textPrimary, marginBottom:4 }}>{t('settings_title')}</h1>
        <p style={{ fontSize:13, color:T.textMuted }}>{t('settings_sub')}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: useOneColumn ? '1fr' : '1fr 300px', gap: isMobile ? 0 : 20 }}>

        {/* LEFT */}
        <div>
          {/* Appearance */}
          <div style={card}>
            <h2 style={{ fontSize:15, fontWeight:700, color:T.textPrimary, marginBottom:4 }}>{t('settings_appear')}</h2>
            <p style={{ fontSize:12, color:T.textMuted, marginBottom:16 }}>{t('settings_appear_sub')}</p>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 10 : 14 }}>
              {Object.keys(THEMES).map(key => {
                const th = THEMES[key]; const Icon = themeIcons[key]; const isActive = theme.key === key;
                return (
                  <button key={key} onClick={()=>applyTheme(key)} style={{
                    position:'relative', borderRadius:14, padding: isMobile ? '12px 14px' : 16, textAlign:'left',
                    border: isActive?`2px solid ${T.accent}`:`2px solid ${T.cardBorder}`,
                    background: isActive?`${T.accent}12`:T.cardBg,
                    cursor:'pointer', transition:'all 0.18s',
                    boxShadow: isActive?`0 4px 16px ${T.accent}33`:'none',
                    display:'flex', alignItems: isMobile ? 'center' : 'flex-start',
                    flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? 12 : 0,
                  }}>
                    {!isMobile && (
                      <div style={{ borderRadius:10, padding:12, marginBottom:12, height:72, display:'flex', gap:8, overflow:'hidden', background:th.pageBg, border:`1px solid ${th.cardBorder}`, width:'100%' }}>
                        <div style={{ width:22, borderRadius:6, background:th.sidebarBg, border:`1px solid ${th.cardBorder}` }}/>
                        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6, paddingTop:4 }}>
                          <div style={{ height:8, borderRadius:4, background:th.accent, width:'65%' }}/>
                          <div style={{ height:6, borderRadius:4, background:th.cardBorder, width:'85%' }}/>
                          <div style={{ height:6, borderRadius:4, background:th.cardBorder, width:'50%' }}/>
                        </div>
                      </div>
                    )}
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Icon size={14} color={isActive?T.accent:T.textMuted}/>
                      <span style={{ fontSize:13, fontWeight:600, color:isActive?T.accent:T.textPrimary }}>{t(`theme_${key}`)}</span>
                    </div>
                    {!isMobile && <p style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>{t(`theme_${key}_desc`)}</p>}
                    {isActive && (
                      <div style={{ position:'absolute', top:10, right:10, width:20, height:20, borderRadius:'50%', background:T.accent, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Check size={11} color={T.accentText} strokeWidth={3}/>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language */}
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <Globe size={16} color={T.accent}/>
              <h2 style={{ fontSize:15, fontWeight:700, color:T.textPrimary }}>{t('settings_lang')}</h2>
            </div>
            <p style={{ fontSize:12, color:T.textMuted, marginBottom:16 }}>{t('settings_lang_sub')}</p>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>{t('settings_language')}</label>
            <div style={{ position:'relative' }}>
              <select value={pendingLang} onChange={e=>setPendingLang(e.target.value)} style={sel}>
                {LANGUAGES.map(lang=><option key={lang} value={lang}>{lang}</option>)}
              </select>
              <div style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:T.textMuted }}>▾</div>
            </div>
            {pendingLang !== language && (
              <p style={{ fontSize:11, color:T.accent, marginTop:8, fontWeight:500 }}>⚡ Click "Save Changes" to apply {pendingLang} across the whole app.</p>
            )}
          </div>

          <button onClick={handleSave} style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'12px 28px', borderRadius:12, border:'none',
            background:saved?'#22c55e':T.accent, color:'#fff',
            fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.2s',
            width: isMobile ? '100%' : 'auto', justifyContent:'center',
            marginBottom: isMobile ? 16 : 0,
          }}>
            {saved?<><Check size={14}/> {t('settings_saved')}</>:<><Save size={14}/> {t('settings_save')}</>}
          </button>
        </div>

        {/* RIGHT — on mobile this comes after */}
        <div style={{ display:'flex', flexDirection:'column', gap: isMobile ? 16 : 16 }}>
          {/* Current theme */}
          <div style={card}>
            <h3 style={{ fontSize:13, fontWeight:700, color:T.textPrimary, marginBottom:14 }}>{t('settings_cur_theme')}</h3>
            {(()=>{
              const Icon = themeIcons[theme.key];
              return (
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:12, background:`${T.accent}14`, borderRadius:12, border:`1px solid ${T.accent}33` }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${T.accent}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon size={18} color={T.accent}/></div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:T.accent }}>{t(`theme_${theme.key}`)} Mode</div>
                    <div style={{ fontSize:11, color:T.textMuted }}>{t(`theme_${theme.key}_desc`)}</div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Account Settings */}
          <div style={card}>
            <h3 style={{ fontSize:13, fontWeight:700, color:T.textPrimary, marginBottom:16 }}>{t('settings_acct')}</h3>
            {accountItems.map((item, i)=>{
              const Icon = item.icon;
              return (
                <button key={item.key} onClick={()=>setModal(item.modal)} style={{
                  display:'flex', alignItems:'center', width:'100%', textAlign:'left',
                  padding:'12px 0', gap:12, background:'none', border:'none', cursor:'pointer',
                  borderBottom: i<accountItems.length-1?`1px solid ${T.divider}`:'none',
                  minHeight:48,
                }}
                  onMouseEnter={e=>e.currentTarget.style.opacity='0.75'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                >
                  <div style={{ width:34, height:34, borderRadius:10, background:`${T.accent}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon size={15} color={T.accent}/></div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:T.textPrimary }}>{item.label}</div>
                    <div style={{ fontSize:11, color:T.textMuted, marginTop:1 }}>{item.sub}</div>
                  </div>
                  <ChevronRight size={15} color={T.textMuted}/>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {modal==='notifications' && <NotificationsModal T={T} t={t} onClose={()=>setModal(null)}/>}
      {modal==='privacy'       && <PrivacyModal       T={T} t={t} onClose={()=>setModal(null)}/>}
      {modal==='devices'       && <DevicesModal       T={T} t={t} onClose={()=>setModal(null)}/>}
      {modal==='api'           && <ApiModal           T={T} t={t} onClose={()=>setModal(null)}/>}
    </div>
  );
}