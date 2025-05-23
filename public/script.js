document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const apiForm = document.getElementById('apiForm');
  const methodSelect = document.getElementById('method');
  const urlInput = document.getElementById('url');
  const paramsContainer = document.getElementById('paramsContainer');
  const headersContainer = document.getElementById('headersContainer');
  const requestBodyTextarea = document.getElementById('requestBody');
  const addParamBtn = document.getElementById('addParamBtn');
  const addHeaderBtn = document.getElementById('addHeaderBtn');
  const saveRequestBtn = document.getElementById('saveRequestBtn');
  const savedRequestsContainer = document.getElementById('savedRequestsContainer');
  const noSavedRequests = document.getElementById('noSavedRequests');
  const statusBadge = document.getElementById('statusBadge');
  const timeBadge = document.getElementById('timeBadge');
  const headersResponse = document.getElementById('headersResponse');
  const responseHeaders = document.getElementById('responseHeaders');
  const dataResponse = document.getElementById('dataResponse');

  // Load saved requests from localStorage
  loadSavedRequests();

  // Add initial param and header rows
  addParamRow();
  addHeaderRow();

  // Event listeners
  addParamBtn.addEventListener('click', addParamRow);
  addHeaderBtn.addEventListener('click', addHeaderRow);
  saveRequestBtn.addEventListener('click', saveCurrentRequest);
  apiForm.addEventListener('submit', handleFormSubmit);

  // Functions
  function addParamRow() {
    const row = document.createElement('div');
    row.className = 'param-row row g-2';
    row.innerHTML = `
      <div class="col-md-5">
        <input type="text" class="form-control param-key" placeholder="Parameter name">
      </div>
      <div class="col-md-5">
        <input type="text" class="form-control param-value" placeholder="Value">
      </div>
      <div class="col-md-2">
        <button type="button" class="btn btn-outline-danger btn-sm w-100 remove-row">Remove</button>
      </div>
    `;
    
    row.querySelector('.remove-row').addEventListener('click', function() {
      row.remove();
    });
    
    paramsContainer.appendChild(row);
  }

  function addHeaderRow() {
    const row = document.createElement('div');
    row.className = 'header-row row g-2';
    row.innerHTML = `
      <div class="col-md-5">
        <input type="text" class="form-control header-key" placeholder="Header name">
      </div>
      <div class="col-md-5">
        <input type="text" class="form-control header-value" placeholder="Value">
      </div>
      <div class="col-md-2">
        <button type="button" class="btn btn-outline-danger btn-sm w-100 remove-row">Remove</button>
      </div>
    `;
    
    row.querySelector('.remove-row').addEventListener('click', function() {
      row.remove();
    });
    
    headersContainer.appendChild(row);
  }

  function getFormData() {
    // Get params
    const params = [];
    document.querySelectorAll('.param-row').forEach(row => {
      const keyInput = row.querySelector('.param-key');
      const valueInput = row.querySelector('.param-value');
      
      if (keyInput.value.trim()) {
        params.push({
          key: keyInput.value.trim(),
          value: valueInput.value
        });
      }
    });
    
    // Get headers
    const headers = [];
    document.querySelectorAll('.header-row').forEach(row => {
      const keyInput = row.querySelector('.header-key');
      const valueInput = row.querySelector('.header-value');
      
      if (keyInput.value.trim()) {
        headers.push({
          key: keyInput.value.trim(),
          value: valueInput.value
        });
      }
    });
    
    // Get request body
    let data = null;
    if (requestBodyTextarea.value.trim()) {
      try {
        data = JSON.parse(requestBodyTextarea.value);
      } catch (e) {
        alert('Invalid JSON in request body');
        return null;
      }
    }
    
    return {
      method: methodSelect.value,
      url: urlInput.value,
      params,
      headers,
      data
    };
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = getFormData();
    if (!formData) return;
    
    if (!formData.url) {
      alert('Please enter a URL');
      return;
    }
    
    // Update UI
    statusBadge.textContent = 'Loading...';
    statusBadge.className = 'badge bg-secondary';
    timeBadge.textContent = '';
    dataResponse.textContent = 'Loading...';
    responseHeaders.classList.add('d-none');
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const responseTime = Date.now() - startTime;
      timeBadge.textContent = `${responseTime}ms`;
      
      const result = await response.json();
      
      if (result.error) {
        // Handle error response
        statusBadge.textContent = result.response ? `${result.response.status} ${result.response.statusText}` : 'Error';
        statusBadge.className = 'badge bg-danger';
        
        if (result.response && result.response.headers) {
          headersResponse.textContent = JSON.stringify(result.response.headers, null, 2);
          responseHeaders.classList.remove('d-none');
        } else {
          responseHeaders.classList.add('d-none');
        }
        
        dataResponse.textContent = result.response ? 
          JSON.stringify(result.response.data, null, 2) : 
          result.message || 'Unknown error';
      } else {
        // Handle successful response
        statusBadge.textContent = `${result.status} ${result.statusText}`;
        statusBadge.className = result.status >= 200 && result.status < 300 ? 'badge bg-success' : 'badge bg-warning';
        
        headersResponse.textContent = JSON.stringify(result.headers, null, 2);
        responseHeaders.classList.remove('d-none');
        
        dataResponse.textContent = JSON.stringify(result.data, null, 2);
      }
    } catch (error) {
      statusBadge.textContent = 'Error';
      statusBadge.className = 'badge bg-danger';
      dataResponse.textContent = error.message || 'Failed to send request';
      responseHeaders.classList.add('d-none');
    }
  }

  function saveCurrentRequest() {
    const formData = getFormData();
    if (!formData || !formData.url) {
      alert('Please enter a URL before saving');
      return;
    }
    
    const name = prompt('Enter a name for this request:');
    if (!name) return;
    
    const savedRequests = JSON.parse(localStorage.getItem('apiTesterRequests') || '[]');
    savedRequests.push({
      name,
      ...formData
    });
    
    localStorage.setItem('apiTesterRequests', JSON.stringify(savedRequests));
    loadSavedRequests();
  }

  function loadSavedRequests() {
    const savedRequests = JSON.parse(localStorage.getItem('apiTesterRequests') || '[]');
    
    if (savedRequests.length === 0) {
      noSavedRequests.style.display = 'block';
      return;
    }
    
    noSavedRequests.style.display = 'none';
    savedRequestsContainer.innerHTML = '';
    
    savedRequests.forEach((request, index) => {
      const requestEl = document.createElement('div');
      requestEl.className = 'saved-request';
      requestEl.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>${request.name}</strong>
            <div class="text-muted small">${request.method} ${request.url}</div>
          </div>
          <button class="btn btn-sm btn-outline-danger delete-request" data-index="${index}">×</button>
        </div>
      `;
      
      requestEl.addEventListener('click', function(e) {
        if (!e.target.classList.contains('delete-request')) {
          loadRequest(request);
        }
      });
      
      requestEl.querySelector('.delete-request').addEventListener('click', function(e) {
        e.stopPropagation();
        deleteRequest(index);
      });
      
      savedRequestsContainer.appendChild(requestEl);
    });
  }

  function loadRequest(request) {
    // Set method and URL
    methodSelect.value = request.method;
    urlInput.value = request.url;
    
    // Clear existing params and headers
    paramsContainer.innerHTML = '';
    headersContainer.innerHTML = '';
    
    // Add params
    if (request.params && request.params.length > 0) {
      request.params.forEach(param => {
        const row = document.createElement('div');
        row.className = 'param-row row g-2';
        row.innerHTML = `
          <div class="col-md-5">
            <input type="text" class="form-control param-key" placeholder="Parameter name" value="${param.key}">
          </div>
          <div class="col-md-5">
            <input type="text" class="form-control param-value" placeholder="Value" value="${param.value || ''}">
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-outline-danger btn-sm w-100 remove-row">Remove</button>
          </div>
        `;
        
        row.querySelector('.remove-row').addEventListener('click', function() {
          row.remove();
        });
        
        paramsContainer.appendChild(row);
      });
    } else {
      addParamRow();
    }
    
    // Add headers
    if (request.headers && request.headers.length > 0) {
      request.headers.forEach(header => {
        const row = document.createElement('div');
        row.className = 'header-row row g-2';
        row.innerHTML = `
          <div class="col-md-5">
            <input type="text" class="form-control header-key" placeholder="Header name" value="${header.key}">
          </div>
          <div class="col-md-5">
            <input type="text" class="form-control header-value" placeholder="Value" value="${header.value || ''}">
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-outline-danger btn-sm w-100 remove-row">Remove</button>
          </div>
        `;
        
        row.querySelector('.remove-row').addEventListener('click', function() {
          row.remove();
        });
        
        headersContainer.appendChild(row);
      });
    } else {
      addHeaderRow();
    }
    
    // Set request body
    requestBodyTextarea.value = request.data ? JSON.stringify(request.data, null, 2) : '';
  }

  function deleteRequest(index) {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    const savedRequests = JSON.parse(localStorage.getItem('apiTesterRequests') || '[]');
    savedRequests.splice(index, 1);
    localStorage.setItem('apiTesterRequests', JSON.stringify(savedRequests));
    
    loadSavedRequests();
  }
});
