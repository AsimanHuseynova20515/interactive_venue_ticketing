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
          unavailable: (r * 7 + c * 13 + zi * 5) % 9 === 0 
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


const addBtn = document.getElementById("add-btn");

function inspect(id) {
  state.inspected = id;
  updateSeats();
  showDetails();
}



function showDetails() {
  var body = document.getElementById("detail-body");
  var id = state.inspected;

  if (id === null) {
    body.textContent = "Select a seat on the map.";
    addBtn.disabled = true;
    return;
  }

  var seat = SEATS[id];
  var status = statusOf(id);


  var statusText = "Available";
  if (status === "in-cart") {
    statusText = "In your cart";
  }
  if (status === "unavailable") {
    statusText = "Sold";
  }

  var html = "";
  html = html + '<div class="detail-zone">';
  html = html + '<i style="background:' + seat.zone.color + '"></i>';
  html = html + seat.zone.label;
  html = html + '</div>';

  html = html + '<div class="detail-row"><span>Row</span><b>' + seat.row + '</b></div>';
  html = html + '<div class="detail-row"><span>Seat</span><b>' + seat.num + '</b></div>';
  html = html + '<div class="detail-row"><span>Price</span><span class="detail-price">$' + seat.price + '</span></div>';
  html = html + '<div class="detail-row"><span>Status</span><span class="badge ' + status + '">' + statusText + '</span></div>';

  body.innerHTML = html;

  if (seat.unavailable === true || state.cart.includes(id)) {
    addBtn.disabled = true;
  } else {
    addBtn.disabled = false;
  }
}

document.getElementById("map").addEventListener("click", e => {
  const b = e.target.closest(".seat");
  if (b) inspect(b.dataset.id);
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && state.inspected !== null) {
    state.inspected = null;
    updateSeats();
    showDetails();
  }
});



var view = { x: 0, y: 0, scale: 1 };
var viewport = document.getElementById("viewport");
var mapEl = document.getElementById("map");

var MIN_SCALE = 0.3;
var MAX_SCALE = 3;


function applyView() {
  mapEl.style.transform =
    "translate(" + view.x + "px," + view.y + "px) scale(" + view.scale + ")";
}



function zoomBy(factor) {
  var centerX = viewport.clientWidth / 2;
  var centerY = viewport.clientHeight / 2;

  var newScale = view.scale * factor;
  if (newScale < MIN_SCALE) {
    newScale = MIN_SCALE;
  }
  if (newScale > MAX_SCALE) {
    newScale = MAX_SCALE;
  }

  var ratio = newScale / view.scale;
  view.x = centerX - (centerX - view.x) * ratio;
  view.y = centerY - (centerY - view.y) * ratio;
  view.scale = newScale;

  applyView();
}



function resetView() {
  var width = viewport.clientWidth;
  var height = viewport.clientHeight;

  view.scale = Math.min(width / VENUE.width, height / VENUE.height);
  view.x = (width - VENUE.width * view.scale) / 2;
  view.y = (height - VENUE.height * view.scale) / 2;

  applyView();
}



function initView() {
  document.getElementById("controls").addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (button === null) {
      return;
    }
    var action = button.dataset.act;

    if (action === "in") {
      zoomBy(1.25);
    }
    if (action === "out") {
      zoomBy(1 / 1.25);
    }
    if (action === "reset") {
      resetView();
    }
  });

  resetView();
}

buildSeats();
renderMap();
showDetails();
initView();