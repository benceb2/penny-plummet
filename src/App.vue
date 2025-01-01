<script setup lang="ts">
import { RouterView } from 'vue-router'
import UsernameModal from './components/modals/UsernameModal.vue'
import ConsentModal from './components/modals/ConsentModal.vue'
import AppNavbar from './components/layout/AppNavbar.vue'
import AppFooter from './components/layout/AppFooter.vue'

</script>
<template>
  <ConsentModal />
  <UsernameModal />
  <header>
    <AppNavbar />
  </header>
  <RouterView />
  <AppFooter />
</template>
