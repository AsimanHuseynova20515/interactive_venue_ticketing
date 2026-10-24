const VENUE = {
  name: "Asiman Theatre",
  width: 1000, height: 920,
  seat: 28, gap: 6,
  zones: [
    { id:"of",  label:"Orchestra Front", price:90,  color:"#ef6c4d", rows:6, cols:14, x:262, y:150 },
    { id:"or",  label:"Orchestra Rear",  price:65,  color:"#f2a541", rows:8, cols:18, x:194, y:380 },
    { id:"bl",  label:"Balcony",         price:45,  color:"#2fa38f", rows:6, cols:20, x:160, y:690 },
    { id:"bxl", label:"Box Left",        price:120, color:"#7c5cd6", rows:4, cols:6,  x:20,  y:150 },
    { id:"bxr", label:"Box Right",       price:120, color:"#7c5cd6", rows:4, cols:6,  x:776, y:150 }
  ]
};

const SEATS = {};

function buildSeats() {
  const pitch = VENUE.seat + VENUE.gap;
  VENUE.zones.forEach((z, zi) => {
    for (let r = 0; r < z.rows; r++) {
      for (let c = 0; c < z.cols; c++) {
        const row = String.fromCharCode(65 + r);
        const id = `${z.id}-${row}${c + 1}`;
        SEATS[id] = {
          id, zone: z, row, num: c + 1, price: z.price,
          x: z.x + c * pitch, y: z.y + r * pitch,
          unavailable: (r * 7 + c * 13 + zi * 5) % 9 === 0   // fixed "sold" pattern
        };
      }
    }
  });
}

const state = { inspected: null, cart: [] };
const seatEls = {};

function statusOf(id) {
  if (SEATS[id].unavailable) return "unavailable";
  if (state.cart.includes(id)) return "in-cart";
  if (state.inspected === id) return "inspected";
  return "available";
}

function updateSeats() {
  for (const id in seatEls) seatEls[id].className = "seat " + statusOf(id);
}

function renderLegend() {
  document.getElementById("legend").innerHTML = VENUE.zones
    .map(z => `<li><i style="background:${z.color}"></i>${z.label} – $${z.price}</li>`)
    .join("");
}

function renderMap() {
  const map = document.getElementById("map");

  const stage = document.createElement("div");
  stage.className = "stage";
  stage.textContent = "STAGE";
  map.append(stage);

  for (const s of Object.values(SEATS)) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.id = s.id;
    b.style.left = s.x + "px";
    b.style.top = s.y + "px";
    b.style.setProperty("--c", s.zone.color);
    b.setAttribute("aria-label", `${s.zone.label}, row ${s.row}, seat ${s.num}, $${s.price}`);
    seatEls[s.id] = b;
    map.append(b);
  }

  renderLegend();
  updateSeats();
}


buildSeats();
renderMap();

document.getElementById("map").style.transform = "scale(0.6)";