import { Button, Stack, TextField } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import axios from 'axios'
import {Box, Typography, Modal, Grid} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const modalStyle = {
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

const Membership = () => {
    let { state } = useLocation()
    let navigate = useNavigate()

    const [users, setUsers] = useState([])
    const [creator, setCreator] = useState(false)
    const [open, setOpen] = useState(false)
    const [creatorOpen, setCreatorOpen] = useState('')
    const [newCreator, setNewCreator] = useState('')
    const [verifyCreator, setVerifyCreator] = useState('')
    const [deleteProj, setDeleteProj] = useState('')

    const handleCreator = (e) => {
        if (newCreator === verifyCreator) {
            setCreatorOpen(false)
            axios.post('/makeCreator', {
                newCreator: newCreator,
                project: state.projectId
            })
            .then((response) => {
                if (response.data.Message === 'ConfirmKey') {
                    alert('New Creator Set')
                    window.location.reload(false)
                }
            })
        }
    }

    const handleRemove = (e) => {
        let user = e.target.value
        alert(`Remove User: ${user} from Project`)
        axios.post('/removeMember/', {
            user: e.target.value,
            project: state.projectId
        })
        .then((response) => {
            console.log(response.data)
            if (response.data.Message === 'ConfirmKey') {
                alert(`User was removed from project`)
                window.location.reload(false)
            }
        })
    }

    const handleLeave = (e) => {
        alert(`I, ${e.target.value}, want to leave this project`)
        axios.post('/removeMember', {
            user: e.target.value,
            project: state.projectId
        })
        .then((response) => {
            if (response.data.Message === 'ConfirmKey') {
                alert("Successfully left the project")
                navigate('/dashboard', {state: {userId: response.data.user}})
            }
        })
    }

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const openCreator = (e) => {
        setNewCreator(e.target.value)
        setCreatorOpen(true)
    }

    const closeCreator = () => {
        setCreatorOpen(false)
    }

    const handleDelete = () => {
        if (state.projectName === deleteProj) {
            alert(`${state.projectName} will be deleted`)
        } else {
            alert('Incorrect project name entry')
        }
        setOpen(false)
    }

    const columns = [
        { field: 'id', headerName: 'User ID', align: 'center', headerAlign: 'center', flex: 1 },
        { field: 'name', headerName: 'Name', align: 'center', headerAlign: 'center', flex: 1 },
        { field: 'remove', headerName: 'Remove', align: 'center', headerAlign: 'center', flex: 1, sortable: false,
            renderCell: (params) => 
            <>
                { creator ?
                    <Button 
                        variant='contained'
                        value={params.row.id}
                        onClick={handleRemove}
                        style={{ backgroundColor: 'red' }}>
                            Remove
                    </Button>
                    :
                    <Button 
                        variant='contained'
                        value={params.row.id}
                        onClick={handleLeave}
                        style={{ backgroundColor: 'red' }}>
                            Leave
                    </Button>
                }
            </>          
        },
        { field: 'creator', headerName: 'Make Creator', align: 'center', headerAlign: 'center', flex: 1, sortable: false,
            renderCell: (params) => 
            <>
                { creator ? 
                    <>
                        <Button 
                            variant='contained'
                            value={params.row.id}
                            onClick={openCreator}
                            style={{ backgroundColor: 'green' }}>
                                Make Creator
                        </Button>
                        <Modal
                                open={creatorOpen}
                                onClose={closeCreator}
                            >
                                <Box sx={modalStyle}>
                                    <Typography variant='h6'>
                                        To make this user the creator, you must type their User ID <strong>{newCreator}</strong>
                                    </Typography>
                                    <br />
                                    <form>
                                        <TextField
                                            required
                                            label='User'
                                            onChange={(e) => setVerifyCreator(e.target.value)}
                                        />
                                        <br /><br />
                                        <Button variant='contained' onClick={handleCreator}>Make Creator</Button>
                                    </form>
                                </Box>
                            </Modal>
                    </>
                    :
                    <></>
                }
            </>
        }
    ]

    useEffect(() => {
        if (state !== null) {
            axios.post("/membership", {
                project: state.projectId,
                user: state.userId
            })
            .then((response) => {
                if (response.status === 200) {
                    setUsers(response.data.users)
                    setCreator(response.data.isCreator)
                }
            })
        }
    }, [state])

    return (
        <>
            {
                state !== null ?
                <div style={{ color: 'white'}}>
                    <h1>Membership Page</h1>
                    <h2>User: {state.userId}</h2>
                    <h2>Project ID: {state.projectId}</h2>
                    <h2>Project Name: {state.projectName}</h2>
                    <br />
                    <Grid container sapcing={2}>
                        <Grid item xs={6}>
                            <DataGrid
                                className='dataTable'
                                columns={columns}
                                rows={users}
                                slots={{
                                    noRowsOverlay: () => (
                                        <Stack height='100%' alignItems='center' justifyContent='center'>
                                            No Other Users
                                        </Stack>)
                                }}
                            />
                        </Grid>
                    </Grid>
                    <br />
                    <br />
                    { creator ? 
                        <>
                            <Button 
                                style={{ margin: '2%', backgroundColor: 'red'}}
                                variant='contained'
                                onClick={handleOpen}>
                                    Delete Project
                            </Button>
                            <Modal
                                open={open}
                                onClose={handleClose}
                            >
                                <Box sx={modalStyle}>
                                    <Typography variant='h6'>
                                        To delete this project, you must type the project name <strong>{state.projectName}</strong>
                                    </Typography>
                                    <br />
                                    <form>
                                        <TextField
                                            required
                                            label='Project Name'
                                            onChange={(e) => setDeleteProj(e.target.value)}
                                        />
                                        <br /><br />
                                        <Button variant='contained' onClick={handleDelete}>Confirm Delete</Button>
                                    </form>
                                </Box>
                            </Modal>
                        </>
                        :
                        <></>}
                        <br />
                </div>
            :
                <>
                    <h2>Please Log In</h2>
                    <Button onClick={navigate('/')}>Login Page</Button>
                </>
            }
        </>
    )
}

export default Membership