import { useState, useEffect, useCallback } from 'react';

export const useQuestionParser = () => {
  const [rawInputText, setRawInputText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);

  // Function to format questions from Firestore into raw text for the canvas
  const formatQuestionsToRawText = useCallback((questionsArray) => {
    let formattedText = '';
    questionsArray.forEach((q, qIndex) => {
      if (qIndex > 0) formattedText += '\n\n'; // Add double newline between questions
      // Use q.displayNumber if available, otherwise fallback to index + 1
      const displayIdentifier = q.displayNumber || (qIndex + 1).toString();
      // REMOVED [ID:...] for aesthetics
      formattedText += `Câu ${displayIdentifier}: ${q.text}\n`;

      if (q.type === 'multiple_choice' && q.options && q.options.length > 0) {
        q.options.forEach((opt, optIndex) => {
          const optionPrefix = (opt === q.correct_answer ? '*' : '') + String.fromCharCode(65 + optIndex) + '. ';
          formattedText += `${optionPrefix}${opt}\n`;
        });
      }
    });
    return formattedText;
  }, []);

  const parseInputText = useCallback(() => {
    if (rawInputText === undefined || rawInputText === null) {
      setParsedQuestions([]);
      return;
    }

    const lines = rawInputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const newParsedQuestions = [];
    let currentQuestion = null;

    lines.forEach(line => {
      const questionLineMatch = line.match(/^câu\s+([^:]*):?\s*(.*)/i);

      if (questionLineMatch) {
        if (currentQuestion) {
          newParsedQuestions.push(currentQuestion);
        }

        // REMOVED ID extraction logic

        const identifierPart = questionLineMatch[1].trim();
        const questionTextPart = questionLineMatch[2].trim();

        currentQuestion = {
          id: null, // No ID from text
          _id: `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          displayNumber: identifierPart,
          text: questionTextPart,
          type: 'multiple_choice',
          options: [],
          correct_answer: '',
          points: 10,
        };
      } else if (currentQuestion && (/^[A-Z]\./.test(line) || /^\*[A-Z]\./.test(line))) {
        const isCorrect = line.startsWith('*');
        const optionText = isCorrect ? line.substring(line.indexOf('.') + 1).trim() : line.substring(line.indexOf('.') + 1).trim();

        if (isCorrect) {
          currentQuestion.correct_answer = optionText;
        }
        currentQuestion.options.push(optionText);
      }
    });

    if (currentQuestion) {
      newParsedQuestions.push(currentQuestion);
    }
    setParsedQuestions(newParsedQuestions);
  }, [rawInputText]);

  useEffect(() => {
    parseInputText();
  }, [rawInputText, parseInputText]);

  const handlePointsChange = useCallback((index, value) => {
    const updatedQuestions = [...parsedQuestions];
    updatedQuestions[index].points = Number(value);
    setParsedQuestions(updatedQuestions);
  }, [parsedQuestions]);

  return {
    rawInputText,
    setRawInputText,
    parsedQuestions,
    handlePointsChange,
    formatQuestionsToRawText,
    parseInputText
  };
};
