// trail.js
// This script provides the AI-powered functionalities for the Artisan AI website.

// --- Global API Configuration ---
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=";
const apiKey = "AIzaSyDheDDGwx2fL5ltQxlNhtmuRC3Rh5ppZ9s"; // API key will be provided by the runtime environment.

// --- Helper Functions ---

// Function to handle API calls with retries and exponential backoff
async function callGeminiAPI(systemPrompt, userQuery) {
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    let retries = 0;
    const maxRetries = 3;
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    while (retries < maxRetries) {
        try {
            const response = await fetch(API_URL + apiKey, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429) { // Rate limit exceeded
                retries++;
                const retryAfter = Math.pow(2, retries) * 1000; // Exponential backoff
                await delay(retryAfter);
                continue;
            }

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];
            if (candidate && candidate.content?.parts?.[0]?.text) {
                return candidate.content.parts[0].text;
            } else {
                throw new Error('Unexpected API response structure.');
            }
        } catch (error) {
            console.error('Error in API call:', error);
            retries++;
        }
    }
    return 'Could not generate content. Please try again later.';
}

// Function to handle the generation process and button state
async function handleGeneration(button, targetElement, systemPrompt, userQuery, fallbackMessage) {
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Generating...';

    const generatedText = await callGeminiAPI(systemPrompt, userQuery);
    targetElement.textContent = generatedText;
    
    button.disabled = false;
    button.textContent = originalText;
}

// --- Event Listeners for HTML Elements ---

document.addEventListener('DOMContentLoaded', () => {

    // 1. Artisan Bio Generator
    const generateBioBtn = document.getElementById('generate-bio-btn');
    const storyContent = document.getElementById('story-content');
    if (generateBioBtn) {
        generateBioBtn.addEventListener('click', () => {
            const systemPrompt = `You are an expert storyteller for artisan brands. Write a heartfelt and inspiring biography about an artisan. The story should cover their passion for their craft, the journey they took to master it, and the meaning behind their creations. Keep the tone personal and authentic.`;
            const userQuery = `Write a biography for a local artisan. The artisan is passionate about their craft and wants to share their story.`;
            handleGeneration(generateBioBtn, storyContent, systemPrompt, userQuery, 'Failed to generate bio.');
        });
    }

    // 2. Product Description Generator
    const productButtons = document.querySelectorAll('.generate-desc-btn');
    productButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get the product ID from the data attribute
            const productId = button.getAttribute('data-product-id');
            const targetElement = document.getElementById(`product${productId}-desc`);
            
            // For a real application, you'd fetch product details from a database
            // based on the product ID. For this example, we'll use a hardcoded
            // prompt.
            const systemPrompt = `You are a skilled copywriter for handmade goods. Write a compelling, emotional, and detailed product description for a handmade item. Focus on the unique qualities, materials, and craftsmanship. The description should feel authentic and personal.`;
            const userQuery = `Write a description for a handmade product. The product is a handcrafted ceramic vase, made with locally sourced clay and fired in a wood-burning kiln, giving it a unique, earthy texture and a one-of-a-kind color pattern. It is inspired by the natural landscapes of the artisan's home.`;
            
            handleGeneration(button, targetElement, systemPrompt, userQuery, 'Failed to generate description.');
        });
    });

    // 3. Image Processing Tool
    const imageUpload = document.getElementById('image-upload');
    const processImageBtn = document.getElementById('process-image-btn');
    const imagePreview = document.getElementById('image-preview');

    if (imageUpload && processImageBtn && imagePreview) {
        imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                // Display image preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Image Preview" class="max-w-full h-auto rounded-lg shadow-md mt-4">`;
                }
                reader.readAsDataURL(file);
            }
        });
        
        processImageBtn.addEventListener('click', () => {
            const file = imageUpload.files[0];
            if (file) {
                // In a real application, you would send this file to a backend server
                // to handle the AI-powered background removal or enhancement.
                // The conceptual Python backend we discussed earlier would handle this.
                console.log("Image processing functionality is a backend task and not implemented in this frontend-only file.");
                alert("This feature requires a backend to process the image. Please refer to the Python blueprint file for more information.");
            } else {
                alert("Please select an image to process.");
            }
        });
    }

});
