// Practice vocabulary. Lessons pick the words that only use keys learned so far.

const list = (s: string) => [...new Set(s.split(/\s+/).filter(Boolean))];

export const THAI_WORDS = list(`
  กา ดา หา ว่า ด่า กด สด หก ดาว สาว กาว หาว หาด วาด กวาด ฟาด สาด สวด กวด
  ห้า ฟ้า ก้าว ด้าว เกา เดา เสา เหา เก่า เว้า เสก
  น้ำ ไฟ ดิน ลม ฝน ดาว เดือน ปี วัน คืน เช้า เย็น บ่าย สาย ดึก ตอน เวลา นาที ชั่วโมง
  บ้าน ห้อง ประตู หน้าต่าง โต๊ะ เก้าอี้ เตียง หมอน ผ้า แก้ว จาน ชาม ช้อน ส้อม มีด หม้อ กระทะ ตู้
  พ่อ แม่ พี่ น้อง ลูก หลาน ปู่ ย่า ตา ยาย ลุง ป้า น้า อา เพื่อน ครู นักเรียน หมอ พยาบาล
  กิน ดื่ม นอน ตื่น เดิน วิ่ง นั่ง ยืน พูด ฟัง อ่าน เขียน คิด รู้ เห็น ดู มอง จำ ลืม ทำ ไป มา ให้ เอา ได้ มี เป็น อยู่ คือ
  รัก ชอบ กลัว ดีใจ เสียใจ โกรธ เหนื่อย หิว อิ่ม ง่วง สบาย ร้อน หนาว อุ่น
  ใหญ่ เล็ก ยาว สั้น สูง ต่ำ หนัก เบา เร็ว ช้า ใหม่ ดี สวย งาม ใกล้ ไกล มาก น้อย
  แดง เขียว เหลือง ขาว ดำ ชมพู ม่วง ส้ม เทา น้ำตาล
  หนึ่ง สอง สาม สี่ หก เจ็ด แปด เก้า สิบ ร้อย พัน หมื่น แสน ล้าน
  ข้าว ปลา ไก่ หมู เนื้อ ไข่ ผัก ผลไม้ กล้วย มะม่วง แตงโม นม กาแฟ ชา ขนม เกลือ พริก
  แมว หมา นก ม้า วัว ควาย ช้าง เสือ ลิง งู กบ เต่า ผึ้ง มด
  ต้นไม้ ดอกไม้ ใบไม้ ภูเขา ทะเล แม่น้ำ ทราย หิน ป่า สวน ทุ่ง นา
  เมือง ถนน รถ เรือ ตลาด ร้าน โรงเรียน วัด สนาม สถานี สะพาน
  งาน เงิน ทอง ของ เรื่อง ความ คน ชีวิต ใจ หัว หู ปาก มือ เท้า ขา แขน หลัง ผม
  และ หรือ แต่ ถ้า เพราะ กับ ที่ ใน บน ล่าง ข้าง หน้า จาก ถึง เมื่อ แล้ว ยัง จะ ก็ ไม่ ใช่ ทุก บาง
  เรา เขา ฉัน คุณ ท่าน มัน พวก
  สวัสดี ขอบคุณ ขอโทษ ลาก่อน ยินดี
  ภาษา ไทย อังกฤษ คำ ประโยค เสียง เพลง หนังสือ ปากกา ดินสอ กระดาษ สมุด
  คอมพิวเตอร์ โทรศัพท์ แป้น พิมพ์ จอ เมาส์ ข้อมูล ระบบ โปรแกรม เว็บ ไฟล์
  สนุก ตั้งใจ ฝึก ซ้อม เก่ง ช่วย เริ่ม จบ เปิด ปิด ถาม ตอบ เรียน สอน รอ ซื้อ ขาย จ่าย ซ้าย ขวา ซอย
  ฤดู ศาลา ธง ธรรมชาติ ฆ่า ระฆัง ปฏิทิน กุญแจ เณร บัณฑิต ฐาน มณฑป ครุฑ ผู้เฒ่า วัฒนธรรม
  จุฬา กีฬา นกฮูก ฉลาด ฉาก ศูนย์ ศิลปะ ศุกร์ จันทร์ อาทิตย์ อังคาร พุธ เสาร์ กรุงเทพฯ
  ฝัน ฝาก ฝา ผิว ผี ผ่าน ปู ปิด ปั่น ใบ ใส ใส่ ใต้ ใคร ไหน ไหม ไม้ ไข้
  เด็ก เล่น ร้อง เต้น ยิ้ม หัวเราะ ร้องไห้ ช่วงนี้ ตอนนี้ วันนี้ พรุ่งนี้ เมื่อวาน
  อาหาร อร่อย หวาน เค็ม เปรี้ยว เผ็ด ขม จืด สุก ดิบ ทอด ต้ม ผัด ย่าง นึ่ง
  ทาง เลี้ยว ตรง ขึ้น ลง เข้า ออก หยุด จอด เดินทาง เที่ยว พัก โรงแรม ตั๋ว
`);

export const ENGLISH_WORDS = list(`
  a as ad add ads all ask asks fall falls flask lad lads sad salad dad dads lass glass
  has had half hall gas glad flag shall dash slash hash
  the be to of and in that have it for not on with he as you do at this but his by from
  they we say her she or an will my one all would there their what so up out if about who get
  which go me when make can like time no just him know take people into year your good some
  could them see other than then now look only come its over think also back after use two how
  our work first well way even new want because any these give day most us
  is are was were been being has had did does said made went came took got saw
  home row key keys type typing finger fingers hand hands left right top bottom
  water fire earth air light dark night morning evening rain sun moon star sky cloud wind
  house room door window table chair bed desk lamp cup plate spoon fork knife book pen paper
  mother father sister brother friend teacher student doctor child children family
  eat drink sleep walk run sit stand speak listen read write think learn teach help start stop
  big small long short high low heavy fast slow old young happy quiet loud easy hard soft warm cold
  red green blue yellow white black orange purple brown gray pink
  apple bread rice fish egg milk coffee tea sugar salt soup cake fruit
  cat dog bird horse cow fox owl bee frog duck
  tree flower leaf hill river sea sand stone forest garden field road city town street bridge
  code bug test build ship fix line file data screen mouse system program web page
  quick brown jumps lazy zebra quiz jazz box fix mix six wax queen quite equal extra zero
`);

export const THAI_SENTENCES = [
  'ฝนตกเบา ๆ ตอนเช้า แมวนอนข้างหน้าต่าง',
  'ฝึกพิมพ์ทุกวันวันละนิด แล้วนิ้วจะจำแป้นได้เอง',
  'กาแฟแก้วนี้หอมมาก ดื่มแล้วพร้อมทำงาน',
  'อย่าก้มมองแป้น ให้มองที่จอแล้วพิมพ์ช้า ๆ ให้ถูกก่อน',
  'เด็ก ๆ วิ่งเล่นในสวนจนพระอาทิตย์ตก',
  'ร้านเล็ก ๆ หัวมุมถนนขายข้าวผัดอร่อยที่สุด',
  'ทะเลสีฟ้ากับทรายขาว ทำให้ใจสงบ',
  'เมื่อพิมพ์ได้แม่นแล้ว ความเร็วจะตามมาเอง',
  'วันหยุดนี้เราจะไปเที่ยวภูเขากับเพื่อน',
  'หนังสือเล่มนี้อ่านง่าย เหมาะกับคนเริ่มต้น',
  'นกบินกลับรังเมื่อฟ้าเริ่มมืด',
  'เปิดเพลงเบา ๆ แล้วตั้งใจทำงานทีละอย่าง',
  'วางนิ้วไว้ที่แถวกลาง แล้วนิ้วอื่นจะหาที่ของตัวเองได้',
  'ฤดูฝนปีนี้มาเร็ว ถนนในซอยจึงมีน้ำขัง',
  'ศิลปะกับวัฒนธรรมทำให้เมืองนี้มีเสน่ห์',
];

export const ENGLISH_SENTENCES = [
  'The quick brown fox jumps over the lazy dog.',
  'Practice a little every day and your fingers will learn the keys.',
  'Keep your eyes on the screen, not on your hands.',
  'Accuracy comes first; speed will follow.',
  'Rain tapped softly on the window while the cat slept.',
  'She packed a small bag, locked the door, and walked to the station.',
  'Good code is easy to read, easy to test, and easy to change.',
  'We met at 7:30, ordered two coffees, and talked for an hour.',
  'Is it 25% faster, or did you just type 3 extra words?',
  'Rest your fingers on the home row: A, S, D, F and J, K, L, semicolon.',
  'Pack my box with five dozen liquor jugs.',
  'Every small habit adds up over a year.',
  'Send the file to "build" before 6 pm (not after).',
  'Quiet mornings are the best time to focus.',
  'Type slowly, breathe, and let the rhythm come.',
];
