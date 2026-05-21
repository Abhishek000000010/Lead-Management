import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import connectToDatabase from "../src/lib/db";
import Service from "../src/models/Service";
import Provider from "../src/models/Provider";
import AllocationState from "../src/models/AllocationState";

async function seed() {
  console.log("Connecting to database...");
  await connectToDatabase();
  console.log("Connected to database.");

  console.log("Seeding Services...");
  const services = [
    { serviceId: 1, name: "Service 1" },
    { serviceId: 2, name: "Service 2" },
    { serviceId: 3, name: "Service 3" },
  ];

  for (const service of services) {
    await Service.findOneAndUpdate(
      { serviceId: service.serviceId },
      { $set: service },
      { upsert: true, new: true }
    );
  }

  console.log("Seeding Providers...");
  const providers = Array.from({ length: 8 }, (_, i) => ({
    providerId: i + 1,
    name: `Provider ${i + 1}`,
    monthlyQuota: 10,
    usedQuota: 0,
  }));

  for (const provider of providers) {
    await Provider.findOneAndUpdate(
      { providerId: provider.providerId },
      {
        $set: {
          name: provider.name,
          monthlyQuota: provider.monthlyQuota,
        },
        $setOnInsert: {
          usedQuota: provider.usedQuota,
        },
      },
      { upsert: true, new: true }
    );
  }

  console.log("Seeding AllocationState...");
  const allocationStates = [
    { serviceId: 1, pointerIndex: 0 },
    { serviceId: 2, pointerIndex: 0 },
    { serviceId: 3, pointerIndex: 0 },
  ];

  for (const state of allocationStates) {
    await AllocationState.findOneAndUpdate(
      { serviceId: state.serviceId },
      {
        $setOnInsert: {
          pointerIndex: state.pointerIndex,
        },
      },
      { upsert: true, new: true }
    );
  }

  console.log("Seeding completed successfully.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error during seeding:", error);
  process.exit(1);
});
