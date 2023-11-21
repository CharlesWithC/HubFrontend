import React from 'react';
import ReactMarkdown from 'react-markdown';

var vars = require("../variables");

const MarkdownRenderer = ({ children }) => {
    const preprocessContent = (content) => {
        if (content === undefined || content === null) return "";
        return content.replace(/\n/g, '\n\n');
    };

    const components = {
        p: (props) => {
            return <span>{props.children}<br /></span>;
        },
        img: (props) => <>{!vars.userSettings.data_saver && <img {...props} style={{ width: '100%' }} alt=" " />}</>,
        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />, // Added this line
    };

    const preprocessedContent = preprocessContent(children);

    return <ReactMarkdown components={components} children={preprocessedContent} />;
};

export default MarkdownRenderer;