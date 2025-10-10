export interface EventJson {
  event_id: string;
  title: string;
  category: string;
  date: string;
  place: string;
  time: string;
  desc: string | null;
  schools: string[];
}

interface EventParams {
  event_id: string;
  title: string;
  category: string;
  date: string;
  place: string;
  time: string;
  desc: string | null;

  schools: string[];
}
export class Event {
  event_id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  desc: string | null;

  place: string;
  schools: string[];

  constructor({
    event_id,
    title,
    category,
    date,
    time,
    desc,
    place,
    schools,
  }: EventParams) {
    this.event_id = event_id;
    this.title = title;
    this.category = category;
    this.date = date;
    this.time = time;
    this.desc = desc;
    this.place = place;
    this.schools = schools;
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
      schools: json.schools,
    });
  }
}
