import React, {useState, useEffect} from 'react';
import axios from 'axios';

const Home = () => {
    const [data, setData] = useState([])

    useEffect(() => {
        axios.get('/users/')
            .then((res) => {
                setData(res.data)
            })
    }, [])
    return (
        <div>
            <h1>These are all the users</h1>
            {data.map((u) => (
                <div key={u._id}>
                    <h3>{u.fname} {u.lname}</h3>
                </div>
            ))}
        </div>
    )
}

export default Home