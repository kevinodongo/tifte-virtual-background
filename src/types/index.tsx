export interface credentials {
    region: string
    accessKeyId: string
    secretAccessKey: string
}

export interface _Error {
    message: string
    name?: string
    fileName?: string
    lineNumber?: number
    columnNumber?: number
    stack?: string
}

export interface RegionType {
    label: string
    value: string
}

export interface JoinInfo {
    meetingInfo: string
    attendeeInfo: string
}


