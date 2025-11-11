import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface DashboardOverviewProps {
  onCreateNew: () => void;
}

const DashboardOverview = ({ onCreateNew }: DashboardOverviewProps) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: waybills } = await supabase
        .from("waybills")
        .select("status")
        .eq("sender_id", user.id);

      if (waybills) {
        setStats({
          total: waybills.length,
          pending: waybills.filter((w) => w.status === "pending").length,
          inTransit: waybills.filter((w) => w.status === "in_transit").length,
          delivered: waybills.filter((w) => w.status === "delivered").length,
        });
      }
    };

    fetchStats();

    const channel = supabase
      .channel("waybills-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "waybills",
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statCards = [
    { icon: Package, label: "Total Deliveries", value: stats.total, color: "text-primary" },
    { icon: Clock, label: "Pending", value: stats.pending, color: "text-yellow-500" },
    { icon: TrendingUp, label: "In Transit", value: stats.inTransit, color: "text-blue-500" },
    { icon: CheckCircle, label: "Delivered", value: stats.delivered, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your delivery overview.</p>
        </div>
        <Button onClick={onCreateNew} size="lg" className="gap-2">
          <Package className="h-5 w-5" />
          Create New Waybill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={onCreateNew}>
              <Package className="h-6 w-6" />
              <span>Create Waybill</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Track Delivery</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <CheckCircle className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
