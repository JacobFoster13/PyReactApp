import { Grid, TextField, Typography, Button } from '@mui/material';
import axios from 'axios';
import React, {useEffect, useState} from 'react'
import { useLocation } from 'react-router-dom';

const Hardware = () => {
    let { state } = useLocation()
    const [data, setData] = useState([])
    let req = {};
    let ret = {};

    const handleRequest = (e, id, operation) => {
        let val = parseInt(e.target.value);
        if (val >= 0) {
            if (operation === 'request') {
                req[`${id}`] = val;
                console.log('req:', req)
            } else {
                ret[`${id}`] = val;
                console.log('ret', ret)
            }
        } else {
            alert("You must enter a positive amount of resources to request or return");
        }
        
    }

    const handleConfirm = () => {
        if ((Object.keys(req).length === 0) && (Object.keys(ret).length === 0)) {
            alert("Please provide inputs before requesting or returning resources")
        } else {
            // request more resources
            if (Object.keys(req).length > 0) {
                axios.post('/hardware/', {
                    hwReq: req
                })
                .then((response) => {
                    console.log(response.data)
                    if (response.data !== 'True') {
                        alert(response.data)
                    }
                })
                .catch((err) => console.log(err))
            } 

            // return resources
            if (Object.keys(ret).length > 0) {
                axios.post("/hardwareReturn/", {
                    hwReturn: ret
                })
                .then((response) => {
                    if (response.data !== 'True') {
                        alert(response.data)
                    }
                })
                .catch((err) => console.log(err.message))
            }
            window.location.reload(false)
        }
    }

    useEffect(() => {
        axios.get('/hardware/')
            .then((res) => {
                setData(res.data)
            })
    }, []);

  return (
    <div>
        <h1>Manage Resources for Project {state.project}</h1>
        <br />
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <Typography><strong>HW Set Name</strong></Typography>
            </Grid>
            <Grid item xs={2}>
                <Typography><strong>Capacity</strong></Typography>
            </Grid>
            <Grid item xs={2}>
                <Typography><strong>Availability</strong></Typography>
            </Grid>
            <Grid item xs={3}>
                <Typography><strong>Request Hardware</strong></Typography>
            </Grid>
            <Grid item xs={3}>
                <Typography><strong>Return Hardware</strong></Typography>
            </Grid>
        </Grid>
        <hr />
        {data.map((h) => (
            <Grid key={h._id} style={{marginBottom: '1%'}} direction='row' alignItems='center' alignContent='center' container spacing={2}>
                <Grid item xs={2}>
                    <Typography>{h.name}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography>{h.capacity}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography>{h.capacity - h.checkedOut}</Typography>
                </Grid>
                <Grid item xs={3}>
                    <TextField 
                        type='number' 
                        onChange={e => handleRequest(e, h._id, 'request')}
                        inputProps={{min: 0}} 
                        label="Request Hardware" />
                </Grid>
                <Grid item xs={3}>
                    <TextField 
                        type='number' 
                        onChange={e => handleRequest(e, h._id, 'return')}
                        inputProps={{min: 0}} 
                        label="Return Hardware" />
                </Grid>
            </Grid>
        ))}
        <Button variant='contained' onClick={handleConfirm}>Confirm Request</Button>
    </div>
  )
}

export default Hardware