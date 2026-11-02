const KEY='duitku_daily_v1';
const today=()=>new Date().toLocaleDateString('en-CA');
const money=n=>'Rp'+Math.round(Number(n)||0).toLocaleString('id-ID');
const parse=v=>{let n=Number(String(v).replace(/[^\d]/g,''));return Number.isFinite(n)?n:0};
const formatInput=v=>parse(v).toLocaleString('id-ID');
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
 ['bank','cash','receivable','debt'].forEach(k=>$(k).value=t?formatInput(t[k]):'');
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

async function backup(){
 const filename='duite-backup-'+today()+'.json';
 const content=JSON.stringify(db,null,2);
 // Native Android: save JSON in app cache, then open Android share sheet.
 const plugins=window.Capacitor&&window.Capacitor.Plugins;
 const Filesystem=plugins&&plugins.Filesystem;
 const Share=plugins&&plugins.Share;
 if(Filesystem&&Share){
  let saved;
  try{
   saved=await Filesystem.writeFile({
    path:filename,
    data:content,
    directory:'CACHE',
    encoding:'utf8'
   });
  }catch(err){
   console.error('Native backup write failed:',err);
   toast('Gagal menyiapkan backup. Coba lagi.');
   return;
  }
  try{
   await Share.share({
    title:'Backup Duite',
    text:'Simpan file backup keuangan Duite di Drive atau folder Files.',
    files:[saved.uri],
    dialogTitle:'Simpan backup Duite'
   });
   toast('Pilih Drive atau Files untuk menyimpan backup.');
  }catch(err){
   console.warn('Share dismissed or failed:',err);
   toast('Menu berbagi ditutup. Backup belum disimpan ke lokasi pilihan.');
  }
  return;
 }
 // Browser fallback; delay URL cleanup to give Android time to start the download.
 try{
  const blob=new Blob([content],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=filename;
  a.style.display='none';
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},60000);
  toast('Permintaan download backup dikirim.');
 }catch(err){
  console.error('Backup download failed:',err);
  toast('Ekspor gagal. Coba lagi.');
 }
}
function restore(file){const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x.snapshots)||x.snapshots.some(s=>!s.date||!['bank','cash','receivable','debt'].every(k=>Number.isFinite(Number(s[k])))))throw Error();db=x;localStorage.setItem(KEY,JSON.stringify(db));updateUI();toast('Backup berhasil dipulihkan')}catch(e){alert('File backup tidak valid')}};r.readAsText(file)}
// Kalkulator penuh layar untuk mengisi saldo. Hasil hanya dihitung setelah tombol "=".
const calcLabels={bank:'Uang di bank',cash:'Uang di dompet',receivable:'Piutang',debt:'Utang'};
let activeMoneyField=null,calcExpression='0',calcResult=null,calcHasResult=false;
const calcOperators=['+','-','×','÷'];
function formatExpression(expr){
 return expr.replace(/\d+/g, n=>Number(n).toLocaleString('id-ID'))
            .replace(/\*/g,'×').replace(/\//g,'÷').replace(/-/g,'−');
}
function evaluateExpression(expr){
 const tokens=expr.match(/\d+|[+\-×÷]/g);
 if(!tokens||tokens.join('')!==expr)throw new Error('Periksa hitungan');
 const nums=[],ops=[];
 for(const token of tokens){
  if(/^\d+$/.test(token))nums.push(Number(token));
  else ops.push(token);
 }
 if(nums.length!==ops.length+1)throw new Error('Operasi belum lengkap');
 for(let i=0;i<ops.length;){
  if(ops[i]==='×'||ops[i]==='÷'){
   const v=ops[i]==='×'?nums[i]*nums[i+1]:nums[i]/nums[i+1];
   if(!Number.isFinite(v))throw new Error('Tidak bisa membagi dengan nol');
   nums.splice(i,2, v);ops.splice(i,1);
  }else i++;
 }
 let result=nums[0];
 for(let i=0;i<ops.length;i++)result=ops[i]==='+'?result+nums[i+1]:result-nums[i+1];
 if(!Number.isFinite(result))throw new Error('Hasil tidak valid');
 return Math.round(result);
}
function renderCalculator(){
 $('calcExpression').textContent=formatExpression(calcExpression);
 $('calcAnswer').textContent=calcHasResult?money(calcResult):'—';
 $('calcHint').textContent=calcHasResult?'Hasil perhitungan':'Hasil muncul setelah menekan =';
}
function openMoneyCalculator(fieldId){
 activeMoneyField=$(fieldId);
 calcExpression=String(parse(activeMoneyField.value));
 calcResult=null;calcHasResult=false;
 $('calcFieldTitle').textContent=calcLabels[fieldId];
 $('calcHint').textContent='Masukkan angka dan operasi';
 renderCalculator();
 $('moneyCalculator').classList.add('visible');
 $('moneyCalculator').setAttribute('aria-hidden','false');
 document.body.classList.add('calculator-open');
}
function closeMoneyCalculator(){
 $('moneyCalculator').classList.remove('visible');
 $('moneyCalculator').setAttribute('aria-hidden','true');
 document.body.classList.remove('calculator-open');
}
function pressCalc(key){
 if(key==='C'){
  calcExpression='0';calcResult=null;calcHasResult=false;
  renderCalculator();return;
 }
 if(key==='⌫'){
  calcExpression=calcExpression.length>1?calcExpression.slice(0,-1):'0';
  calcResult=null;calcHasResult=false;renderCalculator();return;
 }
 if(key==='='){
  try{
   calcResult=evaluateExpression(calcExpression);
   calcHasResult=true;
   $('calcHint').textContent='Tekan ✓ untuk menggunakan hasil ini';
   renderCalculator();
  }catch(err){
   calcHasResult=false;calcResult=null;
   $('calcAnswer').textContent='—';$('calcHint').textContent=err.message;
  }
  return;
 }
 if(calcOperators.includes(key)){
  const op=key==='−'?'-':key;
  if(calcHasResult){calcExpression=String(calcResult);calcHasResult=false;calcResult=null;}
  if(calcOperators.includes(calcExpression.slice(-1)))calcExpression=calcExpression.slice(0,-1)+op;
  else calcExpression+=op;
  renderCalculator();return;
 }
 if(calcHasResult){calcExpression='';calcHasResult=false;calcResult=null;}
 if(calcExpression==='0')calcExpression=key;
 else calcExpression+=key;
 renderCalculator();
}
function acceptCalcResult(){
 if(!activeMoneyField)return;
 if(!calcHasResult){$('calcHint').textContent='Tekan = terlebih dahulu';return;}
 if(calcResult<0){$('calcHint').textContent='Jumlah akhir tidak boleh negatif';return;}
 activeMoneyField.value=formatInput(calcResult);
 closeMoneyCalculator();
 toast(calcLabels[activeMoneyField.id]+' diperbarui. Tekan Simpan posisi hari ini.');
}
document.querySelectorAll('.money-card').forEach(card=>{
 const input=card.querySelector('input');
 input.readOnly=true;input.setAttribute('inputmode','none');
 card.addEventListener('click',()=>openMoneyCalculator(input.id));
});
document.querySelectorAll('[data-calc]').forEach(button=>{
 button.addEventListener('click',()=>pressCalc(button.dataset.calc));
});
$('calcConfirm').onclick=acceptCalcResult;
$('calcDismiss').onclick=closeMoneyCalculator;
document.addEventListener('keydown',e=>{
 if(!$('moneyCalculator').classList.contains('visible'))return;
 if(/^\d$/.test(e.key))pressCalc(e.key);
 else if(e.key==='Enter'||e.key==='='){e.preventDefault();pressCalc('=');}
 else if(e.key==='Escape')closeMoneyCalculator();
 else if(e.key==='Backspace')pressCalc('⌫');
 else if(e.key==='+')pressCalc('+');
 else if(e.key==='-')pressCalc('−');
 else if(e.key==='*')pressCalc('×');
 else if(e.key==='/')pressCalc('÷');
});
// Musik otomatis diputar dan mengulang terus saat aplikasi dibuka.
// Tombol Off menghentikan musik untuk sesi ini; saat aplikasi dibuka lagi musik aktif kembali.
const music=$('appMusic');
function setMusicPlaying(playing){$('musicPlay').classList.toggle('active',playing);}
async function startMusic(showMessage=false){
 try{await music.play();setMusicPlaying(true);if(showMessage)toast('Musik diputar');}
 catch(e){setMusicPlaying(false);if(showMessage)toast('Tekan Play untuk memulai musik');}
}
$('musicPlay').onclick=()=>startMusic(true);
$('musicOff').onclick=()=>{music.pause();music.currentTime=0;setMusicPlaying(false);toast('Musik dimatikan')};
music.addEventListener('play',()=>setMusicPlaying(true));
music.addEventListener('pause',()=>setMusicPlaying(false));
// Coba mulai otomatis setiap kali aplikasi dibuka.
startMusic(false);
$('saveToday').onclick=saveToday;$('backup').onclick=$('export').onclick=backup;
$('import').onclick=()=>$('file').click();$('file').onchange=e=>e.target.files[0]&&restore(e.target.files[0]);
$('allHistory').onclick=()=>$('historyDialog').showModal();$('closeHistory').onclick=()=>$('historyDialog').close();$('monthSelect').onchange=renderMonthly;
updateUI();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));