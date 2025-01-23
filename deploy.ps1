# Configuration
$PROJECT_ID = "botllmfromtemplates"
$REGION = "asia-southeast1"
$SERVICE_NAME = "openai-realtime-console-webrtc"
$IMAGE_NAME = "openai-realtime-console-webrtc"
$VERSION = "v1"

# Read OPENAI_API_KEY directly from .env file
$OPENAI_API_KEY = (Get-Content .env | Where-Object { $_ -match "OPENAI_API_KEY" } | ForEach-Object { $_.Split('=')[1] }).Trim()

# Function to check if Docker is running
function Check-Docker {
    try {
        docker info | Out-Null
        Write-Host "Docker is running."
    }
    catch {
        Write-Error "Docker is not running or not installed. Please ensure Docker is installed and running."
        exit 1
    }
}

# Check if Docker is running
Check-Docker

# Check if OPENAI_API_KEY was found in .env
if (-not $OPENAI_API_KEY) {
    Write-Error "OPENAI_API_KEY not found in .env file"
    exit 1
}

# Set the project
Write-Host "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Authenticate Docker with Google Cloud
Write-Host "Authenticating Docker with Google Cloud..."
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build the Docker image
Write-Host "Building Docker image..."
docker build -t "us-central1-docker.pkg.dev/$PROJECT_ID/gcf-artifacts/$IMAGE_NAME`:$VERSION" .

# Push to Container Registry
Write-Host "Pushing to Container Registry..."
docker push "us-central1-docker.pkg.dev/$PROJECT_ID/gcf-artifacts/$IMAGE_NAME`:$VERSION"

# Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME `
    --image="us-central1-docker.pkg.dev/$PROJECT_ID/gcf-artifacts/$IMAGE_NAME`:$VERSION" `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --memory 512Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 1 `
    --set-env-vars "OPENAI_API_KEY=$OPENAI_API_KEY"

Write-Host "Deployment completed!" 