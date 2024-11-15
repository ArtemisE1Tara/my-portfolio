'use client';
// components/ImageCaptureAndAnalyze.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Button } from "@/components/ui/button";

const ImageCaptureAndAnalyze: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Function to capture the image from user’s camera
    const captureImage = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement('video');
            video.srcObject = stream;
            await video.play();

            // Set up canvas to capture a frame from video
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            const capturedImage = canvas.toDataURL('image/png');
            
            setImage(capturedImage);

            // Stop the video stream
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('Error capturing image:', error);
        }
    };

    // Function to send image to OpenAI Vision API
    const analyzeImage = async () => {
        if (!image) return;

        setIsLoading(true);
        setAnalysisResult(null);

        try {
            const response = await axios.post(
                '/api/analyze-image',
                { image },
                { headers: { 'Content-Type': 'application/json' } }
            );

            // Update to access the correct property from the API response
            setAnalysisResult(response.data.description);
        } catch (error) {
            console.error('Error analyzing image:', error);
            setAnalysisResult('Failed to analyze image');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {image && (
              <div className="text-center">
                <Image 
                  src={image} 
                  alt="Captured" 
                  width={256} 
                  height={192} 
                  className="object-cover mt-4 mx-auto" 
                />
              </div>
            )}
            <Button onClick={captureImage} disabled={isLoading} className="mx-4">
                Capture Image
            </Button>
            <Button onClick={analyzeImage} disabled={!image || isLoading}>
                {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </Button>
            {analysisResult && (
                <div className="mt-4 p-4 rounded">
                    <h3 className="font-bold">Analysis Result:</h3>
                    <p>{analysisResult}</p>
                </div>
            )}
        </div>
    );
};

export default ImageCaptureAndAnalyze;
