// Page publique de signature : le jeton est dans le fragment (#), non transmis dans les journaux HTTP.
(() => {
 const match=location.hash.match(/^#signature-responsable=([A-Za-z0-9_-]{32,160})$/);
 if(!match)return;
 window.MINISTAGES_GUEST_SIGNATURE=true;
 const token=match[1];
 const cfg=window.MINISTAGES_CONFIG||{};
 const endpoint=(cfg.SUPABASE_URL||'').replace(/\/$/,'')+'/functions/v1/send-guardian-signature-request';
 const apiKey=cfg.SUPABASE_ANON_KEY;
 document.body.innerHTML=`<main style="max-width:720px;margin:35px auto;padding:28px;font-family:system-ui,sans-serif;line-height:1.55"><h1>EREA de Muret — Signature de convention</h1><section id="guestContent" aria-live="polite">Chargement de votre convention…</section></main>`;
 const root=document.getElementById('guestContent');
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function request(action,extra={}){
  if(!cfg.SUPABASE_URL||!apiKey)throw Error('Application non configurée.');
  const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','apikey':apiKey},body:JSON.stringify({action,token,...extra})});
  const json=await res.json().catch(()=>({}));if(!res.ok||!json.success)throw Error(json.error||'Service indisponible');return json;
 }
 request('view').then(({convention:c})=>{
  root.innerHTML=`<p>Veuillez vérifier les informations suivantes avant de signer la convention de mini-stage.</p><dl><dt><strong>Élève</strong></dt><dd>${escape(c.student)}</dd><dt><strong>Établissement d'origine</strong></dt><dd>${escape(c.school)}</dd><dt><strong>Formation</strong></dt><dd>${escape(c.formation)}</dd><dt><strong>Date</strong></dt><dd>${escape(c.date)}</dd><dt><strong>Horaires</strong></dt><dd>${escape(c.hours)}</dd><dt><strong>Lieu</strong></dt><dd>${escape(c.location)}</dd></dl><p><strong>Convention n° ${escape(c.version)}</strong> — cette signature vaut accord pour la convention correspondante. Pour obtenir le document complet avant signature, contactez l'EREA de Muret.</p><label style="display:block;margin:15px 0"><input id="guestConsent" type="checkbox"> J'ai pris connaissance des informations et j'accepte de signer la convention de mini-stage.</label><p>Tracez votre signature :</p><canvas id="guestCanvas" width="600" height="200" style="width:100%;height:auto;border:1px solid #aab;border-radius:8px;touch-action:none;background:white" aria-label="Signature manuscrite"></canvas><p><button id="guestClear" type="button">Effacer</button> <button id="guestSubmit" type="button">Valider ma signature</button></p><p id="guestMessage" role="status"></p>`;
  const canvas=document.getElementById('guestCanvas'),ctx=canvas.getContext('2d');ctx.strokeStyle='#132d40';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';let drawing=false,dirty=false;
  const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;dirty=true;const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.01,p.y+.01);ctx.stroke()});
  canvas.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke()});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,()=>drawing=false);
  document.getElementById('guestClear').onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);dirty=false};
  document.getElementById('guestSubmit').onclick=async()=>{const b=document.getElementById('guestSubmit'),msg=document.getElementById('guestMessage');if(!document.getElementById('guestConsent').checked||!dirty){msg.textContent='Veuillez accepter la convention et tracer votre signature.';return}b.disabled=true;msg.textContent='Enregistrement sécurisé…';try{await request('sign',{signature:canvas.toDataURL('image/png')});history.replaceState(null,'',location.pathname+location.search);root.innerHTML='<h2>Signature enregistrée</h2><p>Merci. Votre signature est enregistrée et transmise au dossier MiniStages EREA. L’établissement d’origine peut poursuivre le circuit de signature.</p>'}catch(e){msg.textContent=e.message;b.disabled=false}};
 }).catch(e=>{root.innerHTML=`<p role="alert">${escape(e.message)}</p><p>Demandez un nouveau lien à l’établissement si celui-ci a expiré ou a déjà été utilisé.</p>`});
})();
