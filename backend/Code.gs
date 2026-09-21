/**
 * Cetro Backup Portal - Google Apps Script Backend
 * 
 * Setup Instructions:
 * 1. Run setup() manually from the Apps Script editor to initialize folders and sheet.
 * 2. Deploy as Web App -> Execute as: Me -> Access: Anyone.
 * 3. Copy the Web App URL and set as NEXT_PUBLIC_APPS_SCRIPT_URL in Next.js .env
 */

function setup() {
  const rootFolderName = "Cetrofarm Backup";
  const sheetName = "Cetrofarm Backup Log";
  
  let props = PropertiesService.getScriptProperties();
  
  // 1. Create Folders
  let rootFolder;
  let folders = DriveApp.getFoldersByName(rootFolderName);
  if (folders.hasNext()) {
    rootFolder = folders.next();
    Logger.log("Root folder already exists.");
  } else {
    rootFolder = DriveApp.createFolder(rootFolderName);
    Logger.log("Root folder created.");
  }
  
  props.setProperty("ROOT_FOLDER_ID", rootFolder.getId());
  
  // Create default subfolders
  const depts = ["Keuangan", "Marketing", "Operasional", "_Arsip"];
  depts.forEach(dept => {
    let sub = rootFolder.getFoldersByName(dept);
    if (!sub.hasNext()) {
      rootFolder.createFolder(dept);
    }
  });

  // 2. Create Spreadsheet
  let files = DriveApp.getFilesByName(sheetName);
  let ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
    Logger.log("Spreadsheet already exists.");
  } else {
    ss = SpreadsheetApp.create(sheetName);
    let ssFile = DriveApp.getFileById(ss.getId());
    ssFile.moveTo(rootFolder);
    
    // Setup sheets
    let logSheet = ss.getActiveSheet();
    logSheet.setName("Log");
    logSheet.appendRow([
      "Timestamp", 
      "Nama Karyawan", 
      "Departemen", 
      "Kategori", 
      "Nama File", 
      "Ukuran File (KB)", 
      "Status", 
      "Link Drive",
      "Keterangan Error",
      "File ID" // Hidden column for easy soft delete mapping
    ]);
    logSheet.getRange("A1:J1").setFontWeight("bold");
    Logger.log("Spreadsheet created.");
  }
  
  props.setProperty("SPREADSHEET_ID", ss.getId());

  // 3. Set Dummy Tokens
  if (!props.getProperty("TOKEN_KEUANGAN")) props.setProperty("TOKEN_KEUANGAN", "KEUANGAN-12345");
  if (!props.getProperty("TOKEN_MARKETING")) props.setProperty("TOKEN_MARKETING", "MARKETING-12345");
  if (!props.getProperty("TOKEN_OPERASIONAL")) props.setProperty("TOKEN_OPERASIONAL", "OPERASIONAL-12345");
  if (!props.getProperty("ADMIN_EMAIL")) props.setProperty("ADMIN_EMAIL", Session.getActiveUser().getEmail());

  Logger.log("Setup complete. Please check Script Properties for tokens.");
}

function handleOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "Empty payload" });
    }
    
    let payload = JSON.parse(e.postData.contents);
    let { action, token, departemen } = payload;
    
    // Validasi token
    let props = PropertiesService.getScriptProperties();
    let validToken = props.getProperty(`TOKEN_${departemen.toUpperCase()}`);
    if (!validToken || validToken !== token) {
      return jsonResponse({ success: false, error: "Token tidak valid" });
    }

    if (action === "upload") {
      return handleUpload(payload, props);
    } else if (action === "soft_delete") {
      return handleSoftDelete(payload, props);
    } else {
      return jsonResponse({ success: false, error: "Action not recognized" });
    }
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function handleUpload(payload, props) {
  let { departemen, kategori, namaKaryawan, namaDokumen, fileName, mimeType, fileBase64, sizeDisplay, sizeKb } = payload;
  
  // Validasi kategori sesuai departemen (opsional, server-side defense)
  // Misal Marketing kategori "Event", Keuangan "Faktur", dsb. 
  // Jika tidak ada rule baku, cukup biarkan kategori dikontrol frontend, tapi minimal harus ada.
  if (!kategori) kategori = "Lainnya";

  // Validasi ekstensi
  let allowedExts = ['pdf', 'docx', 'xlsx', 'csv', 'jpg', 'png'];
  let ext = fileName.split('.').pop().toLowerCase();
  if (!allowedExts.includes(ext)) {
     logUpload(props, namaKaryawan, departemen, kategori, fileName, sizeKb, "Gagal", "", "Ekstensi tidak diizinkan");
     return jsonResponse({ success: false, error: "Extension not allowed" });
  }
  
  // Decode & Size Check (> 25MB)
  let decodedFile = Utilities.base64Decode(fileBase64);
  let sizeInMb = decodedFile.length / (1024 * 1024);
  if (sizeInMb > 25) {
     logUpload(props, namaKaryawan, departemen, kategori, fileName, sizeKb, "Gagal", "", "Ukuran file melebihi 25MB");
     return jsonResponse({ success: false, error: "File too large (> 25MB)" });
  }

  try {
    let blob = Utilities.newBlob(decodedFile, mimeType, fileName);
    let dateStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd");
    let baseFileName = `${kategori}_${namaDokumen}_${dateStr}`;
    
    let rootFolderId = props.getProperty("ROOT_FOLDER_ID");
    if (!rootFolderId) throw new Error("ROOT_FOLDER_ID not found in properties. Please run setup().");
    let rootFolder = DriveApp.getFolderById(rootFolderId);

    // Get Dept Folder
    let deptFolder = getOrCreateSubfolder(rootFolder, departemen);
    
    // Get Year Folder
    let year = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy");
    let yearFolder = getOrCreateSubfolder(deptFolder, year);
    
    // Get Kategori/Month Folder
    let subFolderName = kategori; // For Marketing
    if (departemen === "Keuangan" || departemen === "Operasional") {
      subFolderName = Utilities.formatDate(new Date(), "Asia/Jakarta", "MM");
    }
    let targetFolder = getOrCreateSubfolder(yearFolder, subFolderName);
    
    // Handling duplicate file names with _v2
    let finalFileName = baseFileName + "." + ext;
    let version = 1;
    let existingFiles = targetFolder.getFilesByName(finalFileName);
    while (existingFiles.hasNext()) {
      version++;
      finalFileName = `${baseFileName}_v${version}.${ext}`;
      existingFiles = targetFolder.getFilesByName(finalFileName);
    }
    
    blob.setName(finalFileName);
    let file = targetFolder.createFile(blob);
    let fileUrl = file.getUrl();
    let fileId = file.getId();

    // Log success
    logUpload(props, namaKaryawan, departemen, kategori, finalFileName, sizeKb, "Berhasil", fileUrl, "", fileId);

    return jsonResponse({ success: true, fileUrl: fileUrl, message: "File uploaded successfully" });
  } catch (error) {
    logUpload(props, namaKaryawan, departemen, kategori, fileName, sizeKb, "Gagal", "", error.toString());
    checkAndSendErrorAlert(props, departemen, error.toString());
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function handleSoftDelete(payload, props) {
  let { fileId, timestamp } = payload;
  
  if (!fileId) return jsonResponse({ success: false, error: "Missing fileId" });

  let rootFolderId = props.getProperty("ROOT_FOLDER_ID");
  let rootFolder = DriveApp.getFolderById(rootFolderId);
  let arsipFolder = getOrCreateSubfolder(rootFolder, "_Arsip");

  try {
    let file = DriveApp.getFileById(fileId);
    file.moveTo(arsipFolder);
    
    // Update status in Log sheet
    let ssId = props.getProperty("SPREADSHEET_ID");
    let ss = SpreadsheetApp.openById(ssId);
    let sheet = ss.getSheetByName("Log");
    let data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][9] === fileId) { // Column J is File ID
        sheet.getRange(i + 1, 7).setValue("Diarsipkan"); // Update status
        break;
      }
    }
    
    return jsonResponse({ success: true, message: "File diarsipkan" });
  } catch (e) {
    return jsonResponse({ success: false, error: "Failed to archive file: " + e.toString() });
  }
}

function doGet(e) {
  try {
    let departemen = e.parameter.departemen;
    let token = e.parameter.token;

    if (!departemen || !token) {
      return jsonResponse({ success: false, error: "Missing parameters" });
    }

    let props = PropertiesService.getScriptProperties();
    let validToken = props.getProperty(`TOKEN_${departemen.toUpperCase()}`);
    
    if (!validToken || validToken !== token) {
      return jsonResponse({ success: false, error: "Token tidak valid", data: [] });
    }

    let ssId = props.getProperty("SPREADSHEET_ID");
    if (!ssId) throw new Error("SPREADSHEET_ID not configured.");
    
    let ss = SpreadsheetApp.openById(ssId);
    let sheet = ss.getSheetByName("Log");
    let data = sheet.getDataRange().getValues();
    
    let headers = data[0];
    let rows = data.slice(1);
    
    let filtered = rows.filter(row => row[2] === departemen);
    filtered.sort((a, b) => new Date(b[0]) - new Date(a[0]));
    
    let totalSizeKb = 0;
    filtered.forEach(row => {
       let size = parseFloat(row[5]);
       if (!isNaN(size) && row[6] === "Berhasil") totalSizeKb += size;
    });
    
    // Limit to 100 for display
    let resultRows = filtered.slice(0, 100).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        if (header === "Timestamp" && row[index] instanceof Date) {
          obj[header] = Utilities.formatDate(row[index], "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
        } else {
          obj[header] = row[index];
        }
      });
      return obj;
    });

    return jsonResponse({ 
      success: true, 
      data: resultRows,
      capacity: {
        totalSizeKb: totalSizeKb,
        totalSizeMb: (totalSizeKb / 1024).toFixed(2)
      }
    });

  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function getOrCreateSubfolder(parent, folderName) {
  let folders = parent.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(folderName);
}

function logUpload(props, namaKaryawan, departemen, kategori, namaFile, ukuranFile, status, linkDrive, errorMsg, fileId = "") {
  try {
    let ssId = props.getProperty("SPREADSHEET_ID");
    if (!ssId) return;
    let ss = SpreadsheetApp.openById(ssId);
    let sheet = ss.getSheetByName("Log");
    
    let timestamp = new Date();
    sheet.appendRow([
      timestamp,
      namaKaryawan,
      departemen,
      kategori,
      namaFile,
      ukuranFile || 0,
      status,
      linkDrive || "",
      errorMsg || "",
      fileId
    ]);
  } catch (e) {
    Logger.log("Failed to log: " + e.toString());
  }
}

function checkAndSendErrorAlert(props, departemen, errorMsg) {
  let cache = CacheService.getScriptCache();
  let failKey = "FAILS_" + departemen;
  let fails = cache.get(failKey);
  fails = fails ? parseInt(fails) + 1 : 1;
  cache.put(failKey, fails.toString(), 3600); // cache for 1 hour
  
  if (fails >= 3) {
    let adminEmail = props.getProperty("ADMIN_EMAIL");
    if (adminEmail) {
      MailApp.sendEmail({
        to: adminEmail,
        subject: "[Cetro Backup Portal] Alert: Multiple Upload Failures",
        body: `Department: ${departemen}\nFailures in last hour: ${fails}\nLatest Error: ${errorMsg}`
      });
    }
    // reset after alert to prevent spamming
    cache.remove(failKey);
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
