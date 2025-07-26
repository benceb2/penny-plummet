<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import AchievementCard from '@/components/AchievementCard.vue';
import { useUserStore } from '@/stores/userStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { formatIntAsCurrency, formatXP } from '@/utils/numberFormatUtil';

const { t } = useI18n();
const userStore = useUserStore();
const achievementStore = useAchievementStore();

const welcomeTitle = computed(() => {
  return userStore.username
    ? t('home.welcomeBack', { username: userStore.username })
    : t('home.welcome');
});

// Get the 3 closest achievements to completion that aren't already completed
const nearestAchievements = computed(() => {
  return achievementStore.achievements
    .filter(a => !a.completed)
    .sort((a, b) => (b.progress / b.requirement) - (a.progress / a.requirement))
    .slice(0, 3);
});
</script>

<template>
  <BaseLayout
    :title="welcomeTitle"
    :fontawesome-icon="'fa fa-home'">

    <!-- Quick Stats Overview -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="d-flex align-items-center">
              <i class="bi bi-wallet2 fs-3 text-primary me-2"></i>
              <div>
                <h6 class="mb-0">{{ t('home.stats.currentBalance') }}</h6>
                <h4 class="mb-0">{{ userStore.formattedChips }}</h4>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="d-flex align-items-center">
              <i class="bi bi-trophy fs-3 text-warning me-2"></i>
              <div>
                <h6 class="mb-0">{{ t('home.stats.biggestWin') }}</h6>
                <h4 class="mb-0">{{ formatIntAsCurrency(userStore.stats.biggestWin) }}</h4>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="d-flex align-items-center">
              <i class="bi bi-stars fs-3 text-info me-2"></i>
              <div>
                <h6 class="mb-0">{{ t('home.stats.level') }}</h6>
                <h4 class="mb-0">{{ achievementStore.currentLevel.level }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Selection Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-suit-spade-fill fs-2 text-primary me-3"></i>
              <div>
                <h4 class="mb-1">{{ t('home.games.blackjack.title') }}</h4>
                <p class="text-muted mb-0">{{ t('home.games.blackjack.shortDesc') }}</p>
              </div>
            </div>
            <p class="text-muted">{{ t('home.games.blackjack.longDesc') }}</p>
            <RouterLink to="/blackjack" class="btn btn-primary mt-auto">
              <i class="bi bi-play-circle-fill me-2"></i>{{ t('home.games.blackjack.playButton') }}
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-mouse fs-2 text-success me-3"></i>
              <div>
                <h4 class="mb-1">{{ t('home.games.clicker.title') }}</h4>
                <p class="text-muted mb-0">{{ t('home.games.clicker.shortDesc') }}</p>
              </div>
            </div>
            <p class="text-muted">{{ t('home.games.clicker.longDesc') }}</p>
            <RouterLink to="/clicker" class="btn btn-success mt-auto">
              <i class="bi bi-play-circle-fill me-2"></i>{{ t('home.games.clicker.playButton') }}
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-bullseye fs-2 text-danger me-3"></i>
              <div>
                <h4 class="mb-1">{{ t('home.games.roulette.title') }}</h4>
                <p class="text-muted mb-0">{{ t('home.games.roulette.shortDesc') }}</p>
              </div>
            </div>
            <p class="text-muted">{{ t('home.games.roulette.longDesc') }}</p>
            <RouterLink to="/roulette" class="btn btn-danger mt-auto">
              <i class="bi bi-play-circle-fill me-2"></i>{{ t('home.games.roulette.playButton') }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Level Progress -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <i class="bi bi-graph-up-arrow text-success me-2"></i>
          {{ t('home.levelProgress.title') }}
        </h5>
        <div class="progress mb-2">
          <div
            class="progress-bar bg-success"
            role="progressbar"
            :style="{ width: `${achievementStore.levelProgress}%` }"
            :aria-valuenow="achievementStore.levelProgress"
            aria-valuemin="0"
            aria-valuemax="100">
          </div>
        </div>
        <small class="text-muted">
          {{ t('home.levelProgress.xpProgress', {
            current: formatXP(achievementStore.currentLevel.currentXP),
            required: formatXP(achievementStore.currentLevel.requiredXP)
          }) }}
        </small>
      </div>
    </div>

    <!-- Achievements In Progress -->
    <div class="card">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center mb-3">
          <i class="bi bi-award text-primary me-2"></i>
          {{ t('home.achievements.title') }}
        </h5>
        <div class="achievements-list">
          <AchievementCard
            v-for="achievement in nearestAchievements"
            :key="achievement.id"
            :achievement="achievement"
            class="mb-3" />
          <!-- View All Achievements -->
          <div class="d-flex justify-content-end">
            <RouterLink
              to="/profile#achievements"
              class="btn btn-outline-primary">
              <i class="bi bi-arrow-right me-2"></i>
              {{ t('home.achievements.viewAll') }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

  </BaseLayout>
</template>
