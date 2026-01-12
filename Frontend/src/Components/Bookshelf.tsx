import "./Bookshelf.css"
import blueBook from "../assets/blueBook.png"
import { type Dispatch, type SetStateAction, type ChangeEvent } from 'react';
import { useState } from 'react'
import { generateBookQuiz, type QuizData } from "../services/AIquizing";
import { QuizBook } from "./QuizBook";

// 1. Add 'genre' to the interface
export interface books {
    id: number
    title: string
    contents: number
    author: string
    genre: string 
    created: boolean
} 

interface BookListProps {
    book: books[],
    setBook: Dispatch<SetStateAction<books[]>>
}

// 2. Define Color Filters for Genres
const GENRE_COLORS: Record<string, string> = {
    "Fantasy": "hue-rotate(0deg)",          // Blue (Default)
    "Science Fiction": "hue-rotate(290deg)", // Pink/Purple
    "Horror": "hue-rotate(140deg) brightness(0.8)", // Red/Dark
    "Mystery": "hue-rotate(200deg) contrast(1.2)",  // Deep Green
    "History": "hue-rotate(45deg) sepia(0.5)",      // Brown/Gold
    "Romance": "hue-rotate(320deg) brightness(1.1)", // Hot Pink
};

export function BookList({book, setBook}: BookListProps) {
    const [isWriting, setIsWriting] = useState<boolean>(false);
    
    // Form States
    const [titleText, setTitleText] = useState<string>('');
    const [contentsText, setContentsText] = useState<number | ''>('');
    const [authorText, setAuthorText] = useState<string>('');
    const [selectedGenre, setSelectedGenre] = useState<string>('Fantasy'); // Default Genre

    // Quiz States
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);

    // Handlers
    const handleTitle = (e: ChangeEvent<HTMLTextAreaElement>) => setTitleText(e.target.value);
    const handleAuthor = (e: ChangeEvent<HTMLTextAreaElement>) => setAuthorText(e.target.value);
    const handleGenre = (e: ChangeEvent<HTMLSelectElement>) => setSelectedGenre(e.target.value);
    const handleContents = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setContentsText(val === '' ? '': Number(val));
    }

    const startWriting = () => {
        setTitleText('');
        setAuthorText('');
        setContentsText('');
        setSelectedGenre('Fantasy'); // Reset to default
        setIsWriting(true);
    }

    const startQuiz = async (title: string, author: string, chapters: number) => {
        setIsLoadingQuiz(true);
        try {
            const data = await generateBookQuiz(title, author, chapters);
            if (data) {
                setActiveQuiz(data);
            } else {
                throw new Error("No data returned");
            }
        } catch (error) {
            console.error("Quiz Error:", error);
            alert("Could not summon this book's spirit. (Try a different book or check console)");
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    const handleSaveButton = async () => {
        const newBook = {
            title: titleText,
            contents: Number(contentsText),
            author: authorText,
            genre: selectedGenre // Save the genre
        }
        try {
            const response = await fetch('http://localhost:8080/books', {
                method: 'POST',
                headers: { 'Content-type': 'application/JSON' },
                body: JSON.stringify(newBook),
            });

            if (!response.ok) throw new Error('Network was not okay');
            const resultID = await response.json();

            setBook(prev => ([
                ...prev,
                {
                    id: resultID,
                    ...newBook,
                    created: true
                }
            ]));
            
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
            <div className="book-container">
                {/* 3. The "Create New" Button (Always Blue or distinct) */}
                <button
                    id="create-book-btn"
                    onClick={startWriting}
                    className="pixel-book-button"
                    title="Write a new book"
                >
                    <img 
                        src={blueBook} 
                        alt="New Book" 
                        className="pixel-art" 
                        style={{ opacity: 0.8, filter: 'grayscale(100%)' }} // Greyed out to look like a "ghost" book
                    />
                </button>

                {/* 4. Render Saved Books with Colors */}
                {book.map((b) => (
                    <button
                        key={b.id}
                        onClick={() => startQuiz(b.title, b.author, b.contents)}
                        className="pixel-book-button"
                        style={{ 
                            position: 'relative', 
                        }} 
                        title={`${b.title} (${b.genre})`}
                    >
                        <img 
                            src={blueBook} 
                            alt={b.title} 
                            className="pixel-art" 
                            style={{ 
                                filter: GENRE_COLORS[b.genre] || GENRE_COLORS['Fantasy'] 
                            }} 
                        />
                    </button>
                ))}
            </div>
            
            {isLoadingQuiz && (
                <div className="loading-text" style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                    color: 'white', fontSize: '1.5rem', textShadow: '2px 2px 0 #000', zIndex: 3000
                }}>
                    Summoning Knowledge...
                </div>
            )}

            {isWriting && (
                <div className="writing-overlay">
                    <div className="open-book">
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
                            
                            {/* 5. Genre Selector UI */}
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#5d4037' }}>Book Aura:</label>
                                <select 
                                    value={selectedGenre} 
                                    onChange={handleGenre}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '5px',
                                        marginTop: '5px',
                                        background: 'rgba(255,255,255,0.5)',
                                        border: '1px solid #d0c0a0',
                                        borderRadius: '4px',
                                        fontFamily: 'monospace'
                                    }}
                                >
                                    {Object.keys(GENRE_COLORS).map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="book-actions">
                                <button className="ink-btn" onClick={() => setIsWriting(false)}>
                                    Discard
                                </button>
                                <button className="ink-btn" onClick={handleSaveButton}>
                                    Sign & Save
                                </button>
                            </div>
                        </div>

                        <div className="book-page page-right">
                            <input
                                type="number"
                                className="handwritten-input contents-input"
                                placeholder="Chapters..."
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