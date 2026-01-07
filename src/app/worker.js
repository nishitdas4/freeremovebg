import { env, AutoModel, AutoProcessor, RawImage } from '@xenova/transformers';

// Skip local model checks to fetch directly from Hugging Face Hub
env.allowLocalModels = false;
env.useBrowserCache = true;

class Segmenter {
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            // We use the State-of-the-Art 'RMBG-1.4' model
            // quantized (q8) for browser speed without losing accuracy
            this.instance = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
                quantized: true,
                progress_callback,
            });
        }
        return this.instance;
    }
}

class Processor {
    static instance = null;

    static async getInstance() {
        if (this.instance === null) {
            this.instance = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { imageBlob } = event.data;

    try {
        // 1. Load Model & Processor
        const model = await Segmenter.getInstance((data) => {
             self.postMessage({ status: 'loading', data });
        });
        const processor = await Processor.getInstance();

        // 2. Decode Image
        const image = await RawImage.fromBlob(imageBlob);

        // 3. Pre-process (Resize & Normalize for the AI)
        const { pixel_values } = await processor(image);

        // 4. Inference (The "Thinking" Phase)
        const { output } = await model({ input: pixel_values });

        // 5. Post-process (Create the Mask)
        // We read the alpha channel directly from the tensor
        const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);

        // 6. Composite (Apply Mask to Original)
        const canvas = new OffscreenCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        // Draw original
        const imgBitmap = await createImageBitmap(imageBlob);
        ctx.drawImage(imgBitmap, 0, 0);

        // Update pixel data with the new Alpha Mask
        const pixelData = ctx.getImageData(0, 0, image.width, image.height);
        const maskData = mask.data;

        for (let i = 0; i < maskData.length; i++) {
            // The mask is grayscale. We take the pixel value and set it as Alpha (A)
            // RGBA -> A is at index i*4 + 3
            pixelData.data[i * 4 + 3] = maskData[i];
        }

        ctx.putImageData(pixelData, 0, 0);

        // 7. Return Result
        const blob = await canvas.convertToBlob({ type: 'image/png' });
        self.postMessage({ status: 'complete', blob });

    } catch (e) {
        self.postMessage({ status: 'error', error: e.message });
    }
});