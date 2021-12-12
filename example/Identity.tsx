import * as React from "react";
import TakePicture from "./components/TakePicture";
import UploadImage from "./components/UploadImage";
import Alert from "./components/Alert"
import { processIdentityImages, analyseVerificationResponse } from "./lib.js"
import Results from "./components/Results";

function Identity() {
  const [images, setImages] = React.useState<any[]>([])
  const [open, setOpen] = React.useState<boolean>(false)
  const [alertText, setAlertText] = React.useState<string | null>(null)
  const [result, setResults] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    if (mounted) {
      if (images && images.length == 2) {
        processImages()
      }
    }
    return (() => { mounted = false })
  }, [images])

  function savePicture(baseImage: string) {
    setImages([...images, baseImage])
    setAlertText("Successfully saved image")
    setOpen(false)
    // set timeout to clear timer
    setTimeout(() => {
      setAlertText(null)
    }, 2000);
  }

  async function processImages() {
    const response = await processIdentityImages({
      primaryImage: images[0], // primary image
      secondaryImage: images[1] // secondary image
    })
    setResults(analyseVerificationResponse(response))
  }

  return (
    <div className="min-h-screen relative bg-gray-800 flex items-center justify-center">
      {/* alert */}
      {alertText && <div className="absolute top-2 right-2 z-40"><Alert alertText={alertText} /></div>}

      {/* display image and process */}
      {images.length == 2 && <div className="absolute inset-0 h-full z-20 bg-gray-900 flex items-center justify-center">
        <div className="max-w-xl mx-auto ">
          {result ? <Results resultText={result} /> : <div className="animate-pulse text-center text-lg text-gray-400 italic">Processing your images...</div>}
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 space-x-0 lg:space-x-4 mt-4">
            {images.map((item, index) => (
              <div key={index} className="h-72 w-72 rounded-md bg-gray-800">
                <img
                  src={item}
                  alt="primary image"
                  className="h-72 w-72 object-cover object-center shadow rounded-md"
                />
              </div>
            ))}
          </div>
          {result && <div className="flex mt-4">
            <a onClick={() => {setResults(null); setImages([])}} className="cursor-pointer text-white inline-flex justify-center py-1 px-4 border border-gray-100 rounded-md bg-white text-red-500  font-medium  hover:bg-gray-100">Reset</a>
          </div>}
        </div>
      </div>}

      {/* image section */}
      {open && <div className="absolute inset-0 h-full z-10 bg-gray-900">
        <TakePicture savePicture={savePicture} />
      </div>}

      <div className="max-w-sm mx-auto text-white text-center">
        <h1 className="uppercase text-xl font-bold">REKOGNITION IDENTITY ANALYSIS</h1>
        <div className="text-base text-gray-400 mt-2">We are going to take two pictures and analyse and check if there identity match. The first image you take or upload will be used as your primary image and we will verify against your secondary image.</div>
        <div className="mt-3">
          <a
            onClick={() => { setOpen(true) }}
            className="w-full inline-flex cursor-pointer justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span >Take a Picture</span>

          </a>
          <UploadImage savePicture={savePicture} />
        </div>
      </div>
    </div>
  );
}

export default Identity