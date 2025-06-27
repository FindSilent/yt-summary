# AI Content Generator

- **WordPress plugin**: tự động tóm tắt nội dung bài viết theo Link và tùy chỉnh prompt.
- **proxy**: Node.js trên Vercel để gọi Gemini AI.

## Triển khai

1. Upload plugin vào `wp-content/plugins`, Activate.
2. Deploy `proxy/` lên Vercel (project Node.js).
3. Cấu hình biến `GEMINI_API_KEY` trên Vercel.
4. Sử dụng shortcode: [yt_summary]
5. 5. Chức năng lấy transcript từ Youtube chưa hoàn thiện, hiện tại chỉ lấy nội dung từ link web.
