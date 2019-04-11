import {h} from 'hyperapp'

const throughput = ({throughPut})=>{
  return(
    <div>
      <p>p1: {throughPut.p1}</p>
      <p>p2: {throughPut.p2}</p>
      <p>p3: {throughPut.p3}</p>
    </div>
  )
}

export default throughput