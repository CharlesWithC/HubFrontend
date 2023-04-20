import './App.css';
import './functions/config';
import { loadConfig } from './functions/config';
import { useState, useEffect } from 'react';

function App() {
  const [abbr, setAbbr] = useState("N/A");

  useEffect(() => {
    async function fetchAbbr(){
      const abbr = (await loadConfig("atm", "hub.atmvtc.com")).config.abbr;
      setAbbr(abbr);
    }
    fetchAbbr();
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={process.env.PUBLIC_URL + '/logo.png'} className="App-logo" alt="logo" />
        <p>
          This is a new start.
          Drivers Hub Abbreviation: {abbr}
        </p>
      </header>
    </div>
  );
}

export default App;
