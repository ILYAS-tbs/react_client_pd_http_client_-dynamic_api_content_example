export interface StudentPerformance {
    student_id:                  string;
    student_name:                string;
    class_group_id:              string | null;
    class_group_name:            string;
    class_group_students_number: number;
    student_rank:                number;
    /** Overall average across all modules for the semester using stored teacher-entered averages. */
    s1_overall:                  number | null;
    s2_overall:                  number | null;
    s3_overall:                  number | null;
    modules_stats:               ModulesStat[];
}

export interface ModulesStat {
    module_id:   number;
    module_name: string;

    // Student's semester averages stored in StudentGrades, null if not set.
    s1_average: number | null;
    s2_average: number | null;
    s3_average: number | null;

    // Individual grade fields — s1
    s1_devoir_1:   number | null;
    s1_devoir_2:   number | null;
    s1_tests:      number | null;
    s1_homeworks:  number | null;
    s1_evaluation: number | null;
    s1_exam:       number | null;

    // Individual grade fields — s2
    s2_devoir_1:   number | null;
    s2_devoir_2:   number | null;
    s2_tests:      number | null;
    s2_homeworks:  number | null;
    s2_evaluation: number | null;
    s2_exam:       number | null;

    // Individual grade fields — s3
    s3_devoir_1:   number | null;
    s3_devoir_2:   number | null;
    s3_tests:      number | null;
    s3_homeworks:  number | null;
    s3_evaluation: number | null;
    s3_exam:       number | null;

    // Class averages per semester for this module
    class_s1_average: number | null;
    class_s2_average: number | null;
    class_s3_average: number | null;
}
