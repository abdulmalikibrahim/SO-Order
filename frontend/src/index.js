import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './Pages/Index';
import NavBar from './Component/NavBar';
import WorkingCalendar from './Pages/WorkingCalendar';
import MasterData from './Pages/MasterData';

const root = ReactDOM.createRoot(document.getElementById('root'));
const API_URL = process.env.REACT_APP_API_URL;

const App = () => {
  return(
      <Router>
        <NavBar />
        <div className='p-3'>
          <Routes>
            <Route path='/' element={<Index api_url={API_URL} />}/>
            <Route path='/workingCalendar' element={<WorkingCalendar api_url={API_URL} />}/>
            <Route path='/masterData' element={<MasterData api_url={API_URL} />}/>
          </Routes>
        </div>
      </Router>
  )
}

root.render(
  <App />
);
