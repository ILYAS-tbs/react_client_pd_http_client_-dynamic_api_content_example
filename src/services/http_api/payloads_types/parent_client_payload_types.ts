export interface PostAbsenceReportPayload {
  absence_date: string;
  absence_reason: string;
  more_details: string;
  is_urgent: boolean;
  proof_document: File | null;
  student_id: string;
}
