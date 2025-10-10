//! Reponse shape of aullauth login & session

export interface BackendUser {
  status: number;
  data: Data;
  meta: Meta;
}

export interface Data {
  user: User;
  methods: Method[];
}

export interface Method {
  method: string;
  at: number;
  email: string;
}

export interface User {
  id: number;
  display: string;
  email: string;
  has_usable_password: boolean;
  username: string;
}

export interface Meta {
  is_authenticated: boolean;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toBackendUser(json: string): BackendUser {
    return JSON.parse(json);
  }

  public static backendUserToJson(value: BackendUser): string {
    return JSON.stringify(value);
  }
}
