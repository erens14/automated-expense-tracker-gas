/*
    IMPORTANT
    This function is triggered by a time-driven trigger in Google Sheets.
    It runs on the first day of each month and archives the previous month's sheet to a PDF file.
    The PDF is saved to a specified folder in Google Drive, and a notification is sent to a Discord channel via webhook with the details of the archived PDF.

    Trigger Setup:
    1. Open your Google Sheet.
    2. Click on "Extensions" > "Apps Script".
    3. In the Apps Script editor, click on the clock icon (Triggers) in the left sidebar.
    4. Click on "+ Add Trigger" in the bottom right corner.
    5. Set the following options:
        - Choose which function to run: archivePreviousMonthToPDF
        - Choose which deployment should run: Head
        - Select event source: Time-driven
        - Select type of time based trigger: Month timer
        - Select day of the month: 1
        - Select time of day: Choose a time (e.g., 12:00 AM to 1:00 AM)
    6. Click "Save".
*/

function archivePreviousMonthToPDF() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    var hariIni = new Date();
    var bulanLalu = new Date(hariIni.getFullYear(), hariIni.getMonth() - 1, 1);

    var targetSheetName = CONFIG.MONTH_NAMES[bulanLalu.getMonth()] + bulanLalu.getFullYear();
    var targetSheet = ss.getSheetByName(targetSheetName);
    
    if (targetSheet) {
      // --- Hide Column B ---

      // Hide Column B (Email/Privacy) before exporting to PDF temporarily
      targetSheet.hideColumns(2); 
      SpreadsheetApp.flush(); 
      
      var sheetId = targetSheet.getSheetId();
      
      var url = ss.getUrl().replace(/edit$/, '') + 
                'export?exportFormat=pdf&gid=' + sheetId + 
                '&size=A4&portrait=true&fitw=true&gridlines=true';
      
      var response = UrlFetchApp.fetch(url, {
        headers: {
          'Authorization': 'Bearer ' +  ScriptApp.getOAuthToken()
        }
      });
      
      // Unhide Column B (Email/Privacy) after exporting to PDF
      targetSheet.showColumns(2);
      SpreadsheetApp.flush();
      // ----------

      // Format the PDF file name to include the month and year
      var blob = response.getBlob().setName("Laporan_Keuangan_" + targetSheetName + ".pdf");
      
      // --- Save to Google Drive ---
      var folderIterator = DriveApp.getFoldersByName(CONFIG.PDF_FOLDER_NAME);
      var targetFolder;
      
      // Check if the folder exists; if not, create it to avoid script crash
      if (folderIterator.hasNext()) {
        targetFolder = folderIterator.next(); // Take the first folder with the specified name
      } else {
        targetFolder = DriveApp.createFolder(CONFIG.PDF_FOLDER_NAME);
      }
      
      // Save the PDF file to the specified folder in Google Drive
      targetFolder.createFile(blob);

      Logger.log("Laporan bulanan " + targetSheetName + " berhasil diarsipkan ke folder " + CONFIG.PDF_FOLDER_NAME);
      // ----------
      
      // --- Discord Webhook ---
      var message = "--------------------------------------------------------\n" + 
                    "📄 **Arsip Laporan PDF Berhasil Dibuat!**\n\n" +
                    "🗂 Nama File: **Laporan_Keuangan_" + targetSheetName + ".pdf**\n" +
                    "📁 Lokasi Simpan: Folder **" + CONFIG.PDF_FOLDER_NAME + "** di Google Drive\n" +
                    "✨ *Catatan: Kolom Email/Privasi telah disembunyikan secara otomatis.*\n" +
                    "--------------------------------------------------------";
                      
      var payload = {
        "content": message
      };
        
      var options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
      };
        
      UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, options);
      // ----------
      
    } else {
      Logger.log("Tab " + targetSheetName + " tidak ditemukan untuk diarsipkan.");
    }
    
  } catch(error) {
    Logger.log("Gagal membuat arsip PDF: " + error.toString());
  }
}
