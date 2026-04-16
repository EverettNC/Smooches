import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EarningsDashboard } from "@/components/monetization/earnings-dashboard";
import { ClipMonetization } from "@/components/monetization/clip-monetization";
import { SubscriptionManagement } from "@/components/monetization/subscription-management";
import { Separator } from "@/components/ui/separator";
import { BarChart2, CreditCard, Rocket, Settings, BarChart, CircleDollarSign, FilePieChart } from "lucide-react";

export default function MonetizationDashboard() {
  return (
    <main className="container mx-auto p-6">
      {/* Page header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Creator Monetization</h1>
            <p className="text-muted-foreground">
              Manage your earnings, subscriptions, and monetization settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CircleDollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium leading-none">Creator Level</p>
              <p className="text-xs text-muted-foreground">Silver Tier</p>
            </div>
          </div>
        </div>
        <Separator />
      </div>

      {/* Monetization Tabs */}
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="clips" className="flex items-center gap-2">
            <FilePieChart className="h-4 w-4" />
            <span>Clip Monetization</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Earnings Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <EarningsDashboard />
        </TabsContent>

        {/* Clip Monetization Tab */}
        <TabsContent value="clips" className="space-y-4">
          <ClipMonetization />
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionManagement />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="text-center p-12">
            <Rocket className="mx-auto h-12 w-12 text-primary opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We're working on advanced monetization settings. Stay tuned for updates!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
