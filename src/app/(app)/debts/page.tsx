
"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react"
import { useBudget } from "@/context/budget-context";
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { debts as initialDebts } from "@/lib/data"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function DebtsPage() {
    const { isLoading } = useBudget();
    const { toast } = useToast();
    const [debts, setDebts] = useState(initialDebts);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(amount)
    }

    const handleMarkAsPaid = (id: number) => {
        setDebts(debts.map(debt => debt.id === id ? { ...debt, status: 'paid' } : debt));
        toast({
            title: "সফল!",
            description: "ধারের হিসাব সফলভাবে আপডেট করা হয়েছে।",
        });
    }

    const lentDebts = debts.filter(d => d.type === 'lent');
    const borrowedDebts = debts.filter(d => d.type === 'borrowed');

    if (isLoading) {
        return <DebtsSkeleton />;
    }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="ধারের হিসাব" description="আপনার সকল দেনা-পাওনার হিসাব রাখুন।">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              নতুন ধার যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>নতুন ধারের হিসাব</DialogTitle>
              <DialogDescription>
                সম্পর্কিত ব্যক্তির নাম এবং অর্থের পরিমাণ লিখুন।
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="person" className="text-right">ব্যক্তির নাম</Label>
                    <Input id="person" placeholder="সোহেল" className="col-span-3" />
                </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  পরিমাণ
                </Label>
                <Input id="amount" type="number" placeholder="2000" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ধরন</Label>
                <RadioGroup defaultValue="lent" className="col-span-3 flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lent" id="r-lent" />
                        <Label htmlFor="r-lent">ধার দিয়েছি</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="borrowed" id="r-borrowed" />
                        <Label htmlFor="r-borrowed">ধার নিয়েছি</Label>
                    </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  তারিখ
                </Label>
                <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">সংরক্ষণ করুন</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <Tabs defaultValue="lent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lent">ধার দিয়েছি</TabsTrigger>
          <TabsTrigger value="borrowed">ধার নিয়েছি</TabsTrigger>
        </TabsList>
        <TabsContent value="lent">
          <Card>
              <CardHeader>
                  <CardTitle>ধার দিয়েছি</CardTitle>
                  <CardDescription>আপনি অন্যদের যে টাকা ধার দিয়েছেন।</CardDescription>
              </CardHeader>
              <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>নাম</TableHead>
                          <TableHead>স্ট্যাটাস</TableHead>
                          <TableHead>পরিমাণ</TableHead>
                          <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                  {lentDebts.map((debt) => (
                      <TableRow key={debt.id}>
                          <TableCell className="font-medium">{debt.person}</TableCell>
                          <TableCell>
                              <Badge variant={debt.status === 'paid' ? 'default': 'destructive'} className={cn(debt.status === 'paid' && 'bg-green-500 hover:bg-green-500/80')}>
                                  {debt.status === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}
                              </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(debt.amount)}</TableCell>
                           <TableCell className="text-right">
                            <Button 
                                size="sm" 
                                onClick={() => handleMarkAsPaid(debt.id)} 
                                disabled={debt.status === 'paid'}
                                variant={debt.status === 'paid' ? 'ghost' : 'outline'}
                            >
                                {debt.status === 'paid' ? 'পরিশোধিত' : 'পরিশোধ করুন'}
                            </Button>
                          </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
              </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="borrowed">
          <Card>
              <CardHeader>
                  <CardTitle>ধার নিয়েছি</CardTitle>
                  <CardDescription>আপনি অন্যদের থেকে যে টাকা ধার নিয়েছেন।</CardDescription>
              </CardHeader>
              <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>নাম</TableHead>
                          <TableHead>স্ট্যাটাস</TableHead>
                          <TableHead>পরিমাণ</TableHead>
                          <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                  {borrowedDebts.map((debt) => (
                      <TableRow key={debt.id}>
                          <TableCell className="font-medium">{debt.person}</TableCell>
                          <TableCell>
                               <Badge variant={debt.status === 'paid' ? 'default': 'destructive'} className={cn(debt.status === 'paid' && 'bg-green-500 hover:bg-green-500/80')}>
                                  {debt.status === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}
                              </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(debt.amount)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                                size="sm" 
                                onClick={() => handleMarkAsPaid(debt.id)} 
                                disabled={debt.status === 'paid'}
                                variant={debt.status === 'paid' ? 'ghost' : 'outline'}
                            >
                                {debt.status === 'paid' ? 'পরিশোধিত' : 'পরিশোধ করুন'}
                            </Button>
                          </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
              </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DebtsSkeleton() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div className="grid gap-1">
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-5 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
