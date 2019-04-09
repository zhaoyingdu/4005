import {runSaga, stdChannel } from 'redux-saga'
import {createStore} from 'redux'
import {take, call, delay,fork,put, all, cancel, cancelled,race, takeEvery, takeMaybe} from 'redux-saga/effects'
import fs from 'fs'
import _ from 'lodash'
import {EventEmitter} from 'events'
import {s1json,s22json,s23json,w1json,w2json,w3json} from './data/index'
import Observer from './performance'

const observer = Observer()
const BLOCKEDINDEFINITE = 60000000
const lengthedBuffers = [
  {length:0, name:'c1_m1', job:'c1', machine:'machine1', inspector:'inspector1'},
  {length:0, name:'c1_m2', job:'c1', machine:'machine2', inspector:'inspector1'},
  {length:0, name:'c1_m3', job:'c1', machine:'machine3', inspector:'inspector1'},
  {length:0, name:'c2_m2', job:'c2', machine:'machine2', inspector:'inspector1'},
  {length:0, name:'c3_m3', job:'c3', machine:'machine3', inspector:'inspector1'},
]
const machineSaga = function*({buffers, machine}){  
  let threadId = 0
  const incomingJobWatchers = buffers.map(
    buffer=>{
      return take(`PUSH-${buffer.machine}-${buffer.job}`)
    }
  )
  const jobCompleteNotifiers = buffers.map(
    buffer=>{
      return put({type:`UNBLOCK-${buffer.inspector}`, buffer})
    }
  )
  

  const runThread = function*(){
    while(true){
      yield all(incomingJobWatchers)
      yield delay(_getProcessTime(machine))
      yield all(jobCompleteNotifiers)
    }
  }

 
  const jobCompleteNotifier = ()=>{
    return buffers.map(buffer=>{
      return put({type:`POP-${buffer.inspector}`, buffer})
    })
  }

  const jobTaker = function*(){
    while(true){
      yield all(incomingJobWatchers())
      yield put({type:`READY-${machine}`})
    }
  }

  const jobReadyTaker = function*(){
    const workerThread = function*(curThreadId){
      const pid = curThreadId
      if(pid !== 0){
        console.log(`TAKING COMPLETE-${machine}-${pid-1}`)
        yield take(`COMPLETE-${machine}-${pid-1}`, {popedBuffers:buffers})
        console.log(`TAKEN COMPLETE-${machine}-${pid-1}`)
      }
      const time = _getProcessTime(machine)
      console.log(time)
      yield delay(time)
      console.log(`PUTTING COMPLETE-${machine}-${pid}`)
      yield put({type:`COMPLETE-${machine}-${pid}`})
      //console.log(lengthedBuffers)

      yield all(jobCompleteNotifier())
    }
    while (true){
      yield take(`READY-${machine}`)
      yield fork(workerThread, threadId)
      threadId++
    }  
  }

  //yield fork(jobReadyTaker)
  yield fork(runThread)
  /*while(true){
    yield delay(2000)
    yield put({type:`PUSH-machine1-c1`})
  }*/

 
}

export const inspector1Saga = function*(){
  //process blocked, 
  //thread suspending
  let blocked = false
  yield takeEvery(`POP-${inspector}`, function*({buffer}){   
    buffer.length--
    if(blocked){
      yield put({type:`UNBLOCK-${inspector}`, buffer})
      blocked = false
    }
  }) 

  while(!blocked){

  }

}


export const inspectorSaga = function*({jobs,buffers, inspector}){
  let threadId = 0
  let blocked=false

  yield takeEvery(`POP-${inspector}`, function*({buffer}){   
    buffer.length--
    if(blocked){
      yield put({type:`UNBLOCK-${inspector}`, buffer})
      blocked = false
    }
  }) //decrement buffer on every POP call

  const getBuffer = (job)=>{
    const buffersByJob = _getBuffersByJob(job, buffers)
    return getAvailableBuffer(buffersByJob)
  }
  
  const takeAndInspect = function*(pid){
    const job = jobs[_.random(0,jobs.length-1)]
    if(pid!==0){
      yield take(`COMPLETE-${inspector}-${pid-1}`) //take previous process complete
    }

    yield delay(_getProcessTime(inspector,job)) 
    const buffer = yield call(getBuffer,job)

    if(!buffer){
      yield put({type:`BLOCKED-${inspector}`, job, pid})
      blocked=true
    }else{
      yield put({type:`COMPLETE-${inspector}`, buffer}) 
      yield put({type:`COMPLETE-${inspector}-${pid}`, buffer}) 
      console.log('completing '+pid)
      //console.log(`${inspector} complete ${buffer.job}`)
      buffer.length++
    }
    console.log(pid+' start')

  }

  yield fork(function*(){
    while(true){
    yield delay(1000)
    yield put({type:`POP-${inspector}`, buffer:buffers[0]})
    }
  })


  const runThreads = function*(){
    let pid = 0
    try{
      while(true){
        //starting a new inspecting process
        console.log(`thread ${pid} started`)
        
        const job = jobs[_.random(0,jobs.length-1)] // getting job from the job pool
        yield delay(_getProcessTime(inspector,job)) // mock inspection delay
        //yield delay(3000)

        const buffer = yield call(getBuffer,job) // check if there is available buffer
        if(!buffer){
          /** 
           * Not finding vailable buffer, all buffers paired with the job at hand is full
           * Send block event to the main process(see reference line-'inspection block')
           * This thread will be cancelled after the main thread receive this block event()
           */ 
          yield put({type:'BLOCK'})
          console.log('blocking thread')
        }else{
          /**
           * Found available buffer to dispatch the job.
           * Send a push event to the corresponding machine process
           */
          yield put({type:`PUSH-${buffer.machine}-${buffer.job}`, buffer})
        }
        console.log(`thread ${pid} completed`)
        pid++
      }
    }finally{
      if (yield cancelled()) {
        /**
         * This thread is canceled because buffer is full.
         * Since this thread would not be able to pushing 
         * the job to paired buffer.(thread is cancelled)
         * we would pass the job to the main thread and let 
         * it push it later when the inspector is unblocked.
         */
        yield put({type:'BLOCKED_JOB', pid})
        console.log(`thread ${pid} canceled`)
      }
    }
  }

  const main = function*(){
    /** 
     * This thread's job is to spawn inspecting thread on init
     * Then listen for block event, upon receiving, the current running inspecting process is canceled('halted')
     * Then listen for unblock event, upon receiving, spawn a new inspecting thread.
    */
    while(true){
      let threadTask = yield fork(runThreads)
      yield take(`BLOCK_${inspector}`)
      yield cancel(threadTask)
      const {job} = yield take('BLOCKED_JOB')
      //console.log(`blocked job ${pid}`)
      yield take(`UNBLOCK_${inspector}`)

      /**
       * we would do a new search on available buffers, 
       * this is tailored for inspector1, because it has
       * multiple 'sink' buffers and has a priority principle,
       * unlike inspector2, every job is paired with only one buffer
       */
      const buffer = yield call(getBuffer,job)
      yield put({type:`PUSH-${buffer.machine}-${buffer.job}`, buffer})
    }
  }

  yield fork(main)

  /*while(true){
    yield delay(6000)
    //yield put({type:'BLOCK'})
    //yield delay(6000)
    console.log('resuming thread')
    yield put({type:'UNBLOCK'})
  }*/

  /*while(true){
    /*
    let workerThread = yield fork(takeAndInspect, threadId)
    console.log('forked')
    let {type, buffer, job, pid} = yield take([`BLOCKED-${inspector}`, `COMPLETE-${inspector}`])
    if(type.startsWith('BLOCKED')){
        //yield cancel(workerThread)
        //threadId = 0
        const [unblocked, delayReturn] = yield race([
        //buffer = call(loopOver, job),
        take(`UNBLOCK-${inspector}`),
        delay(BLOCKEDINDEFINITE)
      ])

      if(!delayReturn){
        console.log(buffers)
        buffer = getBuffer(job)
        console.log(pid)
        yield put({type:`COMPLETE-${inspector}-${pid}`, buffer}) 
      }

      console.log(`${inspector} unblocked -${buffer}`)
    }else{
      yield put({type:`PUSH-${buffer.machine}-${buffer.job}`, buffer})
      console.log(`${inspector} dispatched ${buffer.job}`)
      threadId++
    }
  
  }*/
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
      return 6000;// _.sample(w1json)
    case 'machine2':
      return 6000// _.sample(w2json)
    case 'machine3':
      return 6000//_.sample(w3json)
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
  yield call(()=>observer.start())
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
    

    //yield fork(watchInspectorComplete(lengthedBuffers))
    //yield fork(watchPool())

    yield fork(inspectorSaga, {jobs:['c1'],  buffers:_.at(lengthedBuffers,[0,1,2]), inspector:'inspector1'}) //inspector1
    //yield fork(inspectorSaga, {jobs:['c2','c3'],  inspector:'inspector2'}) //inspector2
    yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[0]), machine:'machine1'}) //machine1
    //yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[1,3]), machine:'machine2'}) //machine1
    //yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[2,4]), machine:'machine3'}) //machine1
  }finally{
    if(yield cancelled()){
      const data = observer.end()
      fs.writeFileSync('./data.json', JSON.stringify(data))
    }
  }
}

runSaga(
  createSagaIO(emitter),
  root
)