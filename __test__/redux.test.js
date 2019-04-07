import _ from 'lodash'
import { testGetAvailableBuffer } from './data';
import { getAvailableBuffer } from '../sagas.js'

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