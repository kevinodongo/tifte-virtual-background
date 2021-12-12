// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import VideoFrameBuffer from './VideoFrameBuffer';

/**
 * [[CanvasVideoFrameBuffer]] implements [[VideoFrameBuffer]]. It internally holds an `HTMLCanvasElement`.
 */
export default class CanvasVideoFrameBuffer implements VideoFrameBuffer {
  private destroyed: boolean = false;
  framerate: number = 0
  width: number = 0
  height: number = 0

  constructor(private canvas: HTMLCanvasElement) {}

  destroy(): void {
    //@ts-ignore
    this.canvas = null;
    this.destroyed = true;
  }

  async asCanvasImageSource(): Promise<CanvasImageSource> {
    if (this.destroyed) {
      return Promise.reject('canvas buffer is destroyed');
    }
    return Promise.resolve(this.canvas);
  }

  asCanvasElement(): HTMLCanvasElement | null {
    return this.canvas;
  }
}