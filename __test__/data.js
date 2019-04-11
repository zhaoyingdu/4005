// test getAvailableBuffer
import _ from 'lodash'

const buffers =  [
  {length:2, name:'c1_m1', job:'c1', machine:'machine1', inspector:'inspector1'},
  {length:2, name:'c1_m2', job:'c1', machine:'machine2', inspector:'inspector1'},
  {length:2, name:'c1_m3', job:'c1', machine:'machine3', inspector:'inspector1'},
  {length:2, name:'c2_m2', job:'c2', machine:'machine2', inspector:'inspector2'},
  {length:2, name:'c3_m3', job:'c3', machine:'machine3', inspector:'inspector2'},
]

// input and expected output data for test deafult dicipline, getAvailable buffer 
const source = ([0,1,2,3,4]).map(bufferIndex=>{
  const clone = _.cloneDeep(buffers)
  clone[bufferIndex].length = 0
  return clone
})
source.push(_.cloneDeep(buffers))
const expected = [0,1,2,3,4,-1]
export const data_getAvailableBufferDefault = _.zip(expected, source)

// work in progress
// input and expected output data for test m2/m3_first dicipline, getAvailable buffer 
const m2m3_firstSource = ()=>{
  // pattern header
  // c1_m1, c1_m2, c1_m3, c2_m2, c3_m3
  const patternMap = [
  ['getC2_p1_1', [0, 0, 0, 1, 0]],
  ['getC2_p1_2', [0, 0, 0, 1, 1]],
  ['getC2_p1_3', [0, 0, 1, 1, 1]],
  ['getC2_p2_1', [0, 0, 0, 0, 0]],
  ['getC2_p2_2', [0, 0, 0, 0, 1]],
  ['getC2_p2_3', [0, 0, 1, 0, 1]],

  ['getC3_p1_1', [0, 0, 0, 1, 0]],
  ['getC3_p1_2', [0, 0, 0, 1, 1]],
  ['getC3_p1_3', [0, 0, 1, 1, 1]],
  ['getC3_p2_1', [0, 0, 0, 0, 0]],
  ['getC3_p2_2', [0, 0, 0, 0, 1]],
  ['getC3_p2_3', [0, 0, 1, 0, 1]]
  ]

}



const getBufferByJobExpected = [
  [{ length:2, name:'c1_m1', job:'c1'},
  { length:2, name:'c1_m2', job:'c1'},
  { length:2, name:'c1_m3', job:'c1'}],
  [{ length:2, name:'c2_m2', job:'c2'}],
  [{ length:2, name:'c3_m3', job:'c3'}]
]
const jobNames = ['c1','c2','c3']
export const data_getBufferByJob = _.zip(jobNames, getBufferByJobExpected)

