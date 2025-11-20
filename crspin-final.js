/* ===============================
   CR — IMAGES & RIDERS
   =============================== */

const CR_IMAGES = [
  { key: "retro", url: "https://chennairenegades.com/wp-content/uploads/2025/11/Retro.jpg", label: "Retro Cruiser (1-bed)" },
  { key: "sports", url: "https://chennairenegades.com/wp-content/uploads/2025/11/Sports.jpg", label: "Modern Sports (2-bed)" },
  { key: "adv", url: "https://chennairenegades.com/wp-content/uploads/2025/11/ADV.jpg", label: "ADV Bike (5-bed)" }
];

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


/* ===============================
   BUILD CAROUSEL
   =============================== */

function cr_buildCarousel() {
  const track = document.querySelector("#cr-carousel-track");
  track.innerHTML = "";

  for (let i = 0; i < 30; i++) {
    CR_IMAGES.forEach(img => {
      const el = document.createElement("div");
      el.className = "cr-item";
      el.style.width = "420px";
      el.style.height = "240px";

      el.innerHTML = `<img src="${img.url}" 
                          style="width:100%;height:100%;object-fit:cover;object-position:center;">`;
      el.dataset.key = img.key;
      track.appendChild(el);
    });
  }
}


/* ===============================
   RENDER RIDERS LIST
   =============================== */

function cr_renderRiders() {
  const list = document.querySelector("#cr-riders-list");
  const sel = document.querySelector("#cr-select");
  list.innerHTML = "";
  sel.innerHTML = `<option value="">Select your name</option>`;

  remaining.forEach(r => {
    const div = document.createElement("div");
    div.textContent = r;
    div.style.padding = "6px 8px";
    div.style.cursor = "pointer";
    div.onclick = () => sel.value = r;
    list.appendChild(div);

    const o = document.createElement("option");
    o.value = r;
    o.textContent = r;
    sel.appendChild(o);
  });
}


/* ===============================
   SPIN WITH CASINO SLOWDOWN + BLUR
   =============================== */

let spinning = false;

function cr_spin() {
  if (spinning) return;

  const sel = document.querySelector("#cr-select");
  const rider = sel.value;
  if (!rider) return alert("Select your name first");
  if (assignments.find(a => a.rider === rider)) return alert("Already assigned");

  spinning = true;

  const track = document.querySelector("#cr-carousel-track");
  track.style.transition = "none";
  track.style.transform = "translateX(0px)";

  let pos = 0;
  let speed = 70;
  let phase = 1;

  const root = document.querySelector("#cr-spin-root");

  const timer = setInterval(() => {
    pos -= speed;
    track.style.transform = `translateX(${pos}px)`;

    // Motion blur
    root.style.filter = `blur(${Math.min(3, speed / 20)}px) brightness(1.1)`;

    // Slowdown phases
    if (phase === 1 && pos < -1500) { speed = 45; phase = 2; }
    else if (phase === 2 && pos < -3500) { speed = 25; phase = 3; }
    else if (phase === 3 && pos < -5000) { speed = 10; phase = 4; }
    else if (phase === 4) {
      speed -= 0.25;
      if (speed < 2) speed = 2;
    }

  }, 40);

  setTimeout(() => {
    clearInterval(timer);
    root.style.filter = "none";
    cr_stopCarousel(pos, rider);
    spinning = false;
  }, 7000);
}


/* ===============================
   PERFECT STOP — ALWAYS AT POINTER
   =============================== */

function cr_stopCarousel(pos, rider) {
  const container = document.querySelector("#cr-carousel-container");
  const pointerX = container.getBoundingClientRect().left + container.offsetWidth / 2;

  const items = document.querySelectorAll(".cr-item");

  let chosenKey = "adv";

  items.forEach(item => {
    const r = item.getBoundingClientRect();
    if (r.left <= pointerX && r.right >= pointerX) {
      chosenKey = item.dataset.key;
    }
  });

  cr_finalize(rider, chosenKey);
  cr_flashWinner();
}


/* ===============================
   FLASH WINNER
   =============================== */

function cr_flashWinner() {
  const box = document.querySelector("#cr-carousel-container");
  box.style.boxShadow = "0 0 25px 10px gold";
  setTimeout(() => box.style.boxShadow = "none", 500);
}


/* ===============================
   FINALIZE ASSIGNMENT
   =============================== */

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

  const name = CR_IMAGES.find(x => x.key === key).label;
  document.querySelector("#cr-result").textContent = `${rider} → ${name}`;
}


/* ===============================
   STORAGE HANDLING
   =============================== */

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


/* ===============================
   ADMIN PANEL
   =============================== */

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
      </tr>`;
  });
}

function adminLogin() {
  const pin = prompt("Enter PIN:");
  if (pin === ADMIN_PIN) {
    document.querySelector("#cr-admin-panel").style.display = "block";
  }
}


/* ===============================
   INIT
   =============================== */

window.addEventListener("load", () => {
  cr_load();
  cr_build
