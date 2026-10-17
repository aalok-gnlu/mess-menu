(function(){
'use strict';
const M=MessMenu, $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=M.indiaKey(),weekStart=M.addDays(selected,-((M.dayNumber(selected)+6)%7)),featured=null;
const opened=new Map();
const format=(key,options)=>new Intl.DateTimeFormat('en-IN',{...options,timeZone:'UTC'}).format(new Date(key+'T12:00:00Z'));
const plate=`<div class="plate-art"><svg viewBox="0 0 300 300" role="img" aria-label="An illustrated place setting"><circle cx="150" cy="150" r="110" fill="#f7f3e8"/><circle cx="150" cy="150" r="87" fill="none" stroke="#adb392" stroke-width="2"/><circle cx="150" cy="150" r="73" fill="none" stroke="#d6d4c5"/><path d="M28 86v43m-9-43v27q0 15 9 16t9-16V86M28 129v88M270 86v131m0-131c-28 0-28 64 0 64" fill="none" stroke="#294c35" stroke-width="5" stroke-linecap="round"/><path d="M120 155q30-43 60 0M124 173q26 20 52 0" fill="none" stroke="#b94b28" stroke-width="4" stroke-linecap="round"/><circle cx="141" cy="153" r="3" fill="#294c35"/><circle cx="162" cy="153" r="3" fill="#294c35"/></svg></div>`;
const clock='<svg class="clock-icon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="M10 5v5l4 2"/></svg>';
function credits(photo){return `<a href="${esc(photo.source)}" target="_blank" rel="noopener">${esc(photo.author)} · ${esc(photo.license)}</a>`;}
function shortDish(r){return r.items[0].split(/\s+OR\s+/)[0].trim();}
function imageMarkup(r,cls=''){
 return r.photo?`<img class="${cls}" src="${esc(r.photo.url)}" alt="Illustrative ${esc(r.photo.dish||shortDish(r))}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:'';
}
function getFeatured(rows){
 if(featured!==null)return featured;
 const now=Date.now(),running=rows.findIndex(r=>now>=r.startMs&&now<r.endMs);
 if(running>=0)return running;
 const next=rows.findIndex(r=>now<r.startMs);return next<0?3:next;
}
function renderCalendar(){
 const today=M.indiaKey();
 $('week-label').textContent=`${format(weekStart,{day:'numeric',month:'short'})} — ${format(M.addDays(weekStart,6),{day:'numeric',month:'short',year:'numeric'})}`;
 $('selected-day').textContent=(selected===today?'Today, ':'')+format(selected,{weekday:'long',day:'numeric',month:'short'});
 $('day-strip').replaceChildren();
 for(let i=0;i<7;i++){
  const key=M.addDays(weekStart,i),b=document.createElement('button');b.type='button';b.className='day'+(key===today?' is-today':'');
  b.setAttribute('aria-pressed',String(key===selected));b.setAttribute('aria-label',format(key,{weekday:'long',day:'numeric',month:'long'})+(key===today?', today':''));
  b.innerHTML=`<span>${esc(format(key,{weekday:'short'}))}</span><strong>${Number(key.slice(-2))}</strong>`;
  b.onclick=()=>{selected=key;featured=null;render();};$('day-strip').append(b);
 }
}
function renderWeek(){
 $('week-body').innerHTML=Array.from({length:7},(_,i)=>{
  const key=M.addDays(weekStart,i);
  return `<tr class="${key===selected?'selected':''}"><th scope="row">${esc(format(key,{weekday:'short',day:'numeric',month:'short'}))}</th>${[0,1,2,3].map(m=>`<td>${esc(M.meal(key,m).items[0].replaceAll(' OR ',' or '))}</td>`).join('')}</tr>`;
 }).join('');
}
function renderSpotlight(rows,f){
 $('spotlight').dataset.meal=String(f);
 const r=rows[f],status=M.status(r),alternatives=r.items[0].split(/\s+OR\s+/).slice(1),serving=status.text==='Serving Now';
 const caption=r.photo?`${credits(r.photo)} · illustrative photo`:'A little illustration for a dish still awaiting its photo.';
 $('spotlight').innerHTML=`<div class="spot-copy"><span class="live-label ${serving?'serving':''}"><span class="status-dot" aria-hidden="true"></span>${esc(status.text)} · ${esc(r.mealName)}</span><p class="meal-kicker">${['The morning ritual.','A well-earned lunch.','The afternoon intermission.','The final helping.'][f]}</p><h2>${esc(shortDish(r))}</h2>${alternatives.length?`<p class="alternatives">Also listed: ${esc(alternatives.join(' or '))}</p>`:''}<p class="serving-time">${clock}${esc(r.timeStr)}${r.timingOverride?' · revised timings':''}</p><a class="menu-jump" href="#meal-${f}">Everything on the plate <span aria-hidden="true">↘</span></a></div><figure class="spot-photo ${r.photo?'':'no-photo'}"><div class="photo-frame">${r.photo?imageMarkup(r).replace('loading="lazy"','loading="eager" fetchpriority="high"'):plate}</div><div class="photo-stamp" aria-hidden="true">ON THE MENU<b>GNLU</b>REFECTORY</div><figcaption>${caption}</figcaption></figure>`;
 $('spotlight').querySelector('.menu-jump').onclick=()=>{
  const details=$('meal-'+f);details.open=true;opened.set(selected+'-'+f,true);
 };
}
function renderMeals(rows,f){
 $('meal-list').innerHTML=rows.map(r=>{
  const key=selected+'-'+r.m,open=opened.has(key)?opened.get(key):r.m===f,status=M.status(r);
  const preview=r.items[0].replaceAll(' OR ',' or ');
  return `<details class="meal-card" id="meal-${r.m}" ${open?'open':''}><summary><div class="meal-top"><span class="meal-number" aria-hidden="true">0${r.m+1}</span><span class="meal-name">${esc(r.mealName)}</span><span class="meal-state" data-status="${r.m}">${esc(status.text)}</span></div><div class="meal-main">${imageMarkup(r,'meal-thumb')}<div><h3>${esc(preview)}</h3><span class="time">${esc(r.timeStr)}</span></div><span class="expand" aria-hidden="true">+</span></div></summary><div class="meal-content"><p>The full lineup</p><ul>${r.items.map(item=>`<li>${esc(item.replaceAll(' OR ',' or '))}</li>`).join('')}</ul>${r.suspended.length?'<p class="suspended">Egg and non-veg items are suspended for this date. No replacement dishes were specified.</p>':''}${r.photo?`<span class="photo-link">Photo: ${credits(r.photo)}</span>`:''}</div></details>`;
 }).join('');
 rows.forEach(r=>{const element=$('meal-'+r.m),key=selected+'-'+r.m;element.addEventListener('toggle',()=>opened.set(key,element.open));});
}
function wireImageFallbacks(){
 document.querySelectorAll('.spot-photo img,.meal-thumb').forEach(img=>{
  img.addEventListener('error',()=>{
   if(img.classList.contains('meal-thumb'))img.hidden=true;
   else{const frame=img.parentElement;frame.innerHTML=plate;frame.parentElement.classList.add('no-photo');}
  },{once:true});
 });
}
function render(){
 const rows=[0,1,2,3].map(m=>M.meal(selected,m)),f=getFeatured(rows),messages=M.notices(selected).map(n=>({text:n.text}));
 if(rows[0].expired)messages.unshift({text:'This menu’s four-week period ended on 26 October. Showing the last published schedule until a newer menu is added.',expired:true});
 if(rows[0].beforeMenu)messages.unshift({text:'This date is before the 29 September menu took effect. The weekly dishes below belong to that newer schedule.',expired:true});
 $('alerts').innerHTML=messages.map(n=>`<div class="alert ${n.expired?'expired':''}">${esc(n.text)}</div>`).join('');
 renderCalendar();renderWeek();renderSpotlight(rows,f);renderMeals(rows,f);wireImageFallbacks();
 $('source-note').textContent='The latest full committee menu was received on 28 September, effective 29 September 2026 for four weeks, through 26 October. Later notices are included above when they apply to your selected date.';
}
function showWeek(show){$('week-panel').hidden=!show;$('week-toggle').setAttribute('aria-expanded',String(show));if(show)$('week-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
$('week-toggle').onclick=()=>showWeek($('week-panel').hidden);
$('week-close').onclick=()=>{showWeek(false);$('week-toggle').focus();};
$('prev-week').onclick=()=>{selected=M.addDays(selected,-7);weekStart=M.addDays(weekStart,-7);featured=null;render();};
$('next-week').onclick=()=>{selected=M.addDays(selected,7);weekStart=M.addDays(weekStart,7);featured=null;render();};
$('today').onclick=()=>{selected=M.indiaKey();weekStart=M.addDays(selected,-((M.dayNumber(selected)+6)%7));featured=null;render();};
// Update statuses without rebuilding the page or disturbing expanded menus and keyboard focus.
setInterval(()=>{
 if(document.hidden)return;
 const rows=[0,1,2,3].map(m=>M.meal(selected,m));
 document.querySelectorAll('[data-status]').forEach(el=>{el.textContent=M.status(rows[Number(el.dataset.status)]).text;});
 const f=getFeatured(rows),stamp=$('spotlight').querySelector('.live-label');
 if($('spotlight').dataset.meal!==String(f)){
  if(!$('spotlight').contains(document.activeElement)){renderSpotlight(rows,f);wireImageFallbacks();$('spotlight').dataset.meal=String(f);}
 }else if(stamp){const status=M.status(rows[f]);stamp.classList.toggle('serving',status.text==='Serving Now');stamp.innerHTML=`<span class="status-dot" aria-hidden="true"></span>${esc(status.text)} · ${esc(rows[f].mealName)}`;}
},30000);
render();
})();
