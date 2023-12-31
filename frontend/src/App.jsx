import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Hardware from './Pages/Hardware';
import Membership from './Pages/Membership';

function App () {
    return (
        <>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path='/hardware' element={<Hardware />} />
                <Route path='/manageMembership' element={<Membership />} />
            </Routes>
        </>
    )
}

export default App;
