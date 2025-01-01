<script setup lang="ts">
import BaseLayout from '@/components/layout/BaseLayout.vue'

const technologies = [
  {
    name: 'TypeScript',
    description: 'Type-safe JavaScript',
    icon: 'bi bi-code-slash',
    color: 'primary'
  },
  {
    name: 'Vue 3',
    description: 'Progressive framework',
    icon: 'fa-brands fa-vuejs',
    color: 'success'
  },
  {
    name: 'Vite',
    description: 'Next-gen frontend tooling',
    icon: 'bi bi-lightning-charge-fill',
    color: 'warning'
  },
  {
    name: 'Pinia',
    description: 'State management',
    icon: 'fa-solid fa-database',
    color: 'info'
  },
  {
    name: 'Bootstrap 5',
    description: 'UI framework',
    icon: 'fa-brands fa-bootstrap',
    color: 'purple'
  },
  {
    name: 'Local Storage',
    description: 'Data persistence',
    icon: 'fa-solid fa-hard-drive',
    color: 'secondary'
  }
]
</script>

<template>
  <BaseLayout
    title="About"
    icon="info-circle-fill"
    :show-balance="false">
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <i class="bi bi-joystick me-2 text-primary" />
          About the Game
        </h5>
        <p class="card-text">
          Penny Plummet is a browser-based casino game that combines classic gambling games with modern web
          technologies.
          Try your luck at Blackjack or test your clicking speed in the Clicker mini-game!
        </p>
      </div>
    </div>

    <!-- Technology Stack -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <i class="bi bi-stack me-2 text-success" />
          Technology Stack
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
          Features
        </h5>
        <div class="row g-3">
          <div class="col-md-6">
            <div class="feature-item">
              <h6 class="d-flex align-items-center">
                <i class="bi bi-suit-spade me-2" />
                Blackjack
              </h6>
              <p class="mb-0 text-muted">
                Classic casino card game with betting mechanics and achievements
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="feature-item">
              <h6 class="d-flex align-items-center">
                <i class="bi bi-mouse me-2" />
                Clicker Game
              </h6>
              <p class="mb-0 text-muted">
                Test your clicking speed and earn rewards
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
