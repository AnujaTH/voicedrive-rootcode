import { useState } from "react";
import { VoiceExamInterface } from "@/components/VoiceExamInterface";
import { ExamResults } from "@/components/ExamResults";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sampleExamQuestions, getRandomQuestions } from "@/data/examQuestions";
import {
  Mic,
  Volume2,
  Clock,
  CheckCircle,
  Globe,
  BookOpen,
  Award,
  Users,
} from "lucide-react";

type ExamState = "home" | "exam" | "results";

const getExamConfig = () => {
  const stored = localStorage.getItem("examConfig");
  if (stored) return JSON.parse(stored);
  return { timeLimit: 60, passingScore: 60, questionCount: 10 };
};

const getCandidate = () => {
  const stored = localStorage.getItem("candidate");
  if (stored) return JSON.parse(stored);
  return null;
};

const Index = () => {
  const [examState, setExamState] = useState<ExamState>("home");
  const [currentQuestions, setCurrentQuestions] = useState(
    sampleExamQuestions.slice(0, 10)
  );
  const [examResults, setExamResults] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");

  const candidate = getCandidate();
  const handleCandidateLogout = () => {
    localStorage.removeItem("candidate");
    window.location.reload();
  };

  const startExam = () => {
    const examConfig = getExamConfig();
    const questions = getRandomQuestions(examConfig.questionCount);
    setCurrentQuestions(questions);
    setExamState("exam");
  };

  const handleExamComplete = (results: any) => {
    setExamResults(results);
    setExamState("results");
  };

  const retakeExam = () => {
    setExamResults(null);
    setExamState("home");
  };

  const goHome = () => {
    setExamResults(null);
    setExamState("home");
  };

  if (examState === "exam") {
    const examConfig = getExamConfig();
    return (
      <VoiceExamInterface
        questions={currentQuestions}
        timeLimit={examConfig.timeLimit}
        onExamComplete={handleExamComplete}
      />
    );
  }

  if (examState === "results" && examResults) {
    return (
      <ExamResults
        results={examResults}
        questions={currentQuestions}
        onRetakeExam={retakeExam}
        onGoHome={goHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-exam-bg">
      {/* Candidate Profile Info */}
      {candidate && (
        <div className="bg-white shadow flex items-center gap-4 px-6 py-3 border-b">
          {candidate.photo && (
            <img
              src={candidate.photo}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <div className="font-bold text-lg">{candidate.name}</div>
            <div className="text-xs text-gray-600">NIC/ID: {candidate.nic}</div>
            <div className="text-xs text-gray-600">
              Code: <span className="font-mono">{candidate.code}</span>
            </div>
          </div>
          <button
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            onClick={handleCandidateLogout}
          >
            Logout
          </button>
        </div>
      )}
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">
            Sri Lanka Driving License Exam
          </h1>
          <p className="text-xl opacity-90">
            Voice-Based Testing System for All
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Language Selection */}
        <Card className="max-w-2xl mx-auto p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Select Your Language
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { code: "en-US", name: "English", native: "English" },
              { code: "si-LK", name: "Sinhala", native: "සිංහල" },
              { code: "ta-LK", name: "Tamil", native: "தமிழ்" },
            ].map((lang) => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? "default" : "outline"}
                onClick={() => setSelectedLanguage(lang.code)}
                className="h-16 text-lg"
              >
                <div className="text-center">
                  <div>{lang.name}</div>
                  <div className="text-sm opacity-75">{lang.native}</div>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Exam Info Card */}
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Voice-Based Exam</h2>
              <p className="text-lg text-muted-foreground">
                Take your driving license exam using voice commands. Perfect for
                candidates who prefer audio-based interaction.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-lg">
                <Clock className="h-6 w-6 text-primary" />
                <span>60 minutes duration</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <CheckCircle className="h-6 w-6 text-primary" />
                <span>10 multiple choice questions</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <Volume2 className="h-6 w-6 text-primary" />
                <span>Listen and respond by voice</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <Award className="h-6 w-6 text-primary" />
                <span>60% score required to pass</span>
              </div>
            </div>

            <Button
              onClick={startExam}
              size="lg"
              className="w-full text-xl py-6"
            >
              <Mic className="mr-3 h-6 w-6" />
              Start Voice Exam
            </Button>
          </Card>

          {/* Features Card */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Key Features
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Volume2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Audio Questions</h3>
                  <p className="text-muted-foreground">
                    Listen to questions read aloud in your preferred language
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-success/10 p-3 rounded-lg">
                  <Mic className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Voice Answers</h3>
                  <p className="text-muted-foreground">
                    Simply say A, B, C, or D to answer each question
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-warning/10 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Flexible Navigation</h3>
                  <p className="text-muted-foreground">
                    Skip questions and return to them later during the exam
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Accessibility First</h3>
                  <p className="text-muted-foreground">
                    Designed for candidates with varying literacy levels
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Requirements:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Modern web browser with microphone access</li>
                <li>• Quiet environment for voice recognition</li>
                <li>• Stable internet connection</li>
                <li>• Allow microphone permissions when prompted</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-muted-foreground">Candidates Tested</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-2">85%</div>
            <div className="text-muted-foreground">Success Rate</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-2">3</div>
            <div className="text-muted-foreground">Languages Supported</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
