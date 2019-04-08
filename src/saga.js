import {channel, buffers,runSaga, stdChannel } from 'redux-saga'
import {take, call, delay,fork,put, all, cancel, cancelled,spawn, takeLatest, takeEvery} from 'redux-saga/effects'
import fs from 'fs'
import _ from 'lodash'
import {EventEmitter} from 'events'
import {s1json,s22json,s23json,w1json,w2json,w3json} from './data/index'




const machineSaga = function*({buffers, machine}){  
  const watchers = ()=>{
    return buffers.map(buffer=>{
      return take('PUSH'+buffer.name)
    })
  }
  
  const workers = ()=>{
    return buffers.map(buffer=>{
      return put({type:'POP', buffer})
    })
  }
  while(true){
    yield all(watchers())
    yield all(workers())
    yield delay(_getProcessTime(machine))
  }
}


const watchInspectorComplete = (buffers)=>{
  const getBuffer = (job)=>{
    const buffersByJob = _getBuffersByJob(job, buffers)
    return getAvailableBuffer(buffersByJob)
  }
  const watcher = function*(){
    while(true){
      const {job,inspector} = yield take('COMPLETE')
      const buffer = yield call(getBuffer,job)
      if(!buffer){
        yield put({type:'BLOCK', inspector})
      }else{
        yield put({type:'PUSH'+buffer.name, buffer})
        buffer.length++
        yield put({type:inspector, buffer})
      }
    }
  }
  return watcher
}

const watchPool = ()=>{
  let pool = []
  const notify = function*(){
    while(true){
      const {buffer} = yield take('POP')
      buffer.length--
      const {inspector} = buffer
      if(pool.includes(inspector)){
        _.remove(pool, blocked=>blocked === inspector)
        yield put({type:inspector, buffer})
      }
    }
  }
  const wait = function*(){
    while(true){
      const {inspector} = yield take('BLOCK')
      pool.push(inspector)
    }
  }
  const watcher = function*(){
    yield fork(wait)
    yield fork(notify)
  }

  return watcher
}

export const inspectorSaga = function*({jobs, buffers, inspector}){
  while(true){
    const job = jobs[_.random(0,jobs.length-1)]
    yield delay(_getProcessTime(inspector,job)) 
    yield put({type:'COMPLETE', job,inspector})
    yield take(inspector)
  }
}

export const _getBuffersByJob = (job, buffers)=>{
  return _.filter(buffers, {job:job})
}

export const getAvailableBuffer = (buffers)=>{
  if(_.every(buffers, ({length})=>length===2)) 
  {
    return null
  }
  return  _.minBy(buffers, 'length')
}

const _getProcessTime = (name, ...args)=>{
  const {job} = args
  switch(name){
    case 'machine1':
      return 6000//_.sample(w1json)
    case 'machine2':
      return 6000// _.sample(w2json)
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


const root = function*(){
  const rootTask = yield fork(rootSaga)
  yield delay(60000)
  yield cancel(rootTask)
}




const emitter = new EventEmitter()
const createSagaIO = (emitter, getStateResolve) => {
  const channel = stdChannel();
  const sagaMonitor = {
    effectTriggered:({effect, parentEffectId, effectId})=>{
      //console.log(`pid: ${effectId}, ppid: ${parentEffectId}, effect: ${JSON.stringify(effect)}\n`)
      //monitorStream.writable
        //? _.noop()//monitorStream.write(`pid: ${effectId}, ppid: ${parentEffectId}, effect: ${JSON.stringify(effect)}\n`)
        //: _.noop()
    }
  }
  
  emitter.on("action", channel.put);

  return {
    channel,
    dispatch: output => {
      emitter.emit("action", output);
    },
    getState: () => {
      "sampleValue";
    },
    sagaMonitor
  };
};



export const rootSaga = function*(){
  try{
    const lengthedBuffers = [
      {length:0, name:'c1_m1', job:'c1', machine:'machine1', inspector:'inspector1'},
      {length:0, name:'c1_m2', job:'c1', machine:'machine2', inspector:'inspector1'},
      {length:0, name:'c1_m3', job:'c1', machine:'machine3', inspector:'inspector1'},
      {length:0, name:'c2_m2', job:'c2', machine:'machine2', inspector:'inspector1'},
      {length:0, name:'c3_m3', job:'c3', machine:'machine3', inspector:'inspector1'},
    ]

    yield fork(watchInspectorComplete(lengthedBuffers))
    yield fork(watchPool())

    yield spawn(inspectorSaga, {jobs:['c1'], buffers:_.at(lengthedBuffers,[0,1,2]), inspector:'inspector1'}) //inspector1
   yield fork(inspectorSaga, {jobs:['c2','c3'], buffers:_.at(lengthedBuffers,[3,4]), inspector:'inspector2'}) //inspector2
    yield spawn(machineSaga, {buffers: _.at(lengthedBuffers,[0]), machine:'machine1'}) //machine1
   yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[1,3]), machine:'machine2'}) //machine1
   yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[2,4]), machine:'machine3'}) //machine1
  }finally{
    if(yield cancelled()){
      fs.writeFileSync('./data.json', JSON.stringify(data))
    }
  }
}



runSaga(
  createSagaIO(emitter),
  root
)