"use client";

import React, { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Bell, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface Notification {
    id: number;
    title: string;
    description: string;
    read: boolean;
    link: string;
}

const initialNotifications: Notification[] = [
    { id: 1, title: "আপনার বাজেট প্রায় শেষ।", description: "মাসিক খরচের সীমা অতিক্রম করতে চলেছে।", read: false, link: "/expenses" },
    { id: 2, title: "নতুন বিল যোগ হয়েছে।", description: "ইন্টারনেট বিল পরিশোধ করুন।", read: false, link: "/expenses" },
    { id: 3, title: "রিওয়ার্ড পয়েন্ট আপডেট!", description: "আপনি সফলভাবে ৫০ পয়েন্ট অর্জন করেছেন।", read: false, link: "/rewards" },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const router = useRouter();

    useEffect(() => {
        const storedNotifications = localStorage.getItem('notifications');
        if (storedNotifications) {
            setNotifications(JSON.parse(storedNotifications));
        } else {
            setNotifications(initialNotifications);
            localStorage.setItem('notifications', JSON.stringify(initialNotifications));
        }
    }, []);

    const updateLocalStorage = (updatedNotifications: Notification[]) => {
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        window.dispatchEvent(new Event('storage')); // Trigger storage event for header to update
    }

    const markAsRead = (id: number) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updated);
        updateLocalStorage(updated);
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        router.push(notification.link);
    }

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        updateLocalStorage(updated);
    }

    const deleteNotification = (id: number, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent card click event from firing
        const updated = notifications.filter(n => n.id !== id);
        setNotifications(updated);
        updateLocalStorage(updated);
    }

    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="নোটিফিকেশন" description="আপনার সকল গুরুত্বপূর্ণ আপডেট এবং বার্তা।">
                <Button onClick={markAllAsRead} disabled={notifications.every(n => n.read)}>
                    সবগুলো পঠিত করুন
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>আপনার নোটিফিকেশন</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <div 
                                key={notification.id} 
                                className={cn(
                                    "flex items-start justify-between gap-4 p-4 rounded-lg border cursor-pointer transition-colors", 
                                    notification.read ? "bg-muted/50 hover:bg-muted" : "bg-card hover:bg-muted/50"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-4">
                                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", notification.read ? "bg-muted-foreground/20" : "bg-primary/10")}>
                                        <Bell className={cn("h-5 w-5", notification.read ? "text-muted-foreground" : "text-primary")} />
                                    </span>
                                    <div>
                                        <h4 className="font-semibold">{notification.title}</h4>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!notification.read && <Badge variant="default" className="h-5">নতুন</Badge>}
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => deleteNotification(notification.id, e)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>এখনও কোনো নোটিফিকেশন নেই।</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
