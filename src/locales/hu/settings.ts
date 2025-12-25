export default {
  "settings": {
    "title": "Beállítások",
    "localSave": {
      "title": "Helyi Mentés Kezelés",
      "export": {
        "title": "Mentés Exportálása",
        "description": "Töltsd le a jelenlegi játékállapotot egy fájlba. Ezt a fájlt használhatod a haladásod visszaállítására később vagy egy másik eszközön.",
        "button": "Mentés Fájl Exportálása"
      },
      "import": {
        "title": "Mentés Importálása",
        "description": "Állítsd vissza a haladásodat egy korábban exportált mentés fájlból. Ez helyettesíti a jelenlegi haladásodat.",
        "noFileSelected": "Nincs fájl kiválasztva",
        "readError": "Nem sikerült olvasni a mentés fájlt",
        "importSuccess": "Mentés sikeresen importálva",
        "importFailed": "Nem sikerült importálni a mentés fájlt",
        "confirmTitle": "Importálás Megerősítése",
        "confirmMessage": "Biztosan importálni szeretnéd ezt a mentés fájlt? Ez helyettesíti a jelenlegi haladásodat.",
        "cancel": "Mégse",
        "confirm": "Importálás",
        "preview": {
          "title": "Mentés Fájl Előnézet",
          "username": "Felhasználónév",
          "balance": "Egyenleg",
          "level": "Szint",
          "saveDate": "Mentés Dátuma",
          "notSet": "Nincs beállítva"
        }
      },
      "delete": {
        "title": "Mentés Törlése",
        "description": "Töröld az összes haladásodat és kezdj újra. Ez a művelet nem vonható vissza, kivéve ha exportáltad a mentésedet.",
        "button": "Mentés Adatok Törlése",
        "confirmTitle": "Törlés Megerősítése",
        "warning": "Figyelem: Ez véglegesen törli az összes haladásodat!",
        "confirmMessage": "Biztosan törölni szeretnéd a mentés adatokat és újrakezdeni?",
        "cancel": "Mégse",
        "confirm": "Törlés"
      }
    },
    "balanceAudit": {
      "title": "Egyenleg Audit",
      "description": "Egyenleg újraszámítása a tranzakciók alapján (feltételezett kezdő egyenleg: {amount}).",
      "run": "Egyenleg Audit Futtatása",
      "running": "Audit fut...",
      "match": "Az egyenleg egyezik a tranzakciókkal.",
      "mismatch": "Az egyenleg nem egyezik a tranzakciókkal.",
      "expected": "Várt Egyenleg",
      "actual": "Tényleges Egyenleg",
      "delta": "Eltérés",
      "transactionCount": "Tranzakciók",
      "error": "Nem sikerült az egyenleg auditja"
    },
    "messages": {
      "operationSuccess": "Művelet sikeresen befejezve!",
      "genericError": "Hiba történt a művelet során"
    }
  }
}
