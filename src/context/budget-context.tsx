
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, setDoc, query, getDocs, writeBatch, increment, arrayUnion, orderBy, Unsubscribe, where, limit, Firestore, getDoc } from 'firebase/firestore';
import { createNotification } from '@/components/app-header';
import { type WithdrawalRequest } from '@/app/withdraw/page';
import { isAfter, addDays, parseISO } from 'date-fns';
import { premiumPlans, type PremiumPlan } from '@/lib/data';

export interface ShopDueEntry {
    date: string;
    amount: number;
    description?: string;
}

export interface Transaction {
    id?: string;
    userId: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description: string;
    createdAt?: any;
}

export interface DebtNote {
    id?: string;
    userId: string;
    type: 'lent' | 'borrowed' | 'shopDue';
    person: string;
    amount: number;
    paidAmount: number;
    status: 'unpaid' | 'partially-paid' | 'paid';
    date: string;
    repaymentDate?: string;
    description?: string;
    createdAt?: any;
    cycleId?: string;
    entries?: ShopDueEntry[];
}

interface UserProfile {
    points?: number;
    joinDate?: string;
    notifiedMilestones?: number[];
    premiumStatus?: 'free' | 'premium';
    premiumPlanId?: string;
    premiumExpiryDate?: any;
    lastAdWatchDate?: string;
    lastSpinDate?: string;
    spinsToday?: number;
}

export interface PremiumSubscription {
    id: string;
    userId: string;
    planId: string;
    status: 'pending' | 'approved' | 'rejected';
    activatedAt?: any;
    expiresAt?: any;
    createdAt: any;
    paymentMethod?: string;
    pointsSpent?: number;
    amountBdt?: number;
}


interface AppConfig {
    minWithdrawalPoints: number;
    referrerBonusPoints: number;
    referredUserBonusPoints: number;
    bdtPer100Points: number;
    adWatchPoints?: number;
    spinPointsOptions?: number[];
    globalPopup?: {
        isEnabled: boolean;
        title: string;
        message: string;
    };
}

export interface AdConfig {
    socialBarScriptUrl: string;
    inlineKey: string;
    squareKey: string;
    leaderboardKey: string;
    spinDirectLink: string;
    rewardedIframeUrl: string;
    tawkToPropertyId?: string;
}

export interface Referral {
    id: string;
    userId: string;
    referredUserId: string;
    referredUserName: string;
    bonusPoints: number;
    createdAt: any;
}

interface CheckInRecord {
    id: string;
    date: string;
    points: number;
    createdAt: any;
    source?: 'daily-check-in' | 'ad-watch' | 'spin';
}

export interface PointHistoryItem {
    type: 'earned' | 'spent' | 'refunded';
    source: string;
    points: number;
    date: Date;
    status?: 'pending' | 'approved' | 'rejected';
}


interface BudgetContextType {
    transactions: Transaction[];
    debtNotes: DebtNote[];
    referrals: Referral[];
    pointHistory: PointHistoryItem[];
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
    addDebtNote: (debtNote: Omit<DebtNote, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
    updateDebtNote: (debtNote: DebtNote, paymentAmount?: number) => Promise<void>;
    totalIncome: number;
    totalExpense: number;
    totalSavings: number;
    rewardPoints: number;
    minWithdrawalPoints: number;
    referrerBonusPoints: number;
    referredUserBonusPoints: number;
    bdtPer100Points: number;
    isLoading: boolean;
    premiumStatus: 'free' | 'premium';
    premiumExpiryDate: Date | null;
    userProfile: UserProfile | null;
    premiumSubscriptions: PremiumSubscription[];
    pendingSubscriptionPlanIds: string[];
    activePremiumPlan: PremiumPlan | null;
    isSubscriptionsLoading: boolean;
    hasUsedFreeTrial: boolean;
    awardPointsForTask: (task: 'ad' | 'spin') => Promise<{ success: boolean; points: number; message: string; }>;
    canWatchAd: boolean;
    remainingSpins: number;
    isTaskLoading: boolean;
    globalPopup: AppConfig['globalPopup'] | null;
    adConfig: AdConfig | null;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const SAVINGS_MILESTONES = [1000, 5000, 10000, 20000, 30000, 40000, 50000, 100000];

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
    const { user, isLoading: isUserLoading } = useUser();
    const firestore = useFirestore();

    const prevReferralsRef = useRef<Referral[]>();
    const [isTaskLoading, setIsTaskLoading] = useState(false);

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);
    
    const { data: userProfile, isLoading: isUserDocLoading } = useDoc<UserProfile>(userDocRef);
    
    const transactionsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/transactions`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: transactionsData, isLoading: areTransactionsLoading } = useCollection<Transaction>(transactionsQuery);
    const transactions = transactionsData ?? [];

    const debtNotesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/debtNotes`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: debtNotesData, isLoading: areDebtNotesLoading } = useCollection<DebtNote>(debtNotesQuery);
    const debtNotes = debtNotesData ?? [];

    const referralsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/referrals`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: referralsData, isLoading: areReferralsLoading } = useCollection<Referral>(referralsQuery);
    const referrals = referralsData ?? [];
    
    const appConfigRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'app_config', 'settings');
    }, [firestore]);
    const { data: appConfig, isLoading: isConfigLoading } = useDoc<AppConfig>(appConfigRef);

    const adConfigRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'app_config', 'ads');
    }, [firestore]);
    const { data: adConfig, isLoading: isAdConfigLoading } = useDoc<AdConfig>(adConfigRef);

    const subscriptionsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/premium_subscriptions`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: premiumSubscriptionsData, isLoading: isSubscriptionsLoading } = useCollection<PremiumSubscription>(subscriptionsQuery);
    const premiumSubscriptions = premiumSubscriptionsData ?? [];
    
    const checkInsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/checkIns`), orderBy("createdAt", "desc"));
    }, [user, firestore]);
    const { data: checkInsData, isLoading: isCheckInsLoading } = useCollection<CheckInRecord>(checkInsQuery);
    const checkIns = checkInsData ?? [];
    
    const withdrawalsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, `users/${user.uid}/withdrawalRequests`), 
            orderBy("requestedAt", "desc")
        );
    }, [user, firestore]);
    const { data: allWithdrawalsData, isLoading: isWithdrawalsLoading } = useCollection<WithdrawalRequest>(withdrawalsQuery);
    const allWithdrawals = allWithdrawalsData ?? [];
    
    // Auto-seed missing configurations for any logged in user if they don't exist
    useEffect(() => {
        if (!user || !firestore) return;

        const seedMissingConfigs = async () => {
            try {
                // Ensure ads config exists
                const adRef = doc(firestore, 'app_config', 'ads');
                const adSnap = await getDoc(adRef);
                if (!adSnap.exists()) {
                    await setDoc(adRef, {
                        socialBarScriptUrl: "https://pl28457235.effectivegatecpm.com/8e/dd/54/8edd54854e77a6161245532c7f56ec4b.js",
                        inlineKey: "3ba7137cf83e3b9991ea29595a11120e",
                        squareKey: "743a0dc9bc3be759b21e51982c52beb6",
                        leaderboardKey: "18077c532637bbe2ddcab04535aa15bf",
                        spinDirectLink: "https://www.effectivegatecpm.com/esdyih69?key=7f8888474725ab0962c50482d2412b06",
                        rewardedIframeUrl: "https://www.effectivegatecpm.com/asn6e88m1?key=f54f7591b556a8df09aa30fadc35caac",
                        tawkToPropertyId: "69cc0cd7ecf7021c366810cd"
                    });
                    console.log("Ads config seeded successfully.");
                }

                // Ensure settings config exists
                const settingsRef = doc(firestore, 'app_config', 'settings');
                const settingsSnap = await getDoc(settingsRef);
                if (!settingsSnap.exists()) {
                    await setDoc(settingsRef, {
                        minWithdrawalPoints: 1000,
                        referrerBonusPoints: 100,
                        referredUserBonusPoints: 50,
                        bdtPer100Points: 5,
                        adWatchPoints: 20,
                        spinPointsOptions: [5, 10, 15, 20, 25, 30, 40, 50],
                        globalPopup: {
                            isEnabled: false,
                            title: "",
                            message: ""
                        }
                    });
                    console.log("Settings config seeded successfully.");
                }
            } catch (error) {
                // Creation might fail if doc already exists or permission denied
                console.error("Config check/seeding status:", error);
            }
        };

        seedMissingConfigs();
    }, [user, firestore]);
    
    // REFRESH REFUND LOGIC: Monitor user's sub-collection for rejections from Console
    useEffect(() => {
        if (!user?.uid || !firestore || !allWithdrawals || allWithdrawals.length === 0 || !userDocRef) return;

        const handleStatusChange = async (req: WithdrawalRequest) => {
            // Only process if status is rejected and not already refunded locally
            if (req.status === 'rejected' && req.isRefunded === false) {
                try {
                    const batch = writeBatch(firestore);
                    const userSubDocRef = doc(firestore, `users/${user.uid}/withdrawalRequests`, req.id);
                    
                    // Mark as refunded locally first to prevent loops
                    batch.update(userSubDocRef, { isRefunded: true, processedAt: serverTimestamp() });
                    // Refund the points to the user profile
                    batch.update(userDocRef, { points: increment(req.points) });

                    await batch.commit();

                    await createNotification({
                        title: 'উইথড্র বাতিল এবং রিফান্ড',
                        description: `আপনার উইথড্র অনুরোধটি বাতিল করা হয়েছে এবং ${req.points} পয়েন্ট ফেরত দেওয়া হয়েছে।`,
                        link: '/withdraw?section=history',
                    }, user.uid, firestore);
                } catch (e) {
                    console.error("Client-side refund failed:", e);
                }
            } else if (req.status === 'approved' && !req.processedAt) {
                // If admin marks as approved in console, just update processing timestamp
                try {
                    const userSubDocRef = doc(firestore, `users/${user.uid}/withdrawalRequests`, req.id);
                    await updateDoc(userSubDocRef, { processedAt: serverTimestamp() });
                    
                    await createNotification({
                        title: 'উইথড্র সফল হয়েছে',
                        description: `আপনার ${req.amountBdt} টাকার উইথড্র অনুরোধটি সম্পন্ন হয়েছে।`,
                        link: '/rewards',
                    }, user.uid, firestore);
                } catch (e) {}
            }
        };

        allWithdrawals.forEach(req => {
            if (req.status !== 'pending' && (!req.processedAt || req.isRefunded === false)) {
                handleStatusChange(req);
            }
        });

    }, [allWithdrawals, user?.uid, firestore, userDocRef]);


     useEffect(() => {
        if (user && firestore && referrals && prevReferralsRef.current && referrals.length > prevReferralsRef.current.length) {
            const newReferrals = referrals.filter(r => !prevReferralsRef.current!.some(pr => pr.id === r.id));
            newReferrals.forEach(newRef => {
                createNotification({
                    id: `new-referral-${newRef.id}`,
                    title: "সফল রেফারেল!",
                    description: `অভিনন্দন! আপনি একটি সফল রেফারেলের জন্য ${newRef.bonusPoints} পয়েন্ট পেয়েছেন।`,
                    link: "/refer",
                }, user.uid, firestore);
            });
        }
        prevReferralsRef.current = referrals;
    }, [referrals, user, firestore]);


    const activateSubscription = useCallback(async (firestore: Firestore, userId: string, subscriptionId: string, planId: string) => {
        const userDocRef = doc(firestore, 'users', userId);
        const plan = premiumPlans.find(p => p.id === planId);
        if (!plan) return;

        const batch = writeBatch(firestore);
        const expiryDate = plan.durationDays ? addDays(new Date(), plan.durationDays) : null;

        batch.update(userDocRef, {
            premiumStatus: 'premium',
            premiumPlanId: plan.id,
            premiumExpiryDate: expiryDate ? expiryDate : null,
        });

        const subRef = doc(firestore, `users/${userId}/premium_subscriptions`, subscriptionId);
        batch.update(subRef, {
            activatedAt: serverTimestamp(),
            expiresAt: expiryDate ? expiryDate : null,
            status: 'approved'
        });

        await batch.commit();

        createNotification({
            id: `premium-activated-${subscriptionId}`,
            title: "সাবস্ক্রিপশন সক্রিয় হয়েছে!",
            description: `আপনার "${plan.title}" প্ল্যানটি সফলভাবে সক্রিয় করা হয়েছে।`,
            link: "/profile",
        }, userId, firestore);
    }, []);

    useEffect(() => {
        if (!user || !firestore) return;
    
        const q = query(
            collection(firestore, `users/${user.uid}/premium_subscriptions`),
            where('status', '==', 'approved')
        );
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docs.forEach(subDoc => {
                const subscriptionData = subDoc.data();
                if (!subscriptionData.activatedAt) {
                    activateSubscription(firestore, user.uid, subDoc.id, subscriptionData.planId)
                        .catch(err => {});
                }
            });
        }, (error) => {
            // Suppress standard auth transition errors
        });
    
        return () => unsubscribe();
    }, [user, firestore, activateSubscription]);
    
    const { premiumStatus, premiumExpiryDate } = useMemo(() => {
        if (!userProfile) return { premiumStatus: 'free', premiumExpiryDate: null };
        const status = userProfile.premiumStatus ?? 'free';
        const expiry = userProfile.premiumExpiryDate?.toDate() ?? null;

        if (status === 'premium' && expiry && isAfter(new Date(), expiry)) {
             if (userDocRef) {
                updateDoc(userDocRef, {
                    premiumStatus: 'free',
                    premiumPlanId: null,
                    premiumExpiryDate: null,
                });
             }
            return { premiumStatus: 'free', premiumExpiryDate: null };
        }
        
        return { premiumStatus: status, premiumExpiryDate: expiry };

    }, [userProfile, userDocRef]);
    
    const pendingSubscriptionPlanIds = useMemo(() => {
        if (!premiumSubscriptions) return [];
        return premiumSubscriptions.filter(s => s.status === 'pending').map(s => s.planId);
    }, [premiumSubscriptions]);

    const activePremiumPlan = useMemo(() => {
        if (premiumStatus !== 'premium' || !userProfile?.premiumPlanId) return null;
        return premiumPlans.find(p => p.id === userProfile.premiumPlanId) || null;
    }, [premiumStatus, userProfile]);

    const hasUsedFreeTrial = useMemo(() => {
        if (!premiumSubscriptions) return false;
        return premiumSubscriptions.some(sub => sub.planId === 'free_trial');
    }, [premiumSubscriptions]);
    
    const minWithdrawalPoints = appConfig?.minWithdrawalPoints ?? 1000;
    const referrerBonusPoints = appConfig?.referrerBonusPoints ?? 100;
    const referredUserBonusPoints = appConfig?.referredUserBonusPoints ?? 50;
    const bdtPer100Points = appConfig?.bdtPer100Points ?? 5;
    const rewardPoints = userProfile?.points ?? 0;
    const globalPopup = appConfig?.globalPopup ?? null;
    
    const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((sum, item) => sum + item.amount, 0), [transactions]);
    const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, item) => sum + item.amount, 0), [transactions]);
    
    const totalSavings = useMemo(() => {
        const deposits = transactions.filter(t => t.type === 'expense' && t.category === 'সঞ্চয় ডিপোজিট').reduce((sum, item) => sum + item.amount, 0);
        const withdrawals = transactions.filter(t => t.type === 'income' && t.category === 'সঞ্চয় উত্তোলন').reduce((sum, item) => sum + item.amount, 0);
        return deposits - withdrawals;
    }, [transactions]);


    useEffect(() => {
        if (totalSavings > 0 && userProfile && user && firestore) {
            const notifiedMilestones = userProfile.notifiedMilestones || [];
            
            SAVINGS_MILESTONES.forEach(milestone => {
                if (totalSavings >= milestone && !notifiedMilestones.includes(milestone)) {
                    createNotification({
                        id: `milestone-${milestone}`,
                        title: "অভিনন্দন! সঞ্চয়ের মাইলফলক অর্জন",
                        description: `আপনি সফলভাবে ${new Intl.NumberFormat("bn-BD").format(milestone)} টাকার সঞ্চয়ের মাইলফলক অর্জন করেছেন!`,
                        link: `/milestone?amount=${milestone}` 
                    }, user.uid, firestore);

                    if (userDocRef) {
                        updateDoc(userDocRef, {
                            notifiedMilestones: arrayUnion(milestone)
                        });
                    }
                }
            });
        }
    }, [totalSavings, userProfile, user, firestore, userDocRef]);
    
    const addDocToCollection = async (collectionName: string, data: any) => {
        if (!user || !firestore) throw new Error("User or firestore not available");
        const collectionRef = collection(firestore, `users/${user.uid}/${collectionName}`);
        await addDoc(collectionRef, {
            ...data,
            userId: user.uid,
            createdAt: serverTimestamp()
        });
    };

    const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
        await addDocToCollection('transactions', transaction);
    }, [user, firestore]);

    const addDebtNote = useCallback(async (debtNote: Omit<DebtNote, 'id' | 'createdAt' | 'userId'>) => {
        if (!user || !firestore) return;

        if (debtNote.type === 'shopDue') {
            const getCycleId = (dateStr: string) => {
                const d = new Date(dateStr);
                let year = d.getFullYear();
                let month = d.getMonth();
                if (d.getDate() < 6) {
                    month -= 1;
                    if (month < 0) {
                        month = 11;
                        year -= 1;
                    }
                }
                return `${year}-${String(month + 1).padStart(2, '0')}`;
            };

            const cycleId = getCycleId(debtNote.date);
            const shopName = debtNote.person;
            const newEntryAmount = debtNote.amount;
            const newEntryDescription = debtNote.description;

            const q = query(
                collection(firestore, `users/${user.uid}/debtNotes`),
                where('type', '==', 'shopDue'),
                where('person', '==', shopName),
                where('cycleId', '==', cycleId),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docToUpdate = querySnapshot.docs[0];
                const docRef = docToUpdate.ref;

                const newEntry: ShopDueEntry = {
                    date: debtNote.date,
                    amount: newEntryAmount,
                    description: newEntryDescription,
                };

                await updateDoc(docRef, {
                    amount: increment(newEntryAmount),
                    entries: arrayUnion(newEntry)
                });
            } else {
                const cycleStartDate = new Date(cycleId + '-06');
                const newEntry: ShopDueEntry = {
                    date: debtNote.date,
                    amount: newEntryAmount,
                    description: newEntryDescription,
                };

                const newShopDueDoc: Omit<DebtNote, 'id' | 'createdAt' | 'userId'> = {
                    person: shopName,
                    type: 'shopDue',
                    cycleId: cycleId,
                    amount: newEntryAmount,
                    paidAmount: 0,
                    status: 'unpaid',
                    date: cycleStartDate.toISOString(),
                    entries: [newEntry]
                };
                await addDocToCollection('debtNotes', newShopDueDoc);
            }
        } else {
            await addDocToCollection('debtNotes', debtNote);
        }
    }, [user, firestore]);


    const updateDebtNote = useCallback(async (debtNote: DebtNote, paymentAmount?: number) => {
        if (!user || !firestore || !debtNote.id) return;
    
        const batch = writeBatch(firestore);
        const docRef = doc(firestore, `users/${user.uid}/debtNotes`, debtNote.id);
        
        batch.update(docRef, { paidAmount: debtNote.paidAmount, status: debtNote.status });
        
        if (paymentAmount && paymentAmount > 0) {
            const transactionCollectionRef = collection(firestore, `users/${user.uid}/transactions`);
            const transactionDocRef = doc(transactionCollectionRef);
            
            const transactionData: Omit<Transaction, 'id' | 'createdAt'> = {
                userId: user.uid,
                type: debtNote.type === 'lent' ? 'income' : 'expense',
                category: debtNote.type === 'shopDue' ? 'দোকান বাকি পরিশোধ' : (debtNote.type === 'lent' ? 'ধার ফেরত' : 'ধার পরিশোধ'),
                amount: paymentAmount,
                date: new Date().toISOString(),
                description: `${debtNote.person} ${debtNote.type === 'lent' ? 'থেকে প্রাপ্তি' : 'কে পরিশোধ'}`,
            };
        
            batch.set(transactionDocRef, {...transactionData, createdAt: serverTimestamp()});
        }
        
        await batch.commit();
    }, [user, firestore]);
    
    const pointHistory = useMemo((): PointHistoryItem[] => {
        const history: PointHistoryItem[] = [];

        if (checkIns) {
            checkIns.forEach(ci => {
                let sourceText = 'অজানা উৎস';
                switch (ci.source) {
                    case 'daily-check-in': sourceText = 'দৈনিক চেক-ইন'; break;
                    case 'ad-watch': sourceText = 'বিজ্ঞাপন দেখা'; break;
                    case 'spin': sourceText = 'চাকা ঘোরানো'; break;
                }
                history.push({
                    type: 'earned',
                    source: sourceText,
                    points: ci.points,
                    date: ci.createdAt ? ci.createdAt.toDate() : parseISO(ci.date)
                });
            });
        }

        if (referrals) {
            referrals.forEach(ref => {
                 if (ref.createdAt) {
                    history.push({
                        type: 'earned',
                        source: 'রেফারেল বোনাস',
                        points: ref.bonusPoints,
                        date: ref.createdAt.toDate(),
                    });
                }
            })
        }
        
        if (premiumSubscriptions) {
            premiumSubscriptions.forEach(sub => {
                if (sub.createdAt && sub.paymentMethod === 'points' && sub.pointsSpent) {
                    history.push({
                        type: 'spent',
                        source: 'সাবস্ক্রিপশন ক্রয়',
                        points: sub.pointsSpent,
                        date: sub.createdAt.toDate(),
                        status: sub.status
                    });
                }
            });
        }

        if (allWithdrawals) {
            allWithdrawals.forEach(wd => {
                if (wd.requestedAt) {
                    history.push({
                        type: 'spent',
                        source: 'পয়েন্ট উইথড্র',
                        points: wd.points,
                        date: wd.requestedAt.toDate(),
                        status: wd.status,
                    });
                }
                
                if (wd.status === 'rejected' && wd.isRefunded && wd.processedAt) {
                    history.push({
                        type: 'refunded',
                        source: 'পয়েন্ট রিফান্ড',
                        points: wd.points,
                        date: wd.processedAt.toDate(),
                        status: 'approved'
                    });
                }
            });
        }
        
        return history.sort((a, b) => b.date.getTime() - a.date.getTime());

    }, [checkIns, allWithdrawals, referrals, premiumSubscriptions]);
    
    const canWatchAd = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return userProfile?.lastAdWatchDate !== today;
    }, [userProfile]);

    const remainingSpins = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        if (userProfile?.lastSpinDate !== today) {
            return 2;
        }
        return Math.max(0, 2 - (userProfile?.spinsToday || 0));
    }, [userProfile]);

    const awardPointsForTask = useCallback(async (task: 'ad' | 'spin'): Promise<{ success: boolean; points: number; message: string; }> => {
        if (!user || !userDocRef || !firestore) {
            return { success: false, points: 0, message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" };
        }
        setIsTaskLoading(true);

        try {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const currentUserProfile = (await getDoc(userDocRef)).data() as UserProfile;
            
            const batch = writeBatch(firestore);
            const checkInRef = doc(collection(firestore, `users/${user.uid}/checkIns`));

            
            if (task === 'ad') {
                if (currentUserProfile.lastAdWatchDate === todayStr) {
                    setIsTaskLoading(false);
                    return { success: false, points: 0, message: "আপনি আজকের জন্য ইতিমধ্যে বিজ্ঞাপন দেখেছেন।" };
                }
                const points = appConfig?.adWatchPoints ?? 20;
                batch.update(userDocRef, {
                    points: increment(points),
                    lastAdWatchDate: todayStr
                });
                batch.set(checkInRef, {
                    userId: user.uid,
                    source: 'ad-watch',
                    points: points,
                    date: today.toISOString(),
                    createdAt: serverTimestamp(),
                });


                await batch.commit();
                setIsTaskLoading(false);
                return { success: true, points, message: "সফল!" };
            }

            if (task === 'spin') {
                const currentSpins = currentUserProfile.lastSpinDate === todayStr ? currentUserProfile.spinsToday || 0 : 0;
                if (currentSpins >= 2) {
                    setIsTaskLoading(false);
                    return { success: false, points: 0, message: "আপনি আজকের জন্য আপনার সমস্ত স্পিন ব্যবহার করেছেন।" };
                }
                
                let spinOptions = appConfig?.spinPointsOptions || [5, 10, 15, 20, 25, 30, 40, 50];
                const points = spinOptions[Math.floor(Math.random() * spinOptions.length)];
                
                const updateData: any = {
                    points: increment(points),
                    lastSpinDate: todayStr,
                };
            
                if (currentUserProfile.lastSpinDate === todayStr) {
                    updateData.spinsToday = increment(1);
                } else {
                    updateData.spinsToday = 1;
                }
            
                batch.update(userDocRef, updateData);
                batch.set(checkInRef, {
                    userId: user.uid,
                    source: 'spin',
                    points: points,
                    date: today.toISOString(),
                    createdAt: serverTimestamp(),
                });


                await batch.commit();
                setIsTaskLoading(false);
                return { success: true, points, message: "সফল!" };
            }

            setIsTaskLoading(false);
            return { success: false, points: 0, message: "অজানা টাস্ক।" };
        } catch (error) {
            console.error("Error awarding points:", error);
            setIsTaskLoading(false);
            return { success: false, points: 0, message: "একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" };
        }
    }, [user, userDocRef, firestore, appConfig]);


    const isLoading = isUserLoading || isUserDocLoading || areTransactionsLoading || areDebtNotesLoading || isConfigLoading || isSubscriptionsLoading || isCheckInsLoading || areReferralsLoading || isWithdrawalsLoading || isAdConfigLoading;

    const contextValue = useMemo(() => ({
        transactions, 
        debtNotes,
        referrals,
        pointHistory,
        addTransaction, 
        addDebtNote, 
        updateDebtNote, 
        totalIncome, 
        totalExpense, 
        totalSavings, 
        rewardPoints,
        minWithdrawalPoints,
        referrerBonusPoints,
        referredUserBonusPoints,
        bdtPer100Points,
        isLoading,
        premiumStatus,
        premiumExpiryDate,
        userProfile,
        premiumSubscriptions,
        pendingSubscriptionPlanIds,
        activePremiumPlan,
        isSubscriptionsLoading,
        hasUsedFreeTrial,
        awardPointsForTask,
        canWatchAd,
        remainingSpins,
        isTaskLoading,
        globalPopup,
        adConfig,
    }), [
        transactions, debtNotes, referrals, pointHistory,
        totalIncome, totalExpense, totalSavings,
        rewardPoints, minWithdrawalPoints, referrerBonusPoints, referredUserBonusPoints, bdtPer100Points,
        isLoading, premiumStatus, premiumExpiryDate, userProfile, premiumSubscriptions, 
        pendingSubscriptionPlanIds, activePremiumPlan, isSubscriptionsLoading, hasUsedFreeTrial,
        addTransaction, addDebtNote, updateDebtNote, awardPointsForTask, canWatchAd, remainingSpins, isTaskLoading,
        globalPopup, adConfig,
    ]);


    return (
        <BudgetContext.Provider value={contextValue}>
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudget = () => {
    const context = useContext(BudgetContext);
    if (context === undefined) {
        throw new Error('useBudget must be used within a BudgetProvider');
    }
    return context;
};
