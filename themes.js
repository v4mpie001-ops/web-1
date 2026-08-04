const backgrounds = [
    "", // Nền mặc định
    "url('images (3)_2.jpg')", 
    "url('images (6)_2.jpg')",
    "url('images (5)_2.jpg')",
    "url('images (4)_2.jpg')"
];

let currentBgIndex = 0;

function nextTheme() {
    currentBgIndex++;
    if (currentBgIndex >= backgrounds.length) {
        currentBgIndex = 0; // Quay lại nền mặc định nếu đã bấm hết vòng
    }

    if (backgrounds[currentBgIndex] === "") {
        // Về nền gốc
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "#0f172a"; 
    } else {
        // Đổi ảnh nền
        document.body.style.backgroundImage = backgrounds[currentBgIndex];
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
    }
}