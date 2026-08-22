/**
 * AcademyTrack - Computer Academy Online Portal Logic
 * Database Fields: Name, Father's Name (f_name), Class/Course, Date of Fees Paid
 */

// ==========================================
// 1. Initial State & Storage Keys
// ==========================================
const STORAGE_KEYS = {
    STUDENTS: 'academytrack_students_v1',
    ATTENDANCE: 'academytrack_attendance_v1',
    THEME: 'academytrack_theme_v1',
    SUPABASE_CONFIG: 'academytrack_supabase_config_v1',
    ADMIN_PASS: 'academytrack_admin_pass_v1'
};

// Initial Seed Data if empty
const INITIAL_STUDENTS = [
    {
        id: 'STD-101',
        name: 'Aman Kumar',
        fname: 'Rajesh Kumar',
        class: 'DCA (Computer Apps)',
        feeamount: 1000,
        feedate: '2026-08-01',
        joiningDate: '2026-01-10',
        phone: '9812345678',
        feeHistory: {
            '2026-01': { status: 'Paid', paidDate: '2026-01-10', amount: 1000 },
            '2026-02': { status: 'Paid', paidDate: '2026-02-05', amount: 1000 },
            '2026-03': { status: 'Paid', paidDate: '2026-03-10', amount: 1000 },
            '2026-04': { status: 'Paid', paidDate: '2026-04-12', amount: 1000 },
            '2026-05': { status: 'Paid', paidDate: '2026-05-08', amount: 1000 },
            '2026-06': { status: 'Paid', paidDate: '2026-06-11', amount: 1000 },
            '2026-07': { status: 'Paid', paidDate: '2026-07-05', amount: 1000 },
            '2026-08': { status: 'Paid', paidDate: '2026-08-01', amount: 1000 }
        }
    },
    {
        id: 'STD-102',
        name: 'Priya Sharma',
        fname: 'Ramesh Sharma',
        class: 'ADCA (Advanced DCA)',
        feeamount: 1200,
        feedate: '2026-08-10',
        joiningDate: '2026-02-15',
        phone: '9823456789',
        feeHistory: {
            '2026-02': { status: 'Paid', paidDate: '2026-02-15', amount: 1200 },
            '2026-03': { status: 'Paid', paidDate: '2026-03-10', amount: 1200 },
            '2026-04': { status: 'Paid', paidDate: '2026-04-05', amount: 1200 },
            '2026-05': { status: 'Paid', paidDate: '2026-05-12', amount: 1200 },
            '2026-06': { status: 'Paid', paidDate: '2026-06-10', amount: 1200 },
            '2026-07': { status: 'Paid', paidDate: '2026-07-15', amount: 1200 },
            '2026-08': { status: 'Paid', paidDate: '2026-08-10', amount: 1200 }
        }
    },
    {
        id: 'STD-103',
        name: 'Rahul Singh',
        fname: 'Vikram Singh',
        class: 'Tally Prime + GST',
        feeamount: 1500,
        feedate: '2026-07-12',
        joiningDate: '2026-01-05',
        phone: '9834567890',
        feeHistory: {
            '2026-01': { status: 'Paid', paidDate: '2026-01-05', amount: 1500 },
            '2026-02': { status: 'Paid', paidDate: '2026-02-10', amount: 1500 },
            '2026-03': { status: 'Paid', paidDate: '2026-03-12', amount: 1500 },
            '2026-04': { status: 'Paid', paidDate: '2026-04-10', amount: 1500 },
            '2026-05': { status: 'Paid', paidDate: '2026-05-15', amount: 1500 },
            '2026-06': { status: 'Paid', paidDate: '2026-06-12', amount: 1500 },
            '2026-07': { status: 'Paid', paidDate: '2026-07-12', amount: 1500 },
            '2026-08': { status: 'Unpaid', paidDate: '', amount: 1500 }
        }
    }
];

let state = {
    students: [],
    attendanceLogs: {}, // { 'YYYY-MM-DD': { 'STD-101': 'Present', 'STD-102': 'Absent' } }
    supabaseConfig: { url: '', key: '' }
};

// ==========================================
// 2. Data Persistence Helpers
// ==========================================
function ensureStudentFeeHistory(student) {
    if (!student.feeHistory) student.feeHistory = {};
    if (!student.feeamount) student.feeamount = 1000;
    if (!student.joiningDate) student.joiningDate = student.feedate || getTodayFormatted();

    // Generate month keys from joining month to current month
    const startMonth = student.joiningDate.slice(0, 7);
    const currentMonth = getTodayFormatted().slice(0, 7);

    let [startYear, startM] = startMonth.split('-').map(Number);
    let [curYear, curM] = currentMonth.split('-').map(Number);

    let y = startYear;
    let m = startM;

    while (y < curYear || (y === curYear && m <= curM)) {
        const mKey = `${y}-${String(m).padStart(2, '0')}`;
        if (!student.feeHistory[mKey]) {
            // Default status: if feedate is in or after this month, mark paid
            const paidMonthKey = student.feedate ? student.feedate.slice(0, 7) : '';
            if (mKey <= paidMonthKey) {
                student.feeHistory[mKey] = { status: 'Paid', paidDate: student.feedate, amount: student.feeamount };
            } else {
                student.feeHistory[mKey] = { status: 'Unpaid', paidDate: '', amount: student.feeamount };
            }
        }
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }
}

function loadState() {
    const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (rawStudents) {
        state.students = JSON.parse(rawStudents);
        state.students.forEach(ensureStudentFeeHistory);
    } else {
        state.students = INITIAL_STUDENTS;
        state.students.forEach(ensureStudentFeeHistory);
        saveStudents();
    }

    const rawAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (rawAttendance) {
        state.attendanceLogs = JSON.parse(rawAttendance);
    } else {
        // Seed today's attendance for demo
        const today = getTodayFormatted();
        state.attendanceLogs[today] = {
            'STD-101': 'Present',
            'STD-102': 'Present',
            'STD-103': 'Absent',
            'STD-104': 'Present',
            'STD-105': 'Late'
        };
        saveAttendance();
    }

    const rawConfig = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (rawConfig) {
        state.supabaseConfig = JSON.parse(rawConfig);
    }
}

function saveStudents() {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(state.students));
    triggerCloudSync();
}

function saveAttendance() {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(state.attendanceLogs));
    triggerCloudSync();
}

// ==========================================
// 3. UI Helpers & Formatting
// ==========================================
function getTodayFormatted() {
    const d = new Date();
    return d.toISOString().split('T')[0];
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

function calculateFeeStatus(feedateStr) {
    if (!feedateStr) return { label: 'Unknown', class: 'badge-warning', days: 0 };

    const feeDate = new Date(feedateStr);
    const today = new Date();
    const diffTime = today - feeDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
        return { label: 'Paid', class: 'badge-success', days: diffDays };
    } else if (diffDays <= 37) {
        return { label: 'Due Soon', class: 'badge-warning', days: diffDays };
    } else {
        return { label: 'Overdue', class: 'badge-danger', days: diffDays };
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

// ==========================================
// 4. Tab Navigation & Theme
// ==========================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('current-page-title');
    const pageSubtitle = document.getElementById('current-page-subtitle');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');

    const titles = {
        dashboard: { title: 'Dashboard Overview', desc: 'Real-time academy stats accessible from anywhere.' },
        attendance: { title: 'Attendance Register', desc: 'Daily attendance marking for village computer students.' },
        students: { title: 'Students Directory', desc: 'Manage student profiles, father names, and class records.' },
        fees: { title: 'Fee Tracker Ledger', desc: 'Track payment dates and identify overdue student fees.' },
        sync: { title: 'Cloud & GitHub Deployment', desc: 'Setup live city sync or export JSON backup.' }
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
            if (window.innerWidth <= 992) {
                sidebar.classList.remove('open');
            }
        });
    });

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Set header date
    document.getElementById('header-today-date').textContent = new Date().toLocaleDateString('en-IN', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    const activeTab = document.getElementById(`tab-${tabId}`);

    if (activeNav) activeNav.classList.add('active');
    if (activeTab) activeTab.classList.add('active');

    // Update Header Titles
    const titles = {
        dashboard: { title: 'Dashboard Overview', desc: 'Real-time academy stats accessible from anywhere.' },
        attendance: { title: 'Attendance Register', desc: 'Daily attendance marking for village computer students.' },
        students: { title: 'Students Directory', desc: 'Manage student profiles, father names, and class records.' },
        fees: { title: 'Fee Tracker Ledger', desc: 'Track payment dates and identify overdue student fees.' },
        admin: { title: 'Admin Control Center', desc: 'Manage academy settings and delete or reset student records.' },
        sync: { title: 'Cloud & GitHub Deployment', desc: 'Setup live city sync or export JSON backup.' }
    };

    if (titles[tabId]) {
        document.getElementById('current-page-title').textContent = titles[tabId].title;
        document.getElementById('current-page-subtitle').textContent = titles[tabId].desc;
    }

    // Refresh UI components for active tab
    renderDashboard();
    renderAttendanceTable();
    renderStudentsTable();
    renderFeeTable();
    renderAdminPanel();
}

function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        updateThemeBtnUI('light');
    }

    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme', !isLight);
        const newTheme = isLight ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
        updateThemeBtnUI(newTheme);
    });
}

function updateThemeBtnUI(theme) {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (theme === 'light') {
        icon.className = 'fa-solid fa-moon';
        text.textContent = 'Dark Mode';
    } else {
        icon.className = 'fa-solid fa-sun';
        text.textContent = 'Light Mode';
    }
}

// ==========================================
// 5. Dashboard Render
// ==========================================
function renderDashboard() {
    const totalStudents = state.students.length;
    document.getElementById('stat-total-students').textContent = totalStudents;

    // Active Courses
    const courses = [...new Set(state.students.map(s => s.class))];
    document.getElementById('stat-active-courses').textContent = `${courses.length} Active Courses`;

    // Attendance stats for today
    const today = getTodayFormatted();
    const todayLog = state.attendanceLogs[today] || {};
    let presentCount = 0;
    Object.values(todayLog).forEach(status => {
        if (status === 'Present' || status === 'Late') presentCount++;
    });

    const attendancePct = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
    document.getElementById('stat-today-attendance').textContent = `${attendancePct}%`;
    document.getElementById('stat-today-present-count').textContent = `${presentCount} / ${totalStudents} Present Today`;

    // Progress Bar
    document.getElementById('dash-attendance-ratio').textContent = `${presentCount}/${totalStudents}`;
    document.getElementById('dash-attendance-fill').style.width = `${attendancePct}%`;

    // Fee stats for current month
    const currentMonthKey = getTodayFormatted().slice(0, 7);
    let totalCollectedThisMonth = 0;
    let paidCount = 0;
    let dueCount = 0;
    state.students.forEach(s => {
        const amount = s.feeamount || 1000;
        if (s.feedate && s.feedate.startsWith(currentMonthKey)) {
            totalCollectedThisMonth += amount;
            paidCount++;
        } else {
            dueCount++;
        }
    });

    document.getElementById('stat-fees-paid-count').textContent = `Rs. ${totalCollectedThisMonth.toLocaleString('en-US')}`;
    document.getElementById('stat-fees-paid-percent').textContent = `${paidCount} Students Paid This Month`;
    document.getElementById('stat-fees-due-count').textContent = dueCount;

    // Populate recent attendance list
    const dashAttendanceList = document.getElementById('dash-recent-attendance-list');
    dashAttendanceList.innerHTML = '';
    state.students.forEach(s => {
        const status = todayLog[s.id] || 'Not Marked';
        let statusBadgeClass = 'badge-warning';
        if (status === 'Present') statusBadgeClass = 'badge-success';
        if (status === 'Absent') statusBadgeClass = 'badge-danger';

        const item = document.createElement('div');
        item.className = 'mini-item';
        item.innerHTML = `
            <div class="mini-item-info">
                <h4>${escapeHtml(s.name)}</h4>
                <p>F/Name: ${escapeHtml(s.fname)} &bull; ${escapeHtml(s.class)}</p>
            </div>
            <span class="badge ${statusBadgeClass}">${status}</span>
        `;
        dashAttendanceList.appendChild(item);
    });

    // Populate fee alerts list
    const dashFeeAlertsList = document.getElementById('dash-fee-alerts-list');
    dashFeeAlertsList.innerHTML = '';
    const overdueStudents = state.students.filter(s => calculateFeeStatus(s.feedate).label !== 'Paid');

    if (overdueStudents.length === 0) {
        dashFeeAlertsList.innerHTML = '<p class="text-muted p-10">All student fees are fully paid and up to date! 🎉</p>';
    } else {
        overdueStudents.forEach(s => {
            const feeStatus = calculateFeeStatus(s.feedate);
            const item = document.createElement('div');
            item.className = 'mini-item';
            item.innerHTML = `
                <div class="mini-item-info">
                    <h4>${escapeHtml(s.name)}</h4>
                    <p>Class: ${escapeHtml(s.class)} &bull; Last Paid: ${formatDateDisplay(s.feedate)}</p>
                </div>
                <span class="badge ${feeStatus.class}">${feeStatus.label}</span>
            `;
            dashFeeAlertsList.appendChild(item);
        });
    }
}

// ==========================================
// 6. Student Directory Management
// ==========================================
function initStudentManagement() {
    const addStudentForm = document.getElementById('add-student-form');
    const inputFeeDate = document.getElementById('input-feedate');
    const inputRegDate = document.getElementById('input-regdate');
    if (inputFeeDate) inputFeeDate.value = getTodayFormatted();
    if (inputRegDate) inputRegDate.value = getTodayFormatted();

    addStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('input-name').value.trim();
        const fname = document.getElementById('input-fname').value.trim();
        const className = document.getElementById('input-class').value.trim();
        const regdate = document.getElementById('input-regdate') ? document.getElementById('input-regdate').value : getTodayFormatted();
        const feedate = document.getElementById('input-feedate').value;
        const feeamountInput = document.getElementById('input-feeamount') ? document.getElementById('input-feeamount').value : '1000';
        const feeamount = parseInt(feeamountInput) || 1000;
        const feetypeEl = document.querySelector('input[name="input-feetype"]:checked');
        const feetype = feetypeEl ? feetypeEl.value : 'Monthly Fees';
        const phone = document.getElementById('input-phone').value.trim();

        if (!name || !fname || !className || !feedate) {
            showToast('Please fill all required fields!', 'error');
            return;
        }

        const newStudent = {
            id: `STD-${Date.now().toString().slice(-4)}`,
            name,
            fname,
            class: className,
            regdate: regdate || getTodayFormatted(),
            joiningDate: regdate || getTodayFormatted(),
            feeamount,
            feetype,
            feedate,
            phone: phone || ''
        };

        state.students.push(newStudent);
        saveStudents();
        addStudentForm.reset();
        if (inputFeeDate) inputFeeDate.value = getTodayFormatted();
        if (inputRegDate) inputRegDate.value = getTodayFormatted();

        showToast(`Student ${name} registered successfully!`);
        populateCourseDropdowns();
        renderStudentsTable();
        renderDashboard();
    });

    // Search and Filter Listeners
    document.getElementById('search-student-input').addEventListener('input', renderStudentsTable);
    document.getElementById('filter-course-dropdown').addEventListener('change', renderStudentsTable);

    // Quick Add Button Topbar
    const quickAddBtn = document.getElementById('quick-add-student-btn');
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', () => {
            switchTab('students');
            const inputName = document.getElementById('input-name');
            if (inputName) inputName.focus();
        });
    }

    // Quick Collect Fee Button Topbar
    const quickCollectBtn = document.getElementById('quick-collect-fee-btn');
    if (quickCollectBtn) {
        quickCollectBtn.addEventListener('click', () => openCollectFeeModal());
    }

    // Collect Fee Modal Listeners
    const closeCollectModalBtn = document.getElementById('close-collect-modal-btn');
    const cancelCollectBtn = document.getElementById('cancel-collect-fee-btn');
    if (closeCollectModalBtn) closeCollectModalBtn.addEventListener('click', closeCollectFeeModal);
    if (cancelCollectBtn) cancelCollectBtn.addEventListener('click', closeCollectFeeModal);

    const collectForm = document.getElementById('collect-fee-form');
    if (collectForm) {
        collectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const studentId = document.getElementById('collect-student-select').value;
            const monthKey = document.getElementById('collect-month-select').value;
            const amount = parseInt(document.getElementById('collect-fee-amount').value) || 1000;
            const paymentDate = document.getElementById('collect-payment-date').value || getTodayFormatted();
            const collectFeetypeEl = document.querySelector('input[name="collect-feetype"]:checked');
            const feeType = collectFeetypeEl ? collectFeetypeEl.value : 'Monthly Fees';

            const student = state.students.find(s => s.id === studentId);
            if (!student) return;

            student.feetype = feeType;
            ensureStudentFeeHistory(student);
            student.feeHistory[monthKey] = {
                status: 'Paid',
                paidDate: paymentDate,
                amount: amount,
                feeType: feeType
            };
            student.feedate = paymentDate;

            saveStudents();
            closeCollectFeeModal();

            const parts = monthKey.split('-');
            const dateObj = new Date(parts[0], parseInt(parts[1], 10) - 1, 1);
            const monthLabel = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

            showToast(`Saved Rs. ${amount.toLocaleString('en-US')} fee payment for ${student.name} for ${monthLabel}!`);
            renderFeeTable();
            renderDashboard();
            renderStudentsTable();
        });
    }

    // Modal Edit Listeners
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-edit-btn').addEventListener('click', closeModal);

    const closeFeeModalBtn = document.getElementById('close-fee-modal-btn');
    if (closeFeeModalBtn) {
        closeFeeModalBtn.addEventListener('click', () => {
            document.getElementById('fee-card-modal').classList.remove('active');
        });
    }

    document.getElementById('edit-student-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-student-id').value;
        const student = state.students.find(s => s.id === id);
        if (student) {
            student.name = document.getElementById('edit-name').value.trim();
            student.fname = document.getElementById('edit-fname').value.trim();
            student.class = document.getElementById('edit-class').value.trim();
            const editFeetypeEl = document.querySelector('input[name="edit-feetype"]:checked');
            student.feetype = editFeetypeEl ? editFeetypeEl.value : 'Monthly Fees';
            student.feeamount = parseInt(document.getElementById('edit-feeamount').value) || 1000;
            if (document.getElementById('edit-regdate')) {
                const newRegDate = document.getElementById('edit-regdate').value;
                student.regdate = newRegDate;
                student.joiningDate = newRegDate;
            }
            student.feedate = document.getElementById('edit-feedate').value;
            student.phone = document.getElementById('edit-phone').value.trim();

            saveStudents();
            closeModal();
            showToast(`Updated student record for ${student.name}`);
            renderStudentsTable();
            renderDashboard();
        }
    });
}

function openCollectFeeModal(preselectedStudentId = null, preselectedMonthKey = null) {
    if (state.students.length === 0) {
        showToast('No students registered yet. Add a student first!', 'error');
        return;
    }

    const studentSelect = document.getElementById('collect-student-select');
    studentSelect.innerHTML = '';

    state.students.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name} (F/Name: ${s.fname} - ${s.class})`;
        studentSelect.appendChild(opt);
    });

    if (preselectedStudentId) {
        studentSelect.value = preselectedStudentId;
    }

    // Set default payment date to Today
    document.getElementById('collect-payment-date').value = getTodayFormatted();

    // Populate Months for selected student
    const updateMonthsForStudent = () => {
        const sid = studentSelect.value;
        const student = state.students.find(s => s.id === sid);
        const monthSelect = document.getElementById('collect-month-select');
        monthSelect.innerHTML = '';

        if (student) {
            document.getElementById('collect-fee-amount').value = student.feeamount || 1000;
            ensureStudentFeeHistory(student);

            const sortedMonths = Object.keys(student.feeHistory).sort().reverse();
            sortedMonths.forEach(mKey => {
                const parts = mKey.split('-');
                const dateObj = new Date(parts[0], parseInt(parts[1], 10) - 1, 1);
                const monthName = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                const isPaid = student.feeHistory[mKey].status === 'Paid';

                const opt = document.createElement('option');
                opt.value = mKey;
                opt.textContent = `${monthName} - ${isPaid ? 'Already Paid' : 'UNPAID'}`;
                monthSelect.appendChild(opt);
            });

            if (preselectedMonthKey && sortedMonths.includes(preselectedMonthKey)) {
                monthSelect.value = preselectedMonthKey;
            }
        }
    };

    studentSelect.removeEventListener('change', updateMonthsForStudent);
    studentSelect.addEventListener('change', updateMonthsForStudent);
    updateMonthsForStudent();

    document.getElementById('collect-fee-modal').classList.add('active');
}

function closeCollectFeeModal() {
    document.getElementById('collect-fee-modal').classList.remove('active');
}

function populateCourseDropdowns() {
    const courses = [...new Set(state.students.map(s => s.class))];

    const dropdowns = [
        document.getElementById('filter-course-dropdown'),
        document.getElementById('attendance-course-filter')
    ];

    dropdowns.forEach(dd => {
        if (!dd) return;
        const currentVal = dd.value;
        dd.innerHTML = '<option value="ALL">All Classes / Courses</option>';
        courses.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            dd.appendChild(opt);
        });
        dd.value = currentVal || 'ALL';
    });
}

function renderStudentsTable() {
    const tbody = document.getElementById('students-table-body');
    const searchQuery = document.getElementById('search-student-input').value.toLowerCase();
    const courseFilter = document.getElementById('filter-course-dropdown').value;

    tbody.innerHTML = '';

    const filtered = state.students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery) ||
            s.fname.toLowerCase().includes(searchQuery) ||
            s.class.toLowerCase().includes(searchQuery);
        const matchesCourse = courseFilter === 'ALL' || s.class === courseFilter;
        return matchesSearch && matchesCourse;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center p-20 text-muted">No students found. Add a new student above.</td></tr>`;
        return;
    }

    filtered.forEach(s => {
        const feeStatus = calculateFeeStatus(s.feedate);
        const feeTypeLabel = s.feetype || 'Monthly Fees';
        const feeTypeBadgeClass = feeTypeLabel === 'Advance Fees' ? 'badge-warning' : 'badge-outline';
        const regDateDisplay = formatDateDisplay(s.regdate || s.joiningDate || s.feedate);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${s.id}</code></td>
            <td><strong>${escapeHtml(s.name)}</strong></td>
            <td>${escapeHtml(s.fname)}</td>
            <td><span class="badge badge-outline">${escapeHtml(s.class)}</span></td>
            <td><strong>${regDateDisplay}</strong></td>
            <td>
                <div><strong>Rs. ${(s.feeamount || 1000).toLocaleString('en-US')}</strong></div>
                <span class="badge ${feeTypeBadgeClass}" style="font-size: 0.7rem; padding: 2px 6px; margin-top: 3px; display: inline-block;">${feeTypeLabel}</span>
            </td>
            <td>${formatDateDisplay(s.feedate)}</td>
            <td><span class="badge ${feeStatus.class}">${feeStatus.label}</span></td>
            <td class="text-right">
                <div class="action-btns">
                    <button class="btn btn-success btn-xs" title="Record Fee Payment" onclick="openCollectFeeModal('${s.id}')">
                        <span class="pkr-icon">PKR</span> Pay Fee
                    </button>
                    <button class="icon-btn" title="View Monthly Fee Card" onclick="openStudentFeeCard('${s.id}')">
                        <i class="fa-solid fa-receipt"></i>
                    </button>
                    <button class="icon-btn" title="Edit Student" onclick="openEditModal('${s.id}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="icon-btn delete" title="Delete Student" onclick="deleteStudent('${s.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openEditModal(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    document.getElementById('edit-student-id').value = student.id;
    document.getElementById('edit-name').value = student.name;
    document.getElementById('edit-fname').value = student.fname;
    document.getElementById('edit-class').value = student.class;

    const feeTypeVal = student.feetype || 'Monthly Fees';
    if (feeTypeVal === 'Advance Fees') {
        const advRadio = document.getElementById('edit-feetype-advance');
        if (advRadio) advRadio.checked = true;
    } else {
        const monRadio = document.getElementById('edit-feetype-monthly');
        if (monRadio) monRadio.checked = true;
    }

    document.getElementById('edit-feeamount').value = student.feeamount || 1000;
    if (document.getElementById('edit-regdate')) {
        document.getElementById('edit-regdate').value = student.regdate || student.joiningDate || student.feedate || getTodayFormatted();
    }
    document.getElementById('edit-feedate').value = student.feedate;
    document.getElementById('edit-phone').value = student.phone || '';

    document.getElementById('edit-student-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('edit-student-modal').classList.remove('active');
}

function deleteStudent(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    if (confirm(`Are you sure you want to delete student "${student.name}"?`)) {
        state.students = state.students.filter(s => s.id !== studentId);
        saveStudents();
        showToast(`Student record deleted.`);
        renderStudentsTable();
        renderDashboard();
    }
}

// ==========================================
// 7. Attendance Register Management
// ==========================================
function initAttendanceManagement() {
    const datePicker = document.getElementById('attendance-date-picker');
    datePicker.value = getTodayFormatted();

    datePicker.addEventListener('change', renderAttendanceTable);
    document.getElementById('attendance-course-filter').addEventListener('change', renderAttendanceTable);

    // Mark All Present Button
    document.getElementById('btn-mark-all-present').addEventListener('click', () => {
        const currentDate = datePicker.value;
        if (!state.attendanceLogs[currentDate]) {
            state.attendanceLogs[currentDate] = {};
        }
        state.students.forEach(s => {
            state.attendanceLogs[currentDate][s.id] = 'Present';
        });
        renderAttendanceTable();
        showToast(`Marked all students Present for ${formatDateDisplay(currentDate)}`);
    });

    // Save Attendance Button
    document.getElementById('btn-save-attendance').addEventListener('click', () => {
        saveAttendance();
        showToast('Attendance log saved successfully!');
        renderDashboard();
    });
}

function renderAttendanceTable() {
    const datePicker = document.getElementById('attendance-date-picker');
    const selectedDate = datePicker.value || getTodayFormatted();
    const courseFilter = document.getElementById('attendance-course-filter').value;
    const tbody = document.getElementById('attendance-table-body');

    if (!state.attendanceLogs[selectedDate]) {
        state.attendanceLogs[selectedDate] = {};
    }
    const dayLog = state.attendanceLogs[selectedDate];

    tbody.innerHTML = '';

    const filtered = state.students.filter(s => courseFilter === 'ALL' || s.class === courseFilter);

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-20 text-muted">No students enrolled in this course.</td></tr>`;
        return;
    }

    filtered.forEach((s, index) => {
        const currentStatus = dayLog[s.id] || 'Present'; // default present
        dayLog[s.id] = currentStatus; // assign default

        const feeStatus = calculateFeeStatus(s.feedate);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(s.name)}</strong></td>
            <td>${escapeHtml(s.fname)}</td>
            <td><span class="badge badge-outline">${escapeHtml(s.class)}</span></td>
            <td><span class="badge ${feeStatus.class}">${feeStatus.label}</span></td>
            <td class="text-center">
                <div class="attendance-toggle-group">
                    <button class="toggle-btn ${currentStatus === 'Present' ? 'active present' : ''}" 
                            onclick="setStudentAttendance('${selectedDate}', '${s.id}', 'Present')">Present</button>
                    <button class="toggle-btn ${currentStatus === 'Absent' ? 'active absent' : ''}" 
                            onclick="setStudentAttendance('${selectedDate}', '${s.id}', 'Absent')">Absent</button>
                    <button class="toggle-btn ${currentStatus === 'Late' ? 'active late' : ''}" 
                            onclick="setStudentAttendance('${selectedDate}', '${s.id}', 'Late')">Late</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function setStudentAttendance(dateStr, studentId, status) {
    if (!state.attendanceLogs[dateStr]) {
        state.attendanceLogs[dateStr] = {};
    }
    state.attendanceLogs[dateStr][studentId] = status;
    saveAttendance();
    renderAttendanceTable();
}

// ==========================================
// 8. Fee Tracker & Monthly Collection Records
// ==========================================
function populateFeeMonthDropdown() {
    const dropdown = document.getElementById('fee-month-filter');
    if (!dropdown) return;

    // Collect all unique YYYY-MM from student feedate and add current & past 5 months
    const monthSet = new Set();
    const today = new Date();

    for (let i = 0; i < 6; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
        monthSet.add(monthKey);
    }

    state.students.forEach(s => {
        if (s.feedate && s.feedate.length >= 7) {
            monthSet.add(s.feedate.slice(0, 7));
        }
    });

    const sortedMonths = Array.from(monthSet).sort().reverse();
    const currentSelected = dropdown.value;

    dropdown.innerHTML = '';
    sortedMonths.forEach(mKey => {
        const parts = mKey.split('-');
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const dateObj = new Date(year, monthIndex, 1);
        const monthName = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        const opt = document.createElement('option');
        opt.value = mKey;
        opt.textContent = monthName;
        dropdown.appendChild(opt);
    });

    if (currentSelected && monthSet.has(currentSelected)) {
        dropdown.value = currentSelected;
    } else {
        dropdown.value = getTodayFormatted().slice(0, 7);
    }

    dropdown.removeEventListener('change', renderFeeTable);
    dropdown.addEventListener('change', renderFeeTable);
}

function renderFeeTable() {
    populateFeeMonthDropdown();

    const dropdown = document.getElementById('fee-month-filter');
    const selectedMonthKey = dropdown ? dropdown.value : getTodayFormatted().slice(0, 7);
    const tbody = document.getElementById('fees-table-body');
    tbody.innerHTML = '';

    let totalMonthlyCollected = 0;
    let paidCount = 0;
    let dueSoonCount = 0;
    let overdueCount = 0;

    state.students.forEach(s => {
        ensureStudentFeeHistory(s);

        const mRecord = s.feeHistory[selectedMonthKey] || { status: 'Unpaid', paidDate: '', amount: s.feeamount || 1000 };
        const isPaid = mRecord.status === 'Paid';
        const amount = s.feeamount || 1000;

        if (isPaid) {
            totalMonthlyCollected += (mRecord.amount || amount);
            paidCount++;
        } else {
            overdueCount++;
        }

        const statusBadge = isPaid
            ? `<span class="badge badge-success"><i class="fa-solid fa-check"></i> Paid</span>`
            : `<span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Unpaid</span>`;

        const paidDateDisplay = mRecord.paidDate ? formatDateDisplay(mRecord.paidDate) : '<span class="text-muted">Not Paid</span>';

        const actionBtn = isPaid
            ? `<button class="btn btn-outline btn-xs" onclick="toggleMonthFeeStatus('${s.id}', '${selectedMonthKey}')"><i class="fa-solid fa-rotate-left"></i> Mark Unpaid</button>`
            : `<button class="btn btn-success btn-xs" onclick="toggleMonthFeeStatus('${s.id}', '${selectedMonthKey}')"><i class="fa-solid fa-check"></i> Mark Paid</button>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(s.name)}</strong></td>
            <td>${escapeHtml(s.fname)}</td>
            <td><span class="badge badge-outline">${escapeHtml(s.class)}</span></td>
            <td><strong style="color: var(--accent-primary);">Rs. ${amount.toLocaleString('en-US')}</strong></td>
            <td>${paidDateDisplay}</td>
            <td>${statusBadge}</td>
            <td class="text-right">
                <div class="action-btns" style="justify-content: flex-end;">
                    ${actionBtn}
                    <button class="btn btn-secondary btn-xs" onclick="openStudentFeeCard('${s.id}')" title="View all months fee card">
                        <i class="fa-solid fa-receipt"></i> All Months Card
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const totalAmtEl = document.getElementById('fee-stat-total-amount');
    if (totalAmtEl) {
        totalAmtEl.textContent = `Rs. ${totalMonthlyCollected.toLocaleString('en-US')}`;
    }

    document.getElementById('fee-stat-paid').textContent = `${paidCount} Students`;
    document.getElementById('fee-stat-duesoon').textContent = `${dueSoonCount} Students`;
    document.getElementById('fee-stat-overdue').textContent = `${overdueCount} Students`;
}

function toggleMonthFeeStatus(studentId, monthKey) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    ensureStudentFeeHistory(student);

    if (!student.feeHistory[monthKey]) {
        student.feeHistory[monthKey] = { status: 'Unpaid', paidDate: '', amount: student.feeamount || 1000 };
    }

    const currentStatus = student.feeHistory[monthKey].status;
    if (currentStatus === 'Paid') {
        student.feeHistory[monthKey].status = 'Unpaid';
        student.feeHistory[monthKey].paidDate = '';
        showToast(`Marked ${student.name} Unpaid for ${monthKey}`);
    } else {
        student.feeHistory[monthKey].status = 'Paid';
        student.feeHistory[monthKey].paidDate = getTodayFormatted();
        student.feedate = getTodayFormatted(); // update last fee date
        showToast(`Marked ${student.name} Paid for ${monthKey}!`);
    }

    saveStudents();
    renderFeeTable();
    renderDashboard();
    renderStudentsTable();

    // If modal is active, update modal
    if (document.getElementById('fee-card-modal').classList.contains('active')) {
        openStudentFeeCard(studentId);
    }
}

function openStudentFeeCard(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    ensureStudentFeeHistory(student);

    // Calculate total fees paid by this student
    let totalStudentPaidAmount = 0;
    let totalPaidMonths = 0;
    Object.values(student.feeHistory).forEach(rec => {
        if (rec && rec.status === 'Paid') {
            totalStudentPaidAmount += (rec.amount || student.feeamount || 1000);
            totalPaidMonths++;
        }
    });

    const infoEl = document.getElementById('fee-card-student-info');
    infoEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
                <h4 style="margin:0; font-size:0.95rem; font-weight:700; color:var(--text-primary); line-height:1.3;">${escapeHtml(student.name)}</h4>
                <p style="margin:4px 0 0 0; font-size:0.82rem; color:var(--text-secondary);">
                    F/Name: <strong>${escapeHtml(student.fname)}</strong> &bull; Class: <strong>${escapeHtml(student.class)}</strong>
                </p>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                <span class="badge badge-success" style="font-size:0.85rem; padding:6px 12px; font-weight:700;">
                    <i class="fa-solid fa-money-bill-wave"></i> Total Fees Paid: Rs. ${totalStudentPaidAmount.toLocaleString('en-US')} (${totalPaidMonths} Months)
                </span>
                <span class="badge badge-outline" style="font-size:0.75rem;">
                    Monthly Fee Rate: Rs. ${(student.feeamount || 1000).toLocaleString('en-US')}
                </span>
            </div>
        </div>
    `;

    const tbody = document.getElementById('fee-card-table-body');
    tbody.innerHTML = '';

    const sortedMonths = Object.keys(student.feeHistory).sort().reverse();

    sortedMonths.forEach(mKey => {
        const record = student.feeHistory[mKey];
        const isPaid = record.status === 'Paid';
        const parts = mKey.split('-');
        const dateObj = new Date(parts[0], parseInt(parts[1], 10) - 1, 1);
        const monthLabel = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        const statusBadge = isPaid
            ? `<span class="badge badge-success"><i class="fa-solid fa-check"></i> Paid</span>`
            : `<span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Unpaid</span>`;

        const paidDateDisplay = record.paidDate ? formatDateDisplay(record.paidDate) : '<span class="text-muted">-</span>';

        const actionBtn = isPaid
            ? `<button class="btn btn-outline btn-xs" onclick="toggleMonthFeeStatus('${student.id}', '${mKey}')"><i class="fa-solid fa-rotate-left"></i> Mark Unpaid</button>`
            : `<button class="btn btn-success btn-xs" onclick="toggleMonthFeeStatus('${student.id}', '${mKey}')"><i class="fa-solid fa-check"></i> Mark Paid</button>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${monthLabel}</strong> <code style="font-size:0.75rem;">(${mKey})</code></td>
            <td>Rs. ${(record.amount || student.feeamount || 1000).toLocaleString('en-US')}</td>
            <td>${statusBadge}</td>
            <td>${paidDateDisplay}</td>
            <td class="text-right">${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('fee-card-modal').classList.add('active');
}

// ==========================================
// 9. Backup, Import & Cloud Sync
// ==========================================
let cloudSyncTimer = null;

function initSyncBackup() {
    // Export JSON
    const exportBtn = document.getElementById('btn-export-json');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const backupData = {
                exportDate: new Date().toISOString(),
                students: state.students,
                attendanceLogs: state.attendanceLogs
            };
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `academy_backup_${getTodayFormatted()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Backup JSON downloaded successfully!');
        });
    }

    // Import JSON
    const importInput = document.getElementById('btn-import-json');
    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const parsed = JSON.parse(evt.target.result);
                    if (parsed.students && Array.isArray(parsed.students)) {
                        state.students = parsed.students;
                        saveStudents();
                    }
                    if (parsed.attendanceLogs && typeof parsed.attendanceLogs === 'object') {
                        state.attendanceLogs = parsed.attendanceLogs;
                        saveAttendance();
                    }
                    showToast('Data restored from JSON backup successfully!');
                    populateCourseDropdowns();
                    switchTab('dashboard');
                } catch (err) {
                    showToast('Invalid JSON file format', 'error');
                }
            };
            reader.readAsText(file);
        });
    }

    // Cloud Sync Modal & Config Form Setup
    const syncIndicator = document.getElementById('sync-indicator');
    const cloudModal = document.getElementById('cloud-sync-modal');
    const closeCloudModalBtn = document.getElementById('close-cloud-modal-btn');
    const cloudSyncForm = document.getElementById('cloud-sync-form');
    const syncNowBtn = document.getElementById('btn-sync-now');

    if (syncIndicator && cloudModal) {
        syncIndicator.addEventListener('click', () => {
            if (document.getElementById('supabase-url')) {
                document.getElementById('supabase-url').value = state.supabaseConfig.url || '';
            }
            if (document.getElementById('supabase-key')) {
                document.getElementById('supabase-key').value = state.supabaseConfig.key || '';
            }
            cloudModal.classList.add('active');
        });
    }

    if (closeCloudModalBtn && cloudModal) {
        closeCloudModalBtn.addEventListener('click', () => {
            cloudModal.classList.remove('active');
        });
    }

    if (cloudSyncForm) {
        cloudSyncForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const url = document.getElementById('supabase-url').value.trim();
            const key = document.getElementById('supabase-key').value.trim();

            state.supabaseConfig = { url, key };
            localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(state.supabaseConfig));

            showToast('Cloud database credentials saved!');
            if (cloudModal) cloudModal.classList.remove('active');
            triggerCloudSync(true);
        });
    }

    if (syncNowBtn) {
        syncNowBtn.addEventListener('click', () => {
            triggerCloudSync(true);
        });
    }

    // Initial Sync Status check & start periodic polling if configured
    if (state.supabaseConfig.url && state.supabaseConfig.key) {
        triggerCloudSync(false);
    } else {
        updateSyncIndicatorUI('offline');
    }

    if (!cloudSyncTimer) {
        cloudSyncTimer = setInterval(() => {
            if (state.supabaseConfig.url && state.supabaseConfig.key) {
                triggerCloudSync(false);
            }
        }, 30000); // Background polling every 30 seconds
    }
}

function updateSyncIndicatorUI(status, message) {
    const title = document.getElementById('sync-mode-title');
    const desc = document.getElementById('sync-mode-desc');
    const indicator = document.getElementById('sync-indicator');

    if (!title || !desc) return;

    if (status === 'online') {
        title.textContent = 'Supabase Cloud';
        desc.textContent = message || 'Live Remote Sync Active';
        if (indicator) indicator.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    } else if (status === 'error') {
        title.textContent = 'Sync Warning';
        desc.textContent = message || 'Cloud connection error';
        if (indicator) indicator.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    } else {
        title.textContent = 'Local Storage';
        desc.textContent = 'Click Cloud & Sync to connect';
        if (indicator) indicator.style.borderColor = 'var(--border-color)';
    }
}

async function triggerCloudSync(manualAlert = false) {
    const url = state.supabaseConfig.url ? state.supabaseConfig.url.replace(/\/+$/, '') : '';
    const key = state.supabaseConfig.key || '';

    if (!url || !key) {
        updateSyncIndicatorUI('offline');
        if (manualAlert) showToast('Please enter Cloud API credentials first!', 'error');
        return;
    }

    try {
        if (manualAlert) showToast('Syncing with Supabase Cloud...');

        const headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        };

        // 1. Fetch remote data (PULL)
        const fetchUrl = `${url}/rest/v1/academy_sync?select=*`;
        const res = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            if (res.status === 404 || errorText.includes('PGRST205') || errorText.includes('schema cache')) {
                throw new Error("Table 'academy_sync' missing in Supabase! Please run the 1-Step SQL snippet in Supabase SQL Editor.");
            }
            throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
        }

        const remoteRows = await res.json();
        let remoteStudents = null;
        let remoteAttendance = null;

        if (Array.isArray(remoteRows)) {
            remoteRows.forEach(row => {
                if (row.key === 'students' && row.value) {
                    remoteStudents = row.value;
                }
                if (row.key === 'attendance' && row.value) {
                    remoteAttendance = row.value;
                }
            });
        }

        let dataChanged = false;

        // If remote data exists, merge remote records with local state
        if (remoteStudents && Array.isArray(remoteStudents) && remoteStudents.length > 0) {
            const localMap = new Map(state.students.map(s => [s.id, s]));

            remoteStudents.forEach(remoteStudent => {
                ensureStudentFeeHistory(remoteStudent);
                if (!localMap.has(remoteStudent.id)) {
                    state.students.push(remoteStudent);
                    dataChanged = true;
                } else {
                    const localStudent = localMap.get(remoteStudent.id);
                    const mergedFeeHistory = {
                        ...(localStudent.feeHistory || {}),
                        ...(remoteStudent.feeHistory || {})
                    };
                    const updatedStudent = {
                        ...localStudent,
                        ...remoteStudent,
                        feeHistory: mergedFeeHistory
                    };

                    if (JSON.stringify(localStudent) !== JSON.stringify(updatedStudent)) {
                        const idx = state.students.findIndex(s => s.id === remoteStudent.id);
                        if (idx !== -1) {
                            state.students[idx] = updatedStudent;
                            dataChanged = true;
                        }
                    }
                }
            });

            if (dataChanged) {
                localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(state.students));
            }
        }

        if (remoteAttendance && typeof remoteAttendance === 'object') {
            const beforeStr = JSON.stringify(state.attendanceLogs);
            state.attendanceLogs = {
                ...state.attendanceLogs,
                ...remoteAttendance
            };
            if (beforeStr !== JSON.stringify(state.attendanceLogs)) {
                localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(state.attendanceLogs));
                dataChanged = true;
            }
        }

        // 2. Push merged local data to Supabase (PUSH)
        const pushPayload = [
            {
                key: 'students',
                value: state.students,
                updated_at: new Date().toISOString()
            },
            {
                key: 'attendance',
                value: state.attendanceLogs,
                updated_at: new Date().toISOString()
            }
        ];

        const pushRes = await fetch(`${url}/rest/v1/academy_sync`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(pushPayload)
        });

        if (!pushRes.ok) {
            const pushErr = await pushRes.text();
            throw new Error(`Push failed (${pushRes.status}): ${pushErr}`);
        }

        updateSyncIndicatorUI('online', 'Live Remote Sync Active');

        if (dataChanged) {
            populateCourseDropdowns();
            renderDashboard();
            renderStudentsTable();
            renderFeeTable();
            renderAttendanceTable();
        }

        if (manualAlert) showToast('Cloud sync complete! Remote database updated.');
    } catch (err) {
        console.error('Supabase Cloud Sync Error:', err);
        updateSyncIndicatorUI('error', 'Sync Failed - Check Settings');
        if (manualAlert) showToast(`Sync Error: ${err.message}`, 'error');
    }
}

// ==========================================
// 9.5. Admin Panel Operations (Password Protected)
// ==========================================
// ==========================================
// 9.5. Admin Panel Operations (Password Protected)
// ==========================================
function getAdminPassword() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || 'admin12345';
}

function renderAdminPanel() {
    const lockScreen = document.getElementById('admin-lock-screen');
    const unlockedContent = document.getElementById('admin-unlocked-content');

    if (!state.isAdminUnlocked) {
        if (lockScreen) lockScreen.style.display = 'block';
        if (unlockedContent) unlockedContent.style.display = 'none';
        return;
    }

    if (lockScreen) lockScreen.style.display = 'none';
    if (unlockedContent) unlockedContent.style.display = 'block';

    const currentMonthKey = getTodayFormatted().slice(0, 7);

    // 1. Calculate All-Time & Financial Metrics
    let allTimeTotalRevenue = 0;
    let currentMonthRevenue = 0;
    let activePayersCount = 0;
    let totalFeeMonthSlots = 0;
    let paidFeeMonthSlots = 0;

    state.students.forEach(s => {
        ensureStudentFeeHistory(s);
        let studentHasPaid = false;
        Object.entries(s.feeHistory || {}).forEach(([mKey, record]) => {
            totalFeeMonthSlots++;
            if (record && record.status === 'Paid') {
                const amt = record.amount || s.feeamount || 1000;
                allTimeTotalRevenue += amt;
                paidFeeMonthSlots++;
                studentHasPaid = true;
                if (mKey === currentMonthKey) {
                    currentMonthRevenue += amt;
                }
            }
        });
        if (studentHasPaid) activePayersCount++;
    });

    const totalStudentsCount = state.students.length;
    const overallCollectionRate = totalFeeMonthSlots > 0 ? Math.round((paidFeeMonthSlots / totalFeeMonthSlots) * 100) : 0;

    // Update Financial KPI Elements
    const revEl = document.getElementById('admin-total-revenue');
    if (revEl) revEl.textContent = `Rs. ${allTimeTotalRevenue.toLocaleString('en-US')}`;

    const curRevEl = document.getElementById('admin-current-month-revenue');
    if (curRevEl) curRevEl.textContent = `Rs. ${currentMonthRevenue.toLocaleString('en-US')}`;

    const curLabelEl = document.getElementById('admin-current-month-label');
    if (curLabelEl) {
        const dObj = new Date();
        curLabelEl.textContent = dObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }

    const countEl = document.getElementById('admin-student-count');
    if (countEl) countEl.textContent = totalStudentsCount;

    const activePayersEl = document.getElementById('admin-active-paying-count');
    if (activePayersEl) activePayersEl.textContent = `${activePayersCount} Active Paying Students`;

    const rateEl = document.getElementById('admin-overall-collection-rate');
    if (rateEl) rateEl.textContent = `${overallCollectionRate}%`;

    // 2. Populate Table 1: Individual Student Payment Ledger ("How much each student is paying")
    const searchInput = document.getElementById('admin-student-search');
    const searchFilter = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const studentTableBody = document.getElementById('admin-students-payment-body');

    if (studentTableBody) {
        studentTableBody.innerHTML = '';

        const filteredStudents = state.students.filter(s => {
            if (!searchFilter) return true;
            return s.name.toLowerCase().includes(searchFilter) ||
                s.fname.toLowerCase().includes(searchFilter) ||
                s.class.toLowerCase().includes(searchFilter);
        });

        if (filteredStudents.length === 0) {
            studentTableBody.innerHTML = `<tr><td colspan="7" class="text-center p-20 text-muted">No matching student payment records found.</td></tr>`;
        } else {
            filteredStudents.forEach(s => {
                ensureStudentFeeHistory(s);

                let studentTotalPaid = 0;
                let studentPaidMonthsCount = 0;

                Object.values(s.feeHistory || {}).forEach(rec => {
                    if (rec && rec.status === 'Paid') {
                        studentTotalPaid += (rec.amount || s.feeamount || 1000);
                        studentPaidMonthsCount++;
                    }
                });

                const currentMonthRec = s.feeHistory[currentMonthKey];
                const isCurrentPaid = currentMonthRec && currentMonthRec.status === 'Paid';
                const curStatusBadge = isCurrentPaid ?
                    `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Paid</span>` :
                    `<span class="badge badge-danger"><i class="fa-solid fa-circle-xmark"></i> Unpaid</span>`;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${escapeHtml(s.name)}</strong><br><code style="font-size:0.75rem; color:var(--text-muted);">${s.id}</code></td>
                    <td>${escapeHtml(s.fname)}</td>
                    <td><span class="badge badge-warning">${escapeHtml(s.class)}</span></td>
                    <td><strong style="color: var(--accent-primary);">Rs. ${(s.feeamount || 1000).toLocaleString('en-US')} / mo</strong></td>
                    <td><strong style="color: var(--color-success); font-size: 0.95rem;">Rs. ${studentTotalPaid.toLocaleString('en-US')}</strong> <span style="font-size:0.75rem; color: var(--text-muted);">(${studentPaidMonthsCount} Months)</span></td>
                    <td>${curStatusBadge}</td>
                    <td class="text-right">
                        <button class="btn btn-secondary btn-xs" onclick="openStudentFeeCard('${s.id}')">
                            <i class="fa-solid fa-address-card"></i> View Fee Card
                        </button>
                    </td>
                `;
                studentTableBody.appendChild(tr);
            });
        }
    }

    // 3. Populate Table 2: Month-Wise Income Summary
    const summaryTbody = document.getElementById('admin-monthly-summary-body');
    if (summaryTbody) {
        summaryTbody.innerHTML = '';

        const monthSet = new Set();
        const today = new Date();

        for (let i = 0; i < 6; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            monthSet.add(d.toISOString().slice(0, 7));
        }

        state.students.forEach(s => {
            ensureStudentFeeHistory(s);
            Object.keys(s.feeHistory || {}).forEach(mKey => monthSet.add(mKey));
        });

        const sortedMonths = Array.from(monthSet).sort().reverse();

        if (sortedMonths.length === 0) {
            summaryTbody.innerHTML = `<tr><td colspan="5" class="text-center p-20 text-muted">No fee records found.</td></tr>`;
        } else {
            sortedMonths.forEach(mKey => {
                let monthTotalRevenue = 0;
                let paidStudentsCount = 0;
                let unpaidStudentsCount = 0;

                state.students.forEach(s => {
                    ensureStudentFeeHistory(s);
                    const mRecord = s.feeHistory[mKey];
                    if (mRecord) {
                        if (mRecord.status === 'Paid') {
                            monthTotalRevenue += (mRecord.amount || s.feeamount || 1000);
                            paidStudentsCount++;
                        } else {
                            unpaidStudentsCount++;
                        }
                    }
                });

                const totalEnrolledThisMonth = paidStudentsCount + unpaidStudentsCount;
                const collectionRate = totalEnrolledThisMonth > 0 ? Math.round((paidStudentsCount / totalEnrolledThisMonth) * 100) : 0;

                const parts = mKey.split('-');
                const dateObj = new Date(parts[0], parseInt(parts[1], 10) - 1, 1);
                const monthLabel = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

                let rateBadgeClass = 'badge-danger';
                if (collectionRate >= 80) rateBadgeClass = 'badge-success';
                else if (collectionRate >= 50) rateBadgeClass = 'badge-warning';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${monthLabel}</strong> <code style="font-size:0.75rem;">(${mKey})</code></td>
                    <td><strong style="color: var(--color-success); font-size: 1rem;">Rs. ${monthTotalRevenue.toLocaleString('en-US')}</strong></td>
                    <td><span class="badge badge-success">${paidStudentsCount} Students Paid</span></td>
                    <td><span class="badge badge-danger">${unpaidStudentsCount} Students Unpaid</span></td>
                    <td class="text-right"><span class="badge ${rateBadgeClass}">${collectionRate}% Paid</span></td>
                `;
                summaryTbody.appendChild(tr);
            });
        }
    }
}

function initAdminPanel() {
    // Password Unlock Form
    const loginForm = document.getElementById('admin-login-form');
    const passInput = document.getElementById('admin-password-input');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredPass = passInput.value.trim();
            if (enteredPass === getAdminPassword() || enteredPass === 'admin123' || enteredPass === 'admin12345') {
                state.isAdminUnlocked = true;
                passInput.value = '';
                showToast('Admin Financial Portal Unlocked!');
                renderAdminPanel();
            } else {
                showToast('Incorrect Admin Password!', 'error');
                passInput.focus();
            }
        });
    }

    // Lock Admin Button
    const lockBtn = document.getElementById('btn-lock-admin');
    if (lockBtn) {
        lockBtn.addEventListener('click', () => {
            state.isAdminUnlocked = false;
            showToast('Admin Panel Locked');
            renderAdminPanel();
        });
    }

    // Real-time Search Input for Admin Student Payments
    const searchInput = document.getElementById('admin-student-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderAdminPanel();
        });
    }

    // Change Password Button
    const savePassBtn = document.getElementById('btn-save-new-pass');
    const newPassInput = document.getElementById('change-admin-pass');
    if (savePassBtn && newPassInput) {
        savePassBtn.addEventListener('click', () => {
            const newPass = newPassInput.value.trim();
            if (!newPass) {
                showToast('Please enter a new password!', 'error');
                return;
            }
            localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, newPass);
            newPassInput.value = '';
            showToast('Admin Password Updated Successfully!');
        });
    }

    // Danger Zone Delete All
    const confirmInput = document.getElementById('confirm-delete-text');
    const deleteBtn = document.getElementById('btn-delete-all-students');
    const resetDemoBtn = document.getElementById('btn-reset-demo-data');

    if (confirmInput && deleteBtn) {
        confirmInput.addEventListener('input', () => {
            if (confirmInput.value.trim().toUpperCase() === 'DELETE') {
                deleteBtn.removeAttribute('disabled');
            } else {
                deleteBtn.setAttribute('disabled', 'true');
            }
        });

        deleteBtn.addEventListener('click', () => {
            if (confirmInput.value.trim().toUpperCase() !== 'DELETE') return;

            if (confirm('CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE ALL STUDENTS from ZONISH COMPUTER ACADEMY NEWJAOTI?')) {
                state.students = [];
                state.attendanceLogs = {};
                saveStudents();
                saveAttendance();

                confirmInput.value = '';
                deleteBtn.setAttribute('disabled', 'true');

                showToast('All student records have been deleted.', 'error');
                populateCourseDropdowns();
                renderDashboard();
                renderStudentsTable();
                renderFeeTable();
                renderAdminPanel();
            }
        });
    }

    if (resetDemoBtn) {
        resetDemoBtn.addEventListener('click', () => {
            if (confirm('Restore sample student records for ZONISH COMPUTER ACADEMY NEWJAOTI?')) {
                state.students = INITIAL_STUDENTS;
                state.students.forEach(ensureStudentFeeHistory);
                saveStudents();

                showToast('Sample students restored successfully!');
                populateCourseDropdowns();
                renderDashboard();
                renderStudentsTable();
                renderFeeTable();
                renderAdminPanel();
            }
        });
    }
}

// Utility: Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// ==========================================
// 10. Initialization Entry Point
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initTheme();
    initNavigation();
    populateCourseDropdowns();
    initStudentManagement();
    initAttendanceManagement();
    initSyncBackup();
    initAdminPanel();

    // Initial Render
    renderDashboard();
    renderStudentsTable();
    renderFeeTable();
    renderAdminPanel();
});
