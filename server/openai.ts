import OpenAI from "openai";

// Use local Ollama with OpenAI-compatible API
const openai = new OpenAI({
  apiKey: "ollama",
  baseURL: "http://localhost:11434/v1",
});

const MODEL = "gemma4";

/**
 * Generate an optimized title for an audio clip based on context
 */
export async function generateClipTitle(
  clipContent: string,
  showName: string,
  duration: number
): Promise<string> {
  try {
    const prompt = `Generate a catchy, SEO-friendly title for a podcast clip from "${showName}"
    that is ${Math.round(duration)} seconds long. The clip content is about: "${clipContent}".
    The title should be concise (max 60 chars) and compelling to drive clicks.
    Respond with the title only, no quotes or explanations.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 60,
    });

    return response.choices[0].message.content?.trim() || `${showName} - Highlight Clip`;
  } catch (error) {
    console.error("Error generating clip title:", error);
    return `${showName} - Highlight Clip`;
  }
}

/**
 * Generate an engaging description for an audio clip
 */
export async function generateClipDescription(
  clipContent: string,
  showName: string
): Promise<string> {
  try {
    const prompt = `Write an engaging, SEO-optimized description for a podcast clip from "${showName}".
    The clip is about: "${clipContent}".
    Keep the description under 200 characters, include relevant keywords, and make it enticing.
    Respond with the description only, no quotes or explanations.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Error generating clip description:", error);
    return "";
  }
}

/**
 * Generate clip recommendations for a user based on their preferences
 */
export async function getClipRecommendations(
  userInterests: string[],
  recentActivity: string,
  availableClipTopics: string[]
): Promise<string[]> {
  try {
    const prompt = `Based on a user with interests in ${userInterests.join(", ")}
    who recently ${recentActivity}, recommend 5 podcast clip topics they might enjoy from this list:
    ${availableClipTopics.join(", ")}

    Return your recommendations as a JSON object with a "recommendations" array of strings containing only the topic names. Example: {"recommendations": ["topic1", "topic2"]}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) return [];

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return [];
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
    } catch (e) {
      console.error("Error parsing JSON from model response:", e);
      return [];
    }
  } catch (error) {
    console.error("Error getting clip recommendations:", error);
    return [];
  }
}

/**
 * Moderate user-generated content using the local model
 */
export async function moderateContent(content: string): Promise<{
  isAppropriate: boolean;
  reason?: string;
}> {
  try {
    const prompt = `You are a content moderator. Review the following content and determine if it violates community guidelines (hate speech, explicit violence, sexual content, spam, harassment).

    Content: "${content}"

    Respond with a JSON object: {"appropriate": true/false, "reason": "brief reason if not appropriate"}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 100,
    });

    const text = response.choices[0].message.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { isAppropriate: true };

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      isAppropriate: parsed.appropriate !== false,
      reason: parsed.reason,
    };
  } catch (error) {
    console.error("Error moderating content:", error);
    return { isAppropriate: true };
  }
}

/**
 * Generate clip suggestions from a full podcast episode
 */
export async function suggestClipHighlights(
  transcriptSegments: { text: string; timestamp: number }[],
  showName: string
): Promise<{ text: string; timestamp: number; confidence: number }[]> {
  try {
    const fullTranscript = transcriptSegments
      .map(s => `[${s.timestamp}s] ${s.text}`)
      .join(" ");

    const prompt = `Analyze this podcast transcript from "${showName}" and identify 3-5 segments that would make excellent short clips.
    Look for segments that are insightful, entertaining, controversial, or emotionally impactful.
    Ideal clips should be 15-60 seconds in context.

    Transcript with timestamps:
    ${fullTranscript}

    Return a JSON object with a "suggestions" array. Each item has: timestamp (number), text (string), confidence (0-1). Example: {"suggestions": [{"timestamp": 10, "text": "...", "confidence": 0.9}]}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const content = response.choices[0].message.content;
    if (!content) return [];

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return [];
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    } catch (e) {
      console.error("Error parsing JSON from model response:", e);
      return [];
    }
  } catch (error) {
    console.error("Error suggesting clip highlights:", error);
    return [];
  }
}

/**
 * Generate thumbnail prompt for clip visualization
 */
export async function generateThumbnailPrompt(
  clipContent: string,
  showName: string
): Promise<string> {
  try {
    const prompt = `Create an image prompt to generate a thumbnail for a podcast clip.
    The podcast is called "${showName}" and the clip is about: "${clipContent}".
    The thumbnail should be visually appealing, relevant to the content, and suitable for social media.
    Make the prompt detailed, specific, and creative. Focus on creating an image that would make someone click.
    Respond with the image prompt only, no explanations.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 200,
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Error generating thumbnail prompt:", error);
    return "";
  }
}

/**
 * Image generation not supported with local Ollama — returns null
 */
export async function generateThumbnailImage(_prompt: string): Promise<string | null> {
  return null;
}
