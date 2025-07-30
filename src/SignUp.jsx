import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    const [fName, setFName] = useState('')
    const [email, setEmail] = useState('')
    const[lName, setLName] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post("https://inventory-management-msitm-2d162cb631e2.herokuapp.com/signup/", {
            fname: fName,
            lname: lName,
            userId: userId,
            email: email,
            password: password
        })
        .then((response) => {
            if (response.status === 200) {
                const access = response.data
                if (access === 'ConfirmKey') {
                    navigate('/dashboard/', {state: {userId: userId}})
                } else {
                    alert('There is already a user with this username')
                }
            }
        })
    }

    return (
        <>
            <h1>Welcome!</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="userid">User ID: </label>
                <input 
                    type="text" 
                    onInput={e => setUserId(e.target.value)} 
                    required 
                    value={userId}/>
                <br />
                <label htmlFor="firstName">First Name: </label>
                <input 
                    type="text" 
                    onInput={e => setFName(e.target.value)} 
                    required 
                    value={fName}/>
                <br />
                <label htmlFor="lastName">Last Name: </label>
                <input 
                    type="text" 
                    onInput={e => setLName(e.target.value)} 
                    required 
                    value={lName}/>
                <br />
                <label htmlFor="email">Email: </label>
                <input 
                    type="email" 
                    onInput={e => setEmail(e.target.value)} 
                    required 
                    value={email}/>
                <br />
                <label htmlFor="password">Password: </label>
                <input 
                    type="password" 
                    onInput={e => setPassword(e.target.value)} 
                    required 
                    value={password}/>
                <br />
                <br />
                <button type='submit'>Submit</button>
            </form>
        </>
    )
}

export default SignUp