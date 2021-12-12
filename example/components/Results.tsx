import * as React from "react";
import { CheckCircleIcon } from '@heroicons/react/solid'

interface Props {
  resultText: string | null
}

function Results({ resultText }: Props) {
  return (
    <div className="rounded-md bg-gray-800 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-200">{resultText}</p>
        </div>
      </div>
    </div>
  )
}
export default Results
