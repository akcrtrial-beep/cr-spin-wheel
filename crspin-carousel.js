/* ===============================
   CR — Slot Machine Carousel Picker
   =============================== */

const CR_IMAGES = [
  { key: "retro", url: "https://chennairenegades.com/wp-content/uploads/2025/11/Retro.jpg", label: "Retro Cruiser (1-bed)" },
  { key: "sports", url: "https://chennairenegades.com/wp-content/uploads/2025/11/Sports.jpg", label: "Modern Sports (2-bed)" },
  { key: "adv", url: "https://chennairenegades.com/wp-content/uploads/2025/11/ADV.jpg", label: "ADV Bike (5-bed)" }
];

// Riders
const RIDERS = [
  "Sridhar C","Premnath Rajan","Satish kumar Shankaran","Manikandan Arumugam","Mohan Murthy",
  "Lakshmi Narayanan S","Vignesh Balasubramani","Rameshkumar S","Nikkil Nair","Abhilash S",
  "Shivam Saluja","Balaji Dilli Babu","Jayapal N K","Rahul Raj","Ganapathy Ganesan",
  "Sendhil Nathan","Ananthakrishnan T C","Jiju Pushkaran","Santosh Krishnan","Jalapathy K",
  "Sugheendran","Chandrasekar V","Srinivasan Sundar","Sangeeth Kumar Vasudevan","Raghavan Vijayaraghavan",
  "Venkatesan Srinivasan","Pending Rider"
].sort();

let available = { retro: 3, sports: 14, adv: 10 };
let assignments = [];
let remaining = [...RIDERS];

const ADMIN_PIN = "Ananth,@2025#";


// =====================================================
// BUILD CAROUSEL
// =====================================================
function cr_buildCarousel() {
  const track = document.querySelector("#cr-carousel-track");
  track.innerHTML = "";

  for (let i = 0; i < 20; i++) {
    CR_IMAGES.forEach(img => {
      const el = document.createElement("div");
      el.className = "cr-item";
      el.innerHTML = `<img src="${img.url}">`;
      el.dataset.key = img.key;
      track.appendChild(el);
    });
  }
}


// =====================================================
// RENDER RIDERS
// =====================================================
function cr_renderRiders() {
  const list = document.querySelector("#cr-riders-list");
  const sel = document.querySelector("#cr-select");
  list.innerHTML = "";
  sel.innerHTML = `<option value="">Select your name</option>`;

  remaining.forEach(r => {
    const d = document.createElement("div");
    d.className = "cr-rider";
    d.textContent = r;
    d.onclick = () => { sel.value = r };
    list.appendChild(d);

    const o = document.createElement("option");
    o.value = r;
    o.textContent = r;
    sel.appendChild(o);
  });
}


// =====================================================
// SPIN CAROUSEL WITH SLOWDOWN + MOTION BLUR
// =====================================================
let spinning = false;

function cr_spin() {
  if (spinning) return;

  const sel = document.querySelector("#cr-select");
  const rider = sel.value;
  if (!rider) { alert("Select your name first"); return; }
  if (assignments.find(a => a.rider === rider)) { alert("Already assigned"); return; }

  spinning = true;

  const track = document.querySelector("#cr-carousel-track");
  track.style.transition = "none";
  track.style.transform = "translateX(0px)";

  let pos = 0;

  // --- Casino-style slowdown ---
  let speed = 70;  
  let phase = 1;   
  const tick = 40;

  // Add motion blur
  const root = document.querySelector("#cr-spin-root");
  root.style.filter = "blur(2px) brightness(1.2)";

  const spinTimer = setInterval(() => {
    pos -= speed;
    track.style.transform = `translateX(${pos}px)`;

    // Phase transitions
    if (phase === 1 && pos < -1400) {
      speed = 45;
      phase = 2;
    }
    else if (phase === 2 && pos < -3000) {
      speed = 25;
      phase = 3;
    }
    else if (phase === 3 && pos < -4200) {
      speed = 10;
      phase = 4;
    }
    else if (phase === 4) {
      speed -= 0.25;
      if (speed < 2) speed = 2;
    }

    // Reduce blur as speed decreases
    const blurAmount = Math.max(0, Math.min(2, speed / 20));
    root.style.filter = `blur(${blurAmount}px) brightness(1.1)`;

  }, tick);


  // Stop after full animation
  setTimeout(() => {
    clearInterval(spinTimer);

    root.style.filter = "none"; // remove blur cleanly

    cr_stopCarousel(pos, rider);
    spinning = false;

  }, 7000);
}


// =====================================================
// STOP & DETECT RESULT — PERFECT CENTER ALIGNMENT
// =====================================================
function cr_stopCarousel(pos, rider) {
  const itemWidth = 420;

  // Get container position
  const container = document.querySelector("#cr-carousel-container");
  const track = document.querySelector("#cr-carousel-track");

  const containerRect = container.getBoundingClientRect();
  const trackRect = track.getBoundingClientRect();

  // Pointer is centered inside container
  const pointerX = containerRect.left + containerRect.width / 2;

  // Find which item covers the pointer
  const items = document.querySelectorAll(".cr-item");
  let chosenKey = "adv";

  for (const item of items) {
    const r = item.getBoundingClientRect();
    if (r.left <= pointerX && r.right >= pointerX) {
      chosenKey = item.dataset.key;
      break;
    }
  }

  cr_finalize(rider, chosenKey);
  cr_flashWinner();
}


// =====================================================
// WINNING FLASH EFFECT
// =====================================================
function cr_flashWinner() {
  const container = document.querySelector("#cr-carousel-container");

  container.style.boxShadow = "0 0 40px 15px gold";
  container.style.transition = "box-shadow 0.2s ease-out";

  setTimeout(() => {
    container.style.boxShadow = "0 0 0 0 gold";
  }, 500);
}


// =====================================================
// ASSIGNMENT LOGIC
// =====================================================
function cr_finalize(rider, key) {
  if (available[key] <= 0) {
    if (available.retro > 0) key = "retro";
    else if (available.sports > 0) key = "sports";
    else key = "adv";
  }

  available[key] -= 1;

  const now = new Date().toLocaleString();

  assignments.push({ rider, key, time: now });

  remaining = remaining.filter(r => r !== rider);
  cr_save();
  cr_renderRiders();
  cr_updateAdminPanel();

  const name = CR_IMAGES.find(i => i.key === key).label;
  document.querySelector("#cr-result").textContent = `${rider} → ${name}`;
}


// =====================================================
// SAVE / LOAD STATE
// =====================================================
function cr_save() {
  localStorage.setItem("cr_assign", JSON.stringify(assignments));
  localStorage.setItem("cr_avail", JSON.stringify(available));
  localStorage.setItem("cr_rem", JSON.stringify(remaining));
}

function cr_load() {
  try {
    assignments = JSON.parse(localStorage.getItem("cr_assign")) || [];
    available = JSON.parse(localStorage.getItem("cr_avail")) || available;
    remaining = JSON.parse(localStorage.getItem("cr_rem")) || remaining;
  } catch (e) {}
}


// =====================================================
// UPDATE ADMIN PANEL
// =====================================================
function cr_updateAdminPanel() {
  document.querySelector("#s-retro").textContent = available.retro;
  document.querySelector("#s-sports").textContent = available.sports;
  document.querySelector("#s-adv").textContent = available.adv;

  const body = document.querySelector("#cr-report-body");
  body.innerHTML = "";
  assignments.forEach(a => {
    body.innerHTML += `
      <tr>
        <td>${a.rider}</td>
        <td>${a.key}</td>
        <td>${a.time}</td>
      </tr>
    `;
  });
}


// =====================================================
// ADMIN LOGIN
// =====================================================
function adminLogin() {
  const pin = prompt("Enter PIN:");
  if (pin === ADMIN_PIN) {
    document.querySelector("#cr-admin-panel").style.display = "block";
  } else {
    alert("Incorrect PIN");
  }
}


// =====================================================
// INIT
// =====================================================
window.addEventListener("load", () => {
  cr_load();
  cr_buildCarousel();
  cr_renderRiders();
  cr_updateAdminPanel();
});
