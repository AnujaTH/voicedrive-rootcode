import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy,
  RotateCcw,
  Home
} from 'lucide-react';

interface ExamResultsProps {
  results: {
    score: number;
    totalQuestions: number;
    percentage: number;
    answers: (number | null)[];
    timeUsed: number;
  };
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  onRetakeExam: () => void;
  onGoHome: () => void;
}

export const ExamResults = ({ results, questions, onRetakeExam, onGoHome }: ExamResultsProps) => {
  const { score, totalQuestions, percentage, answers, timeUsed } = results;
  const passed = percentage >= 60; // Assuming 60% is passing grade
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="min-h-screen bg-exam-bg p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Main Results Card */}
        <Card className="p-8 mb-6 text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            passed ? 'bg-success/10' : 'bg-destructive/10'
          }`}>
            {passed ? (
              <Trophy className="h-10 w-10 text-success" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4">
            {passed ? 'Congratulations!' : 'Better Luck Next Time'}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            {passed 
              ? 'You have successfully passed the driving license exam!' 
              : 'You did not pass this time, but you can retake the exam.'
            }
          </p>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-muted p-6 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">
                {score}/{totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">Questions Correct</div>
            </div>
            
            <div className="bg-muted p-6 rounded-lg">
              <div className={`text-3xl font-bold mb-2 ${
                passed ? 'text-success' : 'text-destructive'
              }`}>
                {percentage}%
              </div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </div>
            
            <div className="bg-muted p-6 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                <Clock className="h-8 w-8" />
                {formatTime(timeUsed)}
              </div>
              <div className="text-sm text-muted-foreground">Time Used</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onRetakeExam}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Retake Exam
            </Button>
            
            <Button 
              onClick={onGoHome}
              size="lg"
              className="text-lg px-8 py-4"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>
        </Card>

        {/* Detailed Results */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Question Review</h2>
          
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              const wasAnswered = userAnswer !== null;
              
              return (
                <div 
                  key={question.id}
                  className={`p-4 rounded-lg border-2 ${
                    !wasAnswered 
                      ? 'border-warning bg-warning/5' 
                      : isCorrect 
                        ? 'border-success bg-success/5' 
                        : 'border-destructive bg-destructive/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">
                      Question {index + 1}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      {!wasAnswered ? (
                        <Badge variant="outline" className="bg-warning text-warning-foreground">
                          Not Answered
                        </Badge>
                      ) : isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-foreground mb-3">{question.question}</p>
                  
                  <div className="grid gap-2">
                    {question.options.map((option, optionIndex) => {
                      const isUserAnswer = userAnswer === optionIndex;
                      const isCorrectAnswer = optionIndex === question.correctAnswer;
                      
                      return (
                        <div 
                          key={optionIndex}
                          className={`p-3 rounded text-sm ${
                            isCorrectAnswer
                              ? 'bg-success text-success-foreground font-medium'
                              : isUserAnswer && !isCorrect
                                ? 'bg-destructive text-destructive-foreground'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <span className="font-bold mr-2">
                            {getOptionLabel(optionIndex)}.
                          </span>
                          {option}
                          {isCorrectAnswer && (
                            <span className="ml-2 font-bold">(Correct Answer)</span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span className="ml-2 font-bold">(Your Answer)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};