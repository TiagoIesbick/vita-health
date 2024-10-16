import aiIcon from "../assets/icons/ai.png";
import { Button } from 'primereact/button';
import { Card } from "primereact/card";
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from "primereact/inputtextarea";
import { useState } from 'react';
import { useAIConversation } from "../hooks/hooks";


const AIChat = ({ allRecords }) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState('center');
    const { aiConversation, loading, error } = useAIConversation();

    const show = (position) => {
        setPosition(position);
        setVisible(true);
    };

    const header = () => (
        <div className="flex align-items-center flex-wrap">
            <img src={aiIcon} alt="AI-assistant" className="w-3rem h-3rem mr-2" />
            Health Assistant
        </div>
    );

    const chatBox = (conversation, index) => (
        <div key={index}>
        {conversation.role === 'user'
            ?   <div className="flex justify-content-end mb-3">
                    <Card
                        style={{
                            maxWidth: '80%',
                            width: 'max-content',

                        }}
                        className="surface-ground text-right"
                        
                    >
                        {conversation.content}
                    </Card>
                </div>
                
            : <p>{conversation.content}</p>
        }
        </div>
    );

    const footer = () => (
        <form className="flex gap-1 mt-2 align-items-center">
            <InputTextarea
                id="message-to-ai"
                rows={1}
                placeholder="Message"
                autoResize
                aria-label="message-to-ai"
                className="flex-grow-1"
            />
            <Button className="w-3rem mr-0" icon="pi pi-send" rounded outlined aria-label="Send Message" />
        </form>
    );

    console.log(aiConversation);

    return (
        <div
            style={{
                position: 'fixed',
                right: '20px',
                top: 'calc(50vh - 1.5rem)',
                zIndex: '1000'
            }}>
            <img src={aiIcon} alt="AI-assistant" className="w-3rem cursor-pointer" onClick={() => show('right')}/>
            <Dialog header={header} footer={footer} visible={visible} position={position} style={{ width: '50vw', maxHeight: '80%' }} onHide={() => {if (!visible) return; setVisible(false); }} draggable resizable modal={false} >
                <p>Hello! I'm your health assistant, here to help you understand your medical data. You can ask me questions about your health records, lab results, and any other medical information.</p>
                <p>For example, you can ask me things like:</p>
                <ul>
                    <li>What does this test result mean?</li>
                    <li>Can you explain the details of my recent medical record?</li>
                </ul>
                <p>Your health information is handled with the highest level of privacy and security. How can I assist you today?</p>
                {!loading && aiConversation.length > 0 && aiConversation.map((conversation, index) => chatBox(conversation, index))}
            </Dialog>
        </div>
    );
};
export default AIChat;