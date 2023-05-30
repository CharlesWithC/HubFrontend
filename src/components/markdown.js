import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownRenderer = ({ children }) => {
    const preprocessContent = (content) => {
        return content.replace(/\n/g, '\n\n');
    };

    const renderers = {
        text: (props) => {
            return props.children?.includes('\n') ? (
                props.children.split('\n').map((text, index) => (
                    <React.Fragment key={index}>
                        {text}
                        <br />
                    </React.Fragment>
                ))
            ) : (
                <span>{props.children}</span>
            );
        },
    };

    const preprocessedContent = preprocessContent(children);

    return <ReactMarkdown renderers={renderers} children={preprocessedContent} />;
};

export default MarkdownRenderer;