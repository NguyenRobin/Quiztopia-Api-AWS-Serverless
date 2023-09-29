export interface Question {
  question: string;
  answer: string;
  coordinates: { latitude: string; longitude: string };
}

export interface Quiz {
  pk: string;
  sk: string;
  entityType: string;
  id: string;
  quizName: string;
  questions: [
    {
      question: string;
      answer: string;
      coordinates: { latitude: string; longitude: string };
    }
  ];
  createdAt: string;
  creator: string;
  modified?: string;
}

export interface CreateQuiz {
  quizName: string;
  questions: [
    {
      question: string;
      answer: string;
      coordinates: { latitude: string; longitude: string };
    }
  ];
}
