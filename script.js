// أدخل بيانات الأطباء هنا. لكل طبيب: name, specialty, clinic, address, username, password.
    // اترك الحقول الفارغة إلى أن تصبح بيانات الطبيب جاهزة.
    const DOCTORS = [
      { id:'d1', name:'', specialty:'طب عام', clinic:'', address:'', username:'', password:'' },
      { id:'d2', name:'', specialty:'طب الأسنان', clinic:'', address:'', username:'', password:'' },
      { id:'d3', name:'', specialty:'طب الأطفال', clinic:'', address:'', username:'', password:'' },
      { id:'d4', name:'', specialty:'أمراض القلب', clinic:'', address:'', username:'', password:'' },
      { id:'d5', name:'', specialty:'طب العيون', clinic:'', address:'', username:'', password:'' },
      { id:'d6', name:'', specialty:'الجلدية', clinic:'', address:'', username:'', password:'' },
    ];
    const KEY='mawidi_appointments_v1'; let currentDoctor=null;
    const specialties=[...new Set(DOCTORS.map(d=>d.specialty).filter(Boolean))];
    const $=s=>document.querySelector(s); const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function getAppointments(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
    function saveAppointments(a){localStorage.setItem(KEY,JSON.stringify(a))}
    function showSection(id){document.querySelectorAll('.section').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.section===id));document.querySelector('.hero').style.display=id==='home'?'grid':'none';document.querySelector('.content').style.paddingTop=id==='home'?'30px':'32px';window.scrollTo({top:0,behavior:'smooth'});if(id==='requests')renderPatientRequests();if(id==='doctor')renderDoctorDashboard()}
    document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>showSection(b.dataset.section)));
    function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
    function doctorTitle(d){return d.name.trim()||`طبيب ${d.specialty} — يضاف الاسم`}
    function doctorCard(d,withButton=false){return `<article class="doctor-card"><div class="doctor-top"><div class="doctor-avatar">✚</div><div><h3>${esc(doctorTitle(d))}</h3><span class="spec">${esc(d.specialty)}</span></div></div><div class="doctor-meta"><span>⌖ ${esc(d.clinic||'اسم العيادة يضاف لاحقاً')}</span><span>⌂ ${esc(d.address||'عنوان العيادة يضاف لاحقاً')}</span></div>${withButton?`<button class="primary" onclick="requestAppointment('${esc(d.id)}')">إرسال طلب موعد</button>`:''}</article>`}
    function fillSpecialties(){const booking=$('#specialty'),filter=$('#directory-filter');specialties.forEach(s=>{booking.insertAdjacentHTML('beforeend',`<option value="${esc(s)}">${esc(s)}</option>`);filter.insertAdjacentHTML('beforeend',`<option value="${esc(s)}">${esc(s)}</option>`)})}
    function renderDirectory(){const term=$('#directory-search').value.trim().toLowerCase(),sp=$('#directory-filter').value;const list=DOCTORS.filter(d=>(!sp||d.specialty===sp)&&(!term||[d.name,d.specialty,d.clinic,d.address].some(v=>v.toLowerCase().includes(term))));$('#directory-grid').innerHTML=list.length?list.map(d=>doctorCard(d)).join(''):`<div class="panel empty" style="grid-column:1/-1"><div class="empty-icon">⌕</div><strong>لا توجد نتائج مطابقة</strong><p>جرّب تغيير كلمات البحث أو التخصص.</p></div>`}
    $('#directory-search').addEventListener('input',renderDirectory);$('#directory-filter').addEventListener('change',renderDirectory);
    $('#booking-form').addEventListener('submit',e=>{e.preventDefault();const sp=$('#specialty').value;const list=DOCTORS.filter(d=>d.specialty===sp);$('#search-results').innerHTML=`<div class="section-title" style="margin-top:25px"><div><h2 style="font-size:20px">الأطباء في تخصص ${esc(sp)}</h2><p>${list.length} أطباء ضمن الدليل</p></div></div><div class="doctors-grid">${list.map(d=>doctorCard(d,true)).join('')}</div>`;$('#search-results').scrollIntoView({behavior:'smooth',block:'start'})});
    window.requestAppointment=function(id){const d=DOCTORS.find(x=>x.id===id);const first=$('#firstName').value.trim(),last=$('#lastName').value.trim(),phone=$('#phone').value.trim();if(!first||!last||!phone){toast('أكمل الاسم واللقب ورقم الهاتف أولاً.');$('#booking-form').scrollIntoView({behavior:'smooth'});return}const list=getAppointments();list.unshift({id:'a'+Date.now()+Math.random().toString(16).slice(2,6),doctorId:d.id,doctorName:doctorTitle(d),specialty:d.specialty,first,last,phone,status:'pending',time:'',created:new Date().toISOString()});saveAppointments(list);toast('تم إرسال طلبك إلى الطبيب بنجاح.');showSection('requests')};
    function renderPatientRequests(){const items=getAppointments();$('#patient-requests').innerHTML=items.length?items.map(a=>{const label=a.status==='accepted'?'مقبول':a.status==='rejected'?'مرفوض':'بانتظار رد الطبيب',cls=a.status==='accepted'?'ok':a.status==='rejected'?'no':'wait';return `<div class="request-card"><div class="request-info"><strong>${esc(a.doctorName)}</strong><small>${esc(a.specialty)} · أرسل في ${new Date(a.created).toLocaleDateString('ar')}</small></div><div class="request-right"><span class="badge ${cls}">${label}</span>${a.status==='accepted'&&a.time?`<span class="request-time">◷ ${esc(a.time)}</span>`:''}</div></div>`}).join(''):`<div class="empty"><div class="empty-icon">▣</div><strong>لا توجد طلبات حتى الآن</strong><p>ابدأ بالبحث عن طبيب وأرسل طلب موعدك.</p></div>`}
    $('#login-form').addEventListener('submit',e=>{e.preventDefault();const username=$('#username').value,password=$('#password').value;const d=DOCTORS.find(x=>x.username&&x.password&&x.username===username&&x.password===password);if(!d){toast('بيانات الدخول غير صحيحة أو لم تُضف بعد.');return}currentDoctor=d;$('#login-wrap').style.display='none';$('#doctor-dashboard').classList.add('visible');renderDoctorDashboard()});
    $('#logout').addEventListener('click',()=>{currentDoctor=null;$('#login-wrap').style.display='block';$('#doctor-dashboard').classList.remove('visible');$('#login-form').reset()});
    function renderDoctorDashboard(){if(!currentDoctor)return;$('#doctor-greeting').textContent=`مرحباً، ${doctorTitle(currentDoctor)}`;const items=getAppointments().filter(a=>a.doctorId===currentDoctor.id),body=$('#doctor-appointments');$('#doctor-empty').style.display=items.length?'none':'block';body.innerHTML=items.map(a=>{const status=a.status==='accepted'?'مقبول':a.status==='rejected'?'مرفوض':'جديد',cls=a.status==='accepted'?'ok':a.status==='rejected'?'no':'wait';return `<tr><td><span class="patient-name">${esc(a.first)} ${esc(a.last)}</span><a class="patient-phone" href="tel:${esc(a.phone)}">${esc(a.phone)}</a></td><td>${esc(a.specialty)}</td><td>${new Date(a.created).toLocaleDateString('ar')}</td><td class="status-cell"><span class="badge ${cls}">${status}</span>${a.status==='accepted'?`<br><input aria-label="ساعة الموعد" type="time" value="${esc(a.time)}" onchange="setAppointmentTime('${esc(a.id)}',this.value)">`:''}</td><td><div class="actions"><button class="mini accept" ${a.status==='accepted'?'disabled':''} onclick="updateStatus('${esc(a.id)}','accepted')">قبول</button><button class="mini reject" ${a.status==='rejected'?'disabled':''} onclick="updateStatus('${esc(a.id)}','rejected')">رفض</button></div></td></tr>`}).join('')}
    window.updateStatus=(id,status)=>{const items=getAppointments(),a=items.find(x=>x.id===id);if(!a)return;a.status=status;if(status==='rejected')a.time='';saveAppointments(items);renderDoctorDashboard();toast(status==='accepted'?'تم قبول الطلب. حدّد ساعة الموعد.':'تم رفض الطلب.')};
    window.setAppointmentTime=(id,time)=>{const items=getAppointments(),a=items.find(x=>x.id===id);if(a){a.time=time;saveAppointments(items);toast('تم تحديث ساعة الموعد.')}};
    fillSpecialties();renderDirectory();showSection('home');
// تحديث لوحة الطبيب تلقائياً عند وصول طلب من صفحة أخرى في المتصفح نفسه.
let knownDoctorRequestIds = new Set();
let lastDoctorSnapshot = '';
function syncDoctorAppointments(announceNew = true) {
  if (!currentDoctor || !$('#doctor-dashboard').classList.contains('visible')) return;
  const items = getAppointments().filter(a => a.doctorId === currentDoctor.id);
  const snapshot = JSON.stringify(items);
  if (snapshot === lastDoctorSnapshot) return;
  const incoming = items.filter(a => !knownDoctorRequestIds.has(a.id));
  items.forEach(a => knownDoctorRequestIds.add(a.id));
  lastDoctorSnapshot = snapshot;
  renderDoctorDashboard();
  if (announceNew && incoming.length) {
    toast(incoming.length === 1 ? 'وصل طلب موعد جديد.' : `وصل ${incoming.length} طلبات مواعيد جديدة.`);
  }
}
window.addEventListener('storage', event => {
  if (event.key === KEY) syncDoctorAppointments(true);
});
setInterval(() => syncDoctorAppointments(true), 2000);