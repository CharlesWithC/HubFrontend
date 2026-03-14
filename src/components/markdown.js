import { useContext } from "react";
import { AppContext } from "../context";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

const MarkdownRenderer = ({ children }) => {
  const { userSettings } = useContext(AppContext);

  const content = children == null ? "" : String(children);

  const components = {
    img: ({ node, ...props }) => <>{!userSettings.data_saver && <img {...props} style={{ width: "100%" }} alt=" " />}</>,
    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkBreaks]} components={components}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
