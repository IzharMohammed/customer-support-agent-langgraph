import { ChatGroq } from "@langchain/groq";
import dotenv from 'dotenv'
import { EmailAgentStateType, EmailClassificationSchema } from "./state";
import { Command, END, interrupt } from "@langchain/langgraph";
import { HumanMessage } from "langchain";

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

// Response Nodes
export async function draftResponse(state: EmailAgentStateType) {
    // Generate response using context and route based on quality

    const classification = state.classification!;

    // Format context from raw state data on-demand
    const contextSections: string[] = [];

    if (state.searchResults) {
        // Format search results for the prompt
        const formattedDocs = state.searchResults.map(doc => `- ${doc}`).join("\n");
        contextSections.push(`Relevant documentation:\n${formattedDocs}`);
    }

    if (state.customerHistory) {
        // Format customer data for the prompt
        contextSections.push(`Customer tier: ${state.customerHistory.tier ?? "standard"}`);
    }

    // Build the prompt with formatted context
    const draftPrompt = `
Draft a response to this customer email:
${state.emailContent}

Email intent: ${classification.intent}
Urgency level: ${classification.urgency}

${contextSections.join("\n\n")}

Guidelines:
- Be professional and helpful
- Address their specific concern
- Use the provided documentation when relevant
`;

    const response = await llm.invoke([new HumanMessage(draftPrompt)]);

    // Determine if human review needed based on urgency and intent
    const needsReview = (
        classification.urgency === "high" ||
        classification.urgency === "critical" ||
        classification.intent === "complex"
    );

    // Route to appropriate next node
    const nextNode = needsReview ? "humanReview" : "sendReply";

    return new Command({
        update: { responseText: response.content.toString() },  // Store only the raw response
        goto: nextNode,
    });
}

export async function humanReview(state: EmailAgentStateType) {
    // Pause for human review using interrupt and route based on decision
    const classification = state.classification!;

    // interrupt() must come first - any code before it will re-run on resume
    const humanDecision = interrupt({
        emailId: state.emailId,
        originalEmail: state.emailContent,
        draftResponse: state.responseText,
        urgency: classification.urgency,
        intent: classification.intent,
        action: "Please review and approve/edit this response",
    });

    // Now process the human's decision
    if (humanDecision.approved) {
        return new Command({
            update: { responseText: humanDecision.editedResponse || state.responseText },
            goto: "sendReply",
        });
    } else {
        // Rejection means human will handle directly
        return new Command({ update: {}, goto: END });
    }
}

export async function sendReply(state: EmailAgentStateType): Promise<{}> {
    // Send the email response
    // Integrate with email service
    console.log(`Sending reply: ${state.responseText!.substring(0, 100)}...`);
    return {};
}
