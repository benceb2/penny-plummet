<script setup lang="ts">
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';
import { useAchievementStore } from '@/stores/achievementStore';

const achievementStore = useAchievementStore();

const props = defineProps({
  achievement: {
    type: Object,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  }
});

function claimReward() {
  achievementStore.claimAchievement(props.achievement.id);
}
</script>

<template>
  <div
    class="card h-100"
    :class="{
      'border-success': achievement.completed && achievement.claimed,
      'border-warning': achievement.completed && !achievement.claimed
    }">
    <div class="card-body d-flex flex-column bg-light">
      <!-- Header -->
      <h5 class="card-title d-flex align-items-center">
        {{ achievement.title }}
        <span v-if="achievement.completed && achievement.claimed" class="text-success ms-2">
          <i class="bi bi-check-circle-fill"></i>
        </span>
        <span v-else-if="achievement.completed && !achievement.claimed" class="text-warning ms-2">
          <i class="bi bi-gift-fill"></i>
        </span>
      </h5>

      <!-- Description -->
      <p class="card-text text-muted">{{ achievement.description }}</p>

      <!-- Progress Section -->
      <div v-if="!achievement.completed" class="mb-3">
        <div class="d-flex align-items-center mb-2">
          <div class="progress flex-grow-1" style="height: 8px;">
            <div
              class="progress-bar bg-primary"
              role="progressbar"
              :style="{ width: `${(achievement.progress / achievement.requirement) * 100}%` }">
            </div>
          </div>
          <small class="ms-2 text-muted" style="min-width: 45px;">
            {{ achievement.progress }}/{{ achievement.requirement }}
          </small>
        </div>
      </div>

      <!-- Claim Button -->
      <button
        v-if="achievement.completed && !achievement.claimed"
        @click="claimReward"
        class="btn btn-warning btn-sm mb-3">
        <i class="bi bi-gift-fill me-2"></i>
        Claim Rewards
      </button>

      <!-- Rewards -->
      <div class="mt-auto d-flex align-items-center gap-3">
        <small class="text-success d-flex align-items-center">
          <i class="bi bi-coin me-1"></i>
          {{ formatIntAsCurrency(achievement.reward.chips) }}
        </small>
        <small class="text-info d-flex align-items-center">
          <i class="bi bi-star me-1"></i>
          {{ achievement.reward.xp }} XP
        </small>
      </div>
    </div>
  </div>
</template>
