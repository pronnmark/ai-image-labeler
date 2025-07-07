import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';
import JSZip from 'https://esm.run/jszip';

class ImageLabeler {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.images = [];
        this.apiKey = localStorage.getItem('geminiApiKey') || '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadApiKey();
    }

    setupEventListeners() {
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('selectFiles').addEventListener('click', () => this.selectFiles());
        document.getElementById('selectFolder').addEventListener('click', () => this.selectFolder());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelection(e));
        document.getElementById('folderInput').addEventListener('change', (e) => this.handleFileSelection(e));
        document.getElementById('analyzeAll').addEventListener('click', () => this.analyzeAllImages());
        document.getElementById('renameAll').addEventListener('click', () => this.renameAllImages());
        document.getElementById('downloadZip').addEventListener('click', () => this.downloadAsZip());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
    }

    loadApiKey() {
        if (this.apiKey) {
            document.getElementById('apiKey').value = this.apiKey;
            this.initializeGemini();
            this.updateApiKeyStatus(true);
        }
    }

    saveApiKey() {
        this.apiKey = document.getElementById('apiKey').value.trim();
        if (!this.apiKey) {
            alert('Please enter a valid API key');
            return;
        }
        localStorage.setItem('geminiApiKey', this.apiKey);
        this.initializeGemini();
        this.updateApiKeyStatus(true);
        alert('API key saved successfully!');
    }

    initializeGemini() {
        try {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        } catch (error) {
            console.error('Error initializing Gemini:', error);
            alert('Error initializing Gemini AI. Please check your API key.');
            this.updateApiKeyStatus(false);
        }
    }

    updateApiKeyStatus(isValid) {
        const saveButton = document.getElementById('saveApiKey');
        const apiKeyInput = document.getElementById('apiKey');
        
        if (isValid) {
            saveButton.textContent = 'API Key Saved ✓';
            saveButton.style.backgroundColor = '#27ae60';
            apiKeyInput.style.borderColor = '#27ae60';
        } else {
            saveButton.textContent = 'Save Key';
            saveButton.style.backgroundColor = '#3498db';
            apiKeyInput.style.borderColor = '#e74c3c';
        }
    }

    selectFiles() {
        document.getElementById('fileInput').click();
    }

    selectFolder() {
        document.getElementById('folderInput').click();
    }

    handleFileSelection(event) {
        const files = Array.from(event.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('No image files selected');
            return;
        }

        this.images = imageFiles.map(file => ({
            file,
            originalName: file.name,
            suggestedName: '',
            analyzed: false,
            element: null
        }));

        this.displayImages();
        this.showControls();
    }

    displayImages() {
        const grid = document.getElementById('imageGrid');
        grid.innerHTML = '';

        this.images.forEach((imageData, index) => {
            const imageCard = document.createElement('div');
            imageCard.className = 'image-card';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(imageData.file);
            img.alt = imageData.originalName;
            
            const info = document.createElement('div');
            info.className = 'image-info';
            info.innerHTML = `
                <div class="original-name">Original: ${imageData.originalName}</div>
                <div class="suggested-name">Suggested: <span class="suggested-text">Not analyzed</span></div>
                <div class="actions">
                    <button onclick="imageLabeler.analyzeImage(${index})">Analyze</button>
                    <button onclick="imageLabeler.renameImage(${index})" disabled>Rename</button>
                </div>
            `;
            
            imageCard.appendChild(img);
            imageCard.appendChild(info);
            grid.appendChild(imageCard);
            
            imageData.element = imageCard;
        });
    }

    showControls() {
        document.getElementById('controls').style.display = 'block';
    }

    async analyzeImage(index) {
        if (!this.model) {
            alert('Please save your API key first');
            return;
        }

        const imageData = this.images[index];
        const card = imageData.element;
        const suggestedText = card.querySelector('.suggested-text');
        const analyzeBtn = card.querySelector('button');
        const renameBtn = card.querySelectorAll('button')[1];

        try {
            analyzeBtn.disabled = true;
            suggestedText.textContent = 'Analyzing...';

            const imageBase64 = await this.fileToBase64(imageData.file);
            
            const prompt = `Analyze this image and suggest a descriptive filename. The filename should be detailed and descriptive, explaining what's in the image, the setting, colors, objects, people, actions, etc. Make it clear where this image would be useful. Return only the filename without extension, use underscores instead of spaces, and make it between 20-100 characters. Be very descriptive but concise.`;

            const result = await this.model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: imageData.file.type
                    }
                }
            ]);

            const response = await result.response;
            const suggestedName = response.text().trim();
            
            const fileExtension = imageData.originalName.split('.').pop();
            imageData.suggestedName = `${suggestedName}.${fileExtension}`;
            imageData.analyzed = true;

            suggestedText.textContent = imageData.suggestedName;
            renameBtn.disabled = false;
            analyzeBtn.textContent = 'Re-analyze';

        } catch (error) {
            console.error('Error analyzing image:', error);
            suggestedText.textContent = 'Error analyzing image';
            alert('Error analyzing image. Please check your API key and try again.');
        } finally {
            analyzeBtn.disabled = false;
        }
    }

    async analyzeAllImages() {
        if (!this.model) {
            alert('Please save your API key first');
            return;
        }

        const progress = document.getElementById('progress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progress.style.display = 'block';
        
        for (let i = 0; i < this.images.length; i++) {
            const percentage = ((i + 1) / this.images.length) * 100;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `Processing image ${i + 1} of ${this.images.length}`;
            
            await this.analyzeImage(i);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        progress.style.display = 'none';
        alert('All images analyzed!');
    }

    async renameImage(index) {
        const imageData = this.images[index];
        
        if (!imageData.analyzed || !imageData.suggestedName) {
            alert('Please analyze the image first');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(imageData.file);
            link.download = imageData.suggestedName;
            link.click();
            
            alert(`Image will be downloaded as: ${imageData.suggestedName}`);
        } catch (error) {
            console.error('Error renaming image:', error);
            alert('Error renaming image');
        }
    }

    async renameAllImages() {
        const analyzedImages = this.images.filter(img => img.analyzed);
        
        if (analyzedImages.length === 0) {
            alert('No analyzed images to rename');
            return;
        }

        for (const imageData of analyzedImages) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(imageData.file);
            link.download = imageData.suggestedName;
            link.click();
            
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        alert(`${analyzedImages.length} images will be downloaded with new names`);
    }

    async downloadAsZip() {
        const analyzedImages = this.images.filter(img => img.analyzed);
        
        if (analyzedImages.length === 0) {
            alert('No analyzed images to download');
            return;
        }

        const progress = document.getElementById('progress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progress.style.display = 'block';
        progressText.textContent = 'Creating ZIP file...';
        
        try {
            const zip = new JSZip();
            
            for (let i = 0; i < analyzedImages.length; i++) {
                const imageData = analyzedImages[i];
                const percentage = ((i + 1) / analyzedImages.length) * 100;
                progressFill.style.width = `${percentage}%`;
                progressText.textContent = `Adding ${imageData.suggestedName} to ZIP...`;
                
                const arrayBuffer = await imageData.file.arrayBuffer();
                zip.file(imageData.suggestedName, arrayBuffer);
            }
            
            progressText.textContent = 'Generating ZIP file...';
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'STORE',
                compressionOptions: {
                    level: 1
                }
            });
            
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const zipName = `renamed_images_${timestamp}.zip`;
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = zipName;
            link.click();
            
            alert(`ZIP file "${zipName}" created with ${analyzedImages.length} renamed images`);
            
        } catch (error) {
            console.error('Error creating ZIP file:', error);
            alert('Error creating ZIP file. Please try again.');
        } finally {
            progress.style.display = 'none';
        }
    }

    clearAll() {
        this.images = [];
        document.getElementById('imageGrid').innerHTML = '';
        document.getElementById('controls').style.display = 'none';
        document.getElementById('fileInput').value = '';
        document.getElementById('folderInput').value = '';
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

const imageLabeler = new ImageLabeler();
window.imageLabeler = imageLabeler;