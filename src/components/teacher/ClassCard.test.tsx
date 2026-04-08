// @ts-nocheck
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ClassCard from "./ClassCard";
import { Student } from "../../models/Student";

const baseStudent = (overrides: Partial<Student>): Student => ({
  student_id: "1",
  full_name: "Sarah Johnson",
  is_absent: false,
  parent: {
    user: 1,
    full_name: "Parent",
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
  ...overrides,
});

describe("ClassCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("filters the student list after the debounce delay", async () => {
    render(
      <ClassCard
        classId="class-a"
        title="Grade 9-A"
        studentCount={2}
        students={[
          baseStudent({ student_id: "1", full_name: "Sarah Johnson" }),
          baseStudent({ student_id: "2", full_name: "Mark Simons" }),
        ]}
        onMarkAbsent={vi.fn().mockResolvedValue(undefined)}
      />
    );

    fireEvent.change(screen.getByRole("searchbox", { name: /filter students/i }), {
      target: { value: "sarah" },
    });

    expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
    expect(screen.getByText("Mark Simons")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
    expect(screen.queryByText("Mark Simons")).not.toBeInTheDocument();
  });

  it("marks a student absent optimistically", () => {
    render(
      <ClassCard
        classId="class-a"
        title="Grade 9-A"
        studentCount={1}
        students={[baseStudent({ student_id: "1", full_name: "Sarah Johnson" })]}
        onMarkAbsent={() => new Promise<void>(() => undefined)}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /mark absent for today for sarah johnson/i,
      })
    );

    expect(screen.getByText("Absent")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /mark absent for today for sarah johnson/i,
      })
    ).toBeDisabled();
  });

  it("shows the empty state when a class has no students", () => {
    render(
      <ClassCard
        classId="class-a"
        title="Grade 9-A"
        studentCount={0}
        students={[]}
        onMarkAbsent={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(
      screen.getByText("This class has no students yet.")
    ).toBeInTheDocument();
  });
});