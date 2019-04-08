import {channel, buffers,runSaga, stdChannel } from 'redux-saga'
import {take, call, delay,fork,put, all, cancel, cancelled} from 'redux-saga/effects'
import {
  performance,
  PerformanceObserver
} from 'perf_hooks'
import fs from 'fs'
import _ from 'lodash'
import {EventEmitter} from 'events'
import {s1json,s22json,s23json,w1json,w2json,w3json} from './data/index'


const emitter = new EventEmitter()
const iochannel = stdChannel()


emitter.on("action", iochannel.put)
export const myIO = {
  iochannel,
  dispatch(output) {
    emitter.emit("action", output)
  },
  getState() {
    throw new Error('no need to use store')
  }
}


const MACHINE_IDLE_START_MARK = `machine_idle_start`
const MACHINE_IDLE_END_MARK = `machine_idle_end`
const INSPECTOR_BLOCK_START_MARK = `inspector_block_start`
const INSPECTOR_BLOCK_END_MARK = `inspector_block_end`

var data = [
  {class: "inspector1", label: "i1 block", times: [], duration:0},
  {class: "inspector2", label: "i2 block", times: [], duration:0},
  {class: "machine1", label: "m1 idle ", times: [], duration:0},
  {class: "machine2", label: "m2 idle ", times: [], duration:0},
  {class: "machine3", label: "m3 idle ", times: [], duration:0}
];
const obs = new PerformanceObserver((list, observer) => {
  const measures = list.getEntriesByType('measure')
  //console.log(measures.length)
  for(let measure of measures){
    const row = _.find(data,{class: measure.name})
    _.invoke(row, 'times.push',{start_time:measure.startTime, end_time:measure.startTime+measure.duration})
    row.duration+=measure.duration
    //console.log(row)
  }
  performance.clearMarks()
  //performance.clearMeasures()
});
obs.observe({ entryTypes: ['measure'], buffered: true });



export const rootSaga = function*(){
  try{
  const c1_m1 = yield call(channel, buffers.fixed(2))
  const c1_m2 = yield call(channel, buffers.fixed(2))
  const c1_m3 = yield call(channel, buffers.fixed(2))
  const c2_m2 = yield call(channel, buffers.fixed(2))
  const c3_m3 = yield call(channel, buffers.fixed(2))

  const lengthedBuffers = [
    {buffer:c1_m1, length:0, name:'c1_m1', job:'c1'},
    {buffer:c1_m2, length:0, name:'c1_m2', job:'c1'},
    {buffer:c1_m3, length:0, name:'c1_m3', job:'c1'},
    {buffer:c2_m2, length:0, name:'c2_m2', job:'c2'},
    {buffer:c3_m3, length:0, name:'c3_m3', job:'c3'},
  ]

  yield fork(inspectorSaga, {jobs:['c1'], buffers:_.at(lengthedBuffers,[0,1,2]), inspector:'inspector1'}) //inspector1
  yield fork(inspectorSaga, {jobs:['c2','c3'], buffers:_.at(lengthedBuffers,[3,4]), inspector:'inspector2'}) //inspector2
  yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[0]), machine:'machine1'}) //machine1
  yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[1,3]), machine:'machine2'}) //machine1
  yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[2,4]), machine:'machine3'}) //machine1
}finally{
  if(yield cancelled()){
    fs.writeFileSync('./data.json', JSON.stringify(data))
  }
}
}

const machineSaga = function*({buffers, machine}){
  while(true){

    performance.mark(MACHINE_IDLE_START_MARK)
    let jobs = yield all(buffers.map(buffer=>take(buffer.buffer)))
    performance.mark(MACHINE_IDLE_END_MARK)
    performance.measure(machine,MACHINE_IDLE_START_MARK, MACHINE_IDLE_END_MARK)

    for(let job of jobs){
      const buffer = _.find(buffers, {job:job})
      if(machine==='machine1'){
        console.log(buffer.name+' '+buffer.length+' '+job) 
      }
    yield put({type:'UNBLOCK', job/*, buffer:buffer.name*/})
      buffer.length--

    }
    yield delay(_getProcessTime(machine))

  }
}


export const inspectorSaga = function*({jobs, buffers, inspector}){
  if(inspector === 'inspector1'){
    console.log(buffers)
  }
  while(true){
    const job = jobs[_.random(0,jobs.length-1)]
    const buffersByJob = _getBuffersByJob(job, buffers)

    yield delay(_getProcessTime(inspector,job)) 

    let minBuffer = yield call(getAvailableBuffer,buffersByJob)
    if(!minBuffer) { 
      performance.mark(INSPECTOR_BLOCK_START_MARK)
      console.log('blocked '+inspector+buffers[0].length + job)
      yield take(action=>action.type==='UNBLOCK'&& action.job === job)  
      console.log('unblocked '+inspector)     
      performance.mark(INSPECTOR_BLOCK_END_MARK)
      performance.measure(inspector,INSPECTOR_BLOCK_START_MARK, INSPECTOR_BLOCK_END_MARK)
    } 
    minBuffer = getAvailableBuffer(buffersByJob)

    yield put(minBuffer.buffer, job)
    minBuffer.length++
  }
}

export const _getBuffersByJob = (job, buffers)=>{
  return _.filter(buffers, {job:job})
}

export const getAvailableBuffer = (buffers)=>{
  if(_.every(buffers, ({length})=>length===2)) 
  {
    //console.log(buffers)
    return null
  }
  return  _.minBy(buffers, 'length')
}

const _getProcessTime = (name, ...args)=>{
  const {job} = args
  switch(name){
    case 'machine1':
      return _.sample(w1json)
    case 'machine2':
      return _.sample(w2json)
    case 'machine3':
      return _.sample(w3json)
    case 'inspector1':
    return _.sample(s1json)
    case 'inspector2':
      if(job === 'c2'){
        return _.sample(s22json)
      }else{
        return _.sample(s23json)
      }
    default:
      throw new Error('error... identifier not recognized')
  }
}

process.on('beforeExit',()=>{
  fs.writeFileSync('./data.json', JSON.stringify(data))
})


const root = function*(){
  const rootTask = yield fork(rootSaga)
  yield delay(60000)
  yield cancel(rootTask)
}

runSaga(
  myIO,
  root
)