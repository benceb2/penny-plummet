<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'

const isNavOpen = ref(false)
</script>

<template>
  <header>
    <div class="d-flex align-items-center justify-content-center">
      <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <RouterLink class="navbar-brand" to="/">Penny Plummet</RouterLink>
          <button
            class="navbar-toggler"
            type="button"
            @click="isNavOpen = !isNavOpen"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div
            class="navbar-collapse"
            :class="{ 'show': isNavOpen, 'collapse': !isNavOpen }"
            id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item">
                <RouterLink class="nav-link" @click="isNavOpen = false" to="/blackjack">Blackjack</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" @click="isNavOpen = false" to="/about">About</RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </header>
  <RouterView />
</template>
