import { RekognitionSDKClient, LoggerClient, ChimeSDKClient } from "../../src"

// initialize a logger
const logger = new LoggerClient('rekognition')

// initialize regonition
const rekognition = new RekognitionSDKClient({
  region: "eu-west-1",
  accessKeyId: "AKIAV5HKRNO7VDI5XX47",
  secretAccessKey: "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"
}, logger)

// initialize chime
const chime = new ChimeSDKClient()

/**
 * =================================================================
 *                     REKOGNITION
 * =================================================================
*/

// types
type identityImages = {
  primaryImage: string
  secondaryImage: string
}

/**
 * Take a picture and base64
 * 
 * @param video
 * @returns {string}
*/
export async function getPicture(video: HTMLVideoElement) {
  const response = await rekognition.getImageFromVideo(video)
  return response
}

/**
 * Get base64 image
 * 
 * @param image
 * @returns {string}
*/
export async function getBase64(image: any) {
  const response = await rekognition.getBase64Image(image)
  return response
}

/**
 * Process images for analysis
 * 
 * @param images
 * @returns {object}
*/
export async function processIdentityImages(images: identityImages): Promise<string> {
  const response = await rekognition.compareFacesAndVerifyIdentity(images.primaryImage, images.secondaryImage)
  return response
}

/**
 * Verification response analysis
 * 
 * @param {object}
 * @returns {boolean}
*/
export function analyseVerificationResponse(result: any): string {
  if (result.FaceMatches.length > 0 &&
    result.UnmatchedFaces.length === 0) {
    return "We have successfully verified your identity"
  } else if (result.UnmatchedFaces.length > 0 &&
    result.FaceMatches.length === 0) {
    return "We are unable to verify your identity"
  } else {
    return "We are sorry an error occured"
  }
}

/**
 * Session analysis 
 * 
 * @param video HTMLVideoElement
 * @returns {array}
*/
export async function analysevideoSession(video: HTMLVideoElement): Promise<any> {
  const image = await rekognition.getImageFromVideo(video)
  const regex = new RegExp(/^data:image\/\w+;base64,/)
  if (regex.test(image)) {
    // process image against facial and labels
    const facialResponse = await rekognition.detectFaces(image)
    const labelResponse = await rekognition.detectLabels(image)
    // for each image processed we return the Image and the Result of image processing
    return {
      Image: image, /*You can render the image while training the model*/
      Result: [facialResponse, labelResponse]
    }
  } else {
    return null
  }
}

/**
 * Analyse sessions results. For each response we want to only return
 * anything of concerns. When a frame is okay we do not want to alert
 * 
 * 
 * @param response [facialResponse,labelResponse]
*/
export async function analyseVideoSessionResults(response: (any)[]) {
  const facial = response.find((e) => e.FaceDetails)
  const labels = response.find((e) => e.Labels)
  // analyse
  if (facial || labels) {
    const facialResults = processFacials(facial.FaceDetails)
    const labelResults = processLabels(labels.Labels)
    return [...labelResults, ...facialResults]
  } else {
    return null
  }
}

/**
 * =============================================================================
 *                            LABEL PROCESSING
 * =============================================================================
 * Unwanted Labels
 * - These are labels which are not allowed during the exams
 * 
 * OnlyOneLabelAllowed
 * - These are labels that should only be one per image processed. It helps to ensure
 *   only one person sits the exams.
*/
const unWantedLabels = ["Electronics", "Book", "Cell Phone", "Child", "Computer", "Dial Telephone", "Digital Camera", "Digital Watch", "Headphones", "Iphone", "Ipod", "Laptop", "Newspaper", "Paper", "Pc", "Phone", "Woman", "Women"]
const onlyOneLabelAllowed = ["Face", "Female", "Human", "Man", "People", "Person"]

/**
 * Process labels
 * @param {array}
 * @returns {array}
*/
const processLabels = (labels: (any)[]) => {
  // process labels against unwanted labels
  const unwantedLabelResponse = labels.map((e) => {
    if (unWantedLabels.includes(e.Name)) {
      return {
        Value: "Unwanted Label",
        Object: e
      }
    }
  })
  // process labels against unwanted labels
  const onlyOneLabelAllowedResponse = labels.map((e) => {
    // get the number of count allowed label appears
    const count: Number = countNoOfAllowedLabels(onlyOneLabelAllowed, e)
    if (count > 1) {
      return {
        Value: "Unwanted allowed label",
        Object: e
      }
    }
  })
  return [...removeUndefinedAndNull(unwantedLabelResponse), ...removeUndefinedAndNull(onlyOneLabelAllowedResponse)]
}

// Count the number of times allowed labels appear. 
const countNoOfAllowedLabels = (onlyOneLabelAllowed: any[], label: any): Number => {
  return onlyOneLabelAllowed.filter(item => item == label.Name).length;
}

// Remove null and undefined from array
const removeUndefinedAndNull = (array: (any)[]) => {
  return array.filter((e) => e !== undefined)
}


/**
 * ==========================================================================
 *                    FACIAL PROCESSING
 * ==========================================================================
*/

/**
 * Facial reponse
 * @param {array}
 * @returns {array}
*/
const processFacials = (facials: (any)[]) => {
  // check emotions
  const emotionResponse = facials.map((e) => {
    return processEmotions(e.Emotions)
  })
  // you can check gender to ensure the same gender is the same one doing the exams

  // have another function that checks landmark

  // check if mouth is open
  const mouthResponse = facials.map((e) => {
    if(e.MouthOpen.Value == true) {
      return {
        Value: "Attendee mouth is opened",
        Object: e
      }
    }
  })

  return [...removeUndefinedAndNull(emotionResponse), ...removeUndefinedAndNull(mouthResponse)]
}

/**
 * Process Emotions CALM | ANGRY | CONFUSED | DISGUSTED | HAPPY | SAD | SURPRISED | FEAR
 * This function can be expounded and more emotions added
 * 
 * @param {array} // emotions
 * @returns {array}
*/
const processEmotions = (emotions: (any)[]) => {
  const emotionResponse = emotions.map((e) => {
    switch (e.Type) {
      case 'CONFUSED':
        if (e.Confidence > 70) {
          return {
            Value: "Attendee emotions = confused",
            Object: e
          }
        }
        break;
      case 'SURPRISED':
        if (e.Confidence > 70) {
          return {
            Value: "Attendee emotions = suprised",
            Object: e
          }
        }
        break;
      case 'FEAR':
        if (e.Confidence > 70) {
          return {
            Value: "Attendee emotions = fear",
            Object: e
          }
        }
        break;
      default:
        break;
    }
  })
  return [...removeUndefinedAndNull(emotionResponse)]
}


/**
 * ===============================================================
 *                 CHIME SDK
 * ===============================================================
*/
// start preview
export async function startPreview(video: HTMLVideoElement): Promise<void> {
  await chime.previewVideoElement(video)
}
// no animation
export async function noanimation() {
  await chime.localStreamWithoutAnimation()
}

// animation blue
export async function animationblur() {
  return await chime.localStreamWithAnimationBlurring(15)
}

// animation background change
export async function animationBackground(image: string | null) {
  return await chime.localStreamWithAnimationBackgroundChange(image)
}