import _ from 'lodash'
import { testGetAvailableBuffer, buffers, testGetBufferByJob} from './data';
import { getAvailableBuffer, _getBuffersByJob } from '../src/saga.js'

describe('test getAvailableBuffer', ()=>{
  test.each(testGetAvailableBuffer)(`expect returned buffer index to be %d `,(expectedIndex, buffersArr)=>{
    const bufferObj = getAvailableBuffer(buffersArr)
    if(expectedIndex === -1){
      expect(bufferObj).toBe(null)
    }else{
      const resultIndex = _.findIndex(buffersArr, bufferObj)
      expect(resultIndex).toBe(expectedIndex)
    }
  })
})


describe('test getAvailableBuffer', ()=>{
  //let bufferClone
  //beforeAll(()=>{
    //bufferClone =_.cloneDeep(buffers)
  //})
  test.each(testGetBufferByJob)(`filter by job %s `,(jobName, expectedBuffers)=>{
    const buffersByJob = _getBuffersByJob(jobName,buffers)
    expect(buffersByJob).toEqual(expectedBuffers)
  })
})
