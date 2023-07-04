import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownRenderer = ({ children }) => {
    const preprocessContent = (content) => {
        return content.replace(/\n/g, '\n\n');
    };

    const components = {
        p: (props) => {
            return <span>{props.children}<br /></span>;
        },
        img: (props) => <img {...props} style={{ width: '100%' }} alt=" " />,
    };

    const preprocessedContent = preprocessContent(children);

    return <ReactMarkdown components={components} children={preprocessedContent} />;
};

export default MarkdownRenderer;