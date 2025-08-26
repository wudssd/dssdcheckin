
/**
 * Time Window Guard (Bangkok time) — drop-in script
 * - Does NOT modify your existing code
 * - Blocks form submission outside the configured window
 * - Shows a live status banner in the form
 * How to use: include this script near the end of <body> AFTER your main scripts.
 */
(function(){
  // ==== CONFIG (ปรับตามต้องการ) ====
  const OPEN =  { y: 2025, m: 8, d: 27, hh: 8,  mi: 0, ss: 0 };  // 27 ส.ค. 2025 08:00
  const CLOSE = { y: 2025, m: 8, d: 27, hh: 18, mi: 0, ss: 0 };  // 27 ส.ค. 2025 18:00
  const FORM_SELECTOR = '#funrunForm';     // เปลี่ยนถ้า id ฟอร์มไม่ใช่ funrunForm
  const SUBMIT_BTN_SELECTOR = '#submitBtn'; // เปลี่ยนถ้าปุ่มส่งไม่ใช่ submitBtn

  // ==== Helpers ====
  function bangkokMs(o){ return Date.UTC(o.y, o.m-1, o.d, (o.hh||0)-7, o.mi||0, o.ss||0); } // UTC-7h to get BKK
  const OPEN_MS  = bangkokMs(OPEN);
  const CLOSE_MS = bangkokMs(CLOSE);
  let isOpenWindow = false;

  function ensureStatusNode(){
    const form = document.querySelector(FORM_SELECTOR);
    if(!form) return null;
    let el = document.getElementById('timeStatus');
    if(!el){
      const wrap = document.createElement('div');
      wrap.style.marginBottom = '0.5rem';
      wrap.innerHTML = '<label class="block text-sm font-medium text-gray-700 mb-1">สถานะช่วงเวลา</label><div id="timeStatus" class="status-checking">กำลังตรวจสอบเวลา...</div>';
      form.insertBefore(wrap, form.firstChild);
      el = wrap.querySelector('#timeStatus');
    }
    return el;
  }

  function updateUI(){
    const el = ensureStatusNode();
    const nowMs = Date.now();
    isOpenWindow = nowMs >= OPEN_MS && nowMs <= CLOSE_MS;

    if (el){
      el.textContent = isOpenWindow ? 'เปิดให้บันทึกแล้ว' : (nowMs < OPEN_MS ? 'ยังไม่เปิดให้บันทึก' : 'ปิดการบันทึกแล้ว');
      el.className = isOpenWindow ? 'status-in-area' : 'status-out-area';
    }
  }

  // Guard การ submit (จับใน capture phase เพื่อให้มาก่อนโค้ดเดิม)
  document.addEventListener('submit', function(e){
    const form = e.target;
    if (form && form.matches(FORM_SELECTOR)){
      const nowMs = Date.now();
      if (!(nowMs >= OPEN_MS && nowMs <= CLOSE_MS)){
        e.preventDefault();
        e.stopImmediatePropagation();
        const openStr  = new Date(OPEN_MS).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', hour12: false });
        const closeStr = new Date(CLOSE_MS).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', hour12: false });
        if (window.Swal){
          Swal.fire('ยังไม่เปิดให้บันทึก', `ระบบเปิดระหว่าง ${openStr} - ${closeStr}`, 'info');
        } else {
          alert(`ยังไม่เปิดให้บันทึก\nระบบเปิดระหว่าง ${openStr} - ${closeStr}`);
        }
        return;
      }
    }
  }, true);

  // เรียกทันที + อัปเดตทุก 15 วิ (ไม่พึ่ง DOMContentLoaded)
  updateUI();
  setInterval(updateUI, 15000);
})();
