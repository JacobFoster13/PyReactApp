import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Test = () => {
    const [data, setData] = useState([])

    useEffect(() => {
        axios.get('/hardware/')
            .then((res) => {
                setData(res.data)
            })
    }, []);

  return (
    <div>
        <h1>These are all the hardware sets</h1>
        {data.map((h) => (
            <div key={h._id}>
                <h3>{h.name} with a ID of {h._id} and a capacity of {h.capacity}</h3>
            </div>
        ))}
    </div>
  )
}

export default Test