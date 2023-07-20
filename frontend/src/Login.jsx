import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    // const [access, setAccess] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/login/', {
            userId: userId,
            password: password
        })
        .then((response) =>{
            if (response.status === 200) {
                const access = response.data.message
                if (access === 'ConfirmKey') {
                    navigate('/dashboard/', {state: {userId: userId}})
                } else {
                    alert(`Access denied. Please try again.`)
                }
            }
        })
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="userid">User ID: </label>
                <input 
                    type="text" 
                    onChange={e => setUserId(e.target.value)} 
                    required
                    value={userId} />
                <br />
                <label htmlFor="password">Password: </label>
                <input 
                    type="password" 
                    onChange={e => setPassword(e.target.value)} 
                    required
                    value={password} />
                <br />
                <button type='submit'>Login</button>
                <Link to="/signup">
                    <p>Sign Up</p>
                </Link>
                
            </form>
        </div>
    )
}

export default Login