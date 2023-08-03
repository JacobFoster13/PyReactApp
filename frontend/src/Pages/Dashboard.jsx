import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import './../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { TextField } from '@fluentui/react';
import Button from '@mui/material/Button';
import Modal from 'react-modal';
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

function Dashboard() {

  const navigate = useNavigate();
  let {state} = useLocation();
  const [rows, setRows] = useState([]);

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
    { field: 'id', headerName: 'Project ID', width: 100, 
      renderCell: (params) => 
      <Link to="/hardware" state= {{projectId: params.row.id,
        userId: state == null? '' : state.userId, projectName:params.row.projectName, projectDescription:params.row.projectDescription}} className="projectLink">
      {params.row.id}
    </Link>
    },
    { field: 'projectName', headerName: 'Project Name', width: 200 },
    { field: 'manageProject', headerName: "Manage Project", width: 300, 
        renderCell: (params) => 
            <Button
                variant='contained' 
                onClick={() => console.log(`clicked, id: ${params.row.id}`)}
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

  const [modalIsOpen, setIsOpen] = React.useState(false);
  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false);
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
      // If the join was successful, update the rows state to refresh the table
      if (data.Message === 'User successfully joined the project') {
        setRows(prevRows => [
          ...prevRows,
          {
            id: prevRows.length + 1,
            projectID: project.projectID,
            projectName: 'Project Name', // Replace with the actual project name
            hwSet1: '200',
            hwSet2: '230'
          }
        ]);
      }
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
                    <Button className='loginButtons' variant='outlined' style={{color:'white', border:'1px solid white'}} onClick={joinProject}>Join Project</Button>              
                    </div>    
                </div>   
                </div>
                <div className='row'>
                <div className='col-md-4'>               
                    <br></br>
                    <div style={{marginTop: '1rem'}}>
                    <Button className='loginButtons' variant='outlined' style={{color:'white', border:'1px solid white'}} onClick={openModal}>Create Project</Button>              
                    </div>                  
                </div>
                </div>
                <br></br>            
                <div className='row'>
                <div className='col-md-8 dataTable'>
                    <DataGrid rows={rows} columns={columns} pageSize={4} />          
                </div>              
                </div>            
                <div className='row'>
                <Modal
                    isOpen={modalIsOpen}
                    onAfterOpen={afterOpenModal}
                    onRequestClose={closeModal}
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