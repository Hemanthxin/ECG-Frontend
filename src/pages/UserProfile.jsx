import React, { useState, useRef, useEffect } from 'react';
import { useUser }       from '../context/UserContext';
import { useTheme }      from '../pages/Themecontext';
import { useLanguage }   from '../context/LanguageContext';
import { useResponsive } from '../hooks/useresponsive';
import { useNavigate }   from 'react-router-dom';
import { User, Mail, Phone, Calendar, Venus, Edit2, Save, X, Camera, Lock, Eye, EyeOff, Trash2, AlertTriangle, Check, Upload } from 'lucide-react';

const API = 'https://ecg-backend-production-af9b.up.railway.app';

function ChangePasswordModal({ email, onClose, T, t }) {
  const [current,setCurrent]=useState(''); const [next,setNext]=useState(''); const [confirm,setConfirm]=useState('');
  const [showC,setShowC]=useState(false); const [showN,setShowN]=useState(false);
  const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [success,setSuccess]=useState(false);

  const handleSubmit=async(e)=>{
    e.preventDefault(); setError('');
    if(next!==confirm){setError("New passwords don't match.");return;}
    if(next.length<6){setError("Password must be at least 6 characters.");return;}
    setLoading(true);
    try{
      const lr=await fetch(`${API}/api/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:current})});
      if(!lr.ok){setError('Current password is incorrect.');setLoading(false);return;}
      await fetch(`${API}/api/change-password`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,new_password:next})});
      setSuccess(true); setTimeout(()=>{setSuccess(false);onClose();},1800);
    }catch{setError('Server connection failed.');}
    setLoading(false);
  };

  const inp={width:'100%',border:`1px solid ${T.inputBorder}`,background:T.inputBg,color:T.inputText,padding:'10px 12px 10px 38px',borderRadius:12,fontSize:13,outline:'none',boxSizing:'border-box'};
  const lbl={display:'block',fontSize:11,fontWeight:700,color:T.textMuted,textTransform:'uppercase',letterSpacing:1,marginBottom:6};

  return(
    <div style={{position:'fixed',inset:0,background:T.modalBack,display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:16}}>
      <div style={{background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:20,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.4)',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 22px',borderBottom:`1px solid ${T.divider}`}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${T.accent}18`,display:'flex',alignItems:'center',justifyContent:'center'}}><Lock size={16} color={T.accent}/></div>
            <div><div style={{fontSize:14,fontWeight:700,color:T.textPrimary}}>{t('profile_chg_pwd')}</div><div style={{fontSize:11,color:T.textMuted}}>{t('profile_chg_sub')}</div></div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.cardBorder}`,background:T.cardBg,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={14} color={T.textMuted}/></button>
        </div>
        <form onSubmit={handleSubmit} style={{padding:22,display:'flex',flexDirection:'column',gap:14}}>
          {error&&<div style={{padding:'10px 14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,fontSize:13,color:'#dc2626',display:'flex',alignItems:'center',gap:8}}><AlertTriangle size={13}/> {error}</div>}
          {success&&<div style={{padding:'10px 14px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,fontSize:13,color:'#16a34a',display:'flex',alignItems:'center',gap:8}}><Check size={13}/> Updated!</div>}
          {[{label:'Current Password',val:current,set:setCurrent,show:showC,setShow:setShowC},{label:'New Password',val:next,set:setNext,show:showN,setShow:setShowN}].map(({label,val,set,show,setShow})=>(
            <div key={label}><label style={lbl}>{label}</label>
              <div style={{position:'relative'}}>
                <Lock size={13} color={T.textMuted} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}}/>
                <input type={show?'text':'password'} value={val} onChange={e=>set(e.target.value)} required style={inp}/>
                <button type="button" onClick={()=>setShow(!show)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer'}}>
                  {show?<EyeOff size={13} color={T.textMuted}/>:<Eye size={13} color={T.textMuted}/>}
                </button>
              </div>
              {label==='New Password'&&val&&<div style={{display:'flex',gap:4,marginTop:6}}>{[1,2,3,4].map(i=><div key={i} style={{height:3,flex:1,borderRadius:4,background:val.length>=i*3?(i<=2?'#f87171':i===3?'#fbbf24':'#4ade80'):T.cardBorder,transition:'background 0.2s'}}/>)}</div>}
            </div>
          ))}
          <div><label style={lbl}>Confirm New Password</label>
            <div style={{position:'relative'}}>
              <Lock size={13} color={T.textMuted} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}}/>
              <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required placeholder="Repeat new password" style={{...inp,borderColor:confirm&&confirm!==next?'#f87171':T.inputBorder}}/>
              {confirm&&confirm===next&&next&&<Check size={13} color="#4ade80" style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)'}}/>}
            </div>
          </div>
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <button type="button" onClick={onClose} style={{flex:1,padding:'11px 0',borderRadius:12,border:`1px solid ${T.cardBorder}`,background:T.cardBg,color:T.textSecondary,fontWeight:600,fontSize:13,cursor:'pointer'}}>{t('profile_cancel')}</button>
            <button type="submit" disabled={loading} style={{flex:1,padding:'11px 0',borderRadius:12,border:'none',background:T.accent,color:T.accentText,fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {loading?<><span style={{width:12,height:12,border:`2px solid ${T.accentText}44`,borderTopColor:T.accentText,borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block'}}/> Updating…</>:t('profile_update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteAccountModal({ email, onClose, onConfirm, T, t }) {
  const [inputEmail,setInputEmail]=useState(''); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
  const matches=inputEmail.trim().toLowerCase()===email?.toLowerCase();

  const handleDelete=async()=>{
    if(!matches){setError('Email does not match.');return;}
    setLoading(true);
    try{await fetch(`${API}/api/delete-account`,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});onConfirm();}
    catch{setError('Server error.');setLoading(false);}
  };

  const inp={width:'100%',border:`1px solid ${matches&&inputEmail?'#4ade80':inputEmail&&!matches?'#f87171':T.inputBorder}`,background:T.inputBg,color:T.inputText,padding:'10px 12px',borderRadius:12,fontSize:13,outline:'none',boxSizing:'border-box'};

  return(
    <div style={{position:'fixed',inset:0,background:T.modalBack,display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:16}}>
      <div style={{background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:20,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.4)',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 22px',borderBottom:`1px solid ${T.divider}`}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center'}}><Trash2 size={16} color="#ef4444"/></div>
            <div><div style={{fontSize:14,fontWeight:700,color:T.textPrimary}}>{t('profile_del_acct')}</div><div style={{fontSize:11,color:T.textMuted}}>Cannot be undone</div></div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.cardBorder}`,background:T.cardBg,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={14} color={T.textMuted}/></button>
        </div>
        <div style={{padding:22}}>
          <div style={{display:'flex',gap:10,padding:14,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,marginBottom:18}}>
            <AlertTriangle size={16} color="#ef4444" style={{flexShrink:0,marginTop:2}}/>
            <div style={{fontSize:12,color:'#dc2626',lineHeight:1.6}}><strong>Permanently deletes:</strong> your account, profile, and all ECG scan history.</div>
          </div>
          {error&&<div style={{padding:'10px 14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,fontSize:13,color:'#dc2626',marginBottom:14}}>⚠ {error}</div>}
          <div style={{marginBottom:18}}>
            <label style={{display:'block',fontSize:12,color:T.textSecondary,marginBottom:8}}>Type <code style={{background:`${T.accent}18`,color:T.accent,padding:'1px 6px',borderRadius:5,fontSize:11}}>{email}</code> to confirm</label>
            <input type="email" value={inputEmail} onChange={e=>{setInputEmail(e.target.value);setError('');}} placeholder="Enter your email" style={inp}/>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:'11px 0',borderRadius:12,border:`1px solid ${T.cardBorder}`,background:T.cardBg,color:T.textSecondary,fontWeight:600,fontSize:13,cursor:'pointer'}}>{t('profile_cancel')}</button>
            <button onClick={handleDelete} disabled={!matches||loading} style={{flex:1,padding:'11px 0',borderRadius:12,border:'none',background:matches?'#ef4444':'#fca5a5',color:'#fff',fontWeight:700,fontSize:13,cursor:matches?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {loading?<><span style={{width:12,height:12,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block'}}/> Deleting…</>:<><Trash2 size={13} color="#fff"/> {t('profile_delete')}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, setUser }  = useUser();
  const { theme: T }       = useTheme();
  const { t }              = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const navigate           = useNavigate();
  const picInputRef        = useRef(null);

  const [editing,setEditing]=useState(false); const [saved,setSaved]=useState(false); const [error,setError]=useState('');
  const [showPwd,setShowPwd]=useState(false); const [showDel,setShowDel]=useState(false);
  const picKey=`ecg-profile-pic-${user?.email}`;
  const [profilePic,setProfilePic]=useState(()=>{try{return localStorage.getItem(picKey)||null;}catch{return null;}});
  const [stats,setStats]=useState({total_scans:'—',avg_leads:'—'});
  const [statsLoading,setStatsLoading]=useState(true);

  useEffect(()=>{
    if(!user?.email)return;
    fetch(`${API}/api/scan-history?email=${encodeURIComponent(user.email)}`)
      .then(r=>r.json()).then(data=>setStats({total_scans:data.total_scans??0,avg_leads:data.avg_leads??'—'}))
      .catch(()=>{}).finally(()=>setStatsLoading(false));
  },[user?.email]);

  const [form,setForm]=useState({full_name:user?.name||'',age:user?.age||'',gender:user?.gender||'',phone:user?.phone||''});
  const handleChange=e=>setForm({...form,[e.target.name]:e.target.value});

  const handleSave=async()=>{
    setError('');
    try{
      const res=await fetch(`${API}/api/update-profile`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:user.email,...form,age:parseInt(form.age)})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.detail||'Update failed');
      const parts=form.full_name.trim().split(' ');
      const updated={...user,name:form.full_name,firstName:parts[0]||'',lastName:parts.slice(1).join(' ')||'',age:form.age,gender:form.gender,phone:form.phone,is_profile_complete:true};
      setUser(updated);localStorage.setItem('user',JSON.stringify(updated));
      setEditing(false);setSaved(true);setTimeout(()=>setSaved(false),2500);
    }catch(err){setError(err.message);}
  };

  const handlePicChange=e=>{
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{const d=ev.target.result;setProfilePic(d);try{localStorage.setItem(picKey,d);}catch{}const u={...user,profilePic:d};setUser(u);localStorage.setItem('user',JSON.stringify(u));};
    reader.readAsDataURL(file);
  };

  const handleRemovePic=()=>{setProfilePic(null);try{localStorage.removeItem(picKey);}catch{}const u={...user,profilePic:null};setUser(u);localStorage.setItem('user',JSON.stringify(u));};
  const handleDeleted=()=>{setUser(null);localStorage.removeItem('user');localStorage.removeItem('token');try{localStorage.removeItem(picKey);}catch{}navigate('/',{replace:true});};

  const initials=((user?.firstName?.[0]||'')+(user?.lastName?.[0]||''))||user?.name?.[0]||'U';
  const isMobileOrTablet = isMobile || isTablet;

  const card = {
    background: T.cardBg,
    border: `1px solid ${T.cardBorder}`,
    borderRadius: 16,
    boxShadow: T.cardShadow,
  };

  const inp = {
    width: '100%',
    border: `1px solid ${T.inputBorder}`,
    background: T.inputBg,
    color: T.inputText,
    padding: '9px 12px',
    borderRadius: 10,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const lbl = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    fontWeight: 700,
    color: T.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  };

  const readFld = {
    display: 'flex',
    alignItems: 'center',
    padding: '9px 12px',
    borderRadius: 10,
    border: `1px solid ${T.cardBorder}`,
    background: T.inputBg,
    fontSize: 13,
    fontWeight: 500,
    color: T.textSecondary,
    minHeight: 38,
  };

  return (
    <div style={{
      padding: isMobile ? '14px 12px' : isTablet ? '16px 16px' : '20px 24px',
      background: T.pageBg,
      minHeight: '100%',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes shimmer { 0%,100%{opacity:.4}50%{opacity:.8} }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, margin: 0 }}>
          {t('profile_title') || 'My Profile'}
        </h1>
        <p style={{ fontSize: 12, color: T.textMuted, margin: '3px 0 0' }}>
          {t('profile_sub') || 'View and manage your personal information'}
        </p>
      </div>

      {/* Main Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobileOrTablet ? '1fr' : '260px 1fr',
        gap: 16,
        alignItems: 'start',
        width: '100%',
      }}>

        {/* ── Left: Avatar Card ── */}
        <div style={{ ...card, padding: '20px 16px' }}>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              {profilePic
                ? <img src={profilePic} alt="Profile" style={{ width: 80, height: 80, borderRadius: 20, objectFit: 'cover', border: `3px solid ${T.accent}`, display: 'block' }}/>
                : <div style={{ width: 80, height: 80, borderRadius: 20, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${T.accent}44` }}>
                    <span style={{ color: T.accentText, fontSize: 26, fontWeight: 700 }}>{initials.toUpperCase()}</span>
                  </div>
              }
              <button onClick={() => picInputRef.current?.click()} title="Upload photo" style={{ position: 'absolute', bottom: -5, right: -5, width: 28, height: 28, borderRadius: 8, background: T.accent, border: `2px solid ${T.cardBg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={12} color={T.accentText}/>
              </button>
              <input ref={picInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePicChange}/>
            </div>

            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, margin: '0 0 2px', textAlign: 'center' }}>{user?.name || 'User'}</h2>
            <p style={{ fontSize: 11, color: T.textMuted, margin: 0, wordBreak: 'break-all', textAlign: 'center' }}>{user?.email}</p>
          </div>

          {/* Photo buttons */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            <button onClick={() => picInputRef.current?.click()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 10px', borderRadius: 9, border: `1px solid ${T.accent}`, background: `${T.accent}10`, color: T.accent, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              <Upload size={10}/> {profilePic ? t('profile_change_photo') : t('profile_upload_photo')}
            </button>
            {profilePic && (
              <button onClick={handleRemovePic} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 10px', borderRadius: 9, border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                <X size={10}/> {t('profile_remove')}
              </button>
            )}
          </div>

          {/* Profile complete badge */}
          {user?.is_profile_complete && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${T.accent}12`, color: T.accent, border: `1px solid ${T.accent}30`, fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, display: 'inline-block' }}/> {t('profile_complete')}
              </div>
            </div>
          )}

          {/* Stats — horizontal on mobile, stacked on sidebar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: t('profile_total') || 'TOTAL SCANS', value: statsLoading ? '…' : String(stats.total_scans) },
              { label: 'LEADS', value: statsLoading ? '…' : String(stats.avg_leads) },
            ].map(s => (
              <div key={s.label} style={{ background: `${T.accent}0e`, border: `1px solid ${T.accent}20`, borderRadius: 10, padding: '10px 12px' }}>
                {statsLoading
                  ? <div style={{ height: 18, background: T.cardBorder, borderRadius: 5, animation: 'shimmer 1.5s infinite', marginBottom: 4 }}/>
                  : <div style={{ fontSize: 20, fontWeight: 700, color: T.accent, lineHeight: 1 }}>{s.value}</div>
                }
                <div style={{ fontSize: 9, color: T.textMuted, marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Details Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

          {/* Personal Information Card */}
          <div style={{ ...card, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: 0 }}>{t('profile_info') || 'Personal Information'}</h2>
                <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>{t('profile_info_sub') || 'Your basic profile details'}</p>
              </div>
              {!editing
                ? <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', background: `${T.accent}12`, color: T.accent, border: `1px solid ${T.accent}30`, borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <Edit2 size={11}/> {t('profile_edit') || 'Edit Profile'}
                  </button>
                : <div style={{ display: 'flex', gap: 7 }}>
                    <button onClick={() => { setEditing(false); setError(''); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: T.cardBg, color: T.textSecondary, border: `1px solid ${T.cardBorder}`, borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}><X size={11}/> {t('profile_cancel')}</button>
                    <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', background: T.accent, color: T.accentText, border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}><Save size={11}/> {t('profile_save')}</button>
                  </div>
              }
            </div>

            {saved && (
              <div style={{ padding: '9px 13px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, fontSize: 12, color: '#15803d', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                <Check size={13}/> {t('profile_updated')}
              </div>
            )}
            {error && (
              <div style={{ padding: '9px 13px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, fontSize: 12, color: '#dc2626', marginBottom: 14 }}>⚠ {error}</div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: 12,
            }}>
              {[
                { name: 'full_name', label: t('profile_fullname') || 'FULL NAME', icon: User,     type: 'text',   span: false },
                { name: 'email',     label: t('profile_email') || 'EMAIL ADDRESS',   icon: Mail,     type: 'email',  span: false, readOnly: true },
                { name: 'age',       label: t('profile_age') || 'AGE',     icon: Calendar, type: 'number', span: false },
                { name: 'gender',    label: t('profile_gender') || 'GENDER',  icon: Venus,    type: 'select', span: false },
                { name: 'phone',     label: t('profile_phone') || 'PHONE',   icon: Phone,    type: 'tel',    span: true },
              ].map(({ name, label, icon: Icon, type, span, readOnly }) => (
                <div key={name} style={{ gridColumn: span && !isMobile ? '1 / -1' : 'auto' }}>
                  <label style={lbl}><Icon size={9}/> {label}</label>
                  {readOnly ? (
                    <div style={{ ...readFld, justifyContent: 'space-between' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{user?.email || '—'}</span>
                      <span style={{ fontSize: 10, background: T.cardBorder, color: T.textMuted, padding: '1px 7px', borderRadius: 4, fontWeight: 500, marginLeft: 8, flexShrink: 0 }}>{t('profile_readonly') || 'Read only'}</span>
                    </div>
                  ) : editing ? (
                    type === 'select'
                      ? <select name={name} value={form[name]} onChange={handleChange} style={{ ...inp, padding: '9px 12px' }}><option value="">{t('select_gender') || 'Select'}</option><option>Male</option><option>Female</option><option>Other</option></select>
                      : <input name={name} type={type} value={form[name]} onChange={handleChange} style={inp}/>
                  ) : (
                    <div style={readFld}>{name === 'age' && user?.age ? `${user.age} Years` : user?.[name === 'full_name' ? 'name' : name] || '—'}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Account Card */}
          <div style={{ ...card, padding: '18px 20px' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: '0 0 14px' }}>{t('profile_account') || 'Account'}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Change Password */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', border: `1px solid ${T.cardBorder}`, borderRadius: 12, gap: 12, flexWrap: isMobileOrTablet ? 'wrap' : 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: '1 1 180px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `${T.accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Lock size={16} color={T.accent}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{t('profile_chg_pwd') || 'Change Password'}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{t('profile_chg_sub') || 'Update your login password'}</div>
                  </div>
                </div>
                <button onClick={() => setShowPwd(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 14px', background: `${T.accent}12`, color: T.accent, border: `1px solid ${T.accent}30`, borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flex: isMobileOrTablet ? '1 1 100%' : '0 0 auto' }}>
                  <Lock size={12}/> {t('profile_update') || 'Update'}
                </button>
              </div>

              {/* Delete Account */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', border: '1px solid #fecaca', borderRadius: 12, gap: 12, flexWrap: isMobileOrTablet ? 'wrap' : 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: '1 1 180px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Trash2 size={16} color="#ef4444"/>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>{t('profile_del_acct') || 'Delete Account'}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{t('profile_del_sub') || 'Permanently remove your account and all data'}</div>
                  </div>
                </div>
                <button onClick={() => setShowDel(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 14px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flex: isMobileOrTablet ? '1 1 100%' : '0 0 auto' }}>
                  <Trash2 size={12}/> {t('profile_delete') || 'Delete'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showPwd && <ChangePasswordModal email={user?.email} onClose={() => setShowPwd(false)} T={T} t={t}/>}
      {showDel && <DeleteAccountModal  email={user?.email} onClose={() => setShowDel(false)} onConfirm={handleDeleted} T={T} t={t}/>}
    </div>
  );
}