import {h, app} from 'hyperapp'
import Chart from './view/chart'
import Menu from './view/menu'
import runSaga from './saga'

import 'bootstrap/dist/css/bootstrap.min.css';

export const state = {
  count: 0,
  data:[0,0,0,0,0,0],
  simConfig:{
    principle:'original',
    duration: 20000
  },
  chart:null,
  throughtPut:{}
}

export const actions = {
  renderSimResult: value=>state=>{
    return ({data:value[0], throughtPut:value[1]})
  },
  setConfig: value=>state=>{
    console.log(value)
    return ({simConfig: value})
  },
  runSaga: () => async (state, actions) => {
    console.log('run saga index.sj')
    console.log(state.simConfig)
    const measurements = await runSaga(state.simConfig);
    console.log(measurements)
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
    <div class='col-sm-8'><Chart data={state.data} setChart={actions.setChart} updateChart={actions.updateChart}/></div>
    </div>
  </div>
)

app(state, actions, view, document.body)