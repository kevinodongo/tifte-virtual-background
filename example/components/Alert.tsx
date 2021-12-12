import * as React from "react";
import { CheckCircleIcon, XIcon } from '@heroicons/react/solid'

interface Props {
  alertText: string | null
}

function Alert({ alertText }: Props) {
  return (
    <div className="rounded-md bg-green-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800">{alertText}</p>
        </div>
      </div>
    </div>
  )
}
export default Alert
