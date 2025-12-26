<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';
import BaseLayout from '@/components/layout/BaseLayout.vue';

const userStore = useUserStore();
const achievementStore = useAchievementStore();
const { t } = useI18n();

const { currentLevel, levelProgress, achievements } = achievementStore;
const userStats = userStore.stats;

const achievementProgress = computed(() => {
  const totalAchievements = achievements.length;
  const completedAchievements = achievements.filter(a => a.completed).length;
  return {
    completed: completedAchievements,
    total: totalAchievements,
    percentage: Math.round((completedAchievements / totalAchievements) * 100)
  };
});
</script>

<template>
  <BaseLayout
    :title="t('profile.title')"
    bootstrapIcon="person-circle">

    <!-- Level Progress Section -->
    <div class="card mb-4">
      <div class="card-body">
        <h2 class="card-title section-title">
          <i class="bi bi-stars text-info me-2" aria-hidden="true"></i>
          {{ t('profile.level.title', { level: currentLevel.level }) }}
        </h2>
        <div class="progress mb-3">
          <div
            class="progress-bar"
            role="progressbar"
            :style="{ width: `${levelProgress}%` }"
            :aria-valuenow="levelProgress"
            aria-valuemin="0"
            aria-valuemax="100">
            {{ Math.floor(levelProgress) }}%
          </div>
        </div>
        <div class="d-flex justify-content-between text-muted">
          <small>{{ t('profile.level.currentXp', { xp: currentLevel.currentXP }) }}</small>
          <small>{{ t('profile.level.xpNeeded', { xp: currentLevel.requiredXP }) }}</small>
        </div>
        <div class="mt-3">
          <h3 class="subsection-title">{{ t('profile.level.rewardsTitle') }}:</h3>
          <ul class="list-unstyled">
            <li>{{ t('profile.level.rewardsChips') }}: {{ formatIntAsCurrency(currentLevel.rewards.chips) }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="card mb-4">
      <div class="card-body">
        <h2 class="card-title section-title">
          <i class="bi bi-graph-up-arrow text-primary me-2" aria-hidden="true"></i>
          {{ t('profile.stats.title') }}
        </h2>
        <div class="row">
          <div class="col-md-3">
            <div class="text-center p-4 rounded-3 hover-lift">
              <div class="mb-3">
                <i class="bi bi-joystick text-primary fs-1" aria-hidden="true"></i>
              </div>
              <h3 class="text-muted subsection-title">{{ t('profile.stats.handsPlayed') }}</h3>
              <p class="fs-4 fw-bold mb-0">{{ userStats.handsPlayed }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-4 rounded-3 hover-lift">
              <div class="mb-3">
                <i class="bi bi-coin text-success fs-1" aria-hidden="true"></i>
              </div>
              <h3 class="text-muted subsection-title">{{ t('profile.stats.totalWinnings') }}</h3>
              <p class="fs-4 fw-bold mb-0">{{ formatIntAsCurrency(userStats.totalWinnings) }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-4 rounded-3 hover-lift">
              <div class="mb-3">
                <i class="bi bi-trophy text-warning fs-1" aria-hidden="true"></i>
              </div>
              <h3 class="text-muted subsection-title">{{ t('profile.stats.biggestWin') }}</h3>
              <p class="fs-4 fw-bold mb-0">{{ formatIntAsCurrency(userStats.biggestWin) }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-4 rounded-3 hover-lift">
              <div class="mb-3">
                <i class="bi bi-award text-info fs-1" aria-hidden="true"></i>
              </div>
              <h3 class="text-muted subsection-title">{{ t('profile.stats.achievements') }}</h3>
              <p class="fs-4 fw-bold mb-0">{{ achievementProgress.percentage }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievements Summary -->
    <div class="card">
      <div class="card-body d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
        <div>
        <h2 class="card-title d-flex align-items-center mb-1 section-title">
          <i class="bi bi-award text-primary me-2" aria-hidden="true"></i>
          {{ t('profile.achievements.title') }}
        </h2>
        <p class="text-muted mb-0">
          {{ t('profile.achievements.completed', { completed: achievementProgress.completed, total: achievementProgress.total }) }}
        </p>
      </div>
      <RouterLink to="/achievements" class="btn btn-outline-primary">
        <i class="bi bi-trophy me-2" aria-hidden="true"></i>
        {{ t('profile.achievements.viewAll') }}
      </RouterLink>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>
.progress {
  height: 1.5rem;
}

.progress-bar {
  transition: width 0.3s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  transition: transform 0.2s;
}
</style>
