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
var STEP = 60;

function applyView() {
  var width = viewport.clientWidth;
  var height = viewport.clientHeight;
  var keep = 100; 

  var mapWidth = VENUE.width * view.scale;
  var mapHeight = VENUE.height * view.scale;


  if (view.x > width - keep) {
    view.x = width - keep;
  }
  if (view.x < keep - mapWidth) {
    view.x = keep - mapWidth;
  }


  if (view.y > height - keep) {
    view.y = height - keep;
  }
  if (view.y < keep - mapHeight) {
    view.y = keep - mapHeight;
  }

  mapEl.style.transform =
    "translate(" + view.x + "px," + view.y + "px) scale(" + view.scale + ")";
}



function zoomBy(factor, centerX, centerY) {
  if (centerX === undefined) {
    centerX = viewport.clientWidth / 2;
  }
  if (centerY === undefined) {
    centerY = viewport.clientHeight / 2;
  }

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
    if (action === "up") {
      view.y = view.y + STEP;
      applyView();
    }
    if (action === "down") {
      view.y = view.y - STEP;
      applyView();
    }
    if (action === "left") {
      view.x = view.x + STEP;
      applyView();
    }
    if (action === "right") {
      view.x = view.x - STEP;
      applyView();
    }
    if (action === "reset") {
      resetView();
    }
  });

  window.addEventListener("resize", applyView);
  resetView();
}


var dragging = false;
var dragMoved = false;
var dragStartX = 0;
var dragStartY = 0;
var viewStartX = 0;
var viewStartY = 0;

function initMouse() {

  viewport.addEventListener("wheel", function (event) {
    event.preventDefault();

    var box = viewport.getBoundingClientRect();
    var pointerX = event.clientX - box.left;
    var pointerY = event.clientY - box.top;

    if (event.deltaY < 0) {
      zoomBy(1.1, pointerX, pointerY);
    } else {
      zoomBy(1 / 1.1, pointerX, pointerY);
    }
  }, { passive: false });

  viewport.addEventListener("pointerdown", function (event) {
    dragging = true;
    dragMoved = false;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    viewStartX = view.x;
    viewStartY = view.y;
  });

  window.addEventListener("pointermove", function (event) {
    if (dragging == false) {
      return;
    }

    var moveX = event.clientX - dragStartX;
    var moveY = event.clientY - dragStartY;

    if (Math.abs(moveX) + Math.abs(moveY) > 5) {
      dragMoved = true;
      viewport.classList.add("dragging");
    }

    if (dragMoved == true) {
      view.x = viewStartX + moveX;
      view.y = viewStartY + moveY;
      applyView();
    }
  });

  window.addEventListener("pointerup", function () {
    dragging = false;
    viewport.classList.remove("dragging");
  });


  mapEl.addEventListener("click", function (event) {
    if (dragMoved == true) {
      event.stopPropagation();
      dragMoved = false;
    }
  }, true);
}


function addToCart() {
  var id = state.inspected;

  if (id === null) {
    return;
  }
  if (SEATS[id].unavailable === true) {
    return;
  }
  if (state.cart.includes(id)) {
    return;  
  }

  state.cart.push(id);
  saveCart();
  refresh();
}


function removeFromCart(id) {
  var newCart = [];

  for (var i = 0; i < state.cart.length; i++) {
    if (state.cart[i] != id) {
      newCart.push(state.cart[i]);
    }
  }

  state.cart = newCart;
  saveCart();
  refresh();
}


function makeCartRow(id) {
  var seat = SEATS[id];

  var row = document.createElement("li");

  var text = document.createElement("span");
  text.textContent = seat.zone.label + " " + seat.row + seat.num + " - $" + seat.price;

  var button = document.createElement("button");
  button.textContent = "✕";
  button.onclick = function () {
    removeFromCart(id);
  };

  row.appendChild(text);
  row.appendChild(button);
  return row;
}


function renderCart() {
  var list = document.getElementById("cart-list");
  var totalEl = document.getElementById("total");
  var total = 0;

  list.innerHTML = "";

  if (state.cart.length == 0) {
    list.innerHTML = "<li>Your cart is empty</li>";
  }

  for (var i = 0; i < state.cart.length; i++) {
    var id = state.cart[i];
    total = total + SEATS[id].price;
    list.appendChild(makeCartRow(id));
  }

  totalEl.textContent = total;
    if (state.cart.length == 0) {
    clearBtn.disabled = true;
  } else {
    clearBtn.disabled = false;
  }
}


function refresh() {
  updateSeats();
  showDetails();
  renderCart();
}

addBtn.onclick = addToCart;

var clearBtn = document.getElementById("clear-btn");

function clearCart() {
  if (state.cart.length == 0) {
    return;
  }

  state.cart = [];
  saveCart();
  refresh();
}

clearBtn.onclick = clearCart;


var CART_KEY = "asiman-cart-v1";


function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  } catch (error) {
  }
}



function loadCart() {
  try {
    var saved = JSON.parse(localStorage.getItem(CART_KEY));

    if (Array.isArray(saved) == false) {
      return;
    }

    var cleanCart = [];
    for (var i = 0; i < saved.length; i++) {
      var id = saved[i];

      if (SEATS[id] == undefined) {
        continue;
      }
      if (SEATS[id].unavailable == true) {
        continue;
      }
      if (cleanCart.includes(id)) {
        continue; 
      }
      cleanCart.push(id);
    }

    state.cart = cleanCart;
  } catch (error) {
    state.cart = [];
  }
}


buildSeats();
loadCart();
renderMap();
showDetails();
renderCart();
initView();
initMouse();