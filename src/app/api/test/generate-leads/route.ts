import { NextResponse } from "next/server";
import { createLeadWithAssignments } from "@/lib/allocation";

export async function POST() {
  try {
    const generatePromises = [];
    const timestamp = Date.now();

    for (let i = 0; i < 10; i++) {
      // Rotate serviceId between 1, 2, and 3
      const serviceId = (i % 3) + 1; 
      
      // Ensure unique phone number using timestamp suffix and index
      const phone = `9${String(timestamp).slice(-8)}${String(i).padStart(2, "0")}`;
      const payload = {
        name: `Test Lead ${i + 1}`,
        phone,
        city: "Test City",
        serviceId,
        description: `Automated test lead generated at ${new Date().toISOString()}`
      };

      // Catch individual errors so Promise.all does not short-circuit
      const p = createLeadWithAssignments(payload)
        .then((result) => ({
          success: true,
          lead: result.lead,
          assignedProviderIds: result.assignedProviderIds,
          error: null
        }))
        .catch((error: any) => ({
          success: false,
          lead: null,
          assignedProviderIds: [],
          error: error.message || "Unknown error"
        }));

      generatePromises.push(p);
    }

    // Execute concurrently
    const results = await Promise.all(generatePromises);

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        successCount,
        failedCount,
        results
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/test/generate-leads:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
