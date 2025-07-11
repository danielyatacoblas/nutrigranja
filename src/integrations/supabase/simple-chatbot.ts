export async function askSimpleChatbot(message: string): Promise<string> {
  const res = await fetch(
    "https://mtsyuzvqnpdeqfeqpixv.functions.supabase.co/simple-chatbot",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }
  );
  const data = await res.json();
  if (data.response) return data.response;
  throw new Error(data.error || "Error en el chatbot");
}
