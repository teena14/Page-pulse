import React, { useState } from 'react';

const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

export default function UrlInput({ onSubmit, isPending }) {
  const [url, setUrl] = useState('');

  const isEmpty = url.trim() === '';
  const isInvalid = !isEmpty && !isValidUrl(url);
  const isDisabled = isEmpty || isInvalid || isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isDisabled) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="url-input-form" noValidate>
      <div className="input-group">
        <label htmlFor="url-input">URL to Audit</label>
        <input
          id="url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          disabled={isPending}
          aria-invalid={isInvalid}
        />
        {isInvalid && (
          <span className="error-text">Please enter a valid HTTP/HTTPS URL.</span>
        )}
      </div>
      <button type="submit" disabled={isDisabled}>
        {isPending ? 'Auditing...' : 'Audit Page'}
      </button>
    </form>
  );
}
