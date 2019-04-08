// test getAvailableBuffer
import _ from 'lodash'
import {channel, buffers as SagaBuffers} from 'redux-saga'
export const buffers = [
  { length:2, name:'c1_m1', job:'c1'},
  { length:2, name:'c1_m2', job:'c1'},
  { length:2, name:'c1_m3', job:'c1'},
  { length:2, name:'c2_m2', job:'c2'},
  { length:2, name:'c3_m3', job:'c3'},
]
const source = ([0,1,2,3,4]).map(bufferIndex=>{
  const clone = _.cloneDeep(buffers)
  clone[bufferIndex].length = 0
  return clone
})
source.push(_.cloneDeep(buffers))
const expected = [0,1,2,3,4,-1]
export const testGetAvailableBuffer = _.zip(expected, source)

const getBufferByJobExpected = [
  [{ length:2, name:'c1_m1', job:'c1'},
  { length:2, name:'c1_m2', job:'c1'},
  { length:2, name:'c1_m3', job:'c1'}],
  [{ length:2, name:'c2_m2', job:'c2'}],
  [{ length:2, name:'c3_m3', job:'c3'}]
]
const jobNames = ['c1','c2','c3']
export const testGetBufferByJob = _.zip(jobNames, getBufferByJobExpected)


export const testSagasBuffers = [
  {buffer:channel(SagaBuffers.fixed(2)), length:0, name:'c1_m1', job:'c1'},
  {buffer:channel(SagaBuffers.fixed(2)), length:0, name:'c1_m2', job:'c1'},
  {buffer:channel(SagaBuffers.fixed(2)), length:0, name:'c1_m3', job:'c1'},
  {buffer:channel(SagaBuffers.fixed(2)), length:0, name:'c2_m2', job:'c2'},
  {buffer:channel(SagaBuffers.fixed(2)), length:0, name:'c3_m3', job:'c3'},
]