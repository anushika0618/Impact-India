import React, { useState, useEffect, useMemo } from "react";
import {
  Trash2, AlertTriangle, Flame, Droplets, Wind, Lightbulb, Construction,
  HelpCircle, MapPin, Camera, CheckCircle2, Clock, Users, TrendingUp,
  Award, Bell, ChevronRight, ChevronLeft, ChevronDown, X, Filter, ArrowUpDown,
  Sparkles, Shield, User, Plus, Upload, ThumbsUp, ThumbsDown, LayoutGrid,
  Gauge, Leaf, BarChart3, Map as MapIcon, ClipboardCheck, UserCog, Layers,
  Radio, Compass, Rocket, Target, Handshake, Building2, GraduationCap,
  Sprout, RefreshCcw, ClipboardList, ArrowRight, Megaphone, Check, Image as ImageIcon,
  Loader2, Eye
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

/* ============================================================
   DESIGN TOKENS — "civic instrument panel": forest green + paper,
   red/amber/green reserved strictly for severity/priority signal.
   ============================================================ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.ii-app{
  --forest:#163828; --forest-light:#1F4D3A; --forest-dim:#0F281D;
  --paper:#F4F6EF; --paper-dim:#E9ECE0; --paper-deep:#DCE1CE;
  --ink:#161F1A; --slate:#5C685F; --slate-light:#8A9389; --line:#CBD1C1; --line-dark:#3A4A40;
  --red:#C4432B; --red-dim:#F3DCD5;
  --amber:#C97A1E; --amber-dim:#F3E3C8;
  --green:#3F7D4E; --green-dim:#DCE9DD;
  --white:#FFFFFF;
  font-family:'IBM Plex Sans',sans-serif; color:var(--ink); background:var(--paper); min-height:100vh;
}
.ii-display{ font-family:'Barlow Condensed',sans-serif; letter-spacing:0.01em; }
.ii-mono{ font-family:'IBM Plex Mono',monospace; }
.ii-eyebrow{ font-family:'IBM Plex Mono',monospace; letter-spacing:0.12em; text-transform:uppercase; font-size:11px; }
.ii-plaque{ background:var(--forest); color:var(--paper); }
.ii-card{ background:var(--white); border:1px solid var(--line); }
.ii-hairline{ border-color:var(--line); }
.ii-btn-primary{ background:var(--forest); color:var(--white); }
.ii-btn-primary:hover{ background:var(--forest-light); }
.ii-btn-outline{ background:transparent; border:1px solid var(--forest); color:var(--forest); }
.ii-btn-outline:hover{ background:var(--forest); color:var(--white); }
.ii-btn-white{ background:var(--white); color:var(--forest); }
.ii-btn-white:hover{ background:var(--paper-dim); }
.ii-btn-outline-invert{ background:transparent; border:1px solid var(--white); color:var(--white); }
.ii-btn-outline-invert:hover{ background:var(--white); color:var(--forest); }
.ii-btn-ghost:hover{ background:var(--paper-dim); }
.ii-tab-active{ background:var(--forest); color:var(--white); }
.ii-tab-inactive{ color:var(--slate); }
.ii-tab-inactive:hover{ background:var(--paper-dim); }
.ii-scrollbar::-webkit-scrollbar{ height:6px; width:6px; }
.ii-scrollbar::-webkit-scrollbar-thumb{ background:var(--line); border-radius:4px; }
.ii-rail-track{ background:var(--line); }
.ii-rail-fill{ background:var(--forest); }
.ii-pulse{ animation:ii-pulse 1.8s ease-in-out infinite; }
@keyframes ii-pulse{ 0%,100%{opacity:1;} 50%{opacity:0.7;} }
.ii-spin{ animation:ii-spin 1s linear infinite; }
@keyframes ii-spin{ from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
.ii-fadein{ animation:ii-fadein 0.3s ease both; }
@keyframes ii-fadein{ from{opacity:0; transform:translateY(4px);} to{opacity:1; transform:translateY(0);} }
.ii-map-grid{ background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 28px 28px; background-color: var(--paper-dim); }
.ii-hero{ background: radial-gradient(circle at 15% 20%, rgba(251,251,247,0.06), transparent 45%), var(--forest); }
`;

/* ============================================================
   DOMAIN DATA
   ============================================================ */
const CATEGORIES = [
  { id: "waste", label: "Garbage / Waste", short: "Waste", icon: Trash2, keywords: ["garbage", "waste", "trash", "rubbish", "bin"] },
  { id: "dumping", label: "Illegal Dumping", short: "Dumping", icon: AlertTriangle, keywords: ["illegal dump", "dumping", "debris", "construction waste"] },
  { id: "burning", label: "Open Waste Burning", short: "Burning", icon: Flame, keywords: ["burning", "fire", "smoke", "burnt"] },
  { id: "waterlogging", label: "Waterlogging", short: "Waterlogging", icon: Droplets, keywords: ["waterlog", "flood", "drain", "stagnant"] },
  { id: "pollution", label: "Pollution", short: "Pollution", icon: Wind, keywords: ["pollut", "stink", "smell", "dirty park"] },
  { id: "streetlight", label: "Broken Streetlight", short: "Streetlight", icon: Lightbulb, keywords: ["streetlight", "street light", "lamp", "dark street"] },
  { id: "pothole", label: "Pothole / Road Damage", short: "Pothole", icon: Construction, keywords: ["pothole", "road damage", "crack", "broken road"] },
  { id: "other", label: "Other", short: "Other", icon: HelpCircle, keywords: [] },
];
const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
const ENVIRO_IMPACT = { waste: 90, dumping: 85, burning: 95, waterlogging: 80, pollution: 75, streetlight: 20, pothole: 15, other: 40 };
const DEPT_MAP = { waste: "Municipal Waste Management", dumping: "Municipal Waste Management", burning: "Environment Dept.", waterlogging: "Water & Drainage Dept.", pollution: "Environment Dept.", streetlight: "Electrical Dept.", pothole: "PWD (Roads)", other: "General Administration" };

const STATUS_STEPS = ["REPORTED", "COMMUNITY CONFIRMED", "AUTHORITY ASSIGNED", "COMMUNITY ACTION", "RESOLVED", "CITIZEN VERIFIED"];
const STATUS_SHORT = { "REPORTED": "Reported", "COMMUNITY CONFIRMED": "Confirmed", "AUTHORITY ASSIGNED": "Assigned", "COMMUNITY ACTION": "Action", "RESOLVED": "Resolved", "CITIZEN VERIFIED": "Verified" };

const OFFICERS = ["R. Kumar — Sanitation Dept.", "A. Singh — PWD (Roads)", "M. Toppo — Electrical Dept.", "S. Devi — Sanitation Dept.", "P. Mahato — Water & Drainage"];
const NGOS = ["Clean Jharkhand Initiative", "Jharkhand Green Circle", "Ranchi Youth Collective"];

const AREAS = [
  { area: "Kanke Road, Ranchi", x: 34, y: 28, sensitive: true, note: "Near govt. school" },
  { area: "Harmu Housing Colony, Ranchi", x: 58, y: 44, sensitive: false, note: "" },
  { area: "Lalpur Chowk, Ranchi", x: 46, y: 60, sensitive: true, note: "Near main market" },
  { area: "Bariatu, Ranchi", x: 22, y: 52, sensitive: false, note: "" },
  { area: "Circular Road, Ranchi", x: 66, y: 24, sensitive: true, note: "Near hospital" },
  { area: "Doranda, Ranchi", x: 40, y: 76, sensitive: false, note: "" },
  { area: "Hinoo, Ranchi", x: 72, y: 58, sensitive: false, note: "" },
];

function computePriority({ severity, affected, confirmations, ageDays, category }) {
  const sevScore = { HIGH: 100, MEDIUM: 60, LOW: 30 }[severity] ?? 30;
  const affScore = Math.min(100, Math.round(affected * 0.5));
  const confScore = Math.min(100, confirmations * 4);
  const ageScore = Math.min(100, ageDays * 18);
  const enviroScore = ENVIRO_IMPACT[category?.id] ?? 40;
  const total = Math.min(100, Math.round(sevScore * 0.30 + affScore * 0.25 + confScore * 0.20 + ageScore * 0.15 + enviroScore * 0.10));
  return { total, breakdown: { severity: sevScore, affected: affScore, confirmations: confScore, age: ageScore, environmental: enviroScore } };
}
function severityTone(sev) { return sev === "HIGH" ? "red" : sev === "MEDIUM" ? "amber" : "green"; }
function priorityTone(score) { return score >= 75 ? "red" : score >= 45 ? "amber" : "green"; }
function enviroLabel(catId) { const s = ENVIRO_IMPACT[catId] ?? 40; return s >= 80 ? "High" : s >= 50 ? "Medium" : "Low"; }

let ISSUE_SEQ = 1049;
function makeIssue(partial) {
  ISSUE_SEQ += 1;
  const areaMeta = AREAS.find((a) => a.area === partial.area) || AREAS[0];
  return {
    id: `IMP-${ISSUE_SEQ}`, reporter: partial.reporter || "Vaidehi Yadav", reports: 1, confirmations: 0,
    status: "REPORTED", assignedOfficer: null, linkedActionId: null,
    resolutionEvidence: false, resolutionNotes: "", citizenVerification: null, confirmedByUser: false,
    locationSensitive: areaMeta.sensitive, x: areaMeta.x, y: areaMeta.y, createdLabel: "Just now",
    recommendedDept: DEPT_MAP[partial.category?.id] || "General Administration",
    ...partial,
  };
}

const SEED_ISSUES = [
  makeIssue({ id: "IMP-1042", title: "Garbage accumulation near school entrance", description: "Large amount of garbage has accumulated near the school entrance on Kanke Road, growing for several days and attracting stray animals.", category: catById("waste"), area: "Kanke Road, Ranchi", severity: "HIGH", aiConfidence: 94, affected: 180, reports: 7, confirmations: 23, ageDays: 5, status: "COMMUNITY ACTION", assignedOfficer: OFFICERS[0], linkedActionId: "ACT-1", createdLabel: "5 days ago" }),
  makeIssue({ title: "Illegal dumping of construction debris", description: "A contractor has dumped construction debris on the roadside near the residential colony, narrowing the lane.", category: catById("dumping"), area: "Lalpur Chowk, Ranchi", severity: "HIGH", aiConfidence: 88, affected: 64, reports: 11, confirmations: 9, ageDays: 3, status: "COMMUNITY CONFIRMED", createdLabel: "3 days ago" }),
  makeIssue({ title: "Broken streetlights near market, unsafe at night", description: "Several streetlights near the market have stopped working, making the stretch unsafe for pedestrians after dark.", category: catById("streetlight"), area: "Circular Road, Ranchi", severity: "MEDIUM", aiConfidence: 85, affected: 35, reports: 6, confirmations: 5, ageDays: 9, status: "AUTHORITY ASSIGNED", assignedOfficer: OFFICERS[2], createdLabel: "9 days ago" }),
  makeIssue({ title: "Minor pothole forming on service lane", description: "Small pothole developing near the drain cover, not yet a major hazard.", category: catById("pothole"), area: "Bariatu, Ranchi", severity: "LOW", aiConfidence: 76, affected: 8, reports: 2, confirmations: 1, ageDays: 2, status: "REPORTED", createdLabel: "2 days ago" }),
  makeIssue({ title: "Waterlogging outside residential colony after rainfall", description: "Stagnant water has been collecting for days after the drain blockage, creating a mosquito breeding risk.", category: catById("waterlogging"), area: "Harmu Housing Colony, Ranchi", severity: "HIGH", aiConfidence: 90, affected: 96, reports: 9, confirmations: 12, ageDays: 4, status: "COMMUNITY ACTION", linkedActionId: "ACT-2", createdLabel: "4 days ago" }),
  makeIssue({ title: "Open burning of plastic waste near community park", description: "Residents burning plastic and household waste openly every evening near the community park, causing smoke.", category: catById("burning"), area: "Doranda, Ranchi", severity: "HIGH", aiConfidence: 89, affected: 58, reports: 5, confirmations: 4, ageDays: 2, status: "COMMUNITY CONFIRMED", createdLabel: "2 days ago" }),
  makeIssue({ title: "Public park littered and polluted", description: "The neighbourhood park is littered with plastic bottles and wrappers and smells of stagnant water.", category: catById("pollution"), area: "Hinoo, Ranchi", severity: "MEDIUM", aiConfidence: 80, affected: 40, reports: 4, confirmations: 3, ageDays: 8, status: "RESOLVED", assignedOfficer: OFFICERS[3], resolutionEvidence: true, resolutionNotes: "Park cleaned and litter bins installed by sanitation team.", citizenVerification: null, createdLabel: "8 days ago" }),
  makeIssue({ title: "Deep pothole causing accidents on main road", description: "A deep pothole on the main road has caused several two-wheelers to skid, especially at night.", category: catById("pothole"), area: "Circular Road, Ranchi", severity: "HIGH", aiConfidence: 93, affected: 95, reports: 15, confirmations: 12, ageDays: 7, status: "CITIZEN VERIFIED", assignedOfficer: OFFICERS[1], resolutionEvidence: true, resolutionNotes: "Pothole filled and re-tarred by PWD.", citizenVerification: "yes", createdLabel: "7 days ago" }),
];

const SEED_ACTIONS = [
  { id: "ACT-1", title: "School Area Cleanup", issueId: "IMP-1042", ngo: NGOS[0], volunteersNeeded: 8, volunteers: ["Aman", "Priya", "Rohit", "Sneha", "Kabir"], status: "In Progress", beforePhoto: true, afterPhoto: false, distanceKm: 0.8, estimatedImpact: 180 },
  { id: "ACT-2", title: "Community Storm Drain Clearing", issueId: null, ngo: NGOS[1], volunteersNeeded: 10, volunteers: ["Meera", "Arjun", "Divya", "Kabir", "Sneha", "Rohit", "Aman", "Priya", "Farhan", "Isha"], status: "Completed", beforePhoto: true, afterPhoto: true, distanceKm: 2.1, estimatedImpact: 96 },
  { id: "ACT-3", title: "Neighbourhood Tree Plantation Drive", issueId: null, ngo: NGOS[0], volunteersNeeded: 15, volunteers: ["Isha", "Farhan", "Meera", "Arjun", "Divya", "Kabir"], status: "Upcoming", beforePhoto: false, afterPhoto: false, distanceKm: 1.4, estimatedImpact: 220 },
];

const BADGES = [
  { icon: "🏆", label: "Civic Contributor" },
  { icon: "🌱", label: "Clean City Champion" },
  { icon: "🤝", label: "Community Builder" },
  { icon: "🔎", label: "Sharp Eye — 10 verified reports" },
];

const SEED_LEDGER = [
  { label: "Verified resolution — Deep pothole, Circular Road", points: 5, when: "Yesterday" },
  { label: "Confirmed community issue — Streetlight, Circular Road", points: 5, when: "2 days ago" },
  { label: "Report accepted — Garbage near school (#IMP-1042)", points: 10, when: "5 days ago" },
  { label: "Joined community action — Storm Drain Clearing", points: 15, when: "6 days ago" },
  { label: "Completed verified community action", points: 25, when: "6 days ago" },
];

const SEED_NOTIFICATIONS_INIT = [
  { icon: UserCog, tone: "amber", title: "Issue assigned", body: "Your issue #IMP-1042 has been assigned to R. Kumar — Sanitation Dept.", when: "3d ago" },
  { icon: CheckCircle2, tone: "green", title: "Authority marked resolved", body: "Authority marked 'Public park littered and polluted' as resolved. Please verify.", when: "1d ago" },
  { icon: Megaphone, tone: "forest", title: "Volunteers needed", body: "A civic issue near you needs volunteers — School Area Cleanup.", when: "2d ago" },
  { icon: ThumbsUp, tone: "forest", title: "Confirmation milestone", body: "Your community issue #IMP-1042 reached 20+ confirmations.", when: "4d ago" },
  { icon: Award, tone: "green", title: "Impact Points earned", body: "Your civic action earned +25 Impact Points.", when: "6d ago" },
];

const ANALYTICS_MONTHLY = [
  { month: "Mar", resolved: 58 }, { month: "Apr", resolved: 74 }, { month: "May", resolved: 81 },
  { month: "Jun", resolved: 96 }, { month: "Jul", resolved: 112 }, { month: "Aug", resolved: 130 },
];
const PIE_COLORS = ["#163828", "#3F7D4E", "#C97A1E", "#C4432B", "#8A9389", "#5C685F", "#1F4D3A", "#5B7A63"];

/* ============================================================
   SMALL UI PRIMITIVES
   ============================================================ */
function Tone({ tone, children, className = "" }) {
  const map = {
    red: { bg: "var(--red-dim)", fg: "var(--red)" }, amber: { bg: "var(--amber-dim)", fg: "var(--amber)" },
    green: { bg: "var(--green-dim)", fg: "var(--green)" }, forest: { bg: "var(--paper-dim)", fg: "var(--forest)" },
  }[tone] || { bg: "var(--paper-dim)", fg: "var(--slate)" };
  return <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ii-eyebrow whitespace-nowrap ${className}`} style={{ background: map.bg, color: map.fg }}>{children}</span>;
}
function SeverityDot({ severity }) {
  const tone = severityTone(severity);
  const color = tone === "red" ? "var(--red)" : tone === "amber" ? "var(--amber)" : "var(--green)";
  return <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: color }} /><span className="ii-eyebrow" style={{ color }}>{severity}</span></span>;
}
function ImpactGauge({ score, size = 108, label = "IMPACT SCORE" }) {
  const tone = priorityTone(score);
  const color = tone === "red" ? "var(--red)" : tone === "amber" ? "var(--amber)" : "var(--green)";
  const r = size / 2 - 10, cx = size / 2, cy = size / 2;
  const circumference = Math.PI * r;
  const filled = (Math.min(100, score) / 100) * circumference;
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        <path d={d} fill="none" stroke="var(--line)" strokeWidth="9" strokeLinecap="round" />
        <path d={d} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${filled} ${circumference}`} />
        <text x={cx} y={cy - 2} textAnchor="middle" className="ii-display" style={{ fontSize: size * 0.30, fontWeight: 700, fill: "var(--ink)" }}>{score}</text>
      </svg>
      {label && <div className="ii-eyebrow text-center" style={{ color: "var(--slate)", marginTop: -6 }}>{label}</div>}
    </div>
  );
}
function ResolutionRail({ status }) {
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div className="w-full">
      <div className="relative flex items-center" style={{ height: 26 }}>
        <div className="absolute left-0 right-0 h-[3px] ii-rail-track" style={{ top: 11 }} />
        <div className="absolute left-0 h-[3px] ii-rail-fill" style={{ top: 11, width: `${(idx / (STATUS_STEPS.length - 1)) * 100}%`, transition: "width .4s ease" }} />
        {STATUS_STEPS.map((s, i) => {
          const done = i <= idx, current = i === idx;
          return (
            <div key={s} className="relative z-10 flex-1 flex justify-center">
              <div className={`rounded-full ${current ? "ii-pulse" : ""}`} style={{ width: current ? 16 : 12, height: current ? 16 : 12, background: done ? "var(--forest)" : "var(--white)", border: `2px solid ${done ? "var(--forest)" : "var(--line)"}` }} />
            </div>
          );
        })}
      </div>
      <div className="flex">
        {STATUS_STEPS.map((s, i) => (
          <div key={s} className="flex-1 text-center px-0.5">
            <div className="ii-eyebrow leading-tight" style={{ fontSize: 9.5, color: i <= idx ? "var(--forest)" : "var(--slate-light)" }}>{STATUS_SHORT[s]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function Btn({ children, onClick, variant = "primary", className = "", icon: Icon, disabled, small }) {
  const base = variant === "primary" ? "ii-btn-primary" : variant === "outline" ? "ii-btn-outline" : variant === "white" ? "ii-btn-white" : variant === "outline-invert" ? "ii-btn-outline-invert" : "ii-btn-ghost";
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${base} inline-flex items-center justify-center gap-1.5 rounded font-semibold ii-display uppercase tracking-wide transition-colors ${small ? "px-3 py-1.5 text-[13px]" : "px-4 py-2.5 text-[14px]"} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${className}`}>
      {Icon && <Icon size={small ? 14 : 16} />}{children}
    </button>
  );
}
function CategoryIcon({ category, size = 16, color }) { const Icon = category.icon; return <Icon size={size} style={{ color: color || "var(--forest)" }} />; }
function StatBlock({ label, value }) { return <div className="rounded-md p-3" style={{ background: "var(--paper-dim)" }}><div className="ii-mono font-semibold" style={{ fontSize: 22 }}>{value}</div><div className="ii-eyebrow" style={{ color: "var(--slate)" }}>{label}</div></div>; }
function MetricTile({ label, value, icon: Icon, tone, suffix }) {
  const color = tone === "amber" ? "var(--amber)" : tone === "green" ? "var(--green)" : "var(--forest)";
  return <div className="ii-card rounded-lg p-4"><div className="flex items-center justify-between"><div className="ii-eyebrow" style={{ color: "var(--slate)" }}>{label}</div><Icon size={15} style={{ color }} /></div><div className="ii-mono font-bold mt-1" style={{ fontSize: 26, color: "var(--ink)" }}>{typeof value === "number" ? value.toLocaleString() : value}{suffix || ""}</div></div>;
}
function RowStat({ label, value }) { return <div className="flex items-center justify-between text-[13px] py-1.5 border-b ii-hairline last:border-0"><span style={{ color: "var(--slate)" }}>{label}</span><span className="font-medium text-right ml-3">{value}</span></div>; }
function Avatar({ name }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return <div className="w-7 h-7 rounded-full flex items-center justify-center ii-mono text-[11px] font-semibold shrink-0" style={{ background: "var(--paper-deep)", color: "var(--forest)" }}>{initials}</div>;
}

/* ============================================================
   ISSUE / ACTION CARDS
   ============================================================ */
function IssueCard({ issue, onClick, onConfirm, showConfirm }) {
  const p = computePriority(issue);
  return (
    <div className="ii-card rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ii-fadein" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-md flex items-center justify-center" style={{ background: "var(--paper-dim)" }}><CategoryIcon category={issue.category} size={18} /></div>
          <div className="min-w-0">
            <div className="ii-eyebrow" style={{ color: "var(--slate-light)" }}>{issue.id} · {issue.reports > 1 ? `${issue.reports} reports clustered` : "1 report"}</div>
            <div className="font-semibold text-[15px] truncate mt-0.5" style={{ color: "var(--ink)" }}>{issue.title}</div>
            <div className="ii-eyebrow mt-1 flex items-center gap-1" style={{ color: "var(--slate)" }}><MapPin size={11} />{issue.area}</div>
          </div>
        </div>
        <div className="shrink-0 text-right"><div className="ii-mono font-semibold" style={{ fontSize: 20, color: "var(--ink)" }}>{p.total}</div><div className="ii-eyebrow" style={{ color: "var(--slate-light)" }}>IMPACT</div></div>
      </div>
      <div className="flex items-center flex-wrap gap-2 mt-3">
        <SeverityDot severity={issue.severity} /><span className="text-slate-300">·</span>
        <span className="ii-eyebrow flex items-center gap-1" style={{ color: "var(--slate)" }}><Users size={11} />{issue.affected} affected</span><span className="text-slate-300">·</span>
        <span className="ii-eyebrow flex items-center gap-1" style={{ color: "var(--slate)" }}><Clock size={11} />{issue.createdLabel}</span><span className="text-slate-300">·</span>
        <Tone tone="forest">{STATUS_SHORT[issue.status]}</Tone>
      </div>
      {showConfirm && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t ii-hairline">
          <div className="ii-eyebrow flex items-center gap-1" style={{ color: "var(--slate)" }}><ThumbsUp size={12} />{issue.confirmations} confirmations</div>
          <Btn variant="outline" small icon={ThumbsUp} disabled={issue.confirmedByUser} onClick={(e) => { e.stopPropagation(); onConfirm(issue.id); }}>{issue.confirmedByUser ? "Confirmed ✓" : "Confirm Issue"}</Btn>
        </div>
      )}
    </div>
  );
}

function ActionCard({ action, issue, onClick }) {
  const toneMap = { "Upcoming": "amber", "In Progress": "forest", "Completed": "green" };
  return (
    <div className="ii-card rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ii-fadein" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="ii-eyebrow flex items-center gap-1" style={{ color: "var(--slate-light)" }}><Sprout size={11} />{action.ngo}</div>
          <div className="font-semibold text-[15px] mt-0.5">{action.title}</div>
          {issue && <div className="ii-eyebrow mt-1" style={{ color: "var(--slate)" }}>Linked to {issue.id} — {issue.title}</div>}
        </div>
        <Tone tone={toneMap[action.status]}>{action.status}</Tone>
      </div>
      <div className="flex items-center gap-2 flex-wrap mt-3">
        <span className="ii-eyebrow flex items-center gap-1" style={{ color: "var(--slate)" }}><Users size={11} />{action.volunteers.length}/{action.volunteersNeeded} volunteers</span><span className="text-slate-300">·</span>
        <span className="ii-eyebrow flex items-center gap-1" style={{ color: "var(--slate)" }}><MapPin size={11} />{action.distanceKm} km away</span><span className="text-slate-300">·</span>
        <span className="ii-eyebrow flex items-center gap-1" style={{ color: "var(--slate)" }}><Target size={11} />~{action.estimatedImpact} citizens</span>
      </div>
      <div className="h-1.5 rounded-full ii-rail-track mt-3"><div className="h-1.5 rounded-full ii-rail-fill" style={{ width: `${Math.min(100, (action.volunteers.length / action.volunteersNeeded) * 100)}%` }} /></div>
    </div>
  );
}

/* ============================================================
   MINI MAP (shared)
   ============================================================ */
function MiniMap({ issues, onOpen, compact }) {
  const color = (sev) => sev === "HIGH" ? "var(--red)" : sev === "MEDIUM" ? "var(--amber)" : "var(--green)";
  return (
    <div className="relative rounded-md overflow-hidden ii-map-grid" style={{ height: compact ? 180 : 420 }}>
      <div className="absolute inset-0 opacity-60">
        <div className="absolute" style={{ left: "10%", top: "15%", width: "80%", height: 2, background: "var(--line-dark)", opacity: 0.25 }} />
        <div className="absolute" style={{ left: "50%", top: "5%", width: 2, height: "90%", background: "var(--line-dark)", opacity: 0.25 }} />
      </div>
      {issues.map((issue) => (
        <button key={issue.id} onClick={() => onOpen && onOpen(issue)} className="absolute rounded-full ii-pulse" title={issue.title}
          style={{ left: `${issue.x}%`, top: `${issue.y}%`, width: 12, height: 12, background: color(issue.severity), border: "2px solid var(--white)", transform: "translate(-50%,-50%)" }} />
      ))}
      <div className="absolute bottom-2 left-2 ii-eyebrow px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.9)", color: "var(--slate)" }}>RANCHI DISTRICT — MOCK MAP</div>
    </div>
  );
}

/* ============================================================
   TOP CHROME
   ============================================================ */
const ROLE_META = {
  citizen: { icon: User, label: "Citizen" }, volunteer: { icon: Sprout, label: "Volunteer" },
  authority: { icon: Shield, label: "Authority" }, ngo: { icon: Building2, label: "NGO / Org" },
};
function TopBar({ role, setRole, userName, onOpenNotif, onGoLanding }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const RM = ROLE_META[role];
  return (
    <div className="ii-plaque sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <button onClick={onGoLanding} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}><Leaf size={18} /></div>
          <div className="text-left">
            <div className="ii-display font-bold uppercase tracking-wide" style={{ fontSize: 20, lineHeight: 1 }}>Impact India</div>
            <div className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>TTS25-08 · GOVT. OF JHARKHAND</div>
          </div>
        </button>
        <div className="flex items-center gap-3">
          {(role === "citizen" || role === "volunteer") && (
            <button onClick={onOpenNotif} className="w-9 h-9 rounded-full flex items-center justify-center relative" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Bell size={16} /><span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: "var(--amber)" }} />
            </button>
          )}
          <div className="relative">
            <button onClick={() => setMenuOpen((s) => !s)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--paper)" }}><RM.icon size={13} style={{ color: "var(--forest)" }} /></div>
              <span className="ii-eyebrow">DEMO ROLE: {RM.label.toUpperCase()}</span>
              <ChevronDown size={13} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg overflow-hidden ii-fadein" style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
                {Object.entries(ROLE_META).map(([key, m]) => (
                  <button key={key} onClick={() => { setRole(key); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium hover:opacity-100"
                    style={{ color: role === key ? "var(--forest)" : "var(--ink)", background: role === key ? "var(--paper-dim)" : "transparent" }}>
                    <m.icon size={15} />{m.label}{role === key && <Check size={13} className="ml-auto" />}
                  </button>
                ))}
                <div className="border-t ii-hairline my-1" />
                <div className="px-3.5 py-2">
                  <div className="ii-eyebrow mb-1.5" style={{ color: "var(--slate)" }}>CURRENT CONTRIBUTOR</div>
                  <div className="text-[13px] font-semibold truncate" style={{ color: "var(--forest)" }}>{userName}</div>
                  <div className="text-[11px] mt-1" style={{ color: "var(--slate)" }}>Change it from Profile → Edit Name</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function TabRow({ tabs, active, setActive }) {
  return (
    <div className="max-w-6xl mx-auto px-5 pt-4">
      <div className="flex gap-1 ii-card rounded-lg p-1 w-fit ii-scrollbar overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md ii-display uppercase text-[13px] tracking-wide whitespace-nowrap transition-colors ${active === t.id ? "ii-tab-active" : "ii-tab-inactive"}`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   LANDING PAGE
   ============================================================ */
const PROCESS_STEPS = [
  { icon: Compass, label: "Discover" }, { icon: Camera, label: "Report" }, { icon: Sparkles, label: "AI Analyze" },
  { icon: Gauge, label: "Prioritize" }, { icon: Rocket, label: "Mobilize" }, { icon: Construction, label: "Resolve" },
  { icon: ClipboardCheck, label: "Verify" }, { icon: TrendingUp, label: "Impact" },
];
function LandingPage({ onEnter }) {
  return (
    <div className="ii-app">
      <style>{GLOBAL_CSS}</style>
      <div className="ii-hero">
        <div className="max-w-5xl mx-auto px-5 pt-16 pb-20 text-center" style={{ color: "var(--paper)" }}>
          <div className="ii-eyebrow inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-6" style={{ background: "rgba(255,255,255,0.12)" }}>
            <Leaf size={12} /> TTS25-08 · GOVT. OF JHARKHAND · CLEAN &amp; GREEN TECHNOLOGY
          </div>
          <div className="ii-display font-bold uppercase" style={{ fontSize: "clamp(40px,7vw,84px)", lineHeight: 0.95 }}>Impact India</div>
          <div className="ii-display font-semibold mt-4" style={{ fontSize: "clamp(20px,3vw,30px)", color: "rgba(255,255,255,0.92)" }}>"Turn Civic Problems Into Civic Action."</div>
          <p className="mt-3 text-[15px]" style={{ color: "rgba(255,255,255,0.7)" }}>Report. Mobilize. Resolve. Verify. Measure Impact.</p>
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <Btn variant="white" icon={Camera} onClick={() => onEnter("citizen", "report")}>
              Report a Civic Issue
            </Btn>
            <Btn variant="outline-invert" icon={Layers} onClick={() => onEnter("citizen", "community")}>
              Explore Community Impact
            </Btn>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-14">
        <div className="ii-display font-bold uppercase text-2xl text-center mb-8">How Impact India Works</div>
        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-6">
          {PROCESS_STEPS.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="flex flex-col items-center w-20">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "var(--paper-dim)", border: "1px solid var(--line)" }}><s.icon size={18} style={{ color: "var(--forest)" }} /></div>
                <div className="ii-eyebrow mt-2 text-center" style={{ color: "var(--slate)" }}>{s.label}</div>
              </div>
              {i < PROCESS_STEPS.length - 1 && <ArrowRight size={16} className="hidden sm:block mb-6" style={{ color: "var(--line-dark)" }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["18,420+", "Citizens Benefited"], ["1,248", "Issues Resolved"], ["3,840", "Community Actions"], ["78%", "Resolution Rate"]].map(([v, l]) => (
            <div key={l} className="ii-card rounded-lg p-5 text-center">
              <div className="ii-mono font-bold" style={{ fontSize: 30, color: "var(--forest)" }}>{v}</div>
              <div className="ii-eyebrow mt-1" style={{ color: "var(--slate)" }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="ii-eyebrow text-center mt-6" style={{ color: "var(--slate-light)" }}>Demo prototype with fictional Ranchi, Jharkhand data — not a live government system.</div>
      </div>

      <div className="max-w-5xl mx-auto px-5 pb-16 grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(ROLE_META).map(([key, m]) => (
          <button key={key} onClick={() => onEnter(key)} className="ii-card rounded-lg p-5 text-left hover:shadow-sm transition-shadow">
            <m.icon size={20} style={{ color: "var(--forest)" }} />
            <div className="ii-display font-bold uppercase text-[15px] mt-2">{m.label}</div>
            <div className="text-[13px] mt-1" style={{ color: "var(--slate)" }}>Enter as {m.label.toLowerCase()} →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   AI ANALYSIS ANIMATION
   ============================================================ */
const AI_STAGES = ["Analyzing image...", "Identifying issue...", "Checking nearby reports...", "Estimating impact...", "Calculating priority..."];
function AIAnalysisRunner({ onDone }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (stage >= AI_STAGES.length) { const t = setTimeout(onDone, 400); return () => clearTimeout(t); }
    const t = setTimeout(() => setStage((s) => s + 1), 550);
    return () => clearTimeout(t);
  }, [stage]);
  return (
    <div className="rounded-lg p-5 space-y-2.5" style={{ background: "var(--paper-dim)" }}>
      <div className="ii-eyebrow mb-1 flex items-center gap-1.5" style={{ color: "var(--forest)" }}><Sparkles size={12} />ANALYZING CIVIC ISSUE…</div>
      {AI_STAGES.map((label, i) => (
        <div key={label} className="flex items-center gap-2 text-[13px]" style={{ color: i <= stage ? "var(--ink)" : "var(--slate-light)" }}>
          {i < stage ? <Check size={15} style={{ color: "var(--green)" }} /> : i === stage ? <Loader2 size={15} className="ii-spin" style={{ color: "var(--forest)" }} /> : <span className="w-[15px] h-[15px] rounded-full border" style={{ borderColor: "var(--line)" }} />}
          {label}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   CITIZEN: DASHBOARD
   ============================================================ */
function CitizenDashboard({ userName, civicScore, issues, actions, onOpenIssue, onOpenAction, setTab }) {
  const nearby = [...issues].sort((a, b) => computePriority(b).total - computePriority(a).total).slice(0, 3);
  const recommended = [
    { icon: Sprout, text: `Join a cleanup near your college — ${SEED_ACTIONS[2].title}`, action: () => onOpenAction(actions.find((a) => a.id === "ACT-3")) },
    { icon: Eye, text: "Help verify 2 nearby civic issues", action: () => setTab("community") },
    { icon: Leaf, text: "Community tree plantation drive — 6 volunteers already in", action: () => onOpenAction(actions.find((a) => a.id === "ACT-3")) },
  ];
  return (
    <div className="max-w-6xl mx-auto px-5 py-5 space-y-5">
      <div className="ii-card rounded-lg p-6" style={{ background: "var(--forest)", color: "var(--paper)" }}>
        <div className="ii-display font-bold text-2xl">Good morning, {userName.split(" ")[0]} 👋</div>
        <div className="ii-eyebrow mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>YOUR CIVIC IMPACT</div>
        <div className="ii-mono font-bold" style={{ fontSize: 40 }}>{civicScore} <span className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>IMPACT POINTS</span></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile label="Issues Reported" value={21} icon={Camera} tone="forest" />
        <MetricTile label="Issues Resolved" value={16} icon={CheckCircle2} tone="green" />
        <MetricTile label="Resolutions Verified" value={13} icon={ClipboardCheck} tone="forest" />
        <MetricTile label="Community Actions" value={8} icon={Handshake} tone="amber" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <div className="ii-display font-bold uppercase text-[15px]">Nearby Civic Issues</div>
          {nearby.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onClick={() => onOpenIssue(issue)} />
          ))}
        </div>
        <div className="space-y-3">
          <div className="ii-display font-bold uppercase text-[15px]">Recommended For You</div>
          {recommended.map((r, i) => (
            <button key={i} onClick={r.action} className="ii-card rounded-lg p-4 text-left flex items-start gap-3 w-full hover:shadow-sm transition-shadow">
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: "var(--paper-dim)" }}><r.icon size={15} style={{ color: "var(--forest)" }} /></div>
              <div className="text-[13px] font-medium">{r.text}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CITIZEN: REPORT FLOW
   ============================================================ */
function CitizenReport({ issues, onSubmitNew, onJoinExisting }) {
  const [description, setDescription] = useState("");
  const [area, setArea] = useState(AREAS[0].area);
  const [category, setCategory] = useState("auto");
  const [severityOverride, setSeverityOverride] = useState("auto");
  const [photoName, setPhotoName] = useState(null);
  const [gpsUsed, setGpsUsed] = useState(false);
  const [phase, setPhase] = useState("form"); // form | analyzing | result | submitted
  const [result, setResult] = useState(null);
  const [joined, setJoined] = useState(false);

  const runAnalysis = () => { if (!description.trim()) return; setPhase("analyzing"); };

  const onAnalysisDone = () => {
    const lower = description.toLowerCase();
    const autoCat = CATEGORIES.find((c) => c.keywords.some((k) => lower.includes(k))) || catById("other");
    const cat = category === "auto" ? autoCat : catById(category);
    const confidence = 90 + Math.floor(Math.random() * 7);
    const areaMeta = AREAS.find((a) => a.area === area);
    const sensitiveHit = areaMeta?.sensitive || /school|hospital|market|children/.test(lower);
    let severity = severityOverride !== "auto" ? severityOverride : "LOW";
    if (severityOverride === "auto") {
      if (sensitiveHit || /overflow|severe|large|huge|weeks|accumulat/.test(lower)) severity = "HIGH";
      else if (/days|growing|spreading|several/.test(lower)) severity = "MEDIUM";
    }
    const affected = severity === "HIGH" ? 110 + Math.floor(Math.random() * 90) : severity === "MEDIUM" ? 35 + Math.floor(Math.random() * 55) : 8 + Math.floor(Math.random() * 22);
    const match = issues.find((i) => i.category.id === cat.id && i.area === area);
    setResult({ category: cat, confidence, severity, environmental: enviroLabel(cat.id), affected, match, sensitive: sensitiveHit });
    setPhase("result");
  };

  const submitNew = () => {
    const areaMeta = AREAS.find((a) => a.area === area);
    onSubmitNew({
      title: description.slice(0, 62) + (description.length > 62 ? "…" : ""), description, category: result.category, area,
      severity: result.severity, aiConfidence: result.confidence, affected: result.affected, ageDays: 0, confirmations: 0, reports: 1,
      locationSensitive: areaMeta.sensitive, x: areaMeta.x, y: areaMeta.y, status: "REPORTED", createdLabel: "Just now",
    });
    setPhase("submitted");
  };
  const joinExisting = () => { onJoinExisting(result.match.id); setJoined(true); };

  if (phase === "submitted") {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--green-dim)" }}><CheckCircle2 size={30} style={{ color: "var(--green)" }} /></div>
        <div className="ii-display font-bold uppercase text-2xl">Report Submitted</div>
        <p className="text-[14px] mt-2" style={{ color: "var(--slate)" }}>Your report has been logged as a new community issue and sent to the AI priority queue. You earned <b style={{ color: "var(--forest)" }}>+10 Impact Points</b>.</p>
        <Btn className="mt-6" onClick={() => { setPhase("form"); setDescription(""); setResult(null); setPhotoName(null); setGpsUsed(false); }}>Report Another Issue</Btn>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
      <div>
        <div className="ii-display font-bold uppercase text-2xl">Report a Civic Issue</div>
        <p className="ii-eyebrow mt-1" style={{ color: "var(--slate)" }}>Photo + description → AI classifies, estimates severity &amp; checks for clustering</p>
      </div>
      <div className="ii-card rounded-lg p-5 space-y-4">
        <div>
          <label className="ii-eyebrow block mb-2" style={{ color: "var(--slate)" }}>Photo evidence</label>
          <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer py-8" style={{ borderColor: "var(--line)" }}>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoName(e.target.files?.[0]?.name || null)} />
            <Camera size={26} style={{ color: "var(--slate)" }} />
            <span className="ii-eyebrow mt-2" style={{ color: "var(--slate)" }}>{photoName ? photoName : "Tap to attach a photo (simulated)"}</span>
          </label>
        </div>
        <div>
          <label className="ii-eyebrow block mb-2" style={{ color: "var(--slate)" }}>Description</label>
          <textarea value={description} onChange={(e) => { setDescription(e.target.value); setPhase("form"); setResult(null); }} rows={4}
            placeholder="Describe what you see — e.g. 'Large amount of garbage has accumulated near the school entrance...'"
            className="w-full rounded-md p-3 text-[14px] outline-none ii-hairline border resize-none" style={{ background: "var(--paper)" }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="ii-eyebrow block mb-2" style={{ color: "var(--slate)" }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md p-2.5 text-[13px] outline-none ii-hairline border" style={{ background: "var(--paper)" }}>
              <option value="auto">AI-suggested</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="ii-eyebrow block mb-2" style={{ color: "var(--slate)" }}>Severity</label>
            <select value={severityOverride} onChange={(e) => setSeverityOverride(e.target.value)} className="w-full rounded-md p-2.5 text-[13px] outline-none ii-hairline border" style={{ background: "var(--paper)" }}>
              <option value="auto">AI-estimated</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
            </select>
          </div>
        </div>
        <div>
          <label className="ii-eyebrow block mb-2" style={{ color: "var(--slate)" }}>Location</label>
          <div className="relative">
            <select value={area} onChange={(e) => { setArea(e.target.value); setPhase("form"); setResult(null); }} className="w-full rounded-md p-3 text-[14px] outline-none ii-hairline border appearance-none pr-9" style={{ background: "var(--paper)" }}>
              {AREAS.map((a) => <option key={a.area} value={a.area}>{a.area}</option>)}
            </select>
            <MapPin size={16} className="absolute right-3 top-3.5" style={{ color: "var(--slate)" }} />
          </div>
          <button onClick={() => { setArea(AREAS[0].area); setGpsUsed(true); }} className="ii-eyebrow mt-1.5 flex items-center gap-1" style={{ color: "var(--forest)" }}>
            <Radio size={11} /> {gpsUsed ? "Location detected via device GPS (simulated)" : "Use Current Location"}
          </button>
        </div>

        {phase === "form" && <Btn onClick={runAnalysis} disabled={!description.trim()} icon={Sparkles} className="w-full">Run AI Analysis</Btn>}
        {phase === "analyzing" && <AIAnalysisRunner onDone={onAnalysisDone} />}

        {phase === "result" && result && (
          <div className="space-y-3 ii-fadein">
            <div className="rounded-lg p-4" style={{ background: "var(--paper-dim)" }}>
              <div className="ii-eyebrow mb-2 flex items-center gap-1.5" style={{ color: "var(--forest)" }}><Sparkles size={12} />AI CIVIC ANALYSIS — SIMULATED</div>
              <RowStat label="Category" value={result.category.label} />
              <RowStat label="Confidence" value={`${result.confidence}%`} />
              <RowStat label="Severity" value={<SeverityDot severity={result.severity} />} />
              <RowStat label="Environmental Impact" value={result.environmental} />
              <RowStat label="Est. Citizens Affected" value={result.affected} />
              <RowStat label="Recommended Department" value={DEPT_MAP[result.category.id]} />
            </div>

            {result.match ? (
              <div className="rounded-lg p-4" style={{ background: "var(--amber-dim)" }}>
                <div className="ii-eyebrow mb-2" style={{ color: "var(--amber)" }}>POTENTIAL MATCH FOUND</div>
                <p className="text-[13px] mb-2">{result.match.reports} nearby citizens have already reported a similar issue.</p>
                <div className="rounded-md p-3 mb-3" style={{ background: "var(--white)" }}>
                  <div className="font-semibold text-[14px]">Join Community Issue {result.match.id}</div>
                  <div className="flex gap-3 mt-1.5 flex-wrap ii-eyebrow" style={{ color: "var(--slate)" }}>
                    <span>{result.match.reports} reports</span><span>{result.match.confirmations} confirmations</span><span>~{result.match.affected} citizens affected</span><span>{result.match.ageDays}d unresolved</span>
                  </div>
                </div>
                {!joined ? (
                  <Btn className="w-full" icon={ThumbsUp} onClick={joinExisting}>Join Community Issue {result.match.id}</Btn>
                ) : (
                  <div className="ii-eyebrow text-center" style={{ color: "var(--green)" }}>Thanks — you've joined {result.match.id}. +5 points added.</div>
                )}
                <button onClick={submitNew} className="ii-eyebrow mt-2 w-full text-center underline" style={{ color: "var(--slate)" }}>Report as a separate new issue instead</button>
              </div>
            ) : (
              <div className="rounded-lg p-4" style={{ background: "var(--green-dim)" }}>
                <div className="ii-eyebrow mb-1" style={{ color: "var(--green)" }}>NO SIMILAR REPORTS NEARBY</div>
                <p className="text-[13px]">This will be logged as a new community issue and enter the AI priority queue.</p>
              </div>
            )}
            {!result.match && <Btn className="w-full" icon={CheckCircle2} onClick={submitNew}>Confirm &amp; Submit Report</Btn>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   CITIZEN: COMMUNITY ISSUES LIST
   ============================================================ */
function CitizenCommunity({ issues, onConfirm, onOpen }) {
  return (
    <div className="max-w-4xl mx-auto px-5 py-6 space-y-4">
      <div>
        <div className="ii-display font-bold uppercase text-2xl">Community Issues</div>
        <p className="ii-eyebrow mt-1" style={{ color: "var(--slate)" }}>Reports are clustered — confirm instead of filing duplicates</p>
      </div>
      <div className="space-y-3">
        {[...issues].sort((a, b) => computePriority(b).total - computePriority(a).total).map((issue) => (
          <IssueCard key={issue.id} issue={issue} showConfirm onConfirm={onConfirm} onClick={() => onOpen(issue)} />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   IMPACT PROFILE (citizen + volunteer)
   ============================================================ */
function ImpactProfile({ role, userName, onNameChange, civicScore, ledger, extraStats }) {
  const level = civicScore >= 800 ? "Community Contributor" : civicScore >= 400 ? "Active Citizen" : "New Member";
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(userName);

  useEffect(() => {
    setDraftName(userName);
  }, [userName]);

  const saveName = () => {
    const cleanName = draftName.trim().replace(/\s+/g, " ");
    if (!cleanName) return;
    onNameChange(cleanName);
    setEditingName(false);
  };

  const cancelEdit = () => {
    setDraftName(userName);
    setEditingName(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">
      <div className="ii-card rounded-lg p-6" style={{ background: "var(--forest)", color: "var(--paper)" }}>
        <div className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>{role === "volunteer" ? "VOLUNTEER PROFILE" : "CITIZEN PROFILE"}</div>

        {!editingName ? (
          <div className="flex items-center gap-3 mt-1">
            <div className="ii-display font-bold text-3xl uppercase">{userName}</div>
            <button
              onClick={() => { setDraftName(userName); setEditingName(true); }}
              className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide"
              style={{ background: "rgba(255,255,255,0.14)", color: "var(--paper)", border: "1px solid rgba(255,255,255,0.25)" }}
              title="Change contributor name"
            >
              <UserCog size={14} /> Edit Name
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <div className="ii-eyebrow mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>CHANGE CONTRIBUTOR NAME</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") cancelEdit();
                }}
                placeholder="Enter contributor name"
                className="flex-1 rounded-md px-3 py-2.5 text-[14px] outline-none border"
                style={{ background: "var(--white)", color: "var(--ink)", borderColor: "var(--line)" }}
              />
              <Btn variant="white" small icon={Check} onClick={saveName} disabled={!draftName.trim()}>Save</Btn>
              <Btn variant="outline-invert" small icon={X} onClick={cancelEdit}>Cancel</Btn>
            </div>
            <div className="ii-eyebrow mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
              You can change this name instantly during the demo.
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 mt-3">
          <div className="ii-mono font-bold" style={{ fontSize: 44, lineHeight: 1 }}>{civicScore}</div>
          <div className="ii-eyebrow mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>CIVIC IMPACT SCORE</div>
        </div>
        <Tone tone="forest" className="mt-2" style={{ background: "rgba(255,255,255,0.14)", color: "var(--paper)" }}>LEVEL: {level.toUpperCase()}</Tone>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {extraStats.map((s) => (
            <div key={s.label}><div className="ii-mono font-semibold text-xl">{s.value}</div><div className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>{s.label}</div></div>
          ))}
        </div>
      </div>
      <div className="ii-card rounded-lg p-5">
        <div className="ii-display font-bold uppercase text-[15px] mb-3">Badges</div>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((b) => (
            <div key={b.label} className="flex items-center gap-2 rounded-md p-3" style={{ background: "var(--paper-dim)" }}>
              <div className="text-xl">{b.icon}</div>
              <div className="text-[13px] font-medium">{b.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="ii-card rounded-lg p-5">
        <div className="ii-display font-bold uppercase text-[15px] mb-3">Impact Ledger</div>
        <div className="space-y-0">
          {ledger.map((l, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-3 border-b ii-hairline last:border-0">
              <div>
                <div className="text-[13px] font-medium">{l.label}</div>
                <div className="ii-eyebrow mt-0.5" style={{ color: "var(--slate)" }}>{l.when}</div>
              </div>
              <div className="ii-mono font-semibold" style={{ color: "var(--forest)" }}>+{l.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   NOTIFICATIONS DRAWER
   ============================================================ */
function NotifDrawer({ open, onClose, items }) {
  const toneColor = (t) => t === "red" ? "var(--red)" : t === "amber" ? "var(--amber)" : t === "green" ? "var(--green)" : "var(--forest)";
  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      <div onClick={onClose} className="absolute inset-0 transition-opacity" style={{ background: "rgba(22,31,26,0.4)", opacity: open ? 1 : 0 }} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm ii-card transition-transform" style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}>
        <div className="flex items-center justify-between p-4 border-b ii-hairline">
          <div className="ii-display font-bold uppercase text-[16px]">Notifications</div>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 60px)" }}>
          {items.map((n, i) => (
            <div key={i} className="flex gap-3 rounded-md p-3 ii-fadein" style={{ background: "var(--paper-dim)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--white)" }}><n.icon size={15} style={{ color: toneColor(n.tone) }} /></div>
              <div><div className="text-[13px] font-semibold">{n.title}</div><div className="text-[13px]" style={{ color: "var(--slate)" }}>{n.body}</div><div className="ii-eyebrow mt-1" style={{ color: "var(--slate-light)" }}>{n.when}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VOLUNTEER: DASHBOARD + ACTIONS
   ============================================================ */
function VolunteerDashboard({ actions, onOpenAction }) {
  const recommended = actions.filter((a) => a.status !== "Completed");
  return (
    <div className="max-w-6xl mx-auto px-5 py-5 space-y-5">
      <div className="ii-card rounded-lg p-6" style={{ background: "var(--forest)", color: "var(--paper)" }}>
        <div className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>YOUR IMPACT</div>
        <div className="ii-mono font-bold" style={{ fontSize: 40 }}>1,240 <span className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>IMPACT POINTS</span></div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div><div className="ii-mono font-semibold text-xl">12</div><div className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Actions Completed</div></div>
          <div><div className="ii-mono font-semibold text-xl">9</div><div className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Issues Helped Resolve</div></div>
          <div><div className="ii-mono font-semibold text-xl">4</div><div className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Community Campaigns</div></div>
        </div>
      </div>
      <div>
        <div className="ii-display font-bold uppercase text-[15px] mb-3">Recommended For You</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommended.map((a) => <ActionCard key={a.id} action={a} issue={null} onClick={() => onOpenAction(a)} />)}
        </div>
      </div>
    </div>
  );
}
function VolunteerActions({ actions, issues, onOpenAction }) {
  return (
    <div className="max-w-4xl mx-auto px-5 py-6 space-y-4">
      <div className="ii-display font-bold uppercase text-2xl">Community Actions</div>
      <div className="space-y-3">
        {actions.map((a) => <ActionCard key={a.id} action={a} issue={issues.find((i) => i.id === a.issueId)} onClick={() => onOpenAction(a)} />)}
      </div>
    </div>
  );
}

/* ============================================================
   AUTHORITY: DASHBOARD / QUEUE / MAP / ANALYTICS
   ============================================================ */
function AuthorityDashboard({ issues, onOpen }) {
  const total = 1248, open = 327, inProgress = 184, resolved = 737, verified = 691;
  const top = [...issues].sort((a, b) => computePriority(b).total - computePriority(a).total).slice(0, 4);
  const deptPerf = [{ dept: "Sanitation", pct: 78 }, { dept: "PWD (Roads)", pct: 64 }, { dept: "Electrical", pct: 85 }, { dept: "Water & Drainage", pct: 58 }];
  return (
    <div className="max-w-6xl mx-auto px-5 py-5 space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricTile label="Total Issues" value={total} icon={LayoutGrid} tone="forest" />
        <MetricTile label="Open" value={open} icon={AlertTriangle} tone="amber" />
        <MetricTile label="In Progress" value={inProgress} icon={Clock} tone="forest" />
        <MetricTile label="Resolved" value={resolved} icon={CheckCircle2} tone="green" />
        <MetricTile label="Verified" value={verified} icon={ClipboardCheck} tone="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 ii-card rounded-lg p-5">
          <div className="flex items-center justify-between mb-3"><div className="ii-display font-bold uppercase text-[15px]">AI Priority Queue</div><Gauge size={16} style={{ color: "var(--slate)" }} /></div>
          <div className="space-y-3">
            {top.map((issue) => {
              const p = computePriority(issue); const tone = priorityTone(p.total);
              return (
                <div key={issue.id} onClick={() => onOpen(issue)} className="flex items-center gap-3 rounded-md p-3 cursor-pointer hover:shadow-sm transition-shadow" style={{ background: "var(--paper-dim)" }}>
                  <div className="w-2 h-10 rounded-full" style={{ background: tone === "red" ? "var(--red)" : tone === "amber" ? "var(--amber)" : "var(--green)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] truncate">{issue.title}</div>
                    <div className="ii-eyebrow" style={{ color: "var(--slate)" }}>{issue.reports} reports · {issue.confirmations} confirmations · {issue.affected} affected · {issue.ageDays}d unresolved</div>
                  </div>
                  <div className="ii-mono font-bold text-lg">{p.total}</div>
                  <ChevronRight size={16} style={{ color: "var(--slate)" }} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="ii-card rounded-lg p-5">
          <div className="ii-display font-bold uppercase text-[15px] mb-3">Department Performance</div>
          <div className="space-y-4">
            {deptPerf.map((d) => (
              <div key={d.dept}>
                <div className="flex justify-between ii-eyebrow mb-1" style={{ color: "var(--slate)" }}><span>{d.dept}</span><span className="ii-mono">{d.pct}%</span></div>
                <div className="h-2 rounded-full ii-rail-track"><div className="h-2 rounded-full ii-rail-fill" style={{ width: `${d.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function AuthorityQueue({ issues, onOpen }) {
  const [catFilter, setCatFilter] = useState("all"); const [sevFilter, setSevFilter] = useState("all"); const [statusFilter, setStatusFilter] = useState("all"); const [sortDesc, setSortDesc] = useState(true);
  const filtered = useMemo(() => {
    let r = issues.filter((i) => (catFilter === "all" || i.category.id === catFilter) && (sevFilter === "all" || i.severity === sevFilter) && (statusFilter === "all" || i.status === statusFilter));
    r = [...r].sort((a, b) => { const d = computePriority(b).total - computePriority(a).total; return sortDesc ? d : -d; });
    return r;
  }, [issues, catFilter, sevFilter, statusFilter, sortDesc]);
  const SelectFilter = ({ value, onChange, options, label }) => (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="ii-eyebrow rounded-full pl-3 pr-7 py-1.5 appearance-none border cursor-pointer" style={{ background: value === "all" ? "var(--paper-dim)" : "var(--forest)", color: value === "all" ? "var(--slate)" : "var(--white)", borderColor: "var(--line)" }}>
        <option value="all">{label}: All</option>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-2.5 pointer-events-none" style={{ color: value === "all" ? "var(--slate)" : "var(--white)" }} />
    </div>
  );
  return (
    <div className="max-w-6xl mx-auto px-5 py-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="ii-display font-bold uppercase text-2xl flex items-center gap-2"><Filter size={20} />AI Priority Queue</div>
        <button onClick={() => setSortDesc((s) => !s)} className="ii-eyebrow flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: "var(--paper-dim)", color: "var(--slate)" }}><ArrowUpDown size={12} /> Sort: Impact Score {sortDesc ? "High→Low" : "Low→High"}</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <SelectFilter label="Category" value={catFilter} onChange={setCatFilter} options={CATEGORIES.map((c) => ({ value: c.id, label: c.short }))} />
        <SelectFilter label="Severity" value={sevFilter} onChange={setSevFilter} options={["HIGH", "MEDIUM", "LOW"].map((s) => ({ value: s, label: s }))} />
        <SelectFilter label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUS_STEPS.map((s) => ({ value: s, label: STATUS_SHORT[s] }))} />
      </div>
      <div className="space-y-3">
        {filtered.map((issue) => {
          const p = computePriority(issue);
          return (
            <div key={issue.id} onClick={() => onOpen(issue)} className="ii-card rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow flex items-center gap-4">
              <ImpactGauge score={p.total} size={72} label="" />
              <div className="flex-1 min-w-0">
                <div className="ii-eyebrow" style={{ color: "var(--slate-light)" }}>{issue.id} · {issue.reports} reports clustered</div>
                <div className="font-semibold text-[15px] truncate">{issue.title}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="ii-eyebrow flex items-center gap-1" style={{ color: "var(--slate)" }}><CategoryIcon category={issue.category} size={11} />{issue.category.short}</span><span className="text-slate-300">·</span>
                  <SeverityDot severity={issue.severity} /><span className="text-slate-300">·</span>
                  <span className="ii-eyebrow" style={{ color: "var(--slate)" }}>{issue.confirmations} confirmations · {issue.affected} affected · {issue.ageDays}d unresolved</span>
                </div>
              </div>
              <Tone tone="forest" className="shrink-0">{STATUS_SHORT[issue.status]}</Tone>
              <ChevronRight size={16} style={{ color: "var(--slate)" }} />
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-10 ii-eyebrow" style={{ color: "var(--slate)" }}>No issues match these filters.</div>}
      </div>
    </div>
  );
}
function AuthorityMap({ issues, onOpen }) {
  const [catFilter, setCatFilter] = useState("all");
  const filtered = catFilter === "all" ? issues : issues.filter((i) => i.category.id === catFilter);
  return (
    <div className="max-w-6xl mx-auto px-5 py-5 space-y-4">
      <div className="ii-display font-bold uppercase text-2xl flex items-center gap-2"><MapIcon size={20} />District Map View</div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCatFilter("all")} className="px-3 py-1.5 rounded-full ii-eyebrow" style={{ background: catFilter === "all" ? "var(--forest)" : "var(--paper-dim)", color: catFilter === "all" ? "var(--white)" : "var(--slate)" }}>All</button>
        {CATEGORIES.filter((c) => c.id !== "other").map((c) => (
          <button key={c.id} onClick={() => setCatFilter(c.id)} className="px-3 py-1.5 rounded-full ii-eyebrow flex items-center gap-1" style={{ background: catFilter === c.id ? "var(--forest)" : "var(--paper-dim)", color: catFilter === c.id ? "var(--white)" : "var(--slate)" }}><c.icon size={11} />{c.short}</button>
        ))}
      </div>
      <div className="ii-card rounded-lg p-4">
        <MiniMap issues={filtered} onOpen={onOpen} />
        <div className="flex items-center gap-5 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5 ii-eyebrow" style={{ color: "var(--slate)" }}><span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--red)" }} />High severity</div>
          <div className="flex items-center gap-1.5 ii-eyebrow" style={{ color: "var(--slate)" }}><span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--amber)" }} />Medium severity</div>
          <div className="flex items-center gap-1.5 ii-eyebrow" style={{ color: "var(--slate)" }}><span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--green)" }} />Low severity</div>
        </div>
      </div>
    </div>
  );
}
function AuthorityAnalytics({ issues }) {
  const catData = CATEGORIES.filter((c) => c.id !== "other").map((c) => ({ name: c.short, value: issues.filter((i) => i.category.id === c.id).length || 1 }));
  return (
    <div className="max-w-6xl mx-auto px-5 py-5 space-y-5">
      <div className="ii-display font-bold uppercase text-2xl flex items-center gap-2"><Leaf size={20} />Clean &amp; Green Impact Analytics</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile label="Waste Issues Resolved" value={324} icon={Trash2} tone="green" />
        <MetricTile label="Illegal Dumping Resolved" value={87} icon={AlertTriangle} tone="green" />
        <MetricTile label="Waterlogging Resolved" value={63} icon={Droplets} tone="green" />
        <MetricTile label="Citizens Benefited" value={18420} icon={Users} tone="forest" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricTile label="Resolution Rate" value={78} suffix="%" icon={TrendingUp} tone="green" />
        <MetricTile label="Avg. Resolution Time" value={2.8} suffix=" days" icon={Clock} tone="forest" />
        <MetricTile label="Volunteers Mobilized" value={640} icon={Sprout} tone="amber" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="ii-card rounded-lg p-5">
          <div className="ii-display font-bold uppercase text-[15px] mb-3">Issues Resolved — Last 6 Months</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ANALYTICS_MONTHLY}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5C685F" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#5C685F" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #CBD1C1" }} />
              <Line type="monotone" dataKey="resolved" stroke="#163828" strokeWidth={2.5} dot={{ r: 3, fill: "#163828" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="ii-card rounded-lg p-5">
          <div className="ii-display font-bold uppercase text-[15px] mb-3">Reports by Category</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#5C685F" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 12, fill: "#5C685F" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #CBD1C1" }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>{catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   NGO: DASHBOARD / CAMPAIGNS / IMPACT
   ============================================================ */
function NGODashboard({ issues, actions, onOpenAction }) {
  const needsHelp = issues.filter((i) => ["COMMUNITY CONFIRMED", "AUTHORITY ASSIGNED"].includes(i.status) && !i.linkedActionId).sort((a, b) => computePriority(b).total - computePriority(a).total);
  return (
    <div className="max-w-6xl mx-auto px-5 py-5 space-y-5">
      <div className="ii-card rounded-lg p-6" style={{ background: "var(--forest)", color: "var(--paper)" }}>
        <div className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>CLEAN JHARKHAND INITIATIVE</div>
        <div className="ii-display font-bold text-2xl uppercase mt-1">Organization Dashboard</div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div><div className="ii-mono font-semibold text-xl">6</div><div className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Active Campaigns</div></div>
          <div><div className="ii-mono font-semibold text-xl">142</div><div className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Volunteers Network</div></div>
          <div><div className="ii-mono font-semibold text-xl">2,960</div><div className="ii-eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Citizens Impacted</div></div>
        </div>
      </div>
      <div>
        <div className="ii-display font-bold uppercase text-[15px] mb-3">Civic Problems Needing Action</div>
        <div className="space-y-3">
          {needsHelp.map((issue) => (
            <div key={issue.id} className="ii-card rounded-lg p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ background: "var(--paper-dim)" }}><CategoryIcon category={issue.category} size={18} /></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] truncate">{issue.title}</div>
                <div className="ii-eyebrow" style={{ color: "var(--slate)" }}>{issue.area} · {issue.affected} affected · Impact {computePriority(issue).total}</div>
              </div>
              <Btn small variant="outline" icon={Megaphone}>Recruit Volunteers</Btn>
            </div>
          ))}
          {needsHelp.length === 0 && <div className="ii-eyebrow" style={{ color: "var(--slate)" }}>All nearby issues currently have an action linked.</div>}
        </div>
      </div>
    </div>
  );
}
function NGOCampaigns({ actions, issues, onOpenAction }) {
  return (
    <div className="max-w-4xl mx-auto px-5 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="ii-display font-bold uppercase text-2xl">Campaigns</div>
        <Btn small icon={Plus}>Create Campaign</Btn>
      </div>
      <div className="space-y-3">
        {actions.map((a) => <ActionCard key={a.id} action={a} issue={issues.find((i) => i.id === a.issueId)} onClick={() => onOpenAction(a)} />)}
      </div>
    </div>
  );
}
function NGOImpact({ actions }) {
  const completed = actions.filter((a) => a.status === "Completed");
  const totalImpact = actions.reduce((s, a) => s + a.estimatedImpact, 0);
  const totalVolunteers = new Set(actions.flatMap((a) => a.volunteers)).size;
  return (
    <div className="max-w-5xl mx-auto px-5 py-6 space-y-5">
      <div className="ii-display font-bold uppercase text-2xl">Impact Generated</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile label="Campaigns Completed" value={completed.length} icon={CheckCircle2} tone="green" />
        <MetricTile label="Volunteers Mobilized" value={totalVolunteers} icon={Sprout} tone="forest" />
        <MetricTile label="Citizens Impacted" value={totalImpact} icon={Users} tone="amber" />
        <MetricTile label="Active Campaigns" value={actions.length - completed.length} icon={ClipboardList} tone="forest" />
      </div>
      <div className="ii-card rounded-lg p-5">
        <div className="ii-display font-bold uppercase text-[15px] mb-3">Campaign History</div>
        <div className="divide-y ii-hairline">
          {actions.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2.5">
              <div><div className="text-[13px] font-medium">{a.title}</div><div className="ii-eyebrow" style={{ color: "var(--slate-light)" }}>{a.volunteers.length} volunteers · ~{a.estimatedImpact} citizens</div></div>
              <Tone tone={a.status === "Completed" ? "green" : a.status === "In Progress" ? "forest" : "amber"}>{a.status}</Tone>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COMMUNITY ISSUE DETAIL (shared overlay across all roles)
   ============================================================ */
function CommunityIssueDetail({ issue, issues, actions, role, onClose, onConfirm, onAssign, onStatus, onNotes, onVerify, onRecommendAction, onOpenAction }) {
  const [noteDraft, setNoteDraft] = useState(issue.resolutionNotes || "");
  const [officerPick, setOfficerPick] = useState(issue.assignedOfficer || "");
  const [evidenceAttached, setEvidenceAttached] = useState(issue.resolutionEvidence || false);
  const p = computePriority(issue);
  const linkedAction = actions.find((a) => a.id === issue.linkedActionId);
  const awaitingVerify = issue.status === "RESOLVED" && issue.citizenVerification === null;

  const BreakdownBar = ({ label, val, pct }) => (
    <div><div className="flex justify-between ii-eyebrow mb-1" style={{ color: "var(--slate)" }}><span>{label}</span><span className="ii-mono">{val} · {pct}</span></div>
      <div className="h-1.5 rounded-full ii-rail-track"><div className="h-1.5 rounded-full ii-rail-fill" style={{ width: `${val}%` }} /></div></div>
  );

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto ii-scrollbar" style={{ background: "var(--paper)" }}>
      <div className="ii-plaque sticky top-0 z-10 px-5 py-3 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1.5 ii-display uppercase text-[13px] font-semibold"><ChevronLeft size={16} /> Back</button>
        <span className="ii-mono text-sm">{issue.id}</span>
      </div>
      <div className="max-w-5xl mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="ii-card rounded-lg overflow-hidden">
            <div className="h-44 flex items-center justify-center" style={{ background: "var(--paper-deep)" }}>
              <CategoryIcon category={issue.category} size={40} color="var(--slate)" /><span className="ii-eyebrow ml-2" style={{ color: "var(--slate)" }}>Citizen-submitted photo (placeholder)</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="ii-eyebrow" style={{ color: "var(--slate-light)" }}>COMMUNITY ISSUE — {issue.reports} INDIVIDUAL REPORTS CLUSTERED</div>
              <div className="ii-display font-bold text-2xl uppercase">{issue.title}</div>
              <p className="text-[14px]" style={{ color: "var(--slate)" }}>{issue.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Tone tone="forest"><CategoryIcon category={issue.category} size={11} />{issue.category.label}</Tone>
                <SeverityDot severity={issue.severity} />
                <Tone tone="forest"><MapPin size={11} />{issue.area}</Tone>
                <Tone tone="forest">{issue.reports} reports</Tone>
                <Tone tone="forest">{issue.confirmations} confirmations</Tone>
              </div>
              {(role === "citizen") && (
                <Btn small variant="outline" icon={ThumbsUp} disabled={issue.confirmedByUser} onClick={() => onConfirm(issue.id)}>{issue.confirmedByUser ? "Confirmed ✓" : "Confirm Issue"}</Btn>
              )}
            </div>
          </div>

          <div className="ii-card rounded-lg p-5">
            <div className="ii-display font-bold uppercase text-[15px] mb-3">Timeline</div>
            <ResolutionRail status={issue.status} />
          </div>

          {linkedAction && (
            <div className="ii-card rounded-lg p-5">
              <div className="ii-display font-bold uppercase text-[15px] mb-3 flex items-center gap-1.5"><Handshake size={16} />Linked Community Action</div>
              <ActionCard action={linkedAction} issue={null} onClick={() => onOpenAction(linkedAction)} />
            </div>
          )}
          {!linkedAction && role === "authority" && ["COMMUNITY CONFIRMED", "AUTHORITY ASSIGNED"].includes(issue.status) && (
            <div className="ii-card rounded-lg p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="ii-display font-bold uppercase text-[15px]">Recommend Community Action</div>
                <div className="text-[13px] mt-1" style={{ color: "var(--slate)" }}>Mobilize nearby volunteers and an NGO partner to resolve this on the ground.</div>
              </div>
              <Btn icon={Rocket} onClick={() => onRecommendAction(issue.id)}>Recommend Action</Btn>
            </div>
          )}

          {role === "authority" && (
            <div className="ii-card rounded-lg p-5 space-y-3">
              <div className="ii-display font-bold uppercase text-[15px]">Assignment &amp; Status</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ii-eyebrow block mb-1.5" style={{ color: "var(--slate)" }}>Assign Officer</label>
                  <select value={officerPick} onChange={(e) => setOfficerPick(e.target.value)} className="w-full rounded-md p-2.5 text-[13px] border ii-hairline" style={{ background: "var(--paper)" }}>
                    <option value="">Select officer…</option>{OFFICERS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex items-end"><Btn small icon={UserCog} disabled={!officerPick} onClick={() => onAssign(issue.id, officerPick)} className="w-full">Assign Officer</Btn></div>
              </div>
              <div className="flex gap-2 flex-wrap pt-1">
                <Btn small variant="outline" onClick={() => onStatus(issue.id, "AUTHORITY ASSIGNED")}>Mark In Progress</Btn>
                <Btn small onClick={() => { if (evidenceAttached) onStatus(issue.id, "RESOLVED"); }} disabled={!evidenceAttached}>Mark Resolved</Btn>
              </div>
              <div>
                <label className="ii-eyebrow block mb-1.5" style={{ color: "var(--slate)" }}>Resolution Notes</label>
                <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} rows={3} className="w-full rounded-md p-2.5 text-[13px] border ii-hairline resize-none" style={{ background: "var(--paper)" }} placeholder="Describe the action taken…" />
                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                  <button onClick={() => setEvidenceAttached(true)} className="ii-eyebrow flex items-center gap-1" style={{ color: evidenceAttached ? "var(--green)" : "var(--slate)" }}>
                    {evidenceAttached ? <Check size={12} /> : <Upload size={12} />} {evidenceAttached ? "Resolution evidence attached" : "Attach resolution evidence (required to resolve)"}
                  </button>
                  <Btn small variant="outline" onClick={() => onNotes(issue.id, noteDraft)}>Save Notes</Btn>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ii-eyebrow" style={{ color: issue.citizenVerification === "yes" ? "var(--green)" : issue.citizenVerification === "no" ? "var(--red)" : "var(--slate)" }}>
                <ClipboardCheck size={13} /> Citizen verification: {issue.citizenVerification === "yes" ? "Confirmed by reporter" : issue.citizenVerification === "no" ? "Disputed — community says issue still exists" : "Pending"}
              </div>
            </div>
          )}

          {role === "citizen" && awaitingVerify && (
            <div className="ii-card rounded-lg p-5">
              <div className="ii-display font-bold uppercase text-[15px]">Authority marked this issue as resolved.</div>
              <p className="text-[13px] mt-1" style={{ color: "var(--slate)" }}>Can you confirm the problem has actually been fixed?</p>
              {issue.resolutionNotes && <div className="text-[13px] rounded-md p-3 mt-2" style={{ background: "var(--paper-dim)" }}><span className="ii-eyebrow" style={{ color: "var(--slate)" }}>RESOLUTION NOTE — </span>{issue.resolutionNotes}</div>}
              <div className="flex gap-2 mt-3">
                <Btn icon={CheckCircle2} onClick={() => onVerify(issue.id, "yes")}>Yes — Verify</Btn>
                <Btn variant="outline" icon={ThumbsDown} onClick={() => onVerify(issue.id, "no")}>No — Still Exists</Btn>
              </div>
            </div>
          )}
          {issue.citizenVerification === "no" && (
            <div className="rounded-lg p-4" style={{ background: "var(--red-dim)", color: "var(--red)" }}>Community reported that the issue still exists. Returned to the authority queue.</div>
          )}
          {issue.citizenVerification === "yes" && (
            <div className="rounded-lg p-4 flex items-center gap-2" style={{ background: "var(--green-dim)", color: "var(--green)" }}><CheckCircle2 size={16} />Resolution verified by the reporting citizen.</div>
          )}
        </div>

        <div className="space-y-5">
          <div className="ii-card rounded-lg p-5 flex flex-col items-center">
            <div className="ii-eyebrow mb-1" style={{ color: "var(--slate)" }}>IMPACT PRIORITY SCORE</div>
            <ImpactGauge score={p.total} size={140} label="OUT OF 100" />
            <div className="w-full space-y-2.5 mt-3">
              <BreakdownBar label="Severity" val={p.breakdown.severity} pct="30%" />
              <BreakdownBar label="Citizens affected" val={p.breakdown.affected} pct="25%" />
              <BreakdownBar label="Community confirmations" val={p.breakdown.confirmations} pct="20%" />
              <BreakdownBar label="Issue age" val={p.breakdown.age} pct="15%" />
              <BreakdownBar label="Environmental impact" val={p.breakdown.environmental} pct="10%" />
            </div>
          </div>
          <div className="ii-card rounded-lg p-5 space-y-2.5">
            <div className="ii-display font-bold uppercase text-[15px] mb-1">Report Signals</div>
            <RowStat label="AI Classification" value={`${issue.category.label} (${issue.aiConfidence}%)`} />
            <RowStat label="Environmental Impact" value={enviroLabel(issue.category.id)} />
            <RowStat label="Total Reports" value={issue.reports} />
            <RowStat label="Citizens Affected" value={issue.affected} />
            <RowStat label="Confirmations" value={issue.confirmations} />
            <RowStat label="Issue Age" value={`${issue.ageDays} day${issue.ageDays === 1 ? "" : "s"}`} />
            <RowStat label="Recommended Department" value={issue.recommendedDept} />
            <RowStat label="Assigned Officer" value={issue.assignedOfficer || "Unassigned"} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COMMUNITY ACTION DETAIL (shared overlay)
   ============================================================ */
function ActionDetail({ action, issue, role, onClose, onJoin, onUploadEvidence, onMarkCompleted }) {
  const alreadyJoined = action.volunteers.includes("You");
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto ii-scrollbar" style={{ background: "var(--paper)" }}>
      <div className="ii-plaque sticky top-0 z-10 px-5 py-3 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1.5 ii-display uppercase text-[13px] font-semibold"><ChevronLeft size={16} /> Back</button>
        <span className="ii-mono text-sm">{action.id}</span>
      </div>
      <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">
        <div className="ii-card rounded-lg p-6">
          <div className="ii-eyebrow flex items-center gap-1" style={{ color: "var(--slate-light)" }}><Sprout size={11} />{action.ngo}</div>
          <div className="ii-display font-bold text-2xl uppercase mt-1">{action.title}</div>
          {issue && <div className="text-[13px] mt-1" style={{ color: "var(--slate)" }}>Responding to community issue <b>{issue.id}</b> — {issue.title}</div>}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <Tone tone={action.status === "Completed" ? "green" : action.status === "In Progress" ? "forest" : "amber"}>{action.status}</Tone>
            <Tone tone="forest"><MapPin size={11} />{action.distanceKm} km away</Tone>
            <Tone tone="forest"><Target size={11} />~{action.estimatedImpact} citizens</Tone>
          </div>
        </div>

        <div className="ii-card rounded-lg p-5">
          <div className="ii-display font-bold uppercase text-[15px] mb-3">Participants — {action.volunteers.length}/{action.volunteersNeeded}</div>
          <div className="flex flex-wrap gap-2 mb-3">{action.volunteers.map((v) => <div key={v} className="flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1" style={{ background: "var(--paper-dim)" }}><Avatar name={v} /><span className="text-[13px]">{v}</span></div>)}</div>
          <div className="h-1.5 rounded-full ii-rail-track mb-3"><div className="h-1.5 rounded-full ii-rail-fill" style={{ width: `${Math.min(100, (action.volunteers.length / action.volunteersNeeded) * 100)}%` }} /></div>
          {(role === "volunteer" || role === "citizen") && action.status !== "Completed" && (
            <Btn icon={alreadyJoined ? CheckCircle2 : Handshake} disabled={alreadyJoined} onClick={() => onJoin(action.id)}>{alreadyJoined ? "Joined ✓ (+15 points)" : "Join Action"}</Btn>
          )}
        </div>

        <div className="ii-card rounded-lg p-5">
          <div className="ii-display font-bold uppercase text-[15px] mb-3">Evidence</div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onUploadEvidence(action.id, "before")} className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center py-8" style={{ borderColor: "var(--line)" }}>
              {action.beforePhoto ? <CheckCircle2 size={22} style={{ color: "var(--green)" }} /> : <ImageIcon size={22} style={{ color: "var(--slate)" }} />}
              <span className="ii-eyebrow mt-2" style={{ color: "var(--slate)" }}>{action.beforePhoto ? "Before photo attached" : "Attach before photo"}</span>
            </button>
            <button onClick={() => onUploadEvidence(action.id, "after")} className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center py-8" style={{ borderColor: "var(--line)" }}>
              {action.afterPhoto ? <CheckCircle2 size={22} style={{ color: "var(--green)" }} /> : <ImageIcon size={22} style={{ color: "var(--slate)" }} />}
              <span className="ii-eyebrow mt-2" style={{ color: "var(--slate)" }}>{action.afterPhoto ? "After photo attached" : "Attach after photo"}</span>
            </button>
          </div>
          {(role === "ngo" || role === "volunteer") && action.beforePhoto && action.afterPhoto && action.status !== "Completed" && (
            <Btn className="w-full mt-3" icon={CheckCircle2} onClick={() => onMarkCompleted(action.id)}>Mark Action Completed</Btn>
          )}
        </div>

        {action.status === "Completed" && (
          <div className="ii-card rounded-lg p-5" style={{ background: "var(--green-dim)" }}>
            <div className="ii-display font-bold uppercase text-[15px]" style={{ color: "var(--green)" }}>Civic Impact Created</div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <RowStat label="Citizens benefited" value={action.estimatedImpact} />
              <RowStat label="Volunteers participated" value={action.volunteers.length} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | app
  const [role, setRole] = useState("citizen");
  const [userName, setUserName] = useState(() => localStorage.getItem("impactIndiaUserName") || "Vaidehi Yadav");
  const [citizenTab, setCitizenTab] = useState("dashboard");
  const [volunteerTab, setVolunteerTab] = useState("dashboard");
  const [authorityTab, setAuthorityTab] = useState("dashboard");
  const [ngoTab, setNgoTab] = useState("dashboard");

  const [issues, setIssues] = useState(SEED_ISSUES);
  const [actions, setActions] = useState(SEED_ACTIONS);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS_INIT);

  const [civicScore, setCivicScore] = useState(840);
  const [ledger, setLedger] = useState(SEED_LEDGER);

  const addPoints = (amount, label) => { setCivicScore((s) => s + amount); setLedger((l) => [{ label, points: amount, when: "Just now" }, ...l]); };
  const pushNotif = (n) => setNotifications((list) => [{ ...n, when: "Just now" }, ...list]);
  const handleNameChange = (name) => { setUserName(name); localStorage.setItem("impactIndiaUserName", name); };

  const handleConfirm = (id) => {
    setIssues((prev) => prev.map((i) => i.id === id ? { ...i, confirmations: i.confirmations + 1, reports: i.reports + 1, confirmedByUser: true, status: i.status === "REPORTED" ? "COMMUNITY CONFIRMED" : i.status } : i));
    addPoints(5, "Confirmed community issue");
  };
  const handleSubmitNew = (draft) => { const ni = makeIssue({ ...draft, reporter: userName }); setIssues((prev) => [ni, ...prev]); addPoints(10, `Report accepted — ${draft.title}`); };
  const handleJoinExisting = (id) => { handleConfirm(id); };

  const handleAssign = (id, officer) => {
    setIssues((prev) => prev.map((i) => i.id === id ? { ...i, assignedOfficer: officer, status: ["REPORTED", "COMMUNITY CONFIRMED"].includes(i.status) ? "AUTHORITY ASSIGNED" : i.status } : i));
    setSelectedIssue((s) => (s && s.id === id ? { ...s, assignedOfficer: officer, status: "AUTHORITY ASSIGNED" } : s));
    pushNotif({ icon: UserCog, tone: "amber", title: "Issue assigned", body: `Your issue ${id} has been assigned to ${officer}.` });
  };
  const handleStatus = (id, status) => {
    setIssues((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
    setSelectedIssue((s) => (s && s.id === id ? { ...s, status } : s));
    if (status === "RESOLVED") pushNotif({ icon: CheckCircle2, tone: "green", title: "Authority marked resolved", body: `Authority marked ${id} as resolved. Please verify.` });
  };
  const handleNotes = (id, notes) => setIssues((prev) => prev.map((i) => i.id === id ? { ...i, resolutionNotes: notes } : i));

  const handleVerify = (id, answer) => {
    setIssues((prev) => prev.map((i) => i.id === id ? { ...i, citizenVerification: answer, status: answer === "yes" ? "CITIZEN VERIFIED" : "AUTHORITY ASSIGNED" } : i));
    setSelectedIssue((s) => (s && s.id === id ? { ...s, citizenVerification: answer, status: answer === "yes" ? "CITIZEN VERIFIED" : "AUTHORITY ASSIGNED" } : s));
    if (answer === "yes") { addPoints(5, "Verified resolution"); pushNotif({ icon: Award, tone: "green", title: "Impact Points earned", body: "Your civic action earned +5 Impact Points." }); }
    else pushNotif({ icon: AlertTriangle, tone: "red", title: "Resolution disputed", body: `Community reported that issue ${id} still exists.` });
  };

  const handleRecommendAction = (issueId) => {
    const issue = issues.find((i) => i.id === issueId);
    const newAction = { id: `ACT-${actions.length + 1}`, title: `${issue.area.split(",")[0]} Cleanup Drive`, issueId, ngo: NGOS[Math.floor(Math.random() * NGOS.length)], volunteersNeeded: 8, volunteers: [], status: "Upcoming", beforePhoto: false, afterPhoto: false, distanceKm: (0.5 + Math.random() * 2).toFixed(1), estimatedImpact: issue.affected };
    setActions((prev) => [...prev, newAction]);
    setIssues((prev) => prev.map((i) => i.id === issueId ? { ...i, linkedActionId: newAction.id, status: "COMMUNITY ACTION" } : i));
    setSelectedIssue((s) => (s && s.id === issueId ? { ...s, linkedActionId: newAction.id, status: "COMMUNITY ACTION" } : s));
    pushNotif({ icon: Megaphone, tone: "forest", title: "Volunteers needed", body: `A civic issue near you needs volunteers — ${newAction.title}.` });
  };

  const handleJoinAction = (actionId) => {
    setActions((prev) => prev.map((a) => a.id === actionId && !a.volunteers.includes("You") ? { ...a, volunteers: [...a.volunteers, "You"], status: a.status === "Upcoming" && a.volunteers.length + 1 >= 3 ? "In Progress" : a.status } : a));
    setSelectedAction((s) => (s && s.id === actionId && !s.volunteers.includes("You") ? { ...s, volunteers: [...s.volunteers, "You"] } : s));
    addPoints(15, "Joined community action");
  };
  const handleUploadEvidence = (actionId, type) => {
    setActions((prev) => prev.map((a) => a.id === actionId ? { ...a, [type === "before" ? "beforePhoto" : "afterPhoto"]: true } : a));
    setSelectedAction((s) => (s && s.id === actionId ? { ...s, [type === "before" ? "beforePhoto" : "afterPhoto"]: true } : s));
  };
  const handleMarkCompleted = (actionId) => {
    setActions((prev) => prev.map((a) => a.id === actionId ? { ...a, status: "Completed" } : a));
    setSelectedAction((s) => (s && s.id === actionId ? { ...s, status: "Completed" } : s));
    addPoints(25, "Completed verified community action");
    pushNotif({ icon: Award, tone: "green", title: "Impact Points earned", body: "Your civic action earned +25 Impact Points." });
  };

  const openIssue = (issue) => { const fresh = issues.find((i) => i.id === issue.id) || issue; setSelectedIssue(fresh); };
  const openAction = (action) => { const fresh = actions.find((a) => a.id === action.id) || action; setSelectedAction(fresh); };

  const enterApp = (r, tab) => {
    setRole(r || "citizen"); setScreen("app");
    if (r === "citizen" && tab) setCitizenTab(tab);
  };

  const citizenTabs = [{ id: "dashboard", label: "Dashboard", icon: LayoutGrid }, { id: "report", label: "Report Issue", icon: Camera }, { id: "community", label: "Community Issues", icon: Layers }, { id: "profile", label: "My Impact", icon: Award }];
  const volunteerTabs = [{ id: "dashboard", label: "Dashboard", icon: LayoutGrid }, { id: "actions", label: "Actions", icon: Handshake }, { id: "profile", label: "My Impact", icon: Award }];
  const authorityTabs = [{ id: "dashboard", label: "Dashboard", icon: LayoutGrid }, { id: "queue", label: "Priority Queue", icon: Filter }, { id: "map", label: "Map", icon: MapIcon }, { id: "analytics", label: "Analytics", icon: BarChart3 }];
  const ngoTabs = [{ id: "dashboard", label: "Dashboard", icon: LayoutGrid }, { id: "campaigns", label: "Campaigns", icon: ClipboardList }, { id: "impact", label: "Impact", icon: TrendingUp }];

  if (screen === "landing") return <LandingPage onEnter={enterApp} />;

  return (
    <div className="ii-app">
      <style>{GLOBAL_CSS}</style>
      <TopBar role={role} setRole={setRole} userName={userName} onOpenNotif={() => setNotifOpen(true)} onGoLanding={() => setScreen("landing")} />

      {role === "citizen" && !selectedIssue && !selectedAction && (
        <>
          <TabRow tabs={citizenTabs} active={citizenTab} setActive={setCitizenTab} />
          {citizenTab === "dashboard" && <CitizenDashboard userName={userName} civicScore={civicScore} issues={issues} actions={actions} onOpenIssue={openIssue} onOpenAction={openAction} setTab={setCitizenTab} />}
          {citizenTab === "report" && <CitizenReport issues={issues} onSubmitNew={handleSubmitNew} onJoinExisting={handleJoinExisting} />}
          {citizenTab === "community" && <CitizenCommunity issues={issues} onConfirm={handleConfirm} onOpen={openIssue} />}
          {citizenTab === "profile" && <ImpactProfile role="citizen" userName={userName} onNameChange={handleNameChange} civicScore={civicScore} ledger={ledger} extraStats={[{ label: "Reported", value: 21 }, { label: "Resolved", value: 16 }, { label: "Actions", value: 8 }, { label: "Verified", value: 13 }]} />}
          <NotifDrawer open={notifOpen} onClose={() => setNotifOpen(false)} items={notifications} />
        </>
      )}

      {role === "volunteer" && !selectedIssue && !selectedAction && (
        <>
          <TabRow tabs={volunteerTabs} active={volunteerTab} setActive={setVolunteerTab} />
          {volunteerTab === "dashboard" && <VolunteerDashboard actions={actions} onOpenAction={openAction} />}
          {volunteerTab === "actions" && <VolunteerActions actions={actions} issues={issues} onOpenAction={openAction} />}
          {volunteerTab === "profile" && <ImpactProfile role="volunteer" userName={userName} onNameChange={handleNameChange} civicScore={1240} ledger={ledger} extraStats={[{ label: "Completed", value: 12 }, { label: "Helped Resolve", value: 9 }, { label: "Campaigns", value: 4 }, { label: "Verified", value: 9 }]} />}
          <NotifDrawer open={notifOpen} onClose={() => setNotifOpen(false)} items={notifications} />
        </>
      )}

      {role === "authority" && !selectedIssue && (
        <>
          <TabRow tabs={authorityTabs} active={authorityTab} setActive={setAuthorityTab} />
          {authorityTab === "dashboard" && <AuthorityDashboard issues={issues} onOpen={setSelectedIssue} />}
          {authorityTab === "queue" && <AuthorityQueue issues={issues} onOpen={setSelectedIssue} />}
          {authorityTab === "map" && <AuthorityMap issues={issues} onOpen={setSelectedIssue} />}
          {authorityTab === "analytics" && <AuthorityAnalytics issues={issues} />}
        </>
      )}

      {role === "ngo" && !selectedIssue && !selectedAction && (
        <>
          <TabRow tabs={ngoTabs} active={ngoTab} setActive={setNgoTab} />
          {ngoTab === "dashboard" && <NGODashboard issues={issues} actions={actions} onOpenAction={openAction} />}
          {ngoTab === "campaigns" && <NGOCampaigns actions={actions} issues={issues} onOpenAction={openAction} />}
          {ngoTab === "impact" && <NGOImpact actions={actions} />}
        </>
      )}

      {selectedIssue && (
        <CommunityIssueDetail
          issue={issues.find((i) => i.id === selectedIssue.id) || selectedIssue}
          issues={issues} actions={actions} role={role}
          onClose={() => setSelectedIssue(null)}
          onConfirm={handleConfirm} onAssign={handleAssign} onStatus={handleStatus} onNotes={handleNotes} onVerify={handleVerify}
          onRecommendAction={handleRecommendAction} onOpenAction={openAction}
        />
      )}
      {selectedAction && !selectedIssue && (
        <ActionDetail
          action={actions.find((a) => a.id === selectedAction.id) || selectedAction}
          issue={issues.find((i) => i.id === (actions.find((a) => a.id === selectedAction.id) || selectedAction).issueId)}
          role={role} onClose={() => setSelectedAction(null)}
          onJoin={handleJoinAction} onUploadEvidence={handleUploadEvidence} onMarkCompleted={handleMarkCompleted}
        />
      )}

      {!selectedIssue && !selectedAction && (
        <div className="max-w-6xl mx-auto px-5 py-6 ii-eyebrow text-center" style={{ color: "var(--slate-light)" }}>
          PROTOTYPE — AI classification, severity/impact estimation, and duplicate clustering are simulated with rule-based logic for this demo, structured to be swapped for a real model + backend later. Demo data is fictional.
        </div>
      )}
    </div>
  );
}
