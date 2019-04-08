import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import {inspectorSaga} from '../src/saga'
import {testSagasBuffers} from './data.js'

import _ from 'lodash'

describe.only(`test inspector saga unblocks`,()=>{
  beforeAll(()=>{
    _.forEach(testSagasBuffers, e=>e.length=2)
  })
  afterEach(()=>{
    _.forEach(testSagasBuffers, e=>e.buffer.flush((...args)=>{}))
  })

  test(`test inspector unblocks with unblock action`,()=>{
    return expectSaga(inspectorSaga,{jobs:['c1'],buffers:_.at(testSagasBuffers,[0,1,2]), inspector:'inspector1'})
      .provide([
        [matchers.put]
      ])
      .put(testSagasBuffers[0].buffer, 'c1')
      .dispatch({type:'UNBLOCK', job:'c1'})
      .run()
  })


})