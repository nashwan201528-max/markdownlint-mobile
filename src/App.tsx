import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import markdownlint from 'markdownlint';

const defaultMarkdown = `# Welcome

This is a sample Markdown file.

- item one
- item two

> This is a blockquote.
`;

type MarkdownIssue = {
  lineNumber: number;
  ruleNames: string[];
  ruleDescription: string;
  errorDetail: string;
  errorContext?: string;
};

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [issues, setIssues] = useState<MarkdownIssue[]>([]);
  const [error, setError] = useState<string | null>(null);

  const lintResult = useMemo(() => {
    try {
      const result = markdownlint.sync({
        strings: {
          'document.md': markdown,
        },
        config: {
          default: true,
          MD013: false,
          MD033: false,
        },
      }) as Record<string, MarkdownIssue[]>;

      const fileIssues = result['document.md'] ?? [];
      return fileIssues.map((issue) => ({
        lineNumber: issue.lineNumber,
        ruleNames: issue.ruleNames,
        ruleDescription: issue.ruleDescription,
        errorDetail: issue.errorDetail,
        errorContext: issue.errorContext,
      }));
    } catch (lintError) {
      setError(lintError instanceof Error ? lintError.message : 'Unable to lint the Markdown file.');
      return [];
    }
  }, [markdown]);

  useEffect(() => {
    setIssues(lintResult);
    setError(null);
  }, [lintResult]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    setMarkdown(text);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Mobile linting</p>
          <h1>Markdownlint Mobile</h1>
        </div>
        <label className="upload-button">
          <input type="file" accept=".md,.markdown,text/markdown" onChange={handleFileChange} />
          Load file
        </label>
      </header>

      <section className="panel editor-panel">
        <div className="panel-header">
          <h2>Markdown</h2>
          <span>{markdown.length} chars</span>
        </div>

        <textarea
          aria-label="Markdown editor"
          value={markdown}
          onChange={(event) => setMarkdown(event.target.value)}
          spellCheck={false}
        />
      </section>

      <section className="panel results-panel">
        <div className="panel-header">
          <h2>Lint results</h2>
          <span>{issues.length} issue{issues.length === 1 ? '' : 's'}</span>
        </div>

        {error ? (
          <div className="status error">{error}</div>
        ) : issues.length === 0 ? (
          <div className="status success">No markdownlint issues found.</div>
        ) : (
          <ul className="issue-list">
            {issues.map((issue, index) => (
              <li key={`${issue.lineNumber}-${issue.ruleNames.join('-')}-${index}`} className="issue-item">
                <div className="issue-header">
                  <strong>{issue.ruleNames.join(', ')}</strong>
                  <span>Line {issue.lineNumber}</span>
                </div>
                <p>{issue.ruleDescription}</p>
                {issue.errorDetail && <p className="code-text">{issue.errorDetail}</p>}
                {issue.errorContext && <p className="context">Context: {issue.errorContext}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
