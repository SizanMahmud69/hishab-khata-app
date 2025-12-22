
export interface Debt {
  id: string;
  person: string;
  amount: number;
  paidAmount: number;
  type: 'lent' | 'borrowed';
  date: string;
  repaymentDate?: string;
  description?: string;
  status: 'unpaid' | 'paid' | 'partially-paid';
}

export interface ShopDue {
  id: string;
  shopName: string;
  amount: number;
  paidAmount: number;
  date: string;
  description?: string;
  status: 'unpaid' | 'paid' | 'partially-paid';
}

export const overviewChartData = [
  { name: 'Jan', income: 0, expense: 0 },
  { name: 'Feb', income: 0, expense: 0 },
  { name: 'Mar', income: 0, expense: 0 },
  { name: 'Apr', income: 0, expense: 0 },
  { name: 'May', income: 0, expense: 0 },
  { name: 'Jun', income: 0, expense: 0 },
  { name: 'Jul', income: 0, expense: 0 },
];

export const expenseCategories = ['খাবার', 'বাজার', 'যাতায়াত', 'শপিং', 'বিনোদন', 'বিল', 'স্বাস্থ্য', 'সঞ্চয় ডিপোজিট', 'ধার প্রদান', 'অন্যান্য'];
export const incomeSources = ['মাসিক বেতন', 'ফ্রিল্যান্সিং', 'ব্যবসা', 'সঞ্চয় উত্তোলন', 'ধার গ্রহণ', 'অন্যান্য'];
