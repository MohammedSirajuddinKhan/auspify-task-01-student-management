// ==========================================
// CAMPUSDESK - STUDENT MANAGEMENT SYSTEM
// Frontend API Integration
// ==========================================

const API_BASE_URL = "http://localhost:5000/api/v1/students";

const elements = {
  table: document.getElementById("studentsTable"),
  totalStudents: document.getElementById("totalStudents"),
  totalCourses: document.getElementById("totalCourses"),
  latestRecord: document.getElementById("latestRecord"),
  recordCount: document.getElementById("recordCount"),
  search: document.getElementById("searchInput"),
  refresh: document.getElementById("refreshBtn"),
  addButton: document.getElementById("addStudentBtn"),
  modal: document.getElementById("studentModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalEyebrow: document.getElementById("modalEyebrow"),
  form: document.getElementById("studentForm"),
  formError: document.getElementById("formError"),
  saveButton: document.getElementById("saveStudentBtn"),
  connectionDot: document.getElementById("connectionDot"),
  connectionText: document.getElementById("connectionText"),
  toastRegion: document.getElementById("toastRegion"),
};

const fieldIds = [
  "fullName",
  "email",
  "rollNumber",
  "course",
  "semester",
  "phone",
];

let students = [];
let editingStudentId = null;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Prevent HTML injection when rendering user data.

function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

// Generate student initials.

function initials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase() || "ST"
  );
}

// Format dates.

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

// Show toast notifications.

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.textContent = message;

  elements.toastRegion.appendChild(toast);

  window.setTimeout(() => toast.remove(), 3600);
}

// Update backend connection status.

function setConnection(isOnline) {
  elements.connectionDot.className = `status-dot ${isOnline ? "online" : "offline"}`;

  elements.connectionText.textContent = isOnline
    ? "API connected"
    : "API unavailable";
}

// ==========================================
// API REQUEST HANDLER
// ==========================================

async function apiRequest(path = "", options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,

      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),

        ...options.headers,
      },
    });
  } catch (error) {
    setConnection(false);

    throw new Error(
      "Cannot reach the backend. Check that your server is running on http://localhost:5000.",
    );
  }

  let payload = {};

  const responseText = await response.text();

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = { message: responseText };
    }
  }

  if (!response.ok) {
    const message =
      payload.message || payload.error || `Request failed (${response.status})`;

    throw new Error(message);
  }

  setConnection(true);

  return payload;
}

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

function renderStats(list) {
  elements.totalStudents.textContent = list.length;

  const uniqueCourses = new Set(
    list
      .map((student) => (student.course || "").trim().toLowerCase())
      .filter(Boolean),
  );

  elements.totalCourses.textContent = uniqueCourses.size;

  const latest = [...list].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  )[0];

  elements.latestRecord.textContent = latest
    ? formatDate(latest.createdAt)
    : "—";
}

// ==========================================
// DISPLAY STUDENT RECORDS
// ==========================================

function renderStudents(list) {
  if (!list.length) {
    elements.table.innerHTML = `
      <tr>
        <td colspan="6" class="table-message">
          No students found. Add a student to get started.
        </td>
      </tr>
    `;

    return;
  }

  elements.table.innerHTML = list
    .map(
      (student) => `

    <tr>

      <td>

        <div class="student-cell">

          <div class="student-avatar">
            ${escapeHTML(initials(student.fullName))}
          </div>

          <div class="student-meta">

            <strong>
              ${escapeHTML(student.fullName)}
            </strong>

            <small>
              ${escapeHTML(student.email)}
            </small>

          </div>

        </div>

      </td>


      <td>
        <span class="roll-pill">
          ${escapeHTML(student.rollNumber)}
        </span>
      </td>


      <td>
        <span class="course-text">
          ${escapeHTML(student.course)}
        </span>
      </td>


      <td>
        <span class="semester-pill">
          Sem ${escapeHTML(student.semester)}
        </span>
      </td>


      <td>
        ${escapeHTML(student.phone)}
      </td>


      <td>

        <div class="row-actions">

          <button
            class="action-button"
            data-action="edit"
            data-id="${escapeHTML(student._id)}"
          >
            Edit
          </button>

          <button
            class="action-button delete"
            data-action="delete"
            data-id="${escapeHTML(student._id)}"
          >
            Delete
          </button>

        </div>

      </td>

    </tr>

  `,
    )
    .join("");
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================

function applySearch() {
  const query = elements.search.value.trim().toLowerCase();

  const filtered = students.filter((student) =>
    [
      student.fullName,
      student.email,
      student.rollNumber,
      student.course,
      student.phone,
      student.semester,
    ].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(query),
    ),
  );

  renderStudents(filtered);

  elements.recordCount.textContent = query
    ? `Showing ${filtered.length} of ${students.length} students`
    : `${students.length} student${students.length === 1 ? "" : "s"} in directory`;
}

// ==========================================
// GET ALL STUDENTS
// ==========================================

async function loadStudents() {
  elements.refresh.disabled = true;

  elements.table.innerHTML = `
    <tr>
      <td colspan="6" class="table-message">
        Loading student records...
      </td>
    </tr>
  `;

  try {
    const result = await apiRequest("");

    students = Array.isArray(result.data) ? result.data : [];

    renderStats(students);

    applySearch();
  } catch (error) {
    elements.table.innerHTML = `
      <tr>
        <td colspan="6" class="table-message error">
          ${escapeHTML(error.message)}
        </td>
      </tr>
    `;

    elements.recordCount.textContent = "Unable to load records";

    elements.totalStudents.textContent = "—";
    elements.totalCourses.textContent = "—";
    elements.latestRecord.textContent = "—";

    showToast(error.message, "error");
  } finally {
    elements.refresh.disabled = false;
  }
}

// ==========================================
// OPEN ADD / EDIT MODAL
// ==========================================

function openModal(student = null) {
  editingStudentId = student?._id || null;

  elements.form.reset();

  elements.formError.textContent = "";

  elements.modalTitle.textContent = student ? "Edit student" : "Add student";

  elements.modalEyebrow.textContent = student ? "UPDATE RECORD" : "NEW RECORD";

  elements.saveButton.textContent = student ? "Save changes" : "Save student";

  // Populate form when editing.

  if (student) {
    fieldIds.forEach((field) => {
      const input = document.getElementById(field);

      input.value = student[field] ?? "";
    });
  }

  elements.modal.classList.add("open");

  elements.modal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  window.setTimeout(() => {
    document.getElementById("fullName").focus();
  }, 50);
}

// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {
  elements.modal.classList.remove("open");

  elements.modal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  editingStudentId = null;
}

// ==========================================
// COLLECT FORM DATA
// ==========================================

function collectFormData() {
  const formData = new FormData(elements.form);

  return {
    fullName: String(formData.get("fullName") || "").trim(),

    email: String(formData.get("email") || "")
      .trim()
      .toLowerCase(),

    rollNumber: String(formData.get("rollNumber") || "")
      .trim()
      .toUpperCase(),

    course: String(formData.get("course") || "").trim(),

    semester: Number(formData.get("semester")),

    phone: String(formData.get("phone") || "").trim(),
  };
}

// ==========================================
// CLIENT-SIDE VALIDATION
// ==========================================

function validateStudent(student) {
  if (student.fullName.length < 3 || student.fullName.length > 60) {
    return "Full name must be between 3 and 60 characters.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    return "Enter a valid email address.";
  }

  if (!student.rollNumber) {
    return "Roll number is required.";
  }

  if (!student.course) {
    return "Course is required.";
  }

  if (
    !Number.isInteger(student.semester) ||
    student.semester < 1 ||
    student.semester > 6
  ) {
    return "Select a semester between 1 and 6.";
  }

  if (!/^[0-9]{10}$/.test(student.phone)) {
    return "Phone number must contain exactly 10 digits.";
  }

  return "";
}

// ==========================================
// CREATE / UPDATE STUDENT
// ==========================================

async function saveStudent(event) {
  event.preventDefault();

  elements.formError.textContent = "";

  const student = collectFormData();

  const validationMessage = validateStudent(student);

  if (validationMessage) {
    elements.formError.textContent = validationMessage;

    return;
  }

  const isEditing = Boolean(editingStudentId);

  elements.saveButton.disabled = true;

  elements.saveButton.textContent = isEditing ? "Saving..." : "Creating...";

  try {
    if (isEditing) {
      // UPDATE STUDENT

      await apiRequest(`/${encodeURIComponent(editingStudentId)}`, {
        method: "PUT",
        body: JSON.stringify(student),
      });

      showToast("Student details updated successfully.");
    } else {
      // CREATE STUDENT

      await apiRequest("", {
        method: "POST",
        body: JSON.stringify(student),
      });

      showToast("Student added successfully.");
    }

    closeModal();

    await loadStudents();
  } catch (error) {
    elements.formError.textContent = error.message;
  } finally {
    elements.saveButton.disabled = false;

    elements.saveButton.textContent = isEditing
      ? "Save changes"
      : "Save student";
  }
}

// ==========================================
// DELETE STUDENT
// ==========================================

async function deleteStudent(id) {
  const student = students.find((item) => item._id === id);

  if (!student) return;

  const confirmed = window.confirm(
    `Delete ${student.fullName}'s record? This action cannot be undone.`,
  );

  if (!confirmed) return;

  try {
    await apiRequest(`/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    showToast("Student record deleted.");

    await loadStudents();
  } catch (error) {
    showToast(error.message, "error");
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Open add student modal.

elements.addButton.addEventListener("click", () => {
  openModal();
});

// Refresh student records.

elements.refresh.addEventListener("click", loadStudents);

// Search students.

elements.search.addEventListener("input", applySearch);

// Submit student form.

elements.form.addEventListener("submit", saveStudent);

// Close modal buttons.

document.getElementById("closeModalBtn").addEventListener("click", closeModal);

document.getElementById("cancelModalBtn").addEventListener("click", closeModal);

// Close modal when clicking outside.

elements.modal.addEventListener("click", (event) => {
  if (event.target === elements.modal) {
    closeModal();
  }
});

// Close modal with Escape key.

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && elements.modal.classList.contains("open")) {
    closeModal();
  }
});

// Handle Edit and Delete button clicks.

elements.table.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const student = students.find((item) => item._id === button.dataset.id);

  if (!student) return;

  if (button.dataset.action === "edit") {
    openModal(student);
  }

  if (button.dataset.action === "delete") {
    deleteStudent(student._id);
  }
});

// Allow digits only in phone input.

document.getElementById("phone").addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
});

// ==========================================
// INITIALIZE APPLICATION
// ==========================================

loadStudents();
