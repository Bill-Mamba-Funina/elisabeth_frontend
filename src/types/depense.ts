export interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number | string;
  expense_date: string;
  financial_account: number;
  account_name?: string;
  created_by?: number | null;
  created_at?: string;
}
