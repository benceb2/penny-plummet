<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePagination } from '@/composables/usePagination';
import { useAchievementStore } from '@/stores/achievementStore';
import { filterAndSortAchievements } from '@/utils/achievementUitl';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import BasePagination from '@/components/layout/BasePagination.vue';
import AchievementCard from '@/components/AchievementCard.vue';

const { t } = useI18n();
const achievementStore = useAchievementStore();

const selectedCategory = ref('all');
const categories = ['all', 'blackjack', 'clicker', 'roulette', 'general'] as const;

const filteredAchievements = computed(() => {
  return filterAndSortAchievements(achievementStore.achievements, selectedCategory.value);
});

const achievementProgress = computed(() => {
  const totalAchievements = achievementStore.achievements.length;
  const completedAchievements = achievementStore.achievements.filter(a => a.completed).length;
  return {
    completed: completedAchievements,
    total: totalAchievements,
    percentage: totalAchievements === 0
      ? 0
      : Math.round((completedAchievements / totalAchievements) * 100)
  };
});

const {
  goToPage,
  currentPage,
  paginatedItems: paginatedAchievements,
  totalPages
} = usePagination(filteredAchievements, {
  itemsPerPage: 8
});

watch([selectedCategory], () => {
  goToPage(1);
});
</script>

<template>
  <BaseLayout
    :title="t('profile.achievements.title')"
    bootstrapIcon="award">
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div>
            <h5 class="text-muted mb-1">{{ t('profile.stats.achievements') }}</h5>
            <p class="fs-4 fw-bold mb-0">{{ achievementProgress.percentage }}%</p>
          </div>
          <div class="text-muted">
            {{ t('profile.achievements.completed', { completed: achievementProgress.completed, total: achievementProgress.total }) }}
          </div>
        </div>
        <div class="progress mt-3">
          <div
            class="progress-bar"
            role="progressbar"
            :style="{ width: `${achievementProgress.percentage}%` }"
            :aria-valuenow="achievementProgress.percentage"
            aria-valuemin="0"
            aria-valuemax="100">
            {{ achievementProgress.percentage }}%
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="pb-3 mb-4 border-bottom">
          <div class="d-flex justify-content-center flex-wrap gap-2">
            <div class="btn-group" role="group">
              <button
                v-for="category in categories"
                :key="category"
                class="btn"
                :class="selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'"
                @click="selectedCategory = category">
                {{ t(`profile.achievements.categories.${category}`) }}
              </button>
            </div>
          </div>
        </div>

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
