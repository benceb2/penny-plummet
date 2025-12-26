<script setup lang="ts">
import BaseLayout from '@/components/layout/BaseLayout.vue'
import StatsHeader from '@/views/clicker/StatsHeader.vue'
import ClickArea from '@/views/clicker/ClickArea.vue'
import UpgradesPanel from '@/views/clicker/UpgradesPanel.vue'
import { useI18n } from 'vue-i18n'
import { onBeforeUnmount, onMounted } from 'vue'
import { useClickerStore } from '@/stores/clickerStore'

const { t } = useI18n()
const clickerStore = useClickerStore()

onMounted(() => {
  clickerStore.setClickerActive(true)
})

onBeforeUnmount(() => {
  clickerStore.setClickerActive(false)
})
</script>

<template>
  <BaseLayout
    :title="t('clicker.title')"
    bootstrapIcon="coin"
    :showBalance="true">

    <div class="container-fluid px-0">
      <!-- Stats Header -->
      <StatsHeader />

      <!-- Main Game Area -->
      <div class="row">
        <!-- Left Side - Click Area -->
        <div class="col-lg-8">
          <ClickArea />
        </div>

        <!-- Right Side - Upgrades -->
        <div class="col-lg-4">
          <UpgradesPanel />
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
