
"use client";

import { useMemo, useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { X, Crown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';
import { useBudget } from '@/context/budget-context';
import { Skeleton } from './ui/skeleton';

interface Ad {
    id: string;
    imageUrl: string;
    linkUrl: string;
    page: string; // Comma-separated string
    isActive: boolean;
}

interface AdBannerProps {
    page: string;
    className?: string;
    adIndex?: number;
}

export function AdBanner({ page, className, adIndex }: AdBannerProps) {
    const firestore = useFirestore();
    const router = useRouter();
    const { premiumStatus } = useBudget();
    const [isDismissed, setIsDismissed] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [showHint, setShowHint] = useState(false);

    // Define which pages should use the pop-up/AlertDialog on load
    const popUpPages = ['landing', 'profile', 'premium'];
    const isPopUpAdOnLoad = popUpPages.includes(page);
    
    // Timer state for pop-up ads
    const [showCloseButton, setShowCloseButton] = useState(false);
    
    useEffect(() => {
        if (!isPopUpAdOnLoad || premiumStatus === 'premium') return;

        const openAdTimer = setTimeout(() => {
             setIsAlertOpen(true);
        }, 2000); // 2-second delay before showing the pop-up

        const closeButtonTimer = setTimeout(() => {
            setShowCloseButton(true);
        }, 5000); // 5 seconds before showing close button

        return () => {
            clearTimeout(openAdTimer);
            clearTimeout(closeButtonTimer);
        }
    }, [isPopUpAdOnLoad, premiumStatus, page]);


    const allAdsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'ads'),
            where('isActive', '==', true)
        );
    }, [firestore]);

    const { data: allAds, isLoading } = useCollection<Ad>(allAdsQuery);

    const ad = useMemo(() => {
        if (!allAds || allAds.length === 0) return null;

        const adPool = allAds.filter(ad => 
            ad.page === 'all' || ad.page.split(',').map(p => p.trim()).includes(page)
        );

        if (adPool.length === 0) return null;
        
        if (adIndex !== undefined) {
            return adPool[adIndex % adPool.length];
        } else {
            return adPool[Math.floor(Math.random() * adPool.length)];
        }
    }, [allAds, page, adIndex]);
    
    useEffect(() => {
        if (ad) {
            const interval = setInterval(() => {
                setShowHint(prev => !prev);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [ad]);

    if (premiumStatus === 'premium' || isDismissed || !ad) {
        return null;
    }

    if (isLoading) {
        return isPopUpAdOnLoad ? null : <Skeleton className="h-24 w-full" />;
    }

    const handleDismiss = () => {
        setIsDismissed(true);
        setIsAlertOpen(false);
    };

    const handlePremiumRedirect = () => {
        setIsAlertOpen(false);
        router.push('/premium');
    };
    
    const handleCrossClick = () => {
        setIsAlertOpen(true);
    };

    const AdDialog = (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className='sr-only'>Advertisement Dialog</AlertDialogTitle>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-4">
                        <Crown className="w-12 h-12 text-yellow-500" />
                    </div>
                    <AlertDialogTitle className="text-2xl">বিজ্ঞাপন-মুক্ত অভিজ্ঞতা নিন!</AlertDialogTitle>
                    <AlertDialogDescription>
                        আমাদের অ্যাপের বিজ্ঞাপনমুক্ত অভিজ্ঞতা পেতে এবং ডেভেলপারদের সমর্থন করতে, অনুগ্রহ করে প্রিমিয়াম সাবস্ক্রিপশন নিন।
                    </AlertDialogDescription>
                </div>
            </AlertDialogHeader>
            <AlertDialogFooter className='flex-col sm:flex-row sm:justify-center gap-2'>
                <AlertDialogCancel onClick={() => setIsAlertOpen(false)} className='w-full'>
                    <X className="mr-2 h-4 w-4" />
                    পরে ভাবছি
                </AlertDialogCancel>
                <AlertDialogAction onClick={handlePremiumRedirect} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold">
                    <Crown className="mr-2 h-4 w-4" />
                    প্রিমিয়াম নিন
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    );

    const AdLabel = () => (
        <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full z-10 transition-all duration-300 overflow-hidden whitespace-nowrap">
            বিজ্ঞাপন
            <span className={`transition-all duration-500 ease-in-out ${showHint ? 'opacity-100 translate-x-1' : 'opacity-0 -translate-x-full'}`}>
                : বন্ধ করতে ক্লিক করুন
            </span>
        </span>
    );


    // Render Pop-up Ad on load for specific pages
    if (isPopUpAdOnLoad) {
        return (
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                
                {ad && (
                    <AlertDialogContent>
                         <AlertDialogHeader>
                            <AlertDialogTitle className='sr-only'>Advertisement</AlertDialogTitle>
                        </AlertDialogHeader>
                        <Link href={ad.linkUrl} target="_blank" className="block w-full h-auto" onClick={() => setIsAlertOpen(false)}>
                            <Image
                                src={ad.imageUrl}
                                alt="Advertisement"
                                width={800}
                                height={400}
                                className="w-full h-auto object-contain rounded-lg"
                            />
                        </Link>
                        {showCloseButton && (
                            <AlertDialogFooter className="pt-4">
                                <AlertDialogCancel onClick={() => setIsAlertOpen(false)} className='w-full'>
                                    <X className="mr-2 h-4 w-4" />
                                    বন্ধ করুন
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={handlePremiumRedirect} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold">
                                    <Crown className="mr-2 h-4 w-4" />
                                    বিজ্ঞাপন ছাড়া দেখুন
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        )}
                    </AlertDialogContent>
                )}
            </AlertDialog>
        );
    }
    
    // Render Inline Banner Ad for other pages
    return (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <div className={`relative group ${className}`}>
                <Link href={ad.linkUrl} target="_blank" className="block">
                    <Image
                        src={ad.imageUrl}
                        alt="Advertisement"
                        width={800}
                        height={150}
                        className="w-full h-auto object-cover rounded-lg"
                    />
                </Link>
                 <AdLabel />
                <button 
                    onClick={handleCrossClick}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100 z-10"
                    aria-label="বিজ্ঞাপন বন্ধ করুন"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            {isAlertOpen && AdDialog}
        </AlertDialog>
    );
}
