(function(){
'use strict';
const M=MessMenu,$=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=M.indiaKey(),weekStart=M.addDays(selected,-((M.dayNumber(selected)+6)%7)),featured=null;
const opened=new Map();
const format=(key,options)=>new Intl.DateTimeFormat('en-IN',{...options,timeZone:'UTC'}).format(new Date(key+'T12:00:00Z'));
const plate=`<div class="plate-art"><svg viewBox="0 0 300 300" role="img" aria-label="Hand-drawn plate, fork and steaming bowl"><circle cx="150" cy="150" r="108" fill="#f2efe4" stroke="#263c31" stroke-width="2" stroke-dasharray="3 5"/><circle cx="150" cy="150" r="82" fill="none" stroke="#b94735" stroke-width="1.5"/><path d="M30 73v43m-9-43v26q0 15 9 17t9-17V73m-9 60v91M270 73v151m0-151c-26 0-26 61 0 61" fill="none" stroke="#181d2b" stroke-width="4" stroke-linecap="round"/><path d="M114 157q36-45 72 0v27h-72Zm17-14c-9-11 8-15 0-27m25 27c-9-11 8-15 0-27m22 27c-9-11 8-15 0-27M125 184v8m50-8v8" fill="none" stroke="#345449" stroke-width="3" stroke-linecap="round"/><path d="M128 168h44" stroke="#b94735" stroke-width="3"/></svg></div>`;
const clock='<svg class="clock-icon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="M10 5v5l4 2"/></svg>';
function credits(photo){return `<a href="${esc(photo.source)}" target="_blank" rel="noopener">${esc(photo.author)} · ${esc(photo.license)}</a>`;}
function shortDish(r){return r.items[0].split(/\s+OR\s+/)[0].trim();}
function imageMarkup(r,cls=''){return r.photo?`<img class="${cls}" src="${esc(r.photo.url)}" alt="Illustrative ${esc(r.photo.dish||shortDish(r))}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:'';}
function getFeatured(rows){
 if(featured!==null)return featured;const now=Date.now(),running=rows.findIndex(r=>now>=r.startMs&&now<r.endMs);if(running>=0)return running;
 const next=rows.findIndex(r=>now<r.startMs);return next<0?3:next;
}
function renderCalendar(){
 const today=M.indiaKey();$('week-label').textContent=`${format(weekStart,{day:'numeric',month:'short'})} — ${format(M.addDays(weekStart,6),{day:'numeric',month:'short',year:'numeric'})}`;
 $('selected-day').textContent=(selected===today?'Today · ':'')+format(selected,{weekday:'long',day:'numeric',month:'short'});$('day-strip').replaceChildren();
 for(let i=0;i<7;i++){
  const key=M.addDays(weekStart,i),b=document.createElement('button');b.type='button';b.className='docket-day'+(key===today?' is-today':'');
  b.setAttribute('aria-pressed',String(key===selected));b.setAttribute('aria-label',format(key,{weekday:'long',day:'numeric',month:'long'})+(key===today?', today':''));
  b.innerHTML=`<span>${esc(format(key,{weekday:'short'}))}</span><b>${Number(key.slice(-2))}</b>`;
  b.onclick=()=>{selected=key;featured=null;render();};$('day-strip').append(b);
 }
}
function renderWeek(){
 $('week-body').innerHTML=Array.from({length:7},(_,i)=>{
  const key=M.addDays(weekStart,i),meals=[0,1,2,3].map(m=>M.meal(key,m));
  return `<article class="week-entry" aria-current="${key===selected}"><button type="button" data-date="${key}" aria-label="Show menu for ${esc(format(key,{weekday:'long',day:'numeric',month:'long'}))}"><span class="week-date">${esc(format(key,{weekday:'long',day:'numeric',month:'short'}))}<span>${key===M.indiaKey()?'TODAY':'DOCKET '+String(i+1).padStart(2,'0')}</span></span><span class="week-food">${meals.map(r=>`<b>${esc(r.mealName)}:</b> ${esc(r.items[0].replaceAll(' OR ',' or '))}`).join('　·　')}</span></button></article>`;
 }).join('');
 $('week-body').querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{selected=b.dataset.date;featured=null;showWeek(false);render();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
}
function renderSpotlight(rows,f){
 $('spotlight').dataset.meal=String(f);const r=rows[f],status=M.status(r),alternatives=r.items[0].split(/\s+OR\s+/).slice(1),serving=status.text==='Serving Now';
 const caption=r.photo?`${credits(r.photo)} · illustrative photograph`:'A hand-drawn exhibit for a dish without a photograph.';
 const lead=['First sitting','Second sitting','Intermission','Final sitting'][f];
 $('spotlight').innerHTML=`<figure class="spot-photo ${r.photo?'':'no-photo'}"><div class="photo-frame">${r.photo?imageMarkup(r).replace('loading="lazy"','loading="eager" fetchpriority="high"'):plate}</div><div class="photo-stamp" aria-hidden="true">EXHIBIT<br><b>A</b> · GNLU</div><figcaption>${caption}</figcaption></figure><div class="spot-copy"><span class="live-label ${serving?'serving':''}"><span class="status-dot" aria-hidden="true"></span>${esc(status.text)} · ${esc(r.mealName)}</span><p class="meal-kicker">${lead} · ${clock} ${esc(r.timeStr)}</p><h2>${esc(shortDish(r))}</h2>${alternatives.length?`<p class="alternatives">Other dishes on the same charge: ${esc(alternatives.join(' or '))}</p>`:''}<p class="case-caption">The featured matter before the GNLU mess today.</p><a class="menu-jump" href="#meal-${f}">Read the full order <span aria-hidden="true">↘</span></a></div>`;
 $('spotlight').querySelector('.menu-jump').onclick=()=>{const d=$('meal-'+f);d.open=true;opened.set(selected+'-'+f,true);};
}
function renderMeals(rows,f){
 $('meal-list').innerHTML=rows.map(r=>{
  const key=selected+'-'+r.m,open=opened.has(key)?opened.get(key):r.m===f,status=M.status(r),preview=r.items[0].replaceAll(' OR ',' or ');
  return `<details class="meal-card" id="meal-${r.m}" ${open?'open':''}><summary><span class="meal-top"><span class="meal-number">§ 0${r.m+1}</span><span class="meal-name">${esc(r.mealName)}</span><span class="meal-state" data-status="${r.m}">${esc(status.text)}</span></span><span class="meal-main">${imageMarkup(r,'meal-thumb')}<span class="meal-title-wrap"><h3>${esc(preview)}</h3><span class="time">${esc(r.timeStr)}</span></span><span class="expand" aria-hidden="true">+</span></span></summary><div class="meal-content"><p>THE FULL ORDER</p><ul>${r.items.map(item=>`<li>${esc(item.replaceAll(' OR ',' or '))}</li>`).join('')}</ul>${r.suspended.length?'<p class="suspended">Egg and non-veg items are suspended for this date. No replacements were specified.</p>':''}${r.photo?`<span class="photo-link">Photographic source: ${credits(r.photo)}</span>`:''}</div></details>`;
 }).join('');
 rows.forEach(r=>{const element=$('meal-'+r.m),key=selected+'-'+r.m;element.addEventListener('toggle',()=>opened.set(key,element.open));});
}
function wireImageFallbacks(){
 document.querySelectorAll('.spot-photo img,.meal-thumb').forEach(img=>img.addEventListener('error',()=>{
  if(img.classList.contains('meal-thumb'))img.hidden=true;else{const frame=img.parentElement,figure=frame.parentElement;frame.innerHTML=plate;figure.classList.add('no-photo');}
 },{once:true}));
}
function render(){
 const rows=[0,1,2,3].map(m=>M.meal(selected,m)),f=getFeatured(rows),messages=M.notices(selected).map(n=>({text:n.text}));
 if(rows[0].expired)messages.unshift({text:'This menu’s four-week period ended on 26 October. Showing the last published schedule until a new one arrives.',expired:true});
 if(rows[0].beforeMenu)messages.unshift({text:'This date is before the menu that took effect on 29 September. The dishes below belong to that later schedule.',expired:true});
 $('alerts').innerHTML=messages.map(n=>`<div class="alert ${n.expired?'expired':''}">${esc(n.text)}</div>`).join('');
 renderCalendar();renderWeek();renderSpotlight(rows,f);renderMeals(rows,f);wireImageFallbacks();
 $('source-note').textContent='The latest full committee menu was received on 28 September, effective 29 September 2026 for four weeks, through 26 October. Later notices appear here on the dates they apply.';
}
function showWeek(show){$('week-panel').hidden=!show;$('week-toggle').setAttribute('aria-expanded',String(show));if(show)$('week-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
$('week-toggle').onclick=()=>showWeek($('week-panel').hidden);$('week-close').onclick=()=>{showWeek(false);$('week-toggle').focus();};
$('prev-week').onclick=()=>{selected=M.addDays(selected,-7);weekStart=M.addDays(weekStart,-7);featured=null;render();};
$('next-week').onclick=()=>{selected=M.addDays(selected,7);weekStart=M.addDays(weekStart,7);featured=null;render();};
$('today').onclick=()=>{selected=M.indiaKey();weekStart=M.addDays(selected,-((M.dayNumber(selected)+6)%7));featured=null;render();};
setInterval(()=>{if(document.hidden)return;const rows=[0,1,2,3].map(m=>M.meal(selected,m));document.querySelectorAll('[data-status]').forEach(el=>{el.textContent=M.status(rows[Number(el.dataset.status)]).text;});const f=getFeatured(rows),stamp=$('spotlight').querySelector('.live-label');if($('spotlight').dataset.meal!==String(f)){if(!$('spotlight').contains(document.activeElement)){renderSpotlight(rows,f);wireImageFallbacks();}}else if(stamp){const status=M.status(rows[f]);stamp.classList.toggle('serving',status.text==='Serving Now');stamp.innerHTML=`<span class="status-dot" aria-hidden="true"></span>${esc(status.text)} · ${esc(rows[f].mealName)}`;}},30000);
render();
})();
