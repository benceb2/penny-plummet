<template>
  <footer class="footer mt-auto py-3 bg-light">
    <div class="container text-center">
      <div class="mb-2">
        <a
          href="YOUR_LINKEDIN_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none mx-2">
          <i class="bi bi-linkedin text-dark" />
        </a>
        <a
          href="YOUR_GITHUB_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none mx-2">
          <i class="bi bi-github text-dark" />
        </a>
      </div>
      <div class="text-muted">
        <small>
          <i class="bi bi-c-circle" /> {{ currentYear }} Bence Barkanyi. All rights reserved.
        </small>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.bi {
  font-size: 1.2rem;
}

.bi:hover {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}
</style>
