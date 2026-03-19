import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, X, Zap, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCSRFToken } from '../../lib/get_CSRFToken';
import { teacher_dashboard_client } from '../../services/http_api/teacher-dashboard/teacher_dashboard_client';

interface GradingFormulaBuilderProps {
  moduleId: string | number;
  classGroupId: string | number;
  semester: 's1' | 's2' | 's3';
  onSave: () => void;
}

interface FormulaConfig {
  [key: string]: number;
}

interface ValidationError {
  type: 'warning' | 'error';
  message: string;
}

const ASSESSMENT_TYPES = [
  { key: 'evaluation', label: { en: 'Evaluation (Ta9wim)', ar: 'التقويم' }, icon: '📋' },
  { key: 'devoir_1', label: { en: 'Assignment 1', ar: 'الفرض الأول' }, icon: '📝' },
  { key: 'devoir_2', label: { en: 'Assignment 2', ar: 'الفرض الثاني' }, icon: '📝' },
  { key: 'homeworks', label: { en: 'Homeworks', ar: 'الواجبات' }, icon: '🏠' },
{ key: 'tests', label: { en: 'Tests', ar: 'الاختبارات القصيرة' }, icon: '✏️' },
  { key: 'exam', label: { en: 'Exam', ar: 'الامتحان' }, icon: '🎯' }
];

const DEFAULT_FORMULA: FormulaConfig = {
  evaluation: 15,
  devoir_1: 15,
  devoir_2: 15,
  homeworks: 20,
  tests: 20,
  exam: 15
};

// ✅ EXPORTED UTILITY FUNCTION: Calculate average based on formula
export const calculateAverageFromFormula = (
  grades: FormulaConfig,
  formula: FormulaConfig
): number => {
  let weightedSum = 0;
  let totalActivedWeight = 0;
  
  for (const [key, weight] of Object.entries(formula)) {
    if (weight > 0 && grades[key] !== undefined && grades[key] !== null) {
      weightedSum += grades[key] * weight;
      totalActivedWeight += weight;
    }
  }
  
  if (totalActivedWeight === 0) return 0;
  return Math.round((weightedSum / totalActivedWeight) * 100) / 100;
};

// ✅ EXPORTED UTILITY FUNCTION: Fetch formula for a specific module/class/semester
export const fetchGradingFormula = async (
  moduleId: string | number,
  classGroupId: string | number,
  semester: 's1' | 's2' | 's3'
): Promise<FormulaConfig> => {
  try {
    const response = await teacher_dashboard_client.get_grading_formula(moduleId, classGroupId, semester);
    if (response.ok && response.data?.formula_config) {
      return response.data.formula_config;
    }
  } catch (error) {
    console.error('Error fetching formula:', error);
  }
  return DEFAULT_FORMULA;
};

const GradingFormulaBuilder: React.FC<GradingFormulaBuilderProps> = ({
  moduleId,
  classGroupId,
  semester,
  onSave
}) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [formula, setFormula] = useState<FormulaConfig>(DEFAULT_FORMULA);
  const [originalFormula, setOriginalFormula] = useState<FormulaConfig>(DEFAULT_FORMULA);
  const [totalWeight, setTotalWeight] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // ✅ ADDED MISSING STATE
  const [isRecalculating, setIsRecalculating] = useState(false); // ✅ NEW: Recalculate state
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [sampleGrades, setSampleGrades] = useState<FormulaConfig>({
    evaluation: 18,
    devoir_1: 16,
    devoir_2: 17,
    homeworks: 19,
    tests: 15,
    exam: 14
  });

  // Load formula on mount or when dependencies change
  useEffect(() => {
    if (moduleId && classGroupId) {
      loadFormula();
    }
  }, [moduleId, classGroupId, semester]);

  const loadFormula = async () => {
    setIsLoading(true); // ✅ SET LOADING
    try {
      const response = await teacher_dashboard_client.get_grading_formula(moduleId, classGroupId, semester);
      if (response.ok && response.data?.formula_config) {
        setFormula(response.data.formula_config);
        setOriginalFormula(response.data.formula_config);
        updateTotal(response.data.formula_config);
      } else if (response.status === 404) {
        setFormula(DEFAULT_FORMULA);
        setOriginalFormula(DEFAULT_FORMULA);
        updateTotal(DEFAULT_FORMULA);
      }
    } catch (error) {
      console.error('Error loading formula:', error);
    } finally {
      setIsLoading(false); // ✅ RESET LOADING
    }
  };

  const updateTotal = (formulaConfig: FormulaConfig) => {
    const total = Object.values(formulaConfig).reduce((sum, w) => sum + w, 0);
    setTotalWeight(total);
  };

  const handleWeightChange = (assessmentKey: string, newWeight: number) => {
    const weight = Math.max(0, Math.min(100, newWeight || 0));
    const updatedFormula = { ...formula, [assessmentKey]: weight };
    setFormula(updatedFormula);
    updateTotal(updatedFormula);
    setSuccessMessage('');
  };

  const handleSampleGradeChange = (assessmentKey: string, newGrade: number) => {
    setSampleGrades({
      ...sampleGrades,
      [assessmentKey]: Math.max(0, Math.min(20, newGrade || 0))
    });
  };

  const validateFormula = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (totalWeight !== 100) {
      errors.push({
        type: 'error',
        message: language === 'ar'
          ? `إجمالي الأوزان يجب أن يساوي 100%، الحالي: ${totalWeight}%`
          : `Total weights must equal 100%. Currently: ${totalWeight}%`
      });
    }
    const activeAssessments = Object.values(formula).filter(w => w > 0).length;
    if (activeAssessments === 0) {
      errors.push({
        type: 'error',
        message: language === 'ar'
          ? 'يجب تفعيل نوع تقييم واحد على الأقل'
          : 'At least one assessment type must be active'
      });
    }
    return errors;
  };

  const calculateSampleAverage = (): number | null => {
    const errors = validateFormula();
    if (errors.some(e => e.type === 'error')) return null;
    let weightedSum = 0;
    let totalActivedWeight = 0;
    for (const [key, weight] of Object.entries(formula)) {
      if (weight > 0 && sampleGrades[key] !== undefined) {
        weightedSum += sampleGrades[key] * weight;
        totalActivedWeight += weight;
      }
    }
    if (totalActivedWeight === 0) return null;
    return Math.round((weightedSum / totalActivedWeight) * 100) / 100;
  };

  const distributeEqually = () => {
    const activeCount = ASSESSMENT_TYPES.length;
    const equal = Math.floor(100 / activeCount);
    const remainder = 100 % activeCount;
    const newFormula: FormulaConfig = {};
    ASSESSMENT_TYPES.forEach((assessment, index) => {
      // Distribute remainder to the first items
      newFormula[assessment.key] = equal + (index < remainder ? 1 : 0);
    });
    setFormula(newFormula);
    updateTotal(newFormula);
    setSuccessMessage('');
  };

  const distributeByAssessmentType = () => {
    // ✅ Ensures sum is exactly 100
    const suggested: FormulaConfig = {
      evaluation: 10,
      devoir_1: 15,
      devoir_2: 15,
      homeworks: 15,
      tests: 20,
      exam: 25
    };
    setFormula(suggested);
    updateTotal(suggested);
    setSuccessMessage('');
  };

  const resetFormula = () => {
    setFormula({ ...originalFormula });
    updateTotal(originalFormula);
    setSuccessMessage('');
  };

  const handleSave = async () => {
    const errors = validateFormula();
    setValidationErrors(errors);
    if (errors.some(e => e.type === 'error')) {
      return;
    }
    setIsSaving(true);
    setSuccessMessage('');
    try {
      const csrfToken = getCSRFToken() ?? '';
      const response = await teacher_dashboard_client.save_grading_formula(
        {
          module_id: moduleId,
          class_group_id: classGroupId,
          semester,
          formula_config: formula
        },
        csrfToken
      );
      if (response.ok) {
        setOriginalFormula(formula);
        setSuccessMessage(
          language === 'ar'
            ? 'تم حفظ الصيغة بنجاح!'
            : 'Formula saved successfully!'
        );
        onSave?.();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorMessage = response.data?.error || response.data?.detail || (language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving formula');
        setValidationErrors([{
          type: 'error',
          message: errorMessage
        }]);
      }
    } catch (error) {
      console.error('Error saving formula:', error);
      setValidationErrors([{
        type: 'error',
        message: language === 'ar' ? 'خطأ في الاتصال بالخادم' : 'Server connection error'
      }]);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ NEW: Handle recalculation of all averages
  const handleRecalculateAllAverages = async () => {
    setIsRecalculating(true);
    setValidationErrors([]);
    setSuccessMessage('');
    try {
      const csrfToken = getCSRFToken() ?? '';
      const response = await teacher_dashboard_client.recalculate_all_averages(
        {
          module_id: moduleId,
          class_group_id: classGroupId,
          semester
        },
        csrfToken
      );
      if (response.ok) {
        const updatedCount = response.data?.updated_count || 0;
        setSuccessMessage(
          language === 'ar'
            ? `تم إعادة حساب المعدلات بنجاح لـ ${updatedCount} طالب!`
            : `Successfully recalculated averages for ${updatedCount} students!`
        );
        onSave?.();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        const errorMessage = response.data?.error || response.data?.detail || (language === 'ar' ? 'حدث خطأ أثناء إعادة الحساب' : 'Error recalculating averages');
        setValidationErrors([{
          type: 'error',
          message: errorMessage
        }]);
      }
    } catch (error) {
      console.error('Error recalculating averages:', error);
      setValidationErrors([{
        type: 'error',
        message: language === 'ar' ? 'خطأ في الاتصال بالخادم' : 'Server connection error'
      }]);
    } finally {
      setIsRecalculating(false);
    }
  };

  const isModified = JSON.stringify(formula) !== JSON.stringify(originalFormula);
  const sampleAverage = calculateSampleAverage();
  const isValid = validationErrors.every(e => e.type !== 'error');

  return (
    <div className="w-full">
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-white" />
              <div>
                <h3 className="text-white font-semibold">
                  {language === 'ar' ? 'منشئ صيغة التقييم' : 'Grading Formula Builder'}
                </h3>
                <p className="text-blue-100 text-sm">
                  {language === 'ar'
                    ? 'خصص وزن كل نوع تقييم'
                    : 'Customize weights for each assessment type'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isModified && (
                <span className="bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">
                  {language === 'ar' ? 'معدل' : 'Modified'}
                </span>
              )}
              <div className="text-white font-bold text-lg">{totalWeight}%</div>
            </div>
          </div>
        </div>
      )}
      {isExpanded && (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'صيغة التقييم' : 'Assessment Formula'} - {semester.toUpperCase()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {language === 'ar'
                  ? 'حدد أوزان كل عنصر تقييم (يجب أن يكون الإجمالي 100%)'
                  : 'Set weights for each assessment (total must equal 100%)'}
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {isLoading ? (
             <div className="flex justify-center items-center py-10">
               <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
             </div>
          ) : (
            <>
              {validationErrors.length > 0 && (
                <div className="space-y-2">
                  {validationErrors.map((error, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-4 rounded-lg ${
                        error.type === 'error'
                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                          : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700'
                      }`}
                    >
                      <AlertCircle
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          error.type === 'error'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}
                      />
                      <p
                        className={`text-sm ${
                          error.type === 'error'
                            ? 'text-red-800 dark:text-red-200'
                            : 'text-yellow-800 dark:text-yellow-200'
                        }`}
                      >
                        {error.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    {language === 'ar' ? 'توزيع الأوزان' : 'Weight Distribution'}
                  </label>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                    totalWeight === 100
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {totalWeight}% / 100%
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ASSESSMENT_TYPES.map(assessment => (
                    <div
                      key={assessment.key}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                    >
                      <label className="block mb-2">
                        <span className="text-2xl mr-2">{assessment.icon}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {(assessment.label as Record<string, string>)[language] || assessment.label.en}
                        </span>
                      </label>
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formula[assessment.key]}
                          onChange={(e) => handleWeightChange(assessment.key, parseInt(e.target.value))}
                          className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-500 rounded text-center font-bold bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, formula[assessment.key] ?? 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>👁️</span>
                  {language === 'ar' ? 'معاينة الحساب' : 'Calculation Preview'}
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {language === 'ar' ? 'أدخل درجات العينة' : 'Sample Grades'}
                    </p>
                    <div className="space-y-2">
                      {ASSESSMENT_TYPES.filter(a => (formula[a.key] ?? 0) > 0).map(assessment => (
                        <div key={assessment.key} className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-fit">
                            {assessment.icon} {(assessment.label as Record<string, string>)[language] || assessment.label.en}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={sampleGrades[assessment.key] || ''}
                            onChange={(e) => handleSampleGradeChange(assessment.key, parseFloat(e.target.value))}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-500">/20</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {language === 'ar' ? 'النتيجة المتوقعة' : 'Expected Result'}
                    </p>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-blue-500">
                      {sampleAverage !== null ? (
                        <div>
                          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                            {sampleAverage.toFixed(2)}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">/ 20</p>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          {language === 'ar' ? 'أصلح الأوزان أولاً' : 'Fix weights first'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={distributeByAssessmentType}
                  className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {language === 'ar' ? '💡 اقتراح' : '💡 Suggest'}
                </button>
                <button
                  onClick={distributeEqually}
                  className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {language === 'ar' ? '⚖️ توزيع متساوي' : '⚖️ Equally'}
                </button>
                {isModified && (
                  <button
                    onClick={resetFormula}
                    className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    {language === 'ar' ? '↶ إعادة تعيين' : '↶ Reset'}
                  </button>
                )}
                {/* ✅ NEW: Recalculate All Averages Button */}
                <button
                  onClick={handleRecalculateAllAverages}
                  disabled={isRecalculating}
                  className="px-4 py-2 text-sm font-medium bg-purple-500 dark:bg-purple-600 text-white rounded-lg hover:bg-purple-600 dark:hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  title={language === 'ar' ? 'إعادة حساب معدلات جميع الطلاب بناءً على الصيغة الحالية' : 'Recalculate all student averages based on the current formula'}
                >
                  {isRecalculating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {language === 'ar' ? 'جاري الحساب...' : 'Calculating...'}
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      {language === 'ar' ? '⚡ إعادة حساب' : '⚡ Recalculate'}
                    </>
                  )}
                </button>
                <div className="flex-grow" />
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isValid || isSaving || !isModified}
                  className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {language === 'ar' ? 'حفظ الصيغة' : 'Save Formula'}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GradingFormulaBuilder;
