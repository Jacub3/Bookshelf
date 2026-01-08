import { useState, useEffect, useRef } from 'react';
import { type QuizData } from '../services/AIquizing';
import './Bookshelf.css';

interface QuizBookProps {
    quiz: QuizData;
    onClose: () => void;
}

export function QuizBook({ quiz, onClose }: QuizBookProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const hasSaved = useRef(false);

    useEffect(() => {

        if (isFinished && !hasSaved.current && score > 0) {
            hasSaved.current = true;
            
            fetch(`http://localhost:8080/wizards/1/exp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: score })
            })
            .then(res => res.json())
            .then(data => {
                console.log("XP Updated!", data);
            })
            .catch(err => console.error("Failed to save XP", err));
        }
    }, [isFinished, score]); 

    const currentQ = quiz.questions[currentIndex];

    const handleOptionSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);
        if (option === currentQ.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
    };

    // --- RESULTS VIEW ---
    if (isFinished) {
        return (
            <div className="writing-overlay">
                <div className="open-book">
                    <div className="book-page page-left" style={{justifyContent: 'center', alignItems: 'center'}}>
                        <h2 className="handwritten-text">The End</h2>
                        <p className="handwritten-text">You have completed the trial of knowledge.</p>
                    </div>
                    <div className="book-page page-right" style={{justifyContent: 'center', alignItems: 'center'}}>
                        <h3 className="handwritten-text">Score</h3>
                        <h1 style={{fontSize: '3em', color: '#3e2723'}}>{score} / {quiz.questions.length}</h1>
                        
                        <p className="handwritten-text" style={{marginTop: '10px'}}>
                            +{score} Experience Gained!
                        </p>

                        <button className="ink-btn" onClick={onClose}>Close Book</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- QUIZ VIEW ---
    return (
        <div className="writing-overlay">
            <div className="open-book">
                <div className="book-page page-left">
                    <div className="quiz-header">
                        <span className="handwritten-label">Ch. {currentIndex + 1}</span>
                    </div>
                    
                    <p className="handwritten-text question-text">
                        {currentQ.question}
                    </p>

                    {isAnswered && (
                        <div className={`quiz-feedback ${selectedOption === currentQ.correctAnswer ? 'correct' : 'wrong'}`}>
                            <strong>{selectedOption === currentQ.correctAnswer ? "Correct." : "Incorrect."}</strong>
                            <p className="feedback-explanation">{currentQ.explanation}</p>
                        </div>
                    )}
                </div>

                <div className="book-page page-right">
                    <div className="quiz-options-list">
                        {currentQ.options.map((option, idx) => {
                            let btnClass = "quiz-option-btn";
                            if (isAnswered) {
                                if (option === currentQ.correctAnswer) btnClass += " opt-correct";
                                else if (option === selectedOption) btnClass += " opt-wrong";
                                else btnClass += " opt-dim";
                            }

                            return (
                                <button 
                                    key={idx} 
                                    className={btnClass}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={isAnswered}
                                >
                                    <span className="opt-letter">{String.fromCharCode(65 + idx)}.</span> {option}
                                </button>
                            );
                        })}
                    </div>

                    <div className="book-actions">
                        <button className="ink-btn" onClick={onClose}>Exit</button>
                        {isAnswered && (
                            <button className="ink-btn" onClick={handleNext}>
                                {currentIndex === quiz.questions.length - 1 ? "Finish" : "Next Page ->"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}