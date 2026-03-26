export interface SchoolSemesterStats {
  school_average: number;
  school_max_average: number;
  school_min_average: number;
  failed_students_number: number;
}

export interface TopStudent {
  full_name: string;
  average: number;
}

export interface GroupsStat {
  class_group: string;
  class_group_id: string;
  number_of_students: number;
  s1_average: number;
  s1_max_average: number;
  s1_top_student: TopStudent | null;
  s1_failed_count: number;
  s1_success_ratio: number;
  s2_average: number;
  s2_max_average: number;
  s2_top_student: TopStudent | null;
  s2_failed_count: number;
  s2_success_ratio: number;
  s3_average: number;
  s3_max_average: number;
  s3_top_student: TopStudent | null;
  s3_failed_count: number;
  s3_success_ratio: number;
}

export interface SemestersStat {
  semester: string;
  module_id: number;
  module_name: string;
  class_group: string;
  class_group_id: string;
  module_average: number;
}

export interface SchoolStat {
  number_of_students: number;
  s1_stats: SchoolSemesterStats;
  s2_stats: SchoolSemesterStats;
  s3_stats: SchoolSemesterStats;
  groups_stats: GroupsStat[];
  semesters_stats: SemestersStat[];
}
