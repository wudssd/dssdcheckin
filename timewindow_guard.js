/**
 * Time Window Guard (Bangkok time) — drop-in script
 * - ไม่แตะโค้ดเดิม
 * - บล็อกการส่งฟอร์มนอกช่วงเวลา
 * - ใส่สถานะช่วงเวลาให้อัตโนมัติบนฟอร์ม
 * วิธีใช้: include ไฟล์นี้ท้าย <body> หลังสคริปต์หลักทั้งหมด
 */
(function(){
  // ==== CONFIG (ปรับตามต้องการ) ====
  const OPEN =  { y: 2025, m: 8, d: 26, hh: 8,  mi: 0, ss: 0 };  // 27 ส.ค. 2025 08:00
  const CLOSE = { y: 2025, m: 8, d: 27, hh: 18, mi: 0, ss: 0 };  // 27 ส.ค. 2025 18:00
  const FORM_SELECTOR = '#funrunForm';     // เปลี่ยนถ้า id ฟอร์มไม่ใช่ funrunForm
  const SUBMIT_BTN_SELECTOR = '#submitBtn'; // (ไม่บังคับ) ใช้ถ้าจะเปลี่ยน label ปุ่ม

  // ==== Helpers ====
  function bangkokMs(o){
    // แปลงเวลา "ท้องถิ่นกรุงเทพฯ" -> epoch ms โดยสร้าง Date.UTC แล้วชดเชย -7 ชั่วโมง
    return Date.UTC(o.y, o.m-1, o.d, (o.hh||0)-7, o.mi||0, o.ss||0);
  }
  const OPEN_MS  = bangkokMs(OPEN);
  const CLOSE_MS = bangkokMs(CLOSE);

  function ensureStatusNode(){
    const form = document.querySelector(FORM_SELECTOR);
    if(!form) return null;
    let el = document.getElementById('timeStatus');
    if(!el){
      const wrap = document.createElement('div');
      wrap.style.marginBottom = '0.5rem';
      wrap.innerHTML = '' +
        '<label class="block text-sm font-medium text-gray-700 mb-1">สถานะช่วงเวลา</label>' +
        '<div id="timeStatus" class="status-checking">กำลังตรวจสอบเวลา...</div>';
      form.insertBefore(wrap, form.firstChild);
      el = wrap.querySelector('#timeStatus');
    }
    return el;
  }

  function updateUI(){
    const el = ensureStatusNode();
    const nowMs = Date.now();
    const isOpen = nowMs >= OPEN_MS && nowMs <= CLOSE_MS;

    // ปรับข้อความแสดงผล
    if (el){
      el.textContent = isOpen ? 'เปิดให้บันทึกแล้ว'
                              : (nowMs < OPEN_MS ? 'ยังไม่เปิดให้บันทึก' : 'ปิดการบันทึกแล้ว');
      el.className = isOpen ? 'status-in-area' : 'status-out-area';
    }

    // (ออปชัน) เปลี่ยน label ปุ่มส่ง
    const btn = document.querySelector(SUBMIT_BTN_SELECTOR);
    if (btn){
      if (!isOpen)        btn.textContent = 'ยังไม่ถึงเวลาเปิดบันทึก';
      else                btn.textContent = 'ส่งข้อมูล';
    }
  }

  // Guard การ submit (จับใน capture phase เพื่อให้มาก่อนโค้ดเดิมทั้งหมด)
  document.addEventListener('submit', function(e){
    const form = e.target;
    if (form && form.matches(FORM_SELECTOR)){
      const nowMs = Date.now();
      if (!(nowMs >= OPEN_MS && nowMs <= CLOSE_MS)){
        e.preventDefault();
        e.stopImmediatePropagation();
        const fmt = (ms) => new Date(ms).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', hour12: false });
        const openStr  = fmt(OPEN_MS);
        const closeStr = fmt(CLOSE_MS);
        if (window.Swal){
          Swal.fire('ยังไม่เปิดให้บันทึก', `ระบบเปิดระหว่าง ${openStr} - ${closeStr}`, 'info');
        } else {
          alert(`ยังไม่เปิดให้บันทึก\nระบบเปิดระหว่าง ${openStr} - ${closeStr}`);
        }
        return;
      }
    }
  }, true);

  // เรียกทันที + อัปเดตทุก 15 วิ (ไม่รอ DOMContentLoaded)
  updateUI();
  setInterval(updateUI, 15000);
})();
