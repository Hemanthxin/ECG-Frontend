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

  return <div ref={wrapRef} style={{width:"100%"}}><canvas ref={canvasRef} style={{display:"block",width:"100%"}}/></div>;
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

  const TABS = [
    {key:"original", label:t('tab_original')},
    {key:"overlay",  label:t('tab_overlay')},
    {key:"leads",    label:t('tab_leads')},
    {key:"medical",  label:t('tab_medical')},
    
    
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
      if(json.status==="success"){ setResult(json.data); setSelLead(json.data.lead_list?.[0]||null); }
      else setError(json.detail||"Invalid response");
    } catch { setError(t('upload_error')); }
    setLoading(false);
  };

  const card    = { background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:16, padding:"22px 24px", marginBottom:20, boxShadow:T.cardShadow };
  const cardTtl = { fontSize:11, fontWeight:700, color:T.textMuted, letterSpacing:1, textTransform:"uppercase", marginBottom:14 };
  const statCard= { flex:1, minWidth:100, background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:14, padding:"16px 18px", boxShadow:T.cardShadow };
  const tabBase = { padding:"8px 18px", borderRadius:9, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif", transition:"all .15s" };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:T.pageBg, minHeight:"100vh", padding:"28px 32px" }}>
      <style>{`
        @keyframes ecgpulse { 0%,100% { opacity:1 } 50% { opacity:.35 } } 
        @keyframes ecgspin { to { transform:rotate(360deg) } }
        @keyframes ecgDraw { 0% { stroke-dashoffset: 600; } 100% { stroke-dashoffset: 0; } }
        @keyframes ecgFadePulse { 0%, 100% { opacity: 0.7; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1.02); } }
      `}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
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
        <div style={cardTtl}>{t('upload_select')}</div>
        <div style={{display:"flex",gap:12,alignItems:"stretch",flexWrap:"wrap"}}>
          <label style={{flex:1,minWidth:200,border:`1.5px dashed ${file?T.accent:T.cardBorder}`,borderRadius:10,padding:"13px 18px",cursor:"pointer",fontSize:13,color:file?T.accent:T.textMuted,display:"flex",alignItems:"center",gap:9,background:file?`${T.accent}0e`:T.inputBg,fontWeight:file?500:400,transition:"all .18s"}}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {file ? file.name : t('upload_choose')}
            <input type="file" accept="image/*" style={{display:"none"}} onChange={onFile}/>
          </label>
          <button onClick={onAnalyze} disabled={loading||!file} style={{padding:"13px 30px",borderRadius:10,border:"none",background:loading||!file?"#e5e7eb":`linear-gradient(135deg,${T.accent},${T.accentHover})`,color:loading||!file?"#9ca3af":"#fff",fontWeight:700,fontSize:13,cursor:loading||!file?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:loading||!file?"none":`0 2px 14px ${T.accent}44`,transition:"all .18s",whiteSpace:"nowrap"}}>
            {loading
              ? <><span style={{display:"inline-block",width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"ecgspin .7s linear infinite"}}/> {t('upload_processing')}</>
              : <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> {t('upload_analyze')}</>
            }
          </button>
        </div>
        {error && <div style={{marginTop:12,padding:"10px 14px",borderRadius:9,background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",fontSize:12}}>⚠ {error}</div>}
      </div>

      {/* Unique ECG Loader Animation */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, background: T.cardBg, borderRadius: 16, border: `1px solid ${T.cardBorder}`, boxShadow: T.cardShadow }}>
          <svg width="220" height="80" viewBox="0 0 220 80" style={{ overflow: "visible" }}>
            {/* Background faded track */}
            <path
              d="M 0 40 L 40 40 L 50 15 L 65 75 L 85 5 L 105 65 L 115 40 L 220 40"
              fill="none"
              stroke={T.divider || "#e5e7eb"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Animated glowing primary line */}
            <path
              d="M 0 40 L 40 40 L 50 15 L 65 75 L 85 5 L 105 65 L 115 40 L 220 40"
              fill="none"
              stroke={T.accent || "#2563eb"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 600,
                strokeDashoffset: 600,
                animation: "ecgDraw 2.5s ease-in-out infinite"
              }}
            />
          </svg>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.accent || "#2563eb", animation: "ecgFadePulse 1.5s ease-in-out infinite", letterSpacing: 0.5 }}>
            Digitizing 12-Lead ECG...
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Stats */}
          <div style={{display:"flex",gap:14,marginBottom:20,flexWrap:"wrap"}}>
            {[
              {label:t('upload_leads'),   val: result.lead_list?.length ?? 0},
              {label:t('upload_samples'), val: result.signals?.II?.length?.toLocaleString() ?? "—"},
              {label:t('upload_duration'),val: result.computed_duration ? `${result.computed_duration}s` : result.signals?.II ? `${(result.signals.II.length/500).toFixed(1)}s` : "—"},
              {label:t('upload_snr'),     val: result.computed_snr ? `${result.computed_snr} dB` : "—"},
              {label:t('upload_record'),  val: recordId || "—"},
            ].map(s=>(
              <div key={s.label} style={statCard}>
                <div style={{fontSize:20,fontWeight:700,color:T.accent,fontFamily:"'DM Mono',monospace"}}>{s.val}</div>
                <div style={{fontSize:10,color:T.textMuted,fontWeight:600,letterSpacing:.8,textTransform:"uppercase",marginTop:3}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",background:T.cardBg,padding:5,borderRadius:12,border:`1px solid ${T.cardBorder}`,width:"fit-content",marginBottom:22,boxShadow:T.cardShadow}}>
            {TABS.map(tb=>(
              <button key={tb.key} onClick={()=>setTab(tb.key)} style={{
                ...tabBase,
                background: tab===tb.key ? `linear-gradient(135deg,${T.accent},${T.accentHover})` : "transparent",
                color: tab===tb.key ? T.accentText : T.textMuted,
                boxShadow: tab===tb.key ? `0 2px 8px ${T.accent}44` : "none",
              }}>{tb.label}</button>
            ))}
          </div>

          {/* ── Medical ECG ── */}
          {tab==="medical" && (
            <div>
              <div style={{fontSize:11,fontWeight:700,color:T.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                Medical Grade — Full 12-Lead ECG <div style={{flex:1,height:1,background:T.headingLine}}/>
              </div>
              <div style={{background:"#fce8e8",borderRadius:14,overflow:"hidden",border:"1.5px solid #f0c0c0",boxShadow:"0 4px 20px rgba(0,0,0,.09)"}}>
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

          {/* ── All Leads ── */}
          {tab==="leads" && (
            <div>
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

          {/* ── 13-Lead Overlay ── */}
          {tab==="overlay" && (
            <div>
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

          {/* ── Original Image ── */}
          {tab==="original" && previewUrl && (
            <div>
              <div style={{fontSize:11,fontWeight:700,color:T.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                Original ECG Image <div style={{flex:1,height:1,background:T.headingLine}}/>
              </div>
              <div style={{background:T.cardBg,border:`1.5px solid ${T.cardBorder}`,borderRadius:14,overflow:"hidden",boxShadow:"0 4px 18px rgba(0,0,0,.07)"}}>
                <div style={{padding:"11px 18px",borderBottom:`1px solid ${T.divider}`,display:"flex",alignItems:"center",gap:6,background:T.inputBg}}>
                  <span style={{width:10,height:10,borderRadius:"50%",background:"#ff5f57",display:"inline-block"}}/>
                  <span style={{width:10,height:10,borderRadius:"50%",background:"#febc2e",display:"inline-block"}}/>
                  <span style={{width:10,height:10,borderRadius:"50%",background:"#28c840",display:"inline-block"}}/>
                  <span style={{marginLeft:8,fontSize:12,color:T.textMuted,fontFamily:"'DM Mono',monospace"}}>{file?.name}</span>
                </div>
                <img src={previewUrl} alt="Original ECG" style={{width:"100%",display:"block",objectFit:"contain",background:"#fff",padding:12,maxHeight:720}}/>
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
        </div>
      )}
    </div>
  );
}