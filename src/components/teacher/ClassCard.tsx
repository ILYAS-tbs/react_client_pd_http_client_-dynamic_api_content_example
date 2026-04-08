import React, { useEffect, useRef, useState } from "react";
import { School, Search, UserRound } from "lucide-react";
import { Student } from "../../models/Student";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

interface ClassCardLabels {
  studentsLabel: string;
  filterPlaceholder: string;
  emptyState: string;
  noMatches: string;
  absentLabel: string;
  presentLabel: string;
}

export interface ClassCardProps {
  classId: string;
  title: string;
  studentCount: number;
  students: Student[];
  isLoading?: boolean;
  labels?: Partial<ClassCardLabels>;
}

const DEFAULT_LABELS: ClassCardLabels = {
  studentsLabel: "students",
  filterPlaceholder: "Filter students...",
  emptyState: "This class has no students yet.",
  noMatches: "No matching students.",
  absentLabel: "Absent",
  presentLabel: "Present",
};

function getStudentInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "ST"
  );
}

function LazyStudentAvatar({ student }: { student: Student }) {
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const profilePicture = (student as Student & { profile_picture?: string | null })
    .profile_picture;

  useEffect(() => {
    const currentNode = avatarRef.current;
    if (!currentNode) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "48px" }
    );

    observer.observe(currentNode);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={avatarRef}
      className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-[var(--class-card-avatar-bg)] text-sm font-semibold text-[var(--class-card-avatar-fg)] shadow-sm"
    >
      {isVisible && profilePicture ? (
        <img
          src={profilePicture}
          alt={student.full_name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : isVisible ? (
        <span aria-hidden="true">{getStudentInitials(student.full_name)}</span>
      ) : (
        <UserRound className="h-5 w-5" aria-hidden="true" />
      )}
    </div>
  );
}

function ClassCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white/95 shadow-sm dark:border-gray-700 dark:bg-gray-800/95">
      <div className="space-y-4 p-5">
        <div className="h-6 w-1/2 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700/70" />
        <div className="h-11 w-full animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-700/70" />
      </div>
      <div className="space-y-3 border-t border-gray-100 p-5 dark:border-gray-700/80">
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 p-3 dark:border-gray-700/70"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700/70" />
              </div>
            </div>
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-700/70" />
          </div>
        ))}
      </div>
    </article>
  );
}

const ClassCard: React.FC<ClassCardProps> = ({
  classId,
  title,
  studentCount,
  students,
  isLoading = false,
  labels,
}) => {
  const mergedLabels = { ...DEFAULT_LABELS, ...labels };
  const [query, setQuery] = useState("");
  const [roster, setRoster] = useState(students);
  const debouncedQuery = useDebouncedValue(query, 200);

  useEffect(() => {
    setRoster(students);
  }, [students]);

  const filteredStudents = roster.filter((student) =>
    student.full_name
      .toLocaleLowerCase()
      .includes(debouncedQuery.trim().toLocaleLowerCase())
  );

  if (isLoading) {
    return <ClassCardSkeleton />;
  }

  return (
    <article
      className="overflow-hidden rounded-3xl border border-[var(--class-card-border)] bg-white/95 shadow-sm transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800/95"
      data-class-card={classId}
    >
      <div className="max-h-[550px] overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-[var(--class-card-border)] bg-[var(--class-card-header-bg)]/95 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--class-card-icon-bg)] p-3 text-[var(--class-card-icon-fg)] shadow-sm">
              <School className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {studentCount} {mergedLabels.studentsLabel}
              </p>
            </div>
          </div>

          <label className="relative mt-4 block">
            <span className="sr-only">{mergedLabels.filterPlaceholder}</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={mergedLabels.filterPlaceholder}
              aria-label={`${mergedLabels.filterPlaceholder} ${title}`}
              className="w-full rounded-2xl border border-[var(--class-card-border)] bg-white/90 py-2.5 pl-9 pr-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[var(--class-card-icon-fg)] dark:bg-gray-900/60 dark:text-white"
            />
          </label>
        </div>

        <div className="space-y-3 p-5">
          {roster.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--class-card-border)] px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {mergedLabels.emptyState}
            </p>
          ) : filteredStudents.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--class-card-border)] px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {mergedLabels.noMatches}
            </p>
          ) : (
            filteredStudents.map((student) => {
              return (
                <div
                  key={student.student_id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white/90 p-3 shadow-sm dark:border-gray-700/70 dark:bg-gray-900/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <LazyStudentAvatar student={student} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {student.full_name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span
                          className={`inline-flex h-2.5 w-2.5 rounded-full ${student.is_absent ? "bg-red-500" : "bg-emerald-500"}`}
                          aria-hidden="true"
                        />
                        <span>{student.is_absent ? mergedLabels.absentLabel : mergedLabels.presentLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </article>
  );
};

export default ClassCard;