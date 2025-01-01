<template>
  <BaseLayout
    title="About"
    icon="info-circle-fill"
    :show-balance="false">
    <!-- Project Description -->
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
              <i :class="`bi ${tech.icon} me-2 fs-4 text-${tech.color}`" />
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

    <!-- Developer Info -->
    <div class="card">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <i class="bi bi-person-badge me-2 text-info" />
          Connect with me
        </h5>
        <div class="d-flex justify-content-center gap-3 mt-3">
          <a
            href="https://bence.im/"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline-primary">
            <i class="bi bi-globe me-2" />
            Portfolio
          </a>
          <a
            href="https://www.linkedin.com/in/bence-b-b787751a2/"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline-primary">
            <i class="bi bi-linkedin me-2" />
            LinkedIn
          </a>
          <a
            href="https://www.linkedin.com/in/bence-b-b787751a2/"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline-primary">
            <i class="bi bi-envelope me-2" />
            E-Mail
          </a>
          <a
            href="https://github.com/benceb2"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline-primary me-2">
            <i class="bi bi-github me-2" />
            GitHub
          </a>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from '@/components/layout/BaseLayout.vue'

const technologies = [
  {
    name: 'TypeScript',
    description: 'Type-safe JavaScript',
    icon: 'bi-code-slash',
    color: 'primary'
  },
  {
    name: 'Vue 3',
    description: 'Progressive framework',
    icon: 'bi-box',
    color: 'success'
  },
  {
    name: 'Vite',
    description: 'Next-gen frontend tooling',
    icon: 'bi-lightning-charge',
    color: 'warning'
  },
  {
    name: 'Pinia',
    description: 'State management',
    icon: 'bi-database',
    color: 'info'
  },
  {
    name: 'Bootstrap 5',
    description: 'UI framework',
    icon: 'bi-bootstrap',
    color: 'purple'
  },
  {
    name: 'Local Storage',
    description: 'Data persistence',
    icon: 'bi-save',
    color: 'secondary'
  }
]
</script>

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
