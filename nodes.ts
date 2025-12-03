import { ChatGroq } from "@langchain/groq";
import dotenv from 'dotenv'
import { EmailAgentStateType, EmailClassificationSchema } from "./state";
import { Command } from "@langchain/langgraph";

dotenv.config();

const llm = new ChatGroq({
    model: 'llama-3.3-70b-versatile',
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY,
});

// Read and classify nodes
export async function readEmail(state: EmailAgentStateType) {
    // Extract and parse email content
    // In production, this would connect to your email service

    // const emailContent = state.emailContent;
    // const parsedEmail = JSON.parse(emailContent);
    // return {
    //     ...state,
    //     emailContent: parsedEmail,
    // };

    console.log(`Processing email: ${state.emailContent}`);
    return {};
}

export async function classifyInten(state: EmailAgentStateType) {
    // Use LLM to classify email intent and urgency, then route accordingly

    // Create structured LLM that returns EmailClassification object
    const structuredLLM = llm.withStructuredOutput(EmailClassificationSchema);

    // Format the prompt on-demand, not stored in state
    const classificationPrompt = `
Analyze this customer email and classify it:

Email: ${state.emailContent}
From: ${state.senderEmail}

Provide classification including intent, urgency, topic, and summary.
`;

    const classification = await structuredLLM.invoke(classificationPrompt);
    // Determine next node based on classification
    let nextNode: "searchDocumentation" | "humanReview" | "draftResponse" | "bugTracking";

    if (classification.intent === "billing" || classification.urgency === "critical") {
        nextNode = "humanReview";
    } else if (classification.intent === "question" || classification.intent === "feature") {
        nextNode = "searchDocumentation";
    } else if (classification.intent === "bug") {
        nextNode = "bugTracking";
    } else {
        nextNode = "draftResponse";
    }

    return new Command({
        update: { classification },
        goto: nextNode
    })
}

// Search and tracking nodes
export async function searchDocumentation(state: EmailAgentStateType) {
    // Search knowledge base for relevant information

    // Build search query from classification
    const classification = state.classification!;
    const query = `${classification.intent} ${classification.topic}`;

    let searchResults: string[];

    try {
        // Implement your search logic here
        // Store raw search results, not formatted text
        searchResults = [
            "Reset password via Settings > Security > Change Password",
            "Password must be at least 12 characters",
            "Include uppercase, lowercase, numbers, and symbols",
        ];
    } catch (error) {
        // For recoverable search errors, store error and continue
        searchResults = [`Search temporarily unavailable: ${error}`];
    }

    return new Command({
        update: { searchResults },  // Store raw results or error
        goto: "draftResponse",
    });
}

export async function bugTracking(state: EmailAgentStateType) {
    // Create or update bug tracking ticket

    // Create ticket in your bug tracking system
    const ticketId = "BUG-12345";  // Would be created via API

    return new Command({
        update: { searchResults: [`Bug ticket ${ticketId} created`] },
        goto: "draftResponse",
    });
}
