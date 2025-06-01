# ReceiptScanner
Ease-of-use scanner for receipts that allows businesses to comfortably keep track of expenses

## Overview

This web application is designed for companies that manage home and apartment upgrades across multiple buildings. It streamlines the process of uploading, reviewing, and approving receipts submitted by purchasers, while keeping everything organized by building.

## Key Features

- **Purchaser Dashboard**  
  Purchasers can easily upload receipts for home or apartment upgrades using a web dashboard. When uploading, they can select the building the receipt is associated with for better organization. 

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

- Frontend (Purchaser Dashboard): (Specify your frontend framework, e.g., React)
- Backend (Manager Portal): (Specify backend, e.g., Node.js, Django, with secure login)
- OCR: Tesseract OCR
- Database: (e.g., PostgreSQL, MongoDB)
- Authentication: (e.g., JWT, OAuth, or session-based auth)

## Getting Started

1. Clone the repository  
   ```bash
   git clone https://github.com/your-org/receipt-management-app.git
   ```

2. Install dependencies  
   ```bash
   cd receipt-management-app
   npm install
   ```

3. Start the development server  
   ```bash
   npm run dev
   ```

4. Set up environment variables for database, authentication, and OCR configuration (see `.env.example`)

## Future Improvements

- Advanced filtering and reporting by building or date range
- Email notifications for status updates
- Role-based access control (admin vs manager)
- Improved OCR accuracy with custom training data
- Capability to submit the receipts using the phone app from a cell phone
