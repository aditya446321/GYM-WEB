import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

/* 1) Paste your Firebase Web App config here. */
const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT.firebasestorage.app",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

const configured = firebaseConfig.apiKey !== "PASTE_API_KEY";
const app = configured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const $=id=>document.getElementById(id), loginView=$("loginView"), appView=$("appView"), content=$("content");
let currentUser=null, currentProfile=null;

function toast(msg,error=false){const t=$("toast");t.textContent=msg;t.className=error?"show error":"show";setTimeout(()=>t.className="",3200)}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function fmtMoney(n){return "₹"+Number(n||0).toLocaleString("en-IN")}
function initials(n){return (n||"User").split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}

$("togglePass").onclick=()=>{$("password").type=$("password").type==="password"?"text":"password";$("togglePass").textContent=$("password").type==="password"?"Show":"Hide"}
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!configured){toast("Add your Firebase config in js/app.js first.",true);return}
 try{await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);toast("Signed in");}
 catch(err){toast(err.code==="auth/invalid-credential"?"Invalid email or password.":"Login failed. Check Firebase Auth setup.",true)}
});
$("logout").onclick=()=>signOut(auth);

async function getProfile(uid){
 const snap=await getDoc(doc(db,"users",uid));
 if(!snap.exists()) throw new Error("No role profile found for this account.");
 return {id:snap.id,...snap.data()};
}
function setNav(role){
 const tpl=$(role==="admin"?"adminNav":role==="trainer"?"trainerNav":"clientNav");
 $("nav").innerHTML=tpl.innerHTML;
 $("nav").querySelectorAll("button").forEach(b=>b.onclick=()=>render(b.dataset.page));
}
function showApp(){
 loginView.classList.add("hidden");appView.classList.remove("hidden");
 $("rolePill").textContent=(currentProfile.role||"client").toUpperCase();
 $("userName").textContent=currentProfile.name||currentUser.email;
 $("userRole").textContent=currentProfile.role||"client";
 $("avatar").textContent=initials(currentProfile.name||currentUser.email);
 setNav(currentProfile.role);
 render("dashboard");
}
async function getCol(name){const s=await getDocs(collection(db,name));return s.docs.map(d=>({id:d.id,...d.data()}))}
function navActive(page){$("nav").querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.page===page))}
function layout(title,kicker="GYM MANAGEMENT"){ $("pageTitle").textContent=title;$("pageKicker").textContent=kicker }

async function render(page){
 navActive(page);
 const role=currentProfile.role;
 if(role==="admin") return renderAdmin(page);
 if(role==="trainer") return renderTrainer(page);
 return renderClient(page);
}

async function renderAdmin(page){
 try{
  if(page==="dashboard"){layout("Overview");const [c,t,p,m,r]=await Promise.all(["clients","trainers","payments","memberships","reviews"].map(getCol));
   const due=p.filter(x=>x.status==="due").reduce((a,x)=>a+Number(x.amount||0),0);
   content.innerHTML=`<div class="hero"><div class="card"><p class="eyebrow">FIT CULTURE</p><h2>Run your gym<br><span class="accent">smarter.</span></h2><p class="muted">Manage members, trainers, memberships, PT sessions, payments and reviews from one place.</p></div><div class="card"><p class="stat-label">Outstanding payments</p><div class="stat-value">${fmtMoney(due)}</div><p class="muted">Based on payment records marked due.</p></div></div>
   <div class="grid stats section"><div class="card"><div class="stat-label">Clients</div><div class="stat-value">${c.length}</div></div><div class="card"><div class="stat-label">Trainers</div><div class="stat-value">${t.length}</div></div><div class="card"><div class="stat-label">Memberships</div><div class="stat-value">${m.length}</div></div><div class="card"><div class="stat-label">Reviews</div><div class="stat-value">${r.length}</div></div></div>
   <div class="section card"><div class="section-head"><h3>Recent clients</h3><button class="ghost" onclick="window.go('clients')">View all</button></div>${clientTable(c.slice(0,6))}</div>`;return}
  if(page==="clients"){layout("Clients");const c=await getCol("clients");content.innerHTML=`<div class="section card"><div class="section-head"><h3>Client directory</h3><div class="search"><input id="clientSearch" placeholder="Search name or client no."></div></div><div id="clientTable">${clientTable(c)}</div></div>`;$("clientSearch").oninput=e=>{$("clientTable").innerHTML=clientTable(c.filter(x=>(x.name+" "+x.clientNumber).toLowerCase().includes(e.target.value.toLowerCase()))) };return}
  if(page==="trainers"){layout("Trainers");const t=await getCol("trainers");content.innerHTML=`<div class="section card">${simpleTable(["Name","Speciality","Phone","Status"],t,x=>[x.name,x.speciality||"—",x.phone||"—",`<span class="badge">${esc(x.status||"Active")}</span>`])}</div>`;return}
  if(page==="memberships"){layout("Memberships");const m=await getCol("memberships");content.innerHTML=`<div class="section card">${simpleTable(["Client","Plan","Start","Expiry","Status"],m,x=>[x.clientName,x.plan,x.startDate,x.expiryDate,`<span class="badge ${x.status==="expired"?"expired":""}">${esc(x.status||"Active")}</span>`])}</div>`;return}
  if(page==="payments"){layout("Payments");const p=await getCol("payments");content.innerHTML=`<div class="section card">${simpleTable(["Client","Amount","Due date","Status"],p,x=>[x.clientName,fmtMoney(x.amount),x.dueDate,`<span class="badge ${x.status==="due"?"due":""}">${esc(x.status||"paid")}</span>`])}</div>`;return}
  if(page==="reviews"){layout("Reviews");const r=await getCol("reviews");content.innerHTML=`<div class="section card">${simpleTable(["Client","Rating","Review","Created"],r,x=>[x.clientName,`<span class="review-stars">${"★".repeat(Number(x.rating||0))}</span>`,esc(x.text||""),x.createdAt?.toDate?x.createdAt.toDate().toLocaleDateString("en-IN"):"—"])}</div>`;return}
 }catch(e){content.innerHTML=`<div class="card empty">${esc(e.message)}</div>`}
}
function clientTable(rows){return simpleTable(["Client","Number","Membership","Expiry","Status"],rows,x=>[`<b>${esc(x.name)}</b>`,esc(x.clientNumber),esc(x.membership||"—"),esc(x.membershipExpiry||"—"),`<span class="badge ${x.status==="Expired"?"expired":""}">${esc(x.status||"Active")}</span>`])}
function simpleTable(headers,rows,fn){if(!rows.length)return `<div class="empty">No records found yet.</div>`;return `<div class="table-wrap"><table class="table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(x=>`<tr>${fn(x).map(v=>`<td>${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`}

async function renderTrainer(page){
 if(page==="dashboard"){layout("Trainer Dashboard");const clients=await getCol("clients");const mine=clients.filter(x=>x.trainerId===currentUser.uid||x.trainer===currentProfile.name);content.innerHTML=`<div class="grid stats"><div class="card"><div class="stat-label">Assigned clients</div><div class="stat-value">${mine.length}</div></div><div class="card"><div class="stat-label">Sessions completed</div><div class="stat-value">${mine.reduce((a,x)=>a+Number(x.sessionsCompleted||0),0)}</div></div><div class="card"><div class="stat-label">Pending sessions</div><div class="stat-value">${mine.reduce((a,x)=>a+Number(x.pendingSessions||0),0)}</div></div></div><div class="section card">${clientTable(mine)}</div>`;return}
 if(page==="clients"){layout("My Clients");const clients=(await getCol("clients")).filter(x=>x.trainerId===currentUser.uid||x.trainer===currentProfile.name);content.innerHTML=`<div class="card">${clientTable(clients)}</div>`;return}
 if(page==="sessions"){layout("Sessions");const s=(await getCol("sessions")).filter(x=>x.trainerId===currentUser.uid);content.innerHTML=`<div class="card">${simpleTable(["Client","Date","Type","Status"],s,x=>[x.clientName,x.date,x.type||"PT",`<span class="badge ${x.status==="pending"?"due":""}">${esc(x.status||"pending")}</span>`])}</div>`;return}
}

async function renderClient(page){
 const c=(await getCol("clients")).find(x=>x.userId===currentUser.uid||x.email===currentUser.email);
 if(!c){content.innerHTML='<div class="card empty">Your client profile has not been linked yet. Ask the gym admin to add your userId to the client record.</div>';return}
 if(page==="dashboard"){layout("My Dashboard");content.innerHTML=`<div class="hero"><div class="card"><p class="eyebrow">MEMBER</p><h2>${esc(c.name)}</h2><p class="muted">${esc(c.clientNumber||"")} · ${esc(c.status||"Active")}</p></div><div class="card"><div class="stat-label">Membership expiry</div><div class="stat-value">${esc(c.membershipExpiry||"—")}</div></div></div><div class="grid stats section"><div class="card"><div class="stat-label">Membership</div><div class="stat-value">${esc(c.membership||"—")}</div></div><div class="card"><div class="stat-label">PT plan</div><div class="stat-value">${esc(c.ptPlan||"—")}</div></div><div class="card"><div class="stat-label">Completed</div><div class="stat-value">${Number(c.sessionsCompleted||0)}</div></div><div class="card"><div class="stat-label">Pending</div><div class="stat-value">${Number(c.pendingSessions||0)}</div></div></div>`;return}
 if(page==="profile"){layout("My Profile");content.innerHTML=`<div class="card"><div class="table-wrap"><table class="table"><tbody>${[["Client name",c.name],["Client number",c.clientNumber],["Phone",c.phone],["Address",c.address],["Gym timing",c.gymTiming],["Personal trainer",c.trainer],["Status",c.status]].map(r=>`<tr><th>${r[0]}</th><td>${esc(r[1]||"—")}</td></tr>`).join("")}</tbody></table></div></div>`;return}
 if(page==="sessions"){layout("My Sessions");content.innerHTML=`<div class="grid stats"><div class="card"><div class="stat-label">Completed</div><div class="stat-value">${c.sessionsCompleted||0}</div></div><div class="card"><div class="stat-label">Pending</div><div class="stat-value">${c.pendingSessions||0}</div></div><div class="card"><div class="stat-label">Carry forward</div><div class="stat-value">${c.carryForward||0}</div></div></div>`;return}
 if(page==="payments"){layout("Payments");const p=(await getCol("payments")).filter(x=>x.clientId===c.id||x.clientEmail===currentUser.email);content.innerHTML=`<div class="card">${simpleTable(["Amount","Due date","Status","Note"],p,x=>[fmtMoney(x.amount),x.dueDate,`<span class="badge ${x.status==="due"?"due":""}">${esc(x.status||"paid")}</span>`,esc(x.note||"—")])}</div>`;return}
 if(page==="review"){layout("Write Review");content.innerHTML=`<div class="card"><p class="muted">Share feedback about the gym and your personal trainer.</p><form id="reviewForm"><label>Rating<select id="rating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label><label>Review<textarea id="reviewText" rows="5" placeholder="Tell us about your experience" required></textarea></label><button class="primary" type="submit">Submit review</button></form></div>`;$("reviewForm").onsubmit=async e=>{e.preventDefault();try{await addDoc(collection(db,"reviews"),{clientId:c.id,clientName:c.name,rating:Number($("rating").value),text:$("reviewText").value,createdAt:serverTimestamp()});toast("Review submitted");render("review")}catch(err){toast("Could not submit review",true)}}}
}
window.go=render;

if(configured){
 onAuthStateChanged(auth,async u=>{if(!u){currentUser=null;loginView.classList.remove("hidden");appView.classList.add("hidden");return}
  try{currentUser=u;currentProfile=await getProfile(u.uid);showApp()}catch(e){toast(e.message,true);await signOut(auth)}});
}else{loginView.classList.remove("hidden");}
