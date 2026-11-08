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
  function auth(){hide();$('loginView')?.classList.remove('hidden');$('signupPanel')?.classList.add('hidden');$('loginForm')?.classList.remove('hidden');$('showSignupButton')?.classList.remove('hidden');}
  function takePending(){try{const v=sessionStorage.getItem(key);if(v)sessionStorage.removeItem(key);return v||null;}catch{return null;}}
  window.MiniStagesPublic={show,hide,takePending};
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
  async function refresh(){if(busy)return;busy=true;$('publicStatus').textContent='Actualisation des disponibilités…';$('publicCards').replaceChildren();
    try{
      if(!db)throw Error('Configuration Supabase indisponible.');
      const {data,error}=await db.rpc('ministages_public_catalogue');if(error)throw error;
      if(!Array.isArray(data))throw Error('Réponse inattendue du catalogue.');
      const groups=new Map();for(const s of data){const k=String(s.formation_id);if(!groups.has(k))groups.set(k,{name:s.formation_name,code:s.formation_code,description:s.formation_description,sessions:[]});groups.get(k).sessions.push(s);}
      $('publicStatus').textContent=data.length?'Créneaux actualisés. Les disponibilités peuvent évoluer.':'Aucun créneau publié pour le moment.';
      for(const [fid,f] of groups){const card=document.createElement('article');card.className='v77-card';card.innerHTML=`<span class="v77-code">${escapeHtml(f.code||'FORMATION')}</span><h3>${escapeHtml(f.name)}</h3><p>${escapeHtml(f.description||'Découvrez cette formation lors d’un mini-stage.')}</p>`;
        const sessions=f.sessions.filter(s=>Number(s.places_restantes)>0 && isPubliclyBookableDate(s.date));
        if(!sessions.length){card.insertAdjacentHTML('beforeend','<div class="v77-empty">Aucun créneau disponible actuellement.</div>');}
        for(const s of sessions){const row=document.createElement('div');row.className='v77-slot';const time=`${String(s.start_time||'').slice(0,5)} – ${String(s.end_time||'').slice(0,5)}`;row.innerHTML=`<div class="v77-slot-info"><strong class="v77-slot-date">${escapeHtml(dateLabel(s.date))}</strong><small class="v77-slot-details">${escapeHtml(time)} · ${Number(s.places_restantes)} place(s)</small></div>`;const btn=document.createElement('button');btn.className='btn primary small v77-slot-register';btn.type='button';btn.textContent="S'inscrire";btn.addEventListener('click',()=>{try{sessionStorage.setItem(key,String(s.session_id));}catch{}auth();});row.append(btn);card.append(row);}
        $('publicCards').append(card);
      }
    }catch(e){$('publicStatus').textContent='Impossible de charger les créneaux publics : '+(e.message||String(e))+'. Vérifiez que le script SQL V77 a été exécuté dans Supabase.';}
    finally{busy=false;}
  }
  document.addEventListener('DOMContentLoaded',()=>{$('publicLogin')?.addEventListener('click',auth);$('publicBack')?.addEventListener('click',()=>{show();refresh();});$('publicRefresh')?.addEventListener('click',refresh);refresh();});
})();
