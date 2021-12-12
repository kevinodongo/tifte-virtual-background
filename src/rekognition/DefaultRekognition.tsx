// Copyright Uniteroom.com. All Rights Reserved.
// License: Apache-2.0

export default interface DefaultRekogintion {
    /**
     * This function will compare faces and verify if they are a match.
    */
    compareFacesAndVerifyIdentity(primaryImage: string, secondaryImage: string): Promise<any>

    /**
     * This function will detect all the text within an image
    */
    detectTextFromImage(image: string): Promise<any>

    /**
     * This function will detect all the faces within image. 
    */
    detectFaces(image: string): Promise<any>

    /**
     * This function will detect all the labels within an image
    */
    detectLabels(image: string): Promise<any>

    /**
     * This function will get an image from and convert to base64
    */
    getImageFromVideo(video: HTMLVideoElement): Promise<string>

    /**
     * This function will generate base64 image
    */
    getBase64Image(image: Blob): Promise<any>

}