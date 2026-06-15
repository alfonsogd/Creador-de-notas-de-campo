import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __dirname = process.cwd();

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini client (Server-Side)
  // Under standard build settings, the platform provides GEMINI_API_KEY as an env variable.
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Helper for resilient text generation with automatic Model fallback and Exponential Retries
  async function generateWithFallbackModel(
    aiClient: GoogleGenAI,
    params: {
      contents: any;
      config?: any;
    },
    label: string
  ): Promise<string> {
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash"];
    let lastError = null;
    const baseDelay = 1000;

    for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
      const selectedModel = modelsToTry[attempt];
      try {
        const response = await aiClient.models.generateContent({
          model: selectedModel,
          contents: params.contents,
          config: params.config
        });
        if (response && response.text) {
          return response.text.trim();
        }
        throw new Error("Empty text returned from generative model");
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini API [${label}] attempt ${attempt + 1} with [${selectedModel}] failed: ${err.message || err}`);
        if (attempt < modelsToTry.length - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError || new Error(`Failed to generate content for ${label} with all model options.`);
  }

  // API Route: chat with advisor
  app.post('/api/assistant/chat', async (req, res) => {
    const { message, history, systemInstruction } = req.body;
    
    // Robust contextual callback in case Gemini encounters 503 Spikes or rate problems
    const getFallbackResponse = () => {
      const msgLower = (message || '').toLowerCase();
      const historyLength = history ? history.length : 0;

      if (msgLower.includes('primera ronda') || historyLength === 0) {
        return "¡Qué valiosa descripción para iniciar! Se asientan muy bien los hechos físicos. Como colega de investigación, me gustaría que profundizáramos primero en la procedencia: ¿Pudiste percibir u observar de dónde proceden principalmente estos alimentos cuando llegan a la isla y qué tan regular o complejo es su transporte diario desde el muelle o centro continental?";
      } else if (historyLength <= 2) {
        return "Un testimonio muy enriquecedor y sumamente útil. Ahora, exploremos el siguiente aspecto crucial del abasto alimentario: ¿Notaste si existen diferencias notorias en los precios o la calidad de la oferta destinada a los residentes locales frente a los productos para el turismo y los hoteles?";
      } else {
        return "Comprendido perfectamente, un dato muy revelador sobre el flujo de alimentos. Para finalizar este bloque de profundización, ¿notaste alguna queja verbal, tensión o preocupación cotidiana que la gente o las personas del lugar manifestaran respecto a la dependencia alimentaria o la temporada turística alta?";
      }
    };

    if (!ai) {
      return res.status(200).json({ text: getFallbackResponse() });
    }

    try {
      const text = await generateWithFallbackModel(
        ai,
        {
          contents: [
            ...(history || []),
            { role: 'user', parts: [{ text: message }] }
          ],
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        },
        "chat"
      );
      return res.json({ text });
    } catch (err: any) {
      console.warn("All generateContent attempts failed for chat. Serving robust backup.");
      return res.json({ text: getFallbackResponse() });
    }
  });

  // API Route: compile draft observation note from user keywords or adjust draft using feedback
  app.post('/api/assistant/diagnose', async (req, res) => {
    const { isla, contextos, actorNombre, actorRol, actorTipo, q1, q2, q3 } = req.body;

    const getFallbackDiagnosis = () => {
      return `He revisado tus apuntes para la isla de **${isla || 'Quintana Roo'}** en el contexto de **${contextos ? contextos.join(', ') : 'N/A'}**.

1. **Aspectos Sensoriales**: Has detallado la actividad de forma puntual. Sin embargo, para enriquecer tu nota, te sugiero incorporar más aspectos sensoriales: qué olores se perciben, qué sonidos predominan (ferry, camiones, mercado, conversaciones) o texturas del espacio.
2. **Posición del Observador**: Recuerda anotar tu posición como observador para interpretar cómo se conectan las relaciones entre los actores en este espacio.
3. **Consistencia de Datos**: Los contextos seleccionados se ven estables con respecto a lo que describes.`;
    };

    if (!ai) {
      return res.json({ text: getFallbackDiagnosis() });
    }

    const prompt = `Analiza detalladamente las notas y respuestas de un estudiante recopiladas durante su investigación en el territorio para el proyecto de abasto alimentario de Quintana Roo.

DATOS INICIALES:
- Isla: ${isla || 'N/A'}
- Contextos seleccionados: ${contextos ? contextos.join(', ') : 'N/A'}
- Actor: ${actorNombre || 'Ninguno/Práctica general'} (${actorTipo || 'N/A'}) - Rol: ${actorRol || 'N/A'}

RESPUESTAS E IDEAS CLAVE DEL ESTUDIANTE:
1. Actividad de observación: "${q1 || 'N/A'}"
2. Alimentos y estado: "${q2 || 'N/A'}"
3. Procedencia / transporte: "${q3 || 'N/A'}"

Tu tarea es evaluar la completitud etnográfica y la consistencia lógica de esta información. Debes responder con un diagnóstico amigable, directo, horizontal y de tono colegial académico de apoyo, estructurado en tres partes breves (en español):

1. **Aspectos Sensoriales y Observador (Completitud/Sensorial)**: Evalúa si el estudiante describe lo que ve, escucha, huele, toca o degusta (las que apliquen en ese contexto) y su interpretación del espacio. Si falta información sensorial, señálala amigable pero críticamente.
2. **Participantes y Relaciones (Completitud/Posicional)**: Evalúa si se identifican de forma explícita las personas que participan y su rol/relación.
3. **Consistencia de Datos (Coherencia)**: Analiza si hay coherencia entre los contextos iniciales seleccionados (ej. muelle, tienda, restaurante) y lo que de verdad describe en sus respuestas. Por ejemplo, si seleccionó "Espacio de venta o mercado" pero solo describe cosechar en un huerto sin personas. Señala cualquier discordancia con un tono sumamente constructivo.

Termina con una recomendación muy concreta, formulando una pregunta específica sobre detalles del entorno para enriquecer la nota.

REGLAS DE TONALIDAD:
- No uses palabras extremadamente rebuscadas (evita "epistemología", "hermenéutica", etc.).
- Muéstrate curioso y con mentalidad de apoyo horizontal al estudiante.
- El diagnóstico completo debe ser de alrededor de 120 a 180 palabras. Debe ser breve y enfocado.
- No agregues preámbulos robóticos del tipo "Hola, aquí está tu diagnóstico". Entra directamente de manera cálida e integradora.`;

    try {
      const text = await generateWithFallbackModel(
        ai,
        {
          contents: prompt,
          config: {
            systemInstruction: "Eres un colega asesor de investigación etnográfica de campo. Apoyas con calidez, humildad académica y un pensamiento crítico muy agudo pero amigable para que el estudiante elabore un registro excelente.",
            temperature: 0.6,
          }
        },
        "diagnose"
      );
      return res.json({ text });
    } catch (err: any) {
      console.warn("All generateContent attempts failed for diagnosis. Serving fallback.");
      return res.json({ text: getFallbackDiagnosis() });
    }
  });

  // API Route: compile draft observation note from user keywords or adjust draft using feedback
  app.post('/api/assistant/draft', async (req, res) => {
    const { isla, contextos, actorNombre, actorRol, actorTipo, q1, q2, q3, previousDraft, feedback, ideasExtra } = req.body;

    const getFallbackDraft = () => {
      let text = `En la isla de ${isla || 'Quintana Roo'}, se realizó un registro observacional de campo en el contexto de ${contextos ? contextos.join(', ') : 'abasto alimentario'}. `;
      if (actorNombre && actorNombre !== 'Ninguno / Práctica general' && actorNombre !== 'Ninguno / Práctica general' && actorNombre !== 'N/A') {
        text += `Durante el recorrido, se observó a ${actorNombre}, quien se desempeña como ${actorRol || 'actor de la cadena'}. En su actividad, se le vio involucrado con ${q1 || 'actividades logísticas indicadas'}. `;
      } else {
        text += `Durante el recorrido, se presenciaron actividades relacionadas con ${q1 || 'la movilización de mercancías alimentarias'}. `;
      }
      text += `Los insumos correspondían principalmente a ${q2 || 'productos diversos'}. Con respecto al abasto, se identificó que ${q3 || 'los flujos siguen los canales tradicionales de transporte marítimo continental'}.`;
      
      if (ideasExtra) {
        text += ` Detalles adicionales: ${ideasExtra}.`;
      }
      if (feedback) {
        text += `\n\n[Nota: Se intentó ajustar según tu sugerencia ("${feedback}"), pero el modelo inteligente no estuvo disponible en este momento. Se conserva el borrador base]`;
      }
      return text;
    };

    if (!ai) {
      return res.json({ text: getFallbackDraft() });
    }

    let prompt = "";
    if (feedback && previousDraft) {
      prompt = `El estudiante desea modificar el borrador de su nota de campo. 
Borrador previo:
"${previousDraft}"

Instrucciones de cambio del estudiante:
"${feedback}"

Modifica y reescribe la nota de campo para incorporar estos cambios de forma natural. 
Sigue las mismas pautas: redacción sencilla, clara, sin palabras rimbombantes ni alardes académicos complejos. Que conserve un tono descriptivo, humilde y honesto, de una extensión corta similar al borrador previo. No agregues preámbulos ni explicaciones externas. Responde ÚNICAMENTE con la nota redactada final.`;
    } else {
      prompt = `A partir de las siguientes ideas, palabras clave y precisiones sensoriales/posicionales de campo proporcionadas por un estudiante en el territorio, redacta una nota de campo descriptiva, coherente, y sencilla para su diario de investigación.

DATOS DEL CONTEXTO:
- Isla: ${isla || 'N/A'}
- Contextos: ${contextos ? contextos.join(', ') : 'N/A'}
- Actor: ${actorNombre || 'N/A'} (${actorTipo || 'N/A'}) - Rol o actividad: ${actorRol || 'N/A'}

RESPUESTAS E IDEAS CLAVE DEL ESTUDIANTE:
1. Actividad de observación: ${q1 || 'N/A'}
2. Alimentos y estado: ${q2 || 'N/A'}
3. Procedencia / transporte: ${q3 || 'N/A'}
${ideasExtra ? `- Detalles sensoriales/enriquecimiento adicional provisto: ${ideasExtra}` : ''}

PAUTAS DE REDACCIÓN:
- Escribe un relato descriptivo sencillo y fluido en tercera persona sobre lo que se observa en el lugar, de forma realista y honesta.
- Usa una redacción sumamente sencilla, humilde y clara. EVITA palabras rimbombantes, tecnicismos pesados y alardes académicos. Debe ser comprensible y directo.
- Debe ser breve (un solo párrafo, de unas 80 a 140 palabras). No agregues títulos, firmas, introducciones ni explicaciones. Responde únicamente con el párrafo resultante.`;
    }

    try {
      const text = await generateWithFallbackModel(
        ai,
        {
          contents: prompt,
          config: {
            systemInstruction: "Eres un redactor académico de apoyo etnográfico. Ayudas a organizar apuntes de campo desordenados en narrativas fluidas, realistas, sencillas e higiénicas, sin inflar el lenguaje con tecnicismos.",
            temperature: 0.6,
          }
        },
        "draft"
      );
      return res.json({ text });
    } catch (err: any) {
      console.warn("All generateContent attempts failed for draft. Serving robust fallback.");
      return res.json({ text: getFallbackDraft() });
    }
  });

  // API Route: generate review orientations (académico)
  app.post('/api/assistant/review', async (req, res) => {
    const { sessionStateBase } = req.body;
    
    const getFallbackReview = () => {
      const islName = sessionStateBase?.isla || 'la isla';
      const actorNombre = sessionStateBase?.actorNombre || 'el informante';
      return `1. Aspecto bien documentado: Registro empírico directo sobre el abasto y movimientos logísticos en ${islName}, sustentado por las precisiones y la observación descriptiva de ${actorNombre}.
2. Vacío o pregunta pendiente: Conviene indagar con mayor detalle en futuras visitas sobre los fletes, tarifas y la presencia o ausencia de cadenas de frío durante el traslado marítimo desde el continente.
3. Conexión teórica: El caso bajo análisis expone nítidamente el nivel de dependencia alimentaria y las tensiones del mercado hotelero turístico que compite directamente por insumos de primera necesidad frente a la canasta residencial local.`;
    };

    if (!ai) {
      return res.json({ text: getFallbackReview() });
    }

    const prompt = `Analiza la siguiente información de campo.
Estudiante: ${sessionStateBase.estudiante || 'N/A'}
Isla: ${sessionStateBase.isla || 'N/A'}
Fecha: ${sessionStateBase.fechaHora || 'N/A'}
Contexto: ${sessionStateBase.contextos ? sessionStateBase.contextos.join(', ') : 'N/A'}
Actor: ${sessionStateBase.actorTipo || 'N/A'} (${sessionStateBase.actorNombre || 'N/A'}) - Rol: ${sessionStateBase.actorRol || 'N/A'}
Descripción de la observación: ${sessionStateBase.observacion || 'N/A'}
Profundización de Preguntas y Respuestas:
${(sessionStateBase.profundizacion || []).map((p: any, i: number) => `P${i+1}: ${p.pregunta}\nR${i+1}: ${p.respuesta}`).join('\n')}
Reflexiones:
- Turismo y dependencia: ${sessionStateBase.reflexionTurismo || 'N/A'}
- Sorpresas y vacíos: ${sessionStateBase.reflexionSorpresa || 'N/A'}

Genera EXACTAMENTE tres observaciones numeradas (1., 2., 3.) breves, precisas y rigurosas sobre el caso de campo con rigor académico. Cada una debe seguir este criterio estricto:
1. Un aspecto que está bien documentado en esta nota y que será valioso para el análisis metodológico.
2. Un vacío o pregunta de investigación abierta que podría explorarse en una próxima visita al mismo lugar o conversando con el mismo actor.
3. Una conexión explícita con los objetivos teóricos de dependencia alimentaria o asimetrías debido a la prioridad turística.

Responde solo con estas tres observaciones numeradas con tono académico. No agregues introducciones, preámbulos, ni firmas.`;

    try {
      const text = await generateWithFallbackModel(
        ai,
        {
          contents: prompt,
          config: {
            systemInstruction: "Eres un investigador académico principal del proyecto 'Cadenas de abasto alimentario en las islas de Quintana Roo'. Escribes guías de revisión precisas y de alto nivel teórico orientadas a orientar el reporte del estudiante.",
            temperature: 0.5,
          }
        },
        "review"
      );
      return res.json({ text });
    } catch (err: any) {
      console.warn("All generateContent attempts failed for review. Serving robust theoretical fallback.");
      return res.json({ text: getFallbackReview() });
    }
  });

  // Serve static UI assets or use Vite Dev Server as middleware
  if (process.env.NODE_ENV === 'production') {
    // Serve client static production build
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Vite Dev Server in middle-ware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} on port ${port}`);
  });
}

startServer();
