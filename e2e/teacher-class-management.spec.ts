import { expect, test } from "@playwright/test";

test("teacher can mark three students absent and the state persists after refresh", async ({ page }) => {
  const context = page.context();
  const students = [
    {
      student_id: "student-1",
      full_name: "Sarah Johnson",
      is_absent: false,
      class_group: {
        class_group_id: "class-a",
        name: "Grade 9-A",
        school: "school-1",
        teacher_list: null,
        time_table: null,
        academic_year: "2025-2026",
        schedule: [],
      },
      parent: {
        user: 1,
        full_name: "Parent 1",
        phone_number: "000",
        address: "Address",
        relationship_to_student: "Mother",
        profile_picture: null,
        emergency_contact: null,
        emergency_phone: null,
      },
      school: {
        school_id: "school-1",
        school_name: "PedaConnect",
        email: "school@example.com",
        school_level: "middle",
      },
    },
    {
      student_id: "student-2",
      full_name: "Mark Simons",
      is_absent: false,
      class_group: {
        class_group_id: "class-a",
        name: "Grade 9-A",
        school: "school-1",
        teacher_list: null,
        time_table: null,
        academic_year: "2025-2026",
        schedule: [],
      },
      parent: {
        user: 2,
        full_name: "Parent 2",
        phone_number: "000",
        address: "Address",
        relationship_to_student: "Father",
        profile_picture: null,
        emergency_contact: null,
        emergency_phone: null,
      },
      school: {
        school_id: "school-1",
        school_name: "PedaConnect",
        email: "school@example.com",
        school_level: "middle",
      },
    },
    {
      student_id: "student-3",
      full_name: "Amina Stone",
      is_absent: false,
      class_group: {
        class_group_id: "class-a",
        name: "Grade 9-A",
        school: "school-1",
        teacher_list: null,
        time_table: null,
        academic_year: "2025-2026",
        schedule: [],
      },
      parent: {
        user: 3,
        full_name: "Parent 3",
        phone_number: "000",
        address: "Address",
        relationship_to_student: "Mother",
        profile_picture: null,
        emergency_contact: null,
        emergency_phone: null,
      },
      school: {
        school_id: "school-1",
        school_name: "PedaConnect",
        email: "school@example.com",
        school_level: "middle",
      },
    },
  ];

  await page.addInitScript(() => {
    localStorage.setItem("language", "en");
    localStorage.setItem(
      "schoolParentOrTeacherManagementUser",
      JSON.stringify({
        id: "1",
        name: "Teacher One",
        email: "teacher@example.com",
        role: "teacher",
        is_admin: false,
      })
    );
  });

  await context.route("**/*", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes("/user-auth/_allauth/browser/v1/auth/session")) {
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
      return;
    }

    if (url.includes("/user-auth/get_role")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ role: "teacher" }),
      });
      return;
    }

    if (url.includes("/teacher/teachers/get_current_teacher_students/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(students),
      });
      return;
    }

    if (url.includes("/teacher/teachers/get_current_teacher_stats/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ my_classes: 1, grades: 0, chats: 0, teaching_materials: 0 }),
      });
      return;
    }

    if (url.includes("/teacher/teachers/get_current_teacher_modules_and_class_groups/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            students_count: students.length,
            average_grade: 0,
            teacher: 1,
            module: { module_id: "module-1", module_name: "Math" },
            class_group: students[0].class_group,
          },
        ]),
      });
      return;
    }

    if (
      url.includes("/teacher/teachers/get_current_teacher_uploads/") ||
      url.includes("/class-group/absences/absences_for_current_school_or_teacher/") ||
      url.includes("/teacher/teachers/get_current_teacher_behaviour_reports/") ||
      url.includes("/teacher/teachers/current_teacher_school_modules/") ||
      url.includes("/teacher/teachers/current_teacher_students_grades/") ||
      url.includes("/teacher/teachers/get_current_teacher_school_parents/")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
      return;
    }

    if (method === "PATCH" && url.includes("/student/students/")) {
      const studentId = url.split("/student/students/")[1].split("/")[0];
      const targetStudent = students.find((student) => student.student_id === studentId);
      if (targetStudent) {
        targetStudent.is_absent = true;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(targetStudent ?? {}),
      });
      return;
    }

    if (method === "POST" && url.includes("/class-group/absences/")) {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/teacher-dashboard", { waitUntil: "commit" });
  await page.getByRole("button", { name: /my classes/i }).click();
  const classCard = page.locator('[data-class-card="class-a"]');

  await page.getByRole("button", { name: /mark absent for today for sarah johnson/i }).click({ force: true });
  await page.getByRole("button", { name: /mark absent for today for mark simons/i }).click({ force: true });
  await page.getByRole("button", { name: /mark absent for today for amina stone/i }).click({ force: true });

  await expect(page.getByText("Sarah Johnson marked absent.")).toBeVisible();
  await expect(classCard.getByText("Absent")).toHaveCount(3);

  const refreshedPage = await context.newPage();
  await refreshedPage.addInitScript(() => {
    localStorage.setItem("language", "en");
    localStorage.setItem(
      "schoolParentOrTeacherManagementUser",
      JSON.stringify({
        id: "1",
        name: "Teacher One",
        email: "teacher@example.com",
        role: "teacher",
        is_admin: false,
      })
    );
  });
  await refreshedPage.goto("/teacher-dashboard", { waitUntil: "commit" });
  await expect(
    refreshedPage.locator('[data-class-card="class-a"]')
  ).toBeVisible({ timeout: 15000 });

  await expect(
    refreshedPage.locator('[data-class-card="class-a"]').getByText("Absent")
  ).toHaveCount(3);
});