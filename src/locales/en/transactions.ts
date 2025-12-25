export default {
  "transactions": {
    "title": "Transaction History",
    "stats": {
      "netAmount": "Net Amount",
      "wins": "Wins",
      "losses": "Losses",
      "pushes": "Pushes"
    },
    "filters": {
      "game": {
        "all": "All",
        "blackjack": "Blackjack",
        "roulette": "Roulette",
        "clicker": "Clicker",
        "general": "General"
      },
      "type": {
        "all": "All",
        "win": "Win",
        "loss": "Loss",
        "push": "Push"
      }
    },
    "badges": {
      "type": {
        "win": "Win",
        "loss": "Loss",
        "push": "Push",
        "income": "Income",
        "purchase": "Purchase"
      },
      "game": {
        "blackjack": "Blackjack",
        "roulette": "Roulette",
        "clicker": "Clicker",
        "general": "General"
      }
    },
    "details": {
      "general": {
        "levelUp": "Level {level} reward (+{amount})",
        "achievementReward": "Achievement reward: {title} (+{amount})"
      },
      "blackjack": {
        "win": "Won {amount} with {playerScore} versus the dealer's {dealerScore}",
        "push": "Push - bet returned",
        "loss": "Lost {amount} with {playerScore} versus the dealer's {dealerScore}"
      },
      "clicker": {
        "collect": "Collected {amount} chips from clicking",
        "autoClicker": "Purchased Auto-Clicker (Level {level})",
        "multiplier": "Purchased Multiplier (Level {level})",
        "critical": "Purchased Critical Hit Upgrade (Level {level})",
        "speed": "Purchased Auto-Clicker Speed (Level {level})",
        "offlineEarnings": "Offline earnings collected ({timeAway} away)"
      },
      "roulette": {
        "win": "Won {amount} on number {number}",
        "push": "Broke even on number {number}",
        "loss": "Lost {amount} on number {number}"
      }
    },
    "loading": "Loading transactions...",
    "empty": "No transactions to display",
    "pagination": {
      "summary": "Showing {from} to {to} of {total} transactions"
    }
  }
}
