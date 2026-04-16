import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { 
  Users, Crown, Gift, MessageSquare, Bell, 
  DollarSign, Settings, ChevronRight, Calendar, ArrowUpRight
} from "lucide-react";

export function SubscriptionManagement() {
  const [tier, setTier] = useState<"basic" | "premium" | "vip">("premium");
  const [autoRenew, setAutoRenew] = useState(true);
  const [exclusiveContent, setExclusiveContent] = useState(true);
  const [promoDiscount, setPromoDiscount] = useState(20);
  const [welcomeMessage, setWelcomeMessage] = useState("Thank you for subscribing to my channel! I'm excited to have you join our community.");
  const [announcement, setAnnouncement] = useState("");
  const { toast } = useToast();
  
  // Mock subscribers data
  const subscribers = [
    { id: 1, name: "Sophia Martinez", username: "sophia_m", avatar: "https://i.pravatar.cc/150?img=1", tier: "premium", since: "Feb 15, 2025", renewal: "May 15, 2025" },
    { id: 2, name: "James Wilson", username: "jwilson", avatar: "https://i.pravatar.cc/150?img=2", tier: "vip", since: "Jan 03, 2025", renewal: "Apr 03, 2025" },
    { id: 3, name: "Emily Taylor", username: "em_taylor", avatar: "https://i.pravatar.cc/150?img=3", tier: "basic", since: "Mar 21, 2025", renewal: "Apr 21, 2025" },
    { id: 4, name: "Michael Brown", username: "mike_b", avatar: "https://i.pravatar.cc/150?img=4", tier: "premium", since: "Feb 28, 2025", renewal: "May 28, 2025" },
    { id: 5, name: "Jessica Lee", username: "jess_lee", avatar: "https://i.pravatar.cc/150?img=5", tier: "basic", since: "Mar 10, 2025", renewal: "Apr 10, 2025" },
  ];

  // Subscriber growth data
  const subscriberGrowthData = [
    { name: 'Jan', subscribers: 12 },
    { name: 'Feb', subscribers: 19 },
    { name: 'Mar', subscribers: 27 },
    { name: 'Apr', subscribers: 34 },
    { name: 'May', subscribers: 41 },
    { name: 'Jun', subscribers: 48 },
  ];

  // Subscriber tier distribution
  const tierDistributionData = [
    { name: 'Basic', value: 45, color: '#8884d8' },
    { name: 'Premium', value: 35, color: '#82ca9d' },
    { name: 'VIP', value: 20, color: '#ffc658' },
  ];

  // Subscription plans
  const subscriptionPlans = [
    {
      tier: "basic",
      name: "Basic",
      price: "$4.99",
      description: "Support your favorite creator",
      features: [
        "Ad-free listening",
        "Access to subscriber-only chatroom",
        "Exclusive emoji reactions"
      ]
    },
    {
      tier: "premium",
      name: "Premium",
      price: "$9.99",
      description: "Enhanced experience with extra perks",
      features: [
        "All Basic tier features",
        "Exclusive show recordings",
        "Member shoutouts during live shows",
        "Early access to clips"
      ]
    },
    {
      tier: "vip",
      name: "VIP",
      price: "$19.99",
      description: "Ultimate fan experience",
      features: [
        "All Premium tier features",
        "Monthly private Q&A session",
        "Custom voice message from creator",
        "Input on future show topics",
        "Exclusive merchandise discounts"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Subscription Management</h2>
        <p className="text-muted-foreground">
          Manage your subscription tiers and subscribers
        </p>
      </div>
      
      <Tabs defaultValue="subscribers">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscribers Overview</CardTitle>
              <CardDescription>
                View and manage your subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">27</div>
                    <div className="text-sm text-muted-foreground">Total Subscribers</div>
                  </div>
                </div>
                <Button onClick={() => toast({ title: "Message sent", description: "Broadcast message sent to all 27 subscribers" })}>
                  Message All <MessageSquare className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscriber</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead>Renewal</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={subscriber.avatar} alt={subscriber.name} />
                            <AvatarFallback>{subscriber.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{subscriber.name}</div>
                            <div className="text-sm text-muted-foreground">@{subscriber.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            subscriber.tier === "vip" ? "default" :
                            subscriber.tier === "premium" ? "secondary" : "outline"
                          }
                        >
                          {subscriber.tier === "vip" && <Crown className="mr-1 h-3 w-3" />}
                          {subscriber.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>{subscriber.since}</TableCell>
                      <TableCell>{subscriber.renewal}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => toast({ title: "All subscribers shown", description: "You have 27 total subscribers across all tiers" })}>
                View All Subscribers
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  New subscribers and renewals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-500/10 p-2">
                      <Users className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">New Subscriber</p>
                      <p className="text-xs text-muted-foreground">
                        Jessica Lee subscribed to the Basic tier
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Today at 10:45 AM
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-500/10 p-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Subscription Renewed</p>
                      <p className="text-xs text-muted-foreground">
                        James Wilson renewed their VIP subscription
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Yesterday at 2:30 PM
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-amber-500/10 p-2">
                      <Gift className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Tier Upgrade</p>
                      <p className="text-xs text-muted-foreground">
                        Michael Brown upgraded from Basic to Premium
                      </p>
                      <p className="text-xs text-muted-foreground">
                        April 3, 2025 at 5:15 PM
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Communications</CardTitle>
                <CardDescription>
                  Send updates to your subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="announcement">New Announcement</Label>
                    <Textarea
                      id="announcement"
                      placeholder="Enter your announcement message..."
                      value={announcement}
                      onChange={e => setAnnouncement(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Recipient Tiers</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer">
                        All Tiers
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        Basic Only
                      </Badge>
                      <Badge variant="secondary" className="cursor-pointer">
                        Premium & VIP
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        VIP Only
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full"
                    disabled={!announcement.trim()}
                    onClick={() => {
                      toast({ title: "Announcement sent!", description: "Your message was sent to all subscribers" });
                      setAnnouncement("");
                    }}
                  >
                    Send Announcement <Bell className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Subscription Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.tier} 
                className={tier === plan.tier ? "border-primary" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.tier === "premium" && (
                      <Badge>Popular</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                  
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={tier === plan.tier ? "default" : "outline"}
                    onClick={() => setTier(plan.tier as "basic" | "premium" | "vip")}
                  >
                    {tier === plan.tier ? "Current Plan" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Manage Subscription Settings</CardTitle>
              <CardDescription>
                Configure how your subscription plans work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Textarea
                    id="welcome-message"
                    placeholder="Enter a welcome message for new subscribers..."
                    value={welcomeMessage}
                    onChange={e => setWelcomeMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="exclusive-content">Exclusive Content</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable subscriber-only content
                      </p>
                    </div>
                    <Switch
                      id="exclusive-content"
                      checked={exclusiveContent}
                      onCheckedChange={setExclusiveContent}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-renew">Auto-Renewal</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow subscribers to auto-renew
                      </p>
                    </div>
                    <Switch
                      id="auto-renew"
                      checked={autoRenew}
                      onCheckedChange={setAutoRenew}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="promo-discount">Promotional Discount</Label>
                      <p className="text-xs text-muted-foreground">
                        First month discount for new subscribers
                      </p>
                    </div>
                    <div className="flex w-20 items-center">
                      <Input
                        id="promo-discount"
                        type="number"
                        defaultValue="20"
                        min="0"
                        max="50"
                        className="h-8"
                      />
                      <span className="ml-1">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setWelcomeMessage("Thank you for subscribing to my channel! I'm excited to have you join our community.");
                  setExclusiveContent(true);
                  setAutoRenew(true);
                  setPromoDiscount(20);
                  toast({ title: "Reset", description: "Settings reset to default values" });
                }}
              >
                Reset to Default
              </Button>
              <Button onClick={() => toast({ title: "Saved!", description: "Subscription settings saved successfully" })}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>
                  Track your subscriber count over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={subscriberGrowthData}
                      margin={{
                        top: 5,
                        right: 20,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="subscribers"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
                <CardDescription>
                  Breakdown of subscribers by tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[300px] items-center justify-center">
                  <div className="w-full max-w-[250px]">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={tierDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {tierDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value}%`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Retention</CardTitle>
              <CardDescription>
                Track how long subscribers stay with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold">87%</div>
                    <div className="text-sm font-medium">Monthly Retention</div>
                    <div className="text-xs text-muted-foreground">
                      Subscribers who renewed last month
                    </div>
                  </div>
                  
                  <div className="space-y-2 rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold">5.2 mo</div>
                    <div className="text-sm font-medium">Average Duration</div>
                    <div className="text-xs text-muted-foreground">
                      Average subscription length
                    </div>
                  </div>
                  
                  <div className="space-y-2 rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold">$8.73</div>
                    <div className="text-sm font-medium">Lifetime Value</div>
                    <div className="text-xs text-muted-foreground">
                      Average monthly revenue per subscriber
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Improving Retention</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      Schedule regular exclusive content for subscribers
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      Engage with subscribers in the exclusive chat
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      Offer special renewal incentives for long-term subscribers
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}