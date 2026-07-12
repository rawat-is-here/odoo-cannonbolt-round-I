"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrganizationOnboardingPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      legalName: String(formData.get("legalName") ?? "").trim(),
      gstin: String(formData.get("gstin") ?? "").trim(),
      industry: String(formData.get("industry") ?? "").trim(),
      country: String(formData.get("country") ?? "").trim(),
      companySize: String(formData.get("companySize") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/organizations/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        setError(result.message ?? "Organization creation failed.");
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
          Organization setup
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Create your ESG workspace
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          We will automatically create the common departments for your
          organization.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="name"
            >
              Organization name
            </label>

            <input
              className="w-full rounded-lg border px-3 py-2.5 text-gray-900"
              id="name"
              name="name"
              placeholder="GreenSphere Industries"
              required
              type="text"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="legalName"
            >
              Legal company name
            </label>

            <input
              className="w-full rounded-lg border px-3 py-2.5 text-gray-900"
              id="legalName"
              name="legalName"
              placeholder="GreenSphere Industries Private Limited"
              type="text"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="gstin"
              >
                GSTIN
              </label>

              <input
                className="w-full rounded-lg border px-3 py-2.5 uppercase text-gray-900"
                id="gstin"
                maxLength={15}
                name="gstin"
                placeholder="Optional for MVP"
                type="text"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="industry"
              >
                Industry
              </label>

              <select
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-gray-900"
                defaultValue=""
                id="industry"
                name="industry"
              >
                <option disabled value="">
                  Select industry
                </option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Transport and Logistics">
                  Transport and Logistics
                </option>
                <option value="Energy">Energy</option>
                <option value="Technology">Technology</option>
                <option value="Construction">Construction</option>
                <option value="Retail">Retail</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="country"
              >
                Country
              </label>

              <input
                className="w-full rounded-lg border px-3 py-2.5 text-gray-900"
                defaultValue="India"
                id="country"
                name="country"
                type="text"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="companySize"
              >
                Company size
              </label>

              <select
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-gray-900"
                defaultValue=""
                id="companySize"
                name="companySize"
              >
                <option disabled value="">
                  Select company size
                </option>
                <option value="1-50">1–50 employees</option>
                <option value="51-200">51–200 employees</option>
                <option value="201-500">201–500 employees</option>
                <option value="501-1000">501–1,000 employees</option>
                <option value="1000+">More than 1,000 employees</option>
              </select>
            </div>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Creating workspace..."
              : "Create ESG workspace"}
          </button>
        </form>
      </section>
    </main>
  );
}