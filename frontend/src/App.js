import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

function App() {
  const [data, setData] = useState({});
  const [alert, setAlert] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [district, setDistrict] = useState("Jaipur");
  const [showLogin, setShowLogin] = useState(false);
  const [role, setRole] = useState("Public");
  const [darkMode, setDarkMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/data").then(res => {
      setData(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
      addLog("Initial data sync completed.");
    });

    socket.on("updateData", updated => {
      setData(updated);
      setLastUpdated(new Date().toLocaleTimeString());
      addLog("IoT node resource update received.");
    });

    socket.on("alert", message => {
      setAlert(message);
      addLog("AI Alert: " + message);
      setTimeout(() => setAlert(""), 5000);
    });
  }, []);

  const addLog = (message) => {
    setLogs(prev => [
      { time: new Date().toLocaleTimeString(), message },
      ...prev.slice(0, 9)
    ]);
  };

  const simulateSurge = async () => {
    await axios.post("http://localhost:5000/simulate-surge");
    addLog("Emergency surge executed by Admin.");
  };

  const resetSystem = async () => {
    await axios.post("http://localhost:5000/reset");
    addLog("System reset performed.");
  };

  const simulateCyberAttack = () => {
    addLog("⚠ Suspicious data tampering attempt detected.");
    setAlert("🚨 Cyber Anomaly Detected - Node Isolated");
  };

  const theme = darkMode ? darkStyles : lightStyles;

  return (
    <div style={theme.container}>

      {/* HEADER */}
      <header style={theme.header}>
        <div>
          <h1>JeevanSetu</h1>
          <p>Smart City Emergency Intelligence Platform</p>
        </div>

        <div>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} style={theme.select}>
            <option>Jaipur</option>
            <option>Delhi</option>
            <option>Pune</option>
            <option>Ahmedabad</option>
          </select>

          <button style={theme.toggleBtn} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light Mode" : "Emergency Ops Mode"}
          </button>

          <button style={theme.loginBtn} onClick={() => setShowLogin(true)}>
            {role}
          </button>
        </div>
      </header>

      {alert && <div style={theme.alertBox}>{alert}</div>}

      {/* CYBER PANEL */}
      <div style={theme.cyberPanel}>
        <h3>🔐 Cybersecurity Monitoring</h3>
        <p>Secure API Channel: Active</p>
        <p>Node Authentication: Verified</p>
        <p>Anomaly Detection Engine: Running</p>

        {role === "Admin" && (
          <button style={theme.secondaryBtn} onClick={simulateCyberAttack}>
            Simulate Cyber Attack
          </button>
        )}
      </div>

      {/* BED SECTION */}
      <Section theme={theme} title="🏥 Bed Availability">
        <Card theme={theme} title="ICU Beds" value={data.ICU} onClick={() => setSelectedCard({ type: "ICU", value: data.ICU })} />
        <Card theme={theme} title="General Beds" value={data.General} onClick={() => setSelectedCard({ type: "General", value: data.General })} />
        <Card theme={theme} title="Pediatric Beds" value={data.Pediatric} onClick={() => setSelectedCard({ type: "Pediatric", value: data.Pediatric })} />
        <Card theme={theme} title="Maternity Beds" value={data.Maternity} onClick={() => setSelectedCard({ type: "Maternity", value: data.Maternity })} />
        <Card theme={theme} title="Isolation Beds" value={data.Isolation} onClick={() => setSelectedCard({ type: "Isolation", value: data.Isolation })} />
      </Section>

      {/* BLOOD SECTION */}
      <Section theme={theme} title="🩸 Blood Bank Status">
  <Card 
    theme={theme} 
    title="O- Units" 
    value={data?.blood?.["O-"]} 
    onClick={() => setSelectedCard({ type: "O-", value: data?.blood?.["O-"] })} 
  />
  <Card 
    theme={theme} 
    title="A+ Units" 
    value={data?.blood?.["A+"]} 
    onClick={() => setSelectedCard({ type: "A+", value: data?.blood?.["A+"] })} 
  />
  <Card 
    theme={theme} 
    title="B+ Units" 
    value={data?.blood?.["B+"]} 
    onClick={() => setSelectedCard({ type: "B+", value: data?.blood?.["B+"] })} 
  />
</Section>


      {/* ADMIN CONTROLS */}
      {role === "Admin" && (
        <div style={theme.adminPanel}>
          <button style={theme.primaryBtn} onClick={simulateSurge}>Simulate Emergency Surge</button>
          <button style={theme.secondaryBtn} onClick={resetSystem}>Reset System</button>
        </div>
      )}

      {/* CONTACT SECTION */}
      <div style={theme.contactSection}>
        <h3>📞 Emergency Contacts</h3>
        <p>Ambulance: 108</p>
        <p>District Control Room: +91 9876543210</p>
        <p>Email: control@jeevansetu.gov.in</p>
        <p>Cyber Incident Helpline: 1800-SECURE</p>
      </div>

      {/* LOG PANEL */}
      <div style={theme.logPanel}>
        <h3>📜 System Activity Log</h3>
        {logs.map((log, i) => (
          <p key={i}>[{log.time}] {log.message}</p>
        ))}
      </div>

      <footer style={theme.footer}>
        District: {district} | Last Updated: {lastUpdated}
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div style={theme.modal}>
          <div style={theme.modalContentLarge}>
            <h3>Select Role</h3>
            <button style={theme.primaryBtn} onClick={() => { setRole("Admin"); setShowLogin(false); }}>
              Login as Admin
            </button>
            <button style={theme.secondaryBtn} onClick={() => { setRole("Public"); setShowLogin(false); }}>
              Continue as Public
            </button>
          </div>
        </div>
      )}

      {selectedCard && (
        <DetailModal theme={theme} card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}

function Section({ title, children, theme }) {
  return (
    <div style={theme.section}>
      <h2>{title}</h2>
      <div style={theme.grid}>{children}</div>
    </div>
  );
}

function Card({ title, value, onClick, theme }) {
  return (
    <div style={theme.card} onClick={onClick}>
      <h4>{title}</h4>
      <p style={theme.cardValue}>{value}</p>
      <small>Click for Intelligence View</small>
    </div>
  );
}

function DetailModal({ card, onClose, theme }) {
  const maxCapacity = 10;
  const percentage = Math.max(0, (1 - card.value / maxCapacity) * 100);
  const countdown = card.value * 8;

  return (
    <div style={theme.modal}>
      <div style={theme.modalContentLarge}>
        <h2>{card.type} Resource Intelligence</h2>
        <p><strong>Availability:</strong> {card.value}</p>
        <p><strong>Depletion Forecast:</strong> {countdown} mins</p>
        <p><strong>Redistribution:</strong> {card.value <= 2 ? "Required" : "Not Required"}</p>
        <p><strong>Ambulance Routing:</strong> {card.value <= 2 ? "Redirect Recommended" : "Normal Routing"}</p>
        <p><strong>Escalation:</strong> {card.value <= 1 ? "District Authority Alert" : "Monitoring"}</p>

        <div style={theme.progressBarContainer}>
          <div
            style={{
              height: "100%",
              width: percentage + "%",
              transition: "width 0.5s ease",
              backgroundColor:
                percentage < 40
                  ? "#28a745"
                  : percentage < 70
                  ? "#ffc107"
                  : "#dc3545"
            }}
          ></div>
        </div>

        <button style={theme.primaryBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* THEMES */

const base = {
  container: { fontFamily: "Segoe UI", padding: "30px", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" },
  section: { marginBottom: "30px" },
  card: { padding: "15px", borderRadius: "8px", cursor: "pointer" },
  cardValue: { fontSize: "22px", fontWeight: "bold" },
  primaryBtn: { padding: "10px 20px", marginRight: "10px" },
  secondaryBtn: { padding: "10px 20px" },
  select: { marginRight: "10px", padding: "5px" },
  toggleBtn: { padding: "8px 15px", marginRight: "10px" },
  loginBtn: { padding: "8px 15px" },
  modal: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContentLarge: { padding: "25px", borderRadius: "8px", width: "500px" },
  progressBarContainer: { width: "100%", height: "20px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#ccc", marginBottom: "15px" },
  footer: { marginTop: "20px", fontSize: "12px" }
};

const lightStyles = {
  ...base,
  container: { ...base.container, backgroundColor: "#f4f6f9", color: "#000" },
  card: { ...base.card, backgroundColor: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
  alertBox: { backgroundColor: "#ffe6e6", padding: "10px", marginBottom: "20px" },
  cyberPanel: { backgroundColor: "#e9f2ff", padding: "15px", borderRadius: "8px", marginBottom: "20px" },
  contactSection: { backgroundColor: "white", padding: "15px", borderRadius: "8px", marginTop: "20px" },
  logPanel: { backgroundColor: "white", padding: "15px", borderRadius: "8px", marginTop: "20px" },
  modalContentLarge: { ...base.modalContentLarge, backgroundColor: "#ffffff", color: "#000000" }
};

const darkStyles = {
  ...base,
  container: { ...base.container, backgroundColor: "#121212", color: "#fff" },
  card: { ...base.card, backgroundColor: "#1e1e1e", boxShadow: "0 2px 5px rgba(255,255,255,0.1)" },
  alertBox: { backgroundColor: "#8b0000", padding: "10px", marginBottom: "20px" },
  cyberPanel: { backgroundColor: "#1c1c1c", padding: "15px", borderRadius: "8px", marginBottom: "20px" },
  contactSection: { backgroundColor: "#1e1e1e", padding: "15px", borderRadius: "8px", marginTop: "20px" },
  logPanel: { backgroundColor: "#1e1e1e", padding: "15px", borderRadius: "8px", marginTop: "20px" },
  modalContentLarge: { ...base.modalContentLarge, backgroundColor: "#000000", color: "#ffffff" }
};

export default App;











