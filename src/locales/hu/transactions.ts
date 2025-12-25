export default {
  "transactions": {
    "title": "Tranzakció Előzmények",
    "stats": {
      "netAmount": "Nettó összeg",
      "wins": "Nyerések",
      "losses": "Veszteségek",
      "pushes": "Döntetlenek"
    },
    "filters": {
      "game": {
        "all": "Összes",
        "blackjack": "Blackjack",
        "roulette": "Rulett",
        "clicker": "Kattintós",
        "general": "Általános"
      },
      "type": {
        "all": "Összes",
        "win": "Nyerés",
        "loss": "Veszteség",
        "push": "Döntetlen"
      }
    },
    "badges": {
      "type": {
        "win": "Nyerés",
        "loss": "Veszteség",
        "push": "Döntetlen",
        "income": "Bevétel",
        "purchase": "Vásárlás"
      },
      "game": {
        "blackjack": "Blackjack",
        "roulette": "Rulett",
        "clicker": "Kattintós",
        "general": "Általános"
      }
    },
    "details": {
      "general": {
        "levelUp": "{level}. szint jutalma (+{amount})",
        "achievementReward": "Eredmény jutalom: {title} (+{amount})"
      },
      "blackjack": {
        "win": "Nyeremény {amount}, {playerScore} a krupié {dealerScore} ellen",
        "push": "Döntetlen - tét visszatérítve",
        "loss": "Vesztettél {amount}, {playerScore} a krupié {dealerScore} ellen"
      },
      "clicker": {
        "collect": "{amount} zseton begyűjtve kattintásból",
        "autoClicker": "Auto-kattintó vásárlás (Szint {level})",
        "multiplier": "Szorzó vásárlás (Szint {level})",
        "critical": "Kritikus fejlesztés vásárlás (Szint {level})",
        "speed": "Auto-kattintás sebesség vásárlás (Szint {level})",
        "offlineEarnings": "Offline bevétel begyűjtve ({timeAway} távollét)"
      },
      "roulette": {
        "win": "Nyeremény {amount} a {number} számon",
        "push": "Döntetlen a {number} számon",
        "loss": "Vesztettél {amount} a {number} számon"
      }
    },
    "loading": "Tranzakciók betöltése...",
    "empty": "Nincsenek megjeleníthető tranzakciók",
    "pagination": {
      "summary": "{from}–{to} / {total} tranzakció"
    }
  }
}
