(function () {
  'use strict';

  function getReports() {
    try {
      const raw = localStorage.getItem('reports');
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Failed to parse reports from localStorage', err);
      return [];
    }
  }

  function saveReports(reports) {
    try {
      localStorage.setItem('reports', JSON.stringify(reports));
    } catch (err) {
      console.error('Failed to save reports', err);
    }
  }

  function generateReportId() {
    // generate a random 4-digit number and prefix with RPT
    const n = Math.floor(Math.random() * 9000) + 1000; // minimal + usage (numeric)
    const candidate = `RPT${n}`;
    // ensure uniqueness (rare collision)
    const existing = getReports();
    if (existing.some(r => r.reportId === candidate)) {
      return generateReportId();
    }
    return candidate;
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
      reportForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const nameEl = document.getElementById('name');
        const addressEl = document.getElementById('address');
        const issueEl = document.getElementById('issue');

        const name = nameEl ? nameEl.value.trim() : '';
        const address = addressEl ? addressEl.value.trim() : '';
        const issue = issueEl ? issueEl.value.trim() : '';

        if (!name || !address || !issue) {
          alert('Please fill all fields before submitting.');
          return;
        }

        const reportId = generateReportId();
        const newReport = {
          reportId,
          name,
          address,
          issue,
          date: new Date().toISOString(),
          status: 'Pending'
        };

        const reports = getReports();
        reports.push(newReport);
        saveReports(reports);

      
        localStorage.setItem('lastReportId', reportId);
        window.location.href = 'confirmation.html';
      });
    }
    const statusForm = document.getElementById('statusForm');
    if (statusForm) {
      statusForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const input = document.getElementById('reportId');
        const resultEl = document.getElementById('statusResult');
        if (!input || !resultEl) return;

        const query = input.value.trim();
        if (!query) {
          resultEl.innerHTML = '<p>Please enter a Report ID.</p>';
          return;
        }

        const reports = getReports();
        const found = reports.find(r => r.reportId.toLowerCase() === query.toLowerCase());

        if (!found) {
          resultEl.innerHTML = `<p>No report found for <strong>${query}</strong>.</p>`;
          return;
        }

        resultEl.innerHTML = `
          <div class="status-card">
            <p><strong>ID:</strong> ${found.reportId}</p>
            <p><strong>Name:</strong> ${found.name}</p>
            <p><strong>Date:</strong> ${formatDate(found.date)}</p>
            <p><strong>Address:</strong> ${found.address}</p>
            <p><strong>Issue:</strong> ${found.issue}</p>
            <p><strong>Status:</strong> <em>${found.status}</em></p>
          </div>
        `;
      });
    }

    
    const confirmationEl = document.getElementById('confirmationMsg');
    if (confirmationEl) {
      const lastId = localStorage.getItem('lastReportId');
      if (!lastId) {
        confirmationEl.textContent = 'No recent report found.';
      } else {
        const reports = getReports();
        const report = reports.find(r => r.reportId === lastId);
        if (!report) {
          confirmationEl.textContent = 'No recent report found.';
        } else {
          confirmationEl.innerHTML = `
            <p><strong>Report ID:</strong> ${report.reportId}</p>
            <p><strong>Name:</strong> ${report.name}</p>
            <p><strong>Address:</strong> ${report.address}</p>
            <p><strong>Issue:</strong> ${report.issue}</p>
            <p><strong>Date:</strong> ${formatDate(report.date)}</p>
            <p><strong>Status:</strong> ${report.status}</p>
          `;
        }
      }
    }

  
    const historyList = document.getElementById('historyList');
    if (historyList) {
      const reports = getReports();
      historyList.innerHTML = ''; 

      if (reports.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No reports yet.';
        historyList.appendChild(li);
      } else {
      
        const reversed = reports.slice().reverse();
        reversed.forEach(r => {
          const li = document.createElement('li');
          li.className = 'history-item';
          li.innerHTML = `
            <div class="hist-top">
              <strong>${r.reportId}</strong>
              <span class="hist-date">${formatDate(r.date)}</span>
            </div>
            <div class="hist-body">
              <div><strong>${r.name}</strong> • ${r.address}</div>
              <div>Issue: ${r.issue}</div>
              <div>Status: <em>${r.status}</em></div>
            </div>
            <div class="hist-actions">
              <button class="delete-report" data-id="${r.reportId}">Delete</button>
            </div>
          `;
          historyList.appendChild(li);
        });
        const controls = document.createElement('div');
        controls.style.textAlign = 'center';
        controls.style.marginTop = '12px';
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clearReportsBtn';
        clearBtn.textContent = 'Clear All Reports';
        clearBtn.addEventListener('click', function () {
          const confirmClear = confirm('Are you sure you want to delete all saved reports?');
          if (confirmClear) {
            localStorage.removeItem('reports');
            localStorage.removeItem('lastReportId')
            location.reload();
          }
        });
        controls.appendChild(clearBtn);
        historyList.parentNode.appendChild(controls);
        historyList.addEventListener('click', function (ev) {
          const btn = ev.target.closest('.delete-report');
          if (!btn) return;
          const id = btn.getAttribute('data-id');
          if (!id) return;
          const confirmed = confirm(`Delete report ${id}?`);
          if (!confirmed) return;
          let current = getReports();
          current = current.filter(item => item.reportId !== id);
          saveReports(current);
          const lastIdStored = localStorage.getItem('lastReportId');
          if (lastIdStored === id) {
            localStorage.removeItem('lastReportId');
          }
          const li = btn.closest('li');
          if (li) li.remove();
        });
      }
    }

  }); 


  function startTracking() {
    const info = document.getElementById('trackInfo');
    if (!info) return;

    const steps = [
      'Truck left depot 🏭',
      'Truck on main road 🚛',
      'Truck approaching your ward 🏘️',
      'Truck 1 street away 🚏',
      'Truck has reached your street ✅'
    ];

    let index = 0;
    info.textContent = 'Starting tracking...';
    const tracker = setInterval(function () {
      if (index < steps.length) {
        info.textContent = steps[index];
        index += 1;
      } else {
        clearInterval(tracker);
        info.textContent = 'Tracking finished. If pickup not done, please submit a new report.';
      }
    }, 1600);
  }

  window.startTracking = startTracking;

})(); 
