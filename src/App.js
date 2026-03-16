import { useState, useRef, useEffect } from "react";

const SUPABASE_URL = "https://mrmmkjhoinnkbdwfeqeq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybW1ramhvaW5ua2Jkd2ZlcWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzc4NzksImV4cCI6MjA4ODc1Mzg3OX0.KUiS6MG7n6hGYwnu1CxFDX1VS73ymBkRUIADz2Kyr_g";
const EXERCISES_URL = "https://raw.githubusercontent.com/obesitymanagementschool-code/wod-forge/main/src/data/exercises.json";

const sb = {
  h(t) { return { apikey: SUPABASE_KEY, Authorization: `Bearer ${t||SUPABASE_KEY}`, "Content-Type": "application/json" }; },
  async signIn(e,p) { const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:this.h(),body:JSON.stringify({email:e,password:p})}); return r.json(); },
  async signUp(e,p) { const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`,{method:"POST",headers:this.h(),body:JSON.stringify({email:e,password:p})}); return r.json(); },
  async signOut(t) { await fetch(`${SUPABASE_URL}/auth/v1/logout`,{method:"POST",headers:this.h(t)}); },
  async select(t,table,filter="") { const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}&order=created_at.desc`,{headers:this.h(t)}); return r.json(); },
  async insert(t,table,data) { const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`,{method:"POST",headers:{...this.h(t),Prefer:"return=representation"},body:JSON.stringify(data)}); return r.json(); },
  async remove(t,table,id) { await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,{method:"DELETE",headers:this.h(t)}); },
};

const FONT = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";
const C = { bg:"#07070f", card:"#0d0d1a", border:"#1e1e30", text:"#e8e8f4", muted:"#555", dim:"#333", flamingo:"#FF6FA8" };
const DAYS_ES = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

const DAY_SECTIONS = [
  { id:"warmup",   label:"Warm-up / Mobility",  icon:"🔥", color:"#FF9500" },
  { id:"strength", label:"Strength",            icon:"🏋️", color:"#FF6FA8" },
  { id:"wod",      label:"WOD",                 icon:"⚡", color:"#FF2D55" },
  { id:"cardio",   label:"Cardio",              icon:"🏃", color:"#34C759" },
  { id:"cooldown", label:"Cooldown / Stretching",icon:"🧘", color:"#30D5C8" },
];

const BENCHMARK_METRICS = [
  {id:"time",    label:"Tiempo",        icon:"⏱", unit:"mm:ss"},
  {id:"reps",    label:"Reps totales",  icon:"🔢", unit:"reps"},
  {id:"weight",  label:"Kilos",         icon:"🏋️", unit:"kg"},
  {id:"calories",label:"Calorias",      icon:"🔥", unit:"cal"},
  {id:"meters",  label:"Metros",        icon:"📏", unit:"m"},
];

const EQUIPMENT_LIST = [
  {id:"barbell",       label:"Barra olimpica",        icon:"🏋️", group:"Barras"},
  {id:"bumper_plates", label:"Discos bumper",          icon:"⚫", group:"Barras"},
  {id:"dumbbell",      label:"Mancuernas",             icon:"💪", group:"Barras"},
  {id:"kettlebell",    label:"Kettlebell",             icon:"🫙", group:"Barras"},
  {id:"pullup_bar",    label:"Barra dominadas",        icon:"🔝", group:"Gimnasia"},
  {id:"rings",         label:"Anillas",                icon:"⭕", group:"Gimnasia"},
  {id:"box",           label:"Cajon / Box",            icon:"📦", group:"Gimnasia"},
  {id:"wall",          label:"Pared",                  icon:"🧱", group:"Gimnasia"},
  {id:"rope",          label:"Cuerda de trepar",       icon:"🪢", group:"Gimnasia"},
  {id:"ghd",           label:"GHD",                    icon:"🔄", group:"Gimnasia"},
  {id:"row_erg",       label:"Row Erg",                icon:"🚣", group:"Maquinas"},
  {id:"ski_erg",       label:"Ski Erg",                icon:"⛷️", group:"Maquinas"},
  {id:"echo_bike",     label:"Echo Bike",              icon:"🚵", group:"Maquinas"},
  {id:"bike_erg",      label:"Bike Erg",               icon:"🚲", group:"Maquinas"},
  {id:"wallball",      label:"Wall Ball",              icon:"🟤", group:"Accesorios"},
  {id:"jump_rope",     label:"Cuerda de saltar",       icon:"⟳",  group:"Accesorios"},
  {id:"sled",          label:"Trineo",                 icon:"🛷", group:"Accesorios"},
  {id:"running_track", label:"Pista exterior",         icon:"🏁", group:"Exterior"},
];

const EXERCISES = [
  {id:"pullup",        name:"Pull-ups",            req:["pullup_bar"],      cat:"gym", unit:"reps", skill:"low",  cycleTime:3,   minInterval:30},
  {id:"ctb_pullup",    name:"Chest-to-Bar",        req:["pullup_bar"],      cat:"gym", unit:"reps", skill:"mid",  cycleTime:4,   minInterval:30},
  {id:"muscle_up_bar", name:"Bar Muscle-ups",      req:["pullup_bar"],      cat:"gym", unit:"reps", skill:"high", cycleTime:6,   minInterval:40},
  {id:"toes_bar",      name:"Toes-to-Bar",         req:["pullup_bar"],      cat:"gym", unit:"reps", skill:"mid",  cycleTime:3,   minInterval:25},
  {id:"hspu",          name:"HSPU",                req:["wall"],            cat:"gym", unit:"reps", skill:"high", cycleTime:5,   minInterval:30},
  {id:"box_jump",      name:"Box Jumps",           req:["box"],             cat:"gym", unit:"reps", skill:"low",  cycleTime:3,   minInterval:20},
  {id:"burpee",        name:"Burpees",             req:[],                  cat:"gym", unit:"reps", skill:"low",  cycleTime:5,   minInterval:20},
  {id:"double_under",  name:"Double Unders",       req:["jump_rope"],       cat:"gym", unit:"reps", skill:"mid",  cycleTime:0.4, minInterval:15},
  {id:"rope_climb",    name:"Rope Climbs",         req:["rope"],            cat:"gym", unit:"reps", skill:"mid",  cycleTime:25,  minInterval:50},
  {id:"ring_dip",      name:"Ring Dips",           req:["rings"],           cat:"gym", unit:"reps", skill:"mid",  cycleTime:3.5, minInterval:25},
  {id:"pistol",        name:"Pistol Squats",       req:[],                  cat:"gym", unit:"reps", skill:"mid",  cycleTime:4,   minInterval:25},
  {id:"pushup",        name:"Push-ups",            req:[],                  cat:"gym", unit:"reps", skill:"low",  cycleTime:2.5, minInterval:15},
  {id:"thruster",      name:"Thrusters",           req:["barbell"],         cat:"wl",  unit:"reps", skill:"low",  cycleTime:4,   minInterval:20, rxM:43,  rxW:29},
  {id:"clean",         name:"Power Clean",         req:["barbell"],         cat:"wl",  unit:"reps", skill:"low",  cycleTime:5,   minInterval:25, rxM:61,  rxW:43},
  {id:"squat_clean",   name:"Squat Clean",         req:["barbell"],         cat:"wl",  unit:"reps", skill:"mid",  cycleTime:6,   minInterval:30, rxM:70,  rxW:47},
  {id:"snatch",        name:"Squat Snatch",        req:["barbell"],         cat:"wl",  unit:"reps", skill:"high", cycleTime:9,   minInterval:40, rxM:52,  rxW:34},
  {id:"deadlift",      name:"Deadlift",            req:["barbell"],         cat:"wl",  unit:"reps", skill:"low",  cycleTime:4,   minInterval:20, rxM:102, rxW:70},
  {id:"push_press",    name:"Push Press",          req:["barbell"],         cat:"wl",  unit:"reps", skill:"low",  cycleTime:3.5, minInterval:20, rxM:52,  rxW:34},
  {id:"kb_swing",      name:"KB Swing American",   req:["kettlebell"],      cat:"wl",  unit:"reps", skill:"low",  cycleTime:2.5, minInterval:15, rxM:32,  rxW:24},
  {id:"wall_ball",     name:"Wall Balls",          req:["wallball","wall"], cat:"wl",  unit:"reps", skill:"low",  cycleTime:3,   minInterval:15, rxM:9,   rxW:6},
  {id:"row_cal",       name:"Row (Cal)",           req:["row_erg"],         cat:"machine", unit:"cal", skill:"low", cycleTime:4, minInterval:25},
  {id:"echo_cal",      name:"Echo Bike (Cal)",     req:["echo_bike"],       cat:"machine", unit:"cal", skill:"low", cycleTime:3.5,minInterval:25},
  {id:"run_200",       name:"Run 200m",            req:["running_track"],   cat:"run", unit:"m",   skill:"low",  cycleTime:0.22, minInterval:45,  fixed:200},
  {id:"run_400",       name:"Run 400m",            req:["running_track"],   cat:"run", unit:"m",   skill:"low",  cycleTime:0.225,minInterval:90,  fixed:400},
];

const CYCLE_MULT = {beginner:1.9, scaled:1.45, intermediate:1.2, rx:1.0};
const SKILL_ALLOWED = {beginner:["low"], scaled:["low","mid"], intermediate:["low","mid","high"], rx:["low","mid","high"]};
const CTX = {emom_1min:{workSec:42}, amrap:{workSec:75}, fortime:{workSec:60}, chipper:{workSec:45}};

function calcReps(ex, lvl, ctx) {
  if (!ex) return 0;
  if (ex.fixed) return ex.fixed;
  const mult = CYCLE_MULT[lvl]||1.2;
  const ws = (CTX[ctx]||CTX.amrap).workSec;
  const raw = Math.floor((ws*0.88)/(ex.cycleTime*mult));
  const caps = {gym:[1,35], wl:[1,25], machine:[3,50], run:[1,1]};
  const [mn,mx] = caps[ex.cat]||[1,30];
  return Math.max(mn, Math.min(mx, raw));
}

function filterCtx(pool, lvl, ctx) {
  const allowed = SKILL_ALLOWED[lvl]||["low"];
  const mult = CYCLE_MULT[lvl]||1.2;
  const ws = (CTX[ctx]||CTX.amrap).workSec;
  return pool.filter(ex => {
    if (!allowed.includes(ex.skill)) return false;
    if (ex.fixed) return ex.fixed*ex.cycleTime*mult <= ws*1.1;
    return ex.cycleTime*mult <= ws*0.95;
  });
}

function safePool(pool, lvl, ctx, min=2) {
  const f = filterCtx(pool, lvl, ctx);
  if (f.length >= min) return f;
  return pool.filter(e => (SKILL_ALLOWED[lvl]||["low"]).includes(e.skill));
}

function flexDur(max) {
  const min = Math.round(max*0.75), opts = [];
  for (let d=min; d<=max; d++) opts.push(d);
  return opts[Math.floor(Math.random()*opts.length)];
}

const TEMPLATES = {
  amrap:       {format:"AMRAP",     pCtx:"amrap",     label:"AMRAP Clasico",            ref:"Open 11.1",
    build({dur,exs,lvl}) { const d=flexDur(dur),p=safePool(exs,lvl,"amrap"); return {type:"AMRAP",totalTime:d,blocks:[{kind:"AMRAP",minutes:d,movements:p.slice(0,3).map(e=>({ex:e,reps:calcReps(e,lvl,"amrap")}))}],scoring:`AMRAP ${d} min`}; }},
  amrap_double:{format:"AMRAP",     pCtx:"amrap",     label:"Double AMRAP",             ref:"Games 2019",
    build({dur,exs,lvl}) { const d=flexDur(dur),h=Math.max(5,Math.floor((d-3)/2)),p=safePool(exs,lvl,"amrap"),m=p.slice(0,3).map(e=>({ex:e,reps:calcReps(e,lvl,"amrap")})); return {type:"AMRAP",totalTime:h*2+3,blocks:[{kind:"AMRAP",minutes:h,movements:m},{kind:"REST",minutes:3,note:"Retoma desde 0"},{kind:"AMRAP",minutes:h,movements:m}],scoring:`2x AMRAP ${h}min`}; }},
  emom2:       {format:"EMOM",      pCtx:"emom_1min", label:"EMOM Alternado",           ref:"Open 12.5",
    build({dur,exs,lvl}) { const d=flexDur(dur),p=safePool(exs,lvl,"emom_1min"),r=Math.floor(d/2); return {type:"EMOM",totalTime:r*2,blocks:[{kind:"EMOM",minutes:r*2,scheme:p.slice(0,2).map((e,i)=>({minute:i===0?"Min impares":"Min pares",ex:e,reps:calcReps(e,lvl,"emom_1min")})),note:`${r} rondas`}],scoring:`EMOM ${r*2} min`}; }},
  emom3:       {format:"EMOM",      pCtx:"emom_1min", label:"EMOM 3 Movimientos",       ref:"Semifinals 2022",
    build({dur,exs,lvl}) { const d=flexDur(dur),p=safePool(exs,lvl,"emom_1min"),r=Math.floor(d/3); return {type:"EMOM",totalTime:r*3,blocks:[{kind:"EMOM",minutes:r*3,scheme:p.slice(0,3).map((e,i)=>({minute:`Min ${i+1},${i+4}...`,ex:e,reps:calcReps(e,lvl,"emom_1min")})),note:`Ciclo 3 min. ${r} rondas.`}],scoring:`EMOM ${r*3} min`}; }},
  fortime:     {format:"For Time",  pCtx:"fortime",   label:"For Time - Rondas",        ref:"Open 14.5",
    build({dur,exs,lvl}) { const d=flexDur(dur),r=[3,4,5][Math.floor(Math.random()*3)],p=safePool(exs,lvl,"fortime"); return {type:"For Time",totalTime:d,timeCap:d,blocks:[{kind:"ForTime",rounds:r,movements:p.slice(0,3).map(e=>({ex:e,reps:calcReps(e,lvl,"fortime")})),note:`Cap: ${d} min`}],scoring:`${r} RFT`}; }},
  chipper:     {format:"For Time",  pCtx:"chipper",   label:"Chipper",                  ref:"Games 2016",
    build({dur,exs,lvl}) { const d=flexDur(dur),p=safePool(exs,lvl,"chipper"); return {type:"For Time",totalTime:d,timeCap:d,blocks:[{kind:"ForTime",rounds:1,movements:p.slice(0,Math.min(6,p.length)).map(e=>({ex:e,reps:calcReps(e,lvl,"chipper")})),note:`Cap: ${d} min`}],scoring:"Chipper For Time"}; }},
  fran:        {format:"For Time",  pCtx:"fortime",   label:"21-15-9",                  ref:"Fran / Diane",
    build({dur,exs,lvl}) { const d=flexDur(dur),p=safePool(exs,lvl,"fortime"); return {type:"For Time",totalTime:d,timeCap:d,blocks:[{kind:"ForTime",rounds:1,descending:[21,15,9],movements:p.slice(0,2).map(e=>({ex:e,reps:null})),note:`Cap: ${d} min`}],scoring:"21-15-9 For Time"}; }},
  hero:        {format:"Hero WOD",  pCtx:"fortime",   label:"Hero WOD",                 ref:"Murph / DT",
    build({dur,exs,lvl}) { const d=flexDur(dur),p=safePool(exs,lvl,"fortime"); return {type:"Hero WOD",totalTime:d,timeCap:d,blocks:[{kind:"ForTime",rounds:5,movements:p.slice(0,4).map(e=>({ex:e,reps:calcReps(e,lvl,"fortime")})),note:`5 RFT. Cap: ${d} min`}],scoring:"Hero WOD 5 RFT"}; }},
  emom_amrap:  {format:"Combinado", pCtx:"emom_1min", label:"EMOM + AMRAP",             ref:"Semifinals 2021",
    build({dur,exs,lvl}) { const d=flexDur(dur),em=Math.max(6,Math.floor(d*0.4)),am=Math.max(5,d-em-2),ep=safePool(exs.slice(0,3),lvl,"emom_1min"),ap=safePool(exs.slice(2),lvl,"amrap"); return {type:"Combinado",totalTime:em+2+am,blocks:[{kind:"EMOM",minutes:em,scheme:ep.slice(0,2).map((e,i)=>({minute:i===0?"Min impares":"Min pares",ex:e,reps:calcReps(e,lvl,"emom_1min")})),note:`EMOM ${em} min`},{kind:"REST",minutes:2,note:"2 min descanso"},{kind:"AMRAP",minutes:am,movements:ap.slice(0,3).map(e=>({ex:e,reps:calcReps(e,lvl,"amrap")})),note:`AMRAP ${am} min`}],scoring:`EMOM ${em}min + AMRAP ${am}min`}; }},
  buy_in:      {format:"Combinado", pCtx:"amrap",     label:"Buy-in + AMRAP + Cash-out",ref:"Rogue 2020",
    build({dur,exs,lvl}) { const d=flexDur(dur),am=Math.max(8,d-5),p=safePool(exs,lvl,"amrap"); return {type:"Combinado",totalTime:d,blocks:[{kind:"BuyIn",note:"Completa ANTES del AMRAP",movements:[{ex:p[0],reps:calcReps(p[0],lvl,"amrap")}]},{kind:"AMRAP",minutes:am,movements:p.slice(1,4).map(e=>({ex:e,reps:calcReps(e,lvl,"amrap")}))},{kind:"CashOut",note:"Solo si queda tiempo",movements:[{ex:p[p.length-1],reps:calcReps(p[p.length-1],lvl,"amrap")}]}],scoring:`Buy-in + AMRAP ${am}min + Cash-out`}; }},
};

function generateWOD({format, duration, level, equipment, maxExercises}) {
  const equipOk = e => e.req.length===0 || e.req.every(r => equipment[r]);
  const pool = EXERCISES.filter(equipOk);
  const cands = Object.values(TEMPLATES).filter(t => format==="Aleatorio" || t.format===format);
  const tmpl = cands.length>0 ? cands[Math.floor(Math.random()*cands.length)] : Object.values(TEMPLATES)[0];
  const filtered = safePool(pool, level, tmpl.pCtx||"amrap");
  const chosen = [...filtered].sort(()=>Math.random()-0.5).slice(0, Math.max(2,Math.min(maxExercises||5,filtered.length)));
  const wod = tmpl.build({dur:duration, exs:chosen, lvl:level});
  return {...wod, templateLabel:tmpl.label, ref:tmpl.ref, energyColor:C.flamingo, id:Date.now().toString(), generatedAt:new Date().toISOString(), level};
}

function calcLoadStats(history) {
  const now = new Date(), dayMs = 86400000;
  const getD = h => new Date(h.date||h.created_at);
  const last28 = history.filter(h => now-getD(h) <= 28*dayMs);
  const last7  = history.filter(h => now-getD(h) <= 7*dayMs);
  const acuteLoad   = last7.reduce((s,h)  => s+(h.carga_sesion||0), 0);
  const chronicLoad = last28.reduce((s,h) => s+(h.carga_sesion||0), 0)/4;
  const acwr = chronicLoad>0 ? acuteLoad/chronicLoad : 0;
  const weeks = [3,2,1,0].map(w => {
    const start=new Date(now); start.setDate(start.getDate()-(w+1)*7);
    const end=new Date(now);   end.setDate(end.getDate()-w*7);
    const load = history.filter(h => { const d=getD(h); return d>=start&&d<end; }).reduce((s,h)=>s+(h.carga_sesion||0),0);
    return {label:`S-${3-w}`, load};
  });
  const daysThisWeek = new Set(last7.map(h=>fmtDate(getD(h)))).size;
  const totalMins = history.reduce((s,h)=>s+(h.duracion_min||0),0);
  const withRpe = history.filter(h=>h.rpe);
  const avgRpe = withRpe.length>0 ? (withRpe.reduce((s,h)=>s+h.rpe,0)/withRpe.length).toFixed(1) : 0;
  return {acuteLoad:Math.round(acuteLoad), chronicLoad:Math.round(chronicLoad), acwr:acwr.toFixed(2), weeks, daysThisWeek, totalMins, avgRpe};
}

function mapToAppExercise(ex) {
  const catMap = {strength:"wl",cardio:"run",stretching:"gym",powerlifting:"wl",strongman:"wl",olympic_weightlifting:"wl",plyometrics:"gym"};
  const eqMap = {barbell:"barbell",dumbbell:"dumbbell",kettlebells:"kettlebell","body only":null,machine:null,cable:null,bands:null,other:null};
  const eqId = eqMap[ex.equipment?.toLowerCase()]||null;
  return {
    id:ex.id, name:ex.name,
    req:eqId?[eqId]:[],
    cat:catMap[ex.category]||"gym",
    unit:"reps",
    skill:ex.level==="beginner"?"low":ex.level==="intermediate"?"mid":"high",
    cycleTime:4, minInterval:20,
    primaryMuscles:ex.primaryMuscles||[],
    equipment:ex.equipment,
    isFromDB:true,
  };
}

function useExerciseDB(session) {
  const [dbExercises, setDbExercises] = useState([]);
  const [customExercises, setCustomExercises] = useState([]);
  const [loadingEx, setLoadingEx] = useState(true);

  useEffect(() => {
    fetch(EXERCISES_URL).then(r=>r.json()).then(data => {
      setDbExercises(data.map(mapToAppExercise));
      setLoadingEx(false);
    }).catch(()=>setLoadingEx(false));
  }, []);

  useEffect(() => {
    if (!session?.token) return;
    sb.select(session.token,"custom_exercises","select=*").then(r => {
      if (Array.isArray(r)) setCustomExercises(r.map(e=>e.exercise));
    }).catch(()=>{});
  }, [session]);

  async function saveCustomExercise(ex) {
    if (!session?.token) return;
    await sb.insert(session.token,"custom_exercises",{user_id:session.user.id,exercise:ex}).catch(()=>{});
    setCustomExercises(p=>[...p,ex]);
  }

  return {allExercises:[...dbExercises,...customExercises], saveCustomExercise, loadingEx};
}

function getWeekDays(offset=0) {
  const now = new Date(); now.setDate(now.getDate()-now.getDay()+1+offset*7);
  return Array.from({length:7},(_,i)=>{ const d=new Date(now); d.setDate(now.getDate()+i); return d; });
}
function fmtDate(d) { return new Date(d).toISOString().split("T")[0]; }
function isToday(d) { return fmtDate(d)===fmtDate(new Date()); }
function fmtTime(s) { const m=Math.floor(Math.abs(s)/60),sec=Math.abs(s)%60; return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; }

// ── UI ATOMS ──────────────────────────────────────────────────
function Tag({color,children}) {
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:800,letterSpacing:1}}>{children}</span>;
}
function Title({children}) {
  return <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color:"#fff",letterSpacing:3,marginBottom:18}}>{children}</div>;
}
function Placeholder({icon,text}) {
  return <div style={{textAlign:"center",padding:"40px 20px",color:C.dim}}><div style={{fontSize:40,marginBottom:8}}>{icon}</div><div style={{fontSize:13}}>{text}</div></div>;
}
function Spinner() {
  return <div style={{textAlign:"center",padding:40}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{width:28,height:28,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.flamingo}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>;
}
function Pill({active,onClick,color,children,wide}) {
  return <button onClick={onClick} style={{padding:"8px 6px",width:wide?"100%":undefined,background:active?color+"25":C.card,border:`1px solid ${active?color:C.border}`,borderRadius:7,color:active?color:"#666",fontWeight:700,fontSize:10,cursor:"pointer"}}>{children}</button>;
}

// ── BLOCKS ────────────────────────────────────────────────────
function MovRow({m}) {
  const {ex,reps} = m;
  return (
    <div style={{display:"flex",alignItems:"baseline",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.bg}`}}>
      {reps!=null && <span style={{color:C.flamingo,fontWeight:900,fontSize:16,fontFamily:"'Bebas Neue',cursive",minWidth:34}}>{reps}{ex?.unit==="m"?" m":ex?.unit==="cal"?" cal":""}</span>}
      <span style={{color:C.text,fontWeight:600,fontSize:13}}>{ex?.name||"—"}</span>
      {ex?.rxM && <span style={{color:"#444",fontSize:10,marginLeft:"auto"}}>{ex.rxM}kg H / {ex.rxW}kg M</span>}
    </div>
  );
}

function BlockCard({block,color}) {
  if (block.kind==="REST") return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0"}}>
      <div style={{flex:1,height:1,background:C.border}}/>
      <span style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.muted,whiteSpace:"nowrap"}}>{block.minutes?`${block.minutes} MIN DESCANSO`:"DESCANSO"}</span>
      <div style={{flex:1,height:1,background:C.border}}/>
    </div>
  );
  if (block.kind==="BuyIn"||block.kind==="CashOut") return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:7}}>
      <div style={{color,fontSize:10,fontWeight:800,letterSpacing:2,marginBottom:6}}>{block.kind==="BuyIn"?"⬇ BUY-IN":"⬆ CASH-OUT"}</div>
      {block.note && <div style={{color:"#666",fontSize:11,marginBottom:6}}>{block.note}</div>}
      {block.movements?.map((m,i)=><MovRow key={i} m={m}/>)}
    </div>
  );
  if (block.kind==="EMOM") return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:7}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <span style={{color,fontSize:10,fontWeight:800,letterSpacing:2}}>EMOM</span>
        <span style={{color:"#ccc",fontSize:13,fontWeight:800,fontFamily:"'Bebas Neue',cursive"}}>{block.minutes} MIN</span>
      </div>
      {block.scheme?.map((s,i) => (
        <div key={i} style={{display:"flex",gap:8,marginBottom:6,padding:"6px 8px",background:C.bg,borderRadius:6}}>
          <div style={{color,fontSize:9,fontWeight:800,minWidth:110,letterSpacing:1}}>{s.minute}:</div>
          <div><div style={{color:"#fff",fontWeight:700,fontSize:12}}>{s.reps?`${s.reps} `:""}{s.ex?.name||"—"}</div></div>
        </div>
      ))}
      {block.note && <div style={{color:C.muted,fontSize:10,borderTop:`1px solid ${C.border}`,paddingTop:5,marginTop:3}}>{block.note}</div>}
    </div>
  );
  if (block.kind==="Custom"||block.kind==="Strength") return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:7}}>
      <div style={{color,fontSize:10,fontWeight:800,letterSpacing:2,marginBottom:6}}>{block.kind==="Strength"?"STRENGTH":"WOD PERSONALIZADO"}</div>
      {block.content && <div style={{color:"#ccc",fontSize:12,fontFamily:"monospace",whiteSpace:"pre-line",lineHeight:1.7}}>{block.content}</div>}
      {block.movements?.map((m,i)=><MovRow key={i} m={m}/>)}
    </div>
  );
  const isAMRAP = block.kind==="AMRAP", isDesc = !!block.descending;
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:7}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{color,fontSize:10,fontWeight:800,letterSpacing:2}}>{isAMRAP?"AMRAP":block.kind==="ForTime"?"FOR TIME":block.kind}</span>
        {isAMRAP && <span style={{color:"#fff",fontSize:20,fontWeight:900,fontFamily:"'Bebas Neue',cursive"}}>{block.minutes} MIN</span>}
        {!isAMRAP && block.rounds && !isDesc && <span style={{color:"#ccc",fontSize:12,fontWeight:700}}>{block.rounds} Rounds</span>}
        {block.timeCap && <span style={{color:"#FF2D55",fontSize:10,fontWeight:700}}>Cap {block.timeCap}m</span>}
      </div>
      {isDesc && (
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          {block.descending.map(r => <div key={r} style={{background:C.bg,borderRadius:5,padding:"4px 10px",color,fontWeight:900,fontSize:18,fontFamily:"'Bebas Neue',cursive"}}>{r}</div>)}
        </div>
      )}
      {block.movements?.map((m,i)=><MovRow key={i} m={m}/>)}
      {block.note && <div style={{color:C.muted,fontSize:10,borderTop:`1px solid ${C.border}`,paddingTop:5,marginTop:5}}>{block.note}</div>}
    </div>
  );
}

// ── TIMER ─────────────────────────────────────────────────────
function getTimerCfg(wod) {
  const totalSecs = (typeof wod?.totalTime==="number"?wod.totalTime:20)*60;
  if (wod?.type==="EMOM") {
    const scheme = wod.blocks?.find(b=>b.kind==="EMOM")?.scheme||[];
    return {mode:"emom", totalSecs, blocks:scheme.map(s=>s.minute||"—")};
  }
  if (wod?.type==="AMRAP") return {mode:"countdown", totalSecs};
  if (wod?.type==="For Time"||wod?.type==="Hero WOD") return {mode:"countdown", totalSecs};
  return {mode:"countup", totalSecs};
}

function TimerScreen({wod, onFinish, onCancel}) {
  const cfg = getTimerCfg(wod);
  const [elapsed,setElapsed] = useState(0);
  const [running,setRunning] = useState(false);
  const [started,setStarted] = useState(false);
  const [finished,setFinished] = useState(false);
  const iRef = useRef(null);
  const color = wod?.energyColor||C.flamingo;

  useEffect(() => {
    if (running) { iRef.current = setInterval(()=>setElapsed(e=>e+1),1000); }
    else { clearInterval(iRef.current); }
    return ()=>clearInterval(iRef.current);
  },[running]);

  useEffect(() => {
    if ((cfg.mode==="countdown"||cfg.mode==="emom") && elapsed>=cfg.totalSecs) {
      setRunning(false); setFinished(true);
    }
  },[elapsed,cfg]);

  const display = cfg.mode==="countdown"||cfg.mode==="emom" ? Math.max(0,cfg.totalSecs-elapsed) : elapsed;
  const progress = cfg.mode==="countdown"||cfg.mode==="emom" ? 1-elapsed/cfg.totalSecs : Math.min(1,elapsed/cfg.totalSecs);
  const radius=90, circ=2*Math.PI*radius;
  let emomInfo = null;
  if (cfg.mode==="emom"&&cfg.blocks?.length) {
    const minIdx = Math.floor(elapsed/60)%cfg.blocks.length;
    emomInfo = {label:cfg.blocks[minIdx], secsLeft:60-(elapsed%60), minNum:Math.floor(elapsed/60)+1};
  }

  if (!started||finished) return (
    <div style={{position:"fixed",inset:0,background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,zIndex:2000}}>
      <style>{`@import url('${FONT}');`}</style>
      {!started && (
        <>
          <div style={{fontSize:60,marginBottom:16}}>🦩</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:3,color:"#fff",marginBottom:6,textAlign:"center"}}>{wod.templateLabel}</div>
          <div style={{color:C.muted,fontSize:13,marginBottom:16}}>{wod.type} · {wod.totalTime} min</div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,width:"100%",maxWidth:340,marginBottom:24}}>
            {wod.blocks?.map((b,i)=><BlockCard key={i} block={b} color={color}/>)}
          </div>
          <button onClick={()=>{setStarted(true);setRunning(true);}} style={{width:"100%",maxWidth:340,padding:"15px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:12,fontFamily:"'Bebas Neue',cursive",fontSize:22,color:"#fff",letterSpacing:3,cursor:"pointer",marginBottom:10}}>🦩 EMPEZAR</button>
          <button onClick={onCancel} style={{width:"100%",maxWidth:340,padding:"11px 0",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:12,color:C.muted,fontSize:13,cursor:"pointer"}}>Volver</button>
        </>
      )}
      {finished && (
        <>
          <div style={{fontSize:56,marginBottom:12}}>🏁</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:30,letterSpacing:3,color:C.flamingo,marginBottom:4}}>TIEMPO FINAL</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:52,color:"#fff",marginBottom:24}}>{fmtTime(elapsed)}</div>
          <button onClick={()=>onFinish(elapsed)} style={{width:"100%",maxWidth:340,padding:"14px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:12,fontFamily:"'Bebas Neue',cursive",fontSize:20,color:"#fff",letterSpacing:2,cursor:"pointer",marginBottom:10}}>REGISTRAR RESULTADO</button>
          <button onClick={onCancel} style={{width:"100%",maxWidth:340,padding:"11px 0",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:12,color:C.muted,fontSize:13,cursor:"pointer"}}>Descartar</button>
        </>
      )}
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,zIndex:2000}}>
      <style>{`@import url('${FONT}');`}</style>
      <div style={{color:C.muted,fontSize:10,letterSpacing:3,marginBottom:6}}>{wod.type} · {wod.templateLabel}</div>
      <div style={{position:"relative",width:220,height:220,marginBottom:16}}>
        <svg width={220} height={220} style={{transform:"rotate(-90deg)"}}>
          <circle cx={110} cy={110} r={radius} fill="none" stroke={C.border} strokeWidth={8}/>
          <circle cx={110} cy={110} r={radius} fill="none" stroke={color} strokeWidth={8} strokeDasharray={circ} strokeDashoffset={circ*(1-Math.max(0,Math.min(1,progress)))} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.5s linear"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:52,color:"#fff",lineHeight:1}}>{fmtTime(display)}</div>
          <div style={{color:C.muted,fontSize:10,letterSpacing:2}}>{cfg.mode==="countup"?"TRANSCURRIDO":"RESTANTE"}</div>
        </div>
      </div>
      {emomInfo && (
        <div style={{background:color+"20",border:`1px solid ${color}40`,borderRadius:10,padding:"10px 20px",marginBottom:16,textAlign:"center"}}>
          <div style={{color,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:3}}>MIN {emomInfo.minNum}</div>
          <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{emomInfo.label}</div>
          <div style={{color:C.muted,fontSize:11,marginTop:2}}>{emomInfo.secsLeft}s hasta siguiente</div>
        </div>
      )}
      {cfg.mode!=="countup" && <div style={{color:C.muted,fontSize:12,marginBottom:20}}>Transcurrido: {fmtTime(elapsed)}</div>}
      <div style={{display:"flex",gap:12,width:"100%",maxWidth:300}}>
        <button onClick={()=>setRunning(r=>!r)} style={{flex:1,padding:"14px 0",background:running?C.card:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:`1px solid ${running?C.border:"transparent"}`,borderRadius:10,fontFamily:"'Bebas Neue',cursive",fontSize:18,color:running?"#888":"#fff",letterSpacing:2,cursor:"pointer"}}>{running?"PAUSA":"REANUDAR"}</button>
        <button onClick={()=>{setRunning(false);setFinished(true);}} style={{padding:"14px 16px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:10,fontFamily:"'Bebas Neue',cursive",fontSize:14,color:C.flamingo,cursor:"pointer",letterSpacing:1}}>STOP</button>
      </div>
      <button onClick={onCancel} style={{marginTop:10,padding:"8px 20px",background:"none",border:"none",color:C.muted,fontSize:11,cursor:"pointer"}}>Abandonar</button>
    </div>
  );
}

// ── RESULT MODAL ──────────────────────────────────────────────
function ResultModal({wod, elapsedSecs, onSave, onClose}) {
  const [step,setStep] = useState("metrics");
  const [selMetrics,setSelMetrics] = useState([]);
  const [vals,setVals] = useState({});
  const [rpe,setRpe] = useState(7);
  const [durMin,setDurMin] = useState(wod?.totalTime||20);
  const [notes,setNotes] = useState("");
  const [isBenchmark,setIsBenchmark] = useState(false);
  const [bName,setBName] = useState(wod?.templateLabel||"");
  const [saving,setSaving] = useState(false);
  const color = wod?.energyColor||C.flamingo;
  const inp = {width:"100%",padding:"9px 11px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,color:"#fff",fontSize:12,boxSizing:"border-box"};

  async function handleSave() {
    setSaving(true);
    const allVals = {...vals};
    if (elapsedSecs!=null&&selMetrics.includes("time")) allVals.time = fmtTime(elapsedSecs);
    const resultStr = Object.entries(allVals).map(([k,v])=>{ const m=BENCHMARK_METRICS.find(x=>x.id===k); return `${m?.label}: ${v} ${m?.unit}`; }).join(" · ");
    const carga_sesion = rpe*durMin;
    await onSave({result:resultStr, rpe, duracion_min:durMin, carga_sesion, notes, benchmark:isBenchmark?{name:bName,metrics:selMetrics}:null});
    setSaving(false); onClose();
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:3000}}>
      <div style={{background:"#0a0a16",border:`1px solid ${color}30`,borderRadius:"16px 16px 0 0",padding:"18px 16px 36px",width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{width:32,height:3,background:C.border,borderRadius:2,margin:"0 auto 16px"}}/>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:"#fff",letterSpacing:2,marginBottom:4}}>REGISTRAR RESULTADO</div>
        <div style={{color:C.muted,fontSize:11,marginBottom:18}}>{wod?.templateLabel} · {wod?.type}</div>

        {step==="metrics" && (
          <div>
            <div style={{color:C.flamingo,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:10}}>QUE METRICAS QUIERES REGISTRAR?</div>
            {BENCHMARK_METRICS.map(m => {
              const sel = selMetrics.includes(m.id);
              return (
                <button key={m.id} onClick={()=>setSelMetrics(p=>p.includes(m.id)?p.filter(x=>x!==m.id):[...p,m.id])} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",marginBottom:6,background:sel?color+"20":C.card,border:`1px solid ${sel?color:C.border}`,borderRadius:8,cursor:"pointer",textAlign:"left"}}>
                  <span style={{fontSize:18}}>{m.icon}</span>
                  <div style={{flex:1}}><div style={{color:sel?color:"#ccc",fontWeight:700,fontSize:12}}>{m.label}</div></div>
                  <div style={{width:14,height:14,borderRadius:3,background:sel?color:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#000",fontWeight:800}}>{sel?"✓":""}</div>
                </button>
              );
            })}
            <button onClick={()=>setStep("values")} style={{width:"100%",padding:"12px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:9,fontFamily:"'Bebas Neue',cursive",fontSize:16,color:"#fff",letterSpacing:2,cursor:"pointer",marginTop:8}}>CONTINUAR</button>
          </div>
        )}

        {step==="values" && (
          <div>
            <div style={{color:C.flamingo,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:10}}>INTRODUCE TUS RESULTADOS</div>
            {elapsedSecs!=null&&selMetrics.includes("time") && (
              <div style={{background:C.flamingo+"20",border:`1px solid ${C.flamingo}40`,borderRadius:8,padding:"8px 12px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:C.muted,fontSize:11}}>Tiempo del cronometro</span>
                <span style={{color:C.flamingo,fontFamily:"'Bebas Neue',cursive",fontSize:20}}>{fmtTime(elapsedSecs)}</span>
              </div>
            )}
            {selMetrics.map(id => {
              if (id==="time"&&elapsedSecs!=null) return null;
              const m = BENCHMARK_METRICS.find(x=>x.id===id);
              return (
                <div key={id} style={{marginBottom:10}}>
                  <label style={{color:C.muted,fontSize:9,letterSpacing:1,display:"block",marginBottom:3}}>{m?.icon} {m?.label} ({m?.unit})</label>
                  <input value={vals[id]||""} onChange={e=>setVals(p=>({...p,[id]:e.target.value}))} placeholder={id==="time"?"12:45":id==="reps"?"87":"—"} style={inp}/>
                </div>
              );
            })}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:12}}>
              <div style={{color:C.flamingo,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:10}}>CARGA DE SESION (sRPE)</div>
              <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:6}}>RPE: <span style={{color}}>{rpe}/10</span></label>
              <div style={{display:"flex",gap:2,marginBottom:12}}>
                {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                  <button key={n} onClick={()=>setRpe(n)} style={{flex:1,padding:"6px 0",background:rpe>=n?color:"#13131f",border:"none",borderRadius:3,color:rpe>=n?"#000":"#444",fontWeight:700,fontSize:9,cursor:"pointer"}}>{n}</button>
                ))}
              </div>
              <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:4}}>DURACION (min)</label>
              <input type="number" value={durMin} onChange={e=>setDurMin(+e.target.value)} min={1} max={300} style={{...inp,marginBottom:8}}/>
              <div style={{background:C.bg,borderRadius:6,padding:"8px 12px",display:"flex",justifyContent:"space-between"}}>
                <span style={{color:C.muted,fontSize:11}}>Carga = RPE x min</span>
                <span style={{color:C.flamingo,fontFamily:"'Bebas Neue',cursive",fontSize:18}}>{rpe*durMin}</span>
              </div>
            </div>
            <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:4}}>NOTAS</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Sensaciones..." style={{...inp,resize:"vertical",marginBottom:12}}/>
            <button onClick={()=>setIsBenchmark(b=>!b)} style={{width:"100%",padding:"9px",marginBottom:isBenchmark?10:14,background:isBenchmark?"#FFD70020":C.card,border:`1px solid ${isBenchmark?"#FFD700":C.border}`,borderRadius:8,color:isBenchmark?"#FFD700":"#666",fontWeight:700,fontSize:11,cursor:"pointer"}}>
              {isBenchmark?"GUARDAR COMO BENCHMARK ✓":"MARCAR COMO BENCHMARK"}
            </button>
            {isBenchmark && (
              <div style={{marginBottom:14}}>
                <label style={{color:"#FFD700",fontSize:9,letterSpacing:2,display:"block",marginBottom:4}}>NOMBRE DEL BENCHMARK</label>
                <input value={bName} onChange={e=>setBName(e.target.value)} style={{...inp,marginBottom:0}}/>
              </div>
            )}
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>setStep("metrics")} style={{padding:"11px 14px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:9,color:C.muted,fontSize:12,cursor:"pointer"}}>Atras</button>
              <button onClick={handleSave} disabled={saving} style={{flex:1,padding:"11px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:9,fontFamily:"'Bebas Neue',cursive",fontSize:15,color:"#fff",cursor:"pointer",opacity:saving?0.7:1}}>{saving?"GUARDANDO...":"GUARDAR"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SCHEDULE MODAL ────────────────────────────────────────────
function ScheduleModal({wod, onSchedule, onClose, calendarWods}) {
  const [weekOffset,setWeekOffset] = useState(0);
  const [selDate,setSelDate] = useState(null);
  const [selSection,setSelSection] = useState("wod");
  const [saving,setSaving] = useState(false);
  const days = getWeekDays(weekOffset);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"#0a0a16",border:`1px solid ${C.flamingo}30`,borderRadius:"16px 16px 0 0",padding:"18px 16px 32px",width:"100%",maxWidth:500,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{width:32,height:3,background:C.border,borderRadius:2,margin:"0 auto 16px"}}/>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:"#fff",letterSpacing:2,marginBottom:14}}>AGENDAR WOD</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <button onClick={()=>setWeekOffset(w=>w-1)} style={{padding:"6px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:6,color:"#ccc",cursor:"pointer",fontSize:14}}>&#8249;</button>
          <span style={{color:"#ccc",fontSize:12,fontWeight:600}}>{days[0].toLocaleDateString("es-ES",{month:"short",day:"numeric"})} - {days[6].toLocaleDateString("es-ES",{month:"short",day:"numeric"})}</span>
          <button onClick={()=>setWeekOffset(w=>w+1)} style={{padding:"6px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:6,color:"#ccc",cursor:"pointer",fontSize:14}}>&#8250;</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:14}}>
          {days.map((d,i) => {
            const df=fmtDate(d), hasWod=(calendarWods||[]).some(w=>w.date===df), sel=selDate===df, tod=isToday(d);
            return (
              <button key={i} onClick={()=>setSelDate(df)} style={{padding:"8px 4px",background:sel?C.flamingo+"30":tod?"#1e1e30":C.card,border:`1px solid ${sel?C.flamingo:tod?"#444":C.border}`,borderRadius:7,cursor:"pointer",textAlign:"center"}}>
                <div style={{color:sel?C.flamingo:tod?"#fff":"#666",fontSize:9,fontWeight:700}}>{DAYS_ES[i]}</div>
                <div style={{color:sel?C.flamingo:tod?"#fff":"#888",fontWeight:900,fontSize:14}}>{d.getDate()}</div>
                {hasWod && <div style={{width:5,height:5,background:C.flamingo,borderRadius:"50%",margin:"2px auto 0"}}/>}
              </button>
            );
          })}
        </div>
        <div style={{marginBottom:14}}>
          <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:8}}>SECCION</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {DAY_SECTIONS.map(s => (
              <button key={s.id} onClick={()=>setSelSection(s.id)} style={{padding:"6px 12px",background:selSection===s.id?s.color+"25":C.card,border:`1px solid ${selSection===s.id?s.color:C.border}`,borderRadius:7,color:selSection===s.id?s.color:"#666",fontSize:10,fontWeight:700,cursor:"pointer"}}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
        {selDate && (
          <button onClick={async()=>{setSaving(true);await onSchedule(selDate,wod,selSection);setSaving(false);onClose();}} style={{width:"100%",padding:"12px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:9,fontFamily:"'Bebas Neue',cursive",fontSize:15,color:"#fff",letterSpacing:2,cursor:"pointer",opacity:saving?0.7:1,marginBottom:8}}>
            {saving?"AGENDANDO...":"AGENDAR"}
          </button>
        )}
        <button onClick={onClose} style={{width:"100%",padding:"10px 0",background:"#13131f",color:C.muted,border:`1px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontSize:12}}>Cancelar</button>
      </div>
    </div>
  );
}

// ── EXERCISE PICKER ───────────────────────────────────────────
function ExercisePicker({allExercises, onSelect, onClose, onSaveCustom}) {
  const [search,setSearch] = useState("");
  const [filterMuscle,setFilterMuscle] = useState("all");
  const [filterLevel,setFilterLevel] = useState("all");
  const [showAdd,setShowAdd] = useState(false);
  const [customName,setCustomName] = useState("");
  const [customEq,setCustomEq] = useState("body only");

  const muscles = ["all","chest","back","shoulders","biceps","triceps","abdominals","quadriceps","hamstrings","glutes","calves"];
  const levels = ["all","beginner","intermediate","expert"];

  const filtered = allExercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = filterMuscle==="all"||(e.primaryMuscles||[]).includes(filterMuscle);
    const matchLevel = filterLevel==="all"||e.skill===(filterLevel==="beginner"?"low":filterLevel==="intermediate"?"mid":"high");
    return matchSearch&&matchMuscle&&matchLevel;
  }).slice(0,50);

  function handleAddCustom() {
    if (!customName.trim()) return;
    const ex = {id:`custom_${Date.now()}`,name:customName.trim(),req:[],cat:"gym",unit:"reps",skill:"low",cycleTime:4,minInterval:20,primaryMuscles:[],equipment:customEq,isCustom:true};
    if (onSaveCustom) onSaveCustom(ex);
    onSelect(ex); onClose();
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:4000}}>
      <div style={{background:"#0a0a16",border:`1px solid ${C.flamingo}30`,borderRadius:"16px 16px 0 0",padding:"16px 14px 30px",width:"100%",maxWidth:500,maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
        <div style={{width:32,height:3,background:C.border,borderRadius:2,margin:"0 auto 14px"}}/>
        {!showAdd ? (
          <>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar ejercicio..." style={{width:"100%",padding:"9px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:"#fff",fontSize:13,marginBottom:8,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:5,marginBottom:6,overflowX:"auto",paddingBottom:2}}>
              {levels.map(l => (
                <button key={l} onClick={()=>setFilterLevel(l)} style={{padding:"4px 10px",whiteSpace:"nowrap",background:filterLevel===l?C.flamingo+"25":C.card,border:`1px solid ${filterLevel===l?C.flamingo:C.border}`,borderRadius:6,color:filterLevel===l?C.flamingo:"#666",fontSize:10,cursor:"pointer",fontWeight:700}}>
                  {l==="all"?"Todos":l}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:5,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
              {muscles.map(m => (
                <button key={m} onClick={()=>setFilterMuscle(m)} style={{padding:"4px 10px",whiteSpace:"nowrap",background:filterMuscle===m?C.flamingo+"25":C.card,border:`1px solid ${filterMuscle===m?C.flamingo:C.border}`,borderRadius:6,color:filterMuscle===m?C.flamingo:"#666",fontSize:10,cursor:"pointer",fontWeight:700}}>
                  {m==="all"?"Todos":m}
                </button>
              ))}
            </div>
            <div style={{flex:1,overflowY:"auto"}}>
              {filtered.length===0 && <div style={{textAlign:"center",padding:"20px",color:C.muted,fontSize:12}}>No hay ejercicios.</div>}
              {filtered.map(ex => (
                <button key={ex.id} onClick={()=>{onSelect(ex);onClose();}} style={{width:"100%",padding:"10px 12px",marginBottom:4,background:C.card,border:`1px solid ${ex.isCustom?C.flamingo:C.border}`,borderRadius:7,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:"left"}}>
                  <div>
                    <span style={{color:ex.isCustom?C.flamingo:"#ccc",fontSize:13}}>{ex.name}</span>
                    {ex.primaryMuscles?.length>0 && <div style={{color:"#444",fontSize:9,marginTop:2}}>{ex.primaryMuscles.slice(0,2).join(", ")}</div>}
                  </div>
                  <span style={{color:"#444",fontSize:10}}>{ex.skill==="low"?"BEG":ex.skill==="mid"?"INT":"EXP"}</span>
                </button>
              ))}
            </div>
            <button onClick={()=>setShowAdd(true)} style={{marginTop:8,width:"100%",padding:"10px",background:C.flamingo+"15",border:`1px dashed ${C.flamingo}`,borderRadius:8,color:C.flamingo,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Crear ejercicio personalizado</button>
            <button onClick={onClose} style={{marginTop:6,width:"100%",padding:"10px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,fontSize:12,cursor:"pointer"}}>Cancelar</button>
          </>
        ) : (
          <>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:"#fff",letterSpacing:2,marginBottom:14}}>NUEVO EJERCICIO</div>
            <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:4}}>NOMBRE</label>
            <input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="Ej: Dragon Flag..." style={{width:"100%",padding:"9px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:"#fff",fontSize:13,marginBottom:12,boxSizing:"border-box"}}/>
            <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:4}}>EQUIPAMIENTO</label>
            <select value={customEq} onChange={e=>setCustomEq(e.target.value)} style={{width:"100%",padding:"9px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:"#fff",fontSize:13,marginBottom:16,boxSizing:"border-box",appearance:"none"}}>
              {["body only","barbell","dumbbell","kettlebells","pullup_bar","rings","box","bands","machine","other"].map(e=><option key={e} value={e}>{e}</option>)}
            </select>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"11px 0",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,fontSize:12,cursor:"pointer"}}>Volver</button>
              <button onClick={handleAddCustom} style={{flex:2,padding:"11px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:8,fontFamily:"'Bebas Neue',cursive",fontSize:15,color:"#fff",cursor:"pointer",letterSpacing:1}}>GUARDAR Y USAR</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── STRENGTH FORM ─────────────────────────────────────────────
function StrengthExerciseForm({allExercises, onSave, onClose, onSaveCustom}) {
  const [showPicker,setShowPicker] = useState(false);
  const [selectedEx,setSelectedEx] = useState(null);
  const [sets,setSets] = useState(3);
  const [reps,setReps] = useState("8-10");
  const [weightType,setWeightType] = useState("kg");
  const [weight,setWeight] = useState("");
  const [rir,setRir] = useState(2);
  const [rest,setRest] = useState(90);
  const [notes,setNotes] = useState("");
  const inp = {padding:"8px 10px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,color:"#fff",fontSize:12,boxSizing:"border-box",width:"100%"};

  function handleSave() {
    if (!selectedEx) return;
    onSave({type:"strength", exercise:selectedEx, sets, reps, weightType, weight:weight||"—", rir, rest, notes, id:Date.now().toString()});
    onClose();
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:2000}}>
      <div style={{background:"#0a0a16",border:`1px solid ${C.flamingo}30`,borderRadius:"16px 16px 0 0",padding:"18px 16px 36px",width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{width:32,height:3,background:C.border,borderRadius:2,margin:"0 auto 16px"}}/>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:"#fff",letterSpacing:2,marginBottom:16}}>AÑADIR EJERCICIO</div>
        <div style={{marginBottom:14}}>
          <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:5}}>EJERCICIO</label>
          <button onClick={()=>setShowPicker(true)} style={{width:"100%",padding:"10px 14px",background:selectedEx?C.flamingo+"15":C.card,border:`1px solid ${selectedEx?C.flamingo:C.border}`,borderRadius:8,color:selectedEx?C.flamingo:"#555",fontSize:13,cursor:"pointer",textAlign:"left"}}>
            {selectedEx ? selectedEx.name : "Seleccionar ejercicio..."}
          </button>
          {selectedEx?.primaryMuscles?.length>0 && <div style={{color:"#444",fontSize:10,marginTop:3}}>{selectedEx.primaryMuscles.join(", ")}</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div>
            <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:5}}>SERIES</label>
            <input type="number" value={sets} onChange={e=>setSets(+e.target.value)} min={1} max={20} style={inp}/>
          </div>
          <div>
            <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:5}}>REPS</label>
            <input value={reps} onChange={e=>setReps(e.target.value)} placeholder="8-10" style={inp}/>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:5}}>CARGA</label>
          <div style={{display:"flex",gap:8}}>
            <div style={{display:"flex",background:C.card,border:`1px solid ${C.border}`,borderRadius:7,overflow:"hidden"}}>
              {["kg","%rm"].map(t => (
                <button key={t} onClick={()=>setWeightType(t)} style={{padding:"8px 12px",background:weightType===t?C.flamingo+"30":"none",border:"none",color:weightType===t?C.flamingo:"#555",fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.toUpperCase()}</button>
              ))}
            </div>
            <input value={weight} onChange={e=>setWeight(e.target.value)} placeholder={weightType==="kg"?"80":"75"} style={{...inp,flex:1}}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div>
            <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:5}}>RIR</label>
            <div style={{display:"flex",gap:4}}>
              {[0,1,2,3,4].map(n => (
                <button key={n} onClick={()=>setRir(n)} style={{flex:1,padding:"7px 0",background:rir===n?C.flamingo+"30":C.card,border:`1px solid ${rir===n?C.flamingo:C.border}`,borderRadius:5,color:rir===n?C.flamingo:"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:5}}>DESCANSO</label>
            <select value={rest} onChange={e=>setRest(+e.target.value)} style={{...inp,appearance:"none"}}>
              {[30,45,60,90,120,180,240,300].map(s=><option key={s} value={s}>{s>=60?`${s/60} min`:`${s} seg`}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{color:C.muted,fontSize:9,letterSpacing:2,display:"block",marginBottom:5}}>NOTAS (opcional)</label>
          <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ej: Pausa en el fondo, tempo 3-1-1..." style={inp}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{padding:"11px 14px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:9,color:C.muted,fontSize:12,cursor:"pointer"}}>Cancelar</button>
          <button onClick={handleSave} disabled={!selectedEx} style={{flex:1,padding:"11px 0",background:selectedEx?`linear-gradient(90deg,${C.flamingo},#FF2D7A)`:"#1e1e30",border:"none",borderRadius:9,fontFamily:"'Bebas Neue',cursive",fontSize:15,color:selectedEx?"#fff":"#444",cursor:selectedEx?"pointer":"default",letterSpacing:1}}>ANADIR AL DIA</button>
        </div>
        {showPicker && <ExercisePicker allExercises={allExercises} onSelect={ex=>setSelectedEx(ex)} onClose={()=>setShowPicker(false)} onSaveCustom={onSaveCustom}/>}
      </div>
    </div>
  );
}

// ── SECTION ITEM ──────────────────────────────────────────────
function SectionItem({item, onDelete}) {
  if (item.type==="strength") return (
    <div style={{background:C.bg,borderRadius:8,padding:"10px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div style={{flex:1}}>
        <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{item.exercise?.name||"Ejercicio"}</div>
        <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
          <span style={{color:C.flamingo,fontSize:11,fontWeight:700}}>{item.sets} x {item.reps}</span>
          {item.weight&&item.weight!=="—" && <span style={{color:"#ccc",fontSize:11}}>{item.weight} {item.weightType}</span>}
          <span style={{color:"#888",fontSize:10}}>RIR {item.rir}</span>
          <span style={{color:"#888",fontSize:10}}>⏸ {item.rest}s</span>
        </div>
        {item.notes && <div style={{color:"#555",fontSize:10,marginTop:3,fontStyle:"italic"}}>{item.notes}</div>}
      </div>
      <button onClick={onDelete} style={{background:"none",border:"none",color:"#444",fontSize:13,cursor:"pointer",padding:"0 0 0 8px"}}>🗑</button>
    </div>
  );
  const wod = item.wod||item;
  return (
    <div style={{background:C.bg,borderRadius:8,padding:"10px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{wod.templateLabel||wod.type||"WOD"}</div>
        <div style={{color:"#444",fontSize:10,marginTop:2}}>{wod.totalTime} min · {wod.scoring}</div>
      </div>
      <button onClick={onDelete} style={{background:"none",border:"none",color:"#444",fontSize:13,cursor:"pointer"}}>🗑</button>
    </div>
  );
}

// ── SESSION MODAL ─────────────────────────────────────────────
function SessionModal({entry, onClose}) {
  const wod = entry.wod;
  const color = C.flamingo;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:2000}}>
      <div style={{background:"#0a0a16",border:`1px solid ${color}30`,borderRadius:"16px 16px 0 0",padding:"18px 16px 36px",width:"100%",maxWidth:500,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{width:32,height:3,background:C.border,borderRadius:2,margin:"0 auto 16px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <Tag color={color}>{wod?.type||"WOD"}</Tag>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:"#fff",letterSpacing:2,marginTop:6}}>{wod?.templateLabel||"WOD"}</div>
            <div style={{color:C.muted,fontSize:11,marginTop:2}}>{new Date(entry.date).toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <button onClick={onClose} style={{padding:"6px 10px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,fontSize:14,cursor:"pointer"}}>✕</button>
        </div>
        {entry.result && (
          <div style={{background:color+"15",border:`1px solid ${color}30`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{color,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:4}}>RESULTADO</div>
            <div style={{color:"#fff",fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:1}}>{entry.result}</div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
          {[{l:"RPE",v:entry.rpe?`${entry.rpe}/10`:"—"},{l:"Duracion",v:entry.duracion_min?`${entry.duracion_min} min`:"—"},{l:"Carga",v:entry.carga_sesion||"—"}].map(s => (
            <div key={s.l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color,lineHeight:1}}>{s.v}</div>
              <div style={{color:C.muted,fontSize:8,letterSpacing:1,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        {entry.notes && (
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",marginBottom:14}}>
            <div style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:4}}>NOTAS</div>
            <div style={{color:"#ccc",fontSize:12,fontStyle:"italic"}}>"{entry.notes}"</div>
          </div>
        )}
        {wod?.blocks?.length>0 && (
          <div>
            <div style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:10}}>WOD</div>
            {wod.blocks.map((b,i)=><BlockCard key={i} block={b} color={color}/>)}
          </div>
        )}
        <button onClick={onClose} style={{width:"100%",padding:"12px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:10,fontFamily:"'Bebas Neue',cursive",fontSize:16,color:"#fff",letterSpacing:2,cursor:"pointer",marginTop:8}}>CERRAR</button>
      </div>
    </div>
  );
}

// ── CALENDAR ──────────────────────────────────────────────────
function CalendarView({calendarWods, onStartWod, onAddWodToDay, onDeleteItem, onAddStrengthItem, allExercises, onSaveCustom}) {
  const [weekOffset,setWeekOffset] = useState(0);
  const [selDay,setSelDay] = useState(fmtDate(new Date()));
  const [openSections,setOpenSections] = useState({warmup:true,strength:true,wod:true,cardio:false,cooldown:false});
  const [showStrengthForm,setShowStrengthForm] = useState(null);

  const days = getWeekDays(weekOffset);

  function itemsForSection(sectionId) {
    return calendarWods.filter(w => w.date===selDay && (w.section||"wod")===sectionId);
  }

  function toggleSection(id) {
    setOpenSections(p => ({...p, [id]:!p[id]}));
  }

  return (
    <div>
      <Title>CALENDARIO</Title>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={()=>setWeekOffset(w=>w-1)} style={{padding:"6px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:7,color:"#ccc",cursor:"pointer",fontSize:16}}>&#8249;</button>
        <span style={{color:"#ccc",fontSize:12,fontWeight:700}}>
          {days[0].toLocaleDateString("es-ES",{month:"short",day:"numeric"})} - {days[6].toLocaleDateString("es-ES",{month:"short",day:"numeric"})}
        </span>
        <button onClick={()=>setWeekOffset(w=>w+1)} style={{padding:"6px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:7,color:"#ccc",cursor:"pointer",fontSize:16}}>&#8250;</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:16}}>
        {days.map((d,i) => {
          const df=fmtDate(d), cnt=calendarWods.filter(w=>w.date===df).length, sel=selDay===df, tod=isToday(d);
          return (
            <button key={i} onClick={()=>setSelDay(df)} style={{padding:"8px 3px",background:sel?C.flamingo+"25":tod?"#1a1a2e":C.card,border:`2px solid ${sel?C.flamingo:tod?"#444":C.border}`,borderRadius:8,cursor:"pointer",textAlign:"center"}}>
              <div style={{color:sel?C.flamingo:tod?"#fff":"#555",fontSize:8,fontWeight:700,marginBottom:2}}>{DAYS_ES[i]}</div>
              <div style={{color:sel?C.flamingo:tod?"#fff":"#777",fontWeight:900,fontSize:15}}>{d.getDate()}</div>
              {cnt>0 && (
                <div style={{marginTop:3,display:"flex",justifyContent:"center",gap:2}}>
                  {Array.from({length:Math.min(cnt,3)}).map((_,j)=><div key={j} style={{width:4,height:4,background:C.flamingo,borderRadius:"50%"}}/>)}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div style={{color:"#ccc",fontSize:12,fontWeight:700,marginBottom:14}}>
        {new Date(selDay+"T12:00:00").toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"})}
      </div>

      {DAY_SECTIONS.map(section => {
        const isOpen = openSections[section.id];
        const items = itemsForSection(section.id);
        return (
          <div key={section.id} style={{marginBottom:8,borderRadius:12,overflow:"hidden",border:`1px solid ${isOpen?section.color+"40":C.border}`}}>
            <button onClick={()=>toggleSection(section.id)} style={{width:"100%",padding:"12px 14px",background:isOpen?section.color+"15":C.card,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",textAlign:"left"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{section.icon}</span>
                <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:2,color:isOpen?section.color:"#888"}}>{section.label}</span>
                {items.length>0 && <span style={{background:section.color+"30",color:section.color,fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:10}}>{items.length}</span>}
              </div>
              <span style={{color:isOpen?section.color:"#444",fontSize:14}}>{isOpen?"▲":"▼"}</span>
            </button>
            {isOpen && (
              <div style={{background:"#0a0a14",padding:"10px 12px"}}>
                {items.length===0 && <div style={{color:"#444",fontSize:12,textAlign:"center",padding:"10px 0"}}>Sin contenido.</div>}
                {items.map((entry,i) => (
                  <SectionItem key={i} item={entry.item||entry} onDelete={()=>onDeleteItem(entry.id)}/>
                ))}
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  {section.id!=="wod" && (
                    <button onClick={()=>setShowStrengthForm(section.id)} style={{flex:1,padding:"8px 0",background:section.color+"15",border:`1px dashed ${section.color}60`,borderRadius:7,color:section.color,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                      + Ejercicio
                    </button>
                  )}
                  {(section.id==="wod"||section.id==="cardio"||section.id==="warmup") && (
                    <button onClick={()=>onAddWodToDay(selDay, section.id)} style={{flex:1,padding:"8px 0",background:section.color+"15",border:`1px dashed ${section.color}60`,borderRadius:7,color:section.color,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                      + WOD
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {showStrengthForm && (
        <StrengthExerciseForm
          allExercises={allExercises}
          onSaveCustom={onSaveCustom}
          onSave={async item => {
            await onAddStrengthItem(selDay, showStrengthForm, item);
            setShowStrengthForm(null);
          }}
          onClose={()=>setShowStrengthForm(null)}
        />
      )}
    </div>
  );
}

// ── STATS ─────────────────────────────────────────────────────
function StatsView({history, loading}) {
  const [selectedEntry,setSelectedEntry] = useState(null);
  if (loading) return <Spinner/>;
  if (!history.length) return <Placeholder icon="📊" text="Registra tu primer WOD para ver estadisticas"/>;
  const {acuteLoad,chronicLoad,acwr,weeks,daysThisWeek,totalMins,avgRpe} = calcLoadStats(history);
  const acwrNum = parseFloat(acwr);
  const acwrColor = acwrNum===0?"#555":acwrNum<0.8?"#FFCC00":acwrNum<=1.3?"#34C759":acwrNum<=1.5?"#FF9500":"#FF2D55";
  const acwrLabel = acwrNum===0?"Sin datos":acwrNum<0.8?"Carga baja":acwrNum<=1.3?"Zona segura":acwrNum<=1.5?"Precaucion":"Riesgo alto";
  const acwrEmoji = acwrNum===0?"—":acwrNum<=1.3?"✅":acwrNum<=1.5?"⚠️":"🚨";
  const maxLoad = Math.max(...weeks.map(w=>w.load),1);
  return (
    <div>
      <Title>STATS</Title>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
        {[{l:"Dias/semana",v:daysThisWeek},{l:"Tiempo (h)",v:(totalMins/60).toFixed(1)},{l:"sRPE medio",v:avgRpe}].map(s => (
          <div key={s.l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 8px",textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:C.flamingo,lineHeight:1}}>{s.v}</div>
            <div style={{color:C.muted,fontSize:8,letterSpacing:1,marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{background:acwrColor+"15",border:`2px solid ${acwrColor}`,borderRadius:14,padding:"18px 20px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{color:acwrColor,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:4}}>RATIO CARGA AGUDA:CRONICA</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:52,color:acwrColor,lineHeight:1}}>{acwr}</div>
            <div style={{color:acwrColor,fontSize:13,fontWeight:700,marginTop:4}}>{acwrEmoji} {acwrLabel}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{marginBottom:8}}>
              <div style={{color:C.muted,fontSize:8,letterSpacing:2}}>CARGA AGUDA (7d)</div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:"#fff"}}>{acuteLoad}</div>
            </div>
            <div>
              <div style={{color:C.muted,fontSize:8,letterSpacing:2}}>CRONICA (28d avg)</div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:"#fff"}}>{chronicLoad}</div>
            </div>
          </div>
        </div>
        <div style={{position:"relative",height:8,background:"#111",borderRadius:4,overflow:"hidden",marginBottom:6}}>
          <div style={{position:"absolute",left:0,width:"53%",height:"100%",background:"linear-gradient(90deg,#333,#FFCC00,#34C759)"}}/>
          <div style={{position:"absolute",left:"53%",width:"13%",height:"100%",background:"#FF9500"}}/>
          <div style={{position:"absolute",left:"66%",width:"34%",height:"100%",background:"#FF2D55"}}/>
          {acwrNum>0 && <div style={{position:"absolute",top:-2,width:12,height:12,background:"#fff",borderRadius:"50%",border:`2px solid ${acwrColor}`,left:`${Math.min(96,acwrNum/2*100)}%`,transform:"translateX(-50%)",transition:"left 0.5s"}}/>}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",color:"#444",fontSize:8}}>
          <span>Bajo</span><span style={{color:"#34C759"}}>0.8-1.3 Seguro</span><span style={{color:"#FF9500"}}>1.3-1.5</span><span style={{color:"#FF2D55"}}>+1.5 Riesgo</span>
        </div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 14px",marginBottom:20}}>
        <div style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:16}}>CARGA SEMANAL (ULTIMAS 4 SEMANAS)</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,height:100}}>
          {weeks.map((w,i) => {
            const h = maxLoad>0?(w.load/maxLoad)*100:0, isLast=i===3;
            return (
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{color:isLast?C.flamingo:"#666",fontSize:9,fontWeight:700}}>{w.load||"—"}</div>
                <div style={{width:"100%",height:`${Math.max(h,2)}px`,background:isLast?`linear-gradient(180deg,${C.flamingo},#FF2D7A)`:"#2a2a3e",borderRadius:"4px 4px 0 0",minHeight:3,transition:"height 0.5s"}}/>
                <div style={{color:isLast?C.flamingo:"#555",fontSize:8,fontWeight:700}}>{isLast?"ESTA":w.label}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{color:C.muted,fontSize:9,letterSpacing:2,marginBottom:10}}>ULTIMAS SESIONES</div>
      {[...history].slice(0,8).map((h,i) => (
        <button key={i} onClick={()=>setSelectedEntry(h)} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",textAlign:"left"}}>
          <div>
            <div style={{color:"#fff",fontWeight:600,fontSize:11}}>{h.wod?.templateLabel||h.wod?.type||"WOD"}</div>
            <div style={{color:"#444",fontSize:9,marginTop:1}}>{new Date(h.date).toLocaleDateString("es-ES")}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{textAlign:"right"}}>
              {h.carga_sesion>0 && <div style={{color:C.flamingo,fontFamily:"'Bebas Neue',cursive",fontSize:16}}>{h.carga_sesion}</div>}
              {h.rpe && <div style={{color:C.muted,fontSize:9}}>RPE {h.rpe} · {h.duracion_min}min</div>}
            </div>
            <span style={{color:"#444",fontSize:12}}>›</span>
          </div>
        </button>
      ))}
      {selectedEntry && <SessionModal entry={selectedEntry} onClose={()=>setSelectedEntry(null)}/>}
    </div>
  );
}

// ── CUSTOM WOD BUILDER ────────────────────────────────────────
const BLOCK_TYPES = [
  {id:"AMRAP",   label:"AMRAP",    icon:"🔄"},
  {id:"ForTime", label:"For Time", icon:"⏱"},
  {id:"EMOM",    label:"EMOM",     icon:"⏰"},
  {id:"Strength",label:"Strength", icon:"🏋️"},
  {id:"REST",    label:"Descanso", icon:"⏸"},
  {id:"BuyIn",   label:"Buy In",   icon:"⬇"},
  {id:"CashOut", label:"Cash Out", icon:"⬆"},
];

function CustomBlock({block, allExercises, onSaveCustom, onChange, onDelete}) {
  const [showPicker,setShowPicker] = useState(false);
  const [pickerTarget,setPickerTarget] = useState(null);
  const inp = {padding:"7px 10px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,color:"#fff",fontSize:12,boxSizing:"border-box"};

  function addMov() { onChange({...block, movements:[...(block.movements||[]),{ex:null,reps:10}]}); }
  function updateMov(i,field,val) { const m=[...(block.movements||[])]; m[i]={...m[i],[field]:val}; onChange({...block,movements:m}); }
  function removeMov(i) { const m=[...(block.movements||[])]; m.splice(i,1); onChange({...block,movements:m}); }

  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px",marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>{BLOCK_TYPES.find(b=>b.id===block.kind)?.icon||"📦"}</span>
          <span style={{color:C.flamingo,fontWeight:800,fontSize:12,letterSpacing:1}}>{BLOCK_TYPES.find(b=>b.id===block.kind)?.label||block.kind}</span>
        </div>
        <button onClick={onDelete} style={{background:"none",border:"none",color:"#444",fontSize:14,cursor:"pointer"}}>✕</button>
      </div>
      {(block.kind==="AMRAP"||block.kind==="EMOM") && (
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <label style={{color:C.muted,fontSize:10}}>Minutos:</label>
          <input type="number" value={block.minutes||10} min={1} max={60} onChange={e=>onChange({...block,minutes:+e.target.value})} style={{...inp,width:70}}/>
        </div>
      )}
      {block.kind==="ForTime" && (
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <label style={{color:C.muted,fontSize:10}}>Rondas:</label>
          <input type="number" value={block.rounds||3} min={1} max={20} onChange={e=>onChange({...block,rounds:+e.target.value})} style={{...inp,width:60}}/>
          <label style={{color:C.muted,fontSize:10}}>Cap (min):</label>
          <input type="number" value={block.timeCap||15} min={1} max={60} onChange={e=>onChange({...block,timeCap:+e.target.value})} style={{...inp,width:60}}/>
        </div>
      )}
      {block.kind==="REST" && (
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <label style={{color:C.muted,fontSize:10}}>Descanso (min):</label>
          <input type="number" value={block.minutes||2} min={1} max={20} onChange={e=>onChange({...block,minutes:+e.target.value})} style={{...inp,width:60}}/>
        </div>
      )}
      {block.kind!=="REST" && (
        <div>
          {(block.movements||[]).map((mov,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <input type="number" value={mov.reps||10} min={1} max={100} onChange={e=>updateMov(i,"reps",+e.target.value)} style={{...inp,width:56}}/>
              <button onClick={()=>{setPickerTarget(i);setShowPicker(true);}} style={{flex:1,padding:"7px 10px",background:mov.ex?C.flamingo+"15":"#13131f",border:`1px solid ${mov.ex?C.flamingo:C.border}`,borderRadius:6,color:mov.ex?C.flamingo:"#555",fontSize:11,cursor:"pointer",textAlign:"left"}}>
                {mov.ex?mov.ex.name:"Elegir ejercicio..."}
              </button>
              <button onClick={()=>removeMov(i)} style={{background:"none",border:"none",color:"#444",fontSize:13,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <button onClick={addMov} style={{width:"100%",padding:"7px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:6,color:"#666",fontSize:11,cursor:"pointer",marginTop:4}}>+ Anadir ejercicio</button>
        </div>
      )}
      {showPicker && <ExercisePicker allExercises={allExercises} onSelect={ex=>{if(pickerTarget!==null)updateMov(pickerTarget,"ex",ex);}} onClose={()=>setShowPicker(false)} onSaveCustom={onSaveCustom}/>}
    </div>
  );
}

function CustomWODBuilder({allExercises, onSaveCustom, onDone, onCancel}) {
  const [blocks,setBlocks] = useState([]);
  const [name,setName] = useState("");
  const [showMenu,setShowMenu] = useState(false);

  function addBlock(kind) {
    const defs = {AMRAP:{minutes:10,movements:[]},ForTime:{rounds:3,timeCap:15,movements:[]},EMOM:{minutes:12,movements:[]},Strength:{movements:[]},REST:{minutes:2},BuyIn:{movements:[]},CashOut:{movements:[]}};
    setBlocks(b=>[...b,{kind,...defs[kind]}]);
    setShowMenu(false);
  }
  function updateBlock(i,val) { const b=[...blocks]; b[i]=val; setBlocks(b); }
  function deleteBlock(i) { setBlocks(b=>b.filter((_,j)=>j!==i)); }
  function buildWOD() {
    const totalTime = blocks.reduce((s,b)=>s+(b.minutes||b.timeCap||0),0)||20;
    return {id:Date.now().toString(),type:"Custom",templateLabel:name||"WOD Custom",ref:"WOD Personalizado",energyColor:C.flamingo,totalTime,scoring:"Custom WOD",blocks,generatedAt:new Date().toISOString(),level:"rx"};
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <Title>CONSTRUCTOR WOD</Title>
        <button onClick={onCancel} style={{padding:"5px 12px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:6,color:C.muted,fontSize:11,cursor:"pointer"}}>Cancelar</button>
      </div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre del WOD (opcional)" style={{width:"100%",padding:"10px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:"#fff",fontSize:13,boxSizing:"border-box",marginBottom:16}}/>
      {blocks.length===0 && <Placeholder icon="🧱" text="Anade bloques para construir tu WOD"/>}
      {blocks.map((b,i) => <CustomBlock key={i} block={b} allExercises={allExercises} onSaveCustom={onSaveCustom} onChange={v=>updateBlock(i,v)} onDelete={()=>deleteBlock(i)}/>)}
      <div style={{position:"relative",marginBottom:16}}>
        <button onClick={()=>setShowMenu(s=>!s)} style={{width:"100%",padding:"12px",background:C.card,border:`2px dashed ${C.border}`,borderRadius:10,color:C.flamingo,fontFamily:"'Bebas Neue',cursive",fontSize:15,cursor:"pointer",letterSpacing:2}}>+ ANADIR BLOQUE</button>
        {showMenu && (
          <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#0d0d1a",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",zIndex:50}}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.id} onClick={()=>addBlock(bt.id)} style={{width:"100%",padding:"12px 16px",background:"none",border:"none",borderBottom:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
                <span style={{fontSize:18}}>{bt.icon}</span>
                <span style={{color:"#ccc",fontSize:13}}>{bt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {blocks.length>0 && (
        <button onClick={()=>onDone(buildWOD())} style={{width:"100%",padding:"14px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:11,fontFamily:"'Bebas Neue',cursive",fontSize:19,color:"#fff",letterSpacing:3,cursor:"pointer"}}>🦩 USAR ESTE WOD</button>
      )}
    </div>
  );
}

// ── GENERATOR ─────────────────────────────────────────────────
function GeneratorWizard({allExercises, onGenerate, onCustom, onSaveCustom}) {
  const [format,setFormat] = useState("Aleatorio");
  const [duration,setDuration] = useState(20);
  const [level,setLevel] = useState("rx");
  const [equipment,setEquipment] = useState(()=>Object.fromEntries(EQUIPMENT_LIST.map(e=>[e.id,true])));
  const [maxEx,setMaxEx] = useState(4);
  const [showCustom,setShowCustom] = useState(false);
  const groups = [...new Set(EQUIPMENT_LIST.map(e=>e.group))];

  if (showCustom) return <CustomWODBuilder allExercises={allExercises} onSaveCustom={onSaveCustom} onDone={wod=>{setShowCustom(false);onCustom(wod);}} onCancel={()=>setShowCustom(false)}/>;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      <div>
        <div style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:2,marginBottom:9}}>FORMATO WOD</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:6}}>
          {["Aleatorio","AMRAP","EMOM","For Time","Hero WOD","Combinado"].map(f=><Pill key={f} active={format===f} onClick={()=>setFormat(f)} color={C.flamingo}>{f}</Pill>)}
        </div>
        <button onClick={()=>setShowCustom(true)} style={{width:"100%",padding:"10px",background:"#13131f",border:`2px dashed ${C.flamingo}40`,borderRadius:8,color:C.flamingo,fontFamily:"'Bebas Neue',cursive",fontSize:13,cursor:"pointer",letterSpacing:2}}>🧱 CONSTRUCTOR CUSTOM</button>
      </div>
      <div>
        <div style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:2,marginBottom:9}}>NIVEL Y DURACION</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:12}}>
          {[{id:"beginner",l:"Principiante"},{id:"scaled",l:"Scaled"},{id:"intermediate",l:"Intermedio"},{id:"rx",l:"RX"}].map(l=><Pill key={l.id} active={level===l.id} onClick={()=>setLevel(l.id)} color={C.flamingo}>{l.l}</Pill>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={{color:"#888",fontSize:11}}>Duracion maxima</span>
          <span style={{color:C.flamingo,fontWeight:800}}>{duration} min</span>
        </div>
        <input type="range" min={8} max={70} step={1} value={duration} onChange={e=>setDuration(+e.target.value)} style={{width:"100%",accentColor:C.flamingo}}/>
        <div style={{color:"#555",fontSize:9,marginTop:3}}>El WOD durara entre {Math.round(duration*0.75)} y {duration} min</div>
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <span style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:2}}>MATERIAL</span>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>setEquipment(Object.fromEntries(EQUIPMENT_LIST.map(e=>[e.id,true])))} style={{padding:"3px 8px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:4,color:"#666",fontSize:9,cursor:"pointer"}}>Todo</button>
            <button onClick={()=>setEquipment(Object.fromEntries(EQUIPMENT_LIST.map(e=>[e.id,false])))} style={{padding:"3px 8px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:4,color:"#666",fontSize:9,cursor:"pointer"}}>Ninguno</button>
          </div>
        </div>
        {groups.map(g => (
          <div key={g} style={{marginBottom:10}}>
            <div style={{color:"#444",fontSize:8,letterSpacing:2,fontWeight:700,marginBottom:4}}>{g.toUpperCase()}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:3}}>
              {EQUIPMENT_LIST.filter(e=>e.group===g).map(e => (
                <button key={e.id} onClick={()=>setEquipment(p=>({...p,[e.id]:!p[e.id]}))} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",background:equipment[e.id]?"#13131f":"#0a0a14",border:`1px solid ${equipment[e.id]?C.border:"#161625"}`,borderRadius:5,cursor:"pointer",opacity:equipment[e.id]?1:0.4}}>
                  <div style={{width:12,height:12,borderRadius:2,flexShrink:0,background:equipment[e.id]?C.flamingo:"#1e1e30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"#000",fontWeight:800}}>{equipment[e.id]?"✓":""}</div>
                  <span style={{fontSize:9,color:equipment[e.id]?"#ccc":C.muted,fontWeight:600}}>{e.icon} {e.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:2}}>MAX. EJERCICIOS</span>
          <strong style={{color:C.flamingo}}>{maxEx}</strong>
        </div>
        <input type="range" min={2} max={8} value={maxEx} onChange={e=>setMaxEx(+e.target.value)} style={{width:"100%",accentColor:C.flamingo}}/>
      </div>
      <button onClick={()=>onGenerate({format,duration,level,equipment,maxExercises:maxEx})} style={{width:"100%",padding:"14px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:11,fontFamily:"'Bebas Neue',cursive",fontSize:19,color:"#fff",letterSpacing:3,cursor:"pointer",boxShadow:`0 4px 18px ${C.flamingo}40`}}>
        🦩 GENERAR WOD
      </button>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────
function AuthScreen({onAuth}) {
  const [mode,setMode]=useState("login"),[email,setEmail]=useState(""),[pass,setPass]=useState(""),[err,setErr]=useState(""),[loading,setLoading]=useState(false);
  const inp={width:"100%",padding:"11px 13px",background:"#0d0d1a",border:`1px solid ${C.border}`,borderRadius:9,color:"#fff",fontSize:13,boxSizing:"border-box",marginBottom:11,outline:"none"};
  async function handle() {
    if(!email||!pass){setErr("Completa todos los campos");return;}
    setLoading(true);setErr("");
    try {
      const res=mode==="login"?await sb.signIn(email,pass):await sb.signUp(email,pass);
      if(res.error||res.msg){setErr(res.error?.message||res.msg||"Error");setLoading(false);return;}
      if(mode==="register"&&!res.access_token){setErr("Revisa tu email para confirmar");setLoading(false);return;}
      onAuth(res);
    } catch(e){setErr("Error de conexion");setLoading(false);}
  }
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{`@import url('${FONT}');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:34,letterSpacing:4,color:C.flamingo,marginBottom:6,textAlign:"center"}}>FLAMINGO WOD</div>
      <div style={{fontSize:52,marginBottom:6,lineHeight:1}}>🦩</div>
      <div style={{color:C.muted,fontSize:10,letterSpacing:3,marginBottom:32}}>CROSSFIT GENERATOR</div>
      <div style={{width:"100%",maxWidth:340,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:22}}>
        <div style={{display:"flex",gap:7,marginBottom:20}}>
          {["login","register"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"8px 0",background:mode===m?C.flamingo+"25":C.bg,border:`1px solid ${mode===m?C.flamingo:C.border}`,borderRadius:7,color:mode===m?C.flamingo:"#666",fontWeight:700,fontSize:10,cursor:"pointer",letterSpacing:1}}>{m==="login"?"ENTRAR":"REGISTRARSE"}</button>
          ))}
        </div>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={inp}/>
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Contrasena" type="password" style={{...inp,marginBottom:err?7:14}} onKeyDown={e=>e.key==="Enter"&&handle()}/>
        {err && <div style={{color:"#FF2D55",fontSize:11,marginBottom:11,padding:"7px 10px",background:"#FF2D5510",borderRadius:5}}>{err}</div>}
        <button onClick={handle} disabled={loading} style={{width:"100%",padding:"12px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:9,fontFamily:"'Bebas Neue',cursive",fontSize:17,color:"#fff",letterSpacing:2,cursor:"pointer",opacity:loading?0.7:1}}>{loading?"...":mode==="login"?"ENTRAR":"CREAR CUENTA"}</button>
      </div>
    </div>
  );
}

// ── SIDEBAR VIEWS ─────────────────────────────────────────────
function ManualWODView({onSchedule, onDo, calendarWods}) {
  const [name,setName]=useState(""),[type,setType]=useState("AMRAP"),[desc,setDesc]=useState(""),[showSched,setShowSched]=useState(false);
  const inp={width:"100%",padding:"9px 11px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,color:"#fff",fontSize:12,boxSizing:"border-box",marginBottom:9};
  function buildWod() { return {id:Date.now().toString(),type,templateLabel:name||"WOD Manual",ref:"WOD Manual",energyColor:C.flamingo,totalTime:20,scoring:"Registro personal",blocks:[{kind:"Custom",content:desc}],generatedAt:new Date().toISOString(),level:"rx"}; }
  return (
    <div>
      <Title>WOD MANUAL</Title>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:16}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre del WOD (opcional)" style={inp}/>
        <select value={type} onChange={e=>setType(e.target.value)} style={{...inp,appearance:"none"}}>{["AMRAP","EMOM","For Time","Chipper","Hero WOD","Strength"].map(f=><option key={f}>{f}</option>)}</select>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={8} placeholder={"Escribe tu WOD:\n\nEj:\nEMOM 20 min\nMin 1: 10 Pull-ups\n..."} style={{...inp,resize:"vertical",fontFamily:"monospace",fontSize:11,marginBottom:12}}/>
        <div style={{display:"flex",gap:7}}>
          <button onClick={()=>{if(!desc)return;onDo(buildWod());}} style={{flex:1,padding:"11px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:8,fontFamily:"'Bebas Neue',cursive",fontSize:14,color:"#fff",cursor:"pointer",letterSpacing:1}}>HACER AHORA</button>
          <button onClick={()=>{if(!desc)return;setShowSched(true);}} style={{flex:1,padding:"11px 0",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:"'Bebas Neue',cursive",fontSize:14,color:"#ccc",cursor:"pointer",letterSpacing:1}}>AGENDAR</button>
        </div>
      </div>
      {showSched && <ScheduleModal wod={buildWod()} onSchedule={async(date,wod,sec)=>{await onSchedule(date,wod,sec);setShowSched(false);}} onClose={()=>setShowSched(false)} calendarWods={calendarWods}/>}
    </div>
  );
}

function FavoritesView({favorites, loading, onLoad, onDelete}) {
  if (loading) return <Spinner/>;
  if (!favorites.length) return <Placeholder icon="🦩" text="Aun no tienes favoritos."/>;
  return (
    <div>
      <Title>FAVORITOS 🦩</Title>
      {favorites.map((f,i) => {
        const wod=f.wod||f;
        return (
          <div key={i} style={{background:C.card,border:`1px solid ${C.flamingo}30`,borderRadius:10,padding:"12px 14px",marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div><Tag color={C.flamingo}>{wod.type}</Tag><div style={{color:"#fff",fontWeight:700,fontSize:13,marginTop:4}}>{wod.templateLabel}</div></div>
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>onLoad(wod)} style={{padding:"5px 10px",background:C.flamingo+"20",border:`1px solid ${C.flamingo}40`,borderRadius:6,color:C.flamingo,fontSize:10,fontWeight:700,cursor:"pointer"}}>Cargar</button>
                <button onClick={()=>onDelete(f.id)} style={{padding:"5px 8px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:6,color:"#444",fontSize:10,cursor:"pointer"}}>X</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BenchmarksView({benchmarks, benchmarkResults, loading, onAddResult}) {
  const [selected,setSelected]=useState(null),[showAdd,setShowAdd]=useState(false),[newResult,setNewResult]=useState({}),[saving,setSaving]=useState(false);
  const inp={width:"100%",padding:"8px 10px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,color:"#fff",fontSize:12,boxSizing:"border-box",marginBottom:8};
  if (loading) return <Spinner/>;
  const bm=selected?benchmarks.find(b=>b.id===selected):null;
  const bmResults=selected?(benchmarkResults[selected]||[]):[];
  return (
    <div>
      <Title>BENCHMARKS</Title>
      {!benchmarks.length ? <Placeholder icon="⭐" text="Aun no tienes benchmarks."/> : (
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {benchmarks.map(b => (
            <button key={b.id} onClick={()=>setSelected(b.id===selected?null:b.id)} style={{background:selected===b.id?"#FFD70015":C.card,border:`1px solid ${selected===b.id?"#FFD700":C.border}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",textAlign:"left"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{color:"#fff",fontWeight:700,fontSize:13}}>{b.name}</div><div style={{color:"#444",fontSize:10}}>{(benchmarkResults[b.id]||[]).length} registros</div></div>
                <span style={{color:selected===b.id?"#FFD700":"#444",fontSize:18}}>{selected===b.id?"▲":"▼"}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {bm && (
        <div style={{background:"#FFD70010",border:"1px solid #FFD70030",borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{color:"#FFD700",fontSize:11,fontWeight:800,letterSpacing:2}}>HISTORIAL — {bm.name}</span>
            <button onClick={()=>setShowAdd(s=>!s)} style={{padding:"5px 12px",background:"#FFD70020",border:"1px solid #FFD70040",borderRadius:6,color:"#FFD700",fontSize:10,fontWeight:700,cursor:"pointer"}}>+ NUEVO</button>
          </div>
          {showAdd && (
            <div style={{background:C.bg,borderRadius:8,padding:12,marginBottom:12}}>
              {bm.metrics?.map(m => { const met=BENCHMARK_METRICS.find(x=>x.id===m); return <div key={m} style={{marginBottom:7}}><label style={{color:C.muted,fontSize:9,display:"block",marginBottom:3}}>{met?.icon} {met?.label} ({met?.unit})</label><input value={newResult[m]||""} onChange={e=>setNewResult(p=>({...p,[m]:e.target.value}))} placeholder="—" style={inp}/></div>; })}
              <button onClick={async()=>{setSaving(true);await onAddResult(bm.id,{results:newResult,date:new Date().toISOString()});setNewResult({});setShowAdd(false);setSaving(false);}} style={{width:"100%",padding:"9px",background:"#FFD700",border:"none",borderRadius:7,fontFamily:"'Bebas Neue',cursive",fontSize:13,color:"#000",cursor:"pointer",opacity:saving?0.7:1}}>{saving?"GUARDANDO...":"GUARDAR"}</button>
            </div>
          )}
          {!bmResults.length ? <div style={{color:"#555",fontSize:12,textAlign:"center",padding:"16px 0"}}>Sin registros</div> : bmResults.map((r,i) => (
            <div key={i} style={{background:i===0?"#FFD70010":C.card,border:`1px solid ${i===0?"#FFD70040":C.border}`,borderRadius:8,padding:"10px 12px",marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#444",fontSize:10}}>{new Date(r.date).toLocaleDateString("es-ES")}</span>{i===0&&<span style={{color:"#FFD700",fontSize:9,fontWeight:800}}>MEJOR</span>}</div>
              {Object.entries(r.results||{}).map(([k,v]) => { const met=BENCHMARK_METRICS.find(x=>x.id===k); return <div key={k} style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#888",fontSize:11}}>{met?.icon} {met?.label}</span><span style={{color:"#FFD700",fontFamily:"'Bebas Neue',cursive",fontSize:16}}>{v} <span style={{fontSize:10,color:"#555"}}>{met?.unit}</span></span></div>; })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryView({history, loading}) {
  if (loading) return <Spinner/>;
  if (!history.length) return <Placeholder icon="📋" text="Sin registros aun"/>;
  return (
    <div>
      <Title>HISTORIAL</Title>
      {history.map((h,i) => (
        <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <div><Tag color={C.flamingo}>{h.wod?.type}</Tag><div style={{color:"#fff",fontWeight:700,fontSize:12,marginTop:4}}>{h.wod?.templateLabel}</div><div style={{color:"#444",fontSize:9,marginTop:1}}>{new Date(h.date).toLocaleDateString("es-ES")}</div></div>
            <div style={{textAlign:"right"}}>{h.result&&<div style={{color:C.flamingo,fontWeight:900,fontSize:14,fontFamily:"'Bebas Neue',cursive"}}>{h.result}</div>}{h.carga_sesion>0&&<div style={{color:C.muted,fontSize:9}}>Carga: {h.carga_sesion}</div>}</div>
          </div>
          {h.notes && <div style={{color:C.muted,fontSize:10,fontStyle:"italic",borderTop:`1px solid ${C.border}`,paddingTop:6}}>"{h.notes}"</div>}
        </div>
      ))}
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────
function Sidebar({open, onClose, tab, setTab, onLogout, userName}) {
  const items = [
    {id:"manual",     icon:"✍️", label:"WOD Manual"},
    {id:"favorites",  icon:"🦩", label:"Favoritos"},
    {id:"benchmarks", icon:"⭐", label:"Benchmarks"},
    {id:"history",    icon:"📋", label:"Historial"},
  ];
  return (
    <>
      {open && <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200}}/>}
      <div style={{position:"fixed",top:0,left:0,bottom:0,width:260,background:"#0a0a14",borderRight:`1px solid ${C.border}`,zIndex:300,transform:open?"translateX(0)":"translateX(-100%)",transition:"transform 0.3s ease",display:"flex",flexDirection:"column"}}>
        <div style={{paddingTop:"max(52px, calc(env(safe-area-inset-top, 44px) + 12px))",paddingLeft:16,paddingRight:16,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:28}}>🦩</div>
            <div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,color:C.flamingo}}>FLAMINGO WOD</div><div style={{color:C.muted,fontSize:10}}>{userName}</div></div>
          </div>
        </div>
        <div style={{flex:1,padding:"12px 0",overflowY:"auto"}}>
          {items.map(item => (
            <button key={item.id} onClick={()=>{setTab(item.id);onClose();}} style={{width:"100%",padding:"14px 20px",background:tab===item.id?C.flamingo+"15":"none",border:"none",borderLeft:`3px solid ${tab===item.id?C.flamingo:"transparent"}`,cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
              <span style={{fontSize:18}}>{item.icon}</span>
              <span style={{color:tab===item.id?C.flamingo:"#888",fontWeight:tab===item.id?700:400,fontSize:14}}>{item.label}</span>
            </button>
          ))}
        </div>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`}}>
          <button onClick={onLogout} style={{width:"100%",padding:"10px 0",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,fontSize:12,cursor:"pointer"}}>Cerrar sesion</button>
        </div>
      </div>
    </>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App() {
  const [session,setSession] = useState(null);
  const [tab,setTab] = useState("generate");
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const [wod,setWod] = useState(null), [lastCfg,setLastCfg] = useState(null);
  const [activeTimer,setActiveTimer] = useState(null);
  const [showResult,setShowResult] = useState(false), [elapsedSecs,setElapsedSecs] = useState(null);
  const [showSchedule,setShowSchedule] = useState(false);
  const [history,setHistory] = useState([]), [favorites,setFavorites] = useState([]);
  const [calendarWods,setCalendarWods] = useState([]);
  const [benchmarks,setBenchmarks] = useState([]), [benchmarkResults,setBenchmarkResults] = useState({});
  const [loadingH,setLoadingH] = useState(false), [loadingF,setLoadingF] = useState(false), [loadingB,setLoadingB] = useState(false);
  const ref = useRef(null);
  const {allExercises, saveCustomExercise} = useExerciseDB(session);

  async function loadAll(token) {
    setLoadingH(true); setLoadingF(true); setLoadingB(true);
    const [h,cal,fav,bm] = await Promise.all([
      sb.select(token,"wod_history","select=*"),
      sb.select(token,"wod_calendar","select=*"),
      sb.select(token,"wod_favorites","select=*"),
      sb.select(token,"wod_benchmarks","select=*"),
    ]);
    setHistory(Array.isArray(h)?h:[]);
    setCalendarWods(Array.isArray(cal)?cal:[]);
    setFavorites(Array.isArray(fav)?fav:[]);
    if (Array.isArray(bm)) {
      setBenchmarks(bm);
      const results = {};
      await Promise.all(bm.map(async b => { const r=await sb.select(token,"benchmark_results",`select=*&benchmark_id=eq.${b.id}&order=date.desc`); results[b.id]=Array.isArray(r)?r:[]; }));
      setBenchmarkResults(results);
    }
    setLoadingH(false); setLoadingF(false); setLoadingB(false);
  }

  async function handleAuth(res) { setSession({token:res.access_token,user:res.user||{}}); await loadAll(res.access_token); }
  async function handleLogout() { if(session?.token) await sb.signOut(session.token); setSession(null);setWod(null);setTab("generate");setSidebarOpen(false); }

  async function scheduleWod(date, wodData, sectionId="wod") {
    await sb.insert(session.token,"wod_calendar",{user_id:session.user.id, date, section:sectionId, item:{type:"wod",wod:wodData}, wod:wodData});
    await loadAll(session.token);
  }

  async function addStrengthItem(date, sectionId, item) {
    await sb.insert(session.token,"wod_calendar",{user_id:session.user.id, date, section:sectionId, item, wod:null});
    await loadAll(session.token);
  }

  async function saveEntry({result, rpe, duracion_min, carga_sesion, notes, benchmark}) {
    await sb.insert(session.token,"wod_history",{user_id:session.user.id,wod:activeTimer,result,rpe,duracion_min,carga_sesion,notes,date:new Date().toISOString()});
    if (benchmark) {
      const bm = await sb.insert(session.token,"wod_benchmarks",{user_id:session.user.id,wod:{...activeTimer,isBenchmark:true},name:benchmark.name,metrics:benchmark.metrics});
      if (Array.isArray(bm)&&bm[0]) await sb.insert(session.token,"benchmark_results",{user_id:session.user.id,benchmark_id:bm[0].id,results:{},date:new Date().toISOString(),notes});
    }
    await loadAll(session.token);
    setTab("stats");
  }

  async function addBenchmarkResult(bmId, data) { await sb.insert(session.token,"benchmark_results",{user_id:session.user.id,benchmark_id:bmId,...data}); await loadAll(session.token); }

  async function toggleFavorite(wodData) {
    const existing = favorites.find(f=>f.wod?.generatedAt===wodData.generatedAt&&f.wod?.templateLabel===wodData.templateLabel);
    if (existing) { await sb.remove(session.token,"wod_favorites",existing.id); }
    else { await sb.insert(session.token,"wod_favorites",{user_id:session.user.id,wod:wodData}); }
    await loadAll(session.token);
  }

  const isFav = wod ? favorites.some(f=>f.wod?.generatedAt===wod.generatedAt&&f.wod?.templateLabel===wod.templateLabel) : false;

  const bottomTabs = [
    {id:"generate", icon:"⚡", label:"Generar"},
    {id:"calendar", icon:"📅", label:"Calendario"},
    {id:"stats",    icon:"📊", label:"Stats"},
  ];

  if (!session) return <AuthScreen onAuth={handleAuth}/>;
  if (activeTimer&&!showResult) return <TimerScreen wod={activeTimer} onFinish={secs=>{setElapsedSecs(secs);setShowResult(true);}} onCancel={()=>{setActiveTimer(null);setElapsedSecs(null);}}/>;

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans',sans-serif",color:"#fff",display:"flex",flexDirection:"column"}}>
      <style>{`@import url('${FONT}');*{box-sizing:border-box;margin:0;padding:0;}input,select,textarea,button{font-family:'DM Sans',sans-serif;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#2a2a3e;border-radius:2px;}input[type=range]{-webkit-appearance:none;height:3px;border-radius:2px;background:#2a2a3e;outline:none;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${C.flamingo};cursor:pointer;}select option{background:#0d0d1a;}`}</style>

      <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} tab={tab} setTab={setTab} onLogout={handleLogout} userName={session.user.email?.split("@")[0]?.toUpperCase()}/>

      <div style={{background:"#000",borderBottom:`1px solid ${C.border}`,paddingTop:"max(44px, env(safe-area-inset-top, 44px))",paddingBottom:10,paddingLeft:16,paddingRight:16,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",gap:4,padding:4}}>
          <div style={{width:22,height:2,background:"#fff",borderRadius:2}}/>
          <div style={{width:22,height:2,background:"#fff",borderRadius:2}}/>
          <div style={{width:22,height:2,background:"#fff",borderRadius:2}}/>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:4,color:C.flamingo}}>FLAMINGO WOD</span>
          <span style={{fontSize:20}}>🦩</span>
        </div>
        <div style={{width:30}}/>
      </div>

      <div ref={ref} style={{flex:1,overflowY:"auto",padding:"16px 13px 90px",maxWidth:600,margin:"0 auto",width:"100%"}}>
        {tab==="generate" && (
          <div>
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,letterSpacing:3,lineHeight:1.05,marginBottom:4}}>GENERA TU<br/><span style={{color:C.flamingo}}>PROXIMO WOD</span></div>
              <div style={{color:"#444",fontSize:11}}>🦩 Open · Semifinals · CrossFit Games · Rogue</div>
            </div>
            <GeneratorWizard allExercises={allExercises} onGenerate={cfg=>{setLastCfg(cfg);setWod(generateWOD(cfg));setTab("wod");ref.current?.scrollTo({top:0,behavior:"smooth"});}} onCustom={w=>{setWod(w);setTab("wod");ref.current?.scrollTo({top:0,behavior:"smooth"});}} onSaveCustom={saveCustomExercise}/>
          </div>
        )}

        {tab==="wod" && (
          !wod ? <Placeholder icon="⚡" text="Genera un WOD primero"/> : (
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,letterSpacing:3,marginBottom:12}}>TU <span style={{color:C.flamingo}}>WOD</span></div>
              <div style={{background:C.card,border:`1px solid ${C.flamingo}30`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
                <div style={{background:`linear-gradient(135deg,${C.flamingo}18 0%,#0d0d1a 60%)`,padding:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:5,marginBottom:6}}><Tag color={C.flamingo}>{wod.type}</Tag></div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:"#fff",letterSpacing:2}}>{wod.templateLabel}</div>
                      {wod.ref && <div style={{color:"#444",fontSize:10,fontStyle:"italic"}}>Ref: {wod.ref}</div>}
                    </div>
                    <div style={{textAlign:"right",marginLeft:10}}>
                      <div style={{color:C.flamingo,fontFamily:"'Bebas Neue',cursive",fontSize:30,lineHeight:1}}>{wod.totalTime}</div>
                      <div style={{color:"#444",fontSize:8,letterSpacing:1}}>MIN</div>
                    </div>
                  </div>
                </div>
                <div style={{padding:"8px 14px"}}>{wod.blocks?.map((b,i)=><BlockCard key={i} block={b} color={C.flamingo}/>)}</div>
                <div style={{padding:"8px 14px 14px",display:"flex",gap:6}}>
                  <button onClick={()=>setActiveTimer(wod)} style={{flex:2,padding:"11px 0",background:`linear-gradient(90deg,${C.flamingo},#FF2D7A)`,border:"none",borderRadius:8,fontFamily:"'Bebas Neue',cursive",fontSize:15,color:"#fff",letterSpacing:2,cursor:"pointer"}}>EMPEZAR</button>
                  <button onClick={()=>toggleFavorite(wod)} style={{padding:"11px 11px",background:isFav?C.flamingo+"20":"#13131f",color:isFav?C.flamingo:"#666",border:`1px solid ${isFav?C.flamingo:C.border}`,borderRadius:8,fontSize:15,cursor:"pointer"}}>🦩</button>
                  <button onClick={()=>setShowSchedule(true)} style={{padding:"11px 11px",background:"#13131f",color:"#888",border:`1px solid ${C.border}`,borderRadius:8,fontSize:14,cursor:"pointer"}}>📅</button>
                  <button onClick={()=>lastCfg&&setWod(generateWOD(lastCfg))} style={{padding:"11px 11px",background:"#13131f",color:"#888",border:`1px solid ${C.border}`,borderRadius:8,fontSize:14,cursor:"pointer"}}>↺</button>
                  <button onClick={()=>{setWod(null);setTab("generate");}} style={{padding:"11px 10px",background:"#13131f",color:C.muted,border:`1px solid ${C.bg}`,borderRadius:8,fontSize:11,cursor:"pointer"}}>X</button>
                </div>
              </div>
            </div>
          )
        )}

        {tab==="calendar" && (
          <CalendarView
            calendarWods={calendarWods}
            allExercises={allExercises}
            onSaveCustom={saveCustomExercise}
            onStartWod={w=>setActiveTimer(w)}
            onAddWodToDay={(date,sectionId)=>{ if(wod){setShowSchedule(true);}else{setTab("generate");} }}
            onDeleteItem={async id=>{await sb.remove(session.token,"wod_calendar",id);await loadAll(session.token);}}
            onDeleteWod={async id=>{await sb.remove(session.token,"wod_calendar",id);await loadAll(session.token);}}
            onAddStrengthItem={addStrengthItem}
          />
        )}
        {tab==="stats"      && <StatsView history={history} loading={loadingH}/>}
        {tab==="manual"     && <ManualWODView onSchedule={scheduleWod} onDo={w=>{setWod(w);setTab("wod");}} calendarWods={calendarWods}/>}
        {tab==="favorites"  && <FavoritesView favorites={favorites} loading={loadingF} onLoad={w=>{setWod(w);setTab("wod");}} onDelete={async id=>{await sb.remove(session.token,"wod_favorites",id);await loadAll(session.token);}}/>}
        {tab==="benchmarks" && <BenchmarksView benchmarks={benchmarks} benchmarkResults={benchmarkResults} loading={loadingB} onAddResult={addBenchmarkResult}/>}
        {tab==="history"    && <HistoryView history={history} loading={loadingH}/>}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#000",borderTop:`1px solid ${C.border}`,display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom, 0px)"}}>
        {bottomTabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 0 14px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderTop:`2px solid ${tab===t.id?C.flamingo:"transparent"}`}}>
            <span style={{fontSize:18}}>{t.icon}</span>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:1,color:tab===t.id?C.flamingo:"#444"}}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {showSchedule && wod && <ScheduleModal wod={wod} onSchedule={async(date,w,sec)=>{await scheduleWod(date,w,sec);setShowSchedule(false);}} onClose={()=>setShowSchedule(false)} calendarWods={calendarWods}/>}
      {showResult && activeTimer && <ResultModal wod={activeTimer} elapsedSecs={elapsedSecs} onSave={saveEntry} onClose={()=>{setShowResult(false);setActiveTimer(null);setElapsedSecs(null);}}/>}
    </div>
  );
}
