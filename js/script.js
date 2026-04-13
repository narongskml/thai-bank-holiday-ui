document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const yearSelect = document.getElementById('yearSelect');
    const langSelect = document.getElementById('langSelect');
    const calendarGrid = document.getElementById('calendarGrid');
    const tableBody = document.querySelector('#holidayTable tbody');
    const displayTitle = document.getElementById('displayTitle');

    // Dictionary for Multi-language
    const i18n = {
        th: {
            mainTitle: "ปฏิทินวันหยุดธนาคาร",
            labelLang: "ภาษา:",
            labelYear: "เลือกปี:",
            btnGenerate: "สร้างปฏิทิน",
            btnExcel: "ส่งออก Excel",
            btnPDF: "ส่งออก PDF",
            btnICS: "ส่งออก ICS",
            btnPrint: "พิมพ์",
            btnClear: "ล้างค่า",
            sidebarTitle: "วันหยุด",
            colDate: "วันที่",
            colName: "ชื่อวันหยุด",
            titlePrefix: "วันหยุดธนาคารไทย ปี - ",
            months: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
            days: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]
        },
        en: {
            mainTitle: "Thai Bank Holiday Calendar",
            labelLang: "Language:",
            labelYear: "Select year:",
            btnGenerate: "Generate Calendar",
            btnExcel: "Export Excel",
            btnPDF: "Export PDF",
            btnICS: "Export ICS",
            btnPrint: "Print",
            btnClear: "Clear",
            sidebarTitle: "Holidays",
            colDate: "Date",
            colName: "Name",
            titlePrefix: "Thai Bank public Holiday - ",
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        }
    };

    let holidayData = [];

    // --- Initialize Year Select ---
    function initializeYearSelect() {
        const currentYear = new Date().getFullYear();
        const years = [currentYear - 1, currentYear, currentYear + 1];
        
        yearSelect.innerHTML = '';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        });
    }

    // --- Core Logic ---

    async function loadData() {
        const year = yearSelect.value;
        const url = `https://raw.githubusercontent.com/narongskml/thai-bank-holiday-ui/refs/heads/main/data/${year}.json`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            holidayData = await response.json();
            updateUI();
        } catch (error) {
            console.error('Fetch error:', error);
            calendarGrid.innerHTML = `<p style="color:red; grid-column: span 3; text-align:center;">ไม่พบข้อมูลสำหรับปี ${year}</p>`;
        }
    }

    function updateUI() {
        const lang = langSelect.value;
        const year = yearSelect.value;
        const dict = i18n[lang];

        // 1. Update Static Text
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.innerText = dict[key];
        });
        displayTitle.innerText = `${dict.titlePrefix}${year}`;

        // 2. Clear & Render Calendar
        calendarGrid.innerHTML = '';
        for (let m = 0; m < 12; m++) {
            renderMonth(year, m, lang);
        }

        // 3. Clear & Render Table
        tableBody.innerHTML = '';
        holidayData.result.data.forEach(h => {
            const name = (lang === 'th') ? h.HolidayDescriptionThai : h.HolidayDescription;
            tableBody.innerHTML += `<tr><td>${(lang === 'th') ? h.DateThai :  h.Date}</td><td>${name}</td></tr>`;
        });
    }

    function renderMonth(year, month, lang) {
        const dict = i18n[lang];
        const date = new Date(year, month+1, 1);
        const firstDay = date.getDay();
        const lastDay = new Date(year, month + 2, 0).getDate();

        const box = document.createElement('div');
        box.className = 'month-box';
        
        let html = `<div class="month-name">${dict.months[month]}</div>`;
        html += `<div class="days-header">`;
        dict.days.forEach(d => html += `<div class="day-label">${d}</div>`);
        html += `</div><div class="days-cells">`;

        // Empty cells for first week
        for (let i = 0; i < firstDay; i++) html += `<div class="cell"></div>`;

        // Days
        for (let d = 1; d <= lastDay; d++) {
            const currentStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const holiday = holidayData.result.data.find(h => h.Date === currentStr);

            if (holiday) {
                const holidayName = (lang === 'th') ? holiday.HolidayDescriptionThai : holiday.HolidayDescriptionEng;
                html += `<div class="cell holiday" data-holiday="${holidayName}">${d}</div>`;
            } else {
                html += `<div class="cell">${d}</div>`;
            }            
        }

        html += `</div>`;
        box.innerHTML = html;
        calendarGrid.appendChild(box);
    }

    // --- Export Functions ---

    function exportICS() {
        if (!holidayData.result.data.length) return;
        const lang = langSelect.value;
        let ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PROID:-//T-LIVE-CODE//TH"].join("\r\n");
        
        holidayData.result.data.forEach(h => {
            const date = h.Date.replace(/-/g, "");
            const name = (lang === 'th') ? h.HolidayDescriptionThai : h.HolidayDescriptionEng;
            ics += "\r\n" + [
                "BEGIN:VEVENT",
                `DTSTART;VALUE=DATE:${date}`,
                `SUMMARY:${name}`,
                "END:VEVENT"
            ].join("\r\n");
        });
        
        ics += "\r\nEND:VCALENDAR";
        downloadFile(ics, `TLIVECODE_Thai_Bank_Holidays_${yearSelect.value}.ics`, "text/calendar");
    }

    function exportExcel() {
        if (!holidayData.result.data.length) return;
        const signatureTitle = 'T-LIVE-CODE';
        const signatureUrl = 'https://www.youtube.com/@t-live-code';

        const ws = XLSX.utils.json_to_sheet(holidayData.result.data);
        const range = XLSX.utils.decode_range(ws['!ref']);
        const signatureStart = range.e.r + 2;
        XLSX.utils.sheet_add_aoa(ws, [[], [signatureTitle], [signatureUrl]], { origin: { r: signatureStart, c: 0 } });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Holidays");
        XLSX.writeFile(wb, `TLIVECODE_Thai_Bank_Holidays_${yearSelect.value}.xlsx`);
    }

    function exportPDF() {
        window.print();
    }

    function downloadFile(content, fileName, contentType) {
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    // --- Listeners ---
    document.getElementById('btnGenerate').onclick = loadData;
    document.getElementById('btnExcel').onclick = exportExcel;
    document.getElementById('btnPDF').onclick = exportPDF;
    document.getElementById('btnICS').onclick = exportICS;
    document.getElementById('btnPrint').onclick = () => window.print();
    document.getElementById('btnClear').onclick = () => {
        calendarGrid.innerHTML = '';
        tableBody.innerHTML = '';
        holidayData = [];
    };
    langSelect.onchange = updateUI;
    yearSelect.onchange = loadData;

    
    // ปรับปรุงส่วนที่ดึงข้อมูลให้รองรับการเปลี่ยนภาษาและรีเฟรชหน้าจอได้ดีขึ้น
    langSelect.addEventListener('change', updateUI, { passive: true });
    yearSelect.addEventListener('change', loadData, { passive: true });

    // ฟังก์ชันสั่งพิมพ์ที่รองรับ Chrome Mobile
    document.getElementById('btnPrint').onclick = () => {
        window.print();
    };

    const tooltip = document.getElementById('tooltip');

    // ฟังก์ชันแสดง Tooltip
    function showTooltip(e, text) {
        tooltip.innerText = text;
        tooltip.style.display = 'block';
        moveTooltip(e);
    }

    // ฟังก์ชันเลื่อน Tooltip ตามเมาส์หรือนิ้ว
    function moveTooltip(e) {
        const x = e.pageX || (e.touches ? e.touches[0].pageX : 0);
        const y = e.pageY || (e.touches ? e.touches[0].pageY : 0);
        
        // ปรับตำแหน่งให้เยื้องจากนิ้ว/เมาส์เล็กน้อยเพื่อไม่ให้บัง
        tooltip.style.left = (x + 10) + 'px';
        tooltip.style.top = (y - 40) + 'px';
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    // ใช้ Event Delegation เพื่อดักจับการชี้/แตะ วันหยุด
    calendarGrid.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('holiday')) {
            showTooltip(e, e.target.getAttribute('data-holiday'));
        }
    });

    calendarGrid.addEventListener('mousemove', (e) => {
        if (e.target.classList.contains('holiday')) moveTooltip(e);
    });

    calendarGrid.addEventListener('mouseout', hideTooltip);

    // รองรับมือถือ (Touch Events)
    calendarGrid.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('holiday')) {
            // ป้องกัน default touch behavior บางอย่าง
            showTooltip(e, e.target.getAttribute('data-holiday'));
            // ซ่อนอัตโนมัติหลังจาก 3 วินาทีบนมือถือ
            setTimeout(hideTooltip, 3000);
        }
    }, { passive: true });
    // Run on Start
    initializeYearSelect();
    loadData();
});