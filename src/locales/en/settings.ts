export default {
  "settings": {
    "title": "Settings",
    "localSave": {
      "title": "Local Save Management",
      "export": {
        "title": "Export Save",
        "description": "Download your current game progress to a file. You can use this file to restore your progress later or on another device.",
        "button": "Export Save File"
      },
      "import": {
        "title": "Import Save",
        "description": "Restore your progress from a previously exported save file. This will replace your current progress.",
        "noFileSelected": "No file selected",
        "readError": "Failed to read save file",
        "importSuccess": "Save imported successfully",
        "importFailed": "Failed to import save file",
        "confirmTitle": "Confirm Import",
        "confirmMessage": "Are you sure you want to import this save file? This will replace your current progress.",
        "cancel": "Cancel",
        "confirm": "Import",
        "preview": {
          "title": "Save File Preview",
          "username": "Username",
          "balance": "Balance",
          "level": "Level",
          "saveDate": "Save Date",
          "notSet": "Not set"
        }
      },
      "delete": {
        "title": "Delete Save",
        "description": "Delete all your progress and start fresh. This action cannot be undone unless you have exported your save.",
        "button": "Delete Save Data",
        "confirmTitle": "Confirm Delete",
        "warning": "Warning: This will permanently delete all your progress!",
        "confirmMessage": "Are you sure you want to delete your save data and start fresh?",
        "cancel": "Cancel",
        "confirm": "Delete"
      }
    },
    "balanceAudit": {
      "title": "Balance Audit",
      "description": "Recalculate balance from your transaction history (includes the opening balance transaction).",
      "run": "Run Balance Audit",
      "running": "Auditing...",
      "recalculate": "Recalculate Balance",
      "recalculating": "Recalculating...",
      "recalculateSuccess": "Balance updated from transaction history.",
      "match": "Balance matches transaction history.",
      "mismatch": "Balance does not match transaction history.",
      "expected": "Expected Balance",
      "actual": "Actual Balance",
      "delta": "Difference",
      "transactionCount": "Transactions",
      "error": "Failed to audit balance"
    },
    "messages": {
      "operationSuccess": "Operation completed successfully!",
      "genericError": "An error occurred during the operation"
    }
  }
}
