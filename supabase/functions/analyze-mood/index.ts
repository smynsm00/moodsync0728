import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get GEMINI-API-KEY secret from Supabase Environment
    const apiKey = Deno.env.get('GEMINI-API-KEY') || Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'GEMINI-API-KEY secret is not set in Supabase Edge Functions environment.' 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 2. Parse request payload
    const { prompt } = await req.json();
    const userPrompt = prompt || "Analyze this image mood and suggest optimal color parameters (brightness, contrast, saturation, temperature, tint).";

    // 3. Call Google Gemini REST API (gemini-1.5-flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userPrompt
              }
            ]
          }
        ]
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return new Response(
        JSON.stringify({ error: `Gemini API call failed (${geminiResponse.status}): ${errorText}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: geminiResponse.status }
      );
    }

    const data = await geminiResponse.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated from Gemini.";

    return new Response(
      JSON.stringify({
        success: true,
        aiAnalysis: candidateText,
        raw: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
