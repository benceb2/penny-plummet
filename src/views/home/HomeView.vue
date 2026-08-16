<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TransactionItem from '@/components/TransactionItem.vue';

import { useUserStore } from '@/stores/userStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useClickerStore } from '@/stores/clickerStore';
import { useRouletteStore } from '@/stores/rouletteStore';
import { sortAchievementsByPriority } from '@/utils/achievementUitl';
import { formatNumber } from '@/utils/numberFormatUtil';

const { t } = useI18n();
const userStore = useUserStore();
const achievementStore = useAchievementStore();
const transactionStore = useTransactionStore();
const clickerStore = useClickerStore();
const rouletteStore = useRouletteStore();

const greeting = computed(() => {
  return userStore.username
    ? t('home.welcomeBack', { username: userStore.username })
    : t('home.welcome');
});

const blackjackHandsPlayed = computed(() => formatNumber(userStore.stats.handsPlayed, { decimals: 0 }));
const rouletteSpinsPlayed = computed(() => formatNumber(rouletteStore.sessionStats.spins, { decimals: 0 }));

const nearestAchievement = computed(() => {
  return sortAchievementsByPriority(
    achievementStore.achievements.filter(a => !a.completed || !a.claimed)
  )[0] ?? null;
});

const nearestAchievementProgress = computed(() => {
  const achievement = nearestAchievement.value;
  if (!achievement) return 0;
  if (achievement.completed) return 100;
  if (achievement.requirement <= 0) return 0;
  return Math.min(Math.round((achievement.progress / achievement.requirement) * 100), 100);
});

const recentTransactions = computed(() => transactionStore.latestTransactions.slice(0, 3));
</script>

<template>
  <div class="container lobby-view py-2 py-lg-4">
    <h1 class="visually-hidden">{{ t('home.welcome') }}</h1>

    <p class="lobby-greeting">{{ greeting }}</p>

    <div class="row g-2 g-md-3 mb-3">
      <div class="col-12 col-md-4">
        <RouterLink to="/blackjack" class="game-tile">
          <span class="game-tile-icon-wrap">
            <i class="bi bi-suit-spade-fill game-tile-icon" aria-hidden="true"></i>
          </span>
          <span class="game-tile-body">
            <span class="game-tile-name">{{ t('home.games.blackjack.title') }}</span>
            <span class="game-tile-desc">{{ t('home.games.blackjack.shortDesc') }}</span>
            <span class="game-tile-stat">{{ t('home.games.blackjack.stat', { count: blackjackHandsPlayed }) }}</span>
          </span>
        </RouterLink>
      </div>

      <div class="col-12 col-md-4">
        <RouterLink to="/roulette" class="game-tile">
          <span class="game-tile-icon-wrap">
            <i class="bi bi-dice-5-fill game-tile-icon" aria-hidden="true"></i>
          </span>
          <span class="game-tile-body">
            <span class="game-tile-name">{{ t('home.games.roulette.title') }}</span>
            <span class="game-tile-desc">{{ t('home.games.roulette.shortDesc') }}</span>
            <span class="game-tile-stat">{{ t('home.games.roulette.stat', { count: rouletteSpinsPlayed }) }}</span>
          </span>
        </RouterLink>
      </div>

      <div class="col-12 col-md-4">
        <RouterLink to="/clicker" class="game-tile">
          <span class="game-tile-icon-wrap">
            <i class="bi bi-lightning-charge-fill game-tile-icon" aria-hidden="true"></i>
          </span>
          <span class="game-tile-body">
            <span class="game-tile-name">{{ t('home.games.clicker.title') }}</span>
            <span class="game-tile-desc">{{ t('home.games.clicker.shortDesc') }}</span>
            <span class="game-tile-stat">
              {{ t('home.games.clicker.stat', { value: `${clickerStore.formattedIncome}${t('clicker.stats.perSecondSuffix')}` }) }}
            </span>
          </span>
        </RouterLink>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-12 col-lg-6">
        <section class="lobby-section" aria-labelledby="lobby-up-next-heading">
          <div class="lobby-section-header">
            <h2 id="lobby-up-next-heading" class="section-title mb-0">{{ t('home.achievements.title') }}</h2>
            <RouterLink to="/achievements" class="lobby-section-link">
              {{ t('home.achievements.viewAll') }}
            </RouterLink>
          </div>

          <div v-if="nearestAchievement" class="lobby-achievement">
            <i class="bi bi-trophy-fill lobby-achievement-icon" aria-hidden="true"></i>
            <div class="lobby-achievement-body">
              <div class="lobby-achievement-title">
                {{ t(`achievements.${nearestAchievement.category}.${nearestAchievement.id}.title`) }}
              </div>
              <div class="progress lobby-achievement-progress" style="height: 6px;">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :style="{ width: `${nearestAchievementProgress}%` }"
                  :aria-valuenow="nearestAchievementProgress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-label="t(`achievements.${nearestAchievement.category}.${nearestAchievement.id}.title`)">
                </div>
              </div>
              <div class="lobby-achievement-meta">{{ nearestAchievement.progress }}/{{ nearestAchievement.requirement }}</div>
            </div>
          </div>
          <p v-else class="lobby-empty">{{ t('home.achievements.empty') }}</p>
        </section>
      </div>

      <div class="col-12 col-lg-6">
        <section class="lobby-section" aria-labelledby="lobby-recent-heading">
          <div class="lobby-section-header">
            <h2 id="lobby-recent-heading" class="section-title mb-0">{{ t('home.transactions.title') }}</h2>
            <RouterLink to="/transactions" class="lobby-section-link">
              {{ t('home.transactions.viewAll') }}
            </RouterLink>
          </div>

          <div v-if="recentTransactions.length > 0" class="lobby-transactions">
            <TransactionItem
              v-for="transaction in recentTransactions"
              :key="transaction.id"
              :transaction="transaction"
              :compact="true"
              :show-details="false" />
          </div>
          <p v-else class="lobby-empty">{{ t('home.transactions.empty') }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lobby-greeting {
  font-family: var(--pp-font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--pp-cream);
  margin-bottom: 1rem;
}

.game-tile {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .85rem;
  min-height: 92px;
  height: 100%;
  padding: .75rem 1rem;
  border-radius: var(--pp-radius);
  background:
    radial-gradient(140% 120% at 12% -20%, rgba(225, 178, 90, .12), transparent 60%),
    var(--pp-surface);
  border: 1px solid var(--pp-line);
  color: var(--pp-cream);
  text-decoration: none;
}

.game-tile:focus-visible {
  outline: 2px solid var(--pp-gold);
  outline-offset: 2px;
}

@media (hover: hover) {
  .game-tile:hover {
    border-color: rgba(225, 178, 90, .4);
    color: var(--pp-cream);
  }
}

.game-tile-icon-wrap {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(225, 178, 90, .2), rgba(225, 178, 90, .05));
  border: 1px solid var(--pp-line);
}

.game-tile-body {
  display: flex;
  flex-direction: column;
  gap: .15rem;
  min-width: 0;
}

.game-tile-icon {
  font-size: 1.15rem;
  color: var(--pp-gold);
}

.game-tile-name {
  font-family: var(--pp-font-display);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.game-tile-desc {
  color: var(--pp-cream-dim);
  font-size: .85rem;
}

.game-tile-stat {
  margin-top: .1rem;
  color: var(--pp-gold);
  font-size: .75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

@media (min-width: 768px) {
  .game-tile {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: .2rem;
    min-height: 120px;
    padding: 1rem 1.25rem;
  }

  .game-tile-icon-wrap {
    width: auto;
    height: auto;
    border-radius: 0;
    background: none;
    border: 0;
    margin-bottom: .25rem;
  }

  .game-tile-icon {
    font-size: 1.6rem;
  }

  .game-tile-stat {
    margin-top: .25rem;
  }
}

.lobby-section {
  height: 100%;
  padding: 1rem 1.1rem;
  border-radius: var(--pp-radius);
  background: var(--pp-surface);
  border: 1px solid var(--pp-line);
}

.lobby-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  margin-bottom: .75rem;
}

.lobby-section-link {
  color: var(--pp-gold-bright);
  font-size: .85rem;
  font-weight: 600;
  text-decoration: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.lobby-empty {
  color: var(--pp-cream-dim);
  font-size: .875rem;
  margin: 0;
}

.lobby-achievement {
  display: flex;
  align-items: flex-start;
  gap: .75rem;
}

.lobby-achievement-icon {
  color: var(--pp-gold);
  font-size: 1.25rem;
  margin-top: .15rem;
  flex: 0 0 auto;
}

.lobby-achievement-body {
  flex: 1 1 auto;
  min-width: 0;
}

.lobby-achievement-title {
  color: var(--pp-cream);
  font-weight: 600;
  font-size: .9rem;
  margin-bottom: .4rem;
}

.lobby-achievement-progress {
  margin-bottom: .3rem;
}

.lobby-achievement-meta {
  color: var(--pp-cream-dim);
  font-size: .75rem;
  font-variant-numeric: tabular-nums;
}

.lobby-transactions :deep(.transaction-item:first-child) {
  padding-top: 0;
}
</style>
