import * as React from "react";
import { startPreview, noanimation, animationblur, animationBackground } from "./lib.js"
const bodyPix = require('@tensorflow-models/body-pix');
const tf = require("@tensorflow/tfjs")

const image1 = require("./assets/image1.jpg")

tf.setBackend('webgl')

function Meeting() {
  const localRef: any = React.useRef()
  const remoteRef: any = React.useRef()

  React.useEffect(() => {
    let mounted = true
    async function startVideo() {
      await startPreview(localRef.current)
    }
    if (mounted && localRef && localRef.current) {
      startVideo()
    }
    return (() => { mounted = false })
  }, [])

  async function blurring() {
    const response: any = await animationblur()
    remoteRef.current.srcObject = response.outputMediaStream
  }

  async function background() {
    // const image = require("./assets/image2.jpg")
    // const response = await animationBackground(image)
    // remoteRef.current.srcObject = response.outputMediaStream
    function frame() {
      process()
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  async function remote() {
    const canvas: any = document.getElementById('canvasElement')
    const stream = canvas.captureStream(15);
    console.log("[STREAM]", stream)
    remoteRef.current.srcObject = stream
  }

  async function process() {
    await tf.ready()
    // set model
    const model = await bodyPix.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2
    });
    const demoCanvas: HTMLCanvasElement | any = document.getElementById("demoCanvas")
    const demoCtx = demoCanvas.getContext('2d')
    demoCanvas.style.backgroundImage = `url(${image1})`
    demoCanvas.style.backgroundPosition = 'center'
    demoCanvas.style.objectFit = "cover"

    // processing
    const canvas: HTMLCanvasElement = document.createElement('canvas')
    const targetCanvas: HTMLCanvasElement = document.createElement('canvas')
    const width = demoCanvas.width
    const height = demoCanvas.height
    canvas.height = height
    canvas.width = width
    targetCanvas.height = height
    targetCanvas.width = width

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
    const targetCtx: CanvasRenderingContext2D | null = targetCanvas.getContext('2d')
    const segmentation = await model?.segmentPerson(localRef.current)
    ctx?.drawImage(localRef.current, 0, 0, width, height)
    const imageData: ImageData | any = ctx?.getImageData(0, 0, width, height)
    for (let i = 0; i < imageData.data.length; i++) {
      imageData.data[i * 4 + 3] = segmentation.data[i] ? 255 : 0
    }
    targetCtx?.putImageData(imageData, 0, 0)

    console.info(`Processing completed placing on demo canvas ${new Date()}`)
    demoCtx.globalCompositeOperation = 'copy'
    demoCtx.filter = 'none'
    demoCtx.drawImage(targetCanvas, 0, 0, width, height)
    demoCtx.globalCompositeOperation = 'source-in'
    demoCtx.filter = 'none'
  }


  return (
    <div>
      <div className="min-h-screen relative bg-gray-900">

        {/*local view*/}
        <div className="absolute grid grid-cols-2 inset-0 px-4 h-full bottom-10">
          <div className="rounded-xl bg-gray-900 w-full h-full mx-auto">
            <video ref={localRef} autoPlay playsInline className="h-full w-full object-cover object-center"></video>
          </div>
          <div className="rounded-xl bg-gray-900 w-full h-full mx-auto">
            <video ref={remoteRef} autoPlay playsInline className="h-full w-full object-cover object-center"></video>
          </div>
        </div>

        {/*controls*/}
        <div className="flex z-20 items-center space-x-4 justify-center absolute inset-x-0 top-5">
          <a onClick={blurring} className="bg-gray-800 cursor-pointer bg-opacity-70 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
              <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
            </svg>
          </a>
          <a onClick={noanimation} className="bg-gray-800 cursor-pointer bg-opacity-70 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </a>
          <a onClick={background} className="bg-gray-800 cursor-pointer bg-opacity-70 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </a>
          <a onClick={remote} className="bg-gray-800 cursor-pointer bg-opacity-70 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Meeting