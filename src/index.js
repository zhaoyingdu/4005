import {h, app} from 'hyperapp'
import Chart from './view/chart'
import Menu from './view/menu'
import ThroughtPut from './view/throughPut'
import runSaga from './saga'

import 'bootstrap/dist/css/bootstrap.min.css';

export const state = {
  count: 0,
  data:[0,0,0,0,0,0],
  simConfig:{
    principle:'original',
    duration: 20000,
    timings:{
      inspector1: -1,
      inspector2_c2: -1,
      inspector2_c3: -1,
      machine1: -1,
      machine2: -1,
      machine3: -1
    }
  },
  chart:null,
  throughPut:{
    p1:0,
    p2:0,
    p3:0
  }
}

export const actions = {
  renderSimResult: value=>state=>{
    return ({data:value[0], throughPut:value[1]})
  },
  setConfig: value=>state=>{
    return ({simConfig: value})
  },
  runSaga: () => async (state, actions) => {
    const measurements = await runSaga(state.simConfig);
    actions.renderSimResult(measurements)
    return
  },
  setChart:value=>state=>({chart:value}),
  updateChart: func=>state=>{
    func(state)
    return state
  }
}

const view = (state, actions) => (
  <div class='container-fluid'>
    <div class='row'>
      <div class='col-sm-4'>
        <Menu setConfig = {actions.setConfig} runSaga = {actions.runSaga}/>
      </div>
      <div class='col-sm-8'>
        <div class='row'><Chart data={state.data} setChart={actions.setChart} updateChart={actions.updateChart}/></div>
        <div class='row'><ThroughtPut throughPut = {state.throughPut} /></div>
      </div>
    </div>
  </div>
)

app(state, actions, view, document.body)