<script setup lang="ts">
import { RouterView } from 'vue-router'
import UsernameModal from './components/modals/UsernameModal.vue'
import ConsentModal from './components/modals/ConsentModal.vue'
import AppNavbar from './components/layout/AppNavbar.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <ConsentModal />
    <UsernameModal />

    <header>
      <AppNavbar />
    </header>

    <main class="flex-grow-1 pb-5">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>
