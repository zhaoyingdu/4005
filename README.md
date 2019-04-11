# similation project

## iteration1

## iteration2 Model design
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

## iteration3 Model translation:
see complete project


MISC(Iteration 1 and iteration4)
iteration4:
Alternative queue disipline for inspector1.
name: machine_2 and machine_3 first
design goal: increase the throughput by reducing the occurrance of inspector2 being blocked, 
or more explicitly, try to reduce the occurrance of following to senarios:
  senario 1:
    inspector2: blocking after processing component2
    machine2: c2_m2 is full, c1_m2 is empty
    machine3: 
      (best case senario) not idle, c3_m3 and c1_m3 are both non-empty
      (worst case senario) idle, c3_m3 and c1_m3 are empty
  senario 2:
    inspector2: blocking after processing component3
    machine3: c3_m3 is full, c1_m3 is empty
    machine2: 
      (best case senario) not idle, c2_m2 and c1_m2 are both non-empty
      (worst case senario) idle, c2_m2 and c1_m2 are empty
reasoning:
  ging m1 higher priority over machine2 and machine3 can result in machine2, machine3 have more
  chances t idle and inspector2 has more chances to block. Therefore, in theis concurrent syatem, 
  m2, m3 and i2 would have little uptime ratio comparing to i1 and m1
  If we give m2 and m3 higher priority over m1, only m1's uptime would be adversely affected,
  but i1 would have same uptime ratio as before, and m2, m3 and i2 will have higher uptime ratio. 
implementation:
  when inspector checking for available buffer to dispatch job, it will check buffer patterns in the following
  order:
  priority-1:
    machine 2 or machine 3 who is idle waiting for only component1
    c1_m2 = 0 AND c2_m2 !=0  or c1_m3 = 0 AND c3_m3 !=0
    if found, dispatch to corresponding c1's buffer
  priority-2:
    machine 2 or machine 3 who has both buffer empty
    c1_m2 = 0 AND c2_m2 =0  or c1_m3 = 0 AND c3_m3 = 0
    if found, dispatch to corresponding c1's buffer
  priority 3:
    c1_m1 is empty
    if true dispatch to c1_m1
  default:
    use default principle stated in question