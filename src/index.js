// BootstrapのJavascript側の機能を読み込む
import 'bootstrap'

// スタイルシートを読み込む
import './index.scss'
import Camera from './modules/Camera'



const video = document.getElementById('video')
const canvas = document.getElementById('canvas')

const camera = new Camera(video, canvas)

window.onload = ()=>{
    camera.init()
    console.log(Tesseract);
    video.addEventListener('click', ()=>{
        console.log('video tag is clicked')
        camera.snapshot().then((url)=>{
            
            Tesseract.recognize(url,{lang: 'jpn'})
                .progress((p)=>{
                    console.log(p);
                })
                .then((result)=>{
                    console.log(result)
                })
        })
    }, false)
}

