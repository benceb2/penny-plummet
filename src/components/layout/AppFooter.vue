<script setup lang="ts">
import pkg from '../../../package.json'
</script>
<template>
  <footer class="mt-auto py-2 py-md-3 bg-light border-top app-footer">
    <div class="container text-center">
      <div class="mb-3">
        <a
          href="mailto:contact@bence.im"
          class="text-decoration-none mx-2"
          title="Email"
          aria-label="Email">
          <i class="bi bi-envelope text-dark fs-5 hover-opacity"></i>
        </a>
        <a
          href="https://www.linkedin.com/in/bence-b-b787751a2/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none mx-2"
          title="LinkedIn"
          aria-label="LinkedIn">
          <i class="bi bi-linkedin text-dark fs-5 hover-opacity"></i>
        </a>
        <a
          href="https://github.com/benceb2"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none mx-2"
          title="GitHub"
          aria-label="GitHub">
          <i class="bi bi-github text-dark fs-5 hover-opacity"></i>
        </a>
        <a
          href="https://bence.im/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none mx-2"
          title="Portfolio"
          aria-label="Portfolio">
          <i class="bi bi-globe text-dark fs-5 hover-opacity"></i>
        </a>
      </div>
      <div class="d-flex flex-column gap-1">
        <small class="text-muted">Penny Plummet v{{ pkg.version }}</small>
        <small class="text-muted">
          <i class="bi bi-c-circle me-1" />2024 Bence Barkanyi
        </small>
      </div>
    </div>
  </footer>
</template>
<style scoped>
.hover-opacity {
  transition: opacity 0.2s ease;
}

.hover-opacity:hover {
  opacity: 0.7;
}

@media (max-width: 767px) {
  .app-footer .mb-3 {
    margin-bottom: 0.5rem !important;
  }

  .app-footer .fs-5 {
    font-size: 1rem !important;
  }
}
</style>
