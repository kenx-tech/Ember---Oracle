// Client-side API service to handle text/draft generation with Gemini
// This calls the secure Express backend /api/generate which holds process.env.GEMINI_API_KEY

export interface GenerateTextPayload {
  prompt: string;
  voice: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    content: string;
    isImage: boolean;
  }>;
}

export async function generateText(
  prompt: string,
  voice: string,
  attachments?: any[]
): Promise<any> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      voice,
      attachments: attachments || [],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to generate initial draft');
  }

  return response.json();
}
