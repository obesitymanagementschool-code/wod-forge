import { useState, useRef, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://mrmmkjhoinnkbdwfeqeq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybW1ramhvaW5ua2Jkd2ZlcWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzc4NzksImV4cCI6MjA4ODc1Mzg3OX0.KUiS6MG7n6hGYwnu1CxFDX1VS73ymBkRUIADz2Kyr_g";

const sb = {
  h(t) { return { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${t || SUPABASE_KEY}`, "Content-Type": "application/json" }; },
  async signIn(e, p) { const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: this.h(), body: JSON.stringify({ email: e, password: p }) }); return r.json(); },
  async signUp(e, p) { const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method: "POST", headers: this.h(), body: JSON.stringify({ email: e, password: p }) }); return r.json(); },
  async signOut(t) { await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: "POST", headers: this.h(t) }); },
  async select(t, table, filter = "") { const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}&order=created_at.desc`, { headers: this.h(t) }); return r.json(); },
  async insert(t, table, data) { const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: { ...this.h(t), "Prefer": "return=representation" }, body: JSON.stringify(data) }); return r.json(); },
  async delete(t, table, id) { await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: "DELETE", headers: this.h(t) }); },
};

const FONT = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";
const C = { bg: "#07070f", card: "#0d0d1a", border: "#1e1e30", text: "#e8e8f4", muted: "#555", dim: "#333", flamingo: "#FF6FA8" };
const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const BENCHMARK_METRICS = [
  { id: "time",     label: "Tiempo",          icon: "⏱", unit: "mm:ss" },
  { id: "reps",     label: "Reps totales",     icon: "🔢", unit: "reps" },
  { id: "weight",   label: "Kilos",            icon: "🏋️", unit: "kg" },
  { id: "calories", label: "Calorías",         icon: "🔥", unit: "cal" },
  { id: "meters",   label: "Metros",           icon: "📏", unit: "m" },
];

const EQUIPMENT_LIST = [
  { id: "barbell",       label: "Barra olímpica",        icon: "🏋️", group: "Barras" },
  { id: "bumper_plates", label: "Discos bumper",          icon: "⚫", group: "Barras" },
  { id: "dumbbell",      label: "Mancuernas",             icon: "💪", group: "Barras" },
  { id: "kettlebell",    label: "Kettlebell",             icon: "🫙", group: "Barras" },
  { id: "pullup_bar",    label: "Barra dominadas",        icon: "🔝", group: "Gimnasia" },
  { id: "rings",         label: "Anillas",                icon: "⭕", group: "Gimnasia" },
  { id: "box",           label: "Cajón / Box",            icon: "📦", group: "Gimnasia" },
  { id: "wall",          label: "Pared (HSPU/Wall Ball)", icon: "🧱", group: "Gimnasia" },
  { id: "rope",          label: "Cuerda de trepar",       icon: "🪢", group: "Gimnasia" },
  { id: "ghd",           label: "GHD",                    icon: "🔄", group: "Gimnasia" },
  { id: "row_erg",       label: "Row Erg",                icon: "🚣", group: "Máquinas" },
  { id: "ski_erg",       label: "Ski Erg",                icon: "⛷️", group: "Máquinas" },
  { id: "echo_bike",     label: "Echo Bike",              icon: "🚵", group: "Máquinas" },
  { id: "bike_erg",      label: "Bike Erg",               icon: "🚲", group: "Máquinas" },
  { id: "wallball",      label: "Wall Ball",              icon: "🟤", group: "Accesorios" },
  { id: "jump_rope",     label: "Cuerda de saltar",       icon: "⟳",  group: "Accesorios" },
  { id: "sled",          label: "Trineo (Sled)",          icon: "🛷", group: "Accesorios" },
  { id: "running_track", label: "Pista exterior",         icon: "🏁", group: "Exterior" },
];

const EXERCISES = [
  { id: "pullup",        name: "Pull-ups",            req: ["pullup_bar"],       cat: "gym", unit: "reps", skill: "low",  cycleTime: 3,    minInterval: 30 },
  { id: "ctb_pullup",    name: "Chest-to-Bar",        req: ["pullup_bar"],       cat: "gym", unit: "reps", skill: "mid",  cycleTime: 4,    minInterval: 30 },
  { id: "muscle_up_bar", name: "Bar Muscle-ups",      req: ["pullup_bar"],       cat: "gym", unit: "reps", skill: "high", cycleTime: 6,    minInterval: 40 },
  { id: "toes_bar",      name: "Toes-to-Bar",         req: ["pullup_bar"],       cat: "gym", unit: "reps", skill: "mid",  cycleTime: 3,    minInterval: 25 },
  { id: "knee_raise",    name: "Hanging Knee Raises", req: ["pullup_bar"],       cat: "gym", unit: "reps", skill: "low",  cycleTime: 2.5,  minInterval: 20 },
  { id: "hspu",          name: "HSPU",                req: ["wall"],             cat: "gym", unit: "reps", skill: "high", cycleTime: 5,    minInterval: 30 },
  { id: "box_jump",      name: "Box Jumps",           req: ["box"],              cat: "gym", unit: "reps", skill: "low",  cycleTime: 3,    minInterval: 20 },
  { id: "burpee",        name: "Burpees",             req: [],                   cat: "gym", unit: "reps", skill: "low",  cycleTime: 5,    minInterval: 20 },
  { id: "burpee_box",    name: "Burpee Box Jump-Over",req: ["box"],              cat: "gym", unit: "reps", skill: "low",  cycleTime: 7,    minInterval: 25 },
  { id: "double_under",  name: "Double Unders",       req: ["jump_rope"],        cat: "gym", unit: "reps", skill: "mid",  cycleTime: 0.4,  minInterval: 15 },
  { id: "single_under",  name: "Single Unders",       req: ["jump_rope"],        cat: "gym", unit: "reps", skill: "low",  cycleTime: 0.2,  minInterval: 10 },
  { id: "rope_climb",    name: "Rope Climbs",         req: ["rope"],             cat: "gym", unit: "reps", skill: "mid",  cycleTime: 25,   minInterval: 50 },
  { id: "ring_dip",      name: "Ring Dips",           req: ["rings"],            cat: "gym", unit: "reps", skill: "mid",  cycleTime: 3.5,  minInterval: 25 },
  { id: "pistol",        name: "Pistol Squats",       req: [],                   cat: "gym", unit: "reps", skill: "mid",  cycleTime: 4,    minInterval: 25 },
  { id: "pushup",        name: "Push-ups",            req: [],                   cat: "gym", unit: "reps", skill: "low",  cycleTime: 2.5,  minInterval: 15 },
  { id: "thruster",      name: "Thrusters",           req: ["barbell"],          cat: "wl",  unit: "reps", skill: "low",  cycleTime: 4,    minInterval: 20, rxM: 43,  rxW: 29 },
  { id: "clean",         name: "Power Clean",         req: ["barbell"],          cat: "wl",  unit: "reps", skill: "low",  cycleTime: 5,    minInterval: 25, rxM: 61,  rxW: 43 },
  { id: "squat_clean",   name: "Squat Clean",         req: ["barbell"],          cat: "wl",  unit: "reps", skill: "mid",  cycleTime: 6,    minInterval: 30, rxM: 70,  rxW: 47 },
  { id: "clean_jerk",    name: "Clean and Jerk",      req: ["barbell"],          cat: "wl",  unit: "reps", skill: "mid",  cycleTime: 8,    minInterval: 35, rxM: 70,  rxW: 47 },
  { id: "snatch",        name: "Squat Snatch",        req: ["barbell"],          cat: "wl",  unit: "reps", skill: "high", cycleTime: 9,    minInterval: 40, rxM: 52,  rxW: 34 },
  { id: "deadlift",      name: "Deadlift",            req: ["barbell"],          cat: "wl",  unit: "reps", skill: "low",  cycleTime: 4,    minInterval: 20, rxM: 102, rxW: 70 },
  { id: "push_press",    name: "Push Press",          req: ["barbell"],          cat: "wl",  unit: "reps", skill: "low",  cycleTime: 3.5,  minInterval: 20, rxM: 52,  rxW: 34 },
  { id: "kb_swing",      name: "KB Swing American",   req: ["kettlebell"],       cat: "wl",  unit: "reps", skill: "low",  cycleTime: 2.5,  minInterval: 15, rxM: 32,  rxW: 24 },
  { id: "wall_ball",     name: "Wall Balls",          req: ["wallball", "wall"], cat: "wl",  unit: "reps", skill: "low",  cycleTime: 3,    minInterval: 15, rxM: 9,   rxW: 6  },
  { id: "db_snatch",     name: "DB Snatch",           req: ["dumbbell"],         cat: "wl",  unit: "reps", skill: "low",  cycleTime: 4,    minInterval: 20, rxM: 35,  rxW: 22 },
  { id: "row_cal",       name: "Row (Cal)",           req: ["row_erg"],          cat: "machine", unit: "cal", skill: "low", cycleTime: 4,  minInterval: 25 },
  { id: "echo_cal",      name: "Echo Bike (Cal)",     req: ["echo_bike"],        cat: "machine", unit: "cal", skill: "low", cycleTime: 3.5,minInterval: 25 },
  { id: "ski_cal",       name: "Ski Erg (Cal)",       req: ["ski_erg"],          cat: "machine", unit: "cal", skill: "low", cycleTime: 4.5,minInterval: 25 },
  { id: "run_200",       name: "Run 200m",            req: ["running_track"],    cat: "run", unit: "m",    skill: "low",  cycleTime: 0.22, minInterval: 45,  fixed: 200 },
  { id: "run_400",       name: "Run 400m",            req: ["running_track"],    cat: "run", unit: "m",    skill: "low",  cycleTime: 0.225,minInterval: 90,  fixed: 400 },
  { id: "run_800",       name: "Run 800m",            req: ["running_track"],    cat: "run", unit: "m",    skill: "low",  cycleTime: 0.27, minInterval: 216, fixed: 800 },
];

const CYCLE_MULT = { beginner: 1.9, scaled: 1.45, intermediate: 1.2, rx: 1.0 };
const SKILL_ALLOWED = { beginner: ["low"], scaled: ["low","mid"], intermediate: ["low","mid","high"], rx: ["low","mid","high"] };
const CTX = { emom_1min: { workSec: 42 }, emom_2min: { workSec: 90 }, amrap: { workSec: 75 }, fortime: { workSec: 60 }, chipper: { workSec: 45 } };

function calcReps(ex, lvl, ctx) {
  if (!ex) return 0; if (ex.fixed) return ex.fixed;
  const mult = CYCLE_MULT[lvl] || 1.2, { workSec } = CTX[ctx] || CTX.amrap;
  const raw = Math.floor((workSec * 0.88) / (ex.cycleTime * mult));
  const CAPS = { gym: [1,35], wl: [1,25], machine: [3,50], run: [1,1] };
  const [mn, mx] = CAPS[ex.cat] || [1,30];
  return Math.max(mn, Math.min(mx, raw));
}
function filterCtx(pool, lvl, ctx) {
  const allowed = SKILL_ALLOWED[lvl] || ["low"], mult = CYCLE_MULT[lvl] || 1.2, { workSec } = CTX[ctx] || CTX.amrap;
  return pool.filter(ex => { if (!allowed.includes(ex.skill)) return false; if (ex.fixed) return ex.fixed * ex.cycleTime * mult <= workSec * 1.1; return ex.cycleTime * mult <= workSec * 0.95; });
}
function safePool(pool, lvl, ctx, min = 2) {
  const f = filterCtx(pool, lvl, ctx); if (f.length >= min) return f;
  return pool.filter(e => SKILL_ALLOWED[lvl || "rx"].includes(e.skill));
}
function flexDur(max) {
  const min = Math.round(max * 0.75), opts = [];
  for (let d = min; d <= max; d++) opts.push(d);
  return opts[Math.floor(Math.random() * opts.length)];
}

const TEMPLATES = {
  amrap: { format: "AMRAP", primaryCtx: "amrap", label: "AMRAP Clasico", ref: "Open 11.1", build({ dur, exs, lvl }) { const d = flexDur(dur), p = safePool(exs, lvl, "amrap"); return { type: "AMRAP", totalTime: d, blocks: [{ kind: "AMRAP", minutes: d, movements: p.slice(0,3).map(e => ({ ex: e, reps: calcReps(e, lvl, "amrap") })) }], scoring: `AMRAP ${d} min` }; } },
  emom2: { format: "EMOM", primaryCtx: "emom_1min", label: "EMOM Alternado", ref: "Open 12.5", build({ dur, exs, lvl }) { const d = flexDur(dur), p = safePool(exs, lvl, "emom_1min"), r = Math.floor(d / 2); return { type: "EMOM", totalTime: r * 2, blocks: [{ kind: "EMOM", minutes: r * 2, scheme: p.slice(0,2).map((e,i) => ({ minute: i === 0 ? "Min impares" : "Min pares", ex: e, reps: calcReps(e, lvl, "emom_1min") })), note: `${r} rondas` }], scoring: `EMOM ${r*2} min` }; } },
  emom3: { format: "EMOM", primaryCtx: "emom_1min", label: "EMOM 3 Movimientos", ref: "Semifinals 2022", build({ dur, exs, lvl }) { const d = flexDur(dur), p = safePool(exs, lvl, "emom_1min"), r = Math.floor(d / 3); return { type: "EMOM", totalTime: r * 3, blocks: [{ kind: "EMOM", minutes: r * 3, scheme: p.slice(0,3).map((e,i) => ({ minute: `Min ${i+1},${i+4}...`, ex: e, reps: calcReps(e, lvl, "emom_1min") })), note: `Ciclo 3 min. ${r} rondas.` }], scoring: `EMOM ${r*3} min` }; } },
  fortime: { format: "For Time", primaryCtx: "fortime", label: "For Time - Rondas", ref: "Open 14.5", build({ dur, exs, lvl }) { const d = flexDur(dur), r = [3,4,5][Math.floor(Math.random()*3)], p = safePool(exs, lvl, "fortime"); return { type: "For Time", totalTime: d, timeCap: d, blocks: [{ kind: "ForTime", rounds: r, movements: p.slice(0,3).map(e => ({ ex: e, reps: calcReps(e, lvl, "fortime") })), note: `Cap: ${d} min` }], scoring: `${r} RFT` }; } },
  chipper: { format: "For Time", primaryCtx: "chipper", label: "Chipper", ref: "Games 2016", build({ dur, exs, lvl }) { const d = flexDur(dur), p = safePool(exs, lvl, "chipper"); return { type: "For Time", totalTime: d, timeCap: d, blocks: [{ kind: "ForTime", rounds: 1, movements: p.slice(0, Math.min(6, p.length)).map(e => ({ ex: e, reps: calcReps(e, lvl, "chipper") })), note: `Cap: ${d} min` }], scoring: "Chipper For Time" }; } },
  fran: { format: "For Time", primaryCtx: "fortime", label: "21-15-9", ref: "Fran / Diane", build({ dur, exs, lvl }) { const d = flexDur(dur), p = safePool(exs, lvl, "fortime"); return { type: "For Time", totalTime: d, timeCap: d, blocks: [{ kind: "ForTime", rounds: 1, descending: [21,15,9], movements: p.slice(0,2).map(e => ({ ex: e, reps: null })), note: `Cap: ${d} min` }], scoring: "21-15-9 For Time" }; } },
  hero: { format: "Hero WOD", primaryCtx: "fortime", label: "Hero WOD", ref: "Murph / DT", build({ dur, exs, lvl }) { const d = flexDur(dur), p = safePool(exs, lvl, "fortime"); return { type: "Hero WOD", totalTime: d, timeCap: d, blocks: [{ kind: "ForTime", rounds: 5, movements: p.slice(0,4).map(e => ({ ex: e, reps: calcReps(e, lvl, "fortime") })), note: `5 RFT. Cap: ${d} min` }], scoring: "Hero WOD 5 RFT" }; } },
};

function generateWOD({ format, duration, level, equipment, maxExercises }) {
  const equipOk = e => e.req.length === 0 || e.req.every(r => equipment[r]);
  const pool = EXERCISES.filter(equipOk);
  const cands = Object.values(TEMPLATES).filter(t => format === "Aleatorio" || t.format === format);
  const tmpl = cands.length > 0 ? cands[Math.floor(Math.random() * cands.length)] : Object.values(TEMPLATES)[0];
  const filtered = safePool(pool, level, tmpl.primaryCtx || "amrap");
  const chosen = [...filtered].sort(() => Math.random() - 0.5).slice(0, Math.max(2, Math.min(maxExercises || 5, filtered.length)));
  const wod = tmpl.build({ dur: duration, exs: chosen, lvl: level });
  return { ...wod, templateLabel: tmpl.label, ref: tmpl.ref, energyColor: C.flamingo, id: Date.now().toString(), generatedAt: new Date().toISOString(), level };
}

// ─── LOAD CALCULATIONS ───────────────────────────────────────
function calcLoadStats(history) {
  const now = new Date();
  const dayMs = 86400000;
  const getDate = h => new Date(h.date || h.created_at);

  const last28 = history.filter(h => (now - getDate(h)) <= 28 * dayMs);
  const last7  = history.filter(h => (now - getDate(h)) <= 7 * dayMs);

  const acuteLoad  = last7.reduce((s, h)  => s + (h.carga_sesion || 0), 0);
  const chronicLoad = last28.reduce((s, h) => s + (h.carga_sesion || 0), 0) / 4;
  const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : 0;

  // Weekly loads for chart (last 4 weeks, oldest first)
  const weeks = [3, 2, 1, 0].map(w => {
    const start = new Date(now); start.setDate(start.getDate() - (w + 1) * 7);
    const end   = new Date(now); end.setDate(end.getDate() - w * 7);
    const load  = history.filter(h => { const d = getDate(h); return d >= start && d < end; }).reduce((s, h) => s + (h.carga_sesion || 0), 0);
    return { label: `S-${3-w}`, load };
  });

  // Days trained this week
  const daysThisWeek = new Set(last7.map(h => fmtDate(getDate(h)))).size;
  // Total time trained (mins)
  const totalMins = history.reduce((s, h) => s + (h.duracion_min || 0), 0);
  // Average sRPE
  const withRpe = history.filter(h => h.rpe);
  const avgRpe = withRpe.length > 0 ? (withRpe.reduce((s, h) => s + h.rpe, 0) / withRpe.length).toFixed(1) : 0;

  return { acuteLoad: Math.round(acuteLoad), chronicLoad: Math.round(chronicLoad), acwr: acwr.toFixed(2), weeks, daysThisWeek, totalMins, avgRpe };
}

function getWeekDays(offset = 0) {
  const now = new Date(); now.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(now.getDate() + i); return d; });
}
function fmtDate(d) { return new Date(d).toISOString().split("T")[0]; }
function isToday(d) { return fmtDate(d) === fmtDate(new Date()); }
function fmtTime(s) { const m = Math.floor(Math.abs(s) / 60), sec = Math.abs(s) % 60; return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; }

// ─── SMALL UI ────────────────────────────────────────────────
function Tag({ color, children }) {
  return <span style={{ background: color+"22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>{children}</span>;
}
function Title({ children }) {
  return <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 26, color: "#fff", letterSpacing: 3, marginBottom: 18 }}>{children}</div>;
}
function Placeholder({ icon, text }) {
  return <div style={{ textAlign: "center", padding: "40px 20px", color: C.dim }}><div style={{ fontSize: 40, marginBottom: 8 }}>{icon}</div><div style={{ fontSize: 13 }}>{text}</div></div>;
}
function Spinner() {
  return <div style={{ textAlign: "center", padding: 40 }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{ width: 28, height: 28, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.flamingo}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} /></div>;
}
function Pill({ active, onClick, color, children, wide }) {
  return <button onClick={onClick} style={{ padding: "8px 6px", width: wide ? "100%" : undefined, background: active ? color+"25" : C.card, border: `1px solid ${active ? color : C.border}`, borderRadius: 7, color: active ? color : "#666", fontWeight: 700, fontSize: 10, cursor: "pointer" }}>{children}</button>;
}

// ─── BLOCKS ──────────────────────────────────────────────────
function MovRow({ m }) {
  const { ex, reps } = m;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.bg}` }}>
      {reps != null && <span style={{ color: C.flamingo, fontWeight: 900, fontSize: 16, fontFamily: "'Bebas Neue',cursive", minWidth: 34 }}>{reps}{ex?.unit === "m" ? " m" : ex?.unit === "cal" ? " cal" : ""}</span>}
      <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{ex?.name || "—"}</span>
      {ex?.rxM && <span style={{ color: "#444", fontSize: 10, marginLeft: "auto" }}>{ex.rxM}kg H / {ex.rxW}kg M</span>}
    </div>
  );
}

function BlockCard({ block, color }) {
  if (block.kind === "REST") return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: C.muted, whiteSpace: "nowrap" }}>{block.minutes ? `${block.minutes} MIN DESCANSO` : "DESCANSO"}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
  if (block.kind === "EMOM") return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color, fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>EMOM</span>
        <span style={{ color: "#ccc", fontSize: 13, fontWeight: 800, fontFamily: "'Bebas Neue',cursive" }}>{block.minutes} MIN</span>
      </div>
      {block.scheme?.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, padding: "6px 8px", background: C.bg, borderRadius: 6 }}>
          <div style={{ color, fontSize: 9, fontWeight: 800, minWidth: 110, letterSpacing: 1 }}>{s.minute}:</div>
          <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{s.reps ? `${s.reps} ` : ""}{s.ex?.name || "—"}</div></div>
        </div>
      ))}
      {block.note && <div style={{ color: C.muted, fontSize: 10, borderTop: `1px solid ${C.border}`, paddingTop: 5, marginTop: 3 }}>{block.note}</div>}
    </div>
  );
  if (block.kind === "Custom") return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 7 }}>
      <div style={{ color, fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>WOD PERSONALIZADO</div>
      <div style={{ color: "#ccc", fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-line", lineHeight: 1.7 }}>{block.content}</div>
    </div>
  );
  const isAMRAP = block.kind === "AMRAP", isDesc = !!block.descending;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ color, fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>{isAMRAP ? "AMRAP" : block.kind === "ForTime" ? "FOR TIME" : block.kind}</span>
        {isAMRAP && <span style={{ color: "#fff", fontSize: 20, fontWeight: 900, fontFamily: "'Bebas Neue',cursive" }}>{block.minutes} MIN</span>}
        {!isAMRAP && block.rounds && !isDesc && <span style={{ color: "#ccc", fontSize: 12, fontWeight: 700 }}>{block.rounds} Rounds</span>}
        {block.timeCap && <span style={{ color: "#FF2D55", fontSize: 10, fontWeight: 700 }}>Cap {block.timeCap}m</span>}
      </div>
      {isDesc && <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>{block.descending.map(r => <div key={r} style={{ background: C.bg, borderRadius: 5, padding: "4px 10px", color, fontWeight: 900, fontSize: 18, fontFamily: "'Bebas Neue',cursive" }}>{r}</div>)}</div>}
      {block.movements?.map((m, i) => <MovRow key={i} m={m} />)}
      {block.note && <div style={{ color: C.muted, fontSize: 10, borderTop: `1px solid ${C.border}`, paddingTop: 5, marginTop: 5 }}>{block.note}</div>}
    </div>
  );
}

// ─── TIMER ───────────────────────────────────────────────────
function getTimerCfg(wod) {
  const totalSecs = (typeof wod?.totalTime === "number" ? wod.totalTime : 20) * 60;
  if (wod?.type === "EMOM") { const scheme = wod.blocks?.find(b => b.kind === "EMOM")?.scheme || []; return { mode: "emom", totalSecs, blocks: scheme.map(s => s.minute || "—") }; }
  if (wod?.type === "AMRAP") return { mode: "countdown", totalSecs };
  if (wod?.type === "For Time" || wod?.type === "Hero WOD") return { mode: "countdown", totalSecs };
  return { mode: "countup", totalSecs };
}

function TimerScreen({ wod, onFinish, onCancel }) {
  const cfg = getTimerCfg(wod);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const iRef = useRef(null);
  const color = wod?.energyColor || C.flamingo;

  useEffect(() => {
    if (running) { iRef.current = setInterval(() => setElapsed(e => e + 1), 1000); }
    else { clearInterval(iRef.current); }
    return () => clearInterval(iRef.current);
  }, [running]);

  useEffect(() => {
    if ((cfg.mode === "countdown" || cfg.mode === "emom") && elapsed >= cfg.totalSecs) { setRunning(false); setFinished(true); }
  }, [elapsed, cfg]);

  const display = cfg.mode === "countdown" || cfg.mode === "emom" ? Math.max(0, cfg.totalSecs - elapsed) : elapsed;
  const progress = cfg.mode === "countdown" || cfg.mode === "emom" ? 1 - elapsed / cfg.totalSecs : Math.min(1, elapsed / cfg.totalSecs);
  const radius = 90, circ = 2 * Math.PI * radius;
  let emomInfo = null;
  if (cfg.mode === "emom" && cfg.blocks?.length) {
    const minIdx = Math.floor(elapsed / 60) % cfg.blocks.length;
    emomInfo = { label: cfg.blocks[minIdx], secsLeft: 60 - (elapsed % 60), minNum: Math.floor(elapsed / 60) + 1 };
  }

  if (!started || finished) return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 2000 }}>
      <style>{`@import url('${FONT}');`}</style>
      {!started && <>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🦩</div>
        <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 26, letterSpacing: 3, color: "#fff", marginBottom: 6, textAlign: "center" }}>{wod.templateLabel}</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>{wod.type} · {wod.totalTime} min</div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, width: "100%", maxWidth: 340, marginBottom: 24 }}>
          {wod.blocks?.map((b, i) => <BlockCard key={i} block={b} color={color} />)}
        </div>
        <button onClick={() => { setStarted(true); setRunning(true); }} style={{ width: "100%", maxWidth: 340, padding: "15px 0", background: `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: "none", borderRadius: 12, fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: "#fff", letterSpacing: 3, cursor: "pointer", marginBottom: 10 }}>🦩 EMPEZAR</button>
        <button onClick={onCancel} style={{ width: "100%", maxWidth: 340, padding: "11px 0", background: "#13131f", border: `1px solid ${C.border}`, borderRadius: 12, color: C.muted, fontSize: 13, cursor: "pointer" }}>Volver</button>
      </>}
      {finished && <>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🏁</div>
        <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 30, letterSpacing: 3, color: C.flamingo, marginBottom: 4 }}>TIEMPO FINAL</div>
        <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 52, color: "#fff", marginBottom: 24 }}>{fmtTime(elapsed)}</div>
        <button onClick={() => onFinish(elapsed)} style={{ width: "100%", maxWidth: 340, padding: "14px 0", background: `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: "none", borderRadius: 12, fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: "#fff", letterSpacing: 2, cursor: "pointer", marginBottom: 10 }}>REGISTRAR RESULTADO</button>
        <button onClick={onCancel} style={{ width: "100%", maxWidth: 340, padding: "11px 0", background: "#13131f", border: `1px solid ${C.border}`, borderRadius: 12, color: C.muted, fontSize: 13, cursor: "pointer" }}>Descartar</button>
      </>}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 2000 }}>
      <style>{`@import url('${FONT}');`}</style>
      <div style={{ color: C.muted, fontSize: 10, letterSpacing: 3, marginBottom: 6 }}>{wod.type} · {wod.templateLabel}</div>
      <div style={{ position: "relative", width: 220, height: 220, marginBottom: 16 }}>
        <svg width={220} height={220} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={110} cy={110} r={radius} fill="none" stroke={C.border} strokeWidth={8} />
          <circle cx={110} cy={110} r={radius} fill="none" stroke={color} strokeWidth={8} strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.max(0, Math.min(1, progress)))} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s linear" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 52, color: "#fff", lineHeight: 1 }}>{fmtTime(display)}</div>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2 }}>{cfg.mode === "countup" ? "TRANSCURRIDO" : "RESTANTE"}</div>
        </div>
      </div>
      {emomInfo && (
        <div style={{ background: color+"20", border: `1px solid ${color}40`, borderRadius: 10, padding: "10px 20px", marginBottom: 16, textAlign: "center" }}>
          <div style={{ color, fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 3 }}>MIN {emomInfo.minNum}</div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{emomInfo.label}</div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{emomInfo.secsLeft}s hasta siguiente</div>
        </div>
      )}
      {cfg.mode !== "countup" && <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Transcurrido: {fmtTime(elapsed)}</div>}
      <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 300 }}>
        <button onClick={() => setRunning(r => !r)} style={{ flex: 1, padding: "14px 0", background: running ? C.card : `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: `1px solid ${running ? C.border : "transparent"}`, borderRadius: 10, fontFamily: "'Bebas Neue',cursive", fontSize: 18, color: running ? "#888" : "#fff", letterSpacing: 2, cursor: "pointer" }}>{running ? "PAUSA" : "REANUDAR"}</button>
        <button onClick={() => { setRunning(false); setFinished(true); }} style={{ padding: "14px 16px", background: "#13131f", border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: "'Bebas Neue',cursive", fontSize: 14, color: C.flamingo, cursor: "pointer", letterSpacing: 1 }}>STOP</button>
      </div>
      <button onClick={onCancel} style={{ marginTop: 10, padding: "8px 20px", background: "none", border: "none", color: C.muted, fontSize: 11, cursor: "pointer" }}>Abandonar</button>
    </div>
  );
}

// ─── RESULT MODAL ────────────────────────────────────────────
function ResultModal({ wod, elapsedSecs, onSave, onClose }) {
  const [step, setStep] = useState("metrics");
  const [selMetrics, setSelMetrics] = useState([]);
  const [vals, setVals] = useState({});
  const [rpe, setRpe] = useState(7);
  const [durMin, setDurMin] = useState(wod?.totalTime || 20);
  const [notes, setNotes] = useState("");
  const [isBenchmark, setIsBenchmark] = useState(false);
  const [bName, setBName] = useState(wod?.templateLabel || "");
  const [saving, setSaving] = useState(false);
  const color = wod?.energyColor || C.flamingo;
  const inp = { width: "100%", padding: "9px 11px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: "#fff", fontSize: 12, boxSizing: "border-box" };

  async function handleSave() {
    setSaving(true);
    const allVals = { ...vals };
    if (elapsedSecs != null && selMetrics.includes("time")) allVals["time"] = fmtTime(elapsedSecs);
    const resultStr = Object.entries(allVals).map(([k, v]) => { const m = BENCHMARK_METRICS.find(x => x.id === k); return `${m?.label}: ${v} ${m?.unit}`; }).join(" · ");
    const carga_sesion = rpe * durMin;
    await onSave({ result: resultStr, rpe, duracion_min: durMin, carga_sesion, notes, benchmark: isBenchmark ? { name: bName, metrics: selMetrics } : null });
    setSaving(false);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 3000 }}>
      <div style={{ background: "#0a0a16", border: `1px solid ${color}30`, borderRadius: "16px 16px 0 0", padding: "18px 16px 36px", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ width: 32, height: 3, background: C.border, borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: "#fff", letterSpacing: 2, marginBottom: 4 }}>REGISTRAR RESULTADO</div>
        <div style={{ color: C.muted, fontSize: 11, marginBottom: 18 }}>{wod?.templateLabel} · {wod?.type}</div>

        {step === "metrics" && (
          <div>
            <div style={{ color: C.flamingo, fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>QUE METRICAS QUIERES REGISTRAR?</div>
            {BENCHMARK_METRICS.map(m => {
              const sel = selMetrics.includes(m.id);
              return (
                <button key={m.id} onClick={() => setSelMetrics(p => p.includes(m.id) ? p.filter(x => x !== m.id) : [...p, m.id])} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", marginBottom: 6, background: sel ? color+"20" : C.card, border: `1px solid ${sel ? color : C.border}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 18 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}><div style={{ color: sel ? color : "#ccc", fontWeight: 700, fontSize: 12 }}>{m.label}</div></div>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: sel ? color : C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#000", fontWeight: 800 }}>{sel ? "✓" : ""}</div>
                </button>
              );
            })}
            <button onClick={() => setStep("values")} style={{ width: "100%", padding: "12px 0", background: `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: "none", borderRadius: 9, fontFamily: "'Bebas Neue',cursive", fontSize: 16, color: "#fff", letterSpacing: 2, cursor: "pointer", marginTop: 8 }}>CONTINUAR</button>
          </div>
        )}

        {step === "values" && (
          <div>
            <div style={{ color: C.flamingo, fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>INTRODUCE TUS RESULTADOS</div>
            {elapsedSecs != null && selMetrics.includes("time") && (
              <div style={{ background: C.flamingo+"20", border: `1px solid ${C.flamingo}40`, borderRadius: 8, padding: "8px 12px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.muted, fontSize: 11 }}>Tiempo del cronometro</span>
                <span style={{ color: C.flamingo, fontFamily: "'Bebas Neue',cursive", fontSize: 20 }}>{fmtTime(elapsedSecs)}</span>
              </div>
            )}
            {selMetrics.map(id => {
              if (id === "time" && elapsedSecs != null) return null;
              const m = BENCHMARK_METRICS.find(x => x.id === id);
              return (
                <div key={id} style={{ marginBottom: 10 }}>
                  <label style={{ color: C.muted, fontSize: 9, letterSpacing: 1, display: "block", marginBottom: 3 }}>{m?.icon} {m?.label} ({m?.unit})</label>
                  <input value={vals[id] || ""} onChange={e => setVals(p => ({ ...p, [id]: e.target.value }))} placeholder={id === "time" ? "12:45" : id === "reps" ? "87" : "—"} style={inp} />
                </div>
              );
            })}

            {/* RPE + Duración para sRPE */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ color: C.flamingo, fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>CARGA DE SESION (sRPE)</div>
              <label style={{ color: C.muted, fontSize: 9, letterSpacing: 2, display: "block", marginBottom: 6 }}>RPE PERCIBIDO: <span style={{ color }}>{rpe}/10</span></label>
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <button key={n} onClick={() => setRpe(n)} style={{ flex: 1, padding: "6px 0", background: rpe >= n ? color : "#13131f", border: "none", borderRadius: 3, color: rpe >= n ? "#000" : "#444", fontWeight: 700, fontSize: 9, cursor: "pointer" }}>{n}</button>)}
              </div>
              <label style={{ color: C.muted, fontSize: 9, letterSpacing: 2, display: "block", marginBottom: 4 }}>DURACION (minutos)</label>
              <input type="number" value={durMin} onChange={e => setDurMin(+e.target.value)} min={1} max={300} style={{ ...inp, marginBottom: 8 }} />
              <div style={{ background: C.bg, borderRadius: 6, padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.muted, fontSize: 11 }}>Carga sesion = RPE x min</span>
                <span style={{ color: C.flamingo, fontFamily: "'Bebas Neue',cursive", fontSize: 18 }}>{rpe * durMin}</span>
              </div>
            </div>

            <label style={{ color: C.muted, fontSize: 9, letterSpacing: 2, display: "block", marginBottom: 4 }}>NOTAS</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Sensaciones..." style={{ ...inp, resize: "vertical", marginBottom: 12 }} />
            <button onClick={() => setIsBenchmark(b => !b)} style={{ width: "100%", padding: "9px", marginBottom: isBenchmark ? 10 : 14, background: isBenchmark ? "#FFD70020" : C.card, border: `1px solid ${isBenchmark ? "#FFD700" : C.border}`, borderRadius: 8, color: isBenchmark ? "#FFD700" : "#666", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
              {isBenchmark ? "GUARDAR COMO BENCHMARK ✓" : "MARCAR COMO BENCHMARK"}
            </button>
            {isBenchmark && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: "#FFD700", fontSize: 9, letterSpacing: 2, display: "block", marginBottom: 4 }}>NOMBRE DEL BENCHMARK</label>
                <input value={bName} onChange={e => setBName(e.target.value)} style={{ ...inp, marginBottom: 0 }} />
              </div>
            )}
            <div style={{ display: "flex", gap: 7 }}>
              <button onClick={() => setStep("metrics")} style={{ padding: "11px 14px", background: "#13131f", border: `1px solid ${C.border}`, borderRadius: 9, color: C.muted, fontSize: 12, cursor: "pointer" }}>Atras</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "11px 0", background: `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: "none", borderRadius: 9, fontFamily: "'Bebas Neue',cursive", fontSize: 15, color: "#fff", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "GUARDANDO..." : "GUARDAR"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SCHEDULE MODAL ──────────────────────────────────────────
function ScheduleModal({ wod, onSchedule, onClose, calendarWods }) {
  const [weekOffset, setWeekOffset] = useState(0), [selDate, setSelDate] = useState(null), [saving, setSaving] = useState(false);
  const days = getWeekDays(weekOffset);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#0a0a16", border: `1px solid ${C.flamingo}30`, borderRadius: "16px 16px 0 0", padding: "18px 16px 32px", width: "100%", maxWidth: 500 }}>
        <div style={{ width: 32, height: 3, background: C.border, borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: "#fff", letterSpacing: 2, marginBottom: 14 }}>AGENDAR WOD</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ padding: "6px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: "#ccc", cursor: "pointer", fontSize: 14 }}>&#8249;</button>
          <span style={{ color: "#ccc", fontSize: 12, fontWeight: 600 }}>{days[0].toLocaleDateString("es-ES", { month: "short", day: "numeric" })} - {days[6].toLocaleDateString("es-ES", { month: "short", day: "numeric" })}</span>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ padding: "6px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: "#ccc", cursor: "pointer", fontSize: 14 }}>&#8250;</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 16 }}>
          {days.map((d, i) => { const df = fmtDate(d), hasWod = (calendarWods || []).some(w => w.date === df), sel = selDate === df, tod = isToday(d); return <button key={i} onClick={() => setSelDate(df)} style={{ padding: "8px 4px", background: sel ? C.flamingo+"30" : tod ? "#1e1e30" : C.card, border: `1px solid ${sel ? C.flamingo : tod ? "#444" : C.border}`, borderRadius: 7, cursor: "pointer", textAlign: "center" }}><div style={{ color: sel ? C.flamingo : tod ? "#fff" : "#666", fontSize: 9, fontWeight: 700 }}>{DAYS_ES[i]}</div><div style={{ color: sel ? C.flamingo : tod ? "#fff" : "#888", fontWeight: 900, fontSize: 14 }}>{d.getDate()}</div>{hasWod && <div style={{ width: 5, height: 5, background: C.flamingo, borderRadius: "50%", margin: "2px auto 0" }} />}</button>; })}
        </div>
        {selDate && <button onClick={async () => { setSaving(true); await onSchedule(selDate, wod); setSaving(false); onClose(); }} style={{ width: "100%", padding: "12px 0", background: `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: "none", borderRadius: 9, fontFamily: "'Bebas Neue',cursive", fontSize: 15, color: "#fff", letterSpacing: 2, cursor: "pointer", opacity: saving ? 0.7 : 1, marginBottom: 8 }}>{saving ? "AGENDANDO..." : `AGENDAR EL ${new Date(selDate+"T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" }).toUpperCase()}`}</button>}
        <button onClick={onClose} style={{ width: "100%", padding: "10px 0", background: "#13131f", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 9, cursor: "pointer", fontSize: 12 }}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"), [email, setEmail] = useState(""), [pass, setPass] = useState(""), [err, setErr] = useState(""), [loading, setLoading] = useState(false);
  const inp = { width: "100%", padding: "11px 13px", background: "#0d0d1a", border: `1px solid ${C.border}`, borderRadius: 9, color: "#fff", fontSize: 13, boxSizing: "border-box", marginBottom: 11, outline: "none" };
  async function handle() {
    if (!email || !pass) { setErr("Completa todos los campos"); return; }
    setLoading(true); setErr("");
    try { const res = mode === "login" ? await sb.signIn(email, pass) : await sb.signUp(email, pass); if (res.error || res.msg) { setErr(res.error?.message || res.msg || "Error"); setLoading(false); return; } if (mode === "register" && !res.access_token) { setErr("Revisa tu email para confirmar"); setLoading(false); return; } onAuth(res); } catch (e) { setErr("Error de conexion"); setLoading(false); }
  }
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`@import url('${FONT}');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 34, letterSpacing: 4, color: C.flamingo, marginBottom: 6, textAlign: "center" }}>FLAMINGO WOD</div>
      <div style={{ fontSize: 52, marginBottom: 6, lineHeight: 1 }}>🦩</div>
      <div style={{ color: C.muted, fontSize: 10, letterSpacing: 3, marginBottom: 32 }}>CROSSFIT GENERATOR</div>
      <div style={{ width: "100%", maxWidth: 340, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>
        <div style={{ display: "flex", gap: 7, marginBottom: 20 }}>{["login","register"].map(m => <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{ flex: 1, padding: "8px 0", background: mode === m ? C.flamingo+"25" : C.bg, border: `1px solid ${mode === m ? C.flamingo : C.border}`, borderRadius: 7, color: mode === m ? C.flamingo : "#666", fontWeight: 700, fontSize: 10, cursor: "pointer", letterSpacing: 1 }}>{m === "login" ? "ENTRAR" : "REGISTRARSE"}</button>)}</div>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={inp} />
        <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Contrasena" type="password" style={{ ...inp, marginBottom: err ? 7 : 14 }} onKeyDown={e => e.key === "Enter" && handle()} />
        {err && <div style={{ color: "#FF2D55", fontSize: 11, marginBottom: 11, padding: "7px 10px", background: "#FF2D5510", borderRadius: 5 }}>{err}</div>}
        <button onClick={handle} disabled={loading} style={{ width: "100%", padding: "12px 0", background: `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: "none", borderRadius: 9, fontFamily: "'Bebas Neue',cursive", fontSize: 17, color: "#fff", letterSpacing: 2, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>{loading ? "..." : mode === "login" ? "ENTRAR" : "CREAR CUENTA"}</button>
      </div>
    </div>
  );
}

// ─── GENERATOR ───────────────────────────────────────────────
function GeneratorWizard({ onGenerate }) {
  const [format, setFormat] = useState("Aleatorio"), [duration, setDuration] = useState(20), [level, setLevel] = useState("rx");
  const [equipment, setEquipment] = useState(() => Object.fromEntries(EQUIPMENT_LIST.map(e => [e.id, true])));
  const [maxEx, setMaxEx] = useState(4);
  const groups = [...new Set(EQUIPMENT_LIST.map(e => e.group))];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ color: C.muted, fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 9 }}>FORMATO WOD</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
          {["Aleatorio","AMRAP","EMOM","For Time","Hero WOD"].map(f => <Pill key={f} active={format === f} onClick={() => setFormat(f)} color={C.flamingo}>{f}</Pill>)}
        </div>
      </div>
      <div>
        <div style={{ color: C.muted, fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 9 }}>NIVEL Y DURACION</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginBottom: 12 }}>
          {[{id:"beginner",l:"Principiante"},{id:"scaled",l:"Scaled"},{id:"intermediate",l:"Intermedio"},{id:"rx",l:"RX"}].map(l => <Pill key={l.id} active={level === l.id} onClick={() => setLevel(l.id)} color={C.flamingo}>{l.l}</Pill>)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ color: "#888", fontSize: 11 }}>Duracion maxima</span>
          <span style={{ color: C.flamingo, fontWeight: 800 }}>{duration} min</span>
        </div>
        <input type="range" min={8} max={70} step={1} value={duration} onChange={e => setDuration(+e.target.value)} style={{ width: "100%", accentColor: C.flamingo }} />
        <div style={{ color: "#555", fontSize: 9, marginTop: 3 }}>El WOD durara entre {Math.round(duration * 0.75)} y {duration} min</div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
          <span style={{ color: C.muted, fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>MATERIAL</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setEquipment(Object.fromEntries(EQUIPMENT_LIST.map(e => [e.id, true])))} style={{ padding: "3px 8px", background: "#13131f", border: `1px solid ${C.border}`, borderRadius: 4, color: "#666", fontSize: 9, cursor: "pointer" }}>Todo</button>
            <button onClick={() => setEquipment(Object.fromEntries(EQUIPMENT_LIST.map(e => [e.id, false])))} style={{ padding: "3px 8px", background: "#13131f", border: `1px solid ${C.border}`, borderRadius: 4, color: "#666", fontSize: 9, cursor: "pointer" }}>Ninguno</button>
          </div>
        </div>
        {groups.map(g => (
          <div key={g} style={{ marginBottom: 10 }}>
            <div style={{ color: "#444", fontSize: 8, letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>{g.toUpperCase()}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 3 }}>
              {EQUIPMENT_LIST.filter(e => e.group === g).map(e => (
                <button key={e.id} onClick={() => setEquipment(p => ({ ...p, [e.id]: !p[e.id] }))} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: equipment[e.id] ? "#13131f" : "#0a0a14", border: `1px solid ${equipment[e.id] ? C.border : "#161625"}`, borderRadius: 5, cursor: "pointer", opacity: equipment[e.id] ? 1 : 0.4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, flexShrink: 0, background: equipment[e.id] ? C.flamingo : "#1e1e30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#000", fontWeight: 800 }}>{equipment[e.id] ? "✓" : ""}</div>
                  <span style={{ fontSize: 9, color: equipment[e.id] ? "#ccc" : C.muted, fontWeight: 600 }}>{e.icon} {e.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: C.muted, fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>MAX. EJERCICIOS</span>
          <strong style={{ color: C.flamingo }}>{maxEx}</strong>
        </div>
        <input type="range" min={2} max={8} value={maxEx} onChange={e => setMaxEx(+e.target.value)} style={{ width: "100%", accentColor: C.flamingo }} />
      </div>
      <button onClick={() => onGenerate({ format, duration, level, equipment, maxExercises: maxEx })} style={{ width: "100%", padding: "14px 0", background: `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: "none", borderRadius: 11, fontFamily: "'Bebas Neue',cursive", fontSize: 19, color: "#fff", letterSpacing: 3, cursor: "pointer", boxShadow: `0 4px 18px ${C.flamingo}40` }}>
        🦩 GENERAR WOD
      </button>
    </div>
  );
}

// ─── CALENDAR ────────────────────────────────────────────────
function CalendarView({ calendarWods, onStartWod, onAddWodToDay, onDeleteWod }) {
  const [weekOffset, setWeekOffset] = useState(0), [selDay, setSelDay] = useState(fmtDate(new Date()));
  const days = getWeekDays(weekOffset);
  const dayWods = calendarWods.filter(w => w.date === selDay);
  return (
    <div>
      <Title>CALENDARIO</Title>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={() => setWeekOffset(w => w - 1)} style={{ padding: "6px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, color: "#ccc", cursor: "pointer", fontSize: 16 }}>&#8249;</button>
        <span style={{ color: "#ccc", fontSize: 12, fontWeight: 700 }}>{days[0].toLocaleDateString("es-ES", { month: "short", day: "numeric" })} - {days[6].toLocaleDateString("es-ES", { month: "short", day: "numeric" })}</span>
        <button onClick={() => setWeekOffset(w => w + 1)} style={{ padding: "6px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, color: "#ccc", cursor: "pointer", fontSize: 16 }}>&#8250;</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 16 }}>
        {days.map((d, i) => { const df = fmtDate(d), cnt = calendarWods.filter(w => w.date === df).length, sel = selDay === df, tod = isToday(d); return <button key={i} onClick={() => setSelDay(df)} style={{ padding: "8px 3px", background: sel ? C.flamingo+"25" : tod ? "#1a1a2e" : C.card, border: `2px solid ${sel ? C.flamingo : tod ? "#444" : C.border}`, borderRadius: 8, cursor: "pointer", textAlign: "center" }}><div style={{ color: sel ? C.flamingo : tod ? "#fff" : "#555", fontSize: 8, fontWeight: 700, marginBottom: 2 }}>{DAYS_ES[i]}</div><div style={{ color: sel ? C.flamingo : tod ? "#fff" : "#777", fontWeight: 900, fontSize: 15 }}>{d.getDate()}</div>{cnt > 0 && <div style={{ marginTop: 3, display: "flex", justifyContent: "center", gap: 2 }}>{Array.from({ length: Math.min(cnt, 3) }).map((_, j) => <div key={j} style={{ width: 4, height: 4, background: C.flamingo, borderRadius: "50%" }} />)}</div>}</button>; })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: "#ccc", fontSize: 12, fontWeight: 700 }}>{new Date(selDay+"T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</span>
        <button onClick={() => onAddWodToDay(selDay)} style={{ padding: "7px 14px", background: `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: "none", borderRadius: 7, fontFamily: "'Bebas Neue',cursive", fontSize: 12, color: "#fff", cursor: "pointer", letterSpacing: 1 }}>+ AÑADIR WOD</button>
      </div>
      {dayWods.length === 0 ? <Placeholder icon="📅" text="Sin WODs para este dia" /> : dayWods.map((entry, i) => {
        const wod = entry.wod, color = C.flamingo;
        return (
          <div key={i} style={{ background: C.card, border: `1px solid ${color}30`, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div><div style={{ display: "flex", gap: 5, marginBottom: 4 }}><Tag color={color}>{wod?.type}</Tag></div><div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{wod?.templateLabel}</div><div style={{ color: "#444", fontSize: 10, marginTop: 1 }}>{wod?.totalTime} min · {wod?.level?.toUpperCase()}</div></div>
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={() => onStartWod(wod)} style={{ padding: "8px 12px", background: `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: "none", borderRadius: 7, fontFamily: "'Bebas Neue',cursive", fontSize: 12, color: "#fff", cursor: "pointer", letterSpacing: 1 }}>EMPEZAR</button>
                <button onClick={() => onDeleteWod(entry.id)} style={{ padding: "8px 10px", background: "#13131f", border: `1px solid ${C.border}`, borderRadius: 7, color: "#666", fontSize: 13, cursor: "pointer" }}>🗑</button>
              </div>
            </div>
            {wod?.blocks?.map((b, j) => <BlockCard key={j} block={b} color={color} />)}
          </div>
        );
      })}
    </div>
  );
}

// ─── STATS VIEW ──────────────────────────────────────────────
function StatsView({ history, loading }) {
  if (loading) return <Spinner />;
  if (!history.length) return <Placeholder icon="📊" text="Registra tu primer WOD para ver estadisticas" />;

  const stats = calcLoadStats(history);
  const { acuteLoad, chronicLoad, acwr, weeks, daysThisWeek, totalMins, avgRpe } = stats;

  const acwrNum = parseFloat(acwr);
  const acwrColor = acwrNum === 0 ? "#555" : acwrNum <= 0.8 ? "#FFCC00" : acwrNum <= 1.3 ? "#34C759" : acwrNum <= 1.5 ? "#FF9500" : "#FF2D55";
  const acwrLabel = acwrNum === 0 ? "Sin datos" : acwrNum < 0.8 ? "Carga baja" : acwrNum <= 1.3 ? "Zona segura" : acwrNum <= 1.5 ? "Precaucion" : "Riesgo alto";
  const acwrEmoji = acwrNum === 0 ? "—" : acwrNum <= 1.3 ? "✅" : acwrNum <= 1.5 ? "⚠️" : "🚨";

  const maxLoad = Math.max(...weeks.map(w => w.load), 1);

  return (
    <div>
      <Title>STATS</Title>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}>
        {[
          { l: "Dias / semana", v: daysThisWeek },
          { l: "Tiempo total (h)", v: (totalMins / 60).toFixed(1) },
          { l: "sRPE medio", v: avgRpe },
        ].map(s => (
          <div key={s.l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: C.flamingo, lineHeight: 1 }}>{s.v}</div>
            <div style={{ color: C.muted, fontSize: 8, letterSpacing: 1, marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ACWR card */}
      <div style={{ background: acwrColor+"15", border: `2px solid ${acwrColor}`, borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: acwrColor, fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>RATIO CARGA AGUDA : CRONICA</div>
            <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 52, color: acwrColor, lineHeight: 1 }}>{acwr}</div>
            <div style={{ color: acwrColor, fontSize: 13, fontWeight: 700, marginTop: 4 }}>{acwrEmoji} {acwrLabel}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: C.muted, fontSize: 8, letterSpacing: 2 }}>CARGA AGUDA (7d)</div>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: "#fff" }}>{acuteLoad}</div>
            </div>
            <div>
              <div style={{ color: C.muted, fontSize: 8, letterSpacing: 2 }}>CARGA CRONICA (28d avg)</div>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: "#fff" }}>{chronicLoad}</div>
            </div>
          </div>
        </div>
        {/* Zone indicator bar */}
        <div style={{ position: "relative", height: 8, background: "#111", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
          <div style={{ position: "absolute", left: 0, width: "53%", height: "100%", background: "linear-gradient(90deg,#333,#FFCC00,#34C759)" }} />
          <div style={{ position: "absolute", left: "53%", width: "13%", height: "100%", background: "#FF9500" }} />
          <div style={{ position: "absolute", left: "66%", width: "34%", height: "100%", background: "#FF2D55" }} />
          {acwrNum > 0 && <div style={{ position: "absolute", top: -2, width: 12, height: 12, background: "#fff", borderRadius: "50%", border: `2px solid ${acwrColor}`, left: `${Math.min(96, acwrNum / 2 * 100)}%`, transform: "translateX(-50%)", transition: "left 0.5s" }} />}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#444", fontSize: 8 }}>
          <span>0.8 Bajo</span><span style={{ color: "#34C759" }}>0.8-1.3 Seguro</span><span style={{ color: "#FF9500" }}>1.3-1.5</span><span style={{ color: "#FF2D55" }}>+1.5 Riesgo</span>
        </div>
      </div>

      {/* Weekly load chart */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 14px", marginBottom: 20 }}>
        <div style={{ color: C.muted, fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}>CARGA SEMANAL (ULTIMAS 4 SEMANAS)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
          {weeks.map((w, i) => {
            const h = maxLoad > 0 ? (w.load / maxLoad) * 100 : 0;
            const isLast = i === 3;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ color: isLast ? C.flamingo : "#666", fontSize: 9, fontWeight: 700 }}>{w.load || "—"}</div>
                <div style={{ width: "100%", height: `${Math.max(h, 2)}px`, background: isLast ? `linear-gradient(180deg,${C.flamingo},#FF2D7A)` : "#2a2a3e", borderRadius: "4px 4px 0 0", minHeight: 3, transition: "height 0.5s" }} />
                <div style={{ color: isLast ? C.flamingo : "#555", fontSize: 8, fontWeight: 700 }}>{isLast ? "ESTA" : w.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent sessions */}
      <div style={{ color: C.muted, fontSize: 9, letterSpacing: 2, marginBottom: 10 }}>ULTIMAS SESIONES</div>
      {[...history].slice(0, 8).map((h, i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 11 }}>{h.wod?.templateLabel || h.wod?.type || "WOD"}</div>
            <div style={{ color: "#444", fontSize: 9, marginTop: 1 }}>{new Date(h.date).toLocaleDateString("es-ES")}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            {h.carga_sesion > 0 && <div style={{ color: C.flamingo, fontFamily: "'Bebas Neue',cursive", fontSize: 16 }}>{h.carga_sesion}</div>}
            {h.rpe && <div style={{ color: C.muted, fontSize: 9 }}>RPE {h.rpe} · {h.duracion_min}min</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SIDEBAR VIEWS ───────────────────────────────────────────
function ManualWODView({ onSchedule, onDo, calendarWods }) {
  const [name, setName] = useState(""), [type, setType] = useState("AMRAP"), [desc, setDesc] = useState(""), [showSched, setShowSched] = useState(false);
  const inp = { width: "100%", padding: "9px 11px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: "#fff", fontSize: 12, boxSizing: "border-box", marginBottom: 9 };
  function buildWod() { return { id: Date.now().toString(), type, templateLabel: name || "WOD Manual", ref: "WOD Manual", energyColor: C.flamingo, totalTime: 20, scoring: "Registro personal", blocks: [{ kind: "Custom", content: desc }], generatedAt: new Date().toISOString(), level: "rx" }; }
  return (
    <div>
      <Title>WOD MANUAL</Title>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del WOD (opcional)" style={inp} />
        <select value={type} onChange={e => setType(e.target.value)} style={{ ...inp, appearance: "none" }}>{["AMRAP","EMOM","For Time","Chipper","Hero WOD","Strength"].map(f => <option key={f}>{f}</option>)}</select>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={8} placeholder={"Escribe tu WOD:\n\nEj:\nEMOM 20 min\nMin 1: 10 Pull-ups\n..."} style={{ ...inp, resize: "vertical", fontFamily: "monospace", fontSize: 11, marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={() => { if (!desc) return; onDo(buildWod()); }} style={{ flex: 1, padding: "11px 0", background: `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: "none", borderRadius: 8, fontFamily: "'Bebas Neue',cursive", fontSize: 14, color: "#fff", cursor: "pointer", letterSpacing: 1 }}>HACER AHORA</button>
          <button onClick={() => { if (!desc) return; setShowSched(true); }} style={{ flex: 1, padding: "11px 0", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "'Bebas Neue',cursive", fontSize: 14, color: "#ccc", cursor: "pointer", letterSpacing: 1 }}>AGENDAR</button>
        </div>
      </div>
      {showSched && <ScheduleModal wod={buildWod()} onSchedule={async (date, wod) => { await onSchedule(date, wod); setShowSched(false); }} onClose={() => setShowSched(false)} calendarWods={calendarWods} />}
    </div>
  );
}

function FavoritesView({ favorites, loading, onLoad, onDelete }) {
  if (loading) return <Spinner />;
  if (!favorites.length) return <Placeholder icon="🦩" text="Aun no tienes favoritos. Pulsa el flamingo en cualquier WOD." />;
  return (
    <div>
      <Title>FAVORITOS 🦩</Title>
      {favorites.map((f, i) => {
        const wod = f.wod || f;
        return (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.flamingo}30`, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div><Tag color={C.flamingo}>{wod.type}</Tag><div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginTop: 4 }}>{wod.templateLabel}</div><div style={{ color: "#444", fontSize: 10, marginTop: 1 }}>{wod.totalTime} min</div></div>
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={() => onLoad(wod)} style={{ padding: "5px 10px", background: C.flamingo+"20", border: `1px solid ${C.flamingo}40`, borderRadius: 6, color: C.flamingo, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Cargar</button>
                <button onClick={() => onDelete(f.id)} style={{ padding: "5px 8px", background: "#13131f", border: `1px solid ${C.border}`, borderRadius: 6, color: "#444", fontSize: 10, cursor: "pointer" }}>X</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BenchmarksView({ benchmarks, benchmarkResults, loading, onAddResult, onDelete }) {
  const [selected, setSelected] = useState(null), [showAdd, setShowAdd] = useState(false), [newResult, setNewResult] = useState({}), [saving, setSaving] = useState(false);
  const inp = { width: "100%", padding: "8px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: "#fff", fontSize: 12, boxSizing: "border-box", marginBottom: 8 };
  if (loading) return <Spinner />;
  const bm = selected ? benchmarks.find(b => b.id === selected) : null;
  const bmResults = selected ? (benchmarkResults[selected] || []) : [];
  return (
    <div>
      <Title>BENCHMARKS</Title>
      {!benchmarks.length ? <Placeholder icon="⭐" text="Aun no tienes benchmarks." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {benchmarks.map(b => (
            <button key={b.id} onClick={() => setSelected(b.id === selected ? null : b.id)} style={{ background: selected === b.id ? "#FFD70015" : C.card, border: `1px solid ${selected === b.id ? "#FFD700" : C.border}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{b.name}</div><div style={{ color: "#444", fontSize: 10 }}>{(benchmarkResults[b.id] || []).length} registros</div></div>
                <span style={{ color: selected === b.id ? "#FFD700" : "#444", fontSize: 18 }}>{selected === b.id ? "▲" : "▼"}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {bm && (
        <div style={{ background: "#FFD70010", border: "1px solid #FFD70030", borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "#FFD700", fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>HISTORIAL — {bm.name}</span>
            <button onClick={() => setShowAdd(s => !s)} style={{ padding: "5px 12px", background: "#FFD70020", border: "1px solid #FFD70040", borderRadius: 6, color: "#FFD700", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>+ NUEVO</button>
          </div>
          {showAdd && (
            <div style={{ background: C.bg, borderRadius: 8, padding: 12, marginBottom: 12 }}>
              {bm.metrics?.map(m => { const met = BENCHMARK_METRICS.find(x => x.id === m); return <div key={m} style={{ marginBottom: 7 }}><label style={{ color: C.muted, fontSize: 9, display: "block", marginBottom: 3 }}>{met?.icon} {met?.label} ({met?.unit})</label><input value={newResult[m] || ""} onChange={e => setNewResult(p => ({ ...p, [m]: e.target.value }))} placeholder="—" style={inp} /></div>; })}
              <button onClick={async () => { setSaving(true); await onAddResult(bm.id, { results: newResult, date: new Date().toISOString() }); setNewResult({}); setShowAdd(false); setSaving(false); }} style={{ width: "100%", padding: "9px", background: "#FFD700", border: "none", borderRadius: 7, fontFamily: "'Bebas Neue',cursive", fontSize: 13, color: "#000", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "GUARDANDO..." : "GUARDAR"}</button>
            </div>
          )}
          {!bmResults.length ? <div style={{ color: "#555", fontSize: 12, textAlign: "center", padding: "16px 0" }}>Sin registros aun</div> : bmResults.map((r, i) => (
            <div key={i} style={{ background: i === 0 ? "#FFD70010" : C.card, border: `1px solid ${i === 0 ? "#FFD70040" : C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#444", fontSize: 10 }}>{new Date(r.date).toLocaleDateString("es-ES")}</span>{i === 0 && <span style={{ color: "#FFD700", fontSize: 9, fontWeight: 800 }}>MEJOR</span>}</div>
              {Object.entries(r.results || {}).map(([k, v]) => { const met = BENCHMARK_METRICS.find(x => x.id === k); return <div key={k} style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#888", fontSize: 11 }}>{met?.icon} {met?.label}</span><span style={{ color: "#FFD700", fontFamily: "'Bebas Neue',cursive", fontSize: 16 }}>{v} <span style={{ fontSize: 10, color: "#555" }}>{met?.unit}</span></span></div>; })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryView({ history, loading }) {
  if (loading) return <Spinner />;
  if (!history.length) return <Placeholder icon="📋" text="Sin registros aun" />;
  return (
    <div>
      <Title>HISTORIAL</Title>
      {history.map((h, i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <div><Tag color={C.flamingo}>{h.wod?.type}</Tag><div style={{ color: "#fff", fontWeight: 700, fontSize: 12, marginTop: 4 }}>{h.wod?.templateLabel}</div><div style={{ color: "#444", fontSize: 9, marginTop: 1 }}>{new Date(h.date).toLocaleDateString("es-ES")}</div></div>
            <div style={{ textAlign: "right" }}>{h.result && <div style={{ color: C.flamingo, fontWeight: 900, fontSize: 14, fontFamily: "'Bebas Neue',cursive" }}>{h.result}</div>}{h.carga_sesion > 0 && <div style={{ color: C.muted, fontSize: 9 }}>Carga: {h.carga_sesion}</div>}</div>
          </div>
          {h.notes && <div style={{ color: C.muted, fontSize: 10, fontStyle: "italic", borderTop: `1px solid ${C.border}`, paddingTop: 6 }}>"{h.notes}"</div>}
        </div>
      ))}
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────
function Sidebar({ open, onClose, tab, setTab, onLogout, userName }) {
  const items = [
    { id: "manual",     icon: "✍️", label: "WOD Manual" },
    { id: "favorites",  icon: "🦩", label: "Favoritos" },
    { id: "benchmarks", icon: "⭐", label: "Benchmarks" },
    { id: "history",    icon: "📋", label: "Historial" },
  ];
  return (
    <>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200 }} />}
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 260, background: "#0a0a14", borderRight: `1px solid ${C.border}`, zIndex: 300, transform: open ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.3s ease", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ fontSize: 28 }}>🦩</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: 3, color: C.flamingo }}>FLAMINGO WOD</div>
              <div style={{ color: C.muted, fontSize: 10 }}>{userName}</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {items.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); onClose(); }} style={{ width: "100%", padding: "14px 20px", background: tab === item.id ? C.flamingo+"15" : "none", border: "none", borderLeft: `3px solid ${tab === item.id ? C.flamingo : "transparent"}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ color: tab === item.id ? C.flamingo : "#888", fontWeight: tab === item.id ? 700 : 400, fontSize: 14 }}>{item.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
          <button onClick={onLogout} style={{ width: "100%", padding: "10px 0", background: "#13131f", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 12, cursor: "pointer" }}>Cerrar sesion</button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("generate");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wod, setWod] = useState(null), [lastCfg, setLastCfg] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  const [showResult, setShowResult] = useState(false), [elapsedSecs, setElapsedSecs] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [history, setHistory] = useState([]), [favorites, setFavorites] = useState([]);
  const [calendarWods, setCalendarWods] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]), [benchmarkResults, setBenchmarkResults] = useState({});
  const [loadingH, setLoadingH] = useState(false), [loadingF, setLoadingF] = useState(false), [loadingB, setLoadingB] = useState(false);
  const ref = useRef(null);

  async function loadAll(token) {
    setLoadingH(true); setLoadingF(true); setLoadingB(true);
    const [h, cal, fav, bm] = await Promise.all([
      sb.select(token, "wod_history", "select=*"),
      sb.select(token, "wod_calendar", "select=*"),
      sb.select(token, "wod_favorites", "select=*"),
      sb.select(token, "wod_benchmarks", "select=*"),
    ]);
    setHistory(Array.isArray(h) ? h : []);
    setCalendarWods(Array.isArray(cal) ? cal : []);
    setFavorites(Array.isArray(fav) ? fav : []);
    if (Array.isArray(bm)) {
      setBenchmarks(bm);
      const results = {};
      await Promise.all(bm.map(async b => { const r = await sb.select(token, "benchmark_results", `select=*&benchmark_id=eq.${b.id}&order=date.desc`); results[b.id] = Array.isArray(r) ? r : []; }));
      setBenchmarkResults(results);
    }
    setLoadingH(false); setLoadingF(false); setLoadingB(false);
  }

  async function handleAuth(res) { setSession({ token: res.access_token, user: res.user || {} }); await loadAll(res.access_token); }
  async function handleLogout() { if (session?.token) await sb.signOut(session.token); setSession(null); setWod(null); setTab("generate"); setSidebarOpen(false); }

  async function scheduleWod(date, wodData) { await sb.insert(session.token, "wod_calendar", { user_id: session.user.id, date, wod: wodData }); await loadAll(session.token); }

  async function saveEntry({ result, rpe, duracion_min, carga_sesion, notes, benchmark }) {
    await sb.insert(session.token, "wod_history", { user_id: session.user.id, wod: activeTimer, result, rpe, duracion_min, carga_sesion, notes, date: new Date().toISOString() });
    if (benchmark) {
      const bm = await sb.insert(session.token, "wod_benchmarks", { user_id: session.user.id, wod: { ...activeTimer, isBenchmark: true }, name: benchmark.name, metrics: benchmark.metrics });
      if (Array.isArray(bm) && bm[0]) await sb.insert(session.token, "benchmark_results", { user_id: session.user.id, benchmark_id: bm[0].id, results: {}, date: new Date().toISOString(), notes });
    }
    await loadAll(session.token);
    setTab("stats");
  }

  async function addBenchmarkResult(bmId, data) { await sb.insert(session.token, "benchmark_results", { user_id: session.user.id, benchmark_id: bmId, ...data }); await loadAll(session.token); }

  async function toggleFavorite(wodData) {
    const existing = favorites.find(f => f.wod?.generatedAt === wodData.generatedAt && f.wod?.templateLabel === wodData.templateLabel);
    if (existing) { await sb.delete(session.token, "wod_favorites", existing.id); }
    else { await sb.insert(session.token, "wod_favorites", { user_id: session.user.id, wod: wodData }); }
    await loadAll(session.token);
  }

  const isFav = wod ? favorites.some(f => f.wod?.generatedAt === wod.generatedAt && f.wod?.templateLabel === wod.templateLabel) : false;

  const bottomTabs = [
    { id: "generate", icon: "⚡", label: "Generar" },
    { id: "calendar", icon: "📅", label: "Calendario" },
    { id: "stats",    icon: "📊", label: "Stats" },
  ];

  if (!session) return <AuthScreen onAuth={handleAuth} />;
  if (activeTimer && !showResult) return <TimerScreen wod={activeTimer} onFinish={secs => { setElapsedSecs(secs); setShowResult(true); }} onCancel={() => { setActiveTimer(null); setElapsedSecs(null); }} />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: "#fff", display: "flex", flexDirection: "column" }}>
      <style>{`@import url('${FONT}');*{box-sizing:border-box;margin:0;padding:0;}input,select,textarea,button{font-family:'DM Sans',sans-serif;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#2a2a3e;border-radius:2px;}input[type=range]{-webkit-appearance:none;height:3px;border-radius:2px;background:#2a2a3e;outline:none;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${C.flamingo};cursor:pointer;}select option{background:#0d0d1a;}`}</style>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} tab={tab} setTab={setTab} onLogout={handleLogout} userName={session.user.email?.split("@")[0]?.toUpperCase()} />

      {/* HEADER */}
      <div style={{ background: "#000", borderBottom: `1px solid ${C.border}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4, padding: 4 }}>
          <div style={{ width: 22, height: 2, background: "#fff", borderRadius: 2 }} />
          <div style={{ width: 22, height: 2, background: "#fff", borderRadius: 2 }} />
          <div style={{ width: 22, height: 2, background: "#fff", borderRadius: 2 }} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: 4, color: C.flamingo }}>FLAMINGO WOD</span>
          <span style={{ fontSize: 20 }}>🦩</span>
        </div>
        <div style={{ width: 30 }} />
      </div>

      {/* CONTENT */}
      <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: "16px 13px 90px", maxWidth: 600, margin: "0 auto", width: "100%" }}>

        {tab === "generate" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, letterSpacing: 3, lineHeight: 1.05, marginBottom: 4 }}>GENERA TU<br /><span style={{ color: C.flamingo }}>PROXIMO WOD</span></div>
              <div style={{ color: "#444", fontSize: 11 }}>🦩 Open · Semifinals · CrossFit Games · Rogue</div>
            </div>
            <GeneratorWizard onGenerate={cfg => { setLastCfg(cfg); setWod(generateWOD(cfg)); setTab("wod"); ref.current?.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </div>
        )}

        {tab === "wod" && (
          !wod ? <Placeholder icon="⚡" text="Genera un WOD primero" /> : (
            <div>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, letterSpacing: 3, marginBottom: 12 }}>TU <span style={{ color: C.flamingo }}>WOD</span></div>
              <div style={{ background: C.card, border: `1px solid ${C.flamingo}30`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ background: `linear-gradient(135deg,${C.flamingo}18 0%,#0d0d1a 60%)`, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 5, marginBottom: 6, flexWrap: "wrap" }}><Tag color={C.flamingo}>{wod.type}</Tag></div>
                      <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, color: "#fff", letterSpacing: 2 }}>{wod.templateLabel}</div>
                      {wod.ref && <div style={{ color: "#444", fontSize: 10, fontStyle: "italic" }}>Ref: {wod.ref}</div>}
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 10 }}>
                      <div style={{ color: C.flamingo, fontFamily: "'Bebas Neue',cursive", fontSize: 30, lineHeight: 1 }}>{wod.totalTime}</div>
                      <div style={{ color: "#444", fontSize: 8, letterSpacing: 1 }}>MIN</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "8px 14px" }}>{wod.blocks?.map((b, i) => <BlockCard key={i} block={b} color={C.flamingo} />)}</div>
                <div style={{ padding: "8px 14px 14px", display: "flex", gap: 6 }}>
                  <button onClick={() => setActiveTimer(wod)} style={{ flex: 2, padding: "11px 0", background: `linear-gradient(90deg,${C.flamingo},#FF2D7A)`, border: "none", borderRadius: 8, fontFamily: "'Bebas Neue',cursive", fontSize: 15, color: "#fff", letterSpacing: 2, cursor: "pointer" }}>EMPEZAR</button>
                  <button onClick={() => toggleFavorite(wod)} style={{ padding: "11px 11px", background: isFav ? C.flamingo+"20" : "#13131f", color: isFav ? C.flamingo : "#666", border: `1px solid ${isFav ? C.flamingo : C.border}`, borderRadius: 8, fontSize: 15, cursor: "pointer" }}>🦩</button>
                  <button onClick={() => setShowSchedule(true)} style={{ padding: "11px 11px", background: "#13131f", color: "#888", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, cursor: "pointer" }}>📅</button>
                  <button onClick={() => lastCfg && setWod(generateWOD(lastCfg))} style={{ padding: "11px 11px", background: "#13131f", color: "#888", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, cursor: "pointer" }}>↺</button>
                  <button onClick={() => { setWod(null); setTab("generate"); }} style={{ padding: "11px 10px", background: "#13131f", color: C.muted, border: `1px solid ${C.bg}`, borderRadius: 8, fontSize: 11, cursor: "pointer" }}>X</button>
                </div>
              </div>
            </div>
          )
        )}

        {tab === "calendar" && <CalendarView calendarWods={calendarWods} onStartWod={w => setActiveTimer(w)} onAddWodToDay={date => { if (wod) { setShowSchedule(true); } else { setTab("generate"); } }} onDeleteWod={async id => { await sb.delete(session.token, "wod_calendar", id); await loadAll(session.token); }} />}
        {tab === "stats"    && <StatsView history={history} loading={loadingH} />}
        {tab === "manual"   && <ManualWODView onSchedule={scheduleWod} onDo={w => { setWod(w); setTab("wod"); }} calendarWods={calendarWods} />}
        {tab === "favorites"&& <FavoritesView favorites={favorites} loading={loadingF} onLoad={w => { setWod(w); setTab("wod"); }} onDelete={async id => { await sb.delete(session.token, "wod_favorites", id); await loadAll(session.token); }} />}
        {tab === "benchmarks"&&<BenchmarksView benchmarks={benchmarks} benchmarkResults={benchmarkResults} loading={loadingB} onAddResult={addBenchmarkResult} onDelete={async id => { await sb.delete(session.token, "wod_benchmarks", id); await loadAll(session.token); }} />}
        {tab === "history"  && <HistoryView history={history} loading={loadingH} />}
      </div>

      {/* BOTTOM NAV — solo 3 tabs */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#000", borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100 }}>
        {bottomTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 0 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, borderTop: `2px solid ${tab === t.id ? C.flamingo : "transparent"}` }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: tab === t.id ? C.flamingo : "#444" }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {showSchedule && wod && <ScheduleModal wod={wod} onSchedule={async (date, w) => { await scheduleWod(date, w); setShowSchedule(false); }} onClose={() => setShowSchedule(false)} calendarWods={calendarWods} />}
      {showResult && activeTimer && <ResultModal wod={activeTimer} elapsedSecs={elapsedSecs} onSave={saveEntry} onClose={() => { setShowResult(false); setActiveTimer(null); setElapsedSecs(null); }} />}
    </div>
  );
}
