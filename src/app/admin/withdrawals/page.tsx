
"use client";

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, query, orderBy, increment } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/components/app-header';

interface WithdrawalRequest {
    id: string;
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    points: number;
    amountBdt: number;
    paymentMethod: string;
    accountNumber: string;
    requestedAt: any;
    rejectionReason?: string;
}

export default function WithdrawalsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const withdrawalsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'withdrawalRequests'), orderBy('requestedAt', 'desc'));
    }, [firestore]);

    const { data: requests, isLoading } = useCollection<WithdrawalRequest>(withdrawalsQuery);

    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApprove = async (request: WithdrawalRequest) => {
        if (!firestore) return;
        setIsSubmitting(true);
        try {
            const batch = writeBatch(firestore);
            const rootRequestRef = doc(firestore, 'withdrawalRequests', request.id);
            batch.update(rootRequestRef, { status: 'approved', processedAt: serverTimestamp() });
            const userRequestRef = doc(firestore, `users/${request.userId}/withdrawalRequests`, request.id);
            batch.update(userRequestRef, { status: 'approved', processedAt: serverTimestamp() });

            await batch.commit();

            await createNotification({
                title: 'উইথড্র সফল হয়েছে',
                description: `আপনার ${request.amountBdt} টাকার উইথড্র অনুরোধটি সম্পন্ন হয়েছে।`,
                link: '/rewards',
            }, request.userId, firestore);

            toast({ title: 'Success', description: 'Request approved.' });
        } catch (error) {
            console.error("Error approving request:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to approve request.' });
        }
        setIsSubmitting(false);
    };

    const openRejectDialog = (request: WithdrawalRequest) => {
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

            const rootRequestRef = doc(firestore, 'withdrawalRequests', selectedRequest.id);
            batch.update(rootRequestRef, { status: 'rejected', rejectionReason: reason, processedAt: serverTimestamp() });

            const userRequestRef = doc(firestore, `users/${selectedRequest.userId}/withdrawalRequests`, selectedRequest.id);
            batch.update(userRequestRef, { status: 'rejected', rejectionReason: reason, processedAt: serverTimestamp() });
            
            // Refund points
            const userDocRef = doc(firestore, 'users', selectedRequest.userId);
            batch.update(userDocRef, { points: increment(selectedRequest.points) });

            await batch.commit();
            
            await createNotification({
                title: 'উইথড্র বাতিল হয়েছে',
                description: `আপনার উইথড্র অনুরোধটি বাতিল করা হয়েছে। পয়েন্ট ফেরত দেওয়া হয়েছে। কারণ: ${reason}`,
                link: '/withdraw?section=history',
            }, selectedRequest.userId, firestore);

            toast({ title: 'Success', description: 'Request rejected and points refunded.' });
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
    
     const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>Manage user reward point withdrawal requests.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Amount</TableHead>
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
                                    <TableCell>{req.requestedAt ? format(req.requestedAt.toDate(), 'd MMM, yyyy', { locale: bn }) : '-'}</TableCell>
                                    <TableCell>{req.paymentMethod}</TableCell>
                                    <TableCell>{req.accountNumber}</TableCell>
                                    <TableCell>{req.points}</TableCell>
                                    <TableCell>{formatCurrency(req.amountBdt)}</TableCell>
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
                           !isLoading && <TableRow><TableCell colSpan={8} className="text-center">No pending requests found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Withdrawal Request?</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejection. This will be shown to the user, and their points will be refunded.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="e.g., Invalid account number, suspicious activity."
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
