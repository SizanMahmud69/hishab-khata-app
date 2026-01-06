

// This file is now deprecated as Debt and ShopDue are combined into DebtNote in budget-context.
// Keeping it for categories and other static data.

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

export interface PremiumPlan {
    id: string;
    title: string;
    price: number;
    currency: string;
    period: string;
    description: string;
    bonusText?: string;
    isBestValue: boolean;
    sortOrder: number;
    isActive: boolean;
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

export const expenseCategories = ['খাবার', 'বাজার', 'যাতায়াত', 'শপিং', 'পারিবারিক', 'বিল', 'বাড়ি ভাড়া', 'স্বাস্থ্য', 'সঞ্চয় ডিপোজিট', 'প্রয়োজনীয় জিনিস', 'অন্যান্য'];
export const incomeSources = ['মাসিক বেতন', 'ফ্রিল্যান্সিং', 'ব্যবসা', 'সঞ্চয় উত্তোলন', 'ধার গ্রহণ', 'অন্যান্য'];
export const savingsDestinations = ['ব্যাংক', 'বিকাশ', 'রকেট', 'নগদ'];
export const paymentMethods = ['বিকাশ', 'নগদ', 'রকেট'];

export const premiumPlans: PremiumPlan[] = [
    {
        id: "monthly_plan",
        title: "মাসিক প্ল্যান",
        price: 50,
        currency: "৳",
        period: "/মাস",
        description: "যেকোনো সময় বাতিল করুন।",
        isBestValue: false,
        sortOrder: 1,
        isActive: true
    },
    {
        id: "yearly_plan",
        title: "বাৎসরিক প্ল্যান",
        price: 500,
        currency: "৳",
        period: "/বছর",
        description: "মাসিক প্ল্যানের চেয়ে ২০% সাশ্রয়ী।",
        bonusText: "২ মাস ফ্রি!",
        isBestValue: true,
        sortOrder: 2,
        isActive: true
    }
];
