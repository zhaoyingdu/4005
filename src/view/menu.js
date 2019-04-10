import {h} from 'hyperapp'
import $ from 'jQuery'
const Menu = ({setConfig, runSaga})=>{

  const parseAndSubmit = (event)=>{
    console.log('clicked')
    event.preventDefault()
    const principle = $('#principle').val()
    let duration = $('#duration').val()
    let button = $('#runSim')
    button.attr('disabled', true)
    duration = duration * 1000
    setConfig({principle, duration})
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

      <div class='row'><button type='submit' id='runSim'>submit and start</button></div>
    </form>
  )
}


export default Menu