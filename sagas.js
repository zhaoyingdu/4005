import { channel,buffers,runSaga, stdChannel } from 'redux-saga'
import {take, call, delay,fork,put, all} from 'redux-saga/effects'
import {
  performance,
  PerformanceObserver
} from 'perf_hooks'
import fs from 'fs'
import _ from 'lodash'

const emitter = new EventEmitter()
const channel = stdChannel()
emitter.on("action", channel.put)

const myIO = {
  // this will be used to orchestrate take and put Effects
  channel,
  // this will be used to resolve put Effects
  dispatch(output) {
    emitter.emit("action", output)
  },
  // this will be used to resolve select Effects
  getState() {
    return state
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
  //console.log(list.getEntriesByType('mark').length)
  performance.clearMarks()
  //performance.clearMeasures()
});
obs.observe({ entryTypes: ['measure'], buffered: true });



export const rootSaga = function*(){
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
}

const machineSaga = function*({buffers, machine}){
  while(true){
    yield put({type:'IDLE', machine})
    performance.mark(MACHINE_IDLE_START_MARK)
    let jobs = yield all(buffers.map(buffer=>take(buffer.buffer)))
    performance.mark(MACHINE_IDLE_END_MARK)
    performance.measure(machine,MACHINE_IDLE_START_MARK, MACHINE_IDLE_END_MARK)
    for(let job of jobs){
      const buffer = _.find(buffers, {job:job})
      buffer.length--
      yield put({type:'UNBLOCK', job, buffer:buffer.name})
    }
    yield put({type:'ASSEMBLING', machine})
    yield delay(_getProcessTime())
    yield put({type:'COMPLETE_ASSEMBLE', machine})
  }
}


const inspectorSaga = function*({jobs, buffers, inspector}){
  while(true){
    const job = jobs[_.random(0,jobs.length-1)]
    const buffersByJob = _getBuffersByJob(job, buffers)
    yield put({type:'INSPECTING', job})
    yield delay(_getProcessTime()) 
    let minBuffer = getAvailableBuffer(buffersByJob)
    if(!minBuffer) { 
      performance.mark(INSPECTOR_BLOCK_START_MARK)
      yield put({type:'BLOCK', inspector}) 
      yield take(action=>action.type==='UNBLOCK'&& action.job === job)       
      performance.mark(INSPECTOR_BLOCK_END_MARK)
      performance.measure(inspector,INSPECTOR_BLOCK_START_MARK, INSPECTOR_BLOCK_END_MARK)
    } 
    minBuffer = getAvailableBuffer(buffersByJob)
    yield put(minBuffer.buffer, job)
    yield put({type:'ENQUEUE', buffer:minBuffer.name})
    minBuffer.length++
  }
}

const _getBuffersByJob = (job, buffers)=>{
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

const _getProcessTime = (name)=>{
  return _.random(2000,3000, false)
}

process.on('beforeExit',()=>{
  fs.writeFileSync('./data.json', JSON.stringify(data))
})