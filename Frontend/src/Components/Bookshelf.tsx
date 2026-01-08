import "./Bookshelf.css"
import blueBook from "../assets/blueBook.png"
import { type Dispatch, type SetStateAction, type ChangeEvent } from 'react';
import { useState } from 'react'

// ADDITION: Imports for the Quiz feature
import { generateBookQuiz, type QuizData } from "../services/AIquizing";
import { QuizBook } from "./QuizBook";

export interface books{
    id: number
    title: string
    contents: number
    author: string
    created: boolean
} 
interface BookListProps{
    book: books[],
    setBook: Dispatch<SetStateAction<books[]>>
}

export function BookList({setBook}: BookListProps) {
    // Consolidated state for the "Writing Mode"
    const [isWriting, setIsWriting] = useState<boolean>(false);
    
    const [titleText, setTitleText] = useState <string>('');
    const [contentsText, setContentsText] = useState <number | ''>('');
    const [authorText, setAuthorText] = useState <string>('');

    // ADDITION: State for the Quiz Mode
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);

    // Handlers
    const handleTitle = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setTitleText(event.target.value);
    }
    const handleContents = (event: ChangeEvent<HTMLInputElement>) => {
        const val = event.target.value;
        setContentsText(val === '' ? '': Number(val));
    }
    const handleAuthor = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setAuthorText(event.target.value);
    }

    // Opens the writing interface
    const startWriting = () => {
        // Reset fields if you want a blank book every time, 
        // or remove these lines to keep the draft.
        setTitleText('');
        setAuthorText('');
        setContentsText('');
        
        setIsWriting(true);
    }

    const startQuiz = async (title: string, author: string, chapters: number) => {
        setIsLoadingQuiz(true);
        const data = await generateBookQuiz(title, author, chapters);
        setIsLoadingQuiz(false);
        if (data) {
            setActiveQuiz(data);
        } else {
            console.error("Failed to generate quiz data.");
        }
    };

    // Saves the book and closes interface
    const handleSaveButton = async () => {
        const newBook = {
            title: titleText,
            contents: Number(contentsText),
            author: authorText,
        }
        try{
            // send data to backend
            const response = await fetch('http://localhost:8080/books', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/JSON'
                },
                body: JSON.stringify(newBook),
            });

            if (!response.ok){
                throw new Error('Network was not okay')
            }

            const resultID = await response.json();

            setBook(prev => ([
                ...prev,
                {
                    id: resultID,
                    title: titleText,
                    contents: Number(contentsText),
                    author: authorText,
                    created: true
                }
            ]));
            
            // Close the writing interface on success
            setIsWriting(false);

        } catch(error){
            console.error("Error saving book", error)
            alert('Failed to save book, sorry cat')
        }
    }

    if (activeQuiz) {
        return <QuizBook quiz={activeQuiz} onClose={() => setActiveQuiz(null)} />;
    }

    return(
        <div>
            {/* The Clickable Button on the Shelf */}
            <div className = "book-container">
                <button
                    id="create-book-btn"
                    onClick = {startWriting}
                    className = "pixel-book-button"
                    title="Write a new book"
                >
                    <img src={blueBook} alt="Blue Book" className="pixel-art" />
                </button>

                <button
                    onClick={() => {startQuiz(titleText, authorText, Number(contentsText))}}
                    className="pixel-book-button"
                    style={{ left: '110px', top: '90px' }} 
                    title="Take a Quiz"
                >
                    {/* Reusing blueBook with a filter, or use redBook if available */}
                    <img 
                        src={blueBook} 
                        alt="Quiz Book" 
                        className="pixel-art" 
                        style={{filter: 'hue-rotate(150deg)'}} 
                    />
                </button>
            </div>
            
            {/* ADDITION: Loading Text Overlay */}
            {isLoadingQuiz && (
                <div className="loading-text" style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                    color: 'white', fontSize: '1.5rem', textShadow: '2px 2px 0 #000'
                }}>
                    Summoning Knowledge...
                </div>
            )}

            {/* The Open Book Overlay (Only visible when writing) */}
            {isWriting && (
                <div className="writing-overlay">
                    <div className="open-book">
                        
                        {/* LEFT PAGE: Title and Author */}
                        <div className="book-page page-left">
                            <textarea
                                className="handwritten-input title-input"
                                placeholder="Title..."
                                value={titleText}
                                onChange={handleTitle}
                                maxLength={30}
                            />
                            <textarea
                                className="handwritten-input author-input"
                                placeholder="Author..."
                                value={authorText}
                                onChange={handleAuthor}
                                maxLength={30}
                            />
                            
                            <div className="book-actions">
                                <button className="ink-btn" onClick={() => setIsWriting(false)}>
                                    Discard
                                </button>
                                <button className="ink-btn" onClick={handleSaveButton}>
                                    Sign & Save
                                </button>
                            </div>
                        </div>

                        {/* RIGHT PAGE: Contents */}
                        <div className="book-page page-right">
                            <input
                                type="number"
                                className="handwritten-input contents-input"
                                placeholder="Enter a number..."
                                value={contentsText}
                                onChange={handleContents}
                                style={{
                                    width: '80%',
                                    fontSize: '1.5rem',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        
                    </div>
                </div>
            )}
        </div>
    );
}