<?php
/*
Plugin Name: YouTube Summary with Gemini
Description: Tóm tắt nội dung bài viết hoặc transcript YouTube qua Gemini API (qua proxy).
Version: 1.0
Author: Bạn
*/
function yt_summary_shortcode() {
    ob_start();
    ?>
    <div id="yt-summary-box" style="max-width:500px;margin:auto;">
        <input type="text" id="yt-url-input" placeholder="Nhập link YouTube hoặc bài viết..." style="width:100%;padding:10px;border:1px solid #ccc;margin-bottom:10px;">
        <textarea id="custom-prompt" placeholder="Nhập prompt tùy chỉnh (VD: Tóm tắt ngắn gọn, dịch sang tiếng Việt...)" style="width:100%;padding:10px;border:1px solid #ccc;height:80px;margin-bottom:10px;"></textarea>
        <button id="yt-summarize-btn" style="padding:10px 20px;">Tóm tắt</button>
        <div id="yt-summary-result" style="margin-top:20px;font-family:Arial;"></div>
    </div>

    <script>
    document.getElementById('yt-summarize-btn').addEventListener('click', async function() {
        const url = document.getElementById('yt-url-input').value.trim();
        const prompt = document.getElementById('custom-prompt').value.trim();
        const resultBox = document.getElementById('yt-summary-result');
        resultBox.innerHTML = '⏳ Đang xử lý...';

        try {
            const response = await fetch('https://yt-summary-git-main-iseoais-projects.vercel.app/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, prompt })
            });

            const data = await response.json();

            if (data.summary) {
                resultBox.innerHTML = '<strong>Kết quả:</strong><br>' + data.summary.replace(/\n/g, '<br>');
            } else if (data.error) {
                resultBox.innerHTML = '❌ Lỗi: ' + data.error;
            } else {
                resultBox.innerHTML = '❌ Không thể tóm tắt.';
            }
        } catch (err) {
            resultBox.innerHTML = '❌ Đã xảy ra lỗi: ' + err.message;
        }
    });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('yt_summary', 'yt_summary_shortcode');
