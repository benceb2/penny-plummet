<template>
  <footer class="mt-auto py-3 bg-light border-top">
    <div class="container text-center">
      <div class="mb-2">
        <a
          href="https://www.linkedin.com/in/bence-b-b787751a2/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none mx-2">
          <i class="bi bi-linkedin text-dark" />
        </a>
        <a
          href="https://github.com/benceb2"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none mx-2">
          <i class="bi bi-github text-dark" />
        </a>
        <a
          href="https://bence.im/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none mx-2">
          <i class="bi bi-globe text-dark" />
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
