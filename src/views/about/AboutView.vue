<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import BaseLayout from '@/components/layout/BaseLayout.vue'

const { t } = useI18n()

const technologies = computed(() => [
  {
    name: t('about.technology.items.typescript.name'),
    description: t('about.technology.items.typescript.description'),
    icon: 'bi bi-code-slash',
    color: 'primary'
  },
  {
    name: t('about.technology.items.vue.name'),
    description: t('about.technology.items.vue.description'),
    icon: 'fa-brands fa-vuejs',
    color: 'success'
  },
  {
    name: t('about.technology.items.vite.name'),
    description: t('about.technology.items.vite.description'),
    icon: 'bi bi-lightning-charge-fill',
    color: 'warning'
  },
  {
    name: t('about.technology.items.pinia.name'),
    description: t('about.technology.items.pinia.description'),
    icon: 'fa-solid fa-database',
    color: 'info'
  },
  {
    name: t('about.technology.items.bootstrap.name'),
    description: t('about.technology.items.bootstrap.description'),
    icon: 'fa-brands fa-bootstrap',
    color: 'purple'
  },
  {
    name: t('about.technology.items.localStorage.name'),
    description: t('about.technology.items.localStorage.description'),
    icon: 'fa-solid fa-hard-drive',
    color: 'secondary'
  }
]);

const features = computed(() => [
  {
    title: t('about.features.blackjack.title'),
    description: t('about.features.blackjack.description'),
    icon: 'bi bi-suit-spade'
  },
  {
    title: t('about.features.roulette.title'),
    description: t('about.features.roulette.description'),
    icon: 'bi bi-dice-5'
  },
  {
    title: t('about.features.clicker.title'),
    description: t('about.features.clicker.description'),
    icon: 'bi bi-mouse'
  }
]);

</script>

<template>
  <BaseLayout
    :title="t('about.title')"
    bootstrapIcon="info-circle-fill"
    :show-balance="false">
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <i class="bi bi-joystick me-2 text-primary" />
          {{ t('about.game.title') }}
        </h5>
        <p class="card-text">
          {{ t('about.game.description') }}
        </p>
      </div>
    </div>

    <!-- Technology Stack -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <i class="bi bi-stack me-2 text-success" />
          {{ t('about.technology.title') }}
        </h5>
        <div class="row g-3">
          <div class="col-md-4 col-sm-6" v-for="tech in technologies" :key="tech.name">
            <div class="tech-item d-flex align-items-center">
              <i :class="`${tech.icon} me-2 fs-4 text-${tech.color}`" />
              <div>
                <h6 class="mb-0">{{ tech.name }}</h6>
                <small class="text-muted">{{ tech.description }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <i class="bi bi-stars me-2 text-warning" />
          {{ t('about.features.title') }}
        </h5>
        <div class="row g-3">
          <div class="col-md-6" v-for="feature in features" :key="feature.title">
            <div class="feature-item">
              <h6 class="d-flex align-items-center">
                <i :class="`${feature.icon} me-2`" />
                {{ feature.title }}
              </h6>
              <p class="mb-0 text-muted">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>
.tech-item {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  height: 100%;
  background-color: #f8f9fa;
}

.feature-item {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.tech-item:hover,
.feature-item:hover {
  background-color: #f0f0f0;
  transition: background-color 0.2s ease;
}
</style>
