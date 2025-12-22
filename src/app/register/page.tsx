
import Link from "next/link"
import { BookMarked, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <BookMarked className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">নতুন অ্যাকাউন্ট তৈরি করুন</CardTitle>
          <CardDescription className="text-center">
            আপনার তথ্য দিয়ে নিবন্ধন সম্পন্ন করুন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="full-name">পুরো নাম</Label>
              <Input id="full-name" placeholder="আপনার নাম" required />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input id="password" type="password" required />
            </div>
            <Button asChild type="submit" className="w-full">
              <Link href="/dashboard">
                নিবন্ধন করুন <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{" "}
            <Link href="/login" className="underline">
              লগইন করুন
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
