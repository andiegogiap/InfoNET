
import { GoogleGenAI } from "@google/genai";
import { Agent, Message, Workflow, WorkflowStep } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder key. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "API_KEY_NOT_SET" });

export async function* runConversation(
  agent1: Agent, 
  agent2: Agent, 
  initialPrompt: string, 
  maxTurns: number,
  aiSupervisorInstruction: string,
  systemOrchestratorInstruction: string
): AsyncGenerator<Message> {
    
  if (!process.env.API_KEY || process.env.API_KEY === "API_KEY_NOT_SET") {
    yield { agentName: 'SYSTEM', text: 'Error: Gemini API Key is not configured. This app requires the API_KEY to be set as an environment variable.' };
    return;
  }
  
  const orchestratedPrompt = systemOrchestratorInstruction
    ? `${systemOrchestratorInstruction}\n\n---\n\nConversation Topic: ${initialPrompt}`
    : `Conversation Topic: ${initialPrompt}`;

  let conversationHistory: Message[] = [{ agentName: 'USER', text: orchestratedPrompt }];
  yield { agentName: 'SYSTEM', text: `Conversation starting between ${agent1.name} and ${agent2.name} on the topic of "${initialPrompt}".` };
  
  let currentAgent = agent1;
  let nextAgent = agent2;

  for (let i = 0; i < maxTurns * 2; i++) {
    const agentSystemInstruction = `You are the AI agent named ${currentAgent.name}.
Your role is: ${currentAgent.role}.
Your personality is: ${currentAgent.personality}.
Your voice style is: "${currentAgent.voice_style}".

The conversation history is below. Your task is to continue the conversation by responding to the last message. Keep your response concise, in character, and do not repeat your name.
`;

    const finalSystemInstruction = aiSupervisorInstruction
      ? `${aiSupervisorInstruction}\n\n---\n\n${agentSystemInstruction}`
      : agentSystemInstruction;

    const historyForPrompt = conversationHistory
      .map(msg => `${msg.agentName}: ${msg.text}`)
      .join('\n');
    
    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: historyForPrompt,
            config: {
                systemInstruction: finalSystemInstruction,
                temperature: 0.8,
                topP: 0.9,
                topK: 40,
            }
        });

        const messageId = `${Date.now()}-${currentAgent.name}`;
        let fullText = "";
        
        // Yield an empty message with an ID to create the UI bubble instantly
        yield { agentName: currentAgent.name, text: "", id: messageId };

        for await (const chunk of stream) {
            const chunkText = chunk.text;
            if (chunkText) {
                fullText += chunkText;
                // Yield the updated full text for the same message ID
                yield { agentName: currentAgent.name, text: fullText, id: messageId };
            }
        }
        
        const newMessage: Message = { agentName: currentAgent.name, text: fullText.trim(), id: messageId };
        conversationHistory.push(newMessage);

        [currentAgent, nextAgent] = [nextAgent, currentAgent];
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to make conversation flow feel more natural

    } catch (error) {
        console.error("Error during conversation turn:", error);
        const errorMessage: Message = { agentName: 'SYSTEM', text: `An error occurred with agent ${currentAgent.name}. The conversation has been halted. Please check your API key and network connection.` };
        yield errorMessage;
        return;
    }
  }
  yield { agentName: 'SYSTEM', text: 'Conversation turn limit reached.' };
}

export async function* runWorkflow(
  workflow: Workflow,
  allAgents: Agent[],
  aiSupervisorInstruction: string,
  systemOrchestratorInstruction: string
): AsyncGenerator<Message> {
  if (!process.env.API_KEY || process.env.API_KEY === "API_KEY_NOT_SET") {
    yield { agentName: 'SYSTEM', text: 'Error: Gemini API Key is not configured. This app requires the API_KEY to be set as an environment variable.' };
    return;
  }

  yield { agentName: 'SYSTEM', text: `Workflow "${workflow.meta.flow_name}" initiated.` };
  
  const orchestratedGoal = systemOrchestratorInstruction
    ? `${systemOrchestratorInstruction}\n\n---\n\nThis is a workflow simulation. The overall goal is: ${workflow.meta.description}`
    : `This is a workflow simulation. The overall goal is: ${workflow.meta.description}`;

  let conversationHistory: Message[] = [{ agentName: 'USER', text: orchestratedGoal }];
  yield { agentName: 'SYSTEM', text: `Starting workflow: ${workflow.meta.flow_name}. ${workflow.meta.description}` };
  
  for (const step of workflow.steps) {
    let currentAgentInfo = allAgents.find(a => a.name.toUpperCase() === step.agent.toUpperCase());
    
    if (!currentAgentInfo && step.agent.toUpperCase() === 'ANDIE') {
        currentAgentInfo = allAgents.find(a => a.name === 'Andoy');
    }

    if (!currentAgentInfo) {
      yield { agentName: 'SYSTEM', text: `Error: Agent "${step.agent}" not found in the agent list. Halting workflow.` };
      return;
    }

    const agentName = currentAgentInfo.name;

    const handoverPrompt = step.handover_to 
        ? `Conclude by clearly stating you are handing over to ${step.handover_to}.`
        : `Conclude by announcing this is the final step and the workflow is complete.`;


    const agentSystemInstruction = `You are the AI agent named ${agentName}.
Your defined role is: ${currentAgentInfo.role}.
In this workflow, your specific role is: ${workflow.agents[step.agent]?.role || currentAgentInfo.role}.

Your current task is "${step.name}". The action to perform is "${step.verb}".
You will work with input "${step.input}" to produce "${step.output}".

Based on the conversation history, announce that you have completed your task. Keep your response concise, in character, and focused on the task. ${handoverPrompt}
Do not repeat your name. Your response must be only your message.`;
    
    const finalSystemInstruction = aiSupervisorInstruction
      ? `${aiSupervisorInstruction}\n\n---\n\n${agentSystemInstruction}`
      : agentSystemInstruction;

    const historyForPrompt = conversationHistory
      .map(msg => `${msg.agentName}: ${msg.text}`)
      .join('\n');
    
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${historyForPrompt}\n\n[${agentName}'s turn to perform task: ${step.name}]`,
            config: {
                systemInstruction: finalSystemInstruction,
                temperature: 0.7,
                topP: 0.9,
                topK: 30,
            }
        });

        const newText = result.text.trim();
        const newMessage: Message = { agentName: agentName, text: newText, step: step };

        conversationHistory.push(newMessage);
        yield newMessage;
        
        await new Promise(resolve => setTimeout(resolve, 750)); // Small delay for UX

    } catch (error) {
        console.error(`Error during workflow step "${step.name}":`, error);
        const errorMessage: Message = { agentName: 'SYSTEM', text: `An error occurred with agent ${agentName} during step ${step.name}. The workflow has been halted.` };
        yield errorMessage;
        return;
    }
  }
  yield { agentName: 'SYSTEM', text: 'Workflow successfully completed.' };
}