import type { Transaction } from '@/types/Transaction';

export type TransactionFilters = {
  game?: Transaction['game'] | 'all';
  type?: Transaction['type'] | 'all';
};

export type TransactionQuery = Required<TransactionFilters> & {
  page: number;
  pageSize: number;
};
