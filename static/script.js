async function getUser() {
  const userId = document.getElementById('userIdInput').value;
  const resultDiv = document.getElementById('apiResult');

  if (!userId) {
    resultDiv.innerHTML = '<p class="error">يرجى إدخال رقم المستخدم</p>';
    return;
  }

  try {
    resultDiv.innerHTML = '<p class="loading">جاري جلب البيانات...</p>';
    const response = await fetch(`/users/${userId}`);
    const data = await response.json();

    if (data.error) {
      resultDiv.innerHTML = `<p class="error">${data.error}</p>`;
    } else {
      resultDiv.innerHTML = `
                <p class="success">تم جلب بيانات المستخدم بنجاح</p>
                <pre>${JSON.stringify(data.user, null, 2)}</pre>
            `;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p class="error">خطأ في الاتصال: ${error.message}</p>`;
  }
}

async function getAllUsers() {
  const resultDiv = document.getElementById('apiResult');
  const userCards = document.getElementById('userCards');

  try {
    resultDiv.innerHTML =
      '<p class="loading">جاري جلب بيانات المستخدمين...</p>';
    userCards.innerHTML = '';

    const response = await fetch('/users');
    const data = await response.json();

    if (data.users && data.users.length > 0) {
      resultDiv.innerHTML = `<p class="success">تم جلب ${data.users.length} مستخدم</p>`;

      userCards.innerHTML = data.users
        .map(
          (user) => `
                <div class="user-card">
                    <h3>${user.name}</h3>
                    <p><strong>البريد الإلكتروني:</strong> ${user.email}</p>
                    <p><strong>العمر:</strong> ${user.age}</p>
                    <p><strong>المعرف:</strong> ${user.id}</p>
                </div>
            `
        )
        .join('');
    } else {
      resultDiv.innerHTML = '<p class="error">لا يوجد مستخدمين</p>';
    }
  } catch (error) {
    resultDiv.innerHTML = `<p class="error">خطأ في الاتصال: ${error.message}</p>`;
  }
}

async function checkHealth() {
  const resultDiv = document.getElementById('healthResult');

  try {
    resultDiv.innerHTML = '<p class="loading">جاري فحص حالة الخادم...</p>';
    const response = await fetch('/health');
    const data = await response.json();

    resultDiv.innerHTML = `
            <p class="success">حالة الخادم: ${data.status}</p>
            <p>الإطار: ${data.framework}</p>
        `;
  } catch (error) {
    resultDiv.innerHTML = `<p class="error">خطأ في الاتصال: ${error.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', getAllUsers);
