import {h} from 'hyperapp'
import Chart from 'chart.js'


const MyChart = ({data=[0,0,0,0,0,0], setChart, updateChart})=>{
  
  const onCreate = (element)=>{
    console.log('canvs mounted')
    const context = element.getContext('2d')
    let chart = new Chart(context, {
      type:'horizontalBar',
      data:{
        labels: ['inspector1', 'inspector2', 'machine1', 'machine2', 'machine3','total runtime'],
        datasets: [{
          label: 'measurement',
          borderWidth: 1,
          data: data,
          backgroundColor: [

          ]
        }]
      },
      options:{}
    })
    setChart(chart)
  }

  const onUpdate = (element ,prev)=>{
    if(prev.data === data) updateChart(()=>{})
    updateChart((state) =>{
      const {data, simConfig, chart} = state
      chart.data.datasets[0].data = data
      chart.update()
    })
  }
 
 

  return(
    <div class="chart-container" style={{position: 'relative', width:'100%'}}>
      <canvas 
        id="myChart" 
        width="400"         
        oncreate={onCreate}
        onupdate = {onUpdate}
        >
      </canvas>
    </div>
  )
}

export default MyChart