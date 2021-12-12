import * as React from "react";
import { getBase64 } from "../lib.js"

interface Props {
  savePicture: (baseImage: string) => void
}

function UploadImage({ savePicture }: Props) {

  // upload picture
  async function onUpload(event: any) {
    event.preventDefault()
    if (event) {
      const image = await getBase64(event.target.files[0])
      savePicture(image)
    }
  }

  return (
    <div>
      <label
        className="w-full cursor-pointer inline-flex mt-3 justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm bg-blue-600 text-sm font-medium text-whitehover:bg-blue-700"
      >
        <span>Upload a photo</span>
        <input
          id="secondary-file-upload"
          name="secondary-file-upload"
          type="file"
          onChange={onUpload}
          className="sr-only"
        />
      </label>
    </div>
  );
}

export default UploadImage