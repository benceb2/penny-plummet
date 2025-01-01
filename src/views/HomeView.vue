<script setup lang="ts">
import { computed } from 'vue';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import AchievementCard from '@/components/AchievementCard.vue';
import { useUserStore } from '@/stores/user';
import { useAchievementStore } from '@/stores/achievement';
import { formatIntAsCurrency } from '@/utils/currency';

const userStore = useUserStore();
const achievementStore = useAchievementStore();

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
    :title="userStore.username ? `Welcome back, ${userStore.username}!` : 'Welcome to Penny Plummet!'"
    icon="emoji-smile-fill"
    :showBalance="false">

    <!-- Quick Stats Overview -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="d-flex align-items-center">
              <i class="bi bi-wallet2 fs-3 text-primary me-2"></i>
              <div>
                <h6 class="mb-0">Current Balance</h6>
                <h4 class="mb-0">{{ userStore.formattedChips }}</h4>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="d-flex align-items-center">
              <i class="bi bi-trophy fs-3 text-warning me-2"></i>
              <div>
                <h6 class="mb-0">Biggest Win</h6>
                <h4 class="mb-0">{{ formatIntAsCurrency(userStore.stats.biggestWin) }}</h4>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="d-flex align-items-center">
              <i class="bi bi-stars fs-3 text-info me-2"></i>
              <div>
                <h6 class="mb-0">Level</h6>
                <h4 class="mb-0">{{ achievementStore.currentLevel.level }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Level Progress -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <i class="bi bi-graph-up-arrow text-success me-2"></i>
          Level Progress
        </h5>
        <div class="progress mb-2">
          <div
            class="progress-bar bg-success"
            role="progressbar"
            :style="{ width: `${achievementStore.levelProgress}%` }"
            :aria-valuenow="achievementStore.levelProgress"
            aria-valuemin="0"
            aria-valuemax="100">
            {{ Math.floor(achievementStore.levelProgress) }}%
          </div>
        </div>
        <small class="text-muted">
          {{ achievementStore.currentLevel.currentXP }} / {{ achievementStore.currentLevel.requiredXP }} XP to next
          level
        </small>
      </div>
    </div>

    <!-- Achievements In Progress -->
    <div class="card">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center mb-3">
          <i class="bi bi-award text-primary me-2"></i>
          Achievements In Progress
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
              View All Achievements
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

  </BaseLayout>
</template>
