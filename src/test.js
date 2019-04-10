const lengthedBuffers = [
  {length:0, name:'c1_m1', job:'c1', machine:'machine1', inspector:'inspector1'},
  {length:0, name:'c1_m2', job:'c1', machine:'machine2', inspector:'inspector1'},
  {length:0, name:'c1_m3', job:'c1', machine:'machine3', inspector:'inspector1'},
  {length:0, name:'c2_m2', job:'c2', machine:'machine2', inspector:'inspector1'},
  {length:0, name:'c3_m3', job:'c3', machine:'machine3', inspector:'inspector1'},
]


const copy = lengthedBuffers.map((e,index)=>{
  if(index<=3) return e
})

copy[0].length--
console.log(copy)
console.log(lengthedBuffers)