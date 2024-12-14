import aiIcon from "../assets/icons/ai.png";
import { Dialog } from 'primereact/dialog';
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from 'react';
import { useAIConversation, useCreateConversation } from "../hooks/hooks";
import { useLanguage } from "../providers/languageContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import MessageInput from "./messageInput";
import AiMessage from "./aiMessage";
import './aiChat.css';


const AIChat = ({ user, allRecords }) => {
    const { translations } = useLanguage();
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState('center');
    const { aiConversation, loading } = useAIConversation();
    const { addConversation, loadingConversation } = useCreateConversation();
    const scrollRef = useRef(null);

    const formik =  useFormik({
        initialValues: {
            content: ''
        },
        onSubmit: async (values, { resetForm }) => {
            resetForm();
            values['allRecords'] = JSON.stringify(allRecords);
            await addConversation(values);
        },
        validationSchema: Yup.object({
            content: Yup.string().required(translations?.required)
                .min(3, translations?.login?.minChars?.replace(/{(\w+)}/g, '3'))
        }),
    })

    useEffect(() => {
        if (scrollRef.current) {
            setTimeout(() => {
                const scrollContainer = scrollRef.current.getContent();
                const el = scrollRef.current.getContent()?.firstElementChild?.lastElementChild;
                if (el) {
                    const margin = 20;
                    const elementPosition = el.offsetTop;
                    const targetPosition = elementPosition - scrollContainer.clientHeight + el.offsetHeight + margin;
                    if (loadingConversation && aiConversation[aiConversation.length - 1].role === 'assistant') {
                        scrollContainer.scrollTo({
                            top: targetPosition,
                            behavior: 'auto'
                        });
                    } else {
                        scrollContainer.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    };
                };
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
            {translations?.healthAssistant?.title}
        </div>
    );

    const chatBox = (conversation, index) => {
        if (index === 0) return null;

        const chatMessage = (content, linearGradient) => (
            <motion.div
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
                        background: linearGradient,
                        color: 'white',
                        padding: '1rem',
                        fontWeight: '500'
                    }}
                >
                    {content}
                </div>
            </motion.div>
        );

        return (
            <div key={index}>
                {conversation.role === 'user'
                    ?   chatMessage(conversation.content, 'linear-gradient(45deg, darkblue, darkorchid)')
                    :   conversation.role === 'assistant'
                    ?   <AiMessage content={conversation.content}/>
                    :   chatMessage(conversation.content, 'linear-gradient(98.3deg, rgb(0, 0, 0) 10.6%, rgb(255, 0, 0) 97.7%)')
                }
            </div>
        );
    };

    const footer = () => (
        <form onSubmit={formik.handleSubmit}>
            <MessageInput formik={formik} loading={loading} loadingConversation={loadingConversation} translations={translations}/>
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
                onClick={() => !visible ? show('right') : setVisible(false)}
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
                    {user.userType === 'Patient'
                        ?   <>
                                <p className="mt-0">{translations?.healthAssistant?.firstP}</p>
                                <p>{translations?.healthAssistant?.secondP}</p>
                                <ul className="suggested-questions-list">
                                    <li>{translations?.healthAssistant?.firstLi}</li>
                                    <li>{translations?.healthAssistant?.secondLi}</li>
                                </ul>
                                <p>{translations?.healthAssistant?.thirdP}</p>
                            </>
                        :   <>
                                <p className="mt-0">{translations?.healthAssistant?.firstPDoctorUser}</p>
                                <p>{translations?.healthAssistant?.secondP}</p>
                                <ul className="suggested-questions-list">
                                    <li>{translations?.healthAssistant?.firstLiDoctorUser}</li>
                                    <li>{translations?.healthAssistant?.secondLiDoctorUser}</li>
                                </ul>
                                <p>{translations?.healthAssistant?.thirdPDoctorUser}</p>
                            </>
                    }
                    {!loading && aiConversation.length > 0 && aiConversation.map((conversation, index) => chatBox(conversation, index))}
                </div>
            </Dialog>
        </div>
    );
};
export default AIChat;