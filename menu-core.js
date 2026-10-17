/* Shared menu logic. No network or DOM dependency. */
(function (root) {
  'use strict';
  const data = root.GNLU_MENU;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const types = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const normal = [[495,630], [750,885], [1020,1095], [1200,1290]];
  const weekend = [[540,660], [780,870], [1020,1095], [1200,1290]];
  const inRange = (key, from, through) => key >= from && key <= through;
  function indiaKey(now = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Kolkata', year:'numeric', month:'2-digit', day:'2-digit'}).format(now);
  }
  function dayNumber(key) { return new Date(key + 'T12:00:00Z').getUTCDay(); }
  function addDays(key, n) {
    const date = new Date(key + 'T12:00:00Z'); date.setUTCDate(date.getUTCDate()+n);
    return date.toISOString().slice(0,10);
  }
  function notices(key) { return data.notices.filter(n => inRange(key, n.from, n.through)); }
  function formatTime(n) { const h=Math.floor(n/60); return `${String(h%12||12).padStart(2,'0')}:${String(n%60).padStart(2,'0')} ${h>=12?'PM':'AM'}`; }
  function title(items, m) { return items.slice(0, m===1 || m===3 ? 2 : 1).join(' & ').replace(/\s*\/\s*/g, ' OR '); }
  function meal(key, m) {
    const d=dayNumber(key), original=data.meals.find(row => row.d===d && row.m===m);
    const active=notices(key), noNonveg=active.some(n=>n.type==='diet');
    const items=original.i.filter(item => !noNonveg || !/\b(eggs?|anda|chicken)\b/i.test(item));
    const timingOverride=active.some(n=>n.type==='timing');
    // Existing weekend timing convention retained; temporary official notices override weekdays.
    const slot=(timingOverride || d===0 || d===6 ? weekend : normal)[m];
    const startMs=Date.parse(key+'T00:00:00+05:30')+slot[0]*60000;
    const imageKey=noNonveg && m===3 && d===0 ? 'paneer' : (noNonveg && m===3 && d===3 ? null : original.imageKey);
    const photo=imageKey && data.images[imageKey];
    const img=photo?.url || 'images/meal-placeholder.svg';
    return {...original, key, dayName:days[d], mealName:types[m], items:items.map(s=>s.replace(/\s*\/\s*/g,' OR ')), mainDish:title(items,m), img, photo, notices:active, suspended:original.i.filter(i=>!items.includes(i)), timeStr:slot.map(formatTime).join(' – '), startMs, endMs:startMs+(slot[1]-slot[0])*60000, timingOverride, expired:key>data.source.validThrough, beforeMenu:key<data.source.effectiveFrom};
  }
  function status(info, now=Date.now()) {
    if (now>=info.endMs) return {text:'Stopped Serving',className:'status-stopped'};
    if (now>=info.startMs) return {text:'Serving Now',className:'status-serving'};
    const minutes=Math.ceil((info.startMs-now)/60000);
    return minutes<=60 ? {text:`Starts in ${minutes} min`,className:'status-starting'} : {text:'Upcoming',className:''};
  }
  root.MessMenu={data,days,types,indiaKey,addDays,dayNumber,notices,meal,status};
})(globalThis);
