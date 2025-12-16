import React from "react";
import QRCode from "react-qr-code";

// Dùng React.forwardRef để thư viện in ấn có thể tham chiếu tới
export const PrintableQrTemplate = React.forwardRef((props, ref) => {
  const { tableData } = props; // Dữ liệu bàn cần in

  if (!tableData) return null;

  return (
    <div
      ref={ref}
      style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}
    >
      <div
        style={{
          border: "2px solid #000",
          padding: "20px",
          display: "inline-block",
        }}
      >
        <h1>Smart Restaurant</h1>
        <h2>Bàn số: {tableData.table_number}</h2>

        <div style={{ margin: "20px auto", width: "fit-content" }}>
          <QRCode value={tableData.qr_token || ""} size={256} />
        </div>

        <p style={{ fontSize: "18px", marginTop: "20px" }}>
          Vui lòng quét mã để xem thực đơn
          <br />
          <i>Please scan to view menu</i>
        </p>
      </div>
    </div>
  );
});
