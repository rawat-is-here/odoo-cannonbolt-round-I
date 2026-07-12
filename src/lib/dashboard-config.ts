export type DashboardConfig = {
  slug: string;
  code: string;
  title: string;
  description: string;
  responsibilities: string[];
  metrics: {
    label: string;
    value: string;
  }[];
};

export const DASHBOARD_CONFIGS: Record<string, DashboardConfig> = {
  administration: {
    slug: "administration",
    code: "ADMIN",
    title: "Administration Dashboard",
    description:
      "Manage organization-wide administration and operational coordination.",
    responsibilities: [
      "Organization records",
      "Administrative requests",
      "Department coordination",
      "Operational announcements",
    ],
    metrics: [
      { label: "Open Requests", value: "0" },
      { label: "Departments", value: "9" },
      { label: "Pending Actions", value: "0" },
      { label: "Completion Rate", value: "0%" },
    ],
  },

  hr: {
    slug: "hr",
    code: "HR",
    title: "Human Resources Dashboard",
    description:
      "Manage employee engagement, diversity, training and social initiatives.",
    responsibilities: [
      "Employee engagement",
      "Diversity records",
      "Training activities",
      "CSR participation",
    ],
    metrics: [
      { label: "Employees", value: "0" },
      { label: "Training Hours", value: "0" },
      { label: "CSR Participants", value: "0" },
      { label: "Engagement Score", value: "0%" },
    ],
  },

  finance: {
    slug: "finance",
    code: "FIN",
    title: "Finance Dashboard",
    description:
      "Track ESG-related budgets, spending, investments and financial impact.",
    responsibilities: [
      "ESG budgets",
      "Sustainability expenses",
      "Financial approvals",
      "Cost reports",
    ],
    metrics: [
      { label: "ESG Budget", value: "₹0" },
      { label: "Amount Spent", value: "₹0" },
      { label: "Pending Approvals", value: "0" },
      { label: "Budget Utilization", value: "0%" },
    ],
  },

  purchase: {
    slug: "purchase",
    code: "PUR",
    title: "Purchase Dashboard",
    description:
      "Manage sustainable procurement, suppliers and purchasing activities.",
    responsibilities: [
      "Supplier records",
      "Sustainable procurement",
      "Purchase emissions",
      "Vendor compliance",
    ],
    metrics: [
      { label: "Suppliers", value: "0" },
      { label: "Green Suppliers", value: "0" },
      { label: "Purchase Orders", value: "0" },
      { label: "Compliance Rate", value: "0%" },
    ],
  },

  manufacturing: {
    slug: "manufacturing",
    code: "MFG",
    title: "Manufacturing Dashboard",
    description:
      "Track production activity, resource consumption, waste and emissions.",
    responsibilities: [
      "Production activity",
      "Energy consumption",
      "Waste generation",
      "Manufacturing emissions",
    ],
    metrics: [
      { label: "Production Records", value: "0" },
      { label: "Energy Used", value: "0 kWh" },
      { label: "Waste Generated", value: "0 kg" },
      { label: "Emissions", value: "0 kg CO₂e" },
    ],
  },

  transport: {
    slug: "transport",
    code: "TRN",
    title: "Transport Dashboard",
    description:
      "Record fleet activity, fuel consumption, distance and transport emissions.",
    responsibilities: [
      "Vehicle activity",
      "Fuel usage",
      "Distance travelled",
      "Transport emissions",
    ],
    metrics: [
      { label: "Trips", value: "0" },
      { label: "Distance", value: "0 km" },
      { label: "Fuel Used", value: "0 L" },
      { label: "Emissions", value: "0 kg CO₂e" },
    ],
  },

  warehouse: {
    slug: "warehouse",
    code: "WH",
    title: "Warehouse Dashboard",
    description:
      "Manage inventory movement, storage energy, materials and warehouse waste.",
    responsibilities: [
      "Inventory movement","Storage consumption",
      "Packaging materials",
      "Warehouse waste",
    ],
    metrics: [
      { label: "Inventory Records", value: "0" },
      { label: "Energy Used", value: "0 kWh" },
      { label: "Materials Used", value: "0 kg" },
      { label: "Waste", value: "0 kg" },
    ],
  },

  compliance: {
    slug: "compliance",
    code: "COMP",
    title: "Compliance Dashboard",
    description:
      "Manage policies, acknowledgements, audits and regulatory compliance.",
    responsibilities: [
      "Policy management",
      "Employee acknowledgements",
      "Audit tracking",
      "Compliance deadlines",
    ],
    metrics: [
      { label: "Policies", value: "0" },
      { label: "Pending Acknowledgements", value: "0" },
      { label: "Open Audits", value: "0" },
      { label: "Compliance Score", value: "0%" },
    ],
  },

  sustainability: {
    slug: "sustainability",
    code: "ESG",
    title: "Sustainability Dashboard",
    description:
      "Monitor ESG performance, goals, emissions and organization-wide reports.",
    responsibilities: [
      "ESG score",
      "Emission targets",
      "Sustainability goals",
      "Consolidated reporting",
    ],
    metrics: [
      { label: "ESG Score", value: "0" },
      { label: "Total Emissions", value: "0 kg CO₂e" },
      { label: "Active Goals", value: "0" },
      { label: "Goal Completion", value: "0%" },
    ],
  },
};

export const DEPARTMENT_CODE_TO_ROUTE: Record<string, string> = {
  ADMIN: "/dashboard/administration",
  HR: "/dashboard/hr",
  FIN: "/dashboard/finance",
  PUR: "/dashboard/purchase",
  MFG: "/dashboard/manufacturing",
  TRN: "/dashboard/transport",
  WH: "/dashboard/warehouse",
  COMP: "/dashboard/compliance",
  ESG: "/dashboard/sustainability",
};