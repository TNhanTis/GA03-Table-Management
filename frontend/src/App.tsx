import { useState, useEffect } from "react";
import { tablesApi } from "./api/tablesApi";
import type { Table, CreateTableData, UpdateTableData } from "./api/tablesApi";
import QRCode from "react-qr-code";
import { useToast } from "./contexts/ToastContext";
import "./App.css";

function App() {
  const [tables, setTables] = useState<Table[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("table_number");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateTableData>({
    table_number: "",
    capacity: 1,
    location: "",
    description: "",
  });

  // Load tables
  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await tablesApi.getAll({
        status: statusFilter || undefined,
        location: locationFilter || undefined,
        sortBy,
        sortOrder,
      });
      setTables(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  // Load locations
  const loadLocations = async () => {
    try {
      const data = await tablesApi.getLocations();
      setLocations(data);
    } catch (err) {
      console.error("Failed to load locations", err);
    }
  };

  useEffect(() => {
    loadTables();
    loadLocations();
  }, [statusFilter, locationFilter, sortBy, sortOrder]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tablesApi.create(formData);
      setShowCreateModal(false);
      setFormData({
        table_number: "",
        capacity: 1,
        location: "",
        description: "",
      });
      loadTables();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create table");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    try {
      await tablesApi.update(selectedTable.id, formData);
      setShowEditModal(false);
      setSelectedTable(null);
      setFormData({
        table_number: "",
        capacity: 1,
        location: "",
        description: "",
      });
      loadTables();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update table");
    }
  };

  const handleToggleStatus = async (table: Table) => {
    const newStatus = table.status === "active" ? "inactive" : "active";
    try {
      await tablesApi.updateStatus(table.id, newStatus);
      loadTables();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) return;

    try {
      await tablesApi.delete(id);
      loadTables();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete table");
    }
  };

  const openEditModal = (table: Table) => {
    setSelectedTable(table);
    setFormData({
      table_number: table.table_number,
      capacity: table.capacity,
      location: table.location || "",
      description: table.description || "",
    });
    setShowEditModal(true);
  };

  const handleGenerateQr = async (tableId: string) => {
    // Confirm bằng custom modal (sẽ làm ở bước 7)
    if (!window.confirm("Tạo mã QR cho bàn này?")) return; // Tạm dùng native
    try {
      const result = await tablesApi.generateQr(tableId);
      toast.success(`Tạo QR thành công! URL: ${result.qrUrl}`); // ✅ Toast
      loadTables();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate QR"); // ✅ Toast
    }
  };
  const handleRegenerateQr = async (tableId: string, tableNumber: string) => {
    if (
      !window.confirm(
        `⚠️ Tạo lại QR cho "${tableNumber}" sẽ vô hiệu hóa QR cũ. Tiếp tục?`
      )
    )
      return;

    try {
      await tablesApi.regenerateQr(tableId);
      toast.success("Đã tạo QR mới! QR cũ đã vô hiệu."); // ✅ Toast
      loadTables();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to regenerate QR"); // ✅ Toast
    }
  };
  const handleDownloadPdf = async (tableId: string, tableNumber: string) => {
    try {
      const blob = await tablesApi.downloadPdf(tableId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-${tableNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download thành công!"); // ✅ Toast
    } catch (err: any) {
      toast.error("Failed to download PDF"); // ✅ Toast
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🍽️ Table Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Add New Table
        </button>
      </header>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Location:</label>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="table_number">Table Number</option>
            <option value="capacity">Capacity</option>
            <option value="created_at">Date Created</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Order:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="loading">Loading tables...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="tables-grid">
          {tables.map((table) => (
            <div key={table.id} className="table-card">
              <div className="table-header">
                <h3>{table.table_number}</h3>
                <span className={`status-badge ${table.status}`}>
                  {table.status}
                </span>
              </div>
              <div className="table-body">
                <p>
                  <strong>Capacity:</strong> {table.capacity} seats
                </p>
                {table.location && (
                  <p>
                    <strong>Location:</strong> {table.location}
                  </p>
                )}
                {table.description && (
                  <p>
                    <strong>Description:</strong> {table.description}
                  </p>
                )}
                {/* QR Code Section - RIÊNG BIỆT, KHÔNG NẰM TRONG block description */}
                {table.qr_token ? (
                  <div className="qr-section">
                    <QRCode
                      value={`http://localhost:5173/menu?table=${table.id}&token=${table.qr_token}`}
                      size={120}
                      level="H"
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                    />
                    <small
                      style={{
                        display: "block",
                        marginTop: "8px",
                        color: "#666",
                      }}
                    >
                      Created:{" "}
                      {table.qr_token_created_at
                        ? new Date(
                          table.qr_token_created_at
                        ).toLocaleDateString()
                        : "N/A"}
                    </small>
                  </div>
                ) : (
                  <div className="qr-section">
                    <p style={{ color: "#999" }}>No QR Code</p>
                  </div>
                )}
              </div>
              <div className="table-actions">
                {/* ━━━ QR BUTTONS ━━━ */}
                {table.qr_token ? (
                  // Nếu ĐÃ CÓ QR → Hiện nút Regenerate & Download
                  <>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() =>
                        handleRegenerateQr(table.id, table.table_number)
                      }
                      title="Tạo lại QR Code"
                    >
                      🔄 Regenerate QR
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() =>
                        handleDownloadPdf(table.id, table.table_number)
                      }
                      title="Download PDF"
                    >
                      📥 Download PDF
                    </button>
                  </>
                ) : (
                  // Nếu CHƯA CÓ QR → Hiện nút Generate
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleGenerateQr(table.id)}
                    title="Tạo QR Code mới"
                  >
                    ➕ Generate QR
                  </button>
                )}

                {/* ━━━ EXISTING BUTTONS ━━━ */}
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => openEditModal(table)}
                >
                  ✏️ Edit
                </button>
                <button
                  className={`btn btn-sm ${table.status === "active" ? "btn-warning" : "btn-success"
                    }`}
                  onClick={() => handleToggleStatus(table)}
                >
                  {table.status === "active" ? "⏸️ Deactivate" : "▶️ Activate"}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(table.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tables.length === 0 && !loading && !error && (
        <div className="empty-state">
          <p>No tables found. Create your first table!</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Table</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Table Number *</label>
                <input
                  type="text"
                  required
                  value={formData.table_number}
                  onChange={(e) =>
                    setFormData({ ...formData, table_number: e.target.value })
                  }
                  placeholder="e.g., T01"
                />
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Indoor, Outdoor"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTable && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Table</h2>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label>Table Number *</label>
                <input
                  type="text"
                  required
                  value={formData.table_number}
                  onChange={(e) =>
                    setFormData({ ...formData, table_number: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
