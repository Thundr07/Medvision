# MedVision AI: System Architecture & Design

## 1. Overview
MedVision AI is a scalable, cloud-native medical imaging platform designed to assist radiologists by automatically detecting abnormalities in X-rays, CT scans, and MRIs using state-of-the-art Convolutional Neural Networks (CNNs).

## 2. System Architecture

### 2.1 High-Level Diagram
```mermaid
graph TD
    Client[Web Client (React/Next.js)] --> API[API Gateway (Express/Node.js)]
    API --> Auth[Auth Service (OAuth2/JWT)]
    API --> Data[Data Service (PostgreSQL)]
    API --> Storage[Image Storage (S3/GCS)]
    API --> Inference[Inference Microservice (Python/FastAPI)]
    
    Inference --> ModelRegistry[Model Registry (MLflow)]
    Inference --> GPU[GPU Cluster (NVIDIA A100)]
    
    subgraph "Training Pipeline (Offline)"
        Ingest[Data Ingestion] --> Preprocess[Preprocessing]
        Preprocess --> Train[Training (PyTorch)]
        Train --> Eval[Evaluation]
        Eval --> ModelRegistry
    end
```

### 2.2 Components
- **Frontend**: React 18 with Tailwind CSS for a responsive, dark-mode optimized radiology workstation.
- **Backend API**: Node.js/Express handling user management, case assignment, and orchestration.
- **Inference Engine**: Python/FastAPI service wrapping PyTorch models. Optimized for low-latency inference using TensorRT.
- **Database**: PostgreSQL for structured data (patient metadata, findings), Redis for caching.
- **Storage**: Object storage (S3-compatible) for DICOM/NIfTI files.

## 3. Deep Learning Models

### 3.1 Chest X-Ray Classification & Localization
- **Architecture**: DenseNet-121 (CheXNet) backbone with a custom attention mechanism.
- **Input**: 1024x1024 grayscale images (downsampled to 224x224 or 320x320 for inference).
- **Output**: 
    1. Multi-label classification (14 pathologies e.g., Pneumonia, Atelectasis).
    2. Class Activation Maps (CAM) for localization.
- **Loss Function**: Weighted Binary Cross-Entropy (to handle class imbalance).

### 3.2 Brain Tumor Segmentation (MRI)
- **Architecture**: 3D U-Net with residual connections.
- **Input**: 4-channel 3D MRI volumes (T1, T1ce, T2, FLAIR).
- **Output**: Voxel-wise segmentation map (Tumor core, Enhancing tumor, Edema).
- **Loss Function**: Dice Loss + Focal Loss.

## 4. Training Pipeline

### 4.1 Data Sources
- **NIH ChestXray14**: 112,120 X-ray images.
- **CheXpert**: 224,316 chest radiographs.
- **BraTS 2023**: Brain Tumor Segmentation dataset.

### 4.2 Preprocessing
- **Normalization**: Z-score normalization based on dataset statistics.
- **Augmentation**: Random rotation (+/- 10 deg), zoom (0.9-1.1), horizontal flip (for X-rays only).
- **DICOM Handling**: Windowing (Hounsfield units) for CT scans.

### 4.3 Training Strategy
- **Optimizer**: AdamW with weight decay 1e-4.
- **Scheduler**: Cosine Annealing with Warmup.
- **Mixed Precision**: FP16 training to reduce VRAM usage.

## 5. Security & Ethics
- **De-identification**: All DICOM tags stripped on ingestion (Pixel data only).
- **Audit Logs**: Immutable logs for every AI inference and human override.
- **Bias Mitigation**: Evaluation on stratified subsets (age, gender, race) to ensure fairness.
- **Human-in-the-loop**: AI provides *suggestions*, radiologist makes the *decision*.

## 6. Deployment
- **Containerization**: Docker for all services.
- **Orchestration**: Kubernetes (K8s) for scaling inference pods.
- **Monitoring**: Prometheus/Grafana for model drift detection.
