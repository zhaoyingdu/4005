
import {performance, PerformanceObserver} from 'perf_hooks'
import _ from 'lodash'
export default ()=>{
  let obs
  const M_START = machine=>`machine_idle_start_$${machine}`
  const M_END = machine=>`machine_idle_end_${machine}`
  const I_START = inspector=>`inspector_block_start_${inspector}`
  const I_END = inspector=>`inspector_block_end_${inspector}`

  const markMachineIdleStart = (machine)=>performance.mark(M_START(machine))
  const markMachineIdleEnd = (machine)=>performance.mark(M_END(machine))
  const markInspectorBlockStart = (inspector)=>performance.mark(I_START(inspector))
  const markInspectorBlockEnd = (inspector)=>performance.mark(I_END(inspector))
  const measureMachineIdle = (machine)=>performance.measure(`${machine}_${performance.now()}`,M_START(machine),M_END(machine))
  const measureInspectorBlock = (inspector)=>performance.measure(`${inspector}_${performance.now()}`, I_START(inspector),I_END(inspector) )

  const data = [
    {class: "inspector1", label: "i1 block", times: [], duration:0},
    {class: "inspector2", label: "i2 block", times: [], duration:0},
    {class: "machine1", label: "m1 idle ", times: [], duration:0},
    {class: "machine2", label: "m2 idle ", times: [], duration:0},
    {class: "machine3", label: "m3 idle ", times: [], duration:0}
  ];
  const start = ()=>{
    obs = new PerformanceObserver((list, observer) => {
      const measures = list.getEntriesByType('measure')
      for(let measure of measures){
        const className = measure.name.split('_')[0]
        if(className === 'inspector1'||className === 'inspector2'){
          console.log(className)
        }
        const row = _.find(data,{class: className})
        _.invoke(row, 'times.push',{start_time:measure.startTime, end_time:measure.startTime+measure.duration})
        row.duration+=measure.duration
      }
      performance.clearMarks()
    });

    obs.observe({ entryTypes: ['measure'], buffered: true })
  }

  const end = ()=>{
    //obs.disconnect()
    return data
  }
  return {
    start,
    end,
    markMachineIdleStart,
    markMachineIdleEnd,
    markInspectorBlockStart,
    markInspectorBlockEnd,
    measureMachineIdle,
    measureInspectorBlock
  }
}

