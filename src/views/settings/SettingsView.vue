<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SavePreview } from '@/types/SavePreview';
import UsernameSettings from '@/views/settings/UsernameSettings.vue';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import { useUserStore } from '@/stores/userStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { useBlackjackStore } from '@/stores/blackjackStore';
import { useClickerStore } from '@/stores/clickerStore';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';
import { useTransactionStore } from '@/stores/transactionStore';
import { useRouletteStore } from '@/stores/rouletteStore';
import gameSaveUtil from '@/utils/gameSaveUtil';

// i18n
const { t, locale } = useI18n();

const availableLocales = ['en-GB', 'hu-HU'] as const;

watch(locale, (newLocale) => {
  localStorage.setItem('userLocale', newLocale);
});

// Stores
const userStore = useUserStore();
const achievementStore = useAchievementStore();
const blackjackStore = useBlackjackStore();
const clickerStore = useClickerStore();
const transactionsStore = useTransactionStore();
const rouletteStore = useRouletteStore();

// UI state
const importError = ref('');
const importSuccess = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const savePreview = ref<SavePreview | null>(null);
const showImportConfirm = ref(false);
const showDeleteConfirm = ref(false);
const pendingImportData = ref<string | null>(null);

const exportSave = async () => {
  try {
    const saveData = await gameSaveUtil.getCurrentGameState();
    const serialized = await gameSaveUtil.exportSave(saveData);
    const blob = await gameSaveUtil.createDownloadBlob(serialized);

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
    importError.value = t('settings.localSave.import.noFileSelected');
    return;
  }

  try {
    const text = await file.text();
    const saveData = await gameSaveUtil.importSave(text);
    savePreview.value = gameSaveUtil.extractSavePreview(saveData);
    pendingImportData.value = text;
    showImportConfirm.value = true;
  } catch (error) {
    console.error('Failed to read save file:', error);
    importError.value = error instanceof Error ? error.message : t('settings.localSave.import.readError');
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

    const saveData = await gameSaveUtil.importSave(pendingImportData.value);

    // Apply the saved states to all stores
    userStore.$patch(saveData.user);
    achievementStore.$patch(saveData.achievements);
    blackjackStore.$patch(saveData.blackjack);
    clickerStore.$patch(saveData.clicker);
    await transactionsStore.replaceTransactions(saveData.transactions?.transactions ?? []);
    rouletteStore.$patch(saveData.roulette);

    showSuccess();
  } catch (error) {
    console.error('Failed to import save:', error);
    importError.value = error instanceof Error ? error.message : t('settings.localSave.import.importFailed');
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

const confirmDelete = async () => {
  clickerStore.reset();
  clickerStore.stopAutoClicker();
  await transactionsStore.clearTransactions();
  localStorage.clear();
  window.location.reload();
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
};
</script>

<template>
  <BaseLayout :title="t('settings.title')" bootstrapIcon="gear-fill" :show-balance="false">
    <UsernameSettings />


    <div class="card mb-4">
      <div class="card-body">
        <h2 class="card-title d-flex align-items-center mb-3 section-title">
          <i class="bi bi-translate me-2" aria-hidden="true"></i>
          {{ t('settings.language.title') }}
        </h2>
        <label class="form-label" for="language-select">{{ t('settings.language.label') }}</label>
        <select id="language-select" class="form-select" style="max-width: 20rem;" v-model="locale">
          <option v-for="loc in availableLocales" :key="loc" :value="loc">
            {{ t(`languages.${loc}`) }}
          </option>
        </select>
      </div>
    </div>


    <div class="card">
      <div class="card-body">
        <h2 class="card-title d-flex align-items-center mb-4 section-title">
          <i class="bi bi-save me-2" aria-hidden="true"></i>
          {{ t('settings.localSave.title') }}
        </h2>

        
        <div class="mb-4">
          <h3 class="mb-3 subsection-title">{{ t('settings.localSave.export.title') }}</h3>
          <p class="text-muted small mb-3">
            {{ t('settings.localSave.export.description') }}
          </p>
          <button @click="exportSave" class="btn btn-primary">
            <i class="bi bi-download me-2" aria-hidden="true"></i>
            {{ t('settings.localSave.export.button') }}
          </button>
        </div>

        <hr class="my-4">

        
        <div class="mb-4">
          <h3 class="mb-3 subsection-title">{{ t('settings.localSave.import.title') }}</h3>
          <p class="text-muted small mb-3">
            {{ t('settings.localSave.import.description') }}
          </p>

          <div class="mb-3">
            <label class="form-label" for="save-file">
              {{ t('settings.localSave.import.title') }}
            </label>
            <input
              id="save-file"
              type="file"
              class="form-control"
              accept=".save"
              @change="handleFileSelect"
              ref="fileInput">
          </div>

          
          <div
            v-if="showImportConfirm"
            class="modal d-block"
            tabindex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-save-title"
            style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h3 class="modal-title section-title" id="import-save-title">
                    {{ t('settings.localSave.import.confirmTitle') }}
                  </h3>
                </div>
                <div class="modal-body">
                  <div
                    class="save-preview bg-white border p-3 rounded mb-3"
                    v-if="savePreview">
                    <h4 class="mb-3 subsection-title">{{ t('settings.localSave.import.preview.title') }}</h4>
                    <div class="row g-3">
                      <div class="col-sm-6">
                        <div class="d-flex align-items-center">
                          <i class="bi bi-person-circle text-primary fs-4 me-2" aria-hidden="true"></i>
                          <div>
                            <div class="text-muted small">{{ t('settings.localSave.import.preview.username') }}</div>
                            <div class="fw-medium">{{ savePreview.username ||
                              t('settings.localSave.import.preview.notSet') }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-sm-6">
                        <div class="d-flex align-items-center">
                          <i class="bi bi-wallet2 text-success fs-4 me-2" aria-hidden="true"></i>
                          <div>
                            <div class="text-muted small">{{ t('settings.localSave.import.preview.balance') }}</div>
                            <div class="fw-medium">{{ formatIntAsCurrency(savePreview.balance) }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-sm-6">
                        <div class="d-flex align-items-center">
                          <i class="bi bi-stars text-warning fs-4 me-2" aria-hidden="true"></i>
                          <div>
                            <div class="text-muted small">{{ t('settings.localSave.import.preview.level') }}</div>
                            <div class="fw-medium">{{ t('settings.localSave.import.preview.level') }} {{
                              savePreview.level }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-sm-6">
                        <div class="d-flex align-items-center">
                          <i class="bi bi-calendar3 text-info fs-4 me-2" aria-hidden="true"></i>
                          <div>
                            <div class="text-muted small">{{ t('settings.localSave.import.preview.saveDate') }}</div>
                            <div class="fw-medium">{{ new Date(savePreview.timestamp).toLocaleDateString() }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p class="mb-0">{{ t('settings.localSave.import.confirmMessage') }}</p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="cancelImport">
                    {{
                    t('settings.localSave.import.cancel') }}</button>
                  <button type="button" class="btn btn-primary" @click="confirmImport">
                    {{
                    t('settings.localSave.import.confirm') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr class="my-4">

        
        <div>
          <h3 class="mb-3 subsection-title">{{ t('settings.localSave.delete.title') }}</h3>
          <p class="text-muted small mb-3">
            {{ t('settings.localSave.delete.description') }}
          </p>
          <button @click="deleteSave" class="btn btn-danger">
            <i class="bi bi-trash me-2" aria-hidden="true"></i>
            {{ t('settings.localSave.delete.button') }}
          </button>

          
          <div
            v-if="showDeleteConfirm"
            class="modal d-block"
            tabindex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-save-title"
            style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h3 class="modal-title section-title" id="delete-save-title">
                    {{ t('settings.localSave.delete.confirmTitle') }}
                  </h3>
                </div>
                <div class="modal-body">
                  <p class="text-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
                    {{ t('settings.localSave.delete.warning') }}
                  </p>
                  <p>{{ t('settings.localSave.delete.confirmMessage') }}</p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="cancelDelete">
                    {{
                    t('settings.localSave.delete.cancel') }}</button>
                  <button type="button" class="btn btn-danger" @click="confirmDelete">
                    {{
                    t('settings.localSave.delete.confirm') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div v-if="importError" class="alert alert-danger mt-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
          {{ importError }}
        </div>

        <div v-if="importSuccess" class="alert alert-success mt-4" role="alert">
          <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
          {{ t('settings.messages.operationSuccess') }}
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
