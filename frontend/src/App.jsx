import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Test from './Test';
import Login from './Login';
import Dashboard from './Dashboard';
import SignUp from './SignUp';
import Hardware from './Hardware';

function App () {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/test" element={<Test />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path='/hardware' element={<Hardware />} />
            </Routes>
        </>
    )
}

export default App;
