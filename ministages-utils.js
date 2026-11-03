/* MiniStages V51 — utilitaires purs partagés.
   Aucune donnée personnelle, aucun accès réseau, aucune dépendance Supabase. */
(function(){
  'use strict';
  function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function ageAtStage(birth,stage){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(birth||''))||!/^\d{4}-\d{2}-\d{2}$/.test(String(stage||'')))return '—';
    const [by,bm,bd]=birth.split('-').map(Number),[sy,sm,sd]=stage.split('-').map(Number);
    const age=sy-by-(sm<bm||(sm===bm&&sd<bd)?1:0);
    return age>=10&&age<=25?`${age} ans`:'Date de naissance à vérifier';
  }
  function shortTime(v){const m=String(v||'').match(/^(\d{1,2}):(\d{2})/);return m?m[1].padStart(2,'0')+':'+m[2]:'—'}
  function originFormationColor(f){
    const code=String(f?.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    const name=String(f?.name||'').toLowerCase();
    if(code.includes('PSR')||/production.*service|restaur/.test(name))return 'origin-psr';
    if(code.endsWith('JP')||code.includes('JARDINIER')||/jardinier|paysag/.test(name))return 'origin-jp';
    if(code.includes('MAH')||/horticul|mara[iî]ch|agricol/.test(name))return 'origin-mah';
    return 'origin-other';
  }
  function roleLabel(r){return ({admin:'Administrateur',college:'Collège / Lycée',family:'Famille',lingerie:'Lingerie',teacher:'Équipe pédagogique'})[r]||r||'Utilisateur'}
  function statusLabel(s){return ({pending:'À traiter',confirmed:'Confirmée',refused:'Refusée',cancelled:'Annulée',completed:'Réalisée'})[s]||s}
  function statusClass(s){return ({pending:'pending',confirmed:'confirmed',refused:'refused',cancelled:'cancelled',completed:'completed'})[s]||'completed'}
  Object.defineProperty(window,'MiniStagesUtils',{
    value:Object.freeze({esc,ageAtStage,shortTime,originFormationColor,roleLabel,statusLabel,statusClass}),
    writable:false,configurable:false
  });
})();
