const KEY='duitku_daily_v1';
const today=()=>new Date().toLocaleDateString('en-CA');
const money=n=>'Rp'+Math.round(Number(n)||0).toLocaleString('id-ID');
const parse=v=>{let n=Number(String(v).replace(/[^\d]/g,''));return Number.isFinite(n)?n:0};
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{snapshots:[]};
const $=id=>document.getElementById(id);
function net(s){return s.bank+s.cash+s.receivable-s.debt}
function fmtDate(d){return new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}
function sorted(){return [...db.snapshots].sort((a,b)=>a.date.localeCompare(b.date))}
function current(){return db.snapshots.find(s=>s.date===today())}
function previous(){return sorted().filter(s=>s.date<today()).slice(-1)[0]}
function updateUI(){
 const t=current(),p=previous();
 $('todayLabel').textContent=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 ['bank','cash','receivable','debt'].forEach(k=>$(k).value=t?String(t[k]):'');
 const value=t?net(t):0;
 $('netWorth').textContent=money(value);
 const delta=t&&p?value-net(p):null;
 $('dailyChange').textContent=delta===null?(t?'Catatan pertama tersimpan':'Isi angka dan simpan posisi hari ini'):(delta>0?'▲ Naik '+money(delta)+' dari catatan sebelumnya':delta<0?'▼ Turun '+money(Math.abs(delta))+' dari catatan sebelumnya':'● Tidak berubah dari catatan sebelumnya');
 $('dailyChange').className='change '+(delta>0?'up':delta<0?'down':'');
 $('saveHint').textContent=t?'Catatan hari ini sudah ada. Simpan lagi untuk memperbarui angka.':'Satu catatan per hari. Perubahan dihitung dari catatan terakhir.';
 draw();renderHistory();
}
function saveToday(){
 const s={date:today(),bank:parse($('bank').value),cash:parse($('cash').value),receivable:parse($('receivable').value),debt:parse($('debt').value)};
 const i=db.snapshots.findIndex(x=>x.date===s.date);
 if(i>=0)db.snapshots[i]=s;else db.snapshots.push(s);
 localStorage.setItem(KEY,JSON.stringify(db));updateUI();toast('Posisi keuangan hari ini tersimpan');
}
function draw(){
 const a=sorted().slice(-7),chart=$('chart');
 if(!a.length){chart.innerHTML='<div class="empty">Simpan catatan harian untuk melihat grafik.</div>';$('trendLabel').textContent='Belum ada data';return}
 const vals=a.map(net),lo=Math.min(0,...vals),hi=Math.max(1,...vals),range=hi-lo||1;
 chart.innerHTML=a.map(s=>{let h=Math.max(4,((net(s)-lo)/range)*100);return `<div class="bar-wrap"><div class="bar" title="${money(net(s))}" style="height:${h}%"></div><span class="bar-label">${new Date(s.date+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</span></div>`}).join('');
 const d=vals.at(-1)-(vals.length>1?vals.at(-2):vals.at(-1));
 $('trendLabel').textContent=vals.length>1?(d>0?'Naik '+money(d):d<0?'Turun '+money(-d):'Stabil'):'1 catatan';
}
function row(s,arr){let i=arr.indexOf(s),prev=arr[i-1],delta=prev?net(s)-net(prev):null;return `<div class="history-row"><div><div class="history-date">${fmtDate(s.date)}</div><div class="history-sub">Bank ${money(s.bank)} · Dompet ${money(s.cash)}</div><div class="history-sub">Piutang ${money(s.receivable)} · Utang ${money(s.debt)}</div></div><div><div class="history-value">${money(net(s))}</div><div class="history-sub ${delta===null?'neutral':delta>0?'plus':delta<0?'minus':'neutral'}">${delta===null?'Catatan awal':delta>0?'+ '+money(delta):delta<0?'− '+money(-delta):'Stabil'}</div></div></div>`}
function renderHistory(){
 const asc=sorted(),a=[...asc].reverse();
 $('history').innerHTML=a.length?a.slice(0,5).map(s=>row(s,asc)).join(''):'<div class="empty" style="padding:20px">Belum ada riwayat. Simpan posisi uangmu hari ini.</div>';
 $('fullHistory').innerHTML=a.length?a.map(s=>row(s,asc)).join(''):'<div class="empty">Belum ada catatan.</div>';
 renderMonthly();
}
function renderMonthly(){
 const asc=sorted(),months=[...new Set(asc.map(s=>s.date.slice(0,7)))].reverse(),sel=$('monthSelect'),currentValue=sel.value;
 sel.innerHTML=months.map(m=>`<option value="${m}">${new Date(m+'-01T00:00:00').toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</option>`).join('');
 if(!months.length){$('monthEnd').textContent='—';$('monthChange').textContent='—';$('monthHigh').textContent='—';$('monthLow').textContent='—';$('monthCount').textContent='0 hari';return}
 sel.value=months.includes(currentValue)?currentValue:months[0];
 const m=sel.value,items=asc.filter(s=>s.date.startsWith(m)),first=items[0],last=items.at(-1),before=asc.filter(s=>s.date<m+'-01').at(-1);
 const delta=before?net(last)-net(before):net(last)-net(first);
 const vals=items.map(net);
 $('monthEnd').textContent=money(net(last));
 $('monthChange').textContent=(delta>0?'+ ':delta<0?'− ':'')+money(Math.abs(delta));
 $('monthChange').className=delta>0?'positive':delta<0?'negative':'';
 $('monthHigh').textContent=money(Math.max(...vals));
 $('monthLow').textContent=money(Math.min(...vals));
 $('monthCount').textContent=items.length+' hari';
}

function backup(){const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='duitku-backup-'+today()+'.json';a.click();URL.revokeObjectURL(a.href);toast('File backup dibuat')}
function restore(file){const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x.snapshots)||x.snapshots.some(s=>!s.date||!['bank','cash','receivable','debt'].every(k=>Number.isFinite(Number(s[k])))))throw Error();db=x;localStorage.setItem(KEY,JSON.stringify(db));updateUI();toast('Backup berhasil dipulihkan')}catch(e){alert('File backup tidak valid')}};r.readAsText(file)}
$('saveToday').onclick=saveToday;$('backup').onclick=$('export').onclick=backup;
$('import').onclick=()=>$('file').click();$('file').onchange=e=>e.target.files[0]&&restore(e.target.files[0]);
$('allHistory').onclick=()=>$('historyDialog').showModal();$('closeHistory').onclick=()=>$('historyDialog').close();$('monthSelect').onchange=renderMonthly;
updateUI();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));