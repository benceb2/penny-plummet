<script setup lang="ts">
import pkg from '../../../package.json'
const currentYear = new Date().getFullYear()
</script>
<template>
  <footer class="mt-auto py-3 bg-light border-top">
    <div class="container text-center">
      <div class="mb-3">
        <a
          href="mailto:contact@bence.im"
          class="text-decoration-none mx-2"
          title="Email">
          <i class="bi bi-envelope text-dark fs-5 hover-opacity"></i>
        </a>
        <a
          href="https://www.linkedin.com/in/bence-b-b787751a2/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none mx-2"
          title="LinkedIn">
          <i class="bi bi-linkedin text-dark fs-5 hover-opacity"></i>
        </a>
        <a
          href="https://github.com/benceb2"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none mx-2"
          title="GitHub">
          <i class="bi bi-github text-dark fs-5 hover-opacity"></i>
        </a>
        <a
          href="https://bence.im/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none mx-2"
          title="Portfolio">
          <i class="bi bi-globe text-dark fs-5 hover-opacity"></i>
        </a>
      </div>
      <div class="d-flex flex-column gap-1">
        <small class="text-muted">Penny Plummet v{{ pkg.version }}</small>
        <small class="text-muted">
          <i class="bi bi-c-circle me-1" />{{ currentYear }} Bence Barkanyi
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
</style>
