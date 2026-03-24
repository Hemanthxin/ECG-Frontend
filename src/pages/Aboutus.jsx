import React, { useState } from 'react';
import { Heart, Award, Users, Microscope, MapPin, Mail, FileText, X, ChevronRight } from 'lucide-react';
import { useTheme }    from '../pages/Themecontext';
import { useLanguage } from '../context/LanguageContext';
import { useResponsive } from '../hooks/useresponsive';

// ── Changed paths to absolute public paths (/assets/...) for Vercel ──
// IMPORTANT: Move your 'assets' folder from 'src/assets' to 'public/assets'
const LEADERSHIP = [
  { id:'director', name:'DR. USHA MANJUNATH',  role:'Professor & Director, IIHMR Bangalore',             src:'/assets/Screenshot 2026-03-19 220050.png', bio:'Professor with 25+ years of experience. Leads the IIHMR institute and its AI healthcare initiatives.', email:'director@ihmr.ai', tags:['Healthcare Management','AI Research','Leadership'] },
  { id:'admire',   name:'DR. AKASH PRABHUNE',  role:'Assistant Professor & Lead ADMIRE, IIHMR Bangalore',  src:'/assets/Screenshot 2026-03-19 221444.png', bio:'Lead of AI-driven Medical Research (ADMIRE) program. Spearheads cross-disciplinary projects combining cardiology, data science, and clinical outcomes.', email:'admire@ihmr.ai', tags:['ADMIRE Lead','Clinical AI','Dentist'] },
];

const TEAM = [
  { id:'rk', name:'MR. VINAY R SRIHARI',  role:'Assistant Professor, IIHMR Bangalore',  src:'/assets/image.png',                              bio:'Expert in health management research and AI-driven medical solutions.', tags:['Health Management','Research','AI'] },
  { id:'ar', name:'MS. GNANASIRI',        role:'Data Scientist, IIHMR Bangalore',                src:'https://randomuse.me/api/portraits/women/29.jpg',   bio:'Built the nnUNet-Based ECG digitization pipeline.', tags:['nnUNet','Research','Healthcare AI'] },
  { id:'hr', name:'MS. AKILA',    role:'Data scientist, IIHMR Bangalore',                              src:'/assets/Akila.png',        bio:'Built the nnUNet-Based ECG digitization pipeline.',    tags:['PyTorch','YOLO','Signal Processing'] },
  { id:'ps', name:'MR. HEMANTH B',        role:'AIML Engineer, IIHMR Bangalore',        src:'/assets/1000136526.jpg',                          bio:'Built the YOLO-based ECG digitization pipeline.', tags:['ECG Digitization','YOLO','Signal Processing'] },
];

const PAPERS = [
  { id:1, title:'nnUNet-based Semantic Segmentation for 12-Lead ECG Digitization', authors:'Reddy H., Kumar R., Sharma P.', journal:'IEEE Transactions on Biomedical Engineering', year:'2024', abstract:'We present a novel application of the nnUNet framework for pixel-level segmentation of ECG waveforms from paper scans. Our method achieves an average SNR of 21.4 dB and Dice score of 0.97 across all 13 leads on a dataset of 2,000 clinical ECG records.', pdfUrl:'/papers/nnunet-ecg-2024.pdf' },
];

function PaperModal({ paper, T, onClose, t }) {
  return (
    <div style={{ position:'fixed', inset:0, background:T.modalBack, display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }} onClick={onClose}>
      <div style={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:20, width:'100%', maxWidth:560, boxShadow:'0 20px 60px rgba(0,0,0,0.35)', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'20px 24px', borderBottom:`1px solid ${T.divider}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${T.accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}><FileText size={17} color={T.accent}/></div>
            <div><div style={{ fontSize:10, fontWeight:700, color:T.accent, letterSpacing:1, textTransform:'uppercase' }}>Research Paper</div><div style={{ fontSize:10, color:T.textMuted }}>{paper.journal} · {paper.year}</div></div>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:8, border:`1px solid ${T.cardBorder}`, background:T.cardBg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={13} color={T.textMuted}/></button>
        </div>
        <div style={{ padding:'22px 24px' }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:T.textPrimary, lineHeight:1.5, marginBottom:8 }}>{paper.title}</h2>
          <p style={{ fontSize:12, color:T.accent, fontWeight:600, marginBottom:18 }}>{paper.authors}</p>
          <div style={{ background:`${T.accent}08`, border:`1px solid ${T.accent}22`, borderRadius:12, padding:'14px 16px', marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, color:T.accent, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Abstract</div>
            <p style={{ fontSize:13, color:T.textSecondary, lineHeight:1.7 }}>{paper.abstract}</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={()=>window.open(paper.pdfUrl,'_blank','noopener,noreferrer')} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 0', borderRadius:12, border:'none', background:`linear-gradient(135deg,${T.accent},${T.accentHover})`, color:T.accentText, fontWeight:700, fontSize:13, cursor:'pointer' }}>
              <FileText size={15}/> {t('about_open_pdf')}
            </button>
            <button onClick={onClose} style={{ padding:'12px 20px', borderRadius:12, border:`1px solid ${T.cardBorder}`, background:T.cardBg, color:T.textSecondary, fontWeight:600, fontSize:13, cursor:'pointer' }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonPhoto({ src, name, size, radius }) {
  return (
    <div style={{ width:size, height:size, borderRadius:radius, overflow:'hidden', flexShrink:0, border:'4px solid rgba(37,99,235,0.2)', boxShadow:'0 6px 24px rgba(0,0,0,0.14)' }}>
      <img src={src} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
    </div>
  );
}

export default function AboutUs() {
  const { theme: T } = useTheme();
  const { t }        = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const [activePaper, setActivePaper] = useState(null);

  const card = { background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:18, boxShadow:T.cardShadow };
  const pagePadding = isMobile ? '20px 16px' : isTablet ? '24px 20px' : '32px 40px';

  return (
    <div style={{ padding: pagePadding, background:T.pageBg, minHeight:'100%' }}>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${T.accent},${T.accentHover})`, borderRadius:20, padding: isMobile ? '24px 20px' : '28px 32px', marginBottom:24, display:'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent:'space-between', alignItems: isMobile ? 'flex-start' : 'flex-start', flexWrap:'wrap', gap:16 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}><Heart size={16} color="#fff"/></div>
            <span style={{ color:'rgba(255,255,255,0.8)', fontSize:12, fontWeight:500 }}>IHMR.AI</span>
          </div>
          <h1 style={{ color:'#fff', fontSize: isMobile ? 20 : 22, fontWeight:700, marginBottom:8 }}>Institute of Health Management Research</h1>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:13, lineHeight:1.6, maxWidth:520 }}>
            Institute of Health Management Research (IIHMR), Bangalore, is a premier institution specializing in healthcare management education, research, and training. Established in 2004, it serves as the South Campus of the IIHMR Group.
          </p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[{icon:MapPin,text:'Bangalore, India'},{icon:Mail,text:'admire.digihealth@iihmrbangalore.edu.in'}].map(({icon:Icon,text})=>(
            <div key={text} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:12, fontWeight:500, padding:'7px 14px', borderRadius:10 }}>
              <Icon size={12}/> {text}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { icon:Heart,      label:'ECGs Digitized',  value:'100+',          click:false },
          { icon:Award,      label:'Avg SNR Score',    value:'14.4 dB',        click:false },
          { icon:Users,      label:'Hospitals Served', value:'1',              click:false },
          { icon:Microscope, label:t('about_papers'),  value:`${PAPERS.length}`, click:true },
        ].map(({icon:Icon,label,value,click})=>(
          <div key={label} onClick={click?()=>document.getElementById('research-papers')?.scrollIntoView({behavior:'smooth'}):undefined}
            style={{ ...card, padding:'20px', textAlign:'center', cursor:click?'pointer':'default', transition:'all 0.15s', ...(click?{border:`1px solid ${T.accent}55`}:{}) }}
            onMouseEnter={e=>{ if(click) e.currentTarget.style.boxShadow=`0 4px 20px ${T.accent}33`; }}
            onMouseLeave={e=>{ if(click) e.currentTarget.style.boxShadow=T.cardShadow; }}
          >
            <div style={{ width:38, height:38, borderRadius:11, background:`${T.accent}18`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}><Icon size={18} color={T.accent}/></div>
            <div style={{ fontSize:22, fontWeight:700, color:T.accent }}>{value}</div>
            <div style={{ fontSize:11, color:T.textMuted, marginTop:3, fontWeight:500 }}>{label}</div>
            {click && <div style={{ fontSize:10, color:T.accent, marginTop:4, fontWeight:600 }}>View all →</div>}
          </div>
        ))}
      </div>

      {/* Mission + Tech */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr', gap:16, marginBottom:28 }}>
        {[
          { key:'Our Web App', body:'To digitize, democratize, and decode the 12-lead ECG — transforming paper records into structured, AI-ready signals that cardiologists can act on instantly.' },
          { key:'about_tech',    body:'Our pipeline combines YOLO-based row detection, ORB feature matching for image alignment, and a custom nnUNet model for segmentation — achieving an average SNR of 14.4 dB.' },
        ].map(({key,body})=>(
          <div key={key} style={{ ...card, padding:24 }}>
            <h2 style={{ fontSize:13, fontWeight:700, color:T.textPrimary, textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>{t(key)}</h2>
            <p style={{ fontSize:13, color:T.textSecondary, lineHeight:1.7 }}>{body}</p>
          </div>
        ))}
      </div>

      {/* Leadership */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:T.textPrimary }}>{t('about_leadership')}</h2>
          <div style={{ flex:1, height:1, background:T.divider }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr', gap:18 }}>
          {LEADERSHIP.map(person=>(
            <div key={person.id} style={{ ...card, padding:24, display:'flex', flexDirection: isMobile ? 'column' : 'row', gap:22, alignItems: isMobile ? 'center' : 'flex-start', textAlign: isMobile ? 'center' : 'left' }}>
              <PersonPhoto src={person.src} name={person.name} size={isMobile ? 120 : 160} radius={20}/>
              <div style={{ flex:1, minWidth:0 }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:T.textPrimary, marginBottom:3 }}>{person.name}</h3>
                <div style={{ display:'inline-block', fontSize:11, fontWeight:700, color:T.accentText, background:T.accent, padding:'2px 10px', borderRadius:20, marginBottom:10 }}>{person.role}</div>
                <p style={{ fontSize:12.5, color:T.textSecondary, lineHeight:1.7, marginBottom:12 }}>{person.bio}</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent: isMobile ? 'center' : 'flex-start', gap:6, marginBottom:12 }}><Mail size={11} color={T.textMuted}/><span style={{ fontSize:11, color:T.textMuted }}>{person.email}</span></div>
                <div style={{ display:'flex', flexWrap:'wrap', justifyContent: isMobile ? 'center' : 'flex-start', gap:5 }}>
                  {person.tags.map(tag=><span key={tag} style={{ fontSize:10, fontWeight:500, padding:'3px 9px', borderRadius:20, background:`${T.accent}14`, color:T.accent, border:`1px solid ${T.accent}33` }}>{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:T.textPrimary }}>{t('about_team')}</h2>
          <div style={{ flex:1, height:1, background:T.divider }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4,1fr)', gap:16 }}>
          {TEAM.map(member=>(
            <div key={member.id} style={{ ...card, padding:22, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
              <PersonPhoto src={member.src} name={member.name} size={isMobile ? 100 : 180} radius={16}/>
              <div style={{ marginTop:16, width:'100%' }}>
                <div style={{ fontSize:14, fontWeight:700, color:T.textPrimary, marginBottom:3 }}>{member.name}</div>
                <div style={{ fontSize:11, fontWeight:700, color:T.accent, marginBottom:10 }}>{member.role}</div>
                <p style={{ fontSize:12, color:T.textMuted, lineHeight:1.65, marginBottom:14, textAlign: isMobile ? 'center' : 'left' }}>{member.bio}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'center' }}>
                  {member.tags.map(tag=><span key={tag} style={{ fontSize:10, fontWeight:500, padding:'3px 9px', borderRadius:20, background:`${T.accent}14`, color:T.accent, border:`1px solid ${T.accent}33` }}>{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research Papers */}
      <div id="research-papers">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:T.textPrimary }}>{t('about_papers')}</h2>
          <div style={{ background:`${T.accent}18`, color:T.accent, fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:20, border:`1px solid ${T.accent}33` }}>
            {PAPERS.length} {t('Publications')}
          </div>
          <div style={{ flex:1, height:1, background:T.divider }}/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {PAPERS.map((paper,i)=>(
            <div key={paper.id} onClick={()=>setActivePaper(paper)}
              style={{ ...card, padding:'16px 22px', cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:16 }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.accent; e.currentTarget.style.boxShadow=`0 4px 16px ${T.accent}22`; e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.cardBorder; e.currentTarget.style.boxShadow=T.cardShadow; e.currentTarget.style.transform='none'; }}
            >
              <div style={{ width:36, height:36, borderRadius:10, background:`${T.accent}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:13, fontWeight:700, color:T.accent }}>{i+1}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:T.textPrimary, marginBottom:3, lineHeight:1.4 }}>{paper.title}</div>
                <div style={{ fontSize:11, color:T.textMuted }}><span style={{ color:T.accent, fontWeight:500 }}>{paper.authors}</span>&nbsp;·&nbsp;{paper.journal}&nbsp;·&nbsp;<span style={{ fontWeight:600 }}>{paper.year}</span></div>
              </div>
              {!isMobile && (
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:600, color:T.accent, background:`${T.accent}12`, padding:'6px 14px', borderRadius:20, border:`1px solid ${T.accent}33`, flexShrink:0 }}>
                  <FileText size={12}/> {t('about_open_pdf')}
                </div>
              )}
              <ChevronRight size={16} color={T.textMuted}/>
            </div>
          ))}
        </div>
      </div>

      {activePaper && <PaperModal paper={activePaper} T={T} t={t} onClose={()=>setActivePaper(null)}/>}
    </div>
  );
}