import React, { useState, useRef, useEffect } from 'react';
import { useUser }       from '../context/UserContext';
import { useTheme }      from '../pages/Themecontext';
import { useLanguage }   from '../context/LanguageContext';
import { useResponsive } from '../hooks/useresponsive';
import { useNavigate }   from 'react-router-dom';
import { User, Mail, Phone, Calendar, Venus, Edit2, Save, X, Camera, Lock, Eye, EyeOff, Trash2, AlertTriangle, Check, Upload } from 'lucide-react';

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
      const lr=await fetch('https://ecg-backend-production-af9b.up.railway.app/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:current})});
      if(!lr.ok){setError('Current password is incorrect.');setLoading(false);return;}
      await fetch('https://ecg-backend-production-af9b.up.railway.app/api/change-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,new_password:next})});
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
    try{await fetch('https://ecg-backend-production-af9b.up.railway.app/api/delete-account',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});onConfirm();}
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
    fetch(`https://ecg-backend-production-af9b.up.railway.app/api/scan-history?email=${encodeURIComponent(user.email)}`)
      .then(r=>r.json()).then(data=>setStats({total_scans:data.total_scans??0,avg_leads:data.avg_leads??'—'}))
      .catch(()=>{}).finally(()=>setStatsLoading(false));
  },[user?.email]);

  const [form,setForm]=useState({full_name:user?.name||'',age:user?.age||'',gender:user?.gender||'',phone:user?.phone||''});
  const handleChange=e=>setForm({...form,[e.target.name]:e.target.value});
  const handleSave=async()=>{
    setError('');
    try{
      const res=await fetch('https://ecg-backend-production-af9b.up.railway.app/api/update-profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:user.email,...form,age:parseInt(form.age)})});
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
  // Reduced top padding on mobile to decrease gap between header and content
  const pagePad = isMobile ? '20px 14px 20px' : isTablet ? '24px 18px' : '32px 40px';
  const card={background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:18,boxShadow:T.cardShadow};
  const inp={width:'100%',border:`1px solid ${T.inputBorder}`,background:T.inputBg,color:T.inputText,padding:'10px 12px',borderRadius:12,fontSize:13,outline:'none',boxSizing:'border-box'};
  const lbl={display:'block',fontSize:11,fontWeight:700,color:T.textMuted,textTransform:'uppercase',letterSpacing:1,marginBottom:6};
  const readFld={display:'flex',alignItems:'center',padding:'10px 12px',borderRadius:12,border:`1px solid ${T.cardBorder}`,background:T.inputBg,fontSize:13,fontWeight:500,color:T.textSecondary};

  return(
    <div style={{padding:pagePad,background:T.pageBg,minHeight:'100%'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
      <div style={{marginBottom: isMobile ? 16 : 24}}>
        <h1 style={{fontSize: isMobile ? 18 : 22,fontWeight:700,color:T.textPrimary,marginBottom:4}}>{t('profile_title')}</h1>
        <p style={{fontSize:13,color:T.textMuted}}>{t('profile_sub')}</p>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap: isMobile ? 14 : 20, maxWidth: isTablet || isMobile ? '100%' : '1000px'}}>
        <div style={{display:'grid',gridTemplateColumns: isMobile || isTablet ? '1fr' : '280px 1fr',gap: isMobile ? 14 : 20}}>
          {/* Avatar card */}
          <div style={{...card,padding: isMobile ? 20 : 28,textAlign:'center', height: 'fit-content'}}>
            <div style={{position:'relative',display:'inline-block',marginBottom:14}}>
              {profilePic
                ?<img src={profilePic} alt="Profile" style={{width: isMobile ? 90 : 110,height: isMobile ? 90 : 110,borderRadius:24,objectFit:'cover',border:`3px solid ${T.accent}`,boxShadow:`0 4px 20px ${T.accent}33`,display:'block'}}/>
                :<div style={{width: isMobile ? 90 : 110,height: isMobile ? 90 : 110,borderRadius:24,background:T.accent,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',boxShadow:`0 4px 20px ${T.accent}44`}}><span style={{color:T.accentText,fontSize: isMobile ? 28 : 36,fontWeight:700}}>{initials.toUpperCase()}</span></div>
              }
              <button onClick={()=>picInputRef.current?.click()} title="Upload photo" style={{position:'absolute',bottom:-6,right:-6,width:34,height:34,borderRadius:10,background:T.accent,border:`2px solid ${T.cardBg}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}>
                <Camera size={15} color={T.accentText}/>
              </button>
              <input ref={picInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePicChange}/>
            </div>
            <h2 style={{fontSize: isMobile ? 15 : 17,fontWeight:700,color:T.textPrimary,marginBottom:3}}>{user?.name||'User'}</h2>
            <p style={{fontSize:12,color:T.textMuted,marginBottom:12}}>{user?.email}</p>
            <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:14,flexWrap:'wrap'}}>
              <button onClick={()=>picInputRef.current?.click()} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 14px',borderRadius:10,border:`1px solid ${T.accent}`,background:`${T.accent}12`,color:T.accent,fontSize:11,fontWeight:600,cursor:'pointer'}}>
                <Upload size={11}/> {profilePic?t('profile_change_photo'):t('profile_upload_photo')}
              </button>
              {profilePic&&<button onClick={handleRemovePic} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:10,border:'1px solid #fecaca',background:'#fef2f2',color:'#ef4444',fontSize:11,fontWeight:600,cursor:'pointer'}}><X size={11}/> {t('profile_remove')}</button>}
            </div>
            {user?.is_profile_complete&&(
              <div style={{display:'inline-flex',alignItems:'center',gap:6,background:`${T.accent}14`,color:T.accent,border:`1px solid ${T.accent}33`,fontSize:11,fontWeight:600,padding:'5px 14px',borderRadius:20,marginBottom:16}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:T.accent,display:'inline-block'}}/> {t('profile_complete')}
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,textAlign:'left'}}>
              {[{label:t('profile_total'),value:statsLoading?'…':String(stats.total_scans)},{label:'LEADS',value:statsLoading?'…':String(stats.avg_leads)}].map(s=>(
                <div key={s.label} style={{background:`${T.accent}10`,border:`1px solid ${T.accent}22`,borderRadius:12,padding:'12px 14px'}}>
                  {statsLoading?<div style={{height:20,background:T.cardBorder,borderRadius:6,animation:'shimmer 1.5s infinite',marginBottom:4}}/>:<div style={{fontSize:18,fontWeight:700,color:T.accent}}>{s.value}</div>}
                  <div style={{fontSize:10,color:T.textMuted,marginTop:3,fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div style={{display:'flex',flexDirection:'column',gap: isMobile ? 14 : 16}}>
            <div style={{...card,padding: isMobile ? 18 : 26}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:10}}>
                <div>
                  <h2 style={{fontSize: isMobile ? 14 : 15,fontWeight:700,color:T.textPrimary}}>{t('profile_info')}</h2>
                  <p style={{fontSize:12,color:T.textMuted,marginTop:2}}>{t('profile_info_sub')}</p>
                </div>
                {!editing
                  ?<button onClick={()=>setEditing(true)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:`${T.accent}14`,color:T.accent,border:`1px solid ${T.accent}33`,borderRadius:10,fontSize:12,fontWeight:600,cursor:'pointer'}}><Edit2 size={12}/> {t('profile_edit')}</button>
                  :<div style={{display:'flex',gap:8}}>
                    <button onClick={()=>{setEditing(false);setError('');}} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 12px',background:T.cardBg,color:T.textSecondary,border:`1px solid ${T.cardBorder}`,borderRadius:10,fontSize:12,fontWeight:600,cursor:'pointer'}}><X size={12}/> {t('profile_cancel')}</button>
                    <button onClick={handleSave} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:T.accent,color:T.accentText,border:'none',borderRadius:10,fontSize:12,fontWeight:700,cursor:'pointer'}}><Save size={12}/> {t('profile_save')}</button>
                  </div>
                }
              </div>
              {saved&&<div style={{padding:'10px 14px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,fontSize:13,color:'#15803d',display:'flex',alignItems:'center',gap:8,marginBottom:16}}><Check size={14}/> {t('profile_updated')}</div>}
              {error&&<div style={{padding:'10px 14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,fontSize:13,color:'#dc2626',marginBottom:16}}>⚠ {error}</div>}
              <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',gap: isMobile ? 12 : 16}}>
                {[
                  {name:'full_name',label:t('profile_fullname'),icon:User,    type:'text',  span:false},
                  {name:'email',    label:t('profile_email'),   icon:Mail,    type:'email', span:false,readOnly:true},
                  {name:'age',      label:t('profile_age'),     icon:Calendar,type:'number',span:false},
                  {name:'gender',   label:t('profile_gender'),  icon:Venus,   type:'select',span:false},
                  {name:'phone',    label:t('profile_phone'),   icon:Phone,   type:'tel',   span:true},
                ].map(({name,label,icon:Icon,type,span,readOnly})=>(
                  <div key={name} style={{gridColumn: span && !isMobile ? '1/-1' : undefined}}>
                    <label style={{...lbl,display:'flex',alignItems:'center',gap:4}}><Icon size={10}/> {label}</label>
                    {readOnly?(
                      <div style={{...readFld,justifyContent:'space-between'}}>
                        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize: isMobile ? 12 : 13}}>{user?.email||'—'}</span>
                        <span style={{fontSize:10,background:T.cardBorder,color:T.textMuted,padding:'1px 7px',borderRadius:4,fontWeight:500,marginLeft:8,flexShrink:0}}>{t('profile_readonly')}</span>
                      </div>
                    ):editing?(
                      type==='select'
                        ?<select name={name} value={form[name]} onChange={handleChange} style={{...inp,padding:'10px 12px'}}><option value="">{t('select_gender')}</option><option>Male</option><option>Female</option><option>Other</option></select>
                        :<input name={name} type={type} value={form[name]} onChange={handleChange} style={inp}/>
                    ):(
                      <div style={readFld}>
                        {name==='age' && user?.age ? `${user.age} Years` : user?.[name==='full_name'?'name':name]||'—'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{...card,padding: isMobile ? 18 : 26}}>
              <h2 style={{fontSize: isMobile ? 14 : 15,fontWeight:700,color:T.textPrimary,marginBottom:16}}>{t('profile_account')}</h2>
              
              <div style={{display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent:'space-between',paddingBottom:16,borderBottom:`1px solid ${T.divider}`,gap:12}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:36,height:36,borderRadius:11,background:`${T.accent}14`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Lock size={16} color={T.accent}/></div>
                  <div><div style={{fontSize:13,fontWeight:600,color:T.textPrimary}}>{t('profile_chg_pwd')}</div><div style={{fontSize:11,color:T.textMuted}}>{t('profile_chg_sub')}</div></div>
                </div>
                <button onClick={()=>setShowPwd(true)} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px 14px',background:`${T.accent}14`,color:T.accent,border:`1px solid ${T.accent}33`,borderRadius:10,fontSize:12,fontWeight:600,cursor:'pointer', width: isMobile ? '100%' : 'auto'}}>
                  <Lock size={12}/> {t('profile_update')}
                </button>
              </div>

              <div style={{display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent:'space-between',paddingTop:16,gap:12}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:36,height:36,borderRadius:11,background:'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Trash2 size={16} color="#ef4444"/></div>
                  <div><div style={{fontSize:13,fontWeight:600,color:'#ef4444'}}>{t('profile_del_acct')}</div><div style={{fontSize:11,color:T.textMuted}}>{t('profile_del_sub')}</div></div>
                </div>
                <button onClick={()=>setShowDel(true)} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px 14px',background:'#fef2f2',color:'#ef4444',border:'1px solid #fecaca',borderRadius:10,fontSize:12,fontWeight:600,cursor:'pointer', width: isMobile ? '100%' : 'auto'}}>
                  <Trash2 size={12}/> {t('profile_delete')}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
      {showPwd&&<ChangePasswordModal email={user?.email} onClose={()=>setShowPwd(false)} T={T} t={t}/>}
      {showDel&&<DeleteAccountModal  email={user?.email} onClose={()=>setShowDel(false)} onConfirm={handleDeleted} T={T} t={t}/>}
    </div>
  );
}