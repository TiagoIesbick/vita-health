import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';


const AiMessage = ({ content }) => {
    return (
        <ReactMarkdown
            components={{
                code({ node, inline, className, children, ...props }) {
                    return !inline ? (
                        <SyntaxHighlighter
                            style={dracula}
                            language={className?.replace('language-', '')}
                            PreTag="div"
                            {...props}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code {...props}>{children}</code>
                    );
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
};
export default AiMessage;