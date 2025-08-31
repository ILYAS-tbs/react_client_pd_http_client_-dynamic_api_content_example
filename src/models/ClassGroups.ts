export interface ClassGroupJson {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: string;
  time_table: string;
  academic_year: string;
  description: string;
}

interface ClassGroupParams {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: string;
  time_table: string;
  academic_year: string;
  description: string;
}
export class ClassGroup {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: string;
  time_table: string;
  academic_year: string;
  description: string;

  constructor({
    class_group_id,
    name,
    school,
    teacher_list,
    time_table,
    academic_year,
    description,
  }: ClassGroupParams) {
    this.class_group_id = class_group_id;
    this.name = name;
    this.school = school;
    this.teacher_list = teacher_list;
    this.time_table = time_table;
    this.academic_year = academic_year;
    this.description = description;
  }

  static formJson(json: ClassGroupJson) {
    return new ClassGroup({
      class_group_id: json.class_group_id,
      name: json.name,
      school: json.school,
      teacher_list: json.teacher_list,
      time_table: json.time_table,
      academic_year: json.academic_year,
      description: json.description,
    });
  }
}
