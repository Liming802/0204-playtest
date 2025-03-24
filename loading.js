const images = [
    "./images/detective.png",
    "./images/me.png",
    "./images/sherlock.jpg",
    "./images/sherlock2.jpg",
    // Add all other image paths here
];

let loadedImagesCount = 0;

function preloadImages() {
    const totalImages = images.length;
    const progressBar = document.getElementById('progress');
    
    images.forEach((imageSrc) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            loadedImagesCount++;
            const progressPercentage = (loadedImagesCount / totalImages) * 100;
            progressBar.style.width = `${progressPercentage}%`;

            // Check if all images are loaded
            if (loadedImagesCount === totalImages) {
                document.getElementById('loading-screen').style.display = 'none'; // Hide loading screen
                document.getElementById('main-content').style.display = 'block'; // Show main content
            }
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${imageSrc}`);
            loadedImagesCount++;
            const progressPercentage = (loadedImagesCount / totalImages) * 100;
            progressBar.style.width = `${progressPercentage}%`;

            // Check if all images are loaded
            if (loadedImagesCount === totalImages) {
                document.getElementById('loading-screen').style.display = 'none'; // Hide loading screen
                document.getElementById('main-content').style.display = 'block'; // Show main content
            }
        };
    });
}

// Call the preloadImages function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', preloadImages);