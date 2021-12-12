import * as React from "react";
import { analysevideoSession, analyseVideoSessionResults } from "./lib.js"

function Session() {
  const [results, setResults] = React.useState<(any)[]>([])
  const [image, setImage] = React.useState<string>("")
  const videoRef: HTMLVideoElement | any = React.useRef()
  let interval: any = null

  React.useEffect(() => {
    let mounted = true
    if (mounted) {
      startProcessing()
    }
    return (() => { mounted = false; clearInterval(interval) })
  }, [])

  async function startProcessing() {
    const stream = await navigator.mediaDevices.getUserMedia({
      'video': true,
      'audio': false
    })
    if (videoRef && videoRef.current) {
      videoRef.current.srcObject = stream
    }

    // send the first frame and set an interval to collect next frames
    videoProcess()
    interval = setInterval(() => {
      videoProcess()
    }, 20000);

  }

  async function videoProcess() {
    const response: any = await analysevideoSession(videoRef.current)
    console.log("[[Analysed]]", response)
    if (response) {
      setImage(response.Image)
      const results = await analyseVideoSessionResults(response.Result)
      console.log('[[Results]]', results)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/*video element*/}
      <video ref={videoRef} autoPlay playsInline className="absolute hidden inset-0 z-20 w-full h-full object-center object-cover"></video>
      {/*processing results*/}
      <div className="inset-0 w-full h-full p-6 z-10 absolute bg-white">
        <div>
          <h1 className="font-bold">SESSION PROCESSING RESULTS</h1>
          {image && <img src={image} alt="Captured Frame Image" className="w-full h-full object-cover object-center" />}
        </div>
      </div>
    </div>
  );
}

export default Session