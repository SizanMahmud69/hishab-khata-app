
"use client";

import { useMemo, useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
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

interface Ad {
    id: string;
    imageUrl: string;
    linkUrl: string;
    page: string;
    isActive: boolean;
}

interface AdBannerProps {
    page: string;
}

export function AdBanner({ page }: AdBannerProps) {
    const firestore = useFirestore();
    const router = useRouter();
    const { premiumStatus } = useBudget();
    const [isDismissed, setIsDismissed] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [showCloseButton, setShowCloseButton] = useState(false);
    const [adLabelText, setAdLabelText] = useState("বিজ্ঞাপনটি বন্ধ করতে ক্লিক করুন");

    useEffect(() => {
        const closeButtonTimer = setTimeout(() => {
            setShowCloseButton(true);
        }, 5000); // 5 seconds

        const labelTextTimer = setTimeout(() => {
            setAdLabelText("বিজ্ঞাপন");
        }, 4000); // 4 seconds

        return () => {
            clearTimeout(closeButtonTimer);
            clearTimeout(labelTextTimer);
        };
    }, []);


    const adsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'ads'),
            where('isActive', '==', true),
            where('page', 'in', ['all', page])
        );
    }, [firestore, page]);

    const { data: ads, isLoading } = useCollection<Ad>(adsQuery);

    const ad = useMemo(() => {
        if (!ads || ads.length === 0) return null;
        // Prioritize page-specific ad over 'all'
        return ads.find(ad => ad.page === page) || ads.find(ad => ad.page === 'all') || null;
    }, [ads, page]);
    
    if (isLoading || !ad || isDismissed || premiumStatus === 'premium') {
        return null;
    }

    const handleDismiss = () => {
        setIsAlertOpen(true);
    };

    const handlePremiumRedirect = () => {
        router.push('/premium');
        setIsAlertOpen(false);
    }

    return (
        <>
            <div className="relative w-full rounded-lg overflow-hidden shadow-lg my-4 group">
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full z-10 transition-all duration-500 whitespace-nowrap">
                    {adLabelText}
                </span>
                <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
                    <Image
                        src={ad.imageUrl}
                        alt="Advertisement"
                        width={800}
                        height={200}
                        className="w-full object-cover"
                    />
                </Link>
                {showCloseButton && (
                    <button 
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        aria-label="বিজ্ঞাপন বন্ধ করুন"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            
             <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent className="overflow-hidden p-0">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 flex flex-col items-center justify-center text-center">
                        <Crown className="w-16 h-16 text-white drop-shadow-lg" />
                    </div>
                    <AlertDialogHeader className="p-6 text-center">
                        <AlertDialogTitle className="text-2xl">বিজ্ঞাপনমুক্ত অভিজ্ঞতা নিন!</AlertDialogTitle>
                        <AlertDialogDescription>
                            আমাদের অ্যাপের বিজ্ঞাপনমুক্ত অভিজ্ঞতা পেতে এবং ডেভেলপারদের সমর্থন করতে, অনুগ্রহ করে প্রিমিয়াম সাবস্ক্রিপশন নিন।
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='p-6 pt-0 bg-transparent'>
                        <AlertDialogCancel>পরে ভাবছি</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePremiumRedirect} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold">প্রিমিয়াম নিন</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
