import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ fullName:"", email:"", password:"", confirmPassword:"" });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState("");

  const isDoctor = role === "doctor";
  const accent = isDoctor ? "#6366f1" : "#0d9488";
  const accentGlow = isDoctor ? "rgba(99,102,241,0.28)" : "rgba(13,148,136,0.28)";
  const accentLight = isDoctor ? "rgba(99,102,241,0.1)" : "rgba(13,148,136,0.1)";
  const gradEnd = isDoctor ? "#8b5cf6" : "#06b6d4";

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.includes("@")) e.email = "Please enter a valid email";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitted(true);
  };

  const reset = () => {
    setRole(null); setSubmitted(false);
    setForm({ fullName:"", email:"", password:"", confirmPassword:"" }); setErrors({});
  };

  const getStrength = (p) => {
    if (!p) return 0;
    if (p.length < 6) return 1;
    if (p.length < 8) return 2;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return 4;
    return 3;
  };
  const strengthLabel = ["","Weak","Fair","Good","Strong"];
  const strengthColor = ["","#ef4444","#f97316","#eab308","#22c55e"];

  return (
    <div style={{ minHeight:"100vh", background:"#07090f", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;font-family:'DM Sans',sans-serif;}
        .disp{font-family:'Bebas Neue',sans-serif;letter-spacing:0.04em;}
        .glass{background:rgba(255,255,255,0.035);backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,0.07);}
        .rc{cursor:pointer;transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);border-radius:22px;padding:30px 16px;text-align:center;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);}
        .rc:hover{transform:translateY(-10px) scale(1.03);}
        .fi{width:100%;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.09);border-radius:14px;padding:14px 16px 14px 46px;color:white;font-size:14px;outline:none;transition:all 0.3s;}
        .fi::placeholder{color:rgba(255,255,255,0.2);}
        .iw{position:relative;}
        .ii{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none;}
        .eb{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:15px;padding:0;color:rgba(255,255,255,0.28);transition:color 0.2s;}
        .eb:hover{color:rgba(255,255,255,0.7);}
        .sbtn{width:100%;border:none;border-radius:14px;padding:15px;font-size:15px;font-weight:700;cursor:pointer;color:white;transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .sbtn:hover{transform:translateY(-2px);filter:brightness(1.1);}
        .back-btn{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:all 0.2s;flex-shrink:0;}
        .back-btn:hover{background:rgba(255,255,255,0.1);}
        .fade-up{animation:fu 0.45s ease both;}
        .d1{animation-delay:0.06s}.d2{animation-delay:0.13s}.d3{animation-delay:0.2s}.d4{animation-delay:0.27s}.d5{animation-delay:0.34s}
        @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0;}
        .pop{animation:pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both;}
        @keyframes pop{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
        .ring{stroke-dasharray:166;stroke-dashoffset:166;animation:draw 0.7s 0.2s ease forwards;}
        .tick{stroke-dasharray:48;stroke-dashoffset:48;animation:draw 0.4s 0.85s ease forwards;}
        @keyframes draw{to{stroke-dashoffset:0}}
        .sbar{height:3px;border-radius:99px;transition:background 0.4s;}
        .nav-link{background:none;border:none;cursor:pointer;font-weight:600;padding:0;transition:opacity 0.2s;font-family:'DM Sans',sans-serif;}
        .nav-link:hover{opacity:0.7;}
        .terms-link{background:none;border:none;cursor:pointer;font-weight:600;padding:0;font-family:'DM Sans',sans-serif;text-decoration:underline;transition:opacity 0.2s;}
        .terms-link:hover{opacity:0.7;}
      `}</style>

      <div className="orb" style={{width:500,height:500,top:-180,left:-160,background:role==="doctor"?"rgba(99,102,241,0.11)":role==="patient"?"rgba(13,148,136,0.1)":"rgba(59,130,246,0.08)"}}/>
      <div className="orb" style={{width:380,height:380,bottom:-120,right:-100,background:role==="doctor"?"rgba(139,92,246,0.09)":role==="patient"?"rgba(6,182,212,0.09)":"rgba(13,148,136,0.07)"}}/>

      <div style={{width:"100%",maxWidth:420,position:"relative",zIndex:1}}>

        {/* Logo */}
        <div className="fade-up" style={{textAlign:"center",marginBottom:30}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:12}}>
            <div style={{width:48,height:48,borderRadius:16,background:"linear-gradient(135deg,#6366f1,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 28px rgba(99,102,241,0.38)"}}>
              <span className="disp" style={{fontSize:26,color:"white"}}>M</span>
            </div>
            <div style={{textAlign:"left"}}>
              <div className="disp" style={{fontSize:26,color:"white",lineHeight:1}}>MediCare</div>
              <div style={{fontSize:9,color:"#0d9488",letterSpacing:"0.22em",fontWeight:600,marginTop:2}}>HOSPITAL PORTAL</div>
            </div>
          </div>
        </div>

        {/* SUCCESS */}
        {submitted && (
          <div className="glass pop" style={{borderRadius:26,padding:"44px 36px",textAlign:"center"}}>
            <svg width="74" height="74" viewBox="0 0 74 74" style={{margin:"0 auto 18px"}}>
              <circle cx="37" cy="37" r="32" fill="none" stroke={accent} strokeWidth="2.5" className="ring"/>
              <path d="M21 37 l11 11 l21-22" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="tick"/>
            </svg>
            <div className="disp" style={{fontSize:36,color:"white",marginBottom:6}}>Account Created!</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginBottom:18}}>You're all set. Now sign in to continue.</div>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:accentLight,border:`1px solid ${accent}25`,borderRadius:99,padding:"7px 16px",marginBottom:14}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:accent}}/>
              <span style={{color:accent,fontSize:12,fontWeight:600}}>{isDoctor?"👨‍⚕️ Doctor":"🧑‍💼 Patient"}</span>
            </div>
            <div className="disp" style={{fontSize:20,color:"white",marginBottom:3}}>{form.fullName}</div>
            <div style={{color:"rgba(255,255,255,0.3)",fontSize:12,marginBottom:28}}>{form.email}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button className="sbtn" onClick={()=>navigate("/login")} style={{background:`linear-gradient(135deg,${accent},${gradEnd})`,boxShadow:`0 6px 22px ${accentGlow}`}}>
                Go to Login →
              </button>
              <button className="sbtn" onClick={reset} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                Create Another Account
              </button>
            </div>
          </div>
        )}

        {/* ROLE SELECTION */}
        {!role && !submitted && (
          <div className="glass fade-up" style={{borderRadius:26,padding:"36px 30px"}}>
            <div className="disp fade-up" style={{fontSize:40,color:"white",textAlign:"center",marginBottom:4}}>Create Account</div>
            <div className="fade-up d1" style={{color:"rgba(255,255,255,0.35)",textAlign:"center",fontSize:13,marginBottom:28}}>Who are you joining as?</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:26}}>
              <div className="rc fade-up d2" onClick={()=>setRole("doctor")} style={{borderColor:"rgba(99,102,241,0.18)"}}>
                <div style={{fontSize:46,marginBottom:10,filter:"drop-shadow(0 3px 12px rgba(99,102,241,0.5))"}}>👨‍⚕️</div>
                <div className="disp" style={{color:"white",fontSize:22,marginBottom:4}}>Doctor</div>
                <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,lineHeight:1.6,marginBottom:14}}>Medical staff & specialists</div>
                <div style={{background:"rgba(99,102,241,0.13)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:99,padding:"7px 0",color:"#6366f1",fontSize:12,fontWeight:600}}>Register →</div>
              </div>
              <div className="rc fade-up d3" onClick={()=>setRole("patient")} style={{borderColor:"rgba(13,148,136,0.18)"}}>
                <div style={{fontSize:46,marginBottom:10,filter:"drop-shadow(0 3px 12px rgba(13,148,136,0.5))"}}>🧑‍💼</div>
                <div className="disp" style={{color:"white",fontSize:22,marginBottom:4}}>Patient</div>
                <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,lineHeight:1.6,marginBottom:14}}>Book & manage your care</div>
                <div style={{background:"rgba(13,148,136,0.13)",border:"1px solid rgba(13,148,136,0.25)",borderRadius:99,padding:"7px 0",color:"#0d9488",fontSize:12,fontWeight:600}}>Register →</div>
              </div>
            </div>
            <div className="fade-up d4" style={{textAlign:"center",color:"rgba(255,255,255,0.28)",fontSize:13}}>
              Already have an account?{" "}
              <button className="nav-link" onClick={()=>navigate("/login")} style={{color:"#6366f1",fontSize:13}}>Sign in here</button>
            </div>
          </div>
        )}

        {/* SIGNUP FORM */}
        {role && !submitted && (
          <div className="glass fade-up" style={{borderRadius:26,padding:"36px 30px"}}>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:20}}>
              <button className="back-btn" onClick={reset}>←</button>
              <div>
                <div className="disp" style={{fontSize:28,color:"white",lineHeight:1.1}}>{isDoctor?"Doctor Sign Up":"Patient Sign Up"}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:3}}>Create your free account</div>
              </div>
              <div style={{marginLeft:"auto",fontSize:32}}>{isDoctor?"👨‍⚕️":"🧑‍💼"}</div>
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:accentLight,border:`1px solid ${accent}22`,borderRadius:99,padding:"6px 14px",marginBottom:22}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:accent,boxShadow:`0 0 6px ${accent}`}}/>
              <span style={{color:accent,fontSize:11,fontWeight:600,letterSpacing:"0.06em"}}>{isDoctor?"MEDICAL PROFESSIONAL":"PATIENT ACCOUNT"}</span>
            </div>
            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
              <div className="fade-up d1">
                <label style={{display:"block",color:"rgba(255,255,255,0.38)",fontSize:10,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:7}}>Full Name</label>
                <div className="iw">
                  <input name="fullName" value={form.fullName} onChange={update}
                    onFocus={()=>setFocused("fullName")} onBlur={()=>setFocused("")}
                    className="fi" placeholder={isDoctor?"Dr. Arjun Mehta":"Ravi Kumar"}
                    style={{borderColor:errors.fullName?"#f87171":focused==="fullName"?accent:"rgba(255,255,255,0.09)",boxShadow:focused==="fullName"?`0 0 0 3px ${accentGlow}`:"none"}}/>
                  <span className="ii">👤</span>
                </div>
                {errors.fullName&&<div style={{color:"#f87171",fontSize:11,marginTop:5}}>⚠ {errors.fullName}</div>}
              </div>
              <div className="fade-up d2">
                <label style={{display:"block",color:"rgba(255,255,255,0.38)",fontSize:10,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:7}}>Email Address</label>
                <div className="iw">
                  <input name="email" type="email" value={form.email} onChange={update}
                    onFocus={()=>setFocused("email")} onBlur={()=>setFocused("")}
                    className="fi" placeholder={isDoctor?"doctor@medicare.in":"patient@email.com"}
                    style={{borderColor:errors.email?"#f87171":focused==="email"?accent:"rgba(255,255,255,0.09)",boxShadow:focused==="email"?`0 0 0 3px ${accentGlow}`:"none"}}/>
                  <span className="ii">✉️</span>
                </div>
                {errors.email&&<div style={{color:"#f87171",fontSize:11,marginTop:5}}>⚠ {errors.email}</div>}
              </div>
              <div className="fade-up d3">
                <label style={{display:"block",color:"rgba(255,255,255,0.38)",fontSize:10,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:7}}>Password</label>
                <div className="iw">
                  <input name="password" type={showPassword?"text":"password"} value={form.password} onChange={update}
                    onFocus={()=>setFocused("password")} onBlur={()=>setFocused("")}
                    className="fi" placeholder="Min. 8 characters"
                    style={{paddingRight:44,borderColor:errors.password?"#f87171":focused==="password"?accent:"rgba(255,255,255,0.09)",boxShadow:focused==="password"?`0 0 0 3px ${accentGlow}`:"none"}}/>
                  <span className="ii">🔒</span>
                  <button type="button" className="eb" onClick={()=>setShowPassword(!showPassword)}>{showPassword?"🙈":"👁️"}</button>
                </div>
                {form.password&&(
                  <div style={{display:"flex",alignItems:"center",gap:5,marginTop:8}}>
                    {[1,2,3,4].map(i=>{const s=getStrength(form.password);return<div key={i} className="sbar" style={{flex:1,background:i<=s?strengthColor[s]:"rgba(255,255,255,0.07)"}}/>;})}
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginLeft:4,whiteSpace:"nowrap"}}>{strengthLabel[getStrength(form.password)]}</span>
                  </div>
                )}
                {errors.password&&<div style={{color:"#f87171",fontSize:11,marginTop:5}}>⚠ {errors.password}</div>}
              </div>
              <div className="fade-up d4">
                <label style={{display:"block",color:"rgba(255,255,255,0.38)",fontSize:10,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:7}}>Confirm Password</label>
                <div className="iw">
                  <input name="confirmPassword" type={showConfirm?"text":"password"} value={form.confirmPassword} onChange={update}
                    onFocus={()=>setFocused("confirmPassword")} onBlur={()=>setFocused("")}
                    className="fi" placeholder="Re-enter your password"
                    style={{paddingRight:44,borderColor:errors.confirmPassword?"#f87171":(form.confirmPassword&&form.confirmPassword===form.password)?"#22c55e":focused==="confirmPassword"?accent:"rgba(255,255,255,0.09)",boxShadow:focused==="confirmPassword"?`0 0 0 3px ${accentGlow}`:"none"}}/>
                  <span className="ii">{form.confirmPassword&&form.confirmPassword===form.password?"✅":"🔐"}</span>
                  <button type="button" className="eb" onClick={()=>setShowConfirm(!showConfirm)}>{showConfirm?"🙈":"👁️"}</button>
                </div>
                {errors.confirmPassword&&<div style={{color:"#f87171",fontSize:11,marginTop:5}}>⚠ {errors.confirmPassword}</div>}
                {form.confirmPassword&&form.confirmPassword===form.password&&<div style={{color:"#22c55e",fontSize:11,marginTop:5}}>✓ Passwords match</div>}
              </div>

              {/* FIX: Replaced <a href="#"> with <button> elements for Terms and Privacy links */}
              <div className="fade-up d5" style={{display:"flex",alignItems:"flex-start",gap:9,marginTop:2}}>
                <input type="checkbox" required id="terms" style={{marginTop:2,accentColor:accent,width:14,height:14,cursor:"pointer",flexShrink:0}}/>
                <label htmlFor="terms" style={{color:"rgba(255,255,255,0.3)",fontSize:11,lineHeight:1.6,cursor:"pointer"}}>
                  I agree to the{" "}
                  <button type="button" className="terms-link" style={{color:accent,fontSize:11}}>Terms of Service</button>
                  {" "}and{" "}
                  <button type="button" className="terms-link" style={{color:accent,fontSize:11}}>Privacy Policy</button>
                </label>
              </div>

              <button type="submit" className="sbtn fade-up d5" style={{marginTop:6,background:`linear-gradient(135deg,${accent},${gradEnd})`,boxShadow:`0 8px 26px ${accentGlow}`}}>
                Create {isDoctor?"Doctor":"Patient"} Account →
              </button>
              <div style={{textAlign:"center",marginTop:2}} className="fade-up d5">
                <span style={{color:"rgba(255,255,255,0.28)",fontSize:13}}>Already registered? </span>
                <button className="nav-link" onClick={()=>navigate("/login")} style={{color:accent,fontSize:13}}>Sign in here</button>
              </div>
            </form>
          </div>
        )}

        <div style={{textAlign:"center",color:"rgba(255,255,255,0.15)",fontSize:10,marginTop:18,letterSpacing:"0.06em"}}>
          🔒 256-BIT SSL ENCRYPTED · YOUR DATA IS SAFE
        </div>
      </div>
    </div>
  );
}
