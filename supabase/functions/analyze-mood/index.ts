import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendedParams {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
}

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

    const { imageName, prompt } = await req.json();

    const systemPrompt = `당신은 최고급 시네마틱 및 브랜드 디자인 사진 보정 AI 아티스트입니다.
요청된 이미지 (${imageName || '대상 이미지'})에 가장 잘 어울리는 감성 톤앤매너와 보정 파라미터를 추천해 주세요.

반드시 다른 부연설명 없이 순수 JSON 형식으로만 응답해 주세요. 예시:
{
  "analysis": "해질녘 골든 아워 노을빛과 바위의 암석 질감을 입체감 있게 살린 따뜻하고 감성적인 시네마틱 톤",
  "recommendedParams": {
    "brightness": 110,
    "contrast": 115,
    "saturation": 120,
    "temperature": 15,
    "tint": 4
  }
}

파라미터 조건:
- brightness: 80~140 사이 숫자 (기본 100)
- contrast: 85~140 사이 숫자 (기본 100)
- saturation: 70~150 사이 숫자 (기본 100)
- temperature: -30~30 사이 숫자 (기본 0)
- tint: -20~20 사이 숫자 (기본 0)`;

    // 2. Dynamic model discovery
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
            candidateModels = Array.from(new Set([...available, ...candidateModels]));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to dynamic list models, using fallback list:', e);
    }

    let lastError = '';

    // 3. Request Gemini API
    for (const model of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt ? `${systemPrompt}\n\n유저 추가 요청: ${prompt}` : systemPrompt }] }]
        }),
      });

      if (geminiResponse.ok) {
        const data = await geminiResponse.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        let parsedAnalysis = rawText;
        let recommendedParams: RecommendedParams = {
          brightness: 110,
          contrast: 115,
          saturation: 120,
          temperature: 15,
          tint: 5
        };

        try {
          // Clean JSON string if wrapped in markdown codeblock
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.analysis) parsedAnalysis = parsed.analysis;
            if (parsed.recommendedParams) {
              recommendedParams = {
                brightness: Math.min(150, Math.max(50, Number(parsed.recommendedParams.brightness) || 100)),
                contrast: Math.min(150, Math.max(50, Number(parsed.recommendedParams.contrast) || 100)),
                saturation: Math.min(150, Math.max(50, Number(parsed.recommendedParams.saturation) || 100)),
                temperature: Math.min(50, Math.max(-50, Number(parsed.recommendedParams.temperature) || 0)),
                tint: Math.min(50, Math.max(-50, Number(parsed.recommendedParams.tint) || 0))
              };
            }
          }
        } catch (jsonErr) {
          console.warn('Failed to parse Gemini JSON response, using fallback text:', jsonErr);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            aiAnalysis: parsedAnalysis, 
            recommendedParams, 
            modelUsed: model 
          }),
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
