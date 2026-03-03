// 全局数据存储
let data = {
    packages: [],
    classes: [],
    recharges: [],
    students: [],
    attendance: []
};

// 颜色池，用于考勤标签
const colorPool = [
    '#FEFCBF', '#FED7D7', '#FEEBC8', '#C6F6D5', '#9AE6B4',
    '#BEE3F8', '#90CDF4', '#D6BCFA', '#FBCFE8', '#FED7E2'
];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    loadData();
    initTabs();
    renderAllTables();
});

// 加载主题
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'purple';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeSelector(savedTheme);
}

// 切换主题
function changeTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
    updateThemeSelector(themeName);
    showNotification('主题已切换');
}

// 更新主题选择器状态
function updateThemeSelector(themeName) {
    // 更新下拉选择框
    const select = document.getElementById('theme-select');
    if (select) {
        select.value = themeName;
    }
    
    // 更新主题卡片状态
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('active');
    });
    
    const activeCard = document.querySelector(`.theme-card[onclick="changeTheme('${themeName}')"]`);
    if (activeCard) {
        activeCard.classList.add('active');
    }
}

// 加载数据
function loadData() {
    try {
        const savedData = localStorage.getItem('shufaMemberSystem');
        if (savedData) {
            data = JSON.parse(savedData);
        }
    } catch (e) {
        console.error('加载数据失败:', e);
        showNotification('加载数据失败', 'error');
    }
}

// 保存数据
function saveData() {
    try {
        localStorage.setItem('shufaMemberSystem', JSON.stringify(data));
    } catch (e) {
        console.error('保存数据失败:', e);
        showNotification('保存数据失败', 'error');
    }
}

// 初始化标签页
function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const modules = document.querySelectorAll('.module');
            modules.forEach(m => m.classList.remove('active'));
            
            const moduleId = this.dataset.module + '-module';
            document.getElementById(moduleId).classList.add('active');
            
            renderAllTables();
        });
    });
}

// 渲染所有表格
function renderAllTables() {
    renderPackages();
    renderClasses();
    renderRecharges();
    renderStudents();
    renderAttendance();
    updateClassSelects();
    updatePackageSelects();
    updateStats();
}

// 显示通知
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.background = type === 'error' ? '#f56565' : '#48bb78';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 确认对话框
function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="min-width: 300px;">
                <div class="modal-header">
                    <h3>确认操作</h3>
                </div>
                <p style="margin-bottom: 20px;">${message}</p>
                <div class="modal-footer">
                    <button class="btn" onclick="this.closest('.modal').remove()">取消</button>
                    <button class="btn btn-danger" id="confirm-btn">确认</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('confirm-btn').addEventListener('click', function() {
            modal.remove();
            resolve(true);
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        });
    });
}

// ==================== 课包管理模块 ====================
function showAddPackageModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>添加课包</h3>
            </div>
            <div class="form-group">
                <label>课包名称</label>
                <input type="text" id="package-name" placeholder="请输入课包名称">
            </div>
            <div class="form-group">
                <label>课时数</label>
                <input type="number" id="package-count" placeholder="请输入课时数">
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal').remove()">取消</button>
                <button class="btn btn-primary" onclick="addPackage()">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function addPackage() {
    const name = document.getElementById('package-name').value.trim();
    const count = parseInt(document.getElementById('package-count').value);
    
    if (!name || !count || count <= 0) {
        showNotification('请填写完整的课包信息', 'error');
        return;
    }
    
    const packageItem = {
        id: Date.now(),
        name: name,
        count: count
    };
    
    data.packages.push(packageItem);
    saveData();
    renderPackages();
    
    document.querySelector('.modal').remove();
    showNotification('课包添加成功');
}

function renderPackages() {
    const tbody = document.getElementById('package-table-body');
    tbody.innerHTML = '';
    
    data.packages.forEach(pkg => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pkg.name}</td>
            <td>${pkg.count} 课时</td>
            <td>
                <button class="btn btn-warning" onclick="showEditPackageModal(${pkg.id})">修改</button>
                <button class="btn btn-danger" onclick="deletePackage(${pkg.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deletePackage(id) {
    const confirmed = await showConfirm('确定要删除这个课包吗？此操作不可恢复！');
    if (!confirmed) return;
    
    data.packages = data.packages.filter(p => p.id !== id);
    saveData();
    renderPackages();
    showNotification('课包删除成功');
}

function showEditPackageModal(id) {
    const pkg = data.packages.find(p => p.id === id);
    if (!pkg) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>修改课包</h3>
            </div>
            <div class="form-group">
                <label>课包名称</label>
                <input type="text" id="edit-package-name" value="${pkg.name}">
            </div>
            <div class="form-group">
                <label>课时数</label>
                <input type="number" id="edit-package-count" value="${pkg.count}">
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal').remove()">取消</button>
                <button class="btn btn-primary" onclick="editPackage(${pkg.id})">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function editPackage(id) {
    const name = document.getElementById('edit-package-name').value.trim();
    const count = parseInt(document.getElementById('edit-package-count').value);
    
    if (!name || !count || count <= 0) {
        showNotification('请填写完整的课包信息', 'error');
        return;
    }
    
    const pkg = data.packages.find(p => p.id === id);
    if (pkg) {
        pkg.name = name;
        pkg.count = count;
        saveData();
        renderPackages();
        document.querySelector('.modal').remove();
        showNotification('课包修改成功');
    }
}

// ==================== 班级管理模块 ====================
function showAddClassModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>添加班级</h3>
            </div>
            <div class="form-group">
                <label>班级名称</label>
                <input type="text" id="class-name" placeholder="请输入班级名称">
            </div>
            <div class="form-group">
                <label>上课时间</label>
                <input type="text" id="class-time" placeholder="例如：每周六 10:00-12:00">
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal').remove()">取消</button>
                <button class="btn btn-primary" onclick="addClass()">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function addClass() {
    const name = document.getElementById('class-name').value.trim();
    const time = document.getElementById('class-time').value.trim();
    
    if (!name || !time) {
        showNotification('请填写完整的班级信息', 'error');
        return;
    }
    
    const classItem = {
        id: Date.now(),
        name: name,
        time: time
    };
    
    data.classes.push(classItem);
    saveData();
    renderClasses();
    
    document.querySelector('.modal').remove();
    showNotification('班级添加成功');
}

function renderClasses() {
    const tbody = document.getElementById('class-table-body');
    tbody.innerHTML = '';
    
    data.classes.forEach(cls => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cls.name}</td>
            <td>${cls.time}</td>
            <td>
                <button class="btn btn-warning" onclick="showEditClassModal(${cls.id})">修改</button>
                <button class="btn btn-danger" onclick="deleteClass(${cls.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deleteClass(id) {
    const confirmed = await showConfirm('确定要删除这个班级吗？此操作不可恢复！');
    if (!confirmed) return;
    
    data.classes = data.classes.filter(c => c.id !== id);
    saveData();
    renderClasses();
    showNotification('班级删除成功');
}

function showEditClassModal(id) {
    const cls = data.classes.find(c => c.id === id);
    if (!cls) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>修改班级</h3>
            </div>
            <div class="form-group">
                <label>班级名称</label>
                <input type="text" id="edit-class-name" value="${cls.name}">
            </div>
            <div class="form-group">
                <label>上课时间</label>
                <input type="text" id="edit-class-time" value="${cls.time}">
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal').remove()">取消</button>
                <button class="btn btn-primary" onclick="editClass(${cls.id})">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function editClass(id) {
    const name = document.getElementById('edit-class-name').value.trim();
    const time = document.getElementById('edit-class-time').value.trim();
    
    if (!name || !time) {
        showNotification('请填写完整的班级信息', 'error');
        return;
    }
    
    const cls = data.classes.find(c => c.id === id);
    if (cls) {
        cls.name = name;
        cls.time = time;
        saveData();
        renderClasses();
        document.querySelector('.modal').remove();
        showNotification('班级修改成功');
    }
}

// 更新班级选择框
function updateClassSelects() {
    const selects = [
        document.getElementById('student-search-class'),
        document.getElementById('attendance-filter-class'),
        document.getElementById('student-class')
    ];
    
    selects.forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = '<option value="">请选择</option>';
        
        data.classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.name;
            option.textContent = cls.name;
            select.appendChild(option);
        });
        
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

// 更新课包选择框
function updatePackageSelects() {
    const selects = [
        document.getElementById('recharge-package'),
        document.getElementById('student-package')
    ];
    
    selects.forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = '<option value="">请选择</option>';
        
        data.packages.forEach(pkg => {
            const option = document.createElement('option');
            option.value = pkg.name;
            option.textContent = pkg.name;
            select.appendChild(option);
        });
        
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

// ==================== 续费充值模块 ====================
function showAddRechargeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>添加续费</h3>
            </div>
            <div class="form-group">
                <label>类型</label>
                <select id="recharge-type" onchange="toggleRechargeType()">
                    <option value="new">新学员充值</option>
                    <option value="renew">老学员续费</option>
                </select>
            </div>
            <div class="form-group">
                <label>学员姓名</label>
                <select id="recharge-student-select" style="display: none;">
                    <option value="">请选择学员</option>
                </select>
                <input type="text" id="recharge-student-name" placeholder="请输入学员姓名">
            </div>
            <div class="form-group">
                <label>课包名称</label>
                <select id="recharge-package">
                    <option value="">请选择课包</option>
                </select>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal').remove()">取消</button>
                <button class="btn btn-primary" onclick="addRecharge()">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    updatePackageSelects();
    updateRechargeStudentSelect();
}

function toggleRechargeType() {
    const type = document.getElementById('recharge-type').value;
    const studentSelect = document.getElementById('recharge-student-select');
    const studentInput = document.getElementById('recharge-student-name');
    
    if (type === 'renew') {
        studentSelect.style.display = 'block';
        studentInput.style.display = 'none';
        updateRechargeStudentSelect();
    } else {
        studentSelect.style.display = 'none';
        studentInput.style.display = 'block';
    }
}

function updateRechargeStudentSelect() {
    const select = document.getElementById('recharge-student-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">请选择学员</option>';
    
    data.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.name;
        option.textContent = student.name;
        select.appendChild(option);
    });
}

function addRecharge() {
    const type = document.getElementById('recharge-type').value;
    const studentName = type === 'renew' 
        ? document.getElementById('recharge-student-select').value 
        : document.getElementById('recharge-student-name').value.trim();
    const packageName = document.getElementById('recharge-package').value;
    
    if (!studentName || !packageName) {
        showNotification('请填写完整的续费信息', 'error');
        return;
    }
    
    const pkg = data.packages.find(p => p.name === packageName);
    if (!pkg) {
        showNotification('请选择有效的课包', 'error');
        return;
    }
    
    const now = new Date();
    const recharge = {
        id: Date.now(),
        studentName: studentName,
        packageName: packageName,
        count: pkg.count,
        date: now.toLocaleDateString('zh-CN'),
        time: now.toLocaleTimeString('zh-CN')
    };
    
    data.recharges.push(recharge);
    
    // 如果是新学员，检查是否需要自动创建学员记录
    if (type === 'new') {
        const existingStudent = data.students.find(s => s.name === studentName);
        if (!existingStudent) {
            // 不自动创建，由用户在学员管理模块手动创建
            showNotification('新学员充值成功，请在学员管理模块完善学员信息');
        }
    }
    
    saveData();
    renderRecharges();
    
    document.querySelector('.modal').remove();
    showNotification('续费添加成功');
}

function renderRecharges() {
    const tbody = document.getElementById('recharge-table-body');
    tbody.innerHTML = '';
    
    data.recharges.forEach(recharge => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${recharge.studentName}</td>
            <td>${recharge.packageName}</td>
            <td>${recharge.count} 课时</td>
            <td>${recharge.date}</td>
            <td>${recharge.time}</td>
            <td>
                <button class="btn btn-warning" onclick="showEditRechargeModal(${recharge.id})">修改</button>
                <button class="btn btn-danger" onclick="deleteRecharge(${recharge.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function searchRecharges() {
    const nameKeyword = document.getElementById('recharge-search-name').value.trim().toLowerCase();
    const packageKeyword = document.getElementById('recharge-search-package').value.trim().toLowerCase();
    
    const tbody = document.getElementById('recharge-table-body');
    tbody.innerHTML = '';
    
    const filtered = data.recharges.filter(r => {
        const matchName = !nameKeyword || r.studentName.toLowerCase().includes(nameKeyword);
        const matchPackage = !packageKeyword || r.packageName.toLowerCase().includes(packageKeyword);
        return matchName && matchPackage;
    });
    
    filtered.forEach(recharge => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${recharge.studentName}</td>
            <td>${recharge.packageName}</td>
            <td>${recharge.count} 课时</td>
            <td>${recharge.date}</td>
            <td>${recharge.time}</td>
            <td>
                <button class="btn btn-warning" onclick="showEditRechargeModal(${recharge.id})">修改</button>
                <button class="btn btn-danger" onclick="deleteRecharge(${recharge.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deleteRecharge(id) {
    const confirmed = await showConfirm('确定要删除这条续费记录吗？此操作不可恢复！');
    if (!confirmed) return;
    
    data.recharges = data.recharges.filter(r => r.id !== id);
    saveData();
    renderRecharges();
    showNotification('续费记录删除成功');
}

function showEditRechargeModal(id) {
    const recharge = data.recharges.find(r => r.id === id);
    if (!recharge) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>修改续费记录</h3>
            </div>
            <div class="form-group">
                <label>学员姓名</label>
                <input type="text" id="edit-recharge-student" value="${recharge.studentName}">
            </div>
            <div class="form-group">
                <label>课包名称</label>
                <select id="edit-recharge-package">
                    <option value="">请选择课包</option>
                </select>
            </div>
            <div class="form-group">
                <label>课时数</label>
                <input type="number" id="edit-recharge-count" value="${recharge.count}">
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal').remove()">取消</button>
                <button class="btn btn-primary" onclick="editRecharge(${recharge.id})">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const pkgSelect = document.getElementById('edit-recharge-package');
    data.packages.forEach(pkg => {
        const option = document.createElement('option');
        option.value = pkg.name;
        option.textContent = pkg.name;
        if (pkg.name === recharge.packageName) {
            option.selected = true;
        }
        pkgSelect.appendChild(option);
    });
}

function editRecharge(id) {
    const studentName = document.getElementById('edit-recharge-student').value.trim();
    const packageName = document.getElementById('edit-recharge-package').value;
    const count = parseInt(document.getElementById('edit-recharge-count').value);
    
    if (!studentName || !packageName || !count || count <= 0) {
        showNotification('请填写完整的续费信息', 'error');
        return;
    }
    
    const recharge = data.recharges.find(r => r.id === id);
    if (recharge) {
        recharge.studentName = studentName;
        recharge.packageName = packageName;
        recharge.count = count;
        saveData();
        renderRecharges();
        document.querySelector('.modal').remove();
        showNotification('续费记录修改成功');
    }
}

// ==================== 学员管理模块 ====================
function showAddStudentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>添加学员</h3>
            </div>
            <div class="form-group">
                <label>姓名</label>
                <input type="text" id="student-name" placeholder="请输入姓名">
            </div>
            <div class="form-group">
                <label>年龄</label>
                <input type="number" id="student-age" placeholder="请输入年龄">
            </div>
            <div class="form-group">
                <label>学校</label>
                <input type="text" id="student-school" placeholder="请输入学校">
            </div>
            <div class="form-group">
                <label>电话</label>
                <input type="text" id="student-phone" placeholder="请输入电话">
            </div>
            <div class="form-group">
                <label>班级</label>
                <select id="student-class">
                    <option value="">请选择班级</option>
                </select>
            </div>
            <div class="form-group">
                <label>初始课包</label>
                <select id="student-package" onchange="updateStudentInitialCount()">
                    <option value="">请选择课包</option>
                </select>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal').remove()">取消</button>
                <button class="btn btn-primary" onclick="addStudent()">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    updateClassSelects();
    updatePackageSelects();
}

function updateStudentInitialCount() {
    // 预留函数，用于更新初始课时数显示
}

function addStudent() {
    const name = document.getElementById('student-name').value.trim();
    const age = parseInt(document.getElementById('student-age').value);
    const school = document.getElementById('student-school').value.trim();
    const phone = document.getElementById('student-phone').value.trim();
    const className = document.getElementById('student-class').value;
    const packageName = document.getElementById('student-package').value;
    
    if (!name || !age || !school || !phone || !className || !packageName) {
        showNotification('请填写完整的学员信息', 'error');
        return;
    }
    
    // 检查是否已存在同名学员
    if (data.students.find(s => s.name === name)) {
        showNotification('该学员已存在', 'error');
        return;
    }
    
    // 查找该学员的充值记录
    const recharge = data.recharges.find(r => r.studentName === name && r.packageName === packageName);
    const totalCount = recharge ? recharge.count : 0;
    
    const student = {
        id: Date.now(),
        name: name,
        age: age,
        school: school,
        phone: phone,
        className: className,
        packageName: packageName,
        totalCount: totalCount,
        usedCount: 0,
        remainingCount: totalCount
    };
    
    data.students.push(student);
    saveData();
    renderStudents();
    
    document.querySelector('.modal').remove();
    showNotification('学员添加成功');
}

function renderStudents() {
    const tbody = document.getElementById('student-table-body');
    tbody.innerHTML = '';
    
    data.students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.school}</td>
            <td>${student.phone}</td>
            <td>${student.className}</td>
            <td>${student.packageName}</td>
            <td>${student.totalCount}</td>
            <td>${student.usedCount}</td>
            <td>${student.remainingCount}</td>
            <td>
                <button class="btn btn-info" onclick="showStudentAttendance(${student.id})">考勤查询</button>
                <button class="btn btn-warning" onclick="showEditStudentModal(${student.id})">修改</button>
                <button class="btn btn-danger" onclick="deleteStudent(${student.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function searchStudents() {
    const nameKeyword = document.getElementById('student-search-name').value.trim().toLowerCase();
    const age = document.getElementById('student-search-age').value;
    const schoolKeyword = document.getElementById('student-search-school').value.trim().toLowerCase();
    const phoneKeyword = document.getElementById('student-search-phone').value.trim();
    const className = document.getElementById('student-search-class').value;
    
    const tbody = document.getElementById('student-table-body');
    tbody.innerHTML = '';
    
    const filtered = data.students.filter(s => {
        const matchName = !nameKeyword || s.name.toLowerCase().includes(nameKeyword);
        const matchAge = !age || s.age === parseInt(age);
        const matchSchool = !schoolKeyword || s.school.toLowerCase().includes(schoolKeyword);
        const matchPhone = !phoneKeyword || s.phone.includes(phoneKeyword);
        const matchClass = !className || s.className === className;
        return matchName && matchAge && matchSchool && matchPhone && matchClass;
    });
    
    filtered.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.school}</td>
            <td>${student.phone}</td>
            <td>${student.className}</td>
            <td>${student.packageName}</td>
            <td>${student.totalCount}</td>
            <td>${student.usedCount}</td>
            <td>${student.remainingCount}</td>
            <td>
                <button class="btn btn-info" onclick="showStudentAttendance(${student.id})">考勤查询</button>
                <button class="btn btn-warning" onclick="showEditStudentModal(${student.id})">修改</button>
                <button class="btn btn-danger" onclick="deleteStudent(${student.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showStudentAttendance(studentId) {
    const student = data.students.find(s => s.id === studentId);
    if (!student) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${student.name} - 考勤查询</h3>
            </div>
            <div class="form-group">
                <label>选择月份</label>
                <input type="month" id="attendance-query-month">
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal').remove()">关闭</button>
                <button class="btn btn-info" onclick="queryStudentAttendance('${student.name}')">查询</button>
            </div>
            <div id="attendance-query-result" style="margin-top: 20px; max-height: 300px; overflow-y: auto;">
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 默认设置为当前月份
    const now = new Date();
    const monthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('attendance-query-month').value = monthStr;
}

function queryStudentAttendance(studentName) {
    const monthStr = document.getElementById('attendance-query-month').value;
    if (!monthStr) {
        showNotification('请选择月份', 'error');
        return;
    }
    
    const [year, month] = monthStr.split('-').map(Number);
    const resultDiv = document.getElementById('attendance-query-result');
    
    const records = data.attendance.filter(a => {
        const recordDate = new Date(a.date);
        return a.studentName === studentName && 
               recordDate.getFullYear() === year && 
               recordDate.getMonth() + 1 === month;
    });
    
    if (records.length === 0) {
        resultDiv.innerHTML = '<p style="color: #666; text-align: center;">该月份暂无考勤记录</p>';
    } else {
        resultDiv.innerHTML = `
            <p><strong>查询月份：</strong>${year}年${month}月</p>
            <p><strong>考勤次数：</strong>${records.length} 次</p>
            <p><strong>考勤日期：</strong></p>
            <div style="margin-top: 10px;">
                ${records.map(r => `
                    <span class="tag" style="background: ${colorPool[records.indexOf(r) % colorPool.length]}">
                        ${r.date}
                    </span>
                `).join('')}
            </div>
        `;
    }
}

async function deleteStudent(id) {
    const confirmed = await showConfirm('确定要删除这个学员吗？此操作不可恢复！');
    if (!confirmed) return;
    
    data.students = data.students.filter(s => s.id !== id);
    saveData();
    renderStudents();
    showNotification('学员删除成功');
}

function showEditStudentModal(id) {
    const student = data.students.find(s => s.id === id);
    if (!student) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>修改学员信息</h3>
            </div>
            <div class="form-group">
                <label>姓名</label>
                <input type="text" id="edit-student-name" value="${student.name}">
            </div>
            <div class="form-group">
                <label>年龄</label>
                <input type="number" id="edit-student-age" value="${student.age}">
            </div>
            <div class="form-group">
                <label>学校</label>
                <input type="text" id="edit-student-school" value="${student.school}">
            </div>
            <div class="form-group">
                <label>电话</label>
                <input type="text" id="edit-student-phone" value="${student.phone}">
            </div>
            <div class="form-group">
                <label>班级</label>
                <select id="edit-student-class">
                    <option value="">请选择班级</option>
                </select>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal').remove()">取消</button>
                <button class="btn btn-primary" onclick="editStudent(${student.id})">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    updateClassSelects();
    document.getElementById('edit-student-class').value = student.className;
}

function editStudent(id) {
    const name = document.getElementById('edit-student-name').value.trim();
    const age = parseInt(document.getElementById('edit-student-age').value);
    const school = document.getElementById('edit-student-school').value.trim();
    const phone = document.getElementById('edit-student-phone').value.trim();
    const className = document.getElementById('edit-student-class').value;
    
    if (!name || !age || !school || !phone || !className) {
        showNotification('请填写完整的学员信息', 'error');
        return;
    }
    
    const student = data.students.find(s => s.id === id);
    if (student) {
        student.name = name;
        student.age = age;
        student.school = school;
        student.phone = phone;
        student.className = className;
        saveData();
        renderStudents();
        document.querySelector('.modal').remove();
        showNotification('学员信息修改成功');
    }
}

// ==================== 考勤扣课模块 ====================
function renderAttendance() {
    const tbody = document.getElementById('attendance-table-body');
    tbody.innerHTML = '';
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    data.students.forEach(student => {
        // 获取当月考勤记录
        const currentMonthRecords = data.attendance.filter(a => {
            const recordDate = new Date(a.date);
            return a.studentName === student.name && 
                   recordDate.getFullYear() === currentYear && 
                   recordDate.getMonth() + 1 === currentMonth;
        });
        
        // 获取上月考勤记录
        let lastMonth = currentMonth - 1;
        let lastMonthYear = currentYear;
        if (lastMonth === 0) {
            lastMonth = 12;
            lastMonthYear = currentYear - 1;
        }
        
        const lastMonthRecords = data.attendance.filter(a => {
            const recordDate = new Date(a.date);
            return a.studentName === student.name && 
                   recordDate.getFullYear() === lastMonthYear && 
                   recordDate.getMonth() + 1 === lastMonth;
        });
        
        // 获取上上月考勤记录
        let lastLastMonth = lastMonth - 1;
        let lastLastMonthYear = lastMonthYear;
        if (lastLastMonth === 0) {
            lastLastMonth = 12;
            lastLastMonthYear = lastMonthYear - 1;
        }
        
        const lastLastMonthRecords = data.attendance.filter(a => {
            const recordDate = new Date(a.date);
            return a.studentName === student.name && 
                   recordDate.getFullYear() === lastLastMonthYear && 
                   recordDate.getMonth() + 1 === lastLastMonth;
        });
        
        // 生成当月考勤日期标签
        const dateTags = currentMonthRecords.map((record, index) => {
            const color = colorPool[index % colorPool.length];
            const recordDate = new Date(record.date);
            const fullDate = recordDate.toLocaleDateString('zh-CN');
            const monthDay = String(recordDate.getMonth() + 1).padStart(2, '0') + '-' + 
                            String(recordDate.getDate()).padStart(2, '0');
            
            return `
                <span class="tag tooltip" 
                      style="background: ${color}" 
                      data-tooltip="${fullDate}"
                      onclick="removeAttendanceRecord(${record.id}, '${student.name}')">
                    ${monthDay}
                    <span class="tag-delete">×</span>
                </span>
            `;
        }).join('');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name}</td>
            <td>${student.className}</td>
            <td>${dateTags || '<span style="color: #999;">无考勤记录</span>'}</td>
            <td>${currentMonthRecords.length}</td>
            <td>${student.remainingCount}</td>
            <td>${lastMonthRecords.length}</td>
            <td>${lastLastMonthRecords.length}</td>
            <td>
                <button class="btn btn-primary" onclick="showAddAttendanceModal(${student.id})">考勤</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterAttendance() {
    const className = document.getElementById('attendance-filter-class').value;
    const nameKeyword = document.getElementById('attendance-filter-name').value.trim().toLowerCase();
    const monthStr = document.getElementById('attendance-filter-month').value;
    
    const tbody = document.getElementById('attendance-table-body');
    tbody.innerHTML = '';
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const filteredStudents = data.students.filter(s => {
        const matchClass = !className || s.className === className;
        const matchName = !nameKeyword || s.name.toLowerCase().includes(nameKeyword);
        return matchClass && matchName;
    });
    
    filteredStudents.forEach(student => {
        let currentMonthRecords = data.attendance.filter(a => {
            const recordDate = new Date(a.date);
            return a.studentName === student.name && 
                   recordDate.getFullYear() === currentYear && 
                   recordDate.getMonth() + 1 === currentMonth;
        });
        
        // 如果选择了月份，按选择的月份筛选
        if (monthStr) {
            const [year, month] = monthStr.split('-').map(Number);
            currentMonthRecords = data.attendance.filter(a => {
                const recordDate = new Date(a.date);
                return a.studentName === student.name && 
                       recordDate.getFullYear() === year && 
                       recordDate.getMonth() + 1 === month;
            });
        }
        
        let lastMonth = currentMonth - 1;
        let lastMonthYear = currentYear;
        if (lastMonth === 0) {
            lastMonth = 12;
            lastMonthYear = currentYear - 1;
        }
        
        const lastMonthRecords = data.attendance.filter(a => {
            const recordDate = new Date(a.date);
            return a.studentName === student.name && 
                   recordDate.getFullYear() === lastMonthYear && 
                   recordDate.getMonth() + 1 === lastMonth;
        });
        
        let lastLastMonth = lastMonth - 1;
        let lastLastMonthYear = lastMonthYear;
        if (lastLastMonth === 0) {
            lastLastMonth = 12;
            lastLastMonthYear = lastMonthYear - 1;
        }
        
        const lastLastMonthRecords = data.attendance.filter(a => {
            const recordDate = new Date(a.date);
            return a.studentName === student.name && 
                   recordDate.getFullYear() === lastLastMonthYear && 
                   recordDate.getMonth() + 1 === lastLastMonth;
        });
        
        const dateTags = currentMonthRecords.map((record, index) => {
            const color = colorPool[index % colorPool.length];
            const recordDate = new Date(record.date);
            const fullDate = recordDate.toLocaleDateString('zh-CN');
            const monthDay = String(recordDate.getMonth() + 1).padStart(2, '0') + '-' + 
                            String(recordDate.getDate()).padStart(2, '0');
            
            return `
                <span class="tag tooltip" 
                      style="background: ${color}" 
                      data-tooltip="${fullDate}"
                      onclick="removeAttendanceRecord(${record.id}, '${student.name}')">
                    ${monthDay}
                    <span class="tag-delete">×</span>
                </span>
            `;
        }).join('');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name}</td>
            <td>${student.className}</td>
            <td>${dateTags || '<span style="color: #999;">无考勤记录</span>'}</td>
            <td>${currentMonthRecords.length}</td>
            <td>${student.remainingCount}</td>
            <td>${lastMonthRecords.length}</td>
            <td>${lastLastMonthRecords.length}</td>
            <td>
                <button class="btn btn-primary" onclick="showAddAttendanceModal(${student.id})">考勤</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddAttendanceModal(studentId) {
    const student = data.students.find(s => s.id === studentId);
    if (!student) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>考勤登记 - ${student.name}</h3>
            </div>
            <div class="form-group">
                <label>选择日期</label>
                <input type="date" id="attendance-date">
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal').remove()">取消</button>
                <button class="btn btn-primary" onclick="addAttendance(${student.id})">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 默认设置为今天
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    document.getElementById('attendance-date').value = dateStr;
}

function addAttendance(studentId) {
    const student = data.students.find(s => s.id === studentId);
    if (!student) return;
    
    const dateStr = document.getElementById('attendance-date').value;
    if (!dateStr) {
        showNotification('请选择日期', 'error');
        return;
    }
    
    // 检查该学员该日期是否已有考勤记录
    const existingRecord = data.attendance.find(a => 
        a.studentName === student.name && a.date === dateStr
    );
    
    if (existingRecord) {
        showNotification('该日期已有考勤记录', 'error');
        return;
    }
    
    // 检查学员剩余课时
    if (student.remainingCount <= 0) {
        showNotification('学员课时已用完，无法考勤', 'error');
        return;
    }
    
    const attendance = {
        id: Date.now(),
        studentName: student.name,
        date: dateStr
    };
    
    data.attendance.push(attendance);
    
    // 更新学员课时
    student.usedCount++;
    student.remainingCount--;
    
    saveData();
    renderAttendance();
    renderStudents();
    
    document.querySelector('.modal').remove();
    showNotification('考勤登记成功');
}

async function removeAttendanceRecord(recordId, studentName) {
    const confirmed = await showConfirm('确定要删除这条考勤记录吗？课时将相应恢复。');
    if (!confirmed) return;
    
    const student = data.students.find(s => s.name === studentName);
    if (student && student.usedCount > 0) {
        student.usedCount--;
        student.remainingCount++;
    }
    
    data.attendance = data.attendance.filter(a => a.id !== recordId);
    
    saveData();
    renderAttendance();
    renderStudents();
    showNotification('考勤记录删除成功');
}

function generateMonthlyReport() {
    const monthStr = document.getElementById('attendance-filter-month').value;
    if (!monthStr) {
        showNotification('请选择月份', 'error');
        return;
    }
    
    const [year, month] = monthStr.split('-').map(Number);
    
    const records = data.attendance.filter(a => {
        const recordDate = new Date(a.date);
        return recordDate.getFullYear() === year && 
               recordDate.getMonth() + 1 === month;
    });
    
    const attendedStudents = new Set(records.map(r => r.studentName));
    
    const report = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 20px;">${year}年${month}月 考勤报告</h3>
            <p><strong>汇总月份：</strong>${year}年${month}月</p>
            <p><strong>全体学员总考勤次数：</strong>${records.length} 次</p>
            <p><strong>总学员数：</strong>${data.students.length} 人</p>
            <p><strong>有考勤记录学员数：</strong>${attendedStudents.size} 人</p>
            <h4 style="margin-top: 20px;">各学员考勤详情：</h4>
            <table style="margin-top: 10px;">
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>考勤次数</th>
                        <th>考勤日期</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.students.map(student => {
                        const studentRecords = records.filter(r => r.studentName === student.name);
                        return `
                            <tr>
                                <td>${student.name}</td>
                                <td>${studentRecords.length}</td>
                                <td>${studentRecords.map(r => r.date).join(', ') || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="min-width: 600px; max-width: 800px;">
            <div class="modal-header">
                <h3>月度考勤报告</h3>
            </div>
            ${report}
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal').remove()">关闭</button>
                <button class="btn btn-success" onclick="printReport()">打印报告</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function printReport() {
    window.print();
}

function updateStats() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const currentMonthRecords = data.attendance.filter(a => {
        const recordDate = new Date(a.date);
        return recordDate.getFullYear() === currentYear && 
               recordDate.getMonth() + 1 === currentMonth;
    });
    
    const attendedStudents = new Set(currentMonthRecords.map(r => r.studentName));
    
    document.getElementById('total-attendance-count').textContent = currentMonthRecords.length;
    document.getElementById('attended-student-count').textContent = attendedStudents.size;
    document.getElementById('total-student-count').textContent = data.students.length;
}

// ==================== 数据备份模块 ====================
function exportData() {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `学员管理系统备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('数据导出成功');
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // 验证数据格式
            if (!importedData.packages || !importedData.classes || 
                !importedData.recharges || !importedData.students || 
                !importedData.attendance) {
                throw new Error('数据格式不正确');
            }
            
            showConfirm('导入数据将覆盖当前所有数据，确定继续吗？').then(confirmed => {
                if (confirmed) {
                    data = importedData;
                    saveData();
                    renderAllTables();
                    showNotification('数据导入成功');
                }
            });
        } catch (err) {
            showNotification('导入失败：' + err.message, 'error');
        }
    };
    reader.readAsText(file);
}

// 自动保存功能（可选）
setInterval(() => {
    saveData();
}, 60000); // 每分钟自动保存
