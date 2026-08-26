gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("car-canvas");
const context = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}
window.addEventListener("resize", resizeCanvas);

// 1. Rasmlar soni 31 ta deb belgilandi
const frameCount = 31;

// Rasmlar manzilini generatsiya qilish va natural sorting orqali to'g'ri saralash
const imageSources = Array.from({ length: frameCount }, (_, i) => `./img/car${i + 1}.jpg`);

imageSources.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
});

const images = [];
const carSequence = { frame: 0 };
let imagesLoaded = 0;

// 2. Preload — 31 ta rasmni xotiraga to'liq va silliq yuklab olish
imageSources.forEach((src, index) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === frameCount) {
            resizeCanvas();
            initScrollShowcase();
        }
    };
    images[index] = img;
});

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const img = images[carSequence.frame];
    
    if (img && img.complete) {
        // Ekranga cover shaklida to'g'ri va proportsional joylashtirish
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;

        context.drawImage(
            img,
            0, 0, img.width, img.height,
            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
        );
    }
}

// 3. Dynamic Scroll & Extended 31-Frame Focus Function
function initScrollShowcase() {
    // 31 kadr ketma-ketligini scroll-ga o'ta silliq bog'lash
    gsap.to(carSequence, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: "#scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4, // Kadrlar ko'pligi sababli scrub qiymati silliqroq qilindi
        },
        onUpdate: render
    });

    // Detallarga dinamik kamera fokuslanishi (Scale & Pan)
    const cameraTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });

    cameraTimeline
        // 1-bosqich: Boshlanish va Frontal panorama (1-7 kadrlarda kapot va chiroqlar)
        .to(canvas, { scale: 1.15, xPercent: 0, yPercent: -2, duration: 2.5 })
        
        // 2-bosqich: Old g'ildiraklar va yon aerodinamika (8-15 kadrlarda yon tomonga surilish)
        .to(canvas, { scale: 1.08, xPercent: -4, yPercent: 0, duration: 3 })
        
        // 3-bosqich: Orqa qism, disklar va exhaust (16-23 kadrlarda orqa tomonga fokus)
        .to(canvas, { scale: 1.25, xPercent: 4, yPercent: 1, duration: 3 })
        
        // 4-bosqich: Salon va interyerga sho'ng'ish (24-31 kadrlarda maksimal Zoom-In)
        .to(canvas, { scale: 1.75, xPercent: 0, yPercent: -1, duration: 3.5 });

    // Matn kartochkalarining 31 kadrli uzun masofaga moslangani
    const cards = [
        { id: '#card-1', start: 0, end: 25 },
        { id: '#card-2', start: 25, end: 50 },
        { id: '#card-3', start: 50, end: 75 },
        { id: '#card-4', start: 75, end: 100 }
    ];

    cards.forEach(cardInfo => {
        const el = document.querySelector(cardInfo.id);
        if (el) {
            ScrollTrigger.create({
                trigger: "#scroll-container",
                start: `${cardInfo.start}% top`,
                end: `${cardInfo.end}% top`,
                onEnter: () => el.classList.add('active'),
                onLeave: () => el.classList.remove('active'),
                onEnterBack: () => el.classList.add('active'),
                onLeaveBack: () => el.classList.remove('active')
            });
        }
    });
}