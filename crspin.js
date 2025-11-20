/* === CONFIG === */
const IMG_RETRO = "https://chennairenegades.com/wp-content/uploads/2025/11/Retro.jpg";
const IMG_SPORTS = "https://chennairenegades.com/wp-content/uploads/2025/11/Sports.jpg";
const IMG_ADV   = "https://chennairenegades.com/wp-content/uploads/2025/11/ADV.jpg";

const RIDERS = [
  "Sridhar C","Premnath Rajan","Satish kumar Shankaran","Manikandan Arumugam","Mohan Murthy",
  "Lakshmi Narayanan S","Vignesh Balasubramani","Rameshkumar S","Nikkil Nair","Abhilash S",
  "Shivam Saluja","Balaji Dilli Babu","Jayapal N K","Rahul Raj","Ganapathy Ganesan",
  "Sendhil Nathan","Ananthrakishnan T C","Jiju Pushkaran","Santosh Krishnan","Jalapathy K",
  "Sugheendran","Chandrasekar V","Srinivasan Sundar","Sangeeth Kumar Vasudevan","Raghavan Vijayaraghavan",
  "Venkatesan Srinivasan","Pending Rider"
].sort();

let available = { singles:3, doubles:14, fives:10 };
let assignments = [];
let remaining = [...RIDERS];
const ADMIN_PIN = "Ananth,@2025#";

/* === INITIALIZE WHEEL === */
function cr_initWheel() {
  const wheel = document.getElementById('cr-wheel');
  if (!wheel) return;
  wheel.innerHTML = "";
  const imgs = [IMG_RETRO, IMG_SPORTS, IMG_ADV];
  const colors = ['#b91c1c','#0284c7','#7c3aed'];

  for (let i=0;i<3;i++) {
    const seg = document.createElement("div");
    seg.className = "segment";
    seg.style.transform = `rotate(${i*120}deg) skewY(-30deg)`;
    seg.style.background = `linear-gradient(135deg, ${colors[i]}, #000)`;
    seg.innerHTML = `
      <div style="transform:skewY(30deg) translate(-10%,-10%);
                  width:100%;height:100%;display:flex;align-items:center;
                  justify-content:center;">
        <img src="${imgs[i]}" style="width:140%;height:140%;object-fit:cover;">
      </div>`;
    wheel.appendChild(seg);
  }
}

/* === RENDER RIDERS === */
function cr_renderRiders() {
  const list = document.getElementById("cr-riders-list");
  const sel  = document.getElementById("cr-select");
  if (!list || !sel) return;

  list.innerHTML = "";
  sel.innerHTML  = '<option value="">Select your name</option>';

  remaining.forEach(name => {
    const d = document.createElement("div");
    d.className = "rider-item";
    d.textContent = name;
    d.onclick = ()=> sel.value = name;
    list.appendChild(d);

    const o = document.createElement("option");
    o.value = name;
    o.textContent = name;
    sel.appendChild(o);
  });
}

/* === LOGIC HELPERS === */
function cr_available() {
  const out = [];
  if (available.singles>0) out.push(0);
  if (available.doubles>0) out.push(1);
  if (available.fives>0) out.push(2);
  return out;
}

function cr_pickIndex() {
  const opt = cr_available();
  if (opt.length === 0) return null;
  return opt[Math.floor(Math.random()*opt.length)];
}

/* === ENGINE REV SOUND === */
function cr_revSound(sec=3.0) {
  try {
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sawtooth';
    o.frequency.setValueAtTime(160,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(900,ctx.currentTime+sec*0.9);
    g.gain.setValueAtTime(0.0001,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.08,ctx.currentTime+0.05);
    g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+sec);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime+sec+0.05);
  } catch(e) {}
}

/* === SPIN ANIMATION === */
function cr_spinTo(idx, after) {
  const base = 4 + Math.floor(Math.random()*3);
  const seg  = 120;
  const minA = idx * seg;
  const ang  = minA + Math.random()*(seg-20)+10;
  const final= base*360 + (360-ang);

  const wheel = document.getElementById("cr-wheel");
  wheel.style.transition="transform 3.2s cubic-bezier(.17,.67,.2,1)";
  wheel.style.transform=`rotate(${final}deg)`;

  wheel.addEventListener("transitionend", function h(){
    wheel.removeEventListener("transitionend",h);
    setTimeout(after,250);
  });

  cr_revSound();
}

/* === ASSIGN === */
function cr_assign(rider, idx){
  let key=null;

  if (available.singles>0 || available.doubles>0) {
    if(idx===0 && available.singles>0) key='retro';
    else if(idx===1 && available.doubles>0) key='modern';
    else if(idx===2 && available.fives>0) key='adv';
    else {
      if(available.singles>0) key='retro';
      else if(available.doubles>0) key='modern';
      else key='adv';
    }
  } else key='adv';

  if(key==='retro') available.singles--;
  if(key==='modern') available.doubles--;
  if(key==='adv')    available.fives--;

  const t = new Date().toLocaleString();
  assignments.push({ rider:rider, bikeKey:key, time:t });
  remaining = remaining.filter(r => r !== rider);

  cr_renderRiders();
  const res = document.getElementById("cr-result");
  res.textContent = rider + " → " +
        (key==='retro'?'Retro Cruiser':
        (key==='modern'?'Modern Speed':'ADV Bike'));
}

/* === ADMIN === */
function adminLogin(){
  const x = prompt("Enter admin PIN");
  if(x===ADMIN_PIN){
    document.getElementById("cr-admin-panel").style.display="block";
  } else alert("Incorrect PIN.");
}

/* === SPIN BUTTON === */
function cr_initSpinButton(){
  const btn = document.getElementById("cr-spin");
  const sel = document.getElementById("cr-select");

  btn.onclick=function(){
    const r = sel.value;
    if(!r) return alert("Select your name first");
    if(assignments.find(a=>a.rider===r)) return alert("Already assigned");

    const idx = cr_pickIndex();
    if(idx===null) return alert("No slots left");

    btn.disabled=true;
    sel.disabled=true;

    cr_spinTo(idx, ()=>{
      cr_assign(r,idx);
      btn.disabled=false;
      sel.disabled=false;
    });
  };
}

/* === INIT PAGE === */
setTimeout(()=>{
  cr_initWheel();
  cr_renderRiders();
  cr_initSpinButton();
},300);
