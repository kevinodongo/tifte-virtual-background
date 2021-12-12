// Copyright Uniteroom.com. All Rights Reserved.
// License: Apache-2.0

import AWS from "aws-sdk";
import { credentials } from "../types";
import LoggerClient from "../logger/LoggerClient";
import { isError } from "../utils"
import DefaultRekogintion from "./DefaultRekognition"
require('dotenv').config()

/**
 * [[RekognitionSDKClient]] Manages the creation and deleting of meetings
 * in AWS Chime. 
*/
export default class RekognitionSDKClient implements DefaultRekogintion {
  private logger: any = null
  private rekognition: any = null

  constructor(config: credentials, logger = new LoggerClient('rekognition')) {
    this.rekognition = new AWS.Rekognition(config);
    this.logger = logger
  }

  /**
   * Detect all the labels in an image. This function will be used
   * during session analysis to keep track of user enviroment
   * 
   * @param image
   * @returns {object}
  */
  compareFacesAndVerifyIdentity = async (primaryImage: string, secondaryImage: string): Promise<any> => {
    try {
      var params = {
        SimilarityThreshold: 80,
        SourceImage: {
          Bytes: Buffer.from(primaryImage.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        },
        TargetImage: {
          Bytes: Buffer.from(secondaryImage.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        }
      };
      this.logger.info(`Identity processing has started. The object to be processed ${params}`);
      const response = await this.rekognition.compareFaces(params).promise()
      this.logger.info("Identity processing has completed");
      return response
    } catch (e) {
      if (isError(e)) {
        this.logger.error(e.message)
      }
    }
  }

  /**
   * Detect all the text in an image. This function can be used to
   * analyse text in an ID. This can be usefull when you want to 
   * verify user names.
   * 
   * @param image
   * @returns {object}
  */
  detectTextFromImage = async (image: string): Promise<any> => {
    var params = {
      Image: {
        Bytes: Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64')
      },
      Filters: {
        WordFilter: {
          MinConfidence: 70
        }
      }
    };

    try {
      this.logger.info(`Text detection has started. The object to be processed ${params}`);
      const response = await this.rekognition.detectText(params).promise()
      this.logger.info("Text detection has completed");
      return response
    } catch (e) {
      if (isError(e)) {
        this.logger.error(e.message)
      }
    }
  }

  /**
   * Detect all the faces in an image. This function will be used
   * during session analysis to keep track of user enviroment incase
   * there is someone assisting them.
   * 
   * @param image
   * @returns {object}
  */
  detectFaces = async (image: string): Promise<any> => {
    var params = {
      Image: {
        Bytes: Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64')
      },
      Attributes: ["ALL"]
    };
    try {
      this.logger.info(`Facial detection has started. The object to be processed ${params}`);
      const facialResponse = await this.rekognition.detectFaces(params).promise()
      this.logger.info("Facial detection has completed");
      return facialResponse
    } catch (e) {
      if (isError(e)) {
        this.logger.error(e.message)
      }
    }
  }

  /**
   * Detect all the labels in an image. This function will be used
   * during session analysis to keep track of user enviroment. This
   * will be ideal to assist in analysis what is around a user.
   * 
   * @param image
   * @returns {object}
  */
  detectLabels = async (image: string): Promise<any> => {
    var params = {
      Image: {
        Bytes: Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64')
      },
      MaxLabels: 123,
      MinConfidence: 70
    };
    try {
      this.logger.info(`Label detection has started. The object to be processed ${params}`);
      const labelResponse = await this.rekognition.detectLabels(params).promise()
      this.logger.info("Label detection has completed");
      return labelResponse
    } catch (e) {
      if (isError(e)) {
        this.logger.error(e.message)
      }
    }
  }

  /**
   * Capture image and convert to blob then get the base64
   * of the image. The final baseImage will be processed with Rekognition
   * 
   * @param videoElement
   * @returns {string}
  */
  getImageFromVideo = async (video: HTMLVideoElement): Promise<string> => {
    this.logger.info(`Processing image from video element: ${video}`);
    let canvas = document.createElement('canvas')
    canvas.height = video.videoHeight
    canvas.width = video.videoWidth

    let ctx = canvas.getContext('2d')
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
    let baseImage = canvas.toDataURL('image/jpeg');
    this.logger.info('Processing has completed')
    return baseImage
  }

  /**
   * This function will get a blob image and convert it to base64.
   * Rekognition images can only be analysed in bytes.
   * 
   * @param image 
   * @returns {string}
  */
  getBase64Image = (image: Blob): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
}