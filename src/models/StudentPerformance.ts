// To parse this data:
//
//   import { Convert, StudentPerformance } from "./file";
//
//   const studentPerformance = Convert.toStudentPerformance(json);

export interface StudentPerformance {
    student_id:                   string;
    student_name:                 string;
    student_overall_avg:          number;
    class_group_id:               string;
    class_group_name:             string;
    class_group_students_number:  number;
    class_group_students_average: number;
    student_rank:                 number;
    modules:                      Module[];
    modules_stats:                ModulesStat[];
}

export interface Module {
    module_id:   string;
    module_name: string;
}

export interface ModulesStat {
    module_name:   string;
    module_marks:  ModuleMark[];
    class_average: number;
}

export interface ModuleMark {
    id:            number;
    student:       Student;
    class_group:   ClassGroup;
    s1_devoir_1:   number;
    s1_devoir_2:   number;
    s1_tests:      number;
    s1_homeworks:  number;
    s1_evaluation: number;
    s1_exam:       number;
    s1_average:    number;
    s2_devoir_1:   number;
    s2_devoir_2:   number;
    s2_tests:      number;
    s2_homeworks:  number;
    s2_evaluation: number;
    s2_exam:       number;
    s2_average:    number;
    year:          number;
    teacher:       number;
    module:        string;
}

export interface ClassGroup {
    class_group_id: string;
    name:           string;
    school:         number;
    teacher_list:   null;
    academic_year:  string;
}

export interface Student {
    student_id:      string;
    full_name:       string;
    is_absent:       boolean;
    phone:           string;
    academic_state:  string;
    date_of_birth:   Date;
    trimester_grade: number;
}

// Converts JSON strings to/from your types
export class StudentPerformanceConvert {
    public static toStudentPerformance(json: string): StudentPerformance {
        return JSON.parse(json);
    }

    public static studentPerformanceToJson(value: StudentPerformance): string {
        return JSON.stringify(value);
    }
}
