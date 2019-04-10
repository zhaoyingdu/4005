
//import {performance, PerformanceObserver} from 'perf_hooks'

import _ from 'lodash'

export default ()=>{
  let obs
  let performance = window.performance
  const M_START = machine=>`machine_idle_start_${machine}`
  const M_END = machine=>`machine_idle_end_${machine}`
  const I_START = inspector=>`inspector_block_start_${inspector}`
  const I_END = inspector=>`inspector_block_end_${inspector}`

  const markMachineIdleStart = (machine)=>performance.mark(M_START(machine))
  const markMachineIdleEnd = (machine)=>performance.mark(M_END(machine))
  const markInspectorBlockStart = (inspector)=>performance.mark(I_START(inspector))
  const markInspectorBlockEnd = (inspector)=>performance.mark(I_END(inspector))
  const markProcessStart = ()=>performance.mark('start_process')
  const markProcessEnd = ()=>performance.mark('end_process')

  const measureMachineIdle = (machine)=>performance.measure(M_START(machine).replace(/start/, 'measure'),M_START(machine),M_END(machine))
  const measureInspectorBlock = (inspector)=>performance.measure(I_START(inspector).replace(/start/, 'measure'), I_START(inspector),I_END(inspector) )
  const measureProcessDuration = ()=>performance.measure(`measure_process`, 'start_process', 'end_process')
  const data = [
    {class: "inspector1", label: "i1 block", times: [], duration:0},
    {class: "inspector2", label: "i2 block", times: [], duration:0},
    {class: "machine1", label: "m1 idle ", times: [], duration:0},
    {class: "machine2", label: "m2 idle ", times: [], duration:0},
    {class: "machine3", label: "m3 idle ", times: [], duration:0},
    {class:"process", label:'process running time',times:[], duration:0}
  ];

  const _clearMark = (measureName)=>{
    const startMarkName = measureName.replace(/measure/,'start')
    const endMarkName = measureName.replace(/measure/,'end')
    performance.clearMarks([startMarkName, endMarkName])
  }

  const start = ()=>{
    obs = new window.PerformanceObserver((list, observer) => {
      const measures = list.getEntriesByType('measure')
      for(let measure of measures){
        let className = _.last(measure.name.split('_'))
        const row = _.find(data,{class: className})
        _.invoke(row, 'times.push',{start_time:measure.startTime, end_time:measure.startTime+measure.duration})
        row.duration+=measure.duration
        if(measure.name === 'measure_process'){
          console.log(measure.startTime)
          console.log(measure.endType)
          console.log(measure.duration)
        }
        _clearMark(className)
      }
  });

    obs.observe({ entryTypes: ['measure'] })
  }

  const end = ()=>{
    performance.clearMarks()
    performance.clearMeasures()
    obs.disconnect()
    return data
  }
  return {
    start,
    end,
    markProcessStart,
    markProcessEnd,
    markMachineIdleStart,
    markMachineIdleEnd,
    markInspectorBlockStart,
    markInspectorBlockEnd,
    measureMachineIdle,
    measureInspectorBlock,
    measureProcessDuration
  }
}

