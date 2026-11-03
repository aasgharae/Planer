const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const LS_KEY='neo_planner_v2';
let store={tasks:[],habits:[],history:{}};
let filter='all';
const faNum=n=>Number(n||0).toLocaleString('fa-IR');
function todayKey(d=new Date()){return d.toISOString().slice(0,10);}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800);}
function openModal(id){$('#'+id).classList.add('show');}
function closeModal(id){$('#'+id).classList.remove('show');}
$$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show');}));

// --- default seed ---
function defaults(){
return {
tasks:[
{id:1,title:'باشگاه: سینه + جلو بازو (۴ ست)',cat:'gym',pri:'high',time:'18:00',done:false},
{id:2,title:'۳۰ دقیقه پیاده‌روی تند',cat:'sport',pri:'normal',time:'07:30',done:false},
{id:3,title:'کتاب: ۲۰ صفحه',cat:'study',pri:'normal',time:'22:00',done:false},
{id:4,title:'۸ لیوان آب',cat:'health',pri:'low',time:'12:00',done:false}],
habits:[
{id:11,icon:'🏋️',name:'بدنسازی',unit:'ست',target:5,val:0,streak:0},
{id:12,icon:'🏃',name:'هوازی',unit:'دقیقه',target:30,val:0,streak:0},
{id:13,icon:'📚',name:'کتاب‌خواندن',unit:'صفحه',target:20,val:0,streak:0},
{id:14,icon:'💧',name:'آب',unit:'لیوان',target:8,val:0,streak:0},
{id:15,icon:'😴',name:'خواب منظم',unit:'ساعت',target:8,val:0,streak:0},
{id:16,icon:'🧠',name:'یادگیری زبان',unit:'دقیقه',target:20,val:0,streak:0}],
history:{}};
}
function load(){try{const r=localStorage.getItem(LS_KEY);if(r){store=JSON.parse(r);return;}}catch(e){} store=defaults();save();}
function save(){localStorage.setItem(LS_KEY,JSON.stringify(store));mirrorIDB();updateHistory();}
function seedDemo(){store=defaults();save();renderAll();toast('با مثال تازه شد ✨');}
function resetAll(){if(!confirm('همه داده‌ها پاک شود؟'))return;store={tasks:[],habits:[],history:{}};save();renderAll();}

// IndexedDB mirror (SQLite-like persistent layer)
function mirrorIDB(){
try{
const req=indexedDB.open('neo_planner_db',1);
req.onupgradeneeded=e=>{const db=e.target.result;if(!db.objectStoreNames.contains('kv'))db.createObjectStore('kv');};
req.onsuccess=e=>{const db=e.target.result;const tx=db.transaction('kv','readwrite');tx.objectStore('kv').put(JSON.stringify(store),'state');};
}catch(e){}
}

// --- core calc ---
function calc(){
const t=store.tasks, d=t.filter(x=>x.done).length;
let hPct=0; if(store.habits.length){hPct=Math.round(store.habits.reduce((s,h)=>s+Math.min(100,(h.val/h.target)*100),0)/store.habits.length);}
const score=t.length===0&&store.habits.length===0?0:Math.round(((t.length?(d/t.length*100):100)*0.5+hPct*0.5));
const xp=d*10+store.habits.reduce((s,h)=>s+Math.min(h.val,h.target)*2,0);
return {total:t.length,done:d,hPct,score,xp,level:Math.floor(xp/100)+1,xpIn:xp%100};
}
function updateHistory(){
const c=calc(), k=todayKey();
store.history[k]=Object.assign(store.history[k]||{},{score:c.score,done:c.done,total:c.total,xp:c.xp});
localStorage.setItem(LS_KEY,JSON.stringify(store));
}
function lastNDays(n){const arr=[];for(let i=n-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=todayKey(d);arr.push({k,v:(store.history[k]?store.history[k].score:0),label:d.toLocaleDateString('fa-IR',{weekday:'short'})});}return arr;}

// --- render ---
function renderAll(){renderDate();renderHero();renderTasks();renderHabits();renderStats();}
function renderDate(){$('#todayDate').textContent=new Date().toLocaleDateString('fa-IR',{weekday:'long',day:'numeric',month:'long'});}
function renderHero(){
const c=calc();
$('#scoreText').textContent='٪'+faNum(c.score);
$('#ringFg').style.strokeDashoffset=(326.7-326.7*c.score/100);
$('#statTasks').textContent=faNum(c.done)+'/'+faNum(c.total);
$('#statHabits').textContent='٪'+faNum(c.hPct);
$('#statXp').textContent=faNum(c.xp);
$('#levelText').textContent='سطح '+faNum(c.level);
$('#xpFill').style.width=c.xpIn+'%';
const st=calcStreak();$('#streakText').textContent='🔥 '+faNum(st)+' روز';
$('#remainCount').textContent=c.total-c.done===0&&c.total>0?'· تمام شد 🎉':(c.total?('· '+faNum(c.total-c.done)+' مانده'):'');
let msg='امروز را شروع کن ✨';
if(c.score===100)msg='فوق‌العاده! امروز کامل بودی 🏆';
else if(c.score>=70)msg='ریتمت عالیه، همین را نگه دار 💪';
else if(c.score>=40)msg='خوب پیش می‌روی، دو قدم دیگر 🚀';
else if(c.total>0||store.habits.length>0)msg='آروم شروع کن؛ یک تیک کوچک بزن 🌱';
$('#insightBox').textContent=msg;
}
function calcStreak(){let s=0;for(let i=0;i<60;i++){const d=new Date();d.setDate(d.getDate()-i);const k=todayKey(d);const v=store.history[k];if(i===0&&!v)continue;if(v&&v.score>=60)s++;else if(i>0)break;}return s;}
const catName={gym:'باشگاه',sport:'هوازی',study:'مطالعه',work:'کار',health:'سلامت',personal:'شخصی'};
function renderTasks(){
let list=[...store.tasks];
if(filter==='active')list=list.filter(t=>!t.done);
if(filter==='done')list=list.filter(t=>t.done);
if(filter==='gym')list=list.filter(t=>t.cat==='gym');
if(filter==='study')list=list.filter(t=>t.cat==='study');
const ul=$('#taskList');ul.innerHTML='';
if(!list.length){ul.innerHTML='<li class="empty">کاری نیست! یک کار ثبت کن ✨</li>';return;}
list.forEach(t=>{
const li=document.createElement('li');if(t.done)li.className='done';
li.innerHTML='<div class="check">'+(t.done?'✓':'')+'</div><div class="t-main"><span class="t-title"></span><span class="t-meta">'+(catName[t.cat]||t.cat)+' · '+(t.time||'')+'</span></div><span class="badge '+t.pri+'">'+(t.pri==='high'?'مهم':t.pri==='low'?'کم':'عادی')+'</span><button class="del">×</button>';
li.querySelector('.t-title').textContent=t.title;
li.querySelector('.check').onclick=()=>{t.done=!t.done;if(t.done)toast('آفرین! +۱۰ امتیاز ⚡');save();renderAll();};
li.querySelector('.del').onclick=()=>{store.tasks=store.tasks.filter(x=>x.id!==t.id);save();renderAll();};
ul.appendChild(li);
});
}
function renderHabits(){
const wrap=$('#quickHabits');wrap.innerHTML='';
const box=$('#habitList');box.innerHTML='';
if(!store.habits.length){box.innerHTML='<div class="empty">عادتی نداری؛ یکی بساز 🌱</div>';}
store.habits.forEach(h=>{
// quick
const q=document.createElement('div');q.className='glass quick-card';
q.innerHTML='<div style="font-size:22px">'+h.icon+'</div><b></b><small>'+faNum(Math.min(100,Math.round(h.val/h.target*100)))+'٪ · '+faNum(h.val)+'/'+faNum(h.target)+' '+h.unit+'</small><div class="q-controls"><button>−</button><span class="q-num">'+faNum(h.val)+'</span><button>+</button></div>';
q.querySelector('b').textContent=h.name;
const btns=q.querySelectorAll('button');btns[0].onclick=()=>stepHabit(h.id,-1);btns[1].onclick=()=>stepHabit(h.id,1);
wrap.appendChild(q);
// full
const p=Math.min(100,Math.round(h.val/h.target*100));
const card=document.createElement('div');card.className='glass habit-card';
card.innerHTML='<div class="habit-top"><div class="habit-ico">'+h.icon+'</div><div class="habit-name"><b></b><small>'+h.unit+' · هدف '+faNum(h.target)+' · استریک '+faNum(h.streak)+' 🔥</small></div><button class="del">×</button></div><div class="habit-bar"><div class="habit-fill" style="width:'+p+'%"></div></div><div class="habit-foot"><span>'+faNum(p)+'٪ امروز</span><div class="stepper"><button>−</button><b>'+faNum(h.val)+'</b><button class="plus">+</button></div></div>';
card.querySelector('.habit-name b').textContent=h.name;
card.querySelector('.del').onclick=()=>{if(confirm('حذف عادت؟')){store.habits=store.habits.filter(x=>x.id!==h.id);save();renderAll();}};
const sb=card.querySelectorAll('.stepper button');sb[0].onclick=()=>stepHabit(h.id,-1);sb[1].onclick=()=>stepHabit(h.id,1);
box.appendChild(card);
});
}
function stepHabit(id,d){
const h=store.habits.find(x=>x.id===id);if(!h)return;
h.val=Math.max(0,h.val+d);
if(h.val>=h.target&&d>0){h.streak=(h.streak||0)+0;toast(h.name+': هدف کامل شد 🎉');}
save();renderAll();
}
function saveTask(){
const v=$('#taskTitle').value.trim();if(!v){toast('عنوان را بنویس');return;}
store.tasks.unshift({id:Date.now(),title:v,cat:$('#taskCat').value,pri:$('#taskPri').value,time:$('#taskTime').value,done:false});
$('#taskTitle').value='';closeModal('taskModal');save();renderAll();toast('ثبت شد ⚡');
}
function saveHabit(){
const n=$('#habitName').value.trim();if(!n){toast('نام عادت را بنویس');return;}
store.habits.push({id:Date.now(),icon:$('#habitIcon').value,name:n,unit:$('#habitUnit').value||'واحد',target:Math.max(1,parseInt($('#habitTarget').value)||1),val:0,streak:0});
$('#habitName').value='';closeModal('habitModal');save();renderAll();toast('عادت ساخته شد 🔥');
}

// --- stats & charts ---
function renderStats(){
const w=lastNDays(7), m=lastNDays(30);
const avg=a=>a.length?Math.round(a.reduce((s,x)=>s+x.v,0)/a.length):0;
const nowAvg=avg(w), prev=avg(lastNDays(14).slice(0,7));
const diff=nowAvg-prev;
const card=$('#trendCard');
if(diff>0){card.className='glass trend-card up';card.innerHTML='📈 <b>پیشرفت '+faNum(diff)+'٪</b> نسبت به هفته قبل<br/><small>میانگین این هفته ٪'+faNum(nowAvg)+' — ریتمت صعودی است، ادامه بده!</small>';}
else if(diff<0){card.className='glass trend-card down';card.innerHTML='📉 <b>پسرفت '+faNum(Math.abs(diff))+'٪</b> نسبت به هفته قبل<br/><small>میانگین این هفته ٪'+faNum(nowAvg)+' — یک عادت کوچک را امروز کامل کن تا برگردی 🌱</small>';}
else{card.className='glass trend-card';card.innerHTML='➖ <b>ثبات</b><br/><small>میانگین ٪'+faNum(nowAvg)+' — برای رشد، فردا یک تسک بیشتر ببند.</small>';}
drawBars($('#chartWeek'),w);
drawLine($('#chartMonth'),m);
drawHabits($('#chartHabits'));
}
function setupCanvas(cv){const r=cv.getBoundingClientRect();const dpr=window.devicePixelRatio||1;cv.width=r.width*dpr;cv.height=(parseInt(cv.getAttribute('height'))||160)*dpr;const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);return {ctx,W:r.width,H:parseInt(cv.getAttribute('height'))||160};}
function drawBars(cv,data){
const {ctx,W,H}=setupCanvas(cv);ctx.clearRect(0,0,W,H);
const bw=W/data.length;
data.forEach((d,i)=>{
const h=(d.v/100)*(H-34);const x=i*bw+6,y=H-20-h;
const gr=ctx.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#ff2ee6');gr.addColorStop(1,'#00f5ff');
ctx.fillStyle=i===data.length-1?'#ffffff':gr;ctx.shadowColor='#ff2ee6';ctx.shadowBlur=i===data.length-1?0:10;
ctx.beginPath();ctx.roundRect(x,y,bw-12,h,6);ctx.fill();ctx.shadowBlur=0;
ctx.fillStyle='#94a3b8';ctx.font='10px Tahoma';ctx.textAlign='center';ctx.fillText(d.label,x+(bw-12)/2,H-5);
ctx.fillStyle='#fff';if(h>16)ctx.fillText(d.v+'',x+(bw-12)/2,y+12);
});
}
function drawLine(cv,data){
const {ctx,W,H}=setupCanvas(cv);ctx.clearRect(0,0,W,H);
ctx.strokeStyle='rgba(255,255,255,.12)';for(let g=0;g<=4;g++){const y=10+(H-30)*g/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
const pts=data.map((d,i)=>({x:8+(W-16)*i/(data.length-1),y:10+(H-30)*(1-d.v/100)}));
const gr=ctx.createLinearGradient(0,0,W,0);gr.addColorStop(0,'#7c3aed');gr.addColorStop(.5,'#ff2ee6');gr.addColorStop(1,'#00f5ff');
ctx.strokeStyle=gr;ctx.lineWidth=2.5;ctx.shadowColor='#ff2ee6';ctx.shadowBlur=8;ctx.beginPath();
pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.shadowBlur=0;
}
function drawHabits(cv){
const {ctx,W,H}=setupCanvas(cv);ctx.clearRect(0,0,W,H);
const rows=store.habits.slice(0,6);if(!rows.length){ctx.fillStyle='#94a3b8';ctx.font='12px Tahoma';ctx.textAlign='center';ctx.fillText('عادتی ثبت نشده',W/2,H/2);return;}
rows.forEach((h,i)=>{
const p=Math.min(100,Math.round(h.val/h.target*100));const y=14+i*((H-20)/rows.length);
ctx.fillStyle='#e2e8f0';ctx.font='11px Tahoma';ctx.textAlign='right';ctx.fillText(h.icon+' '+h.name,W-4,y+11);
const bx=4,bw=W-130;ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.roundRect(bx,y,bw,12,6);ctx.fill();
const gr=ctx.createLinearGradient(bx,0,bx+bw,0);gr.addColorStop(0,'#00f5ff');gr.addColorStop(1,'#ff2ee6');
ctx.fillStyle=gr;ctx.beginPath();ctx.roundRect(bx,y,bw*p/100,12,6);ctx.fill();
});
}

// --- tabs, filters, import/export, pwa ---
function switchTab(name){$$('.bottomnav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));$$('.tab').forEach(t=>t.classList.toggle('active',t.id==='tab-'+name));if(name==='stats')setTimeout(renderStats,50);window.scrollTo({top:0,behavior:'smooth'});}
$$('.bottomnav button').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
$$('.filters button').forEach(b=>b.onclick=()=>{$$('.filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.filter;renderTasks();});
function exportData(){const b=new Blob([JSON.stringify(store)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='neo-planner-backup.json';a.click();toast('خروجی گرفته شد');}
$('#importFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{store=JSON.parse(r.result);save();renderAll();toast('وارد شد ✅');}catch(_){toast('فایل نامعتبر است');}};r.readAsText(f);});
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden');});
$('#installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;$('#installBtn').classList.add('hidden');}else toast('از منوی مرورگر Add to Home Screen را بزن');};
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});}
load();renderAll();