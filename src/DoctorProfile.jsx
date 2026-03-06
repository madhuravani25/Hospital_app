import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// DOCTOR DATA
// ─────────────────────────────────────────────
const DOCTOR = {
  name: "Dr. Arjun Mehta",
  specialty: "Cardiologist",
  degree: "MBBS, MD (Cardiology), DM (AIIMS)",
  experience: "18 Years",
  hospital: "MediCare Advanced Hospital, Hyderabad",
  email: "arjun.mehta@medicare.in",
  phone: "+91 98765 43210",
  consultFee: 800,
  rating: 4.9,
  reviews: 312,
  totalPatients: 3420,
  img: "https://api.dicebear.com/7.x/personas/svg?seed=arjun&backgroundColor=b6e3f4",
  about: "Dr. Arjun Mehta is a senior interventional cardiologist with 18+ years at MediCare Advanced Hospital. He specialises in complex coronary interventions, structural heart disease, and advanced heart failure management — having performed over 5,000 successful cardiac procedures.",
  languages: ["English", "Hindi", "Telugu"],
  awards: [
    "Best Cardiologist — Andhra Pradesh 2022",
    "Excellence in Cardiac Care 2020",
    "Top Doctor — MediCare Hospital 2019",
  ],
  education: [
    { year: "2003–2006", degree: "DM — Cardiology",       college: "AIIMS, New Delhi" },
    { year: "2000–2003", degree: "MD — Internal Medicine", college: "JIPMER, Puducherry" },
    { year: "1994–2000", degree: "MBBS",                  college: "Osmania Medical College" },
  ],
  reviews_list: [
    { name: "Ravi K.",   rating: 5, text: "Brilliant doctor. Explained everything clearly and the procedure was flawless.", date: "Feb 2024" },
    { name: "Sunita M.", rating: 5, text: "Very patient and thorough. My father's condition improved dramatically.",        date: "Jan 2024" },
    { name: "Gopal R.",  rating: 4, text: "Professional and caring. Wait time was a bit long but worth it.",                date: "Dec 2023" },
  ],
};

// Doctor's weekly schedule (day-of-week → slots)
// 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const WEEK_SCHEDULE = {
  0: { active: false, slots: [] },
  1: { active: true,  slots: ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","02:00 PM","02:30 PM","03:00 PM"] },
  2: { active: true,  slots: ["09:00 AM","10:00 AM","11:00 AM","03:00 PM","04:00 PM","04:30 PM"] },
  3: { active: false, slots: [] },
  4: { active: true,  slots: ["09:30 AM","10:30 AM","02:30 PM","03:30 PM","04:00 PM"] },
  5: { active: true,  slots: ["09:00 AM","09:30 AM","10:00 AM","11:00 AM","02:00 PM","04:30 PM"] },
  6: { active: true,  slots: ["10:00 AM","10:30 AM","11:00 AM","11:30 AM"] },
};

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Pre-booked slots per date string "YYYY-MM-DD"
const PRE_BOOKED = {
  // Will be filled dynamically in the component — simulated per real dates
};

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: #07090f; }
.disp { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em; }
.glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(22px); border: 1px solid rgba(255,255,255,0.08); }
.glass-teal { background: rgba(6,182,212,0.06); border: 1px solid rgba(6,182,212,0.18); }
.page-scroll { overflow-y: auto; height: 100vh; }
.page-scroll::-webkit-scrollbar { width: 4px; }
.page-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }

/* ── Calendar ── */
.cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 5px; }
.cal-day-hdr { text-align: center; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.28); padding: 4px 0; letter-spacing: 0.06em; }
.cal-cell { border-radius: 10px; padding: 6px 4px; text-align: center; font-size: 13px; font-weight: 600; transition: all 0.2s; cursor: default; min-height: 54px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 3px; }
.cal-empty { opacity: 0; pointer-events: none; }
.cal-past { color: rgba(255,255,255,0.15); background: transparent; }
.cal-off { color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.02); border: 1px solid transparent; }
.cal-avail { background: rgba(6,182,212,0.08); border: 1.5px solid rgba(6,182,212,0.22); color: white; cursor: pointer; }
.cal-avail:hover { background: rgba(6,182,212,0.18); border-color: #06b6d4; transform: scale(1.05); }
.cal-selected { background: rgba(6,182,212,0.25); border: 1.5px solid #06b6d4; color: white; box-shadow: 0 0 16px rgba(6,182,212,0.3); transform: scale(1.05); cursor: pointer; }
.cal-today { box-shadow: 0 0 0 1.5px rgba(251,191,36,0.5) inset; }
.cal-full { background: rgba(239,68,68,0.07); border: 1.5px dashed rgba(239,68,68,0.2); color: rgba(255,255,255,0.25); cursor: not-allowed; }

/* ── Slots ── */
.slot { border-radius: 10px; padding: 9px 0; font-size: 12px; font-weight: 600; text-align: center; transition: all 0.2s; cursor: pointer; border: 1.5px solid; font-family: 'DM Sans', sans-serif; }
.slot-free { background: rgba(6,182,212,0.07); border-color: rgba(6,182,212,0.25); color: #22d3ee; }
.slot-free:hover { background: rgba(6,182,212,0.18); border-color: #06b6d4; transform: scale(1.04); }
.slot-picked { background: rgba(6,182,212,0.22); border-color: #06b6d4; color: white; box-shadow: 0 0 14px rgba(6,182,212,0.3); }
.slot-booked { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05); color: rgba(255,255,255,0.18); cursor: not-allowed; text-decoration: line-through; }

/* ── Misc ── */
.fade-up { animation: fu 0.44s ease both; }
.d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}.d4{animation-delay:.24s}
@keyframes fu { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
.pop { animation: pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes pop { from{opacity:0;transform:scale(0.62)} to{opacity:1;transform:scale(1)} }
.overlay { position:fixed; inset:0; background:rgba(0,0,0,0.82); backdrop-filter:blur(12px); z-index:300; display:flex; align-items:center; justify-content:center; padding:16px; }
.modal { width:100%; max-width:460px; border-radius:24px; background:#0b1120; border:1px solid rgba(255,255,255,0.1); padding:30px; }
.sbtn { width:100%; border:none; border-radius:13px; padding:14px; font-size:14px; font-weight:700; cursor:pointer; color:white; transition:all 0.3s; font-family:'DM Sans',sans-serif; }
.sbtn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
.sbtn:disabled { opacity:0.35; cursor:not-allowed; }
.tag { display:inline-flex; align-items:center; gap:5px; border-radius:99px; padding:4px 12px; font-size:11px; font-weight:600; }
.ring { stroke-dasharray:188; stroke-dashoffset:188; animation:draw 0.75s 0.15s ease forwards; }
.tick { stroke-dasharray:50; stroke-dashoffset:50; animation:draw 0.4s 0.85s ease forwards; }
@keyframes draw { to{stroke-dashoffset:0} }
.review-card { border-radius:14px; padding:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); margin-bottom:10px; }
.orb { position:fixed; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; }
@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.9} 50%{transform:scale(1.7);opacity:0.3} }
input[type=text], input[type=tel], textarea {
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 11px;
  padding: 11px 14px;
  color: white;
  font-size: 13px;
  outline: none;
  width: 100%;
  font-family: 'DM Sans', sans-serif;
  transition: border-color 0.2s;
}
input[type=text]:focus, input[type=tel]:focus, textarea:focus {
  border-color: rgba(6,182,212,0.4);
}
input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
`;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function toDateKey(y, m, d) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

function Stars({ rating, size = 14 }) {
  return (
    <span style={{ display:"inline-flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:size, color: i<=Math.round(rating)?"#fbbf24":"rgba(255,255,255,0.15)" }}>★</span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function DoctorProfile() {
  const navigate = useNavigate();
  const today    = new Date();
  today.setHours(0,0,0,0);

  const [isOnline,     setIsOnline]     = useState(true);
  const [calYear,      setCalYear]      = useState(today.getFullYear());
  const [calMonth,     setCalMonth]     = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null); // Date object
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [myBookings,   setMyBookings]   = useState({});   // { "YYYY-MM-DD": [slot,...] }
  const [patientName,  setPatientName]  = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [reason,       setReason]       = useState("");
  const [step,         setStep]         = useState("browse"); // browse | confirm | success

  // Simulated pre-booked slots keyed by real date strings
  const preBooked = useMemo(() => {
    const map = {};
    // Seed some pre-booked slots relative to today
    for (let offset = 0; offset < 28; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      const dow = d.getDay();
      const sch = WEEK_SCHEDULE[dow];
      if (!sch?.active || sch.slots.length === 0) continue;
      const key = toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      // Pre-book ~30% of slots for realism
      map[key] = sch.slots.filter((_, i) => i % 3 === 0);
    }
    return map;
  }, []);

  const getPreBooked  = (dateKey) => preBooked[dateKey]  || [];
  const getMyBooked   = (dateKey) => myBookings[dateKey] || [];
  const getAllBooked   = (dateKey) => [...getPreBooked(dateKey), ...getMyBooked(dateKey)];

  const freeSlotsFor = (date) => {
    const dow = date.getDay();
    const sch = WEEK_SCHEDULE[dow];
    if (!sch?.active) return [];
    const key = toDateKey(date.getFullYear(), date.getMonth(), date.getDate());
    const booked = getAllBooked(key);
    return sch.slots.filter(s => !booked.includes(s));
  };

  // Build calendar cells for current month
  const calCells = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(calYear, calMonth, d);
      const dow  = date.getDay();
      const sch  = WEEK_SCHEDULE[dow];
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const dateKey = toDateKey(calYear, calMonth, d);
      const free  = isPast ? 0 : freeSlotsFor(date).length;
      const total = sch?.active ? sch.slots.length : 0;
      cells.push({ d, date, dow, isPast, isToday, active: sch?.active && !isPast, free, total, dateKey });
    }
    return cells;
  }, [calYear, calMonth, myBookings]);

  // Total free slots in the visible month
  const monthFreeSlots = calCells.reduce((a, c) => a + (c?.free || 0), 0);

  // Navigate calendar
  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y-1); setCalMonth(11); }
    else setCalMonth(m => m-1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y+1); setCalMonth(0); }
    else setCalMonth(m => m+1);
  };
  const canGoPrev = !(calYear === today.getFullYear() && calMonth === today.getMonth());

  const handleDateSelect = (cell) => {
    if (!cell?.active || cell.free === 0) return;
    setSelectedDate(cell.date);
    setSelectedSlot(null);
  };

  const handleBook = () => { if (selectedDate && selectedSlot) setStep("confirm"); };

  const confirmBooking = () => {
    const key = toDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    setMyBookings(p => ({ ...p, [key]: [...(p[key]||[]), selectedSlot] }));
    setStep("success");
  };

  const resetBooking = () => {
    setSelectedDate(null); setSelectedSlot(null);
    setPatientName(""); setPatientPhone(""); setReason("");
    setStep("browse");
  };

  // Slots for selected date
  const selectedDateKey   = selectedDate ? toDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) : null;
  const slotsForSelected  = selectedDate ? WEEK_SCHEDULE[selectedDate.getDay()]?.slots || [] : [];
  const allBookedSelected = selectedDateKey ? getAllBooked(selectedDateKey) : [];

  const fmtDate = (d) => d ? d.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "";
  const shortFmt = (d) => d ? d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "";

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#07090f", color:"white", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{CSS}</style>
      <div className="orb" style={{ width:500, height:500, top:-150, left:-150, background:"rgba(6,182,212,0.06)" }}/>
      <div className="orb" style={{ width:400, height:400, bottom:-120, right:-80, background:"rgba(99,102,241,0.06)" }}/>

      <div className="page-scroll">
        <div style={{ maxWidth:1120, margin:"0 auto", padding:"32px 24px", position:"relative", zIndex:1 }}>

          {/* BACK */}
          <button onClick={() => navigate("/dashboard")}
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"8px 16px", color:"rgba(255,255,255,0.6)", fontSize:13, cursor:"pointer", marginBottom:24, display:"inline-flex", alignItems:"center", gap:6, transition:"all 0.2s" }}>
            ← Back to Doctors
          </button>

          {/* ══ HERO ══ */}
          <div className="glass fade-up" style={{ borderRadius:28, padding:"30px 32px", marginBottom:20, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg,#06b6d4,#6366f1,#0d9488)", borderRadius:"28px 28px 0 0" }}/>
            <div style={{ display:"flex", gap:26, alignItems:"flex-start", flexWrap:"wrap" }}>

              {/* Avatar */}
              <div style={{ position:"relative", flexShrink:0 }}>
                <img src={DOCTOR.img} alt={DOCTOR.name} style={{ width:110, height:110, borderRadius:22, background:"#1e2030", border:`3px solid ${isOnline?"rgba(16,185,129,0.5)":"rgba(255,255,255,0.1)"}`, display:"block" }}/>
                <div style={{ position:"absolute", bottom:5, right:5, width:16, height:16, borderRadius:"50%", background:isOnline?"#10b981":"#6b7280", border:"3px solid #07090f", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {isOnline && <div style={{ width:6, height:6, borderRadius:"50%", background:"white", animation:"pulse 2s infinite" }}/>}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:220 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:5 }}>
                  <div className="disp" style={{ fontSize:34, color:"white", lineHeight:1 }}>{DOCTOR.name}</div>
                  <span className="tag" style={{ background:isOnline?"rgba(16,185,129,0.12)":"rgba(107,114,128,0.12)", border:`1px solid ${isOnline?"rgba(16,185,129,0.28)":"rgba(255,255,255,0.1)"}`, color:isOnline?"#34d399":"rgba(255,255,255,0.4)" }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:isOnline?"#10b981":"#6b7280", animation:isOnline?"pulse 2s infinite":"none" }}/>
                    {isOnline ? "Available for Appointments" : "Currently Unavailable"}
                  </span>
                </div>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginBottom:3 }}>{DOCTOR.specialty} · {DOCTOR.degree}</div>
                <div style={{ color:"rgba(255,255,255,0.38)", fontSize:12, marginBottom:14 }}>🏥 {DOCTOR.hospital}</div>
                <div style={{ display:"flex", gap:22, flexWrap:"wrap", marginBottom:14 }}>
                  {[
                    { v:`⭐ ${DOCTOR.rating}`, l:`${DOCTOR.reviews} reviews`, c:"#fbbf24" },
                    { v:DOCTOR.experience,     l:"Experience",                c:"#06b6d4" },
                    { v:`${DOCTOR.totalPatients.toLocaleString()}+`, l:"Patients", c:"#10b981" },
                    { v:`₹${DOCTOR.consultFee}`, l:"Per Visit",               c:"#8b5cf6" },
                  ].map(s => (
                    <div key={s.l}>
                      <div style={{ color:s.c, fontWeight:700, fontSize:15 }}>{s.v}</div>
                      <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                  {DOCTOR.languages.map(l => (
                    <span key={l} className="tag" style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc" }}>🗣 {l}</span>
                  ))}
                </div>
              </div>

              {/* Quick CTA */}
              <div style={{ flexShrink:0 }}>
                <div className="glass-teal" style={{ borderRadius:18, padding:"18px 20px", textAlign:"center", minWidth:190 }}>
                  {isOnline ? (
                    <>
                      <div style={{ fontSize:26, marginBottom:6 }}>📅</div>
                      <div style={{ color:"white", fontWeight:700, fontSize:14, marginBottom:3 }}>Book Appointment</div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginBottom:12 }}>
                        {monthFreeSlots} slots this month
                      </div>
                      <a href="#booking" style={{ display:"block", background:"linear-gradient(135deg,#06b6d4,#6366f1)", borderRadius:11, padding:"10px", color:"white", fontWeight:700, fontSize:13, textDecoration:"none", boxShadow:"0 6px 18px rgba(6,182,212,0.28)" }}>
                        Select Date →
                      </a>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:26, marginBottom:6 }}>⛔</div>
                      <div style={{ color:"rgba(255,255,255,0.55)", fontWeight:700, fontSize:13 }}>Not Available</div>
                      <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12, marginTop:5 }}>Check back later.</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ══ MAIN GRID ══ */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 390px", gap:18, alignItems:"start" }}>

            {/* ── LEFT ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* About */}
              <div className="glass fade-up d1" style={{ borderRadius:20, padding:"20px" }}>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:10 }}>About</div>
                <div style={{ color:"rgba(255,255,255,0.72)", fontSize:13, lineHeight:1.85 }}>{DOCTOR.about}</div>
              </div>

              {/* Weekly availability summary */}
              <div className="glass fade-up d2" style={{ borderRadius:20, padding:"20px" }}>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14 }}>Weekly Schedule</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
                  {[1,2,3,4,5,6,0].map(dow => {
                    const sch = WEEK_SCHEDULE[dow];
                    const name = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dow];
                    return (
                      <div key={dow} style={{ textAlign:"center", borderRadius:12, padding:"10px 4px", background:sch.active?"rgba(6,182,212,0.07)":"rgba(255,255,255,0.02)", border:`1.5px solid ${sch.active?"rgba(6,182,212,0.2)":"rgba(255,255,255,0.05)"}` }}>
                        <div style={{ color:sch.active?"#22d3ee":"rgba(255,255,255,0.2)", fontWeight:700, fontSize:12 }}>{name}</div>
                        {sch.active ? (
                          <>
                            <div style={{ color:"#10b981", fontWeight:700, fontSize:16, marginTop:4 }}>{sch.slots.length}</div>
                            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:9, marginTop:1 }}>slots</div>
                          </>
                        ) : (
                          <div style={{ color:"rgba(255,255,255,0.15)", fontSize:11, marginTop:6 }}>Off</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:"flex", gap:14, marginTop:12, flexWrap:"wrap" }}>
                  {[["rgba(6,182,212,0.07)","rgba(6,182,212,0.2)","Available day"],["rgba(255,255,255,0.02)","rgba(255,255,255,0.05)","Off / Holiday"]].map(([bg,br,l])=>(
                    <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"rgba(255,255,255,0.35)" }}>
                      <div style={{ width:12, height:12, borderRadius:4, background:bg, border:`1.5px solid ${br}` }}/>
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="glass fade-up d3" style={{ borderRadius:20, padding:"20px" }}>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14 }}>Education</div>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:7, top:10, bottom:10, width:1.5, background:"rgba(6,182,212,0.18)" }}/>
                  {DOCTOR.education.map((e,i) => (
                    <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:14, paddingLeft:22, position:"relative" }}>
                      <div style={{ position:"absolute", left:2, top:5, width:11, height:11, borderRadius:"50%", background:"#07090f", border:"2px solid #06b6d4" }}/>
                      <div>
                        <div style={{ color:"white", fontWeight:700, fontSize:13 }}>{e.degree}</div>
                        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>{e.college}</div>
                        <div style={{ color:"#06b6d4", fontSize:11, marginTop:2 }}>{e.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Awards */}
              <div className="glass fade-up d4" style={{ borderRadius:20, padding:"20px" }}>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:12 }}>Awards & Recognition</div>
                {DOCTOR.awards.map((a,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.1)", borderRadius:11, padding:"10px 13px", marginBottom:8 }}>
                    <span style={{ fontSize:18 }}>🏆</span>
                    <span style={{ color:"rgba(255,255,255,0.72)", fontSize:13 }}>{a}</span>
                  </div>
                ))}
              </div>

              {/* Reviews */}
              <div className="glass fade-up" style={{ borderRadius:20, padding:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>Patient Reviews</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Stars rating={DOCTOR.rating}/>
                    <span style={{ color:"#fbbf24", fontWeight:700 }}>{DOCTOR.rating}</span>
                    <span style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>({DOCTOR.reviews})</span>
                  </div>
                </div>
                {DOCTOR.reviews_list.map((r,i) => (
                  <div key={i} className="review-card">
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <div style={{ color:"white", fontWeight:600, fontSize:13 }}>{r.name}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <Stars rating={r.rating} size={12}/>
                        <span style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>{r.date}</span>
                      </div>
                    </div>
                    <div style={{ color:"rgba(255,255,255,0.55)", fontSize:13, lineHeight:1.6 }}>{r.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT — BOOKING PANEL ── */}
            <div id="booking" style={{ position:"sticky", top:20, display:"flex", flexDirection:"column", gap:12 }}>
              <div className="glass" style={{ borderRadius:22, overflow:"hidden", border:"1px solid rgba(6,182,212,0.15)" }}>

                {/* Panel header */}
                <div style={{ background:"linear-gradient(135deg,rgba(6,182,212,0.14),rgba(99,102,241,0.1))", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div className="disp" style={{ fontSize:22, color:"white", lineHeight:1 }}>Book Appointment</div>
                    <div style={{ color:"rgba(255,255,255,0.38)", fontSize:12, marginTop:2 }}>
                      {isOnline ? `${monthFreeSlots} slots available in ${MONTH_NAMES[calMonth]}` : "Currently unavailable"}
                    </div>
                  </div>
                  <span className="tag" style={{ background:isOnline?"rgba(16,185,129,0.12)":"rgba(107,114,128,0.1)", border:`1px solid ${isOnline?"rgba(16,185,129,0.25)":"rgba(255,255,255,0.08)"}`, color:isOnline?"#34d399":"rgba(255,255,255,0.3)" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:isOnline?"#10b981":"#6b7280" }}/>
                    {isOnline?"Open":"Closed"}
                  </span>
                </div>

                {isOnline ? (
                  <div style={{ padding:"18px 20px" }}>

                    {/* ── CALENDAR ── */}
                    <div style={{ marginBottom:18 }}>
                      {/* Month nav */}
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                        <button onClick={prevMonth} disabled={!canGoPrev}
                          style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, width:30, height:30, color:canGoPrev?"white":"rgba(255,255,255,0.2)", cursor:canGoPrev?"pointer":"not-allowed", fontSize:14 }}>‹</button>
                        <div className="disp" style={{ fontSize:18, color:"white" }}>{MONTH_NAMES[calMonth]} {calYear}</div>
                        <button onClick={nextMonth}
                          style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, width:30, height:30, color:"white", cursor:"pointer", fontSize:14 }}>›</button>
                      </div>

                      {/* Day headers */}
                      <div className="cal-grid" style={{ marginBottom:5 }}>
                        {DAY_NAMES.map(n => <div key={n} className="cal-day-hdr">{n}</div>)}
                      </div>

                      {/* Calendar cells */}
                      <div className="cal-grid">
                        {calCells.map((cell, idx) => {
                          if (!cell) return <div key={`e${idx}`} className="cal-cell cal-empty"/>;
                          const isSelected = selectedDate && cell.date.getTime() === selectedDate.getTime();
                          let cls = "cal-cell ";
                          if (cell.isPast)              cls += "cal-past";
                          else if (!cell.active)        cls += "cal-off";
                          else if (cell.free === 0)     cls += "cal-full";
                          else if (isSelected)          cls += "cal-selected";
                          else                          cls += "cal-avail";
                          if (cell.isToday)             cls += " cal-today";

                          return (
                            <div key={cell.d} className={cls} onClick={() => handleDateSelect(cell)}>
                              <span style={{ fontSize:13, fontWeight:700 }}>{cell.d}</span>
                              {!cell.isPast && cell.active && cell.free > 0 && (
                                <span style={{ fontSize:9, fontWeight:700, color: isSelected ? "rgba(255,255,255,0.8)" : "#10b981", background: isSelected ? "rgba(255,255,255,0.15)" : "rgba(16,185,129,0.15)", borderRadius:99, padding:"1px 5px" }}>
                                  {cell.free}
                                </span>
                              )}
                              {!cell.isPast && cell.active && cell.free === 0 && (
                                <span style={{ fontSize:9, color:"rgba(239,68,68,0.6)" }}>Full</span>
                              )}
                              {!cell.isPast && !cell.active && (
                                <span style={{ fontSize:9, color:"rgba(255,255,255,0.15)" }}>Off</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div style={{ display:"flex", gap:12, marginTop:10, flexWrap:"wrap" }}>
                        {[
                          ["rgba(6,182,212,0.08)","rgba(6,182,212,0.22)","Available"],
                          ["rgba(6,182,212,0.25)","#06b6d4","Selected"],
                          ["rgba(239,68,68,0.07)","rgba(239,68,68,0.2)","Fully Booked"],
                          ["rgba(255,255,255,0.02)","rgba(255,255,255,0.05)","Off Day"],
                        ].map(([bg,br,l]) => (
                          <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"rgba(255,255,255,0.3)" }}>
                            <div style={{ width:10, height:10, borderRadius:3, background:bg, border:`1.5px solid ${br}` }}/>
                            {l}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── SELECTED DATE INFO ── */}
                    {selectedDate && (
                      <div style={{ marginBottom:16 }}>
                        <div style={{ background:"rgba(6,182,212,0.07)", border:"1px solid rgba(6,182,212,0.18)", borderRadius:12, padding:"10px 14px", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div>
                            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em" }}>Selected Date</div>
                            <div style={{ color:"white", fontWeight:700, fontSize:13, marginTop:2 }}>{fmtDate(selectedDate)}</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ color:"#10b981", fontWeight:700, fontSize:18 }}>
                              {freeSlotsFor(selectedDate).length}
                            </div>
                            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>free slots</div>
                          </div>
                        </div>

                        {/* Slots grid */}
                        <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>
                          Available Time Slots
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7 }}>
                          {slotsForSelected.map(slot => {
                            const booked = allBookedSelected.includes(slot);
                            const picked = selectedSlot === slot;
                            return (
                              <div key={slot} className={`slot ${booked?"slot-booked":picked?"slot-picked":"slot-free"}`}
                                onClick={() => !booked && setSelectedSlot(picked ? null : slot)}>
                                {booked ? "🔒 " : ""}{slot}
                              </div>
                            );
                          })}
                        </div>

                        {/* Slot legend */}
                        <div style={{ display:"flex", gap:12, marginTop:8 }}>
                          {[["rgba(6,182,212,0.07)","rgba(6,182,212,0.25)","Free"],["rgba(6,182,212,0.22)","#06b6d4","Selected"],["rgba(255,255,255,0.02)","rgba(255,255,255,0.05)","Booked"]].map(([bg,br,l]) => (
                            <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"rgba(255,255,255,0.3)" }}>
                              <div style={{ width:10, height:10, borderRadius:3, background:bg, border:`1.5px solid ${br}` }}/>
                              {l}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── SUMMARY ── */}
                    {selectedSlot && (
                      <div style={{ background:"rgba(6,182,212,0.07)", border:"1px solid rgba(6,182,212,0.18)", borderRadius:11, padding:"11px 14px", marginBottom:14 }}>
                        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Your Selection</div>
                        <div style={{ display:"flex", gap:16 }}>
                          <div><div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>Date</div><div style={{ color:"white", fontWeight:700, fontSize:12 }}>{shortFmt(selectedDate)}</div></div>
                          <div><div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>Time</div><div style={{ color:"#22d3ee", fontWeight:700, fontSize:12 }}>{selectedSlot}</div></div>
                          <div><div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>Fee</div><div style={{ color:"#10b981", fontWeight:700, fontSize:12 }}>₹{DOCTOR.consultFee}</div></div>
                        </div>
                      </div>
                    )}

                    <button className="sbtn" onClick={handleBook} disabled={!selectedSlot}
                      style={{ background:selectedSlot?"linear-gradient(135deg,#06b6d4,#6366f1)":"rgba(255,255,255,0.06)", boxShadow:selectedSlot?"0 8px 24px rgba(6,182,212,0.28)":"none" }}>
                      {!selectedDate ? "📅 Select a date on the calendar" : !selectedSlot ? "🕐 Choose a time slot" : "Proceed to Confirm →"}
                    </button>
                    <div style={{ textAlign:"center", color:"rgba(255,255,255,0.18)", fontSize:11, marginTop:10 }}>🔒 No payment required now</div>
                  </div>
                ) : (
                  <div style={{ padding:"36px 20px", textAlign:"center" }}>
                    <div style={{ fontSize:44, marginBottom:10 }}>😔</div>
                    <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, lineHeight:1.7 }}>
                      Dr. {DOCTOR.name.split(" ").pop()} is not accepting appointments right now.<br/>Please check back later.
                    </div>
                  </div>
                )}
              </div>

              {/* Fee card */}
              <div className="glass" style={{ borderRadius:16, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div><div style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>Consultation Fee</div><div style={{ color:"white", fontWeight:700, fontSize:20 }}>₹{DOCTOR.consultFee}</div></div>
                <div style={{ textAlign:"right" }}><div style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>Duration</div><div style={{ color:"white", fontWeight:700, fontSize:16 }}>30 min</div></div>
              </div>

              {/* Dev toggle */}
              <div className="glass" style={{ borderRadius:14, padding:"11px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>🎛 Simulate doctor status</div>
                <button onClick={() => { setIsOnline(p=>!p); setSelectedDate(null); setSelectedSlot(null); }}
                  style={{ background:isOnline?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.1)", border:`1px solid ${isOnline?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.2)"}`, borderRadius:99, padding:"5px 14px", color:isOnline?"#34d399":"#f87171", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  {isOnline?"Go Offline":"Go Online"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CONFIRM MODAL ══ */}
      {step==="confirm" && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setStep("browse")}>
          <div className="modal pop">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div className="disp" style={{ fontSize:26, color:"white" }}>Confirm Booking</div>
              <button onClick={()=>setStep("browse")} style={{ background:"rgba(255,255,255,0.07)", border:"none", borderRadius:8, width:30, height:30, color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:16 }}>✕</button>
            </div>

            {/* Doctor + slot summary */}
            <div style={{ background:"rgba(6,182,212,0.06)", border:"1px solid rgba(6,182,212,0.15)", borderRadius:14, padding:"14px", display:"flex", gap:12, alignItems:"center", marginBottom:20 }}>
              <img src={DOCTOR.img} alt="" style={{ width:46, height:46, borderRadius:11, background:"#1e2030" }}/>
              <div>
                <div style={{ color:"white", fontWeight:700, fontSize:14 }}>{DOCTOR.name}</div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>{DOCTOR.specialty}</div>
                <div style={{ display:"flex", gap:12, marginTop:4 }}>
                  <span style={{ color:"#22d3ee", fontSize:12 }}>📅 {shortFmt(selectedDate)}</span>
                  <span style={{ color:"#22d3ee", fontSize:12 }}>🕐 {selectedSlot}</span>
                  <span style={{ color:"#10b981", fontSize:12 }}>₹{DOCTOR.consultFee}</span>
                </div>
              </div>
            </div>

            {/* Patient details */}
            <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:20 }}>
              <div>
                <label style={{ display:"block", color:"rgba(255,255,255,0.38)", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>Your Name *</label>
                <input type="text" value={patientName} onChange={e=>setPatientName(e.target.value)} placeholder="e.g. Ravi Kumar"/>
              </div>
              <div>
                <label style={{ display:"block", color:"rgba(255,255,255,0.38)", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>Phone Number *</label>
                <input type="tel" value={patientPhone} onChange={e=>setPatientPhone(e.target.value)} placeholder="+91 9876543210"/>
              </div>
              <div>
                <label style={{ display:"block", color:"rgba(255,255,255,0.38)", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>Reason / Symptoms (optional)</label>
                <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Describe your issue briefly..." rows={3} style={{ resize:"vertical" }}/>
              </div>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button className="sbtn" onClick={confirmBooking} disabled={!patientName.trim()||!patientPhone.trim()}
                style={{ background:patientName.trim()&&patientPhone.trim()?"linear-gradient(135deg,#06b6d4,#6366f1)":"rgba(255,255,255,0.06)", boxShadow:patientName.trim()&&patientPhone.trim()?"0 6px 20px rgba(6,182,212,0.28)":"none" }}>
                ✓ Confirm Appointment
              </button>
              <button className="sbtn" onClick={()=>setStep("browse")} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}>Back</button>
            </div>
            <div style={{ textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:11, marginTop:10 }}>The doctor will confirm your slot shortly 🩺</div>
          </div>
        </div>
      )}

      {/* ══ SUCCESS MODAL ══ */}
      {step==="success" && (
        <div className="overlay">
          <div className="modal pop" style={{ textAlign:"center" }}>
            <svg width="78" height="78" viewBox="0 0 78 78" style={{ margin:"0 auto 16px", display:"block" }}>
              <circle cx="39" cy="39" r="34" fill="none" stroke="#10b981" strokeWidth="2.5" className="ring"/>
              <path d="M22 39 l12 12 l22-23" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="tick"/>
            </svg>
            <div className="disp" style={{ fontSize:34, color:"white", marginBottom:6 }}>Booking Sent!</div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13, marginBottom:20 }}>
              Appointment request submitted.<br/>
              <span style={{ color:"#fbbf24" }}>⏳ Awaiting doctor's confirmation.</span>
            </div>

            <div style={{ background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.18)", borderRadius:16, padding:"16px", marginBottom:22, textAlign:"left" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <img src={DOCTOR.img} alt="" style={{ width:42, height:42, borderRadius:11 }}/>
                <div>
                  <div style={{ color:"white", fontWeight:700, fontSize:13 }}>{DOCTOR.name}</div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>{DOCTOR.specialty}</div>
                </div>
              </div>
              {[
                ["👤","Patient", patientName],
                ["📅","Date",    fmtDate(selectedDate)],
                ["🕐","Time",    selectedSlot],
                ["🏥","Hospital",DOCTOR.hospital.split(",")[0]],
                ["💰","Fee",     `₹${DOCTOR.consultFee}`],
              ].map(([ic,l,v]) => (
                <div key={l} style={{ display:"flex", gap:8, marginBottom:5, fontSize:12 }}>
                  <span>{ic}</span>
                  <span style={{ color:"rgba(255,255,255,0.35)", minWidth:55 }}>{l}:</span>
                  <span style={{ color:"rgba(255,255,255,0.75)", fontWeight:500 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:10, background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.15)", borderRadius:9, padding:"8px 11px", display:"flex", alignItems:"center", gap:6 }}>
                <span>⏳</span>
                <span style={{ color:"#fbbf24", fontSize:12 }}>Pending doctor confirmation. You'll be notified soon.</span>
              </div>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button className="sbtn" onClick={()=>navigate("/dashboard")}
                style={{ background:"linear-gradient(135deg,#06b6d4,#6366f1)", boxShadow:"0 6px 20px rgba(6,182,212,0.26)" }}>
                Back to Dashboard
              </button>
              <button className="sbtn" onClick={resetBooking} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}>
                Book Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
