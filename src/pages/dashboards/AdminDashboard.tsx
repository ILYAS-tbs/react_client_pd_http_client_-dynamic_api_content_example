import React, { useState } from "react";
import {
    Users,
    Settings,
    TrendingUp,
    Shield,
    Search,
    School,
    UserCheck,
    Globe,
    Plus,
    LayoutGrid
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const { language } = useLanguage();

    const stats = [
        { title: "Total Schools", value: "12", icon: School, color: "bg-primary-500" },
        { title: "Total Teachers", value: "145", icon: UserCheck, color: "bg-green-500" },
        { title: "Total Parents", value: "850", icon: Users, color: "bg-purple-500" },
        { title: "Active Licenses", value: "95%", icon: TrendingUp, color: "bg-orange-500" },
    ];

    const tabs = [
        { id: "overview", label: "Overview", icon: LayoutGrid },
        { id: "users", label: "User Management", icon: Users },
        { id: "platform", label: "Platform Data", icon: Globe },
        { id: "settings", label: "Admin Settings", icon: Shield },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "users":
                return (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search schools, teachers..."
                                        className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-64"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                            <th className="pb-3 font-medium">Name</th>
                                            <th className="pb-3 font-medium">Type</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium">Joined</th>
                                            <th className="pb-3 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {[
                                            { name: "El-Hikmah Private School", type: "School", status: "Active", joined: "Jan 2024" },
                                            { name: "Ahmed Benaissa", type: "Teacher", status: "Active", joined: "Feb 2024" },
                                            { name: "Public School Oran", type: "School", status: "Pending", joined: "Mar 2024" },
                                            { name: "Fatima Bourahla", type: "Parent", status: "Active", joined: "Jan 2024" },
                                        ].map((user, i) => (
                                            <tr key={i} className="text-gray-900 dark:text-white">
                                                <td className="py-4 text-sm font-medium">{user.name}</td>
                                                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{user.type}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/20' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{user.joined}</td>
                                                <td className="py-4">
                                                    <button className="text-primary-500 hover:text-primary-600 font-medium text-sm">Details</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case "platform":
                return (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 font-sans">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Website Content</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
                                    <input type="email" defaultValue="support@pedaconnect.com" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maintenance Mode</label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Disabled</span>
                                    </div>
                                </div>
                                <button className="btn-primary w-full py-2 rounded-lg">Save Changes</button>
                            </div>
                        </div>
                    </div>
                );
            case "settings":
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Security</h3>
                        <div className="space-y-4">
                            <button className="flex items-center gap-3 w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                                <Shield className="h-5 w-5 text-primary-500" />
                                <div className="text-left">
                                    <p className="font-medium text-gray-900 dark:text-white">API Key Access</p>
                                    <p className="text-xs text-gray-500">Manage external application integrations</p>
                                </div>
                            </button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                        </div>
                                        <div className={`${stat.color} p-3 rounded-lg`}>
                                            <stat.icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Growth</h3>
                            <div className="h-64 flex items-end justify-between gap-2">
                                {[40, 60, 45, 90, 80, 100, 120].map((h, i) => (
                                    <div key={i} className="bg-primary-500/20 w-full rounded-t-lg transition-all hover:bg-primary-500 cursor-pointer" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <DashboardLayout
            title="PedaConnect Team Admin"
            subtitle="Universal platform management & control center"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default AdminDashboard;
