class Camera{
    constructor(video, canvas){
        this.video = video
        this.canvas = document.createElement('canvas')
        
        this.stream = null
        this.medias = {audio: false, video: {
            // facingMode: {exact: "environment"}
            facingMode: 'user'
        }}
    }

    init(){
        this.canvas.width = 800
        this.canvas.height = 600

        navigator.getUserMedia(this.medias, (stream)=>{
            this.video.srcObject = stream
            this.stream = stream
        }, (err)=>{
            alert(err)
        })
    }

    async snapshot(){
        if(this.stream){
            const ctx = this.canvas.getContext('2d')
            ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)
            return this.canvas.toDataURL('image/webp')
        }
    }
}

export default Camera