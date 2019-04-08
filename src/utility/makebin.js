import {histogram} from 'd3-array'
import {s1json,s22json,s23json,w1json,w2json, w3json} from '../data/index'
import _ from 'lodash'
const bin = histogram().thresholds(20)
const makebin = (dataJson)=>{
  const parsed = dataJson
  return bin(parsed)
}
const _compact = (bins)=>{
  return _.filter(bins, e=>e.length>2)
}



