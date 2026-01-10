
import { AdBanner } from "@/components/ad-banner";
import PageHeader from "@/components/page-header"
import { SettingsShops } from "@/components/settings-shops"

export default function ShopsSettingsPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="দোকানের তালিকা সেটিংস" description="আপনার দোকানের তালিকা পরিচালনা করুন।" />
      <SettingsShops />
      <div className="pt-4">
        <AdBanner page="settings-shops" />
      </div>
    </div>
  )
}
