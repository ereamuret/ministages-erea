/* MiniStages EREA — version de démarrage. Mode démonstration ou backend Supabase gratuit. */
(() => {
  if (window.MINISTAGES_GUEST_SIGNATURE) return;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const cfg = window.MINISTAGES_CONFIG || {};
  const configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const db = configured ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const state = { demo:false, user:null, profile:null, page:'dashboard', data:{formations:[],sessions:[],applications:[],users:[],teachers:[],convention_signatures:[]}, filters:{q:'',status:'all'}, loading:false, occupancy:{} };
  const demoStoreKey='ministages-erea-demo-v2';
  const themeStoreKey='ministages-erea-theme';
  function applyTheme(theme){const selected=theme==='dark'?'dark':'light';document.documentElement.dataset.theme=selected;try{localStorage.setItem(themeStoreKey,selected)}catch{}}
  try{applyTheme(localStorage.getItem(themeStoreKey)||'dark')}catch{applyTheme('dark')}
  const branding={logo:null,hostSignature:null};
  const mailDemo={enabled:false,email:''};
  const today = new Date(); today.setHours(0,0,0,0);
  const iso = d => {const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
  const plusDays = n => {const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
  const seed = () => ({
    formations:[
      {id:'f1',name:'CAP Production et service en restaurations',code:'CAP PSR',description:'Découvrir les métiers de la restauration collective et du service.',active:true},
      {id:'f2',name:'CAPa Jardinier paysagiste',code:'CAPa JP',description:'Découvrir les activités d’aménagement et d’entretien des espaces verts.',active:true},
      {id:'f3',name:'CAPa Métiers de l’agriculture — horticulture',code:'CAPa MAH',description:'Découvrir les cultures, la serre et les activités horticoles.',active:true},
      {id:'f4',name:'CAP Commercialisation et services en hôtel-café-restaurant',code:'CAP CSHCR',description:'Découvrir les métiers du service en salle.',active:true}
    ],
    sessions:[
      {id:'s1',formation_id:'f1',date:plusDays(8),start_time:'09:00',end_time:'15:30',capacity:1,teacher_name:'Mme Sophie Durand',location:'EREA de Muret — atelier restauration',active:true,notes:'Prévoir une tenue adaptée.'},
      {id:'s2',formation_id:'f2',date:plusDays(12),start_time:'09:00',end_time:'16:00',capacity:2,teacher_name:'M. Julien Morel',location:'EREA de Muret — atelier espaces verts',active:true,notes:'Chaussures fermées recommandées.'},
      {id:'s3',formation_id:'f3',date:plusDays(17),start_time:'09:00',end_time:'15:30',capacity:1,teacher_name:'Mme Sophie Durand',location:'EREA de Muret — serre pédagogique',active:true,notes:''},
      {id:'s4',formation_id:'f4',date:plusDays(22),start_time:'09:00',end_time:'15:30',capacity:2,teacher_name:'M. Julien Morel',location:'EREA de Muret — restaurant pédagogique',active:true,notes:''},
      {id:'s5',formation_id:'f1',date:plusDays(29),start_time:'09:00',end_time:'15:30',capacity:1,teacher_name:'Mme Sophie Durand',location:'EREA de Muret — atelier restauration',active:true,notes:''}
    ],
    applications:[
      {id:'a1',student_first_name:'Lina',student_last_name:'Martin',student_birth_date:'2011-04-14',student_class:'3e',college_name:'Collège Louisa Paulin',college_city:'Muret',contact_name:'Mme Martin',contact_email:'famille.martin@example.fr',contact_phone:'06 12 34 56 78',formation_id:'f1',session_id:'s1',status:'pending',stage_status:'',stage_report:{},created_at:new Date().toISOString(),notes:'Souhaite découvrir la restauration collective.'},
      {id:'a2',student_first_name:'Yanis',student_last_name:'Bernard',student_birth_date:'2011-02-03',student_class:'3e',college_name:'Collège de Cazères',college_city:'Cazères',contact_name:'M. Bernard',contact_email:'parent.bernard@example.fr',contact_phone:'06 23 45 67 89',formation_id:'f2',session_id:'s2',status:'confirmed',stage_status:'',stage_report:{},created_at:new Date(Date.now()-86400000*2).toISOString(),notes:''},
      {id:'a3',student_first_name:'Inès',student_last_name:'Garcia',student_birth_date:'2010-11-22',student_class:'3e prépa-métiers',college_name:'Collège Bétance',college_city:'Muret',contact_name:'Mme Garcia',contact_email:'parent.garcia@example.fr',contact_phone:'06 34 56 78 90',formation_id:'f3',session_id:'s3',status:'pending',stage_status:'',stage_report:{},created_at:new Date(Date.now()-86400000).toISOString(),notes:''},
      {id:'a4',student_first_name:'Adam',student_last_name:'Petit',student_birth_date:'2011-07-09',student_class:'4e',college_name:'Collège Pierre et Marie Curie',college_city:'Le Fousseret',contact_name:'Mme Petit',contact_email:'parent.petit@example.fr',contact_phone:'06 45 67 89 01',formation_id:'f4',session_id:'s4',status:'refused',stage_status:'',stage_report:{},created_at:new Date(Date.now()-86400000*4).toISOString(),notes:''}
    ],
    teachers:[{id:'t1',full_name:'Mme Sophie Durand',active:true},{id:'t2',full_name:'M. Julien Morel',active:true}],
    users:[{id:'u1',full_name:'Administrateur EREA',email:'admin@erea-demo.fr',role:'admin',organization:'EREA de Muret',active:true},{id:'u2',full_name:'Collège Louisa Paulin',email:'secretariat.louisa@example.fr',role:'college',organization:'Collège Louisa Paulin',active:true},]
  });
  function loadDemo(){try{const raw=localStorage.getItem(demoStoreKey);state.data=raw?JSON.parse(raw):seed();}catch{state.data=seed()}if(!Array.isArray(state.data.teachers))state.data.teachers=seed().teachers;saveDemo()}
  function saveDemo(){if(state.demo){try{localStorage.setItem(demoStoreKey,JSON.stringify(state.data))}catch{}}}
  const esc=window.MiniStagesUtils.esc;
  const dateLabel=window.MiniStagesUtils.dateLabel;
  const shortDate=window.MiniStagesUtils.shortDate;
  const initials=window.MiniStagesUtils.initials;
  function formation(id){return state.data.formations.find(x=>x.id===id)||{name:'Formation supprimée',code:'—'}}
  const ageAtStage=window.MiniStagesUtils.ageAtStage;
  const shortTime=window.MiniStagesUtils.shortTime;
  const originFormationColor=window.MiniStagesUtils.originFormationColor;
  function session(id){return state.data.sessions.find(x=>x.id===id)||{date:'',start_time:'',end_time:'',location:'Créneau supprimé'}}
  const roleLabel=window.MiniStagesUtils.roleLabel;
  const statusLabel=window.MiniStagesUtils.statusLabel;
  const statusClass=window.MiniStagesUtils.statusClass;
  function toast(message,error=false){const el=$('#toast');if(!el)return;el.textContent=message;el.className='toast show'+(error?' error':'');el.setAttribute('role',error?'alert':'status');el.setAttribute('aria-live',error?'assertive':'polite');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.className='toast',error?8500:3500)}
  function setNotice(msg){const n=$('#loginNotice');n.textContent=msg;n.classList.remove('hidden')}
  function showLogin(){ if(window.MiniStagesPublic?.show){window.MiniStagesPublic.show();return;} $('#loginView').classList.remove('hidden');$('#appView').classList.add('hidden');$('#appView').setAttribute('aria-hidden','true'); }
  // V14 : disposition V10 uniquement pour les rôles lingerie et établissement.
  function syncRoleNavigationLayout(){
    const role=String(state.profile?.role||'').trim().toLowerCase();
    const vertical=role==='lingerie'||role==='college';
    const app=$('#appView'),sidebar=$('#sidebar'),workspace=app?.querySelector('.workspace'),topbar=app?.querySelector('.topbar');
    if(!app||!sidebar||!workspace||!topbar)return;
    app.classList.toggle('role-sidebar-layout',vertical);
    app.classList.toggle('role-horizontal-layout',!vertical);
    if(vertical){
      if(sidebar.parentElement!==app)app.insertBefore(sidebar,workspace);
    }else{
      if(sidebar.parentElement!==topbar)topbar.insertBefore(sidebar,topbar.firstChild);
    }
  }
  function showApp(){ window.MiniStagesPublic?.hide(); if(state.profile?.role==='lingerie'&&!['lingerie','appearance'].includes(state.page))state.page='lingerie';if(state.profile?.role==='college'&&!['applications','formations','appearance'].includes(state.page))state.page='applications'; $('#loginView').classList.add('hidden');$('#appView').classList.remove('hidden');$('#appView').removeAttribute('aria-hidden');$('#appView').classList.toggle('role-college',state.profile?.role==='college');$('#modePill').textContent=state.demo?'MODE DÉMO':'CONNECTÉ';$('#modePill').classList.toggle('live',!state.demo);$('#userName').textContent=state.profile?.full_name||state.user?.email||'Utilisateur';$('#userRole').textContent=roleLabel(state.profile?.role);const isEstablishment=String(state.profile?.role||'').trim().toLowerCase()==='college';const establishmentName=String(state.profile?.organization||state.profile?.full_name||state.user?.user_metadata?.organization||'Établissement').trim();$('#userAvatar').textContent=isEstablishment?establishmentName:initials(state.profile?.full_name||state.user?.email||'MS');$('#userAvatar').title=isEstablishment?establishmentName:'';$('#userAvatar').classList.toggle('establishment-name-avatar',isEstablishment);$$('[data-admin="true"]').forEach(el=>el.classList.toggle('hidden',state.profile?.role!=='admin'));$$('.nav-item[data-page="sessions"]').forEach(el=>el.classList.toggle('hidden',state.profile?.role==='college'));$('#sidebar').classList.toggle('sidebar-lingerie',state.profile?.role==='lingerie');$$('#mainNav .nav-item').forEach(el=>{const role=state.profile?.role;el.classList.toggle('hidden',role==='lingerie'||(role==='college'&&!['applications','formations','appearance'].includes(el.dataset.page)))});let lingerieNav=$('#lingerieNav');if(!lingerieNav){lingerieNav=document.createElement('button');lingerieNav.id='lingerieNav';lingerieNav.className='nav-item';lingerieNav.dataset.page='lingerie';lingerieNav.innerHTML='<span><svg aria-hidden="true" class="ui-svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M8 3 5 6 2 9l4 4 2-2v10h8V11l2 2 4-4-3-3-3-3-4 3z"/></svg></span> Lingerie';$('#mainNav').appendChild(lingerieNav);lingerieNav.addEventListener('click',()=>setPage('lingerie'))}lingerieNav.classList.toggle('hidden',!['lingerie','admin'].includes(state.profile?.role));const appearanceNav=$('#appearanceNav');if(appearanceNav)appearanceNav.classList.toggle('hidden',!['college','lingerie'].includes(state.profile?.role));const roleVertical=$('#roleVerticalLabel');if(roleVertical){roleVertical.textContent=state.profile?.role==='college'?'ETABLISSEMENT':state.profile?.role==='lingerie'?'LINGERIE':'';roleVertical.classList.toggle('hidden',!['college','lingerie'].includes(state.profile?.role));}$('#sidebar').classList.toggle('sidebar-college',String(state.profile?.role||'').trim().toLowerCase()==='college');const appsNav=$('#mainNav .nav-item[data-page="applications"]');if(appsNav){const textNode=Array.from(appsNav.childNodes).find(n=>n.nodeType===3&&/Inscription/.test(n.textContent));if(textNode)textNode.textContent=state.profile?.role==='college'?' Inscription ':' Inscriptions ';}syncRoleNavigationLayout();$('#footerYear').textContent=new Date().getFullYear();$('#helpButton')?.classList.toggle('hidden',String(state.profile?.role||'').trim().toLowerCase()!=='college');renderPage();openSignatureFromLink();const pending=state.profile?.role==='college'?window.MiniStagesPublic?.takePending?.():null;if(pending){state.page='applications';renderPage();loadSessionOccupancy().then(()=>{const selected=state.data.sessions.find(x=>String(x.id)===String(pending));if(!selected||!sessionBookable(selected)){toast('Le créneau choisi n’est plus disponible. Sélectionnez une autre date dans Formations.',true);return;}openApplicationForm(null,selected.id);}).catch(e=>toast(e.message,true));} }
  // V50 : une lecture peut être relancée une seule fois en cas de coupure réseau
  // temporaire. Ne jamais relancer automatiquement une écriture ou une action métier.
  function isTemporaryReadFailure(error){
    const status=Number(error?.status||error?.code);
    const message=String(error?.message||'').toLowerCase();
    if([400,401,403,404,409,422].includes(status))return false;
    return [408,429,500,502,503,504].includes(status)
      || /failed to fetch|networkerror|network request failed|fetch failed|timeout|timed out|connexion interrompue/.test(message);
  }
  async function fetchTable(table,order='created_at',ownerFilter=null){
    for(let attempt=0;attempt<2;attempt++){
      try{
        let request=db.from(table).select('*');if(ownerFilter)request=request.eq(ownerFilter.column,ownerFilter.value);const {data,error}=await request.order(order,{ascending:false});
        if(error)throw error;
        if(!Array.isArray(data))throw new Error('Réponse de lecture inattendue pour '+table);
        return data;
      }catch(error){
        if(attempt===1||!isTemporaryReadFailure(error))throw new Error('Chargement '+table+' impossible : '+(error?.message||String(error)),{cause:error});
        await new Promise(resolve=>setTimeout(resolve,350));
      }
    }
  }
  // Compteur global fourni par Supabase, sans exposer les dossiers des autres établissements.
  // Mutualiser les lectures simultanées sans conserver de cache de disponibilités.
  // Chaque nouvelle action après la fin de la requête relit Supabase.
  let occupancyRequest=null;
  async function loadSessionOccupancy(){
    if(state.demo || !db)return;
    if(occupancyRequest)return occupancyRequest;
    occupancyRequest=(async()=>{
      const {data,error}=await db.rpc('ministages_session_occupancy');
      if(error)throw new Error('Disponibilités indisponibles : installez la migration SQL des places. '+error.message);
      if(!Array.isArray(data))throw new Error('Réponse de disponibilités invalide. Réessayez.');
      const next={};
      for(const row of data){
        if(!row||!row.session_id)throw new Error('Identifiant de créneau manquant dans les disponibilités.');
        const count=Number(row.reserved_count);
        if(!Number.isSafeInteger(count)||count<0)throw new Error('Nombre de réservations invalide pour un créneau.');
        next[row.session_id]=count;
      }
      state.occupancy=next;
    })();
    try{return await occupancyRequest}finally{occupancyRequest=null}
  }
  async function loadLiveData(){if(state.profile?.role==='lingerie'){const {data,error}=await db.rpc('get_lingerie_inscriptions');if(error)throw error;state.lingerieRows=data||[];state.data={formations:[],sessions:[],applications:[],users:[],teachers:[],convention_signatures:[]};return;}const isCollege=String(state.profile?.role||'').trim().toLowerCase()==='college';
  if(isCollege&&!state.user?.id)throw new Error('Session établissement invalide. Reconnectez-vous.');
  const applicationOwner=isCollege?{column:'created_by',value:state.user.id}:null;
  const profileOwner=isCollege?{column:'id',value:state.user.id}:null;
  const [formations,sessions,applications,users]=await Promise.all([
    fetchTable('formations','name'),fetchTable('sessions','date'),
    fetchTable('applications','created_at',applicationOwner),
    fetchTable('profiles','full_name',profileOwner)
  ]);
  let convention_signatures=[];
  const ids=applications.map(a=>a.id).filter(Boolean);
  const sigResult=isCollege
    ?(ids.length?await db.from('convention_signatures').select('*').in('application_id',ids):{data:[],error:null})
    :await db.from('convention_signatures').select('*');if(!sigResult.error)convention_signatures=sigResult.data||[];else {console.error('Suivi des signatures indisponible',sigResult.error);throw new Error('Impossible de charger les signatures : '+sigResult.error.message);}let teachers=[];if(canAdmin()){const teacherResult=await db.from('teacher_directory').select('*').order('full_name',{ascending:true});if(teacherResult.error)throw new Error('Répertoire des professeurs indisponible : exécutez MIGRATION_REPERTOIRE_PROFESSEURS.sql. '+teacherResult.error.message);teachers=teacherResult.data||[]}await Promise.all([loadSessionOccupancy(),loadBranding()]);if(state.profile?.role==='admin')await loadMailDemo();state.data={formations,sessions,applications,users:users.map(u=>({...u,active:u.active!==false,organization:u.organization||''})),teachers,convention_signatures}}
  async function login(email,password){if(!db){setNotice('Le service en ligne n’est pas configuré. Utilisez la démonstration ou configurez Supabase (voir README).');return}const {data,error}=await db.auth.signInWithPassword({email,password});if(error){setNotice('Connexion impossible : '+error.message);return}state.user=data.user;const {data:profile,error:pe}=await db.from('profiles').select('*').eq('id',data.user.id).single();if(pe||!profile){await db.auth.signOut();setNotice('Votre compte existe mais son profil n’est pas configuré. Demandez à l’administrateur de finaliser votre accès.');return}state.profile=profile;state.demo=false;if(!window.MiniStagesPublic?.peekPending?.()&&profile.role==='college')state.page='applications';try{await loadLiveData();showApp();openOriginFromEmail()}catch(e){setNotice('Impossible de charger les données : '+e.message)}}
  function enterDemo(){state.demo=true;state.user={email:'admin@erea-demo.fr'};loadDemo();state.profile=state.data.users[0];state.page='dashboard';showApp();toast('Démonstration activée : données fictives, sur cet appareil uniquement.')}
  async function logout(){if(db&&!state.demo)await db.auth.signOut();state.user=null;state.profile=null;state.demo=false;showLogin()}
  function canAdmin(){return state.profile?.role==='admin'}
  function canManage(){return canAdmin()}
  function openHelpForm(){
    if(String(state.profile?.role||'').trim().toLowerCase()!=='college')return;
    const org=state.profile?.organization||state.profile?.full_name||state.user?.user_metadata?.organization||'';
    const email=state.profile?.email||state.user?.email||'';
    openModal('Demande d’aide',`<form id="helpRequestForm" class="stack">
      <label>Établissement<input name="organization" value="${esc(org)}" required maxlength="180"></label>
      <label>Votre adresse e-mail<input name="email" type="email" value="${esc(email)}" required maxlength="250"></label>
      <label>Objet<input name="subject" required maxlength="180" placeholder="Objet de votre demande"></label>
      <label>Votre message<textarea name="message" required minlength="10" maxlength="5000" rows="6" placeholder="Décrivez votre difficulté…"></textarea></label>
      <p class="tiny muted">Votre demande sera transmise à ddfpt@ereamuret.com.</p>
    </form>`,`<button type="button" class="btn secondary" data-action="close-modal">Annuler</button><button type="button" class="btn primary" data-action="send-help-request">Envoyer la demande</button>`);
  }
  async function sendHelpRequest(button){
    const form=$('#helpRequestForm');if(!form||!form.reportValidity())return;
    if(state.demo||!db)throw new Error('Envoi indisponible en mode démonstration.');
    const payload=Object.fromEntries(new FormData(form));
    button.disabled=true;button.textContent='Envoi en cours…';
    try{
      const {data,error}=await db.functions.invoke('send-help-request',{body:payload});
      if(error)throw new Error('Service d’aide indisponible. Vérifiez le déploiement de la fonction Supabase send-help-request et ses secrets d’envoi. Détail : '+(error.message||String(error)));
      if(!data?.ok)throw new Error(data?.error||'Échec de l’envoi.');
      closeModal();toast('Votre demande a bien été envoyée.');
    }finally{button.disabled=false;button.textContent='Envoyer la demande'}
  }
  // V45 : une seule actualisation après une courte pause de saisie.
  let reservationSearchTimer=null;
  function scheduleReservationSearch(input,filterKey){
    const value=input.value, caret=input.selectionStart, page=state.page;
    state.filters[filterKey]=value;
    clearTimeout(reservationSearchTimer);
    reservationSearchTimer=setTimeout(()=>{
      reservationSearchTimer=null;
      if(state.page!==page)return;
      renderPage();
      const next=$(filterKey==='originQ'?'#originReservationSearch':'#appSearch');
      if(next){next.focus();try{next.setSelectionRange(caret,caret)}catch(_){}}
    },180);
  }
  function setPage(page){if(page==='lingerie'&&canAdmin()){state.lingerieLoadError='';state.lingerieRows=[];if(state.demo){state.lingerieLoadError='Les inscriptions Lingerie ne sont pas disponibles en mode démonstration.';}else{db.rpc('get_lingerie_inscriptions').then(({data,error})=>{state.lingerieLoadError=error?.message||'';state.lingerieRows=error?[]:(data||[]);if(state.page==='lingerie')renderPage()}).catch(e=>{state.lingerieLoadError=e.message;state.lingerieRows=[];if(state.page==='lingerie')renderPage()});}}clearTimeout(reservationSearchTimer);reservationSearchTimer=null;if(state.profile?.role==='lingerie'&&!['lingerie','appearance'].includes(page))page='lingerie';if(state.profile?.role==='college'&&!['applications','formations','appearance'].includes(page))page='applications';state.page=page;$('#sidebar').classList.remove('open');renderPage();$$('.nav-item[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page))}
  function heading(){return ({dashboard:'Tableau de bord',applications:'Inscriptions',sessions:'Créneaux & calendrier',formations:'Formations',organisation:'Organisation',users:'Utilisateurs',settings:'Paramètres',appearance:'Paramètres',lingerie:'Inscription'})[state.page]||'MiniStages'}
  function renderPage(){if(!state.profile)return;const headerSearch=document.querySelector('.ref-global-search');if(headerSearch)headerSearch.classList.toggle('hidden',state.profile.role==='college');if(state.profile.role==='lingerie'&&!['lingerie','appearance'].includes(state.page))state.page='lingerie';$('#pageHeading').textContent=heading();$('#breadcrumbCurrent').textContent=heading();$('#pendingBadge').textContent=state.data.applications.filter(a=>a.status==='pending').length;const root=$('#pageContent');root.classList.toggle('lingerie-admin-view',state.page==='lingerie'&&state.profile?.role==='admin');root.innerHTML=({dashboard:dashboardPage,applications:state.profile?.role==='college'?userDashboardPage:applicationsPage,sessions:sessionsPage,formations:formationsPage,organisation:organisationPage,users:usersPage,settings:settingsPage,appearance:appearancePage,lingerie:lingeriePage}[state.page]||dashboardPage)();bindPageEvents();if(state.page==='lingerie')$('#lingerieFilter')?.addEventListener('change',e=>{state.lingerieFilter=e.target.value;renderPage()});if(state.page==='lingerie'){const update=()=>{const count=$('#lingerieSelectedCount');if(count)count.textContent=selectedLingerieRows().length+' sélectionné(s)';const btn=$('[data-action=download-lingerie-labels]');if(btn)btn.disabled=!selectedLingerieRows().length;const all=$('#lingerieSelectAll'),checks=$$('.lingerie-select');if(all){all.checked=checks.length>0&&checks.every(c=>c.checked);all.indeterminate=checks.some(c=>c.checked)&&!all.checked}};$$('.lingerie-select').forEach(c=>c.addEventListener('change',()=>{if(c.checked)lingerieSelected.add(c.dataset.id);else lingerieSelected.delete(c.dataset.id);update()}));$('#lingerieSelectAll')?.addEventListener('change',e=>{$$('.lingerie-select').forEach(c=>{c.checked=e.target.checked;if(c.checked)lingerieSelected.add(c.dataset.id);else lingerieSelected.delete(c.dataset.id)});update()});update()}}
  function guardianEligible(a){return !state.demo&&!!state.user?.email&&!!a.contact_email&&state.user.email.trim().toLowerCase()===a.contact_email.trim().toLowerCase()}
  function guardianSignButton(a){if(signatureFor(a,'guardian')||!['confirmed','completed'].includes(a.status))return '';return guardianEligible(a)?`<button class="btn primary small" data-action="sign-guardian" data-id="${a.id}">✍ Signer la convention</button>`:''}
  function signatureFor(a,kind){return (state.data.convention_signatures||[]).find(x=>x.application_id===a.id&&x.signer_role===kind&&x.convention_version===(a.convention_version||1)&&x.status==='signed')}
  function stageValidationLabel(a){return ['confirmed','completed'].includes(a.status)?'Stage validé':a.status==='pending'?'En attente de validation':statusLabel(a.status)}
  function signatureState(a,kind,label){const sig=signatureFor(a,kind);return `<span class="status ${sig?'confirmed':'pending'}">${sig?esc(label)+' signé':'En attente de signature '+esc(label)}</span>`}
  function originStageStatus(a){
    if(a.status==='pending')return {label:'En attente de validation',kind:'pending'};
    if(a.status==='refused'||a.status==='cancelled')return {label:statusLabel(a.status),kind:'refused'};
    if(conventionIsFinal(a))return {label:'Convention finalisée',kind:'confirmed'};
    if(!signatureFor(a,'guardian'))return {label:'Stage validé — en attente signature responsable',kind:'pending'};
    if(!signatureFor(a,'origin'))return {label:'En attente signature établissement d’origine',kind:'pending'};
    return {label:'Signatures effectuées — en attente de finalisation',kind:'pending'};
  }
  function userDashboardPage(){
    const isOrigin=state.profile?.role==='college';
    const apps=state.data.applications.filter(a=>state.demo||(isOrigin?a.created_by===state.user?.id:(a.created_by===state.user?.id||guardianEligible(a)))).sort((a,b)=>String(session(a.session_id).date||'').localeCompare(String(session(b.session_id).date||'')));
    const originTerms=normalizeSearch(state.filters.originQ||'').split(/\s+/).filter(Boolean);const visibleApps=apps.filter(a=>originTerms.every(term=>normalizeSearch([a.student_first_name,a.student_last_name,formation(a.formation_id).name,session(a.session_id).date,statusLabel(a.status),a.college_name].join(' ')).includes(term)));const rows=visibleApps.map(a=>{
      const ss=session(a.session_id),stage=originStageStatus(a),finalized=conventionIsFinal(a);
      const canSign=isOrigin&&originEligible(a)&&!!signatureFor(a,'guardian')&&!signatureFor(a,'origin')&&!finalized;
      const reportReady=a.stage_status==='done'&&!!a.stage_report?.validated_at&&!!a.stage_report?.pdf_base64;
      const reportStatus=reportReady?`<button class="btn outline small" data-action="download-stage-pdf" data-id="${esc(a.id)}">⬇ Télécharger PDF</button>`:a.stage_status==='done'?'<span class="status pending">En attente de validation</span>':'<span class="status pending">Non disponible</span>';
      const conventionStatus=finalized?`<div class="origin-convention-final"><button class="btn primary small" data-action="download-final-convention" data-id="${esc(a.id)}">⬇ Télécharger PDF</button></div>`:'<span class="status pending">En attente de validation</span>';
      return `<tr><td><strong>${esc(a.student_first_name)} ${esc(a.student_last_name)}</strong><div class="cell-sub">${esc(a.student_class||'')}</div></td><td>${esc(formation(a.formation_id).name)}</td><td>${shortDate(ss.date)}<div class="cell-sub">${shortTime(ss.start_time)} – ${shortTime(ss.end_time)}</div></td><td>${workflowIndicator(a,'guardian')}</td><td>${canSign?`<button class="btn primary small" data-action="sign-origin" data-id="${esc(a.id)}">✍ Signer</button>`:workflowIndicator(a,'origin')}</td><td>${conventionStatus}</td><td><span class="status ${stage.kind}">${esc(stage.label)}</span>${a.stage_status==='absent'?`<div class="origin-stage-absence"><span class="status refused">Élève absent</span></div>`:''}</td><td>${reportStatus}</td><td><button class="btn outline small" data-action="reservation-detail" data-id="${esc(a.id)}">Détails</button></td></tr>`;
    }).join('');
    return `<div class="welcome-row"><div><h2>${isOrigin?'Inscriptions de mon établissement':'Mes demandes de mini-stage'}</h2><p>Suivez les signatures, le statut du stage et téléchargez les documents validés par l’EREA.</p><div class="notice-blue"><strong>Conditions d’inscription :</strong> chaque élève ne peut bénéficier que d’un seul mini-stage, dans une seule formation. Toute demande doit être déposée au minimum 7 jours calendaires avant la date du créneau choisi. Une demande annulée ou refusée ne bloque pas une nouvelle inscription.</div></div><div class="page-actions"><label class="origin-search-label"><span>Rechercher</span><input id="originReservationSearch" type="search" value="${esc(state.filters.originQ||'')}" placeholder="Élève, formation, date…"></label><button class="btn outline" data-action="refresh-signatures"><span class="refresh-arrow">↻</span> Actualiser</button><button class="btn primary" data-action="new-application">＋ Nouvelle inscription</button></div></div><section class="panel data-panel origin-reservations-table"><div class="table-wrap"><table><thead><tr><th>Élève</th><th>Formation</th><th>Date / horaires</th><th>Signature responsable</th><th>Signature établissement</th><th>Convention</th><th>Statut</th><th>Compte rendu</th><th>Actions</th></tr></thead><tbody>${rows||'<tr><td colspan="9"><div class="empty">Aucune demande enregistrée pour ce compte.</div></td></tr>'}</tbody></table></div></section>`;
  }
  function openReservationDetail(id){const a=state.data.applications.find(x=>x.id===id);if(!a||(!canManage()&&!state.demo&&a.created_by!==state.user?.id&&!guardianEligible(a))){toast('Accès à cette réservation non autorisé.',true);return}const ss=session(a.session_id);const host=signatureFor(a,'host'),guardian=signatureFor(a,'guardian');const finalized=!!(host&&guardian&&signatureFor(a,'origin')&&a.final_pdf_path&&a.finalized_version===(a.convention_version||1));const detail=`<div class="detail-section"><h4>Élève et mini-stage</h4><p><strong>${esc(a.student_first_name)} ${esc(a.student_last_name)}</strong> — ${esc(a.college_name||'')}</p><p>EREA de Muret — ${esc(formation(a.formation_id).name)}</p><p>${dateLabel(ss.date)} · ${esc(ss.start_time)} – ${esc(ss.end_time)}</p></div><div class="detail-section"><h4>Réservation et validation</h4><p>Réservation : <strong>${esc(statusLabel(a.status))}</strong></p><p>Validation du stage : <strong>${esc(stageValidationLabel(a))}</strong></p><p>Réalisation : ${a.stage_status==='done'?'Stage effectué':a.stage_status==='absent'?'Élève absent':'Non renseignée'}</p></div><div class="detail-section"><h4>Signatures — convention version ${esc(a.convention_version||1)}</h4><p>${signatureState(a,'host','Établissement d’accueil')} ${host?' · '+dateLabel(host.signed_at?.slice(0,10)):''}</p><p>${signatureState(a,'guardian','Responsable légal')} ${guardian?' · '+dateLabel(guardian.signed_at?.slice(0,10)):''}</p><p><strong>${finalized?'Convention finalisée':'Convention non finalisée'}</strong></p></div><div class="detail-section"><h4>Compte rendu final</h4><p>${(a.stage_report?.validated_at&&a.stage_report?.pdf_base64)?'Disponible en PDF':'Pas encore disponible'}</p></div>`;openModal('Suivi de la réservation',detail,`<button class="btn outline" data-action="close-modal">Fermer</button><button class="btn primary" data-action="print-convention" data-id="${a.id}">Télécharger la convention</button>${(a.draft_pdf_path||a.final_pdf_path)?`<button class="btn outline" data-action="open-archived-convention" data-id="${a.id}">Voir la convention PDF archivée</button>`:''}${guardianSignButton(a)}${originEligible(a)&&signatureFor(a,'guardian')&&!signatureFor(a,'origin')?`<button class="btn primary" data-action="sign-origin" data-id="${a.id}">Signer la convention (établissement)</button>`:''}${finalized?`<button class="btn primary" data-action="download-final-convention" data-id="${a.id}">Télécharger la convention signée</button>`:''}${canAdmin()&&signatureFor(a,'origin')&&guardian&&!finalized?`<button class="btn outline" data-action="finalize-convention" data-id="${a.id}">Générer la convention définitive</button>`:''}${(a.stage_report?.validated_at&&a.stage_report?.pdf_base64)?`<button class="btn outline" data-action="download-stage-pdf" data-id="${a.id}">Compte rendu PDF</button>`:''}`)}
  function dashboardCharts(){
    const all=state.data.applications||[];
    const accepted=all.filter(a=>!['cancelled','refused','rejected'].includes(a.status));
    const formations=state.data.formations.filter(f=>accepted.some(a=>a.formation_id===f.id));
    const code=f=>String(f.code||f.name||'Formation');
    const color=f=>{const c=code(f).toUpperCase();return c.includes('PSR')?'#f3c7b4':c.includes('MAH')?'#f1d7a1':/(\bJP\b|JARDINIER)/.test(c)?'#bce5c8':'#c6d7f5'};
    const pct=(n,d)=>d?Math.round(n*100/d):0;
    const bar=(label,n,max,fill,suffix='')=>`<div class="report-bar-row"><span class="report-bar-label">${esc(label)}</span><div class="report-bar-track"><span class="report-bar-fill" style="width:${max?100*n/max:0}%;background:${fill}"></span></div><strong>${n}${suffix}</strong></div>`;
    const section=(title,subtitle,content,extra='')=>`<section class="panel report-panel ${extra}"><div class="panel-head"><div><h3>${title}</h3><p>${subtitle}</p></div></div><div class="report-body">${content}</div></section>`;
    const dist=formations.map(f=>({f,n:accepted.filter(a=>a.formation_id===f.id).length}));
    const max=Math.max(1,...dist.map(x=>x.n));
    const distribution=dist.length?dist.map(({f,n})=>bar(code(f),n,max,color(f),` · ${pct(n,accepted.length)} %`)).join(''):'<p class="muted">Aucune inscription à afficher.</p>';
    const opinions=formations.map(f=>{const r=accepted.filter(a=>a.formation_id===f.id&&a.stage_report?.validated_at);return {f,yes:r.filter(a=>a.stage_report.orientation==='Avis favorable').length,no:r.filter(a=>a.stage_report.orientation==='Avis réservé').length}});
    const opinionHtml=opinions.length?opinions.map(({f,yes,no})=>{const total=yes+no;return `<div class="report-opinion-item"><div class="report-opinion-title"><strong>${esc(code(f))}</strong><span>${total} avis validé(s)</span></div><div class="report-stack">${total?`<span class="report-stack-yes" style="width:${pct(yes,total)}%">${yes?pct(yes,total)+' %':''}</span><span class="report-stack-no" style="width:${pct(no,total)}%">${no?pct(no,total)+' %':''}</span>`:'<span class="report-stack-empty">Aucun avis</span>'}</div><small>${yes} favorable(s) · ${no} réservé(s)</small></div>`}).join(''):'<p class="muted">Aucun avis à afficher.</p>';
    const done=all.filter(a=>a.stage_status==='done').length;
    const absent=all.filter(a=>a.stage_status==='absent').length;
    const cancelled=all.filter(a=>a.status==='cancelled').length;
    const nonDone=all.filter(a=>a.stage_status==='not_done').length;
    const closed=done+absent+cancelled+nonDone;
    const signed=all.filter(a=>['confirmed','completed'].includes(a.status)&&!!(state.data.convention_signatures||[]).find(x=>x.application_id===a.id&&x.signer_role==='guardian'&&x.status==='signed')).length;
    const outcomes=[['Effectués',done,'#80d5ae'],['Absents',absent,'#f3c78f'],['Annulés',cancelled,'#c4c8ee'],['Non effectués',nonDone,'#efadac']];
    const outcomesHtml=outcomes.map(([label,n,c])=>bar(label,n,Math.max(1,...outcomes.map(x=>x[1])),c)).join('');
    const classGroup=value=>{const t=String(value||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');if(!t.trim())return 'Non renseigné';if(t.includes('ULIS'))return '3e ULIS';if(t.includes('SEGPA'))return '3e SEGPA';if(t.includes('PREPA')&&t.includes('METIER'))return '3e Prépa métiers';if(/3(E|EME|IEME|°|ÈME|È)/.test(t)&&t.includes('GEN'))return '3e générale';return 'Autres'};
    const profiles={};all.forEach(a=>{const c=classGroup(a.student_class);profiles[c]=(profiles[c]||0)+1});
    const profileHtml=Object.entries(profiles).sort((a,b)=>b[1]-a[1]).map(([label,n])=>bar(label,n,all.length,'#b8b3ef',` · ${pct(n,all.length)} %`)).join('')||'<p class="muted">Aucune donnée.</p>';
    const cards=`<div class="report-kpis"><div class="report-kpi"><span>Inscriptions enregistrées</span><strong>${all.length}</strong></div><div class="report-kpi"><span>Conventions signées (responsable légal)</span><strong>${signed}</strong></div><div class="report-kpi"><span>Mini-stages effectués</span><strong>${done}</strong></div><div class="report-kpi"><span>Taux de réalisation*</span><strong>${closed?pct(done,closed)+' %':'—'}</strong></div></div><p class="report-method">* Sur les stages dont l'issue est renseignée (effectué, absent, annulé ou non effectué). Les inscriptions en cours ne sont pas comptées.</p>`;
    return `<div class="report-dashboard">${section('Bilan des mini-stages','Indicateurs calculés à partir des inscriptions enregistrées',cards,'report-wide')}${section('Répartition des inscriptions par formation','Demandes hors annulations et refus',distribution)}${section('Avis d’orientation par formation','Comptes rendus validés uniquement',opinionHtml+'<div class="report-legend"><span><i style="background:#1ebc75"></i> Favorable</span><span><i style="background:#ef6875"></i> Réservé</span></div>')}${section('Réalisation des mini-stages','Répartition des issues enregistrées',outcomesHtml)}${section('Profil des élèves','À partir de la classe indiquée à l’inscription',profileHtml)}${section('Répartition filles / garçons','Donnée non collectée dans le formulaire actuel','<div class="report-unavailable">Non disponible : aucun champ « sexe » n’est enregistré pour les élèves. Aucun pourcentage n’est estimé.</div>','report-wide')}</div>`;
  }
  function dashboardPage(){
    if(!canManage())return userDashboardPage();
    const apps=state.data.applications||[], sessions=state.data.sessions||[], formations=state.data.formations||[];
    const now=new Date(), today=iso(now);
    const signed=apps.filter(a=>conventionIsFinal(a)).length;
    const completed=apps.filter(a=>a.stage_status==='done'||a.status==='completed').length;
    const reports=apps.filter(a=>!!a.stage_report?.validated_at).length;
    const active=sessions.filter(s=>s.active!==false&&s.date>=today);
    const pending=apps.filter(a=>a.status==='pending').length;
    const kpis=[
      {name:'Inscriptions',value:apps.length,icon:'graduation',tone:'violet',detail:'Dossiers enregistrés'},
      {name:'Créneaux',value:active.length,icon:'calendar',tone:'blue',detail:'Créneaux à venir'},
      {name:'Élèves accueillis',value:completed,icon:'users',tone:'pink',detail:'Stages effectués'},
      {name:'Conventions',value:signed,icon:'file',tone:'cyan',detail:'PDF finalisés'},
      {name:'Comptes rendus',value:reports,icon:'check',tone:'green',detail:'Rapports validés'}
    ];
    const palette=['#f3a7bc','#74b9ff','#75d8ad','#ffb36b','#ad9bff','#ffd66f','#a3cfef'];
    const categoryFilter=window.miniStageDashboardFilter||'all';
    // V46 : comptage en un passage plutôt qu'un filtrage complet par formation.
    const countsByFormation=new Map();
    for(const a of apps){if(a.status==='cancelled'||a.status==='refused')continue;countsByFormation.set(a.formation_id,(countsByFormation.get(a.formation_id)||0)+1)}
    const categories=formations.map((f,i)=>({f,n:countsByFormation.get(f.id)||0,color:palette[i%palette.length]})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
    const categoryTotal=categories.reduce((n,g)=>n+g.n,0);
    const selected=categoryFilter==='all'?null:categories.find(g=>String(g.f.id)===categoryFilter);
    const displayTotal=selected?selected.n:categoryTotal;
    const ringSegments=categories.map(g=>({name:g.f.name||g.f.code||'Formation',value:g.n,color:g.color}));
    const ringLength=2*Math.PI*78;let ringOffset=0;
    const ringArcs=ringSegments.map(g=>{const portion=categoryTotal?g.value/categoryTotal:0;const dash=portion*ringLength;const result=`<circle class="v10-ring-segment" cx="110" cy="110" r="78" fill="none" stroke="${g.color}" stroke-width="21" stroke-dasharray="${Math.max(0,dash-3)} ${ringLength}" stroke-dashoffset="${-ringOffset}" transform="rotate(-90 110 110)"><title>${esc(g.name)} : ${g.value} inscriptions</title></circle>`;ringOffset+=dash;return result}).join('');
    // V46 : accès direct aux dates des créneaux pendant le tri des inscriptions.
    const sessionDates=new Map(sessions.map(item=>[item.id,String(item.date||'')]));
    const dashboardRows=apps.filter(a=>a.status!=='cancelled'&&a.status!=='refused'&&(!selected||a.formation_id===selected.f.id)).sort((a,b)=>(sessionDates.get(a.session_id)||'').localeCompare(sessionDates.get(b.session_id)||'')).slice(0,6);
    const upcoming=active.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.start_time||'').localeCompare(String(b.start_time||''))).slice(0,5);
    const recent=[...apps].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,5);
    const initials=(state.profile.full_name||'').trim().split(/\s+/)[0]||'';
    return `<div class="ref-dashboard">
      <div class="ref-page-heading"><div><h2>Tableau de bord</h2><p>Vue d’ensemble des mini-stages – EREA de Muret</p></div><span class="ref-period">▣ ${new Date().getFullYear()} · Données réelles</span></div>
      <div class="ref-dashboard-layout"><div class="ref-main">
        <div class="ref-kpis">${kpis.map(k=>`<article class="ref-kpi"><div class="ref-kpi-icon tone-${k.tone}">${uiIcon(k.icon)}</div><div class="ref-kpi-body"><div class="ref-kpi-name">${k.name}</div><strong>${k.value}</strong><small>${k.detail}</small></div></article>`).join('')}</div>
        <section class="v10-analytics ref-chart-card" aria-label="Statistiques animées par formation">
          <div class="v10-analytics-heading"><div><span class="v10-eyebrow">ANALYSE DES INSCRIPTIONS</span><h3>Inscriptions par formation</h3><p>Répartition et suivi des élèves inscrits aux mini-stages</p></div><select id="v10FormationFilter" aria-label="Filtrer le tableau de bord par formation"><option value="all" ${categoryFilter==='all'?'selected':''}>Toutes les formations</option>${categories.map(g=>`<option value="${esc(g.f.id)}" ${selected?.f.id===g.f.id?'selected':''}>${esc(g.f.name||g.f.code)}</option>`).join('')}</select></div>
          <div class="v10-analytics-body"><div class="v10-ring-area"><div class="v10-ring-frame"><svg class="v10-ring-svg" viewBox="0 0 220 220" role="img" aria-label="Répartition des inscriptions par formation"><circle cx="110" cy="110" r="78" fill="none" stroke="var(--v10-track)" stroke-width="21"/>${ringArcs}</svg><div class="v10-ring-center"><span>INSCRIPTIONS</span><strong class="v10-count" data-count="${displayTotal}">${displayTotal}</strong><small>${selected?'dans cette formation':'toutes formations'}</small></div></div><div class="v10-ring-caption"><span class="v10-live-dot"></span> Répartition calculée à partir des inscriptions</div></div>
          <div class="v10-category-area"><div class="v10-category-grid">${categories.map(g=>`<button class="v10-category-tile ${selected?.f.id===g.f.id?'is-selected':''}" data-dash-formation="${esc(g.f.id)}" style="--tile-color:${g.color}" title="Filtrer : ${esc(g.f.name||g.f.code)}"><span class="v10-tile-icon">${formationVisualIcon(g.f)}</span><span class="v10-tile-info"><strong>${esc(g.f.code||g.f.name)}</strong><small>${esc(g.f.name||'')}</small></span><span class="v10-tile-number v10-count" data-count="${g.n}">${g.n}</span></button>`).join('')||'<p class="ref-empty">Aucune inscription enregistrée.</p>'}</div><button class="v10-clear-filter" data-dash-formation="all" ${!selected?'disabled':''}>↻ Réinitialiser le filtre</button></div></div>
          <div class="v10-analytics-list"><div class="v10-list-title"><h4>${selected?'Inscriptions — '+esc(selected.f.name||selected.f.code):'Prochaines inscriptions'}</h4><span>${displayTotal} inscription${displayTotal>1?'s':''}</span></div><div class="v10-list-scroll"><table class="v10-mini-table"><thead><tr><th>Élève</th><th>Formation</th><th>Date</th><th>Statut</th></tr></thead><tbody>${dashboardRows.map(a=>{const f=formation(a.formation_id),g=categories.find(x=>x.f.id===f.id);return `<tr><td><strong>${esc(a.student_first_name||'')} ${esc(a.student_last_name||'')}</strong></td><td><span class="v10-form-tag" style="--tile-color:${g?.color||'#8db5df'}">${esc(f.code||f.name||'—')}</span></td><td>${session(a.session_id).date?dateLabel(session(a.session_id).date):'—'}</td><td><span class="status ${statusClass(a.status)}">${statusLabel(a.status)}</span></td></tr>`}).join('')||'<tr><td colspan="4">Aucune inscription pour cette sélection.</td></tr>'}</tbody></table></div></div>
        </section>
        <div class="ref-bottom-panels"><section class="ref-chart-card"><header><h3>Inscriptions récentes</h3><button class="text-link" data-page="applications">Voir tout →</button></header><div class="ref-recent">${recent.map(a=>`<div class="ref-recent-row"><span class="ref-mini-avatar">${esc((a.student_first_name||'?').charAt(0))}</span><div><strong>${esc(a.student_first_name||'')} ${esc(a.student_last_name||'')}</strong><small>${esc(formation(a.formation_id).name||'')}</small></div><span class="status ${statusClass(a.status)}">${statusLabel(a.status)}</span></div>`).join('')||'<p class="ref-empty">Aucune inscription récente</p>'}</div></section><section class="ref-chart-card"><header><h3>Accès rapides</h3></header><div class="ref-quick"><button data-page="applications">${uiIcon('clipboard')} Inscriptions</button><button data-page="sessions">${uiIcon('calendar')} Créneaux</button><button data-page="formations">${uiIcon('layers')} Formations</button><button data-action="export-apps">${uiIcon('download')} Exporter CSV</button></div></section></div>
      </div><aside class="ref-upcoming"><header><h3>Prochains mini-stages</h3><button data-page="sessions">Voir tout</button></header>${upcoming.map((s,i)=>{const f=formation(s.formation_id);const used=apps.filter(a=>a.session_id===s.id&&a.status!=='cancelled'&&a.status!=='refused').length;return `<div class="ref-upcoming-item"><span class="ref-upcoming-icon ${originFormationColor(f)}">${formationVisualIcon(f)}</span><div><small>${dateLabel(s.date)}</small><strong>${esc(f.name||'Formation')}</strong><span>${used} / ${Number(s.capacity||0)} élèves · ${esc(s.start_time||'')}</span></div></div>`}).join('')||'<p class="ref-empty">Aucun créneau à venir</p>'}</aside></div></div>`;
  }
  function formationVisualIcon(f){
    const code=String(f?.code||'').toUpperCase().replace(/[^A-Z]/g,'');
    const name=String(f?.name||'').toLowerCase();
    let type='';
    if(code.includes('PSR')||/production.*service.*restauration|restauration/.test(name))type='plate';
    else if(code.endsWith('JP')||code.includes('JARDINIER')||/jardin|paysager/.test(name))type='chainsaw';
    else if(code==='MAH'||/horticul|mara[iî]ch|agricol/.test(name))type='plant';
    if(!type)return uiIcon('layers');
    const shapes={
      plate:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.7"/><path d="M2 3v7M4 3v7M6 3v7M4 10v11M21 3c-4 4-4 8-2 10v8"/>',
      chainsaw:'<rect x="5" y="9" width="10" height="8" rx="2"/><path d="M15 10h5a2 2 0 0 1 0 5h-5M8 9V6h5v3M7 17v3h6v-3M8 12h4M2 11v5M20 9l2-1"/>',
      plant:'<path d="M12 21V10M12 16c-5 0-8-3-8-8 5 0 8 3 8 8zM12 12c0-5 3-8 8-8 0 5-3 8-8 8zM7 21h10"/>'
    };
    return `<svg class="ui-svg formation-svg formation-${type}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[type]}</svg>`;
  }
  function uiIcon(name){
    const shapes={
      home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
      graduation:'<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 12v5c4 3 8 3 12 0v-5M22 9v7"/>',
      calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h3v3H8z"/>',
      users:'<circle cx="9" cy="8" r="3"/><path d="M2 20v-2a6 6 0 0 1 12 0v2zM17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 5 5v1"/>',
      file:'<path d="M6 2h8l5 5v15H6zM14 2v5h5M9 12h7M9 16h7"/>',
      check:'<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
      clipboard:'<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6"/>',
      layers:'<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M10 2h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 9l2-4 3 1 3-1z"/>',
      download:'<path d="M12 3v13m-5-5 5 5 5-5M4 19h16"/>',
      zap:'<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
      brush:'<path d="m14 3 7 7-9 9-7-7zM4 16c-3 1-2 5-2 5s4 1 5-2"/>',
      chart:'<path d="M4 21V12h4v9M10 21V4h4v17M16 21v-9h4v9"/>',
      logout:'<path d="M10 3H4v18h6M14 7l5 5-5 5M19 12H8"/>',
      search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
      bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
      sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'
    };
    return `<svg class="ui-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name]||shapes.layers}</svg>`;
  }
  function openOriginFromEmail(){
    const params=new URLSearchParams(window.location.hash.slice(1));
    const id=params.get('sign-origin');
    if(!id)return;
    if(!state.user)return;
    history.replaceState(null,'',window.location.pathname+window.location.search);
    const a=state.data.applications.find(x=>x.id===id);
    if(!a){toast('Dossier introuvable ou non accessible à votre compte.',true);return}
    if(!originEligible(a)){toast('Connectez-vous avec le compte de l’établissement ayant créé le dossier.',true);return}
    if(!signatureFor(a,'guardian')){toast('La signature du responsable légal est encore en attente.',true);return}
    if(signatureFor(a,'origin')){toast('La signature de l’établissement est déjà effectuée.');return}
    openOriginSignature(id);
  }
  function originEligible(a){return !state.demo&&!!state.user?.id&&a.created_by===state.user.id&&['college','admin'].includes(state.profile?.role)}
  function workflowStatus(a){if(a.final_pdf_path&&a.finalized_version===(a.convention_version||1))return 'Convention finalisée et envoyée';if(signatureFor(a,'origin')&&signatureFor(a,'guardian'))return 'En attente de validation administrateur';if(signatureFor(a,'guardian'))return 'En attente de signature établissement d’origine';if(['confirmed','completed'].includes(a.status))return 'En attente de signature responsable légal';return 'Non envoyée'}
  function workflowIndicator(a,kind){const signed=!!signatureFor(a,kind);const sent=['confirmed','completed'].includes(a.status)&&(kind==='guardian'||!!signatureFor(a,'guardian'));const label=signed?'Signature effectuée':sent?'En attente':'Non envoyée';return `<span class="status ${signed?'confirmed':sent?'pending':'completed'}" title="${esc(kind==='guardian'?'Responsable légal':'Établissement d’origine')}">${label}</span>`}
  // V69 : relances manuelles réservées à l'administrateur, pour les signatures encore attendues.
  function signatureReminderButton(a,kind){
    if(!canAdmin()||!['confirmed','completed'].includes(a.status)||conventionIsFinal(a)||signatureFor(a,kind))return '';
    if(kind==='origin'&&!signatureFor(a,'guardian'))return '';
    const label=kind==='guardian'?'Relancer le responsable légal':'Relancer l’établissement d’origine';
    return `<div style="margin-top:6px"><button type="button" class="btn outline small" data-action="${kind==='guardian'?'remind-guardian':'remind-origin'}" data-id="${esc(a.id)}" title="${label}">✉ ${label}</button></div>`;
  }
  async function remindOriginSignature(id){
    if(!canAdmin()||state.demo||!db)throw new Error('Action réservée à l’administrateur connecté.');
    const a=state.data.applications.find(x=>x.id===id);
    if(!a||!['confirmed','completed'].includes(a.status)||!signatureFor(a,'guardian')||signatureFor(a,'origin')||conventionIsFinal(a))throw new Error('La signature de l’établissement n’est pas en attente.');
    const {data,error}=await db.functions.invoke('resend-origin-signature-request',{body:{applicationId:id}});
    if(error)throw new Error(error.message||'Erreur de la fonction Supabase');
    if(!data?.success)throw new Error(data?.error||'Envoi non confirmé');
    toast('Relance envoyée à l’établissement d’origine.');
  }
  function conventionIsFinal(a){return !!(a.final_pdf_path&&a.finalized_version===(a.convention_version||1))}
  function conventionWorkflowButton(a){const ready=!!(signatureFor(a,'guardian')&&signatureFor(a,'origin'));return conventionIsFinal(a)?'':ready?`<button class="btn outline small" data-action="review-convention" data-id="${a.id}">Générer la convention</button>`:''}
  function reviewConvention(id){const a=state.data.applications.find(x=>x.id===id);if(!a||!canAdmin())throw new Error('Action réservée à l’administrateur.');if(!signatureFor(a,'guardian')||!signatureFor(a,'origin'))throw new Error('Deux signatures nécessaires avant validation.');openModal('Validation de la convention',`<p><strong>${esc(a.student_first_name)} ${esc(a.student_last_name)}</strong></p><p>${workflowIndicator(a,'guardian')} Responsable légal · ${workflowIndicator(a,'origin')} Établissement d’origine</p><p>Consultez le PDF provisoire avant validation. La signature d’accueil sera ajoutée uniquement lors de la validation.</p>`,`<button class="btn outline" data-action="print-convention" data-id="${id}">Consulter le PDF</button><button class="btn outline" data-action="close-modal">Annuler</button>${!a.final_pdf_path?`<button class="btn primary" data-action="validate-final-convention" data-id="${id}">Valider, générer et envoyer</button>`:`<button class="btn primary" data-action="download-final-convention" data-id="${id}">Télécharger le PDF final</button>`}`)}
  function confirmedRegisterRows(){
    if(!canManage())throw new Error('Accès réservé aux personnels autorisés.');
    return (state.data.applications||[]).filter(a=>a.status==='confirmed')
      .map(a=>({a,s:session(a.session_id),f:formation(a.formation_id)}))
      .sort((x,y)=>String(x.s.date||'9999').localeCompare(String(y.s.date||'9999'))||
        String(x.s.start_time||'').localeCompare(String(y.s.start_time||''))||
        String(x.a.student_last_name||'').localeCompare(String(y.a.student_last_name||''),'fr'));
  }
  function registerColor(f){
    const code=String(f?.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    const name=String(f?.name||'').toLowerCase();
    if(code.includes('PSR')||code.includes('ATMFC')||/restaur|atmfc/.test(name))return [255,220,233];
    if(code==='JP'||/paysag|jardin/.test(name))return [210,246,224];
    if(code==='MAH'||/horticul|agricol/.test(name))return [212,240,228];
    if(/electric|électric/.test(name))return [213,232,255];
    if(/peint/.test(name))return [226,213,255];
    if(/m[ée]tall/.test(name))return [255,224,193];
    if(/menuis/.test(name))return [214,244,222];
    if(/mds/.test(name))return [255,239,184];
    return [230,235,247];
  }
  function confirmedRegisterPdf(printAfter=false){
    const JsPDF=window.jspdf?.jsPDF;
    if(!JsPDF)throw new Error('La bibliothèque jsPDF n’est pas disponible.');
    const rows=confirmedRegisterRows();
    if(!rows.length){toast('Aucune inscription confirmée à exporter.');return}
    const doc=new JsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    const width=297, margin=13, columns=[37,58,61,81,34], x=[13,50,108,169,250], headY=31, lineH=9;
    const safe=(v)=>String(v??'—').split(String.fromCharCode(13)).join(' ').split(String.fromCharCode(10)).join(' ').trim()||'—';
    const cell=(txt,xx,yy,w)=>doc.text(doc.splitTextToSize(safe(txt),w-4).slice(0,2),xx+2,yy+5.5);
    let y=0,page=0;
    const drawHeader=()=>{
      page++;y=14;
      doc.setFillColor(14,30,49);doc.roundedRect(margin,y,width-2*margin,15,2,2,'F');
      doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);doc.setFontSize(15);
      doc.text('EREA de Muret — Inscriptions confirmées',margin+5,y+9.5);
      doc.setTextColor(60,75,95);doc.setFont('helvetica','normal');doc.setFontSize(8);
      doc.text(`${rows.length} inscriptions · édité le ${new Date().toLocaleDateString('fr-FR')}`,margin,34);
      y=39;doc.setFillColor(34,66,101);doc.rect(margin,y,width-2*margin,9,'F');
      doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(9);
      ['Date','Formation','Nom et prénom',"Établissement d’origine",'Professeur'].forEach((t,i)=>cell(t,x[i],y,columns[i]));
      y+=9;
    };
    drawHeader();
    rows.forEach(({a,s,f},index)=>{
      const values=[s.date?dateLabel(s.date):'—',f.name||f.code||'—',
        `${a.student_last_name||''} ${a.student_first_name||''}`.trim(),
        a.college_name||'—',s.teacher_name||'—'];
      const lines=values.map((v,i)=>doc.splitTextToSize(safe(v),columns[i]-4));
      const rowH=Math.max(lineH,Math.min(2,Math.max(...lines.map(v=>v.length)))*4.3+3);
      if(y+rowH>196){doc.addPage();drawHeader()}
      const rgb=registerColor(f);doc.setFillColor(...rgb);doc.rect(margin,y,width-2*margin,rowH,'F');
      doc.setDrawColor(255,255,255);doc.setLineWidth(.45);doc.line(margin,y+rowH,width-margin,y+rowH);
      doc.setTextColor(23,39,56);doc.setFont('helvetica','normal');doc.setFontSize(8.6);
      values.forEach((v,i)=>doc.text(lines[i].slice(0,2),x[i]+2,y+5.4));
      y+=rowH;
    });
    const n=doc.getNumberOfPages();
    for(let i=1;i<=n;i++){doc.setPage(i);doc.setTextColor(105,120,140);doc.setFontSize(8);doc.text('PDF inscriptions — correction RN V2',margin,203);doc.text(`Page ${i} / ${n}`,width-margin,203,{align:'right'})}
    const fileName=`inscriptions-confirmees-${new Date().toISOString().slice(0,10)}.pdf`;
    if(printAfter){
      doc.autoPrint();
      const url=URL.createObjectURL(doc.output('blob'));
      const tab=window.open(url,'_blank');
      if(!tab){URL.revokeObjectURL(url);doc.save(fileName);toast('Fenêtre d’impression bloquée : PDF téléchargé.');return}
      setTimeout(()=>URL.revokeObjectURL(url),120000);
    }else doc.save(fileName);
  }
  // Recherche publique SIRENE : vérification humaine indispensable (plusieurs établissements peuvent partager un nom).
  function setupSiretLookup(form){
    const button=form?.querySelector('#lookupSiret'), select=form?.querySelector('#siretCandidates'), status=form?.querySelector('#siretLookupStatus');
    if(!button||!select)return;
    const find=async()=>{
      const name=String(form.elements.college_name?.value||'').trim(),city=String(form.elements.college_city?.value||'').trim();
      if(name.length<3){status.textContent='Renseignez le nom de l’établissement avant la recherche.';return}
      button.disabled=true;status.textContent='Recherche dans la base SIRENE…';select.classList.add('hidden');
      try{
        const q=[name,city].filter(Boolean).join(' ');
        const response=await fetch('https://recherche-entreprises.api.gouv.fr/search?q='+encodeURIComponent(q)+'&per_page=20');
        if(!response.ok)throw new Error('Service momentanément indisponible ('+response.status+').');
        const data=await response.json();const results=[];
        for(const company of data.results||[]){
          const entries=[company.siege,...(company.matching_etablissements||[])].filter(Boolean);
          for(const item of entries){const number=String(item.siret||'').replace(/\D/g,'');if(number.length!==14||results.some(x=>x.siret===number))continue;
            const label=[company.nom_complet||company.nom_raison_sociale||'',item.adresse||'',item.commune||''].filter(Boolean).join(' · ');
            results.push({siret:number,label});
          }
        }
        select.innerHTML='<option value="">— Choisir un établissement vérifié —</option>'+results.map(x=>'<option value="'+esc(x.siret)+'">'+esc(x.label)+' — '+esc(x.siret)+'</option>').join('');
        select.classList.toggle('hidden',!results.length);status.textContent=results.length?results.length+' résultat(s) : vérifiez l’adresse avant de sélectionner.':'Aucun résultat : saisissez le SIRET manuellement après vérification.';
      }catch(e){status.textContent='Recherche indisponible : '+(e.message||e)+'. Saisie manuelle possible.'}
      finally{button.disabled=false}
    };
    button.addEventListener('click',find);
    select.addEventListener('change',()=>{if(select.value){form.elements.college_siret.value=select.value;if(canAdmin()&&form._selectedSiretSchool)void rememberSchoolSiret(form._selectedSiretSchool,select.value)}});
  }
  // V24 : interrogation de l'annuaire officiel de l'Éducation nationale par UAI exact.
  // Ne jamais attribuer un SIRET par simple similarité de nom.
  const officialSchoolSiretCache=new Map();
  async function officialSiretByUai(uai){
    const key=String(uai||'').trim().toUpperCase();
    if(!/^[0-9]{7}[A-Z]$/.test(key))return null;
    if(officialSchoolSiretCache.has(key))return officialSchoolSiretCache.get(key);
    const base='https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records';
    const where='identifiant_de_l_etablissement="'+key+'"';
    const url=base+'?where='+encodeURIComponent(where)+'&select='+encodeURIComponent('identifiant_de_l_etablissement,nom_etablissement,nom_commune,siren_siret')+'&limit=2';
    const response=await fetch(url,{headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('Annuaire Éducation nationale : HTTP '+response.status);
    const payload=await response.json();
    const records=(payload.results||[]).filter(r=>String(r.identifiant_de_l_etablissement||'').toUpperCase()===key);
    const numbers=[...new Set(records.map(r=>String(r.siren_siret||'').replace(/\D/g,'')).filter(v=>/^\d{14}$/.test(v)))];
    const result=numbers.length===1?{uai:key,siret:numbers[0],name:records[0]?.nom_etablissement||'',city:records[0]?.nom_commune||''}:null;
    officialSchoolSiretCache.set(key,result);
    return result;
  }
  // V25 : l'API Recherche d'entreprises renvoie le SIRET dans siege et
  // matching_etablissements, et l'UAI dans liste_uai. Vérification exacte,
  // sans accepter un homonyme ni confondre SIREN (9 chiffres) et SIRET (14).
  const enterpriseSchoolSiretCache=new Map();
  async function enterpriseSiretByUai(school){
    const uai=String(school?.uai||'').trim().toUpperCase();
    if(!/^[0-9]{7}[A-Z]$/.test(uai))return null;
    if(enterpriseSchoolSiretCache.has(uai))return enterpriseSchoolSiretCache.get(uai);
    const queries=[school.name+' '+(school.city||''),school.name,uai].map(q=>String(q||'').trim()).filter(Boolean);
    const unique=[...new Set(queries)];
    const matches=new Map();
    let completed=false;
    let lastError=null;
    for(const q of unique){
      try{
        const url='https://recherche-entreprises.api.gouv.fr/search?q='+encodeURIComponent(q)+'&per_page=25';
        const response=await fetch(url,{headers:{Accept:'application/json'}});
        if(!response.ok)throw new Error('API entreprises HTTP '+response.status);
        const payload=await response.json();completed=true;
        for(const company of payload.results||[]){
          for(const establishment of [company.siege,...(company.matching_etablissements||[])].filter(Boolean)){
            const number=String(establishment.siret||'').replace(/\D/g,'');
            const codes=Array.isArray(establishment.liste_uai)?establishment.liste_uai:[];
            const exact=codes.some(code=>String(code||'').trim().toUpperCase()===uai);
            if(!exact||!/^\d{14}$/.test(number)||establishment.etat_administratif!=='A')continue;
            matches.set(number,{uai,siret:number,name:company.nom_complet||school.name,city:establishment.libelle_commune||school.city||''});
          }
        }
        if(matches.size===1){const result=[...matches.values()][0];enterpriseSchoolSiretCache.set(uai,result);return result;}
      }catch(error){lastError=error;console.warn('Recherche SIRET entreprise:',error);}
    }
    if(matches.size>1)throw new Error('Plusieurs SIRET actifs correspondent à cet UAI : vérification manuelle nécessaire.');
    if(!completed&&lastError)throw lastError;
    enterpriseSchoolSiretCache.set(uai,null);
    return null;
  }
  // V16 : correspondance UAI / SIRET mémorisée et recherche automatique, sans attribution incertaine.
  let schoolSiretRequest=0;
  function siretNormal(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,' ').replace(/\s+/g,' ').trim()}
  function siretPostcode(v){return (String(v||'').match(/\b\d{5}\b/)||[])[0]||''}
  async function rememberSchoolSiret(school,siret){
    if(!school?.uai||!/^[0-9]{14}$/.test(siret)||state.demo||!db)return;
    const {error}=await db.from('school_siret_directory').upsert({uai:school.uai,siret,school_name:school.name,city:school.city,updated_at:new Date().toISOString()},{onConflict:'uai'});
    if(error)console.warn('Correspondance SIRET non mémorisée :',error.message);
  }
  async function autofillSiretForSchool(school){
    const form=$('#entityForm'),input=form?.elements?.college_siret,status=form?.querySelector('#siretLookupStatus'),select=form?.querySelector('#siretCandidates');
    if(!school||!input||!status)return;
    const request=++schoolSiretRequest;
    form.dataset.schoolUai=school.uai||'';
    if(/^[0-9]{14}$/.test(input.value)){status.textContent='SIRET renseigné automatiquement.';return;}input.value='';select?.classList.add('hidden');
    status.textContent='Recherche automatique du SIRET pour '+school.name+'…';
    const current=()=>request===schoolSiretRequest&&form.isConnected&&form.dataset.schoolUai===(school.uai||'');
    try{
      if(!state.demo&&db&&school.uai){
        const {data,error}=await db.from('school_siret_directory').select('siret').eq('uai',school.uai).maybeSingle();
        if(!current())return;
        if(!error&&/^[0-9]{14}$/.test(data?.siret||'')){if(!/^[0-9]{14}$/.test(input.value))input.value=data.siret;status.textContent='SIRET renseigné automatiquement depuis l’annuaire UAI–SIRET.';return;}
      }
      let official=null;
      try{official=await officialSiretByUai(school.uai)}catch(error){console.warn('Annuaire Education nationale SIRET:',error)}
      if(!current())return;
      if(official){input.value=official.siret;status.textContent='SIRET renseigné depuis l’annuaire officiel de l’Éducation nationale (UAI vérifié).';return;}
      status.textContent='Vérification de l’UAI dans l’annuaire des entreprises…';
      const enterprise=await enterpriseSiretByUai(school);
      if(!current())return;
      if(enterprise){input.value=enterprise.siret;status.textContent='SIRET trouvé automatiquement (UAI vérifié dans l’annuaire des entreprises).';void rememberSchoolSiret(school,enterprise.siret);return;}
      status.textContent='Aucun SIRET vérifié trouvé pour cet UAI. Saisie manuelle possible.';
    }catch(err){if(current())status.textContent='Recherche automatique impossible ('+(err?.message||'service inaccessible')+'). Si nécessaire, renseignez-le manuellement.';}
  }
  function exportGestionPdf(){
    if(!canAdmin())throw new Error('Accès administrateur requis.');
    const JsPDF=window.jspdf?.jsPDF;if(!JsPDF)throw new Error('Bibliothèque PDF indisponible.');
    const rows=confirmedRegisterRows();if(!rows.length){toast('Aucun stage confirmé à exporter.');return}
    const doc=new JsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    const widths=[23,39,45,65,30,17,40,18],headers=['Date','Formation','Nom et prénom','Établissement d’origine','SIRET','Repas','Prise en charge repas','Internat'];
    const x=[10];for(let i=0;i<widths.length;i++)x.push(x[i]+widths[i]);
    const clean=v=>String(v??'—').replace(/[\r\n]+/g,' ').trim()||'—';
    let y=0,page=0;
    const header=()=>{page++;y=12;doc.setFillColor(18,48,73);doc.rect(10,y,277,15,'F');doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(255,255,255);doc.text('EREA de Muret — Export gestion des mini-stages confirmés',14,21);y=31;doc.setTextColor(70,80,95);doc.setFontSize(8);doc.text(rows.length+' stage(s) confirmé(s) · '+new Date().toLocaleDateString('fr-FR')+' · page '+page,10,y);y=35;doc.setFillColor(40,73,103);doc.rect(10,y,277,11,'F');doc.setFontSize(7);doc.setTextColor(255,255,255);headers.forEach((h,i)=>doc.text(doc.splitTextToSize(h,widths[i]-3).slice(0,2),x[i]+1.5,y+4));y+=11};
    header();doc.setFont('helvetica','normal');doc.setFontSize(7.3);
    for(let j=0;j<rows.length;j++){
      const a=rows[j].a,ss=rows[j].s;
      const values=[dateLabel(ss.date),formation(a.formation_id).name,[a.student_last_name,a.student_first_name].filter(Boolean).join(' '),a.college_name,a.college_siret,a.meal,a.meal==='oui'?a.meal_payer:'Sans objet',a.medical_issue];
      const lines=values.map((v,i)=>doc.splitTextToSize(clean(v),widths[i]-3).slice(0,3));
      const h=Math.max(9,Math.max(...lines.map(l=>l.length))*3.7+3);
      if(y+h>194){doc.addPage();header()}
      if(j%2===0){doc.setFillColor(243,247,251);doc.rect(10,y,277,h,'F')}
      doc.setTextColor(30,48,65);values.forEach((_,i)=>doc.text(lines[i],x[i]+1.5,y+4));
      doc.setDrawColor(222,229,235);doc.line(10,y+h,287,y+h);y+=h;
    }
    doc.save('MiniStages_Export_Gestion_'+iso(new Date())+'.pdf');toast('Export gestion PDF téléchargé.');
  }
  // V54 : répartition en un passage pour le tableau Kanban administrateur.
  // Les réservations inconnues restent visibles en vue Liste, comme auparavant.
  function groupApplicationsByStatus(applications){
    const groups=Object.create(null);
    for(const application of applications){
      const status=application.status;
      (groups[status]||(groups[status]=[])).push(application);
    }
    return groups;
  }
  // V54 : le texte d'une inscription est normalisé une seule fois par filtre.
  // Aucun cache durable : chaque rendu utilise les valeurs actuelles de l'application.
  function applicationSearchText(a){
    return normalizeSearch([a.student_first_name,a.student_last_name,a.college_name,
      a.college_siret,a.contact_email,formation(a.formation_id).name,
      session(a.session_id).date,statusLabel(a.status)].join(' '));
  }
  function applicationsPage(){const q=normalizeSearch(state.filters.q);const terms=q.split(/\s+/).filter(Boolean);const rows=state.data.applications.filter(a=>(canManage()||a.created_by===state.user?.id)&&(state.filters.status==='all'||a.status===state.filters.status)&&(!terms.length||terms.every(term=>applicationSearchText(a).includes(term)))).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));const kanbanBuckets=window.miniStageAppView==='kanban'?groupApplicationsByStatus(rows):null;const kanban=window.miniStageAppView==='kanban'&&rows.length?`<div class="kanban-board">${[['pending','À traiter'],['confirmed','Confirmées'],['completed','Terminées'],['refused','Refusées'],['cancelled','Annulées']].map(([status,title])=>{const cards=kanbanBuckets[status]||[];return `<section class="kanban-column"><header><span class="kanban-dot ${status}"></span><strong>${title}</strong><b>${cards.length}</b></header><div class="kanban-stack">${cards.map(a=>{const s=session(a.session_id);return `<article class="kanban-card"><span class="kanban-formation">${esc(formation(a.formation_id).code||'Formation')}</span><h4>${esc(a.student_first_name)} ${esc(a.student_last_name)}</h4><p>${esc(a.college_name||'—')}</p><small>${shortDate(s.date)} · ${esc(s.start_time||'')}</small><div class="kanban-signatures">${workflowIndicator(a,'guardian')}${workflowIndicator(a,'origin')}</div><div class="kanban-actions"><button class="btn outline small" data-action="edit-application" data-id="${esc(a.id)}">Ouvrir le dossier</button>${canAdmin()&&a.status==='pending'?`<button class="btn primary small" data-action="set-status" data-status="confirmed" data-id="${esc(a.id)}">Confirmer</button>`:''}${conventionIsFinal(a)?`<button class="icon-btn" title="Convention PDF" data-action="open-final-convention" data-id="${esc(a.id)}">📄</button>`:''}</div></article>`}).join('')||'<p class="kanban-empty">Aucune inscription</p>'}</div></section>`}).join('')}</div>`:'<div class="empty">Aucune inscription à afficher.</div>';return `<div class="welcome-row"><div><h2>Inscriptions</h2><p>Consultez les inscriptions et les comptes rendus de mini-stage.</p></div><div class="page-actions"><button class="btn outline" data-action="export-apps">⇩ Exporter CSV</button>${canManage()?'<button class="btn outline" data-action="export-gestion">📋 Export gestion</button><button class="btn outline" data-action="confirmed-register-pdf">📄 PDF confirmées</button><button class="btn outline" data-action="confirmed-register-print">🖨 Imprimer confirmées</button>':''}${(canManage()||['college','family'].includes(state.profile?.role))?'<button class="btn primary" data-action="new-application">＋ Ajouter une inscription</button>':''}</div></div><div class="toolbar"><div class="view-switch" role="group" aria-label="Affichage des inscriptions"><button type="button" class="view-btn ${window.miniStageAppView==='kanban'?'':'selected'}" data-view="list">☷ Liste</button><button type="button" class="view-btn ${window.miniStageAppView==='kanban'?'selected':''}" data-view="kanban">▦ Kanban</button></div><div class="searchbox"><input id="appSearch" value="${esc(state.filters.q)}" placeholder="Rechercher un élève, un collège…"></div><select id="statusFilter"><option value="all" ${state.filters.status==='all'?'selected':''}>Tous les statuts</option><option value="pending" ${state.filters.status==='pending'?'selected':''}>À traiter</option><option value="confirmed" ${state.filters.status==='confirmed'?'selected':''}>Confirmées</option><option value="refused" ${state.filters.status==='refused'?'selected':''}>Refusées</option><option value="cancelled" ${state.filters.status==='cancelled'?'selected':''}>Annulées</option></select><span class="muted tiny">${rows.length} résultat(s)</span></div><div class="kanban-view ${window.miniStageAppView==='kanban'?'':'hidden'}">${kanban}</div><section class="panel data-panel admin-applications-table ${window.miniStageAppView==='kanban'?'hidden':''}"><div class="table-wrap"><table><thead><tr><th rowspan="2">Élève</th><th rowspan="2">Collège</th><th rowspan="2">SIRET</th><th rowspan="2">Formation / date</th><th rowspan="2">Contact</th><th rowspan="2">Statut</th><th colspan="3" class="suivi-group">Suivi <button class="btn outline small" data-action="refresh-signatures" title="Actualiser les signatures">↻ Actualiser</button></th><th rowspan="2">Stage</th><th rowspan="2">Actions</th></tr><tr class="suivi-subheaders"><th>Signature responsable légal</th><th>Signature établissement d’origine</th><th>Générer la convention</th></tr></thead><tbody>${rows.length?rows.map(a=>{const s=session(a.session_id);const stage=a.stage_status||'';return `<tr><td><div class="cell-title">${esc(a.student_first_name)} ${esc(a.student_last_name)}</div><div class="cell-sub">${esc(a.student_class||'Classe non précisée')}</div></td><td><div class="cell-title">${esc(a.college_name||'—')}</div><div class="cell-sub">${esc(a.college_city||'')}</div></td><td class="siret-cell">${esc(a.college_siret||'—')}</td><td><div class="cell-title">${esc(formation(a.formation_id).name)}</div><div class="cell-sub">${dateLabel(s.date)} · ${esc(s.start_time||'')}</div></td><td><div class="cell-title">${esc(a.contact_name||'—')}</div><div class="cell-sub">${esc(a.contact_email||'')}</div></td><td><span class="status ${statusClass(a.status)}">${statusLabel(a.status)}</span></td><td>${workflowIndicator(a,'guardian')}${signatureReminderButton(a,'guardian')}</td><td>${workflowIndicator(a,'origin')}${signatureReminderButton(a,'origin')}</td><td>${canAdmin()?(signatureFor(a,'guardian')&&signatureFor(a,'origin')?conventionWorkflowButton(a)+(conventionIsFinal(a)?`<button class="icon-btn" title="Renvoyer le PDF par e-mail" data-action="resend-final-convention" data-id="${a.id}">✉</button>`:''):''):esc(workflowStatus(a))}</td><td>${conventionIsFinal(a)&&['confirmed','completed'].includes(a.status)&&canManage()?`<select class="stage-status-select" data-stage-status="${a.id}" ${a.stage_report?.validated_at?'disabled title="Statut verrouillé : compte rendu définitif généré"':''} aria-label="État du mini-stage pour ${esc(a.student_first_name)} ${esc(a.student_last_name)}"><option value="" ${!stage?'selected':''}>— À renseigner —</option><option value="done" ${stage==='done'?'selected':''}>Stage effectué</option><option value="absent" ${stage==='absent'?'selected':''}>Élève absent</option></select>${a.stage_report?.validated_at?'<span class="cell-sub" title="Compte rendu définitif généré">🔒 Verrouillé</span>':''}${!a.stage_report?.validated_at&&(stage==='done'||a.stage_report&&Object.keys(a.stage_report).length)?`<button class="btn outline small stage-report-btn" data-action="stage-report" data-id="${a.id}">${a.stage_report?.validated_at?'Voir le PDF':'Rédiger le compte rendu'}</button>`:''}`:conventionIsFinal(a)?(stage==='done'?'Stage effectué':stage==='absent'?'Élève absent':'—'):'—'}</td><td><div class="row-actions"><button class="icon-btn" title="Voir / modifier" aria-label="Voir ou modifier la réservation" data-action="edit-application" data-id="${a.id}">✎</button>${canAdmin()?`<button class="icon-btn delete-reservation-btn" title="Supprimer définitivement" aria-label="Supprimer définitivement la réservation de ${esc(a.student_first_name)} ${esc(a.student_last_name)}" data-action="delete-application" data-id="${a.id}">✕</button>`:''}${canAdmin()&&a.status==='pending'?`<button class="btn primary small" title="Confirmer l’inscription et envoyer la demande de signature" aria-label="Confirmer l’inscription" data-action="set-status" data-status="confirmed" data-id="${a.id}">Confirmer et envoyer la signature</button>`:''}${canAdmin()&&['confirmed','completed'].includes(a.status)&&!signatureFor(a,'guardian')&&!conventionIsFinal(a)?`<button class="icon-btn" title="Envoyer ou renvoyer la demande de signature au responsable légal" aria-label="Envoyer la demande de signature" data-action="send-guardian-request" data-id="${a.id}">✉</button>`:''}${conventionIsFinal(a)?`<button class="icon-btn" title="Convention définitive PDF" aria-label="Ouvrir la convention définitive PDF" data-action="open-final-convention" data-id="${a.id}">📄</button>`:''}${(a.stage_report?.validated_at&&a.stage_report?.pdf_base64)?`<button class="icon-btn" title="Compte rendu PDF" aria-label="Ouvrir le compte rendu PDF" data-action="download-stage-pdf" data-id="${a.id}">📋</button><button class="icon-btn mail-status ${a.stage_report.email_status==='sent'?'mail-sent':'mail-failed'}" title="${a.stage_report.email_status==='sent'?'Compte rendu envoyé':'Compte rendu non envoyé — cliquer pour réessayer'}" aria-label="${a.stage_report.email_status==='sent'?'Compte rendu envoyé':'Envoyer le compte rendu'}" data-action="send-stage-email" data-id="${a.id}">${a.stage_report.email_status==='sent'?'✉✓':'✉!'}</button>`:''}</div></td></tr>`}).join(''):`<tr><td colspan="11"><div class="empty-state"><div class="empty-symbol">▤</div><h3>Aucune inscription trouvée</h3><p>Modifiez les filtres ou créez une nouvelle inscription.</p>${(canManage()||['college','family'].includes(state.profile?.role))?'<button class="btn primary" data-action="new-application">＋ Ajouter une inscription</button>':''}</div></td></tr>`}</tbody></table></div></section>`}
  const v78Selected=new Set();
  const v78Filters={search:'',from:'',to:'',formation:'',teacher:'',status:''};
  function v78ApplyFilters(){
    const rows=[...document.querySelectorAll('#sessionList tbody tr[data-v78-id]')];
    let visible=0;
    for(const row of rows){
      const text=(row.textContent||'').toLocaleLowerCase('fr');
      const match=(!v78Filters.search||text.includes(v78Filters.search.toLocaleLowerCase('fr')))
        &&(!v78Filters.from||row.dataset.v78Date>=v78Filters.from)
        &&(!v78Filters.to||row.dataset.v78Date<=v78Filters.to)
        &&(!v78Filters.formation||row.dataset.v78Formation===v78Filters.formation)
        &&(!v78Filters.teacher||row.dataset.v78Teacher===v78Filters.teacher)
        &&(!v78Filters.status||row.dataset.v78Status===v78Filters.status);
      row.hidden=!match;row.style.display=match?'':'none';
      row.querySelector('.v78-row-check').checked=v78Selected.has(row.dataset.v78Id);
      if(match)visible++;
    }
    const counter=document.getElementById('v78Count');if(counter)counter.textContent=visible+' créneau(x) affiché(s)';
    const count=document.getElementById('v78SelectedCount');if(count)count.textContent=v78Selected.size+' sélectionné(s)';
    const all=document.getElementById('v78SelectAll');if(all){const shown=rows.filter(r=>!r.hidden);all.checked=shown.length>0&&shown.every(r=>v78Selected.has(r.dataset.v78Id));all.indeterminate=shown.some(r=>v78Selected.has(r.dataset.v78Id))&&!all.checked;}
  }
  function v78BindFilters(){
    if(!document.getElementById('sessionList'))return;
    const mapping={sessionSearch:'search',v78DateFrom:'from',v78DateTo:'to',v78Formation:'formation',v78Teacher:'teacher',v78Status:'status'};
    for(const [id,key] of Object.entries(mapping)){
      const el=document.getElementById(id);if(!el)continue;
      el.value=v78Filters[key];
      el.addEventListener(id==='sessionSearch'?'input':'change',()=>{v78Filters[key]=el.value;v78ApplyFilters()});
    }
    document.getElementById('v78Reset')?.addEventListener('click',()=>{Object.keys(v78Filters).forEach(k=>v78Filters[k]='');v78BindFilterValues();v78ApplyFilters()});
    document.getElementById('v78ClearSelection')?.addEventListener('click',()=>{v78Selected.clear();v78ApplyFilters()});
    document.getElementById('v78SelectAll')?.addEventListener('change',e=>{document.querySelectorAll('#sessionList tbody tr[data-v78-id]').forEach(row=>{if(row.hidden)return;if(e.target.checked)v78Selected.add(row.dataset.v78Id);else v78Selected.delete(row.dataset.v78Id)});v78ApplyFilters()});
    document.querySelectorAll('.v78-row-check').forEach(el=>el.addEventListener('change',()=>{if(el.checked)v78Selected.add(el.value);else v78Selected.delete(el.value);v78ApplyFilters()}));
    v78ApplyFilters();
  }
  function v78BindFilterValues(){const ids={sessionSearch:'search',v78DateFrom:'from',v78DateTo:'to',v78Formation:'formation',v78Teacher:'teacher',v78Status:'status'};for(const [id,key] of Object.entries(ids)){const el=document.getElementById(id);if(el)el.value=v78Filters[key]}}
  async function v78BulkSetActive(active){
    if(!canAdmin())throw new Error('Action réservée à l’administrateur.');
    const chosen=[...v78Selected].map(id=>state.data.sessions.find(s=>s.id===id)).filter(Boolean);
    if(!chosen.length){toast('Sélectionnez au moins un créneau.',true);return}
    const targets=chosen.filter(s=>s.active!==active);
    if(!targets.length){toast('Tous les créneaux sélectionnés ont déjà ce statut.');return}
    if(!window.confirm(`${active?'Ouvrir':'Fermer'} ${targets.length} créneau(x) sélectionné(s) ?`))return;
    let done=0,failed=[];
    for(const s of targets){try{await persist('sessions',{active},s.id);done++}catch(e){failed.push(`${s.date} : ${e.message||e}`)}}
    v78Selected.clear();renderPage();toast(`${done} créneau(x) ${active?'ouvert(s)':'fermé(s)'}.`+(failed.length?' Échecs : '+failed.join('; '):''),!!failed.length);
  }
  async function v79BulkDeleteSessions(){
    if(!canAdmin())throw new Error('Suppression réservée à l’administrateur.');
    const chosen=[...v78Selected].map(id=>state.data.sessions.find(s=>String(s.id)===String(id))).filter(Boolean);
    if(!chosen.length){toast('Sélectionnez au moins un créneau.',true);return;}
    const chosenIds=new Set(chosen.map(s=>String(s.id)));
    // L'historique de toute inscription, même refusée ou annulée, bloque la suppression.
    const locallyLinked=new Set(state.data.applications.filter(a=>chosenIds.has(String(a.session_id))).map(a=>String(a.session_id)));
    const eligible=chosen.filter(s=>!locallyLinked.has(String(s.id)));
    if(!eligible.length){toast('Aucun créneau supprimable : tous possèdent une réservation ou un historique.',true);return;}
    const msg=`Supprimer définitivement ${eligible.length} créneau(x) sans réservation ?`+
      (chosen.length!==eligible.length?`\n${chosen.length-eligible.length} créneau(x) avec réservation seront conservés.`:'')+
      '\n\nCette opération est irréversible. Confirmer ?';
    if(!window.confirm(msg))return;
    let deleted=0;const errors=[];const protectedIds=[];
    for(const s of eligible){
      try{
        if(state.demo){
          if(state.data.applications.some(a=>String(a.session_id)===String(s.id))){protectedIds.push(s.id);continue;}
          state.data.sessions=state.data.sessions.filter(x=>String(x.id)!==String(s.id));saveDemo();deleted++;continue;
        }
        if(!db)throw new Error('Connexion Supabase indisponible.');
        // Recontrôle avant chaque suppression : aucune réservation existante.
        const {data:linked,error:checkError}=await db.from('applications').select('id').eq('session_id',s.id).limit(1);
        if(checkError)throw new Error('Vérification des réservations impossible : '+checkError.message);
        if(linked?.length){protectedIds.push(s.id);continue;}
        const {data:removed,error}=await db.from('sessions').delete().eq('id',s.id).select('id');
        if(error)throw new Error(error.message);
        if(!removed?.length)throw new Error('Suppression non autorisée (RLS).');
        deleted++;
      }catch(e){errors.push(`${s.date} : ${e.message||e}`);}
    }
    if(!state.demo)await loadLiveData();
    v78Selected.clear();renderPage();
    toast(`${deleted} créneau(x) supprimé(s). ${locallyLinked.size+protectedIds.length} conservé(s) avec réservation.`+
      (errors.length?` ${errors.length} échec(s) : ${errors.slice(0,3).join('; ')}`:''),!!errors.length);
  }
  function sessionsPage(){
    const items=[...state.data.sessions].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')) || String(a.start_time||'').localeCompare(String(b.start_time||'')));
    const rows=items.map(s=>{
      const f=formation(s.formation_id);
      const enrolled=confirmedPlaces(s.id);
      const reservations=state.data.applications.filter(a=>String(a.session_id)===String(s.id));
      const confirmed=reservations.filter(a=>a.status==='confirmed');
      const students=confirmed.map(a=>esc(`${a.student_first_name||''} ${a.student_last_name||''}`.trim())).join(', ');
      // Suppression uniquement si aucune inscription, même en attente ou annulée, n'est rattachée.
      const canDelete=canAdmin() && reservations.length===0;
      return `<tr class="compact-session ${originFormationColor(f)}" data-session-name="${esc(f.name.toLowerCase())}" data-v78-date="${esc(s.date||'')}" data-v78-formation="${esc(f.name)}" data-v78-teacher="${esc(s.teacher_name||'À attribuer')}" data-v78-status="${s.active?'open':'closed'}" data-v78-id="${esc(s.id)}">
        <td class="v78-select-cell"><input type="checkbox" class="v78-row-check" aria-label="Sélectionner le créneau du ${shortDate(s.date)}" value="${esc(s.id)}"></td><td class="compact-date"><strong>${shortDate(s.date)}</strong></td>
        <td class="compact-formation"><strong>${esc(f.name)}</strong><small>${enrolled}/${s.capacity} place(s) · ${s.active?'Ouvert':'Fermé'}${students?' · Élève(s) : '+students:''}</small></td>
        <td>${esc(s.start_time||'09:00')} – ${esc(s.end_time||'16:00')}</td>
        <td>${esc(s.teacher_name||'À attribuer')}</td>
        <td class="compact-actions">${canManage()?`<button class="btn outline small" data-action="edit-session" data-id="${s.id}">Modifier</button> <button class="btn ${s.active?'danger':'secondary'} small" data-action="toggle-session" data-id="${s.id}">${s.active?'Fermer':'Ouvrir'}</button> ${canDelete?`<button class="btn danger small" data-action="delete-session" data-id="${s.id}" title="Supprimer ce créneau sans réservation">Supprimer</button>`:''}`:''}</td>
      </tr>`;
    }).join('');
    return `<div class="welcome-row"><div><h2>Créneaux & calendrier</h2><p>Organisez les journées d’accueil, attribuez un professeur et suivez les élèves confirmés.</p></div>${canManage()?'<button class="btn outline" data-action="bulk-sessions">▦ Créer plusieurs créneaux</button> <button class="btn primary" data-action="new-session">＋ Créer un créneau</button>':''}</div><div class="toolbar v78-filterbar"><label>Recherche<input id="sessionSearch" type="search" placeholder="Rechercher un créneau…"></label><label>Date du<input id="v78DateFrom" type="date"></label><label>Au<input id="v78DateTo" type="date"></label><label>Formation<select id="v78Formation"><option value="">Toutes les formations</option>${[...new Set(items.map(s=>formation(s.formation_id).name))].sort().map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('')}</select></label><label>Professeur<select id="v78Teacher"><option value="">Tous les professeurs</option>${[...new Set(items.map(s=>s.teacher_name||'À attribuer'))].sort().map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('')}</select></label><label>Statut<select id="v78Status"><option value="">Tous</option><option value="open">Ouverts</option><option value="closed">Fermés</option></select></label><button type="button" class="btn outline small" id="v78Reset">Effacer les filtres</button><span class="muted tiny" id="v78Count">${items.length} créneau(x)</span></div><div class="v78-bulkbar"><strong id="v78SelectedCount">0 sélectionné(s)</strong><button type="button" class="btn outline small" data-action="v78-bulk-open">Ouvrir la sélection</button><button type="button" class="btn outline small" data-action="v78-bulk-close">Fermer la sélection</button><button type="button" class="btn danger small" data-action="v79-bulk-delete">Supprimer la sélection</button><button type="button" class="btn outline small" id="v78ClearSelection">Désélectionner</button></div><section class="panel data-panel"><div class="table-wrap"><table class="schedule-table compact-schedule-table" id="sessionList"><thead><tr><th><input id="v78SelectAll" type="checkbox" aria-label="Sélectionner tous les créneaux affichés"></th><th>Date</th><th>Formation et réservations</th><th>Horaires</th><th>Professeur</th><th>Actions</th></tr></thead><tbody>${rows||'<tr><td colspan="6"><div class="empty-state"><h3>Aucun créneau</h3><p>Créez un créneau pour commencer à planifier les mini-stages.</p></div></td></tr>'}</tbody></table></div></section>`;
  }

  function formationsPage(){
    if(state.profile?.role==='college'){
      const items=state.data.formations.filter(f=>f.active!==false);
      const selected=items.find(f=>f.id===state.originFormationId);
      if(!selected)return `<div class="welcome-row"><div><h2>Choisir une formation</h2><p>Sélectionnez une formation pour consulter ses créneaux disponibles.</p></div></div><div class="stats-grid">${items.map(f=>`<article class="stat-card origin-formation-card ${originFormationColor(f)}"><div class="stat-top"><strong class="origin-formation-code">${esc(f.code||'FORMATION')}</strong></div><h3>${esc(f.name)}</h3><p class="muted">${esc(f.description||'')}</p><button class="btn primary origin-formation-action" data-action="origin-formation" data-id="${esc(f.id)}">Voir les créneaux disponibles →</button></article>`).join('')}</div>`;
      const available=selectableSessions(selected.id);
      return `<div class="welcome-row"><div><button class="btn outline small" data-action="origin-formations-back">← Toutes les formations</button><h2 style="margin-top:12px">${esc(selected.name)}</h2><p>Créneaux ouverts, à venir et disposant d'au moins une place.</p></div></div><section class="panel data-panel"><div class="table-wrap"><table><thead><tr><th>Date</th><th>Horaires</th><th>Professeur</th><th>Places disponibles</th><th>Inscription</th></tr></thead><tbody>${available.map(ss=>`<tr><td><strong>${shortDate(ss.date)}</strong></td><td>${shortTime(ss.start_time)} – ${shortTime(ss.end_time)}</td><td>${esc(ss.teacher_name||'À préciser')}</td><td>${Math.max(0,Number(ss.capacity||0)-confirmedPlaces(ss.id))}</td><td><button class="btn primary small" data-action="origin-register" data-id="${esc(ss.id)}">S'inscrire</button></td></tr>`).join('')||'<tr><td colspan="5"><div class="empty">Aucun créneau disponible pour cette formation.</div></td></tr>'}</tbody></table></div></section>`;
    }
    return `<div class="welcome-row"><div><h2>Formations</h2><p>Gérez les formations proposées aux élèves et les créneaux associés.</p></div>${canManage()?'<button class="btn primary" data-action="new-formation">＋ Ajouter une formation</button>':''}</div><div class="stats-grid">${state.data.formations.map(f=>`<article class="stat-card"><div class="stat-top"><span>${esc(f.code||'FORMATION')}</span><span class="status ${f.active?'active':'completed'}">${f.active?'Active':'Inactive'}</span></div><h3 style="margin-top:15px;line-height:1.45">${esc(f.name)}</h3><p class="muted" style="font-size:11px;line-height:1.6;min-height:35px">${esc(f.description||'Aucune description.')}</p><div class="stat-foot">${state.data.sessions.filter(s=>s.formation_id===f.id).length} créneau(x) · ${state.data.applications.filter(a=>a.formation_id===f.id).length} inscription(s)</div>${canManage()?`<div style="margin-top:15px"><button class="btn outline small" data-action="edit-formation" data-id="${f.id}">Modifier la formation</button></div>`:''}</article>`).join('')||'<div class="empty-state"><h3>Aucune formation</h3></div>'}</div>`;
  }
  function organisationPage(){
    if(!canAdmin())return '<div class="notice-blue">Accès réservé à l’administration.</div>';
    const q=(state.orgFilter?.q||'').toLocaleLowerCase('fr');
    const apps=state.data.applications.filter(a=>a.status==='confirmed'||a.status==='completed').filter(a=>(!q||[a.student_first_name,a.student_last_name,a.college_name,formation(a.formation_id).name,session(a.session_id).teacher_name].some(v=>String(v||'').toLocaleLowerCase('fr').includes(q)))).sort((a,b)=>String(session(a.session_id).date||'').localeCompare(String(session(b.session_id).date||''))||String(a.student_last_name||'').localeCompare(String(b.student_last_name||''),'fr'));
    const yes=v=>{const t=String(v??'').trim().toLowerCase();return ['oui','yes','true','1','présent','avec'].includes(t)?'yes':['non','no','false','0','absent','sans'].includes(t)?'no':'neutral'};
    const chip=v=>`<span class="org-chip ${yes(v)}">${esc(v||'—')}</span>`;
    const rows=apps.map((a,i)=>{const ss=session(a.session_id);const code=String(formation(a.formation_id).code||'').trim().toUpperCase();const badgeClass=code==='CAP PSR'?'org-psr':code==='CAP JP'?'org-jp':code==='CAP MAH'?'org-mah':'org-other';return `<tr class="org-row"><td class="org-check"><input type="checkbox" class="org-select" value="${esc(a.id)}" aria-label="Sélectionner ${esc(a.student_first_name)} ${esc(a.student_last_name)}"></td><td><span class="org-formation ${badgeClass}">${esc(code||'—')}</span></td><td>${dateLabel(ss.date,{day:'2-digit',month:'2-digit',year:'numeric'})}</td><td>${esc(ss.teacher_name||'—')}</td><td><strong>${esc(a.student_last_name)} ${esc(a.student_first_name)}</strong></td><td>${esc(a.college_name||'—')}</td><td>${chip(a.shoe_size)}</td><td>${chip(a.pants_size)}</td><td>${chip(a.top_size)}</td><td>${chip(a.meal)}</td><td>${chip(a.meal_payer)}</td><td>${chip(a.aesh)}</td><td>${chip(a.pai)}</td><td class="org-notes">${esc(a.notes||'—')}</td><td class="org-actions"><button class="btn outline small" data-action="edit-application" data-id="${esc(a.id)}">Modifier</button></td></tr>`}).join('');
    return `<div class="org-screen"><div class="org-title-row"><div><h2>Organisation des mini-stages</h2><p>Gestion de l’accueil des élèves — inscriptions confirmées</p></div><button class="btn primary org-print-button" data-action="print-organisation">▣ Imprimer (A3 paysage)</button></div><div class="org-toolbar"><input id="orgSearch" type="search" placeholder="⌕ Rechercher un élève, un professeur…" value="${esc(state.orgFilter?.q||'')}"><span class="org-count">${apps.length} élève(s)</span></div><div class="org-print-heading"><h2>EREA de Muret — Organisation des mini-stages</h2><p>Édité le ${new Date().toLocaleDateString('fr-FR')}</p></div><div class="org-table-wrap"><table class="org-table"><thead><tr><th rowspan="2" class="org-check"><input id="orgSelectAll" type="checkbox" aria-label="Tout sélectionner"></th><th rowspan="2">Formation</th><th rowspan="2">Date</th><th rowspan="2">Professeur</th><th rowspan="2">Nom – Prénom</th><th rowspan="2">Établissement d’origine</th><th colspan="3">Vêtements</th><th rowspan="2">Repas</th><th rowspan="2">Prise en charge</th><th rowspan="2">AESH</th><th rowspan="2">PAI</th><th rowspan="2">Observation accueil</th><th rowspan="2" class="org-actions">Actions</th></tr><tr><th>Chaussures</th><th>Pantalon</th><th>Haut</th></tr></thead><tbody>${rows||'<tr><td colspan="15" class="empty">Aucune inscription confirmée pour ces critères.</td></tr>'}</tbody></table></div><p class="org-help">Les données proviennent des inscriptions confirmées. Pour modifier une information, utilisez « Modifier » sur la ligne correspondante. Les demandes annulées ou refusées ne sont pas affichées.</p></div>`;
  }

  // Espace lingerie : seules les données nécessaires sont fournies par la RPC sécurisée.
  const lingerieSelected = new Set();
  function selectedLingerieRows(){return (state.lingerieRows||[]).filter(a=>lingerieSelected.has(String(a.application_id)))}
  function downloadLingerieLabels(){
    if(!['lingerie','admin'].includes(state.profile?.role))throw new Error('Accès réservé à la lingerie et à l’administration.');
    const selected=selectedLingerieRows();
    if(!selected.length)throw new Error('Cochez au moins un mini-stage.');
    if(!window.jspdf?.jsPDF)throw new Error('Le module PDF est indisponible. Actualisez la page.');
    const doc=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    const positions=[[12,13],[108,13],[12,155],[108,155]];
    const clean=v=>String(v??'').replace(/[\r\n\t]+/g,' ').trim()||'—';
    const fit=(value,maxWidth,fontSize=14,min=9)=>{let size=fontSize;doc.setFontSize(size);while(size>min&&doc.getTextWidth(clean(value))>maxWidth){size-=0.5;doc.setFontSize(size)}return size};
    selected.forEach((a,i)=>{
      if(i&&i%4===0)doc.addPage();
      const [x,y]=positions[i%4],w=90,h=129;
      doc.setDrawColor(214,219,227);doc.setLineWidth(.4);doc.roundedRect(x,y,w,h,3,3,'S');
      doc.setFillColor(40,40,40);doc.roundedRect(x,y,w,19,3,3,'F');doc.rect(x,y+14,w,5,'F');
      doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text('EREA DE MURET',x+5,y+8);
      doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text('MINI-STAGE  |  LINGERIE',x+5,y+14);
      doc.setTextColor(70,76,89);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('DATE DU MINI-STAGE',x+6,y+28);
      doc.setTextColor(29,36,47);doc.setFontSize(14);doc.text(dateLabel(a.stage_date),x+6,y+36);
      doc.setDrawColor(229,231,235);doc.line(x+6,y+42,x+w-6,y+42);
      doc.setTextColor(70,76,89);doc.setFontSize(9);doc.text('FORMATION',x+6,y+50);
      doc.setTextColor(29,36,47);fit(a.formation_code,w-12,17,11);doc.text(clean(a.formation_code),x+6,y+59);
      doc.setTextColor(70,76,89);doc.setFontSize(9);doc.text('ÉLÈVE',x+6,y+69);
      doc.setTextColor(29,36,47);doc.setFont('helvetica','bold');
      const fullName=clean([a.student_last_name,a.student_first_name].filter(Boolean).join(' '));
      const nameLines=doc.splitTextToSize(fullName,w-12).slice(0,2);
      doc.setFontSize(12);doc.text(nameLines,x+6,y+77);
      doc.setDrawColor(229,231,235);doc.line(x+6,y+94,x+w-6,y+94);
      const labels=[['CHAUSSURES',a.shoe_size],['PANTALON',a.pants_size],['HAUT',a.top_size]];
      const cw=(w-12)/3;
      labels.forEach(([label,value],j)=>{
        const cx=x+6+j*cw;
        doc.setTextColor(88,94,105);doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.text(label,cx,y+103);
        doc.setTextColor(27,37,51);doc.setFontSize(17);doc.text(clean(value),cx,y+116);
      });
      doc.setTextColor(135,140,149);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.text('Préparation des équipements de mini-stage',x+6,y+124);
    });
    doc.save('etiquettes-lingerie-'+iso(today)+'.pdf');
  }
  function lingeriePage(){
    if(!['lingerie','admin'].includes(state.profile?.role))return '<div class="notice-blue">Accès réservé à la lingerie et à l’administration.</div>';if(state.lingerieLoadError)return `<div class="notice-blue">Impossible de charger le tableau Lingerie : ${esc(state.lingerieLoadError)}. Vérifiez que la fonction Supabase get_lingerie_inscriptions autorise le rôle administrateur.</div>`;
    const filter=state.lingerieFilter||'all';
    const rows=(state.lingerieRows||[]).filter(a=>filter==='all'||(filter==='upcoming'?a.stage_date>=iso(today):a.stage_date<iso(today)));
    const round=(v,kind)=>`<span class="lingerie-size ${kind}">${esc(v||'—')}</span>`;
    const body=rows.map(a=>{
      const upcoming=a.stage_date>=iso(today);
      const code=String(a.formation_code||'').trim().toUpperCase().replace(/^CAPA\s+/,'CAP ');
      const color=code==='CAP PSR'?'org-psr':code==='CAP JP'?'org-jp':code==='CAP MAH'?'org-mah':'org-other';
      return `<tr class="lingerie-line ${color}"><td><input type="checkbox" class="lingerie-select" data-id="${esc(a.application_id)}" aria-label="Sélectionner ${esc([a.student_first_name,a.student_last_name].filter(Boolean).join(' '))}" ${lingerieSelected.has(String(a.application_id))?'checked':''}></td><td><span class="lingerie-status ${upcoming?'upcoming':'done'}">${upcoming?'À venir':'Effectué'}</span></td><td>${shortDate(a.stage_date)}</td><td><strong>${esc(a.formation_code||'—')}</strong></td><td><strong>${esc([a.student_first_name,a.student_last_name].filter(Boolean).join(' '))}</strong></td><td>${round(a.shoe_size?'T'+String(a.shoe_size).replace(/^T/i,''):'','shoes')}</td><td>${round(a.pants_size,'pants')}</td><td>${round(a.top_size,'top')}</td><td>${a.returned_at?`<span class="lingerie-returned">Retour validé<br><small>${esc(dateLabel(String(a.returned_at).slice(0,10)))}</small></span>`:`<button class="btn outline small" data-action="lingerie-return" data-id="${esc(a.application_id)}">En attente retour</button>`}</td></tr>`;
    }).join('');
    return `<div class="welcome-row"><div><h2>Inscription — Lingerie</h2><p>Conventions définitives envoyées · ${rows.length} inscription(s)</p></div><label>Statut <select id="lingerieFilter"><option value="all" ${filter==='all'?'selected':''}>Tous</option><option value="upcoming" ${filter==='upcoming'?'selected':''}>À venir</option><option value="done" ${filter==='done'?'selected':''}>Effectué</option></select></label></div><div class="lingerie-label-toolbar"><label><input type="checkbox" id="lingerieSelectAll" aria-label="Sélectionner tous les mini-stages affichés"> Tout sélectionner (filtre actuel)</label><span id="lingerieSelectedCount">${selectedLingerieRows().length} sélectionné(s)</span><button type="button" class="btn primary" data-action="download-lingerie-labels" ${selectedLingerieRows().length?'':'disabled'}>▣ Générer les étiquettes A4 (PDF)</button><small>4 étiquettes par page, plusieurs pages si nécessaire.</small></div><section class="panel data-panel"><div class="table-wrap"><table class="lingerie-table"><thead><tr><th>✓</th><th>Statut</th><th>Date</th><th>Formation</th><th>Élève (nom et prénom)</th><th>Chaussures</th><th>Pantalon</th><th>Haut</th><th>Retour</th></tr></thead><tbody>${body||'<tr><td colspan="9">Aucune convention définitive envoyée pour ce filtre.</td></tr>'}</tbody></table></div></section>`;
  }
  function usersPage(){if(!canAdmin())return '<div class="notice-blue">Cette rubrique est réservée aux administrateurs.</div>';return `<div class="welcome-row"><div><h2>Utilisateurs</h2><p>Consultez les identifiants e-mail et gérez les accès au portail.</p></div><button class="btn primary" data-action="new-user">＋ Ajouter un profil</button></div><div class="notice-blue" style="margin-bottom:16px"><strong>Gestion sécurisée des mots de passe :</strong> les mots de passe existants ne sont jamais consultables, même par l’administrateur. Utilisez « Régénérer / réinitialiser » pour envoyer à l’utilisateur un lien sécurisé lui permettant de choisir un nouveau mot de passe. Les comptes réels sont gérés par Supabase Authentication.</div><section class="panel data-panel"><div class="table-wrap"><table><thead><tr><th>Identifiant (e-mail)</th><th>Organisation</th><th>Rôle</th><th>Statut</th><th>Action</th></tr></thead><tbody>${state.data.users.map(u=>`<tr><td><div class="cell-title">${esc(u.email||'E-mail non renseigné')}</div><div class="cell-sub">${esc(u.full_name||'Sans nom')}</div></td><td>${esc(u.organization||'—')}</td><td>${esc(roleLabel(u.role))}</td><td><span class="status ${u.active===false?'refused':'active'}">${u.active===false?'Désactivé':'Actif'}</span></td><td><div class="row-actions"><button class="btn outline small" data-action="edit-user" data-id="${u.id}">Profil</button>${u.email?`<button class="btn secondary small" data-action="reset-user-password" data-email="${esc(u.email)}">Réinitialiser le mot de passe</button>`:''}</div></td></tr>`).join('')}</tbody></table></div></section>`}
  async function mailDemoRequest(action,settings){
    if(!canAdmin()||state.demo||!db)throw new Error('Connectez-vous en administrateur à Supabase.');
    const {data,error}=await db.functions.invoke('send-guardian-signature-request',{body:{action,settings}});
    if(error)throw new Error(error.message||'Erreur de configuration');
    if(!data?.success)throw new Error(data?.error||'Configuration refusée');
    return data;
  }
  async function loadMailDemo(){
    try{const result=await mailDemoRequest('demo-get');mailDemo.enabled=!!result.settings?.enabled;mailDemo.email=result.settings?.email||'';}
    catch(e){console.warn('Mode de test e-mail indisponible :',e.message)}
  }
  async function saveMailDemo(){
    const enabled=!!$('#mailDemoEnabled')?.checked;
    const email=($('#mailDemoEmail')?.value||'').trim();
    if(enabled&&!/^\S+@\S+\.\S+$/.test(email))throw new Error('Saisissez une adresse e-mail de test valide.');
    const result=await mailDemoRequest('demo-set',{enabled,email});
    mailDemo.enabled=!!result.settings.enabled;mailDemo.email=result.settings.email||'';
    renderPage();toast(mailDemo.enabled?'Redirection de test activée : aucun e-mail de signature ne part aux familles.':'Mode de test désactivé.');
  }
  async function deleteUnreservedSession(id){
    if(!canAdmin())throw new Error('Suppression réservée aux administrateurs.');
    const target=state.data.sessions.find(s=>String(s.id)===String(id));
    if(!target)return;
    // Vérifier toutes les inscriptions, pas seulement celles qui sont confirmées.
    if(state.data.applications.some(a=>String(a.session_id)===String(id))){toast('Suppression impossible : ce créneau possède une inscription ou un historique de réservation.',true);return;}
    if(!window.confirm(`Supprimer définitivement le créneau du ${shortDate(target.date)} ?\nCette action est irréversible.`))return;
    if(state.demo){state.data.sessions=state.data.sessions.filter(s=>String(s.id)!==String(id));saveDemo();}
    else{
      if(!db)throw new Error('Connexion Supabase indisponible.');
      // Vérification en base : un créneau réservé ne doit jamais être supprimé.
      const {data:linked,error:checkError}=await db.from('applications').select('id').eq('session_id',id).limit(1);
      if(checkError)throw new Error('Impossible de vérifier les réservations : '+checkError.message);
      if(linked?.length){toast('Suppression impossible : une réservation existe pour ce créneau.',true);await loadLiveData();renderPage();return;}
      const {data:deleted,error}=await db.from('sessions').delete().eq('id',id).select('id');
      if(error)throw new Error('Suppression refusée par Supabase : '+error.message);
      if(!deleted?.length)throw new Error('Suppression non autorisée par les règles de sécurité Supabase (RLS).');
      await loadLiveData();
    }
    renderPage();toast('Créneau supprimé.');
  }
  function appearancePage(){if(!['college','lingerie'].includes(state.profile?.role))return '<div class="notice-blue">Accès non autorisé.</div>';return `<div class="welcome-row"><div><h2>Paramètres</h2><p>Personnalisez l’affichage de votre espace.</p></div></div><div class="settings-grid"><section class="settings-card"><h3>Affichage</h3><p>Choisissez le thème sur cet appareil.</p><label for="adminThemeSelect">Mode d’affichage</label><select id="adminThemeSelect"><option value="light" ${document.documentElement.dataset.theme!=='dark'?'selected':''}>Mode clair</option><option value="dark" ${document.documentElement.dataset.theme==='dark'?'selected':''}>Mode sombre</option></select></section></div>`}
  function settingsPage(){if(!canAdmin())return '<div class="notice-blue">Cette rubrique est réservée aux administrateurs.</div>';return `<div class="welcome-row"><div><h2>Paramètres</h2><p>Configuration et outils d’administration du portail.</p></div></div><div class="settings-grid"><section class="settings-card"><h3>Affichage</h3><p>Choisissez le thème de l’application sur cet appareil.</p><label for="adminThemeSelect">Mode d’affichage</label><select id="adminThemeSelect"><option value="light" ${document.documentElement.dataset.theme!=='dark'?'selected':''}>Mode clair</option><option value="dark" ${document.documentElement.dataset.theme==='dark'?'selected':''}>Mode sombre</option></select></section><section class="settings-card"><h3>État de l’application</h3><p>${state.demo?'Le portail fonctionne en mode démonstration. Les changements restent dans le navigateur utilisé.':'Le portail est connecté à Supabase.'}</p><span class="status ${state.demo?'pending':'active'}">${state.demo?'Mode démonstration':'Backend connecté'}</span></section><section class="settings-card"><h3>Exporter les inscriptions</h3><p>Téléchargez les inscriptions au format CSV compatible avec Excel. Les dates, contacts et statuts sont inclus.</p><button class="btn outline" data-action="export-apps">⇩ Télécharger le CSV</button></section><section class="settings-card"><h3>Base de données</h3><p>La base en ligne utilise Supabase. Les accès doivent être protégés par les politiques RLS fournies dans le fichier <code>supabase/schema.sql</code>.</p><button class="btn outline" data-action="show-setup">Voir les informations de configuration</button></section><section class="settings-card"><h3>Confidentialité</h3><p>Les données des élèves sont personnelles. Ne stockez que les informations nécessaires, limitez les accès et définissez une durée de conservation. Validez le traitement avec le délégué à la protection des données de votre académie avant une mise en production.</p></section><section class="settings-card"><h3>Identité de l’établissement</h3><p>Importez les fichiers JPEG utilisés dans la convention. Le logo apparaît en haut à gauche ; la signature d’accueil est appliquée aux nouvelles conventions confirmées après autorisation.</p><div class="branding-field"><label for="schoolLogoFile"><strong>Logo établissement (.jpg / .jpeg)</strong></label><input id="schoolLogoFile" type="file" accept="image/jpeg,.jpg,.jpeg"><div class="branding-preview">${branding.logo?`<img src="${branding.logo}" alt="Logo enregistré">`:'Aucun logo enregistré'}</div><button class="btn outline" data-action="upload-branding" data-kind="logo">Enregistrer le logo</button></div><div class="branding-field"><label for="schoolSignatureFile"><strong>Signature établissement d’accueil (.jpg / .jpeg)</strong></label><input id="schoolSignatureFile" type="file" accept="image/jpeg,.jpg,.jpeg"><div class="branding-preview">${branding.hostSignature?`<img src="${branding.hostSignature}" alt="Signature enregistrée">`:'Aucune signature enregistrée'}</div><button class="btn outline" data-action="upload-branding" data-kind="host_signature">Enregistrer la signature</button></div><p class="tiny muted">Réservé à l’administrateur. L’import d’une signature ne signe pas rétroactivement les conventions existantes. Utilisez uniquement une image dont l’usage a été expressément autorisé par le chef d’établissement.</p></section><section class="settings-card"><h3>Chef ou cheffe d’établissement</h3><p>Nom affiché dans la rubrique Informations d’accueil des conventions.</p><input id="headNameInput" type="text" value="${esc(branding.headName||'')}" placeholder="Prénom NOM"><button class="btn primary" data-action="save-head-name">Enregistrer le nom</button></section><section class="settings-card"><h3>Professeurs (sans compte utilisateur)</h3><p>Répertoire interne des enseignants pour les créneaux. Ces noms ne donnent aucun accès à l’application.</p><div class="teacher-directory-list">${(state.data.teachers||[]).map(t=>`<div class="teacher-directory-row"><span><strong>${esc(t.full_name)}</strong> ${t.active===false?'<small class="muted">(inactif)</small>':''}</span><span><button class="btn outline small" data-action="edit-teacher" data-id="${esc(t.id)}">Modifier</button> <button class="btn outline small" data-action="toggle-teacher" data-id="${esc(t.id)}">${t.active===false?'Activer':'Désactiver'}</button> <button class="btn outline small" data-action="delete-teacher" data-id="${esc(t.id)}">Supprimer</button></span></div>`).join('')||'<p class="muted">Aucun professeur enregistré.</p>'}</div><button class="btn primary" data-action="new-teacher">＋ Ajouter un professeur</button><p class="tiny muted">Désactiver un nom le retire des nouveaux créneaux, sans modifier les créneaux déjà enregistrés.</p></section><section class="settings-card" style="grid-column:1/-1"><h3>Annuaire des établissements ajoutés</h3><p>Ajoutez uniquement les établissements absents de l’annuaire officiel. Les fiches officielles ne sont jamais modifiables. L’e-mail reste modifiable lors de la création d’un compte.</p><div id="customSchoolDirectory">${customSchools.map(s=>`<div class="teacher-directory-row"><span><strong>${esc(s.name)}</strong><small class="muted"> — ${esc(s.city)} · ${esc(s.uai)} · ${esc(s.type)}</small></span><span><button class="btn outline small" data-action="edit-custom-school" data-id="${esc(s.uai)}">Modifier</button> <button class="btn outline small" data-action="delete-custom-school" data-id="${esc(s.uai)}">Supprimer</button></span></div>`).join('')||'<p class="muted">Aucun établissement ajouté manuellement.</p>'}</div><button class="btn primary" data-action="new-custom-school">＋ Ajouter un établissement</button><p class="tiny muted">La table Supabase « ministages_custom_schools » doit être installée avec le script SQL fourni.</p></section><section class="settings-card"><h3>Test des e-mails de signature</h3><p>En mode test, les demandes de signature sont envoyées <strong>uniquement</strong> à l'adresse indiquée, jamais aux familles. Utilisez exclusivement des inscriptions fictives. Le lien signe néanmoins le dossier sélectionné dans Supabase.</p><label class="branding-field"><input type="checkbox" id="mailDemoEnabled" ${mailDemo.enabled?'checked':''}> Activer la redirection des e-mails</label><label for="mailDemoEmail">Adresse e-mail de test</label><input type="email" id="mailDemoEmail" value="${esc(mailDemo.email)}" placeholder="test@exemple.fr" autocomplete="off"><p class="tiny muted">L'objet des messages est préfixé [DÉMONSTRATION]. Les e-mails de convention finale sont aussi redirigés vers cette adresse.</p><button class="btn primary" data-action="save-mail-demo">Enregistrer le mode test</button></section></div>`}
  async function loadBranding(){
    branding.logo=null;branding.hostSignature=null;branding.headName='';
    if(state.demo){branding.logo=localStorage.getItem('ministages-demo-logo')||null;branding.hostSignature=localStorage.getItem('ministages-demo-signature')||null;return}
    if(!db)return;
    // Requêtes indépendantes exécutées en parallèle ; mêmes contrôles d'accès et résultats.
    const [headResult,logoResult,signatureResult]=await Promise.all([
      db.from('ministages_settings').select('value').eq('key','head_name').maybeSingle(),
      db.rpc('get_convention_logo'),
      canAdmin()?db.from('institution_assets').select('asset_key,image_data').eq('asset_key','host_signature').maybeSingle():Promise.resolve(null)
    ]);
    branding.headName=headResult?.data?.value||'';
    if(!logoResult?.error&&typeof logoResult?.data==='string'&&logoResult.data.startsWith('data:image/jpeg;base64,'))branding.logo=logoResult.data;
    if(!signatureResult?.error&&signatureResult?.data?.image_data)branding.hostSignature=signatureResult.data.image_data;
  }
  function readJpeg(file){return new Promise((resolve,reject)=>{
    if(!file||!['image/jpeg'].includes(file.type)||!/\.jpe?g$/i.test(file.name))return reject(new Error('Choisissez un fichier JPEG (.jpg ou .jpeg).'));
    if(file.size>650000)return reject(new Error('Le JPEG doit peser moins de 650 Ko. Réduisez sa taille puis réessayez.'));
    const reader=new FileReader();reader.onerror=()=>reject(new Error('Lecture du fichier impossible.'));
    reader.onload=()=>{const data=String(reader.result||'');if(!data.startsWith('data:image/jpeg;base64,'))return reject(new Error('Fichier JPEG invalide.'));
      const img=new Image();img.onerror=()=>reject(new Error('Image JPEG illisible.'));img.onload=()=>{if(img.width<20||img.height<10||img.width>5000||img.height>5000)return reject(new Error('Dimensions du JPEG non prises en charge.'));resolve(data)};img.src=data;
    };reader.readAsDataURL(file);
  })}
  async function uploadBranding(kind){
    if(!canAdmin())throw new Error('Accès réservé à l’administrateur.');
    const file=$((kind==='logo'?'#schoolLogoFile':'#schoolSignatureFile'))?.files?.[0];
    const image=await readJpeg(file);
    if(kind==='host_signature'&&!window.confirm('Je confirme que le chef d’établissement a autorisé l’utilisation de cette image pour signer les futures conventions confirmées. Continuer ?'))return;
    if(state.demo){localStorage.setItem(kind==='logo'?'ministages-demo-logo':'ministages-demo-signature',image)}
    else {const {error}=await db.from('institution_assets').upsert({asset_key:kind,image_data:image,updated_by:state.user.id},{onConflict:'asset_key'});if(error)throw error}
    await loadBranding();renderPage();toast(kind==='logo'?'Logo enregistré.':'Signature enregistrée pour les futures confirmations.');
  }
  let customSchoolsLoaded=false;
  async function refreshCustomSchoolsOnSettings(){if(!canAdmin()||customSchoolsLoaded)return;customSchoolsLoaded=true;try{await loadCustomSchools();if(state.page==='settings')renderPage()}catch(err){customSchoolsLoaded=false;console.warn(err.message)}}
  function bindPageEvents(){
    if(state.page==='settings')void refreshCustomSchoolsOnSettings();
    const dashFilter=$('#v10FormationFilter');if(dashFilter)dashFilter.addEventListener('change',e=>{window.miniStageDashboardFilter=e.target.value;renderPage()});
    $$('#pageContent [data-dash-formation]').forEach(el=>el.addEventListener('click',()=>{window.miniStageDashboardFilter=el.dataset.dashFormation;renderPage()}));
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      $$('#pageContent .v10-count').forEach(el=>{const target=Number(el.dataset.count)||0;const duration=750;const start=performance.now();const step=now=>{if(!el.isConnected)return;const t=Math.min(1,(now-start)/duration);el.textContent=String(Math.round(target*(1-Math.pow(1-t,3))));if(t<1)requestAnimationFrame(step)};requestAnimationFrame(step)});
    }
const themeToggle=$('#topThemeToggle');if(themeToggle&&!themeToggle.dataset.bound){themeToggle.dataset.bound='1';themeToggle.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'))} const topSearch=$('#globalSearch');if(topSearch&&!topSearch.dataset.bound){topSearch.dataset.bound='1';topSearch.addEventListener('keydown',e=>{if(e.key==='Enter'){state.filters.q=topSearch.value;setPage('applications')}})}  $$('#pageContent [data-view]').forEach(b=>b.addEventListener('click',()=>{window.miniStageAppView=b.dataset.view;renderPage()}));  $('#adminThemeSelect')?.addEventListener('change',e=>applyTheme(e.target.value)); $$('#pageContent [data-page]').forEach(el=>el.addEventListener('click',()=>setPage(el.dataset.page)));$('#appSearch')?.addEventListener('input',e=>scheduleReservationSearch(e.target,'q'));$('#statusFilter')?.addEventListener('change',e=>{state.filters.status=e.target.value;renderPage()});$('#originReservationSearch')?.addEventListener('input',e=>scheduleReservationSearch(e.target,'originQ'));$$('#pageContent [data-stage-status]').forEach(el=>el.addEventListener('change',async e=>{const id=e.currentTarget.dataset.stageStatus;try{if(!canManage())throw new Error('Modification réservée à l’équipe pédagogique.');const current=state.data.applications.find(a=>a.id===id);if(!current)throw new Error('Inscription introuvable.');if(current.stage_report?.validated_at)throw new Error('Statut verrouillé : compte rendu définitif déjà généré.');await persist('applications',{stage_status:e.currentTarget.value},id);renderPage();toast('État du mini-stage enregistré.')}catch(err){toast('Enregistrement impossible : '+(err.message||'erreur'),true);renderPage()}}));$('#orgSearch')?.addEventListener('input',e=>{state.orgFilter={...(state.orgFilter||{}),q:e.target.value};renderPage();const n=$('#orgSearch');n?.focus();n?.setSelectionRange(n.value.length,n.value.length)});$('#orgSelectAll')?.addEventListener('change',e=>$$('.org-select').forEach(x=>x.checked=e.target.checked));v78BindFilters() }
  let modalInitialState = '';
  function modalFormState(){const modal=$('#modalRoot .modal');if(!modal)return '';return JSON.stringify($$('input,select,textarea',modal).map(el=>({name:el.name||el.id||'',type:el.type||el.tagName,value:el.value,checked:!!el.checked,files:el.type==='file'?Array.from(el.files||[],f=>({name:f.name,size:f.size,lastModified:f.lastModified})):undefined})));}
  function hasUnsavedModalChanges(){return !!$('#modalRoot .modal') && modalInitialState!==modalFormState();}
  function openModal(title,body,foot=''){ clearConventionPreview(); $('#modalRoot').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="modal-head"><h3>${esc(title)}</h3><button type="button" class="icon-btn" data-action="close-modal" aria-label="Fermer" title="Fermer la fenêtre">×</button></header><div class="modal-body">${body}</div>${foot?`<footer class="modal-foot">${foot}</footer>`:''}</section></div>`;const backdrop=$('#modalRoot .modal-backdrop');const modal=$('#modalRoot .modal');backdrop.addEventListener('click',e=>{if(e.target===backdrop){/* V47 : un clic hors fenêtre ne ferme jamais une saisie en cours. */}});$('#modalRoot form')?.addEventListener('submit',e=>e.preventDefault());modalInitialState=modalFormState();}
  function closeModal(){ $('#modalRoot').innerHTML='';modalInitialState='';clearConventionPreview();}
  function requestCloseModal(){const signatureInProgress=($('#guardianSignatureCanvas')&&signatureCanvasDirty)||($('#originSignatureCanvas')&&window.originSignatureDirty);if((hasUnsavedModalChanges()||signatureInProgress)&&!window.confirm('Des modifications ou une signature ne sont pas enregistrées. Voulez-vous les abandonner et fermer cette fenêtre ?'))return;closeModal();}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#modalRoot .modal')){e.preventDefault();requestCloseModal()}});
  function field(label,name,value='',type='text',extra=''){return `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`}
  function selectField(label,name,options,value=''){return `<label>${label}<select name="${name}" required>${options.map(o=>`<option value="${esc(o.value)}" ${o.value===value?'selected':''}>${esc(o.label)}</option>`).join('')}</select></label>`}
  function optionalSelectField(label,name,options,value=''){return `<label>${label}<select name="${name}"><option value="">— Non renseigné —</option>${options.map(o=>`<option value="${esc(o.value)}" ${o.value===value?'selected':''}>${esc(o.label)}</option>`).join('')}</select></label>`}
  function openFormationForm(id){if(!canManage())return;const f=id?state.data.formations.find(x=>x.id===id):{name:'',code:'',description:'',active:true};openModal(id?'Modifier la formation':'Nouvelle formation',`<form id="entityForm"><div class="form-grid">${field('Nom de la formation *','name',f.name,'text','required')}${field('Code court','code',f.code)}<label class="span-2">Description<textarea name="description">${esc(f.description||'')}</textarea></label><label class="span-2">Statut<select name="active"><option value="true" ${f.active?'selected':''}>Active</option><option value="false" ${!f.active?'selected':''}>Inactive</option></select></label></div></form>`,`<button type="button" class="btn outline" data-action="close-modal">Annuler</button><button class="btn primary" data-action="save-formation" data-id="${id||''}">Enregistrer</button>`)}
  // Création de créneaux récurrents : aperçu modifiable avant toute écriture.
  let bulkExcluded = new Set();
  function bulkDates(form){
    const d=Object.fromEntries(new FormData(form));
    if(!d.first_date||!d.last_date||d.first_date>d.last_date)throw new Error('Vérifiez les dates de début et de fin.');
    const first=new Date(d.first_date+'T12:00:00'),last=new Date(d.last_date+'T12:00:00');
    if((last-first)/86400000>370)throw new Error('La période ne peut pas dépasser 12 mois.');
    if(!d.start_time||!d.end_time||d.start_time>=d.end_time)throw new Error('Les horaires de fin doivent être après ceux du début.');
    const today=iso(new Date()),dates=[];
    for(let date=new Date(first);date<=last;date.setDate(date.getDate()+1)){
      if(date.getDay()!==Number(d.weekday))continue;
      const value=iso(date);
      if(value<today)continue;
      const duplicate=state.data.sessions.some(s=>s.date===value&&s.formation_id===d.formation_id&&s.start_time===d.start_time&&s.end_time===d.end_time);
      dates.push({date:value,duplicate});
    }
    return {d,dates};
  }
  function openBulkSessions(){
    if(!canManage())return;
    bulkExcluded=new Set();
    const teacherOptions=(state.data.teachers||[]).filter(u=>u.active!==false).map(u=>({value:u.full_name,label:u.full_name}));
    const start=plusDays(1),end=plusDays(60);
    openModal('Créer plusieurs créneaux',`<form id="bulkSessionsForm" class="stack"><div class="form-grid">${selectField('Formation *','formation_id',state.data.formations.filter(f=>f.active!==false).map(f=>({value:f.id,label:f.name})),state.data.formations[0]?.id||'')}${optionalSelectField('Professeur','teacher_name',teacherOptions,'')}${field('Du *','first_date',start,'date','required')}${field('Au *','last_date',end,'date','required')}<label>Jour de la semaine<select name="weekday">${['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((n,i)=>`<option value="${i}" ${i===4?'selected':''}>${n}</option>`).join('')}</select></label><label>Places par créneau<select name="capacity"><option value="1">1 place</option><option value="2">2 places</option></select></label>${field('Début *','start_time','09:00','time','required')}${field('Fin *','end_time','16:00','time','required')}${field('Lieu','location','EREA de Muret')}<label>Statut<select name="active"><option value="true">Ouvert</option><option value="false">Fermé</option></select></label></div><label>Informations pratiques<textarea name="notes"></textarea></label><p class="muted tiny">Les créneaux passés et les doublons (formation, date, horaires) sont exclus. Décochez les dates à éviter, notamment les vacances scolaires et jours fériés.</p><div id="bulkPreview" class="bulk-preview"></div></form>`,`<button class="btn outline" data-action="close-modal">Annuler</button><button class="btn outline" data-action="preview-bulk-sessions">Actualiser l'aperçu</button><button class="btn primary" data-action="save-bulk-sessions">Créer les créneaux sélectionnés</button>`);
    $('#bulkSessionsForm').addEventListener('change',()=>{bulkExcluded=new Set();renderBulkPreview()});
    renderBulkPreview();
  }
  function renderBulkPreview(){
    const root=$('#bulkPreview'),form=$('#bulkSessionsForm');if(!root||!form)return;
    try{
      const {dates}=bulkDates(form),eligible=dates.filter(x=>!x.duplicate&&!bulkExcluded.has(x.date));
      root.innerHTML=`<strong>${eligible.length} créneau(x) à créer</strong> <span class="muted tiny">(${dates.filter(x=>x.duplicate).length} doublon(s) ignoré(s))</span><div class="bulk-dates">${dates.map(x=>`<label class="bulk-date"><input type="checkbox" data-bulk-date="${x.date}" ${!x.duplicate&&!bulkExcluded.has(x.date)?'checked':''} ${x.duplicate?'disabled':''}><span>${dateLabel(x.date,{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}</span>${x.duplicate?'<small>Déjà existant</small>':''}</label>`).join('')||'<p>Aucune date future pour ce jour de semaine.</p>'}</div>`;
      root.querySelectorAll('[data-bulk-date]').forEach(input=>input.addEventListener('change',e=>{const date=e.target.dataset.bulkDate;if(e.target.checked)bulkExcluded.delete(date);else bulkExcluded.add(date);const count=dates.filter(x=>!x.duplicate&&!bulkExcluded.has(x.date)).length;root.querySelector('strong').textContent=count+' créneau(x) à créer'}));
    }catch(e){root.textContent=e.message}
  }
  async function saveBulkSessions(){
    if(!canManage())throw new Error('Accès non autorisé.');
    const form=$('#bulkSessionsForm');if(!form||!form.reportValidity())return;
    const {d,dates}=bulkDates(form),selected=dates.filter(x=>!x.duplicate&&!bulkExcluded.has(x.date));
    if(!selected.length)throw new Error('Aucune date à créer.');
    if(!window.confirm(`Créer ${selected.length} créneau(x) ?`))return;
    const button=$('[data-action="save-bulk-sessions"]');if(button){button.disabled=true;button.textContent='Création en cours…'}
    let created=0;const errors=[];
    try{
      for(const item of selected){
        const row={formation_id:d.formation_id,date:item.date,start_time:d.start_time,end_time:d.end_time,capacity:Number(d.capacity),teacher_name:d.teacher_name||'',location:d.location||'EREA de Muret',notes:d.notes||'',active:d.active==='true'};
        try{await persist('sessions',row,null);created++}catch(e){errors.push(`${item.date} : ${e.message}`)}
      }
      closeModal();renderPage();toast(`${created} créneau(x) créé(s).${errors.length?' '+errors.length+' échec(s).':''}`,!!errors.length);
      if(errors.length)window.alert('Créneaux non créés :\n'+errors.join('\n'));
    }finally{if(button){button.disabled=false;button.textContent='Créer les créneaux sélectionnés'}}
  }
  function openSessionForm(id){if(!canManage())return;const s=id?state.data.sessions.find(x=>x.id===id):{formation_id:state.data.formations[0]?.id||'',date:plusDays(14),start_time:'09:00',end_time:'16:00',capacity:1,teacher_name:'',location:'EREA de Muret',notes:'',active:true};const teacherOptions=(state.data.teachers||[]).filter(u=>u.active!==false).map(u=>({value:u.full_name,label:u.full_name}));openModal(id?'Modifier le créneau':'Nouveau créneau',`<form id="entityForm"><div class="form-grid">${selectField('Formation *','formation_id',state.data.formations.filter(f=>f.active!==false).map(f=>({value:f.id,label:f.name})),s.formation_id)}${field('Date *','date',s.date,'date','required')}${field('Heure de début','start_time',s.start_time,'time')}${field('Heure de fin','end_time',s.end_time,'time')}<label>Nombre de places *<select name="capacity" required><option value="1" ${Number(s.capacity||1)===1?'selected':''}>1 place</option><option value="2" ${Number(s.capacity)===2?'selected':''}>2 places</option></select><small class="muted">Un créneau accueille 1 élève par défaut, 2 au maximum.</small></label>${optionalSelectField('Professeur de la séance','teacher_name',teacherOptions,s.teacher_name||'')}${field('Lieu','location',s.location)}<label class="span-2">Informations pratiques<textarea name="notes">${esc(s.notes||'')}</textarea></label><label class="span-2">Statut<select name="active"><option value="true" ${s.active?'selected':''}>Ouvert aux inscriptions</option><option value="false" ${!s.active?'selected':''}>Fermé</option></select></label></div>${!teacherOptions.length?'<p class="notice-blue" style="margin-top:12px">Aucun professeur paramétré. Ajoutez les professeurs dans « Paramètres → Professeurs » (sans créer de compte).</p>':''}</form>`,`<button type="button" class="btn outline" data-action="close-modal">Annuler</button><button class="btn primary" data-action="save-session" data-id="${id||''}">Enregistrer</button>`)}
  // V71 : annuaire complémentaire distinct du référentiel officiel.
  let customSchools=[];
  async function loadCustomSchools(){
    if(!db)return [];
    const {data,error}=await db.from('ministages_custom_schools').select('uai,name,type,city,address,phone,email,siret').order('name');
    if(error)throw new Error('Annuaire complémentaire : '+error.message+' (exécuter le SQL V71 dans Supabase)');
    customSchools=data||[];return customSchools;
  }
  function customSchoolForm(uai=''){
    if(!canAdmin())return;
    const s=customSchools.find(x=>x.uai===uai)||{uai:'',name:'',type:'Collège',city:'',address:'',phone:'',email:'',siret:''};
    const f=(label,name,type='text',required=false)=>`<label>${label}<input name="${name}" type="${type}" value="${esc(s[name]||'')}" ${required?'required':''} ${name==='uai'&&uai?'readonly':''}></label>`;
    openModal(uai?'Modifier un établissement ajouté':'Ajouter un établissement',`<form id="customSchoolForm" class="form-grid">${f('Code UAI *','uai','text',true)}${f('Nom officiel *','name','text',true)}<label>Type *<select name="type">${['Collège','Lycée général et technologique','Lycée professionnel','EREA','Autre'].map(t=>`<option ${s.type===t?'selected':''}>${t}</option>`).join('')}</select></label>${f('Commune *','city','text',true)}${f('Adresse','address')}${f('Téléphone','phone','tel')}<label>SIRET (14 chiffres)<input name="siret" type="text" inputmode="numeric" maxlength="14" pattern="[0-9]{14}" placeholder="14 chiffres" value="${esc(s.siret||'')}"><small class="tiny muted">Facultatif ; prérempli lors de la création du compte.</small></label>${f('E-mail (facultatif)','email','email')}</form>`,`<button class="btn outline" data-action="close-modal">Annuler</button><button class="btn primary" data-action="save-custom-school" data-id="${esc(uai)}">Enregistrer</button>`);
  }
  async function saveCustomSchool(originalUai){
    if(!canAdmin()||!db)throw new Error('Administrateur connecté requis.');
    const form=$('#customSchoolForm');if(!form?.reportValidity())return;
    const d=Object.fromEntries(new FormData(form));d.uai=d.uai.trim().toUpperCase();d.name=d.name.trim();d.city=d.city.trim();d.email=d.email.trim();d.siret=String(d.siret||'').trim();
    if(d.siret&&!/^\d{14}$/.test(d.siret))throw new Error('Le SIRET doit comporter exactement 14 chiffres.');
    if(!/^[0-9]{7}[A-Z]$/.test(d.uai))throw new Error('Code UAI invalide : 7 chiffres et une lettre.');
    if(!originalUai){const official=await loadToulouseAcademySchools();if(official.some(x=>x.uai===d.uai))throw new Error('Cet UAI existe dans l’annuaire officiel, qui ne peut pas être modifié.');}
    const {error}=await db.from('ministages_custom_schools').upsert(d,{onConflict:'uai'});if(error)throw error;
    await loadCustomSchools();customSchoolsLoaded=true;academySchoolsCache=null;closeModal();renderPage();toast('Établissement enregistré dans l’annuaire complémentaire.');
  }
  async function deleteCustomSchool(uai){
    if(!canAdmin()||!db)throw new Error('Administrateur connecté requis.');
    if(!window.confirm('Supprimer cet établissement ajouté manuellement ? Les comptes déjà créés ne seront pas supprimés.'))return;
    const {error}=await db.from('ministages_custom_schools').delete().eq('uai',uai);if(error)throw error;
    await loadCustomSchools();academySchoolsCache=null;renderPage();toast('Établissement retiré de l’annuaire complémentaire.');
  }
  let academySchoolsCache=null;
  let signupVisibleSchools=[];
  const normalizeSearch=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').trim();
  async function loadToulouseAcademySchools(){
    if(academySchoolsCache)return academySchoolsCache;
    const base='https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records';
    const where=encodeURIComponent("code_academie='16' AND etat='OUVERT'");
    const all=[];
    for(let offset=0;offset<5000;offset+=100){
      const url=`${base}?where=${where}&limit=100&offset=${offset}&order_by=nom_etablissement`;
      const response=await fetch(url);if(!response.ok)throw new Error('Annuaire officiel indisponible');
      const json=await response.json();const records=json.results||[];all.push(...records);
      if(records.length<100||(Number.isFinite(json.total_count)&&all.length>=json.total_count))break;
    }
    const relevant=all.map(r=>{
      const name=r.nom_etablissement||'';const type=r.type_etablissement||'';const searchable=normalizeSearch(`${name} ${type} ${r.denomination_principale||''}`);
      const isRelevant=searchable.includes('college')||searchable.includes('lycee')||searchable.includes('erea')||searchable.includes('etablissement regional d enseignement adapte');
      return {uai:r.identifiant_de_l_etablissement||r.code_uai||'',name,type,address:[r.adresse_1,r.adresse_2,r.adresse_3,r.code_postal,r.nom_commune].filter(Boolean).join(', '),city:r.nom_commune||'',phone:r.telephone||'',email:String(r.mail||'').trim(),siret:String(r.siren_siret||r.siret||r.numero_siret||'').replace(/\D/g,'')};
    }).filter(s=>s.name&&s.uai&&all.some(r=>(r.identifiant_de_l_etablissement||r.code_uai)===s.uai)&& (normalizeSearch(`${s.name} ${s.type}`).includes('college')||normalizeSearch(`${s.name} ${s.type}`).includes('lycee')||normalizeSearch(`${s.name} ${s.type}`).includes('erea')||normalizeSearch(`${s.name} ${s.type}`).includes('etablissement regional d enseignement adapte')));
    const unique=new Map();for(const school of relevant)unique.set(school.uai,school);
    // Ne jamais écraser les fiches officielles avec des fiches complémentaires.
    try{const manual=await loadCustomSchools();for(const school of manual){if(!unique.has(school.uai))unique.set(school.uai,school)}}catch(err){console.warn(err.message)}
    academySchoolsCache=[...unique.values()].sort((a,b)=>a.name.localeCompare(b.name,'fr'));
    return academySchoolsCache;
  }
  function renderSignupSchoolOptions(query=''){
    const list=$('#signupSchoolResults'),input=$('#signupSchoolSearch');if(!list||!input)return;
    const q=normalizeSearch(query).trim();
    signupVisibleSchools=q?(academySchoolsCache||[]).filter(s=>normalizeSearch(`${s.name} ${s.city} ${s.uai} ${s.type}`).includes(q)).slice(0,40):[];
    list.innerHTML=q?(signupVisibleSchools.length?signupVisibleSchools.map(s=>`<button type="button" class="signup-school-choice" role="option" data-school-uai="${esc(s.uai)}"><strong>${esc(s.name)}</strong><small>${esc(s.city)} · ${esc(s.uai)}</small></button>`).join(''):'<p class="tiny muted">Aucun établissement correspondant.</p>'):'';
    list.classList.toggle('hidden',!q);input.setAttribute('aria-expanded',String(!!q));
    if(window.selectedSignupSchool&&q!==normalizeSearch(window.selectedSignupSchool.name)){
      window.selectedSignupSchool=null;$('#signupOrganization').value='';$('#signupSiret').value='';$('#signupEmail').value='';++signupAccountCheckId;showSignupAccountStatus('');
    }
  }
  async function initSignupSchoolDirectory(){
    const input=$('#signupSchoolSearch'),help=$('#signupSchoolHelp');if(!input)return;
    try{const schools=await loadToulouseAcademySchools();input.disabled=false;
      if(help)help.textContent=`${schools.length} établissements disponibles. Saisissez quelques lettres puis cliquez sur le bon établissement.`;
      renderSignupSchoolOptions(input.value);
    }catch(error){if(help)help.textContent='Annuaire indisponible : réessayez plus tard. Aucun établissement ne peut être sélectionné pour le moment.';}
  }
  // V22 : résolution du SIRET pendant la création du compte, avant l'inscription.
  let signupSiretRequest=0;
  // V23 : la sélection de l'annuaire académique déclenche une résolution automatique.
  // La table UAI-SIRET est prioritaire ; sinon on interroge l'API publique des entreprises.
  // Aucun numéro n'est attribué si plusieurs établissements restent plausibles.
  async function resolveSignupSiret(school){
    const request=++signupSiretRequest;
    const input=$('#signupSiret'),help=$('#signupSiretHelp');
    if(!input||!help)return;
    input.value='';input.readOnly=true;
    if(!school?.uai){help.textContent='Sélectionnez un établissement dans l’annuaire.';return;}
    const stillCurrent=()=>request===signupSiretRequest&&window.selectedSignupSchool?.uai===school.uai&&input.isConnected;
    help.textContent='Recherche automatique du SIRET de '+school.name+' ('+school.city+')…';
    const setFound=(number,source)=>{
      if(!stillCurrent())return;
      input.value=number;input.readOnly=true;
      help.textContent='SIRET prérempli automatiquement ('+source+'). Il sera enregistré avec votre compte.';
      void checkSignupSchoolAccount(school);
    };
    try{
      if(db){
        const {data,error}=await db.from('school_siret_directory').select('siret').eq('uai',school.uai).maybeSingle();
        if(!stillCurrent())return;
        if(!error&&/^\d{14}$/.test(String(data?.siret||''))){setFound(String(data.siret),'correspondance UAI–SIRET');return;}
      }
      // Le champ officiel du jeu de données est siren_siret, non siret.
      if(/^\d{14}$/.test(String(school.siret||''))){setFound(String(school.siret),'annuaire de l’Éducation nationale');return;}
      let official=null;
      try{official=await officialSiretByUai(school.uai)}catch(error){console.warn('Annuaire Education nationale SIRET:',error)}
      if(!stillCurrent())return;
      if(official){setFound(official.siret,'annuaire officiel — code UAI exact');return;}
      help.textContent='Recherche dans l’annuaire des entreprises avec vérification du code UAI…';
      const enterprise=await enterpriseSiretByUai(school);
      if(!stillCurrent())return;
      if(enterprise){setFound(enterprise.siret,'annuaire des entreprises — code UAI exact');void rememberSchoolSiret(school,enterprise.siret);return;}
      input.readOnly=false;
      help.textContent='Aucun SIRET vérifié pour cet UAI. Renseignez-le une seule fois.';
    }catch(e){
      if(!stillCurrent())return;
      input.readOnly=false;
      help.textContent='Recherche automatique indisponible : renseignez le SIRET officiel une seule fois. '+(e.message||'');
    }
  }
  // V64 : le contrôle est effectué dès la sélection, puis après résolution du SIRET.
  let signupAccountCheckId=0;
  let signupAccountBlocked=true;
  const existingAccountMessage='Un compte existe déjà pour cet établissement. Veuillez vous connecter ou utiliser « Mot de passe oublié ? ».';
  function showSignupAccountStatus(message='',isDuplicate=false){
    const el=$('#signupExistingAccount'),btn=$('#signupForm button[type="submit"]');
    if(el){el.classList.toggle('hidden',!message);el.textContent=message;}
    signupAccountBlocked=!!message;
    if(btn)btn.disabled=signupAccountBlocked;
  }
  async function checkSignupSchoolAccount(school){
    const checkId=++signupAccountCheckId;
    if(!school?.uai||!db){showSignupAccountStatus('Vérification du compte indisponible. Réessayez plus tard.');return;}
    showSignupAccountStatus('Vérification de l’existence d’un compte…');
    try{
      const {data,error}=await db.rpc('ministages_school_account_exists',{
        school_uai:school.uai,
        school_siret:String($('#signupSiret')?.value||'').trim(),
        school_name:school.name
      });
      if(checkId!==signupAccountCheckId||window.selectedSignupSchool?.uai!==school.uai)return;
      if(error)throw error;
      showSignupAccountStatus(data?existingAccountMessage:'');
    }catch(error){
      if(checkId!==signupAccountCheckId)return;
      console.warn('Vérification établissement :',error);
      showSignupAccountStatus('Impossible de vérifier si un compte existe déjà. Contactez l’administrateur.');
    }
  }
  function selectSignupSchool(uai){
    const school=(academySchoolsCache||[]).find(s=>s.uai===uai);if(!school)return;
    $('#signupOrganization').value=school.name;
    $('#signupSchoolSearch').value=school.name;
    $('#signupSchoolResults').classList.add('hidden');
    $('#signupSchoolSearch').setAttribute('aria-expanded','false');
    window.selectedSignupSchool={name:school.name,city:school.city||'',address:school.address||'',phone:school.phone||'',uai:school.uai||'',siret:school.siret||''};
    // Ne jamais inventer une adresse : si le référentiel ne fournit pas de mail, laisser le champ vide.
    $('#signupEmail').value=school.email||'';
    $('#signupEmail').dataset.directoryEmail=school.email||'';
    void resolveSignupSiret(window.selectedSignupSchool);
    void checkSignupSchoolAccount(window.selectedSignupSchool);
    const help=$('#signupSchoolHelp');if(help)help.textContent=`Établissement sélectionné : ${school.name} · ${school.city} · UAI ${school.uai}. ${school.email?'Adresse e-mail issue de l’annuaire ; vous pouvez la vérifier ou la corriger.':'Aucune adresse e-mail disponible dans l’annuaire : saisissez-la manuellement.'}`;
  }
  let schoolsCache=null;
  async function loadHauteGaronneSchools(){
    if(schoolsCache)return schoolsCache;
    const base='https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records';
    const where=encodeURIComponent("code_departement='031' AND (type_etablissement='Collège' OR type_etablissement='Lycée') AND etat='OUVERT'");
    const all=[];
    for(let offset=0;offset<500;offset+=100){
      const url=`${base}?where=${where}&limit=100&offset=${offset}&order_by=nom_etablissement`;
      const response=await fetch(url);if(!response.ok)throw new Error('Annuaire indisponible');
      const json=await response.json();const records=json.results||[];all.push(...records);if(records.length<100)break;
    }
    schoolsCache=all.map(r=>({uai:r.identifiant_de_l_etablissement||'',name:r.nom_etablissement||'',type:r.type_etablissement||'',address:[r.adresse_1,r.adresse_2,r.adresse_3,r.code_postal,r.nom_commune].filter(Boolean).join(', '),city:r.nom_commune||'',phone:r.telephone||'',email:r.mail||''})).filter(s=>s.name).sort((a,b)=>a.name.localeCompare(b.name,'fr'));
    return schoolsCache;
  }
  async function populateSchoolDropdown(currentName=''){
    const select=$('#collegeLookup');if(!select)return;
    select.innerHTML='<option value="">Chargement de l’annuaire officiel…</option>';
    try{
      const schools=await loadHauteGaronneSchools();if(!$('#collegeLookup'))return;
      select.innerHTML='<option value="">— Sélectionner un collège ou un lycée —</option>'+schools.map((s,i)=>`<option value="${i}">${esc(s.name)} — ${esc(s.city)} (${esc(s.type)})</option>`).join('');
      const existing=schools.findIndex(s=>s.name.toLocaleLowerCase('fr')===String(currentName||'').toLocaleLowerCase('fr'));
      if(existing>=0){select.value=String(existing);if(!$('#collegeSiret')?.value)fillCollegeFromDirectory(schools[existing]);}
      select.disabled=false;
    }catch(e){select.innerHTML='<option value="">Annuaire temporairement indisponible — saisie manuelle ci-dessous</option>';select.disabled=true;const msg=$('#schoolLookupHelp');if(msg)msg.textContent='La liste officielle n’a pas pu être chargée. Vous pouvez saisir les coordonnées manuellement.';}
  }
  function fillCollegeFromDirectory(s){if(!s)return;const form=$('#entityForm');if(form){form._selectedSiretSchool=s;if(canAdmin()||state.profile?.role==='college')void autofillSiretForSchool(s);}const set=(name,value)=>{const el=$(`[name="${name}"]`);if(el&&value)el.value=value};set('college_name',s.name);set('college_city',s.city);set('college_address',s.address);set('college_phone',s.phone);set('college_email',s.email);}
  // Une place n'est occupée qu'après confirmation administrative.
  // Les demandes en attente ne bloquent pas le créneau ; le serveur arbitre les confirmations concurrentes.
  function reservedPlaces(sessionId, excludeApplicationId=''){
    if(!state.demo && db && !excludeApplicationId)return Number(state.occupancy[sessionId]||0);
    const local=state.data.applications.filter(a=>a.session_id===sessionId && a.id!==excludeApplicationId && ['pending','confirmed','completed'].includes(a.status)).length;
    if(!state.demo && db && excludeApplicationId)return Math.max(0,Number(state.occupancy[sessionId]||0)-(state.data.applications.some(a=>a.id===excludeApplicationId&&a.session_id===sessionId&&['pending','confirmed','completed'].includes(a.status))?1:0));
    return local;
  }
  // Compatibilité : le calendrier et les tableaux utilisent ce compteur.
  // Inclure les demandes en attente car elles pré-réservent une place.
  function confirmedPlaces(sessionId){return reservedPlaces(sessionId)}
  function sessionBookable(s, applicationId=''){
    return !!s && s.active===true && s.date>=plusDays(7) && reservedPlaces(s.id,applicationId)<Number(s.capacity||0);
  }
  function selectableSessions(formationId, applicationId=''){
    return state.data.sessions.filter(s=>s.formation_id===formationId && sessionBookable(s,applicationId)).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')) || String(a.start_time||'').localeCompare(String(b.start_time||'')));
  }
  // Préremplissage depuis le référentiel officiel déjà utilisé à la création du compte.
  // Les champs restent éditables ; aucune modification n'est enregistrée dans le profil.
  async function prefillOriginSchoolFromDirectory(expectedName,expectedCity,expectedUai){
    const form=$('#entityForm');if(!form||!expectedName)return;
    const fieldNames=['college_city','college_address','college_phone'];
    const original=Object.fromEntries(fieldNames.map(name=>[name,form.elements.namedItem(name)?.value||'']));
    const norm=normalizeSearch;
    const cleanName=value=>norm(value).replace(/\b(college|lycee|erea|etablissement|public|prive|general|technologique|professionnel)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
    try{
      const schools=await loadToulouseAcademySchools();
      if(!form.isConnected)return;
      const uai=String(expectedUai||'').trim().toUpperCase();
      let candidates=uai?schools.filter(s=>String(s.uai||'').toUpperCase()===uai):[];
      if(!candidates.length)candidates=schools.filter(s=>norm(s.name)===norm(expectedName));
      if(!candidates.length)candidates=schools.filter(s=>cleanName(s.name)===cleanName(expectedName));
      if(!candidates.length){const key=cleanName(expectedName);if(key.length>=5)candidates=schools.filter(s=>cleanName(s.name).includes(key)||key.includes(cleanName(s.name)));}
      const city=norm(expectedCity||state.profile?.city||state.profile?.organization_city||'');
      const match=candidates.length===1?candidates[0]:candidates.find(s=>city&&norm(s.city)===city);
      if(!match){console.info('Établissement non identifié sans ambiguïté dans l’annuaire :',expectedName);return;}
      for(const [name,value] of Object.entries({college_city:match.city,college_address:match.address,college_phone:match.phone})){
        const input=form.elements.namedItem(name);
        if(input&&value&&input.value===original[name])input.value=value;
      }
      const siretInput=form.elements.namedItem('college_siret');if(siretInput&&!siretInput.value){form.dataset.schoolUai=match.uai||'';form._selectedSiretSchool=match;void autofillSiretForSchool(match);}const info=$('#originDirectoryInfo');if(info)info.textContent='Coordonnées proposées depuis l’annuaire officiel de l’Éducation nationale. Vous pouvez les modifier. Le SIRET est recherché automatiquement.';
    }catch(error){console.warn('Annuaire établissement indisponible : saisie manuelle conservée.',error);const info=$('#originDirectoryInfo');if(info)info.textContent='Annuaire momentanément indisponible : vous pouvez renseigner les coordonnées manuellement.';}
  }
  function openApplicationForm(id,preselectedSessionId){
    if(!canManage()&&!['college','family'].includes(state.profile?.role))return;if(id&&!canManage())return;
    const a=id?state.data.applications.find(x=>x.id===id):{student_first_name:'',student_last_name:'',student_birth_date:'',student_class:'3ème générale',college_name:state.profile?.organization||'',college_city:'',college_address:'',college_phone:'',college_email:'',insurance:'',contact_last_name:'',contact_first_name:'',contact_name:'',contact_email:'',contact_phone:'',formation_id:state.data.formations[0]?.id||'',session_id:'',status:'pending',meal:'',meal_payer:'',notes:''};
    if(!id&&preselectedSessionId){const chosen=state.data.sessions.find(s=>s.id===preselectedSessionId);if(!sessionBookable(chosen)){toast('Ce créneau n’est plus disponible.',true);return}a.formation_id=chosen.formation_id;a.session_id=chosen.id;}if(!id&&state.profile?.role==='college'){const p=state.profile||{};a.college_name=p.organization||a.college_name;a.college_city=p.city||p.organization_city||state.user?.user_metadata?.organization_city||a.college_city;a.college_address=p.address||p.organization_address||state.user?.user_metadata?.organization_address||a.college_address;a.college_phone=p.phone||p.organization_phone||state.user?.user_metadata?.organization_phone||a.college_phone;a.college_email=p.email||state.user?.email||'';}
    const fixedCollegeStage=!id&&state.profile?.role==='college'&&!!preselectedSessionId;
    const fixedStage=state.data.sessions.find(s=>s.id===a.session_id);
    const formOpts=state.data.formations.filter(f=>f.active!==false).map(f=>({value:f.id,label:f.name}));
    const sizesShoes=Array.from({length:14},(_,i)=>({value:String(i+35),label:`T${i+35}`}));const clothing=['XS','S','M','L','XL','XXL'].map(x=>({value:x,label:x}));
    const yesNo=[{value:'oui',label:'Oui'},{value:'non',label:'Non'}];
    const classOptions=['3ème générale','3ème SEGPA','3ème Prépa métiers','3ème Ulis','Autre'].map(x=>({value:x,label:x}));
    const sessionOptions=selectableSessions(a.formation_id,id||'').map(s=>({value:s.id,label:`${dateLabel(s.date)} — ${shortTime(s.start_time)}${s.end_time?' à '+shortTime(s.end_time):''}`}));
    const selectedSession=sessionOptions.some(x=>x.value===a.session_id)?a.session_id:(sessionOptions[0]?.value||'');
    openModal(id?'Consulter / modifier une inscription':'Nouvelle inscription — dossier de convention',`<form id="entityForm">
      <h3 class="form-section-title">1. Établissement d’origine</h3><div class="form-grid">${state.profile?.role==='college'?`<p id="originDirectoryInfo" class="span-2 tiny muted">Recherche des coordonnées de votre établissement dans l’annuaire officiel… Les champs restent modifiables.</p>`:`<label class="span-2">Rechercher dans l’annuaire officiel des collèges et lycées de Haute-Garonne<select id="collegeLookup" disabled><option value="">Chargement de l’annuaire officiel…</option></select><small id="schoolLookupHelp" class="tiny muted">Choisissez votre établissement pour préremplir automatiquement ses coordonnées. Vous pouvez les corriger ensuite.</small></label>`}${field('Nom du collège / lycée *','college_name',a.college_name,'text','required')}${field('Ville','college_city',a.college_city)}<label class="span-2">Adresse de l’établissement<input class="college-address-field" name="college_address" type="text" value="${esc(a.college_address||'')}"></label><label>Téléphone de l’établissement<input class="college-phone-field" name="college_phone" type="tel" value="${esc(a.college_phone||'')}"></label>${field('E-mail de l’établissement','college_email',a.college_email,'email')}${(canAdmin()||state.profile?.role==='college')?`<label class="span-2">SIRET de l’établissement d’origine<input name="college_siret" id="collegeSiret" inputmode="numeric" maxlength="14" pattern="[0-9]{14}" value="${esc(a.college_siret||'')}" placeholder="14 chiffres"><small class="tiny muted">Renseigné automatiquement à partir de votre établissement lorsqu’une correspondance vérifiée est disponible.</small></label><div class="span-2 siret-search-row">${state.profile?.role==='college'?'':`<button type="button" class="btn outline small" id="lookupSiret">⌕ Rechercher le SIRET</button>`}<select id="siretCandidates" aria-label="Résultats de la recherche SIRET" class="hidden"></select><span id="siretLookupStatus" class="tiny muted"></span></div>`:''}${field('Assurance de l’établissement d’origine','insurance',a.insurance)}
      <h3 class="form-section-title span-2">2. Élève stagiaire</h3>${field('Prénom *','student_first_name',a.student_first_name,'text','required')}${field('Nom *','student_last_name',a.student_last_name,'text','required')}${field('Date de naissance','student_birth_date',a.student_birth_date,'date')}${selectField('Classe *','student_class',classOptions,classOptions.some(o=>o.value===a.student_class)?a.student_class:'3ème générale')}
      <h3 class="form-section-title span-2">3. Tailles des vêtements (obligatoire pour préparer l’accueil)</h3>${optionalSelectField('Pointure de chaussures','shoe_size',sizesShoes,a.shoe_size)}${optionalSelectField('Taille de pantalon','pants_size',clothing,a.pants_size)}${optionalSelectField('Taille du haut','top_size',clothing,a.top_size)}
      <h3 class="form-section-title span-2">4. Responsable légal</h3>${field('Nom *','contact_last_name',a.contact_last_name||a.contact_name,'text','required')}${field('Prénom *','contact_first_name',a.contact_first_name,'text','required')}<label class="span-2">Adresse du responsable légal *<input name="parent_address" type="text" required value="${esc(a.parent_address||'')}"></label>${field('Téléphone *','contact_phone',a.contact_phone,'tel','required')}${field('E-mail *','contact_email',a.contact_email,'email','required')}
      <h3 class="form-section-title span-2">5. Informations utiles à l’accueil</h3>${optionalSelectField('Nuit à l’internat ?','medical_issue',yesNo,a.medical_issue)}${optionalSelectField('PAI en cours ?','pai',yesNo,a.pai)}${optionalSelectField('Accompagnement AESH ?','aesh',yesNo,a.aesh)}${optionalSelectField('Repas à l’EREA (4,60 €) ?','meal',yesNo,a.meal)}<label id="mealPayerWrap" class="${a.meal==='oui'?'':'hidden'}">Prise en charge du repas<select name="meal_payer"><option value="">— Choisir —</option><option value="famille" ${a.meal_payer==='famille'?'selected':''}>Famille</option><option value="college" ${a.meal_payer==='college'?'selected':''}>Collège d’origine</option><option value="autre" ${a.meal_payer==='autre'?'selected':''}>Autre</option></select></label>
      <h3 class="form-section-title span-2 mini-stage-section-title">6. Mini-stage</h3>${fixedCollegeStage&&fixedStage?`<div class="span-2 mini-stage-fixed-summary" style="padding:14px;border:1px solid #dce6ef;border-radius:12px;background:#f5f9fc;color:#172b3a!important;-webkit-text-fill-color:#172b3a"><div><strong>Formation :</strong> ${esc(formation(fixedStage.formation_id).name)}</div><div><strong>Date :</strong> ${shortDate(fixedStage.date)}</div><div><strong>Horaires :</strong> ${shortTime(fixedStage.start_time)} – ${shortTime(fixedStage.end_time)}</div><p class="tiny muted" style="color:#314a5d!important;-webkit-text-fill-color:#314a5d">Créneau sélectionné depuis la page Formations.</p></div><input type="hidden" name="formation_id" value="${esc(fixedStage.formation_id)}"><input type="hidden" name="session_id" value="${esc(fixedStage.id)}">`:`${selectField('Formation souhaitée *','formation_id',formOpts,a.formation_id)}<label class="span-2">Date / créneau souhaité *<select name="session_id" id="applicationSession" required>${sessionOptions.map(o=>`<option value="${esc(o.value)}" ${o.value===selectedSession?'selected':''}>${esc(o.label)}</option>`).join('')}</select><small id="sessionHelp" class="tiny muted">Seuls les créneaux de la formation sélectionnée sont proposés.</small></label>`}${canAdmin()?selectField('Statut','status',[{value:'pending',label:'À traiter'},{value:'confirmed',label:'Confirmée'},{value:'refused',label:'Refusée'},{value:'cancelled',label:'Annulée'},{value:'completed',label:'Réalisée'}],a.status):'<input type="hidden" name="status" value="pending">'}
      <label class="span-2">Observations utiles à l’accueil<textarea name="notes">${esc(a.notes||'')}</textarea></label></div><p class="tiny muted" style="margin-top:12px">Les informations médicales ne doivent être renseignées que si elles sont nécessaires à la sécurité et à l’accueil de l’élève. Pour les données réelles de mineurs, utilisez uniquement l’espace en ligne sécurisé validé par l’établissement.</p></form>`,`<button type="button" class="btn outline" data-action="close-modal">Annuler</button><button class="btn primary" data-action="save-application" data-id="${id||''}">Enregistrer le dossier</button>`);
    if(!id&&state.profile?.role==='college'){const profileSiret=String(state.profile?.college_siret||state.profile?.siret||'').replace(/\D/g,'');if(profileSiret.length===14){const f=$('#entityForm');if(f?.elements?.college_siret)f.elements.college_siret.value=profileSiret;}const metadata=state.user?.user_metadata||{};
      const ownUai=metadata.organization_uai||state.profile?.uai||'';
      const ownSchool={uai:ownUai,name:a.college_name||state.profile?.organization||'',city:a.college_city||state.profile?.city||'',address:a.college_address||state.profile?.address||''};
      const prior=state.data.applications.find(row=>row.created_by===state.user?.id&&/^[0-9]{14}$/.test(String(row.college_siret||'')));
      const siretField=$('#entityForm')?.elements?.college_siret;
      if(prior&&siretField&&!siretField.value){siretField.value=prior.college_siret;const message=$('#siretLookupStatus');if(message)message.textContent='SIRET repris automatiquement de vos précédentes inscriptions.';}
      if(ownSchool.name&&!siretField?.value)void autofillSiretForSchool(ownSchool);
      // Le SIRET vérifié est lié au profil établissement, pas à une recherche à chaque inscription.
      if(siretField&&!siretField.value){const note=$('#siretLookupStatus');if(note)note.textContent='SIRET non enregistré pour cet établissement : demandez à l’administrateur de renseigner le SIRET dans le profil Supabase (une seule fois).';}
      void prefillOriginSchoolFromDirectory(a.college_name,a.college_city,ownUai);}
    if(state.profile?.role!=='college'){populateSchoolDropdown(a.college_name);const lookup=$('#collegeLookup');if(lookup)lookup.addEventListener('change',async()=>{try{const schools=await loadHauteGaronneSchools();const school=schools[Number(lookup.value)];if(school)fillCollegeFromDirectory(school);}catch{}});}
    const form=$('#entityForm');
    if(canAdmin())setupSiretLookup(form);
    const formationSelect=form?.querySelector('[name="formation_id"]');
    const refreshSessions=()=>{const fs=formationSelect?.value;const sel=$('#applicationSession');if(!sel)return;const matches=selectableSessions(fs,id||'');sel.innerHTML=matches.length?matches.map(s=>`<option value="${esc(s.id)}">${esc(dateLabel(s.date))} — ${esc(shortTime(s.start_time))}${s.end_time?' à '+esc(shortTime(s.end_time)):''}</option>`).join(''):'<option value="">Aucun créneau disponible pour cette formation</option>';sel.disabled=!matches.length;const help=$('#sessionHelp');if(help)help.textContent=matches.length?'Seuls les créneaux de la formation sélectionnée sont proposés.':'Aucune date/créneau ouvert pour cette formation. Contactez l’EREA.';};
    formationSelect?.addEventListener('change',refreshSessions);
    const mealSelect=form?.querySelector('[name="meal"]');const mealWrap=$('#mealPayerWrap');const mealPayer=form?.querySelector('[name="meal_payer"]');
    const refreshMeal=()=>{const show=mealSelect?.value==='oui';mealWrap?.classList.toggle('hidden',!show);if(mealPayer){mealPayer.required=show;if(!show)mealPayer.value='';}};mealSelect?.addEventListener('change',refreshMeal);refreshMeal();
  }
  let signatureCanvasDirty=false;
  function openGuardianSignature(id){
    const a=state.data.applications.find(x=>x.id===id);
    if(!a||!guardianEligible(a)||signatureFor(a,'guardian')||!['confirmed','completed'].includes(a.status)){toast('Signature non autorisée ou déjà enregistrée.',true);return}
    signatureCanvasDirty=false;
    openModal('Signature du responsable légal',`<p class="muted">Dossier : <strong>${esc(a.student_first_name)} ${esc(a.student_last_name)}</strong> — convention version ${esc(a.convention_version||1)}.</p><p class="muted">Seul le responsable légal connecté avec l’adresse indiquée dans le dossier peut signer. La signature tracée n’est pas une signature électronique qualifiée.</p><div class="signature-pad"><canvas id="guardianSignatureCanvas" aria-label="Zone de signature manuscrite"></canvas></div><p class="tiny muted">Dessinez votre signature avec la souris ou votre doigt.</p>`,`<button class="btn outline" data-action="clear-guardian-signature">Effacer</button><button class="btn outline" data-action="close-modal">Annuler</button><button class="btn primary" data-action="save-guardian-signature" data-id="${id}">Valider la signature</button>`);
    const canvas=$('#guardianSignatureCanvas');const ratio=Math.max(1,window.devicePixelRatio||1);canvas.width=Math.round(520*ratio);canvas.height=Math.round(170*ratio);const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);ctx.strokeStyle='#152c3d';ctx.lineWidth=2.4;ctx.lineCap='round';ctx.lineJoin='round';let drawing=false;
    const pos=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*520/r.width,y:(e.clientY-r.top)*170/r.height}};
    canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;const pt=pos(e);ctx.beginPath();ctx.moveTo(pt.x,pt.y);ctx.lineTo(pt.x+.01,pt.y+.01);ctx.stroke();signatureCanvasDirty=true});
    canvas.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const pt=pos(e);ctx.lineTo(pt.x,pt.y);ctx.stroke()});
    for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,()=>drawing=false);
  }
  async function saveGuardianSignature(id){
    const a=state.data.applications.find(x=>x.id===id);if(!a||!guardianEligible(a)||signatureFor(a,'guardian'))throw new Error('Signature non autorisée ou déjà enregistrée.');
    if(!signatureCanvasDirty)throw new Error('Veuillez dessiner votre signature.');
    if(state.demo||!db)throw new Error('Une connexion authentifiée Supabase est nécessaire.');
    const canvas=$('#guardianSignatureCanvas');if(!canvas)throw new Error('Zone de signature indisponible.');
    const png=canvas.toDataURL('image/png');
    const {error}=await db.rpc('sign_guardian_convention',{p_application_id:id,p_version:a.convention_version||1,p_signature_png:png});if(error)throw error;
    await loadLiveData();closeModal();renderPage();toast('Signature du responsable légal enregistrée. L’établissement d’origine peut désormais signer depuis son espace.');
  }
  function openOriginSignature(id){
    const a=state.data.applications.find(x=>x.id===id);
    if(!a||!originEligible(a)||!signatureFor(a,'guardian')||signatureFor(a,'origin'))throw new Error('Signature établissement non autorisée ou déjà enregistrée.');
    openModal('Signature de l’établissement d’origine',`<p>Convention de <strong>${esc(a.student_first_name)} ${esc(a.student_last_name)}</strong>. La signature du responsable légal est enregistrée.</p><p>Consultez la convention avant de signer.</p><div class="signature-pad"><canvas id="originSignatureCanvas" width="520" height="170" style="touch-action:none;width:100%;height:170px" aria-label="Signature établissement d’origine"></canvas></div><label class="signature-file-field">Ou importer une signature (JPEG, PNG ou PDF — première page)<input type="file" id="originSignatureFile" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"></label><p class="tiny muted">Le fichier sera ajusté dans le cadre de signature. Vérifiez son aperçu avant de signer. Import réservé au signataire habilité.</p>`,`<button class="btn outline" data-action="print-convention" data-id="${id}">Voir le PDF</button><button class="btn outline" data-action="clear-origin-signature">Effacer</button><button class="btn outline" data-action="close-modal">Annuler</button><button class="btn primary" data-action="save-origin-signature" data-id="${id}">Signer</button>`);
    const c=$('#originSignatureCanvas'),ctx=c.getContext('2d');ctx.lineWidth=2.4;ctx.lineCap='round';ctx.strokeStyle='#152c3d';let active=false;window.originSignatureDirty=false;
    const point=e=>{const r=c.getBoundingClientRect();return {x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};
    c.addEventListener('pointerdown',e=>{active=true;c.setPointerCapture(e.pointerId);const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y)});
    c.addEventListener('pointermove',e=>{if(!active)return;const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke();window.originSignatureDirty=true});
    c.addEventListener('pointerup',()=>{active=false});c.addEventListener('pointercancel',()=>{active=false});$('#originSignatureFile')?.addEventListener('change',async e=>{try{await importOriginSignature(e.target.files?.[0],c);window.originSignatureDirty=true;toast('Signature importée : vérifiez l’aperçu avant de signer.')}catch(err){e.target.value='';toast(err.message,true)}});
  }
  async function importOriginSignature(file,canvas){
    if(!file)throw new Error('Sélectionnez un fichier.');
    const ext=(file.name.split('.').pop()||'').toLowerCase();
    if(!['jpg','jpeg','png','pdf'].includes(ext))throw new Error('Formats autorisés : JPEG, PNG ou PDF.');
    if(file.size>5*1024*1024)throw new Error('Le fichier ne doit pas dépasser 5 Mo.');
    let image;
    if(ext==='pdf'){
      if(!window.pdfjsLib)throw new Error('Lecteur PDF indisponible. Rechargez la page et réessayez.');
      const bytes=new Uint8Array(await file.arrayBuffer());
      if(String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')throw new Error('Fichier PDF invalide.');
      const pdf=await window.pdfjsLib.getDocument({data:bytes}).promise;
      try{
        if(pdf.numPages!==1)throw new Error('Utilisez un PDF d’une seule page contenant uniquement la signature.');
        const page=await pdf.getPage(1),viewport=page.getViewport({scale:1});
        const scale=Math.min(2,1400/Math.max(viewport.width,viewport.height));
        const view=page.getViewport({scale});const off=document.createElement('canvas');
        off.width=Math.ceil(view.width);off.height=Math.ceil(view.height);
        await page.render({canvasContext:off.getContext('2d'),viewport:view}).promise;
        image=off;
      }finally{await pdf.destroy()}
    }else{
      const isJpeg=ext==='jpg'||ext==='jpeg';
      if(![isJpeg?'image/jpeg':'image/png'].includes(file.type))throw new Error('Le type du fichier ne correspond pas à son extension.');
      const url=URL.createObjectURL(file);
      try{image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Image illisible.'));img.src=url})}finally{URL.revokeObjectURL(url)}
    }
    const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
    if(!w||!h||w>8000||h>8000)throw new Error('Dimensions de signature non prises en charge.');
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
    const ratio=Math.min((canvas.width-24)/w,(canvas.height-20)/h);
    ctx.drawImage(image,(canvas.width-w*ratio)/2,(canvas.height-h*ratio)/2,w*ratio,h*ratio);
  }
  async function saveOriginSignature(id){const a=state.data.applications.find(x=>x.id===id);if(!a||!originEligible(a)||!signatureFor(a,'guardian'))throw new Error('Signature non autorisée.');if(!window.originSignatureDirty)throw new Error('Dessinez ou importez votre signature.');const png=$('#originSignatureCanvas').toDataURL('image/png');const {error}=await db.rpc('sign_origin_convention',{p_application_id:id,p_version:a.convention_version||1,p_signature_png:png});if(error)throw error;await loadLiveData();closeModal();renderPage();toast('Signature de l’établissement d’origine enregistrée. Convention en attente de validation administrateur.');}
  // Aperçu unique intégré à MiniStages : ne quitte pas la page et n'ouvre pas d'onglet.
  let conventionPreviewBlobUrl=null;
  function clearConventionPreview(){
    if(conventionPreviewBlobUrl){URL.revokeObjectURL(conventionPreviewBlobUrl);conventionPreviewBlobUrl=null;}
  }
  function showConventionPreview(url,title='Convention de mini-stage',isBlob=false,pdfBytes=null){
    // openModal() ferme l'ancien aperçu et révoque son URL temporaire.
    // Ne conserver la nouvelle URL qu'APRÈS openModal(), sinon elle est
    // immédiatement révoquée et fetch(blob:...) échoue (« Failed to fetch »).
    const safeUrl=esc(url);
    openModal(title,`<div class="convention-preview-tools"><span>Document PDF · 2 pages A4</span><a class="btn outline small" href="${safeUrl}" target="_blank" rel="noopener noreferrer">Ouvrir dans un nouvel onglet</a><a class="btn primary small" href="${safeUrl}" download="convention-mini-stage.pdf">Télécharger le PDF</a></div><div class="convention-preview-pages" id="conventionPdfPages" role="region" aria-label="Aperçu de la convention"><p class="convention-preview-loading">Chargement des pages PDF…</p></div>`,`<button class="btn outline" data-action="close-modal">Fermer l'aperçu</button>`);
    $('#modalRoot .modal')?.classList.add('convention-preview-modal');
    if(isBlob)conventionPreviewBlobUrl=url;

    // Rendu PDF.js : évite le lecteur iframe PDF cassé.
    (async()=>{
      const target=document.getElementById('conventionPdfPages');
      if(!target)return;
      let pdf=null;
      try{
        if(!window.pdfjsLib)throw new Error('Lecteur PDF indisponible.');
        const bytes=pdfBytes ? new Uint8Array(pdfBytes) : await (async()=>{
          const response=await fetch(url);
          if(!response.ok)throw new Error('Impossible de récupérer le PDF (HTTP '+response.status+').');
          return new Uint8Array(await response.arrayBuffer());
        })();
        pdf=await window.pdfjsLib.getDocument({data:bytes}).promise;
        if(!target.isConnected)return;
        target.replaceChildren();
        for(let n=1;n<=pdf.numPages;n++){
          if(!target.isConnected)break;
          const page=await pdf.getPage(n);
          const base=page.getViewport({scale:1});
          const width=Math.min(900,Math.max(320,target.clientWidth-24));
          const viewport=page.getViewport({scale:Math.min(2,width/base.width)});
          const canvas=document.createElement('canvas');
          canvas.width=Math.ceil(viewport.width);
          canvas.height=Math.ceil(viewport.height);
          canvas.className='convention-preview-page-canvas';
          canvas.setAttribute('aria-label','Page '+n+' sur '+pdf.numPages);
          target.appendChild(canvas);
          await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
        }
      }catch(err){
        if(target.isConnected){
          target.replaceChildren();
          const p=document.createElement('p');
          p.className='convention-preview-error';
          p.textContent='Aperçu indisponible : '+(err?.message||'Erreur inconnue')+'. Utilisez « Ouvrir dans un nouvel onglet » ou « Télécharger le PDF ».';
          target.appendChild(p);
        }
      }finally{if(pdf)try{await pdf.destroy()}catch(_){}}
    })();

  }
  function printConvention(id, mode="download"){
    const a=state.data.applications.find(x=>x.id===id);
    if(!a)return;
    if(!window.jspdf?.jsPDF){toast('La bibliothèque PDF ne s’est pas chargée. Vérifiez votre connexion puis réessayez.',true);return}
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    const s=session(a.session_id), f=formation(a.formation_id);
    const val=v=>String(v??'').trim()||'Non renseigné';
    const yn=v=>v==='oui'?'Oui':v==='non'?'Non':'Non renseigné';
    const W=210, margin=13, right=197;
    const line=(text,x,y,max=180,size=8,style='normal')=>{doc.setFont('helvetica',style);doc.setFontSize(size);const parts=doc.splitTextToSize(val(text),max);doc.text(parts,x,y);return y+parts.length*(size*.37+1.05)};
    const header=(n)=>{doc.setTextColor(22,49,68);doc.setDrawColor(185,202,211);doc.setLineWidth(.25);doc.line(margin,17,right,17);doc.setFont('helvetica','bold');doc.setFontSize(9);if(n!==1)doc.text('EREA DE MURET  |  CONVENTION DE MINI-STAGE',margin,13);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.text('Page '+n+'/2  -  Document à vérifier et signer',right,287,{align:'right'});doc.line(margin,282,right,282)};
    const field=(label,value,x,y,width)=>{doc.setFont('helvetica','normal');doc.setTextColor(85,104,116);doc.setFontSize(7);doc.text(label,x,y);doc.setTextColor(22,49,68);doc.setFont('helvetica','bold');doc.setFontSize(8);const rows=doc.splitTextToSize(val(value),width);doc.text(rows.slice(0,2),x,y+4);return y+5+Math.min(2,rows.length)*3.3};
    const box=(title,rows,y)=>{const x=margin,w=184,pad=4;doc.setFont('helvetica','normal');doc.setFontSize(7.4);let contentHeight=0;const prepared=rows.map(([k,v])=>{const value=val(v);const h=Math.max(5,doc.splitTextToSize(value,110).length*3.2);contentHeight+=h;return [k,value,h]});const height=9+contentHeight+2;doc.setDrawColor(178,196,206);doc.roundedRect(x,y,w,height,1.8,1.8);doc.setFillColor(235,243,247);doc.rect(x+.3,y+.3,w-.6,8,'F');doc.setTextColor(26,66,89);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(title,x+pad,y+5.5);let yy=y+12;for(const [k,v,h] of prepared){doc.setFont('helvetica','normal');doc.setFontSize(7.2);doc.setTextColor(91,107,117);doc.text(k,x+pad,yy);doc.setFont('helvetica','bold');doc.setFontSize(7.6);doc.setTextColor(25,47,62);doc.text(doc.splitTextToSize(v,110),x+66,yy);yy+=h}return y+height+2.5};
    header(1);
    // Cadre dédié au logo, en haut à gauche, sans chevauchement avec le titre.
    doc.setDrawColor(169,188,200);doc.setFillColor(248,251,253);
    doc.roundedRect(13,20,32,24,1.8,1.8,'FD');
    const logoData=branding.logo||cfg.CONVENTION_LOGO_DATA_URL;
    if(logoData){
      try{
        const logoType=logoData.startsWith('data:image/png')?'PNG':'JPEG';
        const properties=doc.getImageProperties(logoData);
        const scale=Math.min(28/properties.width,18/properties.height);
        const imgW=properties.width*scale,imgH=properties.height*scale;
        doc.addImage(logoData,logoType,29-imgW/2,22+(18-imgH)/2,imgW,imgH);
      }catch(err){console.warn('Logo non inséré : fichier non valide',err)}
    }else{doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(108,125,139);doc.text('Logo établissement',29,33,{align:'center'})}
    doc.setTextColor(22,49,68);doc.setFont('helvetica','bold');doc.setFontSize(12);
    doc.text('CONVENTION DE MINI-STAGE',120,29,{align:'center'});
    doc.setFont('helvetica','normal');doc.setFontSize(7.2);
    doc.text('EREA de Muret — établissement d’accueil',120,35,{align:'center'});
    doc.text('40 avenue Louis Pasteur · 31600 Muret',120,39,{align:'center'});
    let y=47;
    y=box('1. ÉTABLISSEMENT D’ORIGINE', [['Établissement',a.college_name],['Adresse',a.college_address],['SIRET',a.college_siret||'Non renseigné'],['Téléphone / courriel',[a.college_phone,a.college_email].filter(Boolean).join(' / ')],['Assurance',a.insurance]],y);
    y=box('2. ÉLÈVE STAGIAIRE', [['Élève',[a.student_first_name,a.student_last_name].filter(Boolean).join(' ')],['Naissance / classe',[a.student_birth_date?dateLabel(a.student_birth_date):'',a.student_class].filter(Boolean).join(' - ')],['Tailles vêtement',[a.shoe_size?'Chaussures : '+a.shoe_size:'',a.pants_size?'Pantalon : '+a.pants_size:'',a.top_size?'Haut : '+a.top_size:''].filter(Boolean).join(' / ')],['Informations utiles',`Nuit à l’internat : ${yn(a.medical_issue)} ; PAI : ${yn(a.pai)} ; AESH : ${yn(a.aesh)}`],['Repas',`${yn(a.meal)} ; Réglé par : ${a.meal==='oui'?(a.meal_payer==='college'?'Établissement d’origine':a.meal_payer==='famille'?'Famille':val(a.meal_payer)):'Sans objet'}`]],y);
    y=box('3. RESPONSABLE LÉGAL', [['Nom',a.contact_name],['Adresse',a.parent_address],['Coordonnées',[a.contact_phone,a.contact_phone2,a.contact_email].filter(Boolean).join(' / ')]],y);
    y=box('4. INFORMATIONS D’ACCUEIL', [['Établissement','EREA de Muret'],['Adresse','40 avenue Louis Pasteur - 31600 Muret'],['Téléphone / courriel','05 61 51 96 96 / 0311240e@ac-toulouse.fr'],['Responsable',branding.headName||'Direction de l’EREA de Muret']],y);
    y=box('5. MINI-STAGE', [['Formation',f.name],['Date / créneau',`${dateLabel(s.date)} - ${shortTime(s.start_time)} à ${shortTime(s.end_time)}`],['Lieu / encadrement',[s.location,s.teacher_name].filter(Boolean).join(' / ')],['Encadrement',s.teacher_name||'—']],y);
    // Trois signataires obligatoires affichés dans trois encadrés distincts.
    // La signature d'origine reste vierge tant qu'aucun mécanisme de signature autorisé n'existe.
    const signatureTop=252, signatureBottom=279, cellW=184/3;
    if(y>248){toast('Les informations dépassent la place disponible en page 1 : raccourcissez les champs avant de générer la convention.',true);return}
    doc.setFont('helvetica','normal');doc.setTextColor(35,58,70);doc.setFontSize(7);
    doc.text('Les signataires reconnaissent avoir pris connaissance des articles figurant au verso.',margin,250);
    const signers=['Établissement d’accueil','Établissement d’origine','Responsable légal'];
    signers.forEach((name,i)=>{
      const x=margin+i*cellW;
      doc.setDrawColor(175,190,201);doc.roundedRect(x+0.5,signatureTop,cellW-1,signatureBottom-signatureTop,1.2,1.2);
      doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(30,55,70);
      doc.text(name,x+3,signatureTop+5);
      doc.setFont('helvetica','normal');doc.setFontSize(6.5);
      const signature=signatureFor(a,['host','origin','guardian'][i]);doc.text('Date : '+(signature?.signed_at?dateLabel(signature.signed_at.slice(0,10)):'—'),x+3,signatureBottom-3);
    });
    const addSignature=(record,kind,index)=>{
      const data=record?.evidence_reference;
      if(!data||!/^data:image\/(png|jpeg);base64,/.test(data))return;
      try{
        const type=data.startsWith('data:image/png')?'PNG':'JPEG';
        const info=doc.getImageProperties(data);
        const maxW=cellW-9,maxH=14,ratio=Math.min(maxW/info.width,maxH/info.height);
        const w=info.width*ratio,h=info.height*ratio;
        doc.addImage(data,type,margin+index*cellW+(cellW-w)/2,signatureTop+7+(maxH-h)/2,w,h);
      }catch(err){console.warn('Signature '+kind+' non insérée',err)}
    };
    addSignature(signatureFor(a,'host'),'accueil',0);
    // Aucune signature de l’établissement d’origine n’est inventée ou copiée d’un autre signataire.
    addSignature(signatureFor(a,'origin'),'origine',1);
    addSignature(signatureFor(a,'guardian'),'responsable légal',2);
    doc.addPage();header(2);doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(22,49,68);doc.text('ARTICLES DE LA CONVENTION',105,27,{align:'center'});
    const articles=[
      ['Article 1 — Objet',`Le mini-stage est une séquence d'observation qui a pour objectif d'aider l'élève à faire un choix d'orientation. Le mini-stage est une activité scolaire déportée. L'élève stagiaire conserve son statut scolaire.`],
      ['Article 2 — Organisation',`Le mini-stage est organisé en 3 phases :\n• Une phase préparatoire conduite au sein du collège d'origine, au cours de laquelle l'élève prépare le mini-stage avec l'aide de ses professeurs, du professeur principal.\n• La phase de mini-stage à proprement parler qui se déroule au Lycée. L'élève stagiaire est intégré dans une classe, principalement en enseignement professionnel ou technologique. L'élève sera observateur et n'utilisera en aucun cas de machine dite « dangereuse » au regard du Code du Travail.\n• Une phase d'exploitation du mini-stage de retour à l'établissement d'origine ayant pour appui une fiche bilan envoyée par l'EREA dans les jours suivants le mini-stage.`],
      ['Article 3 — Engagements de l’élève',`L'élève s'engage :\n• A se présenter au Lycée à la date et à l'heure prévue.\n• A respecter les règles de fonctionnement du Lycée et à ne pas quitter l'enceinte de l'établissement pendant la durée du stage.\n• A suivre les activités proposées pendant le mini-stage.`],
      ['Article 4 — Responsables légaux',`La visite de l'élève est soumise à l'autorisation des parents ou de son représentant légal. Les responsables légaux de l'élève stagiaire s'engagent :\n• A assurer le déplacement de l'élève à l'établissement d'accueil.\n• A venir chercher l'élève à l'établissement d'accueil, si besoin est, à tout moment durant le mini-stage.\n• Si l'élève déjeune dans l'établissement et si la prise en charge n'est pas assurée par l'établissement d'origine, à remettre à l'élève la somme nécessaire au règlement du repas.\n• A informer l'établissement d'origine en cas d'absence au mini-stage.`],
      ['Article 5 — Établissement d’accueil',`Pendant son séjour dans l'établissement, l'élève sera placé sous l'entière autorité du Directeur, il devra se conformer strictement aux instructions et aux consignes données. L'établissement d'accueil s'engage :\n• A informer l'élève sur une formation en l'insérant dans un enseignement professionnel, sur les conditions de recrutement, les enseignements, les possibilités de formation, les conditions d'insertion.\n• A informer l'élève sur les conditions générales de formation à l'EREA.\n• A assurer l'élève dans le cadre de sa participation aux diverses activités, à s'assurer qu'il n'utilise pas de machines dangereuses.\n• A informer au plus vite l'établissement d'origine en cas d'incapacité à accueillir l'élève en mini-stage.\n• A informer l'établissement d'origine en cas d'absence ou d'accident survenu à l'élève pendant le mini-stage, à charge du collège de prévenir sa famille.`],
      ['Article 6 — Établissement d’origine',`L'établissement d'origine s'engage :\n• A faire parvenir la convention dûment renseignée huit jours avant le stage.\n• A aider l'élève dans la préparation du mini-stage et dans son exploitation au retour.\n• A régler le coût de la restauration et de l'hébergement en cas de non-paiement par le responsable légal.\n• Le Chef d'établissement contracte une assurance couvrant la responsabilité civile de l'élève pour les dommages qu'il pourrait causer pendant la durée du mini-stage.\n• A informer l'établissement d'accueil en cas d'absence au mini-stage.\n• A remettre à l'établissement le PAI si il y en a un.`]
    ];
    let yy=35;const available=239;let legalFont=8.1;let legalLine=3.65;const estimate=(font,line)=>articles.reduce((sum,[title,body])=>{doc.setFontSize(font);return sum+4.5+doc.splitTextToSize(body.replaceAll('•','-'),183).length*line+3.2},0);while(estimate(legalFont,legalLine)>available&&legalFont>6.2){legalFont-=.2;legalLine-=.11}if(estimate(legalFont,legalLine)>available){toast('Articles trop longs pour deux pages : modèle à vérifier.',true);return}
    for(const [title,body] of articles){doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(22,49,68);doc.text(title,margin,yy);yy+=4.5;doc.setFont('helvetica','normal');doc.setFontSize(legalFont);const lines=doc.splitTextToSize(body.replaceAll('•','-'),183);doc.text(lines,margin+1,yy);yy+=lines.length*legalLine+3.2}
    if(yy>279){toast('Articles hors de la zone imprimable : document non généré.',true);return}
    if(mode==='blob')return doc.output('blob');
    const pdfBytes=doc.output('arraybuffer');
    const pdfUrl=URL.createObjectURL(new Blob([pdfBytes],{type:'application/pdf'}));
    showConventionPreview(pdfUrl,`Convention — ${a.student_first_name||''} ${a.student_last_name||''}`,true,pdfBytes);
  }

  // Critères repris du modèle officiel de compte rendu de mini-stage de l'EREA de Muret.
  const stageCriteria=[
    {group:'SAVOIR-ÊTRE',key:'ponctualite',label:'PONCTUALITÉ'},
    {group:'SAVOIR-ÊTRE',key:'respect_regles',label:'RESPECT DES RÈGLES'},
    {group:'SAVOIR-ÊTRE',key:'interet_activite',label:'INTÉRÊT POUR L’ACTIVITÉ PROPOSÉE / LA FORMATION'},
    {group:'SAVOIR-ÊTRE',key:'cooperation',label:'COOPÉRATION / TRAVAIL EN GROUPE'},
    {group:'SAVOIR-ÊTRE',key:'communication',label:'COMMUNICATION ET ÉCOUTE'},
    {group:'APTITUDES PROFESSIONNELLES',key:'securite',label:'RESPECT DES RÈGLES DE SÉCURITÉ'},
    {group:'APTITUDES PROFESSIONNELLES',key:'consignes',label:'COMPRÉHENSION DES CONSIGNES'},
    {group:'APTITUDES PROFESSIONNELLES',key:'autonomie',label:'AUTONOMIE / PRISE D’INITIATIVE'},
    {group:'APTITUDES PROFESSIONNELLES',key:'habilete',label:'HABILETÉ TECHNIQUE'}
  ];
  function openStageReport(id){if(!canAdmin()){toast('Compte rendu réservé à l’administrateur.',true);return}const a=state.data.applications.find(x=>x.id===id);if(!a)return;if(a.stage_report?.validated_at){downloadStagePdf(id);return}if(!['confirmed','completed'].includes(a.status)||a.stage_status!=='done'){toast('Le compte rendu est disponible lorsque le stage est confirmé et indiqué comme effectué.',true);return}const s=session(a.session_id);const r=a.stage_report||{};const age=ageAtStage(a.student_birth_date,s.date);const ratings=['TS','S','M','I','TI'];let currentGroup='';let criteriaHtml='';for(const c of stageCriteria){if(c.group!==currentGroup){currentGroup=c.group;criteriaHtml+=`<tr class="evaluation-group"><th colspan="6">${esc(currentGroup)}</th></tr>`}criteriaHtml+=`<tr><td>${esc(c.label)}</td>${ratings.map(v=>`<td class="rating-cell"><label class="rating-choice" title="${v}"><input type="radio" name="rating_${c.key}" value="${v}" ${r.ratings?.[c.key]===v?'checked':''}><span>${v}</span></label></td>`).join('')}</tr>`}const savedLabel=r.validated_at?`Compte rendu validé le ${esc(new Date(r.validated_at).toLocaleString('fr-FR'))}`:r.saved_at?`Brouillon enregistré le ${esc(new Date(r.saved_at).toLocaleString('fr-FR'))}`:'Le compte rendu n’est pas encore enregistré.';openModal('Compte rendu du mini-stage',`<form id="stageReportForm" class="stage-report-form"><p class="muted">${r.validated_at?'Compte rendu validé : modification verrouillée.':'L’enregistrement finalise le PDF : il ne pourra plus être modifié.'}</p><fieldset ${r.validated_at?'disabled':''}><div class="stage-report-heading"><strong>Compte-rendu pour les élèves en mini-stage à l’EREA de Muret</strong><strong class="stage-formation-code">${esc(formation(a.formation_id).code||'—')}</strong><span>TS : Très satisfaisant · S : Satisfaisant · M : Moyen · I : Insuffisant · TI : Très insuffisant</span></div><div class="form-grid stage-identity"><div class="stage-student-name"><span>Nom et prénom du stagiaire</span><strong>${esc(`${a.student_first_name||''} ${a.student_last_name||''}`.trim())}</strong></div>${field('Âge','student_age',String(age),'text','readonly')}${age==='Date de naissance à vérifier'?`<p class="span-2" style="color:#9b351e;font-weight:650">La date de naissance enregistrée (${esc(a.student_birth_date||'absente')}) est incohérente avec la date du mini-stage (${esc(s.date||'absente')}). Corrigez-la dans la fiche d’inscription avant de finaliser le compte rendu.</p>`:''}${field('Établissement','college_name',a.college_name||'')}${field('Ville de résidence','college_city',a.college_city||'')}${field('Professeur','teacher_name',s.teacher_name||'','text','readonly')}${field('Date du mini-stage','stage_date',s.date?dateLabel(s.date):'')}</div><div class="table-wrap evaluation-table-wrap"><table class="evaluation-table"><thead><tr><th>Évaluation</th>${ratings.map(v=>`<th>${v}</th>`).join('')}</tr></thead><tbody>${criteriaHtml}</tbody></table></div><label class="stage-text-label">Tâches confiées<textarea name="tasks" rows="3" placeholder="Décrire les activités ou tâches proposées…">${esc(r.tasks||'')}</textarea></label><label class="stage-text-label">Avis et observations sur le projet d’orientation professionnelle<textarea name="observations" rows="5" placeholder="Saisir le compte rendu et les observations du professeur…">${esc(r.observations||'')}</textarea></label><fieldset class="orientation-fieldset"><legend>Avis sur le projet d’orientation professionnelle</legend><label><input type="radio" name="orientation" value="Avis favorable" ${r.orientation==='Avis favorable'?'checked':''}> Avis favorable</label><label><input type="radio" name="orientation" value="Avis réservé" ${r.orientation==='Avis réservé'?'checked':''}> Avis réservé</label></fieldset><p class="stage-save-stamp" id="stageSaveStamp">${savedLabel}</p></fieldset></form>`,`<button class="btn outline" data-action="close-modal">Fermer</button>${r.validated_at?'':`<button class="btn primary" data-action="validate-stage-report" data-id="${id}">Enregistrer définitivement et envoyer le PDF</button>`}`)}
  function collectStageReport(id){const a=state.data.applications.find(x=>x.id===id);const form=$('#stageReportForm');if(!a||!form)throw new Error('Compte rendu introuvable.');const fd=new FormData(form);const ratings={};for(const c of stageCriteria)ratings[c.key]=fd.get(`rating_${c.key}`)||'';return {ratings,tasks:String(fd.get('tasks')||''),observations:String(fd.get('observations')||''),orientation:String(fd.get('orientation')||'')}}
  function makeStagePdf(id,report,savedAt){const a=state.data.applications.find(x=>x.id===id);const s=session(a.session_id);if(!window.jspdf?.jsPDF)throw new Error('Le module PDF ne s’est pas chargé. Vérifiez la connexion Internet puis réessayez.');const {jsPDF}=window.jspdf;const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});const W=210;let y=14;const margin=12;const printable= W-margin*2;const clean=v=>String(v??'').replace(/\s+/g,' ').trim();const line=(text,x,yy,max=printable,size=9,style='normal')=>{doc.setFont('helvetica',style);doc.setFontSize(size);const lines=doc.splitTextToSize(clean(text),max);doc.text(lines,x,yy);return yy+lines.length*(size*.42)+1};const section=(title)=>{if(y>255){doc.addPage();y=14}doc.setFillColor(235,243,247);doc.rect(margin,y,printable,7,'F');doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text(title,margin+2,y+4.8);y+=10};doc.setTextColor(25,49,63);doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text('Compte-rendu de mini-stage',W/2,y,{align:'center'});y+=6;doc.setFontSize(10);doc.text('EREA de Muret',W/2,y,{align:'center'});doc.setDrawColor(153,181,199);doc.setFillColor(240,247,251);doc.roundedRect(12,11,34,13,2,2,'FD');doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text(clean(formation(a.formation_id).code||'—').slice(0,15),29,19.7,{align:'center'});if(branding.logo){try{const img=branding.logo;doc.addImage(img,'JPEG',170,9,27,22,undefined,'FAST')}catch(err){console.warn('Logo non ajouté au compte rendu :',err)}}y+=8;doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text('TS : Très satisfaisant  |  S : Satisfaisant  |  M : Moyen  |  I : Insuffisant  |  TI : Très insuffisant',W/2,y,{align:'center'});y+=7;section('INFORMATIONS SUR LE STAGIAIRE');const age=ageAtStage(a.student_birth_date,s.date);doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text(clean(`${a.student_first_name||''} ${a.student_last_name||''}`),margin,y);y+=7;const info=[['Âge',age],['Établissement',a.college_name||''],['Ville de résidence',a.college_city||''],['Professeur',s.teacher_name||''],['Date du mini-stage',s.date?dateLabel(s.date):'']];for(let i=0;i<info.length;i+=2){y=line(`${info[i][0]} : ${info[i][1]}`,margin,y,90,8,'bold');if(info[i+1])line(`${info[i+1][0]} : ${info[i+1][1]}`,108,y-4,90,8,'bold')}y+=2;section('ÉVALUATION');const colX=[margin,116,132,148,164,180];doc.setFont('helvetica','bold');doc.setFontSize(8);doc.text('Critère',margin+1,y);['TS','S','M','I','TI'].forEach((v,i)=>doc.text(v,colX[i+1]+4,y,{align:'center'}));y+=4;let group='';for(const c of stageCriteria){if(c.group!==group){group=c.group;if(y>267){doc.addPage();y=14}doc.setFillColor(220,233,239);doc.rect(margin,y,printable,5,'F');doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.text(group,margin+1,y+3.5);y+=6}if(y>277){doc.addPage();y=14}doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.text(doc.splitTextToSize(c.label,98),margin+1,y+3);['TS','S','M','I','TI'].forEach((v,i)=>{doc.rect(colX[i+1]+2,y,4,4);if(report.ratings?.[c.key]===v){doc.setFont('helvetica','bold');doc.text('X',colX[i+1]+4,y+3,{align:'center'})}});doc.setDrawColor(210,220,225);doc.line(margin,y+5,198,y+5);y+=6}section('TÂCHES CONFIÉES');y=line(report.tasks||'—',margin,y,printable,9);y+=2;section('AVIS ET OBSERVATIONS SUR LE PROJET D’ORIENTATION');y=line(report.observations||'—',margin,y,printable,9);y+=3;doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(`Avis : ${report.orientation==='Avis favorable'?'[X]':'[ ]'} Avis favorable     ${report.orientation==='Avis réservé'?'[X]':'[ ]'} Avis réservé`,margin,y);y+=9;if(y>270){doc.addPage();y=14}doc.setDrawColor(200,210,215);doc.line(margin,279,W-margin,279);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text(`Document enregistré le ${new Date(savedAt).toLocaleString('fr-FR')}`,margin,284);doc.setFontSize(7);doc.text('EREA de Muret · Compte rendu de mini-stage',margin,289);return doc.output('datauristring').split(',')[1]}
  async function saveStageReport(id,validate=false){
    if(!canAdmin())throw new Error('Action réservée à l’administrateur.');
    const a=state.data.applications.find(x=>x.id===id);
    if(!a||!['confirmed','completed'].includes(a.status)||a.stage_status!=='done')throw new Error('Le stage doit être confirmé et réalisé.');
    if(a.stage_report?.validated_at)throw new Error('Ce compte rendu est déjà validé et ne peut plus être modifié.');
    const report=collectStageReport(id);const now=new Date().toISOString();
    report.saved_at=now;report.status=validate?'validated':'draft';
    report.pdf_base64='';report.pdf_filename='';
    if(validate){
      if(!report.observations.trim()||!report.orientation)throw new Error('Renseignez les observations et l’avis avant validation.');
      report.pdf_base64=makeStagePdf(id,report,now);
      report.pdf_filename=`Compte-rendu-mini-stage-${(a.student_last_name||'eleve').replace(/[^a-z0-9-]/gi,'-')}-${session(a.session_id).date||iso(new Date())}.pdf`;
      report.validated_at=now;report.validated_by=state.user?.id||'demo-admin';
      report.email_status='not_sent';
    }
    await persist('applications',{stage_report:report},id);
    renderPage();toast(validate?'Compte rendu validé : PDF disponible.':'Brouillon enregistré.');
    return report;
  }
  function downloadStagePdf(id){const a=state.data.applications.find(x=>x.id===id);const r=a?.stage_report;if(!r?.validated_at||!r?.pdf_base64){toast('Aucun PDF définitif disponible.',true);return}const bytes=Uint8Array.from(atob(r.pdf_base64),c=>c.charCodeAt(0));const blob=new Blob([bytes],{type:'application/pdf'});const url=URL.createObjectURL(blob);const tab=window.open(url,'_blank');if(!tab){const link=document.createElement('a');link.href=url;link.download=r.pdf_filename||'compte-rendu-mini-stage.pdf';link.click();toast('Ouverture bloquée : PDF téléchargé.')}setTimeout(()=>URL.revokeObjectURL(url),60000)}
  async function sendStageReportEmail(id){if(!canManage())throw new Error('Accès réservé à l’équipe pédagogique.');const a=state.data.applications.find(x=>x.id===id);if(!a?.stage_report?.validated_at||!a?.stage_report?.pdf_base64)throw new Error('Validez d’abord le compte rendu PDF.');const to=a.college_email||'';if(!to){const failed={...a.stage_report,email_status:'failed',email_error:'Adresse e-mail du collège absente.'};await persist('applications',{stage_report:failed},id);throw new Error('Adresse e-mail du collège absente : renseignez-la dans la fiche de l’établissement.')}if(state.demo||!db){const failed={...a.stage_report,email_status:'failed',email_error:'Mode démonstration : aucun courriel réel ne peut être envoyé.'};await persist('applications',{stage_report:failed},id);throw new Error('Mode démonstration : aucun courriel réel ne peut être envoyé. Configurez la fonction serveur pour l’envoi en ligne.')}const {data,error}=await db.functions.invoke('send-stage-report',{body:{applicationId:id,formation:formation(a.formation_id).name,stageDate:session(a.session_id).date||''}});if(error||!data?.success){const failed={...a.stage_report,email_status:'failed',email_error:error?.message||data?.error||'Échec de l’envoi',email_attempt_at:new Date().toISOString()};await persist('applications',{stage_report:failed},id);throw new Error(failed.email_error)}const sent={...a.stage_report,email_status:'sent',email_sent_at:new Date().toISOString(),email_error:''};await persist('applications',{stage_report:sent},id);toast(`Compte rendu envoyé à ${to}.`);renderPage()}
  function printStageReport(id){const a=state.data.applications.find(x=>x.id===id);if(!a)return;const form=$('#stageReportForm');if(!form){toast('Ouvrez le compte rendu avant l’export.',true);return}const fd=new FormData(form);const ratings={};for(const c of stageCriteria)ratings[c.key]=fd.get(`rating_${c.key}`)||'';const r={ratings,tasks:String(fd.get('tasks')||''),observations:String(fd.get('observations')||''),orientation:String(fd.get('orientation')||'')};const s=session(a.session_id);const age=ageAtStage(a.student_birth_date,s.date);const escPrint=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])).replace(/\n/g,'<br>');const w=window.open('','_blank');if(!w){toast('Autorisez les fenêtres contextuelles pour exporter le compte rendu.',true);return}const ratingLabels={TS:'Très satisfaisant',S:'Satisfaisant',M:'Moyen',I:'Insuffisant',TI:'Très insuffisant'};let group='';let rows='';for(const c of stageCriteria){if(c.group!==group){group=c.group;rows+=`<tr class="group"><th colspan="6">${escPrint(group)}</th></tr>`}rows+=`<tr><td>${escPrint(c.label)}</td>${['TS','S','M','I','TI'].map(v=>`<td class="rating">${r.ratings[c.key]===v?'☒':'☐'}</td>`).join('')}</tr>`}w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Compte rendu mini-stage - ${escPrint(a.student_last_name)}</title><style>@page{size:A4 portrait;margin:12mm}body{font:10.5px Arial,sans-serif;color:#172b38;margin:0;position:relative}h1{text-align:center;font-size:17px;margin:0 0 5px} .subtitle{text-align:center;color:#596c77;font-size:9px;margin-bottom:14px}.report-logo{position:absolute;top:0;right:0;width:78px;height:64px;object-fit:contain}.report-code{position:absolute;top:0;left:0;border:1px solid #abc4d5;border-radius:6px;padding:9px;font-size:16px;font-weight:bold;background:#f0f7fb}.student-fullname{font-size:16px;font-weight:bold;margin:12px 0 8px}.identity{display:grid;grid-template-columns:1fr 1fr;gap:0 18px;margin-bottom:12px}.identity div{border-bottom:1px solid #d9e0e4;padding:6px 2px}.label{font-size:8px;text-transform:uppercase;color:#667985;display:block;margin-bottom:3px}.value{font-weight:bold;min-height:12px}.legend{font-size:9px;margin:9px 0}.evaluation{width:100%;border-collapse:collapse;font-size:9.5px}.evaluation th,.evaluation td{border:1px solid #cbd5db;padding:5px}.evaluation thead th{background:#eef3f6;text-align:center}.evaluation th:first-child,.evaluation td:first-child{text-align:left}.evaluation .group th{background:#dce8ee;text-align:left}.rating{text-align:center;font-size:14px}.section{margin-top:12px}.section h2{font-size:11px;background:#eef3f6;padding:6px;margin:0}.writearea{border:1px solid #cbd5db;padding:8px;min-height:44px;white-space:normal;line-height:1.45}.observations{min-height:74px}.opinion{margin-top:12px;padding:8px;border:1px solid #cbd5db}.footer{margin-top:16px;color:#657680;font-size:8px}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><h1>Compte-rendu pour les élèves en mini-stage à l’EREA de Muret</h1><div class="subtitle">TS : Très satisfaisant · S : Satisfaisant · M : Moyen · I : Insuffisant · TI : Très insuffisant</div><div class="report-code">${escPrint(formation(a.formation_id).code||'—')}</div>${branding.logo?`<img class="report-logo" src="${branding.logo}" alt="Logo EREA">`:``}<div class="student-fullname">${escPrint(`${a.student_first_name||''} ${a.student_last_name||''}`.trim())}</div><div class="identity"><div><span class="label">Âge</span><span class="value">${age}</span></div><div><span class="label">Établissement</span><span class="value">${escPrint(a.college_name||'')}</span></div><div><span class="label">Ville de résidence</span><span class="value">${escPrint(a.college_city||'')}</span></div><div><span class="label">Professeur</span><span class="value">${escPrint(s.teacher_name||'')}</span></div><div><span class="label">Date</span><span class="value">${escPrint(s.date?dateLabel(s.date):'')}</span></div></div><table class="evaluation"><thead><tr><th>Évaluation</th><th>TS</th><th>S</th><th>M</th><th>I</th><th>TI</th></tr></thead><tbody>${rows}</tbody></table><section class="section"><h2>Tâches confiées</h2><div class="writearea">${escPrint(r.tasks||'')}</div></section><section class="section"><h2>Avis et observations sur le projet d’orientation professionnelle</h2><div class="writearea observations">${escPrint(r.observations||'')}</div></section><div class="opinion"><strong>Avis :</strong> ${r.orientation==='Avis favorable'?'☒':'☐'} Avis favorable&nbsp;&nbsp;&nbsp;&nbsp; ${r.orientation==='Avis réservé'?'☒':'☐'} Avis réservé</div><div class="footer">EREA de Muret · Compte rendu de mini-stage · Document généré depuis MiniStages EREA</div><script>window.onload=()=>window.print()</script></body></html>`);w.document.close()}
  function openTeacherForm(id){
    if(!canAdmin())return;
    const teacher=id?(state.data.teachers||[]).find(t=>t.id===id):null;
    openModal(id?'Modifier un professeur':'Ajouter un professeur',`<form id="teacherDirectoryForm" class="stack"><label>Nom et prénom *<input name="full_name" maxlength="160" required value="${esc(teacher?.full_name||'')}" placeholder="Ex. Mme Marie Dupont"></label><p class="tiny muted">Cette fiche n’est pas un compte utilisateur. Aucun mot de passe ni accès aux dossiers n’est créé.</p></form>`,`<button class="btn outline" data-action="close-modal">Annuler</button><button class="btn primary" data-action="save-teacher" data-id="${esc(id||'')}">Enregistrer</button>`);
  }
  async function saveTeacher(id){
    if(!canAdmin())throw new Error('Accès réservé à l’administrateur.');
    const form=$('#teacherDirectoryForm');if(!form||!form.reportValidity())return;
    const full_name=String(new FormData(form).get('full_name')||'').trim();
    if(full_name.length<2)throw new Error('Saisissez le nom du professeur.');
    if((state.data.teachers||[]).some(t=>t.id!==id&&t.full_name.trim().toLocaleLowerCase('fr')===full_name.toLocaleLowerCase('fr')))throw new Error('Ce professeur figure déjà dans la liste.');
    await persist('teachers',{full_name,active:true},id||null);
    closeModal();renderPage();toast('Professeur enregistré dans le répertoire.');
  }
  async function toggleTeacher(id){
    if(!canAdmin())throw new Error('Accès réservé à l’administrateur.');
    const t=(state.data.teachers||[]).find(t=>t.id===id);if(!t)return;
    await persist('teachers',{active:t.active===false},id);renderPage();toast('Répertoire mis à jour.');
  }
  async function deleteTeacher(id){
    if(!canAdmin())throw new Error('Accès réservé à l’administrateur.');
    const teacher=(state.data.teachers||[]).find(t=>String(t.id)===String(id));if(!teacher)return;
    if(!window.confirm(`Supprimer définitivement « ${teacher.full_name} » du répertoire des professeurs ? Les créneaux existants ne seront pas modifiés.`))return;
    if(state.demo){state.data.teachers=state.data.teachers.filter(t=>String(t.id)!==String(id));saveDemo();}
    else{if(!db)throw new Error('Connexion Supabase indisponible.');const {error}=await db.from('teacher_directory').delete().eq('id',id);if(error)throw new Error('Suppression refusée par Supabase : '+error.message);await loadLiveData();if(state.data.teachers.some(t=>String(t.id)===String(id)))throw new Error('Suppression non autorisée par les règles de sécurité Supabase (RLS).');}
    renderPage();toast('Professeur supprimé du répertoire.');
  }
  function openUserForm(id){if(!canAdmin())return;const u=id?state.data.users.find(x=>x.id===id):{full_name:'',email:'',role:'college',organization:'',active:true};openModal(id?'Modifier le profil':'Ajouter un profil',`<div class="notice-blue" style="margin-bottom:15px">${id?'Modifiez les informations du profil.':'Le compte sera créé automatiquement. Un courriel d’invitation permettra à l’utilisateur de définir son mot de passe.'}</div><form id="entityForm"><div class="form-grid">${selectField('Rôle *','role',[{value:'admin',label:'Administrateur'},{value:'college',label:'Collège / Lycée'},{value:'lingerie',label:'Lingerie'}],u.role)}${field('Nom affiché *','full_name',u.full_name,'text','required')}${field('Adresse e-mail *','email',u.email,'email','required')}${field('Établissement / organisation','organization',u.organization)}${field('Adresse','address',u.address||u.organization_address||'')}${field('Ville','city',u.city||u.organization_city||'')}${field('Téléphone','phone',u.phone||u.organization_phone||'','tel')}<label class="span-2">Accès<select name="active"><option value="true" ${u.active!==false?'selected':''}>Actif</option><option value="false" ${u.active===false?'selected':''}>Désactivé</option></select></label></div></form>`,`<button type="button" class="btn outline" data-action="close-modal">Annuler</button><button class="btn primary" data-action="save-user" data-id="${id||''}">${id?'Enregistrer le profil':'Créer le compte'}</button>`)}
  function finalPdfFilename(a){const safe=v=>String(v||'Eleve').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9-]/g,'_');return `Convention_${safe(a.student_last_name)}_${safe(a.student_first_name)}_${session(a.session_id).date||'sans-date'}.pdf`}
  // V49 : une seule opération sensible à la fois pour un dossier donné.
  // Le verrou ne remplace pas les contraintes d'unicité et les contrôles côté Supabase.
  const conventionActionsInFlight=new Set();
  async function onceConventionAction(action,id,operation){
    const key=String(action)+':'+String(id);
    if(conventionActionsInFlight.has(key))return;
    conventionActionsInFlight.add(key);
    try{return await operation();}finally{conventionActionsInFlight.delete(key);}
  }
  async function finalizeConvention(id){
    if(state.demo||!db)throw new Error('Supabase est nécessaire pour archiver la convention.');
    const a=state.data.applications.find(x=>x.id===id);if(!a)throw new Error('Réservation introuvable.');
    const version=a.convention_version||1;
    if(!canAdmin()||!signatureFor(a,'guardian')||!signatureFor(a,'origin'))throw new Error('Validation administrateur et signatures préalables obligatoires.');
    if(a.final_pdf_path&&a.finalized_version===version)return;
    const {error:hostError}=await db.rpc('approve_host_convention_signature',{p_application_id:id,p_version:version});if(hostError)throw hostError;await loadLiveData();const blob=printConvention(id,'blob');if(!blob)throw new Error('La génération du PDF a échoué.');
    const path=`${id}/v${version}/${finalPdfFilename(a)}`;
    const {error:uploadError}=await db.storage.from('signed-conventions').upload(path,blob,{contentType:'application/pdf',upsert:false});
    if(uploadError&&!/already exists|duplicate/i.test(uploadError.message||''))throw uploadError;
    const {error}=await db.rpc('finalize_signed_convention',{p_application_id:id,p_version:version,p_pdf_path:path});if(error)throw error;
    await loadLiveData();renderPage();
    try{await sendFinalConventionEmail(id);toast('Convention PDF archivée et envoyée aux deux destinataires.')}catch(mailError){toast('Convention PDF archivée, mais envoi e-mail non confirmé : '+mailError.message+' — utilisez la relance dans Suivi.',true)}
  }
  async function sendFinalConventionEmail(id){
    if(!canAdmin()||!db||state.demo)throw new Error('Envoi réservé à l’administrateur connecté.');
    const a=state.data.applications.find(x=>x.id===id);
    if(!a||!conventionIsFinal(a))throw new Error('La convention doit être générée et archivée avant l’envoi.');
    const {data,error}=await db.functions.invoke('send-final-convention',{body:{applicationId:id}});
    if(error)throw new Error(error.message||'Fonction d’envoi indisponible');
    if(!data?.success)throw new Error(data?.error||'Envoi non confirmé');
    toast('Convention envoyée par e-mail.');
  }
  async function openFinalConvention(id){
    const a=state.data.applications.find(x=>x.id===id);
    if(!a||!conventionIsFinal(a))throw new Error('Convention PDF non encore générée.');
    if(!db)throw new Error('Connexion Supabase requise.');
    const {data,error}=await db.storage.from('signed-conventions').download(a.final_pdf_path);
    if(error||!data)throw new Error(error?.message||'PDF inaccessible');
    const pdfBytes=await data.arrayBuffer();
    const pdfUrl=URL.createObjectURL(new Blob([pdfBytes],{type:'application/pdf'}));
    showConventionPreview(pdfUrl,`Convention signée — ${a.student_first_name||''} ${a.student_last_name||''}`,true,pdfBytes);
  }
  async function downloadFinalConvention(id){
    const a=state.data.applications.find(x=>x.id===id);
    if(!a?.final_pdf_path||a.finalized_version!==(a.convention_version||1))throw new Error('Convention définitive indisponible.');
    const {data,error}=await db.storage.from('signed-conventions').download(a.final_pdf_path);if(error)throw error;
    const url=URL.createObjectURL(data),link=document.createElement('a');link.href=url;link.download=finalPdfFilename(a);link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  async function persist(table,row,id){if(table==='applications'&&id&&Object.prototype.hasOwnProperty.call(row,'stage_status')){const current=state.data.applications.find(a=>a.id===id);if(current?.stage_report?.validated_at&&row.stage_status!==current.stage_status)throw new Error('Statut verrouillé : compte rendu définitif généré.');}if(state.demo){const arr=state.data[table];if(id){const idx=arr.findIndex(x=>x.id===id);if(idx>=0)arr[idx]={...arr[idx],...row};else arr.unshift({...row,id})}else arr.unshift({...row,id:crypto.randomUUID?.()||String(Date.now())});saveDemo();return}const databaseTable=table==='teachers'?'teacher_directory':table;let q;if(id){const {error}=await db.from(databaseTable).update(row).eq('id',id);if(error)throw error}else{const {error}=await db.from(databaseTable).insert(row);if(error){if(table==='applications'&&/créneau complet|aucune place disponible/i.test(error.message||'')){await loadSessionOccupancy().catch(()=>{});throw new Error('Ce créneau vient d’être complet. Actualisez les disponibilités et choisissez un autre créneau.')}throw error}}await loadLiveData()}
  async function archiveDraftConvention(id){
    if(!canAdmin()||!db||state.demo)throw new Error('Administrateur connecté requis.');
    const a=state.data.applications.find(x=>x.id===id);if(!a)throw new Error('Dossier introuvable.');
    const version=a.convention_version||1;
    if(a.draft_pdf_path&&a.draft_pdf_version===version)return;
    const blob=printConvention(id,'blob');if(!blob)throw new Error('Création du PDF impossible.');
    const path=`${id}/v${version}/Convention-en-cours-${Date.now()}.pdf`;
    const {error:uploadError}=await db.storage.from('signed-conventions').upload(path,blob,{contentType:'application/pdf',upsert:false});
    if(uploadError)throw uploadError;
    const {error}=await db.from('applications').update({draft_pdf_path:path,draft_pdf_version:version}).eq('id',id);
    if(error)throw error;
    await loadLiveData();
  }
  async function openArchivedConvention(id){
    const a=state.data.applications.find(x=>x.id===id);if(!a)throw new Error('Dossier introuvable.');
    const final=conventionIsFinal(a),draft=a.draft_pdf_path&&a.draft_pdf_version===(a.convention_version||1);
    const path=final?a.final_pdf_path:draft?a.draft_pdf_path:null;
    if(!path)throw new Error('PDF non encore archivé pour cette version.');
    const {data,error}=await db.storage.from('signed-conventions').download(path);
    if(error||!data)throw new Error(error?.message||'Accès au PDF refusé');
    const pdfBytes=await data.arrayBuffer();
    const pdfUrl=URL.createObjectURL(new Blob([pdfBytes],{type:'application/pdf'}));
    showConventionPreview(pdfUrl,`Convention archivée — ${a.student_first_name||''} ${a.student_last_name||''}`,true,pdfBytes);
  }
  async function sendGuardianSignatureRequest(id){
    if(!canAdmin()||state.demo||!db)throw new Error('Envoi réservé à l’administrateur connecté.');
    const {data,error}=await db.functions.invoke('send-guardian-signature-request',{body:{applicationId:id,siteUrl:window.location.origin+window.location.pathname}});
    if(error)throw new Error(error.message||'Échec de la fonction de messagerie');
    if(!data?.success)throw new Error(data?.error||'E-mail non envoyé');
    try{await archiveDraftConvention(id);toast('Demande envoyée et convention PDF archivée.')}catch(archiveError){toast('E-mail envoyé, mais archivage PDF non réalisé : '+archiveError.message,true)}
  }
  function openSignatureFromLink(){
    const hash=new URLSearchParams(window.location.hash.slice(1));const id=hash.get('sign-guardian');
    if(!id)return;
    if(!/^[0-9a-f-]{36}$/i.test(id)){window.history.replaceState(null,'',window.location.pathname);return}
    if(!state.user||!state.profile){setNotice('Connectez-vous avec l’adresse e-mail du responsable légal pour consulter et signer la convention.');return}
    const a=state.data.applications.find(x=>x.id===id);
    if(a&&guardianEligible(a)&&['confirmed','completed'].includes(a.status)&&!signatureFor(a,'guardian')){
      window.history.replaceState(null,'',window.location.pathname);openGuardianSignature(id);
    }else toast('Convention indisponible ou accès non autorisé. Vérifiez votre compte.',true);
  }
  async function deleteApplication(id){
    if(!canAdmin())throw new Error('Suppression réservée aux administrateurs.');
    const a=state.data.applications.find(x=>x.id===id);
    if(!a)throw new Error('Réservation introuvable.');
    const name=[a.student_first_name,a.student_last_name].filter(Boolean).join(' ');
    if(!window.confirm(`Supprimer définitivement la réservation de ${name} ?\n\nCette action est irréversible et libérera la place du créneau.\nLes signatures et liens associés seront également supprimés. Les conventions finalisées et leurs signatures seront également supprimées de la base. Pensez à archiver les documents nécessaires avant de continuer.`))return;
    if(!window.confirm(`CONFIRMATION FINALE : effacer définitivement le dossier de ${name} et toutes ses signatures ?`))return;
    if(state.demo){
      state.data.applications=state.data.applications.filter(x=>x.id!==id);
      saveDemo();
    }else{
      const {error}=await db.rpc('admin_delete_application_any_status',{p_application_id:id});
      if(error)throw error;
      await loadLiveData();
    }
    renderPage();toast('Réservation supprimée définitivement. La place est libérée.');
  }
  async function changeStatus(id,status){if(!canAdmin()){toast('Seul un administrateur peut modifier le statut.',true);return}const a=state.data.applications.find(x=>x.id===id);if(!a)return;try{if(!state.demo&&db&&status==='confirmed'){const {error}=await db.rpc('confirm_stage_with_host_signature',{p_application_id:id});if(error)throw error;await loadLiveData()}else{await persist('applications',{status},id)}renderPage();toast(`Inscription ${statusLabel(status).toLowerCase()}.`);if(status==='confirmed'&&!state.demo){try{await sendGuardianSignatureRequest(id)}catch(mailError){toast('Inscription confirmée, mais e-mail de signature non envoyé : '+mailError.message,true)}}}catch(e){toast('Modification impossible : '+e.message,true)}}
  function csvCell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
  function exportApplications(){const headers=['Prénom élève','Nom élève','Date de naissance','Classe','Adresse élève','Collège','Ville collège','SIRET','Adresse collège','Téléphone collège','E-mail collège','Pointure chaussures','Taille pantalon','Taille haut','Formation','Date mini-stage','Début','Fin','Contact','Adresse responsable','E-mail','Téléphone','Téléphone secondaire','Responsable légal 2','Problème médical','PAI','AESH','Repas','Prise en charge repas','Assurance','Statut','État du mini-stage','Compte rendu tâches','Compte rendu observations','Avis orientation','Date demande','Notes'];const lines=state.data.applications.map(a=>{const s=session(a.session_id);return [a.student_first_name,a.student_last_name,a.student_birth_date,a.student_class,a.student_address,a.college_name,a.college_city,a.college_siret,a.college_address,a.college_phone,a.college_email,a.shoe_size,a.pants_size,a.top_size,formation(a.formation_id).name,s.date,s.start_time,s.end_time,a.contact_name,a.parent_address,a.contact_email,a.contact_phone,a.contact_phone2,a.parent2_name,a.medical_issue,a.pai,a.aesh,a.meal,a.meal_payer,a.insurance,statusLabel(a.status),a.stage_status==='done'?'Stage effectué':a.stage_status==='absent'?'Élève absent':'',a.stage_report?.tasks||'',a.stage_report?.observations||'',a.stage_report?.orientation||'',a.created_at?new Date(a.created_at).toLocaleDateString('fr-FR'):'',a.notes].map(csvCell).join(';')});const blob=new Blob(['\ufeff'+[headers.map(csvCell).join(';'),...lines].join('\r\n')],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`ministages-inscriptions-${iso(new Date())}.csv`;a.click();URL.revokeObjectURL(url);toast('Export CSV téléchargé.')}
  function setupInfo(){openModal('Configuration du portail',`<div class="notice-blue">Pour un accès Internet multi-utilisateurs, l’application doit être publiée sur un hébergement web et reliée à une base en ligne. Vous pouvez utiliser les offres gratuites de GitHub Pages (site statique) et Supabase (authentification + base de données). Ce n’est pas un hébergement « sans serveur » : ce sont des services hébergés avec une offre gratuite.</div><h3 style="margin:18px 0 8px">Étapes</h3><ol style="font-size:12px;line-height:1.9;color:#536874;padding-left:20px"><li>Créer un projet Supabase.</li><li>Exécuter le fichier <code>supabase/schema.sql</code> dans SQL Editor.</li><li>Créer un compte administrateur dans Authentication.</li><li>Créer le profil administrateur avec la requête SQL décrite dans le README.</li><li>Renseigner l’URL du projet et la clé publique anon dans <code>config.js</code>.</li><li>Publier le dossier sur GitHub Pages.</li></ol><p class="tiny muted">Ne placez jamais la clé secrète/service_role dans le code du navigateur.</p>`,`<button type="button" class="btn primary" data-action="close-modal">Compris</button>`)}
  document.addEventListener('click',async e=>{const el=e.target.closest('[data-action]');if(!el)return;const action=el.dataset.action,id=el.dataset.id||'';if(action==='new-custom-school'){customSchoolForm();return}if(action==='edit-custom-school'){customSchoolForm(id);return}if(action==='save-custom-school'){try{await saveCustomSchool(id)}catch(err){toast('Annuaire : '+err.message,true)}return}if(action==='delete-custom-school'){try{await deleteCustomSchool(id)}catch(err){toast('Annuaire : '+err.message,true)}return}if(action==='send-help-request'){try{await sendHelpRequest(el)}catch(err){toast('Envoi impossible : '+(err.message||'erreur inconnue'),true)}return}if(action==='delete-application'){try{await deleteApplication(id)}catch(err){toast('Suppression impossible : '+err.message,true)}return}if(action==='download-lingerie-labels'){try{downloadLingerieLabels()}catch(err){toast(err.message||String(err),true)}return}if(action==='export-gestion'){try{exportGestionPdf()}catch(err){toast('Export gestion : '+(err.message||err),true)}return}if(action==='confirmed-register-pdf'||action==='confirmed-register-print'){try{confirmedRegisterPdf(action==='confirmed-register-print')}catch(err){toast('Export PDF : '+(err.message||err),true)}return}if(action==='print-organisation'){window.print();return}if(action==='refresh-signatures'){try{await loadLiveData();renderPage();toast('Suivi des signatures actualisé.')}catch(err){toast(err.message,true)}return}if(action==='save-mail-demo'){try{await saveMailDemo()}catch(err){toast('Mode test : '+err.message,true)}return}if(action==='close-modal'){requestCloseModal();return}if(action==='clear-guardian-signature'){const canvas=$('#guardianSignatureCanvas');canvas?.getContext('2d').clearRect(0,0,canvas.width,canvas.height);signatureCanvasDirty=false;return}if(action==='save-head-name'){try{if(!canAdmin()||!db)throw new Error('Administrateur connecté requis');const value=$('#headNameInput')?.value.trim()||'';const {error}=await db.from('ministages_settings').upsert({key:'head_name',value},{onConflict:'key'});if(error)throw error;branding.headName=value;toast('Nom enregistré pour les conventions.')}catch(err){toast('Enregistrement impossible : '+err.message,true)}return}if(action==='upload-branding'){await uploadBranding(el.dataset.kind);return}if(action==='sign-guardian'){openGuardianSignature(id);return}if(action==='sign-origin'){try{openOriginSignature(id)}catch(err){toast(err.message,true)}return}if(action==='clear-origin-signature'){const c=$('#originSignatureCanvas');if(c){c.getContext('2d').clearRect(0,0,c.width,c.height);window.originSignatureDirty=false}return}if(action==='save-origin-signature'){try{await onceConventionAction('save-origin-signature',id,()=>saveOriginSignature(id))}catch(err){toast(err.message,true)}return}if(action==='remind-guardian'||action==='remind-origin'){
    if(el.disabled)return;
    const label=action==='remind-guardian'?'responsable légal':'établissement d’origine';
    if(!window.confirm('Renvoyer une demande de signature au '+label+' ?'))return;
    el.disabled=true;
    try{await onceConventionAction(action,id,async()=>{
      if(action==='remind-guardian'){
        const a=state.data.applications.find(x=>x.id===id);
        if(!a||signatureFor(a,'guardian')||conventionIsFinal(a)||!['confirmed','completed'].includes(a.status))throw new Error('Cette signature n’est plus en attente.');
        await sendGuardianSignatureRequest(id);
        toast('Nouveau lien de signature envoyé au responsable légal.');
      }else await remindOriginSignature(id);
    });}catch(err){toast('Relance impossible : '+(err.message||err),true)}finally{el.disabled=false}
    return;
  }if(action==='send-guardian-request'){try{await onceConventionAction('send-guardian-request',id,()=>sendGuardianSignatureRequest(id))}catch(err){toast(err.message,true)}return}if(action==='review-convention'){try{reviewConvention(id)}catch(err){toast(err.message,true)}return}if(action==='validate-final-convention'){try{await onceConventionAction('finalize-convention',id,async()=>{await finalizeConvention(id);closeModal()})}catch(err){toast(err.message,true)}return}if(action==='finalize-convention'){try{await onceConventionAction('finalize-convention',id,()=>finalizeConvention(id))}catch(err){toast(err.message||String(err),true)}return}if(action==='open-archived-convention'){try{await openArchivedConvention(id)}catch(err){toast('Convention : '+err.message,true)}return}if(action==='open-final-convention'){try{await openFinalConvention(id)}catch(err){toast(err.message||String(err),true)}return}if(action==='resend-final-convention'){try{await onceConventionAction('resend-final-convention',id,()=>sendFinalConventionEmail(id))}catch(err){toast('Échec de l’envoi : '+err.message,true)}return}if(action==='download-final-convention'){try{await downloadFinalConvention(id)}catch(err){toast(err.message||String(err),true)}return}const saveActions=['update-recovered-password','save-stage-report','validate-stage-report','print-stage-report','save-formation','save-session','save-application','save-user','save-guardian-signature','save-teacher','save-bulk-sessions'];if(saveActions.includes(action)){if(el.dataset.saving==='true')return;el.dataset.saving='true';el.dataset.originalLabel=el.textContent;el.disabled=true;el.textContent='Enregistrement…'}try{if(action==='lingerie-return'){
        if(!['lingerie','admin'].includes(state.profile?.role))throw new Error('Accès interdit.');
        if(!window.confirm('Confirmer le retour des vêtements pour cet élève ?'))return;
        const {error}=await db.rpc('validate_lingerie_return',{p_application_id:id});
        if(error)throw error;
        const result=await db.rpc('get_lingerie_inscriptions');if(result.error)throw result.error;
        state.lingerieRows=result.data||[];renderPage();toast('Retour validé.');return;
      }
      if(action==='save-guardian-signature')await onceConventionAction('save-guardian-signature',id,()=>saveGuardianSignature(id));if(action==='update-recovered-password'){const password=$('#recoveryPassword')?.value||'';const confirm=$('#recoveryPasswordConfirm')?.value||'';const strong=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;if(!strong.test(password))throw new Error('Le mot de passe doit contenir 10 caractères minimum, une majuscule, une minuscule, un chiffre et un caractère spécial.');if(password!==confirm)throw new Error('Les deux mots de passe ne correspondent pas.');const {error}=await db.auth.updateUser({password});if(error)throw error;closeModal();toast('Mot de passe modifié avec succès.')}if(action==='origin-formation'){await loadSessionOccupancy();state.originFormationId=id;renderPage();return}if(action==='origin-formations-back'){state.originFormationId=null;renderPage();return}if(action==='origin-register'){await loadSessionOccupancy();openApplicationForm(null,id);return}if(action==='new-formation')openFormationForm();if(action==='edit-formation')openFormationForm(id);if(action==='v78-bulk-open'){await v78BulkSetActive(true);return;}if(action==='v78-bulk-close'){await v78BulkSetActive(false);return;}if(action==='v79-bulk-delete'){await v79BulkDeleteSessions();return;}if(action==='new-session')openSessionForm();if(action==='bulk-sessions')openBulkSessions();if(action==='preview-bulk-sessions')renderBulkPreview();if(action==='save-bulk-sessions')await saveBulkSessions();if(action==='edit-session')openSessionForm(id);if(action==='new-application'){const role=String(state.profile?.role||'').trim().toLowerCase();if(role==='college'){state.originFormationId=null;closeModal();setPage('formations');return;}await loadSessionOccupancy();openApplicationForm();return;}if(action==='edit-application')openApplicationForm(id);if(action==='print-convention')printConvention(id);if(action==='reservation-detail')openReservationDetail(id);if(action==='stage-report')openStageReport(id);if(action==='save-stage-report'){await saveStageReport(id,false);closeModal()}if(action==='validate-stage-report'){await saveStageReport(id,true);closeModal();try{await sendStageReportEmail(id)}catch(mailError){toast('PDF enregistré définitivement, mais courriel non envoyé : '+mailError.message,true)}}if(action==='print-stage-report'){await saveStageReport(id,true);downloadStagePdf(id);closeModal()}if(action==='download-stage-pdf'){downloadStagePdf(id)}if(action==='send-stage-email'){await sendStageReportEmail(id)}if(action==='new-teacher')openTeacherForm();if(action==='edit-teacher')openTeacherForm(id);if(action==='save-teacher')await saveTeacher(id);if(action==='toggle-teacher')await toggleTeacher(id);if(action==='delete-teacher')await deleteTeacher(id);if(action==='new-user')openUserForm();if(action==='edit-user')openUserForm(id);if(action==='reset-user-password'){if(!canAdmin())throw new Error('Action réservée à l’administrateur.');const email=el.dataset.email||'';if(!email)throw new Error('Adresse e-mail manquante.');if(state.demo||!db){toast('Mode démonstration : aucun e-mail de réinitialisation réel ne peut être envoyé.',true)}else{const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});if(error)throw error;toast('Lien de réinitialisation envoyé à '+email+'.')}}if(action==='export-apps')exportApplications();if(action==='show-setup')setupInfo();if(action==='set-status'&&canAdmin())await changeStatus(id,el.dataset.status);if(action==='delete-session'){await deleteUnreservedSession(id);return;}if(action==='toggle-session'){const s=state.data.sessions.find(x=>x.id===id);if(s){await persist('sessions',{active:!s.active},id);renderPage();toast(s.active?'Créneau fermé.':'Créneau ouvert.')}}if(action==='save-formation'){const form=$('#entityForm');if(!form.reportValidity())return;const d=Object.fromEntries(new FormData(form));d.active=d.active==='true';await persist('formations',d,id||null);closeModal();renderPage();toast('Formation enregistrée.')}if(action==='save-session'){const form=$('#entityForm');if(!form.reportValidity())return;const d=Object.fromEntries(new FormData(form));d.capacity=Math.min(2,Math.max(1,Number(d.capacity)||1));d.active=d.active==='true';await persist('sessions',d,id||null);closeModal();renderPage();toast('Créneau enregistré.')}if(action==='save-application'){if(!id)await loadSessionOccupancy();const form=$('#entityForm');if(!form.reportValidity())return;const d=Object.fromEntries(new FormData(form));if(d.college_siret&&!/^\d{14}$/.test(d.college_siret)){toast('Le SIRET doit contenir exactement 14 chiffres.',true);return}if(!d.session_id){toast('Choisissez un créneau disponible pour cette formation.',true);return}if(!canAdmin()&&state.profile?.role!=='college'){delete d.college_siret;}if(!canAdmin())d.status=id?(state.data.applications.find(x=>x.id===id)?.status||'pending'):'pending';d.contact_name=[d.contact_first_name,d.contact_last_name].filter(Boolean).join(' ');if(!id)d.created_at=new Date().toISOString();if(!state.demo&&!canManage())d.created_by=state.user?.id||null;if(!id&&state.profile?.role==='college'){const locked=$('#entityForm')?.querySelector('[name="session_id"]');if(locked?.type==='hidden'){const actual=state.data.sessions.find(s=>s.id===locked.value);if(!actual||d.formation_id!==actual.formation_id)throw new Error('Formation et créneau incohérents.');}}const chosenSession=state.data.sessions.find(s=>s.id===d.session_id);if(!chosenSession||chosenSession.formation_id!==d.formation_id){toast('Le créneau choisi ne correspond pas à la formation.',true);return}if(!id&&!sessionBookable(chosenSession)){toast('Ce créneau est déjà pré-réservé, complet, fermé ou à moins de 7 jours. Actualisez les disponibilités.',true);return}if(!id){const norm=v=>String(v||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');const duplicate=state.data.applications.some(a=>!['cancelled','refused'].includes(a.status)&&norm(a.student_first_name)===norm(d.student_first_name)&&norm(a.student_last_name)===norm(d.student_last_name)&&!!a.student_birth_date&&a.student_birth_date===d.student_birth_date);if(duplicate){toast('Cet élève possède déjà une demande de mini-stage active. Une seule formation et un seul créneau sont autorisés.',true);return}}await persist('applications',d,id||null);const student=`${d.student_first_name||''} ${d.student_last_name||''}`.trim();const subject=`Confirmation de demande de mini-stage – ${student}`;const body=`Bonjour,

Votre demande de mini-stage a bien été enregistrée.

Élève : ${student}
Formation : ${formation(d.formation_id).name}
Date : ${dateLabel(chosenSession.date)}
Créneau : ${chosenSession.start_time||''}${chosenSession.end_time?' – '+chosenSession.end_time:''}

Cette confirmation concerne l’enregistrement de la demande. L’accueil définitif reste soumis à la validation de l’EREA.

Cordialement,
EREA de Muret`;const to=d.contact_email||d.college_email||'';closeModal();renderPage();toast('Dossier enregistré. Préparation du courriel de confirmation…');if(to){const mailto=`mailto:${encodeURIComponent(to)}?cc=${encodeURIComponent(d.college_email||'')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;window.location.href=mailto;}else{toast('Dossier enregistré, mais aucune adresse e-mail n’est renseignée.',true)}}if(action==='save-user'){const form=$('#entityForm');if(!form.reportValidity())return;const d=Object.fromEntries(new FormData(form));d.active=d.active==='true';if(state.demo){await persist('users',d,id||null)}else{if(id){toast('Modification des profils existants : utilisez Supabase pour le moment.',true);return}const {data:created,error:createError}=await db.functions.invoke('admin-create-user',{body:d});if(createError)throw new Error(createError.message||'Impossible de créer le compte');if(!created?.ok)throw new Error(created?.error||'La création du compte a échoué');await loadLiveData()}closeModal();renderPage();toast(id?'Profil enregistré.':'Compte créé et invitation envoyée.')}}catch(err){if(['send-stage-email'].includes(action))renderPage();console.error('Échec de l’action MiniStages :',action,err);toast('Échec de l’opération : '+(err?.message||'connexion ou enregistrement impossible')+'. Vérifiez le résultat avant de réessayer.',true)}finally{if(el.dataset.saving==='true'){el.disabled=false;el.textContent=el.dataset.originalLabel||el.textContent;delete el.dataset.saving;delete el.dataset.originalLabel}}});
  $$('[data-toggle-password]').forEach(button=>button.addEventListener('click',()=>{const field=document.getElementById(button.dataset.togglePassword);if(!field)return;const visible=field.type==='password';field.type=visible?'text':'password';button.setAttribute('aria-pressed',String(visible));button.setAttribute('aria-label',visible?'Masquer le mot de passe':'Afficher le mot de passe');button.title=visible?'Masquer le mot de passe':'Afficher le mot de passe';}));
  $('#forgotPasswordButton')?.addEventListener('click',()=>{$('#loginForm').classList.add('hidden');$('#showSignupButton').classList.add('hidden');$('#forgotPasswordPanel').classList.remove('hidden');$('#forgotEmail').value=$('#loginEmail').value||'';$('#loginNotice').classList.add('hidden')});
  $('#backFromForgot')?.addEventListener('click',()=>{$('#forgotPasswordPanel').classList.add('hidden');$('#loginForm').classList.remove('hidden');$('#showSignupButton').classList.remove('hidden')});
  $('#forgotPasswordForm')?.addEventListener('submit',async e=>{e.preventDefault();const email=$('#forgotEmail').value.trim();if(!db){setNotice('La réinitialisation nécessite une connexion Supabase.');return}const btn=$('#sendForgotButton');btn.disabled=true;try{const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});if(error)throw error;setNotice('Si un compte existe pour cette adresse, un lien de réinitialisation vient de lui être envoyé. Vérifiez également les courriers indésirables.')}catch(err){setNotice('Impossible de demander la réinitialisation : '+err.message)}finally{btn.disabled=false}});
  $('#loginForm').addEventListener('submit',e=>{e.preventDefault();$('#loginNotice').classList.add('hidden');login($('#loginEmail').value.trim(),$('#loginPassword').value)});
  $('#showSignupButton').addEventListener('click',()=>{$('#loginForm').classList.add('hidden');$('#loginNotice').classList.add('hidden');$('#showSignupButton').classList.add('hidden');$('#signupPanel').classList.remove('hidden')});
  $('#hideSignupButton').addEventListener('click',()=>{$('#signupPanel').classList.add('hidden');$('#loginForm').classList.remove('hidden');$('#showSignupButton').classList.remove('hidden')});
  $('#showSignupButton').addEventListener('click',()=>initSignupSchoolDirectory());
  $('#signupSchoolSearch').addEventListener('input',e=>renderSignupSchoolOptions(e.target.value));
  $('#signupSiret')?.addEventListener('change',()=>{if(window.selectedSignupSchool)void checkSignupSchoolAccount(window.selectedSignupSchool)});
  $('#signupSchoolResults').addEventListener('click',e=>{const b=e.target.closest('[data-school-uai]');if(b)selectSignupSchool(b.dataset.schoolUai)});
  $('#signupSchoolSearch').addEventListener('keydown',e=>{if(e.key==='Escape'){$('#signupSchoolResults').classList.add('hidden');e.target.setAttribute('aria-expanded','false')}});
  $('#signupForm').addEventListener('submit',async e=>{e.preventDefault();const email=$('#signupEmail').value.trim().toLowerCase();const organization=$('#signupOrganization').value.trim();const password=$('#signupPassword').value;const confirm=$('#signupPasswordConfirm').value;const strong=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
    if(!strong.test(password)){setNotice('Mot de passe insuffisant : 10 caractères minimum, avec une majuscule, une minuscule, un chiffre et un caractère spécial.');$('#loginNotice').classList.remove('hidden');return}
    if(password!==confirm){setNotice('Les deux mots de passe ne correspondent pas.');$('#loginNotice').classList.remove('hidden');return}
    if(!db){setNotice('La création de compte nécessite la configuration de Supabase. La démonstration ne crée pas de compte réel.');$('#loginNotice').classList.remove('hidden');return}
    const selectedSchool=window.selectedSignupSchool?.name===organization?window.selectedSignupSchool:null;
    if(!selectedSchool){setNotice('Sélectionnez un établissement dans les résultats de l’annuaire.');$('#loginNotice').classList.remove('hidden');return;}
    const signupSiret=String($('#signupSiret')?.value||'').trim();
    if(signupSiret&&!/^\d{14}$/.test(signupSiret)){setNotice('SIRET : renseignez exactement 14 chiffres.');$('#loginNotice').classList.remove('hidden');return;}
    if(signupAccountBlocked){setNotice('Vérification de l’établissement non terminée ou compte déjà existant.');$('#loginNotice').classList.remove('hidden');return;}
    const button=$('#signupForm button[type="submit"]');button.disabled=true;button.textContent='Vérification en cours…';
    try{if(!selectedSchool.uai)throw new Error('Le code UAI de cet établissement est absent. Contactez l’administrateur.');
      const {data:alreadyExists,error:checkError}=await db.rpc('ministages_school_account_exists',{school_uai:selectedSchool.uai,school_siret:signupSiret,school_name:organization});
      if(checkError)throw new Error('Vérification du compte indisponible. Demandez à l’administrateur de déployer la migration SQL V63.');
      if(alreadyExists)throw new Error('Un compte existe déjà pour cet établissement. Veuillez vous connecter ou utiliser « Mot de passe oublié ? ».');
      button.textContent='Création en cours…';
    const {data,error}=await db.auth.signUp({email,password,options:{data:{organization,full_name:organization,signup_source:'college_portal',organization_city:window.selectedSignupSchool?.name===organization?window.selectedSignupSchool.city:'',organization_address:window.selectedSignupSchool?.name===organization?window.selectedSignupSchool.address:'',organization_phone:window.selectedSignupSchool?.name===organization?window.selectedSignupSchool.phone:'',organization_uai:selectedSchool?.uai||'',organization_siret:signupSiret},emailRedirectTo:(window.MiniStagesPublic?.signupRedirectUrl?.()||window.location.origin+window.location.pathname)}});if(error)throw error;
      $('#signupForm').reset();$('#signupPanel').classList.add('hidden');$('#loginForm').classList.remove('hidden');$('#showSignupButton').classList.remove('hidden');setNotice(data.session?'Compte établissement créé. Vous pouvez vous connecter.':'Demande de compte établissement enregistrée. Consultez la boîte e-mail saisie pour confirmer l’adresse avant de vous connecter.');$('#loginNotice').classList.remove('hidden');
    }catch(err){setNotice('Création impossible : '+(err.message||'erreur inconnue'));$('#loginNotice').classList.remove('hidden')}finally{button.disabled=false;button.textContent='Créer mon compte'}
  });
  $('#helpButton')?.addEventListener('click',openHelpForm);$('#logoutButton').addEventListener('click',logout);$('#menuButton').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));$$('#mainNav [data-page]').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.page)));
  if(configured){db.auth.getSession().then(async({data})=>{if(data.session){state.user=data.session.user;const {data:p}=await db.from('profiles').select('*').eq('id',state.user.id).single();if(p){state.profile=p;if(!window.MiniStagesPublic?.peekPending?.()&&p.role==='college')state.page='applications';try{await loadLiveData();showApp();openOriginFromEmail()}catch(e){showLogin();setNotice('Erreur de chargement : '+e.message)}}else showLogin()}else showLogin()});db.auth.onAuthStateChange(async(event,session)=>{if(event==='PASSWORD_RECOVERY'&&session){openModal('Choisir un nouveau mot de passe',`<p class="muted" style="margin-bottom:14px">Choisissez un mot de passe respectant les règles de sécurité.</p><form id="passwordRecoveryForm" class="stack"><label>Nouveau mot de passe<input id="recoveryPassword" type="password" required minlength="10" autocomplete="new-password"></label><label>Confirmer le mot de passe<input id="recoveryPasswordConfirm" type="password" required minlength="10" autocomplete="new-password"></label></form>`,`<button class="btn primary" data-action="update-recovered-password">Enregistrer le nouveau mot de passe</button>`)}if(!session&&!state.demo){state.user=null;state.profile=null;showLogin()}})}
})();