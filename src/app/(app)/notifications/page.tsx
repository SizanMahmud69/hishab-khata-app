"use client";

import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { isThisMonth, parseISO } from 'date-fns';

interface Notification {
    id: string;
    title: string;
    description: string;
    read: boolean;
    link?: string;
    createdAt: string; // ISO date string
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const router = useRouter();
    
    const updateLocalStorageAndState = (updatedNotifications: Notification[]) => {
        setNotifications(updatedNotifications);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        window.dispatchEvent(new Event('storage')); // Trigger storage event for header to update
    }

    useEffect(() => {
        const storedNotifications = localStorage.getItem('notifications');
        if (storedNotifications) {
            setNotifications(JSON.parse(storedNotifications));
        }

        const handleStorageChange = () => {
            const updatedStorage = localStorage.getItem('notifications');
            if (updatedStorage) {
                setNotifications(JSON.parse(updatedStorage));
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        }
    }, []);

    const monthlyNotifications = useMemo(() => {
        return notifications.filter(n => n.createdAt && isThisMonth(parseISO(n.createdAt)));
    }, [notifications]);

    const markAsRead = (id: string) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        updateLocalStorageAndState(updated);
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
    }

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        updateLocalStorageAndState(updated);
    }

    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="নোটিফিকেশন" description="আপনার সকল গুরুত্বপূর্ণ আপডেট এবং বার্তা।">
                <Button onClick={markAllAsRead} disabled={monthlyNotifications.every(n => n.read)}>
                    সবগুলো পঠিত করুন
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>এই মাসের নোটিফিকেশন</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {monthlyNotifications.length > 0 ? (
                        monthlyNotifications.map(notification => (
                            <div 
                                key={notification.id} 
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
