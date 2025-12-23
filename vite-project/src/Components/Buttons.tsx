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
    const [bookContents, setBookContents] = useState <books>({id: 0, title: '', contents: '', author: '', created: false})
    const [text, setText] = useState <string>('');
    const [isVisible, setIsVisible] = useState <boolean>(true);

    // 
    const handleTitle = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value)
    }

    const handleSave = () => {
        setBookContents(prev =>({
            ...prev,
            title: text
        }))
    }

    const handleKeyDown = (e: KeyboardEvent) =>{
        if (e.key === 'Enter' && !e.shiftKey){
            handleSave()
        }
    }

    const handleBook = () =>{
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
        <div>
            <div className = "textarea-container">
                <button
                    onClick = {handleBook}
                    className = "brownBook" 
                >
                </button>
            </div>
            <div>
                <textarea
                    hidden = {isVisible}
                    placeholder = "Input title here"
                    value = {text}
                    onChange = {handleTitle}
                    onKeyDown = {handleKeyDown}
                />
            </div>
        </div>
    );
}