import {init,jobArrivalTask, store} from '.'
import _ from 'lodash'

describe(`test init state setted`,()=>{
  test('init state setted', ()=>{
    store.dispatch({type:'DUMMY'})//jobArrivalTask({},null)
    let state = store.getState()
    expect(state).toEqual(init)
    
  })

  test.each([
    ['c1', 'busy', 'idle',[],[]],
    ['c2', 'idle', 'busy',[],[]],
    ['c3', 'idle', 'busy',[],[]]
  ])('dispatch job %s', (job, i1state, i2state, source1, source2)=>{
    let state = jobArrivalTask(init,{type:'JOB_ARRIVE', job})
    let i1 = _.get(state, `inspectors.inspector1.state`)
    let i2 = _.get(state, `inspectors.inspector2.state`)
    let s1 = _.get(state, `queues.source1.content`)
    let s2 = _.get(state, `queues.source2.content`)
    expect(i2).toEqual(i2state)

    expect(i1).toEqual(i1state)
    expect(s1).toEqual(source1)
    expect(s2).toEqual(source2)
  })  

})

describe('test dispatch job',()=>{
  store.dispatch({type:'RESET'})
  test.each([
    [['c1','c1','c1'], 'inspector1','block'],
  ])('transfer jobs %s', (job, inspector, inspectorState)=>{
    _.forEach(job, j=>{
      store.dispatch({type:'JOB_ARRIVE', job:j})
      store.dispatch({type:'JOB_TRANSFER', inspector})
    }) //jobArrivalTask({},null)
    let state = store.getState()
    expect(_.get(state, `inspectors.${inspector}.state`)).toEqual(inspectorState)
  })  
})
describe('test dispatch job',()=>{
  beforeAll(()=>store.dispatch({type:'RESET'}))
  test.each([
    [['c1','c1','c1'], ['c1','c1'],[]],
    [['c2','c2','c3'], ['c1','c1'],['c2','c3']],
    [['c3','c2','c3'], ['c1','c1'],['c2','c3','c3','c2','c3']]
  ])('dispatch job %s', (job, source1, source2)=>{
    store.dispatch({type:'JOB_ARRIVE', job:job[0]}) //jobArrivalTask({},null)
    store.dispatch({type:'JOB_ARRIVE', job:job[1]})
    store.dispatch({type:'JOB_ARRIVE', job:job[2]})
    let state = store.getState()
    let s1 = _.get(state, `queues.source1.content`)
    let s2 = _.get(state, `queues.source2.content`)
    expect(s1).toEqual(source1)
    expect(s2).toEqual(source2)
  })  
})