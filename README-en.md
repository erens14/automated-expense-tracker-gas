# Automated Expense Tracker: Google Form to Sheets with Discord Alerts

[Baca dokumentasi ini dalam Bahasa Indonesia](README.md)

This repository contains a Google Apps Script (GAS) automation system for financial tracking. The system dynamically routes data from Google Forms into monthly sheets, calculates balances, archives reports as PDFs, and sends real-time notifications to Discord.

## 🚀 Key Features

* **Dynamic Form Routing:** Automatically routes form submissions into dynamic monthly tabs (e.g., `Juli2026`).
* **Automated Accounting Formulas:** Injects array formulas for automated running balance calculations.
* **Privacy-Aware PDF Archiver:** Archives previous month's data into a PDF on the 1st, automatically hiding sensitive columns.
* **Discord Webhook Alerts:** Instant notifications for new transactions and PDF archive generation.

---

## 🛠️ Installation Guide

***(Follow the steps below in order)***

### 1. Create Google Form

Ensure your Google Form has the following question order:

1. **Email address** (Enable email collection in settings).
2. **Keterangan** (Description)
3. **Status** (Options: `Masuk` and `Keluar`)
4. **Bank Account**
5. **Nominal** (Numeric input only).

### 2. Link to Google Sheets

* Link your form to a new Google Sheet.
* Go to **Extensions > Apps Script**.
* Create 3 new files: `config.gs`, `autoRouteMonthlyForm.gs`, dan `archivePreviousMonthToPDF.gs`.
* Copy the code from this repository into the respective files.

### 3. System Configuration

Open `config.gs` and customize your `WEBHOOK_URL`, font preferences, and your target Google Drive folder name.

### 4. Trigger Setup

To automate the system, use the **Triggers** menu (clock icon) in the Apps Script editor. Detailed instructions (trigger types, timing, etc.) are **fully documented in the comments at the top of each code file (`.js`)**. Please check the comments in `autoRouteMonthlyForm.js` and `archivePreviousMonthToPDF.js` for full details.

---

## 💡 Use Case Versatility

The routing and automation logic in this repository is **not limited to financial records**. You can use the same logic for other purposes by modifying the `config.js` variables and the data structure in `FormRouter.js`:

* **Attendance Logs:** Route staff attendance data into monthly sheets.
* **Inventory Management:** Separate incoming/outgoing stock data.
* **Support Ticketing:** Route support tickets based on specific departments.
* **Visitor Logs:** Categorize and record visitor data by date or entry type.

As long as you follow the routing logic, this repository can serve as a base template for any data automation project requiring time-based or category-based separation.
