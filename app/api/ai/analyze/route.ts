
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Ticket from "@/models/Ticket";
import AIAnalysis from "@/models/AIAnalysis";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const allowedPriorities = ["Low", "Medium", "High", "Urgent"];
const allowedSentiments = ["Positive", "Neutral", "Negative"];

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!ai) {
      return NextResponse.json(
        {
          success: false,
          message: "GEMINI_API_KEY is missing in environment variables.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid ticket ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(user.userId);

    const ticket = await Ticket.findOne({
      _id: ticketId,
      userId,
    });

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket not found.",
        },
        { status: 404 }
      );
    }

    const prompt = `
You are a senior customer support analyst working in an enterprise support platform.

Your job is to carefully evaluate the customer ticket and provide useful, evidence-based recommendations to the support team.

TICKET INFORMATION:
Subject: ${ticket.subject}
Description: ${ticket.description}
Customer: ${ticket.customerName}
Customer Email: ${ticket.customerEmail}
Current Category: ${ticket.category}
Current Priority: ${ticket.priority}
Current Status: ${ticket.status}
Assigned To: ${ticket.assignedTo}

ANALYSIS INSTRUCTIONS:

1. CATEGORY:
Identify the most appropriate category based on the actual issue.
Do not automatically reuse the existing category if it is incorrect.

2. PRIORITY:
Independently evaluate priority using:
- Severity of the issue.
- Impact on the customer.
- Urgency and time sensitivity.
- Whether the customer is completely blocked.
- Whether the issue affects a critical service.

Priority definitions:
- Low: Minor question, suggestion, or non-urgent issue.
- Medium: Normal support issue with limited impact.
- High: Significant issue affecting an important customer activity.
- Urgent: Critical outage, security incident, major service disruption, or severe business impact requiring immediate attention.

IMPORTANT:
Do not blindly copy the current ticket priority.
The current priority is context only.
Do not assign Urgent without clear evidence.

3. SENTIMENT:
Evaluate the customer's expressed tone.
Do not assume negative sentiment just because they reported a problem.
Use Neutral when there is insufficient emotional context.

4. SUMMARY:
Write a clear summary explaining what happened, what the customer needs, and what is known.
Do not add unsupported details.

5. REASONING:
Explain why you selected the category and priority.
Mention missing information or uncertainty when relevant.
Distinguish confirmed facts from assumptions.

6. SUGGESTED RESPONSE:
Write a professional, natural customer support reply.
If the ticket lacks important details, politely ask specific clarification questions.
If enough information exists, explain the next appropriate support action.
Never claim that an issue has already been fixed or investigated unless the ticket confirms it.

7. KEYWORDS:
Return 3 to 8 relevant keywords based on the ticket.

Return ONLY valid JSON using this exact structure:

{
  "suggestedCategory": "Technical",
  "suggestedPriority": "Medium",
  "sentiment": "Neutral",
  "summary": "A concise explanation of the customer's issue and request.",
  "reasoning": "Evidence-based explanation of the category and priority, including uncertainty where applicable.",
  "suggestedResponse": "A professional response that can be sent to the customer.",
  "keywords": ["account", "support", "access"]
}

FINAL RULES:
- Do not invent facts, causes, actions, or technical details.
- Do not treat missing information as proof of a critical issue.
- Keep the summary concise and useful.
- Keep reasoning specific to this ticket.
- Make the suggested response relevant to the actual ticket.
- Return JSON only, without markdown or additional text.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("Gemini returned an empty response.");
    }

    const cleanedText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    const analysis = {
      suggestedCategory: String(parsed.suggestedCategory || "General"),
      suggestedPriority: allowedPriorities.includes(
        parsed.suggestedPriority
      )
        ? parsed.suggestedPriority
        : "Medium",
      sentiment: allowedSentiments.includes(parsed.sentiment)
        ? parsed.sentiment
        : "Neutral",
      summary: String(parsed.summary || ""),
      reasoning: String(parsed.reasoning || ""),
      suggestedResponse: String(parsed.suggestedResponse || ""),
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords
            .filter((item: unknown) => typeof item === "string")
            .slice(0, 10)
        : [],
    };

    if (
      !analysis.summary ||
      !analysis.reasoning ||
      !analysis.suggestedResponse
    ) {
      throw new Error("Gemini returned incomplete analysis.");
    }

    const savedAnalysis = await AIAnalysis.findOneAndUpdate(
      {
        ticket: ticket._id,
        userId,
      },
      {
        $set: analysis,
        $setOnInsert: {
          ticket: ticket._id,
          userId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Ticket analyzed successfully.",
      data: savedAnalysis,
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to analyze ticket.",
      },
      { status: 500 }
    );
  }
}
