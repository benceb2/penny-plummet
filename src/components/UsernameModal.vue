<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const username = ref('')
const showModal = ref(false)

const submitUsername = () => {
  if (username.value.trim()) {
    userStore.updateUsername(username.value.trim())
    showModal.value = false
  }
}

onMounted(() => {
  // Show modal if username isn't set
  if (!userStore.username) {
    showModal.value = true
  }
})
</script>

<template>
  <div v-if="showModal" class="username-modal-container">
    <div class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Welcome to Penny Plummet!</h5>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitUsername">
              <div class="mb-3">
                <label for="username" class="form-label">Please enter your username:</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="username"
                  required
                  minlength="2"
                  maxlength="20"
                  autocomplete="off"
                  placeholder="Enter username">
              </div>
              <button type="submit" class="btn btn-primary" :disabled="!username.trim()">
                Start Playing
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop"></div>
  </div>
</template>

<style scoped>
.username-modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
}

.modal {
  position: relative;
  z-index: 1055;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.modal-dialog {
  position: relative;
  z-index: 1056;
}

.modal-content {
  background-color: white;
  pointer-events: auto;
}

input.form-control {
  z-index: 1057;
  position: relative;
}

button {
  z-index: 1057;
  position: relative;
}
</style>
