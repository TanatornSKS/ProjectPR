import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
interface PRItem {
  prNumber: string;
  pr_date: string;
  line_item: string;
  Material: string;
  Material_Description: string;
  qty: number;
  Base_Unit_of_Measure: string;
  Plant: string;
  Name_1: string;
}

const ReportPR: React.FC = () => {
  const [data, setData] = useState<PRItem[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("http://localhost:3001/api/report/pr")
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error(err));
  }, []);

  const grouped = data.reduce<Record<string, PRItem[]>>((acc, row) => {
    acc[row.prNumber] = acc[row.prNumber] || [];
    acc[row.prNumber].push(row);
    return acc;
  }, {});

  const toggle = (prNumber: string) => {
    setExpanded(prev => ({
      ...prev,
      [prNumber]: !prev[prNumber]
    }));
  };
const formatDate = (d: string) => {
  const date = new Date(d.replace(" ", "T")); // ป้องกัน UTC
  return date.toLocaleString("th-TH");
};

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-warning text-white">
        <h5 className="mb-0">PR Report</h5>
      </div>

      <div className="card-body">
        {Object.entries(grouped).map(([prNumber, items]) => (
          <div key={prNumber} className="mb-3 border rounded">
            {/* ===== PR HEADER ===== */}
            <div
              className="d-flex justify-content-between align-items-center px-3 py-2 bg-light"
              style={{ cursor: "pointer" }}
              onClick={() => toggle(prNumber)}
            >
              <div>
                <strong>PR :</strong> {prNumber}
                <span className="ms-3 text-muted">
                  <strong>Date :</strong> {formatDate(items[0].pr_date)}  
                </span>
              </div>
              <span className="badge bg-primary">
                {expanded[prNumber] ? "Hide" : "Show"}
              </span>
            </div>

            {/* ===== SUB TABLE ===== */}
            {expanded[prNumber] && (
              <div className="table-responsive">
                <table className="table table-sm table-striped mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Line</th>
                      <th>Material</th>
                      <th>Description</th>
                      <th className="text-center">Qty</th>
                      <th className="text-center">Unit</th>
                      <th className="text-center">Plant</th>
                      <th>Plant Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(row => (
                      <tr key={row.line_item}>
                        <td className="text-center">{row.line_item}</td>
                        <td>{row.Material}</td>
                        <td>{row.Material_Description}</td>
                        <td className="text-center">{row.qty}</td>
                        <td className="text-center">{row.Base_Unit_of_Measure}</td>
                        <td className="text-center">{row.Plant}</td>
                        <td>{row.Name_1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center text-muted py-5">
            No PR data found
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPR;
