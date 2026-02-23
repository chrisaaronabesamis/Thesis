import { api } from '../../../services/ecommerce_services/config.js';
import { authHeaders } from '../../../services/ecommerce_services/auth/auth.js';
import '../../../styles/ecommerce_styles/order_history.css';

export default function OrderHistory() {
  const root = document.getElementById("app");
  
  root.innerHTML = `
    <div class="order-history-container">
      <div class="container">
        <!-- Header with Stats -->
        <div class="order-history-header">
          <div class="header-title">
            <div>
              <h1>Order History</h1>
              <p class="order-count" id="orderCount">Loading your orders...</p>
            </div>
            <div class="view-toggle">
              <button class="view-btn active" onclick="toggleView('table')" data-view="table">
                <i class="fas fa-table"></i> Table
              </button>
            </div>
          </div>
          
          <!-- Order Stats -->
          <div class="order-stats" id="orderStats">
            <div class="stat-card">
              <span class="stat-value" id="totalOrders">0</span>
              <span class="stat-label">Total Orders</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" id="deliveredOrders">0</span>
              <span class="stat-label">Delivered</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" id="processingOrders">0</span>
              <span class="stat-label">Processing</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" id="totalSpent">₱0</span>
              <span class="stat-label">Total Spent</span>
            </div>
          </div>
        </div>

        <!-- Enhanced Filter Bar -->
        <div class="filter-bar">
          <div class="filter-section">
            <input type="text" class="search-input" id="searchInput" placeholder="Search orders..." onkeyup="handleSearch(event)">
            <select class="date-range-select" id="dateRangeSelect" onchange="handleDateRangeChange()">
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
              <option value="custom">Custom Range</option>
            </select>
            <div class="custom-date-range" id="customDateRange" style="display: none;">
              <input type="date" id="dateFrom" class="date-input">
              <span>to</span>
              <input type="date" id="dateTo" class="date-input">
            </div>
            <select id="statusFilter" class="status-select" onchange="applyFilters()">
              <option value="all">All Status</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <div class="filter-actions">
              <button class="btn btn-outline" onclick="clearFilters()">Clear</button>
              <button class="btn btn-primary" onclick="applyFilters()">Filter</button>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div class="table-view active" id="tableView">
          <div class="orders-table-container">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="orders-table-body">
                <tr>
                  <td colspan="6" class="loading-row">
                    <div class="loading">
                      <div class="spinner"></div>
                      <span>Loading your orders...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  let allOrders = [];
  let currentView = 'table';
  let filteredOrders = [];

  // Fetch order history
  async function fetchOrderHistory() {
    try {
      // Always call API to get all orders
      const response = await fetch(api('/orders/user'), {
        method: 'GET',
        headers: authHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      console.log('Orders fetched:', result);
      
      // Handle different response formats
      const orders = result.orders || result.data || result;
      allOrders = Array.isArray(orders) ? orders : [];
      filteredOrders = [...allOrders];
      
      updateStats();
      displayOrders();
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Show no orders when API fails
      allOrders = [];
      filteredOrders = [];
      updateStats();
      displayOrders();
    }
  }

  function updateStats() {
    const totalOrders = allOrders.length;
    const deliveredOrders = allOrders.filter(order => order.status === 'Delivered').length;
    const processingOrders = allOrders.filter(order => order.status === 'Processing').length;
    
    // Fix totalSpent calculation - ensure numbers are properly summed
    const totalSpent = allOrders.reduce((sum, order) => {
      const orderTotal = parseFloat(order.total || order.total_amount || 0);
      return sum + orderTotal;
    }, 0);

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('deliveredOrders').textContent = deliveredOrders;
    document.getElementById('processingOrders').textContent = processingOrders;
    document.getElementById('totalSpent').textContent = `₱${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('orderCount').textContent = `${totalOrders} order${totalOrders !== 1 ? 's' : ''} found`;
  }

  function displayOrders() {
    displayTableView();
  }

  function displayTableView() {
    const container = document.getElementById('orders-table-body');
    
    if (!filteredOrders || filteredOrders.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="no-orders-row">
            <div class="no-orders">
              <i class="fas fa-shopping-cart"></i>
              <p>You haven't placed any orders yet.</p>
              <a href="/shop" class="btn btn-primary">Start Shopping</a>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = filteredOrders.map(order => {
      const items = order.items || [];
      const displayItems = items.slice(0, 3);
      const remainingItems = items.length - 3;
      
      return `
        <tr class="order-row" onclick="toggleOrderDetails('${order.order_id || order.id}')">
          <td>
            <a href="#" class="order-link">#${order.order_id || order.id}</a>
          </td>
          <td>
            <div class="order-date">
              ${new Date(order.created_at).toLocaleDateString()}
              <small>${new Date(order.created_at).toLocaleTimeString()}</small>
            </div>
          </td>
          <td>
            <div class="item-preview">
              <div class="item-thumbnails">
                ${displayItems.map(item => `
                  <img src="${item.product_image || '/square.png'}" 
                       alt="${item.product_name || 'Product'}" 
                       class="thumbnail-img"
                       onerror="this.src='/square.png'">
                `).join('')}
                ${remainingItems > 0 ? `<div class="more-items">+${remainingItems}</div>` : ''}
              </div>
              <div class="item-count">${items.length} item${items.length !== 1 ? 's' : ''}</div>
            </div>
          </td>
          <td>
            <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
          </td>
          <td class="order-total">₱${(order.total || order.total_amount || 0).toLocaleString()}</td>
          <td>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline dropdown-toggle" onclick="event.stopPropagation(); toggleDropdown(event, '${order.order_id || order.id}')">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <div class="dropdown-menu" id="dropdown-${order.order_id || order.id}">
                <a href="#" onclick="event.stopPropagation(); viewOrderDetails('${order.order_id || order.id}')">
                  <i class="fas fa-eye"></i> View Details
                </a>
                <a href="#" onclick="event.stopPropagation(); reorderOrder('${order.order_id || order.id}')">
                  <i class="fas fa-redo"></i> Reorder
                </a>
                ${order.status === 'Order Placed' || order.status === 'pending' ? 
                  `<a href="#" onclick="event.stopPropagation(); cancelOrder('${order.order_id || order.id}')" style="color: #dc3545;">
                    <i class="fas fa-times"></i> Cancel Order
                  </a>` : ''}
                <a href="#" onclick="event.stopPropagation(); trackOrder('${order.order_id || order.id}')">
                  <i class="fas fa-truck"></i> Track Order
                </a>
                <a href="#" onclick="event.stopPropagation(); downloadInvoice('${order.order_id || order.id}')">
                  <i class="fas fa-download"></i> Download Invoice
                </a>
              </div>
            </div>
          </td>
        </tr>
        <tr class="order-details-row" id="details-${order.order_id || order.id}" style="display: none;">
          <td colspan="6">
            <div class="order-details-card">
              <div class="details-header">
                <h4>Order #${order.order_id || order.id} Details</h4>
                <button class="btn btn-sm btn-outline" onclick="toggleOrderDetails('${order.order_id || order.id}')">
                  <i class="fas fa-times"></i> Close
                </button>
              </div>
              <div class="details-content">
                <div class="items-list">
                  <h5>Items:</h5>
                  ${(order.items || []).map(item => `
                    <div class="detail-item">
                      <img src="${item.product_image || '/square.png'}" 
                           alt="${item.product_name || 'Product'}"
                           onerror="this.src='/square.png'">
                      <div class="item-info">
                        <strong>${item.product_name || 'Undefined Product'}</strong>
                        <p>Variant: ${item.variant_name || item.size || 'N/A'} | Qty: ${item.quantity}</p>
                        <p>Price: ₱${item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  `).join('')}
                </div>
                <div class="order-summary">
                  <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>₱${order.subtotal?.toLocaleString() || '0'}</span>
                  </div>
                  <div class="summary-row">
                    <span>Shipping:</span>
                    <span>₱${order.shipping_fee?.toLocaleString() || '0'}</span>
                  </div>
                  <div class="summary-row total">
                    <span>Total:</span>
                    <span>₱${(order.total || order.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function displayCardsView() {
    const container = document.getElementById('ordersGrid');
    
    if (!filteredOrders || filteredOrders.length === 0) {
      container.innerHTML = `
        <div class="no-orders-card">
          <i class="fas fa-shopping-cart"></i>
          <p>You haven't placed any orders yet.</p>
          <a href="/shop" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredOrders.map(order => {
      const items = order.items || [];
      const displayItems = items.slice(0, 2);
      const remainingItems = items.length - 2;
      const orderDate = new Date(order.created_at);
      
      return `
        <div class="order-card">
          <div class="order-card-header">
            <div class="order-card-title">
              <div>
                <div class="order-number">Order #${order.order_id || order.id}</div>
                <div class="order-date">${orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
            <div class="order-status">
              <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
            </div>
          </div>
          
          <div class="order-card-body">
            <div class="order-items-preview">
              ${displayItems.map(item => `
                <div class="order-item-preview">
                  <img src="${item.product_image || '/square.png'}" 
                       alt="${item.product_name || 'Product'}" 
                       class="order-item-image"
                       onerror="this.src='/square.png'">
                  <div class="order-item-details">
                    <div class="order-item-name">${item.product_name || 'Product'}</div>
                    <div class="order-item-meta">
                      Size: ${item.variant_name || item.size || 'N/A'} | Qty: ${item.quantity}
                    </div>
                    <div class="order-item-price">₱${item.price.toLocaleString()}</div>
                  </div>
                </div>
              `).join('')}
              ${remainingItems > 0 ? `
                <div class="more-items-text">+${remainingItems} more item${remainingItems > 1 ? 's' : ''}</div>
              ` : ''}
            </div>
          </div>
          
          <div class="order-card-footer">
            <div class="order-total">Total: ₱${(order.total || order.total_amount || 0).toLocaleString()}</div>
            <div class="order-actions">
              <button class="btn btn-primary" onclick="viewOrderDetails('${order.order_id || order.id}')">View Details</button>
              <button class="btn btn-outline" onclick="reorderOrder('${order.order_id || order.id}')">Reorder</button>
              <button class="btn btn-outline" onclick="trackOrder('${order.order_id || order.id}')">Track Order</button>
              ${order.status === 'Order Placed' || order.status === 'pending' ? 
                `<button class="btn btn-danger" onclick="cancelOrder('${order.order_id || order.id}')">Cancel Order</button>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Make functions available globally
  window.applyFilters = () => {
    console.log('Applying filters...');
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredOrders = allOrders.filter(order => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }
      
      // Date filter
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (new Date(order.created_at) < fromDate) {
          return false;
        }
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (new Date(order.created_at) > toDate) {
          return false;
        }
      }
      
      // Search filter
      if (searchTerm) {
        const orderId = (order.order_id || order.id || '').toString().toLowerCase();
        const hasMatchingItem = (order.items || []).some(item => {
          const itemName = (item.name || item.product_name || '').toString().toLowerCase();
          return itemName.includes(searchTerm);
        });
        
        if (!orderId.includes(searchTerm) && !hasMatchingItem) {
          return false;
        }
      }
      
      return true;
    });
    
    displayOrders();
  };

  window.clearFilters = () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('dateRangeSelect').value = 'all';
    document.getElementById('customDateRange').style.display = 'none';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    
    filteredOrders = [...allOrders];
    displayOrders();
  };

  window.handleSearch = (event) => {
    if (event.key === 'Enter' || event.type === 'keyup') {
      applyFilters();
    }
  };

  window.handleDateRangeChange = () => {
    const dateRangeSelect = document.getElementById('dateRangeSelect');
    const customDateRange = document.getElementById('customDateRange');
    
    if (dateRangeSelect.value === 'custom') {
      customDateRange.style.display = 'flex';
    } else {
      customDateRange.style.display = 'none';
      
      // Apply preset date ranges
      const days = parseInt(dateRangeSelect.value);
      if (days && !isNaN(days)) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        document.getElementById('dateFrom').value = startDate.toISOString().split('T')[0];
        document.getElementById('dateTo').value = endDate.toISOString().split('T')[0];
        
        applyFilters();
      } else if (dateRangeSelect.value === 'all') {
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        applyFilters();
      }
    }
  };

  window.toggleView = (view) => {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Toggle views
    document.getElementById('tableView').classList.toggle('active', view === 'table');
    document.getElementById('cardsView').classList.toggle('active', view === 'cards');
    
    displayOrders();
  };

  window.toggleDropdown = (event, orderId) => {
    event.stopPropagation();
    console.log('Toggling dropdown for order:', orderId);
    const dropdown = document.getElementById(`dropdown-${orderId}`);
    console.log('Dropdown element:', dropdown);
    
    if (!dropdown) {
      console.error('Dropdown not found for order:', orderId);
      return;
    }
    
    // Close all other dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      if (menu !== dropdown) {
        menu.parentElement.classList.remove('active');
        menu.style.display = 'none';
      }
    });
    
    // Toggle current dropdown
    const isActive = dropdown.parentElement.classList.toggle('active');
    console.log('Dropdown active state:', isActive);
    
    // Force display style based on active state
    if (isActive) {
      dropdown.style.display = 'block';
      console.log('Forcing dropdown to show with display:block');
    } else {
      dropdown.style.display = 'none';
      console.log('Hiding dropdown with display:none');
    }
  };

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      dropdown.classList.remove('active');
    });
  });

  window.toggleMobileOrderDetails = (orderId) => {
    const detailsRow = document.getElementById(`mobile-details-${orderId}`);
    if (detailsRow) {
      detailsRow.style.display = detailsRow.style.display === 'none' ? 'block' : 'none';
    }
  };

  window.toggleOrderDetails = (orderId) => {
    const detailsRow = document.getElementById(`details-${orderId}`);
    if (detailsRow) {
      detailsRow.style.display = detailsRow.style.display === 'none' ? 'table-row' : 'none';
    }
  };

  window.viewOrderDetails = (orderId) => {
    console.log('Viewing order details for:', orderId);
    // TODO: Implement order details view
  };

  window.reorderOrder = async (orderId) => {
    console.log('Reordering order:', orderId);
    try {
      // Get the specific order details
      const response = await fetch(api(`/orders/${orderId}`), {
        method: 'GET',
        headers: authHeaders()
      });

      if (response.ok) {
        const result = await response.json();
        const order = result.order || result;
        
        if (order.items && order.items.length > 0) {
          // Add items to cart
          for (const item of order.items) {
            try {
              const cartResponse = await fetch(api('/cart/add'), {
                method: 'POST',
                headers: {
                  ...authHeaders(),
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  variant_id: item.variant_id,
                  quantity: item.quantity
                })
              });
              
              if (cartResponse.ok) {
                console.log(`Added ${item.product_name} to cart`);
              }
            } catch (error) {
              console.error('Error adding item to cart:', error);
            }
          }
          
          alert(`All items from order #${orderId} have been added to your cart. Redirecting to cart...`);
          // Redirect to cart page
          window.location.href = '/cart';
        } else {
          alert('No items found in this order to reorder.');
        }
      } else {
        const error = await response.json();
        alert(`Failed to get order details: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Reorder error:', error);
      alert('Failed to reorder. Please try again.');
    }
  };

  window.trackOrder = (orderId) => {
    console.log('Tracking order:', orderId);
    // TODO: Implement order tracking
  };

  window.cancelOrder = async (orderId) => {
    console.log('Cancelling order:', orderId);
    if (confirm(`Are you sure you want to cancel order #${orderId}?`)) {
      try {
        const response = await fetch(api(`/orders/${orderId}/cancel`), {
          method: 'PUT',
          headers: authHeaders()
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Order cancelled:', result);
          // Refresh the order list to show updated status
          await fetchOrderHistory();
          // Show success message
          alert(`Order #${orderId} has been cancelled successfully.`);
        } else {
          const error = await response.json();
          console.error('Cancel order error:', error);
          alert(`Failed to cancel order: ${error.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Cancel order error:', error);
        alert('Failed to cancel order. Please try again.');
      }
    }
  };

  window.downloadInvoice = (orderId) => {
    console.log('Downloading invoice for order:', orderId);
    // TODO: Implement invoice download
  };

  // Initialize the page
  fetchOrderHistory();
  
  // Temporary test: Show first dropdown after 2 seconds
  setTimeout(() => {
    const firstDropdown = document.querySelector('.dropdown-menu');
    if (firstDropdown) {
      console.log('Found dropdown menu, showing temporarily for testing');
      firstDropdown.style.display = 'block';
      setTimeout(() => {
        firstDropdown.style.display = 'none';
      }, 3000);
    } else {
      console.log('No dropdown menus found');
    }
  }, 2000);
}
