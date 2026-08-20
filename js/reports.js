// ============================================
// REPORTS SYSTEM - Premium
// ============================================

class ReportsSystem {
    constructor() {
        this.reports = [];
        this.filters = {
            dateRange: 'week',
            type: 'all',
            status: 'all'
        };
        
        this.initReports();
        this.loadSavedFilters();
    }

    // ============================================
    // INIT REPORTS
    // ============================================
    initReports() {
        this.generateMockReports();
    }

    // ============================================
    // GENERATE MOCK REPORTS
    // ============================================
    generateMockReports() {
        const now = new Date();
        
        this.reports = [
            {
                id: '1',
                title: 'گزارش عملکرد ماهانه',
                type: 'performance',
                date: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString(),
                status: 'completed',
                data: {
                    totalStudents: 250,
                    activeStudents: 220,
                    services: 8,
                    drivers: 5,
                    onTimeRate: 94,
                    satisfaction: 4.7
                }
            },
            {
                id: '2',
                title: 'گزارش مسیرها',
                type: 'routes',
                date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
                status: 'completed',
                data: {
                    routes: [
                        { name: 'مسیر شمال', students: 12, distance: '۱۲ کیلومتر', duration: '۴۵ دقیقه' },
                        { name: 'مسیر جنوب', students: 10, distance: '۱۵ کیلومتر', duration: '۵۰ دقیقه' },
                        { name: 'مسیر شرق', students: 8, distance: '۱۰ کیلومتر', duration: '۳۵ دقیقه' }
                    ]
                }
            },
            {
                id: '3',
                title: 'گزارش دانش‌آموزان',
                type: 'students',
                date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString(),
                status: 'pending',
                data: {
                    total: 250,
                    byClass: {
                        'اول': 45,
                        'دوم': 50,
                        'سوم': 55,
                        'چهارم': 48,
                        'پنجم': 52
                    }
                }
            },
            {
                id: '4',
                title: 'گزارش هزینه‌ها',
                type: 'financial',
                date: new Date(now.getFullYear(), now.getMonth() - 2, 20).toISOString(),
                status: 'completed',
                data: {
                    total: 125000000,
                    breakdown: {
                        'حقوق رانندگان': 45000000,
                        'سوخت': 30000000,
                        'تعمیرات': 20000000,
                        'سایر': 30000000
                    }
                }
            }
        ];
    }

    // ============================================
    // LOAD SAVED FILTERS
    // ============================================
    loadSavedFilters() {
        const saved = localStorage.getItem('report_filters');
        if (saved) {
            try {
                this.filters = JSON.parse(saved);
            } catch (e) {
                // Use defaults
            }
        }
    }

    // ============================================
    // SAVE FILTERS
    // ============================================
    saveFilters() {
        localStorage.setItem('report_filters', JSON.stringify(this.filters));
    }

    // ============================================
    // GET REPORTS
    // ============================================
    getReports(filters = null) {
        let result = [...this.reports];
        
        const f = filters || this.filters;
        
        // Filter by type
        if (f.type && f.type !== 'all') {
            result = result.filter(r => r.type === f.type);
        }
        
        // Filter by status
        if (f.status && f.status !== 'all') {
            result = result.filter(r => r.status === f.status);
        }
        
        // Filter by date range
        if (f.dateRange) {
            const now = new Date();
            let cutoff = new Date();
            
            switch (f.dateRange) {
                case 'today':
                    cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    cutoff = new Date(now);
                    cutoff.setDate(cutoff.getDate() - 7);
                    break;
                case 'month':
                    cutoff = new Date(now);
                    cutoff.setMonth(cutoff.getMonth() - 1);
                    break;
                case 'year':
                    cutoff = new Date(now);
                    cutoff.setFullYear(cutoff.getFullYear() - 1);
                    break;
                default:
                    cutoff = null;
            }
            
            if (cutoff) {
                result = result.filter(r => new Date(r.date) >= cutoff);
            }
        }
        
        return result;
    }

    // ============================================
    // CREATE REPORT
    // ============================================
    createReport(title, type, data) {
        const report = {
            id: Date.now().toString(),
            title: title,
            type: type,
            date: new Date().toISOString(),
            status: 'pending',
            data: data
        };
        
        this.reports.unshift(report);
        this.saveReport(report);
        return report;
    }

    // ============================================
    // SAVE REPORT
    // ============================================
    saveReport(report) {
        // In real app, this would save to backend
        console.log('💾 Report saved:', report);
    }

    // ============================================
    // DELETE REPORT
    // ============================================
    deleteReport(id) {
        const index = this.reports.findIndex(r => r.id === id);
        if (index !== -1) {
            this.reports.splice(index, 1);
            return true;
        }
        return false;
    }

    // ============================================
    // GENERATE REPORT
    // ============================================
    generateReport(type, params = {}) {
        // Simulate report generation
        return new Promise((resolve) => {
            setTimeout(() => {
                const report = {
                    id: Date.now().toString(),
                    title: params.title || `گزارش ${type}`,
                    type: type,
                    date: new Date().toISOString(),
                    status: 'completed',
                    data: this.generateReportData(type, params)
                };
                this.reports.unshift(report);
                resolve(report);
            }, 2000 + Math.random() * 3000);
        });
    }

    // ============================================
    // GENERATE REPORT DATA
    // ============================================
    generateReportData(type, params) {
        const data = {
            performance: {
                totalStudents: 250 + Math.floor(Math.random() * 50),
                activeStudents: 200 + Math.floor(Math.random() * 50),
                services: 8 + Math.floor(Math.random() * 4),
                drivers: 5 + Math.floor(Math.random() * 3),
                onTimeRate: 85 + Math.floor(Math.random() * 15),
                satisfaction: 4 + Math.random() * 1
            },
            routes: {
                routes: [
                    { name: 'مسیر شمال', students: 12 + Math.floor(Math.random() * 6), distance: '۱۲ کیلومتر', duration: '۴۵ دقیقه' },
                    { name: 'مسیر جنوب', students: 10 + Math.floor(Math.random() * 6), distance: '۱۵ کیلومتر', duration: '۵۰ دقیقه' },
                    { name: 'مسیر شرق', students: 8 + Math.floor(Math.random() * 4), distance: '۱۰ کیلومتر', duration: '۳۵ دقیقه' }
                ]
            },
            students: {
                total: 250 + Math.floor(Math.random() * 50),
                byClass: {
                    'اول': 40 + Math.floor(Math.random() * 20),
                    'دوم': 45 + Math.floor(Math.random() * 20),
                    'سوم': 50 + Math.floor(Math.random() * 20),
                    'چهارم': 45 + Math.floor(Math.random() * 20),
                    'پنجم': 50 + Math.floor(Math.random() * 20)
                }
            },
            financial: {
                total: 100000000 + Math.floor(Math.random() * 50000000),
                breakdown: {
                    'حقوق رانندگان': 40000000 + Math.floor(Math.random() * 20000000),
                    'سوخت': 25000000 + Math.floor(Math.random() * 10000000),
                    'تعمیرات': 15000000 + Math.floor(Math.random() * 10000000),
                    'سایر': 20000000 + Math.floor(Math.random() * 20000000)
                }
            }
        };
        
        return data[type] || data.performance;
    }

    // ============================================
    // EXPORT REPORT
    // ============================================
    async exportReport(id, format = 'pdf') {
        const report = this.reports.find(r => r.id === id);
        if (!report) {
            throw new Error('Report not found');
        }
        
        // Simulate export
        return new Promise((resolve) => {
            setTimeout(() => {
                const fileName = `report_${report.id}.${format}`;
                const content = this.formatReportContent(report, format);
                
                // In real app, this would generate a file
                console.log(`📄 Exporting: ${fileName}`);
                console.log('📝 Content:', content);
                
                // Trigger download
                this.downloadReport(content, fileName);
                
                resolve({ success: true, fileName: fileName });
            }, 1500);
        });
    }

    // ============================================
    // FORMAT REPORT CONTENT
    // ============================================
    formatReportContent(report, format) {
        let content = '';
        
        if (format === 'pdf' || format === 'html') {
            content = `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${report.title}</title>
                    <style>
                        body { font-family: 'Vazirmatn', sans-serif; padding: 40px; }
                        h1 { color: #4F46E5; }
                        .report-info { margin: 20px 0; }
                        .data-item { margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee; }
                        .label { font-weight: 600; color: #6B7280; }
                    </style>
                </head>
                <body>
                    <h1>${report.title}</h1>
                    <div class="report-info">
                        <p><strong>تاریخ:</strong> ${new Date(report.date).toLocaleDateString('fa-IR')}</p>
                        <p><strong>نوع:</strong> ${report.type}</p>
                        <p><strong>وضعیت:</strong> ${report.status}</p>
                    </div>
                    <div class="report-data">
                        ${this.formatReportData(report.data)}
                    </div>
                </body>
                </html>
            `;
        } else if (format === 'json') {
            content = JSON.stringify(report, null, 2);
        } else if (format === 'csv') {
            content = this.formatCSV(report.data);
        }
        
        return content;
    }

    // ============================================
    // FORMAT REPORT DATA
    // ============================================
    formatReportData(data) {
        let html = '';
        
        if (data.totalStudents !== undefined) {
            html += `
                <div class="data-item">
                    <span class="label">تعداد کل دانش‌آموزان:</span> ${data.totalStudents}
                </div>
                <div class="data-item">
                    <span class="label">دانش‌آموزان فعال:</span> ${data.activeStudents}
                </div>
                <div class="data-item">
                    <span class="label">سرویس‌ها:</span> ${data.services}
                </div>
                <div class="data-item">
                    <span class="label">رانندگان:</span> ${data.drivers}
                </div>
                <div class="data-item">
                    <span class="label">نرخ准时:</span> ${data.onTimeRate}%
                </div>
                <div class="data-item">
                    <span class="label">رضایت:</span> ${data.satisfaction}/5
                </div>
            `;
        }
        
        if (data.routes) {
            html += '<h3>مسیرها</h3>';
            data.routes.forEach(route => {
                html += `
                    <div class="data-item">
                        <strong>${route.name}</strong>
                        <br>
                        دانش‌آموزان: ${route.students}
                        <br>
                        مسافت: ${route.distance}
                        <br>
                        زمان: ${route.duration}
                    </div>
                `;
            });
        }
        
        if (data.byClass) {
            html += '<h3>توزیع دانش‌آموزان بر اساس کلاس</h3>';
            for (const [cls, count] of Object.entries(data.byClass)) {
                html += `
                    <div class="data-item">
                        <span class="label">کلاس ${cls}:</span> ${count} دانش‌آموز
                    </div>
                `;
            }
        }
        
        if (data.breakdown) {
            html += '<h3>جزئیات هزینه‌ها</h3>';
            for (const [item, amount] of Object.entries(data.breakdown)) {
                html += `
                    <div class="data-item">
                        <span class="label">${item}:</span> ${amount.toLocaleString('fa-IR')} تومان
                    </div>
                `;
            }
            html += `
                <div class="data-item" style="font-weight: 700; border-top: 2px solid #4F46E5; margin-top: 10px; padding-top: 10px;">
                    <span class="label">مجموع:</span> ${data.total.toLocaleString('fa-IR')} تومان
                </div>
            `;
        }
        
        return html;
    }

    // ============================================
    // FORMAT CSV
    // ============================================
    formatCSV(data) {
        let csv = '';
        
        if (data.totalStudents !== undefined) {
            csv += 'معیار,مقدار\n';
            csv += `تعداد کل دانش‌آموزان,${data.totalStudents}\n`;
            csv += `دانش‌آموزان فعال,${data.activeStudents}\n`;
            csv += `سرویس‌ها,${data.services}\n`;
            csv += `رانندگان,${data.drivers}\n`;
            csv += `نرخ准时,${data.onTimeRate}%\n`;
            csv += `رضایت,${data.satisfaction}\n`;
        }
        
        if (data.routes) {
            csv += '\nمسیر,دانش‌آموزان,مسافت,زمان\n';
            data.routes.forEach(route => {
                csv += `${route.name},${route.students},${route.distance},${route.duration}\n`;
            });
        }
        
        return csv;
    }

    // ============================================
    // DOWNLOAD REPORT
    // ============================================
    downloadReport(content, fileName) {
        let blob;
        let mimeType;
        
        if (fileName.endsWith('.html')) {
            mimeType = 'text/html';
            blob = new Blob([content], { type: mimeType });
        } else if (fileName.endsWith('.json')) {
            mimeType = 'application/json';
            blob = new Blob([content], { type: mimeType });
        } else if (fileName.endsWith('.csv')) {
            mimeType = 'text/csv';
            blob = new Blob([content], { type: mimeType });
        } else {
            // Default to text
            blob = new Blob([content], { type: 'text/plain' });
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ============================================
    // UPDATE FILTERS
    // ============================================
    updateFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.saveFilters();
        return this.filters;
    }

    // ============================================
    // GET STATS
    // ============================================
    getStats() {
        const reports = this.reports;
        return {
            total: reports.length,
            completed: reports.filter(r => r.status === 'completed').length,
            pending: reports.filter(r => r.status === 'pending').length,
            byType: {
                performance: reports.filter(r => r.type === 'performance').length,
                routes: reports.filter(r => r.type === 'routes').length,
                students: reports.filter(r => r.type === 'students').length,
                financial: reports.filter(r => r.type === 'financial').length
            }
        };
    }
}

// ============================================
// REPORTS UI COMPONENT
// ============================================
class ReportsUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.reportsSystem = new ReportsSystem();
        this.currentReport = null;
        
        this.initUI();
        this.initEvents();
    }

    initUI() {
        if (!this.container) return;
        
        this.renderReports();
        this.renderFilters();
        this.renderStats();
    }

    initEvents() {
        // Filter change
        this.container.querySelectorAll('.report-filter').forEach(el => {
            el.addEventListener('change', () => {
                this.applyFilters();
            });
        });
        
        // Generate report button
        const generateBtn = this.container.querySelector('#generateReportBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.openGenerateModal();
            });
        }
    }

    renderReports() {
        const list = this.container.querySelector('#reportsList');
        if (!list) return;
        
        const reports = this.reportsSystem.getReports();
        
        if (reports.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="padding: 60px 20px; text-align: center;">
                    <i class="fas fa-file-alt" style="font-size: 64px; color: var(--text-light);"></i>
                    <h3 style="margin-top: 16px;">هیچ گزارشی وجود ندارد</h3>
                    <p style="color: var(--text-secondary);">برای ایجاد گزارش جدید کلیک کنید</p>
                    <button class="btn btn-primary" onclick="window.reportsUI.openGenerateModal()">
                        <i class="fas fa-plus"></i>
                        ایجاد گزارش جدید
                    </button>
                </div>
            `;
            return;
        }
        
        list.innerHTML = '';
        
        reports.forEach(report => {
            const div = document.createElement('div');
            div.className = 'report-item glass-premium';
            
            const statusMap = {
                'completed': { class: 'success', text: 'تکمیل شده' },
                'pending': { class: 'warning', text: 'در حال پردازش' },
                'failed': { class: 'danger', text: 'خطا' }
            };
            
            const status = statusMap[report.status] || statusMap.completed;
            
            const typeNames = {
                'performance': 'عملکرد',
                'routes': 'مسیرها',
                'students': 'دانش‌آموزان',
                'financial': 'مالی'
            };
            
            div.innerHTML = `
                <div class="report-item-header">
                    <div class="report-item-info">
                        <i class="fas fa-file-${report.type === 'financial' ? 'invoice' : 'alt'}" style="color: var(--primary);"></i>
                        <div>
                            <h4>${report.title}</h4>
                            <p>${typeNames[report.type] || report.type}</p>
                        </div>
                    </div>
                    <div class="report-item-status">
                        <span class="status-badge ${status.class}">
                            <i class="fas fa-${report.status === 'completed' ? 'check-circle' : 'spinner fa-spin'}"></i>
                            ${status.text}
                        </span>
                    </div>
                </div>
                <div class="report-item-body">
                    <div class="report-meta">
                        <span><i class="far fa-calendar"></i> ${new Date(report.date).toLocaleDateString('fa-IR')}</span>
                        <span><i class="far fa-file"></i> ${report.type}</span>
                    </div>
                </div>
                <div class="report-item-actions">
                    <button class="btn btn-sm btn-outline" onclick="window.reportsUI.viewReport('${report.id}')">
                        <i class="fas fa-eye"></i> مشاهده
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="window.reportsUI.exportReport('${report.id}', 'pdf')">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="window.reportsUI.exportReport('${report.id}', 'csv')">
                        <i class="fas fa-file-csv"></i> CSV
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.reportsUI.deleteReport('${report.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            list.appendChild(div);
        });
    }

    renderFilters() {
        // This would render filter options
        // For simplicity, we'll use the existing HTML
    }

    renderStats() {
        const stats = this.reportsSystem.getStats();
        const container = this.container.querySelector('#reportStats');
        if (!container) return;
        
        container.innerHTML = `
            <div class="stats-grid-mini">
                <div class="stat-mini">
                    <span class="stat-mini-number">${stats.total}</span>
                    <span class="stat-mini-label">کل گزارش‌ها</span>
                </div>
                <div class="stat-mini">
                    <span class="stat-mini-number">${stats.completed}</span>
                    <span class="stat-mini-label">تکمیل شده</span>
                </div>
                <div class="stat-mini">
                    <span class="stat-mini-number">${stats.pending}</span>
                    <span class="stat-mini-label">در انتظار</span>
                </div>
            </div>
        `;
    }

    applyFilters() {
        const type = document.getElementById('filterType')?.value || 'all';
        const status = document.getElementById('filterStatus')?.value || 'all';
        const dateRange = document.getElementById('filterDate')?.value || 'all';
        
        this.reportsSystem.updateFilters({ type, status, dateRange });
        this.renderReports();
    }

    viewReport(id) {
        const report = this.reportsSystem.reports.find(r => r.id === id);
        if (!report) {
            showToast('گزارش یافت نشد', 'error');
            return;
        }
        
        this.currentReport = report;
        this.openViewModal(report);
    }

    openViewModal(report) {
        // Create modal for viewing report
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'reportViewModal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeModal('reportViewModal')"></div>
            <div class="modal-content glass-premium" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>${report.title}</h3>
                    <button class="modal-close" onclick="closeModal('reportViewModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="report-details">
                        <p><strong>تاریخ:</strong> ${new Date(report.date).toLocaleDateString('fa-IR')}</p>
                        <p><strong>نوع:</strong> ${report.type}</p>
                        <p><strong>وضعیت:</strong> ${report.status}</p>
                    </div>
                    <div class="report-data-display">
                        ${this.reportsSystem.formatReportData(report.data)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.reportsUI.exportReport('${report.id}', 'pdf')">
                        <i class="fas fa-file-pdf"></i> دانلود PDF
                    </button>
                    <button class="btn btn-outline" onclick="closeModal('reportViewModal')">
                        بستن
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        openModal('reportViewModal');
    }

    openGenerateModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'generateReportModal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeModal('generateReportModal')"></div>
            <div class="modal-content glass-premium" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>ایجاد گزارش جدید</h3>
                    <button class="modal-close" onclick="closeModal('generateReportModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="generateReportForm">
                        <div class="form-group">
                            <label>عنوان گزارش</label>
                            <input type="text" id="reportTitle" placeholder="عنوان گزارش را وارد کنید">
                        </div>
                        <div class="form-group">
                            <label>نوع گزارش</label>
                            <select id="reportType">
                                <option value="performance">عملکرد</option>
                                <option value="routes">مسیرها</option>
                                <option value="students">دانش‌آموزان</option>
                                <option value="financial">مالی</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>دوره زمانی</label>
                            <select id="reportPeriod">
                                <option value="today">امروز</option>
                                <option value="week">هفته جاری</option>
                                <option value="month">ماه جاری</option>
                                <option value="year">سال جاری</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.reportsUI.generateReport()">
                        <i class="fas fa-plus"></i> ایجاد گزارش
                    </button>
                    <button class="btn btn-outline" onclick="closeModal('generateReportModal')">
                        انصراف
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        openModal('generateReportModal');
    }

    async generateReport() {
        const title = document.getElementById('reportTitle')?.value || 'گزارش جدید';
        const type = document.getElementById('reportType')?.value || 'performance';
        
        showLoading('در حال ایجاد گزارش...');
        
        try {
            const report = await this.reportsSystem.generateReport(type, { title });
            closeModal('generateReportModal');
            this.renderReports();
            this.renderStats();
            showToast('گزارش با موفقیت ایجاد شد ✅', 'success');
        } catch (error) {
            showToast('خطا در ایجاد گزارش', 'error');
        }
        
        hideLoading();
    }

    async exportReport(id, format) {
        showLoading('در حال خروجی گرفتن...');
        
        try {
            await this.reportsSystem.exportReport(id, format);
            showToast(`گزارش با فرمت ${format.toUpperCase()} دانلود شد ✅`, 'success');
        } catch (error) {
            showToast('خطا در خروجی گرفتن', 'error');
        }
        
        hideLoading();
    }

    deleteReport(id) {
        if (confirm('آیا از حذف این گزارش اطمینان دارید؟')) {
            this.reportsSystem.deleteReport(id);
            this.renderReports();
            this.renderStats();
            showToast('گزارش با موفقیت حذف شد', 'success');
        }
    }
}

// ============================================
// INITIALIZE REPORTS
// ============================================
let reportsUI = null;

document.addEventListener('DOMContentLoaded', function() {
    const reportsContainer = document.getElementById('reportsContainer');
    if (reportsContainer) {
        reportsUI = new ReportsUI('reportsContainer');
        window.reportsUI = reportsUI;
    }
});

// ============================================
// REPORTS STYLES
// ============================================
const reportsStyles = document.createElement('style');
reportsStyles.textContent = `
    .report-item {
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 12px;
        transition: all 0.3s ease;
    }
    
    .report-item:hover {
        transform: translateX(-4px);
        box-shadow: var(--shadow-lg);
    }
    
    .report-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    
    .report-item-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .report-item-info i {
        font-size: 24px;
        color: var(--primary);
    }
    
    .report-item-info h4 {
        font-size: 16px;
        margin: 0;
    }
    
    .report-item-info p {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 0;
    }
    
    .report-item-body {
        margin-bottom: 12px;
    }
    
    .report-meta {
        display: flex;
        gap: 16px;
        font-size: 13px;
        color: var(--text-secondary);
    }
    
    .report-meta i {
        margin-left: 4px;
    }
    
    .report-item-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        padding-top: 12px;
        border-top: 1px solid var(--border-color);
    }
    
    .stats-grid-mini {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 20px;
    }
    
    .stat-mini {
        text-align: center;
        padding: 16px;
        background: var(--glass-bg);
        border-radius: 12px;
        border: 1px solid var(--border-color);
    }
    
    .stat-mini-number {
        display: block;
        font-size: 28px;
        font-weight: 700;
        color: var(--primary);
    }
    
    .stat-mini-label {
        font-size: 13px;
        color: var(--text-secondary);
    }
    
    .report-data-display {
        max-height: 400px;
        overflow-y: auto;
        padding: 12px;
        background: var(--bg-primary);
        border-radius: 8px;
    }
    
    .report-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 12px;
        background: var(--bg-primary);
        border-radius: 8px;
        margin-bottom: 16px;
    }
    
    .report-details p {
        margin: 4px 0;
    }
`;
document.head.appendChild(reportsStyles);