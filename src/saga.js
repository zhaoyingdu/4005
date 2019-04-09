import {runSaga, stdChannel, channel, buffers as sagaBuffer } from 'redux-saga'
import {createStore} from 'redux'
import {take, call, delay,fork,put, all, cancel, cancelled,race, takeEvery, takeMaybe} from 'redux-saga/effects'
import fs from 'fs'
import _ from 'lodash'
import {EventEmitter} from 'events'
import {s1json,s22json,s23json,w1json,w2json,w3json} from './data/index'
import Observer from './performance'

const observer = Observer() // performance mearurer that is used to measure idle/block durations

const machineSaga = function*({buffers, machine}){  
  const channelBuffer = sagaBuffer.fixed(2)
  const channelFromBuffer = yield channel(channelBuffer)

  /**
   * Helper function that watch for push event on the buffers
   * this machine is interested.
   * For machine1, this would be one buffer, and event resolve 
   * immediately, and return to main thread.
   * For machine2, we will be waiting until job c2 and c3 are
   * both available then return to main thread. Same logic applies to machine3 
   */
  const incomingJobWatchers = ()=>buffers.map(
    buffer=>{
      return take(`PUSH_${buffer.machine}-${buffer.job}`)
    }
  )

  /**
   * Helper function that when invoked will decrement
   * the pseudo buffer's length (because a job has been taken
   * from the buffer). Then notify the inspector who is paired
   * with this buffer that we have taken one job.
   * If the inspector is blocked, it will be unblock and resume.
   * if the inspector is not blocked, the notification is silently 
   * ignored.
   */
  const bufferPopNotifiers = ()=>buffers.map(
    buffer=>{
      buffer.length--
      return put({type:`UNBLOCK_${buffer.inspector}`, buffer})
    }
  )
  

  const runThread = function*(){
    let markerPlaced = false
    while(true){
      /**
       * On each iteration, we check if there is job in the buffer
       * if buffer is empty, we will block here. Otherwise, we take one
       * item from the buffer and process the 'job'.      
       */ 
      if(channelBuffer.isEmpty()){
        /**
         * only if buffer is empty and we are waiting, will we
         * place a idle start marker here, pairing with an idle end 
         * marker, we can measure this idle duration
         */
        observer.markMachineIdleStart(machine) 
        markerPlaced = true
      }
      yield take(channelFromBuffer) // block until buffer has item on it
      
      if(markerPlaced){
        observer.markMachineIdleEnd(machine) 
        //measure duration and store it to a data structure inside observer
        observer.measureMachineIdle(machine) 
        markerPlaced = false
      }

      /**
       * we have taken one job from the buffer, so
       * we notify the inspector process that we have taken one job
       */ 
      switch(buffers.length){
        case 1:
          buffers[0].length--
          yield put({type:`UNBLOCK_${buffers[0].job}`, buffer:buffers[0]})
          break
        case 2:
          buffers[0].length--
          buffers[1].length--
          yield all([
            put({type:`UNBLOCK_${buffers[0].job}`, buffer:buffers[0]}),
            put({type:`UNBLOCK_${buffers[1].job}`, buffer:buffers[1]})
          ])
          console.log(`UNBLOCK_${buffers[1].job}`)
          break
        default:
          _.noop()
      }
     
      //   yield all(bufferPopNotifiers()) 
      
      /**
       * mock assembly
       */
      yield delay(_getProcessTime(machine))
    }
  }

  const main = function*(){
    yield fork(runThread)
    while(true){
      //yield all(incomingJobWatchers())
      switch(buffers.length){
        case 1:
          yield take(`PUSH_${machine}-${buffers[0].job}`)
          break
        case 2:
          yield all([
            take(`PUSH_${machine}-${buffers[0].job}`),
            take(`PUSH_${machine}-${buffers[1].job}`)
          ])
          break
        default:
          _.noop()
      }
      if(machine==='machine2'||machine ==='machine3'){
        console.log(machine)
      }

      /**
       * when we get push event on the pseudo buffer,
       * we put the job onto a buffered channel(with max capacity of two)
       */
      yield put(channelFromBuffer, 'new job')

      //yield fork(runThread)
    }

  }

  yield fork(main)

}
export const inspectorSaga = function*({jobs,buffers, inspector}){
 
  const getBuffer = (job)=>{
    const buffersByJob = _getBuffersByJob(job, buffers)
    return getAvailableBuffer(buffersByJob)
  }

  const pushBuffer = function*(buffer){
    buffer.length++
    yield put({type:`PUSH_${buffer.machine}-${buffer.job}`, buffer})
  }
 
  const runThreads = function*(){
    let pid = 0
    let job
    try{
      while(true){
        //starting a new inspecting process
        
        job = jobs[_.random(0,jobs.length-1)] // getting job from the job pool
        yield delay(_getProcessTime(inspector,job)) // mock inspection delay
        //yield delay(3000)

        const buffer = yield call(getBuffer,job) // check if there is available buffer
        if(!buffer){
          /** 
           * Not finding vailable buffer, all buffers paired with the job at hand is full
           * Send block event to the main process(see reference line-'inspection block')
           * This thread will be cancelled after the main thread receive this block event()
           */ 
          yield put({type:`BLOCK_${inspector}`})
        }else{
          /**
           * Found available buffer to dispatch the job.
           * Send a push event to the corresponding machine process
           */
          yield call(pushBuffer, buffer)
        }
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
        yield put({type:'BLOCKED_JOB', job})
        //console.log(`thread ${pid} canceled`)
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
      console.log(inspector+' blocked')
      observer.markInspectorBlockStart(inspector)

      yield cancel(threadTask)
      const {job} = yield take('BLOCKED_JOB')
      console.log(job)
      yield take(`UNBLOCK_${job}`)
      console.log(inspector+' blocked')
      observer.markInspectorBlockEnd(inspector)
      observer.measureInspectorBlock(inspector)

      /**
       * we do a new search on available buffers, 
       * this is tailored for inspector1, because it has
       * multiple 'sink' buffers and has a priority principle,
       * unlike inspector2, every job is paired with only one buffer
       */
      const buffer = yield call(getBuffer,job)
      yield call(pushBuffer, buffer)
    }
  }

  yield fork(main)

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


/**
 * 
 * @param {name} name machine/inspector name used to get process time 
 * @param  {...args} args null for machine, job for inspector. since 
 * inspector's process time is also depend on the job type
 */
const _getProcessTime = (name, ...args)=>{
  const {job} = args
  switch(name){
    case 'machine1':
      return 2000//_.sample(w1json)
    case 'machine2':
      return 2000//_.sample(w2json)
    case 'machine3':
      return 2000//_.sample(w3json)
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


const emitter = new EventEmitter()
const createSagaIO = (emitter, getStateResolve) => {
  const channel = stdChannel();
  emitter.on("action", channel.put);

  return {
    channel,
    dispatch: output => {
      emitter.emit("action", output);
    },
    getState: () => {
      "sampleValue";
    }
  };
};


export const rootSaga = function*(){
  try{
    const lengthedBuffers = [
      {length:0, name:'c1_m1', job:'c1', machine:'machine1', inspector:'inspector1'},
      {length:0, name:'c1_m2', job:'c1', machine:'machine2', inspector:'inspector1'},
      {length:0, name:'c1_m3', job:'c1', machine:'machine3', inspector:'inspector1'},
      {length:0, name:'c2_m2', job:'c2', machine:'machine2', inspector:'inspector2'},
      {length:0, name:'c3_m3', job:'c3', machine:'machine3', inspector:'inspector2'},
    ]

    yield fork(inspectorSaga, {jobs:['c1'],  buffers:_.at(lengthedBuffers,[0,1,2]), inspector:'inspector1'}) //inspector1 thread
    yield fork(inspectorSaga, {jobs:['c2','c3'], buffers:_.at(lengthedBuffers,[3,4]), inspector:'inspector2'}) //inspector2 thread
    yield fork(machineSaga, {buffers:_.at(lengthedBuffers,[0]), machine:'machine1'}) //machine1 thread
    yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[1,3]), machine:'machine2'}) //machine1 thread
    yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[2,4]), machine:'machine3'}) //machine1 thread
  }finally{
    if(yield cancelled()){
      console.log('cancelled')
    }
  }
}

const root = function*(){
  const rootTask = yield fork(rootSaga)
  yield call(()=>observer.start())
  yield delay(20000)
  yield cancel(rootTask)

  const data = observer.end()
  console.log(data)
  fs.writeFileSync('./data.json', JSON.stringify(data))
}

runSaga(
  createSagaIO(emitter),
  root
)