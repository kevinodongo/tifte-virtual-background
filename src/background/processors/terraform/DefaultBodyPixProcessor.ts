import LoggerClient from "../../../logger/LoggerClient";
import CanvasVideoFrameBuffer from "../../CanvasVideoFrameBuffer"
import VideoFrameBuffer from '../../VideoFrameBuffer';
import Model from "./Model"

const logger = new LoggerClient('body pix')
const bodyPix = require('@tensorflow-models/body-pix');
const tf = require("@tensorflow/tfjs")

tf.setBackend('webgl')


export default class DefaultBodyPixProcessor {
    protected targetCanvas: HTMLCanvasElement | any = document.createElement('canvas') as HTMLCanvasElement;
    protected canvasCtx = this.targetCanvas.getContext('2d');
    protected canvasVideoFrameBuffer = new CanvasVideoFrameBuffer(this.targetCanvas);
    protected sourceWidth = 0;
    protected sourceHeight = 0;
    protected model: Model | null = null
    protected segmentationCanvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
    protected segmentationCtx = this.segmentationCanvas.getContext('2d');
    protected backgroundImage: string | null = null

    constructor(image: string) {
        this.backgroundImage = image
    }

    create = async (): Promise<void> => {
        logger.info('Tensorflow BodyPix start initializing');
        // await for tf to be ready
        await tf.ready()
        // set model
        this.model = await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2
        });
        logger.info('Tensorflow processor successfully created');
    }

    process = async (buffers: (any)[]): Promise<VideoFrameBuffer[]> => {
        const inputCanvas = buffers[0].asCanvasElement() as HTMLCanvasElement;
        if (!inputCanvas) {
            return buffers;
        }
        logger.info(`This is the inputCanvas ${inputCanvas}`);

        const frameWidth = inputCanvas.width;
        const frameHeight = inputCanvas.height;
        if (frameWidth === 0 || frameHeight === 0) {
            return buffers;
        }
        logger.info(`Input Canvas frameWidth ${frameWidth}`);
        logger.info(`Input Canvas frameHeight ${frameHeight}`);

        // on first execution of process the source width will be zero
        if (this.sourceWidth === 0) {
            this.sourceWidth = frameWidth;
            this.sourceHeight = frameHeight;

            // update segmentation canvas
            this.segmentationCanvas.width = this.sourceWidth;
            this.segmentationCanvas.height = this.sourceHeight;

            // add background image
            logger.info(`Change the background image: ${this.backgroundImage}`);
        
            // this.targetCanvas.style.backgroundImage = `url(${this.backgroundImage})`
            // this.targetCanvas.style.backgroundPosition = 'center'
            // this.targetCanvas.style.objectFit = "cover"

            // update target canvas size to match the frame size
            this.targetCanvas.width = this.sourceWidth;
            this.targetCanvas.height = this.sourceHeight;
            this.targetCanvas.style.backgroundColor = "blue"

            logger.info(`Source width: ${this.sourceWidth}`);
            logger.info(`Source height: ${this.sourceHeight}`);
        }

        try {
            // segment person from image
            logger.info("Starting segmentation process")
            const segmentation = await this.model?.segmentPerson(inputCanvas)
            const coloredPartImage = await bodyPix.toMask(segmentation);
            this.segmentationCtx?.putImageData(coloredPartImage, 0, 0);
            this.drawImage(inputCanvas)
        } catch (error) {
            logger.error(`could not process background blur frame buffer due to ${error}`);
            return buffers;
        }

        logger.info(`Canvas Vide Frame Buffer OR TargetCanvas ${this.canvasVideoFrameBuffer}`)
        buffers[0] = this.canvasVideoFrameBuffer;
        return buffers
    }

    drawImage = (inputCanvas: HTMLCanvasElement) => {
        const { canvasCtx, targetCanvas } = this;
        const { width, height } = targetCanvas;
        logger.info("===============draw image==============")
        canvasCtx.drawImage(inputCanvas, 0, 0, width, height)
        canvasCtx.save();
        canvasCtx.globalCompositeOperation = "destination-out";
        canvasCtx.drawImage(this.segmentationCanvas, 0, 0, width, height);
        canvasCtx.restore();
    }



}