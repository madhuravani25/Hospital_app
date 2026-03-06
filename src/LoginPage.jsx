import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

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
    if (!form.email.includes("@")) e.email = "Please enter a valid email";
    if (!form.password) e.password = "Password cannot be empty";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    navigate("/dashboard");
   setTimeout(() => {
  setLoading(false);
  if (role === "doctor") {
    navigate("/doctor-dashboard");  // 👨‍⚕️ Doctor goes here
  } else {
    navigate("/dashboard");         // 🧑‍💼 Patient goes here
  }
}, 1600);
  }

  const reset = () => {
    setRole(null); setLoggedIn(false); setLoading(false);
    setForm({ email: "", password: "" }); setErrors({});
  };

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
        .sbtn:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.1);}
        .sbtn:disabled{opacity:0.7;cursor:not-allowed;}
        .back-btn{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:all 0.2s;flex-shrink:0;}
        .back-btn:hover{background:rgba(255,255,255,0.1);}
        .social-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:11px;cursor:pointer;transition:all 0.25s;color:rgba(255,255,255,0.55);font-size:13px;font-weight:500;}
        .social-btn:hover{background:rgba(255,255,255,0.08);color:white;transform:translateY(-2px);}
        .fade-up{animation:fu 0.45s ease both;}
        .d1{animation-delay:0.06s}.d2{animation-delay:0.13s}.d3{animation-delay:0.2s}.d4{animation-delay:0.27s}
        @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0;}
        .pop{animation:pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both;}
        @keyframes pop{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
        .ring{stroke-dasharray:166;stroke-dashoffset:166;animation:draw 0.7s 0.2s ease forwards;}
        .tick{stroke-dasharray:48;stroke-dashoffset:48;animation:draw 0.4s 0.85s ease forwards;}
        @keyframes draw{to{stroke-dashoffset:0}}
        .spin{animation:spin 0.9s linear infinite;display:inline-block;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .nav-link{background:none;border:none;cursor:pointer;font-weight:600;padding:0;transition:opacity 0.2s;font-family:'DM Sans',sans-serif;}
        .nav-link:hover{opacity:0.7;}
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
        {loggedIn && (
          <div className="glass pop" style={{borderRadius:26,padding:"44px 36px",textAlign:"center"}}>
            <svg width="74" height="74" viewBox="0 0 74 74" style={{margin:"0 auto 18px"}}>
              <circle cx="37" cy="37" r="32" fill="none" stroke={accent} strokeWidth="2.5" className="ring"/>
              <path d="M21 37 l11 11 l21-22" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="tick"/>
            </svg>
            <div className="disp" style={{fontSize:36,color:"white",marginBottom:6}}>You're In!</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginBottom:18}}>Logged in successfully</div>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:accentLight,border:`1px solid ${accent}25`,borderRadius:99,padding:"7px 16px",marginBottom:14}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:accent,boxShadow:`0 0 8px ${accent}`}}/>
              <span style={{color:accent,fontSize:12,fontWeight:600}}>{isDoctor?"👨‍⚕️ Doctor":"🧑‍💼 Patient"}</span>
            </div>
            <div style={{color:"rgba(255,255,255,0.3)",fontSize:12,marginBottom:28}}>{form.email}</div>
            <button onClick={reset} className="sbtn" style={{background:`linear-gradient(135deg,${accent},${gradEnd})`,boxShadow:`0 6px 22px ${accentGlow}`}}>Sign Out</button>
          </div>
        )}

        {/* ROLE SELECTION */}
        {!role && !loggedIn && (
          <div className="glass fade-up" style={{borderRadius:26,padding:"36px 30px"}}>
            <div className="disp fade-up" style={{fontSize:40,color:"white",textAlign:"center",marginBottom:4}}>Welcome Back</div>
            <div className="fade-up d1" style={{color:"rgba(255,255,255,0.35)",textAlign:"center",fontSize:13,marginBottom:28}}>
              Sign in to continue to your portal
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:26}}>
              <div className="rc fade-up d2" onClick={()=>setRole("doctor")} style={{borderColor:"rgba(99,102,241,0.18)"}}>
                <div style={{fontSize:46,marginBottom:10,filter:"drop-shadow(0 3px 12px rgba(99,102,241,0.5))"}}>👨‍⚕️</div>
                <div className="disp" style={{color:"white",fontSize:22,marginBottom:4}}>Doctor</div>
                <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,lineHeight:1.6,marginBottom:14}}>Medical staff & specialists</div>
                <div style={{background:"rgba(99,102,241,0.13)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:99,padding:"7px 0",color:"#6366f1",fontSize:12,fontWeight:600}}>Login →</div>
              </div>
              <div className="rc fade-up d3" onClick={()=>setRole("patient")} style={{borderColor:"rgba(13,148,136,0.18)"}}>
                <div style={{fontSize:46,marginBottom:10,filter:"drop-shadow(0 3px 12px rgba(13,148,136,0.5))"}}>🧑‍💼</div>
                <div className="disp" style={{color:"white",fontSize:22,marginBottom:4}}>Patient</div>
                <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,lineHeight:1.6,marginBottom:14}}>Book & manage your care</div>
                <div style={{background:"rgba(13,148,136,0.13)",border:"1px solid rgba(13,148,136,0.25)",borderRadius:99,padding:"7px 0",color:"#0d9488",fontSize:12,fontWeight:600}}>Login →</div>
              </div>
            </div>
            <div className="fade-up d4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 16px",textAlign:"center"}}>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginBottom:4}}>🆕 First time here?</div>
              <div style={{color:"rgba(255,255,255,0.3)",fontSize:12,marginBottom:10}}>You need to create an account before you can log in.</div>
              <button className="nav-link" onClick={()=>navigate("/signup")}
                style={{fontSize:13,color:"#6366f1",background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:99,padding:"7px 20px",width:"100%"}}>
                Create your free account →
              </button>
            </div>
          </div>
        )}

        {/* LOGIN FORM */}
        {role && !loggedIn && (
          <div className="glass fade-up" style={{borderRadius:26,padding:"36px 30px"}}>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:20}}>
              <button className="back-btn" onClick={()=>setRole(null)}>←</button>
              <div>
                <div className="disp" style={{fontSize:28,color:"white",lineHeight:1.1}}>{isDoctor?"Doctor Login":"Patient Login"}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:3}}>Good to see you again</div>
              </div>
              <div style={{marginLeft:"auto",fontSize:32}}>{isDoctor?"👨‍⚕️":"🧑‍💼"}</div>
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:accentLight,border:`1px solid ${accent}22`,borderRadius:99,padding:"6px 14px",marginBottom:22}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:accent,boxShadow:`0 0 6px ${accent}`}}/>
              <span style={{color:accent,fontSize:11,fontWeight:600,letterSpacing:"0.06em"}}>{isDoctor?"MEDICAL PROFESSIONAL":"PATIENT ACCOUNT"}</span>
            </div>
            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:15}}>
              <div className="fade-up d1">
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
              <div className="fade-up d2">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <label style={{color:"rgba(255,255,255,0.38)",fontSize:10,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>Password</label>
                  <a href="#" style={{color:accent,fontSize:11,textDecoration:"none",fontWeight:600}}>Forgot?</a>
                </div>
                <div className="iw">
                  <input name="password" type={showPassword?"text":"password"} value={form.password} onChange={update}
                    onFocus={()=>setFocused("password")} onBlur={()=>setFocused("")}
                    className="fi" placeholder="Enter your password"
                    style={{paddingRight:44,borderColor:errors.password?"#f87171":focused==="password"?accent:"rgba(255,255,255,0.09)",boxShadow:focused==="password"?`0 0 0 3px ${accentGlow}`:"none"}}/>
                  <span className="ii">🔒</span>
                  <button type="button" className="eb" onClick={()=>setShowPassword(!showPassword)}>{showPassword?"🙈":"👁️"}</button>
                </div>
                {errors.password&&<div style={{color:"#f87171",fontSize:11,marginTop:5}}>⚠ {errors.password}</div>}
              </div>
              <div className="fade-up d3" style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="checkbox" id="rem" style={{accentColor:accent,width:14,height:14,cursor:"pointer"}}/>
                <label htmlFor="rem" style={{color:"rgba(255,255,255,0.32)",fontSize:12,cursor:"pointer"}}>Keep me signed in</label>
              </div>
              <button type="submit" disabled={loading} className="sbtn fade-up d3"
                style={{marginTop:4,background:`linear-gradient(135deg,${accent},${gradEnd})`,boxShadow:`0 8px 26px ${accentGlow}`}}>
                {loading?<><span className="spin">⟳</span> Signing in...</>:<>Sign In →</>}
              </button>
              <div style={{display:"flex",alignItems:"center",gap:12,margin:"2px 0"}} className="fade-up d4">
                <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
                <span style={{color:"rgba(255,255,255,0.18)",fontSize:11}}>or</span>
                <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
              </div>
              <div style={{display:"flex",gap:10}} className="fade-up d4">
                <button type="button" className="social-btn">🔵 Google</button>
                <button type="button" className="social-btn">🍎 Apple</button>
              </div>
              <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 14px",textAlign:"center",marginTop:2}} className="fade-up d4">
                <span style={{color:"rgba(255,255,255,0.3)",fontSize:12}}>No account yet? </span>
                <button className="nav-link" onClick={()=>navigate("/signup")} style={{color:accent,fontSize:13}}>
                  Register as {isDoctor?"Doctor":"Patient"} →
                </button>
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