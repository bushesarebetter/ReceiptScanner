const receiptGrid = document.getElementById("receiptGrid");
const statusFilter = document.getElementById("statusFilter");
const dateFilter = document.getElementById("dateFilter");

const modal = document.getElementById("modal");
const modalStore = document.getElementById("modalStore");
const modalDate = document.getElementById("modalDate");
const modalTotal = document.getElementById("modalTotal");
const approveBtn = document.getElementById("approveBtn");
const rejectBtn = document.getElementById("rejectBtn");
const closeModal = document.getElementById("closeModal");

let receipts = []; // Fetched from backend
let selectedReceiptId = null;

function openModal(id) {
  const receipt = receipts.find((r) => r.id === id);
  if (!receipt) return;

  selectedReceiptId = id;
  modalStore.value = receipt.store;
  modalDate.value = receipt.date;
  modalTotal.value = receipt.total;

  modal.classList.remove("hidden");
}

function closeModalFunc() {
  modal.classList.add("hidden");
  selectedReceiptId = null;
}

approveBtn.onclick = () => updateStatus("approved");
rejectBtn.onclick = () => updateStatus("rejected");
closeModal.onclick = closeModalFunc;

function updateStatus(newStatus) {
  if (!selectedReceiptId) return;
  const receipt = receipts.find((r) => r.id === selectedReceiptId);
  if (!receipt) return;

  receipt.store = modalStore.value;
  receipt.date = modalDate.value;
  receipt.total = parseFloat(modalTotal.value);
  receipt.status = newStatus;

  renderReceipts();
  closeModalFunc();

  // TODO: Send PUT/PATCH request to backend
}

statusFilter.addEventListener("change", renderReceipts);
dateFilter.addEventListener("change", renderReceipts);

fetchReceipts();
