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

const ringProgress = computed(() => Math.min(100, Math.max(0, levelProgress)));
const ringStyle = computed(() => ({
  background: `conic-gradient(var(--pp-gold) ${ringProgress.value}%, rgba(255, 255, 255, .1) 0)`
}));

const hubTiles = [
  { to: '/achievements', icon: 'bi-trophy-fill', labelKey: 'profile.hub.tiles.achievements' },
  { to: '/transactions', icon: 'bi-clock-history', labelKey: 'profile.hub.tiles.transactions' },
  { to: '/settings', icon: 'bi-gear-fill', labelKey: 'profile.hub.tiles.settings' },
  { to: '/about', icon: 'bi-info-circle-fill', labelKey: 'profile.hub.tiles.about' },
];
</script>

<template>
  <BaseLayout
    :title="t('profile.title')"
    bootstrapIcon="person-circle">


    <div class="card mb-4 profile-summary">
      <div class="card-body d-flex align-items-center gap-3">
        <div class="profile-ring" :style="ringStyle" :aria-label="t('profile.level.title', { level: currentLevel.level })">
          <b>{{ currentLevel.level }}</b>
        </div>
        <div class="flex-grow-1 min-w-0">
          <h2 class="profile-username mb-1 section-title text-truncate">{{ userStore.username }}</h2>
          <div class="profile-chips">
            <i class="bi bi-coin" aria-hidden="true"></i>
            {{ userStore.formattedChips }}
          </div>
        </div>
      </div>
    </div>


    <h2 class="visually-hidden">{{ t('profile.hub.linksTitle') }}</h2>
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3" v-for="tile in hubTiles" :key="tile.to">
        <RouterLink :to="tile.to" class="profile-tile card h-100 text-decoration-none">
          <div class="card-body text-center d-flex flex-column align-items-center justify-content-center gap-2">
            <i :class="['bi', tile.icon, 'fs-2']" aria-hidden="true"></i>
            <span class="subsection-title">{{ t(tile.labelKey) }}</span>
          </div>
        </RouterLink>
      </div>
    </div>


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
            aria-valuemax="100"
            :aria-label="t('profile.level.title', { level: currentLevel.level })">
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

.profile-ring {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.profile-ring b {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--pp-surface);
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--pp-cream);
}

.profile-username {
  font-family: var(--pp-font-display);
}

.profile-chips {
  display: flex;
  align-items: center;
  gap: .375rem;
  color: var(--pp-gold-bright);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.profile-tile {
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.profile-tile i {
  color: var(--pp-gold);
}

.profile-tile span {
  color: var(--pp-cream);
}

@media (hover: hover) {
  .profile-tile:hover {
    border-color: rgba(225, 178, 90, .4);
    transform: translateY(-2px);
  }
}
</style>
