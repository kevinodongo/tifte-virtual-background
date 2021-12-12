import * as React from "react";
import { getPicture } from "../lib.js"

interface Props {
  savePicture: (baseImage: string) => void
}

function TakePicture({ savePicture }: Props) {
  const videoRef: HTMLVideoElement | any = React.useRef()

  React.useEffect(() => {
    let mounted = true
    if (mounted) {
      navigator.mediaDevices.getUserMedia({
        'video': true,
        'audio': false
      }).then((stream) => {
        if (videoRef && videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }).catch((e) => {
        console.log(e)
      })
    }
    return (() => { mounted = false })
  }, [])

  // take a picture
  async function takeAPicture() {
    const image = await getPicture(videoRef.current)
    const tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach((track: any) => track.stop());
    savePicture(image)
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-900 relative">
      {/* bounding box */}
      <div className="absolute inset-0 w-full h-full z-20 flex pt-12 pb-20 px-4 justify-center">
        <div className="bounding-box border-dashed border rounded-md border-white max-w-2xl w-full h-full"></div>
      </div>

      <video ref={videoRef} autoPlay playsInline className="absolute inset-0  w-full h-full object-center object-cover"></video>
      <div className="z-30 absolute bottom-5 inset-x-0 flex items-center justify-center">
        <div>
          <a
            onClick={takeAPicture}
            className="w-full cursor-pointer text-white inline-flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm bg-blue-600  font-medium  hover:bg-blue-700"
          >
            <span >Take a picture</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default TakePicture