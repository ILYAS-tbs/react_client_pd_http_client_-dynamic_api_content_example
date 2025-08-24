import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SchoolDashboard from "./pages/dashboards/SchoolDashboard";
import TeacherDashboard from "./pages/dashboards/TeacherDashboard";
import ParentDashboard from "./pages/dashboards/ParentDashboard";
import ConfirmationCode from "./pages/ConfirmationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

function App() {
  // ask for an initial CSRFToken from the server :
  useEffect(() => {
    async function seed() {
      await fetch(
        "http://127.0.0.1:8000/user-auth/_allauth/browser/v1/auth/session",
        {
          method: "GET",
          credentials: "include",
        }
      );
    }
    seed();
  }, []);
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/confirmation-code"
                    element={<ConfirmationCode />}
                  />

                  <Route
                    path="/school-dashboard"
                    element={
                      // <ProtectedRoute allowedRoles={["school"]}>
                      <SchoolDashboard />
                      // </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/teacher-dashboard"
                    element={
                      // <ProtectedRoute allowedRoles={["teacher"]}>
                      <TeacherDashboard />
                      // </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/parent-dashboard"
                    element={
                      // <ProtectedRoute allowedRoles={["parent"]}>
                      <ParentDashboard />
                      // </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;

// import React, { useState, useEffect } from "react";
// import { Moon, Sun, GraduationCap } from "lucide-react";
// import "./index.css";

// function App() {
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   // Load theme preference from localStorage on mount
//   useEffect(() => {
//     const savedTheme = localStorage.getItem("theme");
//     if (savedTheme === "dark") {
//       setIsDarkMode(true);
//       document.documentElement.classList.add("dark");
//     } else if (savedTheme === "light") {
//       setIsDarkMode(false);
//       document.documentElement.classList.remove("dark");
//     } else {
//       // Default to system preference
//       const systemPrefersDark = window.matchMedia(
//         "(prefers-color-scheme: dark)"
//       ).matches;
//       setIsDarkMode(systemPrefersDark);
//       if (systemPrefersDark) {
//         document.documentElement.classList.add("dark");
//       }
//     }
//   }, []);

//   const toggleTheme = () => {
//     const newMode = !isDarkMode;
//     setIsDarkMode(newMode);

//     if (newMode) {
//       document.documentElement.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
//       {/* Header with logo and theme toggle */}
//       <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-20">
//             {/* Logo */}
//             <div className="flex items-center space-x-4">
//               <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
//                 <img
//                   src="/assets/logo.png"
//                   alt="PedaConnect Logo"
//                   className="h-12 w-12 object-contain"
//                   onError={(e) => {
//                     const target = e.currentTarget;
//                     target.style.display = "none";
//                     const fallback =
//                       target.parentElement?.querySelector(".fallback-icon");
//                     if (fallback) {
//                       fallback.classList.remove("hidden");
//                     }
//                   }}
//                 />
//                 <GraduationCap className="h-12 w-12 text-white hidden fallback-icon" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                   PedaConnect
//                 </h1>
//                 <p
//                   className="text-sm text-blue-600 dark:text-blue-400 font-medium"
//                   dir="rtl"
//                 >
//                   تعليم متابع نجاح مؤكد
//                 </p>
//               </div>
//             </div>

//             {/* Theme Toggle */}
//             <button
//               onClick={toggleTheme}
//               className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
//               aria-label="Toggle theme"
//             >
//               {isDarkMode ? (
//                 <Sun className="h-6 w-6 text-yellow-500" />
//               ) : (
//                 <Moon className="h-6 w-6 text-gray-700" />
//               )}
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full text-center">
//           {/* Logo Section */}
//           <div className="mb-8">
//             <div className="mx-auto w-32 h-32 bg-white dark:bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
//               <img
//                 src="/assets/logo.png"
//                 alt="PedaConnect Logo"
//                 className="h-20 w-20 object-contain"
//                 onError={(e) => {
//                   const target = e.currentTarget;
//                   target.style.display = "none";
//                   const fallback =
//                     target.parentElement?.querySelector(".fallback-icon");
//                   if (fallback) {
//                     fallback.classList.remove("hidden");
//                   }
//                 }}
//               />
//               <GraduationCap className="h-20 w-20 text-blue-600 hidden fallback-icon" />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
//               PedaConnect
//             </h1>
//             <p className="text-lg text-gray-600 dark:text-gray-400" dir="rtl">
//               تعليم متابع نجاح مؤكد
//             </p>
//           </div>

//           {/* Under Development Message */}
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
//             <div className="mb-6">
//               <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
//                 <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
//                   <span className="text-white font-bold text-sm">!</span>
//                 </div>
//               </div>
//               <h2
//                 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
//                 dir="rtl"
//               >
//                 قيد التطوير حالياً
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400 mb-6" dir="rtl">
//                 نحن نعمل بجد لتقديم أفضل تجربة تعليمية لكم. الموقع سيكون متاحاً
//                 قريباً.
//               </p>
//             </div>
//           </div>

//           {/* Features Preview */}
//           <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
//               <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
//                 <span className="text-green-600 dark:text-green-400 text-sm">
//                   👨‍🏫
//                 </span>
//               </div>
//               <p className="text-sm text-gray-600 dark:text-gray-400" dir="rtl">
//                 لوحة المعلم
//               </p>
//             </div>
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
//               <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
//                 <span className="text-blue-600 dark:text-blue-400 text-sm">
//                   👨‍👩‍👧‍👦
//                 </span>
//               </div>
//               <p className="text-sm text-gray-600 dark:text-gray-400" dir="rtl">
//                 لوحة الأولياء
//               </p>
//             </div>
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
//               <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
//                 <span className="text-purple-600 dark:text-purple-400 text-sm">
//                   🏫
//                 </span>
//               </div>
//               <p className="text-sm text-gray-600 dark:text-gray-400" dir="rtl">
//                 لوحة المدرسة
//               </p>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="text-center text-sm text-gray-500 dark:text-gray-400">
//             <p dir="rtl">© 2025 PedaConnect. جميع الحقوق محفوظة.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default App;
