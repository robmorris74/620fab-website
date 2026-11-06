(async()=>{
const app=await (await fetch('../app.js')).text();
const pages={};for(const file of ['cabin-1.html','cabin-2.html','index.html'])pages[file]=await(await fetch('../'+file)).text();
const results=[];
async function run(name,kind,options={}){
 let code=app.replace("const PROJECT_FORM_ENDPOINT = '';",`const PROJECT_FORM_ENDPOINT = '${options.endpoint===undefined?'https://formspree.io/f/testfixture':options.endpoint}';`).replace('const PROJECT_FORM_ENABLED = false;',`const PROJECT_FORM_ENABLED = ${options.enabled!==false};`);
 if(kind!=='fast')code=code.replace('const openedAt = Date.now();','const openedAt = Date.now() - 3000;');
 const file=options.file||'cabin-1.html';const frame=document.createElement('iframe');
 const boot=`${options.preserve?'':'sessionStorage.clear();'}${options.blockStorage?"Object.defineProperty(window,'sessionStorage',{get(){throw Error('blocked')}});":''}if(!crypto.subtle)Object.defineProperty(crypto,'subtle',{value:{digest:async(_,bytes)=>{let hash=2166136261;for(const b of bytes)hash=Math.imul(hash^b,16777619);return new Uint32Array([hash]).buffer}}});if(!crypto.randomUUID)crypto.randomUUID=()=> 'synthetic-'+Math.random();window.calls=[];window.mode='success';window.fetch=async(url,opts)=>{calls.push({url,data:Object.fromEntries(opts.body.entries())});if(mode==='network')throw Error('offline');if(mode==='pending')return new Promise(r=>window.release=()=>r({ok:true,json:async()=>({ok:true})}));if(mode==='timeout')return new Promise((r,j)=>opts.signal.addEventListener('abort',()=>j(Error('timeout'))));return {ok:mode!=='reject',json:async()=>mode==='malformed'?{}:{ok:true}}};`;
 const test=`(async()=>{const f=document.querySelector('[data-inquiry-form]'),s=f.querySelector('[data-form-status]'),b=f.querySelector('button');const fill=()=>{f.elements.name.value='Synthetic Buyer';f.elements.email.value='buyer@example.invalid';f.elements.message.value='Synthetic inquiry: viewing and delivery?';if(f.elements.project_type){f.elements.project_type.value='Container home';f.elements.project_location.value='Pittsburg, KS'}f.dispatchEvent(new Event('input',{bubbles:true}))};const send=()=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));const settle=async()=>{for(let i=0;i<20;i++)await new Promise(r=>setTimeout(r,5))};const check=(v,msg)=>{if(!v)throw Error(msg+' ['+s.textContent+'; requests='+calls.length+']')};
try{fill();const kind=${JSON.stringify(kind)};
if(kind==='disabled'){check(b.disabled,'button must be disabled');send();await settle();check(calls.length===0,'no outbound request');}
else if(kind==='cached'){send();await settle();check(calls.length===0&&s.textContent.includes('already accepted'),'reload duplicate sent');}
else if(kind==='nojs'){check(b.disabled,'no-JS enabled');}
else if(kind==='email'){f.elements.email.value='bad@';send();await settle();check(calls.length===0&&!f.elements.email.checkValidity(),'invalid email accepted');}
else if(kind==='invalid'){f.elements.name.value='   ';f.elements.email.value='bad@';send();await settle();check(calls.length===0,'invalid accepted');check(!f.checkValidity(),'native validation');}
else if(kind==='contact'){f.elements.email.value='';f.elements.phone.value='';send();await settle();check(calls.length===0,'missing contact accepted');f.elements.phone.value='abc1234567';send();await settle();check(calls.length===0,'bad phone accepted');f.elements.phone.value='(620) 555-0100';send();await settle();check(calls.length===1,'phone-only rejected');}
else if(kind==='honeypot'||kind==='fast'){if(kind==='honeypot')f.elements._gotcha.value='spam';send();await settle();check(calls.length===0,'spam sent');}
else if(kind==='pending'){mode='pending';send();send();await settle();check(calls.length===1&&b.disabled,'duplicate or unlocked pending');release();await settle();check(s.dataset.state==='success'&&!b.disabled,'pending did not finish');}
else if(kind==='duplicate'){send();await settle();check(calls.length===1,'initial request');fill();send();await settle();check(calls.length===1,'duplicate sent');check(s.textContent.includes('already accepted'),'duplicate feedback');}
else if(kind==='reject'||kind==='network'||kind==='malformed'||kind==='timeout'){mode=kind;send();await settle();check(s.dataset.state==='error','no error');check(f.elements.name.value==='Synthetic Buyer'&&!b.disabled,'data lost or locked');check(!s.textContent.includes('was accepted'),'false success');if(kind==='reject'){mode='success';send();await settle();check(calls.length===2&&s.dataset.state==='success','retry failed');check(calls[0].data.inquiry_reference===calls[1].data.inquiry_reference,'retry reference changed');}}
else if(kind==='success'){if(f.elements.cabin)f.elements.cabin.value='tampered';send();await settle();check(calls.length===1&&s.dataset.state==='success','success missing');check(f.elements.name.value==='','success not reset');const data=calls[0].data;check(data.name==='Synthetic Buyer'&&data.email==='buyer@example.invalid'&&data.message.includes('Synthetic inquiry'),'missing buyer fields');if(f.dataset.cabin){check(data.cabin==='Cabin '+f.dataset.cabin,'incorrect cabin');check(data.asking_price_usd===(f.dataset.cabin==='1'?'45000':'79000'),'incorrect price');check(data.listing_url.endsWith('cabin-'+f.dataset.cabin+'.html'),'incorrect source');}check(data.inquiry_reference,'missing reference');}
parent.postMessage({test:${JSON.stringify(name)},ok:true},'*');}catch(e){parent.postMessage({test:${JSON.stringify(name)},ok:false,error:e.message},'*')}})();`;
 if(kind==='timeout')code=code.replace('15000','25');
 const promise=new Promise(resolve=>{const handler=e=>{if(e.source===frame.contentWindow&&e.data.test===name){removeEventListener('message',handler);resolve(e.data)}};addEventListener('message',handler)});
 let html=pages[file].replace(/<script src="app.js"><\/script>/,'');
 html=html.replace('</head>','<base href="../"><meta http-equiv="Content-Security-Policy" content="connect-src \'none\'"></head>');
 frame.srcdoc=html+ '<script>'+boot+(kind==='nojs'?'':code)+test+'<'+ '/script>';document.body.append(frame);
 const result=await promise;frame.remove();results.push(result);const li=document.createElement('li');li.className=result.ok?'pass':'fail';li.textContent=(result.ok?'PASS: ':'FAIL: ')+name+(result.error?' — '+result.error:'');document.querySelector('#results').append(li);
}
await run('Approval gate blocks submission','disabled',{enabled:false});
await run('Blank endpoint blocks submission','disabled',{endpoint:''});
await run('Non-Formspree endpoint blocks submission','disabled',{endpoint:'https://example.invalid/send'});
await run('Required whitespace and invalid email rejected','invalid');
await run('Missing/bad phone rejected; phone-only accepted','contact');
await run('Honeypot blocks submission','honeypot');
await run('Instant automated fill blocked','fast');
await run('In-flight duplicate events send once','pending');
await run('Recently accepted duplicate sends once','duplicate');
await run('Accepted duplicate blocked in a new page frame','cached',{preserve:true});
await run('Duplicate protection survives unavailable storage','duplicate',{blockStorage:true});
await run('Invalid email alone is rejected','email');
await run('Without JavaScript submit stays disabled','nojs');
await run('Provider rejection preserves data and permits retry','reject');
await run('Network error retains data; no false success','network');
await run('Malformed provider response never claims success','malformed');
await run('Timeout releases form and retains data','timeout');
await run('Cabin 1 payload, identity, price and success reset','success');
await run('Cabin 2 payload, identity, price and success reset','success',{file:'cabin-2.html'});
await run('Reused Start a Project form succeeds','success',{file:'index.html'});
document.querySelector('#summary').textContent=results.filter(x=>x.ok).length+'/'+results.length+' passed. Real inbox delivery is unverified.';
})();
