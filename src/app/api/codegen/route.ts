import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are an assistant that generates compilable Arduino (C++) sketches.
Constraints:
- Use standard Arduino libraries only unless the user specifies extras.
- Include setup() and loop().
- Add clear pin definitions and comments for wiring.
- Keep code self-contained, ready to compile and upload.
`;

export async function POST(req: NextRequest) {
  try {
    const { description } = (await req.json()) as { description?: string };
    if (!description) {
      return NextResponse.json({ error: "Missing description" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server missing OPENAI_API_KEY" }, { status: 500 });
    }

    const client = new OpenAI({ apiKey });

    // Use GPT-4o for best code generation quality
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate Arduino code for: ${description}` },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content ?? "";

    return NextResponse.json({ code: content });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error?.message ?? "Unknown error" }, { status: 500 });
  }
}


