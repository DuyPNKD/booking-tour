export function getRatingLabel(rating) {
    const score = parseFloat(rating);
    if (score > 9.0) return "Tuyệt vời";
    if (score >= 8.0) return "Rất tốt";
    if (score >= 7.0) return "Tốt";
    if (score >= 6.0) return "Khá";
    return "Trung bình";
}
