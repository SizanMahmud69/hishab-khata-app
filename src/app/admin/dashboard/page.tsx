
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminDashboardPage() {
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, Admin!</CardTitle>
                    <CardDescription>
                        This is your control center. Select an option from the sidebar to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>You can manage NID verifications, user withdrawal requests, and more from here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
