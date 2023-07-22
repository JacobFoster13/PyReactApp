import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {Button, Modal, TextField, Box, Grid, IconButton} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'
import axios from 'axios';

const Dashboard = () => {
    let { state } = useLocation();
    
    const [projName, setProjName] = useState('');
    const [projDesc, setProjDesc] = useState('');

    const [open, setOpen] = React.useState(false);
    const [openJoin, setOpenJoin] = useState(false);

    const [projects, setProjects] = useState([])
    const [userProjects, setUserProjects] = useState([])

    const [projToJoin, setProjToJoin] = useState(null)
    const [seeProj, setSeeProj] = useState(false)
    const [res, setRes] = useState(0);

    const handleOpen = () => setOpen(true);
    const handleOpenJoin = () => {setOpenJoin(true)}

    const handleCancel = () => {
        setProjDesc('')
        setProjName('')
        setOpen(false)
    };
    const handleCancelJoin = () => {
        setOpenJoin(false)
    }

    // FINDING A PROJECT BASED ON INPUT
    const handleSubmit = (e) => {
        e.preventDefault()
        setSeeProj(true)
        let res = projects.find((p) => p._id === parseInt(projToJoin))
        setRes(res)
    }

    // CREATE PROJECT
    const handleConfirm = () => {
        axios.post('/projects', {
            user: state.userId,
            name: projName,
            desc: projDesc
        })
        .then((response) => {
            if (response.status === 200) {
                alert("Project successfully created!")
            }
        })
        setOpen(false)
        window.location.reload(false)
    }

    // CONFIRMING PROJECT JOIN
    const handleConfirmJoin = () => {
        console.log('confirmed')
        setSeeProj(false)
        setOpenJoin(false)
        window.location.reload(false)
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      };

    useEffect(() => {
        if (state !== null) {
            axios.get("http://localhost:5000/projects", {
                params: {
                userId: state.userId
                }
            })
            .then((response) => {
                if (response.status === 200) {
                    setProjects(response.data.allProj)
                    setUserProjects(response.data.userProj)
                }
            })
        }
    }, [state])

    // ACTUALLY JOINING A PROJECT
    const joinProj = () => {
        if (state !== null) {
            axios.post('/joinproject/', {
                user: state.userId,
                project: res._id
            })
            .then((response) => {
                if (response.status === 200) {
                    alert("You have successfully joined project", res._id)
                }
            })
        }
    }

    // DYNAMIC REACT COMPONENTS
    const Name = () => {
        if (state !== null) {
            return <span>{state.userId}</span>
        }
    }

    const ProjJoin = (props) => {
        if (props.hidden) {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{res._id}</td>
                            <td>{res.name}</td>
                            <td><button onClick={joinProj}>Join Project</button></td>
                        </tr>
                    </tbody>
                </table>
            )
        }
    }

    return (
        <>
        {state !== null ? 
            <>
                <h1>Welcome to the Dashboard, <Name />!</h1>
                <hr />
                <Button variant="contained" onClick={handleOpen}>Create New Project</Button>
                <Button 
                    style={{marginLeft: '2%', backgroundColor: 'green'}} 
                    variant='contained'
                    onClick={handleOpenJoin}>
                        Join a New Project
                    </Button>
                <Modal
                    open={open}
                    onClose={handleCancel}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <h1>Create a New Project</h1>
                        <Grid spacing={2} container>
                            <Grid item xs={12}>
                                <TextField 
                                    required
                                    onChange={e => {
                                        e.preventDefault()
                                        setProjName(e.target.value)
                                    }}
                                    label='Project Name' />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    onChange={e => setProjDesc(e.target.value)} 
                                    style={{width: '100%'}} 
                                    multiline 
                                    rows={4} 
                                    label='Description' />
                            </Grid>
                            <Grid item xs={9}>
                                <Button onClick={handleCancel}>Cancel</Button>
                            </Grid>
                            <Grid item xs={2}>
                                <Button variant="contained" onClick={handleConfirm}>Done</Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Modal>

                <Modal
                    open={openJoin}
                    onClose={handleCancelJoin}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <h1>Join a New Project</h1>
                        <Grid spacing={2} container>
                            <Grid item xs={12}>
                                <form onSubmit={handleSubmit}>
                                    <TextField
                                        type='number'
                                        required
                                        label='Project ID'
                                        size='small'
                                        onChange={e => setProjToJoin(e.target.value)}
                                        inputProps={{
                                            min: 0
                                        }} />
                                    <IconButton type='submit'>
                                        <SearchIcon style={{fill: 'blue'}} />
                                    </IconButton>
                                </form>
                            </Grid>
                            <Grid item xs={12}>
                                <ProjJoin hidden={seeProj}/>
                            </Grid>
                            <Grid item xs={2}>
                                <Button variant="contained" onClick={handleConfirmJoin}>Done</Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Modal>
                <br />
                <br />
                {userProjects.length > 0 ? <table>
                    <thead>
                        <tr>
                            <th>Project ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userProjects.map((p) => (
                            <tr key={p._id}>
                                <td>{p._id}</td>
                                <td>{p.name}</td>
                                <td>{p.description}</td>
                                <td><Link to="/hardware" state={{project: p._id}}><button>Manage Resources</button></Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                        : 
                <h3>No Current Projects</h3>}
            </> : "Please Log In"}
        </>
    )
}

export default Dashboard