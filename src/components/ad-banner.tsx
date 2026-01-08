
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
    page: string; // Now a comma-separated string
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
    const [showCloseButton, setShowCloseButton] = useState(false);
    const [adLabelText, setAdLabelText] = useState("বিজ্ঞাপন");

    useEffect(() => {
        const closeButtonTimer = setTimeout(() => {
            setShowCloseButton(true);
        }, 5000); // 5 seconds

        return () => {
            clearTimeout(closeButtonTimer);
        };
    }, []);


    const allAdsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Fetch all active ads, filtering will be done client-side
        return query(
            collection(firestore, 'ads'),
            where('isActive', '==', true)
        );
    }, [firestore]);

    const { data: allAds, isLoading } = useCollection<Ad>(allAdsQuery);

    const ad = useMemo(() => {
        if (!allAds || allAds.length === 0) return null;

        // Client-side filtering
        const adPool = allAds.filter(ad => 
            ad.page === 'all' || ad.page.split(',').map(p => p.trim()).includes(page)
        );

        if (adPool.length === 0) return null;
        
        // Show the ad after a delay to not be too intrusive
        setTimeout(() => setIsAlertOpen(true), 2000);

        if (adIndex !== undefined) {
             // Sequential selection based on the pool for the current page
            return adPool[adIndex % adPool.length];
        } else {
            // Randomly select an ad from the filtered pool
            return adPool[Math.floor(Math.random() * adPool.length)];
        }
    }, [allAds, page, adIndex]);
    
    if (premiumStatus === 'premium') {
        return null;
    }
    
    if (isLoading) {
        // Don't show a skeleton for a pop-up
        return null;
    }

    if (!ad || isDismissed) {
        return null;
    }

    const handleDismiss = () => {
        setIsAlertOpen(false);
        setIsDismissed(true); // Don't show again in this session
    };
    
    const handleActionClick = () => {
        router.push(ad.linkUrl);
        handleDismiss();
    }


    const handlePremiumRedirect = () => {
        router.push('/premium');
        setIsAlertOpen(false);
    }

    return (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent className="overflow-hidden p-0 max-w-sm">
                 <div className="relative">
                     <Image
                        src={ad.imageUrl}
                        alt="Advertisement"
                        width={400}
                        height={400}
                        className="object-cover w-full h-auto"
                    />
                     <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full z-10 transition-all duration-500 whitespace-nowrap">
                        {adLabelText}
                    </span>
                     {showCloseButton && (
                        <button 
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full transition-opacity z-10"
                            aria-label="বিজ্ঞাপন বন্ধ করুন"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                 </div>
                <AlertDialogHeader className="p-6 text-center">
                    <AlertDialogTitle className="text-xl">বিজ্ঞাপন-মুক্ত অভিজ্ঞতা নিন!</AlertDialogTitle>
                    <AlertDialogDescription>
                        আমাদের অ্যাপের বিজ্ঞাপনমুক্ত অভিজ্ঞতা পেতে এবং ডেভেলপারদের সমর্থন করতে, অনুগ্রহ করে প্রিমিয়াম সাবস্ক্রিপশন নিন।
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className='px-6 pb-6 pt-0 bg-transparent flex sm:flex-row sm:justify-center gap-2'>
                    <AlertDialogCancel onClick={handleDismiss} className='w-full'>বাতিল</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePremiumRedirect} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold">প্রিমিয়াম নিন</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

    
