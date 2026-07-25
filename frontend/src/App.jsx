import React, { useState, useRef, useEffect } from 'react';
import UrlInput from './components/UrlInput';
import ReportCard from './components/ReportCard';
import { auditUrl } from './services/apiService';

export default function App() {
  const [report, setReport] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleAudit = async (url) => {
    if (isPending) return;

    setIsPending(true);
    setError(null);
    setReport(null);

    try {
      const result = await auditUrl(url);
      if (isMounted.current) {
        setReport(result.data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      if (isMounted.current) {
        setIsPending(false);
      }
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Page Pulse</h1>
        <p>A lightweight webpage auditing tool.</p>
      </header>
      
      <main>
        <section className="input-section">
          <UrlInput onSubmit={handleAudit} isPending={isPending} />
          {error && <div className="error-banner">{error}</div>}
        </section>

        {report && (
          <section className="report-section">
            <ReportCard report={report} />
          </section>
        )}
      </main>

      <footer className="site-footer">
        <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer">
          Built for Digital Heroes Training Task
        </a>
      </footer>
    </div>
  );
}
