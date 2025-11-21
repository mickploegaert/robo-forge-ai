import { NextRequest, NextResponse } from "next/server";

const OCTOPART_ENDPOINT = "https://api.nexar.com/graphql";

async function fetchAccessToken(clientId: string, clientSecret: string): Promise<string> {
  try {
    const response = await fetch("https://identity.nexar.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "supply.domain",
      }),
    });

    if (!response.ok) {
      throw new Error(`Token fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body as { query?: string };
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const clientId = process.env.NEXAR_CLIENT_ID;
    const clientSecret = process.env.NEXAR_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return NextResponse.json({ 
        error: "Server missing NEXAR_CLIENT_ID or NEXAR_CLIENT_SECRET environment variables" 
      }, { status: 500 });
    }

    const accessToken = await fetchAccessToken(clientId, clientSecret);

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
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: "Upstream error", detail: text }, { status: 502 });
    }

    const data = await resp.json();
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error?.message ?? "Unknown error" }, { status: 500 });
  }
}


