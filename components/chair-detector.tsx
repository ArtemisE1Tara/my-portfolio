'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { analyzeImage } from '../lib/actions'
import { Loader2, Camera } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
export default function ChairDetector() {
  const [capturing, setCapturing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const {toast} = useToast()

  useEffect(() => {
    const videoElement = videoRef.current;
    return () => {
      if (videoElement && videoElement.srcObject) {
        const tracks = (videoElement.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCapturing(true)
      }
    } catch (err) {
      console.error("Error accessing the camera", err)
      toast({
        title: "Camera Error",
        description: "Unable to access the camera. Please check your permissions.",
        variant: "destructive",
      })
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg')
        analyzeCapture(imageDataUrl.split(',')[1])
      }
    }
  }

  const analyzeCapture = async (base64Image: string) => {
    setAnalyzing(true)
    setResult(null)
    try {
      console.log('Calling analyzeImage server action...')
      const analysisResult = await analyzeImage(base64Image)
      console.log('Analysis result:', analysisResult)
      setResult(analysisResult)
      toast({
        title: "Analysis Complete",
        description: "The image has been successfully analyzed.",
      })
    } catch (error) {
      console.error("Error analyzing image:", error)
      toast({
        title: "Analysis Error",
        description: "An error occurred while analyzing the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Capture and Analyze</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!capturing ? (
          <Button onClick={startCamera}>Start Camera</Button>
        ) : (
          <div className="space-y-4">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto border rounded-lg" />
            <Button onClick={captureImage} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture and Analyze
                </>
              )}
            </Button>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} width={640} height={480} />
      </CardContent>
      <CardFooter>
        {result && (
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2">Analysis Result:</h3>
            <p className="text-sm">{result}</p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}