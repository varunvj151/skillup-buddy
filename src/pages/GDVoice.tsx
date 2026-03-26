import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, Square, Timer, AlertCircle, Loader2 } from 'lucide-react';
import { gdTopics } from '@/data/gdTopics';
import { useToast } from '@/components/ui/use-toast';

type Phase = 'preparation' | 'recording' | 'processing';

const validateTranscriptLocally = (transcript: string) => {
    const words = transcript.trim().split(/\s+/);
    const flags: string[] = [];
    const reasons: string[] = [];

    // Check length
    if (words.length < 40) {
        flags.push("insufficient_response");
        reasons.push(`Your response was only ${words.length} words. A meaningful GD contribution requires at least 40 words with substantive arguments.`);
    }

    // Check repetition
    const phraseCounts = new Map<string, number>();
    for (let len = 3; len <= Math.min(6, words.length); len++) {
        for (let i = 0; i <= words.length - len; i++) {
            const phrase = words.slice(i, i + len).join(" ").toLowerCase();
            phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
        }
    }

    const repeated = Array.from(phraseCounts.entries())
        .filter(([_, count]) => count > 3)
        .map(([phrase]) => phrase);

    if (repeated.length > 0) {
        flags.push("low_communication_quality");
        const sample = repeated.slice(0, 3);
        reasons.push(`Repeated phrases detected: "${sample.join('", "')}". Excessive repetition indicates poor communication quality.`);
    }

    if (flags.length === 0) return null;

    // Generate local fallback evaluation
    let base = 30;
    if (flags.includes("insufficient_response")) base = Math.min(base, 15 + words.length);
    if (flags.includes("low_communication_quality")) base = Math.min(base, 25);
    base = Math.max(10, Math.min(30, base));
    
    const catScore = Math.max(1, Math.floor(base / 10));

    return {
        scores: {
            content: { score: catScore, explanation: "Very limited content was provided." },
            clarity: { score: catScore, explanation: "Insufficient content to assess clarity of thought." },
            communication: { 
                score: flags.includes("low_communication_quality") ? Math.max(1, catScore - 1) : catScore, 
                explanation: flags.includes("low_communication_quality") ? "Excessive repetition of phrases indicates poor communication." : "Not enough speech to evaluate communication skills." 
            },
            confidence: { score: catScore, explanation: "Cannot assess confidence from such a brief response." },
            structure: { score: Math.max(1, catScore - 1), explanation: "No clear introduction, body, or conclusion was present." },
        },
        overall_score: base,
        strengths: ["Attempted to participate in the discussion."],
        improvements: reasons,
        tips: [
            "Speak for at least 1–2 minutes with clear arguments for and against the topic.",
            "Structure your response: start with an introduction, present 2–3 key points, and end with a conclusion.",
            "Use specific examples to support your arguments.",
        ],
        validation_flags: flags,
    };
};

export default function GDVoice() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Topic handling
    const decodedTopic = decodeURIComponent(topicId || '');
    const topic = decodedTopic || 'General Discussion';

    const [phase, setPhase] = useState<Phase>('preparation');
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds for prep
    const [recordingTime, setRecordingTime] = useState(0);
    const [maxRecordingTime] = useState(300); // 5 minutes max
    const [isRecording, setIsRecording] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('Analyzing your GD performance…');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    // Preparation Timer
    useEffect(() => {
        if (phase === 'preparation' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((t) => {
                    if (t <= 1) {
                        clearInterval(timer);
                        startRecording();
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [phase, timeLeft]);

    // Recording Timer
    useEffect(() => {
        if (phase === 'recording' && isRecording) {
            const timer = setInterval(() => {
                setRecordingTime((t) => {
                    if (t >= maxRecordingTime) {
                        stopRecording();
                        return t;
                    }
                    return t + 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [phase, isRecording, maxRecordingTime]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Start Recording – MediaRecorder only, no SpeechRecognition
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Choose a supported MIME type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : '';

            const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            // Define onstop behavior early
            mediaRecorder.onstop = async () => {
                const capturedChunks = [...chunksRef.current];
                const type = mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(capturedChunks, { type });

                console.log(`[GDVoice] Recording stopped. Chunks: ${capturedChunks.length}, Blob size: ${audioBlob.size}`);

                if (audioBlob.size === 0) {
                    toast({
                        title: "Recording Error",
                        description: "No audio was captured. Please ensure your microphone is working and speak clearly.",
                        variant: "destructive"
                    });
                    setPhase('preparation');
                    setTimeLeft(0);
                    setRecordingTime(0);
                    setIsRecording(false);
                    return;
                }

                // Send audio to backend
                await processAudio(audioBlob, type);
            };

            // Define ondataavailable
            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            // Start recording — using a timeslice can help keep data fresh
            mediaRecorder.start(500);
            setIsRecording(true);
            setPhase('recording');

        } catch (err: any) {
            console.error("Error accessing microphone:", err);
            const message = err?.name === 'NotAllowedError'
                ? 'Microphone permission denied. Please allow microphone access and try again.'
                : 'Could not access microphone. Please check your audio device.';
            toast({
                title: "Microphone Error",
                description: message,
                variant: "destructive"
            });
        }
    };

    const stopRecording = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

        // Stop the mic stream tracks IMMEDIATELY when stop is clicked
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setPhase('processing');
    };

    const processAudio = async (audioBlob: Blob, mimeType: string) => {
        try {
            // Step 1: Transcribe
            setProcessingMessage('Transcribing your speech…');

            const ext = mimeType.includes('webm') ? 'webm' : 'wav';
            const formData = new FormData();
            formData.append('audio', audioBlob, `recording.${ext}`);

            const transcribeRes = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!transcribeRes.ok) {
                const err = await transcribeRes.json().catch(() => ({}));
                throw new Error(err.detail || `Transcription failed (${transcribeRes.status})`);
            }

            const result = await transcribeRes.json();
            const transcript = (result.text || result.transcript || "").trim();

            if (!transcript || transcript === '(No speech detected in the audio.)') {
                toast({
                    title: "No Speech Detected",
                    description: "We couldn't detect any speech in your recording. Please try again.",
                    variant: "destructive"
                });
                setPhase('preparation');
                setTimeLeft(0);
                setRecordingTime(0);
                return;
            }

            // Step 1.5: Pre-validate
            let evaluation = validateTranscriptLocally(transcript);

            if (!evaluation) {
                // Step 2: Evaluate via AI if client validation passed
                setProcessingMessage('Evaluating your performance…');

                const evaluateRes = await fetch('/api/evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic, transcript }),
                });

                if (!evaluateRes.ok) {
                    const err = await evaluateRes.json().catch(() => ({}));
                    throw new Error(err.detail || `Evaluation failed (${evaluateRes.status})`);
                }

                evaluation = await evaluateRes.json();
            }

            // Navigate to results page with all data
            navigate('/gd/result', {
                state: {
                    topic,
                    transcript,
                    evaluation,
                },
                replace: true,
            });

        } catch (err: any) {
            console.error("Processing error:", err);
            toast({
                title: "Processing Failed",
                description: err.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
            setPhase('preparation');
            setTimeLeft(0);
            setRecordingTime(0);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-background">
            <Header title="GD Session" showBack={false} />

            <main className="container max-w-2xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
                <Card className="p-4 sm:p-6 md:p-8 text-center space-y-4 sm:space-y-6 md:space-y-8">

                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <h2 className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Topic</h2>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">{topic}</h1>
                    </div>

                    {phase === 'preparation' && (
                        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-primary/20">
                                    <div className="text-5xl font-mono font-bold text-primary">
                                        {formatTime(timeLeft)}
                                    </div>
                                    <Timer className="absolute -top-6 text-primary w-8 h-8" />
                                </div>
                                <p className="text-lg text-muted-foreground">
                                    {timeLeft > 0 ? 'Preparation Time Remaining' : 'Ready to speak!'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Take this time to structure your thoughts.
                                    Identify key points, examples, and your stance.
                                </p>
                            </div>

                            <Button
                                size="lg"
                                className="w-full h-14 text-lg gradient-gd"
                                onClick={startRecording}
                            >
                                Start Speaking Now (Skip Timer)
                            </Button>
                        </div>
                    )}

                    {phase === 'recording' && (
                        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-red-500/20 bg-red-500/5 animate-pulse mx-auto">
                                <div className="text-5xl font-mono font-bold text-red-500">
                                    {formatTime(recordingTime)}
                                </div>
                                <Mic className="absolute -top-6 text-red-500 w-8 h-8 animate-bounce" />
                            </div>

                            <div className="space-y-2">
                                <Progress value={(recordingTime / maxRecordingTime) * 100} className="h-2" />
                                <p className="text-sm text-muted-foreground flex justify-between">
                                    <span>recorded</span>
                                    <span>max {formatTime(maxRecordingTime)}</span>
                                </p>
                            </div>

                            <div className="bg-muted/50 p-2 sm:p-4 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 min-h-16 sm:h-20">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => {
                                        const heightMultiplier = 12 + Math.random() * 24;
                                        return (
                                            <div
                                                key={i}
                                                className="w-1 sm:w-1.5 bg-red-500 rounded-full animate-pulse"
                                                style={{
                                                    height: `${Math.max(12, Math.min(32, heightMultiplier))}px`,
                                                    animationDelay: `${i * 0.15}s`,
                                                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium text-center sm:text-left">Recording in progress…</p>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => {
                                        const heightMultiplier = 12 + Math.random() * 24;
                                        return (
                                            <div
                                                key={i}
                                                className="w-1 sm:w-1.5 bg-red-500 rounded-full animate-pulse"
                                                style={{
                                                    height: `${Math.max(12, Math.min(32, heightMultiplier))}px`,
                                                    animationDelay: `${(i + 5) * 0.15}s`,
                                                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            <Button
                                size="lg"
                                variant="destructive"
                                className="w-full h-10 sm:h-12 md:h-14 text-sm sm:text-base"
                                onClick={stopRecording}
                            >
                                <Square className="w-4 sm:w-5 h-4 sm:h-5 mr-2 fill-current" /> Stop & Submit
                            </Button>
                        </div>
                    )}

                    {phase === 'processing' && (
                        <div className="py-12 space-y-6 animate-in fade-in duration-500">
                            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                            <p className="text-xl font-medium text-foreground">{processingMessage}</p>
                            <p className="text-sm text-muted-foreground">
                                This may take a moment. Please don't close this page.
                            </p>
                        </div>
                    )}

                </Card>
            </main>
        </div>
    );
}
