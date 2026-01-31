
"use client";

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, query, orderBy, getDoc, setDoc, addDoc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { premiumPlans, type PremiumPlan } from '@/lib/data';


interface Notification {
    id?: string;
    title: string;
    description: string;
    read: boolean;
    link?: string;
    createdAt?: any;
}
const createNotification = async (notification: Omit<Notification, 'createdAt' | 'read'>, userId: string, firestore: any) => {
    if (!userId || !firestore) return;
    try {
        const notificationsRef = collection(firestore, `users/${userId}/notifications`);
        const docRef = doc(notificationsRef);
        await setDoc(docRef, {
            ...notification,
            id: docRef.id,
            createdAt: serverTimestamp(),
            read: false,
        });
    } catch(e) {
        console.error("Error creating notification:", e)
    }
};

interface PremiumSubscriptionRequest {
    id: string;
    userId: string;
    planId: string;
    status: 'pending' | 'approved' | 'rejected';
    paymentMethod: string;
    accountNumber: string;
    transactionId: string;
    createdAt: any;
    rejectionReason?: string;
}

export default function SubscriptionsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const subscriptionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'premiumSubscriptions'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: requests, isLoading } = useCollection<PremiumSubscriptionRequest>(subscriptionsQuery);

    const [selectedRequest, setSelectedRequest] = useState<PremiumSubscriptionRequest | null>(null);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const findPlan = (planId: string) => premiumPlans.find(p => p.id === planId);

    const handleApprove = async (request: PremiumSubscriptionRequest) => {
        if (!firestore) return;
        
        const plan = findPlan(request.planId);
        if (!plan) {
            toast({ variant: 'destructive', title: 'Error', description: 'Invalid plan ID found in request.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const batch = writeBatch(firestore);
            const expiryDate = plan.durationDays ? addDays(new Date(), plan.durationDays) : null;

            // Update root request
            const rootRequestRef = doc(firestore, 'premiumSubscriptions', request.id);
            batch.update(rootRequestRef, { status: 'approved', activatedAt: serverTimestamp(), expiresAt: expiryDate });

            // Update user's sub-collection request
            const userRequestRef = doc(firestore, `users/${request.userId}/premium_subscriptions`, request.id);
            batch.update(userRequestRef, { status: 'approved', activatedAt: serverTimestamp(), expiresAt: expiryDate });

            // Update user's main profile
            const userDocRef = doc(firestore, 'users', request.userId);
            batch.update(userDocRef, {
                premiumStatus: 'premium',
                premiumPlanId: plan.id,
                premiumExpiryDate: expiryDate,
            });

            await batch.commit();

            await createNotification({
                title: 'সাবস্ক্রিপশন সক্রিয় হয়েছে',
                description: `আপনার "${plan.title}" প্ল্যানটি সফলভাবে সক্রিয় করা হয়েছে।`,
                link: '/profile',
            }, request.userId, firestore);

            toast({ title: 'Success', description: 'Subscription approved and activated.' });
        } catch (error) {
            console.error("Error approving subscription:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to approve subscription.' });
        }
        setIsSubmitting(false);
    };

    const openRejectDialog = (request: PremiumSubscriptionRequest) => {
        setSelectedRequest(request);
        setRejectionReason('');
        setIsRejectDialogOpen(true);
    };

    const handleReject = async () => {
        if (!firestore || !selectedRequest || !rejectionReason.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Rejection reason cannot be empty.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const batch = writeBatch(firestore);
            const reason = rejectionReason.trim();
            
            const plan = findPlan(selectedRequest.planId);

            // Update root request
            const rootRequestRef = doc(firestore, 'premiumSubscriptions', selectedRequest.id);
            batch.update(rootRequestRef, { status: 'rejected', rejectionReason: reason });
            // Update user's sub-collection request
            const userRequestRef = doc(firestore, `users/${selectedRequest.userId}/premium_subscriptions`, selectedRequest.id);
            batch.update(userRequestRef, { status: 'rejected', rejectionReason: reason });
            
            await batch.commit();
            
            await createNotification({
                title: 'সাবস্ক্রিপশন বাতিল হয়েছে',
                description: `আপনার "${plan?.title || 'সাবস্ক্রিপশন'}" অনুরোধটি বাতিল করা হয়েছে। কারণ: ${reason}`,
                link: '/premium',
            }, selectedRequest.userId, firestore);

            toast({ title: 'Success', description: 'Subscription rejected.' });
            setIsRejectDialogOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to reject request.' });
        }
        setIsSubmitting(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-600">Approved</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            case 'pending':
            default:
                return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>;
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Premium Subscription Requests</CardTitle>
                <CardDescription>Manage user subscription submissions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>TrxID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        )}
                        {requests && requests.length > 0 ? (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="text-xs">{req.userId}</TableCell>
                                    <TableCell>{findPlan(req.planId)?.title || req.planId}</TableCell>
                                    <TableCell>{req.paymentMethod}</TableCell>
                                    <TableCell>{req.accountNumber}</TableCell>
                                    <TableCell className="text-xs">{req.transactionId}</TableCell>
                                    <TableCell>{req.createdAt ? format(req.createdAt.toDate(), 'd MMM, yy', { locale: bn }) : '-'}</TableCell>
                                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {req.status === 'pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => handleApprove(req)} disabled={isSubmitting} className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => openRejectDialog(req)} disabled={isSubmitting}>
                                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                           !isLoading && <TableRow><TableCell colSpan={8} className="text-center">No subscription requests found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Subscription Request?</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this request. This will be shown to the user.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="e.g., Transaction ID not found, incorrect amount."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isSubmitting || !rejectionReason.trim()}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
