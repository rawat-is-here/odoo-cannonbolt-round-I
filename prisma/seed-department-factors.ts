import "dotenv/config";

import { prisma } from "../src/lib/prisma";

type SeedFactor = {
  activityCode: string;
  activityName: string;
  departmentCode: string;
  category: string;
  subcategory?: string;
  scope: "SCOPE_1" | "SCOPE_2" | "SCOPE_3";
  inputUnit: string;
  factorValue: string;
  description: string;
};

const factors: SeedFactor[] = [
  // ADMINISTRATION
  {
    activityCode: "ADMIN_ELECTRICITY_KWH",
    activityName: "Administrative office electricity",
    departmentCode: "ADMIN",
    category: "Purchased electricity",
    scope: "SCOPE_2",
    inputUnit: "kWh",
    factorValue: "0.70800000",
    description: "Electricity consumed by administrative offices.",
  },
  {
    activityCode: "ADMIN_PAPER_KG",
    activityName: "Office paper purchased",
    departmentCode: "ADMIN",
    category: "Purchased goods",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "1.30000000",
    description: "Office paper purchased for administrative operations.",
  },
  {
    activityCode: "ADMIN_WATER_M3",
    activityName: "Administrative office water consumption",
    departmentCode: "ADMIN",
    category: "Water consumption",
    scope: "SCOPE_3",
    inputUnit: "m3",
    factorValue: "0.34400000",
    description: "Water supplied to administrative offices.",
  },

  // HUMAN RESOURCES
  {
    activityCode: "HR_EMPLOYEE_CAR_COMMUTE_KM",
    activityName: "Employee commuting by car",
    departmentCode: "HR",
    category: "Employee commuting",
    scope: "SCOPE_3",
    inputUnit: "employee-km",
    factorValue: "0.17000000",
    description: "Distance travelled by employees using cars.",
  },
  {
    activityCode: "HR_EMPLOYEE_BUS_COMMUTE_KM",
    activityName: "Employee commuting by bus",
    departmentCode: "HR",
    category: "Employee commuting",
    scope: "SCOPE_3",
    inputUnit: "passenger-km",
    factorValue: "0.10000000",
    description: "Distance travelled by employees using buses.",
  },
  {
    activityCode: "HR_BUSINESS_FLIGHT_KM",
    activityName: "Employee business travel by air",
    departmentCode: "HR",
    category: "Business travel",
    scope: "SCOPE_3",
    inputUnit: "passenger-km",
    factorValue: "0.16000000",
    description: "Employee business flight distance.",
  },
  {
    activityCode: "HR_HOTEL_NIGHT",
    activityName: "Employee hotel stay",
    departmentCode: "HR",
    category: "Business travel",
    scope: "SCOPE_3",
    inputUnit: "room-night",
    factorValue: "31.00000000",
    description: "Hotel room nights used during company travel.",
  },

  // FINANCE
  {
    activityCode: "FIN_OFFICE_ELECTRICITY_KWH",
    activityName: "Finance office electricity",
    departmentCode: "FIN",
    category: "Purchased electricity",
    scope: "SCOPE_2",
    inputUnit: "kWh",
    factorValue: "0.70800000",
    description: "Electricity consumed by the Finance department.",
  },
  {
    activityCode: "FIN_PAPER_KG",
    activityName: "Financial document paper usage",
    departmentCode: "FIN",
    category: "Purchased goods",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "1.30000000",
    description: "Paper purchased for invoices and finance records.",
  },
  {
    activityCode: "FIN_BUSINESS_CAR_KM",
    activityName: "Finance business travel by car",
    departmentCode: "FIN",
    category: "Business travel",
    scope: "SCOPE_3",
    inputUnit: "km",
    factorValue: "0.17000000",
    description: "Road travel for finance and banking operations.",
  },

  // PURCHASE
  {
    activityCode: "PUR_STEEL_KG",
    activityName: "Steel purchased",
    departmentCode: "PUR",
    category: "Purchased goods",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "1.85000000",
    description: "Purchased steel material.",
  },
  {
    activityCode: "PUR_CEMENT_KG",
    activityName: "Cement purchased",
    departmentCode: "PUR",
    category: "Purchased goods",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "0.90000000",
    description: "Purchased cement material.",
  },
  {
    activityCode: "PUR_PLASTIC_KG",
    activityName: "Plastic purchased",
    departmentCode: "PUR",
    category: "Purchased goods",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "3.10000000",
    description: "Purchased plastic material.",
  },
  {
    activityCode: "PUR_PAPER_KG",
    activityName: "Paper and cardboard purchased",
    departmentCode: "PUR",
    category: "Purchased goods",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "1.30000000",
    description: "Purchased paper and cardboard.",
  },

  // MANUFACTURING
  {
    activityCode: "MFG_DIESEL_LITRE",
    activityName: "Diesel used in machinery",
    departmentCode: "MFG",
    category: "Stationary combustion",
    scope: "SCOPE_1",
    inputUnit: "litre",
    factorValue: "2.68000000",
    description: "Diesel used by manufacturing machinery.",
  },
  {
    activityCode: "MFG_NATURAL_GAS_KWH",
    activityName: "Natural gas consumed",
    departmentCode: "MFG",
    category: "Stationary combustion",
    scope: "SCOPE_1",
    inputUnit: "kWh",
    factorValue: "0.20200000",
    description: "Natural gas used in manufacturing processes.",
  },
  {
    activityCode: "MFG_ELECTRICITY_KWH",
    activityName: "Manufacturing electricity consumption",
    departmentCode: "MFG",
    category: "Purchased electricity",
    scope: "SCOPE_2",
    inputUnit: "kWh",
    factorValue: "0.70800000",
    description: "Purchased electricity used in manufacturing.",
  },
  {
    activityCode: "MFG_COAL_KG",
    activityName: "Coal consumed in production",
    departmentCode: "MFG",
    category: "Stationary combustion",
    scope: "SCOPE_1",
    inputUnit: "kg",
    factorValue: "2.42000000",
    description: "Coal consumed during production.",
  },
  {
    activityCode: "MFG_REFRIGERANT_R134A_KG",
    activityName: "R134a refrigerant leakage",
    departmentCode: "MFG",
    category: "Fugitive emissions",
    scope: "SCOPE_1",
    inputUnit: "kg",
    factorValue: "1430.00000000",
    description: "R134a refrigerant released from equipment.",
  },

  // WAREHOUSE
  {
    activityCode: "WH_ELECTRICITY_KWH",
    activityName: "Warehouse electricity consumption",
    departmentCode: "WH",
    category: "Purchased electricity",
    scope: "SCOPE_2",
    inputUnit: "kWh",
    factorValue: "0.70800000",
    description: "Electricity used by warehouse operations.",
  },
  {
    activityCode: "WH_LANDFILL_WASTE_KG",
    activityName: "Warehouse waste sent to landfill",
    departmentCode: "WH",
    category: "Waste generated in operations",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "0.58000000",
    description: "Warehouse waste sent to landfill.",
  },
  {
    activityCode: "WH_RECYCLED_WASTE_KG",
    activityName: "Warehouse waste sent for recycling",
    departmentCode: "WH",
    category: "Waste generated in operations",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "0.03000000",
    description: "Warehouse waste sent for recycling.",
  },
  {
    activityCode: "WH_CARDBOARD_KG",
    activityName: "Cardboard packaging used",
    departmentCode: "WH",
    category: "Purchased goods",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "0.94000000",
    description: "Cardboard packaging used in warehouse operations.",
  },
  {
    activityCode: "WH_PLASTIC_PACKAGING_KG",
    activityName: "Plastic packaging used",
    departmentCode: "WH",
    category: "Purchased goods",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "3.10000000",
    description: "Plastic packaging used in warehouse operations.",
  },

  // COMPLIANCE
  {
    activityCode: "COMP_OFFICE_ELECTRICITY_KWH",
    activityName: "Compliance office electricity",
    departmentCode: "COMP",
    category: "Purchased electricity",
    scope: "SCOPE_2",
    inputUnit: "kWh",
    factorValue: "0.70800000",
    description: "Electricity used by compliance operations.",
  },
  {
    activityCode: "COMP_AUDIT_TRAVEL_KM",
    activityName: "Compliance audit travel by car",
    departmentCode: "COMP",
    category: "Business travel",
    scope: "SCOPE_3",
    inputUnit: "km",
    factorValue: "0.17000000",
    description: "Travel undertaken for audits and inspections.",
  },
  {
    activityCode: "COMP_PAPER_KG",
    activityName: "Compliance documentation paper",
    departmentCode: "COMP",
    category: "Purchased goods",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "1.30000000",
    description: "Paper used for policies and audit documentation.",
  },

  // SUSTAINABILITY
  {
    activityCode: "ESG_WATER_M3",
    activityName: "Organization water consumption",
    departmentCode: "ESG",
    category: "Water consumption",
    scope: "SCOPE_3",
    inputUnit: "m3",
    factorValue: "0.34400000",
    description: "Water consumed by sustainability initiatives.",
  },
  {
    activityCode: "ESG_WASTEWATER_M3",
    activityName: "Wastewater treatment",
    departmentCode: "ESG",
    category: "Water treatment",
    scope: "SCOPE_3",
    inputUnit: "m3",
    factorValue: "0.70800000",
    description: "Wastewater sent for treatment.",
  },
  {
    activityCode: "ESG_LANDFILL_WASTE_KG",
    activityName: "General waste sent to landfill",
    departmentCode: "ESG",
    category: "Waste generated in operations",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "0.58000000",
    description: "Organization waste sent to landfill.",
  },
  {
    activityCode: "ESG_RECYCLING_KG",
    activityName: "Material sent for recycling",
    departmentCode: "ESG",
    category: "Waste generated in operations",
    scope: "SCOPE_3",
    inputUnit: "kg",
    factorValue: "0.03000000",
    description: "Organization material sent for recycling.",
  },
];

async function main() {
  for (const factor of factors) {
    const existing = await prisma.emissionFactor.findFirst({
      where: {
        activityCode: factor.activityCode,
        organizationId: null,
      },
      select: {
        id: true,
      },
    });

    const data = {
      activityName: factor.activityName,
      departmentCode: factor.departmentCode,
      category: factor.category,
      subcategory: factor.subcategory ?? null,
      scope: factor.scope,
      inputUnit: factor.inputUnit,
      outputUnit: "kgCO2e",
      factorValue: factor.factorValue,
      sourceName: "EcoSphere hackathon demo factor set",
      sourceYear: 2026,
      version: "demo-v1",
      description: factor.description,
      status: "ACTIVE" as const,
    };

    if (existing) {
      await prisma.emissionFactor.update({
        where: {
          id: existing.id,
        },
        data,
      });
    } else {
      await prisma.emissionFactor.create({
        data: {
          organizationId: null,
          activityCode: factor.activityCode,
          ...data,
        },
      });
    }
  }

  console.log(
    `Seeded ${factors.length} department emission factors.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });