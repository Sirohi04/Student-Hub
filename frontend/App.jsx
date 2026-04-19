import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

const API_URL = "http://localhost:5000/api";

const sampleAnnouncements = [
  {
    id: 1,
    title: "Mid-sem exams begin next week",
    desc: "Check your hall ticket and final timetable before Monday.",
    time: "10 min ago",
    type: "alert",
  },
  {
    id: 2,
    title: "Web Development assignment uploaded",
    desc: "Submit your project report before 24 April.",
    time: "1 hour ago",
    type: "info",
  },
  {
    id: 3,
    title: "Attendance warning",
    desc: "You must maintain 75% attendance in DBMS.",
    time: "Today",
    type: "warning",
  },
];

const sampleSchedule = [
  { id: 1, subject: "DBMS", time: "09:00 AM", room: "Lab 4", faculty: "Dr. Mehta" },
  { id: 2, subject: "Operating Systems", time: "11:00 AM", room: "C-203", faculty: "Prof. Singh" },
  { id: 3, subject: "Computer Networks", time: "02:00 PM", room: "B-112", faculty: "Dr. Sharma" },
];

const sampleAttendance = [
  { subject: "DBMS", percent: 72, status: "Low" },
  { subject: "Operating Systems", percent: 88, status: "Good" },
  { subject: "Computer Networks", percent: 91, status: "Excellent" },
  { subject: "DSA", percent: 79, status: "Average" },
];

export default function App() {
  const [mode, setMode] = useState("login");
  const [dark, setDark] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchCourses();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch profile");
      }

      setUser(data || null);
    } catch (err) {
      setMessage(err.message || "Profile error");
      logout(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/courses`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch courses");
      }

      if (Array.isArray(data)) {
        setCourses(data);
      } else if (Array.isArray(data?.courses)) {
        setCourses(data.courses);
      } else {
        setCourses([]);
      }
    } catch (err) {
      setCourses([]);
      setMessage(err.message || "Courses error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }

      const newToken = data?.token || "";
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setLoginForm({ email: "", password: "" });
      setMessage("Login successful ✅");
    } catch (err) {
      setMessage(err.message || "Login error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Registration failed");
      }

      setRegisterForm({ name: "", email: "", password: "" });
      setMode("login");
      setMessage("Registration successful ✅ Please login.");
    } catch (err) {
      setMessage(err.message || "Registration error");
    } finally {
      setLoading(false);
    }
  };

  const logout = (showMessage = true) => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setCourses([]);
    setMode("login");
    setActiveTab("dashboard");
    if (showMessage) {
      setMessage("Logged out successfully.");
    }
  };

  const safeCourses = Array.isArray(courses) ? courses : [];

  const attendanceAverage = useMemo(() => {
    if (!Array.isArray(sampleAttendance) || sampleAttendance.length === 0) return 0;
    const total = sampleAttendance.reduce((sum, item) => sum + (item?.percent || 0), 0);
    return Math.round(total / sampleAttendance.length);
  }, []);

  const lowAttendanceSubjects = Array.isArray(sampleAttendance)
    ? sampleAttendance.filter((item) => (item?.percent || 0) < 75).length
    : 0;

  const totalCredits = useMemo(() => {
    if (!Array.isArray(safeCourses) || safeCourses.length === 0) return 0;
    return safeCourses.reduce((sum, course) => sum + (Number(course?.credits) || 0), 0);
  }, [safeCourses]);

  const renderDashboard = () => (
    <>
      <section className="hero-panel">
        <div>
          <span className="eyebrow">Student Performance Hub</span>
          <h1>Welcome back, {user?.name || "Student"}</h1>
          <p className="hero-text">
            Track attendance, manage courses, stay updated with announcements,
            and monitor your academic performance from one place.
          </p>
        </div>

        <div className="hero-side-card">
          <p className="mini-label">Live Clock</p>
          <h2>{currentTime.toLocaleTimeString()}</h2>
          <p>{currentTime.toDateString()}</p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card stat-blue">
          <p>Total Courses</p>
          <h3>{safeCourses.length}</h3>
          <span>Active this semester</span>
        </div>

        <div className="stat-card stat-green">
          <p>Attendance</p>
          <h3>{attendanceAverage}%</h3>
          <span>Overall average</span>
        </div>

        <div className="stat-card stat-purple">
          <p>Total Credits</p>
          <h3>{totalCredits}</h3>
          <span>Registered credits</span>
        </div>

        <div className="stat-card stat-orange">
          <p>Risk Alerts</p>
          <h3>{lowAttendanceSubjects}</h3>
          <span>Subjects below 75%</span>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel panel-large">
          <div className="panel-head">
            <h2>Attendance Overview</h2>
            <span className="badge">Live Summary</span>
          </div>

          <div className="attendance-list">
            {sampleAttendance.map((item, index) => (
              <div className="attendance-row" key={index}>
                <div>
                  <h4>{item?.subject || "Subject"}</h4>
                  <p>{item?.status || "Status"} attendance status</p>
                </div>

                <div className="attendance-progress-wrap">
                  <div className="attendance-progress">
                    <div
                      className="attendance-progress-fill"
                      style={{ width: `${item?.percent || 0}%` }}
                    ></div>
                  </div>
                  <strong>{item?.percent || 0}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Today’s Schedule</h2>
            <span className="badge outline">3 Classes</span>
          </div>

          <div className="schedule-list">
            {sampleSchedule.map((item) => (
              <div className="schedule-card" key={item.id}>
                <div>
                  <h4>{item?.subject || "Subject"}</h4>
                  <p>{item?.faculty || "Faculty"}</p>
                </div>
                <div className="schedule-meta">
                  <span>{item?.time || "--"}</span>
                  <span>{item?.room || "--"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Announcements</h2>
            <span className="badge glow">New</span>
          </div>

          <div className="announcement-list">
            {sampleAnnouncements.map((item) => (
              <div className="announcement-card" key={item.id}>
                <div className={`dot ${item?.type || "info"}`}></div>
                <div>
                  <h4>{item?.title || "Announcement"}</h4>
                  <p>{item?.desc || "No description available."}</p>
                  <small>{item?.time || "Now"}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Quick Actions</h2>
          </div>

          <div className="quick-actions">
            <button type="button">Mark Attendance</button>
            <button type="button">View Timetable</button>
            <button type="button">Check Results</button>
            <button type="button">Open Assignments</button>
          </div>
        </div>
      </section>
    </>
  );

  const renderCourses = () => (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>My Courses</h2>
        <span className="badge">{safeCourses.length} Courses</span>
      </div>

      <div className="course-grid">
        {safeCourses.length > 0 ? (
          safeCourses.map((course, index) => (
            <div className="course-card" key={course?._id || index}>
              <div className="course-top">
                <span className="course-tag">{course?.code || "COURSE"}</span>
                <span className="course-credit">
                  {Number(course?.credits) || 0} Credits
                </span>
              </div>
              <h3>{course?.name || "Untitled Course"}</h3>
              <p>Teacher: {course?.teacher || "Not assigned"}</p>
              <div className="course-footer">
                <span>Semester course</span>
                <button type="button">Open</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <h3>No courses available</h3>
            <p>Add courses from backend to show real data here.</p>
          </div>
        )}
      </div>
    </section>
  );

  const renderAttendance = () => (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>Attendance Details</h2>
        <span className="badge">{attendanceAverage}% Overall</span>
      </div>

      <div className="attendance-table">
        {sampleAttendance.map((item, index) => (
          <div className="table-row" key={index}>
            <span>{item?.subject || "Subject"}</span>
            <span>{item?.percent || 0}%</span>
            <span className={`status-pill ${(item?.percent || 0) < 75 ? "low" : "good"}`}>
              {item?.status || "Unknown"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  if (token && user) {
    return (
      <div className={dark ? "app dark" : "app"}>
        <aside className="sidebar">
          <div>
            <div className="brand">
              <div className="brand-logo">🎓</div>
              <div>
                <h2>StudentHub</h2>
                <p>Smart campus dashboard</p>
              </div>
            </div>

            <nav className="nav-menu">
              <button
                className={activeTab === "dashboard" ? "active" : ""}
                onClick={() => setActiveTab("dashboard")}
                type="button"
              >
                Dashboard
              </button>
              <button
                className={activeTab === "courses" ? "active" : ""}
                onClick={() => setActiveTab("courses")}
                type="button"
              >
                Courses
              </button>
              <button
                className={activeTab === "attendance" ? "active" : ""}
                onClick={() => setActiveTab("attendance")}
                type="button"
              >
                Attendance
              </button>
            </nav>
          </div>

          <div className="sidebar-bottom">
            <button type="button" onClick={() => setDark(!dark)}>
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
            <button type="button" onClick={() => logout(true)}>
              Logout
            </button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div>
              <p className="mini-label">Student Dashboard</p>
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            </div>

            <div className="topbar-right">
              <div className="profile-chip">
                <div className="avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
                </div>
                <div>
                  <strong>{user?.name || "Student"}</strong>
                  <span>{user?.email || "No email"}</span>
                </div>
              </div>
            </div>
          </header>

          {message && <div className="message-box">{message}</div>}

          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "courses" && renderCourses()}
          {activeTab === "attendance" && renderAttendance()}
        </main>
      </div>
    );
  }

  return (
    <div className={dark ? "auth-page dark" : "auth-page"}>
      <div className="auth-shell">
        <div className="auth-left">
          <span className="eyebrow">Modern Academic Workspace</span>
          <h1>StudentHub</h1>
          <p>
            A clean and modern portal to manage attendance, courses, academic
            progress, and campus updates in one place.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-card">
              <h3>Live Attendance</h3>
              <p>Track subject-wise attendance and shortage alerts instantly.</p>
            </div>
            <div className="auth-feature-card">
              <h3>Course Dashboard</h3>
              <p>See your active courses, teachers, credits, and schedules.</p>
            </div>
            <div className="auth-feature-card">
              <h3>Smart Insights</h3>
              <p>Use academic analytics to stay ahead in every semester.</p>
            </div>
          </div>
        </div>

        <div className="auth-box">
          <div className="auth-top">
            <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setDark(!dark)}
            >
              {dark ? "Light" : "Dark"}
            </button>
          </div>

          <p className="auth-subtext">
            {mode === "login"
              ? "Login to access your smart student dashboard."
              : "Register to start using StudentHub."}
          </p>

          {message && <div className="message-box">{message}</div>}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="auth-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                required
              />

              <input
                type="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
              />

              <button type="submit" disabled={loading} className="primary-btn">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <input
                type="text"
                placeholder="Enter your full name"
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, name: e.target.value })
                }
                required
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                required
              />

              <input
                type="password"
                placeholder="Create a password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                required
              />

              <button type="submit" disabled={loading} className="primary-btn">
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}

          <button
            type="button"
            className="switch-btn"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setMessage("");
            }}
          >
            {mode === "login"
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}