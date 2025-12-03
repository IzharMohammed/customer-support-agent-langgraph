import { Command, END, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { EmailAgentState, EmailAgentStateType } from "./state";
import { classifyInten, draftResponse, humanReview, readEmail, searchDocumentation, sendReply, bugTracking } from "./nodes";
import { writeFileSync } from "node:fs";

const graph = new StateGraph(EmailAgentState)
    .addNode("readEmail", readEmail)
    .addNode("classifyIntent", classifyInten)
    .addNode("searchDocumentation", searchDocumentation)
    .addNode("draftResponse", draftResponse)
    .addNode("humanReview", humanReview)
    .addNode("sendReply", sendReply)
    .addNode("bugTracking", bugTracking)
    .addEdge(START, "readEmail")
    .addEdge("readEmail", "classifyIntent")
    .addEdge("sendReply", END)

// Compile with checkpointer for persistence
const memory = new MemorySaver();

async function main() {
    const app = graph.compile({ checkpointer: memory });

    const drawableGraphGraphState = await app.getGraph();
    const graphStateImage = await drawableGraphGraphState.drawMermaidPng();
    const graphStateArrayBuffer = await graphStateImage.arrayBuffer();

    const filePath = './customerSupportAgentState.png';
    writeFileSync(filePath, new Uint8Array(graphStateArrayBuffer));


    // Test with an urgent billing issue
    const initialState: EmailAgentStateType = {
        emailContent: "I was charged twice for my subscription! This is urgent!",
        senderEmail: "customer@example.com",
        emailId: "email_123",
    };

    // Run with a thread_id for persistence
    const config = { configurable: { thread_id: "customer_123" } };
    const result = await app.invoke(initialState, config);
    // The graph will pause at human_review
    console.log(`Draft ready for review: ${result.responseText?.substring(0, 100)}...`);

    const humanResponse = new Command({
        goto: "sendReply",
        resume: {
            approved: true,
            editedResponse: "We sincerely apologize for the double charge. I've initiated an immediate refund...",
        }
    });

    // Resume execution
    const finalResult = await app.invoke(humanResponse, config);
    console.log("finalResult", finalResult);

    console.log("Email sent successfully!");
}

main();
