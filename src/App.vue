<script setup lang="ts">
import { RouterView } from 'vue-router'
import UsernameModal from './components/UsernameModal.vue'
import Navbar from './components/Navbar.vue'

</script>
<template>
  <UsernameModal />
  <header>
    <Navbar />
  </header>
  <RouterView />
</template>
