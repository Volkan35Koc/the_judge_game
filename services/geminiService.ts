import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CaseData, SpeakerRole, EvaluationResult, VerdictResult, Evidence } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize client
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Schema for Case Generation
const caseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Davanın dosya adı (Örn: 'Kasten Yaralama Davası')" },
    defendantName: { type: Type.STRING },
    crime: { type: Type.STRING, description: "Suç tanımı (TCK maddesi referansı ile)" },
    summary: { type: Type.STRING, description: "Olay örgüsü ve iddianame özeti" },
    prosecutionOpening: { type: Type.STRING, description: "Katılan vekilinin hukuki dille açılış konuşması" },
    defenseOpening: { type: Type.STRING, description: "Sanık müdafiinin hukuki dille açılış konuşması" },
    evidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    },
    witnesses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          testimony: { type: Type.STRING, description: "Tanığın ilk beyanı" },
          personality: { type: Type.STRING, description: "Tutum ve davranışları" }
        }
      }
    },
    keyPoints: {
      type: Type.ARRAY,
      description: "Karar verirken hakime yardımcı olacak 3-4 adet kısa ipucu/kritik nokta.",
      items: { type: Type.STRING }
    },
    correctVerdict: { type: Type.STRING, description: "Guilty (Mahkumiyet) veya Not Guilty (Beraat)" },
    reasoning: { type: Type.STRING, description: "Doğru kararın hukuki gerekçesi" }
  },
  required: ["title", "defendantName", "crime", "summary", "prosecutionOpening", "defenseOpening", "evidence", "witnesses", "keyPoints", "correctVerdict", "reasoning"]
};

const evaluationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "0-100 arası puan" },
    feedback: { type: Type.STRING, description: "Yargıtay üslubuyla hukuki geri bildirim" },
    title: { type: Type.STRING, description: "Hakim unvanı" }
  },
  required: ["score", "feedback", "title"]
};

export const generateCase = async (caseNumber: number): Promise<CaseData> => {
  try {
    let difficultyDesc = "";
    let levelName = "";

    if (caseNumber <= 10) {
      levelName = "KOLAY (Başlangıç)";
      difficultyDesc = "Maddi deliller açık ve net olsun. Tanık beyanları tutarlı olsun. Failin kimliği konusunda şüphe bulunmasın. Karar vermek nispeten kolay olsun.";
    } else if (caseNumber <= 20) {
      levelName = "KOLAY-ORTA";
      difficultyDesc = "Olayda cüzi şüpheler bulunsun. Bir tanık yanılgı içinde olabilir. Dolaylı deliller (indicia) ağırlıkta olsun.";
    } else if (caseNumber <= 30) {
      levelName = "ORTA";
      difficultyDesc = "Çelişkili tanık ifadeleri olsun. Sanığın güçlü bir mazereti (alibi) bulunsun ancak maddi bulgular onu işaret etsin. Şüpheden sanık yararlanır ilkesi sınırlarında gezinsin.";
    } else if (caseNumber <= 40) {
      levelName = "ORTA-ZOR";
      difficultyDesc = "Tanıklar yalan beyanda bulunuyor olabilir (yalancı tanıklık). Deliller manipüle edilmiş olabilir. Vicdani kanaat oluşturmak zor olsun.";
    } else {
      levelName = "ZOR (Uzman)";
      difficultyDesc = "Tam bir hukuki kördüğüm (muamma). Tüm deliller birbiriyle çelişsin. Maddi gerçek ancak çok dikkatli bir çapraz sorgu ile ortaya çıksın.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Bir Ağır Ceza Mahkemesi davası oluştur.
        
        ZORLUK SEVİYESİ: ${levelName}
        TALİMAT: ${difficultyDesc}
        
        ROLLER:
        - "Katılan Vekili" (İddia Makamı): Mağdur adına suçlamayı yapan avukat. (Savcı DEĞİLDİR, şikayetçi avukatıdır).
        - "Sanık Müdafii": Sanığı savunan avukat.
        
        DİL, İMLA VE TERMİNOLOJİ KURALLARI (KESİN UYULACAK):
        1. Türkçe imla kurallarına %100 uyulmalıdır. Yazım hatası yapma. Cümleler büyük harfle başlar, nokta ile biter. "Ahkeme" gibi hatalı kelimeler yasaktır.
        2. Resmi ve ciddi bir hukuk dili kullanılmalıdır. Anglikanizm (Bay/Bayan) kullanma, "Sayın" kullan.
        3. Kullanılması gereken terimler: "Müvekkil", "İsnat edilen suç", "Maddi hakikat", "Kovuşturma", "Usule aykırılık", "Hukuka uygunluk", "Hayatın olağan akışı", "Mütalaa", "Beraat", "Mahkumiyet", "Katılan".
        4. "Jüri" kavramını ASLA kullanma. Kararı heyet veya hakim verir.
        5. "keyPoints" alanına, hakimin karar verirken dikkat etmesi gereken 3-4 adet kritik nokta/çelişki ekle (Örn: "Tanığın saati yanlış hatırlaması", "Parmak izinin eksikliği").
        
        FORMAT:
        TÜM İÇERİĞİ JSON FORMATINDA VE SADECE TÜRKÇE OLUŞTUR.
        Mahkeme jenerik bir mahkemedir, "T.C." ibaresi yerine sadece "Mahkeme" veya "Heyetimiz" ifadesini kullan.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: caseSchema,
        temperature: 0.8 + (caseNumber * 0.005), 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    return JSON.parse(text) as CaseData;
  } catch (error) {
    console.error("Failed to generate case:", error);
    throw error;
  }
};

export const askCharacter = async (
  caseData: CaseData,
  role: SpeakerRole,
  name: string,
  history: { role: string; text: string }[],
  question: string,
  presentedEvidence?: Evidence | null
): Promise<string> => {
  try {
    let context = `
      Sen bir Mahkeme simülasyonunda karakterisin.
      Dava: ${caseData.title}
      Suç: ${caseData.crime}
      
      Rolün: ${name} (${role === 'Prosecutor' ? 'Katılan Vekili' : role === 'Defense Attorney' ? 'Sanık Müdafii' : role}).
      
      DİL VE ÜSLUP KURALLARI (KESİN UYULACAK):
      - Türkçe imla ve dil bilgisi kurallarına (büyük/küçük harf, ekler, bağlaçlar) eksiksiz uy. ASLA YAZIM HATASI YAPMA.
      - "Ahkeme" gibi hatalı kelimeler kullanma, doğrusu "Mahkeme"dir. "Bay X" deme, "Sayın X" veya "X Bey" de.
      
      1. KATILAN VEKİLİ (İDDİA MAKAMI): Resmi, teknik ve kararlı konuş. "Sayın Başkan", "Dosya kapsamı incelendiğinde...", "Sanığın cezalandırılması..." gibi ifadeler kullan. Savcı gibi değil, taraf avukatı gibi konuş.
      2. SANIK MÜDAFİİ: Koruyucu ve itirazcı konuş. "Sayın Hakim", "Müvekkilimin masumiyeti...", "Delillerin hukuka aykırılığı...", "Beraat talebi..." gibi ifadeler kullan.
      3. TANIK/SANIK: Hukuki terim bilmezler, doğal konuşurlar ama mahkemeye saygılıdırlar ("Efendim", "Hakim Bey/Hanım").
      
      GÖREV:
      Mahkeme Başkanı (Kullanıcı) sana bir soru sordu. Rolüne ve hukuki terminolojiye uygun cevap ver.
      Kısa ve öz cevap ver (Maksimum 3 cümle).
    `;

    if (presentedEvidence) {
      context += `
        DİKKAT: Mahkeme Başkanı sana bir DELİL gösterdi!
        Gösterilen Delil: "${presentedEvidence.item}" (${presentedEvidence.description}).
        Bu delil karşısında rolüne uygun tepki ver (İnkar et, çürütmeye çalış veya kabul etmek zorunda kal).
      `;
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: context
      }
    });

    const recentHistory = history.slice(-3).map(h => `${h.role}: ${h.text}`).join('\n');

    const message = presentedEvidence 
      ? `(GEÇMİŞ TUTANAK:\n${recentHistory})\n\nMAHKEME BAŞKANI delil göstererek soruyor: "${question}"`
      : `(GEÇMİŞ TUTANAK:\n${recentHistory})\n\nMAHKEME BAŞKANI soruyor: "${question}"`;

    const response = await chat.sendMessage({ message });

    return response.text || "(...)";
  } catch (error) {
    console.error("Failed to get character response:", error);
    return "Müsadenizle, bu soruya şu an yanıt veremiyorum.";
  }
};

export const evaluateVerdict = async (
  caseData: CaseData,
  userVerdict: VerdictResult
): Promise<EvaluationResult> => {
  try {
    const prompt = `
      Sen bir Üst Mahkeme (Temyiz Makamı) olarak görev yapıyorsun.
      
      DAVA: ${caseData.title}
      MADDİ GERÇEK VE HUKUKİ SONUÇ: ${caseData.correctVerdict} (${caseData.reasoning})
      
      YEREL MAHKEME HAKİMİNİN KARARI:
      ${userVerdict.verdict}
      Gerekçe: ${userVerdict.reasoning}
      
      GÖREV:
      Bu kararı hukuki açıdan değerlendir (Temyiz İncelemesi).
      - Türkçe imla ve dil bilgisi kurallarına eksiksiz uy (Yazım hatası yapma).
      - "Dosya incelendi, gereği düşünüldü..." kalıbıyla başla.
      - Kararın "usul ve yasaya" uygun olup olmadığını, delillerin takdirinde isabet olup olmadığını belirt.
      - Sonuç olarak "HÜKMÜN ONANMASINA" veya "HÜKMÜN BOZULMASINA" karar ver.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: evaluationSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No evaluation returned");
    return JSON.parse(text) as EvaluationResult;
  } catch (error) {
    console.error("Evaluation failed:", error);
    return {
      score: 50,
      feedback: "Karar teknik nedenlerle değerlendirilemedi.",
      title: "Hükümsüz"
    };
  }
};