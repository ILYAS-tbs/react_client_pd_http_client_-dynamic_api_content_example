export interface Module {
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
