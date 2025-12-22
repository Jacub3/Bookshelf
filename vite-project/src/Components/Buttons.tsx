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
    setBook: Dispatch<SetStateAction<books>>
}
export function BookList({book, setBook}: BookListProps) {
    const [bookContents, setBookContents] = useState <books>(id: 0, title: '', contents: '', author: '', created: false)

    // Changes title from text area
    // THIS IS A VARIABLE
    const handleTitle = (event: ChangeEvent<HTMLTextAreaElement>) => {
        
        const newTitle = event.target.value
        
        setBookContents(prev => ({
            ...prev,
            title: newTitle
        }))
    }

    
    
    return(
        <div>
            <textarea
                placeholder = "Input title here"
                value = {bookContents.title}
                onChange={handleTitle}
            />
        </div>
    );
}