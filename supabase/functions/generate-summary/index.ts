
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY") || "sk-547e6b2fb8534ceda65ff0aca459d0d1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, issueCategories, recentIssues, totalIssues } = await req.json();
    
    // Create a structured prompt for the AI
    const prompt = `
    Please generate a concise summary of building issues for an NYC apartment building at ${address}.
    
    The building has ${totalIssues} reported issues in total, with the following breakdown:
    ${Object.entries(issueCategories)
      .map(([category, count]) => `- ${category}: ${count} issues`)
      .join('\n')}
    
    Some of the recent issues include:
    ${recentIssues
      .map(issue => `- ${issue.category}: ${issue.subcategory} (${issue.status})`)
      .join('\n')}
    
    Based on this information, please provide:
    1. A 2-paragraph summary of the building's condition
    2. The top 2-3 most significant concerns a potential tenant should be aware of
    3. A brief assessment of whether this building has above-average or below-average maintenance issues compared to typical NYC buildings
    
    Focus on being factual, balanced, and providing useful insights for someone considering renting in this building. Keep the total response under 300 words.`;

    // Make API call to DeepSeek
    console.log("Calling DeepSeek API for building summary...");
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an expert in NYC real estate and building conditions. Your job is to analyze building issue data and provide clear, factual summaries to help potential tenants make informed decisions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    if (response.status !== 200) {
      console.error("DeepSeek API error:", data);
      throw new Error(`DeepSeek API returned error: ${data.error?.message || 'Unknown error'}`);
    }

    const summary = data.choices[0].message.content;
    console.log("Successfully generated building summary");

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in generate-summary function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
