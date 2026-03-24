import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageCircle, FileText, Search, Check, Phone } from 'lucide-react';
import { useTheme }    from '../pages/Themecontext';
import { useLanguage } from '../context/LanguageContext';
import { useResponsive } from '../hooks/useresponsive';

const faqs = [
  { q:'What image formats are supported for ECG upload?', a:'PNG, JPG, JPEG, and BMP are all supported. For best results, use a high-resolution scan (≥300 DPI) with good contrast and no glare.' },
  { q:'How long does the AI processing take?', a:'Typically 15–60 seconds depending on image quality and server load. The nnUNet segmentation model requires GPU processing time for accurate waveform extraction.' },
  { q:'What does "Left Calibration" vs "Right Calibration" mean?', a:'This refers to which side contains the calibration pulse (1 mV square wave). The AI auto-detects this using YOLO, routing to the appropriate pipeline.' },
  { q:'Why do some leads show a flat line?', a:'This can happen if the lead region was not clearly visible, had excessive noise, or crop coordinates did not align. Try uploading a higher-quality, well-lit scan.' },
  { q:'How is the SNR score calculated?', a:'SNR is computed by comparing the extracted signal against a simulated ground truth. Scores above 20 dB indicate excellent quality; 21+ dB is exceptional.' },
  { q:'Can I export the digitized signals?', a:'Yes — the backend auto-exports CSV files. Download links can be surfaced in the UI on request.' },
  { q:'Is my patient data secure?', a:'All uploads are processed in memory and not persisted. The system does not store ECG images after analysis is complete.' },
  { q:'How do I interpret the Dice score?', a:'The Dice score measures segmentation accuracy. A score of 0.95+ is excellent.' },
];

function FAQItem({ q, a, T }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border:`1px solid ${open?T.accent+'66':T.cardBorder}`, borderRadius:12, overflow:'hidden', transition:'all 0.15s' }}>
      <button onClick={()=>setOpen(!open)} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', textAlign:'left', background:T.cardBg, border:'none', cursor:'pointer' }}>
        <span style={{ fontSize:13, fontWeight:500, color:open?T.accent:T.textPrimary, flex:1, marginRight:12 }}>{q}</span>
        {open?<ChevronUp size={16} color={T.accent}/>:<ChevronDown size={16} color={T.textMuted}/>}
      </button>
      {open && (
        <div style={{ padding:'12px 18px 16px', background:`${T.accent}08`, borderTop:`1px solid ${T.accent}22` }}>
          <p style={{ fontSize:13, color:T.textSecondary, lineHeight:1.7 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpSupport() {
  const { theme: T } = useTheme();
  const { t }        = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent,    setSent]    = useState(false);
  const [search,  setSearch]  = useState('');

  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  const handleSend = (e) => {
    e.preventDefault();
    const adminEmail = "admire@ihmr.ai";
    const mailSubject = subject ? `Support Request: ${subject}` : "Support Request";
    const mailBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    window.location.href = `mailto:${adminEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
    setSent(true);
    setName(''); setEmail(''); setSubject(''); setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  const card = { background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:18, boxShadow:T.cardShadow };
  const inp  = { width:'100%', border:`1px solid ${T.inputBorder}`, background:T.inputBg, color:T.inputText, padding:'10px 12px', borderRadius:12, fontSize:13, outline:'none', boxSizing:'border-box' };
  const lbl  = { display:'block', fontSize:11, fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:1, marginBottom:6 };
  
  const pagePadding = isMobile ? '20px 16px' : isTablet ? '24px 20px' : '32px 40px';

  return (
    <div style={{ padding: pagePadding, background:T.pageBg, minHeight:'100%' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:T.textPrimary, marginBottom:4 }}>{t('help_title')}</h1>
        <p style={{ fontSize:13, color:T.textMuted }}>{t('help_sub')}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {[
          { icon: FileText, label: t('help_docs'), sub: t('help_docs_sub'), color: '#2563eb', action: () => window.open('/documentation.pdf', '_blank') },
          { icon: MessageCircle, label: t('help_chat'), sub: t('help_chat_sub'), color: '#0d9488', action: () => window.open('https://wa.me/918884774504', '_blank') },
          { icon: Mail, label: t('help_email_card'), sub: 'admire@ihmr.ai', color: '#7c3aed', action: () => window.location.href = 'mailto:admire@ihmr.ai' },
        ].map(({ icon:Icon, label, sub, color, action }) => (
          <div key={label} onClick={action} style={{ ...card, padding:22, textAlign:'center', cursor:'pointer' }}>
            <Icon size={22} color={color} style={{ marginBottom:8 }}/>
            <div style={{ fontSize:13, fontWeight:700, color:T.textPrimary }}>{label}</div>
            <div style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 360px', gap:20 }}>
        <div style={{ ...card, overflow:'hidden' }}>
          <div style={{ padding:'20px 22px', borderBottom:`1px solid ${T.divider}` }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:T.textPrimary, marginBottom:14 }}>{t('help_faq')}</h2>
            <div style={{ position:'relative' }}>
              <Search size={14} color={T.textMuted} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('help_search')} style={{ ...inp, paddingLeft:36 }}/>
            </div>
          </div>
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.length>0 ? filtered.map(f=><FAQItem key={f.q} q={f.q} a={f.a} T={T}/>) : <p style={{ textAlign:'center', fontSize:13, color:T.textMuted, padding:24 }}>No results for "{search}"</p>}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ ...card, padding:22 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:T.textPrimary, marginBottom:4 }}>{t('help_contact')}</h2>
            <p style={{ fontSize:12, color:T.textMuted, marginBottom:18 }}>{t('help_contact_sub')}</p>
            {sent && (
              <div style={{ marginBottom:14, padding:12, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, fontSize:13, color:'#15803d', display:'flex', alignItems:'center', gap:8 }}>
                <Check size={14}/> {t('help_sent')}
              </div>
            )}
            <form onSubmit={handleSend} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={lbl}>{t('help_name')}</label><input value={name} onChange={e=>setName(e.target.value)} required placeholder={t('help_name')} style={inp}/></div>
              <div><label style={lbl}>{t('help_email_lbl')}</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="your@email.com" style={inp}/></div>
              <div>
                <label style={lbl}>{t('help_subject')}</label>
                <select value={subject} onChange={e=>setSubject(e.target.value)} style={inp}>
                  <option value="">{t('select_topic')}</option>
                  {['Upload / Processing Issue','Signal Quality Problem','Account / Login Help','Feature Request','Other'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div><label style={lbl}>{t('help_message')}</label><textarea value={message} onChange={e=>setMessage(e.target.value)} required rows={4} placeholder={t('help_message')} style={{ ...inp, resize:'none', fontFamily:'inherit' }}/></div>
              <button type="submit" style={{ background:T.accent, color:T.accentText, border:'none', borderRadius:12, padding:'12px 0', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <Mail size={14}/> {t('help_send')}
              </button>
            </form>
          </div>

          <div style={{ ...card, padding:18, background:`${T.accent}0e` }}>
            <p style={{ fontSize:11, fontWeight:700, color:T.accent, marginBottom:12, textTransform:'uppercase', letterSpacing:0.8 }}>Other Ways to Reach Us</p>
            {[{icon:Mail,text:'admire.digihealth@iihmrbangalore.edu.in'},{icon:Phone,text:'+91 80 2345 6789'},{icon:MessageCircle,text:'Live Chat: Mon–Fri, 9am–6pm IST'}].map(({icon:Icon,text})=>(
              <div key={text} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:T.accent, marginBottom:8 }}>
                <Icon size={12}/> {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}