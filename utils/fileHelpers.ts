
// A tiny valid PDF Base64 (Blank page with text "File too large for demo storage")
// This allows the UI to function without crashing local storage with 20MB files.

// Minimal valid PDF Base64
const VALID_PLACEHOLDER_PDF = "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgoxMDAgNzAwIFRkCihQbGFjZWhvbGRlciBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDExNyAwMDAwMCBuIAowMDAwMDAwMjM1IDAwMDAwIG4gCjAwMDAwMDAzMjIgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZwo0MTYKJSVFT0YK";

export const compressImage = (file: File, quality = 0.5, maxWidth = 600): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    // Fallback to original if context fails
                    resolve(event.target?.result as string);
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                // Force jpeg for better compression
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) resolve(reader.result as string);
            else reject("Failed to read file");
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const processFileForUpload = async (file: File): Promise<string> => {
    // Strict limit for LocalStorage (300KB)
    // We cannot increase this limit as it is enforced by the browser.
    const MAX_FILE_SIZE_BYTES = 300 * 1024; 

    // Only compress images
    if (file.type.startsWith('image/')) {
        try {
            const compressed = await compressImage(file);
            // Check if even the compressed version is too big
            if (compressed.length > (MAX_FILE_SIZE_BYTES * 1.37)) { // Base64 overhead approx 37%
                 console.warn(`Compressed image still too large: ${file.name}`);
                 alert(`Warning: Image "${file.name}" is large. It might fill up your storage quickly.`);
            }
            return compressed;
        } catch (e) {
            console.warn("Compression failed, using placeholder", e);
            // Don't throw, just return a placeholder to keep app working
            return VALID_PLACEHOLDER_PDF; 
        }
    } else {
        // For PDFs and other files
        if (file.size > MAX_FILE_SIZE_BYTES) {
            // Instead of throwing an error and breaking the flow, we return a placeholder.
            // This is necessary for a demo app using LocalStorage.
            console.warn(`File "${file.name}" is too large (${(file.size/1024).toFixed(0)}KB). Saving placeholder.`);
            alert(`Note: "${file.name}" is too large for browser storage. A placeholder will be saved instead.`);
            return VALID_PLACEHOLDER_PDF;
        }
        return await readFileAsBase64(file);
    }
};
