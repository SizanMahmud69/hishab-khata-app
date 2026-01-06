
"use client";

import { useMemo, useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { X, Annoyed } from 'lucide-react';
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
    const [isDismissed, setIsDismissed] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [showCloseButton, setShowCloseButton] = useState(false);
    const [adLabelText, setAdLabelText] = useState("বিজ্ঞাপনে ক্লিক করুন");

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

    if (isLoading || !ad || isDismissed) {
        return null;
    }

    const handleDismiss = () => {
        setIsAlertOpen(true);
    };

    const handlePremiumRedirect = () => {
        // Here you would redirect to your premium subscription page
        // For now, we'll just close the dialog.
        setIsAlertOpen(false);
    }

    return (
        <>
            <div className="relative w-full rounded-lg overflow-hidden shadow-lg my-4 group">
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full z-10 transition-all duration-500">
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
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className='flex items-center justify-center'>
                           <Annoyed className="w-12 h-12 text-yellow-500 mb-4" />
                        </div>
                        <AlertDialogTitle className="text-center">আপনি কি বিজ্ঞাপন বন্ধ করতে চান?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            আমাদের অ্যাপের বিজ্ঞাপনমুক্ত অভিজ্ঞতা পেতে এবং ডেভেলপারদের সমর্থন করতে, অনুগ্রহ করে প্রিমিয়াম সাবস্ক্রিপশন নিন।
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='sm:justify-center'>
                        <AlertDialogCancel>পরে ভাবছি</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePremiumRedirect}>প্রিমিয়াম নিন</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
