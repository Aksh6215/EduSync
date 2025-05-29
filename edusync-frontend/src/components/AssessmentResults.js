import React from 'react';

const AssessmentResults = ({ results }) => (
  <div>
    <h3>Assessment Results</h3>
    <ul className="list-group">
      {results && results.length > 0 ? (
        results.map(result => (
          <li key={result.ResultId || result.id} className="list-group-item">
            Assessment: {result.AssessmentTitle || result.title || 'N/A'}<br />
            Score: <strong>{result.Score}</strong><br />
            Attempted: {result.AttemptDate ? new Date(result.AttemptDate).toLocaleString() : 'N/A'}
          </li>
        ))
      ) : (
        <li className="list-group-item">No results available.</li>
      )}
    </ul>
  </div>
);

export default AssessmentResults; 