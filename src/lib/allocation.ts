import mongoose from "mongoose";
import Lead from "../models/Lead";
import Provider from "../models/Provider";
import LeadAssignment from "../models/LeadAssignment";
import AllocationState from "../models/AllocationState";
import connectToDatabase from "./db";

export interface CreateLeadInput {
  name: string;
  phone: string;
  city: string;
  serviceId: number;
  description?: string;
}

const mandatoryProvidersConfig: Record<number, number[]> = {
  1: [1],
  2: [5],
  3: [1, 4],
};

const fairPoolConfig: Record<number, number[]> = {
  1: [2, 3, 4],
  2: [6, 7, 8],
  3: [2, 3, 5, 6, 7, 8],
};

function isValidServiceId(serviceId: number) {
  return serviceId === 1 || serviceId === 2 || serviceId === 3;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function createLeadWithAssignmentsOnce(input: CreateLeadInput) {
  if (!isValidServiceId(input.serviceId)) {
    throw new Error("Invalid serviceId");
  }

  await connectToDatabase();

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const mandatoryIds = mandatoryProvidersConfig[input.serviceId];
    const pool = fairPoolConfig[input.serviceId];

    const selectedProviderIds = new Set<number>();

    const newLead = await Lead.create(
      [
        {
          name: input.name,
          phone: input.phone,
          city: input.city,
          serviceId: input.serviceId,
          description: input.description,
        },
      ],
      { session }
    );

    const lead = newLead[0];

    // 1. Assign mandatory providers first
    for (const providerId of mandatoryIds) {
      if (selectedProviderIds.size >= 3) break;

      const provider = await Provider.findOneAndUpdate(
        {
          providerId,
          $expr: { $lt: ["$usedQuota", "$monthlyQuota"] },
        },
        {
          $inc: { usedQuota: 1 },
        },
        {
          session,
          new: true,
        }
      );

      if (provider) {
        selectedProviderIds.add(providerId);
      }
    }

    // 2. Get current round-robin pointer
    const allocationState = await AllocationState.findOne({
      serviceId: input.serviceId,
    }).session(session);

    let pointer = allocationState?.pointerIndex ?? 0;

    // 3. Fill remaining providers using round-robin
    let checked = 0;

    while (selectedProviderIds.size < 3 && checked < pool.length) {
      const providerId = pool[pointer % pool.length];

      if (!selectedProviderIds.has(providerId)) {
        const provider = await Provider.findOneAndUpdate(
          {
            providerId,
            $expr: { $lt: ["$usedQuota", "$monthlyQuota"] },
          },
          {
            $inc: { usedQuota: 1 },
          },
          {
            session,
            new: true,
          }
        );

        if (provider) {
          selectedProviderIds.add(providerId);
        }
      }

      pointer++;
      checked++;
    }

    // 4. Must assign exactly 3 providers
    if (selectedProviderIds.size !== 3) {
      throw new Error(
        `Cannot assign lead: only ${selectedProviderIds.size} providers available, need 3.`
      );
    }

    // 5. Save assignments
    const assignments = Array.from(selectedProviderIds).map((providerId) => ({
      leadId: lead._id,
      providerId,
    }));

    await LeadAssignment.insertMany(assignments, { session });

    // 6. Save updated round-robin pointer
    await AllocationState.findOneAndUpdate(
      { serviceId: input.serviceId },
      {
        $set: {
          pointerIndex: pointer % pool.length,
        },
      },
      {
        session,
        upsert: true,
        new: true,
      }
    );

    await session.commitTransaction();

    return {
      lead,
      assignedProviderIds: Array.from(selectedProviderIds),
    };
  } catch (error: any) {
    await session.abortTransaction();

    if (error?.code === 11000) {
      throw new Error(
        `Duplicate lead: phone ${input.phone} already submitted for service ${input.serviceId}.`
      );
    }

    throw error;
  } finally {
    session.endSession();
  }
}

export async function createLeadWithAssignments(input: CreateLeadInput) {
  const MAX_RETRIES = 10;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await createLeadWithAssignmentsOnce(input);
    } catch (error: any) {
      const message = error?.message || "";

      // Do not retry real validation/business errors
      if (
        message.includes("Invalid serviceId") ||
        message.includes("Duplicate lead") ||
        message.includes("Cannot assign lead")
      ) {
        throw error;
      }

      const isRetryable =
        error?.code === 112 ||
        message.includes("Write conflict") ||
        message.includes("Please retry your operation") ||
        message.includes("TransientTransactionError") ||
        (typeof error?.hasErrorLabel === "function" &&
          error.hasErrorLabel("TransientTransactionError"));

      if (isRetryable && attempt < MAX_RETRIES) {
        const delayMs = attempt * 150;
        await sleep(delayMs);
        continue;
      }

      throw error;
    }
  }

  throw new Error("Failed to assign lead after max retries.");
}