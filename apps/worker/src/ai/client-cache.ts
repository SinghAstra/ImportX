import Groq from "groq-sdk";

const clientCache = new Map<string, Groq>();

export function getCachedClient(apiKey: string, keyIndex: number): Groq {
  let client = clientCache.get(apiKey);

  if (!client) {
    console.log(
      `🔌 [Client Cache] 🆕 Initializing brand new Groq SDK client instance for Key Index ${keyIndex}...`
    );

    client = new Groq({ apiKey });

    clientCache.set(apiKey, client);
  }

  return client;
}
