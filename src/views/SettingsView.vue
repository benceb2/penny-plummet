<script setup lang="ts">
import { ref } from 'vue';
import type { SavePreview } from '@/types/SavePreview';
import { SaveManager } from '@/utils/saveManager';
import UsernameSettings from '@/components/UsernameSettings.vue';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import { useUserStore } from '@/stores/userStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { useBlackjackStore } from '@/stores/blackjackStore';
import { useClickerStore } from '@/stores/clickerStore';
import { formatIntAsCurrency } from '@/utils/currencyUtil';
import type { GameSaveData } from '@/types/GameSaveData';

// Initialize stores and manager
const saveManager = new SaveManager();
const userStore = useUserStore();
const achievementStore = useAchievementStore();
const blackjackStore = useBlackjackStore();
const clickerStore = useClickerStore();

// UI state
const importError = ref('');
const importSuccess = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const savePreview = ref<SavePreview | null>(null);
const showImportConfirm = ref(false);
const showDeleteConfirm = ref(false);
const pendingImportData = ref<string | null>(null);

// Collect current game state
const getCurrentGameState = () => ({
  user: userStore.$state,
  achievements: achievementStore.$state,
  blackjack: blackjackStore.$state,
  clicker: clickerStore.$state,
  timestamp: Date.now()
});

const exportSave = async () => {
  try {
    const saveData = getCurrentGameState();
    const serialized = await saveManager.exportSave(saveData as GameSaveData);
    const blob = await saveManager.createDownloadBlob(serialized);

    // Handle file download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `penny-plummet-${userStore.username}-${new Date().getTime()}.save`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export save:', error);
  }
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target?.files?.[0];

  if (!file) {
    importError.value = 'No file selected';
    return;
  }

  try {
    const text = await file.text();
    const saveData = await saveManager.importSave(text);
    savePreview.value = saveManager.extractSavePreview(saveData);
    pendingImportData.value = text;
    showImportConfirm.value = true;
  } catch (error) {
    console.error('Failed to read save file:', error);
    importError.value = error instanceof Error ? error.message : 'Failed to read save file';
  } finally {
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const confirmImport = async () => {
  savePreview.value = null;
  try {
    if (!pendingImportData.value) return;

    const saveData = await saveManager.importSave(pendingImportData.value);

    // Apply the saved states to all stores
    userStore.$patch(saveData.user);
    achievementStore.$patch(saveData.achievements);
    blackjackStore.$patch(saveData.blackjack);
    clickerStore.$patch(saveData.clicker);

    showSuccess();
  } catch (error) {
    console.error('Failed to import save:', error);
    importError.value = error instanceof Error ? error.message : 'Failed to import save file';
  } finally {
    showImportConfirm.value = false;
    pendingImportData.value = null;
  }
};

const showSuccess = () => {
  importSuccess.value = true;
  importError.value = '';
  setTimeout(() => {
    importSuccess.value = false;
  }, 3000);
};

const cancelImport = () => {
  showImportConfirm.value = false;
  pendingImportData.value = null;
  savePreview.value = null;
};

const deleteSave = () => {
  showDeleteConfirm.value = true;
};

const confirmDelete = () => {
  clickerStore.reset();
  clickerStore.stopAutoClicker();
  localStorage.clear();
  window.location.reload();
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
};
</script>

<template>
  <BaseLayout title="Settings" icon="gear-fill" :show-balance="false">
    <UsernameSettings />
    <div class="card">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center mb-4">
          <i class="bi bi-save me-2"></i>
          Game Save Management
        </h5>

        <!-- Export Section -->
        <div class="mb-4">
          <h6 class="mb-3">Export Save</h6>
          <p class="text-muted small mb-3">
            Download your current game progress to a file. You can use this file to restore your progress later or on
            another device.
          </p>
          <button @click="exportSave" class="btn btn-primary">
            <i class="bi bi-download me-2"></i>
            Export Save File
          </button>
        </div>

        <hr class="my-4">

        <!-- Import Section -->
        <div class="mb-4">
          <h6 class="mb-3">Import Save</h6>
          <p class="text-muted small mb-3">
            Restore your progress from a previously exported save file. This will replace your current progress.
          </p>

          <div class="mb-3">
            <input
              type="file"
              class="form-control"
              accept=".save"
              @change="handleFileSelect"
              ref="fileInput">
          </div>

          <!-- Import Preview & Confirmation Modal -->
          <div
            v-if="showImportConfirm"
            class="modal d-block"
            tabindex="-1"
            style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Confirm Import</h5>
                </div>
                <div class="modal-body">
                  <div
                    class="save-preview bg-light p-3 rounded mb-3"
                    v-if="savePreview">
                    <h6 class="mb-3">Save File Preview</h6>
                    <div class="row g-3">
                      <div class="col-sm-6">
                        <div class="d-flex align-items-center">
                          <i class="bi bi-person-circle text-primary fs-4 me-2"></i>
                          <div>
                            <div class="text-muted small">Username</div>
                            <div class="fw-medium">{{ savePreview.username || 'Not set' }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-sm-6">
                        <div class="d-flex align-items-center">
                          <i class="bi bi-wallet2 text-success fs-4 me-2"></i>
                          <div>
                            <div class="text-muted small">Balance</div>
                            <div class="fw-medium">{{ formatIntAsCurrency(savePreview.balance) }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-sm-6">
                        <div class="d-flex align-items-center">
                          <i class="bi bi-stars text-warning fs-4 me-2"></i>
                          <div>
                            <div class="text-muted small">Level</div>
                            <div class="fw-medium">Level {{ savePreview.level }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-sm-6">
                        <div class="d-flex align-items-center">
                          <i class="bi bi-calendar3 text-info fs-4 me-2"></i>
                          <div>
                            <div class="text-muted small">Save Date</div>
                            <div class="fw-medium">{{ new Date(savePreview.timestamp).toLocaleDateString() }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p class="mb-0">Are you sure you want to import this save file? This will replace your current
                    progress.</p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="cancelImport">Cancel</button>
                  <button type="button" class="btn btn-primary" @click="confirmImport">Import</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr class="my-4">

        <!-- Delete Section -->
        <div>
          <h6 class="mb-3">Delete Save</h6>
          <p class="text-muted small mb-3">
            Delete all your progress and start fresh. This action cannot be undone unless you have exported your save.
          </p>
          <button @click="deleteSave" class="btn btn-danger">
            <i class="bi bi-trash me-2"></i>
            Delete Save Data
          </button>

          <!-- Delete Confirmation Modal -->
          <div
            v-if="showDeleteConfirm"
            class="modal d-block"
            tabindex="-1"
            style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Confirm Delete</h5>
                </div>
                <div class="modal-body">
                  <p class="text-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Warning: This will permanently delete all your progress!
                  </p>
                  <p>Are you sure you want to delete your save data and start fresh?</p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="cancelDelete">Cancel</button>
                  <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Messages -->
        <div v-if="importError" class="alert alert-danger mt-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ importError }}
        </div>

        <div v-if="importSuccess" class="alert alert-success mt-4" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>
          Operation completed successfully!
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
