//AdminDashboard.jsx
// Displays stats and recent cases activity 
//Lists 5 recent cases with statis and last seen info
//Allows to manage accounts and case details
//Shows stats for total tips written 


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    missingReports: 0,
    recentReports: [],
  });

  const [tipStats, setTipStats] = useState({
    totalTips: 0,
    topTippedCases: [],
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/persons", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allReports = response.data.sort(
          (a, b) => new Date(b.updated_at || b.date) - new Date(a.updated_at || a.date)
        );

        const resolved = allReports.filter((r) => r.status === "Resolved").length;
        const missing = allReports.filter((r) => r.status === "Missing").length;

        setStats({
          totalReports: allReports.length,
          resolvedReports: resolved,
          missingReports: missing,
          recentReports: allReports.slice(0, 5),
        });
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load dashboard data.");
      }
    };

    const fetchTipStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/tip-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTipStats(response.data);
      } catch (err) {
        console.error("Error fetching tip stats:", err);
      }
    };

    fetchStats();
    fetchTipStats();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the case for ${name}?`);
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/persons/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedReports = stats.recentReports.filter((r) => r.id !== id);
      setStats((prev) => ({
        ...prev,
        recentReports: updatedReports,
        totalReports: prev.totalReports - 1,
      }));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete the case.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-blue-700">Admin Dashboard</h1>

      <div className="text-right mb-6">
        <button
          onClick={() => navigate("/admin/users")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Manage Accounts
        </button>
      </div>

      {error && <p className="text-red-600 text-center mb-6">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow rounded p-6 text-center hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-gray-700">Total Reports</h2>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalReports}</p>
        </div>
        <div className="bg-white shadow rounded p-6 text-center hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-gray-700">Missing Cases</h2>
          <p className="text-4xl font-bold text-yellow-500 mt-2">{stats.missingReports}</p>
        </div>
        <div className="bg-white shadow rounded p-6 text-center hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-gray-700">Resolved Cases</h2>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.resolvedReports}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6 mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Reports</h2>
        <ul className="divide-y divide-gray-200">
          {stats.recentReports.map((report) => (
            <li key={report.id} className="py-3">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <span
                  onClick={() => navigate(`/case/${report.id}`)}
                  className="font-medium text-gray-700 text-lg hover:underline cursor-pointer"
                >
                  {report.name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm px-3 py-1 rounded-full font-semibold shadow-sm transition ${{
                      Resolved: "bg-green-100 text-green-700",
                      Missing: "bg-yellow-100 text-yellow-700",
                      "Under Investigation": "bg-blue-100 text-blue-700",
                    }[report.status]}`}
                  >
                    {report.status}
                  </span>
                  <button
                    onClick={() => handleDelete(report.id, report.name)}
                    className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500">Last Seen: {report.last_seen}</p>
              <p className="text-xs text-gray-400">
                Updated: {new Date(report.updated_at || report.date).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white shadow rounded p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🕵️ Tip Activity</h2>
        <p className="text-gray-700 mb-2">
          Total Tips Submitted:{" "}
          <span className="font-bold text-blue-600">{tipStats.totalTips}</span>
        </p>
        <ul className="space-y-2 mt-2">
          {tipStats.topTippedCases.map((t) => (
            <li key={t.id} className="text-sm text-gray-800">
              <span
                onClick={() => navigate(`/case/${t.id}`)}
                className="font-medium hover:underline cursor-pointer"
              >
                {t.name}
              </span>{" "}
              — {t.tip_count} tip(s)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
