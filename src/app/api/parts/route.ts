import { NextRequest, NextResponse } from "next/server";

const OCTOPART_ENDPOINT = "https://api.nexar.com/graphql"; // Nexar (Octopart) GraphQL endpoint

async function fetchAccessToken(apiKey: string): Promise<string> {
  // Nexar uses OAuth2 client credentials. Here we support a simple PAT via API key if provided.
  // For production, replace with proper clientId/clientSecret token flow.
  return apiKey;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body as { query?: string };
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const apiKey = process.env.OCTOPART_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server missing OCTOPART_API_KEY" }, { status: 500 });
    }

    const accessToken = await fetchAccessToken(apiKey);

    // Basic parts search via Nexar GraphQL (search by q: query)
    const graphQuery = `
      query SearchParts($q: String!) {
        supSearch(q: $q, limit: 10) {
          results {
            part {
              mpn
              manufacturer { name }
              bestImage { url }
              specs {
                attribute { name }
                displayValue
              }
              sellers(offeringFilter: { inStockOnly: false }, limit: 3) {
                company { name }
                offers(limit: 1) {
                  clickUrl
                  prices { price currency } 
                }
              }
            }
          }
        }
      }
    `;

    const resp = await fetch(OCTOPART_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: graphQuery, variables: { q: query } }),
      // Next.js Fetch Cache control for serverless
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: "Upstream error", detail: text }, { status: 502 });
    }

    const data = await resp.json();
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}


