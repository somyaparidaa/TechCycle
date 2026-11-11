from fastapi import FastAPI, File, UploadFile, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from predict_component import predict_image, is_model_loaded
import shutil
import os

app = FastAPI(
    title="TechCycle E-Waste Component Identification API",
    description="MobileNetV2 deep learning service for classifying 36 electronic component types and prescribing recycling safety directives.",
    version="2.0.0"
)

# Enable CORS for frontend client access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "service": "TechCycle E-Waste Identification API",
        "status": "online",
        "model_loaded": is_model_loaded()
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy" if is_model_loaded() else "degraded",
        "model_loaded": is_model_loaded(),
        "service": "TechCycle E-Waste Identification API"
    }

@app.post("/identify-ewaste")
async def identify_ewaste(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"
    try:
        # Save uploaded stream temporarily
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run inference through the MobileNetV2 pipeline
        result = predict_image(file_path)

        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)

        # If model is not loaded and fallback mode is triggered, return 503
        if result.get("status") == "model_unavailable":
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "error": "Model weights currently unavailable on the server.",
                    "details": result.get("recycling_guide"),
                    "status": "model_unavailable"
                }
            )

        if result.get("status") == "error":
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=result
            )

        return result

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": str(e), "status": "error"}
        )
