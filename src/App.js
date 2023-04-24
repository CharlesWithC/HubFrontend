import './App.css';
import { useState } from 'react';
import Loader from './pages/loader';
var vars = require('./variables');

function App() {
  const [, setRerender] = useState(false);

  const runRerender = () => {
    setTimeout(function(){setRerender(true);}, 500);
  };
  
  if(vars.dhconfig == null){
    return <Loader onLoaderLoaded={runRerender} />;
  } else {
    return <div><p>Succeed!</p></div>;
  }
}

export default App;
