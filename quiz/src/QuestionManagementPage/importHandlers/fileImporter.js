import * as XLSX from 'xlsx';

// D:\web\clound worker\quiz\HQT-Quiz\quiz\src\QuestionManagementPage\importHandlers\fileImporter.js

// 1. Khai báo và export hàm parseExcelOrCSV (BẮT BUỘC để sửa lỗi module)
/**
 * Đọc file Excel hoặc CSV và trả về một mảng chứa các hàng (rows) dữ liệu.
 * @param {File} file - Đối tượng File từ input.
 * @returns {Promise<string>} - Chuỗi văn bản theo định dạng quiz.
 */
export const parseExcelOrCSV = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Array of arrays

                // Process jsonData to string format
                const formattedText = convertToQuizFormat(jsonData);
                resolve(formattedText);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

// 2. Khai báo và export hàm convertToQuizFormat (Đã sửa theo yêu cầu *C. Khỉ)
/**
 * Chuyển đổi mảng dữ liệu (rows) từ file Excel/CSV sang định dạng văn bản quiz.
 * @param {Array<Array<any>>} rows - Dữ liệu từ file, mỗi hàng là [Câu hỏi, A, B, C, D, Đáp án].
 * @returns {string} - Chuỗi văn bản theo định dạng quiz.
 */
export const convertToQuizFormat = (rows) => {
    let text = "";
    let questionCount = 1;

    // Bỏ qua hàng tiêu đề (header) nếu có
    let startIndex = 0;
    if (rows.length > 0) {
        const firstCell = rows[0][0] ? rows[0][0].toString().toLowerCase() : '';
        if (firstCell.includes('question') || firstCell.includes('câu hỏi') || firstCell.includes('stt')) {
            startIndex = 1;
        }
    }

    for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        // Cần ít nhất 6 cột: Câu hỏi (0), A(1), B(2), C(3), D(4), Đáp án (5)
        if (!row || row.length < 2) continue;

        const question = row[0];
        const optA = row[1];
        const optB = row[2];
        const optC = row[3];
        const optD = row[4];
        const ans = row[5];
        // const points = row[6]; // Cột điểm có thể có

        if (!question) continue;

        text += `Câu ${questionCount}: ${question}\n`;

        let normalizedAns = '';
        if (ans) {
            normalizedAns = ans.toString().trim().toUpperCase();

            // Xử lý Đáp án dưới dạng số (1, 2, 3, 4)
            if (normalizedAns === '1') normalizedAns = 'A';
            if (normalizedAns === '2') normalizedAns = 'B';
            if (normalizedAns === '3') normalizedAns = 'C';
            if (normalizedAns === '4') normalizedAns = 'D';

            // Nếu Đáp án không phải A, B, C, D, thử so khớp với nội dung tùy chọn
            if (!['A', 'B', 'C', 'D'].includes(normalizedAns)) {
                const ansText = normalizedAns; // Nội dung đáp án (đã làm sạch)

                // So khớp với nội dung tùy chọn (so sánh không phân biệt hoa/thường)
                if (optA && ansText === optA.toString().trim().toUpperCase()) normalizedAns = 'A';
                else if (optB && ansText === optB.toString().trim().toUpperCase()) normalizedAns = 'B';
                else if (optC && ansText === optC.toString().trim().toUpperCase()) normalizedAns = 'C';
                else if (optD && ansText === optD.toString().trim().toUpperCase()) normalizedAns = 'D';
                else normalizedAns = ''; // Không tìm thấy tùy chọn phù hợp
            }
        }

        // Tạo dòng tùy chọn với dấu * đứng trước chữ cái (A, B, C, D) nếu là đáp án đúng
        // Format: *A. Nội dung
        if (optA) {
            const prefix = normalizedAns === 'A' ? '*' : '';
            text += `${prefix}A. ${optA}\n`;
        }
        if (optB) {
            const prefix = normalizedAns === 'B' ? '*' : '';
            text += `${prefix}B. ${optB}\n`;
        }
        if (optC) {
            const prefix = normalizedAns === 'C' ? '*' : '';
            text += `${prefix}C. ${optC}\n`;
        }
        if (optD) {
            const prefix = normalizedAns === 'D' ? '*' : '';
            text += `${prefix}D. ${optD}\n`;
        }

        text += `\n`;
        questionCount++;
    }
    return text;
};

// Bạn có thể cần export tất cả cùng một lúc (nếu muốn)
// export { parseExcelOrCSV, convertToQuizFormat };