import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
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

  /* ===== FILTER ===== */
  const [prNumber, setPrNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ===== PAGINATION ===== */
  const [page, setPage] = useState(1);
  const pageSize = 10; // ✅ 10 PR ต่อหน้า
  const [total, setTotal] = useState(0);

  /* ===== CONTROL ===== */
  const [searched, setSearched] = useState(false);
  const [searchKey, setSearchKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      prNumber,
      fromDate,
      toDate,
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    try {
      const res = await fetch(
        `http://localhost:3001/api/report/pr?${params}`
      );
      const json = await res.json();
      setData(json.data);
      setTotal(json.total);
      setExpanded({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searched) {
      loadData();
    }
  }, [page, searchKey]);


  const groupedArray = Object.values(
    data.reduce<Record<string, PRItem[]>>((acc, row) => {
      acc[row.prNumber] = acc[row.prNumber] || [];
      acc[row.prNumber].push(row);
      return acc;
    }, {})
  ).sort((a, b) => {
    return (
      new Date(b[0].pr_date).getTime() -
      new Date(a[0].pr_date).getTime()
    );
  });

  const toggle = (pr: string) => {
    setExpanded(prev => ({ ...prev, [pr]: !prev[pr] }));
  };

  const formatDate = (d: string) =>
    new Date(d.replace(" ", "T")).toLocaleDateString("th-TH");

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-warning text-white">
        <h5 className="mb-0">PR Report</h5>
      </div>

      <div className="card-body">
        {/* ===== SEARCH ===== */}
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="PR Number"
              value={prNumber}
              onChange={e => setPrNumber(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={toDate}
              min={fromDate || undefined} 
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <button
              className="btn btn-primary w-100"
              onClick={() => {
                setPage(1);
                setSearchKey(prev => prev + 1);
                setSearched(true);
              }}
            >
              Search
            </button>
          </div>
        </div>

        {loading && <div className="text-center py-4">Loading...</div>}

        {/* ===== RESULT (UI เดิม) ===== */}
        {!loading &&
          groupedArray.map(items => {
            const prNumber = items[0].prNumber;
            return (

              <div key={prNumber} className="mb-3 border rounded">
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
                  <span className="badge bg-secondary">
                    {expanded[prNumber] ? "Hide" : "Show"}
                  </span>
                </div>

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
                            <td className="text-center">
                              {row.Base_Unit_of_Measure}
                            </td>
                            <td className="text-center">{row.Plant}</td>
                            <td>{row.Name_1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        }


        {/* ===== PAGINATION ===== */}
        {searched && totalPages > 1 && (
          <ReactPaginate
            pageCount={totalPages}
            forcePage={page - 1}
            onPageChange={e => setPage(e.selected + 1)}
            containerClassName="pagination justify-content-center mt-3"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousLabel="«"
            nextLabel="»"
            previousClassName="page-item me-1"
            nextClassName="page-item ms-1"
            previousLinkClassName="page-link"
            nextLinkClassName="page-link"
            activeClassName="active"
          />
        )}
      </div>
    </div>
  );
};

export default ReportPR;
