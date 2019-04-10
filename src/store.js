import {createStore} from 'redux'
import {createSagaMiddleware} from 'redux-saga'
import _ from 'lodash'

const initState = [
  {length:0, name:'c1_m1', job:'c1', machine:'machine1', inspector:'inspector1'},
  {length:0, name:'c1_m2', job:'c1', machine:'machine2', inspector:'inspector1'},
  {length:0, name:'c1_m3', job:'c1', machine:'machine3', inspector:'inspector1'},
  {length:0, name:'c2_m2', job:'c2', machine:'machine2', inspector:'inspector1'},
  {length:0, name:'c3_m3', job:'c3', machine:'machine3', inspector:'inspector1'},
]

const reducer = (state=initState, action)=>{
  const {name} = action
  switch(action.type){
    case 'PUSH':
      const buffer = _.find(state, {name})
      buffer.length++
      return state
    case 'POP':
      const buffer = _.find(state, {name})
      buffer.length++
      return state
    default:
      return state
  }
}


const store = createStore