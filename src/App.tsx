import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import markdownlint from 'markdownlint';

const defaultMarkdown = `# Welcome

This is a sample Markdown file.

- item one
- item two

> This is a blockquote.
`;

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type MarkdownIssue = {
  lineNumber: number;
  ruleNames: string[];
  ruleDescription: string;
  errorDetail: string;
  errorContext?: string;
};

type LintResult = {
  issues: MarkdownIssue[];
  error: string | null;
};

function App() {
  const [markdown, setMarkdown] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return defaultMarkdown;
    }

    try {
      return window.localStorage.getItem('markdownlint-mobile-content') ?? defaultMarkdown;
    } catch {
      return defaultMarkdown;
    }
  });
  const [issues, setIssues] = useState<MarkdownIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const lintResult = useMemo<LintResult>(() => {
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
      }) as Record<string, Array<MarkdownIssue>>;

      const fileIssues = result['document.md'] ?? [];
      return {
        issues: fileIssues.map((issue) => ({
          lineNumber: issue.lineNumber,
          ruleNames: issue.ruleNames,
          ruleDescription: issue.ruleDescription,
          errorDetail: issue.errorDetail,
          errorContext: issue.errorContext,
        })),
        error: null,
      };
    } catch (lintError) {
      return {
        issues: [],
        error:
          lintError instanceof Error ? lintError.message : 'Unable to lint the Markdown file.',
      };
    }
  }, [markdown]);

  useEffect(() => {
    setIssues(lintResult.issues);
    setError(lintResult.error);
  }, [lintResult]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem('markdownlint-mobile-content', markdown);
    } catch {
      // Ignore storage failures so the app still works in private browsing or restricted environments.
    }
  }, [markdown]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`The selected file is too large. Please use a file smaller than ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`);
      event.target.value = '';
      return;
    }

    setIsLoadingFile(true);

    try {
      const text = await file.text();
      setMarkdown(text);
      setError(null);
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : 'Unable to read the selected file.');
    } finally {
      setIsLoadingFile(false);
      event.target.value = '';
    }
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

      {isLoadingFile && <div className="status info" aria-live="polite">Loading file…</div>}

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
          <div className="status error" aria-live="polite">{error}</div>
        ) : issues.length === 0 ? (
          <div className="status success" aria-live="polite">No markdownlint issues found.</div>
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
