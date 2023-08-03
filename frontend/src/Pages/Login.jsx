import React, { useState } from 'react';
import './../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { TextField } from '@fluentui/react';
import Button from '@mui/material/Button';
import { FaCartArrowDown } from 'react-icons/fa';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const customStyles = {
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  position: 'absolute',
  width: '40%',
  maxWidth: '400px', // Added maxWidth to limit the width of the modal
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  outline: 'none',
  textAlign: 'center', // Center text and button
};

function Login() {
  const [user, setUserLogin] = useState({
    loginName: '',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  });

  const navigate = useNavigate();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalIsOpenSignUp, setIsOpenSignUp] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function openModalSignUp(){
    setIsOpenSignUp(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function afterOpenModalSignUp(){
    //references
  }

  function closeModalSignUp(){
    setIsOpenSignUp(false);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function saveLoginDetails () {
    axios.post('/signup/', {
      params: {
        user: user.loginName,
        first: user.firstName,
        last: user.lastName,
        email: user.email,
        password: user.password
      }
    })
    .then((response) => {
      if (response.status === 200) {
        console.log(response.data);
      }
    })
  }

  function verifyLoginDetails () {
    axios.post('/login/', {
      params: {
        user: user.loginName,
        password: user.password
      }
    })
    .then((response) => {
      if (response.status === 200) {
        console.log(response.data);
        if (response.data['Message'] === "Access Denied") {
          setIsOpen(true);
        } else {
          navigate('/ProjectPage', { state: { userId: user.loginName } });
        }
      }
    })
    .catch((error) => {
      console.error('Error during login:', error);
    });
  }

  function handleChange(event){
    setUserLogin( prevValues => {
      return { ...prevValues,[event.target.name]: event.target.value}
    })
  }

  return (
    <div className="container loginContainer">
      <div className="row">  
        <div className='col-md-4'></div>
        <div className='col-md-4 loginScreen'>
          <div className='row'>
            <h3 style={{color: 'white'}}>Sign In to access the APAD Project</h3>
          </div>
          <div className="row">
            <FaCartArrowDown size={100} style={{color: 'white', marginTop:'2rem'}}/>
          </div>
          <div className='row'>
            <TextField
              label='Login Name'
              required
              value = {user.loginName}
              name='loginName'
              onChange={(e)=> handleChange(e)}                
            />
          </div>
          <div className='row'>
            <TextField
              label='Password'
              required
              value= {user.password}
              name='password'
              type='password'
              onChange={(e)=> handleChange(e)}  
            />
          </div>
          <br></br>
          <div className='row'>
            <Button className='loginButtons' variant='outlined' style={{color:'white', border:'1px solid white'}} onClick={verifyLoginDetails}>Login</Button>              
          </div><br></br>
          <div className='row'>
            <Button className='loginButtons' variant='outlined' style={{color:'white', border:'1px solid white'}} onClick={openModalSignUp}>New user? Sign Up here</Button>              
            <Modal
                open={modalIsOpenSignUp}
                onClose={closeModalSignUp}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >   
                <Box sx={customStyles}>
                  <h4>Please enter below details to create account</h4>
                  <form>
                    <TextField
                      label='Login Name'
                      required
                      value={user.loginName}
                      name='loginName'
                      onChange={(e)=>handleChange(e)}
                    />
                    <TextField
                      label='First Name'
                      required
                      value={user.firstName}
                      name='firstName'
                      onChange={(e)=>handleChange(e)}
                    />
                    <TextField
                      label='Last Name'
                      required
                      value={user.lastName}
                      name='lastName'
                      onChange={(e)=>handleChange(e)}
                    />
                    <TextField
                      label='Email'
                      required
                      value={user.email}
                      type='email'
                      name='email'
                      onChange={(e)=>handleChange(e)}
                    />
                    <TextField
                      label='Password'
                      required
                      value={user.password}
                      type='password'
                      name='password'
                      onChange={(e)=>handleChange(e)}
                    />
                    <br></br>
                    <Button variant='outlined' onClick={saveLoginDetails}>Sign Up</Button>
                  </form>
                </Box>                             
              </Modal>
          </div>
        </div>
        <div className='col-md-4'></div>                
      </div>
      <Modal
        open={modalIsOpen}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={customStyles}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Access Denied
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Please try to login again.
          </Typography>
          <Button variant="outlined" onClick={closeModal} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default Login;