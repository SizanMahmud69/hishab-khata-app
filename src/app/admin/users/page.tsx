
"use client";

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase }from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface User {
    id: string;
    name: string;
    email: string;
    points: number;
    joinDate: any; // Firestore Timestamp
    premiumStatus: 'free' | 'premium';
}

export default function AdminUsersPage() {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), orderBy('joinDate', 'desc'));
    }, [firestore]);

    const { data: users, isLoading } = useCollection<User>(usersQuery);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'premium':
                return <Badge className="bg-yellow-200 text-yellow-800 border-yellow-400 hover:bg-yellow-200/80">
                        <Crown className="mr-1 h-3 w-3" />
                        Premium
                       </Badge>;
            case 'free':
            default:
                return <Badge variant="outline">Free</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        )}
                        {users && users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell>{user.points || 0}</TableCell>
                                    <TableCell>
                                        {user.joinDate ? format(user.joinDate.toDate(), 'd MMM, yyyy', { locale: bn }) : '-'}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(user.premiumStatus)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                           !isLoading && <TableRow><TableCell colSpan={5} className="text-center">No users found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
