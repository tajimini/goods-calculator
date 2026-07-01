const bonusUnit = 7000;
const storageKey = "goodsCalculatorData";

const products = [
  { id: "photo", name: "BIGうちわ", price: 1100 },
  { id: "acsta", name: "アクリルスタンド", price: 1100 },
  { id: "uchiwa", name: "缶バッジ", price: 500 },
  { id: "tshirt", name: "トレーディングカード", price: 1100 },
  { id: "towel", name: "フェイスタオル", price: 2700 }
  { id: "towel", name: "コレクティングバインダー", price: 3300 }
  { id: "towel", name: "Tシャツ", price: 5500 }
  { id: "towel", name: "ポロシャツ", price: 5700 }
  { id: "towel", name: "トートバッグ", price: 5500 }
  { id: "towel", name: "ポーチ", price: 3500 }
];

let currentUser = "self";

let data = loadData();

function createInitialData() {
  const users = ["self", "proxy1", "proxy2"];
  const initial = {};

  users.forEach(user => {
    initial[user] = {};
    products.forEach(product => {
      initial[user][product.id] = {
        preorder: 0,
        venue: 0
      };
    });
  });

  return initial;
}

function loadData() {
  const saved = localStorage.getItem(storageKey);

  if (saved) {
    return JSON.parse(saved);
  }

  return createInitialData();
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function formatYen(number) {
  return number.toLocaleString("ja-JP");
}

function renderItems() {
  const itemsArea = document.getElementById("items");
  itemsArea.innerHTML = "";

  products.forEach(product => {
    const counts = data[currentUser][product.id];

    const item = document.createElement("div");
    item.className = "item";

    item.innerHTML = `
      <div class="item-header">
        <span>${product.name}</span>
        <span>${formatYen(product.price)}円</span>
      </div>

      <div class="counter-row">
        <span>事前予約分</span>
        <div class="counter">
          <button data-id="${product.id}" data-type="preorder" data-action="minus">−</button>
          <span class="count">${counts.preorder}</span>
          <button data-id="${product.id}" data-type="preorder" data-action="plus">＋</button>
        </div>
      </div>

      <div class="counter-row">
        <span>会場購入分</span>
        <div class="counter">
          <button data-id="${product.id}" data-type="venue" data-action="minus">−</button>
          <span class="count">${counts.venue}</span>
          <button data-id="${product.id}" data-type="venue" data-action="plus">＋</button>
        </div>
      </div>
    `;

    itemsArea.appendChild(item);
  });

  addCounterEvents();
  updateSummary();
}

function addCounterEvents() {
  const buttons = document.querySelectorAll(".counter button");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const productId = button.dataset.id;
      const type = button.dataset.type;
      const action = button.dataset.action;

      if (action === "plus") {
        data[currentUser][productId][type]++;
      }

      if (action === "minus" && data[currentUser][productId][type] > 0) {
        data[currentUser][productId][type]--;
      }

      saveData();
      renderItems();
    });
  });
}

function calculate(type) {
  let total = 0;

  products.forEach(product => {
    const count = data[currentUser][product.id][type];
    total += product.price * count;
  });

  const cards = Math.floor(total / bonusUnit);
  const remainder = total % bonusUnit;
  const next = remainder === 0 ? 0 : bonusUnit - remainder;

  return { total, cards, next };
}

function updateSummary() {
  const preorder = calculate("preorder");
  const venue = calculate("venue");
  const grandTotal = preorder.total + venue.total;

  document.getElementById("preorderTotal").textContent = formatYen(preorder.total);
  document.getElementById("preorderCards").textContent = preorder.cards;
  document.getElementById("preorderNext").textContent = formatYen(preorder.next);

  document.getElementById("venueTotal").textContent = formatYen(venue.total);
  document.getElementById("venueCards").textContent = venue.cards;
  document.getElementById("venueNext").textContent = formatYen(venue.next);

  document.getElementById("grandTotal").textContent = formatYen(grandTotal);
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    currentUser = tab.dataset.user;

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    renderItems();
  });
});

document.getElementById("resetBtn").addEventListener("click", () => {
  const ok = confirm("入力内容をリセットしますか？");

  if (ok) {
    data = createInitialData();
    saveData();
    renderItems();
  }
});

renderItems();
