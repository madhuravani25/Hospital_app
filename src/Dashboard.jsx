import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DOCTORS = [
  { id:1, name:"Dr. Arjun Mehta",   specialty:"Cardiologist",    exp:"18 yrs", rating:4.9, fee:800,  available:true,  img:"https://api.dicebear.com/7.x/personas/svg?seed=arjun&backgroundColor=b6e3f4",  about:"Expert in interventional cardiology and heart disease management." },
  { id:2, name:"Dr. Priya Sharma",  specialty:"Neurologist",     exp:"14 yrs", rating:4.8, fee:900,  available:true,  img:"https://api.dicebear.com/7.x/personas/svg?seed=priya&backgroundColor=ffd5dc",  about:"Specialist in stroke, epilepsy and neurodegenerative disorders." },
  { id:3, name:"Dr. Ramesh Rao",    specialty:"Orthopedic",      exp:"20 yrs", rating:4.7, fee:750,  available:true,  img:"https://api.dicebear.com/7.x/personas/svg?seed=ramesh&backgroundColor=d1f4e0", about:"Pioneer in robotic joint replacement and sports medicine." },
  { id:4, name:"Dr. Anita Verma",   specialty:"Pediatrician",    exp:"11 yrs", rating:4.9, fee:600,  available:false, img:"https://api.dicebear.com/7.x/personas/svg?seed=anita&backgroundColor=fde68a",  about:"Compassionate care for children from newborns to adolescents." },
  { id:5, name:"Dr. Suresh Kumar",  specialty:"Dermatologist",   exp:"9 yrs",  rating:4.6, fee:700,  available:true,  img:"https://api.dicebear.com/7.x/personas/svg?seed=suresh&backgroundColor=c7d2fe", about:"Expertise in skin disorders, cosmetic dermatology and laser treatments." },
  { id:6, name:"Dr. Meena Pillai",  specialty:"Ophthalmologist", exp:"16 yrs", rating:4.8, fee:850,  available:true,  img:"https://api.dicebear.com/7.x/personas/svg?seed=meena&backgroundColor=fbcfe8",  about:"Renowned for advanced cataract surgery and LASIK procedures." },
];

const TIME_SLOTS = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM"];

// Weekly schedule per doctor (0=Sun…6=Sat)
const DOCTOR_SCHEDULES = {
  1: { 0:false, 1:true,  2:true,  3:false, 4:true,  5:true,  6:true  }, // Dr. Arjun
  2: { 0:false, 1:true,  2:false, 3:true,  4:true,  5:true,  6:false }, // Dr. Priya
  3: { 0:false, 1:true,  2:true,  3:true,  4:false, 5:true,  6:true  }, // Dr. Ramesh
  4: { 0:false, 1:false, 2:true,  3:false, 4:true,  5:false, 6:false }, // Dr. Anita (offline)
  5: { 0:false, 1:true,  2:true,  3:false, 4:true,  5:true,  6:false }, // Dr. Suresh
  6: { 0:false, 1:false, 2:true,  3:true,  4:false, 5:true,  6:true  }, // Dr. Meena
};

const SLOT_COUNTS = { 1:7, 2:6, 3:5, 4:4, 5:6, 6:4 }; // total slots per working day

const DAY_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// Get next available date string for a doctor
function getNextAvailable(docId) {
  const sched = DOCTOR_SCHEDULES[docId];
  if (!sched) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    if (sched[d.getDay()]) {
      if (i === 0) return "Today";
      if (i === 1) return "Tomorrow";
      return d.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" });
    }
  }
  return "No slots soon";
}

// Count slots available this week
function getWeekSlots(docId) {
  const sched = DOCTOR_SCHEDULES[docId];
  if (!sched) return 0;
  const today = new Date(); today.setHours(0,0,0,0);
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    if (sched[d.getDay()]) count += (SLOT_COUNTS[docId] || 5);
  }
  return count;
}

const SPEC_COLORS = {
  "Cardiologist":    { bg:"rgba(239,68,68,0.12)",   text:"#f87171", dot:"#ef4444" },
  "Neurologist":     { bg:"rgba(139,92,246,0.12)",  text:"#a78bfa", dot:"#8b5cf6" },
  "Orthopedic":      { bg:"rgba(59,130,246,0.12)",  text:"#60a5fa", dot:"#3b82f6" },
  "Pediatrician":    { bg:"rgba(251,191,36,0.12)",  text:"#fbbf24", dot:"#f59e0b" },
  "Dermatologist":   { bg:"rgba(236,72,153,0.12)",  text:"#f472b6", dot:"#ec4899" },
  "Ophthalmologist": { bg:"rgba(16,185,129,0.12)",  text:"#34d399", dot:"#10b981" },
};

const INSURANCE_DATA = [
  { id:1, provider:"Star Health Insurance", policyNo:"SH-2024-001234", type:"Family Floater", premium:"₹18,500/yr", coverage:"₹10,00,000", expiry:"2025-12-31", status:"Active" },
  { id:2, provider:"HDFC ERGO Health",      policyNo:"HE-2023-009876", type:"Individual",     premium:"₹9,200/yr",  coverage:"₹5,00,000",  expiry:"2024-08-15", status:"Expired" },
];

const VACCINES = [
  { name:"COVID-19 (Covishield)", dose:"Dose 2", date:"2021-08-14", nextDue:"Booster", hospital:"Apollo Hospital",   status:"Completed" },
  { name:"Hepatitis B",           dose:"Dose 3", date:"2020-03-22", nextDue:"N/A",     hospital:"MediCare Hospital", status:"Completed" },
  { name:"Influenza",             dose:"Annual", date:"2024-01-10", nextDue:"Jan 2025", hospital:"MediCare Hospital", status:"Due Soon"  },
  { name:"Typhoid",               dose:"Dose 1", date:"2022-07-05", nextDue:"Jul 2025", hospital:"City Clinic",       status:"Completed" },
];

const XRAYS = [
  { id:1, type:"Chest X-Ray",  date:"2024-02-10", doctor:"Dr. Arjun Mehta",  hospital:"MediCare Hospital", result:"Normal",     notes:"No active pulmonary disease" },
  { id:2, type:"Knee X-Ray",   date:"2023-11-20", doctor:"Dr. Ramesh Rao",   hospital:"MediCare Hospital", result:"Mild OA",    notes:"Mild osteoarthritis grade 1" },
  { id:3, type:"Spine X-Ray",  date:"2024-01-05", doctor:"Dr. Ramesh Rao",   hospital:"MediCare Hospital", result:"Normal",     notes:"No significant spondylosis" },
];

const MRICTS = [
  { id:1, type:"Brain MRI",   date:"2024-03-15", doctor:"Dr. Priya Sharma", hospital:"MediCare Hospital", result:"Normal",     notes:"No intracranial abnormality" },
  { id:2, type:"Lumbar MRI",  date:"2023-09-28", doctor:"Dr. Ramesh Rao",   hospital:"MediCare Hospital", result:"L4-L5 Disc", notes:"L4-L5 disc bulge noted" },
  { id:3, type:"Abdomen CT",  date:"2024-01-18", doctor:"Dr. Anita Verma",  hospital:"City Scan Centre",  result:"Normal",     notes:"No abdominal pathology" },
];

const DISCHARGES = [
  { id:1, admitDate:"2023-06-10", dischargeDate:"2023-06-14", ward:"Cardiology",  diagnosis:"Stable Angina",    doctor:"Dr. Arjun Mehta", hospital:"MediCare Hospital", summary:"Patient admitted for chest pain evaluation. ECG and troponin normal. Started on anti-anginal medications. Discharged in stable condition." },
  { id:2, admitDate:"2022-11-02", dischargeDate:"2022-11-03", ward:"Orthopedics", diagnosis:"Knee Arthroscopy", doctor:"Dr. Ramesh Rao",  hospital:"MediCare Hospital", summary:"Elective arthroscopy for meniscus tear. Procedure successful. Post-op recovery uneventful." },
];

const OTHERS_DATA = [
  { category:"Blood Test Reports",   count:8, icon:"🩸", color:"#ef4444", lastUpdated:"Feb 2024" },
  { category:"Urine Analysis",       count:3, icon:"🧪", color:"#f59e0b", lastUpdated:"Jan 2024" },
  { category:"ECG Reports",          count:5, icon:"💓", color:"#ec4899", lastUpdated:"Mar 2024" },
  { category:"Ultrasound Reports",   count:2, icon:"📡", color:"#06b6d4", lastUpdated:"Nov 2023" },
  { category:"Allergy Test Reports", count:1, icon:"⚗️", color:"#8b5cf6", lastUpdated:"Sep 2023" },
  { category:"Dental Records",       count:4, icon:"🦷", color:"#10b981", lastUpdated:"Dec 2023" },
];

const MENU_ITEMS = [
  { key:"doctors",       label:"Find Doctors",        icon:"👨‍⚕️" },
  { key:"appointments",  label:"My Appointments",     icon:"📅" },
  { key:"records",       label:"Medical Records",     icon:"📋" },
  { key:"prescriptions", label:"Prescriptions",       icon:"💊" },
  { key:"insurance",     label:"Insurance",           icon:"🛡️" },
  { key:"vaccination",   label:"Vaccination Records", icon:"💉" },
  { key:"xrays",         label:"X-Rays",              icon:"🩻" },
  { key:"mrict",         label:"MRI / CT Scans",      icon:"🧲" },
  { key:"discharge",     label:"Discharge Summary",   icon:"🏥" },
  { key:"others",        label:"Others",              icon:"📁" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;font-family:'DM Sans',sans-serif;}
  .disp{font-family:'Bebas Neue',sans-serif;letter-spacing:0.04em;}
  .glass{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);}
  .glass-dark{background:rgba(0,0,0,0.35);backdrop-filter:blur(20px);border-right:1px solid rgba(255,255,255,0.06);}
  .doc-card{transition:all 0.3s ease;}
  .doc-card:hover{transform:translateY(-5px);border-color:rgba(99,102,241,0.3)!important;}
  .avail-today{background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.28);color:#34d399;}
  .avail-soon{background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.22);color:#22d3ee;}
  .avail-off{background:rgba(107,114,128,0.1);border:1px solid rgba(107,114,128,0.2);color:rgba(255,255,255,0.3);}
  .day-pip{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;}
  .pip-on{background:rgba(6,182,212,0.12);color:#22d3ee;border:1px solid rgba(6,182,212,0.25);}
  .pip-off{background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.05);}
  .pip-today{background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}
  .live-dot{animation:blink 2s infinite;}
  .slot-btn{transition:all 0.2s;cursor:pointer;border-radius:10px;padding:9px 0;font-size:12px;font-weight:500;text-align:center;border:1.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);}
  .slot-btn:hover:not(.booked):not(.selected){border-color:rgba(99,102,241,0.5);background:rgba(99,102,241,0.1);color:white;}
  .slot-btn.selected{background:rgba(99,102,241,0.2);border-color:#6366f1;color:#a5b4fc;}
  .slot-btn.booked{background:rgba(255,255,255,0.02);border-color:rgba(255,255,255,0.04);color:rgba(255,255,255,0.15);cursor:not-allowed;text-decoration:line-through;}
  .sbtn{border:none;border-radius:12px;padding:13px 0;font-size:14px;font-weight:700;cursor:pointer;color:white;width:100%;transition:all 0.3s;}
  .sbtn:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.1);}
  .sbtn:disabled{opacity:0.4;cursor:not-allowed;}
  .search-input{background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.09);border-radius:12px;padding:11px 16px 11px 40px;color:white;font-size:14px;outline:none;transition:all 0.3s;width:100%;font-family:'DM Sans',sans-serif;}
  .search-input::placeholder{color:rgba(255,255,255,0.25);}
  .search-input:focus{border-color:rgba(99,102,241,0.4);background:rgba(255,255,255,0.07);}
  .filter-btn{background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.08);border-radius:99px;padding:6px 14px;font-size:12px;font-weight:500;cursor:pointer;color:rgba(255,255,255,0.5);transition:all 0.2s;white-space:nowrap;}
  .filter-btn.active{background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.4);color:#a5b4fc;}
  .filter-btn:hover:not(.active){color:white;border-color:rgba(255,255,255,0.2);}
  .fade-up{animation:fu 0.4s ease both;}
  @keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.78);backdrop-filter:blur(8px);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;}
  .modal{width:100%;max-width:520px;border-radius:24px;max-height:90vh;overflow-y:auto;}
  .modal::-webkit-scrollbar{width:4px;}
  .modal::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
  .status-confirmed{background:rgba(16,185,129,0.12);color:#34d399;border:1px solid rgba(16,185,129,0.2);}
  .status-cancelled{background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.15);}
  .sidebar-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:11px;cursor:pointer;transition:all 0.2s;color:rgba(255,255,255,0.42);font-size:13px;font-weight:500;border:none;background:none;width:100%;text-align:left;}
  .sidebar-item:hover{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.8);}
  .sidebar-item.active{background:rgba(99,102,241,0.12);color:#a5b4fc;}
  .pop{animation:pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;}
  @keyframes pop{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}
  .ring{stroke-dasharray:166;stroke-dashoffset:166;animation:draw 0.7s 0.2s ease forwards;}
  .tick{stroke-dasharray:48;stroke-dashoffset:48;animation:draw 0.4s 0.85s ease forwards;}
  @keyframes draw{to{stroke-dashoffset:0}}
  .record-row{border-radius:14px;padding:16px 18px;margin-bottom:10px;transition:all 0.2s;}
  .record-row:hover{background:rgba(255,255,255,0.05)!important;}
  .badge{display:inline-flex;align-items:center;gap:5px;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:600;}
  .main-scroll{overflow-y:auto;height:100vh;}
  .main-scroll::-webkit-scrollbar{width:4px;}
  .main-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px;}
`;

function PageShell({ title, subtitle, children }) {
  return (
    <div className="fade-up">
      <div style={{ marginBottom:24 }}>
        <div className="disp" style={{ fontSize:32, color:"white", lineHeight:1 }}>{title}</div>
        <div style={{ color:"rgba(255,255,255,0.35)", fontSize:13, marginTop:3 }}>{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

//function EmptyState ({ icon, title, desc }) {
  return (
    <div style={{ textAlign:"center", padding:"80px 20px" }}>
      <div style={{ fontSize:56, marginBottom:14 }}>{icon}</div>
      <div className="disp" style={{ fontSize:26, color:"white", marginBottom:8 }}>{title}</div>
      <div style={{ color:"rgba(255,255,255,0.35)", fontSize:13 }}>{desc}</div>
    </div>
  );
//}

function InsurancePage() {
  return (
    <PageShell title="Insurance" subtitle="Your active and past health insurance policies">
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {INSURANCE_DATA.map(ins => (
          <div key={ins.id} className="glass record-row" style={{ background:"rgba(255,255,255,0.04)" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:24 }}>🛡️</span>
                  <div>
                    <div style={{ color:"white", fontWeight:700, fontSize:15 }}>{ins.provider}</div>
                    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>Policy No: {ins.policyNo}</div>
                  </div>
                  <span className="badge" style={{ background:ins.status==="Active"?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.1)", color:ins.status==="Active"?"#34d399":"#f87171", border:ins.status==="Active"?"1px solid rgba(16,185,129,0.2)":"1px solid rgba(239,68,68,0.15)" }}>
                    {ins.status==="Active"?"✅":"❌"} {ins.status}
                  </span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginTop:10 }}>
                  {[["Type",ins.type],["Premium",ins.premium],["Coverage",ins.coverage],["Expiry",ins.expiry]].map(([l,v]) => (
                    <div key={l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"8px 10px" }}>
                      <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, marginBottom:2 }}>{l}</div>
                      <div style={{ color:"white", fontSize:13, fontWeight:600 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function VaccinationPage() {
  return (
    <PageShell title="Vaccination Records" subtitle="Your complete immunization history">
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {VACCINES.map((v,i) => (
          <div key={i} className="glass record-row" style={{ background:"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"rgba(16,185,129,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>💉</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                <div style={{ color:"white", fontWeight:700, fontSize:14 }}>{v.name}</div>
                <span className="badge" style={{ background:v.status==="Completed"?"rgba(16,185,129,0.12)":"rgba(251,191,36,0.12)", color:v.status==="Completed"?"#34d399":"#fbbf24", border:v.status==="Completed"?"1px solid rgba(16,185,129,0.2)":"1px solid rgba(251,191,36,0.2)" }}>
                  {v.status==="Completed"?"✅":"⚠️"} {v.status}
                </span>
              </div>
              <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>💊 {v.dose}</span>
                <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📅 {v.date}</span>
                <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>🏥 {v.hospital}</span>
                <span style={{ color:v.nextDue==="N/A"?"rgba(255,255,255,0.3)":"#fbbf24", fontSize:12 }}>🔔 Next: {v.nextDue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function XRayPage() {
  return (
    <PageShell title="X-Ray Reports" subtitle="Your radiological imaging history">
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {XRAYS.map(x => (
          <div key={x.id} className="glass record-row" style={{ background:"rgba(255,255,255,0.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              <div style={{ width:50, height:50, borderRadius:14, background:"rgba(59,130,246,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>🩻</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                  <div style={{ color:"white", fontWeight:700, fontSize:14 }}>{x.type}</div>
                  <span className="badge" style={{ background:"rgba(59,130,246,0.12)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.2)" }}>{x.result}</span>
                </div>
                <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                  <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📅 {x.date}</span>
                  <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>👨‍⚕️ {x.doctor}</span>
                  <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>🏥 {x.hospital}</span>
                </div>
                <div style={{ color:"rgba(255,255,255,0.35)", fontSize:12, marginTop:6, fontStyle:"italic" }}>📝 {x.notes}</div>
              </div>
              <button style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:10, padding:"8px 14px", color:"#a5b4fc", fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0 }}>📥 Download</button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function MriCtPage() {
  return (
    <PageShell title="MRI / CT Scans" subtitle="Your advanced imaging scan reports">
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {MRICTS.map(m => (
          <div key={m.id} className="glass record-row" style={{ background:"rgba(255,255,255,0.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              <div style={{ width:50, height:50, borderRadius:14, background:"rgba(139,92,246,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>🧲</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                  <div style={{ color:"white", fontWeight:700, fontSize:14 }}>{m.type}</div>
                  <span className="badge" style={{ background:"rgba(139,92,246,0.12)", color:"#a78bfa", border:"1px solid rgba(139,92,246,0.2)" }}>{m.result}</span>
                </div>
                <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                  <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📅 {m.date}</span>
                  <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>👨‍⚕️ {m.doctor}</span>
                  <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>🏥 {m.hospital}</span>
                </div>
                <div style={{ color:"rgba(255,255,255,0.35)", fontSize:12, marginTop:6, fontStyle:"italic" }}>📝 {m.notes}</div>
              </div>
              <button style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:10, padding:"8px 14px", color:"#a78bfa", fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0 }}>📥 Download</button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function DischargePage() {
  const [expanded, setExpanded] = useState(null);
  return (
    <PageShell title="Discharge Summary" subtitle="Your hospital admission and discharge records">
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {DISCHARGES.map(d => (
          <div key={d.id} className="glass" style={{ borderRadius:16, overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ padding:"18px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }} onClick={() => setExpanded(expanded===d.id?null:d.id)}>
              <div style={{ width:44, height:44, borderRadius:12, background:"rgba(251,191,36,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🏥</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                  <div style={{ color:"white", fontWeight:700, fontSize:14 }}>{d.diagnosis}</div>
                  <span className="badge" style={{ background:"rgba(16,185,129,0.1)", color:"#34d399", border:"1px solid rgba(16,185,129,0.15)" }}>✅ Discharged</span>
                </div>
                <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                  <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📅 Admitted: {d.admitDate}</span>
                  <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📅 Discharged: {d.dischargeDate}</span>
                  <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>🏥 {d.ward} Ward</span>
                  <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>👨‍⚕️ {d.doctor}</span>
                </div>
              </div>
              <span style={{ color:"rgba(255,255,255,0.3)", fontSize:18 }}>{expanded===d.id?"▲":"▼"}</span>
            </div>
            {expanded===d.id && (
              <div style={{ padding:"0 20px 18px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"14px", marginTop:12 }}>
                  <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>Discharge Summary</div>
                  <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, lineHeight:1.7 }}>{d.summary}</div>
                </div>
                <button style={{ marginTop:12, background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:10, padding:"8px 16px", color:"#fbbf24", fontSize:12, fontWeight:600, cursor:"pointer" }}>📥 Download PDF</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function OthersPage() {
  return (
    <PageShell title="Other Records" subtitle="All remaining health documents and reports">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
        {OTHERS_DATA.map((o,i) => (
          <div key={i} className="glass fade-up" style={{ borderRadius:18, padding:"20px", border:"1px solid rgba(255,255,255,0.07)", cursor:"pointer", transition:"all 0.3s", animationDelay:`${i*0.05}s` }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{ width:50, height:50, borderRadius:14, background:`${o.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, marginBottom:14 }}>{o.icon}</div>
            <div style={{ color:"white", fontWeight:700, fontSize:15, marginBottom:4 }}>{o.category}</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:o.color, fontSize:13, fontWeight:600 }}>{o.count} files</span>
              <span style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>Updated {o.lastUpdated}</span>
            </div>
            <div style={{ marginTop:14, background:`${o.color}15`, border:`1px solid ${o.color}30`, borderRadius:99, padding:"6px 0", textAlign:"center", color:o.color, fontSize:12, fontWeight:600 }}>View All →</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ── PRESCRIPTION DATA ──────────────────────────────────────────────────────────
const PRESCRIPTIONS = [
  {
    id: 1,
    rxNo: "RX-2026-04821",
    date: "28 Feb 2026",
    doctorName: "Dr. Arjun Mehta",
    doctorSpecialty: "Cardiologist",
    doctorReg: "MCI-2006-04521",
    doctorImg: "https://api.dicebear.com/7.x/personas/svg?seed=arjun&backgroundColor=b6e3f4",
    patientName: "Ravi Kumar",
    patientAge: "45",
    patientGender: "Male",
    patientPhone: "+91 98765 00001",
    diagnosis: "Hypertension",
    status: "Active",
    followup: "14 Mar 2026",
    notes: "Maintain low-sodium diet. Avoid alcohol. Exercise 30 min daily. Monitor BP at home twice a day.",
    medicines: [
      { name:"Amlodipine 5mg",    dosage:"1 Tab",  frequency:"Once daily",  duration:"30 days", instructions:"After breakfast" },
      { name:"Telmisartan 40mg",  dosage:"1 Tab",  frequency:"Once daily",  duration:"30 days", instructions:"Before bedtime" },
      { name:"Aspirin 75mg",      dosage:"1 Tab",  frequency:"Once daily",  duration:"30 days", instructions:"After food" },
    ],
  },
  {
    id: 2,
    rxNo: "RX-2025-09134",
    date: "10 Nov 2025",
    doctorName: "Dr. Ramesh Rao",
    doctorSpecialty: "Orthopedic",
    doctorReg: "MCI-2003-09821",
    doctorImg: "https://api.dicebear.com/7.x/personas/svg?seed=ramesh&backgroundColor=d1f4e0",
    patientName: "Ravi Kumar",
    patientAge: "45",
    patientGender: "Male",
    patientPhone: "+91 98765 00001",
    diagnosis: "Knee Osteoarthritis",
    status: "Completed",
    followup: "25 Nov 2025",
    notes: "Avoid high-impact activities. Use knee support brace while walking. Apply ice pack for 15 min after exercise.",
    medicines: [
      { name:"Diclofenac 50mg",     dosage:"1 Tab",  frequency:"Twice daily",       duration:"10 days", instructions:"After food" },
      { name:"Pantoprazole 40mg",   dosage:"1 Tab",  frequency:"Once daily",         duration:"10 days", instructions:"Before breakfast" },
      { name:"Calcium + Vit D3",    dosage:"1 Tab",  frequency:"Once daily",         duration:"90 days", instructions:"After dinner" },
    ],
  },
  {
    id: 3,
    rxNo: "RX-2025-07650",
    date: "05 Aug 2025",
    doctorName: "Dr. Priya Sharma",
    doctorSpecialty: "Neurologist",
    doctorReg: "MCI-2008-11203",
    doctorImg: "https://api.dicebear.com/7.x/personas/svg?seed=priya&backgroundColor=ffd5dc",
    patientName: "Ravi Kumar",
    patientAge: "45",
    patientGender: "Male",
    patientPhone: "+91 98765 00001",
    diagnosis: "Tension Headache",
    status: "Completed",
    followup: null,
    notes: "Reduce screen time. Maintain regular sleep schedule. Stay hydrated.",
    medicines: [
      { name:"Paracetamol 500mg",  dosage:"1–2 Tabs", frequency:"As needed",   duration:"5 days",  instructions:"Every 6 hrs if needed" },
      { name:"Propranolol 10mg",   dosage:"1 Tab",    frequency:"Once daily",  duration:"30 days", instructions:"Before bedtime" },
    ],
  },
];

function buildPatientRxHTML(rx) {
  const rows = rx.medicines.map((m, i) => `
    <tr>
      <td style="font-weight:700;color:#06b6d4;text-align:center;">${i+1}</td>
      <td><strong>${m.name}</strong></td>
      <td style="color:#6366f1;">${m.dosage}</td>
      <td style="color:#059669;">${m.frequency}</td>
      <td style="color:#d97706;">${m.duration}</td>
      <td style="color:#64748b;">${m.instructions||"—"}</td>
    </tr>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Prescription ${rx.rxNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:#f8fafc;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .page{width:210mm;min-height:297mm;margin:0 auto;background:white;box-shadow:0 0 40px rgba(0,0,0,0.12);}
  .header{background:#07090f;padding:22px 30px 18px;border-bottom:4px solid #06b6d4;}
  .hosp{font-size:20px;font-weight:800;color:#06b6d4;margin-bottom:3px;}
  .hosp-sub{font-size:9px;color:#64748b;margin-bottom:12px;}
  .hrow{display:flex;justify-content:space-between;align-items:flex-end;}
  .rx-h{font-size:24px;font-weight:800;color:white;letter-spacing:.04em;}
  .rx-m{font-size:9px;color:#94a3b8;margin-top:3px;}
  .dr{text-align:right;}
  .dr-name{font-size:13px;font-weight:700;color:#22d3ee;}
  .dr-sub{font-size:9px;color:#94a3b8;margin-top:2px;}
  .pat{display:flex;justify-content:space-between;align-items:center;background:#0d1a2d;margin:16px 30px;border-radius:10px;padding:14px 18px;border-left:4px solid #06b6d4;}
  .pl{font-size:8px;font-weight:700;color:#64748b;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px;}
  .pn{font-size:16px;font-weight:800;color:white;margin-bottom:3px;}
  .pm{font-size:10px;color:#94a3b8;}
  .dv{font-size:14px;font-weight:700;color:#fbbf24;text-align:right;}
  .body{padding:0 30px 20px;}
  .sec{font-size:10px;font-weight:700;color:#06b6d4;letter-spacing:.12em;text-transform:uppercase;margin:16px 0 10px;display:flex;align-items:center;gap:8px;}
  .sec::before{content:'Rx';font-family:serif;font-size:17px;font-weight:900;color:#06b6d4;}
  .sec::after{content:'';flex:1;height:1px;background:rgba(6,182,212,.2);}
  table{width:100%;border-collapse:collapse;font-size:11.5px;}
  thead th{background:#0d1a2d;color:#94a3b8;padding:8px 10px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;}
  tbody td{padding:9px 10px;border-bottom:1px solid #e2e8f0;}
  tbody tr:nth-child(even) td{background:#f8fafc;}
  tbody tr:last-child td{border-bottom:none;}
  .notes{background:#f0fdf4;border:1px solid #bbf7d0;border-left:3px solid #10b981;border-radius:8px;padding:12px 16px;margin-top:14px;font-size:12px;line-height:1.7;color:#166534;}
  .nl{font-size:9px;font-weight:700;color:#10b981;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px;}
  .fu{display:inline-flex;align-items:center;gap:8px;background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:8px 14px;margin-top:12px;font-size:12px;color:#92400e;font-weight:600;}
  .sig{display:flex;justify-content:flex-end;margin:22px 30px 0;}
  .sb{text-align:center;min-width:155px;}
  .sl{border-bottom:1.5px solid #cbd5e1;height:36px;margin-bottom:6px;}
  .sn{font-size:11px;font-weight:700;color:#1e293b;}
  .ss{font-size:9px;color:#64748b;margin-top:2px;}
  .footer{background:#07090f;padding:12px 30px;text-align:center;margin-top:20px;}
  .fm{font-size:9px;color:#06b6d4;font-weight:600;display:block;margin-bottom:3px;}
  .fs{font-size:8px;color:#475569;}
  @media print{body{background:white;}.page{box-shadow:none;}}
</style></head><body>
<div class="page">
  <div class="header">
    <div class="hosp">MediCare Advanced Hospital</div>
    <div class="hosp-sub">Sector 12, Hitech City, Hyderabad – 500081 | Tel: +91 40 6666 7777 | www.medicare.in</div>
    <div class="hrow">
      <div><div class="rx-h">PRESCRIPTION</div><div class="rx-m">Rx No: ${rx.rxNo} | Date: ${rx.date} | Valid 30 days</div></div>
      <div class="dr"><div class="dr-name">${rx.doctorName}</div><div class="dr-sub">${rx.doctorSpecialty}</div><div class="dr-sub">Reg: ${rx.doctorReg}</div></div>
    </div>
  </div>
  <div class="pat">
    <div><div class="pl">Patient</div><div class="pn">${rx.patientName}</div><div class="pm">Age: ${rx.patientAge} yrs | Gender: ${rx.patientGender} | Phone: ${rx.patientPhone}</div></div>
    <div style="text-align:right"><div class="pl">Diagnosis</div><div class="dv">${rx.diagnosis}</div></div>
  </div>
  <div class="body">
    <div class="sec">MEDICINES PRESCRIBED</div>
    <table>
      <thead><tr><th style="width:30px">#</th><th>Medicine Name</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${rx.notes?`<div class="notes"><div class="nl">📋 Doctor's Notes & Advice</div>${rx.notes}</div>`:""}
    ${rx.followup?`<div class="fu">📅 Follow-up: ${rx.followup}</div>`:""}
  </div>
  <div class="sig"><div class="sb"><div class="sl"></div><div class="sn">${rx.doctorName}</div><div class="ss">${rx.doctorSpecialty}</div><div class="ss">Reg: ${rx.doctorReg}</div></div></div>
  <div class="footer"><span class="fm">This prescription is valid for 30 days from the date of issue.</span><span class="fs">MediCare Advanced Hospital | Hitech City, Hyderabad | +91 40 6666 7777</span></div>
</div></body></html>`;
}

function downloadRx(rx) {
  const w = window.open("","_blank","width=900,height=1100");
  w.document.write(buildPatientRxHTML(rx));
  w.document.close();
  w.onload = () => setTimeout(() => { w.focus(); w.print(); }, 500);
}

const STATUS_STYLE = {
  Active:    { bg:"rgba(16,185,129,0.12)",  border:"rgba(16,185,129,0.28)",  color:"#34d399",  dot:"#10b981"  },
  Completed: { bg:"rgba(99,102,241,0.1)",   border:"rgba(99,102,241,0.22)",  color:"#a5b4fc",  dot:"#6366f1"  },
  Expired:   { bg:"rgba(239,68,68,0.08)",   border:"rgba(239,68,68,0.18)",   color:"#f87171",  dot:"#ef4444"  },
};

function PrescriptionsPage() {
  const [expanded, setExpanded] = useState(null);

  // Merge hardcoded samples + any prescriptions doctor saved live
  const [livePrescriptions, setLivePrescriptions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("medicare_prescriptions") || "[]");
    } catch(e) { return []; }
  });

  // Poll localStorage every 2 seconds so patient sees new Rx without page refresh
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const stored = JSON.parse(localStorage.getItem("medicare_prescriptions") || "[]");
        setLivePrescriptions(stored);
      } catch(e) {}
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Live prescriptions on top, then hardcoded samples below
  const allPrescriptions = [...livePrescriptions, ...PRESCRIPTIONS];

  return (
    <PageShell title="Prescriptions" subtitle="Medication prescriptions issued by your doctors">

      {/* Live indicator if doctor just sent one */}
      {livePrescriptions.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:11, padding:"9px 14px", marginBottom:16 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#10b981", animation:"pulse 2s infinite" }}/>
          <span style={{ color:"#34d399", fontSize:13, fontWeight:600 }}>
            {livePrescriptions.length} new prescription{livePrescriptions.length !== 1 ? "s" : ""} from your doctor
          </span>
        </div>
      )}

      {/* Summary stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:22 }}>
        {[
          { label:"Total Prescriptions", value: allPrescriptions.length,                                           icon:"📋", color:"#06b6d4" },
          { label:"Active",              value: allPrescriptions.filter(p=>p.status==="Active").length,            icon:"✅", color:"#10b981" },
          { label:"Total Medicines",     value: allPrescriptions.reduce((a,p)=>a+p.medicines.length, 0),           icon:"💊", color:"#8b5cf6" },
        ].map(s => (
          <div key={s.label} className="glass" style={{ borderRadius:14, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
            <div className="disp" style={{ fontSize:26, color:s.color }}>{s.value}</div>
            <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Prescription cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {allPrescriptions.map(rx => {
          const st   = STATUS_STYLE[rx.status] || STATUS_STYLE.Completed;
          const open = expanded === rx.id;
          const isNew = livePrescriptions.some(l => l.id === rx.id);
          return (
            <div key={rx.id} className="glass" style={{ borderRadius:18, border:`1px solid ${isNew ? "rgba(16,185,129,0.22)" : "rgba(255,255,255,0.08)"}`, overflow:"hidden", transition:"border-color 0.2s" }}>

              {/* Card header */}
              <div style={{ padding:"18px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}
                onClick={() => setExpanded(open ? null : rx.id)}>

                {/* Doctor avatar */}
                <img src={rx.doctorImg} alt={rx.doctorName}
                  style={{ width:50, height:50, borderRadius:13, background:"#1e2030", border:"2px solid rgba(255,255,255,0.1)", flexShrink:0 }}/>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                    <span style={{ color:"white", fontWeight:700, fontSize:14 }}>{rx.doctorName}</span>
                    <span style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>·</span>
                    <span style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>{rx.doctorSpecialty}</span>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:st.bg, border:`1px solid ${st.border}`, borderRadius:99, padding:"2px 10px", fontSize:11, fontWeight:700, color:st.color }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:st.dot }}/>
                      {rx.status}
                    </span>
                    {isNew && (
                      <span style={{ background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:99, padding:"2px 9px", fontSize:10, fontWeight:700, color:"#34d399" }}>
                        🆕 New
                      </span>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                    <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📋 {rx.rxNo}</span>
                    <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📅 {rx.date}</span>
                    <span style={{ color:"#fbbf24", fontSize:12, fontWeight:600 }}>🩺 {rx.diagnosis}</span>
                    <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>💊 {rx.medicines.length} medicine{rx.medicines.length!==1?"s":""}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button onClick={e=>{e.stopPropagation(); downloadRx(rx);}}
                    style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:10, padding:"8px 16px", color:"white", fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 12px rgba(99,102,241,0.3)", display:"flex", alignItems:"center", gap:6 }}>
                    📥 Download PDF
                  </button>
                  <button onClick={e=>{e.stopPropagation(); setExpanded(open ? null : rx.id);}}
                    style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 12px", color:"white", fontSize:13, cursor:"pointer", transition:"transform 0.25s", transform:open?"rotate(180deg)":"rotate(0deg)" }}>
                    ▾
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {open && (
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", padding:"18px 20px", background:"rgba(255,255,255,0.02)" }}>

                  {/* Medicines */}
                  <div style={{ color:"#06b6d4", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ fontFamily:"serif", fontSize:16, fontWeight:900 }}>Rx</span> Medicines Prescribed
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                    {rx.medicines.map((m, i) => (
                      <div key={i} style={{ display:"grid", gridTemplateColumns:"28px 1fr auto auto auto", gap:10, alignItems:"center", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:11, padding:"11px 14px" }}>
                        <div style={{ width:24, height:24, borderRadius:7, background:"rgba(6,182,212,0.12)", border:"1px solid rgba(6,182,212,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#22d3ee", fontWeight:700, fontSize:11 }}>{i+1}</div>
                        <div>
                          <div style={{ color:"white", fontWeight:700, fontSize:13 }}>{m.name}</div>
                          {m.instructions && <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11, marginTop:1 }}>{m.instructions}</div>}
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ color:"#a5b4fc", fontWeight:600, fontSize:12 }}>{m.dosage}</div>
                          <div style={{ color:"rgba(255,255,255,0.25)", fontSize:9, marginTop:1 }}>Dosage</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ color:"#34d399", fontWeight:600, fontSize:12 }}>{m.frequency}</div>
                          <div style={{ color:"rgba(255,255,255,0.25)", fontSize:9, marginTop:1 }}>Frequency</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ color:"#fbbf24", fontWeight:600, fontSize:12 }}>{m.duration}</div>
                          <div style={{ color:"rgba(255,255,255,0.25)", fontSize:9, marginTop:1 }}>Duration</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {rx.notes && (
                    <div style={{ background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.15)", borderLeft:"3px solid #10b981", borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
                      <div style={{ color:"#10b981", fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>📋 Doctor's Notes & Advice</div>
                      <div style={{ color:"rgba(255,255,255,0.65)", fontSize:13, lineHeight:1.7 }}>{rx.notes}</div>
                    </div>
                  )}

                  {/* Follow-up + download */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      {rx.followup && (
                        <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.18)", borderRadius:9, padding:"7px 14px", color:"#fbbf24", fontSize:12, fontWeight:600 }}>
                          📅 Follow-up: {rx.followup}
                        </div>
                      )}
                      <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:9, padding:"7px 14px", color:"rgba(255,255,255,0.45)", fontSize:12 }}>
                        🏥 {rx.doctorSpecialty} · Reg: {rx.doctorReg}
                      </div>
                    </div>
                    <button onClick={() => downloadRx(rx)}
                      style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:11, padding:"10px 20px", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(99,102,241,0.28)", display:"flex", alignItems:"center", gap:7 }}>
                      📥 Download Prescription PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

function MedicalRecordsPage() {
  return (
    <PageShell title="Medical Records" subtitle="Your complete health history and reports">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
        {[
          { icon:"🩻", label:"X-Rays",            count:XRAYS.length,                              color:"#3b82f6" },
          { icon:"🧲", label:"MRI / CT Scans",    count:MRICTS.length,                             color:"#8b5cf6" },
          { icon:"🏥", label:"Discharge Summary", count:DISCHARGES.length,                         color:"#f59e0b" },
          { icon:"💉", label:"Vaccination",        count:VACCINES.length,                           color:"#10b981" },
          { icon:"🛡️", label:"Insurance",          count:INSURANCE_DATA.length,                     color:"#06b6d4" },
          { icon:"📁", label:"Other Reports",      count:OTHERS_DATA.reduce((a,o)=>a+o.count,0),   color:"#ec4899" },
        ].map((r,i) => (
          <div key={i} className="glass fade-up" style={{ borderRadius:16, padding:"18px", border:"1px solid rgba(255,255,255,0.07)", animationDelay:`${i*0.05}s` }}>
            <div style={{ fontSize:32, marginBottom:10 }}>{r.icon}</div>
            <div className="disp" style={{ fontSize:28, color:r.color }}>{r.count}</div>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>{r.label}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab,     setActiveTab]     = useState("doctors");
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [selectedSlot,  setSelectedSlot]  = useState(null);
  const [selectedDate,  setSelectedDate]  = useState("");
  const [bookedSlots,   setBookedSlots]   = useState({});
  const [appointments,  setAppointments]  = useState([]);
  const [bookingDone,   setBookingDone]   = useState(false);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [filterSpec,    setFilterSpec]    = useState("All");
  const [cancelId,      setCancelId]      = useState(null);

  // ✅ FIX: removed the stray } that was here — all logic is now inside the function

  const [filterAvail, setFilterAvail]  = useState("all"); // all | today | available

  const today = new Date().toISOString().split("T")[0];
  const getBookedForSlot = (docId, date) => bookedSlots[`${docId}_${date}`] || [];

  const todayDow = new Date().getDay();
  const filteredDoctors = DOCTORS.filter(d => {
    const ms = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const mf = filterSpec === "All" || d.specialty === filterSpec;
    const ma = filterAvail === "all" ? true
             : filterAvail === "available" ? d.available
             : filterAvail === "today" ? (d.available && DOCTOR_SCHEDULES[d.id]?.[todayDow])
             : true;
    return ms && mf && ma;
  });

  const handleBook = () => {
    if (!selectedSlot || !selectedDate) return;
    const key = `${bookingDoctor.id}_${selectedDate}`;
    setBookedSlots(prev => ({ ...prev, [key]: [...(prev[key]||[]), selectedSlot] }));
    setAppointments(prev => [{ id:Date.now(), doctor:bookingDoctor, date:selectedDate, slot:selectedSlot, status:"Confirmed" }, ...prev]);
    setBookingDone(true);
  };

  const closeModal = () => {
    setBookingDoctor(null); setSelectedSlot(null); setSelectedDate(""); setBookingDone(false);
  };

  const specs = ["All", ...Array.from(new Set(DOCTORS.map(d => d.specialty)))];

  return (
    <div style={{ minHeight:"100vh", background:"#07090f", color:"white", display:"flex" }}>
      <style>{CSS}</style>

      {/* SIDEBAR */}
      <div className="glass-dark" style={{ width:220, flexShrink:0, padding:"22px 14px", display:"flex", flexDirection:"column", gap:4, position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 4px", marginBottom:24 }}>
          <div style={{ width:36, height:36, borderRadius:11, background:"linear-gradient(135deg,#6366f1,#0d9488)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
            <span className="disp" style={{ fontSize:19, color:"white" }}>M</span>
          </div>
          <div>
            <div className="disp" style={{ fontSize:17, color:"white", lineHeight:1 }}>MediCare</div>
            <div style={{ fontSize:8, color:"#0d9488", letterSpacing:"0.14em", fontWeight:600 }}>PATIENT PORTAL</div>
          </div>
        </div>

        <div style={{ fontSize:9, color:"rgba(255,255,255,0.18)", letterSpacing:"0.12em", fontWeight:600, padding:"0 4px", marginBottom:4 }}>MAIN MENU</div>

        {MENU_ITEMS.map(item => (
          <button key={item.key} className={`sidebar-item ${activeTab===item.key?"active":""}`} onClick={() => setActiveTab(item.key)}>
            <span style={{ fontSize:16 }}>{item.icon}</span>
            <span style={{ flex:1 }}>{item.label}</span>
            {item.key==="appointments" && appointments.filter(a=>a.status==="Confirmed").length > 0 && (
              <span style={{ background:"#6366f1", borderRadius:99, padding:"1px 7px", fontSize:10, color:"white" }}>
                {appointments.filter(a=>a.status==="Confirmed").length}
              </span>
            )}
          </button>
        ))}

        <div style={{ marginTop:"auto" }}>
          <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"10px 0" }}/>
          <button className="sidebar-item"><span style={{ fontSize:16 }}>⚙️</span> Settings</button>
          <button className="sidebar-item" onClick={() => navigate("/login")} style={{ color:"#f87171" }}>
            <span style={{ fontSize:16 }}>🚪</span> Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-scroll" style={{ flex:1, padding:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:26 }}>
          <div>
            <div className="disp" style={{ fontSize:30, color:"white", lineHeight:1 }}>
              {MENU_ITEMS.find(m=>m.key===activeTab)?.label || "Dashboard"}
            </div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12, marginTop:2 }}>MediCare Patient Portal</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#0d9488,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🧑‍💼</div>
            <div>
              <div style={{ color:"white", fontSize:13, fontWeight:600 }}>Patient</div>
              <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>patient@email.com</div>
            </div>
          </div>
        </div>

        {/* DOCTORS */}
        {activeTab==="doctors" && (
          <div className="fade-up">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
              {[
                { label:"Total Doctors", value:DOCTORS.length,                                       icon:"👨‍⚕️", color:"#6366f1" },
                { label:"Available Now", value:DOCTORS.filter(d=>d.available).length,               icon:"✅",   color:"#10b981" },
                { label:"Specialities",  value:"6+",                                                 icon:"🏥",   color:"#f59e0b" },
                { label:"My Bookings",   value:appointments.filter(a=>a.status==="Confirmed").length, icon:"📅",  color:"#06b6d4" },
              ].map(s => (
                <div key={s.label} className="glass" style={{ borderRadius:14, padding:"14px 16px" }}>
                  <div style={{ fontSize:22, marginBottom:5 }}>{s.icon}</div>
                  <div className="disp" style={{ fontSize:24, color:s.color }}>{s.value}</div>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
              <div style={{ position:"relative", flex:1, minWidth:200 }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14 }}>🔍</span>
                <input className="search-input" placeholder="Search doctors or specialization..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {specs.map(s => <button key={s} className={`filter-btn ${filterSpec===s?"active":""}`} onClick={()=>setFilterSpec(s)}>{s}</button>)}
              </div>
            </div>
            {/* Availability quick filters */}
            <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
              {[
                { key:"all",       label:"All Doctors",      icon:"👨‍⚕️" },
                { key:"available", label:"Available",        icon:"✅" },
                { key:"today",     label:"Available Today",  icon:"🟢" },
              ].map(f => (
                <button key={f.key} onClick={()=>setFilterAvail(f.key)}
                  style={{ display:"flex", alignItems:"center", gap:6, background:filterAvail===f.key?"rgba(99,102,241,0.18)":"rgba(255,255,255,0.04)", border:filterAvail===f.key?"1.5px solid rgba(99,102,241,0.45)":"1.5px solid rgba(255,255,255,0.08)", borderRadius:99, padding:"7px 16px", color:filterAvail===f.key?"#a5b4fc":"rgba(255,255,255,0.45)", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}>
                  <span>{f.icon}</span>{f.label}
                  {f.key==="today" && (
                    <span style={{ background:"rgba(16,185,129,0.2)", color:"#34d399", borderRadius:99, padding:"1px 7px", fontSize:10, marginLeft:2 }}>
                      {DOCTORS.filter(d => d.available && DOCTOR_SCHEDULES[d.id]?.[todayDow]).length}
                    </span>
                  )}
                  {f.key==="available" && (
                    <span style={{ background:"rgba(99,102,241,0.2)", color:"#a5b4fc", borderRadius:99, padding:"1px 7px", fontSize:10, marginLeft:2 }}>
                      {DOCTORS.filter(d=>d.available).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
              {filteredDoctors.map((doc,i) => {
                const sc        = SPEC_COLORS[doc.specialty] || { bg:"rgba(99,102,241,0.12)", text:"#a5b4fc", dot:"#6366f1" };
                const sched     = DOCTOR_SCHEDULES[doc.id] || {};
                const nextAvail = doc.available ? getNextAvailable(doc.id) : null;
                const weekSlots = doc.available ? getWeekSlots(doc.id) : 0;
                const todayDow  = new Date().getDay();
                const isAvailToday = doc.available && sched[todayDow];
                const availChipCls = !doc.available ? "avail-off" : nextAvail==="Today" ? "avail-today" : "avail-soon";

                return (
                  <div key={doc.id} className="glass doc-card"
                    style={{ borderRadius:18, padding:"18px", border: doc.available ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.04)", animationDelay:`${i*0.05}s`, opacity: doc.available ? 1 : 0.72 }}>

                    {/* ── Header row ── */}
                    <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
                      <div style={{ position:"relative", flexShrink:0 }}>
                        <img src={doc.img} alt={doc.name} style={{ width:56, height:56, borderRadius:14, border:"2px solid rgba(255,255,255,0.1)", background:"#1e2030" }}/>
                        {/* Live pulse dot */}
                        <div style={{ position:"absolute", bottom:-2, right:-2, width:13, height:13, borderRadius:"50%", background:doc.available?"#10b981":"#6b7280", border:"2.5px solid #07090f", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {doc.available && <div className="live-dot" style={{ width:5, height:5, borderRadius:"50%", background:"white" }}/>}
                        </div>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:"white", fontWeight:700, fontSize:14, marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{doc.name}</div>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:sc.bg, borderRadius:99, padding:"2px 8px", marginBottom:5 }}>
                          <div style={{ width:4, height:4, borderRadius:"50%", background:sc.dot }}/>
                          <span style={{ color:sc.text, fontSize:10, fontWeight:600 }}>{doc.specialty}</span>
                        </div>
                        {/* Availability chip */}
                        <div>
                          <span className={`badge ${availChipCls}`} style={{ fontSize:10, borderRadius:99, padding:"3px 9px" }}>
                            {!doc.available ? "⛔ Unavailable" : nextAvail==="Today" ? "🟢 Available Today" : `📅 Next: ${nextAvail}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── Stats row ── */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:12 }}>
                      {[["Exp",doc.exp],["⭐",doc.rating],["Fee",`₹${doc.fee}`]].map(([l,v]) => (
                        <div key={l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:9, padding:"7px 5px", textAlign:"center" }}>
                          <div style={{ color:"white", fontSize:12, fontWeight:600 }}>{v}</div>
                          <div style={{ color:"rgba(255,255,255,0.28)", fontSize:9, marginTop:1 }}>{l}</div>
                        </div>
                      ))}
                    </div>

                    {/* ── Weekly availability pips ── */}
                    <div style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                        <span style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>This Week</span>
                        {doc.available && (
                          <span style={{ color:"#10b981", fontSize:11, fontWeight:700 }}>{weekSlots} slots open</span>
                        )}
                      </div>
                      <div style={{ display:"flex", gap:4 }}>
                        {[1,2,3,4,5,6,0].map(dow => {
                          const isOn    = doc.available && sched[dow];
                          const isTodayDow = dow === todayDow;
                          const label   = DAY_SHORT[dow];
                          let cls = "day-pip ";
                          if (!isOn)       cls += "pip-off";
                          else if (isTodayDow) cls += "pip-today";
                          else             cls += "pip-on";
                          return (
                            <div key={dow} className={cls} title={isOn ? `Available on ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dow]}` : "Off"}>
                              {label}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display:"flex", gap:12, marginTop:6 }}>
                        {[["#22d3ee","rgba(6,182,212,0.12)","Working"],["#fbbf24","rgba(251,191,36,0.15)","Today"],["rgba(255,255,255,0.18)","rgba(255,255,255,0.03)","Off"]].map(([c,bg,l])=>(
                          <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
                            <div style={{ width:8, height:8, borderRadius:3, background:bg, border:`1px solid ${c}` }}/>
                            <span style={{ color:"rgba(255,255,255,0.28)", fontSize:9 }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── Today's slot preview ── */}
                    {isAvailToday && (
                      <div style={{ background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.14)", borderRadius:10, padding:"8px 11px", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div className="live-dot" style={{ width:7, height:7, borderRadius:"50%", background:"#10b981" }}/>
                          <span style={{ color:"#34d399", fontSize:11, fontWeight:600 }}>Available Today</span>
                        </div>
                        <span style={{ color:"rgba(255,255,255,0.45)", fontSize:11 }}>
                          {SLOT_COUNTS[doc.id] || 5} slots · 9AM–5PM
                        </span>
                      </div>
                    )}

                    {/* ── Book button ── */}
                    <button onClick={() => doc.available && navigate(`/doctor/${doc.id}`)} disabled={!doc.available}
                      style={{ width:"100%", border:"none", borderRadius:11, padding:"10px", fontSize:12, fontWeight:700, cursor:doc.available?"pointer":"not-allowed", background:doc.available?"linear-gradient(135deg,#6366f1,#8b5cf6)":"rgba(255,255,255,0.05)", color:doc.available?"white":"rgba(255,255,255,0.2)", boxShadow:doc.available?"0 4px 14px rgba(99,102,241,0.28)":"none", transition:"all 0.3s" }}>
                      {doc.available ? (nextAvail==="Today" ? "📅 Book Today's Slot" : `📅 Book — Next: ${nextAvail}`) : "⛔ Not Available"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {activeTab==="appointments" && (
          <div className="fade-up">
            {appointments.length===0 ? (
              <div style={{ textAlign:"center", padding:"80px 20px" }}>
                <div style={{ fontSize:56, marginBottom:14 }}>📅</div>
                <div className="disp" style={{ fontSize:26, color:"white", marginBottom:8 }}>No Appointments Yet</div>
                <div style={{ color:"rgba(255,255,255,0.35)", fontSize:13, marginBottom:24 }}>Book your first appointment with one of our expert doctors.</div>
                <button onClick={()=>setActiveTab("doctors")} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:12, padding:"12px 28px", color:"white", fontWeight:700, cursor:"pointer", fontSize:13 }}>Browse Doctors →</button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {appointments.map(appt => {
                  const sc = SPEC_COLORS[appt.doctor.specialty] || { bg:"rgba(99,102,241,0.12)", text:"#a5b4fc" };
                  return (
                    <div key={appt.id} className="glass" style={{ borderRadius:16, padding:"18px 20px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", border:appt.status==="Cancelled"?"1px solid rgba(239,68,68,0.1)":"1px solid rgba(255,255,255,0.07)" }}>
                      <img src={appt.doctor.img} alt={appt.doctor.name} style={{ width:50, height:50, borderRadius:12, background:"#1e2030", flexShrink:0, opacity:appt.status==="Cancelled"?0.5:1 }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                          <div style={{ color:"white", fontWeight:700, fontSize:14 }}>{appt.doctor.name}</div>
                          <span className={appt.status==="Confirmed"?"status-confirmed":"status-cancelled"} style={{ borderRadius:99, padding:"2px 10px", fontSize:11, fontWeight:600 }}>
                            {appt.status==="Confirmed"?"✅ Confirmed":"❌ Cancelled"}
                          </span>
                        </div>
                        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                          <span className="badge" style={{ background:sc.bg, color:sc.text }}>{appt.doctor.specialty}</span>
                          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📅 {new Date(appt.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>🕐 {appt.slot}</span>
                          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>💰 ₹{appt.doctor.fee}</span>
                        </div>
                      </div>
                      {appt.status==="Confirmed" && (
                        <button onClick={()=>setCancelId(appt.id)} style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding:"7px 14px", color:"#f87171", fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0 }}>Cancel</button>
                      )}
                      {appt.status==="Cancelled" && (
                        <button onClick={()=>setBookingDoctor(appt.doctor)} style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:10, padding:"7px 14px", color:"#a5b4fc", fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0 }}>Rebook</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab==="records"       && <MedicalRecordsPage />}
        {activeTab==="prescriptions" && <PrescriptionsPage />}
        {activeTab==="insurance"     && <InsurancePage />}
        {activeTab==="vaccination"   && <VaccinationPage />}
        {activeTab==="xrays"         && <XRayPage />}
        {activeTab==="mrict"         && <MriCtPage />}
        {activeTab==="discharge"     && <DischargePage />}
        {activeTab==="others"        && <OthersPage />}
      </div>

      {/* BOOKING MODAL */}
      {bookingDoctor && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="glass modal" style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.1)" }}>
            {!bookingDone ? (
              <div style={{ padding:"26px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div className="disp" style={{ fontSize:24, color:"white" }}>Book Appointment</div>
                  <button onClick={closeModal} style={{ background:"rgba(255,255,255,0.07)", border:"none", borderRadius:8, width:30, height:30, color:"white", cursor:"pointer", fontSize:16 }}>✕</button>
                </div>
                <div className="glass" style={{ borderRadius:14, padding:"14px", display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                  <img src={bookingDoctor.img} alt={bookingDoctor.name} style={{ width:50, height:50, borderRadius:12, background:"#1e2030" }}/>
                  <div>
                    <div style={{ color:"white", fontWeight:700, fontSize:14 }}>{bookingDoctor.name}</div>
                    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:2 }}>{bookingDoctor.specialty} · {bookingDoctor.exp}</div>
                    <div style={{ color:"#a5b4fc", fontSize:12, marginTop:2 }}>₹{bookingDoctor.fee} consultation fee</div>
                  </div>
                </div>
                <div style={{ marginBottom:18 }}>
                  <label style={{ display:"block", color:"rgba(255,255,255,0.38)", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:7 }}>Select Date</label>
                  <input type="date" min={today} value={selectedDate} onChange={e=>{setSelectedDate(e.target.value);setSelectedSlot(null);}}
                    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.1)", borderRadius:11, padding:"11px 13px", color:"white", fontSize:13, outline:"none", colorScheme:"dark" }}/>
                </div>
                {selectedDate && (
                  <div style={{ marginBottom:18 }}>
                    <label style={{ display:"block", color:"rgba(255,255,255,0.38)", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:7 }}>Available Slots</label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:7 }}>
                      {TIME_SLOTS.map(slot => {
                        const booked = getBookedForSlot(bookingDoctor.id, selectedDate).includes(slot);
                        const isSel  = selectedSlot===slot;
                        return (
                          <div key={slot} className={`slot-btn ${booked?"booked":isSel?"selected":""}`} onClick={()=>!booked&&setSelectedSlot(isSel?null:slot)}>
                            {booked?"🔒 ":""}{slot}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {selectedSlot && selectedDate && (
                  <div style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:11, padding:"11px 13px", marginBottom:16, fontSize:13, color:"rgba(255,255,255,0.7)" }}>
                    📅 <strong style={{ color:"white" }}>{new Date(selectedDate).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"long"})}</strong> at <strong style={{ color:"#a5b4fc" }}>{selectedSlot}</strong>
                  </div>
                )}
                <button className="sbtn" onClick={handleBook} disabled={!selectedSlot||!selectedDate}
                  style={{ background:selectedSlot&&selectedDate?"linear-gradient(135deg,#6366f1,#8b5cf6)":"rgba(255,255,255,0.06)", boxShadow:selectedSlot&&selectedDate?"0 6px 20px rgba(99,102,241,0.35)":"none" }}>
                  {!selectedDate?"Select a date first":!selectedSlot?"Select a time slot":"Confirm Appointment →"}
                </button>
              </div>
            ) : (
              <div className="pop" style={{ padding:"40px 32px", textAlign:"center" }}>
                <svg width="68" height="68" viewBox="0 0 68 68" style={{ margin:"0 auto 14px" }}>
                  <circle cx="34" cy="34" r="29" fill="none" stroke="#10b981" strokeWidth="2.5" className="ring"/>
                  <path d="M19 34 l10 10 l20-21" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="tick"/>
                </svg>
                <div className="disp" style={{ fontSize:28, color:"white", marginBottom:6 }}>Booked!</div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13, marginBottom:16 }}>Your appointment is confirmed</div>
                <div style={{ background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.14)", borderRadius:12, padding:"14px", marginBottom:20, textAlign:"left" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <img src={bookingDoctor.img} alt="" style={{ width:38, height:38, borderRadius:10 }}/>
                    <div>
                      <div style={{ color:"white", fontWeight:600, fontSize:13 }}>{bookingDoctor.name}</div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>{bookingDoctor.specialty}</div>
                    </div>
                  </div>
                  <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, lineHeight:1.8 }}>
                    📅 {new Date(selectedDate).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}<br/>
                    🕐 {selectedSlot}<br/>💰 ₹{bookingDoctor.fee}
                  </div>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>{closeModal();setActiveTab("appointments");}} style={{ flex:1, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:11, padding:"11px", color:"white", fontWeight:700, cursor:"pointer", fontSize:13 }}>View Appointments →</button>
                  <button onClick={closeModal} style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:11, padding:"11px", color:"white", fontWeight:700, cursor:"pointer", fontSize:13 }}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelId && (
        <div className="overlay">
          <div className="glass pop" style={{ borderRadius:18, padding:"26px", maxWidth:340, width:"100%", textAlign:"center", background:"#0d1117", border:"1px solid rgba(239,68,68,0.15)" }}>
            <div style={{ fontSize:42, marginBottom:10 }}>⚠️</div>
            <div className="disp" style={{ fontSize:22, color:"white", marginBottom:6 }}>Cancel Appointment?</div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginBottom:22 }}>This action cannot be undone. Your slot will be released.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{setAppointments(prev=>prev.map(a=>a.id===cancelId?{...a,status:"Cancelled"}:a));setCancelId(null);}} style={{ flex:1, background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:11, padding:"11px", color:"#f87171", fontWeight:700, cursor:"pointer", fontSize:13 }}>Yes, Cancel</button>
              <button onClick={()=>setCancelId(null)} style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:11, padding:"11px", color:"white", fontWeight:700, cursor:"pointer", fontSize:13 }}>Keep It</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} // ✅ ONE closing brace — closes Dashboard() function
