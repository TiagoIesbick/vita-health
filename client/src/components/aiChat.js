import aiIcon from "../assets/icons/ai.png";
import { Button } from 'primereact/button';
import { Card } from "primereact/card";
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from "primereact/inputtextarea";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from 'react';
import { useAIConversation, useCreateConversation } from "../hooks/hooks";
import { useFormik } from "formik";
import * as Yup from "yup";
import MessageInput from "./messageInput";
import './aiChat.css';


const AIChat = ({ allRecords }) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState('center');
    const { aiConversation, loading, error } = useAIConversation();
    const { addConversation, loadingConversation, errorConversation } = useCreateConversation();
    const scrollRef = useRef(null);

    const formik =  useFormik({
        initialValues: {
            content: ''
        },
        onSubmit: async (values, { resetForm }) => {
            values['allRecords'] = JSON.stringify(allRecords);
            console.log(values);
            const resAI = await addConversation(values);
            console.log('[resAI]:', resAI);
            resetForm();
        },
        validationSchema: Yup.object({
            content: Yup.string().required('Required')
                .min(3, 'Minimum 3 characters')
        }),
    })

    useEffect(() => {
        if (scrollRef.current) {
            setTimeout(() => {
                const el = scrollRef.current.getContent()?.firstElementChild?.lastElementChild;
                loadingConversation && aiConversation[aiConversation.length -1].role === 'assistant'
                    ? el?.scrollIntoView()
                    : el?.scrollIntoView({ behavior: 'smooth' });
            }, 10);
        }
    }, [aiConversation, visible, loadingConversation]);

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

    const chatBox = (conversation, index) => {
        if (index === 0) return null;

        return (
            <div key={index}>
                {conversation.role === 'user'
                    ?   <motion.div
                            initial={{ x: 10 }}
                            whileInView={{ x: 0 }}
                            transition={{ type: "spring" }}
                            className="flex justify-content-end mb-3"
                        >
                            <div
                                style={{
                                    maxWidth: '80%',
                                    width: 'max-content',
                                    wordBreak: 'break-word',
                                    borderRadius: '25px',
                                    background: 'linear-gradient(45deg, darkblue, darkorchid)',
                                    color: 'white',
                                    padding: '1rem',
                                    fontWeight: '500'
                                }}
                            >
                                {conversation.content}
                            </div>
                        </motion.div>
                    :   <p style={{wordBreak: 'break-word'}}>{conversation.content}</p>
                }
            </div>
        );
    };

    const footer = () => (
        <form /*className="flex mt-2 align-items-center"*/ onSubmit={formik.handleSubmit}>
            {/* <InputTextarea
                id="content-to-ai"
                rows={1}
                placeholder="Send me a message ..."
                autoResize
                aria-label="content-to-ai"
                className="flex-grow-1"
                {...formik.getFieldProps("content")}
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
            {formik.touched.content && formik.errors.content &&<div className="text-red-500 text-xs">{formik.errors.content}</div>} */}
            <MessageInput formik={formik} loading={loading} loadingConversation={loadingConversation}/>
        </form>
    );

    return (
        <div
            style={{
                position: 'fixed',
                right: '20px',
                top: 'calc(50vh - 1.5rem)',
                zIndex: '1000'
            }}>
            <motion.img
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                src={aiIcon}
                alt="AI-assistant"
                className="w-3rem cursor-pointer"
                onClick={() => show('right')}
            />
            <Dialog
                header={header}
                ref={scrollRef}
                footer={footer}
                visible={visible}
                position={position}
                style={{ maxHeight: '80%' }}
                onHide={() => {if (!visible) return; setVisible(false); }}
                draggable
                resizable
                modal={false}
                className="dialog-content-width"
            >
                <div className="text-justify">
                    <p className="mt-0">Hello! I'm your health assistant, here to help you understand your medical data. You can ask me questions about your health records, lab results, and any other medical information.</p>
                    <p>For example, you can ask me things like:</p>
                    <ul className="suggested-questions-list">
                        <li>What does this test result mean?</li>
                        <li>Can you explain the details of my recent medical record?</li>
                    </ul>
                    <p>How can I assist you today?</p>
                    {!loading && aiConversation.length > 0 && aiConversation.map((conversation, index) => chatBox(conversation, index))}
                </div>
            </Dialog>
        </div>
    );
};
export default AIChat;