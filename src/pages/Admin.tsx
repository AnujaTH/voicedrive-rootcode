import React, { useState } from "react";
import { FaClock, FaCheckCircle, FaListOl, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const adminSections = [
  { key: "questions", label: "Questions" },
  { key: "categories", label: "Categories" },
  { key: "exam-config", label: "Exam Config" },
  { key: "results", label: "Results" },
  { key: "users", label: "Users" },
  { key: "candidates", label: "Candidates" },
];
const accessSections = adminSections.filter((s) => s.key !== "candidates");
const roles = ["admin", "examiner", "candidate"];

const initialAdminUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@gmail.com",
    password: "admin123",
    role: "admin",
    access: accessSections.map((s) => s.key),
  },
  {
    id: 2,
    name: "Examiner User",
    email: "examiner@gmail.com",
    password: "examiner123",
    role: "examiner",
    access: ["results"],
  },
];

function getStoredAdminUsers() {
  const users = localStorage.getItem("adminUsers");
  if (!users) {
    localStorage.setItem("adminUsers", JSON.stringify(initialAdminUsers));
    return initialAdminUsers;
  }
  return JSON.parse(users);
}

function setStoredAdminUsers(users) {
  localStorage.setItem("adminUsers", JSON.stringify(users));
}

const initialCategories = ["Road Signs", "Traffic Rules", "Safety"];

const initialQuestions = [
  {
    id: 1,
    text: {
      en: "What does this sign mean?",
      si: "මෙය කුමක් දැක්වෙයිද?",
      ta: "இந்த குறி என்ன அர்த்தம்?",
    },
    category: "Road Signs",
    options: [
      { en: "Stop", si: "නවතන්න", ta: "நிறுத்து" },
      { en: "Yield", si: "ඉඩ දෙන්න", ta: "விடு" },
      { en: "No Entry", si: "ප්‍රවේශය නැත", ta: "நுழைவு இல்லை" },
    ],
    answer: 0,
  },
  {
    id: 2,
    text: {
      en: "What is the speed limit in urban areas?",
      si: "නගර ප්‍රදේශවල වේග සීමාව කීයද?",
      ta: "நகர்ப்புறங்களில் வேக வரம்பு என்ன?",
    },
    category: "Traffic Rules",
    options: [
      { en: "50 km/h", si: "කි.මී 50", ta: "50 கிமீ/ம" },
      { en: "70 km/h", si: "කි.මී 70", ta: "70 கிமீ/ம" },
      { en: "100 km/h", si: "කි.මී 100", ta: "100 கிமீ/ம" },
    ],
    answer: 0,
  },
];

const initialExamConfig = {
  timeLimit: 30, // minutes
  passingScore: 70, // percent
  questionCount: 40,
};

const initialUsers = [
  { id: 1, name: "Kamal Perera", email: "kamal@email.com", role: "admin" },
  { id: 2, name: "Nimal Silva", email: "nimal@email.com", role: "examiner" },
  { id: 3, name: "Saroja Raj", email: "saroja@email.com", role: "candidate" },
];

function QuestionModal({ open, onClose, onSave, categories, initial }) {
  const [text, setText] = useState(initial?.text || { en: "", si: "", ta: "" });
  const [category, setCategory] = useState(
    initial?.category || categories[0] || ""
  );
  const [options, setOptions] = useState(
    initial?.options || [
      { en: "", si: "", ta: "" },
      { en: "", si: "", ta: "" },
      { en: "", si: "", ta: "" },
    ]
  );
  const [answer, setAnswer] = useState(initial?.answer ?? 0);
  const [error, setError] = useState("");

  const handleOptionChange = (idx, lang, value) => {
    setOptions((opts) =>
      opts.map((opt, i) => (i === idx ? { ...opt, [lang]: value } : opt))
    );
  };

  const handleSave = () => {
    if (!text.en.trim() || !text.si.trim() || !text.ta.trim()) {
      setError("All question language fields are required.");
      return;
    }
    if (
      options.some((opt) => !opt.en.trim() || !opt.si.trim() || !opt.ta.trim())
    ) {
      setError("All option language fields are required.");
      return;
    }
    if (!category) {
      setError("Category is required.");
      return;
    }
    setError("");
    onSave({
      ...initial,
      text,
      category,
      options,
      answer,
      id: initial?.id || Date.now(),
    });
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4">
          {initial ? "Edit" : "Add"} Question
        </h3>
        <div className="mb-2">
          <label className="block font-medium">Question (English)</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={text.en}
            onChange={(e) => setText({ ...text, en: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Question (Sinhala)</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={text.si}
            onChange={(e) => setText({ ...text, si: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Question (Tamil)</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={text.ta}
            onChange={(e) => setText({ ...text, ta: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Category</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block font-medium">Options</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 mb-1 items-center">
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="English"
                value={opt.en}
                onChange={(e) => handleOptionChange(idx, "en", e.target.value)}
              />
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="Sinhala"
                value={opt.si}
                onChange={(e) => handleOptionChange(idx, "si", e.target.value)}
              />
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="Tamil"
                value={opt.ta}
                onChange={(e) => handleOptionChange(idx, "ta", e.target.value)}
              />
              <input
                type="radio"
                name="answer"
                checked={answer === idx}
                onChange={() => setAnswer(idx)}
              />
              <span className="text-xs">Correct</span>
            </div>
          ))}
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={handleSave}
          >
            {initial ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState(initial || "");
  const [error, setError] = useState("");
  const handleSave = () => {
    if (!name.trim()) {
      setError("Category name required");
      return;
    }
    setError("");
    onSave(name.trim());
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4">
          {initial ? "Edit" : "Add"} Category
        </h3>
        <input
          className="w-full border rounded px-2 py-1 mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={handleSave}
          >
            {initial ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [role, setRole] = useState(initial?.role || roles[0]);
  const [access, setAccess] = useState(initial?.access || []);
  const [error, setError] = useState("");
  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and email required");
      return;
    }
    setError("");
    onSave({
      ...initial,
      name: name.trim(),
      email: email.trim(),
      role,
      access,
      id: initial?.id || Date.now(),
    });
    onClose();
  };
  const handleAccessChange = (key) => {
    setAccess((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4">
          {initial ? "Edit" : "Add"} User
        </h3>
        <div className="mb-2">
          <label className="block font-medium">Name</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Email</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Role</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {role !== "candidate" && (
          <div className="mb-2">
            <label className="block font-medium">Page Access</label>
            <div className="flex flex-col gap-1">
              {accessSections.map((s) => (
                <label key={s.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={access.includes(s.key)}
                    onChange={() => handleAccessChange(s.key)}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
        )}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={handleSave}
          >
            {initial ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

const mockResults = [
  { id: 1, name: "Kamal Perera", score: 85, passed: true },
  { id: 2, name: "Nimal Silva", score: 62, passed: false },
  { id: 3, name: "Saroja Raj", score: 78, passed: true },
  { id: 4, name: "Tharindu Jay", score: 55, passed: false },
];
const mockAnalytics = {
  passRate: 50,
  failRate: 50,
  mostMissed: [
    { question: "What is the speed limit in urban areas?", missed: 12 },
    { question: "What does this sign mean?", missed: 8 },
  ],
};

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getStoredCandidates() {
  return JSON.parse(localStorage.getItem("candidates") || "[]");
}

function setStoredCandidates(candidates) {
  localStorage.setItem("candidates", JSON.stringify(candidates));
}

export default function Admin() {
  const navigate = useNavigate();
  const [active, setActive] = useState("questions");
  const [questions, setQuestions] = useState(initialQuestions);
  const [categories, setCategories] = useState(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [examConfig, setExamConfig] = useState(initialExamConfig);
  const [configEdit, setConfigEdit] = useState(initialExamConfig);
  const [configEditing, setConfigEditing] = useState(false);
  const [users, setUsers] = useState(getStoredAdminUsers());
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [candidates, setCandidates] = useState(getStoredCandidates());
  const [candidateForm, setCandidateForm] = useState({ name: "", nic: "" });
  const [candidateError, setCandidateError] = useState("");
  const [candidatePhoto, setCandidatePhoto] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCandidatePhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Pagination for questions
  const [qPage, setQPage] = useState(1);
  const [qPageSize, setQPageSize] = useState(5);
  const qTotalPages = Math.ceil(questions.length / qPageSize);
  const qStart = (qPage - 1) * qPageSize;
  const qEnd = qStart + qPageSize;
  const qPageData = questions.slice(qStart, qEnd);
  const handleQPageChange = (page) => setQPage(page);
  const handleQPageSizeChange = (e) => {
    setQPageSize(Number(e.target.value));
    setQPage(1);
  };

  // Pagination for users
  const [uPage, setUPage] = useState(1);
  const [uPageSize, setUPageSize] = useState(5);
  const uTotalPages = Math.ceil(users.length / uPageSize);
  const uStart = (uPage - 1) * uPageSize;
  const uEnd = uStart + uPageSize;
  const uPageData = users.slice(uStart, uEnd);
  const handleUPageChange = (page) => setUPage(page);
  const handleUPageSizeChange = (e) => {
    setUPageSize(Number(e.target.value));
    setUPage(1);
  };
  // Pagination for results
  const [rPage, setRPage] = useState(1);
  const [rPageSize, setRPageSize] = useState(5);
  const rTotalPages = Math.ceil(mockResults.length / rPageSize);
  const rStart = (rPage - 1) * rPageSize;
  const rEnd = rStart + rPageSize;
  const rPageData = mockResults.slice(rStart, rEnd);
  const handleRPageChange = (page) => setRPage(page);
  const handleRPageSizeChange = (e) => {
    setRPageSize(Number(e.target.value));
    setRPage(1);
  };

  const handleAdd = () => {
    setEditQuestion(null);
    setModalOpen(true);
  };
  const handleEdit = (id) => {
    setEditQuestion(questions.find((q) => q.id === id));
    setModalOpen(true);
  };
  const handleDelete = (id) =>
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  const handlePreview = (q) => {
    if (window.speechSynthesis) {
      const utter = new window.SpeechSynthesisUtterance(q.text.en);
      window.speechSynthesis.speak(utter);
    } else {
      alert("Speech Synthesis not supported");
    }
  };
  const handleSave = (q) => {
    setQuestions((qs) => {
      const exists = qs.findIndex((qq) => qq.id === q.id);
      if (exists >= 0) {
        const copy = [...qs];
        copy[exists] = q;
        return copy;
      } else {
        return [...qs, q];
      }
    });
  };

  const handleAddCategory = () => {
    setEditCategory(null);
    setCatModalOpen(true);
  };
  const handleEditCategory = (cat) => {
    setEditCategory(cat);
    setCatModalOpen(true);
  };
  const handleDeleteCategory = (cat) => {
    setCategories((cats) => cats.filter((c) => c !== cat));
    setQuestions((qs) =>
      qs.map((q) =>
        q.category === cat ? { ...q, category: categories[0] || "" } : q
      )
    );
  };
  const handleSaveCategory = (name) => {
    setCategories((cats) => {
      if (editCategory) {
        return cats.map((c) => (c === editCategory ? name : c));
      } else {
        if (!cats.includes(name)) return [...cats, name];
        return cats;
      }
    });
    setQuestions((qs) =>
      editCategory
        ? qs.map((q) =>
            q.category === editCategory ? { ...q, category: name } : q
          )
        : qs
    );
  };

  const handleConfigEdit = () => {
    setConfigEdit(examConfig);
    setConfigEditing(true);
  };
  const handleConfigSave = () => {
    setExamConfig(configEdit);
    localStorage.setItem("examConfig", JSON.stringify(configEdit));
    setConfigEditing(false);
  };
  const handleConfigCancel = () => {
    setConfigEditing(false);
  };

  const handleAddUser = () => {
    setEditUser(null);
    setUserModalOpen(true);
  };
  const handleEditUser = (id) => {
    setEditUser(users.find((u) => u.id === id));
    setUserModalOpen(true);
  };
  const handleDeleteUser = (id) =>
    setUsers((us) => us.filter((u) => u.id !== id));
  const handleSaveUser = (user) => {
    let updatedUsers;
    const exists = users.findIndex((uu) => uu.id === user.id);
    if (exists >= 0) {
      const copy = [...users];
      copy[exists] = user;
      updatedUsers = copy;
    } else {
      updatedUsers = [...users, user];
    }
    setUsers(updatedUsers);
    setStoredAdminUsers(updatedUsers);
    setUserModalOpen(false);
  };

  const handleCandidateInput = (e) => {
    setCandidateForm({ ...candidateForm, [e.target.name]: e.target.value });
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!candidateForm.name.trim() || !candidateForm.nic.trim()) {
      setCandidateError("Name and NIC/ID are required");
      return;
    }
    const code = generateCode();
    const newCandidate = { ...candidateForm, code, photo: candidatePhoto };
    const updated = [...candidates, newCandidate];
    setCandidates(updated);
    setStoredCandidates(updated);
    setCandidateForm({ name: "", nic: "" });
    setCandidateError("");
    setCandidatePhoto(null);
  };

  const handleDownloadPDF = (candidate) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Exam Candidate Code", 20, 20);
    doc.setFontSize(14);
    doc.text(`Name: ${candidate.name}`, 20, 40);
    doc.text(`NIC/ID: ${candidate.nic}`, 20, 50);
    doc.text(`Code: ${candidate.code}`, 20, 60);
    if (candidate.photo) {
      doc.addImage(candidate.photo, "JPEG", 150, 30, 40, 40);
    }
    doc.save(`${candidate.name}_code.pdf`);
  };

  const handleImport = () => alert("Bulk Import (CSV/Excel) coming soon");
  const handleExport = () => alert("Bulk Export (CSV/Excel) coming soon");

  // Auth check
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || (user.role !== "admin" && user.role !== "examiner")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Pagination for candidates
  const [candPage, setCandPage] = useState(1);
  const [candPageSize, setCandPageSize] = useState(5);
  const candTotalPages = Math.ceil(candidates.length / candPageSize);
  const candStart = (candPage - 1) * candPageSize;
  const candEnd = candStart + candPageSize;
  const candPageData = candidates.slice(candStart, candEnd);
  const handleCandPageChange = (page) => setCandPage(page);
  const handleCandPageSizeChange = (e) => {
    setCandPageSize(Number(e.target.value));
    setCandPage(1);
  };

  const handleDeleteCandidate = (index) => {
    const updated = candidates.filter((_, i) => i !== index);
    setCandidates(updated);
    setStoredCandidates(updated);
  };

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userAccess =
    user?.access ??
    (user?.role === "admin" ? adminSections.map((s) => s.key) : []);
  const allowedSections = adminSections.filter((s) =>
    userAccess.includes(s.key)
  );

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 border-r flex flex-col justify-between">
        <div>
          {/* Profile Info */}
          {user && (
            <div className="p-4 border-b mb-2 bg-gray-50 rounded-b-xl">
              <div className="font-bold text-lg mb-1">{user.email}</div>
              <div className="text-xs text-gray-600 capitalize">
                {user.role}
              </div>
            </div>
          )}
          <nav className="flex flex-col p-4 gap-2">
            {allowedSections.map((section) => (
              <button
                key={section.key}
                className={`text-left px-4 py-2 rounded hover:bg-gray-200 transition font-medium ${
                  active === section.key ? "bg-gray-200" : ""
                }`}
                onClick={() => setActive(section.key)}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
        <button
          className="m-4 px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-8 bg-gray-50">
        {active === "questions" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <h2 className="text-2xl font-bold">Questions</h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  className="bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300 transition"
                  onClick={handleImport}
                >
                  Import CSV/Excel
                </button>
                <button
                  className="bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300 transition"
                  onClick={handleExport}
                >
                  Export CSV/Excel
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow"
                  onClick={handleAdd}
                >
                  + Add Question
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                Total: {questions.length} questions
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Rows per page:</span>
                <select
                  className="border rounded px-2 py-1"
                  value={qPageSize}
                  onChange={handleQPageSizeChange}
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto rounded shadow">
              <table className="min-w-full bg-white border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-b text-left">
                      Question (EN)
                    </th>
                    <th className="px-4 py-2 border-b text-left">Category</th>
                    <th className="px-4 py-2 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {qPageData.map((q) => (
                    <tr key={q.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-2 border-b max-w-xs truncate">
                        {q.text.en}
                      </td>
                      <td className="px-4 py-2 border-b">{q.category}</td>
                      <td className="px-4 py-2 border-b flex gap-2 flex-wrap">
                        <button
                          className="text-blue-600 underline hover:text-blue-800"
                          onClick={() => handleEdit(q.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 underline hover:text-red-800"
                          onClick={() => handleDelete(q.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="text-green-600 underline hover:text-green-800"
                          onClick={() => handlePreview(q)}
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                  {qPageData.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-8 text-gray-400"
                      >
                        No questions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {qStart + 1}-{Math.min(qEnd, questions.length)} of{" "}
                {questions.length}
              </div>
              <div className="flex gap-1 items-center">
                <button
                  className="px-2 py-1 rounded disabled:opacity-50"
                  onClick={() => handleQPageChange(qPage - 1)}
                  disabled={qPage === 1}
                >
                  &lt;
                </button>
                {Array.from({ length: qTotalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`px-2 py-1 rounded ${
                        qPage === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => handleQPageChange(page)}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  className="px-2 py-1 rounded disabled:opacity-50"
                  onClick={() => handleQPageChange(qPage + 1)}
                  disabled={qPage === qTotalPages}
                >
                  &gt;
                </button>
              </div>
            </div>
            <QuestionModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              onSave={handleSave}
              categories={categories}
              initial={editQuestion}
            />
          </div>
        )}
        {active === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Categories</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleAddCategory}
              >
                Add Category
              </button>
            </div>
            <table className="min-w-full bg-white border rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Category</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{cat}</td>
                    <td className="px-4 py-2 border-b flex gap-2">
                      <button
                        className="text-blue-600 underline"
                        onClick={() => handleEditCategory(cat)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 underline"
                        onClick={() => handleDeleteCategory(cat)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-gray-400">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <CategoryModal
              open={catModalOpen}
              onClose={() => setCatModalOpen(false)}
              onSave={handleSaveCategory}
              initial={editCategory}
            />
          </div>
        )}
        {active === "exam-config" && (
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaEdit className="text-blue-600" /> Exam Configuration
            </h2>
            <div className="bg-white rounded-xl shadow p-6 border">
              {!configEditing ? (
                <>
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <FaClock className="text-gray-500" />
                      <div>
                        <div className="font-semibold">Time Limit</div>
                        <div className="text-lg font-mono">
                          {examConfig.timeLimit}{" "}
                          <span className="text-gray-500">minutes</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          How long candidates have to complete the exam.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-600" />
                      <div>
                        <div className="font-semibold">Passing Score</div>
                        <div className="text-lg font-mono">
                          {examConfig.passingScore}%
                        </div>
                        <div className="text-xs text-gray-400">
                          Minimum score required to pass.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaListOl className="text-orange-500" />
                      <div>
                        <div className="font-semibold">Question Count</div>
                        <div className="text-lg font-mono">
                          {examConfig.questionCount}
                        </div>
                        <div className="text-xs text-gray-400">
                          Number of questions per exam session.
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="my-4" />
                  <button
                    className="w-full px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                    onClick={handleConfigEdit}
                  >
                    Edit Configuration
                  </button>
                </>
              ) : (
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleConfigSave();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <FaClock className="text-gray-500" />
                    <div className="flex-1">
                      <label className="block font-semibold">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1 mt-1"
                        value={configEdit.timeLimit}
                        min={1}
                        max={180}
                        onChange={(e) =>
                          setConfigEdit({
                            ...configEdit,
                            timeLimit: Number(e.target.value),
                          })
                        }
                      />
                      <div className="text-xs text-gray-400">
                        How long candidates have to complete the exam.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-600" />
                    <div className="flex-1">
                      <label className="block font-semibold">
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1 mt-1"
                        value={configEdit.passingScore}
                        min={0}
                        max={100}
                        onChange={(e) =>
                          setConfigEdit({
                            ...configEdit,
                            passingScore: Number(e.target.value),
                          })
                        }
                      />
                      <div className="text-xs text-gray-400">
                        Minimum score required to pass.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaListOl className="text-orange-500" />
                    <div className="flex-1">
                      <label className="block font-semibold">
                        Question Count
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1 mt-1"
                        value={configEdit.questionCount}
                        min={1}
                        max={200}
                        onChange={(e) =>
                          setConfigEdit({
                            ...configEdit,
                            questionCount: Number(e.target.value),
                          })
                        }
                      />
                      <div className="text-xs text-gray-400">
                        Number of questions per exam session.
                      </div>
                    </div>
                  </div>
                  <hr className="my-4" />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="w-1/2 px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                      onClick={handleConfigCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
        {active === "results" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Results & Analytics</h2>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Pass/Fail Rate</h3>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="text-green-700">
                    Pass: {mockAnalytics.passRate}%
                  </div>
                  <div
                    className="bg-green-200 h-3 rounded"
                    style={{ width: `${mockAnalytics.passRate}%` }}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-red-700">
                    Fail: {mockAnalytics.failRate}%
                  </div>
                  <div
                    className="bg-red-200 h-3 rounded"
                    style={{ width: `${mockAnalytics.failRate}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Most Missed Questions</h3>
              <ul className="list-disc pl-6">
                {mockAnalytics.mostMissed.map((q, i) => (
                  <li key={i}>
                    {q.question}{" "}
                    <span className="text-gray-500">({q.missed} misses)</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Candidate Results</h3>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">
                  Total: {mockResults.length} results
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Rows per page:</span>
                  <select
                    className="border rounded px-2 py-1"
                    value={rPageSize}
                    onChange={handleRPageSizeChange}
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto rounded shadow">
                <table className="min-w-full bg-white border rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border-b">Name</th>
                      <th className="px-4 py-2 border-b">Score</th>
                      <th className="px-4 py-2 border-b">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rPageData.map((r) => (
                      <tr key={r.id} className="hover:bg-blue-50 transition">
                        <td className="px-4 py-2 border-b">{r.name}</td>
                        <td className="px-4 py-2 border-b">{r.score}</td>
                        <td className="px-4 py-2 border-b">
                          {r.passed ? (
                            <span className="text-green-700 font-bold">
                              Pass
                            </span>
                          ) : (
                            <span className="text-red-700 font-bold">Fail</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {rPageData.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-8 text-gray-400"
                        >
                          No results found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination controls */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {rStart + 1}-{Math.min(rEnd, mockResults.length)} of{" "}
                  {mockResults.length}
                </div>
                <div className="flex gap-1 items-center">
                  <button
                    className="px-2 py-1 rounded disabled:opacity-50"
                    onClick={() => handleRPageChange(rPage - 1)}
                    disabled={rPage === 1}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: rTotalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={`px-2 py-1 rounded ${
                          rPage === page
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-200"
                        }`}
                        onClick={() => handleRPageChange(page)}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    className="px-2 py-1 rounded disabled:opacity-50"
                    onClick={() => handleRPageChange(rPage + 1)}
                    disabled={rPage === rTotalPages}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {active === "users" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Users</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleAddUser}
              >
                Add User
              </button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                Total: {users.length} users
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Rows per page:</span>
                <select
                  className="border rounded px-2 py-1"
                  value={uPageSize}
                  onChange={handleUPageSizeChange}
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto rounded shadow">
              <table className="min-w-full bg-white border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-b">Name</th>
                    <th className="px-4 py-2 border-b">Email</th>
                    <th className="px-4 py-2 border-b">Role</th>
                    <th className="px-4 py-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uPageData.map((u) => (
                    <tr key={u.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-2 border-b">{u.name}</td>
                      <td className="px-4 py-2 border-b">{u.email}</td>
                      <td className="px-4 py-2 border-b capitalize">
                        {u.role}
                      </td>
                      <td className="px-4 py-2 border-b flex gap-2">
                        <button
                          className="text-blue-600 underline hover:text-blue-800"
                          onClick={() => handleEditUser(u.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 underline hover:text-red-800"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {uPageData.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-8 text-gray-400"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {uStart + 1}-{Math.min(uEnd, users.length)} of{" "}
                {users.length}
              </div>
              <div className="flex gap-1 items-center">
                <button
                  className="px-2 py-1 rounded disabled:opacity-50"
                  onClick={() => handleUPageChange(uPage - 1)}
                  disabled={uPage === 1}
                >
                  &lt;
                </button>
                {Array.from({ length: uTotalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`px-2 py-1 rounded ${
                        uPage === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => handleUPageChange(page)}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  className="px-2 py-1 rounded disabled:opacity-50"
                  onClick={() => handleUPageChange(uPage + 1)}
                  disabled={uPage === uTotalPages}
                >
                  &gt;
                </button>
              </div>
            </div>
            <UserModal
              open={userModalOpen}
              onClose={() => setUserModalOpen(false)}
              onSave={handleSaveUser}
              initial={editUser}
            />
          </div>
        )}
        {active === "candidates" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Candidates</h2>
            <form
              className="flex flex-col gap-4 max-w-md bg-white p-6 rounded shadow mb-8"
              onSubmit={handleAddCandidate}
            >
              <div>
                <label className="block font-medium mb-1">Name</label>
                <input
                  name="name"
                  className="w-full border rounded px-3 py-2"
                  value={candidateForm.name}
                  onChange={handleCandidateInput}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">NIC/ID</label>
                <input
                  name="nic"
                  className="w-full border rounded px-3 py-2"
                  value={candidateForm.nic}
                  onChange={handleCandidateInput}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Photo (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                {candidatePhoto && (
                  <img
                    src={candidatePhoto}
                    alt="Preview"
                    className="mt-2 h-20 rounded"
                  />
                )}
              </div>
              {candidateError && (
                <div className="text-red-600 text-sm">{candidateError}</div>
              )}
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              >
                Add Candidate
              </button>
            </form>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                Total: {candidates.length} candidates
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Rows per page:</span>
                <select
                  className="border rounded px-2 py-1"
                  value={candPageSize}
                  onChange={handleCandPageSizeChange}
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto rounded shadow">
              <table className="min-w-full bg-white border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-b">Name</th>
                    <th className="px-4 py-2 border-b">NIC/ID</th>
                    <th className="px-4 py-2 border-b">Code</th>
                    <th className="px-4 py-2 border-b">Photo</th>
                    <th className="px-4 py-2 border-b">PDF</th>
                    <th className="px-4 py-2 border-b">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {candPageData.map((c, i) => (
                    <tr
                      key={candStart + i}
                      className="hover:bg-blue-50 transition"
                    >
                      <td className="px-4 py-2 border-b">{c.name}</td>
                      <td className="px-4 py-2 border-b">{c.nic}</td>
                      <td className="px-4 py-2 border-b font-mono text-lg">
                        {c.code}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {c.photo && (
                          <img src={c.photo} alt="" className="h-12 rounded" />
                        )}
                      </td>
                      <td className="px-4 py-2 border-b">
                        <button
                          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                          onClick={() => handleDownloadPDF(c)}
                        >
                          Download PDF
                        </button>
                      </td>
                      <td className="px-4 py-2 border-b">
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          onClick={() => handleDeleteCandidate(candStart + i)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {candPageData.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-gray-400"
                      >
                        No candidates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {candStart + 1}-{Math.min(candEnd, candidates.length)}{" "}
                of {candidates.length}
              </div>
              <div className="flex gap-1 items-center">
                <button
                  className="px-2 py-1 rounded disabled:opacity-50"
                  onClick={() => handleCandPageChange(candPage - 1)}
                  disabled={candPage === 1}
                >
                  &lt;
                </button>
                {Array.from({ length: candTotalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`px-2 py-1 rounded ${
                        candPage === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => handleCandPageChange(page)}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  className="px-2 py-1 rounded disabled:opacity-50"
                  onClick={() => handleCandPageChange(candPage + 1)}
                  disabled={candPage === candTotalPages}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
