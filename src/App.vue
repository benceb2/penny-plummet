<script setup lang="ts">
import { RouterView } from 'vue-router'
import UsernameModal from './components/modals/UsernameModal.vue'
import ConsentModal from './components/modals/ConsentModal.vue'
import Navbar from './components/layout/Navbar.vue'

</script>
<template>
  <ConsentModal />
  <UsernameModal />
  <header>
    <Navbar />
  </header>
  <RouterView />
</template>
