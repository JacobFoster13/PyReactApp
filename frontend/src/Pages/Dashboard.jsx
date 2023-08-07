import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import './../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { TextField } from '@fluentui/react';
import Button from '@mui/material/Button';
import Modal from 'react-modal';
import {Box, Typography, Modal as MuiModal, Grid} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';


const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

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

function Dashboard() {

  const navigate = useNavigate();
  let {state} = useLocation();
  const [rows, setRows] = useState([]);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [manageOpen, setManageOpen] = useState(false)
  const [manageProjId, setManageProjId] = useState('')
  const [manageProjName, setManageProjName] = useState('')

  useEffect(() => {
    if (state !== null) {
      // Function to fetch user projects from Flask server
      const fetchUserProjects = async () => {
        try {
          const response = await axios.post('/get_user_projects/', {
            params: {
              user: state.userId
            }
          });
          console.log(response.data);
          setRows(response.data);
        } catch (error) {
          console.error('Error fetching user projects:', error);
        }
      };
      // Call the function to fetch user projects when the component mounts
      fetchUserProjects();
    }    
  }, [state]);

  const columns = [
    { field: 'id', 
        headerName: 'Project ID', 
        width: 80, flex: 1, 
        align: 'center',
        headerAlign: 'center'
    },
    { field: 'projectName', 
        headerName: 'Project Name', 
        width: 200, 
        flex: 1, 
        align: 'center',
        headerAlign: 'center'
    },
    { field: 'manageProject', 
        headerName: "Manage Project", 
        width: 200, flex: 1,
        headerAlign: 'center', 
        align: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) => 
            <Button
                value={[params.row.id, params.row.projectName]}
                variant='contained' 
                onClick={openManage}
                >Manage Project
            </Button>}
  ];

  const [project, setProject] = useState({
    projectsData: [],
    projectName: '',
    projectDescription: '',
    projectUsers : [],
    userId: state == null ? '' : state.userId
  });

  function openCreateModal() {
    setCreateOpen(true);
  }

  function closeCreateModal() {
    setCreateOpen(false);
  }

  function openManage (e) {
    let value = e.target.value.split(",")
    setManageProjId(value[0])
    setManageProjName(value[1])
    setManageOpen(true)
  }
  function closeManage () {
    setManageOpen(false)
  }

  function joinProject() {
    // Call the API endpoint to join the project using axios
    axios.post('/join_project/', {
      params: {
        user: state.userId, // Replace with the actual user ID
        projectID: project.projectID
      }
    })
    .then(response => {
      const data = response.data;
      // Handle the response from the server
      alert(data.Message); // Show a message with the server response
      window.location.reload(false)
    })
    .catch(error => {
      console.error('Error joining project:', error);
      alert('An error occurred while joining the project');
    });
  }

  function createProject(){
    axios.post('/projects/', {
        projectName: project.projectName,
        projectDescription: project.projectDescription,
        creator: project.userId,
        user: project.userId
    })
    .then((response) => {
        if (response.status === 200) {
            console.log(response.data);
            // this needs to be altered to include state if this is the user flow we want to use
            // navigate('/hardwareSets')
            alert('Project successfully created')
            window.location.reload(false)
        }
    })
  }

  function handleChange(event){
    setProject( prevValues => {
      return { ...prevValues,[event.target.name]: event.target.value}
    });
    if(event.target.name === "projectName" || event.target.name === "projectDescription"){
      //setProjectID();
    }
  }

  return (
    <>
      {state !== null ?
        <div className="container projectContainer">  
            <div className="row">  
            <div className='col-md-12'>
                <div className='row'>
                <h2 className='projectHeading'>WELCOME TO YOUR PROJECTS DASHBOARD, {state.userId}</h2>
                </div>
                <div className="row">
                <div className='col-md-4'>
                    <div className='row'>
                    <TextField
                        label='Enter Project ID'
                        required
                        value = {project.projectID}
                        name='projectID'
                        onChange={(e)=> handleChange(e)}                
                    />
                    </div>
                </div>
                <div className='col-md-2'>
                    <br></br>
                    <div className='row'>
                        <Button 
                            className='loginButtons' 
                            variant='outlined' 
                            style={{color:'white', border:'1px solid white'}} 
                            onClick={joinProject}>
                                Join Project
                        </Button>              
                    </div>    
                </div>   
                </div>
                <div className='row'>
                <div className='col-md-4'>               
                    <br></br>
                    <div style={{marginTop: '1rem'}}>
                        <Button 
                            className='loginButtons' 
                            variant='outlined' 
                            style={{color:'white', border:'1px solid white'}} 
                            onClick={openCreateModal}>
                                Create Project
                        </Button>              
                    </div>                  
                </div>
                </div>
                <br></br>            
                <div className='row'>
                <div className='col-md-8 dataTable'>
                    <DataGrid 
                        rows={rows} 
                        columns={columns} 
                        pageSize={4}
                        sx={{width: '100%'}}
                        columnBuffer={0}
                    />
                    <MuiModal
                        open={manageOpen}
                        onClose={closeManage}
                    >
                        <Box sx={modalStyle}>
                            <Typography variant='h6'>Choose Action for Project: {manageProjId}</Typography>
                            <br />
                            <div>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Link 
                                            to="/hardware" 
                                            state= {{
                                                projectId: manageProjId,
                                                userId: state == null? '' : state.userId
                                                }} 
                                            className="projectLink">
                                                <Button variant='outlined'>Manage Resources</Button>
                                        </Link>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Link 
                                            to='/manageMembership' 
                                            state={{
                                                userId: state.userId, 
                                                projectId: manageProjId,
                                                projectName: manageProjName
                                                }}>
                                            <Button variant='outlined'>Manage Membership</Button>
                                        </Link>
                                    </Grid>
                                </Grid>
                            </div>
                        </Box>
                    </MuiModal>        
                </div>              
                </div>            
                <div className='row'>
                    <Modal
                        isOpen={createOpen}
                        onRequestClose={closeCreateModal}
                        style={customStyles}
                        contentLabel="Example Modal"
                    >                
                        <h4>Please enter below details to create a new project</h4>
                        <form>
                        <TextField
                            label='Project Name'
                            required
                            value={project.projectName}
                            name='projectName'
                            onChange={(e)=>handleChange(e)}
                        />
                        <TextField
                            label='Project Description'
                            required
                            multiline
                            value={project.projectDescription}
                            name='projectDescription'
                            onChange={(e)=>handleChange(e)}
                        />         
                        <br></br>                          
                        <Button variant='outlined' onClick={createProject}>Create Project</Button>
                        </form>
                    </Modal>
                </div>
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

export default Dashboard;