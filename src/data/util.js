import fs from 'fs'
import util from 'util'
import path from 'path'

const readFilePromisify = util.promisify(fs.readFile)
const writeFilePromisify = util.promisify(fs.writeFile)

const readDataFileToJSON = (filepath)=>{
  const readPath = path.resolve(__dirname,filepath)
  const outPath = readPath.replace(/.dat$/,'.json').replace(/source/,'json')
  return readFilePromisify(readPath,{encoding:'utf-8'})
    .then(data=>{
      const dataArr = data.trim().split('\r\n').map(e=>parseFloat(e.trim()))
      return writeFilePromisify(outPath, JSON.stringify(dataArr))
    })
}

readDataFileToJSON('./source/servinsp1.dat')
readDataFileToJSON('./source/servinsp22.dat')
readDataFileToJSON('./source/servinsp23.dat')
readDataFileToJSON('./source/ws2.dat')
readDataFileToJSON('./source/ws1.dat')
readDataFileToJSON('./source/ws3.dat')