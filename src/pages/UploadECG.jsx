import React, { useState, useRef, useEffect, useCallback } from "react";
import { useUser }     from "../context/UserContext";
import { useTheme }    from "../pages/Themecontext";
import { useLanguage } from "../context/LanguageContext";

/* ─── Font ────────────────────────────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
if (!document.querySelector('link[href*="DM+Sans"]')) document.head.appendChild(fontLink);

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function clean(arr) { return (arr||[]).map(v => (v===null||isNaN(v)?0:v)); }
function downsample(arr, max) {
  if (!arr || arr.length <= max) return arr||[];
  const step = arr.length / max;
  return Array.from({length:max},(_,i)=>arr[Math.round(i*step)]??0);
}
function getSig(signals, lead) {
  const s = signals?.[lead]; return s?.length ? s : new Array(2500).fill(0);
}

/* ─── Sparkline ───────────────────────────────────────────────────────────── */
function Sparkline({ data, color="#2563eb", height=64, bgColor="#f9fafb" }) {
  const ref = useRef(null);
  useEffect(()=>{
    const c = ref.current; if(!c||!data?.length) return;
    const ctx=c.getContext("2d"), W=c.width, H=c.height;
    const pts = downsample(clean(data), 700);
    const mn=Math.min(...pts), mx=Math.max(...pts), rng=mx-mn||1;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=bgColor; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(150,180,170,0.35)"; ctx.lineWidth=0.5;
    for(let x=0;x<=W;x+=10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<=H;y+=10){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.lineJoin="round";
    pts.forEach((v,i)=>{
      const x=(i/(pts.length-1))*W, y=H-((v-mn)/rng)*(H-8)-4;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }); ctx.stroke();
  },[data,color,bgColor]);
  return <canvas ref={ref} width={280} height={height} style={{width:"100%",height,display:"block"}}/>;
}

/* ─── Overlay sparkline ───────────────────────────────────────────────────── */
function OverlaySpark({ data }) {
  const ref = useRef(null);
  useEffect(()=>{
    const c=ref.current; if(!c||!data?.length) return;
    const ctx=c.getContext("2d"), W=c.width, H=c.height;
    const pts=downsample(clean(data),600);
    const mn=Math.min(...pts),mx=Math.max(...pts),rng=mx-mn||1;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#0d0d1a"; ctx.fillRect(0,0,W,H);
    ctx.beginPath(); ctx.strokeStyle="#00ffcc"; ctx.lineWidth=1.5; ctx.lineJoin="round";
    pts.forEach((v,i)=>{
      const x=(i/(pts.length-1))*W, y=H-((v-mn)/rng)*(H-6)-3;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }); ctx.stroke();
  },[data]);
  return <canvas ref={ref} width={300} height={80} style={{width:"100%",height:80,display:"block"}}/>;
}

/* ─── Medical ECG Canvas ──────────────────────────────────────────────────── */
function MedicalECG({ signals, leadList, recordId }) {
  const wrapRef   = useRef(null);
  const canvasRef = useRef(null);
  const ROWS = [
    {leads:["I","aVR","V1","V4"],      labels:["I","aVR","V1","V4"]},
    {leads:["II_short","aVL","V2","V5"],labels:["II","aVL","V2","V5"]},
    {leads:["III","aVF","V3","V6"],     labels:["III","aVF","V3","V6"]},
    {leads:["II"],                       labels:["II"]},
  ];
  const RHYTHM = ["II","II_short","I"].find(l=>leadList?.includes(l))||"II";

  const draw = useCallback(()=>{
    const canvas=canvasRef.current, wrap=wrapRef.current;
    if(!canvas||!wrap||!signals) return;
    const DPR=window.devicePixelRatio||1;
    const WCSS=wrap.clientWidth||1000;
    const RR=[1,1,1,0.6], TOTAL=RR.reduce((a,b)=>a+b,0);
    const MT=50,MB=20,ML=8,MR=8;
    const HCSS=MT+MB+Math.round(WCSS*0.145*TOTAL);
    canvas.style.width=WCSS+"px"; canvas.style.height=HCSS+"px";
    canvas.width=WCSS*DPR; canvas.height=HCSS*DPR;
    const ctx=canvas.getContext("2d"); ctx.scale(DPR,DPR);
    const W=WCSS,H=HCSS,PW=W-ML-MR,PH=H-MT-MB;
    const rowH=RR.map(r=>Math.floor(PH*r/TOTAL));
    const rowY=[]; let acc=MT; for(const h of rowH){rowY.push(acc);acc+=h;}

    ctx.fillStyle="#fce8e8"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#fff8f8"; ctx.fillRect(0,0,W,MT-2);
    ctx.fillStyle="#888"; ctx.font=`${Math.round(W*.010)}px 'DM Mono',monospace`;
    ctx.textAlign="center"; ctx.fillText("Samples",W/2,15);
    ctx.fillStyle="#1f2937"; ctx.font=`bold ${Math.round(W*.015)}px 'DM Sans',sans-serif`;
    ctx.fillText(`Medical Grid ECG | Record: ${recordId||"—"}`,W/2,MT-11);

    function grid(x,y,w,h){
      const smX=w/250,smY=h/50,lgX=smX*5,lgY=smY*5;
      ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
      ctx.strokeStyle="rgba(240,140,140,0.4)"; ctx.lineWidth=0.5;
      for(let gx=0;gx<=w+1;gx+=smX){ctx.beginPath();ctx.moveTo(x+gx,y);ctx.lineTo(x+gx,y+h);ctx.stroke();}
      for(let gy=0;gy<=h+1;gy+=smY){ctx.beginPath();ctx.moveTo(x,y+gy);ctx.lineTo(x+w,y+gy);ctx.stroke();}
      ctx.strokeStyle="rgba(210,60,60,0.62)"; ctx.lineWidth=0.9;
      for(let gx=0;gx<=w+1;gx+=lgX){ctx.beginPath();ctx.moveTo(x+gx,y);ctx.lineTo(x+gx,y+h);ctx.stroke();}
      for(let gy=0;gy<=h+1;gy+=lgY){ctx.beginPath();ctx.moveTo(x,y+gy);ctx.lineTo(x+w,y+gy);ctx.stroke();}
      ctx.restore();
    }
    function drawSig(rowData,x,y,w,h){
      const total=rowData.reduce((s,d)=>s+d.length,0);
      if(!total) return;
      ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
      ctx.beginPath(); ctx.strokeStyle="#111"; ctx.lineWidth=0.9; ctx.lineJoin="round"; ctx.lineCap="round";
      let gi=0;
      for(const pts of rowData){
        for(let i=0;i<pts.length;i++,gi++){
          const px=x+(gi/total)*w;
          const v=pts[i]===null||isNaN(pts[i])?0:pts[i];
          const py=(y+h/2)-v*(h/5);
          gi===0||i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        }
      }
      ctx.stroke(); ctx.restore();
    }
    for(let ri=0;ri<ROWS.length;ri++){
      const rx=ML,ry=rowY[ri],rw=PW,rh=rowH[ri];
      grid(rx,ry,rw,rh);
      const isR=ri===3;
      const rd=isR?[downsample(clean(signals[RHYTHM]||[]),3000)]:ROWS[ri].leads.map(l=>downsample(clean(getSig(signals,l)),750));
      drawSig(rd,rx,ry,rw,rh);
      if(!isR){
        const sw=rw/4;
        ROWS[ri].labels.forEach((lbl,ci)=>{
          ctx.fillStyle="#111"; ctx.font=`bold ${Math.round(W*.012)}px 'DM Sans',sans-serif`;
          ctx.textAlign="left"; ctx.fillText(lbl,rx+ci*sw+6,ry+15);
          if(ci>0){ctx.strokeStyle="#111";ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(rx+ci*sw,ry);ctx.lineTo(rx+ci*sw,ry+rh);ctx.stroke();}
        });
      } else {
        ctx.fillStyle="#111"; ctx.font=`bold ${Math.round(W*.012)}px 'DM Sans',sans-serif`;
        ctx.textAlign="left"; ctx.fillText(ROWS[ri].labels[0],rx+6,ry+15);
      }
    }
    ctx.strokeStyle="#ccc"; ctx.lineWidth=1; ctx.strokeRect(ML,MT,PW,PH);
    ctx.fillStyle="#888"; ctx.font=`${Math.round(W*.009)}px 'DM Mono',monospace`;
    ctx.textAlign="right"; ctx.fillText("25 mm/s  ·  10 mm/mV",W-MR-4,H-4);
  },[signals,leadList,recordId]);

  useEffect(()=>{
    draw();
    const ro=new ResizeObserver(draw);
    if(wrapRef.current) ro.observe(wrapRef.current);
    return ()=>ro.disconnect();
  },[draw]);

  return <div ref={wrapRef} style={{width:"100%",maxWidth:"100%",overflow:"hidden"}}><canvas id="medical-ecg-canvas" ref={canvasRef} style={{display:"block",width:"100%"}}/></div>;
}

/* ─── Debug image viewer ──────────────────────────────────────────────────── */
function DebugImage({ src, label, T }) {
  const [zoomed, setZoomed] = useState(false);
  if (!src) return (
    <div style={{background:T.inputBg,borderRadius:10,padding:20,textAlign:"center",color:T.textMuted,fontSize:12,border:`1px dashed ${T.cardBorder}`}}>
      {label} — not available
    </div>
  );
  return (
    <>
      <div style={{background:T.inputBg,borderRadius:10,overflow:"hidden",border:`1px solid ${T.cardBorder}`,cursor:"zoom-in"}} onClick={()=>setZoomed(true)}>
        <div style={{padding:"7px 12px",fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:.8,textTransform:"uppercase",borderBottom:`1px solid ${T.divider}`,display:"flex",alignItems:"center",gap:7}}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          {label}
          <span style={{marginLeft:"auto",color:T.accent,fontSize:9}}>click to expand</span>
        </div>
        <img src={src} alt={label} style={{width:"100%",display:"block",objectFit:"contain",maxHeight:240,padding:8,boxSizing:"border-box",background:"#fff"}}/>
      </div>
      {zoomed && (
        <div onClick={()=>setZoomed(false)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(10,15,30,0.85)",backdropFilter:"blur(6px)",zIndex:9999,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"40px 20px",overflowY:"auto",cursor:"zoom-out"}}>
          <div onClick={e=>e.stopPropagation()} style={{maxWidth:1200,width:"100%",background:"#fff",borderRadius:12,padding:10,boxShadow:"0 30px 60px rgba(0,0,0,0.35)"}}>
            <div style={{padding:"6px 10px 10px",fontSize:11,fontWeight:700,color:"#555",letterSpacing:.8,textTransform:"uppercase"}}>{label}</div>
            <img src={src} alt={label} style={{width:"100%",height:"auto",display:"block",borderRadius:8}}/>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Constants ───────────────────────────────────────────────────────────── */
const LEAD_COLORS = {
  I:"#2563eb",II:"#2563eb",III:"#8b5cf6",aVR:"#f59e0b",aVL:"#ef4444",aVF:"#10b981",
  V1:"#06b6d4",V2:"#3b82f6",V3:"#6366f1",V4:"#a855f7",V5:"#f97316",V6:"#84cc16",II_short:"#2563eb",
};
const ALL13 = ["I","II","III","aVR","aVL","aVF","V1","V2","V3","V4","V5","V6","II_short"];

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function UploadECG() {
  const { user }     = useUser();
  const { theme: T } = useTheme();
  const { t }        = useLanguage();

  const [file,setFile]         = useState(null);
  const [previewUrl,setPreview] = useState(null);
  const [result,setResult]     = useState(null);
  const [loading,setLoading]   = useState(false);
  const [error,setError]       = useState(null);
  const [selLead,setSelLead]   = useState(null);
  const [tab,setTab]           = useState("medical");
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedExampleImage, setSelectedExampleImage] = useState(null);

  // 8 tabs now
  const TABS = [
    {key:"original",    label: t('tab_original')         || "Original"},
    {key:"grid_crop",   label: "Grid Region"},
    {key:"detections",  label: "YOLO Detections"},
    {key:"masks",       label: "Masked Leads"},
    {key:"overlay",     label: t('tab_overlay')          || "13-Lead Overlay"},
    {key:"leads",       label: t('tab_leads')            || "All Leads"},
    {key:"medical",     label: "Output Image"},
  ];

  const recordId = file ? (file.name.replace(/\.[^.]+$/,"").replace(/[^0-9]/g,"")||file.name.replace(/\.[^.]+$/,"")) : "";

  const onFile = e => {
    const f=e.target.files[0]; if(!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
    setResult(null); setError(null); setSelLead(null); setTab("medical");
  };

  const onAnalyze = async () => {
    if(!file) return;
    setLoading(true); setError(null); setResult(null);
    const fd=new FormData();
    fd.append("file", file);
    const url = `https://ecg-backend-production-af9b.up.railway.app/api/upload-ecg${user?.email ? `?email=${encodeURIComponent(user.email)}` : ""}`;
    try {
      const res  = await fetch(url, {method:"POST", body:fd});
      const json = await res.json();
      if(json.status==="success"){
        setResult(json.data);
        setSelLead(json.data.lead_list?.[0]||null);
        setTab("medical");
      } else setError(json.detail||"Invalid response");
    } catch { setError(t('upload_error')); }
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsPdfGenerating(true);
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("landscape", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(31, 41, 55);
      doc.text("Automated 12-Lead ECG Analysis Report", 14, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      const durationText = result.computed_duration
        ? `${result.computed_duration}s`
        : (result.signals?.II ? `${(result.signals.II.length/500).toFixed(1)}s` : "N/A");
      doc.text(`Record ID: ${recordId || "Unknown"}`, 14, 30);
      doc.text(`Date of Analysis: ${new Date().toLocaleString()}`, 14, 36);
      doc.text(`Leads Detected: ${result.lead_list?.length || 0}`, 130, 30);
      doc.text(`Computed Duration: ${durationText}`, 130, 36);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(14, 42, pageWidth - 14, 42);
      const canvas = document.getElementById("medical-ecg-canvas");
      if (canvas) {
        const imgData = canvas.toDataURL("image/png", 1.0);
        const margin = 14;
        const maxPdfWidth = pageWidth - (margin * 2);
        const canvasRatio = canvas.width / canvas.height;
        const pdfHeight = maxPdfWidth / canvasRatio;
        doc.addImage(imgData, "PNG", margin, 48, maxPdfWidth, pdfHeight);
      }
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text("Generated securely by ECG AI System.", 14, doc.internal.pageSize.getHeight() - 10);
      doc.save(`ECG_Report_${recordId || 'analysis'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Make sure jsPDF is installed: npm install jspdf");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const card    = { background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:16, padding:"22px 24px", marginBottom:20, boxShadow:T.cardShadow, width:"100%", boxSizing:"border-box" };
  const cardTtl = { fontSize:11, fontWeight:700, color:T.textMuted, letterSpacing:1, textTransform:"uppercase", marginBottom:14 };
  const statCard= { flex:"1 1 calc(50% - 14px)", minWidth:110, background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:14, padding:"16px 18px", boxShadow:T.cardShadow, boxSizing:"border-box" };
  const tabBase = { flex:"1 1 auto", textAlign:"center", padding:"8px 14px", borderRadius:9, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, fontFamily:"'DM Sans',sans-serif", transition:"all .15s", whiteSpace:"nowrap" };

  // Pipeline step badge
  const PipelineBadge = ({step, label, active}) => (
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:8,background:active?`${T.accent}18`:"transparent",border:`1px solid ${active?T.accent:T.cardBorder}`,fontSize:11,fontWeight:600,color:active?T.accent:T.textMuted,flexShrink:0}}>
      <span style={{width:18,height:18,borderRadius:"50%",background:active?T.accent:T.cardBorder,color:active?"#fff":T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800}}>{step}</span>
      {label}
    </div>
  );

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.pageBg,minHeight:"100vh",padding:"clamp(16px,4vw,32px)",width:"100%",boxSizing:"border-box",overflowX:"hidden",position:"relative"}}>
      <style>{`
        @keyframes ecgpulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes ecgspin{to{transform:rotate(360deg)}}
        @keyframes ecgDraw{0%{stroke-dashoffset:600px}100%{stroke-dashoffset:0px}}
        @keyframes ecgFadePulse{0%,100%{opacity:0.7;transform:scale(0.98)}50%{opacity:1;transform:scale(1.02)}}
        @keyframes modalFadeIn{from{opacity:0;transform:translateY(10px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes backdropFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:16}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:T.textPrimary,marginBottom:2}}>{t('upload_title')}</h1>
          <p style={{fontSize:12,color:T.textMuted}}>{t('upload_sub')}</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7,background:T.badgeBg,border:`1px solid ${T.badgeBorder}`,color:T.accent,fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:20}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:T.accent,display:"inline-block",animation:"ecgpulse 2s infinite"}}/>
          ECG AI System
        </div>
      </div>

      {/* Upload card */}
      <div style={card}>
        <div style={{...cardTtl,display:"flex",alignItems:"center",gap:6}}>
          {t('upload_select')}
          <button onClick={()=>setShowQualityModal(true)} style={{background:"none",border:"none",padding:0,margin:0,display:"flex",alignItems:"center",cursor:"pointer",outline:"none"}} title="Image Quality Guidelines">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={T.textMuted} strokeWidth="2.5" onMouseOver={e=>e.currentTarget.style.stroke=T.accent} onMouseOut={e=>e.currentTarget.style.stroke=T.textMuted}>
              <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01"/>
            </svg>
          </button>
        </div>

        <div style={{display:"flex",gap:12,alignItems:"stretch",flexWrap:"wrap"}}>
          <label style={{flex:1,minWidth:200,border:`1.5px dashed ${file?T.accent:T.cardBorder}`,borderRadius:10,padding:"13px 18px",cursor:"pointer",fontSize:13,color:file?T.accent:T.textMuted,display:"flex",alignItems:"center",gap:9,background:file?`${T.accent}0e`:T.inputBg,fontWeight:file?500:400,transition:"all .18s"}}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{file?file.name:t('upload_choose')}</span>
            <input type="file" accept="image/*" style={{display:"none"}} onChange={onFile}/>
          </label>

          <button onClick={onAnalyze} disabled={loading||!file} style={{flex:"1 1 auto",justifyContent:"center",padding:"13px 30px",borderRadius:10,border:"none",background:loading||!file?"#e5e7eb":`linear-gradient(135deg,${T.accent},${T.accentHover})`,color:loading||!file?"#9ca3af":"#fff",fontWeight:700,fontSize:13,cursor:loading||!file?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:loading||!file?"none":`0 2px 14px ${T.accent}44`,transition:"all .18s",whiteSpace:"nowrap"}}>
            {loading
              ? <><span style={{display:"inline-block",width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"ecgspin .7s linear infinite"}}/>{t('upload_processing')}</>
              : <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>{t('upload_analyze')}</>
            }
          </button>

          <button onClick={()=>window.open('https://wa.me/918884774504?text='+encodeURIComponent('Hi! I would like to digitize an ECG image.'),'_blank')} style={{flex:"1 1 auto",justifyContent:"center",padding:"13px 30px",borderRadius:10,border:"none",background:"#25D366",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:"0 2px 14px rgba(37,211,102,0.3)",transition:"all .18s",whiteSpace:"nowrap"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.405-.883-.733-1.476-1.639-1.649-1.935-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Send via WhatsApp
          </button>
        </div>

        {error && (
          <div style={{marginTop:16,padding:"14px 18px",borderRadius:12,background:"#fef2f2",border:"1px solid #fecaca",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 14px rgba(220,38,38,0.08)"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div style={{color:"#991b1b",fontSize:13.5,fontWeight:600}}>
              {(()=>{let d=error;if(typeof d==='string'){const m=d.match(/"detail"\s*:\s*"([^"]+)"/);if(m&&m[1])d=m[1];d=d.charAt(0).toUpperCase()+d.slice(1);}return d;})()}
            </div>
          </div>
        )}
      </div>

      {/* Loader */}
      {loading && (
        <div style={{textAlign:"center",padding:"60px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:24,background:T.cardBg,borderRadius:16,border:`1px solid ${T.cardBorder}`,boxShadow:T.cardShadow}}>
          {/* Pipeline steps */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            {[
              {step:1,label:"Grid Detection"},
              {step:2,label:"YOLO Rows"},
              {step:3,label:"Lead Crop"},
              {step:4,label:"Masking"},
              {step:5,label:"Signal Extract"},
            ].map((s,i)=>(
              <PipelineBadge key={s.step} step={s.step} label={s.label} active={true}/>
            ))}
          </div>
          <svg width="220" height="80" viewBox="0 0 220 80" style={{overflow:"visible",maxWidth:"100%"}}>
            <path d="M 0 40 L 40 40 L 50 15 L 65 75 L 85 5 L 105 65 L 115 40 L 220 40" fill="none" stroke={T.divider||"#e5e7eb"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 0 40 L 40 40 L 50 15 L 65 75 L 85 5 L 105 65 L 115 40 L 220 40" fill="none" stroke={T.accent||"#2563eb"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{strokeDasharray:"600px",strokeDashoffset:"600px",animation:"ecgDraw 2.5s ease-in-out infinite"}}/>
          </svg>
          <div style={{fontSize:16,fontWeight:700,color:T.accent||"#2563eb",animation:"ecgFadePulse 1.5s ease-in-out infinite",letterSpacing:0.5}}>
            Digitizing 12-Lead ECG (Grid-First Pipeline)...
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Stats */}
          <div style={{display:"flex",gap:14,marginBottom:20,flexWrap:"wrap",width:"100%"}}>
            {[
              {label:t('upload_leads')   ||"Leads",    val: result.lead_list?.length ?? 0},
              {label:t('upload_samples') ||"Samples",  val: result.signals?.II?.length?.toLocaleString() ?? "—"},
              {label:t('upload_duration')||"Duration",  val: result.computed_duration ? `${result.computed_duration}s` : result.signals?.II ? `${(result.signals.II.length/500).toFixed(1)}s` : "—"},
              {label:t('upload_record')  ||"Record",    val: recordId || "—"},
              {label:"Valid Leads",                      val: result.valid_leads != null ? `${result.valid_leads}/13` : `${result.lead_list?.length ?? 0}/13`},
            ].map(s=>(
              <div key={s.label} style={statCard}>
                <div style={{fontSize:20,fontWeight:700,color:T.accent,fontFamily:"'DM Mono',monospace"}}>{s.val}</div>
                <div style={{fontSize:10,color:T.textMuted,fontWeight:600,letterSpacing:.8,textTransform:"uppercase",marginTop:3}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Pipeline info strip */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16,padding:"10px 14px",background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:12,boxShadow:T.cardShadow}}>
            <span style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:.8,textTransform:"uppercase",marginRight:6,alignSelf:"center"}}>Pipeline:</span>
            {[
              {step:1,label:"Roboflow Grid"},
              {step:2,label:"YOLO Rows"},
              {step:3,label:"YOLO Leads"},
              {step:4,label:"nnUNet Mask"},
              {step:5,label:"Signal Extract"},
            ].map(s=>(
              <PipelineBadge key={s.step} step={s.step} label={s.label} active={true}/>
            ))}
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",background:T.cardBg,padding:5,borderRadius:12,border:`1px solid ${T.cardBorder}`,width:"100%",marginBottom:22,boxShadow:T.cardShadow,boxSizing:"border-box"}}>
            {TABS.map(tb=>(
              <button key={tb.key} onClick={()=>setTab(tb.key)} style={{
                ...tabBase,
                background: tab===tb.key ? `linear-gradient(135deg,${T.accent},${T.accentHover})` : "transparent",
                color: tab===tb.key ? T.accentText : T.textMuted,
                boxShadow: tab===tb.key ? `0 2px 8px ${T.accent}44` : "none",
              }}>{tb.label}</button>
            ))}
          </div>

          {/* ── Original Image ── */}
          {tab==="original" && previewUrl && (
            <div style={{animation:"slideIn .2s ease"}}>
              <div style={{fontSize:11,fontWeight:700,color:T.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                Original ECG Image <div style={{flex:1,height:1,background:T.headingLine}}/>
              </div>
              <div style={{background:T.cardBg,border:`1.5px solid ${T.cardBorder}`,borderRadius:14,overflow:"hidden",boxShadow:"0 4px 18px rgba(0,0,0,.07)",width:"100%",boxSizing:"border-box"}}>
                <div style={{padding:"11px 18px",borderBottom:`1px solid ${T.divider}`,display:"flex",alignItems:"center",gap:6,background:T.inputBg}}>
                  <span style={{width:10,height:10,borderRadius:"50%",background:"#ff5f57",display:"inline-block"}}/>
                  <span style={{width:10,height:10,borderRadius:"50%",background:"#febc2e",display:"inline-block"}}/>
                  <span style={{width:10,height:10,borderRadius:"50%",background:"#28c840",display:"inline-block"}}/>
                  <span style={{marginLeft:8,fontSize:12,color:T.textMuted,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{file?.name}</span>
                </div>
                <img src={previewUrl} alt="Original ECG" style={{width:"100%",display:"block",objectFit:"contain",background:"#fff",padding:12,maxHeight:720,boxSizing:"border-box"}}/>
              </div>
            </div>
          )}

          {/* ── Grid Region ── */}
          {tab==="grid_crop" && (
            <div style={{animation:"slideIn .2s ease"}}>
              <div style={{fontSize:11,fontWeight:700,color:T.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                Step 1 — Roboflow Grid Detection <div style={{flex:1,height:1,background:T.headingLine}}/>
                {result.grid_bbox && (
                  <span style={{fontSize:10,color:T.accent,fontFamily:"'DM Mono',monospace",background:`${T.accent}12`,padding:"3px 8px",borderRadius:6}}>
                    bbox: [{result.grid_bbox.join(", ")}]
                  </span>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(420px,1fr))",gap:14}}>
                <DebugImage src={result.grid_detect_b64} label="Original + Grid Bounding Box" T={T}/>
                <DebugImage src={result.grid_crop_b64}   label="Cropped Grid Region (pipeline input)" T={T}/>
              </div>
              <div style={{marginTop:12,padding:"10px 14px",background:`${T.accent}0a`,border:`1px solid ${T.accent}22`,borderRadius:10,fontSize:12,color:T.textMuted}}>
                <b style={{color:T.accent}}>What this does:</b> The Roboflow workflow detects the ECG grid area, ignoring headers, labels, and background. All subsequent processing works only on this cropped region, improving accuracy for any lighting or background condition.
              </div>
            </div>
          )}

          {/* ── YOLO Detections ── */}
          {tab==="detections" && (
            <div style={{animation:"slideIn .2s ease"}}>
              <div style={{fontSize:11,fontWeight:700,color:T.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                Steps 2 & 3 — YOLO Row & Lead Detection <div style={{flex:1,height:1,background:T.headingLine}}/>
              </div>
              <DebugImage src={result.yolo_detections_b64} label="YOLO: Rows (blue) + 13 Lead Boxes (colored)" T={T}/>
              <div style={{marginTop:12,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
                {[
                  {color:"#0078ff",label:"Row Detector",  sub:"4 waveform rows"},
                  {color:"#00d466",label:"Lead Detector", sub:"13 individual leads"},
                  {color:"#ff6b35",label:"nnUNet Mask",   sub:"binary skeleton"},
                  {color:"#8b5cf6",label:"Signal Extract",sub:"exact amplitude"},
                ].map(item=>(
                  <div key={item.label} style={{padding:"10px 12px",background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:10,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:10,height:10,borderRadius:"50%",background:item.color,flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:T.textPrimary}}>{item.label}</div>
                      <div style={{fontSize:10,color:T.textMuted}}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── nnUNet Masks ── */}
          {tab==="masks" && (
            <div style={{animation:"slideIn .2s ease"}}>
              <div style={{fontSize:11,fontWeight:700,color:T.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                Step 4 — nnUNet Mask Extractions <div style={{flex:1,height:1,background:T.headingLine}}/>
              </div>
              {result.lead_masks_b64 && Object.keys(result.lead_masks_b64).length > 0 ? (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
                  {ALL13.filter(l => result.lead_masks_b64[l]).map(l => (
                    <DebugImage key={l} src={result.lead_masks_b64[l]} label={`Lead ${l} Mask`} T={T} />
                  ))}
                </div>
              ) : (
                <div style={{padding:20,textAlign:"center",color:T.textMuted}}>No mask visualizations available.</div>
              )}
            </div>
          )}

          {/* ── 13-Lead Overlay ── */}
          {tab==="overlay" && (
            <div style={{animation:"slideIn .2s ease"}}>
              <div style={{fontSize:11,fontWeight:700,color:T.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                13-Lead Signal Overlay <div style={{flex:1,height:1,background:T.headingLine}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",gap:12}}>
                {ALL13.filter(l=>result.lead_list?.includes(l)).map(l=>(
                  <div key={l} style={{background:"#0d0d1a",borderRadius:12,overflow:"hidden",border:"1px solid #1e1e3a"}}>
                    <div style={{padding:"7px 12px",fontSize:11,fontWeight:700,color:"#00ffcc",fontFamily:"'DM Mono',monospace",letterSpacing:1,background:"rgba(0,255,204,.05)",borderBottom:"1px solid #1e1e3a"}}>Lead {l}</div>
                    <OverlaySpark data={result.signals?.[l]||[]}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── All Leads ── */}
          {tab==="leads" && (
            <div style={{animation:"slideIn .2s ease"}}>
              <div style={{fontSize:11,fontWeight:700,color:T.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                All Leads — Individual Waveforms <div style={{flex:1,height:1,background:T.headingLine}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:12}}>
                {result.lead_list?.map(lead=>{
                  const sel=selLead===lead;
                  const color=LEAD_COLORS[lead]||T.accent;
                  const sig=result.signals?.[lead]||[];
                  const v=sig.filter(x=>x!==null&&!isNaN(x));
                  const mn=v.length?Math.min(...v).toFixed(3):"—";
                  const mx=v.length?Math.max(...v).toFixed(3):"—";
                  const mu=v.length?(v.reduce((a,b)=>a+b,0)/v.length).toFixed(3):"—";
                  return (
                    <div key={lead} onClick={()=>setSelLead(sel?null:lead)} style={{background:sel?`${T.accent}0e`:T.cardBg,border:`1.5px solid ${sel?T.accent:T.cardBorder}`,borderRadius:13,padding:"14px 15px",cursor:"pointer",transition:"all .16s",boxShadow:sel?`0 4px 16px ${T.accent}22`:T.cardShadow}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                          <div style={{fontSize:15,fontWeight:700,fontFamily:"'DM Mono',monospace",color}}>{lead}</div>
                          <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>{sig.length.toLocaleString()} samples</div>
                        </div>
                        <div style={{fontSize:10,color:T.textMuted,lineHeight:1.9,fontFamily:"'DM Mono',monospace",textAlign:"right"}}>
                          <div>↑ {mx} mV</div><div>μ {mu}</div><div>↓ {mn} mV</div>
                        </div>
                      </div>
                      <div style={{background:T.inputBg,borderRadius:8,overflow:"hidden",border:`1px solid ${T.divider}`,marginTop:10}}>
                        <Sparkline data={sig} color={color} height={62} bgColor={T.inputBg}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              {selLead && result.signals?.[selLead] && (
                <div style={{marginTop:16,background:T.cardBg,border:`1.5px solid ${T.accent}`,borderRadius:14,padding:18,boxShadow:`0 4px 20px ${T.accent}18`}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.accent,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Expanded — Lead {selLead}</div>
                  <div style={{background:T.inputBg,borderRadius:6,overflow:"hidden"}}>
                    <Sparkline data={result.signals[selLead]} color={LEAD_COLORS[selLead]||T.accent} height={140} bgColor={T.inputBg}/>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Output Image (Medical ECG) ── */}
          {tab==="medical" && (
            <div style={{animation:"slideIn .2s ease"}}>
              <div style={{fontSize:11,fontWeight:700,color:T.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                Output Image — Full 12-Lead ECG <div style={{flex:1,height:1,background:T.headingLine}}/>
                <button onClick={handleDownloadPDF} disabled={isPdfGenerating} style={{padding:"7px 14px",background:isPdfGenerating?"#9ca3af":T.accent,color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:700,cursor:isPdfGenerating?"wait":"pointer",display:"flex",alignItems:"center",gap:6,boxShadow:isPdfGenerating?"none":`0 2px 10px ${T.accent}33`,transition:"all 0.2s"}}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  {isPdfGenerating?"Generating...":"Download Report"}
                </button>
              </div>
              <div style={{background:"#fce8e8",borderRadius:14,overflow:"hidden",border:"1.5px solid #f0c0c0",boxShadow:"0 4px 20px rgba(0,0,0,.09)",width:"100%",boxSizing:"border-box"}}>
                <MedicalECG signals={result.signals} leadList={result.lead_list} recordId={recordId}/>
              </div>
              <div style={{display:"flex",gap:20,marginTop:10,flexWrap:"wrap"}}>
                {["Row 1: I → aVR → V1 → V4","Row 2: II → aVL → V2 → V5","Row 3: III → aVF → V3 → V6","Row 4: Lead II rhythm strip"].map(tx=>{
                  const [l,...rest]=tx.split(": ");
                  return <span key={tx} style={{fontSize:11,color:T.textMuted,fontFamily:"'DM Mono',monospace"}}>{l}: <b style={{color:T.textSecondary}}>{rest.join(": ")}</b></span>;
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div style={{textAlign:"center",padding:"64px 20px",color:T.textMuted}}>
          <div style={{fontSize:52,marginBottom:16}}>🫀</div>
          <h3 style={{fontSize:16,fontWeight:600,color:T.textPrimary,marginBottom:6}}>{t('upload_empty_h')}</h3>
          <p style={{fontSize:13}}>{t('upload_empty_p')}</p>
          {/* Pipeline overview */}
          <div style={{marginTop:32,display:"flex",justifyContent:"center",gap:0,flexWrap:"wrap"}}>
            {[
              {n:1,icon:"⬛",label:"Grid Detection",sub:"Roboflow isolates ECG area"},
              {n:2,icon:"📏",label:"Row Detection",sub:"YOLO finds 4 waveform rows"},
              {n:3,icon:"🔍",label:"Lead Detection",sub:"YOLO isolates 13 leads"},
              {n:4,icon:"🎭",label:"nnUNet Mask",sub:"Binary skeleton extraction"},
              {n:5,icon:"📈",label:"Signal Values",sub:"Exact original amplitudes"},
            ].map((step,i)=>(
              <React.Fragment key={step.n}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"14px 16px",minWidth:110}}>
                  <div style={{width:38,height:38,borderRadius:10,background:`${T.accent}14`,border:`1px solid ${T.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{step.icon}</div>
                  <div style={{fontSize:11,fontWeight:700,color:T.textPrimary,textAlign:"center"}}>{step.label}</div>
                  <div style={{fontSize:10,color:T.textMuted,textAlign:"center",maxWidth:100}}>{step.sub}</div>
                </div>
                {i<4 && <div style={{alignSelf:"center",color:T.textMuted,fontSize:18,flexShrink:0}}>→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Quality modal */}
      {showQualityModal && (
        <div onClick={()=>setShowQualityModal(false)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(15,23,42,0.65)",backdropFilter:"blur(4px)",zIndex:9999,display:"flex",justifyContent:"center",alignItems:"flex-start",padding:"clamp(20px,5vw,40px) 20px",overflowY:"auto",animation:"backdropFadeIn 0.2s ease-out"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.cardBg,borderRadius:20,padding:"clamp(20px,4vw,32px)",maxWidth:720,width:"100%",boxShadow:"0 25px 50px -12px rgba(0,0,0,0.25)",position:"relative",margin:"auto",animation:"modalFadeIn 0.3s cubic-bezier(0.16,1,0.3,1)"}}>
            <button onClick={()=>setShowQualityModal(false)} style={{position:"absolute",top:16,right:16,background:T.inputBg,border:`1px solid ${T.divider}`,borderRadius:"50%",width:32,height:32,display:"flex",justifyContent:"center",alignItems:"center",cursor:"pointer",color:T.textMuted}} onMouseOver={e=>{e.currentTarget.style.background="#f1f5f9";e.currentTarget.style.color="#0f172a"}} onMouseOut={e=>{e.currentTarget.style.background=T.inputBg;e.currentTarget.style.color=T.textMuted}}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{background:`${T.accent}15`,padding:8,borderRadius:10,color:T.accent}}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <h2 style={{margin:0,color:T.textPrimary,fontSize:20,fontWeight:700}}>Image Quality Guidelines</h2>
            </div>
            <p style={{color:T.textMuted,fontSize:14.5,lineHeight:1.6,marginBottom:28}}>Please upload images of at least this quality so the AI can detect and digitize the signals properly.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:20}}>
              <div style={{background:T.inputBg,borderRadius:12,padding:12,border:`1px solid ${T.divider}`}}>
                <div onClick={()=>setSelectedExampleImage('/norm.png')} style={{width:"100%",height:180,borderRadius:8,overflow:"hidden",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #f1f5f9",cursor:"zoom-in"}}>
                  <img src="/norm.png" alt="Colored ECG" style={{width:"100%",height:"100%",objectFit:"contain",padding:8}}/>
                </div>
                <div style={{textAlign:"center",fontSize:13,fontWeight:600,color:T.textSecondary,marginTop:12}}>Example 1: Colored ECG Image</div>
              </div>
              <div style={{background:T.inputBg,borderRadius:12,padding:12,border:`1px solid ${T.divider}`}}>
                <div onClick={()=>setSelectedExampleImage('/normal+ECG.webp')} style={{width:"100%",height:180,borderRadius:8,overflow:"hidden",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #f1f5f9",cursor:"zoom-in"}}>
                  <img src="/normal+ECG.webp" alt="B&W ECG" style={{width:"100%",height:"100%",objectFit:"contain",padding:8}}/>
                </div>
                <div style={{textAlign:"center",fontSize:13,fontWeight:600,color:T.textSecondary,marginTop:12}}>Example 2: B&W ECG Image</div>
              </div>
            </div>
            <div style={{marginTop:28,display:"flex",justifyContent:"flex-end"}}>
              <button onClick={()=>setShowQualityModal(false)} style={{background:T.accent,color:"#fff",border:"none",padding:"10px 24px",borderRadius:10,fontWeight:600,fontSize:14,cursor:"pointer",boxShadow:`0 4px 12px ${T.accent}40`}}>Got it</button>
            </div>
          </div>
        </div>
      )}

      {/* Large image viewer */}
      {selectedExampleImage && (
        <div onClick={()=>setSelectedExampleImage(null)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(15,23,42,0.8)",backdropFilter:"blur(6px)",zIndex:10000,overflowY:"auto",padding:"40px 20px",animation:"backdropFadeIn 0.2s ease-out"}}>
          <button onClick={()=>setSelectedExampleImage(null)} style={{position:"fixed",top:20,right:20,background:"rgba(15,23,42,0.6)",backdropFilter:"blur(4px)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"50%",width:44,height:44,display:"flex",justifyContent:"center",alignItems:"center",cursor:"pointer",color:"#fff",zIndex:10001}}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:1200,margin:"0 auto",background:"#fff",padding:12,borderRadius:12,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.3)",animation:"modalFadeIn 0.3s cubic-bezier(0.16,1,0.3,1)"}}>
            <img src={selectedExampleImage} alt="Large ECG Example" style={{width:"100%",height:"auto",display:"block",borderRadius:8}}/>
          </div>
        </div>
      )}
    </div>
  );
}