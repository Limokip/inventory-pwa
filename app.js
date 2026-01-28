const { jsPDF } = window.jspdf;

// Load from localStorage or set defaults
let items = JSON.parse(localStorage.getItem("items")) || [
  { id: 1, name: "Item A", price: 10, stock: 8, sold: 0 },
  { id: 2, name: "Item B", price: 15, stock: 3, sold: 0 }
];
let dailySales = parseFloat(localStorage.getItem("dailySales")) || 0;

function saveData() {
  localStorage.setItem("items", JSON.stringify(items));
  localStorage.setItem("dailySales", dailySales);
}

function renderItems() {
  const list = document.getElementById("itemList");
  list.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input value="${item.name}" onchange="editItem(${item.id}, 'name', this.value)">
      <input type="number" value="${item.price}" onchange="editItem(${item.id}, 'price', this.value)">
      <button onclick="updateStock(${item.id}, -1)">-</button>
      <span class="${item.stock < 5 ? 'low' : ''}">${item.stock}</span>
      <button onclick="updateStock(${item.id}, 1)">+</button>
      <button onclick="recordSale(${item.id})">Sell</button>
      <button onclick="deleteItem(${item.id})">Delete</button>
    `;
    list.appendChild(li);
  });
  document.getElementById("sales").textContent = dailySales;
  renderChart();
  updateTopProduct();
  saveData();
}

function updateStock(id, delta) {
  items = items.map(i => i.id === id ? { ...i, stock: i.stock + delta } : i);
  renderItems();
}

function editItem(id, field, value) {
  items = items.map(i => i.id === id ? { ...i, [field]: field === "price" ? +value : value } : i);
  renderItems();
}

function recordSale(id) {
  items = items.map(i => i.id === id ? { ...i, stock: i.stock - 1, sold: i.sold + 1 } : i);
  dailySales += items.find(i => i.id === id).price;
  renderItems();
}

function resetSales() {
  dailySales = 0;
  renderItems();
}

function downloadPDF() {
  const doc = new jsPDF();
  doc.text("Low Stock Report", 10, 10);
  items.filter(i => i.stock < 5).forEach((item, idx) => {
    doc.text(`${item.name} - Stock: ${item.stock}`, 10, 20 + idx * 10);
  });
  doc.save("low_stock_report.pdf");
}

function renderChart() {
  const ctx = document.getElementById("chart").getContext("2d");
  if (window.chartInstance) window.chartInstance.destroy();
  const data = {
    labels: items.map(i => i.name),
    datasets: [{
      label: "Stock",
      data: items.map(i => i.stock),
      backgroundColor: items.map(i => i.stock < 5 ? "red" : "blue")
    }]
  };
  window.chartInstance = items.length <= 5 ? new Chart(ctx, { type: "pie", data }) : new Chart(ctx, { type: "bar", data });
}

function updateTopProduct() {
  const top = items.reduce((max, i) => i.sold > max.sold ? i : max, items[0]);
  document.getElementById("topProduct").textContent = top.sold > 0 ? top.name : "None";
}

// Add new item
function addNewItem(event) {
  event.preventDefault();
  const name = document.getElementById("newName").value;
  const price = parseFloat(document.getElementById("newPrice").value);
  const stock = parseInt(document.getElementById("newStock").value);
  const newItem = {
    id: Date.now(),
    name,
    price,
    stock,
    sold: 0
  };
  items.push(newItem);
  document.getElementById("addItemForm").reset();
  renderItems();
}

// Delete item
function deleteItem(id) {
  items = items.filter(i => i.id !== id);
  renderItems();
}

// Register Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("Service Worker registered"));
}

renderItems();
