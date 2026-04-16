import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";
import type { Earnings, Transaction } from "@shared/schema";

export function EarningsDashboard() {
  const { data: earnings = [], isLoading: earningsLoading } = useQuery<Earnings[]>({
    queryKey: ["/api/earnings"],
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: subscribers = [], isLoading: subLoading } = useQuery<any[]>({
    queryKey: ["/api/subscriptions/subscribers"],
  });

  const isLoading = earningsLoading || txLoading || subLoading;

  const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.amount as any || '0'), 0);
  const totalTips = transactions.filter(t => t.type === 'gift').reduce((sum, t) => sum + parseFloat(t.amount as any || '0'), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Earnings</span>
            </div>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Tips Received</span>
            </div>
            <div className="text-2xl font-bold">${totalTips.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Subscribers</span>
            </div>
            <div className="text-2xl font-bold">{subscribers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Transactions</span>
            </div>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto opacity-30 mb-3" />
              <p>No transactions yet.</p>
              <p className="text-sm mt-1">Start creating content to earn from gifts, subscriptions, and tips.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((t: any) => (
                <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{t.type}</p>
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${parseFloat(t.amount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
