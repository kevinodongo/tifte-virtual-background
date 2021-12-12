// Copyright Uniteroom.com. All Rights Reserved.
// License: Apache-2.0

//[[Tensorflow BodyPix Model]]
export default interface Model {
  // Can be either MobileNetV1 or ResNet50. It determines which BodyPix architecture to load.
  architecture: string,

  // Can be one of 8, 16, 32 (Stride 16, 32 are supported for the ResNet architecture and stride 8, and 16 are supported for the MobileNetV1 architecture). It specifies the output stride of the BodyPix model.
  outputStride: number,

  // Can be one of 1.0, 0.75, or 0.50 (The value is used only by the MobileNetV1 architecture and not by the ResNet architecture). It is the float multiplier for the depth (number of channels) for all convolution ops. 
  multiplier: number,

  // This argument controls the bytes used for weight quantization.
  quantBytes: number,

  // Given an image with one or more people, person segmentation predicts segmentation for all people together. It returns a PersonSegmentation object corresponding to segmentation for people in the image. 
  segmentPerson(canvas: HTMLCanvasElement): Promise<any>
}