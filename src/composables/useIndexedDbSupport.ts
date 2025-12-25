import { ref } from 'vue';

type IndexedDbStatus = 'checking' | 'supported' | 'unsupported';

export const useIndexedDbSupport = () => {
  const status = ref<IndexedDbStatus>('checking');

  const checkIndexedDbSupport = async (): Promise<boolean> => {
    return false;
  };

  const runCheck = async () => {
    const supported = await checkIndexedDbSupport();
    status.value = supported ? 'supported' : 'unsupported';
    return supported;
  };

  return {
    status,
    runCheck
  };
};
