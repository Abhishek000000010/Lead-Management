import { NextResponse } from "next/server";
import { createLeadWithAssignments } from "@/lib/allocation"

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { name, phone, city, serviceId, description } = body;

    // Validate required fields
    if (!name || !phone || !city || serviceId === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, phone, city, serviceId" },
        { status: 400 }
      );
    }

    // Convert serviceId to number
    const parsedServiceId = Number(serviceId);
    if (isNaN(parsedServiceId)) {
      return NextResponse.json(
        { error: "Invalid serviceId: must be a valid number" },
        { status: 400 }
      );
    }

    // Call core allocation logic
    const result = await createLeadWithAssignments({
      name,
      phone,
      city,
      serviceId: parsedServiceId,
      description,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    const errorMessage = error.message || "";

    // Handle Duplicate Error (409)
    if (errorMessage.includes("Duplicate lead")) {
      return NextResponse.json({ error: errorMessage }, { status: 409 });
    }

    // Handle Bad Requests (400)
    if (
      errorMessage.includes("Invalid serviceId") ||
      errorMessage.includes("Cannot assign lead")
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Handle Unknown Errors (500)
    console.error("Error in POST /api/leads:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
