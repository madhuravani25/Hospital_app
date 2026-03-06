import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── DOCTOR DATA ───────────────────────────────────────────────────────────────
const DOCTOR = {
  name: "Dr. Arjun Mehta",
  specialty: "Cardiologist",
  degree: "MBBS, MD (Cardiology), DM",
  experience: "18 years",
  licenseNo: "MCI-2006-04521",
  hospital: "MediCare Advanced Hospital",
  email: "arjun.mehta@medicare.in",
  phone: "+91 98765 43210",
  consultFee: 800,
  rating: 4.9,
  reviews: 312,
  totalPatients: 3420,
  img: "https://api.dicebear.com/7.x/personas/svg?seed=arjun&backgroundColor=b6e3f4",
  about: "Dr. Arjun Mehta is a senior interventional cardiologist with 18+ years of experience at MediCare Advanced Hospital. He specializes in complex coronary interventions, structural heart disease, and advanced heart failure management. He has successfully performed over 5,000 cardiac procedures and is known for his patient-first approach.",
  languages: ["English", "Hindi", "Telugu"],
  awards: ["Best Cardiologist — Andhra Pradesh 2022", "Excellence in Cardiac Care Award 2020", "Top Doctor — MediCare Hospital 2019"],
  education: [
    { year:"2003–2006", degree:"DM — Cardiology", college:"AIIMS, New Delhi" },
    { year:"2000–2003", degree:"MD — Internal Medicine", college:"JIPMER, Puducherry" },
    { year:"1994–2000", degree:"MBBS", college:"Osmania Medical College, Hyderabad" },
  ],
};

const WEEK_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const ALL_SLOTS  = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM"];

// Initial availability set by doctor
const INIT_AVAIL = {
  Monday:    { active:true,  slots:["09:00 AM","09:30 AM","10:00 AM","10:30 AM","02:00 PM","02:30 PM","03:00 PM"] },
  Tuesday:   { active:true,  slots:["09:00 AM","10:00 AM","11:00 AM","03:00 PM","04:00 PM","04:30 PM"] },
  Wednesday: { active:false, slots:[] },
  Thursday:  { active:true,  slots:["09:30 AM","10:30 AM","02:30 PM","03:30 PM","04:00 PM"] },
  Friday:    { active:true,  slots:["09:00 AM","09:30 AM","10:00 AM","11:00 AM","02:00 PM","04:30 PM"] },
  Saturday:  { active:true,  slots:["10:00 AM","10:30 AM","11:00 AM","11:30 AM"] },
  Sunday:    { active:false, slots:[] },
};

// Incoming booking requests from patients
const INIT_REQUESTS = [
  { id:1, patient:"Ravi Kumar",    age:45, date:"Monday",    slot:"09:00 AM", issue:"Chest pain & breathlessness",       status:"Pending",   avatar:"RK", color:"#6366f1" },
  { id:2, patient:"Meena Devi",    age:38, date:"Monday",    slot:"09:30 AM", issue:"Post angioplasty follow-up",        status:"Pending",   avatar:"MD", color:"#0d9488" },
  { id:3, patient:"Suresh Babu",   age:60, date:"Tuesday",   slot:"10:00 AM", issue:"Hypertension management",           status:"Confirmed", avatar:"SB", color:"#f59e0b" },
  { id:4, patient:"Priya Nair",    age:52, date:"Thursday",  slot:"02:30 PM", issue:"Echocardiography review",           status:"Pending",   avatar:"PN", color:"#ec4899" },
  { id:5, patient:"Kavith Sharma", age:33, date:"Friday",    slot:"09:00 AM", issue:"Routine cardiac checkup",           status:"Confirmed", avatar:"KS", color:"#8b5cf6" },
  { id:6, patient:"Anand Rao",     age:70, date:"Friday",    slot:"11:00 AM", issue:"Pacemaker device check",            status:"Pending",   avatar:"AR", color:"#06b6d4" },
];

const MENU = [
  { key:"profile",       label:"My Profile",      icon:"👨‍⚕️" },
  { key:"availability",  label:"Availability",    icon:"📅" },
  { key:"requests",      label:"Slot Requests",   icon:"🔔" },
  { key:"appointments",  label:"Appointments",    icon:"🗓️" },
  { key:"prescription",  label:"Prescriptions",   icon:"📝" },
  { key:"patients",      label:"My Patients",     icon:"👥" },
  { key:"earnings",      label:"Earnings",        icon:"💰" },
];

// ── PRESCRIPTION HELPERS ──────────────────────────────────────────────────────
const FREQUENCIES = ["Once daily","Twice daily","Three times daily","Four times daily","Every 8 hours","Every 12 hours","As needed","Before meals","After meals","At bedtime"];
const DURATIONS   = ["1 day","3 days","5 days","7 days","10 days","14 days","21 days","30 days","45 days","60 days","90 days","Ongoing"];
const emptyMed    = () => ({ id: Date.now() + Math.random(), name:"", dosage:"", frequency:"Twice daily", duration:"7 days", instructions:"" });
const genRxNo     = () => `RX-${new Date().getFullYear()}-${String(Math.floor(Math.random()*90000)+10000)}`;

function buildPrescriptionHTML(rx) {
  const rows = rx.medicines.map((m, i) => `
    <tr>
      <td style="font-weight:700;color:#06b6d4;text-align:center;">${i+1}</td>
      <td><strong>${m.name||"—"}</strong></td>
      <td style="color:#6366f1;">${m.dosage||"—"}</td>
      <td style="color:#059669;">${m.frequency}</td>
      <td style="color:#d97706;">${m.duration}</td>
      <td style="color:#64748b;">${m.instructions||"—"}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Prescription — ${rx.patientName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:#f8fafc;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .page{width:210mm;min-height:297mm;margin:0 auto;background:white;box-shadow:0 0 40px rgba(0,0,0,0.12);}
  .header{background:#07090f;padding:22px 30px 18px;border-bottom:4px solid #06b6d4;}
  .hosp{font-size:20px;font-weight:800;color:#06b6d4;margin-bottom:3px;}
  .hosp-sub{font-size:9px;color:#64748b;margin-bottom:12px;}
  .header-row{display:flex;justify-content:space-between;align-items:flex-end;}
  .rx-heading{font-size:24px;font-weight:800;color:white;letter-spacing:.04em;}
  .rx-meta{font-size:9px;color:#94a3b8;margin-top:3px;}
  .doc-right{text-align:right;}
  .doc-name{font-size:13px;font-weight:700;color:#22d3ee;}
  .doc-sub{font-size:9px;color:#94a3b8;margin-top:2px;}
  .pat-card{display:flex;justify-content:space-between;align-items:center;background:#0d1a2d;margin:16px 30px;border-radius:10px;padding:14px 18px;border-left:4px solid #06b6d4;}
  .pat-label{font-size:8px;font-weight:700;color:#64748b;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px;}
  .pat-name{font-size:16px;font-weight:800;color:white;margin-bottom:3px;}
  .pat-meta{font-size:10px;color:#94a3b8;}
  .diag-val{font-size:14px;font-weight:700;color:#fbbf24;text-align:right;}
  .body{padding:0 30px 20px;}
  .sec{font-size:10px;font-weight:700;color:#06b6d4;letter-spacing:.12em;text-transform:uppercase;margin:16px 0 10px;display:flex;align-items:center;gap:8px;}
  .sec::before{content:'Rx';font-family:serif;font-size:17px;font-weight:900;color:#06b6d4;}
  .sec::after{content:'';flex:1;height:1px;background:rgba(6,182,212,.2);}
  table{width:100%;border-collapse:collapse;font-size:11.5px;}
  thead th{background:#0d1a2d;color:#94a3b8;padding:8px 10px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;}
  tbody td{padding:9px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;}
  tbody tr:nth-child(even) td{background:#f8fafc;}
  tbody tr:last-child td{border-bottom:none;}
  .notes-box{background:#f0fdf4;border:1px solid #bbf7d0;border-left:3px solid #10b981;border-radius:8px;padding:12px 16px;margin-top:14px;font-size:12px;line-height:1.7;color:#166534;}
  .notes-lbl{font-size:9px;font-weight:700;color:#10b981;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px;}
  .followup{display:inline-flex;align-items:center;gap:8px;background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:8px 14px;margin-top:12px;font-size:12px;color:#92400e;font-weight:600;}
  .sig{display:flex;justify-content:flex-end;margin:22px 30px 0;}
  .sig-box{text-align:center;min-width:155px;}
  .sig-line{border-bottom:1.5px solid #cbd5e1;height:36px;margin-bottom:6px;}
  .sig-name{font-size:11px;font-weight:700;color:#1e293b;}
  .sig-sub{font-size:9px;color:#64748b;margin-top:2px;}
  .footer{background:#07090f;padding:12px 30px;text-align:center;margin-top:20px;}
  .footer-main{font-size:9px;color:#06b6d4;font-weight:600;display:block;margin-bottom:3px;}
  .footer-sub{font-size:8px;color:#475569;}
  @media print{body{background:white;}.page{box-shadow:none;}}
</style></head><body>
<div class="page">
  <div class="header">
    <div class="hosp">MediCare Advanced Hospital</div>
    <div class="hosp-sub">Sector 12, Hitech City, Hyderabad – 500081 &nbsp;|&nbsp; Tel: +91 40 6666 7777 &nbsp;|&nbsp; www.medicare.in</div>
    <div class="header-row">
      <div>
        <div class="rx-heading">PRESCRIPTION</div>
        <div class="rx-meta">Rx No: ${rx.rxNo} &nbsp;|&nbsp; Date: ${rx.date} &nbsp;|&nbsp; Valid for 30 days</div>
      </div>
      <div class="doc-right">
        <div class="doc-name">${rx.doctorName}</div>
        <div class="doc-sub">${rx.doctorSpecialty}</div>
        <div class="doc-sub">Reg: ${rx.doctorReg}</div>
      </div>
    </div>
  </div>
  <div class="pat-card">
    <div>
      <div class="pat-label">Patient</div>
      <div class="pat-name">${rx.patientName||"—"}</div>
      <div class="pat-meta">Age: ${rx.patientAge||"—"} yrs &nbsp;|&nbsp; Gender: ${rx.patientGender} &nbsp;|&nbsp; Phone: ${rx.patientPhone||"—"}</div>
    </div>
    <div style="text-align:right">
      <div class="pat-label">Diagnosis</div>
      <div class="diag-val">${rx.diagnosis||"—"}</div>
    </div>
  </div>
  <div class="body">
    <div class="sec">MEDICINES PRESCRIBED</div>
    <table>
      <thead><tr><th style="width:30px">#</th><th>Medicine Name</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${rx.notes ? `<div class="notes-box"><div class="notes-lbl">📋 Doctor's Notes & Advice</div>${rx.notes}</div>` : ""}
    ${rx.followup ? `<div class="followup">📅 Follow-up: ${rx.followup}</div>` : ""}
  </div>
  <div class="sig">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-name">${rx.doctorName}</div>
      <div class="sig-sub">${rx.doctorSpecialty}</div>
      <div class="sig-sub">Reg: ${rx.doctorReg}</div>
    </div>
  </div>
  <div class="footer">
    <span class="footer-main">This prescription is valid for 30 days from the date of issue.</span>
    <span class="footer-sub">MediCare Advanced Hospital &nbsp;|&nbsp; Hitech City, Hyderabad &nbsp;|&nbsp; +91 40 6666 7777</span>
  </div>
</div>
</body></html>`;
}

function printRx(rx) {
  const w = window.open("","_blank","width=900,height=1100");
  w.document.write(buildPrescriptionHTML(rx));
  w.document.close();
  w.onload = () => setTimeout(() => { w.focus(); w.print(); }, 500);
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;font-family:'DM Sans',sans-serif;}
.disp{font-family:'Bebas Neue',sans-serif;letter-spacing:0.04em;}
.glass{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);}
.sidebar-dark{background:rgba(0,0,0,0.4);backdrop-filter:blur(20px);border-right:1px solid rgba(255,255,255,0.06);}
.sitem{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:12px;cursor:pointer;transition:all 0.2s;color:rgba(255,255,255,0.4);font-size:13px;font-weight:500;border:none;background:none;width:100%;text-align:left;}
.sitem:hover{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.8);}
.sitem.active{background:rgba(6,182,212,0.12);color:#22d3ee;}
.fade-up{animation:fu 0.42s ease both;}
@keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}
.main-scroll{overflow-y:auto;height:100vh;}
.main-scroll::-webkit-scrollbar{width:4px;}
.main-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px;}

/* Toggle switch */
.tog{width:46px;height:26px;border-radius:99px;cursor:pointer;transition:background 0.3s;border:none;position:relative;flex-shrink:0;}
.tog::after{content:'';position:absolute;width:20px;height:20px;border-radius:50%;background:white;top:3px;transition:left 0.3s;box-shadow:0 1px 4px rgba(0,0,0,0.3);}
.tog.on{background:rgba(6,182,212,0.75);}
.tog.on::after{left:23px;}
.tog.off{background:rgba(255,255,255,0.15);}
.tog.off::after{left:3px;}

/* Prescription form */
.rx-input{width:100%;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 13px;color:white;font-size:13px;outline:none;font-family:'DM Sans',sans-serif;transition:border-color 0.2s;}
.rx-input:focus{border-color:rgba(6,182,212,0.45);background:rgba(6,182,212,0.04);}
.rx-input::placeholder{color:rgba(255,255,255,0.2);}
.rx-sel{width:100%;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 13px;color:white;font-size:13px;outline:none;font-family:'DM Sans',sans-serif;cursor:pointer;appearance:none;}
.rx-sel option{background:#0d1520;color:white;}
.lbl{display:block;color:rgba(255,255,255,0.35);font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;}
.med-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:13px;padding:14px;margin-bottom:10px;position:relative;transition:border-color 0.2s;}
.med-card:hover{border-color:rgba(6,182,212,0.2);}
.add-med{width:100%;background:rgba(6,182,212,0.06);border:1.5px dashed rgba(6,182,212,0.25);border-radius:11px;padding:11px;color:#22d3ee;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;margin-top:4px;}
.add-med:hover{background:rgba(6,182,212,0.12);border-color:rgba(6,182,212,0.45);}
/* PDF Preview */
.rx-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(16px);z-index:500;display:flex;align-items:center;justify-content:center;padding:12px;}
.rx-modal{width:100%;max-width:660px;max-height:94vh;overflow-y:auto;background:#07090f;border-radius:22px;border:1px solid rgba(255,255,255,0.1);}
.rx-modal::-webkit-scrollbar{width:4px;}
.rx-modal::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
/* Saved list */
.rx-row{border-radius:14px;padding:14px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:10px;display:flex;align-items:center;gap:14px;transition:border-color 0.2s;}
.rx-row:hover{border-color:rgba(6,182,212,0.2);}
.chip:hover:not(.chip-on){border-color:rgba(6,182,212,0.4);color:#22d3ee;}
.chip.chip-on{background:rgba(6,182,212,0.12);border-color:rgba(6,182,212,0.35);color:#22d3ee;}
.chip.chip-off{background:rgba(255,255,255,0.02);border-color:rgba(255,255,255,0.04);color:rgba(255,255,255,0.18);cursor:not-allowed;}

/* Day cards */
.day-card{border-radius:16px;padding:18px;border:1.5px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.025);transition:border-color 0.3s;}
.day-card.day-on{border-color:rgba(6,182,212,0.25);background:rgba(6,182,212,0.04);}

/* Request cards */
.req-card{border-radius:16px;padding:17px 18px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);transition:all 0.2s;margin-bottom:10px;}
.req-card:hover{background:rgba(255,255,255,0.05);}

/* Badges */
.badge{display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:600;}
.b-pending{background:rgba(251,191,36,0.12);color:#fbbf24;border:1px solid rgba(251,191,36,0.2);}
.b-confirmed{background:rgba(16,185,129,0.12);color:#34d399;border:1px solid rgba(16,185,129,0.2);}
.b-rejected{background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.15);}

/* Action buttons */
.btn-accept{background:rgba(16,185,129,0.13);border:1px solid rgba(16,185,129,0.28);border-radius:10px;padding:7px 16px;color:#34d399;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;}
.btn-accept:hover{background:rgba(16,185,129,0.22);}
.btn-reject{background:rgba(239,68,68,0.09);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:7px 16px;color:#f87171;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;}
.btn-reject:hover{background:rgba(239,68,68,0.16);}

/* Overlay */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(10px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
.modal{width:100%;max-width:440px;border-radius:22px;background:#0b0f1a;border:1px solid rgba(255,255,255,0.1);}
.pop{animation:pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;}
@keyframes pop{from{opacity:0;transform:scale(0.65)}to{opacity:1;transform:scale(1)}}
.ring{stroke-dasharray:166;stroke-dashoffset:166;animation:draw 0.7s 0.2s ease forwards;}
.tick{stroke-dasharray:48;stroke-dashoffset:48;animation:draw 0.4s 0.85s ease forwards;}
.cross1{stroke-dasharray:34;stroke-dashoffset:34;animation:draw 0.35s 0.3s ease forwards;}
.cross2{stroke-dasharray:34;stroke-dashoffset:34;animation:draw 0.35s 0.55s ease forwards;}
@keyframes draw{to{stroke-dashoffset:0}}

/* Online pulse */
.pulse{animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.5)}}
`;

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState("profile");
  const [isOnline, setIsOnline]   = useState(true);
  const [avail, setAvail]         = useState(INIT_AVAIL);
  const [requests, setRequests]   = useState(INIT_REQUESTS);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [confirm, setConfirm]     = useState(null);
  const [done, setDone]           = useState(null);

  // ── PRESCRIPTION STATE ──
  const [savedRxList, setSavedRxList] = useState([]);
  const [rxForm, setRxForm] = useState({
    rxNo: genRxNo(), date: new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}),
    doctorName: DOCTOR.name, doctorSpecialty: DOCTOR.specialty, doctorReg: DOCTOR.licenseNo,
    patientName:"", patientAge:"", patientGender:"Male", patientPhone:"",
    diagnosis:"", medicines:[emptyMed()], notes:"", followup:"",
  });
  const [rxPreview, setRxPreview]   = useState(false);
  const [rxSaved,   setRxSaved]     = useState(false);
  //const [editingRx, setEditingRx]   = useState(null); // id of rx being viewed

  // Derived
  const activeDays   = Object.values(avail).filter(d => d.active).length;
  const totalSlots   = Object.values(avail).reduce((a,d) => a + (d.active ? d.slots.length : 0), 0);
  const pendingCount = requests.filter(r => r.status === "Pending").length;

  const toggleDay  = (day) => setAvail(p => ({ ...p, [day]: { ...p[day], active: !p[day].active } }));
  const toggleSlot = (day, slot) => setAvail(p => {
    const s = p[day].slots.includes(slot) ? p[day].slots.filter(x=>x!==slot) : [...p[day].slots, slot];
    return { ...p, [day]: { ...p[day], slots: s } };
  });

  const saveAvail = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(()=>setSaved(false), 2500); }, 1100);
  };

  // ── PRESCRIPTION HELPERS ──
  const setRxField = (k,v) => setRxForm(p=>({...p,[k]:v}));
  const setMed = (i,k,v) => setRxForm(p=>{ const m=[...p.medicines]; m[i]={...m[i],[k]:v}; return {...p,medicines:m}; });
  const addMed = () => setRxForm(p=>({...p, medicines:[...p.medicines, emptyMed()]}));
  const removeMed = (i) => setRxForm(p=>({...p, medicines:p.medicines.filter((_,idx)=>idx!==i)}));
  const rxValid = rxForm.patientName && rxForm.diagnosis && rxForm.medicines.some(m=>m.name);

  const saveRx = () => {
    const rx = {
      ...rxForm, id: Date.now(), status: "Active",
      doctorImg: DOCTOR.img,
      savedAt: new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})
    };
    setSavedRxList(p => [rx, ...p]);
    // Persist so patient Dashboard reads it live
    try {
      const existing = JSON.parse(localStorage.getItem("medicare_prescriptions") || "[]");
      localStorage.setItem("medicare_prescriptions", JSON.stringify([rx, ...existing]));
    } catch(e) {}
    setRxSaved(true);
    setRxPreview(false);
    setTimeout(() => setRxSaved(false), 2500);
    setRxForm({ rxNo:genRxNo(), date:new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}),
      doctorName:DOCTOR.name, doctorSpecialty:DOCTOR.specialty, doctorReg:DOCTOR.licenseNo,
      patientName:"", patientAge:"", patientGender:"Male", patientPhone:"",
      diagnosis:"", medicines:[emptyMed()], notes:"", followup:"" });
  };

  const handleAction = (req, action) => setConfirm({ req, action });

  const confirmAction = () => {
    const { req, action } = confirm;
    setRequests(p => p.map(r => r.id===req.id ? { ...r, status: action==="accept" ? "Confirmed" : "Rejected" } : r));
    setDone({ action, req });
    setConfirm(null);
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#07090f", color:"white", display:"flex" }}>
      <style>{CSS}</style>

      {/* ── SIDEBAR ── */}
      <div className="sidebar-dark" style={{ width:225, flexShrink:0, padding:"22px 14px", display:"flex", flexDirection:"column", gap:4, position:"sticky", top:0, height:"100vh" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 4px", marginBottom:22 }}>
          <div style={{ width:38, height:38, borderRadius:12, background:"linear-gradient(135deg,#06b6d4,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(6,182,212,0.35)" }}>
            <span className="disp" style={{ fontSize:20, color:"white" }}>M</span>
          </div>
          <div>
            <div className="disp" style={{ fontSize:18, color:"white", lineHeight:1 }}>MediCare</div>
            <div style={{ fontSize:8, color:"#06b6d4", letterSpacing:"0.15em", fontWeight:600 }}>DOCTOR PORTAL</div>
          </div>
        </div>

        {/* Availability toggle */}
        <div onClick={() => setIsOnline(p=>!p)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:isOnline?"rgba(16,185,129,0.08)":"rgba(255,255,255,0.04)", border:`1px solid ${isOnline?"rgba(16,185,129,0.22)":"rgba(255,255,255,0.08)"}`, borderRadius:12, padding:"10px 13px", marginBottom:14, cursor:"pointer", transition:"all 0.3s" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div className="pulse" style={{ width:8, height:8, borderRadius:"50%", background:isOnline?"#10b981":"#6b7280" }}/>
            <div>
              <div style={{ color:"white", fontSize:12, fontWeight:700 }}>{isOnline ? "Available" : "Unavailable"}</div>
              <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>Patient bookings {isOnline?"open":"closed"}</div>
            </div>
          </div>
          <button className={`tog ${isOnline?"on":"off"}`} onClick={e=>{e.stopPropagation();setIsOnline(p=>!p);}}/>
        </div>

        <div style={{ fontSize:9, color:"rgba(255,255,255,0.18)", letterSpacing:"0.12em", fontWeight:600, padding:"0 4px", marginBottom:4 }}>MENU</div>

        {MENU.map(item => (
          <button key={item.key} className={`sitem ${tab===item.key?"active":""}`} onClick={()=>setTab(item.key)}>
            <span style={{ fontSize:16 }}>{item.icon}</span>
            <span style={{ flex:1 }}>{item.label}</span>
            {item.key==="requests" && pendingCount>0 && (
              <span style={{ background:"#ef4444", borderRadius:99, padding:"1px 7px", fontSize:10, color:"white", fontWeight:700 }}>{pendingCount}</span>
            )}
          </button>
        ))}

        <div style={{ marginTop:"auto" }}>
          <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"10px 0" }}/>
          <button className="sitem"><span style={{ fontSize:16 }}>⚙️</span> Settings</button>
          <button className="sitem" onClick={()=>navigate("/login")} style={{ color:"#f87171" }}><span style={{ fontSize:16 }}>🚪</span> Sign Out</button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="main-scroll" style={{ flex:1, padding:"28px 30px" }}>

        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:26 }}>
          <div>
            <div className="disp" style={{ fontSize:32, color:"white", lineHeight:1 }}>
              {MENU.find(m=>m.key===tab)?.label || "Dashboard"}
            </div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12, marginTop:2 }}>MediCare Doctor Portal</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ color:"white", fontSize:13, fontWeight:600 }}>{DOCTOR.name}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, justifyContent:"flex-end" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:isOnline?"#10b981":"#6b7280" }}/>
                <span style={{ color:isOnline?"#34d399":"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600 }}>
                  {isOnline?"Available for patients":"Unavailable"}
                </span>
              </div>
            </div>
            <img src={DOCTOR.img} alt="" style={{ width:42, height:42, borderRadius:"50%", background:"#1e2030", border:`2px solid ${isOnline?"rgba(16,185,129,0.4)":"rgba(255,255,255,0.1)"}` }}/>
          </div>
        </div>

        {/* ════════════════ PROFILE TAB ════════════════ */}
        {tab==="profile" && (
          <div className="fade-up">
            {/* Stats row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
              {[
                { label:"Total Patients", value:DOCTOR.totalPatients.toLocaleString(), icon:"👥", color:"#06b6d4" },
                { label:"Experience",     value:DOCTOR.experience,                     icon:"🏆", color:"#f59e0b" },
                { label:"Rating",         value:`${DOCTOR.rating} ⭐`,                 icon:"⭐", color:"#fbbf24" },
                { label:"Consult Fee",    value:`₹${DOCTOR.consultFee}`,               icon:"💰", color:"#10b981" },
              ].map((s,i) => (
                <div key={s.label} className={`glass fade-up d${i+1}`} style={{ borderRadius:14, padding:"14px 16px" }}>
                  <div style={{ fontSize:22, marginBottom:5 }}>{s.icon}</div>
                  <div className="disp" style={{ fontSize:24, color:s.color }}>{s.value}</div>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:18 }}>

              {/* LEFT — Profile card */}
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div className="glass" style={{ borderRadius:20, padding:"26px", textAlign:"center" }}>
                  {/* Avatar */}
                  <div style={{ position:"relative", display:"inline-block", marginBottom:14 }}>
                    <img src={DOCTOR.img} alt="" style={{ width:96, height:96, borderRadius:"50%", border:`3px solid ${isOnline?"rgba(16,185,129,0.45)":"rgba(255,255,255,0.12)"}`, background:"#1e2030" }}/>
                    <div style={{ position:"absolute", bottom:3, right:3, width:20, height:20, borderRadius:"50%", background:isOnline?"#10b981":"#6b7280", border:"3px solid #07090f", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {isOnline && <div className="pulse" style={{ width:7, height:7, borderRadius:"50%", background:"white" }}/>}
                    </div>
                  </div>

                  <div className="disp" style={{ fontSize:22, color:"white", marginBottom:4 }}>{DOCTOR.name}</div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.25)", borderRadius:99, padding:"4px 12px", marginBottom:6 }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:"#06b6d4" }}/>
                    <span style={{ color:"#22d3ee", fontSize:12, fontWeight:600 }}>{DOCTOR.specialty}</span>
                  </div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginBottom:4 }}>{DOCTOR.degree}</div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:isOnline?"rgba(16,185,129,0.1)":"rgba(107,114,128,0.1)", border:`1px solid ${isOnline?"rgba(16,185,129,0.25)":"rgba(255,255,255,0.08)"}`, borderRadius:99, padding:"5px 14px", marginBottom:16 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:isOnline?"#10b981":"#6b7280" }}/>
                    <span style={{ color:isOnline?"#34d399":"rgba(255,255,255,0.35)", fontSize:12, fontWeight:600 }}>
                      {isOnline ? "Available for Appointments" : "Currently Unavailable"}
                    </span>
                  </div>

                  {/* Info rows */}
                  {[
                    ["🏥", "Hospital", DOCTOR.hospital],
                    ["✉️", "Email",    DOCTOR.email],
                    ["📞", "Phone",    DOCTOR.phone],
                    ["🪪", "License",  DOCTOR.licenseNo],
                  ].map(([ic,l,v]) => (
                    <div key={l} style={{ display:"flex", gap:10, alignItems:"flex-start", background:"rgba(255,255,255,0.04)", borderRadius:11, padding:"9px 12px", marginBottom:7, textAlign:"left" }}>
                      <span style={{ fontSize:15, flexShrink:0 }}>{ic}</span>
                      <div>
                        <div style={{ color:"rgba(255,255,255,0.28)", fontSize:10, marginBottom:1 }}>{l}</div>
                        <div style={{ color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:500 }}>{v}</div>
                      </div>
                    </div>
                  ))}

                  {/* Languages */}
                  <div style={{ textAlign:"left", marginTop:4 }}>
                    <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, marginBottom:6 }}>Languages</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {DOCTOR.languages.map(l => (
                        <span key={l} style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:99, padding:"3px 10px", color:"#a5b4fc", fontSize:11 }}>{l}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Today's summary */}
                <div className="glass" style={{ borderRadius:18, padding:"18px" }}>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>Today's Summary</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      ["Pending Requests", pendingCount, "⏳", "#f59e0b"],
                      ["Confirmed",        requests.filter(r=>r.status==="Confirmed").length, "✅", "#10b981"],
                      ["Available Slots",  totalSlots,   "🕐", "#06b6d4"],
                      ["Active Days",      activeDays,   "📅", "#8b5cf6"],
                    ].map(([l,v,ic,c]) => (
                      <div key={l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:11, padding:"10px 12px", textAlign:"center" }}>
                        <div style={{ fontSize:18, marginBottom:3 }}>{ic}</div>
                        <div className="disp" style={{ fontSize:22, color:c }}>{v}</div>
                        <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {/* About */}
                <div className="glass" style={{ borderRadius:18, padding:"20px" }}>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>About</div>
                  <div style={{ color:"rgba(255,255,255,0.72)", fontSize:13, lineHeight:1.85 }}>{DOCTOR.about}</div>
                </div>

                {/* Education */}
                <div className="glass" style={{ borderRadius:18, padding:"20px" }}>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>Education</div>
                  {DOCTOR.education.map((e,i) => (
                    <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:12 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:"#06b6d4", marginTop:5, flexShrink:0 }}/>
                      <div>
                        <div style={{ color:"white", fontWeight:600, fontSize:13 }}>{e.degree}</div>
                        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>{e.college}</div>
                        <div style={{ color:"#06b6d4", fontSize:11, marginTop:1 }}>{e.year}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Awards */}
                <div className="glass" style={{ borderRadius:18, padding:"20px" }}>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>Awards & Recognition</div>
                  {DOCTOR.awards.map((a,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, background:"rgba(251,191,36,0.06)", borderRadius:10, padding:"8px 12px" }}>
                      <span style={{ fontSize:18 }}>🏆</span>
                      <div style={{ color:"rgba(255,255,255,0.75)", fontSize:13 }}>{a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ AVAILABILITY TAB ════════════════ */}
        {tab==="availability" && (
          <div className="fade-up">
            {/* Availability status banner */}
            <div style={{ background:isOnline?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.07)", border:`1px solid ${isOnline?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.15)"}`, borderRadius:14, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div className="pulse" style={{ width:10, height:10, borderRadius:"50%", background:isOnline?"#10b981":"#ef4444" }}/>
                <div>
                  <div style={{ color:"white", fontWeight:700, fontSize:14 }}>
                    {isOnline ? "You are currently Available for Patient Bookings" : "You are currently Unavailable — Bookings are Paused"}
                  </div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:1 }}>
                    {isOnline ? "Patients can see and book your available slots." : "Toggle the switch to accept patient appointments."}
                  </div>
                </div>
              </div>
              <button className={`tog ${isOnline?"on":"off"}`} onClick={()=>setIsOnline(p=>!p)} style={{ transform:"scale(1.2)" }}/>
            </div>

            {/* Summary stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
              {[
                { label:"Active Days",  value:activeDays,  icon:"📅", color:"#06b6d4" },
                { label:"Total Slots", value:totalSlots,   icon:"🕐", color:"#10b981" },
                { label:"Off Days",    value:7-activeDays, icon:"⛔", color:"#f87171" },
              ].map(s => (
                <div key={s.label} className="glass" style={{ borderRadius:13, padding:"13px 16px" }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
                  <div className="disp" style={{ fontSize:26, color:s.color }}>{s.value}</div>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>
                Toggle the day switch to mark days off. Click slots to enable/disable them.
              </div>
              <button onClick={saveAvail} disabled={saving}
                style={{ background:saved?"rgba(16,185,129,0.12)":"linear-gradient(135deg,#06b6d4,#6366f1)", border:saved?"1px solid rgba(16,185,129,0.3)":"none", borderRadius:12, padding:"10px 24px", color:saved?"#34d399":"white", fontWeight:700, cursor:saving?"not-allowed":"pointer", fontSize:13, transition:"all 0.3s" }}>
                {saving?"Saving...":saved?"✅ Saved!":"Save Availability"}
              </button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:14 }}>
              {WEEK_DAYS.map(day => (
                <div key={day} className={`day-card ${avail[day].active?"day-on":""}`}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:avail[day].active?12:0 }}>
                    <div>
                      <div style={{ color:"white", fontWeight:700, fontSize:15 }}>{day}</div>
                      <div style={{ color:avail[day].active?"rgba(6,182,212,0.8)":"rgba(255,255,255,0.28)", fontSize:11, marginTop:1 }}>
                        {avail[day].active ? `${avail[day].slots.length} slot${avail[day].slots.length!==1?"s":""} active` : "Marked as off day"}
                      </div>
                    </div>
                    <button className={`tog ${avail[day].active?"on":"off"}`} onClick={()=>toggleDay(day)}/>
                  </div>
                  {avail[day].active && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {ALL_SLOTS.map(slot => (
                        <span key={slot} className={`chip ${avail[day].slots.includes(slot)?"chip-on":""}`} onClick={()=>toggleSlot(day,slot)}>
                          {avail[day].slots.includes(slot) ? "✓ " : ""}{slot}
                        </span>
                      ))}
                    </div>
                  )}
                  {!avail[day].active && (
                    <div style={{ color:"rgba(255,255,255,0.18)", fontSize:12, marginTop:8 }}>⛔ Not available on this day</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════ SLOT REQUESTS TAB ════════════════ */}
        {tab==="requests" && (
          <div className="fade-up">
            {/* Filter tabs */}
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              {[
                ["All",       requests.length,                                    "#06b6d4"],
                ["Pending",   requests.filter(r=>r.status==="Pending").length,   "#f59e0b"],
                ["Confirmed", requests.filter(r=>r.status==="Confirmed").length, "#10b981"],
                ["Rejected",  requests.filter(r=>r.status==="Rejected").length,  "#ef4444"],
              ].map(([l,c,col]) => (
                <div key={l} className="glass" style={{ borderRadius:11, padding:"10px 16px", textAlign:"center", minWidth:80 }}>
                  <div className="disp" style={{ fontSize:22, color:col }}>{c}</div>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Pending section */}
            {requests.filter(r=>r.status==="Pending").length>0 && (
              <>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>
                  ⏳ Awaiting Your Confirmation
                </div>
                {requests.filter(r=>r.status==="Pending").map(req => (
                  <div key={req.id} className="req-card" style={{ border:"1px solid rgba(251,191,36,0.15)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:`${req.color}20`, display:"flex", alignItems:"center", justifyContent:"center", color:req.color, fontWeight:700, fontSize:14, flexShrink:0 }}>{req.avatar}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                          <div style={{ color:"white", fontWeight:700, fontSize:14 }}>{req.patient}</div>
                          <span style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>Age {req.age}</span>
                          <span className="badge b-pending">⏳ Pending</span>
                        </div>
                        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                          <span style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>📋 {req.issue}</span>
                          <span style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>📅 {req.date}</span>
                          <span style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>🕐 {req.slot}</span>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                        <button className="btn-accept" onClick={()=>handleAction(req,"accept")}>✓ Accept</button>
                        <button className="btn-reject" onClick={()=>handleAction(req,"reject")}>✕ Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Confirmed section */}
            {requests.filter(r=>r.status==="Confirmed").length>0 && (
              <>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", margin:"18px 0 10px" }}>
                  ✅ Confirmed Slots
                </div>
                {requests.filter(r=>r.status==="Confirmed").map(req => (
                  <div key={req.id} className="req-card" style={{ border:"1px solid rgba(16,185,129,0.15)", opacity:0.85 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:`${req.color}20`, display:"flex", alignItems:"center", justifyContent:"center", color:req.color, fontWeight:700, fontSize:14, flexShrink:0 }}>{req.avatar}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                          <div style={{ color:"white", fontWeight:700, fontSize:14 }}>{req.patient}</div>
                          <span className="badge b-confirmed">✅ Confirmed</span>
                        </div>
                        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📋 {req.issue}</span>
                          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📅 {req.date}</span>
                          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>🕐 {req.slot}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Rejected section */}
            {requests.filter(r=>r.status==="Rejected").length>0 && (
              <>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", margin:"18px 0 10px" }}>
                  ❌ Rejected Slots
                </div>
                {requests.filter(r=>r.status==="Rejected").map(req => (
                  <div key={req.id} className="req-card" style={{ border:"1px solid rgba(239,68,68,0.1)", opacity:0.6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:"rgba(239,68,68,0.08)", display:"flex", alignItems:"center", justifyContent:"center", color:"#f87171", fontWeight:700, fontSize:14, flexShrink:0 }}>{req.avatar}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <div style={{ color:"rgba(255,255,255,0.6)", fontWeight:700, fontSize:14 }}>{req.patient}</div>
                          <span className="badge b-rejected">❌ Rejected</span>
                        </div>
                        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                          <span style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>📅 {req.date}</span>
                          <span style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>🕐 {req.slot}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {requests.length===0 && (
              <div style={{ textAlign:"center", padding:"70px 20px" }}>
                <div style={{ fontSize:52, marginBottom:12 }}>🔔</div>
                <div className="disp" style={{ fontSize:24, color:"white", marginBottom:6 }}>No Requests Yet</div>
                <div style={{ color:"rgba(255,255,255,0.35)", fontSize:13 }}>Patient booking requests will appear here.</div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════ APPOINTMENTS TAB ════════════════ */}
        {tab==="appointments" && (
          <div className="fade-up">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
              {[
                ["Total",     requests.length,                                    "📅","#06b6d4"],
                ["Confirmed", requests.filter(r=>r.status==="Confirmed").length, "✅","#10b981"],
                ["Pending",   requests.filter(r=>r.status==="Pending").length,   "⏳","#f59e0b"],
              ].map(([l,v,ic,c])=>(
                <div key={l} className="glass" style={{ borderRadius:13, padding:"14px 16px" }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>{ic}</div>
                  <div className="disp" style={{ fontSize:26, color:c }}>{v}</div>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{l} Appointments</div>
                </div>
              ))}
            </div>
            {requests.filter(r=>r.status==="Confirmed").map(req=>(
              <div key={req.id} className="req-card">
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${req.color}20`, display:"flex", alignItems:"center", justifyContent:"center", color:req.color, fontWeight:700, fontSize:14, flexShrink:0 }}>{req.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <div style={{ color:"white", fontWeight:700, fontSize:14 }}>{req.patient}</div>
                      <span style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>Age {req.age}</span>
                      <span className="badge b-confirmed">✅ Confirmed</span>
                    </div>
                    <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                      <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📋 {req.issue}</span>
                      <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📅 {req.date}</span>
                      <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>🕐 {req.slot}</span>
                    </div>
                  </div>
                  <button style={{ background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.2)", borderRadius:10, padding:"7px 16px", color:"#22d3ee", fontSize:12, fontWeight:600, cursor:"pointer" }}>Start Session</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other tabs */}
        {["patients","earnings"].includes(tab) && (
          <div className="fade-up" style={{ textAlign:"center", padding:"80px 20px" }}>
            <div style={{ fontSize:52, marginBottom:14 }}>{MENU.find(m=>m.key===tab)?.icon}</div>
            <div className="disp" style={{ fontSize:26, color:"white", marginBottom:8 }}>{MENU.find(m=>m.key===tab)?.label}</div>
            <div style={{ color:"rgba(255,255,255,0.35)", fontSize:13 }}>This section is coming soon.</div>
          </div>
        )}

        {/* ════════════════ PRESCRIPTION TAB ════════════════ */}
        {tab==="prescription" && (
          <div className="fade-up">
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:10}}>
              <div>
                <div className="disp" style={{fontSize:26,color:"white",lineHeight:1}}>Write Prescription</div>
                <div style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginTop:2}}>
                  Rx No: <span style={{color:"#22d3ee",fontWeight:600}}>{rxForm.rxNo}</span> &nbsp;|&nbsp; {rxForm.date}
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                {rxSaved && <span style={{color:"#34d399",fontSize:13,fontWeight:600}}>✅ Saved!</span>}
                <button onClick={()=>rxValid&&setRxPreview(true)} disabled={!rxValid}
                  style={{background:"rgba(6,182,212,0.1)",border:"1px solid rgba(6,182,212,0.25)",borderRadius:11,padding:"10px 18px",color:"#22d3ee",fontSize:13,fontWeight:700,cursor:rxValid?"pointer":"not-allowed",opacity:rxValid?1:0.4}}>
                  👁 Preview
                </button>
                <button onClick={()=>rxValid&&saveRx()} disabled={!rxValid}
                  style={{background:rxValid?"linear-gradient(135deg,#06b6d4,#6366f1)":"rgba(255,255,255,0.06)",border:"none",borderRadius:11,padding:"10px 20px",color:"white",fontSize:13,fontWeight:700,cursor:rxValid?"pointer":"not-allowed",opacity:rxValid?1:0.4,boxShadow:rxValid?"0 6px 20px rgba(6,182,212,0.28)":"none"}}>
                  💾 Save Prescription
                </button>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

              {/* LEFT COLUMN */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>

                {/* Patient info */}
                <div className="glass" style={{borderRadius:18,padding:"18px"}}>
                  <div style={{fontSize:10,color:"#06b6d4",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                    Patient Information <div style={{flex:1,height:1,background:"rgba(6,182,212,0.15)"}}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                    <div>
                      <label className="lbl">Patient Name *</label>
                      <input className="rx-input" value={rxForm.patientName} onChange={e=>setRxField("patientName",e.target.value)} placeholder="Full name"/>
                    </div>
                    <div>
                      <label className="lbl">Age (years)</label>
                      <input className="rx-input" value={rxForm.patientAge} onChange={e=>setRxField("patientAge",e.target.value)} placeholder="e.g. 45"/>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <label className="lbl">Gender</label>
                      <select className="rx-sel" value={rxForm.patientGender} onChange={e=>setRxField("patientGender",e.target.value)}>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="lbl">Phone</label>
                      <input className="rx-input" value={rxForm.patientPhone} onChange={e=>setRxField("patientPhone",e.target.value)} placeholder="+91 9876543210"/>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="glass" style={{borderRadius:18,padding:"18px"}}>
                  <div style={{fontSize:10,color:"#06b6d4",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                    Diagnosis <div style={{flex:1,height:1,background:"rgba(6,182,212,0.15)"}}/>
                  </div>
                  <label className="lbl">Condition / Diagnosis *</label>
                  <input className="rx-input" value={rxForm.diagnosis} onChange={e=>setRxField("diagnosis",e.target.value)} placeholder="e.g. Hypertension, Type 2 Diabetes, Angina…"/>
                </div>

                {/* Notes & Follow-up */}
                <div className="glass" style={{borderRadius:18,padding:"18px"}}>
                  <div style={{fontSize:10,color:"#06b6d4",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                    Notes & Follow-up <div style={{flex:1,height:1,background:"rgba(6,182,212,0.15)"}}/>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label className="lbl">Doctor's Notes / Advice</label>
                    <textarea className="rx-input" value={rxForm.notes} onChange={e=>setRxField("notes",e.target.value)}
                      placeholder="Dietary changes, lifestyle advice, precautions, warnings…" rows={4} style={{resize:"vertical",lineHeight:1.65}}/>
                  </div>
                  <label className="lbl">Follow-up Date</label>
                  <input className="rx-input" value={rxForm.followup} onChange={e=>setRxField("followup",e.target.value)} placeholder="e.g. After 2 weeks — 20 Mar 2026"/>
                </div>
              </div>

              {/* RIGHT COLUMN — MEDICINES */}
              <div className="glass" style={{borderRadius:18,padding:"18px",display:"flex",flexDirection:"column"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <span style={{fontSize:10,color:"#06b6d4",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"}}>Medicines</span>
                  <span style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>({rxForm.medicines.length})</span>
                  <div style={{flex:1,height:1,background:"rgba(6,182,212,0.15)"}}/>
                </div>

                <div style={{flex:1,overflowY:"auto",maxHeight:500,paddingRight:2}}>
                  {rxForm.medicines.map((med,i)=>(
                    <div key={med.id||i} className="med-card">
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                        <span style={{fontSize:10,color:"#22d3ee",fontWeight:700,letterSpacing:"0.1em"}}>MEDICINE {i+1}</span>
                        {rxForm.medicines.length>1&&(
                          <button onClick={()=>removeMed(i)}
                            style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:7,width:24,height:24,color:"#f87171",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                        )}
                      </div>
                      <div style={{marginBottom:10}}>
                        <label className="lbl">Medicine Name *</label>
                        <input className="rx-input" value={med.name} onChange={e=>setMed(i,"name",e.target.value)} placeholder="e.g. Amlodipine 5mg Tab, Metformin 500mg…"/>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                        <div>
                          <label className="lbl">Dosage</label>
                          <input className="rx-input" value={med.dosage} onChange={e=>setMed(i,"dosage",e.target.value)} placeholder="e.g. 1 Tab, 5ml"/>
                        </div>
                        <div>
                          <label className="lbl">Frequency</label>
                          <select className="rx-sel" value={med.frequency} onChange={e=>setMed(i,"frequency",e.target.value)}>
                            {FREQUENCIES.map(f=><option key={f}>{f}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <div>
                          <label className="lbl">Duration</label>
                          <select className="rx-sel" value={med.duration} onChange={e=>setMed(i,"duration",e.target.value)}>
                            {DURATIONS.map(d=><option key={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="lbl">Instructions</label>
                          <input className="rx-input" value={med.instructions} onChange={e=>setMed(i,"instructions",e.target.value)} placeholder="After food, bedtime…"/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="add-med" onClick={addMed}>+ Add Another Medicine</button>
                {!rxValid&&(
                  <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,textAlign:"center",marginTop:8}}>
                    Fill patient name, diagnosis and at least one medicine name
                  </div>
                )}
              </div>
            </div>

            {/* SAVED PRESCRIPTIONS LIST */}
            {savedRxList.length>0&&(
              <div style={{marginTop:24}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:14}}>
                  Saved Prescriptions ({savedRxList.length})
                </div>
                {savedRxList.map(rx=>(
                  <div key={rx.id} className="rx-row">
                    <div style={{width:44,height:44,borderRadius:12,background:"rgba(6,182,212,0.1)",border:"1px solid rgba(6,182,212,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>📝</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                        <span style={{color:"white",fontWeight:700,fontSize:14}}>{rx.patientName}</span>
                        <span style={{background:"rgba(251,191,36,0.12)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.2)",borderRadius:99,padding:"2px 9px",fontSize:11,fontWeight:600}}>{rx.diagnosis}</span>
                        <span style={{background:"rgba(6,182,212,0.1)",color:"#22d3ee",border:"1px solid rgba(6,182,212,0.2)",borderRadius:99,padding:"2px 9px",fontSize:11,fontWeight:600}}>Rx: {rx.rxNo}</span>
                      </div>
                      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                        <span style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>📅 {rx.date}</span>
                        <span style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>💊 {rx.medicines.length} medicine{rx.medicines.length!==1?"s":""}</span>
                        {rx.followup&&<span style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>🔔 Follow-up: {rx.followup}</span>}
                      </div>
                    </div>
                    <button onClick={()=>printRx(rx)}
                      style={{background:"linear-gradient(135deg,#06b6d4,#6366f1)",border:"none",borderRadius:11,padding:"10px 18px",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0,boxShadow:"0 4px 14px rgba(6,182,212,0.25)",whiteSpace:"nowrap"}}>
                      📥 Download PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════ PRESCRIPTION PREVIEW MODAL ════════════════ */}
        {rxPreview&&(
          <div className="rx-overlay" onClick={e=>e.target===e.currentTarget&&setRxPreview(false)}>
            <div className="rx-modal pop">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                <div>
                  <div className="disp" style={{fontSize:22,color:"white",lineHeight:1}}>Prescription Preview</div>
                  <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:2}}>Rx: {rxForm.rxNo} · {rxForm.date}</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>printRx(rxForm)}
                    style={{background:"linear-gradient(135deg,#06b6d4,#6366f1)",border:"none",borderRadius:11,padding:"10px 18px",color:"white",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(6,182,212,0.28)"}}>
                    📥 Download PDF
                  </button>
                  <button onClick={()=>setRxPreview(false)}
                    style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:11,padding:"10px 14px",color:"white",fontSize:13,cursor:"pointer"}}>✕</button>
                </div>
              </div>

              <div style={{padding:"18px"}}>
                {/* White preview card */}
                <div style={{background:"white",borderRadius:12,overflow:"hidden",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>
                  {/* Header */}
                  <div style={{background:"#07090f",padding:"18px 24px 14px",borderBottom:"3px solid #06b6d4"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontSize:17,fontWeight:800,color:"#06b6d4",marginBottom:2}}>MediCare Advanced Hospital</div>
                        <div style={{fontSize:9,color:"#64748b",marginBottom:10}}>Hitech City, Hyderabad · +91 40 6666 7777</div>
                        <div style={{fontSize:19,fontWeight:900,color:"white",letterSpacing:"0.04em"}}>PRESCRIPTION</div>
                        <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>Rx: {rxForm.rxNo} · {rxForm.date} · Valid 30 days</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#22d3ee"}}>{rxForm.doctorName}</div>
                        <div style={{fontSize:9,color:"#94a3b8"}}>{rxForm.doctorSpecialty}</div>
                        <div style={{fontSize:9,color:"#64748b"}}>Reg: {rxForm.doctorReg}</div>
                      </div>
                    </div>
                  </div>
                  {/* Patient */}
                  <div style={{background:"#0d1a2d",margin:"12px 18px",borderRadius:9,padding:"12px 16px",borderLeft:"3px solid #06b6d4",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:8,color:"#64748b",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>Patient</div>
                      <div style={{fontSize:15,fontWeight:800,color:"white",marginBottom:2}}>{rxForm.patientName||"—"}</div>
                      <div style={{fontSize:10,color:"#94a3b8"}}>Age: {rxForm.patientAge||"—"} · {rxForm.patientGender} · {rxForm.patientPhone||"—"}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:8,color:"#64748b",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>Diagnosis</div>
                      <div style={{fontSize:14,fontWeight:700,color:"#fbbf24"}}>{rxForm.diagnosis||"—"}</div>
                    </div>
                  </div>
                  {/* Medicines */}
                  <div style={{padding:"0 18px 14px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#06b6d4",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontFamily:"serif",fontSize:15,fontWeight:900}}>Rx</span> MEDICINES
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5}}>
                      <thead>
                        <tr>{["#","Medicine","Dosage","Frequency","Duration","Instructions"].map(h=>(
                          <th key={h} style={{background:"#0d1a2d",color:"#94a3b8",padding:"7px 8px",textAlign:"left",fontSize:9,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700}}>{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {rxForm.medicines.map((m,i)=>(
                          <tr key={i} style={{background:i%2===0?"white":"#f8fafc"}}>
                            <td style={{padding:"8px",fontWeight:700,color:"#06b6d4",textAlign:"center"}}>{i+1}</td>
                            <td style={{padding:"8px",fontWeight:700,color:"#1e293b"}}>{m.name||"—"}</td>
                            <td style={{padding:"8px",color:"#6366f1"}}>{m.dosage||"—"}</td>
                            <td style={{padding:"8px",color:"#059669"}}>{m.frequency}</td>
                            <td style={{padding:"8px",color:"#d97706"}}>{m.duration}</td>
                            <td style={{padding:"8px",color:"#64748b"}}>{m.instructions||"—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rxForm.notes&&<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderLeft:"3px solid #10b981",borderRadius:8,padding:"10px 14px",marginTop:12,fontSize:12,color:"#166534",lineHeight:1.65}}><div style={{fontSize:9,color:"#10b981",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Doctor's Notes</div>{rxForm.notes}</div>}
                    {rxForm.followup&&<div style={{display:"inline-flex",alignItems:"center",gap:7,background:"#fefce8",border:"1px solid #fde68a",borderRadius:8,padding:"7px 13px",marginTop:10,fontSize:12,color:"#92400e",fontWeight:600}}>📅 Follow-up: {rxForm.followup}</div>}
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:18}}>
                      <div style={{textAlign:"center",minWidth:150}}>
                        <div style={{borderBottom:"1.5px solid #cbd5e1",height:30,marginBottom:5}}/>
                        <div style={{fontSize:11,fontWeight:700,color:"#1e293b"}}>{rxForm.doctorName}</div>
                        <div style={{fontSize:9,color:"#64748b"}}>{rxForm.doctorSpecialty}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{background:"#07090f",padding:"9px 18px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:"#06b6d4",fontWeight:600,marginBottom:2}}>Valid for 30 days from date of issue</div>
                    <div style={{fontSize:8,color:"#475569"}}>MediCare Advanced Hospital · Hitech City, Hyderabad</div>
                  </div>
                </div>
              </div>

              <div style={{padding:"14px 18px",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",gap:10}}>
                <button onClick={()=>printRx(rxForm)}
                  style={{flex:1,background:"linear-gradient(135deg,#06b6d4,#6366f1)",border:"none",borderRadius:11,padding:"12px",color:"white",fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:"0 6px 20px rgba(6,182,212,0.28)"}}>
                  📥 Download as PDF
                </button>
                <button onClick={saveRx}
                  style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:11,padding:"12px",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  💾 Save to Records
                </button>
              </div>
            </div>
          </div>
        )}

      </div>{/* end main-scroll */}

      {/* ════════════════ CONFIRM MODAL ════════════════ */}
      {confirm && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setConfirm(null)}>
          <div className="modal pop" style={{ padding:"28px" }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:48, marginBottom:8 }}>{confirm.action==="accept"?"✅":"❌"}</div>
              <div className="disp" style={{ fontSize:26, color:"white", marginBottom:4 }}>
                {confirm.action==="accept" ? "Confirm Appointment?" : "Reject Appointment?"}
              </div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>
                {confirm.action==="accept" ? "The patient will be notified about the confirmed slot." : "The patient will be notified that the slot was rejected."}
              </div>
            </div>

            {/* Request summary */}
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"14px", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`${confirm.req.color}20`, display:"flex", alignItems:"center", justifyContent:"center", color:confirm.req.color, fontWeight:700, fontSize:13 }}>{confirm.req.avatar}</div>
                <div>
                  <div style={{ color:"white", fontWeight:700, fontSize:13 }}>{confirm.req.patient}</div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>Age {confirm.req.age}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {[["📋","Issue", confirm.req.issue],["📅","Day",confirm.req.date],["🕐","Slot",confirm.req.slot]].map(([ic,l,v])=>(
                  <div key={l} style={{ display:"flex", gap:8, fontSize:12 }}>
                    <span>{ic}</span>
                    <span style={{ color:"rgba(255,255,255,0.35)" }}>{l}:</span>
                    <span style={{ color:"rgba(255,255,255,0.75)", fontWeight:500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={confirmAction}
                style={{ flex:1, border:"none", borderRadius:12, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer", color:"white", background:confirm.action==="accept"?"linear-gradient(135deg,#10b981,#06b6d4)":"linear-gradient(135deg,#ef4444,#ec4899)", boxShadow:confirm.action==="accept"?"0 6px 20px rgba(16,185,129,0.3)":"0 6px 20px rgba(239,68,68,0.3)" }}>
                {confirm.action==="accept" ? "Yes, Confirm" : "Yes, Reject"}
              </button>
              <button onClick={()=>setConfirm(null)}
                style={{ flex:1, border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer", color:"white", background:"rgba(255,255,255,0.05)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ DONE MODAL ════════════════ */}
      {done && (
        <div className="overlay" onClick={()=>setDone(null)}>
          <div className="modal pop" style={{ padding:"36px 32px", textAlign:"center" }}>
            {done.action==="accept" ? (
              <>
                <svg width="72" height="72" viewBox="0 0 72 72" style={{ margin:"0 auto 14px" }}>
                  <circle cx="36" cy="36" r="31" fill="none" stroke="#10b981" strokeWidth="2.5" className="ring"/>
                  <path d="M20 36 l11 11 l21-22" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="tick"/>
                </svg>
                <div className="disp" style={{ fontSize:30, color:"white", marginBottom:6 }}>Slot Confirmed!</div>
                <div style={{ color:"rgba(255,255,255,0.45)", fontSize:13, marginBottom:18 }}>The appointment has been accepted</div>
              </>
            ) : (
              <>
                <svg width="72" height="72" viewBox="0 0 72 72" style={{ margin:"0 auto 14px" }}>
                  <circle cx="36" cy="36" r="31" fill="none" stroke="#ef4444" strokeWidth="2.5" className="ring"/>
                  <line x1="23" y1="23" x2="49" y2="49" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" className="cross1"/>
                  <line x1="49" y1="23" x2="23" y2="49" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" className="cross2"/>
                </svg>
                <div className="disp" style={{ fontSize:30, color:"white", marginBottom:6 }}>Slot Rejected</div>
                <div style={{ color:"rgba(255,255,255,0.45)", fontSize:13, marginBottom:18 }}>The appointment has been declined</div>
              </>
            )}
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:13, padding:"13px", marginBottom:20, textAlign:"left" }}>
              <div style={{ color:"white", fontWeight:700, fontSize:13, marginBottom:5 }}>{done.req.patient}</div>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                <span style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>📅 {done.req.date}</span>
                <span style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>🕐 {done.req.slot}</span>
              </div>
            </div>
            <button onClick={()=>setDone(null)}
              style={{ width:"100%", border:"none", borderRadius:12, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer", color:"white", background:done.action==="accept"?"linear-gradient(135deg,#10b981,#06b6d4)":"linear-gradient(135deg,#ef4444,#8b5cf6)" }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

