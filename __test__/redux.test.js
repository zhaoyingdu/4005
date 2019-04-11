import _ from 'lodash'
import { data_getAvailableBufferDefault, buffers, data_getBufferByJob} from './data';
import { getAvailableBuffer, _getBuffersByJob } from '../src/saga.js'

describe('test getAvailableBuffer, default descipline', ()=>{
  let config = {
    priority:'original'
  }
  test.each(data_getAvailableBufferDefault)(`expect returned buffer index to be %d `,(expectedIndex, buffersArr)=>{
    const bufferObj = getAvailableBuffer(buffersArr)
    if(expectedIndex === -1){
      expect(bufferObj).toBe(null)
    }else{
      const resultIndex = _.findIndex(buffersArr, bufferObj)
      expect(resultIndex).toBe(expectedIndex)
    }
  })
})


describe('test getAvailableBuffer, m2/m3_first descipline', ()=>{
  let config = {
    priority:'m2/m3_first'
  }
  test.each(data_getAvailableBufferM2m3First)(`expect returned buffer index to be %d `,(expectedIndex, buffersArr)=>{
    const bufferObj = getAvailableBuffer(buffersArr)
    if(expectedIndex === -1){
      expect(bufferObj).toBe(null)
    }else{
      const resultIndex = _.findIndex(buffersArr, bufferObj)
      expect(resultIndex).toBe(expectedIndex)
    }
  })
})


describe('test getBufferByJob', ()=>{
 
  test.each(data_getBufferByJob)(`filter by job %s `,(jobName, expectedBuffers)=>{
    const buffersByJob = _getBuffersByJob(jobName,buffers)
    expect(buffersByJob).toEqual(expectedBuffers)
  })
})
