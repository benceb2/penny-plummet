<script setup lang="ts">
const reloadPage = () => {
  window.location.reload();
};
</script>

<template>
  <div class="unsupported-browser d-flex align-items-center justify-content-center min-vh-100 py-5">
    <div class="card w-100" style="max-width: 560px;">
      <div class="card-body p-4 p-md-5">
        <div class="d-flex align-items-center mb-3">
          <div class="warning-icon d-flex align-items-center justify-content-center me-3">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h1 class="h4 mb-0">Browser not supported</h1>
        </div>
        <p class="text-body-secondary mb-3">
          Penny Plummet needs IndexedDB to store your progress. Your browser either
          does not support it or has it disabled.
        </p>
        <div class="try-this rounded p-3 mb-3">
          <div class="small fw-semibold mb-2">Try this:</div>
          <ul class="list-unstyled small mb-0">
            <li class="mb-2">
              <i class="bi bi-check2-circle text-gold me-2"></i>
              Enable storage/IndexedDB in your browser settings.
            </li>
            <li class="mb-2">
              <i class="bi bi-check2-circle text-gold me-2"></i>
              Use a modern browser like Chrome, Edge, Firefox, or Safari.
            </li>
            <li>
              <i class="bi bi-check2-circle text-gold me-2"></i>
              Avoid private browsing modes that disable storage.
            </li>
          </ul>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-primary" type="button" @click="reloadPage">
            Reload
          </button>
          <a
            class="btn btn-outline-light"
            href="https://caniuse.com/indexeddb"
            target="_blank"
            rel="noreferrer">
            Learn more
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unsupported-browser {
  background: radial-gradient(circle at top, rgba(225, 178, 90, .14), rgba(0, 0, 0, 0) 65%);
}

.warning-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(225, 178, 90, .18);
  color: var(--pp-gold);
  font-size: 1.25rem;
}

.try-this {
  background: var(--pp-surface-2);
  border: 1px solid var(--pp-line);
}

.text-gold {
  color: var(--pp-gold);
}
</style>
