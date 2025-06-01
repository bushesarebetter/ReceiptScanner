document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const filePickerBtn = document.getElementById('file-picker-btn');
  const uploadContainer = document.getElementById('upload-container');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const previewImage = document.getElementById('preview-image');
  const loadingOverlay = document.getElementById('loading-overlay');
  const cancelUploadBtn = document.getElementById('cancel-upload-btn');
  const confirmationModal = document.getElementById('confirmation-modal');
  const modalReceiptImage = document.getElementById('modal-receipt-image');
  const modalFileName = document.getElementById('modal-file-name');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');
  const receiptForm = document.getElementById('receipt-form');
  const vendorNameInput = document.getElementById('vendor-name');
  const totalCostInput = document.getElementById('total-cost');
  const receiptDateInput = document.getElementById('receipt-date');
  const buildingNameInput = document.getElementById('building-name');
  const buildingNameField = document.getElementById('building-name-field');
  const refreshBtn = document.getElementById('refresh-btn');
  const receiptsGrid = document.getElementById('receipts-grid');
  const emptyState = document.getElementById('empty-state');
  const loadingReceipts = document.getElementById('loading-receipts');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const closeErrorBtn = document.getElementById('close-error-btn');
  const itemsList = document.getElementById('itemsList');
  const addItemBtn = document.getElementById('addItemBtn');
  const recalculateBtn = document.getElementById('recalculate-btn');
  const recalculatedTotal = document.getElementById('recalculated-total');

  recalculateBtn.addEventListener('click', () => {
    const updatedItems = getUpdatedItems(); // already defined in your script
    const total = updatedItems.reduce((sum, item) => sum + item.price, 0);
    
    totalCostInput.value = total.toFixed(2); // update input field
    recalculatedTotal.textContent = `Total: $${total.toFixed(2)}`; // update display
  });

  let currentFile = null;
  let extractedData = null;

  // Event listeners
  filePickerBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => handleFileSelect(e.target.files[0]));

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('active');
  });

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('active'));

  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('active');
    if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files[0]);
  });

  cancelUploadBtn.addEventListener('click', resetUploadForm);
  modalCancelBtn.addEventListener('click', () => confirmationModal.classList.add('hidden'));

  addItemBtn.addEventListener('click', () => {
    const itemRow = document.createElement('div');
    itemRow.className = 'flex space-x-2 items-center';
    itemRow.innerHTML = `
      <input type="text" class="item-name border px-2 py-1 w-1/2 rounded" placeholder="Item name" />
      <input type="number" step="0.01" class="item-price border px-2 py-1 w-1/3 rounded" placeholder="Price" />
      <button class="remove-item text-red-500 text-sm">Remove</button>
    `;
    itemsList.appendChild(itemRow);
  });

  itemsList.addEventListener('click', e => {
    if (e.target.classList.contains('remove-item')) {
      e.target.parentElement.remove();
    }
  });

  receiptForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!buildingNameInput.value.trim()) {
      buildingNameField.classList.add('invalid');
      return;
    }
    buildingNameField.classList.remove('invalid');

    confirmationModal.classList.add('hidden');

    const updatedItems = getUpdatedItems();

    // Prepare payload for the backend
    const payload = {
      userKey: "demoUserKey123",    // Replace with actual user key logic
      companyKey: "demoCompanyKey", // Replace with actual company key logic
      imageUrl: previewImage.src,
      vendor: vendorNameInput.value || 'Sample Vendor',
      total: parseFloat(totalCostInput.value) || 0,
      date: receiptDateInput.value || '2025-01-01',
      buildingName: buildingNameInput.value || 'Main Building',
      status: 'Pending',
      items: updatedItems
    };

    console.log('Submitting receipt:', totalCostInput.value, payload);

    try {
      const resp = await fetch('http://localhost:3001/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        showErrorBanner(`Failed to save receipt: ${errorData.error || resp.statusText}`);
        return;
      }

      const savedReceipt = await resp.json();

      addReceiptCard({
        id: savedReceipt.id,
        imageUrl: savedReceipt.imageUrl || previewImage.src,
        vendor: savedReceipt.vendor,
        total: savedReceipt.total,
        date: savedReceipt.date,
        buildingName: savedReceipt.buildingName,
        status: savedReceipt.status,
        items: savedReceipt.items
      });

      resetUploadForm();

      emptyState.classList.add('hidden');
      receiptsGrid.classList.remove('hidden');

    } catch (err) {
      console.error(err);
      showErrorBanner('Network error: Unable to save receipt.');
    }
  });

  refreshBtn.addEventListener('click', () => {
    fetchReceipts();
  });

  closeErrorBtn.addEventListener('click', () => errorBanner.classList.add('hidden'));

  buildingNameInput.addEventListener('input', () => {
    if (buildingNameInput.value.trim()) {
      buildingNameField.classList.remove('invalid');
    }
  });

  // --- Functions ---

  async function fetchReceipts() {
    try {
      loadingReceipts.classList.remove('hidden');
      receiptsGrid.classList.add('hidden');
      emptyState.classList.add('hidden');

      const resp = await fetch('http://localhost:3001/api/receipts?userKey=demoUserKey123');
      if (!resp.ok) throw new Error('Failed to fetch receipts');

      const receipts = await resp.json();

      // Clear existing cards
      receiptsGrid.innerHTML = '';

      if (receipts.length === 0) {
        emptyState.classList.remove('hidden');
        receiptsGrid.classList.add('hidden');
      } else {
        receipts.forEach(receipt => addReceiptCard(receipt));
        emptyState.classList.add('hidden');
        receiptsGrid.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      showErrorBanner('Unable to load receipts from server.');
    } finally {
      loadingReceipts.classList.add('hidden');
    }
  }

  async function callOpenAI(promptText) {
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a receipt analysis assistant. You will receive messy OCR text from scanned receipts. Extract the following fields if they exist:

- Vendor name (store or merchant)
- Total amount paid (as a number or string with currency)
- Date of the receipt (preferably in YYYY-MM-DD format)
- Line items: each item name and price

Return the result as valid JSON in this format:
{
  "vendor": "string",
  "items": [
    { "name": "string", "price": number },
    ...
  ],
  "total": number,
  "date": "YYYY-MM-DD"
}

If there are multiple of the same item, use the format "Nx Item Name" in the 'name' field, where N is the number of items.

Only include items that have a clear price next to them. Do not include promotional or unclear text.

If a field cannot be reliably found, return an empty string or an empty array. Do not explain. Do not wrap the result in markdown or quotes.
`
        },
        {
          role: "user",
          content: `OCR text from receipt:\n\n${promptText}`
        }
      ],
      temperature: 0.2
    };

    const resp = await fetch('http://localhost:3001/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) throw new Error(`OpenAI error: ${resp.status}`);
    const data = await resp.json();

    try {
      return JSON.parse(data.choices?.[0]?.message?.content || '{}');
    } catch {
      console.warn("OpenAI didn't return valid JSON:", data);
      return {};
    }
  }

  function handleFileSelect(file) {
    if (!file || !file.type.match('image.*')) {
      showErrorBanner('Please select an image file (JPG, PNG)');
      return;
    }

    currentFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      previewImage.src = e.target.result;
      modalReceiptImage.src = e.target.result;
      modalFileName.textContent = file.name;

      uploadContainer.classList.add('hidden');
      imagePreviewContainer.classList.remove('hidden');
      loadingOverlay.classList.add('hidden');

      Tesseract.recognize(e.target.result, 'eng', { logger: m => console.log(m) })
        .then(({ data: { text } }) => callOpenAI(text))
        .then(result => {
          extractedData = result;

          vendorNameInput.value = result.vendor || '';
          totalCostInput.value = result.total || '';
          receiptDateInput.value = result.date || '';
          buildingNameInput.value = '';

          showConfirmationModal(result.vendor, result.total, result.date, result.items || []);
        })
        .catch(err => {
          console.error(err);
          showErrorBanner("Failed to analyze receipt with OpenAI.");
        });
    };

    reader.readAsDataURL(file);
  }

  function getUpdatedItems() {
    return Array.from(document.querySelectorAll('#itemsList > div')).map(row => {
      const name = row.querySelector('.item-name').value.trim();
      const price = parseFloat(row.querySelector('.item-price').value);
      return (name && !isNaN(price)) ? { name, price } : null;
    }).filter(Boolean);
  }

  function showConfirmationModal(vendor, total, date, items) {
    vendorNameInput.value = vendor || '';
    totalCostInput.value = total || '';
    receiptDateInput.value = date || '';
    buildingNameInput.value = '';
    recalculatedTotal.textContent = `Total: $${parseFloat(total || 0).toFixed(2)}`;

    itemsList.innerHTML = '';

    (Array.isArray(items) ? items : []).forEach(item => {
      const itemRow = document.createElement('div');
      itemRow.className = 'flex space-x-2 items-center';
      itemRow.innerHTML = `
        <input type="text" class="item-name border px-2 py-1 w-1/2 rounded" value="${item.name}" placeholder="Item name" />
        <input type="number" step="0.01" class="item-price border px-2 py-1 w-1/3 rounded" value="${item.price}" placeholder="Price" />
        <button class="remove-item text-red-500 text-sm">Remove</button>
      `;
      itemsList.appendChild(itemRow);
    });

    confirmationModal.classList.remove('hidden');
  }

  function resetUploadForm() {
    uploadContainer.classList.remove('hidden');
    imagePreviewContainer.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');
    fileInput.value = '';
    currentFile = null;
  }

  function showErrorBanner(message) {
    errorMessage.textContent = message;
    errorBanner.classList.remove('hidden');
    setTimeout(() => errorBanner.classList.add('hidden'), 5000);
  }

  function addReceiptCard(receipt) {
    const card = document.createElement('div');
    card.className = 'receipt-card bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md';

    card.innerHTML = `
      <div class="aspect-w-16 aspect-h-9 bg-gray-100">
        <img src="${receipt.imageUrl}" alt="Receipt" class="object-cover w-full h-full" />
      </div>
      <div class="p-4 space-y-2">
        <h3 class="text-lg font-semibold">${receipt.vendor}</h3>
        <p class="text-sm text-gray-500">${receipt.date}</p>
        <p class="text-sm font-semibold">$${ parseFloat(receipt.amount || receipt.total || 0).toFixed(2) }</p>
        <p class="text-sm">${receipt.buildingName || ''}</p>
        <p class="text-xs text-gray-400">${receipt.status || 'Pending'}</p>
        <details class="mt-2">
          <summary class="cursor-pointer text-sm font-medium text-indigo-600">Items</summary>
          <ul class="mt-1 list-disc list-inside text-sm">
            ${receipt.items?.map(i => `<li>${i.name} - $${i.price.toFixed(2)}</li>`).join('') || '<li>No items</li>'}
          </ul>
        </details>
      </div>
    `;

    receiptsGrid.prepend(card);
  }

  // Initial fetch of receipts on page load
  fetchReceipts();
});
document.getElementById('receipt-form').addEventListener('submit', async (event) => {
  event.preventDefault(); // ✨ This prevents the page reload!

  const vendor = event.target.vendor.value;

  const receiptData = {
    vendor,
    // add other fields here (userKey, imageUrl, etc.)
  };

  try {
    const response = await fetch('http://localhost:3001/api/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData)
    });

    const data = await response.json();
    console.log('Receipt saved:', data);
  } catch (err) {
    console.error('Failed to save receipt:', err);
  }
});
