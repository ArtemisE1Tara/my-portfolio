// components/ChairDetector.tsx
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChairDetector: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [chairs, setChairs] = useState<{ chair_id: number; occupied: boolean }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        const result = await handleRequest('/api/capture-image', 'get');
        if (result) setImage(result.image);
    };

    const analyzeImage = async () => {
        if (!image) return;
        const result = await handleRequest('/api/analyze-image', 'post', { image });
        if (result) setChairs(result.chairs);
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
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Chair Occupancy Detection</h2>
            {image && (
                <div className="text-center">
                    <h3 className="font-bold mt-4">Captured Image:</h3>
                    <Image
                        src={image}
                        alt="Captured"
                        width={640}
                        height={480}
                        className="object-cover mt-2 mx-auto"
                    />
                </div>
            )}
            
            <div className="flex justify-center space-x-4">
                <Button onClick={captureImage} disabled={isLoading}>
                    {isLoading ? 'Capturing...' : 'Capture Image'}
                </Button>
                <Button onClick={analyzeImage} disabled={!image || isLoading}>
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                </Button>
            </div>

            {error && (
                <div className="text-red-500 text-center mt-4">
                    {error}
                </div>
            )}

            {chairs.length > 0 && (
                <div className="mt-4 p-4 bg-gray-100 rounded shadow">
                    <h3 className="font-bold mb-2" style={{color: 'black'}}>Analysis Result:</h3>
                    <p className="mb-2" style={{color: 'black'}}>
                        {occupiedCount} out of {totalChairs} chairs are currently occupied (
                        {((occupiedCount / totalChairs) * 100).toFixed(2)}%).
                    </p>
                    <Bar data={chartData} options={chartOptions} />
                </div>
            )}
        </div>
    );
};

export default ChairDetector;
