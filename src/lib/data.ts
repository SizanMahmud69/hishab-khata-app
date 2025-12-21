export const monthlyIncome = [
  { source: 'মাসিক বেতন', amount: 50000, date: '2024-07-01' },
  { source: 'ফ্রিল্যান্সিং প্রকল্প', amount: 15000, date: '2024-07-15' },
];

export const dailyExpenses = [
  { id: 1, date: '2024-07-28', category: 'খাবার', amount: 350, description: 'দুপুরের খাবার' },
  { id: 2, date: '2024-07-28', category: 'যাতায়াত', amount: 100, description: 'অফিস যাতায়াত' },
  { id: 3, date: '2024-07-27', category: 'শপিং', amount: 2500, description: 'মাসের বাজার' },
  { id: 4, date: '2024-07-26', category: 'বিনোদন', amount: 1200, description: 'সিনেমা দেখা' },
  { id: 5, date: '2024-07-25', category: 'বিল', amount: 800, description: 'ইন্টারনেট বিল' },
  { id: 6, date: '2024-07-24', category: 'খাবার', amount: 250, description: 'সকালের নাস্তা' },
];

export const savingsTransactions = [
    { id: 1, date: '2024-07-20', description: 'মাসিক সঞ্চয়', amount: 5000 },
    { id: 2, date: '2024-06-20', description: 'বোনাস থেকে সঞ্চয়', amount: 10000 },
]

export const budgets = [
  { category: 'খাবার', budget: 10000, spent: 4500 },
  { category: 'যাতায়াত', budget: 5000, spent: 2100 },
  { category: 'শপিং', budget: 8000, spent: 7500 },
  { category: 'বিনোদন', budget: 3000, spent: 1800 },
];

export const debts = [
    { id: 1, person: 'সোহেল', amount: 2000, type: 'lent', date: '2024-07-10', status: 'unpaid' },
    { id: 2, person: 'রাকিব', amount: 5000, type: 'borrowed', date: '2024-07-05', status: 'paid' },
    { id: 3, person: 'নাসরিন', amount: 1500, type: 'borrowed', date: '2024-07-20', status: 'unpaid' },
    { id: 4, person: 'আরিফ', amount: 3000, type: 'lent', date: '2024-06-25', status: 'unpaid' },
];

export const overviewChartData = [
  { name: 'Jan', income: 65000, expense: 40000 },
  { name: 'Feb', income: 65000, expense: 42000 },
  { name: 'Mar', income: 68000, expense: 38000 },
  { name: 'Apr', income: 70000, expense: 45000 },
  { name: 'May', income: 65000, expense: 41000 },
  { name: 'Jun', income: 72000, expense: 50000 },
  { name: 'Jul', income: 65000, expense: 32250 },
];

export const expenseCategories = ['খাবার', 'যাতায়াত', 'শপিং', 'বিনোদন', 'বিল', 'স্বাস্থ্য', 'অন্যান্য'];
export const incomeSources = ['মাসিক বেতন', 'ফ্রিল্যান্সিং', 'ব্যবসা', 'অন্যান্য'];
