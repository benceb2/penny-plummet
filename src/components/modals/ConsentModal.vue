<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import BaseModal from './BaseModal.vue'

const userStore = useUserStore()
const showModal = ref(!userStore.consented)
const { t } = useI18n()

const acceptConsent = () => {
  userStore.updateConsent(true)
  showModal.value = false
}
</script>

<template>
  <BaseModal
    :show="showModal"
    :title="t('consentModal.title')"
    :centered="true"
    :static="true">
    <p>{{ t('consentModal.description') }}</p>

    <template #footer>
      <button type="button" class="btn btn-primary" @click="acceptConsent">
        {{ t('consentModal.accept') }}
      </button>
    </template>
  </BaseModal>
</template>
