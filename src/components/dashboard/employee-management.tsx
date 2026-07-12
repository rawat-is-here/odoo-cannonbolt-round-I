"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Department = {
  id: string;
  name: string;
  code: string;
};

type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  designation: string | null;
  employeeCode: string | null;
  departmentId: string | null;
  department: Department | null;
  createdAt: string;
};

type EmployeesResponse = {
  employees: Employee[];
  departments: Department[];
  message?: string;
};

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEmployees = useCallback(async () => {
  setIsLoading(true);
  setError("");

  try {
    const response = await fetch("/api/employees", {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const responseText = await response.text();

    let result: EmployeesResponse;

    try {
      result = JSON.parse(responseText) as EmployeesResponse;
    } catch {
      throw new Error(
        `Server returned invalid JSON. Status: ${response.status}`,
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message ?? `Request failed with status ${response.status}`,
      );
    }

    setEmployees(result.employees ?? []);
    setDepartments(result.departments ?? []);
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to connect to the server.";

    console.error("Employee loading error:", caughtError);
    setError(message);
  } finally {
    setIsLoading(false);
  }
}, []);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  async function handleAssignment(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedEmployee) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      employeeId: selectedEmployee.id,
      departmentId: String(
        formData.get("departmentId") ?? "",
      ),
      role: String(formData.get("role") ?? ""),
      status: String(formData.get("status") ?? ""),
      designation: String(
        formData.get("designation") ?? "",
      ).trim(),
      employeeCode: String(
        formData.get("employeeCode") ?? "",
      ).trim(),
    };

    try {
      const response = await fetch("/api/employees", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        setError(result.message ?? "Unable to update employee.");
        return;
      }

      setMessage(result.message ?? "Employee updated.");
      setSelectedEmployee(null);
      await loadEmployees();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-slate-600 shadow-sm">
        Loading employees...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-semibold text-slate-950">
            Organization employees
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Assign departments, roles and access status.
          </p>
        </div>

        {employees.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-900">
              No employees have joined yet.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Share the organization join code with employees.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeading>Employee</TableHeading>
                  <TableHeading>Status</TableHeading>
                  <TableHeading>Department</TableHeading>
                  <TableHeading>Role</TableHeading>
                  <TableHeading>Action</TableHeading>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-950">
                        {employee.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {employee.email}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={employee.status} />
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {employee.department?.name ?? "Unassigned"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {formatRole(employee.role)}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                        onClick={() => {
                          setMessage("");
                          setError("");
                          setSelectedEmployee(employee);
                        }}
                        type="button"
                      >
                        Assign access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedEmployee ? (
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Assign access to {selectedEmployee.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedEmployee.email}
              </p>
            </div>

            <button
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
              onClick={() => setSelectedEmployee(null)}
              type="button"
            >
              Cancel
            </button>
          </div>

          <form
            className="mt-6 grid gap-5 md:grid-cols-2"
            onSubmit={handleAssignment}
          >
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="departmentId"
              >
                Department
              </label>

              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
                defaultValue={
                  selectedEmployee.departmentId ?? ""
                }
                id="departmentId"
                name="departmentId"
                required
              >
                <option disabled value="">
                  Select department
                </option>

                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="role"
              >
                Role
              </label>

              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
                defaultValue={
                  selectedEmployee.role === "DEPARTMENT_MANAGER"
                    ? "DEPARTMENT_MANAGER"
                    : "EMPLOYEE"
                }
                id="role"
                name="role"
                required
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="DEPARTMENT_MANAGER">
                  Department Manager
                </option>
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="designation"
              >
                Designation
              </label>

              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
                defaultValue={
                  selectedEmployee.designation ?? ""
                }
                id="designation"
                name="designation"
                placeholder="Example: Fleet Supervisor"
                type="text"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="employeeCode"
              >
                Employee code
              </label>

              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
                defaultValue={
                  selectedEmployee.employeeCode ?? ""
                }
                id="employeeCode"
                name="employeeCode"
                placeholder="Example: EMP-001"
                type="text"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="status"
              >
                Account status
              </label>

              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
                defaultValue={selectedEmployee.status}
                id="status"
                name="status"
                required
              >
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                {isSaving
                  ? "Saving access..."
                  : "Save and approve employee"}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

function StatusBadge({
  status,
}: {
  status: Employee["status"];
}) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-800",
    ACTIVE: "bg-emerald-100 text-emerald-800",
    SUSPENDED: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}