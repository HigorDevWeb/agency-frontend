import { NextRequest, NextResponse } from "next/server";

// This endpoint will be called by your N8N workflow to update application status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      applicationId, 
      status, 
      message, 
      feedback, 
      webhookKey 
    } = body;

    // Verify webhook key for security (optional but recommended)
    const expectedKey = process.env.N8N_WEBHOOK_KEY || "your-secret-webhook-key";
    if (webhookKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Invalid webhook key' }, 
        { status: 401 }
      );
    }

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId and status' }, 
        { status: 400 }
      );
    }

    // Here you would update your database
    // For now, we'll just log the update
    console.log('Updating application status from N8N:', {
      applicationId,
      status,
      message,
      feedback,
      timestamp: new Date().toISOString()
    });

    // In production, you would:
    // 1. Find the application by applicationId in your database
    // 2. Update the status, message, and feedback
    // 3. Add a new timeline entry
    // 4. Save to database
    // 5. Optionally trigger real-time updates to frontend

    // Example database update (pseudo-code):
    /*
    const application = await db.applications.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    application.status = status;
    application.statusMessage = message;
    if (feedback) {
      application.feedback = feedback;
    }

    application.timeline.push({
      id: generateId(),
      status,
      message: message || getStatusMessage(status),
      timestamp: new Date().toISOString(),
      isSystemGenerated: true
    });

    await application.save();

    // Optionally emit real-time update to frontend
    emitApplicationUpdate(application.userId, application);
    */

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      applicationId,
      newStatus: status
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method not allowed for this endpoint
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
