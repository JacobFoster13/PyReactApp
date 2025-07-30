import React, {useState, useEffect} from 'react';
import './../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { TextField } from '@fluentui/react';
import Button from '@mui/material/Button';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Hardware () {
  
  // hooks
  const navigate = useNavigate();
  let {state} = useLocation();

  // constants
  const [hardware, setHardware] = useState([]);
  let request = {};

  // custom functions
  useEffect(() => {
    if (state !== null) {
      axios.get('https://inventory-management-msitm-2d162cb631e2.herokuapp.com/hardware/')
      .then((response) => {
        if (response.status === 200) {
            setHardware(response.data)
        }
      })
    }
  }, [state]);

  const updateRequest = (e, id) => {
    let value = parseInt(e.target.value)
    if (isNaN(value)) {
        value = 0
    }
    request[`${id}`] = value
  }

  function checkIn () {
    axios.post('https://inventory-management-msitm-2d162cb631e2.herokuapp.com/manageHardware/', {
        user: state.userId,
        request: request,
        project: state.projectId,
        operation: 'return'
    })
    .then((response) => {
        if (response.data.Message === 'Success') {
            alert("Successfully checked in hardware")
            window.location.reload(false)
        } else {
            alert(response.data.Message)
        }
    })
  }

  function checkOut () {
    axios.post('https://inventory-management-msitm-2d162cb631e2.herokuapp.com/manageHardware/', {
        user: state.userId,
        request: request,
        project: state.projectId,
        operation: 'request',
    })
    .then((response) => {
        if (response.data.Message === 'Success') {
            alert("Successfully checked out hardware")
            window.location.reload(false)
        } else {
            alert(response.data.Message)
        }
    })
  }

  return (
    <>
        {
            state !== null ?
            <div className="container hwSetsContainer" style={{ height: "100vh" }}>  
                <Link
                    to="/dashboard"
                    state={{
                        userId: state.userId
                    }}>
                        <Button className='hwSetButton' variant='outlined'>Home</Button>
                </Link>
                <div className="row">  
                    <div className='col-md-12'>
                        <div className='row'>
                            <h2 className='hwSetsHeading'>PROJECT NAME: {state.projectName}</h2>
                            <h3 className='hwSetsHeading'>PROJECT ID: {state.projectId}</h3>
                        </div>
                        <br />         
                    <div className='row'>
                    <div className='col-md-12'>               
                        {hardware.map((item)=>{
                        return(
                            <div className='row' key={item._id}>
                            <div className='col-md-2 hardwareSetName'>
                                {item.name}
                            </div>
                            <div className='col-md-3'>
                                <TextField
                                    label='Capacity'
                                    value = {item.capacity}
                                    name='capacity'
                                    readOnly                           
                                />
                            </div>
                            <div className='col-md-3'>
                                <TextField
                                    label='Available'
                                    value = {item.capacity - item.checkedOut}
                                    name='Available'
                                    readOnly
                                />
                            </div>
                            <div className='col-md-3'>
                                <TextField
                                    label='Request'
                                    required
                                    name='Request'
                                    onChange={(e)=>updateRequest(e, item._id)}      
                                />
                            </div>
                        </div>
                        )
                        })}
                    </div>
                </div>
                <div className='row hwSetButtons'>
                    <Button className="hwSetButton" variant='outlined' onClick={checkIn}>Check in</Button>
                    <Button className="hwSetButton" variant='outlined' onClick={checkOut}>Check out</Button>
                </div>
                    <br></br>                     
                </div>
            </div>
        </div>
        :
        <>
            <h2 style={{color: 'white'}}>Please Log In</h2>
            <Button variant='contained' onClick={() => navigate('/')}>Return to Login</Button>
        </>}
    </>
  );
}

export default Hardware;