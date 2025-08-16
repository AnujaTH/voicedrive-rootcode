interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const sampleExamQuestions: Question[] = [
  {
    id: 1,
    question: "What is the maximum speed limit in residential areas in Sri Lanka?",
    options: [
      "30 km/h",
      "50 km/h", 
      "60 km/h",
      "70 km/h"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "When should you use your vehicle's headlights?",
    options: [
      "Only at night",
      "During rain and poor visibility",
      "Only in tunnels",
      "When driving fast"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What should you do when approaching a pedestrian crossing?",
    options: [
      "Speed up to cross quickly",
      "Honk the horn to warn pedestrians",
      "Slow down and be prepared to stop",
      "Maintain the same speed"
    ],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "What is the legal blood alcohol limit for drivers in Sri Lanka?",
    options: [
      "0.05%",
      "0.08%",
      "0.03%",
      "Zero tolerance"
    ],
    correctAnswer: 3
  },
  {
    id: 5,
    question: "When must you give way at an intersection?",
    options: [
      "Only when there's a stop sign",
      "To vehicles coming from your right",
      "To vehicles coming from your left", 
      "Only to emergency vehicles"
    ],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "What does a red traffic light mean?",
    options: [
      "Slow down and proceed with caution",
      "Stop completely",
      "Prepare to stop",
      "Speed up to clear the intersection"
    ],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "How far should you maintain from the vehicle in front of you?",
    options: [
      "1 meter",
      "2 seconds following distance",
      "3 seconds following distance", 
      "5 meters"
    ],
    correctAnswer: 2
  },
  {
    id: 8,
    question: "When is it safe to overtake another vehicle?",
    options: [
      "On a curve or hill",
      "Near an intersection",
      "On a straight road with clear visibility",
      "In heavy traffic"
    ],
    correctAnswer: 2
  },
  {
    id: 9,
    question: "What should you do if your vehicle breaks down on the highway?",
    options: [
      "Leave it where it stopped",
      "Push it to the nearest garage",
      "Move it to the side and use hazard lights",
      "Call for help and wait in the vehicle"
    ],
    correctAnswer: 2
  },
  {
    id: 10,
    question: "What is the purpose of wearing a seatbelt?",
    options: [
      "To look professional",
      "To prevent injury in case of accident",
      "It's required by law only",
      "To keep clothes clean"
    ],
    correctAnswer: 1
  }
];

export const getRandomQuestions = (count: number = 10): Question[] => {
  const shuffled = [...sampleExamQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, sampleExamQuestions.length));
};