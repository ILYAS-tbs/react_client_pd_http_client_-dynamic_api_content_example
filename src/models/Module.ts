// To parse this data:
//
//   import { Convert, Module } from "./file";
//
//   const module = Convert.toModule(json);

export interface Module {
  teacher: number;
  module: ModuleClass;
  class_group: ClassGroup;
}

export interface ClassGroup {
  class_group_id: string;
  name: string;
  school: string;
  teacher_list: string;
  academic_year: string;
}

export interface ModuleClass {
  module_id: string;
  module_name: string;
}

// Converts JSON strings to/from your types
export class ModuleConvert {
  public static toModule(json: string): Module {
    return JSON.parse(json);
  }

  public static moduleToJson(value: Module): string {
    return JSON.stringify(value);
  }
}
