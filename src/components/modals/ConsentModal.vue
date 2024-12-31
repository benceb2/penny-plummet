<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import BaseModal from './BaseModal.vue'

const userStore = useUserStore()
const showModal = ref(!userStore.consented)

const acceptConsent = () => {
  userStore.updateConsent(true)
  showModal.value = false
}
</script>

<template>
  <BaseModal
    :show="showModal"
    title="Local Storage Notice"
    :centered="true"
    :static="true">
    <p>
      This game uses local storage to save your progress and settings.
      No personal data is collected or shared with third parties.
      By clicking "Accept", you agree to the use of local storage.
    </p>
    <p>
      <small class="text-muted">
        You can learn more about how we use local storage in our
        <router-link to="/privacy">privacy policy</router-link>.
      </small>
    </p>

    <template #footer>
      <button type="button" class="btn btn-primary" @click="acceptConsent">
        Accept
      </button>
    </template>
  </BaseModal>
</template>
