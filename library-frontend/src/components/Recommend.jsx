import React from 'react'
import { useMutation, useQuery  } from "@apollo/client";
import { ME  } from "../queries.js";

const Recommend = (props) => {

  if (!props.show) {
    return null
  }

  const result = useQuery(ME)

  const me = result?.data || null
  console.log('me',me)

  if(result.loading){
    return(<div>Loading...</div>)
  }  

  return (
    <div>Recommend</div>
  )
}

export default Recommend