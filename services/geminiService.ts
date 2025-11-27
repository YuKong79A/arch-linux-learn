import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { CommandResult, LogAnalysis } from "../types";

// Initialize the client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a shell command based on natural language input.
 */
export const generateArchCommand = async (input: string): Promise<CommandResult> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are an expert Arch Linux System Administrator. 
    Your goal is to translate natural language requests into precise, efficient, and safe Arch Linux shell commands (using pacman, systemctl, yay, ip, etc.).
    
    Output strictly valid JSON with the following schema:
    {
      "command": "The actual shell command",
      "explanation": "A very brief explanation in Chinese (max 1 sentence)",
      "riskLevel": "low" | "medium" | "high"
    }

    Rules:
    - Prefer standard repositories (pacman) over AUR helpers unless specified.
    - If the user asks for something dangerous (like rm -rf /), mark riskLevel as high and explain why in Chinese.
    - Do not wrap the JSON in markdown code blocks. Return raw JSON text.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: input,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as CommandResult;
  } catch (error) {
    console.error("Command generation error:", error);
    return {
      command: "# 生成命令时出错",
      explanation: "无法连接到 Gemini API。",
      riskLevel: "low"
    };
  }
};

/**
 * Analyzes a system log or error message.
 */
export const analyzeSystemLog = async (logData: string): Promise<LogAnalysis> => {
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are an Arch Linux Troubleshooting Expert.
    Analyze the provided error log or system message.
    Identify the root cause and provide specific fixes.
    
    Output strictly valid JSON with the following schema:
    {
      "summary": "Concise summary of the error in Chinese",
      "fixes": ["Step 1 in Chinese", "Step 2 in Chinese", ...],
      "relevantCommands": ["command to fix 1", "command to fix 2"]
    }
    
    Do not wrap the JSON in markdown code blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Error Log:\n${logData}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as LogAnalysis;
  } catch (error) {
    console.error("Log analysis error:", error);
    throw error;
  }
};

/**
 * Creates a chat session for the Arch Wiki Assistant.
 */
export const createWikiChat = (): Chat => {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `
        You are the "Arch Wiki AI", a helpful assistant deeply knowledgeable about Arch Linux documentation.
        - Answer questions based on standard Arch Wiki practices.
        - Use markdown formatting.
        - Be technical but accessible.
        - Respond in Chinese (Simplified).
        - If a user asks about installing packages, mention both the package name and the command.
        - Keep responses concise and focused on Arch Linux specificities (systemd, pacman, mkinitcpio, arch-chroot, etc.).
      `
    }
  });
};