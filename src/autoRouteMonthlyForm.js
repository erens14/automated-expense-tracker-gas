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
    
    // If the new month sheet doesn't exist yet, create it and set the base formatting
    if (!targetSheet) {
      targetSheet = ss.insertSheet(targetSheetName);
      
      // MAIN KEY: Set the default font and size for the entire working area (Columns A to J)
      targetSheet.getRange("A:J").setFontFamily(CONFIG.FONT_NAME).setFontSize(CONFIG.FONT_SIZE_DATA);
      
      var sourceSheet = responseRange.getSheet();
      var lastColumn = sourceSheet.getLastColumn();
      var headers = sourceSheet.getRange(1, 1, 1, lastColumn).getValues();
      
      // 1. Paste original response headers from Google Form
      targetSheet.getRange(1, 1, 1, lastColumn).setValues(headers);
      
      // 2. Balance (G1/G2)
      targetSheet.getRange("G1").setValue("Saldo");
      targetSheet.getRange("G2").setValue('=MAP(D2:D; SCAN(0; MAP(D2:D; F2:F; LAMBDA(s; n; IF(s="Masuk"; n; IF(s="Keluar"; -n; 0)))); LAMBDA(p; c; p + c)); LAMBDA(status; saldo; IF(status=""; ""; saldo)))');
      
      // 3. Total Income (I1/I2)
      targetSheet.getRange("I1").setValue("Total Pemasukan");
      targetSheet.getRange("I2").setValue('=SUMIF(D2:D; "Masuk"; F2:F)');
      
      // 4. Total Expense (J1/J2)
      targetSheet.getRange("J1").setValue("Total Pengeluaran");
      targetSheet.getRange("J2").setValue('=SUMIF(D2:D; "Keluar"; F2:F)');
      
      // 5. Header Row (Row 1) specific: make it slightly larger and bold
      targetSheet.getRange("1:1").setFontWeight("bold").setFontSize(CONFIG.FONT_SIZE_HEADER);
    }
    
    // Find the first empty row based on Column A
    var values = targetSheet.getRange("A:A").getValues();
    var nextRow = 2; 
    
    for (var i = values.length - 1; i >= 0; i--) {
      if (values[i][0] !== "") {
        nextRow = i + 2; 
        break;
      }
    }
    
    // Write new data to the empty row
    var targetRange = targetSheet.getRange(nextRow, 1, 1, rowData.length);
    targetRange.setValues([rowData]);
    
    // Ensure the newly entered data row uses your preferred font and size
    targetRange.setFontFamily(CONFIG.FONT_NAME).setFontSize(CONFIG.FONT_SIZE_DATA);

    // --- Send Discord Webhook ---   
    // Read data from the Form (Make sure these array indices match your column order)
    // Note: Column A = 0, Column B = 1, Column C = 2, etc.
    
    var tanggal = Utilities.formatDate(timestamp, "GMT+7", "dd/MM/yyyy HH:mm");
    var keterangan = rowData[2]; 
    var status = rowData[3];   
    var bank_account = rowData[4];  
    var nominal = rowData[5];  
    
    // Format numbers to standard Indonesian Rupiah
    var formatUang = "Rp " + nominal.toLocaleString("id-ID");
    
    // Construct the message text template (Discord uses ** for bold text)
    var message = "--------------------------------------------------------\n" + 
                  "🔔 **New Financial Record**\n\n" +
                  "📅 Time: " + tanggal + "\n" +
                  "🗂 Description: " + keterangan + "\n" +
                  "↕️ Status: **" + status + "**\n" +
                  "💰 Amount: **" + formatUang + "**\n" +
                  "📝 Bank Account: " + bank_account + "\n" +
                  "--------------------------------------------------------";
                  
    // Wrap the message into the JSON format required by Discord
    var payload = {
      "content": message
    };
    
    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true // Server safety
    };
    
    // Execution block for sending to Discord with Retry Loop
    var response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, options);
    var responseCode = response.getResponseCode();
    var attempts = 0;
    var maxAttempts = 5; // Max attempts to prevent long script timeouts

    while (responseCode === 429 && attempts < maxAttempts) {
      attempts++;
      var responseText = response.getContentText();
      var sleepTime = 2000; // Default 2-second delay if JSON parsing fails
      
      try {
        var responseJson = JSON.parse(responseText);
        if (responseJson.retry_after) {
          // Discord sends retry_after value in seconds (can be decimal)
          // Converted to milliseconds + 500ms extra buffer for safety
          sleepTime = Math.ceil(responseJson.retry_after * 1000) + 500;
        }
      } catch (err) {
        // If the response is not JSON, use exponential backoff strategy
        sleepTime = Math.pow(2, attempts) * 1000;
      }
      
      Logger.log("Discord Rate Limit detected (429). Sleeping for " + sleepTime + " ms before retrying (Attempt " + attempts + "/" + maxAttempts + ")...");
      Utilities.sleep(sleepTime);
      
      // Retry the request after sleeping
      response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, options);
      responseCode = response.getResponseCode();
    }
    
    if (responseCode >= 200 && responseCode < 300) {
      Logger.log("Discord notification sent successfully.");
    } else {
      Logger.log("Failed to send notification after " + maxAttempts + " attempts. HTTP Code: " + responseCode);
    }
    // ---------------------------------
    
  } catch(error) {
    Logger.log("An error occurred: " + error.toString());
  }
}


