# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: teacher-class-management.spec.ts >> teacher can mark three students absent and the state persists after refresh
- Location: e2e/teacher-class-management.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-class-card="class-a"]')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('[data-class-card="class-a"]')

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - banner [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - img "Logo" [ref=e9]
        - heading "Teacher Dashboard" [level=1] [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e12]:
          - img
          - combobox [ref=e13] [cursor=pointer]:
            - option "العربية"
            - option "English" [selected]
            - option "Français"
        - button [ref=e14] [cursor=pointer]:
          - img [ref=e15]
        - button "1" [ref=e18] [cursor=pointer]:
          - img [ref=e19]
          - generic [ref=e22]: "1"
        - generic [ref=e23]:
          - generic [ref=e24]:
            - paragraph [ref=e25]: Teacher One
            - paragraph [ref=e26]: teacher
          - button "logout" [ref=e27] [cursor=pointer]:
            - img [ref=e28]
  - generic [ref=e31]:
    - complementary [ref=e32]:
      - generic [ref=e33]:
        - button "Overview" [ref=e34] [cursor=pointer]:
          - img [ref=e35]
          - generic [ref=e38]: Overview
        - button "My Classes" [ref=e39] [cursor=pointer]:
          - img [ref=e40]
          - generic [ref=e45]: My Classes
        - button "Homeworks" [ref=e46] [cursor=pointer]:
          - img [ref=e47]
          - generic [ref=e50]: Homeworks
        - button "Academic Performance" [ref=e51] [cursor=pointer]:
          - img [ref=e52]
          - generic [ref=e55]: Academic Performance
        - button "Marks" [ref=e56] [cursor=pointer]:
          - img [ref=e57]
          - generic [ref=e60]: Marks
        - button "Educational Materials" [ref=e61] [cursor=pointer]:
          - img [ref=e62]
          - generic [ref=e65]: Educational Materials
        - button "Communication" [ref=e66] [cursor=pointer]:
          - img [ref=e67]
          - generic [ref=e69]: Communication
        - button "Unjustified absences and behavior reports" [ref=e70] [cursor=pointer]:
          - img [ref=e71]
          - generic [ref=e76]: Unjustified absences and behavior reports
    - main [ref=e77]:
      - generic [ref=e78]:
        - generic [ref=e79]:
          - heading "Teacher Dashboard" [level=2] [ref=e80]
          - paragraph [ref=e81]: Hello Professor, here’s a summary of your daily activities
        - generic [ref=e82]:
          - generic [ref=e84]:
            - heading "Class Management" [level=2] [ref=e85]
            - paragraph [ref=e86]: 1 My Classes
          - article [ref=e88]:
            - generic [ref=e89]:
              - generic [ref=e90]:
                - generic [ref=e91]:
                  - img [ref=e93]
                  - generic [ref=e98]:
                    - heading "Grade 9-A" [level=3] [ref=e99]
                    - paragraph [ref=e100]: 3 Students
                - generic [ref=e101]:
                  - generic [ref=e102]: Filter students...
                  - img
                  - searchbox "Filter students... Grade 9-A" [ref=e103]
              - generic [ref=e104]:
                - generic [ref=e105]:
                  - generic [ref=e106]:
                    - generic [ref=e108]: SJ
                    - generic [ref=e109]:
                      - paragraph [ref=e110]: Sarah Johnson
                      - generic [ref=e113]: Absent
                  - button "Mark absent for today for Sarah Johnson" [disabled] [ref=e114]:
                    - img [ref=e115]
                - generic [ref=e120]:
                  - generic [ref=e121]:
                    - generic [ref=e123]: MS
                    - generic [ref=e124]:
                      - paragraph [ref=e125]: Mark Simons
                      - generic [ref=e128]: Absent
                  - button "Mark absent for today for Mark Simons" [disabled] [ref=e129]:
                    - img [ref=e130]
                - generic [ref=e135]:
                  - generic [ref=e136]:
                    - generic [ref=e138]: AS
                    - generic [ref=e139]:
                      - paragraph [ref=e140]: Amina Stone
                      - generic [ref=e143]: Absent
                  - button "Mark absent for today for Amina Stone" [disabled] [ref=e144]:
                    - img [ref=e145]
```

# Test source

```ts
  136 |       return;
  137 |     }
  138 | 
  139 |     if (url.includes("/teacher/teachers/get_current_teacher_stats/")) {
  140 |       await route.fulfill({
  141 |         status: 200,
  142 |         contentType: "application/json",
  143 |         body: JSON.stringify({ my_classes: 1, grades: 0, chats: 0, teaching_materials: 0 }),
  144 |       });
  145 |       return;
  146 |     }
  147 | 
  148 |     if (url.includes("/teacher/teachers/get_current_teacher_modules_and_class_groups/")) {
  149 |       await route.fulfill({
  150 |         status: 200,
  151 |         contentType: "application/json",
  152 |         body: JSON.stringify([
  153 |           {
  154 |             students_count: students.length,
  155 |             average_grade: 0,
  156 |             teacher: 1,
  157 |             module: { module_id: "module-1", module_name: "Math" },
  158 |             class_group: students[0].class_group,
  159 |           },
  160 |         ]),
  161 |       });
  162 |       return;
  163 |     }
  164 | 
  165 |     if (
  166 |       url.includes("/teacher/teachers/get_current_teacher_uploads/") ||
  167 |       url.includes("/class-group/absences/absences_for_current_school_or_teacher/") ||
  168 |       url.includes("/teacher/teachers/get_current_teacher_behaviour_reports/") ||
  169 |       url.includes("/teacher/teachers/current_teacher_school_modules/") ||
  170 |       url.includes("/teacher/teachers/current_teacher_students_grades/") ||
  171 |       url.includes("/teacher/teachers/get_current_teacher_school_parents/")
  172 |     ) {
  173 |       await route.fulfill({
  174 |         status: 200,
  175 |         contentType: "application/json",
  176 |         body: JSON.stringify([]),
  177 |       });
  178 |       return;
  179 |     }
  180 | 
  181 |     if (method === "PATCH" && url.includes("/student/students/")) {
  182 |       const studentId = url.split("/student/students/")[1].split("/")[0];
  183 |       const targetStudent = students.find((student) => student.student_id === studentId);
  184 |       if (targetStudent) {
  185 |         targetStudent.is_absent = true;
  186 |       }
  187 | 
  188 |       await route.fulfill({
  189 |         status: 200,
  190 |         contentType: "application/json",
  191 |         body: JSON.stringify(targetStudent ?? {}),
  192 |       });
  193 |       return;
  194 |     }
  195 | 
  196 |     if (method === "POST" && url.includes("/class-group/absences/")) {
  197 |       await route.fulfill({
  198 |         status: 201,
  199 |         contentType: "application/json",
  200 |         body: JSON.stringify({ ok: true }),
  201 |       });
  202 |       return;
  203 |     }
  204 | 
  205 |     await route.continue();
  206 |   });
  207 | 
  208 |   await page.goto("/teacher-dashboard", { waitUntil: "commit" });
  209 |   await page.getByRole("button", { name: /my classes/i }).click();
  210 |   const classCard = page.locator('[data-class-card="class-a"]');
  211 | 
  212 |   await page.getByRole("button", { name: /mark absent for today for sarah johnson/i }).click({ force: true });
  213 |   await page.getByRole("button", { name: /mark absent for today for mark simons/i }).click({ force: true });
  214 |   await page.getByRole("button", { name: /mark absent for today for amina stone/i }).click({ force: true });
  215 | 
  216 |   await expect(page.getByText("Sarah Johnson marked absent.")).toBeVisible();
  217 |   await expect(classCard.getByText("Absent")).toHaveCount(3);
  218 | 
  219 |   const refreshedPage = await context.newPage();
  220 |   await refreshedPage.addInitScript(() => {
  221 |     localStorage.setItem("language", "en");
  222 |     localStorage.setItem(
  223 |       "schoolParentOrTeacherManagementUser",
  224 |       JSON.stringify({
  225 |         id: "1",
  226 |         name: "Teacher One",
  227 |         email: "teacher@example.com",
  228 |         role: "teacher",
  229 |         is_admin: false,
  230 |       })
  231 |     );
  232 |   });
  233 |   await refreshedPage.goto("/teacher-dashboard", { waitUntil: "commit" });
  234 |   await expect(
  235 |     refreshedPage.locator('[data-class-card="class-a"]')
> 236 |   ).toBeVisible({ timeout: 15000 });
      |     ^ Error: expect(locator).toBeVisible() failed
  237 | 
  238 |   await expect(
  239 |     refreshedPage.locator('[data-class-card="class-a"]').getByText("Absent")
  240 |   ).toHaveCount(3);
  241 | });
```