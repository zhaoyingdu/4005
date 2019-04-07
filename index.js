import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { createReducer } from 'redux-starter-kit'
import _ from 'lodash'
import {rootSaga} from './sagas'
import fs from 'fs'
const sagaMiddleware = createSagaMiddleware()
let stream
let timer = new Date()

export let init = {
  inspectors:{
      "inspector1": {
        id:'inspector1',
        state: 'idle',
        current: null,
      },
      "inspector2": {
        id:'inspector2',
        state: 'idle',
        current: null,
      }
    
  },
  machines:{
      "machine1":{
        state:'idle',
        outQueue:'p1'
      },
      "machine2":{
        state:'idle',
        outQueue:'p2'
      },
      "machine3":{
        state:'idle',
        outQueue:'p3'
      },

  },
  jobs:{
    "c1":{
      inspector:'inspector1',
    },
    "c2":{
      inspector:'inspector2',
    },
    "c3":{
      inspector:'inspector2',
    }
  },
  buffers:{
    'c1_m1':{
      length:0,
    },
    'c1_m2':{
      length:0,
    },
    'c1_m3':{
      length:0,
    },
    'c2_m2':{
      length:0,
    },
    'c3_m3':{
      length:0,
    }
  },
  products:{
    p1:[],
    p2:[],
    p3:[]
  },
  throughput:0
  
}

export const readJob = (state, action)=>{ 
  let newState = _.cloneDeep(state)
  let {job} = action
  let inspector = state.jobs[job].inspector
  newState.inspectors[inspector].state = 'busy'
  newState.inspectors[inspector].current = job
  return newState
}
export const block = (state, action)=>{
  let newState = _.cloneDeep(state)
  let {inspector} = action
  newState.inspectors[inspector].state = 'block'
 // _writeToStream(state) //inspector blocked
  return newState
}

export const assembling = (state, action)=>{
  let newState = _.cloneDeep(state)
  let {machine} = action
  newState.machines[machine].state = 'busy'
  //_writeToStream(state) //machine busy blocked
  return newState
}

export const idle = (state, action)=>{
  let newState = _.cloneDeep(state)
  let {machine} = action
  newState.machines[machine].state = 'idle'
  // _writeToStream(state) // machine idle
  return newState
}

export const unblock = (state, action)=>{
  let newState = _.cloneDeep(state)
  let {job, buffer} = action
  let blockedInspector = _.find(state.inspectors, {state:'block', current:job})
  if(!blockedInspector) return state
  newState.inspectors[blockedInspector.id].current=null
  newState.buffers[buffer].length--
  //_writeToStream(state) // inspector unblocked
  return newState
}

export const produce = (state, action)=>{
  const newState = _.cloneDeep(state)
  const {machine} = action
  const outQueue = state.machines[machine].outQueue
  newState.products[outQueue].push(outQueue)
  ++newState.throughput
  return newState
}

export const finish = (state, action)=>{
  stream.write('throughput'+state.throughput)
  return state
}

export const fillBuffer=(state, action)=>{
  const newState = _.cloneDeep(state)
  const {buffer} = action
  newState.buffers[buffer].length++ 
  //_writeToStream(state) // inspector unblocked
  return newState
}
export let rootReducer = createReducer(init,{
  'INSPECTING': readJob,
  'ASSEMBLING': assembling,
  'IDLE': idle,
  'BLOCK': block,
  'UNBLOCK':unblock,
  'ENQUEUE':fillBuffer,
  'COMPLETE_ASSEMBLE':produce,
  'FINISH':finish,
  'RESET':()=>init
})


export let store = createStore(
  rootReducer,
  applyMiddleware(sagaMiddleware)
)

stream = fs.createWriteStream('./output.txt')
stream.on('ready',()=>{
  sagaMiddleware.run(rootSaga)
})

/*const _writeToStream = (state)=>{
  let hour = timer.getUTCHours()
  let min = timer.getUTCMinutes()
  let sec = timer.getUTCSeconds()
  let {machines,inspectors,jobs, buffers} = state
  let {inspector1, inspector2} = inspectors
  let {machine1, machine2, machine3} = machines
  let {p1,p2,p3} = jobs
  let {c1_m1, c1_m2,c1_m3,c2_m2,c3_m3} = buffers
  stream.write(
`${machine1.state} ${machine2.state} ${machine3.state} ${inspector1.state} ${inspector2.state} \
${c1_m1.length} ${c1_m2.length} ${c1_m3.length} ${c2_m2.length} ${c3_m3.length} \
timestamp: ${hour}:${min}:${sec}\n`, 
    'utf-8'
  )
}*/


setTimeout(()=>{
  store.dispatch({type:'FINISH'})
  stream.end()
  process.exit(0)
}, 60000)
