import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { tablesApi } from "../api/tablesApi";
import type { MenuResponse } from "../api/tablesApi";
import "./Menu.css";

export default function Menu() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");
  const token = searchParams.get("token");

  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      if (!tableId || !token) {
        setError("Invalid QR code: Missing table or token");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await tablesApi.verifyQrAndGetMenu(tableId, token);
        setMenuData(data);
        setError(null);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Failed to load menu. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [tableId, token]);

  if (loading) {
    return (
      <div className="menu-container">
        <div className="loading-spinner">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <p className="error-hint">
            Please scan the QR code again or contact staff for assistance.
          </p>
        </div>
      </div>
    );
  }
  //..
  if (!menuData) {
    return null;
  }

  return (
    <div className="menu-container">
      {/* Header */}
      <div className="menu-header">
        <h1>🍽️ Smart Restaurant</h1>
        <div className="table-info">
          <p className="welcome-message">{menuData.message}</p>
          <div className="table-details">
            <span>📍 {menuData.tableInfo.location}</span>
            <span>👥 Capacity: {menuData.tableInfo.capacity}</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="menu-section">
        <h2>Menu</h2>
        <div className="menu-grid">
          {menuData.menu.map((item) => (
            <div key={item.id} className="menu-item-card">
              <div className="menu-item-image">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                />
              </div>
              <div className="menu-item-info">
                <h3>{item.name}</h3>
                <p className="menu-item-price">
                  {item.price.toLocaleString("vi-VN")} ₫
                </p>
              </div>
              <button className="order-button">Order</button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="menu-footer">
        <p>Need assistance? Please call a staff member</p>
      </div>
    </div>
  );
}
