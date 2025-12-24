import "./Buttons.css"
import { type Dispatch, type SetStateAction, type ChangeEvent, type KeyboardEvent } from 'react';
import { useState } from 'react'

export interface books{
    id: number
    title: string
    contents: string
    author: string
    created: boolean
} 
interface BookListProps{
    book: books[],
    setBook: Dispatch<SetStateAction<books[]>>
}
export function BookList({setBook}: BookListProps) {
    const [, setBookContents] = useState <books>({id: 0, title: '', contents: '', author: '', created: true})
    const [titleText, setTitleText] = useState <string>('');
    const [contentsText, setContentsText] = useState <string>('');
    const [authorText, setAuthorText] = useState <string>('');
    const [isVisible, setIsVisible] = useState <boolean>(true);
    const [isVisible1, setIsVisible1] = useState <boolean>(true);
    const [isVisible2, setIsVisible2] = useState <boolean>(true);

    // How we get title
    const handleTitle = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setTitleText(event.target.value);
    }

    const handleTitleSave = () =>{
        setTitleText(titleText)
    }

    const handleKeyDown = (e: KeyboardEvent) =>{
        if (e.key === 'Enter' && !e.shiftKey){
            setIsVisible(!isVisible)
            handleTitleSave();
        }
    }

    // How we get Contents
    const handleContents = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setContentsText(event.target.value);
    }

    const handleContentsSave = () =>{
        setContentsText(contentsText)
    }

    const handleKeyDownContents = (e: KeyboardEvent) =>{
        if (e.key === 'Enter' && !e.shiftKey){
            setIsVisible1(!isVisible1)
            handleContentsSave();
        }
    }

    // How we get Author
    const handleAuthor = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setAuthorText(event.target.value);

    }

    const handleAuthorSave = () =>{
        setAuthorText(authorText)
    }

    const handleKeyDownAuthor = (e: KeyboardEvent) =>{
        if (e.key === 'Enter' && !e.shiftKey){
            setIsVisible2(!isVisible2)
            handleAuthorSave();
        }
    }

    // sets default && buttons visible
    const handleBook = () =>{
        setBookContents({
            id: Date.now(),
            title: '',
            contents: '',
            author: '',
            created: true
        });

        // makes all textboxes visible
        setIsVisible(!isVisible)
        setIsVisible1(!isVisible1)
        setIsVisible2(!isVisible2)
    }
    
    // Saves the book
    const handleSaveButton = async () => {
        const newBook = {
            title: titleText,
            contents: contentsText,
            author: authorText,
        }
        try{
            // send data to backend
            const response = await fetch('http://localhost:8080/books', {
                method: 'POST',                             //Options: GET, POST, DELETE, PUT
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
                    contents: contentsText,
                    author: authorText,
                    created: true
                }
            ]));
        }catch(error){
            console.error("Error saving book", error)
            alert('Failed to save book, sorry cat')
        }
    }

    return(
        <div>
            <div className = "book-container">
                <button
                    id="create-book-btn"
                    onClick = {handleBook}
                    className = "brownBook" 
                >
                </button>
            </div>
            <div>
                <textarea
                    hidden = {isVisible}
                    placeholder = "Input title here"
                    value = {titleText}
                    onChange = {handleTitle}
                    onKeyDown = {handleKeyDown}
                />
                <textarea
                    hidden = {isVisible1}
                    placeholder = "Input contents here"
                    value = {contentsText}
                    onChange = {handleContents}
                    onKeyDown = {handleKeyDownContents}
                />
                <textarea
                    hidden = {isVisible2}
                    placeholder = "Input author here"
                    value = {authorText}
                    onChange = {handleAuthor}
                    onKeyDown = {handleKeyDownAuthor}
                />
            </div>
            <div>
                <button
                    hidden = {!isVisible||!isVisible1||!isVisible2}
                    onClick={handleSaveButton}
                    className="saveButton"
                >
                </button>
            </div>
        </div>
    );
}