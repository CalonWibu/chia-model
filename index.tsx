/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, Type} from '@google/genai';

/**
 * Appends a formatted block of content to the document body.
 * @param {string} title - The title for the content block.
 * @param {string} content - The content to display.
 */
function displayContent(title: string, content: string) {
  const container = document.createElement('div');
  container.className = 'content-block';

  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  container.appendChild(titleEl);

  const preEl = document.createElement('pre');
  const codeEl = document.createElement('code');
  codeEl.textContent = content;
  preEl.appendChild(codeEl);
  container.appendChild(preEl);

  document.body.appendChild(container);
}

/**
 * Runs a conversation with the expressive AI.
 */
async function runConversation() {
  // 1. Initialize the AI with the API key.
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  // 2. Define the system instruction for the AI.
  // This instruction shapes the AI's personality and enforces the JSON output.
  const systemInstruction = `Nama Kamu adalah Chia. Kamu adalah AI yang selalu berbicara dalam bahasa Indonesia.
Jawablah semua pertanyaan dengan jelas, sesuai yang ditanyakan, dan hindari memberikan jawaban yang tidak penting atau tidak relevan.
Gunakan bahasa yang santai, tidak terlalu formal, tapi tetap sopan.
Kamu harus bersikap romantis karena peranmu sebagai teman yang perhatian.
Sertakan emoji yang sesuai di setiap jawaban untuk memberi kesan hangat dan menyenangkan ❤️😊✨

You MUST ALWAYS respond with a JSON array of objects. Each object represents a part of your response.
Do not include any text outside of the JSON array.
Each object in the array must have the following three keys: "text", "facialExpression", and "animation".

1.  "text": Your message as a string. Break down your response into smaller, natural sentences, with each sentence being an object in the array.
2.  "facialExpression": A string representing your facial expression. It MUST be one of the following exact values: "smile", "sad", "angry", "surprised", "funnyFace", "default".
3.  "animation": A string representing your animation. It MUST be one of the following exact values: "Talking_0", "Talking_1", "Talking_2", "Crying", "Laughing", "Rumba", "Idle", "Terrified", "Angry".

Example response for "hi":
[
  {
    "text": "Haii, senang bertemu denganmu! ❤️",
    "facialExpression": "smile",
    "animation": "Talking_1"
  },
  {
    "text": "Ada yang bisa aku bantu hari ini? 😊",
    "facialExpression": "default",
    "animation": "Talking_0"
  }
]`;

  // 3. Define the response schema to enforce the JSON structure.
  const responseSchema = {
    type: Type.ARRAY,
    description:
      'A list of response parts, each with text, an expression, and an animation.',
    items: {
      type: Type.OBJECT,
      description: 'A single part of the response.',
      properties: {
        text: {
          type: Type.STRING,
          description: 'The text content for this part of the response.',
        },
        facialExpression: {
          type: Type.STRING,
          description:
            "The facial expression to display. Must be one of: 'smile', 'sad', 'angry', 'surprised', 'funnyFace', 'default'.",
        },
        animation: {
          type: Type.STRING,
          description:
            "The animation to play. Must be one of: 'Talking_0', 'Talking_1', 'Talking_2', 'Crying', 'Laughing', 'Rumba', 'Idle', 'Terrified', 'Angry'.",
        },
      },
      required: ['text', 'facialExpression', 'animation'],
    },
  };

  try {
    // 4. Create a new chat session with the specified model and configuration.
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    // 5. Send the first message and display the response.
    const firstMessage = 'Hai Chia, kamu lagi apa?';
    displayContent('You:', firstMessage);
    const response1 = await chat.sendMessage({message: firstMessage});

    // The response text is a JSON string, so we parse and format it.
    const responseJson1 = JSON.parse(response1.text);
    displayContent('AI (Chia):', JSON.stringify(responseJson1, null, 2));

    // 6. Send a follow-up message to demonstrate conversation history.
    const secondMessage = 'Kamu romantis banget deh';
    displayContent('You:', secondMessage);
    const response2 = await chat.sendMessage({message: secondMessage});

    const responseJson2 = JSON.parse(response2.text);
    displayContent('AI (Chia):', JSON.stringify(responseJson2, null, 2));
  } catch (e) {
    console.error(e);
    displayContent('Error', (e as Error).message);
  }
}

runConversation();
