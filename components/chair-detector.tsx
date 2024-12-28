'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChairDetector: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [chairs, setChairs] = useState<{ chair_id: number; occupied: boolean }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'start' | 'capturing' | 'analyzing' | 'complete'>('start');

    const handleRequest = async <T,>(url: string, method: 'get' | 'post', data?: T) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios({ url, method, data });
            return response.data;
        } catch (error) {
            console.error(`Error with ${url}:`, error);
            setError('An error occurred. Please try again.');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const captureImage = async () => {
        setStep('capturing');
        const result = await handleRequest('/api/capture-image', 'get');
        if (result?.image) {
            setImage(result.image);
            analyzeImage(result.image);
        } else {
            setError('Failed to capture image.');
            setStep('start');
        }
    };

    const analyzeImage = async (image: string) => {
        setStep('analyzing');
        const result = await handleRequest('/api/analyze-image', 'post', { image });
        if (result?.chairs) {
            setChairs(result.chairs);
            setStep('complete');
        } else {
            setError('Analysis failed or returned no data.');
            setStep('start');
        }
    };

    const restartDetection = () => {
        setImage(null);
        setChairs([]);
        setError(null);
        setStep('start');
    };

    const occupiedCount = chairs.filter(({ occupied }) => occupied).length;
    const totalChairs = chairs.length;

    const chartData = {
        labels: chairs.map(({ chair_id }) => `Chair ${chair_id}`),
        datasets: [
            {
                label: 'Occupied',
                data: chairs.map(({ occupied }) => (occupied ? 1 : 0)),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    callback: function (tickValue: string | number) {
                        return tickValue === 1 ? 'Occupied' : 'Unoccupied';
                    },
                },
            },
        },
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center mb-4">Chair Occupancy Detection</h2>

            <div className="flex flex-col items-center space-y-4">
                <div className="w-full max-w-md shadow-md rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 text-center">Progress</h3>
                    <div className="space-y-2">
                        <div className={`p-2 rounded ${step === 'capturing' ? 'bg-gray-50' : 'bg-gray'}`}>
                            {step === 'capturing' ? 'Capturing image...' : 'Image Capture'}
                        </div>
                        <div className={`p-2 rounded ${step === 'analyzing' ? 'bg-gray' : 'bg-gray'}`}>
                            {step === 'analyzing' ? 'Analyzing image...' : 'Image Analysis'}
                        </div>
                        <div className={`p-2 rounded ${step === 'complete' ? 'bg-gray' : 'bg-gray'}`}>
                            {step === 'complete' ? 'Complete' : 'Waiting for results'}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-center mt-4">
                        {error}
                    </div>
                )}

                {step === 'start' && (
                    <button
                        onClick={captureImage}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow-md"
                        disabled={isLoading}
                    >
                        Start Detection
                    </button>
                )}

                {step === 'complete' && chairs.length > 0 && (
                    <div className="mt-4 w-full max-w-lg bg-gray-100 p-4 rounded-lg shadow-md">
                        <h3 className="font-bold mb-2">Analysis Result</h3>
                        <p className="mb-2">
                            {occupiedCount} out of {totalChairs} chairs are currently occupied (
                            {((occupiedCount / totalChairs) * 100).toFixed(2)}%).
                        </p>
                        <Bar data={chartData} options={chartOptions} />
                        <button
                            onClick={restartDetection}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600 shadow-md"
                        >
                            Start Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChairDetector;
