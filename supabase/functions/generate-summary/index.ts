import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
if (!DEEPSEEK_API_KEY) {
  throw new Error("DEEPSEEK_API_KEY environment variable is not set");
}
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface RequestBody {
  address: string;
  issueCategories: Record<string, number>;
  recentIssues: {
    category: string;
    subcategory: string;
    status: string;
    description: string;
  }[];
  totalIssues: number;
}

serve(async (req) => {
  try {
    // Check request method
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse request body
    const body: RequestBody = await req.json();
    
    // Validate request body
    if (!body.address || !body.issueCategories || !body.recentIssues) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Prepare the message to DeepSeek
    const messages = [
      {
        role: "system",
        content: "You are an AI assistant specialized in analyzing housing data and providing helpful summaries for potential tenants. Your task is to create a concise, informative summary of building issues based on housing complaint data. Be factual and helpful to potential renters, especially students."
      },
      {
        role: "user",
        content: `Please analyze the following building data for ${body.address} and provide a concise 3-paragraph summary:

Building has ${body.totalIssues} total reported issues.
Issue categories: ${JSON.stringify(body.issueCategories)}
Recent issues: ${JSON.stringify(body.recentIssues.slice(0, 5))}

In your response:
1. First paragraph: Summarize the overall state of the building and most common issues
2. Second paragraph: Highlight the most serious problems that tenants should be aware of
3. Third paragraph: Provide practical advice for potential tenants considering this building

Keep your response under 300 words and focus on information most relevant to students or first-time renters.`
      }
    ];

    // Call DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    // Extract and return the summary
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const summary = data.choices[0].message.content;
      return new Response(JSON.stringify({ summary }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      console.error("Unexpected API response:", data);
      return new Response(JSON.stringify({ 
        error: "Failed to generate summary",
        details: data
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error in generate-summary function:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
