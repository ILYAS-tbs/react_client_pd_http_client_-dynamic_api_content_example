import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Download, Filter, Calendar, Award } from 'lucide-react';

const GradeReports: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState('child1');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const children = [
    { id: 'child1', name: 'أحمد محمد علي' },
    { id: 'child2', name: 'فاطمة محمد علي' }
  ];

  const periods = [
    { id: 'current', label: 'الفصل الحالي' },
    { id: 'semester1', label: 'الفصل الأول' },
    { id: 'semester2', label: 'الفصل الثاني' },
    { id: 'year', label: 'السنة الدراسية' }
  ];

  const gradeData = {
    child1: {
      overall: 16.5,
      trend: '+0.8',
      position: 5,
      totalStudents: 32,
      subjects: [
        {
          name: 'الرياضيات',
          current: 18,
          previous: 17,
          average: 15.2,
          assessments: [
            { name: 'امتحان الفصل الأول', grade: 18, max: 20, date: '2024-01-15', weight: 40 },
            { name: 'واجب منزلي 1', grade: 16, max: 20, date: '2024-01-10', weight: 20 },
            { name: 'اختبار قصير', grade: 19, max: 20, date: '2024-01-08', weight: 20 },
            { name: 'مشاركة صفية', grade: 17, max: 20, date: '2024-01-05', weight: 20 }
          ]
        },
        {
          name: 'اللغة العربية',
          current: 16,
          previous: 15,
          average: 14.8,
          assessments: [
            { name: 'امتحان الفصل الأول', grade: 16, max: 20, date: '2024-01-14', weight: 40 },
            { name: 'تعبير كتابي', grade: 18, max: 20, date: '2024-01-12', weight: 30 },
            { name: 'قراءة وفهم', grade: 14, max: 20, date: '2024-01-09', weight: 30 }
          ]
        },
        {
          name: 'العلوم',
          current: 17,
          previous: 16,
          average: 15.5,
          assessments: [
            { name: 'امتحان عملي', grade: 17, max: 20, date: '2024-01-13', weight: 50 },
            { name: 'امتحان نظري', grade: 16, max: 20, date: '2024-01-11', weight: 50 }
          ]
        },
        {
          name: 'التاريخ',
          current: 15,
          previous: 14,
          average: 13.8,
          assessments: [
            { name: 'امتحان الفصل الأول', grade: 15, max: 20, date: '2024-01-12', weight: 60 },
            { name: 'بحث تاريخي', grade: 16, max: 20, date: '2024-01-07', weight: 40 }
          ]
        }
      ]
    }
  };

  const currentData = gradeData[selectedChild as keyof typeof gradeData];
  const filteredSubjects = selectedSubject === 'all' 
    ? currentData.subjects 
    : currentData.subjects.filter(s => s.name === selectedSubject);

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600';
    if (grade >= 12) return 'text-blue-600';
    if (grade >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBgColor = (grade: number) => {
    if (grade >= 16) return 'bg-green-100 dark:bg-green-900';
    if (grade >= 12) return 'bg-blue-100 dark:bg-blue-900';
    if (grade >= 10) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4"></div>;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تقارير الدرجات</h2>
        <button className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Download className="h-4 w-4" />
          <span>تصدير التقرير</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الطفل</label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الفترة</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المادة</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">جميع المواد</option>
              {currentData.subjects.map((subject) => (
                <option key={subject.name} value={subject.name}>{subject.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Filter className="h-4 w-4" />
              <span>تطبيق</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overall Performance */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المعدل العام</p>
              <p className="text-2xl font-bold text-green-600">{currentData.overall}/20</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-500">{currentData.trend}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الترتيب</p>
              <p className="text-2xl font-bold text-blue-600">{currentData.position}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">من أصل {currentData.totalStudents} طالب</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">عدد المواد</p>
              <p className="text-2xl font-bold text-purple-600">{currentData.subjects.length}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">مواد دراسية</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">أعلى درجة</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.max(...currentData.subjects.map(s => s.current))}/20
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">في الرياضيات</p>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">أداء المواد</h3>
        <div className="space-y-4">
          {filteredSubjects.map((subject, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{subject.name}</h4>
                  {getTrendIcon(subject.current, subject.previous)}
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getGradeColor(subject.current)}`}>
                      {subject.current}/20
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">الدرجة الحالية</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{subject.average}/20</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">متوسط الصف</div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {subject.assessments.map((assessment, assessmentIndex) => (
                  <div key={assessmentIndex} className={`p-3 rounded-lg ${getGradeBgColor(assessment.grade)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">{assessment.name}</h5>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{assessment.weight}%</span>
                    </div>
                    <div className={`text-lg font-bold ${getGradeColor(assessment.grade)}`}>
                      {assessment.grade}/{assessment.max}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{assessment.date}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Appeals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">طلبات مراجعة الدرجات</h3>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            تقديم طلب مراجعة
          </button>
        </div>
        
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>لا توجد طلبات مراجعة درجات حالياً</p>
          <p className="text-sm mt-1">يمكنك تقديم طلب مراجعة إذا كنت تعتقد أن هناك خطأ في التقييم</p>
        </div>
      </div>
    </div>
  );
};

export default GradeReports;