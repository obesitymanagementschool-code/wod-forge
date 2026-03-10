import { useState, useRef, useEffect } from "react";

const SUPABASE_URL = "https://mrmmkjhoinnkbdwfeqeq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybW1ramhvaW5ua2Jkd2ZlcWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzc4NzksImV4cCI6MjA4ODc1Mzg3OX0.KUiS6MG7n6hGYwnu1CxFDX1VS73ymBkRUIADz2Kyr_g";

const sb = {
  headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
  async signUp(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method:"POST", headers:this.headers, body:JSON.stringify({email,password}) });
    return r.json();
  },
  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method:"POST", headers:this.headers, body:JSON.stringify({email,password}) });
    return r.json();
  },
  async signOut(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method:"POST", headers:{...this.headers,"Authorization":`Bearer ${token}`} });
  },
  async getUser(token) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers:{...this.headers,"Authorization":`Bearer ${token}`} });
    return r.json();
  },
  authHeaders(token) { return {...this.headers,"Authorization":`Bearer ${token}`}; },
  async select(token, table, filter="") {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}&order=created_at.desc`, { headers:this.authHeaders(token) });
    return r.json();
  },
  async insert(token, table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method:"POST", headers:{...this.authHeaders(token),"Prefer":"return=representation"}, body:JSON.stringify(data) });
    return r.json();
  },
  async upsert(token, table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method:"POST", headers:{...this.authHeaders(token),"Prefer":"resolution=merge-duplicates,return=representation"}, body:JSON.stringify(data) });
    return r.json();
  },
  async delete(token, table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method:"DELETE", headers:this.authHeaders(token) });
  },
};

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";
const EQUIPMENT_LIST = [
  { id:"barbell",       label:"Barra olímpica",          icon:"🏋️", group:"Barras" },
  { id:"bumper_plates", label:"Discos bumper",            icon:"⚫", group:"Barras" },
  { id:"dumbbell",      label:"Mancuernas",               icon:"💪", group:"Barras" },
  { id:"kettlebell",    label:"Kettlebell",               icon:"🫙", group:"Barras" },
  { id:"trap_bar",      label:"Trap Bar / Hex Bar",       icon:"⬡",  group:"Barras" },
  { id:"pullup_bar",    label:"Barra de dominadas",       icon:"🔝", group:"Gimnasia" },
  { id:"rings",         label:"Anillas",                  icon:"⭕", group:"Gimnasia" },
  { id:"box",           label:"Cajón / Box",              icon:"📦", group:"Gimnasia" },
  { id:"wall",          label:"Pared (HSPU / Wall Ball)", icon:"🧱", group:"Gimnasia" },
  { id:"rope",          label:"Cuerda de trepar",         icon:"🪢", group:"Gimnasia" },
  { id:"ghd",           label:"GHD",                      icon:"🔄", group:"Gimnasia" },
  { id:"pegboard",      label:"Pegboard",                 icon:"📍", group:"Gimnasia" },
  { id:"row_erg",       label:"Row Erg (Concept2)",       icon:"🚣", group:"Máquinas" },
  { id:"ski_erg",       label:"Ski Erg",                  icon:"⛷️", group:"Máquinas" },
  { id:"echo_bike",     label:"Echo / Assault Bike",      icon:"🚵", group:"Máquinas" },
  { id:"bike_erg",      label:"Bike Erg",                 icon:"🚲", group:"Máquinas" },
  { id:"wallball",      label:"Wall Ball (balón)",         icon:"🟤", group:"Accesorios" },
  { id:"medball",       label:"Med Ball",                 icon:"⚪", group:"Accesorios" },
  { id:"sandbag",       label:"Sandbag / Yoke Bag",       icon:"🎒", group:"Accesorios" },
  { id:"sled",          label:"Trineo (Sled)",            icon:"🛷", group:"Accesorios" },
  { id:"jump_rope",     label:"Cuerda de saltar",         icon:"⟳",  group:"Accesorios" },
  { id:"ab_mat",        label:"Ab Mat",                   icon:"🟨", group:"Accesorios" },
  { id:"plyo_box",      label:"Plyo Box",                 icon:"🟫", group:"Accesorios" },
  { id:"running_track", label:"Pista / Calle exterior",   icon:"🏁", group:"Exterior" },
  { id:"stairs",        label:"Escaleras",                icon:"🪜", group:"Exterior" },
];
const EXERCISES = [
  { id:"pullup",         name:"Pull-ups",              req:["pullup_bar"],      cat:"gym",     unit:"reps",    skill:"low",  cycleTime:3,    minInterval:30 },
  { id:"ctb_pullup",     name:"Chest-to-Bar Pull-ups", req:["pullup_bar"],      cat:"gym",     unit:"reps",    skill:"mid",  cycleTime:4,    minInterval:30 },
  { id:"muscle_up_ring", name:"Ring Muscle-ups",       req:["rings"],           cat:"gym",     unit:"reps",    skill:"high", cycleTime:7,    minInterval:45 },
  { id:"muscle_up_bar",  name:"Bar Muscle-ups",        req:["pullup_bar"],      cat:"gym",     unit:"reps",    skill:"high", cycleTime:6,    minInterval:40 },
  { id:"toes_bar",       name:"Toes-to-Bar",           req:["pullup_bar"],      cat:"gym",     unit:"reps",    skill:"mid",  cycleTime:3,    minInterval:25 },
  { id:"knee_raise",     name:"Hanging Knee Raises",   req:["pullup_bar"],      cat:"gym",     unit:"reps",    skill:"low",  cycleTime:2.5,  minInterval:20 },
  { id:"hspu",           name:"HSPU",                  req:["wall"],            cat:"gym",     unit:"reps",    skill:"high", cycleTime:5,    minInterval:30 },
  { id:"strict_hspu",    name:"Strict HSPU",           req:["wall"],            cat:"gym",     unit:"reps",    skill:"high", cycleTime:8,    minInterval:40 },
  { id:"handstand_walk", name:"Handstand Walk",        req:["wall"],            cat:"gym",     unit:"m",       skill:"high", cycleTime:2,    minInterval:40 },
  { id:"box_jump",       name:"Box Jumps",             req:["box"],             cat:"gym",     unit:"reps",    skill:"low",  cycleTime:3,    minInterval:20 },
  { id:"box_step_over",  name:"Box Step-Over",         req:["box"],             cat:"gym",     unit:"reps",    skill:"low",  cycleTime:4,    minInterval:20 },
  { id:"burpee",         name:"Burpees",               req:[],                  cat:"gym",     unit:"reps",    skill:"low",  cycleTime:5,    minInterval:20 },
  { id:"burpee_box",     name:"Burpee Box Jump-Over",  req:["box"],             cat:"gym",     unit:"reps",    skill:"low",  cycleTime:7,    minInterval:25 },
  { id:"burpee_bar",     name:"Bar-Facing Burpees",    req:["barbell"],         cat:"gym",     unit:"reps",    skill:"low",  cycleTime:6,    minInterval:20 },
  { id:"double_under",   name:"Double Unders",         req:["jump_rope"],       cat:"gym",     unit:"reps",    skill:"mid",  cycleTime:0.4,  minInterval:15 },
  { id:"single_under",   name:"Single Unders",         req:["jump_rope"],       cat:"gym",     unit:"reps",    skill:"low",  cycleTime:0.2,  minInterval:10 },
  { id:"rope_climb",     name:"Rope Climbs (4,6m)",    req:["rope"],            cat:"gym",     unit:"reps",    skill:"mid",  cycleTime:25,   minInterval:50 },
  { id:"legless_rope",   name:"Legless Rope Climbs",   req:["rope"],            cat:"gym",     unit:"reps",    skill:"high", cycleTime:35,   minInterval:70 },
  { id:"ring_dip",       name:"Ring Dips",             req:["rings"],           cat:"gym",     unit:"reps",    skill:"mid",  cycleTime:3.5,  minInterval:25 },
  { id:"pistol",         name:"Pistol Squats",         req:[],                  cat:"gym",     unit:"reps",    skill:"mid",  cycleTime:4,    minInterval:25 },
  { id:"ghd_situp",      name:"GHD Sit-ups",           req:["ghd"],             cat:"gym",     unit:"reps",    skill:"low",  cycleTime:3,    minInterval:20 },
  { id:"pushup",         name:"Push-ups",              req:[],                  cat:"gym",     unit:"reps",    skill:"low",  cycleTime:2.5,  minInterval:15 },
  { id:"ring_pushup",    name:"Ring Push-ups",         req:["rings"],           cat:"gym",     unit:"reps",    skill:"mid",  cycleTime:3,    minInterval:20 },
  { id:"L_pullup",       name:"L-Pull-ups",            req:["pullup_bar"],      cat:"gym",     unit:"reps",    skill:"high", cycleTime:5,    minInterval:35 },
  { id:"thruster",       name:"Thrusters",             req:["barbell"],         cat:"wl",      unit:"reps",    skill:"low",  cycleTime:4,    minInterval:20, rxM:43,  rxW:29 },
  { id:"clean",          name:"Power Clean",           req:["barbell"],         cat:"wl",      unit:"reps",    skill:"low",  cycleTime:5,    minInterval:25, rxM:61,  rxW:43 },
  { id:"squat_clean",    name:"Squat Clean",           req:["barbell"],         cat:"wl",      unit:"reps",    skill:"mid",  cycleTime:6,    minInterval:30, rxM:70,  rxW:47 },
  { id:"clean_jerk",     name:"Clean & Jerk",          req:["barbell"],         cat:"wl",      unit:"reps",    skill:"mid",  cycleTime:8,    minInterval:35, rxM:70,  rxW:47 },
  { id:"snatch",         name:"Squat Snatch",          req:["barbell"],         cat:"wl",      unit:"reps",    skill:"high", cycleTime:9,    minInterval:40, rxM:52,  rxW:34 },
  { id:"power_snatch",   name:"Power Snatch",          req:["barbell"],         cat:"wl",      unit:"reps",    skill:"mid",  cycleTime:7,    minInterval:35, rxM:52,  rxW:34 },
  { id:"hang_clean",     name:"Hang Power Clean",      req:["barbell"],         cat:"wl",      unit:"reps",    skill:"low",  cycleTime:5,    minInterval:25, rxM:61,  rxW:43 },
  { id:"deadlift",       name:"Deadlift",              req:["barbell"],         cat:"wl",      unit:"reps",    skill:"low",  cycleTime:4,    minInterval:20, rxM:102, rxW:70 },
  { id:"overhead_squat", name:"Overhead Squat",        req:["barbell"],         cat:"wl",      unit:"reps",    skill:"mid",  cycleTime:5,    minInterval:25, rxM:43,  rxW:29 },
  { id:"front_squat",    name:"Front Squat",           req:["barbell"],         cat:"wl",      unit:"reps",    skill:"low",  cycleTime:4,    minInterval:20, rxM:61,  rxW:43 },
  { id:"back_squat",     name:"Back Squat",            req:["barbell"],         cat:"wl",      unit:"reps",    skill:"low",  cycleTime:4,    minInterval:20, rxM:61,  rxW:43 },
  { id:"push_press",     name:"Push Press",            req:["barbell"],         cat:"wl",      unit:"reps",    skill:"low",  cycleTime:3.5,  minInterval:20, rxM:52,  rxW:34 },
  { id:"kb_swing",       name:"KB Swing (American)",   req:["kettlebell"],      cat:"wl",      unit:"reps",    skill:"low",  cycleTime:2.5,  minInterval:15, rxM:32,  rxW:24 },
  { id:"kb_snatch",      name:"KB Snatch",             req:["kettlebell"],      cat:"wl",      unit:"reps",    skill:"mid",  cycleTime:4,    minInterval:25, rxM:24,  rxW:16 },
  { id:"wall_ball",      name:"Wall Balls",            req:["wallball","wall"], cat:"wl",      unit:"reps",    skill:"low",  cycleTime:3,    minInterval:15, rxM:9,   rxW:6  },
  { id:"db_snatch",      name:"DB Snatch",             req:["dumbbell"],        cat:"wl",      unit:"reps",    skill:"low",  cycleTime:4,    minInterval:20, rxM:35,  rxW:22 },
  { id:"db_thruster",    name:"DB Thrusters",          req:["dumbbell"],        cat:"wl",      unit:"reps",    skill:"low",  cycleTime:4,    minInterval:20, rxM:22,  rxW:15 },
  { id:"farmers_carry",  name:"Farmer's Carry",        req:["dumbbell"],        cat:"wl",      unit:"m",       skill:"low",  cycleTime:0.6,  minInterval:20, rxM:35,  rxW:22 },
  { id:"sled_push",      name:"Sled Push",             req:["sled"],            cat:"wl",      unit:"m",       skill:"low",  cycleTime:1.5,  minInterval:30, rxM:90,  rxW:70 },
  { id:"medball_clean",  name:"Med Ball Clean",        req:["medball"],         cat:"wl",      unit:"reps",    skill:"low",  cycleTime:4,    minInterval:20 },
  { id:"barbell_lunge",  name:"Barbell Lunges",        req:["barbell"],         cat:"wl",      unit:"reps",    skill:"low",  cycleTime:4,    minInterval:20, rxM:61,  rxW:43 },
  { id:"row_cal",        name:"Row (Calorías)",        req:["row_erg"],         cat:"machine", unit:"cal",     skill:"low",  cycleTime:4,    minInterval:25 },
  { id:"ski_cal",        name:"Ski Erg (Calorías)",    req:["ski_erg"],         cat:"machine", unit:"cal",     skill:"low",  cycleTime:4.5,  minInterval:25 },
  { id:"echo_cal",       name:"Echo Bike (Cal)",       req:["echo_bike"],       cat:"machine", unit:"cal",     skill:"low",  cycleTime:3.5,  minInterval:25 },
  { id:"bike_erg_cal",   name:"Bike Erg (Calorías)",   req:["bike_erg"],        cat:"machine", unit:"cal",     skill:"low",  cycleTime:3,    minInterval:25 },
  { id:"row_250",        name:"Row 250m",              req:["row_erg"],         cat:"machine", unit:"m",       skill:"low",  cycleTime:0.22, minInterval:55,  fixed:250  },
  { id:"row_500",        name:"Row 500m",              req:["row_erg"],         cat:"machine", unit:"m",       skill:"low",  cycleTime:0.24, minInterval:120, fixed:500  },
  { id:"run_200",        name:"Run 200m",              req:["running_track"],   cat:"run",     unit:"m",       skill:"low",  cycleTime:0.22, minInterval:45,  fixed:200  },
  { id:"run_400",        name:"Run 400m",              req:["running_track"],   cat:"run",     unit:"m",       skill:"low",  cycleTime:0.225,minInterval:90,  fixed:400  },
  { id:"run_800",        name:"Run 800m",              req:["running_track"],   cat:"run",     unit:"m",       skill:"low",  cycleTime:0.27, minInterval:216, fixed:800  },
];
const ENERGY = {
  atpcr:    { label:"ATP-PCr",          sub:"Potencia Anaeróbica Máxima", color:"#FF2D55", desc:"<10s esfuerzo máximo" },
  gluc_pot: { label:"Pot. Glucolítica", sub:"Potencia Glucolítica",       color:"#FF9500", desc:"10–30s intensidad alta" },
  gluc_cap: { label:"Cap. Glucolítica", sub:"Capacidad Glucolítica",      color:"#FFCC00", desc:"30s–2min sostenido" },
  aero_pot: { label:"Pot. Aeróbica",    sub:"Potencia Aeróbica",          color:"#34C759", desc:"2–8min alta intensidad" },
  aero_cap: { label:"Cap. Aeróbica",    sub:"Capacidad Aeróbica",         color:"#30D5C8", desc:">8min larga duración" },
};
const CYCLE_MULT = { beginner:1.9, scaled:1.45, intermediate:1.2, rx:1.0 };
const SKILL_ALLOWED = { beginner:["low"], scaled:["low","mid"], intermediate:["low","mid","high"], rx:["low","mid","high"] };
const CTX_WINDOWS = { emom_1min:{workSec:42}, emom_2min:{workSec:90}, amrap:{workSec:75}, fortime:{workSec:60}, chipper:{workSec:45}, buyin:{workSec:90} };

function calcReps(ex,lvl,ctx) {
  if (!ex) return 0; if (ex.fixed) return ex.fixed;
  const mult=CYCLE_MULT[lvl]||1.2, {workSec}=CTX_WINDOWS[ctx]||CTX_WINDOWS.amrap;
  const raw=Math.floor((workSec*0.88)/(ex.cycleTime*mult));
  const CAPS={gym:[1,35],wl:[1,25],machine:[3,50],run:[1,1]};
  const [mn,mx]=CAPS[ex.cat]||[1,30];
  return Math.max(mn,Math.min(mx,raw));
}
const scaled=(ex,lvl,ctx)=>calcReps(ex,lvl,ctx);
function filterForCtx(pool,lvl,ctx) {
  const allowed=SKILL_ALLOWED[lvl]||["low"],mult=CYCLE_MULT[lvl]||1.2,{workSec}=CTX_WINDOWS[ctx]||CTX_WINDOWS.amrap;
  return pool.filter(ex=>{ if(!allowed.includes(ex.skill)) return false; if(ex.fixed) return ex.fixed*ex.cycleTime*mult<=workSec*1.1; return ex.cycleTime*mult<=workSec*0.95; });
}
function safePool(pool,lvl,ctx,min=2) {
  const f=filterForCtx(pool,lvl,ctx); if(f.length>=min) return f;
  return pool.filter(e=>SKILL_ALLOWED[lvl||"rx"].includes(e.skill));
}
const TEMPLATES = {
  amrap_single:{ format:"AMRAP",primaryCtx:"amrap",energy:["gluc_cap","aero_pot","aero_cap"],label:"AMRAP Clásico",ref:"Open 11.1 / 12.1", build:({dur,exs,lvl})=>{ const p=safePool(exs,lvl,"amrap"); return {type:"AMRAP",totalTime:dur,blocks:[{kind:"AMRAP",minutes:dur,movements:p.slice(0,3).map(e=>({ex:e,reps:scaled(e,lvl,"amrap")}))}],scoring:`AMRAP ${dur} min → Total Rondas + Reps`}; }},
  amrap_double:{ format:"AMRAP",primaryCtx:"amrap",energy:["aero_pot","aero_cap","gluc_cap"],label:"Double AMRAP c/ Descanso",ref:"Games 2019 / Semifinals 2021–2023", build:({dur,exs,lvl})=>{ const h=Math.max(5,Math.floor((dur-3)/2)),p=safePool(exs,lvl,"amrap"),m=p.slice(0,3).map(e=>({ex:e,reps:scaled(e,lvl,"amrap")})); return {type:"AMRAP",totalTime:h*2+3,blocks:[{kind:"AMRAP",minutes:h,movements:m},{kind:"REST",minutes:3,note:"Retoma desde 0"},{kind:"AMRAP",minutes:h,movements:m}],scoring:`2×AMRAP ${h}min / 3min descanso`}; }},
  emom_2mov:{ format:"EMOM",primaryCtx:"emom_1min",energy:["atpcr","gluc_pot","gluc_cap"],label:"EMOM Alternado (2 mov.)",ref:"Open 12.5 / Rogue", build:({dur,exs,lvl})=>{ const p=safePool(exs,lvl,"emom_1min"),r=Math.floor(dur/2); return {type:"EMOM",totalTime:r*2,blocks:[{kind:"EMOM",minutes:r*2,scheme:p.slice(0,2).map((e,i)=>({minute:i===0?"Min impares":"Min pares",ex:e,reps:scaled(e,lvl,"emom_1min")})),note:`${r} rondas de cada movimiento`}],scoring:`EMOM ${r*2} min alternado`}; }},
  emom_3mov:{ format:"EMOM",primaryCtx:"emom_1min",energy:["gluc_pot","gluc_cap","aero_pot"],label:"EMOM 3 Movimientos",ref:"Semifinals 2022 / Games 2018", build:({dur,exs,lvl})=>{ const p=safePool(exs,lvl,"emom_1min"),r=Math.floor(dur/3); return {type:"EMOM",totalTime:r*3,blocks:[{kind:"EMOM",minutes:r*3,scheme:p.slice(0,3).map((e,i)=>({minute:`Min ${i+1},${i+4},${i+7}…`,ex:e,reps:scaled(e,lvl,"emom_1min")})),note:`Ciclo 3 min. ${r} rondas.`}],scoring:`EMOM ${r*3} min (3 mov.)`}; }},
  emom_strength:{ format:"EMOM",primaryCtx:"emom_2min",energy:["atpcr","gluc_pot"],label:"EMOM de Fuerza (c/2 min)",ref:"Rogue / Games Strength", build:({dur,exs,lvl})=>{ const wl=exs.filter(e=>e.cat==="wl"),p=safePool(wl.length>=2?wl:exs,lvl,"emom_2min"),s=Math.floor(dur/2); return {type:"EMOM",totalTime:s*2,blocks:[{kind:"EMOM",minutes:s*2,scheme:p.slice(0,2).map((e,i)=>({minute:i===0?"Min impares":"Min pares",ex:e,reps:scaled(e,lvl,"emom_2min"),note:"~80-85%RM"})),note:`${s} series c/2 min`}],scoring:`EMOM ${s*2} min (c/2 min)`}; }},
  for_time_rft:{ format:"For Time",primaryCtx:"fortime",energy:["gluc_cap","aero_pot"],label:"For Time – Rondas",ref:"Open 14.5 / 17.5 / 20.1", build:({dur,exs,lvl})=>{ const r=[3,4,5][Math.floor(Math.random()*3)],p=safePool(exs,lvl,"fortime"); return {type:"For Time",totalTime:dur,timeCap:dur,blocks:[{kind:"ForTime",rounds:r,movements:p.slice(0,3).map(e=>({ex:e,reps:scaled(e,lvl,"fortime")})),note:`Time Cap: ${dur} min`}],scoring:`${r} RFT (Cap: ${dur} min)`}; }},
  for_time_chipper:{ format:"For Time",primaryCtx:"chipper",energy:["aero_pot","aero_cap"],label:"Chipper For Time",ref:"Games 2016 / Semifinals", build:({dur,exs,lvl})=>{ const p=safePool(exs,lvl,"chipper"); return {type:"For Time",totalTime:dur,timeCap:dur,blocks:[{kind:"ForTime",rounds:1,movements:p.slice(0,Math.min(6,p.length)).map(e=>({ex:e,reps:scaled(e,lvl,"chipper")})),note:`Chipper. Cap: ${dur} min`}],scoring:`Chipper For Time (Cap: ${dur} min)`}; }},
  for_time_21_15_9:{ format:"For Time",primaryCtx:"fortime",energy:["gluc_cap","aero_pot"],label:"21-15-9",ref:"Fran / Diane / Open clásicos", build:({dur,exs,lvl})=>{ const p=safePool(exs,lvl,"fortime"); return {type:"For Time",totalTime:dur,timeCap:dur,blocks:[{kind:"ForTime",rounds:1,descending:[21,15,9],movements:p.slice(0,2).map(e=>({ex:e,reps:null})),note:`Cap: ${dur} min`}],scoring:`21-15-9 For Time`}; }},
  emom_then_amrap:{ format:"Combinado",primaryCtx:"emom_1min",energy:["gluc_cap","aero_pot"],label:"EMOM → AMRAP",ref:"Semifinals 2021 / Games 2022", build:({dur,exs,lvl})=>{ const em=Math.max(6,Math.floor(dur*0.4)),am=Math.max(5,dur-em-2),ep=safePool(exs.slice(0,3),lvl,"emom_1min"),ap=safePool(exs.slice(2),lvl,"amrap"); return {type:"Combinado",totalTime:em+2+am,blocks:[{kind:"EMOM",minutes:em,scheme:ep.slice(0,2).map((e,i)=>({minute:i===0?"Min impares":"Min pares",ex:e,reps:scaled(e,lvl,"emom_1min")})),note:`EMOM ${em} min`},{kind:"REST",minutes:2,note:"2 min descanso"},{kind:"AMRAP",minutes:am,movements:ap.slice(0,3).map(e=>({ex:e,reps:scaled(e,lvl,"amrap")})),note:`AMRAP ${am} min`}],scoring:`EMOM ${em}min + AMRAP ${am}min`}; }},
  buy_in_amrap:{ format:"Combinado",primaryCtx:"amrap",energy:["aero_pot","gluc_cap"],label:"Buy-in → AMRAP → Cash-out",ref:"Rogue 2020 / Games 2019", build:({dur,exs,lvl})=>{ const am=Math.max(8,dur-5),p=safePool(exs,lvl,"amrap"); return {type:"Combinado",totalTime:dur,blocks:[{kind:"BuyIn",note:"Completa ANTES del AMRAP",movements:[{ex:p[0],reps:scaled(p[0],lvl,"buyin")}]},{kind:"AMRAP",minutes:am,movements:p.slice(1,4).map(e=>({ex:e,reps:scaled(e,lvl,"amrap")}))},{kind:"CashOut",note:"Solo si queda tiempo",movements:[{ex:p[p.length-1],reps:scaled(p[p.length-1],lvl,"buyin")}]}],scoring:`Buy-in + AMRAP ${am}min + Cash-out`}; }},
  death_by:{ format:"Ladder",primaryCtx:"emom_1min",energy:["atpcr","gluc_pot"],label:"Death By",ref:"Death By Pull-ups / Open", build:({dur,exs,lvl})=>{ const p=safePool(exs,lvl,"emom_1min"); return {type:"Ladder",totalTime:dur,blocks:[{kind:"DeathBy",minutes:dur,movement:p[0],note:`Min 1:1rep | Min 2:2reps | … Máx ${dur} min`}],scoring:"Último minuto completado"}; }},
  every_3min:{ format:"For Time",primaryCtx:"fortime",energy:["gluc_cap","aero_pot"],label:"Every 3 Min (E3MOM)",ref:"Semifinals 2022 / Games 2021", build:({dur,exs,lvl})=>{ const s=Math.floor(dur/3),p=safePool(exs,lvl,"fortime"); return {type:"For Time",totalTime:s*3,blocks:[{kind:"ForTimeSeries",sets:s,interval:3,movements:p.slice(0,3).map(e=>({ex:e,reps:scaled(e,lvl,"fortime")})),note:`${s} sets. Descanso = tiempo restante.`}],scoring:`Every 3 min × ${s} sets`}; }},
  every_5min:{ format:"For Time",primaryCtx:"fortime",energy:["aero_pot","gluc_cap"],label:"Every 5 Min (E5MOM)",ref:"Games 2017 / 2020", build:({dur,exs,lvl})=>{ const s=Math.floor(dur/5),p=safePool(exs,lvl,"fortime"); return {type:"For Time",totalTime:s*5,blocks:[{kind:"ForTimeSeries",sets:s,interval:5,movements:p.slice(0,3).map(e=>({ex:e,reps:scaled(e,lvl,"chipper")})),note:`${s} sets.`}],scoring:`Every 5 min × ${s} sets`}; }},
  hero_wod:{ format:"Hero WOD",primaryCtx:"fortime",energy:["aero_cap","aero_pot"],label:"Hero WOD",ref:"Murph / DT / Loredo / Nate", build:({dur,exs,lvl})=>{ const p=safePool(exs,lvl,"fortime"); return {type:"Hero WOD",totalTime:dur,timeCap:dur,blocks:[{kind:"ForTime",rounds:5,movements:p.slice(0,4).map(e=>({ex:e,reps:scaled(e,lvl,"fortime")})),note:`5 RFT. Cap: ${dur} min`}],scoring:`Hero WOD 5 RFT (Cap: ${dur} min)`}; }},
};
function generateWOD({format,energy,duration,level,equipment,maxExercises,userExercises,useCustomExercises}) {
  const equipOk=e=>e.req.length===0||e.req.every(r=>equipment[r]);
  const basePool=useCustomExercises&&userExercises.length>0?EXERCISES.filter(e=>userExercises.includes(e.id)&&equipOk(e)):EXERCISES.filter(equipOk);
  const cands=Object.values(TEMPLATES).filter(t=>{ if(format!=="Aleatorio"&&t.format!==format) return false; if(energy!=="any"&&!t.energy.includes(energy)) return false; return true; });
  const tmpl=cands.length>0?cands[Math.floor(Math.random()*cands.length)]:Object.values(TEMPLATES)[Math.floor(Math.random()*Object.values(TEMPLATES).length)];
  const filtered=safePool(basePool,level,tmpl.primaryCtx||"amrap");
  const chosen=[...filtered].sort(()=>Math.random()-0.5).slice(0,Math.max(2,Math.min(maxExercises||5,filtered.length)));
  const wod=tmpl.build({dur:duration,exs:chosen,lvl:level});
  return {...wod,templateLabel:tmpl.label,ref:tmpl.ref,energyKey:energy,energyLabel:energy!=="any"?ENERGY[energy]?.label:"General",energyColor:energy!=="any"?ENERGY[energy]?.color:"#FF6B35",id:Date.now().toString(),generatedAt:new Date().toISOString(),level};
}
function suggestNext(history) {
  if (!history?.length) return null;
  const counts=Object.fromEntries(Object.keys(ENERGY).map(k=>[k,0]));
  history.forEach(h=>{ if(counts[h.wod?.energyKey]!==undefined) counts[h.wod.energyKey]++; });
  return Object.entries(counts).sort((a,b)=>a[1]-b[1])[0][0];
}

const C={bg:"#07070f",card:"#0d0d1a",border:"#1e1e30",text:"#e8e8f4",muted:"#555",dim:"#333",accent:"#FF6B35"};
function Tag({color,children}) { return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:800,letterSpacing:1}}>{children}</span>; }
function MovRow({m}) {
  const ex=m.ex,reps=m.reps;
  return <div style={{display:"flex",alignItems:"baseline",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.bg}`}}>{reps!=null&&<span style={{color:C.accent,fontWeight:900,fontSize:17,fontFamily:"'Bebas Neue',cursive",minWidth:36}}>{reps}{ex?.unit==="m"?" m":ex?.unit==="cal"?" cal":""}</span>}<span style={{color:C.text,fontWeight:600,fontSize:14}}>{ex?.name||"—"}</span>{ex?.rxM&&<span style={{color:"#444",fontSize:11,marginLeft:"auto"}}>{ex.rxM}kg H / {ex.rxW}kg M</span>}</div>;
}
function BlockCard({block,color}) {
  if (block.kind==="REST") return <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0"}}><div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:11,fontWeight:800,letterSpacing:2,color:C.muted,whiteSpace:"nowrap"}}>⏸ {block.minutes?`${block.minutes} MIN DESCANSO`:"DESCANSO"}{block.note?` — ${block.note}`:""}</span><div style={{flex:1,height:1,background:C.border}}/></div>;
  if (block.kind==="BuyIn"||block.kind==="CashOut") return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}><div style={{color,fontSize:11,fontWeight:800,letterSpacing:2,marginBottom:8}}>{block.kind==="BuyIn"?"⬇ BUY-IN":"⬆ CASH-OUT"}</div>{block.note&&<div style={{color:"#666",fontSize:12,marginBottom:6}}>{block.note}</div>}{block.movements?.map((m,i)=><MovRow key={i} m={m}/>)}</div>;
  if (block.kind==="DeathBy") return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}><div style={{color,fontSize:11,fontWeight:800,letterSpacing:2,marginBottom:6}}>DEATH BY</div><div style={{color:"#fff",fontSize:15,fontWeight:700,marginBottom:8}}>{block.movement?.name||"—"}</div><div style={{background:C.bg,borderRadius:6,padding:"8px 12px",fontSize:12,color:"#aaa",lineHeight:1.8}}>Min 1: 1 rep · Min 2: 2 reps · …<br/>Hasta no poder completar el minuto</div></div>;
  if (block.kind==="EMOM") return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{color,fontSize:11,fontWeight:800,letterSpacing:2}}>EMOM</span><span style={{color:"#ccc",fontSize:14,fontWeight:800,fontFamily:"'Bebas Neue',cursive"}}>{block.minutes} MIN</span></div>{block.scheme?.map((s,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:8,padding:"7px 10px",background:C.bg,borderRadius:7}}><div style={{color,fontSize:10,fontWeight:800,minWidth:120,letterSpacing:1}}>{s.minute}:</div><div><div style={{color:"#fff",fontWeight:700,fontSize:13}}>{s.reps?`${s.reps} `:""}{s.ex?.name||"—"}</div>{s.ex?.rxM&&<div style={{color:"#444",fontSize:11,marginTop:1}}>RX: {s.ex.rxM}kg H / {s.ex.rxW}kg M</div>}{s.note&&<div style={{color:"#666",fontSize:11,marginTop:1}}>{s.note}</div>}</div></div>)}{block.note&&<div style={{color:C.muted,fontSize:11,borderTop:`1px solid ${C.border}`,paddingTop:6,marginTop:4}}>{block.note}</div>}</div>;
  if (block.kind==="ForTimeSeries") return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}><div style={{color,fontSize:11,fontWeight:800,letterSpacing:2,marginBottom:8}}>EVERY {block.interval} MIN × {block.sets} SETS</div>{block.movements?.map((m,i)=><MovRow key={i} m={m}/>)}{block.note&&<div style={{color:C.muted,fontSize:11,marginTop:6}}>{block.note}</div>}</div>;
  if (block.kind==="Custom") return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px",marginBottom:8}}><div style={{color,fontSize:11,fontWeight:800,letterSpacing:2,marginBottom:8}}>WOD PERSONALIZADO</div><div style={{color:"#ccc",fontSize:13,fontFamily:"monospace",whiteSpace:"pre-line",lineHeight:1.7}}>{block.content}</div></div>;
  const isAMRAP=block.kind==="AMRAP",isDesc=!!block.descending;
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{color,fontSize:11,fontWeight:800,letterSpacing:2}}>{isAMRAP?"AMRAP":block.kind==="ForTime"?"FOR TIME":block.kind}</span>{isAMRAP&&<span style={{color:"#fff",fontSize:22,fontWeight:900,fontFamily:"'Bebas Neue',cursive"}}>{block.minutes} MIN</span>}{!isAMRAP&&block.rounds&&!isDesc&&<span style={{color:"#ccc",fontSize:13,fontWeight:700}}>{block.rounds} Rounds</span>}{block.timeCap&&<span style={{color:"#FF2D55",fontSize:11,fontWeight:700}}>Cap {block.timeCap}m</span>}</div>{isDesc&&<div style={{display:"flex",gap:8,marginBottom:10}}>{block.descending.map(r=><div key={r} style={{background:C.bg,borderRadius:6,padding:"5px 12px",color,fontWeight:900,fontSize:20,fontFamily:"'Bebas Neue',cursive"}}>{r}</div>)}</div>}{block.movements?.map((m,i)=><MovRow key={i} m={m}/>)}{block.note&&<div style={{color:C.muted,fontSize:11,borderTop:`1px solid ${C.border}`,paddingTop:6,marginTop:6}}>{block.note}</div>}</div>;
}
function WODDisplay({wod,onLog,onDiscard,onRegenerate}) {
  const color=wod.energyColor||C.accent;
  return <div><div style={{background:`linear-gradient(135deg,${color}18 0%,#0d0d1a 60%)`,border:`1px solid ${color}30`,borderRadius:"14px 14px 0 0",padding:"18px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{flex:1}}><div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}><Tag color={color}>{wod.type}</Tag><Tag color={C.muted}>{wod.energyLabel}</Tag><Tag color={C.muted}>{wod.level?.toUpperCase()}</Tag></div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:"#fff",letterSpacing:2,marginBottom:3}}>{wod.templateLabel}</div>{wod.ref&&<div style={{color:"#444",fontSize:11,fontStyle:"italic"}}>Ref: {wod.ref}</div>}</div><div style={{textAlign:"right",marginLeft:12}}><div style={{color,fontFamily:"'Bebas Neue',cursive",fontSize:36,lineHeight:1}}>{wod.totalTime}</div><div style={{color:"#444",fontSize:9,letterSpacing:1}}>MIN TOTAL</div></div></div><div style={{background:C.bg,borderRadius:7,padding:"8px 12px",marginTop:12,border:`1px solid ${C.border}`}}><div style={{color,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:2}}>SCORING</div><div style={{color:"#ccc",fontSize:12}}>{wod.scoring}</div></div></div><div style={{background:"#0a0a16",border:`1px solid ${color}20`,borderTop:"none",padding:"14px 14px 6px"}}>{wod.blocks?.map((b,i)=><BlockCard key={i} block={b} color={color}/>)}</div><div style={{background:C.card,border:`1px solid ${color}20`,borderTop:`1px solid ${C.border}`,borderRadius:"0 0 14px 14px",padding:"12px 14px",display:"flex",gap:8}}><button onClick={onLog} style={{flex:1,padding:"12px 0",background:color,color:"#000",border:"none",borderRadius:8,fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:2,cursor:"pointer"}}>✓ REGISTRAR</button><button onClick={onRegenerate} style={{padding:"12px 12px",background:"#13131f",color:"#888",border:`1px solid ${C.border}`,borderRadius:8,fontSize:16,cursor:"pointer"}}>↺</button><button onClick={onDiscard} style={{padding:"12px 12px",background:"#13131f",color:C.muted,border:`1px solid ${C.bg}`,borderRadius:8,fontSize:12,cursor:"pointer"}}>✕</button></div></div>;
}

function Sec({title,children,right}) { return <div style={{marginBottom:0}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:2}}>{title}</span>{right}</div>{children}</div>; }
function Pill({active,onClick,color,children,wide}) { return <button onClick={onClick} style={{padding:"8px 6px",width:wide?"100%":undefined,background:active?color+"25":C.card,border:`1px solid ${active?color:C.border}`,borderRadius:7,color:active?color:"#666",fontWeight:700,fontSize:10,cursor:"pointer"}}>{children}</button>; }
function MiniBtn({onClick,children}) { return <button onClick={onClick} style={{padding:"3px 9px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:5,color:"#666",fontSize:9,fontWeight:700,cursor:"pointer"}}>{children}</button>; }
function Title({children}) { return <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color:"#fff",letterSpacing:3,marginBottom:18}}>{children}</div>; }
function Placeholder({icon,text}) { return <div style={{textAlign:"center",padding:"50px 20px",color:C.dim}}><div style={{fontSize:48,marginBottom:10}}>{icon}</div><div style={{fontSize:13}}>{text}</div></div>; }
function Spinner() { return <div style={{textAlign:"center",padding:40}}><div style={{width:32,height:32,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}></div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>; }

// AUTH SCREEN
function AuthScreen({onAuth}) {
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState(""), [pass,setPass]=useState(""), [err,setErr]=useState(""), [loading,setLoading]=useState(false);
  const inp={width:"100%",padding:"12px 14px",background:"#0d0d1a",border:`1px solid ${C.border}`,borderRadius:10,color:"#fff",fontSize:14,boxSizing:"border-box",marginBottom:12,outline:"none"};
  const handle=async()=>{
    if(!email||!pass){setErr("Completa todos los campos");return;}
    setLoading(true);setErr("");
    try {
      const res=mode==="login"?await sb.signIn(email,pass):await sb.signUp(email,pass);
      if(res.error||res.msg){setErr(res.error?.message||res.msg||"Error");setLoading(false);return;}
      if(mode==="register"&&!res.access_token){setErr("Revisa tu email para confirmar la cuenta");setLoading(false);return;}
      onAuth(res);
    } catch(e){setErr("Error de conexión");setLoading(false);}
  };
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{`@import url('${FONT_LINK}');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{width:32,height:32,background:"linear-gradient(135deg,#FF6B35,#FF2D55)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:12}}>🔥</div>
      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:32,letterSpacing:4,marginBottom:4}}>WOD FORGE</div>
      <div style={{color:C.muted,fontSize:11,letterSpacing:3,marginBottom:36}}>CROSSFIT GENERATOR</div>
      <div style={{width:"100%",maxWidth:360,background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:24}}>
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {["login","register"].map(m=><button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"9px 0",background:mode===m?C.accent+"25":C.bg,border:`1px solid ${mode===m?C.accent:C.border}`,borderRadius:8,color:mode===m?C.accent:"#666",fontWeight:700,fontSize:11,cursor:"pointer",letterSpacing:1}}>{m==="login"?"ENTRAR":"REGISTRARSE"}</button>)}
        </div>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={inp}/>
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Contraseña" type="password" style={{...inp,marginBottom:err?8:16}} onKeyDown={e=>e.key==="Enter"&&handle()}/>
        {err&&<div style={{color:"#FF2D55",fontSize:12,marginBottom:12,padding:"8px 12px",background:"#FF2D5510",borderRadius:6,border:"1px solid #FF2D5530"}}>{err}</div>}
        <button onClick={handle} disabled={loading} style={{width:"100%",padding:"13px 0",background:`linear-gradient(90deg,#FF6B35,#FF2D55)`,border:"none",borderRadius:10,fontFamily:"'Bebas Neue',cursive",fontSize:18,color:"#000",letterSpacing:2,cursor:"pointer",opacity:loading?0.7:1}}>
          {loading?"...":mode==="login"?"ENTRAR":"CREAR CUENTA"}
        </button>
      </div>
    </div>
  );
}

// LOG MODAL
function LogModal({wod,onSave,onClose}) {
  const [result,setResult]=useState(""), [rpe,setRpe]=useState(7), [notes,setNotes]=useState(""), [saving,setSaving]=useState(false);
  const color=wod?.energyColor||C.accent;
  const inp={width:"100%",padding:"9px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:"#fff",fontSize:13,boxSizing:"border-box"};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"#0a0a16",border:`1px solid ${color}30`,borderRadius:"18px 18px 0 0",padding:"20px 18px 36px",width:"100%",maxWidth:520,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:C.border,borderRadius:2,margin:"0 auto 18px"}}/>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:"#fff",letterSpacing:2,marginBottom:18}}>REGISTRAR WOD</div>
        <label style={{color:C.muted,fontSize:10,letterSpacing:2,display:"block",marginBottom:5}}>RESULTADO / TIEMPO</label>
        <input value={result} onChange={e=>setResult(e.target.value)} placeholder="Ej: 18:45 · 12 rondas + 8 reps" style={{...inp,marginBottom:14}}/>
        <label style={{color:C.muted,fontSize:10,letterSpacing:2,display:"block",marginBottom:6}}>RPE: <span style={{color}}>{rpe}/10</span></label>
        <div style={{display:"flex",gap:3,marginBottom:16}}>
          {[1,2,3,4,5,6,7,8,9,10].map(n=><button key={n} onClick={()=>setRpe(n)} style={{flex:1,padding:"6px 0",background:rpe>=n?color:"#13131f",border:"none",borderRadius:4,color:rpe>=n?"#000":"#444",fontWeight:700,fontSize:10,cursor:"pointer"}}>{n}</button>)}
        </div>
        <label style={{color:C.muted,fontSize:10,letterSpacing:2,display:"block",marginBottom:5}}>NOTAS</label>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Sensaciones, estrategia..." style={{...inp,resize:"vertical",marginBottom:16}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={async()=>{setSaving(true);await onSave({wod,result,rpe,notes,date:new Date().toISOString()});setSaving(false);onClose();}} style={{flex:1,padding:"13px 0",background:color,color:"#000",border:"none",borderRadius:10,fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:1,cursor:"pointer",opacity:saving?0.7:1}}>{saving?"GUARDANDO…":"GUARDAR"}</button>
          <button onClick={onClose} style={{padding:"13px 16px",background:"#13131f",color:C.muted,border:`1px solid ${C.border}`,borderRadius:10,cursor:"pointer"}}>✕</button>
        </div>
      </div>
    </div>
  );
}

function GeneratorWizard({onGenerate}) {
  const [format,setFormat]=useState("Aleatorio"),[energy,setEnergy]=useState("any"),[duration,setDuration]=useState(20),[level,setLevel]=useState("rx");
  const [equipment,setEquipment]=useState(()=>Object.fromEntries(EQUIPMENT_LIST.map(e=>[e.id,true])));
  const [maxEx,setMaxEx]=useState(4),[useCustomEx,setUseCustomEx]=useState(false),[userEx,setUserEx]=useState([]);
  const toggleAll=v=>setEquipment(Object.fromEntries(EQUIPMENT_LIST.map(e=>[e.id,v])));
  const avail=EXERCISES.filter(e=>e.req.length===0||e.req.every(r=>equipment[r]));
  const groups=[...new Set(EQUIPMENT_LIST.map(e=>e.group))];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <Sec title="FORMATO WOD"><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5}}>{["Aleatorio","AMRAP","EMOM","For Time","Combinado","Ladder","Hero WOD"].map(f=><Pill key={f} active={format===f} onClick={()=>setFormat(f)} color={C.accent}>{f}</Pill>)}</div></Sec>
      <Sec title="SISTEMA ENERGÉTICO"><Pill active={energy==="any"} onClick={()=>setEnergy("any")} color="#888" wide>🎲 Cualquier sistema</Pill><div style={{marginTop:7,display:"flex",flexDirection:"column",gap:5}}>{Object.entries(ENERGY).map(([k,v])=><button key={k} onClick={()=>setEnergy(k)} style={{padding:"10px 12px",background:energy===k?v.color+"20":C.card,border:`1px solid ${energy===k?v.color:C.border}`,borderRadius:8,cursor:"pointer",textAlign:"left"}}><span style={{color:v.color,fontWeight:800,fontSize:12}}>{v.label}</span><span style={{color:"#444",fontSize:11,marginLeft:5}}>— {v.sub}</span><span style={{color:C.muted,fontSize:10,display:"block",marginTop:1}}>{v.desc}</span></button>)}</div></Sec>
      <Sec title="NIVEL Y DURACIÓN"><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:14}}>{[{id:"beginner",l:"Principiante"},{id:"scaled",l:"Scaled"},{id:"intermediate",l:"Intermedio"},{id:"rx",l:"RX"}].map(l=><Pill key={l.id} active={level===l.id} onClick={()=>setLevel(l.id)} color={C.accent}>{l.l}</Pill>)}</div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#888",fontSize:11}}>Duración</span><span style={{color:C.accent,fontWeight:800}}>{duration} min</span></div><input type="range" min={8} max={70} step={1} value={duration} onChange={e=>setDuration(+e.target.value)} style={{width:"100%",accentColor:C.accent}}/><div style={{display:"flex",justifyContent:"space-between",color:"#444",fontSize:10,marginTop:2}}><span>8 min</span><span>70 min</span></div></Sec>
      <Sec title="MATERIAL" right={<div style={{display:"flex",gap:5}}><MiniBtn onClick={()=>toggleAll(true)}>Todo ✓</MiniBtn><MiniBtn onClick={()=>toggleAll(false)}>Ninguno</MiniBtn></div>}>{groups.map(g=><div key={g} style={{marginBottom:12}}><div style={{color:"#444",fontSize:9,letterSpacing:2,fontWeight:700,marginBottom:5}}>{g.toUpperCase()}</div><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:4}}>{EQUIPMENT_LIST.filter(e=>e.group===g).map(e=><button key={e.id} onClick={()=>setEquipment(p=>({...p,[e.id]:!p[e.id]}))} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 9px",background:equipment[e.id]?"#13131f":"#0a0a14",border:`1px solid ${equipment[e.id]?C.border:"#161625"}`,borderRadius:6,cursor:"pointer",opacity:equipment[e.id]?1:0.4}}><div style={{width:14,height:14,borderRadius:3,flexShrink:0,background:equipment[e.id]?C.accent:"#1e1e30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#000",fontWeight:800}}>{equipment[e.id]?"✓":""}</div><span style={{fontSize:10,color:equipment[e.id]?"#ccc":C.muted,fontWeight:600}}>{e.icon} {e.label}</span></button>)}</div></div>)}<div style={{color:"#444",fontSize:10}}>{Object.values(equipment).filter(Boolean).length}/{EQUIPMENT_LIST.length} activos</div></Sec>
      <Sec title="EJERCICIOS"><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:"#888",fontSize:11}}>Máx. ejercicios</span><strong style={{color:C.accent}}>{maxEx}</strong></div><input type="range" min={2} max={8} value={maxEx} onChange={e=>setMaxEx(+e.target.value)} style={{width:"100%",accentColor:C.accent,marginBottom:12}}/><div style={{display:"flex",gap:7,marginBottom:useCustomEx?12:0}}>{[{v:false,l:"🎲 Auto"},{v:true,l:"✋ Elijo yo"}].map(o=><button key={o.l} onClick={()=>setUseCustomEx(o.v)} style={{flex:1,padding:"9px 0",background:useCustomEx===o.v?"#FF6B3520":C.card,border:`1px solid ${useCustomEx===o.v?C.accent:C.border}`,borderRadius:8,color:useCustomEx===o.v?C.accent:"#666",fontWeight:700,fontSize:11,cursor:"pointer"}}>{o.l}</button>)}</div>{useCustomEx&&<div style={{maxHeight:220,overflowY:"auto",border:`1px solid ${C.border}`,borderRadius:8,padding:9}}>{avail.map(e=><button key={e.id} onClick={()=>setUserEx(p=>p.includes(e.id)?p.filter(x=>x!==e.id):[...p,e.id])} style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"7px 9px",marginBottom:3,background:userEx.includes(e.id)?"#FF6B3518":"#0a0a14",border:`1px solid ${userEx.includes(e.id)?C.accent:"#1e1e30"}`,borderRadius:5,cursor:"pointer",textAlign:"left"}}><div style={{width:12,height:12,borderRadius:2,flexShrink:0,background:userEx.includes(e.id)?C.accent:"#1e1e30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#000",fontWeight:800}}>{userEx.includes(e.id)?"✓":""}</div><span style={{fontSize:11,color:userEx.includes(e.id)?C.accent:"#888"}}>{e.name}</span><span style={{color:"#444",fontSize:9,marginLeft:"auto"}}>{e.skill.toUpperCase()}</span></button>)}</div>}</Sec>
      <button onClick={()=>onGenerate({format,energy,duration,level,equipment,maxExercises:maxEx,userExercises:userEx,useCustomExercises:useCustomEx})} style={{width:"100%",padding:"15px 0",background:"linear-gradient(90deg,#FF6B35,#FF2D55)",border:"none",borderRadius:12,fontFamily:"'Bebas Neue',cursive",fontSize:20,color:"#000",letterSpacing:3,cursor:"pointer",boxShadow:"0 4px 20px #FF6B3540"}}>⚡ GENERAR WOD</button>
    </div>
  );
}

function MetricsView({history}) {
  if (!history.length) return <Placeholder icon="📊" text="Registra tu primer WOD para ver métricas"/>;
  const suggested=suggestNext(history);
  const ec=Object.fromEntries(Object.keys(ENERGY).map(k=>[k,0]));
  let rpeSum=0;
  history.forEach(h=>{ if(ec[h.wod?.energyKey]!==undefined) ec[h.wod.energyKey]++; if(h.rpe) rpeSum+=h.rpe; });
  const maxE=Math.max(...Object.values(ec),1);
  return <div><Title>TUS MÉTRICAS</Title><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:20}}>{[{l:"WODs",v:history.length},{l:"RPE Medio",v:(rpeSum/history.length).toFixed(1)},{l:"Semanas",v:Math.ceil(history.length/4)}].map(s=><div key={s.l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 10px",textAlign:"center"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:C.accent,lineHeight:1}}>{s.v}</div><div style={{color:C.muted,fontSize:9,letterSpacing:1,marginTop:3}}>{s.l}</div></div>)}</div>{suggested&&<div style={{background:ENERGY[suggested].color+"15",border:`1px solid ${ENERGY[suggested].color}40`,borderRadius:10,padding:"12px 14px",marginBottom:20}}><div style={{color:ENERGY[suggested].color,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:3}}>💡 PRÓXIMO ENTRENO</div><div style={{color:"#fff",fontWeight:700,fontSize:14}}>Trabaja {ENERGY[suggested].label}</div><div style={{color:"#666",fontSize:11,marginTop:2}}>{ENERGY[suggested].desc}</div></div>}<div style={{color:C.muted,fontSize:10,letterSpacing:2,marginBottom:10}}>SISTEMAS ENERGÉTICOS</div>{Object.entries(ec).map(([k,v])=>{ const en=ENERGY[k]; return <div key={k} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{color:"#ccc",fontSize:11}}>{en.label}</span><span style={{color:en.color,fontWeight:700,fontSize:11}}>{v}</span></div><div style={{background:"#1a1a2e",borderRadius:3,height:5}}><div style={{background:en.color,width:`${(v/maxE)*100}%`,height:"100%",borderRadius:3}}/></div></div>; })}<div style={{color:C.muted,fontSize:10,letterSpacing:2,margin:"16px 0 10px"}}>ÚLTIMOS WODs</div>{[...history].slice(0,8).map((h,i)=><div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 12px",marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:"#fff",fontWeight:600,fontSize:12}}>{h.wod?.templateLabel||h.wod?.type}</div><div style={{color:"#444",fontSize:10,marginTop:1}}>{new Date(h.date).toLocaleDateString("es-ES")}</div></div><div style={{textAlign:"right"}}>{h.result&&<div style={{color:C.accent,fontWeight:800,fontSize:13}}>{h.result}</div>}{h.rpe&&<div style={{color:C.muted,fontSize:10}}>RPE {h.rpe}/10</div>}</div></div>)}</div>;
}

function CustomWODView({onLoad,customWODs,onSaveCustom,loading}) {
  const [name,setName]=useState(""),[type,setType]=useState("AMRAP"),[ek,setEk]=useState("aero_cap"),[desc,setDesc]=useState(""),[saving,setSaving]=useState(false);
  const inp={width:"100%",padding:"9px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:"#fff",fontSize:13,boxSizing:"border-box",marginBottom:10};
  return <div><Title>MI WOD PROPIO</Title><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:20}}><input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre del WOD" style={inp}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}><select value={type} onChange={e=>setType(e.target.value)} style={{...inp,marginBottom:0,appearance:"none"}}>{["AMRAP","EMOM","For Time","Chipper","Hero WOD","Ladder"].map(f=><option key={f}>{f}</option>)}</select><select value={ek} onChange={e=>setEk(e.target.value)} style={{...inp,marginBottom:0,appearance:"none"}}>{Object.entries(ENERGY).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={8} placeholder={"Describe tu WOD:\n\nEj:\nEMOM 20 min\nMin 1: 10 Pull-ups\nMin 2: 15 Wall Balls\n..."} style={{...inp,resize:"vertical",fontFamily:"monospace",fontSize:11}}/><button onClick={async()=>{ if(!name||!desc) return; setSaving(true); await onSaveCustom({type,templateLabel:name,ref:"WOD Personal",energyKey:ek,energyLabel:ENERGY[ek]?.label,energyColor:ENERGY[ek]?.color,totalTime:"—",scoring:"Registro personal",blocks:[{kind:"Custom",content:desc}],generatedAt:new Date().toISOString()}); setName("");setDesc("");setSaving(false); }} style={{width:"100%",padding:"12px 0",background:"linear-gradient(90deg,#FF6B35,#FF2D55)",border:"none",borderRadius:8,fontFamily:"'Bebas Neue',cursive",fontSize:16,color:"#000",letterSpacing:2,cursor:"pointer",opacity:saving?0.7:1}}>{saving?"GUARDANDO…":"GUARDAR MI WOD"}</button></div>{loading?<Spinner/>:customWODs.length>0&&<><div style={{color:C.muted,fontSize:10,letterSpacing:2,marginBottom:10}}>GUARDADOS ({customWODs.length})</div>{[...customWODs].map((w,i)=><div key={i} onClick={()=>onLoad(w.wod)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 14px",marginBottom:7,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><Tag color={ENERGY[w.wod?.energyKey]?.color||"#888"}>{w.wod?.type}</Tag><div style={{color:"#fff",fontWeight:700,fontSize:13,marginTop:5}}>{w.wod?.templateLabel}</div></div><span style={{color:C.accent,fontSize:11,fontWeight:700}}>→</span></div>)}</>}</div>;
}

function HistoryView({history,loading}) {
  if (loading) return <Spinner/>;
  if (!history.length) return <Placeholder icon="📋" text="Sin registros aún"/>;
  return <div><Title>HISTORIAL</Title>{history.map((h,i)=>{ const color=ENERGY[h.wod?.energyKey]?.color||"#888"; return <div key={i} style={{background:C.card,border:`1px solid ${color}25`,borderRadius:11,padding:"12px 14px",marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div><Tag color={color}>{h.wod?.type}</Tag><div style={{color:"#fff",fontWeight:700,fontSize:13,marginTop:5}}>{h.wod?.templateLabel}</div><div style={{color:"#444",fontSize:10,marginTop:1}}>{new Date(h.date).toLocaleDateString("es-ES")} · {h.wod?.energyLabel}</div></div><div style={{textAlign:"right"}}>{h.result&&<div style={{color:C.accent,fontWeight:900,fontSize:15,fontFamily:"'Bebas Neue',cursive"}}>{h.result}</div>}{h.rpe&&<div style={{color:C.muted,fontSize:10}}>RPE {h.rpe}/10</div>}</div></div>{h.notes&&<div style={{color:C.muted,fontSize:11,fontStyle:"italic",borderTop:`1px solid ${C.border}`,paddingTop:7}}>"{h.notes}"</div>}</div>; })}</div>;
}

export default function App() {
  const [session,setSession]=useState(null);
  const [tab,setTab]=useState("generate"),[wod,setWod]=useState(null),[lastCfg,setLastCfg]=useState(null);
  const [showLog,setShowLog]=useState(false);
  const [history,setHistory]=useState([]),[customWODs,setCustomWODs]=useState([]);
  const [loadingHistory,setLoadingHistory]=useState(false),[loadingCustom,setLoadingCustom]=useState(false);
  const ref=useRef(null);

  const loadHistory=async(token)=>{
    setLoadingHistory(true);
    try { const d=await sb.select(token,"wod_history","select=*"); setHistory(Array.isArray(d)?d.map(r=>({...r.wod||{},result:r.result,rpe:r.rpe,notes:r.notes,date:r.date,_id:r.id,wod:r.wod})):[]); } catch(e){}
    setLoadingHistory(false);
  };
  const loadCustom=async(token)=>{
    setLoadingCustom(true);
    try { const d=await sb.select(token,"custom_wods","select=*"); setCustomWODs(Array.isArray(d)?d:[]); } catch(e){}
    setLoadingCustom(false);
  };

  const handleAuth=async(res)=>{
    const token=res.access_token;
    setSession({token,user:res.user||{}});
    await Promise.all([loadHistory(token),loadCustom(token)]);
  };

  const handleLogout=async()=>{ if(session?.token) await sb.signOut(session.token); setSession(null);setHistory([]);setCustomWODs([]);setTab("generate");setWod(null); };

  const saveEntry=async(entry)=>{
    const row={user_id:session.user.id,wod:entry.wod,result:entry.result,rpe:entry.rpe,notes:entry.notes,date:entry.date};
    await sb.insert(session.token,"wod_history",row);
    await loadHistory(session.token);
    setTab("metrics");
  };

  const saveCustom=async(wodData)=>{
    await sb.insert(session.token,"custom_wods",{user_id:session.user.id,wod:wodData});
    await loadCustom(session.token);
  };

  const suggested=suggestNext(history);
  const tabs=[{id:"generate",icon:"⚡",label:"Generar"},{id:"wod",icon:"💪",label:"WOD"},{id:"custom",icon:"✍️",label:"Mi WOD"},{id:"metrics",icon:"📊",label:"Métricas"},{id:"history",icon:"📋",label:"Historial"}];

  if (!session) return <AuthScreen onAuth={handleAuth}/>;

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans',sans-serif",color:"#fff",display:"flex",flexDirection:"column"}}>
      <style>{`@import url('${FONT_LINK}');*{box-sizing:border-box;margin:0;padding:0;}input,select,textarea,button{font-family:'DM Sans',sans-serif;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#2a2a3e;border-radius:2px;}input[type=range]{-webkit-appearance:none;height:3px;border-radius:2px;background:#2a2a3e;outline:none;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:#FF6B35;cursor:pointer;}select option{background:#0d0d1a;}`}</style>
      <div style={{background:"#0a0a14",borderBottom:`1px solid ${C.border}`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,background:"linear-gradient(135deg,#FF6B35,#FF2D55)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🔥</div>
          <div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:19,letterSpacing:3,lineHeight:1}}>WOD FORGE</div><div style={{color:C.dim,fontSize:8,letterSpacing:3}}>{session.user.email?.split("@")[0]?.toUpperCase()}</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {suggested&&<div style={{textAlign:"right"}}><div style={{color:C.dim,fontSize:8,letterSpacing:2}}>HOY</div><div style={{color:ENERGY[suggested]?.color,fontSize:10,fontWeight:700}}>{ENERGY[suggested]?.label}</div></div>}
          <button onClick={handleLogout} style={{padding:"5px 10px",background:"#13131f",border:`1px solid ${C.border}`,borderRadius:6,color:C.muted,fontSize:10,cursor:"pointer"}}>salir</button>
        </div>
      </div>
      <div ref={ref} style={{flex:1,overflowY:"auto",padding:"18px 14px 90px",maxWidth:600,margin:"0 auto",width:"100%"}}>
        {tab==="generate"&&<div><div style={{marginBottom:24}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:32,letterSpacing:3,lineHeight:1.05,marginBottom:5}}>GENERA TU<br/><span style={{color:C.accent}}>PRÓXIMO WOD</span></div><div style={{color:"#444",fontSize:12}}>Open · Semifinals · CrossFit Games · Rogue</div></div><GeneratorWizard onGenerate={cfg=>{setLastCfg(cfg);setWod(generateWOD(cfg));setTab("wod");ref.current?.scrollTo({top:0,behavior:"smooth"});}}/></div>}
        {tab==="wod"&&!wod&&<Placeholder icon="⚡" text="Genera un WOD primero"/>}
        {tab==="wod"&&wod&&<div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:3,marginBottom:14}}>TU <span style={{color:C.accent}}>WOD</span></div><WODDisplay wod={wod} onLog={()=>setShowLog(true)} onDiscard={()=>{setWod(null);setTab("generate");}} onRegenerate={()=>lastCfg&&setWod(generateWOD(lastCfg))}/></div>}
        {tab==="custom"&&<CustomWODView onLoad={w=>{setWod(w);setTab("wod");}} customWODs={customWODs} onSaveCustom={saveCustom} loading={loadingCustom}/>}
        {tab==="metrics"&&<MetricsView history={history}/>}
        {tab==="history"&&<HistoryView history={history} loading={loadingHistory}/>}
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a0a14",borderTop:`1px solid ${C.border}`,display:"flex",zIndex:100}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"9px 0 13px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderTop:`2px solid ${tab===t.id?C.accent:"transparent"}`}}><span style={{fontSize:17}}>{t.icon}</span><span style={{fontSize:8,fontWeight:700,letterSpacing:1,color:tab===t.id?C.accent:"#444"}}>{t.label.toUpperCase()}</span>{t.id==="wod"&&wod&&<div style={{position:"absolute",top:6,width:6,height:6,background:"#FF2D55",borderRadius:"50%"}}/>}</button>)}
      </div>
      {showLog&&wod&&<LogModal wod={wod} onSave={saveEntry} onClose={()=>setShowLog(false)}/>}
    </div>
  );
}
