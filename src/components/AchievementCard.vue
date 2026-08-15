<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';
import { useAchievementStore } from '@/stores/achievementStore';

const achievementStore = useAchievementStore();

const props = defineProps({
  achievement: {
    type: Object,
    required: true
  }
});
const { t } = useI18n();

const achievementKey = computed(() => {
  return `achievements.${props.achievement.category}.${props.achievement.id}`;
});

const progressPercent = computed(() => {
  const requirement = props.achievement.requirement ?? 0;
  if (requirement <= 0) return 0;
  return Math.min(Math.round((props.achievement.progress / requirement) * 100), 100);
});

function claimReward() {
  achievementStore.claimAchievement(props.achievement.id);
}
</script>

<template>
  <div
    class="card achievement-card h-100"
    :class="{
      'achievement-card--unclaimed': achievement.completed && !achievement.claimed,
      'achievement-card--locked': !achievement.completed
    }">
    <div class="card-body d-flex flex-column">
      <h3 class="card-title d-flex align-items-center h5">
        {{ t(`${achievementKey}.title`) }}
        <span v-if="achievement.completed && achievement.claimed" class="achievement-card-check ms-2">
          <i class="bi bi-check-circle-fill"></i>
        </span>
        <span v-else-if="achievement.completed && !achievement.claimed" class="achievement-card-gift ms-2">
          <i class="bi bi-gift-fill"></i>
        </span>
      </h3>


      <p class="card-text text-body-secondary">{{ t(`${achievementKey}.description`) }}</p>

      <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
        <small class="reward-pill">
          <i class="bi bi-coin me-1"></i>
          {{ formatIntAsCurrency(achievement.reward.chips) }}
        </small>
        <small class="reward-pill">
          <i class="bi bi-star me-1"></i>
          {{ achievement.reward.xp }} XP
        </small>
      </div>

      <div v-if="!achievement.completed" class="mb-3">
        <div class="d-flex align-items-center mb-2">
          <div class="progress flex-grow-1" style="height: 8px;">
            <div
              class="progress-bar"
              role="progressbar"
              :style="{ width: `${progressPercent}%` }"
              :aria-valuenow="progressPercent"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="t(`${achievementKey}.title`)">
            </div>
          </div>
          <small class="ms-2 text-body-secondary" style="min-width: 45px;">
            {{ achievement.progress }}/{{ achievement.requirement }}
          </small>
        </div>
      </div>


      <button
        v-if="achievement.completed && !achievement.claimed"
        @click="claimReward"
        class="btn btn-primary btn-sm mb-3">
        <i class="bi bi-gift-fill me-2"></i>
        {{ t('achievements.actions.claimRewards') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.achievement-card--unclaimed {
  border-color: rgba(225, 178, 90, .5);
  box-shadow: 0 0 0 1px rgba(225, 178, 90, .18);
}

/* Muted relative to the default/unclaimed borders below rather than a
   blanket `opacity`, which would also fade descendant text and could push
   the reward pills under the 4.5:1 contrast minimum. */
.achievement-card--locked {
  border-color: rgba(225, 178, 90, .08);
}

.achievement-card-check {
  color: var(--pp-gold-bright);
}

.achievement-card-gift {
  color: var(--pp-gold);
}

.reward-pill {
  display: flex;
  align-items: center;
  padding: .15rem .5rem;
  border-radius: 999px;
  background: var(--pp-surface-2);
  color: var(--pp-cream-dim);
  font-weight: 600;
}
</style>
