// Copyright Uniteroom.com. All Rights Reserved.
// License: Apache-2.0

import { EventEmitter } from "events";
import {
  AudioVideoFacade,
  ConsoleLogger,
  DefaultDeviceController,
  MeetingSessionConfiguration,
  LogLevel,
  MeetingSession,
  // DefaultMeetingSession,
  // DefaultModality,
  // DefaultVideoTile,
  // BackgroundBlurProcessor,

  // DefaultActiveSpeakerPolicy,
  BackgroundBlurVideoFrameProcessor,
  //DefaultVideoTransformDevice
} from 'amazon-chime-sdk-js';
import { DefaultBodyPixProcessor, DefaultVideoBackground } from "../background"
//import { throttle } from 'lodash';
import SupportedChimeRegions from "./SupportedChimeRegions"
import { isError } from "../utils"
import { RegionType } from "../types"

const logger = new ConsoleLogger('Chime', LogLevel.OFF);

/**
 * Chime
*/
export default class ChimeSDKClient extends EventEmitter {
  //private static ATTENDEE_THROTTLE_MS = 400;
  meetingSession: MeetingSession | null = null;
  audioVideo: AudioVideoFacade | any = null;
  region: string | null = null;
  currentAudioInputDevice: any = null;
  currentAudioOutputDevice: any = null;
  currentVideoInputDevice: any = null;
  audioInputDevices: any[] = [];
  audioOutputDevices: any[] = [];
  videoInputDevices: any[] = [];
  attendee: any = {};
  videoProcessor: any[] = []
  configuration: MeetingSessionConfiguration | null = null;

  // callbacks
  devicesUpdatedCallbacks: any[] = []
  attendeeUpdateCallbacks: any[] = []

  constructor() {
    super()
  }

  /**
  * ===========================================================
  *                MEETING SESSIONS
  * ===========================================================
 */

  /**
   * This will get user close Region. This is important when initializing chime
   * You want to be able to initialize a user when they are closer to reduce latency
  */
  lookupClosestChimeRegion = async (): Promise<RegionType> => {
    let region: string;
    try {
      const response = await fetch(`https://nearest-media-region.l.chime.aws`, {
        method: 'GET'
      });
      const json = await response.json();
      if (json.error) {
        throw new Error(json.error);
      }
      region = json.region;
    } catch (e) {
      if (isError(e)) {
        logger.error(e.message)
      }
    }
    return (
      SupportedChimeRegions.find(({ value }) => value === region) ||
      SupportedChimeRegions[0]
    );
  };

  /**
   * Preview image before each meeting
   * 
   * @param video HTMLVideoElement
  */
  previewVideoElement = async (videoElement: HTMLVideoElement): Promise<void> => {
    this.audioVideo = new DefaultDeviceController(logger, { enableWebAudio: true });
    this.videoInputDevices = await this.audioVideo.listVideoInputDevices();
    await this.localStreamWithoutAnimation()
    this.audioVideo.startVideoPreviewForVideoInput(videoElement);
  }


  /**
   * ===================================================================
   *             TOGGLE MEDIA STREAM
   * ===================================================================
  */
  // default stream
  async localStreamWithoutAnimation(): Promise<void> {
    await this.audioVideo?.chooseVideoInputDevice(this.videoInputDevices[0])
  }

  // change background by blurring                                                                                                                     
  async localStreamWithAnimationBlurring(blurAmount: number) {
    this.videoProcessor = []
    // create blur processor
    const blurOptions = {
      logger: logger,
      reportingPeriodMillis: 1000,
      blurStrength: blurAmount,
    };
    //@ts-ignore
    if (BackgroundBlurVideoFrameProcessor.isSupported(null, blurOptions)) {
      //@ts-ignore
      const blurProcessor = await BackgroundBlurVideoFrameProcessor.create(null, blurOptions)
      this.videoProcessor.push(blurProcessor);
    }
    //let transformDevice = new DefaultVideoTransformDevice(logger, this.videoInputDevices[0].deviceId, this.videoProcessor);
    let transformDevice = new DefaultVideoBackground(logger, this.videoInputDevices[0].deviceId, this.videoProcessor)
    await this.audioVideo.chooseVideoInputDevice(transformDevice)
    return transformDevice
  }

  // change background image
  //@ts-ignore
  async localStreamWithAnimationBackgroundChange(image: string | null) {
    this.videoProcessor = []
    //@ts-ignore
    if (BackgroundBlurVideoFrameProcessor.isSupported()) {
      //@ts-ignore
      const blurProcessor = new DefaultBodyPixProcessor(image)
      await blurProcessor.create()
      this.videoProcessor.push(blurProcessor);
    }
    let transformDevice = new DefaultVideoBackground(logger, this.videoInputDevices[0].deviceId, this.videoProcessor);
    await this.audioVideo.chooseVideoInputDevice(transformDevice)
    return transformDevice
  }

  /**
   * ====================================================================
   *       UPDATE THE MEDIA SESSION WITH SELECTED VIDEO AND AUDIO
   *     (These should be called everytime a user changes media devices)
   * ====================================================================
  */
  chooseAudioInputDevice = async (device: any) => {
    try {
      await this.audioVideo?.chooseAudioInputDevice(device.deviceId);
      this.currentAudioInputDevice = device;
    } catch (e) {
      if (isError(e)) {
        logger.error(e.message)
      }
    }
  };

  chooseAudioOutputDevice = async (device: any) => {
    try {
      await this.audioVideo?.chooseAudioOutputDevice(device.deviceId);
      this.currentAudioOutputDevice = device;
    } catch (e) {
      if (isError(e)) {
        logger.error(e.message)
      }
    }
  };

  chooseVideoInputDevice = async (device: any) => {
    try {
      await this.audioVideo?.chooseVideoInputDevice(device.deviceId);
      this.currentVideoInputDevice = device;
    } catch (e) {
      if (isError(e)) {
        logger.error(e.message)
      }
    }
  };




  /**
   * Destroy and reset all vairables
  */
  destroy = () => {
    this.meetingSession = null;
    this.audioVideo = null;
    this.region = null;
    this.currentAudioInputDevice = null;
    this.currentAudioOutputDevice = null;
    this.currentVideoInputDevice = null;
    this.audioInputDevices = [];
    this.audioOutputDevices = [];
    this.videoInputDevices = [];
    this.configuration = null;
  };
}