// Danh sách các Theme (Hình nền)
const appThemes = [
    { name: "Mặc định (Xám Tối)", background: "#1e293b", isImage: false },
    { name: "Bầu trời đêm (Moon)", background: "images (3).jpg", isImage: true },
    { name: "Hoa anh đào hoàng hôn", background: "images (4).jpg", isImage: true },
    { name: "Đồng cỏ xanh tươi", background: "images (5).jpg", isImage: true },
    { name: "Cổng Torii kỳ ảo", background: "images (6).jpg", isImage: true }
];

let currentThemeIndex = parseInt(localStorage.getItem('savedTheme')) || 0;

function applyTheme(index) {
    const theme = appThemes[index];
    if (theme.isImage) {
        document.body.style.backgroundImage = `url('${theme.background}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
    } else {
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = theme.background;
    }
    localStorage.setItem('savedTheme', index);
}

function nextTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % appThemes.length;
    applyTheme(currentThemeIndex);
}

// Chạy theme ngay khi load file
applyTheme(currentThemeIndex);