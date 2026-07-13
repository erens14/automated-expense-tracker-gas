/*
    IMPORTANT
    This function is triggered by the onFormSubmit event in Google Sheets.
    It automatically routes new form submissions to the appropriate monthly sheet based on the timestamp.
    It also sends a notification to a Discord channel via webhook with the details of the new entry.

    Trigger Setup:
    1. Open your Google Sheet.
    2. Click on "Extensions" > "Apps Script".
    3. In the Apps Script editor, click on the clock icon (Triggers) in the left sidebar.
    4. Click on "+ Add Trigger" in the bottom right corner.
    5. Set the following options:
        - Choose which function to run: autoRouteMonthlyForm
        - Choose which deployment should run: Head
        - Select event source: From spreadsheet
        - Select event type: On form submit
    6. Click "Save".

    Note: Make sure to set the correct Discord webhook URL in the CONFIG object in config.js.
*/

function autoRouteMonthlyForm(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var responseRange = e.range;
    var rowData = responseRange.getValues()[0];
    
    var timestamp = new Date(rowData[0]);
    var targetSheetName = CONFIG.MONTH_NAMES[timestamp.getMonth()] + timestamp.getFullYear();
    var targetSheet = ss.getSheetByName(targetSheetName);
    
    // If the target sheet for the month doesn't exist, create it and set up the headers and formulas
    if (!targetSheet) {
      targetSheet = ss.insertSheet(targetSheetName);
      
      // Set the font and size for the entire sheet
      targetSheet.getRange("A:J").setFontFamily(CONFIG.FONT_NAME).setFontSize(CONFIG.FONT_SIZE_DATA);
      
      var sourceSheet = responseRange.getSheet();
      var lastColumn = sourceSheet.getLastColumn();
      var headers = sourceSheet.getRange(1, 1, 1, lastColumn).getValues();
      
      // Put the headers in the new sheet
      targetSheet.getRange(1, 1, 1, lastColumn).setValues(headers);
      
      // Set Saldo Formula in Column G
      targetSheet.getRange("G1").setValue("Saldo");
      targetSheet.getRange("G2").setValue('=MAP(D2:D; SCAN(0; MAP(D2:D; F2:F; LAMBDA(s; n; IF(s="Masuk"; n; IF(s="Keluar"; -n; 0)))); LAMBDA(p; c; p + c)); LAMBDA(status; saldo; IF(status=""; ""; saldo)))');
      
      // Set Total Income (I1/I2)
      targetSheet.getRange("I1").setValue("Total Pemasukan");
      targetSheet.getRange("I2").setValue('=SUMIF(D2:D; "Masuk"; F2:F)');
      
      // Set Total Expense (J1/J2)
      targetSheet.getRange("J1").setValue("Total Pengeluaran");
      targetSheet.getRange("J2").setValue('=SUMIF(D2:D; "Keluar"; F2:F)');
      
      // Set the font and size for the header row
      targetSheet.getRange("1:1").setFontWeight("bold").setFontSize(CONFIG.FONT_SIZE_HEADER);
    }
    
    // Find the next empty row in the target sheet
    var values = targetSheet.getRange("A:A").getValues();
    var nextRow = 2; 
    
    for (var i = values.length - 1; i >= 0; i--) {
      if (values[i][0] !== "") {
        nextRow = i + 2; 
        break;
      }
    }
    
    // Put the new data into the target sheet
    var targetRange = targetSheet.getRange(nextRow, 1, 1, rowData.length);
    targetRange.setValues([rowData]);
    
    // Ensure the font and size for the newly added row matches the configuration
    targetRange.setFontFamily(CONFIG.FONT_NAME).setFontSize(CONFIG.FONT_SIZE_DATA);

    // --- Discord Webhook ---   
    // Read the data from the newly added row in the target sheet
    // Column A = 0, Column B = 1, Column C = 2, etc.
    
    var tanggal = Utilities.formatDate(timestamp, "GMT+7", "dd/MM/yyyy HH:mm");
    var keterangan = rowData[2]; 
    var status = rowData[3];   
    var bank_account = rowData[4];  
    var nominal = rowData[5];  
    
    // Format nominal to Indonesian Rupiah format
    var formatUang = "Rp " + nominal.toLocaleString("id-ID");
    
    // Make the message to be sent to Discord
    // Change the message format as needed
    var message = "--------------------------------------------------------\n" + 
                  "🔔 **Catatan Keuangan Baru**\n\n" +
                  "📅 Waktu: " + tanggal + "\n" +
                  "🗂 Keterangan: " + keterangan + "\n" +
                  "↕️ Status: **" + status + "**\n" +
                  "💰 Nominal: **" + formatUang + "**\n" +
                  "📝 Bank Account: " + bank_account + "\n" +
                  "--------------------------------------------------------";
                  
    // Encapsulate the message in a payload for Discord
    var payload = {
      "content": message
    };
    
    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true // Pengaman server
    };
    
    // Send the message to Discord using the webhook URL from the configuration
    UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, options);
    // ---------------------------------
    
  } catch(error) {
    Logger.log("Terjadi error: " + error.toString());
  }
}
