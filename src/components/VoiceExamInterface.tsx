import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { SpeechRecognition } from '@/types/speech';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface VoiceExamInterfaceProps {
  questions: Question[];
  timeLimit: number; // in minutes
  onExamComplete: (results: any) => void;
}

export const VoiceExamInterface = ({ questions, timeLimit, onExamComplete }: VoiceExamInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // convert to seconds
  const [language, setLanguage] = useState('en-US');
  const [examStarted, setExamStarted] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState('');
  
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech APIs
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;
    }

    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [language]);

  // Timer countdown
  useEffect(() => {
    if (!examStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleExamComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speakText = (text: string) => {
    if (!synthesisRef.current) {
      toast({
        title: "Speech not supported",
        description: "Text-to-speech is not available in your browser",
        variant: "destructive"
      });
      return;
    }

    // Cancel any ongoing speech
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.8; // Slower for better comprehension
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Speech error",
        description: "Unable to speak the text",
        variant: "destructive"
      });
    };

    setLastSpokenText(text);
    synthesisRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech recognition not supported",
        description: "Please use a modern browser with microphone access",
        variant: "destructive"
      });
      return;
    }

    setIsListening(true);
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      handleVoiceAnswer(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      setIsListening(false);
      toast({
        title: "Voice recognition error",
        description: "Please try again",
        variant: "destructive"
      });
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleVoiceAnswer = (transcript: string) => {
    // Parse voice input to option selection
    const optionWords = {
      'a': 0, 'option a': 0, 'first': 0, 'one': 0,
      'b': 1, 'option b': 1, 'second': 1, 'two': 1,
      'c': 2, 'option c': 2, 'third': 2, 'three': 2,
      'd': 3, 'option d': 3, 'fourth': 3, 'four': 3
    };

    let selectedOption = null;
    for (const [word, option] of Object.entries(optionWords)) {
      if (transcript.includes(word)) {
        selectedOption = option;
        break;
      }
    }

    if (selectedOption !== null && selectedOption < questions[currentQuestionIndex].options.length) {
      selectAnswer(selectedOption);
      toast({
        title: "Answer recorded",
        description: `Selected option ${String.fromCharCode(65 + selectedOption)}`,
      });
    } else {
      toast({
        title: "Answer not recognized",
        description: "Please say 'A', 'B', 'C', or 'D'",
        variant: "destructive"
      });
    }
  };

  const selectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const readCurrentQuestion = () => {
    const question = questions[currentQuestionIndex];
    const optionLabels = ['A', 'B', 'C', 'D'];
    
    let textToRead = `Question ${currentQuestionIndex + 1} of ${questions.length}. ${question.question}. `;
    
    question.options.forEach((option, index) => {
      textToRead += `Option ${optionLabels[index]}: ${option}. `;
    });
    
    textToRead += "Please say your answer: A, B, C, or D.";
    
    speakText(textToRead);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleExamComplete = () => {
    const score = answers.reduce((total, answer, index) => {
      return total + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);

    const results = {
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      answers,
      timeUsed: (timeLimit * 60) - timeRemaining
    };

    onExamComplete(results);
  };

  const startExam = () => {
    setExamStarted(true);
    speakText("Welcome to the driving license exam. The timer has started. Let's begin with the first question.");
    setTimeout(() => readCurrentQuestion(), 2000);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = answers.filter(answer => answer !== null).length;

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-6">Driving License Exam</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Voice-based multiple choice exam. Listen carefully and answer by speaking.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4 text-lg">
              <Clock className="h-6 w-6" />
              <span>Time Limit: {timeLimit} minutes</span>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-lg">
              <CheckCircle className="h-6 w-6" />
              <span>Total Questions: {questions.length}</span>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Instructions:</h3>
              <ul className="text-sm text-left space-y-1">
                <li>• Listen to each question carefully</li>
                <li>• Click the microphone button and say A, B, C, or D</li>
                <li>• You can skip questions and return later</li>
                <li>• Click "Read Question" to replay any question</li>
              </ul>
            </div>

            <Button 
              onClick={startExam} 
              size="lg"
              className="w-full text-xl py-6"
            >
              <Volume2 className="mr-2 h-6 w-6" />
              Start Exam
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-exam-bg p-4">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-destructive' : ''}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Answered: {answeredCount}/{questions.length}
            </span>
            <Button 
              variant="outline" 
              onClick={handleExamComplete}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              Submit Exam
            </Button>
          </div>
        </div>

        <Progress value={progressPercentage} className="mt-4" />
      </div>

      {/* Main Question Area */}
      <div className="w-full max-w-4xl mx-auto">
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="grid gap-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={answers[currentQuestionIndex] === index ? "default" : "outline"}
                onClick={() => selectAnswer(index)}
                className={`justify-start text-left text-lg py-6 px-6 ${
                  answers[currentQuestionIndex] === index 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-exam-option-button hover:bg-exam-option-hover'
                }`}
              >
                <span className="font-bold mr-4">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </Button>
            ))}
          </div>

          {/* Voice Controls */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={readCurrentQuestion}
              variant="outline"
              size="lg"
              disabled={isSpeaking}
              className="bg-secondary text-secondary-foreground"
            >
              {isSpeaking ? <Pause className="mr-2 h-5 w-5" /> : <Volume2 className="mr-2 h-5 w-5" />}
              {isSpeaking ? 'Speaking...' : 'Read Question'}
            </Button>

            <Button
              onClick={isListening ? stopListening : startListening}
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className={`${isListening ? 'bg-exam-voice-active text-foreground animate-pulse' : ''}`}
            >
              {isListening ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
              {isListening ? 'Listening...' : 'Record Answer'}
            </Button>
          </div>

          {lastSpokenText && (
            <div className="mt-4 p-3 bg-muted rounded text-sm">
              <span className="font-medium">Last spoken: </span>
              {lastSpokenText.substring(0, 100)}...
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            size="lg"
          >
            <SkipBack className="mr-2 h-5 w-5" />
            Previous
          </Button>

          <Button
            onClick={nextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            variant="outline"
            size="lg"
          >
            Next
            <SkipForward className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};