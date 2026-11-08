/* V77 — catalogue public, sans accès aux dossiers des élèves. */
(() => {
  const $ = id => document.getElementById(id);
  const key = 'ministages-v77-selected-session';
  const escapeHtml = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cfg = window.MINISTAGES_CONFIG || {};
  const db = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}) : null;
  let busy = false;
  function show(){if(!$('publicView'))return;$('publicView').classList.remove('hidden');$('loginView').classList.add('hidden');$('appView').classList.add('hidden');}
  function hide(){$('publicView')?.classList.add('hidden');}
  // Uniquement un identifiant de créneau public, jamais de données personnelles.
  // Stockage persistant pour retrouver la sélection après confirmation par e-mail.
  const persistentKey='ministages-v85-pending-session';
  const ttl=48*60*60*1000;
  function validId(id){return /^[a-zA-Z0-9_-]{1,100}$/.test(String(id||''));}
  function remember(id){if(!validId(id))return;const payload=JSON.stringify({id:String(id),expires:Date.now()+ttl});try{localStorage.setItem(persistentKey,payload);sessionStorage.setItem(key,String(id));}catch{}}
  function clearPending(){try{localStorage.removeItem(persistentKey);sessionStorage.removeItem(key);}catch{}}
  function peekPending(){
    try{
      const fromUrl=new URLSearchParams(location.search).get('mini_stage_session');
      if(validId(fromUrl)){remember(fromUrl);history.replaceState(null,'',location.pathname+location.search.replace(/([?&])mini_stage_session=[^&]*&?/,'$1').replace(/[?&]$/,'')+location.hash);return fromUrl;}
      const raw=localStorage.getItem(persistentKey);if(raw){const item=JSON.parse(raw);if(validId(item.id)&&item.expires>Date.now())return item.id;clearPending();}
      const older=sessionStorage.getItem(key);if(validId(older)){remember(older);return older;}
    }catch{}
    return null;
  }
  function auth(){hide();$('loginView')?.classList.remove('hidden');$('signupPanel')?.classList.add('hidden');$('loginForm')?.classList.remove('hidden');$('showSignupButton')?.classList.remove('hidden');}
  function authForTracking(){clearPending();auth();}
  function takePending(){const v=peekPending();if(v)clearPending();return v;}
  function signupRedirectUrl(){const u=new URL(location.origin+location.pathname);const id=peekPending();if(id)u.searchParams.set('mini_stage_session',id);return u.toString();}
  window.MiniStagesPublic={show,hide,takePending,peekPending,clearPending,signupRedirectUrl};
  function dateLabel(d){const [y,m,day]=String(d).split('-').map(Number);return new Date(y,m-1,day).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'long',year:'numeric'});}
  // Date locale, sans conversion UTC : le jour J et les 6 jours suivants sont masqués.
  // Un créneau daté de J+7 reste affiché jusqu'à la fin de J.
  function isPubliclyBookableDate(value){
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').slice(0,10));
    if(!m)return false;
    const date = new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
    if(date.getFullYear()!==Number(m[1]) || date.getMonth()!==Number(m[2])-1 || date.getDate()!==Number(m[3]))return false;
    const today = new Date();
    const cutoff = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    cutoff.setDate(cutoff.getDate()+7);
    return date >= cutoff;
  }
  function isHcr(f){
    const label=String((f.code||'')+' '+(f.name||'')).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return /\bHCR\b/.test(label) || (/\bCAP\b/.test(label) && /COMMERCIALISATION.*SERVICES/.test(label) && /HOTEL|CAFE|RESTAURANT/.test(label));
  }
  async function refresh(){if(busy)return;busy=true;$('publicStatus').textContent='Actualisation des disponibilités…';$('publicCards').replaceChildren();
    try{
      if(!db)throw Error('Configuration Supabase indisponible.');
      const {data,error}=await db.rpc('ministages_public_catalogue_v82');if(error)throw error;
      if(!Array.isArray(data))throw Error('Réponse inattendue du catalogue.');
      const groups=new Map();for(const s of data){const k=String(s.formation_id);if(!groups.has(k))groups.set(k,{name:s.formation_name,code:s.formation_code,description:s.formation_description,sessions:[]});if(s.session_id)groups.get(k).sessions.push(s);}
      $('publicStatus').textContent=data.length?'Créneaux actualisés. Les disponibilités peuvent évoluer.':'Aucun créneau publié pour le moment.';
      // Conserver l'ordre existant des autres formations et placer CAP CS HCR en dernier.
      const orderedGroups=[...groups.entries()].sort((a,b)=>Number(isHcr(a[1]))-Number(isHcr(b[1])));
      for(const [fid,f] of orderedGroups){const card=document.createElement('article');card.className='v77-card'+(isHcr(f)?' v83-hcr':'');card.innerHTML=`<span class="v77-code">${escapeHtml(f.code||'FORMATION')}</span><h3>${escapeHtml(f.name)}</h3><p>${escapeHtml(f.description||'Découvrez cette formation lors d’un mini-stage.')}</p>`;
        // Afficher au plus 10 créneaux, y compris ceux fermés par délai.
        // Les créneaux complets sont écartés pour laisser apparaître les suivants.
        const sessions=f.sessions.filter(s=>Number(s.places_restantes)>0)
          .sort((a,b)=>{const af=String(a.date||'')>=new Date().toLocaleDateString('en-CA');const bf=String(b.date||'')>=new Date().toLocaleDateString('en-CA');return Number(bf)-Number(af) || (af?String(a.date||'').localeCompare(String(b.date||'')):String(b.date||'').localeCompare(String(a.date||''))) || String(a.start_time||'').localeCompare(String(b.start_time||''));})
          .slice(0,10);
        if(!sessions.length){card.insertAdjacentHTML('beforeend','<div class="v77-empty">Aucun créneau disponible actuellement.</div>');}
        for(const s of sessions){
          const row=document.createElement('div');
          const status=String(s.status??s.statut??'').toLowerCase().trim();
          const explicitlyClosed=['fermé','ferme','closed','inactive','inactif'].includes(status) || s.is_open===false || s.is_active===false;
          const closed=explicitlyClosed || !isPubliclyBookableDate(s.date);
          row.className='v77-slot'+(closed?' v77-slot-closed':'');
          const time=`${String(s.start_time||'').slice(0,5)} – ${String(s.end_time||'').slice(0,5)}`;
          row.innerHTML=`<div class="v77-slot-info"><strong class="v77-slot-date">${escapeHtml(dateLabel(s.date))}</strong><small class="v77-slot-details">${escapeHtml(time)} · ${Number(s.places_restantes)} place(s)</small></div>`;
          if(closed){
            const badge=document.createElement('span');badge.className='v77-closed-badge';badge.textContent='Fermé';row.append(badge);
          }else{
            const btn=document.createElement('button');btn.className='btn primary small v77-slot-register';btn.type='button';btn.textContent="S'inscrire";
            btn.addEventListener('click',()=>{try{remember(s.session_id);}catch{}auth();});row.append(btn);
          }
          card.append(row);
        }
        $('publicCards').append(card);
      }
    }catch(e){$('publicStatus').textContent='Impossible de charger les créneaux publics : '+(e.message||String(e))+'. Vérifiez que le script SQL V77 a été exécuté dans Supabase.';}
    finally{busy=false;}
  }
  document.addEventListener('DOMContentLoaded',()=>{$('publicLogin')?.addEventListener('click',authForTracking);$('publicBack')?.addEventListener('click',()=>{clearPending();show();refresh();});$('publicRefresh')?.addEventListener('click',refresh);refresh();});
})();
