<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import BaseLayout from '@/components/layout/BaseLayout.vue'
import pkg from '../../../package.json'

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
    icon: 'bi bi-diagram-3-fill',
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
    icon: 'bi bi-database-fill',
    color: 'info'
  },
  {
    name: t('about.technology.items.bootstrap.name'),
    description: t('about.technology.items.bootstrap.description'),
    icon: 'bi bi-bootstrap-fill',
    color: 'purple'
  },
  {
    name: t('about.technology.items.localStorage.name'),
    description: t('about.technology.items.localStorage.description'),
    icon: 'bi bi-hdd-fill',
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
        <h2 class="card-title d-flex align-items-center section-title">
          <i class="bi bi-joystick me-2 text-primary" aria-hidden="true" />
          {{ t('about.game.title') }}
        </h2>
        <p class="card-text">
          {{ t('about.game.description') }}
        </p>
      </div>
    </div>

    
    <div class="card mb-4">
      <div class="card-body">
        <h2 class="card-title d-flex align-items-center section-title">
          <i class="bi bi-stack me-2 text-success" aria-hidden="true" />
          {{ t('about.technology.title') }}
        </h2>
        <div class="row g-3">
          <div class="col-md-4 col-sm-6" v-for="tech in technologies" :key="tech.name">
            <div class="tech-item d-flex align-items-center">
              <i :class="`${tech.icon} me-2 fs-4 text-${tech.color}`" aria-hidden="true" />
              <div>
                <h3 class="mb-0 subsection-title">{{ tech.name }}</h3>
                <small class="text-muted">{{ tech.description }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="card mb-4">
      <div class="card-body">
        <h2 class="card-title d-flex align-items-center section-title">
          <i class="bi bi-stars me-2 text-warning" aria-hidden="true" />
          {{ t('about.features.title') }}
        </h2>
        <div class="row g-3">
          <div class="col-md-6" v-for="feature in features" :key="feature.title">
            <div class="feature-item">
              <h3 class="d-flex align-items-center subsection-title">
                <i :class="`${feature.icon} me-2`" aria-hidden="true" />
                {{ feature.title }}
              </h3>
              <p class="mb-0 text-muted">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="about-footer text-center pt-3">
      <div class="mb-3">
        <a
          href="mailto:contact@bence.im"
          class="footer-link mx-2"
          title="Email"
          aria-label="Email">
          <i class="bi bi-envelope fs-5" aria-hidden="true"></i>
        </a>
        <a
          href="https://www.linkedin.com/in/bence-b-b787751a2/"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link mx-2"
          title="LinkedIn"
          aria-label="LinkedIn">
          <i class="bi bi-linkedin fs-5" aria-hidden="true"></i>
        </a>
        <a
          href="https://github.com/benceb2"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link mx-2"
          title="GitHub"
          aria-label="GitHub">
          <i class="bi bi-github fs-5" aria-hidden="true"></i>
        </a>
        <a
          href="https://bence.im/"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link mx-2"
          title="Portfolio"
          aria-label="Portfolio">
          <i class="bi bi-globe fs-5" aria-hidden="true"></i>
        </a>
      </div>
      <div class="d-flex flex-column gap-1">
        <small class="text-muted">Penny Plummet v{{ pkg.version }}</small>
        <small class="text-muted">
          <i class="bi bi-c-circle me-1" aria-hidden="true" />2024 Bence Barkanyi
        </small>
      </div>
    </footer>
  </BaseLayout>
</template>

<style scoped>
.tech-item {
  padding: 1rem;
  border: 1px solid var(--pp-line);
  border-radius: 8px;
  height: 100%;
  background-color: var(--pp-surface-2);
}

.feature-item {
  padding: 1rem;
  border: 1px solid var(--pp-line);
  border-radius: 8px;
  background-color: var(--pp-surface-2);
}

.tech-item:hover,
.feature-item:hover {
  border-color: rgba(225, 178, 90, .4);
  transition: border-color 0.2s ease;
}

.about-footer {
  border-top: 1px solid var(--pp-line);
  margin-top: 1rem;
}

.footer-link {
  color: var(--pp-cream-dim);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--pp-gold);
}
</style>
