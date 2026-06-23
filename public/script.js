// Initialize navigation state and dashboard on DOM load
document.addEventListener("DOMContentLoaded", () => {
    checkAuthStatus();
});

// Switch view panels depending on active auth session
function checkAuthStatus() {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    
    const anonymousNav = document.getElementById("anonymousNav");
    const authNav = document.getElementById("authNav");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const userEmailDisplay = document.getElementById("userEmailDisplay");
    
    const landingView = document.getElementById("landingView");
    const dashboardView = document.getElementById("dashboardView");
    
    // Find landing sections that should hide when logged in
    const heroSection = document.querySelector(".hero");
    const featuresSection = document.getElementById("featuresSection");

    if (token && email) {
        // Logged-in view state
        if (anonymousNav) anonymousNav.classList.add("hidden");
        if (authNav) authNav.classList.remove("hidden");
        
        if (usernameDisplay) {
            usernameDisplay.textContent = email.split("@")[0];
        }
        if (userEmailDisplay) {
            userEmailDisplay.textContent = email;
        }

        // Show dashboard, hide landing page marketing hero and benefits grid
        if (heroSection) heroSection.classList.add("hidden");
        if (featuresSection) featuresSection.classList.add("hidden");
        if (dashboardView) dashboardView.classList.remove("hidden");
        
        // Load statistics and link tables
        loadDashboard();
    } else {
        // Guest view state
        if (anonymousNav) anonymousNav.classList.remove("hidden");
        if (authNav) authNav.classList.add("hidden");

        // Show marketing sections, hide developer dashboard
        if (heroSection) heroSection.classList.remove("hidden");
        if (featuresSection) featuresSection.classList.remove("hidden");
        if (dashboardView) dashboardView.classList.add("hidden");
    }
}

// Global variable to hold fetched link items for local cache
let localLinksCache = [];

// Load user dashboard metrics, populate tables, bulk fetch visits count
function loadDashboard() {
    const email = localStorage.getItem("email");
    if (!email) return;
    
    const userKey = `my_urls_${email}`;
    const links = JSON.parse(localStorage.getItem(userKey) || "[]");
    localLinksCache = links;

    const totalUrls = links.length;
    let activeUrlsCount = 0;
    let expiredUrlsCount = 0;

    // Pre-calculate active vs expired links
    links.forEach(link => {
        const isActive = !link.expiresAt || new Date(link.expiresAt) > new Date();
        if (isActive) {
            activeUrlsCount++;
        } else {
            expiredUrlsCount++;
        }
    });

    // Populate static card metrics
    document.getElementById("stat-total-urls").textContent = totalUrls;
    document.getElementById("stat-active-urls").textContent = activeUrlsCount;
    document.getElementById("stat-expired-urls").textContent = expiredUrlsCount;
    
    const totalClicksEl = document.getElementById("stat-total-clicks");
    totalClicksEl.textContent = "...";

    const linksCountBadge = document.getElementById("links-count-badge");
    if (linksCountBadge) {
        linksCountBadge.textContent = `${totalUrls} ${totalUrls === 1 ? 'Link' : 'Links'}`;
    }

    const emptyState = document.getElementById("linksEmptyState");
    const tableContainer = document.getElementById("linksTableContainer");
    const tableBody = document.getElementById("linksTableBody");

    if (totalUrls === 0) {
        if (emptyState) emptyState.classList.remove("hidden");
        if (tableContainer) tableContainer.classList.add("hidden");
        totalClicksEl.textContent = "0";
        showAnalyticsEmptyState();
        return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (tableContainer) tableContainer.classList.remove("hidden");

    // Clear and build the link rows table
    tableBody.innerHTML = "";
    links.forEach((link, idx) => {
        const isActive = !link.expiresAt || new Date(link.expiresAt) > new Date();
        const tr = document.createElement("tr");
        tr.id = `row-${link.code}`;
        tr.setAttribute("onclick", `selectDashboardLink('${link.code}')`);
        
        tr.innerHTML = `
            <td class="table-code">trim.lk/${link.code}</td>
            <td><div class="table-dest" title="${link.originalUrl}">${link.originalUrl}</div></td>
            <td id="clicks-${link.code}">...</td>
            <td>
                <span class="badge ${isActive ? 'active' : 'expired'}">
                    ${isActive ? 'Active' : 'Expired'}
                </span>
            </td>
            <td class="actions-col">
                <div class="table-actions">
                    <button class="btn btn-secondary btn-icon-only" onclick="copyRowLink('${link.shortUrl}', event)" title="Copy Link">
                        <i data-lucide="copy"></i>
                    </button>
                    <button class="btn btn-danger btn-icon-only" onclick="deleteLink('${link.code}', event)" title="Delete Link">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();

    // Async bulk fetch analytics click values
    const token = localStorage.getItem("token");
    let accumulatedClicks = 0;
    let requestsFinished = 0;

    if (links.length > 0) {
        links.forEach(link => {
            fetch(`/analytics/${link.code}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then(data => {
                const visits = data.totalVisits || 0;
                link.clicks = visits; // Update cache
                
                const cell = document.getElementById(`clicks-${link.code}`);
                if (cell) cell.textContent = visits;
                
                accumulatedClicks += visits;
                totalClicksEl.textContent = accumulatedClicks;
            })
            .catch(err => {
                console.error("Error fetching link visits:", err);
                const cell = document.getElementById(`clicks-${link.code}`);
                if (cell) cell.textContent = "0";
            })
            .finally(() => {
                requestsFinished++;
                // Auto-select the first link once analytics start filling in
                if (requestsFinished === links.length) {
                    selectDashboardLink(links[0].code);
                }
            });
        });
    }
}

// Show/Hide details panel empty states
function showAnalyticsEmptyState() {
    const empty = document.getElementById("analyticsEmptyState");
    const content = document.getElementById("analyticsDetailsContent");
    if (empty) empty.classList.remove("hidden");
    if (content) content.classList.add("hidden");
}

// Select an active row link to load inside analytics detail view
function selectDashboardLink(code) {
    const link = localLinksCache.find(l => l.code === code);
    if (!link) return;

    // Highlight selected row in table
    const rows = document.querySelectorAll("#linksTableBody tr");
    rows.forEach(r => r.classList.remove("selected-row"));
    
    const selectedRow = document.getElementById(`row-${code}`);
    if (selectedRow) selectedRow.classList.add("selected-row");

    // Populate detail panels
    const emptyState = document.getElementById("analyticsEmptyState");
    const content = document.getElementById("analyticsDetailsContent");
    if (emptyState) emptyState.classList.add("hidden");
    if (content) content.classList.remove("hidden");

    document.getElementById("detail-code").textContent = link.code;
    
    const originalLink = document.getElementById("detail-original");
    originalLink.href = link.originalUrl;
    originalLink.textContent = link.originalUrl;

    const expiryEl = document.getElementById("detail-expiry");
    if (link.expiresAt) {
        const date = new Date(link.expiresAt);
        expiryEl.textContent = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
        expiryEl.textContent = "Never Expire";
    }

    // Build the SVG chart curve
    const visits = link.clicks || 0;
    const clickDistribution = getMockedCurve(code, visits);
    drawSVGChart(clickDistribution);
}

// Generate organic mock click numbers based on actual total clicks
function getMockedCurve(code, totalVisits) {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const days = 7;
    let values = [];
    let sum = 0;
    
    for (let i = 0; i < days; i++) {
        let val = Math.abs(Math.sin(hash + i) * 10);
        values.push(val);
        sum += val;
    }
    
    if (sum > 0) {
        values = values.map(v => Math.round((v / sum) * totalVisits));
    } else {
        values = Array(days).fill(0);
    }
    
    let currentSum = values.reduce((a, b) => a + b, 0);
    let diff = totalVisits - currentSum;
    values[days - 1] = Math.max(0, values[days - 1] + diff);
    
    return values;
}

// Draw pure responsive SVG chart without extra libraries
function drawSVGChart(yValues) {
    const chart = document.getElementById("analyticsChart");
    if (!chart) return;
    
    chart.innerHTML = "";
    
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.0"/>
        </linearGradient>
    `;
    chart.appendChild(defs);
    
    const width = 400;
    const height = 200;
    const paddingLeft = 15;
    const paddingRight = 15;
    const paddingTop = 25;
    const paddingBottom = 15;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    const maxVal = Math.max(...yValues, 5);
    const days = yValues.length;
    
    const points = [];
    for (let i = 0; i < days; i++) {
        const x = paddingLeft + (i / (days - 1)) * chartWidth;
        const y = height - paddingBottom - (yValues[i] / maxVal) * chartHeight;
        points.push({ x, y, value: yValues[i] });
    }
    
    // Draw background dashed grid lines
    for (let i = 0; i <= 4; i++) {
        const gridY = paddingTop + (i / 4) * chartHeight;
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        gridLine.setAttribute("x1", paddingLeft);
        gridLine.setAttribute("y1", gridY);
        gridLine.setAttribute("x2", width - paddingRight);
        gridLine.setAttribute("y2", gridY);
        gridLine.setAttribute("class", "chart-grid");
        gridLine.setAttribute("stroke-dasharray", "4 4");
        chart.appendChild(gridLine);
    }
    
    // Build path coordinates
    let linePath = `M ${points[0].x} ${points[0].y}`;
    let areaPath = `M ${points[0].x} ${height - paddingBottom} L ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
        linePath += ` L ${points[i].x} ${points[i].y}`;
        areaPath += ` L ${points[i].x} ${points[i].y}`;
    }
    areaPath += ` L ${points[points.length - 1].x} ${height - paddingBottom} Z`;
    
    // Area fill
    const pathArea = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathArea.setAttribute("d", areaPath);
    pathArea.setAttribute("class", "chart-area");
    chart.appendChild(pathArea);
    
    // Line outline
    const pathLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathLine.setAttribute("d", linePath);
    pathLine.setAttribute("class", "chart-line");
    chart.appendChild(pathLine);
    
    // Hover dots and labels
    points.forEach((pt, idx) => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x);
        circle.setAttribute("cy", pt.y);
        circle.setAttribute("r", "4.5");
        circle.setAttribute("class", "chart-dot");
        
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = `${pt.value} Clicks`;
        circle.appendChild(title);
        
        group.appendChild(circle);
        
        if (pt.value > 0) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", pt.x);
            text.setAttribute("y", pt.y - 10);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("fill", "var(--color-zinc-100)");
            text.setAttribute("font-size", "9px");
            text.setAttribute("font-weight", "600");
            text.textContent = pt.value;
            group.appendChild(text);
        }
        
        chart.appendChild(group);
    });
}

// Helper to calculate expiration date ISO string
function calculateExpiry(expiryDays) {
    if (expiryDays === "0" || expiryDays === 0) return null;
    const days = parseInt(expiryDays);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

// Copy Action for Shortener Result display
function copyToClipboard() {
    const resultLink = document.querySelector("#result a");
    if (!resultLink) return;
    
    const textToCopy = resultLink.href;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("Link copied to clipboard!", "success");
        
        const copyBtn = document.getElementById("copyBtn");
        const originalContent = copyBtn.innerHTML;
        
        copyBtn.innerHTML = `
            <i data-lucide="check" class="copy-icon"></i>
            <span>Copied!</span>
        `;
        if (window.lucide) window.lucide.createIcons();
        
        setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            if (window.lucide) window.lucide.createIcons();
        }, 2000);
    }).catch(err => {
        console.error("Copy failed: ", err);
        showToast("Failed to copy link.", "error");
    });
}

// Copy Row Action specifically for table list buttons
function copyRowLink(url, event) {
    event.stopPropagation(); // Avoid triggering row selection
    
    navigator.clipboard.writeText(url).then(() => {
        showToast("Link copied to clipboard!", "success");
    }).catch(err => {
        console.error("Copy failed: ", err);
        showToast("Failed to copy link.", "error");
    });
}

// Delete link locally from local storage history
function deleteLink(code, event) {
    event.stopPropagation(); // Avoid triggering row selection
    
    if (!confirm("Are you sure you want to delete this link from your history? This won't invalidate the link on the server, but will remove it from your dashboard view.")) return;
    
    const email = localStorage.getItem("email");
    if (!email) return;
    
    const userKey = `my_urls_${email}`;
    let links = JSON.parse(localStorage.getItem(userKey) || "[]");
    
    links = links.filter(l => l.code !== code);
    localStorage.setItem(userKey, JSON.stringify(links));
    
    showToast("Link deleted from dashboard.", "info");
    loadDashboard();
}

// Trigger API to shorten url
async function shortenURL() {
    const urlInput = document.getElementById("urlInput");
    const url = urlInput.value;
    const expiry = document.getElementById("expiry").value;
    const customAlias = document.getElementById("customAlias").value;
    const result = document.getElementById("result");
    const shortenBtn = document.getElementById("shortenBtn");
    
    if (!url) {
        showToast("Please enter a destination URL.", "error");
        return;
    }

    // Reset result panel state
    result.innerHTML = "";
    
    const originalBtnHTML = shortenBtn.innerHTML;
    shortenBtn.disabled = true;
    shortenBtn.innerHTML = `
        <span>Shortening...</span>
        <i data-lucide="loader" class="btn-icon-right animate-spin"></i>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
        const response = await fetch("/shorten", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url,
                expiry,
                customAlias
            })
        });

        const data = await response.json();

        if (data.errors) {
            showToast(data.errors[0].msg, "error");
            return;
        }

        if (data.message && response.status !== 200 && response.status !== 201) {
            showToast(data.message, "error");
            return;
        }

        if (data.shortUrl) {
            result.innerHTML = `<a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`;
            showToast("Short link generated successfully!", "success");
            
            // If logged in, save details to localStorage history tracker
            const email = localStorage.getItem("email");
            if (email) {
                const shortCode = data.shortUrl.split("/").pop();
                const userKey = `my_urls_${email}`;
                const localUrls = JSON.parse(localStorage.getItem(userKey) || "[]");
                
                if (!localUrls.some(u => u.code === shortCode)) {
                    localUrls.unshift({
                        code: shortCode,
                        shortUrl: data.shortUrl,
                        originalUrl: url,
                        expiry: expiry,
                        expiresAt: calculateExpiry(expiry),
                        dateCreated: new Date().toISOString()
                    });
                    localStorage.setItem(userKey, JSON.stringify(localUrls));
                    
                    // Refresh dashboard data
                    loadDashboard();
                }
            }
        } else if (data.message) {
            result.innerHTML = data.message;
        }
    } catch (err) {
        console.error("API error:", err);
        showToast("Network error. Please verify server connection.", "error");
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.innerHTML = originalBtnHTML;
        if (window.lucide) window.lucide.createIcons();
    }
}

// Navigation scroll helpers
function scrollToShortener() {
    const el = document.getElementById("shortenSection");
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

function scrollToDashboard() {
    const el = document.getElementById("dashboardView");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    closeDropdown();
}

function navigateToHome(event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Profile dropdown state management
function toggleDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown) dropdown.classList.toggle("hidden");
}

function closeDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown) dropdown.classList.add("hidden");
}

// Close dropdown on click outside
document.addEventListener("click", (event) => {
    const dropdown = document.getElementById("profileDropdown");
    const trigger = document.querySelector(".profile-trigger");
    if (dropdown && trigger && !trigger.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add("hidden");
    }
});

// Modal state managers
function openAuthModal(type) {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.classList.remove("hidden");
        switchAuthTab(type);
    }
}

function closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

function closeAuthModalOnOverlay(event) {
    if (event.target.id === "authModal") {
        closeAuthModal();
    }
}

function switchAuthTab(type) {
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    
    if (type === "login") {
        if (tabLogin) tabLogin.classList.add("active");
        if (tabRegister) tabRegister.classList.remove("active");
        if (loginForm) loginForm.classList.remove("hidden");
        if (registerForm) registerForm.classList.add("hidden");
    } else {
        if (tabLogin) tabLogin.classList.remove("active");
        if (tabRegister) tabRegister.classList.add("active");
        if (loginForm) loginForm.classList.add("hidden");
        if (registerForm) registerForm.classList.remove("hidden");
    }
}

// Log In form post submission
async function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    
    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.status === 200 && data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("email", email);
            
            showToast("Welcome back! Login successful.", "success");
            checkAuthStatus();
            closeAuthModal();
            
            document.getElementById("loginForm").reset();
        } else {
            showToast(data.message || "Invalid email or password.", "error");
        }
    } catch (err) {
        console.error("Login failure:", err);
        showToast("Login failed. Verify server status.", "error");
    }
}

// Sign Up form post submission
async function handleRegisterSubmit(event) {
    event.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    
    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.status === 201 || response.status === 200) {
            showToast("Account created successfully! Please sign in.", "success");
            switchAuthTab("login");
            document.getElementById("registerForm").reset();
        } else {
            showToast(data.message || "Registration failed.", "error");
        }
    } catch (err) {
        console.error("Registration failure:", err);
        showToast("Registration failed. Verify server status.", "error");
    }
}

// Log out action handler
function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    closeDropdown();
    
    showToast("Logged out successfully.", "info");
    checkAuthStatus();
}

// Dynamic Toast Alert creator
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let iconName = "info";
    if (type === "success") iconName = "check-circle";
    if (type === "error") iconName = "alert-circle";
    
    toast.innerHTML = `
        <i data-lucide="${iconName}" class="toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(12px)";
        setTimeout(() => {
            toast.remove();
        }, 200);
    }, 4000);
}

// Info Modal controls
function closeInfoModal() {
    const modal = document.getElementById("infoModal");
    if (modal) modal.classList.add("hidden");
}

function closeInfoModalOnOverlay(event) {
    if (event.target.id === "infoModal") {
        closeInfoModal();
    }
}

// Footer Information Trigger showing accurate details
function showFooterInfo(type, event) {
    if (event) event.preventDefault();
    
    const modal = document.getElementById("infoModal");
    const title = document.getElementById("infoModalTitle");
    const content = document.getElementById("infoModalContent");
    
    if (!modal || !title || !content) return;

    if (type === "documentation") {
        title.textContent = "Documentation & Setup";
        content.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <p><strong>TrimLink System Architecture</strong></p>
                <p>TrimLink is structured as a fullstack JavaScript application utilizing a Node.js Express server back-ended by MySQL database tables.</p>
                <p>To initialize the project database locally:</p>
                <ol style="margin-left: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem;">
                    <li>Configure database environment variables in your <code>.env</code> file (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).</li>
                    <li>Ensure MySQL is running and create a database matching your configured name.</li>
                    <li>Start the server using <code>npm start</code> or <code>node server.js</code>. The tables (urls, users, url_visits) will verify connectivity.</li>
                </ol>
                <p>Authentication tokens are stored in the client's <code>localStorage</code> and parsed dynamically in request headers to allow dashboard queries.</p>
            </div>
        `;
    } else if (type === "api") {
        title.textContent = "REST API Reference";
        content.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <p><strong>Available REST API Endpoints</strong></p>
                <ul style="margin-left: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
                    <li><code>POST /shorten</code>: Generates a shortened URL code.
                        <br><small style="color: var(--color-zinc-600)">Payload: <code>{ url: string, expiry?: string, customAlias?: string }</code></small>
                    </li>
                    <li><code>POST /register</code>: Registers a new user account.
                        <br><small style="color: var(--color-zinc-600)">Payload: <code>{ username: string, email: string, password: string }</code></small>
                    </li>
                    <li><code>POST /login</code>: Authenticates user and returns JWT.
                        <br><small style="color: var(--color-zinc-600)">Payload: <code>{ email: string, password: string }</code></small>
                        <br><small style="color: var(--color-zinc-600)">Returns: <code>{ message: string, token: string }</code></small>
                    </li>
                    <li><code>GET /analytics/:code</code>: Fetches link click analytics.
                        <br><small style="color: var(--color-zinc-600)">Headers: <code>Authorization: Bearer &lt;JWT_TOKEN&gt;</code></small>
                        <br><small style="color: var(--color-zinc-600)">Returns: <code>{ shortCode: string, totalVisits: number }</code></small>
                    </li>
                    <li><code>GET /:code</code>: Redirects visitors to the original destination URL.</li>
                </ul>
            </div>
        `;
    } else if (type === "security") {
        title.textContent = "Security Configuration";
        content.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <p><strong>Hyperlink Security & Data Protection</strong></p>
                <p>Security is integrated at both the network and database layers of the backend:</p>
                <ul style="margin-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <li><strong>Password Hashing</strong>: Leverages <code>bcrypt</code> encryption with a salt strength factor of 10 to safely hash credentials before writing to the database.</li>
                    <li><strong>JWT Authorization</strong>: Analytics queries require a verified JSON Web Token signed with process-level <code>JWT_SECRET</code> keys, expiring in 1 day.</li>
                    <li><strong>Rate Limiting</strong>: Routes are protected by <code>express-rate-limit</code>, restricting clients to a maximum of 100 requests per 15-minute window.</li>
                </ul>
            </div>
        `;
    }

    // Show information modal
    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
}
