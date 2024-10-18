import { Button } from 'primereact/button';
import './messageInput.css';

const MessageInput = ({ formik, loading, loadingConversation }) => {
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.ctrlKey)  {
            e.preventDefault();
            formik.submitForm();
        }
        if (e.key === 'Enter' && e.ctrlKey) {
            const cursorPosition = e.target.selectionStart;
            e.target.value = e.target.value.substring(0, cursorPosition) + '\n' + e.target.value.substring(cursorPosition);
            e.target.selectionStart = cursorPosition + 1; // Move cursor to the new line
            e.target.selectionEnd = cursorPosition + 1; // Ensure cursor is placed correctly
        }
    };


    return (
        <di className="flex overflow-hidden align-items-center">
            <textarea
                type="text"
                placeholder="Ask a question..."
                {...formik.getFieldProps("content")}
                className='custom-textarea flex-grow-1'
                onKeyDown={handleKeyDown}
                rows={3}
            />
            <Button
                className="w-3rem mr-0"
                icon="pi pi-send"
                disabled={loading || !formik.isValid || loadingConversation}
                loading={loadingConversation}
                rounded
                outlined
                aria-label="Send content"
                type="submit"
            />
        </di>
    );
};
export default MessageInput;