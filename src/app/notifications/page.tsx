
"use client";

import React, { useMemo, Fragment } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { isThisMonth, parseISO } from 'date-fns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { AdBanner } from '@/components/ad-banner';

interface Notification {
    id: string;
    title: string;
    description: string;
    read: boolean;
    link?: string;
    createdAt: Timestamp | string; // Can be a Timestamp from server or a string
}

export default function NotificationsPage() {
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();

    const notificationsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/notifications`), orderBy("createdAt", "desc"));
    }, [user, firestore]);

    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

    const monthlyNotifications = useMemo(() => {
        if (!notifications) return [];
        return notifications.filter(n => {
            if (!n.createdAt) return false;
            // Handle both Timestamp and string formats
            const date = typeof n.createdAt === 'string' 
                ? parseISO(n.createdAt) 
                : (n.createdAt as Timestamp).toDate();
            return isThisMonth(date);
        });
    }, [notifications]);
    
    const markAsRead = async (id: string) => {
        if (!user || !firestore) return;
        const notificationRef = doc(firestore, `users/${user.uid}/notifications`, id);
        await updateDoc(notificationRef, { read: true });
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
    }

    const markAllAsRead = async () => {
        if (!user || !firestore || !monthlyNotifications) return;
        
        const unreadNotifications = monthlyNotifications.filter(n => !n.read);
        if (unreadNotifications.length === 0) return;

        const batch = writeBatch(firestore);
        unreadNotifications.forEach(notification => {
            const docRef = doc(firestore, `users/${user.uid}/notifications`, notification.id);
            batch.update(docRef, { read: true });
        });
        await batch.commit();
    }

    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="নোটিফিকেশন" description="আপনার সকল গুরুত্বপূর্ণ আপডেট এবং বার্তা।">
                <Button onClick={markAllAsRead} disabled={isLoading || (monthlyNotifications && monthlyNotifications.every(n => n.read))}>
                    সবগুলো পঠিত করুন
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>এই মাসের নোটিফিকেশন</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : monthlyNotifications && monthlyNotifications.length > 0 ? (
                        monthlyNotifications.map((notification, index) => (
                            <Fragment key={notification.id}>
                                <div 
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-lg border transition-colors", 
                                        !notification.read && "bg-primary/5",
                                        notification.link ? "cursor-pointer hover:bg-muted/50" : "cursor-default"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-4 flex-1">
                                        <span className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0", 
                                            notification.read ? "bg-muted-foreground/10" : "bg-primary/10"
                                        )}>
                                            <Bell className={cn("h-5 w-5", notification.read ? "text-muted-foreground" : "text-primary")} />
                                        </span>
                                        <div className='flex-1'>
                                            <h4 className="font-semibold">{notification.title}</h4>
                                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <div className="flex items-center h-full">
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                                        </div>
                                    )}
                                </div>
                                {(index + 1) % 2 === 0 && (
                                    <div className='my-4'>
                                        <AdBanner page="notifications" adIndex={Math.floor(index / 2)} />
                                    </div>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>এই মাসে কোনো নোটিফিকেশন নেই।</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
