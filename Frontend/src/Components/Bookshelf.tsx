import "./Bookshelf.css"
import blueBook from "../assets/blueBook.png"
import { type Dispatch, type SetStateAction, type ChangeEvent } from 'react';
import { useState } from 'react'
import { generateBookQuiz, type QuizData } from "../services/AIquizing";
import { QuizBook } from "./QuizBook";

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

const GENRE_COLORS: Record<string, string> = {
    "Fantasy": "hue-rotate(55deg) brightness(1.3) saturate(1.2)",          
    "Science Fiction": "hue-rotate(290deg)", 
    "Horror": "hue-rotate(140deg) brightness(0.8)", 
    "Mystery": "hue-rotate(200deg) contrast(1.2)",  
    "History": "hue-rotate(45deg) sepia(0.5)",      
    "Romance": "hue-rotate(320deg) brightness(1.1)", 
    "Adventure": "hue-rotate(60deg) saturate(2)",    
    "Thriller": "hue-rotate(15deg) contrast(1.5)",   
    "Non-Fiction": "grayscale(100%) brightness(1.2)",
    "Poetry": "invert(100%)",                        
    "Comedy": "hue-rotate(250deg) brightness(1.3)",  
    "Classic": "sepia(1) hue-rotate(320deg) contrast(0.8)", 
    "Self Help": "hue-rotate(180deg) brightness(1.2)", 
    "Textbook": "hue-rotate(210deg) grayscale(0.7)", 
};

export function BookList({book, setBook}: BookListProps) {
    // Mode States
    const [isWriting, setIsWriting] = useState<boolean>(false); // Creating a new book
    const [viewingBook, setViewingBook] = useState<books | null>(null); // Viewing an existing book
    const [isEditing, setIsEditing] = useState<boolean>(false); // Editing inside View mode

    // Shared Form States (Used for both Creating and Editing)
    const [titleText, setTitleText] = useState<string>('');
    const [contentsText, setContentsText] = useState<number | ''>('');
    const [authorText, setAuthorText] = useState<string>('');
    const [selectedGenre, setSelectedGenre] = useState<string>('Fantasy');

    // Quiz States
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);

    // -- HANDLERS --

    const handleTitle = (e: ChangeEvent<HTMLTextAreaElement>) => setTitleText(e.target.value);
    const handleAuthor = (e: ChangeEvent<HTMLTextAreaElement>) => setAuthorText(e.target.value);
    const handleGenre = (e: ChangeEvent<HTMLSelectElement>) => setSelectedGenre(e.target.value);
    const handleContents = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setContentsText(val === '' ? '': Number(val));
    }

    // 1. Start Creating New Book
    const startWriting = () => {
        // Clear form
        setTitleText('');
        setAuthorText('');
        setContentsText('');
        setSelectedGenre('Fantasy');
        
        setIsWriting(true);
        setViewingBook(null);
    }

    // 2. Open Existing Book (View Mode)
const openBook = (b: books) => {
        setTitleText(b.title);
        setAuthorText(b.author);
        setContentsText(b.contents);
        setSelectedGenre(b.genre || 'Fantasy');

        setViewingBook(b);
        setIsWriting(false);
    }
    // 3. Delete Book
    const handleDelete = async () => {
        if (!viewingBook) return;
        if (!confirm("Are you sure you want to burn this book?")) return;

        try {
            await fetch(`http://localhost:8080/books/${viewingBook.id}`, {
                method: 'DELETE',
            });
            setBook(prev => prev.filter(b => b.id !== viewingBook.id));
            setViewingBook(null); // Close modal
        } catch (error) {
            console.error("Error deleting book", error);
            alert("Failed to delete book.");
        }
    };

    // 4. Update Book (Save Edit)
    const handleUpdate = async () => {
        if (!viewingBook) return;

        const updatedData = {
            title: titleText,
            author: authorText,
            contents: Number(contentsText),
            genre: selectedGenre
        };

        try {
            await fetch(`http://localhost:8080/books/${viewingBook.id}`, {
                method: 'PUT',
                // FIX: Use standard capitalization
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            // Update local state
            setBook(prev => prev.map(b => 
                b.id === viewingBook.id ? { ...b, ...updatedData } : b
            ));

            // Update the 'viewing' reference so the UI refreshes
            setViewingBook({ ...viewingBook, ...updatedData });
            setIsEditing(false); 

        } catch (error) {
            console.error("Error updating book", error);
            alert("Failed to update book.");
        }
    };

    // 5. Create New Book (Save New)
    const handleSaveNew = async () => {
        const newBook = {
            title: titleText,
            contents: Number(contentsText),
            author: authorText,
            genre: selectedGenre
        }
        try {
            const response = await fetch('http://localhost:8080/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBook),
            });

            if (!response.ok) throw new Error('Network was not okay');

            const resultID = await response.json();

            setBook(prev => ([
                ...prev,
                { id: resultID, ...newBook, created: true }
            ]));
            
            setIsWriting(false);
        } catch(error){
            console.error("Error saving book", error);
            alert('Failed to save book');
        }
    }

    const startQuiz = async () => {
        if (!viewingBook) return;
        setIsLoadingQuiz(true);
        try {
            const data = await generateBookQuiz(viewingBook.title, viewingBook.author, viewingBook.contents);
            if (data) {
                setActiveQuiz(data);
                setViewingBook(null); // Optional: Close the book view when quiz starts
            } else {
                throw new Error("No data returned");
            }
        } catch (error) {
            console.error("Quiz Error:", error);
            alert("Could not summon this book's spirit.");
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    if (activeQuiz) {
        return <QuizBook quiz={activeQuiz} onClose={() => setActiveQuiz(null)} />;
    }

    return(
        <div>
            {/* SHELF DISPLAY */}
            <div className="book-container">
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
                        style={{ opacity: 0.8, filter: 'grayscale(100%)' }} 
                    />
                </button>

                {book.map((b) => (
                    <button
                        key={b.id}
                        onClick={() => openBook(b)} 
                        className="pixel-book-button"
                        style={{ position: 'relative' }} 
                        title={`${b.title} (${b.genre})`}
                    >
                        <img 
                            src={blueBook} 
                            alt={b.title} 
                            className="pixel-art" 
                            style={{ filter: GENRE_COLORS[b.genre] || GENRE_COLORS['Fantasy'] }} 
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

            {/* --- 1. WRITING OVERLAY (For New Books) --- */}
            {isWriting && (
                <div className="writing-overlay">
                    <div className="open-book">
                        <div className="book-page page-left">
                            <textarea className="handwritten-input title-input" placeholder="Title..." value={titleText} onChange={handleTitle} maxLength={30} />
                            <textarea className="handwritten-input author-input" placeholder="Author..." value={authorText} onChange={handleAuthor} maxLength={30} />
                            
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#5d4037' }}>Book Aura:</label>
                                <select value={selectedGenre} onChange={handleGenre} style={{ display: 'block', width: '100%', padding: '5px', marginTop: '5px', background: 'rgba(255,255,255,0.5)', border: '1px solid #d0c0a0', borderRadius: '4px', fontFamily: 'monospace' }}>
                                    {Object.keys(GENRE_COLORS).map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>

                            <div className="book-actions">
                                <button className="ink-btn" onClick={() => setIsWriting(false)}>Discard</button>
                                <button className="ink-btn" onClick={handleSaveNew}>Sign & Save</button>
                            </div>
                        </div>

                        <div className="book-page page-right">
                            <input type="number" className="handwritten-input contents-input" placeholder="Chapters..." value={contentsText} onChange={handleContents} style={{ width: '80%', fontSize: '1.5rem', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* --- 2. VIEW/EDIT OVERLAY (For Existing Books) --- */}
            {viewingBook && (
                <div className="writing-overlay">
                    <div className="open-book">
                        
                        {/* LEFT PAGE: Metadata + Edit/Delete */}
                        <div className="book-page page-left">
                            {isEditing ? (
                                // EDIT MODE
                                <>
                                    <textarea className="handwritten-input title-input" value={titleText} onChange={handleTitle} maxLength={30} />
                                    <textarea className="handwritten-input author-input" value={authorText} onChange={handleAuthor} maxLength={30} />
                                    <div style={{ marginTop: '1rem' }}>
                                        <select value={selectedGenre} onChange={handleGenre} style={{ display: 'block', width: '100%', padding: '5px', background: 'rgba(255,255,255,0.5)', border: '1px solid #d0c0a0', fontFamily: 'monospace' }}>
                                            {Object.keys(GENRE_COLORS).map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div className="book-actions">
                                        <button className="ink-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                                        <button className="ink-btn" onClick={handleUpdate}>Save</button>
                                    </div>
                                </>
                            ) : (
                                // VIEW MODE
                                <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
                                    <h2 style={{ fontFamily: 'PlayfairDisplay', fontSize: '1.8rem', margin: '0 0 10px 0', borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
                                        {viewingBook.title}
                                    </h2>
                                    <p style={{ fontFamily: 'Courier New', fontStyle: 'italic', fontSize: '1.1rem', margin: '0' }}>
                                        by {viewingBook.author}
                                    </p>
                                    <p style={{ fontFamily: 'Courier New', fontSize: '0.9rem', color: '#5d4037', marginTop: '10px' }}>
                                        Aura: {viewingBook.genre}
                                    </p>

                                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <button className="ink-btn" onClick={() => setIsEditing(true)}>Edit</button>
                                        <button className="ink-btn" onClick={handleDelete} style={{ background: '#5a2d2d', color: '#ffdddd' }}>Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT PAGE: Quiz Button */}
                        <div className="book-page page-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <button 
                                className="close-btn" 
                                style={{ top: '10px', right: '10px', background: 'transparent', color: '#3e2723', fontSize: '1.2rem', fontWeight: 'bold' }}
                                onClick={() => setViewingBook(null)}
                            >
                                X
                            </button>

                            {isEditing ? (
                                <input type="number" className="handwritten-input contents-input" placeholder="# Chapters" value={contentsText} onChange={handleContents} style={{ fontSize: '1.5rem', textAlign: 'center' }} />
                            ) : (
                                <>
                                    <h3 style={{ fontFamily: 'Courier New', marginBottom: '20px' }}>
                                        Chapter Count: {viewingBook.contents}
                                    </h3>
                                    <button 
                                        className="ink-btn" 
                                        onClick={startQuiz}
                                        style={{ fontSize: '1.2rem', padding: '15px 30px', border: '2px double #5d4037' }}
                                    >
                                        Take Quiz
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}