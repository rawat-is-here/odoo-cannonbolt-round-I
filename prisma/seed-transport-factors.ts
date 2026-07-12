import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const transportFactors = [
  {
    activityCode: "TRUCK_DIESEL_LIGHT_TONNE_KM",
    activityName: "Light diesel truck freight",
    category: "Mobile combustion",
    subcategory: "Road freight",
    departmentCode: "TRN",
    scope: "SCOPE_1" as const,
    inputUnit: "tonne-km",
    factorValue: "0.18000000",
    description:
      "Demo factor for freight transported using a light diesel truck.",
  },
  {
    activityCode: "TRUCK_DIESEL_MEDIUM_TONNE_KM",
    activityName: "Medium diesel truck freight",
    category: "Mobile combustion",
    subcategory: "Road freight",
    departmentCode: "TRN",
    scope: "SCOPE_1" as const,
    inputUnit: "tonne-km",
    factorValue: "0.12000000",
    description:
      "Demo factor for freight transported using a medium diesel truck.",
  },
  {
    activityCode: "TRUCK_DIESEL_HEAVY_TONNE_KM",
    activityName: "Heavy diesel truck freight",
    category: "Mobile combustion",
    subcategory: "Road freight",
    departmentCode: "TRN",
    scope: "SCOPE_1" as const,
    inputUnit: "tonne-km",
    factorValue: "0.08000000",
    description:
      "Demo factor for freight transported using a heavy diesel truck.",
  },
  {
    activityCode: "TRUCK_ELECTRIC_TONNE_KM",
    activityName: "Electric truck freight",
    category: "Purchased electricity",
    subcategory: "Electric road freight",
    departmentCode: "TRN",
    scope: "SCOPE_2" as const,
    inputUnit: "tonne-km",
    factorValue: "0.03000000",
    description:
      "Demo factor for freight transported using an electric truck.",
  },
];

async function main() {
  for (const factor of transportFactors) {
    const existing = await prisma.emissionFactor.findFirst({
      where: {
        activityCode: factor.activityCode,
        organizationId: null,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      await prisma.emissionFactor.update({
        where: {
          id: existing.id,
        },
        data: {
          activityName: factor.activityName,
          category: factor.category,
          subcategory: factor.subcategory,
          departmentCode: factor.departmentCode,
          scope: factor.scope,
          inputUnit: factor.inputUnit,
          outputUnit: "kgCO2e",
          factorValue: factor.factorValue,
          sourceName: "EcoSphere hackathon transport demo factors",
          sourceYear: 2026,
          version: "demo-v1",
          description: factor.description,
          status: "ACTIVE",
        },
      });
    } else {
      await prisma.emissionFactor.create({
        data: {
          organizationId: null,
          activityCode: factor.activityCode,
          activityName: factor.activityName,
          category: factor.category,
          subcategory: factor.subcategory,
          departmentCode: factor.departmentCode,
          scope: factor.scope,
          inputUnit: factor.inputUnit,
          outputUnit: "kgCO2e",
          factorValue: factor.factorValue,
          sourceName: "EcoSphere hackathon transport demo factors",
          sourceYear: 2026,
          version: "demo-v1",
          description: factor.description,
          status: "ACTIVE",
        },
      });
    }
  }

  console.log("Transport emission factors seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });