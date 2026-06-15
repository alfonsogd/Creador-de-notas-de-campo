import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Clipboard, 
  RefreshCw, 
  Send, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  MapPin, 
  FileText,
  Download
} from 'lucide-react';

interface Msg {
  id: string;
  sender: 'ia' | 'user';
  text: string;
  timestamp: string;
  options?: { label: string; value: string; actionString?: string }[];
  isMultipleChoice?: boolean;
}

interface QuestionAnswer {
  pregunta: string;
  respuesta: string;
}

export default function App() {
  // Session State
  const [estudiante, setEstudiante] = useState<string>('');
  const [isla, setIsla] = useState<string>('');
  const [fechaHora, setFechaHora] = useState<string>('');
  const [contextos, setContextos] = useState<string[]>([]);
  const [actorTipo, setActorTipo] = useState<string>('');
  const [actorNombre, setActorNombre] = useState<string>('');
  const [actorRol, setActorRol] = useState<string>('');
  const [actorDetalle, setActorDetalle] = useState<string>('');
  const [observacion, setObservacion] = useState<string>('');
  const [ideasQ1, setIdeasQ1] = useState<string>('');
  const [ideasQ2, setIdeasQ2] = useState<string>('');
  const [ideasQ3, setIdeasQ3] = useState<string>('');
  const [ideasExtra, setIdeasExtra] = useState<string>('');
  const [profundizacion, setProfundizacion] = useState<QuestionAnswer[]>([]);
  const [reflexionTurismo, setReflexionTurismo] = useState<string>('');
  const [reflexionSorpresa, setReflexionSorpresa] = useState<string>('');
  const [reviewPoints, setReviewPoints] = useState<string[]>([]);
  const [isGeneratingReview, setIsGeneratingReview] = useState<boolean>(false);
  
  // Custom Flow Management
  const [step, setStep] = useState<number>(1);
  const [subStep, setSubStep] = useState<number>(0);
  const [inputText, setInputText] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Chat message history
  const [messages, setMessages] = useState<Msg[]>([]);

  // Advice Quote that adapts to current progress or steps
  const [advice, setAdvice] = useState<string>(
    'Recuerda iniciar con respeto: preséntate con los informantes y aclara el fin académico de tu visita.'
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting on load
  useEffect(() => {
    // Set current date/time to local state as default helper
    const now = new Date();
    const formatted = now.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    setFechaHora(formatted);

    const initMessages: Msg[] = [
      {
        id: 'welcome',
        sender: 'ia',
        text: '¡Hola! Bienvenido al asistente de investigación de campo. Te orientaré paso a paso para levantar notas etnográficas claras y honestas para nuestro proyecto: *"Cadenas de abasto alimentario en las islas de Quintana Roo: Cozumel, Isla Mujeres y Holbox"*.',
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'ask-name',
        sender: 'ia',
        text: 'Mi función es ayudarte a recopilar observaciones en territorio y guiar tus reflexiones de forma práctica. Comencemos con el **Paso 1: Datos de Identificación**.\n\nPor favor, **selecciona tu nombre del menú desplegable** que aparece abajo para iniciar:',
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        options: [
          { label: 'Dr. Alfonso González Damián', value: 'Dr. Alfonso González Damián', actionString: 'Dr. Alfonso González Damián' },
          { label: 'Pilar', value: 'Pilar', actionString: 'Pilar' },
          { label: 'Yuly', value: 'Yuly', actionString: 'Yuly' },
          { label: 'Alison', value: 'Alison', actionString: 'Alison' },
          { label: 'Antonio', value: 'Antonio', actionString: 'Antonio' },
          { label: 'Karol', value: 'Karol', actionString: 'Karol' }
        ]
      }
    ];
    setMessages(initMessages);
  }, []);

  // Set advice based on Step & SubStep
  useEffect(() => {
    if (step === 1) {
      if (subStep === 0) {
        setAdvice('El diario de campo inicia siempre con el nombre del observador para la trazabilidad científica.');
      } else if (subStep === 1) {
        setAdvice('Cada isla tiene dinámicas distintas: Cozumel y su puerto masivo, Isla Mujeres residencial/turística, y Holbox de acceso ecológico.');
      } else if (subStep === 2) {
        setAdvice('Registrar con precisión la hora esclarece si estás viendo llegadas de ferries matutinos o el abasto de restaurantes vespertinos.');
      } else {
        setAdvice('¿Mercados, muelles o cocinas? El entorno físico determina el flujo alimentario y la naturaleza de las interacciones.');
      }
    } else if (step === 2) {
      setAdvice('Los actores son puentes esenciales de la cadena de abasto. Comprender su rol ayuda a descifrar quién tiene el poder en la fijación de precios.');
    } else if (step === 3) {
      if (subStep === 0) {
        setAdvice('Toma notas de todo con honestidad: los olores, los colores de las cajas, el sudor, el bullicio, los precios gritados. ¡Todo rastro es un dato!');
      } else {
        setAdvice('Para profundizar, busca entender la procedencia de los insumos (¿vienen del continente, de bodegas en Cancún o de Yucatán?).');
      }
    } else if (step === 4) {
      setAdvice('El turismo transforma economías completas. Alienta la reflexión sobre cómo la demanda hotelera puede encarecer o desplazar la dieta local.');
    } else if (step === 5) {
      setAdvice('¡La nota está completa! Consérvala en NotebookLM o en tus bitácoras de trabajo para el posterior análisis teórico general.');
    }
  }, [step, subStep]);

  // Handle auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiLoading]);

  // Unified function to handle user text entry or option selection
  const handleSend = async (textToSend: string, parsedValue?: string) => {
    if (!textToSend.trim()) return;

    const userTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Msg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: userTime
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Check if user wants to reset at any time
    if (textToSend.toLowerCase().trim() === 'nueva nota') {
      handleResetSession();
      return;
    }

    // Check if user answer is totally off-topic (unless they're writing their freeform name or notes)
    const lowerText = textToSend.toLowerCase().trim();
    if (step > 1 && !parsedValue && (lowerText.includes('clima de mañana') || lowerText.includes('receta de cocina') || lowerText.includes('jugar fútbol') || lowerText.includes('quién eres'))) {
      setIsAiLoading(true);
      setTimeout(() => {
        setIsAiLoading(false);
        const iaMsg: Msg = {
          id: `ia-offtopic-${Date.now()}`,
          sender: 'ia',
          text: 'Estoy aquí exclusivamente para apoyarte en el registro y levantamiento de tus observaciones de campo etnográficas sobre el abasto de Quintana Roo. ¿Continuamos con el paso en el que estábamos?',
          timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, iaMsg]);
      }, 600);
      return;
    }

    // Step state machine progression
    setIsAiLoading(true);

    try {
      if (step === 1) {
        await handleStep1Progression(textToSend, parsedValue);
      } else if (step === 2) {
        await handleStep2Progression(textToSend, parsedValue);
      } else if (step === 3) {
        await handleStep3Progression(textToSend, parsedValue);
      } else if (step === 4) {
        await handleStep4Progression(textToSend);
      } else if (step === 5) {
        // If they enter text once in step 5, let them run 'nueva nota'
        const iaMsg: Msg = {
          id: `ia-finish-${Date.now()}`,
          sender: 'ia',
          text: 'Tu nota ya ha sido compilada. Si deseas registrar una nueva observación, escribe la frase **"nueva nota"** para reiniciar el formato, o presiona el botón "Nueva Nota" en el menú de progreso.',
          timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, iaMsg]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // STEP 1 — DATOS DE IDENTIFICACIÓN logic
  const handleStep1Progression = async (inputValue: string, parsedValue?: string) => {
    const nextTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    if (subStep === 0) {
      // Name provided
      setEstudiante(inputValue);
      setSubStep(1);
      
      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `Mucho gusto, ${inputValue}. Ahora indícame la **isla donde te encuentras** realizando tu observación:`,
        timestamp: nextTime,
        options: [
          { label: 'a) Cozumel', value: 'a) Cozumel', actionString: 'a) Cozumel' },
          { label: 'b) Isla Mujeres', value: 'b) Isla Mujeres', actionString: 'b) Isla Mujeres' },
          { label: 'c) Holbox', value: 'c) Holbox', actionString: 'c) Holbox' }
        ]
      };
      setMessages((prev) => [...prev, nextMsg]);

    } else if (subStep === 1) {
      // Island selection
      let selectedIsland = 'Cozumel';
      if (inputValue.toLowerCase().includes('mujeres') || parsedValue?.toLowerCase().includes('mujeres') || inputValue.toLowerCase() === 'b') {
        selectedIsland = 'Isla Mujeres';
      } else if (inputValue.toLowerCase().includes('holbox') || parsedValue?.toLowerCase().includes('holbox') || inputValue.toLowerCase() === 'c') {
        selectedIsland = 'Holbox';
      } else {
        selectedIsland = 'Cozumel';
      }

      setIsla(selectedIsland);
      setSubStep(2);

      const defaultTime = new Date().toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `Registrado: **${selectedIsland}**. Ahora, indícame la **fecha y hora de tu observación**. \n\nPuedes ingresar una fecha y hora específicas de la observación o pulsar el botón para usar la hora actual del sistema:`,
        timestamp: nextTime,
        options: [
          { label: 'Usar fecha y hora actuales', value: defaultTime, actionString: defaultTime }
        ]
      };
      setMessages((prev) => [...prev, nextMsg]);

    } else if (subStep === 2) {
      // DateTime set
      setFechaHora(inputValue);
      setSubStep(3);

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: 'Registrado. Ahora indícame el **tipo de contexto o espacio** donde se realiza la observación. Selecciona todas las opciones que correspondan (puedes hacer clic en varias, y al terminar haz clic en "Confirmar selección"):',
        timestamp: nextTime,
        isMultipleChoice: true,
        options: [
          { label: 'a) Espacio de venta o mercado (tianguis, mercado municipal, expendio, tienda)', value: 'Espacio de venta o mercado' },
          { label: 'b) Punto de distribución o transporte (muelle, bodega, camión, ruta)', value: 'Punto de distribución o transporte' },
          { label: 'c) Espacio de producción primaria (mar, pescadería, milpa, huerto, apiario)', value: 'Producción primaria' },
          { label: 'd) Espacio de preparación/consumo (cocina de hogar, fonda, restaurante)', value: 'Preparación o consumo' },
          { label: 'e) Entrevista o diálogo directo con informante etnográfico', value: 'Entrevista o conversación' },
          { label: 'f) Otro contexto no catalogado', value: 'Otro contexto' }
        ]
      };
      setMessages((prev) => [...prev, nextMsg]);

    } else if (subStep === 3) {
      // If we confirm contexts
      const chosenContexts = parsedValue ? parsedValue.split(', ') : [inputValue];
      setContextos(chosenContexts);

      // Transition to STEP 2
      setStep(2);
      setSubStep(0);

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `Bien registrado. Hemos completado la identificación general.\n\nPasemos ahora al **Paso 2: Actor(es) de la cadena de abasto**.\n\n¿Tu observación involucra directamente a alguna persona o grupo específico dentro de la cadena? Selecciona una opción para continuar:`,
        timestamp: nextTime,
        options: [
          { label: 'a) Proveedor o distribuidor mayorista', value: 'Proveedor o distribuidor mayorista', actionString: 'a) Proveedor mayorista' },
          { label: 'b) Comerciante minorista (mercado municipal, tienda de abarrotes, expendio)', value: 'Comerciante minorista', actionString: 'b) Comerciante minorista' },
          { label: 'c) Pescador o productor primario (campesino, agricultor, apicultor local)', value: 'Pescador o productor primario', actionString: 'c) Pescador o productor primario' },
          { label: 'd) Restaurantero, chef o cocinero/cocinera de fonda', value: 'Restaurantero o cocinera', actionString: 'd) Restaurantero o cocinero' },
          { label: 'e) Consumidor local (vecino de la isla, familia de planta, trabajador)', value: 'Consumidor local', actionString: 'e) Consumidor local' },
          { label: 'f) Funcionario o gestor institucional (gobierno, cooperativa, director)', value: 'Funcionario o gestor', actionString: 'f) Funcionario o gestor' },
          { label: 'g) Otro actor social de la cadena alimentaria', value: 'Otro actor', actionString: 'g) Otro actor' },
          { label: 'h) No identifico actores específicos (es una observación de espacio o prácticas generales)', value: 'Sin actor específico', actionString: 'h) Sin actor específico' }
        ]
      };
      setMessages((prev) => [...prev, nextMsg]);
    }
  };

  // STEP 2 — ACTOR(ES) DE LA CADENA DE ABASTO logic
  const handleStep2Progression = async (inputValue: string, parsedValue?: string) => {
    const nextTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    if (subStep === 0) {
      // Handle option select
      const choice = parsedValue || inputValue;

      if (choice.startsWith('h') || choice.toLowerCase().includes('sin actor')) {
        setActorTipo('Observación general / Sin actor específico');
        setActorNombre('Ninguno / Práctica general');
        setActorRol('N/A');
        setActorDetalle('N/A');

        // Skip to STEP 3 directly
        setStep(3);
        setSubStep(0);

        const nextMsg: Msg = {
          id: `ia-${Date.now()}`,
          sender: 'ia',
          text: `Entiendo, se trata de una observación general del espacio o dinámica física sin un informante individualizado.

Pasemos al **Paso 3: Redacción guiada de la observación**.
Para ayudarte a armar una excelente nota etnográfica, no te pediré redactar un párrafo desde cero. En su lugar, por favor respóndeme tres sencillas preguntas orientadoras con solo ideas, palabras clave o detalles sueltos de lo que viste en el lugar.

**Pregunta 1 de 3 (Ideas clave):** ¿Qué actividad o situación principal estaba ocurriendo en el lugar? (ej. 'descarga de sandías de un camión', 'pescadores limpiando pargos', 'tienda vacía con anaqueles de metal')`,
          timestamp: nextTime
        };
        setMessages((prev) => [...prev, nextMsg]);
      } else {
        // We have an actor! Safe to register classification
        setActorTipo(choice);
        setSubStep(1);

        const nextMsg: Msg = {
          id: `ia-${Date.now()}`,
          sender: 'ia',
          text: `Excelente tipo de actor: **${choice}**.\n\n¿Cómo se llama esta persona en concreto o qué alias le asignarás para resguardar su identidad en tus notas? (por ejemplo: 'Doña Rosa', 'Pescador Carlos', 'Don Miguel'):`,
          timestamp: nextTime
        };
        setMessages((prev) => [...prev, nextMsg]);
      }

    } else if (subStep === 1) {
      setActorNombre(inputValue);
      setSubStep(2);

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `Entendido, trabajaremos como **${inputValue}**.\n\nEn pocas palabras, ¿cuál es el papel que juega en el abasto insular? ¿De qué labor se encarga?`,
        timestamp: nextTime
      };
      setMessages((prev) => [...prev, nextMsg]);

    } else if (subStep === 2) {
      setActorRol(inputValue);
      setSubStep(3);

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `Registrado: *"Yo entiendo que su papel es ${inputValue}"*.\n\nFinalmente, ¿qué hace, qué vende o produce exactamente este actor en su jornada? (ej: 'Vende piña y papaya traída desde Yucatán', 'Pesca pargo para vender a cooperativas'):`,
        timestamp: nextTime
      };
      setMessages((prev) => [...prev, nextMsg]);

    } else if (subStep === 3) {
      setActorDetalle(inputValue);

      // Transition to STEP 3
      setStep(3);
      setSubStep(0);

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `Estupendo. Los datos del informante están completamente asentados.

Pasemos al **Paso 3: Redacción guiada de la observación**.
Para ayudarte a armar una excelente nota etnográfica, no te pediré redactar la nota desde cero. En su lugar, por favor respóndeme tres breves preguntas orientadoras sencillas con solo ideas, palabras clave o detalles sueltos de lo que presenciaste.

**Pregunta 1 de 3 (Ideas clave):** ¿Qué actividad o situación principal estaba ocurriendo con este actor o en el entorno? (ej. 'descarga de sandías de un camión', 'comerciante acomodando piñas', 'pescador pesando el producto del día')`,
        timestamp: nextTime
      };
      setMessages((prev) => [...prev, nextMsg]);
    }
  };

  // STEP 3 - DESCRIPTION & SMART DEEPENING QUESTIONS logic
  const handleStep3Progression = async (inputValue: string, parsedValue?: string) => {
    const nextTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    if (subStep === 0) {
      // First question (Ideas clave de actividad) answered
      setIdeasQ1(inputValue);
      setSubStep(1);

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `¡Estupendo detalle de lo observado! 

**Pregunta 2 de 3 (Ideas clave):** ¿Qué alimentos o insumos viste en el lugar y en qué condiciones o embalajes se encontraban? (ej. 'manzanas maduras en guacales de madera', 'pescado pargo congelado en neveras', 'verduras frescas sin bolsa')`,
        timestamp: nextTime
      };
      setMessages((prev) => [...prev, nextMsg]);

    } else if (subStep === 1) {
      // Second question (Alimentos y estado) answered
      setIdeasQ2(inputValue);
      setSubStep(2);

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `Registradas las condiciones. 

**Pregunta 3 de 3 (Ideas clave):** ¿Cómo llegaron estos alimentos al lugar o de dónde provienen principalmente? si lo sabes o sospechas (ej. 'cargados desde un ferry cercano', 'vienen de Cancún en camión', 'pescado por pescadores de la cooperativa local')`,
        timestamp: nextTime
      };
      setMessages((prev) => [...prev, nextMsg]);

    } else if (subStep === 2) {
      // Third question (Procedencia / Transporte) answered
      setIdeasQ3(inputValue);
      setSubStep(6);

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `Muchas gracias por tus respuestas, colega. Estoy analizando rápidamente tus apuntes bajo un lente etnográfico de completitud y consistencia...`,
        timestamp: nextTime
      };
      setMessages((prev) => [...prev, nextMsg]);

      // Trigger server-side diagnostic review
      try {
        const response = await fetch('/api/assistant/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isla,
            contextos,
            actorNombre,
            actorRol,
            actorTipo,
            q1: ideasQ1,
            q2: ideasQ2,
            q3: inputValue
          })
        });

        const data = await response.json();
        const diagnoseText = data.text || 'Análisis de completitud y consistencia finalizado.';

        const diagnoseMsg: Msg = {
          id: `ia-diagnose-${Date.now()}`,
          sender: 'ia',
          text: `🔍 **Diagnóstico del Colega de Investigación:**\n\n${diagnoseText}\n\n¿Quieres aportar rápidamente algún detalle etnográfico adicional (p. ej. olores, sonidos, relaciones entre actores, o aclaraciones de consistencia) antes de redactar, o prefieres proceder con el borrador de la nota así como está?`,
          timestamp: nextTime,
          options: [
            { label: 'Aportar precisiones / Agregar detalles ✏️', value: 'add_details', actionString: 'Aportar precisiones / Agregar detalles ✏️' },
            { label: 'Generar borrador de nota así ✅', value: 'make_draft', actionString: 'Generar borrador de nota así ✅' }
          ]
        };
        setMessages((prev) => [...prev, diagnoseMsg]);

      } catch (err) {
        console.error("Diagnosis failed:", err);
        const diagnoseMsg: Msg = {
          id: `ia-diagnose-fallback-${Date.now()}`,
          sender: 'ia',
          text: `He tomado nota de tus respuestas, colega. ¿Te gustaría enriquecer tu nota de campo con algún aspecto sensorial o aclaración adicional (olores, sonidos, detalles visuales del entorno o relaciones entre actores) o pasamos de inmediato a redactar la primera propuesta de borrador?`,
          timestamp: nextTime,
          options: [
            { label: 'Aportar precisiones / Agregar detalles ✏️', value: 'add_details', actionString: 'Aportar precisiones / Agregar detalles ✏️' },
            { label: 'Generar borrador de nota así ✅', value: 'make_draft', actionString: 'Generar borrador de nota así ✅' }
          ]
        };
        setMessages((prev) => [...prev, diagnoseMsg]);
      }

    } else if (subStep === 6) {
      // Diagnostic choice answered
      const isAddDetails = inputValue.includes('Aportar precisiones') || parsedValue === 'add_details';

      if (isAddDetails) {
        setSubStep(7);

        const nextMsg: Msg = {
          id: `ia-${Date.now()}`,
          sender: 'ia',
          text: `¡Excelente de tu parte profundizar en el registro! ✏️\n\nPor favor, escribe con total libertad aquellos aspectos que nos hagan falta (como sonidos específicos, olores del ambiente, sensaciones térmicas, número o tipo de relaciones entre los actores, o cualquier detalle aclaratorio para la consistencia):`,
          timestamp: nextTime
        };
        setMessages((prev) => [...prev, nextMsg]);
      } else {
        // Proceed with drafting immediately
        setSubStep(3);

        const nextMsg: Msg = {
          id: `ia-${Date.now()}`,
          sender: 'ia',
          text: `Muchas gracias. Comprendido totalmente. Estoy procesando y redactando de forma fluida una propuesta de nota de observación para tu visto bueno...`,
          timestamp: nextTime
        };
        setMessages((prev) => [...prev, nextMsg]);

        try {
          const response = await fetch('/api/assistant/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              isla,
              contextos,
              actorNombre,
              actorRol,
              actorTipo,
              q1: ideasQ1,
              q2: ideasQ2,
              q3: ideasQ3,
              ideasExtra: ''
            })
          });

          const data = await response.json();
          const draftText = data.text || 'Propuesta de nota.';
          setObservacion(draftText);
          setSubStep(4);

          const draftMsg: Msg = {
            id: `ia-draft-${Date.now()}`,
            sender: 'ia',
            text: `De acuerdo con tus ideas y los datos de contexto, he armado esta propuesta de redacción sencilla, fluida y sin complicaciones académicas innecesarias para tu bitácora de campo:

"${draftText}"

¿Deseas aprobar esta redacción para integrarla de forma definitiva a tu nota de campo, o quieres solicitar algún ajuste o cambio en el texto?`,
            timestamp: nextTime,
            options: [
              { label: 'Aprobar Redacción ✅', value: 'approved', actionString: 'Aprobar Redacción ✅' },
              { label: 'Ajustar Redacción ✏️', value: 'edit_request', actionString: 'Solicitar un cambio ✏️' }
            ]
          };
          setMessages((prev) => [...prev, draftMsg]);

        } catch (err) {
          console.error(err);
          const fallbackText = `En la isla de ${isla}, se realizó un registro observacional de campo. Durante el recorrido, se presenciaron actividades relacionadas con ${ideasQ1}. Los insumos observados corresponden a ${ideasQ2}. Con respecto al abasto, se identificó que ${ideasQ3}.`;
          setObservacion(fallbackText);
          setSubStep(4);

          const draftMsg: Msg = {
            id: `ia-draft-fallback-${Date.now()}`,
            sender: 'ia',
            text: `De acuerdo con tus ideas clave, he estructurado esta propuesta básica:

"${fallbackText}"

¿Deseas aprobarla u optimizarla con algún cambio?`,
            timestamp: nextTime,
            options: [
              { label: 'Aprobar Redacción ✅', value: 'approved', actionString: 'Aprobar Redacción ✅' },
              { label: 'Ajustar Redacción ✏️', value: 'edit_request', actionString: 'Solicitar un cambio ✏️' }
            ]
          };
          setMessages((prev) => [...prev, draftMsg]);
        }
      }

    } else if (subStep === 7) {
      // Enrichment comments provided by user
      setIdeasExtra(inputValue);
      setSubStep(3);

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `Muchas gracias por las precisiones etnográficas aportadas. Estoy fusionando todo y redactando de forma fluida una propuesta de nota de observación para tu visto bueno...`,
        timestamp: nextTime
      };
      setMessages((prev) => [...prev, nextMsg]);

      try {
        const response = await fetch('/api/assistant/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isla,
            contextos,
            actorNombre,
            actorRol,
            actorTipo,
            q1: ideasQ1,
            q2: ideasQ2,
            q3: ideasQ3,
            ideasExtra: inputValue
          })
        });

        const data = await response.json();
        const draftText = data.text || 'Propuesta de nota.';
        setObservacion(draftText);
        setSubStep(4);

        const draftMsg: Msg = {
          id: `ia-draft-${Date.now()}`,
          sender: 'ia',
          text: `De acuerdo con tus ideas, precisiones de campo sensoriales y el contexto, he diseñado esta propuesta de redacción fluida, realista y directa para tu bitácora de campo:

"${draftText}"

¿Deseas aprobar esta redacción para integrarla de forma definitiva a tu nota de campo, o quieres solicitar algún ajuste o cambio en el texto?`,
          timestamp: nextTime,
          options: [
            { label: 'Aprobar Redacción ✅', value: 'approved', actionString: 'Aprobar Redacción ✅' },
            { label: 'Ajustar Redacción ✏️', value: 'edit_request', actionString: 'Solicitar un cambio ✏️' }
          ]
        };
        setMessages((prev) => [...prev, draftMsg]);

      } catch (err) {
        console.error(err);
        const fallbackText = `En la isla de ${isla}, se realizó un registro observacional de campo. Durante el recorrido, se presenciaron actividades relacionadas con ${ideasQ1}. Los insumos observados corresponden a ${ideasQ2}. Con respecto al abasto, se identificó que ${ideasQ3}. Precisiones agregadas: ${inputValue}.`;
        setObservacion(fallbackText);
        setSubStep(4);

        const draftMsg: Msg = {
          id: `ia-draft-fallback-${Date.now()}`,
          sender: 'ia',
          text: `De acuerdo con tus ideas clave y las observaciones adicionales, he estructurado esta propuesta básica:

"${fallbackText}"

¿Deseas aprobarla u optimizarla con algún cambio?`,
          timestamp: nextTime,
          options: [
            { label: 'Aprobar Redacción ✅', value: 'approved', actionString: 'Aprobar Redacción ✅' },
            { label: 'Ajustar Redacción ✏️', value: 'edit_request', actionString: 'Solicitar un cambio ✏️' }
          ]
        };
        setMessages((prev) => [...prev, draftMsg]);
      }

    } else if (subStep === 4) {
      if (inputValue.includes('Aprobar') || parsedValue === 'approved') {
        // Transition to STEP 4: Reflexión del estudiante
        setStep(4);
        setSubStep(0);

        const nextMsg: Msg = {
          id: `ia-${Date.now()}`,
          sender: 'ia',
          text: `¡Excelente! Nota de campo aprobada con éxito. Se guardó para consolidación definitiva.

Pasemos ahora al **Paso 4: Reflexión personal (sin tono evaluativo)**.

¿Qué relación ves entre lo que observaste hoy en campo y el hecho de que estas islas dependen fuertemente del turismo como motor económico principal?`,
          timestamp: nextTime
        };
        setMessages((prev) => [...prev, nextMsg]);
      } else {
        setSubStep(5);
        const nextMsg: Msg = {
          id: `ia-${Date.now()}`,
          sender: 'ia',
          text: `Por favor, escribe con total libertad qué cambios, precisiones, climas o detalles adicionales te gustaría que incorpore a la redacción:`,
          timestamp: nextTime
        };
        setMessages((prev) => [...prev, nextMsg]);
      }

    } else if (subStep === 5) {
      // Execute edit draft refinement
      const editMsg: Msg = {
        id: `ia-editing-${Date.now()}`,
        sender: 'ia',
        text: `Entendido, adaptando la nota etnográfica con tus precisiones de campo...`,
        timestamp: nextTime
      };
      setMessages((prev) => [...prev, editMsg]);

      try {
        const response = await fetch('/api/assistant/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isla,
            contextos,
            actorNombre,
            actorRol,
            actorTipo,
            previousDraft: observacion,
            feedback: inputValue
          })
        });

        const data = await response.json();
        const refinedText = data.text || 'Borrador corregido';
        setObservacion(refinedText);
        setSubStep(4);

        const nextMsg: Msg = {
          id: `ia-${Date.now()}`,
          sender: 'ia',
          text: `He incorporado tus precisiones a la nota de campo:

"${refinedText}"

¿La apruebas ahora o prefieres solicitar algún otro ajuste?`,
          timestamp: nextTime,
          options: [
            { label: 'Aprobar Redacción ✅', value: 'approved', actionString: 'Aprobar Redacción ✅' },
            { label: 'Ajustar Redacción ✏️', value: 'edit_request', actionString: 'Solicitar un cambio ✏️' }
          ]
        };
        setMessages((prev) => [...prev, nextMsg]);

      } catch (err) {
        console.error(err);
        setSubStep(4);
        const nextMsg: Msg = {
          id: `ia-${Date.now()}`,
          sender: 'ia',
          text: `Ocurrió un problema de conexión ajustando tu nota. Conservamos el borrador previo:

"${observacion}"

¿Deseas aprobarlo o reintentar proponer un ajuste?`,
          timestamp: nextTime,
          options: [
            { label: 'Aprobar Redacción ✅', value: 'approved', actionString: 'Aprobar Redacción ✅' },
            { label: 'Ajustar Redacción ✏️', value: 'edit_request', actionString: 'Solicitar un cambio ✏️' }
          ]
        };
        setMessages((prev) => [...prev, nextMsg]);
      }
    }
  };

  // STEP 4 — REFLEXIÓN DEL ESTUDIANTE logic
  const handleStep4Progression = async (inputValue: string) => {
    const nextTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    if (subStep === 0) {
      // First reflexion set
      setReflexionTurismo(inputValue);
      setSubStep(1);

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `Excelente reflexión teórica preliminar, muy sincera. \n\nAhora la segunda y última pregunta reflexiva: ¿Hubo algo hoy en el lugar que te sorprendió, que no esperabas encontrar, o que todavía no terminas de asimilar o entender por completo?`,
        timestamp: nextTime
      };
      setMessages((prev) => [...prev, nextMsg]);

    } else if (subStep === 1) {
      // Second reflexion set
      setReflexionSorpresa(inputValue);
      
      // Complete STEP 4
      setStep(5);
      setSubStep(0);

      const nextMsg: Msg = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: `¡Fantástico! Hemos recolectado y reflexionado sobre toda la información etnográfica básica del día.\n\nEstamos listos para el **Paso 5: Generación de la Nota de Campo** organizada con precisión.\n\nPor favor, presiona el botón de **"Compilar Nota de Campo Final"** para generar el reporte de campo completo que incluye el dictamen del colega y las tres orientaciones teóricas de revisión académica para tu diario de investigación:`,
        timestamp: nextTime,
        options: [
          { label: 'Compilar Nota de Campo Final 🚀', value: 'listo', actionString: 'listo' }
        ]
      };
      setMessages((prev) => [...prev, nextMsg]);
    }
  };

  // Trigger compiling / Step 5 review generation using server Gemini analysis
  const handleCompileNote = async () => {
    setIsGeneratingReview(true);
    setStep(5);

    try {
      const payloadState = {
        estudiante,
        isla,
        fechaHora,
        contextos,
        actorTipo,
        actorNombre,
        actorRol,
        observacion,
        profundizacion,
        reflexionTurismo,
        reflexionSorpresa
      };

      const res = await fetch('/api/assistant/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionStateBase: payloadState })
      });

      const data = await res.json();
      const reviewText = data.text || "1. Aspecto bien documentado: La descripción del abasto y su vinculación con el sector de consumo local.\n2. Vacío detectado: Conviene indagar más sobre la cadena de transporte marítimo y los intermediarios.\n3. Conexión de estudio: El caso ilustra de forma clara la dependencia alimentaria insular debido a la falta de tierras agrícolas locales.";
      
      // Parse reviews to list
      const points = reviewText
        .split('\n')
        .map((p: string) => p.replace(/^\d+[\.\-\s]*/, '').trim())
        .filter((p: string) => p.length > 0)
        .slice(0, 3);

      setReviewPoints(points);

      // Format final plain text - ONLY identification, narrative, and reflections. NO QAs.
      const finalNote = `=====================================
NOTA DE CAMPO
PROYECTO: CADENAS DE ABASTO ALIMENTARIO EN LAS ISLAS DE QUINTANA ROO
=====================================

DATOS DE IDENTIFICACIÓN
-------------------------------------
Estudiante: ${estudiante}
Isla: ${isla}
Fecha y hora: ${fechaHora}
Contexto de observación: ${contextos.join(', ')}

ACTOR(ES) DE LA CADENA DE ABASTO
-------------------------------------
Tipo de actor: ${actorTipo}
Identificación: ${actorNombre}
Rol en la cadena: ${actorRol}

DESCRIPCIÓN DE LA OBSERVACIÓN (ACORDADA)
-------------------------------------
${observacion}

REFLEXIÓN DEL ESTUDIANTE
-------------------------------------
- Relación con el turismo como motor de dependencia:
${reflexionTurismo}

- Aspectos sorprendentes o no resueltos:
${reflexionSorpresa}

ORIENTACIONES PARA REVISIÓN ACADÉMICA (DIAGNÓSTICO DEL COLEGA DE INVESTIGACIÓN)
=====================================
Directrices de aprendizaje:
1. ${points[0] || 'Aspecto rigurosamente documentado.'}
2. ${points[1] || 'Pregunta abierta o vacío logístico a detallar en otra visita.'}
3. ${points[2] || 'Conexión metodológica con el marco de dependencia insular.'}

=====================================
FIN DE LA NOTA`;

      const nextTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      const completedMsg: Msg = {
        id: `ia-completed-${Date.now()}`,
        sender: 'ia',
        text: `### ¡Nota de campo generada y consolidada con éxito!\n\nTu nota de campo etnográfica está totalmente lista y formateada en la libreta.\n\nPuedes revisarla en la vista previa del panel derecho. **No es necesario que copies y pegues directamente de la pantalla**, especialmente si estás en tu teléfono celular. \n\nSimplemente presiona el botón negro de **"Descargar Nota de Campo (.txt)"** abajo a la derecha para descargar de forma automática el archivo limpio y ordenado con el nombre oficial preestablecido.\n\nSi necesitas registrar otra observación de campo, escribe **'nueva nota'** aquí abajo y comenzaremos de nuevo. ¡Excelente trabajo de campo!`,
        timestamp: nextTime
      };

      setMessages((prev) => [...prev, completedMsg]);

    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingReview(false);
    }
  };

  // Reset function to clear current logging session but append separator on chat
  const handleResetSession = () => {
    setStep(1);
    setSubStep(0);
    setEstudiante('');
    setIsla('');
    const now = new Date();
    setFechaHora(now.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    setContextos([]);
    setActorTipo('');
    setActorNombre('');
    setActorRol('');
    setActorDetalle('');
    setObservacion('');
    setIdeasQ1('');
    setIdeasQ2('');
    setIdeasQ3('');
    setIdeasExtra('');
    setProfundizacion([]);
    setReflexionTurismo('');
    setReflexionSorpresa('');
    setReviewPoints([]);
    setCopied(false);

    const restartTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `ia-separator-${Date.now()}`,
        sender: 'ia',
        text: '🔄 **Iniciando nuevo registro de nota de campo**...',
        timestamp: restartTime
      },
      {
        id: `ia-new-${Date.now()}`,
        sender: 'ia',
        text: 'Comencemos de nuevo con el **Paso 1: Datos de Identificación**.\n\nPor favor, **selecciona tu nombre del menú desplegable** que aparece abajo para iniciar:',
        timestamp: restartTime,
        options: [
          { label: 'Dr. Alfonso González Damián', value: 'Dr. Alfonso González Damián', actionString: 'Dr. Alfonso González Damián' },
          { label: 'Ashley Junuen', value: 'Ashley Junuen', actionString: 'Ashley Junuen' },
          { label: 'Karol Naomi', value: 'Karol Naomi', actionString: 'Karol Naomi' },
          { label: 'Laura Valeria', value: 'Laura Valeria', actionString: 'Laura Valeria' },
          { label: 'Luis Mario', value: 'Luis Mario', actionString: 'Luis Mario' },
          { label: 'Victoria Alexa', value: 'Victoria Alexa', actionString: 'Victoria Alexa' }
        ]
      }
    ]);
  };

  const downloadAsFile = () => {
    const finalNote = `=====================================
NOTA DE CAMPO
PROYECTO: CADENAS DE ABASTO ALIMENTARIO EN LAS ISLAS DE QUINTANA ROO
=====================================

DATOS DE IDENTIFICACIÓN
-------------------------------------
Estudiante: ${estudiante || 'N/A'}
Isla: ${isla || 'N/A'}
Fecha y hora: ${fechaHora || 'N/A'}
Contexto de observación: ${contextos.join(', ') || 'N/A'}

ACTOR(ES) DE LA CADENA DE ABASTO
-------------------------------------
Tipo de actor: ${actorTipo || 'N/A'}
Identificación: ${actorNombre || 'N/A'}
Rol en la cadena: ${actorRol || 'N/A'}

DESCRIPCIÓN DE LA OBSERVACIÓN (ACORDADA)
-------------------------------------
${observacion || 'Pendiente de aprobación'}

REFLEXIÓN DEL ESTUDIANTE
-------------------------------------
- Relación con el turismo como motor de dependencia:
${reflexionTurismo || 'Pendiente'}

- Aspectos sorprendentes o no resueltos:
${reflexionSorpresa || 'Pendiente'}

${reviewPoints.length > 0 ? `ORIENTACIONES PARA REVISIÓN ACADÉMICA (DIAGNÓSTICO DEL COLEGA DE INVESTIGACIÓN)
=====================================
Directrices de aprendizaje:
1. ${reviewPoints[0] || 'Aspecto rigurosamente documentado.'}
2. ${reviewPoints[1] || 'Pregunta abierta o vacío logístico a detallar en otra visita.'}
3. ${reviewPoints[2] || 'Conexión metodológica con el marco de dependencia insular.'}
` : ''}
=====================================
FIN DE LA NOTA`;

    const element = document.createElement("a");
    const file = new Blob([finalNote], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    const safeEstudiante = (estudiante || "estudiante").toLowerCase().replace(/\s+/g, "_");
    const safeIsla = (isla || "isla").toLowerCase().replace(/\s+/g, "_");
    element.download = `nota_de_campo_${safeIsla}_${safeEstudiante}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Multi choice checkbox UI helper for Contextos
  const [selectedContextChoices, setSelectedContextChoices] = useState<string[]>([]);
  const toggleContextChoice = (val: string) => {
    if (selectedContextChoices.includes(val)) {
      setSelectedContextChoices(selectedContextChoices.filter((x) => x !== val));
    } else {
      setSelectedContextChoices([...selectedContextChoices, val]);
    }
  };

  return (
    <div id="main-container" className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header Section */}
      <header id="header-section" className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-slate-800">
              Asistente de Campo Etnográfico
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              Cadenas de Abasto Alimentario en las Islas de Quintana Roo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
            Investigación de Grado
          </span>
          <div className="h-8 w-px bg-slate-200"></div>
          <button 
            id="reset-btn-header"
            onClick={handleResetSession}
            title="Registrar nueva nota desde cero" 
            className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-100 rounded-lg px-3 py-1.5 transition-all text-xs bg-white cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Nueva Nota</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div id="workspace-frame" className="flex flex-1 overflow-hidden h-full">
        
        {/* Left Sidebar: Steps Tracker */}
        <aside id="steps-sidebar" className="hidden md:flex w-64 bg-slate-50 border-r border-slate-200 p-6 flex-col justify-between overflow-y-auto">
          <div>
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">
              Progreso de la Nota
            </h2>
            <nav className="space-y-5">
              
              {/* Step 1 badge */}
              <div className="flex items-center gap-3">
                {step > 1 ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 1 ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300 text-slate-500'}`}>
                    1
                  </div>
                )}
                <span className={`text-xs ${step === 1 ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'}`}>
                  1. Identificación
                </span>
              </div>

              {/* Step 2 badge */}
              <div className={`flex items-center gap-3 ${step < 2 ? 'opacity-50' : ''}`}>
                {step > 2 ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300 text-slate-500'}`}>
                    2
                  </div>
                )}
                <span className={`text-xs ${step === 2 ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'}`}>
                  2. Actor de Cadena
                </span>
              </div>

              {/* Step 3 badge */}
              <div className={`flex items-center gap-3 ${step < 3 ? 'opacity-50' : ''}`}>
                {step > 3 ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 3 ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300 text-slate-500'}`}>
                    3
                  </div>
                )}
                <span className={`text-xs ${step === 3 ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'}`}>
                  3. Descripción
                </span>
              </div>

              {/* Step 4 badge */}
              <div className={`flex items-center gap-3 ${step < 4 ? 'opacity-50' : ''}`}>
                {step > 4 ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 4 ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300 text-slate-500'}`}>
                    4
                  </div>
                )}
                <span className={`text-xs ${step === 4 ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'}`}>
                  4. Reflexión Estudiante
                </span>
              </div>

              {/* Step 5 badge */}
              <div className={`flex items-center gap-3 ${step < 5 ? 'opacity-50' : ''}`}>
                {reviewPoints.length > 0 ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 5 ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300 text-slate-500'}`}>
                    5
                  </div>
                )}
                <span className={`text-xs ${step === 5 ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'}`}>
                  5. Compilación Académica
                </span>
              </div>

            </nav>
          </div>

          {/* Advice Box */}
          <div id="advice-box" className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="text-xs text-indigo-800 font-medium leading-relaxed">
              <span className="block font-bold mb-1 italic">💡 Consejo del Colega:</span>
              {advice}
            </p>
          </div>
        </aside>

        {/* Main Content: Chat Log Area */}
        <main id="chat-container" className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-100">
          
          {/* Scrollable chat thread */}
          <div id="chat-thread" className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50/20">
            {messages.map((msg) => {
              const isIa = msg.sender === 'ia';
              return (
                <div 
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className={`flex gap-3 max-w-[85%] ${isIa ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* Identity Initials */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold uppercase transition-all ${isIa ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white'}`}>
                    {isIa ? 'IA' : (estudiante ? estudiante.slice(0, 2) : 'YO')}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`p-4 rounded-2xl shadow-sm border transition-all text-sm leading-relaxed ${isIa ? 'bg-white border-slate-200 text-slate-700 rounded-tl-none' : 'bg-indigo-600 border-indigo-700 text-white rounded-tr-none'}`}>
                    
                    {/* Rendered Text (supports basic paragraphs) */}
                    <div className="whitespace-pre-wrap font-medium">
                      {msg.text}
                    </div>

                    {/* Standard Action Options */}
                    {msg.options && !msg.isMultipleChoice && msg.options.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 mt-4">
                        {msg.options.map((opt, i) => (
                          <button
                            key={i}
                            id={`option-single-${msg.id}-${i}`}
                            onClick={() => handleSend(opt.actionString || opt.value, opt.value)}
                            className="text-left px-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-500 hover:text-indigo-600 transition-all font-semibold"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Multiple choices logic (e.g. contextos) */}
                    {msg.options && msg.isMultipleChoice && (
                      <div className="mt-4 space-y-2">
                        <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-h-60 overflow-y-auto">
                          {msg.options.map((opt, i) => {
                            const isChecked = selectedContextChoices.includes(opt.value);
                            return (
                              <label 
                                key={i}
                                className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-white transition-all text-slate-700 font-medium text-xs border border-transparent hover:border-slate-100"
                              >
                                <input
                                  type="checkbox"
                                  id={`checkbox-${msg.id}-${i}`}
                                  checked={isChecked}
                                  onChange={() => toggleContextChoice(opt.value)}
                                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                        <button
                          id="btn-confirm-context"
                          disabled={selectedContextChoices.length === 0}
                          onClick={() => {
                            const textSummaryStr = `Elegí los contextos: ${selectedContextChoices.join(', ')}`;
                            handleSend(textSummaryStr, selectedContextChoices.join(', '));
                            setSelectedContextChoices([]); // clear select helper
                          }}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${selectedContextChoices.length > 0 ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                          Confirmar selección ({selectedContextChoices.length})
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* AI Assistant Thinking Loader */}
            {isAiLoading && (
              <div id="ai-loading" className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold uppercase text-slate-600">
                  IA
                </div>
                <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold italic ml-2">El colega está analizando tus notas...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Special UI trigger for compiles */}
          {step === 5 && reviewPoints.length === 0 && !isGeneratingReview && (
            <div className="p-4 mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-medium">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>Todo listo para consolidar tu nota con rigurosidad teórica.</span>
              </div>
              <button
                id="compile-huge-btn"
                onClick={handleCompileNote}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition-all cursor-pointer hover:shadow-lg active:scale-95"
              >
                Generar Nota Académica Final
              </button>
            </div>
          )}

          {isGeneratingReview && (
            <div className="p-5 mx-6 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 text-xs font-bold leading-none">
                <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Analizando datos contra el marco teórico de Quintana Roo...</span>
              </div>
              <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {/* Keyboard input box */}
          <div id="keyboard-input-area" className="p-4 border-t border-slate-200 bg-white flex-shrink-0 font-medium">
            {step === 1 && subStep === 0 ? (
              <div id="student-dropdown-container" className="w-full flex flex-col gap-1.5">
                <label htmlFor="student-select" className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  MENÚ DESPLEGABLE: SELECCIONA TU NOMBRE
                </label>
                <select
                  id="student-select"
                  disabled={isAiLoading}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSend(e.target.value, e.target.value);
                    }
                  }}
                  defaultValue=""
                  className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700 cursor-pointer"
                >
                  <option value="" disabled>--- Haz clic aquí para elegir tu nombre de la lista ---</option>
                  <option value="Dr. Alfonso González Damián">Dr. Alfonso González Damián (Profesor)</option>
                  <option value="Ashley Junuen">Ashley Junuen</option>
                  <option value="Karol Naomi">Karol Naomi</option>
                  <option value="Laura Valeria">Laura Valeria</option>
                  <option value="Luis Mario">Luis Mario</option>
                  <option value="Victoria Alexa">Victoria Alexa</option>
                </select>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputText);
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  id="keyboard-input"
                  value={inputText}
                  disabled={isAiLoading || (step === 1 && subStep === 3) || (step === 2 && subStep === 0 && (messages[messages.length-1]?.options?.length ?? 0) > 0)}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isAiLoading ? "Por favor espera a tu colega..." : "Escribe tu respuesta aquí..."}
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-100 border border-transparent rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  id="submit-send-btn"
                  disabled={!inputText.trim() || isAiLoading}
                  className={`absolute right-2 p-2 rounded-lg transition-all ${
                    inputText.trim() && !isAiLoading
                      ? 'text-indigo-600 hover:bg-indigo-50 cursor-pointer'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </main>

        {/* Right Panel: Live Note Draft Card */}
        <aside id="note-preview-panel" className="w-96 bg-slate-100 p-6 border-l border-slate-200 flex flex-col justify-between overflow-hidden">
          
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Vista Previa
              </h2>
            </div>
            
            {reviewPoints.length > 0 ? (
              <span className="text-[8px] bg-green-500 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Consolidada
              </span>
            ) : (
              <span className="text-[8px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Borrador
              </span>
            )}
          </div>

          {/* Dotted notepad styled paper content */}
          <div 
            id="notepad-card"
            className="flex-1 bg-white p-5 rounded-lg shadow-sm border border-slate-200 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-600 flex flex-col justify-between"
          >
            <div className="space-y-4">
              
              <div className="text-center border-b border-dashed border-slate-200 pb-3">
                <p className="font-bold text-slate-800 text-xs">NOTA DE CAMPO</p>
                <p className="text-[8px] text-slate-400 mt-0.5">PROYECTO: CADENAS DE ABASTO ALIMENTARIO Q.ROO</p>
              </div>

              {/* IDENTIFICACIÓN SECTION */}
              <section className="space-y-1">
                <p className="font-bold text-slate-800 border-b border-slate-100 pb-0.5 uppercase mb-1">
                  DATOS DE IDENTIFICACIÓN
                </p>
                <p>
                  <span className="font-bold text-slate-700">Estudiante:</span>{' '}
                  {estudiante || <span className="text-slate-300 italic">Escribiendo...</span>}
                </p>
                <p>
                  <span className="font-bold text-slate-700">Isla:</span>{' '}
                  {isla || <span className="text-slate-300 italic">Esperando...</span>}
                </p>
                <p>
                  <span className="font-bold text-slate-700">Fecha:</span>{' '}
                  {fechaHora || <span className="text-slate-300 italic">Esperando...</span>}
                </p>
                <p>
                  <span className="font-bold text-slate-700">Contexto:</span>{' '}
                  {contextos.length > 0 ? (
                    contextos.join(', ')
                  ) : (
                    <span className="text-slate-300 italic">Esperando...</span>
                  )}
                </p>
              </section>

              {/* ACTORS SECTION */}
              <section className="space-y-1">
                <p className="font-bold text-slate-800 border-b border-slate-100 pb-0.5 uppercase mb-1">
                  ACTOR(ES) DE ABASTO
                </p>
                <p>
                  <span className="font-bold text-slate-700">Tipo:</span>{' '}
                  {actorTipo || <span className="text-slate-300 italic">Esperando...</span>}
                </p>
                <p>
                  <span className="font-bold text-slate-700">ID / Alias:</span>{' '}
                  {actorNombre || <span className="text-slate-300 italic">Esperando...</span>}
                </p>
                <p>
                  <span className="font-bold text-slate-700">Rol:</span>{' '}
                  {actorRol || <span className="text-slate-300 italic">Esperando...</span>}
                </p>
              </section>

              {/* OBSERVATION DESCRIPTION SECTION */}
              <section className="space-y-1">
                <p className="font-bold text-slate-800 border-b border-slate-100 pb-0.5 uppercase mb-1">
                  DESCRIPCIÓN DE OBSERVACIÓN
                </p>
                {observacion ? (
                  <p className="whitespace-pre-wrap text-[9px] bg-slate-50 p-2 rounded text-slate-600 border border-slate-100 italic">
                    "{observacion}"
                  </p>
                ) : (
                  <p className="text-slate-300 italic">Pendiente de ingreso en Paso 3...</p>
                )}
              </section>



              {/* REFLEXIÓN SECTION */}
              {(reflexionTurismo || reflexionSorpresa) && (
                <section className="space-y-2">
                  <p className="font-bold text-slate-800 border-b border-slate-100 pb-0.5 uppercase mb-1">
                    REFLEXIÓN ESTUDIANTE
                  </p>
                  {reflexionTurismo && (
                    <div className="text-[9px]">
                      <p className="font-bold text-slate-700">Vínculo con el modelo turístico:</p>
                      <p className="italic text-slate-500">"{reflexionTurismo}"</p>
                    </div>
                  )}
                  {reflexionSorpresa && (
                    <div className="text-[9px] mt-1">
                      <p className="font-bold text-slate-700 font-mono">Aspecto sorprendente o no asimilado:</p>
                      <p className="italic text-slate-500 font-mono">"{reflexionSorpresa}"</p>
                    </div>
                  )}
                </section>
              )}

              {/* ORIENTACIONES PARA REVISIÓN (ADVISOR DICTAMEN) */}
              {reviewPoints.length > 0 && (
                <section className="space-y-1.5 bg-amber-50/50 p-3 rounded border border-amber-100">
                  <p className="font-bold text-amber-800 border-b border-amber-200 pb-0.5 uppercase mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>ORIENTACIONES DE REVISIÓN (TITULAR)</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[9px] font-semibold leading-normal">
                    {reviewPoints.map((pt, index) => (
                      <li key={index} className="pl-1">
                        {pt}
                      </li>
                    ))}
                  </ol>
                </section>
              )}

            </div>

            {reviewPoints.length > 0 ? (
              <div className="mt-8 border-t border-slate-200 pt-3 text-center text-slate-400 text-[8px] uppercase tracking-wider font-bold">
                === FIN DE LA NOTA ===
              </div>
            ) : (
              <div className="mt-12 text-center text-slate-300 italic text-[8px]">
                El resto de secciones se compilarán al presionar "Compilar Nota" en el Paso 5...
              </div>
            )}
          </div>

          {/* Download notes control panel */}
          <div className="mt-4 flex-shrink-0">
            <button
              id="download-note-btn"
              disabled={!estudiante || !isla || !observacion}
              onClick={downloadAsFile}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                estudiante && isla && observacion
                  ? copied
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                    : 'bg-slate-800 text-white hover:bg-slate-900 shadow-md active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{copied ? '¡Nota de Campo Descargada! 💾' : 'Descargar Nota de Campo (.txt)'}</span>
            </button>
          </div>

        </aside>

      </div>
    </div>
  );
}
