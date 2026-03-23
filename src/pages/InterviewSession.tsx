import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Loader2, User as UserIcon } from 'lucide-react';
import { interviewQuestions } from '@/data/questions/interviewQuestions';
import { useToast } from '@/hooks/use-toast';

const INTERVIEWER_REACTIONS = [
  "Alright.",
  "Interesting.",
  "Thank you for explaining that.",
  "Good.",
  "I see.",
  "Got it."
];

export default function InterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const interviewType = location.state?.type as 'hr' | 'technical';
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  
  const [sessionPhase, setSessionPhase] = useState<'greeting' | 'speakingQuestion' | 'listening' | 'processing' | 'evaluating'>('greeting');
  const [aiText, setAiText] = useState("");
  const [showSkipButton, setShowSkipButton] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null);
  const emptySilenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const edgeCaseRef = useRef<'empty' | 'max' | 'skip' | null>(null);
  const skipButtonTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hasSpokenRef = useRef(false);
  const currentQuestionIndexRef = useRef(0);


  // 1. Initialize Questions
  useEffect(() => {
    if (!interviewType) {
      navigate('/interview');
      return;
    }
    const pool = interviewQuestions[interviewType];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    setQuestions(selected);
    setTranscripts(new Array(selected.length).fill(""));
  }, [interviewType, navigate]);

  // 2. Start Session Flow
  useEffect(() => {
    if (questions.length === 0) return;

    if (sessionPhase === 'greeting') {
      const greeting = `Hello. I am your AI ${interviewType === 'hr' ? 'HR' : 'Technical'} interviewer today. Let's begin the interview.`;
      setAiText(greeting);
      speakText(greeting, () => {
        setTimeout(() => triggerNextQuestion(0), 1000);
      });
    }
  }, [questions, interviewType, sessionPhase]);

  
  const triggerNextQuestion = (index: number, edgeCase: 'empty' | 'max' | 'skip' | null = null) => {
    if (index >= questions.length) {
      endInterview();
      return;
    }
    setCurrentQuestionIndex(index);
    currentQuestionIndexRef.current = index;
    setSessionPhase('speakingQuestion');

    
    let textToSpeak = "";
    if (edgeCase === 'empty') {
      textToSpeak = `No problem. Let's move to the next question. ${questions[index]}`;
    } else if (edgeCase === 'max') {
      textToSpeak = `Thank you for the explanation. Let's continue. ${questions[index]}`;
    } else if (edgeCase === 'skip') {
      textToSpeak = `Alright. Let's move to the next question. ${questions[index]}`;
    } else if (index > 0) {
      const reaction = INTERVIEWER_REACTIONS[Math.floor(Math.random() * INTERVIEWER_REACTIONS.length)];
      textToSpeak = `${reaction} ${questions[index]}`;
    } else {
      textToSpeak = `First question. ${questions[index]}`;
    }
    
    setAiText(questions[index]); // Screen displays just the question
    
    speakText(textToSpeak, () => {
      startListening();
    });
  };


  // SpeechSynthesis Helper
  const speakText = (text: string, onEnd: () => void) => {
    console.log("DEBUG: Speaking:", text);
    window.speechSynthesis.cancel();
    
    // Safety fallback: if speech doesn't end in 15 seconds, move on anyway
    const fallbackTimeout = setTimeout(() => {
        console.warn("DEBUG: speakText fallback triggered");
        onEnd();
    }, 15000);

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Microsoft')) || englishVoices[0];
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      clearTimeout(fallbackTimeout);
      onEnd();
    };
    
    utterance.onerror = (e) => {
      console.warn("DEBUG: SpeechSynthesis error:", e);
      clearTimeout(fallbackTimeout);
      onEnd(); 
    };

    window.speechSynthesis.speak(utterance);
  };


  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      hasSpokenRef.current = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;
      
      // Setup Silence Detection
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyser.fftSize = 512;
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      mediaRecorder.start();
      setSessionPhase('listening');
      setLiveTranscript("");
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.lang = 'en-US';
          recognition.continuous = true;
          recognition.interimResults = true;
          
          recognition.onresult = (e: any) => {
              let final = "";
              let interim = "";
              for (let i = 0; i < e.results.length; ++i) {
                  if (e.results[i].isFinal) {
                    final += e.results[i][0].transcript + " ";
                  } else {
                    interim += e.results[i][0].transcript;
                  }
              }
              setLiveTranscript((final + interim).trim());
          };
          try {
             recognition.start();
             recognitionRef.current = recognition;
             console.log("DEBUG: SpeechRecognition started");
          } catch(e) { 
             console.error("DEBUG: SpeechRecognition start failed", e);
          }
      }

      
      monitorSilence();
      
      // Edge case: complete silence for 20s
      emptySilenceTimerRef.current = setTimeout(() => {
        if (!hasSpokenRef.current) {
          stopListening('empty');
        }
      }, 20000);

      // Hard stop at 90s
      maxTimerRef.current = setTimeout(() => {
        stopListening('max');
      }, 90000);
      
      // Show skip button after 15s
      skipButtonTimerRef.current = setTimeout(() => {
        setShowSkipButton(true);
      }, 15000);
      
    } catch (err) {
      console.error("Error accessing mic:", err);
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access to continue.",
        variant: "destructive",
      });
    }
  };

  const monitorSilence = () => {
    if (!analyserRef.current || !audioContextRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkAudioLevel = () => {
      if (!analyserRef.current) return; // Stopped
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((acc, val) => acc + val, 0);
      const average = sum / bufferLength;

      // Threshold for speech vs silence. Increased to 20 to ignore background noise.
      if (average > 20) { 

        // User is speaking
        if (!hasSpokenRef.current) {
           hasSpokenRef.current = true;
           if (emptySilenceTimerRef.current) clearTimeout(emptySilenceTimerRef.current);
        }
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else {
        // User is silent
        if (hasSpokenRef.current && !silenceTimerRef.current) {
          // If they have started speaking and now stopped, wait 2 seconds to end
          silenceTimerRef.current = setTimeout(() => {
             // Let it record a short breather and then stop naturally
             if (hasSpokenRef.current) {
                 stopListening();
             }
          }, 2000);
        }
      }

      if (mediaRecorderRef.current?.state === 'recording') {
        requestAnimationFrame(checkAudioLevel);
      }
    };
    
    checkAudioLevel();
  };

  const stopListening = (edgeCase: 'empty' | 'max' | 'skip' | null = null) => {
    setShowSkipButton(false);
    if (skipButtonTimerRef.current) clearTimeout(skipButtonTimerRef.current);
    edgeCaseRef.current = edgeCase;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
       clearTimeout(silenceTimerRef.current);
       silenceTimerRef.current = null;
    }
    if (emptySilenceTimerRef.current) clearTimeout(emptySilenceTimerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const handleRecordingStop = async () => {
    const capturedIndex = currentQuestionIndexRef.current;
    const capturedEdgeCase = edgeCaseRef.current;
    edgeCaseRef.current = null;
    
    console.log(`DEBUG: Recording stopped for Q${capturedIndex + 1}. Transitioning to Q${capturedIndex + 2}...`);


    // Move to next question IMMEDIATELY (with a tiny delay for UX)
    setSessionPhase('speakingQuestion');
    setTimeout(() => {
      triggerNextQuestion(capturedIndex + 1, capturedEdgeCase);
    }, 1000);


    // Process transcription in the background
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'interview_answer.webm');

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${BASE_URL}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Processing failed");

      const data = await response.json();
      const returnedText = data.text?.trim() || "(No speech detected)";
      
      setTranscripts(prev => {
        const next = [...prev];
        next[capturedIndex] = returnedText;
        return next;
      });

    } catch (error) {
      console.error(error);
      setTranscripts(prev => {
         const next = [...prev];
         next[capturedIndex] = "(Transcription failed)";
         return next;
      });
    }
  };


  const endInterview = () => {
    setSessionPhase('evaluating');
    const endMsg = "Thank you for completing the interview. Please wait while we evaluate your responses.";
    setAiText(endMsg);
    speakText(endMsg, () => {
      // Proceed loosely
    });
  };

  useEffect(() => {
      const allTranscribed = questions.length > 0 && 
                           transcripts.length === questions.length && 
                           transcripts.every(t => t !== "");

      if (sessionPhase === 'evaluating' && allTranscribed) {
          let hasFiredEvaluation = false;

          
          const doSubmit = async () => {
            if (hasFiredEvaluation) return;
            hasFiredEvaluation = true;

            const fallbackEvaluation = {
              overallScore: 0,
              questions: questions.map((q, i) => ({
                question: q,
                answer: transcripts[i] || "(Skipped)",
                score: 0,
                communication: 0,
                technical: 0,
                feedback: "No valid answer provided.",
                status: "TRANSCRIPTION_ERROR"
              })),
              summary: "Interview could not be evaluated because of an internal processing error."
            };

            try {
              const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 12000);

              const response = await fetch(`${BASE_URL}/api/evaluate-interview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  interview_type: interviewType,
                  questions: questions,
                  transcripts: transcripts
                }),
                signal: controller.signal
              });
              clearTimeout(timeoutId);

              if (!response.ok) throw new Error("Evaluation failed");
              const evalData = await response.json();

              if (
                typeof evalData?.overallScore !== "number" ||
                !Array.isArray(evalData?.questions) ||
                typeof evalData?.summary !== "string"
              ) {
                throw new Error("Invalid evaluation response shape");
              }

              navigate('/interview/result', { 
                state: { 
                  session: {
                    type: interviewType,
                    questions,
                    transcripts,
                    evaluation: evalData
                  }
                }
              });
            } catch (error) {
              console.error("Evaluation error or timeout:", error);
              navigate('/interview/result', { 
                state: { 
                  session: {
                    type: interviewType,
                    questions,
                    transcripts,
                    evaluation: fallbackEvaluation
                  }
                }
              });
            }
          };
          doSubmit();
      }
  }, [sessionPhase, transcripts, questions, interviewType, navigate, toast]);

  if (questions.length === 0) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title={`${interviewType === 'hr' ? 'HR' : 'Technical'} Interview`} showBack={true} />

      
      <main className="flex-1 px-3 sm:px-4 py-4 sm:py-8 max-w-3xl mx-auto w-full flex flex-col items-center justify-center">
        
        {/* AI Interviewer Avatar Area */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in flex flex-col items-center">
           <div className={`w-24 sm:w-32 md:w-36 h-24 sm:h-32 md:h-36 rounded-full flex items-center justify-center mb-4 sm:mb-8 shadow-2xl transition-all duration-700
             ${sessionPhase === 'speakingQuestion' || sessionPhase === 'greeting' ? 'bg-primary/20 scale-110 shadow-primary/40 ring-4 ring-primary/30' : 'bg-muted border border-border'}  `}>
             <UserIcon className={`w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 transition-colors duration-700 ${sessionPhase === 'speakingQuestion' || sessionPhase === 'greeting' ? 'text-primary' : 'text-muted-foreground'}`} />
           </div>
           
           <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-foreground max-w-2xl leading-relaxed min-h-[3rem] sm:min-h-[4rem] md:min-h-[5rem]">
             {aiText}
           </h2>
        </div>

        {/* Listening / Processing Indicators */}
        <div className="min-h-[4rem] sm:min-h-[5rem] md:min-h-[6rem] flex flex-col items-center justify-center">
          {sessionPhase === 'listening' && (
            <div className="flex flex-col items-center animate-fade-in w-full max-w-lg">
              <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
              </div>
              <p className="text-muted-foreground font-medium text-sm sm:text-base md:text-lg mb-2">Listening...</p>
              {liveTranscript && (
                <div className="bg-muted/30 p-2.5 sm:p-3 md:p-4 rounded-lg border border-border mt-2 sm:mt-3 text-xs sm:text-sm italic text-muted-foreground w-full text-center">
                   "{liveTranscript}"
                </div>
              )}
              {showSkipButton && (
                <button 
                  onClick={() => stopListening('skip')}
                  className="mt-6 px-6 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 font-medium transition-colors shadow-sm"
                >
                  Skip / Next Question
                </button>
              )}
            </div>
          )}
          
          {sessionPhase === 'processing' && (
            <div className="flex flex-col items-center text-muted-foreground animate-fade-in">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
            </div>
          )}

          {sessionPhase === 'evaluating' && (
            <div className="flex flex-col items-center animate-fade-in">
               <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
               <p className="text-primary font-medium text-lg">Generating detailed feedback...</p>
            </div>
          )}
        </div>
        
      </main>
    </div>
  );
}


