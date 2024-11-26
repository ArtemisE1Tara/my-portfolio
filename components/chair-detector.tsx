// components/ChairDetector.tsx
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Button } from "@/components/ui/button";

const ChairDetector: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Function to capture image from Raspberry Pi camera
    const captureImage = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/capture-image');
            setImage(response.data.image);
        } catch (error) {
            console.error('Error capturing image:', error);
        } finally {
            setIsLoading(false);
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
                        width={640} 
                        height={480} 
                        className="object-cover mt-4 mx-auto" 
                    />
                </div>
            )}
            <Button onClick={captureImage} disabled={isLoading} className="mx-4">
                {isLoading ? 'Capturing...' : 'Capture Image'}
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

export default ChairDetector;