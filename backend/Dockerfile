# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies (FFmpeg is required for Whisper)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-load the Whisper model during build to speed up startup
# We use the same model as in main.py: "small"
RUN python -c "import whisper; whisper.load_model('small')"

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Start the application using uvicorn
# We use 0.0.0.0 to bind to all interfaces for Render
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
