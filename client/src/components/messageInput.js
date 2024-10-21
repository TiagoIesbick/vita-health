import { Button } from 'primereact/button';
import { useRef, useEffect } from 'react';
import './messageInput.css';


const MessageInput = ({ formik, loading, loadingConversation }) => {
    const textareaRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey)  {
            e.preventDefault();
            formik.submitForm();
        }
    };

    const resizeTextarea = () => {
        if (textareaRef.current) {
            const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight, 10);
            const maxHeight = lineHeight * 3;
            textareaRef.current.style.height = "auto";
            const newHeight = Math.min(textareaRef.current.scrollHeight -16, maxHeight);
            textareaRef.current.style.height = `${newHeight}px`;
            textareaRef.current.style.overflowY = newHeight === maxHeight ? "scroll" : "hidden";
        }
    };

    useEffect(() => {
        resizeTextarea();
    }, [formik.values.content]);

    return (
        <div className="flex overflow-hidden align-items-center message-container">
            <textarea
                type="text"
                placeholder="Ask a question..."
                {...formik.getFieldProps("content")}
                className='custom-textarea'
                onKeyDown={handleKeyDown}
                rows={1}
                ref={textareaRef}
            />
            <Button
                className='m-0 w-3rem icon-rotate'
                icon="pi pi-send"
                disabled={loading || !formik.isValid || loadingConversation || !formik.values.content}
                loading={loadingConversation}
                rounded
                tooltip={
                    (formik.touched.content && formik.errors.content) || !formik.values.content
                        ? "Minimum 3 characters" : undefined
                }
                tooltipOptions={{
                    position: 'left', showOnDisabled: true, showDelay: 300, hideDelay: 300
                }}
                aria-label="Send message"
                type="submit"
            />
        </div>
    );
};
export default MessageInput;