

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
    price: number | string;
    currency: string;
    period: string;
    description: string;
    bonusText?: string;
    isBestValue: boolean;
    sortOrder: number;
    isActive: boolean;
    points?: number;
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
        id: "free_trial",
        title: "ফ্রি ট্রায়াল",
        price: 0,
        currency: "৳",
        period: "/৩ দিন",
        description: "আমাদের সমস্ত প্রিমিয়াম ফিচার বিনামূল্যে تجربه করুন।",
        isBestValue: false,
        sortOrder: 1,
        isActive: true,
        points: 0,
    },
    {
        id: "weekly_plan",
        title: "সাপ্তাহিক প্ল্যান",
        price: 25,
        currency: "৳",
        period: "/সপ্তাহ",
        description: "স্বল্প সময়ের জন্য প্রিমিয়াম সুবিধা নিন।",
        isBestValue: false,
        sortOrder: 2,
        isActive: true,
        points: 250,
    },
    {
        id: "monthly_plan",
        title: "মাসিক প্ল্যান",
        price: 90,
        currency: "৳",
        period: "/মাস",
        description: "সবচেয়ে জনপ্রিয় প্ল্যান, যেকোনো সময় বাতিল করুন।",
        isBestValue: false,
        sortOrder: 3,
        isActive: true,
        points: 900,
    },
     {
        id: "3_monthly_plan",
        title: "৩-মাসিক প্ল্যান",
        price: 250,
        currency: "৳",
        period: "/৩ মাস",
        description: "মাসিক প্ল্যানের চেয়ে বেশি সাশ্রয়ী।",
        bonusText: "১০% সাশ্রয়",
        isBestValue: false,
        sortOrder: 4,
        isActive: true,
        points: 2500,
    },
     {
        id: "6_monthly_plan",
        title: "৬-মাসিক প্ল্যান",
        price: 450,
        currency: "৳",
        period: "/৬ মাস",
        description: "দীর্ঘমেয়াদী ব্যবহারের জন্য দারুণ একটি প্ল্যান।",
        bonusText: "১ মাস ফ্রি!",
        isBestValue: false,
        sortOrder: 5,
        isActive: true,
        points: 4500,
    },
    {
        id: "yearly_plan",
        title: "বাৎসরিক প্ল্যান",
        price: 800,
        currency: "৳",
        period: "/বছর",
        description: "মাসিক প্ল্যানের চেয়ে অনেক বেশি সাশ্রয়ী।",
        bonusText: "প্রায় ৪ মাস ফ্রি!",
        isBestValue: true,
        sortOrder: 6,
        isActive: true,
        points: 8000,
    },
    {
        id: "3_yearly_plan",
        title: "৩-বছর প্ল্যান",
        price: 2000,
        currency: "৳",
        period: "/৩ বছর",
        description: "দীর্ঘমেয়াদী সর্বোচ্চ সাশ্রয়ী প্ল্যান।",
        bonusText: "Best Value!",
        isBestValue: true,
        sortOrder: 7,
        isActive: true,
        points: 20000,
    },
    {
        id: "lifetime_plan",
        title: "লাইফটাইম",
        price: 5000,
        currency: "৳",
        period: "",
        description: "একবার কিনুন, আজীবন ব্যবহার করুন।",
        isBestValue: false,
        sortOrder: 8,
        isActive: true,
        points: 50000,
    }
];
