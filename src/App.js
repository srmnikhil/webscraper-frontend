import React, { useState } from 'react';
import './App.css';

function App() {
  const [ip, setIp] = useState('');
  const [headlines, setHeadlines] = useState([]);
  const [message, setMessage] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [isScraped, setIsScraped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [checkScript, setCheckScript] = useState(false);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
  const [backendMessage, setBackendMessage] = useState('');

  
  const scraperFunc = () => {
    const currentDateTime = new Date().toLocaleString();
    setDateTime(currentDateTime);
    setIsScraped(false); // Mark as scraped when request is triggered
    setIsLoading(true);
    setMessage("");

    fetch('http://localhost:5000/run-scraper', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          setIp(data.proxyIP);
          setHeadlines(data.trendingHeadlines);
          setIsScraped(true); // Mark the data as scraped
          setSavedData(data); // Save the data returned from the backend
        }
        setIsLoading(false);
      })
      .catch(error => {
        setMessage('Error running script: Maybe backend not started yet retry in 1 min');
        setHeadlines([]); // Clear headlines in case of error
        setIsScraped(false); // Reset the scraped state
        setIsLoading(false);
      });
  };

  const checkBackend = () => {
    setIsLoadingBackend(true);
    setBackendMessage('');
    fetch('http://localhost:5000/start', {
      method: 'GET',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Backend not ready');
        }
        return response.json();
      })
      .then(() => {
        setCheckScript(true);
        setBackendMessage('Backend is ready, now run the script.');
        setIsLoadingBackend(false);
      })
      .catch(() => {
        setCheckScript(false);
        setBackendMessage('Backend is being prepared. Please check in 1-2 minutes.');
        setIsLoadingBackend(false);
      });
  }

  return (
    <div className="App">
      <div style={{ padding: "1rem" }}>
        <p>Since, the backend is running on a free resource so first please click on check Start Backend after you clicked on it, check after 2 mins if it says Backend is ready then you can run script.</p>
        <button onClick={checkBackend} disabled={isLoadingBackend}>
          {isLoadingBackend ? 'Checking...' : 'Start Backend'}
        </button>
        <p>{backendMessage}</p>
      </div>
      <h1>Click here to run the script.</h1>
      <button onClick={scraperFunc} disabled={isLoading}>
        {isLoading ? "Running Script..." : "Run Script"}
      </button>

      {isScraped && (
        <>
          {headlines.length > 0 ? (
            <>
              <p>These are the most happening topics as on: {dateTime}</p>
              <ul>
                {headlines.map((headline, index) => (
                  <li key={index}>{headline}</li>
                ))}
              </ul>
              <p>The IP address used for this query was {ip}</p>
            </>
          ) : (
            <p>Either Login failed or server error, please run the script again.</p>
          )}
          {savedData && savedData.trendingHeadlines>0 && (
            <div>
              <h2>Here’s a JSON extract of this record from the MongoDB:</h2>
              <pre>{JSON.stringify(savedData, null, 2)}</pre>
            </div>
          )}
        </>
      )}



      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
