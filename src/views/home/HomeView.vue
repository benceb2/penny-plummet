<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import AchievementCard from '@/components/AchievementCard.vue';
import TransactionItem from '@/components/TransactionItem.vue';

import { useAchievementStore } from '@/stores/achievementStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { sortAchievementsByPriority } from '@/utils/achievementUitl';

const { t } = useI18n();
const achievementStore = useAchievementStore();
const transactionStore = useTransactionStore();

const nearestAchievements = computed(() => {
  return sortAchievementsByPriority(
    achievementStore.achievements.filter(a => {
      // Show in-progress achievements
      if (!a.completed) return true;
      // Show completed but unclaimed achievements
      if (a.completed && !a.claimed) return true;
      // Hide completed and claimed achievements
      return false;
    })
  ).slice(0, 3);
});

const recentTransactions = computed(() => {
  if (transactionStore.latestTransactions.length === 0) return [];

  return transactionStore.latestTransactions.slice(0, 6);
});
</script>

<template>
  <BaseLayout :title="t('home.welcome')">

    <!-- Game Selection Cards -->
    <div class="row g-3 mb-3">
      <div class="col-6 col-md-4">
        <div class="card h-100 shadow-sm home-game-card">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-suit-spade-fill fs-2 text-primary me-3" aria-hidden="true"></i>
              <div>
                <h2 class="mb-1 section-title">{{ t('home.games.blackjack.title') }}</h2>
                <p class="text-muted mb-0">{{ t('home.games.blackjack.shortDesc') }}</p>
              </div>
            </div>
            <RouterLink to="/blackjack" class="btn btn-primary mt-auto">
              <i class="bi bi-play-circle-fill me-2" aria-hidden="true"></i>{{ t('home.games.blackjack.playButton') }}
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-4">
        <div class="card h-100 shadow-sm home-game-card">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-mouse fs-2 text-success me-3" aria-hidden="true"></i>
              <div>
                <h2 class="mb-1 section-title">{{ t('home.games.clicker.title') }}</h2>
                <p class="text-muted mb-0">{{ t('home.games.clicker.shortDesc') }}</p>
              </div>
            </div>
            <RouterLink to="/clicker" class="btn btn-success mt-auto">
              <i class="bi bi-play-circle-fill me-2" aria-hidden="true"></i>{{ t('home.games.clicker.playButton') }}
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-4">
        <div class="card h-100 shadow-sm home-game-card">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-bullseye fs-2 text-danger me-3" aria-hidden="true"></i>
              <div>
                <h2 class="mb-1 section-title">{{ t('home.games.roulette.title') }}</h2>
                <p class="text-muted mb-0">{{ t('home.games.roulette.shortDesc') }}</p>
              </div>
            </div>
            <RouterLink to="/roulette" class="btn btn-danger mt-auto">
              <i class="bi bi-play-circle-fill me-2" aria-hidden="true"></i>{{ t('home.games.roulette.playButton') }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div class="row home-secondary d-none d-md-flex">
      <div class="col-md-6 mb-4 mb-md-0">
        <div class="card h-100">
          <div class="card-header">
            <h2 class="card-title d-flex align-items-center mb-0 section-title">
              <i class="bi bi-award text-primary me-2" aria-hidden="true"></i>
              {{ t('home.achievements.title') }}
            </h2>
          </div>
          <div class="card-body p-2">
            <div class="achievements-list">
              <AchievementCard
                v-for="achievement in nearestAchievements"
                :key="achievement.id"
                :achievement="achievement"
                class="mb-2" />
            </div>
          </div>
          <div class="card-footer bg-transparent">
            <div class="d-flex justify-content-end">
              <RouterLink
                to="/achievements"
                class="btn btn-outline-primary">
                <i class="fa fa-trophy me-2" aria-hidden="true"></i>
                {{ t('home.achievements.viewAll') }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header">
            <h2 class="card-title d-flex align-items-center mb-0 section-title">
              <i class="bi bi-wallet2 text-success me-2" aria-hidden="true"></i>
              {{ t('home.transactions.title') }}
            </h2>
          </div>
          <div class="card-body p-0 mt-1">
            <div v-if="recentTransactions.length > 0">
              <TransactionItem
                v-for="transaction in recentTransactions"
                :key="transaction.id"
                :transaction="transaction"
                :compact="true"
                :show-details="true" />
            </div>
            <div v-else class="d-flex flex-column justify-content-center align-items-center h-100 text-center">
              <i class="bi bi-emoji-smile-upside-down fs-1 text-muted mb-3" aria-hidden="true"></i>
              <p class="text-muted mb-0">
                {{ t('home.transactions.empty') }}
              </p>
            </div>
          </div>
          <div class="card-footer bg-transparent">
            <div class="d-flex justify-content-end">
              <RouterLink
                to="/transactions"
                class="btn btn-outline-success">
                <i class="fa fa-money-bill-wave me-2" aria-hidden="true"></i>
                {{ t('home.transactions.viewAll') }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row d-md-none g-2">
      <div class="col-6">
        <RouterLink to="/achievements" class="btn btn-outline-primary w-100">
          <i class="fa fa-trophy me-2" aria-hidden="true"></i>
          {{ t('home.achievements.viewAll') }}
        </RouterLink>
      </div>
      <div class="col-6">
        <RouterLink to="/transactions" class="btn btn-outline-success w-100">
          <i class="fa fa-money-bill-wave me-2" aria-hidden="true"></i>
          {{ t('home.transactions.viewAll') }}
        </RouterLink>
      </div>
    </div>

  </BaseLayout>
</template>

<style scoped>
@media (max-width: 767px) {
  .home-game-card .card-body {
    padding: 0.75rem;
  }

  .home-game-card .section-title {
    font-size: 0.95rem;
  }

  .home-game-card .text-muted {
    font-size: 0.8rem;
  }
}
</style>
