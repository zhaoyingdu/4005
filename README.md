# Similation Project Report

### project links: 
view repo: [github repo](https://github.com/zhaoyingdu/4005)  
if you want to run the project on your computer, you can just download the proj and open /dist/index.html in broswer.     
### issues: https://github.com/zhaoyingdu/4005/issues


## Iteration1  
this section contains many images and has been moved to the end for readability purpose.

## Iteration2: Model design
1. Network Model
  * This matrix represent the node trasitions inside the network we are modeling:
   ```
    i1  i2  m1  m2  m3  p1  p2  p3
c1  1   .   .   .   .   .   .   .
c2  .   .5  .   .   .   .   .   .
c3  .   .5  .   .   .   .   .   .
i1  .   .   x   x   x   .   .   .
i2  .   .   .   .5  .5  .   .   .
m1  .   .   .   .   .   1   .   .
m2  .   .   .   .   .   .   1   .
m3  .   .   .   .   .   .   .   1
```
**Avaiable nodes:**  
  1. three source nodes(c1,c2,c3): dispatching jobs to inspectors  
  2. two inspector node(i1,i2): receiving jobs from source nodes and dispacthing them to machine nodes  
  3. three machine nodes(m1,m2,m3): receiving jobs from inspector node and dispatching them to sink nodes  
  4. sink nodes(p1,p2,p3): out put node of this net work.    
   
**Value meaning for each element:**  
(Use ki,j represent's an element in the matrix, then)
  1. ki,j = . means transition never happens from node i to node j  
  2. 0< ki,j < 1 means transition can happen from node i to node j with certain probability,  
    if the number is 1, means next transtion will happen from node i to node j for sure.
    (for example, both kc2,i2 and kc3,i2 equals 0.5, representing the fact that inspector 2
    picks randomly from c2 and c3)
  3. ki,j = x, means the probality of a particular route be taken depends on other conditions when then network
    starts. In this model, the three x's in row i1 meaning the probability on how inspector 1 dispatching finished
    component depend on the queueing disipline we choose.  

**Misc: model buffers**  
+ c1_m1: of queue size 2, getting push event from i1, pop event from m1  
+ c1_m2: of queue size 2, getting push event from i1, pop event from m2  
+ c1_m3: of queue size 2, getting push event from i1, pop event from m3  
+ c2_m2: of queue size 2, getting push event from i2, pop event from m2  
+ c3_m3: of queue size 2, getting push event from i2, pop event from m3  
These buffers can not be represented in the matrix, therefore they are explicitly described here. Their states determine the network's state

**Event flow and state transition for each stateful node/buffer**  
(note the system is concurrent, so I made use of wait and signal)
```javascript
  system state:
    throughPut_p1, //an integer indicating number of product p1 being produced by the system
    throughPut_p2,
    throughPut_p3

  i1:
    state: block
    while true{
      delay by component1 processing duration
      if(c1_m1 or c1_m2 or c1_m3 has size < 2>){
        buffer = chooseBuffer(discipling)
        buffer.size++
        continue;
      }else{
        block = true
        wait_for_signal 'unblock_component1'; // execution blocked. singal will be coming from machine
        block = false
        buffer = chooseBuffer(discipling)
        buffer.size++
        continue
      }
    }

  i2: 
    state: block
    while true{
      componentx = pickJobRandomly()
      delay by componentx processing duration
      if(componentx = component2 AND c2_m2.size < 2>){
        
      }else if(componentx = component3 AND c3_m3.zise < 2>){
        c2_m2.size++
        continue;
      }else{
        if(component = compoennt2){
          block = true
          wait_for_signal 'unblock_component2'
          block = false
          c2_m2.size++
          continue;
        }else{
          wait_for_signal 'unblock_component3'
          c2_m2.size++
          continue;
        }
      }
    }

  m1:
    state: idle
    while(true){
      idle = true
      while(c1_m1.size=0){
        wait; //idling
      }
      idle = false
      c1_m1.size--
      send signal'unblock_component1'
      delay by machine1 assembly time
      throughPut_p1++
    }
  m2:
    state: idle 
    while(true){
      idle = true
      while(c1_m2.size=0 || c2_m2.size = 0){
        wait; //idling
      }
      idle = false
      c1_m2.size--
      c2_m2.size--
      send signal'unblock_component1'
      send signal'unblock_component2'
      delay by machine2 assembly time
      throughPut_p2++
    }
  m2:
    state: idle
    while(true){
      idle = true
      while(c1_m3.size=0 || c3_m3.size = 0){
        wait; //idling
      }
      idle = false 
      c1_m3.size--
      c3_m3.size--
      send signal'unblock_component1'
      send signal'unblock_component3'
      delay by machine3 assembly time
      throughPut_p3++
    }
```

## Iteration3: Model translation:

1. source code with comments
```javascript
/**
 * Data structure that stores the buffers and association with its source and sink
 * For example, element one is the buffer connecting machine1 and inspector1
 */
const lengthedBuffers = [
  {length:0, name:'c1_m1', job:'c1', machine:'machine1', inspector:'inspector1'},
  {length:0, name:'c1_m2', job:'c1', machine:'machine2', inspector:'inspector1'},
  {length:0, name:'c1_m3', job:'c1', machine:'machine3', inspector:'inspector1'},
  {length:0, name:'c2_m2', job:'c2', machine:'machine2', inspector:'inspector2'},
  {length:0, name:'c3_m3', job:'c3', machine:'machine3', inspector:'inspector2'},
]
/**
 * Data structure used to record through put for analysis purpose 
 */
const throughPut = {
  p1:0,
  p2:0,
  p3:0
}
/**
 * helper function that get paired buffer for @param job
 */
const _getBuffersByJob = (job, buffers)=>{
  return _.filter(buffers, {job:job})
}
/**
 * Deciding the priority principle of choosing buffers when dispatching jobs.
 * @param {Array} buffers supplied pool of buffers. e.g. for inspector 1, 
 * it would be ['c1_m1', 'c1_m2', 'c1_m3'] 
 */
const getAvailableBuffer = (buffers)=>{
  if(_.every(buffers, ({length})=>length===2)) 
  {
    return null
  }
  if(config.priority === 'original' || buffers[0].inspector!=='c1'){
    return _.minBy(buffers, 'length')
  }else{
    // this principle is explained in seperator readme section iteration4
    // check priority group 1
    const machine2Buffers = _.keyBy(_.filter(lengthedBuffers, {machine:'machine2'}),'name')
    const machine3Buffers = _.keyBy(_.filter(lengthedBuffers, {machine:'machine3'}),'name')
    if(machine2Buffers['c1_m2'].length===0 && machine2Buffers['c2_m2'].length!==0){
      return _.get(lengthedBuffers, {name:'c1_m2'})
    }
    if(machine3Buffers['c1_m3'].length===0 && machine3Buffers['c3_m3'].length!==0){
      return _.get(lengthedBuffers, {name:'c1_m2'})
    }
    // check priority group 2
    if(machine2Buffers['c1_m2'].length===0 && machine2Buffers['c2_m2'].length===0){
      return _.get(lengthedBuffers, {name:'c1_m2'})
    }
    if(machine3Buffers['c1_m3'].length===0 && machine3Buffers['c3_m3'].length===0){
      return _.get(lengthedBuffers, {name:'c1_m3'})
    }
    // check priority group 3
    if(_.get(buffers, {name:'c1_m1', length:0})){
      return _.get(buffers, {name:'c1_m1'})
    }
    //use default
      return _.minBy(buffers, 'length')
  }
}
/**
 * 
 * @param {name} name machine/inspector name used to get process time 
 * @param  {...args} args null for machine, job for inspector. since 
 * inspector's process time is also depend on the job type.
 */
const _getProcessTime = (name, ...args)=>{
  const {job} = args
  switch(name){
    case 'machine1':
      return config.timings.machine1 ?config.timings.machine1 : _.sample(w1json)
    case 'machine2':
      return config.timings.machine2 ?config.timings.machine2 :_.sample(w2json)
    case 'machine3':
      return config.timings.machine3 ?config.timings.machine3 : _.sample(w3json)
    case 'inspector1':
    return config.timings.inspector1 ?config.timings.inspector1 :_.sample(s1json)
    case 'inspector2':
      if(job === 'c2'){
        return config.timings.inspector2_c2 ?config.timings.inspector2_c2 :_.sample(s22json)
      }else{
        return config.timings.inspector2_c3 ?config.timings.inspector2_c3 :_.sample(s23json)
      }
    default:
      throw new Error('error... identifier not recognized')
  }
}


/**
 * function when invoked represnts a running machine process.
 * @param {Array} buffers the buffers pair with the machine
 * @param {String} machine the name of the machine
 */
const machineSaga = function*({buffers, machine}){  
  const channelBuffer = sagaBuffer.fixed(2)
  const channelFromBuffer = yield channel(channelBuffer)
  
  /**
   * Catchers that catches the event that machine has
   * picked up the component from buffer and started assembling
   * It will decrement the pseudo buffer's length. 
   * Then notify the inspector who is paired up
   * with this buffer that we have taken one job.
   * If the inspector is blocked, it will be unblock and resume.
   * if the inspector is not blocked, the notification is silently 
   * ignored.
   */
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
          break
        default:
          _.noop()
      }
     
      //   yield all(bufferPopNotifiers()) 
      
      /**
       * mock assembly
       */
      yield delay(_getProcessTime(machine))

      // assembly finished, update throughput
      switch(machine){
        case 'machine1':
          throughPut.p1++
          break;
        case 'machine2':
          throughPut.p2++
          break;
        case 'machine3':
          throughPut.p3++
          break
        default:
          throw new Error('unrecognized machine name')
      }
    }
  }

  const main = function*(){
    yield fork(runThread)
    while(true){
      /**
       * Watches for push event on the buffers
       * this machine is interested.
       * For machine1, this would be one buffer, and event resolve 
       * immediately, and return to main thread.
       * For machine2, we will be waiting until job c2 and c3 are
       * both available then return to main thread. Same logic applies to machine3 
       */
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
           * Send block event to the main process
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

const rootSaga = function*(){
  //reset state before each simulation run
  _.forEach(lengthedBuffers, e=>e.length=0)
  throughPut.p1 = 0
  throughPut.p2 = 0
  throughPut.p3 = 0
  try{
    // starts all worker threads concurrently
    yield fork(inspectorSaga, {jobs:['c1'],  buffers:_.at(lengthedBuffers,[0,1,2]), inspector:'inspector1'}) //inspector1 thread
    yield fork(inspectorSaga, {jobs:['c2','c3'], buffers:_.at(lengthedBuffers,[3,4]), inspector:'inspector2'}) //inspector2 thread
    yield fork(machineSaga, {buffers:_.at(lengthedBuffers,[0]), machine:'machine1'}) //machine1 thread
    yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[1,3]), machine:'machine2'}) //machine1 thread
    yield fork(machineSaga, {buffers: _.at(lengthedBuffers,[2,4]), machine:'machine3'}) //machine1 thread
  }finally{
    if(yield cancelled()){
    }
  }
}

const root = function*(){
  //console.log('saga '+ config)
  const rootTask = yield fork(rootSaga)
  yield call(()=>observer.start())
  observer.markProcessStart()
  yield delay(config.duration)
  yield cancel(rootTask)
  yield call(()=>observer.markProcessEnd())
  yield call(()=>observer.measureProcessDuration())
  return observer.end()
  
}

export default (userConfig)=>{
  // reset config on each run
  config = {
    duration: 20000, // default to run simulation 20 secends
    principle: 'original', //default to use principle stated in problem pdf,
    timings:{ // work in progress, allow ui Tweaking individual process times
      inspector1: -1,
      inspector2_c2: -1,
      inspector2_c3: -1,
      machine1: -1,
      machine2: -1,
      machine3: -1
    }
  }
  config = {...config, ...userConfig} // overwrite configuration if provided by user
  console.log(config)
  return  runSaga(createSagaIO(emitter),root).toPromise().then(data=>{
    const plucked = []
    _.forEach(data, (measurement,index)=>{
      plucked[index] = measurement.duration
    })
    return [plucked, throughPut]
  })
}
```
2. verification  
I have tested the function getAvailableBuffers and getBuffersbyJob,to ensure they return correct buffers based on input  
[Test data](https://github.com/zhaoyingdu/4005/blob/master/__test__/data.js)  
[Test Script](https://github.com/zhaoyingdu/4005/blob/master/__test__/redux.test.js)  
Test results:  
   - [x] getAvailableBuffer works as expected
   - [x] getBufferByJobs works as expected
   - [ ] todo: test getAvailableBuffer with alternative queue principle

1. validation  
normal run, can be used to comparing with validation run:  
**input**: default(i.e. process time for each node was selected randomly from the its corresponding data file)
**result**:  
![base case](/assets/normal_default.png)  

validation run  
**validation input**: machine 1 assembly time = 2000 ms, total runtime = 10s  
**expected result**: product one has significant low throughput,  machine 1 barely idles  
**actual result**:  
![machine1 assemble slow](/assets/validation_m1_2s.png)  



## iteration4:  
**Alternative queue disipline for inspector1.**  
**name:** machine_2 and machine_3 first  
**design goal:** increase the throughput by reducing the occurrance of inspector2 being blocked, or more explicitly, try to reduce the occurrance of following to senarios:  
  1. senario 1:
    * inspector2: blocking after processing component2  
    * machine2: c2_m2 is full, c1_m2 is empty  
    * machine3: 
      (best case senario) not idle, c3_m3 and c1_m3 are both non-empty  
      (worst case senario) idle, c3_m3 and c1_m3 are empty  
  2. senario 2:
    * inspector2: blocking after processing component3  
    * machine3: c3_m3 is full, c1_m3 is empty  
    * machine2:  
      (best case senario) not idle, c2_m2 and c1_m2 are both non-empty  
      (worst case senario) idle, c2_m2 and c1_m2 are empty  
**reasoning:**  
  giving m1 higher priority over machine2 and machine3 can result in machine2, machine3 have more
  chances t idle and inspector2 has more chances to block. Therefore, in theis concurrent syatem, 
  m2, m3 and i2 would have little uptime ratio comparing to i1 and m1
  If we give m2 and m3 higher priority over m1, only m1's uptime would be adversely affected,
  but i1 would have same uptime ratio as before, and m2, m3 and i2 will have higher uptime ratio.  
**implementation:**
  when inspector checking for available buffer to dispatch job, it will check buffer patterns in the following order:  
  * priority-1:  
    machine 2 or machine 3 who is idle waiting for only component1  
    c1_m2 = 0 AND c2_m2 !=0  or c1_m3 = 0 AND c3_m3 !=0  
    if found, dispatch to corresponding c1's buffer  
  * priority-2:  
    machine 2 or machine 3 who has both buffer empty  
    c1_m2 = 0 AND c2_m2 =0  or c1_m3 = 0 AND c3_m3 = 0  
    if found, dispatch to corresponding c1's buffer  
  * priority 3:  
    c1_m1 is empty  
    if true dispatch to c1_m1  
  * default:  
    use default principle stated in question  

## iteration1  
**histograms/frequency distribution**  
![](/assets/histogram1.png)  
![](/assets/histogram1.png)  
**qq-plots**  
![](/assets/qq-plots1.png)  
![](/assets/qq-plots2.png)