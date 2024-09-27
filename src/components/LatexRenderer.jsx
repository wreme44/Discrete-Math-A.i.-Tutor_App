import React, {useCallback} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import remarkGfm from 'remark-gfm'

const LatexRenderer = ({content}) => {

    /**
   * cleans latex response by removing unnecessary markdown syntax
   * + ensuring proper formatting for latex rendering
   * @param {string} content - raw content from assistant
   * @returns {string} - cleaned content
   */

    // cleaning latex, removing markdown notation for proper displaying
    const cleanLatexResponse = useCallback((content) => {

        // if (typeof content !== 'string'){
        //     return content;
        // }

        let cleanedContent = content;

        // replacing triple backticks with $$ for latex blocks
        cleanedContent = cleanedContent.replace(/```(?:math|latex)?\n([\s\S]*?)\n```/g, '$$$1$$');

        // removing any remaining single backticks
        cleanedContent = cleanedContent.replace(/`/g, '');

        // ensuring latex expressions are on their own lines + use consistent delimiters
        cleanedContent = cleanedContent.replace(/\$\$([^$]+)\$\$/g, '\n$$$1$$\n');

        // replacing double backslashes with single
        cleanedContent = cleanedContent.replace(/\\\\/g, '\\');

        // 3.
        // handling specific formatting for matrices: 
        // ensuring newlines inside matrices are correctly kept
        cleanedContent = cleanedContent.replace(/\\begin{(pmatrix|bmatrix)}\$/g, '\n$$\\begin{$1}');
        cleanedContent = cleanedContent.replace(/\\end{(pmatrix|bmatrix)}\s*\$/g, '\\end{$1}\n$$');

        // 2.
        // replacing \ots with \cdots (since gpt left out the 'c')
        cleanedContent = cleanedContent.replace(/\\ots/g, '\\cdots');

        // // ensuring power symbols are present (handle missing `^` before exponents)
        // cleanedContent = cleanedContent.replace(/(\d)(\d+)/g, '$1^{$2}'); // fixes b2 to b^2

        // 4.
        // ensuring proper spacing between inline math and text
        // cleanedContent = cleanedContent.replace(/([^\n])(\$\S)/g, '$1\n$2');  // adding new line before inline latex if missing
        // cleanedContent = cleanedContent.replace(/(\$\S)([^\n])/g, '$1\n$2');  // adding new line after inline latex if missing

        // // ensuring proper spacing around display math and text
        // cleanedContent = cleanedContent.replace(/([^\n])(\n\$\$)/g, '$1\n\n$2');  // add double new lines before display math
        // cleanedContent = cleanedContent.replace(/(\$\$\n)([^\n])/g, '$1\n\n\n$2');    // add new line after display math

        // 1.
        // handling display math + inline math consistently
        // converting display math using \[ \] to $$
        cleanedContent = cleanedContent.replace(/\\\[([^]+?)\\\]/g, '\n$$$1$$\n');

        // converting inline math using \( \) to single $
        cleanedContent = cleanedContent.replace(/\\\(([^]+?)\\\)/g, '$$ $1 $$');

        // handling common subscript and superscript issues
        // removing any unnecessary newlines or spaces inside math delimiters
        // cleanedContent = cleanedContent.replace(/\$\s+([^$]+)\s+\$/g, '$$$1$$');
        // trimming unnecessary whitespace
        return cleanedContent.trim();
    }, []);

    // renderer / displayer for code blocks: latex, syntax highlighting
    const renderers = {

        paragraph: ({ node, children }) => {

            const hasBlockChild = children.some(child =>

                typeof child === 'object' &&
                (child.type === 'code' || child.type === 'div')
            );
            return hasBlockChild ? <div>{children}</div> : <p>{children}</p>;
        },

        code({ node, inline, className, children, ...props }) {

            if (inline) {
                return (
                    <code
                        className="bg-gray-700 p-1 rounded whitespace-pre-wrap break-words"
                        {...props}
                    >
                        {children}
                    </code>
                );
            }

            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');

            // detecting and rendering latex blocks
            if (/^\$\$.*\$\$$/.test(codeContent.trim())) {

                const math = codeContent.replace(/^\$\$(.*)\$\$$/, '$1').trim();
                return (
                    <div className="math-block overflow-x-auto">
                        <ReactMarkdown
                            children={`$$${math}$$`}
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex]}
                        // className="max-w-full break-words" 
                        />
                    </div>
                )
            }

            // applying syntax highlighting for code blocks
            if (match) {

                const language = match[1];
                const highlighted = hljs.getLanguage(language)
                    ? hljs.highlight(codeContent, { language }).value
                    : hljs.highlightAuto(codeContent).value;

                return (
                    <pre className="my-2 overflow-x-auto">
                        <code
                            className={`language-${language} hljs`}
                            dangerouslySetInnerHTML={{ __html: highlighted }}
                        />
                    </pre>
                );
            }

            return (
                <pre className="my-2 overflow-x-auto">
                    <code className="hljs" {...props}>
                        {children}
                    </code>
                </pre>
            );
        },
    };

    return (
        <ReactMarkdown
            children={cleanLatexResponse(content)}
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={renderers}
            className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-full break-words"
        />
    )
}

export default LatexRenderer