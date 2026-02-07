<script setup lang="ts">
import BaseLayout from '@/components/layout/BaseLayout.vue'
import StatsHeader from '@/views/clicker/StatsHeader.vue'
import ClickArea from '@/views/clicker/ClickArea.vue'
import UpgradesPanel from '@/views/clicker/UpgradesPanel.vue'
import { useI18n } from 'vue-i18n'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useClickerStore } from '@/stores/clickerStore'

const { t } = useI18n()
const clickerStore = useClickerStore()
const activePanel = ref<'play' | 'upgrades'>('play')
const isCompact = ref(false)
let mediaQuery: MediaQueryList | null = null

const updateCompact = (event: MediaQueryList | MediaQueryListEvent) => {
  isCompact.value = event.matches
}

onMounted(() => {
  clickerStore.setClickerActive(true)

  if (typeof window !== 'undefined') {
    mediaQuery = window.matchMedia('(max-width: 991.98px)')
    updateCompact(mediaQuery)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateCompact)
    } else {
      mediaQuery.addListener(updateCompact)
    }
  }
})

onBeforeUnmount(() => {
  clickerStore.setClickerActive(false)
  if (mediaQuery) {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', updateCompact)
    } else {
      mediaQuery.removeListener(updateCompact)
    }
  }
})
</script>

<template>
  <BaseLayout
    :title="t('clicker.title')"
    bootstrapIcon="coin"
    :showBalance="true">

    <div class="container-fluid px-0">
      
      <StatsHeader />

      <div v-if="isCompact" class="d-flex justify-content-center mb-3">
        <div class="btn-group w-100" role="group" aria-label="Clicker panels">
          <button
            type="button"
            class="btn"
            :class="activePanel === 'play' ? 'btn-primary' : 'btn-outline-primary'"
            @click="activePanel = 'play'">
            {{ t('clicker.title') }}
          </button>
          <button
            type="button"
            class="btn"
            :class="activePanel === 'upgrades' ? 'btn-primary' : 'btn-outline-primary'"
            @click="activePanel = 'upgrades'">
            {{ t('clicker.upgrades.title') }}
          </button>
        </div>
      </div>

      
      <div class="row">
        
        <div class="col-lg-8" v-show="!isCompact || activePanel === 'play'">
          <ClickArea />
        </div>

        
        <div class="col-lg-4" v-show="!isCompact || activePanel === 'upgrades'">
          <UpgradesPanel />
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
