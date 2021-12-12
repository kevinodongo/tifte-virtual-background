import * as React from "react";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import "../index.css"

const options = [
  'one', 'two', 'three'
];
const defaultOption = options[0];

function Preview() {
  const videoRef: HTMLVideoElement | any = React.useRef()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-content">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="h-80 col-span-7 w-full shadow bg-gray-900 rounded-2xl">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-center object-cover"></video>
        </div>
        <div className="col-span-5">
          <label htmlFor="camera" className="mb-2">Camera</label>
          <Dropdown options={options} value={defaultOption} placeholder="Select an option" />
          <label htmlFor="microphone" className="mb-2 mt-2">Microphone</label>
          <Dropdown options={options} value={defaultOption} placeholder="Select an option" />
          <label htmlFor="speaker" className="mb-2 mt-2">Speaker</label>
          <Dropdown options={options} value={defaultOption} placeholder="Select an option" />
          
        </div>
      </div>
    </div>
  );
}

export default Preview