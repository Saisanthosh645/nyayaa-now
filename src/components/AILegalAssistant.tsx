import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Sparkles, 
  ArrowLeft, 
  RotateCcw, 
  Send, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  Scale, 
  FileText, 
  PhoneCall, 
  Compass, 
  Mic, 
  MicOff,
  User,
  Users,
  Bot,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Radio,
  Headphones,
  Globe,
  Zap,
  Play,
  Square,
  Key,
  X,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../types';
import { AIResponse } from './ai-assistant/AIResponse';
import { IntelligenceTelemetry } from './ai-assistant/IntelligenceTelemetry';
import { AshokaChakra } from './AshokaChakra';
import {
  AILegalService,
  AIResponseData,
  ChatMessage,
  ChatResponseResult
} from '../services/aiLegalService';
import {
  VoiceLanguageService,
  SupportedVoiceLang,
  ALL_INDIAN_LANGUAGES,
  REAL_WORLD_VOICE_SAMPLES
} from '../services/voiceLanguageService';

interface AILegalAssistantProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateBack?: () => void;
  onNavigateToLawyerConnection?: () => void;
}

type AssistantMode = 'chat' | 'voice';
type LiveVoiceState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

export const AILegalAssistant: React.FC<AILegalAssistantProps> = ({
  language,
  onLanguageChange,
  onNavigateBack,
  onNavigateToLawyerConnection
}) => {
  // Mode switcher: Chat vs Live Voice
  const [assistantMode, setAssistantMode] = useState<AssistantMode>(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('voice-assistant')) {
      return 'voice';
    }
    return 'chat';
  });
  
  // Chat state
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentResponseData, setCurrentResponseData] = useState<AIResponseData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [expandedDossierIds, setExpandedDossierIds] = useState<Record<string, boolean>>({});
  const [isListening, setIsListening] = useState<boolean>(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('nyaya_gemini_api_key') || '' : '';
  });
  const [apiKeySaved, setApiKeySaved] = useState<boolean>(false);

  // Live Voice Room state
  const [liveVoiceState, setLiveVoiceState] = useState<LiveVoiceState>('IDLE');
  const [liveVoiceTranscript, setLiveVoiceTranscript] = useState<string>('');
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<SupportedVoiceLang>(language);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [latestVoiceReply, setLatestVoiceReply] = useState<{
    query: string;
    text: string;
    citations?: string[];
    sayThisFirst?: string;
  } | null>(null);

  const handleSaveApiKey = (key: string) => {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem('nyaya_gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('nyaya_gemini_api_key');
    }
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2500);
  };

  const conversationEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const isHi = language === 'hi';
  const isTe = language === 'te';

  // Synchronize voice speech dialect whenever language prop updates
  useEffect(() => {
    if (language === 'te' || language === 'hi' || language === 'en') {
      setSelectedVoiceLang(language);
    }
  }, [language]);

  // Pick up any queued prompt from the home teaser (via sessionStorage)
  useEffect(() => {
    const pending = sessionStorage.getItem('nyaya_pending_prompt');
    if (pending) {
      sessionStorage.removeItem('nyaya_pending_prompt');
      handleSendMessage(pending);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      VoiceLanguageService.stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        Math.max(textareaRef.current.scrollHeight, 48),
        160
      )}px`;
    }
  }, [inputText]);

  // Scroll to bottom smoothly
  const scrollToBottom = () => {
    setTimeout(() => {
      conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  // Main send message handler
  const handleSendMessage = async (promptText: string) => {
    const query = promptText.trim();
    if (!query || isThinking) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);
    scrollToBottom();

    try {
      const history = messages
        .filter((message) => message.content && (message.sender === 'user' || message.sender === 'assistant'))
        .map((message) => ({ role: message.sender, content: message.content as string }))
        .slice(-8);
      const chatRes: ChatResponseResult = await AILegalService.getChatResponse(query, language, history);

      setCurrentResponseData(null);

      const assistantMsg: ChatMessage = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: chatRes.text,
        userQuery: query,
        allTranslations: chatRes.allTranslations,
        allSuggestions: chatRes.allSuggestions,
        suggestions: chatRes.suggestions,
        citations: chatRes.citations
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If Auto-Speak is enabled, read response out loud automatically
      if (autoSpeak) {
        VoiceLanguageService.stopSpeaking();
        VoiceLanguageService.speakText(chatRes.text, language, 1.0, () => {
          setSpeakingId(assistantMsg.id);
        }, () => {
          setSpeakingId(null);
        });
      }
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: 'ast-err-' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: err instanceof Error
          ? err.message
          : isHi
          ? 'सॉरी, कुछ तकनीकी समस्या आई। कृपया अपना प्रश्न दोबारा पूछें।'
          : isTe
          ? 'క్షమించండి, సాంకేతిక సమస్య ఏర్పడింది. దయచేసి మళ్ళీ అడగండి.'
          : 'I encountered an unexpected issue. Please ask your question again.',
        suggestions: ['Police stopped me', 'What is BNSS 2023?', 'FIR refused']
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
      scrollToBottom();
    }
  };

  // Live Voice Room Execution Handler
  const handleVoiceQuerySubmit = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    setLiveVoiceTranscript(trimmed);
    setLiveVoiceState('THINKING');

    // Detect language
    const detection = VoiceLanguageService.detectLanguage(trimmed);
    setDetectedLanguage(detection.detectedLangMeta.name);

    // Prioritize selected voice lang if explicitly set, else use detected lang, else current language
    const effectiveLang: Language =
      selectedVoiceLang !== 'auto'
        ? (selectedVoiceLang as Language)
        : (detection.confidence >= 0.85 ? detection.detectedLang : language);

    // If auto mode strongly detected a language different from app language, update app language to match
    if (selectedVoiceLang === 'auto' && detection.confidence >= 0.95 && detection.detectedLang !== language) {
      onLanguageChange(detection.detectedLang);
    }

    try {
      const chatRes = await AILegalService.getChatResponse(trimmed, effectiveLang);
      
      // Update voice reply state
      setLatestVoiceReply({
        query: trimmed,
        text: chatRes.text,
        citations: chatRes.citations,
        sayThisFirst: chatRes.sayThisFirst
      });

      // Also append to full chat thread seamlessly
      const userMsg: ChatMessage = {
        id: 'usr-voice-' + Date.now(),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: trimmed
      };
      const assistantMsg: ChatMessage = {
        id: 'ast-voice-' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: chatRes.text,
        userQuery: trimmed,
        allTranslations: chatRes.allTranslations,
        allSuggestions: chatRes.allSuggestions,
        citations: chatRes.citations,
        suggestions: chatRes.suggestions
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Speak response out loud through TTS
      setLiveVoiceState('SPEAKING');
      const spokenText = chatRes.sayThisFirst ? `${chatRes.sayThisFirst}. ${chatRes.text}` : chatRes.text;
      VoiceLanguageService.speakText(
        spokenText, 
        effectiveLang, 
        0.95, 
        () => setLiveVoiceState('SPEAKING'),
        () => setLiveVoiceState('IDLE')
      );
    } catch (err) {
      console.error('Voice query error:', err);
      setLiveVoiceState('IDLE');
    }
  };

  // Start Live Voice Recording in Voice Room
  const handleStartLiveVoiceListening = () => {
    const SpeechRecognition = 
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition || 
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(isHi ? 'ब्राउज़र में वॉयस इनपुट समर्थित नहीं है।' : isTe ? 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు.' : 'Voice recognition is not supported in this browser.');
      return;
    }

    if (liveVoiceState === 'LISTENING') {
      try { recognitionRef.current?.stop(); } catch {}
      setLiveVoiceState('IDLE');
      return;
    }

    VoiceLanguageService.stopSpeaking();

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      if (selectedVoiceLang === 'hi' || (selectedVoiceLang === 'auto' && isHi)) {
        recognition.lang = 'hi-IN';
      } else if (selectedVoiceLang === 'te' || (selectedVoiceLang === 'auto' && isTe)) {
        recognition.lang = 'te-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setLiveVoiceState('LISTENING');
        setLiveVoiceTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTranscript = event.results[i][0].transcript;
            setLiveVoiceTranscript(finalTranscript);
            handleVoiceQuerySubmit(finalTranscript);
            return;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) {
          setLiveVoiceTranscript(interim);
        }
      };

      recognition.onerror = () => {
        setLiveVoiceState('IDLE');
      };

      recognition.onend = () => {
        if (liveVoiceState === 'LISTENING') {
          setLiveVoiceState('IDLE');
        }
      };

      recognition.start();
    } catch {
      setLiveVoiceState('IDLE');
    }
  };

  // Toggle Voice Input in Chat Mode (Dictation into text box)
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = 
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition || 
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(isHi ? 'आपके ब्राउज़र में वॉयस इनपुट समर्थित नहीं है।' : 'Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = isHi ? 'hi-IN' : isTe ? 'te-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Copy message to clipboard
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Text-to-Speech playback for specific message
  const handleToggleSpeech = (id: string, text: string) => {
    if (speakingId === id) {
      VoiceLanguageService.stopSpeaking();
      setSpeakingId(null);
      return;
    }

    VoiceLanguageService.stopSpeaking();
    VoiceLanguageService.speakText(
      text, 
      language, 
      0.95, 
      () => setSpeakingId(id), 
      () => setSpeakingId(null)
    );
  };

  // Toggle dossier expansion
  const toggleDossier = (msgId: string) => {
    setExpandedDossierIds((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  // Reset conversation
  const handleClearSession = () => {
    VoiceLanguageService.stopSpeaking();
    setSpeakingId(null);
    setMessages([]);
    setCurrentResponseData(null);
    setInputText('');
    setIsThinking(false);
    setExpandedDossierIds({});
    setLatestVoiceReply(null);
    setLiveVoiceTranscript('');
    setLiveVoiceState('IDLE');
  };

  // Helper for bold and italic inline markup
  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="text-amber-200 font-normal">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  // Format message text with markdown styling
  const renderFormattedContent = (content?: string) => {
    if (!content) return null;
    const lines = content.split('\n');

    return (
      <div className="space-y-2.5 text-[15px] sm:text-base leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-amber-300 uppercase tracking-wider pt-2 border-b border-slate-800 pb-1">
                {formatInline(trimmed.replace('### ', ''))}
              </h4>
            );
          }

          if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            return (
              <h3 key={idx} className="text-base sm:text-lg font-black text-white pt-2 text-amber-400">
                {formatInline(trimmed.replace(/^#+\s*/, ''))}
              </h3>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2.5" />
                <span className="flex-1">{formatInline(trimmed.replace(/^[-*]\s*/, ''))}</span>
              </div>
            );
          }

          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^\d+/)?.[0] || '1';
            const listText = trimmed.replace(/^\d+\.\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-amber-300 font-mono text-xs font-bold shrink-0 mt-0.5">
                  {num}
                </span>
                <span className="flex-1">{formatInline(listText)}</span>
              </div>
            );
          }

          return <p key={idx}>{formatInline(line)}</p>;
        })}
      </div>
    );
  };

  // Starter Prompts
  const STARTER_PROMPTS = [
    {
      icon: '🏡',
      label: isHi ? 'जमीन पर अवैध कब्जा' : isTe ? 'భూమి అక్రమ ఆక్రమణ' : 'Land / Property Occupied',
      prompt: isHi
        ? 'मेरी जमीन पर किसी ने अवैध कब्जा कर लिया है। मेरे कानूनी अधिकार और त्वरित कदम क्या हैं?'
        : isTe
        ? 'నా భూమిని ఇతరులు అక్రమంగా ఆక్రమించి కబ్జా చేశారు. నా చట్టపరమైన హక్కులు ఏమిటి?'
        : 'My land was unlawfully occupied by encroachers. What are my immediate legal remedies under Indian law?'
    },
    {
      icon: '🚔',
      label: isHi ? 'पुलिस ने रास्ते में रोका' : isTe ? 'పోలీసులు రోడ్డుపై ఆపారు' : 'Police stopped me on road',
      prompt: isHi
        ? 'पुलिस ने मुझे सड़क पर रोका और थाने चलने को कहा। मुझे कारण नहीं पता।'
        : isTe
        ? 'పోలీసులు నన్ను రోడ్డుపై ఆపి స్టేషన్‌కు రమ్మన్నారు. ఎందుకో నాకు తెలియదు.'
        : 'Police stopped me on the road and asked me to come to the station. I don\'t know why.'
    },
    {
      icon: '📱',
      label: isHi ? 'फोन चेक करना चाहते हैं' : isTe ? 'ఫోన్ చూడాలనుకుంటున్నారు' : 'Police want my phone',
      prompt: isHi
        ? 'पुलिस अधिकारी मेरा फोन और व्हाट्सएप चैट देखना चाहता है। क्या वह ऐसा कर सकता है?'
        : isTe
        ? 'పోలీసులు నా మొబైల్ ఫోన్ చూడాలనుకుంటున్నారు. ఇది చట్టబద్ధమా?'
        : 'Can police force me to unlock my phone or inspect my WhatsApp without a warrant?'
    },
    {
      icon: '📄',
      label: isHi ? 'एफआईआर दर्ज नहीं की' : isTe ? 'ఎఫ్ఐఆర్ తిరస్కరించారు' : 'Police refused my FIR',
      prompt: isHi
        ? 'थाने में मेरी शिकायत की एफआईआर दर्ज करने से मना कर दिया गया। अब क्या करूँ?'
        : isTe
        ? 'పోలీసులు నా ఎఫ్ఐఆర్ నమోదు చేయడానికి నిరాకరించారు. నేనేం చేయాలి?'
        : 'The police station refused to register my FIR for a cognizable crime. What are my legal options under BNSS 2023?'
    },
    {
      icon: '🚗',
      label: isHi ? 'वाहन चेकिंग / चाबी छीनी' : isTe ? 'వాహన తనిఖీ / కీలు లాగారు' : 'Traffic Stop / Key snatching',
      prompt: isHi
        ? 'ट्रैफिक पुलिस ने मेरी गाड़ी की चाबी निकाल ली और नकद चालान मांग रहे हैं। मेरे अधिकार क्या हैं?'
        : isTe
        ? 'ట్రాఫిక్ పోలీసులు బైక్ కీలను లాక్కొని లంచం అడుగుతున్నారు. నా హక్కులు ఏమిటి?'
        : 'Traffic police snatched my vehicle keys and are demanding cash without formal memo. What are my rights under MV Act 130?'
    },
    {
      icon: '💰',
      label: isHi ? 'रिश्वत की मांग की' : isTe ? 'లంచం అడుగుతున్నారు' : 'Asked for a bribe',
      prompt: isHi
        ? 'पुलिस अधिकारी मुझसे पैसे / रिश्वत मांग रहा है। मुझे क्या कदम उठाने चाहिए?'
        : isTe
        ? 'పోలీస్ అధికారి లంచం డిమాండ్ చేస్తున్నారు. నేను ఏమి చేయాలి?'
        : 'A police officer is demanding a cash bribe from me. How do I report this lawfully?'
    },
    {
      icon: '👩',
      label: isHi ? 'महिलाओं की रात में गिरफ्तारी' : isTe ? 'మహిళల రాత్రి అరెస్టు' : 'Night arrest of women',
      prompt: isHi
        ? 'क्या पुलिस किसी महिला को रात में (सूर्यास्त के बाद) गिरफ्तार कर सकती है?'
        : isTe
        ? 'రాత్రి పూట మహిళలను పోలీసులు అరెస్ట్ చేయవచ్చా?'
        : 'Can police arrest a woman at night or after sunset under Indian law?'
    }
  ];

  return (
    <section className="relative w-full min-h-screen bg-[#070B14] text-slate-100 font-sans overflow-x-hidden flex flex-col">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-blue-900/10 to-transparent blur-3xl opacity-80" />
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* ── TOP NAVIGATION & COMBINED MODE SWITCHER ────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-[#070B14]/90 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Back to Home */}
        <button
          type="button"
          onClick={onNavigateBack ?? (() => { window.location.hash = ''; })}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors group cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">{isHi ? 'मुख्य पृष्ठ' : isTe ? 'హోమ్' : 'Back'}</span>
        </button>

        {/* Center: DUAL MODE SWITCHER (CHAT VS LIVE VOICE ROOM) */}
        <div className="flex bg-slate-900/90 rounded-2xl p-1 border border-slate-800 text-xs shadow-inner shrink-0">
          <button
            type="button"
            id="assistant-mode-chat-btn"
            onClick={() => {
              setAssistantMode('chat');
              VoiceLanguageService.stopSpeaking();
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              assistantMode === 'chat'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{isHi ? 'चैट स्ट्रीम' : isTe ? 'చాట్ స్ట్రీమ్' : 'Chat Stream'}</span>
            <span className="xs:hidden">{isHi ? 'चैट' : isTe ? 'చాట్' : 'Chat'}</span>
          </button>

          <button
            type="button"
            id="assistant-mode-voice-btn"
            onClick={() => {
              setAssistantMode('voice');
              VoiceLanguageService.stopSpeaking();
              setSpeakingId(null);
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              assistantMode === 'voice'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
            <span className="hidden xs:inline">{isHi ? 'लाइव वॉयस रूम' : isTe ? 'లైవ్ వాయిస్ రూమ్' : 'Live Voice Room'}</span>
            <span className="xs:hidden">{isHi ? 'वॉयस' : isTe ? 'వాయిస్' : 'Voice'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>
        </div>

        {/* Right: Controls (Language + Auto-Speak + AI Engine + Clear + SOS) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* AI Engine Settings */}
          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/40 transition-all cursor-pointer"
            title="Configure AI Engine / Gemini API"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium hidden sm:inline">{apiKeyInput ? 'Gemini Live' : 'AI Engine'}</span>
          </button>

          {/* Auto-Speak Toggle */}
          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              autoSpeak
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isHi ? 'उत्तर को स्वतः बोलकर सुनें' : isTe ? 'సమాధానాన్ని స్వయంచాలకంగా వినండి' : 'Automatically read AI legal answers aloud'}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="text-[11px]">{autoSpeak ? (isHi ? 'ऑटो-स्पीक: चालू' : isTe ? 'ఆటో-స్పీక్: ఆన్' : 'Auto-Speak: ON') : (isHi ? 'ऑटो-स्पीक: बंद' : isTe ? 'ఆటో-స్పీక్: ఆఫ్' : 'Auto-Speak: OFF')}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800 text-xs">
            {(['en', 'hi', 'te'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  onLanguageChange(lang);
                  setSelectedVoiceLang(lang);
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  language === lang
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'తె'}
              </button>
            ))}
          </div>

          {/* New Chat Button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearSession}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
              title={isHi ? 'बातचीत रीसेट करें' : isTe ? 'సంభాషణను రీసెట్ చేయండి' : 'Reset conversation'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          {/* SOS Dial */}
          <a
            href="tel:112"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-xs font-bold text-red-200 transition-all"
            title={isHi ? 'राष्ट्रीय आपातकाल 112 डायल करें' : isTe ? 'జాతీయ అత్యవసర నంబర్ 112 కు కాల్ చేయండి' : 'Dial 112 National Emergency'}
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">112</span>
          </a>
        </div>
      </header>

      {/* ── MODE 1: LIVE VOICE ROOM (FOCUSED CONVERSATIONAL VOICE CHAMBER) ──── */}
      {assistantMode === 'voice' && (
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col items-center justify-center animate-in fade-in duration-200">
          
          {/* Top Indian Language Speech Selector */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 mb-6">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>{isHi ? 'आवाज की भाषा:' : isTe ? 'వాయిస్ భాష:' : 'Voice Speech Dialect:'}</span>
            </div>
            
            <div className="flex gap-1.5">
              {[
                { code: 'auto', label: isHi ? 'ऑटो' : isTe ? 'ఆటో' : 'Auto' },
                { code: 'hi', label: 'हिंदी 🇮🇳' },
                { code: 'te', label: 'తెలుగు 🇮🇳' },
                { code: 'en', label: 'English 🇮🇳' }
              ].map((langItem) => (
                <button
                  key={langItem.code}
                  onClick={() => {
                    const code = langItem.code as SupportedVoiceLang;
                    setSelectedVoiceLang(code);
                    if (code !== 'auto') {
                      onLanguageChange(code as Language);
                    }
                  }}
                  className={`text-xs px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedVoiceLang === langItem.code
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {langItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Central Pulsing Voice Orb & Animated Microphone */}
          <div className="flex flex-col items-center justify-center my-6 relative select-none">
            
            {/* Outer Soundwave Rings */}
            {liveVoiceState === 'LISTENING' && (
              <>
                <div className="absolute w-64 h-64 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
                <div className="absolute w-80 h-80 rounded-full bg-emerald-500/10 animate-pulse pointer-events-none" />
              </>
            )}

            {liveVoiceState === 'SPEAKING' && (
              <>
                <div className="absolute w-64 h-64 rounded-full bg-amber-500/25 animate-ping pointer-events-none" />
                <div className="absolute w-80 h-80 rounded-full bg-amber-500/15 animate-pulse pointer-events-none" />
              </>
            )}

            {/* Main Interactive Mic Orb */}
            <button
              onClick={handleStartLiveVoiceListening}
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xl relative z-10 border-4 ${
                liveVoiceState === 'LISTENING'
                  ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 border-white text-slate-950 shadow-emerald-500/40 scale-105'
                  : liveVoiceState === 'SPEAKING'
                  ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 border-white text-slate-950 shadow-amber-500/40 scale-105'
                  : liveVoiceState === 'THINKING'
                  ? 'bg-gradient-to-tr from-sky-600 via-blue-500 to-indigo-600 border-white text-white shadow-blue-500/40'
                  : 'bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-900 hover:from-slate-800 hover:to-slate-800 border-slate-700 hover:border-amber-400/80 text-white shadow-slate-950/80 hover:scale-105 active:scale-95'
              }`}
            >
              {liveVoiceState === 'LISTENING' ? (
                <>
                  <Mic className="w-12 h-12 animate-pulse" />
                  <span className="text-xs font-black tracking-wide uppercase">
                    {isHi ? 'सुन रहे हैं...' : isTe ? 'వింటోంది...' : 'Listening...'}
                  </span>
                </>
              ) : liveVoiceState === 'SPEAKING' ? (
                <>
                  <Volume2 className="w-12 h-12 animate-bounce" />
                  <span className="text-xs font-black tracking-wide uppercase">
                    {isHi ? 'बोल रहे हैं...' : isTe ? 'మాట్లాడుతోంది...' : 'Speaking'}
                  </span>
                </>
              ) : liveVoiceState === 'THINKING' ? (
                <>
                  <AshokaChakra size={48} speed="fast" color="#FFFFFF" strokeWidth={2.5} />
                  <span className="text-xs font-black tracking-wide uppercase">
                    {isHi ? 'विश्लेषण हो रहा है...' : isTe ? 'విశ్లేషిస్తోంది...' : 'Analyzing...'}
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-12 h-12 text-amber-400" />
                  <span className="text-xs font-black tracking-wide uppercase text-slate-200">
                    {isHi ? 'बोलने के लिए टैप करें' : isTe ? 'మాట్లాడటానికి నొక్కండి' : 'Tap to Speak'}
                  </span>
                </>
              )}
            </button>

            <span className="text-xs text-slate-400 mt-4 text-center">
              {liveVoiceState === 'LISTENING'
                ? (isHi ? 'हिंदी, तेलुगु या अंग्रेजी में स्पष्ट बोलें... पूरा होने पर दोबारा टैप करें।' : isTe ? 'తెలుగు, హిందీ లేదా ఇంగ్లీషులో స్పష్టంగా మాట్లాడండి... ముగిశాక మళ్ళీ నొక్కండి.' : 'Speak clearly in Hindi, Telugu, or English... Tap again when finished.')
                : liveVoiceState === 'SPEAKING'
                ? (isHi ? 'कानूनी सलाह सुनाई जा रही है। रोकने के लिए बटन पर टैप करें।' : isTe ? 'చట్టపరమైన సలహా వినిపిస్తోంది. ఆపడానికి బటన్‌పై నొక్కండి.' : 'Playing spoken advice. Tap button anytime to pause.')
                : liveVoiceState === 'THINKING'
                ? (isHi ? 'BNSS 2023 और भारतीय कानूनों का विश्लेषण हो रहा है...' : isTe ? 'బీఎన్ఎస్ఎస్ 2023 మరియు రాజ్యాంగ చట్టాలను విశ్లేషిస్తోంది...' : 'Consulting BNSS 2023 & Constitutional Law...')
                : (isHi ? 'आवाज से कोई भी कानूनी समस्या पूछें। तुरंत बोलकर उत्तर पाएं।' : isTe ? 'వాయిస్‌తో ఏదైనా చట్టపరమైన సమస్యను అడగండి. చేతులు వాడకుండా సమాధానం వినండి.' : 'Tap to ask any legal situation with voice. Hands-free audio answer.')}
            </span>
          </div>

          {/* Live Transcript / Speech Display */}
          {liveVoiceTranscript && (
            <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 my-2 text-center shadow-xl">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest block mb-1">
                {isHi ? '🗣️ आपने क्या बोला:' : isTe ? '🗣️ మీరు మాట్లాడినది:' : '🗣️ What You Spoke:'}
              </span>
              <p className="text-base sm:text-lg font-bold text-white">
                "{liveVoiceTranscript}"
              </p>
            </div>
          )}

          {/* Latest Spoken Response Card */}
          {latestVoiceReply && (
            <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 my-3 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    ⚖️
                  </span>
                  <span className="text-xs font-black text-amber-300">
                    {isHi ? 'सत्यापित कानूनी सलाह' : isTe ? 'ధృవీకరించబడిన చట్టపరమైన సలహా' : 'Verified Legal Advice'}
                  </span>
                </div>

                <button
                  onClick={() => VoiceLanguageService.speakText(latestVoiceReply.text, language)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isHi ? 'ऑडियो दोबारा सुनें' : isTe ? 'ఆడియో మళ్ళీ వినండి' : 'Replay Audio'}</span>
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                {latestVoiceReply.text}
              </p>

              {/* Exact words to say to police */}
              {latestVoiceReply.sayThisFirst && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-xs">
                  <span className="font-bold text-red-300 block mb-1">
                    {isHi ? '🚨 अधिकारी से कहने हेतु सटीक शब्द:' : isTe ? '🚨 పోలీస్ అధికారితో చెప్పవలసిన ఖచ్చితమైన మాటలు:' : '🚨 EXACT WORDS TO SAY TO OFFICER:'}
                  </span>
                  <p className="text-yellow-200 font-semibold italic">"{latestVoiceReply.sayThisFirst}"</p>
                </div>
              )}

              {/* Action: Open in Chat Thread */}
              <button
                onClick={() => setAssistantMode('chat')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>
                  {isHi 
                    ? `चैट स्ट्रीम में पूर्ण कानूनी संदर्भ देखें (${messages.length} संदेश)` 
                    : isTe 
                    ? `చాట్ స్ట్రీమ్‌లో పూర్తి చట్టపరమైన వివరాలు చూడండి (${messages.length} సందేశాలు)` 
                    : `Open Full Legal Citations in Chat Stream (${messages.length} messages)`}
                </span>
              </button>
            </div>
          )}

          {/* Real-World Spoken Voice Scenario Prompts */}
          <div className="w-full max-w-2xl mt-4 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block text-center">
              {isHi ? 'या किसी सामान्य स्थिति पर टैप करें:' : isTe ? 'లేదా ఈ సాధారణ పరిస్థితిపై నొక్కండి:' : 'Or Tap Any Real-World Spoken Scenario:'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { 
                  label: isHi ? 'बाइक छुड़ाने के लिए रिश्वत मांगी' : isTe ? 'బైక్ విడిపించడానికి లంచం అడిగారు' : 'Police asked for bribe to release bike', 
                  query: isHi ? 'ट्रैफिक पुलिस ने मेरी बाइक रोकी और बिना रसीद 2000 रुपये रिश्वत मांग रहे हैं। मेरे अधिकार क्या हैं?' : isTe ? 'ట్రాఫిక్ పోలీసులు నా బైక్ ఆపి రశీదు లేకుండా 2000 లంచం అడుగుతున్నారు. నా హక్కులేంటి?' : 'Traffic police stopped my bike and are demanding a 2000 cash bribe without a receipt. What are my rights?' 
                },
                { 
                  label: isHi ? 'अधिकारी फोन अनलॉक करने का दबाव बना रहा है' : isTe ? 'మొబైల్ అన్‌లాక్ చేయాలని బలవంతం చేస్తున్నారు' : 'Officer demanding phone unlock', 
                  query: isHi ? 'क्या पुलिस अधिकारी बिना वारंट के मेरा फोन अनलॉक करवाकर व्हाट्सएप चैट देख सकता है?' : isTe ? 'వారెంట్ లేకుండా పోలీసులు నా మొబైల్ ఫోన్ అన్‌లాక్ చేసి వాట్సాప్ చాట్‌లు చూడవచ్చా?' : 'Can a police officer forcibly compel me to unlock my phone and inspect my WhatsApp chats without a warrant?' 
                },
                { 
                  label: isHi ? 'पुलिस ने मेरी एफआईआर दर्ज नहीं की' : isTe ? 'పోలీసులు నా ఎఫ్ఐఆర్ నమోదు చేయలేదు' : 'Police refused to file my FIR', 
                  query: isHi ? 'थाना मेरे चोरी के फोन की एफआईआर दर्ज करने से मना कर रहा है। BNSS में जीरो एफआईआर कैसे दर्ज करें?' : isTe ? 'పోలీస్ స్టేషన్‌లో నా ఫోన్ చోరీపై ఎఫ్ఐఆర్ రాయడం లేదు. జీరో ఎఫ్ఐఆర్ ఎలా చేయాలి?' : 'The local police station is refusing to register an FIR for my stolen phone. How to file Zero FIR under BNSS?' 
                },
                { 
                  label: isHi ? 'रात में महिला की गिरफ्तारी निषेध' : isTe ? 'రాత్రి పూట మహిళలను అరెస్ట్ చేయడం నిషేధం' : 'Women night arrest prohibited', 
                  query: isHi ? 'क्या किसी महिला नागरिक को शाम 6 बजे के बाद बिना मजिस्ट्रेट आदेश के गिरफ्तार किया जा सकता है?' : isTe ? 'రాత్రి 6 గంటల సూర్యాస్తమయం తర్వాత మహిళలను మేజిస్ట్రేట్ అనుమతి లేకుండా అరెస్ట్ చేయవచ్చా?' : 'Can a female citizen be arrested by male police officers after 6 PM sunset without a magistrate order?' 
                }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleVoiceQuerySubmit(item.query)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate pr-2">🗣️ {item.label}</span>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── MODE 2: CHAT STREAM (FULL CONVERSATIONAL STREAM + INPUT BAR) ─────── */}
      {assistantMode === 'chat' && (
        <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
            
            {/* Main Chat Interface Column (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col min-h-[75vh] w-full">
              
              {/* STATE 1: WELCOME SCREEN (When no messages yet) */}
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col justify-center items-center text-center py-6 sm:py-12 max-w-3xl mx-auto space-y-6">
                  
                  {/* Glowing Emblem */}
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400/20 via-orange-500/20 to-blue-600/20 border-2 border-amber-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.25)]">
                      <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 stroke-[2.2]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#070B14]" />
                    </span>
                  </div>

                  {/* Main Heading & Feature ID */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                      <span>{isTe ? 'ఫీచర్ 01' : isHi ? 'फ़ीचर 01' : 'FEATURE 01'}</span>
                      <span>•</span>
                      <span>{isTe ? 'AI & వాయిస్ సహాయకుడు' : isHi ? 'AI एवं वॉयस सहायक' : 'AI & VOICE LEGAL ASSISTANT'}</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                      {isHi 
                        ? 'बोलकर या लिखकर अपनी समस्या बताएं। न्याय समझता है।' 
                        : isTe 
                        ? 'మాట్లాడి లేదా టైప్ చేసి వివరించండి. న్యాయ పరిస్థితిని అర్థం చేసుకుంటుంది.' 
                        : 'Talk with voice or type naturally. Nyaya understands the situation.'}
                    </h1>

                    <p className="text-xs sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                      {isHi
                        ? 'निजी, गोपनीय और आधिकारिक BNSS 2023 कानूनी विश्लेषण। नीचे किसी भी सामान्य स्थिति पर क्लिक करें या अपना प्रश्न बोलें/लिखें।'
                        : isTe
                        ? 'వ్యక్తిగత మరియు అధికారిక BNSS 2023 చట్టపరమైన విశ్లేషణ. కింద ఉన్న ప్రశ్నను ఎంచుకోండి లేదా మాట్లాడండి.'
                        : 'Private, confidential, on-device guidance verified against the Bharatiya Nagarik Suraksha Sanhita (BNSS 2023). Pick any prompt or speak with your mic.'}
                    </p>
                  </div>

                  {/* Starter Prompt Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 w-full text-left pt-2">
                    {STARTER_PROMPTS.map((starter, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(starter.prompt)}
                        className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-left transition-all duration-200 group shadow-lg flex flex-col justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{starter.icon}</span>
                          <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                            {starter.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {starter.prompt}
                        </span>
                      </button>
                    ))}
                  </div>

                </div>
              )}

              {/* STATE 2: ACTIVE CONVERSATION STREAM */}
              {messages.length > 0 && (
                <div className="flex-1 space-y-6 pb-6">
                  {messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    const isExpanded = !!expandedDossierIds[msg.id];
                    const isSpeaking = speakingId === msg.id;
                    const displayContent = (!isUser && msg.allTranslations && msg.allTranslations[language]) 
                      ? msg.allTranslations[language] 
                      : msg.content;
                    const displaySuggestions = (!isUser && msg.allSuggestions && msg.allSuggestions[language])
                      ? msg.allSuggestions[language]
                      : msg.suggestions;

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                      >
                        {/* Assistant Avatar */}
                        {!isUser && (
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-lg shadow-amber-500/20 mt-1">
                            <Scale className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                          </div>
                        )}

                        {/* Message Bubble Container */}
                        <div className={`max-w-[90%] sm:max-w-[82%] space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                          
                          {/* Bubble Body */}
                          <div
                            className={`p-4 sm:p-5 rounded-3xl text-sm sm:text-base leading-relaxed shadow-xl ${
                              isUser
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-medium rounded-tr-xs'
                                : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-xs backdrop-blur-md'
                            }`}
                          >
                            {isUser ? (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                              renderFormattedContent(displayContent)
                            )}
                          </div>

                          {/* Quick Follow-up Suggestions */}
                          {!isUser && displaySuggestions && displaySuggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {displaySuggestions.map((sug, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => handleSendMessage(sug)}
                                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <span>💡</span>
                                  <span>{sug}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Assistant Action Bar & Tools */}
                          {!isUser && (
                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-400">
                              
                              {/* Read Aloud Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleSpeech(msg.id, displayContent)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                                  isSpeaking 
                                    ? 'bg-amber-500 text-slate-950 font-bold' 
                                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white'
                                }`}
                              >
                                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                                <span>
                                  {isSpeaking 
                                    ? (isHi ? 'ऑडियो रोकें' : isTe ? 'ఆడియో ఆపండి' : 'Stop Audio') 
                                    : (isHi ? 'बोलकर सुनें' : isTe ? 'వినండి' : 'Listen Aloud')}
                                </span>
                              </button>

                              {/* Copy Message */}
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(msg.id, displayContent)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                              >
                                {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>
                                  {copiedId === msg.id 
                                    ? (isHi ? 'कॉपी हो गया' : isTe ? 'కాపీ చేయబడింది' : 'Copied') 
                                    : (isHi ? 'सलाह कॉपी करें' : isTe ? 'సలహాను కాపీ చేయండి' : 'Copy Advice')}
                                </span>
                              </button>

                              {/* Dossier Toggle (if structured analysis exists) */}
                              {msg.structuredResponse && (
                                <button
                                  type="button"
                                  onClick={() => toggleDossier(msg.id)}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 font-semibold transition-colors cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                                  <span>
                                    {isExpanded 
                                      ? (isHi ? 'विस्तृत डोजियर छिपाएं' : isTe ? 'వివరణాత్మక పత్రాన్ని దాచండి' : 'Hide Deep Dossier') 
                                      : (isHi ? 'कानूनी डोजियर देखें' : isTe ? 'చట్టపరమైన పత్రం చూడండి' : 'View Legal Dossier')}
                                  </span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          )}

                          {/* Expandable Deep Structured Dossier */}
                          {!isUser && msg.structuredResponse && isExpanded && (
                            <div className="pt-2 animate-in fade-in zoom-in-98 duration-200">
                              <AIResponse
                                data={msg.structuredResponse}
                                language={language}
                                onShowDossier={() => {}}
                                onNavigateToLawyerConnection={onNavigateToLawyerConnection}
                              />
                            </div>
                          )}

                        </div>

                        {/* User Avatar */}
                        {isUser && (
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                            <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Thinking Bubble */}
                  {isThinking && (
                    <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in duration-150">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                        <Scale className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-amber-300 flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>
                          {isTe ? 'బీఎన్ఎస్ఎస్ 2023 చట్టాలను విశ్లేషిస్తోంది...' : isHi ? 'BNSS 2023 और भारतीय कानूनों का विश्लेषण हो रहा है...' : 'Synthesizing verified BNSS 2023 legal advice...'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={conversationEndRef} />
                </div>
              )}

              {/* ── STICKY BOTTOM CHAT INPUT BAR ── */}
              <div className="sticky bottom-0 z-30 pt-3 pb-4 bg-gradient-to-t from-[#070B14] via-[#070B14]/95 to-transparent">
                
                {/* Voice Dictation Active Waveform Banner */}
                {isListening && (
                  <div className="mb-2 p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center justify-between animate-pulse text-xs text-red-200">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-red-400 animate-bounce" />
                      <span className="font-bold">
                        {isHi 
                          ? 'माइक्रोफ़ोन चालू है... अपनी भाषा में स्थिति बताएं।' 
                          : isTe 
                          ? 'మైక్రోఫోన్ ఆన్‌లో ఉంది... మీ సహజ భాషలో చెప్పండి.' 
                          : 'Listening now... Speak your situation in your natural language.'}
                      </span>
                    </div>
                    <button
                      onClick={handleToggleVoiceInput}
                      className="px-2 py-0.5 rounded-lg bg-red-600 text-white font-black cursor-pointer"
                    >
                      {isHi ? 'समाप्त करें' : isTe ? 'పూర్తయింది' : 'Done Speaking'}
                    </button>
                  </div>
                )}

                {/* Chat Input Container */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }}
                  className="relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-amber-500/60 shadow-2xl backdrop-blur-xl transition-all"
                >
                  <div className="flex items-end p-2 sm:p-2.5 gap-2">
                    
                    {/* Voice dictation mic button */}
                    <button
                      type="button"
                      id="chat-mic-dictation-btn"
                      onClick={handleToggleVoiceInput}
                      className={`p-2.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                      }`}
                      title={isHi ? 'वॉयस इनपुट: बोलकर बताएं' : isTe ? 'వాయిస్ ఇన్‌పుట్: మాట్లాడండి' : 'Voice input: Speak your situation'}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    {/* Expanding Textarea */}
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(inputText);
                        }
                      }}
                      placeholder={
                        isHi
                          ? 'न्याय से पूछें — स्थिति बताएं या कानूनी सवाल लिखें...'
                          : isTe
                          ? 'న్యాయను అడగండి — పరిస్థితిని లేదా ప్రశ్నను టైప్ చేయండి...'
                          : 'Ask Nyaya — type or use mic to describe any legal situation…'
                      }
                      className="flex-1 bg-transparent border-0 outline-hidden resize-none text-sm sm:text-base text-slate-100 placeholder-slate-500 py-1.5 px-2 max-h-40 min-h-[40px]"
                      disabled={isThinking}
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isThinking}
                      className={`p-2.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                        inputText.trim() && !isThinking
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md hover:scale-105 active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                      }`}
                      title={isHi ? 'संदेश भेजें' : isTe ? 'సందేశం పంపండి' : 'Send message'}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Subtext Disclaimer */}
                  <div className="px-4 pb-2 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                    <span>
                      {isTe 
                        ? '🔒 100% గోప్యతా సెషన్ · BNSS 2023 & భారత రాజ్యాంగం' 
                        : isHi 
                        ? '🔒 100% गोपनीय सत्र · BNSS 2023 और भारतीय संविधान' 
                        : '🔒 100% Client-side session · BNSS 2023 & Constitution of India'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAssistantMode('voice')}
                      className="text-emerald-400 hover:text-emerald-300 font-bold hidden sm:inline cursor-pointer"
                    >
                      {isHi ? 'लाइव वॉयस रूम खोलें 🎙️' : isTe ? 'లైవ్ వాయిస్ రూమ్‌కి మారండి 🎙️' : 'Switch to Live Voice Room 🎙️'}
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Right Side Column: Live Telemetry & Rules (4 Cols) */}
            <div className="hidden lg:block lg:col-span-4 space-y-5 sticky top-20">
              
              {/* Voice Room Quick Launch Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 border border-emerald-500/30 text-xs space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span className="font-black text-white">
                      {isHi ? 'लाइव वॉयस रूम' : isTe ? 'లైవ్ వాయిస్ రూమ్' : 'Live Voice Room'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold">
                    {isHi ? 'नया' : isTe ? 'కొత్తది' : 'NEW'}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {isHi 
                    ? 'टाइप करने के बजाय सीधे बोलना चाहते हैं? प्राकृतिक बातचीत के लिए लाइव वॉयस रूम में प्रवेश करें।' 
                    : isTe 
                    ? 'టైప్ చేయకుండా నేరుగా మాట్లాడాలనుకుంటున్నారా? సహజమైన సంభాషణ కోసం లైవ్ వాయిస్ రూమ్‌కి వెళ్లండి.' 
                    : 'Prefer speaking naturally without typing? Switch to Live Voice Room for natural hands-free audio conversation.'}
                </p>
                <button
                  type="button"
                  onClick={() => setAssistantMode('voice')}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>
                    {isHi ? 'वॉयस रूम में जाएं' : isTe ? 'వాయిస్ రూమ్‌లోకి వెళ్లండి' : 'Enter Voice Room Now'}
                  </span>
                </button>
              </div>

              {/* Statutory Telemetry Panel */}
              <IntelligenceTelemetry
                currentResponse={currentResponseData}
                language={language}
              />

              {/* Quick Non-Confrontational Rules Card */}
              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 text-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider font-mono">
                  <Compass className="w-4 h-4" />
                  <span>{isTe ? 'గుర్తుంచుకోవలసిన 3 ముఖ్య నియమాలు' : isHi ? '3 मुख्य नियम याद रखें' : '3 RULES TO REMEMBER'}</span>
                </div>
                
                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-400">1.</span>
                    <span>
                      {isHi 
                        ? <><strong>शांत और विनम्र रहें:</strong> कभी भी आवाज न उठाएं और न ही अधिकारी का शारीरिक विरोध करें।</> 
                        : isTe 
                        ? <><strong>ప్రశాంతంగా & మర్యాదగా ఉండండి:</strong> గట్టిగా అరవకండి లేదా అధికారితో వాదనకు దిగకండి.</> 
                        : <><strong>Remain calm & polite:</strong> Never raise your voice or physically resist an officer.</>}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-400">2.</span>
                    <span>
                      {isHi 
                        ? <><strong>यह पहला सवाल पूछें:</strong> <em>"क्या मैं जाने के लिए स्वतंत्र हूँ, या मुझे हिरासत में लिया जा रहा है?"</em></> 
                        : isTe 
                        ? <><strong>మొదటి ప్రశ్న అడగండి:</strong> <em>"నేను వెళ్లవచ్చా, లేక నన్ను అదుపులోకి తీసుకుంటున్నారా?"</em></> 
                        : <><strong>Ask Step 1:</strong> <em>"Am I free to go, or am I being detained?"</em></>}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-400">3.</span>
                    <span>
                      {isHi 
                        ? <><strong>लिखित मेमो मांगें:</strong> BNSS धारा 47 के तहत गिरफ्तारी या जब्ती का लिखित आधार अनिवार्य है।</> 
                        : isTe 
                        ? <><strong>లిఖితపూర్వక మెమో అడగండి:</strong> BNSS సెక్షన్ 47 కింద అరెస్టు లేదా జప్తుకు కారణాలు రాతపూర్వకంగా ఇవ్వడం చట్టబద్ధమైన హక్కు.</> 
                        : <><strong>Demand written memo:</strong> Under BNSS Section 47, written grounds of arrest are legally mandatory.</>}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* AI Engine & Gemini Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Legal Engine</h3>
                  <p className="text-xs text-slate-400">Dual-Mode: Cloud LLM + Local Statutory Engine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-200 font-semibold">
                  <span>Engine Architecture</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active & Resilient
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Queries are processed first by Google Gemini for conversational depth and nuance, backed immediately by an offline verified Indian Statutory Engine (BNSS 2023, BNS, SRA 1963, DV Act, NI Act, CPA 2019).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-200 font-semibold">
                  Custom Gemini API Key <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Use your own Google AI Studio key for direct streaming quota, or leave blank to use the backend default.
                </p>
                <div className="relative mt-2">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 text-xs text-white placeholder-slate-600 outline-none pr-10 font-mono"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {apiKeySaved && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Key saved securely to your browser local storage!</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Save Configuration
                </button>
                {apiKeyInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setApiKeyInput('');
                      localStorage.removeItem('nyaya_gemini_api_key');
                      setApiKeySaved(true);
                      setTimeout(() => setApiKeySaved(false), 2000);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
