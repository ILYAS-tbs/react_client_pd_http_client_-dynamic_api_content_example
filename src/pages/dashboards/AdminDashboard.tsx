import React, { useState } from "react";
import {
  Users,
  FileText,
  School,
  MessageSquare,
  CreditCard,
  LayoutGrid,
  Activity,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { OverviewTab } from "../../components/AdminDashboard/OverviewTab";
import { UsersManagement } from "../../components/AdminDashboard/UsersManagement";
import { SchoolsManagement } from "../../components/AdminDashboard/SchoolsManagement";
import { ReportsManagement } from "../../components/AdminDashboard/ReportsManagement";
import { AnnouncementsManagement } from "../../components/AdminDashboard/AnnouncementsManagement";
import { MembershipsManagement } from "../../components/AdminDashboard/MembershipsManagement";
import { ActivityCenter } from "../../components/AdminDashboard/ActivityCenter";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeReportType, setActiveReportType] = useState<"absence" | "behaviour">("absence");
  const { language } = useLanguage();

  const tabs = [
    { id: "overview", label: getTranslation("admin.overview", language), icon: LayoutGrid },
    { id: "schools", label: getTranslation("admin.schools", language), icon: School },
    { id: "users", label: getTranslation("admin.userManagement", language), icon: Users },
    { id: "reports", label: getTranslation("admin.reports", language), icon: FileText },
    { id: "announcements", label: getTranslation("admin.announcements", language), icon: MessageSquare },
    { id: "subscriptions", label: getTranslation("admin.subscriptions", language), icon: CreditCard },
    { id: "activity", label: getTranslation("admin.activity", language), icon: Activity },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "schools":
        return <SchoolsManagement />;

      case "users":
        return <UsersManagement />;

      case "reports":
        return (
          <div className="space-y-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveReportType("absence")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeReportType === "absence"
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {getTranslation("admin.absenceReports", language)}
              </button>
              <button
                onClick={() => setActiveReportType("behaviour")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeReportType === "behaviour"
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {getTranslation("admin.behaviourReports", language)}
              </button>
            </div>
            <ReportsManagement reportType={activeReportType} />
          </div>
        );

      case "announcements":
        return <AnnouncementsManagement />;

      case "subscriptions":
        return <MembershipsManagement />;

      case "activity":
        return <ActivityCenter />;

      default:
        return <OverviewTab />;
    }
  };

  return (
    <DashboardLayout
      title={getTranslation("admin.platformAdmin", language)}
      subtitle={getTranslation("admin.controlCenterSubtitle", language)}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default AdminDashboard;
