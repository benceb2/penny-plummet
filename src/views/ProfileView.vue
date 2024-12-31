<template>
  <div class="container py-4">
    <!-- Level Progress Section -->
    <div class="card mb-4">
      <div class="card-body">
        <h3 class="card-title">Level {{ currentLevel.level }}</h3>
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
          <small>{{ currentLevel.currentXP }} XP</small>
          <small>{{ currentLevel.requiredXP }} XP needed</small>
        </div>
        <div class="mt-3">
          <h5>Level Rewards:</h5>
          <ul class="list-unstyled">
            <li>Chips: {{ formatIntAsCurrency(currentLevel.rewards.chips) }}</li>
            <li>Multiplier: {{ currentLevel.rewards.multiplier?.toFixed(2) }}x</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="card mb-4">
      <div class="card-body">
        <h3 class="card-title">Statistics</h3>
        <div class="row">
          <div class="col-md-4">
            <div class="stat-item">
              <h5>Hands Played</h5>
              <p>{{ userStats.handsPlayed }}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-item">
              <h5>Total Winnings</h5>
              <p>{{ formatIntAsCurrency(userStats.totalWinnings) }}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-item">
              <h5>Biggest Win</h5>
              <p>{{ formatIntAsCurrency(userStats.biggestWin) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievements Section -->
    <div class="card">
      <div class="card-body">
        <h3 class="card-title">Achievements</h3>
        <div class="achievement-filters mb-3">
          <div class="btn-group">
            <button
              v-for="category in ['all', 'blackjack', 'clicker', 'general']"
              :key="category"
              class="btn"
              :class="selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'"
              @click="selectedCategory = category">
              {{ category.charAt(0).toUpperCase() + category.slice(1) }}
            </button>
          </div>
        </div>

        <div class="row">
          <div
            v-for="achievement in filteredAchievements"
            :key="achievement.id"
            class="col-md-6 mb-3">
            <div
              class="card h-100"
              :class="{ 'border-success': achievement.completed }">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">
                  {{ achievement.title }}
                  <span v-if="achievement.completed" class="text-success">
                    <i class="bi bi-check-circle-fill"></i>
                  </span>
                </h5>
                <p class="card-text">{{ achievement.description }}</p>
                <div class="progress" v-if="!achievement.completed">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="{ width: `${(achievement.progress / achievement.requirement) * 100}%` }">
                    {{ achievement.progress }}/{{ achievement.requirement }}
                  </div>
                </div>
                <div class="mt-auto text-muted">
                  <small>Reward: {{ formatIntAsCurrency(achievement.reward) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useAchievementStore } from '@/stores/achievement';
import { formatIntAsCurrency } from '@/utils/currency';

const userStore = useUserStore();
const achievementStore = useAchievementStore();

const selectedCategory = ref('all');

const { currentLevel, levelProgress, achievements } = achievementStore;
const userStats = userStore.stats;

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return achievements;
  }
  return achievements.filter(a => a.category === selectedCategory.value);
});

</script>

<style scoped>
.stat-item {
  text-align: center;
  padding: 1rem;
}

.achievement-filters {
  display: flex;
  justify-content: center;
}

.progress {
  height: 1.5rem;
}

.progress-bar {
  transition: width 0.3s ease-in-out;
}
</style>
