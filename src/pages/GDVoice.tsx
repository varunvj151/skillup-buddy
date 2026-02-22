import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, Square, Timer, Play } from 'lucide-react';
import { gdTopics } from '@/data/gdTopics';
import { useToast } from '@/components/ui/use-toast';

type Phase = 'preparation' | 'recording' | 'processing';

export default function GDVoice() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Topic handling
    const topicIndex = topicId ? parseInt(topicId) : -1;
    const isCustomTopic = topicId === 'custom'; // Simplified handling for now, might need state passing for custom topics
    // For now let's assume topicId corresponds to index in gdTopics or passed via state. 
    // Since URL params don't carry state well on refresh, let's look up by index or handle differently.
    // Actually, let's decode the topic from the URL if it's a string, or index.
    // Simplest: pass topic as query param or state? Prompt said /gd/voice/:topicId
    // Let's assume topicId is the actual topic string URL-encoded for simplicity, or an index.
    // Let's try to verify if it is an index.

    const decodedTopic = decodeURIComponent(topicId || '');
    const topic = gdTopics.includes(decodedTopic) ? decodedTopic : decodedTopic;

    const [phase, setPhase] = useState<Phase>('preparation');
    const [timeLeft, setTimeLeft] = useState(10); // 10 seconds for prep
    const [recordingTime, setRecordingTime] = useState(0);
    const [maxRecordingTime] = useState(300); // 5 minutes max
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recognitionRef = useRef<any>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Preparation Timer
    useEffect(() => {
        if (phase === 'preparation' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
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

    // Start Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup MediaRecorder
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setPhase('recording');

            // Setup Speech Recognition
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognitionRef.current = recognition;
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onstart = () => {
                    console.log("Speech recognition started");
                };

                recognition.onresult = (event: any) => {
                    let newFinalTranscript = '';
                    // Loop through results starting from resultIndex
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            newFinalTranscript += event.results[i][0].transcript + ' ';
                        }
                    }

                    if (newFinalTranscript) {
                        setTranscript((prev) => prev + newFinalTranscript);
                    }
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                };

                recognition.onend = () => {
                    console.log("Speech recognition ended");
                };

                recognition.start();
            } else {
                setTranscript("Speech recognition is not supported in this browser. Please use Google Chrome.");
                console.error("Speech Recognition API not supported");
            }

        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast({
                title: "Microphone Error",
                description: "Could not access microphone. Please check permissions.",
                variant: "destructive"
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        setIsRecording(false);
        setPhase('processing');

        // Slight delay to ensure final processing
        setTimeout(() => {
            if (!transcript) {
                console.error("No transcript captured from SpeechRecognition.");
            }

            navigate('/gd/result', {
                state: {
                    topic,
                    transcript: transcript || "No transcript available (Browser may not support SpeechRecognition).",
                    audioBlob: new Blob(chunksRef.current, { type: 'audio/webm' })
                },
                replace: true
            });
        }, 1000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-background">
            <Header title="GD Session" showBack={false} /> {/* No back button during active session to enforce flow */}

            <main className="container max-w-2xl mx-auto px-4 py-8">
                <Card className="p-8 text-center space-y-8">

                    <div className="space-y-4">
                        <h2 className="text-xl text-muted-foreground uppercase tracking-wide">Topic</h2>
                        <h1 className="text-3xl font-bold text-foreground">{topic}</h1>
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
                                <p className="text-lg text-muted-foreground">Preparation Time Remaining</p>
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
                                disabled={timeLeft > 0} // Enforce timer? Prompt said "Start Speaking" button but also "Speaking cannot start before preparation ends"
                            >
                                {timeLeft > 0 ? `Wait for Preparation (${formatTime(timeLeft)})` : "Start Speaking Now"}
                            </Button>
                            {/* Dev Mode Skip for testing - maybe hidden or removed for prod. keeping strictly to prompt: "Speaking cannot start before preparation ends" */}
                        </div>
                    )}

                    {phase === 'recording' && (
                        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-red-500/20 bg-red-500/5 animate-pulse">
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

                            <div className="bg-muted/50 p-4 rounded-lg text-left h-32 overflow-y-auto font-mono text-sm">
                                <p className="text-muted-foreground mb-1">Live Transcript:</p>
                                {transcript || <span className="italic opacity-50">Listening...</span>}
                            </div>

                            <Button
                                size="lg"
                                variant="destructive"
                                className="w-full h-14 text-lg"
                                onClick={stopRecording}
                            >
                                <Square className="w-5 h-5 mr-2 fill-current" /> Stop & Submit
                            </Button>
                        </div>
                    )}

                    {phase === 'processing' && (
                        <div className="py-12 space-y-4">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-xl text-muted-foreground">Processing your session...</p>
                        </div>
                    )}

                </Card>
            </main>
        </div>
    );
}
