
"use client";

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, query, orderBy, getDoc, setDoc } from 'firebase/firestore';
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

interface VerificationRequest {
    id: string;
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: any;
    nidName: string;
    nidNumber: string;
    nidDob: string;
    nidAddress: string;
    phone: string;
    rejectionReason?: string;
}

export default function VerificationsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const verificationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'verificationRequests'), orderBy('submittedAt', 'desc'));
    }, [firestore]);

    const { data: requests, isLoading } = useCollection<VerificationRequest>(verificationsQuery);

    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApprove = async (request: VerificationRequest) => {
        if (!firestore) return;
        setIsSubmitting(true);
        try {
            const batch = writeBatch(firestore);

            const rootRequestRef = doc(firestore, 'verificationRequests', request.id);
            batch.update(rootRequestRef, { status: 'approved', reviewedAt: serverTimestamp() });

            const userRequestRef = doc(firestore, `users/${request.userId}/verificationRequests`, request.id);
            batch.update(userRequestRef, { status: 'approved', reviewedAt: serverTimestamp() });

            await batch.commit();

            await createNotification({
                title: 'NID ভেরিফিকেশন সফল',
                description: 'আপনার NID ভেরিফিকেশন সফলভাবে সম্পন্ন হয়েছে।',
                link: '/profile',
            }, request.userId, firestore);

            toast({ title: 'Success', description: 'Request approved.' });
        } catch (error) {
            console.error("Error approving request:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to approve request.' });
        }
        setIsSubmitting(false);
    };

    const openRejectDialog = (request: VerificationRequest) => {
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

            const rootRequestRef = doc(firestore, 'verificationRequests', selectedRequest.id);
            batch.update(rootRequestRef, { status: 'rejected', rejectionReason: reason, reviewedAt: serverTimestamp() });

            const userRequestRef = doc(firestore, `users/${selectedRequest.userId}/verificationRequests`, selectedRequest.id);
            batch.update(userRequestRef, { status: 'rejected', rejectionReason: reason, reviewedAt: serverTimestamp() });

            await batch.commit();
            
            await createNotification({
                title: 'NID ভেরিফিকেশন বাতিল',
                description: `আপনার NID ভেরিফিকেশনটি বাতিল করা হয়েছে। কারণ: ${reason}`,
                link: '/profile/verify',
            }, selectedRequest.userId, firestore);

            toast({ title: 'Success', description: 'Request rejected.' });
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
                <CardTitle>NID Verification Requests</CardTitle>
                <CardDescription>Manage user NID verification submissions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>NID Number</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        )}
                        {requests && requests.length > 0 ? (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="text-xs">{req.userId}</TableCell>
                                    <TableCell>{req.nidName}</TableCell>
                                    <TableCell>{req.nidNumber}</TableCell>
                                    <TableCell>{req.phone}</TableCell>
                                    <TableCell>{req.submittedAt ? format(req.submittedAt.toDate(), 'd MMM, yyyy', { locale: bn }) : '-'}</TableCell>
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
                           !isLoading && <TableRow><TableCell colSpan={7} className="text-center">No pending requests found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Verification Request?</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this request. This will be shown to the user.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="e.g., Information does not match, image is unclear."
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
