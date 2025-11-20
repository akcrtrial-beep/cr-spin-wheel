/* ===============================
   CR — Slot Machine Carousel Picker
   =============================== */

const CR_IMAGES = [
  { key: "retro", url: "https://chennairenegades.com/wp-content/uploads/2025/11/Retro.jpg", label: "Retro Cruiser (1-bed)" },
  { key: "sports", url: "https://chennairenegades.com/wp-content/uploads/2025/11/Sports.jpg", label: "Modern Sports (2-bed)" },
  { key: "adv", url: "https://chennairenegades.com/wp-content/uploads/2025/11/ADV.jpg", label: "ADV Bike (5-bed)" },
];

// Rider list
const RIDERS = [
  "Sridhar C","Premnath Rajan","Satish kumar Shankaran","Manikandan Arumugam","Mohan Murthy",
  "Lakshmi Narayanan S","Vignesh Balasubramani","Rameshkumar S","Nikkil Nair","Abhilash S",
  "Shivam Saluja","Balaji Dilli Babu","Jayapal N K","Rahul Raj","Ganapathy Ganesan",
  "Sendhil Nathan","Ananthakrishnan T C","Jiju Pushkaran","Santosh Krishnan","Jalapathy K",
  "Sugheendran","Chandrasekar V","Srinivasan Sundar","Sangeeth Kumar Vasudevan","Raghavan Vijayaraghavan",
  "Venkatesan Srinivasan","Pending Rider"
].sort();

// Room counts
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

  // Create a long repeated sequence for infinite loop
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

/* ===============================
   RENDER RIDERS
   =============================== */
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

/* ===============================
   SPIN CAROUSEL
   =============================== */
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
  const speed = 60; // fast speed
  const duration = 10000; // 10 sec

  const timer = setInterval(() => {
    pos -= speed;
    track.style.transform = `translateX(${pos}px)`;
  }, 50);

  setTimeout(() => {
    clearInterval(timer);
    cr_stopCarousel(pos, rider);
    spinning = false;
  }, duration);
}

/* ===============================
   STOP CAROUSEL & DETECT RESULT
   =============================== */
function cr_stopCarousel(pos, rider) {
  const itemWidth = 420; // width of each image card

  // Adjust pos by half-width so pointer aligns correctly
  let index = Math.abs(Math.round((pos + itemWidth / 2) / itemWidth));

  // Wrap index within number of unique images
  index = index % CR_IMAGES.length;

  const chosenKey = CR_IMAGES[index].key;

  cr_finalize(rider, chosenKey);
}

/* ===============================
   ASSIGN ROOM
   =============================== */
function cr_finalize(rider, key) {
  if (available[key] <= 0) {
    // fallback available type
    if (available.retro > 0) key = "retro";
    else if (available.sports > 0) key = "sports";
    else key = "adv";
  }

  available[key] -= 1;
  const now = new Date().toLocaleString();

  assignments.push({
    rider,
    key,
    time: now
  });

  remaining = remaining.filter(r => r !== rider);
  cr_save();
  cr_renderRiders();
  cr_updateAdminPanel();

  const name = CR_IMAGES.find(i => i.key === key).label;
  document.querySelector("#cr-result").textContent = `${rider} → ${name}`;
}

/* ===============================
   ADMIN / SAVE STATE
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

/* ===============================
   ADMIN LOGIN
   =============================== */
function adminLogin() {
  const pin = prompt("Enter PIN:");
  if (pin === ADMIN_PIN) {
    document.querySelector("#cr-admin-panel").style.display = "block";
  } else {
    alert("Incorrect PIN");
  }
}

/* ===============================
   INIT
   =============================== */
window.addEventListener("load", () => {
  cr_load();
  cr_buildCarousel();
  cr_renderRiders();
  cr_updateAdminPanel();
});
