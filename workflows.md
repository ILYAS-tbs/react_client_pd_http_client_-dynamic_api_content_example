# 🔄 Project Workflows

This document outlines the core workflows for the PedaConnect platform, detailing the interactions between the frontend dashboards and the backend API services.

## 🔑 Authentication Workflow
1. **Login**: User submits credentials via `Login.tsx`.
2. **Context**: `AuthContext.tsx` calls `authService.login()`.
3. **CSRF**: Initial `App.tsx` load fetches a CSRF token from the server.
4. **Session**: On success, the backend returns user details and a session/token.
5. **Role Routing**: The application identifies the user role (School, Teacher, Parent) and redirects to the appropriate dashboard.

---

## 🏫 School Dashboard Workflows

### Student Management
- **Fetch**: `SchoolDashboard.tsx` calls `getStudents()` to populate `StudentManagement.tsx`.
- **Create/Update**: Uses `POST` or `PATCH` requests with `FormData` (especially if student images are involved).
- **Mapping**: Backend `student_id` is mapped to frontend `id`, and birthday is converted to age for UI consistency.

### Teacher Management
- **Assignment**: School admins assign teachers to classes using the `TeacherManagement` component.
- **Data Flow**: `PATCH` requests are used to update teacher profiles or schedules.

---

## 👨‍🏫 Teacher Dashboard Workflows

### Grade Management
- **Entry**: Teachers enter grades via `GradeManager.tsx`.
- **Validation**: Frontend validates grade ranges before sending a `POST/PUT` request to the backend.
- **Reflection**: Grades update the student's `trimester_grade` in the database, which is later fetched by parents.

### Attendance Tracking
- **Interaction**: Teachers mark absences in `TeacherAbsenceManager.tsx`.
- **Action**: A `POST` request is sent to the backend, which may trigger an automated notification to the parent.

---

## 👪 Parent Portal Workflows

### Child Monitoring
- **Overview**: parents view child statistics (attendance, averages) in `ChildrenOverview.tsx`.
- **Detail**: clicking a child fetches specific `GradeReports` or `AbsenceManager` data for that student ID.

### Communication
- **Announcements**: Parent dashboard pulls school-wide data from the `notifications` service.
- **Resource Access**: Parents can download materials shared by teachers through the `ResourceLibrary`.

---

## 🛠️ General API Patterns
- **Services**: All API calls are centralized in `src/services/http_api/`.
- **Types**: 
    - `http_payload_types.ts`: Defines what the frontend **sends** to Django.
    - `http_response_types.ts`: Defines what the frontend **receives** from Django.
- **CSRF**: Every mutating request (`POST`, `PATCH`, `DELETE`) includes the CSRF token in the headers for security.
