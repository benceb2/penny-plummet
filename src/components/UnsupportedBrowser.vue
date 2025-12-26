<script setup lang="ts">
const reloadPage = () => {
  window.location.reload();
};
</script>

<template>
  <div class="unsupported-browser d-flex align-items-center justify-content-center min-vh-100 py-5">
    <div class="card shadow-sm border-0 w-100" style="max-width: 560px;">
      <div class="card-body p-4 p-md-5">
        <div class="d-flex align-items-center mb-3">
          <div class="warning-icon d-flex align-items-center justify-content-center me-3">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h1 class="h4 mb-0">Browser not supported</h1>
        </div>
        <p class="text-muted mb-3">
          Penny Plummet needs IndexedDB to store your progress. Your browser either
          does not support it or has it disabled.
        </p>
        <div class="bg-light rounded p-3 mb-3">
          <div class="small fw-semibold mb-2">Try this:</div>
          <ul class="list-unstyled small mb-0">
            <li class="mb-2">
              <i class="bi bi-check2-circle text-success me-2"></i>
              Enable storage/IndexedDB in your browser settings.
            </li>
            <li class="mb-2">
              <i class="bi bi-check2-circle text-success me-2"></i>
              Use a modern browser like Chrome, Edge, Firefox, or Safari.
            </li>
            <li>
              <i class="bi bi-check2-circle text-success me-2"></i>
              Avoid private browsing modes that disable storage.
            </li>
          </ul>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-primary" type="button" @click="reloadPage">
            Reload
          </button>
          <a
            class="btn btn-outline-secondary"
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
  background: radial-gradient(circle at top, rgba(255, 193, 7, 0.12), rgba(0, 0, 0, 0) 65%);
}

.warning-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 193, 7, 0.2);
  color: #b78103;
  font-size: 1.25rem;
}
</style>
