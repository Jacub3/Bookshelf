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
    }

    return(
        <div>
            <h3></h3>
            <textarea
                placeholder = "Input title here"
                value = {bookContents.title}
                onChange={handleTitle}
            />
            <button
                onClick = {handleBook}
                className='text-indigo-600 hover:text-indigo-800 text-sm font-medium'
            > Add Book </button>
        </div>
    );
}