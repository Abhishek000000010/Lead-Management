import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Provider from "@/models/Provider";
import LeadAssignment from "@/models/LeadAssignment";
import Lead from "@/models/Lead";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Fetch all providers sorted by providerId ascending
    const providers = await Provider.find().sort({ providerId: 1 }).lean();

    // 2. Fetch assigned leads for each provider
    const dashboardData = await Promise.all(
      providers.map(async (provider) => {
        const assignments = await LeadAssignment.find({
          providerId: provider.providerId,
        })
          .populate({ path: "leadId", model: Lead })
          .lean();

        // Extract and map the populated lead objects
        const assignedLeads = assignments
          .map((assignment: any) => assignment.leadId)
          .filter(Boolean) // Fallback in case a lead reference is null
          .map((lead: any) => ({
            name: lead.name,
            phone: lead.phone,
            city: lead.city,
            serviceId: lead.serviceId,
            description: lead.description,
            createdAt: lead.createdAt,
          }));

        return {
          providerId: provider.providerId,
          name: provider.name,
          monthlyQuota: provider.monthlyQuota,
          usedQuota: provider.usedQuota,
          remainingQuota: provider.monthlyQuota - provider.usedQuota,
          leads: assignedLeads,
        };
      })
    );

    return NextResponse.json({ providers: dashboardData }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/dashboard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
