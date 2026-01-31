
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminConfigPage() {
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>App Configuration</CardTitle>
                    <CardDescription>
                        This page will allow you to manage global app settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Functionality to edit app settings like reward points and withdrawal limits is coming soon.</p>
                </CardContent>
            </Card>
        </div>
    )
}
