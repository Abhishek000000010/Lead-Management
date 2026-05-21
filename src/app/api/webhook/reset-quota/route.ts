import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import WebhookEvent from "@/models/WebhookEvent";
import Provider from "@/models/Provider";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventKey } = body;

    if (!eventKey) {
      return NextResponse.json(
        { error: "Missing required field: eventKey" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Check idempotency: attempt to create the WebhookEvent
      const newEvent = new WebhookEvent({
        eventKey,
        type: "QUOTA_RESET",
      });

      try {
        await newEvent.save({ session });
      } catch (error: any) {
        // If the eventKey already exists, MongoDB throws a duplicate key error (11000)
        if (error.code === 11000) {
          // Abort the transaction because we don't need to do anything
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json(
            { message: "Webhook already processed" },
            { status: 200 }
          );
        }
        throw error; // Re-throw if it's not a duplicate key error
      }

      // 2. Event is new, proceed to reset quota
      await Provider.updateMany({}, { $set: { usedQuota: 0 } }, { session });

      // Commit changes
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(
        { message: "Quota successfully reset for all providers" },
        { status: 200 }
      );
    } catch (error) {
      // Ensure transaction is rolled back on unexpected errors
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error in POST /api/webhook/reset-quota:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
