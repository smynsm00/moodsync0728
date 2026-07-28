import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get GEMINI-API-KEY secret
    const apiKey = Deno.env.get('GEMINI-API-KEY') || Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'GEMINI-API-KEY 시크릿 환경변수가 설정되지 않았습니다. Supabase Edge Function Secrets를 확인해 주세요.' 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const { prompt } = await req.json();
    const userPrompt = prompt || "이 이미지의 감성 무드 및 어울리는 보정 필터 톤을 2줄로 분석해줘.";

    // 2. Fetch available models dynamically for this user's API Key
    let candidateModels: string[] = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash',
    ];

    try {
      const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listResp.ok) {
        const listData = await listResp.json();
        if (listData?.models && Array.isArray(listData.models)) {
          const available = listData.models
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => m.name.replace('models/', ''));
          if (available.length > 0) {
            // Prioritize flash / pro models
            candidateModels = Array.from(new Set([...available, ...candidateModels]));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to dynamic list models, using fallback list:', e);
    }

    let lastError = '';

    // 3. Try each candidate model until generateContent succeeds
    for (const model of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }]
        }),
      });

      if (geminiResponse.ok) {
        const data = await geminiResponse.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini 응답 생성이 완료되었습니다.";
        return new Response(
          JSON.stringify({ success: true, aiAnalysis: candidateText, modelUsed: model }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } else {
        const errText = await geminiResponse.text();
        lastError = `[${model} 호출 실패 ${geminiResponse.status}]: ${errText}`;
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: lastError }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
