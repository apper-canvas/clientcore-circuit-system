import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Header from "@/components/organisms/Header";
import MetricCard from "@/components/molecules/MetricCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ActivityItem from "@/components/molecules/ActivityItem";
import DealCard from "@/components/molecules/DealCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { activityService } from "@/services/api/activityService";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { onMenuClick } = useOutletContext();
  const navigate = useNavigate();
  
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [contactsData, dealsData, activitiesData] = await Promise.all([
        contactService.getAll(),
        dealService.getAll(),
        activityService.getAll()
      ]);
      
      setContacts(contactsData);
      setDeals(dealsData);
      setActivities(activitiesData.slice(0, 5)); // Recent 5 activities
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

const calculateMetrics = () => {
    const totalContacts = contacts.length;
    const activeDeals = deals.filter(deal => deal.stage_c !== "Closed").length;
    const totalPipelineValue = deals
      .filter(deal => deal.stage_c !== "Closed")
      .reduce((sum, deal) => sum + (deal.value_c || 0), 0);
    const wonDeals = deals.filter(deal => deal.stage_c === "Closed").length;

    return {
      totalContacts,
      activeDeals,
      totalPipelineValue,
      wonDeals
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

const getContactById = (id) => {
    return contacts.find(contact => contact.Id === id);
  };

  const getDealById = (id) => {
    return deals.find(deal => deal.Id === id);
  };

const recentDeals = deals
    .sort((a, b) => new Date(b.CreatedOn || 0) - new Date(a.CreatedOn || 0))
    .slice(0, 3);

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const metrics = calculateMetrics();

  const headerActions = [
    {
      label: "Add Contact",
      icon: "UserPlus",
      onClick: () => navigate("/contacts"),
      variant: "primary"
    },
    {
      label: "Add Deal",
      icon: "Plus",
      onClick: () => navigate("/deals"),
      variant: "outline"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-100">
      <Header
        onMenuClick={onMenuClick}
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your sales."
        actions={headerActions}
      />
      
      <div className="p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Contacts"
            value={metrics.totalContacts}
            icon="Users"
            color="accent"
            trend={{ type: "up", value: "+12%" }}
          />
          <MetricCard
            title="Active Deals"
            value={metrics.activeDeals}
            icon="DollarSign"
            color="success"
            trend={{ type: "up", value: "+8%" }}
          />
          <MetricCard
            title="Pipeline Value"
            value={formatCurrency(metrics.totalPipelineValue)}
            icon="TrendingUp"
            color="info"
            trend={{ type: "up", value: "+23%" }}
          />
          <MetricCard
            title="Deals Won"
            value={metrics.wonDeals}
            icon="Award"
            color="warning"
            trend={{ type: "up", value: "+15%" }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Deals */}
          <Card className="p-6 bg-gradient-to-br from-surface to-gray-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">Recent Deals</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/deals")}
              >
                View All
              </Button>
            </div>
            
            {recentDeals.length === 0 ? (
              <Empty
                icon="DollarSign"
                title="No deals yet"
                description="Start tracking your sales opportunities"
                action={() => navigate("/deals")}
                actionLabel="Create Deal"
              />
            ) : (
              <div className="space-y-4">
{recentDeals.map(deal => {
                  const contact = getContactById(deal.contact_id_c?.Id || deal.contact_id_c);
                  return (
                    <DealCard
                      key={deal.Id}
                      deal={deal}
                      contact={contact || deal.contact_id_c}
                      onEdit={() => navigate("/deals")}
                      onDelete={() => navigate("/deals")}
                      draggable={false}
                    />
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent Activities */}
          <Card className="p-6 bg-gradient-to-br from-surface to-gray-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">Recent Activities</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/activities")}
              >
                View All
              </Button>
            </div>
            
            {activities.length === 0 ? (
              <Empty
                icon="Activity"
                title="No activities yet"
                description="Start logging your customer interactions"
                action={() => navigate("/activities")}
                actionLabel="Log Activity"
              />
            ) : (
              <div className="space-y-4">
{activities.map(activity => {
                  const contact = getContactById(activity.contact_id_c?.Id || activity.contact_id_c);
                  const deal = activity.deal_id_c ? getDealById(activity.deal_id_c?.Id || activity.deal_id_c) : null;
                  return (
                    <ActivityItem
                      key={activity.Id}
                      activity={activity}
                      contact={contact || activity.contact_id_c}
                      deal={deal || activity.deal_id_c}
                    />
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;