# ReceiptScanner
Ease-of-use scanner for receipts that allows businesses to comfortably keep track of expenses

## Overview

This web application is designed for companies that hhave to manage tricky detailed financials. It streamlines the process of uploading, reviewing, and approving receipts submitted by purchasers, while keeping everything organized.

## Key Features

- **Purchaser Dashboard**  
  Purchasers can easily upload receipts= using a web dashboard. When uploading, they can select the building the receipt is associated with for better organization. 

- **Receipt Item Extraction (OCR)**  
  Uploaded receipts are processed using Tesseract OCR to automatically extract individual line items from the images.

- **Item Review and Cleanup**  
  Purchasers can edit and review the extracted items, remove any that are not applicable, and submit the cleaned data to the database, organized by building.

- **Manager Backend with Secure Login**  
  Managers access a secure backend portal with authentication to:
  - View all submitted receipts
  - Filter and review receipts by building
  - Confirm or flag receipts for further review

## Tech Stack

- Frontend: Purchaser Dashboard, Manager Portal
- Backend: node.js database
- OCR: Tesseract OCR
- Database: SQLite
- Authentication: User-based auth and Company-based auth.

## Getting Started

1. Clone the repository  
   ```bash
   git clone https://github.com/your-org/receipt-management-app.git
   ```

2. Install dependencies  
   ```bash
   cd backend_db
   npm install
   ```

3. Start the development server  
   ```bash
   node main.js
   ```

Run index.html through Live Server. The project is currently hosted on localhost, so backends are not shared.


4. Set up OpenAI API key through
```const OPENAI_API_KEY = 'ENTER KEY HERE'; ``` in ./backend_db/main.js
