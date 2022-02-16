import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Settings } from './Settings';

ReactDOM.render(
  <React.StrictMode>
    <MemoryRouter>
      <Routes>
        {/* 先用着，以后加新功能方便 */}
        <Route path='/' element={<App />} />
        <Route path='conf' element={<Settings />} />
      </Routes>
    </MemoryRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
