<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { usePagination } from '@/composables/usePagination';
import { useAchievementStore } from '@/stores/achievementStore';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import BasePagination from '@/components/layout/BasePagination.vue';
import AchievementCard from '@/components/AchievementCard.vue';
import { useRoute } from 'vue-router';
import { filterAndSortAchievements } from '@/utils/achievementUitl';

const userStore = useUserStore();
const achievementStore = useAchievementStore();

const selectedCategory = ref('all');

const { currentLevel, levelProgress, achievements } = achievementStore;
const userStats = userStore.stats;

const filteredAchievements = computed(() => {
  return filterAndSortAchievements(achievements, selectedCategory.value);
});

const achievementProgress = computed(() => {
  const totalAchievements = achievements.length;
  const completedAchievements = achievements.filter(a => a.completed).length;
  return {
    completed: completedAchievements,
    total: totalAchievements,
    percentage: Math.round((completedAchievements / totalAchievements) * 100)
  };
});

const {
  goToPage,
  currentPage,
  paginatedItems: paginatedAchievements,
  totalPages
} = usePagination(filteredAchievements, {
  itemsPerPage: 8  // Show 6 achievements per page (3x2 grid)
})

const route = useRoute()

onMounted(() => {
  // Scroll to achievements section if hash is present
  if (route.hash === '#achievements') {
    // Add a small delay to ensure the DOM is fully rendered
    setTimeout(() => {
      document.getElementById('achievements')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }
})

watch([selectedCategory], () => {
  goToPage(1) // Reset to first page when filters change
})
</script>

<template>
  <BaseLayout
    title="Profile"
    bootstrapIcon="person-circle">

    <!-- Level Progress Section -->
    <div class="card mb-4">
      <div class="card-body">
        <h3 class="card-title">
          <i class="bi bi-stars text-info me-2"></i>
          Level {{ currentLevel.level }}
        </h3>
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
          </ul>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="card mb-4">
      <div class="card-body">
        <h3 class="card-title">
          <i class="bi bi-graph-up-arrow text-primary me-2"></i>
          Statistics
        </h3>
        <div class="row">
          <div class="col-md-3">
            <div class="text-center p-4 rounded-3 hover-lift">
              <div class="mb-3">
                <i class="bi bi-joystick text-primary fs-1"></i>
              </div>
              <h5 class="text-muted">Hands Played</h5>
              <p class="fs-4 fw-bold mb-0">{{ userStats.handsPlayed }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-4 rounded-3 hover-lift">
              <div class="mb-3">
                <i class="bi bi-coin text-success fs-1"></i>
              </div>
              <h5 class="text-muted">Total Winnings</h5>
              <p class="fs-4 fw-bold mb-0">{{ formatIntAsCurrency(userStats.totalWinnings) }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-4 rounded-3 hover-lift">
              <div class="mb-3">
                <i class="bi bi-trophy text-warning fs-1"></i>
              </div>
              <h5 class="text-muted">Biggest Win</h5>
              <p class="fs-4 fw-bold mb-0">{{ formatIntAsCurrency(userStats.biggestWin) }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-4 rounded-3 hover-lift">
              <div class="mb-3">
                <i class="bi bi-award text-info fs-1"></i>
              </div>
              <h5 class="text-muted">Achievements</h5>
              <p class="fs-4 fw-bold mb-0">{{ achievementProgress.percentage }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievements Section -->
    <div class="card" id="achievements">
      <div class="card-body">
        <h3 class="card-title d-flex justify-content-between align-items-center mb-4">
          <div class="d-flex align-items-center">
            <i class="bi bi-award text-primary me-2"></i>
            Achievements
          </div>
          <span class="text-muted fs-6">
            {{ achievementProgress.completed }}/{{ achievementProgress.total }} completed
          </span>
        </h3>

        <!-- Filters -->
        <div class="row gy-3 pb-3 mb-4 border-bottom align-items-center">
          <!-- Filters -->
          <div class="pb-3 mb-4 border-bottom">
            <!-- Category Buttons Row -->
            <div class="d-flex justify-content-center mb-4">
              <div class="btn-group" role="group">
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
          </div>
        </div>

        <!-- Achievement Grid -->
        <div class="row g-3">
          <div
            v-for="achievement in paginatedAchievements"
            :key="achievement.id"
            class="col-md-6">
            <AchievementCard :achievement="achievement" />
          </div>
        </div>

        <BasePagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="goToPage" />
      </div>
    </div>
  </BaseLayout>
</template>

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

.hover-lift:hover {
  transform: translateY(-2px);
  transition: transform 0.2s;
}
</style>
