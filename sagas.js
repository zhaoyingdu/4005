import { channel,buffers } from 'redux-saga'
import {take, call, delay,fork,put, all} from 'redux-saga/effects'
import _ from 'lodash'


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
    let jobs = yield all(buffers.map(buffer=>take(buffer.buffer)))
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
    let minBuffer = _getAvailableBuffer(buffersByJob)
    if(!minBuffer) { 
      yield put({type:'BLOCK', inspector}) 
      yield take(action=>action.type==='UNBLOCK'&& action.job === job)       
    } 
    minBuffer = _getAvailableBuffer(buffersByJob)
    yield put(minBuffer.buffer, job)
    yield put({type:'ENQUEUE', buffer:minBuffer.name})
    minBuffer.length++
  }
}

const _getBuffersByJob = (job, buffers)=>{
  return _.filter(buffers, {job:job})
}

const _getAvailableBuffer = (buffers)=>{
  if(_.every(buffers, ({length})=>length===2)) 
  {
    console.log(buffers)
    return null
  }
  return  _.minBy(buffers, 'length')
}

const _getProcessTime = (name)=>{
  return _.random(2000,3000, false)
}
