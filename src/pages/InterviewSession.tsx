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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null);
  const emptySilenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const hasSpokenRef = useRef(false);

  // 1. Initialize Questions
  useEffect(() => {
    if (!interviewType) {
      navigate('/interview');
      return;
    }
    const pool = interviewQuestions[interviewType];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
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
  }, [questions]);
  
  const triggerNextQuestion = useCallback((index: number) => {
    if (index >= questions.length) {
      endInterview();
      return;
    }
    setCurrentQuestionIndex(index);
    setSessionPhase('speakingQuestion');
    
    let textToSpeak = "";
    if (index > 0) {
      const reaction = INTERVIEWER_REACTIONS[Math.floor(Math.random() * INTERVIEWER_REACTIONS.length)];
      textToSpeak = `${reaction} Next question. ${questions[index]}`;
    } else {
      textToSpeak = `First question. ${questions[index]}`;
    }
    
    setAiText(questions[index]); // Screen displays just the question
    
    speakText(textToSpeak, () => {
      startListening();
    });
  }, [questions]);

  // SpeechSynthesis Helper
  const speakText = (text: string, onEnd: () => void) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Microsoft')) || englishVoices[0];
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      onEnd();
    };
    
    utterance.onerror = () => {
      console.warn("SpeechSynthesis error, continuing flow anyway");
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
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (e: any) => {
              let currentStr = "";
              for (let i = e.resultIndex; i < e.results.length; ++i) {
                  currentStr += e.results[i][0].transcript;
              }
              setLiveTranscript(prev => prev + " " + currentStr);
          };
          try {
             recognition.start();
             recognitionRef.current = recognition;
          } catch(e) { }
      }
      
      monitorSilence();
      
      // Edge case: complete silence for 20s
      emptySilenceTimerRef.current = setTimeout(() => {
        if (!hasSpokenRef.current) {
          stopListening(true);
        }
      }, 20000);

      // Hard stop at 90s
      maxTimerRef.current = setTimeout(() => {
        stopListening(false, true);
      }, 90000);
      
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

      // Threshold for speech vs silence
      if (average > 10) { 
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

  const stopListening = (emptySilenceEdgeCase = false, durationMaxEdgeCase = false) => {
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

    if (emptySilenceEdgeCase) {
      // 20s without speaking edge case handling
      window.speechSynthesis.cancel();
      setAiText("No problem. Let's move to the next question.");
      speakText("No problem. Let's move to the next question.", () => {
         // Proceed naturally in handleRecordingStop since the stream stopped
      });
    } else if (durationMaxEdgeCase) {
      window.speechSynthesis.cancel();
      setAiText("Thank you for the explanation. Let's continue.");
      speakText("Thank you for the explanation. Let's continue.", () => {});
    }
  };

  const handleRecordingStop = async () => {
    setSessionPhase('processing');
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'interview_answer.webm');

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${BASE_URL}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Processing failed");

      const data = await response.json();
      const returnedText = data.transcript?.trim() || "(No speech detected)";
      
      setTranscripts(prev => {
        const next = [...prev, returnedText];
        setTimeout(() => triggerNextQuestion(next.length), 500);
        return next;
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to transcribe audio. Moving to next question safely.",
        variant: "destructive"
      });
      setTranscripts(prev => {
         const next = [...prev, "(Transcription failed)"];
         setTimeout(() => triggerNextQuestion(next.length), 500);
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
      if (sessionPhase === 'evaluating' && questions.length > 0 && transcripts.length === questions.length) {
          let hasFiredEvaluation = false;
          
          const doSubmit = async () => {
            if (hasFiredEvaluation) return;
            hasFiredEvaluation = true;
            try {
              const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
              const response = await fetch(`${BASE_URL}/api/evaluate-interview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  interview_type: interviewType,
                  questions: questions,
                  transcripts: transcripts
                }),
              });

              if (!response.ok) throw new Error("Evaluation failed");
              const evalData = await response.json();
              
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
              console.error(error);
              toast({
                title: "Evaluation Failed",
                description: "An error occurred while evaluating your interview.",
                variant: "destructive"
              });
            }
          };
          doSubmit();
      }
  }, [sessionPhase, transcripts, questions, interviewType, navigate, toast]);

  if (questions.length === 0) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title={`${interviewType === 'hr' ? 'HR' : 'Technical'} Interview`} showBack={false} />
      
      <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full flex flex-col items-center justify-center">
        
        {/* AI Interviewer Avatar Area */}
        <div className="text-center mb-12 animate-fade-in flex flex-col items-center">
           <div className={`w-36 h-36 rounded-full flex items-center justify-center mb-8 shadow-2xl transition-all duration-700
             ${sessionPhase === 'speakingQuestion' || sessionPhase === 'greeting' ? 'bg-primary/20 scale-110 shadow-primary/40 ring-4 ring-primary/30' : 'bg-muted border border-border'}
           `}>
             <UserIcon className={`w-16 h-16 transition-colors duration-700 ${sessionPhase === 'speakingQuestion' || sessionPhase === 'greeting' ? 'text-primary' : 'text-muted-foreground'}`} />
           </div>
           
           <h2 className="text-2xl md:text-3xl font-medium text-foreground max-w-2xl leading-relaxed min-h-[5rem]">
             {aiText}
           </h2>
        </div>

        {/* Listening / Processing Indicators */}
        <div className="min-h-[6rem] flex flex-col items-center justify-center">
          {sessionPhase === 'listening' && (
            <div className="flex flex-col items-center animate-fade-in w-full max-w-lg">
              <div className="flex gap-2 mb-4">
                <span className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <span className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <span className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
              </div>
              <p className="text-muted-foreground font-medium text-lg mb-2">Listening...</p>
              {liveTranscript && (
                <div className="bg-muted/30 p-4 rounded-lg border border-border mt-3 text-sm italic text-muted-foreground w-full text-center">
                   "{liveTranscript}"
                </div>
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


