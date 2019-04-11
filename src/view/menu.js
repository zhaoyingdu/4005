import {h} from 'hyperapp'
import $ from 'jQuery'
const Menu = ({setConfig, runSaga})=>{

  const parseAndSubmit = (event)=>{
    console.log('clicked')
    event.preventDefault()
    const principle = $('#principle').val()
    let duration = $('#duration').val()

    let i1 = $('#i1').val()
    i1 = i1 <= 0 ? -1 : _.clamp(i1, duration)*1000
    let i2_c2 = $('#i2_c2').val()
    i2_c2 = i2_c2 <= 0 ? -1 : _.clamp(i2_c2, duration)*1000
    let i2_c3 = $('#i2_c3').val()
    i2_c3 = i2_c3 <= 0? -1 : _.clamp(i2_c3, duration)*1000
    let m1 = $('#m1').val()
    m1 = m1 <= 0? -1 : _.clamp(m1, duration)*1000
    let m2 = $('#m2').val()
    m2 = m2 <= 0? -1 : _.clamp(m2, duration)*1000
    let m3 = $('#m3').val()
    m3 = m3 <= 0? -1 : _.clamp(m3, duration)*1000

    let button = $('#runSim')
    button.attr('disabled', true)
    duration = duration * 1000
    setConfig({
      principle, 
      duration,
      timings:{
        inspector1: i1,
        inspector2_c2: i2_c2,
        inspector2_c3: i2_c3,
        machine1: m1,
        machine2: m2,
        machine3: m3
      }
    })
    runSaga().then(()=>{
      button.attr('disabled', false)
    })
  }
  return(
    <form onsubmit={parseAndSubmit}>
      <div class="form-group">
        <label for="principle">principle</label>
        <select class="form-control" id="principle">
          <option value="original">default</option>
          <option value="w2_w3_first">w3/w2 first</option>
        </select>
      </div>

      <div class="form-group">
        <label for="duration">running time(in seconds)</label>
        <input class="form-control" id="duration" type='number' value='20' min={10} max={60}/>
      </div>

      <div class="form-group">
        <label >set process time to constant(in seconds, clamped to total duration)</label>
        <label for='i1'>inspector1</label>
        <input class="form-control" id="i1" type='number' value='-1' />
        <label for='i2_c2'>inspector2 job2</label>
        <input class="form-control" id="i2_c2" type='number' value='-1' />
        <label for='i2_c3'>inspector2 job3</label>
        <input class="form-control" id="i2_c3" type='number' value='-1' />
        <label for='m1'>machine1</label>
        <input class="form-control" id="m1" type='number' value='-1'/>
        <label for='m2'>machine2</label>
        <input class="form-control" id="m2" type='number' value='-1'/>
        <label for='m3'>machine3</label>
        <input class="form-control" id="m3" type='number' value='-1'/>
      </div>

      <div class='row'><button type='submit' id='runSim'>submit and start</button></div>
    </form>
  )
}


export default Menu