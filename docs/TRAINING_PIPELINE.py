import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms
from torch.utils.data import DataLoader, Dataset
from PIL import Image
import os
import pandas as pd
from sklearn.metrics import roc_auc_score

# --- Configuration ---
CONFIG = {
    'batch_size': 32,
    'epochs': 20,
    'learning_rate': 1e-4,
    'num_classes': 14,
    'image_size': 224,
    'device': 'cuda' if torch.cuda.is_available() else 'cpu'
}

# --- Dataset Definition ---
class ChestXrayDataset(Dataset):
    def __init__(self, csv_file, root_dir, transform=None):
        self.annotations = pd.read_csv(csv_file)
        self.root_dir = root_dir
        self.transform = transform
        self.labels = [
            'Atelectasis', 'Cardiomegaly', 'Effusion', 'Infiltration', 'Mass',
            'Nodule', 'Pneumonia', 'Pneumothorax', 'Consolidation', 'Edema',
            'Emphysema', 'Fibrosis', 'Pleural_Thickening', 'Hernia'
        ]

    def __len__(self):
        return len(self.annotations)

    def __getitem__(self, idx):
        img_name = os.path.join(self.root_dir, self.annotations.iloc[idx, 0])
        image = Image.open(img_name).convert('RGB')
        
        # Multi-label targets
        labels = self.annotations.iloc[idx][self.labels].values.astype('float32')
        labels = torch.tensor(labels)

        if self.transform:
            image = self.transform(image)

        return image, labels

# --- Model Architecture (DenseNet-121) ---
class MedVisionModel(nn.Module):
    def __init__(self, num_classes):
        super(MedVisionModel, self).__init__()
        # Load pre-trained DenseNet121
        self.densenet = models.densenet121(pretrained=True)
        
        # Replace classifier for multi-label task
        num_ftrs = self.densenet.classifier.in_features
        self.densenet.classifier = nn.Sequential(
            nn.Linear(num_ftrs, num_classes),
            nn.Sigmoid() # Sigmoid for multi-label classification
        )

    def forward(self, x):
        return self.densenet(x)

# --- Training Loop ---
def train_model():
    # Transforms
    transform = transforms.Compose([
        transforms.Resize((CONFIG['image_size'], CONFIG['image_size'])),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Data Loaders (Mock paths)
    train_dataset = ChestXrayDataset(csv_file='train.csv', root_dir='images/', transform=transform)
    train_loader = DataLoader(train_dataset, batch_size=CONFIG['batch_size'], shuffle=True, num_workers=4)

    # Model Setup
    model = MedVisionModel(num_classes=CONFIG['num_classes']).to(CONFIG['device'])
    criterion = nn.BCELoss() # Binary Cross Entropy for multi-label
    optimizer = optim.AdamW(model.parameters(), lr=CONFIG['learning_rate'])

    print(f"Starting training on {CONFIG['device']}...")

    for epoch in range(CONFIG['epochs']):
        model.train()
        running_loss = 0.0
        
        for images, labels in train_loader:
            images = images.to(CONFIG['device'])
            labels = labels.to(CONFIG['device'])

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()

        print(f"Epoch [{epoch+1}/{CONFIG['epochs']}], Loss: {running_loss/len(train_loader):.4f}")

        # Validation step would go here...

    # Save Model
    torch.save(model.state_dict(), 'medvision_densenet121.pth')
    print("Training complete. Model saved.")

if __name__ == "__main__":
    # This script is for demonstration of the training pipeline architecture.
    # It requires the actual dataset (NIH ChestXray14) to run.
    print("MedVision AI Training Pipeline Loaded.")
