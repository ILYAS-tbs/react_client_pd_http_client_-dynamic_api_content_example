export interface WeeklyMeal {
  school_id: number;
  school_name: string;
  label: string;
  weekly_meal_id: number | null;
  pdf_file: string | null;
  pdf_url: string | null;
  view_url: string | null;
  download_url: string | null;
  uploaded_by: number | null;
  uploaded_at: string | null;
  updated_at: string | null;
  has_pdf: boolean;
}

export interface ParentWeeklyMeal {
  student_id: string;
  student_name: string;
  school_id: number;
  school_name: string;
  weekly_meal_id: number | null;
  pdf_file: string | null;
  pdf_url: string | null;
  view_url: string | null;
  download_url: string | null;
  uploaded_at: string | null;
  updated_at: string | null;
  has_pdf: boolean;
}