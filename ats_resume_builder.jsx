import { useState, useCallback } from "react";

const SECTION_TIPS = {
  summary: "Use 3-5 sentences. Include your job title, years of experience, and 2-3 core skills matching the job description.",
  experience: "Start bullets with strong action verbs. Quantify achievements (%, $, numbers). Mirror keywords from the job posting.",
  education: "Include GPA if above 3.5. Add relevant coursework or honors.",
  skills: "List skills as comma-separated keywords. Include both technical and soft skills. Match exact terms from job descriptions.",
};

const ATS_KEYWORDS = [
  "managed","led","developed","improved","increased","reduced","delivered","collaborated",
  "designed","implemented","analyzed","coordinated","achieved","built","created","spearheaded",
  "years of experience","team","project","results","stakeholders","cross-functional","data-driven",
];

function scoreResume(data) {
  let score = 0;
  const issues = [];
  const tips = [];

  if (data.name) score += 5; else issues.push("Missing full name");
  if (data.email) score += 5; else issues.push("Missing email address");
  if (data.phone) score += 3; else issues.push("Missing phone number");
  if (data.location) score += 2; else issues.push("No location listed");

  const summaryLen = data.summary?.length || 0;
  if (summaryLen > 200) { score += 15; }
  else if (summaryLen > 80) { score += 8; tips.push("Expand your summary to 3-5 sentences for best ATS results"); }
  else { issues.push("Summary too short or missing"); }

  const expItems = data.experience?.filter(e => e.title || e.company) || [];
  if (expItems.length >= 2) score += 15;
  else if (expItems.length === 1) { score += 8; tips.push("Add more experience entries if possible"); }
  else issues.push("No work experience listed");

  const hasBullets = expItems.some(e => e.bullets?.filter(b => b.trim()).length >= 2);
  if (hasBullets) score += 10;
  else tips.push("Add 3-5 bullet points per role with measurable achievements");

  const hasQuantified = expItems.some(e =>
    e.bullets?.some(b => /\d+%|\$[\d,]+|\d+x|\d+ (people|team|projects|users)/i.test(b))
  );
  if (hasQuantified) score += 10;
  else tips.push("Quantify achievements with numbers, percentages, or dollar amounts");

  if (data.education?.length > 0) score += 10;
  else issues.push("No education listed");

  const skills = data.skills?.split(",").map(s => s.trim()).filter(Boolean) || [];
  if (skills.length >= 8) score += 15;
  else if (skills.length >= 4) { score += 8; tips.push("Add more skills — aim for 10-15 relevant keywords"); }
  else { issues.push("Too few skills listed (aim for 10+)"); }

  const allText = [
    data.summary,
    ...expItems.map(e => `${e.title} ${e.company} ${e.bullets?.join(" ")}`),
    data.skills
  ].join(" ").toLowerCase();

  const foundKeywords = ATS_KEYWORDS.filter(kw => allText.includes(kw));
  const kwScore = Math.min(10, foundKeywords.length * 2);
  score += kwScore;
  if (foundKeywords.length < 5) tips.push("Use more action verbs like: managed, led, developed, implemented");

  return {
    score: Math.min(100, score),
    issues,
    tips,
    keywordsFound: foundKeywords.length,
  };
}

function ResumePreview({ data }) {
  const expItems = data.experience?.filter(e => e.title || e.company) || [];
  const eduItems = data.education?.filter(e => e.degree || e.school) || [];
  const skills = data.skills?.split(",").map(s => s.trim()).filter(Boolean) || [];

  return (
    <div style={{fontFamily:"'Georgia', serif", fontSize:11, lineHeight:1.45, color:"#1a1a1a", padding:"28px 32px", background:"#fff", minHeight:600}}>
      {data.name && (
        <div style={{borderBottom:"2px solid #1a1a1a", paddingBottom:8, marginBottom:6}}>
          <div style={{fontSize:20, fontWeight:700, letterSpacing:1, textTransform:"uppercase", fontFamily:"'Arial', sans-serif"}}>{data.name}</div>
          <div style={{fontSize:10, color:"#444", marginTop:3, fontFamily:"'Arial', sans-serif"}}>
            {[data.email, data.phone, data.location, data.linkedin].filter(Boolean).join("  |  ")}
          </div>
        </div>
      )}

      {data.summary && (
        <div style={{marginTop:10}}>
          <div style={{fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"'Arial', sans-serif", marginBottom:3, borderBottom:"0.5px solid #ccc", paddingBottom:2}}>Professional Summary</div>
          <div style={{fontSize:10.5, color:"#222"}}>{data.summary}</div>
        </div>
      )}

      {expItems.length > 0 && (
        <div style={{marginTop:10}}>
          <div style={{fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"'Arial', sans-serif", marginBottom:4, borderBottom:"0.5px solid #ccc", paddingBottom:2}}>Experience</div>
          {expItems.map((exp, i) => (
            <div key={i} style={{marginBottom:8}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
                <div style={{fontWeight:700, fontSize:11, fontFamily:"'Arial', sans-serif"}}>{exp.title}</div>
                <div style={{fontSize:10, color:"#555", fontFamily:"'Arial', sans-serif"}}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.startDate ? " – Present" : ""}</div>
              </div>
              <div style={{fontSize:10, color:"#444", fontStyle:"italic", fontFamily:"'Arial', sans-serif"}}>{exp.company}{exp.location ? `, ${exp.location}` : ""}</div>
              {exp.bullets?.filter(b => b.trim()).length > 0 && (
                <ul style={{margin:"3px 0 0 14px", padding:0}}>
                  {exp.bullets.filter(b => b.trim()).map((b, j) => (
                    <li key={j} style={{fontSize:10.5, marginBottom:1}}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {eduItems.length > 0 && (
        <div style={{marginTop:10}}>
          <div style={{fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"'Arial', sans-serif", marginBottom:4, borderBottom:"0.5px solid #ccc", paddingBottom:2}}>Education</div>
          {eduItems.map((edu, i) => (
            <div key={i} style={{marginBottom:6}}>
              <div style={{display:"flex", justifyContent:"space-between"}}>
                <div style={{fontWeight:700, fontSize:10.5, fontFamily:"'Arial', sans-serif"}}>{edu.degree}{edu.field ? `, ${edu.field}` : ""}</div>
                <div style={{fontSize:10, color:"#555", fontFamily:"'Arial', sans-serif"}}>{edu.year}</div>
              </div>
              <div style={{fontSize:10, color:"#444", fontFamily:"'Arial', sans-serif"}}>{edu.school}</div>
              {edu.gpa && <div style={{fontSize:10, color:"#666", fontFamily:"'Arial', sans-serif"}}>GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{marginTop:10}}>
          <div style={{fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"'Arial', sans-serif", marginBottom:4, borderBottom:"0.5px solid #ccc", paddingBottom:2}}>Skills</div>
          <div style={{fontSize:10.5, color:"#222"}}>{skills.join("  •  ")}</div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }) {
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border-tertiary)" strokeWidth={6}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{transition:"stroke-dashoffset 0.6s ease"}}
      />
      <text x={cx} y={cy-4} textAnchor="middle" style={{fontSize:18, fontWeight:500, fill:"var(--color-text-primary)", fontFamily:"var(--font-sans)"}}>{score}</text>
      <text x={cx} y={cy+13} textAnchor="middle" style={{fontSize:10, fill:"var(--color-text-secondary)", fontFamily:"var(--font-sans)"}}>/ 100</text>
    </svg>
  );
}

const emptyExp = () => ({ title:"", company:"", location:"", startDate:"", endDate:"", bullets:["","",""] });
const emptyEdu = () => ({ degree:"", field:"", school:"", year:"", gpa:"" });

export default function App() {
  const [tab, setTab] = useState("contact");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [data, setData] = useState({
    name:"", email:"", phone:"", location:"", linkedin:"",
    summary:"",
    experience: [emptyExp()],
    education: [emptyEdu()],
    skills:"",
  });

  const set = (field, val) => setData(d => ({ ...d, [field]: val }));

  const setExp = (i, field, val) => setData(d => {
    const experience = [...d.experience];
    experience[i] = { ...experience[i], [field]: val };
    return { ...d, experience };
  });
  const setBullet = (ei, bi, val) => setData(d => {
    const experience = [...d.experience];
    const bullets = [...(experience[ei].bullets || [])];
    bullets[bi] = val;
    experience[ei] = { ...experience[ei], bullets };
    return { ...d, experience };
  });
  const addExp = () => setData(d => ({ ...d, experience: [...d.experience, emptyExp()] }));
  const removeExp = (i) => setData(d => ({ ...d, experience: d.experience.filter((_,j) => j!==i) }));

  const setEdu = (i, field, val) => setData(d => {
    const education = [...d.education];
    education[i] = { ...education[i], [field]: val };
    return { ...d, education };
  });
  const addEdu = () => setData(d => ({ ...d, education: [...d.education, emptyEdu()] }));
  const removeEdu = (i) => setData(d => ({ ...d, education: d.education.filter((_,j) => j!==i) }));

  const { score, issues, tips, keywordsFound } = scoreResume(data);

  const getAiHelp = useCallback(async (section) => {
    setAiLoading(true);
    setAiSuggestion("");
    const context = JSON.stringify({ section, data }, null, 2);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: `You are an expert resume writer and ATS optimization specialist. 
You help job seekers write resumes that pass Applicant Tracking Systems (ATS).
Be concise, specific, and professional. Use industry-standard language.
When suggesting bullet points, always use strong action verbs and include metrics where possible.
Format suggestions clearly. Keep each suggestion under 150 words.`,
          messages:[{
            role:"user",
            content:`Based on this resume data, give me 2-3 specific improvement suggestions for the ${section} section to improve ATS score. Focus on keyword optimization, formatting, and impact.\n\n${context}`
          }]
        })
      });
      const json = await res.json();
      setAiSuggestion(json.content?.[0]?.text || "No suggestion returned.");
    } catch(e) {
      setAiSuggestion("Error fetching suggestion. Please try again.");
    }
    setAiLoading(false);
  }, [data]);

  const TABS = [
    { id:"contact", label:"Contact" },
    { id:"summary", label:"Summary" },
    { id:"experience", label:"Experience" },
    { id:"education", label:"Education" },
    { id:"skills", label:"Skills" },
  ];

  const inputStyle = {
    width:"100%", boxSizing:"border-box",
    padding:"7px 10px", fontSize:13,
    border:"0.5px solid var(--color-border-secondary)",
    borderRadius:"var(--border-radius-md)",
    background:"var(--color-background-primary)",
    color:"var(--color-text-primary)",
    fontFamily:"var(--font-sans)",
    marginBottom:8,
    outline:"none",
  };
  const labelStyle = { fontSize:11, color:"var(--color-text-secondary)", marginBottom:2, display:"block", fontWeight:500, letterSpacing:0.3 };

  return (
    <div style={{display:"flex", gap:0, minHeight:680, fontFamily:"var(--font-sans)"}}>
      {/* Left: Form */}
      <div style={{flex:"0 0 340px", borderRight:"0.5px solid var(--color-border-tertiary)", display:"flex", flexDirection:"column"}}>
        {/* Header */}
        <div style={{padding:"14px 16px 10px", borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
          <div style={{fontSize:15, fontWeight:500, color:"var(--color-text-primary)"}}>Resume Builder</div>
          <div style={{fontSize:11, color:"var(--color-text-secondary)", marginTop:2}}>ATS-optimized template</div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex", borderBottom:"0.5px solid var(--color-border-tertiary)", background:"var(--color-background-secondary)"}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{flex:1, border:"none", background:"none", padding:"8px 4px", fontSize:11,
                fontWeight:tab===t.id?500:400,
                color:tab===t.id?"var(--color-text-primary)":"var(--color-text-secondary)",
                borderBottom:tab===t.id?"2px solid var(--color-text-primary)":"2px solid transparent",
                cursor:"pointer", fontFamily:"var(--font-sans)"
              }}>{t.label}</button>
          ))}
        </div>

        {/* Form content */}
        <div style={{flex:1, overflowY:"auto", padding:"14px 16px"}}>
          {tab === "contact" && (
            <div>
              {[["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["Location","location","text"],["LinkedIn URL","linkedin","url"]].map(([label,field,type]) => (
                <div key={field}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} value={data[field]} onChange={e => set(field, e.target.value)} style={inputStyle} placeholder={label}/>
                </div>
              ))}
            </div>
          )}

          {tab === "summary" && (
            <div>
              <div style={{fontSize:12, color:"var(--color-text-secondary)", background:"var(--color-background-secondary)", borderRadius:"var(--border-radius-md)", padding:"8px 10px", marginBottom:10, lineHeight:1.5}}>
                {SECTION_TIPS.summary}
              </div>
              <label style={labelStyle}>Professional Summary</label>
              <textarea value={data.summary} onChange={e => set("summary", e.target.value)}
                rows={6} style={{...inputStyle, resize:"vertical", lineHeight:1.6}}
                placeholder="Results-driven Software Engineer with 5+ years of experience developing scalable web applications..."/>
              <div style={{fontSize:11, color:"var(--color-text-secondary)", marginTop:-4}}>{data.summary.length} chars · aim for 300–600</div>
              <button onClick={() => getAiHelp("summary")} disabled={aiLoading}
                style={{marginTop:8, padding:"6px 12px", fontSize:12, border:"0.5px solid var(--color-border-secondary)", borderRadius:"var(--border-radius-md)", background:"none", color:"var(--color-text-primary)", cursor:"pointer", fontFamily:"var(--font-sans)"}}>
                {aiLoading ? "Thinking..." : "AI suggestions ↗"}
              </button>
            </div>
          )}

          {tab === "experience" && (
            <div>
              <div style={{fontSize:12, color:"var(--color-text-secondary)", background:"var(--color-background-secondary)", borderRadius:"var(--border-radius-md)", padding:"8px 10px", marginBottom:10, lineHeight:1.5}}>
                {SECTION_TIPS.experience}
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{border:"0.5px solid var(--color-border-tertiary)", borderRadius:"var(--border-radius-lg)", padding:"10px 12px", marginBottom:10}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                    <div style={{fontSize:12, fontWeight:500}}>Role {i+1}</div>
                    {data.experience.length > 1 && <button onClick={() => removeExp(i)} style={{border:"none", background:"none", color:"var(--color-text-secondary)", cursor:"pointer", fontSize:18, lineHeight:1}}>×</button>}
                  </div>
                  {[["Job Title","title"],["Company","company"],["Location","location"],["Start Date","startDate"],["End Date (or leave blank)","endDate"]].map(([lbl,f]) => (
                    <div key={f}>
                      <label style={labelStyle}>{lbl}</label>
                      <input value={exp[f]} onChange={e => setExp(i,f,e.target.value)} style={inputStyle} placeholder={lbl}/>
                    </div>
                  ))}
                  <label style={labelStyle}>Bullet Points</label>
                  {(exp.bullets || []).map((b, bi) => (
                    <input key={bi} value={b} onChange={e => setBullet(i,bi,e.target.value)}
                      style={{...inputStyle, marginBottom:4}}
                      placeholder={`• ${["Led a team of 8 engineers to deliver...", "Increased revenue by 23% through...", "Designed and built a scalable API..."][bi % 3]}`}/>
                  ))}
                  <button onClick={() => setData(d => {
                    const experience = [...d.experience];
                    experience[i] = {...experience[i], bullets:[...experience[i].bullets,""]};
                    return {...d,experience};
                  })} style={{fontSize:11, color:"var(--color-text-secondary)", border:"none", background:"none", cursor:"pointer", padding:0}}>+ add bullet</button>
                </div>
              ))}
              <button onClick={addExp} style={{width:"100%", padding:"8px", fontSize:12, border:"0.5px dashed var(--color-border-secondary)", borderRadius:"var(--border-radius-md)", background:"none", color:"var(--color-text-secondary)", cursor:"pointer"}}>+ Add role</button>
              <button onClick={() => getAiHelp("experience")} disabled={aiLoading}
                style={{marginTop:8, padding:"6px 12px", fontSize:12, border:"0.5px solid var(--color-border-secondary)", borderRadius:"var(--border-radius-md)", background:"none", color:"var(--color-text-primary)", cursor:"pointer", fontFamily:"var(--font-sans)"}}>
                {aiLoading ? "Thinking..." : "AI suggestions ↗"}
              </button>
            </div>
          )}

          {tab === "education" && (
            <div>
              {data.education.map((edu, i) => (
                <div key={i} style={{border:"0.5px solid var(--color-border-tertiary)", borderRadius:"var(--border-radius-lg)", padding:"10px 12px", marginBottom:10}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                    <div style={{fontSize:12, fontWeight:500}}>Entry {i+1}</div>
                    {data.education.length > 1 && <button onClick={() => removeEdu(i)} style={{border:"none", background:"none", color:"var(--color-text-secondary)", cursor:"pointer", fontSize:18}}>×</button>}
                  </div>
                  {[["Degree (e.g. BSc, MBA)","degree"],["Field of Study","field"],["School / University","school"],["Year of Graduation","year"],["GPA (optional)","gpa"]].map(([lbl,f]) => (
                    <div key={f}>
                      <label style={labelStyle}>{lbl}</label>
                      <input value={edu[f]} onChange={e => setEdu(i,f,e.target.value)} style={inputStyle} placeholder={lbl}/>
                    </div>
                  ))}
                </div>
              ))}
              <button onClick={addEdu} style={{width:"100%", padding:"8px", fontSize:12, border:"0.5px dashed var(--color-border-secondary)", borderRadius:"var(--border-radius-md)", background:"none", color:"var(--color-text-secondary)", cursor:"pointer"}}>+ Add education</button>
            </div>
          )}

          {tab === "skills" && (
            <div>
              <div style={{fontSize:12, color:"var(--color-text-secondary)", background:"var(--color-background-secondary)", borderRadius:"var(--border-radius-md)", padding:"8px 10px", marginBottom:10, lineHeight:1.5}}>
                {SECTION_TIPS.skills}
              </div>
              <label style={labelStyle}>Skills (comma-separated)</label>
              <textarea value={data.skills} onChange={e => set("skills", e.target.value)}
                rows={5} style={{...inputStyle, resize:"vertical"}}
                placeholder="Python, JavaScript, React, SQL, Project Management, Agile, Data Analysis, Communication..."/>
              <div style={{fontSize:11, color:"var(--color-text-secondary)", marginTop:-4}}>
                {data.skills.split(",").filter(s=>s.trim()).length} skills listed
              </div>
              <button onClick={() => getAiHelp("skills")} disabled={aiLoading}
                style={{marginTop:8, padding:"6px 12px", fontSize:12, border:"0.5px solid var(--color-border-secondary)", borderRadius:"var(--border-radius-md)", background:"none", color:"var(--color-text-primary)", cursor:"pointer", fontFamily:"var(--font-sans)"}}>
                {aiLoading ? "Thinking..." : "AI suggestions ↗"}
              </button>
            </div>
          )}

          {aiSuggestion && (
            <div style={{marginTop:12, background:"var(--color-background-info)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:"var(--border-radius-md)", padding:"10px 12px"}}>
              <div style={{fontSize:11, fontWeight:500, color:"var(--color-text-info)", marginBottom:5}}>AI Suggestions</div>
              <div style={{fontSize:12, color:"var(--color-text-primary)", lineHeight:1.6, whiteSpace:"pre-wrap"}}>{aiSuggestion}</div>
              <button onClick={() => setAiSuggestion("")} style={{marginTop:6, fontSize:11, color:"var(--color-text-secondary)", border:"none", background:"none", cursor:"pointer"}}>dismiss</button>
            </div>
          )}
        </div>
      </div>

      {/* Right: ATS Score + Preview */}
      <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden"}}>
        {/* ATS Score Panel */}
        <div style={{borderBottom:"0.5px solid var(--color-border-tertiary)", padding:"12px 16px", background:"var(--color-background-secondary)"}}>
          <div style={{display:"flex", alignItems:"center", gap:16}}>
            <ScoreRing score={score}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13, fontWeight:500, marginBottom:4}}>ATS Score</div>
              <div style={{fontSize:11, color:"var(--color-text-secondary)", marginBottom:6}}>
                {score >= 80 ? "Excellent — very likely to pass ATS filters" : score >= 60 ? "Good — some improvements recommended" : score >= 40 ? "Fair — needs more work to pass ATS" : "Needs attention — fill in all sections"}
              </div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                <span style={{fontSize:11, padding:"2px 8px", borderRadius:20, background:"var(--color-background-success)", color:"var(--color-text-success)", border:"0.5px solid var(--color-border-success)"}}>
                  {keywordsFound} keywords found
                </span>
                {issues.slice(0,2).map((iss,i) => (
                  <span key={i} style={{fontSize:11, padding:"2px 8px", borderRadius:20, background:"var(--color-background-danger)", color:"var(--color-text-danger)", border:"0.5px solid var(--color-border-danger)"}}>
                    {iss}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {(tips.length > 0 || issues.length > 2) && (
            <div style={{marginTop:10, display:"flex", flexDirection:"column", gap:3}}>
              {[...issues.slice(2), ...tips].slice(0,3).map((t,i) => (
                <div key={i} style={{fontSize:11, color:"var(--color-text-secondary)", display:"flex", gap:6, alignItems:"flex-start"}}>
                  <span style={{color:"var(--color-text-warning)", fontSize:14, lineHeight:1}}>›</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview toggle */}
        <div style={{display:"flex", borderBottom:"0.5px solid var(--color-border-tertiary)", background:"var(--color-background-primary)"}}>
          <button onClick={() => setShowPreview(false)}
            style={{padding:"8px 16px", fontSize:12, border:"none", background:"none", cursor:"pointer",
              color:!showPreview?"var(--color-text-primary)":"var(--color-text-secondary)",
              borderBottom:!showPreview?"2px solid var(--color-text-primary)":"2px solid transparent",
              fontFamily:"var(--font-sans)", fontWeight:!showPreview?500:400}}>
            Resume Preview
          </button>
          <button onClick={() => setShowPreview(true)}
            style={{padding:"8px 16px", fontSize:12, border:"none", background:"none", cursor:"pointer",
              color:showPreview?"var(--color-text-primary)":"var(--color-text-secondary)",
              borderBottom:showPreview?"2px solid var(--color-text-primary)":"2px solid transparent",
              fontFamily:"var(--font-sans)", fontWeight:showPreview?500:400}}>
            Optimization Checklist
          </button>
        </div>

        <div style={{flex:1, overflowY:"auto", padding:"0"}}>
          {!showPreview ? (
            <div style={{background:"#e8e8e8", padding:"16px", minHeight:"100%"}}>
              <div style={{maxWidth:560, margin:"0 auto", boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                <ResumePreview data={data}/>
              </div>
            </div>
          ) : (
            <div style={{padding:"16px"}}>
              <div style={{fontSize:13, fontWeight:500, marginBottom:12}}>ATS Optimization Checklist</div>
              {[
                { label:"Contact info complete", done: !!(data.name && data.email && data.phone) },
                { label:"Professional summary present (200+ chars)", done: data.summary?.length > 200 },
                { label:"At least 2 experience entries", done: data.experience?.filter(e=>e.title||e.company).length >= 2 },
                { label:"3+ bullets per role", done: data.experience?.some(e => e.bullets?.filter(b=>b.trim()).length >= 3) },
                { label:"Quantified achievements (numbers/metrics)", done: data.experience?.some(e => e.bullets?.some(b => /\d+/.test(b))) },
                { label:"Education listed", done: data.education?.some(e=>e.degree||e.school) },
                { label:"8+ skills listed", done: data.skills?.split(",").filter(s=>s.trim()).length >= 8 },
                { label:"5+ ATS keywords detected", done: keywordsFound >= 5 },
                { label:"LinkedIn or URL included", done: !!data.linkedin },
                { label:"Location listed", done: !!data.location },
              ].map((item, i) => (
                <div key={i} style={{display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                  <div style={{width:18, height:18, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    background: item.done ? "var(--color-background-success)" : "var(--color-background-secondary)",
                    border: `0.5px solid ${item.done ? "var(--color-border-success)" : "var(--color-border-secondary)"}`,
                    flexShrink:0
                  }}>
                    {item.done && <span style={{fontSize:11, color:"var(--color-text-success)", lineHeight:1}}>✓</span>}
                  </div>
                  <span style={{fontSize:12, color: item.done ? "var(--color-text-primary)" : "var(--color-text-secondary)"}}>{item.label}</span>
                </div>
              ))}

              <div style={{marginTop:16, padding:"12px", background:"var(--color-background-secondary)", borderRadius:"var(--border-radius-md)"}}>
                <div style={{fontSize:12, fontWeight:500, marginBottom:6}}>Pro tips for ATS success</div>
                <div style={{fontSize:11, color:"var(--color-text-secondary)", lineHeight:1.7}}>
                  • Use standard section headings (Experience, Education, Skills)<br/>
                  • Avoid tables, graphics, and columns — ATS can't parse them<br/>
                  • Use the exact job title from the posting in your summary<br/>
                  • Spell out acronyms at least once (ML — Machine Learning)<br/>
                  • Save as .docx or plain .pdf — avoid fancy PDF formats<br/>
                  • Tailor your skills section for every application
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
