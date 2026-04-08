import React, { useEffect, useState } from "react";
import { ClassManagementProps } from "../../types";
import { Student } from "../../models/Student";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";
import ClassCard from "./ClassCard";

const CLASS_MANAGEMENT_THEME: React.CSSProperties = {
  "--class-card-border": "var(--primary-200)",
  "--class-card-header-bg": "var(--primary-50)",
  "--class-card-icon-bg": "var(--primary-100)",
  "--class-card-icon-fg": "var(--primary-600)",
  "--class-card-avatar-bg": "var(--secondary-100)",
  "--class-card-avatar-fg": "var(--secondary-700)",
  "--class-card-action-bg": "#fee2e2",
  "--class-card-action-hover": "#fecaca",
  "--class-card-action-fg": "#b91c1c",
} as React.CSSProperties;

const ClassManagement: React.FC<ClassManagementProps> = ({
  students_list,
  modules_class_groups,
  isLoading = false,
}) => {
  const { language } = useLanguage();
  const [localStudents, setLocalStudents] = useState<Student[]>(students_list);

  useEffect(() => {
    setLocalStudents(students_list);
  }, [students_list]);

  const classMap = new Map<
    string,
    {
      classId: string;
      title: string;
      students: Student[];
      studentCount: number;
    }
  >();

  for (const moduleClassGroup of modules_class_groups) {
    const classId = moduleClassGroup.class_group.class_group_id;
    if (!classMap.has(classId)) {
      classMap.set(classId, {
        classId,
        title: moduleClassGroup.class_group.name,
        students: [],
        studentCount: 0,
      });
    }
  }

  for (const student of localStudents) {
    const classId = student.class_group?.class_group_id;
    const className = student.class_group?.name;
    if (!classId || !className) {
      continue;
    }

    if (!classMap.has(classId)) {
      classMap.set(classId, {
        classId,
        title: className,
        students: [],
        studentCount: 0,
      });
    }

    const currentClass = classMap.get(classId);
    if (!currentClass) {
      continue;
    }

    currentClass.students.push(student);
    currentClass.studentCount += 1;
  }

  const classCards = Array.from(classMap.values()).sort((leftClass, rightClass) =>
    leftClass.title.localeCompare(rightClass.title)
  );

  return (
    <section className="space-y-6" style={CLASS_MANAGEMENT_THEME}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getTranslation("classManagement", language)}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isLoading
              ? getTranslation("loadingClasses", language)
              : `${classCards.length} ${getTranslation("myClasses", language)}`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
        >
          {[0, 1, 2, 3].map((cardIndex) => (
            <ClassCard
              key={cardIndex}
              classId={`loading-${cardIndex}`}
              title=""
              studentCount={0}
              students={[]}
              isLoading={true}
            />
          ))}
        </div>
      ) : classCards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--class-card-border)] bg-white/80 px-6 py-12 text-center text-sm text-gray-500 shadow-sm dark:bg-gray-800/80 dark:text-gray-400">
          {getTranslation("noClassesAssigned", language)}
        </div>
      ) : (
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
        >
          {classCards.map((classCard) => (
            <ClassCard
              key={classCard.classId}
              classId={classCard.classId}
              title={classCard.title}
              studentCount={classCard.studentCount}
              students={classCard.students}
              labels={{
                studentsLabel: getTranslation("students", language),
                filterPlaceholder: getTranslation(
                  "filterStudentsPlaceholder",
                  language
                ),
                emptyState: getTranslation("classHasNoStudentsYet", language),
                noMatches: getTranslation("noMatchingStudents", language),
                absentLabel: getTranslation("absent", language),
                presentLabel: getTranslation("present", language),
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ClassManagement;