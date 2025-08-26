## 📌 Changes Made

### 🔹 `src/lib`

- **getCSRFToken**: Utility to fetch CSRF token.

### 🔹 `src/services/http_api`

- **auth/**: Added authentication endpoints (all `POST`).
- **school-dashboard/**: Added `GET` request to fetch school data.
- **http_types.ts**: Noted the need to model backend response shapes.

### 🔹 `types/`

- Modeled **Student** as it appears in the frontend  
  (mapping `student_backend → student_frontend`).

### 🔹 `app.tsx`

- Initial API call to set the **CSRF token** from the server.

### 🔹 `contexts/AuthContext.tsx`

- **login**: Integrated real login call using the `http_client`.
- **change_role(role)** : to change the auth user role depending on "get_role" endpoint , which search the role of that user who just logged in

### 🔹 `pages/dashboard/SchoolDashboard`

- Added `GET` calls:
  - `getStudents`
  - `getTeachers`
  - `getClassGroups`

### 🔹 `components/StudentManagement`

- Switched to **real student data** instead of mock data.
- Example of mapping in "components/StudentManagement" :

```js
const students_real: Student[] = studentsList.map((response_student) => {
  const student: Student = {
    id: response_student.student_id,
    name: response_student.full_name,
    class: response_student.class_group?.name,
    age: getAge(response_student.date_of_birth),
    parent: response_student?.parent?.full_name,
    phone: response_student?.parent?.phone_number,
    average: response_student.trimester_grade,
    attendance: "89%",
  };
  return student;
});
```

### 🔹 `components/TeacherManagement`

- added example of how to use PATCH request
- how to use files and form data for files
- POST , PATCH , DELETE : will have the same logic , a body , csrf_token

- Switched to **real student data** instead of mock data.
- Example of mapping in "components/StudentManagement" :

- student_api_shape → student_frontend_shape
- This mapping ensures flexibility if frontend `Student` shape differs from backend for some reason .

### 🔹 `1. src/services/http_api/http_payload_types.ts`:

- to model how we should say payloads in what format

### 🔹 `2. src/services/http_api/http_reponse_types.ts`:

- to model what the api is returning

- why both 1 & 2 : for images we get a "string" for path as response , but in request we send a "FILE"
