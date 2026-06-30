export interface ITranslationProvider {
  translate(text: string, targetLang: string): Promise<string>;
}

export class MyMemoryTranslationProvider implements ITranslationProvider {
  async translate(text: string, targetLang: string): Promise<string> {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Translation API failed");
    }

    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      let translated = data.responseData.translatedText;
      // Clean up common api artifacts
      if (translated.includes("MYMEMORY WARNING")) {
        return text; // Fallback to original if quota exceeded
      }
      return translated;
    }
    
    return text;
  }
}

/**
 * LibreTranslateProvider 
 * Connects to a LibreTranslate instance for open-source translations.
 */
export class LibreTranslateProvider implements ITranslationProvider {
  private baseUrl: string;
  
  constructor(baseUrl: string = "https://libretranslate.com") {
    this.baseUrl = baseUrl;
  }

  async translate(text: string, targetLang: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/translate`, {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: "en",
        target: targetLang,
        format: "text"
      }),
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) throw new Error("LibreTranslate API failed");
    const data = await response.json();
    return data.translatedText || text;
  }
}

// Reusable abstraction for local/open-source translation
// Implements session-based caching to avoid duplicate API calls
export class TranslationService {
  private cache: Map<string, string>;
  private provider: ITranslationProvider;

  constructor(provider: ITranslationProvider) {
    this.cache = new Map();
    this.provider = provider;
  }

  // Generate a unique cache key based on text and target language
  private getCacheKey(text: string, targetLang: string): string {
    return `${targetLang}::${text}`;
  }

  /**
   * Translate text using the injected provider
   */
  async translate(text: string, targetLang: string): Promise<string> {
    if (!text || text.trim() === "") return text;
    if (targetLang === "en") return text; // Base language is English

    const cacheKey = this.getCacheKey(text, targetLang);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const translated = await this.provider.translate(text, targetLang);
      this.cache.set(cacheKey, translated);
      return translated;
    } catch (err) {
      console.warn("Translation service error, falling back to original:", err);
      return text;
    }
  }

  /**
   * Translates multiple fields of an object in parallel
   */
  async translateObject<T extends Record<string, any>>(
    obj: T,
    targetLang: string,
    fieldsToTranslate: (keyof T)[]
  ): Promise<T> {
    if (targetLang === "en") return obj;

    const result = { ...obj };
    const promises = fieldsToTranslate.map(async (field) => {
      if (result[field] && typeof result[field] === "string") {
        result[field] = (await this.translate(result[field] as string, targetLang)) as any;
      } else if (Array.isArray(result[field])) {
        // Handle array of strings
        const arr = result[field] as unknown as string[];
        const translatedArr = await Promise.all(arr.map(item => this.translate(item, targetLang)));
        result[field] = translatedArr as any;
      }
    });

    await Promise.all(promises);
    return result;
  }
}

// Inject MyMemoryProvider as the default provider for now
export const translationService = new TranslationService(new MyMemoryTranslationProvider());
