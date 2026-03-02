import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nitrogen, phosphorus, potassium, ph, rainfall, temperature, humidity } = await req.json();

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("AI API key not configured");

    const prompt = `You are an agricultural soil analysis expert. Based on the following soil parameters, provide:
1. The soil type classification
2. Top 5 most suitable crops
3. A brief farming recommendation

Soil Parameters:
- Nitrogen (N): ${nitrogen} kg/ha
- Phosphorus (P): ${phosphorus} kg/ha
- Potassium (K): ${potassium} kg/ha
- pH: ${ph}
${temperature ? `- Temperature: ${temperature}°C` : ''}
${humidity ? `- Humidity: ${humidity}%` : ''}
${rainfall ? `- Rainfall: ${rainfall} mm` : ''}

Respond ONLY in this exact JSON format (no markdown):
{
  "soil_type": "type name",
  "predicted_crops": ["crop1", "crop2", "crop3", "crop4", "crop5"],
  "recommendation": "2-3 sentence recommendation"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle potential markdown wrapping)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    
    const prediction = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
