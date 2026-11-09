const menu=document.querySelector('.menu');const links=document.querySelector('.navlinks');if(menu&&links){menu.addEventListener('click',()=>links.classList.toggle('open'));links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')))}

/* Private 620 traffic collection: no visible counter, cookies, IPs or form data. */
(()=>{try{
if(!['620fab.com','www.620fab.com'].includes(location.hostname)||navigator.doNotTrack==='1'||navigator.globalPrivacyControl)return;
if(/bot|crawler|spider|headless/i.test(navigator.userAgent))return;
const now=Date.now(),params=new URLSearchParams(location.search);
const clean=v=>(v||'').replace(/[^a-zA-Z0-9 _.-]/g,'').slice(0,100);
let session;try{session=JSON.parse(sessionStorage.getItem('620-visit')||'null')}catch{}
if(!session||now-session.last>1800000)session={id:crypto.randomUUID(),source:clean(params.get('utm_source')),medium:clean(params.get('utm_medium')),campaign:clean(params.get('utm_campaign'))};
session.last=now;try{sessionStorage.setItem('620-visit',JSON.stringify(session))}catch{}
let ref='';try{ref=new URL(document.referrer).hostname}catch{}
const path=location.pathname==='/'||location.pathname==='/index.html'?'/':location.pathname;
const payload={session_id:session.id,page_path:path,referrer_host:ref.slice(0,253),utm_source:session.source,utm_medium:session.medium,utm_campaign:session.campaign,is_test:params.get('analytics_test')==='1'};
fetch('https://xxkrqtjdydokkszmifpa.supabase.co/rest/v1/website_pageviews',{method:'POST',headers:{apikey:'sb_publishable_3Wvw45zmQ-J2fJ3Ot4CyJg_Mm6s8xI_', 'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{});
}catch{}})();
