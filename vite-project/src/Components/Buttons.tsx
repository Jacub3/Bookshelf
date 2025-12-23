import "./Buttons.css"
import { type Dispatch, type SetStateAction } from 'react';
import { type ChangeEvent } from 'react';
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
    const [bookContents, setBookContents] = useState <books>({id: 0, title: '', contents: '', author: '', created: false})
    const [isVisible, setIsVisible] = useState <boolean>(false);

    // Changes title from text area
    // THIS IS A VARIABLE
    const handleTitle = (event: ChangeEvent<HTMLTextAreaElement>) => {
        
        const newTitle = event.target.value

        setBookContents(prev => ({
            ...prev,
            title: newTitle
        }))
    }

    const handleBook = () =>{
        setBook(prevBooks => [
            ... prevBooks,
            bookContents
        ])

        setBookContents({
            id: Date.now(),
            title: '',
            contents: '',
            author: '',
            created: false
        });
        setIsVisible(!isVisible)
    }

    return(
        <div className = "textarea-container">
            <button
                onClick = {handleBook}
                className = "brownBook" 
            >
            <textarea
                hidden = {isVisible}
                placeholder = "Input title here"
                value = {bookContents.title}
                onChange={handleTitle}
            />
            </button>

        </div>
    );
}