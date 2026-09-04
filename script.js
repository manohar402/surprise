document.addEventListener("DOMContentLoaded", () => {
    const openingScreen = document.getElementById("openingScreen");
    const cakeScene = document.getElementById("cakeScene");
    const balloonScene = document.getElementById("balloonScene");
    const photoScene = document.getElementById("photoScene");
    const letterScene = document.getElementById("letterScene");
    const finalScene = document.getElementById("finalScene");
    const startButton = document.getElementById("startButton");
    const cakeNextButton = document.getElementById("cakeNextButton");
    const photoNextButton = document.getElementById("photoNextButton");
    const letterNextButton = document.getElementById("letterNextButton");
    const envelope = document.getElementById("envelope");
    const candles = [...document.querySelectorAll(".candle")];
    const balloons = [...document.querySelectorAll(".message-balloon")];
    const photos = [...document.querySelectorAll(".memory-photo")];
    const scenes = [openingScreen, cakeScene, balloonScene, photoScene, letterScene, finalScene];

    function showScene(scene) {
        scenes.forEach((currentScene) => {
            currentScene.classList.toggle("active", currentScene === scene);
        });
    }

    startButton.addEventListener("click", () => {
        openingScreen.style.opacity = "0";
        openingScreen.style.pointerEvents = "none";
        window.setTimeout(() => showScene(cakeScene), 700);
    });

    candles.forEach((candle) => {
        candle.addEventListener("click", () => {
            candle.classList.toggle("lit");
            const allCandlesLit = candles.every((currentCandle) =>
                currentCandle.classList.contains("lit")
            );
            cakeNextButton.classList.toggle("visible", allCandlesLit);
        });
    });

    cakeNextButton.addEventListener("click", () => showScene(balloonScene));

    balloons.forEach((balloon) => {
        balloon.addEventListener("click", () => {
            const column = balloon.closest(".message-column");
            if (column.classList.contains("popped")) {
                return;
            }
            column.querySelector(".message-text").textContent = balloon.dataset.message;
            column.classList.add("popped", "revealed");
        });
    });

    photoNextButton.addEventListener("click", () => {
        showScene(letterScene);
        envelope.focus();
    });

    envelope.addEventListener("click", () => {
        const isOpened = envelope.classList.toggle("opened");
        letterScene.classList.toggle("opened", isOpened);
        envelope.setAttribute("aria-expanded", String(isOpened));
        envelope.setAttribute("aria-label", isOpened ? "Letter opened" : "Open birthday letter");
    });
    envelope.setAttribute("aria-expanded", "false");
    envelope.setAttribute("aria-label", "Open birthday letter");

    letterNextButton.addEventListener("click", () => {
        showScene(finalScene);
        startFireworks();
    });

    function startFireworks() {
        const canvas = document.getElementById("fireworksCanvas");
        const context = canvas.getContext("2d");
        const rockets = [];
        const particles = [];
        const colors = ["255, 255, 255", "255, 210, 122", "244, 161, 181", "255, 142, 112"];

        function resizeCanvas() {
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * pixelRatio;
            canvas.height = window.innerHeight * pixelRatio;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        }

        function createFirework() {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const targetY = Math.random() * viewportHeight * 0.5 + 30;
            rockets.push({
                x: Math.random() * viewportWidth,
                y: viewportHeight,
                targetY,
                speed: Math.max(5, viewportHeight / 120),
                exploded: false
            });
        }

        function explode(rocket) {
            for (let index = 0; index < 70; index += 1) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 1.5;
                particles.push({
                    x: rocket.x,
                    y: rocket.targetY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 75,
                    size: Math.random() * 2 + 1,
                    color: colors[index % colors.length]
                });
            }
        }

        function animate() {
            context.fillStyle = "rgba(2, 2, 2, 0.25)";
            context.fillRect(0, 0, window.innerWidth, window.innerHeight);

            rockets.forEach((rocket) => {
                if (rocket.exploded) {
                    return;
                }
                rocket.y -= rocket.speed;
                context.beginPath();
                context.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
                context.fillStyle = "white";
                context.fill();
                if (rocket.y <= rocket.targetY) {
                    rocket.exploded = true;
                    explode(rocket);
                }
            });

            rockets.splice(0, rockets.length, ...rockets.filter((rocket) => !rocket.exploded));

            particles.forEach((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.035;
                particle.life -= 1;
                context.beginPath();
                context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                context.fillStyle = `rgba(${particle.color}, ${particle.life / 75})`;
                context.fill();
            });

            particles.splice(0, particles.length, ...particles.filter((particle) => particle.life > 0));
            window.requestAnimationFrame(animate);
        }

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        const fireworksTimer = window.setInterval(createFirework, 500);
        window.setTimeout(() => window.clearInterval(fireworksTimer), 120000);
        createFirework();
        animate();
    }

    const photoLightbox = document.createElement("div");
    photoLightbox.className = "photo-lightbox";
    photoLightbox.setAttribute("aria-hidden", "true");
    photoLightbox.innerHTML = `
        <button class="lightbox-close" type="button" aria-label="Close photo">&times;</button>
        <button class="lightbox-arrow lightbox-previous" type="button" aria-label="Previous photo">&#8592;</button>
        <figure class="lightbox-figure">
            <img class="lightbox-image" alt="">
            <figcaption class="lightbox-caption"></figcaption>
        </figure>
        <button class="lightbox-arrow lightbox-next" type="button" aria-label="Next photo">&#8594;</button>
    `;
    document.body.appendChild(photoLightbox);

    const lightboxImage = photoLightbox.querySelector(".lightbox-image");
    const lightboxCaption = photoLightbox.querySelector(".lightbox-caption");
    let selectedPhotoIndex = 0;

    function showPhoto(index) {
        selectedPhotoIndex = (index + photos.length) % photos.length;
        const photo = photos[selectedPhotoIndex].querySelector("img");
        lightboxImage.src = photo.src;
        lightboxImage.alt = photo.alt;
        lightboxCaption.textContent = `Memory ${selectedPhotoIndex + 1} of ${photos.length}`;
        photoLightbox.classList.add("open");
        photoLightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
        photoLightbox.querySelector(".lightbox-close").focus();
    }

    function closePhoto() {
        photoLightbox.classList.remove("open");
        photoLightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
    }

    photos.forEach((photo, index) => {
        photo.setAttribute("tabindex", "0");
        photo.setAttribute("role", "button");
        photo.setAttribute("aria-label", `View memory ${index + 1}`);
        photo.addEventListener("click", () => showPhoto(index));
        photo.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                showPhoto(index);
            }
        });
    });

    photoLightbox.querySelector(".lightbox-close").addEventListener("click", closePhoto);
    photoLightbox.querySelector(".lightbox-previous").addEventListener("click", () => showPhoto(selectedPhotoIndex - 1));
    photoLightbox.querySelector(".lightbox-next").addEventListener("click", () => showPhoto(selectedPhotoIndex + 1));
    photoLightbox.addEventListener("click", (event) => {
        if (event.target === photoLightbox) {
            closePhoto();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (photoLightbox.classList.contains("open")) {
            if (event.key === "Escape") {
                closePhoto();
            } else if (event.key === "ArrowLeft") {
                showPhoto(selectedPhotoIndex - 1);
            } else if (event.key === "ArrowRight") {
                showPhoto(selectedPhotoIndex + 1);
            }
        }
    });

    const observer = new MutationObserver(() => {
        const allBalloonsPopped = balloons.every((balloon) =>
            balloon.closest(".message-column").classList.contains("popped")
        );
        if (allBalloonsPopped && balloonScene.classList.contains("active")) {
            window.setTimeout(() => showScene(photoScene), 700);
            observer.disconnect();
        }
    });
    observer.observe(balloonScene, { attributes: true, subtree: true });
});