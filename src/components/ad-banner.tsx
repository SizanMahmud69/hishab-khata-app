
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
    const [adLabel, setAdLabel] = useState('বিজ্ঞাপন');

    // Define which pages should use the pop-up/AlertDialog on load
    const popUpPages = ['landing', 'profile', 'premium'];
    const isPopUpAdOnLoad = popUpPages.includes(page);
    
    // Timer state for pop-up ads
    const [showCloseButton, setShowCloseButton] = useState(false);
    useEffect(() => {
        if (!isPopUpAdOnLoad) return;
        const closeButtonTimer = setTimeout(() => {
            setShowCloseButton(true);
        }, 5000); // 5 seconds
        return () => clearTimeout(closeButtonTimer);
    }, [isPopUpAdOnLoad]);


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
        
        // For pop-up ads on load, set a delay before showing
        if (isPopUpAdOnLoad) {
             setTimeout(() => setIsAlertOpen(true), 2000);
        }
        
        if (adIndex !== undefined) {
            return adPool[adIndex % adPool.length];
        } else {
            return adPool[Math.floor(Math.random() * adPool.length)];
        }
    }, [allAds, page, adIndex, isPopUpAdOnLoad]);
    
    useEffect(() => {
        if (ad) {
            const timer = setTimeout(() => {
                setAdLabel('বিজ্ঞাপনটি বন্ধ করতে ক্লিক করুন');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [ad]);

    if (premiumStatus === 'premium' || isDismissed || !ad) {
        return null;
    }

    if (isLoading) {
        return isPopUpAdOnLoad ? null : <Skeleton className="h-24 w-full" />;
    }

    const handleDismiss = () => {
        setIsAlertOpen(false);
        setIsDismissed(true); // Don't show again in this session
    };

    const handlePremiumRedirect = () => {
        setIsAlertOpen(false);
        router.push('/premium');
    };
    
    const handleCrossClick = () => {
        setIsAlertOpen(true);
    };

    const AdDialog = (
        <AlertDialogContent className="overflow-hidden p-0 max-w-sm">
            <AlertDialogHeader className="p-6 text-center">
                <AlertDialogTitle className="text-xl">বিজ্ঞাপন-মুক্ত অভিজ্ঞতা নিন!</AlertDialogTitle>
                <AlertDialogDescription>
                    আমাদের অ্যাপের বিজ্ঞাপনমুক্ত অভিজ্ঞতা পেতে এবং ডেভেলপারদের সমর্থন করতে, অনুগ্রহ করে প্রিমিয়াম সাবস্ক্রিপশন নিন।
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='px-6 pb-6 pt-0 bg-transparent flex sm:flex-row sm:justify-center gap-2'>
                <AlertDialogCancel onClick={handleDismiss} className='w-full'>পরে ভাবছি</AlertDialogCancel>
                <AlertDialogAction onClick={handlePremiumRedirect} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold">প্রিমিয়াম নিন</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    );

    // Render Pop-up Ad on load for specific pages
    if (isPopUpAdOnLoad) {
        return (
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent className="overflow-hidden p-0 max-w-sm">
                    <div className="relative">
                        <Link href={ad.linkUrl} target="_blank" onClick={() => setIsAlertOpen(false)}>
                            <Image
                                src={ad.imageUrl}
                                alt="Advertisement"
                                width={400}
                                height={400}
                                className="object-cover w-full h-auto"
                            />
                        </Link>
                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full z-10 transition-all duration-300">
                            {adLabel}
                        </span>
                        {showCloseButton && (
                            <button 
                                onClick={handleCrossClick}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full transition-opacity z-10"
                                aria-label="প্রিমিয়াম কিনুন"
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
                        <AlertDialogCancel onClick={handleDismiss} className='w-full'>পরে ভাবছি</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePremiumRedirect} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold">প্রিমিয়াম নিন</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
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
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full z-10 pointer-events-none transition-all duration-300">
                    {adLabel}
                </span>
                <button 
                    onClick={handleCrossClick}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100 z-10"
                    aria-label="বিজ্ঞাপন বন্ধ করুন"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            {AdDialog}
        </AlertDialog>
    );
}
