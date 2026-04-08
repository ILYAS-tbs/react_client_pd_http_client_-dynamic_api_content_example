export interface BehaviourLinkedClassGroup {
  class_group_id: string;
  name: string;
}

export interface BehaviourLinkedModule {
  module_id: string;
  module_name: string;
}

export interface BehaviourLinkedStudent {
  student_id: string;
  full_name: string;
}

export interface BehaviourLinkedTeacher {
  user: number;
  full_name: string;
}

export interface BehaviourNote {
  behaviour_report_id: string;
  student: BehaviourLinkedStudent;
  teacher: BehaviourLinkedTeacher;
  class_group?: BehaviourLinkedClassGroup | null;
  module?: BehaviourLinkedModule | null;
  report: string;
  created_at: string;
}

export interface CreateBehaviourNotePayload {
  student_id: string;
  module_id?: string;
  class_group_id?: string;
  report: string;
}

export interface BehaviourFilters {
  student?: string;
  class?: string;
  module?: string;
  teacher?: string;
  date_from?: string;
  date_to?: string;
}