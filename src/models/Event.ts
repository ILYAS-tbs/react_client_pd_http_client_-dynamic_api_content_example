export interface ClassGroupNested {
  class_group_id: string;
  name: string;
}

export interface EventJson {
  event_id: string;
  title: string;
  category: string;
  date: string;
  place: string;
  time: string;
  desc: string | null;
  file: string | null;
  event_type: "global" | "targeted";
  class_groups: ClassGroupNested[];
  created_at: string;
  updated_at: string;
}

interface EventParams {
  event_id: string;
  title: string;
  category: string;
  date: string;
  place: string;
  time: string;
  desc: string | null;
  file: string | null;
  event_type: "global" | "targeted";
  class_groups: ClassGroupNested[];
  created_at: string;
  updated_at: string;
}

export class Event {
  event_id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  desc: string | null;
  file: string | null;
  place: string;
  event_type: "global" | "targeted";
  class_groups: ClassGroupNested[];
  created_at: string;
  updated_at: string;

  constructor({
    event_id,
    title,
    category,
    date,
    time,
    desc,
    place,
    file,
    event_type,
    class_groups,
    created_at,
    updated_at,
  }: EventParams) {
    this.event_id = event_id;
    this.title = title;
    this.category = category;
    this.date = date;
    this.time = time;
    this.desc = desc;
    this.place = place;
    this.file = file;
    this.event_type = event_type;
    this.class_groups = class_groups;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static fromJson(json: EventJson) {
    return new Event({
      event_id: json.event_id,
      title: json.title,
      category: json.category,
      date: json.date,
      time: json.time,
      desc: json.desc,
      place: json.place,
      file: json.file,
      event_type: json.event_type,
      class_groups: json.class_groups,
      created_at: json.created_at,
      updated_at: json.updated_at,
    });
  }
}
