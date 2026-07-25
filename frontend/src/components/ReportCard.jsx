import React from 'react';

export default function ReportCard({ report }) {
  if (!report) {
    return null;
  }

  const {
    url,
    httpStatus,
    responseTime,
    title,
    metaDescription,
    h1Count,
    imagesMissingAlt,
    wordCount,
  } = report;

  return (
    <div className="report-card">
      <div className="report-header">
        <h3 className="report-url">
          <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
        </h3>
        <div className="report-metrics">
          <span className="metric status">
            <strong>Status:</strong> {httpStatus}
          </span>
          <span className="metric time">
            <strong>Response Time:</strong> {responseTime}ms
          </span>
        </div>
      </div>

      <div className="report-body">
        <div className="meta-section">
          <h2>{title || 'No Title Found'}</h2>
          <p>{metaDescription || 'No Meta Description Found'}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <strong>H1 Count:</strong> 
            <span>{h1Count}</span>
          </div>
          <div className="stat-box">
            <strong>Images Missing Alt:</strong> 
            <span>{imagesMissingAlt}</span>
          </div>
          <div className="stat-box">
            <strong>Word Count:</strong> 
            <span>{wordCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
